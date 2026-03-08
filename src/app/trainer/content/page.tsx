'use client'

import { useEffect, useState, useCallback } from 'react'
import { apiClient, type ContentItem } from '@/lib/api-client'
import { useToast } from '@/hooks/use-toast'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { useRouter } from 'next/navigation'
import { Plus, Search, Eye, Heart, Edit, Trash2, MoreHorizontal, Send, Play, Image as ImageIcon, FileText, X } from 'lucide-react'
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

// Helper function to get content type icon
const getContentTypeIcon = (type: string) => {
  switch (type) {
    case 'video':
      return <Play className="h-3 w-3" />
    case 'image':
      return <ImageIcon className="h-3 w-3" />
    case 'document':
      return <FileText className="h-3 w-3" />
    default:
      return <FileText className="h-3 w-3" />
  }
}

export default function TrainerContentListPage() {
  const router = useRouter()
  const { user, isLoading } = useAuth()
  const [searchQuery, setSearchQuery] = useState('')
  const [typeFilter, setTypeFilter] = useState<string>('all')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [visibilityFilter, setVisibilityFilter] = useState<string>('all')
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [contentToDelete, setContentToDelete] = useState<ContentItem | null>(null)
  const [deleting, setDeleting] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [submitDialogOpen, setSubmitDialogOpen] = useState(false)
  const [contentToSubmit, setContentToSubmit] = useState<ContentItem | null>(null)
  const [withdrawing, setWithdrawing] = useState(false)
  const [withdrawDialogOpen, setWithdrawDialogOpen] = useState(false)
  const [contentToWithdraw, setContentToWithdraw] = useState<ContentItem | null>(null)
  const { toast } = useToast()

  // Stable fetch function with filters
  const fetchContent = useCallback(async (params: any) => {
    // Add filters to the API call
    const filterParams = {
      ...params,
      type: typeFilter !== 'all' ? typeFilter : undefined,
      status: statusFilter !== 'all' ? statusFilter : undefined,
      isPublic: visibilityFilter === 'public' ? true : visibilityFilter === 'private' ? false : undefined,
      search: searchQuery || undefined
    }
    
    const response = await apiClient.getTrainerContent(filterParams)
    if (response.success && response.data) {
      return response.data
    }
    throw new Error(response.error?.message || 'Failed to load content')
  }, [searchQuery, typeFilter, statusFilter, visibilityFilter])

  // Use the new pagination system with filters
  const {
    data: allContent,
    pagination,
    loading,
    error,
    refetch
  } = usePaginatedData<ContentItem>({
    fetchFunction: fetchContent,
    initialPage: 1,
    initialPageSize: 20,
    dependencies: [searchQuery, typeFilter, statusFilter, visibilityFilter] // Refetch when filters change
  })

  useEffect(() => {
    if (!isLoading) {
      if (!user) {
        router.push('/login')
        return
      }
      if (!user.isTrainer) {
        router.push('/admin/dashboard')
        return
      }
    }
  }, [user, isLoading, router])

  // show any success toast left from previous page
  useEffect(() => {
    try {
      const msg = localStorage.getItem('trainerContentUploadSuccess')
      if (msg) {
        toast({ title: msg })
        localStorage.removeItem('trainerContentUploadSuccess')
      }
    } catch (e) {
      // ignore
    }
  }, [toast])

  // No client-side filtering needed - server handles it
  const filteredContent = allContent

  // Define table columns
  const columns = [
    {
      key: 'title',
      header: 'Title',
      render: (item: ContentItem) => (
        <div className="font-medium">{item.title}</div>
      )
    },
    {
      key: 'type',
      header: 'Type',
      render: (item: ContentItem) => (
        <Badge
          variant="outline"
          className={`capitalize flex items-center gap-1 ${
            item.type === 'video' ? 'border-red-200 bg-red-50 text-red-700 dark:border-red-800 dark:bg-red-950/20 dark:text-red-400' :
            item.type === 'image' ? 'border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-800 dark:bg-amber-950/20 dark:text-amber-400' :
            item.type === 'document' ? 'border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-800 dark:bg-blue-950/20 dark:text-blue-400' :
            'border-gray-200 bg-gray-50 text-gray-700 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300'
          }`}
        >
          {getContentTypeIcon(item.type)}
          {item.type.replace('_',' ')}
        </Badge>
      )
    },
    {
      key: 'status',
      header: 'Status',
      render: (item: ContentItem) => (
        <Badge
          variant="outline"
          className={`capitalize ${
            item.status === 'approved' ? 'border-green-200 bg-green-50 text-green-700 dark:border-green-800 dark:bg-green-950/20 dark:text-green-400' :
            item.status === 'draft' ? 'border-gray-200 bg-gray-50 text-gray-700 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300' :
            item.status === 'pending' ? 'border-yellow-200 bg-yellow-50 text-yellow-700 dark:border-yellow-800 dark:bg-yellow-950/20 dark:text-yellow-400' :
            item.status === 'rejected' ? 'border-red-200 bg-red-50 text-red-700 dark:border-red-800 dark:bg-red-950/20 dark:text-red-400' :
            'border-gray-200 bg-gray-50 text-gray-700 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300'
          }`}
        >
          {item.status}
        </Badge>
      )
    },
    {
      key: 'visibility',
      header: 'Visibility',
      render: (item: ContentItem) => (
        <Badge
          variant="outline"
          className={`capitalize ${
            item.isPublic ? 'border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-800 dark:bg-blue-950/20 dark:text-blue-400' :
            'border-gray-200 bg-gray-50 text-gray-700 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300'
          }`}
        >
          {item.isPublic ? 'Public' : 'Private'}
        </Badge>
      )
    },
    {
      key: 'performance',
      header: 'Performance',
      render: (item: ContentItem) => (
        <div className="flex items-center gap-2 text-sm">
          <div className="flex items-center gap-1">
            <Eye className="h-3 w-3 text-gray-500" />
            <span>{item.views || 0}</span>
          </div>
          <div className="flex items-center gap-1">
            <Heart className="h-3 w-3 text-gray-500" />
            <span>{item.likes || 0}</span>
          </div>
        </div>
      )
    },
    {
      key: 'createdAt',
      header: 'Created',
      render: (item: ContentItem) => (
        <span className="text-sm text-gray-600 dark:text-gray-400">
          {new Date(item.createdAt).toLocaleDateString()}
        </span>
      )
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (item: ContentItem) => (
        <div className="flex items-center gap-2">
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
                  router.push(`/trainer/content/${item.id}`)
                }}
              >
                <Eye className="mr-2 h-4 w-4" />
                View
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={(e) => {
                  e.stopPropagation()
                  router.push(`/trainer/content/${item.id}?edit=true`)
                }}
              >
                <Edit className="mr-2 h-4 w-4" />
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
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      )
    }
  ]

  const handleDeleteClick = (item: ContentItem) => {
    setContentToDelete(item)
    setDeleteDialogOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (!contentToDelete) return
    
    setDeleting(true)
    try {
      const res = await apiClient.deleteTrainerContent(contentToDelete.id)
      if (res.success) {
        // Refresh the content list
        refetch()
        setDeleteDialogOpen(false)
        setContentToDelete(null)
      } else {
        console.error('Failed to delete content:', res.error?.message)
      }
    } catch (err) {
      console.error('Failed to delete content:', err)
    } finally {
      setDeleting(false)
    }
  }

  const handleSubmitForApproval = async () => {
    if (!contentToSubmit) return
    
    setSubmitting(true)
    try {
      const res = await apiClient.submitTrainerContentForApproval(contentToSubmit.id)
      if (res.success) {
        // Refresh the content list
        refetch()
        setSubmitDialogOpen(false)
        setContentToSubmit(null)
      } else {
        console.error('Failed to submit content for approval:', res.error?.message)
      }
    } catch (err) {
      console.error('Failed to submit content for approval:', err)
    } finally {
      setSubmitting(false)
    }
  }

  const handleSubmitClick = (content: ContentItem) => {
    setContentToSubmit(content)
    setSubmitDialogOpen(true)
  }

  const handleWithdrawClick = (content: ContentItem) => {
    setContentToWithdraw(content)
    setWithdrawDialogOpen(true)
  }

  const handleWithdrawConfirm = async () => {
    if (!contentToWithdraw) return
    
    setWithdrawing(true)
    try {
      const res = await apiClient.withdrawContentSubmission(contentToWithdraw.id)
      if (res.success) {
        refetch()
        setWithdrawDialogOpen(false)
        setContentToWithdraw(null)
      } else {
        console.error('Failed to withdraw content:', res.error?.message)
        alert(res.error?.message || 'Failed to withdraw content')
      }
    } catch (err) {
      console.error('Failed to withdraw content:', err)
      alert('Failed to withdraw content. Please try again.')
    } finally {
      setWithdrawing(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">My Content</h1>
        <Button className="cursor-pointer" onClick={() => router.push('/trainer/content/upload')}>
          <Plus className="h-4 w-4 mr-2" /> New Content
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Search</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search content..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Type</label>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="All types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="video">Video</SelectItem>
                  <SelectItem value="image">Image</SelectItem>
                  <SelectItem value="document">Document</SelectItem>
                  <SelectItem value="workout_plan">Workout Plan</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Status</label>
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
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Visibility</label>
              <Select value={visibilityFilter} onValueChange={setVisibilityFilter}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="All visibility" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Visibility</SelectItem>
                  <SelectItem value="public">Public</SelectItem>
                  <SelectItem value="private">Private</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Library ({filteredContent.length} items)</CardTitle>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Click any row to view content details
          </p>
        </CardHeader>
        <CardContent>
          <PaginatedTable
            data={filteredContent}
            columns={columns}
            loading={loading}
            error={error}
            emptyMessage={allContent.length === 0 
                        ? 'No content yet. Click "New Content" to upload.'
                        : 'No content matches your filters.'
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
            onRowClick={(item) => router.push(`/trainer/content/${item.id}`)}
            rowClassName={() => "hover:bg-muted/50 transition-colors"}
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
              Are you sure you want to submit "{contentToSubmit?.title}" for approval? This will change the status from draft to pending and make it available for review.
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
              Are you sure you want to withdraw "{contentToWithdraw?.title}" from review? This will change the status back to draft.
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
            <DialogTitle>Delete Content</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "{contentToDelete?.title}"? This action cannot be undone and will permanently remove the content and all associated files.
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
    </div>
  )
}



