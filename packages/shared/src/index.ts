// Main exports for the AIMY shared package

// Core types and interfaces
export * from './types';

// Constants and configuration
export * from './constants';

// Zod validation schemas
export * from './schemas';

// Design tokens and styling
export * from './design-tokens';

// Domain models
export * from './models';

// Utility functions
export * from './utils';

// Error handling
export * from './errors';

// Service interfaces
export * from './services';

// Repository interfaces
export * from './repositories';

// Event system
export * from './events';

// Validation utilities
export * from './validation';

// Caching system
export * from './caching';

  // Re-export commonly used items for convenience
  // Note: Most items are already exported via export * from above
  // This section provides additional type exports that need explicit typing
  
  export {
    // Models
    BaseModel,
    AssetModel,
  } from './models';
  
  export {
    // Utilities
    formatCurrency,
    formatPercentage,
    formatLargeNumber,
    formatDate,
    generateId,
    generateUUID,
    deepClone,
    debounce,
    throttle,
    retry,
    sleep,
    isValidEmail,
    isValidPhone,
    calculatePercentageChange,
    calculateCAGR,
    calculateSharpeRatio,
  } from './utils';
  
  export {
    // Errors
    AIMYError,
    ValidationError as AIMYValidationError,
    AuthenticationError,
    NotFoundError,
    DatabaseError,
    AIServiceError,
    ComplianceError,
    BlockchainError,
    PaymentError,
  } from './errors';
  
  export {
    // Design tokens
    colors,
    spacing,
    borderRadius,
    shadows,
    typography,
    transitions,
    zIndex,
    glassmorphism,
  } from './design-tokens';
  
  export {
    // Constants
    API_CONFIG,
    BLOCKCHAIN_CONFIG,
    COMPLIANCE_CONFIG,
    AI_CONFIG,
    PAYMENT_CONFIG,
    LIQUIDITY_CONFIG,
    SECURITY_CONFIG,
    FILE_CONFIG,
    NOTIFICATION_CONFIG,
  } from './constants';
  
  export {
    // Schemas
    AssetSchema,
    InvestorSchema,
    IssuerSchema,
    SecurityTokenSchema,
    DocumentSchema,
    PortfolioSchema,
    ValuationModelSchema,
    RiskScoreSchema,
    YieldPredictionSchema,
    ComplianceCheckSchema,
    SanctionsScreeningSchema,
    PaymentSchema,
    SettlementSchema,
    ExchangeSchema,
    PaginationSchema,
    AssetFilterSchema,
    InvestorFilterSchema,
  } from './schemas';
  
  export type {
    // Core types
    Asset,
    Investor,
    Issuer,
    SecurityToken,
    Document,
    Portfolio,
    ValuationModel,
    RiskScore,
    YieldPrediction,
    ComplianceCheck,
    SanctionsScreening,
    Payment,
    Settlement,
    PayoutSchedule,
    Exchange,
    TradingPair,
    LiquidityPool,
    
    // Enums
    AssetType,
    KYCLevel,
    ComplianceStatus,
    IssuerType,
    TokenStandard,
    DocumentType,
    ComplianceCheckType,
    ScreeningType,
    RiskLevel,
    PaymentType,
    PaymentMethod,
    SettlementStatus,
    PayoutFrequency,
    ExchangeType,
    DeFiProtocol,
    RiskCategory,
  } from './types';
  
  export type {
    // Events
    BaseEvent,
    AssetCreatedEvent,
    AssetUpdatedEvent,
    AssetStatusChangedEvent,
    AssetTokenizationStartedEvent,
    AssetTokenizationCompletedEvent,
    InvestorRegisteredEvent,
    InvestorKYCCompletedEvent,
    InvestorComplianceStatusChangedEvent,
    TokenMintedEvent,
    TokenTransferredEvent,
    TokenBurnedEvent,
    ComplianceCheckStartedEvent,
    ComplianceCheckCompletedEvent,
    ComplianceRuleViolationEvent,
    PaymentInitiatedEvent,
    PaymentCompletedEvent,
    PaymentFailedEvent,
    PortfolioCreatedEvent,
    PortfolioUpdatedEvent,
    PortfolioTokenAddedEvent,
    PortfolioTokenRemovedEvent,
    AIValuationRequestedEvent,
    AIValuationCompletedEvent,
    AIRiskAssessmentCompletedEvent,
    SystemHealthCheckEvent,
    SystemErrorEvent,
    SystemMaintenanceEvent,
    EventHandler,
    EventPublisher,
    EventSubscriber,
    EventStore,
    EventReplay,
    EventMetadata,
    EventEnvelope,
    EventSerializer,
    EventValidator,
  } from './events';
  
  export type {
    // Validation
    ValidateProperty,
    ValidateMethod,
    ZodValidator,
    ClassValidator,
    CompositeValidator,
    ValidationUtils,
    ValidationError,
    ValidationResult,
    ValidationOptions,
  } from './validation';
  
  export type {
    // Caching
    CacheEntry,
    CacheOptions,
    CacheStats,
    CacheKeyGenerator,
    CacheSerializer,
    BaseCache,
    InMemoryCache,
    RedisCache,
    CacheManager,
    Cacheable,
    CacheInvalidate,
    CacheUtils,
  } from './caching';
