# Multi-stage build for Next.js + Prisma
# Use an Alpine Node base for small footprint
FROM node:20-alpine AS deps
WORKDIR /app

# Install dependencies (including dev for build/prisma)
COPY package*.json ./
COPY prisma ./prisma
RUN npm ci --legacy-peer-deps \
    && npx prisma generate

FROM node:20-alpine AS builder
WORKDIR /app
ENV NEXT_TELEMETRY_DISABLED=1

COPY --from=deps /app/node_modules ./node_modules
COPY . .

RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Copy production node_modules (omit dev deps)
COPY --from=deps /app/node_modules ./node_modules

# Copy built assets and minimal sources needed at runtime
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/prisma ./prisma

EXPOSE 3000
CMD ["npm", "run", "start"]
