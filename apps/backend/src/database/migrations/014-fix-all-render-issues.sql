-- ============================================
-- COMPREHENSIVE FIX FOR ALL RENDER DATABASE ISSUES
-- ============================================

-- 1. FIX POSTS TABLE
-- ------------------
DO $$ 
BEGIN
    -- Rename like_count to likes_count
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'posts' AND column_name = 'like_count'
    ) THEN
        ALTER TABLE posts RENAME COLUMN like_count TO likes_count;
        RAISE NOTICE 'Renamed like_count to likes_count';
    END IF;
    
    -- Rename comment_count to comments_count  
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'posts' AND column_name = 'comment_count'
    ) THEN
        ALTER TABLE posts RENAME COLUMN comment_count TO comments_count;
        RAISE NOTICE 'Renamed comment_count to comments_count';
    END IF;
END $$;


-- 2. FIX USER_DEVOTIONAL_PROGRESS TABLE
-- --------------------------------------
DO $$ 
BEGIN
    -- Rename is_completed to completed
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'user_devotional_progress' AND column_name = 'is_completed'
    ) THEN
        ALTER TABLE user_devotional_progress RENAME COLUMN is_completed TO completed;
        RAISE NOTICE 'Renamed is_completed to completed';
    END IF;
END $$;


-- 3. FIX PRAYERS TABLE
-- --------------------
DO $$ 
BEGIN
    -- Remove prayed_at if exists (model doesn't use it)
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'prayers' AND column_name = 'prayed_at'
    ) THEN
        ALTER TABLE prayers DROP COLUMN prayed_at;
        RAISE NOTICE 'Dropped prayed_at column from prayers table';
    END IF;
END $$;


-- 4. ADD MISSING COLUMNS IF NEEDED
-- ---------------------------------
ALTER TABLE prayers ADD COLUMN IF NOT EXISTS message TEXT;


-- 5. VERIFY ALL CHANGES
-- ---------------------
DO $$
BEGIN
    RAISE NOTICE '========================================';
    RAISE NOTICE 'MIGRATION COMPLETED SUCCESSFULLY';
    RAISE NOTICE '========================================';
END $$;

-- Show final structure
SELECT 'Posts table fixed columns:' as info;
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'posts' AND column_name IN ('likes_count', 'comments_count', 'attachments');

SELECT '' as info;
SELECT 'Devotional progress fixed columns:' as info;
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'user_devotional_progress' AND column_name = 'completed';

SELECT '' as info;
SELECT 'Prayers table columns:' as info;
SELECT column_name, data_type FROM information_schema.columns 
WHERE table_name = 'prayers' ORDER BY ordinal_position;
