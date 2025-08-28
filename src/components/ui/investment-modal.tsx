'use client';

import React, { useState } from 'react';
import { X, AlertCircle, TrendingUp, DollarSign, Shield } from 'lucide-react';
import { Button } from './button';
import { Input } from './input';
import { Badge } from './badge';
import { Asset } from '../../types';
import { formatCurrency, formatNumber, getRiskLevelColor, getStatusColor } from '../../lib/utils';

interface InvestmentModalProps {
  isOpen: boolean;
  asset: Asset | null;
  onClose: () => void;
  onSubmit: (amount: number) => Promise<void>;
}

export function InvestmentModal({ isOpen, asset, onClose, onSubmit }: InvestmentModalProps) {
  const [amount, setAmount] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen || !asset) return null;

  const handleSubmit = async () => {
    const investmentAmount = parseFloat(amount);
    
    // Validation
    if (!investmentAmount || investmentAmount <= 0) {
      setError('Please enter a valid investment amount');
      return;
    }

    if (investmentAmount < asset.minInvestment) {
      setError(`Minimum investment is ${formatCurrency(asset.minInvestment)}`);
      return;
    }

    if (investmentAmount > asset.maxInvestment) {
      setError(`Maximum investment is ${formatCurrency(asset.maxInvestment)}`);
      return;
    }

    if (investmentAmount > asset.remainingTokens) {
      setError(`Investment exceeds available supply of ${formatNumber(asset.remainingTokens)} tokens`);
      return;
    }

    setError('');
    setIsSubmitting(true);

    try {
      await onSubmit(investmentAmount);
      onClose();
    } catch (error) {
      setError('Investment failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setAmount('');
    setError('');
    setIsSubmitting(false);
    onClose();
  };

  const calculateTokens = (investmentAmount: number) => {
    if (!investmentAmount || asset.value === 0) return 0;
    return Math.floor((investmentAmount / asset.value) * asset.tokens);
  };

  const estimatedTokens = calculateTokens(parseFloat(amount) || 0);
  const estimatedYield = ((parseFloat(amount) || 0) * asset.yield) / 100;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-full max-w-md shadow-lg rounded-md bg-white">
        <div className="mt-3">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900">
              Invest in {asset.name}
            </h3>
            <button
              onClick={handleClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Asset Info */}
          <div className="mb-4 p-3 bg-gray-50 rounded-lg">
            <div className="flex justify-between text-sm mb-2">
              <span className="text-gray-600">Annual Yield:</span>
              <span className="font-medium text-green-600">{asset.yield}%</span>
            </div>
            <div className="flex justify-between text-sm mb-2">
              <span className="text-gray-600">Risk Level:</span>
              <Badge variant="outline" className={getRiskLevelColor(asset.riskLevel)}>
                {asset.riskLevel}
              </Badge>
            </div>
            <div className="flex justify-between text-sm mb-2">
              <span className="text-gray-600">Status:</span>
              <Badge variant="outline" className={getStatusColor(asset.status)}>
                {asset.status}
              </Badge>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Available Supply:</span>
              <span className="font-medium">{formatNumber(asset.remainingTokens)} tokens</span>
            </div>
          </div>

          {/* Investment Amount */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Investment Amount (USD)
            </label>
            <Input
              type="number"
              value={amount}
              onChange={(e) => {
                setAmount(e.target.value);
                setError('');
              }}
              placeholder={`${formatCurrency(asset.minInvestment)} - ${formatCurrency(asset.maxInvestment)}`}
              min={asset.minInvestment}
              max={asset.maxInvestment}
              className="w-full"
            />
            <p className="text-xs text-gray-500 mt-1">
              Min: {formatCurrency(asset.minInvestment)} | Max: {formatCurrency(asset.maxInvestment)}
            </p>
          </div>

          {/* Investment Preview */}
          {amount && parseFloat(amount) > 0 && (
            <div className="mb-4 p-3 bg-blue-50 rounded-lg">
              <h4 className="text-sm font-medium text-blue-900 mb-2">Investment Preview</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-blue-700">Estimated Tokens:</span>
                  <span className="font-medium text-blue-900">{formatNumber(estimatedTokens)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-blue-700">Annual Yield:</span>
                  <span className="font-medium text-blue-900">{formatCurrency(estimatedYield)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-blue-700">Monthly Yield:</span>
                  <span className="font-medium text-blue-900">{formatCurrency(estimatedYield / 12)}</span>
                </div>
              </div>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
              <div className="flex items-center">
                <AlertCircle className="h-4 w-4 text-red-400 mr-2" />
                <p className="text-sm text-red-600">{error}</p>
              </div>
            </div>
          )}

          {/* Investment Benefits */}
          <div className="mb-4 p-3 bg-green-50 rounded-lg">
            <h4 className="text-sm font-medium text-green-900 mb-2 flex items-center">
              <Shield className="h-4 w-4 mr-2" />
              Investment Benefits
            </h4>
            <ul className="text-xs text-green-700 space-y-1">
              <li>• Regulated and compliant investment</li>
              <li>• Real-time blockchain verification</li>
              <li>• Monthly yield distributions</li>
              <li>• Professional asset management</li>
            </ul>
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-3">
            <Button
              onClick={handleClose}
              variant="outline"
              className="flex-1"
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting || !amount || parseFloat(amount) <= 0}
              loading={isSubmitting}
              className="flex-1"
            >
              {isSubmitting ? 'Processing...' : 'Confirm Investment'}
            </Button>
          </div>

          {/* Disclaimer */}
          <p className="text-xs text-gray-500 mt-4 text-center">
            Investments carry risk. Past performance does not guarantee future results.
          </p>
        </div>
      </div>
    </div>
  );
}
