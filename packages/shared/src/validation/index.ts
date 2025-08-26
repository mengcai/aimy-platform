// Validation utilities and decorators for the AIMY platform

import { z } from 'zod';
import { 
  validate as classValidate, 
  ValidationError as ClassValidationError 
} from 'class-validator';
import { plainToClass } from 'class-transformer';

/**
 * Validation result interface
 */
export interface ValidationResult<T> {
  isValid: boolean;
  data?: T;
  errors: string[];
  warnings?: string[];
}

/**
 * Validation options interface
 */
export interface ValidationOptions {
  skipMissingProperties?: boolean;
  whitelist?: boolean;
  forbidNonWhitelisted?: boolean;
  forbidUnknownValues?: boolean;
  disableErrorMessages?: boolean;
  validationError?: {
    target?: boolean;
    value?: boolean;
  };
}

/**
 * Custom validation decorator for class properties
 */
export function ValidateProperty(
  schema: z.ZodSchema<any>,
  options?: { message?: string; transform?: boolean }
) {
  return function (target: any, propertyKey: string) {
    const descriptor = Object.getOwnPropertyDescriptor(target, propertyKey);
    
    if (descriptor && descriptor.set) {
      const originalSet = descriptor.set;
      
      descriptor.set = function (value: any) {
        try {
          const validatedValue = options?.transform 
            ? schema.parse(value)
            : schema.parse(value);
          
          originalSet.call(this, validatedValue);
        } catch (error) {
          if (error instanceof z.ZodError) {
            const message = options?.message || 
              `Validation failed for property ${propertyKey}: ${error.errors.map(e => e.message).join(', ')}`;
            throw new Error(message);
          }
          throw error;
        }
      };
    }
  };
}

/**
 * Custom validation decorator for class methods
 */
export function ValidateMethod(
  inputSchema?: z.ZodSchema<any>,
  outputSchema?: z.ZodSchema<any>
) {
  return function (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor
  ) {
    const originalMethod = descriptor.value;
    
    descriptor.value = async function (...args: any[]) {
      // Validate input
      if (inputSchema) {
        try {
          const validatedArgs = inputSchema.parse(args);
          args = Array.isArray(validatedArgs) ? validatedArgs : [validatedArgs];
        } catch (error) {
          if (error instanceof z.ZodError) {
            throw new Error(
              `Input validation failed for method ${propertyKey}: ${error.errors.map(e => e.message).join(', ')}`
            );
          }
          throw error;
        }
      }
      
      // Execute method
      const result = await originalMethod.apply(this, args);
      
      // Validate output
      if (outputSchema) {
        try {
          const validatedResult = outputSchema.parse(result);
          return validatedResult;
        } catch (error) {
          if (error instanceof z.ZodError) {
            throw new Error(
              `Output validation failed for method ${propertyKey}: ${error.errors.map(e => e.message).join(', ')}`
            );
          }
          throw error;
        }
      }
      
      return result;
    };
  };
}

/**
 * Zod-based validator
 */
export class ZodValidator {
  /**
   * Validate data against a Zod schema
   */
  static validate<T>(
    schema: z.ZodSchema<T>,
    data: unknown
  ): ValidationResult<T> {
    try {
      const validatedData = schema.parse(data);
      return {
        isValid: true,
        data: validatedData,
        errors: [],
      };
    } catch (error) {
      if (error instanceof z.ZodError) {
        return {
          isValid: false,
          errors: error.errors.map(e => `${e.path.join('.')}: ${e.message}`),
        };
      }
      return {
        isValid: false,
        errors: ['Unknown validation error'],
      };
    }
  }
  
  /**
   * Validate data against a Zod schema with safe parsing
   */
  static safeValidate<T>(
    schema: z.ZodSchema<T>,
    data: unknown
  ): ValidationResult<T> {
    const result = schema.safeParse(data);
    
    if (result.success) {
      return {
        isValid: true,
        data: result.data,
        errors: [],
      };
    } else {
      return {
        isValid: false,
        errors: result.error.errors.map(e => `${e.path.join('.')}: ${e.message}`),
      };
    }
  }
  
