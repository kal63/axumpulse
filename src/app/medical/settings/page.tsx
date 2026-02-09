'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/auth-context'
import { apiClient } from '@/lib/api-client'
import { NeumorphicCard } from '@/components/user/NeumorphicCard'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Stethoscope, Save, DollarSign } from 'lucide-react'
import { toast } from 'sonner'

export default function MedicalSettingsPage() {
  const router = useRouter()
  const { user, isLoading: authLoading } = useAuth()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [consultFee, setConsultFee] = useState<string>('')
  const [currentFee, setCurrentFee] = useState<number | null>(null)

  useEffect(() => {
    if (!authLoading && user) {
      if (!user.isMedical) {
        router.push('/user/dashboard')
        return
      }
      fetchConsultFee()
    }
  }, [authLoading, user, router])

  const fetchConsultFee = async () => {
    try {
      setLoading(true)
      const response = await apiClient.getMedicalConsultFee()
      if (response.success && response.data) {
        const fee = response.data.consultFee
        // Convert to number if it's not null/undefined
        const feeNumber = fee !== null && fee !== undefined ? Number(fee) : null
        setCurrentFee(feeNumber)
        setConsultFee(feeNumber !== null ? feeNumber.toString() : '')
      }
    } catch (error) {
      console.error('Error fetching consult fee:', error)
      toast.error('Failed to load consult fee')
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    const feeValue = parseFloat(consultFee)
    
    if (isNaN(feeValue) || feeValue < 0) {
      toast.error('Please enter a valid fee amount (must be 0 or greater)')
      return
    }

    try {
      setSaving(true)
      const response = await apiClient.updateMedicalConsultFee(feeValue)
      
      if (response.success && response.data) {
        const fee = response.data.consultFee
        const feeNumber = fee !== null && fee !== undefined ? Number(fee) : null
        setCurrentFee(feeNumber)
        setConsultFee(feeNumber !== null ? feeNumber.toString() : '')
        toast.success('Consult fee updated successfully')
      } else {
        toast.error(response.error?.message || 'Failed to update consult fee')
      }
    } catch (error: any) {
      console.error('Error updating consult fee:', error)
      toast.error(error?.message || 'Failed to update consult fee')
    } finally {
      setSaving(false)
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

  if (!user || !user.isMedical) {
    return null
  }

  return (
    <div className="min-h-screen bg-[var(--neumorphic-bg)]">
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-teal-500/10 via-emerald-500/5 to-blue-500/10" />
        
        <div className="relative px-4 md:px-8 py-12">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-12 h-12 bg-gradient-to-r from-teal-500 to-emerald-600 rounded-full flex items-center justify-center">
                <Stethoscope className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-4xl md:text-5xl font-bold text-[var(--neumorphic-text)]">
                  Settings
                </h1>
                <p className="text-lg text-[var(--neumorphic-muted)]">
                  Manage your medical professional settings
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        <NeumorphicCard variant="raised" className="p-6 space-y-6">
          <div>
            <h2 className="text-2xl font-bold text-[var(--neumorphic-text)] mb-2 flex items-center gap-2">
              <DollarSign className="w-6 h-6 text-teal-500" />
              Consult Fee Settings
            </h2>
            <p className="text-[var(--neumorphic-muted)]">
              Set the fee you charge for consultations. Trainees must purchase consults before booking with you.
            </p>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="consultFee" className="text-[var(--neumorphic-text)]">
                Consult Fee (ETB)
              </Label>
              <Input
                id="consultFee"
                type="number"
                min="0"
                step="0.01"
                value={consultFee}
                onChange={(e) => setConsultFee(e.target.value)}
                placeholder="Enter fee amount"
                className="w-full"
              />
              <p className="text-sm text-[var(--neumorphic-muted)]">
                Enter the amount in ETB that trainees will pay for each consult
              </p>
            </div>

            {currentFee !== null && typeof currentFee === 'number' && !isNaN(currentFee) && (
              <div className="p-4 rounded-lg bg-[var(--neumorphic-surface)]">
                <p className="text-sm text-[var(--neumorphic-muted)] mb-1">Current Fee:</p>
                <p className="text-2xl font-bold text-[var(--neumorphic-text)]">
                  {currentFee.toFixed(2)} ETB
                </p>
              </div>
            )}

            <Button
              onClick={handleSave}
              disabled={saving}
              className="w-full bg-gradient-to-r from-teal-500 to-emerald-600 hover:from-teal-600 hover:to-emerald-700 text-white"
            >
              <Save className="w-4 h-4 mr-2" />
              {saving ? 'Saving...' : 'Save Consult Fee'}
            </Button>
          </div>
        </NeumorphicCard>
      </div>
    </div>
  )
}

