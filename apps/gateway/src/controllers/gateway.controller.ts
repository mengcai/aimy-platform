import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { GatewayService } from '../services/gateway.service';

@Controller()
export class GatewayController {
  constructor(private readonly gatewayService: GatewayService) {}

  @Get()
  getHello(): string {
    return this.gatewayService.getHello();
  }

  @Get('health')
  getHealth() {
    return this.gatewayService.getHealth();
  }

  @Get('api')
  getApiInfo() {
    return this.gatewayService.getApiInfo();
  }

  @Post('api/v1/route')
  routeRequest(@Body() request: any) {
    return this.gatewayService.routeRequest(request);
  }
}
