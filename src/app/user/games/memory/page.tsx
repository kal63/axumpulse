'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';
import { apiClient, type Game } from '@/lib/api-client';
import { MemoryGame } from '@/components/games/MemoryGame';
import { NeumorphicCard } from '@/components/user/NeumorphicCard';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface ExercisePair {
  exercise1: {
    name: string;
    muscleGroup?: string;
    description?: string;
  };
  exercise2: {
    name: string;
    muscleGroup?: string;
    description?: string;
  };
}

export default function MemoryPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, isLoading: authLoading } = useAuth();
  const [loading, setLoading] = useState(true);
  const [game, setGame] = useState<Game | null>(null);
  const [pairs, setPairs] = useState<ExercisePair[]>([]);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [loadingPairs, setLoadingPairs] = useState(false);

  const gameId = searchParams.get('id');

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    } else if (user && gameId) {
      loadGame();
    }
  }, [authLoading, user, router, gameId]);

  const loadGame = async () => {
    try {
      setLoading(true);
      const res = await apiClient.getGameById(parseInt(gameId!));

      if (res.success && res.data) {
        setGame(res.data.game);
        // Auto-load pairs
        loadPairs(res.data.game);
      } else {
        toast.error('Game not found');
        router.push('/user/games');
      }
    } catch (error) {
      console.error('Error loading game:', error);
      toast.error('Failed to load game');
      router.push('/user/games');
    } finally {
      setLoading(false);
    }
  };

  const loadPairs = async (gameData: Game) => {
    try {
      setLoadingPairs(true);
      const res = await apiClient.playGame(gameData.id);

      if (res.success && res.data) {
        setPairs(res.data.content.pairs || []);
        setSessionId(res.data.sessionId);
      } else {
        toast.error('Failed to load game pairs');
      }
    } catch (error) {
      console.error('Error loading pairs:', error);
      toast.error('Failed to load game pairs');
    } finally {
      setLoadingPairs(false);
    }
  };

  const handleComplete = async (matches: number, attempts: number, timeTaken: number) => {
    if (!game || !sessionId) return;

    try {
      const res = await apiClient.submitGameResults(
        game.id,
        {
          pairs: pairs.length,
          matches,
          attempts,
          timeTaken
        },
        sessionId
      );

      if (res.success && res.data) {
        toast.success(`Game completed! +${res.data.xpEarned} XP`, {
          description: res.data.leveledUp ? 'Level up!' : undefined
        });
      } else {
        toast.error('Failed to submit game results');
      }
    } catch (error) {
      console.error('Error submitting game:', error);
      toast.error('Failed to submit game results');
    }
  };

  if (authLoading || loading) {
    return (
      <div className="flex min-h-dvh min-h-screen items-center justify-center user-app-page">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-500 mx-auto"></div>
          <p className="mt-4 user-app-muted">Loading game...</p>
        </div>
      </div>
    );
  }

  if (!user || !game) {
    return null;
  }

  return (
    <div className="min-h-dvh min-h-full user-app-page pb-20">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.push('/user/games')}
            className="mb-4"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-3xl font-bold user-app-ink mb-2">
            {game.title}
          </h1>
          <p className="user-app-muted">
            {game.description || 'Match exercise pairs to win!'}
          </p>
        </div>

        {/* Game */}
        {loadingPairs ? (
          <NeumorphicCard variant="raised" className="p-12 text-center">
            <Loader2 className="h-12 w-12 animate-spin text-cyan-500 mx-auto mb-4" />
            <p className="user-app-muted">
              Generating exercise pairs...
            </p>
          </NeumorphicCard>
        ) : pairs.length > 0 ? (
          <NeumorphicCard variant="raised" className="p-3 sm:p-4">
            <MemoryGame
              pairs={pairs}
              onComplete={handleComplete}
              xpReward={game.xpReward}
            />
          </NeumorphicCard>
        ) : (
          <NeumorphicCard variant="raised" className="p-12 text-center">
            <p className="user-app-muted mb-4">
              Failed to load exercise pairs
            </p>
            <Button onClick={() => loadPairs(game)}>
              Try Again
            </Button>
          </NeumorphicCard>
        )}
      </div>
    </div>
  );
}

