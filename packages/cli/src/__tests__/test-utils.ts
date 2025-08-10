import { getEnvValue } from "../utils/config.ts";
import NeonAdapter from "../adapters/neon/neonAdapter.ts";
import type { NeonAdapterOptions } from "../adapters/neon/types.ts";
import { config } from "dotenv";
import { join } from "node:path";

// Load env for tests - explicitly point to project root .env
config({ path: join(process.cwd(), "../..", ".env") });

/**
 * Shared test utilities for integration testing
 */
export class TestUtils {
    /**
     * Get real Neon credentials from env vars
     * Skip tests if credentials are not available
     */
    static getNeonCredentials(): NeonAdapterOptions | null {
        const apiKey = getEnvValue("NEON_API_KEY");
        const projectId = getEnvValue("NEON_PROJECT_ID");

        if (!apiKey || !projectId) {
            return null;
        }

        return {
            apiKey,
            projectId,
            branchName: "pgtrinity-test",
            force: true, // Always force recreate for tests
        };
    }

    /**
     * Create a real Neon adapter for testing
     */
    static createTestNeonAdapter(): NeonAdapter | null {
        const credentials = this.getNeonCredentials();
        if (!credentials) return null;
        
        return new NeonAdapter(credentials);
    }

    /**
     * Get or create a test database connection string
     * This will create real Neon resources for testing
     */
    static async getTestConnectionString(): Promise<string | null> {
        const adapter = this.createTestNeonAdapter();
        if (!adapter) return null;

        try {
            const result = await adapter.createResources();
            return result.success ? result.data! : null;
        } catch (error) {
            console.error("Failed to create test resources:", error);
            return null;
        }
    }

    /**
     * Skip test if no real credentials available
     */
    static skipIfNoCredentials(testFn: () => void): void {
        const credentials = this.getNeonCredentials();
        if (!credentials) {
            console.log("⏭️  Skipping integration test - NEON_API_KEY or NEON_PROJECT_ID not set");
            return;
        }
        testFn();
    }

    /**
     * Clean up test resources
     */
    static async cleanupTestResources(): Promise<void> {
        const adapter = this.createTestNeonAdapter();
        if (!adapter) return;

        try {
            // Force cleanup will delete the test branch
            await adapter.createResources();
        } catch (error) {
            // Cleanup failures are not critical for tests
            console.warn("Test cleanup failed:", error);
        }
    }
}