import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScheduleModule } from '@nestjs/schedule';
import { BullModule } from '@nestjs/bull';
import { WebsocketsModule } from '@nestjs/websockets';

// Entities
import { Market } from './entities/market.entity';
import { LiquidityPool } from './entities/liquidity-pool.entity';
import { Trade } from './entities/trade.entity';
import { OrderBook } from './entities/order-book.entity';
import { MarketData } from './entities/market-data.entity';

// Services
import { LiquidityService } from './services/liquidity.service';
import { MarketService } from './services/market.service';
import { PoolService } from './services/pool.service';
import { TradingService } from './services/trading.service';
import { MarketDataService } from './services/market-data.service';
import { WebSocketService } from './services/websocket.service';

// Controllers
import { LiquidityController } from './controllers/liquidity.controller';
import { MarketController } from './controllers/market.controller';
import { PoolController } from './controllers/pool.controller';
import { TradingController } from './controllers/trading.controller';

// Processors
import { MarketDataProcessor } from './processors/market-data.processor';
import { LiquidityProcessor } from './processors/liquidity.processor';

// Adapters
import { MockDEXAdapter } from './adapters/mock-dex.adapter';
import { AdapterFactory } from './adapters/adapter.factory';

// Gateways
import { MarketDataGateway } from './gateways/market-data.gateway';
import { TradingGateway } from './gateways/trading.gateway';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Market,
      LiquidityPool,
      Trade,
      OrderBook,
      MarketData,
    ]),
    ScheduleModule.forRoot(),
    BullModule.registerQueue(
      {
        name: 'market-data',
        defaultJobOptions: {
          removeOnComplete: 100,
          removeOnFail: 50,
        },
      },
      {
        name: 'liquidity',
        defaultJobOptions: {
          removeOnComplete: 100,
          removeOnFail: 50,
        },
      }
    ),
    WebsocketsModule,
  ],
  controllers: [
    LiquidityController,
    MarketController,
    PoolController,
    TradingController,
  ],
  providers: [
    // Services
    LiquidityService,
    MarketService,
    PoolService,
    TradingService,
    MarketDataService,
    WebSocketService,

    // Adapters
    MockDEXAdapter,
    AdapterFactory,

    // Processors
    MarketDataProcessor,
    LiquidityProcessor,

    // Gateways
    MarketDataGateway,
    TradingGateway,
  ],
  exports: [
    LiquidityService,
    MarketService,
    PoolService,
    TradingService,
    MarketDataService,
    WebSocketService,
    AdapterFactory,
  ],
})
export class LiquidityModule {}
