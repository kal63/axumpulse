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
import { Textarea } from '@/components/ui/textarea'
import { 
  Plus, 
  Gamepad2, 
  ToggleLeft, 
  ToggleRight, 
  AlertCircle, 
  Loader2, 
  Trash2, 
  Clock, 
  Target, 
  Award,
  Zap,
  RefreshCw,
  Database,
  Eye,
  Sparkles
} from 'lucide-react'
import { toast } from 'sonner'
import { apiClient, type Game as ApiGame } from '@/lib/api-client'
import { usePaginatedData } from '@/hooks/usePaginatedData'
import { PaginatedTable } from '@/components/pagination/PaginatedTable'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

export default function GamesPage() {
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [actionLoading, setActionLoading] = useState<number | null>(null)
  const [selectedGame, setSelectedGame] = useState<ApiGame | null>(null)
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false)
  const [cacheActionLoading, setCacheActionLoading] = useState<number | null>(null)
  const [gameStats, setGameStats] = useState<any>(null)
  const [filterGameType, setFilterGameType] = useState<string>('all')
  const [filterActive, setFilterActive] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState<string>('')

  const [newGame, setNewGame] = useState({
    title: '',
    description: '',
    gameType: 'spin_win' as 'spin_win' | 'quiz_battle' | 'memory_game',
    difficulty: 'beginner' as 'beginner' | 'intermediate' | 'advanced',
    xpReward: 10,
    active: true,
    useAiGeneration: false,
    aiPromptTemplate: '',
    configJson: {}
  })

  // Stable fetch function
  const fetchGames = useCallback(async (params: any) => {
    const fetchParams = {
      ...params,
      gameType: filterGameType !== 'all' ? filterGameType : undefined,
      active: filterActive !== 'all' ? filterActive : undefined,
      search: searchQuery || undefined
    }
    const response = await apiClient.getAdminGames(fetchParams)
    if (response.success && response.data) {
      return response.data
    }
    throw new Error(response.error?.message || 'Failed to fetch games')
  }, [filterGameType, filterActive, searchQuery])

  // Use the new pagination system
  const {
    data: gamesList,
    pagination,
    loading: isLoading,
    error,
    refetch
  } = usePaginatedData<ApiGame>({
    fetchFunction: fetchGames,
    initialPage: 1,
    initialPageSize: 20
  })

  // Refetch when filters change
  useEffect(() => {
    refetch()
  }, [filterGameType, filterActive, searchQuery, refetch])

  const handleToggleActive = async (id: number) => {
    try {
      setActionLoading(id)
      const game = gamesList.find(g => g.id === id)
      if (!game) return

      const response = await apiClient.updateGame(id, {
        active: !game.active
      })
      
      if (response.success && response.data) {
        refetch()
        toast.success('Game status updated')
      } else {
        toast.error(response.error?.message || 'Failed to update game')
      }
    } catch (err) {
      toast.error('Failed to update game')
    } finally {
      setActionLoading(null)
    }
  }

  const handleDeleteGame = async (id: number) => {
    try {
      setActionLoading(id)
      const response = await apiClient.deleteGame(id)
      
      if (response.success) {
        refetch()
        toast.success('Game deleted successfully')
      } else {
        toast.error(response.error?.message || 'Failed to delete game')
      }
    } catch (err) {
      toast.error('Failed to delete game')
    } finally {
      setActionLoading(null)
    }
  }

  const handleClearCache = async (id: number) => {
    try {
      setCacheActionLoading(id)
      const response = await apiClient.clearGameCache(id)
      
      if (response.success) {
        refetch()
        toast.success('Cache cleared successfully')
        if (selectedGame?.id === id) {
          loadGameDetails(id)
        }
      } else {
        toast.error(response.error?.message || 'Failed to clear cache')
      }
    } catch (err) {
      toast.error('Failed to clear cache')
    } finally {
      setCacheActionLoading(null)
    }
  }

  const handleRegenerateCache = async (id: number) => {
    try {
      setCacheActionLoading(id)
      const response = await apiClient.regenerateGameCache(id)
      
      if (response.success) {
        refetch()
        toast.success('Cache regenerated successfully')
        if (selectedGame?.id === id) {
          loadGameDetails(id)
        }
      } else {
        toast.error(response.error?.message || 'Failed to regenerate cache')
      }
    } catch (err) {
      toast.error('Failed to regenerate cache')
    } finally {
      setCacheActionLoading(null)
    }
  }

  const loadGameDetails = async (id: number) => {
    try {
      const response = await apiClient.getAdminGame(id)
      if (response.success && response.data) {
        setSelectedGame(response.data.game)
        setGameStats(response.data.stats)
      }
    } catch (err) {
      toast.error('Failed to load game details')
    }
  }

  const handleViewDetails = async (game: ApiGame) => {
    setSelectedGame(game)
    setIsDetailsModalOpen(true)
    await loadGameDetails(game.id)
  }

  const handleCloseDetailsModal = () => {
    setIsDetailsModalOpen(false)
    setSelectedGame(null)
    setGameStats(null)
  }

  const handleAddGame = async () => {
    try {
      const gameData: any = {
        title: newGame.title,
        description: newGame.description,
        gameType: newGame.gameType,
        difficulty: newGame.difficulty,
        xpReward: newGame.xpReward,
        active: newGame.active,
        useAiGeneration: newGame.useAiGeneration,
        configJson: newGame.configJson
      }

      if (newGame.useAiGeneration && newGame.aiPromptTemplate) {
        gameData.aiPromptTemplate = newGame.aiPromptTemplate
      }

      const response = await apiClient.createGame(gameData)
      
      if (response.success && response.data) {
        refetch()
        setNewGame({
          title: '',
          description: '',
          gameType: 'spin_win',
          difficulty: 'beginner',
          xpReward: 10,
          active: true,
          useAiGeneration: false,
          aiPromptTemplate: '',
          configJson: {}
        })
        setIsDialogOpen(false)
        toast.success('Game created successfully')
      } else {
        toast.error(response.error?.message || 'Failed to create game')
      }
    } catch (err) {
      toast.error('Failed to create game')
    }
  }

  const getGameTypeBadge = (gameType: string) => {
    switch (gameType) {
      case 'spin_win':
        return <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">Spin & Win</Badge>
      case 'quiz_battle':
        return <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">Quiz Battle</Badge>
      case 'memory_game':
        return <Badge className="bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200">Memory Game</Badge>
      default:
        return <Badge variant="secondary">{gameType}</Badge>
    }
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

  const activeCount = gamesList.filter(g => g.active).length
  const aiGamesCount = gamesList.filter(g => g.useAiGeneration).length

  // Define table columns
  const columns = [
    {
      key: 'title',
      header: 'Title',
      render: (game: ApiGame) => (
        <div>
          <p className="font-medium">{game.title}</p>
          <p className="text-sm text-gray-600 dark:text-gray-400">{game.description}</p>
        </div>
      )
    },
    {
      key: 'type',
      header: 'Type',
      render: (game: ApiGame) => (
        <div className="space-y-1">
          {getGameTypeBadge(game.gameType)}
          {getDifficultyBadge(game.difficulty || 'beginner')}
        </div>
      )
    },
    {
      key: 'ai',
      header: 'AI',
      render: (game: ApiGame) => (
        game.useAiGeneration ? (
          <Badge className="bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200">
            <Sparkles className="h-3 w-3 mr-1" />
            AI Enabled
          </Badge>
        ) : (
          <Badge variant="secondary">Static</Badge>
        )
      )
    },
    {
      key: 'cache',
      header: 'Cache',
      render: (game: ApiGame) => {
        const hasCache = game.cachedContent && game.cacheExpiresAt
        const isExpired = hasCache && game.cacheExpiresAt && new Date(game.cacheExpiresAt) < new Date()
        
        if (!game.useAiGeneration) {
          return <span className="text-sm text-gray-500">N/A</span>
        }
        
        if (!hasCache) {
          return <Badge variant="secondary">No Cache</Badge>
        }
        
        if (isExpired) {
          return <Badge className="bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200">Expired</Badge>
        }
        
        return (
          <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
            <Database className="h-3 w-3 mr-1" />
            Cached
          </Badge>
        )
      }
    },
    {
      key: 'xp',
      header: 'XP Reward',
      render: (game: ApiGame) => (
        <div className="space-y-1">
          <div className="text-sm font-medium">
            {game.xpReward || 0} XP
          </div>
          {game.gameType === 'spin_win' && (
            <Badge variant="outline" className="text-xs">
              <Target className="h-3 w-3 mr-1" />
              Derived from challenges
            </Badge>
          )}
        </div>
      )
    },
    {
      key: 'status',
      header: 'Status',
      render: (game: ApiGame) => (
        <Badge 
          variant={game.active ? "default" : "secondary"}
          className={game.active ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200" : ""}
        >
          {game.active ? 'Active' : 'Inactive'}
        </Badge>
      )
    },
    {
      key: 'created',
      header: 'Created',
      render: (game: ApiGame) => (
        <div className="text-sm">
          {new Date(game.createdAt).toLocaleDateString()}
        </div>
      )
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (game: ApiGame) => (
        <div className="flex items-center justify-end space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={(e) => {
              e.stopPropagation()
              handleViewDetails(game)
            }}
          >
            <Eye className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={(e) => {
              e.stopPropagation()
              handleToggleActive(game.id)
            }}
            disabled={actionLoading === game.id}
            className={game.active ? "text-orange-600 hover:text-orange-700" : "text-green-600 hover:text-green-700"}
          >
            {actionLoading === game.id ? (
              <Loader2 className="h-4 w-4 mr-1 animate-spin" />
            ) : game.active ? (
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
              handleDeleteGame(game.id)
            }}
            disabled={actionLoading === game.id}
            className="text-red-600 hover:text-red-700"
          >
            {actionLoading === game.id ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Trash2 className="h-4 w-4" />
            )}
          </Button>
        </div>
      )
    }
  ]

  if (isLoading && gamesList.length === 0) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Games</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Manage virtual fitness games and AI-generated content
            </p>
          </div>
        </div>
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
        </div>
      </div>
    )
  }

  if (error && gamesList.length === 0) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Games</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Manage virtual fitness games and AI-generated content
            </p>
          </div>
        </div>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2 text-red-600">
              <AlertCircle className="h-5 w-5" />
              <p>Error loading games: {error}</p>
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
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Games</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Manage virtual fitness games and AI-generated content
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            {/* <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Game
            </Button> */}
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create New Game</DialogTitle>
              <DialogDescription>
                Add a new virtual fitness game for users
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={newGame.title}
                  onChange={(e) => setNewGame(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Game title"
                />
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={newGame.description}
                  onChange={(e) => setNewGame(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Game description"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="gameType">Game Type</Label>
                  <Select
                    value={newGame.gameType}
                    onValueChange={(value: any) => setNewGame(prev => ({ ...prev, gameType: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="spin_win">Spin & Win</SelectItem>
                      <SelectItem value="quiz_battle">Quiz Battle</SelectItem>
                      <SelectItem value="memory_game">Memory Game</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="difficulty">Difficulty</Label>
                  <Select
                    value={newGame.difficulty}
                    onValueChange={(value: any) => setNewGame(prev => ({ ...prev, difficulty: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="beginner">Beginner</SelectItem>
                      <SelectItem value="intermediate">Intermediate</SelectItem>
                      <SelectItem value="advanced">Advanced</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <Label htmlFor="xpReward">XP Reward</Label>
                <Input
                  id="xpReward"
                  type="number"
                  value={newGame.xpReward}
                  onChange={(e) => setNewGame(prev => ({ ...prev, xpReward: parseInt(e.target.value) || 0 }))}
                  placeholder="10"
                />
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="useAiGeneration"
                  checked={newGame.useAiGeneration}
                  onChange={(e) => setNewGame(prev => ({ ...prev, useAiGeneration: e.target.checked }))}
                  className="rounded"
                />
                <Label htmlFor="useAiGeneration">Use AI Generation</Label>
              </div>
              {newGame.useAiGeneration && (
                <div>
                  <Label htmlFor="aiPromptTemplate">AI Prompt Template (Optional)</Label>
                  <Textarea
                    id="aiPromptTemplate"
                    value={newGame.aiPromptTemplate}
                    onChange={(e) => setNewGame(prev => ({ ...prev, aiPromptTemplate: e.target.value }))}
                    placeholder="Custom AI prompt template"
                  />
                </div>
              )}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleAddGame}>
                Create Game
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <Label htmlFor="search">Search</Label>
              <Input
                id="search"
                placeholder="Search games..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="gameType">Game Type</Label>
              <Select value={filterGameType} onValueChange={setFilterGameType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="spin_win">Spin & Win</SelectItem>
                  <SelectItem value="quiz_battle">Quiz Battle</SelectItem>
                  <SelectItem value="memory_game">Memory Game</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="active">Status</Label>
              <Select value={filterActive} onValueChange={setFilterActive}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="true">Active</SelectItem>
                  <SelectItem value="false">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end">
              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => {
                  setFilterGameType('all')
                  setFilterActive('all')
                  setSearchQuery('')
                }}
              >
                Clear Filters
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Games</CardTitle>
            <Gamepad2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{gamesList.length}</div>
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
            <CardTitle className="text-sm font-medium">AI Games</CardTitle>
            <Sparkles className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">{aiGamesCount}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Inactive</CardTitle>
            <ToggleLeft className="h-4 w-4 text-gray-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-600">{gamesList.length - activeCount}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Games List</CardTitle>
          <CardDescription>
            Manage existing games, view cached content, and regenerate AI content
          </CardDescription>
        </CardHeader>
        <CardContent>
          <PaginatedTable
            data={gamesList}
            columns={columns}
            loading={isLoading}
            error={error}
            emptyMessage="No games found"
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
            onRowClick={(game) => handleViewDetails(game)}
          />
        </CardContent>
      </Card>

      {/* Game Details Modal */}
      <Dialog open={isDetailsModalOpen} onOpenChange={handleCloseDetailsModal}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-3">
              <Gamepad2 className="h-8 w-8 text-emerald-600" />
              <div>
                <h2 className="text-xl font-semibold">
                  {selectedGame?.title}
                </h2>
                <DialogDescription>
                  {selectedGame?.active ? (
                    <Badge className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                      <ToggleRight className="h-3 w-3 mr-1" />
                      Active Game
                    </Badge>
                  ) : (
                    <Badge variant="secondary">
                      <ToggleLeft className="h-3 w-3 mr-1" />
                      Inactive Game
                    </Badge>
                  )}
                </DialogDescription>
              </div>
            </DialogTitle>
          </DialogHeader>

          {selectedGame && (
            <div className="space-y-6">
              {/* Game Description */}
              {selectedGame.description && (
                <div className="space-y-3">
                  <h3 className="text-lg font-medium flex items-center">
                    <Target className="h-5 w-5 mr-2 text-emerald-600" />
                    Description
                  </h3>
                  <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                    <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                      {selectedGame.description}
                    </p>
                  </div>
                </div>
              )}

              {/* Game Details */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium flex items-center">
                  <Award className="h-5 w-5 mr-2 text-emerald-600" />
                  Game Details
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                    <p className="text-sm font-medium">Type</p>
                    <div className="mt-1">
                      {getGameTypeBadge(selectedGame.gameType)}
                    </div>
                  </div>
                  <div className="p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                    <p className="text-sm font-medium">Difficulty</p>
                    <div className="mt-1">
                      {getDifficultyBadge(selectedGame.difficulty || 'beginner')}
                    </div>
                  </div>
                  <div className="p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                    <p className="text-sm font-medium">XP Reward</p>
                    <div className="mt-1">
                      <Badge>{selectedGame.xpReward || 0} XP</Badge>
                    </div>
                  </div>
                </div>
              </div>

              {/* AI Generation Info */}
              {selectedGame.useAiGeneration && (
                <div className="space-y-3">
                  <h3 className="text-lg font-medium flex items-center">
                    <Sparkles className="h-5 w-5 mr-2 text-purple-600" />
                    AI Generation
                  </h3>
                  <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">AI Enabled:</span>
                        <Badge className="bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200">
                          Yes
                        </Badge>
                      </div>
                      {selectedGame.aiPromptTemplate && (
                        <div>
                          <p className="text-sm font-medium mb-1">Prompt Template:</p>
                          <div className="p-2 bg-white dark:bg-gray-800 rounded text-xs font-mono">
                            {selectedGame.aiPromptTemplate}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Cache Status */}
              {selectedGame.useAiGeneration && (
                <div className="space-y-3">
                  <h3 className="text-lg font-medium flex items-center">
                    <Database className="h-5 w-5 mr-2 text-blue-600" />
                    Cache Status
                  </h3>
                  <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">Has Cache:</span>
                        <Badge variant={selectedGame.cachedContent ? "default" : "secondary"}>
                          {selectedGame.cachedContent ? 'Yes' : 'No'}
                        </Badge>
                      </div>
                      {selectedGame.cacheExpiresAt && (
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium">Expires:</span>
                          <span className="text-sm text-gray-600 dark:text-gray-400">
                            {new Date(selectedGame.cacheExpiresAt).toLocaleString()}
                            {new Date(selectedGame.cacheExpiresAt) < new Date() && (
                              <Badge className="ml-2 bg-orange-100 text-orange-800">Expired</Badge>
                            )}
                          </span>
                        </div>
                      )}
                      <div className="flex space-x-2 pt-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleClearCache(selectedGame.id)}
                          disabled={cacheActionLoading === selectedGame.id || !selectedGame.cachedContent}
                        >
                          {cacheActionLoading === selectedGame.id ? (
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          ) : (
                            <RefreshCw className="h-4 w-4 mr-2" />
                          )}
                          Clear Cache
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleRegenerateCache(selectedGame.id)}
                          disabled={cacheActionLoading === selectedGame.id}
                        >
                          {cacheActionLoading === selectedGame.id ? (
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          ) : (
                            <Zap className="h-4 w-4 mr-2" />
                          )}
                          Regenerate Cache
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Cached Content Preview */}
              {selectedGame.useAiGeneration && selectedGame.cachedContent && (
                <div className="space-y-3">
                  <h3 className="text-lg font-medium flex items-center">
                    <Eye className="h-5 w-5 mr-2 text-emerald-600" />
                    Cached Content Preview
                  </h3>
                  <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                    <pre className="text-xs overflow-auto max-h-64 p-2 bg-white dark:bg-gray-800 rounded">
                      {JSON.stringify(selectedGame.cachedContent, null, 2)}
                    </pre>
                  </div>
                </div>
              )}

              {/* Game Statistics */}
              {gameStats && (
                <div className="space-y-3">
                  <h3 className="text-lg font-medium flex items-center">
                    <Target className="h-5 w-5 mr-2 text-emerald-600" />
                    Statistics
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                      <p className="text-sm font-medium">Total Plays</p>
                      <p className="text-2xl font-bold">{gameStats.totalPlays || 0}</p>
                    </div>
                    <div className="p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                      <p className="text-sm font-medium">Total XP Awarded</p>
                      <p className="text-2xl font-bold">{gameStats.totalXpAwarded || 0}</p>
                    </div>
                    <div className="p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                      <p className="text-sm font-medium">Average Score</p>
                      <p className="text-2xl font-bold">
                        {gameStats.averageScore ? parseFloat(gameStats.averageScore).toFixed(1) : '0.0'}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Game Metadata */}
              <div className="space-y-3">
                <h3 className="text-lg font-medium flex items-center">
                  <Clock className="h-5 w-5 mr-2 text-emerald-600" />
                  Game Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                    <p className="text-sm font-medium">Created</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {new Date(selectedGame.createdAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </p>
                  </div>
                  <div className="p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                    <p className="text-sm font-medium">Game ID</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400 font-mono">
                      #{selectedGame.id}
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
                    handleToggleActive(selectedGame.id)
                    handleCloseDetailsModal()
                  }}
                  disabled={actionLoading === selectedGame.id}
                  className={selectedGame.active ? "text-orange-600 hover:text-orange-700" : "text-green-600 hover:text-green-700"}
                >
                  {actionLoading === selectedGame.id ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : selectedGame.active ? (
                    <>
                      <ToggleLeft className="h-4 w-4 mr-2" />
                      Deactivate Game
                    </>
                  ) : (
                    <>
                      <ToggleRight className="h-4 w-4 mr-2" />
                      Activate Game
                    </>
                  )}
                </Button>
                <Button
                  variant="outline"
                  onClick={(e) => {
                    e.stopPropagation()
                    handleDeleteGame(selectedGame.id)
                    handleCloseDetailsModal()
                  }}
                  disabled={actionLoading === selectedGame.id}
                  className="text-red-600 hover:text-red-700"
                >
                  {actionLoading === selectedGame.id ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <>
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete Game
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

