import { Injectable, Logger, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Distribution, DistributionStatus, DistributionType, DistributionFrequency } from '../entities/distribution.entity';
import { PayoutRun, PayoutRunStatus } from '../entities/payout-run.entity';
import { WalletRegistryService } from './wallet-registry.service';
import { PayoutService } from './payout.service';

export interface CreateDistributionRequest {
  assetId: string;
  assetName: string;
  distributionType: DistributionType;
  totalAmount: number;
  stablecoinType: string;
  exchangeRate: number;
  scheduledDate: Date;
  frequency?: DistributionFrequency;
  metadata?: Record<string, any>;
  approvalWorkflow?: {
    requiresApproval: boolean;
    approvers?: string[];
    autoApprove?: boolean;
  };
}

export interface UpdateDistributionRequest {
  assetName?: string;
  totalAmount?: number;
  scheduledDate?: Date;
  status?: DistributionStatus;
  metadata?: Record<string, any>;
}

export interface DistributionExecutionResult {
  success: boolean;
  distributionId: string;
  payoutRunId?: string;
  totalRecipients: number;
  totalAmount: number;
  errors?: string[];
}

@Injectable()
export class DistributionService {
  private readonly logger = new Logger(DistributionService.name);

  constructor(
    @InjectRepository(Distribution)
    private readonly distributionRepository: Repository<Distribution>,
    @InjectRepository(PayoutRun)
    private readonly payoutRunRepository: Repository<PayoutRun>,
    private readonly walletRegistry: WalletRegistryService,
    private readonly payoutService: PayoutService,
  ) {}

  /**
   * Create a new distribution
   */
  async createDistribution(request: CreateDistributionRequest): Promise<Distribution> {
    this.logger.log(`Creating distribution for asset ${request.assetId}: ${request.assetName}`);

    // Validate request
    if (request.totalAmount <= 0) {
      throw new BadRequestException('Total amount must be positive');
    }

    if (request.scheduledDate < new Date()) {
      throw new BadRequestException('Scheduled date cannot be in the past');
    }

    // Check if there's already a pending distribution for this asset
    const existingDistribution = await this.distributionRepository.findOne({
      where: {
        asset_id: request.assetId,
        status: DistributionStatus.PENDING,
      },
    });

    if (existingDistribution) {
      throw new BadRequestException('There is already a pending distribution for this asset');
    }

    // Create distribution
    const distribution = this.distributionRepository.create({
      asset_id: request.assetId,
      asset_name: request.assetName,
      distribution_type: request.distributionType,
      frequency: request.frequency || DistributionFrequency.ONE_TIME,
      scheduled_date: request.scheduledDate,
      total_amount: request.totalAmount,
      distributed_amount: 0,
      withheld_amount: 0,
      fee_amount: 0,
      net_amount: 0,
      status: DistributionStatus.PENDING,
      stablecoin_type: request.stablecoinType,
      exchange_rate: request.exchangeRate,
      metadata: {
        ...request.metadata,
        created_at: new Date().toISOString(),
        approval_workflow: request.approvalWorkflow || { requiresApproval: false, autoApprove: true },
      },
    });

    const savedDistribution = await this.distributionRepository.save(distribution);
    this.logger.log(`Created distribution ${savedDistribution.id} for asset ${request.assetId}`);

    return savedDistribution;
  }

  /**
   * Update an existing distribution
   */
  async updateDistribution(distributionId: string, request: UpdateDistributionRequest): Promise<Distribution> {
    this.logger.log(`Updating distribution ${distributionId}`);

    const distribution = await this.getDistribution(distributionId);

    // Check if distribution can be updated
    if (distribution.status === DistributionStatus.EXECUTED) {
      throw new BadRequestException('Cannot update an executed distribution');
    }

    if (distribution.status === DistributionStatus.CANCELLED) {
      throw new BadRequestException('Cannot update a cancelled distribution');
    }

    // Update fields
    if (request.assetName !== undefined) {
      distribution.asset_name = request.assetName;
    }

    if (request.totalAmount !== undefined) {
      if (request.totalAmount <= 0) {
        throw new BadRequestException('Total amount must be positive');
      }
      distribution.total_amount = request.totalAmount;
    }

    if (request.scheduledDate !== undefined) {
      if (request.scheduledDate < new Date()) {
        throw new BadRequestException('Scheduled date cannot be in the past');
      }
      distribution.scheduled_date = request.scheduledDate;
    }

    if (request.status !== undefined) {
      distribution.status = request.status;
    }

    if (request.metadata !== undefined) {
      distribution.metadata = {
        ...distribution.metadata,
        ...request.metadata,
        updated_at: new Date().toISOString(),
      };
    }

    const updatedDistribution = await this.distributionRepository.save(distribution);
    this.logger.log(`Updated distribution ${distributionId}`);

    return updatedDistribution;
  }

