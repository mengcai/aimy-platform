import { useState, useCallback, useEffect } from 'react';
import { defaultAIClient, PricingRequest, PricingResponse } from '../client/ai-client';

export interface UseAssetValuationOptions {
  autoFetch?: boolean;
  refetchInterval?: number;
  onSuccess?: (data: PricingResponse) => void;
  onError?: (error: Error) => void;
}

export interface UseAssetValuationReturn {
  data: PricingResponse | null;
  loading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
  priceAsset: (request: PricingRequest) => Promise<PricingResponse>;
  reset: () => void;
}

export function useAssetValuation(
  initialRequest?: PricingRequest,
  options: UseAssetValuationOptions = {}
): UseAssetValuationReturn {
  const [data, setData] = useState<PricingResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const {
    autoFetch = false,
    refetchInterval,
    onSuccess,
    onError,
  } = options;

  const priceAsset = useCallback(async (request: PricingRequest): Promise<PricingResponse> => {
    try {
      setLoading(true);
      setError(null);

      // Validate request
      if (!defaultAIClient.validatePricingRequest(request)) {
        throw new Error('Invalid pricing request data');
      }

      const response = await defaultAIClient.priceAsset(request);
      
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
      await priceAsset(initialRequest);
    }
  }, [initialRequest, priceAsset]);

  const reset = useCallback(() => {
    setData(null);
    setError(null);
    setLoading(false);
  }, []);

  // Auto-fetch on mount if enabled
  useEffect(() => {
    if (autoFetch && initialRequest) {
      priceAsset(initialRequest);
    }
  }, [autoFetch, initialRequest, priceAsset]);

  // Set up refetch interval if specified
  useEffect(() => {
    if (refetchInterval && initialRequest) {
      const interval = setInterval(() => {
        priceAsset(initialRequest);
      }, refetchInterval);

      return () => clearInterval(interval);
    }
  }, [refetchInterval, initialRequest, priceAsset]);

  return {
    data,
    loading,
    error,
    refetch,
    priceAsset,
    reset,
  };
}

// Hook for batch pricing multiple assets
export function useBatchAssetValuation() {
  const [data, setData] = useState<PricingResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const batchPriceAssets = useCallback(async (requests: PricingRequest[]): Promise<PricingResponse[]> => {
    try {
      setLoading(true);
      setError(null);

      // Validate all requests
      for (const request of requests) {
        if (!defaultAIClient.validatePricingRequest(request)) {
          throw new Error(`Invalid pricing request for asset ${request.asset_id}`);
        }
      }

      const responses = await defaultAIClient.batchPriceAssets(requests);
      
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
    batchPriceAssets,
    reset,
  };
}
