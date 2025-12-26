'use client'

import { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { NeumorphicCard } from '@/components/user/NeumorphicCard'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { 
  Plus, 
  Trash2, 
  GripVertical, 
  Eye, 
  FileText, 
  Type, 
  Hash, 
  List, 
  Radio, 
  CheckSquare,
  ChevronDown,
  ChevronUp,
  Copy,
  X
} from 'lucide-react'
import { IntakeFormWizard } from './IntakeFormWizard'

interface Field {
  id: string
  type: 'text' | 'textarea' | 'number' | 'select' | 'radio' | 'checkbox'
  label: string
  required: boolean
  placeholder?: string
  options?: Array<{ label: string; value: string }>
}

interface Section {
  id: string
  title: string
  description?: string
  fields: Field[]
}

interface FormSchema {
  title: string
  description: string
  sections: Section[]
}

interface IntakeFormBuilderProps {
  initialSchema?: FormSchema
  onSchemaChange?: (schema: FormSchema) => void
}

const FIELD_TYPES = [
  { value: 'text', label: 'Text Input', icon: Type },
  { value: 'textarea', label: 'Text Area', icon: FileText },
  { value: 'number', label: 'Number', icon: Hash },
  { value: 'select', label: 'Dropdown', icon: List },
  { value: 'radio', label: 'Radio Buttons', icon: Radio },
  { value: 'checkbox', label: 'Checkboxes', icon: CheckSquare },
] as const

export function IntakeFormBuilder({ initialSchema, onSchemaChange }: IntakeFormBuilderProps) {
  const [schema, setSchema] = useState<FormSchema>(initialSchema || {
    title: '',
    description: '',
    sections: []
  })
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set())
  const [showPreview, setShowPreview] = useState(false)
  const [editingField, setEditingField] = useState<{ sectionId: string; fieldId: string } | null>(null)

  const generateId = (prefix: string = 'field') => `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  
  const generateFieldIdFromLabel = (label: string): string => {
    return label
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '_')
      .replace(/^_+|_+$/g, '')
      .substring(0, 50) || `field_${Date.now()}`
  }

  const updateSchema = useCallback((newSchema: FormSchema) => {
    setSchema(newSchema)
    onSchemaChange?.(newSchema)
  }, [onSchemaChange])

  const toggleSection = (sectionId: string) => {
    const newExpanded = new Set(expandedSections)
    if (newExpanded.has(sectionId)) {
      newExpanded.delete(sectionId)
    } else {
      newExpanded.add(sectionId)
    }
    setExpandedSections(newExpanded)
  }

  const addSection = () => {
    const newSection: Section = {
      id: generateId('section'),
      title: 'New Section',
      description: '',
      fields: []
    }
    const newSchema = {
      ...schema,
      sections: [...schema.sections, newSection]
    }
    updateSchema(newSchema)
    setExpandedSections(new Set([...expandedSections, newSection.id]))
  }

  const updateSection = (sectionId: string, updates: Partial<Section>) => {
    const newSchema = {
      ...schema,
      sections: schema.sections.map(s =>
        s.id === sectionId ? { ...s, ...updates } : s
      )
    }
    updateSchema(newSchema)
  }

  const deleteSection = (sectionId: string) => {
    const newSchema = {
      ...schema,
      sections: schema.sections.filter(s => s.id !== sectionId)
    }
    updateSchema(newSchema)
    const newExpanded = new Set(expandedSections)
    newExpanded.delete(sectionId)
    setExpandedSections(newExpanded)
  }

  const duplicateSection = (sectionId: string) => {
    const section = schema.sections.find(s => s.id === sectionId)
    if (!section) return
    
    const newSection: Section = {
      ...section,
      id: generateId('section'),
      fields: section.fields.map(f => ({
        ...f,
        id: generateId('field'),
        options: f.options ? f.options.map(opt => ({ ...opt })) : undefined
      }))
    }
    const newSchema = {
      ...schema,
      sections: [...schema.sections, newSection]
    }
    updateSchema(newSchema)
  }

  const addField = (sectionId: string) => {
    const newField: Field = {
      id: generateId('field'),
      type: 'text',
      label: 'New Field',
      required: false,
      placeholder: ''
    }
    const newSchema = {
      ...schema,
      sections: schema.sections.map(s =>
        s.id === sectionId
          ? { ...s, fields: [...s.fields, newField] }
          : s
      )
    }
    updateSchema(newSchema)
    setEditingField({ sectionId, fieldId: newField.id })
  }

  const updateField = (sectionId: string, fieldId: string, updates: Partial<Field>) => {
    const newSchema = {
      ...schema,
      sections: schema.sections.map(s =>
        s.id === sectionId
          ? {
              ...s,
              fields: s.fields.map(f =>
                f.id === fieldId ? { ...f, ...updates } : f
              )
            }
          : s
      )
    }
    updateSchema(newSchema)
  }

  const deleteField = (sectionId: string, fieldId: string) => {
    const newSchema = {
      ...schema,
      sections: schema.sections.map(s =>
        s.id === sectionId
          ? { ...s, fields: s.fields.filter(f => f.id !== fieldId) }
          : s
      )
    }
    updateSchema(newSchema)
    if (editingField?.fieldId === fieldId) {
      setEditingField(null)
    }
  }

  const duplicateField = (sectionId: string, fieldId: string) => {
    const section = schema.sections.find(s => s.id === sectionId)
    const field = section?.fields.find(f => f.id === fieldId)
    if (!field) return

    const newField: Field = {
      ...field,
      id: generateId('field'),
      options: field.options ? field.options.map(opt => ({ ...opt })) : undefined
    }
    const newSchema = {
      ...schema,
      sections: schema.sections.map(s =>
        s.id === sectionId
          ? { ...s, fields: [...s.fields, newField] }
          : s
      )
    }
    updateSchema(newSchema)
  }

  const addOption = (sectionId: string, fieldId: string) => {
    const section = schema.sections.find(s => s.id === sectionId)
    const field = section?.fields.find(f => f.id === fieldId)
    if (!field) return

    const newOption = {
      label: 'New Option',
      value: `option_${Date.now()}`
    }
    const newSchema = {
      ...schema,
      sections: schema.sections.map(s =>
        s.id === sectionId
          ? {
              ...s,
              fields: s.fields.map(f =>
                f.id === fieldId
                  ? {
                      ...f,
                      options: [...(f.options || []), newOption]
                    }
                  : f
              )
            }
          : s
      )
    }
    updateSchema(newSchema)
  }

  const updateOption = (sectionId: string, fieldId: string, optionIndex: number, updates: { label?: string; value?: string }) => {
    const newSchema = {
      ...schema,
      sections: schema.sections.map(s =>
        s.id === sectionId
          ? {
              ...s,
              fields: s.fields.map(f =>
                f.id === fieldId
                  ? {
                      ...f,
                      options: f.options?.map((opt, idx) =>
                        idx === optionIndex ? { ...opt, ...updates } : opt
                      )
                    }
                  : f
              )
            }
          : s
      )
    }
    updateSchema(newSchema)
  }

  const deleteOption = (sectionId: string, fieldId: string, optionIndex: number) => {
    const newSchema = {
      ...schema,
      sections: schema.sections.map(s =>
        s.id === sectionId
          ? {
              ...s,
              fields: s.fields.map(f =>
                f.id === fieldId
                  ? {
                      ...f,
                      options: f.options?.filter((_, idx) => idx !== optionIndex)
                    }
                  : f
              )
            }
          : s
      )
    }
    updateSchema(newSchema)
  }

  const moveSection = (fromIndex: number, toIndex: number) => {
    const newSections = [...schema.sections]
    const [moved] = newSections.splice(fromIndex, 1)
    newSections.splice(toIndex, 0, moved)
    const newSchema = { ...schema, sections: newSections }
    updateSchema(newSchema)
  }

  const moveField = (sectionId: string, fromIndex: number, toIndex: number) => {
    const newSchema = {
      ...schema,
      sections: schema.sections.map(s => {
        if (s.id !== sectionId) return s
        const newFields = [...s.fields]
        const [moved] = newFields.splice(fromIndex, 1)
        newFields.splice(toIndex, 0, moved)
        return { ...s, fields: newFields }
      })
    }
    updateSchema(newSchema)
  }

  const getFieldTypeIcon = (type: string) => {
    const fieldType = FIELD_TYPES.find(ft => ft.value === type)
    return fieldType?.icon || Type
  }

  const needsOptions = (type: string) => {
    return ['select', 'radio', 'checkbox'].includes(type)
  }

  if (showPreview) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-bold text-[var(--neumorphic-text)]">Form Preview</h3>
          <Button
            variant="outline"
            onClick={() => setShowPreview(false)}
          >
            <X className="w-4 h-4 mr-2" />
            Close Preview
          </Button>
        </div>
        <NeumorphicCard variant="raised" className="p-6">
          <IntakeFormWizard
            formSchema={schema}
            onSubmit={async () => {
              alert('This is a preview. Form submission is disabled.')
            }}
            onCancel={() => setShowPreview(false)}
          />
        </NeumorphicCard>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Form Metadata */}
      <NeumorphicCard variant="raised" className="p-6">
        <div className="space-y-4">
          <div>
            <Label className="text-[var(--neumorphic-text)]">Form Title *</Label>
            <Input
              value={schema.title}
              onChange={(e) => updateSchema({ ...schema, title: e.target.value })}
              placeholder="e.g., General Health Intake Form"
            />
          </div>
          <div>
            <Label className="text-[var(--neumorphic-text)]">Form Description</Label>
            <Textarea
              value={schema.description}
              onChange={(e) => updateSchema({ ...schema, description: e.target.value })}
              placeholder="Brief description of what this form is for"
              rows={3}
            />
          </div>
        </div>
      </NeumorphicCard>

      {/* Sections */}
      <div className="space-y-4">
        {schema.sections.map((section, sectionIndex) => {
          const isExpanded = expandedSections.has(section.id)
          const Icon = isExpanded ? ChevronUp : ChevronDown

          return (
            <motion.div
              key={section.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
            >
              <NeumorphicCard variant="raised" className="p-6">
                {/* Section Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleSection(section.id)}
                        className="p-1"
                      >
                        <Icon className="w-4 h-4" />
                      </Button>
                      <Input
                        value={section.title}
                        onChange={(e) => updateSection(section.id, { title: e.target.value })}
                        placeholder="Section Title"
                        className="font-semibold text-lg border-none bg-transparent p-0 h-auto focus-visible:ring-0"
                      />
                    </div>
                    {isExpanded && (
                      <Textarea
                        value={section.description || ''}
                        onChange={(e) => updateSection(section.id, { description: e.target.value })}
                        placeholder="Section description (optional)"
                        rows={2}
                        className="text-sm"
                      />
                    )}
                  </div>
                  <div className="flex items-center gap-2 ml-4">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => duplicateSection(section.id)}
                      title="Duplicate Section"
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => deleteSection(section.id)}
                      className="text-red-500 hover:text-red-600"
                      title="Delete Section"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                {/* Fields */}
                {isExpanded && (
                  <div className="space-y-4 mt-4 pl-6 border-l-2 border-teal-500/30">
                    {section.fields.map((field, fieldIndex) => {
                      const FieldIcon = getFieldTypeIcon(field.type)
                      const isEditing = editingField?.sectionId === section.id && editingField?.fieldId === field.id

                      return (
                        <motion.div
                          key={field.id}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="space-y-3"
                        >
                          <div className="flex items-start gap-3 p-3 bg-[var(--neumorphic-bg)] rounded-lg border border-[var(--neumorphic-muted)]/20">
                            <div className="flex items-center gap-2 flex-1">
                              <FieldIcon className="w-4 h-4 text-teal-500 flex-shrink-0" />
                              <div className="flex-1 space-y-2">
                                {isEditing ? (
                                  <div className="space-y-3">
                                    {/* Field Configuration */}
                                    <div className="grid grid-cols-2 gap-3">
                                      <div>
                                        <Label className="text-xs text-[var(--neumorphic-muted)]">Field Type</Label>
                                        <Select
                                          value={field.type}
                                          onValueChange={(value: Field['type']) => {
                                            const updates: Partial<Field> = { type: value }
                                            if (!needsOptions(value) && field.options) {
                                              updates.options = undefined
                                            }
                                            updateField(section.id, field.id, updates)
                                          }}
                                        >
                                          <SelectTrigger className="h-8">
                                            <SelectValue />
                                          </SelectTrigger>
                                          <SelectContent>
                                            {FIELD_TYPES.map(ft => {
                                              const Icon = ft.icon
                                              return (
                                                <SelectItem key={ft.value} value={ft.value}>
                                                  <div className="flex items-center gap-2">
                                                    <Icon className="w-3 h-3" />
                                                    <span>{ft.label}</span>
                                                  </div>
                                                </SelectItem>
                                              )
                                            })}
                                          </SelectContent>
                                        </Select>
                                      </div>
                                      <div>
                                        <Label className="text-xs text-[var(--neumorphic-muted)]">Required</Label>
                                        <Select
                                          value={field.required ? 'true' : 'false'}
                                          onValueChange={(value) => updateField(section.id, field.id, { required: value === 'true' })}
                                        >
                                          <SelectTrigger className="h-8">
                                            <SelectValue />
                                          </SelectTrigger>
                                          <SelectContent>
                                            <SelectItem value="true">Required</SelectItem>
                                            <SelectItem value="false">Optional</SelectItem>
                                          </SelectContent>
                                        </Select>
                                      </div>
                                    </div>
                                    <div>
                                      <Label className="text-xs text-[var(--neumorphic-muted)]">Field Label *</Label>
                                      <Input
                                        value={field.label}
                                        onChange={(e) => updateField(section.id, field.id, { label: e.target.value })}
                                        placeholder="Field label"
                                        className="h-8"
                                      />
                                    </div>
                                    {field.type !== 'textarea' && field.type !== 'checkbox' && (
                                      <div>
                                        <Label className="text-xs text-[var(--neumorphic-muted)]">Placeholder</Label>
                                        <Input
                                          value={field.placeholder || ''}
                                          onChange={(e) => updateField(section.id, field.id, { placeholder: e.target.value })}
                                          placeholder="Placeholder text"
                                          className="h-8"
                                        />
                                      </div>
                                    )}
                                    {needsOptions(field.type) && (
                                      <div>
                                        <Label className="text-xs text-[var(--neumorphic-muted)] mb-2 block">
                                          Options
                                        </Label>
                                        <div className="space-y-2">
                                          {field.options?.map((option, optIndex) => (
                                            <div key={optIndex} className="flex items-center gap-2">
                                              <Input
                                                value={option.label}
                                                onChange={(e) => updateOption(section.id, field.id, optIndex, { label: e.target.value })}
                                                placeholder="Option label"
                                                className="h-8 flex-1"
                                              />
                                              <Input
                                                value={option.value}
                                                onChange={(e) => updateOption(section.id, field.id, optIndex, { value: e.target.value })}
                                                placeholder="value"
                                                className="h-8 w-32 font-mono text-xs"
                                              />
                                              <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => deleteOption(section.id, field.id, optIndex)}
                                                className="text-red-500 hover:text-red-600 h-8 w-8 p-0"
                                              >
                                                <X className="w-3 h-3" />
                                              </Button>
                                            </div>
                                          ))}
                                          <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => addOption(section.id, field.id)}
                                            className="w-full h-8"
                                          >
                                            <Plus className="w-3 h-3 mr-1" />
                                            Add Option
                                          </Button>
                                        </div>
                                      </div>
                                    )}
                                    <div className="flex items-center gap-2 pt-2">
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => setEditingField(null)}
                                        className="flex-1"
                                      >
                                        Done
                                      </Button>
                                    </div>
                                  </div>
                                ) : (
                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                      <span className="font-medium text-[var(--neumorphic-text)]">{field.label}</span>
                                      <Badge variant="outline" className="text-xs">
                                        {FIELD_TYPES.find(ft => ft.value === field.type)?.label}
                                      </Badge>
                                      {field.required && (
                                        <Badge variant="outline" className="text-xs text-red-500 border-red-500">
                                          Required
                                        </Badge>
                                      )}
                                    </div>
                                    <div className="flex items-center gap-1">
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => duplicateField(section.id, field.id)}
                                        className="h-7 w-7 p-0"
                                        title="Duplicate Field"
                                      >
                                        <Copy className="w-3 h-3" />
                                      </Button>
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => setEditingField({ sectionId: section.id, fieldId: field.id })}
                                        className="h-7 w-7 p-0"
                                        title="Edit Field"
                                      >
                                        <FileText className="w-3 h-3" />
                                      </Button>
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => deleteField(section.id, field.id)}
                                        className="h-7 w-7 p-0 text-red-500 hover:text-red-600"
                                        title="Delete Field"
                                      >
                                        <Trash2 className="w-3 h-3" />
                                      </Button>
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      )
                    })}
                    <Button
                      variant="outline"
                      onClick={() => addField(section.id)}
                      className="w-full"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Add Field
                    </Button>
                  </div>
                )}
              </NeumorphicCard>
            </motion.div>
          )
        })}

        <Button
          variant="outline"
          onClick={addSection}
          className="w-full border-dashed"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Section
        </Button>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-end gap-4">
        <Button
          variant="outline"
          onClick={() => setShowPreview(true)}
          disabled={schema.sections.length === 0}
        >
          <Eye className="w-4 h-4 mr-2" />
          Preview Form
        </Button>
      </div>
    </div>
  )
}

