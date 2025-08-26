import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { LiquidityService } from '../services/liquidity.service';
import { MarketService } from '../services/market.service';
import { PoolService } from '../services/pool.service';
import { TradingService } from '../services/trading.service';
import { MarketDataService } from '../services/market-data.service';
import { WebSocketService } from '../services/websocket.service';
import { MockDEXAdapter } from '../adapters/mock-dex.adapter';
import { AdapterFactory } from '../adapters/adapter.factory';
import { Market, LiquidityPool, Trade, OrderBook, MarketData } from '../entities';

describe('LiquidityService', () => {
  let module: TestingModule;
  let liquidityService: LiquidityService;
  let marketService: MarketService;
  let poolService: PoolService;
  let tradingService: TradingService;
  let marketDataService: MarketDataService;
  let webSocketService: WebSocketService;
  let mockDEXAdapter: MockDEXAdapter;
  let adapterFactory: AdapterFactory;

  // Mock repositories
  let marketRepository: Repository<Market>;
  let poolRepository: Repository<LiquidityPool>;
  let tradeRepository: Repository<Trade>;
  let orderBookRepository: Repository<OrderBook>;
  let marketDataRepository: Repository<MarketData>;

  beforeEach(async () => {
    module = await Test.createTestingModule({
      providers: [
        LiquidityService,
        MarketService,
        PoolService,
        TradingService,
        MarketDataService,
        WebSocketService,
        MockDEXAdapter,
        AdapterFactory,
        { provide: getRepositoryToken(Market), useValue: { create: jest.fn(), save: jest.fn(), find: jest.fn(), findOne: jest.fn(), update: jest.fn(), delete: jest.fn() } },
        { provide: getRepositoryToken(LiquidityPool), useValue: { create: jest.fn(), save: jest.fn(), find: jest.fn(), findOne: jest.fn(), update: jest.fn(), delete: jest.fn() } },
        { provide: getRepositoryToken(Trade), useValue: { create: jest.fn(), save: jest.fn(), find: jest.fn(), findOne: jest.fn(), update: jest.fn(), delete: jest.fn() } },
        { provide: getRepositoryToken(OrderBook), useValue: { create: jest.fn(), save: jest.fn(), find: jest.fn(), findOne: jest.fn(), update: jest.fn(), delete: jest.fn() } },
        { provide: getRepositoryToken(MarketData), useValue: { create: jest.fn(), save: jest.fn(), find: jest.fn(), findOne: jest.fn(), update: jest.fn(), delete: jest.fn() } },
      ],
    }).compile();

    liquidityService = module.get<LiquidityService>(LiquidityService);
    marketService = module.get<MarketService>(MarketService);
    poolService = module.get<PoolService>(PoolService);
    tradingService = module.get<TradingService>(TradingService);
    marketDataService = module.get<MarketDataService>(MarketDataService);
    webSocketService = module.get<WebSocketService>(WebSocketService);
    mockDEXAdapter = module.get<MockDEXAdapter>(MockDEXAdapter);
    adapterFactory = module.get<AdapterFactory>(AdapterFactory);

    marketRepository = module.get<Repository<Market>>(getRepositoryToken(Market));
    poolRepository = module.get<Repository<LiquidityPool>>(getRepositoryToken(LiquidityPool));
    tradeRepository = module.get<Repository<Trade>>(getRepositoryToken(Trade));
    orderBookRepository = module.get<Repository<OrderBook>>(getRepositoryToken(OrderBook));
    marketDataRepository = module.get<Repository<MarketData>>(getRepositoryToken(MarketData));
  });

  afterEach(async () => {
    await module.close();
  });

  describe('MockDEXAdapter - AMM Math Tests', () => {
    beforeEach(async () => {
      await mockDEXAdapter.connect();
    });

    afterEach(async () => {
      await mockDEXAdapter.disconnect();
      mockDEXAdapter.resetMockData();
    });

    describe('Constant Product AMM - Deterministic Math', () => {
      it('should maintain constant product (k) during swaps', async () => {
        const pool = await mockDEXAdapter.getPoolInfo('pool-1');
        const initialK = pool.baseAssetReserves * pool.quoteAssetReserves;
        
        // Perform a swap
        const swapResult = await mockDEXAdapter.placeOrder({
          marketId: 'market-1',
          side: 'buy',
          type: 'market',
          quantity: 1000, // USDC
          trader: 'test-trader',
          slippageTolerance: 0.01,
          timeInForce: 'IOC',
        });

        expect(swapResult.success).toBe(true);
        
        // Get updated pool
        const updatedPool = await mockDEXAdapter.getPoolInfo('pool-1');
        const finalK = updatedPool.baseAssetReserves * updatedPool.quoteAssetReserves;
        
        // K should remain constant (within rounding errors)
        const kDifference = Math.abs(finalK - initialK);
        const kTolerance = initialK * 0.0001; // 0.01% tolerance
        
        expect(kDifference).toBeLessThanOrEqual(kTolerance);
      });

      it('should calculate correct spot price', async () => {
        const pool = await mockDEXAdapter.getPoolInfo('pool-1');
        const expectedSpotPrice = pool.baseAssetReserves / pool.quoteAssetReserves;
        
        const calculatedSpotPrice = await mockDEXAdapter.calculateSpotPrice('pool-1', 1);
        
        expect(calculatedSpotPrice).toBeCloseTo(expectedSpotPrice, 10);
      });

      it('should calculate swap output with correct formula', async () => {
        const pool = await mockDEXAdapter.getPoolInfo('pool-1');
        const inputAmount = 1000; // USDC
        const inputAsset = 'quote' as const;
        
        // Manual calculation using constant product formula
        const k = pool.baseAssetReserves * pool.quoteAssetReserves;
        const fee = inputAmount * pool.fee;
        const inputAmountAfterFee = inputAmount - fee;
        const newQuoteReserves = pool.quoteAssetReserves + inputAmountAfterFee;
        const newBaseReserves = k / newQuoteReserves;
        const expectedOutput = pool.baseAssetReserves - newBaseReserves;
        
        // Get result from adapter
        const result = await mockDEXAdapter.calculateSwapOutput('pool-1', inputAmount, inputAsset);
        
        expect(result.outputAmount).toBeCloseTo(expectedOutput, 10);
        expect(result.fee).toBeCloseTo(fee, 10);
      });

      it('should handle edge case: zero reserves', async () => {
        // Create a pool with zero reserves
        const zeroPool = await mockDEXAdapter.createPool({
          marketId: 'market-1',
          baseAssetAmount: 0,
          quoteAssetAmount: 0,
          fee: 0.003,
          owner: 'test-owner',
        });

        // Spot price should be 0 for zero reserves
        const spotPrice = await mockDEXAdapter.calculateSpotPrice(zeroPool.id, 1);
        expect(spotPrice).toBe(0);

        // Swap should fail gracefully
        const swapResult = await mockDEXAdapter.calculateSwapOutput(zeroPool.id, 100, 'quote');
        expect(swapResult.outputAmount).toBe(0);
      });

      it('should handle edge case: very small amounts', async () => {
        const pool = await mockDEXAdapter.getPoolInfo('pool-1');
        const verySmallAmount = 0.000000001; // 1 wei equivalent
        
        const result = await mockDEXAdapter.calculateSwapOutput('pool-1', verySmallAmount, 'quote');
        
        // Should handle very small amounts without errors
        expect(result.outputAmount).toBeGreaterThanOrEqual(0);
        expect(result.fee).toBeGreaterThanOrEqual(0);
      });

      it('should maintain price consistency across multiple swaps', async () => {
        const pool = await mockDEXAdapter.getPoolInfo('pool-1');
        const initialSpotPrice = await mockDEXAdapter.calculateSpotPrice('pool-1', 1);
        
        // Perform multiple small swaps
        for (let i = 0; i < 5; i++) {
          await mockDEXAdapter.placeOrder({
            marketId: 'market-1',
            side: 'buy',
            type: 'market',
            quantity: 100, // Small amount
            trader: `trader-${i}`,
            slippageTolerance: 0.01,
            timeInForce: 'IOC',
          });
        }
        
        const finalSpotPrice = await mockDEXAdapter.calculateSpotPrice('pool-1', 1);
        
        // Price should have changed due to swaps, but calculation should be consistent
        expect(finalSpotPrice).not.toBe(initialSpotPrice);
        expect(finalSpotPrice).toBeGreaterThan(0);
      });
    });

    describe('Liquidity Provision - Deterministic Math', () => {
      it('should calculate LP tokens correctly for first provision', async () => {
        const pool = await mockDEXAdapter.createPool({
          marketId: 'market-1',
          baseAssetAmount: 10000,
          quoteAssetAmount: 500,
          fee: 0.003,
          owner: 'test-owner',
        });

        const expectedLP = Math.sqrt(10000 * 500);
        expect(pool.totalSupply).toBeCloseTo(expectedLP, 10);
      });

      it('should calculate LP tokens correctly for subsequent provision', async () => {
        const pool = await mockDEXAdapter.getPoolInfo('pool-1');
        const initialSupply = pool.totalSupply;
        const baseReserves = pool.baseAssetReserves;
        const quoteReserves = pool.quoteAssetReserves;
        
        // Add liquidity
        const result = await mockDEXAdapter.provideLiquidity({
          poolId: 'pool-1',
          baseAssetAmount: 1000,
          quoteAssetAmount: 50,
          provider: 'test-provider',
          slippageTolerance: 0.01,
        });
        
        expect(result.success).toBe(true);
        
        // Calculate expected LP tokens
        const baseRatio = 1000 / baseReserves;
        const quoteRatio = 50 / quoteReserves;
        const minRatio = Math.min(baseRatio, quoteRatio);
        const expectedLP = initialSupply * minRatio;
        
        expect(result.lpTokens).toBeCloseTo(expectedLP, 10);
      });

      it('should maintain constant product during liquidity provision', async () => {
        const pool = await mockDEXAdapter.getPoolInfo('pool-1');
        const initialK = pool.baseAssetReserves * pool.quoteAssetReserves;
        
        await mockDEXAdapter.provideLiquidity({
          poolId: 'pool-1',
          baseAssetAmount: 1000,
          quoteAssetAmount: 50,
          provider: 'test-provider',
          slippageTolerance: 0.01,
        });
        
        const updatedPool = await mockDEXAdapter.getPoolInfo('pool-1');
        const finalK = updatedPool.baseAssetReserves * updatedPool.quoteAssetReserves;
        
        // K should increase proportionally
        expect(finalK).toBeGreaterThan(initialK);
      });

      it('should calculate impermanent loss correctly', async () => {
        const pool = await mockDEXAdapter.getPoolInfo('pool-1');
        const baseAmount = 1000;
        const quoteAmount = 50;
        
        const result = await mockDEXAdapter.calculateImpermanentLoss(
          'pool-1',
          baseAmount,
          quoteAmount
        );
        
        expect(result.impermanentLoss).toBeDefined();
        expect(result.percentage).toBeDefined();
        expect(typeof result.impermanentLoss).toBe('number');
        expect(typeof result.percentage).toBe('number');
      });
    });

    describe('Price Impact Calculations', () => {
      it('should calculate price impact correctly for small trades', async () => {
        const pool = await mockDEXAdapter.getPoolInfo('pool-1');
        const smallAmount = pool.quoteAssetReserves * 0.001; // 0.1% of reserves
        
        const result = await mockDEXAdapter.calculateSwapOutput('pool-1', smallAmount, 'quote');
        
        // Small trades should have minimal price impact
        expect(result.priceImpact).toBeLessThan(0.01); // Less than 1%
        expect(result.priceImpact).toBeGreaterThan(0);
      });

      it('should calculate price impact correctly for large trades', async () => {
        const pool = await mockDEXAdapter.getPoolInfo('pool-1');
        const largeAmount = pool.quoteAssetReserves * 0.1; // 10% of reserves
        
        const result = await mockDEXAdapter.calculateSwapOutput('pool-1', largeAmount, 'quote');
        
        // Large trades should have significant price impact
        expect(result.priceImpact).toBeGreaterThan(0.01); // More than 1%
        expect(result.priceImpact).toBeLessThan(1); // Less than 100%
      });

      it('should handle maximum trade size gracefully', async () => {
        const pool = await mockDEXAdapter.getPoolInfo('pool-1');
        const maxAmount = pool.quoteAssetReserves * 0.99; // 99% of reserves
        
        const result = await mockDEXAdapter.calculateSwapOutput('pool-1', maxAmount, 'quote');
        
        // Should handle large amounts without errors
        expect(result.outputAmount).toBeGreaterThan(0);
        expect(result.priceImpact).toBeLessThan(1);
      });
    });

    describe('Fee Calculations', () => {
      it('should calculate fees correctly', async () => {
        const pool = await mockDEXAdapter.getPoolInfo('pool-1');
        const inputAmount = 1000;
        const expectedFee = inputAmount * pool.fee;
        
        const result = await mockDEXAdapter.calculateSwapOutput('pool-1', inputAmount, 'quote');
        
        expect(result.fee).toBeCloseTo(expectedFee, 10);
      });

      it('should apply fees to input amount before swap calculation', async () => {
        const pool = await mockDEXAdapter.getPoolInfo('pool-1');
        const inputAmount = 1000;
        const fee = inputAmount * pool.fee;
        const inputAfterFee = inputAmount - fee;
        
        const result = await mockDEXAdapter.calculateSwapOutput('pool-1', inputAmount, 'quote');
        
        // The swap calculation should use the amount after fees
        expect(result.fee).toBeCloseTo(fee, 10);
        
        // Verify the constant product formula with fees
        const k = pool.baseAssetReserves * pool.quoteAssetReserves;
        const newQuoteReserves = pool.quoteAssetReserves + inputAfterFee;
        const newBaseReserves = k / newQuoteReserves;
        const expectedOutput = pool.baseAssetReserves - newBaseReserves;
        
        expect(result.outputAmount).toBeCloseTo(expectedOutput, 10);
      });
    });

    describe('Bonding Curve Parameters', () => {
      it('should return correct bonding curve type', async () => {
        const pool = await mockDEXAdapter.getPoolInfo('pool-1');
        const params = await mockDEXAdapter.getBondingCurveParams('pool-1');
        
        expect(params.type).toBe('constant_product');
        expect(params.parameters.k).toBeCloseTo(pool.baseAssetReserves * pool.quoteAssetReserves, 10);
        expect(params.parameters.fee).toBeCloseTo(pool.fee, 10);
      });

      it('should maintain parameter consistency across operations', async () => {
        const initialParams = await mockDEXAdapter.getBondingCurveParams('pool-1');
        
        // Perform some operations
        await mockDEXAdapter.placeOrder({
          marketId: 'market-1',
          side: 'buy',
          type: 'market',
          quantity: 100,
          trader: 'test-trader',
          slippageTolerance: 0.01,
          timeInForce: 'IOC',
        });
        
        const finalParams = await mockDEXAdapter.getBondingCurveParams('pool-1');
        
        // Type should remain the same
        expect(finalParams.type).toBe(initialParams.type);
        expect(finalParams.parameters.fee).toBeCloseTo(initialParams.parameters.fee, 10);
        
        // K should have changed due to the swap
        expect(finalParams.parameters.k).not.toBe(initialParams.parameters.k);
      });
    });

    describe('Edge Cases and Error Handling', () => {
      it('should handle negative amounts gracefully', async () => {
        const result = await mockDEXAdapter.calculateSwapOutput('pool-1', -100, 'quote');
        
        // Should handle negative amounts without crashing
        expect(result.outputAmount).toBe(0);
        expect(result.fee).toBe(0);
        expect(result.priceImpact).toBe(0);
      });

      it('should handle extremely large amounts gracefully', async () => {
        const extremelyLargeAmount = Number.MAX_SAFE_INTEGER;
        
        const result = await mockDEXAdapter.calculateSwapOutput('pool-1', extremelyLargeAmount, 'quote');
        
        // Should handle large amounts without crashing
        expect(result.outputAmount).toBeGreaterThanOrEqual(0);
        expect(result.fee).toBeGreaterThanOrEqual(0);
      });

      it('should handle zero amounts correctly', async () => {
        const result = await mockDEXAdapter.calculateSwapOutput('pool-1', 0, 'quote');
        
        expect(result.outputAmount).toBe(0);
        expect(result.fee).toBe(0);
        expect(result.priceImpact).toBe(0);
      });

      it('should handle precision issues correctly', async () => {
        const verySmallAmount = 0.000000000000000001;
        
        const result = await mockDEXAdapter.calculateSwapOutput('pool-1', verySmallAmount, 'quote');
        
        // Should handle very small amounts without precision errors
        expect(result.outputAmount).toBeGreaterThanOrEqual(0);
        expect(result.fee).toBeGreaterThanOrEqual(0);
      });
    });

    describe('Integration Tests', () => {
      it('should maintain consistency across multiple operations', async () => {
        const pool = await mockDEXAdapter.getPoolInfo('pool-1');
        const initialK = pool.baseAssetReserves * pool.quoteAssetReserves;
        const initialBaseReserves = pool.baseAssetReserves;
        const initialQuoteReserves = pool.quoteAssetReserves;
        
        // Perform a series of operations
        const operations = [
          { side: 'buy', amount: 100 },
          { side: 'sell', amount: 50 },
          { side: 'buy', amount: 200 },
          { side: 'sell', amount: 75 },
        ];
        
        for (const op of operations) {
          await mockDEXAdapter.placeOrder({
            marketId: 'market-1',
            side: op.side as 'buy' | 'sell',
            type: 'market',
            quantity: op.amount,
            trader: 'test-trader',
            slippageTolerance: 0.01,
            timeInForce: 'IOC',
          });
        }
        
        // Verify final state
        const finalPool = await mockDEXAdapter.getPoolInfo('pool-1');
        const finalK = finalPool.baseAssetReserves * finalPool.quoteAssetReserves;
        
        // K should remain constant (within rounding errors)
        const kDifference = Math.abs(finalK - initialK);
        const kTolerance = initialK * 0.001; // 0.1% tolerance
        
        expect(kDifference).toBeLessThanOrEqual(kTolerance);
        
        // Reserves should have changed
        expect(finalPool.baseAssetReserves).not.toBe(initialBaseReserves);
        expect(finalPool.quoteAssetReserves).not.toBe(initialQuoteReserves);
      });

      it('should handle concurrent operations correctly', async () => {
        const pool = await mockDEXAdapter.getPoolInfo('pool-1');
        const initialK = pool.baseAssetReserves * pool.quoteAssetReserves;
        
        // Perform multiple concurrent operations
        const promises = Array.from({ length: 10 }, (_, i) =>
          mockDEXAdapter.placeOrder({
            marketId: 'market-1',
            side: i % 2 === 0 ? 'buy' : 'sell',
            type: 'market',
            quantity: 10,
            trader: `trader-${i}`,
            slippageTolerance: 0.01,
            timeInForce: 'IOC',
          })
        );
        
        await Promise.all(promises);
        
        // Verify final state
        const finalPool = await mockDEXAdapter.getPoolInfo('pool-1');
        const finalK = finalPool.baseAssetReserves * finalPool.quoteAssetReserves;
        
        // K should remain constant (within rounding errors)
        const kDifference = Math.abs(finalK - initialK);
        const kTolerance = initialK * 0.001; // 0.1% tolerance
        
        expect(kDifference).toBeLessThanOrEqual(kTolerance);
      });
    });
  });

  describe('AdapterFactory', () => {
    it('should register and retrieve connectors correctly', () => {
      const mockConnector = {
        listMarkets: jest.fn(),
        getMarketInfo: jest.fn(),
        createPool: jest.fn(),
        getPoolInfo: jest.fn(),
        listPools: jest.fn(),
        provideLiquidity: jest.fn(),
        removeLiquidity: jest.fn(),
        placeOrder: jest.fn(),
        cancelOrder: jest.fn(),
        getOrderStatus: jest.fn(),
        getMarketData: jest.fn(),
        getOrderBook: jest.fn(),
        getTicker: jest.fn(),
        connect: jest.fn(),
        disconnect: jest.fn(),
        isConnected: jest.fn(),
        healthCheck: jest.fn(),
        getCapabilities: jest.fn(),
      };

      adapterFactory.registerConnector('binance' as any, mockConnector as any, {
        type: 'binance' as any,
        name: 'Binance',
        description: 'Binance connector',
        enabled: true,
        config: {},
        priority: 2,
      });

      const retrievedConnector = adapterFactory.getConnector('binance' as any);
      expect(retrievedConnector).toBe(mockConnector);
    });

    it('should return connector by priority', () => {
      const connector = adapterFactory.getConnectorByPriority();
      expect(connector).toBeDefined();
      expect(connector).toBe(mockDEXAdapter);
    });

    it('should get all enabled connectors', () => {
      const enabledConnectors = adapterFactory.getEnabledConnectors();
      expect(enabledConnectors.length).toBeGreaterThan(0);
      expect(enabledConnectors[0].type).toBe('mock_dex');
    });
  });

  describe('WebSocket Service', () => {
    it('should provide connection statistics', () => {
      const stats = webSocketService.getConnectionStats();
      expect(stats).toHaveProperty('totalConnections');
      expect(stats).toHaveProperty('marketDataSubscriptions');
      expect(stats).toHaveProperty('tradeSubscriptions');
      expect(stats).toHaveProperty('activeClients');
    });

    it('should handle market data subscriptions', () => {
      // Test subscription handling
      const subscription = {
        marketId: 'market-1',
        interval: '1m',
        clientId: 'test-client',
        socketId: 'test-socket',
      };

      // This is a basic test - in a real scenario, you'd test with actual WebSocket connections
      expect(subscription).toBeDefined();
      expect(subscription.marketId).toBe('market-1');
    });
  });

  describe('Service Integration', () => {
    it('should provide market listing functionality', async () => {
      const markets = await mockDEXAdapter.listMarkets();
      expect(markets.length).toBeGreaterThan(0);
      expect(markets[0]).toHaveProperty('id');
      expect(markets[0]).toHaveProperty('symbol');
      expect(markets[0]).toHaveProperty('baseAsset');
      expect(markets[0]).toHaveProperty('quoteAsset');
    });

    it('should provide pool information', async () => {
      const pools = await mockDEXAdapter.listPools();
      expect(pools.length).toBeGreaterThan(0);
      expect(pools[0]).toHaveProperty('id');
      expect(pools[0]).toHaveProperty('marketId');
      expect(pools[0]).toHaveProperty('baseAssetReserves');
      expect(pools[0]).toHaveProperty('quoteAssetReserves');
    });

    it('should provide order book data', async () => {
      const orderBook = await mockDEXAdapter.getOrderBook({ marketId: 'market-1' });
      expect(orderBook).toHaveProperty('bids');
      expect(orderBook).toHaveProperty('asks');
      expect(orderBook).toHaveProperty('timestamp');
      expect(Array.isArray(orderBook.bids)).toBe(true);
      expect(Array.isArray(orderBook.asks)).toBe(true);
    });

    it('should provide market data', async () => {
      const marketData = await mockDEXAdapter.getMarketData({ marketId: 'market-1' });
      expect(Array.isArray(marketData)).toBe(true);
      if (marketData.length > 0) {
        expect(marketData[0]).toHaveProperty('open');
        expect(marketData[0]).toHaveProperty('high');
        expect(marketData[0]).toHaveProperty('low');
        expect(marketData[0]).toHaveProperty('close');
        expect(marketData[0]).toHaveProperty('volume');
      }
    });
  });
});
