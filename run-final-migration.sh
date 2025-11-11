#!/bin/bash

echo "🚀 Running FINAL LOGOS Platform Migration..."

# LOCAL
echo "📍 Running LOCAL migration..."
PGPASSWORD='Mycat@95' psql -U postgres -d logos_platform -f apps/backend/src/database/migrations/add-realtime-features.sql

if [ $? -eq 0 ]; then
    echo "✅ Local migration successful!"
else
    echo "❌ Local migration failed!"
    exit 1
fi

# RENDER
echo "📍 Running RENDER migration..."
psql "postgresql://logos_user:9HdXZOWCm08sjiX5VdlHNbWED9UafTpd@dpg-d40t6u8dl3ps73dahakg-a.oregon-postgres.render.com/logos_platform" -f apps/backend/src/database/migrations/add-realtime-features.sql

if [ $? -eq 0 ]; then
    echo "✅ Render migration successful!"
else
    echo "❌ Render migration failed!"
    exit 1
fi

echo "🎉 ALL MIGRATIONS COMPLETED SUCCESSFULLY!"
