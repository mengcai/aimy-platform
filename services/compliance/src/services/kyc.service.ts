import { Injectable, Logger, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MinIOService } from './minio.service';
import { ScreeningService } from './screening.service';
import { RuleEngineService } from './rule-engine.service';
import { KYCApplicant, KYCStatus, InvestorType, AccreditationStatus, RiskLevel } from '../entities/kyc-applicant.entity';
import { KYCDocument, DocumentType, DocumentStatus } from '../entities/kyc-document.entity';
import { ScreeningResult, ScreeningType } from '../entities/screening-result.entity';
import { ComplianceCase, CaseStatus, CaseType, CasePriority } from '../entities/compliance-case.entity';
import { AuditLog, AuditAction, AuditLevel, AuditSource } from '../entities/audit-log.entity';

export interface CreateApplicantRequest {
  email: string;
  walletAddress?: string;
  firstName: string;
  lastName: string;
  dateOfBirth: Date;
  nationality: string;
  countryOfResidence: string;
  passportNumber?: string;
  nationalId?: string;
  phoneNumber?: string;
  investorType: InvestorType;
  accreditationStatus: AccreditationStatus;
  annualIncome?: number;
  netWorth?: number;
  sourceOfFunds?: string;
  employmentStatus?: string;
  employerName?: string;
  isPEP?: boolean;
  pepDetails?: string;
  hasSanctions?: boolean;
  sanctionsDetails?: string;
  riskLevel?: RiskLevel;
  notes?: string;
}

export interface UploadDocumentRequest {
  applicantId: string;
  documentType: DocumentType;
  file: Express.Multer.File;
  metadata?: {
    documentNumber?: string;
    issueDate?: Date;
    expiryDate?: Date;
    issuingCountry?: string;
    issuingAuthority?: string;
    additionalInfo?: Record<string, any>;
  };
}

export interface KYCVerificationRequest {
  applicantId: string;
  verificationMethod: 'AUTOMATED' | 'MANUAL' | 'HYBRID';
  verifierId?: string;
  notes?: string;
}

export interface KYCStatusUpdate {
  status: KYCStatus;
  reason?: string;
  notes?: string;
  updatedBy: string;
  riskLevel?: RiskLevel;
  complianceNotes?: string;
}

export interface KYCWorkflowResult {
  applicant: KYCApplicant;
  status: KYCStatus;
  nextSteps: string[];
  requiresManualReview: boolean;
  riskLevel: RiskLevel;
  complianceScore: number;
  estimatedCompletionTime: string;
  documents: KYCDocument[];
  screeningResults: ScreeningResult[];
  complianceCase?: ComplianceCase;
}

@Injectable()
export class KYCService {
  private readonly logger = new Logger(KYCService.name);

  constructor(
    @InjectRepository(KYCApplicant)
    private readonly applicantRepository: Repository<KYCApplicant>,
    @InjectRepository(KYCDocument)
    private readonly documentRepository: Repository<KYCDocument>,
    @InjectRepository(ScreeningResult)
    private readonly screeningResultRepository: Repository<ScreeningResult>,
    @InjectRepository(ComplianceCase)
    private readonly complianceCaseRepository: Repository<ComplianceCase>,
    @InjectRepository(AuditLog)
    private readonly auditLogRepository: Repository<AuditLog>,
    private readonly minioService: MinIOService,
    private readonly screeningService: ScreeningService,
    private readonly ruleEngineService: RuleEngineService,
  ) {}

