-- Fix posts table schema to match Sequelize model

-- Rename user_id to author_id if it exists
DO $$ 
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'posts' AND column_name = 'user_id'
    ) THEN
        ALTER TABLE posts RENAME COLUMN user_id TO author_id;
    END IF;
END $$;

-- Add attachments column if it doesn't exist
ALTER TABLE posts ADD COLUMN IF NOT EXISTS attachments JSONB;

-- Rename columns to match Sequelize underscored naming
DO $$ 
BEGIN
    -- Rename like_count to likes_count
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'posts' AND column_name = 'like_count'
    ) THEN
        ALTER TABLE posts RENAME COLUMN like_count TO likes_count;
    END IF;
    
    -- Rename comment_count to comments_count
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'posts' AND column_name = 'comment_count'
    ) THEN
        ALTER TABLE posts RENAME COLUMN comment_count TO comments_count;
    END IF;
    
    -- Add post_type if missing
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'posts' AND column_name = 'post_type'
    ) THEN
        ALTER TABLE posts ADD COLUMN post_type VARCHAR(50) DEFAULT 'discussion';
    END IF;
END $$;
