'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Eye, EyeOff, Phone, Lock, Mail, User, Calendar, ChevronRight, Check, Sparkles } from 'lucide-react'
import { apiClient, SubscriptionPlan } from '@/lib/api-client'
import { useAuth } from '@/contexts/auth-context'
import Header from '@/components/shared/header'
import { motion } from 'framer-motion'
import { UnifiedBackground } from '@/components/landing/ui/UnifiedBackground'

type Step = 'user-info' | 'package' | 'trainer'

function RegisterPageContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { user, isAuthenticated, refreshUser } = useAuth()
  
  const [currentStep, setCurrentStep] = useState<Step>('user-info')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [plans, setPlans] = useState<SubscriptionPlan[]>([])
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan | null>(null)
  const [selectedDuration, setSelectedDuration] = useState<'daily' | 'monthly' | 'threeMonth' | 'sixMonth' | 'nineMonth' | 'yearly'>('monthly')
  const [selectedTrainerId, setSelectedTrainerId] = useState<number | null>(null)
  const [selectedTrainerName, setSelectedTrainerName] = useState<string>('')
  
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    password: '',
    confirmPassword: '',
    dateOfBirth: '',
    gender: '' as 'male' | 'female' | ''
  })
  const [showPassword, setShowPassword] = useState(false)

  // Get trainer and package from URL params
  useEffect(() => {
    const trainerId = searchParams.get('trainerId')
    const trainerName = searchParams.get('trainerName')
    const planIdParam = searchParams.get('planId')
    const durationParam = searchParams.get('duration')
    
    if (trainerId) {
      setSelectedTrainerId(parseInt(trainerId))
      setSelectedTrainerName(trainerName || '')
    }

    // Load subscription plans first
    loadPlans().then((plans) => {
      // If planId is provided, auto-select that package
      if (planIdParam) {
        const planId = parseInt(planIdParam)
        const foundPlan = plans.find((p: SubscriptionPlan) => p.id === planId)
        if (foundPlan) {
          setSelectedPlan(foundPlan)
          if (durationParam) {
            setSelectedDuration(durationParam as any)
          } else {
            // Set default duration based on minDuration
            if (foundPlan.minDuration === 'daily') {
              setSelectedDuration('daily')
            } else if (foundPlan.minDuration === 'monthly') {
              setSelectedDuration('monthly')
            } else {
              setSelectedDuration('threeMonth')
            }
          }
          // If planId is provided, skip package selection step
          if (isAuthenticated && user) {
            setCurrentStep('trainer')
          } else {
            // If not authenticated, stay on user-info step
            setCurrentStep('user-info')
          }
        }
      } else {
        // If user is already authenticated and no planId, skip to package selection
        if (isAuthenticated && user) {
          setCurrentStep('package')
        }
      }
    })
  }, [searchParams, isAuthenticated, user])

  const loadPlans = async () => {
    try {
      const response = await apiClient.getSubscriptionPlans()
      if (response.success && response.data) {
        setPlans(response.data.items || [])
        return response.data.items || []
      }
      return []
    } catch (error) {
      console.error('Failed to load subscription plans:', error)
      return []
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    if (error) setError('')
  }

  const validateUserInfo = () => {
    if (!formData.phone || !formData.password) {
      setError('Phone and password are required')
      return false
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match')
      return false
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters')
      return false
    }

    const phoneRegex = /^(\+251|251|0)?[79][0-9]{8}$/
    if (!phoneRegex.test(formData.phone.replace(/\s/g, ''))) {
      setError('Please enter a valid Ethiopian phone number')
      return false
    }

    return true
  }

  const handleUserInfoSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!validateUserInfo()) {
      return
    }

    // If user is not authenticated, register them
    if (!isAuthenticated) {
      setLoading(true)
      try {
        // Normalize phone number
        let normalizedPhone = formData.phone.replace(/\s/g, '')
        if (normalizedPhone.startsWith('0')) {
          normalizedPhone = '+251' + normalizedPhone.substring(1)
        } else if (normalizedPhone.startsWith('251')) {
          normalizedPhone = '+' + normalizedPhone
        } else if (!normalizedPhone.startsWith('+251')) {
          normalizedPhone = '+251' + normalizedPhone
        }

        const response = await apiClient.registerUser({
          phone: normalizedPhone,
          email: formData.email || undefined,
          password: formData.password,
          name: formData.name || undefined,
          dateOfBirth: formData.dateOfBirth || undefined,
          gender: formData.gender || undefined
        })

        if (response.success) {
          // Registration successful - refresh auth context to update user state
          // The token is already set by registerUser, just need to refresh user data
          try {
            await refreshUser()
          } catch (error) {
            console.error('Failed to refresh auth context:', error)
          }

          // If user came from a package detail page with a pre-selected plan & duration
          // but without a trainer, redirect them to the trainers listing so they can
          // complete the normal subscription flow (select trainer -> checkout).
          const planIdFromUrl = searchParams.get('planId')
          const durationFromUrl = searchParams.get('duration')
          const trainerIdFromUrl = searchParams.get('trainerId')

          if (planIdFromUrl && durationFromUrl && !trainerIdFromUrl) {
            const params = new URLSearchParams({
              planId: planIdFromUrl,
              duration: durationFromUrl
            })
            router.push(`/trainers?${params.toString()}`)
            return
          }

          // Fallback: continue with the internal multi-step flow
          // If planId is already selected (from URL params), go to trainer selection
          // Otherwise, go to package selection
          if (selectedPlan) {
            setCurrentStep('trainer')
          } else {
            setCurrentStep('package')
          }
        } else {
          setError(response.error?.message || 'Registration failed')
        }
      } catch (error: any) {
        setError(error.message || 'Registration failed')
      } finally {
        setLoading(false)
      }
    } else {
      // User is already authenticated, just proceed
      setCurrentStep('package')
    }
  }

  const handlePackageSelect = (plan: SubscriptionPlan) => {
    setSelectedPlan(plan)
    // Set default duration based on minDuration
    if (plan.minDuration === 'daily') {
      setSelectedDuration('daily')
    } else if (plan.minDuration === 'monthly') {
      setSelectedDuration('monthly')
    } else {
      setSelectedDuration('threeMonth')
    }
  }

  const handlePackageNext = () => {
    if (!selectedPlan) {
      setError('Please select a subscription package')
      return
    }
    setCurrentStep('trainer')
  }

  const handleTrainerNext = () => {
    if (!selectedTrainerId) {
      setError('Please select a trainer')
      return
    }
    // Navigate to checkout with selected data
    const params = new URLSearchParams({
      planId: selectedPlan!.id.toString(),
      trainerId: selectedTrainerId.toString(),
      duration: selectedDuration,
      trainerName: selectedTrainerName
    })
    router.push(`/checkout?${params.toString()}`)
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

  const getPackageIcon = (level: string) => {
    switch (level) {
      case 'silver': return '🥈'
      case 'gold': return '🥇'
      case 'diamond': return '💎'
      case 'platinum': return '👑'
      default: return '⭐'
    }
  }

  const getDiscountForDuration = (plan: SubscriptionPlan, duration: string): number => {
    const discounts = typeof plan.discounts === 'string' 
      ? JSON.parse(plan.discounts) 
      : plan.discounts || {}
    
    switch (duration) {
      case 'monthly': return discounts.monthly || 0
      case 'threeMonth': return discounts.threeMonth || 0
      case 'sixMonth': return discounts.sixMonth || 0
      case 'nineMonth': return discounts.nineMonth || 0
      case 'yearly': return discounts.yearly || 0
      default: return 0
    }
  }

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col">
      <UnifiedBackground />
      <Header />
      
      <div className="container mx-auto px-4 py-8 md:py-12 lg:py-16 flex-1 flex items-center relative z-10">
        <div className="max-w-4xl mx-auto w-full">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Card className="bg-slate-800/50 backdrop-blur-sm border-slate-700">
              <CardHeader>
                <CardTitle className="text-3xl font-bold text-white flex items-center gap-2">
                  <Sparkles className="w-6 h-6 text-blue-400" />
                  Register for Compound 360
                </CardTitle>
                <CardDescription className="text-slate-300">
                  {currentStep === 'user-info' && 'Create your account to get started'}
                  {currentStep === 'package' && 'Choose your subscription package'}
                  {currentStep === 'trainer' && 'Select your trainer'}
                </CardDescription>
              </CardHeader>

              <CardContent>
                {/* Progress Steps */}
                <div className="flex items-center justify-between mb-8">
                  {['user-info', 'package', 'trainer'].map((step, index) => (
                    <div key={step} className="flex items-center flex-1">
                      <div className="flex flex-col items-center flex-1">
                        <div
                          className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${
                            currentStep === step
                              ? 'bg-blue-600 text-white'
                              : ['user-info', 'package', 'trainer'].indexOf(currentStep) > index
                              ? 'bg-green-600 text-white'
                              : 'bg-slate-700 text-slate-400'
                          }`}
                        >
                          {['user-info', 'package', 'trainer'].indexOf(currentStep) > index ? (
                            <Check className="w-5 h-5" />
                          ) : (
                            index + 1
                          )}
                        </div>
                        <span className="text-xs mt-2 text-slate-400 capitalize">{step.replace('-', ' ')}</span>
                      </div>
                      {index < 2 && (
                        <ChevronRight className="w-5 h-5 text-slate-600 mx-2" />
                      )}
                    </div>
                  ))}
                </div>

                {error && (
                  <Alert className="mb-6 bg-red-500/10 border-red-500/50">
                    <AlertDescription className="text-red-400">{error}</AlertDescription>
                  </Alert>
                )}

                {/* Step 1: User Info */}
                {currentStep === 'user-info' && (
                  <form onSubmit={handleUserInfoSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="name" className="text-slate-300">Full Name</Label>
                        <Input
                          id="name"
                          name="name"
                          type="text"
                          value={formData.name}
                          onChange={handleInputChange}
                          className="bg-slate-700 border-slate-600 text-white"
                          placeholder="John Doe"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="phone" className="text-slate-300">Phone Number *</Label>
                        <Input
                          id="phone"
                          name="phone"
                          type="tel"
                          value={formData.phone}
                          onChange={handleInputChange}
                          className="bg-slate-700 border-slate-600 text-white"
                          placeholder="0912345678"
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="email" className="text-slate-300">Email (Optional)</Label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        className="bg-slate-700 border-slate-600 text-white"
                        placeholder="john@example.com"
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="password" className="text-slate-300">Password *</Label>
                        <div className="relative">
                          <Input
                            id="password"
                            name="password"
                            type={showPassword ? 'text' : 'password'}
                            value={formData.password}
                            onChange={handleInputChange}
                            className="bg-slate-700 border-slate-600 text-white pr-10"
                            placeholder="••••••••"
                            required
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-300"
                          >
                            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="confirmPassword" className="text-slate-300">Confirm Password *</Label>
                        <Input
                          id="confirmPassword"
                          name="confirmPassword"
                          type={showPassword ? 'text' : 'password'}
                          value={formData.confirmPassword}
                          onChange={handleInputChange}
                          className="bg-slate-700 border-slate-600 text-white"
                          placeholder="••••••••"
                          required
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="dateOfBirth" className="text-slate-300">Date of Birth (Optional)</Label>
                        <Input
                          id="dateOfBirth"
                          name="dateOfBirth"
                          type="date"
                          value={formData.dateOfBirth}
                          onChange={handleInputChange}
                          className="bg-slate-700 border-slate-600 text-white"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="gender" className="text-slate-300">Gender (Optional)</Label>
                        <select
                          id="gender"
                          name="gender"
                          value={formData.gender}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-md text-white"
                        >
                          <option value="">Select...</option>
                          <option value="male">Male</option>
                          <option value="female">Female</option>
                        </select>
                      </div>
                    </div>

                    <Button
                      type="submit"
                      disabled={loading}
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                    >
                      {loading ? 'Creating Account...' : 'Continue to Package Selection'}
                    </Button>
                  </form>
                )}

                {/* Step 2: Package Selection */}
                {currentStep === 'package' && (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {plans.map((plan) => (
                        <motion.div
                          key={plan.id}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          <Card
                            className={`cursor-pointer transition-all ${
                              selectedPlan?.id === plan.id
                                ? 'border-blue-500 bg-blue-500/10'
                                : 'border-slate-700 bg-slate-800/50 hover:border-slate-600'
                            }`}
                            onClick={() => handlePackageSelect(plan)}
                          >
                            <CardHeader>
                              <div className="flex items-center justify-between">
                                <CardTitle className="text-xl text-white flex items-center gap-2">
                                  <span className="text-2xl">{getPackageIcon(plan.level)}</span>
                                  {plan.name}
                                </CardTitle>
                                {selectedPlan?.id === plan.id && (
                                  <Check className="w-6 h-6 text-blue-400" />
                                )}
                              </div>
                              <CardDescription className="text-slate-300">
                                {plan.level.charAt(0).toUpperCase() + plan.level.slice(1)} Level
                              </CardDescription>
                            </CardHeader>
                            <CardContent>
                              <div className="space-y-2">
                                <div className="text-2xl font-bold text-blue-400">
                                  {formatPrice(getPriceForDuration(plan, selectedDuration))}
                                  <span className="text-sm text-slate-400 font-normal ml-2">
                                    / {selectedDuration === 'daily' ? 'day' : selectedDuration === 'monthly' ? 'month' : selectedDuration.replace('Month', ' months')}
                                  </span>
                                </div>
                                <div className="text-sm text-slate-400">
                                  Starting from {formatPrice(parseFloat(plan.dailyPrice.toString()))}/day
                                </div>
                                <div className="mt-4">
                                  <Label className="text-slate-300 text-sm">Duration:</Label>
                                  <select
                                    value={selectedDuration}
                                    onChange={(e) => setSelectedDuration(e.target.value as any)}
                                    className="w-full mt-1 px-3 py-2 bg-slate-700 border border-slate-600 rounded-md text-white text-sm"
                                    onClick={(e) => e.stopPropagation()}
                                  >
                                    {plan.minDuration === 'daily' && <option value="daily">Daily - {formatPrice(parseFloat(plan.dailyPrice.toString()))}</option>}
                                    {plan.minDuration !== 'threeMonth' && (
                                      <option value="monthly">
                                        Monthly - {formatPrice(parseFloat(plan.monthlyPrice.toString()))}
                                        {getDiscountForDuration(plan, 'monthly') > 0 && ` (${getDiscountForDuration(plan, 'monthly')}% off)`}
                                      </option>
                                    )}
                                    {plan.minDuration !== 'daily' && (
                                      <option value="threeMonth">
                                        3 Months - {formatPrice(parseFloat(plan.threeMonthPrice.toString()))}
                                        {getDiscountForDuration(plan, 'threeMonth') > 0 && ` (${getDiscountForDuration(plan, 'threeMonth')}% off)`}
                                      </option>
                                    )}
                                    <option value="sixMonth">
                                      6 Months - {formatPrice(parseFloat(plan.sixMonthPrice.toString()))}
                                      {getDiscountForDuration(plan, 'sixMonth') > 0 && ` (${getDiscountForDuration(plan, 'sixMonth')}% off)`}
                                    </option>
                                    <option value="nineMonth">
                                      9 Months - {formatPrice(parseFloat(plan.nineMonthPrice.toString()))}
                                      {getDiscountForDuration(plan, 'nineMonth') > 0 && ` (${getDiscountForDuration(plan, 'nineMonth')}% off)`}
                                    </option>
                                    <option value="yearly">
                                      1 Year - {formatPrice(parseFloat(plan.yearlyPrice.toString()))}
                                      {getDiscountForDuration(plan, 'yearly') > 0 && ` (${getDiscountForDuration(plan, 'yearly')}% off)`}
                                    </option>
                                  </select>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        </motion.div>
                      ))}
                    </div>

                    <div className="flex gap-4">
                      <Button
                        variant="outline"
                        onClick={() => setCurrentStep('user-info')}
                        className="flex-1 border-slate-600 text-slate-300"
                      >
                        Back
                      </Button>
                      <Button
                        onClick={handlePackageNext}
                        disabled={!selectedPlan}
                        className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                      >
                        Continue to Trainer Selection
                      </Button>
                    </div>
                  </div>
                )}

                {/* Step 3: Trainer Selection */}
                {currentStep === 'trainer' && (
                  <div className="space-y-6">
                    {selectedTrainerId ? (
                      <Card className="border-blue-500 bg-blue-500/10">
                        <CardContent className="pt-6">
                          <div className="flex items-center justify-between">
                            <div>
                              <h3 className="text-lg font-semibold text-white">{selectedTrainerName || 'Selected Trainer'}</h3>
                              <p className="text-sm text-slate-400">Trainer ID: {selectedTrainerId}</p>
                            </div>
                            <Check className="w-6 h-6 text-blue-400" />
                          </div>
                        </CardContent>
                      </Card>
                    ) : (
                      <Alert className="bg-yellow-500/10 border-yellow-500/50">
                        <AlertDescription className="text-yellow-400">
                          Please select a trainer. You can browse trainers from the home page.
                        </AlertDescription>
                      </Alert>
                    )}

                    <div className="flex gap-4">
                      <Button
                        variant="outline"
                        onClick={() => setCurrentStep('package')}
                        className="flex-1 border-slate-600 text-slate-300"
                      >
                        Back
                      </Button>
                      <Button
                        onClick={handleTrainerNext}
                        disabled={!selectedTrainerId}
                        className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                      >
                        Continue to Checkout
                      </Button>
                    </div>
                  </div>
                )}

                <div className="mt-6 text-center text-sm text-slate-400">
                  Already have an account?{' '}
                  <Link href="/login" className="text-blue-400 hover:text-blue-300">
                    Sign in
                  </Link>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  )
}

export default function RegisterPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    }>
      <RegisterPageContent />
    </Suspense>
  )
}

