interface Asset {
  id: string;
  symbol: string;
  name: string;
  type: 'token' | 'nft' | 'real_estate' | 'commodity' | 'private_equity';
  status: 'active' | 'inactive' | 'suspended' | 'liquidated';
  issuer: string;
  totalSupply: number;
  circulatingSupply: number;
  marketCap: number;
  currentPrice: number;
  priceChange24h: number;
  priceChangePercent24h: number;
  volume24h: number;
  riskScore: number;
  riskLevel: 'low' | 'medium' | 'high';
  complianceStatus: 'compliant' | 'pending' | 'non_compliant';
  createdAt: Date;
  updatedAt: Date;
  metadata: AssetMetadata;
}

interface AssetMetadata {
  sector: string;
  industry: string;
  location?: string;
  description: string;
  website?: string;
  whitepaper?: string;
  socialMedia?: {
    twitter?: string;
    linkedin?: string;
    telegram?: string;
  };
  legalStructure: string;
  jurisdiction: string;
  regulatoryStatus: string;
  assetClass: string;
  investmentMinimum: number;
  lockupPeriod?: number;
  dividendYield?: number;
  managementFee?: number;
  performanceFee?: number;
  custodian?: string;
  auditor?: string;
  legalCounsel?: string;
}

interface AssetDocument {
  id: string;
  assetId: string;
  title: string;
  type: 'prospectus' | 'offering_memorandum' | 'financial_statement' | 'compliance_report' | 'legal_document' | 'technical_report' | 'other';
  filename: string;
  contentType: string;
  size: number;
  url: string;
  uploadedAt: Date;
  lastModified: Date;
  version: string;
  status: 'draft' | 'published' | 'archived' | 'expired';
  tags: string[];
  metadata: Record<string, any>;
}

interface AssetPerformance {
  assetId: string;
  period: '1d' | '1w' | '1m' | '3m' | '6m' | '1y' | 'all';
  startDate: Date;
  endDate: Date;
  startPrice: number;
  endPrice: number;
  return: number;
  returnPercent: number;
  volatility: number;
  sharpeRatio: number;
  maxDrawdown: number;
  beta: number;
  alpha: number;
  dataPoints: PerformanceDataPoint[];
}

interface PerformanceDataPoint {
  timestamp: Date;
  price: number;
  volume: number;
  marketCap: number;
}

interface AssetNews {
  id: string;
  assetId: string;
  title: string;
  summary: string;
  content: string;
  source: string;
  url: string;
  publishedAt: Date;
  sentiment: 'positive' | 'neutral' | 'negative';
  relevance: number;
  tags: string[];
}

interface AssetEvent {
  id: string;
  assetId: string;
  type: 'dividend' | 'interest' | 'distribution' | 'corporate_action' | 'regulatory_update' | 'market_event';
  title: string;
  description: string;
  scheduledDate: Date;
  actualDate?: Date;
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
  impact: 'low' | 'medium' | 'high';
  metadata: Record<string, any>;
}

export class AssetService {
  private mockAssets: Asset[] = [];
  private mockDocuments: AssetDocument[] = [];
  private mockPerformance: AssetPerformance[] = [];
  private mockNews: AssetNews[] = [];
  private mockEvents: AssetEvent[] = [];

  constructor() {
    this.initializeMockData();
  }

  async getAsset(assetId: string): Promise<Asset | null> {
    try {
      console.log('Getting asset:', assetId);

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 150));

      const asset = this.mockAssets.find(a => a.id === assetId);
      
