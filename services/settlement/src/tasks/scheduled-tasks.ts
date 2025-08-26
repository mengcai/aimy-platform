import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { DistributionService } from '../services/distribution.service';
import { FeeService } from '../services/fee.service';
import { PayoutService } from '../services/payout.service';

@Injectable()
export class ScheduledTasks {
  private readonly logger = new Logger(ScheduledTasks.name);

  constructor(
    private readonly distributionService: DistributionService,
    private readonly feeService: FeeService,
    private readonly payoutService: PayoutService,
  ) {}

  /**
   * Daily task to check for scheduled distributions
   * Runs at 9:00 AM UTC every day
   */
  @Cron(CronExpression.EVERY_DAY_AT_9AM)
  async handleScheduledDistributions() {
    this.logger.log('Starting scheduled distributions check');
    
    try {
      const scheduledDistributions = await this.distributionService.getScheduledDistributions();
      
      if (scheduledDistributions.length === 0) {
        this.logger.log('No scheduled distributions found for today');
        return;
      }

      this.logger.log(`Found ${scheduledDistributions.length} scheduled distributions`);

      for (const distribution of scheduledDistributions) {
        try {
          this.logger.log(`Processing scheduled distribution: ${distribution.id} - ${distribution.asset_name}`);
          
          // Execute payout run
          const result = await this.payoutService.executePayoutRun({
            distributionId: distribution.id,
            isDryRun: false,
            initiatedBy: 'SYSTEM_SCHEDULED',
          });

          this.logger.log(`Distribution ${distribution.id} completed: ${result.successfulPayouts} successful, ${result.failedPayouts} failed`);

          // Update distribution status
          await this.distributionService.updateDistributionStatus(
            distribution.id,
            'COMPLETED',
            {
              executed_date: new Date(),
              payout_run_id: result.payoutRunId,
            }
          );

        } catch (error) {
          this.logger.error(`Failed to process scheduled distribution ${distribution.id}: ${error.message}`);
          
          // Update distribution status to failed
          await this.distributionService.updateDistributionStatus(
            distribution.id,
            'FAILED',
            {
              error_logs: [{ timestamp: new Date(), error: error.message }],
            }
          );
        }
      }

    } catch (error) {
      this.logger.error(`Scheduled distributions task failed: ${error.message}`, error.stack);
    }
  }

  /**
   * Hourly task to check for overdue fees
   * Runs every hour
   */
  @Cron(CronExpression.EVERY_HOUR)
  async handleOverdueFees() {
    this.logger.log('Starting overdue fees check');
    
    try {
      const overdueFees = await this.feeService.getOverdueFees();
      
      if (overdueFees.length === 0) {
        this.logger.log('No overdue fees found');
        return;
      }

      this.logger.log(`Found ${overdueFees.length} overdue fees`);

      // Process automatic fee collection
      const results = await this.feeService.processAutomaticFeeCollection();
      
      this.logger.log(`Fee collection completed: ${results.processed} processed, ${results.successful} successful, ${results.failed} failed`);
      
      if (results.errors.length > 0) {
        this.logger.warn(`Fee collection errors: ${results.errors.join(', ')}`);
      }

    } catch (error) {
      this.logger.error(`Overdue fees task failed: ${error.message}`, error.stack);
    }
  }

  /**
   * Weekly task to generate recurring distributions
   * Runs every Monday at 8:00 AM UTC
   */
  @Cron('0 8 * * 1')
  async handleRecurringDistributions() {
    this.logger.log('Starting recurring distributions generation');
    
    try {
      const recurringDistributions = await this.distributionService.getRecurringDistributions();
      
      if (recurringDistributions.length === 0) {
        this.logger.log('No recurring distributions found');
        return;
      }

      this.logger.log(`Found ${recurringDistributions.length} recurring distributions`);

      for (const distribution of recurringDistributions) {
        try {
          this.logger.log(`Generating recurring distribution: ${distribution.id} - ${distribution.asset_name}`);
          
          // Generate next distribution
          const nextDistribution = await this.distributionService.generateNextRecurringDistribution(distribution);
          
          this.logger.log(`Generated next distribution: ${nextDistribution.id} scheduled for ${nextDistribution.scheduled_date}`);

        } catch (error) {
          this.logger.error(`Failed to generate recurring distribution ${distribution.id}: ${error.message}`);
        }
      }

    } catch (error) {
      this.logger.error(`Recurring distributions task failed: ${error.message}`, error.stack);
    }
  }

