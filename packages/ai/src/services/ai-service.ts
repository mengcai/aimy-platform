// AI Service for the AIMY platform

import { 
  AIServiceConfig, 
  AIModelConfig, 
  ValuationRequest, 
  RiskAssessmentRequest, 
  YieldPredictionRequest,
  AIResponse,
  ResponseMetadata,
  AIError,
  BatchRequest,
  BatchResponse,
  BatchResult,
  BatchSummary
} from '../types';
import { 
  Asset, 
  RiskScore, 
  YieldPrediction, 
  ValuationModel,
  RiskLevel,
  RiskCategory
} from '@aimy/shared';

/**
 * AI Service interface
 */
export interface IAIService {
  /**
   * Get service configuration
   */
  getConfig(): AIServiceConfig;
  
  /**
   * Get available models
   */
  getAvailableModels(): Promise<AIModelConfig[]>;
  
  /**
   * Perform asset valuation
   */
  performValuation(request: ValuationRequest): Promise<AIResponse<number>>;
  
  /**
   * Perform risk assessment
   */
  performRiskAssessment(request: RiskAssessmentRequest): Promise<AIResponse<RiskScore>>;
  
  /**
   * Predict yield
   */
  predictYield(request: YieldPredictionRequest): Promise<AIResponse<YieldPrediction>>;
  
  /**
   * Batch process multiple requests
   */
  processBatch(request: BatchRequest): Promise<BatchResponse>;
  
  /**
   * Get model performance metrics
   */
  getModelPerformance(modelId: string): Promise<any>;
  
  /**
   * Health check
   */
  healthCheck(): Promise<boolean>;
}

/**
 * AI Service implementation
 */
export class AIService implements IAIService {
  private config: AIServiceConfig;
  private models: Map<string, AIModelConfig>;
  private baseUrl: string;
  private apiKey: string;
  
  constructor(config: AIServiceConfig) {
    this.config = config;
    this.models = new Map();
    this.baseUrl = config.baseUrl;
    this.apiKey = config.apiKey;
    
    // Initialize models
    this.initializeModels();
  }
  
  getConfig(): AIServiceConfig {
    return { ...this.config };
  }
  
  async getAvailableModels(): Promise<AIModelConfig[]> {
    try {
      const response = await fetch(`${this.baseUrl}/models`, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error(`Failed to fetch models: ${response.statusText}`);
      }
      
      const models = await response.json();
      return models.map((model: any) => ({
        id: model.id,
        name: model.name,
        type: model.type,
        version: model.version,
        description: model.description,
        capabilities: model.capabilities,
        parameters: model.parameters,
        performance: model.performance,
      }));
    } catch (error) {
      throw new AIError(
        'Failed to fetch available models',
        'MODEL_FETCH_ERROR',
        error instanceof Error ? error.message : 'Unknown error'
      );
    }
  }
  
