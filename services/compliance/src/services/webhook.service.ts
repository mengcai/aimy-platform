import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { KYCService } from './kyc.service';
import { RuleEngineService } from './rule-engine.service';
import { ScreeningService } from './screening.service';
import { KYCApplicant, KYCStatus } from '../entities/kyc-applicant.entity';

export interface TransferCheckRequest {
  fromAddress: string;
  toAddress: string;
  amount: number;
  assetId: string;
  timestamp?: Date;
  transactionHash?: string;
  metadata?: Record<string, any>;
}

export interface TransferCheckResponse {
  allowed: boolean;
  reason?: string;
  riskScore: number;
  requiresManualReview: boolean;
  complianceScore: number;
  recommendations: string[];
  restrictions?: {
    maxAmount?: number;
    lockupPeriod?: number;
    transferWindow?: {
      start: Date;
      end: Date;
    };
    jurisdictions?: string[];
  };
  metadata: {
    fromKYCStatus: string;
    toKYCStatus: string;
    fromRiskLevel: string;
    toRiskLevel: string;
    complianceRules: string[];
    screeningResults: string[];
  };
}

export interface WebhookEvent {
  eventType: string;
  timestamp: Date;
  data: any;
  signature?: string;
  source: string;
}

export interface ComplianceAlert {
  alertType: 'TRANSFER_BLOCKED' | 'HIGH_RISK_TRANSFER' | 'COMPLIANCE_VIOLATION' | 'SANCTIONS_HIT';
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  message: string;
  transferDetails: TransferCheckRequest;
  complianceResult: TransferCheckResponse;
  timestamp: Date;
  requiresImmediateAction: boolean;
}

@Injectable()
export class WebhookService {
  private readonly logger = new Logger(WebhookService.name);

  constructor(
    private readonly kycService: KYCService,
    private readonly ruleEngineService: RuleEngineService,
    private readonly screeningService: ScreeningService,
  ) {}

  /**
   * Check if a token transfer is compliant
   */
  async checkTransferCompliance(request: TransferCheckRequest): Promise<TransferCheckResponse> {
    this.logger.log(`Checking transfer compliance: ${request.fromAddress} -> ${request.toAddress} (${request.amount})`);

    try {
      // Get KYC status for both addresses
      const [fromApplicant, toApplicant] = await Promise.all([
        this.getApplicantByAddress(request.fromAddress),
        this.getApplicantByAddress(request.toAddress),
      ]);

      // Check basic KYC requirements
      const kycCheck = await this.performKYCCheck(fromApplicant, toApplicant);
      if (!kycCheck.allowed) {
        return this.createTransferResponse(false, kycCheck.reason, 100, true, 0, kycCheck.recommendations);
      }

      // Check compliance rules
      const complianceCheck = await this.performComplianceCheck(fromApplicant, toApplicant, request);
      if (!complianceCheck.allowed) {
        return this.createTransferResponse(false, complianceCheck.reason, complianceCheck.riskScore, true, complianceCheck.complianceScore, complianceCheck.recommendations);
      }

      // Check sanctions and screening
      const screeningCheck = await this.performScreeningCheck(fromApplicant, toApplicant);
      if (!screeningCheck.allowed) {
        return this.createTransferResponse(false, screeningCheck.reason, screeningCheck.riskScore, true, screeningCheck.complianceScore, screeningCheck.recommendations);
      }

      // Calculate overall risk and compliance scores
      const overallRiskScore = this.calculateOverallRiskScore(kycCheck, complianceCheck, screeningCheck);
      const overallComplianceScore = this.calculateOverallComplianceScore(kycCheck, complianceCheck, screeningCheck);
      const requiresManualReview = overallRiskScore >= 70;

      // Generate recommendations
      const recommendations = this.generateTransferRecommendations(kycCheck, complianceCheck, screeningCheck, overallRiskScore);

      // Determine restrictions
      const restrictions = this.determineTransferRestrictions(fromApplicant, toApplicant, request);

      const response = this.createTransferResponse(
        true,
        'Transfer compliant',
        overallRiskScore,
        requiresManualReview,
        overallComplianceScore,
        recommendations,
        restrictions,
        {
          fromKYCStatus: fromApplicant?.status || 'UNKNOWN',
          toKYCStatus: toApplicant?.status || 'UNKNOWN',
          fromRiskLevel: fromApplicant?.riskLevel || 'UNKNOWN',
          toRiskLevel: toApplicant?.riskLevel || 'UNKNOWN',
          complianceRules: complianceCheck.complianceRules || [],
          screeningResults: screeningCheck.screeningResults || [],
        }
      );

      this.logger.log(`Transfer compliance check completed: ${response.allowed ? 'ALLOWED' : 'BLOCKED'} (Risk: ${overallRiskScore}%)`);

      return response;
    } catch (error) {
      this.logger.error(`Transfer compliance check failed: ${error.message}`);
      
      // Default to blocking on error for safety
      return this.createTransferResponse(
        false,
        `Compliance check failed: ${error.message}`,
        100,
        true,
        0,
        ['Contact compliance team for manual review'],
        undefined,
        {
          fromKYCStatus: 'ERROR',
          toKYCStatus: 'ERROR',
          fromRiskLevel: 'ERROR',
          toRiskLevel: 'ERROR',
          complianceRules: [],
          screeningResults: [],
        }
      );
    }
  }

