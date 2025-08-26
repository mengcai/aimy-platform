import React from 'react';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  MoreHorizontal, 
  TrendingUp, 
  TrendingDown,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface DataCardProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string;
  subtitle?: string;
  value: string | number;
  description?: string;
  change?: {
    value: number;
    period: string;
    type: 'increase' | 'decrease' | 'neutral';
  };
  status?: {
    label: string;
    variant: 'default' | 'secondary' | 'destructive' | 'outline' | 'success' | 'warning';
  };
  icon?: React.ReactNode;
  actions?: React.ReactNode;
  variant?: 'default' | 'success' | 'warning' | 'error' | 'glassmorphism';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function DataCard({
  title,
  subtitle,
  value,
  description,
  change,
  status,
  icon,
  actions,
  variant = 'default',
  size = 'md',
  className,
  ...props
}: DataCardProps) {
  const getChangeIcon = () => {
    if (!change) return null;
    
    switch (change.type) {
      case 'increase':
        return <ArrowUpRight className="h-4 w-4 text-success-500" />;
      case 'decrease':
        return <ArrowDownRight className="h-4 w-4 text-error-500" />;
      default:
        return null;
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

  const getVariantStyles = () => {
    switch (variant) {
      case 'success':
        return 'border-success-200 dark:border-success-800 bg-success-50/50 dark:bg-success-950/20';
      case 'warning':
        return 'border-warning-200 dark:border-warning-800 bg-warning-50/50 dark:bg-warning-950/20';
      case 'error':
        return 'border-error-200 dark:border-error-800 bg-error-50/50 dark:bg-error-950/20';
      case 'glassmorphism':
        return 'bg-base-bg-100/50 dark:bg-base-bg-100/50 backdrop-blur-glass border-base-ink-200/50 dark:border-base-ink-800/50';
      default:
        return 'bg-base-bg-100 dark:bg-base-bg-100 border-base-ink-200 dark:border-base-ink-800';
    }
  };

  const getSizeStyles = () => {
    switch (size) {
      case 'sm':
        return 'p-4';
      case 'lg':
        return 'p-6';
      default:
        return 'p-5';
    }
  };

  return (
    <Card
      className={cn(
        'transition-all duration-200 hover:shadow-md',
        getVariantStyles(),
        className
      )}
      {...props}
    >
      <CardHeader className={cn('pb-3', getSizeStyles())}>
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <CardTitle className="text-base font-semibold text-base-ink-900 dark:text-base-ink-100">
                {title}
              </CardTitle>
              {status && (
                <Badge variant={status.variant} className="text-xs">
                  {status.label}
                </Badge>
              )}
            </div>
            {subtitle && (
              <CardDescription className="text-sm text-base-ink-600 dark:text-base-ink-400">
                {subtitle}
              </CardDescription>
            )}
          </div>
          
          {icon && (
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-base-ink-100 dark:bg-base-ink-800">
              {icon}
            </div>
          )}
        </div>
      </CardHeader>
      
      <CardContent className={cn('pt-0', getSizeStyles())}>
        <div className="space-y-3">
          {/* Value and change */}
          <div className="flex items-baseline justify-between">
            <div className="space-y-1">
              <p className={cn(
                'font-bold tracking-tight',
                size === 'sm' ? 'text-2xl' : size === 'lg' ? 'text-4xl' : 'text-3xl',
                'text-base-ink-900 dark:text-base-ink-100'
              )}>
                {value}
              </p>
              
              {change && (
                <div className="flex items-center space-x-1">
                  {getChangeIcon()}
                  <span className={cn(
                    'text-sm font-medium',
                    getChangeColor()
                  )}>
                    {change.value > 0 ? '+' : ''}{change.value}%
                  </span>
                  <span className="text-xs text-base-ink-500 dark:text-base-ink-400">
                    {change.period}
                  </span>
                </div>
              )}
            </div>
            
            {/* Actions */}
            {(actions || change) && (
              <div className="flex items-center space-x-2">
                {actions}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem>View details</DropdownMenuItem>
                    <DropdownMenuItem>Export data</DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem>Settings</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            )}
          </div>
          
          {/* Description */}
          {description && (
            <p className="text-sm text-base-ink-600 dark:text-base-ink-400">
              {description}
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
