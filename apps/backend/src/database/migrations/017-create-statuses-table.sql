-- Create statuses table (stories - expire after 24 hours)
CREATE TABLE IF NOT EXISTS statuses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  content TEXT,
  media_url VARCHAR(1000),
  media_type VARCHAR(10) CHECK (media_type IN ('image', 'video')),
  background_color VARCHAR(20) DEFAULT '#667eea',
  text_color VARCHAR(20) DEFAULT '#ffffff',
  views_count INTEGER NOT NULL DEFAULT 0,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT (NOW() + INTERVAL '24 hours'),
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Index for efficient feed queries (active, non-expired)
CREATE INDEX IF NOT EXISTS idx_statuses_active_expires ON statuses (is_active, expires_at);
CREATE INDEX IF NOT EXISTS idx_statuses_user_id ON statuses (user_id);
CREATE INDEX IF NOT EXISTS idx_statuses_created_at ON statuses (created_at DESC);
