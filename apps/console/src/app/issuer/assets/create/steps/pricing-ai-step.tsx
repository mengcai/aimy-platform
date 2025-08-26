'use client';

import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Plus, X, TrendingUp, Brain, Calculator, Calendar, DollarSign } from 'lucide-react';
import { PricingAI, Cashflow } from '../hooks/use-asset-creation-wizard';

interface PricingAIStepProps {
  wizard: {
    data: { pricingAI: PricingAI };
    updatePricingAI: (updates: Partial<PricingAI>) => void;
    addCashflow: (cashflow: Cashflow) => void;
    removeCashflow: (index: number) => void;
  };
}

const CASHFLOW_TYPES = [
  { value: 'revenue', label: 'Revenue', icon: TrendingUp },
  { value: 'dividend', label: 'Dividend', icon: DollarSign },
  { value: 'interest', label: 'Interest', icon: Calculator },
  { value: 'rental', label: 'Rental', icon: Calendar },
  { value: 'other', label: 'Other', icon: TrendingUp },
];

export function PricingAIStep({ wizard }: PricingAIStepProps) {
  const { data, updatePricingAI, addCashflow, removeCashflow } = wizard;
  const [newCashflow, setNewCashflow] = useState<Partial<Cashflow>>({
    date: '',
    amount: 0,
    type: 'revenue',
    description: '',
  });

  const handleAddCashflow = () => {
    if (newCashflow.date && newCashflow.amount && newCashflow.description) {
      addCashflow(newCashflow as Cashflow);
      setNewCashflow({
        date: '',
        amount: 0,
        type: 'revenue',
        description: '',
      });
    }
  };

  const handleRemoveCashflow = (index: number) => {
    removeCashflow(index);
  };

  const calculateTotalCashflows = () => {
    return data.pricingAI.cashflows.reduce((total, cf) => total + cf.amount, 0);
  };

  const calculateAverageMonthlyCashflow = () => {
    if (data.pricingAI.cashflows.length === 0) return 0;
    const total = calculateTotalCashflows();
    return total / 12; // Assuming 12 months for simplicity
  };

  const getCashflowTypeIcon = (type: string) => {
    const cashflowType = CASHFLOW_TYPES.find(t => t.value === type);
    return cashflowType ? cashflowType.icon : TrendingUp;
  };

  const getCashflowTypeLabel = (type: string) => {
    const cashflowType = CASHFLOW_TYPES.find(t => t.value === type);
    return cashflowType ? cashflowType.label : 'Other';
  };

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

  const getAIConfidenceColor = (confidence: number) => {
    if (confidence >= 80) return 'text-green-600 bg-green-100';
    if (confidence >= 60) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  const getAIConfidenceLabel = (confidence: number) => {
    if (confidence >= 80) return 'High Confidence';
    if (confidence >= 60) return 'Medium Confidence';
    return 'Low Confidence';
  };

  return (
    <div className="space-y-6">
      {/* Cashflow Projections */}
      <div className="space-y-4">
        <Label>Cashflow Projections *</Label>
        <p className="text-sm text-muted-foreground">
          Add projected cashflows for the next 12 months. This data will be used by AI models for valuation and risk assessment.
        </p>

        {/* Add New Cashflow */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Add New Cashflow</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="space-y-2">
                <Label htmlFor="cashflow-date">Date</Label>
                <Input
                  id="cashflow-date"
                  type="date"
                  value={newCashflow.date}
                  onChange={(e) => setNewCashflow({ ...newCashflow, date: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="cashflow-amount">Amount (USD)</Label>
                <Input
                  id="cashflow-amount"
                  type="number"
                  placeholder="10000"
                  value={newCashflow.amount || ''}
                  onChange={(e) => setNewCashflow({ ...newCashflow, amount: parseFloat(e.target.value) || 0 })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="cashflow-type">Type</Label>
                <Select
                  value={newCashflow.type}
                  onValueChange={(value) => setNewCashflow({ ...newCashflow, type: value as any })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CASHFLOW_TYPES.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="cashflow-description">Description</Label>
                <Input
                  id="cashflow-description"
                  placeholder="e.g., Monthly rental income"
                  value={newCashflow.description}
                  onChange={(e) => setNewCashflow({ ...newCashflow, description: e.target.value })}
                />
              </div>
            </div>

            <Button
              type="button"
              onClick={handleAddCashflow}
              disabled={!newCashflow.date || !newCashflow.amount || !newCashflow.description}
              className="mt-4"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Cashflow
            </Button>
          </CardContent>
        </Card>

        {/* Cashflow Summary */}
        {data.pricingAI.cashflows.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Cashflow Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div className="text-center p-3 bg-muted rounded-lg">
                  <p className="text-2xl font-bold text-primary">
                    {data.pricingAI.cashflows.length}
                  </p>
                  <p className="text-sm text-muted-foreground">Total Cashflows</p>
                </div>
                <div className="text-center p-3 bg-muted rounded-lg">
                  <p className="text-2xl font-bold text-green-600">
                    {formatCurrency(calculateTotalCashflows())}
                  </p>
                  <p className="text-sm text-muted-foreground">Total Value</p>
                </div>
                <div className="text-center p-3 bg-muted rounded-lg">
                  <p className="text-2xl font-bold text-blue-600">
                    {formatCurrency(calculateAverageMonthlyCashflow())}
                  </p>
                  <p className="text-sm text-muted-foreground">Monthly Average</p>
                </div>
              </div>

              <div className="space-y-2">
                {data.pricingAI.cashflows.map((cashflow, index) => {
                  const IconComponent = getCashflowTypeIcon(cashflow.type);
                  return (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 bg-muted rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <IconComponent className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="font-medium text-sm">
                            {new Date(cashflow.date).toLocaleDateString()} - {getCashflowTypeLabel(cashflow.type)}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {cashflow.description}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="font-semibold text-green-600">
                          {formatCurrency(cashflow.amount)}
                        </span>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveCashflow(index)}
                          className="text-destructive hover:text-destructive"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* AI Valuation Inputs */}
      <div className="space-y-4">
        <Label>AI Valuation & Risk Assessment</Label>
        <p className="text-sm text-muted-foreground">
          Configure AI model inputs for automated valuation and risk assessment. These values will be used to generate
          AI-powered insights for investors.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="ai-valuation">AI Valuation (USD)</Label>
            <Input
              id="ai-valuation"
              type="number"
              placeholder="1000000"
              value={data.pricingAI.aiValuation || ''}
              onChange={(e) => updatePricingAI({ aiValuation: parseFloat(e.target.value) || 0 })}
            />
            <p className="text-sm text-muted-foreground">
              AI-generated valuation based on cashflows and market data
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="risk-score">Risk Score (1-100)</Label>
            <Input
              id="risk-score"
              type="number"
              min="1"
              max="100"
              placeholder="45"
              value={data.pricingAI.riskScore || ''}
              onChange={(e) => updatePricingAI({ riskScore: parseFloat(e.target.value) || 0 })}
            />
            <p className="text-sm text-muted-foreground">
              AI-assessed risk score (lower = lower risk)
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="yield-forecast">Yield Forecast (%)</Label>
            <Input
              id="yield-forecast"
              type="number"
              step="0.1"
              placeholder="8.5"
              value={data.pricingAI.yieldForecast || ''}
              onChange={(e) => updatePricingAI({ yieldForecast: parseFloat(e.target.value) || 0 })}
            />
            <p className="text-sm text-muted-foreground">
              Expected annual yield based on cashflow projections
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="ai-confidence">AI Confidence (%)</Label>
            <Input
              id="ai-confidence"
              type="number"
              min="1"
              max="100"
              placeholder="85"
              value={data.pricingAI.aiConfidence || ''}
              onChange={(e) => updatePricingAI({ aiConfidence: parseFloat(e.target.value) || 0 })}
            />
            <p className="text-sm text-muted-foreground">
              AI model confidence in its assessment
            </p>
          </div>
        </div>
      </div>

      {/* Market Analysis */}
      <div className="space-y-4">
        <Label htmlFor="market-analysis">Market Analysis</Label>
        <Textarea
          id="market-analysis"
          placeholder="Provide market analysis, sector trends, competitive landscape, and other factors that may affect the asset's performance..."
          rows={4}
          value={data.pricingAI.marketAnalysis}
          onChange={(e) => updatePricingAI({ marketAnalysis: e.target.value })}
        />
        <p className="text-sm text-muted-foreground">
          This analysis will be used by AI models to enhance valuation accuracy and provide market context to investors.
        </p>
      </div>

      {/* AI Insights Preview */}
      <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
        <CardHeader>
          <CardTitle className="text-sm flex items-center gap-2 text-blue-800">
            <Brain className="h-4 w-4" />
            AI Insights Preview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Valuation</span>
                <Badge variant="outline" className="font-mono">
                  {formatCurrency(data.pricingAI.aiValuation)}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Risk Level</span>
                <Badge 
                  variant="outline" 
                  className={`${getRiskScoreColor(data.pricingAI.riskScore)}`}
                >
                  {getRiskScoreLabel(data.pricingAI.riskScore)}
                </Badge>
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Yield Forecast</span>
                <Badge variant="outline" className="font-mono">
                  {data.pricingAI.yieldForecast}%
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">AI Confidence</span>
                <Badge 
                  variant="outline" 
                  className={`${getAIConfidenceColor(data.pricingAI.aiConfidence)}`}
                >
                  {getAIConfidenceLabel(data.pricingAI.aiConfidence)}
                </Badge>
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
                data.pricingAI.cashflows.length > 0 ? 'bg-green-500' : 'bg-red-500'
              }`} />
              <span>Cashflows</span>
            </div>
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${
                data.pricingAI.aiValuation > 0 ? 'bg-green-500' : 'bg-red-500'
              }`} />
              <span>AI Valuation</span>
            </div>
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${
                data.pricingAI.riskScore > 0 ? 'bg-green-500' : 'bg-red-500'
              }`} />
              <span>Risk Score</span>
            </div>
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${
                data.pricingAI.marketAnalysis ? 'bg-green-500' : 'bg-red-500'
              }`} />
              <span>Market Analysis</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
