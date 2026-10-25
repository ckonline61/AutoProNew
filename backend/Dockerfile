# ─── Stage 1: Build ───────────────────────────────────────────────────────────
FROM node:22-alpine AS builder

WORKDIR /app

# Copy package files first (layer caching — only reinstall when deps change)
COPY package.json package-lock.json ./

# Install ALL dependencies (including devDeps for TypeScript build)
RUN npm install --ignore-scripts

# Copy source code
COPY tsconfig.json ./
COPY src/ ./src/

# Compile TypeScript → JavaScript
RUN npm run build


# ─── Stage 2: Production ──────────────────────────────────────────────────────
FROM node:22-alpine AS production

# Security: run as non-root user
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

WORKDIR /app

# Copy package files
COPY package.json package-lock.json ./

# Install ONLY production dependencies (no devDeps = smaller image)
RUN npm install --omit=dev --ignore-scripts && \
    npm cache clean --force

# Copy compiled JS from builder stage
COPY --from=builder /app/dist ./dist

# Switch to non-root user
USER appuser

# Cloud Run injects PORT env variable (default 8080, but we use 5000)
# Our config/index.ts reads process.env.PORT automatically ✅
ENV NODE_ENV=production
ENV PORT=5000

EXPOSE 5000

# Health check — Cloud Run uses this
HEALTHCHECK --interval=30s --timeout=10s --start-period=20s --retries=3 \
  CMD node -e "require('http').get('http://localhost:5000/api/v1/health', (r) => { process.exit(r.statusCode === 200 ? 0 : 1) })"

# Start the server
CMD ["node", "dist/index.js"]
