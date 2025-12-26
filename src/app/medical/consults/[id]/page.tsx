'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { useAuth } from '@/contexts/auth-context'
import { apiClient } from '@/lib/api-client'
import { NeumorphicCard } from '@/components/user/NeumorphicCard'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import { ArrowLeft, Calendar, FileText, Save, X, Phone } from 'lucide-react'
import { toast } from 'sonner'
import { VideoCall } from '@/components/medical/VideoCall'

export default function ConsultSessionPage() {
  const router = useRouter()
  const params = useParams()
  const bookingId = parseInt(params.id as string)
  const { user, isLoading: authLoading } = useAuth()
  const [loading, setLoading] = useState(true)
  const [booking, setBooking] = useState<any>(null)
  const [notes, setNotes] = useState({
    subjective: '',
    objective: '',
    assessment: '',
    plan: '',
    diagnoses: [] as string[],
    recommendations: [] as string[],
    shareWithUser: false
  })
  const [newDiagnosis, setNewDiagnosis] = useState('')
  const [newRecommendation, setNewRecommendation] = useState('')
  const [saving, setSaving] = useState(false)
  const [isCallActive, setIsCallActive] = useState(false)
  const [callRoomId, setCallRoomId] = useState<string | null>(null)

  useEffect(() => {
    if (!authLoading && user && bookingId) {
      fetchBooking()
    }
  }, [authLoading, user, bookingId])

  // Debug: Log booking state whenever it changes
  useEffect(() => {
    if (booking) {
      console.log('Booking state:', booking)
      console.log('Booking.userId:', booking.userId)
      console.log('Booking.status:', booking.status)
      console.log('Booking.slot:', booking.slot)
    }
  }, [booking])

  async function fetchBooking() {
    try {
      setLoading(true)
      const response = await apiClient.getMedicalConsult(bookingId)
      console.log('Full response:', response)
      if (response.success && response.data) {
        // Backend returns { booking, medicalProfile }
        const bookingData = (response.data as any).booking || response.data
        console.log('Booking data:', bookingData)
        
        // Separate user note (string) from consult note (object)
        // The backend includes ConsultNote as 'note', which overrides the booking.note string field
        const consultNote = bookingData.note && typeof bookingData.note === 'object' ? bookingData.note : null
        const userNote = bookingData.note && typeof bookingData.note === 'string' ? bookingData.note : null
        
        // Remove the note object from bookingData to avoid rendering issues
        const { note, ...bookingWithoutNote } = bookingData
        setBooking({ ...bookingWithoutNote, userNote })
        
        // Get consult notes - check if note is included or needs separate fetch
        if (consultNote) {
          // Note is included in the booking response
          const note = Array.isArray(consultNote) ? consultNote[0] : consultNote
          if (note && typeof note === 'object' && !Array.isArray(note)) {
            // Backend returns 'soap' not 'soapNotes'
            const soap = (note as any).soap || (note as any).soapNotes || {}
            setNotes({
              subjective: soap.subjective || '',
              objective: soap.objective || '',
              assessment: soap.assessment || '',
              plan: soap.plan || '',
              diagnoses: (note as any).diagnoses || [],
              recommendations: (note as any).recommendations || [],
              shareWithUser: (note as any).shareWithUser || (note as any).summaryShared || false
            })
          }
        } else {
          // Try to fetch consult notes separately
          try {
            const notesResponse = await apiClient.getConsultNotes(bookingId)
            if (notesResponse.success && notesResponse.data) {
              const note = Array.isArray(notesResponse.data) ? notesResponse.data[0] : notesResponse.data
              if (note && typeof note === 'object' && !Array.isArray(note)) {
                // Backend returns 'soap' not 'soapNotes'
                const soap = (note as any).soap || (note as any).soapNotes || {}
                setNotes({
                  subjective: soap.subjective || '',
                  objective: soap.objective || '',
                  assessment: soap.assessment || '',
                  plan: soap.plan || '',
                  diagnoses: (note as any).diagnoses || [],
                  recommendations: (note as any).recommendations || [],
                  shareWithUser: (note as any).shareWithUser || (note as any).summaryShared || false
                })
              }
            }
          } catch (noteError) {
            console.log('No consult notes found or error fetching:', noteError)
          }
        }
      }
    } catch (error) {
      console.error('Error fetching booking:', error)
    } finally {
      setLoading(false)
    }
  }

  async function handleSaveNotes() {
    try {
      setSaving(true)
      const response = await apiClient.createConsultNote(bookingId, {
        soapNotes: {
          subjective: notes.subjective,
          objective: notes.objective,
          assessment: notes.assessment,
          plan: notes.plan
        },
        diagnoses: notes.diagnoses,
        recommendations: notes.recommendations,
        shareWithUser: notes.shareWithUser
      })
      if (response.success) {
        toast.success('Consult notes saved successfully')
        fetchBooking()
      } else {
        throw new Error(response.error?.message || 'Failed to save notes')
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to save consult notes')
    } finally {
      setSaving(false)
    }
  }

  const addDiagnosis = () => {
    if (newDiagnosis.trim() && !notes.diagnoses.includes(newDiagnosis.trim())) {
      setNotes({ ...notes, diagnoses: [...notes.diagnoses, newDiagnosis.trim()] })
      setNewDiagnosis('')
    }
  }

  const removeDiagnosis = (idx: number) => {
    setNotes({ ...notes, diagnoses: notes.diagnoses.filter((_, i) => i !== idx) })
  }

  const addRecommendation = () => {
    if (newRecommendation.trim() && !notes.recommendations.includes(newRecommendation.trim())) {
      setNotes({ ...notes, recommendations: [...notes.recommendations, newRecommendation.trim()] })
      setNewRecommendation('')
    }
  }

  const removeRecommendation = (idx: number) => {
    setNotes({ ...notes, recommendations: notes.recommendations.filter((_, i) => i !== idx) })
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

  if (!booking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--neumorphic-bg)]">
        <div className="text-center">
          <p className="text-[var(--neumorphic-muted)]">No booking data available</p>
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
            <div className="flex items-center gap-4 mb-4">
              <Button
                onClick={() => router.push('/medical/consults')}
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
                  Consult Session
                </h1>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
        <NeumorphicCard variant="raised" className="p-6">
          <h2 className="text-xl font-bold text-[var(--neumorphic-text)] mb-4">Booking Information</h2>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-[var(--neumorphic-muted)] mb-1">User Name</p>
                <p className="text-[var(--neumorphic-text)] font-semibold">
                  {booking.userId !== undefined && booking.userId !== null ? String(booking.user.name) : 'N/A'}
                </p>
              </div>
              <div>
                <p className="text-sm text-[var(--neumorphic-muted)] mb-1">Booking Status</p>
                <p className="text-[var(--neumorphic-text)] font-semibold">
                  {booking.status !== undefined && booking.status !== null ? String(booking.status) : 'N/A'}
                </p>
              </div>
              <div>
                <p className="text-sm text-[var(--neumorphic-muted)] mb-1">Consult Type</p>
                <p className="text-[var(--neumorphic-text)] font-semibold">
                  {booking.slot?.type ? booking.slot.type.replace('_', ' ') : 'Consultation'}
                </p>
              </div>
              <div>
                <p className="text-sm text-[var(--neumorphic-muted)] mb-1">Slot Status</p>
                <p className="text-[var(--neumorphic-text)] font-semibold">
                  {booking.slot?.status ? String(booking.slot.status) : 'N/A'}
                </p>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {booking.slot?.startAt && (
                <div>
                  <p className="text-sm text-[var(--neumorphic-muted)] mb-1">Start Time</p>
                  <p className="text-[var(--neumorphic-text)] font-semibold">
                    {new Date(booking.slot.startAt).toLocaleString()}
                  </p>
                </div>
              )}
              {booking.slot?.endAt && (
                <div>
                  <p className="text-sm text-[var(--neumorphic-muted)] mb-1">End Time</p>
                  <p className="text-[var(--neumorphic-text)] font-semibold">
                    {new Date(booking.slot.endAt).toLocaleString()}
                  </p>
                </div>
              )}
            </div>
            {booking.slot?.timezone && (
              <div>
                <p className="text-sm text-[var(--neumorphic-muted)] mb-1">Timezone</p>
                <p className="text-[var(--neumorphic-text)]">{booking.slot.timezone}</p>
              </div>
            )}
            {booking.slot?.provider && (
              <div>
                <p className="text-sm text-[var(--neumorphic-muted)] mb-1">Provider</p>
                <p className="text-[var(--neumorphic-text)] font-semibold">{booking.slot.provider.name}</p>
              </div>
            )}
            {booking.canceledAt && (
              <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20">
                <p className="text-sm font-semibold text-red-500 mb-1">Canceled</p>
                <p className="text-xs text-[var(--neumorphic-muted)]">
                  {new Date(booking.canceledAt).toLocaleString()}
                </p>
                {booking.cancelReason && (
                  <p className="text-sm text-[var(--neumorphic-text)] mt-2">{booking.cancelReason}</p>
                )}
              </div>
            )}
            {booking.userNote && (
              <div className="p-3 rounded-lg bg-[var(--neumorphic-surface)]">
                <p className="text-sm font-semibold text-[var(--neumorphic-muted)] mb-2">User Notes:</p>
                <p className="text-sm text-[var(--neumorphic-text)]">{booking.userNote}</p>
              </div>
            )}
            <div className="pt-4 border-t border-[var(--neumorphic-muted)]/20">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-[var(--neumorphic-muted)]">
                <div>
                  <p>Booking ID: {booking.id}</p>
                  <p>Slot ID: {booking.slotId}</p>
                </div>
                <div>
                  <p>Created: {new Date(booking.createdAt).toLocaleString()}</p>
                  <p>Updated: {new Date(booking.updatedAt).toLocaleString()}</p>
                </div>
              </div>
            </div>
          </div>
        </NeumorphicCard>

        <NeumorphicCard variant="raised" className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-[var(--neumorphic-text)] flex items-center gap-2">
              <FileText className="w-5 h-5" />
              SOAP Notes
            </h2>
          </div>
          <div className="space-y-4">
            <div>
              <Label>Subjective</Label>
              <Textarea
                value={notes.subjective}
                onChange={(e) => setNotes({ ...notes, subjective: e.target.value })}
                placeholder="Patient's description of symptoms..."
                rows={4}
              />
            </div>
            <div>
              <Label>Objective</Label>
              <Textarea
                value={notes.objective}
                onChange={(e) => setNotes({ ...notes, objective: e.target.value })}
                placeholder="Observable findings, measurements..."
                rows={4}
              />
            </div>
            <div>
              <Label>Assessment</Label>
              <Textarea
                value={notes.assessment}
                onChange={(e) => setNotes({ ...notes, assessment: e.target.value })}
                placeholder="Clinical assessment, diagnosis..."
                rows={4}
              />
            </div>
            <div>
              <Label>Plan</Label>
              <Textarea
                value={notes.plan}
                onChange={(e) => setNotes({ ...notes, plan: e.target.value })}
                placeholder="Treatment plan, follow-up recommendations..."
                rows={4}
              />
            </div>
          </div>
        </NeumorphicCard>

        <NeumorphicCard variant="raised" className="p-6">
          <h2 className="text-xl font-bold text-[var(--neumorphic-text)] mb-4">Diagnoses</h2>
          <div className="flex gap-2 mb-4">
            <Input
              value={newDiagnosis}
              onChange={(e) => setNewDiagnosis(e.target.value)}
              placeholder="Enter diagnosis"
              onKeyPress={(e) => e.key === 'Enter' && addDiagnosis()}
            />
            <Button onClick={addDiagnosis} className="bg-gradient-to-r from-teal-500 to-emerald-600 text-white">
              Add
            </Button>
          </div>
          <div className="space-y-2">
            {notes.diagnoses.map((diag, idx) => (
              <div key={idx} className="flex items-center justify-between p-2 rounded-lg bg-[var(--neumorphic-surface)]">
                <span className="text-[var(--neumorphic-text)]">{diag}</span>
                <Button
                  onClick={() => removeDiagnosis(idx)}
                  variant="ghost"
                  size="sm"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>
        </NeumorphicCard>

        <NeumorphicCard variant="raised" className="p-6">
          <h2 className="text-xl font-bold text-[var(--neumorphic-text)] mb-4">Recommendations</h2>
          <div className="flex gap-2 mb-4">
            <Input
              value={newRecommendation}
              onChange={(e) => setNewRecommendation(e.target.value)}
              placeholder="Enter recommendation"
              onKeyPress={(e) => e.key === 'Enter' && addRecommendation()}
            />
            <Button onClick={addRecommendation} className="bg-gradient-to-r from-teal-500 to-emerald-600 text-white">
              Add
            </Button>
          </div>
          <div className="space-y-2">
            {notes.recommendations.map((rec, idx) => (
              <div key={idx} className="flex items-center justify-between p-2 rounded-lg bg-[var(--neumorphic-surface)]">
                <span className="text-[var(--neumorphic-text)]">{rec}</span>
                <Button
                  onClick={() => removeRecommendation(idx)}
                  variant="ghost"
                  size="sm"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>
        </NeumorphicCard>

        <NeumorphicCard variant="raised" className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <Label>Share Summary with User</Label>
              <p className="text-sm text-[var(--neumorphic-muted)]">
                Allow user to view consult notes and recommendations
              </p>
            </div>
            <Switch
              checked={notes.shareWithUser}
              onCheckedChange={(checked) => setNotes({ ...notes, shareWithUser: checked })}
            />
          </div>
        </NeumorphicCard>

        <div className="flex gap-4">
          <Button
            onClick={handleSaveNotes}
            disabled={saving}
            className="flex-1 bg-gradient-to-r from-teal-500 to-emerald-600 text-white"
          >
            <Save className="w-4 h-4 mr-2" />
            {saving ? 'Saving...' : 'Save Consult Notes'}
          </Button>
          {booking.status === 'booked' && !isCallActive && (
            <>
              <Button
                onClick={async () => {
                  try {
                    const response = await apiClient.startCall(bookingId)
                    if (response.success && response.data) {
                      setCallRoomId(response.data.roomId)
                      setIsCallActive(true)
                      toast.success('Call started. Waiting for user to join...')
                    } else {
                      throw new Error(response.error?.message || 'Failed to start call')
                    }
                  } catch (error: any) {
                    toast.error(error.message || 'Failed to start call')
                  }
                }}
                className="bg-gradient-to-r from-teal-500 to-emerald-600 text-white"
              >
                <Phone className="w-4 h-4 mr-2" />
                Start Call
              </Button>
              <Button
                onClick={async () => {
                  try {
                    const response = await apiClient.completeConsult(bookingId)
                    if (response.success) {
                      toast.success('Consult marked as completed')
                      fetchBooking()
                    } else {
                      throw new Error(response.error?.message || 'Failed to complete consult')
                    }
                  } catch (error: any) {
                    toast.error(error.message || 'Failed to mark consult as completed')
                  }
                }}
                variant="outline"
                className="border-green-500 text-green-600 hover:bg-green-50"
              >
                Mark as Completed
              </Button>
            </>
          )}
        </div>
        
        {/* Video Call Component */}
        {isCallActive && callRoomId && (
          <VideoCall
            bookingId={bookingId}
            roomId={callRoomId}
            isInitiator={true}
            onEndCall={() => {
              setIsCallActive(false)
              setCallRoomId(null)
              fetchBooking()
            }}
            otherUserName={booking.user?.name || 'Patient'}
          />
        )}
      </div>
    </div>
  )
}

