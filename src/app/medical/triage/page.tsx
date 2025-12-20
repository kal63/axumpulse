'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/auth-context'
import { apiClient } from '@/lib/api-client'
import { NeumorphicCard } from '@/components/user/NeumorphicCard'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ClipboardList, ArrowRight } from 'lucide-react'

export default function TriageQueuePage() {
  const router = useRouter()
  const { user, isLoading: authLoading } = useAuth()
  const [loading, setLoading] = useState(true)
  const [triageRuns, setTriageRuns] = useState<any[]>([])
  const [riskFilter, setRiskFilter] = useState<string>('all')

  useEffect(() => {
    if (!authLoading && user) {
      fetchTriageQueue()
    }
  }, [authLoading, user, riskFilter])

  async function fetchTriageQueue() {
    try {
      setLoading(true)
      const params: any = { page: 1, pageSize: 50 }
      if (riskFilter !== 'all') {
        params.riskLevel = riskFilter
      }
      const response = await apiClient.getTriageQueue(params)
      if (response.success && response.data) {
        setTriageRuns(response.data.items || [])
      }
    } catch (error) {
      console.error('Error fetching triage queue:', error)
    } finally {
      setLoading(false)
    }
  }

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'critical': return 'bg-red-500 text-white'
      case 'high': return 'bg-orange-500 text-white'
      case 'medium': return 'bg-yellow-500 text-white'
      case 'low': return 'bg-green-500 text-white'
      default: return 'bg-gray-500 text-white'
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
                  <ClipboardList className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-4xl md:text-5xl font-bold text-[var(--neumorphic-text)]">
                    Triage Queue
                  </h1>
                </div>
              </div>
              <Select value={riskFilter} onValueChange={setRiskFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Filter by risk" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Risk Levels</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="critical">Critical</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {triageRuns.length > 0 ? (
          <div className="space-y-4">
            {triageRuns.map((run) => (
              <NeumorphicCard key={run.id} variant="raised" className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <Badge className={getRiskColor(run.riskLevel)}>
                        {run.riskLevel?.toUpperCase()}
                      </Badge>
                      <Badge className="bg-blue-500 text-white">
                        {run.disposition?.replace('_', ' ')}
                      </Badge>
                      <span className="text-sm text-[var(--neumorphic-muted)]">
                        User ID: {run.userId}
                      </span>
                    </div>
                    {run.messages?.length > 0 && (
                      <p className="text-[var(--neumorphic-text)] mb-2">
                        {run.messages[0]}
                      </p>
                    )}
                  </div>
                  <Button
                    onClick={() => router.push(`/medical/triage/${run.id}`)}
                    variant="outline"
                  >
                    Review <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </NeumorphicCard>
            ))}
          </div>
        ) : (
          <NeumorphicCard variant="raised" className="p-12 text-center">
            <ClipboardList className="w-16 h-16 mx-auto mb-4 text-gray-400" />
            <h3 className="text-xl font-semibold text-[var(--neumorphic-text)] mb-2">
              No Triage Runs in Queue
            </h3>
            <p className="text-[var(--neumorphic-muted)]">
              All triage assessments have been reviewed.
            </p>
          </NeumorphicCard>
        )}
      </div>
    </div>
  )
}

