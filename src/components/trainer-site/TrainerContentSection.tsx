'use client'

import React from 'react'
import { PublicTrainerDetail, TrainerSiteContent } from '@/lib/api-client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ExternalLink, FileText, Video, Image as ImageIcon, Film } from 'lucide-react'

interface TrainerContentSectionProps {
  trainer: PublicTrainerDetail
}

const contentTypeIcons = {
  article: FileText,
  video: Video,
  post: ImageIcon,
  reel: Film,
}

const contentTypeColors = {
  article: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
  video: 'bg-red-500/20 text-red-300 border-red-500/30',
  post: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
  reel: 'bg-pink-500/20 text-pink-300 border-pink-500/30',
}

export function TrainerContentSection({ trainer }: TrainerContentSectionProps) {
  const trainerContent = trainer.site?.trainerContent || []

  if (trainerContent.length === 0) {
    return null
  }

  // Sort by order
  const sortedContent = [...trainerContent].sort((a, b) => (a.order || 0) - (b.order || 0))

  return (
    <section className="py-16 bg-white dark:bg-slate-800">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-8 text-center">
          My Content
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sortedContent.map((content) => {
            const Icon = contentTypeIcons[content.type] || FileText
            const colorClass = contentTypeColors[content.type] || contentTypeColors.article

            return (
              <Card
                key={content.id}
                className="bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700 hover:shadow-lg transition-shadow"
              >
                <CardHeader>
                  <div className="flex items-start justify-between mb-2">
                    <Badge className={colorClass}>
                      <Icon className="w-3 h-3 mr-1" />
                      {content.type.charAt(0).toUpperCase() + content.type.slice(1)}
                    </Badge>
                  </div>
                  <CardTitle className="text-xl text-slate-900 dark:text-white">
                    {content.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {content.description && (
                    <CardDescription className="text-slate-600 dark:text-slate-400 mb-4">
                      {content.description}
                    </CardDescription>
                  )}
                  <a
                    href={content.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300 font-medium"
                  >
                    View Content
                    <ExternalLink className="w-4 h-4 ml-2" />
                  </a>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>
    </section>
  )
}

