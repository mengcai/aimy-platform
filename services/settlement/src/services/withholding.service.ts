import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { WithholdingRule, WithholdingType, WithholdingTrigger, WithholdingCalculation } from '../entities/withholding-rule.entity';
import { InvestorWallet } from '../entities/investor-wallet.entity';
import { Distribution } from '../entities/distribution.entity';

export interface WithholdingCalculationResult {
  amount: number;
  rate: number;
  ruleId: string;
  ruleName: string;
  ruleType: WithholdingType;
  details: Record<string, any>;
}

@Injectable()
export class WithholdingService {
  private readonly logger = new Logger(WithholdingService.name);

  constructor(
    @InjectRepository(WithholdingRule)
    private readonly withholdingRuleRepository: Repository<WithholdingRule>,
  ) {}

  /**
   * Calculate withholding amount for an investor
   */
  async calculateWithholding(
    wallet: InvestorWallet,
    grossAmount: number,
    distribution: Distribution
  ): Promise<number> {
    this.logger.log(`Calculating withholding for investor ${wallet.investor_id}, amount: ${grossAmount}`);

    // Get applicable withholding rules
    const applicableRules = await this.getApplicableRules(wallet, grossAmount, distribution);

    if (applicableRules.length === 0) {
      this.logger.log(`No applicable withholding rules found for investor ${wallet.investor_id}`);
      return 0;
    }

    // Sort rules by priority (highest first)
    applicableRules.sort((a, b) => b.priority - a.priority);

    let totalWithholding = 0;
    const calculationDetails: WithholdingCalculationResult[] = [];

    for (const rule of applicableRules) {
      try {
        const withholdingAmount = this.calculateRuleWithholding(rule, grossAmount, wallet);
        
        if (withholdingAmount > 0) {
          totalWithholding += withholdingAmount;
          
          calculationDetails.push({
            amount: withholdingAmount,
            rate: rule.rate,
            ruleId: rule.id,
            ruleName: rule.name,
            ruleType: rule.type,
            details: {
              calculationMethod: rule.calculation_method,
              triggerType: rule.trigger_type,
              triggerValue: rule.trigger_value,
              jurisdiction: rule.jurisdiction,
            },
          });

          this.logger.log(`Applied rule ${rule.name}: ${withholdingAmount} (${rule.rate * 100}%)`);
        }
      } catch (error) {
        this.logger.error(`Error calculating withholding for rule ${rule.id}: ${error.message}`);
      }
    }

    // Ensure total withholding doesn't exceed gross amount
    if (totalWithholding > grossAmount) {
      this.logger.warn(`Total withholding ${totalWithholding} exceeds gross amount ${grossAmount}, capping at gross amount`);
      totalWithholding = grossAmount;
    }

    this.logger.log(`Total withholding calculated: ${totalWithholding} for investor ${wallet.investor_id}`);

    return totalWithholding;
  }

  /**
   * Get applicable withholding rules for an investor
   */
  private async getApplicableRules(
    wallet: InvestorWallet,
    grossAmount: number,
    distribution: Distribution
  ): Promise<WithholdingRule[]> {
    const rules: WithholdingRule[] = [];

    // Get all active rules
    const activeRules = await this.withholdingRuleRepository.find({
      where: { is_active: true },
    });

    for (const rule of activeRules) {
      if (this.isRuleApplicable(rule, wallet, grossAmount, distribution)) {
        rules.push(rule);
      }
    }

    return rules;
  }

  /**
   * Check if a withholding rule is applicable
   */
  private isRuleApplicable(
    rule: WithholdingRule,
    wallet: InvestorWallet,
    grossAmount: number,
    distribution: Distribution
  ): boolean {
    // Check effective dates
    if (rule.effective_from && new Date() < rule.effective_from) {
      return false;
    }
    if (rule.effective_until && new Date() > rule.effective_until) {
      return false;
    }

    // Check trigger conditions
    switch (rule.trigger_type) {
      case WithholdingTrigger.AMOUNT_THRESHOLD:
        return this.checkAmountThreshold(rule, grossAmount);

      case WithholdingTrigger.JURISDICTION:
        return this.checkJurisdiction(rule, wallet);

      case WithholdingTrigger.INVESTOR_TYPE:
        return this.checkInvestorType(rule, wallet);

      case WithholdingTrigger.ASSET_TYPE:
        return this.checkAssetType(rule, distribution);

      case WithholdingTrigger.DISTRIBUTION_TYPE:
        return this.checkDistributionType(rule, distribution);

      case WithholdingTrigger.TIME_BASED:
        return this.checkTimeBased(rule);

      default:
        return false;
    }
  }

