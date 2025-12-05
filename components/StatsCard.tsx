import React from 'react';
import { LucideIcon } from 'lucide-react';

interface StatsCardProps {
  title: string;
  value: number;
  subValue?: string;
  icon: LucideIcon;
  colorClass: string;
}

export const StatsCard: React.FC<StatsCardProps> = ({ title, value, subValue, icon: Icon, colorClass }) => {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 flex items-start justify-between hover:shadow-md transition-shadow">
      <div>
        <p className="text-sm font-medium text-slate-500 mb-1">{title}</p>
        <h3 className={`text-2xl font-bold ${value < 0 ? 'text-red-600' : 'text-slate-800'}`}>
          {new Intl.NumberFormat('en-PK', { style: 'currency', currency: 'PKR', maximumFractionDigits: 0 }).format(value)}
        </h3>
        {subValue && (
          <p className="text-xs text-slate-400 mt-2 font-medium">
            {subValue}
          </p>
        )}
      </div>
      <div className={`p-3 rounded-lg ${colorClass}`}>
        <Icon className="w-6 h-6 text-white" />
      </div>
    </div>
  );
};