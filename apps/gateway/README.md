# AIMY API Gateway

The central API layer for the AIMY platform, providing unified GraphQL and REST endpoints for all frontend applications and external integrations.

## Purpose

This application serves as the central API gateway, providing:
- **Unified API Layer**: Single entry point for all platform operations
- **GraphQL API**: Flexible GraphQL schema with real-time subscriptions
- **REST API**: Comprehensive REST endpoints for all platform services
- **Authentication & Authorization**: Centralized security and access control
- **Rate Limiting**: Request throttling and abuse prevention
- **Service Discovery**: Dynamic service routing and load balancing
- **API Documentation**: Interactive API documentation with Swagger/OpenAPI
- **Request/Response Validation**: Comprehensive input validation with Zod

## Architecture Mapping

### Asset Input Layer
- **Asset Endpoints**: CRUD operations for asset management
- **Document Management**: File upload, storage, and retrieval
- **Asset Validation**: AI-powered validation and risk assessment
- **Asset Discovery**: Search, filtering, and recommendation APIs

### AI Valuation & Scoring Engine
- **AI Service Integration**: Orchestration of AI service calls
- **Valuation APIs**: Asset valuation and pricing endpoints
- **Risk Assessment**: Risk scoring and analysis APIs
- **Model Management**: AI model configuration and performance

### Fractionalization & Tokenization Layer
- **Token Management**: Security token creation and management
- **Portfolio APIs**: Portfolio creation, management, and analytics
- **Fractionalization**: Asset splitting and token allocation
- **Token Economics**: Yield distribution and reinvestment

### Compliance & KYC/AML Module
- **KYC Workflows**: Investor verification and approval APIs
- **AML Screening**: Suspicious activity detection endpoints
- **Sanctions Management**: Sanctions list checking and management
- **Compliance Rules**: Configurable compliance rule engine
- **Regulatory Reporting**: Automated compliance reporting

### Settlement & Payments
- **Payment Processing**: Payment creation and management APIs
- **Settlement APIs**: Settlement status and reconciliation
- **Fiat Integration**: Traditional banking integration endpoints
- **Stablecoin Operations**: Digital currency operation APIs

### Liquidity & Trading
- **Trading APIs**: Buy/sell operations and order management
- **Market Data**: Real-time pricing and volume information
- **Exchange Integration**: CEX/DEX integration endpoints
- **Liquidity Management**: Liquidity provision and management

### API Gateway Core
- **Request Routing**: Dynamic service routing and load balancing
- **Authentication**: JWT-based authentication and authorization
- **Rate Limiting**: Request throttling and abuse prevention
- **Validation**: Comprehensive input validation and sanitization
- **Monitoring**: API performance and usage analytics

## Technology Stack

### Backend Framework
- **NestJS**: Progressive Node.js framework
- **TypeScript**: Type-safe development
- **Node.js**: JavaScript runtime environment
- **Express**: Web application framework

### API Technologies
- **GraphQL**: Query language and runtime
- **Apollo Server**: GraphQL server implementation
- **REST API**: Traditional REST endpoints
- **WebSockets**: Real-time communication
- **gRPC**: High-performance RPC (planned)

### Data Validation
- **Zod**: TypeScript-first schema validation
- **class-validator**: Class-based validation decorators
- **class-transformer**: Object transformation utilities
- **Joi**: Alternative validation library

### Authentication & Security
- **Passport.js**: Authentication middleware
- **JWT**: JSON Web Token authentication
- **bcrypt**: Password hashing
- **Helmet**: Security middleware
- **CORS**: Cross-origin resource sharing

### Database & Caching
- **TypeORM**: Object-relational mapping
- **PostgreSQL**: Primary database
- **Redis**: Caching and session storage
- **MongoDB**: Document storage (optional)

### Message Queue
- **BullMQ**: Job queue and background processing
- **Redis**: Queue backend
- **Kafka**: Event streaming (planned)

## Key Features

### GraphQL API
- **Flexible Queries**: Complex data fetching with single requests
- **Real-time Subscriptions**: Live updates for portfolio and market data
- **Type Safety**: Full TypeScript integration and type generation
- **Performance**: Query optimization and caching
- **Schema Introspection**: Self-documenting API schema

### REST API
- **Comprehensive Endpoints**: Full CRUD operations for all entities
- **Pagination**: Efficient data pagination and filtering
- **Search & Filtering**: Advanced search and filtering capabilities
- **Bulk Operations**: Efficient batch processing
- **File Upload**: Secure file upload and management

### Authentication & Authorization
- **JWT Authentication**: Secure token-based authentication
- **Role-based Access**: Granular permissions for different user types
- **Multi-factor Authentication**: Enhanced security support
- **Session Management**: Secure session handling
- **API Key Management**: External API access control

