'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';
import { apiClient, type Game } from '@/lib/api-client';
import { NeumorphicCard } from '@/components/user/NeumorphicCard';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Gamepad2, 
  Zap, 
  Trophy,
  Play,
  History,
  Sparkles,
  Brain,
  MemoryStick
} from 'lucide-react';
import { toast } from 'sonner';
import Link from 'next/link';

export default function GamesHubPage() {
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();
  const [loading, setLoading] = useState(true);
  const [games, setGames] = useState<Game[]>([]);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    } else if (user) {
      loadGames();
    }
  }, [authLoading, user, router]);

  const loadGames = async () => {
    try {
      setLoading(true);
      const res = await apiClient.getGames({ active: true });

      if (res.success && res.data) {
        setGames(res.data.games);
      }
    } catch (error) {
      console.error('Error loading games:', error);
      toast.error('Failed to load games');
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

  const getGameColor = (gameType: string) => {
    switch (gameType) {
      case 'spin_win':
        return 'from-purple-500 to-pink-500';
      case 'quiz_battle':
        return 'from-blue-500 to-cyan-500';
      case 'memory_game':
        return 'from-green-500 to-emerald-500';
      default:
        return 'from-gray-500 to-gray-600';
    }
  };

  const getGameDescription = (gameType: string) => {
    switch (gameType) {
      case 'spin_win':
        return 'Spin the wheel and get a random exercise to complete!';
      case 'quiz_battle':
        return 'Test your fitness knowledge with AI-generated quiz questions!';
      case 'memory_game':
        return 'Match exercise pairs and improve your memory!';
      default:
        return 'Play and earn XP!';
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--neumorphic-bg)]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-500 mx-auto"></div>
          <p className="mt-4 text-[var(--neumorphic-muted)]">Loading games...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const gameTypes = ['spin_win', 'quiz_battle', 'memory_game'];
  const availableGames = gameTypes.map(type => 
    games.find(g => g.gameType === type)
  ).filter(Boolean) as Game[];

  return (
    <div className="min-h-screen bg-[var(--neumorphic-bg)] pb-20">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-[var(--neumorphic-text)] mb-2">
            Fitness Games
          </h1>
          <p className="text-[var(--neumorphic-muted)]">
            Play fun games to earn XP and learn about fitness!
          </p>
        </div>

        {/* Games Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {availableGames.map((game) => {
            const Icon = getGameIcon(game.gameType);
            const colorClass = getGameColor(game.gameType);
            const description = getGameDescription(game.gameType);

            return (
              <NeumorphicCard 
                key={game.id} 
                variant="raised" 
                className="p-6 hover:scale-105 transition-transform cursor-pointer"
                onClick={() => {
                  if (game.gameType === 'spin_win') {
                    router.push(`/user/games/spin-win?id=${game.id}`);
                  } else if (game.gameType === 'quiz_battle') {
                    router.push(`/user/games/quiz?id=${game.id}`);
                  } else if (game.gameType === 'memory_game') {
                    router.push(`/user/games/memory?id=${game.id}`);
                  }
                }}
              >
                <div className={`w-16 h-16 bg-gradient-to-br ${colorClass} rounded-xl flex items-center justify-center mb-4 mx-auto`}>
                  <Icon className="h-8 w-8 text-white" />
                </div>
                
                <h3 className="text-xl font-bold text-[var(--neumorphic-text)] text-center mb-2">
                  {game.title}
                </h3>
                
                <p className="text-sm text-[var(--neumorphic-muted)] text-center mb-4">
                  {description}
                </p>

                <div className="flex items-center justify-center gap-2 mb-4">
                  <Zap className="h-4 w-4 text-yellow-500" />
                  <span className="text-sm font-semibold text-[var(--neumorphic-text)]">
                    +{game.xpReward} XP
                  </span>
                  {game.difficulty && (
                    <>
                      <span className="text-[var(--neumorphic-muted)]">•</span>
                      <Badge variant="secondary" className="text-xs">
                        {game.difficulty}
                      </Badge>
                    </>
                  )}
                </div>

                <Button 
                  className="w-full bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-600 hover:to-purple-700 text-white"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (game.gameType === 'spin_win') {
                      router.push(`/user/games/spin-win?id=${game.id}`);
                    } else if (game.gameType === 'quiz_battle') {
                      router.push(`/user/games/quiz?id=${game.id}`);
                    } else if (game.gameType === 'memory_game') {
                      router.push(`/user/games/memory?id=${game.id}`);
                    }
                  }}
                >
                  <Play className="h-4 w-4 mr-2" />
                  Play Now
                </Button>
              </NeumorphicCard>
            );
          })}
        </div>

        {/* Game History Link */}
        <div className="text-center">
          <Link href="/user/games/history">
            <Button variant="outline" className="text-[var(--neumorphic-text)]">
              <History className="h-4 w-4 mr-2" />
              View Game History
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}

