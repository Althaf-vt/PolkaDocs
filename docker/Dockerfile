# Stage 1: Build dependencies and compile TypeScript
FROM node:20-alpine AS builder

WORKDIR /usr/src/app

# Install build dependencies
COPY backend/package*.json ./
RUN npm ci

# Copy backend source and compile
COPY backend/ ./
RUN npm run build

# Prune dev dependencies for a clean production layer
RUN npm prune --production

# Stage 2: Minimal production runtime
FROM node:20-alpine AS runner

WORKDIR /usr/src/app

ENV NODE_ENV=production

# Install curl for container health check
RUN apk add --no-cache curl

# Run as dedicated unprivileged node user
USER node

# Copy production node_modules and compiled output from builder
COPY --chown=node:node --from=builder /usr/src/app/node_modules ./node_modules
COPY --chown=node:node --from=builder /usr/src/app/dist ./dist
COPY --chown=node:node --from=builder /usr/src/app/package*.json ./

# Expose default backend port
EXPOSE 3000

# Health check targeting the API health endpoint
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD curl -f http://localhost:3000/api/v1/health || exit 1

CMD ["node", "dist/main.js"]