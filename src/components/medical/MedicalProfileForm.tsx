'use client'

import { useState, useEffect } from 'react'
import { NeumorphicCard } from '@/components/user/NeumorphicCard'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { X, Plus, Save } from 'lucide-react'
import { toast } from 'sonner'

interface MedicalProfileFormProps {
  initialData?: {
    conditions?: string[]
    medications?: Array<{ name: string; dosage?: string; frequency?: string }>
    allergies?: string[]
    surgeries?: Array<{ type: string; date?: string }>
    pregnancyStatus?: string | null
    contraindications?: string[]
    notes?: string | null
  }
  onSave?: (data: any) => Promise<void>
}

export function MedicalProfileForm({ initialData, onSave }: MedicalProfileFormProps) {
  const [conditions, setConditions] = useState<string[]>(initialData?.conditions || [])
  const [medications, setMedications] = useState<Array<{ name: string; dosage?: string; frequency?: string }>>(
    initialData?.medications || []
  )
  const [allergies, setAllergies] = useState<string[]>(initialData?.allergies || [])
  const [surgeries, setSurgeries] = useState<Array<{ type: string; date?: string }>>(
    initialData?.surgeries || []
  )
  const [pregnancyStatus, setPregnancyStatus] = useState<string>(
    initialData?.pregnancyStatus && initialData.pregnancyStatus !== '' 
      ? initialData.pregnancyStatus 
      : 'not_applicable'
  )
  const [contraindications, setContraindications] = useState<string[]>(initialData?.contraindications || [])
  const [notes, setNotes] = useState<string>(initialData?.notes || '')
  const [saving, setSaving] = useState(false)

  // New item inputs
  const [newCondition, setNewCondition] = useState('')
  const [newAllergy, setNewAllergy] = useState('')
  const [newContraindication, setNewContraindication] = useState('')
  const [newMedication, setNewMedication] = useState({ name: '', dosage: '', frequency: '' })
  const [newSurgery, setNewSurgery] = useState({ type: '', date: '' })

  const addCondition = () => {
    if (newCondition.trim() && !conditions.includes(newCondition.trim())) {
      setConditions([...conditions, newCondition.trim()])
      setNewCondition('')
    }
  }

  const removeCondition = (index: number) => {
    setConditions(conditions.filter((_, i) => i !== index))
  }

  const addAllergy = () => {
    if (newAllergy.trim() && !allergies.includes(newAllergy.trim())) {
      setAllergies([...allergies, newAllergy.trim()])
      setNewAllergy('')
    }
  }

  const removeAllergy = (index: number) => {
    setAllergies(allergies.filter((_, i) => i !== index))
  }

  const addContraindication = () => {
    if (newContraindication.trim() && !contraindications.includes(newContraindication.trim())) {
      setContraindications([...contraindications, newContraindication.trim()])
      setNewContraindication('')
    }
  }

  const removeContraindication = (index: number) => {
    setContraindications(contraindications.filter((_, i) => i !== index))
  }

  const addMedication = () => {
    if (newMedication.name.trim()) {
      setMedications([...medications, { ...newMedication }])
      setNewMedication({ name: '', dosage: '', frequency: '' })
    }
  }

  const removeMedication = (index: number) => {
    setMedications(medications.filter((_, i) => i !== index))
  }

  const addSurgery = () => {
    if (newSurgery.type.trim()) {
      setSurgeries([...surgeries, { ...newSurgery }])
      setNewSurgery({ type: '', date: '' })
    }
  }

  const removeSurgery = (index: number) => {
    setSurgeries(surgeries.filter((_, i) => i !== index))
  }

  const handleSave = async () => {
    if (onSave) {
      setSaving(true)
      try {
        await onSave({
          conditions,
          medications,
          allergies,
          surgeries,
          pregnancyStatus: pregnancyStatus === 'not_applicable' || !pregnancyStatus ? null : pregnancyStatus,
          contraindications,
          notes: notes || null
        })
        toast.success('Medical profile saved successfully')
      } catch (error) {
        toast.error('Failed to save medical profile')
        console.error(error)
      } finally {
        setSaving(false)
      }
    }
  }

  return (
    <div className="space-y-6">
      {/* Conditions */}
      <NeumorphicCard variant="raised" className="p-6">
        <h3 className="text-lg font-semibold text-[var(--neumorphic-text)] mb-4">
          Medical Conditions
        </h3>
        <div className="flex gap-2 mb-4">
          <Input
            value={newCondition}
            onChange={(e) => setNewCondition(e.target.value)}
            placeholder="Enter condition"
            onKeyPress={(e) => e.key === 'Enter' && addCondition()}
          />
          <Button onClick={addCondition} className="bg-gradient-to-r from-teal-500 to-emerald-600 text-white">
            <Plus className="w-4 h-4" />
          </Button>
        </div>
        <div className="flex flex-wrap gap-2">
          {conditions.map((condition, index) => (
            <Badge key={index} className="bg-teal-500 text-white">
              {condition}
              <button
                onClick={() => removeCondition(index)}
                className="ml-2 hover:bg-teal-600 rounded-full"
              >
                <X className="w-3 h-3" />
              </button>
            </Badge>
          ))}
        </div>
      </NeumorphicCard>

      {/* Medications */}
      <NeumorphicCard variant="raised" className="p-6">
        <h3 className="text-lg font-semibold text-[var(--neumorphic-text)] mb-4">
          Medications
        </h3>
        <div className="space-y-3 mb-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
            <Input
              value={newMedication.name}
              onChange={(e) => setNewMedication({ ...newMedication, name: e.target.value })}
              placeholder="Medication name"
            />
            <Input
              value={newMedication.dosage}
              onChange={(e) => setNewMedication({ ...newMedication, dosage: e.target.value })}
              placeholder="Dosage (e.g., 500mg)"
            />
            <Input
              value={newMedication.frequency}
              onChange={(e) => setNewMedication({ ...newMedication, frequency: e.target.value })}
              placeholder="Frequency (e.g., twice daily)"
            />
          </div>
          <Button onClick={addMedication} className="bg-gradient-to-r from-teal-500 to-emerald-600 text-white">
            <Plus className="w-4 h-4 mr-2" />
            Add Medication
          </Button>
        </div>
        <div className="space-y-2">
          {medications.map((med, index) => (
            <div key={index} className="p-3 rounded-lg bg-[var(--neumorphic-surface)] flex items-center justify-between">
              <div>
                <span className="font-semibold text-[var(--neumorphic-text)]">{med.name}</span>
                {med.dosage && <span className="text-sm text-[var(--neumorphic-muted)] ml-2">({med.dosage})</span>}
                {med.frequency && <span className="text-sm text-[var(--neumorphic-muted)] ml-2">- {med.frequency}</span>}
              </div>
              <button
                onClick={() => removeMedication(index)}
                className="text-red-500 hover:text-red-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      </NeumorphicCard>

      {/* Allergies */}
      <NeumorphicCard variant="raised" className="p-6">
        <h3 className="text-lg font-semibold text-[var(--neumorphic-text)] mb-4">
          Allergies
        </h3>
        <div className="flex gap-2 mb-4">
          <Input
            value={newAllergy}
            onChange={(e) => setNewAllergy(e.target.value)}
            placeholder="Enter allergy"
            onKeyPress={(e) => e.key === 'Enter' && addAllergy()}
          />
          <Button onClick={addAllergy} className="bg-gradient-to-r from-teal-500 to-emerald-600 text-white">
            <Plus className="w-4 h-4" />
          </Button>
        </div>
        <div className="flex flex-wrap gap-2">
          {allergies.map((allergy, index) => (
            <Badge key={index} className="bg-red-500 text-white">
              {allergy}
              <button
                onClick={() => removeAllergy(index)}
                className="ml-2 hover:bg-red-600 rounded-full"
              >
                <X className="w-3 h-3" />
              </button>
            </Badge>
          ))}
        </div>
      </NeumorphicCard>

      {/* Surgeries */}
      <NeumorphicCard variant="raised" className="p-6">
        <h3 className="text-lg font-semibold text-[var(--neumorphic-text)] mb-4">
          Surgeries
        </h3>
        <div className="space-y-3 mb-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            <Input
              value={newSurgery.type}
              onChange={(e) => setNewSurgery({ ...newSurgery, type: e.target.value })}
              placeholder="Surgery type"
            />
            <Input
              type="date"
              value={newSurgery.date}
              onChange={(e) => setNewSurgery({ ...newSurgery, date: e.target.value })}
              placeholder="Date"
            />
          </div>
          <Button onClick={addSurgery} className="bg-gradient-to-r from-teal-500 to-emerald-600 text-white">
            <Plus className="w-4 h-4 mr-2" />
            Add Surgery
          </Button>
        </div>
        <div className="space-y-2">
          {surgeries.map((surgery, index) => (
            <div key={index} className="p-3 rounded-lg bg-[var(--neumorphic-surface)] flex items-center justify-between">
              <div>
                <span className="font-semibold text-[var(--neumorphic-text)]">{surgery.type}</span>
                {surgery.date && (
                  <span className="text-sm text-[var(--neumorphic-muted)] ml-2">
                    ({new Date(surgery.date).toLocaleDateString()})
                  </span>
                )}
              </div>
              <button
                onClick={() => removeSurgery(index)}
                className="text-red-500 hover:text-red-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      </NeumorphicCard>

      {/* Pregnancy Status */}
      <NeumorphicCard variant="raised" className="p-6">
        <h3 className="text-lg font-semibold text-[var(--neumorphic-text)] mb-4">
          Pregnancy Status
        </h3>
        <Select value={pregnancyStatus || 'not_applicable'} onValueChange={(value) => setPregnancyStatus(value === 'not_applicable' ? '' : value)}>
          <SelectTrigger>
            <SelectValue placeholder="Select pregnancy status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="not_applicable">Not applicable</SelectItem>
            <SelectItem value="not_pregnant">Not pregnant</SelectItem>
            <SelectItem value="pregnant">Pregnant</SelectItem>
            <SelectItem value="postpartum">Postpartum</SelectItem>
          </SelectContent>
        </Select>
      </NeumorphicCard>

      {/* Contraindications */}
      <NeumorphicCard variant="raised" className="p-6">
        <h3 className="text-lg font-semibold text-[var(--neumorphic-text)] mb-4">
          Contraindications
        </h3>
        <div className="flex gap-2 mb-4">
          <Input
            value={newContraindication}
            onChange={(e) => setNewContraindication(e.target.value)}
            placeholder="Enter contraindication"
            onKeyPress={(e) => e.key === 'Enter' && addContraindication()}
          />
          <Button onClick={addContraindication} className="bg-gradient-to-r from-teal-500 to-emerald-600 text-white">
            <Plus className="w-4 h-4" />
          </Button>
        </div>
        <div className="flex flex-wrap gap-2">
          {contraindications.map((contraindication, index) => (
            <Badge key={index} className="bg-orange-500 text-white">
              {contraindication}
              <button
                onClick={() => removeContraindication(index)}
                className="ml-2 hover:bg-orange-600 rounded-full"
              >
                <X className="w-3 h-3" />
              </button>
            </Badge>
          ))}
        </div>
      </NeumorphicCard>

      {/* Notes */}
      <NeumorphicCard variant="raised" className="p-6">
        <h3 className="text-lg font-semibold text-[var(--neumorphic-text)] mb-4">
          Additional Notes
        </h3>
        <Textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Any additional medical information..."
          rows={4}
        />
      </NeumorphicCard>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button
          onClick={handleSave}
          disabled={saving}
          className="bg-gradient-to-r from-teal-500 to-emerald-600 hover:from-teal-600 hover:to-emerald-700 text-white px-8"
        >
          <Save className="w-4 h-4 mr-2" />
          {saving ? 'Saving...' : 'Save Profile'}
        </Button>
      </div>
    </div>
  )
}

