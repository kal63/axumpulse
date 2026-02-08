'use client'

import { useState, useEffect, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { 
  ArrowLeft,
  Plus,
  Loader2,
  Eye,
  Target,
  Award,
  AlertCircle,
  CheckCircle2,
  XCircle,
  Minus
} from 'lucide-react'
import { toast } from 'sonner'
import { apiClient, type Game, type WorkoutPlan } from '@/lib/api-client'
import { usePaginatedData } from '@/hooks/usePaginatedData'
import { PaginatedTable } from '@/components/pagination/PaginatedTable'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

export default function GameChallengesPage() {
  const params = useParams()
  const router = useRouter()
  const gameId = parseInt(params.id as string)
  
  const [game, setGame] = useState<Game | null>(null)
  const [isLoadingGame, setIsLoadingGame] = useState(true)
  const [selectedWorkoutPlan, setSelectedWorkoutPlan] = useState<WorkoutPlan | null>(null)
  const [isWorkoutPlanModalOpen, setIsWorkoutPlanModalOpen] = useState(false)
  const [actionLoading, setActionLoading] = useState<number | null>(null)
  
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [categoryFilter, setCategoryFilter] = useState<string>('all')
  const [difficultyFilter, setDifficultyFilter] = useState<string>('all')
  const [showAddedOnly, setShowAddedOnly] = useState(false)

  // Fetch game details
  useEffect(() => {
    const fetchGame = async () => {
      try {
        setIsLoadingGame(true)
        const response = await apiClient.getAdminGame(gameId)
        if (response.success && response.data) {
          setGame(response.data.game)
        } else {
          toast.error('Failed to load game')
          router.push('/admin/games')
        }
      } catch (error) {
        toast.error('Failed to load game')
        router.push('/admin/games')
      } finally {
        setIsLoadingGame(false)
      }
    }

    if (gameId) {
      fetchGame()
    }
  }, [gameId, router])

  // Fetch workout plans - show added ones (isGameChallenge: true) or all
  const fetchWorkoutPlans = useCallback(async (params: any) => {
    const fetchParams = {
      ...params,
      q: searchQuery || undefined,
      status: statusFilter !== 'all' ? statusFilter : undefined,
      difficulty: difficultyFilter !== 'all' ? difficultyFilter : undefined
    }
    const response = await apiClient.getAdminWorkoutPlans(fetchParams)
    if (response.success && response.data) {
      // Filter based on showAddedOnly and category
      let workoutPlans = response.data.items || []
      if (categoryFilter !== 'all') {
        workoutPlans = workoutPlans.filter((wp: WorkoutPlan) => wp.category === categoryFilter)
      }
      if (showAddedOnly) {
        workoutPlans = workoutPlans.filter((wp: WorkoutPlan) => wp.isGameChallenge === true)
      }
      return {
        items: workoutPlans,
        pagination: response.data.pagination || {
          page: 1,
          pageSize: workoutPlans.length,
          totalItems: workoutPlans.length,
          totalPages: 1,
          hasNext: false,
          hasPrev: false
        }
      }
    }
    throw new Error(response.error?.message || 'Failed to fetch workout plans')
  }, [searchQuery, statusFilter, categoryFilter, difficultyFilter, showAddedOnly])

  const {
    data: workoutPlans,
    pagination,
    loading: isLoadingWorkoutPlans,
    refetch: refetchWorkoutPlans
  } = usePaginatedData<WorkoutPlan>({
    fetchFunction: fetchWorkoutPlans,
    initialPage: 1,
    initialPageSize: 100
  })

  // Separate added and available workout plans
  const addedWorkoutPlans = workoutPlans.filter(wp => wp.isGameChallenge === true)
  const availableWorkoutPlans = workoutPlans.filter(wp => wp.isGameChallenge !== true)

  const handleToggleWorkoutPlan = async (workoutPlanId: number, currentValue: boolean) => {
    try {
      setActionLoading(workoutPlanId)
      const response = await apiClient.updateAdminWorkoutPlan(workoutPlanId, {
        isGameChallenge: !currentValue
      })
      
      if (response.success) {
        toast.success(`Workout plan ${!currentValue ? 'added to' : 'removed from'} game`)
        refetchWorkoutPlans()
      } else {
        toast.error(response.error?.message || 'Failed to update workout plan')
      }
    } catch (error) {
      toast.error('Failed to update workout plan')
    } finally {
      setActionLoading(null)
    }
  }

  const handleViewWorkoutPlan = (workoutPlan: WorkoutPlan) => {
    setSelectedWorkoutPlan(workoutPlan)
    setIsWorkoutPlanModalOpen(true)
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"><CheckCircle2 className="h-3 w-3 mr-1" />Approved</Badge>
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">Pending</Badge>
      case 'draft':
        return <Badge variant="secondary">Draft</Badge>
      case 'rejected':
        return <Badge className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"><XCircle className="h-3 w-3 mr-1" />Rejected</Badge>
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  const getCategoryBadge = (category: string) => {
    const colors: Record<string, string> = {
      fitness: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
      strength: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      cardio: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
      yoga: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
      wellness: 'bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200'
    }
    return <Badge className={colors[category || ''] || 'bg-gray-100 text-gray-800'}>{category || 'Uncategorized'}</Badge>
  }

  const getDifficultyBadge = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner':
        return <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">Beginner</Badge>
      case 'intermediate':
        return <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">Intermediate</Badge>
      case 'advanced':
        return <Badge className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">Advanced</Badge>
      default:
        return <Badge variant="secondary">{difficulty}</Badge>
    }
  }

  if (isLoadingGame) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
      </div>
    )
  }

  if (!game) {
    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2 text-red-600">
              <AlertCircle className="h-5 w-5" />
              <p>Game not found</p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Define columns for workout plans table
  const workoutPlanColumns = [
    {
      key: 'title',
      header: 'Workout Plan',
      render: (workoutPlan: WorkoutPlan) => (
        <div>
          <p className="font-medium">{workoutPlan.title}</p>
          {workoutPlan.description && (
            <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-1">{workoutPlan.description}</p>
          )}
        </div>
      )
    },
    {
      key: 'details',
      header: 'Details',
      render: (workoutPlan: WorkoutPlan) => (
        <div className="space-y-1">
          {getCategoryBadge(workoutPlan.category || '')}
          {getDifficultyBadge(workoutPlan.difficulty || 'beginner')}
        </div>
      )
    },
    {
      key: 'exercises',
      header: 'Exercises',
      render: (workoutPlan: WorkoutPlan) => (
        <div className="text-sm font-medium">
          {workoutPlan.totalExercises || 0} exercises
        </div>
      )
    },
    {
      key: 'status',
      header: 'Status',
      render: (workoutPlan: WorkoutPlan) => getStatusBadge(workoutPlan.status || 'draft')
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (workoutPlan: WorkoutPlan) => (
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleViewWorkoutPlan(workoutPlan)}
          >
            <Eye className="h-4 w-4" />
          </Button>
          {workoutPlan.isGameChallenge ? (
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleToggleWorkoutPlan(workoutPlan.id, true)}
              disabled={actionLoading === workoutPlan.id}
              className="text-red-600 hover:text-red-700"
            >
              {actionLoading === workoutPlan.id ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  <Minus className="h-4 w-4 mr-1" />
                  Remove
                </>
              )}
            </Button>
          ) : (
            <Button
              size="sm"
              onClick={() => handleToggleWorkoutPlan(workoutPlan.id, false)}
              disabled={actionLoading === workoutPlan.id}
            >
              {actionLoading === workoutPlan.id ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <>
                  <Plus className="h-4 w-4 mr-2" />
                  Add to Game
                </>
              )}
            </Button>
          )}
        </div>
      )
    }
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push('/admin/games')}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Games
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{game.title}</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Manage workout plans for Spin & Win game
            </p>
          </div>
        </div>
      </div>

      {/* Game Info Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Target className="h-5 w-5 text-emerald-600" />
            <span>Game Information</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Game Type</p>
              <Badge className="mt-1">Spin & Win</Badge>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Difficulty</p>
              <Badge className="mt-1">{game.difficulty || 'beginner'}</Badge>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Workout Plans Added</p>
              <p className="text-2xl font-bold mt-1">{addedWorkoutPlans.length}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Currently Added Workout Plans */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Award className="h-5 w-5 text-emerald-600" />
            <span>Currently Added Workout Plans ({addedWorkoutPlans.length})</span>
          </CardTitle>
          <CardDescription>
            Workout plans that are currently part of this Spin & Win game
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoadingWorkoutPlans ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
            </div>
          ) : addedWorkoutPlans.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <Target className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No workout plans added yet. Add workout plans from the list below.</p>
            </div>
          ) : (
            <PaginatedTable
              data={addedWorkoutPlans}
              columns={workoutPlanColumns}
              loading={false}
              emptyMessage="No workout plans added"
              currentPage={1}
              totalPages={1}
              pageSize={addedWorkoutPlans.length}
              totalItems={addedWorkoutPlans.length}
              onPageChange={() => {}}
              onPageSizeChange={() => {}}
              showPagination={false}
              showPageSizeSelector={false}
              showInfo={false}
            />
          )}
        </CardContent>
      </Card>

      {/* All Workout Plans */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Plus className="h-5 w-5 text-emerald-600" />
            <span>All Workout Plans</span>
          </CardTitle>
          <CardDescription>
            Select workout plans to add to this Spin & Win game. Toggle the "Add to Game" button to add or remove workout plans.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Filters */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
            <div>
              <Label htmlFor="search">Search</Label>
              <Input
                id="search"
                placeholder="Search workout plans..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="status">Status</Label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="category">Category</Label>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="fitness">Fitness</SelectItem>
                  <SelectItem value="strength">Strength</SelectItem>
                  <SelectItem value="cardio">Cardio</SelectItem>
                  <SelectItem value="yoga">Yoga</SelectItem>
                  <SelectItem value="wellness">Wellness</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="difficulty">Difficulty</Label>
              <Select value={difficultyFilter} onValueChange={setDifficultyFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Difficulties</SelectItem>
                  <SelectItem value="beginner">Beginner</SelectItem>
                  <SelectItem value="intermediate">Intermediate</SelectItem>
                  <SelectItem value="advanced">Advanced</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end">
              <Button
                variant="outline"
                className="w-full"
                onClick={() => {
                  setSearchQuery('')
                  setStatusFilter('all')
                  setCategoryFilter('all')
                  setDifficultyFilter('all')
                  setShowAddedOnly(false)
                }}
              >
                Clear Filters
              </Button>
            </div>
          </div>

          {isLoadingWorkoutPlans ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
            </div>
          ) : workoutPlans.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <AlertCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No workout plans found.</p>
            </div>
          ) : (
            <PaginatedTable
              data={workoutPlans}
              columns={workoutPlanColumns}
              loading={isLoadingWorkoutPlans}
              emptyMessage="No workout plans available"
              currentPage={pagination.pagination.page}
              totalPages={pagination.pagination.totalPages}
              pageSize={pagination.pagination.pageSize}
              totalItems={pagination.pagination.totalItems}
              onPageChange={(page) => {
                pagination.setPage(page)
              }}
              onPageSizeChange={(pageSize) => {
                pagination.setPageSize(pageSize)
              }}
              showPagination={true}
              showPageSizeSelector={true}
              showInfo={true}
            />
          )}
        </CardContent>
      </Card>

      {/* Workout Plan Details Modal */}
      <Dialog open={isWorkoutPlanModalOpen} onOpenChange={setIsWorkoutPlanModalOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{selectedWorkoutPlan?.title}</DialogTitle>
            <DialogDescription>
              Workout plan details and information
            </DialogDescription>
          </DialogHeader>
          
          {selectedWorkoutPlan && (
            <div className="space-y-4">
              <div>
                <Label>Description</Label>
                <p className="text-sm text-gray-700 dark:text-gray-300 mt-1">
                  {selectedWorkoutPlan.description || 'No description provided'}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Category</Label>
                  <div className="mt-1">{getCategoryBadge(selectedWorkoutPlan.category || '')}</div>
                </div>
                <div>
                  <Label>Difficulty</Label>
                  <div className="mt-1">{getDifficultyBadge(selectedWorkoutPlan.difficulty || 'beginner')}</div>
                </div>
                <div>
                  <Label>Total Exercises</Label>
                  <p className="text-sm font-medium mt-1">{selectedWorkoutPlan.totalExercises || 0} exercises</p>
                </div>
                <div>
                  <Label>Status</Label>
                  <div className="mt-1">{getStatusBadge(selectedWorkoutPlan.status || 'draft')}</div>
                </div>
              </div>

              {selectedWorkoutPlan.estimatedDuration && (
                <div>
                  <Label>Estimated Duration</Label>
                  <p className="text-sm text-gray-700 dark:text-gray-300 mt-1">
                    {selectedWorkoutPlan.estimatedDuration} minutes
                  </p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Language</Label>
                  <p className="text-sm mt-1">{selectedWorkoutPlan.language || 'en'}</p>
                </div>
                <div>
                  <Label>Public</Label>
                  <p className="text-sm mt-1">{selectedWorkoutPlan.isPublic ? 'Yes' : 'No'}</p>
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsWorkoutPlanModalOpen(false)}>
              Close
            </Button>
            {selectedWorkoutPlan && (
              <Button onClick={() => {
                handleToggleWorkoutPlan(selectedWorkoutPlan.id, selectedWorkoutPlan.isGameChallenge || false)
                setIsWorkoutPlanModalOpen(false)
              }}>
                {selectedWorkoutPlan.isGameChallenge ? (
                  <>
                    <Minus className="h-4 w-4 mr-2" />
                    Remove from Game
                  </>
                ) : (
                  <>
                    <Plus className="h-4 w-4 mr-2" />
                    Add to Game
                  </>
                )}
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