### Request/Response Validation
- **Input Validation**: Comprehensive request validation
- **Data Sanitization**: Input sanitization and cleaning
- **Error Handling**: Structured error responses
- **Response Transformation**: Data transformation and formatting
- **Schema Validation**: Request/response schema validation

### Rate Limiting & Security
- **Rate Limiting**: Request throttling and abuse prevention
- **IP Whitelisting**: IP-based access control
- **Request Logging**: Comprehensive request logging
- **Security Headers**: Security header management
- **CORS Policy**: Cross-origin resource sharing control

## Project Structure

```
apps/gateway/
├── src/
│   ├── main.ts                 # Application entry point
│   ├── app.module.ts           # Root application module
│   ├── app.controller.ts       # Root controller
│   ├── app.service.ts          # Root service
│   ├── modules/                # Feature modules
│   │   ├── assets/            # Asset management module
│   │   ├── investors/         # Investor management module
│   │   ├── portfolios/        # Portfolio management module
│   │   ├── tokens/            # Token management module
│   │   ├── compliance/        # Compliance module
│   │   ├── payments/          # Payment processing module
│   │   ├── ai/                # AI service integration module
│   │   └── auth/              # Authentication module
│   ├── common/                 # Shared utilities
│   │   ├── decorators/        # Custom decorators
│   │   ├── filters/           # Exception filters
│   │   ├── guards/            # Authentication guards
│   │   ├── interceptors/      # Request/response interceptors
│   │   ├── pipes/             # Validation pipes
│   │   └── utils/             # Utility functions
│   ├── config/                 # Configuration management
│   ├── database/               # Database configuration
│   └── types/                  # TypeScript type definitions
├── test/                       # Test files
├── nest-cli.json              # NestJS CLI configuration
├── tsconfig.json              # TypeScript configuration
└── package.json               # Dependencies and scripts
```

## API Endpoints

### GraphQL Endpoints
- **GraphQL Playground**: `/graphql` - Interactive GraphQL playground
- **GraphQL Schema**: `/graphql/schema` - GraphQL schema introspection
- **Health Check**: `/graphql/health` - Service health endpoint

### REST API Endpoints

#### Assets
- `GET /api/v1/assets` - List assets with pagination and filtering
- `GET /api/v1/assets/:id` - Get asset by ID
- `POST /api/v1/assets` - Create new asset
- `PUT /api/v1/assets/:id` - Update asset
- `DELETE /api/v1/assets/:id` - Delete asset
- `POST /api/v1/assets/:id/documents` - Upload asset documents
- `GET /api/v1/assets/:id/valuation` - Get asset valuation

#### Investors
- `GET /api/v1/investors` - List investors with pagination
- `GET /api/v1/investors/:id` - Get investor by ID
- `POST /api/v1/investors` - Create new investor
- `PUT /api/v1/investors/:id` - Update investor
- `POST /api/v1/investors/:id/kyc` - Submit KYC application
- `GET /api/v1/investors/:id/compliance` - Get compliance status

#### Portfolios
- `GET /api/v1/portfolios` - List portfolios
- `GET /api/v1/portfolios/:id` - Get portfolio by ID
- `POST /api/v1/portfolios` - Create new portfolio
- `PUT /api/v1/portfolios/:id` - Update portfolio
- `GET /api/v1/portfolios/:id/holdings` - Get portfolio holdings
- `POST /api/v1/portfolios/:id/holdings` - Add holding to portfolio

#### Security Tokens
- `GET /api/v1/tokens` - List security tokens
- `GET /api/v1/tokens/:id` - Get token by ID
- `POST /api/v1/tokens` - Create new security token
- `PUT /api/v1/tokens/:id` - Update token
- `POST /api/v1/tokens/:id/issue` - Issue tokens
- `POST /api/v1/tokens/:id/redeem` - Redeem tokens

#### Compliance
- `GET /api/v1/compliance/kyc` - List KYC applications
- `POST /api/v1/compliance/kyc` - Submit KYC application
- `PUT /api/v1/compliance/kyc/:id` - Update KYC status
- `POST /api/v1/compliance/screen` - Screen entity for sanctions
- `GET /api/v1/compliance/rules` - Get compliance rules

#### Payments
- `GET /api/v1/payments` - List payments
- `POST /api/v1/payments` - Create new payment
- `GET /api/v1/payments/:id` - Get payment by ID
- `PUT /api/v1/payments/:id` - Update payment status
- `POST /api/v1/payments/:id/process` - Process payment

#### AI Services
- `POST /api/v1/ai/valuation` - Perform asset valuation
- `POST /api/v1/ai/risk-assessment` - Perform risk assessment
- `POST /api/v1/ai/yield-prediction` - Predict asset yield
- `GET /api/v1/ai/models` - Get available AI models
- `GET /api/v1/ai/performance` - Get model performance metrics

