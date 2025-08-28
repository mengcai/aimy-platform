'use client';

import React from 'react';
import { useAssetValuation, useYieldForecast, useRiskScore, useAnomalies } from '@aimy/ai';
import { DataCard } from '@/components/ui/layout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, AlertTriangle, Lightbulb, Shield, Target } from 'lucide-react';

interface AIInsight {
  id: string;
  type: 'opportunity' | 'risk' | 'performance' | 'anomaly';
  title: string;
  description: string;
  confidence: number;
  action: string;
  status: 'active' | 'resolved' | 'pending';
}

export function AIInsights() {
  // Mock data for demonstration - in real app, these would come from actual assets
  const mockAssetId = 'solar-farm-001';
  
  // AI hooks for real-time data
  const assetValuation = useAssetValuation({
    asset_id: mockAssetId,
    cashflows: [],
    market_data: [],
    utilization: []
  }, { autoFetch: false });

  const yieldForecast = useYieldForecast({
    asset_id: mockAssetId,
    historical_yields: [0.08, 0.09, 0.085, 0.095, 0.087],
    forecast_horizon: 12
  }, { autoFetch: false });

  const riskScore = useRiskScore({
    asset_id: mockAssetId,
    cashflows: [],
    market_data: [],
    utilization: []
  }, { autoFetch: false });

  const anomalies = useAnomalies({
    asset_id: mockAssetId,
    time_series_data: []
  }, { autoFetch: false });

  // Generate insights based on AI data
  const generateInsights = (): AIInsight[] => {
    const insights: AIInsight[] = [];

    // Asset valuation insight
    if (assetValuation.data) {
      const currentValue = assetValuation.data.estimated_value;
      const confidence = Math.round(assetValuation.data.confidence_score * 100);
      
      insights.push({
        id: 'valuation',
        type: 'performance',
        title: 'Asset Valuation Update',
        description: `Current estimated value: $${currentValue.toLocaleString()}. Confidence: ${confidence}%`,
        confidence,
        action: 'View Details',
        status: 'active'
      });
    }

    // Yield forecast insight
    if (yieldForecast.data) {
      const predictedYield = (yieldForecast.data.predicted_yield * 100).toFixed(1);
      const confidence = Math.round(yieldForecast.data.confidence_score * 100);
      
      insights.push({
        id: 'yield',
        type: 'opportunity',
        title: 'Yield Forecast',
        description: `Expected annual yield: ${predictedYield}% with ${confidence}% confidence`,
        confidence,
        action: 'See Analysis',
        status: 'active'
      });
    }

    // Risk score insight
    if (riskScore.data) {
      const riskLevel = riskScore.data.risk_level;
      const riskScoreValue = (riskScore.data.risk_score * 100).toFixed(0);
      const confidence = Math.round(riskScore.data.confidence_score * 100);
      
      insights.push({
        id: 'risk',
        type: 'risk',
        title: 'Risk Assessment',
        description: `Risk level: ${riskLevel} (${riskScoreValue}/100). Confidence: ${confidence}%`,
        confidence,
        action: 'View Details',
        status: 'active'
      });
    }

    // Anomaly detection insight
    if (anomalies.data && anomalies.data.anomalies_detected.length > 0) {
      const anomalyCount = anomalies.data.anomalies_detected.length;
      const highSeverityCount = anomalies.data.anomalies_detected.filter(
        a => a.severity === 'HIGH'
      ).length;
      const confidence = Math.round(anomalies.data.confidence_score * 100);
      
      insights.push({
        id: 'anomalies',
        type: 'anomaly',
        title: 'Anomalies Detected',
        description: `${anomalyCount} anomaly(ies) detected, ${highSeverityCount} high severity. Confidence: ${confidence}%`,
        confidence,
        action: 'Investigate',
        status: 'active'
      });
    }

    // Add default insights if no AI data available
    if (insights.length === 0) {
      insights.push(
        {
          id: 'market-opportunity',
          type: 'opportunity',
          title: 'Market Opportunity Detected',
          description: 'AI analysis suggests increasing allocation to renewable energy assets by 15% based on market trends.',
          confidence: 87,
          action: 'Review Portfolio',
          status: 'active'
        },
        {
          id: 'risk-assessment',
          type: 'risk',
          title: 'Risk Assessment Update',
          description: 'Portfolio risk score has decreased by 8% due to improved diversification.',
          confidence: 92,
          action: 'View Details',
          status: 'active'
        },
        {
          id: 'performance-forecast',
          type: 'performance',
          title: 'Performance Forecast',
          description: 'Expected annual return adjusted to 8.2% based on current market conditions.',
          confidence: 78,
          action: 'See Analysis',
          status: 'active'
        }
      );
    }

    return insights;
  };

  const insights = generateInsights();

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'opportunity':
        return <TrendingUp className="h-5 w-5 text-success-500" />;
      case 'risk':
        return <Shield className="h-5 w-5 text-warning-500" />;
      case 'performance':
        return <Target className="h-5 w-5 text-aimy-primary" />;
      case 'anomaly':
        return <AlertTriangle className="h-5 w-5 text-error-500" />;
      default:
        return <Lightbulb className="h-5 w-5 text-aimy-accent" />;
    }
  };

  const getInsightVariant = (type: string) => {
    switch (type) {
      case 'opportunity':
        return 'success';
      case 'risk':
        return 'warning';
      case 'anomaly':
        return 'error';
      default:
        return 'default';
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 90) return 'text-success-500';
    if (confidence >= 75) return 'text-warning-500';
    return 'text-error-500';
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-base-ink-900 dark:text-base-ink-100">
            AI Insights
          </h3>
          <p className="text-sm text-base-ink-600 dark:text-base-ink-400">
            Machine learning-powered portfolio analysis
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant="outline" className="text-xs">
            {insights.length} insights
          </Badge>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              // Refresh all AI data
              assetValuation.refetch();
              yieldForecast.refetch();
              riskScore.refetch();
              anomalies.refetch();
            }}
          >
            Refresh
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {insights.map((insight) => (
          <DataCard
            key={insight.id}
            title={insight.title}
            subtitle={
              <div className="flex items-center space-x-2">
                <span className={`text-sm font-medium ${getConfidenceColor(insight.confidence)}`}>
                  {insight.confidence}% confidence
                </span>
                <Badge variant="outline" size="sm">
                  {insight.status}
                </Badge>
              </div>
            }
            value={insight.description}
            variant={getInsightVariant(insight.type)}
            size="sm"
            icon={getInsightIcon(insight.type)}
            actions={
              <Button variant="outline" size="sm">
                {insight.action}
              </Button>
            }
          />
        ))}
      </div>

      {/* Loading states */}
      {(assetValuation.loading || yieldForecast.loading || riskScore.loading || anomalies.loading) && (
        <div className="text-center py-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-aimy-primary mx-auto"></div>
          <p className="text-sm text-base-ink-600 dark:text-base-ink-400 mt-2">
            Updating AI insights...
          </p>
        </div>
      )}

      {/* Error states */}
      {(assetValuation.error || yieldForecast.error || riskScore.error || anomalies.error) && (
        <div className="bg-error-50 dark:bg-error-900/20 border border-error-200 dark:border-error-800 rounded-lg p-4">
          <div className="flex items-center space-x-2">
            <AlertTriangle className="h-5 w-5 text-error-500" />
            <span className="text-sm font-medium text-error-800 dark:text-error-200">
              Some AI insights are temporarily unavailable
            </span>
          </div>
          <p className="text-sm text-error-600 dark:text-error-300 mt-1">
            Please try refreshing or check back later.
          </p>
        </div>
      )}
    </div>
  );
}
