'use client'

import { Trophy, Lock, Sparkles } from 'lucide-react'
import { NeumorphicCard } from './NeumorphicCard'

interface Achievement {
  id: number
  name: string
  description: string
  icon: string
  rarity: 'common' | 'rare' | 'epic' | 'legendary'
  xpReward: number
  unlocked: boolean
  unlockedAt: string | null
}

interface AchievementWallProps {
  achievements: Achievement[]
  totalUnlocked: number
  totalAchievements: number
}

export function AchievementWall({ achievements, totalUnlocked, totalAchievements }: AchievementWallProps) {
  const rarityColors = {
    common: 'from-gray-400 to-gray-600',
    rare: 'from-blue-400 to-blue-600',
    epic: 'from-purple-400 to-purple-600',
    legendary: 'from-yellow-400 to-orange-600',
  }

  const rarityGlow = {
    common: 'shadow-gray-500/30',
    rare: 'shadow-blue-500/50',
    epic: 'shadow-purple-500/50',
    legendary: 'shadow-yellow-500/70',
  }

  const progressPercentage = (totalUnlocked / totalAchievements) * 100

  return (
    <NeumorphicCard>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-[var(--neumorphic-text)] flex items-center gap-2">
              <Trophy className="h-6 w-6 text-[var(--color-neon-magenta)]" />
              Achievements
            </h2>
            <p className="text-sm text-[var(--neumorphic-muted)] mt-1">
              {totalUnlocked} of {totalAchievements} unlocked
            </p>
          </div>
          
          {/* Progress Circle */}
          <div className="relative w-20 h-20">
            <svg className="transform -rotate-90 w-20 h-20">
              <circle
                cx="40"
                cy="40"
                r="36"
                stroke="currentColor"
                strokeWidth="6"
                fill="none"
                className="text-gray-200 dark:text-gray-700"
              />
              <circle
                cx="40"
                cy="40"
                r="36"
                stroke="url(#gradient)"
                strokeWidth="6"
                fill="none"
                strokeDasharray={`${2 * Math.PI * 36}`}
                strokeDashoffset={`${2 * Math.PI * 36 * (1 - progressPercentage / 100)}`}
                className="transition-all duration-500"
                strokeLinecap="round"
              />
              <defs>
                <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="var(--color-cyber-blue)" />
                  <stop offset="100%" stopColor="var(--color-neon-magenta)" />
                </linearGradient>
              </defs>
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-sm font-bold text-[var(--neumorphic-text)]">
                {Math.round(progressPercentage)}%
              </span>
            </div>
          </div>
        </div>

        {/* Achievement Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {achievements.map((achievement) => (
            <div
              key={achievement.id}
              className={`
                relative p-4 rounded-xl transition-all duration-300
                ${achievement.unlocked
                  ? 'bg-[var(--neumorphic-surface)] shadow-[4px_4px_8px_rgba(15,23,42,0.15),-4px_-4px_8px_rgba(255,255,255,0.85)] dark:shadow-[4px_4px_8px_rgba(0,0,0,0.6),-4px_-4px_8px_rgba(255,255,255,0.06)] hover:shadow-[6px_6px_12px_rgba(15,23,42,0.2),-6px_-6px_12px_rgba(255,255,255,0.9)] cursor-pointer'
                  : 'bg-[var(--neumorphic-bg)] opacity-50'
                }
              `}
              title={achievement.description}
            >
              {/* Rarity Indicator */}
              {achievement.unlocked && (
                <div className="absolute -top-1 -right-1">
                  <div className={`
                    w-6 h-6 rounded-full bg-gradient-to-br ${rarityColors[achievement.rarity]} 
                    flex items-center justify-center shadow-lg ${rarityGlow[achievement.rarity]}
                  `}>
                    {achievement.rarity === 'legendary' && (
                      <Sparkles className="h-3 w-3 text-white" />
                    )}
                  </div>
                </div>
              )}

              {/* Icon */}
              <div className="flex justify-center mb-3">
                {achievement.unlocked ? (
                  <div className={`
                    text-5xl
                    ${achievement.rarity === 'legendary' ? 'animate-pulse' : ''}
                  `}>
                    {achievement.icon}
                  </div>
                ) : (
                  <div className="w-16 h-16 rounded-full bg-gray-300 dark:bg-gray-700 flex items-center justify-center">
                    <Lock className="h-8 w-8 text-gray-500 dark:text-gray-600" />
                  </div>
                )}
              </div>

              {/* Name */}
              <h3 className={`
                text-center text-sm font-semibold mb-1 line-clamp-2
                ${achievement.unlocked 
                  ? 'text-[var(--neumorphic-text)]' 
                  : 'text-[var(--neumorphic-muted)]'
                }
              `}>
                {achievement.unlocked ? achievement.name : '???'}
              </h3>

              {/* XP Reward */}
              {achievement.unlocked && (
                <p className="text-center text-xs text-[var(--color-cyber-blue)] font-medium">
                  +{achievement.xpReward} XP
                </p>
              )}

              {/* Unlock Date */}
              {achievement.unlocked && achievement.unlockedAt && (
                <p className="text-center text-xs text-[var(--neumorphic-muted)] mt-1">
                  {new Date(achievement.unlockedAt).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric'
                  })}
                </p>
              )}
            </div>
          ))}
        </div>

        {/* Empty State */}
        {achievements.length === 0 && (
          <div className="py-12 text-center text-[var(--neumorphic-muted)]">
            <Trophy className="h-16 w-16 mx-auto mb-4 opacity-30" />
            <p className="text-lg font-medium">No achievements yet</p>
            <p className="text-sm mt-2">Complete activities to unlock achievements!</p>
          </div>
        )}

        {/* Rarity Legend */}
        {achievements.some(a => a.unlocked) && (
          <div className="flex flex-wrap gap-4 justify-center pt-4 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full bg-gradient-to-br ${rarityColors.common}`} />
              <span className="text-xs text-[var(--neumorphic-muted)]">Common</span>
            </div>
            <div className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full bg-gradient-to-br ${rarityColors.rare}`} />
              <span className="text-xs text-[var(--neumorphic-muted)]">Rare</span>
            </div>
            <div className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full bg-gradient-to-br ${rarityColors.epic}`} />
              <span className="text-xs text-[var(--neumorphic-muted)]">Epic</span>
            </div>
            <div className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full bg-gradient-to-br ${rarityColors.legendary}`} />
              <span className="text-xs text-[var(--neumorphic-muted)]">Legendary</span>
            </div>
          </div>
        )}
      </div>
    </NeumorphicCard>
  )
}

