// Core entity interfaces
export interface BaseEntity {
  id: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Asset extends BaseEntity {
  name: string;
  description: string;
  type: AssetType;
  location: string;
  estimatedValue: number;
  currency: string;
  documents: Document[];
  metadata: Record<string, any>;
  status: AssetStatus;
  issuerId: string;
  tokenizationStatus: TokenizationStatus;
}

export interface Investor extends BaseEntity {
  name: string;
  email: string;
  phone?: string;
  dateOfBirth: Date;
  nationality: string;
  kycLevel: KYCLevel;
  complianceStatus: ComplianceStatus;
  riskProfile: RiskProfile;
  portfolio: Portfolio;
  documents: Document[];
}

export interface Issuer extends BaseEntity {
  name: string;
  type: IssuerType;
  jurisdiction: string;
  registrationNumber: string;
  complianceStatus: ComplianceStatus;
  kycStatus: KYCStatus;
  assets: Asset[];
  documents: Document[];
}

export interface SecurityToken extends BaseEntity {
  symbol: string;
  name: string;
  assetId: string;
  totalSupply: number;
  decimals: number;
  standard: TokenStandard;
  complianceRules: ComplianceRule[];
  transferRestrictions: TransferRestriction[];
  status: TokenStatus;
}

export interface ComplianceRule {
  id: string;
  name: string;
  description: string;
  type: ComplianceRuleType;
  conditions: ComplianceCondition[];
  actions: ComplianceAction[];
  priority: number;
  isActive: boolean;
}

export interface ComplianceCondition {
  field: string;
  operator: 'equals' | 'not_equals' | 'greater_than' | 'less_than' | 'contains' | 'in';
  value: any;
  logicalOperator?: 'and' | 'or';
}

export interface ComplianceAction {
  type: 'allow' | 'deny' | 'flag' | 'require_approval';
  parameters: Record<string, any>;
}

export interface TransferRestriction {
  id: string;
  type: TransferRestrictionType;
  description: string;
  conditions: TransferCondition[];
  isActive: boolean;
}

export interface TransferCondition {
  field: string;
  operator: 'equals' | 'not_equals' | 'greater_than' | 'less_than' | 'contains' | 'in';
  value: any;
  logicalOperator?: 'and' | 'or';
}

export interface Document extends BaseEntity {
  name: string;
  type: DocumentType;
  url: string;
  mimeType: string;
  size: number;
  hash: string;
  metadata: Record<string, any>;
}

export interface Portfolio extends BaseEntity {
  investorId: string;
  tokens: PortfolioToken[];
  totalValue: number;
  currency: string;
  performance: PerformanceMetrics;
}

export interface PortfolioToken {
  tokenId: string;
  quantity: number;
  averagePrice: number;
  currentValue: number;
}

export interface PerformanceMetrics {
  totalReturn: number;
  annualizedReturn: number;
  volatility: number;
  sharpeRatio: number;
  maxDrawdown: number;
}

// AI and Valuation types
export interface ValuationModel {
  assetId: string;
  timestamp: Date;
  value: number;
  currency: string;
  confidence: number;
  factors: ValuationFactor[];
  modelVersion: string;
}

export interface ValuationFactor {
  name: string;
  weight: number;
  impact: number;
  description: string;
}

export interface RiskScore {
  assetId: string;
  timestamp: Date;
  overallScore: number;
  categoryScores: Record<RiskCategory, number>;
  factors: RiskFactor[];
  recommendations: string[];
}

export interface RiskFactor {
  category: RiskCategory;
  score: number;
  weight: number;
  description: string;
  mitigation: string[];
}

export interface YieldPrediction {
  assetId: string;
  timestamp: Date;
  predictedYield: number;
  confidence: number;
  timeHorizon: number;
  factors: YieldFactor[];
}

export interface YieldFactor {
  name: string;
  impact: number;
  description: string;
  uncertainty: number;
}

// Compliance types
export interface ComplianceCheck extends BaseEntity {
  entityId: string;
  entityType: 'investor' | 'issuer' | 'asset';
  checkType: ComplianceCheckType;
  status: ComplianceStatus;
  score: number;
  details: ComplianceDetail[];
  nextReviewDate: Date;
}

export interface ComplianceDetail {
  rule: string;
  status: 'pass' | 'fail' | 'warning';
  description: string;
  evidence: string[];
}

export interface SanctionsScreening extends BaseEntity {
  entityId: string;
  entityType: 'investor' | 'issuer';
  screeningType: ScreeningType;
  status: ScreeningStatus;
  matches: SanctionsMatch[];
  riskLevel: RiskLevel;
}

export interface SanctionsMatch {
  list: string;
  entity: string;
  matchType: MatchType;
  confidence: number;
  description: string;
}

// Payment and Settlement types
export interface Payment extends BaseEntity {
  amount: number;
  currency: string;
  fromEntity: string;
  toEntity: string;
  type: PaymentType;
  status: PaymentStatus;
  method: PaymentMethod;
  reference: string;
  metadata: Record<string, any>;
}

export interface Settlement extends BaseEntity {
  paymentId: string;
  status: SettlementStatus;
  settlementDate: Date;
  fees: number;
  netAmount: number;
  confirmation: string;
}

export interface PayoutSchedule extends BaseEntity {
  assetId: string;
  frequency: PayoutFrequency;
  amount: number;
  currency: string;
  nextPayoutDate: Date;
  status: PayoutStatus;
  recipients: PayoutRecipient[];
}

export interface PayoutRecipient {
  investorId: string;
  percentage: number;
  amount: number;
}

// Liquidity types
export interface Exchange extends BaseEntity {
  name: string;
  type: ExchangeType;
  supportedTokens: string[];
  tradingPairs: TradingPair[];
  fees: ExchangeFees;
  status: ExchangeStatus;
}

export interface TradingPair {
  baseToken: string;
  quoteToken: string;
  price: number;
  volume24h: number;
  change24h: number;
}

export interface ExchangeFees {
  maker: number;
  taker: number;
  withdrawal: number;
  deposit: number;
}

export interface LiquidityPool extends BaseEntity {
  name: string;
  protocol: DeFiProtocol;
  tokens: PoolToken[];
  totalLiquidity: number;
  apy: number;
  fees: number;
}

export interface PoolToken {
  tokenId: string;
  balance: number;
  weight: number;
}

// Enums
export enum AssetType {
  REAL_ESTATE = 'real_estate',
  INFRASTRUCTURE = 'infrastructure',
  RENEWABLE_ENERGY = 'renewable_energy',
  COMMODITIES = 'commodities',
  PRIVATE_EQUITY = 'private_equity',
  ART = 'art',
  INTELLECTUAL_PROPERTY = 'intellectual_property'
}

export enum AssetStatus {
  DRAFT = 'draft',
  UNDER_REVIEW = 'under_review',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  ACTIVE = 'active',
  SUSPENDED = 'suspended'
}

export enum TokenizationStatus {
  NOT_STARTED = 'not_started',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  FAILED = 'failed'
}

export enum KYCLevel {
  TIER_1 = 'tier_1',
  TIER_2 = 'tier_2',
  TIER_3 = 'tier_3'
}

export enum ComplianceStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  UNDER_REVIEW = 'under_review',
  SUSPENDED = 'suspended'
}

