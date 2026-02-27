'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/auth-context'
import { apiClient, UserSubscription } from '@/lib/api-client'
import { 
    Dumbbell, Search, Filter, Flame, Star, Clock, Target, 
    Users, TrendingUp, Zap, Award, ChevronDown, ChevronRight, Play, 
    Calendar, MapPin, Sparkles, CheckCircle, UserCheck
} from 'lucide-react'
import { FeaturedBadge } from '@/components/user/FeaturedBadge'
import type { WorkoutPlan } from '@/lib/api-client'
import { 
    WorkoutPlanGrid, 
    FilterBar, 
    SearchBar, 
    PaginationControls, 
    EmptyState, 
    LoadingGrid,
    WorkoutPlanCard
} from '@/components/user'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { NeumorphicCard } from '@/components/user/NeumorphicCard'

export default function WorkoutPlansPage() {
    const router = useRouter()
    const { user } = useAuth()
    const [plans, setPlans] = useState<WorkoutPlan[]>([])
    const [myPlans, setMyPlans] = useState<any[]>([])
    const [featuredPlans, setFeaturedPlans] = useState<WorkoutPlan[]>([])
    const [loading, setLoading] = useState(true)
    const [categories, setCategories] = useState<string[]>([])
    const [activeTab, setActiveTab] = useState<'all' | 'active'>('all')
    const [showFilters, setShowFilters] = useState(false)
    
    // Filters
    const [selectedCategory, setSelectedCategory] = useState<string>('')
    const [selectedDifficulty, setSelectedDifficulty] = useState<string>('')
    const [selectedDuration, setSelectedDuration] = useState<string>('')
    const [searchQuery, setSearchQuery] = useState('')

    // Pagination
    const [currentPage, setCurrentPage] = useState(1)
    const [totalPages, setTotalPages] = useState(1)
    const [totalItems, setTotalItems] = useState(0)
    const pageSize = 9
    const [subscription, setSubscription] = useState<UserSubscription | null>(null)
    const [subscriptionLoading, setSubscriptionLoading] = useState(true)

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
                if (response.data.subscription===null) {
                    setSubscription(null);
                }else{
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
        // Fetch plans if subscription exists OR if user is a medical professional or trainer
        if (!subscriptionLoading && (subscription || isMedicalPro || isTrainer)) {
            if (activeTab === 'all') {
                fetchAllPlans()
                fetchCategories()
            } else {
                fetchMyPlans()
            }
        }
    }, [subscription, subscriptionLoading, isMedicalPro, isTrainer, activeTab, currentPage, selectedCategory, selectedDifficulty, selectedDuration, searchQuery])

    const fetchAllPlans = async () => {
        try {
            setLoading(true)
            const response = await apiClient.getUserWorkoutPlans({
                page: currentPage,
                pageSize,
                category: selectedCategory,
                difficulty: selectedDifficulty,
                duration: selectedDuration,
                search: searchQuery
            })

            if (response.success && response.data) {
                setPlans(response.data.items)
                setTotalPages(response.data.pagination.totalPages)
                setTotalItems(response.data.pagination.totalItems)
                
                // Filter featured plans
                const featured = response.data.items.filter((plan: WorkoutPlan) => (plan as any).isFeatured === true)
                setFeaturedPlans(featured)
            }
        } catch (error) {
            console.error('Error fetching workout plans:', error)
        } finally {
            setLoading(false)
        }
    }

    // Create userProgressMap from plans for "All Plans" view
    const allPlansProgressMap = new Map(
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

    const fetchMyPlans = async (setLoadingState = true) => {
        try {
            if (setLoadingState) {
                setLoading(true)
            }
            const response = await apiClient.getMyWorkoutPlans()

            if (response.success && response.data) {
                setMyPlans(response.data.items)
            }
        } catch (error) {
            console.error('Error fetching my workout plans:', error)
        } finally {
            if (setLoadingState) {
                setLoading(false)
            }
        }
    }

    const fetchCategories = async () => {
        try {
            const response = await apiClient.getUserWorkoutPlanCategories()
            if (response.success && response.data) {
                setCategories(response.data.categories)
            }
        } catch (error) {
            console.error('Error fetching categories:', error)
        }
    }


    const handlePlanClick = (plan: WorkoutPlan) => {
        router.push(`/user/workout-plans/${plan.id}`)
    }

    const handleSearchChange = (value: string) => {
        setSearchQuery(value)
        setCurrentPage(1)
    }

    const handleFilterChange = (setter: (value: string) => void) => (value: string) => {
        setter(value)
        setCurrentPage(1)
    }

    const clearAllFilters = () => {
        setSelectedCategory('')
        setSelectedDifficulty('')
        setSelectedDuration('')
        setSearchQuery('')
        setCurrentPage(1)
    }

    const difficultyOptions = [
        { value: 'beginner', label: 'Beginner' },
        { value: 'intermediate', label: 'Intermediate' },
        { value: 'advanced', label: 'Advanced' }
    ]

    const durationOptions = [
        { value: 'short', label: '< 30min' },
        { value: 'medium', label: '30-60min' },
        { value: 'long', label: '> 60min' }
    ]

    const hasActiveFilters = selectedCategory || selectedDifficulty || selectedDuration || searchQuery

    return (
        <div className="min-h-screen bg-[var(--neumorphic-bg)]">
            {/* Hero Section */}
            <div className="relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 via-purple-500/10 to-pink-500/10" />
                <div className="relative px-4 md:px-8 py-12">
                    <div className="max-w-7xl mx-auto">
                        <div className="text-center mb-8">
                            <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-cyan-500 to-purple-600 text-white px-4 py-2 rounded-full text-sm font-medium mb-4">
                                <Dumbbell className="w-4 h-4" />
                                <span>Structured Fitness Programs</span>
                            </div>
                            <h1 className="text-4xl md:text-6xl font-bold text-[var(--neumorphic-text)] mb-4">
                                💪 Workout Plans
                            </h1>
                            <p className="text-xl text-[var(--neumorphic-muted)] max-w-2xl mx-auto">
                                Transform your fitness journey with structured programs designed by certified trainers
                            </p>
                        </div>

                        {/* Subscription Status Indicator */}
                        {subscription && (
                            <div className="max-w-4xl mx-auto mb-4">
                                <NeumorphicCard variant="raised" size="sm" className="p-4 bg-blue-500/10 border-blue-500/30">
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
                                        <h2 className="text-3xl md:text-4xl font-bold text-[var(--neumorphic-text)] mb-4">
                                            Subscription Required
                                        </h2>
                                        <div className="space-y-4 mb-8">
                                            <p className="text-lg text-[var(--neumorphic-muted)]">
                                                You need an active subscription to access workout plans.
                                            </p>
                                            <p className="text-base text-[var(--neumorphic-muted)]">
                                                Subscribe to a trainer to unlock personalized workout programs, track your progress, and achieve your fitness goals.
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
                                            {/*}
                                            <button
                                                onClick={() => router.push('/user/subscriptions')}
                                                className="px-8 py-4 bg-[var(--neumorphic-surface)] text-[var(--neumorphic-text)] rounded-xl font-semibold hover:bg-[var(--neumorphic-hover)] transition-all duration-200 flex items-center justify-center gap-2"
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
                                            placeholder="Search workout plans, trainers, or categories..."
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
                                            <h3 className="text-lg font-semibold text-[var(--neumorphic-text)]">Filter Plans</h3>
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
                                                            onClick={() => setSelectedCategory('')}
                                                            className={`px-3 py-1 rounded-full text-sm transition-all duration-200 ${
                                                                selectedCategory === '' 
                                                                    ? 'bg-gradient-to-r from-cyan-500 to-purple-600 text-white' 
                                                                    : 'bg-[var(--neumorphic-surface)] hover:bg-[var(--neumorphic-hover)] text-[var(--neumorphic-text)]'
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
                                                                        : 'bg-[var(--neumorphic-surface)] hover:bg-[var(--neumorphic-hover)] text-[var(--neumorphic-text)]'
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
                                                <label className="text-sm font-medium text-[var(--neumorphic-text)]">Difficulty</label>
                                                <div className="flex flex-wrap gap-2">
                                                    {difficultyOptions.map((option) => (
                                                        <button
                                                            key={option.value}
                                                            onClick={() => setSelectedDifficulty(selectedDifficulty === option.value ? '' : option.value)}
                                                            className={`px-3 py-1 rounded-full text-sm transition-all duration-200 ${
                                                                selectedDifficulty === option.value 
                                                                    ? 'bg-gradient-to-r from-cyan-500 to-purple-600 text-white' 
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
                                                    {durationOptions.map((option) => (
                                                        <button
                                                            key={option.value}
                                                            onClick={() => setSelectedDuration(selectedDuration === option.value ? '' : option.value)}
                                                            className={`px-3 py-1 rounded-full text-sm transition-all duration-200 ${
                                                                selectedDuration === option.value 
                                                                    ? 'bg-gradient-to-r from-cyan-500 to-purple-600 text-white' 
                                                                    : 'bg-[var(--neumorphic-surface)] hover:bg-[var(--neumorphic-hover)] text-[var(--neumorphic-text)]'
                                                            }`}
                                                        >
                                                            {option.label}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                        
                                        {hasActiveFilters && (
                                            <div className="flex justify-end">
                                                <button
                                                    onClick={clearAllFilters}
                                                    className="px-4 py-2 text-sm text-red-600 hover:text-red-700 transition-colors"
                                                >
                                                    Clear All Filters
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </NeumorphicCard>
                            </div>
                        </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Featured Plans Section - Show if subscription exists OR if medical professional or trainer */}
            {(subscription || isMedicalPro || isTrainer) && !hasActiveFilters && featuredPlans.length > 0 && (
                <div className="px-4 md:px-8 py-8">
                    <div className="max-w-7xl mx-auto">
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center space-x-3">
                                <div className="w-8 h-8 bg-gradient-to-r from-yellow-500 to-orange-600 rounded-full flex items-center justify-center">
                                    <Star className="w-4 h-4 text-white fill-current" />
                                </div>
                                <h2 className="text-2xl font-bold text-[var(--neumorphic-text)]">Featured Plans</h2>
                            </div>
                            {featuredPlans.length > 3 && (
                                <button 
                                    onClick={() => router.push('/user/workout-plans/featured')}
                                    className="flex items-center space-x-2 text-[var(--neumorphic-accent)] hover:text-[var(--neumorphic-accent-hover)] transition-colors"
                                >
                                    <span>View All</span>
                                    <ChevronRight className="w-4 h-4" />
                                </button>
                            )}
                        </div>
                        
                        {featuredPlans.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {featuredPlans.slice(0, 3).map((plan) => (
                                    <WorkoutPlanCard
                                        key={plan.id}
                                        workoutPlan={plan}
                                        onClick={() => handlePlanClick(plan)}
                                    />
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-12">
                                <p className="text-[var(--neumorphic-muted)]">No featured plans at the moment. Check back soon!</p>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Tabs - Show if subscription exists OR if medical professional or trainer */}
            {(subscription || isMedicalPro || isTrainer) && (
                <div className="px-4 md:px-8 py-8">
                    <div className="max-w-7xl mx-auto">
                    {/* Content Section Header */}
                    <div className="flex items-center justify-between mb-8">
                        <div className="flex items-center space-x-4">
                            <h2 className="text-3xl font-bold text-[var(--neumorphic-text)]">
                                Workout Plans
                            </h2>
                            <div className="bg-[var(--neumorphic-surface)] px-4 py-2 rounded-full shadow-[var(--neumorphic-shadow)]">
                                <span className="text-sm text-[var(--neumorphic-muted)]">
                                    {activeTab === 'all' ? `${totalItems} plans` : `${myPlans.length} active`}
                                </span>
                            </div>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                            <div className="bg-[var(--neumorphic-surface)] px-4 py-2 rounded-full shadow-[var(--neumorphic-shadow)]">
                                <div className="flex items-center space-x-2">
                                    <Star className="w-4 h-4 text-yellow-500 fill-current" />
                                    <span className="text-sm text-[var(--neumorphic-text)]">4.8 avg rating</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Beautiful Tabs with Sliding Background */}
                    <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'all' | 'active')} className="mb-8">
                        <div className="flex justify-center mb-8">
                            <div className="relative bg-[var(--neumorphic-surface)] p-2 rounded-2xl shadow-lg dark:shadow-xl">
                                {/* Sliding Background */}
                                <div 
                                    className={`absolute top-2 bottom-2 rounded-xl bg-gradient-to-r from-cyan-500 to-purple-600 transition-all duration-500 ease-out ${
                                        activeTab === 'all' 
                                            ? 'left-2 right-1/2 mr-1' 
                                            : 'left-1/2 right-2 ml-1'
                                    }`}
                                />
                                
                                <div className="relative flex">
                                    <button
                                        onClick={() => setActiveTab('all')}
                                        className={`flex items-center space-x-3 px-6 py-3 rounded-xl transition-all duration-300 transform relative z-10 ${
                                            activeTab === 'all'
                                                ? 'text-white'
                                                : 'text-[var(--neumorphic-text)] hover:text-[var(--neumorphic-accent)]'
                                        }`}
                                    >
                                        <Dumbbell className="w-5 h-5" />
                                        <div className="text-left">
                                            <div className="font-semibold">All Plans</div>
                                            <div className={`text-xs ${activeTab === 'all' ? 'opacity-80' : 'opacity-60'}`}>
                                                {totalItems} available
                                            </div>
                                        </div>
                                    </button>
                                    
                                    <button
                                        onClick={() => setActiveTab('active')}
                                        className={`flex items-center space-x-3 px-6 py-3 rounded-xl transition-all duration-300 transform relative z-10 ${
                                            activeTab === 'active'
                                                ? 'text-white'
                                                : 'text-[var(--neumorphic-text)] hover:text-[var(--neumorphic-accent)]'
                                        }`}
                                    >
                                        <Target className="w-5 h-5" />
                                        <div className="text-left">
                                            <div className="font-semibold">My Active</div>
                                            <div className={`text-xs ${activeTab === 'active' ? 'opacity-80' : 'opacity-60'}`}>
                                                {myPlans.length} in progress
                                            </div>
                                        </div>
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* All Plans Tab */}
                        <TabsContent value="all" className="space-y-8">
                            {/* Plans Grid */}
                            {loading ? (
                                <LoadingGrid count={9} columns={{ mobile: 1, tablet: 2, desktop: 3, wide: 3 }} />
                            ) : plans.length === 0 ? (
                                <EmptyState
                                    icon={Dumbbell}
                                    title="No workout plans found"
                                    description="Try adjusting your filters or search query."
                                />
                            ) : (
                                <WorkoutPlanGrid
                                    plans={plans}
                                    onPlanClick={handlePlanClick}
                                    showProgress={false}
                                    userProgressMap={allPlansProgressMap}
                                />
                            )}

                            {/* Pagination */}
                            {totalPages > 1 && (
                                <div className="flex justify-center">
                                    <PaginationControls
                                        currentPage={currentPage}
                                        totalPages={totalPages}
                                        onPageChange={setCurrentPage}
                                    />
                                </div>
                            )}
                        </TabsContent>

                        {/* My Active Plans Tab */}
                        <TabsContent value="active" className="space-y-8">
                            {loading ? (
                                <LoadingGrid count={6} columns={{ mobile: 1, tablet: 2, desktop: 3, wide: 3 }} />
                            ) : myPlans.length === 0 ? (
                                <EmptyState
                                    icon={Dumbbell}
                                    title="No active workout plans"
                                    description="Start a workout plan to track your progress and earn XP!"
                                    actionLabel="Browse Plans"
                                    onAction={() => setActiveTab('all')}
                                />
                            ) : (
                                <WorkoutPlanGrid
                                    plans={myPlans.map(p => p.workoutPlan)}
                                    onPlanClick={handlePlanClick}
                                    showProgress={true}
                                    userProgressMap={new Map(myPlans.map(p => [
                                        p.workoutPlanId,
                                        {
                                            status: p.status,
                                            completedExercises: p.completedExercises,
                                            totalExercises: p.totalExercises
                                        }
                                    ]))}
                                />
                            )}
                        </TabsContent>
                    </Tabs>
                    </div>
                </div>
            )}
        </div>
    )
}


