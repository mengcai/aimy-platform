import { z } from 'zod';

// Base entity schema
export const BaseEntitySchema = z.object({
  id: z.string().uuid(),
  createdAt: z.date(),
  updatedAt: z.date()
});

// Asset schemas
export const AssetSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1).max(255),
  description: z.string().min(1).max(1000),
  type: z.enum(['real_estate', 'infrastructure', 'renewable_energy', 'commodities', 'private_equity', 'art', 'intellectual_property']),
  location: z.string().min(1).max(255),
  estimatedValue: z.number().positive(),
  currency: z.string().length(3),
  documents: z.array(z.string().uuid()),
  metadata: z.record(z.any()).optional(),
  status: z.enum(['draft', 'under_review', 'approved', 'rejected', 'active', 'suspended']),
  issuerId: z.string().uuid(),
  tokenizationStatus: z.enum(['not_started', 'in_progress', 'completed', 'failed']),
  createdAt: z.date(),
  updatedAt: z.date()
});

export const CreateAssetSchema = AssetSchema.omit({ id: true, createdAt: true, updatedAt: true });
export const UpdateAssetSchema = AssetSchema.partial().omit({ id: true, createdAt: true, updatedAt: true });

// Investor schemas
export const InvestorSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1).max(255),
  email: z.string().email(),
  phone: z.string().optional(),
  dateOfBirth: z.date(),
  nationality: z.string().length(2),
  kycLevel: z.enum(['tier_1', 'tier_2', 'tier_3']),
  complianceStatus: z.enum(['pending', 'approved', 'rejected', 'under_review', 'suspended']),
  riskProfile: z.enum(['conservative', 'moderate', 'aggressive']),
  portfolio: z.string().uuid(),
  documents: z.array(z.string().uuid()),
  createdAt: z.date(),
  updatedAt: z.date()
});

export const CreateInvestorSchema = InvestorSchema.omit({ id: true, createdAt: true, updatedAt: true });
export const UpdateInvestorSchema = InvestorSchema.partial().omit({ id: true, createdAt: true, updatedAt: true });

// Issuer schemas
export const IssuerSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1).max(255),
  type: z.enum(['corporation', 'fund', 'spv', 'government']),
  jurisdiction: z.string().length(2),
  registrationNumber: z.string().min(1).max(100),
  complianceStatus: z.enum(['pending', 'approved', 'rejected', 'under_review', 'suspended']),
  kycStatus: z.enum(['not_started', 'in_progress', 'completed', 'failed']),
  assets: z.array(z.string().uuid()),
  documents: z.array(z.string().uuid()),
  createdAt: z.date(),
  updatedAt: z.date()
});

export const CreateIssuerSchema = IssuerSchema.omit({ id: true, createdAt: true, updatedAt: true });
export const UpdateIssuerSchema = IssuerSchema.partial().omit({ id: true, createdAt: true, updatedAt: true });

// Security Token schemas
export const SecurityTokenSchema = z.object({
  id: z.string().uuid(),
  symbol: z.string().min(1).max(10).regex(/^[A-Z0-9]+$/),
  name: z.string().min(1).max(255),
  assetId: z.string().uuid(),
  totalSupply: z.number().positive(),
  decimals: z.number().int().min(0).max(18),
  standard: z.enum(['ERC_3643', 'ERC_20', 'ERC_721']),
  complianceRules: z.array(z.string().uuid()),
  transferRestrictions: z.array(z.string().uuid()),
  status: z.enum(['minting', 'active', 'paused', 'burned']),
  createdAt: z.date(),
  updatedAt: z.date()
});

export const CreateSecurityTokenSchema = SecurityTokenSchema.omit({ id: true, createdAt: true, updatedAt: true });
export const UpdateSecurityTokenSchema = SecurityTokenSchema.partial().omit({ id: true, createdAt: true, updatedAt: true });

