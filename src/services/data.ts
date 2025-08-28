import { 
  Asset, 
  Investor, 
  Investment, 
  Order, 
  ComplianceCase, 
  Payout, 
  AIInsight, 
  PlatformMetrics,
  DashboardData,
  KYCApplicant
} from '../types';

// Mock data that will be consistent across the entire platform
export const ASSETS: Asset[] = [
  {
    id: 'solar-farm-alpha',
    name: 'Solar Farm Alpha',
    type: 'renewable_energy',
    status: 'active',
    location: 'California, USA',
    value: 25000000,
    tokens: 1000000,
    yield: 8.5,
    inceptionDate: '2023-01-15',
    complianceStatus: 'verified',
    documents: 4,
    image: '/api/placeholder/400/300',
    description: 'Large-scale solar energy facility with advanced photovoltaic technology and grid integration.',
    minInvestment: 1000,
    maxInvestment: 100000,
    remainingTokens: 400000,
    investors: 156,
    lastValuation: '2024-01-15',
    riskLevel: 'low',
    sector: 'Clean Energy',
    issuer: 'SolarTech Ventures Ltd',
    tokenSymbol: 'SFA',
    maturity: '25 years',
    technology: 'Advanced Photovoltaic',
    gridIntegration: 'Yes',
    governmentIncentives: 'Federal & State',
    environmentalImpact: 'CO2 reduction: 15,000 tons/year'
  },
  {
    id: 'real-estate-fund-beta',
    name: 'Real Estate Fund Beta',
    type: 'real_estate',
    status: 'active',
    location: 'New York, USA',
    value: 15000000,
    tokens: 600000,
    yield: 6.2,
    inceptionDate: '2023-03-20',
    complianceStatus: 'verified',
    documents: 2,
    image: '/api/placeholder/400/300',
    description: 'Diversified commercial real estate portfolio with prime locations and stable tenants.',
    minInvestment: 5000,
    maxInvestment: 500000,
    remainingTokens: 200000,
    investors: 89,
    lastValuation: '2024-01-10',
    riskLevel: 'medium',
    sector: 'Real Estate',
    issuer: 'Metropolitan Real Estate',
    tokenSymbol: 'REFB',
    maturity: '20 years',
    propertyTypes: 'Office, Retail, Industrial',
    occupancyRate: '92%',
    averageLeaseTerm: '8.5 years',
    marketArea: 'Northeast US'
  },
  {
    id: 'infrastructure-bonds-gamma',
    name: 'Infrastructure Bonds Gamma',
    type: 'infrastructure',
    status: 'active',
    location: 'Texas, USA',
    value: 8000000,
    tokens: 320000,
    yield: 5.8,
    inceptionDate: '2023-06-10',
    complianceStatus: 'verified',
    documents: 1,
    image: '/api/placeholder/400/300',
    description: 'Government-backed infrastructure bonds for transportation and utility projects.',
    minInvestment: 2500,
    maxInvestment: 250000,
    remainingTokens: 80000,
    investors: 234,
    lastValuation: '2024-01-05',
    riskLevel: 'low',
    sector: 'Infrastructure',
    issuer: 'Texas Infrastructure Authority',
    tokenSymbol: 'TIBG',
    maturity: '15 years',
    projectTypes: 'Roads, Bridges, Utilities',
    governmentBacking: 'Yes',
    completionStatus: '75% Complete',
    economicImpact: 'Regional development focus'
  },
  {
    id: 'wind-energy-delta',
    name: 'Wind Energy Delta',
    type: 'renewable_energy',
    status: 'active',
    location: 'Iowa, USA',
    value: 12000000,
    tokens: 480000,
    yield: 7.2,
    inceptionDate: '2023-08-15',
    complianceStatus: 'verified',
    documents: 3,
    image: '/api/placeholder/400/300',
    description: 'Modern wind farm with high-efficiency turbines and energy storage integration.',
    minInvestment: 2000,
    maxInvestment: 200000,
    remainingTokens: 120000,
    investors: 178,
    lastValuation: '2024-01-12',
    riskLevel: 'low',
    sector: 'Clean Energy',
    issuer: 'Iowa Wind Power Co',
    tokenSymbol: 'IWD',
    maturity: '30 years',
    technology: 'High-Efficiency Turbines',
    energyStorage: 'Integrated Battery Systems',
    gridCapacity: '150 MW',
    environmentalImpact: 'CO2 reduction: 8,000 tons/year'
  },
  {
    id: 'tech-startup-epsilon',
    name: 'Tech Startup Epsilon',
    type: 'technology',
    status: 'active',
    location: 'California, USA',
    value: 5000000,
    tokens: 200000,
    yield: 12.5,
    inceptionDate: '2023-11-01',
    complianceStatus: 'verified',
    documents: 5,
    image: '/api/placeholder/400/300',
    description: 'Innovative AI-powered software company with strong market traction and growth potential.',
    minInvestment: 10000,
    maxInvestment: 1000000,
    remainingTokens: 50000,
    investors: 45,
    lastValuation: '2024-01-08',
    riskLevel: 'high',
    sector: 'Technology',
    issuer: 'Epsilon Tech Ventures',
    tokenSymbol: 'ETE',
    maturity: '10 years',
    technology: 'AI & Machine Learning',
    marketTraction: 'Strong',
    growthRate: '150% YoY',
    intellectualProperty: '15 Patents Filed'
  },
  {
    id: 'commodity-fund-zeta',
    name: 'Commodity Fund Zeta',
    type: 'commodities',
    status: 'active',
    location: 'Global',
    value: 18000000,
    tokens: 720000,
    yield: 4.8,
    inceptionDate: '2023-04-10',
    complianceStatus: 'verified',
    documents: 2,
    image: '/api/placeholder/400/300',
    description: 'Diversified commodity portfolio including precious metals, energy, and agricultural products.',
    minInvestment: 3000,
    maxInvestment: 300000,
    remainingTokens: 180000,
    investors: 312,
    lastValuation: '2024-01-03',
    riskLevel: 'medium',
    sector: 'Commodities',
    issuer: 'Global Commodity Partners',
    tokenSymbol: 'GCPZ',
    maturity: '12 years',
    commodityTypes: 'Precious Metals, Energy, Agriculture',
    diversification: 'High',
    storageLocations: 'Multiple Global Facilities',
    marketExposure: 'International Markets'
  },
  {
    id: 'healthcare-reit-eta',
    name: 'Healthcare REIT Eta',
    type: 'healthcare',
    status: 'active',
    location: 'Florida, USA',
    value: 9500000,
    tokens: 380000,
    yield: 6.8,
    inceptionDate: '2023-07-20',
    complianceStatus: 'verified',
    documents: 3,
    image: '/api/placeholder/400/300',
    description: 'Healthcare-focused real estate investment trust with medical office buildings and facilities.',
    minInvestment: 4000,
    maxInvestment: 400000,
    remainingTokens: 95000,
    investors: 134,
    lastValuation: '2024-01-14',
    riskLevel: 'medium',
    sector: 'Healthcare Real Estate',
    issuer: 'Florida Healthcare Properties',
    tokenSymbol: 'FHP',
    maturity: '18 years',
    propertyTypes: 'Medical Offices, Clinics, Labs',
    healthcareTenants: '95% Occupied',
    regulatoryCompliance: 'HIPAA Certified',
    marketDemand: 'Growing Healthcare Sector'
  },
  {
    id: 'data-center-theta',
    name: 'Data Center Theta',
    type: 'infrastructure',
    status: 'active',
    location: 'Virginia, USA',
    value: 22000000,
    tokens: 880000,
    yield: 7.8,
    inceptionDate: '2023-02-15',
    complianceStatus: 'verified',
    documents: 4,
    image: '/api/placeholder/400/300',
    description: 'State-of-the-art data center facility with high-performance computing infrastructure and cloud services.',
    minInvestment: 15000,
    maxInvestment: 750000,
    remainingTokens: 220000,
    investors: 98,
    lastValuation: '2024-01-16',
    riskLevel: 'medium',
    sector: 'Technology Infrastructure',
    issuer: 'Virginia Data Centers LLC',
    tokenSymbol: 'VDC',
    maturity: '22 years',
    technology: 'High-Performance Computing',
    powerEfficiency: 'PUE 1.2',
    securityCertifications: 'SOC 2, ISO 27001',
    cloudPartners: 'AWS, Azure, Google Cloud'
  },
  {
    id: 'agricultural-land-iota',
    name: 'Agricultural Land Iota',
    type: 'real_estate',
    status: 'active',
    location: 'Kansas, USA',
    value: 6500000,
    tokens: 260000,
    yield: 5.2,
    inceptionDate: '2023-09-10',
    complianceStatus: 'verified',
    documents: 2,
    image: '/api/placeholder/400/300',
    description: 'Premium agricultural land with sustainable farming practices and long-term crop contracts.',
    minInvestment: 2000,
    maxInvestment: 150000,
    remainingTokens: 65000,
    investors: 203,
    lastValuation: '2024-01-11',
    riskLevel: 'low',
    sector: 'Agriculture',
    issuer: 'Kansas Farm Partners',
    tokenSymbol: 'KFP',
    maturity: '25 years',
    cropTypes: 'Corn, Soybeans, Wheat',
    farmingPractices: 'Sustainable & Organic',
    waterRights: 'Secure',
    soilQuality: 'Premium Grade A'
  },
  {
    id: 'mining-operation-kappa',
    name: 'Mining Operation Kappa',
    type: 'commodities',
    status: 'active',
    location: 'Nevada, USA',
    value: 35000000,
    tokens: 1400000,
    yield: 9.1,
    inceptionDate: '2023-05-20',
    complianceStatus: 'verified',
    documents: 4,
    image: '/api/placeholder/400/300',
    description: 'Advanced mining operation with sustainable extraction methods and valuable mineral deposits.',
    minInvestment: 5000,
    maxInvestment: 500000,
    remainingTokens: 350000,
    investors: 167,
    lastValuation: '2024-01-09',
    riskLevel: 'high',
    sector: 'Mining & Metals',
    issuer: 'Nevada Mining Corp',
    tokenSymbol: 'NMC',
    maturity: '18 years',
    mineralTypes: 'Gold, Silver, Copper',
    extractionMethods: 'Sustainable Mining',
    environmentalCompliance: 'ISO 14001',
    provenReserves: '15+ years'
  },
  {
    id: 'intellipro-group',
    name: 'IntelliPro Group',
    type: 'technology',
    status: 'active',
    location: 'New York, NY',
    value: 25000000,
    tokens: 1000000,
    yield: 8.5,
    inceptionDate: '2024-01-25',
    complianceStatus: 'verified',
    documents: 5,
    image: '/api/placeholder/400/300',
    description: 'Leading technology consulting and professional services company specializing in digital transformation, AI implementation, and enterprise software solutions.',
    minInvestment: 5000,
    maxInvestment: 500000,
    remainingTokens: 600000,
    investors: 45,
    lastValuation: '2024-01-25',
    riskLevel: 'medium',
    sector: 'Technology & Professional Services',
    issuer: 'IntelliPro Group Inc.',
    tokenSymbol: 'IPG',
    maturity: '5 years'
  },
  {
    id: 'energy-storage-lambda',
    name: 'Energy Storage Lambda',
    type: 'technology',
    status: 'active',
    location: 'Arizona, USA',
    value: 8500000,
    tokens: 340000,
    yield: 7.4,
    inceptionDate: '2023-08-15',
    complianceStatus: 'verified',
    documents: 3,
    image: '/api/placeholder/400/300',
    description: 'Advanced battery energy storage system for grid stabilization and renewable energy integration.',
    minInvestment: 3000,
    maxInvestment: 300000,
    remainingTokens: 85000,
    investors: 89,
    lastValuation: '2024-01-12',
    riskLevel: 'medium',
    sector: 'Energy Technology',
    issuer: 'GridTech Energy Storage',
    tokenSymbol: 'ESL',
    maturity: '12 years'
  }
];

