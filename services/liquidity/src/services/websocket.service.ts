import { Injectable, Logger } from '@nestjs/common';
import { WebSocketGateway, WebSocketServer, SubscribeMessage, MessageBody, ConnectedSocket } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { AdapterFactory, ConnectorType } from '../adapters';
import { MarketDataService } from './market-data.service';
import { TradingService } from './trading.service';

export interface WebSocketMessage {
  type: string;
  data: any;
  timestamp: number;
  id?: string;
}

export interface MarketDataSubscription {
  marketId: string;
  interval: string;
  clientId: string;
  socketId: string;
}

export interface TradeSubscription {
  marketId: string;
  clientId: string;
  socketId: string;
}

@Injectable()
@WebSocketGateway({
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
  namespace: '/liquidity',
})
export class WebSocketService {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(WebSocketService.name);
  private marketDataSubscriptions = new Map<string, MarketDataSubscription[]>();
  private tradeSubscriptions = new Map<string, TradeSubscription[]>();
  private clientSubscriptions = new Map<string, Set<string>>();
  private heartbeatIntervals = new Map<string, NodeJS.Timeout>();

  constructor(
    private readonly adapterFactory: AdapterFactory,
    private readonly marketDataService: MarketDataService,
    private readonly tradingService: TradingService,
  ) {}

  afterInit(server: Server) {
    this.logger.log('WebSocket server initialized');
    this.startMarketDataStreaming();
    this.startTradeStreaming();
  }

  handleConnection(client: Socket) {
    const clientId = client.id;
    this.logger.log(`Client connected: ${clientId}`);
    
    // Initialize client subscriptions
    this.clientSubscriptions.set(clientId, new Set());
    
    // Send welcome message
    client.emit('connected', {
      type: 'connected',
      data: {
        clientId,
        timestamp: Date.now(),
        message: 'Connected to AIMY Liquidity Service',
        features: ['market_data', 'trades', 'order_book', 'pool_updates'],
      },
      timestamp: Date.now(),
    });

    // Start heartbeat
    this.startHeartbeat(clientId);
  }

  handleDisconnect(client: Socket) {
    const clientId = client.id;
    this.logger.log(`Client disconnected: ${clientId}`);
    
    // Clean up subscriptions
    this.cleanupClientSubscriptions(clientId);
    
    // Stop heartbeat
    this.stopHeartbeat(clientId);
  }

  @SubscribeMessage('subscribe_market_data')
  handleMarketDataSubscription(
    @MessageBody() data: { marketId: string; interval?: string },
    @ConnectedSocket() client: Socket,
  ) {
    const { marketId, interval = '1m' } = data;
    const clientId = client.id;

    this.logger.log(`Client ${clientId} subscribing to market data: ${marketId} (${interval})`);

    // Add subscription
    const subscription: MarketDataSubscription = {
      marketId,
      interval,
      clientId,
      socketId: clientId,
    };

    if (!this.marketDataSubscriptions.has(marketId)) {
      this.marketDataSubscriptions.set(marketId, []);
    }
    this.marketDataSubscriptions.get(marketId)!.push(subscription);

    // Add to client subscriptions
    const clientSubs = this.clientSubscriptions.get(clientId);
    if (clientSubs) {
      clientSubs.add(`market_data:${marketId}:${interval}`);
    }

    // Send confirmation
    client.emit('subscription_confirmed', {
      type: 'subscription_confirmed',
      data: {
        subscriptionType: 'market_data',
        marketId,
        interval,
        timestamp: Date.now(),
      },
      timestamp: Date.now(),
    });

    // Send initial data
    this.sendMarketDataToClient(clientId, marketId, interval);
  }

  @SubscribeMessage('unsubscribe_market_data')
  handleMarketDataUnsubscription(
    @MessageBody() data: { marketId: string; interval?: string },
    @ConnectedSocket() client: Socket,
  ) {
    const { marketId, interval = '1m' } = data;
    const clientId = client.id;

    this.logger.log(`Client ${clientId} unsubscribing from market data: ${marketId} (${interval})`);

    // Remove subscription
    const subscriptions = this.marketDataSubscriptions.get(marketId);
    if (subscriptions) {
      const index = subscriptions.findIndex(
        sub => sub.clientId === clientId && sub.interval === interval
      );
      if (index !== -1) {
        subscriptions.splice(index, 1);
      }

      if (subscriptions.length === 0) {
        this.marketDataSubscriptions.delete(marketId);
      }
    }

    // Remove from client subscriptions
    const clientSubs = this.clientSubscriptions.get(clientId);
    if (clientSubs) {
      clientSubs.delete(`market_data:${marketId}:${interval}`);
    }

    // Send confirmation
    client.emit('unsubscription_confirmed', {
      type: 'unsubscription_confirmed',
      data: {
        subscriptionType: 'market_data',
        marketId,
        interval,
        timestamp: Date.now(),
      },
      timestamp: Date.now(),
    });
  }

