# ─── Stage 1: Install dependencies & generate Prisma client ───────────────────
FROM node:20-alpine AS deps
WORKDIR /app

COPY package*.json ./
COPY prisma ./prisma

RUN npm ci --legacy-peer-deps \
    && npx prisma generate

# ─── Stage 2: Build Next.js ────────────────────────────────────────────────────
FROM node:20-alpine AS builder
WORKDIR /app

ENV NEXT_TELEMETRY_DISABLED=1

# DATABASE_URL must be provided at build time so Next.js can analyse routes
# Pass it with:  docker build --build-arg DATABASE_URL="..." .
ARG DATABASE_URL
ENV DATABASE_URL=${DATABASE_URL}

COPY --from=deps /app/node_modules ./node_modules
COPY . .

RUN npm run build

# ─── Stage 3: Production runtime ──────────────────────────────────────────────
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Copy only what's needed at runtime
COPY --from=deps /app/node_modules ./node_modules
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/prisma ./prisma

EXPOSE 3000

# Run migrations then start the server
CMD ["sh", "-c", "npx prisma db push && npm run start"]
