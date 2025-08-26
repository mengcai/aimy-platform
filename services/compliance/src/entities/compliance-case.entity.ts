import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToOne,
  JoinColumn,
  OneToMany,
  Index,
} from 'typeorm';
import { KYCApplicant } from './kyc-applicant.entity';
import { AuditLog } from './audit-log.entity';

export enum CaseStatus {
  OPEN = 'OPEN',
  UNDER_REVIEW = 'UNDER_REVIEW',
  PENDING_DOCUMENTS = 'PENDING_DOCUMENTS',
  PENDING_APPROVAL = 'PENDING_APPROVAL',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  ESCALATED = 'ESCALATED',
  CLOSED = 'CLOSED',
  EXPIRED = 'EXPIRED',
}

export enum CasePriority {
  LOW = 'LOW',
  NORMAL = 'NORMAL',
  HIGH = 'HIGH',
  URGENT = 'URGENT',
  CRITICAL = 'CRITICAL',
}

export enum CaseType {
  KYC_VERIFICATION = 'KYC_VERIFICATION',
  DOCUMENT_VERIFICATION = 'DOCUMENT_VERIFICATION',
  SANCTIONS_SCREENING = 'SANCTIONS_SCREENING',
  AML_INVESTIGATION = 'AML_INVESTIGATION',
  PEP_REVIEW = 'PEP_REVIEW',
  TRANSFER_APPROVAL = 'TRANSFER_APPROVAL',
  COMPLIANCE_VIOLATION = 'COMPLIANCE_VIOLATION',
  CUSTOM = 'CUSTOM',
}

export enum DecisionType {
  APPROVE = 'APPROVE',
  REJECT = 'REJECT',
  APPROVE_WITH_CONDITIONS = 'APPROVE_WITH_CONDITIONS',
  REQUIRE_ADDITIONAL_DOCUMENTS = 'REQUIRE_ADDITIONAL_DOCUMENTS',
  ESCALATE = 'ESCALATE',
  REFER_TO_LEGAL = 'REFER_TO_LEGAL',
  NO_DECISION = 'NO_DECISION',
}

@Entity('compliance_cases')
@Index(['applicantId'])
@Index(['caseType'])
@Index(['status'])
@Index(['priority'])
@Index(['assignedTo'])
@Index(['createdAt'])
@Index(['dueDate'])
export class ComplianceCase {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', unique: true })
  applicantId: string;

  @Column({ type: 'varchar', length: 255 })
  caseNumber: string; // Auto-generated case number

  @Column({
    type: 'enum',
    enum: CaseType,
  })
  caseType: CaseType;

  @Column({
    type: 'enum',
    enum: CaseStatus,
    default: CaseStatus.OPEN,
  })
  status: CaseStatus;

  @Column({
    type: 'enum',
    enum: CasePriority,
    default: CasePriority.NORMAL,
  })
  priority: CasePriority;

