import type { Command } from "commander";
import { createAdapter } from "../adapters/index.ts";
import { SUPPORTED_ADAPTERS, VALID_MODULES } from "../cli.ts";
import { infoLog, successLog, warningLog } from "../utils/log.ts";
import { parseAndValidateModules } from "../utils/modules.ts";
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
        `Modules to initialize (${VALID_MODULES.join(",")})`,
        VALID_MODULES.join(","),
      )
      .option("-c, --connection-string <string>", "PostgreSQL connection string")
      .option("-k, --api-key <key>", "API Key (for neon)")
      .option("-p, --project-id <id>", "Project ID (for neon)")
      .option("-b, --branch-name <name>", "Branch name for PGTrinity (for neon)", "pgtrinity")
      .action((options) =>
        new InitCommand().run(options, "Initializing PGTrinity configuration..."),
      );
  }

  protected async execute(options: CommandOptions): Promise<void> {
    let connectionString: string;
    const adapter = createAdapter(options.adapter, options);

    // Check if connection string is provided via CLI options
    if (options.connectionString) {
      this.spinner.text = "Using provided connection string...";
      connectionString = options.connectionString;
    } else {
      // Create resources using adapter
      if (!adapter.validateOptions()) {
        this.spinner?.stop();
        await adapter.promptForMissingOptions();

        // Re-validate after prompting for missing options
        if (!adapter.validateOptions()) {
          this.spinner.fail("Missing required configuration");
          throw new Error("Required configuration is still missing after prompting");
        }

        this.spinner?.start("Creating resources...");
      }

      this.spinner.text = `Creating resources using ${options.adapter} adapter...`;
      const resourceResult = await adapter.createResources();

      if (!resourceResult.success || !resourceResult.data) {
        this.spinner.fail("Failed to create resources");
        throw new Error(resourceResult.error?.message || "Failed to get connection string");
      }

      connectionString = resourceResult.data;
    }

    this.spinner.text = "Running migrations...";
    
    let modulesArray: string[];
    try {
      modulesArray = parseAndValidateModules(options.modules, VALID_MODULES);
    } catch (error) {
      this.spinner.fail(error instanceof Error ? error.message : "Module validation failed");
      throw error;
    }

    const migrationResult = await adapter.createMigrations(connectionString, modulesArray);

    if (!migrationResult.success) {
      this.spinner.fail("Failed to run migrations");
      throw new Error(migrationResult.error?.message);
    }

    this.spinner.succeed("PGTrinity configured successfully");

    successLog(`\nConnection string: ${connectionString}`);
    infoLog(connectionString);
    warningLog("\nAdd to your .env with the name PGTRINITY_CONNECTION_STRING");
  }
}
