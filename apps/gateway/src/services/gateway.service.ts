import { Injectable } from '@nestjs/common';

@Injectable()
export class GatewayService {
  getHello(): string {
    return 'Welcome to AIMY Gateway Service!';
  }

  getHealth() {
    return {
      status: 'healthy',
      service: 'gateway',
      timestamp: new Date().toISOString(),
      uptime: process.uptime()
    };
  }

  getApiInfo() {
    return {
      service: 'AIMY Gateway Service',
      version: '1.0.0',
      description: 'API Gateway for AIMY Platform',
      endpoints: {
        'GET /': 'Service welcome message',
        'GET /health': 'Health check',
        'GET /api': 'API information',
        'POST /api/v1/route': 'Route requests to other services'
      },
      available_services: [
        'compliance:3002',
        'settlement:3003',
        'liquidity:3004',
        'ai-core:8000',
        'blockchain:8545'
      ]
    };
  }

  routeRequest(request: any) {
    // Mock routing logic
    return {
      success: true,
      message: 'Request routed successfully',
      timestamp: new Date().toISOString(),
      request: request
    };
  }
}
