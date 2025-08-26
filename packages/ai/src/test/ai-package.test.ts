import { describe, it, expect, beforeEach, vi } from 'vitest';
import { AIClient, defaultAIClient } from '../client/ai-client';
import { useAssetValuation, useBatchAssetValuation } from '../hooks/use-asset-valuation';
import { useYieldForecast, useBatchYieldForecast } from '../hooks/use-yield-forecast';
import { useRiskScore, useBatchRiskScoring } from '../hooks/use-risk-score';
import { useAnomalies, useBatchAnomalyDetection } from '../hooks/useAnomalies';

// Mock the AI client
vi.mock('../client/ai-client', () => ({
  defaultAIClient: {
    priceAsset: vi.fn(),
    predictYield: vi.fn(),
    calculateRiskScore: vi.fn(),
    detectAnomalies: vi.fn(),
    validatePricingRequest: vi.fn(),
    validateYieldRequest: vi.fn(),
    validateRiskRequest: vi.fn(),
    validateAnomalyRequest: vi.fn(),
    batchPriceAssets: vi.fn(),
    batchPredictYields: vi.fn(),
    batchCalculateRiskScores: vi.fn(),
    batchDetectAnomalies: vi.fn(),
  },
}));

describe('AI Package - Client Tests', () => {
  let mockClient: any;

  beforeEach(() => {
    mockClient = {
      priceAsset: vi.fn(),
      predictYield: vi.fn(),
      calculateRiskScore: vi.fn(),
      detectAnomalies: vi.fn(),
      validatePricingRequest: vi.fn(),
      validateYieldRequest: vi.fn(),
      validateRiskRequest: vi.fn(),
      validateAnomalyRequest: vi.fn(),
      batchPriceAssets: vi.fn(),
      batchPredictYields: vi.fn(),
      batchCalculateRiskScores: vi.fn(),
      batchDetectAnomalies: vi.fn(),
    };
  });

  describe('AIClient', () => {
    it('should create client with correct configuration', () => {
      const config = { baseURL: 'http://test.com', timeout: 5000 };
      const client = new AIClient(config);
      
      expect(client.getConfig()).toEqual(config);
    });

    it('should update configuration', () => {
      const client = new AIClient({ baseURL: 'http://test.com' });
      client.updateConfig({ timeout: 10000 });
      
      expect(client.getConfig().timeout).toBe(10000);
    });

    it('should validate pricing requests', () => {
      const client = new AIClient({ baseURL: 'http://test.com' });
      const validRequest = {
        asset_id: 'test-asset',
        cashflows: [],
        market_data: [],
        utilization: []
      };
      
      expect(client.validatePricingRequest(validRequest)).toBe(true);
    });

    it('should validate yield requests', () => {
      const client = new AIClient({ baseURL: 'http://test.com' });
      const validRequest = {
        asset_id: 'test-asset',
        historical_yields: [0.05, 0.06],
        forecast_horizon: 12
      };
      
      expect(client.validateYieldRequest(validRequest)).toBe(true);
    });

    it('should validate risk requests', () => {
      const client = new AIClient({ baseURL: 'http://test.com' });
      const validRequest = {
        asset_id: 'test-asset',
        cashflows: [],
        market_data: [],
        utilization: []
      };
      
      expect(client.validateRiskRequest(validRequest)).toBe(true);
    });

    it('should validate anomaly requests', () => {
      const client = new AIClient({ baseURL: 'http://test.com' });
      const validRequest = {
        asset_id: 'test-asset',
        time_series_data: []
      };
      
      expect(client.validateAnomalyRequest(validRequest)).toBe(true);
    });
  });
});

