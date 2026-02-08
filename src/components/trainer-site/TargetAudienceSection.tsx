'use client'

import React from 'react'
import { PublicTrainerDetail } from '@/lib/api-client'

interface TargetAudienceSectionProps {
  trainer: PublicTrainerDetail
}

export function TargetAudienceSection({ trainer }: TargetAudienceSectionProps) {
  const targetAudience = trainer.site?.targetAudience

  if (!targetAudience) {
    return null
  }

  return (
    <section className="py-16 bg-white dark:bg-slate-800">
      <div className="container mx-auto px-4 max-w-4xl">
        <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-8 text-center">
          Who I Work With
        </h2>
        <div className="prose prose-lg dark:prose-invert max-w-none">
          <p className="text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-line">
            {targetAudience}
          </p>
        </div>
      </div>
    </section>
  )
}

