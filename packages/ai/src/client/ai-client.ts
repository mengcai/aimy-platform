import axios, { AxiosInstance, AxiosResponse } from 'axios';

// Types for AI service requests and responses
export interface CashflowData {
  asset_id: string;
  date: string;
  amount: number;
  type: string;
  category?: string;
}

export interface MarketData {
  date: string;
  interest_rate: number;
  inflation_rate: number;
  market_volatility: number;
}

export interface IoTData {
  asset_id: string;
  timestamp: string;
  sensor_type: string;
  value: number;
  unit: string;
}

export interface UtilizationData {
  asset_id: string;
  date: string;
  utilization_rate: number;
  capacity: number;
  efficiency: number;
}

export interface PricingRequest {
  asset_id: string;
  cashflows: CashflowData[];
  market_data: MarketData[];
  utilization: UtilizationData[];
  iot_data?: IoTData[];
  valuation_date: string;
}

export interface PricingResponse {
  asset_id: string;
  valuation_date: string;
  estimated_value: number;
  confidence_interval: {
    lower: number;
    upper: number;
  };
  feature_importance: Record<string, number>;
  model_version: string;
  timestamp: string;
}

export interface YieldRequest {
  asset_id: string;
  historical_yields: number[];
  market_conditions: Record<string, any>;
  forecast_horizon: number;
}

export interface YieldResponse {
  asset_id: string;
  forecast_horizon: number;
  predicted_yields: number[];
  confidence_intervals: Array<{
    lower: number;
    upper: number;
  }>;
  feature_importance: Record<string, number>;
  model_version: string;
  timestamp: string;
}

export interface RiskRequest {
  asset_id: string;
  financial_metrics: Record<string, number>;
  market_exposure: Record<string, number>;
  operational_metrics: Record<string, number>;
}

export interface RiskResponse {
  asset_id: string;
  risk_score: number;
  risk_level: 'LOW' | 'MEDIUM' | 'HIGH';
  risk_factors: Record<string, number>;
  confidence_interval: {
    lower: number;
    upper: number;
  };
  model_version: string;
  timestamp: string;
}

export interface AnomalyRequest {
  asset_id: string;
  time_series_data: Array<Record<string, any>>;
}

export interface AnomalyResponse {
  asset_id: string;
  anomalies_detected: Array<{
    timestamp: string;
    severity: 'LOW' | 'MEDIUM' | 'HIGH';
    description: string;
    anomaly_score: number;
  }>;
  anomaly_score: number;
  confidence_interval: {
    lower: number;
    upper: number;
  };
  model_version: string;
  timestamp: string;
}

export interface MetricsResponse {
  total_requests: number;
  successful_requests: number;
  failed_requests: number;
  average_response_time: number;
  model_performance: Record<string, Record<string, number>>;
  last_updated: string;
}

export interface DemoDataResponse {
  message: string;
  asset_id: string;
  data_key: string;
  records_generated: {
    cashflows: number;
    market_data: number;
    iot_data: number;
    utilization: number;
  };
}

export interface RetrainResponse {
  message: string;
  status: string;
  timestamp: string;
}

export interface AIClientConfig {
  baseURL: string;
  timeout?: number;
  headers?: Record<string, string>;
}

export class AIClient {
  private client: AxiosInstance;
  private config: AIClientConfig;

  constructor(config: AIClientConfig) {
    this.config = config;
    this.client = axios.create({
      baseURL: config.baseURL,
      timeout: config.timeout || 30000,
      headers: {
        'Content-Type': 'application/json',
        ...config.headers,
      },
    });

    // Add request interceptor for logging
    this.client.interceptors.request.use(
      (config) => {
        console.log(`[AI Client] ${config.method?.toUpperCase()} ${config.url}`);
        return config;
      },
      (error) => {
        console.error('[AI Client] Request error:', error);
        return Promise.reject(error);
      }
    );

    // Add response interceptor for error handling
    this.client.interceptors.response.use(
      (response: AxiosResponse) => {
        return response;
      },
      (error) => {
        console.error('[AI Client] Response error:', error);
        if (error.response) {
          console.error('[AI Client] Error details:', {
            status: error.response.status,
            data: error.response.data,
          });
        }
        return Promise.reject(error);
      }
    );
  }

  /**
   * Health check endpoint
   */
  async healthCheck(): Promise<{ status: string; timestamp: string; service: string }> {
    const response = await this.client.get('/health');
    return response.data;
  }

  /**
   * Price an asset based on historical data and market conditions
   */
  async priceAsset(request: PricingRequest): Promise<PricingResponse> {
    const response = await this.client.post<PricingResponse>('/price', request);
    return response.data;
  }

  /**
   * Predict future yields based on historical data and market conditions
   */
  async predictYield(request: YieldRequest): Promise<YieldResponse> {
    const response = await this.client.post<YieldResponse>('/predict_yield', request);
    return response.data;
  }

  /**
   * Calculate risk score for an asset
   */
  async calculateRiskScore(request: RiskRequest): Promise<RiskResponse> {
    const response = await this.client.post<RiskResponse>('/risk_score', request);
    return response.data;
  }

