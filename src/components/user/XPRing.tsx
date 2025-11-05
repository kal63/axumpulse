'use client';

import { useEffect, useState } from 'react';
import { NeumorphicCard } from './NeumorphicCard';
import { cn } from '@/lib/utils';

interface XPRingProps {
  currentXP: number;
  level: number;
  xpToNextLevel: number;
  xpProgress?: number; // XP progress in current level (optional, will calculate if not provided)
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  animated?: boolean;
}

export function XPRing({ 
  currentXP, 
  level, 
  xpToNextLevel, 
  xpProgress,
  className,
  size = 'lg',
  animated = true
}: XPRingProps) {
  const [animatedXP, setAnimatedXP] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  // Calculate progress based on XP within current level
  // If xpProgress is provided, use it; otherwise calculate from currentXP
  const xpInCurrentLevel = xpProgress !== undefined ? xpProgress : (currentXP % xpToNextLevel);
  const progress = xpToNextLevel > 0 ? Math.min(xpInCurrentLevel / xpToNextLevel, 1) : 0;
  const circumference = 2 * Math.PI * 50; // radius of 50 (smaller to fit inside padding)
  const strokeDasharray = circumference;
  const strokeDashoffset = circumference - (progress * circumference);

  const sizeClasses = {
    sm: 'w-24 h-24',
    md: 'w-32 h-32', 
    lg: 'w-40 h-40'
  };

  const textSizeClasses = {
    sm: 'text-lg',
    md: 'text-xl',
    lg: 'text-2xl'
  };

  const numberSizeClasses = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base'
  };

  useEffect(() => {
    if (animated) {
      setIsAnimating(true);
      const timer = setTimeout(() => {
        setAnimatedXP(currentXP);
        setIsAnimating(false);
      }, 300);
      return () => clearTimeout(timer);
    } else {
      setAnimatedXP(currentXP);
    }
  }, [currentXP, animated]);

  return (
    <NeumorphicCard 
      variant="raised" 
      size="lg" 
      className={cn('relative flex items-center justify-center overflow-visible', sizeClasses[size], className)}
    >
      <div className="relative w-full h-full flex items-center justify-center">
        {/* Background Circle */}
        <svg 
          className="absolute transform -rotate-90" 
          width="100%" 
          height="100%" 
          viewBox="0 0 120 120"
          style={{ width: '100%', height: '100%' }}
        >
          <circle
            cx="60"
            cy="60"
            r="50"
            fill="none"
            stroke="currentColor"
            strokeWidth="6"
            className="text-gray-200 dark:text-gray-700"
          />
        </svg>
        
        {/* Progress Circle */}
        <svg 
          className="absolute transform -rotate-90" 
          width="100%" 
          height="100%" 
          viewBox="0 0 120 120"
          style={{ width: '100%', height: '100%' }}
        >
          <defs>
            <linearGradient id={`xpGradient-${level}`} x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#00E6FF" />
              <stop offset="100%" stopColor="#FF0099" />
            </linearGradient>
          </defs>
          <circle
            cx="60"
            cy="60"
            r="50"
            fill="none"
            stroke={`url(#xpGradient-${level})`}
            strokeWidth="6"
            strokeLinecap="round"
            strokeDasharray={strokeDasharray}
            strokeDashoffset={strokeDashoffset}
            className={cn(
              'transition-all duration-1000 ease-out',
              isAnimating && 'animate-pulse'
            )}
            style={{
              strokeDasharray,
              strokeDashoffset: animated ? strokeDashoffset : circumference - (progress * circumference)
            }}
          />
        </svg>

        {/* Glow Effect (Dark Mode Only) */}
        <div className="absolute inset-0 rounded-full bg-gradient-to-r from-cyan-500/20 to-pink-500/20 blur-sm dark:block hidden pointer-events-none" />

        {/* Center Content */}
        <div className="relative z-10 text-center">
          <div className={cn('font-orbitron font-semibold text-gray-900 dark:text-white', textSizeClasses[size])}>
            {level}
          </div>
          <div className={cn('font-roboto-mono text-gray-600 dark:text-gray-300', numberSizeClasses[size])}>
            {animatedXP.toLocaleString()} XP
          </div>
        </div>
      </div>
    </NeumorphicCard>
  );
}
