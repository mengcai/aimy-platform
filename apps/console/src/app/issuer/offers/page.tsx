'use client';

import React, { useState } from 'react';
import { 
  Shell, 
  PageHeader, 
  Section,
  DataCard,
  AChartBar,
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle,
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow,
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger
} from '@/components/ui';
import { 
  Plus, 
  Search, 
  Filter, 
  Download, 
  Eye, 
  Edit, 
  Trash2, 
  DollarSign, 
  Users, 
  Calendar, 
  CheckCircle, 
  Clock, 
  AlertTriangle, 
  FileText,
  Building,
  MapPin,
  Target,
  Lock,
  Globe,
  TrendingUp,
  BarChart3
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import Badge from '@/components/ui/badge';
import Input from '@/components/ui/input';

// Mock data for demonstration
const offers = [
  {
    id: 'OFFER-001',
    asset: 'Solar Farm Alpha',
    assetType: 'solar_energy',
    status: 'active',
    price: 100,
    minTicket: 1000,
    maxTicket: 100000,
    totalAmount: 5000000,
    raisedAmount: 3200000,
    lockupPeriod: 12,
    jurisdictions: ['US', 'EU', 'UK'],
    startDate: '2024-01-15',
    endDate: '2024-03-15',
    investors: 45,
    complianceStatus: 'approved',
    createdAt: '2024-01-01T10:00:00Z',
  },
  {
    id: 'OFFER-002',
    asset: 'Wind Energy Beta',
    assetType: 'wind_energy',
    status: 'draft',
    price: 150,
    minTicket: 5000,
    maxTicket: 500000,
    totalAmount: 8000000,
    raisedAmount: 0,
    lockupPeriod: 24,
    jurisdictions: ['US', 'Canada'],
    startDate: '2024-02-01',
    endDate: '2024-04-01',
    investors: 0,
    complianceStatus: 'pending',
    createdAt: '2024-01-05T14:30:00Z',
  },
  {
    id: 'OFFER-003',
    asset: 'Real Estate Gamma',
    assetType: 'real_estate',
    status: 'completed',
    price: 200,
    minTicket: 2500,
    maxTicket: 250000,
    totalAmount: 3000000,
    raisedAmount: 3000000,
    lockupPeriod: 36,
    jurisdictions: ['US', 'EU'],
    startDate: '2023-10-01',
    endDate: '2023-12-01',
    investors: 28,
    complianceStatus: 'approved',
    createdAt: '2023-09-15T09:00:00Z',
  },
  {
    id: 'OFFER-004',
    asset: 'Infrastructure Delta',
    assetType: 'infrastructure',
    status: 'paused',
    price: 75,
    minTicket: 10000,
    maxTicket: 1000000,
    totalAmount: 12000000,
    raisedAmount: 8000000,
    lockupPeriod: 18,
    jurisdictions: ['US', 'UK', 'Australia'],
    startDate: '2024-01-01',
    endDate: '2024-06-01',
    investors: 32,
    complianceStatus: 'under_review',
    createdAt: '2023-12-20T16:45:00Z',
  },
];

const offerStatuses = [
  { value: 'draft', label: 'Draft', color: 'default' },
  { value: 'pending', label: 'Pending Review', color: 'warning' },
  { value: 'active', label: 'Active', color: 'success' },
  { value: 'paused', label: 'Paused', color: 'warning' },
  { value: 'completed', label: 'Completed', color: 'success' },
  { value: 'cancelled', label: 'Cancelled', color: 'destructive' },
];

const complianceStatuses = [
  { value: 'pending', label: 'Pending', color: 'warning' },
  { value: 'under_review', label: 'Under Review', color: 'warning' },
  { value: 'approved', label: 'Approved', color: 'success' },
  { value: 'rejected', label: 'Rejected', color: 'destructive' },
];

const assetTypes = [
  { value: 'solar_energy', label: 'Solar Energy', icon: '☀️' },
  { value: 'wind_energy', label: 'Wind Energy', icon: '💨' },
  { value: 'real_estate', label: 'Real Estate', icon: '🏢' },
  { value: 'infrastructure', label: 'Infrastructure', icon: '🏗️' },
  { value: 'commodities', label: 'Commodities', icon: '📦' },
];

const jurisdictions = [
  { code: 'US', name: 'United States', flag: '🇺🇸' },
  { code: 'EU', name: 'European Union', flag: '🇪🇺' },
  { code: 'UK', name: 'United Kingdom', flag: '🇬🇧' },
  { code: 'Canada', name: 'Canada', flag: '🇨🇦' },
  { code: 'Australia', name: 'Australia', flag: '🇦🇺' },
  { code: 'Singapore', name: 'Singapore', flag: '🇸🇬' },
];

const monthlyPerformance = [
  { month: 'Jan', offers: 3, raised: 2500000, investors: 45 },
  { month: 'Feb', offers: 2, raised: 1800000, investors: 32 },
  { month: 'Mar', offers: 4, raised: 3200000, investors: 58 },
  { month: 'Apr', offers: 3, raised: 2800000, investors: 41 },
  { month: 'May', offers: 5, raised: 4500000, investors: 67 },
  { month: 'Jun', offers: 4, raised: 3800000, investors: 52 },
];

export default function IssuerOffersPage() {
  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-4">
        Offer Management
      </h1>
      <p className="text-gray-600">
        This is a test page for offer management.
      </p>
    </div>
  );
}
