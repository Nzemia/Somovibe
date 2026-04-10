#!/bin/bash

# Database Backup Script for PostgreSQL (Neon)
# Usage: ./scripts/backup-db.sh

# Note: we do NOT use set -e here so that the if/$? checks below can run

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}📦 Starting database backup...${NC}"

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

BACKUP_DIR="backups"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_FILE="$BACKUP_DIR/somovibe_backup_$TIMESTAMP.sql"

# Create backup directory if it doesn't exist
mkdir -p $BACKUP_DIR

echo -e "${YELLOW}📂 Backup directory: $BACKUP_DIR${NC}"
echo -e "${YELLOW}📄 Backup file: $BACKUP_FILE${NC}"

# Extract database connection details from DATABASE_URL
# Format: postgresql://user:password@host:port/dbname?sslmode=require

# Parse DATABASE_URL
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

# Create backup using pg_dump
# Using docker to ensure pg_dump is available
docker run --rm \
    -e PGPASSWORD="$DB_PASS" \
    postgres:15-alpine \
    pg_dump \
    -h "$DB_HOST" \
    -p "$DB_PORT" \
    -U "$DB_USER" \
    -d "$DB_NAME" \
    --no-owner \
    --no-acl \
    > "$BACKUP_FILE" 2>/tmp/pg_dump_errors.log

# Check if backup was successful
if [ $? -eq 0 ] && [ -s "$BACKUP_FILE" ]; then
    # Compress backup
    gzip "$BACKUP_FILE"
    
    BACKUP_SIZE=$(du -h "${BACKUP_FILE}.gz" | cut -f1)
    echo -e "${GREEN} Backup created successfully: ${BACKUP_FILE}.gz (${BACKUP_SIZE})${NC}"
    
    # Keep only last 7 backups
    BACKUP_COUNT=$(ls -1 $BACKUP_DIR/somovibe_backup_*.sql.gz 2>/dev/null | wc -l)
    if [ $BACKUP_COUNT -gt 7 ]; then
        echo -e "${YELLOW}🧹 Cleaning up old backups (keeping last 7)...${NC}"
        ls -t $BACKUP_DIR/somovibe_backup_*.sql.gz | tail -n +8 | xargs -r rm
        echo -e "${GREEN} Old backups cleaned up${NC}"
    fi
    
    # Show backup list
    echo -e "${YELLOW}📋 Available backups:${NC}"
    ls -lh $BACKUP_DIR/somovibe_backup_*.sql.gz 2>/dev/null || echo "No backups found"
    
else
    echo -e "${RED}❌ Backup failed or file is empty${NC}"
    rm -f "$BACKUP_FILE"
    exit 1
fi

echo -e "${GREEN} Backup process completed successfully!${NC}"

