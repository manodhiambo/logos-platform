#!/bin/bash

echo "🚀 Running LOGOS Platform Social Features Migration on Render..."

# Render database URL
DATABASE_URL="postgresql://logos_user:9HdXZOWCm08sjiX5VdlHNbWED9UafTpd@dpg-d40t6u8dl3ps73dahakg-a.oregon-postgres.render.com/logos_platform"

# Run the migration
psql "$DATABASE_URL" -f apps/backend/src/database/migrations/add-social-features.sql

# Check if successful
if [ $? -eq 0 ]; then
    echo "✅ Render migration completed successfully!"
else
    echo "❌ Render migration failed!"
    exit 1
fi
