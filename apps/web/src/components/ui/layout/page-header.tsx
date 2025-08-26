import React from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  ArrowLeft, 
  MoreHorizontal, 
  Settings,
  Download,
  Share2
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface PageHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string;
  subtitle?: string;
  description?: string;
  backHref?: string;
  onBack?: () => void;
  actions?: React.ReactNode;
  breadcrumbs?: Array<{
    label: string;
    href?: string;
  }>;
  status?: {
    label: string;
    variant: 'default' | 'secondary' | 'destructive' | 'outline' | 'success' | 'warning';
  };
  className?: string;
}

export function PageHeader({
  title,
  subtitle,
  description,
  backHref,
  onBack,
  actions,
  breadcrumbs,
  status,
  className,
  ...props
}: PageHeaderProps) {
  return (
    <div
      className={cn(
        'space-y-4 pb-6',
        className
      )}
      {...props}
    >
      {/* Breadcrumbs */}
      {breadcrumbs && breadcrumbs.length > 0 && (
        <nav className="flex items-center space-x-2 text-sm text-base-ink-500 dark:text-base-ink-400">
          {breadcrumbs.map((crumb, index) => (
            <React.Fragment key={crumb.label}>
              {index > 0 && <span>/</span>}
              {crumb.href ? (
                <a
                  href={crumb.href}
                  className="hover:text-base-ink-700 dark:hover:text-base-ink-300 transition-colors"
                >
                  {crumb.label}
                </a>
              ) : (
                <span className="text-base-ink-700 dark:text-base-ink-300">
                  {crumb.label}
                </span>
              )}
            </React.Fragment>
          ))}
        </nav>
      )}

      {/* Header content */}
      <div className="flex items-start justify-between">
        <div className="flex-1 space-y-2">
          {/* Back button */}
          {(backHref || onBack) && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onBack}
              className="mb-2 -ml-2 h-8 px-2"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
          )}

          {/* Title and subtitle */}
          <div className="flex items-center space-x-3">
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-base-ink-900 dark:text-base-ink-100">
                {title}
              </h1>
              {subtitle && (
                <p className="text-lg text-base-ink-600 dark:text-base-ink-400">
                  {subtitle}
                </p>
              )}
            </div>
            
            {status && (
              <Badge variant={status.variant}>
                {status.label}
              </Badge>
            )}
          </div>

          {/* Description */}
          {description && (
            <p className="text-base text-base-ink-600 dark:text-base-ink-400 max-w-3xl">
              {description}
            </p>
          )}
        </div>

        {/* Actions */}
        {actions && (
          <div className="flex items-center space-x-2">
            {actions}
            
            {/* More actions dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>
                  <Download className="mr-2 h-4 w-4" />
                  Export
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Share2 className="mr-2 h-4 w-4" />
                  Share
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <Settings className="mr-2 h-4 w-4" />
                  Settings
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )}
      </div>

      <Separator />
    </div>
  );
}
