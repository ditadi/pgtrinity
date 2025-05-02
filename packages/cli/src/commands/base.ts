import type { Command } from "commander";
import type { Ora } from "ora";
import ora from "ora";
import type { AdapterType } from "../adapters/types.ts";
import { SUPPORTED_ADAPTERS, VALID_MODULES } from "../cli.ts";
import { errorLog } from "../utils/log.ts";
import { validateAdapter, validateModules } from "../utils/validators.ts";

export interface CommandOptions {
    adapter: AdapterType;
    modules: string;
    apiKey?: string;
    projectId?: string;
    branchName?: string;
    connectionString?: string;
    force?: boolean;
    [key: string]: string | boolean | undefined;
}

export abstract class BaseCommand {
    protected spinner: Ora;

    constructor() {
        this.spinner = ora();
    }

    static register(_: Command): void {
        throw new Error("Method 'register' must be implemented by subclass");
    }

    protected abstract execute(options: CommandOptions): Promise<void>;
    protected async run(options: CommandOptions, spinnerText: string): Promise<void> {
        this.spinner.start(spinnerText);
        try {
            if (!validateAdapter(options.adapter, SUPPORTED_ADAPTERS, this.spinner)) {
                this.spinner.fail("Invalid adapter");
                errorLog(
                    `\nError: Invalid adapter "${options.adapter}". Supported adapters are: ${SUPPORTED_ADAPTERS.join(", ")}`,
                );
                process.exit(1);
            }

            const { valid, modules } = validateModules(
                options.modules,
                VALID_MODULES,
                this.spinner,
            );
            if (!valid) {
                this.spinner.fail("Invalid modules");
                errorLog(
                    `\nError: Invalid modules "${options.modules}". Supported modules are: ${VALID_MODULES.join(", ")}`,
                );
                process.exit(1);
            }

            await this.execute({ ...options, modules: modules.join(",") });
        } catch (error) {
            this.spinner.fail("Failed to execute command");
            errorLog(`\nError: ${error instanceof Error ? error.message : String(error)}`);
            process.exit(1);
        }
    }
}
