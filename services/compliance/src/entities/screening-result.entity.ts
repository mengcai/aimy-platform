import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { KYCApplicant } from './kyc-applicant.entity';

export enum ScreeningType {
  SANCTIONS = 'SANCTIONS',
  AML = 'AML',
  PEP = 'PEP',
  ADVERSE_MEDIA = 'ADVERSE_MEDIA',
  POLITICAL_EXPOSURE = 'POLITICAL_EXPOSURE',
  CRIMINAL_RECORD = 'CRIMINAL_RECORD',
  TERRORISM_FINANCING = 'TERRORISM_FINANCING',
}

export enum ScreeningStatus {
  PENDING = 'PENDING',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  TIMEOUT = 'TIMEOUT',
}

export enum ScreeningResult {
  CLEAR = 'CLEAR',
  HIT = 'HIT',
  FALSE_POSITIVE = 'FALSE_POSITIVE',
  INCONCLUSIVE = 'INCONCLUSIVE',
  ERROR = 'ERROR',
}

export enum RiskLevel {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL',
}

@Entity('screening_results')
@Index(['applicantId'])
@Index(['screeningType'])
@Index(['status'])
@Index(['result'])
@Index(['riskLevel'])
@Index(['screenedAt'])
export class ScreeningResult {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  applicantId: string;

  @Column({
    type: 'enum',
    enum: ScreeningType,
  })
  screeningType: ScreeningType;

  @Column({
    type: 'enum',
    enum: ScreeningStatus,
    default: ScreeningStatus.PENDING,
  })
  status: ScreeningStatus;

  @Column({
    type: 'enum',
    enum: ScreeningResult,
    nullable: true,
  })
  result: ScreeningResult;

  @Column({
    type: 'enum',
    enum: RiskLevel,
    default: RiskLevel.LOW,
  })
  riskLevel: RiskLevel;

  @Column({ type: 'varchar', length: 255, nullable: true })
  provider: string; // Screening provider name

  @Column({ type: 'varchar', length: 255, nullable: true })
  referenceId: string; // Provider's reference ID

  @Column({ type: 'jsonb', nullable: true })
  rawData: Record<string, any>; // Raw response from provider

  @Column({ type: 'jsonb', nullable: true })
  processedData: Record<string, any>; // Processed and normalized data

  @Column({ type: 'jsonb', nullable: true })
  hits: Array<{
    id: string;
    name: string;
    type: string;
    country: string;
    reason: string;
    riskScore: number;
    source: string;
    lastUpdated: string;
  }>;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  confidenceScore: number; // 0-100 confidence in the result

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  riskScore: number; // 0-100 risk score

  @Column({ type: 'text', nullable: true })
  summary: string; // Human-readable summary of findings

  @Column({ type: 'text', nullable: true })
  details: string; // Detailed explanation of findings

  @Column({ type: 'text', nullable: true })
  recommendations: string; // Recommended actions

  @Column({ type: 'boolean', default: false })
  requiresManualReview: boolean;

  @Column({ type: 'boolean', default: false })
  isFalsePositive: boolean;

  @Column({ type: 'text', nullable: true })
  falsePositiveReason: string;

  @Column({ type: 'uuid', nullable: true })
  reviewedBy: string;

  @Column({ type: 'timestamp', nullable: true })
  reviewedAt: Date;

  @Column({ type: 'text', nullable: true })
  reviewNotes: string;

  @Column({ type: 'timestamp', nullable: true })
  screenedAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  expiresAt: Date;

  @Column({ type: 'integer', default: 0 })
  retryCount: number;

  @Column({ type: 'timestamp', nullable: true })
  nextRetryAt: Date;

  @Column({ type: 'text', nullable: true })
  errorMessage: string;

  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, any>; // Additional metadata

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Relations
  @ManyToOne(() => KYCApplicant, (applicant) => applicant.id)
  @JoinColumn({ name: 'applicantId' })
  applicant: KYCApplicant;

  // Computed properties
  get isExpired(): boolean {
    return this.expiresAt ? new Date() > this.expiresAt : false;
  }

  get isExpiringSoon(): boolean {
    if (!this.expiresAt) return false;
    const sevenDaysFromNow = new Date();
    sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7);
    return this.expiresAt <= sevenDaysFromNow;
  }

  get hasHits(): boolean {
    return this.hits && this.hits.length > 0;
  }

  get hitCount(): number {
    return this.hits ? this.hits.length : 0;
  }

  get isHighRisk(): boolean {
    return this.riskLevel === RiskLevel.HIGH || this.riskLevel === RiskLevel.CRITICAL;
  }

  get isClear(): boolean {
    return this.result === ScreeningResult.CLEAR;
  }

  get isHit(): boolean {
    return this.result === ScreeningResult.HIT;
  }

  get canRetry(): boolean {
    return this.status === ScreeningStatus.FAILED && this.retryCount < 3;
  }

  get shouldExpire(): boolean {
    // Different screening types have different expiration periods
    const now = new Date();
    const expirationPeriods = {
      [ScreeningType.SANCTIONS]: 30, // 30 days
      [ScreeningType.AML]: 90, // 90 days
      [ScreeningType.PEP]: 180, // 180 days
      [ScreeningType.ADVERSE_MEDIA]: 7, // 7 days
      [ScreeningType.POLITICAL_EXPOSURE]: 180, // 180 days
      [ScreeningType.CRIMINAL_RECORD]: 365, // 1 year
      [ScreeningType.TERRORISM_FINANCING]: 30, // 30 days
    };

    const daysSinceScreening = Math.floor((now.getTime() - this.screenedAt.getTime()) / (1000 * 60 * 60 * 24));
    return daysSinceScreening >= (expirationPeriods[this.screeningType] || 30);
  }
}
