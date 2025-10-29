-- Prayer requests table
CREATE TABLE IF NOT EXISTS prayer_requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    community_id UUID REFERENCES communities(id) ON DELETE SET NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    category VARCHAR(50) NOT NULL,
    privacy VARCHAR(20) DEFAULT 'public' CHECK (privacy IN ('public', 'private', 'anonymous')),
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'answered', 'closed')),
    prayer_count INTEGER DEFAULT 0,
    is_urgent BOOLEAN DEFAULT FALSE,
    answered_at TIMESTAMP,
    answer_description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Prayer responses table
CREATE TABLE IF NOT EXISTS prayer_responses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    prayer_request_id UUID NOT NULL REFERENCES prayer_requests(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    message TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- User prayers (tracking who prayed)
CREATE TABLE IF NOT EXISTS user_prayers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    prayer_request_id UUID NOT NULL REFERENCES prayer_requests(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    prayed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(prayer_request_id, user_id)
);

-- Indexes
CREATE INDEX idx_prayers_user ON prayer_requests(user_id);
CREATE INDEX idx_prayers_community ON prayer_requests(community_id);
CREATE INDEX idx_prayers_status ON prayer_requests(status);
CREATE INDEX idx_prayer_responses_prayer ON prayer_responses(prayer_request_id);
