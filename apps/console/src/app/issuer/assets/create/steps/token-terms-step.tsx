'use client';

import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Shield, Lock, Users, AlertTriangle, CheckCircle, X } from 'lucide-react';
import { TokenTerms } from '../hooks/use-asset-creation-wizard';

interface TokenTermsStepProps {
  wizard: {
    data: { tokenTerms: TokenTerms };
    updateTokenTerms: (updates: Partial<TokenTerms>) => void;
  };
}

const TRANSFER_RESTRICTIONS = [
  'Lockup Period',
  'Accredited Investor Only',
  'Geographic Restrictions',
  'Holding Period',
  'Transfer Limits',
  'Compliance Checks',
  'KYC Required',
  'AML Screening',
];

const COMPLIANCE_RULES = [
  'Regulatory Compliance',
  'KYC Verification',
  'AML Screening',
  'Sanctions Check',
  'Transfer Limits',
  'Geographic Restrictions',
  'Accredited Investor Verification',
  'Lockup Period Enforcement',
];

const LOCKUP_PERIODS = [
  { value: 0, label: 'No Lockup' },
  { value: 30, label: '30 Days' },
  { value: 90, label: '90 Days' },
  { value: 180, label: '6 Months' },
  { value: 365, label: '1 Year' },
  { value: 730, label: '2 Years' },
  { value: 1095, label: '3 Years' },
  { value: 1825, label: '5 Years' },
];

