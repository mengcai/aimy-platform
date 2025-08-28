import React from 'react';
import { cn } from '../../lib/utils';

interface ChartData {
  month: string;
  subscriptions: number;
  redemptions: number;
  net: number;
}

interface AChartBarProps {
  data: ChartData[];
  title?: string;
  className?: string;
}

const AChartBar: React.FC<AChartBarProps> = ({ 
  data, 
  title, 
  className = '' 
}) => {
  if (data.length === 0) return null;

  const maxValue = Math.max(...data.map(d => Math.max(d.subscriptions, d.redemptions, d.net)));

  return (
    <div className={cn("bg-white rounded-lg border border-gray-200 p-6", className)}>
      {title && (
        <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>
      )}
      
      <div className="space-y-4">
        {data.map((d, i) => (
          <div key={i} className="space-y-2">
            <div className="flex justify-between text-sm text-gray-600">
              <span>{d.month}</span>
              <span>${d.net.toLocaleString()}</span>
            </div>
            <div className="flex space-x-1 h-8">
              {/* Subscriptions bar */}
              <div 
                className="bg-green-500 rounded-l"
                style={{ 
                  width: `${(d.subscriptions / maxValue) * 100}%`,
                  minWidth: '4px'
                }}
                title={`Subscriptions: $${d.subscriptions.toLocaleString()}`}
              />
              {/* Redemptions bar */}
              <div 
                className="bg-red-500 rounded-r"
                style={{ 
                  width: `${(d.redemptions / maxValue) * 100}%`,
                  minWidth: '4px'
                }}
                title={`Redemptions: $${d.redemptions.toLocaleString()}`}
              />
            </div>
          </div>
        ))}
      </div>
      
      <div className="flex justify-center space-x-6 mt-4 text-xs text-gray-500">
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-green-500 rounded"></div>
          <span>Subscriptions</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-red-500 rounded"></div>
          <span>Redemptions</span>
        </div>
      </div>
    </div>
  );
};

export default AChartBar;
