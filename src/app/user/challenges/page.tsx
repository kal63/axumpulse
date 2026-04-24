'use client'

import { useState, useEffect, useRef } from 'react'
import { useAuth } from '@/contexts/auth-context'
import { apiClient } from '@/lib/api-client'
import { NeumorphicCard } from '@/components/user/NeumorphicCard'
import { SearchBar } from '@/components/user/SearchBar'
import { FilterBar } from '@/components/user/FilterBar'
import { PaginationControls } from '@/components/user/PaginationControls'
import { EmptyState } from '@/components/user/EmptyState'
import { LoadingGrid } from '@/components/user/LoadingGrid'
import { 
  Trophy, 
  Filter, 
  Search, 
  Sparkles, 
  Target, 
  Users, 
  Clock, 
  Award, 
  Zap, 
  TrendingUp, 
  Flame,
  Calendar,
  MapPin,
  Star,
  ChevronRight,
  UserCheck
} from 'lucide-react'
import { FeaturedBadge } from '@/components/user/FeaturedBadge'
import { Button } from '@/components/ui/button'
import { useToast } from '@/hooks/use-toast'
import { useRouter } from 'next/navigation'
import { Tabs, TabsContent } from '@/components/ui/tabs'

export default function ChallengesPage() {
  const { user } = useAuth()
  const router = useRouter()
  const { toast } = useToast()
  const [subscription, setSubscription] = useState<any | null>(null)
  const [subscriptionLoading, setSubscriptionLoading] = useState(true)
  const isMedicalPro = user?.isMedical || false
  const isTrainer = user?.isTrainer || false
  const [challenges, setChallenges] = useState<any[]>([])
  const [featuredChallenges, setFeaturedChallenges] = useState<any[]>([])
  const [myChallenges, setMyChallenges] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [joiningChallengeId, setJoiningChallengeId] = useState<number | null>(null)

  // Tab state
  const [activeTab, setActiveTab] = useState<'all' | 'active'>('all')
  
  // Refs for measuring button widths
  const allButtonRef = useRef<HTMLButtonElement>(null)
  const activeButtonRef = useRef<HTMLButtonElement>(null)
  const [backgroundStyle, setBackgroundStyle] = useState<{ width: string; left: string }>({ width: '0px', left: '0px' })
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('')
  const [selectedDifficulty, setSelectedDifficulty] = useState('')
  const hasActiveFilters = selectedCategory || selectedDifficulty || searchQuery
  const [categories, setCategories] = useState<string[]>([])
  const [showFilters, setShowFilters] = useState(false)

  // Pagination
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const pageSize = 12

  useEffect(() => {
    if (activeTab === 'all') {
      // fetch when subscription is loading (optimistic) or when we know user has access
      if (subscriptionLoading || subscription || isMedicalPro || isTrainer) {
        fetchChallenges()
        fetchCategories()
      }
    } else {
      if (user) {
        fetchMyChallenges()
      }
    }
  }, [page, activeTab, searchQuery, selectedCategory, selectedDifficulty, user, subscriptionLoading, subscription, isMedicalPro, isTrainer])

  // Fetch subscription status (skip for medical professionals and trainers)
  useEffect(() => {
    if (user && !isMedicalPro && !isTrainer) {
      fetchSubscription()
    } else if (isMedicalPro || isTrainer) {
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
    } catch (err) {
      console.error('Failed to fetch subscription:', err)
      setSubscription(null)
    } finally {
      setSubscriptionLoading(false)
    }
  }

  // Fetch my challenges on mount to get the count for the tab
  useEffect(() => {
    if (user) {
      fetchMyChallenges()
    }
  }, [user])

  // Update background position and size based on active tab
  useEffect(() => {
    const updateBackground = () => {
      if (activeTab === 'all' && allButtonRef.current) {
        const button = allButtonRef.current
        const container = button.parentElement?.parentElement
        if (container) {
          const buttonRect = button.getBoundingClientRect()
          const containerRect = container.getBoundingClientRect()
          const left = buttonRect.left - containerRect.left
          const width = buttonRect.width
          setBackgroundStyle({
            left: `${left}px`,
            width: `${width}px`
          })
        }
      } else if (activeTab === 'active' && activeButtonRef.current) {
        const button = activeButtonRef.current
        const container = button.parentElement?.parentElement
        if (container) {
          const buttonRect = button.getBoundingClientRect()
          const containerRect = container.getBoundingClientRect()
          const left = buttonRect.left - containerRect.left
          const width = buttonRect.width
          setBackgroundStyle({
            left: `${left}px`,
            width: `${width}px`
          })
        }
      }
    }

    // Update on mount and tab change
    updateBackground()
    
    // Update on window resize
    window.addEventListener('resize', updateBackground)
    return () => window.removeEventListener('resize', updateBackground)
  }, [activeTab, challenges.length, myChallenges.length])

  async function fetchChallenges() {
    try {
      setLoading(true)
      setError(null)

      const params: any = {
        page,
        pageSize,
        search: searchQuery || undefined,
        category: selectedCategory || undefined,
        difficulty: selectedDifficulty || undefined
      }

      // Add status filter for all tab
      if (activeTab === 'all') {
        // No status filter - show all approved challenges
      }

      const response = await apiClient.getUserChallenges(params)

      if (response.success && response.data) {
        setChallenges(response.data.items)
        setTotalPages(response.data.pagination?.totalPages || 1)
        
        // Filter featured challenges
        const featured = response.data.items.filter((challenge: any) => challenge.isFeatured === true)
        setFeaturedChallenges(featured)
      } else {
        setError('Failed to load challenges')
      }
    } catch (err) {
      console.error('Error fetching challenges:', err)
      setError('Failed to load challenges')
    } finally {
      setLoading(false)
    }
  }

  async function fetchMyChallenges() {
    try {
      const response = await apiClient.getMyChallenges()
      if (response.success && response.data) {
        setMyChallenges(response.data.items)
      }
    } catch (err) {
      console.error('Error fetching my challenges:', err)
    }
  }

  async function fetchCategories() {
    try {
      const response = await apiClient.getUserChallengeCategories()
      if (response.success && response.data) {
        setCategories(response.data.categories)
      }
    } catch (err) {
      console.error('Error fetching categories:', err)
    }
  }

  function handleSearch(query: string) {
    setSearchQuery(query)
    setPage(1)
  }

  // Removed - using activeTab instead

  async function handleJoinChallenge(challengeId: number, e: React.MouseEvent) {
    e.preventDefault()
    e.stopPropagation()
    
    if (!user) {
      router.push('/login')
      return
    }

    try {
      setJoiningChallengeId(challengeId)
      const response = await apiClient.joinChallenge(challengeId)

      if (response.success) {
        toast({
          title: 'Success!',
          description: 'You have joined the challenge',
        })
        // Refresh challenges to show updated status
        await fetchChallenges()
        // Always refresh my challenges to update the count
        await fetchMyChallenges()
      } else {
        toast({
          title: 'Error',
          description: response.error?.message || 'Failed to join challenge',
          variant: 'destructive'
        })
      }
    } catch (err) {
      console.error('Error joining challenge:', err)
      toast({
        title: 'Error',
        description: 'Failed to join challenge',
        variant: 'destructive'
      })
    } finally {
      setJoiningChallengeId(null)
    }
  }

  const displayChallenges = activeTab === 'active' ? myChallenges : challenges

  const content = (
    <div className="min-h-dvh min-h-full user-app-page">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        {/* Background Gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 via-purple-500/5 to-pink-500/10" />
        
        {/* Content */}
        <div className="relative px-4 md:px-8 py-12">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-8">
              <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-cyan-500 to-purple-600 text-white px-4 py-2 rounded-full text-sm font-medium mb-4">
                <Sparkles className="w-4 h-4" />
                <span>Join Amazing Challenges</span>
              </div>
              <h1 className="text-4xl md:text-6xl font-bold user-app-ink mb-4">
                🏆 Challenges
              </h1>
              <p className="text-xl user-app-muted max-w-2xl mx-auto">
                Compete with others, earn rewards, and push your limits in exciting fitness challenges
              </p>
            </div>


            
            {/* Subscription Status Indicator */}
            {subscription && (
              <div className="max-w-4xl mx-auto mb-4">
                {/* <NeumorphicCard variant="raised" size="sm" className="p-4 bg-blue-500/10 border-blue-500/30">
                  <div className="flex items-center gap-3">
                    <UserCheck className="w-5 h-5 text-blue-400" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-white">
                        Showing content from {subscription.trainer?.name || `Trainer #${subscription.trainerId}`}
                      </p>
                      <p className="text-xs text-slate-400">
                        Your active subscription expires on {new Date(subscription.expiresAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </NeumorphicCard> */}
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
                        You need an active subscription to access challenges.
                      </p>
                      <p className="text-base user-app-muted">
                        Subscribe to a trainer to unlock community challenges, track progress, and earn rewards.
                      </p>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                      <button
                        onClick={() => router.push('/trainers')}
                        className="px-8 py-4 bg-gradient-to-r from-cyan-500 to-purple-600 text-white rounded-xl font-semibold hover:shadow-lg hover:scale-105 transition-all duration-200 flex items-center justify-center gap-2"
                      >
                        <Users className="w-5 h-5" />
                        Browse Trainers
                      </button>
                    </div>
                  </div>
                </NeumorphicCard>
              </div>
            )}

            {/* Search and Quick Actions - Show while subscription is loading or user has access */}
            {(subscriptionLoading || subscription || isMedicalPro || isTrainer) && (
              <div className="max-w-4xl mx-auto">
                <NeumorphicCard variant="raised" size="lg" className="p-6">
                  <div className="flex flex-col md:flex-row gap-4">
                    <div className="flex-1">
                      <SearchBar
                        value={searchQuery}
                        onChange={handleSearch}
                        placeholder="Search challenges, categories, or rewards..."
                      />
                    </div>
                    <button
                      onClick={() => setShowFilters(!showFilters)}
                      className={`flex items-center space-x-2 px-4 py-2 rounded-xl transition-all duration-200 ${
                        showFilters 
                          ? 'bg-gradient-to-r from-cyan-500 to-purple-600 text-white shadow-lg' 
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

            {/* Filters Section - Slides out from search */}
            {(subscriptionLoading || subscription || isMedicalPro || isTrainer) && (
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
                      <h3 className="text-lg font-semibold user-app-ink">Filter Challenges</h3>
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
                              onClick={() => setSelectedCategory('')}
                              className={`px-3 py-1 rounded-full text-sm transition-all duration-200 ${
                                selectedCategory === '' 
                                  ? 'bg-gradient-to-r from-cyan-500 to-purple-600 text-white' 
                                  : 'user-app-paper user-app-hover user-app-ink'
                              }`}
                            >
                              All Categories
                            </button>
                            {categories.map((category) => (
                              <button
                                key={category}
                                onClick={() => setSelectedCategory(category)}
                                className={`px-3 py-1 rounded-full text-sm transition-all duration-200 ${
                                  selectedCategory === category 
                                    ? 'bg-gradient-to-r from-cyan-500 to-purple-600 text-white' 
                                    : 'user-app-paper user-app-hover user-app-ink'
                                }`}
                              >
                                {category.charAt(0).toUpperCase() + category.slice(1)}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Difficulty Filter */}
                      <div className="space-y-2">
                        <label className="text-sm font-medium user-app-ink">Difficulty</label>
                        <div className="flex flex-wrap gap-2">
                          {[
                            { value: 'beginner', label: 'Beginner' },
                            { value: 'intermediate', label: 'Intermediate' },
                            { value: 'advanced', label: 'Advanced' }
                          ].map((option) => (
                            <button
                              key={option.value}
                              onClick={() => setSelectedDifficulty(selectedDifficulty === option.value ? '' : option.value)}
                              className={`px-3 py-1 rounded-full text-sm transition-all duration-200 ${
                                selectedDifficulty === option.value 
                                  ? 'bg-gradient-to-r from-cyan-500 to-purple-600 text-white' 
                                  : 'user-app-paper user-app-hover user-app-ink'
                              }`}
                            >
                              {option.label}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Status Filter removed - using tabs instead */}
                    </div>
                  </div>
                </NeumorphicCard>
              </div>
            </div>
            )}

          </div>
        </div>
      </div>

      {/* Trending Section */}
      {(subscriptionLoading || subscription || isMedicalPro || isTrainer) && challenges.length > 0 && (
        <div className={`px-4 md:px-8 py-8 transition-all duration-300 ease-in-out overflow-hidden ${
          selectedCategory || selectedDifficulty || searchQuery
            ? 'max-h-0 opacity-0 py-0'
            : 'max-h-[800px] opacity-100'
        }`}>
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gradient-to-r from-orange-500 to-red-600 rounded-full flex items-center justify-center">
                  <Flame className="w-4 h-4 text-white" />
                </div>
                <h2 className="text-2xl font-bold user-app-ink">
                  Featured Challenges
                </h2>
              </div>
              {featuredChallenges.length > 3 && (
                <button 
                  onClick={() => router.push('/user/challenges/featured')}
                  className="flex items-center space-x-2 user-app-link hover:opacity-90 transition-colors"
                >
                  <span>View All</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              )}
            </div>
            
            {featuredChallenges.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {featuredChallenges.slice(0, 3).map((challenge) => (
                  <NeumorphicCard 
                    key={challenge.id} 
                    variant="raised" 
                    className="p-6 cursor-pointer hover:scale-105 transition-all duration-200 relative"
                    onClick={() => router.push(`/user/challenges/${challenge.id}`)}
                  >
                    <div className="absolute top-4 right-4 z-10">
                      <FeaturedBadge size="sm" />
                    </div>
                    <div className="space-y-4">
                      <div className="flex items-start justify-between">
                        <h3 className="text-xl font-bold user-app-ink line-clamp-2">
                          {challenge.title}
                        </h3>
                      </div>
                    
                    <p className="user-app-muted line-clamp-2">
                      {challenge.description}
                    </p>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4 text-sm user-app-muted">
                        <div className="flex items-center space-x-1">
                          <Users className="w-4 h-4" />
                          <span>{challenge.participantCount || 0}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Clock className="w-4 h-4" />
                          <span>{challenge.duration || 0} days</span>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-1 text-cyan-600">
                        <Zap className="w-4 h-4" />
                        <span className="text-sm font-semibold">+{challenge.xpReward || 0} XP</span>
                      </div>
                    </div>
                  </div>
                </NeumorphicCard>
              ))}
            </div>
            ) : (
              <div className="text-center py-12">
                <p className="user-app-muted">No featured challenges at the moment. Check back soon!</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Content Section */}
      {(subscriptionLoading || subscription || isMedicalPro || isTrainer) && (
      <div className="px-4 md:px-8 py-8">
        <div className="max-w-7xl mx-auto">
          {/* Content Section Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center space-x-4">
              <h2 className="text-3xl font-bold user-app-ink">
                Challenges
              </h2>
              <div className="user-app-paper px-4 py-2 rounded-full shadow-sm">
                <span className="text-sm user-app-muted">
                  {activeTab === 'all' ? `${challenges.length} challenges` : `${myChallenges.length} active`}
                </span>
              </div>
            </div>
            
          </div>

          {/* Beautiful Tabs with Sliding Background */}
          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'all' | 'active')} className="mb-8">
            <div className="flex justify-center mb-8">
              <div className="relative user-app-paper p-2 rounded-2xl shadow-lg dark:shadow-xl">
                {/* Sliding Background */}
                <div 
                  className="absolute top-2 bottom-2 rounded-xl bg-gradient-to-r from-cyan-500 to-purple-600 transition-all duration-500 ease-out"
                  style={backgroundStyle}
                />
                
                <div className="relative flex gap-2">
                  <button
                    ref={allButtonRef}
                    onClick={() => setActiveTab('all')}
                    className={`flex items-center space-x-3 px-6 py-3 rounded-xl transition-all duration-300 transform relative z-10 ${
                      activeTab === 'all'
                        ? 'text-white'
                        : 'user-app-ink hover:user-app-link'
                    }`}
                  >
                    <Trophy className="w-5 h-5 shrink-0" />
                    <div className="text-left">
                      <div className="font-semibold">All Challenges</div>
                      <div className={`text-xs ${activeTab === 'all' ? 'opacity-80' : 'opacity-60'}`}>
                        {challenges.length} available
                      </div>
                    </div>
                  </button>
                  
                  <button
                    ref={activeButtonRef}
                    onClick={() => setActiveTab('active')}
                    className={`flex items-center space-x-3 px-6 py-3 rounded-xl transition-all duration-300 transform relative z-10 ${
                      activeTab === 'active'
                        ? 'text-white'
                        : 'user-app-ink hover:user-app-link'
                    }`}
                  >
                    <Target className="w-5 h-5 shrink-0" />
                    <div className="text-left">
                      <div className="font-semibold">My Active</div>
                      <div className={`text-xs ${activeTab === 'active' ? 'opacity-80' : 'opacity-60'}`}>
                        {myChallenges.length} in progress
                      </div>
                    </div>
                  </button>
                </div>
              </div>
            </div>

            {/* All Challenges Tab */}
            <TabsContent value="all" className="space-y-8">
              {/* Loading State */}
              {(loading && (subscription || isMedicalPro || isTrainer)) && <LoadingGrid count={pageSize} />}

              {/* Error State */}
              {error && (
                <EmptyState
                  icon={Trophy}
                  title="Error Loading Challenges"
                  description={error}
                  actionLabel="Try Again"
                  onAction={fetchChallenges}
                />
              )}

              {/* Empty State */}
              {!loading && !error && challenges.length === 0 && (
                <EmptyState
                  icon={Trophy}
                  title="No Challenges Found"
                  description={
                    searchQuery || selectedCategory || selectedDifficulty
                      ? 'Try adjusting your filters to see more challenges'
                      : 'No challenges available at the moment'
                  }
                />
              )}

              {/* Challenges Grid */}
              {!loading && !error && challenges.length > 0 && (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {challenges.map((challenge) => (
                  <NeumorphicCard key={challenge.id} variant="raised" className="group hover:scale-105 transition-all duration-300 relative">
                    <div 
                      className="p-6 space-y-4 cursor-pointer"
                      onClick={() => router.push(`/user/challenges/${challenge.id}`)}
                    >
                      {/* Featured Badge */}
                      {challenge.isFeatured && (
                        <div className="absolute top-4 right-4 z-10">
                          <FeaturedBadge size="sm" />
                        </div>
                      )}
                      
                      {/* Header */}
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3 flex-1">
                          <div className="w-12 h-12 bg-gradient-to-br from-cyan-500 to-purple-600 rounded-xl flex items-center justify-center">
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
                            {challenge.startTime 
                              ? new Date(challenge.startTime).toLocaleDateString('en-US', {
                                  month: 'short',
                                  day: 'numeric'
                                })
                              : 'Invalid date'}
                          </span>
                        </div>
                      </div>

                      {/* Footer */}
                      <div className="flex items-center justify-between pt-4">
                        <div className="flex items-center gap-1 text-cyan-500">
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
                                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-cyan-500 to-purple-600 text-white rounded-full text-sm font-medium hover:from-cyan-600 hover:to-purple-700 transition-all duration-200 transform hover:scale-105 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed z-10 relative"
                              >
                                <span>{joiningChallengeId === challenge.id ? 'Joining...' : 'Join Challenge'}</span>
                                <ChevronRight className="h-4 w-4" />
                              </button>
                            )
                          } else {
                            // Upcoming challenge
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
                    <div className="flex justify-center">
                      <PaginationControls
                        currentPage={page}
                        totalPages={totalPages}
                        onPageChange={setPage}
                      />
                    </div>
                  )}
                </>
              )}
            </TabsContent>

            {/* My Active Challenges Tab */}
            <TabsContent value="active" className="space-y-8">
              {/* Loading State */}
              {(loading && (subscription || isMedicalPro || isTrainer)) && <LoadingGrid count={pageSize} />}

              {/* Empty State */}
              {!loading && myChallenges.length === 0 && (
                <EmptyState
                  icon={Trophy}
                  title="No active challenges"
                  description="You haven't joined any challenges yet. Browse challenges and join one to track your progress!"
                  actionLabel="Browse Challenges"
                  onAction={() => setActiveTab('all')}
                />
              )}

              {/* Challenges Grid */}
              {!loading && myChallenges.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {myChallenges.map((progressItem) => {
                    // Backend returns UserChallengeProgress with nested challenge object
                    const challenge = progressItem.challenge || progressItem
                    const challengeId = challenge?.id || progressItem.challengeId
                    const progress = progressItem.progress || 0
                    const status = progressItem.status || 'active'
                    
                    // Extract goalValue from ruleJson or use default
                    const ruleJson = challenge?.ruleJson || {}
                    const goalValue = challenge?.goalValue || ruleJson.amount || ruleJson.targetValue || 100
                    const goalType = challenge?.goalType || ruleJson.unit || ruleJson.target || 'units'
                    
                    // Calculate progress percentage
                    const progressPercentage = goalValue ? Math.min((progress / goalValue) * 100, 100) : 0
                    
                    return (
                      <NeumorphicCard key={progressItem.id || challengeId} variant="raised" className="group hover:scale-105 transition-all duration-300 relative">
                        <div 
                          className="p-6 space-y-4 cursor-pointer"
                          onClick={() => router.push(`/user/challenges/${challengeId}`)}
                        >
                          {/* Featured Badge */}
                          {challenge?.isFeatured && (
                            <div className="absolute top-4 right-4 z-10">
                              <FeaturedBadge size="sm" />
                            </div>
                          )}
                          
                          {/* Header */}
                          <div className="flex items-start justify-between">
                            <div className="flex items-start gap-3 flex-1">
                              <div className="w-12 h-12 bg-gradient-to-br from-cyan-500 to-purple-600 rounded-xl flex items-center justify-center">
                                <Trophy className="h-6 w-6 text-white" />
                              </div>
                              <div className="flex-1">
                                <h3 className="font-bold text-lg user-app-ink group-hover:user-app-link transition-colors line-clamp-2">
                                  {challenge?.title || 'Challenge'}
                                </h3>
                                <p className="text-sm user-app-muted mt-1 capitalize">
                                  {challenge?.type || challenge?.category || 'Fitness'}
                                </p>
                              </div>
                            </div>
                            
                            {/* Status Badge */}
                            <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                              status === 'completed' 
                                ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                                : 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-400'
                            }`}>
                              {status === 'completed' ? 'Completed' : 'Active'}
                            </div>
                          </div>

                          {/* Description */}
                          {challenge?.description && (
                            <p className="text-sm user-app-muted line-clamp-2">
                              {challenge.description}
                            </p>
                          )}

                          {/* Meta Info */}
                          <div className="flex flex-wrap items-center gap-3 text-sm">
                            <div className="flex items-center gap-1 user-app-muted">
                              <Clock className="h-4 w-4" />
                              <span>{challenge?.duration || 0} days</span>
                            </div>
                            <div className="flex items-center gap-1 user-app-muted">
                              <Calendar className="h-4 w-4" />
                              <span>
                                {challenge?.endTime 
                                  ? new Date(challenge.endTime).toLocaleDateString('en-US', {
                                      month: 'short',
                                      day: 'numeric'
                                    })
                                  : challenge?.startTime
                                  ? new Date(challenge.startTime).toLocaleDateString('en-US', {
                                      month: 'short',
                                      day: 'numeric'
                                    })
                                  : 'N/A'}
                              </span>
                            </div>
                            {challenge?.difficulty && (
                              <div className={`px-2 py-1 rounded-md text-xs font-medium capitalize ${
                                challenge.difficulty === 'beginner' 
                                  ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                                  : challenge.difficulty === 'intermediate'
                                  ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                                  : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                              }`}>
                                {challenge.difficulty}
                              </div>
                            )}
                          </div>

                          {/* Progress Bar */}
                          <div className="space-y-2">
                            <div className="flex items-center justify-between text-xs">
                              <span className="user-app-muted">Your Progress</span>
                              <span className="font-semibold text-[var(--color-cyber-blue)]">
                                {progress}/{goalValue} {goalType}
                              </span>
                            </div>
                            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                              <div
                                className={`h-2 rounded-full transition-all ${
                                  status === 'completed'
                                    ? 'bg-gradient-to-r from-green-500 to-emerald-600'
                                    : 'bg-gradient-to-r from-[var(--color-cyber-blue)] to-[var(--color-neon-magenta)]'
                                }`}
                                style={{ 
                                  width: `${progressPercentage}%` 
                                }}
                              />
                            </div>
                            {status === 'completed' && (
                              <p className="text-xs text-green-600 dark:text-green-400 font-medium">
                                ✓ Challenge completed!
                              </p>
                            )}
                          </div>

                          {/* Footer */}
                          <div className="flex items-center justify-between pt-4">
                            <div className="flex items-center gap-1 text-cyan-500">
                              <Zap className="h-4 w-4" />
                              <span className="font-semibold">+{challenge?.xpReward || 0} XP</span>
                            </div>
                            
                            {/* View Progress Button */}
                            <button 
                              onClick={(e) => {
                                e.preventDefault()
                                e.stopPropagation()
                                router.push(`/user/challenges/${challengeId}`)
                              }}
                              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-full text-sm font-medium hover:from-green-600 hover:to-emerald-700 transition-all duration-200 transform hover:scale-105 shadow-lg z-10 relative"
                            >
                              <span>{status === 'completed' ? 'View Details' : 'View Progress'}</span>
                              <ChevronRight className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      </NeumorphicCard>
                    )
                  })}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>
      )}
    </div>
  )

  return content
}

