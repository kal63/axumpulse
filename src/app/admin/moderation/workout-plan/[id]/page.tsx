'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { ArrowLeft, Check, X, Dumbbell, User, Calendar, Clock, Tag, Globe, Target } from 'lucide-react'
import { toast } from 'sonner'
import { apiClient, type ModerationItemType } from '@/lib/api-client'

export default function WorkoutPlanModerationDetailPage() {
  const params = useParams()
  const router = useRouter()
  const workoutPlanId = params.id as string

  const [workoutPlan, setWorkoutPlan] = useState<ModerationItemType | null>(null)
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(false)
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false)
  const [rejectReason, setRejectReason] = useState('')

  useEffect(() => {
    fetchWorkoutPlan()
  }, [workoutPlanId])

  const fetchWorkoutPlan = async () => {
    try {
      setLoading(true)
      const response = await apiClient.getModerationItem('workout-plan', parseInt(workoutPlanId))
      if (response.success && response.data) {
        setWorkoutPlan(response.data.item)
      } else {
        toast.error('Failed to fetch workout plan details')
        router.push('/admin/moderation?tab=workout-plan')
      }
    } catch (error: any) {
      console.error('Error fetching workout plan:', error)
      toast.error('Failed to fetch workout plan details')
      router.push('/admin/moderation?tab=workout-plan')
    } finally {
      setLoading(false)
    }
  }

  const handleApprove = async () => {
    if (!workoutPlan) return

    try {
      setActionLoading(true)
      await apiClient.approveModerationItem('workout-plan', workoutPlan.id)
      toast.success('Workout plan approved successfully')
      router.push('/admin/moderation?tab=workout-plan')
    } catch (error: any) {
      console.error('Error approving workout plan:', error)
      toast.error('Failed to approve workout plan')
    } finally {
      setActionLoading(false)
    }
  }

  const handleReject = async () => {
    if (!workoutPlan || !rejectReason.trim()) {
      toast.error('Please provide a rejection reason')
      return
    }

    try {
      setActionLoading(true)
      await apiClient.rejectModerationItem('workout-plan', workoutPlan.id, rejectReason)
      toast.success('Workout plan rejected')
      router.push('/admin/moderation?tab=workout-plan')
    } catch (error: any) {
      console.error('Error rejecting workout plan:', error)
      toast.error('Failed to reject workout plan')
    } finally {
      setActionLoading(false)
      setRejectDialogOpen(false)
      setRejectReason('')
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'border-green-200 bg-green-50 text-green-700 dark:border-green-800 dark:bg-green-950/20 dark:text-green-400'
      case 'rejected':
        return 'border-red-200 bg-red-50 text-red-700 dark:border-red-800 dark:bg-red-950/20 dark:text-red-400'
      case 'pending':
        return 'border-yellow-200 bg-yellow-50 text-yellow-700 dark:border-yellow-800 dark:bg-yellow-950/20 dark:text-yellow-400'
      default:
        return 'border-gray-200 bg-gray-50 text-gray-700 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300'
    }
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner':
        return 'border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-800 dark:bg-blue-950/20 dark:text-blue-400'
      case 'intermediate':
        return 'border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-800 dark:bg-amber-950/20 dark:text-amber-400'
      case 'advanced':
        return 'border-purple-200 bg-purple-50 text-purple-700 dark:border-purple-800 dark:bg-purple-950/20 dark:text-purple-400'
      default:
        return 'border-gray-200 bg-gray-50 text-gray-700 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300'
    }
  }

  const getAuthorName = (item: ModerationItemType) => {
    if (item.trainer?.User) {
      return item.trainer.User.name || 'Unknown'
    }
    return 'Unknown'
  }

  const getAuthorEmail = (item: ModerationItemType) => {
    if (item.trainer?.User) {
      return item.trainer.User.email || 'Unknown'
    }
    return 'Unknown'
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
      </div>
    )
  }

  if (!workoutPlan) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Workout Plan Not Found</h1>
          <p className="text-gray-600 dark:text-gray-400 mb-4">The requested workout plan could not be found.</p>
          <Button onClick={() => router.push('/admin/moderation?tab=workout-plan')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Moderation
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button
            variant="outline"
            onClick={() => router.push('/admin/moderation?tab=workout-plan')}
            className="flex items-center space-x-2"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Moderation</span>
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Workout Plan Review</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Review workout plan before approval
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Badge className={getStatusColor(workoutPlan.status)}>
            {workoutPlan.status}
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Workout Plan Details */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Dumbbell className="h-5 w-5" />
                <span>Workout Plan Details</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">Title</Label>
                <p className="text-lg font-semibold text-gray-900 dark:text-white mt-1">
                  {workoutPlan.title}
                </p>
              </div>

              <div>
                <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">Description</Label>
                <p className="text-gray-700 dark:text-gray-300 mt-1 whitespace-pre-wrap">
                  {workoutPlan.description}
                </p>
              </div>

              {/* Quick Info Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4">
                <div>
                  <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">Difficulty</Label>
                  <div className="mt-1">
                    <Badge className={getDifficultyColor((workoutPlan as any).difficulty)}>
                      {(workoutPlan as any).difficulty}
                    </Badge>
                  </div>
                </div>

                <div>
                  <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">Category</Label>
                  <p className="text-gray-900 dark:text-white mt-1">{(workoutPlan as any).category}</p>
                </div>

                <div>
                  <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">Exercises</Label>
                  <p className="text-gray-900 dark:text-white mt-1 flex items-center">
                    <Dumbbell className="h-4 w-4 mr-1" />
                    {(workoutPlan as any).totalExercises || 0}
                  </p>
                </div>

                <div>
                  <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">Duration</Label>
                  <p className="text-gray-900 dark:text-white mt-1 flex items-center">
                    <Clock className="h-4 w-4 mr-1" />
                    {(workoutPlan as any).estimatedDuration || 0} min
                  </p>
                </div>
              </div>

              {/* Tags */}
              {(workoutPlan as any).tags && (workoutPlan as any).tags.length > 0 && (
                <div className="pt-4">
                  <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">Tags</Label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {(workoutPlan as any).tags.map((tag: string, index: number) => (
                      <Badge key={index} variant="outline">{tag}</Badge>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Exercises Card */}
          {(workoutPlan as any).exercises && (workoutPlan as any).exercises.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Target className="h-5 w-5" />
                  <span>Exercises ({(workoutPlan as any).exercises.length})</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {(workoutPlan as any).exercises.map((exercise: any) => (
                    <Card key={exercise.id} className="border">
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-lg">
                            #{exercise.order}. {exercise.name}
                          </CardTitle>
                          {exercise.category && (
                            <Badge variant="outline">{exercise.category}</Badge>
                          )}
                        </div>
                        {exercise.description && (
                          <CardDescription>{exercise.description}</CardDescription>
                        )}
                      </CardHeader>
                      <CardContent className="pt-0">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                          {exercise.sets && (
                            <div>
                              <p className="text-gray-500">Sets</p>
                              <p className="font-medium">{exercise.sets}</p>
                            </div>
                          )}
                          {exercise.reps && (
                            <div>
                              <p className="text-gray-500">Reps</p>
                              <p className="font-medium">{exercise.reps}</p>
                            </div>
                          )}
                          {exercise.weight && (
                            <div>
                              <p className="text-gray-500">Weight</p>
                              <p className="font-medium">{exercise.weight}</p>
                            </div>
                          )}
                          {exercise.duration > 0 && (
                            <div>
                              <p className="text-gray-500">Duration</p>
                              <p className="font-medium">{exercise.duration}s</p>
                            </div>
                          )}
                          {exercise.restTime > 0 && (
                            <div>
                              <p className="text-gray-500">Rest</p>
                              <p className="font-medium">{exercise.restTime}s</p>
                            </div>
                          )}
                          {exercise.equipment && (
                            <div>
                              <p className="text-gray-500">Equipment</p>
                              <p className="font-medium">{exercise.equipment}</p>
                            </div>
                          )}
                        </div>

                        {exercise.muscleGroups && exercise.muscleGroups.length > 0 && (
                          <div className="mt-3">
                            <p className="text-sm text-gray-500 mb-2">Muscle Groups</p>
                            <div className="flex flex-wrap gap-1">
                              {exercise.muscleGroups.map((muscle: string, idx: number) => (
                                <Badge key={idx} variant="secondary" className="text-xs">
                                  {muscle}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}

                        {exercise.notes && (
                          <div className="mt-3 p-2 bg-blue-50 dark:bg-blue-950/20 rounded border border-blue-200 dark:border-blue-800">
                            <p className="text-sm text-blue-600 dark:text-blue-400">{exercise.notes}</p>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Rejection Reason */}
          {workoutPlan.rejectionReason && (
            <Card>
              <CardHeader>
                <CardTitle className="text-red-600 dark:text-red-400">Rejection Reason</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                  {workoutPlan.rejectionReason}
                </p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Author Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <User className="h-5 w-5" />
                <span>Author</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">Name</Label>
                <p className="text-gray-900 dark:text-white">{getAuthorName(workoutPlan)}</p>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">Email</Label>
                <p className="text-gray-900 dark:text-white">{getAuthorEmail(workoutPlan)}</p>
              </div>
            </CardContent>
          </Card>

          {/* Workout Plan Properties */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Tag className="h-5 w-5" />
                <span>Properties</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">Visibility</Label>
                <div className="mt-1">
                  <Badge variant={(workoutPlan as any).isPublic ? "default" : "secondary"}>
                    {(workoutPlan as any).isPublic ? 'Public' : 'Private'}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Metadata */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Calendar className="h-5 w-5" />
                <span>Metadata</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">Created</Label>
                <p className="text-gray-900 dark:text-white">
                  {new Date(workoutPlan.createdAt).toLocaleDateString()} at {new Date(workoutPlan.createdAt).toLocaleTimeString()}
                </p>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">Last Updated</Label>
                <p className="text-gray-900 dark:text-white">
                  {new Date(workoutPlan.updatedAt).toLocaleDateString()} at {new Date(workoutPlan.updatedAt).toLocaleTimeString()}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          {workoutPlan.status === 'pending' && (
            <Card>
              <CardHeader>
                <CardTitle>Actions</CardTitle>
                <CardDescription>
                  Approve or reject this workout plan
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button
                  onClick={handleApprove}
                  disabled={actionLoading}
                  className="w-full bg-emerald-600 hover:bg-emerald-700"
                >
                  <Check className="h-4 w-4 mr-2" />
                  Approve Workout Plan
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => setRejectDialogOpen(true)}
                  disabled={actionLoading}
                  className="w-full"
                >
                  <X className="h-4 w-4 mr-2" />
                  Reject Workout Plan
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Reject Dialog */}
      <Dialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Workout Plan</DialogTitle>
            <DialogDescription>
              Please provide a reason for rejecting this workout plan.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="rejectReason" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Rejection Reason
              </Label>
              <Textarea
                id="rejectReason"
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="e.g., Inappropriate content, unclear instructions, poor quality..."
                className="mt-1"
                rows={4}
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setRejectDialogOpen(false)
                setRejectReason('')
              }}
              disabled={actionLoading}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleReject}
              disabled={actionLoading || !rejectReason.trim()}
            >
              Reject Workout Plan
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
