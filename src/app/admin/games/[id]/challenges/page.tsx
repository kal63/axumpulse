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
import { apiClient, type Game, type Challenge } from '@/lib/api-client'
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
  const [selectedChallenge, setSelectedChallenge] = useState<Challenge | null>(null)
  const [isChallengeModalOpen, setIsChallengeModalOpen] = useState(false)
  const [actionLoading, setActionLoading] = useState<number | null>(null)
  
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [typeFilter, setTypeFilter] = useState<string>('all')
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

  // Fetch challenges - show added ones (isGameChallenge: true) or all
  const fetchChallenges = useCallback(async (params: any) => {
    const fetchParams = {
      ...params,
      search: searchQuery || undefined,
      status: statusFilter !== 'all' ? statusFilter : undefined,
      type: typeFilter !== 'all' ? typeFilter : undefined,
      difficulty: difficultyFilter !== 'all' ? difficultyFilter : undefined
    }
    const response = await apiClient.getChallenges(fetchParams)
    if (response.success && response.data) {
      // Filter based on showAddedOnly
      let challenges = response.data.items || []
      if (showAddedOnly) {
        challenges = challenges.filter((c: Challenge) => c.isGameChallenge === true)
      }
      return {
        items: challenges,
        pagination: response.data.pagination || {
          page: 1,
          pageSize: challenges.length,
          totalItems: challenges.length,
          totalPages: 1,
          hasNext: false,
          hasPrev: false
        }
      }
    }
    throw new Error(response.error?.message || 'Failed to fetch challenges')
  }, [searchQuery, statusFilter, typeFilter, difficultyFilter, showAddedOnly])

  const {
    data: challenges,
    pagination,
    loading: isLoadingChallenges,
    refetch: refetchChallenges
  } = usePaginatedData<Challenge>({
    fetchFunction: fetchChallenges,
    initialPage: 1,
    initialPageSize: 100
  })

  // Separate added and available challenges
  const addedChallenges = challenges.filter(c => c.isGameChallenge === true)
  const availableChallenges = challenges.filter(c => c.isGameChallenge !== true)

  const handleToggleChallenge = async (challengeId: number, currentValue: boolean) => {
    try {
      setActionLoading(challengeId)
      const response = await apiClient.updateChallenge(challengeId, {
        isGameChallenge: !currentValue
      })
      
      if (response.success) {
        toast.success(`Challenge ${!currentValue ? 'added to' : 'removed from'} game`)
        refetchChallenges()
      } else {
        toast.error(response.error?.message || 'Failed to update challenge')
      }
    } catch (error) {
      toast.error('Failed to update challenge')
    } finally {
      setActionLoading(null)
    }
  }

  const handleViewChallenge = (challenge: Challenge) => {
    setSelectedChallenge(challenge)
    setIsChallengeModalOpen(true)
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

  const getTypeBadge = (type: string) => {
    const colors: Record<string, string> = {
      fitness: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
      nutrition: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      wellness: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
      achievement: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200'
    }
    return <Badge className={colors[type] || 'bg-gray-100 text-gray-800'}>{type}</Badge>
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

  // Define columns for challenges table
  const challengeColumns = [
    {
      key: 'title',
      header: 'Challenge',
      render: (challenge: Challenge) => (
        <div>
          <p className="font-medium">{challenge.title}</p>
          {challenge.description && (
            <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-1">{challenge.description}</p>
          )}
        </div>
      )
    },
    {
      key: 'details',
      header: 'Details',
      render: (challenge: Challenge) => (
        <div className="space-y-1">
          {getTypeBadge(challenge.type || 'fitness')}
          {getDifficultyBadge(challenge.difficulty || 'beginner')}
        </div>
      )
    },
    {
      key: 'xp',
      header: 'XP Reward',
      render: (challenge: Challenge) => (
        <div className="text-sm font-medium">
          {challenge.xpReward || 0} XP
        </div>
      )
    },
    {
      key: 'status',
      header: 'Status',
      render: (challenge: Challenge) => getStatusBadge(challenge.status || 'draft')
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (challenge: Challenge) => (
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleViewChallenge(challenge)}
          >
            <Eye className="h-4 w-4" />
          </Button>
          {challenge.isGameChallenge ? (
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleToggleChallenge(challenge.id, true)}
              disabled={actionLoading === challenge.id}
              className="text-red-600 hover:text-red-700"
            >
              {actionLoading === challenge.id ? (
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
              onClick={() => handleToggleChallenge(challenge.id, false)}
              disabled={actionLoading === challenge.id}
            >
              {actionLoading === challenge.id ? (
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
              Manage challenges for Spin & Win game
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
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Challenges Added</p>
              <p className="text-2xl font-bold mt-1">{addedChallenges.length}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Currently Added Challenges */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Award className="h-5 w-5 text-emerald-600" />
            <span>Currently Added Challenges ({addedChallenges.length})</span>
          </CardTitle>
          <CardDescription>
            Challenges that are currently part of this Spin & Win game
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoadingChallenges ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
            </div>
          ) : addedChallenges.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <Target className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No challenges added yet. Add challenges from the list below.</p>
            </div>
          ) : (
            <PaginatedTable
              data={addedChallenges}
              columns={challengeColumns}
              loading={false}
              emptyMessage="No challenges added"
              currentPage={1}
              totalPages={1}
              pageSize={addedChallenges.length}
              totalItems={addedChallenges.length}
              onPageChange={() => {}}
              onPageSizeChange={() => {}}
              showPagination={false}
              showPageSizeSelector={false}
              showInfo={false}
            />
          )}
        </CardContent>
      </Card>

      {/* All Challenges */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Plus className="h-5 w-5 text-emerald-600" />
            <span>All Challenges</span>
          </CardTitle>
          <CardDescription>
            Select challenges to add to this Spin & Win game. Toggle the "Add to Game" button to add or remove challenges.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Filters */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
            <div>
              <Label htmlFor="search">Search</Label>
              <Input
                id="search"
                placeholder="Search challenges..."
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
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="type">Type</Label>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger>
                  <SelectValue />
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
                  setTypeFilter('all')
                  setDifficultyFilter('all')
                  setShowAddedOnly(false)
                }}
              >
                Clear Filters
              </Button>
            </div>
          </div>

          {isLoadingChallenges ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
            </div>
          ) : challenges.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <AlertCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No challenges found.</p>
            </div>
          ) : (
            <PaginatedTable
              data={challenges}
              columns={challengeColumns}
              loading={isLoadingChallenges}
              emptyMessage="No challenges available"
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

      {/* Challenge Details Modal */}
      <Dialog open={isChallengeModalOpen} onOpenChange={setIsChallengeModalOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{selectedChallenge?.title}</DialogTitle>
            <DialogDescription>
              Challenge details and information
            </DialogDescription>
          </DialogHeader>
          
          {selectedChallenge && (
            <div className="space-y-4">
              <div>
                <Label>Description</Label>
                <p className="text-sm text-gray-700 dark:text-gray-300 mt-1">
                  {selectedChallenge.description || 'No description provided'}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Type</Label>
                  <div className="mt-1">{getTypeBadge(selectedChallenge.type || 'fitness')}</div>
                </div>
                <div>
                  <Label>Difficulty</Label>
                  <div className="mt-1">{getDifficultyBadge(selectedChallenge.difficulty || 'beginner')}</div>
                </div>
                <div>
                  <Label>XP Reward</Label>
                  <p className="text-sm font-medium mt-1">{selectedChallenge.xpReward || 0} XP</p>
                </div>
                <div>
                  <Label>Status</Label>
                  <div className="mt-1">{getStatusBadge(selectedChallenge.status || 'draft')}</div>
                </div>
              </div>

              {selectedChallenge.requirements && (
                <div>
                  <Label>Requirements</Label>
                  <p className="text-sm text-gray-700 dark:text-gray-300 mt-1">
                    {selectedChallenge.requirements}
                  </p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Duration</Label>
                  <p className="text-sm mt-1">{selectedChallenge.duration || 7} days</p>
                </div>
                <div>
                  <Label>Language</Label>
                  <p className="text-sm mt-1">{selectedChallenge.language || 'en'}</p>
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsChallengeModalOpen(false)}>
              Close
            </Button>
            {selectedChallenge && (
              <Button onClick={() => {
                handleToggleChallenge(selectedChallenge.id, selectedChallenge.isGameChallenge || false)
                setIsChallengeModalOpen(false)
              }}>
                {selectedChallenge.isGameChallenge ? (
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

