'use client'

import { useState, useEffect, Suspense } from 'react'
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

function PaymentSuccessContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { user, isAuthenticated } = useAuth()
  const [scrolled, setScrolled] = useState(false)

  const [status, setStatus] = useState<'loading' | 'success' | 'failed'>('loading')
  const [subscription, setSubscription] = useState<UserSubscription | null>(null)
  const [error, setError] = useState('')
  const [isConsultPurchase, setIsConsultPurchase] = useState(false)
  const [consultQuantity, setConsultQuantity] = useState<number>(0)
  const [availableConsults, setAvailableConsults] = useState<number>(0)
  const txRef = searchParams.get('tx_ref')
  const appRedirect = searchParams.get('app_redirect') || searchParams.get('amp;app_redirect')

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    if (!txRef) {
      setStatus('failed')
      setError('No transaction reference found')
      return
    }

    // Automatically verify payment and activate subscription
    const checkSubscription = async (retryCount = 0, maxRetries = 3) => {
      try {
        if (!isAuthenticated) {
          setStatus('success')
          return
        }

        // Immediately verify and activate subscription on first attempt
        if (txRef && retryCount === 0) {
          try {
            // Call verify endpoint which automatically activates subscription or processes consult purchase
            const verifyResponse = await apiClient.verifyPayment(txRef)
            
            if (verifyResponse.success && verifyResponse.data) {
              // Check if this is a consult purchase
              const callbackData = verifyResponse.data.transaction?.callbackData
              let parsedCallbackData = callbackData
              if (callbackData && typeof callbackData === 'string') {
                try {
                  parsedCallbackData = JSON.parse(callbackData)
                } catch (e) {
                  // If parsing fails, check if it's a string containing consult_purchase
                  if (callbackData.includes('consult_purchase')) {
                    parsedCallbackData = { type: 'consult_purchase' }
                  }
                }
              }
              
              if (parsedCallbackData && parsedCallbackData.type === 'consult_purchase') {
                setIsConsultPurchase(true)
                setConsultQuantity(parsedCallbackData.quantity || 0)
                
                // Fetch updated consult balance
                const balanceResponse = await apiClient.getConsultBalance()
                if (balanceResponse.success && balanceResponse.data) {
                  setAvailableConsults(balanceResponse.data.availableConsults || 0)
                }
                
                setStatus('success')
                return
              }
              
              // If subscription was activated, use it immediately
              if (verifyResponse.data.subscription) {
                setSubscription(verifyResponse.data.subscription)
                setStatus('success')
                return
              }
              
              // If payment was successful but subscription not created yet, wait a moment and check again
              if (verifyResponse.data.transaction?.status === 'success') {
                // Wait 2 seconds for activation to complete, then check subscription
                await new Promise(resolve => setTimeout(resolve, 2000))
              }
            }
          } catch (verifyError) {
            console.error('[Payment Success] Error verifying payment:', verifyError)
          }
        }

        // Check if this might be a consult purchase (if no subscription found)
        if (!subscription) {
          // Try to get consult balance to see if consults were added
          try {
            const balanceResponse = await apiClient.getConsultBalance()
            if (balanceResponse.success && balanceResponse.data) {
              const newBalance = balanceResponse.data.availableConsults || 0
              // If balance increased, this might be a consult purchase
              // We'll check the transaction callbackData in verify response
              if (txRef) {
                const verifyResponse = await apiClient.verifyPayment(txRef)
                const callbackData = verifyResponse.data?.transaction?.callbackData
                let parsedCallbackData = callbackData
                if (callbackData && typeof callbackData === 'string') {
                  try {
                    parsedCallbackData = JSON.parse(callbackData)
                  } catch (e) {
                    if (callbackData.includes('consult_purchase')) {
                      parsedCallbackData = { type: 'consult_purchase' }
                    }
                  }
                }
                
                if (parsedCallbackData && parsedCallbackData.type === 'consult_purchase') {
                  setIsConsultPurchase(true)
                  setConsultQuantity(parsedCallbackData.quantity || 0)
                  setAvailableConsults(newBalance)
                  setStatus('success')
                  return
                }
              }
            }
          } catch (e) {
            // Not a consult purchase, continue with subscription check
          }
        }

        // Check subscription status
        const response = await apiClient.getMySubscription()
        if (response.success && response.data?.subscription) {
          setSubscription(response.data.subscription)
          setStatus('success')
          return
        }

        // If no subscription found and we have retries left, try again
        if (retryCount < maxRetries) {
          const waitTime = (retryCount + 1) * 2000 // 2s, 4s, 6s
          await new Promise(resolve => setTimeout(resolve, waitTime))
          
          // Try verify again (in case callback processed in background)
          if (txRef) {
            try {
              const verifyResponse = await apiClient.verifyPayment(txRef)
              if (verifyResponse.success && verifyResponse.data?.subscription) {
                setSubscription(verifyResponse.data.subscription)
                setStatus('success')
                return
              }
            } catch (e) {
              // Continue to retry
            }
          }
          
          checkSubscription(retryCount + 1, maxRetries)
        } else {
          // After all retries, show success (subscription may activate in background)
          setStatus('success')
          setError('Your payment was successful! Your subscription is being activated and will be available shortly.')
        }
      } catch (error: any) {
        console.error('[Payment Success] Error:', error)
        if (retryCount >= maxRetries) {
          setStatus('success')
          setError('Your payment was successful! Your subscription is being activated and will be available shortly.')
        } else {
          const waitTime = (retryCount + 1) * 2000
          await new Promise(resolve => setTimeout(resolve, waitTime))
          checkSubscription(retryCount + 1, maxRetries)
        }
      }
    }

    checkSubscription()
  }, [txRef, isAuthenticated])

  useEffect(() => {
    // For mobile payment flow: after web verification succeeds on this page,
    // bounce back into the app deep-link callback so app state can refresh.
    if (status !== 'success' || !appRedirect || !txRef) return
    const timer = setTimeout(() => {
      try {
        const target = appRedirect.includes('?')
          ? `${appRedirect}&tx_ref=${encodeURIComponent(txRef)}`
          : `${appRedirect}?tx_ref=${encodeURIComponent(txRef)}`
        window.location.href = target
      } catch (e) {
        // Keep page usable even if redirect URL is malformed.
      }
    }, 1200)
    return () => clearTimeout(timer)
  }, [status, appRedirect, txRef])

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  if (status === 'loading') {
    return (
      <div className="landing-ethio min-h-screen relative overflow-hidden flex flex-col">
        <UnifiedBackground variant="ethio" />
        <Header scrolled={scrolled} variant="ethio" />
        <div className="container mx-auto px-4 py-8 md:py-12 lg:py-16 flex-1 flex items-center relative z-10">
          <Card className="max-w-2xl mx-auto w-full overflow-hidden rounded-2xl border border-slate-200/90 bg-white/95 shadow-xl backdrop-blur-sm">
            <CardContent className="pt-6 text-center">
              <Loader2 className="w-12 h-12 animate-spin text-[hsl(210,95%,28%)] mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-[hsl(222,47%,8%)] mb-2">Verifying your payment...</h2>
              <p className="text-[hsl(222,20%,40%)]">Please wait while we confirm your subscription</p>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="landing-ethio min-h-screen relative overflow-hidden flex flex-col">
      <UnifiedBackground variant="ethio" />
      <Header scrolled={scrolled} variant="ethio" />
      
      <div className="container mx-auto px-4 py-8 md:py-12 lg:py-16 flex-1 flex items-center relative z-10">
        <div className="max-w-2xl mx-auto w-full">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Card className="overflow-hidden rounded-2xl border border-slate-200/90 bg-white/95 shadow-xl backdrop-blur-sm">
              <CardHeader>
                {status === 'success' ? (
                  <>
                    <div className="flex items-center justify-center mb-4">
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: 'spring', stiffness: 200, damping: 15 }}
                      >
                        <CheckCircle className="w-16 h-16 text-[hsl(210,95%,28%)]" />
                      </motion.div>
                    </div>
                    <CardTitle className="text-3xl font-bold text-[hsl(222,47%,8%)] text-center">
                      Payment Successful!
                    </CardTitle>
                    <CardDescription className="text-[hsl(222,20%,40%)] text-center">
                      {isConsultPurchase 
                        ? `You have successfully purchased ${consultQuantity} consult(s)!`
                        : 'Your subscription has been activated successfully'
                      }
                    </CardDescription>
                  </>
                ) : (
                  <>
                    <div className="flex items-center justify-center mb-4">
                      <CheckCircle className="w-16 h-16 text-[hsl(78,88%,55%)]" />
                    </div>
                    <CardTitle className="text-3xl font-bold text-[hsl(222,47%,8%)] text-center">
                      Payment Successful!
                    </CardTitle>
                    <CardDescription className="text-[hsl(222,20%,40%)] text-center">
                      {error || "Your payment was successful! Your subscription is being activated and will be available shortly."}
                    </CardDescription>
                  </>
                )}
              </CardHeader>

              <CardContent className="space-y-6">
                {status === 'success' && isConsultPurchase && (
                  <div className="rounded-xl border border-slate-200/90 bg-white/80 p-4 shadow-sm space-y-3">
                    <h3 className="text-lg font-semibold text-[hsl(222,47%,8%)]">Consult Purchase Details</h3>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div className="text-[hsl(222,20%,40%)]">Consults Purchased:</div>
                      <div className="text-[hsl(222,47%,8%)] font-semibold">{consultQuantity}</div>
                      <div className="text-[hsl(222,20%,40%)]">Available Consults:</div>
                      <div className="text-[hsl(222,47%,8%)] font-semibold">{availableConsults}</div>
                    </div>
                    <p className="text-sm text-[hsl(222,20%,40%)] mt-3">
                      You can now book consultations with medical professionals using your available consults.
                    </p>
                  </div>
                )}

                {status === 'success' && subscription && !isConsultPurchase && (
                  <div className="rounded-xl border border-slate-200/90 bg-white/80 p-4 shadow-sm space-y-3">
                    <h3 className="text-lg font-semibold text-[hsl(222,47%,8%)]">Subscription Details</h3>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div className="text-[hsl(222,20%,40%)]">Plan:</div>
                      <div className="text-[hsl(222,47%,8%)] font-semibold">{subscription.subscriptionPlan?.name || 'N/A'}</div>
                      <div className="text-[hsl(222,20%,40%)]">Trainer:</div>
                      <div className="text-[hsl(222,47%,8%)] font-semibold">
                        {subscription.trainer?.name || `Trainer #${subscription.trainerId}`}
                      </div>
                      <div className="text-[hsl(222,20%,40%)]">Duration:</div>
                      <div className="text-[hsl(222,47%,8%)] font-semibold capitalize">
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
                      <div className="text-[hsl(222,47%,8%)] font-semibold">
                        {formatDate(subscription.expiresAt)}
                      </div>
                    </div>
                  </div>
                )}

                {txRef && (
                  <div className="rounded-xl border border-slate-200/90 bg-white/80 p-3 shadow-sm">
                    <p className="text-xs text-[hsl(222,20%,45%)]">Transaction Reference:</p>
                    <p className="text-sm text-[hsl(222,47%,8%)] font-mono">{txRef}</p>
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
                  {appRedirect && status === 'success' && (
                    <Button
                      className="w-full sm:w-auto user-app-btn-primary"
                      onClick={() => {
                        if (!txRef) return
                        const target = appRedirect.includes('?')
                          ? `${appRedirect}&tx_ref=${encodeURIComponent(txRef)}`
                          : `${appRedirect}?tx_ref=${encodeURIComponent(txRef)}`
                        window.location.href = target
                      }}
                    >
                      Open App
                    </Button>
                  )}
                  <Link href="/" className="flex-1">
                    <Button
                      variant="outline"
                      className="w-full border-slate-200 text-slate-700 hover:bg-slate-50"
                    >
                      <Home className="w-4 h-4 mr-2" />
                      Go to Home
                    </Button>
                  </Link>
                  {isAuthenticated && (
                    <>
                      {isConsultPurchase ? (
                        <Link href="/user/medical/consults/book" className="flex-1">
                          <Button className="w-full user-app-btn-primary">
                            <Calendar className="w-4 h-4 mr-2" />
                            Book Consult
                          </Button>
                        </Link>
                      ) : (
                        <Link href="/user/dashboard" className="flex-1">
                          <Button className="w-full user-app-btn-primary">
                            View Dashboard
                          </Button>
                        </Link>
                      )}
                    </>
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

export default function PaymentSuccessPage() {
  return (
    <Suspense fallback={
      <div className="landing-ethio min-h-screen relative overflow-hidden flex flex-col">
        <UnifiedBackground variant="ethio" />
        <Header scrolled variant="ethio" />
        <div className="container mx-auto px-4 py-8 md:py-12 lg:py-16 flex-1 flex items-center relative z-10">
          <div className="text-center">
            <Loader2 className="w-12 h-12 animate-spin text-[hsl(210,95%,28%)] mx-auto mb-4" />
            <p className="text-[hsl(222,20%,40%)]">Loading payment status...</p>
          </div>
        </div>
      </div>
    }>
      <PaymentSuccessContent />
    </Suspense>
  )
}

