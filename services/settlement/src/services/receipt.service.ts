import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PayoutReceipt, ReceiptStatus, ReceiptType } from '../entities/payout-receipt.entity';
import { PayoutRun } from '../entities/payout-run.entity';
import { Distribution } from '../entities/distribution.entity';
import { InvestorWallet } from '../entities/investor-wallet.entity';

export interface ReceiptGenerationOptions {
  includeTransactionDetails?: boolean;
  includeComplianceInfo?: boolean;
  includeMetadata?: boolean;
  format?: 'pdf' | 'json' | 'csv';
  template?: string;
}

export interface ReceiptData {
  receiptNumber: string;
  investorId: string;
  investorName?: string;
  assetId: string;
  assetName: string;
  distributionType: string;
  payoutDate: Date;
  grossAmount: number;
  withholdingAmount: number;
  feeAmount: number;
  netAmount: number;
  tokenBalance: number;
  proRataShare: number;
  stablecoinType: string;
  exchangeRate: number;
  transactionHash?: string;
  complianceChecks?: Record<string, any>;
  metadata?: Record<string, any>;
}

@Injectable()
export class ReceiptService {
  private readonly logger = new Logger(ReceiptService.name);

  constructor(
    @InjectRepository(PayoutReceipt)
    private readonly receiptRepository: Repository<PayoutReceipt>,
    @InjectRepository(PayoutRun)
    private readonly payoutRunRepository: Repository<PayoutRun>,
    @InjectRepository(Distribution)
    private readonly distributionRepository: Repository<Distribution>,
    @InjectRepository(InvestorWallet)
    private readonly walletRepository: Repository<InvestorWallet>,
  ) {}

  /**
   * Create a receipt for a payout
   */
  async createReceipt(
    payoutRunId: string,
    investorWalletId: string,
    receiptData: Partial<ReceiptData>
  ): Promise<PayoutReceipt> {
    this.logger.log(`Creating receipt for payout run ${payoutRunId}, wallet ${investorWalletId}`);

    // Generate unique receipt number
    const receiptNumber = await this.generateReceiptNumber();

    const receipt = this.receiptRepository.create({
      payout_run_id: payoutRunId,
      investor_wallet_id: investorWalletId,
      investor_id: receiptData.investorId,
      asset_id: receiptData.assetId,
      asset_name: receiptData.assetName,
      distribution_type: receiptData.distributionType,
      status: ReceiptStatus.PENDING,
      gross_amount: receiptData.grossAmount || 0,
      withholding_amount: receiptData.withholdingAmount || 0,
      fee_amount: receiptData.feeAmount || 0,
      net_amount: receiptData.netAmount || 0,
      token_balance: receiptData.tokenBalance || 0,
      pro_rata_share: receiptData.proRataShare || 0,
      stablecoin_type: receiptData.stablecoinType,
      exchange_rate: receiptData.exchangeRate || 1,
      transaction_hash: receiptData.transactionHash,
      compliance_checks: receiptData.complianceChecks || {},
      metadata: {
        ...receiptData.metadata,
        receipt_number: receiptNumber,
        created_at: new Date().toISOString(),
      },
    });

    const savedReceipt = await this.receiptRepository.save(receipt);
    this.logger.log(`Created receipt ${savedReceipt.id} with number ${receiptNumber}`);

    return savedReceipt;
  }

  /**
   * Update receipt status
   */
  async updateReceiptStatus(receiptId: string, status: ReceiptStatus, metadata?: Record<string, any>): Promise<PayoutReceipt> {
    this.logger.log(`Updating receipt ${receiptId} status to ${status}`);

    const receipt = await this.getReceipt(receiptId);

    receipt.status = status;
    if (metadata) {
      receipt.metadata = {
        ...receipt.metadata,
        ...metadata,
        status_updated_at: new Date().toISOString(),
      };
    }

    const updatedReceipt = await this.receiptRepository.save(receipt);
    this.logger.log(`Updated receipt ${receiptId} status to ${status}`);

    return updatedReceipt;
  }

