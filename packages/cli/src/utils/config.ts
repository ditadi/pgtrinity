import * as dotenv from "dotenv";

export function loadEnv() {
    dotenv.config();
}

export function getEnvValue(key: string, fallbackValue?: string): string | undefined {
    return process.env[key] ?? fallbackValue;
}
