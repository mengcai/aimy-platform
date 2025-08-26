'use client';

import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, X, Users, Shield, Lock, Calendar, DollarSign, Target } from 'lucide-react';
import { OfferingSetup } from '../hooks/use-asset-creation-wizard';

interface OfferingSetupStepProps {
  wizard: {
    data: { offeringSetup: OfferingSetup };
    updateOfferingSetup: (updates: Partial<OfferingSetup>) => void;
  };
}

const KYC_REQUIREMENTS = [
  'Identity Verification',
  'Address Verification',
  'Income Verification',
  'Employment Verification',
  'Source of Funds',
  'Tax Identification',
  'Bank Account Verification',
  'Investment Experience',
  'Risk Tolerance Assessment',
  'Political Exposure Check',
];

const AML_REQUIREMENTS = [
  'Sanctions Screening',
  'PEP Screening',
  'Adverse Media Check',
  'Transaction Monitoring',
  'Suspicious Activity Reporting',
  'Enhanced Due Diligence',
  'Risk-Based Assessment',
  'Ongoing Monitoring',
];

const DISTRIBUTION_SCHEDULES = [
  'Monthly',
  'Quarterly',
  'Semi-Annually',
  'Annually',
  'Upon Sale',
  'Custom Schedule',
];

export function OfferingSetupStep({ wizard }: OfferingSetupStepProps) {
  const { data, updateOfferingSetup } = wizard;
  const [newKYCRequirement, setNewKYCRequirement] = useState('');
  const [newAMLRequirement, setNewAMLRequirement] = useState('');

  const handleKYCRequirementToggle = (requirement: string) => {
    const current = data.offeringSetup.kycRequirements;
    const updated = current.includes(requirement)
      ? current.filter(r => r !== requirement)
      : [...current, requirement];
    
    updateOfferingSetup({ kycRequirements: updated });
  };

  const handleAMLRequirementToggle = (requirement: string) => {
    const current = data.offeringSetup.amlRequirements;
    const updated = current.includes(requirement)
      ? current.filter(r => r !== requirement)
      : [...current, requirement];
    
    updateOfferingSetup({ amlRequirements: updated });
  };

  const addCustomKYCRequirement = () => {
    if (newKYCRequirement.trim() && !data.offeringSetup.kycRequirements.includes(newKYCRequirement.trim())) {
      updateOfferingSetup({
        kycRequirements: [...data.offeringSetup.kycRequirements, newKYCRequirement.trim()]
      });
      setNewKYCRequirement('');
    }
  };

  const addCustomAMLRequirement = () => {
    if (newAMLRequirement.trim() && !data.offeringSetup.amlRequirements.includes(newAMLRequirement.trim())) {
      updateOfferingSetup({
        amlRequirements: [...data.offeringSetup.amlRequirements, newAMLRequirement.trim()]
      });
      setNewAMLRequirement('');
    }
  };

  const removeCustomKYCRequirement = (requirement: string) => {
    updateOfferingSetup({
      kycRequirements: data.offeringSetup.kycRequirements.filter(r => r !== requirement)
    });
  };

  const removeCustomAMLRequirement = (requirement: string) => {
    updateOfferingSetup({
      amlRequirements: data.offeringSetup.amlRequirements.filter(r => r !== requirement)
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const calculateInvestmentRange = () => {
    const min = data.offeringSetup.minimumTicket;
    const max = data.offeringSetup.maximumTicket;
    return { min, max, range: max - min };
  };

  const getLockupPeriodLabel = (days: number) => {
    if (days === 0) return 'No Lockup';
    if (days < 30) return `${days} Days`;
    if (days < 365) return `${Math.round(days / 30)} Months`;
    return `${Math.round(days / 365)} Years`;
  };

  return (
    <div className="space-y-6">
      {/* Investment Ticket Sizes */}
      <div className="space-y-4">
        <Label>Investment Ticket Sizes *</Label>
        <p className="text-sm text-muted-foreground">
          Set the minimum and maximum investment amounts for individual investors.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="minimum-ticket">Minimum Ticket Size (USD) *</Label>
            <Input
              id="minimum-ticket"
              type="number"
              placeholder="10000"
              value={data.offeringSetup.minimumTicket || ''}
              onChange={(e) => updateOfferingSetup({ minimumTicket: parseFloat(e.target.value) || 0 })}
            />
            <p className="text-sm text-muted-foreground">
              Minimum amount an investor can invest
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="maximum-ticket">Maximum Ticket Size (USD) *</Label>
            <Input
              id="maximum-ticket"
              type="number"
              placeholder="1000000"
              value={data.offeringSetup.maximumTicket || ''}
              onChange={(e) => updateOfferingSetup({ maximumTicket: parseFloat(e.target.value) || 0 })}
            />
            <p className="text-sm text-muted-foreground">
              Maximum amount an investor can invest
            </p>
          </div>
        </div>

        {/* Investment Range Summary */}
        {data.offeringSetup.minimumTicket > 0 && data.offeringSetup.maximumTicket > 0 && (
          <Card className="bg-muted/30">
            <CardContent className="pt-6">
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <p className="text-2xl font-bold text-green-600">
                    {formatCurrency(calculateInvestmentRange().min)}
                  </p>
                  <p className="text-sm text-muted-foreground">Minimum</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-blue-600">
                    {formatCurrency(calculateInvestmentRange().range)}
                  </p>
                  <p className="text-sm text-muted-foreground">Range</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-purple-600">
                    {formatCurrency(calculateInvestmentRange().max)}
                  </p>
                  <p className="text-sm text-muted-foreground">Maximum</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Lockup Period */}
      <div className="space-y-4">
        <Label>Investment Lockup Period</Label>
        <p className="text-sm text-muted-foreground">
          Set how long investors must hold their tokens before they can transfer or sell them.
        </p>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[0, 30, 90, 180, 365, 730, 1095, 1825].map((days) => (
            <Button
              key={days}
              type="button"
              variant={data.offeringSetup.lockupPeriod === days ? "default" : "outline"}
              size="sm"
              onClick={() => updateOfferingSetup({ lockupPeriod: days })}
              className="flex items-center gap-2"
            >
              <Lock className="h-4 w-4" />
              {getLockupPeriodLabel(days)}
            </Button>
          ))}
        </div>

        {data.offeringSetup.lockupPeriod > 0 && (
          <div className="flex items-center gap-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <Lock className="h-4 w-4 text-blue-600" />
            <span className="text-sm text-blue-800">
              Investors must hold tokens for {getLockupPeriodLabel(data.offeringSetup.lockupPeriod).toLowerCase()} after purchase
            </span>
          </div>
        )}
      </div>

      {/* Distribution Schedule */}
      <div className="space-y-4">
        <Label htmlFor="distribution-schedule">Distribution Schedule</Label>
        <Select
          value={data.offeringSetup.distributionSchedule}
          onValueChange={(value) => updateOfferingSetup({ distributionSchedule: value })}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select distribution schedule" />
          </SelectTrigger>
          <SelectContent>
            {DISTRIBUTION_SCHEDULES.map((schedule) => (
              <SelectItem key={schedule} value={schedule}>
                {schedule}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <p className="text-sm text-muted-foreground">
          How often will investors receive distributions from the asset?
        </p>
      </div>

      {/* KYC Requirements */}
      <div className="space-y-4">
        <Label>KYC Requirements *</Label>
        <p className="text-sm text-muted-foreground">
          Select the Know Your Customer requirements that investors must complete.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {KYC_REQUIREMENTS.map((requirement) => (
            <div key={requirement} className="flex items-center space-x-2">
              <Checkbox
                id={requirement}
                checked={data.offeringSetup.kycRequirements.includes(requirement)}
                onCheckedChange={() => handleKYCRequirementToggle(requirement)}
              />
              <Label htmlFor={requirement} className="text-sm cursor-pointer">
                {requirement}
              </Label>
            </div>
          ))}
        </div>

        {/* Custom KYC Requirement */}
        <div className="flex gap-2">
          <Input
            placeholder="Add custom KYC requirement..."
            value={newKYCRequirement}
            onChange={(e) => setNewKYCRequirement(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && addCustomKYCRequirement()}
          />
          <Button type="button" onClick={addCustomKYCRequirement} size="sm">
            Add
          </Button>
        </div>

        {/* Custom KYC Requirements Display */}
        {data.offeringSetup.kycRequirements.filter(r => !KYC_REQUIREMENTS.includes(r)).length > 0 && (
          <div className="space-y-2">
            <Label className="text-sm">Custom KYC Requirements</Label>
            <div className="flex flex-wrap gap-2">
              {data.offeringSetup.kycRequirements
                .filter(r => !KYC_REQUIREMENTS.includes(r))
                .map((requirement) => (
                  <Badge key={requirement} variant="secondary" className="flex items-center gap-1">
                    {requirement}
                    <button
                      type="button"
                      onClick={() => removeCustomKYCRequirement(requirement)}
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

      {/* AML Requirements */}
      <div className="space-y-4">
        <Label>AML Requirements</Label>
        <p className="text-sm text-muted-foreground">
          Select the Anti-Money Laundering requirements that will be enforced.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {AML_REQUIREMENTS.map((requirement) => (
            <div key={requirement} className="flex items-center space-x-2">
              <Checkbox
                id={requirement}
                checked={data.offeringSetup.amlRequirements.includes(requirement)}
                onCheckedChange={() => handleAMLRequirementToggle(requirement)}
              />
              <Label htmlFor={requirement} className="text-sm cursor-pointer">
                {requirement}
              </Label>
            </div>
          ))}
        </div>

        {/* Custom AML Requirement */}
        <div className="flex gap-2">
          <Input
            placeholder="Add custom AML requirement..."
            value={newAMLRequirement}
            onChange={(e) => setNewAMLRequirement(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && addCustomAMLRequirement()}
          />
          <Button type="button" onClick={addCustomAMLRequirement} size="sm">
            Add
          </Button>
        </div>

        {/* Custom AML Requirements Display */}
        {data.offeringSetup.amlRequirements.filter(r => !AML_REQUIREMENTS.includes(r)).length > 0 && (
          <div className="space-y-2">
            <Label className="text-sm">Custom AML Requirements</Label>
            <div className="flex flex-wrap gap-2">
              {data.offeringSetup.amlRequirements
                .filter(r => !AML_REQUIREMENTS.includes(r))
                .map((requirement) => (
                  <Badge key={requirement} variant="secondary" className="flex items-center gap-1">
                    {requirement}
                    <button
                      type="button"
                      onClick={() => removeCustomAMLRequirement(requirement)}
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

      {/* Investor Restrictions */}
      <div className="space-y-4">
        <Label>Investor Restrictions</Label>
        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="accredited-investor-only"
              checked={data.offeringSetup.accreditedInvestorOnly}
              onCheckedChange={(checked) => updateOfferingSetup({ accreditedInvestorOnly: !!checked })}
            />
            <Label htmlFor="accredited-investor-only" className="text-sm cursor-pointer">
              Accredited Investors Only
            </Label>
          </div>
          
          {data.offeringSetup.accreditedInvestorOnly && (
            <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-sm text-yellow-800">
                <Shield className="h-4 w-4 inline mr-2" />
                This offering will be restricted to accredited investors only, which may limit your investor pool
                but provides certain regulatory benefits.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Offering Summary */}
      <Card className="bg-gradient-to-r from-green-50 to-blue-50 border-green-200">
        <CardHeader>
          <CardTitle className="text-sm flex items-center gap-2 text-green-800">
            <Target className="h-4 w-4" />
            Offering Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Investment Range:</span>
                <span className="font-medium">
                  {data.offeringSetup.minimumTicket > 0 && data.offeringSetup.maximumTicket > 0
                    ? `${formatCurrency(data.offeringSetup.minimumTicket)} - ${formatCurrency(data.offeringSetup.maximumTicket)}`
                    : 'Not set'
                  }
                </span>
              </div>
              <div className="flex justify-between">
                <span>Lockup Period:</span>
                <span className="font-medium">
                  {getLockupPeriodLabel(data.offeringSetup.lockupPeriod)}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Distribution:</span>
                <span className="font-medium">
                  {data.offeringSetup.distributionSchedule || 'Not set'}
                </span>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>KYC Requirements:</span>
                <span className="font-medium">
                  {data.offeringSetup.kycRequirements.length} selected
                </span>
              </div>
              <div className="flex justify-between">
                <span>AML Requirements:</span>
                <span className="font-medium">
                  {data.offeringSetup.amlRequirements.length} selected
                </span>
              </div>
              <div className="flex justify-between">
                <span>Investor Type:</span>
                <span className="font-medium">
                  {data.offeringSetup.accreditedInvestorOnly ? 'Accredited Only' : 'All Investors'}
                </span>
              </div>
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
                data.offeringSetup.minimumTicket > 0 ? 'bg-green-500' : 'bg-red-500'
              }`} />
              <span>Min Ticket</span>
            </div>
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${
                data.offeringSetup.maximumTicket > data.offeringSetup.minimumTicket ? 'bg-green-500' : 'bg-red-500'
              }`} />
              <span>Max Ticket</span>
            </div>
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${
                data.offeringSetup.kycRequirements.length > 0 ? 'bg-green-500' : 'bg-red-500'
              }`} />
              <span>KYC Requirements</span>
            </div>
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${
                data.offeringSetup.distributionSchedule ? 'bg-green-500' : 'bg-red-500'
              }`} />
              <span>Distribution</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

