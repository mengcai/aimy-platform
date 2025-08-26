import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MulterModule } from '@nestjs/platform-express';
import { BullModule } from '@nestjs/bull';
import { ScheduleModule } from '@nestjs/schedule';

// Controllers
import { KYCController } from './controllers/kyc.controller';
import { CasesController } from './controllers/cases.controller';
import { WebhookController } from './controllers/webhook.controller';
import { AuditController } from './controllers/audit.controller';
import { HealthController } from './controllers/health.controller';

// Services
import { KYCService } from './services/kyc.service';
import { ScreeningService } from './services/screening.service';
import { RuleEngineService } from './services/rule-engine.service';
import { CaseManagementService } from './services/case-management.service';
import { WebhookService } from './services/webhook.service';
import { AuditService } from './services/audit.service';
import { MinIOService } from './services/minio.service';

// Processors
import { KYCProcessor } from './processors/kyc.processor';
import { ScreeningProcessor } from './processors/screening.processor';

// Entities
import { KYCApplicant } from './entities/kyc-applicant.entity';
import { KYCDocument } from './entities/kyc-document.entity';
import { ScreeningResult } from './entities/screening-result.entity';
import { ComplianceRule } from './entities/compliance-rule.entity';
import { ComplianceCase } from './entities/compliance-case.entity';
import { AuditLog } from './entities/audit-log.entity';

@Module({
  imports: [
    // Configuration
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env.local', '.env'],
    }),

    // Database
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get('DB_HOST', 'localhost'),
        port: configService.get('DB_PORT', 5432),
        username: configService.get('DB_USERNAME', 'postgres'),
        password: configService.get('DB_PASSWORD', 'postgres'),
        database: configService.get('DB_NAME', 'aimy_compliance'),
        entities: [KYCApplicant, KYCDocument, ScreeningResult, ComplianceRule, ComplianceCase, AuditLog],
        synchronize: configService.get('NODE_ENV') === 'development',
        logging: configService.get('NODE_ENV') === 'development',
      }),
      inject: [ConfigService],
    }),

    // Entity registration
    TypeOrmModule.forFeature([
      KYCApplicant,
      KYCDocument,
      ScreeningResult,
      ComplianceRule,
      ComplianceCase,
      AuditLog,
    ]),

    // File uploads
    MulterModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        dest: configService.get('UPLOAD_PATH', './uploads'),
        limits: {
          fileSize: configService.get('MAX_FILE_SIZE', 10 * 1024 * 1024), // 10MB
        },
      }),
      inject: [ConfigService],
    }),

    // Background jobs
    BullModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        redis: {
          host: configService.get('REDIS_HOST', 'localhost'),
          port: configService.get('REDIS_PORT', 6379),
          password: configService.get('REDIS_PASSWORD'),
        },
        defaultJobOptions: {
          removeOnComplete: 100,
          removeOnFail: 50,
        },
      }),
      inject: [ConfigService],
    }),

    // Scheduled tasks
    ScheduleModule.forRoot(),


  ],
            controllers: [
            KYCController,
            CasesController,
            WebhookController,
            AuditController,
            HealthController,
          ],
            providers: [
            KYCService,
            ScreeningService,
            RuleEngineService,
            CaseManagementService,
            WebhookService,
            AuditService,
            MinIOService,
            KYCProcessor,
            ScreeningProcessor,
          ],
            exports: [
            KYCService,
            ScreeningService,
            RuleEngineService,
            CaseManagementService,
            WebhookService,
            AuditService,
            MinIOService,
            KYCProcessor,
            ScreeningProcessor,
          ],
})
export class ComplianceModule {}
