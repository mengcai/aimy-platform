# @aimy/sdk

The official TypeScript SDK for the AIMY platform, providing a comprehensive client library for interacting with all AIMY services and APIs.

## Purpose

This package serves as the primary client interface for the AIMY platform, providing:
- **Unified Client**: Single entry point for all AIMY operations
- **Type-Safe APIs**: Full TypeScript support with comprehensive type definitions
- **Domain Services**: Specialized services for each business domain
- **Authentication**: Built-in authentication and authorization handling
- **Error Handling**: Consistent error handling across all operations
- **Request/Response Interceptors**: Middleware for logging, caching, and retries
- **Browser & Node.js Support**: Universal compatibility across platforms
- **React Hooks**: React-specific hooks for seamless integration

## Architecture Mapping

### Asset Input Layer
- **AssetService**: CRUD operations for assets
- **Asset Discovery**: Search and filtering capabilities
- **Document Management**: Asset document upload and retrieval
- **Valuation Integration**: AI-powered asset valuation

### AI Valuation & Scoring Engine
- **AIService Integration**: Direct access to AI valuation services
- **Risk Assessment**: AI-powered risk scoring
- **Yield Prediction**: ML-based yield forecasting
- **Model Performance**: AI model monitoring and metrics

### Fractionalization & Tokenization Layer
- **SecurityTokenService**: Token lifecycle management
- **PortfolioService**: Portfolio creation and management
- **Token Trading**: Buy/sell operations and order management
- **Fractionalization**: Asset splitting and token creation

### Compliance & KYC/AML Module
- **ComplianceService**: KYC/AML workflow management
- **Sanctions Screening**: Automated compliance checks
- **Document Verification**: Identity and document validation
- **Compliance Reporting**: Regulatory reporting and audits

### Settlement & Payments
- **PaymentService**: Payment processing and management
- **Stablecoin Integration**: Digital currency operations
- **Fiat On/Off-Ramp**: Traditional banking integration
- **Payout Scheduling**: Automated payment distribution

### Liquidity & Trading
- **Exchange Integration**: CEX/DEX connectivity
- **Liquidity Pools**: DeFi protocol integration
- **Order Management**: Trading order lifecycle
- **Market Data**: Real-time market information

### Investor Portal
- **InvestorService**: Investor account management
- **Portfolio Tracking**: Real-time portfolio monitoring
- **Investment History**: Transaction and performance tracking
- **Reporting**: Investment reports and analytics

## Usage

### Basic Setup

```typescript
import { AIMYClient, AIMYClientFactory } from '@aimy/sdk';

// Create client instance
const client = AIMYClientFactory.create({
  baseUrl: 'https://api.aimy.com',
  apiKey: 'your-api-key',
  timeout: 30000
});

// Check service health
const isHealthy = await client.healthCheck();
```

### Asset Operations

```typescript
// Get all assets
const assets = await client.assets.getAssets({
  page: 1,
  limit: 20
});

// Create new asset
const newAsset = await client.assets.createAsset({
  name: 'Solar Farm Beta',
  assetType: 'renewable_energy',
  location: 'Texas, USA',
  valuation: 30000000,
  valuationCurrency: 'USD'
});

// Search assets
const searchResults = await client.assets.searchAssets({
  assetType: 'renewable_energy',
  minValuation: 10000000,
  maxValuation: 50000000
});
```

### AI Services

```typescript
// Get AI service instance
const aiService = client.getAIService();

if (aiService) {
  // Perform asset valuation
  const valuation = await aiService.performValuation({
    assetId: 'asset-001',
    assetType: 'renewable_energy',
    marketData: { /* market data */ },
    historicalData: [ /* historical data */ ]
  });

  // Get risk assessment
  const riskScore = await aiService.performRiskAssessment({
    assetId: 'asset-001',
    riskFactors: ['weather', 'regulatory', 'market']
  });
}
```

### Portfolio Management

```typescript
// Get investor portfolios
const portfolios = await client.portfolios.getPortfolios('investor-001');

// Create portfolio
const portfolio = await client.portfolios.createPortfolio({
  investorId: 'investor-001',
  name: 'Renewable Energy Portfolio',
  description: 'Diversified renewable energy investments'
});

// Add token to portfolio
await client.portfolios.addHolding({
  portfolioId: 'portfolio-001',
  tokenId: 'token-001',
  quantity: 1000,
  averagePrice: 1.00
});
```

### Compliance Operations

```typescript
// Submit KYC application
const kycResult = await client.compliance.submitKYC({
  investorId: 'investor-001',
  documents: [/* document data */],
  personalInfo: { /* personal information */ }
});

// Check compliance status
const status = await client.compliance.getComplianceStatus('investor-001');
```

## Service Architecture

### Client Structure
```
AIMYClient
├── assets: AssetService
├── investors: InvestorService
├── issuers: IssuerService
├── tokens: SecurityTokenService
├── portfolios: PortfolioService
├── compliance: ComplianceService
├── payments: PaymentService
├── documents: DocumentService
└── ai: AIService (optional)
```

### Authentication Flow
1. **API Key**: Primary authentication method
2. **JWT Tokens**: Session-based authentication
3. **OAuth2**: Third-party authentication support
4. **Refresh Tokens**: Automatic token renewal

### Error Handling
- **Network Errors**: Connection and timeout handling
- **API Errors**: HTTP status code handling
- **Validation Errors**: Input validation failures
- **Business Logic Errors**: Domain-specific error handling

## Dependencies

- **@aimy/shared**: Core types and interfaces
- **@aimy/ai**: AI service integration
- **axios**: HTTP client for API communication
- **zod**: Request/response validation
- **react**: React hooks support (optional)

## Build & Test

```bash
# Install dependencies
pnpm install

# Build the package
pnpm build

# Run tests
pnpm test

# Run linting
pnpm lint

# Run type checking
pnpm type-check
```

## Configuration

The SDK can be configured with:

```typescript
interface AIMYClientConfig {
  baseUrl: string;
  apiKey?: string;
  timeout?: number;
  retries?: number;
  cache?: boolean;
  interceptors?: RequestInterceptor[];
}
```

## Browser vs Node.js

### Browser
- **Bundle Size**: Optimized for web applications
- **CORS Handling**: Built-in CORS support
- **React Hooks**: React-specific integrations
- **Local Storage**: Browser storage for caching

### Node.js
- **Server-Side**: Full server-side functionality
- **File System**: File upload/download support
- **Streaming**: Large file handling
- **Background Jobs**: Long-running operations

## Contributing

When adding new SDK capabilities:

1. **Service Classes**: Add to `src/services/` directory
2. **Types**: Add to `src/types/` directory
3. **Client Integration**: Update `AIMYClient` class
4. **Tests**: Ensure comprehensive test coverage
5. **Documentation**: Update this README with new features
6. **Examples**: Provide usage examples for new functionality

## Integration Examples

### React Application
```typescript
import { useAIMYClient } from '@aimy/sdk/react';

function AssetList() {
  const { assets, loading, error } = useAIMYClient('assets');
  
  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;
  
  return (
    <div>
      {assets.map(asset => (
        <AssetCard key={asset.id} asset={asset} />
      ))}
    </div>
  );
}
```

### Node.js Service
```typescript
import { AIMYClient } from '@aimy/sdk';

async function processAssets() {
  const client = new AIMYClient({
    baseUrl: process.env.AIMY_API_URL,
    apiKey: process.env.AIMY_API_KEY
  });
  
  const assets = await client.assets.getAssets();
  
  for (const asset of assets) {
    // Process each asset
    await processAsset(asset);
  }
}
```
