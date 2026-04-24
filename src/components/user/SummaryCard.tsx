'use client';

import { NeumorphicCard } from './NeumorphicCard';
import { cn } from '@/lib/utils';

interface SummaryItem {
  label: string;
  value: string;
}

interface SummaryCardProps {
  title: string;
  items: SummaryItem[];
  badge?: React.ReactNode;
  className?: string;
}

export function SummaryCard({ 
  title, 
  items, 
  badge,
  className 
}: SummaryCardProps) {
  return (
    <NeumorphicCard variant="raised" size="md" className={cn('relative', className)}>
      {badge && (
        <div className="absolute -top-2 -right-2 z-10">
          {badge}
        </div>
      )}
      
      <div className="space-y-4">
        <h4 className="font-semibold user-app-ink">
          {title}
        </h4>
        
        <div className="space-y-3">
          {items.map((item, index) => (
            <div key={index} className="flex justify-between items-center">
              <span className="text-sm user-app-muted">
                {item.label}
              </span>
              <span className="text-sm font-semibold user-app-ink">
                {item.value}
              </span>
            </div>
          ))}
        </div>
      </div>
    </NeumorphicCard>
  );
}
