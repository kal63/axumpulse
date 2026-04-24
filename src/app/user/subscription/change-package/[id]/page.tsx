'use client'

import { useEffect, useMemo, useState } from 'react'
import { useParams, useRouter, useSearchParams } from 'next/navigation'
import { apiClient, type SubscriptionPlan } from '@/lib/api-client'
import { useAuth } from '@/contexts/auth-context'
import { NeumorphicCard } from '@/components/user/NeumorphicCard'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, CreditCard, Info } from 'lucide-react'

type Duration = 'daily' | 'monthly' | 'threeMonth' | 'sixMonth' | 'nineMonth' | 'yearly'

export default function ChangePackageDetailPage() {
  const params = useParams()
  const router = useRouter()
  const searchParams = useSearchParams()
  const { isAuthenticated, isLoading } = useAuth()

  const planId = params?.id ? Number(params.id) : null
  const appRedirect = searchParams.get('app_redirect')

  const [plan, setPlan] = useState<SubscriptionPlan | null>(null)
  const [duration, setDuration] = useState<Duration>('monthly')
  const [quote, setQuote] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [quoteLoading, setQuoteLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      const next = planId ? `/user/subscription/change-package/${planId}` : '/user/subscription/change-package'
      router.push(`/login?redirect=${encodeURIComponent(next)}`)
    }
  }, [isAuthenticated, isLoading, router, planId])

  useEffect(() => {
    const run = async () => {
      if (!planId) {
        setError('Invalid package')
        setLoading(false)
        return
      }
      try {
        setLoading(true)
        const res = await apiClient.getSubscriptionPlan(planId)
        if (res.success && res.data) {
          setPlan(res.data.plan)
          const min = res.data.plan.minDuration as Duration
          setDuration(min === 'daily' ? 'daily' : min === 'monthly' ? 'monthly' : 'threeMonth')
        } else {
          setError(res.error?.message || 'Failed to load package')
        }
      } catch {
        setError('Failed to load package')
      } finally {
        setLoading(false)
      }
    }
    void run()
  }, [planId])

  useEffect(() => {
    const run = async () => {
      if (!planId) return
      try {
        setQuoteLoading(true)
        const res = await apiClient.quoteChangePackage({ new_subscription_plan_id: planId, duration })
        if (res.success && res.data) setQuote(res.data.quote)
      } finally {
        setQuoteLoading(false)
      }
    }
    void run()
  }, [planId, duration])

  const formatPrice = (price: number) =>
    new Intl.NumberFormat('en-ET', { style: 'currency', currency: 'ETB', minimumFractionDigits: 0 }).format(price)

  const durations = useMemo(() => {
    if (!plan) return [] as Duration[]
    const all: Duration[] = ['daily', 'monthly', 'threeMonth', 'sixMonth', 'nineMonth', 'yearly']
    const min = plan.minDuration as Duration
    const allowed =
      min === 'daily'
        ? all
        : min === 'monthly'
          ? all.filter((d) => d !== 'daily')
          : all.filter((d) => d !== 'daily' && d !== 'monthly')
    return allowed
  }, [plan])

  const getPriceForDuration = (p: SubscriptionPlan, d: Duration) => {
    switch (d) {
      case 'daily': return Number(p.dailyPrice || 0)
      case 'monthly': return Number(p.monthlyPrice || 0)
      case 'threeMonth': return Number(p.threeMonthPrice || 0)
      case 'sixMonth': return Number(p.sixMonthPrice || 0)
      case 'nineMonth': return Number(p.nineMonthPrice || 0)
      case 'yearly': return Number(p.yearlyPrice || 0)
      default: return Number(p.monthlyPrice || 0)
    }
  }

  const durationLabel = (d: Duration) =>
    d === 'daily' ? 'Daily' :
    d === 'monthly' ? 'Monthly' :
    d === 'threeMonth' ? '3 Months' :
    d === 'sixMonth' ? '6 Months' :
    d === 'nineMonth' ? '9 Months' : '1 Year'

  if (loading) {
    return <div className="min-h-dvh min-h-full user-app-page p-8 user-app-muted">Loading...</div>
  }
  if (error || !plan) {
    return (
      <div className="min-h-dvh min-h-full user-app-page p-8">
        <NeumorphicCard variant="raised" className="p-6">
          <div className="text-red-400">{error || 'Package not found'}</div>
          <Button className="mt-4" variant="outline" onClick={() => router.push('/user/subscription/change-package')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
        </NeumorphicCard>
      </div>
    )
  }

  return (
    <div className="min-h-dvh min-h-full user-app-page">
      <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
        <Button variant="outline" className="border-slate-600 text-slate-300" onClick={() => router.push('/user/subscription/change-package')}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>

        <NeumorphicCard variant="raised" className="p-6 space-y-4">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="text-2xl font-bold user-app-ink">{plan.name}</div>
              <div className="text-sm user-app-muted capitalize">{plan.level} level</div>
            </div>
            <Badge className="bg-slate-700 text-slate-200 capitalize">{plan.minDuration}</Badge>
          </div>

          <div className="space-y-2">
            <div className="text-sm font-semibold user-app-ink">Select duration</div>
            <div className="flex flex-wrap gap-2">
              {durations.map((d) => (
                <Button
                  key={d}
                  variant={duration === d ? 'default' : 'outline'}
                  className={duration === d ? 'bg-cyan-600 hover:bg-cyan-700 text-white' : 'border-slate-600 text-slate-300'}
                  onClick={() => setDuration(d)}
                >
                  {durationLabel(d)}
                </Button>
              ))}
            </div>
            <div className="text-sm user-app-muted">
              Package price: <span className="user-app-ink font-semibold">{formatPrice(getPriceForDuration(plan, duration))}</span>
            </div>
          </div>

          <div className="rounded-xl user-app-paper p-4 border user-app-border">
            <div className="flex items-start gap-3">
              <Info className="w-5 h-5 text-cyan-400 mt-0.5" />
              <div className="space-y-1">
                <div className="text-sm font-semibold user-app-ink">Estimated amount due</div>
                <div className="text-sm user-app-muted">
                  {quoteLoading ? 'Calculating...' : quote ? (
                    <>
                      <span className="user-app-ink font-semibold">{formatPrice(Number(quote.amountDue || 0))}</span>
                      {' '}({quote.isUpgrade ? 'prorated upgrade' : 'no extra payment'})
                    </>
                  ) : '—'}
                </div>
              </div>
            </div>
          </div>

          <Button
            className="w-full bg-cyan-600 hover:bg-cyan-700 text-white"
            onClick={() =>
              router.push(
                `/checkout?planId=${plan.id}&duration=${duration}&mode=change${
                  appRedirect ? `&app_redirect=${encodeURIComponent(appRedirect)}` : ''
                }`
              )
            }
          >
            <CreditCard className="w-4 h-4 mr-2" />
            Continue to checkout
          </Button>
        </NeumorphicCard>
      </div>
    </div>
  )
}

