// Repository interfaces for the AIMY platform

import { Asset, Investor, Issuer, SecurityToken, Portfolio } from '../types';

/**
 * Base repository interface
 */
export interface BaseRepository<T> {
  create(data: Partial<T>): Promise<T>;
  findById(id: string): Promise<T | null>;
  findAll(filters?: Record<string, any>): Promise<T[]>;
  update(id: string, data: Partial<T>): Promise<T>;
  delete(id: string): Promise<boolean>;
  count(filters?: Record<string, any>): Promise<number>;
  exists(id: string): Promise<boolean>;
}

/**
 * Asset repository interface
 */
export interface AssetRepository extends BaseRepository<Asset> {
  findByType(type: string): Promise<Asset[]>;
  findByIssuer(issuerId: string): Promise<Asset[]>;
  findByStatus(status: string): Promise<Asset[]>;
  findByLocation(location: string): Promise<Asset[]>;
  search(query: string): Promise<Asset[]>;
  findByTokenizationStatus(status: string): Promise<Asset[]>;
  findByValueRange(minValue: number, maxValue: number, currency: string): Promise<Asset[]>;
  findActiveAssets(): Promise<Asset[]>;
  findAssetsByComplianceStatus(status: string): Promise<Asset[]>;
}

/**
 * Investor repository interface
 */
export interface InvestorRepository extends BaseRepository<Investor> {
  findByEmail(email: string): Promise<Investor | null>;
  findByKYCLevel(kycLevel: string): Promise<Investor[]>;
  findByComplianceStatus(status: string): Promise<Investor[]>;
  findByRiskProfile(riskProfile: string): Promise<Investor[]>;
  findByNationality(nationality: string): Promise<Investor[]>;
  findInvestorsByPortfolioValue(minValue: number, currency: string): Promise<Investor[]>;
  findInvestorsByInvestmentAmount(minAmount: number, currency: string): Promise<Investor[]>;
  findInvestorsByLastActivity(days: number): Promise<Investor[]>;
}

/**
 * Issuer repository interface
 */
export interface IssuerRepository extends BaseRepository<Issuer> {
  findByType(type: string): Promise<Issuer[]>;
  findByJurisdiction(jurisdiction: string): Promise<Issuer[]>;
  findByComplianceStatus(status: string): Promise<Issuer[]>;
  findByKYCStatus(status: string): Promise<Issuer[]>;
  findIssuersByAssetCount(minAssets: number): Promise<Issuer[]>;
  findIssuersByRegistrationDate(startDate: Date, endDate: Date): Promise<Issuer[]>;
  findActiveIssuers(): Promise<Issuer[]>;
}

/**
 * Security token repository interface
 */
export interface SecurityTokenRepository extends BaseRepository<SecurityToken> {
  findByAsset(assetId: string): Promise<SecurityToken | null>;
  findBySymbol(symbol: string): Promise<SecurityToken | null>;
  findByStandard(standard: string): Promise<SecurityToken[]>;
  findByStatus(status: string): Promise<SecurityToken[]>;
  findByTotalSupply(minSupply: number, maxSupply: number): Promise<SecurityToken[]>;
  findActiveTokens(): Promise<SecurityToken[]>;
  findTokensByComplianceStatus(status: string): Promise<SecurityToken[]>;
}

/**
 * Portfolio repository interface
 */
export interface PortfolioRepository extends BaseRepository<Portfolio> {
  findByInvestor(investorId: string): Promise<Portfolio | null>;
  findByTotalValue(minValue: number, maxValue: number, currency: string): Promise<Portfolio[]>;
  findPortfoliosByToken(tokenId: string): Promise<Portfolio[]>;
  findPortfoliosByPerformance(minReturn: number, maxReturn: number): Promise<Portfolio[]>;
  findActivePortfolios(): Promise<Portfolio[]>;
  findPortfoliosByLastUpdate(days: number): Promise<Portfolio[]>;
}

/**
 * Document repository interface
 */
export interface DocumentRepository {
  create(data: Record<string, any>): Promise<Record<string, any>>;
  findById(id: string): Promise<Record<string, any> | null>;
  findByEntity(entityId: string, entityType: string): Promise<Record<string, any>[]>;
  findByType(type: string): Promise<Record<string, any>[]>;
  findByMimeType(mimeType: string): Promise<Record<string, any>[]>;
  update(id: string, data: Record<string, any>): Promise<Record<string, any>>;
  delete(id: string): Promise<boolean>;
  count(filters?: Record<string, any>): Promise<number>;
  exists(id: string): Promise<boolean>;
}

/**
 * Compliance check repository interface
 */
export interface ComplianceCheckRepository {
  create(data: Record<string, any>): Promise<Record<string, any>>;
  findById(id: string): Promise<Record<string, any> | null>;
  findByEntity(entityId: string, entityType: string): Promise<Record<string, any>[]>;
  findByType(type: string): Promise<Record<string, any>[]>;
  findByStatus(status: string): Promise<Record<string, any>[]>;
  findByDateRange(startDate: Date, endDate: Date): Promise<Record<string, any>[]>;
  update(id: string, data: Record<string, any>): Promise<Record<string, any>>;
  delete(id: string): Promise<boolean>;
  count(filters?: Record<string, any>): Promise<number>;
  exists(id: string): Promise<boolean>;
}