  /**
   * Get applicant by wallet address
   */
  private async getApplicantByAddress(address: string): Promise<KYCApplicant | null> {
    try {
      // This would typically query by wallet address
      // For now, we'll simulate finding applicants
      const applicants = await this.kycService.getApplicants(1, 100);
      
      // Find applicant with matching wallet address
      return applicants.applicants.find(applicant => 
        applicant.walletAddress?.toLowerCase() === address.toLowerCase()
      ) || null;
    } catch (error) {
      this.logger.warn(`Failed to find applicant for address ${address}: ${error.message}`);
      return null;
    }
  }

  /**
   * Perform KYC status check
   */
  private async performKYCCheck(fromApplicant: KYCApplicant | null, toApplicant: KYCApplicant | null): Promise<{
    allowed: boolean;
    reason?: string;
    recommendations: string[];
  }> {
    const recommendations: string[] = [];

    // Check if both parties have KYC status
    if (!fromApplicant || !toApplicant) {
      return {
        allowed: false,
        reason: 'One or both parties do not have KYC status',
        recommendations: ['Complete KYC verification for all parties'],
      };
    }

    // Check KYC approval status
    if (fromApplicant.status !== KYCStatus.APPROVED) {
      recommendations.push(`Sender KYC status: ${fromApplicant.status} - requires approval`);
    }

    if (toApplicant.status !== KYCStatus.APPROVED) {
      recommendations.push(`Recipient KYC status: ${toApplicant.status} - requires approval`);
    }

    if (fromApplicant.status !== KYCStatus.APPROVED || toApplicant.status !== KYCStatus.APPROVED) {
      return {
        allowed: false,
        reason: 'One or both parties do not have approved KYC status',
        recommendations,
      };
    }

    // Check if addresses are blocked
    if (fromApplicant.isBlocked || toApplicant.isBlocked) {
      return {
        allowed: false,
        reason: 'One or both addresses are blocked',
        recommendations: ['Contact compliance team to review blocked status'],
      };
    }

    return {
      allowed: true,
      recommendations: ['KYC requirements met'],
    };
  }

