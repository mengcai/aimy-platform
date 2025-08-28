import React from 'react';
import { cn } from '@/lib/utils';

interface ShellProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  variant?: 'default' | 'sidebar' | 'full';
  className?: string;
}

export function Shell({ 
  children, 
  variant = 'default', 
  className,
  ...props 
}: ShellProps) {
  return (
    <div
      className={cn(
        'min-h-screen bg-base-bg-50 dark:bg-base-bg-50',
        'transition-colors duration-200',
        variant === 'sidebar' && 'lg:pl-64',
        variant === 'full' && 'p-0',
        variant === 'default' && 'p-4 sm:p-6 lg:p-8',
        className
      )}
      {...props}
    >
      <div className={cn(
        'mx-auto',
        variant === 'full' ? 'max-w-none' : 'max-w-7xl'
      )}>
        {children}
      </div>
    </div>
  );
}
