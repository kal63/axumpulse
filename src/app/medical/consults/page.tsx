'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/auth-context'
import { apiClient } from '@/lib/api-client'
import { NeumorphicCard } from '@/components/user/NeumorphicCard'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Calendar, Plus, ArrowRight, Clock } from 'lucide-react'

export default function MedicalConsultsPage() {
  const router = useRouter()
  const { user, isLoading: authLoading } = useAuth()
  const [loading, setLoading] = useState(true)
  const [bookings, setBookings] = useState<any[]>([])

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
                  onClick={() => router.push('/medical/consults/slots')}
                  variant="outline"
                >
                  Manage Slots
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {bookings.length > 0 ? (
          <div className="space-y-4">
            {bookings.map((booking) => (
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
                        {booking.consultType?.replace('_', ' ')}
                      </Badge>
                      <Badge className={booking.status === 'confirmed' ? 'bg-green-500' : 'bg-yellow-500'}>
                        {booking.status}
                      </Badge>
                      <span className="text-sm text-[var(--neumorphic-muted)]">
                        User ID: {booking.userId}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-[var(--neumorphic-muted)]">
                      <Clock className="w-4 h-4" />
                      <span>{new Date(booking.slot?.startTime).toLocaleString()}</span>
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
              No Consultations Yet
            </h3>
            <p className="text-[var(--neumorphic-muted)] mb-4">
              Create time slots to start receiving bookings.
            </p>
            <Button
              onClick={() => router.push('/medical/consults/slots')}
              className="bg-gradient-to-r from-teal-500 to-emerald-600 text-white"
            >
              <Plus className="w-4 h-4 mr-2" />
              Create Slot
            </Button>
          </NeumorphicCard>
        )}
      </div>
    </div>
  )
}

