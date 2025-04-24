import { createNeonAdapter } from "./neon/neonAdapter.ts";
import type { NeonAdapterOptions } from "./neon/types.ts";
import type { AdapterOptions, AdapterType, DatabaseAdapter } from "./types.ts";

/**
 * Constructs and returns a database adapter for the specified adapter type.
 *
 * @param type - The type of adapter to create.
 * @param options - Optional configuration for the adapter.
 * @returns A database adapter instance for the given {@link type}.
 *
 * @throws {Error} If {@link type} is not a supported adapter type.
 */
export function createAdapter(
    type: AdapterType,
    options: Partial<AdapterOptions> = {},
): DatabaseAdapter {
    switch (type) {
        case "neon":
            return createNeonAdapter(options as NeonAdapterOptions);

        default:
            throw new Error(`Unsupported adapter type: ${type}`);
    }
}
