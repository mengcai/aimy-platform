import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PayoutRun, PayoutRunStatus, PayoutRunType } from '../entities/payout-run.entity';
import { PayoutReceipt, ReceiptStatus } from '../entities/payout-receipt.entity';
import { Distribution } from '../entities/distribution.entity';
import { InvestorWallet } from '../entities/investor-wallet.entity';
import { StablecoinAdapterService } from '../adapters/stablecoin-adapter';
import { WithholdingService } from './withholding.service';
import { FeeService } from './fee.service';

export interface PayoutCalculation {
  investorId: string;
  walletAddress: string;
  tokenBalance: number;
  proRataShare: number;
  grossAmount: number;
  withholdingAmount: number;
  feeAmount: number;
  netAmount: number;
  stablecoinType: string;
}

export interface PayoutRunRequest {
  distributionId: string;
  isDryRun?: boolean;
  initiatedBy?: string;
  batchSize?: number;
  retryConfig?: Record<string, any>;
}

export interface PayoutRunResult {
  success: boolean;
  payoutRunId: string;
  totalRecipients: number;
  successfulPayouts: number;
  failedPayouts: number;
  totalAmount: number;
  totalFees: number;
  totalWithholding: number;
  receipts: PayoutReceipt[];
  errors?: string[];
}

@Injectable()
export class PayoutService {
  private readonly logger = new Logger(PayoutService.name);

  constructor(
    @InjectRepository(PayoutRun)
    private readonly payoutRunRepository: Repository<PayoutRun>,
    @InjectRepository(PayoutReceipt)
    private readonly receiptRepository: Repository<PayoutReceipt>,
    @InjectRepository(Distribution)
    private readonly distributionRepository: Repository<Distribution>,
    @InjectRepository(InvestorWallet)
    private readonly walletRepository: Repository<InvestorWallet>,
    private readonly stablecoinAdapter: StablecoinAdapterService,
    private readonly withholdingService: WithholdingService,
    private readonly feeService: FeeService,
  ) {}

  /**
   * Execute a payout run for a distribution
   */
  async executePayoutRun(request: PayoutRunRequest): Promise<PayoutRunResult> {
    const { distributionId, isDryRun = false, initiatedBy, batchSize = 100, retryConfig } = request;

    this.logger.log(`Starting payout run for distribution ${distributionId}, dry run: ${isDryRun}`);

    // Get distribution details
    const distribution = await this.distributionRepository.findOne({
      where: { id: distributionId },
    });

    if (!distribution) {
      throw new Error(`Distribution not found: ${distributionId}`);
    }

    // Create payout run record
    const payoutRun = await this.createPayoutRun(distribution, isDryRun, initiatedBy, retryConfig);

    try {
      // Calculate pro-rata shares for all investors
      const calculations = await this.calculateProRataShares(distribution);

      // Update payout run with total recipients
      await this.updatePayoutRun(payoutRun.id, {
        total_recipients: calculations.length,
        total_amount: distribution.total_amount,
      });

      // Process payouts in batches
      const results = await this.processPayoutsInBatches(
        payoutRun,
        calculations,
        distribution,
        batchSize,
        isDryRun
      );

      // Update final status
      const finalStatus = isDryRun ? PayoutRunStatus.COMPLETED : 
        (results.failedPayouts === 0 ? PayoutRunStatus.COMPLETED : PayoutRunStatus.PARTIALLY_COMPLETED);

      await this.updatePayoutRun(payoutRun.id, {
        status: finalStatus,
        completed_at: new Date(),
        successful_payouts: results.successfulPayouts,
        failed_payouts: results.failedPayouts,
        successful_amount: results.successfulAmount,
        failed_amount: results.failedAmount,
        total_fees: results.totalFees,
        total_withholding: results.totalWithholding,
      });

      return {
        success: true,
        payoutRunId: payoutRun.id,
        totalRecipients: calculations.length,
        successfulPayouts: results.successfulPayouts,
        failedPayouts: results.failedPayouts,
        totalAmount: distribution.total_amount,
        totalFees: results.totalFees,
        totalWithholding: results.totalWithholding,
        receipts: results.receipts,
        errors: results.errors,
      };

    } catch (error) {
      this.logger.error(`Payout run failed: ${error.message}`, error.stack);
      
      await this.updatePayoutRun(payoutRun.id, {
        status: PayoutRunStatus.FAILED,
        error_logs: [{ timestamp: new Date(), error: error.message, stack: error.stack }],
      });

      throw error;
    }
  }

