'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/auth-context'
import { apiClient } from '@/lib/api-client'
import { NeumorphicCard } from '@/components/user/NeumorphicCard'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Calendar, Plus, Clock, X } from 'lucide-react'
import { toast } from 'sonner'

export default function ConsultSlotsPage() {
  const router = useRouter()
  const { user, isLoading: authLoading } = useAuth()
  const [loading, setLoading] = useState(true)
  const [slots, setSlots] = useState<any[]>([])
  const [dialogOpen, setDialogOpen] = useState(false)
  const [newSlot, setNewSlot] = useState({
    startTime: '',
    duration: 30,
    consultType: 'quick' as 'quick' | 'full' | 'follow_up',
    timezone: 'Africa/Addis_Ababa'
  })
  const [creating, setCreating] = useState(false)

  useEffect(() => {
    if (!authLoading && user) {
      fetchSlots()
    }
  }, [authLoading, user])

  async function fetchSlots() {
    try {
      setLoading(true)
      const response = await apiClient.getMedicalConsultSlots({ page: 1, pageSize: 100 })
      if (response.success && response.data) {
        setSlots(response.data.items || [])
      }
    } catch (error) {
      console.error('Error fetching slots:', error)
    } finally {
      setLoading(false)
    }
  }

  async function handleCreateSlot() {
    if (!newSlot.startTime) {
      toast.error('Please select a date and time')
      return
    }

    try {
      setCreating(true)
      const response = await apiClient.createConsultSlot(newSlot)
      if (response.success) {
        toast.success('Slot created successfully')
        setNewSlot({ startTime: '', duration: 30, consultType: 'quick', timezone: 'Africa/Addis_Ababa' })
        setDialogOpen(false)
        fetchSlots()
      } else {
        throw new Error(response.error?.message || 'Failed to create slot')
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to create slot')
    } finally {
      setCreating(false)
    }
  }

  async function handleDeleteSlot(id: number) {
    if (!confirm('Are you sure you want to delete this slot?')) return

    try {
      const response = await apiClient.deleteConsultSlot(id)
      if (response.success) {
        toast.success('Slot deleted successfully')
        fetchSlots()
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete slot')
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

  return (
    <div className="min-h-screen bg-[var(--neumorphic-bg)]">
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-teal-500/10 via-emerald-500/5 to-blue-500/10" />
        
        <div className="relative px-4 md:px-8 py-12">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
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
                      Manage Slots
                    </h1>
                  </div>
                </div>
              </div>
              <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-gradient-to-r from-teal-500 to-emerald-600 text-white">
                    <Plus className="w-4 h-4 mr-2" />
                    Create Slot
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Create Consult Slot</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label>Date & Time</Label>
                      <Input
                        type="datetime-local"
                        value={newSlot.startTime}
                        onChange={(e) => setNewSlot({ ...newSlot, startTime: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label>Duration (minutes)</Label>
                      <Input
                        type="number"
                        value={newSlot.duration}
                        onChange={(e) => setNewSlot({ ...newSlot, duration: parseInt(e.target.value) || 30 })}
                      />
                    </div>
                    <div>
                      <Label>Consult Type</Label>
                      <Select value={newSlot.consultType} onValueChange={(v: any) => setNewSlot({ ...newSlot, consultType: v })}>
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
                    <Button
                      onClick={handleCreateSlot}
                      disabled={creating || !newSlot.startTime}
                      className="w-full bg-gradient-to-r from-teal-500 to-emerald-600 text-white"
                    >
                      {creating ? 'Creating...' : 'Create Slot'}
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {slots.length > 0 ? (
          <div className="space-y-4">
            {slots.map((slot) => (
              <NeumorphicCard key={slot.id} variant="raised" className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <Badge className="bg-blue-500 text-white">
                        {slot.consultType?.replace('_', ' ')}
                      </Badge>
                      <Badge className={slot.status === 'open' ? 'bg-green-500' : 'bg-gray-500'}>
                        {slot.status}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-[var(--neumorphic-muted)]">
                      <Clock className="w-4 h-4" />
                      <span>{new Date(slot.startTime).toLocaleString()}</span>
                      <span>• {slot.duration} min</span>
                    </div>
                  </div>
                  {slot.status === 'open' && (
                    <Button
                      onClick={() => handleDeleteSlot(slot.id)}
                      variant="outline"
                      size="sm"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              </NeumorphicCard>
            ))}
          </div>
        ) : (
          <NeumorphicCard variant="raised" className="p-12 text-center">
            <Calendar className="w-16 h-16 mx-auto mb-4 text-gray-400" />
            <h3 className="text-xl font-semibold text-[var(--neumorphic-text)] mb-2">
              No Slots Created
            </h3>
            <p className="text-[var(--neumorphic-muted)] mb-4">
              Create your first consult slot to start receiving bookings.
            </p>
            <Button
              onClick={() => setDialogOpen(true)}
              className="bg-gradient-to-r from-teal-500 to-emerald-600 text-white"
            >
              <Plus className="w-4 h-4 mr-2" />
              Create Slot
            </Button>
          </NeumorphicCard>
        )}
      </div>
    </div>
  )
}

