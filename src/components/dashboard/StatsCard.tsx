import React from 'react';
import { TrendingUp, TrendingDown, DollarSign, Timer } from 'lucide-react';

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  change?: {
    value: number;
    isPositive: boolean;
  };
  footer?: string;
  isProfit?: boolean;
}

const StatsCard: React.FC<StatsCardProps> = ({
  title,
  value,
  icon,
  change,
  footer,
  isProfit,
}) => {
  return (
    <div className="bg-gray-800 rounded-lg shadow-md p-4 flex flex-col h-full">
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-gray-400 text-sm font-medium">{title}</h3>
        <div className={`p-2 rounded-md ${isProfit ? 'bg-green-900/30 text-green-400' : 'bg-gray-700 text-indigo-400'}`}>
          {icon}
        </div>
      </div>
      
      <div className="flex-grow">
        <div className="flex items-baseline">
          <span className={`text-2xl font-bold ${isProfit ? (parseFloat(String(value)) >= 0 ? 'text-green-400' : 'text-green-500') : 'text-white'}`}>
            {value}
          </span>
          
          {change && (
            <span className={`ml-2 text-sm ${change.isPositive ? 'text-green-400' : 'text-green-500'} flex items-center`}>
              {change.isPositive ? <TrendingUp size={14} className="mr-1" /> : <TrendingDown size={14} className="mr-1" />}
              {change.value}%
            </span>
          )}
        </div>
        
        {footer && (
          <p className="mt-2 text-gray-500 text-xs">{footer}</p>
        )}
      </div>
    </div>
  );
};

export const StatsGrid: React.FC = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <StatsCard
        title="Total Discovered"
        value="42"
        icon={<DollarSign size={18} />}
        change={{ value: 12, isPositive: true }}
        footer="Last 24 hours"
      />
      <StatsCard
        title="Total Purchased"
        value="8"
        icon={<DollarSign size={18} />}
        change={{ value: 3, isPositive: true }}
        footer="Last 24 hours"
      />
      <StatsCard
        title="Total Profit"
        value="+$1,245.32"
        icon={<DollarSign size={18} />}
        change={{ value: 8.7, isPositive: true }}
        footer="Last 7 days"
        isProfit={true}
      />
      <StatsCard
        title="Uptime"
        value="14:22:45"
        icon={<Timer size={18} />}
        footer="Since last restart"
      />
    </div>
  );
};

export default StatsCard;