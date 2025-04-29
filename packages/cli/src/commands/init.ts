import type { Command } from "commander";
import { createAdapter } from "../adapters/index.ts";
import { SUPPORTED_ADAPTERS } from "../cli.ts";
import { infoLog, successLog, warningLog } from "../utils/log.ts";
import { BaseCommand, type CommandOptions } from "./base.ts";

export class InitCommand extends BaseCommand {
    static register(program: Command): void {
        program
            .command("init")
            .description("Initialize PGTrinity configuration")
            .option(
                "-a, --adapter <adapter>",
                `Database adapter to use (${SUPPORTED_ADAPTERS.join(", ")})`,
                "neon",
            )
            .option("-f, --force", "Force recreation if resources exist")
            .option(
                "-m, --modules <modules>",
                "Modules to initialize (cache,realtime,queue)",
                "cache,realtime,queue",
            )
            .option("-c, --connection <string>", "PostgreSQL connection string")
            .option("-k, --api-key <key>", "API Key (for neon)")
            .option("-p, --project-id <id>", "Project ID (for neon)")
            .option("-b, --branch-name <name>", "Branch name for PGTrinity (for neon)", "pgtrinity")
            .action((options) =>
                new InitCommand().run(options, "Initializing PGTrinity configuration..."),
            );
    }

    protected async execute(options: CommandOptions): Promise<void> {
        const adapter = createAdapter(options.adapter, options);

        if (!adapter.validateOptions()) {
            this.spinner?.stop();
            await adapter.promptForMissingOptions();
            this.spinner?.start("Creating resources...");
        }

        this.spinner.text = `Creating resources using ${options.adapter} adapter...`;
        const connectionString = await adapter.createResources();

        if (!connectionString) {
            throw new Error("Failed to get connection string");
        }

        this.spinner.text = "Running migrations...";
        const modulesArray = options.modules.split(",");
        const migrationResult = await adapter.createMigrations(connectionString, modulesArray);

        if (!migrationResult.success) {
            throw new Error(migrationResult.error?.message);
        }

        this.spinner.succeed("PGTrinity initialized successfully");

        successLog("\nConnection string for PGTrinity:");
        infoLog(connectionString);
        warningLog("\nAdd to your .env with the name PGTRINITY_CONNECTION_STRING");
    }
}
