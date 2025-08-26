import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  Index,
} from 'typeorm';

export enum AuditAction {
  // KYC Actions
  APPLICANT_CREATED = 'APPLICANT_CREATED',
  APPLICANT_UPDATED = 'APPLICANT_UPDATED',
  APPLICANT_SUBMITTED = 'APPLICANT_SUBMITTED',
  APPLICANT_APPROVED = 'APPLICANT_APPROVED',
  APPLICANT_REJECTED = 'APPLICANT_REJECTED',
  APPLICANT_EXPIRED = 'APPLICANT_EXPIRED',

  // Document Actions
  DOCUMENT_UPLOADED = 'DOCUMENT_UPLOADED',
  DOCUMENT_VERIFIED = 'DOCUMENT_VERIFIED',
  DOCUMENT_REJECTED = 'DOCUMENT_REJECTED',
  DOCUMENT_DELETED = 'DOCUMENT_DELETED',

  // Screening Actions
  SCREENING_INITIATED = 'SCREENING_INITIATED',
  SCREENING_COMPLETED = 'SCREENING_COMPLETED',
  SCREENING_FAILED = 'SCREENING_FAILED',
  SCREENING_RESULT_UPDATED = 'SCREENING_RESULT_UPDATED',

  // Case Actions
  CASE_CREATED = 'CASE_CREATED',
  CASE_ASSIGNED = 'CASE_ASSIGNED',
  CASE_STARTED = 'CASE_STARTED',
  CASE_UPDATED = 'CASE_UPDATED',
  CASE_ESCALATED = 'CASE_ESCALATED',
  CASE_COMPLETED = 'CASE_COMPLETED',
  CASE_CLOSED = 'CASE_CLOSED',

  // Decision Actions
  DECISION_MADE = 'DECISION_MADE',
  DECISION_UPDATED = 'DECISION_UPDATED',
  DECISION_OVERRIDDEN = 'DECISION_OVERRIDDEN',

  // Rule Actions
  RULE_CREATED = 'RULE_CREATED',
  RULE_UPDATED = 'RULE_UPDATED',
  RULE_ACTIVATED = 'RULE_ACTIVATED',
  RULE_DEACTIVATED = 'RULE_DEACTIVATED',
  RULE_DELETED = 'RULE_DELETED',

  // Transfer Actions
  TRANSFER_REQUESTED = 'TRANSFER_REQUESTED',
  TRANSFER_APPROVED = 'TRANSFER_APPROVED',
  TRANSFER_REJECTED = 'TRANSFER_REJECTED',
  TRANSFER_BLOCKED = 'TRANSFER_BLOCKED',

  // System Actions
  LOGIN = 'LOGIN',
  LOGOUT = 'LOGOUT',
  PASSWORD_CHANGED = 'PASSWORD_CHANGED',
  SETTINGS_UPDATED = 'SETTINGS_UPDATED',
  EXPORT_REQUESTED = 'EXPORT_REQUESTED',
  BULK_ACTION = 'BULK_ACTION',

  // Compliance Actions
  COMPLIANCE_CHECK = 'COMPLIANCE_CHECK',
  COMPLIANCE_VIOLATION = 'COMPLIANCE_VIOLATION',
  COMPLIANCE_WARNING = 'COMPLIANCE_WARNING',
  COMPLIANCE_OVERRIDE = 'COMPLIANCE_OVERRIDE',
}

export enum AuditLevel {
  INFO = 'INFO',
  WARNING = 'WARNING',
  ERROR = 'ERROR',
  CRITICAL = 'CRITICAL',
}

export enum AuditSource {
  WEB_UI = 'WEB_UI',
  API = 'API',
  WEBHOOK = 'WEBHOOK',
  SCHEDULED_TASK = 'SCHEDULED_TASK',
  BACKGROUND_JOB = 'BACKGROUND_JOB',
  SYSTEM = 'SYSTEM',
  EXTERNAL = 'EXTERNAL',
}