  /**
   * Perform compliance rule check
   */
  private async performComplianceCheck(
    fromApplicant: KYCApplicant,
    toApplicant: KYCApplicant,
    request: TransferCheckRequest
  ): Promise<{
    allowed: boolean;
    reason?: string;
    riskScore: number;
    complianceScore: number;
    recommendations: string[];
    complianceRules: string[];
  }> {
    try {
      const complianceResult = await this.ruleEngineService.evaluateCompliance({
        applicant: fromApplicant,
        transferAmount: request.amount,
        assetId: request.assetId,
        fromAddress: request.fromAddress,
        toAddress: request.toAddress,
        timestamp: request.timestamp || new Date(),
        jurisdiction: fromApplicant.countryOfResidence,
        investorType: fromApplicant.investorType,
        accreditationStatus: fromApplicant.accreditationStatus,
      });

      const complianceRules = complianceResult.evaluationResults.map(result => 
        `${result.ruleName}: ${result.passed ? 'PASS' : 'FAIL'}`
      );

      if (complianceResult.overallResult === 'FAIL') {
        return {
          allowed: false,
          reason: 'Transfer blocked by compliance rules',
          riskScore: complianceResult.averageRiskScore,
          complianceScore: 0,
          recommendations: complianceResult.recommendations,
          complianceRules,
        };
      }

      return {
        allowed: true,
        riskScore: complianceResult.averageRiskScore,
        complianceScore: 100 - complianceResult.averageRiskScore,
        recommendations: complianceResult.recommendations,
        complianceRules,
      };
    } catch (error) {
      this.logger.error(`Compliance rule check failed: ${error.message}`);
      return {
        allowed: false,
        reason: `Compliance rule evaluation failed: ${error.message}`,
        riskScore: 100,
        complianceScore: 0,
        recommendations: ['Manual review required due to compliance system error'],
        complianceRules: [],
      };
    }
  }

  /**
   * Perform sanctions and screening check
   */
  private async performScreeningCheck(
    fromApplicant: KYCApplicant,
    toApplicant: KYCApplicant
  ): Promise<{
    allowed: boolean;
    reason?: string;
    riskScore: number;
    complianceScore: number;
    recommendations: string[];
    screeningResults: string[];
  }> {
    try {
      // Get latest screening results for both parties
      const [fromScreenings, toScreenings] = await Promise.all([
        this.screeningService.getScreeningResults(fromApplicant.id),
        this.screeningService.getScreeningResults(toApplicant.id),
      ]);

      const screeningResults: string[] = [];
      let hasHits = false;
      let totalRiskScore = 0;
      let screeningCount = 0;

      // Check from applicant screenings
      for (const screening of fromScreenings) {
        if (screening.result === 'HIT') {
          hasHits = true;
          screeningResults.push(`Sender ${screening.screeningType}: HIT - ${screening.summary}`);
        }
        if (screening.riskScore) {
          totalRiskScore += screening.riskScore;
          screeningCount++;
        }
      }

      // Check to applicant screenings
      for (const screening of toScreenings) {
        if (screening.result === 'HIT') {
          hasHits = true;
          screeningResults.push(`Recipient ${screening.screeningType}: HIT - ${screening.summary}`);
        }
        if (screening.riskScore) {
          totalRiskScore += screening.riskScore;
          screeningCount++;
        }
      }

      const averageRiskScore = screeningCount > 0 ? totalRiskScore / screeningCount : 0;

      if (hasHits) {
        return {
          allowed: false,
          reason: 'Sanctions or screening hits detected',
          riskScore: averageRiskScore,
          complianceScore: Math.max(0, 100 - averageRiskScore),
          recommendations: [
            'Transfer blocked due to sanctions or screening hits',
            'Manual review required by compliance officer',
            'Consider additional due diligence',
          ],
          screeningResults,
        };
      }

      return {
        allowed: true,
        riskScore: averageRiskScore,
        complianceScore: Math.max(0, 100 - averageRiskScore),
        recommendations: ['No screening hits detected'],
        screeningResults,
      };
    } catch (error) {
      this.logger.error(`Screening check failed: ${error.message}`);
      return {
        allowed: false,
        reason: `Screening check failed: ${error.message}`,
        riskScore: 100,
        complianceScore: 0,
        recommendations: ['Manual review required due to screening system error'],
        screeningResults: [],
      };
    }
  }

