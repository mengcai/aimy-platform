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
import { Distribution } from './distribution.entity';
import { PayoutReceipt } from './payout-receipt.entity';

export enum PayoutRunStatus {
  PENDING = 'PENDING',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  CANCELLED = 'CANCELLED',
  PARTIALLY_COMPLETED = 'PARTIALLY_COMPLETED',
}

export enum PayoutRunType {
  SCHEDULED = 'SCHEDULED',
  MANUAL = 'MANUAL',
  EMERGENCY = 'EMERGENCY',
  TEST = 'TEST',
}

@Entity('payout_runs')
@Index(['distribution_id', 'status'])
@Index(['status', 'created_at'])
export class PayoutRun {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  distribution_id: string;

  @Column({
    type: 'enum',
    enum: PayoutRunType,
    default: PayoutRunType.SCHEDULED,
  })
  type: PayoutRunType;

  @Column({
    type: 'enum',
    enum: PayoutRunStatus,
    default: PayoutRunStatus.PENDING,
  })
  status: PayoutRunStatus;

  @Column({ type: 'timestamp' })
  scheduled_execution_time: Date;

  @Column({ type: 'timestamp', nullable: true })
  started_at: Date;

  @Column({ type: 'timestamp', nullable: true })
  completed_at: Date;

  @Column({ type: 'integer', default: 0 })
  total_recipients: number;

  @Column({ type: 'integer', default: 0 })
  successful_payouts: number;

  @Column({ type: 'integer', default: 0 })
  failed_payouts: number;

  @Column({ type: 'integer', default: 0 })
  pending_payouts: number;

  @Column({ type: 'decimal', precision: 20, scale: 6, default: 0 })
  total_amount: number;

  @Column({ type: 'decimal', precision: 20, scale: 6, default: 0 })
  successful_amount: number;

  @Column({ type: 'decimal', precision: 20, scale: 6, default: 0 })
  failed_amount: number;

  @Column({ type: 'decimal', precision: 20, scale: 6, default: 0 })
  total_fees: number;

  @Column({ type: 'decimal', precision: 20, scale: 6, default: 0 })
  total_withholding: number;

  @Column({ type: 'jsonb', nullable: true })
  execution_metadata: Record<string, any>;

  @Column({ type: 'jsonb', nullable: true })
  error_logs: Record<string, any>[];

  @Column({ type: 'jsonb', nullable: true })
  performance_metrics: Record<string, any>;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @Column({ type: 'uuid', nullable: true })
  initiated_by: string;

  @Column({ type: 'uuid', nullable: true })
  approved_by: string;

  @Column({ type: 'timestamp', nullable: true })
  approved_at: Date;

  @Column({ type: 'boolean', default: false })
  is_dry_run: boolean;

  @Column({ type: 'jsonb', nullable: true })
  dry_run_results: Record<string, any>;

  @Column({ type: 'varchar', length: 100, nullable: true })
  batch_id: string;

  @Column({ type: 'integer', default: 0 })
  retry_count: number;

  @Column({ type: 'timestamp', nullable: true })
  next_retry_at: Date;

  @Column({ type: 'jsonb', nullable: true })
  retry_config: Record<string, any>;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  // Relations
  @ManyToOne(() => Distribution, (distribution) => distribution.payout_runs)
  @JoinColumn({ name: 'distribution_id' })
  distribution: Distribution;

  @OneToMany(() => PayoutReceipt, (receipt) => receipt.payout_run)
  receipts: PayoutReceipt[];
}
