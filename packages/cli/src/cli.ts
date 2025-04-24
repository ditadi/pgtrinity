#!/usr/bin/env node

import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { Command } from "commander";
import * as dotenv from "dotenv";
import ora from "ora";
import { handleNeonInit } from "./commands/init.ts";
import { errorLog } from "./utils/log.ts";
import { validateAdapter, validateModules } from "./utils/validators.ts";

const SUPPORTED_ADAPTERS = ["neon"];
const VALID_MODULES = ["cache", "realtime", "queue"];

function loadEnv() {
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = dirname(__filename);
    const rootDir = dirname(__dirname);

    dotenv.config({ path: join(rootDir, ".env") });
}

loadEnv();

const program = new Command();

program.name("pgtrinity").description("CLI for PGTrinity configuration").version("0.1.0");

program
    .command("init")
    .description("Initialize PGTrinity configuration")
    .option(
        "-a, --adapter <adapter>",
        `Database adapter to use (${SUPPORTED_ADAPTERS.join(", ")})`,
        "neon",
    )
    .option("-k, --api-key <key>", "Neon API Key (only for neon adapter)")
    .option("-p, --project-id <id>", "Neon project ID (only for neon adapter)")
    .option(
        "-b, --branch-name <n>",
        "Branch name for PGTrinity (only for neon adapter)",
        "pgtrinity-branch",
    )
    .option("-f, --force", "Force recreation of branch if it exists (only for neon adapter)")
    .option("-c, --connection <string>", "PostgreSQL connection string (only for postgres adapter)")
    .option(
        "-m, --modules <modules>",
        "Modules to initialize (cache,realtime,queue)",
        "cache,realtime,queue",
    )
    .action(async (options) => {
        const spinner = ora("Initializing PGTrinity configuration...").start();
        try {
            validateAdapter(options.adapter, SUPPORTED_ADAPTERS, spinner);
            const requestedModules = validateModules(options.modules, VALID_MODULES, spinner);

            if (options.adapter === "neon") {
                await handleNeonInit(options, requestedModules, spinner);
            }
        } catch (error) {
            spinner.fail("Failed to initialize PGTrinity configuration");
            errorLog(`\nError: ${error instanceof Error ? error.message : String(error)}`);
            process.exit(1);
        }
    });

program.parse();
