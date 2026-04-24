'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/auth-context'
import { apiClient } from '@/lib/api-client'
import { NeumorphicCard } from '@/components/user/NeumorphicCard'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { AlertTriangle, ArrowLeft, CheckCircle } from 'lucide-react'
import { toast } from 'sonner'

export default function HealthAlertsPage() {
  const router = useRouter()
  const { user, isLoading: authLoading } = useAuth()
  const [loading, setLoading] = useState(true)
  const [alerts, setAlerts] = useState<any[]>([])

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login')
    } else if (user) {
      fetchAlerts()
    }
  }, [authLoading, user, router])

  async function fetchAlerts() {
    try {
      setLoading(true)
      const response = await apiClient.getHealthAlerts({ page: 1, pageSize: 50 })
      if (response.success && response.data) {
        setAlerts(response.data.items || [])
      }
    } catch (error) {
      console.error('Error fetching alerts:', error)
    } finally {
      setLoading(false)
    }
  }

  async function handleAcknowledge(id: number) {
    try {
      const response = await apiClient.acknowledgeAlert(id)
      if (response.success) {
        toast.success('Alert acknowledged')
        fetchAlerts()
      }
    } catch (error) {
      toast.error('Failed to acknowledge alert')
    }
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-500 text-white'
      case 'high': return 'bg-orange-500 text-white'
      case 'medium': return 'bg-yellow-500 text-white'
      case 'low': return 'bg-blue-500 text-white'
      default: return 'bg-gray-500 text-white'
    }
  }

  if (authLoading || loading) {
    return (
      <div className="flex min-h-dvh min-h-screen items-center justify-center user-app-page">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-500 mx-auto"></div>
          <p className="mt-4 user-app-muted">Loading...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="min-h-dvh min-h-full user-app-page">
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-teal-500/10 via-emerald-500/5 to-blue-500/10" />
        
        <div className="relative px-4 md:px-8 py-12">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center gap-4">
              <Button
                onClick={() => router.push('/user/medical')}
                variant="ghost"
                size="sm"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-r from-red-500 to-orange-500 rounded-full flex items-center justify-center">
                  <AlertTriangle className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-4xl md:text-5xl font-bold user-app-ink">
                    Health Alerts
                  </h1>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {alerts.length > 0 ? (
          <div className="space-y-4">
            {alerts.map((alert) => (
              <NeumorphicCard key={alert.id} variant="raised" className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <Badge className={getSeverityColor(alert.severity)}>
                        {alert.severity?.toUpperCase()}
                      </Badge>
                      <Badge className={alert.status === 'active' ? 'bg-red-500' : 'bg-gray-500'}>
                        {alert.status}
                      </Badge>
                      <span className="text-sm user-app-muted">
                        {alert.metric}
                      </span>
                    </div>
                    <h3 className="text-lg font-semibold user-app-ink mb-2">
                      {alert.message}
                    </h3>
                    {alert.threshold && (
                      <p className="text-sm user-app-muted">
                        Threshold: {alert.threshold.value} {alert.threshold.unit}
                      </p>
                    )}
                  </div>
                  {alert.status === 'active' && (
                    <Button
                      onClick={() => handleAcknowledge(alert.id)}
                      variant="outline"
                      size="sm"
                    >
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Acknowledge
                    </Button>
                  )}
                </div>
              </NeumorphicCard>
            ))}
          </div>
        ) : (
          <NeumorphicCard variant="raised" className="p-12 text-center">
            <AlertTriangle className="w-16 h-16 mx-auto mb-4 text-gray-400" />
            <h3 className="text-xl font-semibold user-app-ink mb-2">
              No Active Alerts
            </h3>
            <p className="user-app-muted">
              You're all caught up! No health alerts at this time.
            </p>
          </NeumorphicCard>
        )}
      </div>
    </div>
  )
}

