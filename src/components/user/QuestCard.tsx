'use client';

import { NeumorphicCard } from './NeumorphicCard';
import { cn } from '@/lib/utils';
import { LucideIcon } from 'lucide-react';

interface QuestCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  progress: number;
  maxProgress: number;
  xpReward: number;
  completed?: boolean;
  className?: string;
}

export function QuestCard({ 
  icon: Icon, 
  title, 
  description, 
  progress, 
  maxProgress, 
  xpReward, 
  completed = false,
  className 
}: QuestCardProps) {
  const progressPercentage = Math.min((progress / maxProgress) * 100, 100);
  
  const getProgressColor = () => {
    if (completed) return 'from-green-400 to-green-600';
    if (progressPercentage > 50) return 'from-blue-400 to-blue-600';
    return 'from-pink-400 to-red-500';
  };

  const getIconColor = () => {
    if (completed) return 'text-green-600 dark:text-green-400';
    if (progressPercentage > 50) return 'text-blue-600 dark:text-blue-400';
    return 'text-red-600 dark:text-red-400';
  };

  return (
    <NeumorphicCard variant="raised" size="md" className={className}>
      <div className="space-y-4">
        <div className="flex items-start space-x-3">
          <div className={cn(
            'p-2 rounded-lg',
            completed ? 'bg-green-100 dark:bg-green-900/20' : 'bg-gray-100 dark:bg-gray-800'
          )}>
            <Icon className={cn('w-5 h-5', getIconColor())} />
          </div>
          <div className="flex-1">
            <h4 className="font-semibold user-app-ink">
              {title}
            </h4>
            <p className="text-sm user-app-muted mt-1">
              {description}
            </p>
          </div>
        </div>
        
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm user-app-muted">
              {completed ? 'Completed!' : `${progress}/${maxProgress}`}
            </span>
            <span className="text-sm font-semibold text-green-600 dark:text-green-400">
              +{xpReward} XP
            </span>
          </div>
          
          <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
            <div 
              className={cn(
                'h-full bg-gradient-to-r rounded-full transition-all duration-1000 ease-out',
                getProgressColor()
              )}
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
        </div>
      </div>
    </NeumorphicCard>
  );
}
