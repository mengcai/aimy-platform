# Use Node.js 20 Alpine image
FROM node:20-alpine

# Set environment variables
ENV NODE_ENV=production
ENV PORT=3003

# Install dependencies for native modules
RUN apk add --no-cache \
    python3 \
    make \
    g++ \
    libc6-compat \
    curl

# Create app directory
WORKDIR /app

# Copy package files
COPY package*.json ./
COPY pnpm-lock.yaml ./

# Install pnpm
RUN npm install -g pnpm

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy source code
COPY . .

# Build the application
RUN pnpm run build

# Remove development dependencies
RUN pnpm prune --prod

# Create non-root user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nestjs -u 1001

# Change ownership of the app directory
RUN chown -R nestjs:nodejs /app
USER nestjs

# Expose port
EXPOSE 3003

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:3003/health || exit 1

# Start the application
CMD ["node", "dist/main"]
