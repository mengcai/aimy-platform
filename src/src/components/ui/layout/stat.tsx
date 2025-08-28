import React from 'react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { 
  TrendingUp, 
  TrendingDown, 
  Minus,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';

interface StatProps extends React.HTMLAttributes<HTMLDivElement> {
  label: string;
  value: string | number;
  description?: string;
  change?: {
    value: number;
    period: string;
    type: 'increase' | 'decrease' | 'neutral';
  };
  icon?: React.ReactNode;
  variant?: 'default' | 'success' | 'warning' | 'error';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function Stat({
  label,
  value,
  description,
  change,
  icon,
  variant = 'default',
  size = 'md',
  className,
  ...props
}: StatProps) {
  const getChangeIcon = () => {
    if (!change) return null;
    
    switch (change.type) {
      case 'increase':
        return <ArrowUpRight className="h-4 w-4 text-success-500" />;
      case 'decrease':
        return <ArrowDownRight className="h-4 w-4 text-error-500" />;
      default:
        return <Minus className="h-4 w-4 text-base-ink-400" />;
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
        return 'border-success-200 dark:border-success-800 bg-success-50 dark:bg-success-950/20';
      case 'warning':
        return 'border-warning-200 dark:border-warning-800 bg-warning-50 dark:bg-warning-950/20';
      case 'error':
        return 'border-error-200 dark:border-error-800 bg-error-50 dark:bg-error-950/20';
      default:
        return 'border-base-ink-200 dark:border-base-ink-800 bg-base-bg-100 dark:bg-base-bg-100';
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
    <div
      className={cn(
        'rounded-lg border backdrop-blur-glass-sm',
        'transition-all duration-200 hover:shadow-md',
        getVariantStyles(),
        getSizeStyles(),
        className
      )}
      {...props}
    >
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <p className="text-sm font-medium text-base-ink-600 dark:text-base-ink-400">
            {label}
          </p>
          
          <div className="flex items-baseline space-x-2">
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
          
          {description && (
            <p className="text-sm text-base-ink-500 dark:text-base-ink-400">
              {description}
            </p>
          )}
        </div>
        
        {icon && (
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-base-ink-100 dark:bg-base-ink-800">
            {icon}
          </div>
        )}
      </div>
    </div>
  );
}
