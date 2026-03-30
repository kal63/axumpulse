'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/auth-context'
import { apiClient } from '@/lib/api-client'
import { NeumorphicCard } from '@/components/user/NeumorphicCard'
import { XPRing } from '@/components/user/XPRing'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Trophy, 
  Target, 
  Users, 
  Zap, 
  Award, 
  CheckCircle, 
  Play,
  BarChart3,
  Flame,
  Heart,
  Dumbbell,
  Calendar,
  TrendingUp,
  ArrowUp,
  ArrowDown,
  Minus,
  Clock,
  Star,
  Activity,
  Sparkles,
  Crown,
  Timer,
  MapPin,
  Globe,
  AlertCircle,
  UserCheck,
  Package,
  RefreshCw
} from 'lucide-react'

export default function UserDashboardPage() {
  const router = useRouter()
  const { user, isLoading: authLoading } = useAuth()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [greeting, setGreeting] = useState({ text: 'Good morning', emoji: '☀️' })
  
  // Data states
  const [userInfo, setUserInfo] = useState<any>(null)
  const [stats, setStats] = useState<any>(null)
  const [xpHistory, setXPHistory] = useState<any[]>([])
  const [xpSummary, setXPSummary] = useState<any>(null)
  const [achievements, setAchievements] = useState<any[]>([])
  const [subscription, setSubscription] = useState<any>(null)

  // Get greeting based on Ethiopian timezone
  const getGreeting = () => {
    // Get current time in Ethiopian timezone (Africa/Addis_Ababa, UTC+3)
    const formatter = new Intl.DateTimeFormat('en-US', {
      timeZone: 'Africa/Addis_Ababa',
      hour: 'numeric',
      hour12: false
    })
    const ethiopianHour = parseInt(formatter.format(new Date()))
    
    if (ethiopianHour >= 5 && ethiopianHour < 12) {
      return { text: 'Good morning', emoji: '☀️' }
    } else if (ethiopianHour >= 12 && ethiopianHour < 17) {
      return { text: 'Good afternoon', emoji: '🌤️' }
    } else if (ethiopianHour >= 17 && ethiopianHour < 21) {
      return { text: 'Good evening', emoji: '🌆' }
    } else {
      return { text: 'Good night', emoji: '🌙' }
    }
  }

  // Update greeting on mount and periodically
  useEffect(() => {
    setGreeting(getGreeting())
    
    // Update every hour to change greeting if needed
    const interval = setInterval(() => {
      setGreeting(getGreeting())
    }, 3600000) // Check every hour
    
    return () => clearInterval(interval)
  }, [])

  // Fetch dashboard data
  useEffect(() => {
    if (user && !authLoading) {
      fetchDashboardData()
    }
  }, [user, authLoading])

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login')
    }
  }, [authLoading, user, router])

  async function fetchDashboardData() {
    try {
      setLoading(true)
      setError(null)

      // Fetch all data in parallel
      const [statsRes, historyRes, achievementsRes, subscriptionRes] = await Promise.all([
        apiClient.getUserStats(),
        apiClient.getUserXPHistory(30), // Get last 30 days
        apiClient.getAchievements(),
        apiClient.getMySubscription()
      ])

      // Handle stats
      if (statsRes.success && statsRes.data) {
        setUserInfo(statsRes.data.user)
        setStats(statsRes.data.stats)
      }

      // Handle XP history - map backend format to frontend format
      if (historyRes.success && historyRes.data) {
        // Backend returns history with breakdown, frontend expects simple date/xp format
        const mappedHistory = historyRes.data.history.map((entry: any) => ({
          date: entry.date,
          xp: entry.xp,
          source: entry.breakdown?.content > 0 ? 'content' : 
                 entry.breakdown?.challenge > 0 ? 'challenge' : 
                 entry.breakdown?.workout > 0 ? 'workout' : 'other'
        }))
        setXPHistory(mappedHistory)
        setXPSummary(historyRes.data.summary)
      }

      // Handle achievements - map backend format to frontend format
      if (achievementsRes.success && achievementsRes.data) {
        setAchievements(achievementsRes.data.achievements || [])
      }

      // Handle subscription
      if (subscriptionRes.success && subscriptionRes.data) {
        setSubscription(subscriptionRes.data.subscription)
      }
    } catch (err) {
      console.error('Error fetching dashboard data:', err)
      setError('Failed to load dashboard data')
    } finally {
      setLoading(false)
    }
  }

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--neumorphic-bg)]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-500 mx-auto"></div>
          <p className="mt-4 text-[var(--neumorphic-muted)]">Loading...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--neumorphic-bg)]">
        <div className="text-center">
          <AlertCircle className="h-16 w-16 mx-auto mb-4 text-red-500 opacity-50" />
          <p className="text-[var(--neumorphic-text)] text-xl font-semibold mb-2">
            Oops! Something went wrong
          </p>
          <p className="text-[var(--neumorphic-muted)] mb-4">{error}</p>
          <Button onClick={fetchDashboardData}>
            Try Again
          </Button>
        </div>
      </div>
    )
  }

  // Calculate user stats from real data
  const userStats = userInfo ? {
    level: userInfo.level || 1,
    xp: userInfo.xp || 0,
    xpProgress: userInfo.xpProgress || 0,
    xpNeeded: userInfo.xpNeeded || 100,
    workoutsCompleted: stats?.workoutPlansCompleted || 0,
    challengesCompleted: stats?.challengesCompleted || 0,
    achievementsUnlocked: stats?.achievementsUnlocked || 0,
    dayStreak: 0 // Backend doesn't return dailyStreak in stats, will need to get from profile if needed
  } : {
    level: 1,
    xp: 0,
    xpProgress: 0,
    xpNeeded: 100,
    workoutsCompleted: 0,
    challengesCompleted: 0,
    achievementsUnlocked: 0,
    dayStreak: 0
  }

  const content = (
    <div className="min-h-screen bg-[var(--neumorphic-bg)]">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 via-purple-500/5 to-pink-500/10" />
        
        <div className="relative px-4 md:px-8 py-12">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-between mb-8">
              <div>
                <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-cyan-500 to-purple-600 text-white px-4 py-2 rounded-full text-sm font-medium mb-4">
                  <Sparkles className="w-4 h-4" />
                  <span>Welcome Back</span>
                </div>
                <h1 className="text-4xl md:text-6xl font-bold text-[var(--neumorphic-text)] mb-4">
                  {greeting.text}, {user.name?.split(' ')[0] || 'User'}! {greeting.emoji}
                </h1>
                <p className="text-xl text-[var(--neumorphic-muted)] max-w-2xl">
                  Ready to level up your fitness journey? Let's make today count!
                </p>
              </div>
              
              {/* XP Ring - Desktop Only */}
              <div className="hidden lg:block">
                <XPRing 
                  currentXP={userStats.xp} 
                  level={userStats.level} 
                  xpToNextLevel={userStats.xpNeeded - userStats.xpProgress}
                  size="lg"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Dashboard Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="space-y-8">
          {/* Level Progress - Mobile */}
          <div className="lg:hidden">
            <NeumorphicCard variant="raised" className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-[var(--neumorphic-text)]">Your Progress</h2>
                <Badge className="bg-gradient-to-r from-cyan-500 to-purple-600 text-white">
                  Level {userStats.level}
                </Badge>
              </div>
              <XPRing 
                currentXP={userStats.xp} 
                level={userStats.level} 
                xpToNextLevel={userStats.xpNeeded - userStats.xpProgress}
                size="md"
              />
            </NeumorphicCard>
          </div>

          {/* Subscription Info Card */}
          {subscription && (
            <NeumorphicCard variant="raised" className="p-6 bg-gradient-to-br from-cyan-500/10 via-purple-500/5 to-pink-500/10 border-2 border-cyan-500/20">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-r from-cyan-500 to-purple-600 rounded-full flex items-center justify-center">
                    <Package className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-[var(--neumorphic-text)]">Active Subscription</h3>
                    <p className="text-sm text-[var(--neumorphic-muted)]">Your current plan</p>
                  </div>
                </div>
                <Badge className="bg-gradient-to-r from-green-500 to-emerald-500 text-white">
                  Active
                </Badge>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 mt-4">
                <Button
                  onClick={() => router.push('/user/subscription/change-package')}
                  className="bg-cyan-600 hover:bg-cyan-700 text-white"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Change package
                </Button>
                <Button
                  onClick={() => router.push('/user/subscription/change-trainer')}
                  variant="outline"
                  className="border-slate-600 text-slate-300"
                >
                  <UserCheck className="w-4 h-4 mr-2" />
                  Change trainer
                </Button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                {/* Subscription Plan */}
                <div className="p-4 rounded-xl bg-[var(--neumorphic-surface)]">
                  <div className="flex items-center gap-2 mb-2">
                    <Package className="w-4 h-4 text-cyan-500" />
                    <span className="text-xs text-[var(--neumorphic-muted)] uppercase tracking-wide">Package</span>
                  </div>
                  <p className="text-lg font-bold text-[var(--neumorphic-text)]">
                    {subscription.subscriptionPlan?.name || 'N/A'}
                  </p>
                  <p className="text-sm text-[var(--neumorphic-muted)] mt-1">
                    {subscription.duration === 'daily' ? 'Daily' : 
                     subscription.duration === 'monthly' ? 'Monthly' : 
                     subscription.duration === 'threeMonth' ? '3 Months' :
                     subscription.duration === 'sixMonth' ? '6 Months' :
                     subscription.duration === 'nineMonth' ? '9 Months' : '1 Year'} Plan
                  </p>
                </div>

                {/* Subscribed Trainer */}
                <div className="p-4 rounded-xl bg-[var(--neumorphic-surface)]">
                  <div className="flex items-center gap-2 mb-2">
                    <UserCheck className="w-4 h-4 text-purple-500" />
                    <span className="text-xs text-[var(--neumorphic-muted)] uppercase tracking-wide">Trainer</span>
                  </div>
                  <p className="text-lg font-bold text-[var(--neumorphic-text)]">
                    {subscription.trainer?.name || `Trainer #${subscription.trainerId}`}
                  </p>
                  {subscription.trainer?.profilePicture && (
                    <div className="flex items-center gap-2 mt-2">
                      <img 
                        src={subscription.trainer.profilePicture} 
                        alt={subscription.trainer.name}
                        className="w-6 h-6 rounded-full"
                      />
                      <span className="text-xs text-[var(--neumorphic-muted)]">Verified Trainer</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Expiration Date */}
              <div className="mt-4 pt-4 border-t border-[var(--neumorphic-border)]">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-[var(--neumorphic-muted)]" />
                    <span className="text-sm text-[var(--neumorphic-muted)]">Expires on</span>
                  </div>
                  <span className="text-sm font-semibold text-[var(--neumorphic-text)]">
                    {new Date(subscription.expiresAt).toLocaleDateString('en-US', { 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })}
                  </span>
                </div>
              </div>
            </NeumorphicCard>
          )}

          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <NeumorphicCard variant="raised" className="p-6 text-center">
              <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center mx-auto mb-3">
                <Flame className="w-6 h-6 text-white" />
              </div>
              <div className="text-2xl font-bold text-[var(--neumorphic-text)]">{userStats.dayStreak}</div>
              <div className="text-sm text-[var(--neumorphic-muted)]">Day Streak</div>
              {userStats.dayStreak > 0 && (
                <div className="flex items-center justify-center mt-2">
                  <Flame className="w-4 h-4 text-orange-500" />
                  <span className="text-xs text-orange-500 ml-1">Keep it up!</span>
                </div>
              )}
            </NeumorphicCard>

            <NeumorphicCard variant="raised" className="p-6 text-center">
              <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-3">
                <Zap className="w-6 h-6 text-white" />
              </div>
              <div className="text-2xl font-bold text-[var(--neumorphic-text)]">{userStats.xp.toLocaleString()}</div>
              <div className="text-sm text-[var(--neumorphic-muted)]">XP Points</div>
              {xpSummary && xpSummary.avgDailyXP > 0 && (
                <div className="flex items-center justify-center mt-2">
                  <ArrowUp className="w-4 h-4 text-green-500" />
                  <span className="text-xs text-green-500 ml-1">+{Math.round(xpSummary.avgDailyXP)} avg/day</span>
                </div>
              )}
            </NeumorphicCard>

            <NeumorphicCard variant="raised" className="p-6 text-center">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full flex items-center justify-center mx-auto mb-3">
                <Dumbbell className="w-6 h-6 text-white" />
              </div>
              <div className="text-2xl font-bold text-[var(--neumorphic-text)]">{userStats.workoutsCompleted}</div>
              <div className="text-sm text-[var(--neumorphic-muted)]">Workouts</div>
              {userInfo?.workoutStreak > 0 && (
                <div className="flex items-center justify-center mt-2">
                  <Flame className="w-4 h-4 text-orange-500" />
                  <span className="text-xs text-orange-500 ml-1">{userInfo.workoutStreak} streak</span>
                </div>
              )}
            </NeumorphicCard>

            <NeumorphicCard variant="raised" className="p-6 text-center">
              <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-3">
                <Trophy className="w-6 h-6 text-white" />
              </div>
              <div className="text-2xl font-bold text-[var(--neumorphic-text)]">{userStats.challengesCompleted}</div>
              <div className="text-sm text-[var(--neumorphic-muted)]">Challenges</div>
              {userInfo?.challengeStreak > 0 && (
                <div className="flex items-center justify-center mt-2">
                  <Trophy className="w-4 h-4 text-yellow-500" />
                  <span className="text-xs text-yellow-500 ml-1">{userInfo.challengeStreak} streak</span>
                </div>
              )}
            </NeumorphicCard>
          </div>

          {/* Charts Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* XP Progress Chart */}
            <NeumorphicCard variant="raised" className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-[var(--neumorphic-text)] flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-cyan-500" />
                  XP Progress
                </h3>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">7d</Button>
                  <Button variant="outline" size="sm" className="bg-gradient-to-r from-cyan-500 to-purple-600 text-white">30d</Button>
                  <Button variant="outline" size="sm">90d</Button>
                </div>
              </div>
              
              {/* Real XP Chart Data */}
              {xpHistory && xpHistory.length > 0 ? (
                <div className="space-y-4">
                  {xpHistory.slice(-7).map((entry, index) => {
                    const maxXP = Math.max(...xpHistory.map(e => e.xp || 0), 1)
                    const value = maxXP > 0 ? Math.round(((entry.xp || 0) / maxXP) * 100) : 0
                    const colors = [
                      'from-cyan-500 to-blue-500',
                      'from-blue-500 to-purple-500',
                      'from-purple-500 to-pink-500',
                      'from-pink-500 to-red-500',
                      'from-red-500 to-orange-500',
                      'from-orange-500 to-yellow-500',
                      'from-yellow-500 to-green-500'
                    ]
                    const dayLabels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
                    const date = new Date(entry.date)
                    const dayLabel = dayLabels[date.getDay() === 0 ? 6 : date.getDay() - 1] || date.toLocaleDateString('en-US', { weekday: 'short' })
                    
                    return (
                      <div key={index} className="flex items-center gap-3">
                        <div className="w-8 text-sm text-[var(--neumorphic-muted)]">{dayLabel}</div>
                        <div className="flex-1 bg-[var(--neumorphic-surface)] rounded-full h-3 overflow-hidden">
                          <div 
                            className={`h-full bg-gradient-to-r ${colors[index % colors.length]} rounded-full transition-all duration-1000 ease-out`}
                            style={{ width: `${value}%` }}
                          />
                        </div>
                        <div className="w-8 text-sm font-semibold text-[var(--neumorphic-text)]">{entry.xp || 0}</div>
                      </div>
                    )
                  })}
                </div>
              ) : (
                <div className="text-center py-8 text-[var(--neumorphic-muted)]">
                  <BarChart3 className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>No XP data available</p>
                  <p className="text-xs mt-1">Start earning XP to see your progress!</p>
                </div>
              )}
            </NeumorphicCard>

            {/* Recent Achievements */}
            <NeumorphicCard variant="raised" className="p-6">
              <h3 className="text-xl font-bold text-[var(--neumorphic-text)] mb-6 flex items-center gap-2">
                <Award className="w-5 h-5 text-yellow-500" />
                Recent Achievements
              </h3>
              
              <div className="space-y-4">
                {achievements && achievements.length > 0 ? (
                  achievements
                    .filter(a => a.unlocked)
                    .slice(0, 3)
                    .sort((a, b) => {
                      const dateA = a.unlockedAt ? new Date(a.unlockedAt).getTime() : 0
                      const dateB = b.unlockedAt ? new Date(b.unlockedAt).getTime() : 0
                      return dateB - dateA
                    })
                    .map((achievement) => {
                      const getIcon = (icon: string) => {
                        const iconMap: Record<string, any> = {
                          'trophy': Trophy,
                          'target': Target,
                          'flame': Flame,
                          'award': Award,
                          'dumbbell': Dumbbell,
                          'calendar': Calendar,
                          'star': Star,
                          'zap': Zap,
                          'crown': Crown
                        }
                        return iconMap[icon] || Award
                      }
                      const IconComponent = getIcon(achievement.icon || 'award')
                      const unlockedDate = achievement.unlockedAt ? new Date(achievement.unlockedAt) : null
                      const getTimeAgo = (date: Date): string => {
                        const now = new Date()
                        const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)
                        if (diffInSeconds < 60) return 'Just now'
                        if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`
                        if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`
                        if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)} days ago`
                        if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 604800)} weeks ago`
                        return `${Math.floor(diffInSeconds / 2592000)} months ago`
                      }
                      const timeAgo = unlockedDate ? getTimeAgo(unlockedDate) : 'Recently'
                      
                      return (
                        <div key={achievement.id} className="flex items-center gap-4 p-3 rounded-xl bg-[var(--neumorphic-surface)]">
                          <div className="w-10 h-10 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center">
                            <IconComponent className="w-5 h-5 text-white" />
                          </div>
                          <div className="flex-1">
                            <h4 className="font-semibold text-[var(--neumorphic-text)]">{achievement.name}</h4>
                            <p className="text-sm text-[var(--neumorphic-muted)]">{achievement.description}</p>
                          </div>
                          <div className="text-right">
                            <div className="text-sm font-bold text-[var(--neumorphic-text)]">+{achievement.xpReward || 0} XP</div>
                            <div className="text-xs text-[var(--neumorphic-muted)]">{timeAgo}</div>
                          </div>
                        </div>
                      )
                    })
                ) : (
                  <div className="text-center py-8 text-[var(--neumorphic-muted)]">
                    No achievements unlocked yet. Keep going!
                  </div>
                )}
              </div>
            </NeumorphicCard>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Button 
              onClick={() => router.push('/user/videos')}
              className="h-20 bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-600 hover:to-purple-700 text-white text-lg font-semibold"
            >
              <Play className="w-6 h-6 mr-3" />
              Start Workout
            </Button>
            
            <Button 
              onClick={() => router.push('/user/workout-plans')}
              className="h-20 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white text-lg font-semibold"
            >
              <Target className="w-6 h-6 mr-3" />
              Workout Plans
            </Button>
            
            <Button 
              onClick={() => router.push('/user/challenges')}
              className="h-20 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white text-lg font-semibold"
            >
              <Trophy className="w-6 h-6 mr-3" />
              Join Challenge
            </Button>
            
            <Button 
              onClick={() => router.push('/user/progress')}
              className="h-20 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white text-lg font-semibold"
            >
              <BarChart3 className="w-6 h-6 mr-3" />
              View Progress
            </Button>
          </div>
        </div>
      </div>
    </div>
  )

  return content
}