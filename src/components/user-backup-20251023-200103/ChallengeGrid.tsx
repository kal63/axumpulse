'use client'

import { ChallengeCard } from './ChallengeCard'

interface ChallengeGridProps {
  challenges: any[]
  showProgress?: boolean
}

export function ChallengeGrid({ challenges, showProgress = true }: ChallengeGridProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {challenges.map((challenge) => (
        <ChallengeCard 
          key={challenge.id} 
          challenge={challenge}
          showProgress={showProgress}
        />
      ))}
    </div>
  )
}

