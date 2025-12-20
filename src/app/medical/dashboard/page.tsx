'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/auth-context'
import { apiClient } from '@/lib/api-client'
import { NeumorphicCard } from '@/components/user/NeumorphicCard'
import { Button } from '@/components/ui/button'
import { MessageSquare, Calendar, AlertTriangle, ClipboardList, ArrowRight, Stethoscope } from 'lucide-react'

export default function MedicalDashboardPage() {
  const router = useRouter()
  const { user, isLoading: authLoading } = useAuth()
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState<any>(null)

  useEffect(() => {
    if (!authLoading && user) {
      fetchDashboard()
    }
  }, [authLoading, user])

  async function fetchDashboard() {
    try {
      setLoading(true)
      const response = await apiClient.getMedicalDashboard()
      if (response.success && response.data) {
        setStats(response.data)
      }
    } catch (error) {
      console.error('Error fetching dashboard:', error)
    } finally {
      setLoading(false)
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
            <div className="flex items-center gap-3 mb-8">
              <div className="w-12 h-12 bg-gradient-to-r from-teal-500 to-emerald-600 rounded-full flex items-center justify-center">
                <Stethoscope className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-4xl md:text-5xl font-bold text-[var(--neumorphic-text)]">
                  Medical Dashboard
                </h1>
                <p className="text-lg text-[var(--neumorphic-muted)]">
                  Welcome back, {user.name}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <NeumorphicCard variant="raised" className="p-6 cursor-pointer" onClick={() => router.push('/medical/questions')}>
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full flex items-center justify-center">
                <MessageSquare className="w-6 h-6 text-white" />
              </div>
              <ArrowRight className="w-5 h-5 text-[var(--neumorphic-muted)]" />
            </div>
            <h3 className="text-lg font-semibold text-[var(--neumorphic-text)] mb-2">
              Pending Questions
            </h3>
            <p className="text-3xl font-bold text-[var(--neumorphic-text)]">
              {stats?.pendingQuestions || 0}
            </p>
          </NeumorphicCard>

          <NeumorphicCard variant="raised" className="p-6 cursor-pointer" onClick={() => router.push('/medical/consults')}>
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                <Calendar className="w-6 h-6 text-white" />
              </div>
              <ArrowRight className="w-5 h-5 text-[var(--neumorphic-muted)]" />
            </div>
            <h3 className="text-lg font-semibold text-[var(--neumorphic-text)] mb-2">
              Upcoming Consults
            </h3>
            <p className="text-3xl font-bold text-[var(--neumorphic-text)]">
              {stats?.upcomingConsults || 0}
            </p>
          </NeumorphicCard>

          <NeumorphicCard variant="raised" className="p-6 cursor-pointer" onClick={() => router.push('/medical/triage')}>
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center">
                <ClipboardList className="w-6 h-6 text-white" />
              </div>
              <ArrowRight className="w-5 h-5 text-[var(--neumorphic-muted)]" />
            </div>
            <h3 className="text-lg font-semibold text-[var(--neumorphic-text)] mb-2">
              High-Risk Triage
            </h3>
            <p className="text-3xl font-bold text-[var(--neumorphic-text)]">
              {stats?.highRiskTriageRuns || 0}
            </p>
          </NeumorphicCard>

          <NeumorphicCard variant="raised" className="p-6 cursor-pointer" onClick={() => router.push('/medical/alerts')}>
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-gradient-to-r from-red-500 to-orange-500 rounded-full flex items-center justify-center">
                <AlertTriangle className="w-6 h-6 text-white" />
              </div>
              <ArrowRight className="w-5 h-5 text-[var(--neumorphic-muted)]" />
            </div>
            <h3 className="text-lg font-semibold text-[var(--neumorphic-text)] mb-2">
              Open Alerts
            </h3>
            <p className="text-3xl font-bold text-[var(--neumorphic-text)]">
              {stats?.openAlerts || 0}
            </p>
          </NeumorphicCard>
        </div>
      </div>
    </div>
  )
}

