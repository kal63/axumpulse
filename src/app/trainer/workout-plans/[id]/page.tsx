'use client'

import { useEffect, useState } from 'react'

import { useParams, useRouter, useSearchParams } from 'next/navigation'
import { apiClient, type WorkoutPlan, type WorkoutExercise } from '@/lib/api-client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import { useAuth } from '@/contexts/auth-context'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { 
  ArrowLeft, 
  Edit, 
  Save, 
  X, 
  Trash2, 
  Dumbbell, 
  Clock,
  Tag,
  Globe,
  Lock,
  Plus,
  Users,
  Calendar,
  Pencil,
  Check,
  Send,
  AlertCircle
} from 'lucide-react'

export default function WorkoutPlanDetailPage() {
  const params = useParams()
  const router = useRouter()
  const searchParams = useSearchParams()
  const { user, isLoading } = useAuth()
  const [workoutPlan, setWorkoutPlan] = useState<WorkoutPlan | null>(null)
  const [exercises, setExercises] = useState<WorkoutExercise[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [editForm, setEditForm] = useState<Partial<WorkoutPlan>>({})
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [workoutPlanToDelete, setWorkoutPlanToDelete] = useState<WorkoutPlan | null>(null)
  const [showSubmitDialog, setShowSubmitDialog] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [showWithdrawDialog, setShowWithdrawDialog] = useState(false)
  const [withdrawing, setWithdrawing] = useState(false)
  const [showEditWarningDialog, setShowEditWarningDialog] = useState(false)
  
  // Exercise editing states
  const [editingExercise, setEditingExercise] = useState<WorkoutExercise | null>(null)
  const [exerciseForm, setExerciseForm] = useState<Partial<WorkoutExercise>>({})
  const [showExerciseDialog, setShowExerciseDialog] = useState(false)
  const [exerciseSaving, setExerciseSaving] = useState(false)

  const workoutPlanId = params.id as string

  // Check for edit query parameter
  useEffect(() => {
    const editParam = searchParams.get('edit')
    if (editParam === 'true') {
      setIsEditing(true)
      // Remove the edit parameter from URL without triggering navigation
      const url = new URL(window.location.href)
      url.searchParams.delete('edit')
      window.history.replaceState({}, '', url.toString())
    }
  }, [searchParams])

  useEffect(() => {
    if (!isLoading) {
      if (!user) {
        router.push('/login')
        return
      }
      if (!user.isTrainer) {
        router.push('/dashboard')
        return
      }
    }
  }, [user, isLoading, router])

  useEffect(() => {
    if (user && user.isTrainer) {
      loadWorkoutPlan()
    }
  }, [user, workoutPlanId])

  const loadWorkoutPlan = async () => {
    try {
      setLoading(true)
      const res = await apiClient.getTrainerWorkoutPlanById(parseInt(workoutPlanId))
      if (res.success && res.data) {
        setWorkoutPlan(res.data.workoutPlan)
        setEditForm(res.data.workoutPlan)
      } else {
        setError(res.error?.message || 'Failed to load workout plan')
      }
    } catch (err) {
      setError('Failed to load workout plan')
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    if (!workoutPlan) return

    // If workout plan is approved, show warning dialog
    if (workoutPlan.status === 'approved') {
      setShowEditWarningDialog(true)
      return
    }
    
    await performSave()
  }

  const performSave = async () => {
    if (!workoutPlan) return

    try {
      setSaving(true)
      const res = await apiClient.updateTrainerWorkoutPlan(workoutPlan.id, editForm)
      if (res.success) {
        // Reload the workout plan to get updated data including exercises
        await loadWorkoutPlan()
        setIsEditing(false)
        setShowEditWarningDialog(false)
      } else {
        setError(res.error?.message || 'Failed to update workout plan')
      }
    } catch (err) {
      setError('Failed to update workout plan')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!workoutPlan) return

    try {
      setSaving(true)
      const res = await apiClient.deleteTrainerWorkoutPlan(workoutPlan.id)
      if (res.success) {
        router.push('/trainer/workout-plans')
      } else {
        setError(res.error?.message || 'Failed to delete workout plan')
      }
    } catch (err) {
      setError('Failed to delete workout plan')
    } finally {
      setSaving(false)
      setShowDeleteDialog(false)
    }
  }

  const handleDeleteClick = (workoutPlan: WorkoutPlan) => {
    setWorkoutPlanToDelete(workoutPlan)
    setShowDeleteDialog(true)
  }

  const handleSubmit = async () => {
    if (!workoutPlan) return
    
    setSubmitting(true)
    try {
      const res = await apiClient.submitWorkoutPlanForApproval(workoutPlan.id)
      if (res.success) {
        // Reload the workout plan to show updated status
        await loadWorkoutPlan()
        setShowSubmitDialog(false)
      } else {
        setError(res.error?.message || 'Failed to submit workout plan')
      }
    } catch (err) {
      console.error('Failed to submit workout plan:', err)
      setError('Failed to submit workout plan. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  const handleWithdraw = async () => {
    if (!workoutPlan) return
    
    setWithdrawing(true)
    try {
      const res = await apiClient.withdrawWorkoutPlanSubmission(workoutPlan.id)
      if (res.success) {
        // Reload the workout plan to show updated status
        await loadWorkoutPlan()
        setShowWithdrawDialog(false)
      } else {
        setError(res.error?.message || 'Failed to withdraw workout plan')
      }
    } catch (err) {
      console.error('Failed to withdraw workout plan:', err)
      setError('Failed to withdraw workout plan. Please try again.')
    } finally {
      setWithdrawing(false)
    }
  }

  // Exercise management functions
  const handleAddExercise = () => {
    setEditingExercise(null)
    setExerciseForm({})
    setShowExerciseDialog(true)
  }

  const handleEditExercise = (exercise: WorkoutExercise) => {
    setEditingExercise(exercise)
    setExerciseForm(exercise)
    setShowExerciseDialog(true)
  }

  const handleSaveExercise = async () => {
    if (!workoutPlan) return

    try {
      setExerciseSaving(true)
      let res
      
      if (editingExercise) {
        // Update existing exercise
        res = await apiClient.updateWorkoutExercise(workoutPlan.id, editingExercise.id, exerciseForm)
      } else {
        // Add new exercise
        res = await apiClient.addWorkoutExercise(workoutPlan.id, exerciseForm)
      }

      if (res.success) {
        // Reload workout plan to get updated exercises
        await loadWorkoutPlan()
        setShowExerciseDialog(false)
        setEditingExercise(null)
        setExerciseForm({})
      } else {
        setError(res.error?.message || 'Failed to save exercise')
      }
    } catch (err) {
      setError('Failed to save exercise')
    } finally {
      setExerciseSaving(false)
    }
  }

  const handleDeleteExercise = async (exercise: WorkoutExercise) => {
    if (!workoutPlan) return

    try {
      setExerciseSaving(true)
      const res = await apiClient.deleteWorkoutExercise(workoutPlan.id, exercise.id)
      
      if (res.success) {
        // Reload workout plan to get updated exercises
        await loadWorkoutPlan()
      } else {
        setError(res.error?.message || 'Failed to delete exercise')
      }
    } catch (err) {
      setError('Failed to delete exercise')
    } finally {
      setExerciseSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading workout plan...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error || !workoutPlan) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-6">
            <p className="text-red-600">{error || 'Workout plan not found'}</p>
            <Button 
              variant="outline" 
              onClick={() => router.push('/trainer/workout-plans')}
              className="mt-4"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Workout Plans
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.push('/trainer/workout-plans')}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              {isEditing ? 'Edit Workout Plan' : workoutPlan.title}
            </h1>
            <div className="flex items-center gap-3 mt-3">
              <div className="flex items-center gap-2">
                <Dumbbell className="h-4 w-4 text-purple-600" />
                <Badge 
                  className={
                    workoutPlan.difficulty === 'beginner' ? 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800' :
                    workoutPlan.difficulty === 'intermediate' ? 'bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-800' :
                    'bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-900/20 dark:text-purple-400 dark:border-purple-800'
                  }
                >
                  {workoutPlan.difficulty}
                </Badge>
              </div>
              <Badge 
                className={
                  workoutPlan.status === 'approved' ? 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800' :
                  workoutPlan.status === 'pending' ? 'bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-400 dark:border-yellow-800' :
                  workoutPlan.status === 'draft' ? 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700' :
                  'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800'
                }
              >
                {workoutPlan.status}
              </Badge>
              <Badge 
                className={
                  workoutPlan.isPublic ? 
                  'bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-800' :
                  'bg-slate-100 text-slate-800 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700'
                }
              >
                {workoutPlan.isPublic ? 'Public' : 'Private'}
              </Badge>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          {isEditing ? (
            <>
              <Button variant="outline" onClick={() => setIsEditing(false)}>
                <X className="h-4 w-4 mr-2" />
                Cancel
              </Button>
              <Button onClick={handleSave} disabled={saving}>
                <Save className="h-4 w-4 mr-2" />
                {saving ? 'Saving...' : 'Save Changes'}
              </Button>
            </>
          ) : (
            <>
              {/* Submit for Approval (only for draft and rejected) */}
              {(workoutPlan.status === 'draft' || workoutPlan.status === 'rejected') && (
                <Button onClick={() => setShowSubmitDialog(true)} className="bg-black hover:bg-gray-800">
                  <Send className="h-4 w-4 mr-2" />
                  Submit for Approval
                </Button>
              )}
              
              {/* Withdraw (only for pending) */}
              {workoutPlan.status === 'pending' && (
                <Button onClick={() => setShowWithdrawDialog(true)} variant="outline" className="border-yellow-300 text-yellow-700 hover:bg-yellow-50">
                  <X className="h-4 w-4 mr-2" />
                  Withdraw
                </Button>
              )}
              
              {/* Edit (always available) */}
              <Button variant="outline" onClick={() => setIsEditing(true)}>
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </Button>
              
              {/* Delete (only for draft and rejected) */}
              {(workoutPlan.status === 'draft' || workoutPlan.status === 'rejected') && (
                <Button onClick={() => setShowDeleteDialog(true)} variant="outline" className="border-red-300 text-red-700 hover:bg-red-50">
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </Button>
              )}
            </>
          )}
        </div>
      </div>

      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-4">
            <p className="text-red-600 text-sm">{error}</p>
          </CardContent>
        </Card>
      )}

      {/* Rejection Reason Alert */}
      {workoutPlan.status === 'rejected' && workoutPlan.rejectionReason && (
        <Card className="border-red-200 bg-red-50 dark:bg-red-950/20 mb-4">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <h4 className="text-sm font-semibold text-red-700 dark:text-red-300 mb-1">
                  Workout Plan Rejected
                </h4>
                <p className="text-sm text-red-600 dark:text-red-400 mb-2">
                  Your workout plan was rejected by the admin. Please address the following feedback and resubmit:
                </p>
                <div className="p-3 bg-white dark:bg-red-950/30 rounded border border-red-200 dark:border-red-800">
                  <p className="text-sm text-gray-900 dark:text-gray-200">{workoutPlan.rejectionReason}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Workout Plan Details */}
          <Card className="border-2 border-gray-100 dark:border-gray-800 shadow-lg">
            <CardHeader className="border-b border-gray-100 dark:border-gray-800">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Dumbbell className="h-5 w-5 text-purple-600" />
                <span>Workout Plan Details</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              {isEditing ? (
                <div className="space-y-6">
                  <div>
                    <Label htmlFor="title">Title</Label>
                    <Input
                      id="title"
                      value={editForm.title || ''}
                      onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                      placeholder="Enter workout plan title"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={editForm.description || ''}
                      onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                      placeholder="Enter workout plan description"
                      rows={4}
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Difficulty</Label>
                      <Select value={editForm.difficulty} onValueChange={(v) => setEditForm({ ...editForm, difficulty: v as any })}>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select difficulty" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="beginner">Beginner</SelectItem>
                          <SelectItem value="intermediate">Intermediate</SelectItem>
                          <SelectItem value="advanced">Advanced</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <Label>Category</Label>
                      <Select value={editForm.category} onValueChange={(v) => setEditForm({ ...editForm, category: v as any })}>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="cardio">Cardio</SelectItem>
                          <SelectItem value="strength">Strength</SelectItem>
                          <SelectItem value="yoga">Yoga</SelectItem>
                          <SelectItem value="nutrition">Nutrition</SelectItem>
                          <SelectItem value="wellness">Wellness</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              ) : (
                <>
                  <div className="space-y-4">
                    <div className="p-4 bg-gradient-to-r from-gray-50 to-blue-50 dark:from-gray-800 dark:to-blue-950/20 rounded-lg border border-gray-200 dark:border-gray-700">
                      <h3 className="font-bold text-xl mb-3 text-gray-900 dark:text-white">{workoutPlan.title}</h3>
                      {workoutPlan.description && (
                        <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap leading-relaxed">{workoutPlan.description}</p>
                      )}
                    </div>
                    
                    {/* Quick Stats */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="text-center p-3 bg-purple-50 dark:bg-purple-950/20 rounded-lg border border-purple-200 dark:border-purple-800">
                        <Dumbbell className="h-5 w-5 mx-auto text-purple-600 dark:text-purple-400 mb-1" />
                        <div className="text-lg font-bold text-purple-700 dark:text-purple-300">{workoutPlan.totalExercises || 0}</div>
                        <div className="text-xs text-purple-600 dark:text-purple-400">Exercises</div>
                      </div>
                      <div className="text-center p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-800">
                        <Clock className="h-5 w-5 mx-auto text-blue-600 dark:text-blue-400 mb-1" />
                        <div className="text-lg font-bold text-blue-700 dark:text-blue-300">{workoutPlan.estimatedDuration || 0}</div>
                        <div className="text-xs text-blue-600 dark:text-blue-400">Minutes</div>
                      </div>
                      <div className="text-center p-3 bg-green-50 dark:bg-green-950/20 rounded-lg border border-green-200 dark:border-green-800">
                        <Calendar className="h-5 w-5 mx-auto text-green-600 dark:text-green-400 mb-1" />
                        <div className="text-sm font-bold text-green-700 dark:text-green-300">
                          {new Date(workoutPlan.createdAt).toLocaleDateString()}
                        </div>
                        <div className="text-xs text-green-600 dark:text-green-400">Created</div>
                      </div>
                      <div className="text-center p-3 bg-orange-50 dark:bg-orange-950/20 rounded-lg border border-orange-200 dark:border-orange-800">
                        <Tag className="h-5 w-5 mx-auto text-orange-600 dark:text-orange-400 mb-1" />
                        <div className="text-sm font-bold text-orange-700 dark:text-orange-300 capitalize">
                          {workoutPlan.category || 'N/A'}
                        </div>
                        <div className="text-xs text-orange-600 dark:text-orange-400">Category</div>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Exercises Section */}
          {workoutPlan.exercises && workoutPlan.exercises.length > 0 && (
            <Card className="border-2 border-gray-100 dark:border-gray-800 shadow-lg">
              <CardHeader className="border-b border-gray-100 dark:border-gray-800">
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-lg">
                    <Dumbbell className="h-5 w-5 text-purple-600" />
                    <span>Exercises ({workoutPlan.exercises.length})</span>
                  </div>
                  {isEditing && (
                    <Button onClick={handleAddExercise} size="sm">
                      <Plus className="h-4 w-4 mr-2" />
                      Add Exercise
                    </Button>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-4">
                  {workoutPlan.exercises.map((exercise, index) => (
                    <div key={exercise.id} className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className="flex items-center justify-center w-8 h-8 bg-purple-100 dark:bg-purple-900/30 rounded-full text-sm font-bold text-purple-700 dark:text-purple-300">
                            {exercise.order || index + 1}
                          </div>
                          <div>
                            <h4 className="font-semibold text-gray-900 dark:text-white">{exercise.name}</h4>
                            {exercise.category && (
                              <Badge variant="outline" className="mt-1 bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-950/20 dark:text-orange-400 dark:border-orange-800">
                                {exercise.category}
                              </Badge>
                            )}
                          </div>
                        </div>
                        {isEditing && (
                          <div className="flex items-center gap-2">
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => handleEditExercise(exercise)}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => handleDeleteExercise(exercise)}
                              className="text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        )}
                      </div>
                      
                      {exercise.description && (
                        <p className="text-gray-600 dark:text-gray-400 text-sm mb-3">{exercise.description}</p>
                      )}
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        {exercise.sets && (
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                            <span className="font-medium text-gray-700 dark:text-gray-300">Sets:</span>
                            <span className="text-gray-600 dark:text-gray-400">{exercise.sets}</span>
                          </div>
                        )}
                        {exercise.reps && (
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                            <span className="font-medium text-gray-700 dark:text-gray-300">Reps:</span>
                            <span className="text-gray-600 dark:text-gray-400">{exercise.reps}</span>
                          </div>
                        )}
                        {exercise.weight && (
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                            <span className="font-medium text-gray-700 dark:text-gray-300">Weight:</span>
                            <span className="text-gray-600 dark:text-gray-400">{exercise.weight} lbs</span>
                          </div>
                        )}
                        {exercise.duration && (
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                            <span className="font-medium text-gray-700 dark:text-gray-300">Duration:</span>
                            <span className="text-gray-600 dark:text-gray-400">{exercise.duration}s</span>
                          </div>
                        )}
                        {exercise.restTime && (
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                            <span className="font-medium text-gray-700 dark:text-gray-300">Rest:</span>
                            <span className="text-gray-600 dark:text-gray-400">{exercise.restTime}s</span>
                          </div>
                        )}
                        {exercise.equipment && (
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-indigo-500 rounded-full"></div>
                            <span className="font-medium text-gray-700 dark:text-gray-300">Equipment:</span>
                            <span className="text-gray-600 dark:text-gray-400">{exercise.equipment}</span>
                          </div>
                        )}
                      </div>
                      
                      {exercise.muscleGroups && exercise.muscleGroups.length > 0 && (
                        <div className="mt-3">
                          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Muscle Groups:</span>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {exercise.muscleGroups.map((muscle, idx) => (
                              <Badge key={idx} variant="outline" className="text-xs bg-teal-50 text-teal-700 border-teal-200 dark:bg-teal-950/20 dark:text-teal-400 dark:border-teal-800">
                                {muscle}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      {exercise.notes && (
                        <div className="mt-3 p-2 bg-blue-50 dark:bg-blue-950/20 rounded border border-blue-200 dark:border-blue-800">
                          <span className="text-sm font-medium text-blue-700 dark:text-blue-300">Notes:</span>
                          <p className="text-sm text-blue-600 dark:text-blue-400 mt-1">{exercise.notes}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* No Exercises State */}
          {(!workoutPlan.exercises || workoutPlan.exercises.length === 0) && (
            <Card className="border-2 border-gray-100 dark:border-gray-800 shadow-lg">
              <CardHeader className="border-b border-gray-100 dark:border-gray-800">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Dumbbell className="h-5 w-5 text-purple-600" />
                  <span>Exercises</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="text-center py-8">
                  <Dumbbell className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No exercises yet</h3>
                  <p className="text-gray-500 dark:text-gray-400 mb-4">This workout plan doesn't have any exercises added yet.</p>
                  <Button onClick={() => router.push(`/trainer/workout-plans/${workoutPlan.id}/edit`)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Exercises
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Settings */}
          <Card className="border-2 border-gray-100 dark:border-gray-800 shadow-lg">
            <CardHeader className="border-b border-gray-100 dark:border-gray-800">
              <CardTitle className="flex items-center gap-2 text-lg">
                <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                  <Tag className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                </div>
                Workout Plan Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              {isEditing ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {workoutPlan.isPublic ? <Globe className="h-4 w-4 text-emerald-500" /> : <Lock className="h-4 w-4 text-slate-500" />}
                      <span className="text-sm">Visibility</span>
                    </div>
                    <Switch
                      checked={editForm.isPublic || false}
                      onCheckedChange={(checked) => setEditForm({ ...editForm, isPublic: checked })}
                    />
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {workoutPlan.isPublic ? <Globe className="h-4 w-4 text-emerald-500" /> : <Lock className="h-4 w-4 text-slate-500" />}
                      <span className="text-sm">Visibility</span>
                    </div>
                    <Badge 
                      className={
                        workoutPlan.isPublic ? 
                        'bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-800' :
                        'bg-slate-100 text-slate-800 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700'
                      }
                    >
                      {workoutPlan.isPublic ? 'Public' : 'Private'}
                    </Badge>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Workout Plan Info */}
          <Card className="border-2 border-gray-100 dark:border-gray-800 shadow-lg">
            <CardHeader className="border-b border-gray-100 dark:border-gray-800">
              <CardTitle className="flex items-center gap-2 text-lg">
                <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg">
                  <Dumbbell className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                </div>
                Workout Plan Info
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-2 mb-3">
                  <Tag className="h-4 w-4 text-indigo-500" />
                  <span className="font-medium text-gray-700 dark:text-gray-300">Difficulty Level</span>
                </div>
                <Badge 
                  className={
                    workoutPlan.difficulty === 'beginner' ? 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800' :
                    workoutPlan.difficulty === 'intermediate' ? 'bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-800' :
                    'bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-900/20 dark:text-purple-400 dark:border-purple-800'
                  }
                >
                  {workoutPlan.difficulty}
                </Badge>
              </div>
              
              {workoutPlan.tags && workoutPlan.tags.length > 0 && (
                <div className="space-y-3">
                  <h4 className="font-medium text-gray-700 dark:text-gray-300">Tags</h4>
                  <div className="flex flex-wrap gap-2">
                    {workoutPlan.tags.map((tag, index) => (
                      <Badge key={index} variant="outline" className="bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-950/20 dark:text-orange-400 dark:border-orange-800">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Exercise Form Dialog */}
      <Dialog open={showExerciseDialog} onOpenChange={setShowExerciseDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingExercise ? 'Edit Exercise' : 'Add New Exercise'}
            </DialogTitle>
            <DialogDescription>
              {editingExercise ? 'Update the exercise details below.' : 'Fill in the details for the new exercise.'}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="exerciseName">Exercise Name</Label>
                <Input
                  id="exerciseName"
                  value={exerciseForm.name || ''}
                  onChange={(e) => setExerciseForm({ ...exerciseForm, name: e.target.value })}
                  placeholder="Enter exercise name"
                />
              </div>
              <div>
                <Label htmlFor="exerciseOrder">Order</Label>
                <Input
                  id="exerciseOrder"
                  type="number"
                  value={exerciseForm.order?.toString() || ''}
                  onChange={(e) => setExerciseForm({ ...exerciseForm, order: parseInt(e.target.value) || 0 })}
                  placeholder="Exercise order"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="exerciseDescription">Description</Label>
              <Textarea
                id="exerciseDescription"
                value={exerciseForm.description || ''}
                onChange={(e) => setExerciseForm({ ...exerciseForm, description: e.target.value })}
                placeholder="Enter exercise description"
                rows={3}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="exerciseCategory">Category</Label>
                <Select value={exerciseForm.category || ''} onValueChange={(value) => setExerciseForm({ ...exerciseForm, category: value })}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="strength">Strength</SelectItem>
                    <SelectItem value="cardio">Cardio</SelectItem>
                    <SelectItem value="flexibility">Flexibility</SelectItem>
                    <SelectItem value="balance">Balance</SelectItem>
                    <SelectItem value="endurance">Endurance</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <Label htmlFor="exerciseSets">Sets</Label>
                <Input
                  id="exerciseSets"
                  type="number"
                  value={exerciseForm.sets?.toString() || ''}
                  onChange={(e) => setExerciseForm({ ...exerciseForm, sets: parseInt(e.target.value) || 0 })}
                  placeholder="Sets"
                />
              </div>
              <div>
                <Label htmlFor="exerciseReps">Reps</Label>
                <Input
                  id="exerciseReps"
                  type="number"
                  value={exerciseForm.reps?.toString() || ''}
                  onChange={(e) => setExerciseForm({ ...exerciseForm, reps: e.target.value })}
                  placeholder="Reps"
                />
              </div>
              <div>
                <Label htmlFor="exerciseWeight">Weight (lbs)</Label>
                <Input
                  id="exerciseWeight"
                  type="number"
                  value={exerciseForm.weight?.toString() || ''}
                  onChange={(e) => setExerciseForm({ ...exerciseForm, weight: e.target.value })}
                  placeholder="Weight"
                />
              </div>
              <div>
                <Label htmlFor="exerciseDuration">Duration (sec)</Label>
                <Input
                  id="exerciseDuration"
                  type="number"
                  value={exerciseForm.duration?.toString() || ''}
                  onChange={(e) => setExerciseForm({ ...exerciseForm, duration: parseInt(e.target.value) || 0 })}
                  placeholder="Duration"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="exerciseRestTime">Rest Time (sec)</Label>
              <Input
                id="exerciseRestTime"
                type="number"
                value={exerciseForm.restTime?.toString() || ''}
                onChange={(e) => setExerciseForm({ ...exerciseForm, restTime: parseInt(e.target.value) || 0 })}
                placeholder="Rest time"
              />
            </div>

            <div>
              <Label>Muscle Groups</Label>
              <div className="flex flex-wrap gap-2 mt-2">
                {[
                  'chest', 'back', 'shoulders', 'biceps', 'triceps', 'forearms', 'abs',
                  'obliques', 'lower back', 'glutes', 'quadriceps', 'hamstrings', 'calves',
                  'traps', 'lats', 'delts'
                ].map((muscle) => {
                  const isSelected = Array.isArray(exerciseForm.muscleGroups) && exerciseForm.muscleGroups.includes(muscle)
                  return (
                    <Badge
                      key={muscle}
                      variant={isSelected ? "default" : "outline"}
                      className="cursor-pointer"
                      onClick={() => {
                        const currentGroups = Array.isArray(exerciseForm.muscleGroups) ? exerciseForm.muscleGroups : []
                        const newGroups = isSelected
                          ? currentGroups.filter(g => g !== muscle)
                          : [...currentGroups, muscle]
                        setExerciseForm({ ...exerciseForm, muscleGroups: newGroups })
                      }}
                    >
                      {muscle}
                    </Badge>
                  )
                })}
              </div>
            </div>

            <div>
              <Label htmlFor="equipment">Equipment</Label>
              <Select value={exerciseForm.equipment || ''} onValueChange={(value) => setExerciseForm({ ...exerciseForm, equipment: value })}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select equipment" />
                </SelectTrigger>
                <SelectContent>
                  {[
                    'dumbbells', 'barbell', 'kettlebell', 'resistance bands', 'bodyweight',
                    'pull-up bar', 'bench', 'cable machine', 'treadmill', 'bike',
                    'yoga mat', 'medicine ball', 'foam roller', 'other'
                  ].map((equipment) => (
                    <SelectItem key={equipment} value={equipment}>
                      {equipment}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="exerciseNotes">Notes</Label>
              <Textarea
                id="exerciseNotes"
                value={exerciseForm.notes || ''}
                onChange={(e) => setExerciseForm({ ...exerciseForm, notes: e.target.value })}
                placeholder="Additional notes or instructions"
                rows={2}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowExerciseDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveExercise} disabled={exerciseSaving}>
              {exerciseSaving ? 'Saving...' : (editingExercise ? 'Update Exercise' : 'Add Exercise')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Workout Plan</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "{workoutPlan.title}"? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete} disabled={saving}>
              {saving ? 'Deleting...' : 'Delete'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Submit Confirmation Dialog */}
      <Dialog open={showSubmitDialog} onOpenChange={setShowSubmitDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Submit for Approval</DialogTitle>
            <DialogDescription>
              Are you sure you want to submit "{workoutPlan.title}" for approval? Once submitted, you won&apos;t be able to edit it until it&apos;s reviewed by an admin.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowSubmitDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={submitting} className="bg-blue-600 hover:bg-blue-700">
              {submitting ? 'Submitting...' : 'Submit for Approval'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Withdraw Confirmation Dialog */}
      <Dialog open={showWithdrawDialog} onOpenChange={setShowWithdrawDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Withdraw Submission</DialogTitle>
            <DialogDescription>
              Are you sure you want to withdraw "{workoutPlan.title}" from review? You&apos;ll be able to make edits and resubmit it later.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowWithdrawDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleWithdraw} disabled={withdrawing} className="bg-yellow-600 hover:bg-yellow-700">
              {withdrawing ? 'Withdrawing...' : 'Withdraw'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Warning Dialog */}
      <Dialog open={showEditWarningDialog} onOpenChange={setShowEditWarningDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Approved Workout Plan</DialogTitle>
            <DialogDescription>
              This workout plan is approved. Editing it will change the status to draft and require re-approval. Are you sure you want to continue?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditWarningDialog(false)}>
              Cancel
            </Button>
            <Button onClick={performSave} disabled={saving}>
              {saving ? 'Saving...' : 'Continue & Save'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
