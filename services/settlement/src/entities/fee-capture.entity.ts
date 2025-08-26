import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

export enum FeeType {
  MANAGEMENT_FEE = 'MANAGEMENT_FEE',
  PERFORMANCE_FEE = 'PERFORMANCE_FEE',
  TRANSACTION_FEE = 'TRANSACTION_FEE',
  ADMINISTRATION_FEE = 'ADMINISTRATION_FEE',
  CUSTODY_FEE = 'CUSTODY_FEE',
  COMPLIANCE_FEE = 'COMPLIANCE_FEE',
  WITHDRAWAL_FEE = 'WITHDRAWAL_FEE',
  DEPOSIT_FEE = 'DEPOSIT_FEE',
  CUSTOM_FEE = 'CUSTOM_FEE',
}

export enum FeeCalculation {
  PERCENTAGE = 'PERCENTAGE',
  FIXED_AMOUNT = 'FIXED_AMOUNT',
  TIERED = 'TIERED',
  FORMULA = 'FORMULA',
  PER_UNIT = 'PER_UNIT',
}

export enum FeeStatus {
  PENDING = 'PENDING',
  COLLECTED = 'COLLECTED',
  WAIVED = 'WAIVED',
  DEFERRED = 'DEFERRED',
  FAILED = 'FAILED',
}

@Entity('fee_captures')
@Index(['asset_id', 'fee_type', 'status'])
@Index(['investor_id', 'created_at'])
export class FeeCapture {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  asset_id: string;

  @Column({ type: 'uuid' })
  investor_id: string;

  @Column({ type: 'uuid', nullable: true })
  distribution_id: string;

  @Column({ type: 'uuid', nullable: true })
  payout_run_id: string;

  @Column({
    type: 'enum',
    enum: FeeType,
    default: FeeType.MANAGEMENT_FEE,
  })
  fee_type: FeeType;

  @Column({ type: 'varchar', length: 255 })
  fee_name: string;

  @Column({ type: 'text', nullable: true })
  fee_description: string;

  @Column({
    type: 'enum',
    enum: FeeCalculation,
    default: FeeCalculation.PERCENTAGE,
  })
  calculation_method: FeeCalculation;

  @Column({ type: 'decimal', precision: 10, scale: 6, default: 0 })
  rate: number;

  @Column({ type: 'decimal', precision: 20, scale: 6, default: 0 })
  fixed_amount: number;

  @Column({ type: 'jsonb', nullable: true })
  tiered_rates: Record<string, number>[];

  @Column({ type: 'varchar', length: 500, nullable: true })
  formula: string;

  @Column({ type: 'decimal', precision: 20, scale: 6 })
  base_amount: number;

  @Column({ type: 'decimal', precision: 20, scale: 6 })
  calculated_fee: number;

  @Column({ type: 'decimal', precision: 20, scale: 6, default: 0 })
  collected_fee: number;

  @Column({ type: 'decimal', precision: 20, scale: 6, default: 0 })
  waived_fee: number;

  @Column({ type: 'decimal', precision: 20, scale: 6, default: 0 })
  deferred_fee: number;

  @Column({ type: 'varchar', length: 10, default: 'USDC' })
  stablecoin_type: string;

  @Column({ type: 'decimal', precision: 10, scale: 6, default: 1 })
  exchange_rate: number;

  @Column({
    type: 'enum',
    enum: FeeStatus,
    default: FeeStatus.PENDING,
  })
  status: FeeStatus;

  @Column({ type: 'timestamp' })
  due_date: Date;

  @Column({ type: 'timestamp', nullable: true })
  collected_at: Date;

  @Column({ type: 'timestamp', nullable: true })
  waived_at: Date;

  @Column({ type: 'timestamp', nullable: true })
  deferred_until: Date;

  @Column({ type: 'varchar', length: 66, nullable: true })
  transaction_hash: string;

  @Column({ type: 'jsonb', nullable: true })
  collection_metadata: Record<string, any>;

  @Column({ type: 'jsonb', nullable: true })
  waiver_reason: Record<string, any>;

  @Column({ type: 'jsonb', nullable: true })
  deferral_reason: Record<string, any>;

  @Column({ type: 'jsonb', nullable: true })
  fee_metadata: Record<string, any>;

  @Column({ type: 'boolean', default: false })
  is_automatic: boolean;

  @Column({ type: 'boolean', default: false })
  requires_approval: boolean;

  @Column({ type: 'uuid', nullable: true })
  approved_by: string;

  @Column({ type: 'timestamp', nullable: true })
  approved_at: Date;

  @Column({ type: 'jsonb', nullable: true })
  approval_workflow: Record<string, any>;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @Column({ type: 'integer', default: 0 })
  retry_count: number;

  @Column({ type: 'timestamp', nullable: true })
  next_retry_at: Date;

  @Column({ type: 'jsonb', nullable: true })
  retry_config: Record<string, any>;

  @Column({ type: 'boolean', default: false })
  is_recurring: boolean;

  @Column({ type: 'varchar', length: 100, nullable: true })
  cron_expression: string;

  @Column({ type: 'timestamp', nullable: true })
  next_scheduled_date: Date;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
