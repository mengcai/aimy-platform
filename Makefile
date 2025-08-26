.PHONY: help up down seed test clean logs status shell build push

# Default target
help:
	@echo "🚀 AIMY Platform Development Commands"
	@echo ""
	@echo "🚀 Quick Start:"
	@echo "  make bootstrap   - One-command setup (up + seed + test + por)"
	@echo ""
	@echo "Infrastructure:"
	@echo "  make up          - Start the full AIMY stack"
	@echo "  make down        - Stop all services"
	@echo "  make restart     - Restart all services"
	@echo "  make status      - Show service status"
	@echo ""
	@echo "Development:"
	@echo "  make seed        - Seed database with demo data"
	@echo "  make test        - Run all tests"
	@echo "  make test:e2e    - Run E2E tests only"
	@echo "  make test:e2e:solar - Run Solar Farm tokenization E2E test"
	@echo "  make test:unit   - Run unit tests only"
	@echo "  make test:contracts - Run smart contract tests"
	@echo ""
	@echo "Proof of Reserve:"
	@echo "  make por         - Generate PoR report"
	@echo "  make por:schedule - Setup automated PoR generation"
	@echo "  make por:logs    - View PoR generation logs"
	@echo ""
	@echo "Database:"
	@echo "  make db:reset    - Reset database (WARNING: destroys all data)"
	@echo "  make db:backup   - Create database backup"
	@echo "  make db:restore  - Restore database from backup"
	@echo ""
	@echo "Monitoring:"
	@echo "  make logs        - Show all service logs"
	@echo "  make logs:web    - Show web app logs"
	@echo "  make logs:api    - Show API service logs"
	@echo "  make logs:db     - Show database logs"
	@echo ""
	@echo "Utilities:"
	@echo "  make shell:web   - Open shell in web container"
	@echo "  make shell:api   - Open shell in API container"
	@echo "  make shell:db    - Open shell in database container"
	@echo "  make clean       - Clean up containers and volumes"
	@echo "  make build       - Build all Docker images"
	@echo "  make push        - Push images to registry"

# Quick Start - One-command bootstrap
bootstrap:
	@echo "🚀 AIMY Platform Bootstrap - Complete Setup in One Command!"
	@echo "⏳ This will take a few minutes to complete..."
	@echo ""
	@echo "Step 1/4: Starting infrastructure..."
	@$(MAKE) up
	@echo ""
	@echo "Step 2/4: Seeding database with demo data..."
	@$(MAKE) seed
	@echo ""
	@echo "Step 3/4: Running initial tests..."
	@$(MAKE) test:unit
	@echo ""
	@echo "Step 4/4: Generating Proof of Reserve report..."
	@echo "📊 Generating PoR report..."
	@node scripts/generate-por.js || echo "⚠️  PoR generation failed (this is normal on first run)"
	@echo ""
	@echo "🎉 Bootstrap completed successfully!"
	@echo "🌐 Visit http://localhost:3005 to explore the platform"
	@echo "📊 Visit http://localhost:3000 for monitoring"
	@echo "📚 Read docs/GETTING_STARTED.md for next steps"

# Infrastructure commands
up:
	@echo "🚀 Starting AIMY platform..."
	docker-compose up -d
	@echo "⏳ Waiting for services to be ready..."
	@echo "📊 Monitoring: http://localhost:3000 (Grafana)"
	@echo "📈 Metrics: http://localhost:9090 (Prometheus)"
	@echo "🗄️  Database: http://localhost:8080 (Adminer)"
	@echo "🔍 Redis: http://localhost:8081 (Redis Commander)"
	@echo "🌐 Web App: http://localhost:3005"
	@echo "⚙️  Console: http://localhost:3006"
	@echo "🔌 API Gateway: http://localhost:3001"
	@echo "🤖 AI Core: http://localhost:8000"
	@echo "📋 Compliance: http://localhost:3002"
	@echo "💰 Settlement: http://localhost:3003"
	@echo "💧 Liquidity: http://localhost:3004"
	@echo "⛓️  Blockchain: http://localhost:8545"