export const INVESTORS: Investor[] = [
  {
    id: 'inv-001',
    name: 'John Smith',
    email: 'john.smith@email.com',
    country: 'USA',
    accreditationStatus: 'accredited',
    kycStatus: 'verified',
    walletAddress: '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6',
    totalInvestments: 150000,
    activeInvestments: 3,
    joinDate: '2023-01-15',
    lastActivity: '2024-01-20'
  },
  {
    id: 'inv-002',
    name: 'Sarah Johnson',
    email: 'sarah.johnson@email.com',
    country: 'USA',
    accreditationStatus: 'accredited',
    kycStatus: 'verified',
    walletAddress: '0x8ba1f109551bD432803012645Hac136c772c7cb8',
    totalInvestments: 250000,
    activeInvestments: 5,
    joinDate: '2023-02-20',
    lastActivity: '2024-01-19'
  },
  {
    id: 'inv-003',
    name: 'Michael Chen',
    email: 'michael.chen@email.com',
    country: 'Hong Kong',
    accreditationStatus: 'non_accredited',
    kycStatus: 'verified',
    walletAddress: '0x1234567890123456789012345678901234567890',
    totalInvestments: 75000,
    activeInvestments: 2,
    joinDate: '2023-03-10',
    lastActivity: '2024-01-18'
  }
];

