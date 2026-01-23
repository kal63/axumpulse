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
  RefreshCw
} from 'lucide-react';
import { toast } from 'sonner';

export default function DailyChallengesPage() {
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();
  const [loading, setLoading] = useState(true);
  const [challenges, setChallenges] = useState<DailyChallenge[]>([]);
  const [streak, setStreak] = useState(0);
  const [completing, setCompleting] = useState<number | null>(null);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    } else if (user) {
      loadData();
    }
  }, [authLoading, user, router]);

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

  if (authLoading || loading) {
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
    <div className="min-h-screen bg-[var(--neumorphic-bg)] pb-20">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-[var(--neumorphic-text)] mb-2">
                Daily Challenges
              </h1>
              <p className="text-[var(--neumorphic-muted)]">
                Complete daily micro-tasks to earn XP and build your streak
              </p>
            </div>
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
  );
}

