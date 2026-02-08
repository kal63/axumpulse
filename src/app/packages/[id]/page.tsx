'use client'

import { useState, useEffect, Suspense } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { apiClient, SubscriptionPlan } from '@/lib/api-client'
import { useAuth } from '@/contexts/auth-context'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Check, ArrowLeft, Sparkles, ArrowRight, UserPlus } from 'lucide-react'
import Header from '@/components/shared/header'
import { UnifiedBackground } from '@/components/landing/ui/UnifiedBackground'
import { motion } from 'framer-motion'

type Duration = 'daily' | 'monthly' | 'threeMonth' | 'sixMonth' | 'nineMonth' | 'yearly'

function PackageDetailContent() {
  const params = useParams()
  const router = useRouter()
  const { user, isAuthenticated } = useAuth()
  
  const [plan, setPlan] = useState<SubscriptionPlan | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [selectedDuration, setSelectedDuration] = useState<Duration>('monthly')

  const planId = params?.id ? parseInt(params.id as string) : null

  useEffect(() => {
    if (planId) {
      loadPlan()
    } else {
      setError('Invalid package ID')
      setLoading(false)
    }
  }, [planId])

  const loadPlan = async () => {
    try {
      setLoading(true)
      const response = await apiClient.getSubscriptionPlans()
      
      if (response.success && response.data) {
        const plans = response.data.items || []
        const foundPlan = plans.find((p: SubscriptionPlan) => p.id === planId)
        
        if (foundPlan) {
          setPlan(foundPlan)
          // Set default duration based on minDuration
          if (foundPlan.minDuration === 'daily') {
            setSelectedDuration('daily')
          } else if (foundPlan.minDuration === 'monthly') {
            setSelectedDuration('monthly')
          } else {
            setSelectedDuration('threeMonth')
          }
        } else {
          setError('Package not found')
        }
      } else {
        setError('Failed to load package')
      }
    } catch (error) {
      console.error('Error loading package:', error)
      setError('An error occurred while loading the package')
    } finally {
      setLoading(false)
    }
  }

  const getPriceForDuration = (plan: SubscriptionPlan, duration: Duration): number => {
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

  const getPackageGradient = (level: string) => {
    switch (level) {
      case 'silver': return 'from-slate-500/20 via-slate-600/20 to-slate-700/20'
      case 'gold': return 'from-yellow-500/20 via-amber-600/20 to-orange-600/20'
      case 'diamond': return 'from-cyan-500/20 via-blue-600/20 to-indigo-600/20'
      case 'platinum': return 'from-purple-500/20 via-pink-600/20 to-rose-600/20'
      default: return 'from-blue-500/20 via-purple-600/20 to-pink-600/20'
    }
  }

  const getPackageBorder = (level: string) => {
    switch (level) {
      case 'silver': return 'border-slate-500/50'
      case 'gold': return 'border-yellow-500/50'
      case 'diamond': return 'border-cyan-500/50'
      case 'platinum': return 'border-purple-500/50'
      default: return 'border-blue-500/50'
    }
  }

  const getPackageTextColor = (level: string) => {
    switch (level) {
      case 'silver': return 'text-slate-300'
      case 'gold': return 'text-yellow-300'
      case 'diamond': return 'text-cyan-300'
      case 'platinum': return 'text-purple-300'
      default: return 'text-blue-300'
    }
  }

  const getDurationLabel = (duration: Duration): string => {
    switch (duration) {
      case 'daily': return 'Daily'
      case 'monthly': return 'Monthly'
      case 'threeMonth': return '3 Months'
      case 'sixMonth': return '6 Months'
      case 'nineMonth': return '9 Months'
      case 'yearly': return '1 Year'
      default: return duration
    }
  }

  const handleContinue = () => {
    if (!plan) return

    if (isAuthenticated) {
      // If logged in, go to trainer list with planId and duration
      const params = new URLSearchParams({
        planId: plan.id.toString(),
        duration: selectedDuration
      })
      router.push(`/trainers?${params.toString()}`)
    } else {
      // If not logged in, go to register with planId and duration
      const params = new URLSearchParams({
        planId: plan.id.toString(),
        duration: selectedDuration
      })
      router.push(`/register?${params.toString()}`)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col">
        <UnifiedBackground />
        <Header />
        <div className="container mx-auto px-4 py-8 md:py-12 lg:py-16 flex-1 flex items-center justify-center relative z-10">
          <div className="text-white">Loading package...</div>
        </div>
      </div>
    )
  }

  if (error || !plan) {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col">
        <UnifiedBackground />
        <Header />
        <div className="container mx-auto px-4 py-8 md:py-12 lg:py-16 flex-1 flex items-center justify-center relative z-10">
          <Card className="bg-slate-800/50 backdrop-blur-sm border-slate-700 max-w-md w-full">
            <CardContent className="p-6 text-center">
              <p className="text-red-400 mb-4">{error || 'Package not found'}</p>
              <Button
                onClick={() => router.push('/')}
                variant="outline"
                className="border-slate-600 text-slate-300"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Home
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  const features = typeof plan.features === 'string' 
    ? JSON.parse(plan.features) 
    : plan.features || []

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col">
      <UnifiedBackground />
      <Header />
      
      <div className="container mx-auto px-4 py-8 md:py-12 lg:py-16 flex-1 relative z-10">
        <div className="max-w-4xl mx-auto">
          {/* Back Button */}
          <Button
            onClick={() => router.push('/')}
            variant="ghost"
            className="mb-6 text-slate-300 hover:text-white"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Button>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Card className={`bg-gradient-to-br ${getPackageGradient(plan.level)} backdrop-blur-sm border ${getPackageBorder(plan.level)}`}>
              <CardHeader className="text-center">
                <div className="text-6xl mb-4">{getPackageIcon(plan.level)}</div>
                <CardTitle className={`text-4xl font-bold ${getPackageTextColor(plan.level)} mb-2`}>
                  {plan.name}
                </CardTitle>
                <CardDescription className="text-slate-300 text-lg capitalize">
                  {plan.level} Level Package
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-6">
                {/* Duration Selection */}
                <div className="space-y-3">
                  <h3 className="text-lg font-semibold text-white">Select Subscription Duration</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {plan.minDuration === 'daily' && (
                      <button
                        onClick={() => setSelectedDuration('daily')}
                        className={`p-4 rounded-lg border-2 transition-all ${
                          selectedDuration === 'daily'
                            ? 'border-blue-500 bg-blue-500/20'
                            : 'border-slate-700 bg-slate-800/50 hover:border-slate-600'
                        }`}
                      >
                        <div className="text-white font-semibold">Daily</div>
                        <div className="text-blue-400 text-sm mt-1">
                          {formatPrice(getPriceForDuration(plan, 'daily'))}
                        </div>
                      </button>
                    )}
                    {plan.minDuration !== 'threeMonth' && (
                      <button
                        onClick={() => setSelectedDuration('monthly')}
                        className={`p-4 rounded-lg border-2 transition-all ${
                          selectedDuration === 'monthly'
                            ? 'border-blue-500 bg-blue-500/20'
                            : 'border-slate-700 bg-slate-800/50 hover:border-slate-600'
                        }`}
                      >
                        <div className="text-white font-semibold">Monthly</div>
                        <div className="text-blue-400 text-sm mt-1">
                          {formatPrice(getPriceForDuration(plan, 'monthly'))}
                        </div>
                      </button>
                    )}
                    {plan.minDuration !== 'daily' && (
                      <button
                        onClick={() => setSelectedDuration('threeMonth')}
                        className={`p-4 rounded-lg border-2 transition-all ${
                          selectedDuration === 'threeMonth'
                            ? 'border-blue-500 bg-blue-500/20'
                            : 'border-slate-700 bg-slate-800/50 hover:border-slate-600'
                        }`}
                      >
                        <div className="text-white font-semibold">3 Months</div>
                        <div className="text-blue-400 text-sm mt-1">
                          {formatPrice(getPriceForDuration(plan, 'threeMonth'))}
                        </div>
                      </button>
                    )}
                    <button
                      onClick={() => setSelectedDuration('sixMonth')}
                      className={`p-4 rounded-lg border-2 transition-all ${
                        selectedDuration === 'sixMonth'
                          ? 'border-blue-500 bg-blue-500/20'
                          : 'border-slate-700 bg-slate-800/50 hover:border-slate-600'
                      }`}
                    >
                      <div className="text-white font-semibold">6 Months</div>
                      <div className="text-blue-400 text-sm mt-1">
                        {formatPrice(getPriceForDuration(plan, 'sixMonth'))}
                      </div>
                    </button>
                    <button
                      onClick={() => setSelectedDuration('nineMonth')}
                      className={`p-4 rounded-lg border-2 transition-all ${
                        selectedDuration === 'nineMonth'
                          ? 'border-blue-500 bg-blue-500/20'
                          : 'border-slate-700 bg-slate-800/50 hover:border-slate-600'
                      }`}
                    >
                      <div className="text-white font-semibold">9 Months</div>
                      <div className="text-blue-400 text-sm mt-1">
                        {formatPrice(getPriceForDuration(plan, 'nineMonth'))}
                      </div>
                    </button>
                    <button
                      onClick={() => setSelectedDuration('yearly')}
                      className={`p-4 rounded-lg border-2 transition-all ${
                        selectedDuration === 'yearly'
                          ? 'border-blue-500 bg-blue-500/20'
                          : 'border-slate-700 bg-slate-800/50 hover:border-slate-600'
                      }`}
                    >
                      <div className="text-white font-semibold">1 Year</div>
                      <div className="text-blue-400 text-sm mt-1">
                        {formatPrice(getPriceForDuration(plan, 'yearly'))}
                      </div>
                    </button>
                  </div>
                </div>

                {/* Selected Price Display */}
                <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-slate-400 text-sm">Selected Duration</div>
                      <div className="text-white font-semibold text-lg">
                        {getDurationLabel(selectedDuration)}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-slate-400 text-sm">Total Price</div>
                      <div className={`${getPackageTextColor(plan.level)} font-bold text-2xl`}>
                        {formatPrice(getPriceForDuration(plan, selectedDuration))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Features List */}
                {features.length > 0 && (
                  <div className="space-y-3">
                    <h3 className="text-lg font-semibold text-white">What's Included</h3>
                    <ul className="space-y-2">
                      {features.map((feature: string, index: number) => (
                        <li key={index} className="flex items-start gap-3">
                          <Check className={`w-5 h-5 ${getPackageTextColor(plan.level)} mt-0.5 flex-shrink-0`} />
                          <span className="text-slate-300">{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* CTA Button */}
                <Button
                  onClick={handleContinue}
                  className={`w-full bg-gradient-to-r ${
                    plan.level === 'silver' 
                      ? 'from-slate-600 to-slate-700 hover:from-slate-700 hover:to-slate-800' 
                      : plan.level === 'gold' 
                      ? 'from-yellow-600 to-orange-600 hover:from-yellow-700 hover:to-orange-700' 
                      : plan.level === 'diamond' 
                      ? 'from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700' 
                      : 'from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700'
                  } text-white shadow-lg hover:shadow-xl transition-all duration-300 font-semibold text-lg py-6`}
                  size="lg"
                >
                  {isAuthenticated ? (
                    <>
                      Continue to Trainer Selection
                      <ArrowRight className="w-5 h-5 ml-2" />
                    </>
                  ) : (
                    <>
                      Create Account to Continue
                      <UserPlus className="w-5 h-5 ml-2" />
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  )
}

export default function PackageDetailPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    }>
      <PackageDetailContent />
    </Suspense>
  )
}

