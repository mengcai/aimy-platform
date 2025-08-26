import { Injectable, Logger } from '@nestjs/common';
import { WalletRegistryService } from './wallet-registry.service';
import { DistributionService } from './distribution.service';
import { PayoutService } from './payout.service';
import { WithholdingService } from './withholding.service';
import { FeeService } from './fee.service';
import { ReceiptService } from './receipt.service';
import { StablecoinAdapterService } from '../adapters/stablecoin-adapter';

export interface SettlementSummary {
  totalDistributions: number;
  totalPayouts: number;
  totalAmount: number;
  totalWithholding: number;
  totalFees: number;
  totalNetAmount: number;
  activeWallets: number;
  pendingDistributions: number;
  recentActivity: {
    distributions: any[];
    payouts: any[];
    receipts: any[];
  };
}

export interface SettlementHealthCheck {
  status: 'healthy' | 'degraded' | 'unhealthy';
  checks: {
    database: boolean;
    stablecoinAdapters: boolean;
    services: boolean;
    scheduledTasks: boolean;
  };
  details: Record<string, any>;
  timestamp: Date;
}

@Injectable()
export class SettlementService {
  private readonly logger = new Logger(SettlementService.name);

  constructor(
    private readonly walletRegistry: WalletRegistryService,
    private readonly distributionService: DistributionService,
    private readonly payoutService: PayoutService,
    private readonly withholdingService: WithholdingService,
    private readonly feeService: FeeService,
    private readonly receiptService: ReceiptService,
    private readonly stablecoinAdapter: StablecoinAdapterService,
  ) {}

  /**
   * Get comprehensive settlement summary
   */
  async getSettlementSummary(): Promise<SettlementSummary> {
    this.logger.log('Generating settlement summary');

    try {
      const [
        walletStats,
        distributionStats,
        receiptStats,
        recentDistributions,
        recentPayouts,
        recentReceipts,
      ] = await Promise.all([
        this.walletRegistry.getWalletStats(),
        this.distributionService.getDistributionStats(),
        this.receiptService.getReceiptStats(),
        this.distributionService.searchDistributions({ limit: 5 }),
        this.getRecentPayouts(5),
        this.receiptService.searchReceipts({ limit: 5 }),
      ]);

      const summary: SettlementSummary = {
        totalDistributions: distributionStats.total,
        totalPayouts: receiptStats.total,
        totalAmount: distributionStats.totalAmount,
        totalWithholding: receiptStats.totalAmount * 0.15, // Mock calculation
        totalFees: receiptStats.totalAmount * 0.02, // Mock calculation
        totalNetAmount: receiptStats.totalAmount * 0.83, // Mock calculation
        activeWallets: walletStats.active,
        pendingDistributions: distributionStats.pending,
        recentActivity: {
          distributions: recentDistributions.distributions,
          payouts: recentPayouts,
          receipts: recentReceipts.receipts,
        },
      };

      this.logger.log('Generated settlement summary successfully');
      return summary;

    } catch (error) {
      this.logger.error(`Failed to generate settlement summary: ${error.message}`);
      throw error;
    }
  }

  /**
   * Execute a complete settlement workflow
   */
  async executeSettlementWorkflow(distributionId: string): Promise<{
    success: boolean;
    distributionId: string;
    payoutRunId?: string;
    receiptsGenerated: number;
    totalAmount: number;
    errors?: string[];
  }> {
    this.logger.log(`Executing settlement workflow for distribution ${distributionId}`);

    try {
      // 1. Execute distribution
      const distributionResult = await this.distributionService.executeDistribution(distributionId);

      if (!distributionResult.success) {
        throw new Error(`Distribution execution failed: ${distributionResult.errors?.join(', ')}`);
      }

      // 2. Generate receipts for the payout run
      const receiptResult = await this.receiptService.bulkGenerateReceipts(
        distributionResult.payoutRunId!,
        { format: 'pdf' }
      );

      if (!receiptResult.success) {
        this.logger.warn(`Some receipts failed to generate: ${receiptResult.errors?.join(', ')}`);
      }

      this.logger.log(`Settlement workflow completed for distribution ${distributionId}`);

      return {
        success: true,
        distributionId: distributionResult.distributionId,
        payoutRunId: distributionResult.payoutRunId,
        receiptsGenerated: receiptResult.generated,
        totalAmount: distributionResult.totalAmount,
        errors: receiptResult.errors,
      };

    } catch (error) {
      this.logger.error(`Settlement workflow failed for distribution ${distributionId}: ${error.message}`);

      return {
        success: false,
        distributionId,
        receiptsGenerated: 0,
        totalAmount: 0,
        errors: [error.message],
      };
    }
  }

