import { z } from 'zod';

// Base validation schemas
export const baseSchemas = {
  id: z.string().min(1, 'ID is required'),
  email: z.string().email('Invalid email format'),
  url: z.string().url('Invalid URL format'),
  date: z.string().datetime('Invalid date format'),
  uuid: z.string().uuid('Invalid UUID format'),
  positiveNumber: z.number().positive('Must be a positive number'),
  nonNegativeNumber: z.number().nonnegative('Must be a non-negative number'),
  percentage: z.number().min(0).max(100, 'Percentage must be between 0 and 100'),
};

// Copilot chat validation schemas
export const copilotSchemas = {
  chatMessage: z.object({
    message: z.string().min(1, 'Message is required').max(1000, 'Message too long'),
    context: z.object({
      userId: z.string().optional(),
      assetId: z.string().optional(),
      portfolioId: z.string().optional(),
      sessionId: z.string().optional(),
    }).optional(),
    timestamp: z.string().datetime().optional(),
  }),

  chatResponse: z.object({
    content: z.string().min(1, 'Response content is required'),
    sources: z.array(z.object({
      type: z.enum(['asset_document', 'portfolio_data', 'ai_insight', 'market_data', 'compliance_report']),
      id: z.string(),
      title: z.string(),
      url: z.string().url().optional(),
      relevance: z.number().min(0).max(1),
      excerpt: z.string().optional(),
    })).optional(),
    confidence: z.number().min(0).max(1).optional(),
    disclaimer: z.string().optional(),
    metadata: z.record(z.any()).optional(),
  }),

  chatContext: z.object({
    userId: z.string().optional(),
    portfolioContext: z.any().optional(),
    assetContext: z.any().optional(),
    complianceContext: z.any().optional(),
    riskContext: z.any().optional(),
    marketContext: z.any().optional(),
    userPreferences: z.any().optional(),
  }),
};

// Asset validation schemas
export const assetSchemas = {
  assetId: z.string().min(1, 'Asset ID is required'),
  assetSearch: z.object({
    query: z.string().min(1, 'Search query is required').max(200, 'Search query too long'),
    filters: z.object({
      type: z.string().optional(),
      sector: z.string().optional(),
      riskLevel: z.enum(['low', 'medium', 'high']).optional(),
      complianceStatus: z.enum(['compliant', 'pending', 'non_compliant']).optional(),
      minMarketCap: z.number().positive().optional(),
      maxMarketCap: z.number().positive().optional(),
    }).optional(),
    limit: z.number().min(1).max(100).optional(),
    offset: z.number().nonnegative().optional(),
  }),

  assetDocument: z.object({
    assetId: z.string().min(1, 'Asset ID is required'),
    type: z.enum(['prospectus', 'offering_memorandum', 'financial_statement', 'compliance_report', 'legal_document', 'technical_report', 'other']),
    title: z.string().min(1, 'Document title is required'),
    filename: z.string().min(1, 'Filename is required'),
    contentType: z.string().min(1, 'Content type is required'),
    size: z.number().positive('File size must be positive'),
    url: z.string().url('Invalid document URL'),
    tags: z.array(z.string()).optional(),
    metadata: z.record(z.any()).optional(),
  }),
};

// Portfolio validation schemas
export const portfolioSchemas = {
  portfolioId: z.string().min(1, 'Portfolio ID is required'),
  portfolioSearch: z.object({
    query: z.string().min(1, 'Search query is required').max(200, 'Search query too long'),
    filters: z.object({
      riskLevel: z.enum(['low', 'medium', 'high']).optional(),
      assetType: z.string().optional(),
      sector: z.string().optional(),
      minValue: z.number().positive().optional(),
      maxValue: z.number().positive().optional(),
    }).optional(),
    limit: z.number().min(1).max(100).optional(),
    offset: z.number().nonnegative().optional(),
  }),

  portfolioPosition: z.object({
    assetId: z.string().min(1, 'Asset ID is required'),
    quantity: z.number().positive('Quantity must be positive'),
    entryPrice: z.number().positive('Entry price must be positive'),
    allocation: z.number().min(0).max(100, 'Allocation must be between 0 and 100'),
  }),
};

