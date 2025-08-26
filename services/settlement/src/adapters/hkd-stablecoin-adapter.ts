import { Injectable, Logger } from '@nestjs/common';
import { StablecoinAdapter, StablecoinTransferRequest, StablecoinTransferResponse, StablecoinBalanceResponse } from './stablecoin-adapter.interface';

@Injectable()
export class HKDStablecoinAdapter implements StablecoinAdapter {
  private readonly logger = new Logger(HKDStablecoinAdapter.name);
  private readonly mockBalances = new Map<string, number>();
  private readonly mockTransactions = new Map<string, any>();

  constructor() {
    // Initialize with some mock balances (HKD amounts in cents for precision)
    this.mockBalances.set('0x1234567890123456789012345678901234567890', 7800000); // 78,000 HKD
    this.mockBalances.set('0x2345678901234567890123456789012345678901', 3900000);  // 39,000 HKD
    this.mockBalances.set('0x3456789012345678901234567890123456789012', 1950000);  // 19,500 HKD
  }

  async transfer(request: StablecoinTransferRequest): Promise<StablecoinTransferResponse> {
    this.logger.log(`Processing HKD stablecoin transfer: ${request.amount} from ${request.fromAddress} to ${request.toAddress}`);

    // Validate addresses
    if (!this.isValidAddress(request.fromAddress) || !this.isValidAddress(request.toAddress)) {
      return {
        success: false,
        error: 'Invalid address format',
      };
    }

    // Check balance
    const fromBalance = this.mockBalances.get(request.fromAddress) || 0;
    if (fromBalance < request.amount) {
      return {
        success: false,
        error: 'Insufficient balance',
      };
    }

    // Simulate network delay (HKD stablecoin might be on different network)
    await new Promise(resolve => setTimeout(resolve, 150 + Math.random() * 300));

    // Generate mock transaction hash
    const transactionHash = `0x${Math.random().toString(16).substr(2, 64)}`;
    const blockNumber = Math.floor(Math.random() * 1000000) + 2000000; // Different block range
    const gasUsed = Math.floor(Math.random() * 30000) + 15000; // Lower gas for HKD network
    const gasPrice = Math.random() * 30 + 10; // Lower gas price

    // Update balances
    this.mockBalances.set(request.fromAddress, fromBalance - request.amount);
    const toBalance = this.mockBalances.get(request.toAddress) || 0;
    this.mockBalances.set(request.toAddress, toBalance + request.amount);

    // Store transaction details
    this.mockTransactions.set(transactionHash, {
      from: request.fromAddress,
      to: request.toAddress,
      amount: request.amount,
      blockNumber,
      gasUsed,
      gasPrice,
      timestamp: new Date(),
      status: 'confirmed',
      confirmations: 8, // Faster confirmation on HKD network
    });

    this.logger.log(`HKD stablecoin transfer successful: ${transactionHash}`);

    return {
      success: true,
      transactionHash,
      blockNumber,
      gasUsed,
      gasPrice,
      metadata: {
        adapter: 'HKD_STABLECOIN_MOCK',
        network: 'HKD Blockchain Network',
        confirmations: 8,
        exchangeRate: 7.8, // HKD to USD approximate rate
      },
    };
  }

  async getBalance(address: string, stablecoinType: string): Promise<StablecoinBalanceResponse> {
    if (stablecoinType !== 'HKD_STABLECOIN') {
      throw new Error(`Unsupported stablecoin type: ${stablecoinType}`);
    }

    const balance = this.mockBalances.get(address) || 0;
    
    return {
      address,
      balance,
      stablecoinType: 'HKD_STABLECOIN',
      lastUpdated: new Date(),
    };
  }

  isValidAddress(address: string): boolean {
    // Basic Ethereum address validation (HKD network might use similar format)
    return /^0x[a-fA-F0-9]{40}$/.test(address);
  }

  async getTransactionStatus(transactionHash: string): Promise<{
    status: 'pending' | 'confirmed' | 'failed';
    confirmations: number;
    blockNumber?: number;
  }> {
    const transaction = this.mockTransactions.get(transactionHash);
    
    if (!transaction) {
      return {
        status: 'failed',
        confirmations: 0,
      };
    }

    return {
      status: transaction.status as 'pending' | 'confirmed' | 'failed',
      confirmations: transaction.confirmations,
      blockNumber: transaction.blockNumber,
    };
  }

  getInfo() {
    return {
      name: 'HKD Stablecoin Mock Adapter',
      version: '1.0.0',
      supportedStablecoins: ['HKD_STABLECOIN'],
      network: 'HKD Blockchain Network',
      isTestnet: false,
    };
  }

  async healthCheck() {
    try {
      // Simulate health check
      await new Promise(resolve => setTimeout(resolve, 60));
      
      return {
        status: 'healthy',
        details: {
          adapter: 'HKD_STABLECOIN_MOCK',
          mockBalancesCount: this.mockBalances.size,
          mockTransactionsCount: this.mockTransactions.size,
          lastCheck: new Date().toISOString(),
          network: 'HKD Blockchain Network',
        },
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        details: {
          error: error.message,
          adapter: 'HKD_STABLECOIN_MOCK',
        },
      };
    }
  }

  // Mock methods for testing
  setMockBalance(address: string, balance: number) {
    this.mockBalances.set(address, balance);
  }

  getMockBalances() {
    return Object.fromEntries(this.mockBalances);
  }

  clearMockData() {
    this.mockBalances.clear();
    this.mockTransactions.clear();
  }

  // HKD-specific methods
  getExchangeRate(): number {
    return 7.8; // HKD to USD approximate rate
  }

  convertToUSD(hkdAmount: number): number {
    return hkdAmount / 100; // Assuming amounts are in cents
  }

  convertToHKD(usdAmount: number): number {
    return usdAmount * 7.8 * 100; // Convert to HKD cents
  }
}
