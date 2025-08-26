// Custom error classes for the AIMY platform

/**
 * Base error class for AIMY platform
 */
export abstract class AIMYError extends Error {
  public readonly code: string;
  public readonly statusCode: number;
  public readonly isOperational: boolean;

  constructor(
    message: string,
    code: string,
    statusCode: number = 500,
    isOperational: boolean = true
  ) {
    super(message);
    this.name = this.constructor.name;
    this.code = code;
    this.statusCode = statusCode;
    this.isOperational = isOperational;

    // Maintains proper stack trace for where our error was thrown (only available on V8)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}

/**
 * Validation error for invalid data
 */
export class ValidationError extends AIMYError {
  public readonly field: string;
  public readonly value: any;
  public readonly constraint: string;

  constructor(
    message: string,
    field: string,
    value: any,
    constraint: string
  ) {
    super(message, 'VALIDATION_ERROR', 400);
    this.field = field;
    this.value = value;
    this.constraint = constraint;
  }
}

/**
 * Authentication error
 */
export class AuthenticationError extends AIMYError {
  constructor(message: string = 'Authentication failed') {
    super(message, 'AUTHENTICATION_ERROR', 401);
  }
}

/**
 * Authorization error
 */
export class AuthorizationError extends AIMYError {
  public readonly requiredRole: string;
  public readonly userRole: string;

  constructor(
    message: string = 'Insufficient permissions',
    requiredRole: string = '',
    userRole: string = ''
  ) {
    super(message, 'AUTHORIZATION_ERROR', 403);
    this.requiredRole = requiredRole;
    this.userRole = userRole;
  }
}

/**
 * Resource not found error
 */
export class NotFoundError extends AIMYError {
  public readonly resource: string;
  public readonly identifier: string;

  constructor(
    resource: string,
    identifier: string,
    message?: string
  ) {
    super(
      message || `${resource} with identifier '${identifier}' not found`,
      'NOT_FOUND_ERROR',
      404
    );
    this.resource = resource;
    this.identifier = identifier;
  }
}

/**
 * Conflict error for duplicate resources
 */
export class ConflictError extends AIMYError {
  public readonly resource: string;
  public readonly field: string;
  public readonly value: any;

  constructor(
    resource: string,
    field: string,
    value: any,
    message?: string
  ) {
    super(
      message || `${resource} with ${field} '${value}' already exists`,
      'CONFLICT_ERROR',
      409
    );
    this.resource = resource;
    this.field = field;
    this.value = value;
  }
}

/**
 * Rate limit exceeded error
 */
export class RateLimitError extends AIMYError {
  public readonly limit: number;
  public readonly window: number;
  public readonly retryAfter: number;

  constructor(
    limit: number,
    window: number,
    retryAfter: number,
    message?: string
  ) {
    super(
      message || `Rate limit exceeded. Maximum ${limit} requests per ${window}ms`,
      'RATE_LIMIT_ERROR',
      429
    );
    this.limit = limit;
    this.window = window;
    this.retryAfter = retryAfter;
  }
}

/**
 * Service unavailable error
 */
export class ServiceUnavailableError extends AIMYError {
  public readonly service: string;
  public readonly retryAfter: number;

  constructor(
    service: string,
    retryAfter: number = 60,
    message?: string
  ) {
    super(
      message || `Service '${service}' is temporarily unavailable`,
      'SERVICE_UNAVAILABLE_ERROR',
      503
    );
    this.service = service;
    this.retryAfter = retryAfter;
  }
}

/**
 * Database error
 */
export class DatabaseError extends AIMYError {
  public readonly operation: string;
  public readonly table: string;
  public readonly constraint?: string;

  constructor(
    operation: string,
    table: string,
    constraint?: string,
    message?: string
  ) {
    super(
      message || `Database operation '${operation}' failed on table '${table}'`,
      'DATABASE_ERROR',
      500,
      false
    );
    this.operation = operation;
    this.table = table;
    this.constraint = constraint;
  }
}

/**
 * External service error
 */
export class ExternalServiceError extends AIMYError {
  public readonly service: string;
  public readonly endpoint: string;
  public readonly responseStatus?: number;

  constructor(
    service: string,
    endpoint: string,
    responseStatus?: number,
    message?: string
  ) {
    super(
      message || `External service '${service}' call to '${endpoint}' failed`,
      'EXTERNAL_SERVICE_ERROR',
      502
    );
    this.service = service;
    this.endpoint = endpoint;
    this.responseStatus = responseStatus;
  }
}

/**
 * Compliance error
 */
export class ComplianceError extends AIMYError {
  public readonly rule: string;
  public readonly entityType: string;
  public readonly entityId: string;

  constructor(
    rule: string,
    entityType: string,
    entityId: string,
    message?: string
  ) {
    super(
      message || `Compliance rule '${rule}' failed for ${entityType} '${entityId}'`,
      'COMPLIANCE_ERROR',
      400
    );
    this.rule = rule;
    this.entityType = entityType;
    this.entityId = entityId;
  }
}

/**
 * Blockchain error
 */
export class BlockchainError extends AIMYError {
  public readonly network: string;
  public readonly transactionHash?: string;
  public readonly gasUsed?: number;

  constructor(
    network: string,
    message: string,
    transactionHash?: string,
    gasUsed?: number
  ) {
    super(message, 'BLOCKCHAIN_ERROR', 500, false);
    this.network = network;
    this.transactionHash = transactionHash;
    this.gasUsed = gasUsed;
  }
}

/**
 * AI service error
 */
export class AIServiceError extends AIMYError {
  public readonly model: string;
  public readonly confidence: number;
  public readonly threshold: number;

  constructor(
    model: string,
    confidence: number,
    threshold: number,
    message?: string
  ) {
    super(
      message || `AI model '${model}' confidence ${confidence} below threshold ${threshold}`,
      'AI_SERVICE_ERROR',
      500
    );
    this.model = model;
    this.confidence = confidence;
    this.threshold = threshold;
  }
}

/**
 * File upload error
 */
export class FileUploadError extends AIMYError {
  public readonly filename: string;
  public readonly size: number;
  public readonly maxSize: number;
  public readonly mimeType: string;

  constructor(
    filename: string,
    size: number,
    maxSize: number,
    mimeType: string,
    message?: string
  ) {
    super(
      message || `File '${filename}' upload failed. Size: ${size}, Max: ${maxSize}, Type: ${mimeType}`,
      'FILE_UPLOAD_ERROR',
      400
    );
    this.filename = filename;
    this.size = size;
    this.maxSize = maxSize;
    this.mimeType = mimeType;
  }
}

/**
 * Payment error
 */
export class PaymentError extends AIMYError {
  public readonly paymentId: string;
  public readonly amount: number;
  public readonly currency: string;
  public readonly provider: string;

  constructor(
    paymentId: string,
    amount: number,
    currency: string,
    provider: string,
    message?: string
  ) {
    super(
      message || `Payment '${paymentId}' failed. Amount: ${amount} ${currency}, Provider: ${provider}`,
      'PAYMENT_ERROR',
      400
    );
    this.paymentId = paymentId;
    this.amount = amount;
    this.currency = currency;
    this.provider = provider;
  }
}

/**
 * Error factory for creating appropriate error types
 */
export class ErrorFactory {
  static createValidationError(
    field: string,
    value: any,
    constraint: string,
    message?: string
  ): ValidationError {
    return new ValidationError(
      message || `Validation failed for field '${field}'`,
      field,
      value,
      constraint
    );
  }

  static createNotFoundError(
    resource: string,
    identifier: string,
    message?: string
  ): NotFoundError {
    return new NotFoundError(resource, identifier, message);
  }

  static createConflictError(
    resource: string,
    field: string,
    value: any,
    message?: string
  ): ConflictError {
    return new ConflictError(resource, field, value, message);
  }

  static createDatabaseError(
    operation: string,
    table: string,
    constraint?: string,
    message?: string
  ): DatabaseError {
    return new DatabaseError(operation, table, constraint, message);
  }

  static createComplianceError(
    rule: string,
    entityType: string,
    entityId: string,
    message?: string
  ): ComplianceError {
    return new ComplianceError(rule, entityType, entityId, message);
  }
}

/**
 * Error handler utility
 */
export class ErrorHandler {
  static isOperational(error: Error): boolean {
    if (error instanceof AIMYError) {
      return error.isOperational;
    }
    return false;
  }

  static getStatusCode(error: Error): number {
    if (error instanceof AIMYError) {
      return error.statusCode;
    }
    return 500;
  }

  static getErrorCode(error: Error): string {
    if (error instanceof AIMYError) {
      return error.code;
    }
    return 'UNKNOWN_ERROR';
  }

  static formatError(error: Error): Record<string, any> {
    const baseError = {
      name: error.name,
      message: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
    };

    if (error instanceof AIMYError) {
      return {
        ...baseError,
        code: error.code,
        statusCode: error.statusCode,
        isOperational: error.isOperational,
        ...this.getAdditionalProperties(error),
      };
    }

    return baseError;
  }

  private static getAdditionalProperties(error: AIMYError): Record<string, any> {
    const additional: Record<string, any> = {};

    if (error instanceof ValidationError) {
      additional.field = error.field;
      additional.value = error.value;
      additional.constraint = error.constraint;
    } else if (error instanceof NotFoundError) {
      additional.resource = error.resource;
      additional.identifier = error.identifier;
    } else if (error instanceof ConflictError) {
      additional.resource = error.resource;
      additional.field = error.field;
      additional.value = error.value;
    }

    return additional;
  }
}
