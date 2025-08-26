interface RateLimitConfig {
  windowMs: number;
  maxRequests: number;
  message?: string;
  statusCode?: number;
  headers?: boolean;
  skipSuccessfulRequests?: boolean;
  skipFailedRequests?: boolean;
}

interface RateLimitInfo {
  remaining: number;
  resetTime: Date;
  totalRequests: number;
}

interface RateLimitStore {
  [key: string]: {
    count: number;
    resetTime: Date;
    totalRequests: number;
  };
}

export class RateLimiter {
  private store: RateLimitStore = {};
  private config: RateLimitConfig;

  constructor(config: RateLimitConfig) {
    this.config = {
      windowMs: 15 * 60 * 1000, // 15 minutes default
      maxRequests: 100, // 100 requests per window default
      message: 'Too many requests, please try again later.',
      statusCode: 429,
      headers: true,
      skipSuccessfulRequests: false,
      skipFailedRequests: false,
      ...config,
    };
  }

  /**
   * Check if a request is allowed based on rate limiting
   */
  isAllowed(identifier: string): { allowed: boolean; info: RateLimitInfo } {
    const now = new Date();
    const key = this.getKey(identifier);
    
    // Get or create rate limit entry
    if (!this.store[key] || now > this.store[key].resetTime) {
      this.store[key] = {
        count: 0,
        resetTime: new Date(now.getTime() + this.config.windowMs),
        totalRequests: 0,
      };
    }

    const entry = this.store[key];
    const remaining = Math.max(0, this.config.maxRequests - entry.count);

    // Check if request is allowed
    const allowed = entry.count < this.config.maxRequests;

    // Increment count if allowed
    if (allowed) {
      entry.count++;
      entry.totalRequests++;
    }

    // Clean up old entries
    this.cleanup();

    return {
      allowed,
      info: {
        remaining,
        resetTime: entry.resetTime,
        totalRequests: entry.totalRequests,
      },
      };
    }

  /**
   * Get rate limit headers for response
   */
  getHeaders(identifier: string): Record<string, string> {
    if (!this.config.headers) {
      return {};
    }

    const key = this.getKey(identifier);
    const entry = this.store[key];
    
    if (!entry) {
      return {};
    }

    const now = new Date();
    const remaining = Math.max(0, this.config.maxRequests - entry.count);
    const resetTime = Math.floor(entry.resetTime.getTime() / 1000);

    return {
      'X-RateLimit-Limit': this.config.maxRequests.toString(),
      'X-RateLimit-Remaining': remaining.toString(),
      'X-RateLimit-Reset': resetTime.toString(),
      'X-RateLimit-Total': entry.totalRequests.toString(),
    };
  }

  /**
   * Reset rate limit for a specific identifier
   */
  reset(identifier: string): void {
    const key = this.getKey(identifier);
    delete this.store[key];
  }

  /**
   * Get current rate limit status for an identifier
   */
  getStatus(identifier: string): RateLimitInfo | null {
    const key = this.getKey(identifier);
    const entry = this.store[key];
    
    if (!entry) {
      return null;
    }

    const remaining = Math.max(0, this.config.maxRequests - entry.count);
    
    return {
      remaining,
      resetTime: entry.resetTime,
      totalRequests: entry.totalRequests,
    };
  }

  /**
   * Get all rate limit entries (for monitoring/debugging)
   */
  getAllEntries(): Record<string, RateLimitInfo> {
    const entries: Record<string, RateLimitInfo> = {};
    
    Object.keys(this.store).forEach(key => {
      const entry = this.store[key];
      const remaining = Math.max(0, this.config.maxRequests - entry.count);
      
      entries[key] = {
        remaining,
        resetTime: entry.resetTime,
        totalRequests: entry.totalRequests,
      };
    });

    return entries;
  }

  /**
   * Get rate limiter statistics
   */
  getStats(): {
    totalEntries: number;
    totalRequests: number;
    activeEntries: number;
    config: RateLimitConfig;
  } {
    const now = new Date();
    const activeEntries = Object.values(this.store).filter(
      entry => now <= entry.resetTime
    ).length;
    
    const totalRequests = Object.values(this.store).reduce(
      (sum, entry) => sum + entry.totalRequests, 0
    );

    return {
      totalEntries: Object.keys(this.store).length,
      totalRequests,
      activeEntries,
      config: this.config,
    };
  }

