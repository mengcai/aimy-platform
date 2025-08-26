// Service interfaces for the AIMY platform

import { Asset, Investor, Issuer, SecurityToken, Portfolio } from '../types';

/**
 * Base service interface
 */
export interface BaseService<T> {
  create(data: Partial<T>): Promise<T>;
  findById(id: string): Promise<T | null>;
  findAll(filters?: Record<string, any>): Promise<T[]>;
  update(id: string, data: Partial<T>): Promise<T>;
  delete(id: string): Promise<boolean>;
  count(filters?: Record<string, any>): Promise<number>;
}

/**
 * Asset service interface
 */
export interface AssetService extends BaseService<Asset> {
  findByType(type: string): Promise<Asset[]>;
  findByIssuer(issuerId: string): Promise<Asset[]>;
  findByStatus(status: string): Promise<Asset[]>;
  findByLocation(location: string): Promise<Asset[]>;
  search(query: string): Promise<Asset[]>;
  updateStatus(id: string, status: string): Promise<Asset>;
  startTokenization(id: string): Promise<Asset>;
  completeTokenization(id: string): Promise<Asset>;
  getTokenizationProgress(id: string): Promise<number>;
}

/**
 * Investor service interface
 */
export interface InvestorService extends BaseService<Investor> {
  findByEmail(email: string): Promise<Investor | null>;
  findByKYCLevel(kycLevel: string): Promise<Investor[]>;
  findByComplianceStatus(status: string): Promise<Investor[]>;
  findByRiskProfile(riskProfile: string): Promise<Investor[]>;
  updateKYCStatus(id: string, status: string): Promise<Investor>;
  updateComplianceStatus(id: string, status: string): Promise<Investor>;
  getPortfolio(id: string): Promise<Portfolio | null>;
  validateInvestmentEligibility(id: string, amount: number): Promise<boolean>;
}

/**
 * Issuer service interface
 */
export interface IssuerService extends BaseService<Issuer> {
  findByType(type: string): Promise<Issuer[]>;
  findByJurisdiction(jurisdiction: string): Promise<Issuer[]>;
  findByComplianceStatus(status: string): Promise<Issuer[]>;
  updateComplianceStatus(id: string, status: string): Promise<Issuer>;
  getAssets(id: string): Promise<Asset[]>;
  validateAssetCreation(id: string): Promise<boolean>;
}

/**
 * Security token service interface
 */
export interface SecurityTokenService extends BaseService<SecurityToken> {
  findByAsset(assetId: string): Promise<SecurityToken | null>;
  findBySymbol(symbol: string): Promise<SecurityToken | null>;
  findByStandard(standard: string): Promise<SecurityToken[]>;
  findByStatus(status: string): Promise<SecurityToken[]>;
  updateStatus(id: string, status: string): Promise<SecurityToken>;
  getTotalSupply(id: string): Promise<number>;
  getCirculatingSupply(id: string): Promise<number>;
  validateTransfer(from: string, to: string, amount: number): Promise<boolean>;
}

/**
 * Portfolio service interface
 */
export interface PortfolioService extends BaseService<Portfolio> {
  findByInvestor(investorId: string): Promise<Portfolio | null>;
  addToken(portfolioId: string, tokenId: string, quantity: number, price: number): Promise<Portfolio>;
  removeToken(portfolioId: string, tokenId: string, quantity: number): Promise<Portfolio>;
  updateTokenValue(portfolioId: string, tokenId: string, newValue: number): Promise<Portfolio>;
  calculateTotalValue(portfolioId: string): Promise<number>;
  calculatePerformance(portfolioId: string, period: string): Promise<Record<string, number>>;
  rebalance(portfolioId: string, targetAllocations: Record<string, number>): Promise<Portfolio>;
}

/**
 * Compliance service interface
 */
export interface ComplianceService {
  checkKYC(entityId: string, entityType: string): Promise<boolean>;
  checkAML(entityId: string, entityType: string): Promise<boolean>;
  checkSanctions(entityId: string, entityType: string): Promise<boolean>;
  runComplianceCheck(entityId: string, entityType: string): Promise<Record<string, any>>;
  updateComplianceStatus(entityId: string, entityType: string, status: string): Promise<void>;
  getComplianceHistory(entityId: string, entityType: string): Promise<Record<string, any>[]>;
  validateTransfer(from: string, to: string, amount: number, tokenId: string): Promise<boolean>;
}

/**
 * AI service interface
 */
