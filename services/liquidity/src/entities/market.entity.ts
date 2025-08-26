import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  Index,
} from 'typeorm';
import { LiquidityPool } from './liquidity-pool.entity';
import { Trade } from './trade.entity';
import { OrderBook } from './order-book.entity';
import { MarketData } from './market-data.entity';

export enum MarketStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  MAINTENANCE = 'maintenance',
  SUSPENDED = 'suspended',
}

export enum MarketType {
  SPOT = 'spot',
  FUTURES = 'futures',
  OPTIONS = 'options',
  PERPETUAL = 'perpetual',
}

@Entity('markets')
@Index(['symbol'], { unique: true })
@Index(['baseAsset', 'quoteAsset'])
@Index(['status', 'type'])
export class Market {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 20, unique: true })
  symbol: string;

  @Column({ type: 'varchar', length: 10 })
  baseAsset: string;

  @Column({ type: 'varchar', length: 10 })
  quoteAsset: string;

  @Column({ type: 'enum', enum: MarketType, default: MarketType.SPOT })
  type: MarketType;

  @Column({ type: 'enum', enum: MarketStatus, default: MarketStatus.ACTIVE })
  status: MarketStatus;

  @Column({ type: 'decimal', precision: 20, scale: 8, default: 0 })
  minOrderSize: number;

  @Column({ type: 'decimal', precision: 20, scale: 8, default: 0 })
  maxOrderSize: number;

  @Column({ type: 'decimal', precision: 20, scale: 8, default: 0.00000001 })
  tickSize: number;

  @Column({ type: 'decimal', precision: 20, scale: 8, default: 0 })
  minPrice: number;

  @Column({ type: 'decimal', precision: 20, scale: 8, default: 0 })
  maxPrice: number;

  @Column({ type: 'decimal', precision: 20, scale: 8, default: 0 })
  minQuantity: number;

  @Column({ type: 'decimal', precision: 20, scale: 8, default: 0 })
  maxQuantity: number;

  @Column({ type: 'decimal', precision: 10, scale: 6, default: 0.001 })
  makerFee: number;

  @Column({ type: 'decimal', precision: 10, scale: 6, default: 0.001 })
  takerFee: number;

  @Column({ type: 'decimal', precision: 20, scale: 8, default: 0 })
  baseAssetDecimals: number;

  @Column({ type: 'decimal', precision: 20, scale: 8, default: 0 })
  quoteAssetDecimals: number;

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @Column({ type: 'boolean', default: false })
  isMaintenance: boolean;

  @Column({ type: 'timestamp', nullable: true })
  maintenanceStartTime: Date;

  @Column({ type: 'timestamp', nullable: true })
  maintenanceEndTime: Date;

  @Column({ type: 'jsonb', nullable: true })
  metadata: {
    description?: string;
    website?: string;
    whitepaper?: string;
    social?: {
      twitter?: string;
      telegram?: string;
      discord?: string;
    };
    tags?: string[];
    riskLevel?: 'low' | 'medium' | 'high';
    regulatoryStatus?: string;
  };

  @Column({ type: 'varchar', length: 100, nullable: true })
  createdBy: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  updatedBy: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Relations
  @OneToMany(() => LiquidityPool, (pool) => pool.market)
  pools: LiquidityPool[];

  @OneToMany(() => Trade, (trade) => trade.market)
  trades: Trade[];

  @OneToMany(() => OrderBook, (orderBook) => orderBook.market)
  orderBooks: OrderBook[];

  @OneToMany(() => MarketData, (marketData) => marketData.market)
  marketData: MarketData[];

  // Computed properties
  get isTradingEnabled(): boolean {
    return this.status === MarketStatus.ACTIVE && !this.isMaintenance;
  }

  get isInMaintenance(): boolean {
    if (!this.maintenanceStartTime || !this.maintenanceEndTime) {
      return false;
    }
    const now = new Date();
    return now >= this.maintenanceStartTime && now <= this.maintenanceEndTime;
  }

  get formattedSymbol(): string {
    return `${this.baseAsset}/${this.quoteAsset}`;
  }

  get feeSpread(): number {
    return this.takerFee - this.makerFee;
  }
}
