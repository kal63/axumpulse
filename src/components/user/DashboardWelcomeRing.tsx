'use client'

import { Zap } from 'lucide-react'
import { cn } from '@/lib/utils'

type Props = {
  level: number
  currentXP: number
  /** XP in the current level toward next level (same meaning as API `xpProgress`) */
  xpInCurrentLevel: number
  /** Total XP required to complete this level (API `xpNeeded`) */
  xpForLevel: number
  className?: string
}

/**
 * Radiant / demo–style welcome ring: light grey track, lemon progress arc, level + XP label.
 * Optimized for **light** mode (Ethio lemon + ink); dark has a minimal fallback.
 */
export function DashboardWelcomeRing({
  level,
  currentXP,
  xpInCurrentLevel,
  xpForLevel,
  className,
}: Props) {
  const r = 42
  const c = 2 * Math.PI * r
  const denom = xpForLevel > 0 ? xpForLevel : 1
  const progress = Math.min(Math.max(xpInCurrentLevel / denom, 0), 1)
  const offset = c * (1 - progress)

  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center',
        className
      )}
    >
      <div className="relative size-24 shrink-0">
        <svg className="size-full -rotate-90" viewBox="0 0 100 100" aria-hidden>
          <circle
            cx="50"
            cy="50"
            r={r}
            stroke="hsl(0 0% 88%)"
            className="dark:stroke-slate-600"
            strokeWidth="8"
            fill="none"
          />
          <circle
            cx="50"
            cy="50"
            r={r}
            stroke="var(--ethio-lemon)"
            strokeWidth="8"
            fill="none"
            strokeDasharray={c}
            strokeDashoffset={offset}
            strokeLinecap="round"
            className="transition-[stroke-dashoffset] duration-500"
          />
        </svg>
        <div className="absolute inset-0 grid place-items-center text-center">
          <div className="font-landing-display text-3xl leading-none text-[hsl(222,47%,8%)] dark:text-slate-100">
            {level}
          </div>
        </div>
      </div>
      <div className="mt-1 flex items-center justify-center gap-1 text-[10px] text-muted-foreground sm:text-xs">
        <Zap className="size-3 text-[var(--ethio-lemon)]" aria-hidden />
        <span>{currentXP.toLocaleString()} XP</span>
      </div>
    </div>
  )
}
