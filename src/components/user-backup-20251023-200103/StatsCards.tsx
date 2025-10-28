'use client';

import { NeumorphicCard } from './NeumorphicCard';
import { cn } from '@/lib/utils';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  icon: LucideIcon;
  value: string | number;
  label: string;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
  className?: string;
  onClick?: () => void;
}

function StatCard({ 
  icon: Icon, 
  value, 
  label, 
  trend, 
  trendValue, 
  className,
  onClick 
}: StatCardProps) {
  const trendColors = {
    up: 'text-green-500',
    down: 'text-red-500', 
    neutral: 'text-gray-500'
  };

  return (
    <NeumorphicCard 
      variant="raised" 
      size="sm" 
      className={cn('text-center cursor-pointer', className)}
      onClick={onClick}
      interactive
    >
      <div className="flex flex-col items-center space-y-2">
        <div className="p-2 rounded-full bg-gray-100 dark:bg-gray-800">
          <Icon className="w-5 h-5 text-gray-600 dark:text-gray-300" />
        </div>
        <div className="font-roboto-mono text-lg font-semibold text-gray-900 dark:text-white">
          {value}
        </div>
        <div className="text-xs text-gray-600 dark:text-gray-400">
          {label}
        </div>
        {trend && trendValue && (
          <div className={cn('text-xs font-medium', trendColors[trend])}>
            {trend === 'up' && '↗'} {trend === 'down' && '↘'} {trendValue}
          </div>
        )}
      </div>
    </NeumorphicCard>
  );
}

interface StatsCardsProps {
  stats: Array<{
    icon: LucideIcon;
    value: string | number;
    label: string;
    trend?: 'up' | 'down' | 'neutral';
    trendValue?: string;
    onClick?: () => void;
  }>;
  className?: string;
  layout?: 'horizontal' | 'grid';
}

export function StatsCards({ stats, className, layout = 'horizontal' }: StatsCardsProps) {
  if (layout === 'grid') {
    return (
      <div className={cn('grid grid-cols-2 gap-4', className)}>
        {stats.map((stat, index) => (
          <StatCard key={index} {...stat} />
        ))}
      </div>
    );
  }

  return (
    <div className={cn('flex space-x-4 overflow-x-auto pb-2', className)}>
      {stats.map((stat, index) => (
        <div key={index} className="flex-shrink-0 w-24">
          <StatCard {...stat} />
        </div>
      ))}
    </div>
  );
}
