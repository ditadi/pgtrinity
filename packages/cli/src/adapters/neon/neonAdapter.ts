import { successLog, warningLog } from "../../utils/log.ts";
import type { DatabaseAdapter, DatabaseCheckResult, Result } from "../types.ts";
import type {
    NeonAPIBranch,
    NeonAPIBranchCheckResult,
    NeonAPIConnection,
    NeonAPIDatabase,
    NeonAPIListBranchesResult,
    NeonAPIOperation,
    NeonAPIRole,
    NeonAdapterOptions,
} from "./types";

export default class NeonAdapter implements DatabaseAdapter {
    private readonly NEON_API_URL = "https://console.neon.tech/api/v2";
    private headers: Record<string, string>;
    private apiKey: string;
    private projectId: string;
    private force: boolean;

    constructor(apiKey: string, projectId: string, force: boolean) {
        this.apiKey = apiKey;
        this.projectId = projectId;
        this.force = force;
        this.headers = this.createAPIHeaders();
    }

    /**
     * Run the main logic of the adapter
     */
    async run(branchName: string): Promise<string> {
        const branchResult = await this.checkExistingBranch(branchName);

        if (!branchResult.success || !branchResult.data) {
            throw new Error(`Failed to check existing branch: ${branchResult.error}`);
        }

        const { existingBranch, primaryBranchId } = branchResult.data;
        let branchId: string | undefined;

        if (existingBranch) {
            const handleResult = await this.handleExistingBranch(existingBranch);
            if (!handleResult.success) {
                throw handleResult.error || new Error("Failed to handle existing branch");
            }
            branchId = handleResult.data;
        }

        if (!branchId) {
            const createResult = await this.createBranch(branchName, primaryBranchId);
            if (!createResult.success || !createResult.data) {
                throw createResult.error || new Error("Failed to create branch");
            }
            branchId = createResult.data;
        }

        const connResult = await this.getConnectionString(branchId);

        if (!connResult.success || !connResult.data) {
            throw connResult.error || new Error("Failed to get connection string");
        }

        return connResult.data;
    }

    async runMigrations(connectionString: string, modules?: string[]): Promise<void> {}

    async runCheck(connectionString: string): Promise<DatabaseCheckResult> {
        return {} as DatabaseCheckResult;
    }

    /**
     * Get connection string for the branch
     */
    private async getConnectionString(branchId: string): Promise<Result<string>> {
        warningLog("Getting database and role information");

        const dbResult = await this.fetchNeonAPI<{ databases: NeonAPIDatabase[] }>(
            `/projects/${this.projectId}/branches/${branchId}/databases`,
            {
                method: "GET",
            },
        );

        if (!dbResult.success || !dbResult.data) {
            return {
                success: false,
                error: dbResult.error || new Error("Failed to fetch databases"),
            };
        }

        if (!dbResult.data.databases || dbResult.data.databases.length === 0) {
            return {
                success: false,
                error: new Error("No databases found"),
            };
        }

        const defaultDB = dbResult.data.databases[0]?.name;
        const roleResult = await this.fetchNeonAPI<{ roles: NeonAPIRole[] }>(
            `/projects/${this.projectId}/branches/${branchId}/roles`,
            { method: "GET" },
        );

        if (!roleResult.success || !roleResult.data) {
            return {
                success: false,
                error: roleResult.error || new Error("Failed to fetch roles"),
            };
        }

        if (!roleResult.data.roles || roleResult.data.roles.length === 0) {
            return {
                success: false,
                error: new Error("No roles found"),
            };
        }

        const defaultRole = roleResult.data.roles[0]?.name;

        warningLog("Getting connection string...");
        const connResult = await this.fetchNeonAPI<NeonAPIConnection>(
            `/projects/${this.projectId}/connection_uri?branch_id=${branchId}&database_name=${defaultDB}&role_name=${defaultRole}`,
            { method: "GET" },
        );

        if (!connResult.success || !connResult.data) {
            return {
                success: false,
                error: connResult.error || new Error("Failed to fetch connection string"),
            };
        }

        if (!connResult.data.uri) {
            return {
                success: false,
                error: new Error("No connection string found"),
            };
        }

        return {
            success: true,
            data: connResult.data.uri,
        };
    }

    /**
     * Create a new branch for pgtrinity
     */
    private async createBranch(branchName: string, primaryBranchId: string) {
        warningLog(`Creating new branch ${branchName}...`);

        const result = await this.fetchNeonAPI<{ branch: NeonAPIBranch }>(
            `/projects/${this.projectId}/branches`,
            {
                method: "POST",
                body: JSON.stringify({
                    branch: {
                        name: branchName,
                        parent_id: primaryBranchId,
                    },
                    endpoints: [
                        {
                            type: "read_write",
                        },
                    ],
                }),
            },
        );
        if (!result.success || !result.data) {
            return {
                success: false,
                error: result.error || new Error("Failed to create branch"),
            };
        }

        const { branch } = result.data;
        successLog(`Branch ${branch.name} created successfully.`);

        if (branch.operations && branch.operations.length > 0) {
            warningLog("Waiting for operations to complete...");
            for (const operation of branch.operations) {
                const opResult = await this.waitForOperation(operation.id);
                if (!opResult.success) {
                    return {
                        success: false,
                        error: opResult.error || new Error(`Operation ${operation.id} failed`),
                    };
                }
            }
        }

        return { success: true, data: branch.id };
    }

