import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { z } from 'zod';
import { ComplianceRule, RuleType, RuleStatus, RulePriority, RuleOperator, RuleAction } from '../entities/compliance-rule.entity';
import { KYCApplicant, InvestorType, AccreditationStatus } from '../entities/kyc-applicant.entity';

// Zod schemas for rule validation
export const RuleConditionSchema = z.object({
  field: z.string(),
  operator: z.nativeEnum(RuleOperator),
  value: z.any(),
  valueType: z.enum(['string', 'number', 'boolean', 'date', 'array', 'object']),
  logicalOperator: z.enum(['AND', 'OR']).optional(),
});

export const ComplianceRuleSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  ruleType: z.nativeEnum(RuleType),
  status: z.nativeEnum(RuleStatus),
  priority: z.nativeEnum(RulePriority),
  isActive: z.boolean(),
  conditions: z.array(RuleConditionSchema),
  action: z.nativeEnum(RuleAction),
  metadata: z.record(z.any()).optional(),
});

export interface RuleEvaluationContext {
  applicant: KYCApplicant;
  transferAmount?: number;
  assetId?: string;
  fromAddress?: string;
  toAddress?: string;
  timestamp?: Date;
  jurisdiction?: string;
  investorType?: InvestorType;
  accreditationStatus?: AccreditationStatus;
  lockupPeriod?: number;
  transferWindow?: {
    start: Date;
    end: Date;
  };
}

export interface RuleEvaluationResult {
  ruleId: string;
  ruleName: string;
  ruleType: RuleType;
  passed: boolean;
  blocked: boolean;
  reason?: string;
  details: string;
  riskScore: number;
  requiresManualReview: boolean;
  recommendations: string[];
  metadata: Record<string, any>;
}

export interface ComplianceCheckResult {
  overallResult: 'PASS' | 'FAIL' | 'REVIEW_REQUIRED';
  passedRules: number;
  failedRules: number;
  blockedRules: number;
  totalRiskScore: number;
  averageRiskScore: number;
  highestRiskRule?: RuleEvaluationResult;
  evaluationResults: RuleEvaluationResult[];
  summary: string;
  recommendations: string[];
  requiresManualReview: boolean;
  canProceed: boolean;
}

@Injectable()
export class RuleEngineService {
  private readonly logger = new Logger(RuleEngineService.name);

  constructor(
    @InjectRepository(ComplianceRule)
    private readonly complianceRuleRepository: Repository<ComplianceRule>,
  ) {}

  /**
   * Evaluate compliance rules for a given context
   */
  async evaluateCompliance(context: RuleEvaluationContext): Promise<ComplianceCheckResult> {
    this.logger.log(`Evaluating compliance rules for applicant ${context.applicant.id}`);

    try {
      // Get active compliance rules
      const activeRules = await this.complianceRuleRepository.find({
        where: { isActive: true, status: RuleStatus.ACTIVE },
        order: { priority: 'ASC', createdAt: 'ASC' },
      });

      if (activeRules.length === 0) {
        this.logger.warn('No active compliance rules found');
        return this.createDefaultPassResult();
      }

      // Evaluate each rule
      const evaluationResults: RuleEvaluationResult[] = [];
      let totalRiskScore = 0;
      let passedRules = 0;
      let failedRules = 0;
      let blockedRules = 0;

      for (const rule of activeRules) {
        const result = await this.evaluateRule(rule, context);
        evaluationResults.push(result);

        if (result.passed) {
          passedRules++;
        } else {
          failedRules++;
          if (result.blocked) {
            blockedRules++;
          }
        }

        totalRiskScore += result.riskScore;
      }

      const averageRiskScore = totalRiskScore / evaluationResults.length;
      const highestRiskRule = evaluationResults
        .filter(r => !r.passed)
        .sort((a, b) => b.riskScore - a.riskScore)[0];

      // Determine overall result
      const overallResult = this.determineOverallResult(evaluationResults);
      const requiresManualReview = evaluationResults.some(r => r.requiresManualReview);
      const canProceed = overallResult === 'PASS' || (overallResult === 'REVIEW_REQUIRED' && !blockedRules);

      // Generate summary and recommendations
      const summary = this.generateSummary(evaluationResults, overallResult, blockedRules);
      const recommendations = this.generateRecommendations(evaluationResults, overallResult);

      const result: ComplianceCheckResult = {
        overallResult,
        passedRules,
        failedRules,
        blockedRules,
        totalRiskScore,
        averageRiskScore,
        highestRiskRule,
        evaluationResults,
        summary,
        recommendations,
        requiresManualReview,
        canProceed,
      };

      this.logger.log(`Compliance evaluation completed: ${overallResult} (${passedRules}/${activeRules.length} rules passed)`);

      return result;
    } catch (error) {
      this.logger.error(`Compliance evaluation failed: ${error.message}`);
      throw error;
    }
  }