export function TokenTermsStep({ wizard }: TokenTermsStepProps) {
  const { data, updateTokenTerms } = wizard;
  const [newRestriction, setNewRestriction] = useState('');
  const [newComplianceRule, setNewComplianceRule] = useState('');

  const handleTransferRestrictionToggle = (restriction: string) => {
    const current = data.tokenTerms.transferRestrictions;
    const updated = current.includes(restriction)
      ? current.filter(r => r !== restriction)
      : [...current, restriction];
    
    updateTokenTerms({ transferRestrictions: updated });
  };

  const handleComplianceRuleToggle = (rule: string) => {
    const current = data.tokenTerms.complianceRules;
    const updated = current.includes(rule)
      ? current.filter(r => r !== rule)
      : [...current, rule];
    
    updateTokenTerms({ complianceRules: updated });
  };

  const addCustomRestriction = () => {
    if (newRestriction.trim() && !data.tokenTerms.transferRestrictions.includes(newRestriction.trim())) {
      updateTokenTerms({
        transferRestrictions: [...data.tokenTerms.transferRestrictions, newRestriction.trim()]
      });
      setNewRestriction('');
    }
  };

  const addCustomComplianceRule = () => {
    if (newComplianceRule.trim() && !data.tokenTerms.complianceRules.includes(newComplianceRule.trim())) {
      updateTokenTerms({
        complianceRules: [...data.tokenTerms.complianceRules, newComplianceRule.trim()]
      });
      setNewComplianceRule('');
    }
  };

  const removeCustomRestriction = (restriction: string) => {
    updateTokenTerms({
      transferRestrictions: data.tokenTerms.transferRestrictions.filter(r => r !== restriction)
    });
  };

  const removeCustomComplianceRule = (rule: string) => {
    updateTokenTerms({
      complianceRules: data.tokenTerms.complianceRules.filter(r => r !== rule)
    });
  };

  const calculateTotalValue = () => {
    return data.tokenTerms.totalSupply * data.tokenTerms.initialPrice;
  };

  const getTokenSymbolValidation = () => {
    const symbol = data.tokenTerms.tokenSymbol;
    if (!symbol) return { valid: false, message: 'Token symbol is required' };
    if (symbol.length < 2) return { valid: false, message: 'Token symbol must be at least 2 characters' };
    if (symbol.length > 10) return { valid: false, message: 'Token symbol must be 10 characters or less' };
    if (!/^[A-Z0-9]+$/.test(symbol)) return { valid: false, message: 'Token symbol must contain only uppercase letters and numbers' };
    return { valid: true, message: 'Token symbol is valid' };
  };

  const symbolValidation = getTokenSymbolValidation();

  return (
    <div className="space-y-6">
      {/* Token Basic Information */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="token-name">Token Name *</Label>
          <Input
            id="token-name"
            placeholder="e.g., Solar Farm Alpha Token"
            value={data.tokenTerms.tokenName}
            onChange={(e) => updateTokenTerms({ tokenName: e.target.value })}
          />
          <p className="text-sm text-muted-foreground">
            The full name of your security token
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="token-symbol">Token Symbol *</Label>
          <Input
            id="token-symbol"
            placeholder="e.g., SOLAR"
            value={data.tokenTerms.tokenSymbol}
            onChange={(e) => updateTokenTerms({ tokenSymbol: e.target.value.toUpperCase() })}
            className={symbolValidation.valid ? 'border-green-500' : 'border-red-500'}
          />
          <p className={`text-sm ${symbolValidation.valid ? 'text-green-600' : 'text-red-600'}`}>
            {symbolValidation.message}
          </p>
        </div>
      </div>

      {/* Token Supply and Pricing */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="space-y-2">
          <Label htmlFor="total-supply">Total Supply *</Label>
          <Input
            id="total-supply"
            type="number"
            placeholder="1000000"
            value={data.tokenTerms.totalSupply || ''}
            onChange={(e) => updateTokenTerms({ totalSupply: parseFloat(e.target.value) || 0 })}
          />
          <p className="text-sm text-muted-foreground">
            Total number of tokens to be issued
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="initial-price">Initial Price *</Label>
          <Input
            id="initial-price"
            type="number"
            step="0.01"
            placeholder="1.00"
            value={data.tokenTerms.initialPrice || ''}
            onChange={(e) => updateTokenTerms({ initialPrice: parseFloat(e.target.value) || 0 })}
          />
          <p className="text-sm text-muted-foreground">
            Price per token in USD
          </p>
        </div>

        <div className="space-y-2">
          <Label>Total Value</Label>
          <div className="p-3 bg-muted rounded-lg">
            <p className="text-lg font-semibold">
              ${calculateTotalValue().toLocaleString()}
            </p>
            <p className="text-sm text-muted-foreground">
              {data.tokenTerms.totalSupply.toLocaleString()} × ${data.tokenTerms.initialPrice}
            </p>
          </div>
        </div>
      </div>

      {/* Lockup Period */}
      <div className="space-y-4">
        <Label>Lockup Period</Label>
        <p className="text-sm text-muted-foreground">
          Set a lockup period to prevent immediate trading after token issuance
        </p>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {LOCKUP_PERIODS.map((period) => (
            <Button
              key={period.value}
              type="button"
              variant={data.tokenTerms.lockupPeriod === period.value ? "default" : "outline"}
              size="sm"
              onClick={() => updateTokenTerms({ lockupPeriod: period.value })}
              className="flex items-center gap-2"
            >
              <Lock className="h-4 w-4" />
              {period.label}
            </Button>
          ))}
        </div>

        {data.tokenTerms.lockupPeriod > 0 && (
          <div className="flex items-center gap-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <Lock className="h-4 w-4 text-blue-600" />
            <span className="text-sm text-blue-800">
              Tokens will be locked for {data.tokenTerms.lockupPeriod} days after issuance
            </span>
          </div>
        )}
      </div>

      {/* Transfer Restrictions */}
      <div className="space-y-4">
        <Label>Transfer Restrictions</Label>
        <p className="text-sm text-muted-foreground">
          Select the transfer restrictions that will apply to your security token
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {TRANSFER_RESTRICTIONS.map((restriction) => (
            <div key={restriction} className="flex items-center space-x-2">
              <Checkbox
                id={restriction}
                checked={data.tokenTerms.transferRestrictions.includes(restriction)}
                onCheckedChange={() => handleTransferRestrictionToggle(restriction)}
              />
              <Label htmlFor={restriction} className="text-sm cursor-pointer">
                {restriction}
              </Label>
            </div>
          ))}
        </div>

        {/* Custom Transfer Restriction */}
        <div className="flex gap-2">
          <Input
            placeholder="Add custom transfer restriction..."
            value={newRestriction}
            onChange={(e) => setNewRestriction(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && addCustomRestriction()}
          />
          <Button type="button" onClick={addCustomRestriction} size="sm">
            Add
          </Button>
        </div>

        {/* Custom Restrictions Display */}
        {data.tokenTerms.transferRestrictions.filter(r => !TRANSFER_RESTRICTIONS.includes(r)).length > 0 && (
          <div className="space-y-2">
            <Label className="text-sm">Custom Restrictions</Label>
            <div className="flex flex-wrap gap-2">
              {data.tokenTerms.transferRestrictions
                .filter(r => !TRANSFER_RESTRICTIONS.includes(r))
                .map((restriction) => (
                  <Badge key={restriction} variant="secondary" className="flex items-center gap-1">
                    {restriction}
                    <button
                      type="button"
                      onClick={() => removeCustomRestriction(restriction)}
                      className="ml-1 hover:text-destructive"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
            </div>
          </div>
        )}
      </div>

      {/* Compliance Rules */}
      <div className="space-y-4">
        <Label>Compliance Rules</Label>
        <p className="text-sm text-muted-foreground">
          Select the compliance rules that will be enforced by the smart contract
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {COMPLIANCE_RULES.map((rule) => (
            <div key={rule} className="flex items-center space-x-2">
              <Checkbox
                id={rule}
                checked={data.tokenTerms.complianceRules.includes(rule)}
                onCheckedChange={() => handleComplianceRuleToggle(rule)}
              />
              <Label htmlFor={rule} className="text-sm cursor-pointer">
                {rule}
              </Label>
            </div>
          ))}
        </div>

        {/* Custom Compliance Rule */}
        <div className="flex gap-2">
          <Input
            placeholder="Add custom compliance rule..."
            value={newComplianceRule}
            onChange={(e) => setNewComplianceRule(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && addCustomComplianceRule()}
          />
          <Button type="button" onClick={addCustomComplianceRule} size="sm">
            Add
          </Button>
        </div>

        {/* Custom Rules Display */}
        {data.tokenTerms.complianceRules.filter(r => !COMPLIANCE_RULES.includes(r)).length > 0 && (
          <div className="space-y-2">
            <Label className="text-sm">Custom Rules</Label>
            <div className="flex flex-wrap gap-2">
              {data.tokenTerms.complianceRules
                .filter(r => !COMPLIANCE_RULES.includes(r))
                .map((rule) => (
                  <Badge key={rule} variant="secondary" className="flex items-center gap-1">
                    {rule}
                    <button
                      type="button"
                      onClick={() => removeCustomComplianceRule(rule)}
                      className="ml-1 hover:text-destructive"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
            </div>
          </div>
        )}
      </div>

      {/* KYC and AML Requirements */}
      <div className="space-y-4">
        <Label>Identity Verification Requirements</Label>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="kyc-required"
              checked={data.tokenTerms.kycRequired}
              onCheckedChange={(checked) => updateTokenTerms({ kycRequired: !!checked })}
            />
            <Label htmlFor="kyc-required" className="text-sm cursor-pointer">
              KYC Required
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="aml-required"
              checked={data.tokenTerms.amlRequired}
              onCheckedChange={(checked) => updateTokenTerms({ amlRequired: !!checked })}
            />
            <Label htmlFor="aml-required" className="text-sm cursor-pointer">
              AML Screening Required
            </Label>
          </div>
        </div>
      </div>

      {/* ERC-3643 Compliance Summary */}
      <Card className="bg-blue-50 border-blue-200">
        <CardHeader>
          <CardTitle className="text-sm flex items-center gap-2 text-blue-800">
            <Shield className="h-4 w-4" />
            ERC-3643 Compliance Features
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <span>Transfer Restrictions</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <span>Compliance Engine Integration</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <span>KYC/AML Support</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <span>Lockup Periods</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Validation Summary */}
      <Card className="bg-muted/30">
        <CardHeader>
          <CardTitle className="text-sm">Validation Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${
                data.tokenTerms.tokenName ? 'bg-green-500' : 'bg-red-500'
              }`} />
              <span>Token Name</span>
            </div>
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${
                symbolValidation.valid ? 'bg-green-500' : 'bg-red-500'
              }`} />
              <span>Token Symbol</span>
            </div>
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${
                data.tokenTerms.totalSupply > 0 ? 'bg-green-500' : 'bg-red-500'
              }`} />
              <span>Total Supply</span>
            </div>
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${
                data.tokenTerms.initialPrice > 0 ? 'bg-green-500' : 'bg-red-500'
              }`} />
              <span>Initial Price</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

