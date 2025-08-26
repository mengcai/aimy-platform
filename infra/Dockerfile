# Use Node.js 20 Alpine image
FROM node:20-alpine

# Set environment variables
ENV NODE_ENV=production

# Install dependencies for native modules
RUN apk add --no-cache \
    python3 \
    make \
    g++ \
    libc6-compat \
    postgresql-client

# Create app directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy source code
COPY . .

# Create non-root user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S infra -u 1001

# Change ownership of the app directory
RUN chown -R infra:nodejs /app
USER infra

# Default command
CMD ["node", "seed.js"]