  async performValuation(request: ValuationRequest): Promise<AIResponse<number>> {
    try {
      const response = await fetch(`${this.baseUrl}/valuation`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      });
      
      if (!response.ok) {
        throw new Error(`Valuation failed: ${response.statusText}`);
      }
      
      const result = await response.json();
      
      return {
        data: result.value,
        metadata: {
          modelId: result.modelId,
          confidence: result.confidence,
          processingTime: result.processingTime,
          timestamp: new Date(),
          requestId: request.requestId,
        },
        success: true,
      };
    } catch (error) {
      throw new AIError(
        'Valuation failed',
        'VALUATION_ERROR',
        error instanceof Error ? error.message : 'Unknown error'
      );
    }
  }
  
  async performRiskAssessment(request: RiskAssessmentRequest): Promise<AIResponse<RiskScore>> {
    try {
      const response = await fetch(`${this.baseUrl}/risk-assessment`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      });
      
      if (!response.ok) {
        throw new Error(`Risk assessment failed: ${response.statusText}`);
      }
      
      const result = await response.json();
      
      const riskScore: RiskScore = {
        id: result.riskScoreId,
        assetId: request.assetId,
        score: result.score,
        level: this.mapRiskLevel(result.score),
        category: this.mapRiskCategory(result.category),
        factors: result.factors,
        confidence: result.confidence,
        model: result.model,
        timestamp: new Date(),
        metadata: result.metadata,
      };
      
      return {
        data: riskScore,
        metadata: {
          modelId: result.modelId,
          confidence: result.confidence,
          processingTime: result.processingTime,
          timestamp: new Date(),
          requestId: request.requestId,
        },
        success: true,
      };
    } catch (error) {
      throw new AIError(
        'Risk assessment failed',
        'RISK_ASSESSMENT_ERROR',
        error instanceof Error ? error.message : 'Unknown error'
      );
    }
  }
  
  async predictYield(request: YieldPredictionRequest): Promise<AIResponse<YieldPrediction>> {
    try {
      const response = await fetch(`${this.baseUrl}/yield-prediction`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      });
      
      if (!response.ok) {
        throw new Error(`Yield prediction failed: ${response.statusText}`);
      }
      
      const result = await response.json();
      
      const yieldPrediction: YieldPrediction = {
        id: result.predictionId,
        assetId: request.assetId,
        predictedYield: result.predictedYield,
        confidence: result.confidence,
        timeHorizon: result.timeHorizon,
        factors: result.factors,
        model: result.model,
        timestamp: new Date(),
        metadata: result.metadata,
      };
      
      return {
        data: yieldPrediction,
        metadata: {
          modelId: result.modelId,
          confidence: result.confidence,
          processingTime: result.processingTime,
          timestamp: new Date(),
          requestId: request.requestId,
        },
        success: true,
      };
    } catch (error) {
      throw new AIError(
        'Yield prediction failed',
        'YIELD_PREDICTION_ERROR',
        error instanceof Error ? error.message : 'Unknown error'
      );
    }
  }
  
  async processBatch(request: BatchRequest): Promise<BatchResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/batch`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      });
      
      if (!response.ok) {
        throw new Error(`Batch processing failed: ${response.statusText}`);
      }
      
      const result = await response.json();
      
      return {
        batchId: result.batchId,
        results: result.results,
        summary: {
          total: result.summary.total,
          successful: result.summary.successful,
          failed: result.summary.failed,
          processingTime: result.summary.processingTime,
          timestamp: new Date(),
        },
        success: true,
      };
    } catch (error) {
      throw new AIError(
        'Batch processing failed',
        'BATCH_PROCESSING_ERROR',
        error instanceof Error ? error.message : 'Unknown error'
      );
    }
  }
  
  async getModelPerformance(modelId: string): Promise<any> {
    try {
      const response = await fetch(`${this.baseUrl}/models/${modelId}/performance`, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error(`Failed to fetch model performance: ${response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      throw new AIError(
        'Failed to fetch model performance',
        'MODEL_PERFORMANCE_ERROR',
        error instanceof Error ? error.message : 'Unknown error'
      );
    }
  }
  
  async healthCheck(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/health`, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
        },
      });
      
      return response.ok;
    } catch (error) {
      return false;
    }
  }
  
  private initializeModels(): void {
    // Initialize with default models
    const defaultModels: AIModelConfig[] = [
      {
        id: 'valuation-v1',
        name: 'Asset Valuation Model v1',
        type: 'valuation',
        version: '1.0.0',
        description: 'AI-powered asset valuation model',
        capabilities: ['real_estate', 'infrastructure', 'renewable_energy'],
        parameters: {
          confidenceThreshold: 0.8,
          maxProcessingTime: 30000,
        },
        performance: {
          accuracy: 0.92,
          precision: 0.89,
          recall: 0.91,
        },
      },
      {
        id: 'risk-v1',
        name: 'Risk Assessment Model v1',
        type: 'risk',
        version: '1.0.0',
        description: 'Comprehensive risk assessment model',
        capabilities: ['market_risk', 'credit_risk', 'operational_risk'],
        parameters: {
          confidenceThreshold: 0.85,
          maxProcessingTime: 25000,
        },
        performance: {
          accuracy: 0.88,
          precision: 0.86,
          recall: 0.89,
        },
      },
      {
        id: 'yield-v1',
        name: 'Yield Prediction Model v1',
        type: 'yield',
        version: '1.0.0',
        description: 'Yield prediction and forecasting model',
        capabilities: ['dividend_prediction', 'interest_forecasting', 'growth_projection'],
        parameters: {
          confidenceThreshold: 0.8,
          maxProcessingTime: 20000,
        },
        performance: {
          accuracy: 0.85,
          precision: 0.83,
          recall: 0.87,
        },
      },
    ];
    
    defaultModels.forEach(model => {
      this.models.set(model.id, model);
    });
  }
  
  private mapRiskLevel(score: number): RiskLevel {
    if (score <= 0.2) return RiskLevel.LOW;
    if (score <= 0.4) return RiskLevel.MEDIUM_LOW;
    if (score <= 0.6) return RiskLevel.MEDIUM;
    if (score <= 0.8) return RiskLevel.MEDIUM_HIGH;
    return RiskLevel.HIGH;
  }
  
  private mapRiskCategory(category: string): RiskCategory {
    const categoryMap: Record<string, RiskCategory> = {
      'market': RiskCategory.MARKET,
      'credit': RiskCategory.CREDIT,
      'operational': RiskCategory.OPERATIONAL,
      'liquidity': RiskCategory.LIQUIDITY,
      'regulatory': RiskCategory.REGULATORY,
      'environmental': RiskCategory.ENVIRONMENTAL,
      'social': RiskCategory.SOCIAL,
      'governance': RiskCategory.GOVERNANCE,
    };
    
    return categoryMap[category] || RiskCategory.OTHER;
  }
}

/**
 * AI Service Factory
 */
export class AIServiceFactory {
  private static instances = new Map<string, AIService>();
  
  static create(config: AIServiceConfig): AIService {
    const key = `${config.baseUrl}:${config.apiKey}`;
    
    if (!this.instances.has(key)) {
      this.instances.set(key, new AIService(config));
    }
    
    return this.instances.get(key)!;
  }
  
  static getInstance(key: string): AIService | undefined {
    return this.instances.get(key);
  }
  
  static clearInstances(): void {
    this.instances.clear();
  }
}
