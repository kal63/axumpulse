'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Check, X, Eye, FileText, Video, Search, Filter, RefreshCw, Trophy, ExternalLink, Dumbbell } from 'lucide-react'
import { toast } from 'sonner'
import { apiClient, type ModerationItemType } from '@/lib/api-client'
import { usePaginatedData } from '@/hooks/usePaginatedData'
import { PaginatedTable } from '@/components/pagination/PaginatedTable'

export default function ModerationPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const tabParam = searchParams.get('tab') as 'content' | 'challenge' | 'workout-plan' | null
  const [activeTab, setActiveTab] = useState<'content' | 'challenge' | 'workout-plan'>(tabParam || 'content')
  const [selectedStatus, setSelectedStatus] = useState<string>('pending')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedItem, setSelectedItem] = useState<ModerationItemType | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false)
  const [isApproveConfirmOpen, setIsApproveConfirmOpen] = useState(false)
  const [rejectReason, setRejectReason] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [pendingCounts, setPendingCounts] = useState({
    content: 0,
    challenge: 0,
    'workout-plan': 0
  })

  // Stable fetch function
  const fetchModerationItems = useCallback(async (params: any) => {
    const response = await apiClient.getModerationItems({
      kind: activeTab,
      status: selectedStatus,
      q: searchQuery || undefined,
      page: params.page,
      pageSize: params.pageSize
    })
    if (response.success && response.data) {
      // Transform the API response to match usePaginatedData expected format
      return {
        items: response.data.items,
        pagination: response.data.pagination
      }
    }
    throw new Error(response.error?.message || 'Failed to fetch moderation items')
  }, [activeTab, selectedStatus, searchQuery])

  // Use paginated data hook
  const {
    data,
    loading,
    error,
    pagination,
    refetch
  } = usePaginatedData<ModerationItemType>({
    fetchFunction: fetchModerationItems,
    initialPage: 1,
    initialPageSize: 20
  })

  // Fetch pending counts for all tabs
  const fetchPendingCounts = useCallback(async () => {
    try {
      const [contentRes, challengeRes, workoutPlanRes] = await Promise.all([
        apiClient.getModerationItems({ kind: 'content', status: 'pending', page: 1, pageSize: 1 }),
        apiClient.getModerationItems({ kind: 'challenge', status: 'pending', page: 1, pageSize: 1 }),
        apiClient.getModerationItems({ kind: 'workout-plan', status: 'pending', page: 1, pageSize: 1 })
      ])

      setPendingCounts({
        content: contentRes.data?.pagination?.totalItems || 0,
        challenge: challengeRes.data?.pagination?.totalItems || 0,
        'workout-plan': workoutPlanRes.data?.pagination?.totalItems || 0
      })
    } catch (error) {
      console.error('Error fetching pending counts:', error)
    }
  }, [])

  // Fetch pending counts on mount and when actions are performed
  useEffect(() => {
    fetchPendingCounts()
  }, [fetchPendingCounts])

  const openApproveConfirm = (item: ModerationItemType) => {
    setSelectedItem(item)
    setIsApproveConfirmOpen(true)
  }

  const handleApprove = async () => {
    if (!selectedItem) return

    try {
      setIsLoading(true)
      await apiClient.approveModerationItem(activeTab, selectedItem.id)
      toast.success(`${activeTab} approved successfully`)
      
      // Close dialogs first
      setIsDialogOpen(false)
      setIsApproveConfirmOpen(false)
      
      // Then refetch data (this actually triggers a new API call)
      await refetch()
      await fetchPendingCounts() // Refresh counts
    } catch (error) {
      console.error('Error approving item:', error)
      toast.error('Failed to approve item')
    } finally {
      setIsLoading(false)
    }
  }

  const handleReject = async () => {
    if (!selectedItem || !rejectReason.trim()) {
      toast.error('Please provide a rejection reason')
      return
    }

    try {
      setIsLoading(true)
      await apiClient.rejectModerationItem(activeTab, selectedItem.id, rejectReason)
      toast.success(`${activeTab} rejected`)
      
      // Close dialogs and reset state first
      setIsRejectDialogOpen(false)
      setRejectReason('')
      setIsDialogOpen(false)
      
      // Then refetch data (this actually triggers a new API call)
      await refetch()
      await fetchPendingCounts() // Refresh counts
    } catch (error) {
      console.error('Error rejecting item:', error)
      toast.error('Failed to reject item')
    } finally {
      setIsLoading(false)
    }
  }

  const openPreview = (item: ModerationItemType) => {
    setSelectedItem(item)
    setIsDialogOpen(true)
  }

  const openRejectDialog = (item: ModerationItemType) => {
    setSelectedItem(item)
    setIsRejectDialogOpen(true)
  }

  const openDetailPage = (item: ModerationItemType) => {
    const detailPath = activeTab === 'content' 
      ? `/admin/moderation/content/${item.id}`
      : activeTab === 'challenge'
      ? `/admin/moderation/challenge/${item.id}`
      : `/admin/moderation/workout-plan/${item.id}`
    router.push(detailPath)
  }

  const getKindIcon = (kind: string) => {
    return kind === 'content' ? Video : kind === 'workout-plan' ? Dumbbell : Trophy
  }

  const getKindColor = (kind: string) => {
    return kind === 'content'
      ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
      : kind === 'workout-plan'
      ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
      : 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400'
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
      case 'approved':
        return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
      case 'rejected':
        return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
      default:
        return 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400'
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString()
  }

  const getAuthorName = (item: ModerationItemType) => {
    if (activeTab === 'content' && item.trainer?.User) {
      return item.trainer.User.name
    } else if (activeTab === 'challenge' && item.trainer?.User) {
      return item.trainer.User.name
    } else if (activeTab === 'workout-plan' && item.trainer?.User) {
      // For workout-plan, trainer object has User nested
      return item.trainer.User.name || 'Unknown'
    }
    return 'Unknown'
  }

  const columns: any[] = [
    {
      key: 'kind',
      header: 'Type',
      render: (item: ModerationItemType) => {
        const KindIcon = getKindIcon(activeTab)
        return (
          <Badge className={getKindColor(activeTab)}>
            <KindIcon className="w-3 h-3 mr-1" />
            {activeTab}
          </Badge>
        )
      }
    },
    {
      key: 'title',
      header: 'Title',
      render: (item: ModerationItemType) => (
        <div className="font-medium">{item.title}</div>
      )
    },
    {
      key: 'author',
      header: 'Author',
      render: (item: ModerationItemType) => getAuthorName(item)
    },
    {
      key: 'status',
      header: 'Status',
      render: (item: ModerationItemType) => (
        <Badge className={getStatusColor(item.status)}>
          {item.status}
        </Badge>
      )
    },
    {
      key: 'createdAt',
      header: 'Submitted',
      render: (item: ModerationItemType) => formatDate(item.createdAt)
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (item: ModerationItemType) => (
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={(e) => {
              e.stopPropagation()
              openPreview(item)
            }}
            className="cursor-pointer"
            title="Quick preview"
          >
            <Eye className="h-4 w-4" />
          </Button>
          {item.status === 'pending' && (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation()
                  openApproveConfirm(item)
                }}
                className="text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 dark:hover:text-emerald-300 cursor-pointer"
                disabled={isLoading}
                title="Approve"
              >
                <Check className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation()
                  openRejectDialog(item)
                }}
                className="text-red-600 hover:text-red-700 cursor-pointer"
                disabled={isLoading}
                title="Reject"
              >
                <X className="h-4 w-4" />
              </Button>
            </>
          )}
        </div>
      )
    }
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Content Moderation</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Review and approve content submitted by trainers
        </p>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Filter className="h-5 w-5" />
            <span>Filters</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 min-w-0">
              <label className="text-sm font-medium mb-2 block">Search</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search by title or description..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex-shrink-0">
              <label className="text-sm font-medium mb-2 block">Status</label>
              <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end flex-shrink-0">
              <Button
                variant="outline"
                onClick={refetch}
                disabled={loading}
                className="h-10"
              >
                <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'content' | 'challenge' | 'workout-plan')} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger 
            value="content" 
            className="flex items-center space-x-2"
          >
            <FileText className="h-4 w-4 text-blue-500 dark:text-blue-400" />
            <span>Content</span>
            {pendingCounts.content > 0 && (
              <Badge variant="secondary" className="ml-2 bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
                {pendingCounts.content}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger 
            value="challenge" 
            className="flex items-center space-x-2"
          >
            <Trophy className="h-4 w-4 text-purple-500 dark:text-purple-400" />
            <span>Challenges</span>
            {pendingCounts.challenge > 0 && (
              <Badge variant="secondary" className="ml-2 bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400">
                {pendingCounts.challenge}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger 
            value="workout-plan" 
            className="flex items-center space-x-2"
          >
            <Dumbbell className="h-4 w-4 text-green-500 dark:text-green-400" />
            <span>Workout Plans</span>
            {pendingCounts['workout-plan'] > 0 && (
              <Badge variant="secondary" className="ml-2 bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                {pendingCounts['workout-plan']}
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>

        {/* Content Tab */}
        <TabsContent value="content" className="space-y-6">
          {/* Content Table */}
      <Card>
        <CardHeader>
          <CardTitle>
            Content - {selectedStatus}
          </CardTitle>
          <CardDescription>
            {pagination.pagination.totalItems || 0} items found • Click any row to view details
          </CardDescription>
        </CardHeader>
        <CardContent>
          <PaginatedTable
            data={data || []}
            columns={columns}
            loading={loading}
            error={error}
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
            onRowClick={(item) => openDetailPage(item)}
            rowClassName={() => "hover:bg-muted/50 transition-colors"}
            emptyMessage={`No content found with status "${selectedStatus}"`}
          />
        </CardContent>
      </Card>
        </TabsContent>

        {/* Challenges Tab */}
        <TabsContent value="challenge" className="space-y-6">
          {/* Challenges Table */}
          <Card>
            <CardHeader>
              <CardTitle>
                Challenges - {selectedStatus}
              </CardTitle>
              <CardDescription>
                {pagination.pagination.totalItems || 0} items found • Click any row to view details
              </CardDescription>
            </CardHeader>
            <CardContent>
          <PaginatedTable
            data={data || []}
            columns={columns}
            loading={loading}
            error={error}
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
            onRowClick={(item) => openDetailPage(item)}
            rowClassName={() => "hover:bg-muted/50 transition-colors"}
            emptyMessage={`No challenges found with status "${selectedStatus}"`}
          />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Workout Plans Tab */}
        <TabsContent value="workout-plan" className="space-y-6">
          {/* Workout Plans Table */}
          <Card>
            <CardHeader>
              <CardTitle>
                Workout Plans - {selectedStatus}
              </CardTitle>
              <CardDescription>
                {pagination.pagination.totalItems || 0} items found • Click any row to view details
              </CardDescription>
            </CardHeader>
            <CardContent>
              <PaginatedTable
                data={data}
                columns={columns}
                loading={loading}
                error={error}
                currentPage={pagination.pagination.page}
                totalPages={pagination.pagination.totalPages}
                pageSize={pagination.pagination.pageSize}
                totalItems={pagination.pagination.totalItems}
                onPageChange={pagination.setPage}
                onPageSizeChange={pagination.setPageSize}
                showPagination={true}
                showPageSizeSelector={true}
                showInfo={true}
                onRowClick={openDetailPage}
                emptyMessage={`No workout plans found with status "${selectedStatus}"`}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Preview Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              {selectedItem && (
                <>
                  {(() => {
                    const KindIcon = getKindIcon(activeTab)
                    return <KindIcon className="h-5 w-5" />
                  })()}
                  <span>{activeTab} Preview</span>
                </>
              )}
            </DialogTitle>
            <DialogDescription>
              Review the {activeTab} before making a decision
            </DialogDescription>
          </DialogHeader>
          
          {selectedItem && (
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold">{selectedItem.title}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  by {getAuthorName(selectedItem)} • {formatDate(selectedItem.createdAt)}
                </p>
              </div>
              
              <div>
                <h4 className="font-medium mb-2">Description</h4>
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  {selectedItem.description}
                </p>
              </div>
              
              <div className="flex items-center space-x-4">
                <Badge className={getKindColor(activeTab)}>
                  {activeTab}
                </Badge>
                <Badge className={getStatusColor(selectedItem.status)}>
                  {selectedItem.status}
                </Badge>
              </div>

              {selectedItem.rejectionReason && (
                <div>
                  <h4 className="font-medium mb-2">Rejection Reason</h4>
                  <p className="text-sm text-red-600 dark:text-red-400">
                    {selectedItem.rejectionReason}
                  </p>
                </div>
              )}
            </div>
          )}
          
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDialogOpen(false)}
            >
              Close
            </Button>
            {selectedItem && selectedItem.status === 'pending' && (
              <>
                <Button
                  variant="outline"
                  onClick={() => openRejectDialog(selectedItem)}
                  className="text-red-600 hover:text-red-700"
                >
                  <X className="h-4 w-4 mr-2" />
                  Reject
                </Button>
                <Button
                  onClick={() => {
                    setIsDialogOpen(false)
                    openApproveConfirm(selectedItem)
                  }}
                  disabled={isLoading}
                >
                  <Check className="h-4 w-4 mr-2" />
                  Approve
                </Button>
              </>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reject Dialog */}
      <Dialog open={isRejectDialogOpen} onOpenChange={setIsRejectDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <X className="h-5 w-5 text-red-600" />
              <span>Confirm Rejection</span>
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to reject this {activeTab}? Please provide a reason below. This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            {selectedItem && (
              <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <h4 className="font-medium text-gray-900 dark:text-white">{selectedItem.title}</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  by {getAuthorName(selectedItem)} • {formatDate(selectedItem.createdAt)}
                </p>
              </div>
            )}
            <div>
              <label className="text-sm font-medium mb-2 block">Rejection Reason</label>
              <Textarea
                placeholder="Enter the reason for rejection..."
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                rows={4}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsRejectDialogOpen(false)
                setRejectReason('')
              }}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleReject}
              disabled={isLoading || !rejectReason.trim()}
            >
              <X className="h-4 w-4 mr-2" />
              Yes, Reject {activeTab}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Approve Confirmation Dialog */}
      <Dialog open={isApproveConfirmOpen} onOpenChange={setIsApproveConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <Check className="h-5 w-5 text-emerald-600" />
              <span>Confirm Approval</span>
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to approve this {activeTab}? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          
          {selectedItem && (
            <div className="space-y-4">
              <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <h4 className="font-medium text-gray-900 dark:text-white">{selectedItem.title}</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  by {getAuthorName(selectedItem)} • {formatDate(selectedItem.createdAt)}
                </p>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsApproveConfirmOpen(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              onClick={handleApprove}
              disabled={isLoading}
              className="bg-emerald-600 hover:bg-emerald-700"
            >
              <Check className="h-4 w-4 mr-2" />
              Yes, Approve {activeTab}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}