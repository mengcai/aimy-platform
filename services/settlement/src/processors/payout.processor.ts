import { Process, Processor } from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import { Job } from 'bull';
import { PayoutService } from '../services/payout.service';
import { ReceiptService } from '../services/receipt.service';

export interface PayoutJobData {
  distributionId: string;
  isDryRun?: boolean;
  batchSize?: number;
  maxRetries?: number;
  priority?: 'low' | 'normal' | 'high';
  metadata?: Record<string, any>;
}

export interface PayoutJobResult {
  success: boolean;
  distributionId: string;
  payoutRunId?: string;
  totalRecipients: number;
  successfulPayouts: number;
  failedPayouts: number;
  totalAmount: number;
  processingTime: number;
  errors?: string[];
  metadata?: Record<string, any>;
}

@Processor('payouts')
export class PayoutProcessor {
  private readonly logger = new Logger(PayoutProcessor.name);

  constructor(
    private readonly payoutService: PayoutService,
    private readonly receiptService: ReceiptService,
  ) {}

  @Process('execute-payout')
  async handleExecutePayout(job: Job<PayoutJobData>): Promise<PayoutJobResult> {
    const startTime = Date.now();
    const { distributionId, isDryRun = false, batchSize = 100, maxRetries = 3, priority = 'normal', metadata = {} } = job.data;

    this.logger.log(`Processing payout job for distribution ${distributionId} (dry run: ${isDryRun})`);

    try {
      // Execute the payout
      const result = await this.payoutService.executePayoutRun({
        distributionId,
        isDryRun,
        batchSize,
        maxRetries,
      });

      const processingTime = Date.now() - startTime;

      if (result.success) {
        this.logger.log(`Payout job completed successfully for distribution ${distributionId} in ${processingTime}ms`);
        
        // Generate receipts if not a dry run
        let receiptsGenerated = 0;
        if (!isDryRun && result.payoutRunId) {
          try {
            const receiptResult = await this.receiptService.bulkGenerateReceipts(
              result.payoutRunId,
              { format: 'pdf' }
            );
            receiptsGenerated = receiptResult.generated;
            
            if (!receiptResult.success) {
              this.logger.warn(`Some receipts failed to generate: ${receiptResult.errors?.join(', ')}`);
            }
          } catch (error) {
            this.logger.error(`Failed to generate receipts for payout run ${result.payoutRunId}: ${error.message}`);
          }
        }

        return {
          success: true,
          distributionId: result.distributionId,
          payoutRunId: result.payoutRunId,
          totalRecipients: result.totalRecipients,
          successfulPayouts: result.successfulPayouts || 0,
          failedPayouts: result.failedPayouts || 0,
          totalAmount: result.totalAmount || 0,
          processingTime,
          metadata: {
            ...metadata,
            receiptsGenerated,
            priority,
            jobId: job.id.toString(),
            completedAt: new Date().toISOString(),
          },
        };
      } else {
        this.logger.error(`Payout job failed for distribution ${distributionId}: ${result.errors?.join(', ')}`);
        
        return {
          success: false,
          distributionId: result.distributionId,
          totalRecipients: result.totalRecipients || 0,
          successfulPayouts: 0,
          failedPayouts: result.totalRecipients || 0,
          totalAmount: 0,
          processingTime: Date.now() - startTime,
          errors: result.errors,
          metadata: {
            ...metadata,
            priority,
            jobId: job.id.toString(),
            failedAt: new Date().toISOString(),
          },
        };
      }

    } catch (error) {
      const processingTime = Date.now() - startTime;
      this.logger.error(`Payout job error for distribution ${distributionId}: ${error.message}`);

      return {
        success: false,
        distributionId,
        totalRecipients: 0,
        successfulPayouts: 0,
        failedPayouts: 0,
        totalAmount: 0,
        processingTime,
        errors: [error.message],
        metadata: {
          ...metadata,
          priority,
          jobId: job.id.toString(),
          errorAt: new Date().toISOString(),
          errorStack: error.stack,
        },
      };
    }
  }

