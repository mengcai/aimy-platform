import {
  Controller,
  Post,
  Body,
  Param,
  Query,
  BadRequestException,
  ValidationPipe,
  UsePipes,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';
import {
  WebhookService,
  TransferCheckRequest,
  TransferCheckResponse,
  WebhookEvent,
} from '../services/webhook.service';

@ApiTags('Compliance Webhooks')
@Controller('webhooks')
@UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
export class WebhookController {
  constructor(private readonly webhookService: WebhookService) {}

  @Post('transfer-check')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Check if a token transfer is compliant' })
  @ApiResponse({ status: 200, description: 'Transfer compliance check completed' })
  @ApiResponse({ status: 400, description: 'Bad request - invalid transfer data' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        fromAddress: { type: 'string', description: 'Sender wallet address' },
        toAddress: { type: 'string', description: 'Recipient wallet address' },
        amount: { type: 'number', description: 'Transfer amount' },
        assetId: { type: 'string', description: 'Asset identifier' },
        timestamp: { type: 'string', format: 'date-time', description: 'Transfer timestamp' },
        transactionHash: { type: 'string', description: 'Transaction hash' },
        metadata: { type: 'object', description: 'Additional transfer metadata' },
      },
      required: ['fromAddress', 'toAddress', 'amount', 'assetId'],
    },
  })
  async checkTransferCompliance(@Body() request: TransferCheckRequest): Promise<TransferCheckResponse> {
    try {
      // Validate required fields
      if (!request.fromAddress || !request.toAddress || !request.amount || !request.assetId) {
        throw new BadRequestException('Missing required fields: fromAddress, toAddress, amount, assetId');
      }

      // Validate amount
      if (request.amount <= 0) {
        throw new BadRequestException('Transfer amount must be greater than 0');
      }

      // Validate addresses (basic format check)
      if (!this.isValidAddress(request.fromAddress) || !this.isValidAddress(request.toAddress)) {
        throw new BadRequestException('Invalid wallet address format');
      }

      // Check if addresses are the same
      if (request.fromAddress.toLowerCase() === request.toAddress.toLowerCase()) {
        throw new BadRequestException('Sender and recipient addresses cannot be the same');
      }

      // Perform compliance check
      return await this.webhookService.checkTransferCompliance(request);
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException(`Transfer compliance check failed: ${error.message}`);
    }
  }

  @Post('events')
  @HttpCode(HttpStatus.ACCEPTED)
  @ApiOperation({ summary: 'Process webhook events' })
  @ApiResponse({ status: 202, description: 'Event accepted for processing' })
  @ApiResponse({ status: 400, description: 'Bad request - invalid event data' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        eventType: { type: 'string', description: 'Type of webhook event' },
        timestamp: { type: 'string', format: 'date-time', description: 'Event timestamp' },
        data: { type: 'object', description: 'Event data payload' },
        signature: { type: 'string', description: 'Event signature for verification' },
        source: { type: 'string', description: 'Source system identifier' },
      },
      required: ['eventType', 'timestamp', 'data', 'source'],
    },
  })
  async processWebhookEvent(@Body() event: WebhookEvent) {
    try {
      // Validate required fields
      if (!event.eventType || !event.timestamp || !event.data || !event.source) {
        throw new BadRequestException('Missing required fields: eventType, timestamp, data, source');
      }

      // Validate timestamp
      const eventTimestamp = new Date(event.timestamp);
      if (isNaN(eventTimestamp.getTime())) {
        throw new BadRequestException('Invalid timestamp format');
      }

      // Check if event is too old (reject events older than 1 hour)
      const now = new Date();
      const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
      if (eventTimestamp < oneHourAgo) {
        throw new BadRequestException('Event timestamp is too old');
      }

      // Process the event asynchronously
      this.webhookService.processWebhookEvent(event).catch(error => {
        console.error('Failed to process webhook event:', error);
      });

      return {
        message: 'Event accepted for processing',
        eventId: `EVENT-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        timestamp: new Date().toISOString(),
        status: 'ACCEPTED',
      };
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException(`Webhook event processing failed: ${error.message}`);
    }
  }

  @Post('transfer-check/batch')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Check multiple token transfers for compliance' })
  @ApiResponse({ status: 200, description: 'Batch transfer compliance check completed' })
  @ApiResponse({ status: 400, description: 'Bad request - invalid batch data' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        transfers: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              transferId: { type: 'string', description: 'Unique transfer identifier' },
              fromAddress: { type: 'string', description: 'Sender wallet address' },
              toAddress: { type: 'string', description: 'Recipient wallet address' },
              amount: { type: 'number', description: 'Transfer amount' },
              assetId: { type: 'string', description: 'Asset identifier' },
              timestamp: { type: 'string', format: 'date-time', description: 'Transfer timestamp' },
              transactionHash: { type: 'string', description: 'Transaction hash' },
              metadata: { type: 'object', description: 'Additional transfer metadata' },
            },
            required: ['transferId', 'fromAddress', 'toAddress', 'amount', 'assetId'],
          },
        },
        options: {
          type: 'object',
          properties: {
            parallel: { type: 'boolean', description: 'Process transfers in parallel' },
            timeout: { type: 'number', description: 'Timeout in milliseconds' },
          },
        },
      },
      required: ['transfers'],
    },
  })
  async checkBatchTransferCompliance(
    @Body() request: { transfers: TransferCheckRequest[]; options?: { parallel?: boolean; timeout?: number } },
  ) {
    try {
      // Validate request
      if (!request.transfers || !Array.isArray(request.transfers) || request.transfers.length === 0) {
        throw new BadRequestException('Transfers array is required and must not be empty');
      }

      if (request.transfers.length > 100) {
        throw new BadRequestException('Maximum 100 transfers allowed per batch');
      }

      // Validate each transfer
      for (const transfer of request.transfers) {
        if (!transfer.transferId || !transfer.fromAddress || !transfer.toAddress || !transfer.amount || !transfer.assetId) {
          throw new BadRequestException(`Transfer ${transfer.transferId || 'unknown'} missing required fields`);
        }

        if (transfer.amount <= 0) {
          throw new BadRequestException(`Transfer ${transfer.transferId} amount must be greater than 0`);
        }

        if (!this.isValidAddress(transfer.fromAddress) || !this.isValidAddress(transfer.toAddress)) {
          throw new BadRequestException(`Transfer ${transfer.transferId} has invalid address format`);
        }

        if (transfer.fromAddress.toLowerCase() === transfer.toAddress.toLowerCase()) {
          throw new BadRequestException(`Transfer ${transfer.transferId} sender and recipient addresses cannot be the same`);
        }
      }

      // Process transfers
      const results: Array<{ transferId: string; result: TransferCheckResponse; error?: string }> = [];
      const options = request.options || { parallel: false, timeout: 30000 };

      if (options.parallel) {
        // Process in parallel with timeout
        const promises = request.transfers.map(async (transfer) => {
          try {
            const result = await Promise.race([
              this.webhookService.checkTransferCompliance(transfer),
              new Promise((_, reject) => 
                setTimeout(() => reject(new Error('Timeout')), options.timeout || 30000)
              ),
            ]);
            return { transferId: transfer.transferId, result };
          } catch (error) {
            return { 
              transferId: transfer.transferId, 
              result: null, 
              error: error.message 
            };
          }
        });

        const parallelResults = await Promise.all(promises);
        results.push(...parallelResults);
      } else {
        // Process sequentially
        for (const transfer of request.transfers) {
          try {
            const result = await this.webhookService.checkTransferCompliance(transfer);
            results.push({ transferId: transfer.transferId, result });
          } catch (error) {
            results.push({ 
              transferId: transfer.transferId, 
              result: null, 
              error: error.message 
            });
          }
        }
      }

      // Generate summary
      const summary = {
        total: request.transfers.length,
        successful: results.filter(r => r.result && !r.error).length,
        failed: results.filter(r => r.error).length,
        allowed: results.filter(r => r.result && r.result.allowed).length,
        blocked: results.filter(r => r.result && !r.result.allowed).length,
        requiresReview: results.filter(r => r.result && r.result.requiresManualReview).length,
      };

      return {
        batchId: `BATCH-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        timestamp: new Date().toISOString(),
        summary,
        results,
        options: {
          parallel: options.parallel,
          timeout: options.timeout,
        },
      };
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException(`Batch transfer compliance check failed: ${error.message}`);
    }
  }

  @Post('health-check')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Health check endpoint for webhook service' })
  @ApiResponse({ status: 200, description: 'Service is healthy' })
  async healthCheck() {
    return {
      status: 'HEALTHY',
      timestamp: new Date().toISOString(),
      service: 'Compliance Webhook Service',
      version: '1.0.0',
      uptime: process.uptime(),
      memory: process.memoryUsage(),
    };
  }

  @Post('validate-signature')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Validate webhook signature' })
  @ApiResponse({ status: 200, description: 'Signature validation completed' })
  @ApiResponse({ status: 400, description: 'Bad request - invalid signature data' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        event: { type: 'object', description: 'Webhook event data' },
        signature: { type: 'string', description: 'Event signature' },
        secret: { type: 'string', description: 'Secret key for validation' },
      },
      required: ['event', 'signature', 'secret'],
    },
  })
  async validateSignature(
    @Body() request: { event: WebhookEvent; signature: string; secret: string },
  ) {
    try {
      if (!request.event || !request.signature || !request.secret) {
        throw new BadRequestException('Missing required fields: event, signature, secret');
      }

      const isValid = this.webhookService.validateWebhookSignature(request.event, request.secret);

      return {
        valid: isValid,
        timestamp: new Date().toISOString(),
        eventType: request.event.eventType,
        signature: request.signature,
        validationResult: isValid ? 'VALID' : 'INVALID',
      };
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException(`Signature validation failed: ${error.message}`);
    }
  }

  @Post('test-transfer')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Test transfer compliance check with sample data' })
  @ApiResponse({ status: 200, description: 'Test transfer check completed' })
  async testTransferCheck() {
    // Create a test transfer request
    const testRequest: TransferCheckRequest = {
      fromAddress: '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6',
      toAddress: '0x1234567890123456789012345678901234567890',
      amount: 1000,
      assetId: 'SOLAR-FARM-001',
      timestamp: new Date(),
      transactionHash: '0x' + '0'.repeat(64),
      metadata: {
        test: true,
        description: 'Test transfer for compliance validation',
      },
    };

    try {
      const result = await this.webhookService.checkTransferCompliance(testRequest);
      
      return {
        message: 'Test transfer compliance check completed',
        testRequest,
        result,
        timestamp: new Date().toISOString(),
        testId: `TEST-${Date.now()}`,
      };
    } catch (error) {
      return {
        message: 'Test transfer compliance check failed',
        testRequest,
        error: error.message,
        timestamp: new Date().toISOString(),
        testId: `TEST-${Date.now()}`,
      };
    }
  }

  /**
   * Validate wallet address format (basic check)
   */
  private isValidAddress(address: string): boolean {
    // Basic Ethereum address format validation
    const ethereumAddressRegex = /^0x[a-fA-F0-9]{40}$/;
    return ethereumAddressRegex.test(address);
  }
}