// Document schemas
export const DocumentSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1).max(255),
  type: z.enum(['id_document', 'proof_of_address', 'financial_statement', 'asset_document', 'legal_document']),
  url: z.string().url(),
  mimeType: z.string(),
  size: z.number().positive(),
  hash: z.string().length(64),
  metadata: z.record(z.any()).optional(),
  createdAt: z.date(),
  updatedAt: z.date()
});

export const CreateDocumentSchema = DocumentSchema.omit({ id: true, createdAt: true, updatedAt: true });
export const UpdateDocumentSchema = DocumentSchema.partial().omit({ id: true, createdAt: true, updatedAt: true });

// Portfolio schemas
export const PortfolioSchema = z.object({
  id: z.string().uuid(),
  investorId: z.string().uuid(),
  tokens: z.array(z.object({
    tokenId: z.string().uuid(),
    quantity: z.number().positive(),
    averagePrice: z.number().positive(),
    currentValue: z.number().positive()
  })),
  totalValue: z.number().positive(),
  currency: z.string().length(3),
  performance: z.object({
    totalReturn: z.number(),
    annualizedReturn: z.number(),
    volatility: z.number(),
    sharpeRatio: z.number(),
    maxDrawdown: z.number()
  }),
  createdAt: z.date(),
  updatedAt: z.date()
});

export const CreatePortfolioSchema = PortfolioSchema.omit({ id: true, createdAt: true, updatedAt: true });
export const UpdatePortfolioSchema = PortfolioSchema.partial().omit({ id: true, createdAt: true, updatedAt: true });

// AI and Valuation schemas
export const ValuationModelSchema = z.object({
  assetId: z.string().uuid(),
  timestamp: z.date(),
  value: z.number().positive(),
  currency: z.string().length(3),
  confidence: z.number().min(0).max(1),
  factors: z.array(z.object({
    name: z.string(),
    weight: z.number().min(0).max(1),
    impact: z.number(),
    description: z.string()
  })),
  modelVersion: z.string()
});

export const RiskScoreSchema = z.object({
  assetId: z.string().uuid(),
  timestamp: z.date(),
  overallScore: z.number().min(0).max(100),
  categoryScores: z.record(z.number().min(0).max(100)),
  factors: z.array(z.object({
    category: z.enum(['market', 'credit', 'liquidity', 'operational', 'regulatory', 'technology']),
    score: z.number().min(0).max(100),
    weight: z.number().min(0).max(1),
    description: z.string(),
    mitigation: z.array(z.string())
  })),
  recommendations: z.array(z.string())
});

export const YieldPredictionSchema = z.object({
  assetId: z.string().uuid(),
  timestamp: z.date(),
  predictedYield: z.number(),
  confidence: z.number().min(0).max(1),
  timeHorizon: z.number().positive(),
  factors: z.array(z.object({
    name: z.string(),
    impact: z.number(),
    description: z.string(),
    uncertainty: z.number().min(0).max(1)
  }))
});

// Compliance schemas
export const ComplianceCheckSchema = z.object({
  id: z.string().uuid(),
  entityId: z.string().uuid(),
  entityType: z.enum(['investor', 'issuer', 'asset']),
  checkType: z.enum(['kyc', 'aml', 'sanctions', 'risk_assessment']),
  status: z.enum(['pending', 'approved', 'rejected', 'under_review', 'suspended']),
  score: z.number().min(0).max(100),
  details: z.array(z.object({
    rule: z.string(),
    status: z.enum(['pass', 'fail', 'warning']),
    description: z.string(),
    evidence: z.array(z.string())
  })),
  nextReviewDate: z.date(),
  createdAt: z.date(),
  updatedAt: z.date()
});

export const SanctionsScreeningSchema = z.object({
  id: z.string().uuid(),
  entityId: z.string().uuid(),
  entityType: z.enum(['investor', 'issuer']),
  screeningType: z.enum(['real_time', 'batch', 'periodic']),
  status: z.enum(['pending', 'completed', 'failed']),
  matches: z.array(z.object({
    list: z.string(),
    entity: z.string(),
    matchType: z.enum(['exact', 'fuzzy', 'partial']),
    confidence: z.number().min(0).max(1),
    description: z.string()
  })),
  riskLevel: z.enum(['low', 'medium', 'high', 'critical']),
  createdAt: z.date(),
  updatedAt: z.date()
});

