'use client'

import { useState, useEffect } from 'react'
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
import Header from '@/components/shared/header'
import { motion } from 'framer-motion'
import { UnifiedBackground } from '@/components/landing/ui/UnifiedBackground'

export default function CheckoutPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { user, isAuthenticated } = useAuth()

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [plan, setPlan] = useState<SubscriptionPlan | null>(null)
  const [trainerId, setTrainerId] = useState<number | null>(null)
  const [trainerName, setTrainerName] = useState<string>('')
  const [duration, setDuration] = useState<'daily' | 'monthly' | 'threeMonth' | 'sixMonth' | 'nineMonth' | 'yearly'>('monthly')
  const [phoneNumber, setPhoneNumber] = useState('')
  const [email, setEmail] = useState('')

  useEffect(() => {
    // Get data from URL params first
    const planId = searchParams.get('planId')
    const trainerIdParam = searchParams.get('trainerId')
    const durationParam = searchParams.get('duration')
    const trainerNameParam = searchParams.get('trainerName')

    // Set user email if available
    if (user?.email) {
      setEmail(user.email)
    }

    // If we have all required params, proceed (user might have just registered)
    if (planId && trainerIdParam) {
      setTrainerId(parseInt(trainerIdParam))
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
    if (!planId || !trainerIdParam) {
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
    if (!plan || !trainerId) {
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
      const response = await apiClient.initializePayment({
        subscription_plan_id: plan.id,
        trainer_id: trainerId,
        duration: duration,
        phone_number: phoneNumber,
        email: email
      })

      if (response.success && response.data) {
        // Redirect to Chapa checkout
        window.location.href = response.data.checkout_url
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

  if (!plan || !trainerId) {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col">
        <UnifiedBackground />
        <Header />
        <div className="container mx-auto px-4 py-8 md:py-12 lg:py-16 flex-1 flex items-center relative z-10">
          <Card className="max-w-2xl mx-auto w-full bg-slate-800/50 backdrop-blur-sm border-slate-700">
            <CardContent className="pt-6">
              <Alert className="bg-red-500/10 border-red-500/50">
                <AlertDescription className="text-red-400">
                  {error || 'Missing required information. Please start over.'}
                </AlertDescription>
              </Alert>
              <div className="mt-4">
                <Link href="/">
                  <Button variant="outline" className="border-slate-600 text-slate-300">
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

  const totalPrice = getPriceForDuration(plan, duration)

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col">
      <UnifiedBackground />
      <Header />
      
      <div className="container mx-auto px-4 py-8 md:py-12 lg:py-16 flex-1 flex items-center relative z-10">
        <div className="max-w-3xl mx-auto w-full">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="space-y-6"
          >
            {/* Order Summary */}
            <Card className="bg-slate-800/50 backdrop-blur-sm border-slate-700">
              <CardHeader>
                <CardTitle className="text-2xl font-bold text-white flex items-center gap-2">
                  <CreditCard className="w-6 h-6 text-blue-400" />
                  Checkout
                </CardTitle>
                <CardDescription className="text-slate-300">
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
                <div className="bg-slate-700/50 rounded-lg p-4 space-y-3">
                  <h3 className="text-lg font-semibold text-white">Subscription Details</h3>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="text-slate-400">Package:</div>
                    <div className="text-white font-medium">{plan.name}</div>
                    <div className="text-slate-400">Trainer:</div>
                    <div className="text-white font-medium">{trainerName || `Trainer #${trainerId}`}</div>
                    <div className="text-slate-400">Duration:</div>
                    <div className="text-white font-medium capitalize">
                      {duration === 'daily' ? 'Daily' : 
                       duration === 'monthly' ? 'Monthly' : 
                       duration === 'threeMonth' ? '3 Months' :
                       duration === 'sixMonth' ? '6 Months' :
                       duration === 'nineMonth' ? '9 Months' : '1 Year'}
                    </div>
                    <div className="text-slate-400">Total:</div>
                    <div className="text-blue-400 font-bold text-lg">{formatPrice(totalPrice)}</div>
                  </div>
                </div>

                {/* Email Input */}
                <div>
                  <Label htmlFor="email" className="text-slate-300 mb-2 block">
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
                    className="bg-slate-700 border-slate-600 text-white"
                    placeholder="your.email@example.com"
                    required
                  />
                  <p className="text-xs text-slate-400 mt-1">
                    Required for payment processing
                  </p>
                </div>

                {/* Phone Number Input */}
                <div>
                  <Label htmlFor="phone" className="text-slate-300 mb-2 block">
                    Phone Number <span className="text-red-400">*</span>
                  </Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <Input
                      id="phone"
                      type="tel"
                      value={phoneNumber}
                      onChange={(e) => {
                        setPhoneNumber(e.target.value)
                        if (error) setError('')
                      }}
                      className="bg-slate-700 border-slate-600 text-white pl-10"
                      placeholder="0912345678"
                      required
                    />
                  </div>
                  <p className="text-xs text-slate-400 mt-1">
                    Format: 09xxxxxxxx or 07xxxxxxxx (required for Chapa payment)
                  </p>
                </div>

                {/* Payment Method Info */}
                <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
                  <p className="text-sm text-blue-300">
                    You will be redirected to Chapa payment gateway to complete your payment securely.
                    We support card payments, Telebirr, CBE Birr, Awash Birr, and bank transfers.
                  </p>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-4">
                  <Link href="/register" className="flex-1">
                    <Button
                      variant="outline"
                      className="w-full border-slate-600 text-slate-300"
                    >
                      <ArrowLeft className="w-4 h-4 mr-2" />
                      Back
                    </Button>
                  </Link>
                  <Button
                    onClick={handlePayment}
                    disabled={loading || !phoneNumber || !validatePhoneNumber(phoneNumber) || !email || !validateEmail(email)}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
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