  /**
   * Calculate overall risk score
   */
  private calculateOverallRiskScore(
    kycCheck: any,
    complianceCheck: any,
    screeningCheck: any
  ): number {
    const weights = {
      kyc: 0.3,
      compliance: 0.4,
      screening: 0.3,
    };

    const kycRisk = kycCheck.allowed ? 0 : 100;
    const complianceRisk = complianceCheck.riskScore || 0;
    const screeningRisk = screeningCheck.riskScore || 0;

    return Math.round(
      kycRisk * weights.kyc +
      complianceRisk * weights.compliance +
      screeningRisk * weights.screening
    );
  }

  /**
   * Calculate overall compliance score
   */
  private calculateOverallComplianceScore(
    kycCheck: any,
    complianceCheck: any,
    screeningCheck: any
  ): number {
    const weights = {
      kyc: 0.3,
      compliance: 0.4,
      screening: 0.3,
    };

    const kycScore = kycCheck.allowed ? 100 : 0;
    const complianceScore = complianceCheck.complianceScore || 0;
    const screeningScore = screeningCheck.complianceScore || 0;

    return Math.round(
      kycScore * weights.kyc +
      complianceScore * weights.compliance +
      screeningScore * weights.screening
    );
  }

  /**
   * Generate transfer recommendations
   */
  private generateTransferRecommendations(
    kycCheck: any,
    complianceCheck: any,
    screeningCheck: any,
    overallRiskScore: number
  ): string[] {
    const recommendations: string[] = [];

    // Add KYC recommendations
    if (kycCheck.recommendations) {
      recommendations.push(...kycCheck.recommendations);
    }

    // Add compliance recommendations
    if (complianceCheck.recommendations) {
      recommendations.push(...complianceCheck.recommendations);
    }

    // Add screening recommendations
    if (screeningCheck.recommendations) {
      recommendations.push(...screeningCheck.recommendations);
    }

    // Add risk-based recommendations
    if (overallRiskScore >= 80) {
      recommendations.unshift('CRITICAL: High-risk transfer - immediate review required');
    } else if (overallRiskScore >= 60) {
      recommendations.unshift('HIGH: Elevated risk - enhanced monitoring recommended');
    } else if (overallRiskScore >= 40) {
      recommendations.unshift('MEDIUM: Moderate risk - standard monitoring applies');
    } else {
      recommendations.unshift('LOW: Low-risk transfer - proceed with standard procedures');
    }

    return recommendations;
  }

  /**
   * Determine transfer restrictions
   */
  private determineTransferRestrictions(
    fromApplicant: KYCApplicant,
    toApplicant: KYCApplicant,
    request: TransferCheckRequest
  ): {
    maxAmount?: number;
    lockupPeriod?: number;
    transferWindow?: { start: Date; end: Date };
    jurisdictions?: string[];
  } | undefined {
    const restrictions: any = {};

    // Set max amount based on investor type and accreditation
    if (fromApplicant.investorType === 'INDIVIDUAL' && fromApplicant.accreditationStatus === 'NON_ACCREDITED') {
      restrictions.maxAmount = 100000; // $100k limit for non-accredited individuals
    }

    // Set lockup period based on asset type and investor profile
    if (request.assetId.includes('LOCKUP')) {
      restrictions.lockupPeriod = 365 * 24 * 60 * 60 * 1000; // 1 year in milliseconds
    }

    // Set transfer window (example: only during business hours)
    const now = new Date();
    const hour = now.getHours();
    if (hour >= 9 && hour <= 17) {
      restrictions.transferWindow = {
        start: new Date(now.getFullYear(), now.getMonth(), now.getDate(), 9, 0, 0),
        end: new Date(now.getFullYear(), now.getMonth(), now.getDate(), 17, 0, 0),
      };
    }

    // Set jurisdiction restrictions
    restrictions.jurisdictions = ['US', 'CA', 'GB', 'EU']; // Example allowed jurisdictions

    return Object.keys(restrictions).length > 0 ? restrictions : undefined;
  }