export enum RiskProfile {
  CONSERVATIVE = 'conservative',
  MODERATE = 'moderate',
  AGGRESSIVE = 'aggressive'
}

export enum IssuerType {
  CORPORATION = 'corporation',
  FUND = 'fund',
  SPV = 'spv',
  GOVERNMENT = 'government'
}

export enum KYCStatus {
  NOT_STARTED = 'not_started',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  FAILED = 'failed'
}

export enum TokenStandard {
  ERC_3643 = 'ERC_3643',
  ERC_20 = 'ERC_20',
  ERC_721 = 'ERC_721'
}

export enum TokenStatus {
  MINTING = 'minting',
  ACTIVE = 'active',
  PAUSED = 'paused',
  BURNED = 'burned'
}

export enum DocumentType {
  ID_DOCUMENT = 'id_document',
  PROOF_OF_ADDRESS = 'proof_of_address',
  FINANCIAL_STATEMENT = 'financial_statement',
  ASSET_DOCUMENT = 'asset_document',
  LEGAL_DOCUMENT = 'legal_document'
}

export enum ComplianceCheckType {
  KYC = 'kyc',
  AML = 'aml',
  SANCTIONS = 'sanctions',
  RISK_ASSESSMENT = 'risk_assessment'
}

export enum ScreeningType {
  REAL_TIME = 'real_time',
  BATCH = 'batch',
  PERIODIC = 'periodic'
}

export enum ScreeningStatus {
  PENDING = 'pending',
  COMPLETED = 'completed',
  FAILED = 'failed'
}

export enum RiskLevel {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical'
}

export enum MatchType {
  EXACT = 'exact',
  FUZZY = 'fuzzy',
  PARTIAL = 'partial'
}

export enum PaymentType {
  TOKEN_PURCHASE = 'token_purchase',
  DIVIDEND = 'dividend',
  INTEREST = 'interest',
  REDEMPTION = 'redemption',
  FEE = 'fee'
}

export enum PaymentStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  COMPLETED = 'completed',
  FAILED = 'failed',
  CANCELLED = 'cancelled'
}

export enum PaymentMethod {
  STABLECOIN = 'stablecoin',
  BANK_TRANSFER = 'bank_transfer',
  CRYPTO = 'crypto'
}

export enum SettlementStatus {
  PENDING = 'pending',
  SETTLED = 'settled',
  FAILED = 'failed'
}

export enum PayoutFrequency {
  MONTHLY = 'monthly',
  QUARTERLY = 'quarterly',
  SEMI_ANNUALLY = 'semi_annually',
  ANNUALLY = 'annually'
}

export enum PayoutStatus {
  ACTIVE = 'active',
  PAUSED = 'paused',
  CANCELLED = 'cancelled'
}

export enum ExchangeType {
  CEX = 'cex',
  DEX = 'dex',
  HYBRID = 'hybrid'
}

export enum ExchangeStatus {
  ACTIVE = 'active',
  MAINTENANCE = 'maintenance',
  SUSPENDED = 'suspended'
}

export enum DeFiProtocol {
  UNISWAP = 'uniswap',
  CURVE = 'curve',
  BALANCER = 'balancer',
  AAVE = 'aave',
  COMPOUND = 'compound'
}

export enum RiskCategory {
  MARKET = 'market',
  CREDIT = 'credit',
  LIQUIDITY = 'liquidity',
  OPERATIONAL = 'operational',
  REGULATORY = 'regulatory',
  TECHNOLOGY = 'technology'
}

export enum ComplianceRuleType {
  TRANSFER_RESTRICTION = 'transfer_restriction',
  HOLDING_PERIOD = 'holding_period',
  GEOGRAPHICAL_RESTRICTION = 'geographical_restriction',
  INVESTOR_QUALIFICATION = 'investor_qualification',
  AMOUNT_LIMIT = 'amount_limit'
}

export enum TransferRestrictionType {
  HOLDING_PERIOD = 'holding_period',
  GEOGRAPHICAL = 'geographical',
  INVESTOR_TYPE = 'investor_type',
  AMOUNT_LIMIT = 'amount_limit',
  TIME_RESTRICTION = 'time_restriction'
}
