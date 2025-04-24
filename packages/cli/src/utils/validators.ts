import type { Ora } from "ora";
import { errorLog } from "./log.ts";

/**
 * Checks whether the specified adapter is included in the list of supported adapters.
 *
 * If the adapter is not supported, triggers a spinner failure and logs the list of supported adapters.
 *
 * @param adapter - The adapter name to validate.
 * @param supportedAdapters - List of supported adapter names.
 * @returns `true` if the adapter is supported; otherwise, `false`.
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
 * Validates a comma-separated list of requested modules against a list of valid modules.
 *
 * Splits and normalizes the input string, checks for invalid or missing modules, and returns the validation result along with the list of valid requested modules.
 *
 * @param modulesInput - Comma-separated string of requested module names.
 * @param validModules - List of valid module names.
 * @returns An object containing a boolean indicating validity and an array of normalized valid module names.
 */
export function validateModules(
    modulesInput: string,
    validModules: string[],
    spinner: Ora,
): { valid: boolean; modules: string[] } {
    if (!modulesInput.trim()) {
        spinner.fail("No modules requested.");
        errorLog(`Valid modules: ${validModules.join(", ")}`);
        return { valid: false, modules: [] };
    }
    const requestedModules = modulesInput.split(",").map((m) => m.trim().toLowerCase());

    const invalidModules = requestedModules.filter((m) => !validModules.includes(m));

    if (invalidModules.length > 0) {
        spinner.fail(`Invalid modules: ${invalidModules.join(", ")}`);
        errorLog(`Valid modules: ${validModules.join(", ")}`);
        return { valid: false, modules: [] };
    }

    return { valid: true, modules: requestedModules };
}
