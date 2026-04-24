'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/auth-context';
import { Button } from '@/components/ui/button';
import { BottomNavigation } from '@/components/user/BottomNavigation';
import { Sidebar } from '@/components/user/Sidebar';
import { NeumorphicCard } from '@/components/user/NeumorphicCard';
import { XPRing } from '@/components/user/XPRing';
import { cn } from '@/lib/utils';
import { getImageUrl } from '@/lib/upload-utils';
import { apiClient } from '@/lib/api-client';
import { 
  User, 
  Trophy, 
  Target, 
  BarChart3,
  Settings,
  LogOut,
  Award,
  X
} from 'lucide-react';
import { Logo } from '@/components/shared/Logo';
import Image from 'next/image';

interface UserLayoutProps {
  children: React.ReactNode;
}

export default function UserLayout({ children }: UserLayoutProps) {
  const { user, logout, isLoading: authLoading, sessionLoadError, retrySession } = useAuth();
  const [isMobile, setIsMobile] = useState(false);
  const [showTrainerPromo, setShowTrainerPromo] = useState(true);
  const [userStats, setUserStats] = useState({
    level: 1,
    xp: 0,
    xpProgress: 0,
    xpNeeded: 100,
    workoutsCompleted: 0,
    challengesCompleted: 0,
    achievementsUnlocked: 0
  });
  const [statsLoading, setStatsLoading] = useState(true);

  // Fetch user stats from API
  useEffect(() => {
    const fetchUserStats = async () => {
      if (!user) return;
      
      try {
        setStatsLoading(true);
        const response = await apiClient.getUserStats();
        
        if (response.success && response.data) {
          setUserStats({
            level: response.data.user.level,
            xp: response.data.user.xp,
            xpProgress: response.data.user.xpProgress,
            xpNeeded: response.data.user.xpNeeded,
            workoutsCompleted: response.data.stats.workoutPlansCompleted,
            challengesCompleted: response.data.stats.challengesCompleted,
            achievementsUnlocked: response.data.stats.achievementsUnlocked
          });
        }
      } catch (error) {
        console.error('Failed to fetch user stats:', error);
      } finally {
        setStatsLoading(false);
      }
    };

    fetchUserStats();
  }, [user]);

  // Check if trainer promo was dismissed recently (3 hours)
  useEffect(() => {
    const dismissedTime = localStorage.getItem('trainerPromoDismissed');
    if (dismissedTime) {
      const now = Date.now();
      const threeHours = 3 * 60 * 60 * 1000; // 3 hours in milliseconds
      if (now - parseInt(dismissedTime) < threeHours) {
        setShowTrainerPromo(false);
      }
    }
  }, []);

  const handleDismissTrainerPromo = () => {
    setShowTrainerPromo(false);
    localStorage.setItem('trainerPromoDismissed', Date.now().toString());
  };

  // Redirect only when there is no session to recover (avoid kicking users off on transient API errors)
  useEffect(() => {
    if (authLoading || user || sessionLoadError) return;
    const token = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null;
    if (!token) {
      window.location.href = '/login';
    }
  }, [authLoading, user, sessionLoadError]);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Show loading while checking authentication
  if (authLoading) {
    return (
      <div className="user-app-ethio flex min-h-screen items-center justify-center user-app-page">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 animate-spin rounded-full border-b-2 border-[var(--ethio-deep-blue)]" />
          <p className="user-app-muted mt-4">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user && sessionLoadError) {
    return (
      <div className="user-app-ethio user-app-page flex min-h-screen min-h-dvh items-center justify-center p-6">
        <div className="user-app-surface max-w-md space-y-4 p-8 text-center">
          <p className="user-app-ink text-lg font-semibold">Can&apos;t reach the server</p>
          <p className="user-app-muted text-sm">
            Your connection is fine, but the app could not load your profile. This often happens when the API URL is
            wrong for this environment or the service is restarting. Your login is still saved — try again, or sign
            out to use a different account.
          </p>
          <div className="flex flex-col gap-2 sm:flex-row sm:justify-center">
            <Button type="button" className="user-app-btn-primary" onClick={() => retrySession()}>
              Try again
            </Button>
            <Button type="button" variant="outline" onClick={() => logout()}>
              Sign out
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Don't render shell if not authenticated (redirect effect handles no-token case)
  if (!user) {
    return null;
  }

  return (
    <div className="user-app-ethio min-h-screen min-h-dvh user-app-page">
      {/* Mobile Layout */}
      {isMobile ? (
        <div className="flex min-h-screen min-h-dvh flex-col">
          {/* Mobile Header */}
          <header className="sticky top-0 z-40 border-b border-slate-200/90 bg-white/90 backdrop-blur-md dark:border-gray-700/50 dark:bg-slate-900/90">
            <div className="px-4 py-3">
              <div className="flex items-center justify-between">
                <div className="flex min-w-0 items-center">
                  <Logo size="sm" withText={false} href="/user/dashboard" />
                </div>
                <div className="flex items-center space-x-2">
                  <XPRing 
                    currentXP={userStats.xp} 
                    level={userStats.level} 
                    xpToNextLevel={userStats.xpNeeded - userStats.xpProgress}
                    size="sm"
                  />
                </div>
              </div>
            </div>
          </header>

          {/* Mobile Content */}
          <main className="min-h-0 flex-1 pb-20">
            {children}
          </main>

          {/* Mobile Trainer Promotion Banner */}
          {showTrainerPromo && !user?.isTrainer && (
            <div className="fixed bottom-20 left-4 right-4 z-30">
              <NeumorphicCard variant="raised" size="sm" className="p-4 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Award className="w-4 h-4 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-sm mb-1">
                      Want to be a trainer?
                    </h4>
                    <p className="text-xs text-emerald-100">
                      Share your expertise and help others
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => window.location.href = '/user/apply'}
                      className="text-xs bg-white/20 hover:bg-white/30 text-white px-3 py-1 rounded-lg transition-colors duration-200"
                    >
                      Apply
                    </button>
                    <button
                      onClick={handleDismissTrainerPromo}
                      className="text-white/80 hover:text-white transition-colors duration-200"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </NeumorphicCard>
            </div>
          )}

          {/* Mobile Bottom Navigation */}
          <BottomNavigation />
        </div>
      ) : (
        /* Desktop Layout */
        <div className="flex h-screen">
          {/* Desktop Sidebar */}
          <div className="user-app-sidebar-rail h-full w-[300px] min-w-[300px] shrink-0">
            <div className="flex h-full flex-col p-5">
              {/* Logo/Brand */}
              <div className="mb-8 w-full min-w-0">
                <Logo size="md" withText={false} withLink={false} />
                <p className="mt-1 text-sm text-[hsl(222,22%,20%)] dark:text-slate-400">
                  Gamified Fitness Platform
                </p>
              </div>

              {/* User Profile Section */}
              <NeumorphicCard
                variant="flat"
                size="md"
                className="user-app-surface mb-6 border-slate-200/90 p-4 !bg-white/95 !shadow-md dark:!bg-card/95"
              >
                <div className="mb-3 flex items-center space-x-3">
                  <div className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-full bg-gradient-to-r from-[var(--ethio-deep-blue)] to-[#006aa8]">
                    {user?.profilePicture ? (
                      <img
                        src={getImageUrl(user.profilePicture)}
                        alt={user.name || 'User'}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <span className="text-lg font-bold text-white">
                        {user?.name?.charAt(0) || 'U'}
                      </span>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="user-app-ink truncate font-semibold">{user?.name || 'User'}</h3>
                    <p className="user-app-muted text-sm">Level {userStats.level}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="text-center">
                    <div className="user-app-ink font-semibold">{userStats.workoutsCompleted}</div>
                    <div className="user-app-muted">Workouts</div>
                  </div>
                  <div className="text-center">
                    <div className="user-app-ink font-semibold">{userStats.challengesCompleted}</div>
                    <div className="user-app-muted">Challenges</div>
                  </div>
                </div>
              </NeumorphicCard>

              {/* Navigation Items flex-1 space-y-2 */}

              <nav className="min-h-0 flex-1 space-y-2 overflow-y-auto pr-0 no-scrollbar">
                <Sidebar />
              </nav>

              {/* Settings & Logout — EthioTells: ink on brand lime, same pill rhythm as nav */}
              <div className="mt-3 space-y-1.5 border-t border-[hsl(222,47%,8%)]/10 pt-4 dark:border-slate-600/50">
                <div className="px-2">
                  <button
                    onClick={() => (window.location.href = '/user/settings')}
                    className="user-app-ink flex w-full items-center gap-3 rounded-full py-2.5 pl-3 pr-3 text-left text-sm font-medium leading-snug transition-all hover:bg-white/20 dark:text-slate-300 dark:hover:bg-white/10"
                    type="button"
                  >
                    <Settings className="h-5 w-5 shrink-0" strokeWidth={1.5} />
                    <span>Settings</span>
                  </button>
                  <button
                    onClick={logout}
                    className="user-app-ink mt-1 flex w-full items-center gap-3 rounded-full py-2.5 pl-3 pr-3 text-left text-sm font-medium leading-snug transition-all hover:bg-white/20 dark:text-red-400 dark:hover:bg-red-950/30"
                    type="button"
                  >
                    <LogOut className="h-5 w-5 shrink-0" strokeWidth={1.5} />
                    <span>Logout</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Desktop Content Area */}
          <div className="flex-1 flex flex-col">
            {/* Main Content */}
            <main className="relative min-h-0 flex-1 overflow-y-auto">
              {children}
              
              {/* Desktop Trainer Promotion - Right Side */}
              {showTrainerPromo && !user?.isTrainer && (
                <div className="fixed top-20 right-6 z-30 w-80">
                  <NeumorphicCard variant="raised" size="sm" className="p-4 bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-900/20 dark:to-emerald-800/20">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Award className="w-5 h-5 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-emerald-800 dark:text-emerald-200 text-sm mb-1">
                          Want to be a trainer?
                        </h4>
                        <p className="text-xs text-emerald-700 dark:text-emerald-300 mb-3">
                          Share your expertise and help others achieve their fitness goals
                        </p>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => window.location.href = '/user/apply'}
                            className="text-xs bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-2 rounded-lg transition-colors duration-200"
                          >
                            Apply Now
                          </button>
                          <button
                            onClick={handleDismissTrainerPromo}
                            className="text-emerald-600 hover:text-emerald-700 transition-colors duration-200 p-1"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </NeumorphicCard>
                </div>
              )}
            </main>

            {/* Desktop Footer */}
            <footer className="hidden border-t border-slate-200/90 bg-white dark:border-gray-700/50 dark:user-app-paper md:block">
              <div className="px-6 py-3">
                <p className="user-app-muted text-center text-xs">
                  © {new Date().getFullYear()} Compound 360 · App development by Bitapps Tech · Keep moving!
                </p>
              </div>
            </footer>
          </div>
        </div>
      )}
    </div>
  );
}
