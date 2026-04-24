'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { useAuth } from '@/contexts/auth-context'
import { apiClient } from '@/lib/api-client'
import { NeumorphicCard } from '@/components/user/NeumorphicCard'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, Calendar, Clock, FileText, Phone } from 'lucide-react'
import { toast } from 'sonner'
import { VideoCall } from '@/components/medical/VideoCall'
import { AudioCall } from '@/components/medical/AudioCall'
import { Video } from 'lucide-react'

export default function ConsultDetailPage() {
  const router = useRouter()
  const params = useParams()
  const bookingId = parseInt(params.id as string)
  const { user, isLoading: authLoading } = useAuth()
  const [loading, setLoading] = useState(true)
  const [booking, setBooking] = useState<any>(null)
  const [isCallActive, setIsCallActive] = useState(false)
  const [callRoomId, setCallRoomId] = useState<string | null>(null)
  const [callType, setCallType] = useState<'video' | 'audio' | null>(null) // Track call type

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
      console.log('Full response:', response)
      if (response.success && response.data) {
        // Handle nested response structure
        const bookingData = (response.data as any).data || response.data
        console.log('Booking data:', bookingData)
        
        // Separate user note (string) from consult note (object) if present
        const consultNote = bookingData.note && typeof bookingData.note === 'object' ? bookingData.note : null
        const userNote = bookingData.note && typeof bookingData.note === 'string' ? bookingData.note : null
        
        // Remove the note object from bookingData to avoid rendering issues
        const { note, ...bookingWithoutNote } = bookingData
        // Include callStatus in booking state for notification
        setBooking({ ...bookingWithoutNote, userNote, consultNote, callStatus: bookingData.callStatus })
        
        // Check if call is active
        // Don't auto-join on page load - let user manually join
        if (bookingData.callRoomId && (bookingData.callStatus === 'ringing' || bookingData.callStatus === 'in_progress')) {
          setCallRoomId(bookingData.callRoomId)
          // Don't auto-set isCallActive - user should manually join
          setIsCallActive(false)
        } else {
          setIsCallActive(false)
          setCallRoomId(null)
          setCallType(null)
        }
      }
    } catch (error) {
      console.error('Error fetching booking:', error)
    } finally {
      setLoading(false)
    }
  }
  
  // Poll for call status if booking is booked and no call active
  useEffect(() => {
    if (!booking || isCallActive || booking.status !== 'booked') return
    
    const interval = setInterval(async () => {
      try {
        const response = await apiClient.getUserCallStatus(bookingId)
        if (response.success && response.data) {
          const { callStatus, callRoomId } = response.data
          if (callRoomId && (callStatus === 'ringing' || callStatus === 'in_progress')) {
            setCallRoomId(callRoomId)
            // Update booking callStatus for notification
            setBooking((prev: any) => prev ? { ...prev, callStatus } : prev)
            if (callStatus === 'ringing') {
              toast.info('Incoming call from medical professional')
            }
          }
        }
      } catch (error) {
        console.error('Error checking call status:', error)
      }
    }, 3000) // Check every 3 seconds
    
    return () => clearInterval(interval)
  }, [booking, bookingId, isCallActive])

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

  if (!user || !booking) {
    return null
  }

  return (
    <div className="min-h-dvh min-h-full user-app-page">
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
                <h1 className="text-4xl md:text-5xl font-bold user-app-ink">
                  Consultation Details
                </h1>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
        {/* Incoming Call Notification - When call is ringing */}
        {booking.status === 'booked' && callRoomId && booking.callStatus === 'ringing' && !isCallActive && (
          <NeumorphicCard variant="raised" className="p-6 bg-gradient-to-r from-teal-500/10 to-emerald-500/10 border-2 border-teal-500/30">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-gradient-to-r from-teal-500 to-emerald-600 flex items-center justify-center animate-pulse">
                  <Phone className="w-8 h-8 text-white" />
                </div>
                <div>
                  <p className="text-lg font-semibold user-app-ink">
                    Incoming call from {booking.slot?.provider?.name || 'Medical Professional'}
                  </p>
                  <p className="text-sm user-app-muted">
                    Choose how you'd like to join
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={async () => {
                    try {
                      const response = await apiClient.joinCall(bookingId)
                      if (response.success && response.data) {
                        setIsCallActive(true)
                        setCallType('video')
                        toast.success('Joining video call...')
                      } else {
                        throw new Error(response.error?.message || 'Failed to join call')
                      }
                    } catch (error: any) {
                      toast.error(error.message || 'Failed to join call')
                    }
                  }}
                  className="bg-gradient-to-r from-teal-500 to-emerald-600 text-white"
                >
                  <Video className="w-4 h-4 mr-2" />
                  Join Video
                </Button>
                <Button
                  onClick={async () => {
                    try {
                      const response = await apiClient.joinCall(bookingId)
                      if (response.success && response.data) {
                        setIsCallActive(true)
                        setCallType('audio')
                        toast.success('Joining audio call...')
                      } else {
                        throw new Error(response.error?.message || 'Failed to join call')
                      }
                    } catch (error: any) {
                      toast.error(error.message || 'Failed to join call')
                    }
                  }}
                  variant="outline"
                  className="border-teal-500 text-teal-600 hover:bg-teal-50"
                >
                  <Phone className="w-4 h-4 mr-2" />
                  Join Audio
                </Button>
              </div>
            </div>
          </NeumorphicCard>
        )}
        
        {/* Call In Progress Banner - When call is in progress but user hasn't joined yet */}
        {booking.status === 'booked' && callRoomId && booking.callStatus === 'in_progress' && !isCallActive && (
          <NeumorphicCard variant="raised" className="p-6 bg-gradient-to-r from-[var(--ethio-lemon)]/10 to-[var(--ethio-deep-blue)]/10 border-2 border-[var(--ethio-deep-blue)]/30">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-gradient-to-r from-[var(--ethio-lemon)] to-[var(--ethio-deep-blue)] flex items-center justify-center">
                  <Video className="w-8 h-8 text-white" />
                </div>
                <div>
                  <p className="text-lg font-semibold user-app-ink">
                    Call in progress with {booking.slot?.provider?.name || 'Medical Professional'}
                  </p>
                  <p className="text-sm user-app-muted">
                    Join the call to continue the consultation.
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={async () => {
                    try {
                      const response = await apiClient.joinCall(bookingId)
                      if (response.success && response.data) {
                        setIsCallActive(true)
                        setCallType('video')
                        toast.success('Joining video call...')
                      } else {
                        throw new Error(response.error?.message || 'Failed to join call')
                      }
                    } catch (error: any) {
                      toast.error(error.message || 'Failed to join call')
                    }
                  }}
                  className="user-app-btn-primary"
                >
                  <Video className="w-4 h-4 mr-2" />
                  Join Video Call
                </Button>
                <Button
                  onClick={async () => {
                    try {
                      const response = await apiClient.joinCall(bookingId)
                      if (response.success && response.data) {
                        setIsCallActive(true)
                        setCallType('audio')
                        toast.success('Joining audio call...')
                      } else {
                        throw new Error(response.error?.message || 'Failed to join call')
                      }
                    } catch (error: any) {
                      toast.error(error.message || 'Failed to join call')
                    }
                  }}
                  variant="outline"
                  className="border-[var(--ethio-deep-blue)]/50 text-[var(--ethio-lemon-dark)] hover:bg-emerald-50/90"
                >
                  <Phone className="w-4 h-4 mr-2" />
                  Join Audio Call
                </Button>
              </div>
            </div>
          </NeumorphicCard>
        )}
        
        <NeumorphicCard variant="raised" className="p-6">
          <div className="space-y-4">
            <div className="flex items-center gap-3 flex-wrap">
              <Badge className="bg-[var(--ethio-deep-blue)] text-white">
                {booking.slot?.type?.replace('_', ' ') || 'Consultation'}
              </Badge>
              <Badge className={
                booking.status === 'booked' || booking.status === 'confirmed' 
                  ? 'bg-green-500 text-white' 
                  : booking.status === 'canceled'
                  ? 'bg-red-500 text-white'
                  : 'bg-yellow-500 text-white'
              }>
                {booking.status}
              </Badge>
              {booking.slot?.status && (
                <Badge className="bg-gray-500 text-white">
                  Slot: {booking.slot.status}
                </Badge>
              )}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {booking.slot?.startAt && (
                <div className="flex items-center gap-2 user-app-muted">
                  <Clock className="w-4 h-4" />
                  <div>
                    <p className="text-xs user-app-muted">Start Time</p>
                    <p className="user-app-ink">{new Date(booking.slot.startAt).toLocaleString()}</p>
                  </div>
                </div>
              )}
              {booking.slot?.endAt && (
                <div className="flex items-center gap-2 user-app-muted">
                  <Clock className="w-4 h-4" />
                  <div>
                    <p className="text-xs user-app-muted">End Time</p>
                    <p className="user-app-ink">{new Date(booking.slot.endAt).toLocaleString()}</p>
                  </div>
                </div>
              )}
            </div>
            {booking.slot?.timezone && (
              <div className="user-app-muted">
                <p className="text-xs font-semibold mb-1">Timezone:</p>
                <p className="text-sm user-app-ink">{booking.slot.timezone}</p>
              </div>
            )}
            {booking.slot?.provider && (
              <div className="user-app-muted">
                <p className="text-sm font-semibold mb-1">Provider:</p>
                <p className="user-app-ink">{booking.slot.provider.name}</p>
              </div>
            )}
            {booking.canceledAt && (
              <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20">
                <p className="text-sm font-semibold text-red-500 mb-1">Canceled</p>
                <p className="text-xs user-app-muted">
                  {new Date(booking.canceledAt).toLocaleString()}
                </p>
                {booking.cancelReason && (
                  <p className="text-sm user-app-ink mt-2">{booking.cancelReason}</p>
                )}
              </div>
            )}
            {booking.userNote && (
              <div>
                <p className="text-sm font-semibold user-app-muted mb-2">Your Notes:</p>
                <p className="user-app-ink">{booking.userNote}</p>
              </div>
            )}
            <div className="pt-4 border-t border-slate-200/50 dark:border-slate-600/40 flex items-center justify-between">
              <p className="text-xs user-app-muted">
                Booking ID: {booking.id} | Created: {new Date(booking.createdAt).toLocaleString()}
              </p>
              {booking.status === 'booked' && callRoomId && !isCallActive && (
                <div className="flex gap-2">
                  <Button
                    onClick={async () => {
                      try {
                        const response = await apiClient.joinCall(bookingId)
                        if (response.success && response.data) {
                          setIsCallActive(true)
                          setCallType('video')
                          toast.success('Joining video call...')
                        } else {
                          throw new Error(response.error?.message || 'Failed to join call')
                        }
                      } catch (error: any) {
                        toast.error(error.message || 'Failed to join call')
                      }
                    }}
                    className="bg-gradient-to-r from-teal-500 to-emerald-600 text-white"
                  >
                    <Video className="w-4 h-4 mr-2" />
                    Join Video Call
                  </Button>
                  <Button
                    onClick={async () => {
                      try {
                        const response = await apiClient.joinCall(bookingId)
                        if (response.success && response.data) {
                          setIsCallActive(true)
                          setCallType('audio')
                          toast.success('Joining audio call...')
                        } else {
                          throw new Error(response.error?.message || 'Failed to join call')
                        }
                      } catch (error: any) {
                        toast.error(error.message || 'Failed to join call')
                      }
                    }}
                    variant="outline"
                    className="border-teal-500 text-teal-600 hover:bg-teal-50"
                  >
                    <Phone className="w-4 h-4 mr-2" />
                    Join Call
                  </Button>
                </div>
              )}
            </div>
          </div>
        </NeumorphicCard>
        
        {/* Call Components */}
        {isCallActive && callRoomId && callType === 'video' && (
          <VideoCall
            bookingId={bookingId}
            roomId={callRoomId}
            isInitiator={false}
            onEndCall={() => {
              setIsCallActive(false)
              setCallRoomId(null)
              setCallType(null)
              fetchBooking()
            }}
            otherUserName={booking.slot?.provider?.name || 'Medical Professional'}
          />
        )}
        {isCallActive && callRoomId && callType === 'audio' && (
          <AudioCall
            bookingId={bookingId}
            roomId={callRoomId}
            isInitiator={false}
            onEndCall={() => {
              setIsCallActive(false)
              setCallRoomId(null)
              setCallType(null)
              fetchBooking()
            }}
            otherUserName={booking.slot?.provider?.name || 'Medical Professional'}
          />
        )}

        {(() => {
          // Handle consult notes - could be single object or array
          const consultNotes = booking.consultNote 
            ? [booking.consultNote] 
            : (booking.consultNotes && Array.isArray(booking.consultNotes) ? booking.consultNotes : [])
          
          if (consultNotes.length === 0) return null
          
          return (
            <NeumorphicCard variant="raised" className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <FileText className="w-5 h-5 user-app-muted" />
                <h2 className="text-xl font-bold user-app-ink">Consult Notes</h2>
              </div>
              {consultNotes.map((note: any, idx: number) => {
                // Backend returns 'soap' not 'soapNotes'
                const soap = note.soap || note.soapNotes || {}
                
                return (
                  <div key={idx} className="mb-4 p-4 rounded-lg user-app-paper">
                    {(soap.subjective || soap.objective || soap.assessment || soap.plan) && (
                      <div className="space-y-2">
                        {soap.subjective && (
                          <div>
                            <p className="text-sm font-semibold user-app-muted">Subjective:</p>
                            <p className="user-app-ink">{soap.subjective}</p>
                          </div>
                        )}
                        {soap.objective && (
                          <div>
                            <p className="text-sm font-semibold user-app-muted">Objective:</p>
                            <p className="user-app-ink">{soap.objective}</p>
                          </div>
                        )}
                        {soap.assessment && (
                          <div>
                            <p className="text-sm font-semibold user-app-muted">Assessment:</p>
                            <p className="user-app-ink">{soap.assessment}</p>
                          </div>
                        )}
                        {soap.plan && (
                          <div>
                            <p className="text-sm font-semibold user-app-muted">Plan:</p>
                            <p className="user-app-ink">{soap.plan}</p>
                          </div>
                        )}
                      </div>
                    )}
                    {note.recommendations && Array.isArray(note.recommendations) && note.recommendations.length > 0 && (
                      <div className="mt-4">
                        <p className="text-sm font-semibold user-app-muted mb-2">Recommendations:</p>
                        <ul className="list-disc list-inside space-y-1">
                          {note.recommendations.map((rec: string, i: number) => (
                            <li key={i} className="user-app-ink">{rec}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )
              })}
            </NeumorphicCard>
          )
        })()}
      </div>
    </div>
  )
}