export const INVESTMENTS: Investment[] = [
  {
    id: 'inv-001',
    investorId: 'inv-001',
    assetId: 'solar-farm-alpha',
    amount: 25000,
    tokens: 1000,
    status: 'confirmed',
    date: '2024-01-15',
    type: 'primary',
    transactionHash: '0x1234567890abcdef1234567890abcdef12345678'
  },
  {
    id: 'inv-002',
    investorId: 'inv-002',
    assetId: 'real-estate-fund-beta',
    amount: 50000,
    tokens: 2000,
    status: 'confirmed',
    date: '2024-01-16',
    type: 'primary',
    transactionHash: '0xabcdef1234567890abcdef1234567890abcdef12'
  }
];

export const ORDERS: Order[] = [
  {
    id: 'ord-001',
    investorId: 'inv-001',
    assetId: 'solar-farm-alpha',
    type: 'market',
    side: 'buy',
    amount: 10000,
    tokens: 400,
    price: 25.0,
    status: 'completed',
    createdAt: '2024-01-20T10:00:00Z',
    updatedAt: '2024-01-20T10:05:00Z',
    date: '2024-01-20T10:00:00Z',
    reference: 'SOL-2024-001'
  },
  {
    id: 'ord-002',
    investorId: 'inv-002',
    assetId: 'real-estate-fund-beta',
    type: 'limit',
    side: 'buy',
    amount: 25000,
    tokens: 1000,
    price: 25.0,
    status: 'pending',
    createdAt: '2024-01-21T14:30:00Z',
    updatedAt: '2024-01-21T14:30:00Z',
    date: '2024-01-21T14:30:00Z',
    reference: 'REF-2024-002'
  },
  {
    id: 'ord-003',
    investorId: 'inv-003',
    assetId: 'tech-startup-epsilon',
    type: 'market',
    side: 'buy',
    amount: 15000,
    tokens: 300,
    price: 50.0,
    status: 'completed',
    createdAt: '2024-01-19T09:15:00Z',
    updatedAt: '2024-01-19T09:20:00Z',
    date: '2024-01-19T09:15:00Z',
    reference: 'ETE-2024-003'
  },
  {
    id: 'ord-004',
    investorId: 'inv-001',
    assetId: 'wind-energy-delta',
    type: 'limit',
    side: 'sell',
    amount: 5000,
    tokens: 200,
    price: 25.0,
    status: 'cancelled',
    createdAt: '2024-01-18T16:45:00Z',
    updatedAt: '2024-01-18T17:00:00Z',
    date: '2024-01-18T16:45:00Z',
    reference: 'IWD-2024-004'
  },
  {
    id: 'ord-005',
    investorId: 'inv-002',
    assetId: 'healthcare-reit-eta',
    type: 'market',
    side: 'buy',
    amount: 30000,
    tokens: 1200,
    price: 25.0,
    status: 'failed',
    createdAt: '2024-01-17T11:20:00Z',
    updatedAt: '2024-01-17T11:25:00Z',
    date: '2024-01-17T11:20:00Z',
    reference: 'FHP-2024-005'
  }
];

