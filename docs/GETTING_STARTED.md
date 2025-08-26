# 🚀 AIMY Platform - Getting Started Guide

Welcome to the AIMY Platform! This guide will help you get up and running with the complete AIMY stack in just a few commands.

## 🎯 What is AIMY?

AIMY is a comprehensive digital asset management platform that combines:
- **Real Estate Tokenization** with ERC-3643 compliance
- **AI-Powered Investment Insights** and risk assessment
- **Multi-Jurisdictional Compliance** (US, HK, EU)
- **Blockchain-Native Settlement** and liquidity management
- **Proof of Reserve** reporting and audit trails

## 🚀 One-Command Bootstrap

The fastest way to get started is with our one-command bootstrap:

```bash
make bootstrap
```

This single command will:
1. 🐳 Start all services with Docker Compose
2. 🌱 Seed the database with demo data
3. 🧪 Run initial tests to verify everything works
4. 📊 Generate your first Proof of Reserve report

## 📋 Prerequisites

Before running the bootstrap, ensure you have:

- **Docker & Docker Compose** (v2.0+)
- **Node.js** (v18+ or v20+)
- **pnpm** (v8+)
- **Git** (for cloning the repository)

### Quick Prerequisites Check

```bash
# Check Docker
docker --version && docker-compose --version

# Check Node.js
node --version && npm --version

# Check pnpm
pnpm --version

# Check Git
git --version
```

## 🛠️ Manual Setup (Alternative)

If you prefer to set up step by step:

### 1. Clone and Install

```bash
git clone <your-repo-url>
cd AIMY
pnpm install
```

### 2. Start Infrastructure

```bash
make up
```

### 3. Seed Database

```bash
make seed
```

### 4. Run Tests

```bash
make test
```

## 🏗️ Architecture Overview

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Web App      │    │   Console       │    │   API Gateway   │
│   (Port 3005)  │    │   (Port 3006)   │    │   (Port 3001)   │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         └───────────────────────┼───────────────────────┘
                                 │
         ┌───────────────────────┼───────────────────────┐
         │                       │                       │
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   AI Core       │    │  Compliance     │    │  Settlement     │
│   (Port 8000)   │    │  (Port 3002)    │    │  (Port 3003)    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         └───────────────────────┼───────────────────────┘
                                 │
         ┌───────────────────────┼───────────────────────┐
         │                       │                       │
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Liquidity     │    │   PostgreSQL    │    │     Redis       │
│   (Port 3004)   │    │   (Port 5432)   │    │   (Port 6379)   │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## 🌱 Demo Data Included

The seed script provides a complete working example:

### 🏢 Demo Issuer
- **SolarTech Ventures Ltd** (Hong Kong)
- Enhanced KYC policy
- Compliance officer: Sarah Chen (CAMS certified)

### 🏭 Demo Asset
- **Solar Farm 3643** - 50MW solar plant
- **Value**: $50M USD
- **Location**: Guangdong Province, China
- **Token**: STV (ERC-3643)
- **Yield Schedule**: 6.5% → 7.0% → 7.5% (quarterly)

### 👥 Demo Investors
1. **John Smith** (US Accredited)
   - Investment: $100K
   - Wallet: `0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6`
   - KYC: Enhanced, Approved

2. **Li Wei** (HK Qualified)
   - Investment: $200K
   - Wallet: `0x8ba1f109551bA432bdf5c3c2E3B1a5C8b1C2D3E4`
   - KYC: Enhanced, Approved

## 🔍 Available Services

| Service | Port | Description | URL |
|---------|------|-------------|-----|
| **Web App** | 3005 | Main investor interface | http://localhost:3005 |
| **Console** | 3006 | Issuer management console | http://localhost:3006 |
| **API Gateway** | 3001 | REST API endpoints | http://localhost:3001 |
| **AI Core** | 8000 | AI insights & predictions | http://localhost:8000 |
| **Compliance** | 3002 | KYC & compliance engine | http://localhost:3002 |
| **Settlement** | 3003 | Payment & settlement | http://localhost:3003 |
| **Liquidity** | 3004 | DEX integration | http://localhost:3004 |
| **Database** | 5432 | PostgreSQL | localhost:5432 |
| **Redis** | 6379 | Cache & messaging | localhost:6379 |
| **MinIO** | 9000 | Object storage | http://localhost:9000 |
| **Grafana** | 3000 | Monitoring dashboard | http://localhost:3000 |
| **Prometheus** | 9090 | Metrics collection | http://localhost:9090 |

