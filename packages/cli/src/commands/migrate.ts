import inquirer from "inquirer";
import type { Ora } from "ora";
import { createAdapter } from "../adapters/index.ts";
import type { NeonAdapterOptions } from "../adapters/neon/types.ts";

/**
 * Handle migration for Neon adapter
 */
export async function handleNeonMigrate(
    options: NeonAdapterOptions,
    requestedModules: string[],
    spinner: Ora,
) {
    try {
        const apiKey = options.apiKey || process.env.NEON_API_KEY;
        const projectId = options.projectId || process.env.NEON_PROJECT_ID;
        const connectionString =
            options.connectionString || process.env.PGTRINITY_CONNECTION_STRING;

        if (!apiKey || !projectId || !connectionString) {
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
                {
                    type: "input",
                    name: "connectionString",
                    message: "Enter your Neon connection string:",
                    when: !connectionString,
                    validate: (input) => (input ? true : "Connection string is required"),
                },
            ]);

            if (answers.apiKey) options.apiKey = answers.apiKey;
            if (answers.projectId) options.projectId = answers.projectId;
            if (answers.connectionString) options.connectionString = answers.connectionString;

            spinner.start("Initializing PGTrinity migration...");

            const adapterApiKey = options.apiKey || apiKey;
            const adapterProjectId = options.projectId || projectId;
            const adapterConnectionString =
                options.connectionString || (connectionString as string);

            const adapter = createAdapter("neon", {
                apiKey: adapterApiKey,
                projectId: adapterProjectId,
                branchName: options.branchName,
                force: options.force,
                connectionString: adapterConnectionString,
            });

            spinner.text = "Running migrations...";

            await adapter.runMigrations(adapterConnectionString, requestedModules);
        }
    } catch (error) {
        console.log("error", error);
    }
}
