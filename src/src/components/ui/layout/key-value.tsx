import React from 'react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Copy, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';

interface KeyValueProps extends React.HTMLAttributes<HTMLDivElement> {
  label: string;
  value: string | number | React.ReactNode;
  description?: string;
  type?: 'text' | 'number' | 'currency' | 'percentage' | 'date' | 'status' | 'link' | 'copyable';
  status?: {
    label: string;
    variant: 'default' | 'secondary' | 'destructive' | 'outline' | 'success' | 'warning';
  };
  link?: string;
  copyable?: boolean;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export function KeyValue({
  label,
  value,
  description,
  type = 'text',
  status,
  link,
  copyable = false,
  className,
  size = 'md',
  ...props
}: KeyValueProps) {
  const handleCopy = async () => {
    if (typeof value === 'string' || typeof value === 'number') {
      try {
        await navigator.clipboard.writeText(String(value));
        toast({
          title: 'Copied to clipboard',
          description: 'The value has been copied to your clipboard.',
        });
      } catch (err) {
        toast({
          title: 'Failed to copy',
          description: 'Unable to copy to clipboard.',
          variant: 'destructive',
        });
      }
    }
  };

  const formatValue = () => {
    if (status) {
      return (
        <Badge variant={status.variant}>
          {status.label}
        </Badge>
      );
    }

    if (type === 'currency' && typeof value === 'number') {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
      }).format(value);
    }

    if (type === 'percentage' && typeof value === 'number') {
      return `${value}%`;
    }

    if (type === 'date' && typeof value === 'string') {
      return new Date(value).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    }

    if (type === 'link' && link) {
      return (
        <a
          href={link}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center space-x-1 text-aimy-primary hover:text-aimy-primary/80 transition-colors"
        >
          <span>{value}</span>
          <ExternalLink className="h-3 w-3" />
        </a>
      );
    }

    if (type === 'copyable' && copyable) {
      return (
        <div className="flex items-center space-x-2">
          <span className="font-mono text-sm">{value}</span>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleCopy}
            className="h-6 w-6 p-0"
          >
            <Copy className="h-3 w-3" />
          </Button>
        </div>
      );
    }

    return value;
  };

  const getSizeStyles = () => {
    switch (size) {
      case 'sm':
        return 'py-2';
      case 'lg':
        return 'py-4';
      default:
        return 'py-3';
    }
  };

  return (
    <div
      className={cn(
        'flex items-start justify-between',
        getSizeStyles(),
        className
      )}
      {...props}
    >
      <div className="flex-1 space-y-1">
        <dt className="text-sm font-medium text-base-ink-600 dark:text-base-ink-400">
          {label}
        </dt>
        <dd className="text-sm text-base-ink-900 dark:text-base-ink-100">
          {formatValue()}
        </dd>
        {description && (
          <p className="text-xs text-base-ink-500 dark:text-base-ink-400">
            {description}
          </p>
        )}
      </div>
    </div>
  );
}
