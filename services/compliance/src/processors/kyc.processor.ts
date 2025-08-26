import { Process, Processor } from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import { Job } from 'bull';
import { KYCService } from '../services/kyc.service';
import { ScreeningService } from '../services/screening.service';
import { RuleEngineService } from '../services/rule-engine.service';

export interface KYCVerificationJob {
  applicantId: string;
  verificationMethod: 'AUTOMATED' | 'MANUAL';
  priority: 'LOW' | 'MEDIUM' | 'HIGH';
  metadata?: Record<string, any>;
}

export interface KYCDocumentProcessingJob {
  applicantId: string;
  documentId: string;
  documentType: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH';
  metadata?: Record<string, any>;
}

@Processor('kyc')
export class KYCProcessor {
  private readonly logger = new Logger(KYCProcessor.name);

  constructor(
    private readonly kycService: KYCService,
    private readonly screeningService: ScreeningService,
    private readonly ruleEngineService: RuleEngineService,
  ) {}

  @Process('verify-applicant')
  async handleKYCVerification(job: Job<KYCVerificationJob>) {
    const { applicantId, verificationMethod, priority, metadata } = job.data;
    
    this.logger.log(`Processing KYC verification for applicant ${applicantId} with priority ${priority}`);

    try {
      // Get applicant data
      const applicant = await this.kycService.getApplicant(applicantId);
      if (!applicant) {
        throw new Error(`Applicant ${applicantId} not found`);
      }

      // Perform automated screening if method is automated
      if (verificationMethod === 'AUTOMATED') {
        await this.performAutomatedScreening(applicant);
      }

      // Evaluate compliance rules
      await this.evaluateComplianceRules(applicant);

      // Update applicant status based on results
      await this.updateApplicantStatus(applicant);

      this.logger.log(`KYC verification completed for applicant ${applicantId}`);
      
      return {
        success: true,
        applicantId,
        status: 'COMPLETED',
        timestamp: new Date().toISOString(),
      };

    } catch (error) {
      this.logger.error(`KYC verification failed for applicant ${applicantId}:`, error);
      
      // Update job with failure information
      await job.moveToFailed({
        message: error.message,
        stack: error.stack,
      }, true);

      throw error;
    }
  }

  @Process('process-document')
  async handleDocumentProcessing(job: Job<KYCDocumentProcessingJob>) {
    const { applicantId, documentId, documentType, priority, metadata } = job.data;
    
    this.logger.log(`Processing document ${documentId} for applicant ${applicantId}`);

    try {
      // Process document based on type
      const result = await this.processDocument(applicantId, documentId, documentType, metadata);

      this.logger.log(`Document processing completed for ${documentId}`);
      
      return {
        success: true,
        documentId,
        applicantId,
        status: 'PROCESSED',
        result,
        timestamp: new Date().toISOString(),
      };

    } catch (error) {
      this.logger.error(`Document processing failed for ${documentId}:`, error);
      
      await job.moveToFailed({
        message: error.message,
        stack: error.stack,
      }, true);

      throw error;
    }
  }

  @Process('bulk-kyc-verification')
  async handleBulkKYCVerification(job: Job<{ applicantIds: string[]; verificationMethod: string }>) {
    const { applicantIds, verificationMethod } = job.data;
    
    this.logger.log(`Processing bulk KYC verification for ${applicantIds.length} applicants`);

    const results = [];
    const errors = [];

    for (const applicantId of applicantIds) {
      try {
        const result = await this.processIndividualKYC(applicantId, verificationMethod);
        results.push(result);
      } catch (error) {
        errors.push({ applicantId, error: error.message });
        this.logger.error(`Failed to process applicant ${applicantId}:`, error);
      }
    }

    this.logger.log(`Bulk KYC verification completed. Success: ${results.length}, Errors: ${errors.length}`);

    return {
      success: true,
      totalProcessed: applicantIds.length,
      successful: results.length,
      errors: errors.length,
      results,
      errors,
      timestamp: new Date().toISOString(),
    };
  }

  private async performAutomatedScreening(applicant: any) {
    this.logger.log(`Performing automated screening for applicant ${applicant.id}`);

    // Perform sanctions screening
    const sanctionsScreening = await this.screeningService.initiateScreening({
      applicantId: applicant.id,
      screeningType: 'SANCTIONS',
      applicantData: {
        firstName: applicant.firstName,
        lastName: applicant.lastName,
        dateOfBirth: applicant.dateOfBirth,
        nationality: applicant.nationality,
        countryOfResidence: applicant.countryOfResidence,
      },
    });

    // Perform PEP screening
    const pepScreening = await this.screeningService.initiateScreening({
      applicantId: applicant.id,
      screeningType: 'PEP',
      applicantData: {
        firstName: applicant.firstName,
        lastName: applicant.lastName,
        dateOfBirth: applicant.dateOfBirth,
        nationality: applicant.nationality,
        countryOfResidence: applicant.countryOfResidence,
      },
    });

    // Perform AML screening
    const amlScreening = await this.screeningService.initiateScreening({
      applicantId: applicant.id,
      screeningType: 'AML',
      applicantData: {
        firstName: applicant.firstName,
        lastName: applicant.lastName,
        dateOfBirth: applicant.dateOfBirth,
        nationality: applicant.nationality,
        countryOfResidence: applicant.countryOfResidence,
        financialData: applicant.financialData,
      },
    });

    return {
      sanctions: sanctionsScreening,
      pep: pepScreening,
      aml: amlScreening,
    };
  }

