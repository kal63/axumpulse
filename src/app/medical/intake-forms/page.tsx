'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/auth-context'
import { apiClient } from '@/lib/api-client'
import { NeumorphicCard } from '@/components/user/NeumorphicCard'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { FileText, Plus, ArrowRight, Edit, Trash2, Eye } from 'lucide-react'

export default function IntakeFormsPage() {
  const router = useRouter()
  const { user, isLoading: authLoading } = useAuth()
  const [loading, setLoading] = useState(true)
  const [forms, setForms] = useState<any[]>([])
  const [statusFilter, setStatusFilter] = useState<string>('all')

  useEffect(() => {
    if (!authLoading && user) {
      fetchForms()
    }
  }, [authLoading, user, statusFilter])

  async function fetchForms() {
    try {
      setLoading(true)
      const params: any = { page: 1, pageSize: 50 }
      if (statusFilter !== 'all') {
        params.status = statusFilter
      }
      const response = await apiClient.getMedicalIntakeForms(params)
      if (response.success && response.data) {
        setForms(response.data.items || [])
      }
    } catch (error) {
      console.error('Error fetching intake forms:', error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published': return 'bg-green-500 text-white'
      case 'draft': return 'bg-yellow-500 text-white'
      default: return 'bg-gray-500 text-white'
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this intake form? This action cannot be undone.')) {
      return
    }

    try {
      const response = await apiClient.deleteMedicalIntakeForm(id)
      if (response.success) {
        fetchForms()
      } else {
        alert(response.error?.message || 'Failed to delete intake form')
      }
    } catch (error) {
      console.error('Error deleting intake form:', error)
      alert('Failed to delete intake form')
    }
  }

  const handlePublish = async (id: number) => {
    try {
      const response = await apiClient.publishMedicalIntakeForm(id)
      if (response.success) {
        fetchForms()
      } else {
        alert(response.error?.message || 'Failed to publish intake form')
      }
    } catch (error) {
      console.error('Error publishing intake form:', error)
      alert('Failed to publish intake form')
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
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-r from-teal-500 to-emerald-600 rounded-full flex items-center justify-center">
                  <FileText className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-4xl md:text-5xl font-bold text-[var(--neumorphic-text)]">
                    Intake Forms
                  </h1>
                  <p className="text-[var(--neumorphic-muted)] mt-1">
                    Create and manage patient intake forms
                  </p>
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
                  </SelectContent>
                </Select>
                <Button
                  onClick={() => router.push('/medical/intake-forms/new')}
                  className="bg-gradient-to-r from-teal-500 to-emerald-600 hover:from-teal-600 hover:to-emerald-700 text-white"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  New Form
                </Button>
              </div>
            </div>

            {forms.length === 0 ? (
              <NeumorphicCard className="p-12 text-center">
                <FileText className="w-16 h-16 text-[var(--neumorphic-muted)] mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-[var(--neumorphic-text)] mb-2">
                  No intake forms found
                </h3>
                <p className="text-[var(--neumorphic-muted)] mb-6">
                  Get started by creating your first intake form
                </p>
                <Button
                  onClick={() => router.push('/medical/intake-forms/new')}
                  className="bg-gradient-to-r from-teal-500 to-emerald-600 hover:from-teal-600 hover:to-emerald-700 text-white"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Create Intake Form
                </Button>
              </NeumorphicCard>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {forms.map((form) => {
                  const schema = typeof form.schema === 'string' ? JSON.parse(form.schema) : form.schema
                  const title = schema?.title || `Form v${form.version}`
                  const description = schema?.description || 'No description'

                  return (
                    <NeumorphicCard key={form.id} className="p-6 hover:shadow-lg transition-shadow">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <h3 className="text-xl font-semibold text-[var(--neumorphic-text)] mb-1">
                            {title}
                          </h3>
                          <p className="text-sm text-[var(--neumorphic-muted)] line-clamp-2">
                            {description}
                          </p>
                        </div>
                        <Badge className={getStatusColor(form.status)}>
                          {form.status}
                        </Badge>
                      </div>

                      <div className="flex items-center gap-2 text-sm text-[var(--neumorphic-muted)] mb-4">
                        <span>Version: {form.version}</span>
                        {form.responseCount !== undefined && (
                          <>
                            <span>•</span>
                            <span>{form.responseCount} response{form.responseCount !== 1 ? 's' : ''}</span>
                          </>
                        )}
                      </div>

                      <div className="flex items-center gap-2 pt-4 border-t border-[var(--neumorphic-muted)]/20">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => router.push(`/medical/intake-forms/${form.id}`)}
                          className="flex-1"
                        >
                          <Eye className="w-4 h-4 mr-2" />
                          View
                        </Button>
                        {form.status === 'draft' && (
                          <>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => router.push(`/medical/intake-forms/${form.id}?edit=true`)}
                              className="flex-1"
                            >
                              <Edit className="w-4 h-4 mr-2" />
                              Edit
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handlePublish(form.id)}
                              className="flex-1 text-green-600 hover:text-green-700"
                            >
                              Publish
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDelete(form.id)}
                              className="text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </>
                        )}
                      </div>
                    </NeumorphicCard>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

