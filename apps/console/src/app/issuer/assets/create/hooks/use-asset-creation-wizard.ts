import { useState, useCallback } from 'react';
import { toast } from 'sonner';

export interface AssetBasics {
  name: string;
  description: string;
  assetType: string;
  sector: string;
  location: string;
  documents: File[];
  estimatedValue: number;
  currency: string;
}

export interface LegalWrapper {
  jurisdiction: string;
  regulatoryFramework: string[];
  regD: boolean;
  regS: boolean;
  mica: boolean;
  hkSandbox: boolean;
  legalOpinion: File | null;
  complianceDocuments: File[];
}

export interface TokenTerms {
  tokenName: string;
  tokenSymbol: string;
  totalSupply: number;
  initialPrice: number;
  lockupPeriod: number;
  transferRestrictions: string[];
  complianceRules: string[];
  kycRequired: boolean;
  amlRequired: boolean;
}

export interface PricingAI {
  cashflows: Cashflow[];
  aiValuation: number;
  riskScore: number;
  yieldForecast: number;
  marketAnalysis: string;
  aiConfidence: number;
}

export interface Cashflow {
  date: string;
  amount: number;
  type: 'revenue' | 'dividend' | 'interest' | 'rental' | 'other';
  description: string;
}

export interface OfferingSetup {
  minimumTicket: number;
  maximumTicket: number;
  kycRequirements: string[];
  amlRequirements: string[];
  accreditedInvestorOnly: boolean;
  lockupPeriod: number;
  distributionSchedule: string;
}

export interface AssetCreationData {
  assetBasics: AssetBasics;
  legalWrapper: LegalWrapper;
  tokenTerms: TokenTerms;
  pricingAI: PricingAI;
  offeringSetup: OfferingSetup;
}

