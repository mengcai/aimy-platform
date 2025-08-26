import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  Index,
  JoinColumn,
} from 'typeorm';
import { Market } from './market.entity';
import { LiquidityPool } from './liquidity-pool.entity';

export enum TradeSide {
  BUY = 'buy',
  SELL = 'sell',
}

export enum TradeType {
  MARKET = 'market',
  LIMIT = 'limit',
  STOP = 'stop',
  STOP_LIMIT = 'stop_limit',
}

export enum TradeStatus {
  PENDING = 'pending',
  EXECUTED = 'executed',
  CANCELLED = 'cancelled',
  FAILED = 'failed',
  PARTIALLY_FILLED = 'partially_filled',
}

export enum OrderTimeInForce {
  GTC = 'GTC', // Good Till Cancelled
  IOC = 'IOC', // Immediate or Cancel
  FOK = 'FOK', // Fill or Kill
  DAY = 'DAY', // Day Order
}

@Entity('trades')
@Index(['marketId', 'createdAt'])
@Index(['poolId', 'createdAt'])
@Index(['trader', 'createdAt'])
@Index(['status', 'createdAt'])
@Index(['side', 'createdAt'])
export class Trade {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  marketId: string;

  @Column({ type: 'uuid', nullable: true })
  poolId: string;

  @Column({ type: 'enum', enum: TradeSide })
  side: TradeSide;

  @Column({ type: 'enum', enum: TradeType })
  type: TradeType;

  @Column({ type: 'enum', enum: TradeStatus, default: TradeStatus.PENDING })
  status: TradeStatus;

  @Column({ type: 'enum', enum: OrderTimeInForce, default: OrderTimeInForce.GTC })
  timeInForce: OrderTimeInForce;

  @Column({ type: 'decimal', precision: 30, scale: 18 })
  quantity: number;

  @Column({ type: 'decimal', precision: 30, scale: 18 })
  executedQuantity: number;

  @Column({ type: 'decimal', precision: 30, scale: 18, nullable: true })
  price: number;

  @Column({ type: 'decimal', precision: 30, scale: 18, nullable: true })
  executedPrice: number;

  @Column({ type: 'decimal', precision: 30, scale: 18, nullable: true })
  stopPrice: number;

  @Column({ type: 'decimal', precision: 30, scale: 18, default: 0 })
  fee: number;

  @Column({ type: 'decimal', precision: 30, scale: 18, default: 0 })
  totalCost: number;

  @Column({ type: 'decimal', precision: 30, scale: 18, default: 0 })
  quoteAmount: number;

  @Column({ type: 'decimal', precision: 10, scale: 6, default: 0 })
  slippageTolerance: number;

  @Column({ type: 'decimal', precision: 10, scale: 6, default: 0 })
  actualSlippage: number;

  @Column({ type: 'varchar', length: 100 })
  trader: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  counterparty: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  orderId: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  transactionHash: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  blockNumber: string;

  @Column({ type: 'integer', default: 0 })
  gasUsed: number;

  @Column({ type: 'decimal', precision: 20, scale: 9, default: 0 })
  gasPrice: number;

  @Column({ type: 'decimal', precision: 20, scale: 9, default: 0 })
  gasCost: number;

  @Column({ type: 'jsonb', nullable: true })
  metadata: {
    clientOrderId?: string;
    source?: string;
    tags?: string[];
    notes?: string;
    ipAddress?: string;
    userAgent?: string;
  };

  @Column({ type: 'timestamp', nullable: true })
  executedAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  cancelledAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  failedAt: Date;

  @Column({ type: 'varchar', length: 500, nullable: true })
  failureReason: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  createdBy: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  updatedBy: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Relations
  @ManyToOne(() => Market, (market) => market.trades)
  @JoinColumn({ name: 'marketId' })
  market: Market;

  @ManyToOne(() => LiquidityPool, (pool) => pool.trades)
  @JoinColumn({ name: 'poolId' })
  pool: LiquidityPool;

  // Computed properties
  get isExecuted(): boolean {
    return this.status === TradeStatus.EXECUTED;
  }

  get isPending(): boolean {
    return this.status === TradeStatus.PENDING;
  }

  get isCancelled(): boolean {
    return this.status === TradeStatus.CANCELLED;
  }

  get isFailed(): boolean {
    return this.status === TradeStatus.FAILED;
  }

  get isPartiallyFilled(): boolean {
    return this.status === TradeStatus.PARTIALLY_FILLED;
  }

  get fillPercentage(): number {
    if (this.quantity === 0) return 0;
    return (this.executedQuantity / this.quantity) * 100;
  }

  get averagePrice(): number {
    if (this.executedQuantity === 0) return 0;
    return this.totalCost / this.executedQuantity;
  }

  get totalValue(): number {
    return this.executedQuantity * this.executedPrice;
  }

  get netValue(): number {
    return this.totalValue - this.fee;
  }

  get isBuy(): boolean {
    return this.side === TradeSide.BUY;
  }

  get isSell(): boolean {
    return this.side === TradeSide.SELL;
  }

  get isMarketOrder(): boolean {
    return this.type === TradeType.MARKET;
  }

  get isLimitOrder(): boolean {
    return this.type === TradeType.LIMIT;
  }

  get isStopOrder(): boolean {
    return this.type === TradeType.STOP || this.type === TradeType.STOP_LIMIT;
  }

  get slippageExceeded(): boolean {
    return this.actualSlippage > this.slippageTolerance;
  }

  get executionTime(): number {
    if (!this.executedAt || !this.createdAt) return 0;
    return this.executedAt.getTime() - this.createdAt.getTime();
  }
}
