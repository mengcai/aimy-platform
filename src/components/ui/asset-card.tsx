'use client';

import React from 'react';
import Link from 'next/link';
import { 
  MapPin, 
  Building, 
  DollarSign, 
  TrendingUp, 
  Users, 
  Eye, 
  TrendingUp as TrendingUpIcon
} from 'lucide-react';
import { Asset } from '@/types';
import { Badge } from './badge';
import { Button } from './button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from './card';
import { calculateProgress } from '@/lib/utils';

// Import the shared asset image utility
const getAssetImage = (assetId: string) => {
  // In a real app, these would be actual asset images
  const imageMap: { [key: string]: string } = {
    'solar-farm-alpha': 'https://images.unsplash.com/photo-1509391366360-2e959784a276?w=400&h=300&fit=crop',
    'real-estate-fund-beta': 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=400&h=300&fit=crop',
    'infrastructure-bonds-gamma': 'https://images.unsplash.com/photo-1541888946425-d81bb19240f5?w=400&h=300&fit=crop',
    'wind-energy-delta': 'https://images.unsplash.com/photo-1466611653911-95081537e5b7?w=400&h=300&fit=crop',
    'tech-startup-epsilon': 'https://images.unsplash.com/photo-1518186285589-2f7649de83e0?w=400&h=300&fit=crop',
    'commodity-fund-zeta': 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=400&h=300&fit=crop',
    'healthcare-reit-eta': 'https://images.unsplash.com/photo-1576091160399-112c8b76a383?w=400&h=300&fit=crop',
    'data-center-theta': 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=400&h=300&fit=crop',
    'agricultural-land-iota': 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=400&h=300&fit=crop',
    'mining-operation-kappa': 'https://images.unsplash.com/photo-1513828583688-c52646db42da?w=400&h=300&fit=crop',
    'intellipro-group': 'https://images.unsplash.com/photo-1556761175-b413da4baf72?w=400&h=300&fit=crop',
    'energy-storage-lambda': 'https://images.unsplash.com/photo-1612198188060-c7c2a3b66eae?w=400&h=300&fit=crop'
  };

  return imageMap[assetId] || 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&h=300&fit=crop';
};

const getAssetTypeIcon = (type: string) => {
  const iconMap: { [key: string]: string } = {
    'renewable energy': '🌞',
    'real estate': '🏢',
    'infrastructure': '🏗️',
    'technology': '💻',
    'commodity': '📦',
    'healthcare': '🏥',
    'agriculture': '🌾',
    'mining': '⛏️',
    'energy': '⚡'
  };

  return iconMap[type.toLowerCase()] || '📊';
};

interface AssetCardProps {
  asset: Asset;
  onInvest?: (asset: Asset) => void;
  showActions?: boolean;
  variant?: 'default' | 'compact' | 'detailed';
}

export function AssetCard({ asset, onInvest }: AssetCardProps) {
  const progress = calculateProgress(asset.remainingTokens, asset.tokens);

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow">
      <div className="relative h-48 bg-gradient-to-br from-blue-50 to-indigo-100 rounded-t-lg flex items-center justify-center overflow-hidden">
        <img 
          src={getAssetImage(asset.id)} 
          alt={asset.name}
          className="w-full h-full object-cover"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.style.display = 'none';
            const fallback = target.nextElementSibling as HTMLElement;
            if (fallback) fallback.style.display = 'flex';
          }}
        />
        <div 
          className="absolute inset-0 flex items-center justify-center text-6xl bg-gray-100"
          style={{ display: 'none' }}
        >
          {getAssetTypeIcon(asset.type)}
        </div>
      </div>
      
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-lg">{asset.name}</CardTitle>
            <CardDescription className="text-sm text-gray-600">{asset.location}</CardDescription>
          </div>
          <Badge variant={asset.status === 'active' ? 'default' : 'secondary'}>
            {asset.status}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-3">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-gray-500">Value:</span>
            <div className="font-semibold text-green-600">${(asset.value / 1000000).toFixed(1)}M</div>
          </div>
          <div>
            <span className="text-gray-500">Yield:</span>
            <div className="font-semibold text-blue-600">{asset.yield}%</div>
          </div>
          <div>
            <span className="text-gray-500">Min Investment:</span>
            <div className="font-semibold">${asset.minInvestment.toLocaleString()}</div>
          </div>
          <div>
            <span className="text-gray-500">Remaining:</span>
            <div className="font-semibold">{asset.remainingTokens.toLocaleString()} tokens</div>
          </div>
        </div>
        
        <p className="text-sm text-gray-600 line-clamp-2">{asset.description}</p>
      </CardContent>
      
      <CardFooter>
        <Button 
          onClick={() => onInvest?.(asset)} 
          className="w-full"
          disabled={asset.remainingTokens === 0}
        >
          {asset.remainingTokens === 0 ? 'Fully Invested' : 'Invest Now'}
        </Button>
      </CardFooter>
    </Card>
  );
}
