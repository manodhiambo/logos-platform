-- Fix prayers table - make title nullable or remove it
DO $$ 
BEGIN
    -- Check if title column exists and is NOT NULL
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'prayers' 
        AND column_name = 'title' 
        AND is_nullable = 'NO'
    ) THEN
        -- Make title nullable
        ALTER TABLE prayers ALTER COLUMN title DROP NOT NULL;
        RAISE NOTICE 'Made title column nullable in prayers table';
    END IF;
END $$;

SELECT 'Prayers table structure:' as info;
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'prayers' 
ORDER BY ordinal_position;
