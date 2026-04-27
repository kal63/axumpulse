'use client'

import { Play, Dumbbell, Trophy, Clock, TrendingUp, Target } from 'lucide-react'
import { NeumorphicCard } from './NeumorphicCard'

interface StatsOverviewProps {
  stats: {
    contentWatched: number
    contentSaved: number
    totalWatchTime: number
    workoutPlansStarted: number
    workoutPlansCompleted: number
    challengesJoined: number
    challengesCompleted: number
    achievementsUnlocked: number
  }
}

export function StatsOverview({ stats }: StatsOverviewProps) {
  // Format watch time from seconds to hours/minutes
  const formatWatchTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`
    }
    return `${minutes}m`
  }

  const statCards = [
    {
      icon: Play,
      label: 'Content Watched',
      value: stats.contentWatched,
      color: 'from-[var(--ethio-lemon)] to-[var(--ethio-deep-blue)]',
      gradient: 'bg-gradient-to-br from-[var(--ethio-lemon)] to-[var(--ethio-deep-blue)]'
    },
    {
      icon: Clock,
      label: 'Total Watch Time',
      value: formatWatchTime(stats.totalWatchTime),
      color: 'from-[var(--ethio-lemon)] to-[var(--ethio-deep-blue)]',
      gradient: 'bg-gradient-to-br from-[var(--ethio-lemon)] to-[var(--ethio-deep-blue)]'
    },
    {
      icon: Dumbbell,
      label: 'Workouts Started',
      value: stats.workoutPlansStarted,
      color: 'from-[var(--ethio-lemon)] to-[var(--ethio-deep-blue)]',
      gradient: 'bg-gradient-to-br from-[var(--ethio-lemon)] to-[var(--ethio-deep-blue)]'
    },
    {
      icon: Target,
      label: 'Workouts Completed',
      value: stats.workoutPlansCompleted,
      color: 'from-[var(--ethio-lemon-dark)] to-[var(--ethio-deep-blue)]',
      gradient: 'bg-gradient-to-br from-[var(--ethio-lemon-dark)] to-[var(--ethio-deep-blue)]'
    },
    {
      icon: Trophy,
      label: 'Challenges Completed',
      value: stats.challengesCompleted,
      color: 'from-[var(--color-amber-warning)] to-orange-600',
      gradient: 'bg-gradient-to-br from-amber-500 to-orange-600'
    },
    {
      icon: TrendingUp,
      label: 'Achievements',
      value: stats.achievementsUnlocked,
      color: 'from-[var(--ethio-lemon-dark)] to-[var(--ethio-deep-blue)]',
      gradient: 'bg-gradient-to-br from-[var(--ethio-lemon-dark)] to-[var(--ethio-deep-blue)]'
    },
  ]

  // Calculate completion rates
  const workoutCompletionRate = stats.workoutPlansStarted > 0
    ? Math.round((stats.workoutPlansCompleted / stats.workoutPlansStarted) * 100)
    : 0

  const challengeCompletionRate = stats.challengesJoined > 0
    ? Math.round((stats.challengesCompleted / stats.challengesJoined) * 100)
    : 0

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {statCards.map((stat, index) => {
          const Icon = stat.icon
          return (
            <NeumorphicCard key={index} className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <p className="text-xs user-app-muted mb-1">
                    {stat.label}
                  </p>
                  <p className="text-2xl font-bold user-app-ink">
                    {stat.value}
                  </p>
                </div>
                <div className={`
                  w-12 h-12 rounded-xl ${stat.gradient}
                  flex items-center justify-center
                  shadow-lg
                `}>
                  <Icon className="h-6 w-6 text-white" />
                </div>
              </div>
            </NeumorphicCard>
          )
        })}
      </div>

      {/* Completion Rates */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Workout Completion */}
        <NeumorphicCard className="p-5">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold user-app-ink flex items-center gap-2">
              <Dumbbell className="h-5 w-5 text-[var(--ethio-lemon-dark)]" />
              Workout Completion
            </h3>
            <span className="text-2xl font-bold text-[var(--ethio-lemon-dark)]">
              {workoutCompletionRate}%
            </span>
          </div>
          
          {/* Progress Bar */}
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-[var(--ethio-lemon)] to-[var(--ethio-deep-blue)] transition-all duration-500 rounded-full"
              style={{ width: `${workoutCompletionRate}%` }}
            />
          </div>
          
          <div className="flex items-center justify-between mt-2 text-xs user-app-muted">
            <span>{stats.workoutPlansCompleted} completed</span>
            <span>{stats.workoutPlansStarted} started</span>
          </div>
        </NeumorphicCard>

        {/* Challenge Completion */}
        <NeumorphicCard className="p-5">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold user-app-ink flex items-center gap-2">
              <Trophy className="h-5 w-5 text-[var(--color-amber-warning)]" />
              Challenge Completion
            </h3>
            <span className="text-2xl font-bold text-[var(--color-amber-warning)]">
              {challengeCompletionRate}%
            </span>
          </div>
          
          {/* Progress Bar */}
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-[var(--color-amber-warning)] to-orange-600 transition-all duration-500 rounded-full"
              style={{ width: `${challengeCompletionRate}%` }}
            />
          </div>
          
          <div className="flex items-center justify-between mt-2 text-xs user-app-muted">
            <span>{stats.challengesCompleted} completed</span>
            <span>{stats.challengesJoined} joined</span>
          </div>
        </NeumorphicCard>
      </div>

      {/* Quick Stats Summary */}
      <NeumorphicCard className="p-5">
        <h3 className="font-semibold user-app-ink mb-4">
          Activity Summary
        </h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm user-app-muted">
              Saved Content
            </span>
            <span className="text-sm font-medium user-app-ink">
              {stats.contentSaved} items
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm user-app-muted">
              Active Challenges
            </span>
            <span className="text-sm font-medium user-app-ink">
              {stats.challengesJoined - stats.challengesCompleted} ongoing
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm user-app-muted">
              Active Workouts
            </span>
            <span className="text-sm font-medium user-app-ink">
              {stats.workoutPlansStarted - stats.workoutPlansCompleted} in progress
            </span>
          </div>
        </div>
      </NeumorphicCard>
    </div>
  )
}





