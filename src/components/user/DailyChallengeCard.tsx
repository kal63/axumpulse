'use client';

import { useState } from 'react';
import { NeumorphicCard } from './NeumorphicCard';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Zap, Target, Clock } from 'lucide-react';
import type { DailyChallenge } from '@/lib/api-client';

interface DailyChallengeCardProps {
  challenge: DailyChallenge;
  onComplete: (id: number) => Promise<void>;
  completing?: boolean;
}

export function DailyChallengeCard({ challenge, onComplete, completing = false }: DailyChallengeCardProps) {
  const [isCompleting, setIsCompleting] = useState(false);

  const handleComplete = async () => {
    if (challenge.completed || isCompleting) return;
    
    setIsCompleting(true);
    try {
      await onComplete(challenge.id);
    } finally {
      setIsCompleting(false);
    }
  };

  return (
    <NeumorphicCard variant="raised" className="p-6">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <h3 className="text-lg font-bold user-app-ink">
              {challenge.title}
            </h3>
            {challenge.completed && (
              <CheckCircle className="h-5 w-5 text-green-500" />
            )}
          </div>
          {challenge.description && (
            <p className="text-sm user-app-muted mb-3">
              {challenge.description}
            </p>
          )}
        </div>
      </div>

      {challenge.requirements && (
        <div className="mb-4">
          <div className="flex items-center gap-2 mb-2">
            <Target className="h-4 w-4 user-app-muted" />
            <span className="text-sm font-medium user-app-ink">
              Requirements:
            </span>
          </div>
          <p className="text-sm user-app-muted ml-6">
            {challenge.requirements}
          </p>
        </div>
      )}

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1">
            <Zap className="h-4 w-4 text-yellow-500" />
            <span className="text-sm font-semibold user-app-ink">
              +{challenge.xpReward || 0} XP
            </span>
          </div>
          {challenge.difficulty && (
            <Badge variant="secondary" className="text-xs">
              {challenge.difficulty}
            </Badge>
          )}
        </div>

        {challenge.completed ? (
          <div className="flex items-center gap-2 text-green-500">
            <CheckCircle className="h-5 w-5" />
            <span className="text-sm font-medium">Completed</span>
          </div>
        ) : (
          <Button
            onClick={handleComplete}
            disabled={isCompleting || completing}
            className="bg-gradient-to-r from-[var(--ethio-lemon)] to-[var(--ethio-deep-blue)] hover:opacity-95 text-white"
          >
            {isCompleting ? (
              <>
                <Clock className="h-4 w-4 mr-2 animate-spin" />
                Completing...
              </>
            ) : (
              'Complete Challenge'
            )}
          </Button>
        )}
      </div>
    </NeumorphicCard>
  );
}

