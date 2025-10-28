'use client';

import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface NeumorphicCardProps {
  children: ReactNode;
  className?: string;
  variant?: 'raised' | 'recessed' | 'flat';
  size?: 'sm' | 'md' | 'lg';
  onClick?: () => void;
  interactive?: boolean;
}

export function NeumorphicCard({ 
  children, 
  className, 
  variant = 'raised', 
  size = 'md',
  onClick,
  interactive = false
}: NeumorphicCardProps) {
  const baseClasses = 'rounded-[20px] transition-all duration-200';
  
  const sizeClasses = {
    sm: 'p-3',
    md: 'p-4',
    lg: 'p-6'
  };

  const variantClasses = {
    raised: 'shadow-[8px_8px_16px_rgba(15,23,42,0.15),-8px_-8px_16px_rgba(255,255,255,0.85)] dark:shadow-[8px_8px_16px_rgba(0,0,0,0.6),-8px_-8px_16px_rgba(255,255,255,0.06)]',
    recessed: 'shadow-[inset_6px_6px_12px_rgba(15,23,42,0.12),inset_-6px_-6px_12px_rgba(255,255,255,0.9)] dark:shadow-[inset_6px_6px_12px_rgba(0,0,0,0.65),inset_-6px_-6px_12px_rgba(255,255,255,0.05)]',
    flat: 'shadow-none'
  };

  const interactiveClasses = interactive 
    ? 'hover:scale-[1.02] hover:shadow-[12px_12px_24px_rgba(15,23,42,0.2),-12px_-12px_24px_rgba(255,255,255,0.9)] dark:hover:shadow-[12px_12px_24px_rgba(0,0,0,0.7),-12px_-12px_24px_rgba(255,255,255,0.08)] active:scale-[0.98] active:shadow-[inset_4px_4px_8px_rgba(15,23,42,0.2),inset_-4px_-4px_8px_rgba(255,255,255,0.8)] dark:active:shadow-[inset_4px_4px_8px_rgba(0,0,0,0.7),inset_-4px_-4px_8px_rgba(255,255,255,0.06)]'
    : '';

  return (
    <div
      className={cn(
        baseClasses,
        sizeClasses[size],
        variantClasses[variant],
        interactiveClasses,
        'bg-white dark:bg-[#16181C]',
        className
      )}
      onClick={onClick}
    >
      {children}
    </div>
  );
}
