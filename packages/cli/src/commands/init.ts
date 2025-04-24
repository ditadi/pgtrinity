import inquirer from "inquirer";
import type { Ora } from "ora";
import { createAdapter } from "../adapters/index.ts";
import type { NeonAdapterOptions } from "../adapters/neon/types.ts";
import { infoLog, successLog, warningLog } from "../utils/log.ts";

/**
 * Handle initialization for Neon adapter
 */
export async function handleNeonInit(
    options: Partial<NeonAdapterOptions>,
    requestedModules: string[],
    spinner: Ora,
) {
    const apiKey = options.apiKey || process.env.NEON_API_KEY;
    const projectId = options.projectId || process.env.NEON_PROJECT_ID;

    if (!apiKey || !projectId) {
        spinner.stop();

        const answers = await inquirer.prompt([
            {
                type: "input",
                name: "apiKey",
                message: "Enter your Neon API Key:",
                when: !apiKey,
                validate: (input) => (input ? true : "API Key is required"),
            },
            {
                type: "input",
                name: "projectId",
                message: "Enter your Neon Project ID:",
                when: !projectId,
                validate: (input) => (input ? true : "Project ID is required"),
            },
        ]);

        if (answers.apiKey) options.apiKey = answers.apiKey;
        if (answers.projectId) options.projectId = answers.projectId;

        spinner.start("Initializing PGTrinity configuration...");
    }

    spinner.text = `Creating branch using ${options.adapter} adapter...`;

    const adapterApiKey = options.apiKey || apiKey;
    const adapterProjectId = options.projectId || projectId;

    const adapter = createAdapter("neon", {
        apiKey: adapterApiKey,
        projectId: adapterProjectId,
        branchName: options.branchName,
        force: options.force,
    });

    const connectionString = await adapter.run(options.branchName);
    spinner.text = "Running migrations...";

    await adapter.runMigrations(connectionString, requestedModules);

    spinner.succeed("PGTrinity initialized successfully");
    successLog("\nConnection string for PGTrinity:");
    infoLog(connectionString);
    warningLog("\nAdd to your .env with the name PGTRINITY_CONNECTION_STRING");
}
