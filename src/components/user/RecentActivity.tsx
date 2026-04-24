'use client';

import { NeumorphicCard } from './NeumorphicCard';
import { cn } from '@/lib/utils';
import { LucideIcon } from 'lucide-react';

interface ActivityItem {
  id: string;
  icon: LucideIcon;
  title: string;
  description: string;
  xpGained?: number;
  timestamp: string;
  type: 'workout' | 'challenge' | 'achievement' | 'streak';
}

interface RecentActivityProps {
  activities: ActivityItem[];
  className?: string;
  maxItems?: number;
}

function ActivityItem({ activity }: { activity: ActivityItem }) {
  const Icon = activity.icon;
  
  const typeColors = {
    workout: 'text-blue-600 dark:text-blue-400',
    challenge: 'text-[var(--ethio-lemon-dark)] dark:text-[var(--ethio-lemon)]',
    achievement: 'text-yellow-600 dark:text-yellow-400',
    streak: 'text-orange-600 dark:text-orange-400'
  };

  return (
    <div className="flex items-start space-x-3 py-3 border-b border-gray-100 dark:border-gray-700 last:border-b-0">
      <div className={cn(
        'p-2 rounded-full bg-gray-100 dark:bg-gray-800',
        'flex-shrink-0'
      )}>
        <Icon className={cn('w-4 h-4', typeColors[activity.type])} />
      </div>
      
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-medium text-gray-900 dark:text-white truncate">
            {activity.title}
          </h4>
          {activity.xpGained && (
            <span className="text-xs font-semibold text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 px-2 py-1 rounded-full">
              +{activity.xpGained} XP
            </span>
          )}
        </div>
        <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
          {activity.description}
        </p>
        <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
          {activity.timestamp}
        </p>
      </div>
    </div>
  );
}

export function RecentActivity({ activities, className, maxItems = 5 }: RecentActivityProps) {
  const displayActivities = activities.slice(0, maxItems);

  return (
    <NeumorphicCard variant="raised" size="md" className={className}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Recent Activity
        </h3>
        <div className="text-xs text-gray-500 dark:text-gray-400">
          {activities.length} total
        </div>
      </div>
      
      {displayActivities.length > 0 ? (
        <div className="space-y-0">
          {displayActivities.map((activity) => (
            <ActivityItem key={activity.id} activity={activity} />
          ))}
        </div>
      ) : (
        <div className="text-center py-8">
          <div className="text-gray-400 dark:text-gray-500 mb-2">
            📊
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            No recent activity
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
            Complete workouts to see your progress here
          </p>
        </div>
      )}
    </NeumorphicCard>
  );
}
