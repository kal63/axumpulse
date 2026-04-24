'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/auth-context'
import { apiClient } from '@/lib/api-client'
import { NeumorphicCard } from '@/components/user/NeumorphicCard'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Calendar, ArrowLeft, Plus, Clock } from 'lucide-react'

export default function ConsultsPage() {
  const router = useRouter()
  const { user, isLoading: authLoading } = useAuth()
  const [loading, setLoading] = useState(true)
  const [bookings, setBookings] = useState<any[]>([])
  const [activeTab, setActiveTab] = useState<'upcoming' | 'completed'>('upcoming')

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login')
    } else if (user) {
      fetchBookings()
    }
  }, [authLoading, user, router])

  async function fetchBookings() {
    try {
      setLoading(true)
      const response = await apiClient.getConsultBookings({ page: 1, pageSize: 20 })
      if (response.success && response.data) {
        // response.data is already PaginatedResponse
        const bookingsData = response.data.items || []
        setBookings(Array.isArray(bookingsData) ? bookingsData : [])
      }
    } catch (error) {
      console.error('Error fetching bookings:', error)
    } finally {
      setLoading(false)
    }
  }

  const upcomingBookings = bookings.filter((booking) => {
    const status = booking.status
    
    // Only show as upcoming if status is 'booked' (not 'completed' or 'canceled')
    if (status !== 'booked') {
      return false
    }
    
    const slotEndTime = booking.slot?.endAt ? new Date(booking.slot.endAt) : null
    
    // If no end time, consider it upcoming
    if (!slotEndTime) {
      return true
    }
    
    // Compare using getTime() to avoid timezone issues
    const now = new Date().getTime()
    const endTime = slotEndTime.getTime()
    
    // Show as upcoming if slot hasn't ended yet (endTime is in the future)
    return endTime > now
  })

  const completedBookings = bookings.filter((booking) => {
    const status = booking.status
    
    // If status is explicitly 'completed' or 'canceled', show in completed
    if (status === 'completed' || status === 'canceled') {
      return true
    }
    
    // If status is 'booked', check if slot has ended
    if (status === 'booked') {
      const slotEndTime = booking.slot?.endAt ? new Date(booking.slot.endAt) : null
      
      // If no end time, don't show as completed
      if (!slotEndTime) {
        return false
      }
      
      // Compare using getTime() to avoid timezone issues
      const now = new Date().getTime()
      const endTime = slotEndTime.getTime()
      
      // Show as completed if slot has ended (endTime is in the past)
      return endTime <= now
    }
    
    return false
  })

  if (authLoading || loading) {
    return (
      <div className="flex min-h-dvh min-h-screen items-center justify-center user-app-page">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--ethio-deep-blue)] mx-auto"></div>
          <p className="mt-4 user-app-muted">Loading...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="min-h-dvh min-h-full user-app-page">
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-teal-500/10 via-emerald-500/5 to-blue-500/10" />
        
        <div className="relative px-4 md:px-8 py-12">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Button
                  onClick={() => router.push('/user/medical')}
                  variant="ghost"
                  size="sm"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back
                </Button>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-r from-teal-500 to-emerald-600 rounded-full flex items-center justify-center">
                    <Calendar className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h1 className="text-4xl md:text-5xl font-bold user-app-ink">
                      Consultations
                    </h1>
                  </div>
                </div>
              </div>
              <Button
                onClick={() => router.push('/user/medical/consults/book')}
                className="bg-gradient-to-r from-teal-500 to-emerald-600 text-white"
              >
                <Plus className="w-4 h-4 mr-2" />
                Book Consult
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          <Button
            variant={activeTab === 'upcoming' ? 'default' : 'outline'}
            onClick={() => setActiveTab('upcoming')}
            className={activeTab === 'upcoming' ? 'bg-gradient-to-r from-teal-500 to-emerald-600 text-white' : ''}
          >
            Upcoming ({upcomingBookings.length})
          </Button>
          <Button
            variant={activeTab === 'completed' ? 'default' : 'outline'}
            onClick={() => setActiveTab('completed')}
            className={activeTab === 'completed' ? 'bg-gradient-to-r from-teal-500 to-emerald-600 text-white' : ''}
          >
            Completed ({completedBookings.length})
          </Button>
        </div>

        {(() => {
          const displayBookings = activeTab === 'upcoming' ? upcomingBookings : completedBookings
          
          return displayBookings.length > 0 ? (
            <div className="space-y-4">
              {displayBookings.map((booking) => (
                <NeumorphicCard
                  key={booking.id}
                  variant="raised"
                  className="p-6 cursor-pointer"
                  onClick={() => router.push(`/user/medical/consults/${booking.id}`)}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <Badge className="bg-blue-500 text-white">
                          {(booking.slot?.type || booking.consultType || 'N/A')?.replace('_', ' ')}
                        </Badge>
                        <Badge className={
                          booking.status === 'completed' 
                            ? 'bg-green-500 text-white'
                            : booking.status === 'canceled'
                            ? 'bg-red-500 text-white'
                            : 'bg-yellow-500 text-white'
                        }>
                          {booking.status}
                        </Badge>
                        {booking.slot?.provider && (
                          <span className="text-sm user-app-muted">
                            Provider: {booking.slot.provider.name}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-sm user-app-muted">
                        <Clock className="w-4 h-4" />
                        <span>
                          {booking.slot?.startAt || booking.slot?.startTime
                            ? new Date(booking.slot.startAt || booking.slot.startTime).toLocaleString()
                            : 'Date not available'}
                        </span>
                        {booking.slot?.endAt && (
                          <>
                            <span> - </span>
                            <span>{new Date(booking.slot.endAt).toLocaleString()}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </NeumorphicCard>
              ))}
            </div>
          ) : (
            <NeumorphicCard variant="raised" className="p-12 text-center">
              <Calendar className="w-16 h-16 mx-auto mb-4 text-gray-400" />
              <h3 className="text-xl font-semibold user-app-ink mb-2">
                {activeTab === 'upcoming' ? 'No Upcoming Consultations' : 'No Completed Consultations'}
              </h3>
              {activeTab === 'upcoming' && (
                <Button
                  onClick={() => router.push('/user/medical/consults/book')}
                  className="bg-gradient-to-r from-teal-500 to-emerald-600 text-white"
                >
                  Book Your First Consult
                </Button>
              )}
            </NeumorphicCard>
          )
        })()}
      </div>
    </div>
  )
}

