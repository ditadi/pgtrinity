/**
 * Parse and validate module input string
 * @param modulesInput - Comma-separated string of modules
 * @param validModules - Array of valid module names
 * @returns Array of validated module names
 * @throws Error if no valid modules or invalid modules are provided
 */
export function parseAndValidateModules(modulesInput: string, validModules: string[]): string[] {
    const modulesArray = modulesInput
        .split(",")
        .map((m) => m.trim())
        .filter(Boolean);

    // Check if any modules were specified
    if (modulesArray.length === 0) {
        throw new Error(
            `No valid modules specified. Please specify at least one module: ${validModules.join(", ")}`,
        );
    }

    // Validate each module
    for (const module of modulesArray) {
        if (!validModules.includes(module)) {
            throw new Error(
                `Invalid module "${module}". Allowed modules: ${validModules.join(", ")}`,
            );
        }
    }

    return modulesArray;
}
