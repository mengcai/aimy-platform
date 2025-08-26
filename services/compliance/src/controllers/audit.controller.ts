import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  BadRequestException,
  ValidationPipe,
  UsePipes,
  Res,
  HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import {
  AuditService,
  AuditSearchFilters,
  ComplianceReport,
  AuditExportOptions,
} from '../services/audit.service';

@ApiTags('Audit & Compliance')
@Controller('audit')
@UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
export class AuditController {
  constructor(private readonly auditService: AuditService) {}

  @Get('logs')
  @ApiOperation({ summary: 'Search and filter audit logs' })
  @ApiResponse({ status: 200, description: 'Audit logs retrieved successfully' })
  @ApiQuery({ name: 'page', required: false, type: String, description: 'Page number' })
  @ApiQuery({ name: 'limit', required: false, type: String, description: 'Items per page' })
  @ApiQuery({ name: 'action', required: false, type: String, description: 'Filter by action type' })
  @ApiQuery({ name: 'level', required: false, type: String, description: 'Filter by log level' })
  @ApiQuery({ name: 'source', required: false, type: String, description: 'Filter by source' })
  @ApiQuery({ name: 'entityType', required: false, type: String, description: 'Filter by entity type' })
  @ApiQuery({ name: 'entityId', required: false, type: String, description: 'Filter by entity ID' })
  @ApiQuery({ name: 'userId', required: false, type: String, description: 'Filter by user ID' })
  @ApiQuery({ name: 'dateFrom', required: false, type: String, description: 'Filter from date (ISO string)' })
  @ApiQuery({ name: 'dateTo', required: false, type: String, description: 'Filter to date (ISO string)' })
  @ApiQuery({ name: 'search', required: false, type: String, description: 'Search in description and entity fields' })
  async searchAuditLogs(
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '100',
    @Query('action') action?: string,
    @Query('level') level?: string,
    @Query('source') source?: string,
    @Query('entityType') entityType?: string,
    @Query('entityId') entityId?: string,
    @Query('userId') userId?: string,
    @Query('dateFrom') dateFrom?: string,
    @Query('dateTo') dateTo?: string,
    @Query('search') search?: string,
  ) {
    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);

    if (isNaN(pageNum) || isNaN(limitNum) || pageNum < 1 || limitNum < 1) {
      throw new BadRequestException('Invalid pagination parameters');
    }

    if (limitNum > 1000) {
      throw new BadRequestException('Maximum limit is 1000');
    }

    const filters: AuditSearchFilters = {
      action: action as any,
      level: level as any,
      source: source as any,
      entityType,
      entityId,
      userId,
      dateFrom: dateFrom ? new Date(dateFrom) : undefined,
      dateTo: dateTo ? new Date(dateTo) : undefined,
      search,
    };

