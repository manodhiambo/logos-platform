-- 011-create-prayers-table.sql
CREATE TABLE IF NOT EXISTS prayers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    prayer_request_id UUID REFERENCES prayer_requests(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    category VARCHAR(50) NOT NULL,
    privacy_level VARCHAR(20) DEFAULT 'public',
    status VARCHAR(20) DEFAULT 'active',
    prayer_count INTEGER DEFAULT 0,
    is_answered BOOLEAN DEFAULT FALSE,
    answered_at TIMESTAMP NULL,
    testimony_text TEXT NULL,
    expires_at TIMESTAMP NULL,
    message TEXT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

