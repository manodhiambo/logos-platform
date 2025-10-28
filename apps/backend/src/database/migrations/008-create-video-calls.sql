-- Video Calls Table
CREATE TABLE IF NOT EXISTS video_calls (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    channel_name VARCHAR(255) NOT NULL UNIQUE,
    host_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type VARCHAR(20) NOT NULL DEFAULT 'group' CHECK (type IN ('one_on_one', 'group')),
    purpose VARCHAR(50) NOT NULL DEFAULT 'general' CHECK (purpose IN ('prayer', 'bible_study', 'counseling', 'community', 'mentorship', 'general')),
    status VARCHAR(20) NOT NULL DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'ongoing', 'ended', 'cancelled')),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    scheduled_at TIMESTAMP,
    started_at TIMESTAMP,
    ended_at TIMESTAMP,
    max_participants INTEGER NOT NULL DEFAULT 50,
    is_recording BOOLEAN DEFAULT FALSE,
    recording_url VARCHAR(500),
    related_to UUID,
    related_type VARCHAR(50),
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Call Participants Table
CREATE TABLE IF NOT EXISTS call_participants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    call_id UUID NOT NULL REFERENCES video_calls(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role VARCHAR(20) NOT NULL DEFAULT 'participant' CHECK (role IN ('host', 'co_host', 'participant')),
    joined_at TIMESTAMP,
    left_at TIMESTAMP,
    duration INTEGER,
    is_muted BOOLEAN DEFAULT FALSE,
    is_video_off BOOLEAN DEFAULT FALSE,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(call_id, user_id)
);

-- Indexes
CREATE INDEX idx_video_calls_host ON video_calls(host_id);
CREATE INDEX idx_video_calls_status ON video_calls(status);
CREATE INDEX idx_video_calls_scheduled ON video_calls(scheduled_at);
CREATE INDEX idx_video_calls_related ON video_calls(related_to, related_type);
CREATE INDEX idx_call_participants_call ON call_participants(call_id);
CREATE INDEX idx_call_participants_user ON call_participants(user_id);
