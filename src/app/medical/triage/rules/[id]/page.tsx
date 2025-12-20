'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { useAuth } from '@/contexts/auth-context'
import { apiClient } from '@/lib/api-client'
import { NeumorphicCard } from '@/components/user/NeumorphicCard'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { ArrowLeft, Save, Check, X } from 'lucide-react'
import { toast } from 'sonner'

export default function TriageRuleDetailPage() {
  const router = useRouter()
  const params = useParams()
  const ruleId = parseInt(params.id as string)
  const { user, isLoading: authLoading } = useAuth()
  const [loading, setLoading] = useState(true)
  const [rule, setRule] = useState<any>(null)
  const [editing, setEditing] = useState(false)
  const [formData, setFormData] = useState<any>(null)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!authLoading && user && ruleId) {
      fetchRule()
    }
  }, [authLoading, user, router, ruleId])

  async function fetchRule() {
    try {
      setLoading(true)
      const response = await apiClient.getTriageRule(ruleId)
      if (response.success && response.data) {
        setRule(response.data)
        setFormData({
          name: response.data.name,
          version: response.data.version,
          severity: response.data.severity,
          definition: JSON.stringify(response.data.definition, null, 2)
        })
      }
    } catch (error) {
      console.error('Error fetching rule:', error)
    } finally {
      setLoading(false)
    }
  }

  async function handleSave() {
    try {
      setSaving(true)
      let definition
      try {
        definition = JSON.parse(formData.definition)
      } catch {
        toast.error('Invalid JSON in definition')
        return
      }

      const response = await apiClient.updateTriageRule(ruleId, {
        name: formData.name,
        version: formData.version,
        severity: formData.severity,
        definition
      })

      if (response.success) {
        toast.success('Triage rule updated successfully')
        setEditing(false)
        fetchRule()
      } else {
        throw new Error(response.error?.message || 'Failed to update rule')
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to update triage rule')
    } finally {
      setSaving(false)
    }
  }

  async function handlePublish() {
    try {
      const response = await apiClient.publishTriageRule(ruleId)
      if (response.success) {
        toast.success('Rule published successfully')
        fetchRule()
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to publish rule')
    }
  }

  async function handleRetire() {
    try {
      const response = await apiClient.retireTriageRule(ruleId)
      if (response.success) {
        toast.success('Rule retired successfully')
        fetchRule()
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to retire rule')
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

  if (!user || !rule) {
    return null
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

  return (
    <div className="min-h-screen bg-[var(--neumorphic-bg)]">
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-teal-500/10 via-emerald-500/5 to-blue-500/10" />
        
        <div className="relative px-4 md:px-8 py-12">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Button
                  onClick={() => router.push('/medical/triage/rules')}
                  variant="ghost"
                  size="sm"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back
                </Button>
                <div className="flex items-center gap-3">
                  <h1 className="text-4xl md:text-5xl font-bold text-[var(--neumorphic-text)]">
                    {rule.name}
                  </h1>
                  <Badge className={getSeverityColor(rule.severity)}>
                    {rule.severity}
                  </Badge>
                  <Badge className={rule.status === 'published' ? 'bg-green-500' : rule.status === 'draft' ? 'bg-yellow-500' : 'bg-gray-500'}>
                    {rule.status}
                  </Badge>
                </div>
              </div>
              {!editing && (
                <div className="flex gap-2">
                  {rule.status === 'draft' && (
                    <>
                      <Button onClick={() => setEditing(true)} variant="outline">
                        Edit
                      </Button>
                      <Button onClick={handlePublish} className="bg-green-500 text-white">
                        <Check className="w-4 h-4 mr-2" />
                        Publish
                      </Button>
                    </>
                  )}
                  {rule.status === 'published' && (
                    <Button onClick={handleRetire} variant="outline">
                      Retire
                    </Button>
                  )}
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
                <Label>Rule Name</Label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Version</Label>
                  <Input
                    value={formData.version}
                    onChange={(e) => setFormData({ ...formData, version: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Severity</Label>
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
              <div>
                <Label>Definition (JSON)</Label>
                <Textarea
                  value={formData.definition}
                  onChange={(e) => setFormData({ ...formData, definition: e.target.value })}
                  rows={12}
                  className="font-mono text-sm"
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button onClick={() => setEditing(false)} variant="outline">
                  <X className="w-4 h-4 mr-2" />
                  Cancel
                </Button>
                <Button onClick={handleSave} disabled={saving} className="bg-gradient-to-r from-teal-500 to-emerald-600 text-white">
                  <Save className="w-4 h-4 mr-2" />
                  {saving ? 'Saving...' : 'Save'}
                </Button>
              </div>
            </div>
          </NeumorphicCard>
        ) : (
          <NeumorphicCard variant="raised" className="p-6">
            <div className="space-y-4">
              <div>
                <p className="text-sm font-semibold text-[var(--neumorphic-muted)] mb-2">Version</p>
                <p className="text-[var(--neumorphic-text)]">{rule.version}</p>
              </div>
              <div>
                <p className="text-sm font-semibold text-[var(--neumorphic-muted)] mb-2">Definition</p>
                <pre className="p-4 rounded-lg bg-[var(--neumorphic-surface)] text-sm overflow-auto">
                  {JSON.stringify(rule.definition, null, 2)}
                </pre>
              </div>
            </div>
          </NeumorphicCard>
        )}
      </div>
    </div>
  )
}

