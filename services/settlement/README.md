# Settlement Service

The Settlement Service is a comprehensive NestJS-based service that handles all aspects of real-world asset tokenization payouts, distributions, and settlement operations.

## 🏗️ Architecture

The service is built with a modular architecture that separates concerns and provides clear interfaces:

```
src/
├── adapters/           # Stablecoin adapter implementations
├── controllers/        # REST API endpoints
├── entities/          # TypeORM database entities
├── processors/        # BullMQ background job processors
├── services/          # Business logic services
└── tasks/            # Scheduled cron jobs
```

## 🚀 Features

### Core Functionality
- **Investor Wallet Registry**: Manage investor wallets across different stablecoins
- **Distribution Management**: Create, schedule, and execute distributions
- **Payout Processing**: Execute payouts with pro-rata calculations
- **Receipt Generation**: Generate PDF receipts and export data
- **Withholding & Fees**: Calculate and apply withholding rules and fees
- **Scheduled Tasks**: Automated distribution processing and reporting

### Stablecoin Support
- **USDC Adapter**: Mock USDC implementation for testing
- **HKD Stablecoin Adapter**: Mock HKD stablecoin implementation
- **Extensible Architecture**: Easy to add new stablecoin providers

### Advanced Features
- **Dry Run Mode**: Test distributions without actual transfers
- **Bulk Operations**: Process multiple distributions simultaneously
- **Recurring Distributions**: Automated recurring distribution creation
- **Comprehensive Reporting**: Generate settlement reports in multiple formats
- **Health Monitoring**: Service health checks and monitoring

## 📊 Entities

### InvestorWallet
- Manages investor wallet addresses and balances
- Supports multiple stablecoin types
- KYC verification status tracking
- Jurisdiction-based compliance

### Distribution
- Defines distribution schedules and amounts
- Supports various distribution types (dividend, interest, etc.)
- Approval workflow management
- Recurring distribution support

### PayoutRun
- Tracks payout execution status
- Batch processing support
- Retry mechanism for failed payouts
- Comprehensive audit trail

### PayoutReceipt
- Individual payout receipts
- PDF generation support
- Multiple export formats (JSON, CSV)
- Compliance and transaction details

### WithholdingRule
- Configurable withholding rules
- Jurisdiction-based calculations
- Multiple calculation methods (percentage, fixed, tiered)
- Exemption handling

### FeeCapture
- Fee calculation and collection
- Various fee types (management, performance, etc.)
- Automatic fee processing
- Fee waiver and deferral support

## 🔧 Services

### SettlementService
Main orchestrator service that coordinates all settlement operations:
- Settlement workflow execution
- Scheduled distribution processing
- Data reconciliation
- Health monitoring

### WalletRegistryService
Manages investor wallet lifecycle:
- Wallet creation and validation
- Balance updates
- Status management (active, suspended, etc.)
- Bulk operations

### DistributionService
Handles distribution lifecycle:
- Distribution creation and scheduling
- Approval workflow
- Execution and monitoring
- Recurring distribution management

### PayoutService
Core payout processing:
- Pro-rata calculations
- Batch processing
- Stablecoin transfers
- Error handling and retries

### WithholdingService
Calculates withholding amounts:
- Rule-based calculations
- Jurisdiction compliance
- Exemption processing
- Audit trail

### FeeService
Manages fee calculations:
- Multiple calculation methods
- Automatic collection
- Fee schedules
- Reporting

### ReceiptService
Handles receipt generation:
- PDF generation
- Multiple export formats
- Bulk operations
- Template management

## 🌐 API Endpoints

### Settlement Controller
- `GET /settlement/summary` - Get settlement overview
- `GET /settlement/health` - Service health check
- `POST /settlement/workflow/:distributionId` - Execute settlement workflow
- `POST /settlement/process-scheduled/:date` - Process scheduled distributions
- `POST /settlement/reconcile` - Reconcile settlement data
- `POST /settlement/report` - Generate settlement reports

### Payout Controller
- `POST /payouts/execute` - Execute payout run
- `POST /payouts/dry-run/:distributionId` - Execute dry run
- `GET /payouts/status/:payoutRunId` - Get payout status
- `POST /payouts/retry/:payoutRunId` - Retry failed payout
- `GET /payouts/stats` - Get payout statistics

