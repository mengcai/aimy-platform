import { Injectable, Logger } from '@nestjs/common';
import { StablecoinAdapter, StablecoinTransferRequest, StablecoinTransferResponse, StablecoinBalanceResponse } from './stablecoin-adapter.interface';

@Injectable()
export class USDCAdapter implements StablecoinAdapter {
  private readonly logger = new Logger(USDCAdapter.name);
  private readonly mockBalances = new Map<string, number>();
  private readonly mockTransactions = new Map<string, any>();

  constructor() {
    // Initialize with some mock balances
    this.mockBalances.set('0x1234567890123456789012345678901234567890', 1000000); // 1M USDC
    this.mockBalances.set('0x2345678901234567890123456789012345678901', 500000);  // 500K USDC
    this.mockBalances.set('0x3456789012345678901234567890123456789012', 250000);  // 250K USDC
  }

  async transfer(request: StablecoinTransferRequest): Promise<StablecoinTransferResponse> {
    this.logger.log(`Processing USDC transfer: ${request.amount} from ${request.fromAddress} to ${request.toAddress}`);

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

    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 100 + Math.random() * 200));

    // Generate mock transaction hash
    const transactionHash = `0x${Math.random().toString(16).substr(2, 64)}`;
    const blockNumber = Math.floor(Math.random() * 1000000) + 1000000;
    const gasUsed = Math.floor(Math.random() * 50000) + 21000;
    const gasPrice = Math.random() * 50 + 20;

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
      confirmations: 12,
    });

    this.logger.log(`USDC transfer successful: ${transactionHash}`);

    return {
      success: true,
      transactionHash,
      blockNumber,
      gasUsed,
      gasPrice,
      metadata: {
        adapter: 'USDC_MOCK',
        network: 'Ethereum Mainnet',
        confirmations: 12,
      },
    };
  }

  async getBalance(address: string, stablecoinType: string): Promise<StablecoinBalanceResponse> {
    if (stablecoinType !== 'USDC') {
      throw new Error(`Unsupported stablecoin type: ${stablecoinType}`);
    }

    const balance = this.mockBalances.get(address) || 0;
    
    return {
      address,
      balance,
      stablecoinType: 'USDC',
      lastUpdated: new Date(),
    };
  }

  isValidAddress(address: string): boolean {
    // Basic Ethereum address validation
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
      name: 'USDC Mock Adapter',
      version: '1.0.0',
      supportedStablecoins: ['USDC'],
      network: 'Ethereum Mainnet',
      isTestnet: false,
    };
  }

  async healthCheck() {
    try {
      // Simulate health check
      await new Promise(resolve => setTimeout(resolve, 50));
      
      return {
        status: 'healthy',
        details: {
          adapter: 'USDC_MOCK',
          mockBalancesCount: this.mockBalances.size,
          mockTransactionsCount: this.mockTransactions.size,
          lastCheck: new Date().toISOString(),
        },
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        details: {
          error: error.message,
          adapter: 'USDC_MOCK',
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
}
