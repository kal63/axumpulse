'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';
import { apiClient, type Game } from '@/lib/api-client';
import { SpinAndWin } from '@/components/games/SpinAndWin';
import { NeumorphicCard } from '@/components/user/NeumorphicCard';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Zap } from 'lucide-react';
import { toast } from 'sonner';

export default function SpinWinPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, isLoading: authLoading } = useAuth();
  const [loading, setLoading] = useState(true);
  const [game, setGame] = useState<Game | null>(null);
  const [exercise, setExercise] = useState<any>(null);
  const [spinning, setSpinning] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);

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

  const handleSpin = async () => {
    if (!game || spinning) return;

    try {
      setSpinning(true);
      const res = await apiClient.playGame(game.id);

      if (res.success && res.data) {
        setExercise(res.data.content.exercise);
        setSessionId(res.data.sessionId);
      } else {
        toast.error('Failed to spin wheel');
      }
    } catch (error) {
      console.error('Error spinning:', error);
      toast.error('Failed to spin wheel');
    } finally {
      setSpinning(false);
    }
  };

  const handleComplete = async () => {
    if (!game || !exercise || !sessionId) return;

    try {
      const res = await apiClient.submitGameResults(game.id, {
        exercise: exercise.name,
        completed: true
      }, sessionId);

      if (res.success && res.data) {
        toast.success(`Exercise completed! +${res.data.xpEarned} XP`, {
          description: res.data.leveledUp ? 'Level up!' : undefined
        });
        
        // Reset for next spin
        setTimeout(() => {
          setExercise(null);
          setSessionId(null);
        }, 2000);
      } else {
        toast.error('Failed to complete exercise');
      }
    } catch (error) {
      console.error('Error completing exercise:', error);
      toast.error('Failed to complete exercise');
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--neumorphic-bg)]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-500 mx-auto"></div>
          <p className="mt-4 text-[var(--neumorphic-muted)]">Loading game...</p>
        </div>
      </div>
    );
  }

  if (!user || !game) {
    return null;
  }

  return (
    <div className="min-h-screen bg-[var(--neumorphic-bg)] pb-20">
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
          <h1 className="text-3xl font-bold text-[var(--neumorphic-text)] mb-2">
            {game.title}
          </h1>
          <p className="text-[var(--neumorphic-muted)]">
            {game.description || 'Spin the wheel to get a random exercise!'}
          </p>
        </div>

        {/* Game */}
        <NeumorphicCard variant="raised" className="p-8">
          <SpinAndWin
            exercise={exercise || { name: '', description: '' }}
            onSpin={handleSpin}
            spinning={spinning}
            onComplete={handleComplete}
            xpReward={game.xpReward}
          />
        </NeumorphicCard>

        {/* Info */}
        <div className="mt-6 text-center">
          <div className="inline-flex items-center gap-2 text-sm text-[var(--neumorphic-muted)]">
            <Zap className="h-4 w-4 text-yellow-500" />
            <span>Earn {game.xpReward} XP for completing the exercise</span>
          </div>
        </div>
      </div>
    </div>
  );
}

