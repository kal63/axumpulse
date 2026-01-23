'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';
import { apiClient, type Game } from '@/lib/api-client';
import { QuizBattle } from '@/components/games/QuizBattle';
import { NeumorphicCard } from '@/components/user/NeumorphicCard';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface QuizQuestion {
  question: string;
  options: string[];
  correctIndex: number;
  explanation?: string;
}

export default function QuizPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, isLoading: authLoading } = useAuth();
  const [loading, setLoading] = useState(true);
  const [game, setGame] = useState<Game | null>(null);
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [loadingQuestions, setLoadingQuestions] = useState(false);

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
        // Auto-load questions
        loadQuestions(res.data.game);
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

  const loadQuestions = async (gameData: Game) => {
    try {
      setLoadingQuestions(true);
      const res = await apiClient.playGame(gameData.id);

      if (res.success && res.data) {
        setQuestions(res.data.content.questions || []);
        setSessionId(res.data.sessionId);
      } else {
        toast.error('Failed to load quiz questions');
      }
    } catch (error) {
      console.error('Error loading questions:', error);
      toast.error('Failed to load quiz questions');
    } finally {
      setLoadingQuestions(false);
    }
  };

  const handleComplete = async (answers: number[]) => {
    if (!game || !sessionId) return;

    try {
      const res = await apiClient.submitGameResults(
        game.id,
        {
          questions: questions.map((q, i) => ({
            question: q.question,
            correctIndex: q.correctIndex
          })),
          answers
        },
        sessionId
      );

      if (res.success && res.data) {
        toast.success(`Quiz completed! +${res.data.xpEarned} XP`, {
          description: res.data.leveledUp ? 'Level up!' : undefined
        });
      } else {
        toast.error('Failed to submit quiz results');
      }
    } catch (error) {
      console.error('Error submitting quiz:', error);
      toast.error('Failed to submit quiz results');
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
            {game.description || 'Test your fitness knowledge!'}
          </p>
        </div>

        {/* Game */}
        {loadingQuestions ? (
          <NeumorphicCard variant="raised" className="p-12 text-center">
            <Loader2 className="h-12 w-12 animate-spin text-cyan-500 mx-auto mb-4" />
            <p className="text-[var(--neumorphic-muted)]">
              Generating quiz questions...
            </p>
          </NeumorphicCard>
        ) : questions.length > 0 ? (
          <QuizBattle
            questions={questions}
            onComplete={handleComplete}
            xpReward={game.xpReward}
          />
        ) : (
          <NeumorphicCard variant="raised" className="p-12 text-center">
            <p className="text-[var(--neumorphic-muted)] mb-4">
              Failed to load quiz questions
            </p>
            <Button onClick={() => loadQuestions(game)}>
              Try Again
            </Button>
          </NeumorphicCard>
        )}
      </div>
    </div>
  );
}