  /**
   * Evaluate a single compliance rule
   */
  private async evaluateRule(rule: ComplianceRule, context: RuleEvaluationContext): Promise<RuleEvaluationResult> {
    try {
      // Parse and validate rule conditions
      const conditions = rule.conditions;
      if (!conditions || conditions.length === 0) {
        return this.createRuleResult(rule, true, false, 'No conditions defined', 0);
      }

      // Evaluate conditions
      const conditionResults = await Promise.all(
        conditions.map(condition => this.evaluateCondition(condition, context))
      );

      // Apply logical operators
      const finalResult = this.applyLogicalOperators(conditionResults, conditions);
      const passed = finalResult.every(r => r.passed);

      // Determine risk score and blocking
      const riskScore = this.calculateRiskScore(rule, finalResult, context);
      const blocked = !passed && rule.action === RuleAction.BLOCK;
      const requiresManualReview = !passed && (rule.action === RuleAction.REVIEW || riskScore >= 70);

      // Generate reason and details
      const reason = passed ? undefined : this.generateRuleFailureReason(rule, finalResult);
      const details = this.generateRuleDetails(rule, finalResult, context);
      const recommendations = this.generateRuleRecommendations(rule, finalResult, context);

      return {
        ruleId: rule.id,
        ruleName: rule.name,
        ruleType: rule.ruleType,
        passed,
        blocked,
        reason,
        details,
        riskScore,
        requiresManualReview,
        recommendations,
        metadata: {
          rulePriority: rule.priority,
          ruleAction: rule.action,
          conditionCount: conditions.length,
          passedConditions: finalResult.filter(r => r.passed).length,
        },
      };
    } catch (error) {
      this.logger.error(`Rule evaluation failed for rule ${rule.id}: ${error.message}`);
      return this.createRuleResult(rule, false, true, `Rule evaluation error: ${error.message}`, 100);
    }
  }

  /**
   * Evaluate a single condition
   */
  private async evaluateCondition(condition: any, context: RuleEvaluationContext): Promise<{
    passed: boolean;
    value: any;
    expectedValue: any;
    operator: RuleOperator;
    field: string;
  }> {
    const { field, operator, value, valueType } = condition;
    
    // Get actual value from context
    const actualValue = this.extractValueFromContext(field, context);
    const expectedValue = this.convertValueType(value, valueType);

    // Apply operator
    const passed = this.applyOperator(actualValue, operator, expectedValue);

    return {
      passed,
      value: actualValue,
      expectedValue,
      operator,
      field,
    };
  }

  /**
   * Extract value from context based on field path
   */
  private extractValueFromContext(field: string, context: RuleEvaluationContext): any {
    const fieldPath = field.split('.');
    let current: any = context;

    for (const path of fieldPath) {
      if (current && typeof current === 'object' && path in current) {
        current = current[path];
      } else {
        return undefined;
      }
    }

    return current;
  }

  /**
   * Convert value to specified type
   */
  private convertValueType(value: any, valueType: string): any {
    switch (valueType) {
      case 'string':
        return String(value);
      case 'number':
        return Number(value);
      case 'boolean':
        return Boolean(value);
      case 'date':
        return new Date(value);
      case 'array':
        return Array.isArray(value) ? value : [value];
      case 'object':
        return typeof value === 'object' ? value : { value };
      default:
        return value;
    }
  }

