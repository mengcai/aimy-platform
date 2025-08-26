// Caching interfaces and utilities for the AIMY platform

/**
 * Cache entry interface
 */
export interface CacheEntry<T = any> {
  key: string;
  value: T;
  ttl: number; // Time to live in milliseconds
  createdAt: number;
  lastAccessed: number;
  accessCount: number;
  metadata?: Record<string, any>;
}

/**
 * Cache options interface
 */
export interface CacheOptions {
  ttl?: number; // Default TTL in milliseconds
  maxSize?: number; // Maximum number of entries
  maxMemory?: number; // Maximum memory usage in bytes
  evictionPolicy?: 'lru' | 'lfu' | 'fifo' | 'ttl';
  compression?: boolean;
  encryption?: boolean;
  encryptionKey?: string;
}

/**
 * Cache statistics interface
 */
export interface CacheStats {
  hits: number;
  misses: number;
  evictions: number;
  size: number;
  memoryUsage: number;
  hitRate: number;
  averageAccessTime: number;
  lastReset: number;
}

/**
 * Cache key generator interface
 */
export interface CacheKeyGenerator {
  generateKey(prefix: string, params: Record<string, any>): string;
  generatePattern(prefix: string, params: Record<string, any>): string;
}

/**
 * Cache serializer interface
 */
export interface CacheSerializer {
  serialize<T>(value: T): string;
  deserialize<T>(data: string): T;
}

/**
 * Base cache interface
 */
export interface BaseCache<T = any> {
  get(key: string): Promise<T | null>;
  set(key: string, value: T, ttl?: number): Promise<void>;
  delete(key: string): Promise<boolean>;
  has(key: string): Promise<boolean>;
  clear(): Promise<void>;
  getStats(): Promise<CacheStats>;
  resetStats(): Promise<void>;
}

/**
 * In-memory cache implementation
 */
export class InMemoryCache<T = any> implements BaseCache<T> {
  private cache = new Map<string, CacheEntry<T>>();
  private stats: CacheStats;
  private options: Required<CacheOptions>;
  
  constructor(options: CacheOptions = {}) {
    this.options = {
      ttl: options.ttl || 5 * 60 * 1000, // 5 minutes default
      maxSize: options.maxSize || 1000,
      maxMemory: options.maxMemory || 100 * 1024 * 1024, // 100MB default
      evictionPolicy: options.evictionPolicy || 'lru',
      compression: options.compression || false,
      encryption: options.encryption || false,
      encryptionKey: options.encryptionKey || '',
    };
    
    this.stats = {
      hits: 0,
      misses: 0,
      evictions: 0,
      size: 0,
      memoryUsage: 0,
      hitRate: 0,
      averageAccessTime: 0,
      lastReset: Date.now(),
    };
    
    // Start cleanup interval
    setInterval(() => this.cleanup(), 60000); // Cleanup every minute
  }
  
  async get(key: string): Promise<T | null> {
    const entry = this.cache.get(key);
    
    if (!entry) {
      this.stats.misses++;
      this.updateStats();
      return null;
    }
    
    // Check if expired
    if (Date.now() > entry.createdAt + entry.ttl) {
      this.cache.delete(key);
      this.stats.misses++;
      this.updateStats();
      return null;
    }
    
    // Update access info
    entry.lastAccessed = Date.now();
    entry.accessCount++;
    
    this.stats.hits++;
    this.updateStats();
    
    return entry.value;
  }
  
  async set(key: string, value: T, ttl?: number): Promise<void> {
    const entry: CacheEntry<T> = {
      key,
      value,
      ttl: ttl || this.options.ttl,
      createdAt: Date.now(),
      lastAccessed: Date.now(),
      accessCount: 0,
    };
    
    // Check if we need to evict entries
    if (this.cache.size >= this.options.maxSize) {
      this.evictEntries();
    }
    
    this.cache.set(key, entry);
    this.updateStats();
  }
  
