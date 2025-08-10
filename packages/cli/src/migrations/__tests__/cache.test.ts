import { describe, it, expect } from "vitest";
import { TestUtils } from "../../__tests__/test-utils.ts";
import { runMigrations } from "../../utils/migrations.ts";
import postgres from "postgres";
import crypto from "node:crypto";

describe("Cache Migration Integration", () => {
    describe("Table Structure", () => {
        it("should create pgtrinity_cache_entries table with correct schema", async () => {
            const connectionString = await TestUtils.getTestConnectionString();
            if (!connectionString) {
                console.log("⏭️  Skipping cache migration test - no connection available");
                return;
            }

            await runMigrations(connectionString, ["cache"]);
            const sql = postgres(connectionString, { onnotice: () => {} });

            try {
                // Test table exists and has correct columns
                const columns = await sql`
                    SELECT column_name, data_type, is_nullable, column_default
                    FROM information_schema.columns 
                    WHERE table_name = 'pgtrinity_cache_entries'
                    ORDER BY ordinal_position;
                `;

                expect(columns).toHaveLength(6);
                
                const expectedColumns = [
                    { column_name: 'id', data_type: 'bigint', is_nullable: 'NO' },
                    { column_name: 'key', data_type: 'bytea', is_nullable: 'NO' },
                    { column_name: 'value', data_type: 'bytea', is_nullable: 'NO' },
                    { column_name: 'created_at', data_type: 'timestamp with time zone', is_nullable: 'NO' },
                    { column_name: 'key_hash', data_type: 'bigint', is_nullable: 'NO' },
                    { column_name: 'byte_size', data_type: 'integer', is_nullable: 'NO' }
                ];

                expectedColumns.forEach((expected, index) => {
                    expect(columns[index].column_name).toBe(expected.column_name);
                    expect(columns[index].data_type).toBe(expected.data_type);
                    expect(columns[index].is_nullable).toBe(expected.is_nullable);
                });

                // Test primary key
                const primaryKey = await sql`
                    SELECT constraint_name 
                    FROM information_schema.table_constraints 
                    WHERE table_name = 'pgtrinity_cache_entries' 
                    AND constraint_type = 'PRIMARY KEY';
                `;

                expect(primaryKey).toHaveLength(1);

            } finally {
                await sql.end();
            }
        }, 30000);

        it("should create all required indexes", async () => {
            const connectionString = await TestUtils.getTestConnectionString();
            if (!connectionString) {
                console.log("⏭️  Skipping cache migration test - no connection available");
                return;
            }

            await runMigrations(connectionString, ["cache"]);
            const sql = postgres(connectionString, { onnotice: () => {} });

            try {
                const indexes = await sql`
                    SELECT indexname, indexdef
                    FROM pg_indexes 
                    WHERE tablename = 'pgtrinity_cache_entries'
                    AND schemaname = 'public';
                `;

                const indexNames = indexes.map(i => i.indexname);
                const expectedIndexes = [
                    'pgtrinity_cache_entries_pkey', // Primary key
                    'idx_pgtrinity_cache_key_hash',
                    'idx_pgtrinity_cache_byte_size', 
                    'idx_pgtrinity_cache_key_hash_byte_size',
                    'idx_pgtrinity_cache_id_created_at'
                ];

                expectedIndexes.forEach(expectedIndex => {
                    expect(indexNames).toContain(expectedIndex);
                });

                // Check unique constraint on key_hash
                const uniqueIndex = indexes.find(i => i.indexname === 'idx_pgtrinity_cache_key_hash');
                expect(uniqueIndex?.indexdef).toContain('UNIQUE');

            } finally {
                await sql.end();
            }
        }, 30000);
    });

    describe("Cache Operations", () => {
        it("should support basic cache operations", async () => {
            const connectionString = await TestUtils.getTestConnectionString();
            if (!connectionString) {
                console.log("⏭️  Skipping cache operations test - no connection available");
                return;
            }

            await runMigrations(connectionString, ["cache"]);
            const sql = postgres(connectionString, { onnotice: () => {} });

            try {
                // Insert cache entry (simulating solid_cache pattern)
                const key = "test:key:123";
                const value = JSON.stringify({ data: "test value", timestamp: Date.now() });
                const keyHash = crypto.createHash('sha256').update(key).digest();
                const keyHashBigInt = keyHash.readBigInt64BE(0);
                const byteSize = Buffer.byteLength(key) + Buffer.byteLength(value) + 140; // Overhead estimate

                await sql`
                    INSERT INTO pgtrinity_cache_entries (key, value, key_hash, byte_size)
                    VALUES (${Buffer.from(key)}, ${Buffer.from(value)}, ${keyHashBigInt}, ${byteSize})
                `;

                // Read back the entry
                const result = await sql`
                    SELECT key, value, key_hash, byte_size, created_at
                    FROM pgtrinity_cache_entries 
                    WHERE key_hash = ${keyHashBigInt}
                `;

                expect(result).toHaveLength(1);
                expect(result[0].key.toString()).toBe(key);
                expect(result[0].value.toString()).toBe(value);
                expect(BigInt(result[0].key_hash)).toBe(keyHashBigInt);
                expect(result[0].byte_size).toBe(byteSize);
                expect(result[0].created_at).toBeInstanceOf(Date);

            } finally {
                await sql.end();
            }
        }, 30000);

        it("should support upsert operations via unique constraint", async () => {
            const connectionString = await TestUtils.getTestConnectionString();
            if (!connectionString) {
                console.log("⏭️  Skipping upsert test - no connection available");
                return;
            }

            await runMigrations(connectionString, ["cache"]);
            const sql = postgres(connectionString, { onnotice: () => {} });

            try {
                const key = "upsert:test";
                const keyHash = crypto.createHash('sha256').update(key).digest().readBigInt64BE(0);
                
                // Insert first value
                const value1 = "first value";
                const byteSize1 = Buffer.byteLength(key) + Buffer.byteLength(value1) + 140;

                await sql`
                    INSERT INTO pgtrinity_cache_entries (key, value, key_hash, byte_size)
                    VALUES (${Buffer.from(key)}, ${Buffer.from(value1)}, ${keyHash}, ${byteSize1})
                    ON CONFLICT (key_hash) 
                    DO UPDATE SET 
                        key = EXCLUDED.key,
                        value = EXCLUDED.value,
                        byte_size = EXCLUDED.byte_size
                `;

                // Update with second value
                const value2 = "updated value";
                const byteSize2 = Buffer.byteLength(key) + Buffer.byteLength(value2) + 140;

                await sql`
                    INSERT INTO pgtrinity_cache_entries (key, value, key_hash, byte_size)
                    VALUES (${Buffer.from(key)}, ${Buffer.from(value2)}, ${keyHash}, ${byteSize2})
                    ON CONFLICT (key_hash) 
                    DO UPDATE SET 
                        key = EXCLUDED.key,
                        value = EXCLUDED.value,
                        byte_size = EXCLUDED.byte_size
                `;

                // Should only have one row with updated value
                const result = await sql`
                    SELECT value FROM pgtrinity_cache_entries WHERE key_hash = ${keyHash}
                `;

                expect(result).toHaveLength(1);
                expect(result[0].value.toString()).toBe(value2);

            } finally {
                await sql.end();
            }
        }, 30000);
    });

    describe("Migration Idempotency", () => {
        it("should handle multiple migration runs without errors", async () => {
            const connectionString = await TestUtils.getTestConnectionString();
            if (!connectionString) {
                console.log("⏭️  Skipping idempotency test - no connection available");
                return;
            }

            // Run migration multiple times
            await runMigrations(connectionString, ["cache"]);
            await runMigrations(connectionString, ["cache"]);
            await runMigrations(connectionString, ["cache"]);

            // Should not throw errors and table should exist
            const sql = postgres(connectionString, { onnotice: () => {} });

            try {
                const result = await sql`
                    SELECT table_name FROM information_schema.tables 
                    WHERE table_name = 'pgtrinity_cache_entries';
                `;

                expect(result).toHaveLength(1);
            } finally {
                await sql.end();
            }
        }, 30000);
    });
});