## 🧪 Testing Your Setup

### Run All Tests
```bash
make test
```

### Run Specific Test Types
```bash
make test:unit      # Unit tests only
make test:e2e       # End-to-end tests
make test:contracts # Smart contract tests
```

### Health Check
```bash
make health
```

## 📊 Proof of Reserve Reports

Generate real-time PoR reports:

```bash
# Generate today's report
node scripts/generate-por.js

# Reports are saved to /reports/proof-of-reserve-YYYY-MM-DD.json
```

### Sample Report Structure
```json
{
  "report_metadata": {
    "report_type": "proof_of_reserve",
    "generation_timestamp": "2024-01-15T10:00:00.000Z",
    "platform": "AIMY"
  },
  "reserve_summary": {
    "total_assets_usd": 50000000,
    "reserve_ratio": 1.0,
    "reserve_adequacy": "adequate"
  },
  "assets_under_management": {
    "total_count": 1,
    "total_value_usd": 50000000
  }
}
```

## 🔧 Development Commands

### Service Management
```bash
make up          # Start all services
make down        # Stop all services
make restart     # Restart all services
make status      # Show service status
make logs        # View all logs
```

### Database Operations
```bash
make seed        # Seed with demo data
make db:reset    # Reset database (WARNING: destroys data)
make db:backup   # Create backup
make db:restore  # Restore from backup
```

### Development Tools
```bash
make shell:web   # Access web container
make shell:api   # Access API container
make shell:db    # Access database
make build       # Build all images
make clean       # Clean up containers
```

## 🚨 Troubleshooting

### Common Issues

#### 1. Port Conflicts
```bash
# Check what's using a port
lsof -i :3005

# Kill process if needed
kill -9 <PID>
```

#### 2. Database Connection Issues
```bash
# Check database status
make status

# View database logs
make logs:db

# Reset database if needed
make db:reset
```

#### 3. Docker Issues
```bash
# Clean up Docker
make clean

# Rebuild images
make build

# Start fresh
make up
```

#### 4. Permission Issues
```bash
# Fix file permissions
sudo chown -R $USER:$USER .

# Fix Docker permissions (Linux)
sudo usermod -aG docker $USER
newgrp docker
```

### Log Analysis
```bash
# View specific service logs
make logs:web
make logs:api
make logs:db

# Follow logs in real-time
docker-compose logs -f [service-name]
```

## 🔐 Environment Configuration

### Required Environment Variables
```bash
# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=aimy
DB_USER=aimy_user
DB_PASSWORD=aimy_password

# Blockchain
ETHEREUM_RPC_URL=http://localhost:8545
NETWORK_ID=1337

# AI Services
OPENAI_API_KEY=your_key_here
ANTHROPIC_API_KEY=your_key_here

# Compliance
COMPLIANCE_API_KEY=your_key_here
```

### Configuration Files
- `docker-compose.yml` - Service orchestration
- `infra/init.sql` - Database schema
- `infra/seed.sql` - Demo data
- `monitoring/` - Grafana dashboards & Prometheus config

## 📚 Next Steps

### 1. Explore the Platform
- Visit http://localhost:3005 (Web App)
- Visit http://localhost:3006 (Console)
- Check http://localhost:3000 (Grafana)

### 2. Review Demo Data
- Examine the seeded issuer, asset, and investors
- Review KYC policies and compliance rules
- Check the ERC-3643 token deployment

### 3. Generate Reports
- Run the PoR generator
- Review the generated JSON reports
- Customize report templates

### 4. Extend Functionality
- Add new asset types
- Implement custom compliance rules
- Integrate with external DEXs
- Add new AI models

## 🤝 Getting Help

### Documentation
- **Architecture**: `docs/ARCHITECTURE.md`
- **API Reference**: `docs/API.md`
- **Deployment**: `docs/DEPLOYMENT.md`

### Support Channels
- **GitHub Issues**: Report bugs and feature requests
- **Discord**: Community discussions
- **Email**: support@aimyplatform.com

### Contributing
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## 🎉 Congratulations!

You've successfully set up the AIMY Platform! The platform is now running with:
- ✅ Full-stack services
- ✅ Demo data and assets
- ✅ ERC-3643 tokenization
- ✅ AI-powered insights
- ✅ Compliance engine
- ✅ Monitoring and reporting

Start exploring the platform and building your digital asset infrastructure!

---

**Need help?** Check the troubleshooting section above or reach out to our support team.

**Want to contribute?** We welcome contributions! See our contributing guidelines in the repository.