  /**
   * Detect anomalies in time series data
   */
  async detectAnomalies(request: AnomalyRequest): Promise<AnomalyResponse> {
    const response = await this.client.post<AnomalyResponse>('/anomaly', request);
    return response.data;
  }

  /**
   * Get service metrics and model performance
   */
  async getMetrics(): Promise<MetricsResponse> {
    const response = await this.client.get<MetricsResponse>('/metrics');
    return response.data;
  }

  /**
   * Generate demo data for testing and demonstration
   */
  async generateDemoData(asset_id: string = 'demo-asset-001'): Promise<DemoDataResponse> {
    const response = await this.client.post<DemoDataResponse>(`/demo/generate_data?asset_id=${asset_id}`);
    return response.data;
  }

  /**
   * Trigger model retraining
   */
  async retrainModels(): Promise<RetrainResponse> {
    const response = await this.client.post<RetrainResponse>('/retrain');
    return response.data;
  }

  /**
   * Batch pricing predictions for multiple assets
   */
  async batchPriceAssets(requests: PricingRequest[]): Promise<PricingResponse[]> {
    const promises = requests.map(request => this.priceAsset(request));
    return Promise.all(promises);
  }

  /**
   * Batch yield predictions for multiple assets
   */
  async batchPredictYields(requests: YieldRequest[]): Promise<YieldResponse[]> {
    const promises = requests.map(request => this.predictYield(request));
    return Promise.all(promises);
  }

  /**
   * Batch risk scoring for multiple assets
   */
  async batchCalculateRiskScores(requests: RiskRequest[]): Promise<RiskResponse[]> {
    const promises = requests.map(request => this.calculateRiskScore(request));
    return Promise.all(promises);
  }

  /**
   * Batch anomaly detection for multiple assets
   */
  async batchDetectAnomalies(requests: AnomalyRequest[]): Promise<AnomalyResponse[]> {
    const promises = requests.map(request => this.detectAnomalies(request));
    return Promise.all(promises);
  }

  /**
   * Get comprehensive asset analysis (pricing + yield + risk + anomalies)
   */
  async getComprehensiveAnalysis(
    asset_id: string,
    pricingRequest: PricingRequest,
    yieldRequest: YieldRequest,
    riskRequest: RiskRequest,
    anomalyRequest: AnomalyRequest
  ): Promise<{
    asset_id: string;
    pricing: PricingResponse;
    yield: YieldResponse;
    risk: RiskResponse;
    anomaly: AnomalyResponse;
    timestamp: string;
  }> {
    const [pricing, yield_pred, risk, anomaly] = await Promise.all([
      this.priceAsset(pricingRequest),
      this.predictYield(yieldRequest),
      this.calculateRiskScore(riskRequest),
      this.detectAnomalies(anomalyRequest),
    ]);

    return {
      asset_id,
      pricing,
      yield: yield_pred,
      risk,
      anomaly,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Validate request data before sending to API
   */
  validatePricingRequest(request: PricingRequest): boolean {
    return !!(
      request.asset_id &&
      request.cashflows?.length > 0 &&
      request.market_data?.length > 0 &&
      request.utilization?.length > 0 &&
      request.valuation_date
    );
  }

  validateYieldRequest(request: YieldRequest): boolean {
    return !!(
      request.asset_id &&
      request.historical_yields?.length > 0 &&
      request.forecast_horizon > 0
    );
  }

  validateRiskRequest(request: RiskRequest): boolean {
    return !!(
      request.asset_id &&
      Object.keys(request.financial_metrics || {}).length > 0 &&
      Object.keys(request.market_exposure || {}).length > 0 &&
      Object.keys(request.operational_metrics || {}).length > 0
    );
  }

  validateAnomalyRequest(request: AnomalyRequest): boolean {
    return !!(
      request.asset_id &&
      request.time_series_data?.length > 0
    );
  }

  /**
   * Get client configuration
   */
  getConfig(): AIClientConfig {
    return { ...this.config };
  }

  /**
   * Update client configuration
   */
  updateConfig(newConfig: Partial<AIClientConfig>): void {
    this.config = { ...this.config, ...newConfig };
    this.client.defaults.baseURL = this.config.baseURL;
    this.client.defaults.timeout = this.config.timeout || 30000;
    if (newConfig.headers) {
      this.client.defaults.headers = { ...this.client.defaults.headers, ...newConfig.headers };
    }
  }
}

// Default client instance
export const defaultAIClient = new AIClient({
  baseURL: process.env.NEXT_PUBLIC_AI_SERVICE_URL || 'http://localhost:8000',
});

// Export types for use in other modules
export type {
  CashflowData,
  MarketData,
  IoTData,
  UtilizationData,
  PricingRequest,
  PricingResponse,
  YieldRequest,
  YieldResponse,
  RiskRequest,
  RiskResponse,
  AnomalyRequest,
  AnomalyResponse,
  MetricsResponse,
  DemoDataResponse,
  RetrainResponse,
};
