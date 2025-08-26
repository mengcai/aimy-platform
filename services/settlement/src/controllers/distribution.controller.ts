import { Controller, Get, Post, Put, Body, Param, Query, HttpStatus, HttpCode } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { DistributionService, CreateDistributionRequest, UpdateDistributionRequest } from '../services/distribution.service';

@ApiTags('Distributions')
@Controller('distributions')
export class DistributionController {
  constructor(private readonly distributionService: DistributionService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new distribution' })
  @ApiResponse({ status: 201, description: 'Distribution created successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 409, description: 'Distribution already exists' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async createDistribution(@Body() request: CreateDistributionRequest) {
    return this.distributionService.createDistribution(request);
  }

  @Get(':distributionId')
  @ApiOperation({ summary: 'Get distribution by ID' })
  @ApiResponse({ status: 200, description: 'Distribution retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Distribution not found' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async getDistribution(@Param('distributionId') distributionId: string) {
    return this.distributionService.getDistribution(distributionId);
  }

  @Put(':distributionId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Update an existing distribution' })
  @ApiResponse({ status: 200, description: 'Distribution updated successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 404, description: 'Distribution not found' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async updateDistribution(
    @Param('distributionId') distributionId: string,
    @Body() request: UpdateDistributionRequest
  ) {
    return this.distributionService.updateDistribution(distributionId, request);
  }

  @Get('by-asset/:assetId')
  @ApiOperation({ summary: 'Get distributions by asset ID' })
  @ApiResponse({ status: 200, description: 'Distributions retrieved successfully' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async getDistributionsByAsset(@Param('assetId') assetId: string) {
    return this.distributionService.getDistributionsByAsset(assetId);
  }

  @Get('by-status/:status')
  @ApiOperation({ summary: 'Get distributions by status' })
  @ApiResponse({ status: 200, description: 'Distributions retrieved successfully' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async getDistributionsByStatus(@Param('status') status: string) {
    return this.distributionService.getDistributionsByStatus(status as any);
  }

  @Get('scheduled/:date')
  @ApiOperation({ summary: 'Get pending distributions scheduled for a specific date' })
  @ApiResponse({ status: 200, description: 'Scheduled distributions retrieved successfully' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async getScheduledDistributions(@Param('date') date: string) {
    const targetDate = new Date(date);
    if (isNaN(targetDate.getTime())) {
      throw new Error('Invalid date format. Use YYYY-MM-DD');
    }
    return this.distributionService.getPendingDistributionsForDate(targetDate);
  }

  @Post(':distributionId/approve')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Approve a distribution' })
  @ApiResponse({ status: 200, description: 'Distribution approved successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 404, description: 'Distribution not found' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async approveDistribution(
    @Param('distributionId') distributionId: string,
    @Body() body: { approverId: string }
  ) {
    return this.distributionService.approveDistribution(distributionId, body.approverId);
  }

  @Post(':distributionId/cancel')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Cancel a distribution' })
  @ApiResponse({ status: 200, description: 'Distribution cancelled successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 404, description: 'Distribution not found' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async cancelDistribution(
    @Param('distributionId') distributionId: string,
    @Body() body: { reason: string; cancelledBy: string }
  ) {
    return this.distributionService.cancelDistribution(distributionId, body.reason, body.cancelledBy);
  }

  @Post(':distributionId/execute')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Execute a distribution' })
  @ApiResponse({ status: 200, description: 'Distribution executed successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 404, description: 'Distribution not found' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async executeDistribution(@Param('distributionId') distributionId: string) {
    return this.distributionService.executeDistribution(distributionId);
  }

  @Post('create-recurring')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Create recurring distribution instances' })
  @ApiResponse({ status: 200, description: 'Recurring distributions created successfully' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async createRecurringDistributions() {
    return this.distributionService.createRecurringDistributions();
  }

  @Get('stats/overview')
  @ApiOperation({ summary: 'Get distribution statistics overview' })
  @ApiResponse({ status: 200, description: 'Statistics retrieved successfully' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async getDistributionStats() {
    return this.distributionService.getDistributionStats();
  }

  @Get('search')
  @ApiQuery({ name: 'assetId', required: false })
  @ApiQuery({ name: 'status', required: false })
  @ApiQuery({ name: 'type', required: false })
  @ApiQuery({ name: 'frequency', required: false })
  @ApiQuery({ name: 'fromDate', required: false })
  @ApiQuery({ name: 'toDate', required: false })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'offset', required: false, type: Number })
  @ApiOperation({ summary: 'Search distributions with filters' })
  @ApiResponse({ status: 200, description: 'Distributions retrieved successfully' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async searchDistributions(
    @Query('assetId') assetId?: string,
    @Query('status') status?: string,
    @Query('type') type?: string,
    @Query('frequency') frequency?: string,
    @Query('fromDate') fromDate?: string,
    @Query('toDate') toDate?: string,
    @Query('limit') limit?: number,
    @Query('offset') offset?: number,
  ) {
    const filters: any = {
      assetId,
      status: status as any,
      type: type as any,
      frequency: frequency as any,
      limit,
      offset,
    };

    if (fromDate) {
      filters.fromDate = new Date(fromDate);
      if (isNaN(filters.fromDate.getTime())) {
        throw new Error('Invalid fromDate format. Use YYYY-MM-DD');
      }
    }

    if (toDate) {
      filters.toDate = new Date(toDate);
      if (isNaN(filters.toDate.getTime())) {
        throw new Error('Invalid toDate format. Use YYYY-MM-DD');
      }
    }

    if (filters.fromDate && filters.toDate && filters.fromDate > filters.toDate) {
      throw new Error('From date must be before or equal to to date');
    }

    return this.distributionService.searchDistributions(filters);
  }

  @Get('upcoming')
  @ApiQuery({ name: 'days', required: false, type: Number, description: 'Number of days to look ahead' })
  @ApiOperation({ summary: 'Get upcoming distributions' })
  @ApiResponse({ status: 200, description: 'Upcoming distributions retrieved successfully' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async getUpcomingDistributions(@Query('days') days: number = 30) {
    const fromDate = new Date();
    const toDate = new Date();
    toDate.setDate(toDate.getDate() + days);

    return this.distributionService.searchDistributions({
      fromDate,
      toDate,
      status: 'PENDING',
      limit: 50,
    });
  }

  @Get('pending/approval')
  @ApiOperation({ summary: 'Get distributions pending approval' })
  @ApiResponse({ status: 200, description: 'Pending approvals retrieved successfully' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async getPendingApprovals() {
    return this.distributionService.getDistributionsByStatus('PENDING');
  }

  @Get('executed/recent')
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiOperation({ summary: 'Get recently executed distributions' })
  @ApiResponse({ status: 200, description: 'Recent executions retrieved successfully' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async getRecentExecutions(@Query('limit') limit: number = 10) {
    const fromDate = new Date();
    fromDate.setDate(fromDate.getDate() - 30); // Last 30 days

    return this.distributionService.searchDistributions({
      fromDate,
      toDate: new Date(),
      status: 'EXECUTED',
      limit,
    });
  }
}
