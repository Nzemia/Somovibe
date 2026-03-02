#!/bin/bash

# SSL Setup Script using Let's Encrypt
# Usage: ./scripts/setup-ssl.sh your-domain.com your-email@example.com

set -e

DOMAIN=$1
EMAIL=$2

if [ -z "$DOMAIN" ] || [ -z "$EMAIL" ]; then
    echo "Usage: ./scripts/setup-ssl.sh your-domain.com your-email@example.com"
    exit 1
fi

echo "🔐 Setting up SSL for $DOMAIN..."

# Create directories
mkdir -p certbot/conf
mkdir -p certbot/www

# Update nginx config with actual domain
sed -i "s/your-domain.com/$DOMAIN/g" nginx/conf.d/default.conf

# Get SSL certificate
docker-compose run --rm certbot certonly \
    --webroot \
    --webroot-path=/var/www/certbot \
    --email $EMAIL \
    --agree-tos \
    --no-eff-email \
    -d $DOMAIN \
    -d www.$DOMAIN

# Reload nginx
docker-compose exec nginx nginx -s reload

echo "✅ SSL certificate installed successfully!"
echo "🔒 Your site is now accessible at https://$DOMAIN"
