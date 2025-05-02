import type { AdapterOptions, Result } from "./types.ts";

export abstract class BaseAdapter {
    protected options: AdapterOptions;

    constructor(options: AdapterOptions) {
        this.options = options;
    }

    abstract validateOptions(): boolean;
    abstract promptForMissingOptions(): Promise<void>;
    abstract createResources(): Promise<string>;
    abstract createMigrations(connectionString: string, modules: string[]): Promise<Result>;
    abstract checkResources(connectionString: string): Promise<Result>;
}