  /**
   * Apply operator to compare values
   */
  private applyOperator(actual: any, operator: RuleOperator, expected: any): boolean {
    switch (operator) {
      case RuleOperator.EQUALS:
        return actual === expected;
      case RuleOperator.NOT_EQUALS:
        return actual !== expected;
      case RuleOperator.GREATER_THAN:
        return Number(actual) > Number(expected);
      case RuleOperator.LESS_THAN:
        return Number(actual) < Number(expected);
      case RuleOperator.GREATER_THAN_OR_EQUAL:
        return Number(actual) >= Number(expected);
      case RuleOperator.LESS_THAN_OR_EQUAL:
        return Number(actual) <= Number(expected);
      case RuleOperator.CONTAINS:
        return String(actual).includes(String(expected));
      case RuleOperator.NOT_CONTAINS:
        return !String(actual).includes(String(expected));
      case RuleOperator.IN:
        return Array.isArray(expected) && expected.includes(actual);
      case RuleOperator.NOT_IN:
        return Array.isArray(expected) && !expected.includes(actual);
      case RuleOperator.REGEX:
        try {
          const regex = new RegExp(expected);
          return regex.test(String(actual));
        } catch {
          return false;
        }
      case RuleOperator.EXISTS:
        return actual !== undefined && actual !== null;
      case RuleOperator.NOT_EXISTS:
        return actual === undefined || actual === null;
      case RuleOperator.BETWEEN:
        if (Array.isArray(expected) && expected.length === 2) {
          const [min, max] = expected;
          return Number(actual) >= Number(min) && Number(actual) <= Number(max);
        }
        return false;
      case RuleOperator.STARTS_WITH:
        return String(actual).startsWith(String(expected));
      case RuleOperator.ENDS_WITH:
        return String(actual).endsWith(String(expected));
      default:
        return false;
    }
  }

  /**
   * Apply logical operators between conditions
   */
  private applyLogicalOperators(conditionResults: any[], conditions: any[]): any[] {
    if (conditionResults.length <= 1) {
      return conditionResults;
    }

    const results = [...conditionResults];
    
    for (let i = 0; i < conditions.length - 1; i++) {
      const currentCondition = conditions[i];
      const nextCondition = conditions[i + 1];
      
      if (currentCondition.logicalOperator === 'OR') {
        // OR logic: if current passes, skip next
        if (results[i].passed) {
          results[i + 1] = { ...results[i + 1], passed: true };
        }
      }
      // AND logic is default (both must pass)
    }

    return results;
  }

  /**
   * Calculate risk score for a rule
   */
  private calculateRiskScore(rule: ComplianceRule, conditionResults: any[], context: RuleEvaluationContext): number {
    let baseRisk = 0;

    // Base risk based on rule type and priority
    switch (rule.ruleType) {
      case RuleType.JURISDICTION:
        baseRisk = 30;
        break;
      case RuleType.INVESTOR_TYPE:
        baseRisk = 25;
        break;
      case RuleType.LOCKUP_PERIOD:
        baseRisk = 40;
        break;
      case RuleType.TRANSFER_WINDOW:
        baseRisk = 35;
        break;
      case RuleType.AMOUNT_LIMIT:
        baseRisk = 45;
        break;
      case RuleType.SANCTIONS:
        baseRisk = 90;
        break;
      case RuleType.AML:
        baseRisk = 70;
        break;
      case RuleType.PEP:
        baseRisk = 60;
        break;
      default:
        baseRisk = 50;
    }

    // Adjust based on priority
    switch (rule.priority) {
      case RulePriority.CRITICAL:
        baseRisk += 20;
        break;
      case RulePriority.HIGH:
        baseRisk += 10;
        break;
      case RulePriority.LOW:
        baseRisk -= 10;
        break;
    }

    // Adjust based on failed conditions
    const failedConditions = conditionResults.filter(r => !r.passed).length;
    const totalConditions = conditionResults.length;
    if (totalConditions > 0) {
      baseRisk += (failedConditions / totalConditions) * 30;
    }

    // Context-specific adjustments
    if (context.investorType === InvestorType.INDIVIDUAL && context.accreditationStatus === AccreditationStatus.NON_ACCREDITED) {
      baseRisk += 15;
    }

    if (context.jurisdiction && ['US', 'CA', 'GB'].includes(context.jurisdiction)) {
      baseRisk += 10; // Higher regulatory scrutiny
    }

    return Math.min(100, Math.max(0, Math.round(baseRisk)));
  }

  /**
   * Generate rule failure reason
   */
  private generateRuleFailureReason(rule: ComplianceRule, conditionResults: any[]): string {
    const failedConditions = conditionResults.filter(r => !r.passed);
    if (failedConditions.length === 0) return '';

    const failedFields = failedConditions.map(c => c.field).join(', ');
    return `Rule "${rule.name}" failed: conditions not met for fields: ${failedFields}`;
  }

  /**
   * Generate detailed rule information
   */
  private generateRuleDetails(rule: ComplianceRule, conditionResults: any[], context: RuleEvaluationContext): string {
    const details = [`Rule: ${rule.name}`, `Type: ${rule.ruleType}`, `Priority: ${rule.priority}`];
    
    if (rule.description) {
      details.push(`Description: ${rule.description}`);
    }

    details.push('\nCondition Results:');
    conditionResults.forEach((result, index) => {
      const status = result.passed ? '✓ PASS' : '✗ FAIL';
      details.push(`${index + 1}. ${result.field} ${result.operator} ${result.expectedValue} - ${status}`);
    });

    details.push(`\nAction: ${rule.action}`);
    details.push(`Risk Score: ${this.calculateRiskScore(rule, conditionResults, context)}`);

    return details.join('\n');
  }