  /**
   * Calculate pro-rata shares for all investors in a distribution
   */
  async calculateProRataShares(distribution: Distribution): Promise<PayoutCalculation[]> {
    this.logger.log(`Calculating pro-rata shares for distribution ${distribution.id}`);

    // Get all active wallets for this asset
    const wallets = await this.walletRepository.find({
      where: {
        asset_id: distribution.asset_id,
        status: 'ACTIVE',
        is_kyc_verified: true,
      },
    });

    if (wallets.length === 0) {
      throw new Error(`No active wallets found for asset ${distribution.asset_id}`);
    }

    // Get token balances (mock data for now - in real implementation, this would come from blockchain)
    const tokenBalances = await this.getTokenBalances(wallets.map(w => w.id));

    // Calculate total tokens
    const totalTokens = tokenBalances.reduce((sum, balance) => sum + balance.balance, 0);

    if (totalTokens === 0) {
      throw new Error(`Total token balance is zero for asset ${distribution.asset_id}`);
    }

    // Calculate pro-rata shares
    const calculations: PayoutCalculation[] = [];

    for (const wallet of wallets) {
      const tokenBalance = tokenBalances.find(b => b.walletId === wallet.id)?.balance || 0;
      
      if (tokenBalance > 0) {
        const proRataShare = tokenBalance / totalTokens;
        const grossAmount = distribution.total_amount * proRataShare;

        // Calculate withholding
        const withholdingAmount = await this.withholdingService.calculateWithholding(
          wallet,
          grossAmount,
          distribution
        );

        // Calculate fees
        const feeAmount = await this.feeService.calculateFees(
          wallet,
          grossAmount,
          distribution
        );

        const netAmount = grossAmount - withholdingAmount - feeAmount;

        calculations.push({
          investorId: wallet.investor_id,
          walletAddress: wallet.wallet_address,
          tokenBalance,
          proRataShare,
          grossAmount,
          withholdingAmount,
          feeAmount,
          netAmount,
          stablecoinType: distribution.stablecoin_type,
        });
      }
    }

    // Sort by token balance (largest first)
    calculations.sort((a, b) => b.tokenBalance - a.tokenBalance);

    this.logger.log(`Calculated pro-rata shares for ${calculations.length} investors`);

    return calculations;
  }

  /**
   * Process payouts in batches
   */
  private async processPayoutsInBatches(
    payoutRun: PayoutRun,
    calculations: PayoutCalculation[],
    distribution: Distribution,
    batchSize: number,
    isDryRun: boolean
  ): Promise<{
    successfulPayouts: number;
    failedPayouts: number;
    successfulAmount: number;
    failedAmount: number;
    totalFees: number;
    totalWithholding: number;
    receipts: PayoutReceipt[];
    errors: string[];
  }> {
    const results = {
      successfulPayouts: 0,
      failedPayouts: 0,
      successfulAmount: 0,
      failedAmount: 0,
      totalFees: 0,
      totalWithholding: 0,
      receipts: [] as PayoutReceipt[],
      errors: [] as string[],
    };

    // Process in batches
    for (let i = 0; i < calculations.length; i += batchSize) {
      const batch = calculations.slice(i, i + batchSize);
      
      this.logger.log(`Processing batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(calculations.length / batchSize)}`);

      for (const calculation of batch) {
        try {
          const receipt = await this.processIndividualPayout(
            payoutRun,
            calculation,
            distribution,
            isDryRun
          );

          results.receipts.push(receipt);
          results.totalFees += calculation.feeAmount;
          results.totalWithholding += calculation.withholdingAmount;

          if (receipt.status === ReceiptStatus.COMPLETED) {
            results.successfulPayouts++;
            results.successfulAmount += calculation.netAmount;
          } else {
            results.failedPayouts++;
            results.failedAmount += calculation.netAmount;
            if (receipt.failure_reason) {
              results.errors.push(`Investor ${calculation.investorId}: ${receipt.failure_reason}`);
            }
          }

        } catch (error) {
          this.logger.error(`Failed to process payout for investor ${calculation.investorId}: ${error.message}`);
          results.failedPayouts++;
          results.failedAmount += calculation.netAmount;
          results.errors.push(`Investor ${calculation.investorId}: ${error.message}`);
        }
      }

      // Update progress
      await this.updatePayoutRun(payoutRun.id, {
        successful_payouts: results.successfulPayouts,
        failed_payouts: results.failedPayouts,
        successful_amount: results.successfulAmount,
        failed_amount: results.failedAmount,
      });
    }

    return results;
  }