  /**
   * Check amount threshold trigger
   */
  private checkAmountThreshold(rule: WithholdingRule, grossAmount: number): boolean {
    if (rule.minimum_amount && grossAmount < rule.minimum_amount) {
      return false;
    }
    if (rule.maximum_amount && grossAmount > rule.maximum_amount) {
      return false;
    }
    return true;
  }

  /**
   * Check jurisdiction trigger
   */
  private checkJurisdiction(rule: WithholdingRule, wallet: InvestorWallet): boolean {
    if (!wallet.jurisdiction) {
      return false;
    }

    // Check if rule jurisdiction matches wallet jurisdiction
    if (rule.jurisdiction === wallet.jurisdiction) {
      return true;
    }

    // Check sub-jurisdiction
    if (rule.sub_jurisdiction && wallet.jurisdiction.includes(rule.sub_jurisdiction)) {
      return true;
    }

    return false;
  }

  /**
   * Check investor type trigger
   */
  private checkInvestorType(rule: WithholdingRule, wallet: InvestorWallet): boolean {
    if (!rule.investor_type || !wallet.metadata?.investorType) {
      return false;
    }

    return rule.investor_type === wallet.metadata.investorType;
  }

  /**
   * Check asset type trigger
   */
  private checkAssetType(rule: WithholdingRule, distribution: Distribution): boolean {
    if (!rule.asset_type) {
      return false;
    }

    // This would need to be enhanced based on actual asset type data
    return rule.asset_type === 'GENERAL'; // Placeholder
  }

  /**
   * Check distribution type trigger
   */
  private checkDistributionType(rule: WithholdingRule, distribution: Distribution): boolean {
    if (!rule.distribution_type) {
      return false;
    }

    return rule.distribution_type === distribution.type;
  }

  /**
   * Check time-based trigger
   */
  private checkTimeBased(rule: WithholdingRule): boolean {
    // Implement time-based logic (e.g., fiscal year, specific dates)
    // For now, return true as placeholder
    return true;
  }

  /**
   * Calculate withholding amount for a specific rule
   */
  private calculateRuleWithholding(
    rule: WithholdingRule,
    grossAmount: number,
    wallet: InvestorWallet
  ): number {
    let withholdingAmount = 0;

    switch (rule.calculation_method) {
      case WithholdingCalculation.PERCENTAGE:
        withholdingAmount = grossAmount * rule.rate;
        break;

      case WithholdingCalculation.FIXED_AMOUNT:
        withholdingAmount = rule.fixed_amount;
        break;

      case WithholdingCalculation.TIERED:
        withholdingAmount = this.calculateTieredWithholding(rule, grossAmount);
        break;

      case WithholdingCalculation.FORMULA:
        withholdingAmount = this.calculateFormulaWithholding(rule, grossAmount, wallet);
        break;

      default:
        this.logger.warn(`Unknown calculation method: ${rule.calculation_method}`);
        return 0;
    }

    // Apply exemptions
    withholdingAmount = this.applyExemptions(rule, withholdingAmount, wallet);

    return Math.max(0, withholdingAmount);
  }

  /**
   * Calculate tiered withholding
   */
  private calculateTieredWithholding(rule: WithholdingRule, grossAmount: number): number {
    if (!rule.tiered_rates || rule.tiered_rates.length === 0) {
      return 0;
    }

    let withholdingAmount = 0;
    let remainingAmount = grossAmount;

    // Sort tiers by threshold (ascending)
    const sortedTiers = [...rule.tiered_rates].sort((a, b) => a.threshold - b.threshold);

    for (let i = 0; i < sortedTiers.length; i++) {
      const tier = sortedTiers[i];
      const nextTier = sortedTiers[i + 1];
      
      let tierAmount: number;
      if (nextTier) {
        tierAmount = Math.min(remainingAmount, nextTier.threshold - tier.threshold);
      } else {
        tierAmount = remainingAmount;
      }

      if (tierAmount > 0) {
        withholdingAmount += tierAmount * tier.rate;
        remainingAmount -= tierAmount;
      }

      if (remainingAmount <= 0) {
        break;
      }
    }

    return withholdingAmount;
  }

