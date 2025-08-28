interface PortfolioAsset {
  id: string;
  symbol: string;
  name: string;
  type: 'token' | 'nft' | 'real_estate' | 'commodity' | 'private_equity';
  quantity: number;
  currentValue: number;
  totalCost: number;
  unrealizedPnL: number;
  unrealizedPnLPercent: number;
  allocation: number;
  riskScore: number;
  lastUpdated: Date;
  metadata: Record<string, any>;
}

interface PortfolioPosition {
  id: string;
  assetId: string;
  asset: PortfolioAsset;
  entryPrice: number;
  currentPrice: number;
  quantity: number;
  totalValue: number;
  unrealizedPnL: number;
  unrealizedPnLPercent: number;
  allocation: number;
  riskLevel: 'low' | 'medium' | 'high';
  lastUpdated: Date;
}

interface PortfolioSummary {
  totalValue: number;
  totalCost: number;
  totalUnrealizedPnL: number;
  totalUnrealizedPnLPercent: number;
  totalAllocation: number;
  averageRiskScore: number;
  assetCount: number;
  lastUpdated: Date;
  performanceMetrics: {
    dailyReturn: number;
    weeklyReturn: number;
    monthlyReturn: number;
    yearlyReturn: number;
    sharpeRatio: number;
    maxDrawdown: number;
  };
}

interface PortfolioContext {
  userId: string;
  portfolio: PortfolioSummary;
  positions: PortfolioPosition[];
  recentTransactions: Transaction[];
  upcomingPayouts: Payout[];
  complianceStatus: ComplianceStatus;
  riskProfile: RiskProfile;
  preferences: PortfolioPreferences;
}

interface Transaction {
  id: string;
  type: 'buy' | 'sell' | 'dividend' | 'interest' | 'fee';
  assetId: string;
  assetSymbol: string;
  quantity: number;
  price: number;
  totalAmount: number;
  timestamp: Date;
  status: 'pending' | 'completed' | 'failed' | 'cancelled';
  metadata: Record<string, any>;
}

interface Payout {
  id: string;
  assetId: string;
  assetSymbol: string;
  type: 'dividend' | 'interest' | 'distribution';
  amount: number;
  scheduledDate: Date;
  status: 'scheduled' | 'processing' | 'completed' | 'failed';
  metadata: Record<string, any>;
}

interface ComplianceStatus {
  kycStatus: 'pending' | 'approved' | 'rejected' | 'expired';
  amlStatus: 'pending' | 'cleared' | 'flagged' | 'blocked';
  sanctionsStatus: 'clear' | 'flagged' | 'blocked';
  lastScreening: Date;
  nextScreening: Date;
  restrictions: string[];
}

interface RiskProfile {
  riskTolerance: 'conservative' | 'moderate' | 'aggressive';
  investmentHorizon: 'short' | 'medium' | 'long';
  liquidityNeeds: 'low' | 'medium' | 'high';
  diversificationPreference: 'low' | 'medium' | 'high';
  maxDrawdownTolerance: number;
}

interface PortfolioPreferences {
  currency: string;
  timezone: string;
  notifications: {
    priceAlerts: boolean;
    payoutNotifications: boolean;
    complianceUpdates: boolean;
    riskAlerts: boolean;
  };
  displayOptions: {
    showUnrealizedPnL: boolean;
    showAllocation: boolean;
    showRiskMetrics: boolean;
    compactView: boolean;
  };
}

export class PortfolioService {
  private userId: string;
  private mockData: PortfolioContext;

  constructor(userId: string) {
    this.userId = userId;
    this.mockData = this.generateMockPortfolioData();
  }

  async getPortfolioContext(): Promise<PortfolioContext> {
    try {
      console.log('Getting portfolio context for user:', this.userId);

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 200));

      // Update mock data with current timestamps
      this.updateMockDataTimestamps();

