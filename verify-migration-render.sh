#!/bin/bash

echo "🔍 Verifying migration on Render..."

DATABASE_URL="postgresql://logos_user:9HdXZOWCm08sjiX5VdlHNbWED9UafTpd@dpg-d40t6u8dl3ps73dahakg-a.oregon-postgres.render.com/logos_platform"

# Check if tables were created
psql "$DATABASE_URL" -c "
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('friendships', 'follows', 'conversations', 'direct_messages')
ORDER BY table_name;
"

# Check prayers description column
psql "$DATABASE_URL" -c "
SELECT column_name, is_nullable, data_type
FROM information_schema.columns
WHERE table_name = 'prayers' 
AND column_name = 'description';
"

# Check video_calls created_by column
psql "$DATABASE_URL" -c "
SELECT column_name, is_nullable, data_type
FROM information_schema.columns
WHERE table_name = 'video_calls' 
AND column_name = 'created_by';
"

echo "✅ Verification complete!"
