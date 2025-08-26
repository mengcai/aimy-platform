// Asset Service for the AIMY SDK

import { 
  Asset, 
  AssetType, 
  AssetStatus,
  PaginationOptions,
  PaginatedResult,
  AssetFilterSchema
} from '@aimy/shared';
import { AIMYClientConfig } from '../client';

/**
 * Asset Service for managing assets
 */
export class AssetService {
  private config: AIMYClientConfig;
  
  constructor(config: AIMYClientConfig) {
    this.config = config;
  }
  
  /**
   * Get all assets with pagination
   */
  async getAssets(options?: PaginationOptions): Promise<PaginatedResult<Asset>> {
    try {
      const queryParams = new URLSearchParams();
      if (options?.page) queryParams.append('page', options.page.toString());
      if (options?.limit) queryParams.append('limit', options.limit.toString());
      if (options?.sortBy) queryParams.append('sortBy', options.sortBy);
      if (options?.sortOrder) queryParams.append('sortOrder', options.sortOrder);
      
      const response = await fetch(`${this.config.baseUrl}/assets?${queryParams}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.config.apiKey}`,
          'Content-Type': 'application/json',
          ...this.config.headers,
        },
      });
      
      if (!response.ok) {
        throw new Error(`Failed to fetch assets: ${response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      throw new Error(`Asset fetch failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
  
  /**
   * Get asset by ID
   */
  async getAsset(id: string): Promise<Asset> {
    try {
      const response = await fetch(`${this.config.baseUrl}/assets/${id}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.config.apiKey}`,
          'Content-Type': 'application/json',
          ...this.config.headers,
        },
      });
      
      if (!response.ok) {
        throw new Error(`Failed to fetch asset: ${response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      throw new Error(`Asset fetch failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
  
  /**
   * Create new asset
   */
  async createAsset(assetData: Partial<Asset>): Promise<Asset> {
    try {
      const response = await fetch(`${this.config.baseUrl}/assets`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.config.apiKey}`,
          'Content-Type': 'application/json',
          ...this.config.headers,
        },
        body: JSON.stringify(assetData),
      });
      
      if (!response.ok) {
        throw new Error(`Failed to create asset: ${response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      throw new Error(`Asset creation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
  
  /**
   * Update asset
   */
  async updateAsset(id: string, assetData: Partial<Asset>): Promise<Asset> {
    try {
      const response = await fetch(`${this.config.baseUrl}/assets/${id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${this.config.apiKey}`,
          'Content-Type': 'application/json',
          ...this.config.headers,
        },
        body: JSON.stringify(assetData),
      });
      
      if (!response.ok) {
        throw new Error(`Failed to update asset: ${response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      throw new Error(`Asset update failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
  
  /**
   * Delete asset
   */
  async deleteAsset(id: string): Promise<boolean> {
    try {
      const response = await fetch(`${this.config.baseUrl}/assets/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${this.config.apiKey}`,
          'Content-Type': 'application/json',
          ...this.config.headers,
        },
      });
      
      return response.ok;
    } catch (error) {
      throw new Error(`Asset deletion failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
  
  /**
   * Search assets with filters
   */
  async searchAssets(filters: any, options?: PaginationOptions): Promise<PaginatedResult<Asset>> {
    try {
      const queryParams = new URLSearchParams();
      
      // Add filters
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          queryParams.append(key, String(value));
        }
      });
      
      // Add pagination options
      if (options?.page) queryParams.append('page', options.page.toString());
      if (options?.limit) queryParams.append('limit', options.limit.toString());
      if (options?.sortBy) queryParams.append('sortBy', options.sortBy);
      if (options?.sortOrder) queryParams.append('sortOrder', options.sortOrder);
      
      const response = await fetch(`${this.config.baseUrl}/assets/search?${queryParams}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.config.apiKey}`,
          'Content-Type': 'application/json',
          ...this.config.headers,
        },
      });
      
      if (!response.ok) {
        throw new Error(`Failed to search assets: ${response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      throw new Error(`Asset search failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
  
  /**
   * Get assets by type
   */
  async getAssetsByType(type: AssetType, options?: PaginationOptions): Promise<PaginatedResult<Asset>> {
    return this.searchAssets({ type }, options);
  }
  
  /**
   * Get assets by issuer
   */
  async getAssetsByIssuer(issuerId: string, options?: PaginationOptions): Promise<PaginatedResult<Asset>> {
    return this.searchAssets({ issuerId }, options);
  }
  
  /**
   * Get assets by status
   */
  async getAssetsByStatus(status: AssetStatus, options?: PaginationOptions): Promise<PaginatedResult<Asset>> {
    return this.searchAssets({ status }, options);
  }
  
  /**
   * Get assets by location
   */
  async getAssetsByLocation(location: string, options?: PaginationOptions): Promise<PaginatedResult<Asset>> {
    return this.searchAssets({ location }, options);
  }
  
  /**
   * Get assets by value range
   */
  async getAssetsByValueRange(
    minValue: number, 
    maxValue: number, 
    options?: PaginationOptions
  ): Promise<PaginatedResult<Asset>> {
    return this.searchAssets({ 
      minValue: minValue.toString(), 
      maxValue: maxValue.toString() 
    }, options);
  }
  
  /**
   * Get asset statistics
   */
  async getAssetStats(): Promise<any> {
    try {
      const response = await fetch(`${this.config.baseUrl}/assets/stats`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.config.apiKey}`,
          'Content-Type': 'application/json',
          ...this.config.headers,
        },
      });
      
      if (!response.ok) {
        throw new Error(`Failed to fetch asset stats: ${response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      throw new Error(`Asset stats fetch failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
  
  /**
   * Get asset valuation history
   */
  async getAssetValuationHistory(id: string, period?: string): Promise<any[]> {
    try {
      const queryParams = new URLSearchParams();
      if (period) queryParams.append('period', period);
      
      const response = await fetch(`${this.config.baseUrl}/assets/${id}/valuation-history?${queryParams}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.config.apiKey}`,
          'Content-Type': 'application/json',
          ...this.config.headers,
        },
      });
      
      if (!response.ok) {
        throw new Error(`Failed to fetch asset valuation history: ${response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      throw new Error(`Asset valuation history fetch failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
  
  /**
   * Get asset documents
   */
  async getAssetDocuments(id: string): Promise<any[]> {
    try {
      const response = await fetch(`${this.config.baseUrl}/assets/${id}/documents`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.config.apiKey}`,
          'Content-Type': 'application/json',
          ...this.config.headers,
        },
      });
      
      if (!response.ok) {
        throw new Error(`Failed to fetch asset documents: ${response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      throw new Error(`Asset documents fetch failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
  
  /**
   * Upload asset document
   */
  async uploadAssetDocument(id: string, documentData: FormData): Promise<any> {
    try {
      const response = await fetch(`${this.config.baseUrl}/assets/${id}/documents`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.config.apiKey}`,
          ...this.config.headers,
        },
        body: documentData,
      });
      
      if (!response.ok) {
        throw new Error(`Failed to upload asset document: ${response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      throw new Error(`Asset document upload failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}