  /**
   * Calculate formula-based withholding
   */
  private calculateFormulaWithholding(
    rule: WithholdingRule,
    grossAmount: number,
    wallet: InvestorWallet
  ): number {
    if (!rule.formula) {
      return 0;
    }

    try {
      // Simple formula evaluation (in production, use a proper formula parser)
      // This is a placeholder implementation
      const variables = {
        amount: grossAmount,
        rate: rule.rate,
        fixed: rule.fixed_amount,
        // Add more variables as needed
      };

      // Replace variables in formula and evaluate
      let formula = rule.formula;
      for (const [key, value] of Object.entries(variables)) {
        formula = formula.replace(new RegExp(`\\$\\{${key}\\}`, 'g'), value.toString());
      }

      // Basic arithmetic evaluation (use a proper library in production)
      const result = this.evaluateSimpleFormula(formula);
      return isNaN(result) ? 0 : result;

    } catch (error) {
      this.logger.error(`Error evaluating formula: ${error.message}`);
      return 0;
    }
  }

  /**
   * Simple formula evaluation (placeholder)
   */
  private evaluateSimpleFormula(formula: string): number {
    try {
      // This is a very basic implementation - use a proper formula parser in production
      // For now, just handle basic arithmetic
      return eval(formula); // WARNING: This is unsafe for production
    } catch {
      return 0;
    }
  }

  /**
   * Apply exemptions to withholding amount
   */
  private applyExemptions(
    rule: WithholdingRule,
    withholdingAmount: number,
    wallet: InvestorWallet
  ): number {
    if (!rule.exemptions || rule.exemptions.length === 0) {
      return withholdingAmount;
    }

    let exemptedAmount = 0;

    for (const exemption of rule.exemptions) {
      if (this.isExemptionApplicable(exemption, wallet)) {
        if (exemption.type === 'PERCENTAGE') {
          exemptedAmount += withholdingAmount * (exemption.value / 100);
        } else if (exemption.type === 'FIXED') {
          exemptedAmount += exemption.value;
        }
      }
    }

    return Math.max(0, withholdingAmount - exemptedAmount);
  }

  /**
   * Check if an exemption is applicable
   */
  private isExemptionApplicable(exemption: any, wallet: InvestorWallet): boolean {
    // Check exemption conditions
    if (exemption.conditions) {
      for (const [key, value] of Object.entries(exemption.conditions)) {
        if (wallet.metadata?.[key] !== value) {
          return false;
        }
      }
    }

    return true;
  }

  /**
   * Get withholding rules by jurisdiction
   */
  async getWithholdingRulesByJurisdiction(jurisdiction: string): Promise<WithholdingRule[]> {
    return this.withholdingRuleRepository.find({
      where: {
        jurisdiction,
        is_active: true,
      },
      order: { priority: 'DESC', created_at: 'ASC' },
    });
  }

  /**
   * Get withholding statistics
   */
  async getWithholdingStats(): Promise<{
    totalRules: number;
    activeRules: number;
    rulesByType: Record<string, number>;
    rulesByJurisdiction: Record<string, number>;
  }> {
    const rules = await this.withholdingRuleRepository.find();
    
    const activeRules = rules.filter(r => r.is_active);
    const rulesByType: Record<string, number> = {};
    const rulesByJurisdiction: Record<string, number> = {};

    for (const rule of rules) {
      rulesByType[rule.type] = (rulesByType[rule.type] || 0) + 1;
      rulesByJurisdiction[rule.jurisdiction] = (rulesByJurisdiction[rule.jurisdiction] || 0) + 1;
    }

    return {
      totalRules: rules.length,
      activeRules: activeRules.length,
      rulesByType,
      rulesByJurisdiction,
    };
  }

  /**
   * Create a new withholding rule
   */
  async createWithholdingRule(ruleData: Partial<WithholdingRule>): Promise<WithholdingRule> {
    const rule = this.withholdingRuleRepository.create(ruleData);
    return this.withholdingRuleRepository.save(rule);
  }

  /**
   * Update a withholding rule
   */
  async updateWithholdingRule(id: string, updates: Partial<WithholdingRule>): Promise<void> {
    await this.withholdingRuleRepository.update(id, updates);
  }

  /**
   * Delete a withholding rule
   */
  async deleteWithholdingRule(id: string): Promise<void> {
    await this.withholdingRuleRepository.delete(id);
  }
}
