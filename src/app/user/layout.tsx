'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/auth-context';
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

interface UserLayoutProps {
  children: React.ReactNode;
}

export default function UserLayout({ children }: UserLayoutProps) {
  const { user, logout, isLoading: authLoading } = useAuth();
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

  // Authentication check - redirect to login if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      window.location.href = '/login';
    }
  }, [authLoading, user]);

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
      <div className="min-h-screen bg-[var(--neumorphic-bg)] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Don't render anything if not authenticated (will redirect)
  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-[var(--neumorphic-bg)]">
      {/* Mobile Layout */}
      {isMobile ? (
        <div className="flex flex-col min-h-screen">
          {/* Mobile Header */}
          <header className="sticky top-0 z-40 bg-[var(--neumorphic-bg)]/80 backdrop-blur-md border-b border-gray-200/50 dark:border-gray-700/50">
            <div className="px-4 py-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Logo size="sm" />
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
          <main className="flex-1 pb-20">
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
          <div className="w-64 h-full bg-[var(--ethio-lemon)] dark:bg-[var(--neumorphic-surface)] border-r border-white/10 dark:border-gray-700/50">
            <div className="p-6 h-full flex flex-col">
              {/* Logo/Brand */}
              <div className="mb-8">
                <Logo size="sm" />
                <p className="text-sm text-white/85 dark:text-[var(--neumorphic-muted)] mt-1">
                  Gamified Fitness Platform
                </p>
              </div>

              {/* User Profile Section */}
              <NeumorphicCard variant="raised" size="sm" className="mb-6 p-4">
                <div className="flex items-center space-x-3 mb-3">
                  <div className="w-12 h-12 rounded-full overflow-hidden bg-gradient-to-r from-cyan-500 to-purple-600 flex items-center justify-center">
                    {user?.profilePicture ? (
                      <img 
                        src={getImageUrl(user.profilePicture)} 
                        alt={user.name || 'User'} 
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-white font-bold text-lg">
                        {user?.name?.charAt(0) || 'U'}
                      </span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-[var(--neumorphic-text)] truncate">
                      {user?.name || 'User'}
                    </h3>
                    <p className="text-sm text-[var(--neumorphic-muted)]">
                      Level {userStats.level}
                    </p>
                  </div>
                </div>
                
                {/* XP Progress */}
                {/* <div className="mb-3">
                  <XPRing 
                    currentXP={userStats.xp} 
                    level={userStats.level} 
                    xpToNextLevel={userStats.xpNeeded - userStats.xpProgress}
                    size="sm"
                  />
                </div> */}

                {/* Quick Stats */}
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="text-center">
                    <div className="font-semibold text-[var(--neumorphic-text)]">
                      {userStats.workoutsCompleted}
                    </div>
                    <div className="text-[var(--neumorphic-muted)]">Workouts</div>
                  </div>
                  <div className="text-center">
                    <div className="font-semibold text-[var(--neumorphic-text)]">
                      {userStats.challengesCompleted}
                    </div>
                    <div className="text-[var(--neumorphic-muted)]">Challenges</div>
                  </div>
                </div>
              </NeumorphicCard>

              {/* Navigation Items flex-1 space-y-2 */}

              <nav className="flex-1 space-y-2 overflow-y-auto pr-2 no-scrollbar">
                <Sidebar />
              </nav>

              {/* Settings & Logout */}
              <div className="space-y-2">
                <button
                  onClick={() => window.location.href = '/user/settings'}
                  className="w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 text-left text-white hover:bg-white/10 dark:text-gray-300 dark:hover:bg-gray-800/50"
                >
                  <Settings className="w-5 h-5 text-white/85 dark:text-gray-400" />
                  <span className="font-medium text-white dark:text-gray-300">
                    Settings
                  </span>
                </button>
                <button
                  onClick={logout}
                  className="w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 text-left text-white hover:bg-white/10 dark:hover:bg-red-900/20 dark:text-red-400"
                >
                  <LogOut className="w-5 h-5" />
                  <span className="font-medium">
                    Logout
                  </span>
                </button>
              </div>
            </div>
          </div>

          {/* Desktop Content Area */}
          <div className="flex-1 flex flex-col">
            {/* Main Content */}
            <main className="flex-1 overflow-y-auto relative">
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
            <footer className="hidden md:block border-t border-gray-200/50 dark:border-gray-700/50 bg-[var(--neumorphic-surface)]">
              <div className="px-6 py-3">
                <p className="text-xs text-[var(--neumorphic-muted)] text-center">
                  © {new Date().getFullYear()} Compunt BST. · App development by Bitapps Tech · Keep moving!
                </p>
              </div>
            </footer>
          </div>
        </div>
      )}
    </div>
  );
}
