import { Injectable, Logger } from '@nestjs/common';
import { MockDEXAdapter } from './mock-dex.adapter';
import { LiquidityConnector, AMMConnector, DEXConnector } from '../interfaces/liquidity-connector.interface';

export enum ConnectorType {
  MOCK_DEX = 'mock_dex',
  UNISWAP_V3 = 'uniswap_v3',
  SUSHISWAP = 'sushiswap',
  PANCAKESWAP = 'pancakeswap',
  BINANCE = 'binance',
  COINBASE = 'coinbase',
  KRAKEN = 'kraken',
}

export interface ConnectorConfig {
  type: ConnectorType;
  name: string;
  description: string;
  enabled: boolean;
  config: any;
  priority: number;
}

@Injectable()
export class AdapterFactory {
  private readonly logger = new Logger(AdapterFactory.name);
  private connectors = new Map<ConnectorType, LiquidityConnector>();
  private connectorConfigs = new Map<ConnectorType, ConnectorConfig>();

  constructor(private readonly mockDEXAdapter: MockDEXAdapter) {
    this.initializeConnectors();
  }

  private initializeConnectors(): void {
    // Register mock DEX adapter
    this.registerConnector(ConnectorType.MOCK_DEX, this.mockDEXAdapter, {
      type: ConnectorType.MOCK_DEX,
      name: 'Mock DEX',
      description: 'Mock DEX adapter for testing and development',
      enabled: true,
      config: {
        mockMode: true,
        autoConnect: true,
        updateInterval: 5000,
      },
      priority: 1,
    });

    this.logger.log('Adapter factory initialized with mock DEX connector');
  }

  /**
   * Register a new connector
   */
  registerConnector(
    type: ConnectorType,
    connector: LiquidityConnector,
    config: ConnectorConfig
  ): void {
    this.connectors.set(type, connector);
    this.connectorConfigs.set(type, config);
    this.logger.log(`Registered connector: ${type} - ${config.name}`);
  }

  /**
   * Get a connector by type
   */
  getConnector(type: ConnectorType): LiquidityConnector | null {
    const connector = this.connectors.get(type);
    if (!connector) {
      this.logger.warn(`Connector not found: ${type}`);
      return null;
    }

    const config = this.connectorConfigs.get(type);
    if (!config?.enabled) {
      this.logger.warn(`Connector is disabled: ${type}`);
      return null;
    }

    return connector;
  }

  /**
   * Get all available connectors
   */
  getAllConnectors(): Array<{ type: ConnectorType; connector: LiquidityConnector; config: ConnectorConfig }> {
    const result: Array<{ type: ConnectorType; connector: LiquidityConnector; config: ConnectorConfig }> = [];
    
    for (const [type, connector] of this.connectors.entries()) {
      const config = this.connectorConfigs.get(type);
      if (config && config.enabled) {
        result.push({ type, connector, config });
      }
    }

    return result.sort((a, b) => a.config.priority - b.config.priority);
  }

  /**
   * Get all enabled connectors
   */
  getEnabledConnectors(): Array<{ type: ConnectorType; connector: LiquidityConnector; config: ConnectorConfig }> {
    return this.getAllConnectors().filter(item => item.config.enabled);
  }

  /**
   * Get connector by priority (highest priority first)
   */
  getConnectorByPriority(): LiquidityConnector | null {
    const enabledConnectors = this.getEnabledConnectors();
    if (enabledConnectors.length === 0) {
      return null;
    }
    return enabledConnectors[0].connector;
  }

  /**
   * Get AMM connector by type
   */
  getAMMConnector(type: ConnectorType): AMMConnector | null {
    const connector = this.getConnector(type);
    if (connector && this.isAMMConnector(connector)) {
      return connector as AMMConnector;
    }
    return null;
  }

  /**
   * Get DEX connector by type
   */
  getDEXConnector(type: ConnectorType): DEXConnector | null {
    const connector = this.getConnector(type);
    if (connector && this.isDEXConnector(connector)) {
      return connector as DEXConnector;
    }
    return null;
  }

  /**
   * Get all AMM connectors
   */
  getAllAMMConnectors(): Array<{ type: ConnectorType; connector: AMMConnector; config: ConnectorConfig }> {
    return this.getAllConnectors()
      .filter(item => this.isAMMConnector(item.connector))
      .map(item => ({
        type: item.type,
        connector: item.connector as AMMConnector,
        config: item.config,
      }));
  }

  /**
   * Get all DEX connectors
   */
  getAllDEXConnectors(): Array<{ type: ConnectorType; connector: DEXConnector; config: ConnectorConfig }> {
    return this.getAllConnectors()
      .filter(item => this.isDEXConnector(item.connector))
      .map(item => ({
        type: item.type,
        connector: item.connector as DEXConnector,
        config: item.config,
      }));
  }

  /**
   * Check if connector is AMM connector
   */
  private isAMMConnector(connector: LiquidityConnector): connector is AMMConnector {
    return 'calculateSpotPrice' in connector && 
           'calculateSwapOutput' in connector && 
           'getBondingCurveParams' in connector;
  }

  /**
   * Check if connector is DEX connector
   */
  private isDEXConnector(connector: LiquidityConnector): connector is DEXConnector {
    return 'getGasEstimate' in connector && 
           'submitTransaction' in connector && 
           'subscribeToEvents' in connector;
  }

