import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

export enum RuleType {
  JURISDICTION = 'JURISDICTION',
  INVESTOR_TYPE = 'INVESTOR_TYPE',
  LOCKUP = 'LOCKUP',
  TRANSFER_WINDOW = 'TRANSFER_WINDOW',
  AMOUNT_LIMIT = 'AMOUNT_LIMIT',
  FREQUENCY_LIMIT = 'FREQUENCY_LIMIT',
  GEOGRAPHIC_RESTRICTION = 'GEOGRAPHIC_RESTRICTION',
  TIME_BASED = 'TIME_BASED',
  CUSTOM = 'CUSTOM',
}

export enum RuleStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  DRAFT = 'DRAFT',
  ARCHIVED = 'ARCHIVED',
}

export enum RulePriority {
  LOW = 1,
  NORMAL = 5,
  HIGH = 10,
  CRITICAL = 20,
}

export enum RuleOperator {
  EQUALS = 'EQUALS',
  NOT_EQUALS = 'NOT_EQUALS',
  GREATER_THAN = 'GREATER_THAN',
  LESS_THAN = 'LESS_THAN',
  GREATER_THAN_OR_EQUAL = 'GREATER_THAN_OR_EQUAL',
  LESS_THAN_OR_EQUAL = 'LESS_THAN_OR_EQUAL',
  CONTAINS = 'CONTAINS',
  NOT_CONTAINS = 'NOT_CONTAINS',
  IN = 'IN',
  NOT_IN = 'NOT_IN',
  BETWEEN = 'BETWEEN',
  NOT_BETWEEN = 'NOT_BETWEEN',
  REGEX = 'REGEX',
  EXISTS = 'EXISTS',
  NOT_EXISTS = 'NOT_EXISTS',
}

export enum RuleAction {
  ALLOW = 'ALLOW',
  DENY = 'DENY',
  REQUIRE_APPROVAL = 'REQUIRE_APPROVAL',
  FLAG_FOR_REVIEW = 'FLAG_FOR_REVIEW',
  APPLY_RESTRICTIONS = 'APPLY_RESTRICTIONS',
  LOG_ONLY = 'LOG_ONLY',
}

@Entity('compliance_rules')
@Index(['ruleType'])
@Index(['status'])
@Index(['priority'])
@Index(['isActive'])
@Index(['createdAt'])
export class ComplianceRule {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({
    type: 'enum',
    enum: RuleType,
  })
  ruleType: RuleType;

  @Column({
    type: 'enum',
    enum: RuleStatus,
    default: RuleStatus.DRAFT,
  })
  status: RuleStatus;

  @Column({
    type: 'enum',
    enum: RulePriority,
    default: RulePriority.NORMAL,
  })
  priority: RulePriority;

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @Column({ type: 'jsonb' })
  conditions: {
    field: string;
    operator: RuleOperator;
    value: any;
    valueType: string;
    logicalOperator?: 'AND' | 'OR';
  }[];

  @Column({
    type: 'enum',
    enum: RuleAction,
  })
  action: RuleAction;

  @Column({ type: 'jsonb', nullable: true })
  actionParameters: Record<string, any>; // Additional parameters for the action

  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, any>; // Additional rule metadata

  @Column({ type: 'text', nullable: true })
  errorMessage: string; // Custom error message when rule is violated

  @Column({ type: 'text', nullable: true })
  helpText: string; // Help text for compliance officers

  @Column({ type: 'varchar', length: 255, nullable: true })
  category: string; // Rule category for organization

  @Column({ type: 'varchar', length: 255, nullable: true })
  tags: string[]; // Tags for rule organization

  @Column({ type: 'boolean', default: false })
  isSystemRule: boolean; // Whether this is a system-generated rule

  @Column({ type: 'uuid', nullable: true })
  createdBy: string;

  @Column({ type: 'uuid', nullable: true })
  updatedBy: string;

  @Column({ type: 'timestamp', nullable: true })
  effectiveFrom: Date; // When the rule becomes effective

  @Column({ type: 'timestamp', nullable: true })
  effectiveUntil: Date; // When the rule expires

  @Column({ type: 'integer', default: 0 })
  executionCount: number; // How many times the rule has been executed

  @Column({ type: 'integer', default: 0 })
  violationCount: number; // How many times the rule has been violated

  @Column({ type: 'timestamp', nullable: true })
  lastExecutedAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  lastViolatedAt: Date;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  successRate: number; // Percentage of successful rule executions

  @Column({ type: 'text', nullable: true })
  notes: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Computed properties
  get isEffective(): boolean {
    const now = new Date();
    const isAfterStart = !this.effectiveFrom || now >= this.effectiveFrom;
    const isBeforeEnd = !this.effectiveUntil || now <= this.effectiveUntil;
    return this.isActive && this.status === RuleStatus.ACTIVE && isAfterStart && isBeforeEnd;
  }

  get isExpired(): boolean {
    return this.effectiveUntil ? new Date() > this.effectiveUntil : false;
  }

  get isExpiringSoon(): boolean {
    if (!this.effectiveUntil) return false;
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
    return this.effectiveUntil <= thirtyDaysFromNow;
  }

  get canBeEdited(): boolean {
    return !this.isSystemRule && this.status !== RuleStatus.ARCHIVED;
  }

  get canBeActivated(): boolean {
    return this.status === RuleStatus.DRAFT || this.status === RuleStatus.INACTIVE;
  }

  get canBeDeactivated(): boolean {
    return this.status === RuleStatus.ACTIVE;
  }

  get executionRate(): number {
    if (this.executionCount === 0) return 0;
    return Math.round((this.violationCount / this.executionCount) * 100);
  }

  get isHighPriority(): boolean {
    return this.priority >= RulePriority.HIGH;
  }

  get isCritical(): boolean {
    return this.priority === RulePriority.CRITICAL;
  }

  get requiresApproval(): boolean {
    return this.action === RuleAction.REQUIRE_APPROVAL;
  }

  get isDenialRule(): boolean {
    return this.action === RuleAction.DENY;
  }

  get isAllowanceRule(): boolean {
    return this.action === RuleAction.ALLOW;
  }
}
