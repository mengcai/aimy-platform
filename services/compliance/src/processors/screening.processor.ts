import { Process, Processor } from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import { Job } from 'bull';
import { ScreeningService } from '../services/screening.service';
import { KYCService } from '../services/kyc.service';
import { AuditService } from '../services/audit.service';

export interface ScreeningJob {
  applicantId: string;
  screeningType: 'SANCTIONS' | 'PEP' | 'AML' | 'CUSTOM';
  priority: 'LOW' | 'MEDIUM' | 'HIGH';
  metadata?: Record<string, any>;
  retryCount?: number;
}

export interface BatchScreeningJob {
  applicantIds: string[];
  screeningType: 'SANCTIONS' | 'PEP' | 'AML' | 'CUSTOM';
  priority: 'LOW' | 'MEDIUM' | 'HIGH';
  metadata?: Record<string, any>;
}

export interface ScreeningRetryJob {
  screeningResultId: string;
  reason: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH';
  metadata?: Record<string, any>;
}

@Processor('screening')
export class ScreeningProcessor {
  private readonly logger = new Logger(ScreeningProcessor.name);
  private readonly maxRetries = 3;

  constructor(
    private readonly screeningService: ScreeningService,
    private readonly kycService: KYCService,
    private readonly auditService: AuditService,
  ) {}

  @Process('perform-screening')
  async handleScreening(job: Job<ScreeningJob>) {
    const { applicantId, screeningType, priority, metadata, retryCount = 0 } = job.data;
    
    this.logger.log(`Processing ${screeningType} screening for applicant ${applicantId} with priority ${priority} (attempt ${retryCount + 1})`);

    try {
      // Get applicant data
      const applicant = await this.kycService.getApplicant(applicantId);
      if (!applicant) {
        throw new Error(`Applicant ${applicantId} not found`);
      }

      // Perform the screening
      const screeningResult = await this.performScreening(applicant, screeningType, metadata);

      // Log successful screening
      await this.auditService.createAuditLog({
        action: 'SCREENING_COMPLETED',
        level: 'INFO',
        source: 'SCREENING_SERVICE',
        entityType: 'KYCApplicant',
        entityId: applicantId,
        description: `${screeningType} screening completed successfully for applicant ${applicantId}`,
        userId: 'system',
        ipAddress: '127.0.0.1',
        metadata: {
          screeningType,
          result: screeningResult.result,
          riskLevel: screeningResult.riskLevel,
          confidenceScore: screeningResult.confidenceScore,
        },
      });

      this.logger.log(`${screeningType} screening completed for applicant ${applicantId}`);
      
      return {
        success: true,
        applicantId,
        screeningType,
        result: screeningResult,
        timestamp: new Date().toISOString(),
      };

    } catch (error) {
      this.logger.error(`${screeningType} screening failed for applicant ${applicantId}:`, error);
      
      // Handle retries
      if (retryCount < this.maxRetries) {
        this.logger.log(`Retrying ${screeningType} screening for applicant ${applicantId} (attempt ${retryCount + 2})`);
        
        // Schedule retry with exponential backoff
        const delay = Math.pow(2, retryCount) * 1000; // 1s, 2s, 4s
        await job.retry({ delay });
        
        return {
          success: false,
          applicantId,
          screeningType,
          status: 'RETRY_SCHEDULED',
          retryCount: retryCount + 1,
          error: error.message,
          timestamp: new Date().toISOString(),
        };
      }

      // Max retries exceeded, mark as failed
      await this.auditService.createAuditLog({
        action: 'SCREENING_FAILED',
        level: 'ERROR',
        source: 'SCREENING_SERVICE',
        entityType: 'KYCApplicant',
        entityId: applicantId,
        description: `${screeningType} screening failed after ${this.maxRetries} attempts for applicant ${applicantId}`,
        userId: 'system',
        ipAddress: '127.0.0.1',
        metadata: {
          screeningType,
          error: error.message,
          retryCount,
        },
      });

      await job.moveToFailed({
        message: error.message,
        stack: error.stack,
      }, true);

      throw error;
    }
  }

  @Process('batch-screening')
  async handleBatchScreening(job: Job<BatchScreeningJob>) {
    const { applicantIds, screeningType, priority, metadata } = job.data;
    
    this.logger.log(`Processing batch ${screeningType} screening for ${applicantIds.length} applicants`);

    const results = [];
    const errors = [];

    for (const applicantId of applicantIds) {
      try {
        const result = await this.processIndividualScreening(applicantId, screeningType, metadata);
        results.push(result);
      } catch (error) {
        errors.push({ applicantId, error: error.message });
        this.logger.error(`Failed to process screening for applicant ${applicantId}:`, error);
      }
    }

    this.logger.log(`Batch ${screeningType} screening completed. Success: ${results.length}, Errors: ${errors.length}`);

    return {
      success: true,
      screeningType,
      totalProcessed: applicantIds.length,
      successful: results.length,
      errors: errors.length,
      results,
      errors,
      timestamp: new Date().toISOString(),
    };
  }

