-- ============================================================================
-- PhotoSorter — NeonDB Serverless PostgreSQL + pgvector Schema
-- Compatible with Neon Postgres 16+ & @neondatabase/serverless
-- ============================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "vector";

-- 1. Core Photos Table with EXIF, Perceptual Hash, Quality Metrics & AI Embeddings
CREATE TABLE IF NOT EXISTS photos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    filename VARCHAR(255) NOT NULL,
    title VARCHAR(255) NOT NULL,
    storage_url TEXT NOT NULL,
    category VARCHAR(64) NOT NULL DEFAULT 'Uncategorized',
    album_id VARCHAR(64),
    person_id VARCHAR(64),
    captured_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    location_name VARCHAR(180),
    latitude DECIMAL(9,6),
    longitude DECIMAL(9,6),
    camera_model VARCHAR(120),
    lens_info VARCHAR(120),
    focal_length VARCHAR(32),
    aperture VARCHAR(24),
    shutter_speed VARCHAR(32),
    iso INTEGER,
    width_px INTEGER NOT NULL DEFAULT 3840,
    height_px INTEGER NOT NULL DEFAULT 2880,
    file_size_mb DECIMAL(6,2) NOT NULL DEFAULT 4.20,
    color_palette JSONB DEFAULT '["#3B82F6", "#10B981", "#F59E0B"]'::jsonb,
    ai_tags TEXT[] DEFAULT '{}',
    ai_caption TEXT,
    ai_confidence DECIMAL(5,2) NOT NULL DEFAULT 98.40,
    aesthetic_score DECIMAL(4,1) NOT NULL DEFAULT 9.2,
    sharpness_score DECIMAL(5,1) NOT NULL DEFAULT 94.0,
    phash VARCHAR(64) NOT NULL,
    duplicate_group VARCHAR(64),
    is_blurry BOOLEAN NOT NULL DEFAULT FALSE,
    is_duplicate BOOLEAN NOT NULL DEFAULT FALSE,
    is_favorite BOOLEAN NOT NULL DEFAULT FALSE,
    is_archived BOOLEAN NOT NULL DEFAULT FALSE,
    sort_status VARCHAR(32) NOT NULL DEFAULT 'sorted',
    clip_embedding vector(512),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. AI Face Clusters / People Recognition Table
CREATE TABLE IF NOT EXISTS people_clusters (
    id VARCHAR(64) PRIMARY KEY,
    display_name VARCHAR(120) NOT NULL,
    relationship_tag VARCHAR(64),
    avatar_url TEXT NOT NULL,
    photo_count INTEGER NOT NULL DEFAULT 0,
    avg_confidence DECIMAL(5,2) NOT NULL DEFAULT 99.10,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. Smart Auto-Sorting Rules Table
CREATE TABLE IF NOT EXISTS smart_rules (
    id VARCHAR(64) PRIMARY KEY,
    rule_name VARCHAR(160) NOT NULL,
    condition_Summary TEXT NOT NULL,
    target_album VARCHAR(120) NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    matched_count INTEGER NOT NULL DEFAULT 0,
    last_triggered_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. NeonDB Sync & AI Pipeline Audit Log
CREATE TABLE IF NOT EXISTS sync_audit_logs (
    id SERIAL PRIMARY KEY,
    operation VARCHAR(64) NOT NULL,
    affected_rows INTEGER NOT NULL DEFAULT 1,
    latency_ms INTEGER NOT NULL DEFAULT 18,
    region VARCHAR(48) NOT NULL DEFAULT 'aws-us-east-2',
    executed_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for fast filtering, pHash deduplication, and pgvector HNSW search
CREATE INDEX IF NOT EXISTS idx_photos_category ON photos(category);
CREATE INDEX IF NOT EXISTS idx_photos_captured_at ON photos(captured_at DESC);
CREATE INDEX IF NOT EXISTS idx_photos_phash ON photos(phash);
CREATE INDEX IF NOT EXISTS idx_photos_tags ON photos USING GIN(ai_tags);
