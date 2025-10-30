-- 010-add-message-to-prayers.sql
-- Migration: Add "message" column to "prayers" table if it does not exist

ALTER TABLE prayers
ADD COLUMN IF NOT EXISTS message TEXT;
