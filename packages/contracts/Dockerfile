# Use Node.js 20 Alpine image
FROM node:20-alpine

# Set environment variables
ENV NODE_ENV=production

# Install dependencies for native modules and Foundry
RUN apk add --no-cache \
    python3 \
    make \
    g++ \
    libc6-compat \
    curl \
    git \
    bash

# Install Foundry
RUN curl -L https://foundry.paradigm.xyz | bash
RUN /root/.foundry/bin/foundryup

# Add Foundry to PATH
ENV PATH="/root/.foundry/bin:${PATH}"

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

# Build contracts
RUN pnpm run build

# Create non-root user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S contracts -u 1001

# Change ownership of the app directory
RUN chown -R contracts:nodejs /app
USER contracts

# Expose port (if needed for any services)
EXPOSE 8545

# Default command
CMD ["pnpm", "run", "test:foundry"]
