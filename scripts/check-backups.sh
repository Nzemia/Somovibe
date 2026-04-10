#!/bin/bash

# Script to check backup status and health
# Usage: ./scripts/check-backups.sh

GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${YELLOW}🔍 Checking backup status...${NC}"
echo ""

BACKUP_DIR="backups"

# Check if backup directory exists
if [ ! -d "$BACKUP_DIR" ]; then
    echo -e "${RED}❌ Backup directory not found${NC}"
    exit 1
fi

# Count backups
BACKUP_COUNT=$(ls -1 $BACKUP_DIR/somovibe_backup_*.sql.gz 2>/dev/null | wc -l)

if [ $BACKUP_COUNT -eq 0 ]; then
    echo -e "${RED}❌ No backups found${NC}"
    echo -e "${YELLOW}Run ./scripts/backup-db.sh to create your first backup${NC}"
    exit 1
fi

echo -e "${GREEN} Found $BACKUP_COUNT backup(s)${NC}"
echo ""

# Show most recent backup
LATEST_BACKUP=$(ls -t $BACKUP_DIR/somovibe_backup_*.sql.gz 2>/dev/null | head -1)
if [ -n "$LATEST_BACKUP" ]; then
    BACKUP_AGE=$(stat -c %Y "$LATEST_BACKUP")
    CURRENT_TIME=$(date +%s)
    AGE_HOURS=$(( ($CURRENT_TIME - $BACKUP_AGE) / 3600 ))
    BACKUP_SIZE=$(du -h "$LATEST_BACKUP" | cut -f1)
    
    echo -e "${YELLOW}📄 Latest backup:${NC}"
    echo "   File: $(basename $LATEST_BACKUP)"
    echo "   Size: $BACKUP_SIZE"
    echo "   Age: $AGE_HOURS hours ago"
    
    # Warn if backup is old
    if [ $AGE_HOURS -gt 48 ]; then
        echo -e "${RED}⚠️  WARNING: Latest backup is more than 48 hours old!${NC}"
    else
        echo -e "${GREEN} Backup is recent${NC}"
    fi
fi

echo ""
echo -e "${YELLOW}📋 All backups:${NC}"
ls -lh $BACKUP_DIR/somovibe_backup_*.sql.gz

echo ""
echo -e "${YELLOW}💾 Disk usage:${NC}"
du -sh $BACKUP_DIR

echo ""
echo -e "${YELLOW}🔧 Backup integrity check:${NC}"
if gunzip -t "$LATEST_BACKUP" 2>/dev/null; then
    echo -e "${GREEN} Latest backup file is valid${NC}"
else
    echo -e "${RED}❌ Latest backup file is corrupted!${NC}"
fi

echo ""
echo -e "${GREEN} Backup check complete${NC}"
