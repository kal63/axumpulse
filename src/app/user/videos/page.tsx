'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { apiClient } from '@/lib/api-client'
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
  Trophy
} from 'lucide-react'
import type { ContentItem } from '@/lib/api-client'

export default function VideosPage() {
  const router = useRouter()
  const [content, setContent] = useState<ContentItem[]>([])
  const [trendingContent, setTrendingContent] = useState<ContentItem[]>([])
  const [loading, setLoading] = useState(true)
  const [categories, setCategories] = useState<string[]>([])
  const [sortBy, setSortBy] = useState<'newest' | 'popular' | 'trending'>('newest')
  
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

  useEffect(() => {
    fetchContent()
    fetchCategories()
    fetchTrendingContent()
  }, [currentPage, selectedCategory, selectedDifficulty, selectedDuration, searchQuery, sortBy])

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

  const fetchTrendingContent = async () => {
    try {
      const response = await apiClient.getUserContent({
        page: 1,
        pageSize: 6
      })
      if (response.success && response.data) {
        setTrendingContent(response.data.items)
      }
    } catch (error) {
      console.error('Error fetching trending content:', error)
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
    <div className="min-h-screen bg-[var(--neumorphic-bg)]">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 via-purple-500/10 to-pink-500/10" />
        <div className="relative px-4 md:px-8 py-12">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-8">
              <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-cyan-500 to-purple-600 text-white px-4 py-2 rounded-full text-sm font-medium mb-4">
                <Sparkles className="w-4 h-4" />
                <span>Discover Amazing Content</span>
              </div>
              <h1 className="text-4xl md:text-6xl font-bold text-[var(--neumorphic-text)] mb-4">
                🎬 Video Library
              </h1>
              <p className="text-xl text-[var(--neumorphic-muted)] max-w-2xl mx-auto">
                Explore our wide range of training videos, earn XP, and level up your fitness journey
              </p>
            </div>

            {/* Search and Quick Actions */}
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
                        ? 'bg-gradient-to-r from-cyan-500 to-purple-600 text-white shadow-lg' 
                        : 'bg-[var(--neumorphic-surface)] hover:bg-[var(--neumorphic-hover)]'
                    }`}
                  >
                    <Filter className="w-4 h-4" />
                    <span>Filters</span>
                  </button>
                </div>
              </NeumorphicCard>
            </div>

            {/* Filters Section - Slides out from search */}
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
                      <h3 className="text-lg font-semibold text-[var(--neumorphic-text)]">Filter Content</h3>
                      <button
                        onClick={() => setShowFilters(false)}
                        className="text-[var(--neumorphic-muted)] hover:text-[var(--neumorphic-text)] transition-colors"
                      >
                        ✕
                      </button>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {/* Category Filter */}
                      {categories.length > 0 && (
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-[var(--neumorphic-text)]">Category</label>
                          <div className="flex flex-wrap gap-2">
                            <button
                              onClick={() => handleFilterChange(setSelectedCategory)('')}
                              className={`px-3 py-1 rounded-full text-sm transition-all duration-200 ${
                                selectedCategory === ''
                                  ? 'bg-gradient-to-r from-cyan-500 to-purple-600 text-white shadow-lg'
                                  : 'bg-[var(--neumorphic-surface)] hover:bg-[var(--neumorphic-hover)] text-[var(--neumorphic-text)]'
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
                                    ? 'bg-gradient-to-r from-cyan-500 to-purple-600 text-white shadow-lg'
                                    : 'bg-[var(--neumorphic-surface)] hover:bg-[var(--neumorphic-hover)] text-[var(--neumorphic-text)]'
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
                        <label className="text-sm font-medium text-[var(--neumorphic-text)]">Difficulty</label>
                        <div className="flex flex-wrap gap-2">
                          <button
                            onClick={() => handleFilterChange(setSelectedDifficulty)('')}
                            className={`px-3 py-1 rounded-full text-sm transition-all duration-200 ${
                              selectedDifficulty === ''
                                ? 'bg-gradient-to-r from-cyan-500 to-purple-600 text-white shadow-lg'
                                : 'bg-[var(--neumorphic-surface)] hover:bg-[var(--neumorphic-hover)] text-[var(--neumorphic-text)]'
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
                                  ? 'bg-gradient-to-r from-cyan-500 to-purple-600 text-white shadow-lg'
                                  : 'bg-[var(--neumorphic-surface)] hover:bg-[var(--neumorphic-hover)] text-[var(--neumorphic-text)]'
                              }`}
                            >
                              {option.label}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Duration Filter */}
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-[var(--neumorphic-text)]">Duration</label>
                        <div className="flex flex-wrap gap-2">
                          <button
                            onClick={() => handleFilterChange(setSelectedDuration)('')}
                            className={`px-3 py-1 rounded-full text-sm transition-all duration-200 ${
                              selectedDuration === ''
                                ? 'bg-gradient-to-r from-cyan-500 to-purple-600 text-white shadow-lg'
                                : 'bg-[var(--neumorphic-surface)] hover:bg-[var(--neumorphic-hover)] text-[var(--neumorphic-text)]'
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
                                  ? 'bg-gradient-to-r from-cyan-500 to-purple-600 text-white shadow-lg'
                                  : 'bg-[var(--neumorphic-surface)] hover:bg-[var(--neumorphic-hover)] text-[var(--neumorphic-text)]'
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
                        className="px-4 py-2 text-sm text-[var(--neumorphic-muted)] hover:text-[var(--neumorphic-text)] transition-colors"
                      >
                        Clear All Filters
                      </button>
                    </div>
                  </div>
                </NeumorphicCard>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Trending Section */}
      {trendingContent.length > 0 && (
        <div className={`px-4 md:px-8 py-8 transition-all duration-300 ease-in-out overflow-hidden ${
          selectedCategory || selectedDifficulty || selectedDuration || searchQuery
            ? 'max-h-0 opacity-0 py-0'
            : 'max-h-[800px] opacity-100'
        }`}>
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gradient-to-r from-orange-500 to-red-600 rounded-full flex items-center justify-center">
                  <Flame className="w-4 h-4 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-[var(--neumorphic-text)]">
                  Trending Now
                </h2>
              </div>
              <button className="flex items-center space-x-2 text-[var(--neumorphic-accent)] hover:text-[var(--neumorphic-accent-hover)] transition-colors">
                <span>View All</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {trendingContent.map((item, index) => (
                <NeumorphicCard key={item.id} variant="raised" size="md" className="group cursor-pointer hover:scale-105 transition-all duration-300">
                  <div className="relative">
                    <div className="aspect-video bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-800 rounded-lg mb-4 flex items-center justify-center">
                      <Play className="w-12 h-12 text-white opacity-80" />
                    </div>
                    <div className="absolute top-2 left-2">
                      <div className="bg-gradient-to-r from-orange-500 to-red-600 text-white px-2 py-1 rounded-full text-xs font-medium">
                        #{index + 1} Trending
                      </div>
                    </div>
                    <div className="absolute top-2 right-2">
                      <div className="bg-black/50 text-white px-2 py-1 rounded-full text-xs">
                        {item.duration}m
                      </div>
                    </div>
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold text-[var(--neumorphic-text)] mb-2 line-clamp-2">
                      {item.title}
                    </h3>
                    <div className="flex items-center justify-between text-sm text-[var(--neumorphic-muted)]">
                      <span>{item.trainer?.User?.name || `Trainer #${item.trainerId}`}</span>
                      <div className="flex items-center space-x-1">
                        <Star className="w-4 h-4 text-yellow-500 fill-current" />
                        <span>4.8</span>
                      </div>
                    </div>
                  </div>
                </NeumorphicCard>
              ))}
            </div>
          </div>
        </div>
      )}


      {/* Content Section */}
      <div className="px-4 md:px-8 py-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <h2 className="text-2xl font-bold text-[var(--neumorphic-text)]">
                All Content
              </h2>
              <div className="bg-[var(--neumorphic-surface)] px-3 py-1 rounded-full text-sm text-[var(--neumorphic-muted)]">
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
    </div>
  )
}
