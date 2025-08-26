import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuditLog, AuditAction, AuditLevel, AuditSource } from '../entities/audit-log.entity';
import { KYCApplicant } from '../entities/kyc-applicant.entity';
import { ComplianceCase } from '../entities/compliance-case.entity';
import { ScreeningResult } from '../entities/screening-result.entity';

export interface AuditSearchFilters {
  action?: AuditAction;
  level?: AuditLevel;
  source?: AuditSource;
  entityType?: string;
  entityId?: string;
  userId?: string;
  dateFrom?: Date;
  dateTo?: Date;
  search?: string;
}

export interface AuditMetrics {
  total: number;
  byAction: Record<AuditAction, number>;
  byLevel: Record<AuditLevel, number>;
  bySource: Record<AuditSource, number>;
  byEntityType: Record<string, number>;
  byUser: Record<string, number>;
  averagePerDay: number;
  highRiskActions: number;
}

export interface ComplianceReport {
  reportId: string;
  generatedAt: Date;
  period: {
    start: Date;
    end: Date;
  };
  summary: {
    totalActions: number;
    totalUsers: number;
    totalEntities: number;
    riskLevels: Record<string, number>;
  };
  actions: {
    byType: Record<AuditAction, number>;
    byUser: Record<string, number>;
    byEntity: Record<string, number>;
  };
  riskAnalysis: {
    highRiskActions: number;
    suspiciousPatterns: number;
    complianceViolations: number;
    recommendations: string[];
  };
  auditTrail: {
    entityType: string;
    entityId: string;
    actions: AuditLog[];
    riskScore: number;
    complianceScore: number;
  }[];
}

export interface AuditExportOptions {
  format: 'JSON' | 'CSV' | 'PDF';
  includeDetails: boolean;
  includeMetadata: boolean;
  dateRange?: {
    start: Date;
    end: Date;
  };
  filters?: AuditSearchFilters;
}

@Injectable()
export class AuditService {
  private readonly logger = new Logger(AuditService.name);

  constructor(
    @InjectRepository(AuditLog)
    private readonly auditLogRepository: Repository<AuditLog>,
    @InjectRepository(KYCApplicant)
    private readonly applicantRepository: Repository<KYCApplicant>,
    @InjectRepository(ComplianceCase)
    private readonly complianceCaseRepository: Repository<ComplianceCase>,
    @InjectRepository(ScreeningResult)
    private readonly screeningResultRepository: Repository<ScreeningResult>,
  ) {}

  /**
   * Create audit log entry
   */
  async createAuditLog(auditData: {
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
    metadata?: Record<string, any>;
  }): Promise<AuditLog> {
    try {
      const auditLog = this.auditLogRepository.create({
        ...auditData,
        timestamp: new Date(),
      });

      const savedLog = await this.auditLogRepository.save(auditLog);

      // Log high-risk actions immediately
      if (auditData.level === AuditLevel.ERROR || auditData.level === AuditLevel.WARNING) {
        this.logger.warn(`High-risk audit action: ${auditData.action} on ${auditData.entityType} ${auditData.entityId}`);
      }

      return savedLog;
    } catch (error) {
      this.logger.error(`Failed to create audit log: ${error.message}`);
      throw error;
    }
  }

