'use client'

import React from 'react'
import { PublicTrainerDetail } from '@/lib/api-client'

interface PhilosophySectionProps {
  trainer: PublicTrainerDetail
}

export function PhilosophySection({ trainer }: PhilosophySectionProps) {
  const philosophy = trainer.site?.philosophy

  if (!philosophy) {
    return null
  }

  return (
    <section className="py-16 bg-slate-50 dark:bg-slate-900">
      <div className="container mx-auto px-4 max-w-4xl">
        <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-8 text-center">
          Training Philosophy
        </h2>
        <div className="prose prose-lg dark:prose-invert max-w-none">
          <p className="text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-line">
            {philosophy}
          </p>
        </div>
      </div>
    </section>
  )
}

