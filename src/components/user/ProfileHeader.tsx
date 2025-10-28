'use client'

import { User, MapPin, Calendar, Edit, TrendingUp } from 'lucide-react'
import { NeumorphicCard } from './NeumorphicCard'
import { Progress } from '@/components/ui/progress'
import { Button } from '@/components/ui/button'

interface ProfileHeaderProps {
  user: {
    id: number
    name: string
    email: string
    profilePicture: string | null
    bio: string | null
    location: string | null
    xp: number
    level: number
    xpProgress: number
    xpNeeded: number
    levelProgress: number
    createdAt: string
  }
  stats?: {
    contentWatched: number
    workoutPlansCompleted: number
    challengesCompleted: number
    achievementsUnlocked: number
  }
  onEdit?: () => void
  isOwnProfile?: boolean
}

export function ProfileHeader({ user, stats, onEdit, isOwnProfile = true }: ProfileHeaderProps) {
  const memberSince = new Date(user.createdAt).toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric'
  })

  // Generate initials for avatar fallback
  const initials = user.name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)

  return (
    <NeumorphicCard>
      <div className="space-y-6">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row gap-6">
          {/* Avatar */}
          <div className="relative shrink-0">
            {user.profilePicture ? (
              <img
                src={user.profilePicture}
                alt={user.name}
                className="w-24 h-24 md:w-32 md:h-32 rounded-2xl object-cover"
              />
            ) : (
              <div className="w-24 h-24 md:w-32 md:h-32 rounded-2xl bg-gradient-to-br from-[var(--color-cyber-blue)] to-[var(--color-neon-magenta)] flex items-center justify-center">
                <span className="text-4xl font-bold text-white">{initials}</span>
              </div>
            )}
            
            {/* Level Badge */}
            <div className="absolute -bottom-3 left-1/2 transform -translate-x-1/2">
              <div className="px-4 py-1.5 rounded-full bg-gradient-to-r from-[var(--color-cyber-blue)] to-[var(--color-neon-magenta)] text-white font-bold text-sm shadow-lg">
                Level {user.level}
              </div>
            </div>
          </div>

          {/* User Info */}
          <div className="flex-1 space-y-3">
            <div className="flex items-start justify-between">
              <div>
                <h1 className="text-3xl font-bold text-[var(--neumorphic-text)]">
                  {user.name}
                </h1>
                <p className="text-[var(--neumorphic-muted)] mt-1">
                  {user.email}
                </p>
              </div>
              
              {isOwnProfile && onEdit && (
                <Button
                  variant="outline"
                  onClick={onEdit}
                  className="flex items-center gap-2"
                >
                  <Edit className="h-4 w-4" />
                  Edit Profile
                </Button>
              )}
            </div>

            {/* Bio */}
            {user.bio && (
              <p className="text-[var(--neumorphic-text)] leading-relaxed">
                {user.bio}
              </p>
            )}

            {/* Meta Info */}
            <div className="flex flex-wrap gap-4 text-sm text-[var(--neumorphic-muted)]">
              {user.location && (
                <div className="flex items-center gap-1.5">
                  <MapPin className="h-4 w-4" />
                  <span>{user.location}</span>
                </div>
              )}
              <div className="flex items-center gap-1.5">
                <Calendar className="h-4 w-4" />
                <span>Joined {memberSince}</span>
              </div>
            </div>
          </div>
        </div>

        {/* XP Progress */}
        <div className="space-y-3 p-4 rounded-xl bg-gradient-to-r from-[var(--color-cyber-blue)]/10 to-[var(--color-neon-magenta)]/10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-[var(--color-cyber-blue)]" />
              <span className="font-semibold text-[var(--neumorphic-text)]">
                Level Progress
              </span>
            </div>
            <div className="text-right">
              <span className="text-2xl font-bold bg-gradient-to-r from-[var(--color-cyber-blue)] to-[var(--color-neon-magenta)] text-transparent bg-clip-text">
                {user.levelProgress}%
              </span>
            </div>
          </div>
          
          <Progress value={user.levelProgress} className="h-3" />
          
          <div className="flex items-center justify-between text-sm text-[var(--neumorphic-muted)]">
            <span>{user.xp.toLocaleString()} XP</span>
            <span>{user.xpProgress}/{user.xpNeeded} to Level {user.level + 1}</span>
          </div>
        </div>

        {/* Quick Stats */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-3 rounded-lg bg-[var(--neumorphic-bg)]">
              <div className="text-2xl font-bold text-[var(--neumorphic-text)]">
                {stats.contentWatched}
              </div>
              <div className="text-xs text-[var(--neumorphic-muted)] mt-1">
                Videos Watched
              </div>
            </div>
            
            <div className="text-center p-3 rounded-lg bg-[var(--neumorphic-bg)]">
              <div className="text-2xl font-bold text-[var(--neumorphic-text)]">
                {stats.workoutPlansCompleted}
              </div>
              <div className="text-xs text-[var(--neumorphic-muted)] mt-1">
                Workouts Done
              </div>
            </div>
            
            <div className="text-center p-3 rounded-lg bg-[var(--neumorphic-bg)]">
              <div className="text-2xl font-bold text-[var(--neumorphic-text)]">
                {stats.challengesCompleted}
              </div>
              <div className="text-xs text-[var(--neumorphic-muted)] mt-1">
                Challenges Won
              </div>
            </div>
            
            <div className="text-center p-3 rounded-lg bg-[var(--neumorphic-bg)]">
              <div className="text-2xl font-bold text-[var(--neumorphic-text)]">
                {stats.achievementsUnlocked}
              </div>
              <div className="text-xs text-[var(--neumorphic-muted)] mt-1">
                Achievements
              </div>
            </div>
          </div>
        )}
      </div>
    </NeumorphicCard>
  )
}





