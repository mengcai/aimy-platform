// Event interfaces for the AIMY platform

/**
 * Base event interface
 */
export interface BaseEvent {
  id: string;
  type: string;
  timestamp: Date;
  source: string;
  version: string;
  correlationId?: string;
  metadata?: Record<string, any>;
}

/**
 * Asset events
 */
export interface AssetCreatedEvent extends BaseEvent {
  type: 'asset.created';
  data: {
    assetId: string;
    name: string;
    type: string;
    issuerId: string;
    estimatedValue: number;
    currency: string;
  };
}

export interface AssetUpdatedEvent extends BaseEvent {
  type: 'asset.updated';
  data: {
    assetId: string;
    changes: Record<string, any>;
    previousValues: Record<string, any>;
  };
}

export interface AssetStatusChangedEvent extends BaseEvent {
  type: 'asset.status_changed';
  data: {
    assetId: string;
    previousStatus: string;
    newStatus: string;
    reason?: string;
    userId?: string;
  };
}

export interface AssetTokenizationStartedEvent extends BaseEvent {
  type: 'asset.tokenization_started';
  data: {
    assetId: string;
    tokenSymbol: string;
    totalSupply: number;
    decimals: number;
  };
}

export interface AssetTokenizationCompletedEvent extends BaseEvent {
  type: 'asset.tokenization_completed';
  data: {
    assetId: string;
    tokenId: string;
    tokenAddress: string;
    blockchainNetwork: string;
  };
}

/**
 * Investor events
 */
export interface InvestorRegisteredEvent extends BaseEvent {
  type: 'investor.registered';
  data: {
    investorId: string;
    email: string;
    name: string;
    nationality: string;
  };
}

export interface InvestorKYCCompletedEvent extends BaseEvent {
  type: 'investor.kyc_completed';
  data: {
    investorId: string;
    kycLevel: string;
    complianceScore: number;
    documents: string[];
  };
}

export interface InvestorComplianceStatusChangedEvent extends BaseEvent {
  type: 'investor.compliance_status_changed';
  data: {
    investorId: string;
    previousStatus: string;
    newStatus: string;
    reason?: string;
    complianceOfficerId?: string;
  };
}

/**
 * Token events
 */
export interface TokenMintedEvent extends BaseEvent {
  type: 'token.minted';
  data: {
    tokenId: string;
    assetId: string;
    to: string;
    amount: number;
    transactionHash: string;
  };
}

export interface TokenTransferredEvent extends BaseEvent {
  type: 'token.transferred';
  data: {
    tokenId: string;
    from: string;
    to: string;
    amount: number;
    transactionHash: string;
    complianceCheck: boolean;
  };
}

export interface TokenBurnedEvent extends BaseEvent {
  type: 'token.burned';
  data: {
    tokenId: string;
    from: string;
    amount: number;
    transactionHash: string;
    reason?: string;
  };
}

/**
 * Compliance events
 */
export interface ComplianceCheckStartedEvent extends BaseEvent {
  type: 'compliance.check_started';
  data: {
    checkId: string;
    entityId: string;
    entityType: string;
    checkType: string;
    userId?: string;
  };
}

export interface ComplianceCheckCompletedEvent extends BaseEvent {
  type: 'compliance.check_completed';
  data: {
    checkId: string;
    entityId: string;
    entityType: string;
    checkType: string;
    status: string;
    score: number;
    details: Record<string, any>[];
    duration: number;
  };
}

export interface ComplianceRuleViolationEvent extends BaseEvent {
  type: 'compliance.rule_violation';
  data: {
    ruleId: string;
    entityId: string;
    entityType: string;
    violation: string;
    severity: string;
    action: string;
  };
}

/**
 * Payment events
 */
export interface PaymentInitiatedEvent extends BaseEvent {
  type: 'payment.initiated';
  data: {
    paymentId: string;
    from: string;
    to: string;
    amount: number;
    currency: string;
    method: string;
    reference: string;
  };
}

export interface PaymentCompletedEvent extends BaseEvent {
  type: 'payment.completed';
  data: {
    paymentId: string;
    transactionId: string;
    amount: number;
    currency: string;
    fees: number;
    netAmount: number;
    provider: string;
  };
}

export interface PaymentFailedEvent extends BaseEvent {
  type: 'payment.failed';
  data: {
    paymentId: string;
    reason: string;
    errorCode: string;
    retryable: boolean;
  };
}

/**
 * Portfolio events
 */
export interface PortfolioCreatedEvent extends BaseEvent {
  type: 'portfolio.created';
  data: {
    portfolioId: string;
    investorId: string;
    initialBalance: number;
    currency: string;
  };
}

