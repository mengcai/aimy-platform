import { AssetType, RiskCategory } from '@aimy/shared';

// AI Service Configuration
export interface AIServiceConfig {
  baseUrl: string;
  apiKey: string;
  timeout: number;
  maxRetries: number;
  cacheTTL: number;
}

// AI Model Configuration
export interface AIModelConfig {
  name: string;
  version: string;
  confidenceThreshold: number;
  maxRetries: number;
  timeout: number;
}

// Asset Valuation Request
export interface ValuationRequest {
  assetId: string;
  assetType: AssetType;
  marketData: MarketData;
  historicalData: HistoricalData;
  metadata?: Record<string, any>;
}

export interface MarketData {
  timestamp: Date;
  marketCap?: number;
  volume24h?: number;
  priceChange24h?: number;
  volatility?: number;
  sectorPerformance?: number;
  economicIndicators?: EconomicIndicators;
}

export interface EconomicIndicators {
  interestRate?: number;
  inflationRate?: number;
  gdpGrowth?: number;
  unemploymentRate?: number;
  currencyStrength?: number;
}

export interface HistoricalData {
  prices: PricePoint[];
  volumes: VolumePoint[];
  returns: ReturnPoint[];
  metrics: MetricPoint[];
}

export interface PricePoint {
  timestamp: Date;
  price: number;
  currency: string;
}

export interface VolumePoint {
  timestamp: Date;
  volume: number;
}

export interface ReturnPoint {
  timestamp: Date;
  return: number;
  period: string;
}

export interface MetricPoint {
  timestamp: Date;
  metric: string;
  value: number;
}

// Risk Assessment Request
export interface RiskAssessmentRequest {
  assetId: string;
  assetType: AssetType;
  includeFactors?: boolean;
  includeRecommendations?: boolean;
  marketContext?: MarketContext;
  regulatoryContext?: RegulatoryContext;
}

export interface MarketContext {
  marketVolatility: number;
  sectorTrend: 'bullish' | 'bearish' | 'neutral';
  correlationWithMarket: number;
  liquidityMetrics: LiquidityMetrics;
}

export interface LiquidityMetrics {
  bidAskSpread: number;
  marketDepth: number;
  turnoverRatio: number;
  averageVolume: number;
}

export interface RegulatoryContext {
  jurisdiction: string;
  regulatoryChanges: RegulatoryChange[];
  complianceRequirements: string[];
  riskFactors: string[];
}

export interface RegulatoryChange {
  description: string;
  impact: 'positive' | 'negative' | 'neutral';
  effectiveDate: Date;
  probability: number;
}

// Yield Prediction Request
export interface YieldPredictionRequest {
  assetId: string;
  assetType: AssetType;
  timeHorizon: number; // days
  includeFactors?: boolean;
  marketConditions?: MarketConditions;
  assetSpecificFactors?: AssetSpecificFactors;
}

export interface MarketConditions {
  interestRateEnvironment: 'low' | 'medium' | 'high';
  inflationExpectations: number;
  economicOutlook: 'recession' | 'slowdown' | 'growth' | 'boom';
  sectorOutlook: 'declining' | 'stable' | 'growing' | 'booming';
}

export interface AssetSpecificFactors {
  operationalEfficiency: number;
  maintenanceSchedule: MaintenanceSchedule[];
  capacityUtilization: number;
  technologyAdvancements: TechnologyAdvancement[];
}

export interface MaintenanceSchedule {
  type: string;
  frequency: string;
  cost: number;
  impact: 'low' | 'medium' | 'high';
}

export interface TechnologyAdvancement {
  description: string;
  expectedBenefit: number;
  implementationCost: number;
  timeline: number; // months
}

// AI Service Response Types
export interface AIResponse<T> {
  success: boolean;
  data: T;
  metadata: ResponseMetadata;
  errors?: AIError[];
}

export interface ResponseMetadata {
  modelVersion: string;
  processingTime: number;
  confidence: number;
  timestamp: Date;
  requestId: string;
}

export interface AIError {
  code: string;
  message: string;
  details?: Record<string, any>;
  severity: 'low' | 'medium' | 'high' | 'critical';
}

// Caching Types
export interface CacheEntry<T> {
  data: T;
  timestamp: Date;
  ttl: number;
  accessCount: number;
  lastAccessed: Date;
}

export interface CacheConfig {
  maxSize: number;
  defaultTTL: number;
  cleanupInterval: number;
  enableCompression: boolean;
}

// Model Performance Types
export interface ModelPerformance {
  modelId: string;
  version: string;
  accuracy: number;
  precision: number;
  recall: number;
  f1Score: number;
  latency: number;
  throughput: number;
  lastUpdated: Date;
}

export interface ModelMetrics {
  totalRequests: number;
  successfulRequests: number;
  failedRequests: number;
  averageResponseTime: number;
  averageConfidence: number;
  errorRate: number;
}

// Batch Processing Types
export interface BatchRequest<T> {
  requests: T[];
  batchId: string;
  priority: 'low' | 'normal' | 'high' | 'urgent';
  callbackUrl?: string;
  metadata?: Record<string, any>;
}

export interface BatchResponse<T> {
  batchId: string;
  results: BatchResult<T>[];
  summary: BatchSummary;
  errors: AIError[];
}

export interface BatchResult<T> {
  requestId: string;
  success: boolean;
  data?: T;
  error?: AIError;
  processingTime: number;
}

export interface BatchSummary {
  totalRequests: number;
  successfulRequests: number;
  failedRequests: number;
  averageProcessingTime: number;
  totalProcessingTime: number;
}

// Export all types
export type {
  AIServiceConfig,
  AIModelConfig,
  ValuationRequest,
  MarketData,
  HistoricalData,
  PricePoint,
  VolumePoint,
  ReturnPoint,
  MetricPoint,
  RiskAssessmentRequest,
  MarketContext,
  LiquidityMetrics,
  RegulatoryContext,
  RegulatoryChange,
  YieldPredictionRequest,
  MarketConditions,
  AssetSpecificFactors,
  MaintenanceSchedule,
  TechnologyAdvancement,
  AIResponse,
  ResponseMetadata,
  AIError,
  CacheEntry,
  CacheConfig,
  ModelPerformance,
  ModelMetrics,
  BatchRequest,
  BatchResponse,
  BatchResult,
  BatchSummary
};
