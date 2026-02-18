#!/bin/bash

# Monitoring Script for Questy
# Shows real-time stats and health

echo "📊 Questy Monitoring Dashboard"
echo "=============================="
echo ""

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

# Container status
echo -e "${YELLOW}📦 Container Status:${NC}"
docker-compose ps
echo ""

# Health check
echo -e "${YELLOW}🏥 Health Check:${NC}"
HEALTH=$(curl -s http://localhost:3000/api/health)
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Application is healthy${NC}"
    echo "$HEALTH" | jq '.' 2>/dev/null || echo "$HEALTH"
else
    echo -e "${RED}❌ Application is unhealthy${NC}"
fi
echo ""

# Resource usage
echo -e "${YELLOW}💻 Resource Usage:${NC}"
docker stats --no-stream
echo ""

# Disk usage
echo -e "${YELLOW}💾 Disk Usage:${NC}"
df -h / | tail -n 1
echo ""

# Docker disk usage
echo -e "${YELLOW}🐳 Docker Disk Usage:${NC}"
docker system df
echo ""

# Recent logs
echo -e "${YELLOW}📝 Recent Logs (last 20 lines):${NC}"
docker-compose logs --tail=20 app
echo ""

# Backup status
echo -e "${YELLOW}💾 Recent Backups:${NC}"
if [ -d "backups" ]; then
    ls -lht backups/ | head -n 5
else
    echo "No backups directory found"
fi
