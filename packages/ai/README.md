# @aimy/ai

The AI orchestration package for the AIMY platform, providing TypeScript interfaces and utilities for interacting with AI services for asset valuation, risk assessment, and yield prediction.

## Purpose

This package serves as the TypeScript orchestrator for AI operations, providing:
- **AI Service Interface**: Type-safe communication with Python AI services
- **Valuation Engine**: Asset valuation and pricing models
- **Risk Assessment**: AI-powered risk scoring and analysis
- **Yield Prediction**: Machine learning-based yield forecasting
- **Batch Processing**: Efficient handling of multiple AI operations
- **Model Management**: AI model configuration and performance tracking
- **Error Handling**: Comprehensive error handling for AI operations
- **Utility Functions**: AI-specific data processing and validation

## Architecture Mapping

### AI Valuation & Scoring Engine
- **Core AI Service**: Orchestrates calls to Python `ai-core` service
- **Valuation Models**: Interfaces for different asset valuation approaches
- **Risk Scoring**: AI-powered risk assessment algorithms
- **Yield Prediction**: ML-based yield forecasting models
- **Model Performance**: Tracking and monitoring AI model accuracy

### Asset Input Layer Integration
- **Asset Data Processing**: Prepares asset data for AI analysis
- **Market Data Integration**: Combines asset and market data for AI models
- **Historical Analysis**: Processes historical data for predictive models

### Tokenization Layer Support
- **Token Valuation**: AI-powered token pricing models
- **Risk-Adjusted Returns**: AI-calculated risk-return profiles
- **Portfolio Optimization**: AI-driven portfolio allocation suggestions

### Compliance & Risk Management
- **AI Risk Scoring**: Automated risk assessment for compliance
- **Anomaly Detection**: AI-powered fraud and anomaly detection
- **Predictive Compliance**: ML-based compliance risk forecasting

## Usage

```typescript
import { 
  AIService, 
  AIServiceFactory,
  ValuationRequest,
  RiskAssessmentRequest,
  YieldPredictionRequest,
  AIUtils
} from '@aimy/ai';

// Create AI service instance
const aiService = AIServiceFactory.create({
  baseUrl: 'http://ai-core:8000',
  apiKey: 'your-api-key',
  timeout: 30000
});

// Perform asset valuation
const valuationRequest: ValuationRequest = {
  assetId: 'asset-001',
  assetType: 'renewable_energy',
  marketData: { /* market data */ },
  historicalData: [ /* historical data */ ],
  modelId: 'solar_valuation_v1'
};

const valuation = await aiService.performValuation(valuationRequest);

// Perform risk assessment
const riskRequest: RiskAssessmentRequest = {
  assetId: 'asset-001',
  riskFactors: ['weather', 'regulatory', 'market'],
  confidenceLevel: 0.95
};

const riskScore = await aiService.performRiskAssessment(riskRequest);

// Use utility functions
const confidence = AIUtils.calculateConfidence(0.9, 0.85, 0.95);
const normalizedData = AIUtils.normalizeMarketData(marketData);
```

## Service Architecture

### TypeScript Orchestrator
- **AIService**: Main interface for AI operations
- **Service Factory**: Creates configured service instances
- **Error Handling**: Comprehensive error management
- **Type Safety**: Full TypeScript support

### Python AI Core Service
- **FastAPI Backend**: High-performance AI service
- **ML Models**: Scikit-learn, TensorFlow, and custom models
- **Data Processing**: Pandas, NumPy for data manipulation
- **Model Serving**: RESTful API for AI operations

### Communication Protocol
- **HTTP REST API**: Standard REST endpoints
- **JSON Payloads**: Structured data exchange
- **Authentication**: JWT-based security
- **Rate Limiting**: Request throttling and management

## Dependencies

- **@aimy/shared**: Core types and interfaces
- **axios**: HTTP client for API communication
- **zod**: Request/response validation
- **date-fns**: Date manipulation utilities

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

The AI service requires configuration for:
- **Base URL**: Python AI service endpoint
- **API Key**: Authentication token
- **Timeout**: Request timeout in milliseconds
- **Retry Logic**: Retry configuration for failed requests
- **Rate Limiting**: Request rate limiting settings

## Error Handling

The package provides comprehensive error handling:
- **AIServiceError**: General AI service errors
- **AIModelError**: Model-specific errors
- **AIValidationError**: Input validation errors
- **AIDataError**: Data processing errors
- **AIProcessingError**: Processing pipeline errors
- **AIRateLimitError**: Rate limiting errors
- **AITimeoutError**: Request timeout errors

## Contributing

When adding new AI capabilities:

1. **Service Methods**: Add to `src/services/ai-service.ts`
2. **Types**: Add to `src/types/` directory
3. **Utilities**: Add to `src/utils/ai-utils.ts`
4. **Error Types**: Add to `src/errors/ai-errors.ts`
5. **Tests**: Ensure comprehensive test coverage
6. **Documentation**: Update this README with new features

## Integration with Python AI Core

This package is designed to work seamlessly with the Python `ai-core` service:

- **Synchronous Operations**: Direct API calls for real-time operations
- **Batch Processing**: Efficient handling of multiple AI operations
- **Model Management**: Dynamic model selection and configuration
- **Performance Monitoring**: Real-time model performance tracking
- **Health Checks**: Service health monitoring and status reporting
