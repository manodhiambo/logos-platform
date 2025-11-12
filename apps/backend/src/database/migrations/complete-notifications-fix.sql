-- Add ALL missing columns to notifications table
ALTER TABLE notifications ADD COLUMN IF NOT EXISTS related_id UUID;
ALTER TABLE notifications ADD COLUMN IF NOT EXISTS related_type VARCHAR(255);
ALTER TABLE notifications ADD COLUMN IF NOT EXISTS action_url VARCHAR(500);
ALTER TABLE notifications ADD COLUMN IF NOT EXISTS read_at TIMESTAMP;
ALTER TABLE notifications ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_notifications_related ON notifications(related_id);
CREATE INDEX IF NOT EXISTS idx_notifications_type ON notifications(type);