  /**
   * Validate data against a Zod schema and transform if valid
   */
  static validateAndTransform<T>(
    schema: z.ZodSchema<T>,
    data: unknown
  ): ValidationResult<T> {
    try {
      const validatedData = schema.parse(data);
      return {
        isValid: true,
        data: validatedData,
        errors: [],
      };
    } catch (error) {
      if (error instanceof z.ZodError) {
        return {
          isValid: false,
          errors: error.errors.map(e => `${e.path.join('.')}: ${e.message}`),
        };
      }
      return {
        isValid: false,
        errors: ['Unknown validation error'],
      };
    }
  }
}

/**
 * Class-validator based validator
 */
export class ClassValidator {
  /**
   * Validate a class instance
   */
  static async validate<T>(
    target: T,
    options?: ValidationOptions
  ): Promise<ValidationResult<T>> {
    try {
      const errors = await classValidate(target, options);
      
      if (errors.length === 0) {
        return {
          isValid: true,
          data: target,
          errors: [],
        };
      }
      
      const errorMessages = errors.map(error => {
        if (error.constraints) {
          return Object.values(error.constraints).join(', ');
        }
        return error.toString();
      });
      
      return {
        isValid: false,
        errors: errorMessages,
      };
    } catch (error) {
      return {
        isValid: false,
        errors: ['Validation error occurred'],
      };
    }
  }
  
  /**
   * Validate and transform plain object to class instance
   */
  static async validateAndTransform<T>(
    cls: new () => T,
    plainObject: any,
    options?: ValidationOptions
  ): Promise<ValidationResult<T>> {
    try {
      const instance = plainToClass(cls, plainObject);
      return await this.validate(instance, options);
    } catch (error) {
      return {
        isValid: false,
        errors: ['Failed to transform object to class instance'],
      };
    }
  }
  
  /**
   * Validate multiple class instances
   */
  static async validateMultiple<T>(
    targets: T[],
    options?: ValidationOptions
  ): Promise<ValidationResult<T[]>[]> {
    const results = await Promise.all(
      targets.map(target => this.validate(target, options))
    );
    return results;
  }
}

/**
 * Composite validator that combines multiple validation strategies
 */
export class CompositeValidator {
  /**
   * Validate using multiple validators
   */
  static async validate<T>(
    data: unknown,
    validators: Array<{
      validator: 'zod' | 'class';
      schema?: z.ZodSchema<any>;
      cls?: new () => T;
      options?: ValidationOptions;
    }>
  ): Promise<ValidationResult<T>> {
    const allErrors: string[] = [];
    const allWarnings: string[] = [];
    
    for (const validatorConfig of validators) {
      try {
        if (validatorConfig.validator === 'zod' && validatorConfig.schema) {
          const result = ZodValidator.validate(validatorConfig.schema, data);
          if (!result.isValid) {
            allErrors.push(...result.errors);
          }
        } else if (validatorConfig.validator === 'class' && validatorConfig.cls) {
          const instance = plainToClass(validatorConfig.cls, data);
          const result = await ClassValidator.validate(instance, validatorConfig.options);
          if (!result.isValid) {
            allErrors.push(...result.errors);
          }
        }
      } catch (error) {
        allErrors.push(`Validator error: ${error}`);
      }
    }
    
    if (allErrors.length === 0) {
      return {
        isValid: true,
        data: data as T,
        errors: [],
        warnings: allWarnings,
      };
    }
    
    return {
      isValid: false,
      errors: allErrors,
      warnings: allWarnings,
    };
  }
}

/**
 * Validation utility functions
 */
export class ValidationUtils {
  /**
   * Check if a value is not null or undefined
   */
  static isDefined(value: any): boolean {
    return value !== null && value !== undefined;
  }
  
