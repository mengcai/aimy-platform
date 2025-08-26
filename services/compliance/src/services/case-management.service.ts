import { Injectable, Logger, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ComplianceCase, CaseStatus, CaseType, CasePriority, DecisionType } from '../entities/compliance-case.entity';
import { KYCApplicant } from '../entities/kyc-applicant.entity';
import { AuditLog, AuditAction, AuditLevel, AuditSource } from '../entities/audit-log.entity';
import { KYCService } from './kyc.service';

export interface CreateCaseRequest {
  applicantId: string;
  caseType: CaseType;
  title: string;
  description: string;
  priority: CasePriority;
  assignedTo?: string;
  dueDate?: Date;
  riskLevel?: string;
  metadata?: Record<string, any>;
}

export interface UpdateCaseRequest {
  title?: string;
  description?: string;
  priority?: CasePriority;
  assignedTo?: string;
  dueDate?: Date;
  status?: CaseStatus;
  riskLevel?: string;
  notes?: string;
  metadata?: Record<string, any>;
}

export interface CaseDecisionRequest {
  caseId: string;
  decision: DecisionType;
  reason: string;
  notes?: string;
  decisionBy: string;
  riskAssessment?: string;
  followUpActions?: string[];
  nextReviewDate?: Date;
}

export interface CaseAssignmentRequest {
  caseId: string;
  assignedTo: string;
  assignedBy: string;
  notes?: string;
  priority?: CasePriority;
}

export interface CaseEscalationRequest {
  caseId: string;
  escalatedBy: string;
  reason: string;
  newPriority?: CasePriority;
  newAssignee?: string;
  escalationNotes?: string;
}

export interface CaseSearchFilters {
  status?: CaseStatus;
  priority?: CasePriority;
  caseType?: CaseType;
  assignedTo?: string;
  riskLevel?: string;
  dateFrom?: Date;
  dateTo?: Date;
  search?: string;
}

export interface CaseMetrics {
  total: number;
  open: number;
  closed: number;
  overdue: number;
  byPriority: Record<CasePriority, number>;
  byType: Record<CaseType, number>;
  byStatus: Record<CaseStatus, number>;
  averageResolutionTime: number;
  escalationRate: number;
}

@Injectable()
export class CaseManagementService {
  private readonly logger = new Logger(CaseManagementService.name);

  constructor(
    @InjectRepository(ComplianceCase)
    private readonly complianceCaseRepository: Repository<ComplianceCase>,
    @InjectRepository(KYCApplicant)
    private readonly applicantRepository: Repository<KYCApplicant>,
    @InjectRepository(AuditLog)
    private readonly auditLogRepository: Repository<AuditLog>,
    private readonly kycService: KYCService,
  ) {}

  /**
   * Create a new compliance case
   */
  async createCase(request: CreateCaseRequest): Promise<ComplianceCase> {
    this.logger.log(`Creating compliance case for applicant: ${request.applicantId}`);

    try {
      // Verify applicant exists
      const applicant = await this.applicantRepository.findOne({
        where: { id: request.applicantId },
      });

      if (!applicant) {
        throw new NotFoundException(`Applicant not found: ${request.applicantId}`);
      }

      // Generate case number
      const caseNumber = this.generateCaseNumber(request.caseType);

      // Set default due date if not provided
      const dueDate = request.dueDate || this.calculateDefaultDueDate(request.priority);

      // Create case
      const complianceCase = this.complianceCaseRepository.create({
        applicantId: request.applicantId,
        caseNumber,
        caseType: request.caseType,
        title: request.title,
        description: request.description,
        status: CaseStatus.OPEN,
        priority: request.priority,
        assignedTo: request.assignedTo,
        dueDate,
        escalationDate: this.calculateEscalationDate(dueDate, request.priority),
        riskLevel: request.riskLevel || applicant.riskLevel,
        metadata: request.metadata || {},
      });

      const savedCase = await this.complianceCaseRepository.save(complianceCase);

      // Create audit log
      await this.createAuditLog({
        action: AuditAction.CREATE,
        level: AuditLevel.INFO,
        source: AuditSource.CASE_MANAGEMENT,
        entityType: 'ComplianceCase',
        entityId: savedCase.id,
        description: `Compliance case created: ${request.title}`,
        userId: 'system',
        ipAddress: 'system',
        newValues: {
          caseNumber,
          caseType: request.caseType,
          title: request.title,
          priority: request.priority,
        },
      });

      this.logger.log(`Compliance case created successfully: ${savedCase.id}`);

      return savedCase;
    } catch (error) {
      this.logger.error(`Failed to create compliance case: ${error.message}`);
      throw error;
    }
  }