  /**
   * Get distribution by ID
   */
  async getDistribution(distributionId: string): Promise<Distribution> {
    const distribution = await this.distributionRepository.findOne({
      where: { id: distributionId },
    });

    if (!distribution) {
      throw new NotFoundException(`Distribution ${distributionId} not found`);
    }

    return distribution;
  }

  /**
   * Get distributions by asset ID
   */
  async getDistributionsByAsset(assetId: string): Promise<Distribution[]> {
    return this.distributionRepository.find({
      where: { asset_id: assetId },
      order: { scheduled_date: 'DESC' },
    });
  }

  /**
   * Get distributions by status
   */
  async getDistributionsByStatus(status: DistributionStatus): Promise<Distribution[]> {
    return this.distributionRepository.find({
      where: { status },
      order: { scheduled_date: 'ASC' },
    });
  }

  /**
   * Get pending distributions scheduled for a specific date
   */
  async getPendingDistributionsForDate(date: Date): Promise<Distribution[]> {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    return this.distributionRepository.find({
      where: {
        status: DistributionStatus.PENDING,
        scheduled_date: {
          $gte: startOfDay,
          $lte: endOfDay,
        } as any,
      },
      order: { scheduled_date: 'ASC' },
    });
  }

  /**
   * Approve a distribution
   */
  async approveDistribution(distributionId: string, approverId: string): Promise<Distribution> {
    this.logger.log(`Approving distribution ${distributionId} by ${approverId}`);

    const distribution = await this.getDistribution(distributionId);

    if (distribution.status !== DistributionStatus.PENDING) {
      throw new BadRequestException(`Distribution ${distributionId} is not in PENDING status`);
    }

    // Check approval workflow
    const approvalWorkflow = distribution.metadata?.approval_workflow;
    if (approvalWorkflow?.requiresApproval && !approvalWorkflow?.autoApprove) {
      // Add approver to the list
      const approvers = approvalWorkflow.approvers || [];
      if (!approvers.includes(approverId)) {
        approvers.push(approverId);
      }

      distribution.metadata = {
        ...distribution.metadata,
        approval_workflow: {
          ...approvalWorkflow,
          approvers,
          approved_at: new Date().toISOString(),
          approved_by: approverId,
        },
      };
    }

    distribution.status = DistributionStatus.APPROVED;
    const approvedDistribution = await this.distributionRepository.save(distribution);

    this.logger.log(`Approved distribution ${distributionId}`);
    return approvedDistribution;
  }

  /**
   * Cancel a distribution
   */
  async cancelDistribution(distributionId: string, reason: string, cancelledBy: string): Promise<Distribution> {
    this.logger.log(`Cancelling distribution ${distributionId}: ${reason}`);

    const distribution = await this.getDistribution(distributionId);

    if (distribution.status === DistributionStatus.EXECUTED) {
      throw new BadRequestException('Cannot cancel an executed distribution');
    }

    if (distribution.status === DistributionStatus.CANCELLED) {
      throw new BadRequestException('Distribution is already cancelled');
    }

    distribution.status = DistributionStatus.CANCELLED;
    distribution.metadata = {
      ...distribution.metadata,
      cancellation_reason: reason,
      cancelled_at: new Date().toISOString(),
      cancelled_by: cancelledBy,
    };

    const cancelledDistribution = await this.distributionRepository.save(distribution);
    this.logger.log(`Cancelled distribution ${distributionId}`);

    return cancelledDistribution;
  }