  /**
   * Check if a value is a valid email
   */
  static isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }
  
  /**
   * Check if a value is a valid phone number
   */
  static isValidPhone(phone: string): boolean {
    const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
    return phoneRegex.test(phone.replace(/\s/g, ''));
  }
  
  /**
   * Check if a value is a valid URL
   */
  static isValidUrl(url: string): boolean {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }
  
  /**
   * Check if a value is a valid UUID
   */
  static isValidUUID(uuid: string): boolean {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return uuidRegex.test(uuid);
  }
  
  /**
   * Check if a value is a valid date
   */
  static isValidDate(date: any): boolean {
    if (date instanceof Date) {
      return !isNaN(date.getTime());
    }
    if (typeof date === 'string') {
      const parsed = new Date(date);
      return !isNaN(parsed.getTime());
    }
    return false;
  }
  
  /**
   * Check if a value is a valid number
   */
  static isValidNumber(value: any): boolean {
    return typeof value === 'number' && !isNaN(value) && isFinite(value);
  }
  
  /**
   * Check if a value is a valid integer
   */
  static isValidInteger(value: any): boolean {
    return this.isValidNumber(value) && Number.isInteger(value);
  }
  
  /**
   * Check if a value is a valid positive number
   */
  static isValidPositiveNumber(value: any): boolean {
    return this.isValidNumber(value) && value > 0;
  }
  
  /**
   * Check if a value is a valid percentage (0-100)
   */
  static isValidPercentage(value: any): boolean {
    return this.isValidNumber(value) && value >= 0 && value <= 100;
  }
  
  /**
   * Check if a value is a valid currency code
   */
  static isValidCurrencyCode(code: string): boolean {
    const currencyRegex = /^[A-Z]{3}$/;
    return currencyRegex.test(code);
  }
  
  /**
   * Check if a value is a valid country code
   */
  static isValidCountryCode(code: string): boolean {
    const countryRegex = /^[A-Z]{2}$/;
    return countryRegex.test(code);
  }
  
  /**
   * Check if a value is a valid IBAN
   */
  static isValidIBAN(iban: string): boolean {
    const ibanRegex = /^[A-Z]{2}[0-9]{2}[A-Z0-9]{4}[0-9]{7}([A-Z0-9]?){0,16}$/;
    return ibanRegex.test(iban.replace(/\s/g, ''));
  }
  
  /**
   * Check if a value is a valid credit card number
   */
  static isValidCreditCard(cardNumber: string): boolean {
    const cardRegex = /^[0-9]{13,19}$/;
    if (!cardRegex.test(cardNumber.replace(/\s/g, ''))) {
      return false;
    }
    
    // Luhn algorithm
    let sum = 0;
    let isEven = false;
    const digits = cardNumber.replace(/\s/g, '').split('').reverse();
    
    for (const digit of digits) {
      let num = parseInt(digit);
      
      if (isEven) {
        num *= 2;
        if (num > 9) {
          num -= 9;
        }
      }
      
      sum += num;
      isEven = !isEven;
    }
    
    return sum % 10 === 0;
  }
}

/**
 * Validation error class
 */
export class ValidationError extends Error {
  public errors: string[];
  public warnings?: string[];
  
  constructor(message: string, errors: string[], warnings?: string[]) {
    super(message);
    this.name = 'ValidationError';
    this.errors = errors;
    this.warnings = warnings;
  }
  
  /**
   * Get formatted error messages
   */
  getFormattedErrors(): string {
    return this.errors.join('\n');
  }
  
  /**
   * Get formatted warning messages
   */
  getFormattedWarnings(): string {
    return this.warnings?.join('\n') || '';
  }
}

// Export all validation utilities
export {
  ValidateProperty,
  ValidateMethod,
  ZodValidator,
  ClassValidator,
  CompositeValidator,
  ValidationUtils,
  ValidationError,
  ValidationResult,
  ValidationOptions,
};
