'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/auth-context'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { NeumorphicCard } from '@/components/user/NeumorphicCard'
import { toast } from 'sonner'
import { apiClient, type Language } from '@/lib/api-client'
import {
  Stethoscope,
  FileText,
  Upload,
  X,
  Check,
  ArrowLeft,
  ArrowRight,
  Clock,
  Award,
  AlertCircle,
  Heart
} from 'lucide-react'

interface MedicalFormData {
  professionalType: string
  specialties: string[]
  yearsOfExperience: string
  bio: string
  languages: string[]
  licenseInfo: {
    licenseNumber?: string
    issuingAuthority?: string
    expiryDate?: string
    state?: string
    country?: string
  }
  portfolio: Array<{
    title: string
    description: string
    url?: string
  }>
  socialMedia: {
    instagram?: string
    facebook?: string
    twitter?: string
    linkedin?: string
    website?: string
  }
  preferences: {
    consultTypes: string[]
    availability: string[]
  }
}

const PROFESSIONAL_TYPE_OPTIONS = [
  { value: 'doctor', label: 'Doctor (MD/DO)' },
  { value: 'nurse', label: 'Nurse' },
  { value: 'health_coach', label: 'Health Coach' },
  { value: 'nutritionist', label: 'Nutritionist/Dietitian' }
]

const MEDICAL_SPECIALTY_OPTIONS = [
  'General Medicine',
  'Cardiology',
  'Endocrinology',
  'Nutrition',
  'Sports Medicine',
  'Preventive Medicine',
  'Family Medicine',
  'Internal Medicine',
  'Public Health',
  'Mental Health',
  'Women\'s Health',
  'Men\'s Health',
  'Pediatrics',
  'Geriatrics',
  'Rehabilitation',
  'Wellness Coaching',
  'Chronic Disease Management',
  'Weight Management',
  'Other'
]

const CONSULT_TYPE_OPTIONS = [
  'Quick Consult (15 min)',
  'Full Consult (30 min)',
  'Follow-up Consult',
  'Nutrition Consultation',
  'Health Assessment',
  'Preventive Care',
  'Chronic Disease Management'
]

const AVAILABILITY_OPTIONS = [
  'Weekday Mornings',
  'Weekday Afternoons',
  'Weekday Evenings',
  'Weekend Mornings',
  'Weekend Afternoons',
  'Weekend Evenings',
  'Flexible'
]