  /**
   * Process scheduled distributions for a specific date
   */
  async processScheduledDistributions(date: Date): Promise<{
    processed: number;
    successful: number;
    failed: number;
    errors: string[];
  }> {
    this.logger.log(`Processing scheduled distributions for ${date.toISOString().split('T')[0]}`);

    const results = {
      processed: 0,
      successful: 0,
      failed: 0,
      errors: [],
    };

    try {
      // Get pending distributions for the date
      const pendingDistributions = await this.distributionService.getPendingDistributionsForDate(date);

      if (pendingDistributions.length === 0) {
        this.logger.log('No pending distributions found for the specified date');
        return results;
      }

      this.logger.log(`Found ${pendingDistributions.length} pending distributions to process`);

      // Process each distribution
      for (const distribution of pendingDistributions) {
        try {
          results.processed++;

          // Check if distribution is ready for execution
          if (distribution.status !== 'PENDING') {
            this.logger.warn(`Distribution ${distribution.id} is not in PENDING status: ${distribution.status}`);
            continue;
          }

          // Execute the distribution
          const result = await this.executeSettlementWorkflow(distribution.id);

          if (result.success) {
            results.successful++;
            this.logger.log(`Successfully processed distribution ${distribution.id}`);
          } else {
            results.failed++;
            results.errors.push(`Distribution ${distribution.id}: ${result.errors?.join(', ')}`);
            this.logger.error(`Failed to process distribution ${distribution.id}`);
          }

        } catch (error) {
          results.failed++;
          results.errors.push(`Distribution ${distribution.id}: ${error.message}`);
          this.logger.error(`Error processing distribution ${distribution.id}: ${error.message}`);
        }
      }

      this.logger.log(`Processed ${results.processed} distributions: ${results.successful} successful, ${results.failed} failed`);

    } catch (error) {
      this.logger.error(`Failed to process scheduled distributions: ${error.message}`);
      results.errors.push(`General error: ${error.message}`);
    }

    return results;
  }

