// AI utilities for the AIMY platform

import { 
  MarketData, 
  HistoricalData, 
  MarketContext, 
  RegulatoryContext,
  MarketConditions,
  AssetSpecificFactors
} from '../types';

/**
 * AI utility functions
 */
export class AIUtils {
  /**
   * Calculate confidence score based on data quality and model performance
   */
  static calculateConfidence(
    dataQuality: number,
    modelAccuracy: number,
    dataCompleteness: number
  ): number {
    const weights = {
      dataQuality: 0.4,
      modelAccuracy: 0.4,
      dataCompleteness: 0.2,
    };
    
    return (
      dataQuality * weights.dataQuality +
      modelAccuracy * weights.modelAccuracy +
      dataCompleteness * weights.dataCompleteness
    );
  }
  
  /**
   * Normalize market data for AI processing
   */
  static normalizeMarketData(data: MarketData): MarketData {
    return {
      ...data,
      price: this.normalizePrice(data.price),
      volume: this.normalizeVolume(data.volume),
      marketCap: this.normalizeMarketCap(data.marketCap),
      volatility: this.normalizeVolatility(data.volatility),
    };
  }
  
  /**
   * Normalize historical data for time series analysis
   */
  static normalizeHistoricalData(data: HistoricalData[]): HistoricalData[] {
    if (data.length === 0) return data;
    
    const prices = data.map(d => d.price);
    const volumes = data.map(d => d.volume);
    
    const priceStats = this.calculateStats(prices);
    const volumeStats = this.calculateStats(volumes);
    
    return data.map(d => ({
      ...d,
      price: this.zScoreNormalize(d.price, priceStats.mean, priceStats.std),
      volume: this.zScoreNormalize(d.volume, volumeStats.mean, volumeStats.std),
    }));
  }
  
  /**
   * Calculate market sentiment score
   */
  static calculateMarketSentiment(
    marketData: MarketData,
    historicalData: HistoricalData[]
  ): number {
    const priceChange = this.calculatePriceChange(historicalData);
    const volumeChange = this.calculateVolumeChange(historicalData);
    const volatility = marketData.volatility;
    
    // Weighted sentiment calculation
    const sentiment = (
      priceChange * 0.5 +
      volumeChange * 0.3 +
      (1 - volatility) * 0.2
    );
    
    return Math.max(-1, Math.min(1, sentiment)); // Clamp between -1 and 1
  }
  
  /**
   * Extract relevant features for AI models
   */
  static extractFeatures(
    asset: any,
    marketData: MarketData,
    historicalData: HistoricalData[]
  ): Record<string, number> {
    const features: Record<string, number> = {};
    
    // Asset-specific features
    if (asset.type) features.assetType = this.encodeCategorical(asset.type);
    if (asset.industry) features.industry = this.encodeCategorical(asset.industry);
    if (asset.location) features.location = this.encodeCategorical(asset.location);
    
    // Market features
    features.price = marketData.price;
    features.volume = marketData.volume;
    features.marketCap = marketData.marketCap;
    features.volatility = marketData.volatility;
    
    // Historical features
    if (historicalData.length > 0) {
      features.priceChange1D = this.calculatePriceChange(historicalData.slice(-1));
      features.priceChange7D = this.calculatePriceChange(historicalData.slice(-7));
      features.priceChange30D = this.calculatePriceChange(historicalData.slice(-30));
      features.volumeChange1D = this.calculateVolumeChange(historicalData.slice(-1));
      features.volumeChange7D = this.calculateVolumeChange(historicalData.slice(-7));
      features.volumeChange30D = this.calculateVolumeChange(historicalData.slice(-30));
    }
    
    // Derived features
    features.priceToVolumeRatio = marketData.price / (marketData.volume || 1);
    features.marketCapToVolumeRatio = marketData.marketCap / (marketData.volume || 1);
    
    return features;
  }
  
  /**
   * Validate AI model input data
   */
  static validateModelInput(
    data: any,
    requiredFields: string[]
  ): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    for (const field of requiredFields) {
      if (data[field] === undefined || data[field] === null) {
        errors.push(`Missing required field: ${field}`);
      }
    }
    
    // Validate numeric fields
    const numericFields = ['price', 'volume', 'marketCap', 'volatility'];
    for (const field of numericFields) {
      if (data[field] !== undefined && data[field] !== null) {
        if (typeof data[field] !== 'number' || isNaN(data[field])) {
          errors.push(`Field ${field} must be a valid number`);
        }
        if (data[field] < 0) {
          errors.push(`Field ${field} must be non-negative`);
        }
      }
    }
    
