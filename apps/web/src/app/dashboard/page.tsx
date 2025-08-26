'use client';

import React from 'react';
import { 
  Shell, 
  Stat, 
  DataCard, 
  Section,
  AChartLine,
  AChartPie
} from '@/components/ui';
import { AIInsights } from '@/components/ai-insights';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Target, 
  Shield, 
  Clock,
  AlertTriangle,
  CheckCircle,
  XCircle
} from 'lucide-react';

// Mock data for demonstration
const portfolioData = [
  { month: 'Jan', value: 125000, change: 0 },
  { month: 'Feb', value: 132000, change: 5.6 },
  { month: 'Mar', value: 128000, change: -3.0 },
  { month: 'Apr', value: 141000, change: 10.2 },
  { month: 'May', value: 138000, change: -2.1 },
  { month: 'Jun', value: 152000, change: 10.1 },
];

const assetAllocation = [
  { name: 'Solar Farm Alpha', value: 45, color: '#22c55e' },
  { name: 'Real Estate Fund', value: 30, color: '#3b82f6' },
  { name: 'Infrastructure Bonds', value: 15, color: '#8b5cf6' },
  { name: 'Cash & Equivalents', value: 10, color: '#f59e0b' },
];

const complianceNotices = [
  {
    id: 1,
    type: 'success',
    title: 'KYC Verification Complete',
    description: 'Your identity verification has been completed successfully.',
    time: '2 hours ago',
    icon: CheckCircle,
  },
  {
    id: 2,
    type: 'warning',
    title: 'Document Expiry Notice',
    description: 'Your passport will expire in 3 months. Please update.',
    time: '1 day ago',
    icon: AlertTriangle,
  },
  {
    id: 3,
    type: 'info',
    title: 'Compliance Review',
    description: 'Annual compliance review scheduled for next month.',
    time: '3 days ago',
    icon: Shield,
  },
];

const upcomingPayouts = [
  {
    id: 1,
    asset: 'Solar Farm Alpha',
    amount: 1250.00,
    date: '2024-01-15',
    status: 'confirmed',
  },
  {
    id: 2,
    asset: 'Real Estate Fund',
    amount: 890.00,
    date: '2024-01-20',
    status: 'pending',
  },
  {
    id: 3,
    asset: 'Infrastructure Bonds',
    amount: 450.00,
    date: '2024-01-25',
    status: 'scheduled',
  },
];

const aiInsights = [
  {
    id: 1,
    type: 'opportunity',
    title: 'Market Opportunity Detected',
    description: 'AI analysis suggests increasing allocation to renewable energy assets by 15% based on market trends.',
    confidence: 87,
    action: 'Review Portfolio',
  },
  {
    id: 2,
    type: 'risk',
    title: 'Risk Assessment Update',
    description: 'Portfolio risk score has decreased by 8% due to improved diversification.',
    confidence: 92,
    action: 'View Details',
  },
  {
    id: 3,
    type: 'performance',
    title: 'Performance Forecast',
    description: 'Expected annual return adjusted to 8.2% based on current market conditions.',
    confidence: 78,
    action: 'See Analysis',
  },
];

export default function DashboardPage() {
  return (
    <Shell variant="default">
      <div className="space-y-8">
        {/* Page Header */}
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-base-ink-900 dark:text-base-ink-100">
            Dashboard
          </h1>
          <p className="text-base text-base-ink-600 dark:text-base-ink-400">
            Welcome back! Here's an overview of your portfolio and AI-powered insights.
          </p>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Stat
            label="Portfolio NAV"
            value="$152,000"
            description="Current net asset value"
            change={{ value: 10.1, period: 'vs last month', type: 'increase' }}
            icon={<DollarSign className="h-6 w-6 text-aimy-primary" />}
            variant="success"
          />
          
          <Stat
            label="Yield to Date"
            value="8.2%"
            description="Annualized return"
            change={{ value: 0.8, period: 'vs target', type: 'increase' }}
            icon={<Target className="h-6 w-6 text-aimy-accent" />}
            variant="success"
          />
          
          <Stat
            label="Risk Score"
            value="Low"
            description="Portfolio risk level"
            change={{ value: -8, period: 'vs last month', type: 'decrease' }}
            icon={<Shield className="h-6 w-6 text-success-500" />}
            variant="success"
          />
          
          <Stat
            label="Next Payout"
            value="$1,250"
            description="Solar Farm Alpha"
            icon={<Clock className="h-6 w-6 text-warning-500" />}
          />
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <AChartLine
            title="Portfolio Performance"
            subtitle="Monthly NAV progression"
            data={portfolioData}
            lines={[
              { key: 'value', color: '#6366f1', name: 'Portfolio Value' },
              { key: 'change', color: '#06b6d4', name: 'Monthly Change %' }
            ]}
            xAxisKey="month"
            height={300}
            change={{ value: 10.1, period: '6 months', type: 'increase' }}
          />
          
          <AChartPie
            title="Asset Allocation"
            subtitle="Current portfolio distribution"
            data={assetAllocation}
            height={300}
            change={{ value: 2.1, period: 'vs last month', type: 'increase' }}
          />
        </div>

        {/* AI Insights */}
        <Section
          title="AI Insights"
          subtitle="Machine learning-powered portfolio analysis"
          description="Real-time insights and recommendations based on market data and AI models"
          variant="glassmorphism"
        >
          <AIInsights />
        </Section>

        {/* Bottom Row */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Compliance Notices */}
          <Section
            title="Compliance Notices"
            subtitle="Recent compliance updates"
            variant="bordered"
          >
            <div className="space-y-3">
              {complianceNotices.map((notice) => (
                <div
                  key={notice.id}
                  className="flex items-start space-x-3 p-3 rounded-lg border border-base-ink-200 dark:border-base-ink-800 bg-base-bg-50 dark:bg-base-bg-50"
                >
                  <notice.icon className={cn(
                    "h-5 w-5 mt-0.5",
                    notice.type === 'success' && "text-success-500",
                    notice.type === 'warning' && "text-warning-500",
                    notice.type === 'info' && "text-aimy-primary"
                  )} />
                  <div className="flex-1 space-y-1">
                    <p className="text-sm font-medium text-base-ink-900 dark:text-base-ink-100">
                      {notice.title}
                    </p>
                    <p className="text-sm text-base-ink-600 dark:text-base-ink-400">
                      {notice.description}
                    </p>
                    <p className="text-xs text-base-ink-500 dark:text-base-ink-400">
                      {notice.time}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </Section>

          {/* Upcoming Payouts */}
          <Section
            title="Upcoming Payouts"
            subtitle="Scheduled distributions"
            variant="bordered"
          >
            <div className="space-y-3">
              {upcomingPayouts.map((payout) => (
                <div
                  key={payout.id}
                  className="flex items-center justify-between p-3 rounded-lg border border-base-ink-200 dark:border-base-ink-800 bg-base-bg-50 dark:bg-base-bg-50"
                >
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-base-ink-900 dark:text-base-ink-100">
                      {payout.asset}
                    </p>
                    <p className="text-sm text-base-ink-600 dark:text-base-ink-400">
                      {new Date(payout.date).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric'
                      })}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-base-ink-900 dark:text-base-ink-100">
                      ${payout.amount.toLocaleString()}
                    </p>
                    <Badge 
                      variant={payout.status === 'confirmed' ? 'success' : payout.status === 'pending' ? 'warning' : 'secondary'}
                      className="text-xs"
                    >
                      {payout.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </Section>
        </div>
      </div>
    </Shell>
  );
}

function cn(...classes: string[]) {
  return classes.filter(Boolean).join(' ');
}
