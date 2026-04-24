'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/auth-context'
import { apiClient } from '@/lib/api-client'
import { NeumorphicCard } from '@/components/user/NeumorphicCard'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { FileText, ArrowRight, ArrowLeft, Calendar } from 'lucide-react'

export default function IntakeFormsPage() {
  const router = useRouter()
  const { user, isLoading: authLoading } = useAuth()
  const [loading, setLoading] = useState(true)
  const [forms, setForms] = useState<any[]>([])

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login')
    } else if (user) {
      fetchForms()
    }
  }, [authLoading, user, router])

  async function fetchForms() {
    try {
      setLoading(true)
      const response = await apiClient.getIntakeForms()
      if (response.success && response.data) {
        // Parse schema and extract title/description for each form
        const formsWithParsedSchema = response.data.map((form: any) => {
          let schema = form.schema
          if (typeof schema === 'string') {
            try {
              schema = JSON.parse(schema)
            } catch (e) {
              console.error('Error parsing schema:', e)
              schema = null
            }
          }
          
          return {
            ...form,
            title: schema?.title || form.title || form.name || `Form v${form.version || 'N/A'}`,
            description: schema?.description || form.description || null,
            schema: schema || form.schema
          }
        })
        setForms(formsWithParsedSchema)
      }
    } catch (error) {
      console.error('Error fetching intake forms:', error)
    } finally {
      setLoading(false)
    }
  }

  if (authLoading || loading) {
    return (
      <div className="flex min-h-dvh min-h-screen items-center justify-center user-app-page">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--ethio-deep-blue)] mx-auto"></div>
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
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-gradient-to-r from-teal-500 to-emerald-600 rounded-full flex items-center justify-center">
                <FileText className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-4xl md:text-5xl font-bold user-app-ink">
                  Intake Forms
                </h1>
                <p className="text-lg user-app-muted">
                  Complete intake forms to receive medical triage assessments
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {forms.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {forms.map((form) => (
              <NeumorphicCard key={form.id} variant="raised" className="p-6" interactive>
                <div className="flex items-start justify-between mb-4">
                  <div className="w-10 h-10 bg-gradient-to-r from-teal-500 to-emerald-600 rounded-lg flex items-center justify-center">
                    <FileText className="w-5 h-5 text-white" />
                  </div>
                  <Badge className="bg-green-500 text-white">Published</Badge>
                </div>
                <h3 className="text-xl font-bold user-app-ink mb-2">
                  {form.title || `Form v${form.version || 'N/A'}`}
                </h3>
                {form.description && (
                  <p className="text-sm user-app-muted mb-4 line-clamp-2">
                    {form.description}
                  </p>
                )}
                <div className="flex items-center gap-2 text-xs user-app-muted mb-4">
                  <Calendar className="w-4 h-4" />
                  <span>Version {form.version}</span>
                </div>
                <Button
                  onClick={() => router.push(`/user/medical/intake/${form.id}`)}
                  className="w-full bg-gradient-to-r from-teal-500 to-emerald-600 hover:from-teal-600 hover:to-emerald-700 text-white"
                >
                  Start Form
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </NeumorphicCard>
            ))}
          </div>
        ) : (
          <NeumorphicCard variant="raised" className="p-12 text-center">
            <FileText className="w-16 h-16 mx-auto mb-4 text-gray-400" />
            <h3 className="text-xl font-semibold user-app-ink mb-2">
              No Intake Forms Available
            </h3>
            <p className="user-app-muted">
              Check back later for available intake forms.
            </p>
          </NeumorphicCard>
        )}
      </div>
    </div>
  )
}

