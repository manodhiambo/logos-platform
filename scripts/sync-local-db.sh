#!/bin/bash
set -e
DB_URL="postgresql://postgres:Mycat%4095@localhost:5432/logos_platform"
MIGRATIONS_DIR="apps/backend/src/database/migrations"

echo "🧩 Running migrations in: $MIGRATIONS_DIR"
for file in $MIGRATIONS_DIR/*.sql; do
  echo "🚀 Applying migration: $file"
  psql "$DB_URL" -f "$file"
done

echo "✅ All migrations applied successfully!"
psql "$DB_URL" -c "\dt"
