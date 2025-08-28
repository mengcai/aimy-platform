import React from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ChevronLeft, Menu } from 'lucide-react';

interface SidebarProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  isOpen?: boolean;
  onToggle?: () => void;
  className?: string;
  variant?: 'default' | 'collapsible';
}

export function Sidebar({ 
  children, 
  isOpen = true, 
  onToggle,
  variant = 'default',
  className,
  ...props 
}: SidebarProps) {
  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={onToggle}
        />
      )}
      
      {/* Sidebar */}
      <div
        className={cn(
          'fixed left-0 top-0 z-50 h-full w-64',
          'bg-base-bg-100 dark:bg-base-bg-100',
          'border-r border-base-ink-200 dark:border-base-ink-800',
          'backdrop-blur-glass-sm',
          'transition-transform duration-200 ease-in-out',
          'lg:translate-x-0',
          isOpen ? 'translate-x-0' : '-translate-x-full',
          className
        )}
        {...props}
      >
        {/* Header */}
        <div className="flex h-16 items-center justify-between border-b border-base-ink-200 dark:border-base-ink-800 px-4">
          <div className="flex items-center space-x-2">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-aimy-primary to-aimy-secondary" />
            <div className="ml-3">
              <span className="text-lg font-semibold text-gray-900">AIMYA</span>
            </div>
          </div>
          
          {variant === 'collapsible' && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onToggle}
              className="lg:hidden"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
          )}
        </div>

        {/* Content */}
        <ScrollArea className="h-[calc(100vh-4rem)]">
          <div className="p-4">
            {children}
          </div>
        </ScrollArea>
      </div>

      {/* Mobile toggle button */}
      {!isOpen && onToggle && (
        <Button
          variant="ghost"
          size="sm"
          onClick={onToggle}
          className="fixed left-4 top-4 z-50 lg:hidden"
        >
          <Menu className="h-4 w-4" />
        </Button>
      )}
    </>
  );
}
