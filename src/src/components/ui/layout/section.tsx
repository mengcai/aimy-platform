import React from 'react';
import { cn } from '@/lib/utils';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { Plus, MoreHorizontal } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface SectionProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string;
  subtitle?: string;
  description?: string;
  children: React.ReactNode;
  actions?: React.ReactNode;
  onCreate?: () => void;
  createLabel?: string;
  variant?: 'default' | 'bordered' | 'glassmorphism';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function Section({
  title,
  subtitle,
  description,
  children,
  actions,
  onCreate,
  createLabel = 'Create',
  variant = 'default',
  size = 'md',
  className,
  ...props
}: SectionProps) {
  const getVariantStyles = () => {
    switch (variant) {
      case 'bordered':
        return 'border border-base-ink-200 dark:border-base-ink-800 rounded-lg';
      case 'glassmorphism':
        return 'bg-base-bg-100/50 dark:bg-base-bg-100/50 backdrop-blur-glass border border-base-ink-200/50 dark:border-base-ink-800/50 rounded-lg';
      default:
        return '';
    }
  };

  const getSizeStyles = () => {
    switch (size) {
      case 'sm':
        return 'p-4';
      case 'lg':
        return 'p-8';
      default:
        return 'p-6';
      }
  };

  return (
    <section
      className={cn(
        'space-y-4',
        getVariantStyles(),
        className
      )}
      {...props}
    >
      {/* Header */}
      <div className={cn('space-y-2', getSizeStyles())}>
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <h2 className="text-xl font-semibold tracking-tight text-base-ink-900 dark:text-base-ink-100">
              {title}
            </h2>
            {subtitle && (
              <p className="text-sm text-base-ink-600 dark:text-base-ink-400">
                {subtitle}
              </p>
            )}
            {description && (
              <p className="text-sm text-base-ink-500 dark:text-base-ink-400">
                {description}
              </p>
            )}
          </div>
          
          <div className="flex items-center space-x-2">
            {onCreate && (
              <Button onClick={onCreate} size="sm">
                <Plus className="mr-2 h-4 w-4" />
                {createLabel}
              </Button>
            )}
            
            {actions}
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>Export</DropdownMenuItem>
                <DropdownMenuItem>Print</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem>Settings</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>

      {/* Separator */}
      <Separator />

      {/* Content */}
      <div className={cn('px-6 pb-6')}>
        {children}
      </div>
    </section>
  );
}
