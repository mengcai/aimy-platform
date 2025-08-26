import { useState, useCallback, useEffect } from 'react';
import { defaultAIClient, RiskRequest, RiskResponse } from '../client/ai-client';

export interface UseRiskScoreOptions {
  autoFetch?: boolean;
  refetchInterval?: number;
  onSuccess?: (data: RiskResponse) => void;
  onError?: (error: Error) => void;
}

export interface UseRiskScoreReturn {
  data: RiskResponse | null;
  loading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
  calculateRiskScore: (request: RiskRequest) => Promise<RiskResponse>;
  reset: () => void;
}

export function useRiskScore(
  initialRequest?: RiskRequest,
  options: UseRiskScoreOptions = {}
): UseRiskScoreReturn {
  const [data, setData] = useState<RiskResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const {
    autoFetch = false,
    refetchInterval,
    onSuccess,
    onError,
  } = options;

  const calculateRiskScore = useCallback(async (request: RiskRequest): Promise<RiskResponse> => {
    try {
      setLoading(true);
      setError(null);

      // Validate request
      if (!defaultAIClient.validateRiskRequest(request)) {
        throw new Error('Invalid risk scoring request data');
      }

      const response = await defaultAIClient.calculateRiskScore(request);
      
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
      await calculateRiskScore(initialRequest);
    }
  }, [initialRequest, calculateRiskScore]);

  const reset = useCallback(() => {
    setData(null);
    setError(null);
    setLoading(false);
  }, []);

  // Auto-fetch on mount if enabled
  useEffect(() => {
    if (autoFetch && initialRequest) {
      calculateRiskScore(initialRequest);
    }
  }, [autoFetch, initialRequest, calculateRiskScore]);

  // Set up refetch interval if specified
  useEffect(() => {
    if (refetchInterval && initialRequest) {
      const interval = setInterval(() => {
        calculateRiskScore(initialRequest);
      }, refetchInterval);

      return () => clearInterval(interval);
    }
  }, [refetchInterval, initialRequest, calculateRiskScore]);

  return {
    data,
    loading,
    error,
    refetch,
    calculateRiskScore,
    reset,
  };
}

// Hook for batch risk scoring
export function useBatchRiskScoring() {
  const [data, setData] = useState<RiskResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const batchCalculateRiskScores = useCallback(async (requests: RiskRequest[]): Promise<RiskResponse[]> => {
    try {
      setLoading(true);
      setError(null);

      // Validate all requests
      for (const request of requests) {
        if (!defaultAIClient.validateRiskRequest(request)) {
          throw new Error(`Invalid risk scoring request for asset ${request.asset_id}`);
        }
      }

      const responses = await defaultAIClient.batchCalculateRiskScores(requests);
      
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
    batchCalculateRiskScores,
    reset,
  };
}

// Hook for risk analysis and insights
export function useRiskAnalysis(riskResponse: RiskResponse | null) {
  const [insights, setInsights] = useState<{
    overallRisk: string;
    topRiskFactors: Array<{ factor: string; score: number }>;
    recommendations: string[];
    riskTrend: 'improving' | 'worsening' | 'stable';
  } | null>(null);

  useEffect(() => {
    if (!riskResponse) {
      setInsights(null);
      return;
    }

    // Analyze risk factors and generate insights
    const riskFactors = Object.entries(riskResponse.risk_factors)
      .map(([factor, score]) => ({ factor, score }))
      .sort((a, b) => b.score - a.score);

    const topRiskFactors = riskFactors.slice(0, 3);

    // Generate recommendations based on risk factors
    const recommendations: string[] = [];
    
    if (riskResponse.risk_level === 'HIGH') {
      recommendations.push('Immediate action required to mitigate high-risk factors');
      recommendations.push('Consider reducing exposure or implementing additional controls');
    } else if (riskResponse.risk_level === 'MEDIUM') {
      recommendations.push('Monitor risk factors closely and implement preventive measures');
      recommendations.push('Review and update risk management strategies');
    } else {
      recommendations.push('Continue current risk management practices');
      recommendations.push('Regular monitoring and periodic risk assessments recommended');
    }

    // Add specific recommendations based on top risk factors
    topRiskFactors.forEach(({ factor, score }) => {
      if (score > 70) {
        recommendations.push(`High ${factor} risk detected - implement specific mitigation strategies`);
      } else if (score > 50) {
        recommendations.push(`Moderate ${factor} risk - consider additional monitoring`);
      }
    });

    // Determine risk trend (mock implementation - in practice this would use historical data)
    const riskTrend: 'improving' | 'worsening' | 'stable' = 
      riskResponse.risk_score < 30 ? 'improving' : 
      riskResponse.risk_score > 70 ? 'worsening' : 'stable';

    setInsights({
      overallRisk: riskResponse.risk_level,
      topRiskFactors,
      recommendations,
      riskTrend,
    });
  }, [riskResponse]);

  return insights;
}

// Hook for risk score comparison across assets
export function useRiskComparison(riskResponses: RiskResponse[]) {
  const [comparison, setComparison] = useState<{
    averageRisk: number;
    riskDistribution: Record<string, number>;
    highestRiskAsset: RiskResponse | null;
    lowestRiskAsset: RiskResponse | null;
    riskRanking: Array<{ asset_id: string; risk_score: number; risk_level: string }>;
  } | null>(null);

  useEffect(() => {
    if (riskResponses.length === 0) {
      setComparison(null);
      return;
    }

    // Calculate average risk
    const totalRisk = riskResponses.reduce((sum, response) => sum + response.risk_score, 0);
    const averageRisk = totalRisk / riskResponses.length;

    // Calculate risk distribution
    const riskDistribution = riskResponses.reduce((acc, response) => {
      acc[response.risk_level] = (acc[response.risk_level] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Find highest and lowest risk assets
    const highestRiskAsset = riskResponses.reduce((highest, current) => 
      current.risk_score > highest.risk_score ? current : highest
    );
    
    const lowestRiskAsset = riskResponses.reduce((lowest, current) => 
      current.risk_score < lowest.risk_score ? current : lowest
    );

    // Create risk ranking
    const riskRanking = riskResponses
      .map(response => ({
        asset_id: response.asset_id,
        risk_score: response.risk_score,
        risk_level: response.risk_level,
      }))
      .sort((a, b) => b.risk_score - a.risk_score);

    setComparison({
      averageRisk,
      riskDistribution,
      highestRiskAsset,
      lowestRiskAsset,
      riskRanking,
    });
  }, [riskResponses]);

  return comparison;
}

// Hook for risk threshold monitoring
export function useRiskThresholdMonitoring(
  riskScore: number,
  thresholds: {
    warning: number;
    critical: number;
  } = { warning: 50, critical: 75 }
) {
  const [alerts, setAlerts] = useState<{
    level: 'none' | 'warning' | 'critical';
    message: string;
    requiresAction: boolean;
  }>({
    level: 'none',
    message: '',
    requiresAction: false,
  });

  useEffect(() => {
    if (riskScore >= thresholds.critical) {
      setAlerts({
        level: 'critical',
        message: `Critical risk level detected (${riskScore}). Immediate action required.`,
        requiresAction: true,
      });
    } else if (riskScore >= thresholds.warning) {
      setAlerts({
        level: 'warning',
        message: `Warning risk level detected (${riskScore}). Monitor closely.`,
        requiresAction: false,
      });
    } else {
      setAlerts({
        level: 'none',
        message: 'Risk level within acceptable range.',
        requiresAction: false,
      });
    }
  }, [riskScore, thresholds]);

  return alerts;
}
