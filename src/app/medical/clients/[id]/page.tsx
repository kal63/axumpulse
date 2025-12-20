'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { useAuth } from '@/contexts/auth-context'
import { apiClient } from '@/lib/api-client'
import { NeumorphicCard } from '@/components/user/NeumorphicCard'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, User, Activity, Calendar, AlertTriangle } from 'lucide-react'

export default function ClientDetailPage() {
  const router = useRouter()
  const params = useParams()
  const clientId = parseInt(params.id as string)
  const { user, isLoading: authLoading } = useAuth()
  const [loading, setLoading] = useState(true)
  const [client, setClient] = useState<any>(null)

  useEffect(() => {
    if (!authLoading && user && clientId) {
      fetchClient()
    }
  }, [authLoading, user, clientId])

  async function fetchClient() {
    try {
      setLoading(true)
      const response = await apiClient.getMedicalClient(clientId)
      if (response.success && response.data) {
        setClient(response.data)
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
                  {client.user?.name || `Client ${clientId}`}
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
              {client.conditions?.length > 0 && (
                <div>
                  <p className="text-sm font-semibold text-[var(--neumorphic-muted)] mb-2">Conditions:</p>
                  <div className="flex flex-wrap gap-2">
                    {client.conditions.map((cond: string, idx: number) => (
                      <Badge key={idx} className="bg-teal-500 text-white">{cond}</Badge>
                    ))}
                  </div>
                </div>
              )}
              {client.medications?.length > 0 && (
                <div>
                  <p className="text-sm font-semibold text-[var(--neumorphic-muted)] mb-2">Medications:</p>
                  <div className="space-y-1">
                    {client.medications.map((med: any, idx: number) => (
                      <div key={idx} className="text-sm text-[var(--neumorphic-text)]">
                        {med.name} {med.dosage && `(${med.dosage})`} {med.frequency && `- ${med.frequency}`}
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {client.allergies?.length > 0 && (
                <div>
                  <p className="text-sm font-semibold text-[var(--neumorphic-muted)] mb-2">Allergies:</p>
                  <div className="flex flex-wrap gap-2">
                    {client.allergies.map((allergy: string, idx: number) => (
                      <Badge key={idx} className="bg-red-500 text-white">{allergy}</Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </NeumorphicCard>

          <NeumorphicCard variant="raised" className="p-6">
            <h2 className="text-xl font-bold text-[var(--neumorphic-text)] mb-4">Recent Activity</h2>
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm text-[var(--neumorphic-muted)]">
                <Activity className="w-4 h-4" />
                <span>Health data logged</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-[var(--neumorphic-muted)]">
                <Calendar className="w-4 h-4" />
                <span>Consultations scheduled</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-[var(--neumorphic-muted)]">
                <AlertTriangle className="w-4 h-4" />
                <span>Active alerts</span>
              </div>
            </div>
          </NeumorphicCard>
        </div>
      </div>
    </div>
  )
}

