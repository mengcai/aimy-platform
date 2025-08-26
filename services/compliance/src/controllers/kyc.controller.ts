import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UploadedFile,
  UseInterceptors,
  BadRequestException,
  NotFoundException,
  ValidationPipe,
  UsePipes,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiResponse, ApiConsumes, ApiBody } from '@nestjs/swagger';
import { KYCService, CreateApplicantRequest, UploadDocumentRequest, KYCVerificationRequest, KYCStatusUpdate } from '../services/kyc.service';

@ApiTags('KYC Management')
@Controller('kyc')
@UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
export class KYCController {
  constructor(private readonly kycService: KYCService) {}

  @Post('applicants')
  @ApiOperation({ summary: 'Create a new KYC applicant' })
  @ApiResponse({ status: 201, description: 'Applicant created successfully' })
  @ApiResponse({ status: 400, description: 'Bad request - validation failed' })
  @ApiResponse({ status: 409, description: 'Conflict - applicant already exists' })
  async createApplicant(@Body() request: CreateApplicantRequest) {
    try {
      return await this.kycService.createApplicant(request);
    } catch (error) {
      if (error.message.includes('already exists')) {
        throw new BadRequestException(error.message);
      }
      throw error;
    }
  }

  @Get('applicants')
  @ApiOperation({ summary: 'Get all KYC applicants with pagination and filters' })
  @ApiResponse({ status: 200, description: 'Applicants retrieved successfully' })
  async getApplicants(
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '20',
    @Query('status') status?: string,
    @Query('riskLevel') riskLevel?: string,
    @Query('investorType') investorType?: string,
    @Query('search') search?: string,
  ) {
    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);

    if (isNaN(pageNum) || isNaN(limitNum) || pageNum < 1 || limitNum < 1) {
      throw new BadRequestException('Invalid pagination parameters');
    }

