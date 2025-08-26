import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { KYCService } from '../services/kyc.service';
import { ScreeningService } from '../services/screening.service';
import { RuleEngineService } from '../services/rule-engine.service';
import { CaseManagementService } from '../services/case-management.service';
import { WebhookService } from '../services/webhook.service';
import { AuditService } from '../services/audit.service';
import { MinIOService } from '../services/minio.service';

export interface HealthCheckResponse {
  status: 'healthy' | 'unhealthy';
  timestamp: string;
  version: string;
  services: {
    kyc: 'healthy' | 'unhealthy';
    screening: 'healthy' | 'unhealthy';
    ruleEngine: 'healthy' | 'unhealthy';
    caseManagement: 'healthy' | 'unhealthy';
    webhook: 'healthy' | 'unhealthy';
    audit: 'healthy' | 'unhealthy';
    minio: 'healthy' | 'unhealthy';
  };
  database: 'healthy' | 'unhealthy';
  redis: 'healthy' | 'unhealthy';
  uptime: number;
  memory: {
    used: number;
    total: number;
    percentage: number;
  };
}

@ApiTags('Health')
@Controller('health')
export class HealthController {
  constructor(
    private readonly kycService: KYCService,
    private readonly screeningService: ScreeningService,
    private readonly ruleEngineService: RuleEngineService,
    private readonly caseManagementService: CaseManagementService,
    private readonly webhookService: WebhookService,
    private readonly auditService: AuditService,
    private readonly minioService: MinIOService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Get service health status' })
  @ApiResponse({ 
    status: 200, 
    description: 'Service health information',
    type: 'object',
    schema: {
      type: 'object',
      properties: {
        status: { type: 'string', enum: ['healthy', 'unhealthy'] },
        timestamp: { type: 'string' },
        version: { type: 'string' },
        services: { type: 'object' },
        database: { type: 'string' },
        redis: { type: 'string' },
        uptime: { type: 'number' },
        memory: { type: 'object' },
      },
    },
  })
  async getHealth(): Promise<HealthCheckResponse> {
    const startTime = Date.now();
    
    // Check service health
    const services = await this.checkServicesHealth();
    
    // Check infrastructure health
    const database = await this.checkDatabaseHealth();
    const redis = await this.checkRedisHealth();
    
    // Calculate uptime and memory usage
    const uptime = process.uptime();
    const memory = this.getMemoryUsage();
    
    // Determine overall status
    const overallStatus = this.determineOverallStatus(services, database, redis);
    
    return {
      status: overallStatus,
      timestamp: new Date().toISOString(),
      version: process.env.npm_package_version || '1.0.0',
      services,
      database,
      redis,
      uptime,
      memory,
    };
  }

  @Get('ready')
  @ApiOperation({ summary: 'Check if service is ready to receive traffic' })
  @ApiResponse({ status: 200, description: 'Service is ready' })
  @ApiResponse({ status: 503, description: 'Service is not ready' })
  async getReadiness(): Promise<{ status: 'ready' | 'not_ready' }> {
    try {
      // Check critical services
      const services = await this.checkServicesHealth();
      const database = await this.checkDatabaseHealth();
      const redis = await this.checkRedisHealth();
      
      const isReady = Object.values(services).every(status => status === 'healthy') &&
                     database === 'healthy' &&
                     redis === 'healthy';
      
      return { status: isReady ? 'ready' : 'not_ready' };
    } catch (error) {
      return { status: 'not_ready' };
    }
  }

  @Get('live')
  @ApiOperation({ summary: 'Check if service is alive (basic liveness check)' })
  @ApiResponse({ status: 200, description: 'Service is alive' })
  async getLiveness(): Promise<{ status: 'alive' }> {
    return { status: 'alive' };
  }

  private async checkServicesHealth(): Promise<HealthCheckResponse['services']> {
    const services = {
      kyc: 'unhealthy' as const,
      screening: 'unhealthy' as const,
      ruleEngine: 'unhealthy' as const,
      caseManagement: 'unhealthy' as const,
      webhook: 'unhealthy' as const,
      audit: 'unhealthy' as const,
      minio: 'unhealthy' as const,
    };

    try {
      // Check KYC service
      try {
        await this.kycService.getKYCStats();
        services.kyc = 'healthy';
      } catch (error) {
        services.kyc = 'unhealthy';
      }

      // Check screening service
      try {
        await this.screeningService.getScreeningStats();
        services.screening = 'healthy';
      } catch (error) {
        services.screening = 'unhealthy';
      }

      // Check rule engine service
      try {
        await this.ruleEngineService.getRuleStats();
        services.ruleEngine = 'healthy';
      } catch (error) {
        services.ruleEngine = 'unhealthy';
      }

      // Check case management service
      try {
        await this.caseManagementService.getCaseMetrics();
        services.caseManagement = 'healthy';
      } catch (error) {
        services.caseManagement = 'unhealthy';
      }

      // Check webhook service (basic check)
      try {
        // Try to create a simple test request
        const testRequest = {
          fromAddress: '0x0000000000000000000000000000000000000000',
          toAddress: '0x0000000000000000000000000000000000000000',
          amount: 0,
          assetId: 'test',
        };
        await this.webhookService.checkTransferCompliance(testRequest);
        services.webhook = 'healthy';
      } catch (error) {
        services.webhook = 'unhealthy';
      }

      // Check audit service
      try {
        await this.auditService.getAuditMetrics();
        services.audit = 'healthy';
      } catch (error) {
        services.audit = 'unhealthy';
      }

      // Check MinIO service
      try {
        await this.minioService.getBucketStats();
        services.minio = 'healthy';
      } catch (error) {
        services.minio = 'unhealthy';
      }

    } catch (error) {
      // If any service check fails, mark all as unhealthy
      Object.keys(services).forEach(key => {
        services[key as keyof typeof services] = 'unhealthy';
      });
    }

    return services;
  }

  private async checkDatabaseHealth(): Promise<'healthy' | 'unhealthy'> {
    try {
      // Try to perform a simple database operation
      await this.kycService.getKYCStats();
      return 'healthy';
    } catch (error) {
      return 'unhealthy';
    }
  }

  private async checkRedisHealth(): Promise<'healthy' | 'unhealthy'> {
    try {
      // For now, we'll assume Redis is healthy if we can reach this point
      // In a real implementation, you'd check Redis connectivity
      return 'healthy';
    } catch (error) {
      return 'unhealthy';
    }
  }

  private determineOverallStatus(
    services: HealthCheckResponse['services'],
    database: 'healthy' | 'unhealthy',
    redis: 'healthy' | 'unhealthy',
  ): 'healthy' | 'unhealthy' {
    const allServicesHealthy = Object.values(services).every(status => status === 'healthy');
    const infrastructureHealthy = database === 'healthy' && redis === 'healthy';
    
    return allServicesHealthy && infrastructureHealthy ? 'healthy' : 'unhealthy';
  }

  private getMemoryUsage(): { used: number; total: number; percentage: number } {
    const memUsage = process.memoryUsage();
    const used = Math.round(memUsage.heapUsed / 1024 / 1024); // MB
    const total = Math.round(memUsage.heapTotal / 1024 / 1024); // MB
    const percentage = Math.round((used / total) * 100);
    
    return { used, total, percentage };
  }
}