  /**
   * Execute a distribution
   */
  async executeDistribution(distributionId: string): Promise<DistributionExecutionResult> {
    this.logger.log(`Executing distribution ${distributionId}`);

    const distribution = await this.getDistribution(distributionId);

    if (distribution.status !== DistributionStatus.APPROVED) {
      throw new BadRequestException(`Distribution ${distributionId} must be approved before execution`);
    }

    if (distribution.scheduled_date > new Date()) {
      throw new BadRequestException(`Distribution ${distributionId} is not yet scheduled for execution`);
    }

    // Get eligible wallets for this distribution
    const eligibleWallets = await this.walletRegistry.getEligibleWalletsForDistribution(distribution.asset_id);
    
    if (eligibleWallets.length === 0) {
      throw new BadRequestException(`No eligible wallets found for distribution ${distributionId}`);
    }

    try {
      // Execute payout through payout service
      const payoutResult = await this.payoutService.executePayoutRun({
        distributionId: distribution.id,
        isDryRun: false,
      });

      if (!payoutResult.success) {
        throw new Error(`Payout execution failed: ${payoutResult.errors?.join(', ')}`);
      }

      // Update distribution status
      distribution.status = DistributionStatus.EXECUTED;
      distribution.executed_date = new Date();
      distribution.distributed_amount = payoutResult.totalAmount || distribution.total_amount;
      distribution.metadata = {
        ...distribution.metadata,
        executed_at: new Date().toISOString(),
        payout_run_id: payoutResult.payoutRunId,
        execution_summary: {
          totalRecipients: payoutResult.totalRecipients,
          successfulPayouts: payoutResult.successfulPayouts,
          failedPayouts: payoutResult.failedPayouts,
        },
      };

      await this.distributionRepository.save(distribution);

      this.logger.log(`Successfully executed distribution ${distributionId}`);

      return {
        success: true,
        distributionId: distribution.id,
        payoutRunId: payoutResult.payoutRunId,
        totalRecipients: payoutResult.totalRecipients,
        totalAmount: distribution.distributed_amount,
      };

    } catch (error) {
      this.logger.error(`Failed to execute distribution ${distributionId}: ${error.message}`);

      // Update distribution status to failed
      distribution.status = DistributionStatus.FAILED;
      distribution.metadata = {
        ...distribution.metadata,
        execution_error: error.message,
        failed_at: new Date().toISOString(),
      };

      await this.distributionRepository.save(distribution);

      return {
        success: false,
        distributionId: distribution.id,
        totalRecipients: eligibleWallets.length,
        totalAmount: distribution.total_amount,
        errors: [error.message],
      };
    }
  }

  /**
   * Create recurring distribution instances
   */
  async createRecurringDistributions(): Promise<number> {
    this.logger.log('Creating recurring distribution instances');

    const recurringDistributions = await this.distributionRepository.find({
      where: {
        frequency: DistributionFrequency.RECURRING,
        status: DistributionStatus.EXECUTED,
      },
    });

    let createdCount = 0;

    for (const distribution of recurringDistributions) {
      try {
        // Calculate next scheduled date based on frequency
        const nextDate = this.calculateNextRecurringDate(
          distribution.scheduled_date,
          distribution.frequency,
          distribution.metadata?.recurring_settings
        );

        if (nextDate && nextDate > new Date()) {
          // Create next instance
          const nextDistribution = this.distributionRepository.create({
            asset_id: distribution.asset_id,
            asset_name: distribution.asset_name,
            distribution_type: distribution.distribution_type,
            frequency: distribution.frequency,
            scheduled_date: nextDate,
            total_amount: distribution.total_amount,
            distributed_amount: 0,
            withheld_amount: 0,
            fee_amount: 0,
            net_amount: 0,
            status: DistributionStatus.PENDING,
            stablecoin_type: distribution.stablecoin_type,
            exchange_rate: distribution.exchange_rate,
            metadata: {
              ...distribution.metadata,
              parent_distribution_id: distribution.id,
              created_at: new Date().toISOString(),
              is_recurring_instance: true,
            },
          });

          await this.distributionRepository.save(nextDistribution);
          createdCount++;

          this.logger.log(`Created recurring distribution instance for ${distribution.asset_name} on ${nextDate}`);
        }
      } catch (error) {
        this.logger.error(`Failed to create recurring distribution for ${distribution.asset_name}: ${error.message}`);
      }
    }

    this.logger.log(`Created ${createdCount} recurring distribution instances`);
    return createdCount;
  }

  /**
   * Calculate next recurring date based on frequency and settings
   */
  private calculateNextRecurringDate(
    baseDate: Date,
    frequency: DistributionFrequency,
    recurringSettings?: any
  ): Date | null {
    const nextDate = new Date(baseDate);

    switch (frequency) {
      case DistributionFrequency.DAILY:
        nextDate.setDate(nextDate.getDate() + 1);
        break;

      case DistributionFrequency.WEEKLY:
        nextDate.setDate(nextDate.getDate() + 7);
        break;

      case DistributionFrequency.MONTHLY:
        nextDate.setMonth(nextDate.getMonth() + 1);
        break;

      case DistributionFrequency.QUARTERLY:
        nextDate.setMonth(nextDate.getMonth() + 3);
        break;

      case DistributionFrequency.YEARLY:
        nextDate.setFullYear(nextDate.getFullYear() + 1);
        break;

      default:
        return null;
    }

    // Apply custom settings if available
    if (recurringSettings?.dayOfWeek !== undefined) {
      // Set to specific day of week
      const targetDay = recurringSettings.dayOfWeek;
      const currentDay = nextDate.getDay();
      const daysToAdd = (targetDay - currentDay + 7) % 7;
      nextDate.setDate(nextDate.getDate() + daysToAdd);
    }

    if (recurringSettings?.dayOfMonth !== undefined) {
      // Set to specific day of month
      nextDate.setDate(recurringSettings.dayOfMonth);
    }

    return nextDate;
  }