  @Column({ type: 'varchar', length: 255 })
  title: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'uuid', nullable: true })
  assignedTo: string; // Compliance officer assigned to the case

  @Column({ type: 'uuid', nullable: true })
  createdBy: string;

  @Column({ type: 'uuid', nullable: true })
  updatedBy: string;

  @Column({ type: 'timestamp', nullable: true })
  dueDate: Date; // When the case should be resolved

  @Column({ type: 'timestamp', nullable: true })
  startedAt: Date; // When work on the case began

  @Column({ type: 'timestamp', nullable: true })
  completedAt: Date; // When the case was completed

  @Column({ type: 'timestamp', nullable: true })
  escalatedAt: Date; // When the case was escalated

  @Column({ type: 'uuid', nullable: true })
  escalatedTo: string; // Who the case was escalated to

  @Column({ type: 'text', nullable: true })
  escalationReason: string;

  @Column({
    type: 'enum',
    enum: DecisionType,
    nullable: true,
  })
  decision: DecisionType;

  @Column({ type: 'text', nullable: true })
  decisionReason: string;

  @Column({ type: 'jsonb', nullable: true })
  decisionMetadata: Record<string, any>; // Additional decision data

  @Column({ type: 'text', nullable: true })
  decisionNotes: string;

  @Column({ type: 'uuid', nullable: true })
  decidedBy: string;

  @Column({ type: 'timestamp', nullable: true })
  decidedAt: Date;

  @Column({ type: 'jsonb', nullable: true })
  conditions: string[]; // Conditions if approved with conditions

  @Column({ type: 'text', nullable: true })
  rejectionReason: string;

  @Column({ type: 'text', nullable: true })
  requiredDocuments: string[]; // List of required documents

  @Column({ type: 'text', nullable: true })
  nextSteps: string; // What needs to happen next

  @Column({ type: 'jsonb', nullable: true })
  tags: string[]; // Tags for case organization

  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, any>; // Additional case metadata

  @Column({ type: 'text', nullable: true })
  notes: string;

  @Column({ type: 'integer', default: 0 })
  reviewCount: number; // How many times the case has been reviewed

  @Column({ type: 'timestamp', nullable: true })
  lastReviewedAt: Date;

  @Column({ type: 'uuid', nullable: true })
  lastReviewedBy: string;

  @Column({ type: 'boolean', default: false })
  isUrgent: boolean; // Whether this case requires immediate attention

  @Column({ type: 'boolean', default: false })
  isConfidential: boolean; // Whether this case contains sensitive information

  @Column({ type: 'varchar', length: 255, nullable: true })
  externalReference: string; // External system reference

  @Column({ type: 'jsonb', nullable: true })
  externalData: Record<string, any>; // Data from external systems

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Relations
  @OneToOne(() => KYCApplicant, (applicant) => applicant.complianceCase)
  @JoinColumn({ name: 'applicantId' })
  applicant: KYCApplicant;

  @OneToMany(() => AuditLog, (auditLog) => auditLog.caseId)
  auditLogs: AuditLog[];

  // Computed properties
  get isOverdue(): boolean {
    return this.dueDate ? new Date() > this.dueDate : false;
  }

  get isOverdueSoon(): boolean {
    if (!this.dueDate) return false;
    const threeDaysFromNow = new Date();
    threeDaysFromNow.setDate(threeDaysFromNow.getDate() + 3);
    return this.dueDate <= threeDaysFromNow;
  }

  get isAssigned(): boolean {
    return !!this.assignedTo;
  }

  get isUnassigned(): boolean {
    return !this.assignedTo;
  }

  get isCompleted(): boolean {
    return [
      CaseStatus.APPROVED,
      CaseStatus.REJECTED,
      CaseStatus.CLOSED,
      CaseStatus.EXPIRED,
    ].includes(this.status);
  }

  get isPending(): boolean {
    return [
      CaseStatus.OPEN,
      CaseStatus.UNDER_REVIEW,
      CaseStatus.PENDING_DOCUMENTS,
      CaseStatus.PENDING_APPROVAL,
    ].includes(this.status);
  }

  get isEscalated(): boolean {
    return this.status === CaseStatus.ESCALATED;
  }

  get requiresDecision(): boolean {
    return this.status === CaseStatus.PENDING_APPROVAL;
  }

  get canBeAssigned(): boolean {
    return this.status === CaseStatus.OPEN && !this.assignedTo;
  }

  get canBeStarted(): boolean {
    return this.status === CaseStatus.OPEN && this.assignedTo;
  }

  get canBeCompleted(): boolean {
    return this.status === CaseStatus.UNDER_REVIEW;
  }

  get canBeEscalated(): boolean {
    return this.status === CaseStatus.UNDER_REVIEW && this.priority === CasePriority.CRITICAL;
  }

  get ageInDays(): number {
    const now = new Date();
    const created = new Date(this.createdAt);
    return Math.floor((now.getTime() - created.getTime()) / (1000 * 60 * 60 * 24));
  }

  get timeToDue(): number {
    if (!this.dueDate) return 0;
    const now = new Date();
    const due = new Date(this.dueDate);
    return Math.floor((due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  }

  get isHighPriority(): boolean {
    return this.priority === CasePriority.HIGH || this.priority === CasePriority.URGENT || this.priority === CasePriority.CRITICAL;
  }

  get isCritical(): boolean {
    return this.priority === CasePriority.CRITICAL;
  }

  get hasDecision(): boolean {
    return !!this.decision && this.decision !== DecisionType.NO_DECISION;
  }

  get isApproved(): boolean {
    return this.decision === DecisionType.APPROVE || this.decision === DecisionType.APPROVE_WITH_CONDITIONS;
  }

  get isRejected(): boolean {
    return this.decision === DecisionType.REJECT;
  }

  get requiresConditions(): boolean {
    return this.decision === DecisionType.APPROVE_WITH_CONDITIONS;
  }
}