  /**
   * Create a new KYC applicant
   */
  async createApplicant(request: CreateApplicantRequest): Promise<KYCApplicant> {
    this.logger.log(`Creating KYC applicant for email: ${request.email}`);

    try {
      // Check if applicant already exists
      const existingApplicant = await this.applicantRepository.findOne({
        where: { email: request.email },
      });

      if (existingApplicant) {
        throw new BadRequestException(`Applicant with email ${request.email} already exists`);
      }

      // Create applicant
      const applicant = this.applicantRepository.create({
        ...request,
        status: KYCStatus.DRAFT,
        riskLevel: request.riskLevel || RiskLevel.MEDIUM,
        kycLevel: this.determineKYCLevel(request),
      });

      const savedApplicant = await this.applicantRepository.save(applicant);

      // Create audit log
      await this.createAuditLog({
        action: AuditAction.CREATE,
        level: AuditLevel.INFO,
        source: AuditSource.KYC_SERVICE,
        entityType: 'KYCApplicant',
        entityId: savedApplicant.id,
        description: `KYC applicant created: ${request.firstName} ${request.lastName}`,
        userId: 'system',
        ipAddress: 'system',
        newValues: request,
      });

      this.logger.log(`KYC applicant created successfully: ${savedApplicant.id}`);

      return savedApplicant;
    } catch (error) {
      this.logger.error(`Failed to create KYC applicant: ${error.message}`);
      throw error;
    }
  }

  /**
   * Upload document for an applicant
   */
  async uploadDocument(request: UploadDocumentRequest): Promise<KYCDocument> {
    this.logger.log(`Uploading document for applicant: ${request.applicantId}`);

    try {
      // Verify applicant exists
      const applicant = await this.applicantRepository.findOne({
        where: { id: request.applicantId },
      });

      if (!applicant) {
        throw new NotFoundException(`Applicant not found: ${request.applicantId}`);
      }

      // Upload to MinIO
      const uploadResult = await this.minioService.uploadDocument(
        request.file,
        request.applicantId,
        request.documentType,
        request.metadata
      );

      // Create document record
      const document = this.documentRepository.create({
        applicantId: request.applicantId,
        documentType: request.documentType,
        fileName: request.file.originalname,
        filePath: uploadResult.objectName,
        fileSize: request.file.size,
        mimeType: request.file.mimetype,
        hash: uploadResult.hash,
        status: DocumentStatus.PENDING_VERIFICATION,
        documentNumber: request.metadata?.documentNumber,
        issueDate: request.metadata?.issueDate,
        expiryDate: request.metadata?.expiryDate,
        issuingCountry: request.metadata?.issuingCountry,
        issuingAuthority: request.metadata?.issuingAuthority,
        additionalInfo: request.metadata?.additionalInfo,
      });

      const savedDocument = await this.documentRepository.save(document);

      // Create audit log
      await this.createAuditLog({
        action: AuditAction.UPLOAD,
        level: AuditLevel.INFO,
        source: AuditSource.KYC_SERVICE,
        entityType: 'KYCDocument',
        entityId: savedDocument.id,
        description: `Document uploaded: ${request.documentType} for applicant ${request.applicantId}`,
        userId: 'system',
        ipAddress: 'system',
        newValues: {
          documentType: request.documentType,
          fileName: request.file.originalname,
          fileSize: request.file.size,
        },
      });

      this.logger.log(`Document uploaded successfully: ${savedDocument.id}`);

      return savedDocument;
    } catch (error) {
      this.logger.error(`Failed to upload document: ${error.message}`);
      throw error;
    }
  }

