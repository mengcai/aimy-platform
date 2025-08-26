import { Process, Processor } from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import { Job } from 'bull';
import { DistributionService } from '../services/distribution.service';
import { SettlementService } from '../services/settlement.service';

export interface DistributionJobData {
  distributionId: string;
  action: 'execute' | 'approve' | 'cancel' | 'create-recurring';
  metadata?: Record<string, any>;
}

export interface DistributionJobResult {
  success: boolean;
  distributionId: string;
  action: string;
  result?: any;
  processingTime: number;
  errors?: string[];
  metadata?: Record<string, any>;
}

@Processor('distributions')
export class DistributionProcessor {
  private readonly logger = new Logger(DistributionProcessor.name);

  constructor(
    private readonly distributionService: DistributionService,
    private readonly settlementService: SettlementService,
  ) {}

  @Process('execute-distribution')
  async handleExecuteDistribution(job: Job<DistributionJobData>): Promise<DistributionJobResult> {
    const startTime = Date.now();
    const { distributionId, metadata = {} } = job.data;

    this.logger.log(`Processing execute distribution job for distribution ${distributionId}`);

    try {
      // Execute the distribution
      const result = await this.distributionService.executeDistribution(distributionId);

      const processingTime = Date.now() - startTime;

      if (result.success) {
        this.logger.log(`Distribution execution completed successfully for ${distributionId} in ${processingTime}ms`);

        return {
          success: true,
          distributionId: result.distributionId,
          action: 'execute',
          result,
          processingTime,
          metadata: {
            ...metadata,
            jobId: job.id.toString(),
            completedAt: new Date().toISOString(),
            payoutRunId: result.payoutRunId,
          },
        };
      } else {
        this.logger.error(`Distribution execution failed for ${distributionId}: ${result.errors?.join(', ')}`);

        return {
          success: false,
          distributionId: result.distributionId,
          action: 'execute',
          processingTime: Date.now() - startTime,
          errors: result.errors,
          metadata: {
            ...metadata,
            jobId: job.id.toString(),
            failedAt: new Date().toISOString(),
          },
        };
      }

    } catch (error) {
      const processingTime = Date.now() - startTime;
      this.logger.error(`Distribution execution job error for ${distributionId}: ${error.message}`);

      return {
        success: false,
        distributionId,
        action: 'execute',
        processingTime,
        errors: [error.message],
        metadata: {
          ...metadata,
          jobId: job.id.toString(),
          errorAt: new Date().toISOString(),
          errorStack: error.stack,
        },
      };
    }
  }

  @Process('approve-distribution')
  async handleApproveDistribution(job: Job<DistributionJobData>): Promise<DistributionJobResult> {
    const startTime = Date.now();
    const { distributionId, metadata = {} } = job.data;
    const approverId = metadata.approverId || 'system';

    this.logger.log(`Processing approve distribution job for distribution ${distributionId} by ${approverId}`);

    try {
      // Approve the distribution
      const result = await this.distributionService.approveDistribution(distributionId, approverId);

      const processingTime = Date.now() - startTime;
      this.logger.log(`Distribution approval completed successfully for ${distributionId} in ${processingTime}ms`);

      return {
        success: true,
        distributionId: result.id,
        action: 'approve',
        result: {
          status: result.status,
          approvedBy: approverId,
          approvedAt: result.metadata?.approval_workflow?.approved_at,
        },
        processingTime,
        metadata: {
          ...metadata,
          jobId: job.id.toString(),
          completedAt: new Date().toISOString(),
          approverId,
        },
      };

    } catch (error) {
      const processingTime = Date.now() - startTime;
      this.logger.error(`Distribution approval job error for ${distributionId}: ${error.message}`);

      return {
        success: false,
        distributionId,
        action: 'approve',
        processingTime,
        errors: [error.message],
        metadata: {
          ...metadata,
          jobId: job.id.toString(),
          errorAt: new Date().toISOString(),
          errorStack: error.stack,
          approverId,
        },
      };
    }
  }

  @Process('cancel-distribution')
  async handleCancelDistribution(job: Job<DistributionJobData>): Promise<DistributionJobResult> {
    const startTime = Date.now();
    const { distributionId, metadata = {} } = job.data;
    const { reason, cancelledBy } = metadata;

    if (!reason || !cancelledBy) {
      return {
        success: false,
        distributionId,
        action: 'cancel',
        processingTime: Date.now() - startTime,
        errors: ['Missing required metadata: reason and cancelledBy'],
        metadata: {
          ...metadata,
          jobId: job.id.toString(),
          errorAt: new Date().toISOString(),
        },
      };
    }

    this.logger.log(`Processing cancel distribution job for distribution ${distributionId} by ${cancelledBy}`);

    try {
      // Cancel the distribution
      const result = await this.distributionService.cancelDistribution(distributionId, reason, cancelledBy);

      const processingTime = Date.now() - startTime;
      this.logger.log(`Distribution cancellation completed successfully for ${distributionId} in ${processingTime}ms`);

      return {
        success: true,
        distributionId: result.id,
        action: 'cancel',
        result: {
          status: result.status,
          cancelledBy,
          cancelledAt: result.metadata?.cancelled_at,
          reason,
        },
        processingTime,
        metadata: {
          ...metadata,
          jobId: job.id.toString(),
          completedAt: new Date().toISOString(),
          reason,
          cancelledBy,
        },
      };

    } catch (error) {
      const processingTime = Date.now() - startTime;
      this.logger.error(`Distribution cancellation job error for ${distributionId}: ${error.message}`);

      return {
        success: false,
        distributionId,
        action: 'cancel',
        processingTime,
        errors: [error.message],
        metadata: {
          ...metadata,
          jobId: job.id.toString(),
          errorAt: new Date().toISOString(),
          errorStack: error.stack,
          reason,
          cancelledBy,
        },
      };
    }
  }

