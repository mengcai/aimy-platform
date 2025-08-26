import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScheduleModule } from '@nestjs/schedule';
import { BullModule } from '@nestjs/bull';

// Entities
import { InvestorWallet } from './entities/investor-wallet.entity';
import { Distribution } from './entities/distribution.entity';
import { PayoutRun } from './entities/payout-run.entity';
import { PayoutReceipt } from './entities/payout-receipt.entity';
import { WithholdingRule } from './entities/withholding-rule.entity';
import { FeeCapture } from './entities/fee-capture.entity';

// Services
import { SettlementService } from './services/settlement.service';
import { WalletRegistryService } from './services/wallet-registry.service';
import { DistributionService } from './services/distribution.service';
import { PayoutService } from './services/payout.service';
import { WithholdingService } from './services/withholding.service';
import { FeeService } from './services/fee.service';
import { ReceiptService } from './services/receipt.service';
import { StablecoinAdapterService } from './adapters/stablecoin-adapter';
import { USDCAdapter } from './adapters/usdc-adapter';
import { HKDStablecoinAdapter } from './adapters/hkd-stablecoin-adapter';

// Controllers
import { SettlementController } from './controllers/settlement.controller';
import { PayoutController } from './controllers/payout.controller';
import { WalletController } from './controllers/wallet.controller';
import { DistributionController } from './controllers/distribution.controller';

// Processors
import { PayoutProcessor } from './processors/payout.processor';
import { DistributionProcessor } from './processors/distribution.processor';

// Tasks
import { ScheduledTasks } from './tasks/scheduled-tasks';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      InvestorWallet,
      Distribution,
      PayoutRun,
      PayoutReceipt,
      WithholdingRule,
      FeeCapture,
    ]),
    ScheduleModule.forRoot(),
    BullModule.registerQueue(
      {
        name: 'payouts',
        defaultJobOptions: {
          removeOnComplete: 100,
          removeOnFail: 50,
        },
      },
      {
        name: 'distributions',
        defaultJobOptions: {
          removeOnComplete: 100,
          removeOnFail: 50,
        },
      }
    ),
  ],
  controllers: [
    SettlementController,
    PayoutController,
    WalletController,
    DistributionController,
  ],
  providers: [
    SettlementService,
    WalletRegistryService,
    DistributionService,
    PayoutService,
    WithholdingService,
    FeeService,
    ReceiptService,
    StablecoinAdapterService,
    USDCAdapter,
    HKDStablecoinAdapter,
    PayoutProcessor,
    DistributionProcessor,
    ScheduledTasks,
  ],
  exports: [
    SettlementService,
    WalletRegistryService,
    DistributionService,
    PayoutService,
    WithholdingService,
    FeeService,
    ReceiptService,
    StablecoinAdapterService,
  ],
})
export class SettlementModule {}