  /**
   * Monthly task to process management fees
   * Runs on the 1st of every month at 7:00 AM UTC
   */
  @Cron('0 7 1 * *')
  async handleManagementFees() {
    this.logger.log('Starting management fees processing');
    
    try {
      // Get all active assets
      const activeAssets = await this.distributionService.getActiveAssets();
      
      if (activeAssets.length === 0) {
        this.logger.log('No active assets found for management fees');
        return;
      }

      this.logger.log(`Processing management fees for ${activeAssets.length} assets`);

      for (const asset of activeAssets) {
        try {
          this.logger.log(`Processing management fees for asset: ${asset.id} - ${asset.name}`);
          
          // Calculate and create management fees
          const fees = await this.feeService.createRecurringFeeSchedule(
            {
              asset_id: asset.id,
              fee_type: 'MANAGEMENT_FEE',
              fee_name: 'Monthly Management Fee',
              fee_description: 'Monthly management fee for asset maintenance and oversight',
              calculation_method: 'PERCENTAGE',
              rate: 0.01, // 1% monthly
              base_amount: 0, // No minimum threshold
              stablecoin_type: 'USDC',
              due_date: new Date(),
              is_automatic: true,
            },
            '0 0 1 * *', // Monthly on 1st
            new Date(),
            new Date(Date.now() + 12 * 30 * 24 * 60 * 60 * 1000) // 12 months from now
          );

          this.logger.log(`Created ${fees.length} management fees for asset ${asset.id}`);

        } catch (error) {
          this.logger.error(`Failed to process management fees for asset ${asset.id}: ${error.message}`);
        }
      }

    } catch (error) {
      this.logger.error(`Management fees task failed: ${error.message}`, error.stack);
    }
  }

  /**
   * Daily task to clean up old records
   * Runs at 2:00 AM UTC every day
   */
  @Cron(CronExpression.EVERY_DAY_AT_2AM)
  async handleDataCleanup() {
    this.logger.log('Starting data cleanup task');
    
    try {
      // Clean up old payout runs (older than 1 year)
      const oneYearAgo = new Date(Date.now() - 365 * 24 * 60 * 60 * 1000);
      
      const cleanupResults = await Promise.allSettled([
        this.distributionService.cleanupOldDistributions(oneYearAgo),
        this.payoutService.cleanupOldPayoutRuns(oneYearAgo),
      ]);

      this.logger.log('Data cleanup completed', cleanupResults);

    } catch (error) {
      this.logger.error(`Data cleanup task failed: ${error.message}`, error.stack);
    }
  }

  /**
   * Weekly task to generate reports
   * Runs every Sunday at 6:00 AM UTC
   */
  @Cron('0 6 * * 0')
  async handleWeeklyReports() {
    this.logger.log('Starting weekly reports generation');
    
    try {
      // Generate various reports
      const [payoutStats, feeStats, distributionStats] = await Promise.all([
        this.payoutService.getPayoutStats(),
        this.feeService.getFeeStats(),
        this.distributionService.getDistributionStats(),
      ]);

      this.logger.log('Weekly reports generated', {
        payoutStats,
        feeStats,
        distributionStats,
      });

      // In a real implementation, these reports would be:
      // 1. Sent via email to stakeholders
      // 2. Stored in a reporting system
      // 3. Uploaded to cloud storage
      // 4. Triggered alerts for anomalies

    } catch (error) {
      this.logger.error(`Weekly reports task failed: ${error.message}`, error.stack);
    }
  }

  /**
   * Health check task - runs every 15 minutes
   */
  @Cron('*/15 * * * *')
  async handleHealthCheck() {
    this.logger.log('Performing scheduled health check');
    
    try {
      // Check service health
      const healthChecks = await Promise.allSettled([
        this.distributionService.healthCheck(),
        this.payoutService.healthCheck(),
        this.feeService.healthCheck(),
      ]);

      const failedChecks = healthChecks.filter(result => result.status === 'rejected');
      
      if (failedChecks.length > 0) {
        this.logger.warn(`Health check found ${failedChecks.length} failed services`);
        
        // In a real implementation, this would trigger alerts
        // await this.alertService.sendAlert('SETTLEMENT_SERVICE_HEALTH_ISSUE', {
        //   failedChecks: failedChecks.length,
        //   timestamp: new Date().toISOString(),
        // });
      } else {
        this.logger.log('All services healthy');
      }

    } catch (error) {
      this.logger.error(`Health check task failed: ${error.message}`, error.stack);
    }
  }
}
