import React from 'react';
import { cn } from '../../lib/utils';

interface ChartData {
  date: string;
  value: number;
}

interface AChartLineProps {
  data: ChartData[];
  title?: string;
  className?: string;
}

const AChartLine: React.FC<AChartLineProps> = ({ 
  data, 
  title, 
  className = '' 
}) => {
  if (data.length === 0) return null;

  const maxValue = Math.max(...data.map(d => d.value));
  const minValue = Math.min(...data.map(d => d.value));
  const range = maxValue - minValue;

  return (
    <div className={cn("bg-white rounded-lg border border-gray-200 p-6", className)}>
      {title && (
        <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>
      )}
      
      <div className="relative h-64">
        <svg className="w-full h-full" viewBox={`0 0 ${data.length * 60} 200`}>
          {/* Grid lines */}
          {[0, 1, 2, 3, 4].map((i) => (
            <line
              key={i}
              x1="0"
              y1={40 + i * 40}
              x2={data.length * 60}
              y2={40 + i * 40}
              stroke="#e5e7eb"
              strokeWidth="1"
            />
          ))}
          
          {/* Line chart */}
          <polyline
            fill="none"
            stroke="#3b82f6"
            strokeWidth="3"
            points={data.map((d, i) => {
              const x = i * 60 + 30;
              const y = 200 - ((d.value - minValue) / range) * 160 - 20;
              return `${x},${y}`;
            }).join(' ')}
          />
          
          {/* Data points */}
          {data.map((d, i) => {
            const x = i * 60 + 30;
            const y = 200 - ((d.value - minValue) / range) * 160 - 20;
            return (
              <circle
                key={i}
                cx={x}
                cy={y}
                r="4"
                fill="#3b82f6"
              />
            );
          })}
        </svg>
        
        {/* X-axis labels */}
        <div className="flex justify-between mt-2 text-xs text-gray-500">
          {data.map((d, i) => (
            <span key={i} className="text-center">
              {new Date(d.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AChartLine;
