import type { BaseAdapterOptions } from "../types.ts";

/**
 * Neon Adapter Configuration
 */
export interface NeonAdapterOptions extends BaseAdapterOptions {
    apiKey?: string;
    projectId?: string;
    branchName?: string;
    force?: boolean;
}

/**
 * Neon API branch information
 */
export interface NeonAPIBranch {
    id: string;
    name: string;
    primary: boolean;
    operations?: Array<{ id: string; action: string }>;
}

/**
 * Neon API database information
 */
export interface NeonAPIDatabase {
    name: string;
}

/**
 * Neon API role information
 */
export interface NeonAPIRole {
    name: string;
}

/**
 * Neon API operation information
 */
export interface NeonAPIOperation {
    id: string;
    status: string;
    action: string;
}

/**
 * Neon API connection information
 */
export interface NeonAPIConnection {
    uri: string;
}

/**
 * Result of Neon API branch check operation
 */
export interface NeonAPIBranchCheckResult {
    existingBranch?: NeonAPIBranch;
    primaryBranchId: string;
}

/**
 * Result of Neon API list branches operation
 */
export interface NeonAPIListBranchesResult {
    branches: NeonAPIBranch[];
}
