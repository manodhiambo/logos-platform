-- Quick fix for posts table
ALTER TABLE posts RENAME COLUMN user_id TO author_id;
ALTER TABLE posts ADD COLUMN IF NOT EXISTS attachments JSONB;
ALTER TABLE posts RENAME COLUMN like_count TO likes_count;
ALTER TABLE posts RENAME COLUMN comment_count TO comments_count;
ALTER TABLE posts ADD COLUMN IF NOT EXISTS post_type VARCHAR(50) DEFAULT 'discussion';
ALTER TABLE posts ADD COLUMN IF NOT EXISTS is_pinned BOOLEAN DEFAULT FALSE;

-- Fix indexes
DROP INDEX IF EXISTS idx_posts_user;
CREATE INDEX IF NOT EXISTS idx_posts_author ON posts(author_id);
