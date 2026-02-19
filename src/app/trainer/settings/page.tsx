'use client'

import { useState, useEffect, useRef } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { 
  User, 
  Mail, 
  Phone, 
  Calendar, 
  FileText, 
  Camera, 
  Trash2,
  Save,
  Loader2
} from 'lucide-react'
import { Palette } from 'lucide-react'
import { apiClient, TrainerSettings, UpdateSettingsRequest } from '@/lib/api-client'
import { cn, getImageUrl } from '@/lib/utils'
import { uploadProfileImage, removeProfileImage, validateFileSize, validateImageType, FILE_SIZE_LIMITS, ALLOWED_FILE_TYPES } from '@/lib/upload-utils'
import { useAuth } from '@/contexts/auth-context'
import { toast } from 'sonner'

export default function TrainerSettingsPage() {
  const { refreshUser } = useAuth()
  const [settings, setSettings] = useState<TrainerSettings | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState('profile')
  
  // Form states
  const [formData, setFormData] = useState<UpdateSettingsRequest>({})
  
  const fileInputRef = useRef<HTMLInputElement>(null)

  const fetchSettings = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await apiClient.getTrainerSettings()
      if (response.success && response.data) {
        setSettings(response.data)
        // Initialize form data with current settings
        setFormData({
          user: {
            name: response.data.user.name,
            email: response.data.user.email,
            dateOfBirth: response.data.user.dateOfBirth,
            gender: response.data.user.gender
          },
          trainer: {
            bio: response.data.trainer.bio,
            specialties: response.data.trainer.specialties
          },
          profile: {
            language: response.data.profile.language,
            notificationSettings: response.data.profile.notificationSettings,
            fitnessGoals: response.data.profile.fitnessGoals,
            healthMetrics: response.data.profile.healthMetrics,
            preferences: response.data.profile.preferences
          }
        })
      } else {
        setError(response.error?.message || 'Failed to fetch settings')
      }
    } catch (err) {
      setError('An error occurred while fetching settings')
      console.error('Settings fetch error:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchSettings()
  }, [])

  // Apply theme helper (immediately applies when user changes theme)
  const applyTheme = (theme: string) => {
    if (typeof window === 'undefined') return
    if (theme === 'system') {
      const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
      if (systemPrefersDark) {
        document.documentElement.classList.add('dark')
      } else {
        document.documentElement.classList.remove('dark')
      }
    } else if (theme === 'dark') {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }

  // Apply theme when settings or formData change
  useEffect(() => {
    const theme = formData.profile?.preferences?.theme || settings?.profile?.preferences?.theme
    if (theme) applyTheme(theme)
  }, [settings, formData.profile?.preferences?.theme])

  const handleInputChange = (section: keyof UpdateSettingsRequest, field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }))
  }

  const handleSpecialtyAdd = (specialty: string) => {
    if (specialty.trim() && !formData.trainer?.specialties?.includes(specialty.trim())) {
      handleInputChange('trainer', 'specialties', [
        ...(formData.trainer?.specialties || []),
        specialty.trim()
      ])
    }
  }

  const handleSpecialtyRemove = (specialtyToRemove: string) => {
    handleInputChange('trainer', 'specialties', 
      formData.trainer?.specialties?.filter(s => s !== specialtyToRemove) || []
    )
  }

  const handleSaveSettings = async () => {
    try {
      setSaving(true)
      const response = await apiClient.updateTrainerSettings(formData)
      if (response.success && response.data) {
        setSettings(response.data.settings)
        // Refresh user data in auth context to update header
        await refreshUser()
        toast.success('Settings updated successfully')
      } else {
        toast.error(response.error?.message || 'Failed to update settings')
      }
    } catch (err) {
      toast.error('An error occurred while updating settings')
      console.error('Settings update error:', err)
    } finally {
      setSaving(false)
    }
  }

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Validate file size
    const sizeValidation = validateFileSize(file, FILE_SIZE_LIMITS.PROFILE_IMAGE)
    if (!sizeValidation.valid) {
      toast.error(sizeValidation.error!)
      return
    }

    // Validate file type
    const typeValidation = validateImageType(file, ALLOWED_FILE_TYPES.PROFILE_IMAGE)
    if (!typeValidation.valid) {
      toast.error(typeValidation.error!)
      return
    }

    try {
      setSaving(true)
      
      const result = await uploadProfileImage(file)
      
      if (result.success && result.data) {
        setSettings(prev => prev ? {
          ...prev,
          user: {
            ...prev.user,
            profilePicture: result.data.profilePicture
          }
        } : null)
        // Refresh user data in auth context to update header
        await refreshUser()
        toast.success('Profile image updated successfully')
      } else {
        toast.error(result.error?.message || 'Failed to upload image')
      }
    } catch (err) {
      toast.error('An error occurred while uploading image')
      console.error('Image upload error:', err)
    } finally {
      setSaving(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  const handleRemoveImage = async () => {
    try {
      setSaving(true)
      const result = await removeProfileImage()
      if (result.success) {
        setSettings(prev => prev ? {
          ...prev,
          user: {
            ...prev.user,
            profilePicture: ''
          }
        } : null)
        // Refresh user data in auth context to update header
        await refreshUser()
        toast.success('Profile image removed successfully')
      } else {
        toast.error(result.error?.message || 'Failed to remove image')
      }
    } catch (err) {
      toast.error('An error occurred while removing image')
      console.error('Image removal error:', err)
    } finally {
      setSaving(false)
    }
  }


  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
          <p className="text-muted-foreground">Manage your account settings and preferences</p>
        </div>
        <div className="grid gap-6">
          {[...Array(3)].map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <div className="h-6 w-32 bg-muted animate-pulse rounded" />
                <div className="h-4 w-48 bg-muted animate-pulse rounded" />
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[...Array(4)].map((_, j) => (
                    <div key={j} className="space-y-2">
                      <div className="h-4 w-20 bg-muted animate-pulse rounded" />
                      <div className="h-10 w-full bg-muted animate-pulse rounded" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
          <p className="text-muted-foreground">Manage your account settings and preferences</p>
        </div>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-destructive mb-4">{error}</p>
              <Button onClick={fetchSettings}>Try Again</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!settings) return null

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">Manage your account settings and preferences</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="trainer">Trainer Info</TabsTrigger>
            <TabsTrigger value="preferences">Preferences</TabsTrigger>
          </TabsList>

        {/* Profile Tab */}
        <TabsContent value="profile" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Profile Information
              </CardTitle>
              <CardDescription>
                Update your personal information and profile picture
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Profile Picture */}
              <div className="flex items-center gap-6">
                <Avatar className="h-20 w-20">
                  <AvatarImage 
                    src={getImageUrl(settings.user.profilePicture)} 
                    alt={settings.user.name} 
                  />
                  <AvatarFallback className="text-lg">
                    {settings.user.name?.charAt(0)?.toUpperCase() || 'U'}
                  </AvatarFallback>
                </Avatar>
                <div className="space-y-2">
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={saving}
                    >
                      <Camera className="h-4 w-4 mr-2" />
                      {saving ? 'Uploading...' : 'Change Photo'}
                    </Button>
                    {settings.user.profilePicture && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleRemoveImage}
                        disabled={saving}
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Remove
                      </Button>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    JPG, PNG, GIF or WebP. Max size 10MB.
                  </p>
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </div>

              {/* Basic Information */}
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="name"
                      value={formData.user?.name || ''}
                      onChange={(e) => handleInputChange('user', 'name', e.target.value)}
                      className="pl-10"
                      placeholder="Enter your full name"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      value={formData.user?.email || ''}
                      onChange={(e) => handleInputChange('user', 'email', e.target.value)}
                      className="pl-10"
                      placeholder="Enter your email"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="phone"
                      value={settings.user.phone}
                      disabled
                      className="pl-10 bg-muted"
                      placeholder="Phone number"
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Phone number cannot be changed
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="dateOfBirth">Date of Birth</Label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="dateOfBirth"
                      type="date"
                      value={formData.user?.dateOfBirth || ''}
                      onChange={(e) => handleInputChange('user', 'dateOfBirth', e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="gender">Gender</Label>
                  <Select
                    value={formData.user?.gender || ''}
                    onValueChange={(value) => handleInputChange('user', 'gender', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select gender" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="male">Male</SelectItem>
                      <SelectItem value="female">Female</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Button onClick={handleSaveSettings} disabled={saving}>
                {saving ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Save Changes
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Trainer Info Tab */}
        <TabsContent value="trainer" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Trainer Information
              </CardTitle>
              <CardDescription>
                Update your trainer profile and specialties
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="bio">Bio</Label>
                <Textarea
                  id="bio"
                  value={formData.trainer?.bio || ''}
                  onChange={(e) => handleInputChange('trainer', 'bio', e.target.value)}
                  placeholder="Tell us about yourself and your fitness journey..."
                  rows={4}
                />
              </div>

              <div className="space-y-2">
                <Label>Specialties</Label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {formData.trainer?.specialties?.map((specialty, index) => (
                    <Badge key={index} variant="secondary" className="flex items-center gap-1">
                      {specialty}
                      <button
                        type="button"
                        onClick={() => handleSpecialtyRemove(specialty)}
                        className="ml-1 hover:text-destructive"
                      >
                        ×
                      </button>
                    </Badge>
                  ))}
                </div>
                <div className="flex gap-2">
                  <Input
                    placeholder="Add a specialty (e.g., Yoga, Strength Training)"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault()
                        handleSpecialtyAdd(e.currentTarget.value)
                        e.currentTarget.value = ''
                      }
                    }}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={(e) => {
                      const input = e.currentTarget.previousElementSibling as HTMLInputElement
                      handleSpecialtyAdd(input.value)
                      input.value = ''
                    }}
                  >
                    Add
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="language">Preferred Language</Label>
                <Select
                  value={formData.profile?.language || 'en'}
                  onValueChange={(value) => handleInputChange('profile', 'language', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="en">English</SelectItem>
                    <SelectItem value="am">አማርኛ (Amharic)</SelectItem>
                    <SelectItem value="or">Afaan Oromoo (Oromo)</SelectItem>
                    <SelectItem value="ti">ትግርኛ (Tigrinya)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button onClick={handleSaveSettings} disabled={saving}>
                {saving ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Save Changes
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Preferences Tab */}
        <TabsContent value="preferences" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Palette className="h-5 w-5" />
                App Preferences
              </CardTitle>
              <CardDescription>
                Select your preferred language, theme, and display settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="language">Language</Label>
                  <Select
                    value={formData.profile?.language || 'en'}
                    onValueChange={(value) => setFormData((prev: any) => ({
                      ...prev,
                      profile: { ...prev.profile, language: value }
                    }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="en">English</SelectItem>
                      <SelectItem value="am">አማርኛ (Amharic)</SelectItem>
                      <SelectItem value="or">Afaan Oromoo (Oromo)</SelectItem>
                      <SelectItem value="ti">ትግርኛ (Tigrinya)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="theme">Theme</Label>
                  <Select
                    value={formData.profile?.preferences?.theme || 'system'}
                    onValueChange={(value) => {
                      setFormData((prev: any) => ({
                        ...prev,
                        profile: { ...prev.profile, preferences: { ...prev.profile?.preferences, theme: value } }
                      }))
                      applyTheme(value)
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="light">Light</SelectItem>
                      <SelectItem value="dark">Dark</SelectItem>
                      <SelectItem value="system">System</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="units">Units</Label>
                  <Select
                    value={formData.profile?.preferences?.units || 'metric'}
                    onValueChange={(value) => setFormData((prev: any) => ({
                      ...prev,
                      profile: { ...prev.profile, preferences: { ...prev.profile?.preferences, units: value } }
                    }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="metric">Metric (kg, cm)</SelectItem>
                      <SelectItem value="imperial">Imperial (lbs, ft)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="timeFormat">Time Format</Label>
                  <Select
                    value={formData.profile?.preferences?.timeFormat || '12h'}
                    onValueChange={(value) => setFormData((prev: any) => ({
                      ...prev,
                      profile: { ...prev.profile, preferences: { ...prev.profile?.preferences, timeFormat: value } }
                    }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="12h">12 Hour (AM/PM)</SelectItem>
                      <SelectItem value="24h">24 Hour</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex justify-end">
                <Button onClick={handleSaveSettings} disabled={saving}>
                  {saving ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Save Preferences
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

      </Tabs>
    </div>
  )
}