  /**
   * Update an existing compliance case
   */
  async updateCase(caseId: string, request: UpdateCaseRequest): Promise<ComplianceCase> {
    this.logger.log(`Updating compliance case: ${caseId}`);

    try {
      const complianceCase = await this.complianceCaseRepository.findOne({
        where: { id: caseId },
      });

      if (!complianceCase) {
        throw new NotFoundException(`Compliance case not found: ${caseId}`);
      }

      // Store old values for audit
      const oldValues = {
        title: complianceCase.title,
        description: complianceCase.description,
        priority: complianceCase.priority,
        assignedTo: complianceCase.assignedTo,
        dueDate: complianceCase.dueDate,
        status: complianceCase.status,
        riskLevel: complianceCase.riskLevel,
      };

      // Update case
      Object.assign(complianceCase, request);

      // Recalculate escalation date if due date changed
      if (request.dueDate) {
        complianceCase.escalationDate = this.calculateEscalationDate(request.dueDate, complianceCase.priority);
      }

      // Update metadata
      if (request.metadata) {
        complianceCase.metadata = { ...complianceCase.metadata, ...request.metadata };
      }

      const updatedCase = await this.complianceCaseRepository.save(complianceCase);

      // Create audit log
      await this.createAuditLog({
        action: AuditAction.UPDATE,
        level: AuditLevel.INFO,
        source: AuditSource.CASE_MANAGEMENT,
        entityType: 'ComplianceCase',
        entityId: caseId,
        description: `Compliance case updated: ${request.title || complianceCase.title}`,
        userId: 'system',
        ipAddress: 'system',
        oldValues,
        newValues: request,
      });

      this.logger.log(`Compliance case updated successfully: ${caseId}`);

      return updatedCase;
    } catch (error) {
      this.logger.error(`Failed to update compliance case: ${error.message}`);
      throw error;
    }
  }

  /**
   * Make a decision on a compliance case
   */
  async makeDecision(request: CaseDecisionRequest): Promise<ComplianceCase> {
    this.logger.log(`Making decision on compliance case: ${request.caseId}`);

    try {
      const complianceCase = await this.complianceCaseRepository.findOne({
        where: { id: request.caseId },
        relations: ['applicant'],
      });

      if (!complianceCase) {
        throw new NotFoundException(`Compliance case not found: ${request.caseId}`);
      }

      if (complianceCase.status === CaseStatus.CLOSED) {
        throw new BadRequestException('Cannot make decision on closed case');
      }

      // Update case with decision
      complianceCase.status = CaseStatus.CLOSED;
      complianceCase.decision = request.decision;
      complianceCase.decisionReason = request.reason;
      complianceCase.decisionNotes = request.notes;
      complianceCase.decisionBy = request.decisionBy;
      complianceCase.decisionAt = new Date();
      complianceCase.riskAssessment = request.riskAssessment;
      complianceCase.followUpActions = request.followUpActions;
      complianceCase.nextReviewDate = request.nextReviewDate;
      complianceCase.resolutionTime = this.calculateResolutionTime(complianceCase.createdAt, new Date());

      const updatedCase = await this.complianceCaseRepository.save(complianceCase);

      // Update KYC applicant status if this is a KYC review case
      if (complianceCase.caseType === CaseType.KYC_REVIEW && complianceCase.applicant) {
        await this.updateApplicantStatus(complianceCase.applicant, request);
      }

      // Create audit log
      await this.createAuditLog({
        action: AuditAction.DECISION,
        level: AuditLevel.INFO,
        source: AuditSource.CASE_MANAGEMENT,
        entityType: 'ComplianceCase',
        entityId: request.caseId,
        description: `Decision made on compliance case: ${request.decision}`,
        userId: request.decisionBy,
        ipAddress: 'system',
        newValues: {
          decision: request.decision,
          reason: request.reason,
          notes: request.notes,
          riskAssessment: request.riskAssessment,
        },
      });

      this.logger.log(`Decision made successfully on compliance case: ${request.caseId}`);

      return updatedCase;
    } catch (error) {
      this.logger.error(`Failed to make decision on compliance case: ${error.message}`);
      throw error;
    }
  }