export const COMPLIANCE_CASES: ComplianceCase[] = [
  {
    id: 'case-001',
    type: 'kyc',
    status: 'pending',
    priority: 'high',
    description: 'New investor KYC verification required for John Smith',
    title: 'KYC Review - New Investor',
    assignedTo: 'compliance-officer-001',
    createdAt: '2024-01-20T09:00:00Z',
    updatedAt: '2024-01-20T09:00:00Z',
    dueDate: '2024-01-22T17:00:00Z',
    tags: ['kyc', 'new-investor', 'urgent'],
    processingTime: 48
  },
  {
    id: 'case-002',
    type: 'aml',
    status: 'approved',
    priority: 'medium',
    description: 'AML screening completed for Sarah Johnson',
    title: 'AML Screening - Sarah Johnson',
    assignedTo: 'compliance-officer-002',
    createdAt: '2024-01-19T14:00:00Z',
    updatedAt: '2024-01-20T10:00:00Z',
    dueDate: '2024-01-21T17:00:00Z',
    tags: ['aml', 'screening', 'completed'],
    processingTime: 24
  },
  {
    id: 'case-003',
    type: 'compliance',
    status: 'under_review',
    priority: 'low',
    description: 'Regular compliance audit for Q1 2024',
    title: 'Q1 2024 Compliance Audit',
    assignedTo: 'compliance-officer-003',
    createdAt: '2024-01-18T08:00:00Z',
    updatedAt: '2024-01-20T15:00:00Z',
    dueDate: '2024-01-25T17:00:00Z',
    tags: ['audit', 'quarterly', 'compliance'],
    processingTime: 72
  }
];

