'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { NeumorphicCard } from '@/components/user/NeumorphicCard'
import { Stethoscope, ArrowLeft, Loader2, DollarSign } from 'lucide-react'
import { apiClient } from '@/lib/api-client'
import { useAuth } from '@/contexts/auth-context'
import { toast } from 'sonner'

export default function ConsultPurchasePage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { user, isLoading: authLoading } = useAuth()

  const [loading, setLoading] = useState(true)
  const [processing, setProcessing] = useState(false)
  const [error, setError] = useState('')
  const [doctor, setDoctor] = useState<any>(null)
  const [quantity, setQuantity] = useState(1)
  const [phoneNumber, setPhoneNumber] = useState('')
  const [email, setEmail] = useState('')

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login')
      return
    }

    const doctorId = searchParams.get('doctorId')
    const quantityParam = searchParams.get('quantity')

    if (!doctorId) {
      setError('Doctor ID is required')
      setLoading(false)
      return
    }

    if (quantityParam) {
      const qty = parseInt(quantityParam)
      if (!isNaN(qty) && qty > 0) {
        setQuantity(qty)
      }
    }

    // Set user email if available
    if (user?.email) {
      setEmail(user.email)
    }

    // Load doctor details
    loadDoctor(parseInt(doctorId))
  }, [searchParams, authLoading, user, router])

  const loadDoctor = async (doctorId: number) => {
    try {
      setLoading(true)
      const response = await apiClient.getConsultDoctors()
      if (response.success && response.data) {
        const foundDoctor = response.data.find((d: any) => d.id === doctorId)
        if (foundDoctor) {
          setDoctor(foundDoctor)
        } else {
          setError('Doctor not found')
        }
      } else {
        setError('Failed to load doctor information')
      }
    } catch (error) {
      console.error('Failed to load doctor:', error)
      setError('Failed to load doctor information')
    } finally {
      setLoading(false)
    }
  }

  const validatePhoneNumber = (phone: string): boolean => {
    const phoneRegex = /^(09|07)[0-9]{8}$/
    return phoneRegex.test(phone)
  }

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  const calculateTotal = () => {
    if (!doctor?.medicalProfessional?.consultFee) return 0
    return parseFloat(doctor.medicalProfessional.consultFee) * quantity
  }

  const handlePayment = async () => {
    if (!doctor) {
      setError('Doctor information is missing')
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

    if (quantity < 1) {
      setError('Quantity must be at least 1')
      return
    }

    setProcessing(true)
    setError('')

    try {
      const response = await apiClient.initializeConsultPayment({
        doctorId: doctor.id,
        quantity: quantity,
        phone_number: phoneNumber,
        email: email
      })

      if (response.success && response.data) {
        // Redirect to Chapa checkout
        window.location.href = response.data.checkout_url
      } else {
        setError(response.error?.message || 'Failed to initialize payment. Please try again.')
        setProcessing(false)
      }
    } catch (error: any) {
      const errorMessage = error?.message || 
                          error?.error?.message || 
                          'Failed to initialize payment. Please check your connection and try again.'
      setError(errorMessage)
      setProcessing(false)
    }
  }

  if (authLoading || loading) {
    return (
      <div className="flex min-h-dvh min-h-screen items-center justify-center user-app-page">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--ethio-deep-blue)] mx-auto"></div>
          <p className="mt-4 user-app-muted">Loading...</p>
        </div>
      </div>
    )
  }

  if (!doctor) {
    return (
      <div className="min-h-dvh min-h-full user-app-page">
        <div className="max-w-4xl mx-auto px-4 py-12">
          <NeumorphicCard variant="raised" className="p-8 text-center">
            <Stethoscope className="w-16 h-16 mx-auto mb-4 text-gray-400" />
            <h2 className="text-2xl font-bold user-app-ink mb-4">
              Doctor Not Found
            </h2>
            <p className="user-app-muted mb-6">
              {error || 'The doctor you are looking for is not available.'}
            </p>
            <Button
              onClick={() => router.push('/user/medical')}
              className="bg-gradient-to-r from-teal-500 to-emerald-600 text-white"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Medical Hub
            </Button>
          </NeumorphicCard>
        </div>
      </div>
    )
  }

  const consultFee = doctor.medicalProfessional?.consultFee 
    ? parseFloat(doctor.medicalProfessional.consultFee) 
    : 0
  const total = calculateTotal()

  return (
    <div className="min-h-dvh min-h-full user-app-page">
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-teal-500/10 via-emerald-500/5 to-blue-500/10" />
        
        <div className="relative px-4 md:px-8 py-12">
          <div className="max-w-4xl mx-auto">
            <Button
              onClick={() => router.push('/user/medical')}
              variant="ghost"
              className="mb-6"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Medical Hub
            </Button>

            <div className="flex items-center gap-3 mb-8">
              <div className="w-12 h-12 bg-gradient-to-r from-teal-500 to-emerald-600 rounded-full flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-4xl md:text-5xl font-bold user-app-ink">
                  Purchase Consults
                </h1>
                <p className="text-lg user-app-muted">
                  Buy consultation credits from {doctor.name}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Doctor Info & Summary */}
          <div className="lg:col-span-2 space-y-6">
            <NeumorphicCard variant="raised" className="p-6">
              <h2 className="text-xl font-bold user-app-ink mb-4 flex items-center gap-2">
                <Stethoscope className="w-5 h-5 text-teal-500" />
                Doctor Information
              </h2>
              <div className="space-y-3">
                <div>
                  <p className="text-sm user-app-muted">Doctor Name</p>
                  <p className="text-lg font-semibold user-app-ink">
                    {doctor.name}
                  </p>
                </div>
                {doctor.medicalProfessional?.professionalType && (
                  <div>
                    <p className="text-sm user-app-muted">Professional Type</p>
                    <p className="text-lg font-semibold user-app-ink capitalize">
                      {doctor.medicalProfessional.professionalType.replace('_', ' ')}
                    </p>
                  </div>
                )}
                {doctor.medicalProfessional?.specialties && doctor.medicalProfessional.specialties.length > 0 && (
                  <div>
                    <p className="text-sm user-app-muted mb-2">Specialties</p>
                    <div className="flex flex-wrap gap-2">
                      {doctor.medicalProfessional.specialties.map((specialty: string, idx: number) => (
                        <span key={idx} className="px-2 py-1 user-app-paper rounded text-sm">
                          {specialty}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </NeumorphicCard>

            <NeumorphicCard variant="raised" className="p-6">
              <h2 className="text-xl font-bold user-app-ink mb-4">
                Purchase Details
              </h2>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="quantity" className="user-app-ink">
                    Number of Consults
                  </Label>
                  <Input
                    id="quantity"
                    type="number"
                    min="1"
                    value={quantity}
                    onChange={(e) => {
                      const val = parseInt(e.target.value)
                      if (!isNaN(val) && val > 0) {
                        setQuantity(val)
                      }
                    }}
                    className="w-full"
                  />
                  <p className="text-sm user-app-muted">
                    Each consult costs {consultFee.toFixed(2)} ETB
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone" className="user-app-ink">
                    Phone Number *
                  </Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    placeholder="0912345678"
                    className="w-full"
                  />
                  <p className="text-sm user-app-muted">
                    Must start with 09 or 07 followed by 8 digits
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email" className="user-app-ink">
                    Email Address *
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="your@email.com"
                    className="w-full"
                  />
                </div>
              </div>
            </NeumorphicCard>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <NeumorphicCard variant="raised" className="p-6 sticky top-4">
              <h2 className="text-xl font-bold user-app-ink mb-4">
                Order Summary
              </h2>
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="user-app-muted">Consult Fee</span>
                  <span className="font-semibold user-app-ink">
                    {consultFee.toFixed(2)} ETB
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="user-app-muted">Quantity</span>
                  <span className="font-semibold user-app-ink">
                    {quantity}
                  </span>
                </div>
                <div className="border-t user-app-border pt-4">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-bold user-app-ink">Total</span>
                    <span className="text-2xl font-bold text-teal-500">
                      {total.toFixed(2)} ETB
                    </span>
                  </div>
                </div>

                {error && (
                  <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-500 text-sm">
                    {error}
                  </div>
                )}

                <Button
                  onClick={handlePayment}
                  disabled={processing || !phoneNumber || !email || quantity < 1}
                  className="w-full bg-gradient-to-r from-teal-500 to-emerald-600 hover:from-teal-600 hover:to-emerald-700 text-white"
                  size="lg"
                >
                  {processing ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <DollarSign className="w-4 h-4 mr-2" />
                      Proceed to Payment
                    </>
                  )}
                </Button>
              </div>
            </NeumorphicCard>
          </div>
        </div>
      </div>
    </div>
  )
}