  /**
   * Search audit logs with filters
   */
  async searchAuditLogs(
    page: number = 1,
    limit: number = 100,
    filters: AuditSearchFilters = {}
  ): Promise<{
    logs: AuditLog[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const queryBuilder = this.auditLogRepository.createQueryBuilder('audit');

    // Apply filters
    if (filters.action) {
      queryBuilder.andWhere('audit.action = :action', { action: filters.action });
    }

    if (filters.level) {
      queryBuilder.andWhere('audit.level = :level', { level: filters.level });
    }

    if (filters.source) {
      queryBuilder.andWhere('audit.source = :source', { source: filters.source });
    }

    if (filters.entityType) {
      queryBuilder.andWhere('audit.entityType = :entityType', { entityType: filters.entityType });
    }

    if (filters.entityId) {
      queryBuilder.andWhere('audit.entityId = :entityId', { entityId: filters.entityId });
    }

    if (filters.userId) {
      queryBuilder.andWhere('audit.userId = :userId', { userId: filters.userId });
    }

    if (filters.dateFrom) {
      queryBuilder.andWhere('audit.timestamp >= :dateFrom', { dateFrom: filters.dateFrom });
    }

    if (filters.dateTo) {
      queryBuilder.andWhere('audit.timestamp <= :dateTo', { dateTo: filters.dateTo });
    }

    if (filters.search) {
      queryBuilder.andWhere(
        '(audit.description ILIKE :search OR audit.entityType ILIKE :search OR audit.userId ILIKE :search)',
        { search: `%${filters.search}%` }
      );
    }

    // Get total count
    const total = await queryBuilder.getCount();

    // Apply pagination and ordering
    const offset = (page - 1) * limit;
    queryBuilder.skip(offset).take(limit);
    queryBuilder.orderBy('audit.timestamp', 'DESC');

    const logs = await queryBuilder.getMany();

    return {
      logs,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * Get audit log by ID
   */
  async getAuditLog(id: string): Promise<AuditLog> {
    const auditLog = await this.auditLogRepository.findOne({
      where: { id },
    });

    if (!auditLog) {
      throw new Error(`Audit log not found: ${id}`);
    }

    return auditLog;
  }

  /**
   * Get audit trail for a specific entity
   */
  async getEntityAuditTrail(
    entityType: string,
    entityId: string,
    limit: number = 100
  ): Promise<AuditLog[]> {
    return this.auditLogRepository.find({
      where: { entityType, entityId },
      order: { timestamp: 'DESC' },
      take: limit,
    });
  }

  /**
   * Get user activity audit trail
   */
  async getUserAuditTrail(
    userId: string,
    limit: number = 100
  ): Promise<AuditLog[]> {
    return this.auditLogRepository.find({
      where: { userId },
      order: { timestamp: 'DESC' },
      take: limit,
    });
  }

  /**
   * Get audit metrics and statistics
   */
  async getAuditMetrics(): Promise<AuditMetrics> {
    const [total, byAction, byLevel, bySource, byEntityType, byUser, dailyAverage, highRiskActions] = await Promise.all([
      this.auditLogRepository.count(),
      this.auditLogRepository
        .createQueryBuilder('audit')
        .select('audit.action', 'action')
        .addSelect('COUNT(*)', 'count')
        .groupBy('audit.action')
        .getRawMany(),
      this.auditLogRepository
        .createQueryBuilder('audit')
        .select('audit.level', 'level')
        .addSelect('COUNT(*)', 'count')
        .groupBy('audit.level')
        .getRawMany(),
      this.auditLogRepository
        .createQueryBuilder('audit')
        .select('audit.source', 'source')
        .addSelect('COUNT(*)', 'count')
        .groupBy('audit.source')
        .getRawMany(),
      this.auditLogRepository
        .createQueryBuilder('audit')
        .select('audit.entityType', 'entityType')
        .addSelect('COUNT(*)', 'count')
        .groupBy('audit.entityType')
        .getRawMany(),
      this.auditLogRepository
        .createQueryBuilder('audit')
        .select('audit.userId', 'userId')
        .addSelect('COUNT(*)', 'count')
        .groupBy('audit.userId')
        .getRawMany(),
      this.auditLogRepository
        .createQueryBuilder('audit')
        .select('COUNT(*) / GREATEST(DATE_PART(\'day\', NOW() - audit.timestamp), 1)', 'avgPerDay')
        .where('audit.timestamp >= NOW() - INTERVAL \'30 days\'')
        .getRawOne(),
      this.auditLogRepository.count({
        where: {
          level: AuditLevel.ERROR,
        },
      }),
    ]);

    const actionStats = byAction.reduce((acc, item) => {
      acc[item.action as AuditAction] = parseInt(item.count);
      return acc;
    }, {} as Record<AuditAction, number>);

    const levelStats = byLevel.reduce((acc, item) => {
      acc[item.level as AuditLevel] = parseInt(item.count);
      return acc;
    }, {} as Record<AuditLevel, number>);

    const sourceStats = bySource.reduce((acc, item) => {
      acc[item.source as AuditSource] = parseInt(item.count);
      return acc;
    }, {} as Record<AuditSource, number>);

    const entityTypeStats = byEntityType.reduce((acc, item) => {
      acc[item.entityType] = parseInt(item.count);
      return acc;
    }, {} as Record<string, number>);

    const userStats = byUser.reduce((acc, item) => {
      acc[item.userId] = parseInt(item.count);
      return acc;
    }, {} as Record<string, number>);

    const averagePerDay = dailyAverage?.avgPerDay || 0;

    return {
      total,
      byAction: actionStats,
      byLevel: levelStats,
      bySource: sourceStats,
      byEntityType: entityTypeStats,
      byUser: userStats,
      averagePerDay,
      highRiskActions,
    };
  }

  /**
   * Generate comprehensive compliance report
   */
  async generateComplianceReport(
    startDate: Date,
    endDate: Date
  ): Promise<ComplianceReport> {
    this.logger.log(`Generating compliance report for period: ${startDate} to ${endDate}`);

    try {
      // Get audit logs for the period
      const auditLogs = await this.auditLogRepository.find({
        where: {
          timestamp: {
            start: startDate,
            end: endDate,
          },
        },
        order: { timestamp: 'ASC' },
      });

      // Get metrics for the period
      const metrics = await this.getAuditMetrics();

      // Analyze risk levels
      const riskLevels = this.analyzeRiskLevels(auditLogs);

      // Generate summary
      const summary = {
        totalActions: auditLogs.length,
        totalUsers: Object.keys(metrics.byUser).length,
        totalEntities: Object.keys(metrics.byEntityType).length,
        riskLevels,
      };

      // Analyze actions
      const actions = {
        byType: metrics.byAction,
        byUser: metrics.byUser,
        byEntity: metrics.byEntityType,
      };

      // Risk analysis
      const riskAnalysis = this.performRiskAnalysis(auditLogs);

      // Generate audit trail by entity
      const auditTrail = await this.generateEntityAuditTrail(auditLogs);

      const report: ComplianceReport = {
        reportId: `REPORT-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        generatedAt: new Date(),
        period: { start: startDate, end: endDate },
        summary,
        actions,
        riskAnalysis,
        auditTrail,
      };

      this.logger.log(`Compliance report generated successfully: ${report.reportId}`);

      return report;
    } catch (error) {
      this.logger.error(`Failed to generate compliance report: ${error.message}`);
      throw error;
    }
  }

  /**
   * Analyze risk levels from audit logs
   */
  private analyzeRiskLevels(auditLogs: AuditLog[]): Record<string, number> {
    const riskLevels: Record<string, number> = {
      LOW: 0,
      MEDIUM: 0,
      HIGH: 0,
      CRITICAL: 0,
    };

    auditLogs.forEach(log => {
      switch (log.level) {
        case AuditLevel.INFO:
          riskLevels.LOW++;
          break;
        case AuditLevel.WARNING:
          riskLevels.MEDIUM++;
          break;
        case AuditLevel.ERROR:
          riskLevels.HIGH++;
          break;
        default:
          riskLevels.LOW++;
      }
    });

    return riskLevels;
  }

  /**
   * Perform risk analysis on audit logs
   */
  private performRiskAnalysis(auditLogs: AuditLog[]): {
    highRiskActions: number;
    suspiciousPatterns: number;
    complianceViolations: number;
    recommendations: string[];
  } {
    let highRiskActions = 0;
    let suspiciousPatterns = 0;
    let complianceViolations = 0;
    const recommendations: string[] = [];

    // Count high-risk actions
    highRiskActions = auditLogs.filter(log => 
      log.level === AuditLevel.ERROR || log.level === AuditLevel.WARNING
    ).length;

    // Detect suspicious patterns
    const userActionCounts = new Map<string, number>();
    const entityActionCounts = new Map<string, number>();

    auditLogs.forEach(log => {
      // Count actions per user
      const userCount = userActionCounts.get(log.userId) || 0;
      userActionCounts.set(log.userId, userCount + 1);

      // Count actions per entity
      const entityKey = `${log.entityType}:${log.entityId}`;
      const entityCount = entityActionCounts.get(entityKey) || 0;
      entityActionCounts.set(entityKey, entityCount + 1);
    });

    // Check for suspicious patterns
    userActionCounts.forEach((count, userId) => {
      if (count > 100) { // More than 100 actions in the period
        suspiciousPatterns++;
        recommendations.push(`User ${userId} has unusually high activity (${count} actions)`);
      }
    });

    entityActionCounts.forEach((count, entityKey) => {
      if (count > 50) { // More than 50 actions on one entity
        suspiciousPatterns++;
        recommendations.push(`Entity ${entityKey} has unusually high activity (${count} actions)`);
      }
    });

    // Count compliance violations
    complianceViolations = auditLogs.filter(log => 
      log.action === AuditAction.VIOLATION || 
      log.description.toLowerCase().includes('violation') ||
      log.description.toLowerCase().includes('blocked')
    ).length;

    // Add general recommendations
    if (highRiskActions > 0) {
      recommendations.push(`Review ${highRiskActions} high-risk actions for compliance violations`);
    }

    if (suspiciousPatterns > 0) {
      recommendations.push(`Investigate ${suspiciousPatterns} suspicious activity patterns`);
    }

    if (complianceViolations > 0) {
      recommendations.push(`Address ${complianceViolations} compliance violations`);
    }

    if (recommendations.length === 0) {
      recommendations.push('No immediate action required - all activities appear normal');
    }

    return {
      highRiskActions,
      suspiciousPatterns,
      complianceViolations,
      recommendations,
    };
  }

  /**
   * Generate audit trail grouped by entity
   */
  private async generateEntityAuditTrail(auditLogs: AuditLog[]): Promise<{
    entityType: string;
    entityId: string;
    actions: AuditLog[];
    riskScore: number;
    complianceScore: number;
  }[]> {
    const entityGroups = new Map<string, AuditLog[]>();

    // Group logs by entity
    auditLogs.forEach(log => {
      const key = `${log.entityType}:${log.entityId}`;
      if (!entityGroups.has(key)) {
        entityGroups.set(key, []);
      }
      entityGroups.get(key)!.push(log);
    });

    const auditTrail: any[] = [];

    for (const [key, logs] of entityGroups) {
      const [entityType, entityId] = key.split(':');
      
      // Calculate risk and compliance scores
      const riskScore = this.calculateEntityRiskScore(logs);
      const complianceScore = this.calculateEntityComplianceScore(logs);

      auditTrail.push({
        entityType,
        entityId,
        actions: logs.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime()),
        riskScore,
        complianceScore,
      });
    }

    // Sort by risk score (highest first)
    return auditTrail.sort((a, b) => b.riskScore - a.riskScore);
  }

  /**
   * Calculate risk score for an entity based on its audit logs
   */
  private calculateEntityRiskScore(logs: AuditLog[]): number {
    let riskScore = 0;

    logs.forEach(log => {
      switch (log.level) {
        case AuditLevel.INFO:
          riskScore += 1;
          break;
        case AuditLevel.WARNING:
          riskScore += 5;
          break;
        case AuditLevel.ERROR:
          riskScore += 10;
          break;
        default:
          riskScore += 1;
      }

      // Additional risk factors
      if (log.action === AuditAction.VIOLATION) {
        riskScore += 20;
      }

      if (log.action === AuditAction.BLOCK) {
        riskScore += 15;
      }

      if (log.description.toLowerCase().includes('sanction') || 
          log.description.toLowerCase().includes('blocked')) {
        riskScore += 25;
      }
    });

    return Math.min(100, riskScore);
  }

  /**
   * Calculate compliance score for an entity based on its audit logs
   */
  private calculateEntityComplianceScore(logs: AuditLog[]): number {
    let complianceScore = 100;

    logs.forEach(log => {
      switch (log.level) {
        case AuditLevel.WARNING:
          complianceScore -= 5;
          break;
        case AuditLevel.ERROR:
          complianceScore -= 15;
          break;
      }

      if (log.action === AuditAction.VIOLATION) {
        complianceScore -= 25;
      }

      if (log.action === AuditAction.BLOCK) {
        complianceScore -= 20;
      }
    });

    return Math.max(0, complianceScore);
  }

  /**
   * Export audit data in various formats
   */
  async exportAuditData(options: AuditExportOptions): Promise<string | Buffer> {
    this.logger.log(`Exporting audit data in ${options.format} format`);

    try {
      // Get audit logs based on options
      const filters = options.filters || {};
      const dateRange = options.dateRange;
      
      if (dateRange) {
        filters.dateFrom = dateRange.start;
        filters.dateTo = dateRange.end;
      }

      const { logs } = await this.searchAuditLogs(1, 10000, filters);

      switch (options.format) {
        case 'JSON':
          return this.exportToJSON(logs, options);
        case 'CSV':
          return this.exportToCSV(logs, options);
        case 'PDF':
          return this.exportToPDF(logs, options);
        default:
          throw new Error(`Unsupported export format: ${options.format}`);
      }
    } catch (error) {
      this.logger.error(`Failed to export audit data: ${error.message}`);
      throw error;
    }
  }

  /**
   * Export to JSON format
   */
  private exportToJSON(logs: AuditLog[], options: AuditExportOptions): string {
    const exportData = logs.map(log => {
      const baseData = {
        id: log.id,
        action: log.action,
        level: log.level,
        source: log.source,
        entityType: log.entityType,
        entityId: log.entityId,
        description: log.description,
        userId: log.userId,
        timestamp: log.timestamp,
        ipAddress: log.ipAddress,
      };

      if (options.includeDetails) {
        Object.assign(baseData, {
          oldValues: log.oldValues,
          newValues: log.newValues,
        });
      }

      if (options.includeMetadata) {
        Object.assign(baseData, {
          metadata: log.metadata,
        });
      }

      return baseData;
    });

    return JSON.stringify(exportData, null, 2);
  }

  /**
   * Export to CSV format
   */
  private exportToCSV(logs: AuditLog[], options: AuditExportOptions): string {
    const headers = [
      'ID',
      'Action',
      'Level',
      'Source',
      'Entity Type',
      'Entity ID',
      'Description',
      'User ID',
      'Timestamp',
      'IP Address',
    ];

    if (options.includeDetails) {
      headers.push('Old Values', 'New Values');
    }

    if (options.includeMetadata) {
      headers.push('Metadata');
    }

    const csvRows = [headers.join(',')];

    logs.forEach(log => {
      const row = [
        log.id,
        log.action,
        log.level,
        log.source,
        log.entityType,
        log.entityId,
        `"${log.description.replace(/"/g, '""')}"`,
        log.userId,
        log.timestamp.toISOString(),
        log.ipAddress,
      ];

      if (options.includeDetails) {
        row.push(
          log.oldValues ? `"${JSON.stringify(log.oldValues).replace(/"/g, '""')}"` : '',
          log.newValues ? `"${JSON.stringify(log.newValues).replace(/"/g, '""')}"` : ''
        );
      }

      if (options.includeMetadata) {
        row.push(log.metadata ? `"${JSON.stringify(log.metadata).replace(/"/g, '""')}"` : '');
      }

      csvRows.push(row.join(','));
    });

    return csvRows.join('\n');
  }