describe('AI Package - Hook Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('useAssetValuation', () => {
    it('should initialize with correct default state', () => {
      const { result } = renderHook(() => useAssetValuation());
      
      expect(result.current.data).toBeNull();
      expect(result.current.loading).toBe(false);
      expect(result.current.error).toBeNull();
    });

    it('should handle successful pricing request', async () => {
      const mockResponse = {
        asset_id: 'test-asset',
        estimated_value: 1000000,
        confidence_interval: [950000, 1050000],
        feature_importance: {},
        model_version: '1.0.0',
        processing_time_ms: 150
      };

      vi.mocked(defaultAIClient.priceAsset).mockResolvedValue(mockResponse);
      vi.mocked(defaultAIClient.validatePricingRequest).mockReturnValue(true);

      const { result } = renderHook(() => useAssetValuation());
      
      await act(async () => {
        await result.current.priceAsset({
          asset_id: 'test-asset',
          cashflows: [],
          market_data: [],
          utilization: []
        });
      });

      expect(result.current.data).toEqual(mockResponse);
      expect(result.current.loading).toBe(false);
      expect(result.current.error).toBeNull();
    });

    it('should handle pricing request errors', async () => {
      const mockError = new Error('API Error');
      vi.mocked(defaultAIClient.priceAsset).mockRejectedValue(mockError);
      vi.mocked(defaultAIClient.validatePricingRequest).mockReturnValue(true);

      const { result } = renderHook(() => useAssetValuation());
      
      await act(async () => {
        try {
          await result.current.priceAsset({
            asset_id: 'test-asset',
            cashflows: [],
            market_data: [],
            utilization: []
          });
        } catch (error) {
          // Expected to throw
        }
      });

      expect(result.current.error).toEqual(mockError);
      expect(result.current.loading).toBe(false);
    });
  });

  describe('useYieldForecast', () => {
    it('should handle successful yield prediction', async () => {
      const mockResponse = {
        asset_id: 'test-asset',
        predicted_yield: 0.085,
        confidence_interval: [0.08, 0.09],
        forecast_periods: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
        forecast_values: [0.085, 0.086, 0.087, 0.088, 0.089, 0.09, 0.091, 0.092, 0.093, 0.094, 0.095, 0.096],
        model_version: '1.0.0',
        processing_time_ms: 120
      };

      vi.mocked(defaultAIClient.predictYield).mockResolvedValue(mockResponse);
      vi.mocked(defaultAIClient.validateYieldRequest).mockReturnValue(true);

      const { result } = renderHook(() => useYieldForecast());
      
      await act(async () => {
        await result.current.predictYield({
          asset_id: 'test-asset',
          historical_yields: [0.08, 0.09],
          forecast_horizon: 12
        });
      });

      expect(result.current.data).toEqual(mockResponse);
      expect(result.current.loading).toBe(false);
    });
  });

  describe('useRiskScore', () => {
    it('should handle successful risk calculation', async () => {
      const mockResponse = {
        asset_id: 'test-asset',
        risk_score: 0.35,
        risk_level: 'MEDIUM',
        risk_factors: ['market_volatility', 'cashflow_variability'],
        confidence_interval: [0.30, 0.40],
        model_version: '1.0.0',
        processing_time_ms: 200
      };

      vi.mocked(defaultAIClient.calculateRiskScore).mockResolvedValue(mockResponse);
      vi.mocked(defaultAIClient.validateRiskRequest).mockReturnValue(true);

      const { result } = renderHook(() => useRiskScore());
      
      await act(async () => {
        await result.current.calculateRiskScore({
          asset_id: 'test-asset',
          cashflows: [],
          market_data: [],
          utilization: []
        });
      });

      expect(result.current.data).toEqual(mockResponse);
      expect(result.current.loading).toBe(false);
    });
  });

  describe('useAnomalies', () => {
    it('should handle successful anomaly detection', async () => {
      const mockResponse = {
        asset_id: 'test-asset',
        timestamp: '2024-01-01T00:00:00Z',
        anomalies_detected: [
          {
            timestamp: '2024-01-01T12:00:00Z',
            anomaly_score: 0.85,
            severity: 'HIGH',
            description: 'Unusual temperature spike detected',
            affected_metrics: ['temperature', 'efficiency']
          }
        ],
        confidence_score: 0.92,
        model_version: '1.0.0',
        processing_time_ms: 180
      };

      vi.mocked(defaultAIClient.detectAnomalies).mockResolvedValue(mockResponse);
      vi.mocked(defaultAIClient.validateAnomalyRequest).mockReturnValue(true);

      const { result } = renderHook(() => useAnomalies());
      
      await act(async () => {
        await result.current.detectAnomalies({
          asset_id: 'test-asset',
          time_series_data: []
        });
      });

      expect(result.current.data).toEqual(mockResponse);
      expect(result.current.loading).toBe(false);
    });
  });

  describe('Batch Hooks', () => {
    it('should handle batch asset valuation', async () => {
      const mockResponses = [
        { asset_id: 'asset-1', estimated_value: 1000000 },
        { asset_id: 'asset-2', estimated_value: 2000000 }
      ];

      vi.mocked(defaultAIClient.batchPriceAssets).mockResolvedValue(mockResponses);

      const { result } = renderHook(() => useBatchAssetValuation());
      
      await act(async () => {
        await result.current.batchPriceAssets([
          { asset_id: 'asset-1', cashflows: [], market_data: [], utilization: [] },
          { asset_id: 'asset-2', cashflows: [], market_data: [], utilization: [] }
        ]);
      });

      expect(result.current.data).toEqual(mockResponses);
      expect(result.current.loading).toBe(false);
    });

    it('should handle batch yield forecasting', async () => {
      const mockResponses = [
        { asset_id: 'asset-1', predicted_yield: 0.08 },
        { asset_id: 'asset-2', predicted_yield: 0.09 }
      ];

      vi.mocked(defaultAIClient.batchPredictYields).mockResolvedValue(mockResponses);

      const { result } = renderHook(() => useBatchYieldForecast());
      
      await act(async () => {
        await result.current.batchPredictYields([
          { asset_id: 'asset-1', historical_yields: [0.08], forecast_horizon: 12 },
          { asset_id: 'asset-2', historical_yields: [0.09], forecast_horizon: 12 }
        ]);
      });

      expect(result.current.data).toEqual(mockResponses);
      expect(result.current.loading).toBe(false);
    });

    it('should handle batch risk scoring', async () => {
      const mockResponses = [
        { asset_id: 'asset-1', risk_score: 0.3 },
        { asset_id: 'asset-2', risk_score: 0.4 }
      ];

      vi.mocked(defaultAIClient.batchCalculateRiskScores).mockResolvedValue(mockResponses);

      const { result } = renderHook(() => useBatchRiskScoring());
      
      await act(async () => {
        await result.current.batchCalculateRiskScores([
          { asset_id: 'asset-1', cashflows: [], market_data: [], utilization: [] },
          { asset_id: 'asset-2', cashflows: [], market_data: [], utilization: [] }
        ]);
      });

      expect(result.current.data).toEqual(mockResponses);
      expect(result.current.loading).toBe(false);
    });

    it('should handle batch anomaly detection', async () => {
      const mockResponses = [
        { asset_id: 'asset-1', anomalies_detected: [] },
        { asset_id: 'asset-2', anomalies_detected: [] }
      ];

      vi.mocked(defaultAIClient.batchDetectAnomalies).mockResolvedValue(mockResponses);

      const { result } = renderHook(() => useBatchAnomalyDetection());
      
      await act(async () => {
        await result.current.batchDetectAnomalies([
          { asset_id: 'asset-1', time_series_data: [] },
          { asset_id: 'asset-2', time_series_data: [] }
        ]);
      });

      expect(result.current.data).toEqual(mockResponses);
      expect(result.current.loading).toBe(false);
    });
  });
});

// Helper function to render hooks (simplified for testing)
function renderHook<T>(hookFn: () => T) {
  let result: T;
  
  const hook = hookFn();
  result = hook;
  
  return { result };
}

// Helper function to act on async operations
async function act(asyncFn: () => Promise<void>) {
  await asyncFn();
}
