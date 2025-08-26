import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  Index,
} from 'typeorm';
import { Investor } from '@aimy/shared';

export enum WalletStatus {
  ACTIVE = 'ACTIVE',
  SUSPENDED = 'SUSPENDED',
  CLOSED = 'CLOSED',
  PENDING_VERIFICATION = 'PENDING_VERIFICATION',
}

export enum WalletType {
  PRIMARY = 'PRIMARY',
  SECONDARY = 'SECONDARY',
  TREASURY = 'TREASURY',
}

export enum StablecoinType {
  USDC = 'USDC',
  HKD_STABLECOIN = 'HKD_STABLECOIN',
}

@Entity('investor_wallets')
@Index(['investor_id', 'stablecoin_type'], { unique: true })
@Index(['wallet_address'], { unique: true })
export class InvestorWallet {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  investor_id: string;

  @Column({ type: 'varchar', length: 42 })
  wallet_address: string;

  @Column({
    type: 'enum',
    enum: StablecoinType,
    default: StablecoinType.USDC,
  })
  stablecoin_type: StablecoinType;

  @Column({
    type: 'enum',
    enum: WalletStatus,
    default: WalletStatus.PENDING_VERIFICATION,
  })
  status: WalletStatus;

  @Column({
    type: 'enum',
    enum: WalletType,
    default: WalletType.PRIMARY,
  })
  wallet_type: WalletType;

  @Column({ type: 'decimal', precision: 20, scale: 6, default: 0 })
  balance: number;

  @Column({ type: 'decimal', precision: 20, scale: 6, default: 0 })
  pending_balance: number;

  @Column({ type: 'decimal', precision: 20, scale: 6, default: 0 })
  total_received: number;

  @Column({ type: 'decimal', precision: 20, scale: 6, default: 0 })
  total_sent: number;

  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, any>;

  @Column({ type: 'varchar', length: 255, nullable: true })
  verification_hash: string;

  @Column({ type: 'timestamp', nullable: true })
  verified_at: Date;

  @Column({ type: 'timestamp', nullable: true })
  last_activity_at: Date;

  @Column({ type: 'boolean', default: false })
  is_kyc_verified: boolean;

  @Column({ type: 'varchar', length: 100, nullable: true })
  jurisdiction: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  tax_residence: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  // Virtual properties (not stored in DB)
  investor?: Investor;
}
