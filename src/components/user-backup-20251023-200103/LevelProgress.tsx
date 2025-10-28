'use client';

import { NeumorphicCard } from './NeumorphicCard';
import { cn } from '@/lib/utils';

interface LevelProgressProps {
  currentLevel: number;
  currentXP: number;
  xpToNextLevel: number;
  className?: string;
}

export function LevelProgress({ 
  currentLevel, 
  currentXP, 
  xpToNextLevel, 
  className 
}: LevelProgressProps) {
  const progress = Math.min((currentXP % 1000) / 1000, 1); // Assuming 1000 XP per level
  const nextLevel = currentLevel + 1;

  return (
    <NeumorphicCard variant="raised" size="md" className={className}>
      <div className="space-y-3">
        <div>
          <h3 className="text-lg font-semibold text-[var(--neumorphic-text)]">
            Level {currentLevel} Progress
          </h3>
          <p className="text-sm text-[var(--neumorphic-muted)]">
            {xpToNextLevel} XP to next level
          </p>
        </div>
        
        <div className="relative">
          <div className="w-full h-6 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-purple-500 to-blue-600 rounded-full transition-all duration-1000 ease-out relative"
              style={{ width: `${progress * 100}%` }}
            >
              {/* Shine effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse" />
            </div>
          </div>
          
          {/* Level indicator at the end */}
          <div className="absolute -top-1 -right-2 w-8 h-8 bg-gradient-to-r from-purple-500 to-blue-600 rounded-full flex items-center justify-center shadow-lg">
            <span className="text-white text-sm font-bold">{nextLevel}</span>
          </div>
        </div>
      </div>
    </NeumorphicCard>
  );
}
