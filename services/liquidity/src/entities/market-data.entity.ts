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

export enum MarketDataInterval {
  ONE_MINUTE = '1m',
  FIVE_MINUTES = '5m',
  FIFTEEN_MINUTES = '15m',
  ONE_HOUR = '1h',
  FOUR_HOURS = '4h',
  ONE_DAY = '1d',
}

@Entity('market_data')
@Index(['marketId', 'interval', 'timestamp'])
@Index(['marketId', 'timestamp'])
@Index(['interval', 'timestamp'])
export class MarketData {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  marketId: string;

  @Column({ type: 'enum', enum: MarketDataInterval })
  interval: MarketDataInterval;

  @Column({ type: 'timestamp' })
  timestamp: Date;

  @Column({ type: 'decimal', precision: 30, scale: 18 })
  open: number;

  @Column({ type: 'decimal', precision: 30, scale: 18 })
  high: number;

  @Column({ type: 'decimal', precision: 30, scale: 18 })
  low: number;

  @Column({ type: 'decimal', precision: 30, scale: 18 })
  close: number;

  @Column({ type: 'decimal', precision: 30, scale: 18, default: 0 })
  volume: number;

  @Column({ type: 'decimal', precision: 30, scale: 18, default: 0 })
  quoteVolume: number;

  @Column({ type: 'integer', default: 0 })
  trades: number;

  @Column({ type: 'decimal', precision: 30, scale: 18, default: 0 })
  bid: number;

  @Column({ type: 'decimal', precision: 30, scale: 18, default: 0 })
  ask: number;

  @Column({ type: 'decimal', precision: 30, scale: 18, default: 0 })
  bidSize: number;

  @Column({ type: 'decimal', precision: 30, scale: 18, default: 0 })
  askSize: number;

  @Column({ type: 'decimal', precision: 30, scale: 18, default: 0 })
  weightedAveragePrice: number;

  @Column({ type: 'decimal', precision: 30, scale: 18, default: 0 })
  priceChange: number;

  @Column({ type: 'decimal', precision: 10, scale: 6, default: 0 })
  priceChangePercent: number;

  @Column({ type: 'decimal', precision: 30, scale: 18, default: 0 })
  volumeChange: number;

  @Column({ type: 'decimal', precision: 10, scale: 6, default: 0 })
  volumeChangePercent: number;

  @Column({ type: 'decimal', precision: 30, scale: 18, default: 0 })
  high24h: number;

  @Column({ type: 'decimal', precision: 30, scale: 18, default: 0 })
  low24h: number;

  @Column({ type: 'decimal', precision: 30, scale: 18, default: 0 })
  open24h: number;

  @Column({ type: 'decimal', precision: 30, scale: 18, default: 0 })
  volume24h: number;

  @Column({ type: 'decimal', precision: 30, scale: 18, default: 0 })
  quoteVolume24h: number;

  @Column({ type: 'integer', default: 0 })
  trades24h: number;

  @Column({ type: 'decimal', precision: 30, scale: 18, default: 0 })
  marketCap: number;

  @Column({ type: 'decimal', precision: 30, scale: 18, default: 0 })
  fullyDilutedMarketCap: number;

  @Column({ type: 'decimal', precision: 30, scale: 18, default: 0 })
  circulatingSupply: number;

  @Column({ type: 'decimal', precision: 30, scale: 18, default: 0 })
  totalSupply: number;

  @Column({ type: 'decimal', precision: 30, scale: 18, default: 0 })
  maxSupply: number;

  @Column({ type: 'jsonb', nullable: true })
  metadata: {
    source?: string;
    confidence?: number;
    quality?: 'high' | 'medium' | 'low';
    tags?: string[];
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
  @ManyToOne(() => Market, (market) => market.marketData)
  @JoinColumn({ name: 'marketId' })
  market: Market;

  // Computed properties
  get priceRange(): number {
    return this.high - this.low;
  }

  get priceRangePercent(): number {
    if (this.open === 0) return 0;
    return ((this.high - this.low) / this.open) * 100;
  }

  get bodySize(): number {
    return Math.abs(this.close - this.open);
  }

  get bodySizePercent(): number {
    if (this.open === 0) return 0;
    return (this.bodySize / this.open) * 100;
  }

  get upperShadow(): number {
    return this.high - Math.max(this.open, this.close);
  }

  get lowerShadow(): number {
    return Math.min(this.open, this.close) - this.low;
  }

  get isBullish(): boolean {
    return this.close > this.open;
  }

  get isBearish(): boolean {
    return this.close < this.open;
  }

  get isDoji(): boolean {
    return Math.abs(this.close - this.open) <= (this.high - this.low) * 0.1;
  }

  get spread(): number {
    return this.ask - this.bid;
  }

  get spreadPercent(): number {
    if (this.bid === 0) return 0;
    return (this.spread / this.bid) * 100;
  }

  get midPrice(): number {
    return (this.bid + this.ask) / 2;
  }

  get volumeWeightedAveragePrice(): number {
    if (this.volume === 0) return 0;
    return this.weightedAveragePrice || this.close;
  }

  get volatility(): number {
    return this.priceRangePercent;
  }

  get isHighVolume(): boolean {
    // Simple volume analysis - could be enhanced with statistical methods
    return this.volume > this.volume24h * 0.1; // 10% of 24h volume
  }

  get isLowVolume(): boolean {
    return this.volume < this.volume24h * 0.01; // 1% of 24h volume
  }

  get trendStrength(): 'strong' | 'medium' | 'weak' {
    const changePercent = Math.abs(this.priceChangePercent);
    if (changePercent > 5) return 'strong';
    if (changePercent > 2) return 'medium';
    return 'weak';
  }
}
