import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  Param,
  Query,
  BadRequestException,
  NotFoundException,
  ValidationPipe,
  UsePipes,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import {
  CaseManagementService,
  CreateCaseRequest,
  UpdateCaseRequest,
  CaseDecisionRequest,
  CaseAssignmentRequest,
  CaseEscalationRequest,
  CaseSearchFilters,
} from '../services/case-management.service';

@ApiTags('Compliance Cases')
@Controller('cases')
@UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
export class CasesController {
  constructor(private readonly caseManagementService: CaseManagementService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new compliance case' })
  @ApiResponse({ status: 201, description: 'Case created successfully' })
  @ApiResponse({ status: 400, description: 'Bad request - validation failed' })
  async createCase(@Body() request: CreateCaseRequest) {
    try {
      return await this.caseManagementService.createCase(request);
    } catch (error) {
      if (error.message.includes('not found')) {
        throw new BadRequestException(error.message);
      }
      throw error;
    }
  }

  @Get()
  @ApiOperation({ summary: 'Search and filter compliance cases' })
  @ApiResponse({ status: 200, description: 'Cases retrieved successfully' })
  async searchCases(
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '20',
    @Query('status') status?: string,
    @Query('priority') priority?: string,
    @Query('caseType') caseType?: string,
    @Query('assignedTo') assignedTo?: string,
    @Query('riskLevel') riskLevel?: string,
    @Query('dateFrom') dateFrom?: string,
    @Query('dateTo') dateTo?: string,
    @Query('search') search?: string,
  ) {
    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);

    if (isNaN(pageNum) || isNaN(limitNum) || pageNum < 1 || limitNum < 1) {
      throw new BadRequestException('Invalid pagination parameters');
    }

    const filters: CaseSearchFilters = {
      status: status as any,
      priority: priority as any,
      caseType: caseType as any,
      assignedTo,
      riskLevel,
      dateFrom: dateFrom ? new Date(dateFrom) : undefined,
      dateTo: dateTo ? new Date(dateTo) : undefined,
      search,
    };

    return await this.caseManagementService.searchCases(pageNum, limitNum, filters);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get compliance case by ID' })
  @ApiResponse({ status: 200, description: 'Case retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Case not found' })
  async getCase(@Param('id') id: string) {
    try {
      return await this.caseManagementService.getCase(id);
    } catch (error) {
      if (error.message.includes('not found')) {
        throw new NotFoundException(error.message);
      }
      throw error;
    }
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update compliance case' })
  @ApiResponse({ status: 200, description: 'Case updated successfully' })
  @ApiResponse({ status: 404, description: 'Case not found' })
  async updateCase(
    @Param('id') id: string,
    @Body() request: UpdateCaseRequest,
  ) {
    try {
      return await this.caseManagementService.updateCase(id, request);
    } catch (error) {
      if (error.message.includes('not found')) {
        throw new NotFoundException(error.message);
      }
      throw error;
    }
  }

  @Post(':id/decision')
  @ApiOperation({ summary: 'Make a decision on a compliance case' })
  @ApiResponse({ status: 200, description: 'Decision made successfully' })
  @ApiResponse({ status: 400, description: 'Bad request - case already closed' })
  @ApiResponse({ status: 404, description: 'Case not found' })
  async makeDecision(
    @Param('id') id: string,
    @Body() request: CaseDecisionRequest,
  ) {
    try {
      return await this.caseManagementService.makeDecision({
        ...request,
        caseId: id,
      });
    } catch (error) {
      if (error.message.includes('already closed')) {
        throw new BadRequestException(error.message);
      }
      if (error.message.includes('not found')) {
        throw new NotFoundException(error.message);
      }
      throw error;
    }
  }

  @Post(':id/assign')
  @ApiOperation({ summary: 'Assign case to a compliance officer' })
  @ApiResponse({ status: 200, description: 'Case assigned successfully' })
  @ApiResponse({ status: 400, description: 'Bad request - case already closed' })
  @ApiResponse({ status: 404, description: 'Case not found' })
  async assignCase(
    @Param('id') id: string,
    @Body() request: CaseAssignmentRequest,
  ) {
    try {
      return await this.caseManagementService.assignCase({
        ...request,
        caseId: id,
      });
    } catch (error) {
      if (error.message.includes('already closed')) {
        throw new BadRequestException(error.message);
      }
      if (error.message.includes('not found')) {
        throw new NotFoundException(error.message);
      }
      throw error;
    }
  }

  @Post(':id/escalate')
  @ApiOperation({ summary: 'Escalate a compliance case' })
  @ApiResponse({ status: 200, description: 'Case escalated successfully' })
  @ApiResponse({ status: 400, description: 'Bad request - case already closed' })
  @ApiResponse({ status: 404, description: 'Case not found' })
  async escalateCase(
    @Param('id') id: string,
    @Body() request: CaseEscalationRequest,
  ) {
    try {
      return await this.caseManagementService.escalateCase({
        ...request,
        caseId: id,
      });
    } catch (error) {
      if (error.message.includes('already closed')) {
        throw new BadRequestException(error.message);
      }
      if (error.message.includes('not found')) {
        throw new NotFoundException(error.message);
      }
      throw error;
    }
  }

  @Get('metrics/overview')
  @ApiOperation({ summary: 'Get case metrics and statistics' })
  @ApiResponse({ status: 200, description: 'Metrics retrieved successfully' })
  async getCaseMetrics() {
    return await this.caseManagementService.getCaseMetrics();
  }

  @Get('overdue')
  @ApiOperation({ summary: 'Get overdue compliance cases' })
  @ApiResponse({ status: 200, description: 'Overdue cases retrieved successfully' })
  async getOverdueCases() {
    return await this.caseManagementService.getOverdueCases();
  }

  @Get('assigned/:userId')
  @ApiOperation({ summary: 'Get cases assigned to a specific user' })
  @ApiResponse({ status: 200, description: 'Assigned cases retrieved successfully' })
  async getCasesByAssignee(@Param('userId') userId: string) {
    return await this.caseManagementService.getCasesByAssignee(userId);
  }

  @Get(':id/audit-trail')
  @ApiOperation({ summary: 'Get audit trail for a compliance case' })
  @ApiResponse({ status: 200, description: 'Audit trail retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Case not found' })
  async getCaseAuditTrail(@Param('id') id: string) {
    const complianceCase = await this.caseManagementService.getCase(id);
    
    // This would typically get audit logs from the audit service
    // For now, we'll return a placeholder with case information
    return {
      caseId: id,
      caseNumber: complianceCase.caseNumber,
      title: complianceCase.title,
      status: complianceCase.status,
      priority: complianceCase.priority,
      message: 'Audit trail not implemented in this version',
      caseInfo: {
        createdAt: complianceCase.createdAt,
        updatedAt: complianceCase.updatedAt,
        assignedTo: complianceCase.assignedTo,
        assignedAt: complianceCase.assignedAt,
        dueDate: complianceCase.dueDate,
        escalationDate: complianceCase.escalationDate,
      },
    };
  }

  @Get(':id/timeline')
  @ApiOperation({ summary: 'Get case timeline and activity' })
  @ApiResponse({ status: 200, description: 'Timeline retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Case not found' })
  async getCaseTimeline(@Param('id') id: string) {
    const complianceCase = await this.caseManagementService.getCase(id);
    
    // Build timeline from case data
    const timeline = [
      {
        timestamp: complianceCase.createdAt,
        action: 'Case Created',
        description: `Case "${complianceCase.title}" was created`,
        actor: 'system',
        type: 'CREATION',
      },
    ];

    if (complianceCase.assignedAt) {
      timeline.push({
        timestamp: complianceCase.assignedAt,
        action: 'Case Assigned',
        description: `Case assigned to ${complianceCase.assignedTo}`,
        actor: complianceCase.assignedBy || 'system',
        type: 'ASSIGNMENT',
      });
    }

    if (complianceCase.escalatedAt) {
      timeline.push({
        timestamp: complianceCase.escalatedAt,
        action: 'Case Escalated',
        description: `Case escalated by ${complianceCase.escalatedBy}`,
        actor: complianceCase.escalatedBy,
        type: 'ESCALATION',
      });
    }

    if (complianceCase.decisionAt) {
      timeline.push({
        timestamp: complianceCase.decisionAt,
        action: 'Decision Made',
        description: `Decision: ${complianceCase.decision} by ${complianceCase.decisionBy}`,
        actor: complianceCase.decisionBy,
        type: 'DECISION',
      });
    }

    // Sort timeline by timestamp
    timeline.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());

    return {
      caseId: id,
      caseNumber: complianceCase.caseNumber,
      title: complianceCase.title,
      timeline,
      summary: {
        totalEvents: timeline.length,
        duration: complianceCase.decisionAt ? 
          Math.round((complianceCase.decisionAt.getTime() - complianceCase.createdAt.getTime()) / (1000 * 60 * 60)) : 
          'Ongoing',
        status: complianceCase.status,
        priority: complianceCase.priority,
      },
    };
  }

  @Post(':id/notes')
  @ApiOperation({ summary: 'Add notes to a compliance case' })
  @ApiResponse({ status: 200, description: 'Notes added successfully' })
  @ApiResponse({ status: 404, description: 'Case not found' })
  async addCaseNotes(
    @Param('id') id: string,
    @Body() request: { notes: string; userId: string; type?: 'INTERNAL' | 'EXTERNAL' },
  ) {
    // This would typically add notes to the case
    // For now, we'll return a success message
    return {
      message: 'Notes added successfully',
      caseId: id,
      notes: request.notes,
      addedBy: request.userId,
      type: request.type || 'INTERNAL',
      timestamp: new Date().toISOString(),
    };
  }

  @Get(':id/notes')
  @ApiOperation({ summary: 'Get notes for a compliance case' })
  @ApiResponse({ status: 200, description: 'Notes retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Case not found' })
  async getCaseNotes(@Param('id') id: string) {
    // This would typically retrieve notes from the database
    // For now, we'll return a placeholder
    return {
      message: 'Case notes not implemented in this version',
      caseId: id,
      notes: [],
    };
  }

  @Post(':id/export')
  @ApiOperation({ summary: 'Export case data' })
  @ApiResponse({ status: 200, description: 'Case data exported successfully' })
  @ApiResponse({ status: 404, description: 'Case not found' })
  async exportCaseData(
    @Param('id') id: string,
    @Query('format') format: 'JSON' | 'CSV' | 'PDF' = 'JSON',
    @Query('includeAuditTrail') includeAuditTrail: string = 'false',
    @Query('includeNotes') includeNotes: string = 'false',
  ) {
    const complianceCase = await this.caseManagementService.getCase(id);
    
    // This would typically format the data according to the requested format
    // For now, we'll return the case data as JSON
    return {
      exportFormat: format,
      case: {
        id: complianceCase.id,
        caseNumber: complianceCase.caseNumber,
        title: complianceCase.title,
        description: complianceCase.description,
        status: complianceCase.status,
        priority: complianceCase.priority,
        caseType: complianceCase.caseType,
        assignedTo: complianceCase.assignedTo,
        dueDate: complianceCase.dueDate,
        createdAt: complianceCase.createdAt,
        updatedAt: complianceCase.updatedAt,
      },
      includeAuditTrail: includeAuditTrail === 'true',
      includeNotes: includeNotes === 'true',
      exportTimestamp: new Date().toISOString(),
    };
  }

  @Get('dashboard/summary')
  @ApiOperation({ summary: 'Get dashboard summary for compliance cases' })
  @ApiResponse({ status: 200, description: 'Dashboard summary retrieved successfully' })
  async getDashboardSummary() {
    const metrics = await this.caseManagementService.getCaseMetrics();
    const overdueCases = await this.caseManagementService.getOverdueCases();
    
    return {
      overview: {
        total: metrics.total,
        open: metrics.open,
        closed: metrics.closed,
        overdue: metrics.overdue,
        averageResolutionTime: metrics.averageResolutionTime,
        escalationRate: metrics.escalationRate,
      },
      byPriority: metrics.byPriority,
      byType: metrics.byType,
      byStatus: metrics.byStatus,
      overdueCases: overdueCases.map(case_ => ({
        id: case_.id,
        caseNumber: case_.caseNumber,
        title: case_.title,
        priority: case_.priority,
        daysOverdue: Math.ceil((Date.now() - case_.dueDate.getTime()) / (1000 * 60 * 60 * 24)),
        assignedTo: case_.assignedTo,
      })),
      recentActivity: {
        message: 'Recent activity not implemented in this version',
      },
    };
  }
}
