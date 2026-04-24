'use client'

import { Calendar, Clock, Trophy, Users, Target, TrendingUp } from 'lucide-react'
import Link from 'next/link'
import { NeumorphicCard } from './NeumorphicCard'
import { Progress } from '@/components/ui/progress'

interface ChallengeCardProps {
  challenge: {
    id: number
    title: string
    description: string
    difficulty: string
    category: string
    goalType: string
    goalValue: number
    startTime?: string
    endTime?: string
    startDate?: string // legacy support
    endDate?: string // legacy support
    xpReward: number
    userProgress?: Array<{
      status: string
      progress: number
      joinedAt: string
      completedAt: string | null
      rank: number | null
    }>
    trainer?: {
      id: number
      verified: boolean
      User: {
        name: string
        profilePicture: string | null
      }
    }
  }
  showProgress?: boolean
}

export function ChallengeCard({ challenge, showProgress = true }: ChallengeCardProps) {
  const userProgress = challenge.userProgress?.[0]
  const hasJoined = !!userProgress
  const progressPercentage = userProgress ? (userProgress.progress / challenge.goalValue) * 100 : 0
  
  // Use startTime/endTime (API fields) or fallback to startDate/endDate (legacy)
  const startDate = challenge.startTime || challenge.startDate
  const endDate = challenge.endTime || challenge.endDate
  const startTime = startDate ? new Date(startDate) : null
  const endTime = endDate ? new Date(endDate) : null
  const now = new Date()
  
  const isActive = startTime && endTime ? startTime <= now && endTime >= now : false
  const isUpcoming = startTime ? startTime > now : false
  const isCompleted = userProgress?.status === 'completed'

  const difficultyColors = {
    beginner: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
    intermediate: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
    advanced: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  }

  const statusColors = {
    active: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-[var(--ethio-lemon)]',
    upcoming: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
    completed: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-[var(--ethio-lemon)]',
  }

  const status = isCompleted ? 'completed' : isActive ? 'active' : isUpcoming ? 'upcoming' : 'ended'

  return (
    <Link href={`/user/challenges/${challenge.id}`}>
      <NeumorphicCard 
        className="group hover:shadow-[8px_8px_20px_rgba(15,23,42,0.2),-8px_-8px_20px_rgba(255,255,255,0.95)] dark:hover:shadow-[8px_8px_20px_rgba(0,0,0,0.7),-8px_-8px_20px_rgba(255,255,255,0.08)] transition-all duration-300 cursor-pointer h-full"
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-start justify-between gap-3 mb-3">
            <div className="flex-1">
              <h3 className="font-bold text-lg user-app-ink group-hover:text-[var(--ethio-deep-blue)] transition-colors line-clamp-2">
                {challenge.title}
              </h3>
              {challenge.trainer && (
                <p className="text-xs user-app-muted mt-1">
                  by {challenge.trainer.User.name}
                  {challenge.trainer.verified && ' ✓'}
                </p>
              )}
            </div>
            
            {/* Status Badge */}
            {status !== 'ended' && (
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[status as keyof typeof statusColors]}`}>
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </span>
            )}
          </div>

          {/* Description */}
          <p className="text-sm user-app-muted line-clamp-2 mb-4">
            {challenge.description}
          </p>

          {/* Details Grid */}
          <div className="grid grid-cols-2 gap-3 mb-4">
            <div className="flex items-center gap-2 text-xs user-app-muted">
              <Target className="h-4 w-4 text-[var(--ethio-deep-blue)]" />
              <span>{challenge.goalValue} {challenge.goalType}</span>
            </div>
            
            <div className="flex items-center gap-2 text-xs user-app-muted">
              <Trophy className="h-4 w-4 text-[var(--ethio-lemon-dark)]" />
              <span>{challenge.xpReward} XP</span>
            </div>

            <div className="flex items-center gap-2 text-xs user-app-muted">
              <Calendar className="h-4 w-4 text-[var(--color-lime-pulse)]" />
              <span>
                {endDate 
                  ? new Date(endDate).toLocaleDateString('en-US', { 
                      month: 'short', 
                      day: 'numeric' 
                    })
                  : 'Invalid date'}
              </span>
            </div>

            <div className={`flex items-center gap-2 text-xs px-2 py-1 rounded-md ${difficultyColors[challenge.difficulty as keyof typeof difficultyColors]}`}>
              <TrendingUp className="h-3 w-3" />
              <span className="font-medium capitalize">{challenge.difficulty}</span>
            </div>
          </div>

          {/* Progress (if user has joined) */}
          {hasJoined && showProgress && userProgress && (
            <div className="mt-auto pt-4 border-t border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium user-app-ink">
                  Your Progress
                </span>
                <span className="text-xs font-bold text-[var(--ethio-deep-blue)]">
                  {userProgress.progress}/{challenge.goalValue}
                </span>
              </div>
              <Progress value={progressPercentage} className="h-2" />
              {userProgress.rank && (
                <div className="flex items-center gap-1 mt-2 text-xs user-app-muted">
                  <Trophy className="h-3 w-3" />
                  <span>Rank #{userProgress.rank}</span>
                </div>
              )}
            </div>
          )}

          {/* Join Badge */}
          {!hasJoined && isActive && (
            <div className="mt-auto pt-4">
              <div className="bg-gradient-to-r from-[var(--ethio-lemon)] to-[var(--ethio-deep-blue)] text-white text-center py-2 rounded-lg text-sm font-medium">
                Join Challenge
              </div>
            </div>
          )}
        </div>
      </NeumorphicCard>
    </Link>
  )
}





