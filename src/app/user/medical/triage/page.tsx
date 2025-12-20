'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/auth-context'
import { apiClient } from '@/lib/api-client'
import { NeumorphicCard } from '@/components/user/NeumorphicCard'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Stethoscope, ArrowLeft, ChevronDown, ChevronUp, Calendar, AlertTriangle } from 'lucide-react'

export default function TriageResultsPage() {
  const router = useRouter()
  const { user, isLoading: authLoading } = useAuth()
  const [loading, setLoading] = useState(true)
  const [triageRuns, setTriageRuns] = useState<any[]>([])
  const [pagination, setPagination] = useState<any>(null)
  const [riskFilter, setRiskFilter] = useState<string>('all')
  const [expandedId, setExpandedId] = useState<number | null>(null)

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login')
    } else if (user) {
      fetchTriageRuns()
    }
  }, [authLoading, user, router, riskFilter])

  async function fetchTriageRuns(page = 1) {
    try {
      setLoading(true)
      const params: any = { page, pageSize: 10 }
      if (riskFilter !== 'all') {
        params.riskLevel = riskFilter
      }
      const response = await apiClient.getTriageRuns(params)
      if (response.success && response.data) {
        setTriageRuns(response.data.items || [])
        setPagination(response.data.pagination)
      }
    } catch (error) {
      console.error('Error fetching triage runs:', error)
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

  const getDispositionColor = (disposition: string) => {
    switch (disposition) {
      case 'urgent_care': return 'bg-red-500 text-white'
      case 'book_consult': return 'bg-blue-500 text-white'
      case 'ok': return 'bg-green-500 text-white'
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

  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen bg-[var(--neumorphic-bg)]">
      {/* Header */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-teal-500/10 via-emerald-500/5 to-blue-500/10" />
        
        <div className="relative px-4 md:px-8 py-12">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center gap-4 mb-4">
              <Button
                onClick={() => router.push('/user/medical')}
                variant="ghost"
                size="sm"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-r from-teal-500 to-emerald-600 rounded-full flex items-center justify-center">
                  <Stethoscope className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-4xl md:text-5xl font-bold text-[var(--neumorphic-text)]">
                    Triage Results
                  </h1>
                  <p className="text-lg text-[var(--neumorphic-muted)]">
                    View your medical triage assessment history
                  </p>
                </div>
              </div>
              <Select value={riskFilter} onValueChange={setRiskFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Filter by risk" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Risk Levels</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="critical">Critical</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {triageRuns.length > 0 ? (
          <div className="space-y-4">
            {triageRuns.map((run) => (
              <NeumorphicCard key={run.id} variant="raised" className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <Badge className={getRiskColor(run.riskLevel)}>
                        {run.riskLevel?.toUpperCase()}
                      </Badge>
                      <Badge className={getDispositionColor(run.disposition)}>
                        {run.disposition?.replace('_', ' ')}
                      </Badge>
                      <span className="text-sm text-[var(--neumorphic-muted)] flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {new Date(run.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    {run.messages?.length > 0 && (
                      <p className="text-[var(--neumorphic-text)] mb-3">
                        {run.messages[0]}
                      </p>
                    )}
                    {expandedId === run.id && (
                      <div className="mt-4 space-y-3 p-4 rounded-lg bg-[var(--neumorphic-surface)]">
                        {run.messages?.length > 1 && (
                          <div>
                            <p className="text-sm font-semibold text-[var(--neumorphic-muted)] mb-2">All Messages:</p>
                            {run.messages.map((msg: string, idx: number) => (
                              <p key={idx} className="text-sm text-[var(--neumorphic-text)] mb-1">{msg}</p>
                            ))}
                          </div>
                        )}
                        {run.ruleHits?.length > 0 && (
                          <div>
                            <p className="text-sm font-semibold text-[var(--neumorphic-muted)] mb-2">Rule Hits:</p>
                            {run.ruleHits.map((hit: any, idx: number) => (
                              <div key={idx} className="text-sm text-[var(--neumorphic-text)] mb-1">
                                • {hit.ruleName} ({hit.severity})
                              </div>
                            ))}
                          </div>
                        )}
                        {run.disposition === 'book_consult' && (
                          <Button
                            onClick={() => router.push('/user/medical/consults/book')}
                            className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white"
                          >
                            Book Consult
                          </Button>
                        )}
                      </div>
                    )}
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setExpandedId(expandedId === run.id ? null : run.id)}
                  >
                    {expandedId === run.id ? (
                      <ChevronUp className="w-4 h-4" />
                    ) : (
                      <ChevronDown className="w-4 h-4" />
                    )}
                  </Button>
                </div>
              </NeumorphicCard>
            ))}
          </div>
        ) : (
          <NeumorphicCard variant="raised" className="p-12 text-center">
            <Stethoscope className="w-16 h-16 mx-auto mb-4 text-gray-400" />
            <h3 className="text-xl font-semibold text-[var(--neumorphic-text)] mb-2">
              No Triage Results Yet
            </h3>
            <p className="text-[var(--neumorphic-muted)] mb-4">
              Complete an intake form to receive your first triage assessment.
            </p>
            <Button
              onClick={() => router.push('/user/medical/intake')}
              className="bg-gradient-to-r from-teal-500 to-emerald-600 text-white"
            >
              Take Intake Form
            </Button>
          </NeumorphicCard>
        )}

        {/* Pagination */}
        {pagination && pagination.totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-8">
            <Button
              variant="outline"
              disabled={!pagination.hasPrev}
              onClick={() => fetchTriageRuns(pagination.page - 1)}
            >
              Previous
            </Button>
            <span className="text-sm text-[var(--neumorphic-muted)]">
              Page {pagination.page} of {pagination.totalPages}
            </span>
            <Button
              variant="outline"
              disabled={!pagination.hasNext}
              onClick={() => fetchTriageRuns(pagination.page + 1)}
            >
              Next
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}