  private async evaluateComplianceRules(applicant: any) {
    this.logger.log(`Evaluating compliance rules for applicant ${applicant.id}`);

    const complianceResult = await this.ruleEngineService.evaluateCompliance({
      applicant,
      transferAmount: 0, // No transfer for KYC verification
      assetId: null,
      jurisdiction: applicant.countryOfResidence,
      investorType: applicant.investorType,
      accreditationStatus: applicant.accreditationStatus,
    });

    return complianceResult;
  }

  private async updateApplicantStatus(applicant: any) {
    this.logger.log(`Updating status for applicant ${applicant.id}`);

    // Get latest screening results
    const screeningResults = await this.screeningService.getScreeningResults(applicant.id);
    
    // Determine overall KYC status based on screening results and compliance rules
    let newStatus = 'PENDING';
    let riskLevel = 'LOW';
    let requiresManualReview = false;

    // Check if any screening failed
    const hasFailedScreenings = screeningResults.some(result => 
      result.result === 'FAIL' || result.riskLevel === 'HIGH'
    );

    if (hasFailedScreenings) {
      newStatus = 'REJECTED';
      riskLevel = 'HIGH';
      requiresManualReview = true;
    } else if (screeningResults.every(result => result.result === 'PASS')) {
      newStatus = 'APPROVED';
      riskLevel = 'LOW';
      requiresManualReview = false;
    } else {
      newStatus = 'REVIEW_REQUIRED';
      riskLevel = 'MEDIUM';
      requiresManualReview = true;
    }

    // Update applicant status
    await this.kycService.updateKYCStatus(applicant.id, {
      status: newStatus,
      riskLevel,
      requiresManualReview,
      lastVerifiedAt: new Date(),
    });

    return { newStatus, riskLevel, requiresManualReview };
  }

  private async processDocument(applicantId: string, documentId: string, documentType: string, metadata?: Record<string, any>) {
    this.logger.log(`Processing document ${documentId} of type ${documentType}`);

    // Document processing logic based on type
    switch (documentType) {
      case 'IDENTITY_DOCUMENT':
        return await this.processIdentityDocument(applicantId, documentId, metadata);
      case 'PROOF_OF_ADDRESS':
        return await this.processProofOfAddress(applicantId, documentId, metadata);
      case 'FINANCIAL_STATEMENT':
        return await this.processFinancialStatement(applicantId, documentId, metadata);
      case 'PROOF_OF_INCOME':
        return await this.processProofOfIncome(applicantId, documentId, metadata);
      default:
        return await this.processGenericDocument(applicantId, documentId, documentType, metadata);
    }
  }

  private async processIdentityDocument(applicantId: string, documentId: string, metadata?: Record<string, any>) {
    // Identity document processing logic
    // This could include OCR, data extraction, validation, etc.
    return {
      type: 'IDENTITY_DOCUMENT',
      status: 'PROCESSED',
      extractedData: {
        documentNumber: 'extracted_number',
        expiryDate: 'extracted_expiry',
        issuingCountry: 'extracted_country',
      },
      validationResult: 'VALID',
    };
  }

  private async processProofOfAddress(applicantId: string, documentId: string, metadata?: Record<string, any>) {
    // Proof of address processing logic
    return {
      type: 'PROOF_OF_ADDRESS',
      status: 'PROCESSED',
      extractedData: {
        address: 'extracted_address',
        dateIssued: 'extracted_date',
        documentType: 'extracted_doc_type',
      },
      validationResult: 'VALID',
    };
  }

  private async processFinancialStatement(applicantId: string, documentId: string, metadata?: Record<string, any>) {
    // Financial statement processing logic
    return {
      type: 'FINANCIAL_STATEMENT',
      status: 'PROCESSED',
      extractedData: {
        accountBalance: 'extracted_balance',
        accountType: 'extracted_account_type',
        institution: 'extracted_institution',
      },
      validationResult: 'VALID',
    };
  }

  private async processProofOfIncome(applicantId: string, documentId: string, metadata?: Record<string, any>) {
    // Proof of income processing logic
    return {
      type: 'PROOF_OF_INCOME',
      status: 'PROCESSED',
      extractedData: {
        annualIncome: 'extracted_income',
        employer: 'extracted_employer',
        employmentType: 'extracted_employment_type',
      },
      validationResult: 'VALID',
    };
  }

  private async processGenericDocument(applicantId: string, documentId: string, documentType: string, metadata?: Record<string, any>) {
    // Generic document processing logic
    return {
      type: documentType,
      status: 'PROCESSED',
      extractedData: {},
      validationResult: 'VALID',
    };
  }

  private async processIndividualKYC(applicantId: string, verificationMethod: string) {
    // Process individual KYC verification
    const applicant = await this.kycService.getApplicant(applicantId);
    if (!applicant) {
      throw new Error(`Applicant ${applicantId} not found`);
    }

    // Perform verification
    const result = await this.kycService.initiateVerification({
      applicantId,
      verificationMethod: verificationMethod as 'AUTOMATED' | 'MANUAL',
    });

    return {
      applicantId,
      status: 'COMPLETED',
      result,
      timestamp: new Date().toISOString(),
    };
  }
}
