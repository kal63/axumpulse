'use client'

import { useState, useEffect, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
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
  DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Plus, Gift, Zap, Globe, Package, ToggleLeft, ToggleRight, AlertCircle, Loader2, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { apiClient, type Reward as ApiReward } from '@/lib/api-client'
import { usePaginatedData } from '@/hooks/usePaginatedData'
import { PaginatedTable } from '@/components/pagination/PaginatedTable'

export default function RewardsPage() {
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [actionLoading, setActionLoading] = useState<number | null>(null)
  const [newReward, setNewReward] = useState({
    title: '',
    costXp: 100,
    stock: 10,
    active: true
  })

  // Use the new pagination system
  const {
    data: rewardsList,
    pagination,
    loading: isLoading,
    error,
    refetch
  } = usePaginatedData<ApiReward>({
    fetchFunction: useCallback(async (params: any) => {
      const response = await apiClient.getRewards(params)
      if (response.success && response.data) {
        return response.data
      }
      throw new Error(response.error?.message || 'Failed to fetch rewards')
    }, []),
    initialPage: 1,
    initialPageSize: 20
  })

  const handleToggleActive = async (id: number) => {
    try {
      setActionLoading(id)
      const reward = rewardsList.find(r => r.id === id)
      if (!reward) return

      const response = await apiClient.updateReward(id, {
        active: !reward.active
      })
      
      if (response.success && response.data) {
        refetch()
        toast.success('Reward status updated')
      } else {
        toast.error(response.error?.message || 'Failed to update reward')
      }
    } catch (err) {
      toast.error('Failed to update reward')
    } finally {
      setActionLoading(null)
    }
  }

  const handleDeleteReward = async (id: number) => {
    try {
      setActionLoading(id)
      const response = await apiClient.deleteReward(id)
      
      if (response.success) {
        refetch()
        toast.success('Reward deleted successfully')
      } else {
        toast.error(response.error?.message || 'Failed to delete reward')
      }
    } catch (err) {
      toast.error('Failed to delete reward')
    } finally {
      setActionLoading(null)
    }
  }

  const handleAddReward = async () => {
    try {
      const response = await apiClient.createReward(newReward)
      
      if (response.success && response.data) {
        refetch()
        setNewReward({
          title: '',
          costXp: 100,
          stock: 10,
          active: true
        })
        setIsDialogOpen(false)
        toast.success('Reward created successfully')
      } else {
        toast.error(response.error?.message || 'Failed to create reward')
      }
    } catch (err) {
      toast.error('Failed to create reward')
    }
  }

  const activeCount = rewardsList.filter(r => r.active).length
  const totalStock = rewardsList.reduce((sum, r) => sum + (r.stock || 0), 0)

  // Define table columns
  const columns = [
    {
      key: 'title',
      header: 'Title',
      render: (reward: ApiReward) => (
        <div>
          <p className="font-medium">{reward.title}</p>
        </div>
      )
    },
    {
      key: 'costXp',
      header: 'XP Cost',
      render: (reward: ApiReward) => (
        <div className="flex items-center space-x-1">
          <Zap className="h-4 w-4 text-yellow-500" />
          <span className="font-medium">{reward.costXp}</span>
        </div>
      )
    },
    {
      key: 'stock',
      header: 'Stock',
      render: (reward: ApiReward) => (
        <div className="flex items-center space-x-1">
          <Package className="h-4 w-4 text-blue-500" />
          <span>{reward.stock || 'Unlimited'}</span>
        </div>
      )
    },
    {
      key: 'status',
      header: 'Status',
      render: (reward: ApiReward) => (
        <Badge 
          variant={reward.active ? "default" : "secondary"}
          className={reward.active ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200" : ""}
        >
          {reward.active ? 'Active' : 'Inactive'}
        </Badge>
      )
    },
    {
      key: 'created',
      header: 'Created',
      render: (reward: ApiReward) => (
        <div className="text-sm">
          {new Date(reward.createdAt).toLocaleDateString()}
        </div>
      )
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (reward: ApiReward) => (
        <div className="flex items-center justify-end space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleToggleActive(reward.id)}
            disabled={actionLoading === reward.id}
            className={reward.active ? "text-orange-600 hover:text-orange-700" : "text-green-600 hover:text-green-700"}
          >
            {actionLoading === reward.id ? (
              <Loader2 className="h-4 w-4 mr-1 animate-spin" />
            ) : reward.active ? (
              <>
                <ToggleLeft className="h-4 w-4 mr-1" />
                Deactivate
              </>
            ) : (
              <>
                <ToggleRight className="h-4 w-4 mr-1" />
                Activate
              </>
            )}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleDeleteReward(reward.id)}
            disabled={actionLoading === reward.id}
            className="text-red-600 hover:text-red-700"
          >
            {actionLoading === reward.id ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Trash2 className="h-4 w-4" />
            )}
          </Button>
        </div>
      )
    }
  ]

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Rewards</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Manage XP-based rewards and incentives
          </p>
        </div>
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Rewards</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Manage XP-based rewards and incentives
          </p>
        </div>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2 text-red-600">
              <AlertCircle className="h-5 w-5" />
              <p>Error loading rewards: {error}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Rewards</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Manage XP-based rewards and incentives
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Reward
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Create New Reward</DialogTitle>
              <DialogDescription>
                Add a new reward that users can redeem with XP
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={newReward.title}
                  onChange={(e) => setNewReward(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Reward title"
                />
              </div>
              <div>
                <Label htmlFor="costXp">XP Cost</Label>
                <Input
                  id="costXp"
                  type="number"
                  value={newReward.costXp}
                  onChange={(e) => setNewReward(prev => ({ ...prev, costXp: parseInt(e.target.value) }))}
                  placeholder="100"
                />
              </div>
              <div>
                <Label htmlFor="stock">Stock</Label>
                <Input
                  id="stock"
                  type="number"
                  value={newReward.stock}
                  onChange={(e) => setNewReward(prev => ({ ...prev, stock: parseInt(e.target.value) }))}
                  placeholder="10"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleAddReward}>
                Create Reward
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Rewards</CardTitle>
            <Gift className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{rewardsList.length}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active</CardTitle>
            <ToggleRight className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{activeCount}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Stock</CardTitle>
            <Package className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{totalStock.toLocaleString()}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Reward List</CardTitle>
          <CardDescription>
            Manage rewards and their availability
          </CardDescription>
        </CardHeader>
        <CardContent>
          <PaginatedTable
            data={rewardsList}
            columns={columns}
            loading={isLoading}
            error={error}
            emptyMessage="No rewards found"
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
        </CardContent>
      </Card>
    </div>
  )
}

