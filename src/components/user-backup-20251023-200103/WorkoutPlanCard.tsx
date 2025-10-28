import { Dumbbell, Clock, TrendingUp, PlayCircle } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
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
            case 'beginner': return 'bg-green-500/20 text-green-400 border-green-500/30'
            case 'intermediate': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
            case 'advanced': return 'bg-red-500/20 text-red-400 border-red-500/30'
            default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30'
        }
    }

    const getStatusColor = (status?: string) => {
        switch (status) {
            case 'active': return 'bg-blue-500/20 text-blue-400 border-blue-500/30'
            case 'completed': return 'bg-green-500/20 text-green-400 border-green-500/30'
            case 'paused': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
            default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30'
        }
    }

    const progressPercentage = userProgress 
        ? Math.round((userProgress.completedExercises / userProgress.totalExercises) * 100)
        : 0

    const estimatedXP = (workoutPlan.totalExercises || 0) * 25 + 100 // 25 XP per exercise + 100 bonus

    return (
        <Card
            className="group cursor-pointer hover:shadow-2xl transition-all duration-300 overflow-hidden border-gray-200 dark:border-gray-700"
            onClick={onClick}
        >
            <CardContent className="p-6 space-y-4">
                {/* Header */}
                <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3 flex-1">
                        <div className="p-3 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-lg">
                            <Dumbbell className="h-6 w-6 text-white" />
                        </div>
                        <div className="flex-1">
                            <h3 className="font-bold text-xl text-gray-900 dark:text-text-dark group-hover:text-cyan-500 transition-colors line-clamp-2">
                                {workoutPlan.title}
                            </h3>
                            {workoutPlan.trainer && (
                                <p className="text-sm text-gray-600 dark:text-muted-dark mt-1">
                                    by {(workoutPlan.trainer as any).User?.name || 'Unknown Trainer'}
                                </p>
                            )}
                        </div>
                    </div>
                </div>

                {/* Description */}
                {workoutPlan.description && (
                    <p className="text-sm text-gray-600 dark:text-muted-dark line-clamp-2">
                        {workoutPlan.description}
                    </p>
                )}

                {/* Meta Info */}
                <div className="flex flex-wrap items-center gap-3 text-sm">
                    {workoutPlan.difficulty && (
                        <Badge className={getDifficultyColor(workoutPlan.difficulty)}>
                            {workoutPlan.difficulty}
                        </Badge>
                    )}
                    {workoutPlan.category && (
                        <Badge variant="outline" className="capitalize">
                            {workoutPlan.category}
                        </Badge>
                    )}
                    {workoutPlan.estimatedDuration && (
                        <div className="flex items-center gap-1 text-gray-500 dark:text-gray-400">
                            <Clock className="h-4 w-4" />
                            {workoutPlan.estimatedDuration}min
                        </div>
                    )}
                    {workoutPlan.totalExercises && (
                        <div className="flex items-center gap-1 text-gray-500 dark:text-gray-400">
                            <Dumbbell className="h-4 w-4" />
                            {workoutPlan.totalExercises} exercises
                        </div>
                    )}
                </div>

                {/* Progress Section */}
                {showProgress && userProgress && (
                    <div className="space-y-2 pt-2 border-t border-gray-200 dark:border-gray-700">
                        <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-600 dark:text-muted-dark">Progress</span>
                            <span className="font-semibold text-gray-900 dark:text-text-dark">
                                {userProgress.completedExercises}/{userProgress.totalExercises} completed
                            </span>
                        </div>
                        <Progress value={progressPercentage} className="h-2" />
                        <div className="flex items-center justify-between">
                            <Badge className={getStatusColor(userProgress.status)}>
                                {userProgress.status}
                            </Badge>
                            <span className="text-sm font-semibold text-cyan-500">
                                {progressPercentage}%
                            </span>
                        </div>
                    </div>
                )}

                {/* Footer: XP and Action */}
                <div className="flex items-center justify-between pt-2 border-t border-gray-200 dark:border-gray-700">
                    <Badge className="bg-gradient-to-r from-cyan-500 to-blue-500 text-white">
                        +{estimatedXP} XP
                    </Badge>
                    
                    {userProgress ? (
                        <Button 
                            size="sm" 
                            className="bg-black hover:bg-gray-800 text-white"
                            onClick={(e) => {
                                e.stopPropagation()
                                onClick?.()
                            }}
                        >
                            <PlayCircle className="h-4 w-4 mr-2" />
                            Continue
                        </Button>
                    ) : (
                        <Button 
                            size="sm" 
                            variant="outline"
                            onClick={(e) => {
                                e.stopPropagation()
                                onClick?.()
                            }}
                        >
                            View Details
                        </Button>
                    )}
                </div>
            </CardContent>
        </Card>
    )
}


