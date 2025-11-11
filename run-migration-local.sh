#!/bin/bash

echo "🚀 Running LOGOS Platform Social Features Migration Locally..."

# Set database credentials
export PGPASSWORD='Mycat@95'

# Run the migration
psql -U postgres -d logos_platform -f apps/backend/src/database/migrations/add-social-features.sql

# Check if successful
if [ $? -eq 0 ]; then
    echo "✅ Local migration completed successfully!"
else
    echo "❌ Local migration failed!"
    exit 1
fi

# Unset password
unset PGPASSWORD
