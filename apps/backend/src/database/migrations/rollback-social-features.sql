-- Rollback script for social features
-- USE WITH CAUTION - This will delete data!

-- Drop new tables
DROP TABLE IF EXISTS direct_messages CASCADE;
DROP TABLE IF EXISTS conversations CASCADE;
DROP TABLE IF EXISTS follows CASCADE;
DROP TABLE IF EXISTS friendships CASCADE;

-- Revert prayers table changes (if needed)
-- Note: You'll need to check if description should be NOT NULL
-- ALTER TABLE prayers ALTER COLUMN description SET NOT NULL;

-- Revert video_calls table changes
-- ALTER TABLE video_calls RENAME COLUMN created_by TO host_id;

COMMIT;