@Entity('audit_logs')
@Index(['entityType', 'entityId'])
@Index(['action'])
@Index(['level'])
@Index(['source'])
@Index(['userId'])
@Index(['caseId'])
@Index(['createdAt'])
export class AuditLog {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    type: 'enum',
    enum: AuditAction,
  })
  action: AuditAction;

  @Column({
    type: 'enum',
    enum: AuditLevel,
    default: AuditLevel.INFO,
  })
  level: AuditLevel;

  @Column({
    type: 'enum',
    enum: AuditSource,
    default: AuditSource.SYSTEM,
  })
  source: AuditSource;

  @Column({ type: 'varchar', length: 255 })
  entityType: string; // Type of entity being audited (e.g., 'KYCApplicant', 'ComplianceCase')

  @Column({ type: 'uuid' })
  entityId: string; // ID of the entity being audited

  @Column({ type: 'uuid', nullable: true })
  caseId: string; // Related compliance case ID

  @Column({ type: 'uuid', nullable: true })
  userId: string; // User who performed the action

  @Column({ type: 'varchar', length: 255, nullable: true })
  userName: string; // User's name for display purposes

  @Column({ type: 'varchar', length: 255, nullable: true })
  userEmail: string; // User's email for display purposes

  @Column({ type: 'varchar', length: 255, nullable: true })
  userRole: string; // User's role when performing the action

  @Column({ type: 'varchar', length: 255, nullable: true })
  sessionId: string; // User's session ID

  @Column({ type: 'varchar', length: 255, nullable: true })
  ipAddress: string; // IP address of the user

  @Column({ type: 'varchar', length: 255, nullable: true })
  userAgent: string; // User agent string

  @Column({ type: 'text' })
  description: string; // Human-readable description of the action

  @Column({ type: 'text', nullable: true })
  details: string; // Additional details about the action

  @Column({ type: 'jsonb', nullable: true })
  oldValues: Record<string, any>; // Previous values before the change

  @Column({ type: 'jsonb', nullable: true })
  newValues: Record<string, any>; // New values after the change

  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, any>; // Additional metadata about the action

  @Column({ type: 'varchar', length: 255, nullable: true })
  externalReference: string; // External system reference

  @Column({ type: 'jsonb', nullable: true })
  externalData: Record<string, any>; // Data from external systems

  @Column({ type: 'boolean', default: false })
  isSensitive: boolean; // Whether this log entry contains sensitive information

  @Column({ type: 'boolean', default: false })
  isAnonymized: boolean; // Whether sensitive data has been anonymized

  @Column({ type: 'timestamp', nullable: true })
  expiresAt: Date; // When this log entry should expire (for data retention)

  @CreateDateColumn()
  createdAt: Date;

  // Computed properties
  get isExpired(): boolean {
    return this.expiresAt ? new Date() > this.expiresAt : false;
  }

  get isExpiringSoon(): boolean {
    if (!this.expiresAt) return false;
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
    return this.expiresAt <= thirtyDaysFromNow;
  }

  get isHighLevel(): boolean {
    return this.level === AuditLevel.ERROR || this.level === AuditLevel.CRITICAL;
  }

  get isCritical(): boolean {
    return this.level === AuditLevel.CRITICAL;
  }

  get hasChanges(): boolean {
    return !!(this.oldValues && this.newValues);
  }

  get changeSummary(): string {
    if (!this.hasChanges) return 'No changes';
    
    const changes = [];
    for (const [key, oldValue] of Object.entries(this.oldValues)) {
      const newValue = this.newValues[key];
      if (oldValue !== newValue) {
        changes.push(`${key}: ${oldValue} → ${newValue}`);
      }
    }
    return changes.join(', ');
  }

  get isUserAction(): boolean {
    return this.source === AuditSource.WEB_UI || this.source === AuditSource.API;
  }

  get isSystemAction(): boolean {
    return this.source === AuditSource.SYSTEM || this.source === AuditSource.SCHEDULED_TASK;
  }

  get isExternalAction(): boolean {
    return this.source === AuditSource.EXTERNAL || this.source === AuditSource.WEBHOOK;
  }

  get ageInDays(): number {
    const now = new Date();
    const created = new Date(this.createdAt);
    return Math.floor((now.getTime() - created.getTime()) / (1000 * 60 * 60 * 24));
  }

  get shouldBeRetained(): boolean {
    // Critical and error logs should be retained longer
    if (this.level === AuditLevel.CRITICAL) return true;
    if (this.level === AuditLevel.ERROR) return this.ageInDays < 365; // 1 year
    if (this.level === AuditLevel.WARNING) return this.ageInDays < 180; // 6 months
    return this.ageInDays < 90; // 3 months for info logs
  }
}
