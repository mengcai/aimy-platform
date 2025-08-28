import React from 'react';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  PieChart, 
  Pie, 
  Cell, 
  Tooltip, 
  ResponsiveContainer,
  Legend
} from 'recharts';
import { 
  MoreHorizontal, 
  Download,
  TrendingUp,
  TrendingDown
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface ChartPieProps {
  title: string;
  subtitle?: string;
  data: Array<{
    name: string;
    value: number;
    color: string;
  }>;
  height?: number;
  showLegend?: boolean;
  showTooltip?: boolean;
  variant?: 'default' | 'glassmorphism';
  className?: string;
  change?: {
    value: number;
    period: string;
    type: 'increase' | 'decrease' | 'neutral';
  };
  actions?: React.ReactNode;
}

export function AChartPie({
  title,
  subtitle,
  data,
  height = 300,
  showLegend = true,
  showTooltip = true,
  variant = 'default',
  className,
  change,
  actions
}: ChartPieProps) {
  const getVariantStyles = () => {
    switch (variant) {
      case 'glassmorphism':
        return 'bg-base-bg-100/50 dark:bg-base-bg-100/50 backdrop-blur-glass border-base-ink-200/50 dark:border-base-ink-800/50';
      default:
        return 'bg-base-bg-100 dark:bg-base-bg-100 border-base-ink-200 dark:border-base-ink-800';
    }
  };

  const getChangeColor = () => {
    if (!change) return '';
    
    switch (change.type) {
      case 'increase':
        return 'text-success-600 dark:text-success-400';
      case 'decrease':
        return 'text-error-600 dark:text-error-400';
      default:
        return 'text-base-ink-600 dark:text-base-ink-400';
    }
  };

  const getChangeIcon = () => {
    if (!change) return null;
    
    switch (change.type) {
      case 'increase':
        return <TrendingUp className="h-4 w-4 text-success-500" />;
      case 'decrease':
        return <TrendingDown className="h-4 w-4 text-error-500" />;
      default:
        return null;
    }
  };

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0];
      return (
        <div className="rounded-lg border border-base-ink-200 dark:border-base-ink-800 bg-base-bg-100 dark:bg-base-bg-100 p-3 shadow-lg">
          <p className="font-medium text-base-ink-900 dark:text-base-ink-100">{data.name}</p>
          <p className="text-sm" style={{ color: data.color }}>
            Value: {data.value}
          </p>
          <p className="text-sm text-base-ink-600 dark:text-base-ink-400">
            Percentage: {((data.value / data.payload.total) * 100).toFixed(1)}%
          </p>
        </div>
      );
    }
    return null;
  };

  const total = data.reduce((sum, item) => sum + item.value, 0);

  return (
    <Card className={cn('transition-all duration-200 hover:shadow-md', getVariantStyles(), className)}>
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <CardTitle className="text-lg font-semibold text-base-ink-900 dark:text-base-ink-100">
                {title}
              </CardTitle>
              {change && (
                <Badge variant={change.type === 'increase' ? 'success' : change.type === 'decrease' ? 'destructive' : 'secondary'}>
                  <div className="flex items-center space-x-1">
                    {getChangeIcon()}
                    <span className={getChangeColor()}>
                      {change.value > 0 ? '+' : ''}{change.value}%
                    </span>
                    <span className="text-xs text-base-ink-500 dark:text-base-ink-400">
                      {change.period}
                    </span>
                  </div>
                </Badge>
              )}
            </div>
            {subtitle && (
              <CardDescription className="text-sm text-base-ink-600 dark:text-base-ink-400">
                {subtitle}
              </CardDescription>
            )}
          </div>
          
          <div className="flex items-center space-x-2">
            {actions}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>
                  <Download className="mr-2 h-4 w-4" />
                  Export
                </DropdownMenuItem>
                <DropdownMenuItem>Print</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem>Settings</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="w-full" style={{ height }}>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {data.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={entry.color}
                    stroke="var(--color-base-ink-100)"
                    strokeWidth={2}
                  />
                ))}
              </Pie>
              {showTooltip && <Tooltip content={<CustomTooltip />} />}
              {showLegend && (
                <Legend 
                  verticalAlign="bottom" 
                  height={36}
                  formatter={(value, entry: any) => (
                    <span style={{ color: entry.color }}>{value}</span>
                  )}
                />
              )}
            </PieChart>
          </ResponsiveContainer>
        </div>
        
        {/* Summary stats */}
        <div className="mt-4 grid grid-cols-2 gap-4 pt-4 border-t border-base-ink-200 dark:border-base-ink-800">
          <div className="text-center">
            <p className="text-2xl font-bold text-base-ink-900 dark:text-base-ink-100">
              {total.toLocaleString()}
            </p>
            <p className="text-sm text-base-ink-600 dark:text-base-ink-400">Total</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-base-ink-900 dark:text-base-ink-100">
              {data.length}
            </p>
            <p className="text-sm text-base-ink-600 dark:text-base-ink-400">Categories</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
