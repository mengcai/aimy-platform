import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PayoutService } from '../services/payout.service';
import { WithholdingService } from '../services/withholding.service';
import { FeeService } from '../services/fee.service';
import { StablecoinAdapterService } from '../adapters/stablecoin-adapter';
import { PayoutRun, PayoutRunStatus } from '../entities/payout-run.entity';
import { PayoutReceipt, ReceiptStatus } from '../entities/payout-receipt.entity';
import { Distribution, DistributionStatus } from '../entities/distribution.entity';
import { InvestorWallet, WalletStatus } from '../entities/investor-wallet.entity';
import { WithholdingRule } from '../entities/withholding-rule.entity';
import { FeeCapture, FeeStatus } from '../entities/fee-capture.entity';

describe('SettlementService', () => {
  let module: TestingModule;
  let payoutService: PayoutService;
  let withholdingService: WithholdingService;
  let feeService: FeeService;
  let stablecoinAdapter: StablecoinAdapterService;

  // Mock repositories
  let payoutRunRepository: Repository<PayoutRun>;
  let receiptRepository: Repository<PayoutReceipt>;
  let distributionRepository: Repository<Distribution>;
  let walletRepository: Repository<InvestorWallet>;
  let withholdingRuleRepository: Repository<WithholdingRule>;
  let feeCaptureRepository: Repository<FeeCapture>;

  beforeEach(async () => {
    module = await Test.createTestingModule({
      providers: [
        PayoutService,
        WithholdingService,
        FeeService,
        StablecoinAdapterService,
        {
          provide: getRepositoryToken(PayoutRun),
          useValue: {
            create: jest.fn(),
            save: jest.fn(),
            update: jest.fn(),
            findOne: jest.fn(),
            find: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(PayoutReceipt),
          useValue: {
            save: jest.fn(),
            update: jest.fn(),
            find: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(Distribution),
          useValue: {
            findOne: jest.fn(),
            find: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(InvestorWallet),
          useValue: {
            find: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(WithholdingRule),
          useValue: {
            find: jest.fn(),
            create: jest.fn(),
            save: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(FeeCapture),
          useValue: {
            find: jest.fn(),
            create: jest.fn(),
            save: jest.fn(),
            update: jest.fn(),
          },
        },
      ],
    }).compile();

    payoutService = module.get<PayoutService>(PayoutService);
    withholdingService = module.get<WithholdingService>(WithholdingService);
    feeService = module.get<FeeService>(FeeService);
    stablecoinAdapter = module.get<StablecoinAdapterService>(StablecoinAdapter);

    payoutRunRepository = module.get<Repository<PayoutRun>>(getRepositoryToken(PayoutRun));
    receiptRepository = module.get<Repository<PayoutReceipt>>(getRepositoryToken(PayoutReceipt));
    distributionRepository = module.get<Repository<Distribution>>(getRepositoryToken(Distribution));
    walletRepository = module.get<Repository<InvestorWallet>>(getRepositoryToken(InvestorWallet));
    withholdingRuleRepository = module.get<Repository<WithholdingRule>>(getRepositoryToken(WithholdingRule));
    feeCaptureRepository = module.get<Repository<FeeCapture>>(getRepositoryToken(FeeCapture));
  });

  afterEach(async () => {
    await module.close();
  });

  describe('PayoutService - Pro-rata Calculations', () => {
    describe('Edge Cases', () => {
      it('should handle zero token balances gracefully', async () => {
        // Mock wallets with zero balances
        const mockWallets = [
          { id: 'wallet-1', investor_id: 'investor-1', asset_id: 'asset-1', status: WalletStatus.ACTIVE, is_kyc_verified: true },
          { id: 'wallet-2', investor_id: 'investor-2', asset_id: 'asset-1', status: WalletStatus.ACTIVE, is_kyc_verified: true },
        ];

        const mockDistribution = {
          id: 'dist-1',
          asset_id: 'asset-1',
          total_amount: 10000,
          stablecoin_type: 'USDC',
          exchange_rate: 1,
        };

        jest.spyOn(walletRepository, 'find').mockResolvedValue(mockWallets as any);
        jest.spyOn(payoutService as any, 'getTokenBalances').mockResolvedValue([
          { walletId: 'wallet-1', balance: 0 },
          { walletId: 'wallet-2', balance: 0 },
        ]);

        await expect(
          payoutService['calculateProRataShares'](mockDistribution as any)
        ).rejects.toThrow('Total token balance is zero for asset asset-1');
      });

      it('should handle single investor scenario correctly', async () => {
        const mockWallets = [
          { id: 'wallet-1', investor_id: 'investor-1', asset_id: 'asset-1', status: WalletStatus.ACTIVE, is_kyc_verified: true },
        ];

        const mockDistribution = {
          id: 'dist-1',
          asset_id: 'asset-1',
          total_amount: 10000,
          stablecoin_type: 'USDC',
          exchange_rate: 1,
        };

        jest.spyOn(walletRepository, 'find').mockResolvedValue(mockWallets as any);
        jest.spyOn(payoutService as any, 'getTokenBalances').mockResolvedValue([
          { walletId: 'wallet-1', balance: 1000 },
        ]);

        jest.spyOn(withholdingService, 'calculateWithholding').mockResolvedValue(0);
        jest.spyOn(feeService, 'calculateFees').mockResolvedValue(0);

        const result = await payoutService['calculateProRataShares'](mockDistribution as any);

        expect(result).toHaveLength(1);
        expect(result[0].proRataShare).toBe(1); // 100% share
        expect(result[0].grossAmount).toBe(10000); // Full distribution amount
        expect(result[0].netAmount).toBe(10000); // No withholding or fees
      });

      it('should handle very small token balances without precision loss', async () => {
        const mockWallets = [
          { id: 'wallet-1', investor_id: 'investor-1', asset_id: 'asset-1', status: WalletStatus.ACTIVE, is_kyc_verified: true },
          { id: 'wallet-2', investor_id: 'investor-2', asset_id: 'asset-1', status: WalletStatus.ACTIVE, is_kyc_verified: true },
        ];

        const mockDistribution = {
          id: 'dist-1',
          asset_id: 'asset-1',
          total_amount: 10000,
          stablecoin_type: 'USDC',
          exchange_rate: 1,
        };

        jest.spyOn(walletRepository, 'find').mockResolvedValue(mockWallets as any);
        jest.spyOn(payoutService as any, 'getTokenBalances').mockResolvedValue([
          { walletId: 'wallet-1', balance: 0.000001 }, // Very small balance
          { walletId: 'wallet-2', balance: 999999.999999 }, // Large balance
        ]);

        jest.spyOn(withholdingService, 'calculateWithholding').mockResolvedValue(0);
        jest.spyOn(feeService, 'calculateFees').mockResolvedValue(0);

        const result = await payoutService['calculateProRataShares'](mockDistribution as any);

        expect(result).toHaveLength(2);
        
        // First investor should get very small amount
        expect(result[0].proRataShare).toBeCloseTo(0.000000001, 9);
        expect(result[0].grossAmount).toBeCloseTo(0.00001, 5);
        
        // Second investor should get almost everything
        expect(result[1].proRataShare).toBeCloseTo(0.999999999, 9);
        expect(result[1].grossAmount).toBeCloseTo(9999.99999, 5);
      });

      it('should handle extremely large token balances without overflow', async () => {
        const mockWallets = [
          { id: 'wallet-1', investor_id: 'investor-1', asset_id: 'asset-1', status: WalletStatus.ACTIVE, is_kyc_verified: true },
        ];

        const mockDistribution = {
          id: 'dist-1',
          asset_id: 'asset-1',
          total_amount: Number.MAX_SAFE_INTEGER,
          stablecoin_type: 'USDC',
          exchange_rate: 1,
        };

        jest.spyOn(walletRepository, 'find').mockResolvedValue(mockWallets as any);
        jest.spyOn(payoutService as any, 'getTokenBalances').mockResolvedValue([
          { walletId: 'wallet-1', balance: Number.MAX_SAFE_INTEGER },
        ]);

        jest.spyOn(withholdingService, 'calculateWithholding').mockResolvedValue(0);
        jest.spyOn(feeService, 'calculateFees').mockResolvedValue(0);

        const result = await payoutService['calculateProRataShares'](mockDistribution as any);

        expect(result).toHaveLength(1);
        expect(result[0].proRataShare).toBe(1);
        expect(result[0].grossAmount).toBe(Number.MAX_SAFE_INTEGER);
        expect(result[0].netAmount).toBe(Number.MAX_SAFE_INTEGER);
      });

      it('should handle mixed positive and zero balances correctly', async () => {
        const mockWallets = [
          { id: 'wallet-1', investor_id: 'investor-1', asset_id: 'asset-1', status: WalletStatus.ACTIVE, is_kyc_verified: true },
          { id: 'wallet-2', investor_id: 'investor-2', asset_id: 'asset-1', status: WalletStatus.ACTIVE, is_kyc_verified: true },
          { id: 'wallet-3', investor_id: 'investor-3', asset_id: 'asset-1', status: WalletStatus.ACTIVE, is_kyc_verified: true },
        ];

        const mockDistribution = {
          id: 'dist-1',
          asset_id: 'asset-1',
          total_amount: 10000,
          stablecoin_type: 'USDC',
          exchange_rate: 1,
        };

        jest.spyOn(walletRepository, 'find').mockResolvedValue(mockWallets as any);
        jest.spyOn(payoutService as any, 'getTokenBalances').mockResolvedValue([
          { walletId: 'wallet-1', balance: 1000 },
          { walletId: 'wallet-2', balance: 0 }, // Zero balance
          { walletId: 'wallet-3', balance: 2000 },
        ]);

        jest.spyOn(withholdingService, 'calculateWithholding').mockResolvedValue(0);
        jest.spyOn(feeService, 'calculateFees').mockResolvedValue(0);

        const result = await payoutService['calculateProRataShares'](mockDistribution as any);

        expect(result).toHaveLength(2); // Only 2 investors with positive balances
        
        // First investor: 1000 / 3000 = 33.33%
        expect(result[0].proRataShare).toBeCloseTo(0.333333, 6);
        expect(result[0].grossAmount).toBeCloseTo(3333.33, 2);
        
        // Second investor: 2000 / 3000 = 66.67%
        expect(result[1].proRataShare).toBeCloseTo(0.666667, 6);
        expect(result[1].grossAmount).toBeCloseTo(6666.67, 2);
      });

      it('should handle negative token balances by treating them as zero', async () => {
        const mockWallets = [
          { id: 'wallet-1', investor_id: 'investor-1', asset_id: 'asset-1', status: WalletStatus.ACTIVE, is_kyc_verified: true },
          { id: 'wallet-2', investor_id: 'investor-2', asset_id: 'asset-1', status: WalletStatus.ACTIVE, is_kyc_verified: true },
        ];

        const mockDistribution = {
          id: 'dist-1',
          asset_id: 'asset-1',
          total_amount: 10000,
          stablecoin_type: 'USDC',
          exchange_rate: 1,
        };

        jest.spyOn(walletRepository, 'find').mockResolvedValue(mockWallets as any);
        jest.spyOn(payoutService as any, 'getTokenBalances').mockResolvedValue([
          { walletId: 'wallet-1', balance: -500 }, // Negative balance
          { walletId: 'wallet-2', balance: 1000 },
        ]);

        jest.spyOn(withholdingService, 'calculateWithholding').mockResolvedValue(0);
        jest.spyOn(feeService, 'calculateFees').mockResolvedValue(0);

        const result = await payoutService['calculateProRataShares'](mockDistribution as any);

        expect(result).toHaveLength(1); // Only 1 investor with positive balance
        
        // Second investor should get 100% since first has negative balance
        expect(result[0].proRataShare).toBe(1);
        expect(result[0].grossAmount).toBe(10000);
        expect(result[0].netAmount).toBe(10000);
      });

      it('should handle floating point precision issues correctly', async () => {
        const mockWallets = [
          { id: 'wallet-1', investor_id: 'investor-1', asset_id: 'asset-1', status: WalletStatus.ACTIVE, is_kyc_verified: true },
          { id: 'wallet-2', investor_id: 'investor-2', asset_id: 'asset-1', status: WalletStatus.ACTIVE, is_kyc_verified: true },
          { id: 'wallet-3', investor_id: 'investor-3', asset_id: 'asset-1', status: WalletStatus.ACTIVE, is_kyc_verified: true },
        ];

        const mockDistribution = {
          id: 'dist-1',
          asset_id: 'asset-1',
          total_amount: 100,
          stablecoin_type: 'USDC',
          exchange_rate: 1,
        };

        jest.spyOn(walletRepository, 'find').mockResolvedValue(mockWallets as any);
        jest.spyOn(payoutService as any, 'getTokenBalances').mockResolvedValue([
          { walletId: 'wallet-1', balance: 33.333333 },
          { walletId: 'wallet-2', balance: 33.333333 },
          { walletId: 'wallet-3', balance: 33.333334 }, // Slightly different to test precision
        ]);

        jest.spyOn(withholdingService, 'calculateWithholding').mockResolvedValue(0);
        jest.spyOn(feeService, 'calculateFees').mockResolvedValue(0);

        const result = await payoutService['calculateProRataShares'](mockDistribution as any);

        expect(result).toHaveLength(3);
        
        // Sum of all amounts should equal total distribution
        const totalCalculated = result.reduce((sum, calc) => sum + calc.grossAmount, 0);
        expect(totalCalculated).toBeCloseTo(100, 2);
        
        // Sum of all pro-rata shares should equal 1
        const totalShares = result.reduce((sum, calc) => sum + calc.proRataShare, 0);
        expect(totalShares).toBeCloseTo(1, 6);
      });
    });

    describe('Withholding and Fee Calculations', () => {
      it('should handle withholding that exceeds gross amount', async () => {
        const mockWallets = [
          { id: 'wallet-1', investor_id: 'investor-1', asset_id: 'asset-1', status: WalletStatus.ACTIVE, is_kyc_verified: true },
        ];

        const mockDistribution = {
          id: 'dist-1',
          asset_id: 'asset-1',
          total_amount: 1000,
          stablecoin_type: 'USDC',
          exchange_rate: 1,
        };

        jest.spyOn(walletRepository, 'find').mockResolvedValue(mockWallets as any);
        jest.spyOn(payoutService as any, 'getTokenBalances').mockResolvedValue([
          { walletId: 'wallet-1', balance: 1000 },
        ]);

        // Mock withholding that exceeds gross amount
        jest.spyOn(withholdingService, 'calculateWithholding').mockResolvedValue(1500);
        jest.spyOn(feeService, 'calculateFees').mockResolvedValue(0);

        const result = await payoutService['calculateProRataShares'](mockDistribution as any);

        expect(result).toHaveLength(1);
        expect(result[0].withholdingAmount).toBe(1000); // Capped at gross amount
        expect(result[0].netAmount).toBe(0); // No net amount after withholding
      });

      it('should handle fees that exceed gross amount', async () => {
        const mockWallets = [
          { id: 'wallet-1', investor_id: 'investor-1', asset_id: 'asset-1', status: WalletStatus.ACTIVE, is_kyc_verified: true },
        ];

        const mockDistribution = {
          id: 'dist-1',
          asset_id: 'asset-1',
          total_amount: 1000,
          stablecoin_type: 'USDC',
          exchange_rate: 1,
        };

        jest.spyOn(walletRepository, 'find').mockResolvedValue(mockWallets as any);
        jest.spyOn(payoutService as any, 'getTokenBalances').mockResolvedValue([
          { walletId: 'wallet-1', balance: 1000 },
        ]);

        jest.spyOn(withholdingService, 'calculateWithholding').mockResolvedValue(0);
        // Mock fees that exceed gross amount
        jest.spyOn(feeService, 'calculateFees').mockResolvedValue(1500);

        const result = await payoutService['calculateProRataShares'](mockDistribution as any);

        expect(result).toHaveLength(1);
        expect(result[0].feeAmount).toBe(1000); // Capped at gross amount
        expect(result[0].netAmount).toBe(0); // No net amount after fees
      });

      it('should handle combined withholding and fees that exceed gross amount', async () => {
        const mockWallets = [
          { id: 'wallet-1', investor_id: 'investor-1', asset_id: 'asset-1', status: WalletStatus.ACTIVE, is_kyc_verified: true },
        ];

        const mockDistribution = {
          id: 'dist-1',
          asset_id: 'asset-1',
          total_amount: 1000,
          stablecoin_type: 'USDC',
          exchange_rate: 1,
        };

        jest.spyOn(walletRepository, 'find').mockResolvedValue(mockWallets as any);
        jest.spyOn(payoutService as any, 'getTokenBalances').mockResolvedValue([
          { walletId: 'wallet-1', balance: 1000 },
        ]);

        // Mock withholding and fees that together exceed gross amount
        jest.spyOn(withholdingService, 'calculateWithholding').mockResolvedValue(600);
        jest.spyOn(feeService, 'calculateFees').mockResolvedValue(600);

        const result = await payoutService['calculateProRataShares'](mockDistribution as any);

        expect(result).toHaveLength(1);
        expect(result[0].withholdingAmount).toBe(600);
        expect(result[0].feeAmount).toBe(400); // Reduced to fit within remaining amount
        expect(result[0].netAmount).toBe(0); // No net amount after all deductions
      });
    });

    describe('Dry Run Mode', () => {
      it('should execute dry run without actual transfers', async () => {
        const mockDistribution = {
          id: 'dist-1',
          asset_id: 'asset-1',
          asset_name: 'Test Asset',
          total_amount: 1000,
          stablecoin_type: 'USDC',
          exchange_rate: 1,
          type: 'DIVIDEND',
        };

        const mockWallets = [
          { id: 'wallet-1', investor_id: 'investor-1', asset_id: 'asset-1', status: WalletStatus.ACTIVE, is_kyc_verified: true },
        ];

        jest.spyOn(distributionRepository, 'findOne').mockResolvedValue(mockDistribution as any);
        jest.spyOn(walletRepository, 'find').mockResolvedValue(mockWallets as any);
        jest.spyOn(payoutService as any, 'getTokenBalances').mockResolvedValue([
          { walletId: 'wallet-1', balance: 1000 },
        ]);
        jest.spyOn(withholdingService, 'calculateWithholding').mockResolvedValue(0);
        jest.spyOn(feeService, 'calculateFees').mockResolvedValue(0);
        jest.spyOn(payoutRunRepository, 'create').mockReturnValue({ id: 'run-1' } as any);
        jest.spyOn(payoutRunRepository, 'save').mockResolvedValue({ id: 'run-1' } as any);
        jest.spyOn(receiptRepository, 'save').mockResolvedValue({ id: 'receipt-1' } as any);

        const result = await payoutService.executePayoutRun({
          distributionId: 'dist-1',
          isDryRun: true,
        });

        expect(result.success).toBe(true);
        expect(result.payoutRunId).toBe('run-1');
        expect(result.totalRecipients).toBe(1);
        expect(result.successfulPayouts).toBe(1);
        expect(result.failedPayouts).toBe(0);
      });
    });
  });

  describe('WithholdingService', () => {
    it('should apply multiple withholding rules correctly', async () => {
      const mockRules = [
        {
          id: 'rule-1',
          name: 'Tax Rule',
          type: 'TAX',
          rate: 0.15,
          calculation_method: 'PERCENTAGE',
          priority: 1,
          is_active: true,
        },
        {
          id: 'rule-2',
          name: 'Compliance Rule',
          type: 'COMPLIANCE',
          rate: 0.05,
          calculation_method: 'PERCENTAGE',
          priority: 2,
          is_active: true,
        },
      ];

      jest.spyOn(withholdingRuleRepository, 'find').mockResolvedValue(mockRules as any);

      const mockWallet = {
        investor_id: 'investor-1',
        jurisdiction: 'US',
        metadata: {},
      };

      const mockDistribution = {
        asset_id: 'asset-1',
        type: 'DIVIDEND',
      };

      const result = await withholdingService.calculateWithholding(
        mockWallet as any,
        1000,
        mockDistribution as any
      );

      // 15% tax + 5% compliance = 20% total
      expect(result).toBe(200);
    });
  });

  describe('FeeService', () => {
    it('should calculate tiered fees correctly', async () => {
      const mockFees = [
        {
          id: 'fee-1',
          fee_type: 'MANAGEMENT_FEE',
          calculation_method: 'TIERED',
          tiered_rates: [
            { threshold: 0, rate: 0.01 },
            { threshold: 1000, rate: 0.015 },
            { threshold: 5000, rate: 0.02 },
          ],
          base_amount: 0,
          is_active: true,
        },
      ];

      jest.spyOn(feeCaptureRepository, 'find').mockResolvedValue(mockFees as any);

      const mockWallet = {
        investor_id: 'investor-1',
        metadata: {},
      };

      const mockDistribution = {
        asset_id: 'asset-1',
        type: 'DIVIDEND',
      };

      const result = await feeService.calculateFees(
        mockWallet as any,
        10000, // $10,000
        mockDistribution as any
      );

      // Tiered calculation:
      // 0-1000: 1000 * 0.01 = 10
      // 1000-5000: 4000 * 0.015 = 60
      // 5000-10000: 5000 * 0.02 = 100
      // Total: 170
      expect(result).toBe(170);
    });
  });
});
