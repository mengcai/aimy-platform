import { Injectable, Logger, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { InvestorWallet, WalletStatus, WalletType, StablecoinType } from '../entities/investor-wallet.entity';
import { StablecoinAdapterService } from '../adapters/stablecoin-adapter';

export interface CreateWalletRequest {
  investorId: string;
  assetId: string;
  walletAddress: string;
  stablecoinType: StablecoinType;
  walletType?: WalletType;
  jurisdiction?: string;
  metadata?: Record<string, any>;
}

export interface UpdateWalletRequest {
  status?: WalletStatus;
  balance?: number;
  isKycVerified?: boolean;
  jurisdiction?: string;
  metadata?: Record<string, any>;
}

export interface WalletValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

@Injectable()
export class WalletRegistryService {
  private readonly logger = new Logger(WalletRegistryService.name);

  constructor(
    @InjectRepository(InvestorWallet)
    private readonly walletRepository: Repository<InvestorWallet>,
    private readonly stablecoinAdapter: StablecoinAdapterService,
  ) {}

  /**
   * Create a new investor wallet
   */
  async createWallet(request: CreateWalletRequest): Promise<InvestorWallet> {
    this.logger.log(`Creating wallet for investor ${request.investorId} on asset ${request.assetId}`);

    // Validate wallet address
    const validation = await this.validateWalletAddress(request.walletAddress, request.stablecoinType);
    if (!validation.isValid) {
      throw new BadRequestException(`Invalid wallet address: ${validation.errors.join(', ')}`);
    }

    // Check for existing wallet
    const existingWallet = await this.walletRepository.findOne({
      where: {
        investor_id: request.investorId,
        asset_id: request.assetId,
        stablecoin_type: request.stablecoinType,
      },
    });

    if (existingWallet) {
      throw new BadRequestException('Wallet already exists for this investor, asset, and stablecoin combination');
    }

    // Create wallet
    const wallet = this.walletRepository.create({
      investor_id: request.investorId,
      asset_id: request.assetId,
      wallet_address: request.walletAddress,
      stablecoin_type: request.stablecoinType,
      wallet_type: request.walletType || WalletType.INVESTOR,
      status: WalletStatus.PENDING,
      balance: 0,
      is_kyc_verified: false,
      jurisdiction: request.jurisdiction || 'UNKNOWN',
      metadata: request.metadata || {},
    });

    const savedWallet = await this.walletRepository.save(wallet);
    this.logger.log(`Created wallet ${savedWallet.id} for investor ${request.investorId}`);

    return savedWallet;
  }

  /**
   * Update an existing wallet
   */
  async updateWallet(walletId: string, request: UpdateWalletRequest): Promise<InvestorWallet> {
    this.logger.log(`Updating wallet ${walletId}`);

    const wallet = await this.walletRepository.findOne({
      where: { id: walletId },
    });

    if (!wallet) {
      throw new NotFoundException(`Wallet ${walletId} not found`);
    }

    // Update fields
    if (request.status !== undefined) {
      wallet.status = request.status;
    }
    if (request.balance !== undefined) {
      wallet.balance = request.balance;
    }
    if (request.isKycVerified !== undefined) {
      wallet.is_kyc_verified = request.isKycVerified;
    }
    if (request.jurisdiction !== undefined) {
      wallet.jurisdiction = request.jurisdiction;
    }
    if (request.metadata !== undefined) {
      wallet.metadata = { ...wallet.metadata, ...request.metadata };
    }

    const updatedWallet = await this.walletRepository.save(wallet);
    this.logger.log(`Updated wallet ${walletId}`);

    return updatedWallet;
  }

  /**
   * Get wallet by ID
   */
  async getWallet(walletId: string): Promise<InvestorWallet> {
    const wallet = await this.walletRepository.findOne({
      where: { id: walletId },
    });

    if (!wallet) {
      throw new NotFoundException(`Wallet ${walletId} not found`);
    }

    return wallet;
  }

  /**
   * Get wallets by investor ID
   */
  async getWalletsByInvestor(investorId: string): Promise<InvestorWallet[]> {
    return this.walletRepository.find({
      where: { investor_id: investorId },
      order: { created_at: 'DESC' },
    });
  }

  /**
   * Get wallets by asset ID
   */
  async getWalletsByAsset(assetId: string): Promise<InvestorWallet[]> {
    return this.walletRepository.find({
      where: { asset_id: assetId },
      order: { created_at: 'DESC' },
    });
  }

  /**
   * Get wallets by status
   */
  async getWalletsByStatus(status: WalletStatus): Promise<InvestorWallet[]> {
    return this.walletRepository.find({
      where: { status },
      order: { created_at: 'DESC' },
    });
  }

  /**
   * Activate a wallet (change status from PENDING to ACTIVE)
   */
  async activateWallet(walletId: string): Promise<InvestorWallet> {
    this.logger.log(`Activating wallet ${walletId}`);

    const wallet = await this.getWallet(walletId);

    if (wallet.status !== WalletStatus.PENDING) {
      throw new BadRequestException(`Wallet ${walletId} is not in PENDING status`);
    }

    if (!wallet.is_kyc_verified) {
      throw new BadRequestException(`Wallet ${walletId} requires KYC verification before activation`);
    }

    wallet.status = WalletStatus.ACTIVE;
    const activatedWallet = await this.walletRepository.save(wallet);

    this.logger.log(`Activated wallet ${walletId}`);
    return activatedWallet;
  }

  /**
   * Suspend a wallet
   */
  async suspendWallet(walletId: string, reason: string): Promise<InvestorWallet> {
    this.logger.log(`Suspending wallet ${walletId}: ${reason}`);

    const wallet = await this.getWallet(walletId);

    if (wallet.status === WalletStatus.SUSPENDED) {
      throw new BadRequestException(`Wallet ${walletId} is already suspended`);
    }

    wallet.status = WalletStatus.SUSPENDED;
    wallet.metadata = {
      ...wallet.metadata,
      suspension_reason: reason,
      suspended_at: new Date().toISOString(),
    };

    const suspendedWallet = await this.walletRepository.save(wallet);
    this.logger.log(`Suspended wallet ${walletId}`);

    return suspendedWallet;
  }

  /**
   * Reactivate a suspended wallet
   */
  async reactivateWallet(walletId: string): Promise<InvestorWallet> {
    this.logger.log(`Reactivating wallet ${walletId}`);

    const wallet = await this.getWallet(walletId);

    if (wallet.status !== WalletStatus.SUSPENDED) {
      throw new BadRequestException(`Wallet ${walletId} is not suspended`);
    }

    wallet.status = WalletStatus.ACTIVE;
    wallet.metadata = {
      ...wallet.metadata,
      reactivated_at: new Date().toISOString(),
    };

    const reactivatedWallet = await this.walletRepository.save(wallet);
    this.logger.log(`Reactivated wallet ${walletId}`);

    return reactivatedWallet;
  }

  /**
   * Update wallet balance
   */
  async updateBalance(walletId: string, newBalance: number): Promise<InvestorWallet> {
    this.logger.log(`Updating balance for wallet ${walletId} to ${newBalance}`);

    const wallet = await this.getWallet(walletId);

    if (newBalance < 0) {
      throw new BadRequestException('Balance cannot be negative');
    }

    wallet.balance = newBalance;
    wallet.metadata = {
      ...wallet.metadata,
      last_balance_update: new Date().toISOString(),
    };

    const updatedWallet = await this.walletRepository.save(wallet);
    this.logger.log(`Updated balance for wallet ${walletId}`);

    return updatedWallet;
  }

  /**
   * Validate wallet address using stablecoin adapter
   */
  async validateWalletAddress(address: string, stablecoinType: StablecoinType): Promise<WalletValidationResult> {
    const result: WalletValidationResult = {
      isValid: true,
      errors: [],
      warnings: [],
    };

    try {
      const adapter = this.stablecoinAdapter.getAdapter(stablecoinType);
      if (!adapter) {
        result.isValid = false;
        result.errors.push(`No adapter found for stablecoin type: ${stablecoinType}`);
        return result;
      }

      const isValid = await adapter.isValidAddress(address);
      if (!isValid) {
        result.isValid = false;
        result.errors.push('Invalid wallet address format');
      }

      // Check if address is already registered
      const existingWallet = await this.walletRepository.findOne({
        where: { wallet_address: address },
      });

      if (existingWallet) {
        result.warnings.push('Wallet address is already registered to another investor');
      }

    } catch (error) {
      result.isValid = false;
      result.errors.push(`Validation error: ${error.message}`);
    }

    return result;
  }

  /**
   * Get wallet statistics
   */
  async getWalletStats(): Promise<{
    total: number;
    active: number;
    pending: number;
    suspended: number;
    byStablecoin: Record<string, number>;
    byJurisdiction: Record<string, number>;
  }> {
    const [total, active, pending, suspended] = await Promise.all([
      this.walletRepository.count(),
      this.walletRepository.count({ where: { status: WalletStatus.ACTIVE } }),
      this.walletRepository.count({ where: { status: WalletStatus.PENDING } }),
      this.walletRepository.count({ where: { status: WalletStatus.SUSPENDED } }),
    ]);

    // Get counts by stablecoin type
    const stablecoinStats = await this.walletRepository
      .createQueryBuilder('wallet')
      .select('wallet.stablecoin_type', 'stablecoinType')
      .addSelect('COUNT(*)', 'count')
      .groupBy('wallet.stablecoin_type')
      .getRawMany();

    const byStablecoin = stablecoinStats.reduce((acc, stat) => {
      acc[stat.stablecoinType] = parseInt(stat.count);
      return acc;
    }, {});

    // Get counts by jurisdiction
    const jurisdictionStats = await this.walletRepository
      .createQueryBuilder('wallet')
      .select('wallet.jurisdiction', 'jurisdiction')
      .addSelect('COUNT(*)', 'count')
      .groupBy('wallet.jurisdiction')
      .getRawMany();

    const byJurisdiction = jurisdictionStats.reduce((acc, stat) => {
      acc[stat.jurisdiction] = parseInt(stat.count);
      return acc;
    }, {});

    return {
      total,
      active,
      pending,
      suspended,
      byStablecoin,
      byJurisdiction,
    };
  }

  /**
   * Search wallets with filters
   */
  async searchWallets(filters: {
    investorId?: string;
    assetId?: string;
    status?: WalletStatus;
    stablecoinType?: StablecoinType;
    jurisdiction?: string;
    isKycVerified?: boolean;
    limit?: number;
    offset?: number;
  }): Promise<{ wallets: InvestorWallet[]; total: number }> {
    const queryBuilder = this.walletRepository.createQueryBuilder('wallet');

    if (filters.investorId) {
      queryBuilder.andWhere('wallet.investor_id = :investorId', { investorId: filters.investorId });
    }

    if (filters.assetId) {
      queryBuilder.andWhere('wallet.asset_id = :assetId', { assetId: filters.assetId });
    }

    if (filters.status) {
      queryBuilder.andWhere('wallet.status = :status', { status: filters.status });
    }

    if (filters.stablecoinType) {
      queryBuilder.andWhere('wallet.stablecoin_type = :stablecoinType', { stablecoinType: filters.stablecoinType });
    }

    if (filters.jurisdiction) {
      queryBuilder.andWhere('wallet.jurisdiction = :jurisdiction', { jurisdiction: filters.jurisdiction });
    }

    if (filters.isKycVerified !== undefined) {
      queryBuilder.andWhere('wallet.is_kyc_verified = :isKycVerified', { isKycVerified: filters.isKycVerified });
    }

    const total = await queryBuilder.getCount();

    if (filters.limit) {
      queryBuilder.limit(filters.limit);
    }

    if (filters.offset) {
      queryBuilder.offset(filters.offset);
    }

    queryBuilder.orderBy('wallet.created_at', 'DESC');

    const wallets = await queryBuilder.getMany();

    return { wallets, total };
  }

  /**
   * Bulk update wallet statuses
   */
  async bulkUpdateStatus(walletIds: string[], status: WalletStatus, reason?: string): Promise<number> {
    this.logger.log(`Bulk updating ${walletIds.length} wallets to status: ${status}`);

    const updateData: any = { status };
    if (reason) {
      updateData.metadata = { bulk_update_reason: reason, bulk_updated_at: new Date().toISOString() };
    }

    const result = await this.walletRepository.update(walletIds, updateData);
    const updatedCount = result.affected || 0;

    this.logger.log(`Bulk updated ${updatedCount} wallets to status: ${status}`);
    return updatedCount;
  }

  /**
   * Get wallets eligible for distribution (active, KYC verified, positive balance)
   */
  async getEligibleWalletsForDistribution(assetId: string): Promise<InvestorWallet[]> {
    return this.walletRepository.find({
      where: {
        asset_id: assetId,
        status: WalletStatus.ACTIVE,
        is_kyc_verified: true,
      },
      order: { created_at: 'ASC' },
    });
  }
}
