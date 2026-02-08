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
  const [workoutPlans, setWorkoutPlans] = useState<Array<{ id: number; title: string; xpReward: number }>>([]);
  const [recentSelections, setRecentSelections] = useState<number[]>([]); // Track recently selected workout plan IDs

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
      const [gameRes, workoutPlansRes] = await Promise.all([
        apiClient.getGameById(parseInt(gameId!)),
        apiClient.getUserWorkoutPlans({ page: 1, pageSize: 100 })
      ]);

      if (gameRes.success && gameRes.data) {
        setGame(gameRes.data.game);
      } else {
        toast.error('Game not found');
        router.push('/user/games');
        return;
      }

      // Fetch workout plans marked as game challenges
      if (workoutPlansRes.success && workoutPlansRes.data) {
        const gameWorkoutPlans = workoutPlansRes.data.items
          .filter((wp: any) => wp.isGameChallenge === true)
          .map((wp: any) => ({
            id: wp.id,
            title: wp.title,
            xpReward: gameRes.data?.game?.xpReward || 50 // Use game XP since workout plans don't have xpReward
          }));
        setWorkoutPlans(gameWorkoutPlans);
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

    // Ensure we have at least one workout plan
    if (!workoutPlans || workoutPlans.length === 0) {
      toast.error('No workout plans available. Please contact an admin to add workout plans to the game.');
      return;
    }

    try {
      setSpinning(true);
      
      // Prepare wheel workouts (the 8 displayed on the wheel)
      const wheelWorkouts = workoutPlans.slice(0, 8).map(wp => ({
        id: wp.id,
        title: wp.title,
        workoutPlanId: wp.id
      }));

      // Call playGame with wheel workouts and recent selections
      const res = await apiClient.playGame(game.id, {
        wheelWorkouts,
        recentSelections: recentSelections.slice(-3) // Only avoid last 3 selections
      });

      if (res.success && res.data) {
        const selectedExercise = res.data.content.exercise;
        // Ensure xpReward is set from challengeXp if available (for backward compatibility)
        if (res.data.content.challengeXp && !selectedExercise.xpReward) {
          selectedExercise.xpReward = res.data.content.challengeXp;
        }
        setExercise(selectedExercise);
        setSessionId(res.data.sessionId);
        
        // Track this selection to avoid immediate repeats
        if (selectedExercise.workoutPlanId || selectedExercise.challengeId) {
          const id = selectedExercise.workoutPlanId || selectedExercise.challengeId;
          setRecentSelections(prev => {
            const updated = [...prev, id];
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
    // For workout plans, this should not be called (user navigates to workout plan page instead)
    // This is kept for backward compatibility with challenges if any remain
    if (!game || !exercise || !sessionId) return;

    // If it's a workout plan, don't complete here - user should go to workout plan page
    if (exercise.workoutPlanId) {
      return;
    }

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

  const handleViewWorkoutPlan = () => {
    if (exercise?.workoutPlanId && game) {
      router.push(`/user/workout-plans/${exercise.workoutPlanId}?fromGame=true&gameId=${game.id}`);
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
            onViewWorkoutPlan={exercise?.workoutPlanId ? handleViewWorkoutPlan : undefined}
            xpReward={exercise?.xpReward || game.xpReward || 50}
            prizes={workoutPlans}
          />
        </NeumorphicCard>

        {/* Info */}
        <div className="mt-6 text-center">
          <div className="inline-flex items-center gap-2 text-sm text-[var(--neumorphic-muted)]">
            <Zap className="h-4 w-4 text-yellow-500" />
            <span>
              {exercise?.xpReward 
                ? `Earn ${exercise.xpReward} XP for completing this workout plan`
                : 'XP reward varies by workout plan'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