  /**
   * Get receipt by ID
   */
  async getReceipt(receiptId: string): Promise<PayoutReceipt> {
    const receipt = await this.receiptRepository.findOne({
      where: { id: receiptId },
    });

    if (!receipt) {
      throw new NotFoundException(`Receipt ${receiptId} not found`);
    }

    return receipt;
  }

  /**
   * Get receipts by payout run ID
   */
  async getReceiptsByPayoutRun(payoutRunId: string): Promise<PayoutReceipt[]> {
    return this.receiptRepository.find({
      where: { payout_run_id: payoutRunId },
      order: { created_at: 'ASC' },
    });
  }

  /**
   * Get receipts by investor ID
   */
  async getReceiptsByInvestor(investorId: string, limit?: number): Promise<PayoutReceipt[]> {
    const queryBuilder = this.receiptRepository.createQueryBuilder('receipt');

    queryBuilder
      .where('receipt.investor_id = :investorId', { investorId })
      .orderBy('receipt.created_at', 'DESC');

    if (limit) {
      queryBuilder.limit(limit);
    }

    return queryBuilder.getMany();
  }

  /**
   * Get receipts by asset ID
   */
  async getReceiptsByAsset(assetId: string, limit?: number): Promise<PayoutReceipt[]> {
    const queryBuilder = this.receiptRepository.createQueryBuilder('receipt');

    queryBuilder
      .where('receipt.asset_id = :assetId', { assetId })
      .orderBy('receipt.created_at', 'DESC');

    if (limit) {
      queryBuilder.limit(limit);
    }

    return queryBuilder.getMany();
  }

  /**
   * Generate receipt PDF
   */
  async generateReceiptPDF(receiptId: string, options?: ReceiptGenerationOptions): Promise<{ pdfUrl: string; receiptData: ReceiptData }> {
    this.logger.log(`Generating PDF for receipt ${receiptId}`);

    const receipt = await this.getReceipt(receiptId);
    const payoutRun = await this.payoutRunRepository.findOne({
      where: { id: receipt.payout_run_id },
    });

    if (!payoutRun) {
      throw new NotFoundException(`Payout run ${receipt.payout_run_id} not found`);
    }

    // Build receipt data
    const receiptData: ReceiptData = {
      receiptNumber: receipt.metadata?.receipt_number || receipt.id,
      investorId: receipt.investor_id,
      assetId: receipt.asset_id,
      assetName: receipt.asset_name,
      distributionType: receipt.distribution_type,
      payoutDate: receipt.created_at,
      grossAmount: receipt.gross_amount,
      withholdingAmount: receipt.withholding_amount,
      feeAmount: receipt.fee_amount,
      netAmount: receipt.net_amount,
      tokenBalance: receipt.token_balance,
      proRataShare: receipt.pro_rata_share,
      stablecoinType: receipt.stablecoin_type,
      exchangeRate: receipt.exchange_rate,
      transactionHash: receipt.transaction_hash,
      complianceChecks: receipt.compliance_checks,
      metadata: options?.includeMetadata ? receipt.metadata : undefined,
    };

    // Generate PDF (mock implementation - in production, use a library like Puppeteer or jsPDF)
    const pdfUrl = await this.generatePDF(receiptData, options);

    // Update receipt with PDF URL
    receipt.pdf_url = pdfUrl;
    receipt.metadata = {
      ...receipt.metadata,
      pdf_generated_at: new Date().toISOString(),
      pdf_generation_options: options,
    };

    await this.receiptRepository.save(receipt);

    this.logger.log(`Generated PDF for receipt ${receiptId}: ${pdfUrl}`);

    return { pdfUrl, receiptData };
  }

  /**
   * Generate receipt data in different formats
   */
  async generateReceiptData(
    receiptId: string,
    format: 'json' | 'csv' = 'json',
    options?: ReceiptGenerationOptions
  ): Promise<string> {
    const receipt = await this.getReceipt(receiptId);
    const receiptData = await this.buildReceiptData(receipt);

    switch (format) {
      case 'csv':
        return this.convertToCSV(receiptData);
      case 'json':
      default:
        return JSON.stringify(receiptData, null, 2);
    }
  }

