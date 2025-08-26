import { Market, LiquidityPool, Trade, OrderBook, MarketData } from '../entities';

// Market listing and information
export interface MarketInfo {
  id: string;
  symbol: string;
  baseAsset: string;
  quoteAsset: string;
  minOrderSize: number;
  maxOrderSize: number;
  tickSize: number;
  status: 'active' | 'inactive' | 'maintenance';
  fees: {
    maker: number;
    taker: number;
  };
  limits: {
    minPrice: number;
    maxPrice: number;
    minQuantity: number;
    maxQuantity: number;
  };
}

// Pool creation and management
export interface PoolCreationRequest {
  marketId: string;
  baseAssetAmount: number;
  quoteAssetAmount: number;
  fee: number;
  owner: string;
}

export interface PoolInfo {
  id: string;
  marketId: string;
  baseAssetReserves: number;
  quoteAssetReserves: number;
  totalSupply: number;
  fee: number;
  owner: string;
  createdAt: Date;
  updatedAt: Date;
}

// Liquidity provision
export interface LiquidityProvisionRequest {
  poolId: string;
  baseAssetAmount: number;
  quoteAssetAmount: number;
  provider: string;
  slippageTolerance: number;
}

export interface LiquidityProvisionResult {
  success: boolean;
  lpTokens: number;
  baseAssetUsed: number;
  quoteAssetUsed: number;
  fee: number;
  transactionHash?: string;
  error?: string;
}

// Trading operations
export interface TradeRequest {
  marketId: string;
  side: 'buy' | 'sell';
  type: 'market' | 'limit' | 'stop';
  quantity: number;
  price?: number;
  stopPrice?: number;
  timeInForce: 'GTC' | 'IOC' | 'FOK';
  trader: string;
  slippageTolerance: number;
}

export interface TradeResult {
  success: boolean;
  tradeId: string;
  executedPrice: number;
  executedQuantity: number;
  fee: number;
  transactionHash?: string;
  error?: string;
}

// Market data
export interface MarketDataRequest {
  marketId: string;
  interval?: '1m' | '5m' | '15m' | '1h' | '4h' | '1d';
  limit?: number;
  startTime?: Date;
  endTime?: Date;
}

export interface MarketDataSnapshot {
  marketId: string;
  timestamp: Date;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  quoteVolume: number;
  trades: number;
  bid: number;
  ask: number;
  bidSize: number;
  askSize: number;
}

// Order book
export interface OrderBookRequest {
  marketId: string;
  depth?: number;
}

export interface OrderBookSnapshot {
  marketId: string;
  timestamp: Date;
  bids: Array<[number, number]>; // [price, quantity]
  asks: Array<[number, number]>; // [price, quantity]
  lastUpdateId: number;
}

// Core connector interface
export interface LiquidityConnector {
  // Market operations
  listMarkets(): Promise<MarketInfo[]>;
  getMarketInfo(marketId: string): Promise<MarketInfo>;
  
  // Pool operations
  createPool(request: PoolCreationRequest): Promise<PoolInfo>;
  getPoolInfo(poolId: string): Promise<PoolInfo>;
  listPools(marketId?: string): Promise<PoolInfo[]>;
  
  // Liquidity operations
  provideLiquidity(request: LiquidityProvisionRequest): Promise<LiquidityProvisionResult>;
  removeLiquidity(poolId: string, lpTokens: number, provider: string): Promise<LiquidityProvisionResult>;
  
  // Trading operations
  placeOrder(request: TradeRequest): Promise<TradeResult>;
  cancelOrder(orderId: string, trader: string): Promise<boolean>;
  getOrderStatus(orderId: string): Promise<any>;
  
  // Market data
  getMarketData(request: MarketDataRequest): Promise<MarketDataSnapshot[]>;
  getOrderBook(request: OrderBookRequest): Promise<OrderBookSnapshot>;
  getTicker(marketId: string): Promise<MarketDataSnapshot>;
  
  // Connection management
  connect(): Promise<void>;
  disconnect(): Promise<void>;
  isConnected(): boolean;
  
  // Health and status
  healthCheck(): Promise<{ status: string; details: any }>;
  getCapabilities(): Promise<{
    supports: string[];
    limits: any;
    features: string[];
  }>;
}

// AMM-specific interface for bonding curve calculations
export interface AMMConnector extends LiquidityConnector {
  // AMM-specific methods
  calculateSpotPrice(poolId: string, baseAssetAmount: number): Promise<number>;
  calculateSwapOutput(
    poolId: string,
    inputAmount: number,
    inputAsset: 'base' | 'quote'
  ): Promise<{
    outputAmount: number;
    priceImpact: number;
    fee: number;
  }>;
  
  // Bonding curve parameters
  getBondingCurveParams(poolId: string): Promise<{
    type: 'constant_product' | 'constant_sum' | 'hybrid';
    parameters: any;
  }>;
  
  // Impermanent loss calculation
  calculateImpermanentLoss(
    poolId: string,
    baseAssetAmount: number,
    quoteAssetAmount: number
  ): Promise<{
    impermanentLoss: number;
    percentage: number;
  }>;
}

// DEX-specific interface
export interface DEXConnector extends LiquidityConnector {
  // DEX-specific methods
  getGasEstimate(operation: string, params: any): Promise<{
    gasLimit: number;
    gasPrice: number;
    estimatedCost: number;
  }>;
  
  // Transaction management
  submitTransaction(transaction: any): Promise<{
    success: boolean;
    transactionHash: string;
    error?: string;
  }>;
  
  // Event streaming
  subscribeToEvents(eventTypes: string[], callback: (event: any) => void): Promise<string>;
  unsubscribeFromEvents(subscriptionId: string): Promise<boolean>;
}

// CEX-specific interface
export interface CEXConnector extends LiquidityConnector {
  // CEX-specific methods
  getAccountBalance(accountId: string): Promise<{
    assets: Array<{
      asset: string;
      free: number;
      locked: number;
      total: number;
    }>;
  }>;
  
  // Order management
  getOpenOrders(marketId: string, accountId: string): Promise<any[]>;
  getOrderHistory(marketId: string, accountId: string, limit?: number): Promise<any[]>;
  
  // Account operations
  createAccount(credentials: any): Promise<{ accountId: string; status: string }>;
  updateAccount(accountId: string, updates: any): Promise<boolean>;
}