export const KYC_APPLICANTS: KYCApplicant[] = [
  {
    id: 'kyc-001',
    name: 'John Smith',
    email: 'john.smith@email.com',
    status: 'pending',
    submittedAt: '2024-01-20T09:00:00Z',
    documents: 3,
    country: 'USA',
    accreditationStatus: 'pending'
  },
  {
    id: 'kyc-002',
    name: 'Sarah Johnson',
    email: 'sarah.johnson@email.com',
    status: 'verified',
    submittedAt: '2024-01-19T14:00:00Z',
    documents: 4,
    country: 'USA',
    accreditationStatus: 'accredited'
  },
  {
    id: 'kyc-003',
    name: 'Michael Chen',
    email: 'michael.chen@email.com',
    status: 'verified',
    submittedAt: '2024-01-18T10:00:00Z',
    documents: 5,
    country: 'Hong Kong',
    accreditationStatus: 'non_accredited'
  },
  {
    id: 'kyc-004',
    name: 'Emily Davis',
    email: 'emily.davis@email.com',
    status: 'pending',
    submittedAt: '2024-01-21T11:00:00Z',
    documents: 2,
    country: 'Canada',
    accreditationStatus: 'pending'
  },
  {
    id: 'kyc-005',
    name: 'David Wilson',
    email: 'david.wilson@email.com',
    status: 'rejected',
    submittedAt: '2024-01-17T16:00:00Z',
    documents: 3,
    country: 'UK',
    accreditationStatus: 'pending'
  }
];

export const PAYOUTS: Payout[] = [
  {
    id: 'payout-001',
    assetId: 'solar-farm-alpha',
    investorId: 'inv-001',
    amount: 2125,
    tokens: 1000,
    yield: 8.5,
    status: 'scheduled',
    scheduledDate: '2024-02-01T00:00:00Z'
  }
];

export const AI_INSIGHTS: AIInsight[] = [
  {
    id: 'insight-001',
    assetId: 'solar-farm-alpha',
    type: 'market_analysis',
    title: 'Solar Energy Market Growth',
    description: 'Strong growth expected in solar energy sector due to government incentives and technological advances.',
    confidence: 0.85,
    impact: 'high',
    createdAt: '2024-01-20T08:00:00Z',
    recommendations: [
      'Consider increasing exposure to solar assets',
      'Monitor regulatory changes in renewable energy',
      'Evaluate additional solar farm opportunities'
    ]
  }
];

export const PLATFORM_METRICS: PlatformMetrics = {
  totalAssets: ASSETS.length, // This will automatically be 12
  totalValue: ASSETS.reduce((sum, asset) => sum + asset.value, 0),
  totalInvestors: INVESTORS.length,
  complianceRate: 98.5,
  activeInvestments: INVESTMENTS.filter(inv => inv.status === 'confirmed').length,
  monthlyPayouts: PAYOUTS.filter(p => p.status === 'scheduled').length,
  averageYield: ASSETS.reduce((sum, asset) => sum + asset.yield, 0) / ASSETS.length
};