  /**
   * Initiate KYC verification process
   */
  async initiateVerification(request: KYCVerificationRequest): Promise<KYCWorkflowResult> {
    this.logger.log(`Initiating KYC verification for applicant: ${request.applicantId}`);

    try {
      // Get applicant with documents
      const applicant = await this.applicantRepository.findOne({
        where: { id: request.applicantId },
        relations: ['documents'],
      });

      if (!applicant) {
        throw new NotFoundException(`Applicant not found: ${request.applicantId}`);
      }

      // Update status
      applicant.status = KYCStatus.IN_PROGRESS;
      applicant.verificationStartedAt = new Date();
      applicant.verificationMethod = request.verificationMethod;
      applicant.verifierId = request.verifierId;
      applicant.verificationNotes = request.notes;

      await this.applicantRepository.save(applicant);

      // Start automated screening
      const screeningPromises = [
        this.screeningService.initiateScreening({
          applicantId: request.applicantId,
          screeningType: ScreeningType.SANCTIONS,
          applicantData: {
            firstName: applicant.firstName,
            lastName: applicant.lastName,
            dateOfBirth: applicant.dateOfBirth,
            nationality: applicant.nationality,
            countryOfResidence: applicant.countryOfResidence,
            passportNumber: applicant.passportNumber,
            nationalId: applicant.nationalId,
          },
        }),
        this.screeningService.initiateScreening({
          applicantId: request.applicantId,
          screeningType: ScreeningType.AML,
          applicantData: {
            firstName: applicant.firstName,
            lastName: applicant.lastName,
            dateOfBirth: applicant.dateOfBirth,
            nationality: applicant.nationality,
            countryOfResidence: applicant.countryOfResidence,
            passportNumber: applicant.passportNumber,
            nationalId: applicant.nationalId,
          },
        }),
      ];

      if (applicant.isPEP) {
        screeningPromises.push(
          this.screeningService.initiateScreening({
            applicantId: request.applicantId,
            screeningType: ScreeningType.PEP,
            applicantData: {
              firstName: applicant.firstName,
              lastName: applicant.lastName,
              dateOfBirth: applicant.dateOfBirth,
              nationality: applicant.nationality,
              countryOfResidence: applicant.countryOfResidence,
              passportNumber: applicant.passportNumber,
              nationalId: applicant.nationalId,
            },
          })
        );
      }

      // Wait for all screenings to complete
      const screeningResults = await Promise.all(screeningPromises);

      // Evaluate compliance rules
      const complianceResult = await this.ruleEngineService.evaluateCompliance({
        applicant,
        jurisdiction: applicant.countryOfResidence,
        investorType: applicant.investorType,
        accreditationStatus: applicant.accreditationStatus,
      });

      // Determine next steps and status
      const workflowResult = await this.processWorkflowResult(
        applicant,
        screeningResults,
        complianceResult,
        request
      );

      // Create audit log
      await this.createAuditLog({
        action: AuditAction.VERIFICATION_STARTED,
        level: AuditLevel.INFO,
        source: AuditSource.KYC_SERVICE,
        entityType: 'KYCApplicant',
        entityId: applicant.id,
        description: `KYC verification initiated for applicant ${applicant.id}`,
        userId: request.verifierId || 'system',
        ipAddress: 'system',
        newValues: {
          status: KYCStatus.IN_PROGRESS,
          verificationMethod: request.verificationMethod,
          verifierId: request.verifierId,
        },
      });

      this.logger.log(`KYC verification initiated successfully for applicant: ${applicant.id}`);

      return workflowResult;
    } catch (error) {
      this.logger.error(`Failed to initiate KYC verification: ${error.message}`);
      throw error;
    }
  }

  /**
   * Process workflow result and determine next steps
   */
  private async processWorkflowResult(
    applicant: KYCApplicant,
    screeningResults: any[],
    complianceResult: any,
    request: KYCVerificationRequest
  ): Promise<KYCWorkflowResult> {
    // Analyze screening results
    const hasHits = screeningResults.some(result => result.result === 'HIT');
    const hasHighRisk = screeningResults.some(result => result.riskScore >= 70);
    const requiresManualReview = hasHits || hasHighRisk || complianceResult.requiresManualReview;

    // Determine status
    let status: KYCStatus;
    let riskLevel: RiskLevel;
    let nextSteps: string[] = [];

    if (requiresManualReview) {
      status = KYCStatus.REVIEW_REQUIRED;
      riskLevel = RiskLevel.HIGH;
      nextSteps = [
        'Manual review required due to screening hits or high risk',
        'Compliance officer review needed',
        'Additional documentation may be required',
      ];

      // Create compliance case if needed
      if (hasHits || hasHighRisk) {
        await this.createComplianceCase(applicant, screeningResults, complianceResult);
      }
    } else if (complianceResult.overallResult === 'PASS') {
      status = KYCStatus.APPROVED;
      riskLevel = RiskLevel.LOW;
      nextSteps = [
        'KYC verification completed successfully',
        'Applicant approved for trading',
        'Monitor for any changes in risk profile',
      ];
    } else {
      status = KYCStatus.PENDING;
      riskLevel = RiskLevel.MEDIUM;
      nextSteps = [
        'Additional verification steps required',
        'Waiting for compliance rule evaluation',
        'Monitor application status',
      ];
    }

    // Update applicant status
    applicant.status = status;
    applicant.riskLevel = riskLevel;
    applicant.complianceScore = this.calculateComplianceScore(screeningResults, complianceResult);
    await this.applicantRepository.save(applicant);

    // Get updated documents and screening results
    const documents = await this.documentRepository.find({
      where: { applicantId: applicant.id },
      order: { createdAt: 'DESC' },
    });

    const allScreeningResults = await this.screeningResultRepository.find({
      where: { applicantId: applicant.id },
      order: { createdAt: 'DESC' },
    });

    const complianceCase = await this.complianceCaseRepository.findOne({
      where: { applicantId: applicant.id },
    });

    return {
      applicant,
      status,
      nextSteps,
      requiresManualReview,
      riskLevel,
      complianceScore: applicant.complianceScore,
      estimatedCompletionTime: this.estimateCompletionTime(status, requiresManualReview),
      documents,
      screeningResults: allScreeningResults,
      complianceCase,
    };
  }

