import { Injectable, Logger } from '@nestjs/common';
import { Decimal } from 'decimal.js';
import {
  LiquidityConnector,
  AMMConnector,
  DEXConnector,
  MarketInfo,
  PoolInfo,
  PoolCreationRequest,
  LiquidityProvisionRequest,
  LiquidityProvisionResult,
  TradeRequest,
  TradeResult,
  MarketDataRequest,
  MarketDataSnapshot,
  OrderBookRequest,
  OrderBookSnapshot,
} from '../interfaces/liquidity-connector.interface';

@Injectable()
export class MockDEXAdapter implements LiquidityConnector, AMMConnector, DEXConnector {
  private readonly logger = new Logger(MockDEXAdapter.name);
  private isConnectedFlag = false;
  private markets = new Map<string, MarketInfo>();
  private pools = new Map<string, PoolInfo>();
  private trades = new Map<string, any>();
  private orderBooks = new Map<string, OrderBookSnapshot>();
  private marketData = new Map<string, MarketDataSnapshot[]>();
  private sequenceNumber = 0;

  constructor() {
    this.initializeMockData();
  }

  private initializeMockData(): void {
    // Initialize mock markets
    const mockMarkets: MarketInfo[] = [
      {
        id: 'market-1',
        symbol: 'AIMY/USDC',
        baseAsset: 'AIMY',
        quoteAsset: 'USDC',
        minOrderSize: 0.01,
        maxOrderSize: 1000000,
        tickSize: 0.0001,
        status: 'active',
        fees: { maker: 0.001, taker: 0.002 },
        limits: { minPrice: 0.0001, maxPrice: 1000, minQuantity: 0.01, maxQuantity: 1000000 },
      },
      {
        id: 'market-2',
        symbol: 'AIMY/ETH',
        baseAsset: 'AIMY',
        quoteAsset: 'ETH',
        minOrderSize: 0.01,
        maxOrderSize: 1000000,
        tickSize: 0.0001,
        status: 'active',
        fees: { maker: 0.001, taker: 0.002 },
        limits: { minPrice: 0.0001, maxPrice: 1000, minQuantity: 0.01, maxQuantity: 1000000 },
      },
    ];

    mockMarkets.forEach(market => this.markets.set(market.id, market));

    // Initialize mock pools
    const mockPools: PoolInfo[] = [
      {
        id: 'pool-1',
        marketId: 'market-1',
        baseAssetReserves: 1000000,
        quoteAssetReserves: 50000,
        totalSupply: 1000000,
        fee: 0.003,
        owner: 'pool-owner-1',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 'pool-2',
        marketId: 'market-2',
        baseAssetReserves: 500000,
        quoteAssetReserves: 1000,
        totalSupply: 500000,
        fee: 0.003,
        owner: 'pool-owner-2',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    mockPools.forEach(pool => this.pools.set(pool.id, pool));

    // Initialize mock order books
    this.initializeOrderBooks();
    this.initializeMarketData();
  }

  private initializeOrderBooks(): void {
    const markets = Array.from(this.markets.values());
    
    markets.forEach(market => {
      const bids: Array<[number, number]> = [
        [0.049, 1000],
        [0.048, 2000],
        [0.047, 3000],
        [0.046, 4000],
        [0.045, 5000],
      ];

      const asks: Array<[number, number]> = [
        [0.051, 1000],
        [0.052, 2000],
        [0.053, 3000],
        [0.054, 4000],
        [0.055, 5000],
      ];

      this.orderBooks.set(market.id, {
        marketId: market.id,
        timestamp: new Date(),
        bids,
        asks,
        lastUpdateId: ++this.sequenceNumber,
      });
    });
  }

  private initializeMarketData(): void {
    const markets = Array.from(this.markets.values());
    const now = new Date();
    
    markets.forEach(market => {
      const data: MarketDataSnapshot[] = [];
      const basePrice = market.symbol.includes('USDC') ? 0.05 : 0.0001;
      
      // Generate 24 hours of hourly data
      for (let i = 23; i >= 0; i--) {
        const timestamp = new Date(now.getTime() - i * 60 * 60 * 1000);
        const open = basePrice * (1 + (Math.random() - 0.5) * 0.1);
        const high = open * (1 + Math.random() * 0.05);
        const low = open * (1 - Math.random() * 0.05);
        const close = (open + high + low) / 3;
        const volume = Math.random() * 10000 + 1000;
        
        data.push({
          marketId: market.id,
          timestamp,
          open,
          high,
          low,
          close,
          volume,
          quoteVolume: volume * close,
          trades: Math.floor(Math.random() * 100) + 10,
          bid: close * 0.999,
          ask: close * 1.001,
          bidSize: volume * 0.1,
          askSize: volume * 0.1,
        });
      }
      
      this.marketData.set(market.id, data);
    });
  }

  // Connection management
  async connect(): Promise<void> {
    this.logger.log('Mock DEX adapter connecting...');
    await new Promise(resolve => setTimeout(resolve, 100));
    this.isConnectedFlag = true;
    this.logger.log('Mock DEX adapter connected');
  }

  async disconnect(): Promise<void> {
    this.logger.log('Mock DEX adapter disconnecting...');
    await new Promise(resolve => setTimeout(resolve, 100));
    this.isConnectedFlag = false;
    this.logger.log('Mock DEX adapter disconnected');
  }

  isConnected(): boolean {
    return this.isConnectedFlag;
  }

  // Market operations
  async listMarkets(): Promise<MarketInfo[]> {
    return Array.from(this.markets.values());
  }

  async getMarketInfo(marketId: string): Promise<MarketInfo> {
    const market = this.markets.get(marketId);
    if (!market) {
      throw new Error(`Market ${marketId} not found`);
    }
    return market;
  }

  // Pool operations
  async createPool(request: PoolCreationRequest): Promise<PoolInfo> {
    const poolId = `pool-${Date.now()}`;
    const pool: PoolInfo = {
      id: poolId,
      marketId: request.marketId,
      baseAssetReserves: request.baseAssetAmount,
      quoteAssetReserves: request.quoteAssetAmount,
      totalSupply: Math.sqrt(request.baseAssetAmount * request.quoteAssetAmount),
      fee: request.fee,
      owner: request.owner,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.pools.set(poolId, pool);
    this.logger.log(`Created pool ${poolId} for market ${request.marketId}`);
    
    return pool;
  }

  async getPoolInfo(poolId: string): Promise<PoolInfo> {
    const pool = this.pools.get(poolId);
    if (!pool) {
      throw new Error(`Pool ${poolId} not found`);
    }
    return pool;
  }

  async listPools(marketId?: string): Promise<PoolInfo[]> {
    const pools = Array.from(this.pools.values());
    if (marketId) {
      return pools.filter(pool => pool.marketId === marketId);
    }
    return pools;
  }

  // Liquidity operations
  async provideLiquidity(request: LiquidityProvisionRequest): Promise<LiquidityProvisionResult> {
    const pool = this.pools.get(request.poolId);
    if (!pool) {
      throw new Error(`Pool ${request.poolId} not found`);
    }

    // Calculate LP tokens using constant product formula
    const totalSupply = pool.totalSupply;
    const baseReserves = pool.baseAssetReserves;
    const quoteReserves = pool.quoteAssetReserves;

    if (totalSupply === 0) {
      // First liquidity provision
      const lpTokens = Math.sqrt(request.baseAssetAmount * request.quoteAssetAmount);
      const fee = 0;

      // Update pool
      pool.baseAssetReserves += request.baseAssetAmount;
      pool.quoteAssetReserves += request.quoteAssetAmount;
      pool.totalSupply = lpTokens;
      pool.updatedAt = new Date();

      return {
        success: true,
        lpTokens,
        baseAssetUsed: request.baseAssetAmount,
        quoteAssetUsed: request.quoteAssetAmount,
        fee,
        transactionHash: `tx-${Date.now()}`,
      };
    } else {
      // Subsequent liquidity provision
      const baseRatio = request.baseAssetAmount / baseReserves;
      const quoteRatio = request.quoteAssetAmount / quoteReserves;
      const minRatio = Math.min(baseRatio, quoteRatio);

      const lpTokens = totalSupply * minRatio;
      const baseAssetUsed = baseReserves * minRatio;
      const quoteAssetUsed = quoteReserves * minRatio;
      const fee = 0; // No fee for adding liquidity

      // Update pool
      pool.baseAssetReserves += baseAssetUsed;
      pool.quoteAssetReserves += quoteAssetUsed;
      pool.totalSupply += lpTokens;
      pool.updatedAt = new Date();

      return {
        success: true,
        lpTokens,
        baseAssetUsed,
        quoteAssetUsed,
        fee,
        transactionHash: `tx-${Date.now()}`,
      };
    }
  }

  async removeLiquidity(poolId: string, lpTokens: number, provider: string): Promise<LiquidityProvisionResult> {
    const pool = this.pools.get(poolId);
    if (!pool) {
      throw new Error(`Pool ${poolId} not found`);
    }

    const ratio = lpTokens / pool.totalSupply;
    const baseAssetReturned = pool.baseAssetReserves * ratio;
    const quoteAssetReturned = pool.quoteAssetReserves * ratio;

    // Update pool
    pool.baseAssetReserves -= baseAssetReturned;
    pool.quoteAssetReserves -= quoteAssetReturned;
    pool.totalSupply -= lpTokens;
    pool.updatedAt = new Date();

    return {
      success: true,
      lpTokens: -lpTokens,
      baseAssetUsed: baseAssetReturned,
      quoteAssetUsed: quoteAssetReturned,
      fee: 0,
      transactionHash: `tx-${Date.now()}`,
    };
  }

  // Trading operations
  async placeOrder(request: TradeRequest): Promise<TradeResult> {
    const market = this.markets.get(request.marketId);
    if (!market) {
      throw new Error(`Market ${request.marketId} not found`);
    }

    if (request.type === 'market') {
      return this.executeMarketOrder(request);
    } else {
      return this.createLimitOrder(request);
    }
  }

  private async executeMarketOrder(request: TradeRequest): Promise<TradeResult> {
    const pool = Array.from(this.pools.values()).find(p => p.marketId === request.marketId);
    if (!pool) {
      throw new Error(`No pool found for market ${request.marketId}`);
    }

    // Calculate swap using constant product formula
    const { outputAmount, priceImpact, fee } = await this.calculateSwapOutput(
      pool.id,
      request.quantity,
      request.side === 'buy' ? 'quote' : 'base'
    );

    const tradeId = `trade-${Date.now()}`;
    const executedPrice = request.side === 'buy' ? 
      request.quantity / outputAmount : 
      outputAmount / request.quantity;

    // Update pool reserves
    if (request.side === 'buy') {
      pool.quoteAssetReserves += request.quantity;
      pool.baseAssetReserves -= outputAmount;
    } else {
      pool.baseAssetReserves += request.quantity;
      pool.quoteAssetReserves -= outputAmount;
    }
    pool.updatedAt = new Date();

    // Record trade
    this.trades.set(tradeId, {
      id: tradeId,
      marketId: request.marketId,
      side: request.side,
      type: request.type,
      quantity: request.quantity,
      executedQuantity: request.quantity,
      price: executedPrice,
      executedPrice,
      fee,
      trader: request.trader,
      status: 'executed',
      executedAt: new Date(),
    });

    return {
      success: true,
      tradeId,
      executedPrice,
      executedQuantity: request.quantity,
      fee,
      transactionHash: `tx-${Date.now()}`,
    };
  }

  private async createLimitOrder(request: TradeRequest): Promise<TradeResult> {
    const orderId = `order-${Date.now()}`;
    
    // Store pending order
    this.trades.set(orderId, {
      id: orderId,
      marketId: request.marketId,
      side: request.side,
      type: request.type,
      quantity: request.quantity,
      executedQuantity: 0,
      price: request.price,
      status: 'pending',
      trader: request.trader,
      createdAt: new Date(),
    });

    return {
      success: true,
      tradeId: orderId,
      executedPrice: 0,
      executedQuantity: 0,
      fee: 0,
      transactionHash: `order-${Date.now()}`,
    };
  }

  async cancelOrder(orderId: string, trader: string): Promise<boolean> {
    const order = this.trades.get(orderId);
    if (!order || order.trader !== trader) {
      return false;
    }

    order.status = 'cancelled';
    order.cancelledAt = new Date();
    
    return true;
  }

  async getOrderStatus(orderId: string): Promise<any> {
    return this.trades.get(orderId) || null;
  }

  // Market data
  async getMarketData(request: MarketDataRequest): Promise<MarketDataSnapshot[]> {
    const data = this.marketData.get(request.marketId);
    if (!data) {
      return [];
    }

    let filteredData = data;
    
    if (request.startTime) {
      filteredData = filteredData.filter(d => d.timestamp >= request.startTime!);
    }
    
    if (request.endTime) {
      filteredData = filteredData.filter(d => d.timestamp <= request.endTime!);
    }

    if (request.limit) {
      filteredData = filteredData.slice(-request.limit);
    }

    return filteredData;
  }

  async getOrderBook(request: OrderBookRequest): Promise<OrderBookSnapshot> {
    const orderBook = this.orderBooks.get(request.marketId);
    if (!orderBook) {
      throw new Error(`Order book not found for market ${request.marketId}`);
    }

    let bids = orderBook.bids;
    let asks = orderBook.asks;

    if (request.depth) {
      bids = bids.slice(0, request.depth);
      asks = asks.slice(0, request.depth);
    }

    return {
      ...orderBook,
      bids,
      asks,
      timestamp: new Date(),
    };
  }

  async getTicker(marketId: string): Promise<MarketDataSnapshot> {
    const data = this.marketData.get(marketId);
    if (!data || data.length === 0) {
      throw new Error(`Market data not found for market ${marketId}`);
    }

    return data[data.length - 1];
  }

  // AMM-specific methods
  async calculateSpotPrice(poolId: string, baseAssetAmount: number): Promise<number> {
    const pool = this.pools.get(poolId);
    if (!pool) {
      throw new Error(`Pool ${poolId} not found`);
    }

    if (pool.quoteAssetReserves === 0) return 0;
    return pool.baseAssetReserves / pool.quoteAssetReserves;
  }

  async calculateSwapOutput(
    poolId: string,
    inputAmount: number,
    inputAsset: 'base' | 'quote'
  ): Promise<{
    outputAmount: number;
    priceImpact: number;
    fee: number;
  }> {
    const pool = this.pools.get(poolId);
    if (!pool) {
      throw new Error(`Pool ${poolId} not found`);
    }

    const k = pool.baseAssetReserves * pool.quoteAssetReserves;
    const fee = inputAmount * pool.fee;
    const inputAmountAfterFee = inputAmount - fee;

    let outputAmount: number;
    let newBaseReserves: number;
    let newQuoteReserves: number;

    if (inputAsset === 'base') {
      newBaseReserves = pool.baseAssetReserves + inputAmountAfterFee;
      newQuoteReserves = k / newBaseReserves;
      outputAmount = pool.quoteAssetReserves - newQuoteReserves;
    } else {
      newQuoteReserves = pool.quoteAssetReserves + inputAmountAfterFee;
      newBaseReserves = k / newQuoteReserves;
      outputAmount = pool.baseAssetReserves - newBaseReserves;
    }

    const priceImpact = Math.abs(outputAmount / inputAmount - 1);

    return {
      outputAmount: Math.max(0, outputAmount),
      priceImpact,
      fee,
    };
  }

  async getBondingCurveParams(poolId: string): Promise<{
    type: 'constant_product' | 'constant_sum' | 'hybrid';
    parameters: any;
  }> {
    const pool = this.pools.get(poolId);
    if (!pool) {
      throw new Error(`Pool ${poolId} not found`);
    }

    return {
      type: 'constant_product',
      parameters: {
        k: pool.baseAssetReserves * pool.quoteAssetReserves,
        fee: pool.fee,
        protocolFee: 0,
        ownerFee: 0,
      },
    };
  }

  async calculateImpermanentLoss(
    poolId: string,
    baseAssetAmount: number,
    quoteAssetAmount: number
  ): Promise<{
    impermanentLoss: number;
    percentage: number;
  }> {
    const pool = this.pools.get(poolId);
    if (!pool) {
      throw new Error(`Pool ${poolId} not found`);
    }

    const initialValue = baseAssetAmount * pool.baseAssetPrice + quoteAssetAmount * pool.quoteAssetPrice;
    const currentValue = baseAssetAmount * pool.baseAssetPrice + quoteAssetAmount * pool.quoteAssetPrice;
    const impermanentLoss = currentValue - initialValue;
    const percentage = (impermanentLoss / initialValue) * 100;

    return {
      impermanentLoss,
      percentage,
    };
  }

  // DEX-specific methods
  async getGasEstimate(operation: string, params: any): Promise<{
    gasLimit: number;
    gasPrice: number;
    estimatedCost: number;
  }> {
    const gasEstimates = {
      swap: { gasLimit: 150000, gasPrice: 20 },
      addLiquidity: { gasLimit: 200000, gasPrice: 20 },
      removeLiquidity: { gasLimit: 150000, gasPrice: 20 },
      createPool: { gasLimit: 300000, gasPrice: 20 },
    };

    const estimate = gasEstimates[operation] || { gasLimit: 100000, gasPrice: 20 };
    const estimatedCost = (estimate.gasLimit * estimate.gasPrice) / 1e9; // Convert to ETH

    return {
      gasLimit: estimate.gasLimit,
      gasPrice: estimate.gasPrice,
      estimatedCost,
    };
  }

  async submitTransaction(transaction: any): Promise<{
    success: boolean;
    transactionHash: string;
    error?: string;
  }> {
    try {
      // Simulate transaction processing
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      return {
        success: true,
        transactionHash: `tx-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      };
    } catch (error) {
      return {
        success: false,
        transactionHash: '',
        error: error.message,
      };
    }
  }

  async subscribeToEvents(eventTypes: string[], callback: (event: any) => void): Promise<string> {
    const subscriptionId = `sub-${Date.now()}`;
    
    // Simulate event subscription
    setInterval(() => {
      eventTypes.forEach(eventType => {
        if (eventType === 'trade') {
          callback({
            type: 'trade',
            data: {
              marketId: 'market-1',
              price: 0.05 + Math.random() * 0.01,
              quantity: Math.random() * 1000,
              side: Math.random() > 0.5 ? 'buy' : 'sell',
              timestamp: new Date(),
            },
          });
        }
      });
    }, 5000);

    return subscriptionId;
  }

  async unsubscribeFromEvents(subscriptionId: string): Promise<boolean> {
    // Simulate unsubscription
    return true;
  }

  // Health and status
  async healthCheck(): Promise<{ status: string; details: any }> {
    return {
      status: 'healthy',
      details: {
        markets: this.markets.size,
        pools: this.pools.size,
        trades: this.trades.size,
        orderBooks: this.orderBooks.size,
        marketData: this.marketData.size,
        connected: this.isConnectedFlag,
        timestamp: new Date().toISOString(),
      },
    };
  }

  async getCapabilities(): Promise<{
    supports: string[];
    limits: any;
    features: string[];
  }> {
    return {
      supports: ['spot_trading', 'amm', 'liquidity_provision', 'limit_orders', 'market_orders'],
      limits: {
        maxOrderSize: 1000000,
        minOrderSize: 0.01,
        maxPrice: 1000,
        minPrice: 0.0001,
      },
      features: [
        'constant_product_amm',
        'impermanent_loss_protection',
        'slippage_protection',
        'gas_estimation',
        'real_time_data',
        'websocket_support',
      ],
    };
  }

  // Utility methods for testing
  resetMockData(): void {
    this.markets.clear();
    this.pools.clear();
    this.trades.clear();
    this.orderBooks.clear();
    this.marketData.clear();
    this.sequenceNumber = 0;
    this.initializeMockData();
  }

  getMockDataStats(): any {
    return {
      markets: this.markets.size,
      pools: this.pools.size,
      trades: this.trades.size,
      orderBooks: this.orderBooks.size,
      marketData: this.marketData.size,
    };
  }
}
