#!/usr/bin/env node

import { Command } from "commander";
import { InitCommand } from "./commands/init.ts";

export const SUPPORTED_ADAPTERS = ["neon"];
export const VALID_MODULES = ["cache", "realtime", "queue"];

const program = new Command();

program.name("pgtrinity").description("CLI for PGTrinity configuration").version("0.1.0");
InitCommand.register(program);

// program
//     .command("init")
//     .description("Initialize PGTrinity configuration")
//     .option(
//         "-a, --adapter <adapter>",
//         `Database adapter to use (${SUPPORTED_ADAPTERS.join(", ")})`,
//         "neon",
//     )
//     .option("-k, --api-key <key>", "Neon API Key (only for neon adapter)")
//     .option("-p, --project-id <id>", "Neon project ID (only for neon adapter)")
//     .option(
//         "-b, --branch-name <n>",
//         "Branch name for PGTrinity (only for neon adapter)",
//         "pgtrinity",
//     )
//     .option("-f, --force", "Force recreation of branch if it exists (only for neon adapter)")
//     .option(
//         "-m, --modules <modules>",
//         "Modules to initialize (cache,realtime,queue)",
//         "cache,realtime,queue",
//     )
//     .action(async (options) => {
//         const spinner = ora("Initializing PGTrinity configuration...").start();
//         try {
//             if (!validateAdapter(options.adapter, SUPPORTED_ADAPTERS, spinner)) {
//                 spinner.fail("Invalid adapter specified.");
//                 process.exit(1);
//             }
//
//             const { valid, modules } = validateModules(options.modules, VALID_MODULES, spinner);
//
//             if (!valid) {
//                 spinner.fail("Invalid modules requested.");
//                 return;
//             }
//
//             if (options.adapter === "neon") {
//                 await handleNeonInit(options, modules, spinner);
//             } else {
//                 spinner.fail(`Adapter ${options.adapter} is supported but not implemented yet`);
//                 process.exit(1);
//             }
//         } catch (error) {
//             spinner.fail("Failed to initialize PGTrinity configuration");
//             errorLog(`\nError: ${error instanceof Error ? error.message : String(error)}`);
//             process.exit(1);
//         }
//     });
//
// program
//     .command("migrate")
//     .description("Run PGTrinity migrations")
//     .option("-c, --connection <string>", "PostgreSQL/Neon connection string")
//     .option(
//         "-a, --adapter <adapter>",
//         `Database adapter to use (${SUPPORTED_ADAPTERS.join(", ")})`,
//         "neon",
//     )
//     .option(
//         "-m, --modules <modules>",
//         "Modules to migrate (cache,realtime,queue)",
//         "cache,realtime,queue",
//     )
//     .action(async (options) => {
//         const spinner = ora("Preparing migrations...").start();
//
//         try {
//             const connectionString = options.connection || process.env.PGTRINITY_CONNECTION_STRING;
//
//             if (!connectionString) {
//                 spinner.fail("Connection string not provided");
//                 warningLog("\nUse:");
//                 plainLog("  - Option --connection");
//                 plainLog("  - Environment variable PGTRINITY_CONNECTION_STRING");
//                 process.exit(1);
//             }
//
//             if (!validateAdapter(options.adapter, SUPPORTED_ADAPTERS, spinner)) {
//                 spinner.fail(`Unsupported adapter: ${options.adapter}`);
//                 errorLog(`Supported adapters: ${SUPPORTED_ADAPTERS.join(", ")}`);
//                 process.exit(1);
//             }
//
//             const { valid, modules } = validateModules(options.modules, VALID_MODULES, spinner);
//
//             if (!valid) {
//                 spinner.fail("Invalid modules requested.");
//                 return;
//             }
//
//             if (options.adapter === "neon") {
//                 await handleNeonMigrate(options, modules, spinner);
//             } else {
//                 spinner.fail(`Adapter ${options.adapter} is supported but not implemented yet`);
//                 process.exit(1);
//             }
//
//             spinner.succeed("Migrations completed successfully");
//         } catch (error) {
//             spinner.fail("Failed to run migrations");
//             errorLog(`\nError: ${error instanceof Error ? error.message : String(error)}`);
//             process.exit(1);
//         }
//     });

program.parse();
