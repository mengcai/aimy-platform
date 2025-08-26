import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FeeCapture, FeeType, FeeCalculation, FeeStatus } from '../entities/fee-capture.entity';
import { InvestorWallet } from '../entities/investor-wallet.entity';
import { Distribution } from '../entities/distribution.entity';

export interface FeeCalculationResult {
  amount: number;
  feeType: FeeType;
  calculationMethod: FeeCalculation;
  rate?: number;
  fixedAmount?: number;
  details: Record<string, any>;
}

@Injectable()
export class FeeService {
  private readonly logger = new Logger(FeeService.name);

  constructor(
    @InjectRepository(FeeCapture)
    private readonly feeCaptureRepository: Repository<FeeCapture>,
  ) {}

  /**
   * Calculate fees for an investor
   */
  async calculateFees(
    wallet: InvestorWallet,
    grossAmount: number,
    distribution: Distribution
  ): Promise<number> {
    this.logger.log(`Calculating fees for investor ${wallet.investor_id}, amount: ${grossAmount}`);

    // Get applicable fee rules
    const applicableFees = await this.getApplicableFees(wallet, grossAmount, distribution);

    if (applicableFees.length === 0) {
      this.logger.log(`No applicable fees found for investor ${wallet.investor_id}`);
      return 0;
    }

    let totalFees = 0;
    const calculationDetails: FeeCalculationResult[] = [];

    for (const fee of applicableFees) {
      try {
        const feeAmount = this.calculateIndividualFee(fee, grossAmount, wallet);
        
        if (feeAmount > 0) {
          totalFees += feeAmount;
          
          calculationDetails.push({
            amount: feeAmount,
            feeType: fee.fee_type,
            calculationMethod: fee.calculation_method,
            rate: fee.rate,
            fixedAmount: fee.fixed_amount,
            details: {
              feeName: fee.fee_name,
              baseAmount: grossAmount,
              dueDate: fee.due_date,
            },
          });

          this.logger.log(`Applied fee ${fee.fee_name}: ${feeAmount}`);
        }
      } catch (error) {
        this.logger.error(`Error calculating fee ${fee.id}: ${error.message}`);
      }
    }

    // Ensure total fees don't exceed gross amount
    if (totalFees > grossAmount) {
      this.logger.warn(`Total fees ${totalFees} exceeds gross amount ${grossAmount}, capping at gross amount`);
      totalFees = grossAmount;
    }

    this.logger.log(`Total fees calculated: ${totalFees} for investor ${wallet.investor_id}`);

    return totalFees;
  }

  /**
   * Get applicable fees for an investor
   */
  private async getApplicableFees(
    wallet: InvestorWallet,
    grossAmount: number,
    distribution: Distribution
  ): Promise<FeeCapture[]> {
    // Get all active fees
    const activeFees = await this.feeCaptureRepository.find({
      where: { status: FeeStatus.PENDING },
    });

    return activeFees.filter(fee => this.isFeeApplicable(fee, wallet, grossAmount, distribution));
  }

  /**
   * Check if a fee is applicable
   */
  private isFeeApplicable(
    fee: FeeCapture,
    wallet: InvestorWallet,
    grossAmount: number,
    distribution: Distribution
  ): boolean {
    // Check if fee is for this asset
    if (fee.asset_id !== distribution.asset_id) {
      return false;
    }

    // Check if fee is for this investor
    if (fee.investor_id !== wallet.investor_id) {
      return false;
    }

    // Check due date
    if (fee.due_date && new Date() < fee.due_date) {
      return false;
    }

    // Check amount thresholds
    if (fee.base_amount && grossAmount < fee.base_amount) {
      return false;
    }

    return true;
  }

