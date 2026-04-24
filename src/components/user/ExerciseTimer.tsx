'use client'

import { useEffect, useState } from 'react'
import { Timer } from 'lucide-react'

interface ExerciseTimerProps {
  duration: number // in seconds
  startedAt: string | Date | null // ISO string or Date
  onThresholdReached?: () => void
  className?: string
}

export function ExerciseTimer({ 
  duration, 
  startedAt, 
  onThresholdReached,
  className = '' 
}: ExerciseTimerProps) {
  const [remainingSeconds, setRemainingSeconds] = useState(0)
  const [progress, setProgress] = useState(0)
  const [thresholdReached, setThresholdReached] = useState(false)

  useEffect(() => {
    if (!startedAt || duration <= 0) {
      setRemainingSeconds(0)
      setProgress(0)
      return
    }

    const calculateRemaining = () => {
      const startTime = new Date(startedAt).getTime()
      const now = Date.now()
      const elapsedSeconds = Math.floor((now - startTime) / 1000)
      const remaining = Math.max(0, duration - elapsedSeconds)
      
      setRemainingSeconds(remaining)
      const progressPercent = Math.min(100, (elapsedSeconds / duration) * 100)
      setProgress(progressPercent)

      // Check if 80% threshold is reached
      if (progressPercent >= 80 && !thresholdReached) {
        setThresholdReached(true)
        onThresholdReached?.()
      }
    }

    // Calculate immediately
    calculateRemaining()

    // Update every second
    const interval = setInterval(calculateRemaining, 1000)

    return () => clearInterval(interval)
  }, [startedAt, duration, thresholdReached, onThresholdReached])

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${String(secs).padStart(2, '0')}`
  }

  const circumference = 2 * Math.PI * 36 // radius 36 (adjusted to fit in viewBox)
  const strokeDashoffset = circumference - (progress / 100) * circumference

  if (!startedAt || duration <= 0) {
    return null
  }

  return (
    <div className={`flex items-center gap-3 w-full md:w-auto ${className}`}>
      {/* Timer Circle */}
      <div className="relative w-20 h-20 flex items-center justify-center overflow-visible">
        <svg 
          className="transform -rotate-90 absolute inset-0" 
          width="80" 
          height="80" 
          viewBox="0 0 80 80"
        >
          {/* Background circle */}
          <circle
            cx="40"
            cy="40"
            r="36"
            fill="none"
            stroke="currentColor"
            strokeWidth="4"
            className="text-gray-200 dark:text-gray-700"
          />
          {/* Progress circle */}
          <circle
            cx="40"
            cy="40"
            r="36"
            fill="none"
            stroke={thresholdReached ? "url(#timerGradient)" : "currentColor"}
            strokeWidth="4"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            className={`transition-all duration-300 ${
              thresholdReached 
                ? 'text-green-500' 
                : progress >= 50 
                ? 'text-yellow-500' 
                : 'text-cyan-500'
            }`}
          />
          <defs>
            <linearGradient id="timerGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#10b981" />
              <stop offset="100%" stopColor="#059669" />
            </linearGradient>
          </defs>
        </svg>
        {/* Center text */}
        <div className="absolute inset-0 flex items-center justify-center z-10">
          <Timer className={`w-5 h-5 ${
            thresholdReached 
              ? 'text-green-500' 
              : progress >= 50 
              ? 'text-yellow-500' 
              : 'text-cyan-500'
          }`} />
        </div>
      </div>
      
      {/* Time Display */}
      <div className="flex flex-col">
        <div className={`text-lg font-bold ${
          thresholdReached 
            ? 'text-green-500' 
            : progress >= 50 
            ? 'text-yellow-500' 
            : 'user-app-ink'
        }`}>
          {formatTime(remainingSeconds)}
        </div>
        <div className="text-xs user-app-muted">
          {thresholdReached ? 'Ready to complete' : 'remaining'}
        </div>
      </div>
    </div>
  )
}