  /**
   * Bulk generate receipts for a payout run
   */
  async bulkGenerateReceipts(
    payoutRunId: string,
    options?: ReceiptGenerationOptions
  ): Promise<{ success: boolean; total: number; generated: number; errors: string[] }> {
    this.logger.log(`Bulk generating receipts for payout run ${payoutRunId}`);

    const receipts = await this.getReceiptsByPayoutRun(payoutRunId);
    const results = {
      success: true,
      total: receipts.length,
      generated: 0,
      errors: [],
    };

    for (const receipt of receipts) {
      try {
        if (options?.format === 'pdf') {
          await this.generateReceiptPDF(receipt.id, options);
        }
        results.generated++;
      } catch (error) {
        this.logger.error(`Failed to generate receipt ${receipt.id}: ${error.message}`);
        results.errors.push(`Receipt ${receipt.id}: ${error.message}`);
        results.success = false;
      }
    }

    this.logger.log(`Bulk generated ${results.generated}/${results.total} receipts for payout run ${payoutRunId}`);
    return results;
  }

  /**
   * Get receipt statistics
   */
  async getReceiptStats(): Promise<{
    total: number;
    pending: number;
    generated: number;
    failed: number;
    byStatus: Record<string, number>;
    byAsset: Record<string, number>;
    totalAmount: number;
  }> {
    const [total, pending, generated, failed] = await Promise.all([
      this.receiptRepository.count(),
      this.receiptRepository.count({ where: { status: ReceiptStatus.PENDING } }),
      this.receiptRepository.count({ where: { status: ReceiptStatus.GENERATED } }),
      this.receiptRepository.count({ where: { status: ReceiptStatus.FAILED } }),
    ]);

    // Get counts by status
    const statusStats = await this.receiptRepository
      .createQueryBuilder('receipt')
      .select('receipt.status', 'status')
      .addSelect('COUNT(*)', 'count')
      .groupBy('receipt.status')
      .getRawMany();

    const byStatus = statusStats.reduce((acc, stat) => {
      acc[stat.status] = parseInt(stat.count);
      return acc;
    }, {});

    // Get counts by asset
    const assetStats = await this.receiptRepository
      .createQueryBuilder('receipt')
      .select('receipt.asset_id', 'assetId')
      .addSelect('COUNT(*)', 'count')
      .groupBy('receipt.asset_id')
      .getRawMany();

    const byAsset = assetStats.reduce((acc, stat) => {
      acc[stat.assetId] = parseInt(stat.count);
      return acc;
    }, {});

    // Get total amount
    const amountStats = await this.receiptRepository
      .createQueryBuilder('receipt')
      .select('SUM(receipt.net_amount)', 'totalAmount')
      .getRawOne();

    return {
      total,
      pending,
      generated,
      failed,
      byStatus,
      byAsset,
      totalAmount: parseFloat(amountStats.totalAmount) || 0,
    };
  }

  /**
   * Search receipts with filters
   */
  async searchReceipts(filters: {
    payoutRunId?: string;
    investorId?: string;
    assetId?: string;
    status?: ReceiptStatus;
    fromDate?: Date;
    toDate?: Date;
    limit?: number;
    offset?: number;
  }): Promise<{ receipts: PayoutReceipt[]; total: number }> {
    const queryBuilder = this.receiptRepository.createQueryBuilder('receipt');

    if (filters.payoutRunId) {
      queryBuilder.andWhere('receipt.payout_run_id = :payoutRunId', { payoutRunId: filters.payoutRunId });
    }

    if (filters.investorId) {
      queryBuilder.andWhere('receipt.investor_id = :investorId', { investorId: filters.investorId });
    }

    if (filters.assetId) {
      queryBuilder.andWhere('receipt.asset_id = :assetId', { assetId: filters.assetId });
    }

    if (filters.status) {
      queryBuilder.andWhere('receipt.status = :status', { status: filters.status });
    }

    if (filters.fromDate) {
      queryBuilder.andWhere('receipt.created_at >= :fromDate', { fromDate: filters.fromDate });
    }

    if (filters.toDate) {
      queryBuilder.andWhere('receipt.created_at <= :toDate', { toDate: filters.toDate });
    }

    const total = await queryBuilder.getCount();

    if (filters.limit) {
      queryBuilder.limit(filters.limit);
    }

    if (filters.offset) {
      queryBuilder.offset(filters.offset);
    }

    queryBuilder.orderBy('receipt.created_at', 'DESC');

    const receipts = await queryBuilder.getMany();

    return { receipts, total };
  }