  /**
   * Get distribution statistics
   */
  async getDistributionStats(): Promise<{
    total: number;
    pending: number;
    approved: number;
    executed: number;
    cancelled: number;
    failed: number;
    byType: Record<string, number>;
    byFrequency: Record<string, number>;
    totalAmount: number;
    totalDistributed: number;
  }> {
    const [total, pending, approved, executed, cancelled, failed] = await Promise.all([
      this.distributionRepository.count(),
      this.distributionRepository.count({ where: { status: DistributionStatus.PENDING } }),
      this.distributionRepository.count({ where: { status: DistributionStatus.APPROVED } }),
      this.distributionRepository.count({ where: { status: DistributionStatus.EXECUTED } }),
      this.distributionRepository.count({ where: { status: DistributionStatus.CANCELLED } }),
      this.distributionRepository.count({ where: { status: DistributionStatus.FAILED } }),
    ]);

    // Get counts by type
    const typeStats = await this.distributionRepository
      .createQueryBuilder('distribution')
      .select('distribution.distribution_type', 'type')
      .addSelect('COUNT(*)', 'count')
      .groupBy('distribution.distribution_type')
      .getRawMany();

    const byType = typeStats.reduce((acc, stat) => {
      acc[stat.type] = parseInt(stat.count);
      return acc;
    }, {});

    // Get counts by frequency
    const frequencyStats = await this.distributionRepository
      .createQueryBuilder('distribution')
      .select('distribution.frequency', 'frequency')
      .addSelect('COUNT(*)', 'count')
      .groupBy('distribution.frequency')
      .getRawMany();

    const byFrequency = frequencyStats.reduce((acc, stat) => {
      acc[stat.frequency] = parseInt(stat.count);
      return acc;
    }, {});

    // Get total amounts
    const amountStats = await this.distributionRepository
      .createQueryBuilder('distribution')
      .select('SUM(distribution.total_amount)', 'totalAmount')
      .addSelect('SUM(distribution.distributed_amount)', 'totalDistributed')
      .getRawOne();

    return {
      total,
      pending,
      approved,
      executed,
      cancelled,
      failed,
      byType,
      byFrequency,
      totalAmount: parseFloat(amountStats.totalAmount) || 0,
      totalDistributed: parseFloat(amountStats.totalDistributed) || 0,
    };
  }

  /**
   * Search distributions with filters
   */
  async searchDistributions(filters: {
    assetId?: string;
    status?: DistributionStatus;
    type?: DistributionType;
    frequency?: DistributionFrequency;
    fromDate?: Date;
    toDate?: Date;
    limit?: number;
    offset?: number;
  }): Promise<{ distributions: Distribution[]; total: number }> {
    const queryBuilder = this.distributionRepository.createQueryBuilder('distribution');

    if (filters.assetId) {
      queryBuilder.andWhere('distribution.asset_id = :assetId', { assetId: filters.assetId });
    }

    if (filters.status) {
      queryBuilder.andWhere('distribution.status = :status', { status: filters.status });
    }

    if (filters.type) {
      queryBuilder.andWhere('distribution.distribution_type = :type', { type: filters.type });
    }

    if (filters.frequency) {
      queryBuilder.andWhere('distribution.frequency = :frequency', { frequency: filters.frequency });
    }

    if (filters.fromDate) {
      queryBuilder.andWhere('distribution.scheduled_date >= :fromDate', { fromDate: filters.fromDate });
    }

    if (filters.toDate) {
      queryBuilder.andWhere('distribution.scheduled_date <= :toDate', { toDate: filters.toDate });
    }

    const total = await queryBuilder.getCount();

    if (filters.limit) {
      queryBuilder.limit(filters.limit);
    }

    if (filters.offset) {
      queryBuilder.offset(filters.offset);
    }

    queryBuilder.orderBy('distribution.scheduled_date', 'DESC');

    const distributions = await queryBuilder.getMany();

    return { distributions, total };
  }
}
