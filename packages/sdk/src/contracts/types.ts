/**
 * @title AIMY Security Token Contract Types
 * @dev TypeScript type definitions for the AIMY security token system contracts
 * @notice Generated types for contract interactions in the SDK
 */

// ============ Common Types ============

export interface Issuance {
  id: number;
  investor: string;
  amount: string;
  price: string;
  status: IssuanceStatus;
  createdAt: string;
  completedAt: string;
}

export enum IssuanceStatus {
  PENDING = "PENDING",
  COMPLETED = "COMPLETED",
  CANCELLED = "CANCELLED"
}

export interface ComplianceRule {
  ruleType: string;
  ruleValue: string;
  isActive: boolean;
  updatedAt: string;
}

export interface JurisdictionInfo {
  country: string;
  region: string;
  isAccredited: boolean;
  updatedAt: string;
}

export interface InvestorInfo {
  name: string;
  country: string;
  region: string;
  dateOfBirth: string;
  documentHash: string;
  kycLevel: string;
  registeredAt: string;
  updatedAt: string;
}

export interface KYCLevel {
  name: string;
  minInvestment: string;
  maxInvestment: string;
  description: string;
  createdAt: string;
}

export interface ComplianceStatus {
  kycApproved: boolean;
  amlApproved: boolean;
  sanctionsApproved: boolean;
  fullyCompliant: boolean;
}

// ============ AIMYSecurityToken Contract Types ============

export interface AIMYSecurityTokenContract {
  // View functions
  name(): Promise<string>;
  symbol(): Promise<string>;
  decimals(): Promise<number>;
  totalSupply(): Promise<string>;
  balanceOf(account: string): Promise<string>;
  allowance(owner: string, spender: string): Promise<string>;
  
  // Token configuration
  tokenName(): Promise<string>;
  tokenSymbol(): Promise<string>;
  maxSupply(): Promise<string>;
  minTicketSize(): Promise<string>;
  maxTicketSize(): Promise<string>;
  lockupPeriod(): Promise<string>;
  
  // Compliance and registry
  complianceEngine(): Promise<string>;
  assetRegistry(): Promise<string>;
  
  // Transfer restrictions
  transfersEnabled(): Promise<boolean>;
  blockedAddresses(address: string): Promise<boolean>;
  lastTransferBlock(address: string): Promise<string>;
  
  // Snapshot and record date
  currentSnapshotId(): Promise<string>;
  recordDate(): Promise<string>;
  
  // Issuance management
  issuances(issuanceId: string): Promise<Issuance>;
  userIssuances(investor: string): Promise<string[]>;
  
  // Role management
  ISSUER_ROLE(): Promise<string>;
  COMPLIANCE_ROLE(): Promise<string>;
  TRANSFER_AGENT_ROLE(): Promise<string>;
  hasRole(role: string, account: string): Promise<boolean>;
  
  // State changing functions
  createIssuance(investor: string, amount: string, price: string): Promise<any>;
  completeIssuance(issuanceId: string): Promise<any>;
  requestRedemption(amount: string): Promise<any>;
  completeRedemption(investor: string, amount: string): Promise<any>;
  
  // Compliance functions
  setBlockedAddress(address: string, blocked: boolean): Promise<any>;
  setTransfersEnabled(enabled: boolean): Promise<any>;
  
  // Snapshot functions
  createSnapshot(): Promise<string>;
  setRecordDate(recordDate: string): Promise<any>;
  
  // Update functions
  updateComplianceEngine(complianceEngine: string): Promise<any>;
  updateAssetRegistry(assetRegistry: string): Promise<any>;
  
  // Utility functions
  getInvestorIssuances(investor: string): Promise<string[]>;
  getIssuance(issuanceId: string): Promise<Issuance>;
  isKYCApproved(address: string): Promise<boolean>;
  isJurisdictionCompliant(address: string): Promise<boolean>;
  
  // Pause functions
  pause(): Promise<any>;
  unpause(): Promise<any>;
  
  // Standard ERC20 functions
  transfer(to: string, amount: string): Promise<boolean>;
  approve(spender: string, amount: string): Promise<boolean>;
  transferFrom(from: string, to: string, amount: string): Promise<boolean>;
  
  // Events
  filters: {
    IssuanceCreated(issuanceId?: string, investor?: string, amount?: string, price?: string, timestamp?: string): any;
    IssuanceCompleted(issuanceId?: string, investor?: string, amount?: string, timestamp?: string): any;
    RedemptionRequested(investor?: string, amount?: string, timestamp?: string): any;
    RedemptionCompleted(investor?: string, amount?: string, timestamp?: string): any;
    TransferBlocked(from?: string, to?: string, reason?: string, timestamp?: string): any;
    ComplianceRuleUpdated(ruleType?: string, ruleValue?: string, timestamp?: string): any;
    SnapshotCreated(snapshotId?: string, timestamp?: string): any;
    RecordDateSet(recordDate?: string, timestamp?: string): any;
    Transfer(from?: string, to?: string, value?: string): any;
    Approval(owner?: string, spender?: string, value?: string): any;
  };
}