### Wallet Controller
- `POST /wallets` - Create new wallet
- `GET /wallets/:walletId` - Get wallet details
- `PUT /wallets/:walletId` - Update wallet
- `POST /wallets/:walletId/activate` - Activate wallet
- `POST /wallets/:walletId/suspend` - Suspend wallet
- `GET /wallets/search` - Search wallets with filters

### Distribution Controller
- `POST /distributions` - Create new distribution
- `GET /distributions/:distributionId` - Get distribution details
- `POST /distributions/:distributionId/approve` - Approve distribution
- `POST /distributions/:distributionId/execute` - Execute distribution
- `GET /distributions/search` - Search distributions with filters

## 🔄 Background Processing

### BullMQ Queues
- **payouts**: Handles payout execution jobs
- **distributions**: Manages distribution processing jobs

### Job Types
- `execute-payout`: Execute a payout run
- `retry-payout`: Retry a failed payout
- `bulk-payout`: Process multiple payouts
- `execute-distribution`: Execute a distribution
- `approve-distribution`: Approve a distribution
- `create-recurring`: Create recurring distribution instances

### Scheduled Tasks
- **Daily**: Process scheduled distributions, data cleanup
- **Hourly**: Handle overdue fees
- **Weekly**: Create recurring distributions, generate reports
- **Monthly**: Process management fees

## 🧪 Testing

### Unit Tests
- Comprehensive test coverage for all services
- Edge case testing for pro-rata calculations
- Mock implementations for external dependencies

### Test Scenarios
- Zero token balances
- Single investor scenarios
- Very small/large balances
- Floating point precision
- Withholding and fee edge cases
- Dry run mode validation

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- PostgreSQL 13+
- Redis 6+
- NestJS CLI

### Installation
```bash
cd services/settlement
npm install
```

### Configuration
Create `.env` file with:
```env
# Database
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_NAME=aimy_settlement
DATABASE_USERNAME=postgres
DATABASE_PASSWORD=password

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379

# Service
SETTLEMENT_SERVICE_PORT=3003
SETTLEMENT_SERVICE_HOST=0.0.0.0
```

### Running the Service
```bash
# Development
npm run start:dev

# Production
npm run start:prod
```

### Docker
```bash
docker build -t aimy-settlement .
docker run -p 3003:3003 aimy-settlement
```

## 📈 Monitoring

### Health Checks
- Database connectivity
- Stablecoin adapter status
- Service health
- Scheduled task status

### Metrics
- Distribution counts by status
- Payout success/failure rates
- Processing times
- Error rates

### Logging
- Structured logging with correlation IDs
- Audit trail for all operations
- Error tracking and alerting

## 🔒 Security

### Authentication
- JWT-based authentication
- Role-based access control
- API key management

### Data Protection
- Encrypted sensitive data
- Audit logging
- Compliance with financial regulations

### Rate Limiting
- API rate limiting
- Queue job throttling
- DDoS protection

## 🔄 Integration

### External Services
- Stablecoin providers (USDC, HKD, etc.)
- Compliance services
- Document storage (MinIO)
- Message queues (Redis/BullMQ)

### APIs
- RESTful API design
- OpenAPI/Swagger documentation
- GraphQL support (planned)
- Webhook notifications

## 📚 Documentation

### API Reference
- Complete OpenAPI specification
- Request/response examples
- Error code documentation

### Developer Guide
- Service architecture overview
- Development setup
- Contributing guidelines

### Operations Manual
- Deployment procedures
- Monitoring and alerting
- Troubleshooting guide

## 🤝 Contributing

### Development Workflow
1. Fork the repository
2. Create a feature branch
3. Implement changes with tests
4. Submit a pull request

### Code Standards
- TypeScript strict mode
- ESLint configuration
- Prettier formatting
- Comprehensive testing

### Testing Requirements
- Unit test coverage > 90%
- Integration test coverage
- E2E test scenarios
- Performance testing

## 📄 License

This service is part of the AIMY platform and is licensed under the MIT License.

## 🆘 Support

### Issues
- GitHub Issues for bug reports
- Feature request discussions
- Documentation improvements

### Community
- Developer forums
- Slack channels
- Regular meetups

---

For more information, visit the [AIMY Platform Documentation](https://docs.aimy.com) or contact the development team.
