import postgres from "postgres";
import { successLog } from "./log.ts";
import { cacheMigration } from "../migrations/cache.ts";

/**
 * Run migrations for specified modules
 */
export async function runMigrations(connectionString: string, modules: string[]): Promise<void> {
    if (modules.length === 0) return;

    const sql = postgres(connectionString, {
        onnotice: () => {}, // Suppress PostgreSQL notices
    });

    try {
        for (const module of modules) {
            await runModuleMigration(sql, module);
        }
    } finally {
        await sql.end();
    }
}

/**
 * Run migration for a specific module
 */
async function runModuleMigration(sql: any, module: string): Promise<void> {
    const migrationSql = getMigrationSql(module);

    // Execute each statement separately for better error handling
    const statements = migrationSql.split(";").filter((stmt) => stmt.trim());

    for (const statement of statements) {
        if (statement.trim()) {
            await sql.unsafe(statement);
        }
    }

    successLog(`✓ ${module.charAt(0).toUpperCase() + module.slice(1)} tables created`);
}

/**
 * Get migration SQL for a module
 */
function getMigrationSql(module: string): string {
    switch (module) {
        case "cache":
            return cacheMigration;
        default:
            throw new Error(`Unknown module: ${module}`);
    }
}
