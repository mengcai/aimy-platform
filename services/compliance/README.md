# AIMY Compliance Service

A comprehensive compliance and KYC management service for the AIMY platform, built with NestJS and TypeScript.

## 🏗️ Architecture Overview

The compliance service provides a complete solution for managing regulatory compliance, KYC/AML workflows, and risk assessment in real-world asset tokenization.

### Core Components

- **KYC Management**: Complete applicant lifecycle management
- **Screening Engine**: Sanctions, PEP, and AML screening
- **Rule Engine**: Configurable compliance rule evaluation
- **Case Management**: Workflow for compliance cases
- **Webhook Service**: Real-time transfer compliance checks
- **Audit System**: Comprehensive audit trail and reporting

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ 
- PostgreSQL 14+
- Redis 6+
- MinIO (or S3-compatible storage)

### Installation

```bash
cd services/compliance
npm install
```

### Environment Configuration

Create a `.env` file:

```env
# Database
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=postgres
DB_NAME=aimy_compliance

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=

# MinIO/S3
MINIO_ENDPOINT=localhost
MINIO_PORT=9000
MINIO_ACCESS_KEY=minioadmin
MINIO_SECRET_KEY=minioadmin
MINIO_BUCKET=compliance-docs

# Service Configuration
PORT=3002
NODE_ENV=development
MAX_FILE_SIZE=10485760
UPLOAD_PATH=./uploads
```

### Running the Service

```bash
# Development
npm run start:dev

# Production
npm run start:prod

# Test
npm run test
```

## 📋 API Endpoints

### KYC Management

- `POST /api/v1/kyc/applicants` - Create KYC applicant
- `GET /api/v1/kyc/applicants` - List applicants with filters
- `GET /api/v1/kyc/applicants/:id` - Get applicant details
- `POST /api/v1/kyc/applicants/:id/documents` - Upload documents
- `POST /api/v1/kyc/applicants/:id/verify` - Initiate verification
- `PUT /api/v1/kyc/applicants/:id/status` - Update status

### Compliance Cases

- `POST /api/v1/cases` - Create compliance case
- `GET /api/v1/cases` - Search and filter cases
- `GET /api/v1/cases/:id` - Get case details
- `POST /api/v1/cases/:id/decision` - Make case decision
- `POST /api/v1/cases/:id/assign` - Assign case
- `POST /api/v1/cases/:id/escalate` - Escalate case

### Webhooks

- `POST /api/v1/webhooks/transfer-check` - Check transfer compliance
- `POST /api/v1/webhooks/events` - Process webhook events
- `POST /api/v1/webhooks/transfer-check/batch` - Batch transfer checks

### Audit & Reporting

- `GET /api/v1/audit/logs` - Search audit logs
- `GET /api/v1/audit/metrics` - Get audit metrics
- `POST /api/v1/audit/reports/generate` - Generate compliance report
- `POST /api/v1/audit/export` - Export audit data

## 🔧 Core Services

### KYCService

Manages the complete KYC workflow:

```typescript
// Create applicant
const applicant = await kycService.createApplicant({
  email: 'john.doe@example.com',
  firstName: 'John',
  lastName: 'Doe',
  dateOfBirth: new Date('1990-01-01'),
  nationality: 'US',
  countryOfResidence: 'US',
  investorType: 'INDIVIDUAL',
  accreditationStatus: 'ACCREDITED'
});

// Initiate verification
const result = await kycService.initiateVerification({
  applicantId: applicant.id,
  verificationMethod: 'AUTOMATED'
});
```

### ScreeningService

Performs sanctions and risk screening:

```typescript
// Initiate screening
const screeningResult = await screeningService.initiateScreening({
  applicantId: 'uuid',
  screeningType: 'SANCTIONS',
  applicantData: { /* applicant data */ }
});
```

### RuleEngineService

Evaluates compliance rules:

```typescript
// Check compliance
const complianceResult = await ruleEngineService.evaluateCompliance({
  applicant: applicant,
  transferAmount: 10000,
  assetId: 'SOLAR-FARM-001',
  jurisdiction: 'US'
});
```

### WebhookService

Handles real-time compliance checks:

