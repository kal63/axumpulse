'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { apiClient, UserSubscription } from '@/lib/api-client'
import { useAuth } from '@/contexts/auth-context'
import { NeumorphicCard } from '@/components/user/NeumorphicCard'
import { ContentCard } from '@/components/user/ContentCard'
import { SearchBar } from '@/components/user/SearchBar'
import { FilterBar } from '@/components/user/FilterBar'
import { LoadingGrid } from '@/components/user/LoadingGrid'
import { EmptyState } from '@/components/user/EmptyState'
import { PaginationControls } from '@/components/user/PaginationControls'
import { 
  Video, 
  Play, 
  Clock, 
  Star, 
  TrendingUp, 
  Flame, 
  Award, 
  Search,
  Filter,
  SortAsc,
  Zap,
  Eye,
  Heart,
  Bookmark,
  Share2,
  ChevronRight,
  Sparkles,
  Target,
  Users,
  Trophy,
  UserCheck,
  CheckCircle
} from 'lucide-react'
import { FeaturedBadge } from '@/components/user/FeaturedBadge'
import type { ContentItem } from '@/lib/api-client'

export default function VideosPage() {
  const router = useRouter()
  const { user } = useAuth()
  const [content, setContent] = useState<ContentItem[]>([])
  const [featuredContent, setFeaturedContent] = useState<ContentItem[]>([])
  const [loading, setLoading] = useState(true)
  const [categories, setCategories] = useState<string[]>([])
  const [sortBy, setSortBy] = useState<'newest' | 'popular' | 'trending'>('newest')
  const [subscription, setSubscription] = useState<UserSubscription | null>(null)
  const [subscriptionLoading, setSubscriptionLoading] = useState(true)
  
  // Filters
  const [selectedCategory, setSelectedCategory] = useState<string>('')
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('')
  const [selectedDuration, setSelectedDuration] = useState<string>('')
  const [searchQuery, setSearchQuery] = useState('')
  const [showFilters, setShowFilters] = useState(false)

  // Pagination
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalItems, setTotalItems] = useState(0)
  const pageSize = 12

  // Check if user is a medical professional or trainer
  const isMedicalPro = user?.isMedical || false
  const isTrainer = user?.isTrainer || false

  // Fetch subscription status (skip for medical professionals and trainers)
  useEffect(() => {
    if (user && !isMedicalPro && !isTrainer) {
      fetchSubscription()
    } else if (isMedicalPro || isTrainer) {
      // Medical professionals and trainers don't need subscription, mark as loaded
      setSubscriptionLoading(false)
    }
  }, [user, isMedicalPro, isTrainer])

  const fetchSubscription = async () => {
    try {
      setSubscriptionLoading(true)
      const response = await apiClient.getMySubscription()
      if (response.success && response.data) {
        if (response.data.subscription === null) {
          setSubscription(null)
        } else {
          setSubscription(response.data.subscription)
        }
      }
    } catch (error) {
      console.error('Failed to fetch subscription:', error)
      setSubscription(null)
    } finally {
      setSubscriptionLoading(false)
    }
  }

  useEffect(() => {
    // Fetch content if subscription exists OR if user is a medical professional or trainer
    if (!subscriptionLoading && (subscription || isMedicalPro || isTrainer)) {
      fetchContent()
      fetchCategories()
    }
  }, [subscription, subscriptionLoading, isMedicalPro, isTrainer, currentPage, selectedCategory, selectedDifficulty, selectedDuration, searchQuery, sortBy])

  // Fetch featured content separately on mount - if subscription exists OR if medical professional or trainer
  useEffect(() => {
    if (!subscriptionLoading && (subscription || isMedicalPro || isTrainer)) {
      fetchFeaturedContent()
    }
  }, [subscription, subscriptionLoading, isMedicalPro, isTrainer])

  const fetchContent = async () => {
    try {
      setLoading(true)
      const response = await apiClient.getUserContent({
        page: currentPage,
        pageSize,
        category: selectedCategory,
        difficulty: selectedDifficulty,
        duration: selectedDuration,
        search: searchQuery
      })

      if (response.success && response.data) {
        setContent(response.data.items)
        setTotalPages(response.data.pagination.totalPages)
        setTotalItems(response.data.pagination.totalItems)
      }
    } catch (error) {
      console.error('Error fetching content:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchFeaturedContent = async () => {
    try {
      const response = await apiClient.getFeaturedContent({
        page: 1,
        pageSize: 3
      })

      if (response.success && response.data) {
        setFeaturedContent(response.data.items || [])
      }
    } catch (error) {
      console.error('Error fetching featured content:', error)
    }
  }


  const fetchCategories = async () => {
    try {
      const response = await apiClient.getUserContentCategories()
      if (response.success && response.data) {
        setCategories(response.data.categories)
      }
    } catch (error) {
      console.error('Error fetching categories:', error)
    }
  }

  const handleContentClick = (item: ContentItem) => {
    router.push(`/user/videos/${item.id}`)
  }

  const handleSearchChange = (value: string) => {
    setSearchQuery(value)
    setCurrentPage(1)
  }

  const handleFilterChange = (setter: (value: string) => void) => (value: string) => {
    setter(value)
    setCurrentPage(1)
  }


  const difficultyOptions = [
    { value: 'beginner', label: 'Beginner' },
    { value: 'intermediate', label: 'Intermediate' },
    { value: 'advanced', label: 'Advanced' }
  ]

  const durationOptions = [
    { value: 'short', label: '< 15min' },
    { value: 'medium', label: '15-30min' },
    { value: 'long', label: '> 30min' }
  ]

  const sortOptions = [
    { value: 'newest', label: 'Newest' },
    { value: 'popular', label: 'Most Popular' },
    { value: 'trending', label: 'Trending' }
  ]

  return (
    <div className="min-h-dvh min-h-full user-app-page">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[var(--ethio-lemon)]/10 via-[var(--ethio-deep-blue)]/8 to-transparent" />
        <div className="relative px-4 md:px-8 py-12">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-8">
              <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-[var(--ethio-lemon)] to-[var(--ethio-deep-blue)] text-white px-4 py-2 rounded-full text-sm font-medium mb-4">
                <Sparkles className="w-4 h-4" />
                <span>Discover Amazing Content</span>
              </div>
              <h1 className="text-4xl md:text-6xl font-bold user-app-ink mb-4">
                🎬 Video Library
              </h1>
              <p className="text-xl user-app-muted max-w-2xl mx-auto">
                Explore our wide range of training videos, earn XP, and level up your fitness journey
              </p>
            </div>

            {/* Subscription Status Indicator */}
            {subscription && (
              <div className="max-w-4xl mx-auto mb-4">
                <NeumorphicCard variant="raised" size="sm" className="p-4 bg-blue-500/10 border-blue-500/30">
                  <div className="flex items-center gap-3">
                    <UserCheck className="w-5 h-5 text-blue-400" />
                    <div className="flex-1">
                      <p className="text-sm font-semibold user-app-ink">
                        Showing content from {subscription.trainer?.name || `Trainer #${subscription.trainerId}`}
                      </p>
                      <p className="text-xs text-slate-400">
                        Your active subscription expires on {new Date(subscription.expiresAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </NeumorphicCard>
              </div>
            )}

            {/* No Subscription Message - Only show for non-medical professionals and non-trainers */}
            {!subscriptionLoading && !subscription && !isMedicalPro && !isTrainer && (
              <div className="max-w-2xl mx-auto">
                <NeumorphicCard variant="raised" size="lg" className="p-12 border-2 border-amber-500/30 bg-gradient-to-br from-amber-500/10 to-orange-500/10">
                  <div className="text-center">
                    <div className="w-20 h-20 bg-gradient-to-r from-amber-500 to-orange-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                      <UserCheck className="w-10 h-10 text-white" />
                    </div>
                    <h2 className="text-3xl md:text-4xl font-bold user-app-ink mb-4">
                      Subscription Required
                    </h2>
                    <div className="space-y-4 mb-8">
                      <p className="text-lg user-app-muted">
                        You need an active subscription to access video content.
                      </p>
                      <p className="text-base user-app-muted">
                        Subscribe to a trainer to unlock training videos, earn XP, and level up your fitness journey.
                      </p>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                      <button
                        onClick={() => router.push('/trainers')}
                        className="px-8 py-4 bg-gradient-to-r from-[var(--ethio-lemon)] to-[var(--ethio-deep-blue)] text-white rounded-xl font-semibold hover:shadow-lg hover:scale-105 transition-all duration-200 flex items-center justify-center gap-2"
                      >
                        <Users className="w-5 h-5" />
                        Browse Trainers
                      </button>
                      {/*}
                      <button
                        onClick={() => router.push('/user/subscriptions')}
                        className="px-8 py-4 user-app-paper user-app-ink rounded-xl font-semibold user-app-hover transition-all duration-200 flex items-center justify-center gap-2"
                      >
                        <CheckCircle className="w-5 h-5" />
                        My Subscriptions
                      </button>*/}
                    </div>
                  </div>
                </NeumorphicCard>
              </div>
            )}

            {/* Search and Quick Actions - Show if subscription exists OR if medical professional or trainer */}
            {(subscription || isMedicalPro || isTrainer) && (
              <div className="max-w-4xl mx-auto">
              <NeumorphicCard variant="raised" size="lg" className="p-6">
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="flex-1">
                    <SearchBar
                      value={searchQuery}
                      onChange={handleSearchChange}
                      placeholder="Search videos, trainers, or topics..."
                    />
                  </div>
                  <button
                    onClick={() => setShowFilters(!showFilters)}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-xl transition-all duration-200 ${
                      showFilters 
                        ? 'bg-gradient-to-r from-[var(--ethio-lemon)] to-[var(--ethio-deep-blue)] text-white shadow-lg' 
                        : 'user-app-paper user-app-hover'
                    }`}
                  >
                    <Filter className="w-4 h-4" />
                    <span>Filters</span>
                  </button>
                </div>
              </NeumorphicCard>
              </div>
            )}

            {/* Filters Section - Slides out from search - Show if subscription exists OR if medical professional or trainer */}
            {(subscription || isMedicalPro || isTrainer) && (
              <div className={`max-w-4xl mx-auto transition-all duration-700 ease-in-out overflow-hidden ${
              showFilters 
                ? 'mt-4 max-h-[800px] opacity-100' 
                : 'mt-0 max-h-0 opacity-0'
            }`}>
              <div className={`transform transition-transform duration-700 ease-in-out ${
                showFilters ? 'translate-y-0' : '-translate-y-4'
              }`}>
                <NeumorphicCard variant="recessed" size="lg" className="p-6">
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-semibold user-app-ink">Filter Content</h3>
                      <button
                        onClick={() => setShowFilters(false)}
                        className="user-app-muted hover:user-app-ink transition-colors"
                      >
                        ✕
                      </button>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {/* Category Filter */}
                      {categories.length > 0 && (
                        <div className="space-y-2">
                          <label className="text-sm font-medium user-app-ink">Category</label>
                          <div className="flex flex-wrap gap-2">
                            <button
                              onClick={() => handleFilterChange(setSelectedCategory)('')}
                              className={`px-3 py-1 rounded-full text-sm transition-all duration-200 ${
                                selectedCategory === ''
                                  ? 'bg-gradient-to-r from-[var(--ethio-lemon)] to-[var(--ethio-deep-blue)] text-white shadow-lg'
                                  : 'user-app-paper user-app-hover user-app-ink'
                              }`}
                            >
                              All Categories
                            </button>
                            {categories.map((cat) => (
                              <button
                                key={cat}
                                onClick={() => handleFilterChange(setSelectedCategory)(cat)}
                                className={`px-3 py-1 rounded-full text-sm transition-all duration-200 ${
                                  selectedCategory === cat
                                    ? 'bg-gradient-to-r from-[var(--ethio-lemon)] to-[var(--ethio-deep-blue)] text-white shadow-lg'
                                    : 'user-app-paper user-app-hover user-app-ink'
                                }`}
                              >
                                {cat.charAt(0).toUpperCase() + cat.slice(1)}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Difficulty Filter */}
                      <div className="space-y-2">
                        <label className="text-sm font-medium user-app-ink">Difficulty</label>
                        <div className="flex flex-wrap gap-2">
                          <button
                            onClick={() => handleFilterChange(setSelectedDifficulty)('')}
                            className={`px-3 py-1 rounded-full text-sm transition-all duration-200 ${
                              selectedDifficulty === ''
                                ? 'bg-gradient-to-r from-[var(--ethio-lemon)] to-[var(--ethio-deep-blue)] text-white shadow-lg'
                                : 'user-app-paper user-app-hover user-app-ink'
                            }`}
                          >
                            All Levels
                          </button>
                          {difficultyOptions.map((option) => (
                            <button
                              key={option.value}
                              onClick={() => handleFilterChange(setSelectedDifficulty)(option.value)}
                              className={`px-3 py-1 rounded-full text-sm transition-all duration-200 ${
                                selectedDifficulty === option.value
                                  ? 'bg-gradient-to-r from-[var(--ethio-lemon)] to-[var(--ethio-deep-blue)] text-white shadow-lg'
                                  : 'user-app-paper user-app-hover user-app-ink'
                              }`}
                            >
                              {option.label}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Duration Filter */}
                      <div className="space-y-2">
                        <label className="text-sm font-medium user-app-ink">Duration</label>
                        <div className="flex flex-wrap gap-2">
                          <button
                            onClick={() => handleFilterChange(setSelectedDuration)('')}
                            className={`px-3 py-1 rounded-full text-sm transition-all duration-200 ${
                              selectedDuration === ''
                                ? 'bg-gradient-to-r from-[var(--ethio-lemon)] to-[var(--ethio-deep-blue)] text-white shadow-lg'
                                : 'user-app-paper user-app-hover user-app-ink'
                            }`}
                          >
                            Any Duration
                          </button>
                          {durationOptions.map((option) => (
                            <button
                              key={option.value}
                              onClick={() => handleFilterChange(setSelectedDuration)(option.value)}
                              className={`px-3 py-1 rounded-full text-sm transition-all duration-200 ${
                                selectedDuration === option.value
                                  ? 'bg-gradient-to-r from-[var(--ethio-lemon)] to-[var(--ethio-deep-blue)] text-white shadow-lg'
                                  : 'user-app-paper user-app-hover user-app-ink'
                              }`}
                            >
                              {option.label}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Clear Filters Button */}
                    <div className="flex justify-end pt-4 border-t border-gray-200/50 dark:border-gray-700/50">
                      <button
                        onClick={() => {
                          setSelectedCategory('')
                          setSelectedDifficulty('')
                          setSelectedDuration('')
                          setSearchQuery('')
                        }}
                        className="px-4 py-2 text-sm user-app-muted hover:user-app-ink transition-colors"
                      >
                        Clear All Filters
                      </button>
                    </div>
                  </div>
                </NeumorphicCard>
              </div>
            </div>
            )}
          </div>
        </div>
      </div>

      {/* Featured Content Section - Show if subscription exists OR if medical professional or trainer */}
      {(subscription || isMedicalPro || isTrainer) && featuredContent.length > 0 && (
        <div className={`px-4 md:px-8 py-8 transition-all duration-300 ease-in-out overflow-hidden ${
          selectedCategory || selectedDifficulty || selectedDuration || searchQuery
            ? 'max-h-0 opacity-0 py-0'
            : 'max-h-[800px] opacity-100'
        }`}>
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gradient-to-r from-yellow-500 to-orange-600 rounded-full flex items-center justify-center">
                  <Star className="w-4 h-4 text-white fill-current" />
                </div>
                <h2 className="text-2xl font-bold user-app-ink">
                  Featured Content
                </h2>
              </div>
              {featuredContent.length > 3 && (
                <button 
                  onClick={() => router.push('/user/videos/featured')}
                  className="flex items-center space-x-2 user-app-link hover:opacity-90 transition-colors"
                >
                  <span>View All</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              )}
            </div>
            
            {featuredContent.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {featuredContent.slice(0, 3).map((item) => (
                  <ContentCard
                    key={item.id}
                    content={item}
                    onClick={() => handleContentClick(item)}
                    showXP={true}
                    xpAmount={50}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="user-app-muted">No featured content at the moment. Check back soon!</p>
              </div>
            )}
          </div>
        </div>
      )}


      {/* Content Section - Show if subscription exists OR if medical professional or trainer */}
      {(subscription || isMedicalPro || isTrainer) && (
        <div className="px-4 md:px-8 py-8">
          <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <h2 className="text-2xl font-bold user-app-ink">
                All Content
              </h2>
              <div className="user-app-paper px-3 py-1 rounded-full text-sm user-app-muted">
                {totalItems.toLocaleString()} items
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <FilterBar
                label="Sort by"
                options={sortOptions}
                selectedValue={sortBy}
                onValueChange={(value) => setSortBy(value as any)}
              />
            </div>
          </div>

          {/* Content Grid */}
          {loading ? (
            <LoadingGrid count={12} />
          ) : content.length === 0 ? (
            <EmptyState
              icon={Video}
              title="No content found"
              description="Try adjusting your filters or search query to find more content."
              actionLabel="Clear Filters"
              onAction={() => {
                setSelectedCategory('')
                setSelectedDifficulty('')
                setSelectedDuration('')
                setSearchQuery('')
              }}
            />
          ) : (
            <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
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
          )}

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
          </div>
        </div>
      )}
    </div>
  )
}
