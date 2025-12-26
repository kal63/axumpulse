'use client'

import { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { NeumorphicCard } from '@/components/user/NeumorphicCard'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { 
  Plus, 
  Trash2, 
  X,
  Copy,
  AlertCircle,
  MessageSquare,
  Settings,
  CheckCircle
} from 'lucide-react'

interface Condition {
  field: string
  operator: 'eq' | 'neq' | 'gt' | 'lt' | 'gte' | 'lte' | 'includes' | 'exists' | 'not_exists'
  value?: string | number
}

interface Action {
  type: 'set_disposition' | 'message'
  value: string
}

interface RuleDefinition {
  conditions: Condition[]
  actions: Action[]
}

interface TriageRuleBuilderProps {
  initialDefinition?: RuleDefinition
  onDefinitionChange?: (definition: RuleDefinition) => void
}

const OPERATORS = [
  { value: 'eq', label: 'Equals (==)', description: 'Field equals value' },
  { value: 'neq', label: 'Not Equals (!=)', description: 'Field does not equal value' },
  { value: 'gt', label: 'Greater Than (>)', description: 'Field is greater than value' },
  { value: 'lt', label: 'Less Than (<)', description: 'Field is less than value' },
  { value: 'gte', label: 'Greater or Equal (>=)', description: 'Field is greater than or equal to value' },
  { value: 'lte', label: 'Less or Equal (<=)', description: 'Field is less than or equal to value' },
  { value: 'includes', label: 'Includes', description: 'Field includes value (for arrays/strings)' },
  { value: 'exists', label: 'Exists', description: 'Field exists and is not empty' },
  { value: 'not_exists', label: 'Not Exists', description: 'Field does not exist or is empty' },
] as const

const ACTION_TYPES = [
  { value: 'set_disposition', label: 'Set Disposition', icon: Settings, description: 'Set the triage disposition' },
  { value: 'message', label: 'Add Message', icon: MessageSquare, description: 'Add a message to the triage result' },
] as const

const DISPOSITION_OPTIONS = [
  { value: 'ok', label: 'OK - No action needed' },
  { value: 'book_consult', label: 'Book Consultation - Schedule a consultation' },
  { value: 'urgent_care', label: 'Urgent Care - Seek immediate medical attention' },
] as const

export function TriageRuleBuilder({ initialDefinition, onDefinitionChange }: TriageRuleBuilderProps) {
  const [definition, setDefinition] = useState<RuleDefinition>(
    initialDefinition || {
      conditions: [],
      actions: []
    }
  )
  const [editingCondition, setEditingCondition] = useState<number | null>(null)
  const [editingAction, setEditingAction] = useState<number | null>(null)

  const updateDefinition = useCallback((newDefinition: RuleDefinition) => {
    setDefinition(newDefinition)
    onDefinitionChange?.(newDefinition)
  }, [onDefinitionChange])

  const addCondition = () => {
    const newCondition: Condition = {
      field: '',
      operator: 'eq',
      value: ''
    }
    const newDefinition = {
      ...definition,
      conditions: [...definition.conditions, newCondition]
    }
    updateDefinition(newDefinition)
    setEditingCondition(definition.conditions.length)
  }

  const updateCondition = (index: number, updates: Partial<Condition>) => {
    const newDefinition = {
      ...definition,
      conditions: definition.conditions.map((cond, idx) =>
        idx === index ? { ...cond, ...updates } : cond
      )
    }
    updateDefinition(newDefinition)
  }

  const deleteCondition = (index: number) => {
    const newDefinition = {
      ...definition,
      conditions: definition.conditions.filter((_, idx) => idx !== index)
    }
    updateDefinition(newDefinition)
    if (editingCondition === index) {
      setEditingCondition(null)
    } else if (editingCondition !== null && editingCondition > index) {
      setEditingCondition(editingCondition - 1)
    }
  }

  const duplicateCondition = (index: number) => {
    const condition = definition.conditions[index]
    const newDefinition = {
      ...definition,
      conditions: [...definition.conditions, { ...condition }]
    }
    updateDefinition(newDefinition)
  }

  const addAction = () => {
    const newAction: Action = {
      type: 'message',
      value: ''
    }
    const newDefinition = {
      ...definition,
      actions: [...definition.actions, newAction]
    }
    updateDefinition(newDefinition)
    setEditingAction(definition.actions.length)
  }

  const updateAction = (index: number, updates: Partial<Action>) => {
    const newDefinition = {
      ...definition,
      actions: definition.actions.map((action, idx) =>
        idx === index ? { ...action, ...updates } : action
      )
    }
    updateDefinition(newDefinition)
  }

  const deleteAction = (index: number) => {
    const newDefinition = {
      ...definition,
      actions: definition.actions.filter((_, idx) => idx !== index)
    }
    updateDefinition(newDefinition)
    if (editingAction === index) {
      setEditingAction(null)
    } else if (editingAction !== null && editingAction > index) {
      setEditingAction(editingAction - 1)
    }
  }

  const duplicateAction = (index: number) => {
    const action = definition.actions[index]
    const newDefinition = {
      ...definition,
      actions: [...definition.actions, { ...action }]
    }
    updateDefinition(newDefinition)
  }

  const needsValue = (operator: string) => {
    return !['exists', 'not_exists'].includes(operator)
  }

  const getOperatorLabel = (operator: string) => {
    return OPERATORS.find(op => op.value === operator)?.label || operator
  }

  const getActionTypeLabel = (type: string) => {
    return ACTION_TYPES.find(at => at.value === type)?.label || type
  }

  return (
    <div className="space-y-6">
      {/* Conditions Section */}
      <NeumorphicCard variant="raised" className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-teal-500" />
            <h3 className="text-lg font-semibold text-[var(--neumorphic-text)]">Conditions</h3>
            <Badge variant="outline" className="ml-2">
              {definition.conditions.length} condition{definition.conditions.length !== 1 ? 's' : ''}
            </Badge>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={addCondition}
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Condition
          </Button>
        </div>
        <p className="text-sm text-[var(--neumorphic-muted)] mb-4">
          All conditions must be met for the rule to trigger (AND logic)
        </p>

        {definition.conditions.length === 0 ? (
          <div className="text-center py-8 text-[var(--neumorphic-muted)]">
            <AlertCircle className="w-12 h-12 mx-auto mb-2 opacity-50" />
            <p>No conditions defined. Add at least one condition to evaluate.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {definition.conditions.map((condition, index) => {
              const isEditing = editingCondition === index
              const operatorInfo = OPERATORS.find(op => op.value === condition.operator)

              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-4 bg-[var(--neumorphic-bg)] rounded-lg border border-[var(--neumorphic-muted)]/20"
                >
                  {isEditing ? (
                    <div className="space-y-3">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        <div>
                          <Label className="text-xs text-[var(--neumorphic-muted)]">Field Path *</Label>
                          <Input
                            value={condition.field}
                            onChange={(e) => updateCondition(index, { field: e.target.value })}
                            placeholder="e.g., main_symptom or symptoms.chest_pain"
                            className="h-8 text-sm font-mono"
                          />
                          <p className="text-xs text-[var(--neumorphic-muted)] mt-1">
                            Use dot notation for nested fields
                          </p>
                        </div>
                        <div>
                          <Label className="text-xs text-[var(--neumorphic-muted)]">Operator *</Label>
                          <Select
                            value={condition.operator}
                            onValueChange={(value: Condition['operator']) => {
                              const updates: Partial<Condition> = { operator: value }
                              if (!needsValue(value)) {
                                updates.value = undefined
                              }
                              updateCondition(index, updates)
                            }}
                          >
                            <SelectTrigger className="h-8">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {OPERATORS.map(op => (
                                <SelectItem key={op.value} value={op.value}>
                                  <div>
                                    <div className="font-medium">{op.label}</div>
                                    <div className="text-xs text-gray-500">{op.description}</div>
                                  </div>
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        {needsValue(condition.operator) && (
                          <div>
                            <Label className="text-xs text-[var(--neumorphic-muted)]">Value</Label>
                            <Input
                              value={condition.value || ''}
                              onChange={(e) => {
                                const value = condition.operator === 'gt' || condition.operator === 'lt' || 
                                             condition.operator === 'gte' || condition.operator === 'lte'
                                  ? (isNaN(Number(e.target.value)) ? e.target.value : Number(e.target.value))
                                  : e.target.value
                                updateCondition(index, { value })
                              }}
                              placeholder="Value to compare"
                              className="h-8"
                              type={['gt', 'lt', 'gte', 'lte'].includes(condition.operator) ? 'number' : 'text'}
                            />
                          </div>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setEditingCondition(null)}
                          className="flex-1"
                        >
                          Done
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3 flex-1">
                        <div className="flex items-center gap-2 min-w-0 flex-1">
                          <code className="text-sm font-mono bg-[var(--neumorphic-surface)] px-2 py-1 rounded text-teal-600 dark:text-teal-400">
                            {condition.field || 'field'}
                          </code>
                          <Badge variant="outline" className="text-xs">
                            {getOperatorLabel(condition.operator)}
                          </Badge>
                          {needsValue(condition.operator) && condition.value !== undefined && (
                            <code className="text-sm font-mono bg-[var(--neumorphic-surface)] px-2 py-1 rounded text-blue-600 dark:text-blue-400">
                              {String(condition.value)}
                            </code>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => duplicateCondition(index)}
                          className="h-7 w-7 p-0"
                          title="Duplicate Condition"
                        >
                          <Copy className="w-3 h-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setEditingCondition(index)}
                          className="h-7 w-7 p-0"
                          title="Edit Condition"
                        >
                          <Settings className="w-3 h-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => deleteCondition(index)}
                          className="h-7 w-7 p-0 text-red-500 hover:text-red-600"
                          title="Delete Condition"
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  )}
                </motion.div>
              )
            })}
          </div>
        )}
      </NeumorphicCard>

      {/* Actions Section */}
      <NeumorphicCard variant="raised" className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-teal-500" />
            <h3 className="text-lg font-semibold text-[var(--neumorphic-text)]">Actions</h3>
            <Badge variant="outline" className="ml-2">
              {definition.actions.length} action{definition.actions.length !== 1 ? 's' : ''}
            </Badge>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={addAction}
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Action
          </Button>
        </div>
        <p className="text-sm text-[var(--neumorphic-muted)] mb-4">
          Actions to execute when all conditions are met
        </p>

        {definition.actions.length === 0 ? (
          <div className="text-center py-8 text-[var(--neumorphic-muted)]">
            <CheckCircle className="w-12 h-12 mx-auto mb-2 opacity-50" />
            <p>No actions defined. Add actions to execute when the rule triggers.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {definition.actions.map((action, index) => {
              const isEditing = editingAction === index
              const actionTypeInfo = ACTION_TYPES.find(at => at.value === action.type)
              const Icon = actionTypeInfo?.icon || Settings

              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-4 bg-[var(--neumorphic-bg)] rounded-lg border border-[var(--neumorphic-muted)]/20"
                >
                  {isEditing ? (
                    <div className="space-y-3">
                      <div>
                        <Label className="text-xs text-[var(--neumorphic-muted)]">Action Type *</Label>
                        <Select
                          value={action.type}
                          onValueChange={(value: Action['type']) => updateAction(index, { type: value, value: '' })}
                        >
                          <SelectTrigger className="h-8">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {ACTION_TYPES.map(at => {
                              const Icon = at.icon
                              return (
                                <SelectItem key={at.value} value={at.value}>
                                  <div className="flex items-center gap-2">
                                    <Icon className="w-4 h-4" />
                                    <div>
                                      <div className="font-medium">{at.label}</div>
                                      <div className="text-xs text-gray-500">{at.description}</div>
                                    </div>
                                  </div>
                                </SelectItem>
                              )
                            })}
                          </SelectContent>
                        </Select>
                      </div>
                      {action.type === 'set_disposition' ? (
                        <div>
                          <Label className="text-xs text-[var(--neumorphic-muted)]">Disposition *</Label>
                          <Select
                            value={action.value}
                            onValueChange={(value) => updateAction(index, { value })}
                          >
                            <SelectTrigger className="h-8">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {DISPOSITION_OPTIONS.map(opt => (
                                <SelectItem key={opt.value} value={opt.value}>
                                  {opt.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      ) : (
                        <div>
                          <Label className="text-xs text-[var(--neumorphic-muted)]">Message *</Label>
                          <Textarea
                            value={action.value}
                            onChange={(e) => updateAction(index, { value: e.target.value })}
                            placeholder="Message to display in triage results"
                            rows={3}
                            className="text-sm"
                          />
                        </div>
                      )}
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setEditingAction(null)}
                          className="flex-1"
                        >
                          Done
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3 flex-1">
                        <Icon className="w-4 h-4 text-teal-500" />
                        <div className="flex items-center gap-2 min-w-0 flex-1">
                          <Badge variant="outline" className="text-xs">
                            {getActionTypeLabel(action.type)}
                          </Badge>
                          <span className="text-sm text-[var(--neumorphic-text)] truncate">
                            {action.type === 'set_disposition' 
                              ? DISPOSITION_OPTIONS.find(opt => opt.value === action.value)?.label || action.value
                              : action.value
                            }
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => duplicateAction(index)}
                          className="h-7 w-7 p-0"
                          title="Duplicate Action"
                        >
                          <Copy className="w-3 h-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setEditingAction(index)}
                          className="h-7 w-7 p-0"
                          title="Edit Action"
                        >
                          <Settings className="w-3 h-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => deleteAction(index)}
                          className="h-7 w-7 p-0 text-red-500 hover:text-red-600"
                          title="Delete Action"
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  )}
                </motion.div>
              )
            })}
          </div>
        )}
      </NeumorphicCard>
    </div>
  )
}

