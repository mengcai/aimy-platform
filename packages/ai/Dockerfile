# Use Node.js 20 Alpine image
FROM node:20-alpine

# Set environment variables
ENV NODE_ENV=production

# Install dependencies for native modules
RUN apk add --no-cache \
    python3 \
    make \
    g++ \
    libc6-compat

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

# Build the package
RUN pnpm run build

# Create non-root user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S ai -u 1001

# Change ownership of the app directory
RUN chown -R ai:nodejs /app
USER ai

# Default command
CMD ["pnpm", "run", "test"]