  /**
   * Reconcile settlement data
   */
  async reconcileSettlementData(
    fromDate: Date,
    toDate: Date
  ): Promise<{
    success: boolean;
    reconciliationDate: Date;
    summary: {
      totalDistributions: number;
      totalPayouts: number;
      totalReceipts: number;
      discrepancies: any[];
    };
    details: Record<string, any>;
  }> {
    this.logger.log(`Reconciling settlement data from ${fromDate.toISOString()} to ${toDate.toISOString()}`);

    try {
      // Get distributions in date range
      const distributions = await this.distributionService.searchDistributions({
        fromDate,
        toDate,
        status: 'EXECUTED',
      });

      // Get receipts in date range
      const receipts = await this.receiptService.searchReceipts({
        fromDate,
        toDate,
      });

      // Calculate totals
      const totalDistributions = distributions.total;
      const totalPayouts = receipts.total;
      const totalReceipts = receipts.total;

      // Calculate amounts
      const totalDistributedAmount = distributions.distributions.reduce(
        (sum, dist) => sum + (dist.distributed_amount || 0),
        0
      );

      const totalReceiptAmount = receipts.receipts.reduce(
        (sum, receipt) => sum + (receipt.net_amount || 0),
        0
      );

      // Check for discrepancies
      const discrepancies = [];
      const amountDifference = Math.abs(totalDistributedAmount - totalReceiptAmount);

      if (amountDifference > 0.01) { // Allow for small rounding differences
        discrepancies.push({
          type: 'AMOUNT_MISMATCH',
          description: `Distributed amount (${totalDistributedAmount}) does not match receipt amount (${totalReceiptAmount})`,
          difference: amountDifference,
        });
      }

      if (totalDistributions !== totalPayouts) {
        discrepancies.push({
          type: 'COUNT_MISMATCH',
          description: `Distribution count (${totalDistributions}) does not match payout count (${totalPayouts})`,
          difference: Math.abs(totalDistributions - totalPayouts),
        });
      }

      const reconciliationResult = {
        success: discrepancies.length === 0,
        reconciliationDate: new Date(),
        summary: {
          totalDistributions,
          totalPayouts,
          totalReceipts,
          discrepancies,
        },
        details: {
          totalDistributedAmount,
          totalReceiptAmount,
          amountDifference,
          distributions: distributions.distributions.map(d => ({
            id: d.id,
            assetName: d.asset_name,
            amount: d.distributed_amount,
            executedDate: d.executed_date,
          })),
          receipts: receipts.receipts.map(r => ({
            id: r.id,
            receiptNumber: r.metadata?.receipt_number,
            amount: r.net_amount,
            createdDate: r.created_at,
          })),
        },
      };

      this.logger.log(`Reconciliation completed: ${discrepancies.length} discrepancies found`);
      return reconciliationResult;

    } catch (error) {
      this.logger.error(`Reconciliation failed: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get settlement health status
   */
  async getHealthCheck(): Promise<SettlementHealthCheck> {
    this.logger.log('Performing settlement health check');

    const healthCheck: SettlementHealthCheck = {
      status: 'healthy',
      checks: {
        database: true,
        stablecoinAdapters: true,
        services: true,
        scheduledTasks: true,
      },
      details: {},
      timestamp: new Date(),
    };

    try {
      // Check database connectivity
      try {
        await this.walletRegistry.getWalletStats();
        healthCheck.checks.database = true;
      } catch (error) {
        healthCheck.checks.database = false;
        healthCheck.status = 'degraded';
        healthCheck.details.databaseError = error.message;
      }

      // Check stablecoin adapters
      try {
        const adaptersInfo = await this.stablecoinAdapter.getAdaptersInfo();
        healthCheck.checks.stablecoinAdapters = true;
        healthCheck.details.adapters = adaptersInfo;
      } catch (error) {
        healthCheck.checks.stablecoinAdapters = false;
        healthCheck.status = 'degraded';
        healthCheck.details.adapterError = error.message;
      }

      // Check service health
      try {
        const walletStats = await this.walletRegistry.getWalletStats();
        const distributionStats = await this.distributionService.getDistributionStats();
        healthCheck.checks.services = true;
        healthCheck.details.stats = {
          wallets: walletStats,
          distributions: distributionStats,
        };
      } catch (error) {
        healthCheck.checks.services = false;
        healthCheck.status = 'degraded';
        healthCheck.details.serviceError = error.message;
      }

      // Determine overall status
      const failedChecks = Object.values(healthCheck.checks).filter(check => !check).length;
      if (failedChecks === 0) {
        healthCheck.status = 'healthy';
      } else if (failedChecks === 1) {
        healthCheck.status = 'degraded';
      } else {
        healthCheck.status = 'unhealthy';
      }

      this.logger.log(`Health check completed: ${healthCheck.status}`);

    } catch (error) {
      this.logger.error(`Health check failed: ${error.message}`);
      healthCheck.status = 'unhealthy';
      healthCheck.details.generalError = error.message;
    }

    return healthCheck;
  }

  /**
   * Get recent payouts
   */
  private async getRecentPayouts(limit: number): Promise<any[]> {
    // This would typically query the payout run repository
    // For now, return mock data
    return [
      {
        id: 'payout-1',
        distributionId: 'dist-1',
        status: 'COMPLETED',
        totalRecipients: 150,
        totalAmount: 50000,
        executedAt: new Date(),
      },
      {
        id: 'payout-2',
        distributionId: 'dist-2',
        status: 'IN_PROGRESS',
        totalRecipients: 75,
        totalAmount: 25000,
        executedAt: new Date(),
      },
    ].slice(0, limit);
  }

  /**
   * Generate settlement report
   */
  async generateSettlementReport(
    fromDate: Date,
    toDate: Date,
    format: 'json' | 'csv' = 'json'
  ): Promise<string> {
    this.logger.log(`Generating settlement report from ${fromDate.toISOString()} to ${toDate.toISOString()}`);

    try {
      const [
        distributions,
        receipts,
        walletStats,
        reconciliation,
      ] = await Promise.all([
        this.distributionService.searchDistributions({ fromDate, toDate }),
        this.receiptService.searchReceipts({ fromDate, toDate }),
        this.walletRegistry.getWalletStats(),
        this.reconcileSettlementData(fromDate, toDate),
      ]);

      const report = {
        reportPeriod: {
          from: fromDate.toISOString(),
          to: toDate.toISOString(),
        },
        summary: {
          totalDistributions: distributions.total,
          totalPayouts: receipts.total,
          totalAmount: distributions.distributions.reduce((sum, d) => sum + (d.total_amount || 0), 0),
          totalDistributed: distributions.distributions.reduce((sum, d) => sum + (d.distributed_amount || 0), 0),
          totalReceipts: receipts.total,
          totalReceiptAmount: receipts.receipts.reduce((sum, r) => sum + (r.net_amount || 0), 0),
        },
        walletStats,
        reconciliation: reconciliation.summary,
        distributions: distributions.distributions.map(d => ({
          id: d.id,
          assetName: d.asset_name,
          type: d.distribution_type,
          status: d.status,
          totalAmount: d.total_amount,
          distributedAmount: d.distributed_amount,
          scheduledDate: d.scheduled_date,
          executedDate: d.executed_date,
        })),
        receipts: receipts.receipts.map(r => ({
          id: r.id,
          receiptNumber: r.metadata?.receipt_number,
          investorId: r.investor_id,
          assetId: r.asset_id,
          grossAmount: r.gross_amount,
          netAmount: r.net_amount,
          createdDate: r.created_at,
        })),
        generatedAt: new Date().toISOString(),
      };

      if (format === 'csv') {
        return this.convertReportToCSV(report);
      }

      return JSON.stringify(report, null, 2);

    } catch (error) {
      this.logger.error(`Failed to generate settlement report: ${error.message}`);
      throw error;
    }
  }

  /**
   * Convert report to CSV format
   */
  private convertReportToCSV(report: any): string {
    const lines = [];

    // Summary section
    lines.push('SETTLEMENT REPORT SUMMARY');
    lines.push(`Period: ${report.reportPeriod.from} to ${report.reportPeriod.to}`);
    lines.push(`Total Distributions: ${report.summary.totalDistributions}`);
    lines.push(`Total Payouts: ${report.summary.totalPayouts}`);
    lines.push(`Total Amount: ${report.summary.totalAmount}`);
    lines.push(`Total Distributed: ${report.summary.totalDistributed}`);
    lines.push('');

    // Distributions section
    lines.push('DISTRIBUTIONS');
    lines.push('ID,Asset Name,Type,Status,Total Amount,Distributed Amount,Scheduled Date,Executed Date');
    report.distributions.forEach((d: any) => {
      lines.push(`${d.id},${d.assetName},${d.type},${d.status},${d.totalAmount},${d.distributedAmount},${d.scheduledDate},${d.executedDate}`);
    });
    lines.push('');

    // Receipts section
    lines.push('RECEIPTS');
    lines.push('ID,Receipt Number,Investor ID,Asset ID,Gross Amount,Net Amount,Created Date');
    report.receipts.forEach((r: any) => {
      lines.push(`${r.id},${r.receiptNumber || ''},${r.investorId},${r.assetId},${r.grossAmount},${r.netAmount},${r.createdDate}`);
    });

    return lines.join('\n');
  }
}
