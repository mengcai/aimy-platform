// AIMY SDK Client

import { 
  Asset, 
  Investor, 
  Issuer, 
  SecurityToken, 
  Portfolio,
  ComplianceCheck,
  Document,
  Payment,
  Settlement
} from '@aimy/shared';
import { AIService, AIServiceConfig } from '@aimy/ai';
import { 
  AssetService, 
  InvestorService, 
  IssuerService, 
  SecurityTokenService,
  PortfolioService,
  ComplianceService,
  PaymentService,
  DocumentService
} from './services';

/**
 * AIMY Client Configuration
 */
export interface AIMYClientConfig {
  baseUrl: string;
  apiKey: string;
  timeout?: number;
  retries?: number;
  aiService?: AIServiceConfig;
  headers?: Record<string, string>;
}

/**
 * Main AIMY SDK Client
 */
export class AIMYClient {
  private config: AIMYClientConfig;
  private aiService?: AIService;
  
  // Service instances
  public readonly assets: AssetService;
  public readonly investors: InvestorService;
  public readonly issuers: IssuerService;
  public readonly tokens: SecurityTokenService;
  public readonly portfolios: PortfolioService;
  public readonly compliance: ComplianceService;
  public readonly payments: PaymentService;
  public readonly documents: DocumentService;
  
  constructor(config: AIMYClientConfig) {
    this.config = config;
    
    // Initialize AI service if configured
    if (config.aiService) {
      this.aiService = new AIService(config.aiService);
    }
    
    // Initialize service instances
    this.assets = new AssetService(config);
    this.investors = new InvestorService(config);
    this.issuers = new IssuerService(config);
    this.tokens = new SecurityTokenService(config);
    this.portfolios = new PortfolioService(config);
    this.compliance = new ComplianceService(config);
    this.payments = new PaymentService(config);
    this.documents = new DocumentService(config);
  }
  
  /**
   * Get client configuration
   */
  getConfig(): AIMYClientConfig {
    return { ...this.config };
  }
  
  /**
   * Get AI service instance
   */
  getAIService(): AIService | undefined {
    return this.aiService;
  }
  
  /**
   * Health check
   */
  async healthCheck(): Promise<boolean> {
    try {
      const response = await fetch(`${this.config.baseUrl}/health`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.config.apiKey}`,
          'Content-Type': 'application/json',
          ...this.config.headers,
        },
        signal: this.createAbortSignal(),
      });
      
      return response.ok;
    } catch (error) {
      return false;
    }
  }
  
  /**
   * Get API version information
   */
  async getVersion(): Promise<any> {
    try {
      const response = await fetch(`${this.config.baseUrl}/version`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.config.apiKey}`,
          'Content-Type': 'application/json',
          ...this.config.headers,
        },
        signal: this.createAbortSignal(),
      });
      
      if (!response.ok) {
        throw new Error(`Failed to get version: ${response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      throw new Error(`Version check failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
  
  /**
   * Create abort signal for timeout
   */
  private createAbortSignal(): AbortSignal | undefined {
    if (!this.config.timeout) return undefined;
    
    const controller = new AbortController();
    setTimeout(() => controller.abort(), this.config.timeout);
    return controller.signal;
  }
}

/**
 * AIMY Client Factory
 */
export class AIMYClientFactory {
  private static instances = new Map<string, AIMYClient>();
  
  /**
   * Create or get existing client instance
   */
  static create(config: AIMYClientConfig): AIMYClient {
    const key = `${config.baseUrl}:${config.apiKey}`;
    
    if (!this.instances.has(key)) {
      this.instances.set(key, new AIMYClient(config));
    }
    
    return this.instances.get(key)!;
  }
  
  /**
   * Get existing client instance
   */
  static getInstance(key: string): AIMYClient | undefined {
    return this.instances.get(key);
  }
  
  /**
   * Clear all client instances
   */
  static clearInstances(): void {
    this.instances.clear();
  }
  
  /**
   * Get all client instance keys
   */
  static getInstanceKeys(): string[] {
    return Array.from(this.instances.keys());
  }
}
