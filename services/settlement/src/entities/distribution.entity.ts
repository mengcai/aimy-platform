import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  Index,
} from 'typeorm';
import { PayoutRun } from './payout-run.entity';

export enum DistributionStatus {
  SCHEDULED = 'SCHEDULED',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  CANCELLED = 'CANCELLED',
}

export enum DistributionType {
  DIVIDEND = 'DIVIDEND',
  INTEREST = 'INTEREST',
  CAPITAL_GAIN = 'CAPITAL_GAIN',
  RETURN_OF_CAPITAL = 'RETURN_OF_CAPITAL',
  SPECIAL_DISTRIBUTION = 'SPECIAL_DISTRIBUTION',
}

export enum DistributionFrequency {
  DAILY = 'DAILY',
  WEEKLY = 'WEEKLY',
  MONTHLY = 'MONTHLY',
  QUARTERLY = 'QUARTERLY',
  SEMI_ANNUALLY = 'SEMI_ANNUALLY',
  ANNUALLY = 'ANNUALLY',
  ON_DEMAND = 'ON_DEMAND',
}

@Entity('distributions')
@Index(['asset_id', 'scheduled_date'])
@Index(['status', 'scheduled_date'])
export class Distribution {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  asset_id: string;

  @Column({ type: 'varchar', length: 255 })
  asset_name: string;

  @Column({
    type: 'enum',
    enum: DistributionType,
    default: DistributionType.DIVIDEND,
  })
  type: DistributionType;

  @Column({
    type: 'enum',
    enum: DistributionFrequency,
    default: DistributionFrequency.MONTHLY,
  })
  frequency: DistributionFrequency;

  @Column({ type: 'timestamp' })
  scheduled_date: Date;

  @Column({ type: 'timestamp', nullable: true })
  executed_date: Date;

  @Column({ type: 'decimal', precision: 20, scale: 6 })
  total_amount: number;

  @Column({ type: 'decimal', precision: 20, scale: 6, default: 0 })
  distributed_amount: number;

  @Column({ type: 'decimal', precision: 20, scale: 6, default: 0 })
  withheld_amount: number;

  @Column({ type: 'decimal', precision: 20, scale: 6, default: 0 })
  fee_amount: number;

  @Column({ type: 'decimal', precision: 20, scale: 6, default: 0 })
  net_amount: number;

  @Column({
    type: 'enum',
    enum: DistributionStatus,
    default: DistributionStatus.SCHEDULED,
  })
  status: DistributionStatus;

  @Column({ type: 'varchar', length: 10, default: 'USDC' })
  stablecoin_type: string;

  @Column({ type: 'decimal', precision: 10, scale: 6, default: 1 })
  exchange_rate: number;

  @Column({ type: 'jsonb', nullable: true })
  distribution_metadata: Record<string, any>;

  @Column({ type: 'jsonb', nullable: true })
  withholding_rules: Record<string, any>;

  @Column({ type: 'jsonb', nullable: true })
  fee_structure: Record<string, any>;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @Column({ type: 'uuid', nullable: true })
  created_by: string;

  @Column({ type: 'uuid', nullable: true })
  approved_by: string;

  @Column({ type: 'timestamp', nullable: true })
  approved_at: Date;

  @Column({ type: 'boolean', default: false })
  is_recurring: boolean;

  @Column({ type: 'varchar', length: 100, nullable: true })
  cron_expression: string;

  @Column({ type: 'timestamp', nullable: true })
  next_scheduled_date: Date;

  @Column({ type: 'boolean', default: false })
  requires_approval: boolean;

  @Column({ type: 'jsonb', nullable: true })
  approval_workflow: Record<string, any>;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  // Relations
  @OneToMany(() => PayoutRun, (payoutRun) => payoutRun.distribution)
  payout_runs: PayoutRun[];
}
