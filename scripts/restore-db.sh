#!/bin/bash

# Database Restore Script for PostgreSQL (Neon)
# Usage: ./scripts/restore-db.sh <backup_file.sql.gz>

# Note: we do NOT use set -e here so that the if/$? checks below can run

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if backup file is provided
if [ -z "$1" ]; then
    echo -e "${RED}❌ Error: No backup file specified${NC}"
    echo -e "${YELLOW}Usage: ./scripts/restore-db.sh <backup_file.sql.gz>${NC}"
    echo -e "${YELLOW}Available backups:${NC}"
    ls -lh backups/somovibe_backup_*.sql.gz 2>/dev/null || echo "No backups found"
    exit 1
fi

BACKUP_FILE=$1

# Check if backup file exists
if [ ! -f "$BACKUP_FILE" ]; then
    echo -e "${RED}❌ Error: Backup file not found: $BACKUP_FILE${NC}"
    exit 1
fi

echo -e "${YELLOW}⚠️  WARNING: This will restore the database from backup${NC}"
echo -e "${YELLOW}⚠️  All current data will be replaced!${NC}"
echo -e "${YELLOW}📄 Backup file: $BACKUP_FILE${NC}"
echo ""
read -p "Are you sure you want to continue? (yes/no): " CONFIRM

if [ "$CONFIRM" != "yes" ]; then
    echo -e "${YELLOW}❌ Restore cancelled${NC}"
    exit 0
fi

# Load environment variables
if [ -f .env.production ]; then
    source .env.production
elif [ -f .env ]; then
    source .env
else
    echo -e "${RED}❌ Error: No .env file found${NC}"
    exit 1
fi

# Check if DATABASE_URL is set
if [ -z "$DATABASE_URL" ]; then
    echo -e "${RED}❌ Error: DATABASE_URL not set${NC}"
    exit 1
fi

echo -e "${YELLOW}📦 Starting database restore...${NC}"

# Extract database connection details
DB_USER=$(echo $DATABASE_URL | sed -n 's/.*:\/\/\([^:]*\):.*/\1/p')
DB_PASS=$(echo $DATABASE_URL | sed -n 's/.*:\/\/[^:]*:\([^@]*\)@.*/\1/p')
DB_HOST=$(echo $DATABASE_URL | sed -n 's/.*@\([^:\/]*\).*/\1/p')
DB_PORT=$(echo $DATABASE_URL | sed -n 's/.*:\([0-9]*\)\/.*/\1/p')
DB_NAME=$(echo $DATABASE_URL | sed -n 's/.*\/\([^?]*\).*/\1/p')

# Default port if not specified
if [ -z "$DB_PORT" ]; then
    DB_PORT=5432
fi

echo -e "${YELLOW}🔗 Connecting to: $DB_HOST:$DB_PORT/$DB_NAME${NC}"

# Decompress backup if it's gzipped
if [[ $BACKUP_FILE == *.gz ]]; then
    echo -e "${YELLOW}📦 Decompressing backup...${NC}"
    TEMP_FILE="${BACKUP_FILE%.gz}"
    gunzip -c "$BACKUP_FILE" > "$TEMP_FILE"
    RESTORE_FILE="$TEMP_FILE"
else
    RESTORE_FILE="$BACKUP_FILE"
fi

# Restore database using psql
echo -e "${YELLOW} Restoring database...${NC}"

docker run --rm -i \
    -e PGPASSWORD="$DB_PASS" \
    postgres:15-alpine \
    psql \
    -h "$DB_HOST" \
    -p "$DB_PORT" \
    -U "$DB_USER" \
    -d "$DB_NAME" \
    < "$RESTORE_FILE"

# Clean up temp file if created
if [[ $BACKUP_FILE == *.gz ]]; then
    rm -f "$TEMP_FILE"
fi

if [ $? -eq 0 ]; then
    echo -e "${GREEN} Database restored successfully!${NC}"
    echo -e "${YELLOW}⚠️  Remember to restart your application if it's running${NC}"
else
    echo -e "${RED}❌ Restore failed${NC}"
    exit 1
fi
