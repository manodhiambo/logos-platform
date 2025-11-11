-- Rename host_id to created_by in video_calls table
ALTER TABLE video_calls RENAME COLUMN host_id TO created_by;