## Development

### Prerequisites
- **Node.js**: Version 20 or higher
- **pnpm**: Package manager
- **PostgreSQL**: Database server
- **Redis**: Caching and session storage
- **Docker**: For local development environment

### Setup
```bash
# Install dependencies
pnpm install

# Set up environment variables
cp .env.sample .env.local
# Edit .env.local with your configuration

# Start development server
pnpm run start:dev

# Build for production
pnpm run build

# Start production server
pnpm run start:prod
```

### Environment Variables
```bash
# Database Configuration
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_USERNAME=postgres
DATABASE_PASSWORD=password
DATABASE_NAME=aimy_platform

# Redis Configuration
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=

# JWT Configuration
JWT_SECRET=your-jwt-secret
JWT_EXPIRES_IN=24h

# API Configuration
API_PORT=3000
API_HOST=0.0.0.0
API_PREFIX=api/v1

# External Services
AI_SERVICE_URL=http://localhost:8000
COMPLIANCE_SERVICE_URL=http://localhost:3001
SETTLEMENT_SERVICE_URL=http://localhost:3002
LIQUIDITY_SERVICE_URL=http://localhost:3003
```

## Testing

### Test Types
- **Unit Tests**: Individual component and service testing
- **Integration Tests**: API endpoint and database integration testing
- **E2E Tests**: Complete API workflow testing
- **Performance Tests**: API performance and load testing

### Test Commands
```bash
# Run all tests
pnpm run test

# Run tests with coverage
pnpm run test:cov

# Run E2E tests
pnpm run test:e2e

# Run specific test file
pnpm run test -- --testPathPattern=auth.service.spec.ts
```

## Deployment

### Build Process
```bash
# Install dependencies
pnpm install

# Build application
pnpm run build

# Start production server
pnpm run start:prod
```

### Docker Deployment
```bash
# Build Docker image
docker build -t aimy-gateway .

# Run container
docker run -p 3000:3000 aimy-gateway
```

### Environment-specific Configurations
- **Development**: Hot reload, debug tools, development databases
- **Staging**: Production-like environment, staging databases
- **Production**: Optimized build, production databases, load balancing

## Performance Optimization

### API Optimization
- **Response Caching**: Redis-based response caching
- **Query Optimization**: Database query optimization
- **Connection Pooling**: Database connection pooling
- **Load Balancing**: Request distribution across instances

### GraphQL Optimization
- **Query Complexity**: Query complexity analysis and limiting
- **Depth Limiting**: Query depth limiting for security
- **Field Selection**: Optimized field selection and resolution
- **DataLoader**: Efficient data loading and batching

### Monitoring & Analytics
- **Performance Metrics**: Response time and throughput monitoring
- **Error Tracking**: Error rate and error analysis
- **Usage Analytics**: API usage patterns and trends
- **Health Monitoring**: Service health and availability monitoring

## Security Features

### Authentication & Authorization
- **JWT Tokens**: Secure token-based authentication
- **Role-based Access**: Granular permissions for different user types
- **API Key Management**: External API access control
- **Session Management**: Secure session handling

### API Security
- **Rate Limiting**: Request throttling and abuse prevention
- **Input Validation**: Comprehensive request validation
- **CORS Policy**: Cross-origin resource sharing control
- **Security Headers**: Security header management

### Data Protection
- **Data Encryption**: Sensitive data encryption
- **Audit Logging**: Complete audit trail for all operations
- **Access Control**: Granular access control for sensitive operations
- **Security Monitoring**: Real-time security monitoring

## Contributing

### Development Guidelines
1. **Code Style**: Follow NestJS and TypeScript best practices
2. **Type Safety**: Maintain strict TypeScript usage
3. **Testing**: Ensure comprehensive test coverage
4. **Documentation**: Update API documentation for new endpoints
5. **Security**: Follow security-first development practices

### Pull Request Process
1. **Feature Branch**: Create feature branch from main
2. **Development**: Implement feature with tests
3. **Code Review**: Submit PR for review
4. **Testing**: Ensure all tests pass
5. **Merge**: Merge after approval and CI checks

## Support & Documentation

### Resources
- **NestJS Documentation**: Framework documentation
- **GraphQL Documentation**: GraphQL specification and best practices
- **TypeScript Documentation**: Type-safe JavaScript
- **OpenAPI Specification**: REST API documentation

### Getting Help
- **GitHub Issues**: Bug reports and feature requests
- **Discord Community**: Developer community and support
- **Documentation**: Comprehensive platform documentation
- **API Reference**: Complete API documentation and examples