  /**
   * Generate rule-specific recommendations
   */
  private generateRuleRecommendations(rule: ComplianceRule, conditionResults: any[], context: RuleEvaluationContext): string[] {
    const recommendations: string[] = [];
    const failedConditions = conditionResults.filter(r => !r.passed);

    if (failedConditions.length === 0) {
      return ['All conditions passed - no action required'];
    }

    // Rule-specific recommendations
    switch (rule.ruleType) {
      case RuleType.JURISDICTION:
        recommendations.push('Verify jurisdiction compliance requirements');
        recommendations.push('Check if applicant meets residency requirements');
        break;
      case RuleType.INVESTOR_TYPE:
        recommendations.push('Verify investor classification');
        recommendations.push('Check accreditation status if applicable');
        break;
      case RuleType.LOCKUP_PERIOD:
        recommendations.push('Verify lockup period compliance');
        recommendations.push('Check if minimum holding period is met');
        break;
      case RuleType.TRANSFER_WINDOW:
        recommendations.push('Verify transfer window timing');
        recommendations.push('Check if current time is within allowed window');
        break;
      case RuleType.AMOUNT_LIMIT:
        recommendations.push('Verify amount limits');
        recommendations.push('Check if transfer amount is within allowed range');
        break;
      case RuleType.SANCTIONS:
        recommendations.push('Immediate sanctions screening required');
        recommendations.push('Block all transactions pending review');
        break;
      case RuleType.AML:
        recommendations.push('Enhanced due diligence required');
        recommendations.push('Review source of funds');
        break;
      case RuleType.PEP:
        recommendations.push('PEP screening required');
        recommendations.push('Enhanced monitoring recommended');
        break;
    }

    // General recommendations
    if (rule.priority === RulePriority.CRITICAL) {
      recommendations.unshift('CRITICAL: Immediate attention required');
    }

    if (rule.action === RuleAction.BLOCK) {
      recommendations.unshift('TRANSACTION BLOCKED: Manual review required');
    }

    return recommendations;
  }

  /**
   * Determine overall compliance result
   */
  private determineOverallResult(evaluationResults: RuleEvaluationResult[]): 'PASS' | 'FAIL' | 'REVIEW_REQUIRED' {
    const hasBlocked = evaluationResults.some(r => r.blocked);
    const hasFailures = evaluationResults.some(r => !r.passed);
    const hasManualReview = evaluationResults.some(r => r.requiresManualReview);

    if (hasBlocked) {
      return 'FAIL';
    } else if (hasFailures || hasManualReview) {
      return 'REVIEW_REQUIRED';
    } else {
      return 'PASS';
    }
  }

  /**
   * Generate overall summary
   */
  private generateSummary(evaluationResults: RuleEvaluationResult[], overallResult: string, blockedRules: number): string {
    const totalRules = evaluationResults.length;
    const passedRules = evaluationResults.filter(r => r.passed).length;
    const failedRules = evaluationResults.filter(r => !r.passed).length;

    let summary = `Compliance check completed: ${overallResult}`;
    summary += `\nRules evaluated: ${totalRules}`;
    summary += `\nRules passed: ${passedRules}`;
    summary += `\nRules failed: ${failedRules}`;

    if (blockedRules > 0) {
      summary += `\nRules blocked: ${blockedRules}`;
    }

    if (overallResult === 'REVIEW_REQUIRED') {
      summary += '\nManual review required for some rules';
    }

    return summary;
  }

  /**
   * Generate overall recommendations
   */
  private generateRecommendations(evaluationResults: RuleEvaluationResult[], overallResult: string): string[] {
    const recommendations: string[] = [];

    if (overallResult === 'PASS') {
      recommendations.push('All compliance requirements met - proceed with transaction');
      return recommendations;
    }

    if (overallResult === 'FAIL') {
      recommendations.push('CRITICAL: Transaction blocked - immediate review required');
      recommendations.push('Contact compliance team for urgent review');
      return recommendations;
    }

    // REVIEW_REQUIRED
    recommendations.push('Manual review required before proceeding');
    
    const highRiskRules = evaluationResults.filter(r => r.riskScore >= 70);
    if (highRiskRules.length > 0) {
      recommendations.push(`High-risk rules detected: ${highRiskRules.length} rules require immediate attention`);
    }

    const blockedRules = evaluationResults.filter(r => r.blocked);
    if (blockedRules.length > 0) {
      recommendations.push(`Blocked rules: ${blockedRules.length} rules are currently blocking transactions`);
    }

    recommendations.push('Review all failed rules and take appropriate action');
    recommendations.push('Consider additional due diligence if required');

    return recommendations;
  }

