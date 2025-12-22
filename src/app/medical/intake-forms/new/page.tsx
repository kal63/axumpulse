'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/auth-context'
import { apiClient } from '@/lib/api-client'
import { NeumorphicCard } from '@/components/user/NeumorphicCard'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { ArrowLeft, Save } from 'lucide-react'
import { toast } from 'sonner'

export default function NewIntakeFormPage() {
  const router = useRouter()
  const { user, isLoading: authLoading } = useAuth()
  const [saving, setSaving] = useState(false)
  const [formData, setFormData] = useState({
    version: '1.0',
    title: '',
    description: '',
    schemaJson: JSON.stringify({
      title: '',
      description: '',
      fields: []
    }, null, 2)
  })

  if (authLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--neumorphic-bg)]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-500 mx-auto"></div>
          <p className="mt-4 text-[var(--neumorphic-muted)]">Loading...</p>
        </div>
      </div>
    )
  }

  if (!user.isMedical) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--neumorphic-bg)]">
        <div className="text-center">
          <p className="text-[var(--neumorphic-muted)] mb-4">You must be a medical professional to create intake forms.</p>
          <Button onClick={() => router.push('/user/medical/apply')}>
            Apply to Become Medical Professional
          </Button>
        </div>
      </div>
    )
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
        // Update schema with title and description
        schema.title = formData.title
        schema.description = formData.description
      } catch (e: any) {
        toast.error(`Invalid JSON in schema: ${e.message}`)
        return
      }

      const response = await apiClient.createMedicalIntakeForm({
        version: formData.version,
        schema
      })

      if (response.success) {
        toast.success('Intake form created successfully')
        router.push('/medical/intake-forms')
      } else {
        throw new Error(response.error?.message || 'Failed to create form')
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to create intake form')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="min-h-screen bg-[var(--neumorphic-bg)]">
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-teal-500/10 via-emerald-500/5 to-blue-500/10" />
        
        <div className="relative px-4 md:px-8 py-12">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center gap-4 mb-4">
              <Button
                onClick={() => router.push('/medical/intake-forms')}
                variant="ghost"
                size="sm"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-[var(--neumorphic-text)]">
              Create Intake Form
            </h1>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
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
              <p className="text-xs text-[var(--neumorphic-muted)] mt-2">
                Example field structure: {'{'} "id": "symptom", "type": "text", "label": "Main Symptom", "required": true {'}'}
              </p>
            </div>
          </div>
        </NeumorphicCard>

        <div className="flex items-center justify-end gap-4">
          <Button
            variant="ghost"
            onClick={() => router.push('/medical/intake-forms')}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={saving}
            className="bg-gradient-to-r from-teal-500 to-emerald-600 hover:from-teal-600 hover:to-emerald-700 text-white"
          >
            <Save className="w-4 h-4 mr-2" />
            {saving ? 'Saving...' : 'Save Draft'}
          </Button>
        </div>
      </div>
    </div>
  )
}

