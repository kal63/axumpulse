'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/auth-context'
import { apiClient } from '@/lib/api-client'
import { NeumorphicCard } from '@/components/user/NeumorphicCard'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { FileText, Plus, ArrowRight } from 'lucide-react'

export default function TriageRulesPage() {
  const router = useRouter()
  const { user, isLoading: authLoading } = useAuth()
  const [loading, setLoading] = useState(true)
  const [rules, setRules] = useState<any[]>([])
  const [statusFilter, setStatusFilter] = useState<string>('all')

  useEffect(() => {
    if (!authLoading && user) {
      fetchRules()
    }
  }, [authLoading, user, statusFilter])

  async function fetchRules() {
    try {
      setLoading(true)
      const params: any = { page: 1, pageSize: 50 }
      if (statusFilter !== 'all') {
        params.status = statusFilter
      }
      const response = await apiClient.getTriageRules(params)
      if (response.success && response.data) {
        setRules(response.data.items || [])
      }
    } catch (error) {
      console.error('Error fetching triage rules:', error)
    } finally {
      setLoading(false)
    }
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-500 text-white'
      case 'high': return 'bg-orange-500 text-white'
      case 'medium': return 'bg-yellow-500 text-white'
      case 'low': return 'bg-green-500 text-white'
      default: return 'bg-gray-500 text-white'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published': return 'bg-green-500 text-white'
      case 'draft': return 'bg-yellow-500 text-white'
      case 'retired': return 'bg-gray-500 text-white'
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
                  <FileText className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-4xl md:text-5xl font-bold text-[var(--neumorphic-text)]">
                    Triage Rules
                  </h1>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="published">Published</SelectItem>
                    <SelectItem value="retired">Retired</SelectItem>
                  </SelectContent>
                </Select>
                <Button
                  onClick={() => router.push('/medical/triage/rules/new')}
                  className="bg-gradient-to-r from-teal-500 to-emerald-600 text-white"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Create Rule
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {rules.length > 0 ? (
          <div className="space-y-4">
            {rules.map((rule) => (
              <NeumorphicCard key={rule.id} variant="raised" className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <h3 className="text-xl font-bold text-[var(--neumorphic-text)]">
                        {rule.name}
                      </h3>
                      <Badge className={getSeverityColor(rule.severity)}>
                        {rule.severity}
                      </Badge>
                      <Badge className={getStatusColor(rule.status)}>
                        {rule.status}
                      </Badge>
                      <span className="text-sm text-[var(--neumorphic-muted)]">
                        v{rule.version}
                      </span>
                    </div>
                    {rule.publishedAt && (
                      <p className="text-sm text-[var(--neumorphic-muted)]">
                        Published: {new Date(rule.publishedAt).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                  <Button
                    onClick={() => router.push(`/medical/triage/rules/${rule.id}`)}
                    variant="outline"
                  >
                    View/Edit <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </NeumorphicCard>
            ))}
          </div>
        ) : (
          <NeumorphicCard variant="raised" className="p-12 text-center">
            <FileText className="w-16 h-16 mx-auto mb-4 text-gray-400" />
            <h3 className="text-xl font-semibold text-[var(--neumorphic-text)] mb-2">
              No Triage Rules Yet
            </h3>
            <p className="text-[var(--neumorphic-muted)] mb-4">
              Create your first triage rule to get started.
            </p>
            <Button
              onClick={() => router.push('/medical/triage/rules/new')}
              className="bg-gradient-to-r from-teal-500 to-emerald-600 text-white"
            >
              <Plus className="w-4 h-4 mr-2" />
              Create Rule
            </Button>
          </NeumorphicCard>
        )}
      </div>
    </div>
  )
}