  /**
   * Assign case to a compliance officer
   */
  async assignCase(request: CaseAssignmentRequest): Promise<ComplianceCase> {
    this.logger.log(`Assigning compliance case: ${request.caseId} to: ${request.assignedTo}`);

    try {
      const complianceCase = await this.complianceCaseRepository.findOne({
        where: { id: request.caseId },
      });

      if (!complianceCase) {
        throw new NotFoundException(`Compliance case not found: ${request.caseId}`);
      }

      if (complianceCase.status === CaseStatus.CLOSED) {
        throw new BadRequestException('Cannot assign closed case');
      }

      // Store old values for audit
      const oldValues = {
        assignedTo: complianceCase.assignedTo,
        priority: complianceCase.priority,
      };

      // Update case assignment
      complianceCase.assignedTo = request.assignedTo;
      complianceCase.assignedAt = new Date();
      complianceCase.assignedBy = request.assignedBy;
      complianceCase.assignmentNotes = request.notes;

      if (request.priority) {
        complianceCase.priority = request.priority;
        complianceCase.dueDate = this.calculateDefaultDueDate(request.priority);
        complianceCase.escalationDate = this.calculateEscalationDate(complianceCase.dueDate, request.priority);
      }

      const updatedCase = await this.complianceCaseRepository.save(complianceCase);

      // Create audit log
      await this.createAuditLog({
        action: AuditAction.ASSIGNMENT,
        level: AuditLevel.INFO,
        source: AuditSource.CASE_MANAGEMENT,
        entityType: 'ComplianceCase',
        entityId: request.caseId,
        description: `Case assigned to: ${request.assignedTo}`,
        userId: request.assignedBy,
        ipAddress: 'system',
        oldValues,
        newValues: {
          assignedTo: request.assignedTo,
          priority: request.priority,
          notes: request.notes,
        },
      });

      this.logger.log(`Case assigned successfully: ${request.caseId}`);

      return updatedCase;
    } catch (error) {
      this.logger.error(`Failed to assign case: ${error.message}`);
      throw error;
    }
  }

