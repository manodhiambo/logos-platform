-- Clean up posts table - remove duplicate user_id column
DO $$ 
BEGIN
    -- Drop old user_id column if it exists
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'posts' AND column_name = 'user_id'
    ) THEN
        -- First drop the foreign key constraint
        ALTER TABLE posts DROP CONSTRAINT IF EXISTS posts_user_id_fkey;
        
        -- Then drop the column
        ALTER TABLE posts DROP COLUMN user_id;
        
        RAISE NOTICE 'Dropped user_id column from posts table';
    END IF;
    
    -- Drop old index
    DROP INDEX IF EXISTS idx_posts_user;
END $$;

SELECT 'Posts table final structure:' as info;
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'posts' 
ORDER BY ordinal_position;
