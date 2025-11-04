'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/auth-context'
import { apiClient } from '@/lib/api-client'
import { WorkoutPlanGrid, PaginationControls, EmptyState, LoadingGrid } from '@/components/user'
import { Star, ArrowLeft, Dumbbell } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { WorkoutPlan } from '@/lib/api-client'

export default function FeaturedWorkoutPlansPage() {
  const router = useRouter()
  const { user } = useAuth()
  const [plans, setPlans] = useState<WorkoutPlan[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Pagination
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalItems, setTotalItems] = useState(0)
  const pageSize = 9

  useEffect(() => {
    fetchFeaturedPlans()
  }, [currentPage])

  const fetchFeaturedPlans = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await apiClient.getFeaturedWorkoutPlans({
        page: currentPage,
        pageSize
      })

      if (response.success && response.data) {
        setPlans(response.data.items)
        setTotalPages(response.data.pagination.totalPages)
        setTotalItems(response.data.pagination.totalItems)
      } else {
        setError('Failed to load featured workout plans')
      }
    } catch (error) {
      console.error('Error fetching featured workout plans:', error)
      setError('Failed to load featured workout plans')
    } finally {
      setLoading(false)
    }
  }

  const handlePlanClick = (plan: WorkoutPlan) => {
    router.push(`/user/workout-plans/${plan.id}`)
  }

  // Create userProgressMap from plans
  const userProgressMap = new Map(
    plans
      .filter(plan => (plan as any).userProgress && (plan as any).userProgress.length > 0)
      .map(plan => {
        const progress = (plan as any).userProgress[0]
        return [
          plan.id,
          {
            status: progress.status,
            completedExercises: progress.completedExercises,
            totalExercises: progress.totalExercises
          }
        ]
      })
  )

  return (
    <div className="min-h-screen bg-[var(--neumorphic-bg)]">
      {/* Header */}
      <div className="px-4 md:px-8 py-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center space-x-4">
              <Button
                variant="outline"
                onClick={() => router.push('/user/workout-plans')}
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
                  <h1 className="text-3xl font-bold text-[var(--neumorphic-text)]">
                    Featured Workout Plans
                  </h1>
                  <p className="text-sm text-[var(--neumorphic-muted)] mt-1">
                    Discover our handpicked selection of featured workout plans
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
              icon={Dumbbell}
              title="Error Loading Featured Workout Plans"
              description={error}
              actionLabel="Try Again"
              onAction={fetchFeaturedPlans}
            />
          )}

          {/* Empty State */}
          {!loading && !error && plans.length === 0 && (
            <EmptyState
              icon={Star}
              title="No Featured Workout Plans"
              description="There are no featured workout plans at the moment. Check back soon!"
            />
          )}

          {/* Plans Grid */}
          {!loading && !error && plans.length > 0 && (
            <>
              <WorkoutPlanGrid
                plans={plans}
                onPlanClick={handlePlanClick}
                showProgress={false}
                userProgressMap={userProgressMap}
              />

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="mt-8">
                  <PaginationControls
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={setCurrentPage}
                  />
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}