  /**
   * Escalate a compliance case
   */
  async escalateCase(request: CaseEscalationRequest): Promise<ComplianceCase> {
    this.logger.log(`Escalating compliance case: ${request.caseId}`);

    try {
      const complianceCase = await this.complianceCaseRepository.findOne({
        where: { id: request.caseId },
      });

      if (!complianceCase) {
        throw new NotFoundException(`Compliance case not found: ${request.caseId}`);
      }

      if (complianceCase.status === CaseStatus.CLOSED) {
        throw new BadRequestException('Cannot escalate closed case');
      }

      // Store old values for audit
      const oldValues = {
        priority: complianceCase.priority,
        assignedTo: complianceCase.assignedTo,
      };

      // Update case with escalation
      complianceCase.priority = request.newPriority || this.escalatePriority(complianceCase.priority);
      complianceCase.assignedTo = request.newAssignee || complianceCase.assignedTo;
      complianceCase.escalatedAt = new Date();
      complianceCase.escalatedBy = request.escalatedBy;
      complianceCase.escalationReason = request.reason;
      complianceCase.escalationNotes = request.escalationNotes;
      complianceCase.dueDate = this.calculateDefaultDueDate(complianceCase.priority);
      complianceCase.escalationDate = this.calculateEscalationDate(complianceCase.dueDate, complianceCase.priority);

      const updatedCase = await this.complianceCaseRepository.save(complianceCase);

      // Create audit log
      await this.createAuditLog({
        action: AuditAction.ESCALATION,
        level: AuditLevel.WARNING,
        source: AuditSource.CASE_MANAGEMENT,
        entityType: 'ComplianceCase',
        entityId: request.caseId,
        description: `Case escalated: ${request.reason}`,
        userId: request.escalatedBy,
        ipAddress: 'system',
        oldValues,
        newValues: {
          priority: complianceCase.priority,
          assignedTo: complianceCase.assignedTo,
          reason: request.reason,
          notes: request.escalationNotes,
        },
      });

      this.logger.log(`Case escalated successfully: ${request.caseId}`);

      return updatedCase;
    } catch (error) {
      this.logger.error(`Failed to escalate case: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get compliance case by ID
   */
  async getCase(caseId: string): Promise<ComplianceCase> {
    const complianceCase = await this.complianceCaseRepository.findOne({
      where: { id: caseId },
      relations: ['applicant', 'auditLogs'],
    });

    if (!complianceCase) {
      throw new NotFoundException(`Compliance case not found: ${caseId}`);
    }

    return complianceCase;
  }

  /**
   * Search and filter compliance cases
   */
  async searchCases(
    page: number = 1,
    limit: number = 20,
    filters: CaseSearchFilters = {}
  ): Promise<{
    cases: ComplianceCase[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const queryBuilder = this.complianceCaseRepository.createQueryBuilder('case')
      .leftJoinAndSelect('case.applicant', 'applicant');

    // Apply filters
    if (filters.status) {
      queryBuilder.andWhere('case.status = :status', { status: filters.status });
    }

    if (filters.priority) {
      queryBuilder.andWhere('case.priority = :priority', { priority: filters.priority });
    }

    if (filters.caseType) {
      queryBuilder.andWhere('case.caseType = :caseType', { caseType: filters.caseType });
    }

    if (filters.assignedTo) {
      queryBuilder.andWhere('case.assignedTo = :assignedTo', { assignedTo: filters.assignedTo });
    }

    if (filters.riskLevel) {
      queryBuilder.andWhere('case.riskLevel = :riskLevel', { riskLevel: filters.riskLevel });
    }

    if (filters.dateFrom) {
      queryBuilder.andWhere('case.createdAt >= :dateFrom', { dateFrom: filters.dateFrom });
    }

    if (filters.dateTo) {
      queryBuilder.andWhere('case.createdAt <= :dateTo', { dateTo: filters.dateTo });
    }

    if (filters.search) {
      queryBuilder.andWhere(
        '(case.title ILIKE :search OR case.description ILIKE :search OR case.caseNumber ILIKE :search)',
        { search: `%${filters.search}%` }
      );
    }

    // Get total count
    const total = await queryBuilder.getCount();

    // Apply pagination and ordering
    const offset = (page - 1) * limit;
    queryBuilder.skip(offset).take(limit);
    queryBuilder.orderBy('case.priority', 'DESC');
    queryBuilder.addOrderBy('case.createdAt', 'DESC');

    const cases = await queryBuilder.getMany();

    return {
      cases,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * Get case metrics and statistics
   */
  async getCaseMetrics(): Promise<CaseMetrics> {
    const [total, open, closed, overdue, byPriority, byType, byStatus, resolutionTimes, escalations] = await Promise.all([
      this.complianceCaseRepository.count(),
      this.complianceCaseRepository.count({ where: { status: CaseStatus.OPEN } }),
      this.complianceCaseRepository.count({ where: { status: CaseStatus.CLOSED } }),
      this.complianceCaseRepository.count({
        where: {
          status: CaseStatus.OPEN,
          dueDate: new Date(),
        },
      }),
      this.complianceCaseRepository
        .createQueryBuilder('case')
        .select('case.priority', 'priority')
        .addSelect('COUNT(*)', 'count')
        .groupBy('case.priority')
        .getRawMany(),
      this.complianceCaseRepository
        .createQueryBuilder('case')
        .select('case.caseType', 'caseType')
        .addSelect('COUNT(*)', 'count')
        .groupBy('case.caseType')
        .getRawMany(),
      this.complianceCaseRepository
        .createQueryBuilder('case')
        .select('case.status', 'status')
        .addSelect('COUNT(*)', 'count')
        .groupBy('case.status')
        .getRawMany(),
      this.complianceCaseRepository
        .createQueryBuilder('case')
        .select('AVG(EXTRACT(EPOCH FROM (case.decisionAt - case.createdAt))/3600)', 'avgHours')
        .where('case.status = :status', { status: CaseStatus.CLOSED })
        .andWhere('case.decisionAt IS NOT NULL')
        .getRawOne(),
      this.complianceCaseRepository.count({ where: { escalatedAt: null } }),
    ]);

    const priorityStats = byPriority.reduce((acc, item) => {
      acc[item.priority as CasePriority] = parseInt(item.count);
      return acc;
    }, {} as Record<CasePriority, number>);

    const typeStats = byType.reduce((acc, item) => {
      acc[item.caseType as CaseType] = parseInt(item.count);
      return acc;
    }, {} as Record<CaseType, number>);

    const statusStats = byStatus.reduce((acc, item) => {
      acc[item.status as CaseStatus] = parseInt(item.count);
      return acc;
    }, {} as Record<CaseStatus, number>);

    const averageResolutionTime = resolutionTimes?.avgHours || 0;
    const escalationRate = total > 0 ? (escalations / total) * 100 : 0;

    return {
      total,
      open,
      closed,
      overdue,
      byPriority: priorityStats,
      byType: typeStats,
      byStatus: statusStats,
      averageResolutionTime,
      escalationRate,
    };
  }

  /**
   * Get overdue cases
   */
  async getOverdueCases(): Promise<ComplianceCase[]> {
    return this.complianceCaseRepository.find({
      where: {
        status: CaseStatus.OPEN,
        dueDate: new Date(),
      },
      relations: ['applicant'],
      order: { priority: 'DESC', dueDate: 'ASC' },
    });
  }

  /**
   * Get cases assigned to a specific user
   */
  async getCasesByAssignee(assignedTo: string): Promise<ComplianceCase[]> {
    return this.complianceCaseRepository.find({
      where: { assignedTo, status: CaseStatus.OPEN },
      relations: ['applicant'],
      order: { priority: 'DESC', dueDate: 'ASC' },
    });
  }

  /**
   * Generate unique case number
   */
  private generateCaseNumber(caseType: CaseType): string {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substr(2, 6).toUpperCase();
    const typePrefix = caseType.split('_')[0].toUpperCase();
    
    return `${typePrefix}-${timestamp}-${random}`;
  }

  /**
   * Calculate default due date based on priority
   */
  private calculateDefaultDueDate(priority: CasePriority): Date {
    const now = new Date();
    
    switch (priority) {
      case CasePriority.CRITICAL:
        return new Date(now.getTime() + 4 * 60 * 60 * 1000); // 4 hours
      case CasePriority.HIGH:
        return new Date(now.getTime() + 24 * 60 * 60 * 1000); // 24 hours
      case CasePriority.MEDIUM:
        return new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000); // 3 days
      case CasePriority.LOW:
        return new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000); // 7 days
      default:
        return new Date(now.getTime() + 24 * 60 * 60 * 1000); // Default 24 hours
    }
  }

  /**
   * Calculate escalation date based on due date and priority
   */
  private calculateEscalationDate(dueDate: Date, priority: CasePriority): Date {
    const escalationHours = priority === CasePriority.CRITICAL ? 2 : 
                           priority === CasePriority.HIGH ? 6 : 
                           priority === CasePriority.MEDIUM ? 12 : 24;
    
    return new Date(dueDate.getTime() + escalationHours * 60 * 60 * 1000);
  }

  /**
   * Escalate priority level
   */
  private escalatePriority(currentPriority: CasePriority): CasePriority {
    switch (currentPriority) {
      case CasePriority.LOW:
        return CasePriority.MEDIUM;
      case CasePriority.MEDIUM:
        return CasePriority.HIGH;
      case CasePriority.HIGH:
        return CasePriority.CRITICAL;
      case CasePriority.CRITICAL:
        return CasePriority.CRITICAL; // Already at highest
      default:
        return CasePriority.HIGH;
    }
  }

  /**
   * Calculate resolution time in hours
   */
  private calculateResolutionTime(createdAt: Date, resolvedAt: Date): number {
    return Math.round((resolvedAt.getTime() - createdAt.getTime()) / (1000 * 60 * 60));
  }

  /**
   * Update applicant status based on case decision
   */
  private async updateApplicantStatus(applicant: KYCApplicant, decisionRequest: CaseDecisionRequest): Promise<void> {
    try {
      let newStatus: string;
      let reason: string;

      switch (decisionRequest.decision) {
        case DecisionType.APPROVE:
          newStatus = 'APPROVED';
          reason = 'Approved by compliance officer';
          break;
        case DecisionType.REJECT:
          newStatus = 'REJECTED';
          reason = decisionRequest.reason;
          break;
        case DecisionType.REQUIRES_MORE_INFO:
          newStatus = 'PENDING';
          reason = 'Additional information required';
          break;
        default:
          newStatus = 'PENDING';
          reason = 'Decision made, status pending';
      }

      await this.kycService.updateKYCStatus(applicant.id, {
        status: newStatus as any,
        reason,
        notes: decisionRequest.notes,
        updatedBy: decisionRequest.decisionBy,
      });
    } catch (error) {
      this.logger.error(`Failed to update applicant status: ${error.message}`);
      // Don't throw error as case decision should still be recorded
    }
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
