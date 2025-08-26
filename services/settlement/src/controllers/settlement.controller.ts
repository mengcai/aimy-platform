import { Controller, Get, Post, Body, Param, Query, HttpStatus, HttpCode } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { SettlementService, SettlementSummary, SettlementHealthCheck } from '../services/settlement.service';

export interface GenerateReportRequest {
  fromDate: string;
  toDate: string;
  format?: 'json' | 'csv';
}

export interface ReconciliationRequest {
  fromDate: string;
  toDate: string;
}

@ApiTags('Settlement')
@Controller('settlement')
export class SettlementController {
  constructor(private readonly settlementService: SettlementService) {}

  @Get('summary')
  @ApiOperation({ summary: 'Get settlement summary' })
  @ApiResponse({ status: 200, description: 'Settlement summary retrieved successfully' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async getSettlementSummary(): Promise<SettlementSummary> {
    return this.settlementService.getSettlementSummary();
  }

  @Get('health')
  @ApiOperation({ summary: 'Get settlement service health status' })
  @ApiResponse({ status: 200, description: 'Health check completed' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async getHealthCheck(): Promise<SettlementHealthCheck> {
    return this.settlementService.getHealthCheck();
  }

  @Post('workflow/:distributionId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Execute complete settlement workflow for a distribution' })
  @ApiResponse({ status: 200, description: 'Settlement workflow executed successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 404, description: 'Distribution not found' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async executeSettlementWorkflow(@Param('distributionId') distributionId: string) {
    return this.settlementService.executeSettlementWorkflow(distributionId);
  }

  @Post('process-scheduled/:date')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Process scheduled distributions for a specific date' })
  @ApiResponse({ status: 200, description: 'Scheduled distributions processed successfully' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async processScheduledDistributions(@Param('date') date: string) {
    const targetDate = new Date(date);
    if (isNaN(targetDate.getTime())) {
      throw new Error('Invalid date format. Use YYYY-MM-DD');
    }
    return this.settlementService.processScheduledDistributions(targetDate);
  }

  @Post('reconcile')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Reconcile settlement data for a date range' })
  @ApiResponse({ status: 200, description: 'Reconciliation completed successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async reconcileSettlementData(@Body() request: ReconciliationRequest) {
    const fromDate = new Date(request.fromDate);
    const toDate = new Date(request.toDate);

    if (isNaN(fromDate.getTime()) || isNaN(toDate.getTime())) {
      throw new Error('Invalid date format. Use YYYY-MM-DD');
    }

    if (fromDate > toDate) {
      throw new Error('From date must be before or equal to to date');
    }

    return this.settlementService.reconcileSettlementData(fromDate, toDate);
  }

  @Post('report')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Generate settlement report for a date range' })
  @ApiResponse({ status: 200, description: 'Report generated successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async generateSettlementReport(@Body() request: GenerateReportRequest) {
    const fromDate = new Date(request.fromDate);
    const toDate = new Date(request.toDate);

    if (isNaN(fromDate.getTime()) || isNaN(toDate.getTime())) {
      throw new Error('Invalid date format. Use YYYY-MM-DD');
    }

    if (fromDate > toDate) {
      throw new Error('From date must be before or equal to to date');
    }

    const format = request.format || 'json';
    return this.settlementService.generateSettlementReport(fromDate, toDate, format);
  }

  @Get('report/:fromDate/:toDate')
  @ApiOperation({ summary: 'Generate settlement report for a date range (GET method)' })
  @ApiQuery({ name: 'format', required: false, enum: ['json', 'csv'] })
  @ApiResponse({ status: 200, description: 'Report generated successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async generateSettlementReportGet(
    @Param('fromDate') fromDate: string,
    @Param('toDate') toDate: string,
    @Query('format') format: 'json' | 'csv' = 'json'
  ) {
    const from = new Date(fromDate);
    const to = new Date(toDate);

    if (isNaN(from.getTime()) || isNaN(to.getTime())) {
      throw new Error('Invalid date format. Use YYYY-MM-DD');
    }

    if (from > to) {
      throw new Error('From date must be before or equal to to date');
    }

    return this.settlementService.generateSettlementReport(from, to, format);
  }
}
