'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { apiClient } from '@/lib/api-client'
import { ContentCard } from '@/components/user/ContentCard'
import { PaginationControls } from '@/components/user/PaginationControls'
import { EmptyState } from '@/components/user/EmptyState'
import { LoadingGrid } from '@/components/user/LoadingGrid'
import { Star, ArrowLeft, Play } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { ContentItem } from '@/lib/api-client'

export default function FeaturedVideosPage() {
  const router = useRouter()
  const [content, setContent] = useState<ContentItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Pagination
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalItems, setTotalItems] = useState(0)
  const pageSize = 12

  useEffect(() => {
    fetchFeaturedContent()
  }, [currentPage])

  const fetchFeaturedContent = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await apiClient.getFeaturedContent({
        page: currentPage,
        pageSize
      })

      if (response.success && response.data) {
        setContent(response.data.items)
        setTotalPages(response.data.pagination.totalPages)
        setTotalItems(response.data.pagination.totalItems)
      } else {
        setError('Failed to load featured videos')
      }
    } catch (error) {
      console.error('Error fetching featured videos:', error)
      setError('Failed to load featured videos')
    } finally {
      setLoading(false)
    }
  }

  const handleContentClick = (item: ContentItem) => {
    router.push(`/user/videos/${item.id}`)
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
                onClick={() => router.push('/user/videos')}
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
                    Featured Videos
                  </h1>
                  <p className="text-sm user-app-muted mt-1">
                    Discover our handpicked selection of featured videos
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
              icon={Play}
              title="Error Loading Featured Videos"
              description={error}
              actionLabel="Try Again"
              onAction={fetchFeaturedContent}
            />
          )}

          {/* Empty State */}
          {!loading && !error && content.length === 0 && (
            <EmptyState
              icon={Star}
              title="No Featured Videos"
              description="There are no featured videos at the moment. Check back soon!"
            />
          )}

          {/* Content Grid */}
          {!loading && !error && content.length > 0 && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                {content.map((item) => (
                  <ContentCard
                    key={item.id}
                    content={item}
                    onClick={() => handleContentClick(item)}
                    showXP={true}
                    xpAmount={50}
                  />
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <PaginationControls
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={setCurrentPage}
                />
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}

