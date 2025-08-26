import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ComplianceModule } from '../compliance.module';
import { KYCService } from '../services/kyc.service';
import { ScreeningService } from '../services/screening.service';
import { RuleEngineService } from '../services/rule-engine.service';
import { CaseManagementService } from '../services/case-management.service';
import { WebhookService } from '../services/webhook.service';
import { AuditService } from '../services/audit.service';
import { MinIOService } from '../services/minio.service';
import { KYCProcessor } from '../processors/kyc.processor';
import { ScreeningProcessor } from '../processors/screening.processor';
import { HealthController } from '../controllers/health.controller';
import { KYCApplicant } from '../entities/kyc-applicant.entity';
import { KYCDocument } from '../entities/kyc-document.entity';
import { ScreeningResult } from '../entities/screening-result.entity';
import { ComplianceRule } from '../entities/compliance-rule.entity';
import { ComplianceCase } from '../entities/compliance-case.entity';
import { AuditLog } from '../entities/audit-log.entity';

describe('ComplianceService', () => {
  let module: TestingModule;
  let kycService: KYCService;
  let screeningService: ScreeningService;
  let ruleEngineService: RuleEngineService;
  let caseManagementService: CaseManagementService;
  let webhookService: WebhookService;
  let auditService: AuditService;
  let minioService: MinIOService;
  let kycProcessor: KYCProcessor;
  let screeningProcessor: ScreeningProcessor;
  let healthController: HealthController;

  // Mock repositories
  const mockKYCApplicantRepository = {
    find: jest.fn(),
    findOne: jest.fn(),
    save: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    createQueryBuilder: jest.fn(() => ({
      where: jest.fn().mockReturnThis(),
      andWhere: jest.fn().mockReturnThis(),
      orderBy: jest.fn().mockReturnThis(),
      skip: jest.fn().mockReturnThis(),
      take: jest.fn().mockReturnThis(),
      getManyAndCount: jest.fn(),
      getOne: jest.fn(),
    })),
  };

  const mockKYCDocumentRepository = {
    find: jest.fn(),
    findOne: jest.fn(),
    save: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  };

  const mockScreeningResultRepository = {
    find: jest.fn(),
    findOne: jest.fn(),
    save: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  };

  const mockComplianceRuleRepository = {
    find: jest.fn(),
    findOne: jest.fn(),
    save: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  };

  const mockComplianceCaseRepository = {
    find: jest.fn(),
    findOne: jest.fn(),
    save: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  };

  const mockAuditLogRepository = {
    find: jest.fn(),
    findOne: jest.fn(),
    save: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  };

  beforeAll(async () => {
    module = await Test.createTestingModule({
      imports: [ComplianceModule],
    })
      .overrideProvider(getRepositoryToken(KYCApplicant))
      .useValue(mockKYCApplicantRepository)
      .overrideProvider(getRepositoryToken(KYCDocument))
      .useValue(mockKYCDocumentRepository)
      .overrideProvider(getRepositoryToken(ScreeningResult))
      .useValue(mockScreeningResultRepository)
      .overrideProvider(getRepositoryToken(ComplianceRule))
      .useValue(mockComplianceRuleRepository)
      .overrideProvider(getRepositoryToken(ComplianceCase))
      .useValue(mockComplianceCaseRepository)
      .overrideProvider(getRepositoryToken(AuditLog))
      .useValue(mockAuditLogRepository)
      .compile();

          kycService = module.get<KYCService>(KYCService);
      screeningService = module.get<ScreeningService>(ScreeningService);
      ruleEngineService = module.get<RuleEngineService>(RuleEngineService);
      caseManagementService = module.get<CaseManagementService>(CaseManagementService);
      webhookService = module.get<WebhookService>(WebhookService);
      auditService = module.get<AuditService>(AuditService);
      minioService = module.get<MinIOService>(MinIOService);
      kycProcessor = module.get<KYCProcessor>(KYCProcessor);
      screeningProcessor = module.get<ScreeningProcessor>(ScreeningProcessor);
      healthController = module.get<HealthController>(HealthController);
  });

  afterAll(async () => {
    await module.close();
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Service Instantiation', () => {
    it('should be defined', () => {
      expect(kycService).toBeDefined();
      expect(screeningService).toBeDefined();
      expect(ruleEngineService).toBeDefined();
      expect(caseManagementService).toBeDefined();
      expect(webhookService).toBeDefined();
      expect(auditService).toBeDefined();
      expect(minioService).toBeDefined();
      expect(kycProcessor).toBeDefined();
      expect(screeningProcessor).toBeDefined();
    });
  });

  describe('KYCService', () => {
    const mockApplicant = {
      id: 'test-id',
      email: 'test@example.com',
      firstName: 'John',
      lastName: 'Doe',
      dateOfBirth: new Date('1990-01-01'),
      nationality: 'US',
      countryOfResidence: 'US',
      investorType: 'INDIVIDUAL',
      accreditationStatus: 'ACCREDITED',
      kycStatus: 'PENDING',
      riskLevel: 'LOW',
    };

    it('should create an applicant', async () => {
      mockKYCApplicantRepository.save.mockResolvedValue(mockApplicant);

      const result = await kycService.createApplicant({
        email: 'test@example.com',
        firstName: 'John',
        lastName: 'Doe',
        dateOfBirth: new Date('1990-01-01'),
        nationality: 'US',
        countryOfResidence: 'US',
        investorType: 'INDIVIDUAL',
        accreditationStatus: 'ACCREDITED',
      });

      expect(result).toEqual(mockApplicant);
      expect(mockKYCApplicantRepository.save).toHaveBeenCalled();
    });

    it('should get an applicant by ID', async () => {
      mockKYCApplicantRepository.findOne.mockResolvedValue(mockApplicant);

      const result = await kycService.getApplicant('test-id');

      expect(result).toEqual(mockApplicant);
      expect(mockKYCApplicantRepository.findOne).toHaveBeenCalledWith({
        where: { id: 'test-id' },
      });
    });

    it('should get applicants with filters', async () => {
      const mockApplicants = [mockApplicant];
      const mockQueryBuilder = {
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        getManyAndCount: jest.fn().mockResolvedValue([mockApplicants, 1]),
      };

      mockKYCApplicantRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);

      const result = await kycService.getApplicants(1, 20, { status: 'PENDING' });

      expect(result.applicants).toEqual(mockApplicants);
      expect(result.total).toBe(1);
      expect(mockKYCApplicantRepository.createQueryBuilder).toHaveBeenCalled();
    });
  });

  describe('ScreeningService', () => {
    const mockScreeningRequest = {
      applicantId: 'test-id',
      screeningType: 'SANCTIONS',
      applicantData: {
        firstName: 'John',
        lastName: 'Doe',
        dateOfBirth: new Date('1990-01-01'),
        nationality: 'US',
        countryOfResidence: 'US',
      },
    };

    it('should initiate screening', async () => {
      const mockScreeningResult = {
        id: 'screening-id',
        applicantId: 'test-id',
        screeningType: 'SANCTIONS',
        status: 'COMPLETED',
        result: 'PASS',
        riskLevel: 'LOW',
        confidenceScore: 95,
      };

      mockScreeningResultRepository.save.mockResolvedValue(mockScreeningResult);

      const result = await screeningService.initiateScreening(mockScreeningRequest);

      expect(result).toBeDefined();
      expect(result.applicantId).toBe('test-id');
      expect(result.screeningType).toBe('SANCTIONS');
    });

    it('should get screening results for an applicant', async () => {
      const mockResults = [
        {
          id: 'screening-1',
          applicantId: 'test-id',
          screeningType: 'SANCTIONS',
          result: 'PASS',
        },
      ];

      mockScreeningResultRepository.find.mockResolvedValue(mockResults);

      const result = await screeningService.getScreeningResults('test-id');

      expect(result).toEqual(mockResults);
      expect(mockScreeningResultRepository.find).toHaveBeenCalledWith({
        where: { applicantId: 'test-id' },
        order: { createdAt: 'DESC' },
      });
    });

    it('should get screening statistics', async () => {
      const mockStats = {
        total: 100,
        pending: 10,
        completed: 80,
        failed: 10,
        hits: 5,
        clear: 75,
        averageRiskScore: 25,
      };

      mockScreeningResultRepository.find.mockResolvedValue([]);
      mockScreeningResultRepository.createQueryBuilder.mockReturnValue({
        select: jest.fn().mockReturnThis(),
        getRawOne: jest.fn().mockResolvedValue(mockStats),
      });

      const result = await screeningService.getScreeningStats();

      expect(result).toBeDefined();
      expect(typeof result.total).toBe('number');
    });
  });

  describe('RuleEngineService', () => {
    const mockRule = {
      id: 'rule-id',
      name: 'US Accredited Investor Rule',
      type: 'INVESTOR_TYPE',
      status: 'ACTIVE',
      priority: 'HIGH',
      conditions: [
        {
          field: 'investorType',
          operator: 'EQUALS',
          value: 'INDIVIDUAL',
          valueType: 'STRING',
        },
        {
          field: 'accreditationStatus',
          operator: 'EQUALS',
          value: 'ACCREDITED',
          valueType: 'STRING',
        },
      ],
      action: 'ALLOW',
    };

    it('should create a compliance rule', async () => {
      mockComplianceRuleRepository.save.mockResolvedValue(mockRule);

      const result = await ruleEngineService.createRule({
        name: 'US Accredited Investor Rule',
        type: 'INVESTOR_TYPE',
        status: 'ACTIVE',
        priority: 'HIGH',
        conditions: mockRule.conditions,
        action: 'ALLOW',
      });

      expect(result).toEqual(mockRule);
      expect(mockComplianceRuleRepository.save).toHaveBeenCalled();
    });

    it('should get all rules', async () => {
      const mockRules = [mockRule];
      mockComplianceRuleRepository.find.mockResolvedValue(mockRules);

      const result = await ruleEngineService.getRules();

      expect(result).toEqual(mockRules);
      expect(mockComplianceRuleRepository.find).toHaveBeenCalledWith({
        order: { priority: 'DESC', createdAt: 'DESC' },
      });
    });

    it('should evaluate compliance', async () => {
      const mockApplicant = {
        id: 'test-id',
        investorType: 'INDIVIDUAL',
        accreditationStatus: 'ACCREDITED',
        countryOfResidence: 'US',
      };

      mockComplianceRuleRepository.find.mockResolvedValue([mockRule]);

      const result = await ruleEngineService.evaluateCompliance({
        applicant: mockApplicant,
        transferAmount: 10000,
        assetId: 'SOLAR-FARM-001',
        jurisdiction: 'US',
        investorType: 'INDIVIDUAL',
        accreditationStatus: 'ACCREDITED',
      });

      expect(result).toBeDefined();
      expect(result.overallResult).toBeDefined();
    });
  });

  describe('CaseManagementService', () => {
    const mockCase = {
      id: 'case-id',
      caseNumber: 'CASE-001',
      applicantId: 'test-id',
      type: 'KYC_REVIEW',
      status: 'OPEN',
      priority: 'MEDIUM',
      title: 'KYC Review Required',
      description: 'Manual review required for KYC verification',
    };

    it('should create a compliance case', async () => {
      mockComplianceCaseRepository.save.mockResolvedValue(mockCase);

      const result = await caseManagementService.createCase({
        applicantId: 'test-id',
        type: 'KYC_REVIEW',
        priority: 'MEDIUM',
        title: 'KYC Review Required',
        description: 'Manual review required for KYC verification',
      });

      expect(result).toEqual(mockCase);
      expect(mockComplianceCaseRepository.save).toHaveBeenCalled();
    });

    it('should get a case by ID', async () => {
      mockComplianceCaseRepository.findOne.mockResolvedValue(mockCase);

      const result = await caseManagementService.getCase('case-id');

      expect(result).toEqual(mockCase);
      expect(mockComplianceCaseRepository.findOne).toHaveBeenCalledWith({
        where: { id: 'case-id' },
        relations: ['applicant'],
      });
    });

    it('should search cases with filters', async () => {
      const mockCases = [mockCase];
      const mockQueryBuilder = {
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        getManyAndCount: jest.fn().mockResolvedValue([mockCases, 1]),
      };

      mockComplianceCaseRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);

      const result = await caseManagementService.searchCases(1, 20, { status: 'OPEN' });

      expect(result.cases).toEqual(mockCases);
      expect(result.total).toBe(1);
    });
  });

  describe('WebhookService', () => {
    const mockTransferRequest = {
      fromAddress: '0x1234567890123456789012345678901234567890',
      toAddress: '0x0987654321098765432109876543210987654321',
      amount: 1000,
      assetId: 'SOLAR-FARM-001',
    };

    it('should check transfer compliance', async () => {
      const mockApplicant = {
        id: 'test-id',
        kycStatus: 'APPROVED',
        riskLevel: 'LOW',
      };

      jest.spyOn(webhookService as any, 'getApplicantByAddress').mockResolvedValue(mockApplicant);

      const result = await webhookService.checkTransferCompliance(mockTransferRequest);

      expect(result).toBeDefined();
      expect(result.allowed).toBeDefined();
      expect(result.riskScore).toBeDefined();
      expect(result.complianceScore).toBeDefined();
    });
  });

  describe('AuditService', () => {
    const mockAuditLog = {
      id: 'audit-id',
      action: 'KYC_APPLICANT_CREATED',
      level: 'INFO',
      source: 'KYC_SERVICE',
      entityType: 'KYCApplicant',
      entityId: 'test-id',
      description: 'KYC applicant created',
      userId: 'user-123',
      ipAddress: '127.0.0.1',
    };

    it('should create an audit log', async () => {
      mockAuditLogRepository.save.mockResolvedValue(mockAuditLog);

      const result = await auditService.createAuditLog({
        action: 'KYC_APPLICANT_CREATED',
        level: 'INFO',
        source: 'KYC_SERVICE',
        entityType: 'KYCApplicant',
        entityId: 'test-id',
        description: 'KYC applicant created',
        userId: 'user-123',
        ipAddress: '127.0.0.1',
      });

      expect(result).toEqual(mockAuditLog);
      expect(mockAuditLogRepository.save).toHaveBeenCalled();
    });

    it('should search audit logs', async () => {
      const mockLogs = [mockAuditLog];
      const mockQueryBuilder = {
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        getManyAndCount: jest.fn().mockResolvedValue([mockLogs, 1]),
      };

      mockAuditLogRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);

      const result = await auditService.searchAuditLogs(1, 100, { action: 'KYC_APPLICANT_CREATED' });

      expect(result.logs).toEqual(mockLogs);
      expect(result.total).toBe(1);
    });
  });

  describe('MinIOService', () => {
    it('should be defined', () => {
      expect(minioService).toBeDefined();
    });

    it('should have required methods', () => {
      expect(typeof minioService.uploadDocument).toBe('function');
      expect(typeof minioService.downloadDocument).toBe('function');
      expect(typeof minioService.generatePresignedUrl).toBe('function');
    });
  });

  describe('Processors', () => {
    it('should have KYC processor defined', () => {
      expect(kycProcessor).toBeDefined();
    });

    it('should have Screening processor defined', () => {
      expect(screeningProcessor).toBeDefined();
    });
  });

  describe('HealthController', () => {
    it('should be defined', () => {
      expect(healthController).toBeDefined();
    });

    it('should have health check methods', () => {
      expect(typeof healthController.getHealth).toBe('function');
      expect(typeof healthController.getReadiness).toBe('function');
      expect(typeof healthController.getLiveness).toBe('function');
    });
  });

  describe('Integration Tests', () => {
    it('should handle complete KYC workflow', async () => {
      // This test would verify the complete KYC workflow
      // from applicant creation to final approval/rejection
      expect(true).toBe(true); // Placeholder for actual integration test
    });

    it('should handle compliance rule evaluation', async () => {
      // This test would verify that compliance rules
      // are properly evaluated against applicant data
      expect(true).toBe(true); // Placeholder for actual integration test
    });

    it('should handle screening workflow', async () => {
      // This test would verify the complete screening workflow
      // including sanctions, PEP, and AML checks
      expect(true).toBe(true); // Placeholder for actual integration test
    });
  });
});
