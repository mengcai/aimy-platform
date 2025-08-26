import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  Index,
  JoinColumn,
} from 'typeorm';
import { Market } from './market.entity';
import { Trade } from './trade.entity';

export enum PoolType {
  CONSTANT_PRODUCT = 'constant_product',
  CONSTANT_SUM = 'constant_sum',
  HYBRID = 'hybrid',
  WEIGHTED = 'weighted',
}

export enum PoolStatus {
  ACTIVE = 'active',
  PAUSED = 'paused',
  CLOSED = 'closed',
  EMERGENCY = 'emergency',
}

@Entity('liquidity_pools')
@Index(['marketId', 'status'])
@Index(['owner', 'status'])
@Index(['poolType', 'status'])
export class LiquidityPool {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  marketId: string;

  @Column({ type: 'enum', enum: PoolType, default: PoolType.CONSTANT_PRODUCT })
  poolType: PoolType;

  @Column({ type: 'enum', enum: PoolStatus, default: PoolStatus.ACTIVE })
  status: PoolStatus;

  @Column({ type: 'decimal', precision: 30, scale: 18, default: 0 })
  baseAssetReserves: number;

  @Column({ type: 'decimal', precision: 30, scale: 18, default: 0 })
  quoteAssetReserves: number;

  @Column({ type: 'decimal', precision: 30, scale: 18, default: 0 })
  totalSupply: number;

  @Column({ type: 'decimal', precision: 10, scale: 6, default: 0.003 })
  fee: number;

  @Column({ type: 'decimal', precision: 10, scale: 6, default: 0 })
  protocolFee: number;

  @Column({ type: 'decimal', precision: 10, scale: 6, default: 0 })
  ownerFee: number;

  @Column({ type: 'varchar', length: 100 })
  owner: string;

  @Column({ type: 'decimal', precision: 30, scale: 18, default: 0 })
  baseAssetWeight: number;

  @Column({ type: 'decimal', precision: 30, scale: 18, default: 0 })
  quoteAssetWeight: number;

  @Column({ type: 'decimal', precision: 30, scale: 18, default: 0 })
  baseAssetPrice: number;

  @Column({ type: 'decimal', precision: 30, scale: 18, default: 0 })
  quoteAssetPrice: number;

  @Column({ type: 'decimal', precision: 30, scale: 18, default: 0 })
  volume24h: number;

  @Column({ type: 'decimal', precision: 30, scale: 18, default: 0 })
  volume7d: number;

  @Column({ type: 'decimal', precision: 30, scale: 18, default: 0 })
  volume30d: number;

  @Column({ type: 'decimal', precision: 30, scale: 18, default: 0 })
  fees24h: number;

  @Column({ type: 'decimal', precision: 30, scale: 18, default: 0 })
  fees7d: number;

  @Column({ type: 'decimal', precision: 30, scale: 18, default: 0 })
  fees30d: number;

  @Column({ type: 'integer', default: 0 })
  trades24h: number;

  @Column({ type: 'integer', default: 0 })
  trades7d: number;

  @Column({ type: 'integer', default: 0 })
  trades30d: number;

  @Column({ type: 'decimal', precision: 30, scale: 18, default: 0 })
  tvl: number;

  @Column({ type: 'decimal', precision: 30, scale: 18, default: 0 })
  apr: number;

  @Column({ type: 'jsonb', nullable: true })
  bondingCurveParams: {
    type: string;
    parameters: any;
    formula?: string;
  };

  @Column({ type: 'jsonb', nullable: true })
  metadata: {
    name?: string;
    description?: string;
    website?: string;
    logo?: string;
    tags?: string[];
    riskLevel?: 'low' | 'medium' | 'high';
    strategy?: string;
  };

  @Column({ type: 'timestamp', nullable: true })
  lastTradeTime: Date;

  @Column({ type: 'timestamp', nullable: true })
  lastUpdateTime: Date;

  @Column({ type: 'varchar', length: 100, nullable: true })
  createdBy: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  updatedBy: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Relations
  @ManyToOne(() => Market, (market) => market.pools)
  @JoinColumn({ name: 'marketId' })
  market: Market;

  @OneToMany(() => Trade, (trade) => trade.pool)
  trades: Trade[];

  // Computed properties
  get spotPrice(): number {
    if (this.quoteAssetReserves === 0) return 0;
    return this.baseAssetReserves / this.quoteAssetReserves;
  }

  get inverseSpotPrice(): number {
    if (this.baseAssetReserves === 0) return 0;
    return this.quoteAssetReserves / this.baseAssetReserves;
  }

  get totalValueLocked(): number {
    return this.baseAssetReserves * this.baseAssetPrice + this.quoteAssetReserves * this.quoteAssetPrice;
  }

  get baseAssetPercentage(): number {
    if (this.totalValueLocked === 0) return 0;
    return (this.baseAssetReserves * this.baseAssetPrice) / this.totalValueLocked;
  }

  get quoteAssetPercentage(): number {
    if (this.totalValueLocked === 0) return 0;
    return (this.quoteAssetReserves * this.quoteAssetPrice) / this.totalValueLocked;
  }

  get isBalanced(): boolean {
    const basePercentage = this.baseAssetPercentage;
    return basePercentage >= 0.45 && basePercentage <= 0.55;
  }

  get priceImpact(): number {
    // Calculate price impact based on pool depth
    const totalReserves = this.baseAssetReserves + this.quoteAssetReserves;
    if (totalReserves === 0) return 0;
    
    // Simple price impact calculation
    return 1 / Math.sqrt(totalReserves);
  }

  get liquidityScore(): number {
    // Calculate liquidity score based on volume, TVL, and price stability
    const volumeScore = Math.min(this.volume24h / 1000000, 1); // Normalize to 1M
    const tvlScore = Math.min(this.tvl / 10000000, 1); // Normalize to 10M
    const stabilityScore = this.isBalanced ? 1 : 0.5;
    
    return (volumeScore + tvlScore + stabilityScore) / 3;
  }
}
