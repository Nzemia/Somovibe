#!/bin/bash

# Local Docker Testing Script
# Test your Docker setup locally before deploying

set -e

echo "🧪 Testing Docker setup locally..."

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

# Check if .env exists
if [ ! -f .env ]; then
    echo -e "${YELLOW}⚠️  .env not found, copying from .env.example${NC}"
    cp .env.example .env
    echo -e "${RED}Please edit .env with your values before continuing${NC}"
    exit 1
fi

echo -e "${YELLOW}🔨 Building Docker image...${NC}"
docker-compose build

echo -e "${YELLOW}🚀 Starting containers...${NC}"
docker-compose up -d

echo -e "${YELLOW}⏳ Waiting for application to start...${NC}"
sleep 10

echo -e "${YELLOW}🏥 Checking health...${NC}"
if curl -f http://localhost:3000/api/health > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Application is healthy!${NC}"
    echo -e "${GREEN}🌐 Visit http://localhost:3000${NC}"
else
    echo -e "${RED}❌ Health check failed${NC}"
    echo "Logs:"
    docker-compose logs app
    exit 1
fi

echo ""
echo "Commands:"
echo "  View logs: docker-compose logs -f"
echo "  Stop: docker-compose down"
echo "  Restart: docker-compose restart"
