import { Play, Heart, Clock, TrendingUp } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import type { ContentItem } from '@/lib/api-client'

interface ContentCardProps {
    content: ContentItem
    onClick?: () => void
    showXP?: boolean
    xpAmount?: number
}

export function ContentCard({ content, onClick, showXP = true, xpAmount = 50 }: ContentCardProps) {
    const getDifficultyColor = (difficulty?: string) => {
        switch (difficulty) {
            case 'beginner': return 'bg-green-500/20 text-green-400'
            case 'intermediate': return 'bg-yellow-500/20 text-yellow-400'
            case 'advanced': return 'bg-red-500/20 text-red-400'
            default: return 'bg-gray-500/20 text-gray-400'
        }
    }

    const formatDuration = (seconds?: number) => {
        if (!seconds) return 'N/A'
        const minutes = Math.floor(seconds / 60)
        return `${minutes}min`
    }

    return (
        <Card
            className="group cursor-pointer hover:shadow-2xl transition-all duration-300 overflow-hidden border-gray-200 dark:border-gray-700"
            onClick={onClick}
        >
            {/* Thumbnail */}
            <div className="relative aspect-video bg-gray-100 dark:bg-gray-800 overflow-hidden">
                {content.thumbnailUrl ? (
                    <img
                        src={`${process.env.NEXT_PUBLIC_API_URL}${content.thumbnailUrl}`}
                        alt={content.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center">
                        <Play className="h-16 w-16 text-gray-400" />
                    </div>
                )}
                
                {/* Play Overlay */}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                    <div className="bg-white rounded-full p-4">
                        <Play className="h-8 w-8 text-black fill-black" />
                    </div>
                </div>

                {/* Duration Badge */}
                {content.duration && (
                    <Badge className="absolute bottom-2 right-2 bg-black/80 text-white">
                        <Clock className="h-3 w-3 mr-1" />
                        {formatDuration(content.duration)}
                    </Badge>
                )}

                {/* Completed Badge */}
                {(content as any).userProgress?.[0]?.completed && (
                    <Badge className="absolute top-2 right-2 bg-green-500/90 text-white">
                        ✓ Completed
                    </Badge>
                )}
            </div>

            {/* Content Info */}
            <CardContent className="p-4 space-y-2">
                <h3 className="font-semibold text-lg line-clamp-2 text-gray-900 dark:text-text-dark">
                    {content.title}
                </h3>
                
                {/* Trainer Name */}
                {content.trainer && (
                    <p className="text-sm text-gray-600 dark:text-muted-dark">
                        {(content.trainer as any).User?.name || 'Unknown Trainer'}
                    </p>
                )}

                {/* Difficulty Badge */}
                {content.difficulty && (
                    <Badge className={getDifficultyColor(content.difficulty)}>
                        {content.difficulty}
                    </Badge>
                )}

                {/* Stats */}
                <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                    <div className="flex items-center gap-1">
                        <TrendingUp className="h-4 w-4" />
                        {content.views || 0}
                    </div>
                    <div className="flex items-center gap-1">
                        <Heart className="h-4 w-4" />
                        {content.likes || 0}
                    </div>
                </div>

                {/* XP Reward */}
                {showXP && (
                    <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
                        <Badge className="bg-gradient-to-r from-cyan-500 to-blue-500 text-white">
                            +{xpAmount} XP
                        </Badge>
                    </div>
                )}
            </CardContent>
        </Card>
    )
}


