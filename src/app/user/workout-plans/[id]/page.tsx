'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { apiClient } from '@/lib/api-client'
import { 
  ArrowLeft, Dumbbell, Clock, CheckCircle, PlayCircle, TrendingUp, 
  Zap, Target, Award, Trophy, Star, Flame, Heart, Timer, 
  ChevronRight, Sparkles, Users, Calendar, MapPin, Globe, User
} from 'lucide-react'
import { NeumorphicCard } from '@/components/user/NeumorphicCard'
import { XPRing } from '@/components/user/XPRing'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import type { WorkoutPlan } from '@/lib/api-client'
import { useToast } from '@/hooks/use-toast'

export default function WorkoutPlanDetailPage() {
    const params = useParams()
    const router = useRouter()
    const { toast } = useToast()
    
    const [workoutPlan, setWorkoutPlan] = useState<WorkoutPlan | null>(null)
    const [relatedPlans, setRelatedPlans] = useState<WorkoutPlan[]>([])
    const [userProgress, setUserProgress] = useState<any>(null)
    const [exerciseProgress, setExerciseProgress] = useState<Map<number, boolean>>(new Map())
    const [loading, setLoading] = useState(true)
    const [starting, setStarting] = useState(false)

    const planId = Number(params.id)

    useEffect(() => {
        if (planId) {
            fetchWorkoutPlan()
            fetchProgress()
        }
    }, [planId])

    const fetchWorkoutPlan = async () => {
        try {
            setLoading(true)
            const response = await apiClient.getUserWorkoutPlanById(planId)
            
            if (response.success && response.data) {
                setWorkoutPlan(response.data.workoutPlan)
                setRelatedPlans(response.data.relatedPlans)
            }
        } catch (error) {
            console.error('Error fetching workout plan:', error)
            toast({
                title: 'Error',
                description: 'Failed to load workout plan',
                variant: 'destructive'
            })
        } finally {
            setLoading(false)
        }
    }

    const fetchProgress = async () => {
        try {
            const response = await apiClient.getWorkoutPlanProgress(planId)
            
            if (response.success && response.data) {
                setUserProgress(response.data.planProgress)
                
                // Create a map of exercise completion status
                const progressMap = new Map()
                response.data.exerciseProgress.forEach((ep: any) => {
                    progressMap.set(ep.exerciseId, ep.completed)
                })
                setExerciseProgress(progressMap)
            }
        } catch (error) {
            // Progress not found is okay - user has not started yet
            console.log('No progress found')
        }
    }

    const handleStartPlan = async () => {
        try {
            setStarting(true)
            const response = await apiClient.startWorkoutPlan(planId)
            
            if (response.success) {
                toast({
                    title: '🎉 Plan Started!',
                    description: 'Your workout journey begins now. Good luck!'
                })
                // Refresh to show progress
                await fetchProgress()
            }
        } catch (error) {
            console.error('Error starting plan:', error)
            toast({
                title: 'Error',
                description: 'Failed to start workout plan',
                variant: 'destructive'
            })
        } finally {
            setStarting(false)
        }
    }

    const handleCompleteExercise = async (exerciseId: number) => {
        try {
            const response = await apiClient.completeExercise(planId, exerciseId)
            
            if (response.success && response.data) {
                toast({
                    title: '✅ Exercise Complete!',
                    description: `You earned 25 XP!`
                })
                
                // Update progress
                await fetchProgress()
            }
        } catch (error) {
            console.error('Error completing exercise:', error)
            toast({
                title: 'Error',
                description: 'Failed to mark exercise as complete',
                variant: 'destructive'
            })
        }
    }

    const getDifficultyColor = (difficulty?: string) => {
        switch (difficulty) {
            case 'beginner': return 'bg-green-500/20 text-green-400 border-green-500/30'
            case 'intermediate': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
            case 'advanced': return 'bg-red-500/20 text-red-400 border-red-500/30'
            default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30'
        }
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 to-gray-100 dark:from-charcoal dark:to-deep-slate p-4 md:p-8">
                <div className="max-w-6xl mx-auto space-y-4">
                    <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                    <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                </div>
            </div>
        )
    }

    if (!workoutPlan) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 to-gray-100 dark:from-charcoal dark:to-deep-slate p-4 md:p-8">
                <Card className="max-w-2xl mx-auto p-12 text-center">
                    <p className="text-gray-500 dark:text-gray-400 text-lg">Workout plan not found</p>
                    <Button onClick={() => router.push('/user/workout-plans')} className="mt-4">
                        Back to Workout Plans
                    </Button>
                </Card>
            </div>
        )
    }

    const progressPercentage = userProgress 
        ? Math.round((userProgress.completedExercises / userProgress.totalExercises) * 100)
        : 0

    const estimatedXP = (workoutPlan.totalExercises || 0) * 25 + 100

    return (
        <div className="min-h-screen bg-[var(--neumorphic-bg)]">
            {/* Hero Section */}
            <div className="relative overflow-hidden">
                {/* Background Gradient */}
                <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 via-purple-500/5 to-blue-500/10" />
                
                {/* Content */}
                <div className="relative max-w-7xl mx-auto px-4 py-8 md:py-12">
                    {/* Back Button */}
                    <Button
                        variant="ghost"
                        onClick={() => router.push('/user/workout-plans')}
                        className="mb-6 text-[var(--neumorphic-muted)] hover:text-[var(--neumorphic-text)]"
                    >
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Back to Workout Plans
                    </Button>

                    {/* Hero Content */}
                    <div className="space-y-8">
                        {/* Main Header */}
                        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-8">
                            <div className="flex-1 space-y-6">
                                {/* Title and Trainer */}
                                <div className="space-y-4">
                                    <div className="flex items-start gap-4">
                                        <div className="p-4 bg-gradient-to-br from-cyan-500 to-purple-600 rounded-2xl shadow-lg">
                                            <Dumbbell className="h-8 w-8 text-white" />
                                        </div>
                                        <div className="flex-1">
                                            <h1 className="text-4xl md:text-5xl font-bold text-[var(--neumorphic-text)] mb-3">
                                                {workoutPlan.title}
                                            </h1>
                                            {workoutPlan.trainer && (
                                                <div className="flex items-center gap-2 text-[var(--neumorphic-muted)]">
                                                    <User className="h-4 w-4" />
                                                    <span>by {(workoutPlan.trainer as any).User?.name || 'Unknown Trainer'}</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Stats Grid */}
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    <NeumorphicCard variant="recessed" className="p-4 text-center">
                                        <div className="flex items-center justify-center w-12 h-12 mx-auto mb-2 bg-gradient-to-br from-cyan-500 to-blue-500 rounded-xl">
                                            <Target className="h-6 w-6 text-white" />
                                        </div>
                                        <div className="text-2xl font-bold text-[var(--neumorphic-text)]">
                                            {workoutPlan.totalExercises || 0}
                                        </div>
                                        <div className="text-sm text-[var(--neumorphic-muted)]">Exercises</div>
                                    </NeumorphicCard>

                                    <NeumorphicCard variant="recessed" className="p-4 text-center">
                                        <div className="flex items-center justify-center w-12 h-12 mx-auto mb-2 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl">
                                            <Clock className="h-6 w-6 text-white" />
                                        </div>
                                        <div className="text-2xl font-bold text-[var(--neumorphic-text)]">
                                            {workoutPlan.estimatedDuration || 0}
                                        </div>
                                        <div className="text-sm text-[var(--neumorphic-muted)]">Minutes</div>
                                    </NeumorphicCard>

                                    <NeumorphicCard variant="recessed" className="p-4 text-center">
                                        <div className="flex items-center justify-center w-12 h-12 mx-auto mb-2 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl">
                                            <Zap className="h-6 w-6 text-white" />
                                        </div>
                                        <div className="text-2xl font-bold text-[var(--neumorphic-text)]">
                                            +{estimatedXP}
                                        </div>
                                        <div className="text-sm text-[var(--neumorphic-muted)]">XP Reward</div>
                                    </NeumorphicCard>

                                    <NeumorphicCard variant="recessed" className="p-4 text-center">
                                        <div className="flex items-center justify-center w-12 h-12 mx-auto mb-2 bg-gradient-to-br from-orange-500 to-red-500 rounded-xl">
                                            <Trophy className="h-6 w-6 text-white" />
                                        </div>
                                        <div className="text-2xl font-bold text-[var(--neumorphic-text)] capitalize">
                                            {workoutPlan.difficulty}
                                        </div>
                                        <div className="text-sm text-[var(--neumorphic-muted)]">Level</div>
                                    </NeumorphicCard>
                                </div>

                                {/* Tags */}
                                <div className="flex flex-wrap gap-2">
                                    {workoutPlan.category && (
                                        <Badge className="bg-gradient-to-r from-cyan-500 to-blue-500 text-white px-3 py-1">
                                            {workoutPlan.category}
                                        </Badge>
                                    )}
                                    {workoutPlan.tags?.slice(0, 3).map((tag, index) => (
                                        <Badge key={index} variant="outline" className="border-[var(--neumorphic-border)] text-[var(--neumorphic-muted)]">
                                            {tag}
                                        </Badge>
                                    ))}
                                </div>
                            </div>

                            {/* Action Section */}
                            <div className="lg:w-80 space-y-4">
                                {!userProgress ? (
                                    <NeumorphicCard variant="raised" className="p-6 text-center">
                                        <div className="space-y-4">
                                            <div className="w-16 h-16 mx-auto bg-gradient-to-br from-cyan-500 to-purple-600 rounded-2xl flex items-center justify-center">
                                                <PlayCircle className="h-8 w-8 text-white" />
                                            </div>
                                            <div>
                                                <h3 className="text-xl font-bold text-[var(--neumorphic-text)] mb-2">
                                                    Ready to Start?
                                                </h3>
                                                <p className="text-sm text-[var(--neumorphic-muted)] mb-4">
                                                    Begin your fitness journey and earn {estimatedXP} XP
                                                </p>
                                            </div>
                                            <Button
                                                onClick={handleStartPlan}
                                                disabled={starting}
                                                className="w-full bg-gradient-to-r from-cyan-500 to-purple-600 text-white hover:from-cyan-600 hover:to-purple-700 shadow-lg"
                                                size="lg"
                                            >
                                                <PlayCircle className="h-5 w-5 mr-2" />
                                                {starting ? 'Starting...' : 'Start Program'}
                                            </Button>
                                        </div>
                                    </NeumorphicCard>
                                ) : userProgress.status === 'completed' ? (
                                    <NeumorphicCard variant="raised" className="p-6 text-center">
                                        <div className="space-y-4">
                                            <div className="w-16 h-16 mx-auto bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center">
                                                <Trophy className="h-8 w-8 text-white" />
                                            </div>
                                            <div>
                                                <h3 className="text-xl font-bold text-green-600 mb-2">
                                                    🎉 Completed!
                                                </h3>
                                                <p className="text-sm text-[var(--neumorphic-muted)]">
                                                    Congratulations on finishing this program!
                                                </p>
                                            </div>
                                        </div>
                                    </NeumorphicCard>
                                ) : (
                                    <NeumorphicCard variant="raised" className="p-6">
                                        <div className="space-y-4">
                                            <div className="text-center">
                                                <h3 className="text-lg font-bold text-[var(--neumorphic-text)] mb-2">
                                                    Your Progress
                                                </h3>
                                                <div className="text-sm text-[var(--neumorphic-muted)]">
                                                    {userProgress.completedExercises} of {userProgress.totalExercises} exercises
                                                </div>
                                            </div>
                                            
                                            {/* Stunning Progress Ring */}
                                            <div className="relative w-32 h-32 mx-auto">
                                                <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 120 120">
                                                    {/* Background Circle */}
                                                    <circle
                                                        cx="60"
                                                        cy="60"
                                                        r="50"
                                                        stroke="var(--neumorphic-border)"
                                                        strokeWidth="8"
                                                        fill="none"
                                                        className="opacity-30"
                                                    />
                                                    {/* Progress Circle */}
                                                    <circle
                                                        cx="60"
                                                        cy="60"
                                                        r="50"
                                                        stroke="url(#progressGradient)"
                                                        strokeWidth="8"
                                                        fill="none"
                                                        strokeLinecap="round"
                                                        strokeDasharray={`${2 * Math.PI * 50}`}
                                                        strokeDashoffset={`${2 * Math.PI * 50 * (1 - progressPercentage / 100)}`}
                                                        className="transition-all duration-1000 ease-out"
                                                    />
                                                    <defs>
                                                        <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                                                            <stop offset="0%" stopColor="#06b6d4" />
                                                            <stop offset="100%" stopColor="#8b5cf6" />
                                                        </linearGradient>
                                                    </defs>
                                                </svg>
                                                
                                                {/* Center Content */}
                                                <div className="absolute inset-0 flex items-center justify-center">
                                                    <div className="text-center">
                                                        <div className="text-2xl font-bold text-[var(--neumorphic-text)]">
                                                            {progressPercentage}%
                                                        </div>
                                                        <div className="text-xs text-[var(--neumorphic-muted)]">
                                                            Complete
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* XP Earned */}
                                            <div className="text-center">
                                                <div className="flex items-center justify-center gap-2 text-cyan-500">
                                                    <Zap className="h-4 w-4" />
                                                    <span className="font-semibold">
                                                        +{Math.round((userProgress.completedExercises * 25))} XP Earned
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </NeumorphicCard>
                                )}
                            </div>
                        </div>

                        {/* Description */}
                        {workoutPlan.description && (
                            <NeumorphicCard variant="recessed" className="p-6">
                                <h3 className="text-xl font-bold text-[var(--neumorphic-text)] mb-3 flex items-center gap-2">
                                    <Sparkles className="h-5 w-5 text-cyan-500" />
                                    About This Program
                                </h3>
                                <p className="text-[var(--neumorphic-muted)] leading-relaxed whitespace-pre-wrap">
                                    {workoutPlan.description}
                                </p>
                            </NeumorphicCard>
                        )}
                    </div>
                </div>
            </div>

            {/* Exercises Section */}
            <div className="max-w-7xl mx-auto px-4 py-8">
                <div className="space-y-6">
                    {/* Section Header */}
                    <div className="text-center space-y-2">
                        <h2 className="text-3xl font-bold text-[var(--neumorphic-text)] flex items-center justify-center gap-3">
                            <Target className="h-8 w-8 text-cyan-500" />
                            Exercise Schedule
                        </h2>
                        <p className="text-[var(--neumorphic-muted)]">
                            Complete each exercise to progress through your program
                        </p>
                    </div>

                    {/* Workout Flow */}
                    <div className="relative">
                        {/* Progress Flow Line */}
                        <div className="absolute left-7 top-0 bottom-0 w-0.5 bg-gradient-to-b from-cyan-500 via-purple-500 to-green-500 opacity-30" />
                        
                        {/* Exercises Flow */}
                        <div className="space-y-6">
                            {workoutPlan.exercises?.map((exercise, index) => {
                                const isCompleted = exerciseProgress.get(exercise.id)
                                const isNext = index === (userProgress?.completedExercises || 0)
                                const isUpcoming = index > (userProgress?.completedExercises || 0)
                                
                                return (
                                    <div key={exercise.id} className="relative">
                                        {/* Connection Line */}
                                        {index < (workoutPlan.exercises?.length || 0) - 1 && (
                                            <div className={`absolute left-7 top-16 w-0.5 h-6 transition-all duration-500 ${
                                                isCompleted 
                                                    ? 'bg-gradient-to-b from-green-500 to-cyan-500' 
                                                    : isNext
                                                    ? 'bg-gradient-to-b from-cyan-500 to-purple-500'
                                                    : 'bg-[var(--neumorphic-border)] opacity-30'
                                            }`} />
                                        )}
                                        
                                        <NeumorphicCard 
                                            variant={isCompleted ? "recessed" : "raised"}
                                            className={`transition-all duration-500 ${
                                                isCompleted 
                                                    ? 'border-green-500/30 bg-gradient-to-r from-green-50/50 to-emerald-50/50 dark:from-green-900/10 dark:to-emerald-900/10' 
                                                    : isNext
                                                    ? 'border-cyan-500/30 bg-gradient-to-r from-cyan-50/30 to-purple-50/30 dark:from-cyan-900/10 dark:to-purple-900/10 shadow-lg'
                                                    : isUpcoming
                                                    ? 'opacity-60'
                                                    : 'hover:shadow-lg hover:scale-[1.02]'
                                            }`}
                                        >
                                            <div className="p-6">
                                                <div className="flex items-start justify-between gap-6">
                                                    {/* Exercise Info */}
                                                    <div className="flex items-start gap-4 flex-1">
                                                        {/* Exercise Number/Status with Flow Indicator */}
                                                        <div className="relative">
                                                            <div className={`flex-shrink-0 w-14 h-14 rounded-2xl flex items-center justify-center font-bold text-lg transition-all duration-500 ${
                                                                isCompleted 
                                                                    ? 'bg-gradient-to-br from-green-500 to-emerald-600 text-white shadow-lg' 
                                                                    : isNext
                                                                    ? 'bg-gradient-to-br from-cyan-500 to-purple-600 text-white shadow-lg animate-pulse'
                                                                    : isUpcoming
                                                                    ? 'bg-[var(--neumorphic-surface)] text-[var(--neumorphic-muted)] shadow-[var(--neumorphic-shadow)] opacity-60'
                                                                    : 'bg-[var(--neumorphic-surface)] text-[var(--neumorphic-muted)] shadow-[var(--neumorphic-shadow)]'
                                                            }`}>
                                                                {isCompleted ? (
                                                                    <CheckCircle className="h-7 w-7" />
                                                                ) : (
                                                                    <span className="text-xl">{index + 1}</span>
                                                                )}
                                                            </div>
                                                            
                                                            {/* Flow Status Indicator */}
                                                            {isNext && (
                                                                <div className="absolute -top-1 -right-1 w-4 h-4 bg-gradient-to-br from-cyan-500 to-purple-600 rounded-full animate-ping" />
                                                            )}
                                                        </div>
                                                        
                                                        {/* Exercise Details */}
                                                        <div className="flex-1 space-y-4">
                                                            <div>
                                                                <div className="flex items-center gap-2 mb-2">
                                                                    <h3 className="text-xl font-bold text-[var(--neumorphic-text)]">
                                                                        {exercise.name}
                                                                    </h3>
                                                                    {isNext && (
                                                                        <Badge className="bg-gradient-to-r from-cyan-500 to-purple-600 text-white text-xs">
                                                                            Next Up
                                                                        </Badge>
                                                                    )}
                                                                </div>
                                                                
                                                                {exercise.description && (
                                                                    <p className="text-[var(--neumorphic-muted)] leading-relaxed mb-3">
                                                                        {exercise.description}
                                                                    </p>
                                                                )}
                                                                
                                                                {/* Exercise Notes */}
                                                                {exercise.notes && (
                                                                    <div className="bg-[var(--neumorphic-surface)] p-3 rounded-xl">
                                                                        <p className="text-sm text-[var(--neumorphic-muted)] italic">
                                                                            💡 {exercise.notes}
                                                                        </p>
                                                                    </div>
                                                                )}
                                                            </div>
                                                            
                                                            {/* Exercise Stats Grid */}
                                                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                                                {exercise.sets && (
                                                                    <div className="flex items-center gap-2 text-sm">
                                                                        <div className="w-6 h-6 bg-gradient-to-br from-cyan-500 to-blue-500 rounded-lg flex items-center justify-center">
                                                                            <Target className="h-3 w-3 text-white" />
                                                                        </div>
                                                                        <div>
                                                                            <div className="font-semibold text-[var(--neumorphic-text)]">
                                                                                {exercise.sets} sets
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                )}
                                                                {exercise.reps && (
                                                                    <div className="flex items-center gap-2 text-sm">
                                                                        <div className="w-6 h-6 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                                                                            <Dumbbell className="h-3 w-3 text-white" />
                                                                        </div>
                                                                        <div>
                                                                            <div className="font-semibold text-[var(--neumorphic-text)]">
                                                                                {exercise.reps} reps
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                )}
                                                                {exercise.weight && (
                                                                    <div className="flex items-center gap-2 text-sm">
                                                                        <div className="w-6 h-6 bg-gradient-to-br from-orange-500 to-red-500 rounded-lg flex items-center justify-center">
                                                                            <Award className="h-3 w-3 text-white" />
                                                                        </div>
                                                                        <div>
                                                                            <div className="font-semibold text-[var(--neumorphic-text)]">
                                                                                {exercise.weight}
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                )}
                                                                {exercise.restTime && (
                                                                    <div className="flex items-center gap-2 text-sm">
                                                                        <div className="w-6 h-6 bg-gradient-to-br from-green-500 to-emerald-500 rounded-lg flex items-center justify-center">
                                                                            <Clock className="h-3 w-3 text-white" />
                                                                        </div>
                                                                        <div>
                                                                            <div className="font-semibold text-[var(--neumorphic-text)]">
                                                                                {exercise.restTime}s rest
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                )}
                                                            </div>
                                                            
                                                            {/* Muscle Groups */}
                                                            {exercise.muscleGroups && exercise.muscleGroups.length > 0 && (
                                                                <div className="flex flex-wrap gap-2">
                                                                    {exercise.muscleGroups.map((muscle, muscleIndex) => (
                                                                        <Badge 
                                                                            key={muscleIndex} 
                                                                            variant="outline" 
                                                                            className="text-xs border-[var(--neumorphic-border)] text-[var(--neumorphic-muted)]"
                                                                        >
                                                                            🎯 {muscle}
                                                                        </Badge>
                                                                    ))}
                                                                </div>
                                                            )}
                                                            
                                                            {/* Equipment */}
                                                            {exercise.equipment && exercise.equipment !== 'none' && (
                                                                <div className="flex items-center gap-2 text-sm text-[var(--neumorphic-muted)]">
                                                                    <span className="font-medium">Equipment:</span>
                                                                    <Badge variant="outline" className="text-xs">
                                                                        {exercise.equipment}
                                                                    </Badge>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                    
                                                    {/* Action Button */}
                                                    <div className="flex-shrink-0">
                                                        {userProgress && !isCompleted ? (
                                                            <Button
                                                                onClick={() => handleCompleteExercise(exercise.id)}
                                                                className={`${
                                                                    isNext 
                                                                        ? 'bg-gradient-to-r from-cyan-500 to-purple-600 text-white hover:from-cyan-600 hover:to-purple-700 shadow-lg animate-pulse'
                                                                        : 'bg-gradient-to-r from-cyan-500 to-purple-600 text-white hover:from-cyan-600 hover:to-purple-700 shadow-lg'
                                                                }`}
                                                                size="lg"
                                                                disabled={isUpcoming}
                                                            >
                                                                <CheckCircle className="h-5 w-5 mr-2" />
                                                                {isNext ? 'Start Now' : 'Complete'}
                                                            </Button>
                                                        ) : isCompleted ? (
                                                            <div className="text-center space-y-2">
                                                                <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center mx-auto">
                                                                    <Trophy className="h-6 w-6 text-white" />
                                                                </div>
                                                                <div className="flex items-center gap-1 text-green-600 font-semibold">
                                                                    <Zap className="h-4 w-4" />
                                                                    <span>+25 XP</span>
                                                                </div>
                                                            </div>
                                                        ) : (
                                                            <div className="text-center space-y-2">
                                                                <div className="w-12 h-12 bg-[var(--neumorphic-surface)] rounded-2xl flex items-center justify-center mx-auto shadow-[var(--neumorphic-shadow)]">
                                                                    <Clock className="h-6 w-6 text-[var(--neumorphic-muted)]" />
                                                                </div>
                                                                <div className="text-sm text-[var(--neumorphic-muted)]">
                                                                    Coming Up
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </NeumorphicCard>
                                    </div>
                                )
                            })}
                        </div>
                    </div>
                </div>
            </div>

            {/* Related Plans Section */}
            {relatedPlans.length > 0 && (
                <div className="max-w-7xl mx-auto px-4 py-8">
                    <div className="space-y-6">
                        {/* Section Header */}
                        <div className="text-center space-y-2">
                            <h2 className="text-3xl font-bold text-[var(--neumorphic-text)] flex items-center justify-center gap-3">
                                <Flame className="h-8 w-8 text-orange-500" />
                                Similar Programs
                            </h2>
                            <p className="text-[var(--neumorphic-muted)]">
                                Discover more workout plans that match your interests
                            </p>
                        </div>

                        {/* Related Plans Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {relatedPlans.map((plan) => (
                                <NeumorphicCard
                                    key={plan.id}
                                    variant="raised"
                                    className="group cursor-pointer hover:shadow-lg hover:scale-[1.02] transition-all duration-300"
                                    onClick={() => router.push(`/user/workout-plans/${plan.id}`)}
                                >
                                    <div className="p-6 space-y-4">
                                        {/* Plan Header */}
                                        <div className="space-y-2">
                                            <h3 className="text-lg font-bold text-[var(--neumorphic-text)] group-hover:text-cyan-500 transition-colors line-clamp-2">
                                                {plan.title}
                                            </h3>
                                            {plan.description && (
                                                <p className="text-sm text-[var(--neumorphic-muted)] line-clamp-2">
                                                    {plan.description}
                                                </p>
                                            )}
                                        </div>

                                        {/* Plan Stats */}
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                {plan.difficulty && (
                                                    <Badge className={getDifficultyColor(plan.difficulty)}>
                                                        {plan.difficulty}
                                                    </Badge>
                                                )}
                                                {plan.totalExercises && (
                                                    <div className="flex items-center gap-1 text-sm text-[var(--neumorphic-muted)]">
                                                        <Dumbbell className="h-4 w-4" />
                                                        <span>{plan.totalExercises}</span>
                                                    </div>
                                                )}
                                            </div>
                                            
                                            <div className="flex items-center gap-1 text-cyan-500">
                                                <ChevronRight className="h-4 w-4" />
                                            </div>
                                        </div>
                                    </div>
                                </NeumorphicCard>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

