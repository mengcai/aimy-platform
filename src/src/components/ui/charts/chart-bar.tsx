import React from 'react';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
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

interface ChartBarProps {
  title: string;
  subtitle?: string;
  data: Array<Record<string, any>>;
  bars: Array<{
    key: string;
    color: string;
    name: string;
    fill?: string;
  }>;
  xAxisKey: string;
  height?: number;
  showGrid?: boolean;
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

export function AChartBar({
  title,
  subtitle,
  data,
  bars,
  xAxisKey,
  height = 300,
  showGrid = true,
  showLegend = true,
  showTooltip = true,
  variant = 'default',
  className,
  change,
  actions
}: ChartBarProps) {
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

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="rounded-lg border border-base-ink-200 dark:border-base-ink-800 bg-base-bg-100 dark:bg-base-bg-100 p-3 shadow-lg">
          <p className="font-medium text-base-ink-900 dark:text-base-ink-100">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {entry.name}: {entry.value}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

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
            <BarChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              {showGrid && (
                <CartesianGrid 
                  strokeDasharray="3 3" 
                  stroke="var(--color-base-ink-200)"
                  opacity={0.3}
                />
              )}
              <XAxis 
                dataKey={xAxisKey} 
                stroke="var(--color-base-ink-600)"
                fontSize={12}
                tickLine={false}
                axisLine={false}
              />
              <YAxis 
                stroke="var(--color-base-ink-600)"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => `${value}`}
              />
              {showTooltip && <Tooltip content={<CustomTooltip />} />}
              {showLegend && <Legend />}
              
              {bars.map((bar, index) => (
                <Bar
                  key={bar.key}
                  dataKey={bar.key}
                  fill={bar.fill || bar.color}
                  name={bar.name}
                  radius={[4, 4, 0, 0]}
                />
              ))}
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