export function useAssetCreationWizard() {
  const [data, setData] = useState<AssetCreationData>({
    assetBasics: {
      name: '',
      description: '',
      assetType: '',
      sector: '',
      location: '',
      documents: [],
      estimatedValue: 0,
      currency: 'USD',
    },
    legalWrapper: {
      jurisdiction: '',
      regulatoryFramework: [],
      regD: false,
      regS: false,
      mica: false,
      hkSandbox: false,
      legalOpinion: null,
      complianceDocuments: [],
    },
    tokenTerms: {
      tokenName: '',
      tokenSymbol: '',
      totalSupply: 0,
      initialPrice: 0,
      lockupPeriod: 0,
      transferRestrictions: [],
      complianceRules: [],
      kycRequired: true,
      amlRequired: true,
    },
    pricingAI: {
      cashflows: [],
      aiValuation: 0,
      riskScore: 0,
      yieldForecast: 0,
      marketAnalysis: '',
      aiConfidence: 0,
    },
    offeringSetup: {
      minimumTicket: 0,
      maximumTicket: 0,
      kycRequirements: [],
      amlRequirements: [],
      accreditedInvestorOnly: false,
      lockupPeriod: 0,
      distributionSchedule: '',
    },
  });

  const [isLoading, setIsLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);

  const updateAssetBasics = useCallback((updates: Partial<AssetBasics>) => {
    setData(prev => ({
      ...prev,
      assetBasics: { ...prev.assetBasics, ...updates }
    }));
  }, []);

  const updateLegalWrapper = useCallback((updates: Partial<LegalWrapper>) => {
    setData(prev => ({
      ...prev,
      legalWrapper: { ...prev.legalWrapper, ...updates }
    }));
  }, []);

  const updateTokenTerms = useCallback((updates: Partial<TokenTerms>) => {
    setData(prev => ({
      ...prev,
      tokenTerms: { ...prev.tokenTerms, ...updates }
    }));
  }, []);

  const updatePricingAI = useCallback((updates: Partial<PricingAI>) => {
    setData(prev => ({
      ...prev,
      pricingAI: { ...prev.pricingAI, ...updates }
    }));
  }, []);

  const updateOfferingSetup = useCallback((updates: Partial<OfferingSetup>) => {
    setData(prev => ({
      ...prev,
      offeringSetup: { ...prev.offeringSetup, ...updates }
    }));
  }, []);

  const addCashflow = useCallback((cashflow: Cashflow) => {
    setData(prev => ({
      ...prev,
      pricingAI: {
        ...prev.pricingAI,
        cashflows: [...prev.pricingAI.cashflows, cashflow]
      }
    }));
  }, []);

  const removeCashflow = useCallback((index: number) => {
    setData(prev => ({
      ...prev,
      pricingAI: {
        ...prev.pricingAI,
        cashflows: prev.pricingAI.cashflows.filter((_, i) => i !== index)
      }
    }));
  }, []);

  const canProceedToNextStep = useCallback((step: number): boolean => {
    switch (step) {
      case 1:
        return !!(
          data.assetBasics.name &&
          data.assetBasics.description &&
          data.assetBasics.assetType &&
          data.assetBasics.sector &&
          data.assetBasics.location &&
          data.assetBasics.documents.length > 0 &&
          data.assetBasics.estimatedValue > 0
        );
      case 2:
        return !!(
          data.legalWrapper.jurisdiction &&
          data.legalWrapper.regulatoryFramework.length > 0 &&
          (data.legalWrapper.regD || data.legalWrapper.regS || data.legalWrapper.mica || data.legalWrapper.hkSandbox)
        );
      case 3:
        return !!(
          data.tokenTerms.tokenName &&
          data.tokenTerms.tokenSymbol &&
          data.tokenTerms.totalSupply > 0 &&
          data.tokenTerms.initialPrice > 0
        );
      case 4:
        return !!(
          data.pricingAI.cashflows.length > 0 &&
          data.pricingAI.aiValuation > 0 &&
          data.pricingAI.riskScore > 0
        );
      case 5:
        return !!(
          data.offeringSetup.minimumTicket > 0 &&
          data.offeringSetup.maximumTicket > data.offeringSetup.minimumTicket &&
          data.offeringSetup.kycRequirements.length > 0
        );
      default:
        return true;
    }
  }, [data]);

  const canLaunch = useCallback((): boolean => {
    return canProceedToNextStep(1) &&
           canProceedToNextStep(2) &&
           canProceedToNextStep(3) &&
           canProceedToNextStep(4) &&
           canProceedToNextStep(5);
  }, [canProceedToNextStep]);

  const launchAsset = useCallback(async () => {
    if (!canLaunch()) {
      toast.error('Please complete all required fields before launching');
      return;
    }

    setIsLoading(true);
    try {
      // Step 1: Save configuration to Postgres
      const configResponse = await fetch('/api/assets/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!configResponse.ok) {
        throw new Error('Failed to save asset configuration');
      }

      const { assetId } = await configResponse.json();

      // Step 2: Deploy contracts
      const deployResponse = await fetch('/api/assets/deploy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ assetId, ...data }),
      });

      if (!deployResponse.ok) {
        throw new Error('Failed to deploy contracts');
      }

      const { contractAddress, tokenAddress } = await deployResponse.json();

      // Step 3: Create primary offer in gateway
      const offerResponse = await fetch('/api/assets/offer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          assetId,
          contractAddress,
          tokenAddress,
          ...data,
        }),
      });

      if (!offerResponse.ok) {
        throw new Error('Failed to create primary offer');
      }

      const { offerId } = await offerResponse.json();

      toast.success('Asset successfully launched!', {
        description: `Asset ID: ${assetId}, Contract: ${contractAddress}, Offer: ${offerId}`,
      });

      // Redirect to asset management page
      window.location.href = `/issuer/assets/${assetId}`;

    } catch (error) {
      console.error('Launch failed:', error);
      toast.error('Failed to launch asset', {
        description: error instanceof Error ? error.message : 'Unknown error occurred',
      });
    } finally {
      setIsLoading(false);
    }
  }, [data, canLaunch]);

  const resetWizard = useCallback(() => {
    setData({
      assetBasics: {
        name: '',
        description: '',
        assetType: '',
        sector: '',
        location: '',
        documents: [],
        estimatedValue: 0,
        currency: 'USD',
      },
      legalWrapper: {
        jurisdiction: '',
        regulatoryFramework: [],
        regD: false,
        regS: false,
        mica: false,
        hkSandbox: false,
        legalOpinion: null,
        complianceDocuments: [],
      },
      tokenTerms: {
        tokenName: '',
        tokenSymbol: '',
        totalSupply: 0,
        initialPrice: 0,
        lockupPeriod: 0,
        transferRestrictions: [],
        complianceRules: [],
        kycRequired: true,
        amlRequired: true,
      },
      pricingAI: {
        cashflows: [],
        aiValuation: 0,
        riskScore: 0,
        yieldForecast: 0,
        marketAnalysis: '',
        aiConfidence: 0,
      },
      offeringSetup: {
        minimumTicket: 0,
        maximumTicket: 0,
        kycRequirements: [],
        amlRequirements: [],
        accreditedInvestorOnly: false,
        lockupPeriod: 0,
        distributionSchedule: '',
      },
    });
    setCurrentStep(1);
  }, []);

  return {
    data,
    isLoading,
    currentStep,
    setCurrentStep,
    updateAssetBasics,
    updateLegalWrapper,
    updateTokenTerms,
    updatePricingAI,
    updateOfferingSetup,
    addCashflow,
    removeCashflow,
    canProceedToNextStep,
    canLaunch,
    launchAsset,
    resetWizard,
  };
}

