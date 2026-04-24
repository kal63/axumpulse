'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/auth-context'
import { apiClient } from '@/lib/api-client'
import { NeumorphicCard } from '@/components/user/NeumorphicCard'
import { PaginationControls } from '@/components/user/PaginationControls'
import { EmptyState } from '@/components/user/EmptyState'
import { LoadingGrid } from '@/components/user/LoadingGrid'
import { FeaturedBadge } from '@/components/user/FeaturedBadge'
import { 
  Trophy, 
  Users, 
  Clock, 
  Calendar,
  Star,
  Zap,
  ArrowLeft,
  ChevronRight
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useToast } from '@/hooks/use-toast'

export default function FeaturedChallengesPage() {
  const { user } = useAuth()
  const router = useRouter()
  const { toast } = useToast()
  const [challenges, setChallenges] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [joiningChallengeId, setJoiningChallengeId] = useState<number | null>(null)

  // Pagination
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const pageSize = 12

  useEffect(() => {
    fetchFeaturedChallenges()
  }, [page])

  async function fetchFeaturedChallenges() {
    try {
      setLoading(true)
      setError(null)

      const response = await apiClient.getFeaturedChallenges({
        page,
        pageSize
      })

      if (response.success && response.data) {
        setChallenges(response.data.items)
        setTotalPages(response.data.pagination?.totalPages || 1)
      } else {
        setError('Failed to load featured challenges')
      }
    } catch (err) {
      console.error('Error fetching featured challenges:', err)
      setError('Failed to load featured challenges')
    } finally {
      setLoading(false)
    }
  }

  const handleJoinChallenge = async (challengeId: number, e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault()
      e.stopPropagation()
    }

    if (!user) {
      toast({
        title: 'Login Required',
        description: 'Please log in to join challenges',
        variant: 'destructive'
      })
      return
    }

    try {
      setJoiningChallengeId(challengeId)
      await apiClient.joinChallenge(challengeId)
      toast({
        title: 'Success!',
        description: 'You have joined the challenge',
      })
      // Refresh the list
      fetchFeaturedChallenges()
    } catch (err: any) {
      console.error('Error joining challenge:', err)
      toast({
        title: 'Error',
        description: err?.data?.error?.message || 'Failed to join challenge',
        variant: 'destructive'
      })
    } finally {
      setJoiningChallengeId(null)
    }
  }

  return (
    <div className="min-h-dvh min-h-full user-app-page">
      {/* Header */}
      <div className="px-4 md:px-8 py-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center space-x-4">
              <Button
                variant="outline"
                onClick={() => router.push('/user/challenges')}
                className="flex items-center space-x-2"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>Back</span>
              </Button>
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-r from-yellow-500 to-orange-600 rounded-full flex items-center justify-center">
                  <Star className="w-5 h-5 text-white fill-current" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold user-app-ink">
                    Featured Challenges
                  </h1>
                  <p className="text-sm user-app-muted mt-1">
                    Discover our handpicked selection of featured challenges
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Loading State */}
          {loading && <LoadingGrid count={pageSize} />}

          {/* Error State */}
          {error && (
            <EmptyState
              icon={Trophy}
              title="Error Loading Featured Challenges"
              description={error}
              actionLabel="Try Again"
              onAction={fetchFeaturedChallenges}
            />
          )}

          {/* Empty State */}
          {!loading && !error && challenges.length === 0 && (
            <EmptyState
              icon={Star}
              title="No Featured Challenges"
              description="There are no featured challenges at the moment. Check back soon!"
            />
          )}

          {/* Challenges Grid */}
          {!loading && !error && challenges.length > 0 && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                {challenges.map((challenge) => (
                  <NeumorphicCard key={challenge.id} variant="raised" className="group hover:scale-105 transition-all duration-300 relative">
                    <div 
                      className="p-6 space-y-4 cursor-pointer"
                      onClick={() => router.push(`/user/challenges/${challenge.id}`)}
                    >
                      {/* Featured Badge */}
                      <div className="absolute top-4 right-4 z-10">
                        <FeaturedBadge size="sm" />
                      </div>
                      
                      {/* Header */}
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3 flex-1">
                          <div className="w-12 h-12 bg-gradient-to-br from-[var(--ethio-lemon)] to-[var(--ethio-deep-blue)] rounded-xl flex items-center justify-center">
                            <Trophy className="h-6 w-6 text-white" />
                          </div>
                          <div className="flex-1">
                            <h3 className="font-bold text-lg user-app-ink group-hover:user-app-link transition-colors line-clamp-2">
                              {challenge.title}
                            </h3>
                            <p className="text-sm user-app-muted mt-1">
                              {challenge.category}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Description */}
                      {challenge.description && (
                        <p className="text-sm user-app-muted line-clamp-2">
                          {challenge.description}
                        </p>
                      )}

                      {/* Meta Info */}
                      <div className="flex flex-wrap items-center gap-3 text-sm">
                        <div className="flex items-center gap-1 user-app-muted">
                          <Users className="h-4 w-4" />
                          <span>{challenge.participantCount || 0} participants</span>
                        </div>
                        <div className="flex items-center gap-1 user-app-muted">
                          <Clock className="h-4 w-4" />
                          <span>{challenge.duration || 0} days</span>
                        </div>
                        <div className="flex items-center gap-1 user-app-muted">
                          <Calendar className="h-4 w-4" />
                          <span>
                            {challenge.endTime 
                              ? new Date(challenge.endTime).toLocaleDateString('en-US', {
                                  month: 'short',
                                  day: 'numeric'
                                })
                              : 'Invalid date'}
                          </span>
                        </div>
                      </div>

                      {/* Footer */}
                      <div className="flex items-center justify-between pt-4">
                        <div className="flex items-center gap-1 text-[var(--ethio-lemon-dark)]">
                          <Zap className="h-4 w-4" />
                          <span className="font-semibold">+{challenge.xpReward || 0} XP</span>
                        </div>
                        
                        {/* Check challenge status and user progress */}
                        {(() => {
                          const endTime = challenge.endTime ? new Date(challenge.endTime) : null
                          const startTime = challenge.startTime ? new Date(challenge.startTime) : null
                          const now = new Date()
                          const isEnded = endTime ? endTime < now : false
                          const isActive = startTime && endTime ? startTime <= now && endTime >= now : false
                          const hasJoined = challenge.userProgress && challenge.userProgress.length > 0

                          if (hasJoined) {
                            return (
                              <button 
                                onClick={(e) => {
                                  e.preventDefault()
                                  e.stopPropagation()
                                  router.push(`/user/challenges/${challenge.id}`)
                                }}
                                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-full text-sm font-medium hover:from-green-600 hover:to-emerald-700 transition-all duration-200 transform hover:scale-105 shadow-lg z-10 relative"
                              >
                                <span>View Progress</span>
                                <ChevronRight className="h-4 w-4" />
                              </button>
                            )
                          } else if (isEnded) {
                            return (
                              <button 
                                disabled
                                className="flex items-center gap-2 px-4 py-2 bg-gray-300 dark:bg-gray-700 text-gray-500 dark:text-gray-400 rounded-full text-sm font-medium cursor-not-allowed z-10 relative"
                              >
                                <span>Challenge Ended</span>
                              </button>
                            )
                          } else if (isActive) {
                            return (
                              <button 
                                onClick={(e) => {
                                  e.preventDefault()
                                  e.stopPropagation()
                                  handleJoinChallenge(challenge.id, e)
                                }}
                                disabled={joiningChallengeId === challenge.id}
                                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[var(--ethio-lemon)] to-[var(--ethio-deep-blue)] text-white rounded-full text-sm font-medium hover:opacity-95 transition-all duration-200 transform hover:scale-105 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed z-10 relative"
                              >
                                <span>{joiningChallengeId === challenge.id ? 'Joining...' : 'Join Challenge'}</span>
                                <ChevronRight className="h-4 w-4" />
                              </button>
                            )
                          } else {
                            return (
                              <button 
                                disabled
                                className="flex items-center gap-2 px-4 py-2 bg-blue-300 dark:bg-blue-700 text-blue-600 dark:text-blue-300 rounded-full text-sm font-medium cursor-not-allowed z-10 relative"
                              >
                                <span>Starts Soon</span>
                              </button>
                            )
                          }
                        })()}
                      </div>
                    </div>
                  </NeumorphicCard>
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <PaginationControls
                  currentPage={page}
                  totalPages={totalPages}
                  onPageChange={setPage}
                />
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}

