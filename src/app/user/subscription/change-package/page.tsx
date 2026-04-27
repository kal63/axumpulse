'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { apiClient, type SubscriptionPlan } from '@/lib/api-client'
import { useAuth } from '@/contexts/auth-context'
import { NeumorphicCard } from '@/components/user/NeumorphicCard'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Package, ArrowLeft, ArrowRight } from 'lucide-react'

export default function ChangePackagePage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { isAuthenticated, isLoading } = useAuth()
  const [plans, setPlans] = useState<SubscriptionPlan[]>([])
  const [loading, setLoading] = useState(true)
  const appRedirect = searchParams.get('app_redirect')

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login?redirect=/user/subscription/change-package')
      return
    }
  }, [isAuthenticated, isLoading, router])

  useEffect(() => {
    const run = async () => {
      try {
        setLoading(true)
        const res = await apiClient.getSubscriptionPlans()
        if (res.success && res.data) setPlans(res.data.items || [])
      } finally {
        setLoading(false)
      }
    }
    void run()
  }, [])

  const formatPrice = (price: number) =>
    new Intl.NumberFormat('en-ET', { style: 'currency', currency: 'ETB', minimumFractionDigits: 0 }).format(price)

  return (
    <div className="min-h-dvh min-h-full user-app-page">
      <div className="max-w-7xl mx-auto px-4 py-8 space-y-6">
        <div className="flex items-center justify-between gap-4">
          <Button variant="outline" className="border-slate-200 text-slate-700 hover:bg-slate-50" onClick={() => router.push('/user/dashboard')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <div className="text-right">
            <h1 className="text-2xl font-bold user-app-ink">Change package</h1>
            <p className="text-sm user-app-muted">Select a new package. Upgrades are prorated by remaining time.</p>
          </div>
        </div>

        {loading ? (
          <div className="user-app-muted">Loading packages...</div>
        ) : plans.length === 0 ? (
          <div className="user-app-muted">No packages available.</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {plans.map((plan) => {
              const daily = Number(plan.dailyPrice || 0)
              const monthly = Number(plan.monthlyPrice || 0)
              return (
                <NeumorphicCard key={plan.id} variant="raised" size="lg" className="p-6">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-r from-[var(--ethio-lemon)] to-[var(--ethio-deep-blue)] flex items-center justify-center">
                        <Package className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <div className="text-lg font-bold user-app-ink">{plan.name}</div>
                        <div className="text-xs user-app-muted capitalize">{plan.level} level</div>
                      </div>
                    </div>
                    <Badge className="bg-slate-100 text-slate-700 border border-slate-200 capitalize">{plan.minDuration}</Badge>
                  </div>

                  <div className="mt-4 space-y-1">
                    <div className="text-sm user-app-muted">{formatPrice(daily)} / day</div>
                    <div className="text-sm user-app-muted">{formatPrice(monthly)} / month</div>
                  </div>

                  <div className="mt-6">
                    <Button
                      className="w-full user-app-btn-primary"
                      onClick={() =>
                        router.push(
                          appRedirect
                            ? `/user/subscription/change-package/${plan.id}?app_redirect=${encodeURIComponent(appRedirect)}`
                            : `/user/subscription/change-package/${plan.id}`
                        )
                      }
                    >
                      Select
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </div>
                </NeumorphicCard>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

