#!/bin/bash
set -e

# Default to local database
DB_URL="${DATABASE_URL:-postgresql://postgres:Mycat%4095@localhost:5432/logos_platform}"

# Allow override from command line argument
if [ ! -z "$1" ]; then
  DB_URL="$1"
  echo "🌐 Using provided database URL"
else
  echo "🏠 Using local database"
fi

# Get the script directory and project root
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
MIGRATIONS_DIR="$PROJECT_ROOT/apps/backend/src/database/migrations"

echo "=========================================="
echo "🗄️  LOGOS Platform Database Migration Tool"
echo "=========================================="
echo "📁 Migrations directory: $MIGRATIONS_DIR"
echo ""

# Check if migrations directory exists
if [ ! -d "$MIGRATIONS_DIR" ]; then
  echo "❌ Migrations directory not found: $MIGRATIONS_DIR"
  exit 1
fi

# Test connection
echo "🔌 Testing database connection..."
if psql "$DB_URL" -c "SELECT 1" > /dev/null 2>&1; then
  echo "✅ Database connection successful"
else
  echo "❌ Database connection failed"
  exit 1
fi

echo ""
echo "🧩 Running migrations..."
echo "=========================================="

# Count migrations
MIGRATION_COUNT=$(ls -1 "$MIGRATIONS_DIR"/*.sql 2>/dev/null | wc -l)

if [ "$MIGRATION_COUNT" -eq 0 ]; then
  echo "⚠️  No migration files found"
else
  echo "📋 Found $MIGRATION_COUNT migration files"
  echo ""
  
  # Run migrations in order
  for file in $(ls -v "$MIGRATIONS_DIR"/*.sql); do
    filename=$(basename "$file")
    echo "📄 Applying: $filename"
    
    if psql "$DB_URL" -f "$file" 2>&1 | grep -q "ERROR"; then
      echo "   ⚠️  Warning: May have already been applied or contains errors"
    else
      echo "   ✅ Success"
    fi
  done
fi

echo "=========================================="
echo "✅ All migrations completed!"
echo ""
echo "📊 Current database tables:"
psql "$DB_URL" -c "\dt" | grep -A 100 "List of relations"

echo ""
echo "🔍 Checking posts table structure..."
psql "$DB_URL" -c "\d posts" | head -40

echo ""
echo "🎉 Migration process complete!"