/**
 * Transaction repository interface
 */
export interface TransactionRepository {
  create(data: Record<string, any>): Promise<Record<string, any>>;
  findById(id: string): Promise<Record<string, any> | null>;
  findByEntity(entityId: string, entityType: string): Promise<Record<string, any>[]>;
  findByType(type: string): Promise<Record<string, any>[]>;
  findByStatus(status: string): Promise<Record<string, any>[]>;
  findByDateRange(startDate: Date, endDate: Date): Promise<Record<string, any>[]>;
  findByAmountRange(minAmount: number, maxAmount: number, currency: string): Promise<Record<string, any>[]>;
  update(id: string, data: Record<string, any>): Promise<Record<string, any>>;
  delete(id: string): Promise<boolean>;
  count(filters?: Record<string, any>): Promise<number>;
  exists(id: string): Promise<boolean>;
}

/**
 * Audit log repository interface
 */
export interface AuditLogRepository {
  create(data: Record<string, any>): Promise<Record<string, any>>;
  findById(id: string): Promise<Record<string, any> | null>;
  findByUser(userId: string): Promise<Record<string, any>[]>;
  findByAction(action: string): Promise<Record<string, any>[]>;
  findByResource(resource: string, resourceId: string): Promise<Record<string, any>[]>;
  findByDateRange(startDate: Date, endDate: Date): Promise<Record<string, any>[]>;
  findBySeverity(severity: string): Promise<Record<string, any>[]>;
  update(id: string, data: Record<string, any>): Promise<Record<string, any>>;
  delete(id: string): Promise<boolean>;
  count(filters?: Record<string, any>): Promise<number>;
  exists(id: string): Promise<boolean>;
}

/**
 * Repository factory interface
 */
export interface RepositoryFactory {
  getAssetRepository(): AssetRepository;
  getInvestorRepository(): InvestorRepository;
  getIssuerRepository(): IssuerRepository;
  getSecurityTokenRepository(): SecurityTokenRepository;
  getPortfolioRepository(): PortfolioRepository;
  getDocumentRepository(): DocumentRepository;
  getComplianceCheckRepository(): ComplianceCheckRepository;
  getTransactionRepository(): TransactionRepository;
  getAuditLogRepository(): AuditLogRepository;
}

/**
 * Repository configuration interface
 */
export interface RepositoryConfig {
  database: {
    host: string;
    port: number;
    name: string;
    user: string;
    password: string;
    ssl?: boolean;
  };
  redis: {
    host: string;
    port: number;
    password?: string;
    db?: number;
  };
  minio: {
    endpoint: string;
    accessKey: string;
    secretKey: string;
    bucket: string;
    region?: string;
  };
  kafka: {
    brokers: string[];
    clientId: string;
    groupId: string;
  };
}

/**
 * Repository connection interface
 */
export interface RepositoryConnection {
  connect(): Promise<void>;
  disconnect(): Promise<void>;
  isConnected(): boolean;
  getHealth(): Promise<Record<string, any>>;
  beginTransaction(): Promise<any>;
  commitTransaction(transaction: any): Promise<void>;
  rollbackTransaction(transaction: any): Promise<void>;
}

/**
 * Repository query builder interface
 */
export interface QueryBuilder<T> {
  select(fields?: string[]): QueryBuilder<T>;
  where(field: string, operator: string, value: any): QueryBuilder<T>;
  andWhere(field: string, operator: string, value: any): QueryBuilder<T>;
  orWhere(field: string, operator: string, value: any): QueryBuilder<T>;
  orderBy(field: string, direction: 'ASC' | 'DESC'): QueryBuilder<T>;
  limit(limit: number): QueryBuilder<T>;
  offset(offset: number): QueryBuilder<T>;
  groupBy(field: string): QueryBuilder<T>;
  having(field: string, operator: string, value: any): QueryBuilder<T>;
  join(table: string, on: string, type?: 'INNER' | 'LEFT' | 'RIGHT'): QueryBuilder<T>;
  build(): string;
  execute(): Promise<T[]>;
  executeOne(): Promise<T | null>;
}

/**
 * Repository pagination interface
 */
export interface PaginationOptions {
  page: number;
  limit: number;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
}

export interface PaginatedResult<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

/**
 * Repository filter interface
 */
export interface RepositoryFilter {
  field: string;
  operator: 'eq' | 'ne' | 'gt' | 'gte' | 'lt' | 'lte' | 'like' | 'in' | 'notIn' | 'between' | 'isNull' | 'isNotNull';
  value: any;
  logicalOperator?: 'AND' | 'OR';
}

/**
 * Repository sort interface
 */
export interface RepositorySort {
  field: string;
  direction: 'ASC' | 'DESC';
}

// Export all repository interfaces
export type {
  BaseRepository,
  AssetRepository,
  InvestorRepository,
  IssuerRepository,
  SecurityTokenRepository,
  PortfolioRepository,
  DocumentRepository,
  ComplianceCheckRepository,
  TransactionRepository,
  AuditLogRepository,
  RepositoryFactory,
  RepositoryConfig,
  RepositoryConnection,
  QueryBuilder,
  PaginationOptions,
  PaginatedResult,
  RepositoryFilter,
  RepositorySort,
};
