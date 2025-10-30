-- 012-add-attachments-to-posts.sql
ALTER TABLE posts
ADD COLUMN IF NOT EXISTS attachments JSONB;
