'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { useAuth } from '@/contexts/auth-context'
import { apiClient } from '@/lib/api-client'
import { NeumorphicCard } from '@/components/user/NeumorphicCard'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, Calendar, Clock, FileText } from 'lucide-react'

export default function ConsultDetailPage() {
  const router = useRouter()
  const params = useParams()
  const bookingId = parseInt(params.id as string)
  const { user, isLoading: authLoading } = useAuth()
  const [loading, setLoading] = useState(true)
  const [booking, setBooking] = useState<any>(null)

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login')
    } else if (user && bookingId) {
      fetchBooking()
    }
  }, [authLoading, user, router, bookingId])

  async function fetchBooking() {
    try {
      setLoading(true)
      const response = await apiClient.getConsultBooking(bookingId)
      if (response.success && response.data) {
        setBooking(response.data)
      }
    } catch (error) {
      console.error('Error fetching booking:', error)
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

  if (!user || !booking) {
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
                  Consultation Details
                </h1>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
        <NeumorphicCard variant="raised" className="p-6">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <Badge className="bg-blue-500 text-white">
                {booking.consultType?.replace('_', ' ')}
              </Badge>
              <Badge className={booking.status === 'confirmed' ? 'bg-green-500' : 'bg-yellow-500'}>
                {booking.status}
              </Badge>
            </div>
            <div className="flex items-center gap-2 text-[var(--neumorphic-muted)]">
              <Clock className="w-4 h-4" />
              <span>{new Date(booking.slot?.startTime).toLocaleString()}</span>
            </div>
            {booking.notes && (
              <div>
                <p className="text-sm font-semibold text-[var(--neumorphic-muted)] mb-2">Your Notes:</p>
                <p className="text-[var(--neumorphic-text)]">{booking.notes}</p>
              </div>
            )}
          </div>
        </NeumorphicCard>

        {booking.consultNotes && booking.consultNotes.length > 0 && (
          <NeumorphicCard variant="raised" className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <FileText className="w-5 h-5 text-[var(--neumorphic-muted)]" />
              <h2 className="text-xl font-bold text-[var(--neumorphic-text)]">Consult Notes</h2>
            </div>
            {booking.consultNotes.map((note: any, idx: number) => (
              <div key={idx} className="mb-4 p-4 rounded-lg bg-[var(--neumorphic-surface)]">
                {note.soapNotes && (
                  <div className="space-y-2">
                    {note.soapNotes.subjective && (
                      <div>
                        <p className="text-sm font-semibold text-[var(--neumorphic-muted)]">Subjective:</p>
                        <p className="text-[var(--neumorphic-text)]">{note.soapNotes.subjective}</p>
                      </div>
                    )}
                    {note.soapNotes.objective && (
                      <div>
                        <p className="text-sm font-semibold text-[var(--neumorphic-muted)]">Objective:</p>
                        <p className="text-[var(--neumorphic-text)]">{note.soapNotes.objective}</p>
                      </div>
                    )}
                    {note.soapNotes.assessment && (
                      <div>
                        <p className="text-sm font-semibold text-[var(--neumorphic-muted)]">Assessment:</p>
                        <p className="text-[var(--neumorphic-text)]">{note.soapNotes.assessment}</p>
                      </div>
                    )}
                    {note.soapNotes.plan && (
                      <div>
                        <p className="text-sm font-semibold text-[var(--neumorphic-muted)]">Plan:</p>
                        <p className="text-[var(--neumorphic-text)]">{note.soapNotes.plan}</p>
                      </div>
                    )}
                  </div>
                )}
                {note.recommendations && note.recommendations.length > 0 && (
                  <div className="mt-4">
                    <p className="text-sm font-semibold text-[var(--neumorphic-muted)] mb-2">Recommendations:</p>
                    <ul className="list-disc list-inside space-y-1">
                      {note.recommendations.map((rec: string, i: number) => (
                        <li key={i} className="text-[var(--neumorphic-text)]">{rec}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ))}
          </NeumorphicCard>
        )}
      </div>
    </div>
  )
}

