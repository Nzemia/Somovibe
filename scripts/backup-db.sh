#!/bin/bash

# Database Backup Script for PostgreSQL (Neon)
# Usage: ./scripts/backup-db.sh

# Note: we intentionally avoid `set -e` so we can print explicit pg_dump errors
set -u
set -o pipefail

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}📦 Starting database backup...${NC}"

print_error_log() {
    if [ -s "$ERROR_LOG" ]; then
        echo -e "${YELLOW}----- pg_dump stderr (last 40 lines) -----${NC}"
        tail -n 40 "$ERROR_LOG"
        echo -e "${YELLOW}-----------------------------------------${NC}"
    else
        echo -e "${YELLOW}No stderr output captured from pg_dump${NC}"
    fi
}

fail_backup() {
    local message="$1"
    echo -e "${RED}❌ ${message}${NC}"
    echo "target: $TARGET"
    echo "output file: $BACKUP_FILE"

    KEEP_ERROR_LOG=1
    print_error_log

    rm -f "$BACKUP_FILE"
    echo -e "${YELLOW}Error log saved at: $ERROR_LOG${NC}"
    exit 1
}

force_sslmode_require() {
    local url="$1"

    if [[ "$url" == *"sslmode="* ]]; then
        echo "$url" | sed -E 's/(sslmode=)[^&]*/\1require/'
    elif [[ "$url" == *"?"* ]]; then
        echo "${url}&sslmode=require"
    else
        echo "${url}?sslmode=require"
    fi
}

# Load environment variables
if [ -f .env.production ]; then
    ENV_FILE=".env.production"
elif [ -f .env ]; then
    ENV_FILE=".env"
else
    echo -e "${RED}❌ Error: No .env file found${NC}"
    exit 1
fi

set -a
# shellcheck source=/dev/null
source "$ENV_FILE"
set +a

# Check if DATABASE_URL is set
if [ -z "${DATABASE_URL:-}" ]; then
    echo -e "${RED}❌ Error: DATABASE_URL not set${NC}"
    exit 1
fi

BACKUP_DIR="backups"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_FILE="$BACKUP_DIR/somovibe_backup_$TIMESTAMP.sql"
ERROR_LOG="/tmp/somovibe_pg_dump_${TIMESTAMP}.log"
KEEP_ERROR_LOG=0

cleanup() {
    if [ "$KEEP_ERROR_LOG" -eq 0 ]; then
        rm -f "$ERROR_LOG"
    fi
}
trap cleanup EXIT

# Create backup directory if it doesn't exist
mkdir -p "$BACKUP_DIR"

DB_URL=$(force_sslmode_require "$DATABASE_URL")
TARGET=$(echo "$DB_URL" | sed -E 's#^postgres(ql)?://[^@]+@##; s/[?].*$//')

echo -e "${YELLOW}📂 Backup directory: $BACKUP_DIR${NC}"
echo -e "${YELLOW}📄 Backup file: $BACKUP_FILE${NC}"
echo -e "${YELLOW}🔗 Target database: $TARGET${NC}"

# Ensure we can run pg_dump either locally or in Docker
if command -v pg_dump >/dev/null 2>&1; then
    DUMP_METHOD="local"
    echo -e "${YELLOW}🛠️  Using local pg_dump binary${NC}"
elif command -v docker >/dev/null 2>&1; then
    DUMP_METHOD="docker"
    echo -e "${YELLOW}🛠️  Local pg_dump not found; using postgres:17-alpine container${NC}"
else
    echo -e "${RED}❌ Neither pg_dump nor docker is available on this host${NC}"
    exit 1
fi

if [ "$DUMP_METHOD" = "local" ]; then
    PGSSLMODE=require pg_dump "$DB_URL" --no-owner --no-acl > "$BACKUP_FILE" 2>"$ERROR_LOG"
    DUMP_EXIT=$?
else
    docker run --rm \
        -e DATABASE_URL="$DB_URL" \
        -e PGSSLMODE=require \
        postgres:17-alpine \
        sh -c 'pg_dump "$DATABASE_URL" --no-owner --no-acl' \
        > "$BACKUP_FILE" 2>"$ERROR_LOG"
    DUMP_EXIT=$?
fi

if [ "$DUMP_EXIT" -ne 0 ]; then
    fail_backup "pg_dump failed with exit code $DUMP_EXIT"
fi

# Validate output file size after dump
if [ ! -s "$BACKUP_FILE" ]; then
    fail_backup "Backup failed or file is empty"
fi

BACKUP_BYTES=$(wc -c < "$BACKUP_FILE")
echo -e "${YELLOW}📏 Raw backup size: ${BACKUP_BYTES} bytes${NC}"

# Compress backup
gzip "$BACKUP_FILE"
if [ $? -ne 0 ] || [ ! -s "${BACKUP_FILE}.gz" ]; then
    fail_backup "Backup compression failed"
fi

BACKUP_SIZE=$(du -h "${BACKUP_FILE}.gz" | cut -f1)
echo -e "${GREEN} Backup created successfully: ${BACKUP_FILE}.gz (${BACKUP_SIZE})${NC}"

# Keep only last 7 backups
BACKUP_COUNT=$(ls -1 "$BACKUP_DIR"/somovibe_backup_*.sql.gz 2>/dev/null | wc -l)
if [ "$BACKUP_COUNT" -gt 7 ]; then
    echo -e "${YELLOW}🧹 Cleaning up old backups (keeping last 7)...${NC}"
    ls -t "$BACKUP_DIR"/somovibe_backup_*.sql.gz | tail -n +8 | xargs -r rm -f
    echo -e "${GREEN} Old backups cleaned up${NC}"
fi

# Show backup list
echo -e "${YELLOW}📋 Available backups:${NC}"
ls -lh "$BACKUP_DIR"/somovibe_backup_*.sql.gz 2>/dev/null || echo "No backups found"

echo -e "${GREEN} Backup process completed successfully!${NC}"