  @Process('retry-screening')
  async handleScreeningRetry(job: Job<ScreeningRetryJob>) {
    const { screeningResultId, reason, priority, metadata } = job.data;
    
    this.logger.log(`Retrying screening result ${screeningResultId} due to: ${reason}`);

    try {
      // Get the screening result
      const screeningResult = await this.screeningService.getScreeningResult(screeningResultId);
      if (!screeningResult) {
        throw new Error(`Screening result ${screeningResultId} not found`);
      }

      // Retry the screening
      const retryResult = await this.screeningService.retryScreening(screeningResultId);

      // Log successful retry
      await this.auditService.createAuditLog({
        action: 'SCREENING_RETRY_SUCCESS',
        level: 'INFO',
        source: 'SCREENING_SERVICE',
        entityType: 'ScreeningResult',
        entityId: screeningResultId,
        description: `Screening retry successful for result ${screeningResultId}`,
        userId: 'system',
        ipAddress: '127.0.0.1',
        metadata: {
          originalResult: screeningResult.result,
          retryResult: retryResult.result,
          reason,
        },
      });

      this.logger.log(`Screening retry completed for result ${screeningResultId}`);
      
      return {
        success: true,
        screeningResultId,
        originalResult: screeningResult.result,
        retryResult: retryResult.result,
        timestamp: new Date().toISOString(),
      };

    } catch (error) {
      this.logger.error(`Screening retry failed for result ${screeningResultId}:`, error);
      
      await this.auditService.createAuditLog({
        action: 'SCREENING_RETRY_FAILED',
        level: 'ERROR',
        source: 'SCREENING_SERVICE',
        entityType: 'ScreeningResult',
        entityId: screeningResultId,
        description: `Screening retry failed for result ${screeningResultId}`,
        userId: 'system',
        ipAddress: '127.0.0.1',
        metadata: {
          error: error.message,
          reason,
        },
      });

      await job.moveToFailed({
        message: error.message,
        stack: error.stack,
      }, true);

      throw error;
    }
  }

  @Process('cleanup-expired-screenings')
  async handleCleanupExpiredScreenings(job: Job) {
    this.logger.log('Cleaning up expired screening results');

    try {
      const cleanedCount = await this.screeningService.cleanupExpiredScreenings();

      this.logger.log(`Cleaned up ${cleanedCount} expired screening results`);

      return {
        success: true,
        cleanedCount,
        timestamp: new Date().toISOString(),
      };

    } catch (error) {
      this.logger.error('Failed to cleanup expired screenings:', error);
      
      await job.moveToFailed({
        message: error.message,
        stack: error.stack,
      }, true);

      throw error;
    }
  }

  @Process('generate-screening-report')
  async handleGenerateScreeningReport(job: Job<{ startDate: string; endDate: string; format: 'JSON' | 'CSV' | 'PDF' }>) {
    const { startDate, endDate, format } = job.data;
    
    this.logger.log(`Generating screening report from ${startDate} to ${endDate} in ${format} format`);

    try {
      // Get screening statistics for the period
      const stats = await this.screeningService.getScreeningStats();

      // Generate report based on format
      let report;
      switch (format) {
        case 'JSON':
          report = JSON.stringify(stats, null, 2);
          break;
        case 'CSV':
          report = this.generateCSVReport(stats);
          break;
        case 'PDF':
          report = this.generatePDFReport(stats);
          break;
        default:
          throw new Error(`Unsupported format: ${format}`);
      }

      this.logger.log(`Screening report generated successfully in ${format} format`);

      return {
        success: true,
        format,
        startDate,
        endDate,
        report,
        timestamp: new Date().toISOString(),
      };

    } catch (error) {
      this.logger.error('Failed to generate screening report:', error);
      
      await job.moveToFailed({
        message: error.message,
        stack: error.stack,
      }, true);

      throw error;
    }
  }

  private async performScreening(applicant: any, screeningType: string, metadata?: Record<string, any>) {
    // Prepare applicant data for screening
    const applicantData = {
      firstName: applicant.firstName,
      lastName: applicant.lastName,
      dateOfBirth: applicant.dateOfBirth,
      nationality: applicant.nationality,
      countryOfResidence: applicant.countryOfResidence,
      financialData: applicant.financialData,
      ...metadata,
    };

    // Perform the screening
    const screeningResult = await this.screeningService.initiateScreening({
      applicantId: applicant.id,
      screeningType: screeningType as any,
      applicantData,
    });

    return screeningResult;
  }

  private async processIndividualScreening(applicantId: string, screeningType: string, metadata?: Record<string, any>) {
    const applicant = await this.kycService.getApplicant(applicantId);
    if (!applicant) {
      throw new Error(`Applicant ${applicantId} not found`);
    }

    const result = await this.performScreening(applicant, screeningType, metadata);

    return {
      applicantId,
      screeningType,
      result,
      timestamp: new Date().toISOString(),
    };
  }

  private generateCSVReport(stats: any): string {
    // Simple CSV generation for screening statistics
    const headers = ['Metric', 'Value'];
    const rows = [
      ['Total Screenings', stats.total],
      ['Pending', stats.pending],
      ['Completed', stats.completed],
      ['Failed', stats.failed],
      ['Hits', stats.hits],
      ['Clear', stats.clear],
      ['Average Risk Score', stats.averageRiskScore],
    ];

    const csvContent = [headers, ...rows]
      .map(row => row.map(cell => `"${cell}"`).join(','))
      .join('\n');

    return csvContent;
  }

  private generatePDFReport(stats: any): Buffer {
    // Placeholder for PDF generation
    // In a real implementation, this would use a library like PDFKit or jsPDF
    const reportContent = `
      Screening Report
      ================
      
      Total Screenings: ${stats.total}
      Pending: ${stats.pending}
      Completed: ${stats.completed}
      Failed: ${stats.failed}
      Hits: ${stats.hits}
      Clear: ${stats.clear}
      Average Risk Score: ${stats.averageRiskScore}
      
      Generated on: ${new Date().toISOString()}
    `;

    return Buffer.from(reportContent, 'utf-8');
  }
}
