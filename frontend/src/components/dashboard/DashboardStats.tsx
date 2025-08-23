import React from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface Stat {
  name: string;
  value: string | number;
  change: string;
  changeType: 'positive' | 'negative' | 'neutral';
}

interface DashboardStatsProps {
  stats: Stat[];
  loading?: boolean;
}

export const DashboardStats: React.FC<DashboardStatsProps> = ({ stats, loading = false }) => {
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(4)].map((_, index) => (
          <div key={index} className="bg-gradient-to-br from-gray-50 to-white rounded-3xl border border-gray-200 shadow-sm p-6 animate-pulse">
            <div className="flex items-center justify-between">
              <div className="space-y-3 flex-1">
                <div className="h-4 bg-gray-200 rounded-lg w-3/4"></div>
                <div className="h-8 bg-gray-200 rounded-lg w-1/2"></div>
              </div>
              <div className="h-4 bg-gray-200 rounded-lg w-16"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map((stat, index) => (
        <div 
          key={index} 
          className="bg-gradient-to-br from-white to-gray-50 rounded-3xl border border-gray-200 shadow-sm p-6 hover:shadow-md hover:border-gray-300 transition-all duration-300 group cursor-pointer"
        >
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-600 mb-2 group-hover:text-gray-700 transition-colors">
                {stat.name}
              </p>
              <p className="text-3xl font-bold text-gray-900 group-hover:text-gray-800 transition-colors">
                {stat.value}
              </p>
            </div>
            <div className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-sm font-medium transition-all duration-300 ${
              stat.changeType === 'positive' 
                ? 'bg-green-100 text-green-700 group-hover:bg-green-200' : 
              stat.changeType === 'negative' 
                ? 'bg-red-100 text-red-700 group-hover:bg-red-200' : 
                'bg-gray-100 text-gray-700 group-hover:bg-gray-200'
            }`}>
              {stat.changeType === 'positive' ? (
                <TrendingUp className="h-4 w-4" />
              ) : stat.changeType === 'negative' ? (
                <TrendingDown className="h-4 w-4" />
              ) : (
                <Minus className="h-4 w-4" />
              )}
              <span className="font-semibold">{stat.change}</span>
            </div>
          </div>
          
          {/* Subtle accent line */}
          <div className={`mt-4 h-1 rounded-full transition-all duration-300 ${
            stat.changeType === 'positive' 
              ? 'bg-gradient-to-r from-green-400 to-green-500' : 
            stat.changeType === 'negative' 
              ? 'bg-gradient-to-r from-red-400 to-red-500' : 
              'bg-gradient-to-r from-gray-400 to-gray-500'
          }`}></div>
        </div>
      ))}
    </div>
  );
};