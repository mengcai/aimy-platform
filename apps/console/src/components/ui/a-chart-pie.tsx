import React from 'react';
import { cn } from '../../lib/utils';

interface ChartData {
  label: string;
  value: number;
  color: string;
}

interface AChartPieProps {
  data: ChartData[];
  title?: string;
  className?: string;
}

const AChartPie: React.FC<AChartPieProps> = ({ 
  data, 
  title, 
  className = '' 
}) => {
  const total = data.reduce((sum, item) => sum + item.value, 0);
  
  // Simple pie chart using CSS
  const renderPieChart = () => {
    if (data.length === 0) return null;
    
    let currentAngle = 0;
    return data.map((item, index) => {
      const percentage = (item.value / total) * 100;
      const angle = (percentage / 100) * 360;
      
      const slice = (
        <div
          key={index}
          className="absolute w-full h-full rounded-full"
          style={{
            background: `conic-gradient(${item.color} ${currentAngle}deg, transparent ${currentAngle}deg)`,
            transform: `rotate(${currentAngle}deg)`,
          }}
        />
      );
      
      currentAngle += angle;
      return slice;
    });
  };

  return (
    <div className={cn("bg-white rounded-lg border border-gray-200 p-6", className)}>
      {title && (
        <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>
      )}
      
      <div className="flex items-center space-x-6">
        {/* Pie Chart */}
        <div className="relative w-32 h-32">
          {renderPieChart()}
        </div>
        
        {/* Legend */}
        <div className="flex-1">
          <div className="space-y-2">
            {data.map((item, index) => (
              <div key={index} className="flex items-center space-x-3">
                <div 
                  className="w-4 h-4 rounded-full"
                  style={{ backgroundColor: item.color }}
                />
                <span className="text-sm text-gray-600">{item.label}</span>
                <span className="text-sm font-medium text-gray-900">
                  {((item.value / total) * 100).toFixed(1)}%
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AChartPie;