  /**
   * Enable/disable connector
   */
  setConnectorEnabled(type: ConnectorType, enabled: boolean): boolean {
    const config = this.connectorConfigs.get(type);
    if (!config) {
      this.logger.warn(`Cannot set enabled state for unknown connector: ${type}`);
      return false;
    }

    config.enabled = enabled;
    this.logger.log(`Connector ${type} ${enabled ? 'enabled' : 'disabled'}`);
    return true;
  }

  /**
   * Update connector configuration
   */
  updateConnectorConfig(type: ConnectorType, updates: Partial<ConnectorConfig>): boolean {
    const config = this.connectorConfigs.get(type);
    if (!config) {
      this.logger.warn(`Cannot update config for unknown connector: ${type}`);
      return false;
    }

    Object.assign(config, updates);
    this.logger.log(`Updated configuration for connector: ${type}`);
    return true;
  }

  /**
   * Get connector configuration
   */
  getConnectorConfig(type: ConnectorType): ConnectorConfig | null {
    return this.connectorConfigs.get(type) || null;
  }

  /**
   * Get connector status
   */
  async getConnectorStatus(type: ConnectorType): Promise<{
    type: ConnectorType;
    name: string;
    enabled: boolean;
    connected: boolean;
    health: any;
    capabilities: any;
  } | null> {
    const connector = this.getConnector(type);
    const config = this.getConnectorConfig(type);
    
    if (!connector || !config) {
      return null;
    }

    try {
      const [health, capabilities] = await Promise.all([
        connector.healthCheck(),
        connector.getCapabilities(),
      ]);

      return {
        type,
        name: config.name,
        enabled: config.enabled,
        connected: connector.isConnected(),
        health,
        capabilities,
      };
    } catch (error) {
      this.logger.error(`Error getting status for connector ${type}:`, error);
      return {
        type,
        name: config.name,
        enabled: config.enabled,
        connected: false,
        health: { status: 'error', error: error.message },
        capabilities: { supports: [], limits: {}, features: [] },
      };
    }
  }

  /**
   * Get all connector statuses
   */
  async getAllConnectorStatuses(): Promise<Array<{
    type: ConnectorType;
    name: string;
    enabled: boolean;
    connected: boolean;
    health: any;
    capabilities: any;
  }>> {
    const statuses: Array<{
      type: ConnectorType;
      name: string;
      enabled: boolean;
      connected: boolean;
      health: any;
      capabilities: any;
    }> = [];

    for (const [type] of this.connectors.entries()) {
      const status = await this.getConnectorStatus(type);
      if (status) {
        statuses.push(status);
      }
    }

    return statuses.sort((a, b) => {
      const configA = this.getConnectorConfig(a.type);
      const configB = this.getConnectorConfig(b.type);
      return (configA?.priority || 0) - (configB?.priority || 0);
    });
  }

  /**
   * Connect to all enabled connectors
   */
  async connectAll(): Promise<void> {
    this.logger.log('Connecting to all enabled connectors...');
    
    const enabledConnectors = this.getEnabledConnectors();
    const connectPromises = enabledConnectors.map(async ({ type, connector }) => {
      try {
        await connector.connect();
        this.logger.log(`Connected to ${type}`);
      } catch (error) {
        this.logger.error(`Failed to connect to ${type}:`, error);
      }
    });

    await Promise.allSettled(connectPromises);
    this.logger.log('Finished connecting to all connectors');
  }

  /**
   * Disconnect from all connectors
   */
  async disconnectAll(): Promise<void> {
    this.logger.log('Disconnecting from all connectors...');
    
    const allConnectors = Array.from(this.connectors.values());
    const disconnectPromises = allConnectors.map(async (connector) => {
      try {
        await connector.disconnect();
      } catch (error) {
        this.logger.error('Failed to disconnect from connector:', error);
      }
    });

    await Promise.allSettled(disconnectPromises);
    this.logger.log('Disconnected from all connectors');
  }

  /**
   * Health check for all connectors
   */
  async healthCheckAll(): Promise<{
    overall: 'healthy' | 'degraded' | 'unhealthy';
    connectors: Array<{
      type: ConnectorType;
      name: string;
      status: string;
      details: any;
    }>;
  }> {
    const statuses = await this.getAllConnectorStatuses();
    const connectorHealth = statuses.map(status => ({
      type: status.type,
      name: status.name,
      status: status.health.status,
      details: status.health.details,
    }));

    const healthyCount = connectorHealth.filter(c => c.status === 'healthy').length;
    const totalCount = connectorHealth.length;

    let overall: 'healthy' | 'degraded' | 'unhealthy';
    if (healthyCount === totalCount) {
      overall = 'healthy';
    } else if (healthyCount > totalCount / 2) {
      overall = 'degraded';
    } else {
      overall = 'unhealthy';
    }

    return {
      overall,
      connectors: connectorHealth,
    };
  }

  /**
   * Get factory statistics
   */
  getFactoryStats(): {
    totalConnectors: number;
    enabledConnectors: number;
    connectedConnectors: number;
    connectorTypes: ConnectorType[];
  } {
    const totalConnectors = this.connectors.size;
    const enabledConnectors = this.getEnabledConnectors().length;
    const connectedConnectors = Array.from(this.connectors.values())
      .filter(connector => connector.isConnected()).length;
    const connectorTypes = Array.from(this.connectors.keys());

    return {
      totalConnectors,
      enabledConnectors,
      connectedConnectors,
      connectorTypes,
    };
  }
}
