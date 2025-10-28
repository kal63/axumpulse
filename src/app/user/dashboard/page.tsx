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
  Globe
} from 'lucide-react'

export default function UserDashboardPage() {
  const router = useRouter()
  const { user, isLoading: authLoading } = useAuth()
  const [loading, setLoading] = useState(true)

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login')
    } else if (user) {
      setLoading(false)
    }
  }, [authLoading, user, router])

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

  // Mock data - replace with real API calls
  const userStats = {
    level: 4,
    xp: 344,
    xpProgress: 44,
    xpNeeded: 100,
    workoutsCompleted: 5,
    challengesCompleted: 2,
    achievementsUnlocked: 8,
    dayStreak: 7
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
                  Good morning, {user.name?.split(' ')[0] || 'User'}! ☀️
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

          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <NeumorphicCard variant="raised" className="p-6 text-center">
              <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center mx-auto mb-3">
                <Flame className="w-6 h-6 text-white" />
              </div>
              <div className="text-2xl font-bold text-[var(--neumorphic-text)]">{userStats.dayStreak}</div>
              <div className="text-sm text-[var(--neumorphic-muted)]">Day Streak</div>
              <div className="flex items-center justify-center mt-2">
                <ArrowUp className="w-4 h-4 text-green-500" />
                <span className="text-xs text-green-500 ml-1">+2</span>
              </div>
            </NeumorphicCard>

            <NeumorphicCard variant="raised" className="p-6 text-center">
              <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-3">
                <Zap className="w-6 h-6 text-white" />
              </div>
              <div className="text-2xl font-bold text-[var(--neumorphic-text)]">{userStats.xp}</div>
              <div className="text-sm text-[var(--neumorphic-muted)]">XP Points</div>
              <div className="flex items-center justify-center mt-2">
                <ArrowUp className="w-4 h-4 text-green-500" />
                <span className="text-xs text-green-500 ml-1">+150</span>
              </div>
            </NeumorphicCard>

            <NeumorphicCard variant="raised" className="p-6 text-center">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full flex items-center justify-center mx-auto mb-3">
                <Dumbbell className="w-6 h-6 text-white" />
              </div>
              <div className="text-2xl font-bold text-[var(--neumorphic-text)]">{userStats.workoutsCompleted}</div>
              <div className="text-sm text-[var(--neumorphic-muted)]">Workouts</div>
              <div className="flex items-center justify-center mt-2">
                <ArrowUp className="w-4 h-4 text-green-500" />
                <span className="text-xs text-green-500 ml-1">+3</span>
              </div>
            </NeumorphicCard>

            <NeumorphicCard variant="raised" className="p-6 text-center">
              <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-3">
                <Trophy className="w-6 h-6 text-white" />
              </div>
              <div className="text-2xl font-bold text-[var(--neumorphic-text)]">{userStats.challengesCompleted}</div>
              <div className="text-sm text-[var(--neumorphic-muted)]">Challenges</div>
              <div className="flex items-center justify-center mt-2">
                <Minus className="w-4 h-4 text-gray-500" />
                <span className="text-xs text-gray-500 ml-1">0</span>
              </div>
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
              
              {/* Mock Bar Chart */}
              <div className="space-y-4">
                {[
                  { label: 'Mon', value: 45, color: 'from-cyan-500 to-blue-500' },
                  { label: 'Tue', value: 60, color: 'from-blue-500 to-purple-500' },
                  { label: 'Wed', value: 30, color: 'from-purple-500 to-pink-500' },
                  { label: 'Thu', value: 80, color: 'from-pink-500 to-red-500' },
                  { label: 'Fri', value: 55, color: 'from-red-500 to-orange-500' },
                  { label: 'Sat', value: 70, color: 'from-orange-500 to-yellow-500' },
                  { label: 'Sun', value: 40, color: 'from-yellow-500 to-green-500' }
                ].map((day, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <div className="w-8 text-sm text-[var(--neumorphic-muted)]">{day.label}</div>
                    <div className="flex-1 bg-[var(--neumorphic-surface)] rounded-full h-3 overflow-hidden">
                      <div 
                        className={`h-full bg-gradient-to-r ${day.color} rounded-full transition-all duration-1000 ease-out`}
                        style={{ width: `${day.value}%` }}
                      />
                    </div>
                    <div className="w-8 text-sm font-semibold text-[var(--neumorphic-text)]">{day.value}</div>
                  </div>
                ))}
              </div>
            </NeumorphicCard>

            {/* Recent Achievements */}
            <NeumorphicCard variant="raised" className="p-6">
              <h3 className="text-xl font-bold text-[var(--neumorphic-text)] mb-6 flex items-center gap-2">
                <Award className="w-5 h-5 text-yellow-500" />
                Recent Achievements
              </h3>
              
              <div className="space-y-4">
                {[
                  { icon: Flame, title: 'Streak Master', description: '7-day workout streak', xp: 200, date: '2 days ago' },
                  { icon: Target, title: 'Goal Crusher', description: 'Completed 5 workouts', xp: 150, date: '5 days ago' },
                  { icon: Crown, title: 'Champion', description: 'Won a challenge', xp: 300, date: '1 week ago' }
                ].map((achievement, index) => (
                  <div key={index} className="flex items-center gap-4 p-3 rounded-xl bg-[var(--neumorphic-surface)]">
                    <div className="w-10 h-10 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center">
                      <achievement.icon className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-[var(--neumorphic-text)]">{achievement.title}</h4>
                      <p className="text-sm text-[var(--neumorphic-muted)]">{achievement.description}</p>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-bold text-[var(--neumorphic-text)]">+{achievement.xp} XP</div>
                      <div className="text-xs text-[var(--neumorphic-muted)]">{achievement.date}</div>
                    </div>
                  </div>
                ))}
              </div>
            </NeumorphicCard>
          </div>

          {/* Today's Activities */}
          <NeumorphicCard variant="raised" className="p-6">
            <h3 className="text-xl font-bold text-[var(--neumorphic-text)] mb-6 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-green-500" />
              Today's Activities
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-500 text-white">
                <div className="flex items-center gap-3 mb-2">
                  <Play className="w-5 h-5" />
                  <span className="font-semibold">Morning Workout</span>
                </div>
                <p className="text-sm opacity-90">30 min HIIT session</p>
                <div className="mt-2 flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  <span className="text-sm">8:00 AM</span>
                </div>
              </div>
              
              <div className="p-4 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 text-white">
                <div className="flex items-center gap-3 mb-2">
                  <Users className="w-5 h-5" />
                  <span className="font-semibold">Team Challenge</span>
                </div>
                <p className="text-sm opacity-90">Daily step challenge</p>
                <div className="mt-2 flex items-center gap-2">
                  <Timer className="w-4 h-4" />
                  <span className="text-sm">All day</span>
                </div>
              </div>
              
              <div className="p-4 rounded-xl bg-gradient-to-r from-green-500 to-emerald-500 text-white">
                <div className="flex items-center gap-3 mb-2">
                  <Heart className="w-5 h-5" />
                  <span className="font-semibold">Recovery</span>
                </div>
                <p className="text-sm opacity-90">Stretching session</p>
                <div className="mt-2 flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  <span className="text-sm">6:00 PM</span>
                </div>
              </div>
            </div>
          </NeumorphicCard>

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