  @SubscribeMessage('subscribe_trades')
  handleTradeSubscription(
    @MessageBody() data: { marketId: string },
    @ConnectedSocket() client: Socket,
  ) {
    const { marketId } = data;
    const clientId = client.id;

    this.logger.log(`Client ${clientId} subscribing to trades: ${marketId}`);

    // Add subscription
    const subscription: TradeSubscription = {
      marketId,
      clientId,
      socketId: clientId,
    };

    if (!this.tradeSubscriptions.has(marketId)) {
      this.tradeSubscriptions.set(marketId, []);
    }
    this.tradeSubscriptions.get(marketId)!.push(subscription);

    // Add to client subscriptions
    const clientSubs = this.clientSubscriptions.get(clientId);
    if (clientSubs) {
      clientSubs.add(`trades:${marketId}`);
    }

    // Send confirmation
    client.emit('subscription_confirmed', {
      type: 'subscription_confirmed',
      data: {
        subscriptionType: 'trades',
        marketId,
        timestamp: Date.now(),
      },
      timestamp: Date.now(),
    });
  }

  @SubscribeMessage('unsubscribe_trades')
  handleTradeUnsubscription(
    @MessageBody() data: { marketId: string },
    @ConnectedSocket() client: Socket,
  ) {
    const { marketId } = data;
    const clientId = client.id;

    this.logger.log(`Client ${clientId} unsubscribing from trades: ${marketId}`);

    // Remove subscription
    const subscriptions = this.tradeSubscriptions.get(marketId);
    if (subscriptions) {
      const index = subscriptions.findIndex(sub => sub.clientId === clientId);
      if (index !== -1) {
        subscriptions.splice(index, 1);
      }

      if (subscriptions.length === 0) {
        this.tradeSubscriptions.delete(marketId);
      }
    }

    // Remove from client subscriptions
    const clientSubs = this.clientSubscriptions.get(clientId);
    if (clientSubs) {
      clientSubs.delete(`trades:${marketId}`);
    }

    // Send confirmation
    client.emit('unsubscription_confirmed', {
      type: 'unsubscription_confirmed',
      data: {
        subscriptionType: 'trades',
        marketId,
        timestamp: Date.now(),
      },
      timestamp: Date.now(),
    });
  }

  @SubscribeMessage('get_order_book')
  async handleGetOrderBook(
    @MessageBody() data: { marketId: string; depth?: number },
    @ConnectedSocket() client: Socket,
  ) {
    const { marketId, depth = 20 } = data;
    const clientId = client.id;

    try {
      const connector = this.adapterFactory.getConnectorByPriority();
      if (!connector) {
        throw new Error('No connector available');
      }

      const orderBook = await connector.getOrderBook({ marketId, depth });
      
      client.emit('order_book', {
        type: 'order_book',
        data: orderBook,
        timestamp: Date.now(),
      });
    } catch (error) {
      this.logger.error(`Error getting order book for ${marketId}:`, error);
      client.emit('error', {
        type: 'error',
        data: {
          message: 'Failed to get order book',
          error: error.message,
          marketId,
        },
        timestamp: Date.now(),
      });
    }
  }

  @SubscribeMessage('get_pool_info')
  async handleGetPoolInfo(
    @MessageBody() data: { poolId: string },
    @ConnectedSocket() client: Socket,
  ) {
    const { poolId } = data;
    const clientId = client.id;

    try {
      const connector = this.adapterFactory.getConnectorByPriority();
      if (!connector) {
        throw new Error('No connector available');
      }

      const pools = await connector.listPools();
      const pool = pools.find(p => p.id === poolId);
      
      if (!pool) {
        throw new Error('Pool not found');
      }

      client.emit('pool_info', {
        type: 'pool_info',
        data: pool,
        timestamp: Date.now(),
      });
    } catch (error) {
      this.logger.error(`Error getting pool info for ${poolId}:`, error);
      client.emit('error', {
        type: 'error',
        data: {
          message: 'Failed to get pool info',
          error: error.message,
          poolId,
        },
        timestamp: Date.now(),
      });
    }
  }

  @SubscribeMessage('ping')
  handlePing(@ConnectedSocket() client: Socket) {
    client.emit('pong', {
      type: 'pong',
      data: { timestamp: Date.now() },
      timestamp: Date.now(),
    });
  }

  // Market data streaming
  private startMarketDataStreaming(): void {
    setInterval(async () => {
      try {
        const connector = this.adapterFactory.getConnectorByPriority();
        if (!connector) return;

        // Get all markets
        const markets = await connector.listMarkets();
        
        for (const market of markets) {
          // Get latest market data
          const marketData = await connector.getTicker(market.id);
          
          // Send to subscribed clients
          this.broadcastMarketData(market.id, marketData);
        }
      } catch (error) {
        this.logger.error('Error in market data streaming:', error);
      }
    }, 5000); // Update every 5 seconds
  }