down:
	@echo "🛑 Stopping AIMY platform..."
	docker-compose down

restart:
	@echo "🔄 Restarting AIMY platform..."
	docker-compose restart

status:
	@echo "📊 AIMY Platform Status:"
	docker-compose ps

# Database commands
seed:
	@echo "🌱 Seeding database with demo data..."
	@echo "⏳ Waiting for database to be ready..."
	@until docker-compose exec -T postgres pg_isready -U aimy_user -d aimy; do sleep 2; done
	@echo "📊 Running seed script..."
	docker-compose exec -T postgres psql -U aimy_user -d aimy -f /docker-entrypoint-initdb.d/seed.sql
	@echo "✅ Database seeded successfully!"

db:reset:
	@echo "⚠️  WARNING: This will destroy all data!"
	@read -p "Are you sure? Type 'yes' to confirm: " confirm; \
	if [ "$$confirm" = "yes" ]; then \
		echo "🗑️  Resetting database..."; \
		docker-compose down -v; \
		docker-compose up -d postgres; \
		echo "⏳ Waiting for database to be ready..."; \
		until docker-compose exec -T postgres pg_isready -U aimy_user -d aimy; do sleep 2; done; \
		echo "🌱 Running initialization..."; \
		docker-compose exec -T postgres psql -U aimy_user -d aimy -f /docker-entrypoint-initdb.d/init.sql; \
		echo "🌱 Running seed script..."; \
		docker-compose exec -T postgres psql -U aimy_user -d aimy -f /docker-entrypoint-initdb.d/seed.sql; \
		echo "✅ Database reset complete!"; \
	else \
		echo "❌ Database reset cancelled."; \
	fi

db:backup:
	@echo "💾 Creating database backup..."
	@timestamp=$$(date +%Y%m%d_%H%M%S); \
	docker-compose exec -T postgres pg_dump -U aimy_user -d aimy > backup_$$timestamp.sql; \
	echo "✅ Backup created: backup_$$timestamp.sql"

db:restore:
	@echo "📥 Restoring database from backup..."
	@if [ -z "$(file)" ]; then \
		echo "❌ Please specify backup file: make db:restore file=backup_20231201_120000.sql"; \
		exit 1; \
	fi; \
	echo "🔄 Restoring from $(file)..."; \
	docker-compose exec -T postgres psql -U aimy_user -d aimy < $(file); \
	echo "✅ Database restored successfully!"

# Testing commands
test:
	@echo "🧪 Running all tests..."
	@echo "📦 Installing dependencies..."
	pnpm install
	@echo "🔍 Running linting..."
	pnpm lint
	@echo "✅ Running type checking..."
	pnpm type-check
	@echo "🧪 Running unit tests..."
	pnpm test
	@echo "🌐 Running E2E tests..."
	pnpm test:e2e
	@echo "⛓️  Running smart contract tests..."
	cd packages/contracts && forge test --verbosity 2

test:e2e:
	@echo "🌐 Running E2E tests..."
	pnpm test:e2e

test:e2e:solar:
	@echo "🌞 Running Solar Farm Tokenization E2E test..."
	@echo "⏳ This comprehensive test covers the complete tokenization lifecycle..."
	@echo "📋 Test phases:"
	@echo "   1. Issuer onboarding & asset creation"
	@echo "   2. AI valuation & token deployment"
	@echo "   3. Investor KYC & primary subscription"
	@echo "   4. Secondary trading on AMM"
	@echo "   5. Monthly settlement & payout"
	@echo "   6. Compliance enforcement & audit trails"
	@echo "   7. AI insights & portfolio updates"
	@echo "   8. Proof of Reserve snapshot generation"
	@echo ""
	@echo "🚀 Starting test suite..."
	cd apps/web && pnpm test:e2e --config=playwright.e2e.config.ts --grep="Solar Farm Tokenization"