  async delete(key: string): Promise<boolean> {
    const deleted = this.cache.delete(key);
    if (deleted) {
      this.updateStats();
    }
    return deleted;
  }
  
  async has(key: string): Promise<boolean> {
    const entry = this.cache.get(key);
    if (!entry) return false;
    
    // Check if expired
    if (Date.now() > entry.createdAt + entry.ttl) {
      this.cache.delete(key);
      this.updateStats();
      return false;
    }
    
    return true;
  }
  
  async clear(): Promise<void> {
    this.cache.clear();
    this.updateStats();
  }
  
  async getStats(): Promise<CacheStats> {
    return { ...this.stats };
  }
  
  async resetStats(): Promise<void> {
    this.stats = {
      hits: 0,
      misses: 0,
      evictions: 0,
      size: 0,
      memoryUsage: 0,
      hitRate: 0,
      averageAccessTime: 0,
      lastReset: Date.now(),
    };
  }
  
  private evictEntries(): void {
    const entries = Array.from(this.cache.entries());
    
    switch (this.options.evictionPolicy) {
      case 'lru':
        entries.sort((a, b) => a[1].lastAccessed - b[1].lastAccessed);
        break;
      case 'lfu':
        entries.sort((a, b) => a[1].accessCount - b[1].accessCount);
        break;
      case 'fifo':
        entries.sort((a, b) => a[1].createdAt - b[1].createdAt);
        break;
      case 'ttl':
        entries.sort((a, b) => (a[1].createdAt + a[1].ttl) - (b[1].createdAt + b[1].ttl));
        break;
    }
    
    // Remove oldest entries
    const toRemove = Math.ceil(entries.length * 0.1); // Remove 10%
    for (let i = 0; i < toRemove; i++) {
      this.cache.delete(entries[i][0]);
      this.stats.evictions++;
    }
  }
  
  private cleanup(): void {
    const now = Date.now();
    for (const [key, entry] of this.cache.entries()) {
      if (now > entry.createdAt + entry.ttl) {
        this.cache.delete(key);
      }
    }
    this.updateStats();
  }
  
  private updateStats(): void {
    this.stats.size = this.cache.size;
    this.stats.memoryUsage = this.estimateMemoryUsage();
    this.stats.hitRate = this.stats.hits / (this.stats.hits + this.stats.misses);
  }
  
  private estimateMemoryUsage(): number {
    let total = 0;
    for (const [key, entry] of this.cache.entries()) {
      total += key.length * 2; // UTF-16 string
      total += JSON.stringify(entry.value).length * 2;
      total += 100; // Rough estimate for entry metadata
    }
    return total;
  }
}

/**
 * Redis cache implementation interface
 */
export interface RedisCache<T = any> extends BaseCache<T> {
  getMultiple(keys: string[]): Promise<(T | null)[]>;
  setMultiple(entries: Array<{ key: string; value: T; ttl?: number }>): Promise<void>;
  deleteMultiple(keys: string[]): Promise<number>;
  increment(key: string, value?: number): Promise<number>;
  decrement(key: string, value?: number): Promise<number>;
  exists(keys: string[]): Promise<number>;
  expire(key: string, ttl: number): Promise<boolean>;
  ttl(key: string): Promise<number>;
  keys(pattern: string): Promise<string[]>;
  flush(): Promise<void>;
}

/**
 * Cache manager for handling multiple cache layers
 */
export class CacheManager {
  private caches = new Map<string, BaseCache>();
  private defaultCache: string;
  
  constructor(defaultCache: string = 'memory') {
    this.defaultCache = defaultCache;
  }
  
  /**
   * Register a cache instance
   */
  register(name: string, cache: BaseCache): void {
    this.caches.set(name, cache);
  }
  
  /**
   * Get a cache instance by name
   */
  get(name?: string): BaseCache {
    const cacheName = name || this.defaultCache;
    const cache = this.caches.get(cacheName);
    
    if (!cache) {
      throw new Error(`Cache '${cacheName}' not found`);
    }
    
    return cache;
  }
  
