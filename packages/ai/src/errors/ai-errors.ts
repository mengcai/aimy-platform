// AI-specific error classes for the AIMY platform

import { AIMYError } from '@aimy/shared';

/**
 * AI Service Error
 */
export class AIServiceError extends AIMYError {
  public readonly errorCode: string;
  public readonly details?: any;
  
  constructor(
    message: string,
    errorCode: string,
    details?: any,
    cause?: Error
  ) {
    super(message, 'AI_SERVICE_ERROR', cause);
    this.name = 'AIServiceError';
    this.errorCode = errorCode;
    this.details = details;
  }
  
  /**
   * Get formatted error message with code
   */
  getFormattedMessage(): string {
    return `[${this.errorCode}] ${this.message}`;
  }
  
  /**
   * Get error details as JSON
   */
  getErrorDetails(): Record<string, any> {
    return {
      name: this.name,
      message: this.message,
      errorCode: this.errorCode,
      details: this.details,
      timestamp: this.timestamp,
      cause: this.cause?.message,
    };
  }
}

/**
 * AI Model Error
 */
export class AIModelError extends AIMYError {
  public readonly modelId: string;
  public readonly modelType: string;
  public readonly operation: string;
  
  constructor(
    message: string,
    modelId: string,
    modelType: string,
    operation: string,
    cause?: Error
  ) {
    super(message, 'AI_MODEL_ERROR', cause);
    this.name = 'AIModelError';
    this.modelId = modelId;
    this.modelType = modelType;
    this.operation = operation;
  }
  
  /**
   * Get formatted error message with model info
   */
  getFormattedMessage(): string {
    return `[${this.modelType}:${this.modelId}] ${this.operation}: ${this.message}`;
  }
}

/**
 * AI Validation Error
 */
export class AIValidationError extends AIMYError {
  public readonly field: string;
  public readonly value: any;
  public readonly constraint: string;
  
  constructor(
    message: string,
    field: string,
    value: any,
    constraint: string,
    cause?: Error
  ) {
    super(message, 'AI_VALIDATION_ERROR', cause);
    this.name = 'AIValidationError';
    this.field = field;
    this.value = value;
    this.constraint = constraint;
  }
  
  /**
   * Get formatted error message with field info
   */
  getFormattedMessage(): string {
    return `Validation failed for field '${this.field}': ${this.message} (constraint: ${this.constraint})`;
  }
}

/**
 * AI Data Error
 */
export class AIDataError extends AIMYError {
  public readonly dataType: string;
  public readonly dataSource: string;
  public readonly dataQuality: number;
  
  constructor(
    message: string,
    dataType: string,
    dataSource: string,
    dataQuality: number,
    cause?: Error
  ) {
    super(message, 'AI_DATA_ERROR', cause);
    this.name = 'AIDataError';
    this.dataType = dataType;
    this.dataSource = dataSource;
    this.dataQuality = dataQuality;
  }
  
  /**
   * Check if data quality is below threshold
   */
  isDataQualityLow(threshold: number = 0.7): boolean {
    return this.dataQuality < threshold;
  }
  
  /**
   * Get formatted error message with data info
   */
  getFormattedMessage(): string {
    return `Data error for ${this.dataType} from ${this.dataSource}: ${this.message} (quality: ${this.dataQuality})`;
  }
}

/**
 * AI Processing Error
 */
export class AIProcessingError extends AIMYError {
  public readonly processingStep: string;
  public readonly processingTime: number;
  public readonly retryable: boolean;
  
  constructor(
    message: string,
    processingStep: string,
    processingTime: number,
    retryable: boolean = false,
    cause?: Error
  ) {
    super(message, 'AI_PROCESSING_ERROR', cause);
    this.name = 'AIProcessingError';
    this.processingStep = processingStep;
    this.processingTime = processingTime;
    this.retryable = retryable;
  }
  
  /**
   * Check if error is retryable
   */
  isRetryable(): boolean {
    return this.retryable;
  }
  
  /**
   * Get formatted error message with processing info
   */
  getFormattedMessage(): string {
    return `Processing error at step '${this.processingStep}' (${this.processingTime}ms): ${this.message}`;
  }
}

/**
 * AI Configuration Error
 */
export class AIConfigurationError extends AIMYError {
  public readonly configKey: string;
  public readonly configValue: any;
  public readonly expectedType: string;
  
  constructor(
    message: string,
    configKey: string,
    configValue: any,
    expectedType: string,
    cause?: Error
  ) {
    super(message, 'AI_CONFIGURATION_ERROR', cause);
    this.name = 'AIConfigurationError';
    this.configKey = configKey;
    this.configValue = configValue;
    this.expectedType = expectedType;
  }
  
  /**
   * Get formatted error message with config info
   */
  getFormattedMessage(): string {
    return `Configuration error for '${this.configKey}': expected ${this.expectedType}, got ${typeof this.configValue}`;
  }
}

/**
 * AI Rate Limit Error
 */
export class AIRateLimitError extends AIMYError {
  public readonly limit: number;
  public readonly remaining: number;
  public readonly resetTime: Date;
  
  constructor(
    message: string,
    limit: number,
    remaining: number,
    resetTime: Date,
    cause?: Error
  ) {
    super(message, 'AI_RATE_LIMIT_ERROR', cause);
    this.name = 'AIRateLimitError';
    this.limit = limit;
    this.remaining = remaining;
    this.resetTime = resetTime;
  }
  
