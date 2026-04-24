'use client'

import { Trophy, Medal, Award, User as UserIcon } from 'lucide-react'
import { NeumorphicCard } from './NeumorphicCard'
import { getImageUrl } from '@/lib/upload-utils'

interface LeaderboardEntry {
  rank: number
  userId: number
  progress: number
  status: string
  joinedAt: string
  completedAt: string | null
  xpEarned: number
  user: {
    id: number
    name: string
    profilePicture: string | null
  }
}

interface LeaderboardTableProps {
  leaderboard: LeaderboardEntry[]
  currentUserId?: number
  userRank?: number | null
  totalParticipants?: number
  goalValue?: number
}

export function LeaderboardTable({ 
  leaderboard, 
  currentUserId, 
  userRank, 
  totalParticipants,
  goalValue = 100 
}: LeaderboardTableProps) {
  
  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Trophy className="h-5 w-5 text-yellow-500" />
      case 2:
        return <Medal className="h-5 w-5 text-gray-400" />
      case 3:
        return <Award className="h-5 w-5 text-amber-600" />
      default:
        return <span className="text-sm font-bold user-app-muted">#{rank}</span>
    }
  }

  const getRankBadge = (rank: number) => {
    switch (rank) {
      case 1:
        return 'bg-gradient-to-r from-yellow-400 to-yellow-600'
      case 2:
        return 'bg-gradient-to-r from-gray-300 to-gray-500'
      case 3:
        return 'bg-gradient-to-r from-amber-500 to-amber-700'
      default:
        return 'bg-gray-200 dark:bg-gray-700'
    }
  }

  return (
    <NeumorphicCard>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold user-app-ink flex items-center gap-2">
          <Trophy className="h-6 w-6 text-[var(--ethio-lemon-dark)]" />
          Leaderboard
        </h2>
        {totalParticipants && (
          <span className="text-sm user-app-muted">
            {totalParticipants} participants
          </span>
        )}
      </div>

      {/* User's Rank (if not in top list) */}
      {currentUserId && userRank && userRank > 10 && (
        <div className="mb-4 p-3 rounded-lg bg-gradient-to-r from-[var(--ethio-lemon)]/10 to-[var(--ethio-deep-blue)]/10 border-2 border-[var(--ethio-deep-blue)]">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium user-app-ink">
              Your Rank
            </span>
            <span className="text-lg font-bold text-[var(--ethio-deep-blue)]">
              #{userRank}
            </span>
          </div>
        </div>
      )}

      {/* Leaderboard List */}
      <div className="space-y-2">
        {leaderboard.length === 0 ? (
          <div className="text-center py-8 user-app-muted">
            <Trophy className="h-12 w-12 mx-auto mb-3 opacity-30" />
            <p>No participants yet. Be the first to join!</p>
          </div>
        ) : (
          leaderboard.map((entry) => {
            const isCurrentUser = entry.userId === currentUserId
            const progressPercentage = (entry.progress / goalValue) * 100

            return (
              <div
                key={entry.userId}
                className={`
                  flex items-center gap-4 p-3 rounded-lg transition-all
                  ${isCurrentUser
                    ? 'bg-gradient-to-r from-[var(--ethio-lemon)]/20 to-[var(--ethio-deep-blue)]/20 border-2 border-[var(--ethio-deep-blue)] shadow-[0_0_12px_rgba(142,198,63,0.2)]'
                    : 'bg-slate-100 dark:bg-slate-800/70 hover:user-app-paper'
                  }
                `}
              >
                {/* Rank */}
                <div className={`
                  flex items-center justify-center w-10 h-10 rounded-full shrink-0
                  ${getRankBadge(entry.rank)}
                  ${entry.rank <= 3 ? 'text-white' : 'user-app-ink'}
                `}>
                  {getRankIcon(entry.rank)}
                </div>

                {/* User Info */}
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  {entry.user.profilePicture ? (
                    <img
                      src={getImageUrl(entry.user.profilePicture)}
                      alt={entry.user.name}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[var(--ethio-lemon)] to-[var(--ethio-deep-blue)] flex items-center justify-center text-white font-bold">
                      <UserIcon className="h-5 w-5" />
                    </div>
                  )}
                  
                  <div className="flex-1 min-w-0">
                    <p className={`font-medium truncate ${isCurrentUser ? 'text-black font-bold' : 'user-app-ink'}`}>
                      {entry.user.name}
                      {isCurrentUser && ' (You)'}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-1.5 max-w-[120px]">
                        <div
                          className="bg-gradient-to-r from-[var(--ethio-lemon)] to-[var(--ethio-deep-blue)] h-1.5 rounded-full transition-all"
                          style={{ width: `${Math.min(progressPercentage, 100)}%` }}
                        />
                      </div>
                      <span className={`text-xs ${isCurrentUser ? 'text-white/90' : 'user-app-muted'}`}>
                        {entry.progress}/{goalValue}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Progress Score */}
                <div className="text-right shrink-0">
                  <div className={`text-lg font-bold ${isCurrentUser ? 'text-white' : 'user-app-ink'}`}>
                    {entry.progress}
                  </div>
                  {entry.status === 'completed' && (
                    <div className={`text-xs font-medium ${isCurrentUser ? 'text-white/90' : 'text-green-600 dark:text-green-400'}`}>
                      Completed
                    </div>
                  )}
                </div>
              </div>
            )
          })
        )}
      </div>
    </NeumorphicCard>
  )
}





