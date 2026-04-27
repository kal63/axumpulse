'use client'

import { Suspense, useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Phone, CreditCard, ArrowLeft, Loader2, Check } from 'lucide-react'
import { apiClient, SubscriptionPlan } from '@/lib/api-client'
import { useAuth } from '@/contexts/auth-context'
import { canSubscribeToTrainerPlan } from '@/lib/trainee-guards'
import Header from '@/components/shared/header'
import { motion } from 'framer-motion'
import { UnifiedBackground } from '@/components/landing/ui/UnifiedBackground'

function CheckoutContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { user, isAuthenticated } = useAuth()
  const [scrolled, setScrolled] = useState(false)

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [plan, setPlan] = useState<SubscriptionPlan | null>(null)
  const [trainerId, setTrainerId] = useState<number | null>(null)
  const [trainerName, setTrainerName] = useState<string>('')
  const [mode, setMode] = useState<'new' | 'change'>('new')
  const [duration, setDuration] = useState<'daily' | 'monthly' | 'threeMonth' | 'sixMonth' | 'nineMonth' | 'yearly'>('monthly')
  const [phoneNumber, setPhoneNumber] = useState('')
  const [email, setEmail] = useState('')
  const [quote, setQuote] = useState<any>(null)
  const appRedirect = searchParams.get('app_redirect') || searchParams.get('amp;app_redirect')

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    if (!isAuthenticated || !user) return
    if (searchParams.get('mode') === 'change') return
    if (canSubscribeToTrainerPlan(user)) return
    router.replace('/register?traineeOnboarding=1')
  }, [isAuthenticated, user, searchParams, router])

  useEffect(() => {
    // Get data from URL params first
    const planId = searchParams.get('planId')
    const trainerIdParam = searchParams.get('trainerId')
    const durationParam = searchParams.get('duration')
    const trainerNameParam = searchParams.get('trainerName')
    const modeParam = searchParams.get('mode')
    const parsedMode = modeParam === 'change' ? 'change' : 'new'
    setMode(parsedMode)

    // Set user email if available
    if (user?.email) {
      setEmail(user.email)
    }

    // If we have params, proceed (change mode does not require trainerId)
    if (planId && (parsedMode === 'change' || trainerIdParam)) {
      if (trainerIdParam) setTrainerId(parseInt(trainerIdParam))
      setTrainerName(trainerNameParam || '')
      if (durationParam) {
        setDuration(durationParam as any)
      }

      // Load plan details
      loadPlan(parseInt(planId))
      return
    }

    // If no params and not authenticated, redirect to login
    if (!isAuthenticated) {
      router.push('/login?redirect=/checkout')
      return
    }

    // If authenticated but no params, show error
    if (!planId || (parsedMode !== 'change' && !trainerIdParam)) {
      setError('Missing required information. Please start over.')
      return
    }
  }, [searchParams, isAuthenticated, router])

  const loadPlan = async (planId: number) => {
    try {
      const response = await apiClient.getSubscriptionPlan(planId)
      if (response.success && response.data) {
        setPlan(response.data.plan)
      } else {
        setError('Failed to load subscription plan')
      }
    } catch (error) {
      console.error('Failed to load plan:', error)
      setError('Failed to load subscription plan')
    }
  }

  // In change mode, load current subscription to display trainer info
  useEffect(() => {
    const run = async () => {
      if (mode !== 'change') return
      if (!isAuthenticated) return
      try {
        const res = await apiClient.getMySubscription()
        const sub = res.success ? res.data?.subscription : null
        if (sub) {
          setTrainerId(sub.trainerId)
          setTrainerName(sub.trainer?.name || '')
        }
      } catch {}
    }
    void run()
  }, [mode, isAuthenticated])

  // In change mode, refresh quote when duration/plan changes
  useEffect(() => {
    const run = async () => {
      if (mode !== 'change' || !plan) return
      try {
        const res = await apiClient.quoteChangePackage({
          new_subscription_plan_id: plan.id,
          duration: duration,
        })
        if (res.success && res.data) setQuote(res.data.quote)
      } catch {}
    }
    void run()
  }, [mode, plan, duration])

  const getPriceForDuration = (plan: SubscriptionPlan, duration: string): number => {
    switch (duration) {
      case 'daily': return parseFloat(plan.dailyPrice.toString())
      case 'monthly': return parseFloat(plan.monthlyPrice.toString())
      case 'threeMonth': return parseFloat(plan.threeMonthPrice.toString())
      case 'sixMonth': return parseFloat(plan.sixMonthPrice.toString())
      case 'nineMonth': return parseFloat(plan.nineMonthPrice.toString())
      case 'yearly': return parseFloat(plan.yearlyPrice.toString())
      default: return parseFloat(plan.monthlyPrice.toString())
    }
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-ET', {
      style: 'currency',
      currency: 'ETB',
      minimumFractionDigits: 0
    }).format(price)
  }

  const validatePhoneNumber = (phone: string): boolean => {
    const phoneRegex = /^(09|07)[0-9]{8}$/
    return phoneRegex.test(phone)
  }

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  const handlePayment = async () => {
    if (!plan) {
      setError('Missing required information')
      return
    }
    if (!trainerId && mode !== 'change') {
      setError('Missing required information')
      return
    }

    if (!phoneNumber) {
      setError('Phone number is required for payment')
      return
    }

    if (!validatePhoneNumber(phoneNumber)) {
      setError('Phone number must start with 09 or 07 followed by 8 digits')
      return
    }

    if (!email) {
      setError('Email is required for payment')
      return
    }

    if (!validateEmail(email)) {
      setError('Please enter a valid email address')
      return
    }

    setLoading(true)
    setError('')

    try {
      const response = mode === 'change'
        ? await apiClient.initializeChangePackagePayment({
            new_subscription_plan_id: plan.id,
            duration: duration,
            phone_number: phoneNumber,
            email: email,
            ...(appRedirect ? { app_redirect: appRedirect } : {})
          })
        : await apiClient.initializePayment({
            subscription_plan_id: plan.id,
            trainer_id: trainerId!,
            duration: duration,
            phone_number: phoneNumber,
            email: email
          })

      if (response.success && response.data) {
        if ((response.data as any).no_payment_required) {
          router.push('/user/dashboard')
          return
        }
        // Redirect to Chapa checkout
        window.location.href = (response.data as any).checkout_url
      } else {
        // Display the user-friendly error message from the API
        setError(response.error?.message || 'Failed to initialize payment. Please try again.')
        setLoading(false)
      }
    } catch (error: any) {
      // Handle both API errors and network errors
      const errorMessage = error?.message || 
                          error?.error?.message || 
                          'Failed to initialize payment. Please check your connection and try again.'
      setError(errorMessage)
      setLoading(false)
    }
  }

  if (!plan || (mode !== 'change' && !trainerId)) {
    return (
      <div className="landing-ethio min-h-screen relative overflow-hidden flex flex-col">
        <UnifiedBackground variant="ethio" />
        <Header scrolled={scrolled} variant="ethio" />
        <div className="container mx-auto px-4 py-8 md:py-12 lg:py-16 flex-1 flex items-center relative z-10">
          <Card className="max-w-2xl mx-auto w-full overflow-hidden rounded-2xl border border-slate-200/90 bg-white/95 shadow-xl backdrop-blur-sm">
            <CardContent className="pt-6">
              <Alert className="bg-red-500/10 border-red-500/50">
                <AlertDescription className="text-red-400">
                  {error || 'Missing required information. Please start over.'}
                </AlertDescription>
              </Alert>
              <div className="mt-4">
                <Link href="/">
                  <Button variant="outline" className="border-slate-200 text-slate-700 hover:bg-slate-50">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Go to Home
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  const totalPrice = mode === 'change'
    ? Number(quote?.amountDue || 0)
    : getPriceForDuration(plan, duration)

  return (
    <div className="landing-ethio min-h-screen relative overflow-hidden flex flex-col">
      <UnifiedBackground variant="ethio" />
      <Header scrolled={scrolled} variant="ethio" />
      
      <div className="container mx-auto px-4 py-8 md:py-12 lg:py-16 flex-1 flex items-center relative z-10">
        <div className="max-w-3xl mx-auto w-full">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="space-y-6"
          >
            {/* Order Summary */}
            <Card className="overflow-hidden rounded-2xl border border-slate-200/90 bg-white/95 shadow-xl backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-2xl font-bold text-[hsl(222,47%,8%)] flex items-center gap-2">
                  <CreditCard className="w-6 h-6 text-[hsl(210,95%,28%)]" />
                  Checkout
                </CardTitle>
                <CardDescription className="text-[hsl(222,20%,40%)]">
                  Review your subscription details and complete payment
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-6">
                {error && (
                  <Alert className="bg-red-500/10 border-red-500/50">
                    <AlertDescription className="text-red-400">{error}</AlertDescription>
                  </Alert>
                )}

                {/* Subscription Plan Details */}
                <div className="rounded-xl border border-slate-200/90 bg-white/80 p-4 shadow-sm space-y-3">
                  <h3 className="text-lg font-semibold text-[hsl(222,47%,8%)]">Subscription Details</h3>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="text-[hsl(222,20%,40%)]">Package:</div>
                    <div className="text-[hsl(222,47%,8%)] font-semibold">{plan.name}</div>
                    <div className="text-[hsl(222,20%,40%)]">Trainer:</div>
                    <div className="text-[hsl(222,47%,8%)] font-semibold">
                      {trainerName || (trainerId ? `Trainer #${trainerId}` : 'Current trainer')}
                    </div>
                    <div className="text-[hsl(222,20%,40%)]">Duration:</div>
                    <div className="text-[hsl(222,47%,8%)] font-semibold capitalize">
                      {duration === 'daily' ? 'Daily' : 
                       duration === 'monthly' ? 'Monthly' : 
                       duration === 'threeMonth' ? '3 Months' :
                       duration === 'sixMonth' ? '6 Months' :
                       duration === 'nineMonth' ? '9 Months' : '1 Year'}
                    </div>
                    <div className="text-[hsl(222,20%,40%)]">Total:</div>
                    <div className="text-[hsl(210,95%,28%)] font-bold text-lg">{formatPrice(totalPrice)}</div>
                  </div>
                  {mode === 'change' && (
                    <p className="text-xs text-[hsl(222,20%,40%)] mt-2">
                      This is a prorated amount based on your remaining subscription time.
                    </p>
                  )}
                </div>

                {/* Email Input */}
                <div>
                  <Label htmlFor="email" className="text-[hsl(222,20%,34%)] mb-2 block font-medium">
                    Email Address <span className="text-red-400">*</span>
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value)
                      if (error) setError('')
                    }}
                    className="bg-white border-slate-200 text-[hsl(222,47%,8%)] placeholder:text-[hsl(222,20%,55%)]"
                    placeholder="your.email@example.com"
                    required
                  />
                  <p className="text-xs text-[hsl(222,20%,45%)] mt-1">
                    Required for payment processing
                  </p>
                </div>

                {/* Phone Number Input */}
                <div>
                  <Label htmlFor="phone" className="text-[hsl(222,20%,34%)] mb-2 block font-medium">
                    Phone Number <span className="text-red-400">*</span>
                  </Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[hsl(222,20%,55%)]" />
                    <Input
                      id="phone"
                      type="tel"
                      value={phoneNumber}
                      onChange={(e) => {
                        setPhoneNumber(e.target.value)
                        if (error) setError('')
                      }}
                      className="bg-white border-slate-200 text-[hsl(222,47%,8%)] placeholder:text-[hsl(222,20%,55%)] pl-10"
                      placeholder="0912345678"
                      required
                    />
                  </div>
                  <p className="text-xs text-[hsl(222,20%,45%)] mt-1">
                    Format: 09xxxxxxxx or 07xxxxxxxx (required for Chapa payment)
                  </p>
                </div>

                {/* Payment Method Info */}
                <div className="rounded-xl border border-[hsl(210,42%,88%)] bg-[hsl(210,85%,96%)] p-4">
                  <p className="text-sm text-[hsl(210,95%,28%)]">
                    You will be redirected to Chapa payment gateway to complete your payment securely.
                    We support card payments, Telebirr, CBE Birr, Awash Birr, and bank transfers.
                  </p>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-4">
                  <Link href="/register" className="flex-1">
                    <Button
                      variant="outline"
                      className="w-full border-slate-200 text-slate-700 hover:bg-slate-50"
                    >
                      <ArrowLeft className="w-4 h-4 mr-2" />
                      Back
                    </Button>
                  </Link>
                  <Button
                    onClick={handlePayment}
                    disabled={loading || !phoneNumber || !validatePhoneNumber(phoneNumber) || !email || !validateEmail(email)}
                    className="flex-1 user-app-btn-primary"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <CreditCard className="w-4 h-4 mr-2" />
                        Proceed to Payment
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  )
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={
      <div className="landing-ethio min-h-screen relative overflow-hidden flex items-center justify-center">
        <UnifiedBackground variant="ethio" />
        <Card className="relative z-10 bg-white/95 backdrop-blur-sm border-slate-200/90 shadow-xl">
          <CardContent className="pt-6">
            <p className="text-[hsl(222,20%,40%)]">Loading...</p>
          </CardContent>
        </Card>
      </div>
    }>
      <CheckoutContent />
    </Suspense>
  )
}