// ============ ComplianceEngine Contract Types ============

export interface ComplianceEngineContract {
  // View functions
  complianceRules(ruleType: string): Promise<ComplianceRule>;
  jurisdictionInfo(address: string): Promise<JurisdictionInfo>;
  blockedAddresses(address: string): Promise<boolean>;
  sanctionedAddresses(address: string): Promise<boolean>;
  ruleTypes(index: string): Promise<string>;
  
  // Role management
  COMPLIANCE_OFFICER_ROLE(): Promise<string>;
  ORACLE_ROLE(): Promise<string>;
  hasRole(role: string, account: string): Promise<boolean>;
  
  // Compliance checks
  checkTransferCompliance(from: string, to: string, amount: string): Promise<boolean>;
  checkJurisdictionCompliance(address: string): Promise<boolean>;
  
  // Compliance management
  setComplianceRule(ruleType: string, ruleValue: string, isActive: boolean): Promise<any>;
  
  // Jurisdiction management
  updateJurisdictionInfo(address: string, country: string, region: string, isAccredited: boolean): Promise<any>;
  
  // Address management
  blockAddress(address: string, reason: string): Promise<any>;
  unblockAddress(address: string): Promise<any>;
  updateSanctionsStatus(address: string, isSanctioned: boolean, reason: string): Promise<any>;
  
  // Utility functions
  getComplianceRule(ruleType: string): Promise<ComplianceRule>;
  getJurisdictionInfo(address: string): Promise<JurisdictionInfo>;
  getRuleTypes(): Promise<string[]>;
  isAddressBlocked(address: string): Promise<boolean>;
  isAddressSanctioned(address: string): Promise<boolean>;
  
  // Events
  filters: {
    ComplianceRuleUpdated(ruleType?: string, ruleValue?: string, isActive?: boolean, timestamp?: string): any;
    JurisdictionInfoUpdated(address?: string, country?: string, region?: string, isAccredited?: boolean, timestamp?: string): any;
    AddressBlocked(address?: string, reason?: string, timestamp?: string): any;
    AddressUnblocked(address?: string, timestamp?: string): any;
    SanctionsCheck(address?: string, isSanctioned?: boolean, reason?: string, timestamp?: string): any;
  };
}

// ============ AssetRegistry Contract Types ============

export interface AssetRegistryContract {
  // View functions
  investors(address: string): Promise<InvestorInfo>;
  kycApproved(address: string): Promise<boolean>;
  amlApproved(address: string): Promise<boolean>;
  sanctionsApproved(address: string): Promise<boolean>;
  investorAddresses(index: string): Promise<string>;
  kycLevels(level: string): Promise<KYCLevel>;
  kycLevelNames(index: string): Promise<string>;
  
  // Role management
  KYC_OFFICER_ROLE(): Promise<string>;
  ORACLE_ROLE(): Promise<string>;
  hasRole(role: string, account: string): Promise<boolean>;
  
  // Investor management
  registerInvestor(
    investor: string,
    name: string,
    country: string,
    region: string,
    dateOfBirth: string,
    documentHash: string
  ): Promise<any>;
  
  updateKYCStatus(investor: string, level: string, approved: boolean): Promise<any>;
  updateAMLStatus(investor: string, approved: boolean, reason: string): Promise<any>;
  updateSanctionsStatus(investor: string, approved: boolean, reason: string): Promise<any>;
  
  // KYC level management
  addKYCLevel(level: string, minInvestment: string, maxInvestment: string, description: string): Promise<any>;
  updateKYCLevel(level: string, minInvestment: string, maxInvestment: string, description: string): Promise<any>;
  
  // Compliance checks
  isKYCApproved(address: string): Promise<boolean>;
  isFullyCompliant(address: string): Promise<boolean>;
  isRegisteredInvestor(address: string): Promise<boolean>;
  
  // Utility functions
  getInvestorInfo(address: string): Promise<InvestorInfo>;
  getKYCLevel(level: string): Promise<KYCLevel>;
  getKYCLevelNames(): Promise<string[]>;
  getInvestorAddresses(): Promise<string[]>;
  getInvestorCount(): Promise<string>;
  getComplianceStatus(address: string): Promise<ComplianceStatus>;
  
  // Admin functions
  removeInvestor(address: string): Promise<any>;
  
