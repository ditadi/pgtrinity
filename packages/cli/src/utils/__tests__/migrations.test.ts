import { describe, it, expect } from "vitest";
import { runMigrations } from "../migrations.ts";
import { TestUtils } from "../../__tests__/test-utils.ts";
import postgres from "postgres";

describe("migrations - Integration", () => {
    describe("runMigrations", () => {
        it("should skip when no modules provided", async () => {
            // This test doesn't need real connection
            await runMigrations("postgresql://fake", []);
            // Should complete without error
        });

        it("should throw error for unknown module", async () => {
            await expect(runMigrations("postgresql://fake", ["unknown"])).rejects.toThrow("Unknown module: unknown");
        });

        it("should run cache migrations on real database", async () => {
            const connectionString = await TestUtils.getTestConnectionString();
            if (!connectionString) {
                console.log("⏭️  Skipping migration test - no connection available");
                return;
            }

            await runMigrations(connectionString, ["cache"]);
            
            // Verify table was created by querying it
            const sql = postgres(connectionString, { onnotice: () => {} });
            
            try {
                // Check table exists and has expected structure
                const result = await sql`
                    SELECT column_name, data_type, is_nullable
                    FROM information_schema.columns 
                    WHERE table_name = 'pgtrinity_cache_entries'
                    ORDER BY ordinal_position;
                `;

                expect(result).toHaveLength(6); // id, key, value, created_at, key_hash, byte_size
                
                const columns = result.map(r => r.column_name);
                expect(columns).toEqual(['id', 'key', 'value', 'created_at', 'key_hash', 'byte_size']);

                // Check indexes exist
                const indexes = await sql`
                    SELECT indexname 
                    FROM pg_indexes 
                    WHERE tablename = 'pgtrinity_cache_entries';
                `;
                
                const indexNames = indexes.map(i => i.indexname);
                expect(indexNames).toContain('idx_pgtrinity_cache_key_hash');
                expect(indexNames).toContain('idx_pgtrinity_cache_byte_size');
                expect(indexNames).toContain('idx_pgtrinity_cache_key_hash_byte_size');
                expect(indexNames).toContain('idx_pgtrinity_cache_id_created_at');
                
            } finally {
                await sql.end();
            }
        }, 30000);

        it("should handle invalid connection string", async () => {
            await expect(
                runMigrations("postgresql://invalid:invalid@invalid/invalid", ["cache"])
            ).rejects.toThrow();
        });

        it("should be idempotent - run twice without error", async () => {
            const connectionString = await TestUtils.getTestConnectionString();
            if (!connectionString) {
                console.log("⏭️  Skipping migration test - no connection available");
                return;
            }

            // Run migrations twice
            await runMigrations(connectionString, ["cache"]);
            await runMigrations(connectionString, ["cache"]);
            
            // Should not throw error on second run due to DROP TABLE IF EXISTS
        }, 30000);
    });
});