  /**
   * Calculate individual fee amount
   */
  private calculateIndividualFee(
    fee: FeeCapture,
    grossAmount: number,
    wallet: InvestorWallet
  ): number {
    let feeAmount = 0;

    switch (fee.calculation_method) {
      case FeeCalculation.PERCENTAGE:
        feeAmount = grossAmount * fee.rate;
        break;

      case FeeCalculation.FIXED_AMOUNT:
        feeAmount = fee.fixed_amount;
        break;

      case FeeCalculation.TIERED:
        feeAmount = this.calculateTieredFee(fee, grossAmount);
        break;

      case FeeCalculation.FORMULA:
        feeAmount = this.calculateFormulaFee(fee, grossAmount, wallet);
        break;

      case FeeCalculation.PER_UNIT:
        feeAmount = this.calculatePerUnitFee(fee, wallet);
        break;

      default:
        this.logger.warn(`Unknown fee calculation method: ${fee.calculation_method}`);
        return 0;
    }

    return Math.max(0, feeAmount);
  }

  /**
   * Calculate tiered fee
   */
  private calculateTieredFee(fee: FeeCapture, grossAmount: number): number {
    if (!fee.tiered_rates || fee.tiered_rates.length === 0) {
      return 0;
    }

    let feeAmount = 0;
    let remainingAmount = grossAmount;

    // Sort tiers by threshold (ascending)
    const sortedTiers = [...fee.tiered_rates].sort((a, b) => a.threshold - b.threshold);

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
        feeAmount += tierAmount * tier.rate;
        remainingAmount -= tierAmount;
      }

