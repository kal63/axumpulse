'use client'

import { useState } from 'react'
import { NeumorphicCard } from '@/components/user/NeumorphicCard'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Checkbox } from '@/components/ui/checkbox'
import { Progress } from '@/components/ui/progress'
import { ChevronLeft, ChevronRight, Check } from 'lucide-react'

interface IntakeFormWizardProps {
  formSchema: any
  onSubmit: (answers: Record<string, any>) => Promise<void>
  onCancel?: () => void
}

export function IntakeFormWizard({ formSchema, onSubmit, onCancel }: IntakeFormWizardProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const [answers, setAnswers] = useState<Record<string, any>>({})
  const [submitting, setSubmitting] = useState(false)

  const steps = formSchema.sections || []
  const totalSteps = steps.length

  const handleNext = () => {
    if (currentStep < totalSteps - 1) {
      setCurrentStep(currentStep + 1)
    }
  }

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleSubmit = async () => {
    setSubmitting(true)
    try {
      await onSubmit(answers)
    } finally {
      setSubmitting(false)
    }
  }

  const updateAnswer = (fieldId: string, value: any) => {
    setAnswers({ ...answers, [fieldId]: value })
  }

  const renderField = (field: any) => {
    switch (field.type) {
      case 'text':
        return (
          <div key={field.id} className="mb-4">
            <Label htmlFor={field.id}>{field.label}</Label>
            <Input
              id={field.id}
              value={answers[field.id] || ''}
              onChange={(e) => updateAnswer(field.id, e.target.value)}
              placeholder={field.placeholder}
              required={field.required}
            />
          </div>
        )

      case 'textarea':
        return (
          <div key={field.id} className="mb-4">
            <Label htmlFor={field.id}>{field.label}</Label>
            <Textarea
              id={field.id}
              value={answers[field.id] || ''}
              onChange={(e) => updateAnswer(field.id, e.target.value)}
              placeholder={field.placeholder}
              rows={4}
              required={field.required}
            />
          </div>
        )

      case 'select':
        return (
          <div key={field.id} className="mb-4">
            <Label htmlFor={field.id}>{field.label}</Label>
            <Select
              value={answers[field.id] || ''}
              onValueChange={(value) => updateAnswer(field.id, value)}
            >
              <SelectTrigger>
                <SelectValue placeholder={field.placeholder || 'Select...'} />
              </SelectTrigger>
              <SelectContent>
                {field.options?.map((option: any) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )

      case 'radio':
        return (
          <div key={field.id} className="mb-4">
            <Label>{field.label}</Label>
            <RadioGroup
              value={answers[field.id] || ''}
              onValueChange={(value) => updateAnswer(field.id, value)}
            >
              {field.options?.map((option: any) => (
                <div key={option.value} className="flex items-center space-x-2">
                  <RadioGroupItem value={option.value} id={`${field.id}-${option.value}`} />
                  <Label htmlFor={`${field.id}-${option.value}`} className="font-normal">
                    {option.label}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>
        )

      case 'checkbox':
        return (
          <div key={field.id} className="mb-4">
            <Label>{field.label}</Label>
            <div className="space-y-2 mt-2">
              {field.options?.map((option: any) => (
                <div key={option.value} className="flex items-center space-x-2">
                  <Checkbox
                    id={`${field.id}-${option.value}`}
                    checked={(answers[field.id] || []).includes(option.value)}
                    onCheckedChange={(checked) => {
                      const current = answers[field.id] || []
                      if (checked) {
                        updateAnswer(field.id, [...current, option.value])
                      } else {
                        updateAnswer(field.id, current.filter((v: any) => v !== option.value))
                      }
                    }}
                  />
                  <Label htmlFor={`${field.id}-${option.value}`} className="font-normal">
                    {option.label}
                  </Label>
                </div>
              ))}
            </div>
          </div>
        )

      case 'number':
        return (
          <div key={field.id} className="mb-4">
            <Label htmlFor={field.id}>{field.label}</Label>
            <Input
              id={field.id}
              type="number"
              value={answers[field.id] || ''}
              onChange={(e) => updateAnswer(field.id, parseFloat(e.target.value) || 0)}
              placeholder={field.placeholder}
              required={field.required}
            />
          </div>
        )

      default:
        return null
    }
  }

  const currentSection = steps[currentStep]

  return (
    <div className="space-y-6">
      {/* Progress */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-[var(--neumorphic-text)]">
            Step {currentStep + 1} of {totalSteps}
          </span>
          <span className="text-sm text-[var(--neumorphic-muted)]">
            {Math.round(((currentStep + 1) / totalSteps) * 100)}%
          </span>
        </div>
        <Progress value={((currentStep + 1) / totalSteps) * 100} />
      </div>

      {/* Current Section */}
      <NeumorphicCard variant="raised" className="p-6">
        <h2 className="text-2xl font-bold text-[var(--neumorphic-text)] mb-6">
          {currentSection?.title || `Section ${currentStep + 1}`}
        </h2>
        {currentSection?.description && (
          <p className="text-[var(--neumorphic-muted)] mb-6">
            {currentSection.description}
          </p>
        )}

        <div className="space-y-4">
          {currentSection?.fields?.map((field: any) => renderField(field))}
        </div>
      </NeumorphicCard>

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <div>
          {onCancel && (
            <Button onClick={onCancel} variant="ghost">
              Cancel
            </Button>
          )}
        </div>
        <div className="flex gap-2">
          {currentStep > 0 && (
            <Button onClick={handlePrevious} variant="outline">
              <ChevronLeft className="w-4 h-4 mr-2" />
              Previous
            </Button>
          )}
          {currentStep < totalSteps - 1 ? (
            <Button
              onClick={handleNext}
              className="bg-gradient-to-r from-teal-500 to-emerald-600 hover:from-teal-600 hover:to-emerald-700 text-white"
            >
              Next
              <ChevronRight className="w-4 h-4 ml-2" />
            </Button>
          ) : (
            <Button
              onClick={handleSubmit}
              disabled={submitting}
              className="bg-gradient-to-r from-teal-500 to-emerald-600 hover:from-teal-600 hover:to-emerald-700 text-white"
            >
              {submitting ? 'Submitting...' : 'Submit'}
              <Check className="w-4 h-4 ml-2" />
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}

