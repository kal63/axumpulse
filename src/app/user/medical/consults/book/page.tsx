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
import { Calendar, ArrowLeft, Clock } from 'lucide-react'
import { toast } from 'sonner'

export default function BookConsultPage() {
  const router = useRouter()
  const { user, isLoading: authLoading } = useAuth()
  const [loading, setLoading] = useState(true)
  const [slots, setSlots] = useState<any[]>([])
  const [selectedSlot, setSelectedSlot] = useState<number | null>(null)
  const [notes, setNotes] = useState('')
  const [booking, setBooking] = useState(false)

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login')
    } else if (user) {
      fetchSlots()
    }
  }, [authLoading, user, router])

  async function fetchSlots() {
    try {
      setLoading(true)
      const response = await apiClient.getConsultSlots()
      if (response.success && response.data) {
        setSlots(response.data.filter((s: any) => s.status === 'open'))
      }
    } catch (error) {
      console.error('Error fetching slots:', error)
    } finally {
      setLoading(false)
    }
  }

  async function handleBook() {
    if (!selectedSlot) {
      toast.error('Please select a time slot')
      return
    }

    try {
      setBooking(true)
      const response = await apiClient.bookConsult({ slotId: selectedSlot, notes })
      if (response.success) {
        toast.success('Consultation booked successfully')
        router.push('/user/medical/consults')
      } else {
        throw new Error(response.error?.message || 'Failed to book consult')
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to book consultation')
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
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
        <NeumorphicCard variant="raised" className="p-6">
          <Label className="mb-4 block">Select Time Slot</Label>
          <Select value={selectedSlot?.toString()} onValueChange={(v) => setSelectedSlot(parseInt(v))}>
            <SelectTrigger>
              <SelectValue placeholder="Choose a time slot" />
            </SelectTrigger>
            <SelectContent>
              {slots.map((slot) => (
                <SelectItem key={slot.id} value={slot.id.toString()}>
                  {new Date(slot.startTime).toLocaleString()} - {slot.consultType?.replace('_', ' ')} ({slot.duration} min)
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </NeumorphicCard>

        <NeumorphicCard variant="raised" className="p-6">
          <Label className="mb-4 block">Additional Notes (Optional)</Label>
          <Textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Any additional information for the medical professional..."
            rows={4}
          />
        </NeumorphicCard>

        <Button
          onClick={handleBook}
          disabled={!selectedSlot || booking}
          className="w-full bg-gradient-to-r from-teal-500 to-emerald-600 text-white"
        >
          {booking ? 'Booking...' : 'Book Consultation'}
        </Button>
      </div>
    </div>
  )
}