    /**
     * Wait for operation to complete
     */
    private async waitForOperation(operationId: string): Promise<Result<void>> {
        let isCompleted = false;
        let attempts = 0;
        let delay = 1000;
        const maxAttempts = 30;

        while (!isCompleted && attempts < maxAttempts) {
            attempts++;

            const result = await this.fetchNeonAPI<NeonAPIOperation>(
                `/projects/${this.projectId}/operations/${operationId}`,
                { method: "GET" },
            );

            if (!result.success || !result.data) {
                return {
                    success: false,
                    error: result.error || new Error("Failed to check operation status"),
                };
            }

            const { status } = result.data;

            if (status === "completed") {
                isCompleted = true;
                successLog(`Operation ${operationId} completed successfully.`);
            } else if (status === "failed") {
                return {
                    success: false,
                    error: new Error(`Operation ${operationId} failed`),
                };
            } else {
                process.stdout.write(".");
                delay = Math.min(delay * 2, 16000);
                await new Promise((resolve) => setTimeout(resolve, delay));
            }
        }

        if (!isCompleted) {
            return {
                success: false,
                error: new Error(`Operation ${operationId} timed out`),
            };
        }

        return { success: true };
    }

    /**
     * Check if branch already exists and get the primary branch id
     */
    private async checkExistingBranch(
        branchName: string,
    ): Promise<Result<NeonAPIBranchCheckResult>> {
        warningLog("Checking for existing branches...");

        const result = await this.fetchNeonAPI<NeonAPIListBranchesResult>(
            `/projects/${this.projectId}/branches`,
            { method: "GET" },
        );
        if (!result.success || !result.data) {
            return {
                success: false,
                error: result.error || new Error("Failed to fetch branches"),
            };
        }

        const primaryBranch = result.data.branches.find((b) => b.primary === true);

        if (!primaryBranch) {
            return {
                success: false,
                error: new Error("No primary branch found"),
            };
        }

        const existingBranch = result.data.branches.find((b) => b.name === branchName);
        return {
            success: true,
            data: {
                existingBranch,
                primaryBranchId: primaryBranch.id,
            },
        };
    }

    /**
     * Handle existing branch - delete if force=true or return Id
     */
    private async handleExistingBranch(
        existingBranch: NeonAPIBranch,
    ): Promise<Result<string | undefined>> {
        warningLog(`Branch ${existingBranch.name} already exists.`);

        if (this.force) {
            warningLog("Force flag enabled. Deleting existing branch...");

            const deleteResult = await this.fetchNeonAPI(
                `/projects/${this.projectId}/branches/${existingBranch.id}`,
                { method: "DELETE" },
            );

            if (!deleteResult.success) {
                return {
                    success: false,
                    error: deleteResult.error || new Error("Failed to delete existing branch"),
                };
            }

            successLog("Existing branch deleted successfully.");
            return { success: true, data: undefined };
        }

        return {
            success: true,
            data: existingBranch.id,
        };
    }

    /**
     * Fetch Neon API with Headers and Security verifications
     */
    private async fetchNeonAPI<T>(
        endpoint: string,
        options: RequestInit & { body?: string },
    ): Promise<Result<T>> {
        try {
            const response = await fetch(`${this.NEON_API_URL}${endpoint}`, {
                ...options,
                redirect: "manual",
                headers: this.headers,
            });

            if (response.status >= 300 && response.status < 400) {
                return {
                    success: false,
                    error: new Error(
                        `Redirect detected: ${response.headers.get("Location")}. Aborting.`,
                    ),
                };
            }

            if (!response.ok) {
                const errorText = await response.text();
                return {
                    success: false,
                    error: new Error(`API Error ${response.status}: ${errorText}`),
                };
            }

            const data = await response.json();

            return { success: true, data };
        } catch (err) {
            return {
                success: false,
                error: err instanceof Error ? err : new Error(String(err)),
            };
        }
    }

    /**
     * Create API Headers for Neon API requests
     */
    private createAPIHeaders(): Record<string, string> {
        return {
            Accept: "application/json",
            "Content-Type": "application/json",
            Authorization: `Bearer ${this.apiKey}`,
        };
    }
}

export function createNeonAdapter(options: Partial<NeonAdapterOptions>): NeonAdapter {
    if (!options.apiKey || !options.projectId) {
        throw new Error("API Key and Project ID are required");
    }

    return new NeonAdapter(options.apiKey, options.projectId, options.force || false);
}
