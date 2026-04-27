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
import { apiClient, SubscriptionPlan, type PublicTrainer } from '@/lib/api-client'
import { useAuth } from '@/contexts/auth-context'
import { canSubscribeToTrainerPlan } from '@/lib/trainee-guards'
import Header from '@/components/shared/header'
import { motion } from 'framer-motion'
import { UnifiedBackground } from '@/components/landing/ui/UnifiedBackground'
import Image from 'next/image'
import { getImageUrl } from '@/lib/upload-utils'

type Step = 'user-info' | 'trainee-profile' | 'package' | 'trainer'

const PRIMARY_GOAL_OPTIONS: { value: string; label: string }[] = [
  { value: 'lose_weight', label: 'Lose weight' },
  { value: 'gain_muscle', label: 'Gain muscle' },
  { value: 'general_fitness', label: 'General fitness' },
  { value: 'build_endurance', label: 'Build endurance' },
  { value: 'flexibility_mobility', label: 'Flexibility & mobility' },
  { value: 'rehabilitation', label: 'Rehabilitation' },
  { value: 'sports_performance', label: 'Sports performance' }
]

function RegisterPageContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { user, isAuthenticated, refreshUser } = useAuth()
  const [scrolled, setScrolled] = useState(false)
  
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
  const [traineeForm, setTraineeForm] = useState({
    height: '',
    weight: '',
    primaryGoal: 'general_fitness',
    activityLevel: 'moderate',
    fitnessLevel: 'beginner' as 'beginner' | 'intermediate' | 'advanced'
  })
  const [matchTrainers, setMatchTrainers] = useState<PublicTrainer[]>([])
  const [trainersLoading, setTrainersLoading] = useState(false)

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Get trainer and package from URL params
  useEffect(() => {
    const trainerId = searchParams.get('trainerId')
    const trainerName = searchParams.get('trainerName')
    const planIdParam = searchParams.get('planId')
    const durationParam = searchParams.get('duration')
    const onboardingOnly = searchParams.get('traineeOnboarding') === '1'

    if (trainerId) {
      setSelectedTrainerId(parseInt(trainerId))
      setSelectedTrainerName(trainerName || '')
    }

    loadPlans().then((plans) => {
      if (onboardingOnly && isAuthenticated && user) {
        setCurrentStep('trainee-profile')
        return
      }

      if (planIdParam) {
        const planId = parseInt(planIdParam)
        const foundPlan = plans.find((p: SubscriptionPlan) => p.id === planId)
        if (foundPlan) {
          setSelectedPlan(foundPlan)
          if (durationParam) {
            setSelectedDuration(durationParam as 'daily' | 'monthly' | 'threeMonth' | 'sixMonth' | 'nineMonth' | 'yearly')
          } else {
            if (foundPlan.minDuration === 'daily') {
              setSelectedDuration('daily')
            } else if (foundPlan.minDuration === 'monthly') {
              setSelectedDuration('monthly')
            } else {
              setSelectedDuration('threeMonth')
            }
          }
          if (isAuthenticated && user) {
            if (canSubscribeToTrainerPlan(user)) {
              setCurrentStep('trainer')
            } else {
              setCurrentStep('trainee-profile')
            }
          } else {
            setCurrentStep('user-info')
          }
        }
      } else if (isAuthenticated && user) {
        if (canSubscribeToTrainerPlan(user)) {
          setCurrentStep('package')
        } else {
          setCurrentStep('trainee-profile')
        }
      }
    })
  }, [searchParams, isAuthenticated, user])

  useEffect(() => {
    if (currentStep !== 'trainer' || !isAuthenticated) return
    let cancelled = false
    const load = async () => {
      setTrainersLoading(true)
      try {
        const res = await apiClient.getTrainerMatches()
        if (cancelled) return
        if (res.success && res.data?.items?.length) {
          setMatchTrainers(res.data.items)
        } else {
          const pub = await apiClient.getPublicTrainers()
          if (cancelled) return
          if (pub.success && pub.data) {
            const list = Array.isArray(pub.data) ? pub.data : (pub.data as { items?: PublicTrainer[] }).items || []
            setMatchTrainers(list)
          }
        }
      } catch {
        if (!cancelled) setMatchTrainers([])
      } finally {
        if (!cancelled) setTrainersLoading(false)
      }
    }
    load()
    return () => {
      cancelled = true
    }
  }, [currentStep, isAuthenticated])

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
          try {
            await refreshUser()
          } catch (error) {
            console.error('Failed to refresh auth context:', error)
          }

          setCurrentStep('trainee-profile')
        } else {
          setError(response.error?.message || 'Registration failed')
        }
      } catch (error: any) {
        setError(error.message || 'Registration failed')
      } finally {
        setLoading(false)
      }
    } else {
      setCurrentStep(canSubscribeToTrainerPlan(user) ? 'package' : 'trainee-profile')
    }
  }

  const handleTraineeProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    const h = parseFloat(traineeForm.height)
    const w = parseFloat(traineeForm.weight)
    if (Number.isNaN(h) || h <= 0 || h > 300) {
      setError('Please enter a valid height in cm')
      return
    }
    if (Number.isNaN(w) || w <= 0 || w > 500) {
      setError('Please enter a valid weight in kg')
      return
    }
    setLoading(true)
    try {
      const res = await apiClient.completeTraineeOnboarding({
        height: h,
        weight: w,
        primaryGoal: traineeForm.primaryGoal,
        activityLevel: traineeForm.activityLevel,
        fitnessLevel: traineeForm.fitnessLevel
      })
      if (!res.success) {
        setError(res.error?.message || 'Failed to save profile')
        return
      }
      await refreshUser()
      if (searchParams.get('traineeOnboarding') === '1') {
        router.push('/user/dashboard')
        return
      }
      if (selectedPlan) {
        setCurrentStep('trainer')
      } else {
        setCurrentStep('package')
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to save profile')
    } finally {
      setLoading(false)
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

  const handlePackageBack = () => {
    if (isAuthenticated && user && canSubscribeToTrainerPlan(user)) {
      router.push('/user/dashboard')
    } else {
      setCurrentStep('trainee-profile')
    }
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
    <div className="landing-ethio min-h-screen relative overflow-hidden flex flex-col">
      <UnifiedBackground variant="ethio" />
      <Header scrolled={scrolled} variant="ethio" />
      
      <div className="container mx-auto px-4 py-8 md:py-12 lg:py-16 flex-1 flex items-center relative z-10">
        <div className="max-w-4xl mx-auto w-full">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Card className="overflow-hidden rounded-2xl border border-slate-200/90 bg-white/95 shadow-xl backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-3xl font-bold text-[hsl(222,47%,8%)] flex items-center gap-2">
                  <Sparkles className="w-6 h-6 text-[hsl(210,95%,28%)]" />
                  Register for Compound 360
                </CardTitle>
                <CardDescription className="text-[hsl(222,20%,40%)]">
                  {currentStep === 'user-info' && 'Create your account to get started'}
                  {currentStep === 'trainee-profile' && 'Tell us about your goals so we can match you with the right trainer'}
                  {currentStep === 'package' && 'Choose your subscription package'}
                  {currentStep === 'trainer' && 'Select your trainer (ranked for your goals)'}
                </CardDescription>
              </CardHeader>

              <CardContent>
                {/* Progress Steps */}
                <div className="flex items-center justify-between mb-8 gap-1 overflow-x-auto">
                  {(['user-info', 'trainee-profile', 'package', 'trainer'] as Step[]).map((step, index, arr) => {
                    const order = arr.indexOf(currentStep)
                    return (
                    <div key={step} className="flex items-center flex-1 min-w-[4rem]">
                      <div className="flex flex-col items-center flex-1">
                        <div
                          className={`w-9 h-9 md:w-10 md:h-10 rounded-full flex items-center justify-center font-semibold text-sm ${
                            currentStep === step
                              ? 'bg-[hsl(78,88%,55%)] text-[hsl(222,47%,8%)] ring-1 ring-[hsl(222,47%,8%)]/10'
                              : order > index
                              ? 'bg-[hsl(210,95%,28%)] text-white'
                              : 'bg-slate-200 text-slate-600'
                          }`}
                        >
                          {order > index ? (
                            <Check className="w-4 h-4 md:w-5 md:h-5" />
                          ) : (
                            index + 1
                          )}
                        </div>
                        <span className="text-[10px] md:text-xs mt-2 text-[hsl(222,20%,45%)] text-center leading-tight capitalize">
                          {step === 'trainee-profile' ? 'Goals' : step.replace('-', ' ')}
                        </span>
                      </div>
                      {index < arr.length - 1 && (
                        <ChevronRight className="w-4 h-4 md:w-5 md:h-5 text-slate-200 mx-1 shrink-0" />
                      )}
                    </div>
                  )})}
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
                        <Label htmlFor="name" className="text-[hsl(222,20%,34%)] font-medium">Full Name</Label>
                        <Input
                          id="name"
                          name="name"
                          type="text"
                          value={formData.name}
                          onChange={handleInputChange}
                          className="bg-white border-slate-200 text-[hsl(222,47%,8%)] placeholder:text-[hsl(222,20%,55%)]"
                          placeholder="John Doe"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="phone" className="text-[hsl(222,20%,34%)] font-medium">Phone Number *</Label>
                        <Input
                          id="phone"
                          name="phone"
                          type="tel"
                          value={formData.phone}
                          onChange={handleInputChange}
                          className="bg-white border-slate-200 text-[hsl(222,47%,8%)] placeholder:text-[hsl(222,20%,55%)]"
                          placeholder="0912345678"
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="email" className="text-[hsl(222,20%,34%)] font-medium">Email (Optional)</Label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        className="bg-white border-slate-200 text-[hsl(222,47%,8%)] placeholder:text-[hsl(222,20%,55%)]"
                        placeholder="john@example.com"
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="password" className="text-[hsl(222,20%,34%)] font-medium">Password *</Label>
                        <div className="relative">
                          <Input
                            id="password"
                            name="password"
                            type={showPassword ? 'text' : 'password'}
                            value={formData.password}
                            onChange={handleInputChange}
                            className="bg-white border-slate-200 text-[hsl(222,47%,8%)] placeholder:text-[hsl(222,20%,55%)] pr-10"
                            placeholder="••••••••"
                            required
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-[hsl(222,20%,55%)] hover:text-[hsl(222,47%,8%)]"
                          >
                            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="confirmPassword" className="text-[hsl(222,20%,34%)] font-medium">Confirm Password *</Label>
                        <Input
                          id="confirmPassword"
                          name="confirmPassword"
                          type={showPassword ? 'text' : 'password'}
                          value={formData.confirmPassword}
                          onChange={handleInputChange}
                          className="bg-white border-slate-200 text-[hsl(222,47%,8%)] placeholder:text-[hsl(222,20%,55%)]"
                          placeholder="••••••••"
                          required
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="dateOfBirth" className="text-[hsl(222,20%,34%)] font-medium">Date of Birth (Optional)</Label>
                        <Input
                          id="dateOfBirth"
                          name="dateOfBirth"
                          type="date"
                          value={formData.dateOfBirth}
                          onChange={handleInputChange}
                          className="bg-white border-slate-200 text-[hsl(222,47%,8%)]"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="gender" className="text-[hsl(222,20%,34%)] font-medium">Gender (Optional)</Label>
                        <select
                          id="gender"
                          name="gender"
                          value={formData.gender}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 bg-white border border-slate-200 rounded-md text-[hsl(222,47%,8%)]"
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
                      className="w-full user-app-btn-primary"
                    >
                      {loading ? 'Creating Account...' : 'Continue'}
                    </Button>
                  </form>
                )}

                {currentStep === 'trainee-profile' && (
                  <form onSubmit={handleTraineeProfileSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className="text-[hsl(222,20%,34%)] font-medium">Height (cm) *</Label>
                        <Input
                          type="number"
                          min={50}
                          max={300}
                          step={0.1}
                          value={traineeForm.height}
                          onChange={(e) => setTraineeForm((p) => ({ ...p, height: e.target.value }))}
                          className="bg-white border-slate-200 text-[hsl(222,47%,8%)]"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-[hsl(222,20%,34%)] font-medium">Weight (kg) *</Label>
                        <Input
                          type="number"
                          min={20}
                          max={500}
                          step={0.1}
                          value={traineeForm.weight}
                          onChange={(e) => setTraineeForm((p) => ({ ...p, weight: e.target.value }))}
                          className="bg-white border-slate-200 text-[hsl(222,47%,8%)]"
                          required
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-[hsl(222,20%,34%)] font-medium">Primary goal *</Label>
                      <select
                        value={traineeForm.primaryGoal}
                        onChange={(e) => setTraineeForm((p) => ({ ...p, primaryGoal: e.target.value }))}
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-md text-[hsl(222,47%,8%)]"
                      >
                        {PRIMARY_GOAL_OPTIONS.map((o) => (
                          <option key={o.value} value={o.value}>{o.label}</option>
                        ))}
                      </select>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className="text-[hsl(222,20%,34%)] font-medium">Activity level</Label>
                        <select
                          value={traineeForm.activityLevel}
                          onChange={(e) => setTraineeForm((p) => ({ ...p, activityLevel: e.target.value }))}
                          className="w-full px-3 py-2 bg-white border border-slate-200 rounded-md text-[hsl(222,47%,8%)]"
                        >
                          <option value="sedentary">Sedentary</option>
                          <option value="light">Light</option>
                          <option value="moderate">Moderate</option>
                          <option value="active">Active</option>
                          <option value="very_active">Very active</option>
                        </select>
                      </div>
                      <div className="space-y-2">
                        <Label className="text-[hsl(222,20%,34%)] font-medium">Fitness level</Label>
                        <select
                          value={traineeForm.fitnessLevel}
                          onChange={(e) =>
                            setTraineeForm((p) => ({
                              ...p,
                              fitnessLevel: e.target.value as 'beginner' | 'intermediate' | 'advanced'
                            }))
                          }
                          className="w-full px-3 py-2 bg-white border border-slate-200 rounded-md text-[hsl(222,47%,8%)]"
                        >
                          <option value="beginner">Beginner</option>
                          <option value="intermediate">Intermediate</option>
                          <option value="advanced">Advanced</option>
                        </select>
                      </div>
                    </div>
                    <div className="flex gap-4">
                      {searchParams.get('traineeOnboarding') === '1' ? (
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => router.push('/user/profile')}
                          className="flex-1 border-slate-200 text-slate-700 hover:bg-slate-50"
                        >
                          Cancel
                        </Button>
                      ) : (
                        !isAuthenticated && (
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => setCurrentStep('user-info')}
                            className="flex-1 border-slate-200 text-slate-700 hover:bg-slate-50"
                          >
                            Back
                          </Button>
                        )
                      )}
                      <Button
                        type="submit"
                        disabled={loading}
                        className={`${searchParams.get('traineeOnboarding') === '1' || !isAuthenticated ? 'flex-1' : 'w-full'} user-app-btn-primary`}
                      >
                        {loading ? 'Saving...' : 'Continue'}
                      </Button>
                    </div>
                  </form>
                )}

                {/* Package Selection */}
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
                                ? 'border-[hsl(210,95%,28%)] bg-[hsl(210,85%,96%)]'
                                : 'border-slate-200 bg-white/80 hover:border-slate-300 hover:bg-white'
                            }`}
                            onClick={() => handlePackageSelect(plan)}
                          >
                            <CardHeader>
                              <div className="flex items-center justify-between">
                                <CardTitle className="text-xl text-[hsl(222,47%,8%)] flex items-center gap-2">
                                  <span className="text-2xl">{getPackageIcon(plan.level)}</span>
                                  {plan.name}
                                </CardTitle>
                                {selectedPlan?.id === plan.id && (
                                  <Check className="w-6 h-6 text-blue-400" />
                                )}
                              </div>
                              <CardDescription className="text-[hsl(222,20%,40%)]">
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
                                  <Label className="text-[hsl(222,20%,34%)] font-medium text-sm">Duration:</Label>
                                  <select
                                    value={selectedDuration}
                                    onChange={(e) => setSelectedDuration(e.target.value as any)}
                                    className="w-full mt-1 px-3 py-2 bg-white border border-slate-200 rounded-md text-[hsl(222,47%,8%)] text-sm"
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
                        onClick={handlePackageBack}
                        className="flex-1 border-slate-200 text-slate-700 hover:bg-slate-50"
                      >
                        Back
                      </Button>
                      <Button
                        onClick={handlePackageNext}
                        disabled={!selectedPlan}
                        className="flex-1 user-app-btn-primary"
                      >
                        Continue to Trainer Selection
                      </Button>
                    </div>
                  </div>
                )}

                {currentStep === 'trainer' && (
                  <div className="space-y-6">
                    {trainersLoading ? (
                      <p className="text-slate-400 text-center py-8">Loading trainers…</p>
                    ) : matchTrainers.length > 0 ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[360px] overflow-y-auto pr-1">
                        {matchTrainers.map((t) => (
                          <button
                            key={t.userId}
                            type="button"
                            onClick={() => {
                              setSelectedTrainerId(t.userId)
                              setSelectedTrainerName(t.name)
                            }}
                            className={`text-left rounded-lg border p-3 transition-colors ${
                              selectedTrainerId === t.userId
                                ? 'border-[hsl(210,95%,28%)] bg-[hsl(210,85%,96%)]'
                                : 'border-slate-200 bg-white/80 hover:border-slate-300 hover:bg-white'
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <div className="relative w-12 h-12 rounded-full overflow-hidden bg-slate-100 shrink-0 ring-1 ring-slate-200">
                                {t.profilePicture ? (
                                  <Image
                                    src={getImageUrl(t.profilePicture) || ''}
                                    alt={t.name}
                                    fill
                                    className="object-cover"
                                    unoptimized
                                  />
                                ) : (
                                  <span className="flex items-center justify-center w-full h-full text-white font-bold">
                                    {t.name.charAt(0).toUpperCase()}
                                  </span>
                                )}
                              </div>
                              <div className="min-w-0">
                                <p className="font-semibold text-[hsl(222,47%,8%)] truncate">{t.name}</p>
                                {typeof t.matchScore === 'number' && t.matchScore > 0 && (
                                  <Badge variant="outline" className="text-xs mt-1 border-cyan-500/50 text-cyan-300">
                                    Match score {t.matchScore}
                                  </Badge>
                                )}
                              </div>
                            </div>
                          </button>
                        ))}
                      </div>
                    ) : (
                      <Alert className="bg-yellow-500/10 border-yellow-500/50">
                        <AlertDescription className="text-yellow-400">
                          No trainers loaded. Try{' '}
                          <Link href="/trainers" className="underline text-cyan-400">
                            browsing trainers
                          </Link>
                          .
                        </AlertDescription>
                      </Alert>
                    )}

                    {selectedTrainerId ? (
                      <Card className="border-blue-500 bg-blue-500/10">
                        <CardContent className="pt-6">
                          <div className="flex items-center justify-between">
                            <div>
                              <h3 className="text-lg font-semibold text-[hsl(222,47%,8%)]">{selectedTrainerName || 'Selected Trainer'}</h3>
                              <p className="text-sm text-slate-400">Trainer ID: {selectedTrainerId}</p>
                            </div>
                            <Check className="w-6 h-6 text-blue-400" />
                          </div>
                        </CardContent>
                      </Card>
                    ) : null}

                    <div className="flex gap-4">
                      <Button
                        variant="outline"
                        onClick={() => setCurrentStep('package')}
                        className="flex-1 border-slate-200 text-slate-700 hover:bg-slate-50"
                      >
                        Back
                      </Button>
                      <Button
                        onClick={handleTrainerNext}
                        disabled={!selectedTrainerId}
                        className="flex-1 user-app-btn-primary"
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
      <div className="landing-ethio min-h-screen relative overflow-hidden flex items-center justify-center">
        <UnifiedBackground variant="ethio" />
        <div className="relative z-10 text-[hsl(222,20%,40%)]">Loading...</div>
      </div>
    }>
      <RegisterPageContent />
    </Suspense>
  )
}

