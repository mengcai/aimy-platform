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

export enum OrderBookSide {
  BID = 'bid',
  ASK = 'ask',
}

@Entity('order_books')
@Index(['marketId', 'side', 'price'])
@Index(['marketId', 'timestamp'])
@Index(['side', 'price'])
export class OrderBook {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  marketId: string;

  @Column({ type: 'enum', enum: OrderBookSide })
  side: OrderBookSide;

  @Column({ type: 'decimal', precision: 30, scale: 18 })
  price: number;

  @Column({ type: 'decimal', precision: 30, scale: 18 })
  quantity: number;

  @Column({ type: 'decimal', precision: 30, scale: 18, default: 0 })
  totalQuantity: number;

  @Column({ type: 'integer', default: 1 })
  orderCount: number;

  @Column({ type: 'bigint' })
  sequenceNumber: number;

  @Column({ type: 'timestamp' })
  timestamp: Date;

  @Column({ type: 'varchar', length: 100, nullable: true })
  createdBy: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  updatedBy: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Relations
  @ManyToOne(() => Market, (market) => market.orderBooks)
  @JoinColumn({ name: 'marketId' })
  market: Market;

  // Computed properties
  get isBid(): boolean {
    return this.side === OrderBookSide.BID;
  }

  get isAsk(): boolean {
    return this.side === OrderBookSide.ASK;
  }

  get totalValue(): number {
    return this.price * this.totalQuantity;
  }

  get averagePrice(): number {
    return this.price;
  }

  get depth(): number {
    return this.totalQuantity;
  }

  get orderDensity(): number {
    return this.totalQuantity / this.orderCount;
  }
}