      if (remainingAmount <= 0) {
        break;
      }
    }

    return feeAmount;
  }

  /**
   * Calculate formula-based fee
   */
  private calculateFormulaFee(
    fee: FeeCapture,
    grossAmount: number,
    wallet: InvestorWallet
  ): number {
    if (!fee.formula) {
      return 0;
    }

    try {
      // Simple formula evaluation (in production, use a proper formula parser)
      const variables = {
        amount: grossAmount,
        rate: fee.rate,
        fixed: fee.fixed_amount,
        // Add more variables as needed
      };

      // Replace variables in formula and evaluate
      let formula = fee.formula;
      for (const [key, value] of Object.entries(variables)) {
        formula = formula.replace(new RegExp(`\\$\\{${key}\\}`, 'g'), value.toString());
      }

      const result = this.evaluateSimpleFormula(formula);
      return isNaN(result) ? 0 : result;

    } catch (error) {
      this.logger.error(`Error evaluating fee formula: ${error.message}`);
      return 0;
    }
  }

  /**
   * Calculate per-unit fee
   */
  private calculatePerUnitFee(fee: FeeCapture, wallet: InvestorWallet): number {
    // This would need to be enhanced based on actual unit data
    // For now, assume 1 unit = 1 token
    const units = wallet.metadata?.units || 1;
    return units * fee.rate;
  }

  /**
   * Simple formula evaluation (placeholder)
   */
  private evaluateSimpleFormula(formula: string): number {
    try {
      // This is a very basic implementation - use a proper formula parser in production
      return eval(formula); // WARNING: This is unsafe for production
    } catch {
      return 0;
    }
  }

  /**
   * Create fee capture record
   */
  async createFeeCapture(feeData: Partial<FeeCapture>): Promise<FeeCapture> {
    const fee = this.feeCaptureRepository.create(feeData);
    return this.feeCaptureRepository.save(fee);
  }

  /**
   * Update fee capture status
   */
  async updateFeeStatus(id: string, status: FeeStatus, metadata?: Record<string, any>): Promise<void> {
    const updates: Partial<FeeCapture> = { status };

    switch (status) {
      case FeeStatus.COLLECTED:
        updates.collected_at = new Date();
        updates.collected_fee = updates.calculated_fee;
        break;
      case FeeStatus.WAIVED:
        updates.waived_at = new Date();
        updates.waived_fee = updates.calculated_fee;
        break;
      case FeeStatus.DEFERRED:
        updates.deferred_until = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days
        break;
    }

    if (metadata) {
      updates.fee_metadata = { ...updates.fee_metadata, ...metadata };
    }

    await this.feeCaptureRepository.update(id, updates);
  }

  /**
   * Get fees by investor
   */
  async getFeesByInvestor(investorId: string): Promise<FeeCapture[]> {
    return this.feeCaptureRepository.find({
      where: { investor_id: investorId },
      order: { due_date: 'ASC' },
    });
  }

  /**
   * Get fees by asset
   */
  async getFeesByAsset(assetId: string): Promise<FeeCapture[]> {
    return this.feeCaptureRepository.find({
      where: { asset_id: assetId },
      order: { due_date: 'ASC' },
    });
  }

  /**
   * Get overdue fees
   */
  async getOverdueFees(): Promise<FeeCapture[]> {
    const now = new Date();
    return this.feeCaptureRepository.find({
      where: {
        status: FeeStatus.PENDING,
        due_date: { $lt: now } as any, // TypeORM syntax
      },
      order: { due_date: 'ASC' },
    });
  }

  /**
   * Get fee statistics
   */
  async getFeeStats(): Promise<{
    totalFees: number;
    pendingFees: number;
    collectedFees: number;
    waivedFees: number;
    totalAmount: number;
    collectedAmount: number;
    waivedAmount: number;
    feesByType: Record<string, number>;
  }> {
    const fees = await this.feeCaptureRepository.find();
    
    const pendingFees = fees.filter(f => f.status === FeeStatus.PENDING);
    const collectedFees = fees.filter(f => f.status === FeeStatus.COLLECTED);
    const waivedFees = fees.filter(f => f.status === FeeStatus.WAIVED);

    const feesByType: Record<string, number> = {};
    for (const fee of fees) {
      feesByType[fee.fee_type] = (feesByType[fee.fee_type] || 0) + 1;
    }

    return {
      totalFees: fees.length,
      pendingFees: pendingFees.length,
      collectedFees: collectedFees.length,
      waivedFees: waivedFees.length,
      totalAmount: fees.reduce((sum, f) => sum + f.calculated_fee, 0),
      collectedAmount: collectedFees.reduce((sum, f) => sum + f.collected_fee, 0),
      waivedAmount: waivedFees.reduce((sum, f) => sum + f.waived_fee, 0),
      feesByType,
    };
  }

  /**
   * Process automatic fee collection
   */
  async processAutomaticFeeCollection(): Promise<{
    processed: number;
    successful: number;
    failed: number;
    errors: string[];
  }> {
    const automaticFees = await this.feeCaptureRepository.find({
      where: {
        is_automatic: true,
        status: FeeStatus.PENDING,
        due_date: { $lte: new Date() } as any,
      },
    });

    const results = {
      processed: automaticFees.length,
      successful: 0,
      failed: 0,
      errors: [] as string[],
    };

    for (const fee of automaticFees) {
      try {
        // Simulate fee collection (in real implementation, this would trigger actual collection)
        await this.updateFeeStatus(fee.id, FeeStatus.COLLECTED, {
          collected_via: 'AUTOMATIC',
          collected_at: new Date().toISOString(),
        });

        results.successful++;
        this.logger.log(`Automatically collected fee ${fee.id}: ${fee.calculated_fee}`);

      } catch (error) {
        results.failed++;
        const errorMsg = `Failed to collect fee ${fee.id}: ${error.message}`;
        results.errors.push(errorMsg);
        this.logger.error(errorMsg);
      }
    }

    return results;
  }

  /**
   * Create recurring fee schedule
   */
  async createRecurringFeeSchedule(
    feeData: Partial<FeeCapture>,
    cronExpression: string,
    startDate: Date,
    endDate?: Date
  ): Promise<FeeCapture[]> {
    const fees: FeeCapture[] = [];
    let currentDate = new Date(startDate);

    while (!endDate || currentDate <= endDate) {
      const fee = this.feeCaptureRepository.create({
        ...feeData,
        due_date: new Date(currentDate),
        is_recurring: true,
        cron_expression: cronExpression,
      });

      fees.push(fee);
      
      // Move to next occurrence (simplified - in production, use proper cron parsing)
      currentDate.setMonth(currentDate.getMonth() + 1);
    }

    return this.feeCaptureRepository.save(fees);
  }
}