  @Process('retry-payout')
  async handleRetryPayout(job: Job<{ payoutRunId: string; metadata?: Record<string, any> }>): Promise<PayoutJobResult> {
    const startTime = Date.now();
    const { payoutRunId, metadata = {} } = job.data;

    this.logger.log(`Processing retry payout job for payout run ${payoutRunId}`);

    try {
      // Retry the payout
      const result = await this.payoutService.retryPayoutRun(payoutRunId);

      const processingTime = Date.now() - startTime;

      if (result.success) {
        this.logger.log(`Retry payout job completed successfully for payout run ${payoutRunId} in ${processingTime}ms`);

        return {
          success: true,
          distributionId: result.distributionId || 'unknown',
          payoutRunId: result.payoutRunId,
          totalRecipients: result.totalRecipients || 0,
          successfulPayouts: result.successfulPayouts || 0,
          failedPayouts: result.failedPayouts || 0,
          totalAmount: result.totalAmount || 0,
          processingTime,
          metadata: {
            ...metadata,
            isRetry: true,
            originalPayoutRunId: payoutRunId,
            jobId: job.id.toString(),
            completedAt: new Date().toISOString(),
          },
        };
      } else {
        this.logger.error(`Retry payout job failed for payout run ${payoutRunId}: ${result.errors?.join(', ')}`);

        return {
          success: false,
          distributionId: result.distributionId || 'unknown',
          totalRecipients: result.totalRecipients || 0,
          successfulPayouts: 0,
          failedPayouts: result.totalRecipients || 0,
          totalAmount: 0,
          processingTime: Date.now() - startTime,
          errors: result.errors,
          metadata: {
            ...metadata,
            isRetry: true,
            originalPayoutRunId: payoutRunId,
            jobId: job.id.toString(),
            failedAt: new Date().toISOString(),
          },
        };
      }

    } catch (error) {
      const processingTime = Date.now() - startTime;
      this.logger.error(`Retry payout job error for payout run ${payoutRunId}: ${error.message}`);

      return {
        success: false,
        distributionId: 'unknown',
        totalRecipients: 0,
        successfulPayouts: 0,
        failedPayouts: 0,
        totalAmount: 0,
        processingTime,
        errors: [error.message],
        metadata: {
          ...metadata,
          isRetry: true,
          originalPayoutRunId: payoutRunId,
          jobId: job.id.toString(),
          errorAt: new Date().toISOString(),
          errorStack: error.stack,
        },
      };
    }
  }

  @Process('bulk-payout')
  async handleBulkPayout(job: Job<{ distributionIds: string[]; options?: Record<string, any> }>): Promise<{
    success: boolean;
    totalDistributions: number;
    successful: number;
    failed: number;
    results: PayoutJobResult[];
    processingTime: number;
  }> {
    const startTime = Date.now();
    const { distributionIds, options = {} } = job.data;

    this.logger.log(`Processing bulk payout job for ${distributionIds.length} distributions`);

    const results: PayoutJobResult[] = [];
    let successful = 0;
    let failed = 0;

    for (const distributionId of distributionIds) {
      try {
        const result = await this.payoutService.executePayoutRun({
          distributionId,
          isDryRun: options.isDryRun || false,
          batchSize: options.batchSize || 100,
          maxRetries: options.maxRetries || 3,
        });

        if (result.success) {
          successful++;
          this.logger.log(`Bulk payout: Distribution ${distributionId} completed successfully`);
        } else {
          failed++;
          this.logger.error(`Bulk payout: Distribution ${distributionId} failed: ${result.errors?.join(', ')}`);
        }

        results.push({
          success: result.success,
          distributionId: result.distributionId,
          payoutRunId: result.payoutRunId,
          totalRecipients: result.totalRecipients,
          successfulPayouts: result.successfulPayouts || 0,
          failedPayouts: result.failedPayouts || 0,
          totalAmount: result.totalAmount || 0,
          processingTime: 0, // Individual processing time not tracked in bulk
          errors: result.errors,
          metadata: {
            bulkJobId: job.id.toString(),
            distributionId,
            ...options,
          },
        });

      } catch (error) {
        failed++;
        this.logger.error(`Bulk payout: Distribution ${distributionId} error: ${error.message}`);

        results.push({
          success: false,
          distributionId,
          totalRecipients: 0,
          successfulPayouts: 0,
          failedPayouts: 0,
          totalAmount: 0,
          processingTime: 0,
          errors: [error.message],
          metadata: {
            bulkJobId: job.id.toString(),
            distributionId,
            error: error.message,
            ...options,
          },
        });
      }
    }

    const processingTime = Date.now() - startTime;
    this.logger.log(`Bulk payout job completed: ${successful} successful, ${failed} failed in ${processingTime}ms`);

    return {
      success: failed === 0,
      totalDistributions: distributionIds.length,
      successful,
      failed,
      results,
      processingTime,
    };
  }
}
