-- Devotionals table
CREATE TABLE IF NOT EXISTS devotionals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    scripture_reference VARCHAR(255),
    author_id UUID REFERENCES users(id) ON DELETE SET NULL,
    published_date DATE NOT NULL,
    reading_time_minutes INTEGER DEFAULT 5,
    views_count INTEGER DEFAULT 0,
    is_published BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- User devotional progress
CREATE TABLE IF NOT EXISTS user_devotional_progress (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    devotional_id UUID NOT NULL REFERENCES devotionals(id) ON DELETE CASCADE,
    is_completed BOOLEAN DEFAULT FALSE,
    notes TEXT,
    completed_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, devotional_id)
);

-- Indexes
CREATE INDEX idx_devotionals_published_date ON devotionals(published_date DESC);
CREATE INDEX idx_devotionals_author ON devotionals(author_id);
CREATE INDEX idx_user_devotional_progress_user ON user_devotional_progress(user_id);
CREATE INDEX idx_user_devotional_progress_devotional ON user_devotional_progress(devotional_id);
