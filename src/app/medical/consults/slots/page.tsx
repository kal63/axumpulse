'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/auth-context'
import { apiClient } from '@/lib/api-client'
import { NeumorphicCard } from '@/components/user/NeumorphicCard'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Calendar, Plus, Clock, X, Edit, Trash2 } from 'lucide-react'
import { toast } from 'sonner'

const DAYS_OF_WEEK = [
  { value: 1, label: 'Monday' },
  { value: 2, label: 'Tuesday' },
  { value: 3, label: 'Wednesday' },
  { value: 4, label: 'Thursday' },
  { value: 5, label: 'Friday' },
  { value: 6, label: 'Saturday' },
  { value: 0, label: 'Sunday' }
]

interface Schedule {
  id: number
  dayOfWeek: number
  startTime: string
  endTime: string
  duration: number
  type: 'quick' | 'full' | 'follow_up'
  status: 'active' | 'inactive'
  timezone?: string
}

export default function ConsultSlotsPage() {
  const router = useRouter()
  const { user, isLoading: authLoading } = useAuth()
  const [loading, setLoading] = useState(true)
  const [schedules, setSchedules] = useState<Schedule[]>([])
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingSchedule, setEditingSchedule] = useState<Schedule | null>(null)
  const [selectedDay, setSelectedDay] = useState<number | null>(null)
  const [formData, setFormData] = useState({
    dayOfWeek: 1,
    startTime: '09:00',
    endTime: '17:00',
    duration: 30,
    type: 'quick' as 'quick' | 'full' | 'follow_up',
    status: 'active' as 'active' | 'inactive'
  })
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!authLoading && user) {
      fetchSchedules()
    }
  }, [authLoading, user])

  async function fetchSchedules() {
    try {
      setLoading(true)
      const response = await apiClient.getMedicalConsultSchedules()
      if (response.success && response.data) {
        setSchedules(response.data)
      }
    } catch (error) {
      console.error('Error fetching schedules:', error)
      toast.error('Failed to load schedules')
    } finally {
      setLoading(false)
    }
  }

  function openAddDialog(dayOfWeek: number) {
    setSelectedDay(dayOfWeek)
    setEditingSchedule(null)
    setFormData({
      dayOfWeek,
      startTime: '09:00',
      endTime: '17:00',
      duration: 30,
      type: 'quick',
      status: 'active'
    })
    setDialogOpen(true)
  }

  function openEditDialog(schedule: Schedule) {
    setEditingSchedule(schedule)
    setSelectedDay(schedule.dayOfWeek)
    setFormData({
      dayOfWeek: schedule.dayOfWeek,
      startTime: schedule.startTime.substring(0, 5), // HH:MM format
      endTime: schedule.endTime.substring(0, 5),
      duration: schedule.duration,
      type: schedule.type,
      status: schedule.status
    })
    setDialogOpen(true)
  }

  async function handleSave() {
    if (!formData.startTime || !formData.endTime) {
      toast.error('Please provide start and end times')
      return
    }

    try {
      setSaving(true)
      
      if (editingSchedule) {
        const response = await apiClient.updateConsultSchedule(editingSchedule.id, formData)
        if (response.success) {
          toast.success('Schedule updated successfully')
          setDialogOpen(false)
          fetchSchedules()
        } else {
          throw new Error(response.error?.message || 'Failed to update schedule')
        }
      } else {
        const response = await apiClient.createConsultSchedule(formData)
        if (response.success) {
          toast.success('Schedule created successfully')
          setDialogOpen(false)
          fetchSchedules()
        } else {
          throw new Error(response.error?.message || 'Failed to create schedule')
        }
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to save schedule')
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(id: number) {
    if (!confirm('Are you sure you want to delete this schedule entry?')) return

    try {
      const response = await apiClient.deleteConsultSchedule(id)
      if (response.success) {
        toast.success('Schedule deleted successfully')
        fetchSchedules()
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete schedule')
    }
  }

  function getSchedulesForDay(dayOfWeek: number) {
    return schedules.filter(s => s.dayOfWeek === dayOfWeek && s.status === 'active')
  }

  function formatTime(time: string) {
    // Convert HH:MM:SS to HH:MM format for display
    return time.substring(0, 5)
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

  return (
    <div className="min-h-screen bg-[var(--neumorphic-bg)]">
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-teal-500/10 via-emerald-500/5 to-blue-500/10" />
        
        <div className="relative px-4 md:px-8 py-12">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center gap-4 mb-8">
              <Button
                onClick={() => router.push('/medical/consults')}
                variant="ghost"
                size="sm"
              >
                Back
              </Button>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-r from-teal-500 to-emerald-600 rounded-full flex items-center justify-center">
                  <Calendar className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-4xl md:text-5xl font-bold text-[var(--neumorphic-text)]">
                    Weekly Schedule
                  </h1>
                  <p className="text-[var(--neumorphic-muted)] mt-1">
                    Set your weekly availability for consultations
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 pb-8">
        <div className="space-y-6">
          {DAYS_OF_WEEK.map((day) => {
            const daySchedules = getSchedulesForDay(day.value)
            return (
              <NeumorphicCard key={day.value} variant="raised" className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-2xl font-semibold text-[var(--neumorphic-text)]">
                    {day.label}
                  </h2>
                  <Button
                    onClick={() => openAddDialog(day.value)}
                    size="sm"
                    className="bg-gradient-to-r from-teal-500 to-emerald-600 text-white"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Time Range
                  </Button>
                </div>

                {daySchedules.length > 0 ? (
                  <div className="space-y-3">
                    {daySchedules.map((schedule) => (
                      <div
                        key={schedule.id}
                        className="flex items-center justify-between p-4 bg-[var(--neumorphic-bg)] rounded-lg border border-[var(--neumorphic-border)]"
                      >
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4 text-[var(--neumorphic-muted)]" />
                            <span className="font-medium text-[var(--neumorphic-text)]">
                              {formatTime(schedule.startTime)} - {formatTime(schedule.endTime)}
                            </span>
                          </div>
                          <Badge className="bg-blue-500 text-white">
                            {schedule.type.replace('_', ' ')}
                          </Badge>
                          <span className="text-sm text-[var(--neumorphic-muted)]">
                            {schedule.duration} min slots
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            onClick={() => openEditDialog(schedule)}
                            variant="outline"
                            size="sm"
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            onClick={() => handleDelete(schedule.id)}
                            variant="outline"
                            size="sm"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-[var(--neumorphic-muted)] italic">
                    No time ranges set for this day
                  </p>
                )}
              </NeumorphicCard>
            )
          })}
        </div>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingSchedule ? 'Edit Schedule' : 'Add Schedule'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label>Day of Week</Label>
              <Select
                value={formData.dayOfWeek.toString()}
                onValueChange={(v) => setFormData({ ...formData, dayOfWeek: parseInt(v) })}
                disabled={!!editingSchedule}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {DAYS_OF_WEEK.map((day) => (
                    <SelectItem key={day.value} value={day.value.toString()}>
                      {day.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Start Time</Label>
                <Input
                  type="time"
                  value={formData.startTime}
                  onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                />
              </div>
              <div>
                <Label>End Time</Label>
                <Input
                  type="time"
                  value={formData.endTime}
                  onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                />
              </div>
            </div>

            <div>
              <Label>Slot Duration (minutes)</Label>
              <Input
                type="number"
                min="1"
                value={formData.duration}
                onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) || 30 })}
              />
            </div>

            <div>
              <Label>Consult Type</Label>
              <Select
                value={formData.type}
                onValueChange={(v: any) => setFormData({ ...formData, type: v })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="quick">Quick</SelectItem>
                  <SelectItem value="full">Full</SelectItem>
                  <SelectItem value="follow_up">Follow-up</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={saving}
              className="bg-gradient-to-r from-teal-500 to-emerald-600 text-white"
            >
              {saving ? 'Saving...' : editingSchedule ? 'Update' : 'Create'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
