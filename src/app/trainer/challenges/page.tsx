'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { apiClient, type Challenge } from '@/lib/api-client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
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
  Plus, 
  Search, 
  Filter, 
  Trophy, 
  Target,
  Users,
  Calendar,
  Clock,
  Star,
  Edit,
  Trash2,
  Send,
  MoreHorizontal,
  Eye,
  X
} from 'lucide-react'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { usePaginatedData } from '@/hooks/usePaginatedData'
import { PaginatedTable } from '@/components/pagination/PaginatedTable'

export default function ChallengesPage() {
  const { user, isLoading } = useAuth()
  const router = useRouter()
  
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [typeFilter, setTypeFilter] = useState<string>('all')
  const [difficultyFilter, setDifficultyFilter] = useState<string>('all')
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [challengeToDelete, setChallengeToDelete] = useState<Challenge | null>(null)
  const [deleting, setDeleting] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [submitDialogOpen, setSubmitDialogOpen] = useState(false)
  const [challengeToSubmit, setChallengeToSubmit] = useState<Challenge | null>(null)
  const [withdrawing, setWithdrawing] = useState(false)
  const [withdrawDialogOpen, setWithdrawDialogOpen] = useState(false)
  const [challengeToWithdraw, setChallengeToWithdraw] = useState<Challenge | null>(null)

  // Stable fetch function with filters
  const fetchChallenges = useCallback(async (params: any) => {
    // Add filters to the API call
    const filterParams = {
      ...params,
      status: statusFilter !== 'all' ? statusFilter : undefined,
      type: typeFilter !== 'all' ? typeFilter : undefined,
      difficulty: difficultyFilter !== 'all' ? difficultyFilter : undefined,
      search: searchQuery || undefined
    }
    
    const response = await apiClient.getTrainerChallenges(filterParams)
    if (response.success && response.data) {
      return response.data
    }
    throw new Error(response.error?.message || 'Failed to load challenges')
  }, [searchQuery, statusFilter, typeFilter, difficultyFilter])

  // Use the new pagination system with filters
  const {
    data: allChallenges,
    pagination,
    loading,
    error,
    refetch
  } = usePaginatedData<Challenge>({
    fetchFunction: fetchChallenges,
    initialPage: 1,
    initialPageSize: 20,
    dependencies: [searchQuery, statusFilter, typeFilter, difficultyFilter] // Refetch when filters change
  })

  useEffect(() => {
    if (!isLoading) {
      if (!user) {
        router.push('/login')
        return
      }
      if (!user.isTrainer) {
        router.push('/')
        return
      }
    }
  }, [user, isLoading, router])

  // Data loading is now handled by usePaginatedData hook

  const handleDeleteClick = (challenge: Challenge) => {
    setChallengeToDelete(challenge)
    setDeleteDialogOpen(true)
  }

  const handleDelete = async () => {
    if (!challengeToDelete) return
    
    try {
      setDeleting(true)
      const res = await apiClient.deleteTrainerChallenge(challengeToDelete.id)
      if (res.success) {
        refetch()
        setDeleteDialogOpen(false)
        setChallengeToDelete(null)
      } else {
        console.error('Failed to delete challenge:', res.error?.message)
      }
    } catch (err) {
      console.error('Failed to delete challenge:', err)
    } finally {
      setDeleting(false)
    }
  }

  const handleSubmitForApproval = async () => {
    if (!challengeToSubmit) return
    
    setSubmitting(true)
    try {
      const res = await apiClient.submitTrainerChallengeForApproval(challengeToSubmit.id)
      if (res.success) {
        refetch()
        setSubmitDialogOpen(false)
        setChallengeToSubmit(null)
      } else {
        console.error('Failed to submit challenge for approval:', res.error?.message)
      }
    } catch (err) {
      console.error('Failed to submit challenge for approval:', err)
    } finally {
      setSubmitting(false)
    }
  }

  const handleSubmitClick = (challenge: Challenge) => {
    setChallengeToSubmit(challenge)
    setSubmitDialogOpen(true)
  }

  const handleWithdrawClick = (challenge: Challenge) => {
    setChallengeToWithdraw(challenge)
    setWithdrawDialogOpen(true)
  }

  const handleWithdrawConfirm = async () => {
    if (!challengeToWithdraw) return
    
    setWithdrawing(true)
    try {
      const res = await apiClient.withdrawChallengeSubmission(challengeToWithdraw.id)
      if (res.success) {
        refetch()
        setWithdrawDialogOpen(false)
        setChallengeToWithdraw(null)
      } else {
        console.error('Failed to withdraw challenge:', res.error?.message)
        alert(res.error?.message || 'Failed to withdraw challenge')
      }
    } catch (err) {
      console.error('Failed to withdraw challenge:', err)
      alert('Failed to withdraw challenge. Please try again.')
    } finally {
      setWithdrawing(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft': return 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700'
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-400 dark:border-yellow-800'
      case 'approved': return 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800'
      case 'rejected': return 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800'
      case 'active': return 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800'
      default: return 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700'
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'fitness': return 'bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-900/20 dark:text-purple-400 dark:border-purple-800'
      case 'nutrition': return 'bg-orange-100 text-orange-800 border-orange-200 dark:bg-orange-900/20 dark:text-orange-400 dark:border-orange-800'
      case 'wellness': return 'bg-teal-100 text-teal-800 border-teal-200 dark:bg-teal-900/20 dark:text-teal-400 dark:border-teal-800'
      case 'achievement': return 'bg-pink-100 text-pink-800 border-pink-200 dark:bg-pink-900/20 dark:text-pink-400 dark:border-pink-800'
      default: return 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700'
    }
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800'
      case 'intermediate': return 'bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-800'
      case 'advanced': return 'bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-900/20 dark:text-purple-400 dark:border-purple-800'
      default: return 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700'
    }
  }

  // No client-side filtering needed - server handles it
  const filteredChallenges = allChallenges

  // Define table columns
  const columns = [
    {
      key: 'title',
      header: 'Title',
      render: (challenge: Challenge) => (
        <div className="font-medium">{challenge.title}</div>
      )
    },
    {
      key: 'type',
      header: 'Type',
      render: (challenge: Challenge) => (
        <Badge variant="outline" className="capitalize">
          {challenge.type}
        </Badge>
      )
    },
    {
      key: 'difficulty',
      header: 'Difficulty',
      render: (challenge: Challenge) => (
        <Badge 
          variant="outline"
          className={getDifficultyColor(challenge.difficulty || 'beginner')}
        >
          {challenge.difficulty || 'beginner'}
        </Badge>
      )
    },
    {
      key: 'status',
      header: 'Status',
      render: (challenge: Challenge) => (
        <Badge 
          variant="outline"
          className={getStatusColor(challenge.status || 'draft')}
        >
          {challenge.status || 'draft'}
        </Badge>
      )
    },
    {
      key: 'duration',
      header: 'Duration',
      render: (challenge: Challenge) => (
        <span className="text-sm text-gray-600 dark:text-gray-400">
          {challenge.duration} days
        </span>
      )
    },
    {
      key: 'xpReward',
      header: 'XP Reward',
      render: (challenge: Challenge) => (
        <div className="flex items-center gap-1">
          <Star className="h-3 w-3 text-yellow-500" />
          <span className="text-sm">{challenge.xpReward}</span>
        </div>
      )
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (challenge: Challenge) => (
        <div className="flex items-center gap-2">
          {/* Primary Action - Submit for draft/rejected */}
          {(challenge.status === 'draft' || challenge.status === 'rejected') && (
            <Button 
              size="sm"
              onClick={(e) => {
                e.stopPropagation()
                handleSubmitClick(challenge)
              }}
              disabled={submitting}
              className="bg-gray-900 hover:bg-gray-800 text-white dark:bg-gray-100 dark:hover:bg-gray-200 dark:text-gray-900"
            >
              <Send className="h-4 w-4 mr-1" />
              Submit
            </Button>
          )}

          {/* Withdraw (only for pending) */}
          {challenge.status === 'pending' && (
            <Button 
              variant="outline" 
              size="sm"
              onClick={(e) => {
                e.stopPropagation()
                handleWithdrawClick(challenge)
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
                  router.push(`/trainer/challenges/${challenge.id}`)
                }}
              >
                <Eye className="h-4 w-4 mr-2" />
                View
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={(e) => {
                  e.stopPropagation()
                  router.push(`/trainer/challenges/${challenge.id}?edit=true`)
                }}
              >
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </DropdownMenuItem>
              {/* Only show delete for draft and rejected */}
              {(challenge.status === 'draft' || challenge.status === 'rejected') && (
                <DropdownMenuItem 
                  onClick={(e) => {
                    e.stopPropagation()
                    handleDeleteClick(challenge)
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

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">My Challenges</h1>
          <div className="h-10 w-32 bg-gray-200 rounded animate-pulse" />
        </div>
        <div className="grid gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-32 bg-gray-200 rounded animate-pulse" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">My Challenges</h1>
        <Button onClick={() => router.push('/trainer/challenges/new')}>
          <Plus className="h-4 w-4 mr-2" />
          Create Challenge
        </Button>
      </div>

      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-4">
            <p className="text-red-600">{error}</p>
          </CardContent>
        </Card>
      )}


      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">Search</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search challenges..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">Status</label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="All statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">Type</label>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="All types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="fitness">Fitness</SelectItem>
                  <SelectItem value="nutrition">Nutrition</SelectItem>
                  <SelectItem value="wellness">Wellness</SelectItem>
                  <SelectItem value="achievement">Achievement</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">Difficulty</label>
              <Select value={difficultyFilter} onValueChange={setDifficultyFilter}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="All difficulties" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Difficulties</SelectItem>
                  <SelectItem value="beginner">Beginner</SelectItem>
                  <SelectItem value="intermediate">Intermediate</SelectItem>
                  <SelectItem value="advanced">Advanced</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Challenges List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5" />
            Challenges ({filteredChallenges.length})
          </CardTitle>
          <CardDescription>
            Click on a row to view challenge details
          </CardDescription>
        </CardHeader>
        <CardContent>
          <PaginatedTable
            data={filteredChallenges}
            columns={columns}
            loading={loading}
            error={error}
            emptyMessage={allChallenges.length === 0 
              ? 'No challenges yet. Click "Create Challenge" to get started.'
              : 'No challenges match your filters.'
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
            onRowClick={(challenge) => router.push(`/trainer/challenges/${challenge.id}`)}
            showPagination={true}
            showPageSizeSelector={true}
            showInfo={true}
          />
        </CardContent>
      </Card>

      {/* Submit for Approval Confirmation Dialog */}
      <Dialog open={submitDialogOpen} onOpenChange={setSubmitDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Submit for Approval</DialogTitle>
            <DialogDescription>
              Are you sure you want to submit "{challengeToSubmit?.title}" for approval? This will change the status from draft to pending and make it available for review.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSubmitDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleSubmitForApproval}
              className="bg-blue-600 hover:bg-blue-700"
              disabled={submitting}
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
              Are you sure you want to withdraw "{challengeToWithdraw?.title}" from review? This will change the status back to draft.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setWithdrawDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleWithdrawConfirm}
              variant="outline"
              className="border-yellow-300 text-yellow-700 hover:bg-yellow-50"
              disabled={withdrawing}
            >
              {withdrawing ? 'Withdrawing...' : 'Withdraw'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Challenge</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "{challengeToDelete?.title}"? This action cannot be undone and will permanently remove the challenge.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleDelete}
              className="bg-red-600 hover:bg-red-700"
              disabled={deleting}
            >
              {deleting ? 'Deleting...' : 'Delete'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
