export interface StablecoinTransferRequest {
  fromAddress: string;
  toAddress: string;
  amount: number;
  stablecoinType: 'USDC' | 'HKD_STABLECOIN';
  metadata?: Record<string, any>;
}

export interface StablecoinTransferResponse {
  success: boolean;
  transactionHash?: string;
  blockNumber?: number;
  gasUsed?: number;
  gasPrice?: number;
  error?: string;
  metadata?: Record<string, any>;
}

export interface StablecoinBalanceResponse {
  address: string;
  balance: number;
  stablecoinType: string;
  lastUpdated: Date;
}

export interface StablecoinAdapter {
  /**
   * Transfer stablecoins between addresses
   */
  transfer(request: StablecoinTransferRequest): Promise<StablecoinTransferResponse>;

  /**
   * Get balance for a specific address
   */
  getBalance(address: string, stablecoinType: string): Promise<StablecoinBalanceResponse>;

  /**
   * Check if an address is valid
   */
  isValidAddress(address: string): boolean;

  /**
   * Get transaction status
   */
  getTransactionStatus(transactionHash: string): Promise<{
    status: 'pending' | 'confirmed' | 'failed';
    confirmations: number;
    blockNumber?: number;
  }>;

  /**
   * Get adapter information
   */
  getInfo(): {
    name: string;
    version: string;
    supportedStablecoins: string[];
    network: string;
    isTestnet: boolean;
  };

  /**
   * Health check
   */
  healthCheck(): Promise<{
    status: 'healthy' | 'unhealthy';
    details?: Record<string, any>;
  }>;
}
