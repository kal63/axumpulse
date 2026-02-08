'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/auth-context'
import { apiClient } from '@/lib/api-client'
import { NeumorphicCard } from '@/components/user/NeumorphicCard'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Calendar, ArrowLeft, Clock, ChevronLeft, ChevronRight } from 'lucide-react'
import { toast } from 'sonner'

const DAYS_OF_WEEK = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

interface Doctor {
  id: number
  name: string
  email: string
  profilePicture?: string
  medicalProfessional?: {
    professionalType: string
    specialties: string[]
    verified: boolean
  }
}

interface Slot {
  id: number
  startAt: string
  endAt: string
  type: string
  provider?: Doctor
}

export default function BookConsultPage() {
  const router = useRouter()
  const { user, isLoading: authLoading } = useAuth()
  const [loading, setLoading] = useState(true)
  const [doctors, setDoctors] = useState<Doctor[]>([])
  const [selectedDoctor, setSelectedDoctor] = useState<number | null>(null)
  const [slots, setSlots] = useState<Slot[]>([])
  const [selectedSlot, setSelectedSlot] = useState<Slot | null>(null)
  const [notes, setNotes] = useState('')
  const [booking, setBooking] = useState(false)
  const [availableConsults, setAvailableConsults] = useState<number>(0)
  const [loadingBalance, setLoadingBalance] = useState(true)
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
    if (!authLoading && !user) {
      router.push('/login')
    } else if (user) {
      fetchDoctors()
      fetchConsultBalance()
    }
  }, [authLoading, user, router])

  async function fetchConsultBalance() {
    try {
      setLoadingBalance(true)
      const response = await apiClient.getConsultBalance()
      if (response.success && response.data) {
        setAvailableConsults(response.data.availableConsults || 0)
      }
    } catch (error) {
      console.error('Error fetching consult balance:', error)
    } finally {
      setLoadingBalance(false)
    }
  }

  useEffect(() => {
    if (selectedDoctor) {
      fetchSlots()
    } else {
      setSlots([])
    }
  }, [selectedDoctor, weekStart])

  async function fetchDoctors() {
    try {
      setLoading(true)
      const response = await apiClient.getConsultDoctors()
      if (response.success && response.data) {
        setDoctors(response.data)
      }
    } catch (error) {
      console.error('Error fetching doctors:', error)
      toast.error('Failed to load doctors')
    } finally {
      setLoading(false)
    }
  }

  async function fetchSlots() {
    if (!selectedDoctor) return

    try {
      setLoading(true)
      // Format weekStart as local calendar date (YYYY-MM-DD) to avoid timezone conversion
      const year = weekStart.getFullYear()
      const month = String(weekStart.getMonth() + 1).padStart(2, '0')
      const day = String(weekStart.getDate()).padStart(2, '0')
      const weekStartStr = `${year}-${month}-${day}`
      const response = await apiClient.getConsultSlots(selectedDoctor, weekStartStr)
      if (response.success && response.data) {
        setSlots(response.data)
      }
    } catch (error) {
      console.error('Error fetching slots:', error)
      toast.error('Failed to load available slots')
    } finally {
      setLoading(false)
    }
  }

  function getSlotsForDay(dayIndex: number) {
    // dayIndex: 0 = Sunday, 1 = Monday, ..., 6 = Saturday
    // weekStart is Monday, so:
    // Sunday (0) = Monday + 6 days
    // Monday (1) = Monday + 0 days  
    // Tuesday (2) = Monday + 1 day
    // etc.
    const offset = dayIndex === 0 ? 6 : dayIndex - 1
    
    // Calculate target date (local calendar date)
    const targetDate = new Date(weekStart)
    targetDate.setDate(weekStart.getDate() + offset)
    
    // Get target date string in local time (YYYY-MM-DD)
    const targetYear = targetDate.getFullYear()
    const targetMonth = targetDate.getMonth()
    const targetDay = targetDate.getDate()
    const targetDateStr = `${targetYear}-${String(targetMonth + 1).padStart(2, '0')}-${String(targetDay).padStart(2, '0')}`

    return slots.filter(slot => {
      // Convert slot UTC time to local time and compare the date part
      // This handles cases where UTC date differs from local date due to timezone conversion
      const slotDate = new Date(slot.startAt)
      const slotYear = slotDate.getFullYear()
      const slotMonth = slotDate.getMonth()
      const slotDay = slotDate.getDate()
      const slotDateStr = `${slotYear}-${String(slotMonth + 1).padStart(2, '0')}-${String(slotDay).padStart(2, '0')}`
      
      return slotDateStr === targetDateStr
    }).sort((a, b) => new Date(a.startAt).getTime() - new Date(b.startAt).getTime())
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

  async function handleBook() {
    if (!selectedSlot || !selectedDoctor) {
      toast.error('Please select a time slot')
      return
    }

    if (availableConsults <= 0) {
      toast.error('You do not have any available consults. Please purchase consults first.')
      router.push('/user/medical/consults/purchase')
      return
    }

    try {
      setBooking(true)
      const response = await apiClient.bookConsult({ startAt: selectedSlot.startAt, providerId: selectedDoctor, notes })
      if (response.success) {
        toast.success('Consultation booked successfully')
        // Refresh balance after booking
        await fetchConsultBalance()
        router.push('/user/medical/consults')
      } else {
        if (response.error?.code === 'INSUFFICIENT_CONSULTS') {
          toast.error('You do not have enough consults. Please purchase more consults.')
          router.push('/user/medical/consults/purchase')
        } else {
          throw new Error(response.error?.message || 'Failed to book consult')
        }
      }
    } catch (error: any) {
      if (error?.code === 'INSUFFICIENT_CONSULTS' || error?.message?.includes('consults')) {
        toast.error('You do not have enough consults. Please purchase more consults.')
        router.push('/user/medical/consults/purchase')
      } else {
        toast.error(error.message || 'Failed to book consultation')
      }
    } finally {
      setBooking(false)
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

  return (
    <div className="min-h-screen bg-[var(--neumorphic-bg)]">
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-teal-500/10 via-emerald-500/5 to-blue-500/10" />
        
        <div className="relative px-4 md:px-8 py-12">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center gap-4 mb-4">
              <Button
                onClick={() => router.push('/user/medical/consults')}
                variant="ghost"
                size="sm"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-r from-teal-500 to-emerald-600 rounded-full flex items-center justify-center">
                <Calendar className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-4xl md:text-5xl font-bold text-[var(--neumorphic-text)]">
                  Book Consultation
                </h1>
              </div>
            </div>
            
            {/* Available Consults Warning */}
            {!loadingBalance && (
              <div className={`mt-4 p-4 rounded-lg border ${
                availableConsults > 0 
                  ? 'bg-cyan-500/10 border-cyan-500/20' 
                  : 'bg-orange-500/10 border-orange-500/20'
              }`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Calendar className={`w-5 h-5 ${
                      availableConsults > 0 ? 'text-cyan-500' : 'text-orange-500'
                    }`} />
                    <span className={`font-semibold ${
                      availableConsults > 0 ? 'text-cyan-500' : 'text-orange-500'
                    }`}>
                      Available Consults: {availableConsults}
                    </span>
                  </div>
                  {availableConsults === 0 && (
                    <Button
                      onClick={() => router.push('/user/medical/consults/purchase')}
                      size="sm"
                      className="bg-gradient-to-r from-teal-500 to-emerald-600 text-white"
                    >
                      Purchase Consults
                    </Button>
                  )}
                </div>
                {availableConsults === 0 && (
                  <p className="text-sm text-orange-600 mt-2">
                    You need to purchase consults before booking a consultation.
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8 space-y-6">
        {/* Step 1: Select Doctor */}
        <NeumorphicCard variant="raised" className="p-6">
          <Label className="mb-4 block text-lg font-semibold">Step 1: Select Doctor</Label>
          <Select
            value={selectedDoctor?.toString() || ''}
            onValueChange={(v) => {
              setSelectedDoctor(parseInt(v))
              setSelectedSlot(null)
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder="Choose a medical professional" />
            </SelectTrigger>
            <SelectContent>
              {doctors.map((doctor) => (
                <SelectItem key={doctor.id} value={doctor.id.toString()}>
                  {doctor.name}
                  {doctor.medicalProfessional?.professionalType && 
                    ` - ${doctor.medicalProfessional.professionalType}`
                  }
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </NeumorphicCard>

        {/* Step 2: Select Slot (Week View) */}
        {selectedDoctor && (
          <>
            <NeumorphicCard variant="raised" className="p-6">
              <div className="flex items-center justify-between mb-6">
                <Label className="text-lg font-semibold">Step 2: Select Time Slot</Label>
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
                  const daySlots = getSlotsForDay(dayIndex)
                  const targetDate = new Date(weekStart)
                  if (dayIndex === 0) {
                    targetDate.setDate(weekStart.getDate() + 6)
                  } else {
                    targetDate.setDate(weekStart.getDate() + (dayIndex - 1))
                  }

                  return (
                    <div key={dayIndex} className="border border-[var(--neumorphic-border)] rounded-lg p-3">
                      <div className="font-semibold text-[var(--neumorphic-text)] mb-2">
                        {dayName}
                      </div>
                      <div className="text-xs text-[var(--neumorphic-muted)] mb-3">
                        {formatDate(targetDate)}
                      </div>
                      <div className="space-y-2 max-h-64 overflow-y-auto">
                        {daySlots.length > 0 ? (
                          daySlots.map((slot, slotIndex) => {
                            const isSelected = selectedSlot?.startAt === slot.startAt
                            return (
                              <button
                                key={slot.id || `slot-${dayIndex}-${slotIndex}`}
                                onClick={() => setSelectedSlot(slot)}
                                className={`w-full text-left p-2 rounded text-sm transition-colors ${
                                  isSelected
                                    ? 'bg-gradient-to-r from-teal-500 to-emerald-600 text-white'
                                    : 'bg-[var(--neumorphic-bg)] hover:bg-[var(--neumorphic-inset)] text-[var(--neumorphic-text)]'
                                }`}
                              >
                                <div className="flex items-center gap-1">
                                  <Clock className="w-3 h-3" />
                                  <span>{formatTime(slot.startAt)}</span>
                                </div>
                                <div className="text-xs opacity-75 mt-1">
                                  {slot.type?.replace('_', ' ')}
                                </div>
                              </button>
                            )
                          })
                        ) : (
                          <p className="text-xs text-[var(--neumorphic-muted)] italic">
                            No slots
                          </p>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </NeumorphicCard>

            {/* Step 3: Additional Notes */}
            {selectedSlot && (
              <NeumorphicCard variant="raised" className="p-6">
                <Label className="mb-4 block text-lg font-semibold">
                  Step 3: Additional Notes (Optional)
                </Label>
                <Textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Any additional information for the medical professional..."
                  rows={4}
                />
              </NeumorphicCard>
            )}

            {/* Book Button */}
            <Button
              onClick={handleBook}
              disabled={!selectedSlot || booking}
              className="w-full bg-gradient-to-r from-teal-500 to-emerald-600 text-white"
              size="lg"
            >
              {booking ? 'Booking...' : 'Book Consultation'}
            </Button>
          </>
        )}
      </div>
    </div>
  )
}
