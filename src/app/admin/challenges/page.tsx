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
import { Plus, Trophy, Users, Calendar, Zap, Globe, ToggleLeft, ToggleRight, AlertCircle, Loader2, Trash2, Clock, Target, Award } from 'lucide-react'
import { toast } from 'sonner'
import { apiClient, type Challenge as ApiChallenge } from '@/lib/api-client'
import { usePaginatedData } from '@/hooks/usePaginatedData'
import { PaginatedTable } from '@/components/pagination/PaginatedTable'

export default function ChallengesPage() {
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [actionLoading, setActionLoading] = useState<number | null>(null)
  const [selectedChallenge, setSelectedChallenge] = useState<ApiChallenge | null>(null)
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false)
  const [newChallenge, setNewChallenge] = useState({
    title: '',
    description: '',
    kind: 'daily' as const,
    ruleJson: {},
    startTime: '',
    endTime: '',
    active: true
  })

  // Stable fetch function
  const fetchChallenges = useCallback(async (params: any) => {
    const response = await apiClient.getChallenges(params)
    if (response.success && response.data) {
      return response.data
    }
    throw new Error(response.error?.message || 'Failed to fetch challenges')
  }, [])

  // Use the new pagination system
  const {
    data: challengesList,
    pagination,
    loading: isLoading,
    error,
    refetch
  } = usePaginatedData<ApiChallenge>({
    fetchFunction: fetchChallenges,
    initialPage: 1,
    initialPageSize: 20
  })

  const handleToggleActive = async (id: number) => {
    try {
      setActionLoading(id)
      const challenge = challengesList.find(c => c.id === id)
      if (!challenge) return

      const response = await apiClient.updateChallenge(id, {
        active: !challenge.active
      })
      
      if (response.success && response.data) {
        refetch()
        toast.success('Challenge status updated')
      } else {
        toast.error(response.error?.message || 'Failed to update challenge')
      }
    } catch (err) {
      toast.error('Failed to update challenge')
    } finally {
      setActionLoading(null)
    }
  }

  const handleDeleteChallenge = async (id: number) => {
    try {
      setActionLoading(id)
      const response = await apiClient.deleteChallenge(id)
      
      if (response.success) {
        refetch()
        toast.success('Challenge deleted successfully')
      } else {
        toast.error(response.error?.message || 'Failed to delete challenge')
      }
    } catch (err) {
      toast.error('Failed to delete challenge')
    } finally {
      setActionLoading(null)
    }
  }

  const handleAddChallenge = async () => {
    try {
      const challengeData: any = {
        title: newChallenge.title,
        description: newChallenge.description,
        kind: newChallenge.kind,
        ruleJson: newChallenge.ruleJson,
        active: newChallenge.active
      }

      // Only add startTime and endTime if they have values
      if (newChallenge.startTime) {
        challengeData.startTime = newChallenge.startTime
      }
      if (newChallenge.endTime) {
        challengeData.endTime = newChallenge.endTime
      }

      const response = await apiClient.createChallenge(challengeData)
      
      if (response.success && response.data) {
        refetch()
        setNewChallenge({
          title: '',
          description: '',
          kind: 'daily',
          ruleJson: {},
          startTime: '',
          endTime: '',
          active: true
        })
        setIsDialogOpen(false)
        toast.success('Challenge created successfully')
      } else {
        toast.error(response.error?.message || 'Failed to create challenge')
      }
    } catch (err) {
      toast.error('Failed to create challenge')
    }
  }

  const getTypeBadge = (kind: string) => {
    switch (kind) {
      case 'daily':
        return <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">Daily</Badge>
      case 'weekly':
        return <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">Weekly</Badge>
      case 'oneoff':
        return <Badge className="bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200">One-off</Badge>
      default:
        return <Badge variant="secondary">{kind}</Badge>
    }
  }

  const activeCount = challengesList.filter(c => c.active).length

  // Define table columns
  const columns = [
    {
      key: 'title',
      header: 'Title',
      render: (challenge: ApiChallenge) => (
        <div>
          <p className="font-medium">{challenge.title}</p>
          <p className="text-sm text-gray-600 dark:text-gray-400">{challenge.description}</p>
        </div>
      )
    },
    {
      key: 'type',
      header: 'Type',
      render: (challenge: ApiChallenge) => getTypeBadge(challenge.kind)
    },
    {
      key: 'duration',
      header: 'Duration',
      render: (challenge: ApiChallenge) => (
        <div className="text-sm">
          {challenge.startTime && (
            <p>{new Date(challenge.startTime).toLocaleDateString()}</p>
          )}
          {challenge.endTime && (
            <p className="text-gray-500">to {new Date(challenge.endTime).toLocaleDateString()}</p>
          )}
          {!challenge.startTime && !challenge.endTime && (
            <p className="text-gray-500">No time limit</p>
          )}
        </div>
      )
    },
    {
      key: 'status',
      header: 'Status',
      render: (challenge: ApiChallenge) => (
        <Badge 
          variant={challenge.active ? "default" : "secondary"}
          className={challenge.active ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200" : ""}
        >
          {challenge.active ? 'Active' : 'Inactive'}
        </Badge>
      )
    },
    {
      key: 'created',
      header: 'Created',
      render: (challenge: ApiChallenge) => (
        <div className="text-sm">
          {new Date(challenge.createdAt).toLocaleDateString()}
        </div>
      )
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (challenge: ApiChallenge) => (
        <div className="flex items-center justify-end space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={(e) => {
              e.stopPropagation()
              handleToggleActive(challenge.id)
            }}
            disabled={actionLoading === challenge.id}
            className={challenge.active ? "text-orange-600 hover:text-orange-700" : "text-green-600 hover:text-green-700"}
          >
            {actionLoading === challenge.id ? (
              <Loader2 className="h-4 w-4 mr-1 animate-spin" />
            ) : challenge.active ? (
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
            onClick={(e) => {
              e.stopPropagation()
              handleDeleteChallenge(challenge.id)
            }}
            disabled={actionLoading === challenge.id}
            className="text-red-600 hover:text-red-700"
          >
            {actionLoading === challenge.id ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Trash2 className="h-4 w-4" />
            )}
          </Button>
        </div>
      )
    }
  ]

  const handleViewDetails = (challenge: ApiChallenge) => {
    setSelectedChallenge(challenge)
    setIsDetailsModalOpen(true)
  }

  const handleCloseDetailsModal = () => {
    setIsDetailsModalOpen(false)
    setSelectedChallenge(null)
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Challenges</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Manage fitness and wellness challenges
            </p>
          </div>
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
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Challenges</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Manage fitness and wellness challenges
            </p>
          </div>
        </div>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2 text-red-600">
              <AlertCircle className="h-5 w-5" />
              <p>Error loading challenges: {error}</p>
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
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Challenges</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Manage fitness and wellness challenges
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Challenge
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Create New Challenge</DialogTitle>
              <DialogDescription>
                Add a new challenge for users to participate in
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={newChallenge.title}
                  onChange={(e) => setNewChallenge(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Challenge title"
                />
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Input
                  id="description"
                  value={newChallenge.description}
                  onChange={(e) => setNewChallenge(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Challenge description"
                />
              </div>
              <div>
                <Label htmlFor="kind">Type</Label>
                <select
                  id="kind"
                  value={newChallenge.kind}
                  onChange={(e) => setNewChallenge(prev => ({ ...prev, kind: e.target.value as any }))}
                  className="w-full p-2 border border-gray-300 rounded-md"
                >
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="oneoff">One-off</option>
                </select>
              </div>
              <div>
                <Label htmlFor="startTime">Start Time (Optional)</Label>
                <Input
                  id="startTime"
                  type="datetime-local"
                  value={newChallenge.startTime}
                  onChange={(e) => setNewChallenge(prev => ({ ...prev, startTime: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="endTime">End Time (Optional)</Label>
                <Input
                  id="endTime"
                  type="datetime-local"
                  value={newChallenge.endTime}
                  onChange={(e) => setNewChallenge(prev => ({ ...prev, endTime: e.target.value }))}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleAddChallenge}>
                Create Challenge
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Challenges</CardTitle>
            <Trophy className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{challengesList.length}</div>
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
            <CardTitle className="text-sm font-medium">Inactive</CardTitle>
            <ToggleLeft className="h-4 w-4 text-gray-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-600">{challengesList.length - activeCount}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Challenge List</CardTitle>
          <CardDescription>
            Manage existing challenges and their status
          </CardDescription>
        </CardHeader>
        <CardContent>
          <PaginatedTable
            data={challengesList}
            columns={columns}
            loading={isLoading}
            error={error}
            emptyMessage="No challenges found"
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
            onRowClick={(challenge) => handleViewDetails(challenge)}
          />
        </CardContent>
      </Card>

      {/* Challenge Details Modal */}
      <Dialog open={isDetailsModalOpen} onOpenChange={handleCloseDetailsModal}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-3">
              <Trophy className="h-8 w-8 text-emerald-600" />
              <div>
                <h2 className="text-xl font-semibold">
                  {selectedChallenge?.title}
                </h2>
                <DialogDescription>
                  {selectedChallenge?.active ? (
                    <Badge className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                      <ToggleRight className="h-3 w-3 mr-1" />
                      Active Challenge
                    </Badge>
                  ) : (
                    <Badge variant="secondary">
                      <ToggleLeft className="h-3 w-3 mr-1" />
                      Inactive Challenge
                    </Badge>
                  )}
                </DialogDescription>
              </div>
            </DialogTitle>
          </DialogHeader>

          {selectedChallenge && (
            <div className="space-y-6">
              {/* Challenge Description */}
              {selectedChallenge.description && (
                <div className="space-y-3">
                  <h3 className="text-lg font-medium flex items-center">
                    <Target className="h-5 w-5 mr-2 text-emerald-600" />
                    Description
                  </h3>
                  <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                    <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                      {selectedChallenge.description}
                    </p>
                  </div>
                </div>
              )}

              {/* Challenge Type and Rules */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium flex items-center">
                  <Award className="h-5 w-5 mr-2 text-emerald-600" />
                  Challenge Details
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                    <p className="text-sm font-medium">Type</p>
                    <div className="mt-1">
                      {getTypeBadge(selectedChallenge.kind)}
                    </div>
                  </div>
                  <div className="p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                    <p className="text-sm font-medium">Status</p>
                    <div className="mt-1">
                      <Badge 
                        variant={selectedChallenge.active ? "default" : "secondary"}
                        className={selectedChallenge.active ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200" : ""}
                      >
                        {selectedChallenge.active ? 'Active' : 'Inactive'}
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>

              {/* Challenge Rules */}
              {selectedChallenge.ruleJson && Object.keys(selectedChallenge.ruleJson).length > 0 && (
                <div className="space-y-3">
                  <h3 className="text-lg font-medium flex items-center">
                    <Zap className="h-5 w-5 mr-2 text-emerald-600" />
                    Challenge Rules
                  </h3>
                  <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                    <div className="space-y-2">
                      {Object.entries(selectedChallenge.ruleJson).map(([key, value]) => (
                        <div key={key} className="flex justify-between items-center">
                          <span className="text-sm font-medium capitalize">
                            {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}:
                          </span>
                          <span className="text-sm text-gray-600 dark:text-gray-400">
                            {typeof value === 'object' ? JSON.stringify(value) : String(value)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Time Information */}
              <div className="space-y-3">
                <h3 className="text-lg font-medium flex items-center">
                  <Clock className="h-5 w-5 mr-2 text-emerald-600" />
                  Time Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                    <p className="text-sm font-medium">Start Time</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {selectedChallenge.startTime ? 
                        new Date(selectedChallenge.startTime).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        }) : 'No start time set'
                      }
                    </p>
                  </div>
                  <div className="p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                    <p className="text-sm font-medium">End Time</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {selectedChallenge.endTime ? 
                        new Date(selectedChallenge.endTime).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        }) : 'No end time set'
                      }
                    </p>
                  </div>
                </div>
              </div>

              {/* Challenge Metadata */}
              <div className="space-y-3">
                <h3 className="text-lg font-medium flex items-center">
                  <Calendar className="h-5 w-5 mr-2 text-emerald-600" />
                  Challenge Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                    <p className="text-sm font-medium">Created</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {new Date(selectedChallenge.createdAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </p>
                  </div>
                  <div className="p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                    <p className="text-sm font-medium">Challenge ID</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400 font-mono">
                      #{selectedChallenge.id}
                    </p>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex justify-end space-x-3 pt-4 border-t">
                <Button
                  variant="outline"
                  onClick={(e) => {
                    e.stopPropagation()
                    handleToggleActive(selectedChallenge.id)
                    handleCloseDetailsModal()
                  }}
                  disabled={actionLoading === selectedChallenge.id}
                  className={selectedChallenge.active ? "text-orange-600 hover:text-orange-700" : "text-green-600 hover:text-green-700"}
                >
                  {actionLoading === selectedChallenge.id ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : selectedChallenge.active ? (
                    <>
                      <ToggleLeft className="h-4 w-4 mr-2" />
                      Deactivate Challenge
                    </>
                  ) : (
                    <>
                      <ToggleRight className="h-4 w-4 mr-2" />
                      Activate Challenge
                    </>
                  )}
                </Button>
                <Button
                  variant="outline"
                  onClick={(e) => {
                    e.stopPropagation()
                    handleDeleteChallenge(selectedChallenge.id)
                    handleCloseDetailsModal()
                  }}
                  disabled={actionLoading === selectedChallenge.id}
                  className="text-red-600 hover:text-red-700"
                >
                  {actionLoading === selectedChallenge.id ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <>
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete Challenge
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