  /**
   * Create default pass result when no rules exist
   */
  private createDefaultPassResult(): ComplianceCheckResult {
    return {
      overallResult: 'PASS',
      passedRules: 0,
      failedRules: 0,
      blockedRules: 0,
      totalRiskScore: 0,
      averageRiskScore: 0,
      evaluationResults: [],
      summary: 'No active compliance rules found - default pass',
      recommendations: ['No compliance rules configured - consider setting up rules'],
      requiresManualReview: false,
      canProceed: true,
    };
  }

  /**
   * Create rule result for error cases
   */
  private createRuleResult(rule: ComplianceRule, passed: boolean, blocked: boolean, reason: string, riskScore: number): RuleEvaluationResult {
    return {
      ruleId: rule.id,
      ruleName: rule.name,
      ruleType: rule.ruleType,
      passed,
      blocked,
      reason,
      details: `Error evaluating rule: ${reason}`,
      riskScore,
      requiresManualReview: true,
      recommendations: ['Manual review required due to evaluation error'],
      metadata: {
        rulePriority: rule.priority,
        ruleAction: rule.action,
        error: true,
      },
    };
  }

  /**
   * Create a new compliance rule
   */
  async createRule(ruleData: z.infer<typeof ComplianceRuleSchema>): Promise<ComplianceRule> {
    const validatedData = ComplianceRuleSchema.parse(ruleData);
    const rule = this.complianceRuleRepository.create(validatedData);
    return this.complianceRuleRepository.save(rule);
  }

  /**
   * Update an existing compliance rule
   */
  async updateRule(id: string, updates: Partial<z.infer<typeof ComplianceRuleSchema>>): Promise<ComplianceRule> {
    const validatedUpdates = ComplianceRuleSchema.partial().parse(updates);
    await this.complianceRuleRepository.update(id, validatedUpdates);
    return this.complianceRuleRepository.findOne({ where: { id } });
  }

  /**
   * Delete a compliance rule
   */
  async deleteRule(id: string): Promise<void> {
    await this.complianceRuleRepository.delete(id);
  }

  /**
   * Get all compliance rules
   */
  async getRules(): Promise<ComplianceRule[]> {
    return this.complianceRuleRepository.find({
      order: { priority: 'ASC', createdAt: 'ASC' },
    });
  }

  /**
   * Get rule by ID
   */
  async getRule(id: string): Promise<ComplianceRule> {
    return this.complianceRuleRepository.findOne({ where: { id } });
  }

  /**
   * Activate/deactivate a rule
   */
  async toggleRuleStatus(id: string, isActive: boolean): Promise<ComplianceRule> {
    await this.complianceRuleRepository.update(id, { isActive });
    return this.complianceRuleRepository.findOne({ where: { id } });
  }

  /**
   * Get rule statistics
   */
  async getRuleStats(): Promise<{
    total: number;
    active: number;
    inactive: number;
    byType: Record<RuleType, number>;
    byPriority: Record<RulePriority, number>;
  }> {
    const [total, active, inactive, byType, byPriority] = await Promise.all([
      this.complianceRuleRepository.count(),
      this.complianceRuleRepository.count({ where: { isActive: true } }),
      this.complianceRuleRepository.count({ where: { isActive: false } }),
      this.complianceRuleRepository
        .createQueryBuilder('rule')
        .select('rule.ruleType', 'type')
        .addSelect('COUNT(*)', 'count')
        .groupBy('rule.ruleType')
        .getRawMany(),
      this.complianceRuleRepository
        .createQueryBuilder('rule')
        .select('rule.priority', 'priority')
        .addSelect('COUNT(*)', 'count')
        .groupBy('rule.priority')
        .getRawMany(),
    ]);

    const typeStats = byType.reduce((acc, item) => {
      acc[item.type as RuleType] = parseInt(item.count);
      return acc;
    }, {} as Record<RuleType, number>);

    const priorityStats = byPriority.reduce((acc, item) => {
      acc[item.priority as RulePriority] = parseInt(item.count);
      return acc;
    }, {} as Record<RulePriority, number>);

    return {
      total,
      active,
      inactive,
      byType: typeStats,
      byPriority: priorityStats,
    };
  }
}