export interface AIService {
  getAssetValuation(assetId: string): Promise<Record<string, any>>;
  getRiskScore(assetId: string): Promise<Record<string, any>>;
  getYieldPrediction(assetId: string, timeHorizon: number): Promise<Record<string, any>>;
  analyzeComplianceRisk(entityId: string, entityType: string): Promise<Record<string, any>>;
  generateInvestmentRecommendations(investorId: string): Promise<Record<string, any>[]>;
  detectAnomalies(data: Record<string, any>[]): Promise<Record<string, any>[]>;
}

/**
 * Payment service interface
 */
export interface PaymentService {
  processPayment(
    from: string,
    to: string,
    amount: number,
    currency: string,
    method: string
  ): Promise<Record<string, any>>;
  
  getPaymentStatus(paymentId: string): Promise<Record<string, any>>;
  refundPayment(paymentId: string, amount: number): Promise<Record<string, any>>;
  getPaymentHistory(entityId: string): Promise<Record<string, any>[]>;
  validatePaymentMethod(method: string, amount: number): Promise<boolean>;
}

/**
 * Document service interface
 */
export interface DocumentService {
  uploadDocument(
    file: File,
    metadata: Record<string, any>
  ): Promise<Record<string, any>>;
  
  getDocument(id: string): Promise<Record<string, any> | null>;
  updateDocument(id: string, metadata: Record<string, any>): Promise<Record<string, any>>;
  deleteDocument(id: string): Promise<boolean>;
  getDocumentsByEntity(entityId: string, entityType: string): Promise<Record<string, any>[]>;
  validateDocument(file: File): Promise<boolean>;
}

/**
 * Notification service interface
 */
export interface NotificationService {
  sendNotification(
    userId: string,
    type: string,
    data: Record<string, any>
  ): Promise<boolean>;
  
  sendBulkNotification(
    userIds: string[],
    type: string,
    data: Record<string, any>
  ): Promise<boolean[]>;
  
  getNotificationHistory(userId: string): Promise<Record<string, any>[]>;
  markAsRead(notificationId: string): Promise<void>;
  updateNotificationPreferences(userId: string, preferences: Record<string, any>): Promise<void>;
}

/**
 * Audit service interface
 */
export interface AuditService {
  logAction(
    userId: string,
    action: string,
    resource: string,
    resourceId: string,
    details: Record<string, any>
  ): Promise<void>;
  
  getAuditLog(
    filters: Record<string, any>,
    pagination: Record<string, any>
  ): Promise<Record<string, any>[]>;
  
  exportAuditLog(
    filters: Record<string, any>,
    format: string
  ): Promise<string>;
}

/**
 * Cache service interface
 */
export interface CacheService {
  get<T>(key: string): Promise<T | null>;
  set<T>(key: string, value: T, ttl?: number): Promise<void>;
  delete(key: string): Promise<void>;
  clear(): Promise<void>;
  exists(key: string): Promise<boolean>;
  increment(key: string, value?: number): Promise<number>;
  expire(key: string, ttl: number): Promise<void>;
}

/**
 * Queue service interface
 */
export interface QueueService {
  addJob(
    queue: string,
    data: Record<string, any>,
    options?: Record<string, any>
  ): Promise<string>;
  
  getJob(jobId: string): Promise<Record<string, any> | null>;
  getJobs(queue: string, status: string): Promise<Record<string, any>[]>;
  processJob(queue: string, handler: Function): Promise<void>;
  removeJob(jobId: string): Promise<void>;
  clearQueue(queue: string): Promise<void>;
}

/**
 * Service factory interface
 */
export interface ServiceFactory {
  getAssetService(): AssetService;
  getInvestorService(): InvestorService;
  getIssuerService(): IssuerService;
  getSecurityTokenService(): SecurityTokenService;
  getPortfolioService(): PortfolioService;
  getComplianceService(): ComplianceService;
  getAIService(): AIService;
  getPaymentService(): PaymentService;
  getDocumentService(): DocumentService;
  getNotificationService(): NotificationService;
  getAuditService(): AuditService;
  getCacheService(): CacheService;
  getQueueService(): QueueService;
}

// Export all service interfaces
export type {
  BaseService,
  AssetService,
  InvestorService,
  IssuerService,
  SecurityTokenService,
  PortfolioService,
  ComplianceService,
  AIService,
  PaymentService,
  DocumentService,
  NotificationService,
  AuditService,
  CacheService,
  QueueService,
  ServiceFactory,
};