    return {
      isValid: errors.length === 0,
      errors,
    };
  }
  
  /**
   * Calculate model performance metrics
   */
  static calculateModelMetrics(
    predictions: number[],
    actuals: number[]
  ): Record<string, number> {
    if (predictions.length !== actuals.length) {
      throw new Error('Predictions and actuals must have the same length');
    }
    
    const n = predictions.length;
    if (n === 0) return {};
    
    // Calculate errors
    const errors = predictions.map((pred, i) => pred - actuals[i]);
    const absoluteErrors = errors.map(err => Math.abs(err));
    const squaredErrors = errors.map(err => err * err);
    
    // Calculate metrics
    const mae = absoluteErrors.reduce((sum, err) => sum + err, 0) / n;
    const mse = squaredErrors.reduce((sum, err) => sum + err, 0) / n;
    const rmse = Math.sqrt(mse);
    
    // Calculate R-squared
    const meanActual = actuals.reduce((sum, val) => sum + val, 0) / n;
    const totalSS = actuals.reduce((sum, val) => sum + Math.pow(val - meanActual, 2), 0);
    const residualSS = squaredErrors.reduce((sum, err) => sum + err, 0);
    const rSquared = totalSS === 0 ? 0 : 1 - (residualSS / totalSS);
    
    return {
      mae, // Mean Absolute Error
      mse, // Mean Squared Error
      rmse, // Root Mean Squared Error
      rSquared, // R-squared
      n, // Number of samples
    };
  }
  
  /**
   * Generate feature importance ranking
   */
  static calculateFeatureImportance(
    features: Record<string, number>[],
    target: number[]
  ): Record<string, number> {
    const featureNames = Object.keys(features[0] || {});
    const importance: Record<string, number> = {};
    
    for (const featureName of featureNames) {
      const featureValues = features.map(f => f[featureName]);
      const correlation = this.calculateCorrelation(featureValues, target);
      importance[featureName] = Math.abs(correlation);
    }
    
    // Sort by importance
    const sortedFeatures = Object.entries(importance)
      .sort(([, a], [, b]) => b - a)
      .reduce((obj, [key, value]) => {
        obj[key] = value;
        return obj;
      }, {} as Record<string, number>);
    
    return sortedFeatures;
  }
  
  /**
   * Private helper methods
   */
  private static normalizePrice(price: number): number {
    return price / 1000; // Normalize to thousands
  }
  
  private static normalizeVolume(volume: number): number {
    return volume / 1000000; // Normalize to millions
  }
  
  private static normalizeMarketCap(marketCap: number): number {
    return marketCap / 1000000000; // Normalize to billions
  }
  
  private static normalizeVolatility(volatility: number): number {
    return Math.min(volatility, 1); // Clamp to 0-1 range
  }
  
  private static zScoreNormalize(value: number, mean: number, std: number): number {
    if (std === 0) return 0;
    return (value - mean) / std;
  }
  
  private static calculateStats(values: number[]): { mean: number; std: number } {
    if (values.length === 0) return { mean: 0, std: 0 };
    
    const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
    const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length;
    const std = Math.sqrt(variance);
    
    return { mean, std };
  }
  
  private static calculatePriceChange(data: HistoricalData[]): number {
    if (data.length < 2) return 0;
    
    const firstPrice = data[0].price;
    const lastPrice = data[data.length - 1].price;
    
    return (lastPrice - firstPrice) / firstPrice;
  }
  
  private static calculateVolumeChange(data: HistoricalData[]): number {
    if (data.length < 2) return 0;
    
    const firstVolume = data[0].volume;
    const lastVolume = data[data.length - 1].volume;
    
    return (lastVolume - firstVolume) / firstVolume;
  }
  
  private static encodeCategorical(value: string): number {
    // Simple hash-based encoding for categorical variables
    let hash = 0;
    for (let i = 0; i < value.length; i++) {
      const char = value.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash) / 2147483647; // Normalize to 0-1 range
  }
  
  private static calculateCorrelation(x: number[], y: number[]): number {
    if (x.length !== y.length || x.length === 0) return 0;
    
    const n = x.length;
    const sumX = x.reduce((sum, val) => sum + val, 0);
    const sumY = y.reduce((sum, val) => sum + val, 0);
    const sumXY = x.reduce((sum, val, i) => sum + val * y[i], 0);
    const sumX2 = x.reduce((sum, val) => sum + val * val, 0);
    const sumY2 = y.reduce((sum, val) => sum + val * val, 0);
    
    const numerator = n * sumXY - sumX * sumY;
    const denominator = Math.sqrt((n * sumX2 - sumX * sumX) * (n * sumY2 - sumY * sumY));
    
    return denominator === 0 ? 0 : numerator / denominator;
  }
}
