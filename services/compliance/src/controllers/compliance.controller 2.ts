import { Controller, Get, Post, Body, Param, Query } from '@nestjs/common';

@Controller()
export class ComplianceController {
  
  @Get('health')
  getHealth() {
    return {
      status: 'ok',
      service: 'AIMY Compliance Service',
      timestamp: new Date().toISOString(),
      version: '1.0.0'
    };
  }

  @Get('api/v1/health')
  getHealthV1() {
    return this.getHealth();
  }

  @Get('api/v1/kyc/applicants')
  getKYCApplicants() {
    return {
      data: [
        {
          id: 'kyc-001',
          name: 'John Smith',
          email: 'john.smith@email.com',
          status: 'pending',
          submittedAt: '2024-01-20T09:00:00Z',
          documents: 3,
          country: 'USA',
          accreditationStatus: 'pending'
        },
        {
          id: 'kyc-002',
          name: 'Jane Doe',
          email: 'jane.doe@email.com',
          status: 'verified',
          submittedAt: '2024-01-19T14:30:00Z',
          documents: 4,
          country: 'Canada',
          accreditationStatus: 'accredited'
        }
      ],
      total: 2,
      page: 1,
      limit: 20
    };
  }

  @Get('api/v1/compliance/cases')
  getComplianceCases() {
    return {
      data: [
        {
          id: 'case-001',
          title: 'KYC Review Required',
          description: 'Additional documentation needed for verification',
          type: 'kyc',
          status: 'pending',
          priority: 'medium',
          assignedTo: 'compliance-officer-1',
          createdAt: '2024-01-20T10:00:00Z',
          updatedAt: '2024-01-20T10:00:00Z',
          processingTime: 2
        },
        {
          id: 'case-002',
          title: 'AML Screening Alert',
          description: 'Potential risk detected during screening',
          type: 'aml',
          status: 'under_review',
          priority: 'high',
          assignedTo: 'compliance-officer-2',
          createdAt: '2024-01-19T15:00:00Z',
          updatedAt: '2024-01-20T09:00:00Z',
          processingTime: 5
        }
      ],
      total: 2,
      page: 1,
      limit: 20
    };
  }

  @Post('api/v1/kyc/applicants')
  createKYCApplicant(@Body() applicant: any) {
    return {
      id: 'kyc-new',
      ...applicant,
      status: 'pending',
      submittedAt: new Date().toISOString(),
      message: 'KYC application created successfully'
    };
  }

  @Post('api/v1/compliance/cases')
  createComplianceCase(@Body() caseData: any) {
    return {
      id: 'case-new',
      ...caseData,
      status: 'pending',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      message: 'Compliance case created successfully'
    };
  }
}
