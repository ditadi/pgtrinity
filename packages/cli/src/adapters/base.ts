import type { AdapterOptions } from "./types.ts";

export abstract class BaseAdapter {
    protected options: AdapterOptions;

    constructor(options: AdapterOptions) {
        this.options = options;
    }

    abstract validateOptions(): Promise<boolean>;
    abstract promptForMissingOptions(): Promise<void>;
    abstract createResources(): Promise<string>;
    abstract createMigrations(connectionString: string, modules: string[]): Promise<void>;
    abstract checkResources(connectionString: string): Promise<void>;
}
