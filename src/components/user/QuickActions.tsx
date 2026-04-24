'use client';

import { NeumorphicCard } from './NeumorphicCard';
import { cn } from '@/lib/utils';
import { LucideIcon } from 'lucide-react';

interface QuickActionProps {
  icon: LucideIcon;
  title: string;
  description: string;
  onClick: () => void;
  className?: string;
  variant?: 'primary' | 'secondary';
}

function QuickAction({ 
  icon: Icon, 
  title, 
  description, 
  onClick, 
  className,
  variant = 'secondary'
}: QuickActionProps) {
  return (
    <NeumorphicCard 
      variant="raised" 
      size="md" 
      className={cn(
        'cursor-pointer group',
        variant === 'primary' &&
          'bg-gradient-to-r from-emerald-50/95 to-sky-50/90 dark:from-emerald-950/35 dark:to-sky-950/25',
        className
      )}
      onClick={onClick}
      interactive
    >
      <div className="flex items-center space-x-4">
        <div className={cn(
          'p-3 rounded-full transition-colors duration-200',
          variant === 'primary' 
            ? 'bg-emerald-100/90 dark:bg-emerald-900/40 group-hover:bg-emerald-200/90 dark:group-hover:bg-emerald-800/50'
            : 'bg-gray-100 dark:bg-gray-800 group-hover:bg-gray-200 dark:group-hover:bg-gray-700'
        )}>
          <Icon className={cn(
            'w-6 h-6 transition-colors duration-200',
            variant === 'primary'
              ? 'text-[var(--ethio-lemon-dark)] dark:text-[var(--ethio-lemon)]'
              : 'text-gray-600 dark:text-gray-300'
          )} />
        </div>
        <div className="flex-1">
          <h3 className={cn(
            'font-semibold transition-colors duration-200',
            variant === 'primary'
              ? 'text-emerald-950 dark:text-emerald-100'
              : 'text-gray-900 dark:text-white'
          )}>
            {title}
          </h3>
          <p className={cn(
            'text-sm transition-colors duration-200',
            variant === 'primary'
              ? 'text-emerald-800 dark:text-emerald-200/90'
              : 'text-gray-600 dark:text-gray-400'
          )}>
            {description}
          </p>
        </div>
        <div className="text-gray-400 dark:text-gray-500 group-hover:text-gray-600 dark:group-hover:text-gray-300 transition-colors duration-200">
          →
        </div>
      </div>
    </NeumorphicCard>
  );
}

interface QuickActionsProps {
  actions: Array<{
    icon: LucideIcon;
    title: string;
    description: string;
    onClick: () => void;
    variant?: 'primary' | 'secondary';
  }>;
  className?: string;
}

export function QuickActions({ actions, className }: QuickActionsProps) {
  return (
    <div className={cn('space-y-3', className)}>
      {actions.map((action, index) => (
        <QuickAction key={index} {...action} />
      ))}
    </div>
  );
}
