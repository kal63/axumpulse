'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';
import { apiClient, type DailyChallenge } from '@/lib/api-client';
import { NeumorphicCard } from '@/components/user/NeumorphicCard';
import { DailyChallengeCard } from '@/components/user/DailyChallengeCard';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Flame,
  Zap,
  Trophy,
  Target,
  CheckCircle,
  Calendar,
  RefreshCw,
  UserCheck,
  Users,
  Dumbbell
} from 'lucide-react';
import { toast } from 'sonner';

export default function DailyChallengesPage() {
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();
  const [subscription, setSubscription] = useState<any | null>(null);
  const [subscriptionLoading, setSubscriptionLoading] = useState(true);
  const isMedicalPro = user?.isMedical || false;
  const isTrainer = user?.isTrainer || false;
  const [loading, setLoading] = useState(true);
  const [challenges, setChallenges] = useState<DailyChallenge[]>([]);
  const [streak, setStreak] = useState(0);
  const [completing, setCompleting] = useState<number | null>(null);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    } else if (user) {
      // if subscription is still loading or user has access, fetch immediately
      if (subscriptionLoading || subscription || isMedicalPro || isTrainer) {
        loadData();
      } else {
        // no subscription and not a medical/trainer user
        setLoading(false);
      }
    }
  }, [authLoading, user, router, subscriptionLoading, subscription, isMedicalPro, isTrainer]);

  // Fetch subscription status (skip for medical professionals and trainers)
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
  }

  const loadData = async () => {
    try {
      setLoading(true);
      const [challengesRes, streakRes] = await Promise.all([
        apiClient.getTodayChallenges(),
        apiClient.getDailyChallengeStreak()
      ]);

      if (challengesRes.success && challengesRes.data) {
        setChallenges(challengesRes.data.challenges);
      }

      if (streakRes.success && streakRes.data) {
        setStreak(streakRes.data.streak);
      }
    } catch (error) {
      console.error('Error loading daily challenges:', error);
      toast.error('Failed to load daily challenges');
    } finally {
      setLoading(false);
    }
  };

  const handleComplete = async (challengeId: number) => {
    try {
      setCompleting(challengeId);
      const res = await apiClient.completeDailyChallenge(challengeId);

      if (res.success && res.data) {
        toast.success(`Challenge completed! +${res.data.xpAdded} XP`, {
          description: res.data.leveledUp ? 'Level up!' : `Streak: ${res.data.streak} days`
        });

        // Update local state
        setChallenges(prev => prev.map(c =>
          c.id === challengeId
            ? { ...c, completed: true, completedAt: new Date().toISOString(), xpEarned: res.data!.xpAdded }
            : c
        ));

        // Update streak
        if (res.data.streak) {
          setStreak(res.data.streak);
        }
      } else {
        toast.error(res.error?.message || 'Failed to complete challenge');
      }
    } catch (error) {
      console.error('Error completing challenge:', error);
      toast.error('Failed to complete challenge');
    } finally {
      setCompleting(null);
    }
  };

  const hasAccess = subscription || isMedicalPro || isTrainer;

  // if waiting on subscription or loading resources (and user has access), show spinner
  if (
    authLoading ||
    ((loading && hasAccess) || (subscriptionLoading && !isMedicalPro && !isTrainer))
  ) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--neumorphic-bg)]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-500 mx-auto"></div>
          <p className="mt-4 text-[var(--neumorphic-muted)]">Loading daily challenges...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const completedCount = challenges.filter(c => c.completed).length;
  const totalCount = challenges.length;

  return (
    <>

      <div className="text-center mt-8 mb-8 max-w-7xl mx-auto">
        <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-cyan-500 to-purple-600 text-white px-4 py-2 rounded-full text-sm font-medium mb-4">
          <Dumbbell className="w-4 h-4" />
          <span>Structured Fitness Programs</span>
        </div>
        <h1 className="text-4xl md:text-6xl font-bold text-[var(--neumorphic-text)] mb-4">
          🔥 Daily Challenges
        </h1>
        <p className="text-xl text-[var(--neumorphic-muted)] max-w-2xl mx-auto">
          Complete daily micro-tasks to earn XP and build your streak
        </p>
      </div>

      {/* Subscription indicator */}
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

      {/* Subscription required message */}
      {!subscriptionLoading && !hasAccess && (
        <div className="max-w-2xl mx-auto">
          <NeumorphicCard variant="raised" size="lg" className="p-12 border-2 border-amber-500/30 bg-gradient-to-br from-amber-500/10 to-orange-500/10">
            <div className="text-center">
              <div className="w-20 h-20 bg-gradient-to-r from-amber-500 to-orange-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                <UserCheck className="w-10 h-10 text-white" />
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-[var(--neumorphic-text)] mb-4">
                Subscription Required
              </h2>
              <div className="space-y-4 mb-8">
                <p className="text-lg text-[var(--neumorphic-muted)]">
                  You need an active subscription to access daily challenges.
                </p>
                <p className="text-base text-[var(--neumorphic-muted)]">
                  Subscribe to a trainer to unlock daily micro-tasks, earn XP, and build streaks.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button
                  onClick={() => router.push('/trainers')}
                  className="px-8 py-4 bg-gradient-to-r from-cyan-500 to-purple-600 text-white rounded-xl font-semibold hover:shadow-lg hover:scale-105 transition-all duration-200 flex items-center justify-center gap-2"
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
        <div className="min-h-screen bg-[var(--neumorphic-bg)] pb-20">
          <div className="container mx-auto px-4 py-8">
            {/* Header */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-4">
                
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={loadData}
                  className="text-[var(--neumorphic-muted)] hover:text-[var(--neumorphic-text)]"
                >
                  <RefreshCw className="h-5 w-5" />
                </Button>
              </div>

              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <NeumorphicCard variant="raised" className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-red-500 rounded-xl flex items-center justify-center">
                      <Flame className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-[var(--neumorphic-text)]">
                        {streak}
                      </div>
                      <div className="text-xs text-[var(--neumorphic-muted)]">
                        Day Streak
                      </div>
                    </div>
                  </div>
                </NeumorphicCard>

                <NeumorphicCard variant="raised" className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl flex items-center justify-center">
                      <CheckCircle className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-[var(--neumorphic-text)]">
                        {completedCount}/{totalCount}
                      </div>
                      <div className="text-xs text-[var(--neumorphic-muted)]">
                        Completed Today
                      </div>
                    </div>
                  </div>
                </NeumorphicCard>

                <NeumorphicCard variant="raised" className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-xl flex items-center justify-center">
                      <Zap className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-[var(--neumorphic-text)]">
                        {challenges.reduce((sum, c) => sum + (c.completed ? (c.xpEarned || 0) : 0), 0)}
                      </div>
                      <div className="text-xs text-[var(--neumorphic-muted)]">
                        XP Earned Today
                      </div>
                    </div>
                  </div>
                </NeumorphicCard>
              </div>
            </div>

            {/* Challenges List */}
            {challenges.length === 0 ? (
              <NeumorphicCard variant="raised" className="p-12 text-center">
                <Target className="h-16 w-16 text-[var(--neumorphic-muted)] mx-auto mb-4 opacity-50" />
                <h3 className="text-xl font-semibold text-[var(--neumorphic-text)] mb-2">
                  No Daily Challenges Available
                </h3>
                <p className="text-[var(--neumorphic-muted)]">
                  Check back tomorrow for new daily challenges!
                </p>
              </NeumorphicCard>
            ) : (
              <div className="space-y-4">
                {challenges.map((challenge) => (
                  <DailyChallengeCard
                    key={challenge.id}
                    challenge={challenge}
                    onComplete={handleComplete}
                    completing={completing === challenge.id}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}

