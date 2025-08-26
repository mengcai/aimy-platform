import { Controller, Get, Post, Put, Body, Param, Query, HttpStatus, HttpCode } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { WalletRegistryService, CreateWalletRequest, UpdateWalletRequest } from '../services/wallet-registry.service';

@ApiTags('Wallets')
@Controller('wallets')
export class WalletController {
  constructor(private readonly walletRegistry: WalletRegistryService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new investor wallet' })
  @ApiResponse({ status: 201, description: 'Wallet created successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 409, description: 'Wallet already exists' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async createWallet(@Body() request: CreateWalletRequest) {
    return this.walletRegistry.createWallet(request);
  }

  @Get(':walletId')
  @ApiOperation({ summary: 'Get wallet by ID' })
  @ApiResponse({ status: 200, description: 'Wallet retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Wallet not found' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async getWallet(@Param('walletId') walletId: string) {
    return this.walletRegistry.getWallet(walletId);
  }

  @Put(':walletId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Update an existing wallet' })
  @ApiResponse({ status: 200, description: 'Wallet updated successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 404, description: 'Wallet not found' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async updateWallet(
    @Param('walletId') walletId: string,
    @Body() request: UpdateWalletRequest
  ) {
    return this.walletRegistry.updateWallet(walletId, request);
  }

  @Get('by-investor/:investorId')
  @ApiOperation({ summary: 'Get wallets by investor ID' })
  @ApiResponse({ status: 200, description: 'Wallets retrieved successfully' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async getWalletsByInvestor(@Param('investorId') investorId: string) {
    return this.walletRegistry.getWalletsByInvestor(investorId);
  }

  @Get('by-asset/:assetId')
  @ApiOperation({ summary: 'Get wallets by asset ID' })
  @ApiResponse({ status: 200, description: 'Wallets retrieved successfully' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async getWalletsByAsset(@Param('assetId') assetId: string) {
    return this.walletRegistry.getWalletsByAsset(assetId);
  }

  @Get('by-status/:status')
  @ApiOperation({ summary: 'Get wallets by status' })
  @ApiResponse({ status: 200, description: 'Wallets retrieved successfully' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async getWalletsByStatus(@Param('status') status: string) {
    return this.walletRegistry.getWalletsByStatus(status as any);
  }

  @Post(':walletId/activate')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Activate a wallet' })
  @ApiResponse({ status: 200, description: 'Wallet activated successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 404, description: 'Wallet not found' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async activateWallet(@Param('walletId') walletId: string) {
    return this.walletRegistry.activateWallet(walletId);
  }

  @Post(':walletId/suspend')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Suspend a wallet' })
  @ApiResponse({ status: 200, description: 'Wallet suspended successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 404, description: 'Wallet not found' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async suspendWallet(
    @Param('walletId') walletId: string,
    @Body() body: { reason: string }
  ) {
    return this.walletRegistry.suspendWallet(walletId, body.reason);
  }

  @Post(':walletId/reactivate')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Reactivate a suspended wallet' })
  @ApiResponse({ status: 200, description: 'Wallet reactivated successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 404, description: 'Wallet not found' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async reactivateWallet(@Param('walletId') walletId: string) {
    return this.walletRegistry.reactivateWallet(walletId);
  }

  @Put(':walletId/balance')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Update wallet balance' })
  @ApiResponse({ status: 200, description: 'Balance updated successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 404, description: 'Wallet not found' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async updateBalance(
    @Param('walletId') walletId: string,
    @Body() body: { balance: number }
  ) {
    return this.walletRegistry.updateBalance(walletId, body.balance);
  }

  @Post('validate-address')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Validate a wallet address' })
  @ApiResponse({ status: 200, description: 'Address validation completed' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async validateAddress(
    @Body() body: { address: string; stablecoinType: string }
  ) {
    return this.walletRegistry.validateWalletAddress(body.address, body.stablecoinType as any);
  }

  @Get('stats/overview')
  @ApiOperation({ summary: 'Get wallet statistics overview' })
  @ApiResponse({ status: 200, description: 'Statistics retrieved successfully' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async getWalletStats() {
    return this.walletRegistry.getWalletStats();
  }

  @Get('search')
  @ApiQuery({ name: 'investorId', required: false })
  @ApiQuery({ name: 'assetId', required: false })
  @ApiQuery({ name: 'status', required: false })
  @ApiQuery({ name: 'stablecoinType', required: false })
  @ApiQuery({ name: 'jurisdiction', required: false })
  @ApiQuery({ name: 'isKycVerified', required: false, type: Boolean })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'offset', required: false, type: Number })
  @ApiOperation({ summary: 'Search wallets with filters' })
  @ApiResponse({ status: 200, description: 'Wallets retrieved successfully' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async searchWallets(
    @Query('investorId') investorId?: string,
    @Query('assetId') assetId?: string,
    @Query('status') status?: string,
    @Query('stablecoinType') stablecoinType?: string,
    @Query('jurisdiction') jurisdiction?: string,
    @Query('isKycVerified') isKycVerified?: boolean,
    @Query('limit') limit?: number,
    @Query('offset') offset?: number,
  ) {
    return this.walletRegistry.searchWallets({
      investorId,
      assetId,
      status: status as any,
      stablecoinType: stablecoinType as any,
      jurisdiction,
      isKycVerified,
      limit,
      offset,
    });
  }

  @Post('bulk-update-status')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Bulk update wallet statuses' })
  @ApiResponse({ status: 200, description: 'Statuses updated successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async bulkUpdateStatus(
    @Body() body: { walletIds: string[]; status: string; reason?: string }
  ) {
    return this.walletRegistry.bulkUpdateStatus(body.walletIds, body.status as any, body.reason);
  }

  @Get('eligible-for-distribution/:assetId')
  @ApiOperation({ summary: 'Get wallets eligible for distribution' })
  @ApiResponse({ status: 200, description: 'Eligible wallets retrieved successfully' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async getEligibleWalletsForDistribution(@Param('assetId') assetId: string) {
    return this.walletRegistry.getEligibleWalletsForDistribution(assetId);
  }
}