      console.log('Portfolio context retrieved successfully');
      return this.mockData;
    } catch (error) {
      console.error('Failed to get portfolio context:', error);
      throw new Error(`Failed to get portfolio context: ${error.message}`);
    }
  }

  async getPortfolioSummary(): Promise<PortfolioSummary> {
    try {
      console.log('Getting portfolio summary for user:', this.userId);

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 150));

      console.log('Portfolio summary retrieved successfully');
      return this.mockData.portfolio;
    } catch (error) {
      console.error('Failed to get portfolio summary:', error);
      throw new Error(`Failed to get portfolio summary: ${error.message}`);
    }
  }

  async getPositions(): Promise<PortfolioPosition[]> {
    try {
      console.log('Getting portfolio positions for user:', this.userId);

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 180));

      console.log('Portfolio positions retrieved successfully');
      return this.mockData.positions;
    } catch (error) {
      console.error('Failed to get portfolio positions:', error);
      throw new Error(`Failed to get portfolio positions: ${error.message}`);
    }
  }

  async getAssetPosition(assetId: string): Promise<PortfolioPosition | null> {
    try {
      console.log('Getting asset position:', { userId: this.userId, assetId });

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 100));

      const position = this.mockData.positions.find(p => p.assetId === assetId);
      
      if (position) {
        console.log('Asset position retrieved successfully');
        return position;
      } else {
        console.log('Asset position not found');
        return null;
      }
    } catch (error) {
      console.error('Failed to get asset position:', error);
      throw new Error(`Failed to get asset position: ${error.message}`);
    }
  }

  async getRecentTransactions(limit: number = 10): Promise<Transaction[]> {
    try {
      console.log('Getting recent transactions:', { userId: this.userId, limit });

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 120));

      const transactions = this.mockData.recentTransactions
        .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
        .slice(0, limit);

      console.log('Recent transactions retrieved successfully');
      return transactions;
    } catch (error) {
      console.error('Failed to get recent transactions:', error);
      throw new Error(`Failed to get recent transactions: ${error.message}`);
    }
  }

  async getUpcomingPayouts(): Promise<Payout[]> {
    try {
      console.log('Getting upcoming payouts for user:', this.userId);

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 100));

      const upcomingPayouts = this.mockData.upcomingPayouts
        .filter(payout => payout.status === 'scheduled')
        .sort((a, b) => a.scheduledDate.getTime() - b.scheduledDate.getTime());

      console.log('Upcoming payouts retrieved successfully');
      return upcomingPayouts;
    } catch (error) {
      console.error('Failed to get upcoming payouts:', error);
      throw new Error(`Failed to get upcoming payouts: ${error.message}`);
    }
  }

  async getComplianceStatus(): Promise<ComplianceStatus> {
    try {
      console.log('Getting compliance status for user:', this.userId);

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 80));

      console.log('Compliance status retrieved successfully');
      return this.mockData.complianceStatus;
    } catch (error) {
      console.error('Failed to get compliance status:', error);
      throw new Error(`Failed to get compliance status: ${error.message}`);
    }
  }

  async getRiskProfile(): Promise<RiskProfile> {
    try {
      console.log('Getting risk profile for user:', this.userId);

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 80));

      console.log('Risk profile retrieved successfully');
      return this.mockData.riskProfile;
    } catch (error) {
      console.error('Failed to get risk profile:', error);
      throw new Error(`Failed to get risk profile: ${error.message}`);
    }
  }

  async getPortfolioPreferences(): Promise<PortfolioPreferences> {
    try {
      console.log('Getting portfolio preferences for user:', this.userId);

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 80));

      console.log('Portfolio preferences retrieved successfully');
      return this.mockData.preferences;
    } catch (error) {
      console.error('Failed to get portfolio preferences:', error);
      throw new Error(`Failed to get portfolio preferences: ${error.message}`);
    }
  }

  async searchAssets(query: string): Promise<PortfolioAsset[]> {
    try {
      console.log('Searching assets:', { userId: this.userId, query });

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 150));

      const queryLower = query.toLowerCase();
      const matchingAssets = this.mockData.positions
        .map(p => p.asset)
        .filter(asset => 
          asset.name.toLowerCase().includes(queryLower) ||
          asset.symbol.toLowerCase().includes(queryLower) ||
          asset.type.toLowerCase().includes(queryLower)
        );

      console.log(`Found ${matchingAssets.length} matching assets`);
      return matchingAssets;
    } catch (error) {
      console.error('Failed to search assets:', error);
      throw new Error(`Failed to search assets: ${error.message}`);
    }
  }

  async getAssetPerformance(assetId: string, period: '1d' | '1w' | '1m' | '3m' | '1y'): Promise<{
    period: string;
    return: number;
    returnPercent: number;
    volatility: number;
    sharpeRatio: number;
    maxDrawdown: number;
  }> {
    try {
      console.log('Getting asset performance:', { userId: this.userId, assetId, period });

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 200));

      // Mock performance data
      const performanceData = {
        period,
        return: Math.random() * 1000 - 500,
        returnPercent: Math.random() * 40 - 20,
        volatility: Math.random() * 30 + 10,
        sharpeRatio: Math.random() * 2 - 1,
        maxDrawdown: Math.random() * 25 + 5,
      };

      console.log('Asset performance retrieved successfully');
      return performanceData;
    } catch (error) {
      console.error('Failed to get asset performance:', error);
      throw new Error(`Failed to get asset performance: ${error.message}`);
    }
  }

  async getPortfolioAnalytics(): Promise<{
    allocationByType: Record<string, number>;
    allocationByRisk: Record<string, number>;
    topPerformers: PortfolioAsset[];
    underperformers: PortfolioAsset[];
    correlationMatrix: number[][];
  }> {
    try {
      console.log('Getting portfolio analytics for user:', this.userId);

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 300));

      // Calculate allocation by type
      const allocationByType: Record<string, number> = {};
      this.mockData.positions.forEach(position => {
        const type = position.asset.type;
        allocationByType[type] = (allocationByType[type] || 0) + position.allocation;
      });

      // Calculate allocation by risk
      const allocationByRisk: Record<string, number> = {
        low: 0,
        medium: 0,
        high: 0,
      };
      this.mockData.positions.forEach(position => {
        allocationByRisk[position.riskLevel] += position.allocation;
      });

      // Get top performers and underperformers
      const sortedPositions = [...this.mockData.positions].sort((a, b) => 
        b.unrealizedPnLPercent - a.unrealizedPnLPercent
      );
      
      const topPerformers = sortedPositions.slice(0, 5).map(p => p.asset);
      const underperformers = sortedPositions.slice(-5).map(p => p.asset);

      // Mock correlation matrix
      const correlationMatrix = Array.from({ length: this.mockData.positions.length }, () =>
        Array.from({ length: this.mockData.positions.length }, () => Math.random() * 2 - 1)
      );

      const analytics = {
        allocationByType,
        allocationByRisk,
        topPerformers,
        underperformers,
        correlationMatrix,
      };

      console.log('Portfolio analytics retrieved successfully');
      return analytics;
    } catch (error) {
      console.error('Failed to get portfolio analytics:', error);
      throw new Error(`Failed to get portfolio analytics: ${error.message}`);
    }
  }

  private generateMockPortfolioData(): PortfolioContext {
    const mockAssets: PortfolioAsset[] = [
      {
        id: 'solar-farm-001',
        symbol: 'SOLAR',
        name: 'Solar Farm Token',
        type: 'token',
        quantity: 1000,
        currentValue: 25000,
        totalCost: 20000,
        unrealizedPnL: 5000,
        unrealizedPnLPercent: 25,
        allocation: 40,
        riskScore: 0.6,
        lastUpdated: new Date(),
        metadata: {
          sector: 'renewable_energy',
          location: 'California',
          capacity: '50MW',
        },
      },
      {
        id: 'real-estate-001',
        symbol: 'REIT',
        name: 'Commercial Real Estate Fund',
        type: 'real_estate',
        quantity: 500,
        currentValue: 15000,
        totalCost: 16000,
        unrealizedPnL: -1000,
        unrealizedPnLPercent: -6.25,
        allocation: 24,
        riskScore: 0.4,
        lastUpdated: new Date(),
        metadata: {
          sector: 'commercial_real_estate',
          propertyType: 'office',
          location: 'New York',
        },
      },
      {
        id: 'commodity-001',
        symbol: 'GOLD',
        name: 'Gold ETF',
        type: 'commodity',
        quantity: 200,
        currentValue: 8000,
        totalCost: 7500,
        unrealizedPnL: 500,
        unrealizedPnLPercent: 6.67,
        allocation: 12.8,
        riskScore: 0.3,
        lastUpdated: new Date(),
        metadata: {
          commodity: 'gold',
          storage: 'allocated',
          purity: '99.99%',
        },
      },
    ];

    const mockPositions: PortfolioPosition[] = mockAssets.map(asset => ({
      id: `pos-${asset.id}`,
      assetId: asset.id,
      asset,
      entryPrice: asset.totalCost / asset.quantity,
      currentPrice: asset.currentValue / asset.quantity,
      quantity: asset.quantity,
      totalValue: asset.currentValue,
      unrealizedPnL: asset.unrealizedPnL,
      unrealizedPnLPercent: asset.unrealizedPnLPercent,
      allocation: asset.allocation,
      riskLevel: asset.riskScore < 0.4 ? 'low' : asset.riskScore < 0.7 ? 'medium' : 'high',
      lastUpdated: asset.lastUpdated,
    }));

    const mockTransactions: Transaction[] = [
      {
        id: 'tx-1',
        type: 'buy',
        assetId: 'solar-farm-001',
        assetSymbol: 'SOLAR',
        quantity: 500,
        price: 20,
        totalAmount: 10000,
        timestamp: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        status: 'completed',
        metadata: { orderType: 'market' },
      },
      {
        id: 'tx-2',
        type: 'dividend',
        assetId: 'solar-farm-001',
        assetSymbol: 'SOLAR',
        quantity: 0,
        price: 0,
        totalAmount: 250,
        timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
        status: 'completed',
        metadata: { dividendType: 'quarterly' },
      },
    ];

    const mockPayouts: Payout[] = [
      {
        id: 'payout-1',
        assetId: 'solar-farm-001',
        assetSymbol: 'SOLAR',
        type: 'dividend',
        amount: 300,
        scheduledDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        status: 'scheduled',
        metadata: { dividendType: 'quarterly' },
      },
    ];

    const mockComplianceStatus: ComplianceStatus = {
      kycStatus: 'approved',
      amlStatus: 'cleared',
      sanctionsStatus: 'clear',
      lastScreening: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      nextScreening: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      restrictions: [],
    };

    const mockRiskProfile: RiskProfile = {
      riskTolerance: 'moderate',
      investmentHorizon: 'medium',
      liquidityNeeds: 'medium',
      diversificationPreference: 'high',
      maxDrawdownTolerance: 15,
    };

    const mockPreferences: PortfolioPreferences = {
      currency: 'USD',
      timezone: 'America/New_York',
      notifications: {
        priceAlerts: true,
        payoutNotifications: true,
        complianceUpdates: true,
        riskAlerts: true,
      },
      displayOptions: {
        showUnrealizedPnL: true,
        showAllocation: true,
        showRiskMetrics: true,
        compactView: false,
      },
    };

    const totalValue = mockAssets.reduce((sum, asset) => sum + asset.currentValue, 0);
    const totalCost = mockAssets.reduce((sum, asset) => sum + asset.totalCost, 0);
    const totalUnrealizedPnL = mockAssets.reduce((sum, asset) => sum + asset.unrealizedPnL, 0);
    const totalUnrealizedPnLPercent = totalCost > 0 ? (totalUnrealizedPnL / totalCost) * 100 : 0;
    const averageRiskScore = mockAssets.reduce((sum, asset) => sum + asset.riskScore, 0) / mockAssets.length;

    const mockPortfolio: PortfolioSummary = {
      totalValue,
      totalCost,
      totalUnrealizedPnL,
      totalUnrealizedPnLPercent,
      totalAllocation: 100,
      averageRiskScore,
      assetCount: mockAssets.length,
      lastUpdated: new Date(),
      performanceMetrics: {
        dailyReturn: 0.5,
        weeklyReturn: 2.1,
        monthlyReturn: 8.5,
        yearlyReturn: 15.2,
        sharpeRatio: 1.2,
        maxDrawdown: 8.3,
      },
    };

    return {
      userId: this.userId,
      portfolio: mockPortfolio,
      positions: mockPositions,
      recentTransactions: mockTransactions,
      upcomingPayouts: mockPayouts,
      complianceStatus: mockComplianceStatus,
      riskProfile: mockRiskProfile,
      preferences: mockPreferences,
    };
  }

  private updateMockDataTimestamps(): void {
    const now = new Date();
    
    // Update portfolio last updated
    this.mockData.portfolio.lastUpdated = now;
    
    // Update asset last updated
    this.mockData.positions.forEach(position => {
      position.asset.lastUpdated = now;
      position.lastUpdated = now;
    });
    
    // Update transaction timestamps (keep relative to now)
    this.mockData.recentTransactions.forEach(transaction => {
      if (transaction.timestamp < new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)) {
        transaction.timestamp = new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000);
      }
    });
  }

  // Method to get user ID
  getUserId(): string {
    return this.userId;
  }

  // Method to check if service is initialized
  isInitialized(): boolean {
    return !!this.mockData;
  }

  // Method to get service statistics
  getServiceStats(): {
    totalAssets: number;
    totalPositions: number;
    totalTransactions: number;
    totalPayouts: number;
  } {
    return {
      totalAssets: this.mockData.positions.length,
      totalPositions: this.mockData.positions.length,
      totalTransactions: this.mockData.recentTransactions.length,
      totalPayouts: this.mockData.upcomingPayouts.length,
    };
  }
}