// Payment and Settlement schemas
export const PaymentSchema = z.object({
  id: z.string().uuid(),
  amount: z.number().positive(),
  currency: z.string().length(3),
  fromEntity: z.string().uuid(),
  toEntity: z.string().uuid(),
  type: z.enum(['token_purchase', 'dividend', 'interest', 'redemption', 'fee']),
  status: z.enum(['pending', 'processing', 'completed', 'failed', 'cancelled']),
  method: z.enum(['stablecoin', 'bank_transfer', 'crypto']),
  reference: z.string(),
  metadata: z.record(z.any()).optional(),
  createdAt: z.date(),
  updatedAt: z.date()
});

export const SettlementSchema = z.object({
  id: z.string().uuid(),
  paymentId: z.string().uuid(),
  status: z.enum(['pending', 'settled', 'failed']),
  settlementDate: z.date(),
  fees: z.number().min(0),
  netAmount: z.number().positive(),
  confirmation: z.string(),
  createdAt: z.date(),
  updatedAt: z.date()
});

// Liquidity schemas
export const ExchangeSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1).max(255),
  type: z.enum(['cex', 'dex', 'hybrid']),
  supportedTokens: z.array(z.string()),
  tradingPairs: z.array(z.object({
    baseToken: z.string(),
    quoteToken: z.string(),
    price: z.number().positive(),
    volume24h: z.number().min(0),
    change24h: z.number()
  })),
  fees: z.object({
    maker: z.number().min(0),
    taker: z.number().min(0),
    withdrawal: z.number().min(0),
    deposit: z.number().min(0)
  }),
  status: z.enum(['active', 'maintenance', 'suspended']),
  createdAt: z.date(),
  updatedAt: z.date()
});

// Query and filter schemas
export const PaginationSchema = z.object({
  page: z.number().int().min(1).default(1),
  limit: z.number().int().min(1).max(100).default(20),
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).default('desc')
});

export const AssetFilterSchema = z.object({
  type: z.enum(['real_estate', 'infrastructure', 'renewable_energy', 'commodities', 'private_equity', 'art', 'intellectual_property']).optional(),
  status: z.enum(['draft', 'under_review', 'approved', 'rejected', 'active', 'suspended']).optional(),
  minValue: z.number().positive().optional(),
  maxValue: z.number().positive().optional(),
  location: z.string().optional(),
  issuerId: z.string().uuid().optional()
});

export const InvestorFilterSchema = z.object({
  kycLevel: z.enum(['tier_1', 'tier_2', 'tier_3']).optional(),
  complianceStatus: z.enum(['pending', 'approved', 'rejected', 'under_review', 'suspended']).optional(),
  riskProfile: z.enum(['conservative', 'moderate', 'aggressive']).optional(),
  nationality: z.string().length(2).optional()
});

// Export all schemas
export {
  BaseEntitySchema,
  AssetSchema,
  CreateAssetSchema,
  UpdateAssetSchema,
  InvestorSchema,
  CreateInvestorSchema,
  UpdateInvestorSchema,
  IssuerSchema,
  CreateIssuerSchema,
  UpdateIssuerSchema,
  SecurityTokenSchema,
  CreateSecurityTokenSchema,
  UpdateSecurityTokenSchema,
  DocumentSchema,
  CreateDocumentSchema,
  UpdateDocumentSchema,
  PortfolioSchema,
  CreatePortfolioSchema,
  UpdatePortfolioSchema,
  ValuationModelSchema,
  RiskScoreSchema,
  YieldPredictionSchema,
  ComplianceCheckSchema,
  SanctionsScreeningSchema,
  PaymentSchema,
  SettlementSchema,
  ExchangeSchema,
  PaginationSchema,
  AssetFilterSchema,
  InvestorFilterSchema
};