```typescript
// Check transfer compliance
const transferResult = await webhookService.checkTransferCompliance({
  fromAddress: '0x123...',
  toAddress: '0x456...',
  amount: 1000,
  assetId: 'SOLAR-FARM-001'
});
```

## 🗄️ Database Schema

### Core Entities

- **KYCApplicant**: Applicant information and status
- **KYCDocument**: Document metadata and storage references
- **ScreeningResult**: Screening results and risk scores
- **ComplianceRule**: Configurable compliance rules
- **ComplianceCase**: Case management and workflow
- **AuditLog**: Complete audit trail

### Key Relationships

```
KYCApplicant (1) ←→ (N) KYCDocument
KYCApplicant (1) ←→ (N) ScreeningResult
KYCApplicant (1) ←→ (1) ComplianceCase
ComplianceCase (1) ←→ (N) AuditLog
```

## 🔒 Security Features

- **Input Validation**: Comprehensive request validation
- **Audit Logging**: Complete audit trail for all actions
- **Role-Based Access**: Fine-grained permission control
- **Data Encryption**: Sensitive data encryption at rest
- **API Rate Limiting**: Protection against abuse

## 📊 Monitoring & Observability

- **Health Checks**: Service health monitoring
- **Metrics**: Performance and usage metrics
- **Logging**: Structured logging with correlation IDs
- **Tracing**: Distributed tracing support
- **Alerts**: Automated alerting for critical issues

## 🧪 Testing

### Unit Tests

```bash
npm run test
```

### Integration Tests

```bash
npm run test:e2e
```

### Test Coverage

```bash
npm run test:cov
```

## 🚀 Deployment

### Docker

```bash
docker build -t aimy-compliance .
docker run -p 3002:3002 aimy-compliance
```

### Docker Compose

```yaml
version: '3.8'
services:
  compliance:
    build: .
    ports:
      - "3002:3002"
    environment:
      - DB_HOST=postgres
      - REDIS_HOST=redis
    depends_on:
      - postgres
      - redis
      - minio
```

### Kubernetes

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: aimy-compliance
spec:
  replicas: 3
  selector:
    matchLabels:
      app: aimy-compliance
  template:
    metadata:
      labels:
        app: aimy-compliance
    spec:
      containers:
      - name: compliance
        image: aimy-compliance:latest
        ports:
        - containerPort: 3002
```

## 📈 Performance

- **Response Time**: < 100ms for standard operations
- **Throughput**: 1000+ requests/second
- **Scalability**: Horizontal scaling support
- **Caching**: Redis-based caching for performance
- **Async Processing**: Background job processing

## 🔧 Configuration

### Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | 3002 | Service port |
| `NODE_ENV` | development | Environment mode |
| `DB_HOST` | localhost | Database host |
| `DB_PORT` | 5432 | Database port |
| `REDIS_HOST` | localhost | Redis host |
| `MINIO_ENDPOINT` | localhost | MinIO endpoint |

### Feature Flags

- `ENABLE_SCREENING`: Enable screening services
- `ENABLE_RULE_ENGINE`: Enable rule engine
- `ENABLE_AUDIT`: Enable audit logging
- `ENABLE_WEBHOOKS`: Enable webhook processing

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

### Development Guidelines

- Follow TypeScript best practices
- Use NestJS patterns and conventions
- Write comprehensive tests
- Document all public APIs
- Follow semantic versioning

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](../LICENSE) file for details.

## 🆘 Support

For support and questions:

- **Documentation**: [docs.aimy.com](https://docs.aimy.com)
- **Issues**: [GitHub Issues](https://github.com/aimy/aimy/issues)
- **Discord**: [AIMY Community](https://discord.gg/aimy)
- **Email**: support@aimy.com

## 🔮 Roadmap

- [ ] Advanced ML-based risk scoring
- [ ] Multi-jurisdiction compliance rules
- [ ] Real-time compliance monitoring
- [ ] Advanced reporting and analytics
- [ ] Integration with external compliance providers
- [ ] Mobile app support
- [ ] Blockchain integration for audit trails

---

**Built with ❤️ by the AIMY Team**