  @Process('create-recurring')
  async handleCreateRecurring(job: Job<DistributionJobData>): Promise<DistributionJobResult> {
    const startTime = Date.now();

    this.logger.log('Processing create recurring distributions job');

    try {
      // Create recurring distribution instances
      const count = await this.distributionService.createRecurringDistributions();

      const processingTime = Date.now() - startTime;
      this.logger.log(`Recurring distributions creation completed successfully: ${count} instances created in ${processingTime}ms`);

      return {
        success: true,
        distributionId: 'recurring-batch',
        action: 'create-recurring',
        result: {
          instancesCreated: count,
          timestamp: new Date().toISOString(),
        },
        processingTime,
        metadata: {
          jobId: job.id.toString(),
          completedAt: new Date().toISOString(),
          instancesCreated: count,
        },
      };

    } catch (error) {
      const processingTime = Date.now() - startTime;
      this.logger.error(`Recurring distributions creation job error: ${error.message}`);

      return {
        success: false,
        distributionId: 'recurring-batch',
        action: 'create-recurring',
        processingTime,
        errors: [error.message],
        metadata: {
          jobId: job.id.toString(),
          errorAt: new Date().toISOString(),
          errorStack: error.stack,
        },
      };
    }
  }

  @Process('process-scheduled')
  async handleProcessScheduled(job: Job<{ date: string; metadata?: Record<string, any> }>): Promise<{
    success: boolean;
    date: string;
    processed: number;
    successful: number;
    failed: number;
    errors: string[];
    processingTime: number;
    metadata?: Record<string, any>;
  }> {
    const startTime = Date.now();
    const { date, metadata = {} } = job.data;

    this.logger.log(`Processing scheduled distributions for date ${date}`);

    try {
      // Process scheduled distributions for the date
      const result = await this.settlementService.processScheduledDistributions(new Date(date));

      const processingTime = Date.now() - startTime;
      this.logger.log(`Scheduled distributions processing completed for ${date}: ${result.processed} processed in ${processingTime}ms`);

      return {
        success: result.failed === 0,
        date,
        processed: result.processed,
        successful: result.successful,
        failed: result.failed,
        errors: result.errors,
        processingTime,
        metadata: {
          ...metadata,
          jobId: job.id.toString(),
          completedAt: new Date().toISOString(),
        },
      };

    } catch (error) {
      const processingTime = Date.now() - startTime;
      this.logger.error(`Scheduled distributions processing job error for ${date}: ${error.message}`);

      return {
        success: false,
        date,
        processed: 0,
        successful: 0,
        failed: 0,
        errors: [error.message],
        processingTime,
        metadata: {
          ...metadata,
          jobId: job.id.toString(),
          errorAt: new Date().toISOString(),
          errorStack: error.stack,
        },
      };
    }
  }

  @Process('bulk-distribution-action')
  async handleBulkDistributionAction(job: Job<{
    distributionIds: string[];
    action: 'approve' | 'cancel' | 'execute';
    options?: Record<string, any>;
  }>): Promise<{
    success: boolean;
    action: string;
    totalDistributions: number;
    successful: number;
    failed: number;
    results: DistributionJobResult[];
    processingTime: number;
  }> {
    const startTime = Date.now();
    const { distributionIds, action, options = {} } = job.data;

    this.logger.log(`Processing bulk distribution action '${action}' for ${distributionIds.length} distributions`);

    const results: DistributionJobResult[] = [];
    let successful = 0;
    let failed = 0;

    for (const distributionId of distributionIds) {
      try {
        let result: any;

        switch (action) {
          case 'approve':
            result = await this.distributionService.approveDistribution(distributionId, options.approverId || 'system');
            break;
          case 'cancel':
            result = await this.distributionService.cancelDistribution(
              distributionId,
              options.reason || 'Bulk cancellation',
              options.cancelledBy || 'system'
            );
            break;
          case 'execute':
            result = await this.distributionService.executeDistribution(distributionId);
            break;
          default:
            throw new Error(`Unknown action: ${action}`);
        }

        if (result && (result.success !== false)) {
          successful++;
          this.logger.log(`Bulk ${action}: Distribution ${distributionId} completed successfully`);
        } else {
          failed++;
          this.logger.error(`Bulk ${action}: Distribution ${distributionId} failed`);
        }

        results.push({
          success: result && (result.success !== false),
          distributionId: result?.id || distributionId,
          action,
          result,
          processingTime: 0, // Individual processing time not tracked in bulk
          metadata: {
            bulkJobId: job.id.toString(),
            distributionId,
            action,
            ...options,
          },
        });

      } catch (error) {
        failed++;
        this.logger.error(`Bulk ${action}: Distribution ${distributionId} error: ${error.message}`);

        results.push({
          success: false,
          distributionId,
          action,
          processingTime: 0,
          errors: [error.message],
          metadata: {
            bulkJobId: job.id.toString(),
            distributionId,
            action,
            error: error.message,
            ...options,
          },
        });
      }
    }

    const processingTime = Date.now() - startTime;
    this.logger.log(`Bulk distribution action '${action}' completed: ${successful} successful, ${failed} failed in ${processingTime}ms`);

    return {
      success: failed === 0,
      action,
      totalDistributions: distributionIds.length,
      successful,
      failed,
      results,
      processingTime,
    };
  }
}