      if (asset) {
        console.log('Asset retrieved successfully');
        return asset;
      } else {
        console.log('Asset not found');
        return null;
      }
    } catch (error) {
      console.error('Failed to get asset:', error);
      throw new Error(`Failed to get asset: ${error.message}`);
    }
  }

  async searchAssets(query: string, filters?: {
    type?: string;
    sector?: string;
    riskLevel?: string;
    complianceStatus?: string;
    minMarketCap?: number;
    maxMarketCap?: number;
  }): Promise<Asset[]> {
    try {
      console.log('Searching assets:', { query, filters });

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 200));

      let matchingAssets = this.mockAssets;

      // Apply text search
      if (query) {
        const queryLower = query.toLowerCase();
        matchingAssets = matchingAssets.filter(asset =>
          asset.name.toLowerCase().includes(queryLower) ||
          asset.symbol.toLowerCase().includes(queryLower) ||
          asset.metadata.sector.toLowerCase().includes(queryLower) ||
          asset.metadata.industry.toLowerCase().includes(queryLower)
        );
      }

      // Apply filters
      if (filters?.type) {
        matchingAssets = matchingAssets.filter(asset => asset.type === filters.type);
      }

      if (filters?.sector) {
        matchingAssets = matchingAssets.filter(asset => asset.metadata.sector === filters.sector);
      }

      if (filters?.riskLevel) {
        matchingAssets = matchingAssets.filter(asset => asset.riskLevel === filters.riskLevel);
      }

      if (filters?.complianceStatus) {
        matchingAssets = matchingAssets.filter(asset => asset.complianceStatus === filters.complianceStatus);
      }

      if (filters?.minMarketCap) {
        matchingAssets = matchingAssets.filter(asset => asset.marketCap >= filters.minMarketCap!);
      }

      if (filters?.maxMarketCap) {
        matchingAssets = matchingAssets.filter(asset => asset.marketCap <= filters.maxMarketCap!);
      }

      console.log(`Found ${matchingAssets.length} matching assets`);
      return matchingAssets;
    } catch (error) {
      console.error('Failed to search assets:', error);
      throw new Error(`Failed to search assets: ${error.message}`);
    }
  }

  async getAssetDocuments(assetId: string, filters?: {
    type?: string;
    status?: string;
    tags?: string[];
  }): Promise<AssetDocument[]> {
    try {
      console.log('Getting asset documents:', { assetId, filters });

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 120));

      let matchingDocuments = this.mockDocuments.filter(doc => doc.assetId === assetId);

      // Apply filters
      if (filters?.type) {
        matchingDocuments = matchingDocuments.filter(doc => doc.type === filters.type);
      }

      if (filters?.status) {
        matchingDocuments = matchingDocuments.filter(doc => doc.status === filters.status);
      }

      if (filters?.tags && filters.tags.length > 0) {
        matchingDocuments = matchingDocuments.filter(doc =>
          filters.tags!.some(tag => doc.tags.includes(tag))
        );
      }

      // Sort by upload date (newest first)
      matchingDocuments.sort((a, b) => b.uploadedAt.getTime() - a.uploadedAt.getTime());

      console.log(`Found ${matchingDocuments.length} documents for asset ${assetId}`);
      return matchingDocuments;
    } catch (error) {
      console.error('Failed to get asset documents:', error);
      throw new Error(`Failed to get asset documents: ${error.message}`);
    }
  }

  async getAssetPerformance(assetId: string, period: '1d' | '1w' | '1m' | '3m' | '6m' | '1y' | 'all'): Promise<AssetPerformance | null> {
    try {
      console.log('Getting asset performance:', { assetId, period });

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 180));

      const performance = this.mockPerformance.find(p => p.assetId === assetId && p.period === period);
      
      if (performance) {
        console.log('Asset performance retrieved successfully');
        return performance;
      } else {
        console.log('Asset performance not found');
        return null;
      }
    } catch (error) {
      console.error('Failed to get asset performance:', error);
      throw new Error(`Failed to get asset performance: ${error.message}`);
    }
  }

  async getAssetNews(assetId: string, limit: number = 10): Promise<AssetNews[]> {
    try {
      console.log('Getting asset news:', { assetId, limit });

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 150));

      const news = this.mockNews
        .filter(n => n.assetId === assetId)
        .sort((a, b) => b.publishedAt.getTime() - a.publishedAt.getTime())
        .slice(0, limit);

      console.log(`Found ${news.length} news articles for asset ${assetId}`);
      return news;
    } catch (error) {
      console.error('Failed to get asset news:', error);
      throw new Error(`Failed to get asset news: ${error.message}`);
    }
  }

  async getAssetEvents(assetId: string, upcomingOnly: boolean = true): Promise<AssetEvent[]> {
    try {
      console.log('Getting asset events:', { assetId, upcomingOnly });

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 120));

      let events = this.mockEvents.filter(e => e.assetId === assetId);

      if (upcomingOnly) {
        const now = new Date();
        events = events.filter(e => e.scheduledDate > now);
      }

      // Sort by scheduled date
      events.sort((a, b) => a.scheduledDate.getTime() - b.scheduledDate.getTime());

      console.log(`Found ${events.length} events for asset ${assetId}`);
      return events;
    } catch (error) {
      console.error('Failed to get asset events:', error);
      throw new Error(`Failed to get asset events: ${error.message}`);
    }
  }

  async getAssetAnalytics(assetId: string): Promise<{
    marketMetrics: {
      marketCap: number;
      volume24h: number;
      priceChange24h: number;
      priceChangePercent24h: number;
    };
    riskMetrics: {
      riskScore: number;
      riskLevel: string;
      volatility: number;
      beta: number;
      sharpeRatio: number;
    };
    complianceMetrics: {
      complianceStatus: string;
      lastAudit: Date;
      nextAudit: Date;
      regulatoryFilings: number;
    };
    performanceMetrics: {
      totalReturn: number;
      totalReturnPercent: number;
      maxDrawdown: number;
      averageVolume: number;
    };
  }> {
    try {
      console.log('Getting asset analytics:', assetId);

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 250));

      const asset = this.mockAssets.find(a => a.id === assetId);
      if (!asset) {
        throw new Error('Asset not found');
      }

      const analytics = {
        marketMetrics: {
          marketCap: asset.marketCap,
          volume24h: asset.volume24h,
          priceChange24h: asset.priceChange24h,
          priceChangePercent24h: asset.priceChangePercent24h,
        },
        riskMetrics: {
          riskScore: asset.riskScore,
          riskLevel: asset.riskLevel,
          volatility: Math.random() * 30 + 10,
          beta: Math.random() * 2 - 1,
          sharpeRatio: Math.random() * 2 - 1,
        },
        complianceMetrics: {
          complianceStatus: asset.complianceStatus,
          lastAudit: new Date(Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000),
          nextAudit: new Date(Date.now() + Math.random() * 90 * 24 * 60 * 60 * 1000),
          regulatoryFilings: Math.floor(Math.random() * 20) + 5,
        },
        performanceMetrics: {
          totalReturn: Math.random() * 2000 - 1000,
          totalReturnPercent: Math.random() * 100 - 50,
          maxDrawdown: Math.random() * 30 + 5,
          averageVolume: asset.volume24h * (0.8 + Math.random() * 0.4),
        },
      };

      console.log('Asset analytics retrieved successfully');
      return analytics;
    } catch (error) {
      console.error('Failed to get asset analytics:', error);
      throw new Error(`Failed to get asset analytics: ${error.message}`);
    }
  }

  async getAssetComparison(assetIds: string[]): Promise<{
    assets: Asset[];
    comparison: {
      marketCap: number[];
      riskScore: number[];
      priceChange24h: number[];
      volume24h: number[];
    };
  }> {
    try {
      console.log('Getting asset comparison:', assetIds);

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 300));

      const assets = this.mockAssets.filter(a => assetIds.includes(a.id));
      
      if (assets.length !== assetIds.length) {
        throw new Error('Some assets not found');
      }

      const comparison = {
        marketCap: assets.map(a => a.marketCap),
        riskScore: assets.map(a => a.riskScore),
        priceChange24h: assets.map(a => a.priceChange24h),
        volume24h: assets.map(a => a.volume24h),
      };

      console.log('Asset comparison retrieved successfully');
      return { assets, comparison };
    } catch (error) {
      console.error('Failed to get asset comparison:', error);
      throw new Error(`Failed to get asset comparison: ${error.message}`);
    }
  }

  async getAssetSectors(): Promise<string[]> {
    try {
      console.log('Getting asset sectors');

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 80));

      const sectors = [...new Set(this.mockAssets.map(a => a.metadata.sector))];
      
      console.log(`Found ${sectors.length} asset sectors`);
      return sectors;
    } catch (error) {
      console.error('Failed to get asset sectors:', error);
      throw new Error(`Failed to get asset sectors: ${error.message}`);
    }
  }

  async getAssetTypes(): Promise<string[]> {
    try {
      console.log('Getting asset types');

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 80));

      const types = [...new Set(this.mockAssets.map(a => a.type))];
      
      console.log(`Found ${types.length} asset types`);
      return types;
    } catch (error) {
      console.error('Failed to get asset types:', error);
      throw new Error(`Failed to get asset types: ${error.message}`);
    }
  }

  private initializeMockData(): void {
    // Mock assets
    this.mockAssets = [
      {
        id: 'solar-farm-001',
        symbol: 'SOLAR',
        name: 'Solar Farm Token',
        type: 'token',
        status: 'active',
        issuer: 'Green Energy Corp',
        totalSupply: 1000000,
        circulatingSupply: 800000,
        marketCap: 25000000,
        currentPrice: 31.25,
        priceChange24h: 1.25,
        priceChangePercent24h: 4.17,
        volume24h: 1250000,
        riskScore: 0.6,
        riskLevel: 'medium',
        complianceStatus: 'compliant',
        createdAt: new Date('2023-01-15'),
        updatedAt: new Date(),
        metadata: {
          sector: 'renewable_energy',
          industry: 'solar_power',
          location: 'California',
          description: 'Tokenized solar farm generating clean energy and providing stable returns',
          website: 'https://solarfarm.example.com',
          whitepaper: 'https://solarfarm.example.com/whitepaper.pdf',
          socialMedia: {
            twitter: 'https://twitter.com/solarfarm',
            linkedin: 'https://linkedin.com/company/solarfarm',
          },
          legalStructure: 'LLC',
          jurisdiction: 'Delaware, USA',
          regulatoryStatus: 'Regulation D compliant',
          assetClass: 'infrastructure',
          investmentMinimum: 1000,
          lockupPeriod: 12,
          dividendYield: 8.5,
          managementFee: 1.5,
          performanceFee: 15,
          custodian: 'Digital Trust Bank',
          auditor: 'PricewaterhouseCoopers',
          legalCounsel: 'Skadden, Arps',
        },
      },
      {
        id: 'real-estate-001',
        symbol: 'REIT',
        name: 'Commercial Real Estate Fund',
        type: 'real_estate',
        status: 'active',
        issuer: 'Real Estate Partners',
        totalSupply: 500000,
        circulatingSupply: 450000,
        marketCap: 15000000,
        currentPrice: 33.33,
        priceChange24h: -1.67,
        priceChangePercent24h: -4.77,
        volume24h: 750000,
        riskScore: 0.4,
        riskLevel: 'low',
        complianceStatus: 'compliant',
        createdAt: new Date('2023-03-20'),
        updatedAt: new Date(),
        metadata: {
          sector: 'real_estate',
          industry: 'commercial_property',
          location: 'New York',
          description: 'Diversified portfolio of commercial real estate properties',
          website: 'https://reit.example.com',
          legalStructure: 'REIT',
          jurisdiction: 'New York, USA',
          regulatoryStatus: 'SEC registered',
          assetClass: 'real_estate',
          investmentMinimum: 5000,
          dividendYield: 6.2,
          managementFee: 1.0,
          custodian: 'State Street Bank',
          auditor: 'Deloitte',
          legalCounsel: 'Sullivan & Cromwell',
        },
      },
      {
        id: 'commodity-001',
        symbol: 'GOLD',
        name: 'Gold ETF',
        type: 'commodity',
        status: 'active',
        issuer: 'Precious Metals Trust',
        totalSupply: 200000,
        circulatingSupply: 180000,
        marketCap: 8000000,
        currentPrice: 44.44,
        priceChange24h: 0.44,
        priceChangePercent24h: 1.00,
        volume24h: 400000,
        riskScore: 0.3,
        riskLevel: 'low',
        complianceStatus: 'compliant',
        createdAt: new Date('2023-06-10'),
        updatedAt: new Date(),
        metadata: {
          sector: 'commodities',
          industry: 'precious_metals',
          description: 'Physically backed gold ETF with allocated storage',
          website: 'https://gold.example.com',
          legalStructure: 'Trust',
          jurisdiction: 'Delaware, USA',
          regulatoryStatus: 'SEC registered',
          assetClass: 'commodities',
          investmentMinimum: 100,
          custodian: 'JP Morgan Chase',
          auditor: 'Ernst & Young',
          legalCounsel: 'Davis Polk',
        },
      },
    ];

    // Mock documents
    this.mockDocuments = [
      {
        id: 'doc-1',
        assetId: 'solar-farm-001',
        title: 'Solar Farm Prospectus',
        type: 'prospectus',
        filename: 'solar-farm-prospectus.pdf',
        contentType: 'application/pdf',
        size: 1024 * 100,
        url: 'https://docs.example.com/solar-farm-prospectus.pdf',
        uploadedAt: new Date('2024-01-15'),
        lastModified: new Date('2024-01-15'),
        version: '2.1',
        status: 'published',
        tags: ['prospectus', 'financial', 'legal'],
        metadata: { pages: 45, language: 'en' },
      },
      {
        id: 'doc-2',
        assetId: 'solar-farm-001',
        title: 'Q4 2023 Financial Statements',
        type: 'financial_statement',
        filename: 'q4-2023-financials.pdf',
        contentType: 'application/pdf',
        size: 1024 * 75,
        url: 'https://docs.example.com/q4-2023-financials.pdf',
        uploadedAt: new Date('2024-01-25'),
        lastModified: new Date('2024-01-25'),
        version: '1.0',
        status: 'published',
        tags: ['financial', 'quarterly', 'statements'],
        metadata: { period: 'Q4 2023', pages: 32 },
      },
    ];

    // Mock performance data
    this.mockPerformance = [
      {
        assetId: 'solar-farm-001',
        period: '1y',
        startDate: new Date('2023-01-15'),
        endDate: new Date(),
        startPrice: 25.00,
        endPrice: 31.25,
        return: 6.25,
        returnPercent: 25.0,
        volatility: 18.5,
        sharpeRatio: 1.35,
        maxDrawdown: 12.3,
        beta: 0.85,
        alpha: 2.1,
        dataPoints: [],
      },
    ];

    // Mock news
    this.mockNews = [
      {
        id: 'news-1',
        assetId: 'solar-farm-001',
        title: 'Solar Farm Reports Strong Q4 Performance',
        summary: 'The solar farm exceeded production targets and generated higher than expected returns for investors.',
        content: 'Full news content here...',
        source: 'Financial Times',
        url: 'https://news.example.com/solar-farm-q4',
        publishedAt: new Date('2024-01-20'),
        sentiment: 'positive',
        relevance: 0.95,
        tags: ['earnings', 'performance', 'renewable_energy'],
      },
    ];

    // Mock events
    this.mockEvents = [
      {
        id: 'event-1',
        assetId: 'solar-farm-001',
        type: 'dividend',
        title: 'Q4 2023 Dividend Payment',
        description: 'Quarterly dividend payment to token holders',
        scheduledDate: new Date('2024-02-15'),
        status: 'scheduled',
        impact: 'medium',
        metadata: { dividendAmount: 0.75, exDate: '2024-02-01' },
      },
    ];
  }

  // Method to get service statistics
  getServiceStats(): {
    totalAssets: number;
    totalDocuments: number;
    totalNews: number;
    totalEvents: number;
  } {
    return {
      totalAssets: this.mockAssets.length,
      totalDocuments: this.mockDocuments.length,
      totalNews: this.mockNews.length,
      totalEvents: this.mockEvents.length,
    };
  }

  // Method to check if service is initialized
  isInitialized(): boolean {
    return this.mockAssets.length > 0;
  }
}
