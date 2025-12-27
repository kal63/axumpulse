'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/auth-context'
import { apiClient } from '@/lib/api-client'
import { NeumorphicCard } from '@/components/user/NeumorphicCard'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ArrowLeft, Save } from 'lucide-react'
import { toast } from 'sonner'
import { IntakeFormBuilder } from '@/components/medical/IntakeFormBuilder'

interface FormSchema {
  title: string
  description: string
  sections: Array<{
    id: string
    title: string
    description?: string
    fields: Array<{
      id: string
      type: 'text' | 'textarea' | 'number' | 'select' | 'radio' | 'checkbox'
      label: string
      required: boolean
      placeholder?: string
      options?: Array<{ label: string; value: string }>
    }>
  }>
}

export default function NewIntakeFormPage() {
  const router = useRouter()
  const { user, isLoading: authLoading } = useAuth()
  const [saving, setSaving] = useState(false)
  const [version, setVersion] = useState('1.0')
  const [schema, setSchema] = useState<FormSchema>({
    title: '',
    description: '',
    sections: []
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
    if (!version.trim()) {
      toast.error('Please enter a version')
      return
    }

    if (!schema.title.trim()) {
      toast.error('Please enter a form title')
      return
    }

    if (schema.sections.length === 0) {
      toast.error('Please add at least one section to the form')
      return
    }

    // Validate that all sections have at least one field
    const sectionsWithoutFields = schema.sections.filter(s => s.fields.length === 0)
    if (sectionsWithoutFields.length > 0) {
      toast.error('All sections must have at least one field')
      return
    }

    // Validate that all fields have labels
    const fieldsWithoutLabels = schema.sections.some(s => 
      s.fields.some(f => !f.label.trim())
    )
    if (fieldsWithoutLabels) {
      toast.error('All fields must have a label')
      return
    }

    // Validate options for select/radio/checkbox fields
    const fieldsWithInvalidOptions = schema.sections.some(s =>
      s.fields.some(f => {
        if (['select', 'radio', 'checkbox'].includes(f.type)) {
          return !f.options || f.options.length === 0
        }
        return false
      })
    )
    if (fieldsWithInvalidOptions) {
      toast.error('Select, radio, and checkbox fields must have at least one option')
      return
    }

    try {
      setSaving(true)

      const response = await apiClient.createMedicalIntakeForm({
        version: version.trim(),
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

      <div className="max-w-6xl mx-auto px-4 py-8 space-y-6">
        <NeumorphicCard variant="raised" className="p-6">
          <div className="mb-4">
            <Label className="text-[var(--neumorphic-text)]">Version</Label>
            <Input
              value={version}
              onChange={(e) => setVersion(e.target.value)}
              placeholder="1.0"
              className="max-w-xs"
            />
          </div>
        </NeumorphicCard>

        <IntakeFormBuilder
          initialSchema={schema}
          onSchemaChange={setSchema}
        />

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

