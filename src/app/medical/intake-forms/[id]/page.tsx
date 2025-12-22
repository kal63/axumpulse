'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams, useSearchParams } from 'next/navigation'
import { useAuth } from '@/contexts/auth-context'
import { apiClient } from '@/lib/api-client'
import { NeumorphicCard } from '@/components/user/NeumorphicCard'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { ArrowLeft, Save, Check, Eye } from 'lucide-react'
import { toast } from 'sonner'

export default function IntakeFormDetailPage() {
  const router = useRouter()
  const params = useParams()
  const searchParams = useSearchParams()
  const formId = parseInt(params.id as string)
  const editMode = searchParams.get('edit') === 'true'
  const { user, isLoading: authLoading } = useAuth()
  const [loading, setLoading] = useState(true)
  const [form, setForm] = useState<any>(null)
  const [editing, setEditing] = useState(editMode)
  const [formData, setFormData] = useState<any>(null)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!authLoading && user && formId) {
      fetchForm()
    }
  }, [authLoading, user, router, formId])

  async function fetchForm() {
    try {
      setLoading(true)
      const response = await apiClient.getMedicalIntakeForm(formId)
      if (response.success && response.data) {
        const formData = response.data.data || response.data
        setForm(formData)
        const schema = typeof formData.schema === 'string' ? JSON.parse(formData.schema) : formData.schema
        setFormData({
          version: formData.version,
          title: schema?.title || '',
          description: schema?.description || '',
          schemaJson: JSON.stringify(schema, null, 2)
        })
      }
    } catch (error) {
      console.error('Error fetching form:', error)
      toast.error('Failed to load intake form')
    } finally {
      setLoading(false)
    }
  }

  async function handleSave() {
    if (!formData.version.trim()) {
      toast.error('Please enter a version')
      return
    }

    if (!formData.title.trim()) {
      toast.error('Please enter a title')
      return
    }

    try {
      setSaving(true)
      let schema
      try {
        schema = JSON.parse(formData.schemaJson)
        schema.title = formData.title
        schema.description = formData.description
      } catch (e: any) {
        toast.error(`Invalid JSON in schema: ${e.message}`)
        return
      }

      const response = await apiClient.updateMedicalIntakeForm(formId, {
        version: formData.version,
        schema
      })

      if (response.success) {
        toast.success('Intake form updated successfully')
        setEditing(false)
        fetchForm()
      } else {
        throw new Error(response.error?.message || 'Failed to update form')
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to update intake form')
    } finally {
      setSaving(false)
    }
  }

  async function handlePublish() {
    try {
      const response = await apiClient.publishMedicalIntakeForm(formId)
      if (response.success) {
        toast.success('Form published successfully')
        fetchForm()
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to publish form')
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

  if (!user || !form) {
    return null
  }

  const schema = typeof form.schema === 'string' ? JSON.parse(form.schema) : form.schema
  const title = schema?.title || `Form v${form.version}`
  const description = schema?.description || 'No description'

  return (
    <div className="min-h-screen bg-[var(--neumorphic-bg)]">
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-teal-500/10 via-emerald-500/5 to-blue-500/10" />
        
        <div className="relative px-4 md:px-8 py-12">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Button
                  onClick={() => router.push('/medical/intake-forms')}
                  variant="ghost"
                  size="sm"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back
                </Button>
                <div className="flex items-center gap-3">
                  <h1 className="text-4xl md:text-5xl font-bold text-[var(--neumorphic-text)]">
                    {title}
                  </h1>
                  <Badge className={form.status === 'published' ? 'bg-green-500 text-white' : 'bg-yellow-500 text-white'}>
                    {form.status}
                  </Badge>
                </div>
              </div>
              {!editing && form.status === 'draft' && (
                <div className="flex gap-2">
                  <Button onClick={() => setEditing(true)} variant="outline">
                    Edit
                  </Button>
                  <Button onClick={handlePublish} className="bg-green-500 text-white">
                    <Check className="w-4 h-4 mr-2" />
                    Publish
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        {editing ? (
          <NeumorphicCard variant="raised" className="p-6">
            <div className="space-y-4">
              <div>
                <Label className="text-[var(--neumorphic-text)]">Form Title</Label>
                <Input
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g., General Health Intake Form"
                />
              </div>
              <div>
                <Label className="text-[var(--neumorphic-text)]">Description</Label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Brief description of what this form is for"
                  rows={3}
                />
              </div>
              <div>
                <Label className="text-[var(--neumorphic-text)]">Version</Label>
                <Input
                  value={formData.version}
                  onChange={(e) => setFormData({ ...formData, version: e.target.value })}
                  placeholder="1.0"
                />
              </div>
              <div>
                <Label className="text-[var(--neumorphic-text)]">Form Schema (JSON)</Label>
                <p className="text-sm text-[var(--neumorphic-muted)] mb-2">
                  Define the form structure with fields, types, and validation rules.
                </p>
                <Textarea
                  value={formData.schemaJson}
                  onChange={(e) => setFormData({ ...formData, schemaJson: e.target.value })}
                  placeholder='{"title": "", "description": "", "fields": []}'
                  rows={20}
                  className="font-mono text-sm"
                />
              </div>
              <div className="flex items-center justify-end gap-4 pt-4">
                <Button
                  variant="ghost"
                  onClick={() => {
                    setEditing(false)
                    fetchForm()
                  }}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSave}
                  disabled={saving}
                  className="bg-gradient-to-r from-teal-500 to-emerald-600 hover:from-teal-600 hover:to-emerald-700 text-white"
                >
                  <Save className="w-4 h-4 mr-2" />
                  {saving ? 'Saving...' : 'Save Changes'}
                </Button>
              </div>
            </div>
          </NeumorphicCard>
        ) : (
          <div className="space-y-6">
            <NeumorphicCard variant="raised" className="p-6">
              <div className="space-y-4">
                <div>
                  <Label className="text-[var(--neumorphic-text)] text-sm font-semibold">Description</Label>
                  <p className="text-[var(--neumorphic-text)] mt-1">{description}</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-[var(--neumorphic-text)] text-sm font-semibold">Version</Label>
                    <p className="text-[var(--neumorphic-text)] mt-1">{form.version}</p>
                  </div>
                  <div>
                    <Label className="text-[var(--neumorphic-text)] text-sm font-semibold">Status</Label>
                    <div className="mt-1">
                      <Badge className={form.status === 'published' ? 'bg-green-500 text-white' : 'bg-yellow-500 text-white'}>
                        {form.status}
                      </Badge>
                    </div>
                  </div>
                </div>
                {form.publishedAt && (
                  <div>
                    <Label className="text-[var(--neumorphic-text)] text-sm font-semibold">Published At</Label>
                    <p className="text-[var(--neumorphic-text)] mt-1">
                      {new Date(form.publishedAt).toLocaleString()}
                    </p>
                  </div>
                )}
                {form.responseCount !== undefined && (
                  <div>
                    <Label className="text-[var(--neumorphic-text)] text-sm font-semibold">Responses</Label>
                    <p className="text-[var(--neumorphic-text)] mt-1">
                      {form.responseCount} response{form.responseCount !== 1 ? 's' : ''}
                    </p>
                  </div>
                )}
              </div>
            </NeumorphicCard>

            <NeumorphicCard variant="raised" className="p-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label className="text-[var(--neumorphic-text)] text-lg font-semibold">Form Schema</Label>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      const blob = new Blob([formData.schemaJson], { type: 'application/json' })
                      const url = URL.createObjectURL(blob)
                      const a = document.createElement('a')
                      a.href = url
                      a.download = `intake-form-${formId}-schema.json`
                      a.click()
                      URL.revokeObjectURL(url)
                    }}
                  >
                    Download JSON
                  </Button>
                </div>
                <pre className="bg-[var(--neumorphic-bg)] p-4 rounded-lg border border-[var(--neumorphic-muted)]/20 overflow-auto text-sm font-mono text-[var(--neumorphic-text)]">
                  {formData?.schemaJson || JSON.stringify(schema, null, 2)}
                </pre>
              </div>
            </NeumorphicCard>
          </div>
        )}
      </div>
    </div>
  )
}