    return await this.kycService.getApplicants(pageNum, limitNum, {
      status: status as any,
      riskLevel: riskLevel as any,
      investorType: investorType as any,
      search,
    });
  }

  @Get('applicants/:id')
  @ApiOperation({ summary: 'Get KYC applicant by ID' })
  @ApiResponse({ status: 200, description: 'Applicant retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Applicant not found' })
  async getApplicant(@Param('id') id: string) {
    try {
      return await this.kycService.getApplicant(id);
    } catch (error) {
      if (error.message.includes('not found')) {
        throw new NotFoundException(error.message);
      }
      throw error;
    }
  }

  @Post('applicants/:id/documents')
  @ApiOperation({ summary: 'Upload document for an applicant' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        documentType: { type: 'string', enum: ['PASSPORT', 'NATIONAL_ID', 'DRIVERS_LICENSE', 'UTILITY_BILL', 'BANK_STATEMENT', 'EMPLOYMENT_LETTER', 'OTHER'] },
        file: { type: 'string', format: 'binary' },
        documentNumber: { type: 'string' },
        issueDate: { type: 'string', format: 'date' },
        expiryDate: { type: 'string', format: 'date' },
        issuingCountry: { type: 'string' },
        issuingAuthority: { type: 'string' },
        additionalInfo: { type: 'string' },
      },
      required: ['documentType', 'file'],
    },
  })
  @ApiResponse({ status: 201, description: 'Document uploaded successfully' })
  @ApiResponse({ status: 400, description: 'Bad request - invalid file or data' })
  @ApiResponse({ status: 404, description: 'Applicant not found' })
  @UseInterceptors(FileInterceptor('file'))
  async uploadDocument(
    @Param('id') applicantId: string,
    @Body() metadata: any,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }

    const request: UploadDocumentRequest = {
      applicantId,
      documentType: metadata.documentType,
      file,
      metadata: {
        documentNumber: metadata.documentNumber,
        issueDate: metadata.issueDate ? new Date(metadata.issueDate) : undefined,
        expiryDate: metadata.expiryDate ? new Date(metadata.expiryDate) : undefined,
        issuingCountry: metadata.issuingCountry,
        issuingAuthority: metadata.issuingAuthority,
        additionalInfo: metadata.additionalInfo ? JSON.parse(metadata.additionalInfo) : undefined,
      },
    };

    return await this.kycService.uploadDocument(request);
  }

  @Post('applicants/:id/verify')
  @ApiOperation({ summary: 'Initiate KYC verification process' })
  @ApiResponse({ status: 200, description: 'Verification initiated successfully' })
  @ApiResponse({ status: 404, description: 'Applicant not found' })
  async initiateVerification(
    @Param('id') applicantId: string,
    @Body() request: KYCVerificationRequest,
  ) {
    return await this.kycService.initiateVerification({
      ...request,
      applicantId,
    });
  }

  @Put('applicants/:id/status')
  @ApiOperation({ summary: 'Update KYC applicant status' })
  @ApiResponse({ status: 200, description: 'Status updated successfully' })
  @ApiResponse({ status: 404, description: 'Applicant not found' })
  async updateStatus(
    @Param('id') applicantId: string,
    @Body() update: KYCStatusUpdate,
  ) {
    return await this.kycService.updateKYCStatus(applicantId, update);
  }

  @Get('applicants/:id/documents')
  @ApiOperation({ summary: 'Get documents for an applicant' })
  @ApiResponse({ status: 200, description: 'Documents retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Applicant not found' })
  async getApplicantDocuments(@Param('id') applicantId: string) {
    const applicant = await this.kycService.getApplicant(applicantId);
    return applicant.documents || [];
  }

  @Get('applicants/:id/screening-results')
  @ApiOperation({ summary: 'Get screening results for an applicant' })
  @ApiResponse({ status: 200, description: 'Screening results retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Applicant not found' })
  async getApplicantScreeningResults(@Param('id') applicantId: string) {
    const applicant = await this.kycService.getApplicant(applicantId);
    return applicant.screeningResults || [];
  }

  @Get('applicants/:id/compliance-case')
  @ApiOperation({ summary: 'Get compliance case for an applicant' })
  @ApiResponse({ status: 200, description: 'Compliance case retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Applicant or case not found' })
  async getApplicantComplianceCase(@Param('id') applicantId: string) {
    const applicant = await this.kycService.getApplicant(applicantId);
    return applicant.complianceCase || null;
  }

  @Get('stats')
  @ApiOperation({ summary: 'Get KYC statistics' })
  @ApiResponse({ status: 200, description: 'Statistics retrieved successfully' })
  async getKYCStats() {
    return await this.kycService.getKYCStats();
  }

  @Get('applicants/:id/workflow-status')
  @ApiOperation({ summary: 'Get current workflow status for an applicant' })
  @ApiResponse({ status: 200, description: 'Workflow status retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Applicant not found' })
  async getWorkflowStatus(@Param('id') applicantId: string) {
    const applicant = await this.kycService.getApplicant(applicantId);
    
    return {
      applicantId: applicant.id,
      status: applicant.status,
      riskLevel: applicant.riskLevel,
      complianceScore: applicant.complianceScore,
      kycLevel: applicant.kycLevel,
      verificationMethod: applicant.verificationMethod,
      verifierId: applicant.verifierId,
      verificationStartedAt: applicant.verificationStartedAt,
      approvedAt: applicant.approvedAt,
      approvedBy: applicant.approvedBy,
      rejectedAt: applicant.rejectedAt,
      rejectedBy: applicant.rejectedBy,
      rejectionReason: applicant.rejectionReason,
      complianceNotes: applicant.complianceNotes,
      lastUpdated: applicant.updatedAt,
    };
  }

  @Post('applicants/:id/retry-verification')
  @ApiOperation({ summary: 'Retry KYC verification for an applicant' })
  @ApiResponse({ status: 200, description: 'Verification retry initiated successfully' })
  @ApiResponse({ status: 404, description: 'Applicant not found' })
  async retryVerification(
    @Param('id') applicantId: string,
    @Body() request: KYCVerificationRequest,
  ) {
    // This would typically reset the verification state and restart the process
    // For now, we'll just initiate a new verification
    return await this.kycService.initiateVerification({
      ...request,
      applicantId,
    });
  }

  @Delete('applicants/:id')
  @ApiOperation({ summary: 'Delete KYC applicant (soft delete)' })
  @ApiResponse({ status: 200, description: 'Applicant deleted successfully' })
  @ApiResponse({ status: 404, description: 'Applicant not found' })
  async deleteApplicant(@Param('id') applicantId: string) {
    // This would typically implement soft delete
    // For now, we'll return a success message
    return {
      message: 'Applicant deletion not implemented in this version',
      applicantId,
    };
  }

  @Get('applicants/:id/audit-trail')
  @ApiOperation({ summary: 'Get audit trail for an applicant' })
  @ApiResponse({ status: 200, description: 'Audit trail retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Applicant not found' })
  async getApplicantAuditTrail(@Param('id') applicantId: string) {
    // This would typically get audit logs from the audit service
    // For now, we'll return a placeholder
    return {
      message: 'Audit trail not implemented in this version',
      applicantId,
    };
  }

  @Post('applicants/bulk-upload')
  @ApiOperation({ summary: 'Bulk upload KYC applicants from CSV/JSON' })
  @ApiResponse({ status: 201, description: 'Bulk upload initiated successfully' })
  @ApiResponse({ status: 400, description: 'Bad request - invalid file format' })
  @UseInterceptors(FileInterceptor('file'))
  async bulkUploadApplicants(
    @UploadedFile() file: Express.Multer.File,
    @Body() options: { format: 'CSV' | 'JSON'; validateOnly?: boolean },
  ) {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }

    // This would typically parse the file and create multiple applicants
    // For now, we'll return a placeholder
    return {
      message: 'Bulk upload not implemented in this version',
      fileName: file.originalname,
      fileSize: file.size,
      format: options.format,
      validateOnly: options.validateOnly || false,
    };
  }

  @Get('applicants/:id/export')
  @ApiOperation({ summary: 'Export applicant data' })
  @ApiResponse({ status: 200, description: 'Applicant data exported successfully' })
  @ApiResponse({ status: 404, description: 'Applicant not found' })
  async exportApplicantData(
    @Param('id') applicantId: string,
    @Query('format') format: 'JSON' | 'CSV' | 'PDF' = 'JSON',
    @Query('includeDocuments') includeDocuments: string = 'false',
    @Query('includeScreeningResults') includeScreeningResults: string = 'false',
  ) {
    const applicant = await this.kycService.getApplicant(applicantId);
    
    // This would typically format the data according to the requested format
    // For now, we'll return the applicant data as JSON
    return {
      exportFormat: format,
      applicant: {
        id: applicant.id,
        email: applicant.email,
        firstName: applicant.firstName,
        lastName: applicant.lastName,
        status: applicant.status,
        riskLevel: applicant.riskLevel,
        complianceScore: applicant.complianceScore,
        kycLevel: applicant.kycLevel,
        investorType: applicant.investorType,
        accreditationStatus: applicant.accreditationStatus,
        nationality: applicant.nationality,
        countryOfResidence: applicant.countryOfResidence,
        createdAt: applicant.createdAt,
        updatedAt: applicant.updatedAt,
      },
      includeDocuments: includeDocuments === 'true',
      includeScreeningResults: includeScreeningResults === 'true',
      exportTimestamp: new Date().toISOString(),
    };
  }
}
