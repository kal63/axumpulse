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

  useEffect(() => {
    fetchAllData()
  }, [xpPeriod])

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
        setAchievements(achievementsRes.data.achievements)
        setAchievementStats({
          totalUnlocked: achievementsRes.data.stats.unlocked,
          totalAchievements: achievementsRes.data.stats.total,
          progress: achievementsRes.data.stats.progress
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
    }
  }

  const handlePeriodChange = (period: number) => {
    setXPPeriod(period)
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
          <p className="text-[var(--neumorphic-text)]">Loading your progress...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <TrendingUp className="h-16 w-16 mx-auto mb-4 text-red-500 opacity-50" />
          <p className="text-[var(--neumorphic-text)] text-xl font-semibold mb-2">
            Oops! Something went wrong
          </p>
          <p className="text-[var(--neumorphic-muted)] mb-4">{error}</p>
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
    <div className="min-h-screen bg-[var(--neumorphic-bg)]">
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
              <h1 className="text-4xl md:text-6xl font-bold text-[var(--neumorphic-text)] mb-4">
                📊 Progress Dashboard
              </h1>
              <p className="text-xl text-[var(--neumorphic-muted)] max-w-2xl mx-auto">
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
                <h2 className="text-3xl font-bold text-[var(--neumorphic-text)] mb-2">
                  Level {userInfo.level}
                </h2>
                <p className="text-[var(--neumorphic-muted)] mb-4">
                  {userInfo.xp.toLocaleString()} XP • {userInfo.xpProgress}/{userInfo.xpNeeded} to next level
                </p>
                <div className="w-full bg-[var(--neumorphic-bg)] rounded-full h-3 mb-2">
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
              <div className="text-3xl font-bold text-[var(--neumorphic-text)] mb-1">
                {stats?.challengesCompleted || 0}
              </div>
              <div className="text-sm text-[var(--neumorphic-muted)]">Challenges</div>
              <div className="text-xs text-[var(--neumorphic-muted)] mt-2">
                {userInfo?.challengeStreak || 0} challenge streak
              </div>
            </NeumorphicCard>

            <NeumorphicCard variant="raised" className="p-6 text-center">
              <div className="flex items-center justify-center w-12 h-12 mx-auto mb-4 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl">
                <Dumbbell className="h-6 w-6 text-white" />
              </div>
              <div className="text-3xl font-bold text-[var(--neumorphic-text)] mb-1">
                {stats?.workoutPlansCompleted || 0}
              </div>
              <div className="text-sm text-[var(--neumorphic-muted)]">Workouts</div>
              <div className="text-xs text-[var(--neumorphic-muted)] mt-2">
                {userInfo?.workoutStreak || 0} workout streak
              </div>
            </NeumorphicCard>

            <NeumorphicCard variant="raised" className="p-6 text-center">
              <div className="flex items-center justify-center w-12 h-12 mx-auto mb-4 bg-gradient-to-br from-orange-500 to-red-500 rounded-xl">
                <Flame className="h-6 w-6 text-white" />
              </div>
              <div className="text-3xl font-bold text-[var(--neumorphic-text)] mb-1">
                {userInfo?.dailyStreak || 0}
              </div>
              <div className="text-sm text-[var(--neumorphic-muted)]">Day Streak</div>
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
              <div className="text-3xl font-bold text-[var(--neumorphic-text)] mb-1">
                {achievementStats.totalUnlocked || 0}
              </div>
              <div className="text-sm text-[var(--neumorphic-muted)]">Achievements</div>
              <div className="text-xs text-[var(--neumorphic-muted)] mt-2">
                {achievementStats.progress || 0}% complete
              </div>
            </NeumorphicCard>
          </div>

          {/* XP Progress Chart */}
          <NeumorphicCard variant="raised" className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-[var(--neumorphic-text)] flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-cyan-500" />
                XP Progress
              </h3>
              <div className="flex items-center gap-2">
                {[7, 30, 90].map((period) => (
                  <button
                    key={period}
                    onClick={() => handlePeriodChange(period)}
                    className={`px-3 py-1 rounded-full text-sm transition-all duration-200 ${
                      xpPeriod === period 
                        ? 'bg-gradient-to-r from-cyan-500 to-purple-600 text-white' 
                        : 'bg-[var(--neumorphic-surface)] hover:bg-[var(--neumorphic-hover)] text-[var(--neumorphic-text)]'
                    }`}
                  >
                    {period}d
                  </button>
                ))}
              </div>
            </div>
            
            {/* Real XP Chart Data */}
            {xpHistory && xpHistory.length > 0 ? (
              <div className="h-64 bg-gradient-to-r from-cyan-500/10 to-purple-500/10 rounded-xl p-4 flex items-end justify-between gap-1">
                {xpHistory.map((entry, index) => {
                  const maxXP = Math.max(...xpHistory.map(e => e.xp || 0), 1)
                  const heightPercent = ((entry.xp || 0) / maxXP) * 100
                  return (
                    <div key={index} className="flex flex-col items-center flex-1 min-w-0">
                      <div 
                        className="w-full bg-gradient-to-t from-cyan-500 to-purple-600 rounded-t transition-all duration-500"
                        style={{ height: `${Math.max(heightPercent, 5)}%` }}
                        title={`${entry.xp || 0} XP on ${new Date(entry.date).toLocaleDateString()}`}
                      />
                      <span className="text-xs text-[var(--neumorphic-muted)] mt-2 truncate w-full text-center">
                        {new Date(entry.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </span>
                    </div>
                  )
                })}
              </div>
            ) : (
              <div className="h-64 bg-gradient-to-r from-cyan-500/10 to-purple-500/10 rounded-xl p-4 flex items-center justify-center">
                <p className="text-[var(--neumorphic-muted)]">No XP data available for this period</p>
              </div>
            )}
            {xpSummary && (
              <div className="mt-4 grid grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-sm text-[var(--neumorphic-muted)]">Total XP</div>
                  <div className="text-xl font-bold text-[var(--neumorphic-text)]">{xpSummary.totalXP?.toLocaleString() || 0}</div>
                </div>
                <div>
                  <div className="text-sm text-[var(--neumorphic-muted)]">Avg Daily</div>
                  <div className="text-xl font-bold text-[var(--neumorphic-text)]">{Math.round(xpSummary.avgDailyXP || 0)}</div>
                </div>
                <div>
                  <div className="text-sm text-[var(--neumorphic-muted)]">Days Active</div>
                  <div className="text-xl font-bold text-[var(--neumorphic-text)]">{xpSummary.entries || 0}</div>
                </div>
              </div>
            )}
          </NeumorphicCard>

          {/* Recent Achievements */}
          <NeumorphicCard variant="raised" className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-[var(--neumorphic-text)] flex items-center gap-2">
                <Trophy className="h-5 w-5 text-yellow-500" />
                Recent Achievements
              </h3>
              <button className="flex items-center gap-2 text-[var(--neumorphic-accent)] hover:text-[var(--neumorphic-accent-hover)] transition-colors">
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
                      <div key={achievement.id} className="p-4 bg-[var(--neumorphic-surface)] rounded-xl">
                        <div className="flex items-start gap-3">
                          <div className={`w-10 h-10 bg-gradient-to-br ${getRarityColor(achievement.rarity)} rounded-xl flex items-center justify-center`}>
                            <IconComponent className="h-5 w-5 text-white" />
                          </div>
                          <div className="flex-1">
                            <h4 className="font-semibold text-[var(--neumorphic-text)]">
                              {achievement.name}
                            </h4>
                            <p className="text-sm text-[var(--neumorphic-muted)]">
                              {achievement.description}
                            </p>
                            <div className="flex items-center gap-2 mt-1">
                              <span className="text-xs text-cyan-500 font-semibold">+{achievement.xpReward} XP</span>
                              <span className="text-xs text-[var(--neumorphic-muted)]">•</span>
                              <span className="text-xs text-[var(--neumorphic-muted)] capitalize">{achievement.rarity}</span>
                            </div>
                            {unlockedDate && (
                              <p className="text-xs text-[var(--neumorphic-muted)] mt-1">
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
                <div className="col-span-full text-center py-8 text-[var(--neumorphic-muted)]">
                  No achievements unlocked yet. Keep going!
                </div>
              )}
            </div>
          </NeumorphicCard>

          {/* Activity Timeline */}
          <NeumorphicCard variant="raised" className="p-6">
            <h3 className="text-xl font-bold text-[var(--neumorphic-text)] flex items-center gap-2 mb-6">
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
                    <div key={activity.id} className="flex items-center gap-4 p-3 bg-[var(--neumorphic-surface)] rounded-xl">
                      <div className="w-8 h-8 bg-gradient-to-br from-cyan-500 to-purple-600 rounded-full flex items-center justify-center">
                        <IconComponent className="h-4 w-4 text-white" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-[var(--neumorphic-text)]">
                          {getActivityLabel(activity.activityType)}
                        </p>
                        <p className="text-sm text-[var(--neumorphic-muted)]">
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
                <div className="text-center py-8 text-[var(--neumorphic-muted)]">
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


