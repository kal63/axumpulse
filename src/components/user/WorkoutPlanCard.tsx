import { Dumbbell, Clock, TrendingUp, PlayCircle, Star, Zap, Target, Users, Heart, Leaf, Bike, Shield, Flame, Activity, CheckCircle } from 'lucide-react'
import { NeumorphicCard } from './NeumorphicCard'
import { FeaturedBadge } from './FeaturedBadge'
import type { WorkoutPlan } from '@/lib/api-client'

interface WorkoutPlanCardProps {
    workoutPlan: WorkoutPlan
    onClick?: () => void
    showProgress?: boolean
    userProgress?: {
        status: string
        completedExercises: number
        totalExercises: number
    }
}

export function WorkoutPlanCard({ 
    workoutPlan, 
    onClick, 
    showProgress = false,
    userProgress 
}: WorkoutPlanCardProps) {
    const getDifficultyColor = (difficulty?: string) => {
        switch (difficulty) {
            case 'beginner': return 'border-green-500/50 text-green-600'
            case 'intermediate': return 'border-yellow-500/50 text-yellow-600'
            case 'advanced': return 'border-red-500/50 text-red-600'
            default: return 'border-gray-500/50 text-gray-600'
        }
    }

    const getStatusColor = (status?: string) => {
        switch (status) {
            case 'active': return 'border-blue-500/50 text-blue-600'
            case 'completed': return 'border-green-500/50 text-green-600'
            case 'paused': return 'border-yellow-500/50 text-yellow-600'
            default: return 'border-gray-500/50 text-gray-600'
        }
    }

    const getCategoryIcon = (category?: string) => {
        switch (category?.toLowerCase()) {
            case 'strength': return Dumbbell
            case 'cardio': return Heart
            case 'yoga': return Leaf
            case 'cycling': return Bike
            case 'martial_arts': return Shield
            case 'hiit': return Flame
            case 'pilates': return Activity
            case 'flexibility': return Leaf
            case 'endurance': return Heart
            case 'rehabilitation': return Shield
            default: return Dumbbell
        }
    }

    const getCategoryGradient = (category?: string) => {
        switch (category?.toLowerCase()) {
            case 'strength': return 'from-orange-500 to-red-600'
            case 'cardio': return 'from-red-500 to-pink-600'
            case 'yoga': return 'from-green-500 to-emerald-600'
            case 'cycling': return 'from-blue-500 to-cyan-600'
            case 'martial_arts': return 'from-purple-500 to-indigo-600'
            case 'hiit': return 'from-orange-500 to-yellow-600'
            case 'pilates': return 'from-teal-500 to-cyan-600'
            case 'flexibility': return 'from-green-500 to-teal-600'
            case 'endurance': return 'from-red-500 to-orange-600'
            case 'rehabilitation': return 'from-blue-500 to-purple-600'
            default: return 'from-cyan-500 to-purple-600'
        }
    }

    const progressPercentage = userProgress 
        ? Math.round((userProgress.completedExercises / userProgress.totalExercises) * 100)
        : 0

    const estimatedXP = (workoutPlan.totalExercises || 0) * 25 + 100 // 25 XP per exercise + 100 bonus

    const CategoryIcon = getCategoryIcon(workoutPlan.category)
    const categoryGradient = getCategoryGradient(workoutPlan.category)

    return (
        <NeumorphicCard 
            variant="raised" 
            className="group cursor-pointer hover:scale-105 transition-all duration-300 overflow-hidden relative"
            onClick={onClick}
        >
            {/* Featured Badge */}
            {(workoutPlan as any).isFeatured && (
                <div className="absolute bottom-4 right-4 z-10">
                    <FeaturedBadge size="sm" />
                </div>
            )}
            
            <div className="p-6 space-y-4">
                {/* Header */}
                <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4 flex-1">
                        <div className={`w-12 h-12 bg-gradient-to-br ${categoryGradient} rounded-xl flex items-center justify-center shadow-lg relative`}>
                            <CategoryIcon className="h-6 w-6 text-white" />
                            {/* Completed Badge */}
                            {userProgress?.status === 'completed' && (
                                <div className="absolute -top-1 -right-1 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center border-2 border-white shadow-lg">
                                    <CheckCircle className="h-4 w-4 text-white" />
                                </div>
                            )}
                        </div>
                        <div className="flex-1">
                            <div className="flex items-center gap-2">
                                <h3 className="font-bold text-xl text-[var(--neumorphic-text)] group-hover:text-[var(--neumorphic-accent)] transition-colors line-clamp-2">
                                    {workoutPlan.title}
                                </h3>
                                {/* Joined indicator */}
                                {userProgress && !showProgress && (
                                    <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800">
                                        Joined
                                    </span>
                                )}
                            </div>
                            {workoutPlan.trainer && (
                                <p className="text-sm text-[var(--neumorphic-muted)] mt-1">
                                    by {(workoutPlan.trainer as any).User?.name || 'Unknown Trainer'}
                                </p>
                            )}
                        </div>
                    </div>
                    
                    {/* Rating */}
                    <div className="flex items-center space-x-1 text-yellow-500">
                        <Star className="w-4 h-4 fill-current" />
                        <span className="text-sm font-semibold">4.8</span>
                    </div>
                </div>

                {/* Description */}
                {workoutPlan.description && (
                    <p className="text-sm text-[var(--neumorphic-muted)] line-clamp-2">
                        {workoutPlan.description}
                    </p>
                )}

                {/* Meta Info */}
                <div className="flex flex-wrap items-center gap-3 text-sm">
                    {workoutPlan.difficulty && (
                        <span className={`px-3 py-1 rounded-full ${getDifficultyColor(workoutPlan.difficulty)} bg-[var(--neumorphic-bg)]`}>
                            {workoutPlan.difficulty}
                        </span>
                    )}
                    {workoutPlan.category && (
                        <span className="px-3 py-1 rounded-full text-[var(--neumorphic-text)] bg-[var(--neumorphic-bg)] capitalize">
                            {workoutPlan.category}
                        </span>
                    )}
                    {workoutPlan.estimatedDuration && (
                        <div className="flex items-center gap-1 text-[var(--neumorphic-muted)]">
                            <Clock className="h-4 w-4" />
                            <span>{workoutPlan.estimatedDuration}min</span>
                        </div>
                    )}
                    {workoutPlan.totalExercises && (
                        <div className="flex items-center gap-1 text-[var(--neumorphic-muted)]">
                            <Target className="h-4 w-4" />
                            <span>{workoutPlan.totalExercises} exercises</span>
                        </div>
                    )}
                </div>

                {/* Progress Section */}
                {showProgress && userProgress && (
                    <div className="space-y-3 pt-4">
                        <div className="flex items-center justify-between text-sm">
                            <span className="text-[var(--neumorphic-muted)]">Progress</span>
                            <span className="font-semibold text-[var(--neumorphic-text)]">
                                {userProgress.completedExercises}/{userProgress.totalExercises} completed
                            </span>
                        </div>
                        
                        {/* Custom Progress Bar */}
                        <div className="w-full bg-[var(--neumorphic-bg)] rounded-full h-2">
                            <div 
                                className="bg-gradient-to-r from-cyan-500 to-purple-600 h-2 rounded-full transition-all duration-300"
                                style={{ width: `${progressPercentage}%` }}
                            />
                        </div>
                        
                        <div className="flex items-center justify-between">
                            <span className={`px-3 py-1 rounded-full ${getStatusColor(userProgress.status)} bg-[var(--neumorphic-bg)] text-sm font-medium`}>
                                {userProgress.status}
                            </span>
                            <span className="text-sm font-semibold text-[var(--neumorphic-accent)]">
                                {progressPercentage}%
                            </span>
                        </div>
                    </div>
                )}

                {/* Footer: XP and Action */}
                <div className="flex items-center justify-between pt-4">
                    <div className="flex items-center space-x-1 text-[var(--neumorphic-accent)]">
                        <Zap className="h-4 w-4" />
                        <span className="text-sm font-semibold">+{estimatedXP} XP</span>
                    </div>
                    
                    {userProgress ? (
                        <button 
                            className={`flex items-center space-x-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 transform hover:scale-105 shadow-lg ${
                                userProgress.status === 'completed'
                                    ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white hover:from-green-600 hover:to-emerald-700'
                                    : 'bg-gradient-to-r from-cyan-500 to-purple-600 text-white hover:from-cyan-600 hover:to-purple-700'
                            }`}
                            onClick={(e) => {
                                e.stopPropagation()
                                onClick?.()
                            }}
                        >
                            {userProgress.status === 'completed' ? (
                                <>
                                    <CheckCircle className="h-4 w-4" />
                                    <span>Completed</span>
                                </>
                            ) : (
                                <>
                                    <PlayCircle className="h-4 w-4" />
                                    <span>Continue</span>
                                </>
                            )}
                        </button>
                    ) : (
                        <button 
                            className="flex items-center space-x-2 px-4 py-2 bg-[var(--neumorphic-surface)] text-[var(--neumorphic-text)] rounded-full text-sm font-medium hover:bg-[var(--neumorphic-hover)] transition-all duration-200 transform hover:scale-105"
                            onClick={(e) => {
                                e.stopPropagation()
                                onClick?.()
                            }}
                        >
                            <span>View Details</span>
                        </button>
                    )}
                </div>
            </div>
        </NeumorphicCard>
    )
}


