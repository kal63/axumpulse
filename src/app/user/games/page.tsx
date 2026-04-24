'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';
import { apiClient, type Game } from '@/lib/api-client';
import { NeumorphicCard } from '@/components/user/NeumorphicCard';
import { SubscriptionContextBanner } from '@/components/user/SubscriptionContextBanner';
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
  MemoryStick,
  UserCheck,
  Users,
  Dumbbell
} from 'lucide-react';
import { toast } from 'sonner';
import Link from 'next/link';

export default function GamesHubPage() {
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();
  const [subscription, setSubscription] = useState<any | null>(null);
  const [subscriptionLoading, setSubscriptionLoading] = useState(true);
  const isMedicalPro = user?.isMedical || false;
  const isTrainer = user?.isTrainer || false;
  const [loading, setLoading] = useState(true);
  const [games, setGames] = useState<Game[]>([]);

  // fetch subscription status
  useEffect(() => {
    if (user && !isMedicalPro && !isTrainer) {
      fetchSubscription();
    } else if (isMedicalPro || isTrainer) {
      setSubscriptionLoading(false);
    }
  }, [user, isMedicalPro, isTrainer]);

  const fetchSubscription = async () => {
    try {
      setSubscriptionLoading(true);
      const response = await apiClient.getMySubscription();
      if (response.success && response.data) {
        setSubscription(response.data.subscription === null ? null : response.data.subscription);
      }
    } catch (err) {
      console.error('Failed to fetch subscription:', err);
      setSubscription(null);
    } finally {
      setSubscriptionLoading(false);
    }
  };

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    } else if (user) {
      if (subscriptionLoading || subscription || isMedicalPro || isTrainer) {
        loadGames();
      } else {
        setLoading(false);
      }
    }
  }, [authLoading, user, router, subscriptionLoading, subscription, isMedicalPro, isTrainer]);

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
        return 'from-[var(--ethio-lemon)] to-[var(--ethio-lemon-dark)]';
      case 'quiz_battle':
        return 'from-[var(--ethio-lemon)] to-[var(--ethio-deep-blue)]';
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

  if (
    authLoading ||
    ((loading && (subscription || isMedicalPro || isTrainer)) || (subscriptionLoading && !isMedicalPro && !isTrainer))
  ) {
    return (
      <div className="flex min-h-dvh min-h-screen items-center justify-center user-app-page">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--ethio-deep-blue)] mx-auto"></div>
          <p className="mt-4 user-app-muted">Loading games...</p>
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

  const hasAccess = subscription || isMedicalPro || isTrainer;

  return (
    <>
      <div className="text-center mt-8 mb-8">
        {/* <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-[var(--ethio-lemon)] to-[var(--ethio-deep-blue)] text-white px-4 py-2 rounded-full text-sm font-medium mb-4">
                                    <Dumbbell className="w-4 h-4" />
                                    <span>Structured Fitness Programs</span>
                                </div> */}
        <h1 className="text-4xl md:text-6xl font-bold user-app-ink mb-4">
          🎮 Fitness Games
        </h1>
        <p className="text-xl user-app-muted max-w-2xl mx-auto">
          Play fun games to earn XP and learn about fitness!
        </p>
      </div>
      {subscription && <SubscriptionContextBanner subscription={subscription} />}

      {!subscriptionLoading && !hasAccess && (
        <div className="max-w-2xl mx-auto">
          <NeumorphicCard variant="raised" size="lg" className="p-12 border-2 border-amber-500/30 bg-gradient-to-br from-amber-500/10 to-orange-500/10">
            <div className="text-center">
              <div className="w-20 h-20 bg-gradient-to-r from-amber-500 to-orange-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                <UserCheck className="w-10 h-10 text-white" />
              </div>
              <h2 className="text-3xl md:text-4xl font-bold user-app-ink mb-4">
                Subscription Required
              </h2>
              <div className="space-y-4 mb-8">
                <p className="text-lg user-app-muted">
                  You need an active subscription to access games.
                </p>
                <p className="text-base user-app-muted">
                  Subscribe to a trainer to unlock fun fitness games and earn XP.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button
                  onClick={() => router.push('/trainers')}
                  className="user-app-lemon-gradient-active px-8 py-4 rounded-xl font-semibold hover:shadow-lg hover:scale-105 transition-all duration-200 flex items-center justify-center gap-2"
                >
                  <Users className="w-5 h-5" />
                  Browse Trainers
                </button>
              </div>
            </div>
          </NeumorphicCard>
        </div>
      )}

      {(subscriptionLoading || hasAccess) && (
        <div className="min-h-dvh min-h-full user-app-page pb-20">
          <div className="container mx-auto px-4 py-8">
            {/* Header */}
            {/* <div className="mb-8">
              <h1 className="text-3xl font-bold user-app-ink mb-2">
                🎮 Fitness Games
              </h1>
              <p className="user-app-muted">
                Play fun games to earn XP and learn about fitness!
              </p>
            </div> */}

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

                    <h3 className="text-xl font-bold user-app-ink text-center mb-2">
                      {game.title}
                    </h3>

                    <p className="text-sm user-app-muted text-center mb-4">
                      {description}
                    </p>

                    <div className="flex items-center justify-center gap-2 mb-4">
                      <Zap className="h-4 w-4 text-yellow-500" />
                      <span className="text-sm font-semibold user-app-ink">
                        +{game.xpReward} XP
                      </span>
                      {game.difficulty && (
                        <>
                          <span className="user-app-muted">•</span>
                          <Badge variant="secondary" className="text-xs">
                            {game.difficulty}
                          </Badge>
                        </>
                      )}
                    </div>

                    <Button
                      className="user-app-lemon-gradient-active w-full"
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
                <Button variant="outline" className="user-app-ink">
                  <History className="h-4 w-4 mr-2" />
                  View Game History
                </Button>
              </Link>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

