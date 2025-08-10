import type { BaseAdapter } from "./base.ts";
import NeonAdapter from "./neon/neonAdapter.ts";
import type { NeonAdapterOptions } from "./neon/types.ts";
import type { AdapterOptions, AdapterType } from "./types.ts";

/**
 * Create a database adapter based on the specified type
 */
export function createAdapter(type: AdapterType, options: AdapterOptions): BaseAdapter {
    switch (type) {
        case "neon":
            return new NeonAdapter(options as NeonAdapterOptions);

        default:
            throw new Error(`Unsupported adapter type: ${type}`);
    }
}
