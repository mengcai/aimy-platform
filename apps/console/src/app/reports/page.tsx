'use client';

import React, { useState } from 'react';
import { 
  Shell, 
  PageHeader, 
  Section,
  DataCard,
  AChartLine,
  AChartBar,
  AChartPie
} from '@/components/ui';
import { 
  Download, 
  Calendar,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Users,
  Building,
  Shield,
  FileText,
  BarChart3,
  PieChart,
  Activity,
  Filter,
  Search,
  Eye,
  ExternalLink
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

// Mock data for demonstration
const portfolioValue = [
  { date: '2024-01-01', value: 12500000, assets: 45, investors: 1200 },
  { date: '2024-01-02', value: 12550000, assets: 45, investors: 1205 },
  { date: '2024-01-03', value: 12620000, assets: 46, investors: 1210 },
  { date: '2024-01-04', value: 12580000, assets: 46, investors: 1212 },
  { date: '2024-01-05', value: 12650000, assets: 47, investors: 1215 },
  { date: '2024-01-06', value: 12710000, assets: 47, investors: 1220 },
  { date: '2024-01-07', value: 12780000, assets: 48, investors: 1225 },
];

const assetAllocation = [
  { name: 'Solar Farms', value: 35, color: '#f59e0b' },
  { name: 'Wind Energy', value: 25, color: '#06b6d4' },
  { name: 'Real Estate', value: 20, color: '#8b5cf6' },
  { name: 'Infrastructure', value: 15, color: '#6366f1' },
  { name: 'Other', value: 5, color: '#64748b' },
];

const monthlyFlows = [
  { month: 'Jan', subscriptions: 2500000, redemptions: 800000, net: 1700000 },
  { month: 'Feb', subscriptions: 3200000, redemptions: 1200000, net: 2000000 },
  { month: 'Mar', subscriptions: 2800000, redemptions: 900000, net: 1900000 },
  { month: 'Apr', subscriptions: 3500000, redemptions: 1100000, net: 2400000 },
  { month: 'May', subscriptions: 3000000, redemptions: 1000000, net: 2000000 },
  { month: 'Jun', subscriptions: 3800000, redemptions: 1300000, net: 2500000 },
];

const auditLogs = [
  {
    id: 'AUDIT-001',
    timestamp: '2024-01-10T15:30:00Z',
    user: 'Compliance Officer 1',
    action: 'KYC Approval',
    entity: 'John Smith',
    details: 'Individual KYC verification approved',
    ip: '192.168.1.100',
    status: 'success',
  },
  {
    id: 'AUDIT-002',
    timestamp: '2024-01-10T14:45:00Z',
    user: 'System Admin',
    action: 'Configuration Update',
    entity: 'Risk Parameters',
    details: 'Updated risk scoring thresholds',
    ip: '192.168.1.101',
    status: 'success',
  },
  {
    id: 'AUDIT-003',
    timestamp: '2024-01-10T14:20:00Z',
    user: 'Compliance Officer 2',
    action: 'Document Upload',
    entity: 'TechCorp Solutions',
    details: 'Uploaded corporate registration documents',
    ip: '192.168.1.102',
    status: 'success',
  },
  {
    id: 'AUDIT-004',
    timestamp: '2024-01-10T13:55:00Z',
    user: 'Compliance Officer 1',
    action: 'Sanctions Screening',
    entity: 'Sarah Johnson',
    details: 'External sanctions screening completed',
    ip: '192.168.1.100',
    status: 'success',
  },
];

const reportTypes = [
  { id: 'por', name: 'Proof of Reserve', description: 'Current portfolio holdings and valuations', icon: '📊' },
  { id: 'flows', name: 'Capital Flows', description: 'Subscription and redemption activity', icon: '💰' },
  { id: 'audit', name: 'Audit Trail', description: 'System access and compliance actions', icon: '🔍' },
  { id: 'compliance', name: 'Compliance Report', description: 'KYC/AML status and risk metrics', icon: '🛡️' },
  { id: 'performance', name: 'Performance Report', description: 'Asset performance and returns', icon: '📈' },
  { id: 'risk', name: 'Risk Assessment', description: 'Portfolio risk metrics and analysis', icon: '⚠️' },
];

export default function ReportsPage() {
  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-4">
        Reports & Analytics
      </h1>
      <p className="text-gray-600">
        This is a test page for reports and analytics.
      </p>
    </div>
  );
}