  /**
   * Generate unique receipt number
   */
  private async generateReceiptNumber(): Promise<string> {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substr(2, 5);
    const receiptNumber = `RCP-${timestamp}-${random}`.toUpperCase();

    // Check if receipt number already exists
    const existingReceipt = await this.receiptRepository.findOne({
      where: { metadata: { receipt_number: receiptNumber } as any },
    });

    if (existingReceipt) {
      // Recursively generate a new number if collision occurs
      return this.generateReceiptNumber();
    }

    return receiptNumber;
  }

  /**
   * Build receipt data from entity
   */
  private async buildReceiptData(receipt: PayoutReceipt): Promise<ReceiptData> {
    return {
      receiptNumber: receipt.metadata?.receipt_number || receipt.id,
      investorId: receipt.investor_id,
      assetId: receipt.asset_id,
      assetName: receipt.asset_name,
      distributionType: receipt.distribution_type,
      payoutDate: receipt.created_at,
      grossAmount: receipt.gross_amount,
      withholdingAmount: receipt.withholding_amount,
      feeAmount: receipt.fee_amount,
      netAmount: receipt.net_amount,
      tokenBalance: receipt.token_balance,
      proRataShare: receipt.pro_rata_share,
      stablecoinType: receipt.stablecoin_type,
      exchangeRate: receipt.exchange_rate,
      transactionHash: receipt.transaction_hash,
      complianceChecks: receipt.compliance_checks,
      metadata: receipt.metadata,
    };
  }

  /**
   * Generate PDF (mock implementation)
   */
  private async generatePDF(receiptData: ReceiptData, options?: ReceiptGenerationOptions): Promise<string> {
    // In production, this would use a library like Puppeteer or jsPDF
    // For now, return a mock URL
    const timestamp = Date.now();
    const mockPdfUrl = `/receipts/${receiptData.receiptNumber}-${timestamp}.pdf`;
    
    this.logger.log(`Mock PDF generated: ${mockPdfUrl}`);
    
    // Simulate PDF generation delay
    await new Promise(resolve => setTimeout(resolve, 100));
    
    return mockPdfUrl;
  }

  /**
   * Convert receipt data to CSV
   */
  private convertToCSV(receiptData: ReceiptData): string {
    const headers = [
      'Receipt Number',
      'Investor ID',
      'Asset ID',
      'Asset Name',
      'Distribution Type',
      'Payout Date',
      'Gross Amount',
      'Withholding Amount',
      'Fee Amount',
      'Net Amount',
      'Token Balance',
      'Pro-rata Share',
      'Stablecoin Type',
      'Exchange Rate',
    ];

    const values = [
      receiptData.receiptNumber,
      receiptData.investorId,
      receiptData.assetId,
      receiptData.assetName,
      receiptData.distributionType,
      receiptData.payoutDate.toISOString(),
      receiptData.grossAmount.toString(),
      receiptData.withholdingAmount.toString(),
      receiptData.feeAmount.toString(),
      receiptData.netAmount.toString(),
      receiptData.tokenBalance.toString(),
      receiptData.proRataShare.toString(),
      receiptData.stablecoinType,
      receiptData.exchangeRate.toString(),
    ];

    return [headers.join(','), values.join(',')].join('\n');
  }
}
