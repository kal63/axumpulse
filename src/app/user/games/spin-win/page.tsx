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
  const [challenges, setChallenges] = useState<Array<{ id: number; title: string; xpReward: number }>>([]);
  const [recentSelections, setRecentSelections] = useState<number[]>([]); // Track recently selected challenge IDs

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
      const [gameRes, challengesRes] = await Promise.all([
        apiClient.getGameById(parseInt(gameId!)),
        apiClient.getUserChallenges({ page: 1, pageSize: 100 })
      ]);

      if (gameRes.success && gameRes.data) {
        setGame(gameRes.data.game);
      } else {
        toast.error('Game not found');
        router.push('/user/games');
        return;
      }

      // Fetch challenges marked as game challenges
      if (challengesRes.success && challengesRes.data) {
        const gameChallenges = challengesRes.data.items
          .filter((ch: any) => ch.isGameChallenge === true)
          .map((ch: any) => ({
            id: ch.id,
            title: ch.title,
            xpReward: ch.xpReward || 50
          }));
        setChallenges(gameChallenges);
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

    // Ensure we have at least one challenge
    if (!challenges || challenges.length === 0) {
      toast.error('No challenges available. Please contact an admin to add challenges to the game.');
      return;
    }

    try {
      setSpinning(true);
      
      // Prepare wheel challenges (the 8 displayed on the wheel)
      const wheelChallenges = challenges.slice(0, 8).map(ch => ({
        id: ch.id,
        title: ch.title,
        challengeId: ch.id
      }));

      // Call playGame with wheel challenges and recent selections
      const res = await apiClient.playGame(game.id, {
        wheelChallenges,
        recentSelections: recentSelections.slice(-3) // Only avoid last 3 selections
      });

      if (res.success && res.data) {
        const selectedExercise = res.data.content.exercise;
        // Ensure xpReward is set from challengeXp if available
        if (res.data.content.challengeXp && !selectedExercise.xpReward) {
          selectedExercise.xpReward = res.data.content.challengeXp;
        }
        setExercise(selectedExercise);
        setSessionId(res.data.sessionId);
        
        // Track this selection to avoid immediate repeats
        if (selectedExercise.challengeId) {
          setRecentSelections(prev => {
            const updated = [...prev, selectedExercise.challengeId];
            // Keep only last 5 selections
            return updated.slice(-5);
          });
        }
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
        exercise: exercise.name || exercise.title,
        completed: true,
        challengeXp: exercise.xpReward // Pass challenge XP to use instead of game XP
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
            exercise={exercise || undefined}
            onSpin={handleSpin}
            spinning={spinning}
            onComplete={handleComplete}
            xpReward={exercise?.xpReward || game.xpReward || 50}
            prizes={challenges}
          />
        </NeumorphicCard>

        {/* Info */}
        <div className="mt-6 text-center">
          <div className="inline-flex items-center gap-2 text-sm text-[var(--neumorphic-muted)]">
            <Zap className="h-4 w-4 text-yellow-500" />
            <span>
              {exercise?.xpReward 
                ? `Earn ${exercise.xpReward} XP for completing this challenge`
                : 'XP reward varies by challenge'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

