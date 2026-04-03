'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter, useSearchParams } from 'next/navigation'
import { apiClient } from '@/lib/api-client'
import { 
  ArrowLeft, Dumbbell, Clock, CheckCircle, PlayCircle, TrendingUp, 
  Zap, Target, Award, Trophy, Star, Flame, Heart, Timer, 
  ChevronRight, Sparkles, Users, Calendar, MapPin, Globe, User,
  AlertCircle, Stethoscope, Edit2, Plus, Sparkles as SparklesIcon, X
} from 'lucide-react'
import { NeumorphicCard } from '@/components/user/NeumorphicCard'
import { XPRing } from '@/components/user/XPRing'
import { ExerciseTimer } from '@/components/user/ExerciseTimer'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import type { WorkoutPlan, WorkoutPlanInsight, WorkoutPlanPlaybackVideo } from '@/lib/api-client'
import enMessages from '@/locales/en/messages.json'
import { useToast } from '@/hooks/use-toast'
import { useAuth } from '@/contexts/auth-context'

export default function WorkoutPlanDetailPage() {
    const params = useParams()
    const router = useRouter()
    const searchParams = useSearchParams()
    const { toast } = useToast()
    const { user } = useAuth()
    
    const [workoutPlan, setWorkoutPlan] = useState<WorkoutPlan | null>(null)
    const [relatedPlans, setRelatedPlans] = useState<WorkoutPlan[]>([])
    const [userProgress, setUserProgress] = useState<any>(null)
    const [exerciseProgress, setExerciseProgress] = useState<Map<number, boolean>>(new Map())
    const [exerciseStartTimes, setExerciseStartTimes] = useState<Map<number, string>>(new Map()) // Store startedAt ISO strings from backend
    const [exerciseCanComplete, setExerciseCanComplete] = useState<Map<number, boolean>>(new Map()) // Track if exercise reached 80% threshold
    const [loading, setLoading] = useState(true)
    const [starting, setStarting] = useState(false)
    
    // Check if coming from spin & win game
    const fromGame = searchParams.get('fromGame') === 'true'
    const gameId = searchParams.get('gameId') ? parseInt(searchParams.get('gameId')!) : null

    // Insight-related state
    const [insight, setInsight] = useState<WorkoutPlanInsight | null>(null)
    const [loadingInsight, setLoadingInsight] = useState(false)
    const [insightDialogOpen, setInsightDialogOpen] = useState(false)
    const [exerciseVideoModal, setExerciseVideoModal] = useState<WorkoutPlanPlaybackVideo | null>(null)
    const [aiGenerationLoading, setAiGenerationLoading] = useState(false)
    const [availableUsers, setAvailableUsers] = useState<Array<{
        id: number
        name: string
        email?: string
        phone?: string
        profilePicture?: string
        lastBookingDate: string
    }>>([])
    const [selectedUserId, setSelectedUserId] = useState<number | null>(null)
    const [insightFormData, setInsightFormData] = useState({
        insightText: '',
        suitability: 'recommended' as 'recommended' | 'caution' | 'not_recommended' | 'requires_modification',
        customLabels: [] as string[],
        customLabelInput: ''
    })

    const planId = Number(params.id)
    const isMedicalPro = user?.isMedical || false

    const wm = enMessages as Record<string, string>
    const planVideoTitle = wm['user.workoutPlan.video.introTitle'] ?? 'Plan overview video'
    const watchDemoLabel = wm['user.workoutPlan.video.watchDemo'] ?? 'Watch demo'
    const exerciseVideoDialogTitle = wm['user.workoutPlan.video.dialogTitle'] ?? 'Exercise video'

    const videoSrc = (fileUrl: string) =>
        `${process.env.NEXT_PUBLIC_API_URL || ''}${fileUrl}`

    useEffect(() => {
        if (planId) {
            fetchWorkoutPlan()
            fetchProgress()
            fetchInsight()
        }
    }, [planId, user?.id])

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
                
                // Create maps of exercise progress data
                const progressMap = new Map<number, boolean>()
                const startTimesMap = new Map<number, string>()
                
                response.data.exerciseProgress.forEach((ep: any) => {
                    progressMap.set(ep.exerciseId, ep.completed)
                    // Store startedAt from backend if available (handle both Date objects and ISO strings)
                    if (ep.startedAt && !ep.completed) {
                        const startedAtValue = ep.startedAt instanceof Date 
                            ? ep.startedAt.toISOString() 
                            : ep.startedAt
                        startTimesMap.set(ep.exerciseId, startedAtValue)
                    }
                })
                
                setExerciseProgress(progressMap)
                setExerciseStartTimes(startTimesMap)
            }
        } catch (error) {
            // Progress not found is okay - user has not started yet
            console.log('No progress found')
        }
    }

    const handleStartPlan = async () => {
        try {
            setStarting(true)
            // Pass gameId if coming from game
            const response = await apiClient.startWorkoutPlan(planId, gameId || undefined)
            
            if (response.success) {
                // Immediately update startedAt if backend returned it
                if (response.data?.firstExerciseProgress?.startedAt) {
                    const exerciseId = response.data.firstExerciseProgress.exerciseId
                    // Backend returns ISO string, but handle both cases just in case
                    const startedAtValue = typeof response.data.firstExerciseProgress.startedAt === 'string'
                        ? response.data.firstExerciseProgress.startedAt
                        : String(response.data.firstExerciseProgress.startedAt)
                    
                    setExerciseStartTimes(prev => {
                        const newMap = new Map(prev)
                        newMap.set(exerciseId, startedAtValue)
                        return newMap
                    })
                }
                
                toast({
                    title: '🎉 Plan Started!',
                    description: fromGame 
                        ? 'Complete this workout plan to earn bonus XP from the game!' 
                        : 'Your workout journey begins now. Good luck!'
                })
                
                // Refresh to show full progress (backend will set startedAt for first exercise)
                await fetchProgress()
                
                // Remove query params after starting to clean up URL
                if (fromGame) {
                    router.replace(`/user/workout-plans/${planId}`)
                }
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

    const handleTimerThresholdReached = (exerciseId: number) => {
        // Called when exercise timer reaches 80% threshold
        setExerciseCanComplete(prev => new Map(prev).set(exerciseId, true))
    }

    const handleCompleteExercise = async (exerciseId: number) => {
        try {
            // Calculate time spent from startedAt
            const startedAt = exerciseStartTimes.get(exerciseId)
            let timeSpent = 30 // Default minimum time
            
            if (startedAt) {
                const startTime = new Date(startedAt).getTime()
                const elapsedSeconds = Math.floor((Date.now() - startTime) / 1000)
                timeSpent = Math.max(elapsedSeconds, 30)
            }
            
            const response = await apiClient.completeExercise(planId, exerciseId, timeSpent)
            
            if (response.success && response.data) {
                // Immediately update startedAt for next exercise if backend returned it
                if (response.data.nextExerciseProgress?.startedAt) {
                    const nextExerciseId = response.data.nextExerciseProgress.exerciseId
                    // Backend returns ISO string, but handle both cases just in case
                    const startedAtValue = typeof response.data.nextExerciseProgress.startedAt === 'string'
                        ? response.data.nextExerciseProgress.startedAt
                        : String(response.data.nextExerciseProgress.startedAt)
                    
                    setExerciseStartTimes(prev => {
                        const newMap = new Map(prev)
                        newMap.set(nextExerciseId, startedAtValue)
                        return newMap
                    })
                }
                
                toast({
                    title: '✅ Exercise Complete!',
                    description: `You earned 25 XP!`
                })
                
                // Refresh progress to get full state
                await fetchProgress()
                
                // Clear can-complete flag
                setExerciseCanComplete(prev => {
                    const newMap = new Map(prev)
                    newMap.delete(exerciseId)
                    return newMap
                })
            }
        } catch (error: any) {
            console.error('Error completing exercise:', error)
            
            // Handle specific error codes
            if (error?.code === 'INSUFFICIENT_TIME') {
                toast({
                    title: '⏱️ More Time Required',
                    description: error.message || 'You need to spend more time on this exercise',
                    variant: 'destructive'
                })
            } else {
                toast({
                    title: 'Error',
                    description: error?.message || 'Failed to mark exercise as complete',
                    variant: 'destructive'
                })
            }
        }
    }

    const fetchInsight = async () => {
        try {
            setLoadingInsight(true)
            const userId = user?.id
            if (!userId) return

            const response = await apiClient.getWorkoutPlanInsight(planId, userId)
            if (response.success && response.data) {
                setInsight(response.data)
            }
        } catch (error: any) {
            // 404 is okay - no insight exists yet
            if (error?.status !== 404) {
                console.error('Error fetching insight:', error)
            }
        } finally {
            setLoadingInsight(false)
        }
    }

    const fetchAvailableUsers = async () => {
        try {
            const response = await apiClient.getAvailableUsersForInsight(planId)
            if (response.success && response.data) {
                setAvailableUsers(response.data.users)
            }
        } catch (error) {
            console.error('Error fetching available users:', error)
            toast({
                title: 'Error',
                description: 'Failed to load available users',
                variant: 'destructive'
            })
        }
    }

    const handleOpenInsightDialog = async () => {
        await fetchAvailableUsers()
        if (insight) {
            setSelectedUserId(insight.userId)
            setInsightFormData({
                insightText: insight.insightText,
                suitability: insight.suitability,
                customLabels: insight.customLabels || [],
                customLabelInput: ''
            })
        } else {
            setSelectedUserId(user?.id || null)
            setInsightFormData({
                insightText: '',
                suitability: 'recommended',
                customLabels: [],
                customLabelInput: ''
            })
        }
        setInsightDialogOpen(true)
    }

    const handleGenerateWithAI = async () => {
        if (!selectedUserId) {
            if (availableUsers.length > 0) {
                setSelectedUserId(availableUsers[0].id)
            } else {
                toast({
                    title: 'Error',
                    description: 'Please select a user first',
                    variant: 'destructive'
                })
                return
            }
        }

        try {
            setAiGenerationLoading(true)
            const userId = selectedUserId ?? availableUsers[0]?.id
            if (!userId) {
                throw new Error('No user selected')
            }
            const response = await apiClient.generateWorkoutPlanInsightWithAI(planId, userId)
            if (response.success && response.data) {
                setInsightFormData({
                    insightText: response.data.insightText,
                    suitability: response.data.suitability,
                    customLabels: response.data.customLabels || [],
                    customLabelInput: ''
                })
                toast({
                    title: 'AI Insight Generated',
                    description: 'Review and edit the generated insight before saving'
                })
            }
        } catch (error: any) {
            console.error('Error generating AI insight:', error)
            toast({
                title: 'Error',
                description: error?.message || 'Failed to generate AI insight',
                variant: 'destructive'
            })
        } finally {
            setAiGenerationLoading(false)
        }
    }

    const handleSaveInsight = async () => {
        if (!selectedUserId || !insightFormData.insightText.trim()) {
            toast({
                title: 'Validation Error',
                description: 'Please fill in all required fields',
                variant: 'destructive'
            })
            return
        }

        try {
            const response = await apiClient.createOrUpdateWorkoutPlanInsight(planId, {
                userId: selectedUserId,
                insightText: insightFormData.insightText,
                customLabels: insightFormData.customLabels,
                suitability: insightFormData.suitability,
                sourceType: insight ? (insight.sourceType === 'ai' ? 'ai_edited' : 'medical_professional') : 'medical_professional'
            })

            if (response.success && response.data) {
                setInsight(response.data)
                setInsightDialogOpen(false)
                toast({
                    title: 'Success',
                    description: 'Insight saved successfully'
                })
                // Refresh insight if viewing for the same user
                if (selectedUserId === user?.id) {
                    await fetchInsight()
                }
            }
        } catch (error: any) {
            console.error('Error saving insight:', error)
            toast({
                title: 'Error',
                description: error?.message || 'Failed to save insight',
                variant: 'destructive'
            })
        }
    }

    const handleAddCustomLabel = () => {
        const label = insightFormData.customLabelInput.trim()
        if (label && !insightFormData.customLabels.includes(label)) {
            setInsightFormData(prev => ({
                ...prev,
                customLabels: [...prev.customLabels, label],
                customLabelInput: ''
            }))
        }
    }

    const handleRemoveCustomLabel = (label: string) => {
        setInsightFormData(prev => ({
            ...prev,
            customLabels: prev.customLabels.filter(l => l !== label)
        }))
    }

    const getSuitabilityColor = (suitability: string) => {
        switch (suitability) {
            case 'recommended': return 'bg-green-500/20 text-green-400 border-green-500/30'
            case 'caution': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
            case 'not_recommended': return 'bg-red-500/20 text-red-400 border-red-500/30'
            case 'requires_modification': return 'bg-orange-500/20 text-orange-400 border-orange-500/30'
            default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30'
        }
    }

    const getSuitabilityLabel = (suitability: string) => {
        switch (suitability) {
            case 'recommended': return 'Recommended'
            case 'caution': return 'Caution'
            case 'not_recommended': return 'Not Recommended'
            case 'requires_modification': return 'Requires Modification'
            default: return suitability
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

    const planTags = (() => {
        const raw: unknown = workoutPlan.tags
        if (Array.isArray(raw)) {
            return raw.filter((x): x is string => typeof x === 'string')
        }
        if (typeof raw === 'string') {
            try {
                const parsed = JSON.parse(raw)
                if (Array.isArray(parsed)) {
                    return parsed.filter((x): x is string => typeof x === 'string')
                }
            } catch {
                return raw.split(',').map((s) => s.trim()).filter(Boolean)
            }
            return raw.split(',').map((s) => s.trim()).filter(Boolean)
        }
        return []
    })()

    // Calculate estimated XP: base (totalExercises * 25 + 100) + 50 bonus if from game
    const baseXP = (workoutPlan.totalExercises || 0) * 25 + 100
    const gameBonus = fromGame ? 50 : 0
    const estimatedXP = baseXP + gameBonus

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

                    {/* Game Banner - Show if coming from spin & win */}
                    {fromGame && (
                        <NeumorphicCard variant="raised" className="p-4 mb-6 border-l-4 border-l-cyan-500 bg-gradient-to-r from-cyan-500/10 to-purple-500/10">
                            <div className="flex items-start gap-3">
                                <div className="p-2 bg-gradient-to-br from-cyan-500 to-purple-600 rounded-lg">
                                    <Trophy className="h-5 w-5 text-white" />
                                </div>
                                <div className="flex-1">
                                    <h3 className="font-bold text-[var(--neumorphic-text)] mb-1 flex items-center gap-2">
                                        <Sparkles className="h-4 w-4 text-cyan-500" />
                                        Won from Spin & Win Game!
                                    </h3>
                                    <p className="text-sm text-[var(--neumorphic-muted)] mb-2">
                                        You won this workout plan from the Spin & Win game. Start and complete this workout plan to earn bonus XP!
                                    </p>
                                    <div className="flex items-center gap-2 text-xs text-[var(--neumorphic-muted)]">
                                        <Zap className="h-3 w-3 text-yellow-500" />
                                        <span>Complete the workout plan to earn: Base XP + 50 XP bonus</span>
                                    </div>
                                </div>
                            </div>
                        </NeumorphicCard>
                    )}

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
                                    {planTags.slice(0, 3).map((tag, index) => (
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
                                                    {fromGame && (
                                                        <span className="block mt-1 text-cyan-500 font-semibold">
                                                            +50 XP bonus from game!
                                                        </span>
                                                    )}
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

                        {workoutPlan.introVideo?.fileUrl && (
                            <NeumorphicCard variant="raised" className="overflow-hidden p-0 border border-[var(--neumorphic-border)] shadow-lg">
                                <div className="px-6 pt-5 pb-2">
                                    <h2 className="text-lg font-bold text-[var(--neumorphic-text)] flex items-center gap-2">
                                        <PlayCircle className="h-5 w-5 text-cyan-500" />
                                        {planVideoTitle}
                                    </h2>
                                    {workoutPlan.introVideo.title && (
                                        <p className="text-sm text-[var(--neumorphic-muted)] mt-1">{workoutPlan.introVideo.title}</p>
                                    )}
                                </div>
                                <div className="aspect-video bg-black">
                                    <video
                                        className="w-full h-full object-contain"
                                        controls
                                        playsInline
                                        src={videoSrc(workoutPlan.introVideo.fileUrl)}
                                        poster={
                                            workoutPlan.introVideo.thumbnailUrl
                                                ? videoSrc(workoutPlan.introVideo.thumbnailUrl)
                                                : undefined
                                        }
                                    />
                                </div>
                            </NeumorphicCard>
                        )}

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

                        {/* Medical Professional Actions */}
                        {isMedicalPro && (
                            <div className="flex gap-3">
                                <Button
                                    onClick={handleOpenInsightDialog}
                                    className="bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white"
                                >
                                    <Edit2 className="h-4 w-4 mr-2" />
                                    {insight ? 'Update Insight' : 'Add Insight'}
                                </Button>
                                <Button
                                    onClick={async () => {
                                        await fetchAvailableUsers()
                                        if (availableUsers.length > 0) {
                                            setSelectedUserId(availableUsers[0].id)
                                            setInsightFormData({
                                                insightText: '',
                                                suitability: 'recommended',
                                                customLabels: [],
                                                customLabelInput: ''
                                            })
                                            setInsightDialogOpen(true)
                                            // Auto-generate after dialog opens
                                            setTimeout(() => {
                                                handleGenerateWithAI()
                                            }, 100)
                                        } else {
                                            toast({
                                                title: 'No Users Available',
                                                description: 'You need to have consulted with users before generating insights',
                                                variant: 'destructive'
                                            })
                                        }
                                    }}
                                    variant="outline"
                                    className="border-purple-500 text-purple-500 hover:bg-purple-500/10"
                                    disabled={aiGenerationLoading}
                                >
                                    <SparklesIcon className="h-4 w-4 mr-2" />
                                    {aiGenerationLoading ? 'Generating...' : 'Generate with AI'}
                                </Button>
                            </div>
                        )}

                        {/* Insight Display Section */}
                        {insight && (
                            <NeumorphicCard variant="recessed" className="p-6 border-l-4 border-l-cyan-500">
                                <div className="flex items-start justify-between mb-4">
                                    <div className="flex items-center gap-2">
                                        <Stethoscope className="h-5 w-5 text-cyan-500" />
                                        <h3 className="text-xl font-bold text-[var(--neumorphic-text)]">
                                            Medical Insight
                                        </h3>
                                    </div>
                                    <Badge className={getSuitabilityColor(insight.suitability)}>
                                        {getSuitabilityLabel(insight.suitability)}
                                    </Badge>
                                </div>
                                
                                <p className="text-[var(--neumorphic-muted)] leading-relaxed mb-4">
                                    {insight.insightText}
                                </p>

                                {insight.customLabels && insight.customLabels.length > 0 && (
                                    <div className="flex flex-wrap gap-2 mb-4">
                                        {insight.customLabels.map((label, idx) => (
                                            <Badge key={idx} variant="outline" className="text-xs">
                                                {label}
                                            </Badge>
                                        ))}
                                    </div>
                                )}

                                <div className="flex items-center justify-between text-sm text-[var(--neumorphic-muted)] pt-4 border-t border-[var(--neumorphic-border)]">
                                    <div className="flex items-center gap-2">
                                        {insight.sourceType === 'ai' && (
                                            <Badge variant="outline" className="text-xs">
                                                <SparklesIcon className="h-3 w-3 mr-1" />
                                                AI Generated
                                            </Badge>
                                        )}
                                        {insight.sourceType === 'ai_edited' && (
                                            <Badge variant="outline" className="text-xs">
                                                <SparklesIcon className="h-3 w-3 mr-1" />
                                                AI Generated (Edited)
                                            </Badge>
                                        )}
                                        {insight.sourceType === 'medical_professional' && (
                                            <Badge variant="outline" className="text-xs">
                                                <Stethoscope className="h-3 w-3 mr-1" />
                                                Medical Professional
                                            </Badge>
                                        )}
                                    </div>
                                    {insight.creator && (
                                        <span>
                                            By {insight.creator.name} • {new Date(insight.updatedAt).toLocaleDateString()}
                                        </span>
                                    )}
                                </div>
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
                                const completedCount = userProgress?.completedExercises || 0
                                const isNext = index === completedCount
                                const isUpcoming = index > completedCount
                                const hasStartedAt = exerciseStartTimes.has(exercise.id)
                                
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
                                            <div className="p-4 md:p-6">
                                                <div className="flex flex-col md:flex-row items-start justify-between gap-4 md:gap-6">
                                                    {/* Exercise Info */}
                                                    <div className="flex items-start gap-4 flex-1 w-full md:w-auto">
                                                        {/* Exercise Number/Status with Flow Indicator */}
                                                        <div className="relative flex-shrink-0">
                                                            <div className={`w-12 h-12 md:w-14 md:h-14 rounded-2xl flex items-center justify-center font-bold text-base md:text-lg transition-all duration-500 ${
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
                                                        <div className="flex-1 space-y-4 w-full">
                                                            <div>
                                                                <div className="flex flex-wrap items-center gap-2 mb-2">
                                                                    <h3 className="text-xl font-bold text-[var(--neumorphic-text)]">
                                                                        {exercise.name}
                                                                    </h3>
                                                                    {isNext && (
                                                                        <Badge className="bg-gradient-to-r from-cyan-500 to-purple-600 text-white text-xs">
                                                                            Next Up
                                                                        </Badge>
                                                                    )}
                                                                    {exercise.video?.fileUrl && (
                                                                        <Button
                                                                            type="button"
                                                                            variant="outline"
                                                                            size="sm"
                                                                            className="border-cyan-500/50 text-cyan-600 hover:bg-cyan-500/10"
                                                                            onClick={() => setExerciseVideoModal(exercise.video!)}
                                                                        >
                                                                            <PlayCircle className="h-4 w-4 mr-1" />
                                                                            {watchDemoLabel}
                                                                        </Button>
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
                                                            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-3 w-full">
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
                                                            {(() => {
                                                                const mgRaw: unknown = (exercise as any).muscleGroups
                                                                let muscleGroups: string[] = []

                                                                if (Array.isArray(mgRaw)) {
                                                                    muscleGroups = mgRaw.filter((x): x is string => typeof x === 'string')
                                                                } else if (typeof mgRaw === 'string') {
                                                                    // Backend may return JSON fields as strings in some environments.
                                                                    try {
                                                                        const parsed = JSON.parse(mgRaw)
                                                                        if (Array.isArray(parsed)) {
                                                                            muscleGroups = parsed.filter((x): x is string => typeof x === 'string')
                                                                        }
                                                                    } catch {
                                                                        muscleGroups = []
                                                                    }
                                                                }

                                                                if (muscleGroups.length === 0) return null

                                                                return (
                                                                <div className="flex flex-wrap gap-2">
                                                                    {muscleGroups.map((muscle, muscleIndex) => (
                                                                        <Badge 
                                                                            key={muscleIndex} 
                                                                            variant="outline" 
                                                                            className="text-xs border-[var(--neumorphic-border)] text-[var(--neumorphic-muted)]"
                                                                        >
                                                                            🎯 {muscle}
                                                                        </Badge>
                                                                    ))}
                                                                </div>
                                                                )
                                                            })()}
                                                            
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
                                                    
                                                    {/* Timer and Action Button */}
                                                    <div className="flex-shrink-0 flex flex-col items-center gap-4 w-full md:w-auto">
                                                        {/* Exercise Timer - Show for active exercise */}
                                                        {userProgress && !isCompleted && isNext ? (
                                                            exercise.duration && exercise.duration > 0 ? (
                                                                hasStartedAt ? (
                                                                    <ExerciseTimer
                                                                        duration={exercise.duration}
                                                                        startedAt={exerciseStartTimes.get(exercise.id) || null}
                                                                        onThresholdReached={() => handleTimerThresholdReached(exercise.id)}
                                                                        className="mb-2"
                                                                    />
                                                                ) : (
                                                                    <div className="flex items-center gap-3 mb-2 p-3 bg-[var(--neumorphic-surface)] rounded-xl border border-cyan-500/20 w-full md:w-auto">
                                                                        <div className="w-12 h-12 flex items-center justify-center flex-shrink-0">
                                                                            <Timer className="w-6 h-6 text-cyan-500 animate-pulse" />
                                                                        </div>
                                                                        <div className="flex flex-col">
                                                                            <div className="text-base font-bold text-[var(--neumorphic-text)]">
                                                                                {Math.floor(exercise.duration / 60)}:{String(exercise.duration % 60).padStart(2, '0')}
                                                                            </div>
                                                                            <div className="text-xs text-[var(--neumorphic-muted)]">Starting timer...</div>
                                                                        </div>
                                                                    </div>
                                                                )
                                                            ) : (
                                                                <div className="mb-2 p-2 text-xs text-[var(--neumorphic-muted)]">
                                                                    No duration set
                                                                </div>
                                                            )
                                                        ) : null}
                                                        
                                                        {userProgress && !isCompleted ? (
                                                            <Button
                                                                onClick={() => handleCompleteExercise(exercise.id)}
                                                                className={`w-full md:w-auto ${
                                                                    isNext 
                                                                        ? exerciseCanComplete.get(exercise.id)
                                                                            ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white hover:from-green-600 hover:to-emerald-700 shadow-lg'
                                                                            : 'bg-gradient-to-r from-cyan-500 to-purple-600 text-white hover:from-cyan-600 hover:to-purple-700 shadow-lg animate-pulse'
                                                                        : 'bg-gradient-to-r from-cyan-500 to-purple-600 text-white hover:from-cyan-600 hover:to-purple-700 shadow-lg'
                                                                }`}
                                                                size="lg"
                                                                disabled={isUpcoming || (isNext && (exercise.duration ?? 0) > 0 && !exerciseCanComplete.get(exercise.id))}
                                                            >
                                                                <CheckCircle className="h-5 w-5 mr-2" />
                                                                {isNext 
                                                                    ? exerciseCanComplete.get(exercise.id) 
                                                                        ? 'Complete' 
                                                                        : 'Waiting...'
                                                                    : 'Complete'
                                                                }
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

            {/* Insight Management Dialog */}
            <Dialog open={insightDialogOpen} onOpenChange={setInsightDialogOpen}>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <Stethoscope className="h-5 w-5" />
                            {insight ? 'Update Workout Plan Insight' : 'Add Workout Plan Insight'}
                        </DialogTitle>
                        <DialogDescription>
                            Provide personalized medical guidance for this workout plan
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-6 py-4">
                        {/* User Selection (for medical professionals) */}
                        {isMedicalPro && (
                            <div className="space-y-2">
                                <Label htmlFor="user-select">Select User</Label>
                                <Select
                                    value={selectedUserId?.toString() || ''}
                                    onValueChange={(value) => setSelectedUserId(parseInt(value))}
                                >
                                    <SelectTrigger id="user-select">
                                        <SelectValue placeholder="Select a user" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {availableUsers.map((u) => (
                                            <SelectItem key={u.id} value={u.id.toString()}>
                                                {u.name} {u.email && `(${u.email})`}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        )}

                        {/* AI Generate Button */}
                        {isMedicalPro && (
                            <div className="flex justify-end">
                                <Button
                                    onClick={handleGenerateWithAI}
                                    variant="outline"
                                    disabled={!selectedUserId || aiGenerationLoading}
                                    className="border-purple-500 text-purple-500 hover:bg-purple-500/10"
                                >
                                    <SparklesIcon className="h-4 w-4 mr-2" />
                                    {aiGenerationLoading ? 'Generating...' : 'Generate with AI'}
                                </Button>
                            </div>
                        )}

                        {/* Suitability */}
                        <div className="space-y-2">
                            <Label htmlFor="suitability">Suitability</Label>
                            <Select
                                value={insightFormData.suitability}
                                onValueChange={(value: any) => setInsightFormData(prev => ({ ...prev, suitability: value }))}
                            >
                                <SelectTrigger id="suitability">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="recommended">Recommended</SelectItem>
                                    <SelectItem value="caution">Caution</SelectItem>
                                    <SelectItem value="requires_modification">Requires Modification</SelectItem>
                                    <SelectItem value="not_recommended">Not Recommended</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Insight Text */}
                        <div className="space-y-2">
                            <Label htmlFor="insight-text">Insight Text</Label>
                            <Textarea
                                id="insight-text"
                                value={insightFormData.insightText}
                                onChange={(e) => setInsightFormData(prev => ({ ...prev, insightText: e.target.value }))}
                                placeholder="Provide personalized guidance based on the user's medical profile..."
                                rows={6}
                                className="resize-none"
                            />
                        </div>

                        {/* Custom Labels */}
                        <div className="space-y-2">
                            <Label htmlFor="custom-labels">Custom Labels</Label>
                            <div className="flex gap-2">
                                <Input
                                    id="custom-labels"
                                    value={insightFormData.customLabelInput}
                                    onChange={(e) => setInsightFormData(prev => ({ ...prev, customLabelInput: e.target.value }))}
                                    placeholder="e.g., low-impact, beginner-friendly"
                                    onKeyPress={(e) => {
                                        if (e.key === 'Enter') {
                                            e.preventDefault()
                                            handleAddCustomLabel()
                                        }
                                    }}
                                />
                                <Button type="button" onClick={handleAddCustomLabel} variant="outline">
                                    <Plus className="h-4 w-4" />
                                </Button>
                            </div>
                            {insightFormData.customLabels.length > 0 && (
                                <div className="flex flex-wrap gap-2 mt-2">
                                    {insightFormData.customLabels.map((label, idx) => (
                                        <Badge key={idx} variant="outline" className="flex items-center gap-1">
                                            {label}
                                            <button
                                                onClick={() => handleRemoveCustomLabel(label)}
                                                className="ml-1 hover:text-red-500"
                                            >
                                                <X className="h-3 w-3" />
                                            </button>
                                        </Badge>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    <DialogFooter>
                        <Button variant="outline" onClick={() => setInsightDialogOpen(false)}>
                            Cancel
                        </Button>
                        <Button onClick={handleSaveInsight} disabled={!insightFormData.insightText.trim() || !selectedUserId}>
                            {insight ? 'Update Insight' : 'Save Insight'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <Dialog open={!!exerciseVideoModal} onOpenChange={(open) => !open && setExerciseVideoModal(null)}>
                <DialogContent className="max-w-3xl bg-[var(--neumorphic-surface)] border-[var(--neumorphic-border)]">
                    <DialogHeader>
                        <DialogTitle className="text-[var(--neumorphic-text)]">
                            {exerciseVideoModal?.title || exerciseVideoDialogTitle}
                        </DialogTitle>
                    </DialogHeader>
                    {exerciseVideoModal?.fileUrl && (
                        <div className="aspect-video bg-black rounded-xl overflow-hidden">
                            <video
                                key={exerciseVideoModal.id}
                                className="w-full h-full object-contain"
                                controls
                                playsInline
                                autoPlay
                                src={videoSrc(exerciseVideoModal.fileUrl)}
                                poster={
                                    exerciseVideoModal.thumbnailUrl
                                        ? videoSrc(exerciseVideoModal.thumbnailUrl)
                                        : undefined
                                }
                            />
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    )
}

