import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ScreeningResult, ScreeningType, ScreeningStatus, ScreeningResult as ScreeningResultEnum, RiskLevel } from '../entities/screening-result.entity';
import { KYCApplicant } from '../entities/kyc-applicant.entity';

export interface ScreeningRequest {
  applicantId: string;
  screeningType: ScreeningType;
  applicantData: {
    firstName: string;
    lastName: string;
    dateOfBirth: Date;
    nationality: string;
    countryOfResidence: string;
    passportNumber?: string;
    nationalId?: string;
  };
}

export interface ScreeningHit {
  id: string;
  name: string;
  type: string;
  country: string;
  reason: string;
  riskScore: number;
  source: string;
  lastUpdated: string;
}

export interface ScreeningResponse {
  status: ScreeningStatus;
  result: ScreeningResultEnum;
  riskLevel: RiskLevel;
  confidenceScore: number;
  riskScore: number;
  hits: ScreeningHit[];
  summary: string;
  details: string;
  recommendations: string;
  requiresManualReview: boolean;
  provider: string;
  referenceId: string;
  rawData: any;
  processedData: any;
}

@Injectable()
export class ScreeningService {
  private readonly logger = new Logger(ScreeningService.name);

  // Mock sanctions database for deterministic testing
  private readonly mockSanctionsDB = new Map<string, any>([
    // Test user 1: John Smith - US Accredited (should pass)
    ['john-smith-1980', {
      hits: [],
      riskScore: 10,
      confidenceScore: 95,
    }],
    
    // Test user 2: Maria Garcia - Non-US (should pass)
    ['maria-garcia-1991', {
      hits: [],
      riskScore: 15,
      confidenceScore: 90,
    }],
    
    // Test user 3: Bob Johnson - US Non-Accredited (should pass)
    ['bob-johnson-2000', {
      hits: [],
      riskScore: 20,
      confidenceScore: 85,
    }],
    
    // Test user 4: Blocked address (should hit)
    ['blocked-user', {
      hits: [{
        id: 'sanction-001',
        name: 'Blocked Test User',
        type: 'INDIVIDUAL',
        country: 'US',
        reason: 'Test sanctions hit for blocked user',
        riskScore: 95,
        source: 'OFAC',
        lastUpdated: '2024-01-01',
      }],
      riskScore: 95,
      confidenceScore: 98,
    }],
    
    // Test user 5: PEP (should hit)
    ['pep-user', {
      hits: [{
        id: 'pep-001',
        name: 'PEP Test User',
        type: 'POLITICAL_EXPOSURE',
        country: 'US',
        reason: 'Politically Exposed Person - Test',
        riskScore: 75,
        source: 'PEP Database',
        lastUpdated: '2024-01-01',
      }],
      riskScore: 75,
      confidenceScore: 85,
    }],
    
    // Test user 6: High risk (should hit)
    ['high-risk-user', {
      hits: [{
        id: 'risk-001',
        name: 'High Risk Test User',
        type: 'HIGH_RISK',
        country: 'US',
        reason: 'High risk profile - Test',
        riskScore: 80,
        source: 'Risk Database',
        lastUpdated: '2024-01-01',
      }],
      riskScore: 80,
      confidenceScore: 90,
    }],
  ]);

  constructor(
    @InjectRepository(ScreeningResult)
    private readonly screeningResultRepository: Repository<ScreeningResult>,
    @InjectRepository(KYCApplicant)
    private readonly applicantRepository: Repository<KYCApplicant>,
  ) {}

  /**
   * Initiate screening for an applicant
   */
  async initiateScreening(request: ScreeningRequest): Promise<ScreeningResponse> {
    this.logger.log(`Initiating ${request.screeningType} screening for applicant ${request.applicantId}`);

    try {
      // Create screening result record
      const screeningResult = this.screeningResultRepository.create({
        applicantId: request.applicantId,
        screeningType: request.screeningType,
        status: ScreeningStatus.IN_PROGRESS,
        provider: 'Mock Screening Provider',
        referenceId: `MOCK-${Date.now()}`,
        screenedAt: new Date(),
      });

      await this.screeningResultRepository.save(screeningResult);

      // Perform screening
      const response = await this.performScreening(request);

      // Update screening result
      screeningResult.status = ScreeningStatus.COMPLETED;
      screeningResult.result = response.result;
      screeningResult.riskLevel = response.riskLevel;
      screeningResult.confidenceScore = response.confidenceScore;
      screeningResult.riskScore = response.riskScore;
      screeningResult.hits = response.hits;
      screeningResult.summary = response.summary;
      screeningResult.details = response.details;
      screeningResult.recommendations = response.recommendations;
      screeningResult.requiresManualReview = response.requiresManualReview;
      screeningResult.rawData = response.rawData;
      screeningResult.processedData = response.processedData;

      await this.screeningResultRepository.save(screeningResult);

      this.logger.log(`Screening completed for applicant ${request.applicantId}: ${response.result}`);

      return response;
    } catch (error) {
      this.logger.error(`Screening failed for applicant ${request.applicantId}: ${error.message}`);
      
      // Update screening result with error
      const screeningResult = await this.screeningResultRepository.findOne({
        where: { applicantId: request.applicantId, screeningType: request.screeningType }
      });
      
      if (screeningResult) {
        screeningResult.status = ScreeningStatus.FAILED;
        screeningResult.result = ScreeningResultEnum.ERROR;
        screeningResult.errorMessage = error.message;
        await this.screeningResultRepository.save(screeningResult);
      }

      throw error;
    }
  }

