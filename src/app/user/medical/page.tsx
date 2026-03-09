'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/auth-context'
import { apiClient } from '@/lib/api-client'
import { NeumorphicCard } from '@/components/user/NeumorphicCard'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Heart,
  FileText,
  AlertTriangle,
  Calendar,
  Activity,
  CheckCircle,
  XCircle,
  ArrowRight,
  Clock,
  Stethoscope,
  Award
} from 'lucide-react'

export default function MedicalHubPage() {
  const router = useRouter()
  const { user, isLoading: authLoading } = useAuth()
  const [loading, setLoading] = useState(true)
  const [profileStatus, setProfileStatus] = useState<'complete' | 'incomplete' | null>(null)
  const [recentTriage, setRecentTriage] = useState<any>(null)
  const [upcomingConsults, setUpcomingConsults] = useState<any[]>([])
  const [activeAlerts, setActiveAlerts] = useState<any[]>([])
  const [availableConsults, setAvailableConsults] = useState<number>(0)
  const [doctors, setDoctors] = useState<any[]>([])
  const [loadingDoctors, setLoadingDoctors] = useState(false)

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login')
    } else if (user) {
      fetchMedicalData()
    }
  }, [authLoading, user, router])

  async function fetchDoctors() {
    try {
      setLoadingDoctors(true)
      const response = await apiClient.getConsultDoctors()
      if (response.success && response.data) {
        // Ensure response.data is an array
        const doctorsList = Array.isArray(response.data) ? response.data : []
        setDoctors(doctorsList)
      } else {
        console.error('Failed to fetch doctors:', response.error)
        setDoctors([])
      }
    } catch (error) {
      console.error('Error fetching doctors:', error)
      setDoctors([])
    } finally {
      setLoadingDoctors(false)
    }
  }

  async function fetchMedicalData() {
    try {
      setLoading(true)

      // Check medical profile status
      const profileRes = await apiClient.getMedicalProfile()
      if (profileRes.success && profileRes.data) {
        const profile = profileRes.data
        const hasData = profile.conditions?.length > 0 || 
                       profile.medications?.length > 0 ||
                       profile.allergies?.length > 0
        setProfileStatus(hasData ? 'complete' : 'incomplete')
      } else {
        setProfileStatus('incomplete')
      }

      // Get recent triage runs
      const triageRes = await apiClient.getTriageRuns({ page: 1, pageSize: 1 })
      if (triageRes.success && triageRes.data && Array.isArray(triageRes.data.items) && triageRes.data.items.length > 0) {
        setRecentTriage(triageRes.data.items[0])
      }

      // Get upcoming consults
      const consultsRes = await apiClient.getConsultBookings({ page: 1, pageSize: 3, status: 'booked' })
      if (consultsRes.success && consultsRes.data?.items) {
        setUpcomingConsults(consultsRes.data.items)
      }

      // Get active alerts
      const alertsRes = await apiClient.getHealthAlerts({ page: 1, pageSize: 5, status: 'active' })
      if (alertsRes.success && alertsRes.data?.items) {
        setActiveAlerts(alertsRes.data.items)
      }

      // Get consult balance
      const balanceRes = await apiClient.getConsultBalance()
      if (balanceRes.success && balanceRes.data) {
        setAvailableConsults(balanceRes.data.availableConsults || 0)
      }

      // Get doctors list
      await fetchDoctors()
    } catch (error) {
      console.error('Error fetching medical data:', error)
    } finally {
      setLoading(false)
    }
  }

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--neumorphic-bg)]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-500 mx-auto"></div>
          <p className="mt-4 text-[var(--neumorphic-muted)]">Loading...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  const getRiskLevelColor = (riskLevel: string) => {
    switch (riskLevel) {
      case 'critical': return 'bg-red-500 text-white'
      case 'high': return 'bg-orange-500 text-white'
      case 'medium': return 'bg-yellow-500 text-white'
      case 'low': return 'bg-green-500 text-white'
      default: return 'bg-gray-500 text-white'
    }
  }

  return (
    <div className="min-h-screen bg-[var(--neumorphic-bg)]">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-teal-500/10 via-emerald-500/5 to-blue-500/10" />
        
        <div className="relative px-4 md:px-8 py-12">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-between mb-8">
              <div>
                <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-teal-500 to-emerald-600 text-white px-4 py-2 rounded-full text-sm font-medium mb-4">
                  <Heart className="w-4 h-4" />
                  <span>Medical Hub</span>
                </div>
                <h1 className="text-4xl md:text-6xl font-bold text-[var(--neumorphic-text)] mb-4">
                  Your Health & Wellness
                </h1>
                <p className="text-xl text-[var(--neumorphic-muted)] max-w-2xl">
                  Manage your medical profile, track health data, and connect with medical professionals
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Dashboard Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="space-y-8">
          {/* Overview Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {/* Medical Profile Status */}
            <NeumorphicCard variant="raised" className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-gradient-to-r from-teal-500 to-emerald-500 rounded-full flex items-center justify-center">
                  <FileText className="w-6 h-6 text-white" />
                </div>
                {profileStatus === 'complete' ? (
                  <CheckCircle className="w-6 h-6 text-green-500" />
                ) : (
                  <XCircle className="w-6 h-6 text-orange-500" />
                )}
              </div>
              <h3 className="text-lg font-semibold text-[var(--neumorphic-text)] mb-2">
                Medical Profile
              </h3>
              <p className="text-sm text-[var(--neumorphic-muted)] mb-4">
                {profileStatus === 'complete' ? 'Profile complete' : 'Profile incomplete'}
              </p>
              <Button
                onClick={() => router.push('/user/medical/profile')}
                className="w-full bg-gradient-to-r from-teal-500 to-emerald-600 hover:from-teal-600 hover:to-emerald-700 text-white"
              >
                {profileStatus === 'complete' ? 'Update Profile' : 'Complete Profile'}
              </Button>
            </NeumorphicCard>

            {/* Recent Triage */}
            <NeumorphicCard variant="raised" className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full flex items-center justify-center">
                  <Stethoscope className="w-6 h-6 text-white" />
                </div>
                {recentTriage && (
                  <Badge className={getRiskLevelColor(recentTriage.riskLevel)}>
                    {recentTriage.riskLevel}
                  </Badge>
                )}
              </div>
              <h3 className="text-lg font-semibold text-[var(--neumorphic-text)] mb-2">
                Recent Triage
              </h3>
              <p className="text-sm text-[var(--neumorphic-muted)] mb-4">
                {recentTriage 
                  ? `Last assessment: ${new Date(recentTriage.createdAt).toLocaleDateString()}`
                  : 'No assessments yet'
                }
              </p>
              <Button
                onClick={() => router.push('/user/medical/triage')}
                variant="outline"
                className="w-full"
              >
                View History
              </Button>
            </NeumorphicCard>

            {/* Upcoming Consults */}
            <NeumorphicCard variant="raised" className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                  <Calendar className="w-6 h-6 text-white" />
                </div>
                {upcomingConsults.length > 0 && (
                  <Badge className="bg-purple-500 text-white">
                    {upcomingConsults.length}
                  </Badge>
                )}
              </div>
              <h3 className="text-lg font-semibold text-[var(--neumorphic-text)] mb-2">
                Upcoming Consults
              </h3>
              <p className="text-sm text-[var(--neumorphic-muted)] mb-4">
                {upcomingConsults.length > 0 
                  ? `${upcomingConsults.length} scheduled`
                  : 'No upcoming consults'
                }
              </p>
              <Button
                onClick={() => router.push('/user/medical/consults')}
                variant="outline"
                className="w-full"
              >
                View Consults
              </Button>
            </NeumorphicCard>

            {/* Active Alerts */}
            <NeumorphicCard variant="raised" className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-gradient-to-r from-red-500 to-orange-500 rounded-full flex items-center justify-center">
                  <AlertTriangle className="w-6 h-6 text-white" />
                </div>
                {activeAlerts.length > 0 && (
                  <Badge className="bg-red-500 text-white">
                    {activeAlerts.length}
                  </Badge>
                )}
              </div>
              <h3 className="text-lg font-semibold text-[var(--neumorphic-text)] mb-2">
                Health Alerts
              </h3>
              <p className="text-sm text-[var(--neumorphic-muted)] mb-4">
                {activeAlerts.length > 0 
                  ? `${activeAlerts.length} active alerts`
                  : 'No active alerts'
                }
              </p>
              <Button
                onClick={() => router.push('/user/medical/alerts')}
                variant="outline"
                className="w-full"
              >
                View Alerts
              </Button>
            </NeumorphicCard>

            {/* Available Consults Counter */}
            <NeumorphicCard variant="raised" className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full flex items-center justify-center">
                  <Calendar className="w-6 h-6 text-white" />
                </div>
                {availableConsults > 0 && (
                  <Badge className="bg-cyan-500 text-white">
                    {availableConsults}
                  </Badge>
                )}
              </div>
              <h3 className="text-lg font-semibold text-[var(--neumorphic-text)] mb-2">
                Available Consults
              </h3>
              <p className="text-sm text-[var(--neumorphic-muted)] mb-4">
                {availableConsults > 0 
                  ? `${availableConsults} consult(s) available`
                  : 'No consults available'
                }
              </p>
              <Button
                onClick={() => router.push('/user/medical/consults/book')}
                variant="outline"
                className="w-full"
                disabled={availableConsults === 0}
              >
                {availableConsults > 0 ? 'Book Consult' : 'Purchase Consults'}
              </Button>
            </NeumorphicCard>
          </div>

          {/* Available Doctors Section */}
          <NeumorphicCard variant="raised" className="p-6">
            <h2 className="text-2xl font-bold text-[var(--neumorphic-text)] mb-6 flex items-center gap-2">
              <Stethoscope className="w-6 h-6 text-teal-500" />
              Available Doctors
            </h2>
            {loadingDoctors ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-500 mx-auto"></div>
                <p className="mt-4 text-[var(--neumorphic-muted)]">Loading doctors...</p>
              </div>
            ) : doctors.length === 0 ? (
              <div className="text-center py-8">
                <Stethoscope className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                <p className="text-[var(--neumorphic-muted)]">
                  No doctors available at the moment. Please check back later.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {doctors.map((doctor) => (
                  <NeumorphicCard
                    key={doctor.id}
                    variant="recessed"
                    className="p-4 hover:shadow-lg transition-all duration-300"
                  >
                    <div className="space-y-3">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="text-lg font-bold text-[var(--neumorphic-text)]">
                            {doctor.name}
                          </h3>
                          {doctor.medicalProfessional?.professionalType && (
                            <p className="text-sm text-[var(--neumorphic-muted)] capitalize">
                              {doctor.medicalProfessional.professionalType.replace('_', ' ')}
                            </p>
                          )}
                        </div>
                      </div>
                      
                      {Array.isArray(doctor.medicalProfessional?.specialties) && doctor.medicalProfessional.specialties.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {doctor.medicalProfessional.specialties.slice(0, 2).map((specialty: string, idx: number) => (
                            <Badge key={idx} variant="outline" className="text-xs">
                              {specialty}
                            </Badge>
                          ))}
                        </div>
                      )}

                      <div className="flex items-center justify-between pt-2 border-t border-[var(--neumorphic-border)]">
                        <div>
                          <p className="text-xs text-[var(--neumorphic-muted)]">Consult Fee</p>
                          <p className="text-xl font-bold text-[var(--neumorphic-text)]">
                            {doctor.medicalProfessional?.consultFee 
                              ? `${parseFloat(doctor.medicalProfessional.consultFee).toFixed(2)} ETB`
                              : 'N/A'
                            }
                          </p>
                        </div>
                        {doctor.medicalProfessional?.consultFee ? (
                          <Button
                            onClick={() => router.push(`/user/medical/consults/purchase?doctorId=${doctor.id}`)}
                            className="bg-gradient-to-r from-teal-500 to-emerald-600 hover:from-teal-600 hover:to-emerald-700 text-white"
                            size="sm"
                          >
                            Purchase
                          </Button>
                        ) : (
                          <Button
                            disabled
                            variant="outline"
                            size="sm"
                            className="opacity-50"
                            title="Doctor has not set a consult fee yet"
                          >
                            Fee Not Set
                          </Button>
                        )}
                      </div>
                    </div>
                  </NeumorphicCard>
                ))}
              </div>
            )}
          </NeumorphicCard>

          {/* Quick Actions */}
          <NeumorphicCard variant="raised" className="p-6">
            <h2 className="text-2xl font-bold text-[var(--neumorphic-text)] mb-6">
              Quick Actions
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <Button
                onClick={() => router.push('/user/medical/intake')}
                className="h-20 bg-gradient-to-r from-teal-500 to-emerald-600 hover:from-teal-600 hover:to-emerald-700 text-white text-lg font-semibold"
              >
                <FileText className="w-6 h-6 mr-3" />
                Take Intake Form
              </Button>
              
              <Button
                onClick={() => router.push('/user/medical/consults/book')}
                className="h-20 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white text-lg font-semibold"
              >
                <Calendar className="w-6 h-6 mr-3" />
                Book Consult
              </Button>
              
              <Button
                onClick={() => router.push('/user/medical/health-data')}
                className="h-20 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white text-lg font-semibold"
              >
                <Activity className="w-6 h-6 mr-3" />
                Log Health Data
              </Button>
              
              <Button
                onClick={() => router.push('/user/medical/questions')}
                className="h-20 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white text-lg font-semibold"
              >
                <Stethoscope className="w-6 h-6 mr-3" />
                Ask Question
              </Button>
              
              {user?.isMedical && (
                <Button
                  onClick={() => router.push('/medical/dashboard')}
                  className="h-20 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white text-lg font-semibold"
                >
                  <Award className="w-6 h-6 mr-3" />
                  Go to Dashboard
                </Button>
              )}
              
              {!user?.isMedical && (
                <Button
                  onClick={() => router.push('/user/medical/apply')}
                  className="h-20 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white text-lg font-semibold"
                >
                  <Award className="w-6 h-6 mr-3" />
                  Become Medical Pro
                </Button>
              )}
            </div>
          </NeumorphicCard>

          {/* Recent Activity */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Recent Triage Results */}
            <NeumorphicCard variant="raised" className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-[var(--neumorphic-text)] flex items-center gap-2">
                  <Stethoscope className="w-5 h-5 text-teal-500" />
                  Recent Triage Results
                </h3>
                <Button
                  onClick={() => router.push('/user/medical/triage')}
                  variant="ghost"
                  size="sm"
                >
                  View All <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
              
              {recentTriage ? (
                <div className="space-y-4">
                  <div className="p-4 rounded-xl bg-[var(--neumorphic-surface)]">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-[var(--neumorphic-muted)]">
                        {new Date(recentTriage.createdAt).toLocaleDateString()}
                      </span>
                      <Badge className={getRiskLevelColor(recentTriage.riskLevel)}>
                        {recentTriage.riskLevel}
                      </Badge>
                    </div>
                    <p className="text-sm font-semibold text-[var(--neumorphic-text)] mb-2">
                      Disposition: {recentTriage.disposition?.replace('_', ' ')}
                    </p>
                    {recentTriage.messages?.length > 0 && (
                      <p className="text-sm text-[var(--neumorphic-muted)]">
                        {recentTriage.messages[0]}
                      </p>
                    )}
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <Stethoscope className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                  <p className="text-[var(--neumorphic-muted)]">
                    No triage assessments yet. Complete an intake form to get started.
                  </p>
                </div>
              )}
            </NeumorphicCard>

            {/* Upcoming Consults */}
            <NeumorphicCard variant="raised" className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-[var(--neumorphic-text)] flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-blue-500" />
                  Upcoming Consults
                </h3>
                <Button
                  onClick={() => router.push('/user/medical/consults')}
                  variant="ghost"
                  size="sm"
                >
                  View All <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
              
              {upcomingConsults.length > 0 ? (
                <div className="space-y-4">
                  {upcomingConsults.map((consult) => (
                    <div key={consult.id} className="p-4 rounded-xl bg-[var(--neumorphic-surface)]">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-semibold text-[var(--neumorphic-text)]">
                          {consult.consultType?.replace('_', ' ')}
                        </span>
                        <Badge className="bg-blue-500 text-white">
                          {new Date(consult.slot?.startAt).toLocaleDateString()}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-[var(--neumorphic-muted)]">
                        <Clock className="w-4 h-4" />
                        <span>
                          {new Date(consult.slot?.startAt).toLocaleTimeString()}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Calendar className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                  <p className="text-[var(--neumorphic-muted)] mb-4">
                    No upcoming consults scheduled.
                  </p>
                  <Button
                    onClick={() => router.push('/user/medical/consults/book')}
                    className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white"
                  >
                    Book a Consult
                  </Button>
                </div>
              )}
            </NeumorphicCard>
          </div>
        </div>
      </div>
    </div>
  )
}

