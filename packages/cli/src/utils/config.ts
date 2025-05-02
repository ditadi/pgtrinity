import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import * as dotenv from "dotenv";

export function loadEnv() {
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = dirname(__filename);
    const rootDir = dirname(dirname(__dirname));

    dotenv.config({ path: join(rootDir, ".env") });
}

export function getEnvValue(key: string, fallbackValue?: string): string | undefined {
    return process.env[key] || fallbackValue;
}
