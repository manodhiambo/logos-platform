-- ============================================
-- COMPREHENSIVE SCHEMA FIX FOR LOGOS PLATFORM
-- ============================================

-- 1. FIX POSTS TABLE
-- ------------------

-- Rename user_id to author_id
DO $$ 
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'posts' AND column_name = 'user_id'
    ) THEN
        ALTER TABLE posts RENAME COLUMN user_id TO author_id;
    END IF;
END $$;

-- Add attachments column
ALTER TABLE posts ADD COLUMN IF NOT EXISTS attachments JSONB;

-- Rename like_count to likes_count
DO $$ 
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'posts' AND column_name = 'like_count'
    ) THEN
        ALTER TABLE posts RENAME COLUMN like_count TO likes_count;
    END IF;
END $$;

-- Rename comment_count to comments_count
DO $$ 
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'posts' AND column_name = 'comment_count'
    ) THEN
        ALTER TABLE posts RENAME COLUMN comment_count TO comments_count;
    END IF;
END $$;

-- Add post_type if missing
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'posts' AND column_name = 'post_type'
    ) THEN
        ALTER TABLE posts ADD COLUMN post_type VARCHAR(50) DEFAULT 'discussion';
    END IF;
END $$;

-- Add is_pinned if missing
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'posts' AND column_name = 'is_pinned'
    ) THEN
        ALTER TABLE posts ADD COLUMN is_pinned BOOLEAN DEFAULT FALSE;
    END IF;
END $$;

-- 2. VERIFY USERS TABLE HAS CORRECT COLUMNS
-- -----------------------------------------
-- (The users table should already have full_name and avatar_url with underscored naming)

-- 3. UPDATE INDEXES
-- -----------------

-- Drop old indexes if they exist
DROP INDEX IF EXISTS idx_posts_user;

-- Create new indexes with correct column names
CREATE INDEX IF NOT EXISTS idx_posts_author ON posts(author_id);
CREATE INDEX IF NOT EXISTS idx_posts_community ON posts(community_id);
CREATE INDEX IF NOT EXISTS idx_posts_created ON posts(created_at DESC);

-- ============================================
-- END OF MIGRATION
-- ============================================
