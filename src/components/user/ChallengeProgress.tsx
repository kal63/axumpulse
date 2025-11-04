'use client'

import { useState } from 'react'
import { Target, TrendingUp, Calendar, Plus, Minus } from 'lucide-react'
import { NeumorphicCard } from './NeumorphicCard'
import { Progress } from '@/components/ui/progress'

interface ChallengeProgressProps {
  challengeId: number
  currentProgress: number
  goalValue: number
  goalType: string
  onProgressUpdate: (newProgress: number) => Promise<void>
  isUpdating?: boolean
}

export function ChallengeProgress({
  challengeId,
  currentProgress,
  goalValue,
  goalType,
  onProgressUpdate,
  isUpdating = false
}: ChallengeProgressProps) {
  const [increment, setIncrement] = useState(1)
  const [customValue, setCustomValue] = useState('')
  const progressPercentage = (currentProgress / goalValue) * 100

  const handleQuickAdd = async (amount: number) => {
    const newProgress = Math.min(currentProgress + amount, goalValue)
    await onProgressUpdate(newProgress)
  }

  const handleCustomUpdate = async () => {
    const value = parseInt(customValue)
    if (!isNaN(value) && value >= 0 && value <= goalValue) {
      await onProgressUpdate(value)
      setCustomValue('')
    }
  }

  const quickIncrements = [1, 5, 10, 25]

  return (
    <NeumorphicCard>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-[var(--neumorphic-text)] flex items-center gap-2">
            <Target className="h-5 w-5 text-[var(--color-cyber-blue)]" />
            Track Your Progress
          </h3>
          <div className="text-right">
            <p className="text-2xl font-bold text-[var(--color-cyber-blue)]">
              {currentProgress}
              <span className="text-sm text-[var(--neumorphic-muted)]">/{goalValue}</span>
            </p>
            <p className="text-xs text-[var(--neumorphic-muted)]">{goalType}</p>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="space-y-2">
          <Progress value={progressPercentage} className="h-3" />
          <div className="flex items-center justify-between text-xs text-[var(--neumorphic-muted)]">
            <span>{progressPercentage.toFixed(1)}% Complete</span>
            <span>{goalValue - currentProgress} remaining</span>
          </div>
        </div>

        {/* Quick Add Buttons */}
        <div className="space-y-3">
          <p className="text-sm font-medium text-[var(--neumorphic-text)]">Quick Add</p>
          <div className="grid grid-cols-4 gap-2">
            {quickIncrements.map((amount) => (
              <button
                key={amount}
                onClick={() => handleQuickAdd(amount)}
                disabled={isUpdating || currentProgress >= goalValue}
                className="
                  flex flex-col items-center justify-center p-3 rounded-lg
                  bg-[var(--neumorphic-surface)] 
                  shadow-[4px_4px_8px_rgba(15,23,42,0.15),-4px_-4px_8px_rgba(255,255,255,0.85)] 
                  dark:shadow-[4px_4px_8px_rgba(0,0,0,0.6),-4px_-4px_8px_rgba(255,255,255,0.06)]
                  hover:shadow-[inset_2px_2px_4px_rgba(15,23,42,0.1),inset_-2px_-2px_4px_rgba(255,255,255,0.8)]
                  dark:hover:shadow-[inset_2px_2px_4px_rgba(0,0,0,0.5),inset_-2px_-2px_4px_rgba(255,255,255,0.05)]
                  active:shadow-[inset_3px_3px_6px_rgba(15,23,42,0.15),inset_-3px_-3px_6px_rgba(255,255,255,0.7)]
                  dark:active:shadow-[inset_3px_3px_6px_rgba(0,0,0,0.6),inset_-3px_-3px_6px_rgba(255,255,255,0.04)]
                  disabled:opacity-50 disabled:cursor-not-allowed
                  transition-all duration-150
                "
              >
                <Plus className="h-4 w-4 text-[var(--color-lime-pulse)] mb-1" />
                <span className="text-sm font-bold text-[var(--neumorphic-text)]">{amount}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Custom Value Input */}
        <div className="space-y-3">
          <p className="text-sm font-medium text-[var(--neumorphic-text)]">Set Custom Value</p>
          <div className="flex gap-2">
            <input
              type="number"
              min="0"
              max={goalValue}
              value={customValue}
              onChange={(e) => setCustomValue(e.target.value)}
              placeholder={`Enter 0-${goalValue}`}
              disabled={isUpdating}
              className="
                flex-1 px-4 py-2 rounded-lg text-sm
                bg-[var(--neumorphic-surface)] 
                text-[var(--neumorphic-text)]
                border-none
                shadow-[inset_4px_4px_8px_rgba(15,23,42,0.12),inset_-4px_-4px_8px_rgba(255,255,255,0.9)]
                dark:shadow-[inset_4px_4px_8px_rgba(0,0,0,0.65),inset_-4px_-4px_8px_rgba(255,255,255,0.05)]
                focus:outline-none focus:ring-2 focus:ring-[var(--color-cyber-blue)]/50
                disabled:opacity-50
              "
            />
            <button
              onClick={handleCustomUpdate}
              disabled={isUpdating || !customValue}
              className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl font-medium transition-all duration-200 px-6 py-2 bg-gradient-to-r from-cyan-500 to-purple-600 text-white shadow-lg hover:from-cyan-600 hover:to-purple-700 disabled:pointer-events-none disabled:opacity-50"
            >
              {isUpdating ? 'Updating...' : 'Update'}
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[var(--color-cyber-blue)] to-[var(--color-neon-magenta)] flex items-center justify-center">
              <TrendingUp className="h-5 w-5 text-white" />
            </div>
            <div>
              <p className="text-xs text-[var(--neumorphic-muted)]">Daily Avg</p>
              <p className="text-sm font-bold text-[var(--neumorphic-text)]">
                {(currentProgress / 7).toFixed(1)}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[var(--color-lime-pulse)] to-[var(--color-amber-warning)] flex items-center justify-center">
              <Calendar className="h-5 w-5 text-white" />
            </div>
            <div>
              <p className="text-xs text-[var(--neumorphic-muted)]">Days Active</p>
              <p className="text-sm font-bold text-[var(--neumorphic-text)]">7</p>
            </div>
          </div>
        </div>
      </div>
    </NeumorphicCard>
  )
}





