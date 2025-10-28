'use client'

import { Target, CheckCircle2, Clock, TrendingUp } from 'lucide-react'
import { NeumorphicCard } from './NeumorphicCard'
import { Progress } from '@/components/ui/progress'

interface Goal {
  id: string
  title: string
  description: string
  current: number
  target: number
  type: 'daily' | 'weekly' | 'monthly'
  category: 'content' | 'workout' | 'challenge' | 'xp'
  deadline?: string
}

interface GoalTrackerProps {
  goals?: Goal[]
  user?: {
    xp: number
    level: number
  }
}

export function GoalTracker({ goals = [], user }: GoalTrackerProps) {
  // Default goals if none provided
  const defaultGoals: Goal[] = [
    {
      id: 'daily-xp',
      title: 'Daily XP Goal',
      description: 'Earn 100 XP today',
      current: user ? (user.xp % 100) : 0,
      target: 100,
      type: 'daily',
      category: 'xp'
    },
    {
      id: 'weekly-content',
      title: 'Weekly Content',
      description: 'Watch 5 videos this week',
      current: 3,
      target: 5,
      type: 'weekly',
      category: 'content'
    },
    {
      id: 'weekly-workouts',
      title: 'Weekly Workouts',
      description: 'Complete 3 workouts this week',
      current: 1,
      target: 3,
      type: 'weekly',
      category: 'workout'
    },
    {
      id: 'monthly-challenges',
      title: 'Monthly Challenges',
      description: 'Join 2 challenges this month',
      current: 0,
      target: 2,
      type: 'monthly',
      category: 'challenge'
    }
  ]

  const displayGoals = goals.length > 0 ? goals : defaultGoals

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'daily':
        return 'bg-gradient-to-r from-[var(--color-cyber-blue)] to-blue-600'
      case 'weekly':
        return 'bg-gradient-to-r from-[var(--color-neon-magenta)] to-purple-600'
      case 'monthly':
        return 'bg-gradient-to-r from-[var(--color-amber-warning)] to-orange-600'
      default:
        return 'bg-gray-500'
    }
  }

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'content':
        return '🎥'
      case 'workout':
        return '💪'
      case 'challenge':
        return '🏆'
      case 'xp':
        return '⭐'
      default:
        return '🎯'
    }
  }

  return (
    <NeumorphicCard>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-[var(--neumorphic-text)] flex items-center gap-2">
            <Target className="h-6 w-6 text-[var(--color-lime-pulse)]" />
            Goals & Milestones
          </h2>
          <div className="text-sm text-[var(--neumorphic-muted)]">
            {displayGoals.filter(g => g.current >= g.target).length}/{displayGoals.length} completed
          </div>
        </div>

        {/* Goals List */}
        <div className="space-y-4">
          {displayGoals.map((goal) => {
            const progress = (goal.current / goal.target) * 100
            const isCompleted = goal.current >= goal.target

            return (
              <div
                key={goal.id}
                className={`
                  p-4 rounded-xl transition-all duration-300
                  ${isCompleted
                    ? 'bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 border-2 border-emerald-500'
                    : 'bg-[var(--neumorphic-surface)] shadow-[2px_2px_4px_rgba(15,23,42,0.15),-2px_-2px_4px_rgba(255,255,255,0.85)] dark:shadow-[2px_2px_4px_rgba(0,0,0,0.6),-2px_-2px_4px_rgba(255,255,255,0.06)]'
                  }
                `}
              >
                {/* Goal Header */}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-start gap-3 flex-1">
                    {/* Category Icon */}
                    <div className="text-3xl">
                      {getCategoryIcon(goal.category)}
                    </div>
                    
                    {/* Goal Info */}
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className={`font-semibold ${isCompleted ? 'text-emerald-700 dark:text-emerald-400' : 'text-[var(--neumorphic-text)]'}`}>
                          {goal.title}
                        </h3>
                        {isCompleted && (
                          <CheckCircle2 className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                        )}
                      </div>
                      <p className="text-sm text-[var(--neumorphic-muted)]">
                        {goal.description}
                      </p>
                    </div>
                  </div>

                  {/* Type Badge */}
                  <span className={`
                    px-2 py-1 rounded-full text-xs font-medium text-white
                    ${getTypeColor(goal.type)}
                  `}>
                    {goal.type.charAt(0).toUpperCase() + goal.type.slice(1)}
                  </span>
                </div>

                {/* Progress Bar */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className={`font-medium ${isCompleted ? 'text-emerald-700 dark:text-emerald-400' : 'text-[var(--neumorphic-text)]'}`}>
                      {goal.current}/{goal.target}
                    </span>
                    <span className={`text-xs ${isCompleted ? 'text-emerald-600 dark:text-emerald-400' : 'text-[var(--neumorphic-muted)]'}`}>
                      {Math.min(Math.round(progress), 100)}%
                    </span>
                  </div>
                  
                  <Progress 
                    value={Math.min(progress, 100)} 
                    className={`h-2 ${isCompleted ? 'bg-emerald-200 dark:bg-emerald-900' : ''}`}
                  />
                </div>

                {/* Deadline */}
                {goal.deadline && !isCompleted && (
                  <div className="mt-2 flex items-center gap-1 text-xs text-[var(--neumorphic-muted)]">
                    <Clock className="h-3 w-3" />
                    <span>
                      Due {new Date(goal.deadline).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric'
                      })}
                    </span>
                  </div>
                )}
              </div>
            )
          })}
        </div>

        {/* Overall Progress */}
        <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-[var(--neumorphic-text)]">
              Overall Progress
            </span>
            <span className="text-sm font-bold text-[var(--color-cyber-blue)]">
              {Math.round((displayGoals.filter(g => g.current >= g.target).length / displayGoals.length) * 100)}%
            </span>
          </div>
          <Progress 
            value={(displayGoals.filter(g => g.current >= g.target).length / displayGoals.length) * 100}
            className="h-3"
          />
        </div>

        {/* Motivational Message */}
        <div className="text-center p-4 rounded-lg bg-gradient-to-r from-[var(--color-cyber-blue)]/10 to-[var(--color-neon-magenta)]/10">
          <TrendingUp className="h-6 w-6 mx-auto mb-2 text-[var(--color-cyber-blue)]" />
          <p className="text-sm font-medium text-[var(--neumorphic-text)]">
            {displayGoals.filter(g => g.current >= g.target).length === displayGoals.length
              ? '🎉 All goals completed! Keep up the amazing work!'
              : displayGoals.filter(g => g.current >= g.target).length > displayGoals.length / 2
              ? '💪 Great progress! You\'re more than halfway there!'
              : '🚀 Let\'s do this! Start with your daily goals.'}
          </p>
        </div>
      </div>
    </NeumorphicCard>
  )
}