  /**
   * Check if rate limit is exceeded
   */
  isRateLimitExceeded(): boolean {
    return this.remaining <= 0;
  }
  
  /**
   * Get time until rate limit resets
   */
  getTimeUntilReset(): number {
    return Math.max(0, this.resetTime.getTime() - Date.now());
  }
  
  /**
   * Get formatted error message with rate limit info
   */
  getFormattedMessage(): string {
    return `Rate limit exceeded: ${this.remaining}/${this.limit} requests remaining. Resets at ${this.resetTime.toISOString()}`;
  }
}

/**
 * AI Timeout Error
 */
export class AITimeoutError extends AIMYError {
  public readonly timeout: number;
  public readonly operation: string;
  
  constructor(
    message: string,
    timeout: number,
    operation: string,
    cause?: Error
  ) {
    super(message, 'AI_TIMEOUT_ERROR', cause);
    this.name = 'AITimeoutError';
    this.timeout = timeout;
    this.operation = operation;
  }
  
  /**
   * Get formatted error message with timeout info
   */
  getFormattedMessage(): string {
    return `Operation '${this.operation}' timed out after ${this.timeout}ms: ${this.message}`;
  }
}

/**
 * AI Error Factory
 */
export class AIErrorFactory {
  /**
   * Create AI Service Error
   */
  static createServiceError(
    message: string,
    errorCode: string,
    details?: any,
    cause?: Error
  ): AIServiceError {
    return new AIServiceError(message, errorCode, details, cause);
  }
  
  /**
   * Create AI Model Error
   */
  static createModelError(
    message: string,
    modelId: string,
    modelType: string,
    operation: string,
    cause?: Error
  ): AIModelError {
    return new AIModelError(message, modelId, modelType, operation, cause);
  }
  
  /**
   * Create AI Validation Error
   */
  static createValidationError(
    message: string,
    field: string,
    value: any,
    constraint: string,
    cause?: Error
  ): AIValidationError {
    return new AIValidationError(message, field, value, constraint, cause);
  }
  
  /**
   * Create AI Data Error
   */
  static createDataError(
    message: string,
    dataType: string,
    dataSource: string,
    dataQuality: number,
    cause?: Error
  ): AIDataError {
    return new AIDataError(message, dataType, dataSource, dataQuality, cause);
  }
  
  /**
   * Create AI Processing Error
   */
  static createProcessingError(
    message: string,
    processingStep: string,
    processingTime: number,
    retryable: boolean = false,
    cause?: Error
  ): AIProcessingError {
    return new AIProcessingError(message, processingStep, processingTime, retryable, cause);
  }
  
  /**
   * Create AI Configuration Error
   */
  static createConfigurationError(
    message: string,
    configKey: string,
    configValue: any,
    expectedType: string,
    cause?: Error
  ): AIConfigurationError {
    return new AIConfigurationError(message, configKey, configValue, expectedType, cause);
  }
  
  /**
   * Create AI Rate Limit Error
   */
  static createRateLimitError(
    message: string,
    limit: number,
    remaining: number,
    resetTime: Date,
    cause?: Error
  ): AIRateLimitError {
    return new AIRateLimitError(message, limit, remaining, resetTime, cause);
  }
  
  /**
   * Create AI Timeout Error
   */
  static createTimeoutError(
    message: string,
    timeout: number,
    operation: string,
    cause?: Error
  ): AITimeoutError {
    return new AITimeoutError(message, timeout, operation, cause);
  }
}

/**
 * AI Error Handler
 */
export class AIErrorHandler {
  private static errorCounts = new Map<string, number>();
  private static maxRetries = 3;
  
  /**
   * Handle AI error with retry logic
   */
  static async handleWithRetry<T>(
    operation: () => Promise<T>,
    maxRetries: number = this.maxRetries,
    delay: number = 1000
  ): Promise<T> {
    let lastError: Error;
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));
        
        // Check if error is retryable
        if (error instanceof AIServiceError && this.isRetryableError(error)) {
          if (attempt < maxRetries) {
            await this.delay(delay * attempt); // Exponential backoff
            continue;
          }
        }
        
        // Not retryable or max retries reached
        break;
      }
    }
    
    throw lastError!;
  }
  
  /**
   * Log error and update error counts
   */
  static logError(error: Error, context?: Record<string, any>): void {
    const errorType = error.constructor.name;
    const currentCount = this.errorCounts.get(errorType) || 0;
    this.errorCounts.set(errorType, currentCount + 1);
    
    console.error(`[AI Error] ${errorType}:`, {
      message: error.message,
      stack: error.stack,
      context,
      count: currentCount + 1,
      timestamp: new Date().toISOString(),
    });
  }
  
  /**
   * Get error statistics
   */
  static getErrorStats(): Record<string, number> {
    return Object.fromEntries(this.errorCounts);
  }
  
  /**
   * Reset error counts
   */
  static resetErrorCounts(): void {
    this.errorCounts.clear();
  }
  
  /**
   * Check if error is retryable
   */
  private static isRetryableError(error: AIServiceError): boolean {
    const retryableCodes = [
      'RATE_LIMIT_ERROR',
      'TIMEOUT_ERROR',
      'TEMPORARY_ERROR',
      'NETWORK_ERROR',
    ];
    
    return retryableCodes.includes(error.errorCode);
  }
  
  /**
   * Delay utility
   */
  private static delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
