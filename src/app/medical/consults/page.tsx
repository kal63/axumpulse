'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/auth-context'
import { apiClient } from '@/lib/api-client'
import { NeumorphicCard } from '@/components/user/NeumorphicCard'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Calendar, Plus, ArrowRight, Clock, ChevronLeft, ChevronRight, List, Grid } from 'lucide-react'

const DAYS_OF_WEEK = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

export default function MedicalConsultsPage() {
  const router = useRouter()
  const { user, isLoading: authLoading } = useAuth()
  const [loading, setLoading] = useState(true)
  const [bookings, setBookings] = useState<any[]>([])
  const [activeTab, setActiveTab] = useState<'upcoming' | 'completed'>('upcoming')
  const [viewMode, setViewMode] = useState<'list' | 'calendar'>('calendar')
  const [weekStart, setWeekStart] = useState<Date>(() => {
    // Get current week's Monday
    const now = new Date()
    const day = now.getDay() // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
    const diff = day === 0 ? -6 : 1 - day // Monday is day 1, so offset is 1-day
    const monday = new Date(now)
    monday.setDate(now.getDate() + diff)
    monday.setHours(0, 0, 0, 0)
    return monday
  })

  useEffect(() => {
    if (!authLoading && user) {
      fetchBookings()
    }
  }, [authLoading, user])

  async function fetchBookings() {
    try {
      setLoading(true)
      const response = await apiClient.getMedicalConsults({ page: 1, pageSize: 50 })
      if (response.success && response.data) {
        setBookings(response.data.items || [])
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

  function getBookingsForDay(dayIndex: number) {
    // dayIndex: 0 = Sunday, 1 = Monday, ..., 6 = Saturday
    const targetDate = new Date(weekStart)
    const offset = dayIndex === 0 ? 6 : dayIndex - 1
    targetDate.setDate(weekStart.getDate() + offset)
    const targetDateStr = targetDate.toISOString().split('T')[0]

    return upcomingBookings.filter(booking => {
      if (!booking.slot?.startAt) return false
      const slotDate = new Date(booking.slot.startAt)
      const slotDateStr = slotDate.toISOString().split('T')[0]
      return slotDateStr === targetDateStr
    }).sort((a, b) => {
      const timeA = new Date(a.slot?.startAt || 0).getTime()
      const timeB = new Date(b.slot?.startAt || 0).getTime()
      return timeA - timeB
    })
  }

  function navigateWeek(direction: 'prev' | 'next') {
    const newWeek = new Date(weekStart)
    newWeek.setDate(weekStart.getDate() + (direction === 'next' ? 7 : -7))
    setWeekStart(newWeek)
  }

  function formatTime(dateString: string) {
    const date = new Date(dateString)
    return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })
  }

  function formatDate(date: Date) {
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
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

  return (
    <div className="min-h-screen bg-[var(--neumorphic-bg)]">
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-teal-500/10 via-emerald-500/5 to-blue-500/10" />
        
        <div className="relative px-4 md:px-8 py-12">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-r from-teal-500 to-emerald-600 rounded-full flex items-center justify-center">
                  <Calendar className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-4xl md:text-5xl font-bold text-[var(--neumorphic-text)]">
                    Consultations
                  </h1>
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={() => setViewMode(viewMode === 'list' ? 'calendar' : 'list')}
                  variant="outline"
                  size="sm"
                >
                  {viewMode === 'list' ? (
                    <>
                      <Grid className="w-4 h-4 mr-2" />
                      Calendar View
                    </>
                  ) : (
                    <>
                      <List className="w-4 h-4 mr-2" />
                      List View
                    </>
                  )}
                </Button>
                <Button
                  onClick={() => router.push('/medical/consults/slots')}
                  variant="outline"
                >
                  Manage Schedule
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {viewMode === 'calendar' && activeTab === 'upcoming' ? (
          <>
            {/* Calendar View for Upcoming Bookings */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-semibold text-[var(--neumorphic-text)]">
                  Upcoming Bookings
                </h2>
                <div className="flex items-center gap-4">
                  <Button
                    onClick={() => navigateWeek('prev')}
                    variant="outline"
                    size="sm"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </Button>
                  <span className="text-sm font-medium text-[var(--neumorphic-text)]">
                    Week of {formatDate(weekStart)}
                  </span>
                  <Button
                    onClick={() => navigateWeek('next')}
                    variant="outline"
                    size="sm"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {/* Week Grid */}
              <div className="grid grid-cols-1 md:grid-cols-7 gap-4">
                {DAYS_OF_WEEK.map((dayName, dayIndex) => {
                  const dayBookings = getBookingsForDay(dayIndex)
                  const targetDate = new Date(weekStart)
                  const offset = dayIndex === 0 ? 6 : dayIndex - 1
                  targetDate.setDate(weekStart.getDate() + offset)

                  return (
                    <NeumorphicCard key={dayIndex} variant="raised" className="p-4">
                      <div className="font-semibold text-[var(--neumorphic-text)] mb-2">
                        {dayName}
                      </div>
                      <div className="text-xs text-[var(--neumorphic-muted)] mb-3">
                        {formatDate(targetDate)}
                      </div>
                      <div className="space-y-2 max-h-96 overflow-y-auto">
                        {dayBookings.length > 0 ? (
                          dayBookings.map((booking) => (
                            <div
                              key={booking.id}
                              onClick={() => router.push(`/medical/consults/${booking.id}`)}
                              className="p-2 rounded bg-gradient-to-r from-teal-500/20 to-emerald-600/20 border border-teal-500/30 cursor-pointer hover:from-teal-500/30 hover:to-emerald-600/30 transition-colors"
                            >
                              <div className="flex items-center gap-1 mb-1">
                                <Clock className="w-3 h-3 text-teal-600" />
                                <span className="text-sm font-medium text-[var(--neumorphic-text)]">
                                  {formatTime(booking.slot.startAt)}
                                </span>
                              </div>
                              <div className="text-xs font-medium text-teal-700">
                                {booking.user?.name || 'Unknown'}
                              </div>
                              <div className="text-xs text-[var(--neumorphic-muted)] mt-1">
                                {booking.slot?.type?.replace('_', ' ') || 'Consultation'}
                              </div>
                            </div>
                          ))
                        ) : (
                          <p className="text-xs text-[var(--neumorphic-muted)] italic">
                            No bookings
                          </p>
                        )}
                      </div>
                    </NeumorphicCard>
                  )
                })}
              </div>
            </div>
          </>
        ) : (
          <>
            {/* List View */}
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
                  onClick={() => router.push(`/medical/consults/${booking.id}`)}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <Badge className="bg-blue-500 text-white">
                          {booking.slot?.type?.replace('_', ' ') || booking.consultType?.replace('_', ' ') || 'Consultation'}
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
                        <span className="text-sm text-[var(--neumorphic-muted)]">
                          Name: {booking.user?.name}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-[var(--neumorphic-muted)]">
                        <Clock className="w-4 h-4" />
                        <span>
                          {booking.slot?.startAt 
                            ? new Date(booking.slot.startAt).toLocaleString()
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
                    <Button variant="outline">
                      View <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </div>
                </NeumorphicCard>
              ))}
            </div>
          ) : (
            <NeumorphicCard variant="raised" className="p-12 text-center">
              <Calendar className="w-16 h-16 mx-auto mb-4 text-gray-400" />
              <h3 className="text-xl font-semibold text-[var(--neumorphic-text)] mb-2">
                {activeTab === 'upcoming' ? 'No Upcoming Consultations' : 'No Completed Consultations'}
              </h3>
              <p className="text-[var(--neumorphic-muted)] mb-4">
                {activeTab === 'upcoming' 
                  ? 'Create time slots to start receiving bookings.'
                  : 'Completed consultations will appear here.'}
              </p>
              {activeTab === 'upcoming' && (
                <Button
                  onClick={() => router.push('/medical/consults/slots')}
                  className="bg-gradient-to-r from-teal-500 to-emerald-600 text-white"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Create Slot
                </Button>
              )}
            </NeumorphicCard>
          )
        })()}
          </>
        )}
      </div>
    </div>
  )
}

