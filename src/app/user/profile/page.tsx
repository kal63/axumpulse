'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/auth-context'
import { apiClient } from '@/lib/api-client'
import { NeumorphicCard } from '@/components/user/NeumorphicCard'
import { XPRing } from '@/components/user/XPRing'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  User, 
  Settings as SettingsIcon, 
  Edit3, 
  MapPin, 
  Calendar, 
  Trophy, 
  Target, 
  Zap, 
  Award, 
  Star, 
  Flame, 
  Dumbbell, 
  Heart, 
  Clock, 
  Users, 
  ChevronRight,
  Sparkles,
  CheckCircle,
  Camera,
  Mail,
  Phone,
  LogOut
} from 'lucide-react'

export default function ProfilePage() {
  const router = useRouter()
  const { user: authUser, logout } = useAuth()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [profileData, setProfileData] = useState<any>(null)
  const [stats, setStats] = useState<any>(null)

  useEffect(() => {
    fetchProfile()
  }, [])

  async function fetchProfile() {
    try {
      setLoading(true)
      setError(null)

      const response = await apiClient.getUserProfile()

      if (response.success && response.data) {
        setProfileData(response.data.user)
        setStats(response.data.stats)
      } else {
        setError('Failed to load profile')
      }
    } catch (err) {
      console.error('Error fetching profile:', err)
      setError('Failed to load profile')
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = () => {
    router.push('/user/settings')
  }

  const handleApplyTrainer = () => {
    router.push('/user/apply')
  }

  const handleViewStatus = () => {
    router.push('/user/apply')
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--color-cyber-blue)] mx-auto mb-4"></div>
          <p className="text-[var(--neumorphic-text)]">Loading profile...</p>
        </div>
      </div>
    )
  }

  if (error || !profileData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <User className="h-16 w-16 mx-auto mb-4 text-red-500 opacity-50" />
          <p className="text-[var(--neumorphic-text)] text-xl font-semibold mb-2">
            Failed to load profile
          </p>
          <p className="text-[var(--neumorphic-muted)] mb-4">{error}</p>
          <Button
            onClick={fetchProfile}
            className="bg-gradient-to-r from-[var(--color-cyber-blue)] to-[var(--color-neon-magenta)] text-white"
          >
            Try Again
          </Button>
        </div>
      </div>
    )
  }

  const content = (
    <div className="min-h-screen bg-[var(--neumorphic-bg)]">
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
                <span>Your Personal Profile</span>
              </div>
              <h1 className="text-4xl md:text-6xl font-bold text-[var(--neumorphic-text)] mb-4">
                👤 My Profile
              </h1>
              <p className="text-xl text-[var(--neumorphic-muted)] max-w-2xl mx-auto">
                Showcase your fitness journey, achievements, and personal information
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="space-y-8">
          {/* Profile Header Card */}
          <NeumorphicCard variant="raised" className="p-8">
            <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
              {/* Profile Picture */}
              <div className="relative">
                <div className="w-32 h-32 bg-gradient-to-br from-cyan-500 to-purple-600 rounded-full flex items-center justify-center text-white text-4xl font-bold">
                  {profileData?.name?.charAt(0) || 'U'}
                </div>
                <button className="absolute bottom-0 right-0 w-10 h-10 bg-gradient-to-r from-cyan-500 to-purple-600 rounded-full flex items-center justify-center text-white hover:scale-110 transition-transform">
                  <Camera className="w-5 h-5" />
                </button>
              </div>

              {/* Profile Info */}
              <div className="flex-1 text-center md:text-left">
                <div className="flex items-center justify-center md:justify-start gap-3 mb-2">
                  <h2 className="text-3xl font-bold text-[var(--neumorphic-text)]">
                    {profileData?.name || 'User'}
                  </h2>
                  <Badge variant="secondary" className="bg-gradient-to-r from-cyan-500 to-purple-600 text-white">
                    Level {profileData?.level || 1}
                  </Badge>
                </div>
                
                {profileData?.bio && (
                  <p className="text-[var(--neumorphic-muted)] mb-4 max-w-md">
                    {profileData.bio}
                  </p>
                )}

                <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-sm text-[var(--neumorphic-muted)]">
                  {profileData?.location && (
                    <div className="flex items-center gap-1">
                      <MapPin className="w-4 h-4" />
                      <span>{profileData.location}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    <span>Joined {new Date(profileData?.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>

              {/* XP Ring */}
              <div className="flex flex-col items-center">
                <XPRing 
                  currentXP={profileData?.xp || 0} 
                  level={profileData?.level || 1} 
                  xpToNextLevel={(profileData?.xpNeeded || 100) - (profileData?.xpProgress || 0)}
                  size="lg"
                />
                <p className="text-sm text-[var(--neumorphic-muted)] mt-2 text-center">
                  {profileData?.xpProgress || 0}/{profileData?.xpNeeded || 100} XP to next level
                </p>
              </div>
            </div>
          </NeumorphicCard>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <NeumorphicCard variant="raised" className="p-6 text-center">
              <div className="flex items-center justify-center w-12 h-12 mx-auto mb-4 bg-gradient-to-br from-cyan-500 to-blue-500 rounded-xl">
                <Trophy className="h-6 w-6 text-white" />
              </div>
              <div className="text-3xl font-bold text-[var(--neumorphic-text)] mb-1">
                {stats?.challengesCompleted || 0}
              </div>
              <div className="text-sm text-[var(--neumorphic-muted)]">Challenges</div>
            </NeumorphicCard>

            <NeumorphicCard variant="raised" className="p-6 text-center">
              <div className="flex items-center justify-center w-12 h-12 mx-auto mb-4 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl">
                <Dumbbell className="h-6 w-6 text-white" />
              </div>
              <div className="text-3xl font-bold text-[var(--neumorphic-text)] mb-1">
                {stats?.workoutPlansCompleted || 0}
              </div>
              <div className="text-sm text-[var(--neumorphic-muted)]">Workouts</div>
            </NeumorphicCard>

            <NeumorphicCard variant="raised" className="p-6 text-center">
              <div className="flex items-center justify-center w-12 h-12 mx-auto mb-4 bg-gradient-to-br from-orange-500 to-red-500 rounded-xl">
                <Flame className="h-6 w-6 text-white" />
              </div>
              <div className="text-3xl font-bold text-[var(--neumorphic-text)] mb-1">
                {stats?.streak || 0}
              </div>
              <div className="text-sm text-[var(--neumorphic-muted)]">Day Streak</div>
            </NeumorphicCard>

            <NeumorphicCard variant="raised" className="p-6 text-center">
              <div className="flex items-center justify-center w-12 h-12 mx-auto mb-4 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl">
                <Award className="h-6 w-6 text-white" />
              </div>
              <div className="text-3xl font-bold text-[var(--neumorphic-text)] mb-1">
                {stats?.achievementsUnlocked || 0}
              </div>
              <div className="text-sm text-[var(--neumorphic-muted)]">Achievements</div>
            </NeumorphicCard>
          </div>

          {/* Recent Achievements */}
          <NeumorphicCard variant="raised" className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-[var(--neumorphic-text)] flex items-center gap-2">
                <Trophy className="h-5 w-5 text-yellow-500" />
                Recent Achievements
              </h3>
              <button className="flex items-center gap-2 text-[var(--neumorphic-accent)] hover:text-[var(--neumorphic-accent-hover)] transition-colors">
                <span>View All</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[
                { title: "First Workout", description: "Completed your first workout", icon: Dumbbell, color: "from-cyan-500 to-blue-500", date: "2 days ago" },
                { title: "Week Warrior", description: "Completed 7 workouts in a week", icon: Calendar, color: "from-purple-500 to-pink-500", date: "1 week ago" },
                { title: "Challenge Master", description: "Completed your first challenge", icon: Target, color: "from-orange-500 to-red-500", date: "3 days ago" }
              ].map((achievement, index) => (
                <div key={index} className="p-4 bg-[var(--neumorphic-surface)] rounded-xl">
                  <div className="flex items-start gap-3">
                    <div className={`w-10 h-10 bg-gradient-to-br ${achievement.color} rounded-xl flex items-center justify-center`}>
                      <achievement.icon className="h-5 w-5 text-white" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-[var(--neumorphic-text)]">
                        {achievement.title}
                      </h4>
                      <p className="text-sm text-[var(--neumorphic-muted)]">
                        {achievement.description}
                      </p>
                      <p className="text-xs text-[var(--neumorphic-muted)] mt-1">
                        {achievement.date}
                      </p>
                    </div>
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  </div>
                </div>
              ))}
            </div>
          </NeumorphicCard>

          {/* Become a Trainer Section */}
          <NeumorphicCard variant="raised" className="p-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Award className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-[var(--neumorphic-text)] mb-2">
                Become a Trainer
              </h3>
              <p className="text-[var(--neumorphic-muted)] mb-6">
                Share your fitness expertise and help others achieve their goals
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                <Button 
                  onClick={handleApplyTrainer}
                  className="flex-1 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white"
                >
                  <Award className="w-4 h-4 mr-2" />
                  Apply Now
                </Button>
                <Button 
                  variant="outline"
                  onClick={handleViewStatus}
                  className="flex-1"
                >
                  <CheckCircle className="w-4 h-4 mr-2" />
                  View Status
                </Button>
              </div>
            </div>
          </NeumorphicCard>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4">
            <Button 
              onClick={handleEdit}
              className="flex-1 bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-600 hover:to-purple-700 text-white"
            >
              <Edit3 className="w-4 h-4 mr-2" />
              Edit Profile
            </Button>
            <Button 
              variant="outline"
              onClick={() => router.push('/user/settings')}
              className="flex-1"
            >
              <SettingsIcon className="w-4 h-4 mr-2" />
              Settings
            </Button>
          </div>

          {/* Logout Button */}
          <div className="mt-6">
            <Button 
              variant="outline"
              onClick={logout}
              className="w-full border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </div>
    </div>
  )

  return content
}