// Compliance validation schemas
export const complianceSchemas = {
  kycStatus: z.enum(['pending', 'approved', 'rejected', 'expired']),
  amlStatus: z.enum(['pending', 'cleared', 'flagged', 'blocked']),
  sanctionsStatus: z.enum(['clear', 'flagged', 'blocked']),

  complianceCheck: z.object({
    userId: z.string().min(1, 'User ID is required'),
    assetIds: z.array(z.string()).min(1, 'At least one asset ID is required'),
    checkType: z.enum(['kyc', 'aml', 'sanctions', 'comprehensive']),
    priority: z.enum(['low', 'medium', 'high', 'urgent']).optional(),
  }),
};

// AI service validation schemas
export const aiSchemas = {
  aiInsight: z.object({
    type: z.enum(['risk_analysis', 'performance_prediction', 'market_analysis', 'compliance_alert', 'opportunity_identification']),
    title: z.string().min(1, 'Insight title is required'),
    description: z.string().min(1, 'Insight description is required'),
    confidence: z.number().min(0).max(1, 'Confidence must be between 0 and 1'),
    impact: z.enum(['low', 'medium', 'high']),
    category: z.string().min(1, 'Category is required'),
    recommendations: z.array(z.string()).optional(),
    dataSources: z.array(z.string()).min(1, 'At least one data source is required'),
  }),

  aiValuation: z.object({
    assetId: z.string().min(1, 'Asset ID is required'),
    currentValue: z.number().positive('Current value must be positive'),
    predictedValue: z.number().positive('Predicted value must be positive'),
    confidence: z.number().min(0).max(1, 'Confidence must be between 0 and 1'),
    methodology: z.string().min(1, 'Methodology is required'),
    assumptions: z.array(z.string()).min(1, 'At least one assumption is required'),
    riskFactors: z.array(z.string()).optional(),
  }),
};

// Rate limiting validation schemas
export const rateLimitSchemas = {
  rateLimitConfig: z.object({
    windowMs: z.number().positive('Window must be positive'),
    maxRequests: z.number().positive('Max requests must be positive'),
    message: z.string().optional(),
    statusCode: z.number().min(400).max(599).optional(),
    headers: z.boolean().optional(),
    skipSuccessfulRequests: z.boolean().optional(),
    skipFailedRequests: z.boolean().optional(),
  }),

  rateLimitInfo: z.object({
    remaining: z.number().nonnegative('Remaining requests must be non-negative'),
    resetTime: z.date(),
    totalRequests: z.number().nonnegative('Total requests must be non-negative'),
  }),
};

// Generic validation schemas
export const genericSchemas = {
  pagination: z.object({
    limit: z.number().min(1).max(100).optional(),
    offset: z.number().nonnegative().optional(),
    page: z.number().positive().optional(),
    pageSize: z.number().min(1).max(100).optional(),
  }),

  sorting: z.object({
    field: z.string().min(1, 'Sort field is required'),
    direction: z.enum(['asc', 'desc']).optional(),
  }),

  filtering: z.object({
    field: z.string().min(1, 'Filter field is required'),
    operator: z.enum(['eq', 'ne', 'gt', 'gte', 'lt', 'lte', 'in', 'nin', 'contains', 'startsWith', 'endsWith']),
    value: z.any(),
  }),

  search: z.object({
    query: z.string().min(1, 'Search query is required').max(500, 'Search query too long'),
    filters: z.array(z.any()).optional(),
    sort: z.array(z.any()).optional(),
    pagination: genericSchemas.pagination.optional(),
  }),
};

// Validation utility functions
export class ValidationUtils {
  /**
   * Validate data against a schema and return result
   */
  static validate<T>(schema: z.ZodSchema<T>, data: unknown): {
    success: boolean;
    data?: T;
    errors?: z.ZodError;
  } {
    try {
      const validatedData = schema.parse(data);
      return { success: true, data: validatedData };
    } catch (error) {
      if (error instanceof z.ZodError) {
        return { success: false, errors: error };
      }
      throw error;
    }
  }

  /**
   * Validate data against a schema and throw error if invalid
   */
  static validateOrThrow<T>(schema: z.ZodSchema<T>, data: unknown): T {
    return schema.parse(data);
  }

  /**
   * Safe validation that returns null on error
   */
  static safeValidate<T>(schema: z.ZodSchema<T>, data: unknown): T | null {
    try {
      return schema.parse(data);
    } catch {
      return null;
    }
  }

