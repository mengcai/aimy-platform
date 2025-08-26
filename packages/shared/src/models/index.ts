import { BaseEntity, Asset, AssetType, AssetStatus, TokenizationStatus } from '../types';

// Base entity class
export abstract class BaseModel implements BaseEntity {
  id: string;
  createdAt: Date;
  updatedAt: Date;

  constructor(data: Partial<BaseEntity>) {
    this.id = data.id || '';
    this.createdAt = data.createdAt || new Date();
    this.updatedAt = data.updatedAt || new Date();
  }

  update(data: Partial<BaseEntity>): void {
    Object.assign(this, data);
    this.updatedAt = new Date();
  }
}

// Asset model
export class AssetModel extends BaseModel implements Asset {
  name: string;
  description: string;
  type: AssetType;
  location: string;
  estimatedValue: number;
  currency: string;
  documents: string[];
  metadata: Record<string, any>;
  status: AssetStatus;
  issuerId: string;
  tokenizationStatus: TokenizationStatus;

  constructor(data: Partial<Asset>) {
    super(data);
    this.name = data.name || '';
    this.description = data.description || '';
    this.type = data.type || AssetType.REAL_ESTATE;
    this.location = data.location || '';
    this.estimatedValue = data.estimatedValue || 0;
    this.currency = data.currency || 'USD';
    this.documents = data.documents || [];
    this.metadata = data.metadata || {};
    this.status = data.status || AssetStatus.DRAFT;
    this.issuerId = data.issuerId || '';
    this.tokenizationStatus = data.tokenizationStatus || TokenizationStatus.NOT_STARTED;
  }

  // Business logic methods
  canBeTokenized(): boolean {
    return this.status === AssetStatus.APPROVED && 
           this.tokenizationStatus === TokenizationStatus.NOT_STARTED;
  }

  startTokenization(): void {
    if (this.canBeTokenized()) {
      this.tokenizationStatus = TokenizationStatus.IN_PROGRESS;
      this.update({ tokenizationStatus: TokenizationStatus.IN_PROGRESS });
    }
  }

  completeTokenization(): void {
    if (this.tokenizationStatus === TokenizationStatus.IN_PROGRESS) {
      this.tokenizationStatus = TokenizationStatus.COMPLETED;
      this.update({ tokenizationStatus: TokenizationStatus.COMPLETED });
    }
  }

  addDocument(documentId: string): void {
    if (!this.documents.includes(documentId)) {
      this.documents.push(documentId);
      this.update({ documents: this.documents });
    }
  }

  removeDocument(documentId: string): void {
    this.documents = this.documents.filter(id => id !== documentId);
    this.update({ documents: this.documents });
  }

  updateValue(newValue: number, newCurrency?: string): void {
    this.estimatedValue = newValue;
    if (newCurrency) {
      this.currency = newCurrency;
    }
    this.update({ 
      estimatedValue: this.estimatedValue, 
      currency: this.currency 
    });
  }

  approve(): void {
    if (this.status === AssetStatus.UNDER_REVIEW) {
      this.status = AssetStatus.APPROVED;
      this.update({ status: AssetStatus.APPROVED });
    }
  }

  reject(): void {
    if (this.status === AssetStatus.UNDER_REVIEW) {
      this.status = AssetStatus.REJECTED;
      this.update({ status: AssetStatus.REJECTED });
    }
  }

  suspend(): void {
    if (this.status === AssetStatus.ACTIVE) {
      this.status = AssetStatus.SUSPENDED;
      this.update({ status: AssetStatus.SUSPENDED });
    }
  }

  activate(): void {
    if (this.status === AssetStatus.SUSPENDED) {
      this.status = AssetStatus.ACTIVE;
      this.update({ status: AssetStatus.ACTIVE });
    }
  }

  // Validation methods
  isValid(): boolean {
    return this.name.length > 0 &&
           this.description.length > 0 &&
           this.location.length > 0 &&
           this.estimatedValue > 0 &&
           this.issuerId.length > 0;
  }

  getValidationErrors(): string[] {
    const errors: string[] = [];
    
    if (this.name.length === 0) errors.push('Asset name is required');
    if (this.description.length === 0) errors.push('Asset description is required');
    if (this.location.length === 0) errors.push('Asset location is required');
    if (this.estimatedValue <= 0) errors.push('Asset value must be positive');
    if (this.issuerId.length === 0) errors.push('Issuer ID is required');
    
    return errors;
  }

  // Utility methods
  toJSON(): Record<string, any> {
    return {
      id: this.id,
      name: this.name,
      description: this.description,
      type: this.type,
      location: this.location,
      estimatedValue: this.estimatedValue,
      currency: this.currency,
      documents: this.documents,
      metadata: this.metadata,
      status: this.status,
      issuerId: this.issuerId,
      tokenizationStatus: this.tokenizationStatus,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }

  clone(): AssetModel {
    return new AssetModel(this.toJSON());
  }
}

// Export all models
export {
  BaseModel,
  AssetModel,
};