  /**
   * Create compliance case for manual review
   */
  private async createComplianceCase(
    applicant: KYCApplicant,
    screeningResults: any[],
    complianceResult: any
  ): Promise<ComplianceCase> {
    const caseNumber = `CASE-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    const complianceCase = this.complianceCaseRepository.create({
      applicantId: applicant.id,
      caseNumber,
      caseType: CaseType.KYC_REVIEW,
      status: CaseStatus.OPEN,
      priority: this.determineCasePriority(screeningResults, complianceResult),
      title: `KYC Review Required - ${applicant.firstName} ${applicant.lastName}`,
      description: `Manual review required for KYC applicant due to screening hits or compliance rule failures`,
      assignedTo: null, // Will be assigned by compliance officer
      dueDate: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours from now
      escalationDate: new Date(Date.now() + 48 * 60 * 60 * 1000), // 48 hours from now
      riskLevel: applicant.riskLevel,
      screeningSummary: this.generateScreeningSummary(screeningResults),
      complianceSummary: complianceResult.summary,
      recommendations: complianceResult.recommendations.join('\n'),
    });

    return this.complianceCaseRepository.save(complianceCase);
  }

  /**
   * Determine case priority based on risk factors
   */
  private determineCasePriority(screeningResults: any[], complianceResult: any): CasePriority {
    const hasCriticalRisk = screeningResults.some(result => result.riskScore >= 90);
    const hasBlockedRules = complianceResult.blockedRules > 0;
    const hasSanctionsHit = screeningResults.some(result => 
      result.screeningType === ScreeningType.SANCTIONS && result.result === 'HIT'
    );

    if (hasCriticalRisk || hasSanctionsHit) {
      return CasePriority.CRITICAL;
    } else if (hasBlockedRules || complianceResult.overallResult === 'FAIL') {
      return CasePriority.HIGH;
    } else {
      return CasePriority.MEDIUM;
    }
  }

  /**
   * Generate screening summary for compliance case
   */
  private generateScreeningSummary(screeningResults: any[]): string {
    const summaries = screeningResults.map(result => {
      const status = result.result === 'HIT' ? 'HIT' : 'CLEAR';
      return `${result.screeningType}: ${status} (Risk: ${result.riskScore}%)`;
    });

    return summaries.join('\n');
  }

  /**
   * Calculate compliance score based on screening and rule results
   */
  private calculateComplianceScore(screeningResults: any[], complianceResult: any): number {
    let score = 100;

    // Deduct points for screening hits
    screeningResults.forEach(result => {
      if (result.result === 'HIT') {
        score -= Math.min(30, result.riskScore * 0.3);
      }
    });

    // Deduct points for failed compliance rules
    if (complianceResult.failedRules > 0) {
      score -= (complianceResult.failedRules / complianceResult.totalRules) * 40;
    }

    // Deduct points for high risk
    if (complianceResult.averageRiskScore > 70) {
      score -= 20;
    }

    return Math.max(0, Math.round(score));
  }

  /**
   * Estimate completion time based on status and requirements
   */
  private estimateCompletionTime(status: KYCStatus, requiresManualReview: boolean): string {
    switch (status) {
      case KYCStatus.APPROVED:
        return 'Completed';
      case KYCStatus.REVIEW_REQUIRED:
        return requiresManualReview ? '24-48 hours' : '4-8 hours';
      case KYCStatus.IN_PROGRESS:
        return '2-4 hours';
      case KYCStatus.PENDING:
        return '1-2 hours';
      default:
        return 'Unknown';
    }
  }

  /**
   * Update KYC status
   */
  async updateKYCStatus(applicantId: string, update: KYCStatusUpdate): Promise<KYCApplicant> {
    this.logger.log(`Updating KYC status for applicant: ${applicantId}`);

    try {
      const applicant = await this.applicantRepository.findOne({
        where: { id: applicantId },
      });

      if (!applicant) {
        throw new NotFoundException(`Applicant not found: ${applicantId}`);
      }

      const oldStatus = applicant.status;
      const oldRiskLevel = applicant.riskLevel;

      // Update applicant
      applicant.status = update.status;
      applicant.riskLevel = update.riskLevel || applicant.riskLevel;
      applicant.complianceNotes = update.complianceNotes;
      applicant.updatedAt = new Date();

      if (update.status === KYCStatus.APPROVED) {
        applicant.approvedAt = new Date();
        applicant.approvedBy = update.updatedBy;
      } else if (update.status === KYCStatus.REJECTED) {
        applicant.rejectedAt = new Date();
        applicant.rejectedBy = update.updatedBy;
        applicant.rejectionReason = update.reason;
      }

      const updatedApplicant = await this.applicantRepository.save(applicant);

      // Create audit log
      await this.createAuditLog({
        action: AuditAction.STATUS_UPDATE,
        level: AuditLevel.INFO,
        source: AuditSource.KYC_SERVICE,
        entityType: 'KYCApplicant',
        entityId: applicantId,
        description: `KYC status updated from ${oldStatus} to ${update.status}`,
        userId: update.updatedBy,
        ipAddress: 'system',
        oldValues: {
          status: oldStatus,
          riskLevel: oldRiskLevel,
        },
        newValues: {
          status: update.status,
          riskLevel: update.riskLevel,
          reason: update.reason,
          notes: update.notes,
        },
      });

      this.logger.log(`KYC status updated successfully for applicant: ${applicantId}`);

      return updatedApplicant;
    } catch (error) {
      this.logger.error(`Failed to update KYC status: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get KYC applicant by ID
   */
  async getApplicant(id: string): Promise<KYCApplicant> {
    const applicant = await this.applicantRepository.findOne({
      where: { id },
      relations: ['documents', 'complianceCase'],
    });

    if (!applicant) {
      throw new NotFoundException(`Applicant not found: ${id}`);
    }

    return applicant;
  }

  /**
   * Get all KYC applicants with pagination
   */
  async getApplicants(
    page: number = 1,
    limit: number = 20,
    filters?: {
      status?: KYCStatus;
      riskLevel?: RiskLevel;
      investorType?: InvestorType;
      search?: string;
    }
  ): Promise<{
    applicants: KYCApplicant[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const queryBuilder = this.applicantRepository.createQueryBuilder('applicant');

    // Apply filters
    if (filters?.status) {
      queryBuilder.andWhere('applicant.status = :status', { status: filters.status });
    }

    if (filters?.riskLevel) {
      queryBuilder.andWhere('applicant.riskLevel = :riskLevel', { riskLevel: filters.riskLevel });
    }

    if (filters?.investorType) {
      queryBuilder.andWhere('applicant.investorType = :investorType', { investorType: filters.investorType });
    }

    if (filters?.search) {
      queryBuilder.andWhere(
        '(applicant.firstName ILIKE :search OR applicant.lastName ILIKE :search OR applicant.email ILIKE :search)',
        { search: `%${filters.search}%` }
      );
    }

    // Get total count
    const total = await queryBuilder.getCount();

    // Apply pagination
    const offset = (page - 1) * limit;
    queryBuilder.skip(offset).take(limit);
    queryBuilder.orderBy('applicant.createdAt', 'DESC');

    const applicants = await queryBuilder.getMany();

    return {
      applicants,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * Get KYC statistics
   */
  async getKYCStats(): Promise<{
    total: number;
    byStatus: Record<KYCStatus, number>;
    byRiskLevel: Record<RiskLevel, number>;
    byInvestorType: Record<InvestorType, number>;
    averageProcessingTime: number;
    approvalRate: number;
  }> {
    const [total, byStatus, byRiskLevel, byInvestorType, processingTimes, approvals] = await Promise.all([
      this.applicantRepository.count(),
      this.applicantRepository
        .createQueryBuilder('applicant')
        .select('applicant.status', 'status')
        .addSelect('COUNT(*)', 'count')
        .groupBy('applicant.status')
        .getRawMany(),
      this.applicantRepository
        .createQueryBuilder('applicant')
        .select('applicant.riskLevel', 'riskLevel')
        .addSelect('COUNT(*)', 'count')
        .groupBy('applicant.riskLevel')
        .getRawMany(),
      this.applicantRepository
        .createQueryBuilder('applicant')
        .select('applicant.investorType', 'investorType')
        .addSelect('COUNT(*)', 'count')
        .groupBy('applicant.investorType')
        .getRawMany(),
      this.applicantRepository
        .createQueryBuilder('applicant')
        .select('AVG(EXTRACT(EPOCH FROM (applicant.updatedAt - applicant.createdAt))/3600)', 'avgHours')
        .where('applicant.status IN (:...statuses)', { statuses: [KYCStatus.APPROVED, KYCStatus.REJECTED] })
        .getRawOne(),
      this.applicantRepository.count({ where: { status: KYCStatus.APPROVED } }),
    ]);

    const statusStats = byStatus.reduce((acc, item) => {
      acc[item.status as KYCStatus] = parseInt(item.count);
      return acc;
    }, {} as Record<KYCStatus, number>);

    const riskLevelStats = byRiskLevel.reduce((acc, item) => {
      acc[item.riskLevel as RiskLevel] = parseInt(item.count);
      return acc;
    }, {} as Record<RiskLevel, number>);

    const investorTypeStats = byInvestorType.reduce((acc, item) => {
      acc[item.investorType as InvestorType] = parseInt(item.count);
      return acc;
    }, {} as Record<InvestorType, number>);

    const averageProcessingTime = processingTimes?.avgHours || 0;
    const approvalRate = total > 0 ? (approvals / total) * 100 : 0;

    return {
      total,
      byStatus: statusStats,
      byRiskLevel: riskLevelStats,
      byInvestorType: investorTypeStats,
      averageProcessingTime,
      approvalRate,
    };
  }

  /**
   * Determine KYC level based on applicant data
   */
  private determineKYCLevel(request: CreateApplicantRequest): number {
    let level = 1; // Base level

    // Increase level for higher risk factors
    if (request.investorType === InvestorType.INSTITUTIONAL) {
      level += 1;
    }

    if (request.accreditationStatus === AccreditationStatus.ACCREDITED) {
      level += 1;
    }

    if (request.isPEP) {
      level += 2;
    }

    if (request.hasSanctions) {
      level += 3;
    }

    if (request.annualIncome && request.annualIncome > 1000000) {
      level += 1;
    }

    if (request.netWorth && request.netWorth > 10000000) {
      level += 1;
    }

    return Math.min(5, level); // Cap at level 5
  }

  /**
   * Create audit log entry
   */
  private async createAuditLog(auditData: {
    action: AuditAction;
    level: AuditLevel;
    source: AuditSource;
    entityType: string;
    entityId: string;
    description: string;
    userId: string;
    ipAddress: string;
    oldValues?: Record<string, any>;
    newValues?: Record<string, any>;
  }): Promise<AuditLog> {
    const auditLog = this.auditLogRepository.create({
      ...auditData,
      timestamp: new Date(),
    });

    return this.auditLogRepository.save(auditLog);
  }
}
