export const cacheMigration = `
-- PGTrinity Cache Table
-- Based on solid_cache schema but adapted for PostgreSQL and PGTrinity needs

-- Drop table if exists (for re-runs)
DROP TABLE IF EXISTS pgtrinity_cache_entries CASCADE;

-- Create cache entries table
CREATE TABLE pgtrinity_cache_entries (
    id BIGSERIAL PRIMARY KEY,
    key BYTEA NOT NULL,
    value BYTEA NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    key_hash BIGINT NOT NULL,
    byte_size INTEGER NOT NULL
);

-- Create indexes for performance
-- Primary lookup index (unique constraint on key_hash)
CREATE UNIQUE INDEX idx_pgtrinity_cache_key_hash ON pgtrinity_cache_entries (key_hash);

-- Index for size-based eviction queries
CREATE INDEX idx_pgtrinity_cache_byte_size ON pgtrinity_cache_entries (byte_size);

-- Composite index for size and hash-based operations
CREATE INDEX idx_pgtrinity_cache_key_hash_byte_size ON pgtrinity_cache_entries (key_hash, byte_size);

-- Index for time-based eviction (using id as proxy for created_at order)
CREATE INDEX idx_pgtrinity_cache_id_created_at ON pgtrinity_cache_entries (id, created_at);
`;
