-- Fix prayer description column to allow NULL
ALTER TABLE prayers ALTER COLUMN description DROP NOT NULL;

-- Also ensure other optional fields are nullable
ALTER TABLE prayers ALTER COLUMN title DROP NOT NULL;
ALTER TABLE prayers ALTER COLUMN category DROP NOT NULL;
