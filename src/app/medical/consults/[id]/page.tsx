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
import { ArrowLeft, Calendar, FileText, Save, X } from 'lucide-react'
import { toast } from 'sonner'

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

  useEffect(() => {
    if (!authLoading && user && bookingId) {
      fetchBooking()
    }
  }, [authLoading, user, bookingId])

  async function fetchBooking() {
    try {
      setLoading(true)
      const response = await apiClient.getMedicalConsult(bookingId)
      if (response.success && response.data) {
        setBooking(response.data)
        if (response.data.consultNotes && response.data.consultNotes.length > 0) {
          const note = response.data.consultNotes[0]
          setNotes({
            subjective: note.soapNotes?.subjective || '',
            objective: note.soapNotes?.objective || '',
            assessment: note.soapNotes?.assessment || '',
            plan: note.soapNotes?.plan || '',
            diagnoses: note.diagnoses || [],
            recommendations: note.recommendations || [],
            shareWithUser: note.shareWithUser || false
          })
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
          <div className="space-y-2">
            <p className="text-[var(--neumorphic-text)]">
              <span className="font-semibold">User ID:</span> {booking.userId}
            </p>
            <p className="text-[var(--neumorphic-text)]">
              <span className="font-semibold">Type:</span> {booking.consultType?.replace('_', ' ')}
            </p>
            <p className="text-[var(--neumorphic-text)]">
              <span className="font-semibold">Time:</span> {new Date(booking.slot?.startTime).toLocaleString()}
            </p>
            {booking.userNotes && (
              <div className="mt-4 p-3 rounded-lg bg-[var(--neumorphic-surface)]">
                <p className="text-sm font-semibold text-[var(--neumorphic-muted)] mb-1">User Notes:</p>
                <p className="text-sm text-[var(--neumorphic-text)]">{booking.userNotes}</p>
              </div>
            )}
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

        <Button
          onClick={handleSaveNotes}
          disabled={saving}
          className="w-full bg-gradient-to-r from-teal-500 to-emerald-600 text-white"
        >
          <Save className="w-4 h-4 mr-2" />
          {saving ? 'Saving...' : 'Save Consult Notes'}
        </Button>
      </div>
    </div>
  )
}