  /**
   * Validate partial data against a schema
   */
  static validatePartial<T>(schema: z.ZodSchema<T>, data: unknown): {
    success: boolean;
    data?: Partial<T>;
    errors?: z.ZodError;
  } {
    try {
      const validatedData = schema.partial().parse(data);
      return { success: true, data: validatedData };
    } catch (error) {
      if (error instanceof z.ZodError) {
        return { success: false, errors: error };
      }
      throw error;
    }
  }

  /**
   * Create a custom error message for validation failures
   */
  static createErrorMessage(errors: z.ZodError): string {
    return errors.errors
      .map(error => `${error.path.join('.')}: ${error.message}`)
      .join(', ');
  }

  /**
   * Validate array of items against a schema
   */
  static validateArray<T>(schema: z.ZodSchema<T>, data: unknown[]): {
    success: boolean;
    data?: T[];
    errors?: Array<{ index: number; error: z.ZodError }>;
  } {
    const results: T[] = [];
    const errors: Array<{ index: number; error: z.ZodError }> = [];

    data.forEach((item, index) => {
      try {
        const validatedItem = schema.parse(item);
        results.push(validatedItem);
      } catch (error) {
        if (error instanceof z.ZodError) {
          errors.push({ index, error });
        }
      }
    });

    if (errors.length > 0) {
      return { success: false, errors };
    }

    return { success: true, data: results };
  }

  /**
   * Validate object with optional fields
   */
  static validateOptional<T>(schema: z.ZodSchema<T>, data: unknown): {
    success: boolean;
    data?: Partial<T>;
    errors?: z.ZodError;
  } {
    try {
      const validatedData = schema.partial().parse(data);
      return { success: true, data: validatedData };
    } catch (error) {
      if (error instanceof z.ZodError) {
        return { success: false, errors: error };
      }
      throw error;
    }
  }

  /**
   * Create a validation schema with custom error messages
   */
  static createSchemaWithMessages<T>(
    schema: z.ZodSchema<T>,
    messages: Record<string, string>
  ): z.ZodSchema<T> {
    return schema.refine(
      (data) => true,
      (data) => {
        const path = Object.keys(messages)[0];
        const message = messages[path];
        return { message, path: [path] };
      }
    );
  }

  /**
   * Validate email format
   */
  static isValidEmail(email: string): boolean {
    const emailSchema = z.string().email();
    try {
      emailSchema.parse(email);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Validate URL format
   */
  static isValidUrl(url: string): boolean {
    const urlSchema = z.string().url();
    try {
      urlSchema.parse(url);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Validate UUID format
   */
  static isValidUuid(uuid: string): boolean {
    const uuidSchema = z.string().uuid();
    try {
      uuidSchema.parse(uuid);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Validate date format
   */
  static isValidDate(date: string): boolean {
    const dateSchema = z.string().datetime();
    try {
      dateSchema.parse(date);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Sanitize input data by removing potentially dangerous content
   */
  static sanitizeInput(input: string): string {
    return input
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/javascript:/gi, '')
      .replace(/on\w+\s*=/gi, '')
      .trim();
  }

  /**
   * Validate and sanitize user input
   */
  static validateAndSanitizeInput(
    input: string,
    maxLength: number = 1000
  ): { isValid: boolean; sanitized: string; errors: string[] } {
    const errors: string[] = [];

    if (!input || input.trim().length === 0) {
      errors.push('Input is required');
    }

    if (input.length > maxLength) {
      errors.push(`Input too long (max ${maxLength} characters)`);
    }

    const sanitized = this.sanitizeInput(input);

    // Check for potentially dangerous patterns
    const dangerousPatterns = [
      /<script/i,
      /javascript:/i,
      /on\w+\s*=/i,
      /data:text\/html/i,
      /vbscript:/i,
    ];

    dangerousPatterns.forEach(pattern => {
      if (pattern.test(sanitized)) {
        errors.push('Input contains potentially dangerous content');
      }
    });

    return {
      isValid: errors.length === 0,
      sanitized,
      errors,
    };
  }
}

// Export all schemas
export const schemas = {
  base: baseSchemas,
  copilot: copilotSchemas,
  asset: assetSchemas,
  portfolio: portfolioSchemas,
  compliance: complianceSchemas,
  ai: aiSchemas,
  rateLimit: rateLimitSchemas,
  generic: genericSchemas,
};

// Export validation utilities
export { ValidationUtils as validate };
