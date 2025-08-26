'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  CheckCircle, 
  AlertTriangle, 
  FileText, 
  Shield, 
  Coins, 
  Brain, 
  Target, 
  Rocket,
  ExternalLink,
  Download,
  Eye
} from 'lucide-react';
import { AssetCreationData } from '../hooks/use-asset-creation-wizard';

interface ReviewLaunchStepProps {
  wizard: {
    data: AssetCreationData;
    isLoading: boolean;
  };
  onLaunch: () => void;
}

export function ReviewLaunchStep({ wizard, onLaunch }: ReviewLaunchStepProps) {
  const { data, isLoading } = wizard;
  const [activeSection, setActiveSection] = useState<string>('overview');

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getRiskScoreColor = (score: number) => {
    if (score <= 30) return 'text-green-600 bg-green-100';
    if (score <= 60) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  const getRiskScoreLabel = (score: number) => {
    if (score <= 30) return 'Low Risk';
    if (score <= 60) return 'Medium Risk';
    return 'High Risk';
  };

  const getLockupPeriodLabel = (days: number) => {
    if (days === 0) return 'No Lockup';
    if (days < 30) return `${days} Days`;
    if (days < 365) return `${Math.round(days / 30)} Months`;
    return `${Math.round(days / 365)} Years`;
  };

  const sections = [
    { id: 'overview', label: 'Overview', icon: Eye },
    { id: 'asset', label: 'Asset Details', icon: FileText },
    { id: 'legal', label: 'Legal & Compliance', icon: Shield },
    { id: 'token', label: 'Token Terms', icon: Coins },
    { id: 'ai', label: 'AI & Pricing', icon: Brain },
    { id: 'offering', label: 'Offering Setup', icon: Target },
  ];

  const renderOverview = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="pt-6 text-center">
            <div className="text-3xl font-bold text-primary mb-2">
              {data.assetBasics.name || 'Unnamed Asset'}
            </div>
            <p className="text-sm text-muted-foreground">Asset Name</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6 text-center">
            <div className="text-3xl font-bold text-green-600 mb-2">
              {formatCurrency(data.assetBasics.estimatedValue)}
            </div>
            <p className="text-sm text-muted-foreground">Estimated Value</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6 text-center">
            <div className="text-3xl font-bold text-blue-600 mb-2">
              {data.assetBasics.assetType || 'Not Set'}
            </div>
            <p className="text-sm text-muted-foreground">Asset Type</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Quick Stats</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {data.assetBasics.documents.length}
              </div>
              <p className="text-muted-foreground">Documents</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">
                {data.legalWrapper.regulatoryFramework.length}
              </div>
              <p className="text-muted-foreground">Regulatory Frameworks</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-indigo-600">
                {data.pricingAI.cashflows.length}
              </div>
              <p className="text-muted-foreground">Cashflows</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-teal-600">
                {data.offeringSetup.kycRequirements.length}
              </div>
              <p className="text-muted-foreground">KYC Requirements</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderAssetDetails = () => (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h4 className="font-medium mb-3">Basic Information</h4>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Name:</span>
              <span>{data.assetBasics.name || 'Not set'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Type:</span>
              <span>{data.assetBasics.assetType || 'Not set'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Sector:</span>
              <span>{data.assetBasics.sector || 'Not set'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Location:</span>
              <span>{data.assetBasics.location || 'Not set'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Value:</span>
              <span>{formatCurrency(data.assetBasics.estimatedValue)}</span>
            </div>
          </div>
        </div>

        <div>
          <h4 className="font-medium mb-3">Documents</h4>
          <div className="space-y-2">
            {data.assetBasics.documents.length > 0 ? (
              data.assetBasics.documents.map((doc, index) => (
                <div key={index} className="flex items-center gap-2 text-sm">
                  <FileText className="h-4 w-4 text-muted-foreground" />
                  <span>{doc.name}</span>
                  <Badge variant="outline" className="text-xs">
                    {(doc.size / 1024 / 1024).toFixed(1)} MB
                  </Badge>
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground">No documents uploaded</p>
            )}
          </div>
        </div>
      </div>

      {data.assetBasics.description && (
        <div>
          <h4 className="font-medium mb-3">Description</h4>
          <p className="text-sm text-muted-foreground bg-muted p-3 rounded-lg">
            {data.assetBasics.description}
          </p>
        </div>
      )}
    </div>
  );

  const renderLegalCompliance = () => (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h4 className="font-medium mb-3">Jurisdiction & Framework</h4>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Primary Jurisdiction:</span>
              <span>{data.legalWrapper.jurisdiction || 'Not set'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Regulatory Frameworks:</span>
              <span>{data.legalWrapper.regulatoryFramework.length} selected</span>
            </div>
          </div>

          <div className="mt-3 space-y-2">
            {data.legalWrapper.regulatoryFramework.map((framework, index) => (
              <Badge key={index} variant="secondary" className="mr-2">
                {framework}
              </Badge>
            ))}
          </div>
        </div>

        <div>
          <h4 className="font-medium mb-3">Documents</h4>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Legal Opinion:</span>
              <span>{data.legalWrapper.legalOpinion ? 'Uploaded' : 'Missing'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Compliance Docs:</span>
              <span>{data.legalWrapper.complianceDocuments.length} uploaded</span>
            </div>
          </div>

          {data.legalWrapper.complianceDocuments.length > 0 && (
            <div className="mt-3 space-y-2">
              {data.legalWrapper.complianceDocuments.map((doc, index) => (
                <div key={index} className="flex items-center gap-2 text-sm">
                  <FileText className="h-4 w-4 text-muted-foreground" />
                  <span>{doc.name}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const renderTokenTerms = () => (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h4 className="font-medium mb-3">Token Information</h4>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Token Name:</span>
              <span>{data.tokenTerms.tokenName || 'Not set'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Token Symbol:</span>
              <span>{data.tokenTerms.tokenSymbol || 'Not set'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Total Supply:</span>
              <span>{data.tokenTerms.totalSupply.toLocaleString() || 'Not set'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Initial Price:</span>
              <span>{formatCurrency(data.tokenTerms.initialPrice)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Total Value:</span>
              <span className="font-medium">
                {formatCurrency(data.tokenTerms.totalSupply * data.tokenTerms.initialPrice)}
              </span>
            </div>
          </div>
        </div>

        <div>
          <h4 className="font-medium mb-3">Restrictions & Rules</h4>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Lockup Period:</span>
              <span>{getLockupPeriodLabel(data.tokenTerms.lockupPeriod)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Transfer Restrictions:</span>
              <span>{data.tokenTerms.transferRestrictions.length} selected</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Compliance Rules:</span>
              <span>{data.tokenTerms.complianceRules.length} selected</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">KYC Required:</span>
              <span>{data.tokenTerms.kycRequired ? 'Yes' : 'No'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">AML Required:</span>
              <span>{data.tokenTerms.amlRequired ? 'Yes' : 'No'}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderAIPricing = () => (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h4 className="font-medium mb-3">AI Assessment</h4>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">AI Valuation:</span>
              <span className="font-medium">{formatCurrency(data.pricingAI.aiValuation)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Risk Score:</span>
              <Badge 
                variant="outline" 
                className={`${getRiskScoreColor(data.pricingAI.riskScore)}`}
              >
                {data.pricingAI.riskScore} - {getRiskScoreLabel(data.pricingAI.riskScore)}
              </Badge>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Yield Forecast:</span>
              <span className="font-medium">{data.pricingAI.yieldForecast}%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">AI Confidence:</span>
              <span className="font-medium">{data.pricingAI.aiConfidence}%</span>
            </div>
          </div>
        </div>

        <div>
          <h4 className="font-medium mb-3">Cashflow Summary</h4>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Total Cashflows:</span>
              <span>{data.pricingAI.cashflows.length}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Total Value:</span>
              <span className="font-medium">
                {formatCurrency(data.pricingAI.cashflows.reduce((sum, cf) => sum + cf.amount, 0))}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Monthly Average:</span>
              <span className="font-medium">
                {formatCurrency(data.pricingAI.cashflows.reduce((sum, cf) => sum + cf.amount, 0) / 12)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {data.pricingAI.marketAnalysis && (
        <div>
          <h4 className="font-medium mb-3">Market Analysis</h4>
          <p className="text-sm text-muted-foreground bg-muted p-3 rounded-lg">
            {data.pricingAI.marketAnalysis}
          </p>
        </div>
      )}
    </div>
  );

  const renderOfferingSetup = () => (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h4 className="font-medium mb-3">Investment Terms</h4>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Minimum Ticket:</span>
              <span className="font-medium">{formatCurrency(data.offeringSetup.minimumTicket)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Maximum Ticket:</span>
              <span className="font-medium">{formatCurrency(data.offeringSetup.maximumTicket)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Investment Range:</span>
              <span className="font-medium">
                {formatCurrency(data.offeringSetup.maximumTicket - data.offeringSetup.minimumTicket)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Lockup Period:</span>
              <span>{getLockupPeriodLabel(data.offeringSetup.lockupPeriod)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Distribution:</span>
              <span>{data.offeringSetup.distributionSchedule || 'Not set'}</span>
            </div>
          </div>
        </div>

        <div>
          <h4 className="font-medium mb-3">Compliance Requirements</h4>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">KYC Requirements:</span>
              <span>{data.offeringSetup.kycRequirements.length} selected</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">AML Requirements:</span>
              <span>{data.offeringSetup.amlRequirements.length} selected</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Accredited Only:</span>
              <span>{data.offeringSetup.accreditedInvestorOnly ? 'Yes' : 'No'}</span>
            </div>
          </div>

          <div className="mt-3 space-y-2">
            <h5 className="font-medium text-xs">KYC Requirements:</h5>
            <div className="flex flex-wrap gap-1">
              {data.offeringSetup.kycRequirements.map((req, index) => (
                <Badge key={index} variant="outline" className="text-xs">
                  {req}
                </Badge>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderSection = () => {
    switch (activeSection) {
      case 'overview':
        return renderOverview();
      case 'asset':
        return renderAssetDetails();
      case 'legal':
        return renderLegalCompliance();
      case 'token':
        return renderTokenTerms();
      case 'ai':
        return renderAIPricing();
      case 'offering':
        return renderOfferingSetup();
      default:
        return renderOverview();
    }
  };

  const canLaunch = () => {
    return (
      data.assetBasics.name &&
      data.assetBasics.description &&
      data.assetBasics.assetType &&
      data.assetBasics.sector &&
      data.assetBasics.location &&
      data.assetBasics.documents.length > 0 &&
      data.assetBasics.estimatedValue > 0 &&
      data.legalWrapper.jurisdiction &&
      data.legalWrapper.regulatoryFramework.length > 0 &&
      data.legalWrapper.legalOpinion &&
      data.tokenTerms.tokenName &&
      data.tokenTerms.tokenSymbol &&
      data.tokenTerms.totalSupply > 0 &&
      data.tokenTerms.initialPrice > 0 &&
      data.pricingAI.cashflows.length > 0 &&
      data.pricingAI.aiValuation > 0 &&
      data.pricingAI.riskScore > 0 &&
      data.offeringSetup.minimumTicket > 0 &&
      data.offeringSetup.maximumTicket > data.offeringSetup.minimumTicket &&
      data.offeringSetup.kycRequirements.length > 0
    );
  };

  return (
    <div className="space-y-6">
      {/* Launch Status */}
      <Card className="bg-gradient-to-r from-green-50 to-blue-50 border-green-200">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2 text-green-800">
            <Rocket className="h-6 w-6" />
            Ready to Launch
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-green-800 mb-4">
            Your asset has been configured and is ready for launch. Upon launch, the system will:
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <span>Save configuration to database</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <span>Deploy smart contracts</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <span>Create primary offering</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Navigation Tabs */}
      <div className="border rounded-lg">
        <div className="flex overflow-x-auto">
          {sections.map((section) => {
            const IconComponent = section.icon;
            return (
              <button
                key={section.id}
                onClick={() => setActiveSection(section.id)}
                className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-r last:border-r-0 transition-colors ${
                  activeSection === section.id
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-background hover:bg-muted'
                }`}
              >
                <IconComponent className="h-4 w-4" />
                {section.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Section Content */}
      <Card>
        <CardContent className="pt-6">
          {renderSection()}
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex justify-between items-center">
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export Configuration
          </Button>
          <Button variant="outline" size="sm">
            <Eye className="h-4 w-4 mr-2" />
            Preview Offering
          </Button>
        </div>

        <Button
          onClick={onLaunch}
          disabled={!canLaunch() || isLoading}
          size="lg"
          className="bg-green-600 hover:bg-green-700"
        >
          <Rocket className="h-5 w-5 mr-2" />
          {isLoading ? 'Launching...' : 'Launch Asset'}
        </Button>
      </div>

      {/* Launch Requirements */}
      {!canLaunch() && (
        <Card className="bg-yellow-50 border-yellow-200">
          <CardHeader>
            <CardTitle className="text-sm flex items-center gap-2 text-yellow-800">
              <AlertTriangle className="h-4 w-4" />
              Launch Requirements Not Met
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-yellow-800 mb-3">
              Please complete all required fields before launching your asset:
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
              {!data.assetBasics.name && <span className="text-red-600">• Asset Name</span>}
              {!data.assetBasics.description && <span className="text-red-600">• Asset Description</span>}
              {!data.assetBasics.assetType && <span className="text-red-600">• Asset Type</span>}
              {!data.legalWrapper.jurisdiction && <span className="text-red-600">• Jurisdiction</span>}
              {!data.tokenTerms.tokenName && <span className="text-red-600">• Token Name</span>}
              {!data.offeringSetup.minimumTicket && <span className="text-red-600">• Minimum Ticket</span>}
              {data.offeringSetup.kycRequirements.length === 0 && <span className="text-red-600">• KYC Requirements</span>}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

