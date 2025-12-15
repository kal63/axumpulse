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
import { Eye, EyeOff, Phone, Lock, LogIn, Shield, UserCheck, Users, Sparkles, Zap, Heart, Star } from 'lucide-react'
import { useAuth } from '@/contexts/auth-context'
import { useRole } from '@/contexts/role-context'
import Header from '@/components/shared/header'

export default function LoginPage() {
  const [formData, setFormData] = useState({
    phone: '',
    password: ''
  })
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [scrolled, setScrolled] = useState(false)
  const { login, isLoading } = useAuth()
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

  const handleQuickLogin = (phone: string, password: string) => {
    setFormData({ phone, password })
    setError('')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    // Basic validation
    if (!formData.phone || !formData.password) {
      setError('Please fill in all fields')
      return
    }

    // Validate Ethiopian phone number format
    const phoneRegex = /^(\+251|251|0)?[79][0-9]{8}$/
    if (!phoneRegex.test(formData.phone.replace(/\s/g, ''))) {
      setError('Please enter a valid Ethiopian phone number')
      return
    }

    // Normalize phone number
    let normalizedPhone = formData.phone.replace(/\s/g, '')
    if (normalizedPhone.startsWith('0')) {
      normalizedPhone = '+251' + normalizedPhone.substring(1)
    } else if (normalizedPhone.startsWith('251')) {
      normalizedPhone = '+' + normalizedPhone
    } else if (!normalizedPhone.startsWith('+251')) {
      normalizedPhone = '+251' + normalizedPhone
    }

    const result = await login({
      phone: normalizedPhone,
      password: formData.password
    })

    if (result.success) {
      // Use the user data directly from the login response
      const currentUser = result.user
      
      // Redirect based on user permissions
      if (currentUser?.isAdmin) {
        router.push('/admin/dashboard')
      } else if (currentUser?.isTrainer) {
        router.push('/trainer/dashboard')
      } else {
        router.push('/user/dashboard') // Future user dashboard
      }
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
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-emerald-900 to-slate-800 relative overflow-hidden">
      {/* Header */}
      <Header scrolled={scrolled} showLogin={false} />
      
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-emerald-500/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-500/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-500"></div>
      </div>

      {/* Floating Particles */}
      <div className="absolute inset-0">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-white/30 rounded-full animate-pulse"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${2 + Math.random() * 2}s`
            }}
          ></div>
        ))}
      </div>

      <div className="relative z-10 flex items-center justify-center min-h-screen p-4 pt-20">
        <div className="w-full max-w-md">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="relative mx-auto w-20 h-20 mb-6">
              <div className="absolute inset-0 bg-gradient-to-r from-emerald-400 via-emerald-500 to-emerald-600 rounded-2xl rotate-3 animate-pulse"></div>
              <div className="relative w-full h-full bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-2xl flex items-center justify-center shadow-2xl">
                <Zap className="w-10 h-10 text-white" />
              </div>
              <div className="absolute -top-1 -right-1 w-6 h-6 bg-yellow-400 rounded-full flex items-center justify-center">
                <Sparkles className="w-3 h-3 text-yellow-800" />
              </div>
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-white via-emerald-100 to-white bg-clip-text text-transparent mb-3">
              Welcome Back
            </h1>
            <p className="text-emerald-100/80 text-lg">
              Sign in to your <span className="font-semibold text-emerald-300">Compound 360</span> account
            </p>
            <div className="flex items-center justify-center space-x-2 mt-3">
              <Badge variant="secondary" className="bg-emerald-500/20 text-emerald-200 border-emerald-400/30">
                <Heart className="w-3 h-3 mr-1" />
                Premium Fitness
              </Badge>
            </div>
          </div>

          {/* Login Form */}
          <Card className="relative shadow-2xl border-0 bg-white/95 backdrop-blur-xl dark:bg-white/95 overflow-hidden">
            {/* Card Glow Effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/10 via-transparent to-blue-500/10"></div>
            
            <CardHeader className="relative space-y-1 pb-6 pt-8">
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-xl mb-4 shadow-lg">
                  <LogIn className="w-6 h-6 text-white" />
                </div>
                <CardTitle className="text-2xl font-bold text-gray-900 dark:text-gray-900 mb-2">Sign In</CardTitle>
                <CardDescription className="text-gray-600 dark:text-gray-600">
                  Enter your credentials to access your account
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent className="relative px-8 pb-8">
              <form onSubmit={handleSubmit} className="space-y-6">
                {error && (
                  <Alert variant="destructive" className="border-red-200 bg-red-50">
                    <AlertDescription className="text-red-800">{error}</AlertDescription>
                  </Alert>
                )}

                <div className="space-y-3">
                  <Label htmlFor="phone" className="text-sm font-semibold text-gray-700 dark:text-gray-700 flex items-center">
                    <Phone className="w-4 h-4 mr-2 text-emerald-600" />
                    Phone Number
                  </Label>
                  <div className="relative group">
                    <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/20 to-blue-500/20 rounded-lg blur-sm opacity-0 group-focus-within:opacity-100 transition-opacity duration-300"></div>
                    <Input
                      id="phone"
                      name="phone"
                      type="tel"
                      placeholder="+251 9XX XXX XXX"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className="relative pl-12 h-12 bg-white/80 text-gray-900 placeholder:text-gray-500 border-2 border-gray-200 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/20 rounded-lg transition-all duration-300 shadow-sm"
                      required
                    />
                    <Phone className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-emerald-600" />
                  </div>
                </div>

                <div className="space-y-3">
                  <Label htmlFor="password" className="text-sm font-semibold text-gray-700 dark:text-gray-700 flex items-center">
                    <Lock className="w-4 h-4 mr-2 text-emerald-600" />
                    Password
                  </Label>
                  <div className="relative group">
                    <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/20 to-blue-500/20 rounded-lg blur-sm opacity-0 group-focus-within:opacity-100 transition-opacity duration-300"></div>
                    <Input
                      id="password"
                      name="password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Enter your password"
                      value={formData.password}
                      onChange={handleInputChange}
                      className="relative pl-12 pr-12 h-12 bg-white/80 text-gray-900 placeholder:text-gray-500 border-2 border-gray-200 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/20 rounded-lg transition-all duration-300 shadow-sm"
                      required
                    />
                    <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-emerald-600" />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 hover:text-emerald-600 cursor-pointer transition-colors duration-200"
                    >
                      {showPassword ? <EyeOff /> : <Eye />}
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between text-sm pt-2">
                  <label className="flex items-center space-x-3 cursor-pointer group">
                    <div className="relative">
                      <input
                        type="checkbox"
                        className="sr-only"
                      />
                      <div className="w-5 h-5 border-2 border-gray-300 rounded-md group-hover:border-emerald-500 transition-colors duration-200 flex items-center justify-center">
                        <div className="w-2 h-2 bg-emerald-600 rounded-sm opacity-0 group-has-[:checked]:opacity-100 transition-opacity duration-200"></div>
                      </div>
                    </div>
                    <span className="text-gray-600 dark:text-gray-600 group-hover:text-emerald-600 transition-colors duration-200">Remember me</span>
                  </label>
                  <Link
                    href="/forgot-password"
                    className="text-emerald-600 hover:text-emerald-700 cursor-pointer font-medium transition-colors duration-200 hover:underline"
                  >
                    Forgot password?
                  </Link>
                </div>

                <Button
                  type="submit"
                  className="w-full h-12 bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white cursor-pointer rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <div className="flex items-center space-x-3">
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span className="font-semibold">Signing in...</span>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-3">
                      <LogIn className="w-5 h-5" />
                      <span className="font-semibold">Sign In</span>
                    </div>
                  )}
                </Button>
            </form>

              <div className="mt-8 text-center">
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-200"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-4 bg-white text-gray-500">New to AxumPulse?</span>
                  </div>
                </div>
                <p className="mt-4 text-sm text-gray-600 dark:text-gray-600">
                  Don't have an account?{' '}
                  <a
                    href="sms:1234?body=OK"
                    className="text-emerald-600 hover:text-emerald-700 font-semibold cursor-pointer transition-colors duration-200 hover:underline"
                  >
                    Send SMS to 1234
                  </a>
                </p>
                <p className="mt-2 text-xs text-gray-500 dark:text-gray-500">
                  Send "OK" to get started
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Demo Credentials */}
          <Card className="mt-8 bg-gradient-to-r from-emerald-50/80 to-blue-50/80 border-emerald-200/50 dark:bg-emerald-900/20 dark:border-emerald-800/50 backdrop-blur-sm shadow-lg">
            <CardContent className="pt-6 pb-6">
              <div className="text-center mb-4">
                <div className="inline-flex items-center justify-center w-8 h-8 bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-lg mb-3">
                  <Star className="w-4 h-4 text-white" />
                </div>
                <h3 className="text-sm font-semibold text-emerald-700 dark:text-emerald-400 mb-1">
                  Quick Login
                </h3>
                <p className="text-xs text-emerald-600/80 dark:text-emerald-400/80">
                  Try our demo accounts
                </p>
              </div>
              <div className="grid grid-cols-1 gap-3">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="h-10 text-sm bg-gradient-to-r from-emerald-100 to-emerald-50 hover:from-emerald-200 hover:to-emerald-100 border-emerald-300 text-emerald-700 shadow-sm hover:shadow-md transition-all duration-200"
                  onClick={() => handleQuickLogin('+251911234567', 'admin123')}
                  disabled={isLoading}
                >
                  <Shield className="w-4 h-4 mr-2" />
                  Admin Login
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="h-10 text-sm bg-gradient-to-r from-blue-100 to-blue-50 hover:from-blue-200 hover:to-blue-100 border-blue-300 text-blue-700 shadow-sm hover:shadow-md transition-all duration-200"
                  onClick={() => handleQuickLogin('+251912345678', 'trainer123')}
                  disabled={isLoading}
                >
                  <UserCheck className="w-4 h-4 mr-2" />
                  Trainer Login
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="h-10 text-sm bg-gradient-to-r from-purple-100 to-purple-50 hover:from-purple-200 hover:to-purple-100 border-purple-300 text-purple-700 shadow-sm hover:shadow-md transition-all duration-200"
                  onClick={() => handleQuickLogin('+251934567890', 'user123')}
                  disabled={isLoading}
                >
                  <Users className="w-4 h-4 mr-2" />
                  User Login
                </Button>
              </div>
              <div className="mt-4 p-3 bg-emerald-100/50 rounded-lg border border-emerald-200/50">
                <p className="text-xs text-emerald-700 dark:text-emerald-400 text-center">
                  <span className="font-medium">Note:</span> Make sure the backend API is running on port 4000
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
