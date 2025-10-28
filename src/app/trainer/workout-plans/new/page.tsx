'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { apiClient, type WorkoutPlan, type WorkoutExercise, type Language } from '@/lib/api-client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { useAuth } from '@/contexts/auth-context'
import { 
  ArrowLeft, 
  Save, 
  Plus, 
  Trash2, 
  GripVertical,
  Clock,
  Dumbbell,
  Target,
  Weight,
  Timer,
  Edit
} from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

interface ExerciseFormData {
  name: string
  description: string
  category: string
  muscleGroups: string[]
  equipment: string
  sets: number
  reps: string
  weight: string
  duration: number
  restTime: number
  notes: string
}

const MUSCLE_GROUPS = [
  'chest', 'back', 'shoulders', 'biceps', 'triceps', 'forearms',
  'abs', 'obliques', 'lower back', 'glutes', 'quadriceps', 
  'hamstrings', 'calves', 'traps', 'lats', 'delts'
]

const EQUIPMENT_OPTIONS = [
  'bodyweight', 'dumbbells', 'barbell', 'kettlebell', 'resistance bands',
  'cable machine', 'smith machine', 'pull-up bar', 'bench', 'yoga mat'
]

const EXERCISE_CATEGORIES = [
  'strength', 'cardio', 'flexibility', 'plyometric', 'isometric', 'endurance'
]