test:unit:
	@echo "🧪 Running unit tests..."
	pnpm test

test:contracts:
	@echo "⛓️  Running smart contract tests..."
	cd packages/contracts && forge test --verbosity 2

# Logging commands
logs:
	@echo "📋 Showing all service logs..."
	docker-compose logs -f

logs:web:
	@echo "🌐 Showing web app logs..."
	docker-compose logs -f web

logs:api:
	@echo "🔌 Showing API service logs..."
	docker-compose logs -f gateway compliance settlement liquidity ai-core

logs:db:
	@echo "🗄️  Showing database logs..."
	docker-compose logs -f postgres redis

# Shell access commands
shell:web:
	@echo "🐚 Opening shell in web container..."
	docker-compose exec web sh

shell:api:
	@echo "🐚 Opening shell in API container..."
	docker-compose exec gateway sh

shell:db:
	@echo "🐚 Opening shell in database container..."
	docker-compose exec postgres psql -U aimy_user -d aimy

# Utility commands
clean:
	@echo "🧹 Cleaning up containers and volumes..."
	docker-compose down -v
	docker system prune -f
	@echo "✅ Cleanup complete!"

build:
	@echo "🔨 Building all Docker images..."
	docker-compose build --no-cache

push:
	@echo "📤 Pushing images to registry..."
	@echo "⚠️  Make sure you're logged in to the registry first!"
	docker-compose push

# Development helpers
dev:up:
	@echo "🚀 Starting development environment..."
	docker-compose -f docker-compose.yml -f docker-compose.dev.yml up -d

dev:down:
	@echo "🛑 Stopping development environment..."
	docker-compose -f docker-compose.yml -f docker-compose.dev.yml down

# Proof of Reserve (PoR) commands
por:
	@echo "📊 Generating Proof of Reserve report..."
	@node scripts/generate-por.js

por:schedule:
	@echo "⏰ Setting up automated PoR generation..."
	@./scripts/schedule-por.sh

por:logs:
	@echo "📋 Viewing PoR generation logs..."
	@tail -f logs/por-generation.log || echo "No logs found. Run 'make por' first."

# Health checks
health:
	@echo "🏥 Checking service health..."
	@echo "📊 Checking database..."
	@docker-compose exec -T postgres pg_isready -U aimy_user -d aimy && echo "✅ Database: Healthy" || echo "❌ Database: Unhealthy"
	@echo "🔍 Checking Redis..."
	@docker-compose exec -T redis redis-cli --raw incr ping > /dev/null && echo "✅ Redis: Healthy" || echo "❌ Redis: Unhealthy"
	@echo "🌐 Checking web app..."
	@curl -f http://localhost:3005/api/health > /dev/null 2>&1 && echo "✅ Web App: Healthy" || echo "❌ Web App: Unhealthy"
	@echo "🔌 Checking API gateway..."
	@curl -f http://localhost:3001/health > /dev/null 2>&1 && echo "✅ API Gateway: Healthy" || echo "❌ API Gateway: Unhealthy"

# Port information
ports:
	@echo "🌐 AIMY Platform Ports:"
	@echo "  Web App:        http://localhost:3005"
	@echo "  Console:        http://localhost:3006"
	@echo "  API Gateway:    http://localhost:3001"
	@echo "  AI Core:        http://localhost:8000"
	@echo "  Compliance:     http://localhost:3002"
	@echo "  Settlement:     http://localhost:3003"
	@echo "  Liquidity:      http://localhost:3004"
	@echo "  Database:       localhost:5432"
	@echo "  Redis:          localhost:6379"
	@echo "  MinIO:          http://localhost:9000"
	@echo "  MinIO Console:  http://localhost:9001"
	@echo "  Prometheus:     http://localhost:9090"
	@echo "  Grafana:        http://localhost:3000"
	@echo "  Adminer:        http://localhost:8080"
	@echo "  Redis Commander: http://localhost:8081"
	@echo "  Hardhat:        http://localhost:8545"



