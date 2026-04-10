#!/bin/bash

# Setup script for database backups
# Run this once to set up everything

set -e

GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${YELLOW}🔧 Setting up database backup system...${NC}"

# Create backups directory
mkdir -p backups
echo -e "${GREEN} Created backups directory${NC}"

# Make scripts executable
chmod +x scripts/backup-db.sh
chmod +x scripts/restore-db.sh
chmod +x scripts/check-backups.sh
echo -e "${GREEN} Made scripts executable${NC}"

# Test database connection
echo -e "${YELLOW}🔗 Testing database connection...${NC}"

if [ -f .env.production ]; then
    source .env.production
elif [ -f .env ]; then
    source .env
else
    echo -e "${RED}❌ Error: No .env file found${NC}"
    exit 1
fi

if docker run --rm postgres:15-alpine psql "$DATABASE_URL" -c "SELECT 1;" > /dev/null 2>&1; then
    echo -e "${GREEN} Database connection successful${NC}"
else
    echo -e "${RED}❌ Database connection failed${NC}"
    echo -e "${YELLOW}Please check your DATABASE_URL in .env${NC}"
    exit 1
fi

# Create initial backup
echo -e "${YELLOW}📦 Creating initial backup...${NC}"
./scripts/backup-db.sh

echo -e "${GREEN} Backup system setup complete!${NC}"
echo ""
echo -e "${YELLOW}Next steps:${NC}"
echo "1. Set up GitHub Actions secrets (see BACKUP-GUIDE.md)"
echo "2. Test manual backup: ./scripts/backup-db.sh"
echo "3. Test restore: ./scripts/restore-db.sh backups/somovibe_backup_*.sql.gz"
echo "4. Set up monitoring: ./scripts/check-backups.sh"
