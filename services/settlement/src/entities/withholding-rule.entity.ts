import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

export enum WithholdingType {
  TAX = 'TAX',
  COMPLIANCE = 'COMPLIANCE',
  REGULATORY = 'REGULATORY',
  CUSTOM = 'CUSTOM',
}

export enum WithholdingTrigger {
  AMOUNT_THRESHOLD = 'AMOUNT_THRESHOLD',
  JURISDICTION = 'JURISDICTION',
  INVESTOR_TYPE = 'INVESTOR_TYPE',
  ASSET_TYPE = 'ASSET_TYPE',
  DISTRIBUTION_TYPE = 'DISTRIBUTION_TYPE',
  TIME_BASED = 'TIME_BASED',
}

export enum WithholdingCalculation {
  PERCENTAGE = 'PERCENTAGE',
  FIXED_AMOUNT = 'FIXED_AMOUNT',
  TIERED = 'TIERED',
  FORMULA = 'FORMULA',
}

@Entity('withholding_rules')
@Index(['jurisdiction', 'is_active'])
@Index(['trigger_type', 'trigger_value'])
export class WithholdingRule {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({
    type: 'enum',
    enum: WithholdingType,
    default: WithholdingType.TAX,
  })
  type: WithholdingType;

  @Column({
    type: 'enum',
    enum: WithholdingTrigger,
    default: WithholdingTrigger.JURISDICTION,
  })
  trigger_type: WithholdingTrigger;

  @Column({ type: 'varchar', length: 255 })
  trigger_value: string;

  @Column({
    type: 'enum',
    enum: WithholdingCalculation,
    default: WithholdingCalculation.PERCENTAGE,
  })
  calculation_method: WithholdingCalculation;

  @Column({ type: 'decimal', precision: 10, scale: 6, default: 0 })
  rate: number;

  @Column({ type: 'decimal', precision: 20, scale: 6, default: 0 })
  fixed_amount: number;

  @Column({ type: 'jsonb', nullable: true })
  tiered_rates: Record<string, number>[];

  @Column({ type: 'varchar', length: 500, nullable: true })
  formula: string;

  @Column({ type: 'decimal', precision: 20, scale: 6, default: 0 })
  minimum_amount: number;

  @Column({ type: 'decimal', precision: 20, scale: 6, nullable: true })
  maximum_amount: number;

  @Column({ type: 'varchar', length: 100 })
  jurisdiction: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  sub_jurisdiction: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  investor_type: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  asset_type: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  distribution_type: string;

  @Column({ type: 'jsonb', nullable: true })
  conditions: Record<string, any>;

  @Column({ type: 'jsonb', nullable: true })
  exemptions: Record<string, any>[];

  @Column({ type: 'boolean', default: true })
  is_active: boolean;

  @Column({ type: 'integer', default: 0 })
  priority: number;

  @Column({ type: 'timestamp', nullable: true })
  effective_from: Date;

  @Column({ type: 'timestamp', nullable: true })
  effective_until: Date;

  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, any>;

  @Column({ type: 'uuid', nullable: true })
  created_by: string;

  @Column({ type: 'uuid', nullable: true })
  approved_by: string;

  @Column({ type: 'timestamp', nullable: true })
  approved_at: Date;

  @Column({ type: 'boolean', default: false })
  requires_approval: boolean;

  @Column({ type: 'jsonb', nullable: true })
  approval_workflow: Record<string, any>;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @Column({ type: 'integer', default: 0 })
  usage_count: number;

  @Column({ type: 'timestamp', nullable: true })
  last_used_at: Date;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
