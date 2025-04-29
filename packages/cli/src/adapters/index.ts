import NeonAdapter from "./neon/neonAdapter.ts";
import type { NeonAdapterOptions } from "./neon/types.ts";
import type { AdapterOptions, AdapterType, DatabaseAdapter } from "./types.ts";

/**
 * Create a database adapter based on the specified type
 */
export function createAdapter(type: AdapterType, options: AdapterOptions): DatabaseAdapter {
    switch (type) {
        case "neon":
            return new NeonAdapter(options as NeonAdapterOptions);

        default:
            throw new Error(`Unsupported adapter type: ${type}`);
    }
}
