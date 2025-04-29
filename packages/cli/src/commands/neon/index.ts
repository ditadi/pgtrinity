import type { Ora } from "ora";
import type { NeonAdapterOptions } from "../../adapters/neon/types";
import { errorLog } from "../../utils/log";

export async function handleSetupNeon(
    options: NeonAdapterOptions,
    requestedModules: string[],
    spinner: Ora,
) { }