  /**
   * Perform the actual screening using mock provider
   */
  private async performScreening(request: ScreeningRequest): Promise<ScreeningResponse> {
    // Simulate processing delay
    await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));

    // Generate deterministic key based on applicant data
    const key = this.generateApplicantKey(request.applicantData);
    
    // Get screening data from mock database
    const screeningData = this.mockSanctionsDB.get(key) || this.mockSanctionsDB.get('default') || {
      hits: [],
      riskScore: 25,
      confidenceScore: 80,
    };

    // Determine result based on hits and risk score
    let result: ScreeningResultEnum;
    let riskLevel: RiskLevel;
    let requiresManualReview = false;

    if (screeningData.hits.length > 0) {
      result = ScreeningResultEnum.HIT;
      if (screeningData.riskScore >= 80) {
        riskLevel = RiskLevel.CRITICAL;
        requiresManualReview = true;
      } else if (screeningData.riskScore >= 60) {
        riskLevel = RiskLevel.HIGH;
        requiresManualReview = true;
      } else {
        riskLevel = RiskLevel.MEDIUM;
        requiresManualReview = false;
      }
    } else {
      result = ScreeningResultEnum.CLEAR;
      if (screeningData.riskScore <= 20) {
        riskLevel = RiskLevel.LOW;
      } else {
        riskLevel = RiskLevel.MEDIUM;
      }
    }

    // Generate summary and recommendations
    const summary = this.generateSummary(result, screeningData.hits.length, riskLevel);
    const details = this.generateDetails(request, screeningData);
    const recommendations = this.generateRecommendations(result, riskLevel, screeningData.hits);

    return {
      status: ScreeningStatus.COMPLETED,
      result,
      riskLevel,
      confidenceScore: screeningData.confidenceScore,
      riskScore: screeningData.riskScore,
      hits: screeningData.hits,
      summary,
      details,
      recommendations,
      requiresManualReview,
      provider: 'Mock Screening Provider',
      referenceId: `MOCK-${Date.now()}`,
      rawData: {
        applicantData: request.applicantData,
        screeningType: request.screeningType,
        timestamp: new Date().toISOString(),
      },
      processedData: {
        key,
        screeningData,
        result,
        riskLevel,
        requiresManualReview,
      },
    };
  }

  /**
   * Generate deterministic key for applicant
   */
  private generateApplicantKey(applicantData: any): string {
    const normalizedFirstName = applicantData.firstName.toLowerCase().replace(/[^a-z]/g, '');
    const normalizedLastName = applicantData.lastName.toLowerCase().replace(/[^a-z]/g, '');
    const year = new Date(applicantData.dateOfBirth).getFullYear();
    
    return `${normalizedFirstName}-${normalizedLastName}-${year}`;
  }

  /**
   * Generate summary text
   */
  private generateSummary(result: ScreeningResultEnum, hitCount: number, riskLevel: RiskLevel): string {
    if (result === ScreeningResultEnum.CLEAR) {
      return `Screening completed successfully. No adverse findings detected. Risk level: ${riskLevel}`;
    } else {
      return `Screening completed with ${hitCount} adverse finding(s). Risk level: ${riskLevel}. Manual review required.`;
    }
  }

  /**
   * Generate detailed explanation
   */
  private generateDetails(request: ScreeningRequest, screeningData: any): string {
    if (screeningData.hits.length === 0) {
      return `No adverse findings were detected during ${request.screeningType.toLowerCase()} screening. The applicant appears to meet all compliance requirements.`;
    } else {
      const hitDetails = screeningData.hits.map((hit: any) => 
        `- ${hit.name} (${hit.type}): ${hit.reason}`
      ).join('\n');
      
      return `Adverse findings were detected during ${request.screeningType.toLowerCase()} screening:\n${hitDetails}\n\nRisk assessment indicates ${screeningData.riskScore}% risk score.`;
    }
  }

  /**
   * Generate recommendations
   */
  private generateRecommendations(result: ScreeningResultEnum, riskLevel: RiskLevel, hits: any[]): string {
    if (result === ScreeningResultEnum.CLEAR) {
      return 'Proceed with standard processing. No additional actions required.';
    } else {
      let recommendations = 'Manual review required due to adverse findings.\n';
      
      if (riskLevel === RiskLevel.CRITICAL) {
        recommendations += 'Immediate escalation to senior compliance officer required.\n';
        recommendations += 'Consider blocking all transactions pending review.';
      } else if (riskLevel === RiskLevel.HIGH) {
        recommendations += 'Review by compliance officer required within 24 hours.\n';
        recommendations += 'Consider additional due diligence requirements.';
      } else {
        recommendations += 'Standard review process applies.\n';
        recommendations += 'Monitor for any changes in risk profile.';
      }
      
      if (hits.some((hit: any) => hit.type === 'POLITICAL_EXPOSURE')) {
        recommendations += '\n\nEnhanced due diligence required for PEP status.';
      }
      
      return recommendations;
    }
  }

  /**
   * Get screening results for an applicant
   */
  async getScreeningResults(applicantId: string): Promise<ScreeningResult[]> {
    return this.screeningResultRepository.find({
      where: { applicantId },
      order: { createdAt: 'DESC' },
    });
  }

  /**
   * Get screening result by ID
   */
  async getScreeningResult(id: string): Promise<ScreeningResult> {
    return this.screeningResultRepository.findOne({ where: { id } });
  }

  /**
   * Update screening result
   */
  async updateScreeningResult(id: string, updates: Partial<ScreeningResult>): Promise<ScreeningResult> {
    await this.screeningResultRepository.update(id, updates);
    return this.screeningResultRepository.findOne({ where: { id } });
  }

  /**
   * Mark screening result as false positive
   */
  async markAsFalsePositive(id: string, reason: string, reviewedBy: string): Promise<ScreeningResult> {
    const screeningResult = await this.screeningResultRepository.findOne({ where: { id } });
    if (!screeningResult) {
      throw new Error('Screening result not found');
    }

    screeningResult.isFalsePositive = true;
    screeningResult.falsePositiveReason = reason;
    screeningResult.reviewedBy = reviewedBy;
    screeningResult.reviewedAt = new Date();

    return this.screeningResultRepository.save(screeningResult);
  }

  /**
   * Retry failed screening
   */
  async retryScreening(id: string): Promise<ScreeningResponse> {
    const screeningResult = await this.screeningResultRepository.findOne({ where: { id } });
    if (!screeningResult) {
      throw new Error('Screening result not found');
    }

    if (screeningResult.status !== ScreeningStatus.FAILED) {
      throw new Error('Only failed screenings can be retried');
    }

    if (screeningResult.retryCount >= 3) {
      throw new Error('Maximum retry attempts exceeded');
    }

    // Get applicant data
    const applicant = await this.applicantRepository.findOne({ where: { id: screeningResult.applicantId } });
    if (!applicant) {
      throw new Error('Applicant not found');
    }

    // Increment retry count
    screeningResult.retryCount += 1;
    screeningResult.nextRetryAt = new Date(Date.now() + 1000 * 60 * 60 * 24); // 24 hours from now
    await this.screeningResultRepository.save(screeningResult);

    // Retry screening
    const request: ScreeningRequest = {
      applicantId: screeningResult.applicantId,
      screeningType: screeningResult.screeningType,
      applicantData: {
        firstName: applicant.firstName,
        lastName: applicant.lastName,
        dateOfBirth: applicant.dateOfBirth,
        nationality: applicant.nationality,
        countryOfResidence: applicant.countryOfResidence,
      },
    };

    return this.initiateScreening(request);
  }

  /**
   * Get screening statistics
   */
  async getScreeningStats(): Promise<{
    total: number;
    pending: number;
    completed: number;
    failed: number;
    hits: number;
    clear: number;
    averageRiskScore: number;
  }> {
    const [total, pending, completed, failed, hits, clear, avgRiskScore] = await Promise.all([
      this.screeningResultRepository.count(),
      this.screeningResultRepository.count({ where: { status: ScreeningStatus.PENDING } }),
      this.screeningResultRepository.count({ where: { status: ScreeningStatus.COMPLETED } }),
      this.screeningResultRepository.count({ where: { status: ScreeningStatus.FAILED } }),
      this.screeningResultRepository.count({ where: { result: ScreeningResultEnum.HIT } }),
      this.screeningResultRepository.count({ where: { result: ScreeningResultEnum.CLEAR } }),
      this.screeningResultRepository
        .createQueryBuilder('screening')
        .select('AVG(screening.riskScore)', 'avgRiskScore')
        .where('screening.riskScore IS NOT NULL')
        .getRawOne(),
    ]);

    return {
      total,
      pending,
      completed,
      failed,
      hits,
      clear,
      averageRiskScore: avgRiskScore?.avgRiskScore || 0,
    };
  }

  /**
   * Clean up expired screening results
   */
  async cleanupExpiredScreenings(): Promise<number> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - 30); // 30 days

    const expiredResults = await this.screeningResultRepository.find({
      where: {
        createdAt: cutoffDate,
        status: ScreeningStatus.COMPLETED,
      },
    });

    let deletedCount = 0;
    for (const result of expiredResults) {
      try {
        await this.screeningResultRepository.remove(result);
        deletedCount++;
      } catch (error) {
        this.logger.warn(`Failed to delete expired screening result: ${result.id}`);
      }
    }

    this.logger.log(`Cleaned up ${deletedCount} expired screening results`);
    return deletedCount;
  }
}
