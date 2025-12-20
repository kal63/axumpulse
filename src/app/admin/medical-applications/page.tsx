'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/auth-context'
import { apiClient } from '@/lib/api-client'
import { NeumorphicCard } from '@/components/user/NeumorphicCard'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { ClipboardList, ArrowRight, Search, CheckCircle, XCircle, Clock } from 'lucide-react'

export default function MedicalApplicationsPage() {
  const router = useRouter()
  const { user, isLoading: authLoading } = useAuth()
  const [loading, setLoading] = useState(true)
  const [applications, setApplications] = useState<any[]>([])
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [search, setSearch] = useState('')

  useEffect(() => {
    if (!authLoading && user) {
      fetchApplications()
    }
  }, [authLoading, user, statusFilter, search])

  async function fetchApplications() {
    try {
      setLoading(true)
      const params: any = { page: 1, pageSize: 50 }
      if (statusFilter !== 'all') {
        params.status = statusFilter
      }
      if (search.trim()) {
        params.q = search.trim()
      }
      const response = await apiClient.getMedicalApplications(params)
      if (response.success && response.data) {
        setApplications(response.data.items || [])
      }
    } catch (error) {
      console.error('Error fetching applications:', error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <Badge className="bg-green-500 text-white"><CheckCircle className="w-3 h-3 mr-1" />Approved</Badge>
      case 'rejected':
        return <Badge className="bg-red-500 text-white"><XCircle className="w-3 h-3 mr-1" />Rejected</Badge>
      case 'under_review':
        return <Badge className="bg-blue-500 text-white"><Clock className="w-3 h-3 mr-1" />Under Review</Badge>
      case 'pending':
        return <Badge className="bg-yellow-500 text-white"><Clock className="w-3 h-3 mr-1" />Pending</Badge>
      default:
        return <Badge>{status}</Badge>
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
                    Medical Applications
                  </h1>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <Input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search by name or email..."
                  className="w-64"
                />
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="under_review">Under Review</SelectItem>
                    <SelectItem value="approved">Approved</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {applications.length > 0 ? (
          <div className="space-y-4">
            {applications.map((app) => (
              <NeumorphicCard
                key={app.id}
                variant="raised"
                className="p-6 cursor-pointer"
                onClick={() => router.push(`/admin/medical-applications/${app.id}`)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      {getStatusBadge(app.status)}
                      <h3 className="text-lg font-semibold text-[var(--neumorphic-text)]">
                        {app.user?.name || `User ${app.userId}`}
                      </h3>
                    </div>
                    <div className="space-y-1 text-sm text-[var(--neumorphic-muted)]">
                      <p>Type: {app.professionalType?.replace('_', ' ')}</p>
                      {app.specialties?.length > 0 && (
                        <p>Specialties: {app.specialties.join(', ')}</p>
                      )}
                      <p>Submitted: {new Date(app.submittedAt).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <Button variant="outline">
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
              No Medical Applications
            </h3>
            <p className="text-[var(--neumorphic-muted)]">
              {search ? 'No applications match your search.' : 'No medical professional applications yet.'}
            </p>
          </NeumorphicCard>
        )}
      </div>
    </div>
  )
}

