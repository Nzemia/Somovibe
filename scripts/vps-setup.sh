#!/bin/bash

# Complete VPS Setup Script for Questy
# Run this on a fresh Ubuntu VPS
# Usage: bash <(curl -s https://raw.githubusercontent.com/YOUR_USERNAME/questy/main/scripts/vps-setup.sh)

set -e

echo "🚀 Questy VPS Setup Script"
echo "=========================="
echo ""

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

# Check if running as root
if [ "$EUID" -ne 0 ]; then 
    echo -e "${RED}Please run as root (or use sudo)${NC}"
    exit 1
fi

echo -e "${YELLOW}📦 Installing Docker...${NC}"
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh
rm get-docker.sh

echo -e "${YELLOW}📦 Installing Docker Compose...${NC}"
apt install -y docker-compose

echo -e "${YELLOW}📦 Installing Git...${NC}"
apt install -y git

echo -e "${YELLOW}👤 Creating deployer user...${NC}"
if id "deployer" &>/dev/null; then
    echo "User 'deployer' already exists"
else
    adduser --disabled-password --gecos "" deployer
    usermod -aG docker deployer
    usermod -aG sudo deployer
    echo "deployer ALL=(ALL) NOPASSWD:ALL" >> /etc/sudoers.d/deployer
fi

echo -e "${YELLOW}🔥 Setting up firewall...${NC}"
apt install -y ufw
ufw --force enable
ufw allow 22/tcp
ufw allow 80/tcp
ufw allow 443/tcp

echo -e "${YELLOW}🛡️  Installing fail2ban...${NC}"
apt install -y fail2ban
systemctl enable fail2ban
systemctl start fail2ban

echo -e "${YELLOW}🔄 Enabling automatic security updates...${NC}"
apt install -y unattended-upgrades
dpkg-reconfigure -plow unattended-upgrades

echo -e "${GREEN}✅ VPS setup complete!${NC}"
echo ""
echo "Next steps:"
echo "1. Switch to deployer user: su - deployer"
echo "2. Clone your repository: sudo mkdir -p /opt/questy && sudo chown deployer:deployer /opt/questy && cd /opt/questy && git clone YOUR_REPO_URL ."
echo "3. Configure environment: cp .env.production .env.production && nano .env.production"
echo "4. Make scripts executable: chmod +x scripts/*.sh"
echo "5. Setup SSL: ./scripts/setup-ssl.sh your-domain.com your-email@example.com"
echo "6. Deploy: ./scripts/deploy.sh"
