-- Add missing columns to communities table

-- Add cover_image_url if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name='communities' AND column_name='cover_image_url'
    ) THEN
        ALTER TABLE communities ADD COLUMN cover_image_url VARCHAR(500);
    END IF;
END $$;

-- Add is_active if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name='communities' AND column_name='is_active'
    ) THEN
        ALTER TABLE communities ADD COLUMN is_active BOOLEAN DEFAULT true;
    END IF;
END $$;

-- Update existing records to have is_active = true
UPDATE communities SET is_active = true WHERE is_active IS NULL;

COMMIT;