export default function NewWorkoutPlanPage() {
  const router = useRouter()
  const { user, isLoading } = useAuth()
  const [returnToContentUpload, setReturnToContentUpload] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [languages, setLanguages] = useState<Language[] | null>(null)
  const [showExerciseDialog, setShowExerciseDialog] = useState(false)
  const [editingExercise, setEditingExercise] = useState<WorkoutExercise | null>(null)
  const [exerciseForm, setExerciseForm] = useState<ExerciseFormData>({
    name: '',
    description: '',
    category: '',
    muscleGroups: [],
    equipment: '',
    sets: 1,
    reps: '',
    weight: '',
    duration: 0,
    restTime: 60,
    notes: ''
  })

  const [workoutPlan, setWorkoutPlan] = useState<Partial<WorkoutPlan>>({
    title: '',
    description: '',
    difficulty: 'beginner',
    category: '',
    language: '',
    tags: [],
    isPublic: true
  })

  const [exercises, setExercises] = useState<WorkoutExercise[]>([])

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
    // Check if we should return to content upload after creating workout plan
    const urlParams = new URLSearchParams(window.location.search)
    if (urlParams.get('returnTo') === 'content-upload') {
      setReturnToContentUpload(true)
    }
  }, [])

  useEffect(() => {
    async function loadLanguages() {
      try {
        const res = await apiClient.getLanguages()
        if (res.success && res.data) {
          setLanguages(res.data)
        }
      } catch (err) {
        console.error('Failed to load languages:', err)
      }
    }
    loadLanguages()
  }, [])

  const handleSave = async () => {
    if (!workoutPlan.title) {
      setError('Title is required')
      return
    }

    setSaving(true)
    setError(null)

    try {
      // Create the workout plan - filter out undefined values and add calculated duration
      const calculatedDuration = Math.round(calculateTotalDuration() / 60)
      const workoutPlanData = {
        ...Object.fromEntries(
          Object.entries(workoutPlan).filter(([_, value]) => value !== undefined)
        ),
        estimatedDuration: calculatedDuration > 0 ? calculatedDuration : undefined,
        totalExercises: exercises.length
      }
      const createRes = await apiClient.createTrainerWorkoutPlan(workoutPlanData)
      if (!createRes.success || !createRes.data) {
        throw new Error(createRes.error?.message || 'Failed to create workout plan')
      }

      const createdWorkoutPlan = createRes.data.workoutPlan

      // Add exercises
      for (let i = 0; i < exercises.length; i++) {
        const exercise = exercises[i]
        const exerciseRes = await apiClient.addWorkoutExercise(createdWorkoutPlan.id, {
          ...exercise,
          order: i + 1
        })
        if (!exerciseRes.success) {
          throw new Error(`Failed to add exercise: ${exercise.name}`)
        }
      }

      if (returnToContentUpload) {
        // Redirect to content upload with the workout plan ID
        router.push(`/trainer/content/upload?workoutPlanId=${createdWorkoutPlan.id}&type=workout_plan`)
      } else {
        router.push('/trainer/workout-plans')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save workout plan')
    } finally {
      setSaving(false)
    }
  }

  const handleAddExercise = () => {
    if (!exerciseForm.name) {
      setError('Exercise name is required')
      return
    }

    const newExercise: WorkoutExercise = {
      id: Date.now(), // Temporary ID for local state
      workoutPlanId: 0, // Will be set when saved
      name: exerciseForm.name,
      description: exerciseForm.description,
      category: exerciseForm.category,
      muscleGroups: exerciseForm.muscleGroups,
      equipment: exerciseForm.equipment,
      sets: exerciseForm.sets,
      reps: exerciseForm.reps,
      weight: exerciseForm.weight,
      duration: exerciseForm.duration,
      restTime: exerciseForm.restTime,
      order: exercises.length + 1,
      notes: exerciseForm.notes,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    setExercises([...exercises, newExercise])
    setShowExerciseDialog(false)
    resetExerciseForm()
  }

  const handleEditExercise = (exercise: WorkoutExercise) => {
    setEditingExercise(exercise)
    setExerciseForm({
      name: exercise.name,
      description: exercise.description || '',
      category: exercise.category || '',
      muscleGroups: exercise.muscleGroups,
      equipment: exercise.equipment || '',
      sets: exercise.sets || 1,
      reps: exercise.reps || '',
      weight: exercise.weight || '',
      duration: exercise.duration || 0,
      restTime: exercise.restTime || 60,
      notes: exercise.notes || ''
    })
    setShowExerciseDialog(true)
  }

  const handleUpdateExercise = () => {
    if (!editingExercise || !exerciseForm.name) {
      setError('Exercise name is required')
      return
    }

    const updatedExercise = {
      ...editingExercise,
      name: exerciseForm.name,
      description: exerciseForm.description,
      category: exerciseForm.category,
      muscleGroups: exerciseForm.muscleGroups,
      equipment: exerciseForm.equipment,
      sets: exerciseForm.sets,
      reps: exerciseForm.reps,
      weight: exerciseForm.weight,
      duration: exerciseForm.duration,
      restTime: exerciseForm.restTime,
      notes: exerciseForm.notes
    }

    setExercises(exercises.map(ex => ex.id === editingExercise.id ? updatedExercise : ex))
    setShowExerciseDialog(false)
    setEditingExercise(null)
    resetExerciseForm()
  }

  const handleDeleteExercise = (exerciseId: number) => {
    setExercises(exercises.filter(ex => ex.id !== exerciseId))
  }

  const resetExerciseForm = () => {
    setExerciseForm({
      name: '',
      description: '',
      category: '',
      muscleGroups: [],
      equipment: '',
      sets: 1,
      reps: '',
      weight: '',
      duration: 0,
      restTime: 60,
      notes: ''
    })
  }

  const toggleMuscleGroup = (muscleGroup: string) => {
    setExerciseForm(prev => ({
      ...prev,
      muscleGroups: prev.muscleGroups.includes(muscleGroup)
        ? prev.muscleGroups.filter(mg => mg !== muscleGroup)
        : [...prev.muscleGroups, muscleGroup]
    }))
  }

  const calculateTotalDuration = () => {
    return exercises.reduce((total, exercise) => {
      const exerciseTime = (exercise.sets || 1) * ((exercise.duration || 0) + (exercise.restTime || 60))
      return total + exerciseTime
    }, 0)
  }

  if (isLoading) {
    return <div>Loading...</div>
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.push('/trainer/workout-plans')}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">New Workout Plan</h1>
            <p className="text-gray-600">Create a structured workout plan with exercises</p>
          </div>
        </div>
        <Button onClick={handleSave} disabled={saving}>
          <Save className="h-4 w-4 mr-2" />
          {saving ? 'Saving...' : 'Save Workout Plan'}
        </Button>
      </div>

      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-4">
            <p className="text-red-600">{error}</p>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Workout Plan Details */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Workout Plan Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                value={workoutPlan.title}
                onChange={(e) => setWorkoutPlan(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Enter workout plan title"
              />
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={workoutPlan.description}
                onChange={(e) => setWorkoutPlan(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Describe the workout plan"
                rows={3}
              />
            </div>

            <div>
              <Label htmlFor="difficulty">Difficulty</Label>
              <Select value={workoutPlan.difficulty} onValueChange={(value) => setWorkoutPlan(prev => ({ ...prev, difficulty: value as any }))}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="beginner">Beginner</SelectItem>
                  <SelectItem value="intermediate">Intermediate</SelectItem>
                  <SelectItem value="advanced">Advanced</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="category">Category</Label>
              <Input
                id="category"
                value={workoutPlan.category}
                onChange={(e) => setWorkoutPlan(prev => ({ ...prev, category: e.target.value }))}
                placeholder="e.g., Strength Training, Cardio"
              />
            </div>

            <div>
              <Label htmlFor="language">Language</Label>
              <Select value={workoutPlan.language} onValueChange={(value) => setWorkoutPlan(prev => ({ ...prev, language: value }))}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select language" />
                </SelectTrigger>
                <SelectContent>
                  {languages?.map((lang) => (
                    <SelectItem key={lang.id} value={lang.code}>
                      {lang.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Estimated Duration</Label>
              <div className="flex items-center gap-2 p-3 bg-gray-50 dark:bg-gray-800 rounded-md">
                <Clock className="h-4 w-4 text-gray-500" />
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {Math.round(calculateTotalDuration() / 60)} minutes (auto-calculated from exercises)
                </span>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="isPublic"
                checked={workoutPlan.isPublic}
                onCheckedChange={(checked) => setWorkoutPlan(prev => ({ ...prev, isPublic: checked }))}
              />
              <Label htmlFor="isPublic">Make this workout plan public</Label>
            </div>
          </CardContent>
        </Card>

        {/* Exercises */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Exercises ({exercises.length})</CardTitle>
              <Button onClick={() => setShowExerciseDialog(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add Exercise
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {exercises.length > 0 ? (
              <div className="space-y-4">
                {exercises.map((exercise, index) => (
                  <div key={exercise.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <GripVertical className="h-4 w-4 text-gray-400" />
                        <span className="font-medium">{exercise.name}</span>
                        <Badge variant="outline">{exercise.category}</Badge>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEditExercise(exercise)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteExercise(exercise.id)}
                          className="text-red-600"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    
                    {exercise.description && (
                      <p className="text-sm text-gray-600 mb-2">{exercise.description}</p>
                    )}

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      {exercise.sets && (
                        <div className="flex items-center gap-1">
                          <Target className="h-3 w-3 text-gray-400" />
                          <span>{exercise.sets} sets</span>
                        </div>
                      )}
                      {exercise.reps && (
                        <div className="flex items-center gap-1">
                          <Dumbbell className="h-3 w-3 text-gray-400" />
                          <span>{exercise.reps} reps</span>
                        </div>
                      )}
                      {exercise.weight && (
                        <div className="flex items-center gap-1">
                          <Weight className="h-3 w-3 text-gray-400" />
                          <span>{exercise.weight}</span>
                        </div>
                      )}
                      {exercise.duration && (
                        <div className="flex items-center gap-1">
                          <Timer className="h-3 w-3 text-gray-400" />
                          <span>{exercise.duration}s</span>
                        </div>
                      )}
                    </div>

                    {exercise.muscleGroups.length > 0 && (
                      <div className="mt-2">
                        <div className="flex flex-wrap gap-1">
                          {exercise.muscleGroups.map((muscle) => (
                            <Badge key={muscle} variant="secondary" className="text-xs">
                              {muscle}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
                
                <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Clock className="h-4 w-4" />
                    <span>Estimated total duration: {Math.round(calculateTotalDuration() / 60)} minutes</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <Dumbbell className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No exercises yet</h3>
                <p className="text-gray-500 mb-4">Add exercises to build your workout plan.</p>
                <Button onClick={() => setShowExerciseDialog(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add First Exercise
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Exercise Dialog */}
      <Dialog open={showExerciseDialog} onOpenChange={setShowExerciseDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingExercise ? 'Edit Exercise' : 'Add Exercise'}
            </DialogTitle>
            <DialogDescription>
              {editingExercise ? 'Update the exercise details' : 'Add a new exercise to your workout plan'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="exerciseName">Exercise Name *</Label>
                <Input
                  id="exerciseName"
                  value={exerciseForm.name}
                  onChange={(e) => setExerciseForm(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="e.g., Push-ups"
                />
              </div>
              <div>
                <Label htmlFor="exerciseCategory">Category</Label>
                <Select value={exerciseForm.category} onValueChange={(value) => setExerciseForm(prev => ({ ...prev, category: value }))}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {EXERCISE_CATEGORIES.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="exerciseDescription">Description</Label>
              <Textarea
                id="exerciseDescription"
                value={exerciseForm.description}
                onChange={(e) => setExerciseForm(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Describe how to perform this exercise"
                rows={2}
              />
            </div>

            <div>
              <Label>Muscle Groups</Label>
              <div className="flex flex-wrap gap-2 mt-2">
                {MUSCLE_GROUPS.map((muscle) => (
                  <Badge
                    key={muscle}
                    variant={exerciseForm.muscleGroups.includes(muscle) ? "default" : "outline"}
                    className="cursor-pointer"
                    onClick={() => toggleMuscleGroup(muscle)}
                  >
                    {muscle}
                  </Badge>
                ))}
              </div>
            </div>

            <div>
              <Label htmlFor="equipment">Equipment</Label>
              <Select value={exerciseForm.equipment} onValueChange={(value) => setExerciseForm(prev => ({ ...prev, equipment: value }))}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select equipment" />
                </SelectTrigger>
                <SelectContent>
                  {EQUIPMENT_OPTIONS.map((equipment) => (
                    <SelectItem key={equipment} value={equipment}>
                      {equipment}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <Label htmlFor="sets">Sets</Label>
                <Input
                  id="sets"
                  type="number"
                  value={exerciseForm.sets}
                  onChange={(e) => setExerciseForm(prev => ({ ...prev, sets: parseInt(e.target.value) || 1 }))}
                  min="1"
                />
              </div>
              <div>
                <Label htmlFor="reps">Reps</Label>
                <Input
                  id="reps"
                  value={exerciseForm.reps}
                  onChange={(e) => setExerciseForm(prev => ({ ...prev, reps: e.target.value }))}
                  placeholder="e.g., 10-12"
                />
              </div>
              <div>
                <Label htmlFor="weight">Weight</Label>
                <Input
                  id="weight"
                  value={exerciseForm.weight}
                  onChange={(e) => setExerciseForm(prev => ({ ...prev, weight: e.target.value }))}
                  placeholder="e.g., 20 lbs"
                />
              </div>
              <div>
                <Label htmlFor="duration">Duration (seconds)</Label>
                <Input
                  id="duration"
                  type="number"
                  value={exerciseForm.duration}
                  onChange={(e) => setExerciseForm(prev => ({ ...prev, duration: parseInt(e.target.value) || 0 }))}
                  min="0"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="restTime">Rest Time (seconds)</Label>
                <Input
                  id="restTime"
                  type="number"
                  value={exerciseForm.restTime}
                  onChange={(e) => setExerciseForm(prev => ({ ...prev, restTime: parseInt(e.target.value) || 60 }))}
                  min="0"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="exerciseNotes">Notes</Label>
              <Textarea
                id="exerciseNotes"
                value={exerciseForm.notes}
                onChange={(e) => setExerciseForm(prev => ({ ...prev, notes: e.target.value }))}
                placeholder="Additional notes or tips"
                rows={2}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setShowExerciseDialog(false)
              setEditingExercise(null)
              resetExerciseForm()
            }}>
              Cancel
            </Button>
            <Button onClick={editingExercise ? handleUpdateExercise : handleAddExercise}>
              {editingExercise ? 'Update Exercise' : 'Add Exercise'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
