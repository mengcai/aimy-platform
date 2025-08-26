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
import { PayoutRun } from './payout-run.entity';
import { InvestorWallet } from './investor-wallet.entity';

export enum ReceiptStatus {
  PENDING = 'PENDING',
  PROCESSING = 'PROCESSING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  CANCELLED = 'CANCELLED',
}

export enum ReceiptType {
  DIVIDEND = 'DIVIDEND',
  INTEREST = 'INTEREST',
  CAPITAL_GAIN = 'CAPITAL_GAIN',
  RETURN_OF_CAPITAL = 'RETURN_OF_CAPITAL',
  SPECIAL_DISTRIBUTION = 'SPECIAL_DISTRIBUTION',
}

@Entity('payout_receipts')
@Index(['payout_run_id', 'investor_wallet_id'])
@Index(['status', 'created_at'])
@Index(['transaction_hash'], { unique: true, sparse: true })
export class PayoutReceipt {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  payout_run_id: string;

  @Column({ type: 'uuid' })
  investor_wallet_id: string;

  @Column({ type: 'uuid' })
  investor_id: string;

  @Column({ type: 'uuid' })
  asset_id: string;

  @Column({ type: 'varchar', length: 255 })
  asset_name: string;

  @Column({
    type: 'enum',
    enum: ReceiptType,
    default: ReceiptType.DIVIDEND,
  })
  type: ReceiptType;

  @Column({
    type: 'enum',
    enum: ReceiptStatus,
    default: ReceiptStatus.PENDING,
  })
  status: ReceiptStatus;

  @Column({ type: 'decimal', precision: 20, scale: 6 })
  gross_amount: number;

  @Column({ type: 'decimal', precision: 20, scale: 6, default: 0 })
  withholding_amount: number;

  @Column({ type: 'decimal', precision: 20, scale: 6, default: 0 })
  fee_amount: number;

  @Column({ type: 'decimal', precision: 20, scale: 6 })
  net_amount: number;

  @Column({ type: 'decimal', precision: 20, scale: 6 })
  token_balance_at_snapshot: number;

  @Column({ type: 'decimal', precision: 10, scale: 6 })
  pro_rata_share: number;

  @Column({ type: 'varchar', length: 10, default: 'USDC' })
  stablecoin_type: string;

  @Column({ type: 'decimal', precision: 10, scale: 6, default: 1 })
  exchange_rate: number;

  @Column({ type: 'varchar', length: 66, nullable: true })
  transaction_hash: string;

  @Column({ type: 'varchar', length: 42, nullable: true })
  from_address: string;

  @Column({ type: 'varchar', length: 42, nullable: true })
  to_address: string;

  @Column({ type: 'integer', nullable: true })
  block_number: number;

  @Column({ type: 'timestamp', nullable: true })
  transaction_timestamp: Date;

  @Column({ type: 'decimal', precision: 20, scale: 6, nullable: true })
  gas_used: number;

  @Column({ type: 'decimal', precision: 20, scale: 6, nullable: true })
  gas_price: number;

  @Column({ type: 'jsonb', nullable: true })
  transaction_metadata: Record<string, any>;

  @Column({ type: 'jsonb', nullable: true })
  withholding_details: Record<string, any>;

  @Column({ type: 'jsonb', nullable: true })
  fee_breakdown: Record<string, any>;

  @Column({ type: 'jsonb', nullable: true })
  compliance_checks: Record<string, any>;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @Column({ type: 'timestamp', nullable: true })
  processed_at: Date;

  @Column({ type: 'timestamp', nullable: true })
  failed_at: Date;

  @Column({ type: 'text', nullable: true })
  failure_reason: string;

  @Column({ type: 'integer', default: 0 })
  retry_count: number;

  @Column({ type: 'timestamp', nullable: true })
  next_retry_at: Date;

  @Column({ type: 'jsonb', nullable: true })
  retry_config: Record<string, any>;

  @Column({ type: 'boolean', default: false })
  is_dry_run: boolean;

  @Column({ type: 'jsonb', nullable: true })
  dry_run_results: Record<string, any>;

  @Column({ type: 'varchar', length: 255, nullable: true })
  receipt_number: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  pdf_url: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  email_sent_to: string;

  @Column({ type: 'timestamp', nullable: true })
  email_sent_at: Date;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  // Relations
  @ManyToOne(() => PayoutRun, (payoutRun) => payoutRun.receipts)
  @JoinColumn({ name: 'payout_run_id' })
  payout_run: PayoutRun;

  @ManyToOne(() => InvestorWallet)
  @JoinColumn({ name: 'investor_wallet_id' })
  investor_wallet: InvestorWallet;
}
