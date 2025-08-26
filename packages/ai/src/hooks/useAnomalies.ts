import { useState, useCallback, useEffect } from 'react';
import { defaultAIClient, AnomalyRequest, AnomalyResponse } from '../client/ai-client';

export interface UseAnomaliesOptions {
  autoFetch?: boolean;
  refetchInterval?: number;
  onSuccess?: (data: AnomalyResponse) => void;
  onError?: (error: Error) => void;
}

export interface UseAnomaliesReturn {
  data: AnomalyResponse | null;
  loading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
  detectAnomalies: (request: AnomalyRequest) => Promise<AnomalyResponse>;
  reset: () => void;
}

export function useAnomalies(
  initialRequest?: AnomalyRequest,
  options: UseAnomaliesOptions = {}
): UseAnomaliesReturn {
  const [data, setData] = useState<AnomalyResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const {
    autoFetch = false,
    refetchInterval,
    onSuccess,
    onError,
  } = options;

  const detectAnomalies = useCallback(async (request: AnomalyRequest): Promise<AnomalyResponse> => {
    try {
      setLoading(true);
      setError(null);

      // Validate request
      if (!defaultAIClient.validateAnomalyRequest(request)) {
        throw new Error('Invalid anomaly detection request data');
      }

      const response = await defaultAIClient.detectAnomalies(request);
      
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
      await detectAnomalies(initialRequest);
    }
  }, [initialRequest, detectAnomalies]);

  const reset = useCallback(() => {
    setData(null);
    setError(null);
    setLoading(false);
  }, []);

  // Auto-fetch on mount if enabled
  useEffect(() => {
    if (autoFetch && initialRequest) {
      detectAnomalies(initialRequest);
    }
  }, [autoFetch, initialRequest, detectAnomalies]);

  // Set up refetch interval if specified
  useEffect(() => {
    if (refetchInterval && initialRequest) {
      const interval = setInterval(() => {
        detectAnomalies(initialRequest);
      }, refetchInterval);

      return () => clearInterval(interval);
    }
  }, [refetchInterval, initialRequest, detectAnomalies]);

  return {
    data,
    loading,
    error,
    refetch,
    detectAnomalies,
    reset,
  };
}

