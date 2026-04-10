#!/usr/bin/env sh
set -euo pipefail

# Build image
docker compose build

# Sync DB schema (non-destructive; ensures tables/columns match Prisma schema)
docker compose run --rm app npx prisma db push

# Start app
docker compose up -d

echo "App is running on http://localhost:3000"
