import React from 'react';
import { cn } from '../../lib/utils';

interface SeparatorProps {
  orientation?: 'horizontal' | 'vertical';
  className?: string;
}

const Separator: React.FC<SeparatorProps> = ({ 
  orientation = 'horizontal', 
  className = '' 
}) => {
  return (
    <div
      className={cn(
        "bg-gray-200",
        orientation === 'horizontal' ? "h-px w-full" : "h-full w-px",
        className
      )}
    />
  );
};

export default Separator;
