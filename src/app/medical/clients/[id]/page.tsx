'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { useAuth } from '@/contexts/auth-context'
import { apiClient } from '@/lib/api-client'
import { NeumorphicCard } from '@/components/user/NeumorphicCard'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, User, Activity, Calendar, AlertTriangle, FileText, Eye } from 'lucide-react'

export default function ClientDetailPage() {
  const router = useRouter()
  const params = useParams()
  const clientId = parseInt(params.id as string)
  const { user, isLoading: authLoading } = useAuth()
  const [loading, setLoading] = useState(true)
  const [client, setClient] = useState<any>(null)
  const [healthData, setHealthData] = useState<any[]>([])
  const [alerts, setAlerts] = useState<any[]>([])
  const [consults, setConsults] = useState<any[]>([])
  const [intakeResponses, setIntakeResponses] = useState<any[]>([])

  useEffect(() => {
    if (!authLoading && user && clientId) {
      fetchClient()
    }
  }, [authLoading, user, clientId])

  async function fetchClient() {
    try {
      setLoading(true)
      const response = await apiClient.getMedicalClient(clientId)
      console.log('Full response:', response)
      if (response.success && response.data) {
        // Backend returns { medicalProfile, healthDataRollups, recentAlerts, recentConsults, intakeResponses }
        const data = response.data as any
        console.log('Client data:', data)
        setClient(data.medicalProfile || data)
        setHealthData(data.healthDataRollups || [])
        setAlerts(data.recentAlerts || [])
        setConsults(data.recentConsults || [])
        setIntakeResponses(data.intakeResponses || [])
      }
    } catch (error) {
      console.error('Error fetching client:', error)
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

  if (!user || !client) {
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
                onClick={() => router.push('/medical/clients')}
                variant="ghost"
                size="sm"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-r from-teal-500 to-emerald-600 rounded-full flex items-center justify-center">
                <User className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-4xl md:text-5xl font-bold text-[var(--neumorphic-text)]">
                  {client?.user?.name || client?.name || `Client ${clientId}`}
                </h1>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8 space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <NeumorphicCard variant="raised" className="p-6">
            <h2 className="text-xl font-bold text-[var(--neumorphic-text)] mb-4">Medical Profile</h2>
            <div className="space-y-4">
              {client?.conditions && Array.isArray(client.conditions) && client.conditions.length > 0 && (
                <div>
                  <p className="text-sm font-semibold text-[var(--neumorphic-muted)] mb-2">Conditions:</p>
                  <div className="flex flex-wrap gap-2">
                    {client.conditions.map((cond: string, idx: number) => (
                      <Badge key={idx} className="bg-teal-500 text-white">{cond}</Badge>
                    ))}
                  </div>
                </div>
              )}
              {client?.medications && Array.isArray(client.medications) && client.medications.length > 0 && (
                <div>
                  <p className="text-sm font-semibold text-[var(--neumorphic-muted)] mb-2">Medications:</p>
                  <div className="space-y-1">
                    {client.medications.map((med: any, idx: number) => (
                      <div key={idx} className="text-sm text-[var(--neumorphic-text)]">
                        {typeof med === 'string' ? med : med.name} {med.dosage && `(${med.dosage})`} {med.frequency && `- ${med.frequency}`}
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {client?.allergies && Array.isArray(client.allergies) && client.allergies.length > 0 && (
                <div>
                  <p className="text-sm font-semibold text-[var(--neumorphic-muted)] mb-2">Allergies:</p>
                  <div className="flex flex-wrap gap-2">
                    {client.allergies.map((allergy: string, idx: number) => (
                      <Badge key={idx} className="bg-red-500 text-white">{allergy}</Badge>
                    ))}
                  </div>
                </div>
              )}
              {(!client?.conditions || client.conditions.length === 0) && 
               (!client?.medications || client.medications.length === 0) && 
               (!client?.allergies || client.allergies.length === 0) && (
                <p className="text-sm text-[var(--neumorphic-muted)]">No medical information available</p>
              )}
            </div>
          </NeumorphicCard>

          <NeumorphicCard variant="raised" className="p-6">
            <h2 className="text-xl font-bold text-[var(--neumorphic-text)] mb-4">Recent Activity</h2>
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm text-[var(--neumorphic-muted)]">
                <Activity className="w-4 h-4" />
                <span>Health data logged: {healthData.length} records</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-[var(--neumorphic-muted)]">
                <Calendar className="w-4 h-4" />
                <span>Consultations: {consults.length} recent</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-[var(--neumorphic-muted)]">
                <AlertTriangle className="w-4 h-4" />
                <span>Active alerts: {alerts.length}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-[var(--neumorphic-muted)]">
                <FileText className="w-4 h-4" />
                <span>Intake forms: {intakeResponses.length} submitted</span>
              </div>
            </div>
          </NeumorphicCard>
        </div>

        {/* Intake Form Submissions */}
        {intakeResponses.length > 0 && (
          <NeumorphicCard variant="raised" className="p-6">
            <h2 className="text-xl font-bold text-[var(--neumorphic-text)] mb-4">Intake Form Submissions</h2>
            <div className="space-y-4">
              {intakeResponses.map((response: any) => {
                const form = response.form
                const formSchema = form?.schema ? (typeof form.schema === 'string' ? JSON.parse(form.schema) : form.schema) : null
                const formTitle = formSchema?.title || `Form v${form?.version || 'N/A'}`
                
                return (
                  <div key={response.id} className="p-4 rounded-lg bg-[var(--neumorphic-surface)] border border-[var(--neumorphic-muted)]/20">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="font-semibold text-[var(--neumorphic-text)]">{formTitle}</h3>
                        <p className="text-sm text-[var(--neumorphic-muted)]">
                          Submitted: {new Date(response.createdAt).toLocaleString()}
                        </p>
                      </div>
                      <Badge className="bg-blue-500 text-white">
                        {form?.status || 'N/A'}
                      </Badge>
                    </div>
                    
                    <div className="mt-3 space-y-2">
                      <p className="text-sm font-semibold text-[var(--neumorphic-muted)] mb-2">Answers:</p>
                      <div className="bg-[var(--neumorphic-bg)] p-3 rounded border border-[var(--neumorphic-muted)]/10">
                        <pre className="text-xs text-[var(--neumorphic-text)] overflow-auto max-h-48">
                          {JSON.stringify(response.answers, null, 2)}
                        </pre>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </NeumorphicCard>
        )}
      </div>
    </div>
  )
}

