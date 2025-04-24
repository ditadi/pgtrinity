import type { Ora } from "ora";
import { errorLog } from "./log.ts";

/**
 * Validates if the provided adapter is supported.
 */
export function validateAdapter(
    adapter: string,
    supportedAdapters: string[],
    spinner: Ora,
): boolean {
    if (!supportedAdapters.includes(adapter)) {
        spinner.fail(`Unsupported adapter: ${adapter}`);
        errorLog(`Supported adapters: ${supportedAdapters.join(", ")}`);
        return false;
    }
    return true;
}

/**
 * Validates and normalizes the requested modules.
 */
export function validateModules(
    modulesInput: string,
    validModules: string[],
    spinner: Ora,
): string[] {
    const requestedModules = modulesInput.split(",").map((m) => m.trim().toLowerCase());

    const invalidModules = requestedModules.filter((m) => !validModules.includes(m));

    if (invalidModules.length > 0) {
        spinner.fail(`Invalid modules: ${invalidModules.join(", ")}`);
        errorLog(`Valid modules: ${validModules.join(", ")}`);
        return [];
    }

    return requestedModules;
}
