import { Injectable, Logger } from '@nestjs/common';
import { USDCAdapter } from './usdc-adapter';
import { HKDStablecoinAdapter } from './hkd-stablecoin-adapter';
import { StablecoinAdapter, StablecoinTransferRequest, StablecoinTransferResponse, StablecoinBalanceResponse } from './stablecoin-adapter.interface';

export type StablecoinType = 'USDC' | 'HKD_STABLECOIN';

@Injectable()
export class StablecoinAdapterService {
  private readonly logger = new Logger(StablecoinAdapterService.name);
  private readonly adapters = new Map<StablecoinType, StablecoinAdapter>();

  constructor(
    private readonly usdcAdapter: USDCAdapter,
    private readonly hkdAdapter: HKDStablecoinAdapter,
  ) {
    // Register adapters
    this.adapters.set('USDC', this.usdcAdapter);
    this.adapters.set('HKD_STABLECOIN', this.hkdAdapter);
  }

  /**
   * Get adapter for specific stablecoin type
   */
  getAdapter(stablecoinType: StablecoinType): StablecoinAdapter {
    const adapter = this.adapters.get(stablecoinType);
    if (!adapter) {
      throw new Error(`No adapter found for stablecoin type: ${stablecoinType}`);
    }
    return adapter;
  }

  /**
   * Transfer stablecoins using the appropriate adapter
   */
  async transfer(request: StablecoinTransferRequest): Promise<StablecoinTransferResponse> {
    const adapter = this.getAdapter(request.stablecoinType);
    
    try {
      this.logger.log(`Initiating ${request.stablecoinType} transfer via ${adapter.getInfo().name}`);
      const result = await adapter.transfer(request);
      
      if (result.success) {
        this.logger.log(`Transfer successful: ${result.transactionHash}`);
      } else {
        this.logger.error(`Transfer failed: ${result.error}`);
      }
      
      return result;
    } catch (error) {
      this.logger.error(`Transfer error: ${error.message}`, error.stack);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Get balance for a specific address and stablecoin type
   */
  async getBalance(address: string, stablecoinType: StablecoinType): Promise<StablecoinBalanceResponse> {
    const adapter = this.getAdapter(stablecoinType);
    return adapter.getBalance(address, stablecoinType);
  }

  /**
   * Check if an address is valid for the specified stablecoin type
   */
  isValidAddress(address: string, stablecoinType: StablecoinType): boolean {
    const adapter = this.getAdapter(stablecoinType);
    return adapter.isValidAddress(address);
  }

  /**
   * Get transaction status
   */
  async getTransactionStatus(transactionHash: string, stablecoinType: StablecoinType) {
    const adapter = this.getAdapter(stablecoinType);
    return adapter.getTransactionStatus(transactionHash);
  }

  /**
   * Get information about all available adapters
   */
  getAdaptersInfo() {
    const info: Record<string, any> = {};
    
    for (const [type, adapter] of this.adapters.entries()) {
      info[type] = adapter.getInfo();
    }
    
    return info;
  }

  /**
   * Health check for all adapters
   */
  async healthCheck() {
    const results: Record<string, any> = {};
    
    for (const [type, adapter] of this.adapters.entries()) {
      try {
        results[type] = await adapter.healthCheck();
      } catch (error) {
        results[type] = {
          status: 'unhealthy',
          error: error.message,
        };
      }
    }
    
    const overallStatus = Object.values(results).every(
      result => result.status === 'healthy'
    ) ? 'healthy' : 'unhealthy';
    
    return {
      status: overallStatus,
      adapters: results,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Get supported stablecoin types
   */
  getSupportedStablecoins(): StablecoinType[] {
    return Array.from(this.adapters.keys());
  }

  /**
   * Check if a stablecoin type is supported
   */
  isSupported(stablecoinType: string): stablecoinType is StablecoinType {
    return this.adapters.has(stablecoinType as StablecoinType);
  }

  /**
   * Get adapter statistics
   */
  getAdapterStats() {
    const stats: Record<string, any> = {};
    
    for (const [type, adapter] of this.adapters.entries()) {
      if ('getMockBalances' in adapter) {
        stats[type] = {
          mockBalances: (adapter as any).getMockBalances(),
          mockTransactionsCount: Object.keys((adapter as any).getMockBalances()).length,
        };
      }
    }
    
    return stats;
  }

  /**
   * Reset mock data for testing
   */
  resetMockData() {
    for (const [type, adapter] of this.adapters.entries()) {
      if ('clearMockData' in adapter) {
        (adapter as any).clearMockData();
        this.logger.log(`Reset mock data for ${type} adapter`);
      }
    }
  }
}
