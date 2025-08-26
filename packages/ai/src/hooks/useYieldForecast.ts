import { useState, useCallback, useEffect } from 'react';
import { defaultAIClient, YieldRequest, YieldResponse } from '../client/ai-client';

export interface UseYieldForecastOptions {
  autoFetch?: boolean;
  refetchInterval?: number;
  onSuccess?: (data: YieldResponse) => void;
  onError?: (error: Error) => void;
}

export interface UseYieldForecastReturn {
  data: YieldResponse | null;
  loading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
  predictYield: (request: YieldRequest) => Promise<YieldResponse>;
  reset: () => void;
}

export function useYieldForecast(
  initialRequest?: YieldRequest,
  options: UseYieldForecastOptions = {}
): UseYieldForecastReturn {
  const [data, setData] = useState<YieldResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const {
    autoFetch = false,
    refetchInterval,
    onSuccess,
    onError,
  } = options;

  const predictYield = useCallback(async (request: YieldRequest): Promise<YieldResponse> => {
    try {
      setLoading(true);
      setError(null);

      // Validate request
      if (!defaultAIClient.validateYieldRequest(request)) {
        throw new Error('Invalid yield prediction request data');
      }

      const response = await defaultAIClient.predictYield(request);
      
      setData(response);
      onSuccess?.(response);
      
      return response;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Unknown error occurred');
      setError(error);
      onError?.(error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [onSuccess, onError]);

  const refetch = useCallback(async () => {
    if (initialRequest) {
      await predictYield(initialRequest);
    }
  }, [initialRequest, predictYield]);

  const reset = useCallback(() => {
    setData(null);
    setError(null);
    setLoading(false);
  }, []);

  // Auto-fetch on mount if enabled
  useEffect(() => {
    if (autoFetch && initialRequest) {
      predictYield(initialRequest);
    }
  }, [autoFetch, initialRequest, predictYield]);

  // Set up refetch interval if specified
  useEffect(() => {
    if (refetchInterval && initialRequest) {
      const interval = setInterval(() => {
        predictYield(initialRequest);
      }, refetchInterval);

      return () => clearInterval(interval);
    }
  }, [refetchInterval, initialRequest, predictYield]);

  return {
    data,
    loading,
    error,
    refetch,
    predictYield,
    reset,
  };
}

// Hook for batch yield predictions
export function useBatchYieldForecast() {
  const [data, setData] = useState<YieldResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const batchPredictYields = useCallback(async (requests: YieldRequest[]): Promise<YieldResponse[]> => {
    try {
      setLoading(true);
      setError(null);

      // Validate all requests
      for (const request of requests) {
        if (!defaultAIClient.validateYieldRequest(request)) {
          throw new Error(`Invalid yield prediction request for asset ${request.asset_id}`);
        }
      }

      const responses = await defaultAIClient.batchPredictYields(requests);
      
      setData(responses);
      return responses;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Unknown error occurred');
      setError(error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  const reset = useCallback(() => {
    setData([]);
    setError(null);
    setLoading(false);
  }, []);

  return {
    data,
    loading,
    error,
    batchPredictYields,
    reset,
  };
}

// Hook for yield trend analysis
export function useYieldTrendAnalysis(historicalYields: number[]) {
  const [trend, setTrend] = useState<{
    direction: 'increasing' | 'decreasing' | 'stable';
    slope: number;
    volatility: number;
    confidence: number;
  } | null>(null);

  useEffect(() => {
    if (historicalYields.length < 2) {
      setTrend(null);
      return;
    }

    // Calculate trend statistics
    const n = historicalYields.length;
    const x = Array.from({ length: n }, (_, i) => i);
    const y = historicalYields;

    // Linear regression
    const sumX = x.reduce((a, b) => a + b, 0);
    const sumY = y.reduce((a, b) => a + b, 0);
    const sumXY = x.reduce((a, b, i) => a + x[i] * y[i], 0);
    const sumXX = x.reduce((a, b) => a + b * b, 0);

    const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
    const intercept = (sumY - slope * sumX) / n;

    // Calculate R-squared for confidence
    const yMean = sumY / n;
    const ssRes = y.reduce((a, b, i) => a + Math.pow(b - (slope * x[i] + intercept), 2), 0);
    const ssTot = y.reduce((a, b) => a + Math.pow(b - yMean, 2), 0);
    const rSquared = 1 - (ssRes / ssTot);

    // Calculate volatility (standard deviation)
    const variance = y.reduce((a, b) => a + Math.pow(b - yMean, 2), 0) / n;
    const volatility = Math.sqrt(variance);

    // Determine trend direction
    let direction: 'increasing' | 'decreasing' | 'stable';
    if (Math.abs(slope) < 0.001) {
      direction = 'stable';
    } else if (slope > 0) {
      direction = 'increasing';
    } else {
      direction = 'decreasing';
    }

    setTrend({
      direction,
      slope,
      volatility,
      confidence: rSquared,
    });
  }, [historicalYields]);

  return trend;
}

// Hook for yield forecasting with confidence intervals
export function useYieldForecastWithConfidence(
  initialRequest?: YieldRequest,
  confidenceLevel: number = 0.95
) {
  const { data, loading, error, predictYield, refetch, reset } = useYieldForecast(initialRequest);

  const getConfidenceInterval = useCallback((predictedYield: number, confidenceInterval: { lower: number; upper: number }) => {
    const range = confidenceInterval.upper - confidenceInterval.lower;
    const margin = range * (1 - confidenceLevel) / 2;
    
    return {
      lower: confidenceInterval.lower + margin,
      upper: confidenceInterval.upper - margin,
      confidence: confidenceLevel,
    };
  }, [confidenceLevel]);

  const adjustedConfidenceIntervals = data?.confidence_intervals.map(interval => 
    getConfidenceInterval(data.predicted_yields[0], interval)
  );

  return {
    data: data ? {
      ...data,
      adjusted_confidence_intervals: adjustedConfidenceIntervals,
    } : null,
    loading,
    error,
    predictYield,
    refetch,
    reset,
    getConfidenceInterval,
  };
}