  /**
   * Export to PDF format (placeholder)
   */
  private exportToPDF(logs: AuditLog[], options: AuditExportOptions): Buffer {
    // This would typically use a PDF generation library
    // For now, return a placeholder buffer
    const placeholder = `PDF Export - ${logs.length} audit logs\nGenerated at ${new Date().toISOString()}`;
    return Buffer.from(placeholder, 'utf-8');
  }

  /**
   * Clean up old audit logs
   */
  async cleanupOldAuditLogs(retentionDays: number = 365): Promise<number> {
    this.logger.log(`Cleaning up audit logs older than ${retentionDays} days`);

    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - retentionDays);

      const oldLogs = await this.auditLogRepository.find({
        where: {
          timestamp: cutoffDate,
        },
      });

      let deletedCount = 0;
      for (const log of oldLogs) {
        try {
          await this.auditLogRepository.remove(log);
          deletedCount++;
        } catch (error) {
          this.logger.warn(`Failed to delete old audit log: ${log.id}`);
        }
      }

      this.logger.log(`Cleaned up ${deletedCount} old audit logs`);
      return deletedCount;
    } catch (error) {
      this.logger.error(`Failed to cleanup old audit logs: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get audit log statistics for dashboard
   */
  async getDashboardStats(): Promise<{
    recentActivity: number;
    highRiskActions: number;
    complianceScore: number;
    topUsers: Array<{ userId: string; actionCount: number }>;
    topEntities: Array<{ entityType: string; entityId: string; actionCount: number }>;
  }> {
    try {
      const [recentActivity, highRiskActions, metrics] = await Promise.all([
        this.auditLogRepository.count({
          where: {
            timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000), // Last 24 hours
          },
        }),
        this.auditLogRepository.count({
          where: {
            level: AuditLevel.ERROR,
            timestamp: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // Last 7 days
          },
        }),
        this.getAuditMetrics(),
      ]);

      // Calculate compliance score
      const totalActions = metrics.total;
      const errorActions = metrics.byLevel[AuditLevel.ERROR] || 0;
      const warningActions = metrics.byLevel[AuditLevel.WARNING] || 0;
      const complianceScore = totalActions > 0 ? 
        Math.max(0, 100 - ((errorActions * 20 + warningActions * 10) / totalActions) * 100) : 100;

      // Get top users
      const topUsers = Object.entries(metrics.byUser)
        .map(([userId, actionCount]) => ({ userId, actionCount }))
        .sort((a, b) => b.actionCount - a.actionCount)
        .slice(0, 10);

      // Get top entities
      const topEntities = Object.entries(metrics.byEntityType)
        .map(([entityType, actionCount]) => ({ entityType, entityId: 'N/A', actionCount }))
        .sort((a, b) => b.actionCount - a.actionCount)
        .slice(0, 10);

      return {
        recentActivity,
        highRiskActions,
        complianceScore: Math.round(complianceScore),
        topUsers,
        topEntities,
      };
    } catch (error) {
      this.logger.error(`Failed to get dashboard stats: ${error.message}`);
      throw error;
    }
  }
}