  private broadcastMarketData(marketId: string, marketData: any): void {
    const subscriptions = this.marketDataSubscriptions.get(marketId);
    if (!subscriptions) return;

    const message: WebSocketMessage = {
      type: 'market_data_update',
      data: marketData,
      timestamp: Date.now(),
    };

    subscriptions.forEach(subscription => {
      const client = this.server.sockets.sockets.get(subscription.socketId);
      if (client) {
        client.emit('market_data_update', message);
      }
    });
  }

  // Trade streaming
  private startTradeStreaming(): void {
    setInterval(async () => {
      try {
        const connector = this.adapterFactory.getConnectorByPriority();
        if (!connector) return;

        // Simulate trade events (in real implementation, this would come from the trading service)
        const markets = await connector.listMarkets();
        
        for (const market of markets) {
          // Generate mock trade
          const mockTrade = {
            id: `trade-${Date.now()}`,
            marketId: market.id,
            price: 0.05 + Math.random() * 0.01,
            quantity: Math.random() * 1000,
            side: Math.random() > 0.5 ? 'buy' : 'sell',
            timestamp: new Date(),
          };

          this.broadcastTrade(market.id, mockTrade);
        }
      } catch (error) {
        this.logger.error('Error in trade streaming:', error);
      }
    }, 10000); // Update every 10 seconds
  }

  private broadcastTrade(marketId: string, trade: any): void {
    const subscriptions = this.tradeSubscriptions.get(marketId);
    if (!subscriptions) return;

    const message: WebSocketMessage = {
      type: 'trade_update',
      data: trade,
      timestamp: Date.now(),
    };

    subscriptions.forEach(subscription => {
      const client = this.server.sockets.sockets.get(subscription.socketId);
      if (client) {
        client.emit('trade_update', message);
      }
    });
  }

  // Client management
  private startHeartbeat(clientId: string): void {
    const interval = setInterval(() => {
      const client = this.server.sockets.sockets.get(clientId);
      if (client) {
        client.emit('heartbeat', {
          type: 'heartbeat',
          data: { timestamp: Date.now() },
          timestamp: Date.now(),
        });
      }
    }, 30000); // Send heartbeat every 30 seconds

    this.heartbeatIntervals.set(clientId, interval);
  }

  private stopHeartbeat(clientId: string): void {
    const interval = this.heartbeatIntervals.get(clientId);
    if (interval) {
      clearInterval(interval);
      this.heartbeatIntervals.delete(clientId);
    }
  }

  private cleanupClientSubscriptions(clientId: string): void {
    // Remove from market data subscriptions
    for (const [marketId, subscriptions] of this.marketDataSubscriptions.entries()) {
      const filteredSubs = subscriptions.filter(sub => sub.clientId !== clientId);
      if (filteredSubs.length === 0) {
        this.marketDataSubscriptions.delete(marketId);
      } else {
        this.marketDataSubscriptions.set(marketId, filteredSubs);
      }
    }

    // Remove from trade subscriptions
    for (const [marketId, subscriptions] of this.tradeSubscriptions.entries()) {
      const filteredSubs = subscriptions.filter(sub => sub.clientId !== clientId);
      if (filteredSubs.length === 0) {
        this.tradeSubscriptions.delete(marketId);
      } else {
        this.tradeSubscriptions.set(marketId, filteredSubs);
      }
    }

    // Remove client subscriptions
    this.clientSubscriptions.delete(clientId);
  }

  // Utility methods
  private async sendMarketDataToClient(clientId: string, marketId: string, interval: string): Promise<void> {
    try {
      const connector = this.adapterFactory.getConnectorByPriority();
      if (!connector) return;

      const marketData = await connector.getMarketData({
        marketId,
        interval: interval as any,
        limit: 100,
      });

      const client = this.server.sockets.sockets.get(clientId);
      if (client) {
        client.emit('market_data_history', {
          type: 'market_data_history',
          data: {
            marketId,
            interval,
            data: marketData,
          },
          timestamp: Date.now(),
        });
      }
    } catch (error) {
      this.logger.error(`Error sending market data history to client ${clientId}:`, error);
    }
  }

  // Public methods for external services
  broadcastToAll(message: WebSocketMessage): void {
    this.server.emit(message.type, message);
  }

  broadcastToRoom(room: string, message: WebSocketMessage): void {
    this.server.to(room).emit(message.type, message);
  }

  sendToClient(clientId: string, message: WebSocketMessage): void {
    const client = this.server.sockets.sockets.get(clientId);
    if (client) {
      client.emit(message.type, message);
    }
  }

  getConnectionStats(): {
    totalConnections: number;
    marketDataSubscriptions: number;
    tradeSubscriptions: number;
    activeClients: number;
  } {
    const totalConnections = this.server.sockets.sockets.size;
    const marketDataSubscriptions = Array.from(this.marketDataSubscriptions.values())
      .reduce((total, subs) => total + subs.length, 0);
    const tradeSubscriptions = Array.from(this.tradeSubscriptions.values())
      .reduce((total, subs) => total + subs.length, 0);
    const activeClients = this.clientSubscriptions.size;

    return {
      totalConnections,
      marketDataSubscriptions,
      tradeSubscriptions,
      activeClients,
    };
  }
}
