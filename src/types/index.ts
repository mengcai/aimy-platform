// Core AIMY Platform Types
export interface Asset {
  id: string;
  name: string;
  type: AssetType;
  status: AssetStatus;
  location: string;
  value: number;
  tokens: number;
  yield: number;
  inceptionDate: string;
  complianceStatus: ComplianceStatus;
  documents: number;
  image: string;
  description: string;
  minInvestment: number;
  maxInvestment: number;
  remainingTokens: number;
  investors: number;
  lastValuation: string;
  riskLevel: RiskLevel;
  sector: string;
  issuer: string;
  tokenSymbol: string;
  maturity: string;
  
  // Asset-specific properties
  technology?: string;
  gridIntegration?: string;
  governmentIncentives?: string;
  environmentalImpact?: string;
  propertyTypes?: string;
  occupancyRate?: string;
  averageLeaseTerm?: string;
  marketArea?: string;
  projectTypes?: string;
  governmentBacking?: string;
  completionStatus?: string;
  economicImpact?: string;
  energyStorage?: string;
  gridCapacity?: string;
  energyMix?: string;
  totalCapacity?: string;
  marketTraction?: string;
  growthRate?: string;
  intellectualProperty?: string;
  commodityTypes?: string;
  diversification?: string;
  storageLocations?: string;
  marketExposure?: string;
  mineralTypes?: string;
  extractionMethods?: string;
  environmentalCompliance?: string;
  provenReserves?: string;
  cropTypes?: string;
  farmingPractices?: string;
  waterRights?: string;
  soilQuality?: string;
  transportationModes?: string;
  warehouseCapacity?: string;
  technologyIntegration?: string;
  strategicLocation?: string;
  powerEfficiency?: string;
  securityCertifications?: string;
  cloudPartners?: string;
  healthcareTenants?: string;
  regulatoryCompliance?: string;
  marketDemand?: string;
}

export type AssetType = 
  | 'renewable_energy'
  | 'real_estate'
  | 'infrastructure'
  | 'commodities'
  | 'technology'
  | 'healthcare';

export type AssetStatus = 'active' | 'pending' | 'draft' | 'inactive';

export type ComplianceStatus = 'verified' | 'pending' | 'draft' | 'rejected';

export type RiskLevel = 'low' | 'medium' | 'high';

export interface Investor {
  id: string;
  name: string;
  email: string;
  country: string;
  accreditationStatus: AccreditationStatus;
  kycStatus: KYCStatus;
  walletAddress: string;
  totalInvestments: number;
  activeInvestments: number;
  joinDate: string;
  lastActivity: string;
}

export type AccreditationStatus = 'accredited' | 'non_accredited' | 'pending';

export type KYCStatus = 'verified' | 'pending' | 'rejected' | 'under_review';

export interface Investment {
  id: string;
  investorId: string;
  assetId: string;
  amount: number;
  tokens: number;
  status: InvestmentStatus;
  date: string;
  type: InvestmentType;
  transactionHash?: string;
}

export type InvestmentStatus = 'pending' | 'confirmed' | 'failed' | 'cancelled';

export type InvestmentType = 'primary' | 'secondary';

export interface Order {
  id: string;
  investorId: string;
  assetId: string;
  type: OrderType;
  side: OrderSide;
  amount: number;
  tokens: number;
  price: number;
  status: OrderStatus;
  createdAt: string;
  updatedAt: string;
  date: string;
  reference: string;
}

export type OrderType = 'market' | 'limit' | 'stop';

export type OrderSide = 'buy' | 'sell';

export type OrderStatus = 'pending' | 'filled' | 'cancelled' | 'rejected' | 'completed' | 'failed';

export interface ComplianceCase {
  id: string;
  type: ComplianceCaseType;
  status: ComplianceCaseStatus;
  priority: Priority;
  description: string;
  assignedTo?: string;
  createdAt: string;
  updatedAt: string;
  dueDate: string;
  tags: string[];
  title: string;
  processingTime?: number;
}