  /**
   * Get all registered cache names
   */
  getCacheNames(): string[] {
    return Array.from(this.caches.keys());
  }
  
  /**
   * Remove a cache instance
   */
  unregister(name: string): boolean {
    return this.caches.delete(name);
  }
  
  /**
   * Clear all caches
   */
  async clearAll(): Promise<void> {
    const promises = Array.from(this.caches.values()).map(cache => cache.clear());
    await Promise.all(promises);
  }
  
  /**
   * Get statistics from all caches
   */
  async getAllStats(): Promise<Record<string, CacheStats>> {
    const stats: Record<string, CacheStats> = {};
    
    for (const [name, cache] of this.caches.entries()) {
      stats[name] = await cache.getStats();
    }
    
    return stats;
  }
}

/**
 * Cache decorator for class methods
 */
export function Cacheable(
  cacheName: string,
  keyGenerator?: (args: any[]) => string,
  ttl?: number
) {
  return function (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor
  ) {
    const originalMethod = descriptor.value;
    
    descriptor.value = async function (...args: any[]) {
      const cache = (this as any).cacheManager?.get(cacheName);
      if (!cache) {
        return originalMethod.apply(this, args);
      }
      
      const key = keyGenerator 
        ? keyGenerator(args)
        : `${target.constructor.name}:${propertyKey}:${JSON.stringify(args)}`;
      
      // Try to get from cache
      const cached = await cache.get(key);
      if (cached !== null) {
        return cached;
      }
      
      // Execute method and cache result
      const result = await originalMethod.apply(this, args);
      await cache.set(key, result, ttl);
      
      return result;
    };
  };
}

/**
 * Cache invalidation decorator
 */
export function CacheInvalidate(
  cacheName: string,
  pattern?: string
) {
  return function (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor
  ) {
    const originalMethod = descriptor.value;
    
    descriptor.value = async function (...args: any[]) {
      const result = await originalMethod.apply(this, args);
      
      const cache = (this as any).cacheManager?.get(cacheName);
      if (cache && pattern) {
        // Clear cache entries matching pattern
        if (cache.clear) {
          await cache.clear();
        }
      }
      
      return result;
    };
  };
}

/**
 * Cache utilities
 */
export class CacheUtils {
  /**
   * Generate a cache key from parameters
   */
  static generateKey(prefix: string, params: Record<string, any>): string {
    const sortedKeys = Object.keys(params).sort();
    const keyParts = sortedKeys.map(key => `${key}:${params[key]}`);
    return `${prefix}:${keyParts.join(':')}`;
  }
  
  /**
   * Generate a cache pattern for wildcard matching
   */
  static generatePattern(prefix: string, params: Record<string, any>): string {
    const sortedKeys = Object.keys(params).sort();
    const keyParts = sortedKeys.map(key => `${key}:*`);
    return `${prefix}:${keyParts.join(':')}`;
  }
  
  /**
   * Hash a string for consistent cache keys
   */
  static hashString(str: string): string {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash).toString(36);
  }
  
  /**
   * Generate a cache key for method calls
   */
  static generateMethodKey(
    className: string,
    methodName: string,
    args: any[]
  ): string {
    const argsHash = this.hashString(JSON.stringify(args));
    return `${className}:${methodName}:${argsHash}`;
  }
  
  /**
   * Check if a cache key matches a pattern
   */
  static matchesPattern(key: string, pattern: string): boolean {
    const keyParts = key.split(':');
    const patternParts = pattern.split(':');
    
    if (keyParts.length !== patternParts.length) {
      return false;
    }
    
    for (let i = 0; i < patternParts.length; i++) {
      if (patternParts[i] !== '*' && patternParts[i] !== keyParts[i]) {
        return false;
      }
    }
    
    return true;
  }
}

// Export all caching utilities
export {
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
};
