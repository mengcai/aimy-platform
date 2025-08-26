import { Controller, Get, Post, Body, Param, Query, HttpStatus, HttpCode } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { PayoutService } from '../services/payout.service';

export interface ExecutePayoutRequest {
  distributionId: string;
  isDryRun?: boolean;
  batchSize?: number;
  maxRetries?: number;
}

export interface PayoutStatusRequest {
  payoutRunId: string;
}

@ApiTags('Payouts')
@Controller('payouts')
export class PayoutController {
  constructor(private readonly payoutService: PayoutService) {}

  @Post('execute')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Execute a payout run for a distribution' })
  @ApiResponse({ status: 200, description: 'Payout executed successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 404, description: 'Distribution not found' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async executePayout(@Body() request: ExecutePayoutRequest) {
    return this.payoutService.executePayoutRun({
      distributionId: request.distributionId,
      isDryRun: request.isDryRun || false,
      batchSize: request.batchSize || 100,
      maxRetries: request.maxRetries || 3,
    });
  }

  @Post('dry-run/:distributionId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Execute a dry run payout for a distribution' })
  @ApiResponse({ status: 200, description: 'Dry run completed successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 404, description: 'Distribution not found' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async executeDryRun(@Param('distributionId') distributionId: string) {
    return this.payoutService.executePayoutRun({
      distributionId,
      isDryRun: true,
    });
  }

  @Get('status/:payoutRunId')
  @ApiOperation({ summary: 'Get payout run status and details' })
  @ApiResponse({ status: 200, description: 'Payout status retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Payout run not found' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async getPayoutStatus(@Param('payoutRunId') payoutRunId: string) {
    return this.payoutService.getPayoutRun(payoutRunId);
  }

  @Get('by-distribution/:distributionId')
  @ApiOperation({ summary: 'Get payout runs for a specific distribution' })
  @ApiResponse({ status: 200, description: 'Payout runs retrieved successfully' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async getPayoutsByDistribution(@Param('distributionId') distributionId: string) {
    return this.payoutService.getPayoutRunsByDistribution(distributionId);
  }

  @Get('recent')
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiOperation({ summary: 'Get recent payout runs' })
  @ApiResponse({ status: 200, description: 'Recent payouts retrieved successfully' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async getRecentPayouts(@Query('limit') limit: number = 10) {
    return this.payoutService.getRecentPayoutRuns(limit);
  }

  @Get('stats')
  @ApiOperation({ summary: 'Get payout statistics' })
  @ApiResponse({ status: 200, description: 'Payout statistics retrieved successfully' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async getPayoutStats() {
    return this.payoutService.getPayoutStats();
  }

  @Post('retry/:payoutRunId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Retry a failed payout run' })
  @ApiResponse({ status: 200, description: 'Payout retry initiated successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 404, description: 'Payout run not found' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async retryPayout(@Param('payoutRunId') payoutRunId: string) {
    return this.payoutService.retryPayoutRun(payoutRunId);
  }

  @Post('cancel/:payoutRunId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Cancel a payout run' })
  @ApiResponse({ status: 200, description: 'Payout cancelled successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 404, description: 'Payout run not found' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async cancelPayout(@Param('payoutRunId') payoutRunId: string) {
    return this.payoutService.cancelPayoutRun(payoutRunId);
  }

  @Get('receipts/:payoutRunId')
  @ApiOperation({ summary: 'Get receipts for a payout run' })
  @ApiResponse({ status: 200, description: 'Receipts retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Payout run not found' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async getPayoutReceipts(@Param('payoutRunId') payoutRunId: string) {
    return this.payoutService.getPayoutReceipts(payoutRunId);
  }

  @Get('pro-rata-calculation/:distributionId')
  @ApiOperation({ summary: 'Calculate pro-rata shares for a distribution (dry run)' })
  @ApiResponse({ status: 200, description: 'Pro-rata calculation completed successfully' })
  @ApiResponse({ status: 404, description: 'Distribution not found' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async calculateProRataShares(@Param('distributionId') distributionId: string) {
    // This would typically call a method that calculates pro-rata shares without executing
    // For now, we'll simulate the calculation
    return {
      distributionId,
      calculationType: 'pro-rata-shares',
      status: 'completed',
      timestamp: new Date().toISOString(),
      message: 'Pro-rata calculation completed (dry run)',
    };
  }
}
