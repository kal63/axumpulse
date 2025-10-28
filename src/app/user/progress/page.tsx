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
    totalAchievements: 0
  })
  const [stats, setStats] = useState<any>(null)
  const [userInfo, setUserInfo] = useState<any>(null)
  const [xpPeriod, setXPPeriod] = useState(30)

  useEffect(() => {
    fetchAllData()
  }, [xpPeriod])

  async function fetchAllData() {
    try {
      setLoading(true)
      setError(null)

      // Fetch all data in parallel
      const [statsRes, historyRes, achievementsRes] = await Promise.all([
        apiClient.getUserStats(),
        apiClient.getUserXPHistory(xpPeriod),
        apiClient.getUserAchievements()
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
          totalUnlocked: achievementsRes.data.totalUnlocked,
          totalAchievements: achievementsRes.data.totalAchievements
        })
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
              <div className="flex items-center justify-center gap-1 mt-2 text-green-500">
                <ArrowUp className="h-4 w-4" />
                <span className="text-sm font-semibold">+2 this week</span>
              </div>
            </NeumorphicCard>

            <NeumorphicCard variant="raised" className="p-6 text-center">
              <div className="flex items-center justify-center w-12 h-12 mx-auto mb-4 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl">
                <Dumbbell className="h-6 w-6 text-white" />
              </div>
              <div className="text-3xl font-bold text-[var(--neumorphic-text)] mb-1">
                {stats?.workoutsCompleted || 0}
              </div>
              <div className="text-sm text-[var(--neumorphic-muted)]">Workouts</div>
              <div className="flex items-center justify-center gap-1 mt-2 text-green-500">
                <ArrowUp className="h-4 w-4" />
                <span className="text-sm font-semibold">+5 this week</span>
              </div>
            </NeumorphicCard>

            <NeumorphicCard variant="raised" className="p-6 text-center">
              <div className="flex items-center justify-center w-12 h-12 mx-auto mb-4 bg-gradient-to-br from-orange-500 to-red-500 rounded-xl">
                <Flame className="h-6 w-6 text-white" />
              </div>
              <div className="text-3xl font-bold text-[var(--neumorphic-text)] mb-1">
                {stats?.streak || 0}
              </div>
              <div className="text-sm text-[var(--neumorphic-muted)]">Day Streak</div>
              <div className="flex items-center justify-center gap-1 mt-2 text-green-500">
                <ArrowUp className="h-4 w-4" />
                <span className="text-sm font-semibold">+3 days</span>
              </div>
            </NeumorphicCard>

            <NeumorphicCard variant="raised" className="p-6 text-center">
              <div className="flex items-center justify-center w-12 h-12 mx-auto mb-4 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl">
                <Award className="h-6 w-6 text-white" />
              </div>
              <div className="text-3xl font-bold text-[var(--neumorphic-text)] mb-1">
                {achievementStats.totalUnlocked || 0}
              </div>
              <div className="text-sm text-[var(--neumorphic-muted)]">Achievements</div>
              <div className="flex items-center justify-center gap-1 mt-2 text-green-500">
                <ArrowUp className="h-4 w-4" />
                <span className="text-sm font-semibold">+1 this week</span>
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
            
            {/* Mock Chart Data */}
            <div className="h-64 bg-gradient-to-r from-cyan-500/10 to-purple-500/10 rounded-xl p-4 flex items-end justify-between">
              {Array.from({ length: 30 }, (_, i) => (
                <div key={i} className="flex flex-col items-center">
                  <div 
                    className="w-3 bg-gradient-to-t from-cyan-500 to-purple-600 rounded-t"
                    style={{ height: `${Math.random() * 100 + 20}px` }}
                  />
                  <span className="text-xs text-[var(--neumorphic-muted)] mt-2">
                    {i + 1}
                  </span>
                </div>
              ))}
            </div>
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
              {[
                { title: "First Workout", description: "Completed your first workout", icon: Dumbbell, color: "from-cyan-500 to-blue-500", date: "2 days ago" },
                { title: "Week Warrior", description: "Completed 7 workouts in a week", icon: Calendar, color: "from-purple-500 to-pink-500", date: "1 week ago" },
                { title: "Challenge Master", description: "Completed your first challenge", icon: Target, color: "from-orange-500 to-red-500", date: "3 days ago" }
              ].map((achievement, index) => (
                <div key={index} className="p-4 bg-[var(--neumorphic-surface)] rounded-xl">
                  <div className="flex items-start gap-3">
                    <div className={`w-10 h-10 bg-gradient-to-br ${achievement.color} rounded-xl flex items-center justify-center`}>
                      <achievement.icon className="h-5 w-5 text-white" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-[var(--neumorphic-text)]">
                        {achievement.title}
                      </h4>
                      <p className="text-sm text-[var(--neumorphic-muted)]">
                        {achievement.description}
                      </p>
                      <p className="text-xs text-[var(--neumorphic-muted)] mt-1">
                        {achievement.date}
                      </p>
                    </div>
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  </div>
                </div>
              ))}
            </div>
          </NeumorphicCard>

          {/* Activity Timeline */}
          <NeumorphicCard variant="raised" className="p-6">
            <h3 className="text-xl font-bold text-[var(--neumorphic-text)] flex items-center gap-2 mb-6">
              <Activity className="h-5 w-5 text-green-500" />
              Recent Activity
            </h3>
            
            <div className="space-y-4">
              {[
                { action: "Completed workout", type: "workout", xp: 50, time: "2 hours ago", icon: Dumbbell },
                { action: "Joined challenge", type: "challenge", xp: 25, time: "1 day ago", icon: Target },
                { action: "Achieved streak", type: "streak", xp: 30, time: "2 days ago", icon: Flame },
                { action: "Completed video", type: "video", xp: 20, time: "3 days ago", icon: Play }
              ].map((activity, index) => (
                <div key={index} className="flex items-center gap-4 p-3 bg-[var(--neumorphic-surface)] rounded-xl">
                  <div className="w-8 h-8 bg-gradient-to-br from-cyan-500 to-purple-600 rounded-full flex items-center justify-center">
                    <activity.icon className="h-4 w-4 text-white" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-[var(--neumorphic-text)]">
                      {activity.action}
                    </p>
                    <p className="text-sm text-[var(--neumorphic-muted)]">
                      {activity.time}
                    </p>
                  </div>
                  <div className="flex items-center gap-1 text-cyan-500">
                    <Zap className="h-4 w-4" />
                    <span className="font-semibold">+{activity.xp} XP</span>
                  </div>
                </div>
              ))}
            </div>
          </NeumorphicCard>
        </div>
      </div>
    </div>
  )

  return content
}


