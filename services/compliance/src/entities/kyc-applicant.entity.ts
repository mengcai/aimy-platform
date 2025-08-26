import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  OneToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { KYCDocument } from './kyc-document.entity';
import { ComplianceCase } from './compliance-case.entity';

export enum KYCStatus {
  DRAFT = 'DRAFT',
  SUBMITTED = 'SUBMITTED',
  UNDER_REVIEW = 'UNDER_REVIEW',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  PENDING_DOCUMENTS = 'PENDING_DOCUMENTS',
  EXPIRED = 'EXPIRED',
}

export enum InvestorType {
  INDIVIDUAL = 'INDIVIDUAL',
  CORPORATE = 'CORPORATE',
  TRUST = 'TRUST',
  PARTNERSHIP = 'PARTNERSHIP',
  FOUNDATION = 'FOUNDATION',
}

export enum AccreditationStatus {
  UNKNOWN = 'UNKNOWN',
  ACCREDITED = 'ACCREDITED',
  NON_ACCREDITED = 'NON_ACCREDITED',
}

export enum RiskLevel {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL',
}

@Entity('kyc_applicants')
@Index(['email'], { unique: true })
@Index(['walletAddress'], { unique: true })
@Index(['status'])
@Index(['investorType'])
@Index(['riskLevel'])
export class KYCApplicant {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255 })
  email: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  walletAddress: string;

  @Column({ type: 'varchar', length: 255 })
  firstName: string;

  @Column({ type: 'varchar', length: 255 })
  lastName: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  middleName: string;

  @Column({ type: 'date' })
  dateOfBirth: Date;

  @Column({ type: 'varchar', length: 100 })
  nationality: string;

  @Column({ type: 'varchar', length: 100 })
  countryOfResidence: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  city: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  state: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  postalCode: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  address: string;

  @Column({ type: 'varchar', length: 20, nullable: true })
  phoneNumber: string;

  @Column({
    type: 'enum',
    enum: InvestorType,
    default: InvestorType.INDIVIDUAL,
  })
  investorType: InvestorType;

  @Column({
    type: 'enum',
    enum: AccreditationStatus,
    default: AccreditationStatus.UNKNOWN,
  })
  accreditationStatus: AccreditationStatus;

  @Column({
    type: 'enum',
    enum: KYCStatus,
    default: KYCStatus.DRAFT,
  })
  status: KYCStatus;

  @Column({
    type: 'enum',
    enum: RiskLevel,
    default: RiskLevel.MEDIUM,
  })
  riskLevel: RiskLevel;

  @Column({ type: 'decimal', precision: 15, scale: 2, nullable: true })
  annualIncome: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, nullable: true })
  netWorth: number;

  @Column({ type: 'text', nullable: true })
  sourceOfFunds: string;

  @Column({ type: 'text', nullable: true })
  investmentExperience: string;

  @Column({ type: 'text', nullable: true })
  investmentObjectives: string;

  @Column({ type: 'boolean', default: false })
  isPEP: boolean; // Politically Exposed Person

  @Column({ type: 'text', nullable: true })
  pepDetails: string;

  @Column({ type: 'boolean', default: false })
  isSanctioned: boolean;

  @Column({ type: 'text', nullable: true })
  sanctionsDetails: string;

  @Column({ type: 'jsonb', nullable: true })
  additionalData: Record<string, any>;

  @Column({ type: 'text', nullable: true })
  rejectionReason: string;

  @Column({ type: 'uuid', nullable: true })
  reviewedBy: string;

  @Column({ type: 'timestamp', nullable: true })
  reviewedAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  expiresAt: Date;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Relations
  @OneToMany(() => KYCDocument, (document) => document.applicant)
  documents: KYCDocument[];

  @OneToOne(() => ComplianceCase, (case_) => case_.applicant)
  @JoinColumn()
  complianceCase: ComplianceCase;

  // Computed properties
  get fullName(): string {
    return `${this.firstName} ${this.lastName}`.trim();
  }

  get isExpired(): boolean {
    return this.expiresAt ? new Date() > this.expiresAt : false;
  }

  get isComplete(): boolean {
    return this.status === KYCStatus.APPROVED && !this.isExpired;
  }

  get requiresReview(): boolean {
    return this.status === KYCStatus.SUBMITTED || this.status === KYCStatus.UNDER_REVIEW;
  }
}