// Hook for batch anomaly detection
export function useBatchAnomalyDetection() {
  const [data, setData] = useState<AnomalyResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const batchDetectAnomalies = useCallback(async (requests: AnomalyRequest[]): Promise<AnomalyResponse[]> => {
    try {
      setLoading(true);
      setError(null);

      // Validate all requests
      for (const request of requests) {
        if (!defaultAIClient.validateAnomalyRequest(request)) {
          throw new Error(`Invalid anomaly detection request for asset ${request.asset_id}`);
        }
      }

      const responses = await defaultAIClient.batchDetectAnomalies(requests);
      
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
    batchDetectAnomalies,
    reset,
  };
}

// Hook for anomaly analysis and insights
export function useAnomalyAnalysis(anomalyResponse: AnomalyResponse | null) {
  const [insights, setInsights] = useState<{
    severity: 'LOW' | 'MEDIUM' | 'HIGH';
    anomalyCount: number;
    criticalAnomalies: number;
    recommendations: string[];
    trendAnalysis: string;
  } | null>(null);

  useEffect(() => {
    if (!anomalyResponse) {
      setInsights(null);
      return;
    }

    const anomalies = anomalyResponse.anomalies_detected;
    const anomalyCount = anomalies.length;
    
    // Count critical anomalies
    const criticalAnomalies = anomalies.filter(
      anomaly => anomaly.severity === 'HIGH'
    ).length;

    // Determine overall severity
    let severity: 'LOW' | 'MEDIUM' | 'HIGH' = 'LOW';
    if (criticalAnomalies > 0) {
      severity = 'HIGH';
    } else if (anomalyCount > 0) {
      severity = 'MEDIUM';
    }

    // Generate recommendations
    const recommendations: string[] = [];
    
    if (severity === 'HIGH') {
      recommendations.push('Immediate investigation required for critical anomalies');
      recommendations.push('Consider implementing additional monitoring and alerting');
      recommendations.push('Review system health and performance metrics');
    } else if (severity === 'MEDIUM') {
      recommendations.push('Monitor anomalies closely and investigate root causes');
      recommendations.push('Review historical patterns and trends');
      recommendations.push('Consider preventive maintenance or optimization');
    } else {
      recommendations.push('System operating normally - continue regular monitoring');
      recommendations.push('Maintain current monitoring and alerting thresholds');
    }

    // Add specific recommendations based on anomaly types
    if (anomalyCount > 0) {
      recommendations.push(`Investigate ${anomalyCount} detected anomaly(ies)`);
      
      // Analyze anomaly patterns
      const severityCounts = anomalies.reduce((acc, anomaly) => {
        acc[anomaly.severity] = (acc[anomaly.severity] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      if (severityCounts.HIGH) {
        recommendations.push(`${severityCounts.HIGH} high-severity anomalies require immediate attention`);
      }
      if (severityCounts.MEDIUM) {
        recommendations.push(`${severityCounts.MEDIUM} medium-severity anomalies should be investigated`);
      }
    }

    // Trend analysis
    let trendAnalysis = 'No anomalies detected';
    if (anomalyCount > 0) {
      if (anomalyCount > 5) {
        trendAnalysis = 'High anomaly rate detected - system may be experiencing issues';
      } else if (anomalyCount > 2) {
        trendAnalysis = 'Moderate anomaly rate - monitor closely for patterns';
      } else {
        trendAnalysis = 'Low anomaly rate - investigate individual cases';
      }
    }

    setInsights({
      severity,
      anomalyCount,
      criticalAnomalies,
      recommendations,
      trendAnalysis,
    });
  }, [anomalyResponse]);

  return insights;
}

// Hook for real-time anomaly monitoring
export function useRealTimeAnomalyMonitoring(
  assetId: string,
  timeSeriesData: Array<Record<string, any>>,
  monitoringInterval: number = 60000 // 1 minute
) {
  const [anomalies, setAnomalies] = useState<AnomalyResponse[]>([]);
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [lastCheck, setLastCheck] = useState<Date | null>(null);

  const startMonitoring = useCallback(async () => {
    setIsMonitoring(true);
    
    const checkForAnomalies = async () => {
      try {
        const request: AnomalyRequest = {
          asset_id: assetId,
          time_series_data: timeSeriesData,
        };

        const response = await defaultAIClient.detectAnomalies(request);
        
        if (response.anomalies_detected.length > 0) {
          setAnomalies(prev => [...prev, response]);
        }
        
        setLastCheck(new Date());
      } catch (error) {
        console.error('Error during anomaly monitoring:', error);
      }
    };

    // Initial check
    await checkForAnomalies();

    // Set up interval
    const interval = setInterval(checkForAnomalies, monitoringInterval);

    return () => clearInterval(interval);
  }, [assetId, timeSeriesData, monitoringInterval]);

  const stopMonitoring = useCallback(() => {
    setIsMonitoring(false);
  }, []);

  const clearAnomalies = useCallback(() => {
    setAnomalies([]);
  }, []);

  return {
    anomalies,
    isMonitoring,
    lastCheck,
    startMonitoring,
    stopMonitoring,
    clearAnomalies,
  };
}

// Hook for anomaly threshold configuration
export function useAnomalyThresholds(
  initialThresholds: {
    low: number;
    medium: number;
    high: number;
  } = { low: 0.3, medium: 0.6, high: 0.8 }
) {
  const [thresholds, setThresholds] = useState(initialThresholds);

  const updateThresholds = useCallback((newThresholds: Partial<typeof thresholds>) => {
    setThresholds(prev => ({ ...prev, ...newThresholds }));
  }, []);

  const resetThresholds = useCallback(() => {
    setThresholds(initialThresholds);
  }, [initialThresholds]);

  const getSeverityLevel = useCallback((anomalyScore: number): 'LOW' | 'MEDIUM' | 'HIGH' => {
    if (anomalyScore >= thresholds.high) return 'HIGH';
    if (anomalyScore >= thresholds.medium) return 'MEDIUM';
    if (anomalyScore >= thresholds.low) return 'LOW';
    return 'LOW';
  }, [thresholds]);

  return {
    thresholds,
    updateThresholds,
    resetThresholds,
    getSeverityLevel,
  };
}

// Hook for anomaly pattern detection
export function useAnomalyPatternDetection(anomalyResponses: AnomalyResponse[]) {
  const [patterns, setPatterns] = useState<{
    temporalPatterns: Array<{ time: string; count: number }>;
    severityPatterns: Record<string, number>;
    assetPatterns: Record<string, number>;
    commonCharacteristics: string[];
  } | null>(null);

  useEffect(() => {
    if (anomalyResponses.length === 0) {
      setPatterns(null);
      return;
    }

    // Analyze temporal patterns
    const temporalMap = new Map<string, number>();
    anomalyResponses.forEach(response => {
      const date = new Date(response.timestamp).toDateString();
      temporalMap.set(date, (temporalMap.get(date) || 0) + 1);
    });

    const temporalPatterns = Array.from(temporalMap.entries())
      .map(([time, count]) => ({ time, count }))
      .sort((a, b) => new Date(a.time).getTime() - new Date(b.time).getTime());

    // Analyze severity patterns
    const severityPatterns: Record<string, number> = {};
    anomalyResponses.forEach(response => {
      response.anomalies_detected.forEach(anomaly => {
        severityPatterns[anomaly.severity] = (severityPatterns[anomaly.severity] || 0) + 1;
      });
    });

    // Analyze asset patterns
    const assetPatterns: Record<string, number> = {};
    anomalyResponses.forEach(response => {
      assetPatterns[response.asset_id] = (assetPatterns[response.asset_id] || 0) + 1;
    });

    // Identify common characteristics
    const commonCharacteristics: string[] = [];
    
    if (temporalPatterns.some(p => p.count > 3)) {
      commonCharacteristics.push('Clustered temporal occurrence');
    }
    
    if (severityPatterns.HIGH > 0) {
      commonCharacteristics.push('High-severity anomalies present');
    }
    
    if (Object.keys(assetPatterns).length === 1) {
      commonCharacteristics.push('Single asset affected');
    } else if (Object.keys(assetPatterns).length > 3) {
      commonCharacteristics.push('Multiple assets affected');
    }

    setPatterns({
      temporalPatterns,
      severityPatterns,
      assetPatterns,
      commonCharacteristics,
    });
  }, [anomalyResponses]);

  return patterns;
}