export const DASHBOARD_DATA: DashboardData = {
  // Personal Portfolio Metrics (for the logged-in user)
  myAssets: 3, // User owns 3 assets
  portfolioValue: 125000, // Total value of user's investments
  totalReturn: 8.5, // Average return across user's investments
  averageYield: 7.2, // Average yield of user's assets
  
  // Platform Overview (for reference)
  metrics: PLATFORM_METRICS,
  recentAssets: ASSETS.slice(0, 5),
  recentInvestments: INVESTMENTS.slice(0, 5),
  pendingComplianceCases: COMPLIANCE_CASES.filter(c => c.status === 'pending'),
  aiInsights: AI_INSIGHTS.slice(0, 3),
  performanceChart: [
    { date: '2024-01-01', value: 100000, label: 'Portfolio Value' },
    { date: '2024-01-08', value: 105000, label: 'Portfolio Value' },
    { date: '2024-01-15', value: 110000, label: 'Portfolio Value' },
    { date: '2024-01-22', value: 125000, label: 'Portfolio Value' }
  ]
};

// Data service functions
export class DataService {
  // Asset methods
  static getAssets(): Asset[] {
    return ASSETS;
  }

  static getAssetById(id: string): Asset | undefined {
    return ASSETS.find(asset => asset.id === id);
  }

  static getAssetsByType(type: string): Asset[] {
    return ASSETS.filter(asset => asset.type === type);
  }

  static getAssetsByRiskLevel(riskLevel: string): Asset[] {
    return ASSETS.filter(asset => asset.riskLevel === riskLevel);
  }

  // Investor methods
  static getInvestors(): Investor[] {
    return INVESTORS;
  }

  static getInvestorById(id: string): Investor | undefined {
    return INVESTORS.find(investor => investor.id === id);
  }

  // Investment methods
  static getInvestments(): Investment[] {
    return INVESTMENTS;
  }

  static getInvestmentsByInvestor(investorId: string): Investment[] {
    return INVESTMENTS.filter(inv => inv.investorId === investorId);
  }

  static getInvestmentsByAsset(assetId: string): Investment[] {
    return INVESTMENTS.filter(inv => inv.assetId === assetId);
  }

  // Order methods
  static getOrders(): Order[] {
    return ORDERS;
  }

  static getOrdersByInvestor(investorId: string): Order[] {
    return ORDERS.filter(order => order.investorId === investorId);
  }

  // Compliance methods
  static getComplianceCases(): ComplianceCase[] {
    return COMPLIANCE_CASES;
  }

  static getComplianceCasesByStatus(status: string): ComplianceCase[] {
    return COMPLIANCE_CASES.filter(case_ => case_.status === status);
  }

  // KYC methods
  static getKYCApplicants(): KYCApplicant[] {
    return KYC_APPLICANTS;
  }

  static getKYCApplicantsByStatus(status: string): KYCApplicant[] {
    return KYC_APPLICANTS.filter(applicant => applicant.status === status);
  }

  // Payout methods
  static getPayouts(): Payout[] {
    return PAYOUTS;
  }

  static getPayoutsByAsset(assetId: string): Payout[] {
    return PAYOUTS.filter(payout => payout.assetId === assetId);
  }

  // AI Insights methods
  static getAIInsights(): AIInsight[] {
    return AI_INSIGHTS;
  }

  static getAIInsightsByAsset(assetId: string): AIInsight[] {
    return AI_INSIGHTS.filter(insight => insight.assetId === assetId);
  }

  // Platform methods
  static getPlatformMetrics(): PlatformMetrics {
    return PLATFORM_METRICS;
  }

  static getDashboardData(): DashboardData {
    return DASHBOARD_DATA;
  }

  // Search and filter methods
  static searchAssets(query: string): Asset[] {
    const lowerQuery = query.toLowerCase();
    return ASSETS.filter(asset => 
      asset.name.toLowerCase().includes(lowerQuery) ||
      asset.location.toLowerCase().includes(lowerQuery) ||
      asset.sector.toLowerCase().includes(lowerQuery) ||
      asset.description.toLowerCase().includes(lowerQuery)
    );
  }

  static filterAssets(filters: {
    type?: string;
    riskLevel?: string;
    sector?: string;
    minYield?: number;
    maxYield?: number;
  }): Asset[] {
    return ASSETS.filter(asset => {
      if (filters.type && asset.type !== filters.type) return false;
      if (filters.riskLevel && asset.riskLevel !== filters.riskLevel) return false;
      if (filters.sector && asset.sector !== filters.sector) return false;
      if (filters.minYield && asset.yield < filters.minYield) return false;
      if (filters.maxYield && asset.yield > filters.maxYield) return false;
      return true;
    });
  }
}

export default DataService;
