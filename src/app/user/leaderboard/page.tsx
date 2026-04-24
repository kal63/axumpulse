'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';
import { apiClient, type LeaderboardEntry } from '@/lib/api-client';
import { NeumorphicCard } from '@/components/user/NeumorphicCard';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Trophy,
  Medal,
  Award,
  Filter,
  RefreshCw,
  Zap,
  MapPin,
  Users,
  UserCheck
} from 'lucide-react';
import { toast } from 'sonner';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function LeaderboardPage() {
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();
  const [subscription, setSubscription] = useState<any | null>(null);
  const [subscriptionLoading, setSubscriptionLoading] = useState(true);
  const isMedicalPro = user?.isMedical || false;
  const isTrainer = user?.isTrainer || false;
  const [loading, setLoading] = useState(true);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [userRank, setUserRank] = useState<number | null>(null);
  const [totalUsers, setTotalUsers] = useState(0);
  const [filterBy, setFilterBy] = useState<'city' | 'ageGroup' | 'friends' | 'none'>('none');
  const [period, setPeriod] = useState<'weekly' | 'monthly' | 'all-time'>('all-time');
  const [offset, setOffset] = useState(0);
  const limit = 50;

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
        loadLeaderboard();
      } else {
        setLoading(false);
      }
    }
  }, [authLoading, user, router, filterBy, period, offset, subscriptionLoading, subscription, isMedicalPro, isTrainer]);

  const loadLeaderboard = async () => {
    try {
      setLoading(true);
      const res = await apiClient.getGlobalLeaderboard({
        filterBy: filterBy === 'none' ? undefined : filterBy,
        period,
        limit,
        offset
      });

      if (res.success && res.data) {
        setLeaderboard(res.data.leaderboard);
        setUserRank(res.data.userRank);
        setTotalUsers(res.data.totalUsers);
      }
    } catch (error) {
      console.error('Error loading leaderboard:', error);
      toast.error('Failed to load leaderboard');
    } finally {
      setLoading(false);
    }
  };

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Trophy className="h-6 w-6 text-yellow-500" />;
      case 2:
        return <Medal className="h-6 w-6 text-gray-400" />;
      case 3:
        return <Award className="h-6 w-6 text-amber-600" />;
      default:
        return <span className="text-sm font-bold user-app-muted">#{rank}</span>;
    }
  };

  const getRankBadge = (rank: number) => {
    switch (rank) {
      case 1:
        return 'bg-gradient-to-r from-yellow-400 to-yellow-600';
      case 2:
        return 'bg-gradient-to-r from-gray-300 to-gray-500';
      case 3:
        return 'bg-gradient-to-r from-amber-500 to-amber-700';
      default:
        return 'user-app-paper';
    }
  };

  const hasAccess = subscription || isMedicalPro || isTrainer;

  if (
    authLoading ||
    ((loading && hasAccess) || (subscriptionLoading && !isMedicalPro && !isTrainer))
  ) {
    return (
      <div className="flex min-h-dvh min-h-screen items-center justify-center user-app-page">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--ethio-deep-blue)] mx-auto"></div>
          <p className="mt-4 user-app-muted">Loading leaderboard...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <>

      <div className="text-center mt-8 mb-8">
        {/* <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-[var(--ethio-lemon)] to-[var(--ethio-deep-blue)] text-white px-4 py-2 rounded-full text-sm font-medium mb-4">
                                    <Dumbbell className="w-4 h-4" />
                                    <span>Structured Fitness Programs</span>
                                </div> */}
        <h1 className="text-4xl md:text-6xl font-bold user-app-ink mb-4">
          🏆 Global Leaderboard
        </h1>
        <p className="text-xl user-app-muted max-w-2xl mx-auto">
          Compete with users worldwide and climb the ranks!
        </p>
      </div>
      {subscription && (
        <div className="max-w-4xl mx-auto mb-4">
          {/* <NeumorphicCard variant="raised" size="sm" className="p-4 bg-blue-500/10 border-blue-500/30">
            <div className="flex items-center gap-3">
              <UserCheck className="w-5 h-5 text-blue-400" />
              <div className="flex-1">
                <p className="text-sm font-medium text-white">
                  Showing content from {subscription.trainer?.name || `Trainer #${subscription.trainerId}`}
                </p>
                <p className="text-xs text-slate-400">
                  Your active subscription expires on {new Date(subscription.expiresAt).toLocaleDateString()}
                </p>
              </div>
            </div>
          </NeumorphicCard> */}
        </div>
      )}

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
                  You need an active subscription to view the leaderboard.
                </p>
                <p className="text-base user-app-muted">
                  Subscribe to a trainer to compete with other users and track your rank.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button
                  onClick={() => router.push('/trainers')}
                  className="px-8 py-4 bg-gradient-to-r from-[var(--ethio-lemon)] to-[var(--ethio-deep-blue)] text-white rounded-xl font-semibold hover:shadow-lg hover:scale-105 transition-all duration-200 flex items-center justify-center gap-2"
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
            🏆 Global Leaderboard
          </h1>
          <p className="user-app-muted">
            Compete with users worldwide and climb the ranks!
          </p>
        </div> */}

            {/* Filters */}
            <NeumorphicCard variant="raised" className="p-4 mb-6">
              <div className="flex flex-col md:flex-row gap-4 items-end">
                <div className="flex-1">
                  <label className="text-sm font-medium user-app-ink mb-2 block">
                    Filter By
                  </label>
                  <Select
                    value={filterBy}
                    onValueChange={(value: any) => {
                      setFilterBy(value);
                      setOffset(0);
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">All Users</SelectItem>
                      <SelectItem value="city">My City</SelectItem>
                      <SelectItem value="ageGroup">My Age Group</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex-1">
                  <label className="text-sm font-medium user-app-ink mb-2 block">
                    Period
                  </label>
                  <Select
                    value={period}
                    onValueChange={(value: any) => {
                      setPeriod(value);
                      setOffset(0);
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all-time">All Time</SelectItem>
                      <SelectItem value="weekly">Weekly</SelectItem>
                      <SelectItem value="monthly">Monthly</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Button
                  variant="outline"
                  onClick={loadLeaderboard}
                  className="user-app-ink"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Refresh
                </Button>
              </div>
            </NeumorphicCard>

            {/* User Rank Card */}
            {userRank !== null && (
              <NeumorphicCard variant="raised" className="p-4 mb-6 bg-gradient-to-r from-[var(--ethio-lemon)]/10 to-[var(--ethio-deep-blue)]/10 border-2 border-[var(--ethio-deep-blue)]/45">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm user-app-muted mb-1">Your Rank</div>
                    <div className="text-3xl font-bold user-app-ink">
                      #{userRank}
                    </div>
                    <div className="text-sm user-app-muted mt-1">
                      out of {totalUsers} users
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm user-app-muted mb-1">Total Users</div>
                    <div className="text-2xl font-bold user-app-ink">
                      {totalUsers}
                    </div>
                  </div>
                </div>
              </NeumorphicCard>
            )}

            {/* Leaderboard */}
            <NeumorphicCard variant="raised" className="p-6">
              <h2 className="text-xl font-bold user-app-ink mb-6 flex items-center gap-2">
                <Trophy className="h-5 w-5 text-yellow-500" />
                Top Players
              </h2>

              {leaderboard.length === 0 ? (
                <div className="text-center py-12 user-app-muted">
                  <Trophy className="h-16 w-16 mx-auto mb-4 opacity-30" />
                  <p>No players found</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {leaderboard.map((entry) => {
                    const isCurrentUser = entry.isCurrentUser || entry.userId === user.id;

                    return (
                      <div
                        key={entry.userId}
                        className={`
                      flex items-center gap-4 p-4 rounded-lg transition-all
                      ${isCurrentUser
                            ? 'bg-gradient-to-r from-[var(--ethio-lemon)]/15 to-[var(--ethio-deep-blue)]/12 border-2 border-[var(--ethio-deep-blue)]/50 shadow-lg'
                            : 'user-app-paper user-app-hover'
                          }
                    `}
                      >
                        {/* Rank */}
                        <div className={`
                      flex items-center justify-center w-12 h-12 rounded-full shrink-0
                      ${getRankBadge(entry.rank)}
                      ${entry.rank <= 3 ? 'text-white' : 'user-app-ink'}
                    `}>
                          {getRankIcon(entry.rank)}
                        </div>

                        {/* User Info */}
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          {entry.profilePicture ? (
                            <img
                              src={entry.profilePicture}
                              alt={entry.name}
                              className="w-10 h-10 rounded-full object-cover"
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[var(--ethio-lemon)] to-[var(--ethio-deep-blue)] flex items-center justify-center text-white font-semibold">
                              {entry.name.charAt(0).toUpperCase()}
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <div className="font-semibold user-app-ink truncate">
                              {entry.name}
                              {isCurrentUser && (
                                <Badge variant="secondary" className="ml-2 text-xs">You</Badge>
                              )}
                            </div>
                            <div className="flex items-center gap-2 text-xs user-app-muted">
                              {entry.city && (
                                <span className="flex items-center gap-1">
                                  <MapPin className="h-3 w-3" />
                                  {entry.city}
                                </span>
                              )}
                              {entry.ageGroup && (
                                <span>• {entry.ageGroup}</span>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Stats */}
                        <div className="flex items-center gap-6 text-right">
                          <div>
                            <div className="text-sm font-semibold user-app-ink">
                              {entry.xp.toLocaleString()} XP
                            </div>
                            <div className="text-xs user-app-muted">
                              Level {entry.level}
                            </div>
                          </div>
                          <div>
                            <div className="text-sm font-semibold user-app-ink">
                              {entry.streak}
                            </div>
                            <div className="text-xs user-app-muted">
                              Streak
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Pagination */}
              {leaderboard.length >= limit && (
                <div className="flex items-center justify-center gap-4 mt-6">
                  <Button
                    variant="outline"
                    onClick={() => setOffset(Math.max(0, offset - limit))}
                    disabled={offset === 0}
                  >
                    Previous
                  </Button>
                  <span className="text-sm user-app-muted">
                    Showing {offset + 1}-{offset + leaderboard.length} of {totalUsers}
                  </span>
                  <Button
                    variant="outline"
                    onClick={() => setOffset(offset + limit)}
                    disabled={offset + leaderboard.length >= totalUsers}
                  >
                    Next
                  </Button>
                </div>
              )}
            </NeumorphicCard>
          </div>
        </div>
      )}
    </>
  );
}

