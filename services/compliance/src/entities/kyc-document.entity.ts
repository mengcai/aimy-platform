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

export enum DocumentType {
  PASSPORT = 'PASSPORT',
  DRIVERS_LICENSE = 'DRIVERS_LICENSE',
  NATIONAL_ID = 'NATIONAL_ID',
  UTILITY_BILL = 'UTILITY_BILL',
  BANK_STATEMENT = 'BANK_STATEMENT',
  TAX_RETURN = 'TAX_RETURN',
  EMPLOYMENT_LETTER = 'EMPLOYMENT_LETTER',
  PAY_STUB = 'PAY_STUB',
  INVESTMENT_ACCOUNT_STATEMENT = 'INVESTMENT_ACCOUNT_STATEMENT',
  CORPORATE_REGISTRATION = 'CORPORATE_REGISTRATION',
  ARTICLES_OF_INCORPORATION = 'ARTICLES_OF_INCORPORATION',
  TRUST_DEED = 'TRUST_DEED',
  PARTNERSHIP_AGREEMENT = 'PARTNERSHIP_AGREEMENT',
  OTHER = 'OTHER',
}

export enum DocumentStatus {
  PENDING = 'PENDING',
  VERIFIED = 'VERIFIED',
  REJECTED = 'REJECTED',
  EXPIRED = 'EXPIRED',
}

export enum VerificationMethod {
  MANUAL = 'MANUAL',
  OCR = 'OCR',
  THIRD_PARTY = 'THIRD_PARTY',
  BLOCKCHAIN = 'BLOCKCHAIN',
}

@Entity('kyc_documents')
@Index(['applicantId'])
@Index(['documentType'])
@Index(['status'])
@Index(['verificationMethod'])
export class KYCDocument {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  applicantId: string;

  @Column({
    type: 'enum',
    enum: DocumentType,
  })
  documentType: DocumentType;

  @Column({ type: 'varchar', length: 255 })
  fileName: string;

  @Column({ type: 'varchar', length: 255 })
  originalFileName: string;

  @Column({ type: 'varchar', length: 100 })
  mimeType: string;

  @Column({ type: 'bigint' })
  fileSize: number;

  @Column({ type: 'varchar', length: 255 })
  filePath: string; // MinIO object key

  @Column({ type: 'varchar', length: 255, nullable: true })
  fileHash: string; // SHA-256 hash for integrity

  @Column({
    type: 'enum',
    enum: DocumentStatus,
    default: DocumentStatus.PENDING,
  })
  status: DocumentStatus;

  @Column({
    type: 'enum',
    enum: VerificationMethod,
    nullable: true,
  })
  verificationMethod: VerificationMethod;

  @Column({ type: 'boolean', default: false })
  isVerified: boolean;

  @Column({ type: 'timestamp', nullable: true })
  verifiedAt: Date;

  @Column({ type: 'uuid', nullable: true })
  verifiedBy: string;

  @Column({ type: 'text', nullable: true })
  verificationNotes: string;

  @Column({ type: 'text', nullable: true })
  rejectionReason: string;

  @Column({ type: 'date', nullable: true })
  issueDate: Date;

  @Column({ type: 'date', nullable: true })
  expiryDate: Date;

  @Column({ type: 'varchar', length: 255, nullable: true })
  documentNumber: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  issuingAuthority: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  issuingCountry: string;

  @Column({ type: 'jsonb', nullable: true })
  extractedData: Record<string, any>; // OCR extracted data

  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, any>; // Additional document metadata

  @Column({ type: 'text', nullable: true })
  notes: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Relations
  @ManyToOne(() => KYCApplicant, (applicant) => applicant.documents)
  @JoinColumn({ name: 'applicantId' })
  applicant: KYCApplicant;

  // Computed properties
  get isExpired(): boolean {
    return this.expiryDate ? new Date() > this.expiryDate : false;
  }

  get isExpiringSoon(): boolean {
    if (!this.expiryDate) return false;
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
    return this.expiryDate <= thirtyDaysFromNow;
  }

  get fileSizeInMB(): number {
    return Math.round((this.fileSize / (1024 * 1024)) * 100) / 100;
  }

  get isImage(): boolean {
    return this.mimeType.startsWith('image/');
  }

  get isPDF(): boolean {
    return this.mimeType === 'application/pdf';
  }

  get canBeVerified(): boolean {
    return this.status === DocumentStatus.PENDING && !this.isExpired;
  }
}
