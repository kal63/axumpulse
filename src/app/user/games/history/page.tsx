'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';
import { apiClient, type Game } from '@/lib/api-client';
import { NeumorphicCard } from '@/components/user/NeumorphicCard';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  ArrowLeft, 
  History, 
  Trophy, 
  Zap,
  Calendar,
  Gamepad2,
  Brain,
  MemoryStick,
  Sparkles
} from 'lucide-react';
import { toast } from 'sonner';

interface GameHistoryEntry {
  id: number;
  userId: number;
  gameId: number;
  score: number;
  xpEarned: number;
  completedAt: string;
  gameData: any;
  game: Game | null;
}

export default function GameHistoryPage() {
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();
  const [loading, setLoading] = useState(true);
  const [history, setHistory] = useState<GameHistoryEntry[]>([]);
  const [filter, setFilter] = useState<'all' | 'spin_win' | 'quiz_battle' | 'memory_game'>('all');

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    } else if (user) {
      loadHistory();
    }
  }, [authLoading, user, router, filter]);

  const loadHistory = async () => {
    try {
      setLoading(true);
      const params: any = {};
      if (filter !== 'all') {
        params.gameType = filter;
      }
      
      const res = await apiClient.getGameHistory(params);

      console.log('Game history response:', res);
      
      if (res.success && res.data) {
        console.log('Game history data:', res.data);
        console.log('History array:', res.data.history);
        setHistory(res.data.history || []);
      } else {
        console.error('Game history error:', res.error);
        toast.error(res.error?.message || 'Failed to load game history');
      }
    } catch (error) {
      console.error('Error loading game history:', error);
      toast.error('Failed to load game history');
    } finally {
      setLoading(false);
    }
  };

  const getGameIcon = (gameType: string) => {
    switch (gameType) {
      case 'spin_win':
        return Sparkles;
      case 'quiz_battle':
        return Brain;
      case 'memory_game':
        return MemoryStick;
      default:
        return Gamepad2;
    }
  };

  const getGameName = (gameType: string) => {
    switch (gameType) {
      case 'spin_win':
        return 'Spin & Win';
      case 'quiz_battle':
        return 'Quiz Battle';
      case 'memory_game':
        return 'Memory Game';
      default:
        return 'Unknown Game';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (authLoading || loading) {
    return (
      <div className="flex min-h-dvh min-h-screen items-center justify-center user-app-page">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--ethio-deep-blue)] mx-auto"></div>
          <p className="mt-4 user-app-muted">Loading game history...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const filteredHistory = filter === 'all' 
    ? history 
    : history.filter(entry => {
        // Try multiple ways to get gameType
        const gameType = entry.game?.gameType || entry.gameData?.gameType;
        return gameType === filter;
      });

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
            Game History
          </h1>
          <p className="user-app-muted">
            View your past game sessions and achievements
          </p>
        </div>

        {/* Filters */}
        <div className="mb-6 flex flex-wrap gap-2">
          <Button
            variant={filter === 'all' ? 'default' : 'outline'}
            onClick={() => setFilter('all')}
            size="sm"
          >
            All Games
          </Button>
          <Button
            variant={filter === 'spin_win' ? 'default' : 'outline'}
            onClick={() => setFilter('spin_win')}
            size="sm"
          >
            <Sparkles className="h-4 w-4 mr-2" />
            Spin & Win
          </Button>
          <Button
            variant={filter === 'quiz_battle' ? 'default' : 'outline'}
            onClick={() => setFilter('quiz_battle')}
            size="sm"
          >
            <Brain className="h-4 w-4 mr-2" />
            Quiz Battle
          </Button>
          <Button
            variant={filter === 'memory_game' ? 'default' : 'outline'}
            onClick={() => setFilter('memory_game')}
            size="sm"
          >
            <MemoryStick className="h-4 w-4 mr-2" />
            Memory Game
          </Button>
        </div>

        {/* History List */}
        {filteredHistory.length === 0 ? (
          <NeumorphicCard variant="raised" className="p-12 text-center">
            <History className="h-16 w-16 user-app-muted mx-auto mb-4 opacity-50" />
            <h3 className="text-xl font-semibold user-app-ink mb-2">
              No Game History
            </h3>
            <p className="user-app-muted mb-4">
              {filter === 'all' 
                ? "You haven't played any games yet. Start playing to see your history here!"
                : `You haven't played any ${getGameName(filter)} games yet.`
              }
            </p>
            <Button onClick={() => router.push('/user/games')}>
              Play Games
            </Button>
          </NeumorphicCard>
        ) : (
          <div className="space-y-4">
            {filteredHistory.map((entry) => {
              // Fallback: if game is null, try to get gameType from gameData or use default
              const gameType = entry.game?.gameType || entry.gameData?.gameType || 'unknown';
              const Icon = getGameIcon(gameType);
              const gameName = entry.game?.title || getGameName(gameType);

              return (
                <NeumorphicCard key={entry.id} variant="raised" className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4 flex-1">
                      <div className="w-12 h-12 bg-gradient-to-br from-[var(--ethio-lemon)] to-[var(--ethio-deep-blue)] rounded-xl flex items-center justify-center">
                        <Icon className="h-6 w-6 text-white" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-bold user-app-ink mb-1">
                          {gameName}
                        </h3>
                        <div className="flex items-center gap-4 text-sm user-app-muted mb-2">
                          <div className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            <span>{formatDate(entry.completedAt)}</span>
                          </div>
                          {entry.game?.difficulty && (
                            <Badge variant="secondary" className="text-xs">
                              {entry.game.difficulty}
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-6 mt-3">
                          <div className="flex items-center gap-2">
                            <Trophy className="h-4 w-4 text-yellow-500" />
                            <span className="text-sm font-semibold user-app-ink">
                              Score: {entry.score}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Zap className="h-4 w-4 text-yellow-500" />
                            <span className="text-sm font-semibold user-app-ink">
                              +{entry.xpEarned} XP
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </NeumorphicCard>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

