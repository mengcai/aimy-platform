# @aimy/shared

The foundational shared package for the AIMY platform, providing core domain models, types, constants, schemas, utilities, and services that are used across all other packages and applications.

## Purpose

This package serves as the single source of truth for:
- **Domain Models**: Core business entities (Asset, Investor, Issuer, SecurityToken, Portfolio, etc.)
- **Type Definitions**: TypeScript interfaces, enums, and type unions
- **Validation Schemas**: Zod schemas for runtime validation
- **Constants**: Platform-wide constants and configuration values
- **Utilities**: Common utility functions for formatting, validation, and data manipulation
- **Error Classes**: Custom error types for the AIMY platform
- **Event System**: Event-driven architecture interfaces and types
- **Validation Framework**: Combined Zod and class-validator capabilities
- **Caching System**: Cache interfaces and implementations

## Architecture Mapping

### Asset Input Layer
- `Asset` model and related types
- Asset validation schemas
- Asset event definitions

### AI Valuation & Scoring Engine
- AI-related types and interfaces
- Valuation and risk assessment models
- Event interfaces for AI operations

### Fractionalization & Tokenization Layer
- `SecurityToken` model and interfaces
- Token lifecycle management types
- Portfolio and holdings models

### Compliance & KYC/AML Module
- Compliance status enums and types
- KYC level definitions
- Compliance event interfaces

### Settlement & Payments
- Payment models and status types
- Transaction-related interfaces
- Payment event definitions

### Investor Portal
- Investor and portfolio models
- User-related types and interfaces
- Portal-specific event types

## Usage

```typescript
import { 
  Asset, 
  Investor, 
  SecurityToken,
  AssetType,
  KYCLevel,
  formatCurrency,
  AIMYError,
  BaseEvent,
  ValidationUtils
} from '@aimy/shared';

// Use domain models
const asset: Asset = {
  id: 'uuid',
  name: 'Solar Farm Alpha',
  assetType: AssetType.RENEWABLE_ENERGY,
  // ... other properties
};

// Use utilities
const formattedValue = formatCurrency(25000000, 'USD');

// Use validation
const isValid = ValidationUtils.isValidEmail('user@example.com');

// Use events
const event: BaseEvent = {
  id: 'event-id',
  type: 'asset.created',
  timestamp: new Date(),
  source: 'asset-service',
  version: '1.0.0'
};
```

## Dependencies

- **Zod**: Runtime validation schemas
- **class-validator**: Class-based validation decorators
- **class-transformer**: Object transformation utilities
- **date-fns**: Date manipulation utilities
- **uuid**: UUID generation and validation

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

## Contributing

When adding new types, models, or utilities:

1. **Types**: Add to `src/types/index.ts` or create a new file in `src/types/`
2. **Models**: Add to `src/models/index.ts` or create a new file in `src/models/`
3. **Schemas**: Add to `src/schemas/index.ts` or create a new file in `src/schemas/`
4. **Utilities**: Add to `src/utils/index.ts` or create a new file in `src/utils/`
5. **Events**: Add to `src/events/index.ts` or create a new file in `src/events/`
6. **Validation**: Add to `src/validation/index.ts` or create a new file in `src/validation/`
7. **Caching**: Add to `src/caching/index.ts` or create a new file in `src/caching/`

Always update the main `src/index.ts` file to export new items and maintain backward compatibility.