export type ComplianceCaseType = 'kyc_review' | 'transfer_block' | 'compliance_alert' | 'regulatory_update' | 'kyc' | 'aml' | 'compliance' | 'regulatory';

export type ComplianceCaseStatus = 'open' | 'in_progress' | 'resolved' | 'closed' | 'pending' | 'approved' | 'rejected' | 'under_review';

export type Priority = 'low' | 'medium' | 'high' | 'critical';

export interface KYCApplicant {
  id: string;
  name: string;
  email: string;
  status: KYCStatus;
  submittedAt: string;
  documents: number;
  country: string;
  accreditationStatus: AccreditationStatus;
}

export interface Payout {
  id: string;
  assetId: string;
  investorId: string;
  amount: number;
  tokens: number;
  yield: number;
  status: PayoutStatus;
  scheduledDate: string;
  processedDate?: string;
  transactionHash?: string;
}

export type PayoutStatus = 'scheduled' | 'processing' | 'completed' | 'failed';

export interface AIInsight {
  id: string;
  assetId: string;
  type: InsightType;
  title: string;
  description: string;
  confidence: number;
  impact: ImpactLevel;
  createdAt: string;
  recommendations: string[];
}

export type InsightType = 'market_analysis' | 'risk_assessment' | 'performance_prediction' | 'compliance_alert';

export type ImpactLevel = 'low' | 'medium' | 'high' | 'critical';

export interface PlatformMetrics {
  totalAssets: number;
  totalValue: number;
  totalInvestors: number;
  complianceRate: number;
  activeInvestments: number;
  monthlyPayouts: number;
  averageYield: number;
}

export interface User {
  id: string;
  email: string;
  role: UserRole;
  permissions: Permission[];
  profile: UserProfile;
  createdAt: string;
  lastLogin: string;
}

export type UserRole = 'investor' | 'issuer' | 'admin' | 'compliance_officer';

export type Permission = 
  | 'view_assets'
  | 'invest'
  | 'manage_assets'
  | 'review_kyc'
  | 'manage_users'
  | 'view_reports'
  | 'manage_compliance';

export interface UserProfile {
  firstName: string;
  lastName: string;
  company?: string;
  phone?: string;
  avatar?: string;
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Form Types
export interface InvestmentForm {
  assetId: string;
  amount: number;
  investorId: string;
}

export interface KYCForm {
  investorId: string;
  documents: File[];
  notes?: string;
}

export interface AssetForm {
  name: string;
  type: AssetType;
  location: string;
  value: number;
  tokens: number;
  yield: number;
  description: string;
  minInvestment: number;
  maxInvestment: number;
  riskLevel: RiskLevel;
  sector: string;
  issuer: string;
  tokenSymbol: string;
  maturity: string;
}

// Filter Types
export interface AssetFilters {
  search?: string;
  type?: AssetType;
  riskLevel?: RiskLevel;
  sector?: string;
  minYield?: number;
  maxYield?: number;
  minValue?: number;
  maxValue?: number;
}

export interface OrderFilters {
  status?: OrderStatus;
  type?: OrderType;
  side?: OrderSide;
  assetId?: string;
  investorId?: string;
  dateRange?: {
    start: string;
    end: string;
  };
}

// Dashboard Types
export interface DashboardData {
  // Personal Portfolio Metrics
  myAssets: number;
  portfolioValue: number;
  totalReturn: number;
  averageYield: number;
  
  // Platform Overview (for reference)
  metrics: PlatformMetrics;
  recentAssets: Asset[];
  recentInvestments: Investment[];
  pendingComplianceCases: ComplianceCase[];
  aiInsights: AIInsight[];
  performanceChart: ChartData[];
}

export interface ChartData {
  date: string;
  value: number;
  label: string;
}

// Notification Types
export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
  actionUrl?: string;
}

export type NotificationType = 
  | 'investment_confirmed'
  | 'payout_received'
  | 'kyc_approved'
  | 'compliance_alert'
  | 'asset_update'
  | 'system_maintenance';
