'use client';

import { NeumorphicCard } from './NeumorphicCard';
import { cn } from '@/lib/utils';
import { LucideIcon } from 'lucide-react';

interface AchievementCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  badge?: React.ReactNode;
  className?: string;
}

export function AchievementCard({ 
  icon: Icon, 
  title, 
  description, 
  badge,
  className 
}: AchievementCardProps) {
  return (
    <NeumorphicCard variant="raised" size="md" className={cn('relative', className)}>
      {badge && (
        <div className="absolute -top-2 -right-2 z-10">
          {badge}
        </div>
      )}
      
      <div className="flex items-center space-x-4">
        <div className="w-16 h-16 bg-orange-100 dark:bg-orange-900/20 rounded-full flex items-center justify-center flex-shrink-0">
          <Icon className="w-8 h-8 text-orange-600 dark:text-orange-400" />
        </div>
        
        <div className="flex-1">
          <h4 className="font-semibold text-[var(--neumorphic-text)]">
            {title}
          </h4>
          <p className="text-sm text-[var(--neumorphic-muted)] mt-1">
            {description}
          </p>
        </div>
      </div>
    </NeumorphicCard>
  );
}
