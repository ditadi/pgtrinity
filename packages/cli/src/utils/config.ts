import { existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import * as dotenv from "dotenv";

export function loadEnv() {
    const possiblePaths = [
        join(process.cwd(), ".env"), // Current working directory
        join(dirname(dirname(dirname(fileURLToPath(import.meta.url)))), "../..", ".env"), // From dist location to repo root
    ];

    for (const envPath of possiblePaths) {
        if (existsSync(envPath)) {
            const result = dotenv.config({ path: envPath });
            if (!result.error) {
                break;
            }
        }
    }
}

export function getEnvValue(key: string, fallbackValue?: string): string | undefined {
    return process.env[key] ?? fallbackValue;
}
