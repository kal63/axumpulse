'use client'

import { useEffect, useState, useCallback } from 'react'
import { apiClient, type WorkoutPlan } from '@/lib/api-client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { useRouter } from 'next/navigation'
import { Plus, Search, Edit, Trash2, MoreHorizontal, Dumbbell, Clock, Users, Eye, Send, X, AlertCircle } from 'lucide-react'
import { useAuth } from '@/contexts/auth-context'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { usePaginatedData } from '@/hooks/usePaginatedData'
import { PaginatedTable } from '@/components/pagination/PaginatedTable'

export default function WorkoutPlansPage() {
  const router = useRouter()
  const { user, isLoading } = useAuth()
  const [searchQuery, setSearchQuery] = useState('')
  const [difficultyFilter, setDifficultyFilter] = useState<string>('all')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [workoutPlanToDelete, setWorkoutPlanToDelete] = useState<WorkoutPlan | null>(null)
  const [deleting, setDeleting] = useState(false)
  const [submitDialogOpen, setSubmitDialogOpen] = useState(false)
  const [workoutPlanToSubmit, setWorkoutPlanToSubmit] = useState<WorkoutPlan | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [withdrawDialogOpen, setWithdrawDialogOpen] = useState(false)
  const [workoutPlanToWithdraw, setWorkoutPlanToWithdraw] = useState<WorkoutPlan | null>(null)
  const [withdrawing, setWithdrawing] = useState(false)

  // Stable fetch function with filters
  const fetchWorkoutPlans = useCallback(async (params: any) => {
    // Add filters to the API call
    const filterParams = {
      ...params,
      difficulty: difficultyFilter !== 'all' ? difficultyFilter : undefined,
      status: statusFilter !== 'all' ? statusFilter : undefined,
      search: searchQuery || undefined
    }
    
    const response = await apiClient.getTrainerWorkoutPlans(filterParams)
    if (response.success && response.data) {
      return response.data
    }
    throw new Error(response.error?.message || 'Failed to load workout plans')
  }, [searchQuery, difficultyFilter, statusFilter])

  // Use the new pagination system with filters
  const {
    data: allWorkoutPlans,
    pagination,
    loading,
    error,
    refetch
  } = usePaginatedData<WorkoutPlan>({
    fetchFunction: fetchWorkoutPlans,
    initialPage: 1,
    initialPageSize: 20,
    dependencies: [searchQuery, difficultyFilter, statusFilter] // Refetch when filters change
  })

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

  // No client-side filtering needed - server handles it
  const filteredWorkoutPlans = allWorkoutPlans

  // Define table columns
  const columns = [
    {
      key: 'title',
      header: 'Title',
      render: (item: WorkoutPlan) => (
        <div className="space-y-1">
          <div className="font-medium">{item.title}</div>
          {item.description && (
            <div className="text-xs text-gray-500 dark:text-gray-400 truncate max-w-[200px]">
              {item.description}
            </div>
          )}
        </div>
      )
    },
    {
      key: 'difficulty',
      header: 'Difficulty',
      render: (item: WorkoutPlan) => (
        <Badge 
          className={
            item.difficulty === 'beginner' ? 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800' :
            item.difficulty === 'intermediate' ? 'bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-800' :
            'bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-900/20 dark:text-purple-400 dark:border-purple-800'
          }
        >
          {item.difficulty}
        </Badge>
      )
    },
    {
      key: 'status',
      header: 'Status',
      render: (item: WorkoutPlan) => (
        <div className="space-y-1">
          <Badge 
            className={
              item.status === 'approved' ? 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800' :
              item.status === 'pending' ? 'bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-400 dark:border-yellow-800' :
              item.status === 'draft' ? 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700' :
              'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800'
            }
          >
            {item.status}
          </Badge>
          {item.status === 'rejected' && item.rejectionReason && (
            <div className="flex items-start gap-1 text-xs text-red-600 dark:text-red-400 max-w-[200px]">
              <AlertCircle className="h-3 w-3 mt-0.5 flex-shrink-0" />
              <span className="line-clamp-2">{item.rejectionReason}</span>
            </div>
          )}
        </div>
      )
    },
    {
      key: 'totalExercises',
      header: 'Exercises',
      render: (item: WorkoutPlan) => (
        <div className="flex items-center gap-1 text-sm text-purple-600 dark:text-purple-400">
          <Dumbbell className="h-3 w-3" />
          {item.totalExercises || 0}
        </div>
      )
    },
    {
      key: 'estimatedDuration',
      header: 'Duration',
      render: (item: WorkoutPlan) => (
        item.estimatedDuration ? (
          <div className="flex items-center gap-1 text-sm text-blue-600 dark:text-blue-400">
            <Clock className="h-3 w-3" />
            {item.estimatedDuration} min
          </div>
        ) : (
          <span className="text-sm text-gray-400">Not set</span>
        )
      )
    },
    {
      key: 'createdAt',
      header: 'Created',
      render: (item: WorkoutPlan) => (
        <span className="text-sm text-gray-600 dark:text-gray-400">
          {new Date(item.createdAt).toLocaleDateString()}
        </span>
      )
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (item: WorkoutPlan) => (
        <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
          {/* Primary Action - Submit for draft/rejected */}
          {(item.status === 'draft' || item.status === 'rejected') && (
            <Button 
              size="sm"
              onClick={(e) => {
                e.stopPropagation()
                handleSubmitClick(item)
              }}
              className="bg-gray-900 hover:bg-gray-800 text-white dark:bg-gray-100 dark:hover:bg-gray-200 dark:text-gray-900"
            >
              <Send className="h-4 w-4 mr-1" />
              Submit
            </Button>
          )}
          
          {/* Withdraw (only for pending) */}
          {item.status === 'pending' && (
            <Button 
              variant="outline" 
              size="sm"
              onClick={(e) => {
                e.stopPropagation()
                handleWithdrawClick(item)
              }}
              className="border-yellow-300 text-yellow-700 hover:bg-yellow-50 dark:border-yellow-700 dark:text-yellow-500 dark:hover:bg-yellow-950"
            >
              <X className="h-4 w-4 mr-1" />
              Withdraw
            </Button>
          )}
          
          {/* Dropdown Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-8 w-8"
                onClick={(e) => e.stopPropagation()}
              >
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem 
                onClick={(e) => {
                  e.stopPropagation()
                  router.push(`/trainer/workout-plans/${item.id}`)
                }}
              >
                <Eye className="h-4 w-4 mr-2" />
                View
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={(e) => {
                  e.stopPropagation()
                  router.push(`/trainer/workout-plans/${item.id}?edit=true`)
                }}
              >
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </DropdownMenuItem>
              {/* Only show delete for draft and rejected */}
              {(item.status === 'draft' || item.status === 'rejected') && (
                <DropdownMenuItem 
                  onClick={(e) => {
                    e.stopPropagation()
                    handleDeleteClick(item)
                  }}
                  className="text-red-600 focus:text-red-600"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      )
    }
  ]

  const handleDeleteClick = (item: WorkoutPlan) => {
    setWorkoutPlanToDelete(item)
    setDeleteDialogOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (!workoutPlanToDelete) return
    
    setDeleting(true)
    try {
      const res = await apiClient.deleteTrainerWorkoutPlan(workoutPlanToDelete.id)
      if (res.success) {
        // Refresh the workout plans list
        refetch()
        setDeleteDialogOpen(false)
        setWorkoutPlanToDelete(null)
      } else {
        console.error('Failed to delete workout plan:', res.error?.message)
      }
    } catch (err) {
      console.error('Failed to delete workout plan:', err)
    } finally {
      setDeleting(false)
    }
  }

  const handleSubmitClick = (item: WorkoutPlan) => {
    setWorkoutPlanToSubmit(item)
    setSubmitDialogOpen(true)
  }

  const handleSubmitConfirm = async () => {
    if (!workoutPlanToSubmit) return
    
    setSubmitting(true)
    try {
      const res = await apiClient.submitWorkoutPlanForApproval(workoutPlanToSubmit.id)
      if (res.success) {
        // Refresh the workout plans list
        refetch()
        setSubmitDialogOpen(false)
        setWorkoutPlanToSubmit(null)
      } else {
        console.error('Failed to submit workout plan:', res.error?.message)
        alert(res.error?.message || 'Failed to submit workout plan')
      }
    } catch (err) {
      console.error('Failed to submit workout plan:', err)
      alert('Failed to submit workout plan. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  const handleWithdrawClick = (item: WorkoutPlan) => {
    setWorkoutPlanToWithdraw(item)
    setWithdrawDialogOpen(true)
  }

  const handleWithdrawConfirm = async () => {
    if (!workoutPlanToWithdraw) return
    
    setWithdrawing(true)
    try {
      const res = await apiClient.withdrawWorkoutPlanSubmission(workoutPlanToWithdraw.id)
      if (res.success) {
        // Refresh the workout plans list
        refetch()
        setWithdrawDialogOpen(false)
        setWorkoutPlanToWithdraw(null)
      } else {
        console.error('Failed to withdraw workout plan:', res.error?.message)
        alert(res.error?.message || 'Failed to withdraw workout plan')
      }
    } catch (err) {
      console.error('Failed to withdraw workout plan:', err)
      alert('Failed to withdraw workout plan. Please try again.')
    } finally {
      setWithdrawing(false)
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="h-8 w-48 bg-gray-200 rounded animate-pulse" />
          <div className="h-10 w-32 bg-gray-200 rounded animate-pulse" />
        </div>
        <div className="h-64 bg-gray-200 rounded animate-pulse" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">My Workout Plans</h1>
          <Button onClick={() => router.push('/trainer/workout-plans/new')}>
            <Plus className="h-4 w-4 mr-2" />
            New Workout Plan
          </Button>
        </div>
        <Card>
          <CardContent className="p-6">
            <p className="text-red-600">{error}</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">My Workout Plans</h1>
        <Button onClick={() => router.push('/trainer/workout-plans/new')}>
          <Plus className="h-4 w-4 mr-2" />
          New Workout Plan
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Search</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search workout plans..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Difficulty</label>
              <Select value={difficultyFilter} onValueChange={setDifficultyFilter}>
                <SelectTrigger className="w-full">
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
            <div>
              <label className="text-sm font-medium mb-2 block">Status</label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Workout Plans Table */}
      <Card>
        <CardHeader>
          <CardTitle>Workout Plans ({filteredWorkoutPlans.length} items)</CardTitle>
        </CardHeader>
        <CardContent>
          <PaginatedTable
            data={filteredWorkoutPlans}
            columns={columns}
            loading={loading}
            error={error}
            emptyMessage={allWorkoutPlans.length === 0 
              ? 'No workout plans yet. Click "New Workout Plan" to get started.'
              : 'No workout plans match your filters.'
            }
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
            onRowClick={(item) => router.push(`/trainer/workout-plans/${item.id}`)}
          />
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Workout Plan</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "{workoutPlanToDelete?.title}"? This action cannot be undone and will permanently remove the workout plan and all associated exercises.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleDeleteConfirm}
              disabled={deleting}
              className="bg-red-600 hover:bg-red-700"
            >
              {deleting ? 'Deleting...' : 'Delete'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Submit Confirmation Dialog */}
      <Dialog open={submitDialogOpen} onOpenChange={setSubmitDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Submit for Approval</DialogTitle>
            <DialogDescription>
              Are you sure you want to submit "{workoutPlanToSubmit?.title}" for approval? Once submitted, you won&apos;t be able to edit it until it&apos;s reviewed.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSubmitDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleSubmitConfirm}
              disabled={submitting}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {submitting ? 'Submitting...' : 'Submit for Approval'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Withdraw Confirmation Dialog */}
      <Dialog open={withdrawDialogOpen} onOpenChange={setWithdrawDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Withdraw Submission</DialogTitle>
            <DialogDescription>
              Are you sure you want to withdraw "{workoutPlanToWithdraw?.title}" from review? You&apos;ll be able to make edits and resubmit it later.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setWithdrawDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleWithdrawConfirm}
              disabled={withdrawing}
              className="bg-yellow-600 hover:bg-yellow-700"
            >
              {withdrawing ? 'Withdrawing...' : 'Withdraw'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
