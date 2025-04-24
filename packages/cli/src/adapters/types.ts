import type { NeonAdapterOptions } from "./neon/types.ts";
/**
 * Common interface for all database adapters
 */
export interface DatabaseAdapter {
    run(branchName: string): Promise<string>;
    runMigrations(connectionString: string, modules?: string[]): Promise<void>;
    runCheck(connectionString: string): Promise<DatabaseCheckResult>;
}

/**
 * Result of database check operation
 */
export interface DatabaseCheckResult {
    connection: boolean;
    tablesExist: boolean;
    version?: string;
    missingTables?: string[];
    installedModules?: string[];
}

/**
 * Supported database adapters
 */
export type AdapterType = "neon";

export interface BaseAdapterOptions {
    connectionString: string;
}

export type AdapterOptions = NeonAdapterOptions;

/**
 * Generic result type for operations that can succeed or fail
 */
export interface Result<T = void> {
    success: boolean;
    data?: T;
    error?: Error;
}