export default function MedicalApplyPage() {
  const router = useRouter()
  const { user, isLoading: authLoading } = useAuth()
  const [currentStep, setCurrentStep] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [checkingStatus, setCheckingStatus] = useState(true)
  const [existingApplication, setExistingApplication] = useState<any>(null)
  const [languages, setLanguages] = useState<Language[]>([])
  const [loadingLanguages, setLoadingLanguages] = useState(true)

  const [formData, setFormData] = useState<MedicalFormData>({
    professionalType: '',
    specialties: [],
    yearsOfExperience: '',
    bio: '',
    languages: [],
    licenseInfo: {},
    portfolio: [],
    socialMedia: {},
    preferences: {
      consultTypes: [],
      availability: []
    }
  })

  const totalSteps = 4
  const progress = (currentStep / totalSteps) * 100

  useEffect(() => {
    if (!authLoading && user) {
      checkApplicationStatus()
    }
  }, [authLoading, user])

  useEffect(() => {
    fetchLanguages()
  }, [])

  const fetchLanguages = async () => {
    try {
      setLoadingLanguages(true)
      const response = await apiClient.getLanguages()
      if (response.success && response.data) {
        setLanguages(response.data)
      } else {
        console.error('Failed to fetch languages:', response.error)
        toast.error('Failed to load languages')
      }
    } catch (error) {
      console.error('Error fetching languages:', error)
      toast.error('Failed to load languages')
    } finally {
      setLoadingLanguages(false)
    }
  }

  const checkApplicationStatus = async () => {
    try {
      setCheckingStatus(true)
      const response = await apiClient.getMedicalApplicationStatus()
      if (response.success && response.data) {
        setExistingApplication(response.data)
        if (response.data.status === 'approved') {
          toast.info('You are already a medical professional')
          router.push('/medical/dashboard')
        }
      }
    } catch (error: any) {
      if (error.response?.status !== 404) {
        console.error('Error checking application status:', error)
      }
    } finally {
      setCheckingStatus(false)
    }
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files)
      setUploadedFiles([...uploadedFiles, ...newFiles])
    }
  }

  const removeFile = (index: number) => {
    setUploadedFiles(uploadedFiles.filter((_, i) => i !== index))
  }

  const toggleSpecialty = (specialty: string) => {
    setFormData({
      ...formData,
      specialties: formData.specialties.includes(specialty)
        ? formData.specialties.filter(s => s !== specialty)
        : [...formData.specialties, specialty]
    })
  }

  const toggleLanguage = (langCode: string) => {
    setFormData({
      ...formData,
      languages: formData.languages.includes(langCode)
        ? formData.languages.filter(l => l !== langCode)
        : [...formData.languages, langCode]
    })
  }

  const toggleConsultType = (type: string) => {
    setFormData({
      ...formData,
      preferences: {
        ...formData.preferences,
        consultTypes: formData.preferences.consultTypes.includes(type)
          ? formData.preferences.consultTypes.filter(t => t !== type)
          : [...formData.preferences.consultTypes, type]
      }
    })
  }

  const toggleAvailability = (availability: string) => {
    setFormData({
      ...formData,
      preferences: {
        ...formData.preferences,
        availability: formData.preferences.availability.includes(availability)
          ? formData.preferences.availability.filter(a => a !== availability)
          : [...formData.preferences.availability, availability]
      }
    })
  }

  const addPortfolioItem = () => {
    setFormData({
      ...formData,
      portfolio: [...formData.portfolio, { title: '', description: '', url: '' }]
    })
  }

  const updatePortfolioItem = (index: number, field: string, value: string) => {
    const updated = [...formData.portfolio]
    updated[index] = { ...updated[index], [field]: value }
    setFormData({ ...formData, portfolio: updated })
  }

  const removePortfolioItem = (index: number) => {
    setFormData({
      ...formData,
      portfolio: formData.portfolio.filter((_, i) => i !== index)
    })
  }

  const validateStep = (step: number): boolean => {
    switch (step) {
      case 1:
        return !!(formData.professionalType && formData.specialties.length > 0 && formData.bio.trim())
      case 2:
        return true // License info is optional but recommended
      case 3:
        return true // Portfolio and social media are optional
      case 4:
        return formData.preferences.consultTypes.length > 0
      default:
        return true
    }
  }

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, totalSteps))
    } else {
      toast.error('Please fill in all required fields')
    }
  }

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1))
  }

  const handleSubmit = async () => {
    if (!validateStep(currentStep)) {
      toast.error('Please fill in all required fields')
      return
    }

    if (!user) {
      toast.error('You must be logged in to submit an application')
      return
    }

    setIsSubmitting(true)

    try {
      const formDataToSend = new FormData()

      formDataToSend.append('professionalType', formData.professionalType)
      formDataToSend.append('specialties', JSON.stringify(formData.specialties))
      formDataToSend.append('yearsOfExperience', formData.yearsOfExperience)
      formDataToSend.append('bio', formData.bio)
      formDataToSend.append('languages', JSON.stringify(formData.languages))
      formDataToSend.append('licenseInfo', JSON.stringify(formData.licenseInfo))
      formDataToSend.append('portfolio', JSON.stringify(formData.portfolio))
      formDataToSend.append('socialMedia', JSON.stringify(formData.socialMedia))
      formDataToSend.append('preferences', JSON.stringify(formData.preferences))

      uploadedFiles.forEach(file => {
        formDataToSend.append('credentials', file)
      })

      const response = existingApplication
        ? await apiClient.updateMedicalApplication(formDataToSend)
        : await apiClient.submitMedicalApplication(formDataToSend)

      if (response.success) {
        toast.success('Application submitted successfully!')
        router.push('/user/medical/apply/status')
      } else {
        toast.error(response.error?.message || 'Failed to submit application')
      }
    } catch (error) {
      console.error('Error submitting application:', error)
      toast.error('An error occurred while submitting your application')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (authLoading || checkingStatus) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--neumorphic-bg)]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-500 mx-auto"></div>
          <p className="mt-4 text-[var(--neumorphic-muted)]">Loading...</p>
        </div>
      </div>
    )
  }

  if (existingApplication && existingApplication.status !== 'rejected') {
    return (
      <div className="min-h-screen bg-[var(--neumorphic-bg)]">
        <div className="max-w-4xl mx-auto px-4 py-12">
          <NeumorphicCard variant="raised" className="p-8 text-center">
            <Stethoscope className="w-16 h-16 mx-auto mb-4 text-teal-500" />
            <h2 className="text-2xl font-bold text-[var(--neumorphic-text)] mb-4">
              Application Already Submitted
            </h2>
            <p className="text-[var(--neumorphic-muted)] mb-6">
              Your application status: <strong>{existingApplication.status}</strong>
            </p>
            <Button
              onClick={() => router.push('/user/medical/apply/status')}
              className="bg-gradient-to-r from-teal-500 to-emerald-600 text-white"
            >
              View Application Status
            </Button>
          </NeumorphicCard>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[var(--neumorphic-bg)]">
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-teal-500/10 via-emerald-500/5 to-blue-500/10" />
        
        <div className="relative px-4 md:px-8 py-12">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center gap-4 mb-4">
              <Button
                onClick={() => router.push('/user/medical')}
                variant="ghost"
                size="sm"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
            </div>
            <div className="flex items-center gap-3 mb-8">
              <div className="w-12 h-12 bg-gradient-to-r from-teal-500 to-emerald-600 rounded-full flex items-center justify-center">
                <Stethoscope className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-4xl md:text-5xl font-bold text-[var(--neumorphic-text)]">
                  Become a Medical Professional
                </h1>
                <p className="text-lg text-[var(--neumorphic-muted)]">
                  Apply to provide medical consultations and health guidance
                </p>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-[var(--neumorphic-text)]">
                  Step {currentStep} of {totalSteps}
                </span>
                <span className="text-sm text-[var(--neumorphic-muted)]">
                  {Math.round(progress)}%
                </span>
              </div>
              <div className="w-full bg-[var(--neumorphic-surface)] rounded-full h-2">
                <div
                  className="bg-gradient-to-r from-teal-500 to-emerald-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Step 1: Professional Information */}
        {currentStep === 1 && (
          <NeumorphicCard variant="raised" className="p-6 space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-[var(--neumorphic-text)] mb-2 flex items-center gap-2">
                <Award className="w-6 h-6 text-teal-500" />
                Professional Information
              </h2>
              <p className="text-[var(--neumorphic-muted)]">
                Tell us about your medical background and qualifications
              </p>
            </div>

            <div className='space-y-2'>
              <Label className="text-[var(--neumorphic-text)]">Professional Type *</Label>
              <Select value={formData.professionalType} onValueChange={(v) => setFormData({ ...formData, professionalType: v })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select your professional type" />
                </SelectTrigger>
                <SelectContent>
                  {PROFESSIONAL_TYPE_OPTIONS.map(option => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-[var(--neumorphic-text)]">Specialties *</Label>
              <p className="text-sm text-[var(--neumorphic-muted)] mb-3">
                Select all that apply
              </p>
              <div className="flex flex-wrap gap-2">
                {MEDICAL_SPECIALTY_OPTIONS.map(specialty => (
                  <Badge
                    key={specialty}
                    onClick={() => toggleSpecialty(specialty)}
                    className={`cursor-pointer ${
                      formData.specialties.includes(specialty)
                        ? 'bg-gradient-to-r from-teal-500 to-emerald-600 text-white'
                        : 'bg-[var(--neumorphic-surface)] text-[var(--neumorphic-text)] border border-[var(--neumorphic-muted)]/20'
                    }`}
                  >
                    {specialty}
                    {formData.specialties.includes(specialty) && (
                      <Check className="w-3 h-3 ml-1" />
                    )}
                  </Badge>
                ))}
              </div>
            </div>

            <div className='space-y-2'>
              <Label className="text-[var(--neumorphic-text)]">Years of Experience</Label>
              <Input
                type="number"
                value={formData.yearsOfExperience}
                onChange={(e) => setFormData({ ...formData, yearsOfExperience: e.target.value })}
                placeholder="e.g., 5"
              />
            </div>

            <div className='space-y-2'>
              <Label className="text-[var(--neumorphic-text)]">Bio *</Label>
              <Textarea
                value={formData.bio}
                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                placeholder="Tell us about your medical background, experience, and approach..."
                rows={6}
              />
            </div>

            <div>
              <Label className="text-[var(--neumorphic-text)]">Languages Spoken</Label>
              <p className="text-sm text-[var(--neumorphic-muted)] mb-3">
                Select languages you can communicate in
              </p>
              {loadingLanguages ? (
                <p className="text-sm text-[var(--neumorphic-muted)]">Loading languages...</p>
              ) : languages.length === 0 ? (
                <p className="text-sm text-yellow-500">No languages available. Please contact support.</p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {languages.map(lang => (
                    <Badge
                      key={lang.code}
                      onClick={() => toggleLanguage(lang.code)}
                      className={`cursor-pointer ${
                        formData.languages.includes(lang.code)
                          ? 'bg-gradient-to-r from-teal-500 to-emerald-600 text-white'
                          : 'bg-[var(--neumorphic-surface)] text-[var(--neumorphic-text)] border border-[var(--neumorphic-muted)]/20'
                      }`}
                    >
                      {lang.name}
                      {formData.languages.includes(lang.code) && (
                        <Check className="w-3 h-3 ml-1" />
                      )}
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          </NeumorphicCard>
        )}

        {/* Step 2: License & Credentials */}
        {currentStep === 2 && (
          <NeumorphicCard variant="raised" className="p-6 space-y-6">
            <div className='space-y-2'>
              <h2 className="text-2xl font-bold text-[var(--neumorphic-text)] mb-2 flex items-center gap-2">
                <FileText className="w-6 h-6 text-teal-500" />
                License & Credentials
              </h2>
              <p className="text-[var(--neumorphic-muted)]">
                Provide your license information and upload credential files
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className='space-y-2'>
                <Label className="text-[var(--neumorphic-text)]">License Number</Label>
                <Input
                  value={formData.licenseInfo.licenseNumber || ''}
                  onChange={(e) => setFormData({
                    ...formData,
                    licenseInfo: { ...formData.licenseInfo, licenseNumber: e.target.value }
                  })}
                  placeholder="Enter license number"
                />
              </div>
              <div className='space-y-2'>
                <Label className="text-[var(--neumorphic-text)]">Issuing Authority</Label>
                <Input
                  value={formData.licenseInfo.issuingAuthority || ''}
                  onChange={(e) => setFormData({
                    ...formData,
                    licenseInfo: { ...formData.licenseInfo, issuingAuthority: e.target.value }
                  })}
                  placeholder="e.g., Medical Board"
                />
              </div>
              <div className='space-y-2'>
                <Label className="text-[var(--neumorphic-text)]">State/Province</Label>
                <Input
                  value={formData.licenseInfo.state || ''}
                  onChange={(e) => setFormData({
                    ...formData,
                    licenseInfo: { ...formData.licenseInfo, state: e.target.value }
                  })}
                  placeholder="State or province"
                />
              </div>
              <div className='space-y-2'>
                <Label className="text-[var(--neumorphic-text)]">Country</Label>
                <Input
                  value={formData.licenseInfo.country || ''}
                  onChange={(e) => setFormData({
                    ...formData,
                    licenseInfo: { ...formData.licenseInfo, country: e.target.value }
                  })}
                  placeholder="Country"
                />
              </div>
              <div className='space-y-2'>
                <Label className="text-[var(--neumorphic-text)]">Expiry Date</Label>
                <Input
                  type="date"
                  value={formData.licenseInfo.expiryDate || ''}
                  onChange={(e) => setFormData({
                    ...formData,
                    licenseInfo: { ...formData.licenseInfo, expiryDate: e.target.value }
                  })}
                />
              </div>
            </div>

            <div>
              <Label className="text-[var(--neumorphic-text)]">Upload Credential Files</Label>
              <p className="text-sm text-[var(--neumorphic-muted)] mb-3">
                Upload copies of your licenses, certifications, or credentials (PDF, JPG, PNG - Max 10MB each)
              </p>
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={handleFileUpload}
                className="hidden"
              />
              <Button
                onClick={() => fileInputRef.current?.click()}
                variant="outline"
                className="w-full"
              >
                <Upload className="w-4 h-4 mr-2" />
                Choose Files
              </Button>
              {uploadedFiles.length > 0 && (
                <div className="mt-4 space-y-2">
                  {uploadedFiles.map((file, index) => (
                    <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-[var(--neumorphic-surface)]">
                      <span className="text-sm text-[var(--neumorphic-text)]">{file.name}</span>
                      <Button
                        onClick={() => removeFile(index)}
                        variant="ghost"
                        size="sm"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </NeumorphicCard>
        )}

        {/* Step 3: Portfolio & Social Media */}
        {currentStep === 3 && (
          <NeumorphicCard variant="raised" className="p-6 space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-[var(--neumorphic-text)] mb-2 flex items-center gap-2">
                <Heart className="w-6 h-6 text-teal-500" />
                Portfolio & Social Media
              </h2>
              <p className="text-[var(--neumorphic-muted)]">
                Share your professional portfolio and social media (optional)
              </p>
            </div>

            <div>
              <div className="flex items-center justify-between mb-4">
                <Label className="text-[var(--neumorphic-text)]">Portfolio Items</Label>
                <Button onClick={addPortfolioItem} variant="outline" size="sm">
                  <Check className="w-4 h-4 mr-2" />
                  Add Item
                </Button>
              </div>
              {formData.portfolio.map((item, index) => (
                <div key={index} className="mb-4 p-4 rounded-lg bg-[var(--neumorphic-surface)] space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold text-[var(--neumorphic-text)]">
                      Portfolio Item {index + 1}
                    </span>
                    <Button
                      onClick={() => removePortfolioItem(index)}
                      variant="ghost"
                      size="sm"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                  <Input
                    value={item.title}
                    onChange={(e) => updatePortfolioItem(index, 'title', e.target.value)}
                    placeholder="Title"
                  />
                  <Textarea
                    value={item.description}
                    onChange={(e) => updatePortfolioItem(index, 'description', e.target.value)}
                    placeholder="Description"
                    rows={2}
                  />
                  <Input
                    value={item.url || ''}
                    onChange={(e) => updatePortfolioItem(index, 'url', e.target.value)}
                    placeholder="URL (optional)"
                  />
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className='space-y-2'>
                <Label className="text-[var(--neumorphic-text)]">LinkedIn</Label>
                <Input
                  value={formData.socialMedia.linkedin || ''}
                  onChange={(e) => setFormData({
                    ...formData,
                    socialMedia: { ...formData.socialMedia, linkedin: e.target.value }
                  })}
                  placeholder="LinkedIn profile URL"
                />
              </div>
              <div className='space-y-2'>
                <Label className="text-[var(--neumorphic-text)]">Website</Label>
                <Input
                  value={formData.socialMedia.website || ''}
                  onChange={(e) => setFormData({
                    ...formData,
                    socialMedia: { ...formData.socialMedia, website: e.target.value }
                  })}
                  placeholder="Personal or professional website"
                />
              </div>
              <div className='space-y-2'>
                <Label className="text-[var(--neumorphic-text)]">Instagram</Label>
                <Input
                  value={formData.socialMedia.instagram || ''}
                  onChange={(e) => setFormData({
                    ...formData,
                    socialMedia: { ...formData.socialMedia, instagram: e.target.value }
                  })}
                  placeholder="Instagram profile URL"
                />
              </div>
              <div className='space-y-2'>
                <Label className="text-[var(--neumorphic-text)]">Facebook</Label>
                <Input
                  value={formData.socialMedia.facebook || ''}
                  onChange={(e) => setFormData({
                    ...formData,
                    socialMedia: { ...formData.socialMedia, facebook: e.target.value }
                  })}
                  placeholder="Facebook profile URL"
                />
              </div>
              <div className='space-y-2'>
                <Label className="text-[var(--neumorphic-text)]">TikTok</Label>
                <Input
                  value={formData.socialMedia.twitter || ''}
                  onChange={(e) => setFormData({
                    ...formData,
                    socialMedia: { ...formData.socialMedia, twitter: e.target.value }
                  })}
                  placeholder="TikTok profile URL"
                />
              </div>
            </div>
          </NeumorphicCard>
        )}

        {/* Step 4: Preferences */}
        {currentStep === 4 && (
          <NeumorphicCard variant="raised" className="p-6 space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-[var(--neumorphic-text)] mb-2 flex items-center gap-2">
                <Clock className="w-6 h-6 text-teal-500" />
                Consultation Preferences
              </h2>
              <p className="text-[var(--neumorphic-muted)]">
                Tell us about your consultation preferences
              </p>
            </div>

            <div className='space-y-2'>
              <Label className="text-[var(--neumorphic-text)]">Consult Types You Offer *</Label>
              <p className="text-sm text-[var(--neumorphic-muted)] mb-3">
                Select all that apply
              </p>
              <div className="flex flex-wrap gap-2">
                {CONSULT_TYPE_OPTIONS.map(type => (
                  <Badge
                    key={type}
                    onClick={() => toggleConsultType(type)}
                    className={`cursor-pointer ${
                      formData.preferences.consultTypes.includes(type)
                        ? 'bg-gradient-to-r from-teal-500 to-emerald-600 text-white'
                        : 'bg-[var(--neumorphic-surface)] text-[var(--neumorphic-text)] border border-[var(--neumorphic-muted)]/20'
                    }`}
                  >
                    {type}
                    {formData.preferences.consultTypes.includes(type) && (
                      <Check className="w-3 h-3 ml-1" />
                    )}
                  </Badge>
                ))}
              </div>
            </div>

            <div className='space-y-2'>
              <Label className="text-[var(--neumorphic-text)]">Availability</Label>
              <p className="text-sm text-[var(--neumorphic-muted)] mb-3">
                When are you typically available for consultations?
              </p>
              <div className="flex flex-wrap gap-2">
                {AVAILABILITY_OPTIONS.map(availability => (
                  <Badge
                    key={availability}
                    onClick={() => toggleAvailability(availability)}
                    className={`cursor-pointer ${
                      formData.preferences.availability.includes(availability)
                        ? 'bg-gradient-to-r from-teal-500 to-emerald-600 text-white'
                        : 'bg-[var(--neumorphic-surface)] text-[var(--neumorphic-text)] border border-[var(--neumorphic-muted)]/20'
                    }`}
                  >
                    {availability}
                    {formData.preferences.availability.includes(availability) && (
                      <Check className="w-3 h-3 ml-1" />
                    )}
                  </Badge>
                ))}
              </div>
            </div>
          </NeumorphicCard>
        )}

        {/* Navigation Buttons */}
        <div className="flex items-center justify-between mt-8">
          <Button
            onClick={prevStep}
            disabled={currentStep === 1}
            variant="outline"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Previous
          </Button>

          {currentStep < totalSteps ? (
            <Button
              onClick={nextStep}
              className="bg-gradient-to-r from-teal-500 to-emerald-600 text-white"
            >
              Next
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          ) : (
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="bg-gradient-to-r from-teal-500 to-emerald-600 text-white"
            >
              {isSubmitting ? 'Submitting...' : 'Submit Application'}
              <Check className="w-4 h-4 ml-2" />
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}

