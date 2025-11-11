#!/bin/bash

echo "🔍 Verifying migration locally..."

export PGPASSWORD='Mycat@95'

# Check if tables were created
psql -U postgres -d logos_platform -c "
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('friendships', 'follows', 'conversations', 'direct_messages')
ORDER BY table_name;
"

# Check prayers description column
psql -U postgres -d logos_platform -c "
SELECT column_name, is_nullable, data_type
FROM information_schema.columns
WHERE table_name = 'prayers' 
AND column_name = 'description';
"

# Check video_calls created_by column
psql -U postgres -d logos_platform -c "
SELECT column_name, is_nullable, data_type
FROM information_schema.columns
WHERE table_name = 'video_calls' 
AND column_name = 'created_by';
"

unset PGPASSWORD

echo "✅ Verification complete!"