  /**
   * Process individual payout
   */
  private async processIndividualPayout(
    payoutRun: PayoutRun,
    calculation: PayoutCalculation,
    distribution: Distribution,
    isDryRun: boolean
  ): Promise<PayoutReceipt> {
    // Create receipt record
    const receipt = await this.receiptRepository.save({
      payout_run_id: payoutRun.id,
      investor_wallet_id: calculation.walletAddress, // This should be wallet ID, not address
      investor_id: calculation.investorId,
      asset_id: distribution.asset_id,
      asset_name: distribution.asset_name,
      type: distribution.type as any,
      status: ReceiptStatus.PENDING,
      gross_amount: calculation.grossAmount,
      withholding_amount: calculation.withholdingAmount,
      fee_amount: calculation.feeAmount,
      net_amount: calculation.netAmount,
      token_balance_at_snapshot: calculation.tokenBalance,
      pro_rata_share: calculation.proRataShare,
      stablecoin_type: calculation.stablecoinType,
      exchange_rate: distribution.exchange_rate,
      is_dry_run: isDryRun,
    });

    try {
      if (isDryRun) {
        // For dry run, just simulate the process
        await this.simulatePayout(receipt, calculation);
      } else {
        // Execute actual payout
        await this.executePayout(receipt, calculation);
      }

      // Update receipt status
      await this.receiptRepository.update(receipt.id, {
        status: ReceiptStatus.COMPLETED,
        processed_at: new Date(),
      });

      return { ...receipt, status: ReceiptStatus.COMPLETED };

    } catch (error) {
      // Update receipt with failure
      await this.receiptRepository.update(receipt.id, {
        status: ReceiptStatus.FAILED,
        failed_at: new Date(),
        failure_reason: error.message,
      });

      return { ...receipt, status: ReceiptStatus.FAILED, failure_reason: error.message };
    }
  }

  /**
   * Execute actual payout via stablecoin adapter
   */
  private async executePayout(receipt: PayoutReceipt, calculation: PayoutCalculation): Promise<void> {
    // Get treasury wallet address (in real implementation, this would be configurable)
    const treasuryAddress = '0x1234567890123456789012345678901234567890';

    const transferResult = await this.stablecoinAdapter.transfer({
      fromAddress: treasuryAddress,
      toAddress: calculation.walletAddress,
      amount: calculation.netAmount,
      stablecoinType: calculation.stablecoinType as any,
      metadata: {
        receiptId: receipt.id,
        distributionType: 'DIVIDEND',
        assetId: receipt.asset_id,
      },
    });

    if (!transferResult.success) {
      throw new Error(`Transfer failed: ${transferResult.error}`);
    }

    // Update receipt with transaction details
    await this.receiptRepository.update(receipt.id, {
      transaction_hash: transferResult.transactionHash,
      from_address: treasuryAddress,
      to_address: calculation.walletAddress,
      block_number: transferResult.blockNumber,
      transaction_timestamp: new Date(),
      gas_used: transferResult.gasUsed,
      gas_price: transferResult.gasPrice,
      transaction_metadata: transferResult.metadata,
    });
  }

