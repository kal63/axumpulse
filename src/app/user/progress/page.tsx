'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/auth-context'
import { apiClient } from '@/lib/api-client'
import { NeumorphicCard } from '@/components/user/NeumorphicCard'
import { XPRing } from '@/components/user/XPRing'
import { 
  TrendingUp, 
  Trophy, 
  Target, 
  Zap, 
  Award, 
  Star, 
  Flame, 
  Calendar, 
  Clock, 
  Users, 
  BarChart3, 
  Activity,
  Dumbbell,
  Heart,
  ChevronRight,
  Sparkles,
  CheckCircle,
  ArrowUp,
  ArrowDown,
  Minus,
  Play
} from 'lucide-react'

export default function ProgressPage() {
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [chartLoading, setChartLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Data states
  const [xpHistory, setXPHistory] = useState<any[]>([])
  const [xpSummary, setXPSummary] = useState<any>(null)
  const [achievements, setAchievements] = useState<any[]>([])
  const [achievementStats, setAchievementStats] = useState({
    totalUnlocked: 0,
    totalAchievements: 0,
    progress: 0
  })
  const [stats, setStats] = useState<any>(null)
  const [userInfo, setUserInfo] = useState<any>(null)
  const [activityLog, setActivityLog] = useState<any[]>([])
  const [xpPeriod, setXPPeriod] = useState(30)
  const [isInitialLoad, setIsInitialLoad] = useState(true)

  // Initial load - fetch all data
  useEffect(() => {
    fetchAllData()
  }, [])

  // Period change - only fetch chart data
  useEffect(() => {
    if (!isInitialLoad) {
      fetchChartData()
    }
  }, [xpPeriod])

  async function fetchChartData() {
    try {
      setChartLoading(true)
      const historyRes = await apiClient.getUserXPHistory(xpPeriod)

      if (historyRes.success && historyRes.data) {
        setXPHistory(historyRes.data.history)
        setXPSummary(historyRes.data.summary)
      }
    } catch (err) {
      console.error('Error fetching chart data:', err)
    } finally {
      setChartLoading(false)
    }
  }

  async function fetchAllData() {
    try {
      setLoading(true)
      setError(null)

      // Fetch all data in parallel
      const [statsRes, historyRes, achievementsRes, activityRes] = await Promise.all([
        apiClient.getUserStats(),
        apiClient.getUserXPHistory(xpPeriod),
        apiClient.getAchievements(), // Use new method instead of getUserAchievements
        apiClient.getActivityLog({ page: 1, pageSize: 10 }) // Get recent activities
      ])

      // Handle stats
      if (statsRes.success && statsRes.data) {
        setUserInfo(statsRes.data.user)
        setStats(statsRes.data.stats)
      }

      // Handle XP history
      if (historyRes.success && historyRes.data) {
        setXPHistory(historyRes.data.history)
        setXPSummary(historyRes.data.summary)
      }

      // Handle achievements
      if (achievementsRes.success && achievementsRes.data) {
        setAchievements(achievementsRes.data.achievements || [])
        // Use direct properties from API response
        const totalUnlocked = achievementsRes.data.totalUnlocked ?? 0
        const totalAchievements = achievementsRes.data.totalAchievements ?? 0
        const progress = totalAchievements > 0 ? (totalUnlocked / totalAchievements) * 100 : 0
        
        setAchievementStats({
          totalUnlocked,
          totalAchievements,
          progress
        })
      }

      // Handle activity log
      if (activityRes.success && activityRes.data) {
        setActivityLog(activityRes.data.activities || [])
      }
    } catch (err) {
      console.error('Error fetching progress data:', err)
      setError('Failed to load progress data')
    } finally {
      setLoading(false)
      setIsInitialLoad(false)
    }
  }


  // Helper function to get time ago string
  function getTimeAgo(date: Date): string {
    const now = new Date()
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)
    
    if (diffInSeconds < 60) return 'Just now'
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)} days ago`
    if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 604800)} weeks ago`
    return `${Math.floor(diffInSeconds / 2592000)} months ago`
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--color-cyber-blue)] mx-auto mb-4"></div>
          <p className="user-app-ink">Loading your progress...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <TrendingUp className="h-16 w-16 mx-auto mb-4 text-red-500 opacity-50" />
          <p className="user-app-ink text-xl font-semibold mb-2">
            Oops! Something went wrong
          </p>
          <p className="user-app-muted mb-4">{error}</p>
          <button
            onClick={fetchAllData}
            className="px-6 py-2 bg-gradient-to-r from-[var(--color-cyber-blue)] to-[var(--color-neon-magenta)] text-white rounded-lg font-medium"
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }

  const content = (
    <div className="min-h-dvh min-h-full user-app-page">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        {/* Background Gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 via-purple-500/5 to-pink-500/10" />
        
        {/* Content */}
        <div className="relative px-4 md:px-8 py-12">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-8">
              <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-cyan-500 to-purple-600 text-white px-4 py-2 rounded-full text-sm font-medium mb-4">
                <Sparkles className="w-4 h-4" />
                <span>Track Your Journey</span>
              </div>
              <h1 className="text-4xl md:text-6xl font-bold user-app-ink mb-4">
                📊 Progress Dashboard
              </h1>
              <p className="text-xl user-app-muted max-w-2xl mx-auto">
                Monitor your fitness journey, achievements, and growth with beautiful analytics
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="space-y-8">
          {/* Level Progress Section */}
          {userInfo && (
            <div className="text-center mb-8">
              <NeumorphicCard variant="raised" className="p-8">
                <div className="flex items-center justify-center mb-6">
                  <XPRing 
                    currentXP={userInfo.xp} 
                    level={userInfo.level} 
                    xpToNextLevel={userInfo.xpNeeded - userInfo.xpProgress}
                    size="lg"
                  />
                </div>
                <h2 className="text-3xl font-bold user-app-ink mb-2">
                  Level {userInfo.level}
                </h2>
                <p className="user-app-muted mb-4">
                  {userInfo.xp.toLocaleString()} XP • {userInfo.xpProgress}/{userInfo.xpNeeded} to next level
                </p>
                <div className="mb-2 h-3 w-full rounded-full bg-slate-200 dark:bg-slate-700">
                  <div 
                    className="bg-gradient-to-r from-cyan-500 to-purple-600 h-3 rounded-full transition-all duration-1000"
                    style={{ width: `${Math.round((userInfo.xpProgress / userInfo.xpNeeded) * 100)}%` }}
                  />
                </div>
                <div className="text-2xl font-bold bg-gradient-to-r from-cyan-500 to-purple-600 text-transparent bg-clip-text">
                  {Math.round((userInfo.xpProgress / userInfo.xpNeeded) * 100)}% Complete
                </div>
              </NeumorphicCard>
            </div>
          )}

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <NeumorphicCard variant="raised" className="p-6 text-center">
              <div className="flex items-center justify-center w-12 h-12 mx-auto mb-4 bg-gradient-to-br from-cyan-500 to-blue-500 rounded-xl">
                <Trophy className="h-6 w-6 text-white" />
              </div>
              <div className="text-3xl font-bold user-app-ink mb-1">
                {stats?.challengesCompleted || 0}
              </div>
              <div className="text-sm user-app-muted">Challenges</div>
              <div className="text-xs user-app-muted mt-2">
                {userInfo?.challengeStreak || 0} challenge streak
              </div>
            </NeumorphicCard>

            <NeumorphicCard variant="raised" className="p-6 text-center">
              <div className="flex items-center justify-center w-12 h-12 mx-auto mb-4 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl">
                <Dumbbell className="h-6 w-6 text-white" />
              </div>
              <div className="text-3xl font-bold user-app-ink mb-1">
                {stats?.workoutPlansCompleted || 0}
              </div>
              <div className="text-sm user-app-muted">Workouts</div>
              <div className="text-xs user-app-muted mt-2">
                {userInfo?.workoutStreak || 0} workout streak
              </div>
            </NeumorphicCard>

            <NeumorphicCard variant="raised" className="p-6 text-center">
              <div className="flex items-center justify-center w-12 h-12 mx-auto mb-4 bg-gradient-to-br from-orange-500 to-red-500 rounded-xl">
                <Flame className="h-6 w-6 text-white" />
              </div>
              <div className="text-3xl font-bold user-app-ink mb-1">
                {userInfo?.dailyStreak || 0}
              </div>
              <div className="text-sm user-app-muted">Day Streak</div>
              {(userInfo?.dailyStreak || 0) > 0 && (
                <div className="flex items-center justify-center gap-1 mt-2 text-green-500">
                  <Flame className="h-4 w-4" />
                  <span className="text-sm font-semibold">Keep it up!</span>
                </div>
              )}
            </NeumorphicCard>

            <NeumorphicCard variant="raised" className="p-6 text-center">
              <div className="flex items-center justify-center w-12 h-12 mx-auto mb-4 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl">
                <Award className="h-6 w-6 text-white" />
              </div>
              <div className="text-3xl font-bold user-app-ink mb-1">
                {achievementStats.totalUnlocked || 0}
              </div>
              <div className="text-sm user-app-muted">Achievements</div>
              <div className="text-xs user-app-muted mt-2">
                {achievementStats.progress || 0}% complete
              </div>
            </NeumorphicCard>
          </div>

          {/* XP Progress Chart */}
          <NeumorphicCard variant="raised" className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold user-app-ink flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-cyan-500" />
                XP Progress
              </h3>
              <div className="flex items-center gap-2">
                {[7, 30, 90].map((period) => (
                  <button
                    key={period}
                    type="button"
                    onClick={(e) => {
                      e.preventDefault()
                      e.stopPropagation()
                      if (xpPeriod !== period) {
                        setXPPeriod(period)
                      }
                    }}
                    className={`px-3 py-1 rounded-full text-sm transition-all duration-200 ${
                      xpPeriod === period 
                        ? 'bg-gradient-to-r from-cyan-500 to-purple-600 text-white shadow-lg' 
                        : 'user-app-paper hover:user-app-paper user-app-ink'
                    }`}
                  >
                    {period}d
                  </button>
                ))}
              </div>
            </div>
            
            {/* Real XP Chart Data */}
            {chartLoading ? (
              <div className="h-64 user-app-paper rounded-xl p-4 flex items-center justify-center">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-500 mx-auto mb-2"></div>
                  <p className="text-sm user-app-muted">Loading chart data...</p>
                </div>
              </div>
            ) : xpHistory && xpHistory.length > 0 ? (
              <div className="relative">
                <div className="h-64 user-app-paper rounded-xl p-4 flex items-end justify-between gap-1 min-h-[200px]">
                  {xpHistory.map((entry, index) => {
                    const maxXP = Math.max(...xpHistory.map(e => e.xp || 0), 1)
                    const heightPercent = maxXP > 0 ? ((entry.xp || 0) / maxXP) * 100 : 0
                    const minHeight = 5 // Minimum visible height for bars
                    return (
                      <div 
                        key={index} 
                        className="flex flex-col items-center flex-1 min-w-0 group relative"
                        style={{ height: '100%' }}
                      >
                        <div 
                          className="w-full bg-gradient-to-t from-cyan-500 via-purple-500 to-pink-500 rounded-t transition-all duration-500 hover:from-cyan-400 hover:via-purple-400 hover:to-pink-400 cursor-pointer shadow-lg hover:shadow-xl"
                          style={{ 
                            height: `${Math.max(heightPercent, minHeight)}%`,
                            minHeight: `${minHeight}%`
                          }}
                          title={`${entry.xp || 0} XP on ${new Date(entry.date).toLocaleDateString()}`}
                        >
                          <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-900 dark:bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-10">
                            {entry.xp || 0} XP
                          </div>
                        </div>
                        <span className="text-xs user-app-muted mt-2 truncate w-full text-center">
                          {new Date(entry.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        </span>
                      </div>
                    )
                  })}
                </div>
                {/* Chart grid lines for better readability */}
                <div className="absolute inset-0 pointer-events-none mt-4 mb-12">
                  {[0, 25, 50, 75, 100].map((percent) => (
                    <div
                      key={percent}
                      className="absolute left-0 right-0 border-t user-app-border opacity-30"
                      style={{ bottom: `${percent}%` }}
                    />
                  ))}
                </div>
              </div>
            ) : (
              <div className="h-64 user-app-paper rounded-xl p-4 flex items-center justify-center">
                <div className="text-center">
                  <BarChart3 className="h-12 w-12 mx-auto mb-2 user-app-muted opacity-50" />
                  <p className="user-app-muted">No XP data available for this period</p>
                  <p className="text-xs user-app-muted mt-1">Start earning XP to see your progress!</p>
                </div>
              </div>
            )}
            {xpSummary && (
              <div className="mt-4 grid grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-sm user-app-muted">Total XP</div>
                  <div className="text-xl font-bold user-app-ink">{xpSummary.totalXP?.toLocaleString() || 0}</div>
                </div>
                <div>
                  <div className="text-sm user-app-muted">Avg Daily</div>
                  <div className="text-xl font-bold user-app-ink">{Math.round(xpSummary.avgDailyXP || 0)}</div>
                </div>
                <div>
                  <div className="text-sm user-app-muted">Days Active</div>
                  <div className="text-xl font-bold user-app-ink">{xpSummary.entries || 0}</div>
                </div>
              </div>
            )}
          </NeumorphicCard>

          {/* Recent Achievements */}
          <NeumorphicCard variant="raised" className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold user-app-ink flex items-center gap-2">
                <Trophy className="h-5 w-5 text-yellow-500" />
                Recent Achievements
              </h3>
              <button className="flex items-center gap-2 user-app-link hover:opacity-90 transition-colors">
                <span>View All</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {achievements && achievements.length > 0 ? (
                achievements
                  .filter(a => a.unlocked) // Show only unlocked achievements
                  .slice(0, 6) // Show latest 6
                  .sort((a, b) => {
                    // Sort by unlock date (most recent first)
                    const dateA = a.unlockedAt ? new Date(a.unlockedAt).getTime() : 0
                    const dateB = b.unlockedAt ? new Date(b.unlockedAt).getTime() : 0
                    return dateB - dateA
                  })
                  .map((achievement) => {
                    const getRarityColor = (rarity: string) => {
                      switch (rarity) {
                        case 'legendary': return 'from-yellow-500 to-orange-500'
                        case 'epic': return 'from-purple-500 to-pink-500'
                        case 'rare': return 'from-blue-500 to-cyan-500'
                        default: return 'from-gray-400 to-gray-600'
                      }
                    }
                    const getIcon = (icon: string) => {
                      // Map icon strings to actual icons
                      const iconMap: Record<string, any> = {
                        'trophy': Trophy,
                        'target': Target,
                        'flame': Flame,
                        'award': Award,
                        'dumbbell': Dumbbell,
                        'calendar': Calendar,
                        'star': Star,
                        'zap': Zap
                      }
                      return iconMap[icon] || Award
                    }
                    const IconComponent = getIcon(achievement.icon || 'award')
                    const unlockedDate = achievement.unlockedAt ? new Date(achievement.unlockedAt) : null
                    const timeAgo = unlockedDate ? getTimeAgo(unlockedDate) : 'Recently'
                    
                    return (
                      <div key={achievement.id} className="p-4 user-app-paper rounded-xl">
                        <div className="flex items-start gap-3">
                          <div className={`w-10 h-10 bg-gradient-to-br ${getRarityColor(achievement.rarity)} rounded-xl flex items-center justify-center`}>
                            <IconComponent className="h-5 w-5 text-white" />
                          </div>
                          <div className="flex-1">
                            <h4 className="font-semibold user-app-ink">
                              {achievement.name}
                            </h4>
                            <p className="text-sm user-app-muted">
                              {achievement.description}
                            </p>
                            <div className="flex items-center gap-2 mt-1">
                              <span className="text-xs text-cyan-500 font-semibold">+{achievement.xpReward} XP</span>
                              <span className="text-xs user-app-muted">•</span>
                              <span className="text-xs user-app-muted capitalize">{achievement.rarity}</span>
                            </div>
                            {unlockedDate && (
                              <p className="text-xs user-app-muted mt-1">
                                {timeAgo}
                              </p>
                            )}
                          </div>
                          <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
                        </div>
                      </div>
                    )
                  })
              ) : (
                <div className="col-span-full text-center py-8 user-app-muted">
                  No achievements unlocked yet. Keep going!
                </div>
              )}
            </div>
          </NeumorphicCard>

          {/* Activity Timeline */}
          <NeumorphicCard variant="raised" className="p-6">
            <h3 className="text-xl font-bold user-app-ink flex items-center gap-2 mb-6">
              <Activity className="h-5 w-5 text-green-500" />
              Recent Activity
            </h3>
            
            <div className="space-y-4">
              {activityLog && activityLog.length > 0 ? (
                activityLog.map((activity) => {
                  const getActivityIcon = (type: string) => {
                    const iconMap: Record<string, any> = {
                      'content_watched': Play,
                      'exercise_completed': Dumbbell,
                      'workout_completed': Dumbbell,
                      'challenge_joined': Target,
                      'challenge_completed': Target,
                      'achievement_unlocked': Award,
                      'streak_milestone': Flame
                    }
                    return iconMap[type] || Activity
                  }
                  const getActivityLabel = (type: string) => {
                    const labelMap: Record<string, string> = {
                      'content_watched': 'Watched video',
                      'exercise_completed': 'Completed exercise',
                      'workout_completed': 'Completed workout',
                      'challenge_joined': 'Joined challenge',
                      'challenge_completed': 'Completed challenge',
                      'achievement_unlocked': 'Unlocked achievement',
                      'streak_milestone': 'Achieved streak milestone'
                    }
                    return labelMap[type] || type.replace('_', ' ')
                  }
                  const IconComponent = getActivityIcon(activity.activityType)
                  const activityDate = new Date(activity.createdAt)
                  const timeAgo = getTimeAgo(activityDate)
                  
                  return (
                    <div key={activity.id} className="flex items-center gap-4 p-3 user-app-paper rounded-xl">
                      <div className="w-8 h-8 bg-gradient-to-br from-cyan-500 to-purple-600 rounded-full flex items-center justify-center">
                        <IconComponent className="h-4 w-4 text-white" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium user-app-ink">
                          {getActivityLabel(activity.activityType)}
                        </p>
                        <p className="text-sm user-app-muted">
                          {timeAgo}
                        </p>
                      </div>
                      {activity.xpEarned > 0 && (
                        <div className="flex items-center gap-1 text-cyan-500">
                          <Zap className="h-4 w-4" />
                          <span className="font-semibold">+{activity.xpEarned} XP</span>
                        </div>
                      )}
                    </div>
                  )
                })
              ) : (
                <div className="text-center py-8 user-app-muted">
                  No recent activity. Start your fitness journey!
                </div>
              )}
            </div>
          </NeumorphicCard>
        </div>
      </div>
    </div>
  )

  return content
}


