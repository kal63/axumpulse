'use client'

import { Badge } from '@/components/ui/badge'
import { Label } from '@/components/ui/label'
import { FileText, CheckCircle2 } from 'lucide-react'

interface IntakeFormAnswersProps {
  formSchema: any
  answers: Record<string, any>
}

export function IntakeFormAnswers({ formSchema, answers }: IntakeFormAnswersProps) {
  if (!answers || Object.keys(answers).length === 0) {
    return (
      <div className="text-sm text-[var(--neumorphic-muted)] italic">
        No answers provided
      </div>
    )
  }

  // If no schema, display answers in a simple format
  if (!formSchema || !formSchema.sections || formSchema.sections.length === 0) {
    return (
      <div className="space-y-4">
        {Object.entries(answers).map(([key, value]) => (
          <div key={key} className="space-y-1">
            <Label className="text-sm font-medium text-[var(--neumorphic-muted)] capitalize">
              {key.replace(/([A-Z])/g, ' $1').replace(/[_-]/g, ' ').trim()}
            </Label>
            <div className="mt-1">
              {typeof value === 'object' && value !== null ? (
                <div className="p-3 bg-[var(--neumorphic-bg)] rounded-lg border border-[var(--neumorphic-muted)]/20">
                  {Array.isArray(value) ? (
                    <div className="flex flex-wrap gap-2">
                      {value.map((item: any, idx: number) => (
                        <Badge key={idx} variant="secondary" className="bg-teal-500/20 text-teal-700 dark:text-teal-300 border-teal-500/30">
                          {String(item)}
                        </Badge>
                      ))}
                    </div>
                  ) : (
                    <pre className="text-xs text-[var(--neumorphic-text)] overflow-auto">
                      {JSON.stringify(value, null, 2)}
                    </pre>
                  )}
                </div>
              ) : (
                <span className="text-[var(--neumorphic-text)]">{String(value)}</span>
              )}
            </div>
          </div>
        ))}
      </div>
    )
  }

  const sections = formSchema.sections || []
  
  // Create a map of field IDs to field definitions for quick lookup
  const fieldMap = new Map<string, any>()
  sections.forEach((section: any) => {
    section.fields?.forEach((field: any) => {
      fieldMap.set(field.id, field)
    })
  })

  // Helper function to get option label from value
  const getOptionLabel = (field: any, value: any): string => {
    if (!field.options) return String(value)
    const option = field.options.find((opt: any) => opt.value === value)
    return option ? option.label : String(value)
  }

  // Helper function to format answer value
  const formatAnswer = (field: any, value: any): React.ReactNode => {
    if (value === null || value === undefined || value === '') {
      return <span className="text-[var(--neumorphic-muted)] italic">Not answered</span>
    }

    switch (field.type) {
      case 'checkbox':
        if (Array.isArray(value)) {
          if (value.length === 0) {
            return <span className="text-[var(--neumorphic-muted)] italic">None selected</span>
          }
          return (
            <div className="flex flex-wrap gap-2">
              {value.map((val: any, idx: number) => (
                <Badge key={idx} variant="secondary" className="bg-teal-500/20 text-teal-700 dark:text-teal-300 border-teal-500/30">
                  {getOptionLabel(field, val)}
                </Badge>
              ))}
            </div>
          )
        }
        return <span>{String(value)}</span>

      case 'radio':
      case 'select':
        return (
          <Badge variant="secondary" className="bg-blue-500/20 text-blue-700 dark:text-blue-300 border-blue-500/30">
            {getOptionLabel(field, value)}
          </Badge>
        )

      case 'textarea':
        return (
          <div className="mt-1 p-3 bg-[var(--neumorphic-bg)] rounded-lg border border-[var(--neumorphic-muted)]/20">
            <p className="text-sm text-[var(--neumorphic-text)] whitespace-pre-wrap">{String(value)}</p>
          </div>
        )

      case 'number':
        return <span className="font-medium">{String(value)}</span>

      case 'text':
      default:
        return <span className="text-[var(--neumorphic-text)]">{String(value)}</span>
    }
  }

  // Render answers organized by sections
  return (
    <div className="space-y-6">
      {sections.map((section: any, sectionIdx: number) => {
        const sectionFields = section.fields || []
        const sectionAnswers = sectionFields
          .map((field: any) => ({
            field,
            value: answers[field.id]
          }))
          .filter((item: any) => item.value !== null && item.value !== undefined && item.value !== '')

        // Skip sections with no answers
        if (sectionAnswers.length === 0) {
          return null
        }

        return (
          <div key={sectionIdx} className="space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-[var(--neumorphic-muted)]/20">
              <FileText className="w-4 h-4 text-teal-500" />
              <h3 className="text-lg font-semibold text-[var(--neumorphic-text)]">
                {section.title || `Section ${sectionIdx + 1}`}
              </h3>
            </div>
            {section.description && (
              <p className="text-sm text-[var(--neumorphic-muted)] mb-3">
                {section.description}
              </p>
            )}
            <div className="space-y-4 pl-2">
              {sectionFields.map((field: any) => {
                const value = answers[field.id]
                // Show field even if empty if it was required
                if (value === null || value === undefined || value === '') {
                  if (!field.required) return null
                }

                return (
                  <div key={field.id} className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Label className="text-sm font-medium text-[var(--neumorphic-muted)]">
                        {field.label}
                        {field.required && (
                          <span className="text-red-500 ml-1">*</span>
                        )}
                      </Label>
                      {value !== null && value !== undefined && value !== '' && (
                        <CheckCircle2 className="w-3 h-3 text-green-500" />
                      )}
                    </div>
                    <div className="mt-1">
                      {formatAnswer(field, value)}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )
      })}

      {/* Show any answers that don't match schema fields */}
      {Object.keys(answers).some(key => !fieldMap.has(key)) && (
        <div className="mt-6 pt-6 border-t border-[var(--neumorphic-muted)]/20">
          <h3 className="text-lg font-semibold text-[var(--neumorphic-text)] mb-4">
            Additional Information
          </h3>
          <div className="space-y-3">
            {Object.entries(answers).map(([key, value]) => {
              if (fieldMap.has(key)) return null
              return (
                <div key={key} className="space-y-1">
                  <Label className="text-sm font-medium text-[var(--neumorphic-muted)] capitalize">
                    {key.replace(/([A-Z])/g, ' $1').trim()}
                  </Label>
                  <div className="mt-1">
                    {typeof value === 'object' ? (
                      <div className="p-3 bg-[var(--neumorphic-bg)] rounded-lg border border-[var(--neumorphic-muted)]/20">
                        <pre className="text-xs text-[var(--neumorphic-text)] overflow-auto">
                          {JSON.stringify(value, null, 2)}
                        </pre>
                      </div>
                    ) : (
                      <span className="text-[var(--neumorphic-text)]">{String(value)}</span>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}

