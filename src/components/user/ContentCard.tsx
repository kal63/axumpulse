import { Play, Heart, Clock, TrendingUp, Eye, Star, Zap, Award } from 'lucide-react'
import { NeumorphicCard } from './NeumorphicCard'
import { cn } from '@/lib/utils'
import { getImageUrl } from '@/lib/upload-utils'
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
            case 'beginner': return 'from-green-500 to-emerald-600'
            case 'intermediate': return 'from-yellow-500 to-orange-600'
            case 'advanced': return 'from-red-500 to-pink-600'
            default: return 'from-gray-500 to-gray-600'
        }
    }

    const formatDuration = (seconds?: number) => {
        if (!seconds) return 'N/A'
        const minutes = Math.floor(seconds / 60)
        return `${minutes}min`
    }

    return (
        <NeumorphicCard 
            variant="raised" 
            size="md" 
            className="group cursor-pointer hover:scale-105 transition-all duration-300 overflow-hidden"
            onClick={onClick}
        >
            {/* Thumbnail */}
            <div className="relative aspect-video bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-800 overflow-hidden rounded-lg mb-4">
                {content.thumbnailUrl ? (
                    <>
                        <img
                            src={getImageUrl(content.thumbnailUrl)}
                            alt={content.title}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500 filter brightness-90 contrast-110 saturate-90"
                        />
                        {/* Subtle overlay for consistency */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-60" />
                    </>
                ) : (
                    <div className="w-full h-full flex items-center justify-center">
                        <div className="relative">
                            <Play className="h-16 w-16 text-gray-400 group-hover:text-cyan-500 transition-colors duration-300" />
                            <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/20 to-purple-600/20 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                        </div>
                    </div>
                )}
                
                {/* Play Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center">
                    <div className="bg-white/90 backdrop-blur-sm rounded-full p-4 transform scale-0 group-hover:scale-100 transition-transform duration-300">
                        <Play className="h-8 w-8 text-gray-800 fill-current" />
                    </div>
                </div>

                {/* Duration Badge */}
                {content.duration && (
                    <div className="absolute top-3 right-3 bg-black/90 backdrop-blur-sm text-white px-3 py-1 rounded-full text-xs font-medium flex items-center space-x-1 shadow-lg">
                        <Clock className="w-3 h-3" />
                        <span>{formatDuration(content.duration)}</span>
                    </div>
                )}

                {/* Difficulty Badge */}
                {content.difficulty && (
                    <div className={`absolute top-3 left-3 bg-gradient-to-r ${getDifficultyColor(content.difficulty)} text-white px-3 py-1 rounded-full text-xs font-medium shadow-lg backdrop-blur-sm`}>
                        {content.difficulty}
                    </div>
                )}
            </div>

            {/* Content */}
            <div className="space-y-3">
                {/* Title */}
                <h3 className="font-bold text-lg text-[var(--neumorphic-text)] line-clamp-2 group-hover:text-cyan-600 transition-colors duration-300">
                    {content.title}
                </h3>
                
                {/* Trainer Name */}
                {content.trainer && (
                    <div className="flex items-center space-x-2">
                        <div className="w-6 h-6 bg-gradient-to-r from-cyan-500 to-purple-600 rounded-full flex items-center justify-center">
                            <span className="text-white text-xs font-bold">
                                {content.trainer.User?.name?.charAt(0) || 'T'}
                            </span>
                        </div>
                        <span className="text-sm text-[var(--neumorphic-muted)] font-medium">
                            {content.trainer.User?.name || 'Unknown Trainer'}
                        </span>
                        {content.trainer.verified && (
                            <Award className="w-4 h-4 text-yellow-500" />
                        )}
                    </div>
                )}

                {/* Stats */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4 text-sm text-[var(--neumorphic-muted)]">
                        <div className="flex items-center space-x-1">
                            <Eye className="w-4 h-4" />
                            <span>{content.views || 0}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                            <Heart className="w-4 h-4" />
                            <span>{content.likes || 0}</span>
                        </div>
                    </div>
                    
                    {/* Rating */}
                    <div className="flex items-center space-x-1">
                        <Star className="w-4 h-4 text-yellow-500 fill-current" />
                        <span className="text-sm font-medium text-[var(--neumorphic-text)]">4.8</span>
                    </div>
                </div>

                {/* Category Tags */}
                {content.tags && content.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                        {content.tags.slice(0, 2).map((tag, index) => (
                            <span 
                                key={index}
                                className="px-2 py-1 bg-[var(--neumorphic-surface)] text-[var(--neumorphic-muted)] text-xs rounded-full"
                            >
                                {tag}
                            </span>
                        ))}
                        {content.tags.length > 2 && (
                            <span className="px-2 py-1 bg-[var(--neumorphic-surface)] text-[var(--neumorphic-muted)] text-xs rounded-full">
                                +{content.tags.length - 2}
                            </span>
                        )}
                    </div>
                )}

                {/* XP Reward - Subtle bottom section */}
                {showXP && (
                    <div className="pt-3 border-t border-gray-200/50 dark:border-gray-700/50">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-1 text-sm text-[var(--neumorphic-muted)]">
                                <Zap className="w-4 h-4 text-cyan-500" />
                                <span>Earn {xpAmount} XP</span>
                            </div>
                            <div className="text-xs text-[var(--neumorphic-muted)]">
                                Click to start
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </NeumorphicCard>
    )
}