  /**
   * Update rate limit configuration
   */
  updateConfig(updates: Partial<RateLimitConfig>): void {
    this.config = { ...this.config, ...updates };
  }

  /**
   * Clear all rate limit entries
   */
  clear(): void {
    this.store = {};
  }

  /**
   * Clean up expired entries
   */
  private cleanup(): void {
    const now = new Date();
    const keysToDelete: string[] = [];

    Object.keys(this.store).forEach(key => {
      if (now > this.store[key].resetTime) {
        keysToDelete.push(key);
      }
    });

    keysToDelete.forEach(key => {
      delete this.store[key];
    });
  }

  /**
   * Generate a unique key for the identifier
   */
  private getKey(identifier: string): string {
    // In a production environment, you might want to hash the identifier
    // or use a more sophisticated key generation strategy
    return `rate_limit:${identifier}`;
  }
}

/**
 * Express.js middleware for rate limiting
 */
export function rateLimitMiddleware(config: RateLimitConfig) {
  const limiter = new RateLimiter(config);

  return (req: any, res: any, next: any) => {
    // Get identifier (IP address, user ID, etc.)
    const identifier = getIdentifier(req);
    
    // Check rate limit
    const { allowed, info } = limiter.isAllowed(identifier);

    // Add rate limit headers
    const headers = limiter.getHeaders(identifier);
    Object.entries(headers).forEach(([key, value]) => {
      res.setHeader(key, value);
    });

    if (!allowed) {
      return res.status(config.statusCode || 429).json({
        error: config.message || 'Too many requests, please try again later.',
        retryAfter: Math.ceil((info.resetTime.getTime() - Date.now()) / 1000),
      });
    }

    next();
  };
}

/**
 * Next.js API route wrapper for rate limiting
 */
export function withRateLimit(
  handler: Function,
  config: RateLimitConfig = { windowMs: 15 * 60 * 1000, maxRequests: 100 }
) {
  const limiter = new RateLimiter(config);

  return async (req: any, res: any) => {
    // Get identifier (IP address, user ID, etc.)
    const identifier = getIdentifier(req);
    
    // Check rate limit
    const { allowed, info } = limiter.isAllowed(identifier);

    // Add rate limit headers
    const headers = limiter.getHeaders(identifier);
    Object.entries(headers).forEach(([key, value]) => {
      res.setHeader(key, value);
    });

    if (!allowed) {
      return res.status(config.statusCode || 429).json({
        error: config.message || 'Too many requests, please try again later.',
        retryAfter: Math.ceil((info.resetTime.getTime() - Date.now()) / 1000),
      });
    }

    // Call the original handler
    return handler(req, res);
  };
}

/**
 * Get identifier for rate limiting from request
 */
function getIdentifier(req: any): string {
  // Try to get IP address from various sources
  const ip = 
    req.headers['x-forwarded-for']?.split(',')[0] ||
    req.headers['x-real-ip'] ||
    req.connection?.remoteAddress ||
    req.socket?.remoteAddress ||
    req.ip ||
    'unknown';

  // In a production environment, you might want to:
  // - Hash the IP address
  // - Use user ID if authenticated
  // - Use API key if provided
  // - Combine multiple identifiers
  
  return ip;
}

/**
 * Utility function to create a simple rate limiter for specific use cases
 */
export function createSimpleRateLimiter(
  windowMs: number = 15 * 60 * 1000,
  maxRequests: number = 100
): RateLimiter {
  return new RateLimiter({ windowMs, maxRequests });
}

/**
 * Utility function to check if a request should be rate limited based on custom logic
 */
export function shouldRateLimit(
  req: any,
  customRules: {
    skipPaths?: string[];
    skipMethods?: string[];
    skipAuthenticated?: boolean;
    customIdentifier?: (req: any) => string;
  } = {}
): boolean {
  const { skipPaths = [], skipMethods = [], skipAuthenticated = false, customIdentifier } = customRules;

  // Skip if path matches skip patterns
  if (skipPaths.some(path => req.url?.includes(path))) {
    return false;
  }

  // Skip if method matches skip methods
  if (skipMethods.includes(req.method)) {
    return false;
  }

  // Skip if user is authenticated and skipAuthenticated is true
  if (skipAuthenticated && req.user) {
    return false;
  }

  // Use custom identifier if provided
  if (customIdentifier) {
    req._rateLimitIdentifier = customIdentifier(req);
  }

  return true;
}
