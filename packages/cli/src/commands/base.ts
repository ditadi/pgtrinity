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
    [key: string]: string | boolean;
}

export abstract class BaseCommand {
    protected spinner: Ora;

    static register(_: Command): void {
        throw new Error("Method 'register' must be implemented by subclass");
    }

    protected abstract execute(options: CommandOptions): Promise<void>;

    protected async run(options: CommandOptions, spinnerText: string): Promise<void> {
        this.spinner = ora(spinnerText).start();

        try {
            if (!validateAdapter(options.adapter, SUPPORTED_ADAPTERS, this.spinner)) {
                this.spinner.fail("Invalid adapter specified.");
                process.exit(1);
            }

            const { valid, modules } = validateModules(
                options.modules,
                VALID_MODULES,
                this.spinner,
            );

            if (!valid) {
                this.spinner.fail("Invalid modules requested.");
                return;
            }

            await this.execute({ ...options, modules: modules.join(",") });
        } catch (error) {
            this.spinner.fail("Operation failed");
            errorLog(`\nError: ${error instanceof Error ? error.message : String(error)}`);
            process.exit(1);
        }
    }
}
