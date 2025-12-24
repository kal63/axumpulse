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
import { Activity, ArrowLeft, Plus, Calendar } from 'lucide-react'
import { toast } from 'sonner'

export default function HealthDataPage() {
  const router = useRouter()
  const { user, isLoading: authLoading } = useAuth()
  const [loading, setLoading] = useState(true)
  const [dataPoints, setDataPoints] = useState<any[]>([])
  const [dialogOpen, setDialogOpen] = useState(false)
  const [newData, setNewData] = useState({ metric: '', value: '', unit: '', timestamp: new Date().toISOString().split('T')[0] })
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login')
    } else if (user) {
      fetchData()
    }
  }, [authLoading, user, router])

  async function fetchData() {
    try {
      setLoading(true)
      const response = await apiClient.getHealthData({ page: 1, pageSize: 50 })
      if (response.success && response.data) {
        setDataPoints(response.data.items || [])
      }
    } catch (error) {
      console.error('Error fetching health data:', error)
    } finally {
      setLoading(false)
    }
  }

  async function handleSubmit() {
    if (!newData.metric || !newData.value) {
      toast.error('Please fill in all required fields')
      return
    }

    try {
      setSubmitting(true)
      const response = await apiClient.logHealthData({
        metric: newData.metric,
        value: parseFloat(newData.value),
        unit: newData.unit || undefined,
        timestamp: newData.timestamp
      })
      if (response.success) {
        toast.success('Health data logged successfully')
        setNewData({ metric: '', value: '', unit: '', timestamp: new Date().toISOString().split('T')[0] })
        setDialogOpen(false)
        fetchData()
      } else {
        throw new Error(response.error?.message || 'Failed to log health data')
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to log health data')
    } finally {
      setSubmitting(false)
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

  if (!user) {
    return null
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
                  onClick={() => router.push('/user/medical')}
                  variant="ghost"
                  size="sm"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back
                </Button>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-r from-teal-500 to-emerald-600 rounded-full flex items-center justify-center">
                    <Activity className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h1 className="text-4xl md:text-5xl font-bold text-[var(--neumorphic-text)]">
                      Health Data
                    </h1>
                  </div>
                </div>
              </div>
              <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-gradient-to-r from-teal-500 to-emerald-600 text-white">
                    <Plus className="w-4 h-4 mr-2" />
                    Log Data
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Log Health Data</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label>Metric</Label>
                      <Select value={newData.metric} onValueChange={(v) => setNewData({ ...newData, metric: v })}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select metric" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="hr">Heart Rate</SelectItem>
                          <SelectItem value="bp_systolic">Blood Pressure</SelectItem>
                          <SelectItem value="glucose">Glucose</SelectItem>
                          <SelectItem value="weight">Weight</SelectItem>
                          <SelectItem value="steps">Steps</SelectItem>
                          <SelectItem value="sleep">Sleep</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Value</Label>
                      <Input
                        type="number"
                        value={newData.value}
                        onChange={(e) => setNewData({ ...newData, value: e.target.value })}
                        placeholder="Enter value"
                      />
                    </div>
                    <div>
                      <Label>Unit (Optional)</Label>
                      <Input
                        value={newData.unit}
                        onChange={(e) => setNewData({ ...newData, unit: e.target.value })}
                        placeholder="e.g., bpm, mg/dL"
                      />
                    </div>
                    <div>
                      <Label>Date</Label>
                      <Input
                        type="date"
                        value={newData.timestamp}
                        onChange={(e) => setNewData({ ...newData, timestamp: e.target.value })}
                      />
                    </div>
                    <Button
                      onClick={handleSubmit}
                      disabled={submitting}
                      className="w-full bg-gradient-to-r from-teal-500 to-emerald-600 text-white"
                    >
                      {submitting ? 'Logging...' : 'Log Data'}
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {dataPoints.length > 0 ? (
          <div className="space-y-4">
            {dataPoints.map((point) => (
              <NeumorphicCard key={point.id} variant="raised" className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-[var(--neumorphic-text)]">
                      {point.metric?.replace('_', ' ')}
                    </h3>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-2xl font-bold text-[var(--neumorphic-text)]">
                        {point.value}
                      </span>
                      {point.unit && (
                        <span className="text-sm text-[var(--neumorphic-muted)]">
                          {point.unit}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="text-sm text-[var(--neumorphic-muted)] flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    {new Date(point.timestamp).toLocaleDateString()}
                  </div>
                </div>
              </NeumorphicCard>
            ))}
          </div>
        ) : (
          <NeumorphicCard variant="raised" className="p-12 text-center">
            <Activity className="w-16 h-16 mx-auto mb-4 text-gray-400" />
            <h3 className="text-xl font-semibold text-[var(--neumorphic-text)] mb-2">
              No Health Data Yet
            </h3>
            <p className="text-[var(--neumorphic-muted)] mb-4">
              Start logging your health metrics to track your progress.
            </p>
            <Button
              onClick={() => setDialogOpen(true)}
              className="bg-gradient-to-r from-teal-500 to-emerald-600 text-white"
            >
              <Plus className="w-4 h-4 mr-2" />
              Log Health Data
            </Button>
          </NeumorphicCard>
        )}
      </div>
    </div>
  )
}

