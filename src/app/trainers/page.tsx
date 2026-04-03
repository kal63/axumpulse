'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { apiClient } from '@/lib/api-client'
import { useAuth } from '@/contexts/auth-context'
import { canSubscribeToTrainerPlan } from '@/lib/trainee-guards'
import { NeumorphicCard } from '@/components/user/NeumorphicCard'
import { SearchBar } from '@/components/user/SearchBar'
import { LoadingGrid } from '@/components/user/LoadingGrid'
import { EmptyState } from '@/components/user/EmptyState'
import { 
  Users, 
  Search,
  Filter,
  Star,
  Award,
  UserCheck,
  Sparkles,
  ArrowRight,
  CheckCircle
} from 'lucide-react'
import { getImageUrl } from '@/lib/upload-utils'
import Image from 'next/image'
import Link from 'next/link'

import { PublicTrainer } from '@/lib/api-client'

function TrainersPageContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { user, isAuthenticated } = useAuth()
  const [trainers, setTrainers] = useState<PublicTrainer[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedSpecialty, setSelectedSpecialty] = useState<string>('')
  const [matchedForGoal, setMatchedForGoal] = useState<string | null>(null)

  useEffect(() => {
    fetchTrainers()
  }, [isAuthenticated, user?.profile?.traineeOnboardingCompletedAt])

  const fetchTrainers = async () => {
    try {
      setLoading(true)
      setMatchedForGoal(null)
      const useMatches =
        isAuthenticated && user && canSubscribeToTrainerPlan(user)
      if (useMatches) {
        const m = await apiClient.getTrainerMatches()
        if (m.success && m.data?.items?.length) {
          setMatchedForGoal(m.data.primaryGoal || null)
          setTrainers(
            m.data.items.map((trainer) => ({
              ...trainer,
              profilePicture: trainer.profilePicture ?? null
            }))
          )
          return
        }
      }
      const response = await apiClient.getPublicTrainers()
      if (response.success && response.data) {
        const trainersList = Array.isArray(response.data)
          ? response.data
          : (response.data.items || [])
        const typedTrainers = trainersList.map((trainer) => ({
          ...trainer,
          profilePicture: trainer.profilePicture ?? null
        }))
        setTrainers(typedTrainers)
      }
    } catch (error) {
      console.error('Failed to fetch trainers:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatSpecialty = (specialty: string): string => {
    return specialty
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ')
  }

  // Get all unique specialties
  const allSpecialties = Array.from(
    new Set(trainers.flatMap(t => t.specialties || []))
  ).sort()

  // Filter trainers
  const filteredTrainers = trainers.filter(trainer => {
    const matchesSearch = !searchQuery || 
      trainer.name.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesSpecialty = !selectedSpecialty || 
      (trainer.specialties || []).includes(selectedSpecialty)
    return matchesSearch && matchesSpecialty
  })

  const handleTrainerClick = (trainer: PublicTrainer) => {
    // Preserve planId and duration params if they exist
    const planId = searchParams.get('planId')
    const duration = searchParams.get('duration')
    const mode = searchParams.get('mode')
    
    let url = `/trainers/${trainer.userId}`
    const params = new URLSearchParams()
    if (planId) params.set('planId', planId)
    if (duration) params.set('duration', duration)
    if (mode) params.set('mode', mode)
    
    if (params.toString()) {
      url += `?${params.toString()}`
    }
    
    router.push(url)
  }

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
                <span>Expert Fitness Trainers</span>
              </div>
              <h1 className="text-4xl md:text-6xl font-bold text-[var(--neumorphic-text)] mb-4">
                🏋️ Find Your Trainer
              </h1>
              <p className="text-xl text-[var(--neumorphic-muted)] max-w-2xl mx-auto">
                Connect with certified trainers and start your personalized fitness journey
              </p>
              {matchedForGoal && (
                <p className="text-sm text-cyan-600 dark:text-cyan-400 max-w-2xl mx-auto mt-3">
                  Showing trainers ranked for your goal:{' '}
                  <span className="font-medium">{matchedForGoal.replace(/_/g, ' ')}</span>
                </p>
              )}
              {isAuthenticated && user && !canSubscribeToTrainerPlan(user) && (
                <p className="text-sm text-amber-700 dark:text-amber-400 max-w-2xl mx-auto mt-3">
                  <Link href="/register?traineeOnboarding=1" className="underline font-medium">
                    Complete your fitness profile
                  </Link>{' '}
                  for personalized trainer matching and subscriptions.
                </p>
              )}
            </div>

            {/* Search and Filter */}
            <div className="max-w-4xl mx-auto">
              <NeumorphicCard variant="raised" size="lg" className="p-6">
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="flex-1">
                    <SearchBar
                      value={searchQuery}
                      onChange={setSearchQuery}
                      placeholder="Search trainers by name..."
                    />
                  </div>
                </div>

                {/* Specialty Filter */}
                {allSpecialties.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-gray-200/50 dark:border-gray-700/50">
                    <label className="text-sm font-medium text-[var(--neumorphic-text)] mb-2 block">
                      Filter by Specialty
                    </label>
                    <div className="flex flex-wrap gap-2">
                      <button
                        onClick={() => setSelectedSpecialty('')}
                        className={`px-3 py-1 rounded-full text-sm transition-all duration-200 ${
                          selectedSpecialty === ''
                            ? 'bg-gradient-to-r from-cyan-500 to-purple-600 text-white'
                            : 'bg-[var(--neumorphic-surface)] hover:bg-[var(--neumorphic-hover)] text-[var(--neumorphic-text)]'
                        }`}
                      >
                        All Specialties
                      </button>
                      {allSpecialties.map((specialty) => (
                        <button
                          key={specialty}
                          onClick={() => setSelectedSpecialty(selectedSpecialty === specialty ? '' : specialty)}
                          className={`px-3 py-1 rounded-full text-sm transition-all duration-200 ${
                            selectedSpecialty === specialty
                              ? 'bg-gradient-to-r from-cyan-500 to-purple-600 text-white'
                              : 'bg-[var(--neumorphic-surface)] hover:bg-[var(--neumorphic-hover)] text-[var(--neumorphic-text)]'
                          }`}
                        >
                          {formatSpecialty(specialty)}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </NeumorphicCard>
            </div>
          </div>
        </div>
      </div>

      {/* Trainers Grid */}
      <div className="px-4 md:px-8 py-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <h2 className="text-2xl font-bold text-[var(--neumorphic-text)]">
                Available Trainers
              </h2>
              <div className="bg-[var(--neumorphic-surface)] px-3 py-1 rounded-full text-sm text-[var(--neumorphic-muted)]">
                {filteredTrainers.length} {filteredTrainers.length === 1 ? 'trainer' : 'trainers'}
              </div>
            </div>
          </div>

          {loading ? (
            <LoadingGrid count={6} columns={{ mobile: 1, tablet: 2, desktop: 3, wide: 3 }} />
          ) : filteredTrainers.length === 0 ? (
            <EmptyState
              icon={Users}
              title="No trainers found"
              description={searchQuery || selectedSpecialty 
                ? "Try adjusting your search or filters."
                : "No trainers are available at the moment."}
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredTrainers.map((trainer, index) => (
                <NeumorphicCard
                  key={trainer.userId}
                  variant="raised"
                  size="lg"
                  className="p-6 hover:scale-105 transition-transform duration-200 cursor-pointer group"
                  onClick={() => handleTrainerClick(trainer)}
                >
                  <div className="flex flex-col items-center text-center">
                    {/* Profile Picture */}
                    <div className="relative mb-4">
                      <div className="w-24 h-24 rounded-full overflow-hidden bg-gradient-to-r from-cyan-500 to-purple-600 flex items-center justify-center ring-4 ring-[var(--neumorphic-surface)]">
                        {trainer.profilePicture ? (
                          <Image
                            src={getImageUrl(trainer.profilePicture) || ''}
                            alt={trainer.name}
                            width={96}
                            height={96}
                            className="w-full h-full object-cover"
                            unoptimized
                          />
                        ) : (
                          <span className="text-white font-bold text-2xl">
                            {trainer.name.charAt(0).toUpperCase()}
                          </span>
                        )}
                      </div>
                      <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-green-500 rounded-full border-4 border-[var(--neumorphic-bg)] flex items-center justify-center">
                        <CheckCircle className="w-4 h-4 text-white" />
                      </div>
                    </div>

                    {/* Name */}
                    <h3 className="text-xl font-bold text-[var(--neumorphic-text)] mb-2">
                      {trainer.name}
                    </h3>

                    {/* Specialties */}
                    {Array.isArray(trainer.specialties) && trainer.specialties.length > 0 && (
                      <div className="flex flex-wrap gap-2 justify-center mb-4">
                        {trainer.specialties.slice(0, 3).map((specialty) => (
                          <span
                            key={specialty}
                            className="px-2 py-1 bg-gradient-to-r from-cyan-500/20 to-purple-600/20 text-[var(--neumorphic-text)] rounded-full text-xs font-medium"
                          >
                            {formatSpecialty(specialty)}
                          </span>
                        ))}
                        {trainer.specialties.length > 3 && (
                          <span className="px-2 py-1 bg-[var(--neumorphic-surface)] text-[var(--neumorphic-muted)] rounded-full text-xs">
                            +{trainer.specialties.length - 3} more
                          </span>
                        )}
                      </div>
                    )}

                    {/* View Profile Button */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        handleTrainerClick(trainer)
                      }}
                      className="mt-4 w-full flex items-center justify-center gap-2 px-4 py-2 bg-gradient-to-r from-cyan-500 to-purple-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all duration-200 group-hover:scale-105"
                    >
                      <span>View Profile</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </NeumorphicCard>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default function TrainersPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[var(--neumorphic-bg)] flex items-center justify-center">
        <div className="text-[var(--neumorphic-text)]">Loading...</div>
      </div>
    }>
      <TrainersPageContent />
    </Suspense>
  )
}