  /**
   * Simulate payout for dry run
   */
  private async simulatePayout(receipt: PayoutReceipt, calculation: PayoutCalculation): Promise<void> {
    // Simulate processing delay
    await new Promise(resolve => setTimeout(resolve, 50 + Math.random() * 100));

    // Generate mock transaction hash for dry run
    const mockTransactionHash = `DRY_RUN_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    await this.receiptRepository.update(receipt.id, {
      transaction_hash: mockTransactionHash,
      from_address: '0x0000000000000000000000000000000000000000',
      to_address: calculation.walletAddress,
      block_number: 0,
      transaction_timestamp: new Date(),
      dry_run_results: {
        simulated: true,
        timestamp: new Date().toISOString(),
        mockTransactionHash,
      },
    });
  }

  /**
   * Get token balances for wallets (mock implementation)
   */
  private async getTokenBalances(walletIds: string[]): Promise<Array<{ walletId: string; balance: number }>> {
    // Mock implementation - in real app, this would query the blockchain
    return walletIds.map(walletId => ({
      walletId,
      balance: Math.random() * 10000 + 1000, // Random balance between 1000-11000
    }));
  }

  /**
   * Create payout run record
   */
  private async createPayoutRun(
    distribution: Distribution,
    isDryRun: boolean,
    initiatedBy?: string,
    retryConfig?: Record<string, any>
  ): Promise<PayoutRun> {
    const payoutRun = this.payoutRunRepository.create({
      distribution_id: distribution.id,
      type: isDryRun ? PayoutRunType.TEST : PayoutRunType.SCHEDULED,
      status: PayoutRunStatus.PENDING,
      scheduled_execution_time: new Date(),
      started_at: new Date(),
      total_amount: distribution.total_amount,
      is_dry_run: isDryRun,
      initiated_by: initiatedBy,
      retry_config: retryConfig,
    });

    return this.payoutRunRepository.save(payoutRun);
  }

  /**
   * Update payout run
   */
  private async updatePayoutRun(id: string, updates: Partial<PayoutRun>): Promise<void> {
    await this.payoutRunRepository.update(id, updates);
  }

  /**
   * Get payout run by ID
   */
  async getPayoutRun(id: string): Promise<PayoutRun | null> {
    return this.payoutRunRepository.findOne({
      where: { id },
      relations: ['distribution', 'receipts'],
    });
  }

  /**
   * Get payout runs for a distribution
   */
  async getPayoutRunsForDistribution(distributionId: string): Promise<PayoutRun[]> {
    return this.payoutRunRepository.find({
      where: { distribution_id: distributionId },
      relations: ['receipts'],
      order: { created_at: 'DESC' },
    });
  }

  /**
   * Get payout statistics
   */
  async getPayoutStats(): Promise<{
    totalPayoutRuns: number;
    successfulPayouts: number;
    failedPayouts: number;
    totalAmount: number;
    totalFees: number;
    totalWithholding: number;
  }> {
    const [payoutRuns, receipts] = await Promise.all([
      this.payoutRunRepository.find(),
      this.receiptRepository.find(),
    ]);

    const successfulReceipts = receipts.filter(r => r.status === ReceiptStatus.COMPLETED);
    const failedReceipts = receipts.filter(r => r.status === ReceiptStatus.FAILED);

    return {
      totalPayoutRuns: payoutRuns.length,
      successfulPayouts: successfulReceipts.length,
      failedPayouts: failedReceipts.length,
      totalAmount: successfulReceipts.reduce((sum, r) => sum + r.net_amount, 0),
      totalFees: receipts.reduce((sum, r) => sum + r.fee_amount, 0),
      totalWithholding: receipts.reduce((sum, r) => sum + r.withholding_amount, 0),
    };
  }
}
