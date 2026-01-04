'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/auth-context'
import { apiClient } from '@/lib/api-client'
import { NeumorphicCard } from '@/components/user/NeumorphicCard'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ArrowLeft, Save } from 'lucide-react'
import { toast } from 'sonner'
import { TriageRuleBuilder } from '@/components/medical/TriageRuleBuilder'

interface RuleDefinition {
  conditions: Array<{
    field: string
    operator: 'eq' | 'neq' | 'gt' | 'lt' | 'gte' | 'lte' | 'includes' | 'exists' | 'not_exists'
    value?: string | number
  }>
  actions: Array<{
    type: 'set_disposition' | 'message'
    value: string
  }>
}

export default function NewTriageRulePage() {
  const router = useRouter()
  const { user, isLoading: authLoading } = useAuth()
  const [saving, setSaving] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    version: '1.0',
    severity: 'low' as 'low' | 'medium' | 'high' | 'critical',
  })
  const [definition, setDefinition] = useState<RuleDefinition>({
    conditions: [],
    actions: []
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
          <p className="text-[var(--neumorphic-muted)] mb-4">You must be a medical professional to create triage rules.</p>
          <Button onClick={() => router.push('/user/medical/apply')}>
            Apply to Become Medical Professional
          </Button>
        </div>
      </div>
    )
  }

  async function handleSave() {
    if (!formData.name.trim()) {
      toast.error('Please enter a rule name')
      return
    }

    if (definition.conditions.length === 0) {
      toast.error('Please add at least one condition')
      return
    }

    // Validate conditions
    const invalidConditions = definition.conditions.some(cond => 
      !cond.field || !cond.operator || (cond.operator !== 'exists' && cond.operator !== 'not_exists' && cond.value === undefined)
    )
    if (invalidConditions) {
      toast.error('All conditions must have a field, operator, and value (if required)')
      return
    }

    // Validate actions
    const invalidActions = definition.actions.some(action => !action.type || !action.value)
    if (invalidActions) {
      toast.error('All actions must have a type and value')
      return
    }

    try {
      setSaving(true)

      const response = await apiClient.createTriageRule({
        name: formData.name,
        version: formData.version,
        severity: formData.severity,
        definition
      })

      if (response.success) {
        toast.success('Triage rule created successfully')
        router.push('/medical/triage/rules')
      } else {
        throw new Error(response.error?.message || 'Failed to create rule')
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to create triage rule')
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
                onClick={() => router.push('/medical/triage/rules')}
                variant="ghost"
                size="sm"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-[var(--neumorphic-text)]">
              Create Triage Rule
            </h1>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8 space-y-6">
        <NeumorphicCard variant="raised" className="p-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Rule Name *</Label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., Chest Pain - Critical Alert"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Version *</Label>
                <Input
                  value={formData.version}
                  onChange={(e) => setFormData({ ...formData, version: e.target.value })}
                  placeholder="1.0"
                />
              </div>
              <div className="space-y-2">
                <Label>Severity *</Label>
                <Select value={formData.severity} onValueChange={(v: any) => setFormData({ ...formData, severity: v })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="critical">Critical</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </NeumorphicCard>

        <TriageRuleBuilder
          initialDefinition={definition}
          onDefinitionChange={setDefinition}
        />

        <div className="flex justify-end gap-4">
          <Button
            onClick={() => router.push('/medical/triage/rules')}
            variant="outline"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={saving}
            className="bg-gradient-to-r from-teal-500 to-emerald-600 text-white"
          >
            <Save className="w-4 h-4 mr-2" />
            {saving ? 'Saving...' : 'Save as Draft'}
          </Button>
        </div>
      </div>
    </div>
  )
}

