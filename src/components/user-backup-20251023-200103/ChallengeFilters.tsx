'use client'

import { Trophy, Clock, CheckCircle2, Calendar } from 'lucide-react'

interface ChallengeFiltersProps {
  activeFilter: 'all' | 'active' | 'upcoming' | 'my-challenges'
  onFilterChange: (filter: 'all' | 'active' | 'upcoming' | 'my-challenges') => void
  counts?: {
    all: number
    active: number
    upcoming: number
    myChallenges: number
  }
}

export function ChallengeFilters({ activeFilter, onFilterChange, counts }: ChallengeFiltersProps) {
  const filters = [
    { 
      id: 'all' as const, 
      label: 'All Challenges', 
      icon: Trophy,
      count: counts?.all 
    },
    { 
      id: 'active' as const, 
      label: 'Active', 
      icon: Clock,
      count: counts?.active 
    },
    { 
      id: 'upcoming' as const, 
      label: 'Upcoming', 
      icon: Calendar,
      count: counts?.upcoming 
    },
    { 
      id: 'my-challenges' as const, 
      label: 'My Challenges', 
      icon: CheckCircle2,
      count: counts?.myChallenges 
    },
  ]

  return (
    <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
      {filters.map((filter) => {
        const Icon = filter.icon
        const isActive = activeFilter === filter.id
        
        return (
          <button
            key={filter.id}
            onClick={() => onFilterChange(filter.id)}
            className={`
              flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap
              transition-all duration-200
              ${isActive
                ? 'bg-gradient-to-r from-[var(--color-cyber-blue)] to-[var(--color-neon-magenta)] text-white shadow-[0_0_20px_rgba(0,230,255,0.3)]'
                : 'bg-[var(--neumorphic-surface)] text-[var(--neumorphic-text)] shadow-[4px_4px_8px_rgba(15,23,42,0.15),-4px_-4px_8px_rgba(255,255,255,0.85)] dark:shadow-[4px_4px_8px_rgba(0,0,0,0.6),-4px_-4px_8px_rgba(255,255,255,0.06)] hover:shadow-[inset_2px_2px_4px_rgba(15,23,42,0.1),inset_-2px_-2px_4px_rgba(255,255,255,0.8)] dark:hover:shadow-[inset_2px_2px_4px_rgba(0,0,0,0.5),inset_-2px_-2px_4px_rgba(255,255,255,0.05)]'
              }
            `}
          >
            <Icon className="h-4 w-4" />
            <span>{filter.label}</span>
            {filter.count !== undefined && (
              <span className={`
                ml-1 px-2 py-0.5 rounded-full text-xs font-bold
                ${isActive 
                  ? 'bg-white/20' 
                  : 'bg-gray-200 dark:bg-gray-700 text-[var(--neumorphic-muted)]'
                }
              `}>
                {filter.count}
              </span>
            )}
          </button>
        )
      })}
    </div>
  )
}

