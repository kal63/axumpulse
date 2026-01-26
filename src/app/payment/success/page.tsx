'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { CheckCircle, XCircle, Loader2, Home, Calendar } from 'lucide-react'
import { apiClient, UserSubscription } from '@/lib/api-client'
import { useAuth } from '@/contexts/auth-context'
import Header from '@/components/shared/header'
import { motion } from 'framer-motion'
import { UnifiedBackground } from '@/components/landing/ui/UnifiedBackground'

export default function PaymentSuccessPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { user, isAuthenticated } = useAuth()

  const [status, setStatus] = useState<'loading' | 'success' | 'failed'>('loading')
  const [subscription, setSubscription] = useState<UserSubscription | null>(null)
  const [error, setError] = useState('')
  const txRef = searchParams.get('tx_ref')

  useEffect(() => {
    if (!txRef) {
      setStatus('failed')
      setError('No transaction reference found')
      return
    }

    // Wait for callback to process and retry multiple times
    const checkSubscription = async (retryCount = 0, maxRetries = 5) => {
      try {
        // Wait progressively longer: 3s, 5s, 7s, 10s, 15s
        const waitTime = retryCount === 0 ? 3000 : retryCount === 1 ? 5000 : retryCount === 2 ? 7000 : retryCount === 3 ? 10000 : 15000
        await new Promise((resolve) => setTimeout(resolve, waitTime))

        if (!isAuthenticated) {
          // User not logged in, but payment might have succeeded
          // Show success message but note that subscription will be activated
          setStatus('success')
          return
        }

        // Check subscription status
        const response = await apiClient.getMySubscription()
        if (response.success && response.data) {
          if (response.data.subscription) {
            setSubscription(response.data.subscription)
            setStatus('success')
            return
          }
        }

        // If no subscription found and we have retries left, try again
        if (retryCount < maxRetries) {
          console.log(`Subscription not found yet, retrying... (${retryCount + 1}/${maxRetries})`)
          checkSubscription(retryCount + 1, maxRetries)
        } else {
          // After all retries, show success anyway (callback may still process)
          // Payment was successful, subscription activation might be delayed
          setStatus('success')
          setError('Your payment was successful! Your subscription is being activated and will be available shortly.')
        }
      } catch (error: any) {
        console.error('Error checking subscription:', error)
        // After max retries, show success anyway
        if (retryCount >= maxRetries) {
          setStatus('success')
          setError('Your payment was successful! Your subscription is being activated and will be available shortly.')
        } else {
          // Retry on error
          checkSubscription(retryCount + 1, maxRetries)
        }
      }
    }

    checkSubscription()
  }, [txRef, isAuthenticated])

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-slate-900">
        <UnifiedBackground />
        <Header />
        <div className="container mx-auto px-4 py-16 relative z-10">
          <Card className="max-w-2xl mx-auto bg-slate-800/50 backdrop-blur-sm border-slate-700">
            <CardContent className="pt-6 text-center">
              <Loader2 className="w-12 h-12 animate-spin text-blue-400 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-white mb-2">Verifying your payment...</h2>
              <p className="text-slate-400">Please wait while we confirm your subscription</p>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-900">
      <UnifiedBackground />
      <Header />
      
      <div className="container mx-auto px-4 py-16 relative z-10">
        <div className="max-w-2xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Card className="bg-slate-800/50 backdrop-blur-sm border-slate-700">
              <CardHeader>
                {status === 'success' ? (
                  <>
                    <div className="flex items-center justify-center mb-4">
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: 'spring', stiffness: 200, damping: 15 }}
                      >
                        <CheckCircle className="w-16 h-16 text-green-400" />
                      </motion.div>
                    </div>
                    <CardTitle className="text-3xl font-bold text-white text-center">
                      Payment Successful!
                    </CardTitle>
                    <CardDescription className="text-slate-300 text-center">
                      Your subscription has been activated successfully
                    </CardDescription>
                  </>
                ) : (
                  <>
                    <div className="flex items-center justify-center mb-4">
                      <CheckCircle className="w-16 h-16 text-yellow-400" />
                    </div>
                    <CardTitle className="text-3xl font-bold text-white text-center">
                      Payment Successful!
                    </CardTitle>
                    <CardDescription className="text-slate-300 text-center">
                      {error || "Your payment was successful! Your subscription is being activated and will be available shortly."}
                    </CardDescription>
                  </>
                )}
              </CardHeader>

              <CardContent className="space-y-6">
                {status === 'success' && subscription && (
                  <div className="bg-slate-700/50 rounded-lg p-4 space-y-3">
                    <h3 className="text-lg font-semibold text-white">Subscription Details</h3>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div className="text-slate-400">Plan:</div>
                      <div className="text-white font-medium">{subscription.subscriptionPlan?.name || 'N/A'}</div>
                      <div className="text-slate-400">Trainer:</div>
                      <div className="text-white font-medium">
                        {subscription.trainer?.name || `Trainer #${subscription.trainerId}`}
                      </div>
                      <div className="text-slate-400">Duration:</div>
                      <div className="text-white font-medium capitalize">
                        {subscription.duration === 'daily' ? 'Daily' : 
                         subscription.duration === 'monthly' ? 'Monthly' : 
                         subscription.duration === 'threeMonth' ? '3 Months' :
                         subscription.duration === 'sixMonth' ? '6 Months' :
                         subscription.duration === 'nineMonth' ? '9 Months' : '1 Year'}
                      </div>
                      <div className="text-slate-400 flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        Expires:
                      </div>
                      <div className="text-white font-medium">
                        {formatDate(subscription.expiresAt)}
                      </div>
                    </div>
                  </div>
                )}

                {txRef && (
                  <div className="bg-slate-700/30 rounded-lg p-3">
                    <p className="text-xs text-slate-400">Transaction Reference:</p>
                    <p className="text-sm text-slate-300 font-mono">{txRef}</p>
                  </div>
                )}

                {error && !subscription && (
                  <Alert className={status === 'failed' ? "bg-red-500/10 border-red-500/50" : "bg-yellow-500/10 border-yellow-500/50"}>
                    <AlertDescription className={status === 'failed' ? "text-red-400" : "text-yellow-400"}>
                      {error}
                    </AlertDescription>
                  </Alert>
                )}

                {!subscription && status === 'success' && (
                  <Alert className="bg-blue-500/10 border-blue-500/50">
                    <AlertDescription className="text-blue-400">
                      Your subscription is being activated. This may take a few moments. You can access your dashboard now, and your subscription will be available shortly.
                    </AlertDescription>
                  </Alert>
                )}

                <div className="flex flex-col sm:flex-row gap-4">
                  <Link href="/" className="flex-1">
                    <Button
                      variant="outline"
                      className="w-full border-slate-600 text-slate-300"
                    >
                      <Home className="w-4 h-4 mr-2" />
                      Go to Home
                    </Button>
                  </Link>
                  {isAuthenticated && (
                    <Link href="/user/dashboard" className="flex-1">
                      <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white">
                        View Dashboard
                      </Button>
                    </Link>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  )
}

