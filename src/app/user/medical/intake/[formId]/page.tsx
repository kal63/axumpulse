'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { useAuth } from '@/contexts/auth-context'
import { apiClient } from '@/lib/api-client'
import { IntakeFormWizard } from '@/components/medical/IntakeFormWizard'
import { NeumorphicCard } from '@/components/user/NeumorphicCard'
import { Button } from '@/components/ui/button'
import { ArrowLeft, FileText } from 'lucide-react'
import { toast } from 'sonner'

export default function IntakeFormSubmissionPage() {
  const router = useRouter()
  const params = useParams()
  const formId = parseInt(params.formId as string)
  const { user, isLoading: authLoading } = useAuth()
  const [loading, setLoading] = useState(true)
  const [form, setForm] = useState<any>(null)
  const [submitted, setSubmitted] = useState(false)
  const [triageResult, setTriageResult] = useState<any>(null)

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login')
    } else if (user && formId) {
      fetchForm()
    }
  }, [authLoading, user, router, formId])

  async function fetchForm() {
    try {
      setLoading(true)
      const response = await apiClient.getIntakeForms()
      if (response.success && response.data) {
        const foundForm = response.data.find((f: any) => f.id === formId)
        if (foundForm) {
          // Parse schema and extract title/description
          let schema = foundForm.schema
          if (typeof schema === 'string') {
            try {
              schema = JSON.parse(schema)
            } catch (e) {
              console.error('Error parsing schema:', e)
              schema = null
            }
          }
          
          const formWithParsedSchema = {
            ...foundForm,
            title: schema?.title || foundForm.title || foundForm.name || `Form v${foundForm.version || 'N/A'}`,
            description: schema?.description || foundForm.description || null,
            schema: schema || foundForm.schema
          }
          setForm(formWithParsedSchema)
        } else {
          toast.error('Intake form not found')
          router.push('/user/medical/intake')
        }
      }
    } catch (error) {
      console.error('Error fetching intake form:', error)
      toast.error('Failed to load intake form')
    } finally {
      setLoading(false)
    }
  }

  async function handleSubmit(answers: Record<string, any>) {
    try {
      const response = await apiClient.submitIntakeForm(formId, answers)
      if (response.success && response.data) {
        setTriageResult(response.data.triageRun)
        setSubmitted(true)
        toast.success('Intake form submitted successfully')
      } else {
        throw new Error(response.error?.message || 'Failed to submit form')
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to submit intake form')
      throw error
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

  if (!user || !form) {
    return null
  }

  if (submitted && triageResult) {
    const getRiskColor = (risk: string) => {
      switch (risk) {
        case 'critical': return 'bg-red-500'
        case 'high': return 'bg-orange-500'
        case 'medium': return 'bg-yellow-500'
        case 'low': return 'bg-green-500'
        default: return 'bg-gray-500'
      }
    }

    return (
      <div className="min-h-dvh min-h-full user-app-page">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <NeumorphicCard variant="raised" className="p-8 text-center">
            <div className="w-16 h-16 bg-gradient-to-r from-teal-500 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <FileText className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-3xl font-bold user-app-ink mb-4">
              Form Submitted Successfully
            </h2>
            <p className="user-app-muted mb-8">
              Your intake form has been processed. Here's your triage assessment:
            </p>

            <div className="space-y-4 mb-8">
              <div className="p-6 rounded-xl user-app-paper">
                <div className="flex items-center justify-center gap-3 mb-4">
                  <span className="text-sm font-medium user-app-muted">Risk Level:</span>
                  <span className={`px-4 py-2 rounded-full text-white font-semibold ${getRiskColor(triageResult.riskLevel)}`}>
                    {triageResult.riskLevel?.toUpperCase()}
                  </span>
                </div>
                <div className="mb-4">
                  <span className="text-sm font-medium user-app-muted">Disposition: </span>
                  <span className="text-lg font-semibold user-app-ink">
                    {triageResult.disposition?.replace('_', ' ')}
                  </span>
                </div>
                {triageResult.messages?.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-sm font-medium user-app-muted">Messages:</p>
                    {triageResult.messages.map((msg: string, idx: number) => (
                      <p key={idx} className="user-app-ink">{msg}</p>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="flex gap-4 justify-center">
              <Button
                onClick={() => router.push('/user/medical/triage')}
                className="bg-gradient-to-r from-teal-500 to-emerald-600 text-white"
              >
                View Triage History
              </Button>
              <Button
                onClick={() => router.push('/user/medical')}
                variant="outline"
              >
                Back to Medical Hub
              </Button>
            </div>
          </NeumorphicCard>
        </div>
      </div>
    )
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
                onClick={() => router.push('/user/medical/intake')}
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
                  {form.title || `Form v${form.version || 'N/A'}`}
                </h1>
                {form.description && (
                  <p className="text-lg user-app-muted">
                    {form.description}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Form */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        <IntakeFormWizard
          formSchema={form.schema || form}
          onSubmit={handleSubmit}
          onCancel={() => router.push('/user/medical/intake')}
        />
      </div>
    </div>
  )
}

