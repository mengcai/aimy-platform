import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { ComplianceModule } from '../../compliance.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';

describe('Compliance Service (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          isGlobal: true,
          envFilePath: ['.env.test', '.env'],
        }),
        TypeOrmModule.forRootAsync({
          imports: [ConfigModule],
          useFactory: (configService: ConfigService) => ({
            type: 'postgres',
            host: configService.get('DB_HOST', 'localhost'),
            port: configService.get('DB_PORT', 5432),
            username: configService.get('DB_USERNAME', 'postgres'),
            password: configService.get('DB_PASSWORD', 'postgres'),
            database: configService.get('DB_NAME', 'aimy_compliance_test'),
            entities: [],
            synchronize: true,
            logging: false,
          }),
          inject: [ConfigService],
        }),
        ComplianceModule,
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('Health Check', () => {
    it('/health (GET)', () => {
      return request(app.getHttpServer())
        .get('/health')
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('status');
          expect(res.body).toHaveProperty('timestamp');
          expect(res.body).toHaveProperty('version');
          expect(res.body).toHaveProperty('services');
          expect(res.body).toHaveProperty('database');
          expect(res.body).toHaveProperty('redis');
        });
    });

    it('/health/ready (GET)', () => {
      return request(app.getHttpServer())
        .get('/health/ready')
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('status');
        });
    });

    it('/health/live (GET)', () => {
      return request(app.getHttpServer())
        .get('/health/live')
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('status');
          expect(res.body.status).toBe('alive');
        });
    });
  });

  describe('KYC Endpoints', () => {
    const testApplicant = {
      email: 'test.e2e@example.com',
      firstName: 'John',
      lastName: 'Doe',
      dateOfBirth: '1990-01-01',
      nationality: 'US',
      countryOfResidence: 'US',
      investorType: 'INDIVIDUAL',
      accreditationStatus: 'ACCREDITED',
    };

    let applicantId: string;

    it('should create a KYC applicant', () => {
      return request(app.getHttpServer())
        .post('/api/v1/kyc/applicants')
        .send(testApplicant)
        .expect(201)
        .expect((res) => {
          expect(res.body).toHaveProperty('id');
          expect(res.body.email).toBe(testApplicant.email);
          expect(res.body.kycStatus).toBe('PENDING');
          applicantId = res.body.id;
        });
    });

    it('should get the created applicant', () => {
      return request(app.getHttpServer())
        .get(`/api/v1/kyc/applicants/${applicantId}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.id).toBe(applicantId);
          expect(res.body.email).toBe(testApplicant.email);
        });
    });

    it('should list applicants', () => {
      return request(app.getHttpServer())
        .get('/api/v1/kyc/applicants')
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body.applicants)).toBe(true);
          expect(res.body.total).toBeGreaterThan(0);
        });
    });

    it('should initiate KYC verification', () => {
      return request(app.getHttpServer())
        .post(`/api/v1/kyc/applicants/${applicantId}/verify`)
        .send({
          verificationMethod: 'AUTOMATED',
        })
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('workflowId');
          expect(res.body.status).toBe('INITIATED');
        });
    });
  });

  describe('Screening Endpoints', () => {
    it('should get screening statistics', () => {
      return request(app.getHttpServer())
        .get('/api/v1/kyc/screening/stats')
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('total');
          expect(res.body).toHaveProperty('pending');
          expect(res.body).toHaveProperty('completed');
        });
    });
  });

  describe('Compliance Cases', () => {
    const testCase = {
      applicantId: 'test-applicant-id',
      type: 'KYC_REVIEW',
      priority: 'MEDIUM',
      title: 'E2E Test Case',
      description: 'Test case created during E2E testing',
    };

    let caseId: string;

    it('should create a compliance case', () => {
      return request(app.getHttpServer())
        .post('/api/v1/cases')
        .send(testCase)
        .expect(201)
        .expect((res) => {
          expect(res.body).toHaveProperty('id');
          expect(res.body.title).toBe(testCase.title);
          expect(res.body.status).toBe('OPEN');
          caseId = res.body.id;
        });
    });

    it('should get the created case', () => {
      return request(app.getHttpServer())
        .get(`/api/v1/cases/${caseId}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.id).toBe(caseId);
          expect(res.body.title).toBe(testCase.title);
        });
    });

    it('should search cases', () => {
      return request(app.getHttpServer())
        .get('/api/v1/cases')
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body.cases)).toBe(true);
          expect(res.body.total).toBeGreaterThan(0);
        });
    });
  });

  describe('Webhook Endpoints', () => {
    const testTransferRequest = {
      fromAddress: '0x1234567890123456789012345678901234567890',
      toAddress: '0x0987654321098765432109876543210987654321',
      amount: 1000,
      assetId: 'SOLAR-FARM-001',
    };

    it('should check transfer compliance', () => {
      return request(app.getHttpServer())
        .post('/api/v1/webhooks/transfer-check')
        .send(testTransferRequest)
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('allowed');
          expect(res.body).toHaveProperty('riskScore');
          expect(res.body).toHaveProperty('complianceScore');
        });
    });

    it('should handle batch transfer checks', () => {
      const batchRequest = {
        transfers: [testTransferRequest],
      };

      return request(app.getHttpServer())
        .post('/api/v1/webhooks/transfer-check/batch')
        .send(batchRequest)
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body.results)).toBe(true);
          expect(res.body.results.length).toBe(1);
        });
    });
  });

  describe('Audit Endpoints', () => {
    it('should get audit metrics', () => {
      return request(app.getHttpServer())
        .get('/api/v1/audit/metrics')
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('totalLogs');
          expect(res.body).toHaveProperty('recentActivity');
          expect(res.body).toHaveProperty('highRiskActions');
        });
    });

    it('should search audit logs', () => {
      return request(app.getHttpServer())
        .get('/api/v1/audit/logs')
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body.logs)).toBe(true);
          expect(res.body).toHaveProperty('total');
        });
    });

    it('should generate compliance report', () => {
      const reportRequest = {
        startDate: '2024-01-01',
        endDate: '2024-12-31',
      };

      return request(app.getHttpServer())
        .post('/api/v1/audit/reports/generate')
        .send(reportRequest)
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('reportId');
          expect(res.body).toHaveProperty('status');
        });
    });
  });

  describe('Error Handling', () => {
    it('should handle invalid applicant data', () => {
      const invalidApplicant = {
        email: 'invalid-email',
        firstName: '',
        lastName: '',
      };

      return request(app.getHttpServer())
        .post('/api/v1/kyc/applicants')
        .send(invalidApplicant)
        .expect(400);
    });

    it('should handle non-existent applicant', () => {
      return request(app.getHttpServer())
        .get('/api/v1/kyc/applicants/non-existent-id')
        .expect(404);
    });

    it('should handle non-existent case', () => {
      return request(app.getHttpServer())
        .get('/api/v1/cases/non-existent-id')
        .expect(404);
    });
  });

  describe('Performance Tests', () => {
    it('should handle concurrent KYC applicant creation', async () => {
      const concurrentRequests = Array.from({ length: 10 }, (_, i) => ({
        email: `concurrent.${i}@example.com`,
        firstName: `User${i}`,
        lastName: 'Concurrent',
        dateOfBirth: '1990-01-01',
        nationality: 'US',
        countryOfResidence: 'US',
        investorType: 'INDIVIDUAL',
        accreditationStatus: 'ACCREDITED',
      }));

      const startTime = Date.now();
      
      const promises = concurrentRequests.map(requestData =>
        request(app.getHttpServer())
          .post('/api/v1/kyc/applicants')
          .send(requestData)
          .expect(201)
      );

      await Promise.all(promises);
      
      const endTime = Date.now();
      const duration = endTime - startTime;
      
      // Should complete within 5 seconds
      expect(duration).toBeLessThan(5000);
    });

    it('should handle large batch screening requests', () => {
      const largeBatch = {
        applicantIds: Array.from({ length: 100 }, (_, i) => `applicant-${i}`),
        screeningType: 'SANCTIONS',
        priority: 'LOW',
      };

      return request(app.getHttpServer())
        .post('/api/v1/screening/batch')
        .send(largeBatch)
        .expect(200)
        .expect((res) => {
          expect(res.body.totalProcessed).toBe(100);
          expect(res.body.successful).toBeGreaterThan(0);
        });
    });
  });
});
