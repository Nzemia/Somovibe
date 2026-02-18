#!/bin/bash

# Database Backup Script for Neon PostgreSQL
# Usage: ./scripts/backup-db.sh

set -e

# Load environment variables
source .env.production

BACKUP_DIR="backups"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_FILE="$BACKUP_DIR/questy_backup_$TIMESTAMP.sql"

# Create backup directory if it doesn't exist
mkdir -p $BACKUP_DIR

echo "📦 Creating database backup..."

# Extract database connection details from DATABASE_URL
# Format: postgresql://user:password@host/dbname?sslmode=require
DB_URL=$DATABASE_URL

# Use pg_dump to create backup
docker run --rm \
    -e PGPASSWORD=$(echo $DB_URL | sed -n 's/.*:\/\/.*:\(.*\)@.*/\1/p') \
    postgres:15-alpine \
    pg_dump \
    -h $(echo $DB_URL | sed -n 's/.*@\(.*\)\/.*/\1/p') \
    -U $(echo $DB_URL | sed -n 's/.*:\/\/\(.*\):.*/\1/p') \
    -d $(echo $DB_URL | sed -n 's/.*\/\(.*\)?.*/\1/p') \
    > $BACKUP_FILE

# Compress backup
gzip $BACKUP_FILE

echo "✅ Backup created: ${BACKUP_FILE}.gz"

# Keep only last 7 backups
ls -t $BACKUP_DIR/questy_backup_*.sql.gz | tail -n +8 | xargs -r rm

echo "🧹 Old backups cleaned up (keeping last 7)"
