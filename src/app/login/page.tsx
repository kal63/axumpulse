'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Eye, EyeOff, Phone, Lock, LogIn, Shield, UserCheck, Users, Sparkles, Zap, Heart, Star, Brain, Globe, Activity } from 'lucide-react'
import { useAuth } from '@/contexts/auth-context'
import { useRole } from '@/contexts/role-context'
import Header from '@/components/shared/header'
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
  const { login, dev_login, isLoading } = useAuth()
  const { availableRoles } = useRole()
  const router = useRouter()

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

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Unified Background */}
      <UnifiedBackground />

      {/* Header */}
      <Header scrolled={scrolled} showLogin={false} />

      {/* Main Content */}
      <div className="relative z-20 flex items-center justify-center min-h-screen p-4 pt-20">
        <div className="w-full max-w-md">
          {/* Animated Logo and Header */}
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="text-center mb-8"
          >
            <div className="relative mx-auto w-24 h-24 mb-6">
              {/* Glowing background */}
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500 via-purple-500 to-cyan-400 rounded-3xl blur-xl opacity-60 animate-pulse"></div>

              {/* Main logo */}
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                className="relative w-full h-full bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-3xl flex items-center justify-center shadow-2xl border border-white/10"
              >
                <Brain className="w-12 h-12 text-cyan-400" />
              </motion.div>

              {/* Floating sparkles */}
              <motion.div
                animate={{
                  scale: [1, 1.2, 1],
                  opacity: [0.5, 1, 0.5]
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
                className="absolute -top-2 -right-2 w-6 h-6 bg-yellow-400 rounded-full flex items-center justify-center"
              >
                <Sparkles className="w-3 h-3 text-yellow-800" />
              </motion.div>
            </div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.8 }}
              className="text-5xl font-bold bg-gradient-to-r from-white via-cyan-100 to-white bg-clip-text text-transparent mb-4"
            >
              Welcome Back
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.8 }}
              className="text-slate-300 text-lg mb-4"
            >
              Sign in to your <span className="font-semibold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">Compound 360</span> account
            </motion.p>

            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.6, duration: 0.8 }}
              className="flex items-center justify-center space-x-3"
            >
              <Badge variant="secondary" className="bg-cyan-500/20 text-cyan-200 border-cyan-400/30 px-4 py-2">
                <Activity className="w-4 h-4 mr-2" />
                AI-Powered Fitness
              </Badge>
              <Badge variant="secondary" className="bg-purple-500/20 text-purple-200 border-purple-400/30 px-4 py-2">
                <Globe className="w-4 h-4 mr-2" />
                4 Languages
              </Badge>
            </motion.div>
          </motion.div>

          {/* Login Form Card */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.8 }}
            className="relative"
          >
            <Card className="relative shadow-2xl border-0 bg-slate-900/80 backdrop-blur-xl overflow-hidden">
              {/* Animated border gradient */}
              <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/20 via-purple-500/20 to-blue-500/20 rounded-lg"></div>
              <div className="absolute inset-[1px] bg-slate-900/90 rounded-lg"></div>

              <CardHeader className="relative space-y-1 pb-6 pt-8">
                <div className="text-center">
                  <motion.div
                    animate={{
                      scale: [1, 1.05, 1],
                      boxShadow: [
                        '0 0 20px rgba(6, 182, 212, 0.3)',
                        '0 0 40px rgba(6, 182, 212, 0.6)',
                        '0 0 20px rgba(6, 182, 212, 0.3)'
                      ]
                    }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-2xl mb-4 shadow-lg"
                  >
                    <LogIn className="w-8 h-8 text-white" />
                  </motion.div>
                  <CardTitle className="text-3xl font-bold bg-gradient-to-r from-white to-cyan-200 bg-clip-text text-transparent mb-2">
                    Sign In
                  </CardTitle>
                  <CardDescription className="text-slate-400 text-lg">
                    Enter your credentials to access your account
                  </CardDescription>
                </div>
              </CardHeader>

              <CardContent className="relative px-8 pb-8">
                <form onSubmit={handleSubmit} className="space-y-6">
                  {error && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.3 }}
                    >
                      <Alert variant="destructive" className="border-red-500/50 bg-red-900/20 backdrop-blur-sm">
                        <AlertDescription className="text-red-200">{error}</AlertDescription>
                      </Alert>
                    </motion.div>
                  )}

                  {/* Phone Number Input */}
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 1, duration: 0.6 }}
                    className="space-y-3"
                  >
                    <Label htmlFor="phone" className="text-sm font-semibold text-slate-300 flex items-center">
                      <Phone className="w-4 h-4 mr-2 text-cyan-400" />
                      Phone Number
                    </Label>
                    <div className="relative group">
                      <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/20 to-purple-500/20 rounded-lg blur-sm opacity-0 group-focus-within:opacity-100 transition-opacity duration-300"></div>
                      <Input
                        id="phone"
                        name="phone"
                        type="tel"
                        placeholder="+251 9XX XXX XXX"
                        value={formData.phone}
                        onChange={handleInputChange}
                        className="relative pl-12 h-14 bg-slate-800/50 text-white placeholder:text-slate-400 border-2 border-slate-600 focus:border-cyan-500 focus:ring-4 focus:ring-cyan-500/20 rounded-lg transition-all duration-300 shadow-lg backdrop-blur-sm"
                        required
                      />
                      <Phone className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-cyan-400" />
                    </div>
                  </motion.div>

                  {/* Password Input */}
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 1.2, duration: 0.6 }}
                    className="space-y-3"
                  >
                    <Label htmlFor="password" className="text-sm font-semibold text-slate-300 flex items-center">
                      <Lock className="w-4 h-4 mr-2 text-cyan-400" />
                      Password
                    </Label>
                    <div className="relative group">
                      <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/20 to-purple-500/20 rounded-lg blur-sm opacity-0 group-focus-within:opacity-100 transition-opacity duration-300"></div>
                      <Input
                        id="password"
                        name="password"
                        type={showPassword ? 'text' : 'password'}
                        placeholder="Enter your password"
                        value={formData.password}
                        onChange={handleInputChange}
                        className="relative pl-12 pr-12 h-14 bg-slate-800/50 text-white placeholder:text-slate-400 border-2 border-slate-600 focus:border-cyan-500 focus:ring-4 focus:ring-cyan-500/20 rounded-lg transition-all duration-300 shadow-lg backdrop-blur-sm"
                        required
                      />
                      <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-cyan-400" />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400 hover:text-cyan-400 cursor-pointer transition-colors duration-200"
                      >
                        {showPassword ? <EyeOff /> : <Eye />}
                      </button>
                    </div>
                  </motion.div>

                  {/* Remember Me & Forgot Password */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1.4, duration: 0.6 }}
                    className="flex items-center justify-between text-sm pt-2"
                  >
                    <label className="flex items-center space-x-3 cursor-pointer group">
                      <div className="relative">
                        <input
                          type="checkbox"
                          className="sr-only"
                        />
                        <div className="w-5 h-5 border-2 border-slate-400 rounded-md group-hover:border-cyan-400 transition-colors duration-200 flex items-center justify-center">
                          <div className="w-2 h-2 bg-cyan-400 rounded-sm opacity-0 group-has-[:checked]:opacity-100 transition-opacity duration-200"></div>
                        </div>
                      </div>
                      <span className="text-slate-400 group-hover:text-cyan-400 transition-colors duration-200">Remember me</span>
                    </label>
                    <Link
                      href="/forgot-password"
                      className="text-cyan-400 hover:text-cyan-300 cursor-pointer font-medium transition-colors duration-200 hover:underline"
                    >
                      Forgot password?
                    </Link>
                  </motion.div>

                  {/* Submit Button */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1.6, duration: 0.6 }}
                  >
                    <Button
                      type="submit"
                      className="w-full h-14 bg-gradient-to-r from-cyan-600 via-blue-600 to-purple-600 hover:from-cyan-700 hover:via-blue-700 hover:to-purple-700 text-white cursor-pointer rounded-lg shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none font-semibold text-lg"
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
                  transition={{ delay: 1.8, duration: 0.6 }}
                  className="mt-8 text-center"
                >
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-slate-600"></div>
                    </div>
                    <div className="relative flex justify-center text-sm">
                      <span className="px-4 bg-slate-900 text-slate-400">New to AxumPulse?</span>
                    </div>
                  </div>
                  <p className="mt-4 text-sm text-slate-400">
                    Don't have an account?{' '}
                    <a
                      href="sms:1234?body=OK"
                      className="text-cyan-400 hover:text-cyan-300 font-semibold cursor-pointer transition-colors duration-200 hover:underline"
                    >
                      Send SMS to 1234
                    </a>
                  </p>
                  <p className="mt-2 text-xs text-slate-500">
                    Send "OK" to get started
                  </p>
                </motion.div>
              </CardContent>
            </Card>

            {/* Demo Credentials */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 2, duration: 0.8 }}
              className="mt-8"
            >
              <Card className="bg-gradient-to-r from-slate-800/50 to-slate-700/50 border-slate-600/50 backdrop-blur-sm shadow-xl">
                <CardContent className="pt-6 pb-6">
                  <div className="text-center mb-6">
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                      className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-xl mb-4 shadow-lg"
                    >
                      <Star className="w-6 h-6 text-white" />
                    </motion.div>
                    <h3 className="text-lg font-semibold bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent mb-2">
                      Quick Login
                    </h3>
                    <p className="text-sm text-slate-400">
                      Try our demo accounts
                    </p>
                  </div>

                  <div className="grid grid-cols-1 gap-4">
                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Button
                        type="button"
                        variant="outline"
                        size="lg"
                        className="w-full h-12 text-sm bg-gradient-to-r from-emerald-900/50 to-emerald-800/50 hover:from-emerald-800/70 hover:to-emerald-700/70 border-emerald-500/50 text-emerald-200 shadow-lg hover:shadow-xl transition-all duration-300"
                        onClick={() => handleQuickLogin('admin')}
                        disabled={isLoading}
                      >
                        <Shield className="w-5 h-5 mr-3" />
                        Admin Login
                      </Button>
                    </motion.div>

                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Button
                        type="button"
                        variant="outline"
                        size="lg"
                        className="w-full h-12 text-sm bg-gradient-to-r from-blue-900/50 to-blue-800/50 hover:from-blue-800/70 hover:to-blue-700/70 border-blue-500/50 text-blue-200 shadow-lg hover:shadow-xl transition-all duration-300"
                        onClick={() => handleQuickLogin('trainer')}
                        disabled={isLoading}
                      >
                        <UserCheck className="w-5 h-5 mr-3" />
                        Trainer Login
                      </Button>
                    </motion.div>

                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Button
                        type="button"
                        variant="outline"
                        size="lg"
                        className="w-full h-12 text-sm bg-gradient-to-r from-purple-900/50 to-purple-800/50 hover:from-purple-800/70 hover:to-purple-700/70 border-purple-500/50 text-purple-200 shadow-lg hover:shadow-xl transition-all duration-300"
                        onClick={() => handleQuickLogin('user')}
                        disabled={isLoading}
                      >
                        <Users className="w-5 h-5 mr-3" />
                        User Login
                      </Button>
                    </motion.div>

                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Button
                        type="button"
                        variant="outline"
                        size="lg"
                        className="w-full h-12 text-sm bg-gradient-to-r from-purple-900/50 to-purple-800/50 hover:from-purple-800/70 hover:to-purple-700/70 border-purple-500/50 text-purple-200 shadow-lg hover:shadow-xl transition-all duration-300"
                        onClick={() => handleQuickLogin('medical')}
                        disabled={isLoading}
                      >
                        <Users className="w-5 h-5 mr-3" />
                        Medical-Professional Login
                      </Button>
                    </motion.div>
                  </div>

                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 2.5, duration: 0.6 }}
                    className="mt-6 p-4 bg-slate-800/50 rounded-lg border border-slate-600/50"
                  >
                    <p className="text-xs text-slate-400 text-center">
                      <span className="font-medium text-cyan-400">Note:</span> Make sure the backend API is running on port 4000
                    </p>
                  </motion.div>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