export interface PortfolioUpdatedEvent extends BaseEvent {
  type: 'portfolio.updated';
  data: {
    portfolioId: string;
    totalValue: number;
    currency: string;
    changeAmount: number;
    changePercentage: number;
  };
}

export interface PortfolioTokenAddedEvent extends BaseEvent {
  type: 'portfolio.token_added';
  data: {
    portfolioId: string;
    tokenId: string;
    quantity: number;
    price: number;
    totalValue: number;
  };
}

export interface PortfolioTokenRemovedEvent extends BaseEvent {
  type: 'portfolio.token_removed';
  data: {
    portfolioId: string;
    tokenId: string;
    quantity: number;
    price: number;
    totalValue: number;
  };
}

/**
 * AI service events
 */
export interface AIValuationRequestedEvent extends BaseEvent {
  type: 'ai.valuation_requested';
  data: {
    requestId: string;
    assetId: string;
    model: string;
    parameters: Record<string, any>;
  };
}

export interface AIValuationCompletedEvent extends BaseEvent {
  type: 'ai.valuation_completed';
  data: {
    requestId: string;
    assetId: string;
    model: string;
    value: number;
    currency: string;
    confidence: number;
    processingTime: number;
  };
}

export interface AIRiskAssessmentCompletedEvent extends BaseEvent {
  type: 'ai.risk_assessment_completed';
  data: {
    requestId: string;
    assetId: string;
    model: string;
    riskScore: number;
    riskFactors: Record<string, any>[];
    confidence: number;
    processingTime: number;
  };
}

/**
 * System events
 */
export interface SystemHealthCheckEvent extends BaseEvent {
  type: 'system.health_check';
  data: {
    service: string;
    status: string;
    responseTime: number;
    memoryUsage: number;
    cpuUsage: number;
  };
}

export interface SystemErrorEvent extends BaseEvent {
  type: 'system.error';
  data: {
    service: string;
    error: string;
    stackTrace?: string;
    context: Record<string, any>;
  };
}

export interface SystemMaintenanceEvent extends BaseEvent {
  type: 'system.maintenance';
  data: {
    service: string;
    action: 'started' | 'completed' | 'failed';
    duration?: number;
    description: string;
  };
}

/**
 * Event handler interface
 */
export interface EventHandler<T extends BaseEvent> {
  handle(event: T): Promise<void>;
}

/**
 * Event publisher interface
 */
export interface EventPublisher {
  publish<T extends BaseEvent>(event: T): Promise<void>;
  publishBatch<T extends BaseEvent>(events: T[]): Promise<void>;
}

/**
 * Event subscriber interface
 */
export interface EventSubscriber {
  subscribe<T extends BaseEvent>(
    eventType: string,
    handler: EventHandler<T>
  ): Promise<void>;
  
  unsubscribe(eventType: string, handler: EventHandler<any>): Promise<void>;
  unsubscribeAll(eventType: string): Promise<void>;
}

/**
 * Event store interface
 */
export interface EventStore {
  append<T extends BaseEvent>(event: T): Promise<void>;
  getEvents(
    streamId: string,
    fromVersion?: number,
    toVersion?: number
  ): Promise<BaseEvent[]>;
  
  getEventsByType(
    eventType: string,
    fromDate?: Date,
    toDate?: Date
  ): Promise<BaseEvent[]>;
  
  getEventStream(streamId: string): Promise<BaseEvent[]>;
  getEventCount(streamId: string): Promise<number>;
}

/**
 * Event replay interface
 */
export interface EventReplay {
  replayEvents(
    eventTypes: string[],
    fromDate: Date,
    toDate: Date,
    handler: EventHandler<BaseEvent>
  ): Promise<void>;
  
  replayStream(
    streamId: string,
    fromVersion: number,
    handler: EventHandler<BaseEvent>
  ): Promise<void>;
}

/**
 * Event metadata interface
 */
export interface EventMetadata {
  correlationId?: string;
  causationId?: string;
  userId?: string;
  sessionId?: string;
  ipAddress?: string;
  userAgent?: string;
  requestId?: string;
  traceId?: string;
  spanId?: string;
}

/**
 * Event envelope interface
 */
export interface EventEnvelope<T extends BaseEvent> {
  event: T;
  metadata: EventMetadata;
  timestamp: Date;
  version: string;
}

/**
 * Event serializer interface
 */
export interface EventSerializer {
  serialize<T extends BaseEvent>(event: T): string;
  deserialize<T extends BaseEvent>(data: string): T;
}

/**
 * Event validator interface
 */
export interface EventValidator {
  validate<T extends BaseEvent>(event: T): boolean;
  getValidationErrors<T extends BaseEvent>(event: T): string[];
}

// Export all event types
export type {
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
};
