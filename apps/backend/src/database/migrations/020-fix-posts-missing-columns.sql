-- Add missing columns to posts table

-- Add is_deleted column (used by post.service.ts in WHERE clause)
ALTER TABLE posts ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN DEFAULT FALSE;

-- Add share_count if missing (column name normalised in migration 013)
ALTER TABLE posts ADD COLUMN IF NOT EXISTS share_count INTEGER DEFAULT 0;

-- Add visibility if missing
ALTER TABLE posts ADD COLUMN IF NOT EXISTS visibility VARCHAR(20) DEFAULT 'public';

-- Ensure media_urls exists and is the right type
-- It was created as JSONB in migration 003; keep it as JSONB
ALTER TABLE posts ADD COLUMN IF NOT EXISTS media_urls JSONB DEFAULT '[]';

-- Create index on is_deleted for faster filtered queries
CREATE INDEX IF NOT EXISTS idx_posts_is_deleted ON posts(is_deleted);
CREATE INDEX IF NOT EXISTS idx_posts_author ON posts(author_id);