    return await this.auditService.searchAuditLogs(pageNum, limitNum, filters);
  }

  @Get('logs/:id')
  @ApiOperation({ summary: 'Get audit log by ID' })
  @ApiResponse({ status: 200, description: 'Audit log retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Audit log not found' })
  async getAuditLog(@Param('id') id: string) {
    try {
      return await this.auditService.getAuditLog(id);
    } catch (error) {
      if (error.message.includes('not found')) {
        throw new BadRequestException(error.message);
      }
      throw error;
    }
  }

  @Get('logs/entity/:entityType/:entityId')
  @ApiOperation({ summary: 'Get audit trail for a specific entity' })
  @ApiResponse({ status: 200, description: 'Entity audit trail retrieved successfully' })
  @ApiQuery({ name: 'limit', required: false, type: String, description: 'Maximum number of logs to return' })
  async getEntityAuditTrail(
    @Param('entityType') entityType: string,
    @Param('entityId') entityId: string,
    @Query('limit') limit: string = '100',
  ) {
    const limitNum = parseInt(limit, 10);
    if (isNaN(limitNum) || limitNum < 1) {
      throw new BadRequestException('Invalid limit parameter');
    }

    if (limitNum > 1000) {
      throw new BadRequestException('Maximum limit is 1000');
    }

    return await this.auditService.getEntityAuditTrail(entityType, entityId, limitNum);
  }

  @Get('logs/user/:userId')
  @ApiOperation({ summary: 'Get audit trail for a specific user' })
  @ApiResponse({ status: 200, description: 'User audit trail retrieved successfully' })
  @ApiQuery({ name: 'limit', required: false, type: String, description: 'Maximum number of logs to return' })
  async getUserAuditTrail(
    @Param('userId') userId: string,
    @Query('limit') limit: string = '100',
  ) {
    const limitNum = parseInt(limit, 10);
    if (isNaN(limitNum) || limitNum < 1) {
      throw new BadRequestException('Invalid limit parameter');
    }

    if (limitNum > 1000) {
      throw new BadRequestException('Maximum limit is 1000');
    }

    return await this.auditService.getUserAuditTrail(userId, limitNum);
  }

  @Get('metrics')
  @ApiOperation({ summary: 'Get audit metrics and statistics' })
  @ApiResponse({ status: 200, description: 'Audit metrics retrieved successfully' })
  async getAuditMetrics() {
    return await this.auditService.getAuditMetrics();
  }

  @Post('reports/generate')
  @ApiOperation({ summary: 'Generate compliance report for a date range' })
  @ApiResponse({ status: 201, description: 'Compliance report generated successfully' })
  @ApiResponse({ status: 400, description: 'Bad request - invalid date range' })
  async generateComplianceReport(
    @Body() request: { startDate: string; endDate: string },
  ) {
    try {
      if (!request.startDate || !request.endDate) {
        throw new BadRequestException('Start date and end date are required');
      }

      const startDate = new Date(request.startDate);
      const endDate = new Date(request.endDate);

      if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
        throw new BadRequestException('Invalid date format');
      }

      if (startDate >= endDate) {
        throw new BadRequestException('Start date must be before end date');
      }

      // Check if date range is reasonable (not more than 1 year)
      const oneYearAgo = new Date();
      oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
      
      if (startDate < oneYearAgo) {
        throw new BadRequestException('Start date cannot be more than 1 year ago');
      }

      return await this.auditService.generateComplianceReport(startDate, endDate);
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException(`Failed to generate compliance report: ${error.message}`);
    }
  }

  @Get('reports/:reportId')
  @ApiOperation({ summary: 'Get compliance report by ID' })
  @ApiResponse({ status: 200, description: 'Compliance report retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Report not found' })
  async getComplianceReport(@Param('reportId') reportId: string) {
    // This would typically retrieve a stored report
    // For now, we'll return a placeholder
    return {
      message: 'Compliance report retrieval not implemented in this version',
      reportId,
      timestamp: new Date().toISOString(),
    };
  }

  @Post('export')
  @ApiOperation({ summary: 'Export audit data in various formats' })
  @ApiResponse({ status: 200, description: 'Audit data exported successfully' })
  @ApiResponse({ status: 400, description: 'Bad request - invalid export options' })
  async exportAuditData(
    @Body() options: AuditExportOptions,
    @Res() res: Response,
  ) {
    try {
      if (!options.format || !['JSON', 'CSV', 'PDF'].includes(options.format)) {
        throw new BadRequestException('Valid export format is required: JSON, CSV, or PDF');
      }

      const exportData = await this.auditService.exportAuditData(options);

      // Set appropriate headers based on format
      let contentType: string;
      let filename: string;

      switch (options.format) {
        case 'JSON':
          contentType = 'application/json';
          filename = `audit-export-${Date.now()}.json`;
          break;
        case 'CSV':
          contentType = 'text/csv';
          filename = `audit-export-${Date.now()}.csv`;
          break;
        case 'PDF':
          contentType = 'application/pdf';
          filename = `audit-export-${Date.now()}.pdf`;
          break;
        default:
          contentType = 'application/octet-stream';
          filename = `audit-export-${Date.now()}`;
      }

      res.setHeader('Content-Type', contentType);
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      res.setHeader('Content-Length', Buffer.byteLength(exportData as string));

      if (options.format === 'JSON') {
        res.json(exportData);
      } else {
        res.send(exportData);
      }
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException(`Failed to export audit data: ${error.message}`);
    }
  }

  @Get('dashboard/stats')
  @ApiOperation({ summary: 'Get dashboard statistics for audit logs' })
  @ApiResponse({ status: 200, description: 'Dashboard stats retrieved successfully' })
  async getDashboardStats() {
    return await this.auditService.getDashboardStats();
  }

  @Get('logs/recent')
  @ApiOperation({ summary: 'Get recent audit logs for dashboard' })
  @ApiResponse({ status: 200, description: 'Recent audit logs retrieved successfully' })
  @ApiQuery({ name: 'limit', required: false, type: String, description: 'Number of recent logs to return' })
  async getRecentAuditLogs(@Query('limit') limit: string = '50') {
    const limitNum = parseInt(limit, 10);
    if (isNaN(limitNum) || limitNum < 1 || limitNum > 100) {
      throw new BadRequestException('Limit must be between 1 and 100');
    }

    const { logs } = await this.auditService.searchAuditLogs(1, limitNum);
    return logs;
  }

  @Get('logs/high-risk')
  @ApiOperation({ summary: 'Get high-risk audit logs' })
  @ApiResponse({ status: 200, description: 'High-risk audit logs retrieved successfully' })
  @ApiQuery({ name: 'limit', required: false, type: String, description: 'Number of high-risk logs to return' })
  async getHighRiskAuditLogs(@Query('limit') limit: string = '50') {
    const limitNum = parseInt(limit, 10);
    if (isNaN(limitNum) || limitNum < 1 || limitNum > 100) {
      throw new BadRequestException('Limit must be between 1 and 100');
    }

    const { logs } = await this.auditService.searchAuditLogs(1, limitNum, {
      level: 'ERROR',
    });

    return logs;
  }

  @Post('logs/cleanup')
  @ApiOperation({ summary: 'Clean up old audit logs' })
  @ApiResponse({ status: 200, description: 'Cleanup completed successfully' })
  @ApiQuery({ name: 'retentionDays', required: false, type: String, description: 'Number of days to retain logs' })
  async cleanupOldAuditLogs(@Query('retentionDays') retentionDays: string = '365') {
    const retentionDaysNum = parseInt(retentionDays, 10);
    if (isNaN(retentionDaysNum) || retentionDaysNum < 30) {
      throw new BadRequestException('Retention days must be at least 30');
    }

    if (retentionDaysNum > 3650) { // 10 years max
      throw new BadRequestException('Retention days cannot exceed 3650 (10 years)');
    }

    const deletedCount = await this.auditService.cleanupExpiredScreenings();
    
    return {
      message: 'Audit log cleanup completed',
      deletedCount,
      retentionDays: retentionDaysNum,
      timestamp: new Date().toISOString(),
    };
  }

  @Get('logs/activity-summary')
  @ApiOperation({ summary: 'Get activity summary for audit logs' })
  @ApiResponse({ status: 200, description: 'Activity summary retrieved successfully' })
  @ApiQuery({ name: 'days', required: false, type: String, description: 'Number of days to summarize' })
  async getActivitySummary(@Query('days') days: string = '30') {
    const daysNum = parseInt(days, 10);
    if (isNaN(daysNum) || daysNum < 1 || daysNum > 365) {
      throw new BadRequestException('Days must be between 1 and 365');
    }

    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - daysNum);

    const { logs } = await this.auditService.searchAuditLogs(1, 10000, {
      dateFrom: startDate,
      dateTo: endDate,
    });

    // Group by date and action type
    const activitySummary = new Map<string, Map<string, number>>();
    
    logs.forEach(log => {
      const dateKey = log.timestamp.toISOString().split('T')[0];
      const actionKey = log.action;
      
      if (!activitySummary.has(dateKey)) {
        activitySummary.set(dateKey, new Map());
      }
      
      const dateMap = activitySummary.get(dateKey)!;
      dateMap.set(actionKey, (dateMap.get(actionKey) || 0) + 1);
    });

    // Convert to array format
    const summary = Array.from(activitySummary.entries()).map(([date, actions]) => ({
      date,
      actions: Object.fromEntries(actions),
      total: Array.from(actions.values()).reduce((sum, count) => sum + count, 0),
    }));

    // Sort by date
    summary.sort((a, b) => a.date.localeCompare(b.date));

    return {
      period: {
        start: startDate.toISOString(),
        end: endDate.toISOString(),
        days: daysNum,
      },
      summary,
      totalLogs: logs.length,
      uniqueDates: summary.length,
      averageLogsPerDay: logs.length / daysNum,
    };
  }

  @Get('logs/entity-summary')
  @ApiOperation({ summary: 'Get entity activity summary' })
  @ApiResponse({ status: 200, description: 'Entity summary retrieved successfully' })
  @ApiQuery({ name: 'limit', required: false, type: String, description: 'Number of top entities to return' })
  async getEntitySummary(@Query('limit') limit: string = '20') {
    const limitNum = parseInt(limit, 10);
    if (isNaN(limitNum) || limitNum < 1 || limitNum > 100) {
      throw new BadRequestException('Limit must be between 1 and 100');
    }

    const metrics = await this.auditService.getAuditMetrics();
    
    // Convert entity type counts to array and sort by count
    const entitySummary = Object.entries(metrics.byEntityType)
      .map(([entityType, count]) => ({ entityType, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, limitNum);

    return {
      topEntities: entitySummary,
      totalEntities: Object.keys(metrics.byEntityType).length,
      totalActions: metrics.total,
      timestamp: new Date().toISOString(),
    };
  }

  @Get('logs/user-summary')
  @ApiOperation({ summary: 'Get user activity summary' })
  @ApiResponse({ status: 200, description: 'User summary retrieved successfully' })
  @ApiQuery({ name: 'limit', required: false, type: String, description: 'Number of top users to return' })
  async getUserSummary(@Query('limit') limit: string = '20') {
    const limitNum = parseInt(limit, 10);
    if (isNaN(limitNum) || limitNum < 1 || limitNum > 100) {
      throw new BadRequestException('Limit must be between 1 and 100');
    }

    const metrics = await this.auditService.getAuditMetrics();
    
    // Convert user counts to array and sort by count
    const userSummary = Object.entries(metrics.byUser)
      .map(([userId, count]) => ({ userId, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, limitNum);

    return {
      topUsers: userSummary,
      totalUsers: Object.keys(metrics.byUser).length,
      totalActions: metrics.total,
      averageActionsPerUser: metrics.total / Object.keys(metrics.byUser).length,
      timestamp: new Date().toISOString(),
    };
  }
}