  // Events
  filters: {
    InvestorRegistered(investor?: string, name?: string, country?: string, timestamp?: string): any;
    KYCStatusUpdated(investor?: string, level?: string, approved?: boolean, timestamp?: string): any;
    AMLStatusUpdated(investor?: string, approved?: boolean, reason?: string, timestamp?: string): any;
    SanctionsStatusUpdated(investor?: string, approved?: boolean, reason?: string, timestamp?: string): any;
    KYCLevelAdded(level?: string, minInvestment?: string, maxInvestment?: string, timestamp?: string): any;
    KYCLevelUpdated(level?: string, minInvestment?: string, maxInvestment?: string, timestamp?: string): any;
  };
}

// ============ SolarFarm3643 Contract Types ============

export interface SolarFarm3643Contract extends AIMYSecurityTokenContract {
  // Solar farm specific properties
  projectName(): Promise<string>;
  location(): Promise<string>;
  capacityMW(): Promise<string>;
  expectedAnnualYield(): Promise<string>;
  constructionStartDate(): Promise<string>;
  operationalDate(): Promise<string>;
  expectedLifespan(): Promise<string>;
  
  // Solar farm specific functions
  updateSolarFarmDetails(
    projectName: string,
    location: string,
    capacityMW: string,
    expectedAnnualYield: string
  ): Promise<any>;
  
  setConstructionMilestone(milestone: string, completionDate: string): Promise<any>;
  setOperationalDate(operationalDate: string): Promise<any>;
  calculateExpectedYield(investor: string, period: string): Promise<string>;
  
  getSolarFarmInfo(): Promise<{
    projectName: string;
    location: string;
    capacityMW: string;
    expectedAnnualYield: string;
    constructionStartDate: string;
    operationalDate: string;
    expectedLifespan: string;
    isOperational: boolean;
  }>;
  
  isOperational(): Promise<boolean>;
  
  getConstructionStatus(): Promise<{
    constructionStarted: boolean;
    constructionCompleted: boolean;
    daysSinceStart: string;
    daysUntilOperational: string;
  }>;
  
  getProjectValuation(): Promise<string>;
  getInvestorPortfolioValue(investor: string): Promise<string>;
  
  // Solar farm specific events
  filters: {
    SolarFarmDetailsUpdated(projectName?: string, location?: string, capacityMW?: string, expectedAnnualYield?: string, timestamp?: string): any;
    ConstructionMilestone(milestone?: string, completionDate?: string, timestamp?: string): any;
    YieldDistribution(investor?: string, amount?: string, period?: string, timestamp?: string): any;
  };
}

// ============ Contract Factory Types ============

export interface ContractFactories {
  AIMYSecurityToken: any;
  ComplianceEngine: any;
  AssetRegistry: any;
  SolarFarm3643: any;
}

// ============ Contract Addresses ============

export interface ContractAddresses {
  complianceEngine: string;
  assetRegistry: string;
  solarFarmToken: string;
}

// ============ Contract Configuration ============

export interface TokenConfiguration {
  name: string;
  symbol: string;
  maxSupply: string;
  minTicketSize: string;
  maxTicketSize: string;
  lockupPeriod: string;
}

export interface SolarFarmConfiguration {
  projectName: string;
  location: string;
  capacityMW: string;
  expectedAnnualYield: string;
  constructionStartDate: string;
  expectedLifespan: string;
}

// ============ Contract Events ============

export interface ContractEvents {
  // AIMYSecurityToken events
  IssuanceCreated: {
    issuanceId: string;
    investor: string;
    amount: string;
    price: string;
    timestamp: string;
  };
  
  IssuanceCompleted: {
    issuanceId: string;
    investor: string;
    amount: string;
    timestamp: string;
  };
  
  RedemptionRequested: {
    investor: string;
    amount: string;
    timestamp: string;
  };
  
  RedemptionCompleted: {
    investor: string;
    amount: string;
    timestamp: string;
  };
  
  TransferBlocked: {
    from: string;
    to: string;
    reason: string;
    timestamp: string;
  };
  
  ComplianceRuleUpdated: {
    ruleType: string;
    ruleValue: string;
    timestamp: string;
  };
  
  SnapshotCreated: {
    snapshotId: string;
    timestamp: string;
  };
  
  RecordDateSet: {
    recordDate: string;
    timestamp: string;
  };
  
  // SolarFarm3643 specific events
  SolarFarmDetailsUpdated: {
    projectName: string;
    location: string;
    capacityMW: string;
    expectedAnnualYield: string;
    timestamp: string;
  };
  
  ConstructionMilestone: {
    milestone: string;
    completionDate: string;
    timestamp: string;
  };
  
  YieldDistribution: {
    investor: string;
    amount: string;
    period: string;
    timestamp: string;
  };
}