  /**
   * Create transfer response
   */
  private createTransferResponse(
    allowed: boolean,
    reason: string,
    riskScore: number,
    requiresManualReview: boolean,
    complianceScore: number,
    recommendations: string[],
    restrictions?: any,
    metadata?: any
  ): TransferCheckResponse {
    return {
      allowed,
      reason: allowed ? undefined : reason,
      riskScore,
      requiresManualReview,
      complianceScore,
      recommendations,
      restrictions,
      metadata: metadata || {
        fromKYCStatus: 'UNKNOWN',
        toKYCStatus: 'UNKNOWN',
        fromRiskLevel: 'UNKNOWN',
        toRiskLevel: 'UNKNOWN',
        complianceRules: [],
        screeningResults: [],
      },
    };
  }

  /**
   * Process webhook event
   */
  async processWebhookEvent(event: WebhookEvent): Promise<void> {
    this.logger.log(`Processing webhook event: ${event.eventType}`);

    try {
      switch (event.eventType) {
        case 'TRANSFER_REQUEST':
          await this.handleTransferRequest(event.data);
          break;
        case 'KYC_STATUS_UPDATE':
          await this.handleKYCStatusUpdate(event.data);
          break;
        case 'SCREENING_RESULT':
          await this.handleScreeningResult(event.data);
          break;
        case 'COMPLIANCE_RULE_UPDATE':
          await this.handleComplianceRuleUpdate(event.data);
          break;
        default:
          this.logger.warn(`Unknown webhook event type: ${event.eventType}`);
      }
    } catch (error) {
      this.logger.error(`Failed to process webhook event: ${error.message}`);
      throw error;
    }
  }

  /**
   * Handle transfer request webhook
   */
  private async handleTransferRequest(data: any): Promise<void> {
    // This would typically trigger additional compliance checks
    // or notify compliance officers of high-risk transfers
    this.logger.log(`Transfer request received: ${data.transactionHash}`);
  }

  /**
   * Handle KYC status update webhook
   */
  private async handleKYCStatusUpdate(data: any): Promise<void> {
    // This would typically update internal caches or trigger
    // re-evaluation of pending transfers
    this.logger.log(`KYC status update received: ${data.applicantId} -> ${data.status}`);
  }

  /**
   * Handle screening result webhook
   */
  private async handleScreeningResult(data: any): Promise<void> {
    // This would typically trigger immediate compliance actions
    // for high-risk screening results
    this.logger.log(`Screening result received: ${data.applicantId} -> ${data.result}`);
  }

  /**
   * Handle compliance rule update webhook
   */
  private async handleComplianceRuleUpdate(data: any): Promise<void> {
    // This would typically clear caches and re-evaluate
    // pending transfers with new rules
    this.logger.log(`Compliance rule update received: ${data.ruleId}`);
  }

  /**
   * Generate compliance alert
   */
  generateComplianceAlert(
    transferDetails: TransferCheckRequest,
    complianceResult: TransferCheckResponse
  ): ComplianceAlert {
    let alertType: ComplianceAlert['alertType'];
    let severity: ComplianceAlert['severity'];

    if (!complianceResult.allowed) {
      alertType = 'TRANSFER_BLOCKED';
      severity = complianceResult.riskScore >= 80 ? 'CRITICAL' : 'HIGH';
    } else if (complianceResult.riskScore >= 70) {
      alertType = 'HIGH_RISK_TRANSFER';
      severity = 'MEDIUM';
    } else if (complianceResult.requiresManualReview) {
      alertType = 'COMPLIANCE_VIOLATION';
      severity = 'LOW';
    } else {
      alertType = 'COMPLIANCE_VIOLATION';
      severity = 'LOW';
    }

    return {
      alertType,
      severity,
      message: complianceResult.reason || 'Transfer requires review',
      transferDetails,
      complianceResult,
      timestamp: new Date(),
      requiresImmediateAction: severity === 'CRITICAL' || severity === 'HIGH',
    };
  }

  /**
   * Validate webhook signature
   */
  validateWebhookSignature(event: WebhookEvent, secret: string): boolean {
    // This would implement proper signature validation
    // For now, we'll return true as a placeholder
    return true;
  }
}
