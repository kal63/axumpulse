'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Eye, EyeOff, Phone, Lock, LogIn, Shield, UserCheck, Users, Star, Globe, Activity } from 'lucide-react'
import { useAuth } from '@/contexts/auth-context'
import { apiClient } from '@/lib/api-client'
import Header from '@/components/shared/header'
import { Logo } from '@/components/shared/Logo'
import { motion } from 'framer-motion'
import { UnifiedBackground } from '@/components/landing/ui/UnifiedBackground'

export default function LoginPage() {
  const [formData, setFormData] = useState({
    phone: '',
    password: ''
  })
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [scrolled, setScrolled] = useState(false)
  const [devLoginEnabled, setDevLoginEnabled] = useState(false)
  const { login, dev_login, isLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    let cancelled = false
    void (async () => {
      const res = await apiClient.getClientConfig()
      if (!cancelled && res.success && res.data?.devLoginEnabled === true) {
        setDevLoginEnabled(true)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    // Clear error when user starts typing
    if (error) setError('')
  }

  

  const handleQuickLogin = async (role: string) => {

  // Optional: update UI fields so the form visually reflects the login
  //setFormData({ phone, password })

  await handleQuickSubmit(undefined, {role})
}

// const handleQuickLogin = async (phone: string, password: string) => {
  //   console.log('Quick login with:', phone, password)
  //   setFormData({ phone, password })
  //   setError('')
  //   // Directly call the login logic
  //   // Copy the validation and login logic from handleSubmit
  //   // Or, better, refactor handleSubmit to accept optional params
  //   // For now, call handleSubmit with a fake event that matches the type
  //   await handleSubmit({
  //     preventDefault: () => {},
  //   } as unknown as React.FormEvent)
  // }

const handleQuickSubmit = async (
  e?: React.FormEvent<HTMLFormElement>,
  override?: { role: string }
) => {
  // Only prevent default if this came from a real form submit
  e?.preventDefault()

  setError('')
  const role = override?.role;

  if (!role) {
    setError('quick login role not specified')
    return
  }

  const result = await dev_login(role);

  if (result.success) {
    const currentUser = result.user

    if (currentUser?.isAdmin) router.push('/admin/dashboard')
    else if (currentUser?.isTrainer) router.push('/trainer/dashboard')
    else if(currentUser?.isMedical) router.push('/medical/dashboard')
    else router.push('/user/dashboard')
  } else {
    setError(result.error || 'Login failed')
  }
}

  const handleSubmit = async (
  e?: React.FormEvent<HTMLFormElement>,
  override?: { phone: string; password: string }
) => {
  // Only prevent default if this came from a real form submit
  e?.preventDefault()

  setError('')

  const phoneInput = override?.phone ?? formData.phone
  const passwordInput = override?.password ?? formData.password

  if (!phoneInput || !passwordInput) {
    setError('Please fill in all fields')
    return
  }

  const phoneRegex = /^(\+251|251|0)?[79][0-9]{8}$/
  if (!phoneRegex.test(phoneInput.replace(/\s/g, ''))) {
    setError('Please enter a valid Ethiopian phone number')
    return
  }

  let normalizedPhone = phoneInput.replace(/\s/g, '')
  if (normalizedPhone.startsWith('0')) {
    normalizedPhone = '+251' + normalizedPhone.substring(1)
  } else if (normalizedPhone.startsWith('251')) {
    normalizedPhone = '+' + normalizedPhone
  } else if (!normalizedPhone.startsWith('+251')) {
    normalizedPhone = '+251' + normalizedPhone
  }

  const result = await login({
    phone: normalizedPhone,
    password: passwordInput
  })

  if (result.success && result.telcoRegistrationPending && result.phone) {
    router.push(`/register?telco=1&phone=${encodeURIComponent(result.phone)}`)
    return
  }

  if (result.success) {
    const currentUser = result.user
    if (!currentUser) {
      setError('Login failed')
      return
    }

    if (currentUser?.isAdmin) router.push('/admin/dashboard')
    else if (currentUser?.isTrainer) router.push('/trainer/dashboard')
    else if(currentUser?.isMedical) router.push('/medical/dashboard')
    else router.push('/user/dashboard')
  } else {
    setError(result.error || 'Login failed')
  }
}

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="landing-ethio min-h-screen relative overflow-hidden">
      <UnifiedBackground variant="ethio" />

      <Header scrolled={scrolled} showLogin={false} variant="ethio" />

      <div className="relative z-20 flex min-h-screen items-center justify-center p-4 pt-24 pb-16">
        <div className="w-full max-w-md">
          <motion.div
            initial={{ opacity: 0, y: -24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, ease: 'easeOut' }}
            className="mb-8 text-center"
          >
            <div className="mb-6 flex justify-center">
              <Logo size="md" withText={false} href="/" />
            </div>

            <motion.h1
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.08, duration: 0.55 }}
              className="font-landing-display text-[clamp(2rem,5vw,2.75rem)] uppercase tracking-tight text-[hsl(222,47%,8%)] mb-3"
            >
              Welcome back
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.16, duration: 0.55 }}
              className="text-lg text-[hsl(222,20%,38%)] mb-5"
            >
              Sign in to your{' '}
              <span className="font-semibold text-[hsl(210,95%,28%)]">Compound 360</span> account
            </motion.p>

            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.22, duration: 0.5 }}
              className="flex flex-wrap items-center justify-center gap-2"
            >
              <span className="inline-flex items-center gap-2 rounded-full border border-[hsl(222,47%,8%)]/10 bg-white/80 px-3 py-1.5 text-xs font-semibold text-[hsl(222,47%,8%)] shadow-sm backdrop-blur-sm">
                <Activity className="h-3.5 w-3.5 text-[hsl(210,95%,32%)]" />
                AI-powered fitness
              </span>
              <span className="inline-flex items-center gap-2 rounded-full border border-[hsl(222,47%,8%)]/10 bg-white/80 px-3 py-1.5 text-xs font-semibold text-[hsl(222,47%,8%)] shadow-sm backdrop-blur-sm">
                <Globe className="h-3.5 w-3.5 text-[hsl(78,80%,38%)]" />
                4 languages
              </span>
            </motion.div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.55 }}
            className="relative"
          >
            <Card className="relative overflow-hidden rounded-2xl border border-slate-200/90 bg-white/95 shadow-xl backdrop-blur-sm">
              <CardHeader className="space-y-1 pb-4 pt-8">
                <div className="text-center">
                  <div className="mb-4 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-[hsl(78,88%,55%)] text-[hsl(222,47%,8%)] shadow-md ring-1 ring-[hsl(222,47%,8%)]/8">
                    <LogIn className="h-7 w-7" />
                  </div>
                  <CardTitle className="font-landing-display text-2xl uppercase tracking-tight text-[hsl(222,47%,8%)] mb-2">
                    Sign in
                  </CardTitle>
                  <CardDescription className="text-base text-[hsl(222,20%,40%)]">
                    Enter your credentials to access your account
                  </CardDescription>
                </div>
              </CardHeader>

              <CardContent className="px-6 pb-8 sm:px-8">
                <form onSubmit={handleSubmit} className="space-y-6">
                  {error && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.98 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.25 }}
                    >
                      <Alert variant="destructive" className="border-red-200 bg-red-50 text-red-900">
                        <AlertDescription className="text-red-900">{error}</AlertDescription>
                      </Alert>
                    </motion.div>
                  )}

                  {/* Phone Number Input */}
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.08, duration: 0.45 }}
                    className="space-y-3"
                  >
                    <Label htmlFor="phone" className="flex items-center text-sm font-semibold text-[hsl(222,28%,12%)]">
                      <Phone className="mr-2 h-4 w-4 text-[var(--ethio-deep-blue)]" />
                      Phone number
                    </Label>
                    <div className="relative">
                      <Input
                        id="phone"
                        name="phone"
                        type="tel"
                        placeholder="+251 9XX XXX XXX"
                        value={formData.phone}
                        onChange={handleInputChange}
                        className="relative h-12 rounded-xl border border-slate-200 bg-white pl-12 text-[hsl(222,47%,8%)] shadow-sm placeholder:text-[hsl(222,12%,50%)] focus-visible:border-[var(--ethio-deep-blue)] focus-visible:ring-[var(--ethio-deep-blue)]/20"
                        required
                      />
                      <Phone className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[var(--ethio-deep-blue)]" />
                    </div>
                  </motion.div>

                  {/* Password Input */}
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.12, duration: 0.45 }}
                    className="space-y-3"
                  >
                    <Label htmlFor="password" className="flex items-center text-sm font-semibold text-[hsl(222,28%,12%)]">
                      <Lock className="mr-2 h-4 w-4 text-[var(--ethio-deep-blue)]" />
                      Password
                    </Label>
                    <div className="relative">
                      <Input
                        id="password"
                        name="password"
                        type={showPassword ? 'text' : 'password'}
                        placeholder="Enter your password"
                        value={formData.password}
                        onChange={handleInputChange}
                        className="relative h-12 rounded-xl border border-slate-200 bg-white pl-12 pr-12 text-[hsl(222,47%,8%)] shadow-sm placeholder:text-[hsl(222,12%,50%)] focus-visible:border-[var(--ethio-deep-blue)] focus-visible:ring-[var(--ethio-deep-blue)]/20"
                        required
                      />
                      <Lock className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[var(--ethio-deep-blue)]" />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[hsl(222,20%,45%)] transition-colors hover:text-[var(--ethio-deep-blue)]"
                      >
                        {showPassword ? <EyeOff /> : <Eye />}
                      </button>
                    </div>
                  </motion.div>

                  {/* Remember Me & Forgot Password */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.16, duration: 0.45 }}
                    className="flex items-center justify-between text-sm pt-2"
                  >
                    <label className="group flex cursor-pointer items-center space-x-3">
                      <input type="checkbox" className="sr-only" />
                      <span
                        aria-hidden
                        className="flex h-5 w-5 items-center justify-center rounded-md border-2 border-slate-300 transition-colors group-hover:border-[var(--ethio-deep-blue)] group-has-[:checked]:border-[var(--ethio-deep-blue)] group-has-[:checked]:bg-[hsl(78,88%,55%)]/35"
                      >
                        <span className="h-2 w-2 rounded-sm bg-[var(--ethio-deep-blue)] opacity-0 transition-opacity group-has-[:checked]:opacity-100" />
                      </span>
                      <span className="text-[hsl(222,20%,40%)] transition-colors group-hover:text-[hsl(222,47%,8%)]">
                        Remember me
                      </span>
                    </label>
                    <Link
                      href="/forgot-password"
                      className="font-medium text-[var(--ethio-deep-blue)] transition-colors hover:underline"
                    >
                      Forgot password?
                    </Link>
                  </motion.div>

                  {/* Submit Button */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2, duration: 0.45 }}
                  >
                    <Button
                      type="submit"
                      className="user-app-btn-primary h-12 w-full cursor-pointer rounded-xl text-base font-semibold shadow-md transition-opacity hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-50"
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <div className="flex items-center space-x-3">
                          <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          <span className="font-semibold">Signing in...</span>
                        </div>
                      ) : (
                        <div className="flex items-center space-x-3">
                          <LogIn className="w-6 h-6" />
                          <span className="font-semibold">Sign In</span>
                        </div>
                      )}
                    </Button>
                  </motion.div>
                </form>

                {/* Divider */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.35, duration: 0.45 }}
                  className="mt-8 text-center"
                >
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-slate-200" />
                    </div>
                    <div className="relative flex justify-center text-sm">
                      <span className="rounded-full bg-white/95 px-4 py-0.5 text-[hsl(222,20%,40%)]">
                        New to Compound 360?
                      </span>
                    </div>
                  </div>
                  <p className="mt-4 text-sm text-[hsl(222,20%,38%)]">
                    <Link href="/register" className="font-semibold text-[var(--ethio-deep-blue)] hover:underline">
                      Create an account
                    </Link>
                    <span className="mx-2 text-[hsl(222,12%,70%)]">·</span>
                    <a
                      href="sms:6313?body=OK"
                      className="font-semibold text-[hsl(210,95%,28%)] hover:underline"
                    >
                      SMS 6313
                    </a>
                  </p>
                  <p className="mt-1 text-xs text-[hsl(222,20%,45%)]">Send &quot;OK&quot; to get started via SMS</p>
                </motion.div>
              </CardContent>
            </Card>

            {devLoginEnabled ? (
              /* Demo / quick login (only when API ENABLE_DEV_LOGIN=true) */
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.28, duration: 0.55 }}
                className="mt-8"
              >
                <Card className="rounded-2xl border border-slate-200/90 bg-white/90 shadow-lg backdrop-blur-sm">
                  <CardContent className="pb-6 pt-6">
                    <div className="mb-6 text-center">
                      <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-[hsl(78,88%,55%)] text-[hsl(222,47%,8%)] shadow-md ring-1 ring-[hsl(222,47%,8%)]/8">
                        <Star className="h-6 w-6" />
                      </div>
                      <h3 className="font-landing-display mb-2 text-lg uppercase tracking-tight text-[hsl(222,47%,8%)]">
                        Quick login
                      </h3>
                      <p className="text-sm text-[hsl(222,20%,40%)]">Try demo accounts when your API exposes them</p>
                    </div>

                    <div className="grid grid-cols-1 gap-3">
                      <motion.div whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}>
                        <Button
                          type="button"
                          variant="outline"
                          size="lg"
                          className="h-11 w-full border-slate-200 bg-white text-sm font-semibold text-[hsl(222,47%,8%)] shadow-sm hover:bg-slate-50 hover:text-[hsl(210,95%,28%)]"
                          onClick={() => handleQuickLogin('admin')}
                          disabled={isLoading}
                        >
                          <Shield className="mr-3 h-5 w-5 text-[hsl(210,95%,32%)]" />
                          Admin
                        </Button>
                      </motion.div>

                      <motion.div whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}>
                        <Button
                          type="button"
                          variant="outline"
                          size="lg"
                          className="h-11 w-full border-slate-200 bg-white text-sm font-semibold text-[hsl(222,47%,8%)] shadow-sm hover:bg-slate-50 hover:text-[hsl(210,95%,28%)]"
                          onClick={() => handleQuickLogin('trainer')}
                          disabled={isLoading}
                        >
                          <UserCheck className="mr-3 h-5 w-5 text-[hsl(210,95%,32%)]" />
                          Trainer
                        </Button>
                      </motion.div>

                      <motion.div whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}>
                        <Button
                          type="button"
                          variant="outline"
                          size="lg"
                          className="h-11 w-full border-slate-200 bg-white text-sm font-semibold text-[hsl(222,47%,8%)] shadow-sm hover:bg-[hsl(78,88%,96%)] hover:text-[hsl(210,95%,28%)]"
                          onClick={() => handleQuickLogin('user')}
                          disabled={isLoading}
                        >
                          <Users className="mr-3 h-5 w-5 text-[hsl(78,80%,38%)]" />
                          User
                        </Button>
                      </motion.div>

                      <motion.div whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}>
                        <Button
                          type="button"
                          variant="outline"
                          size="lg"
                          className="h-11 w-full border-slate-200 bg-white text-sm font-semibold text-[hsl(222,47%,8%)] shadow-sm hover:bg-slate-50 hover:text-[hsl(210,95%,28%)]"
                          onClick={() => handleQuickLogin('medical')}
                          disabled={isLoading}
                        >
                          <Users className="mr-3 h-5 w-5 text-[hsl(210,95%,32%)]" />
                          Medical professional
                        </Button>
                      </motion.div>
                    </div>

                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.4, duration: 0.45 }}
                      className="mt-5 rounded-xl border border-slate-200/90 bg-[hsl(80,30%,98%)] p-3"
                    >
                      <p className="text-center text-xs text-[hsl(222,20%,42%)]">
                        <span className="font-semibold text-[hsl(210,95%,28%)]">Note:</span> quick login needs a reachable API
                        (same host as in <code className="rounded bg-white/80 px-1">NEXT_PUBLIC_API_URL</code>).
                      </p>
                    </motion.div>
                  </CardContent>
                </Card>
              </motion.div>
            ) : null}
          </motion.div>
        </div>
      </div>
    </div>
  )
}
