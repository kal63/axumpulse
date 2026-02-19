'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/auth-context'
import { apiClient } from '@/lib/api-client'
import { NeumorphicCard } from '@/components/user/NeumorphicCard'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { 
  Settings as SettingsIcon, 
  ArrowLeft, 
  User, 
  Bell, 
  Palette, 
  Target, 
  Camera, 
  Trash2, 
  Save,
  Loader2,
  Mail,
  Phone,
  Calendar,
  Globe,
  Clock,
  Ruler,
  Activity,
  Heart,
  Dumbbell
} from 'lucide-react'
import { uploadUserProfileImage, removeUserProfileImage, validateFileSize, validateImageType, FILE_SIZE_LIMITS, ALLOWED_FILE_TYPES, getImageUrl } from '@/lib/upload-utils'
import { useToast } from '@/hooks/use-toast'

export default function SettingsPage() {
  const router = useRouter()
  const { user: authUser } = useAuth()
  const { toast } = useToast()
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState('account')
  
  // Settings data
  const [settings, setSettings] = useState<any>(null)
  const [formData, setFormData] = useState<any>({})
  const [languages, setLanguages] = useState<any[]>([])

  // Apply theme function
  const applyTheme = (theme: string) => {
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

  useEffect(() => {
    fetchSettings()
    fetchLanguages()
  }, [])

  // Apply theme when settings are loaded
  useEffect(() => {
    if (settings?.preferences?.theme) {
      applyTheme(settings.preferences.theme)
      
      // Listen for system theme changes if theme is set to 'system'
      if (settings.preferences.theme === 'system') {
        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
        const handleChange = () => applyTheme('system')
        mediaQuery.addEventListener('change', handleChange)
        return () => mediaQuery.removeEventListener('change', handleChange)
      }
    }
  }, [settings])

  async function fetchSettings() {
    try {
      setLoading(true)
      setError(null)

      const response = await apiClient.getUserSettings()

      if (response.success && response.data) {
        setSettings(response.data)
        setFormData(response.data)
      } else {
        setError('Failed to load settings')
      }
    } catch (err) {
      console.error('Error fetching settings:', err)
      setError('Failed to load settings')
    } finally {
      setLoading(false)
    }
  }

  async function fetchLanguages() {
    try {
      const response = await apiClient.getLanguages()
      if (response.success && response.data) {
        setLanguages(response.data)
      }
    } catch (err) {
      console.error('Error fetching languages:', err)
    }
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file
    const sizeValidation = validateFileSize(file, FILE_SIZE_LIMITS.PROFILE_IMAGE)
    if (!sizeValidation.valid) {
      toast({
        title: 'Invalid File',
        description: sizeValidation.error,
        variant: 'destructive'
      })
      return
    }

    const typeValidation = validateImageType(file, ALLOWED_FILE_TYPES.PROFILE_IMAGE)
    if (!typeValidation.valid) {
      toast({
        title: 'Invalid File Type',
        description: typeValidation.error,
        variant: 'destructive'
      })
      return
    }

    try {
      setUploading(true)
      const result = await uploadUserProfileImage(file)
      
      if (result.success) {
        setFormData((prev: any) => ({
          ...prev,
          account: { ...prev.account, profilePicture: result.data.profilePicture }
        }))
        toast({
          title: 'Profile Picture Updated!',
          description: 'Your profile picture has been uploaded successfully.',
        })
      } else {
        throw new Error(result.error?.message || 'Upload failed')
      }
    } catch (error) {
      toast({
        title: 'Upload Failed',
        description: error instanceof Error ? error.message : 'Failed to upload profile picture',
        variant: 'destructive'
      })
    } finally {
      setUploading(false)
    }
  }

  const handleRemoveImage = async () => {
    try {
      setUploading(true)
      const result = await removeUserProfileImage()
      
      if (result.success) {
        setFormData((prev: any) => ({
          ...prev,
          account: { ...prev.account, profilePicture: null }
        }))
        toast({
          title: 'Profile Picture Removed',
          description: 'Your profile picture has been removed successfully.',
        })
      } else {
        throw new Error(result.error?.message || 'Removal failed')
      }
    } catch (error) {
      toast({
        title: 'Removal Failed',
        description: error instanceof Error ? error.message : 'Failed to remove profile picture',
        variant: 'destructive'
      })
    } finally {
      setUploading(false)
    }
  }

  const handleSave = async () => {
    try {
      setSaving(true)
      const response = await apiClient.updateUserSettings(formData)
      
      if (response.success) {
        setSettings(formData)
        // Ensure theme is applied after save
        if (formData.preferences?.theme) {
          applyTheme(formData.preferences.theme)
        }
        toast({
          title: 'Settings Updated!',
          description: 'Your settings have been saved successfully.',
        })
      } else {
        throw new Error(response.error?.message || 'Failed to update settings')
      }
    } catch (error) {
      toast({
        title: 'Update Failed',
        description: error instanceof Error ? error.message : 'Failed to update settings',
        variant: 'destructive'
      })
    } finally {
      setSaving(false)
    }
  }

  const handleBack = () => {
    router.push('/user/profile')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--neumorphic-bg)] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-500 mx-auto mb-4"></div>
          <p className="text-[var(--neumorphic-text)]">Loading settings...</p>
        </div>
      </div>
    )
  }

  if (error || !settings) {
    return (
      <div className="min-h-screen bg-[var(--neumorphic-bg)] flex items-center justify-center">
        <div className="text-center">
          <SettingsIcon className="h-16 w-16 mx-auto mb-4 text-red-500 opacity-50" />
          <p className="text-[var(--neumorphic-text)] text-xl font-semibold mb-2">
            Failed to load settings
          </p>
          <p className="text-[var(--neumorphic-muted)] mb-4">{error}</p>
          <Button
            onClick={fetchSettings}
            className="bg-gradient-to-r from-cyan-500 to-purple-600 text-white"
          >
            Try Again
          </Button>
        </div>
      </div>
    )
  }

  const content = (
    <div className="min-h-screen bg-[var(--neumorphic-bg)]">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 via-purple-500/5 to-pink-500/10" />
        
        <div className="relative px-4 md:px-8 py-12">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-between mb-8">
              <div>
                <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-cyan-500 to-purple-600 text-white px-4 py-2 rounded-full text-sm font-medium mb-4">
                  <SettingsIcon className="w-4 h-4" />
                  <span>Account Management</span>
                </div>
                <h1 className="text-4xl md:text-6xl font-bold text-[var(--neumorphic-text)] mb-4">
                  ⚙️ Settings
                </h1>
                <p className="text-xl text-[var(--neumorphic-muted)] max-w-2xl">
                  Manage your account, preferences
                </p>
              </div>
              
              <Button
                variant="outline"
                onClick={handleBack}
                className="hidden md:flex items-center gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Profile
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Settings Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="space-y-8">
          {/* Custom Tab Navigation with Sliding Background */}
          <div className="max-w-4xl mx-auto">
            <div className="relative bg-[var(--neumorphic-surface)] p-2 rounded-2xl shadow-lg dark:shadow-xl">
              {/* Sliding Background */}
              <div 
                className={`absolute top-2 bottom-2 rounded-xl bg-gradient-to-r from-cyan-500 to-purple-600 transition-all duration-500 ease-out ${
                  activeTab === 'account'
                    ? 'left-2 right-[66.666%] mr-1'
                    : activeTab === 'preferences'
                    ? 'left-[33.333%] right-[33.333%] ml-1 mr-1'
                    : 'left-[66.666%] right-2 ml-1'
                }`}
              />
              
              <div className="relative flex">
                <button
                  onClick={() => setActiveTab('account')}
                  className={`flex items-center justify-center md:space-x-3 px-3 md:px-6 py-3 rounded-xl transition-all duration-300 transform relative z-10 flex-1 ${
                    activeTab === 'account'
                      ? 'text-white'
                      : 'text-[var(--neumorphic-text)] hover:text-[var(--neumorphic-accent)]'
                  }`}
                >
                  <User className="w-5 h-5" />
                  <div className="text-left hidden md:block">
                    <div className="font-semibold">Account</div>
                    <div className={`text-xs ${activeTab === 'account' ? 'opacity-80' : 'opacity-60'}`}>
                      Personal info
                    </div>
                  </div>
                </button>
                
                <button
                  onClick={() => setActiveTab('preferences')}
                  className={`flex items-center justify-center md:space-x-3 px-3 md:px-6 py-3 rounded-xl transition-all duration-300 transform relative z-10 flex-1 ${
                    activeTab === 'preferences'
                      ? 'text-white'
                      : 'text-[var(--neumorphic-text)] hover:text-[var(--neumorphic-accent)]'
                  }`}
                >
                  <Palette className="w-5 h-5" />
                  <div className="text-left hidden md:block">
                    <div className="font-semibold">Preferences</div>
                    <div className={`text-xs ${activeTab === 'preferences' ? 'opacity-80' : 'opacity-60'}`}>
                      App settings
                    </div>
                  </div>
                </button>
                
                <button
                  onClick={() => setActiveTab('notifications')}
                  className={`flex items-center justify-center md:space-x-3 px-3 md:px-6 py-3 rounded-xl transition-all duration-300 transform relative z-10 flex-1 ${
                    activeTab === 'notifications'
                      ? 'text-white'
                      : 'text-[var(--neumorphic-text)] hover:text-[var(--neumorphic-accent)]'
                  }`}
                >
                  <Bell className="w-5 h-5" />
                  <div className="text-left hidden md:block">
                    <div className="font-semibold">Notifications</div>
                    <div className={`text-xs ${activeTab === 'notifications' ? 'opacity-80' : 'opacity-60'}`}>
                      Email & alerts
                    </div>
                  </div>
                </button>
                
                {/* <button
                  onClick={() => setActiveTab('fitness')}
                  className={`flex items-center justify-center md:space-x-3 px-3 md:px-6 py-3 rounded-xl transition-all duration-300 transform relative z-10 flex-1 ${
                    activeTab === 'fitness'
                      ? 'text-white'
                      : 'text-[var(--neumorphic-text)] hover:text-[var(--neumorphic-accent)]'
                  }`}
                >
                  <Target className="w-5 h-5" />
                  <div className="text-left hidden md:block">
                    <div className="font-semibold">Fitness</div>
                    <div className={`text-xs ${activeTab === 'fitness' ? 'opacity-80' : 'opacity-60'}`}>
                      Goals & health
                    </div>
                  </div>
                </button> */}
              </div>
            </div>
          </div>

          {/* Account Tab */}
          {activeTab === 'account' && (
            <div className="space-y-6">
            <NeumorphicCard variant="raised" className="p-6">
              <h2 className="text-2xl font-bold text-[var(--neumorphic-text)] mb-6 flex items-center gap-2">
                <User className="h-6 w-6 text-cyan-500" />
                Account Information
              </h2>
              
              <div className="space-y-6">
                {/* Profile Picture */}
                <div className="flex items-center gap-6">
                  <Avatar className="h-20 w-20">
                    <AvatarImage 
                      src={getImageUrl(formData.account?.profilePicture)} 
                      alt={formData.account?.name} 
                    />
                    <AvatarFallback className="text-lg">
                      {formData.account?.name?.charAt(0)?.toUpperCase() || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="space-y-2">
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={uploading || saving}
                      >
                        <Camera className="h-4 w-4 mr-2" />
                        {uploading ? 'Uploading...' : 'Change Photo'}
                      </Button>
                      {formData.account?.profilePicture && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handleRemoveImage}
                          disabled={uploading || saving}
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Remove
                        </Button>
                      )}
                    </div>
                    <p className="text-sm text-[var(--neumorphic-muted)]">
                      JPG, PNG, GIF or WebP. Max size 10MB.
                    </p>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                  </div>
                </div>

                {/* Personal Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    <Input
                      id="name"
                      value={formData.account?.name || ''}
                      onChange={(e) => setFormData((prev: any) => ({
                        ...prev,
                        account: { ...prev.account, name: e.target.value }
                      }))}
                      placeholder="Enter your full name"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.account?.email || ''}
                      onChange={(e) => setFormData((prev: any) => ({
                        ...prev,
                        account: { ...prev.account, email: e.target.value }
                      }))}
                      placeholder="Enter your email"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone</Label>
                    <Input
                      id="phone"
                      value={formData.account?.phone || ''}
                      disabled
                      className="bg-gray-100 dark:bg-gray-800 cursor-not-allowed"
                      placeholder="Phone number cannot be changed"
                    />
                    <p className="text-xs text-[var(--neumorphic-muted)]">
                      Phone number cannot be changed for security reasons
                    </p>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="dateOfBirth">Date of Birth</Label>
                    <Input
                      id="dateOfBirth"
                      type="date"
                      value={formData.account?.dateOfBirth || ''}
                      onChange={(e) => setFormData((prev: any) => ({
                        ...prev,
                        account: { ...prev.account, dateOfBirth: e.target.value }
                      }))}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="gender">Gender</Label>
                    <Select
                      value={formData.account?.gender || ''}
                      onValueChange={(value) => setFormData((prev: any) => ({
                        ...prev,
                        account: { ...prev.account, gender: value }
                      }))}
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
              </div>
            </NeumorphicCard>
            </div>
          )}

          {/* Preferences Tab */}
          {activeTab === 'preferences' && (
            <div className="space-y-6">
            <NeumorphicCard variant="raised" className="p-6">
              <h2 className="text-2xl font-bold text-[var(--neumorphic-text)] mb-6 flex items-center gap-2">
                <Palette className="h-6 w-6 text-purple-500" />
                App Preferences
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="language">Language</Label>
                  <Select
                    value={formData.preferences?.language || 'en'}
                    onValueChange={(value) => setFormData((prev: any) => ({
                      ...prev,
                      preferences: { ...prev.preferences, language: value }
                    }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {languages.map((language) => (
                        <SelectItem key={language.id} value={language.code}>
                          {language.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="theme">Theme</Label>
                  <Select
                    value={formData.preferences?.theme || 'system'}
                    onValueChange={(value) => {
                      setFormData((prev: any) => ({
                        ...prev,
                        preferences: { ...prev.preferences, theme: value }
                      }))
                      // Apply theme immediately when changed
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
                    value={formData.preferences?.units || 'metric'}
                    onValueChange={(value) => setFormData((prev: any) => ({
                      ...prev,
                      preferences: { ...prev.preferences, units: value }
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
                    value={formData.preferences?.timeFormat || '12h'}
                    onValueChange={(value) => setFormData((prev: any) => ({
                      ...prev,
                      preferences: { ...prev.preferences, timeFormat: value }
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
            </NeumorphicCard>
            </div>
          )}

          {/* Notifications Tab */}
          {activeTab === 'notifications' && (
            <div className="space-y-6">
            <NeumorphicCard variant="raised" className="p-6">
              <h2 className="text-2xl font-bold text-[var(--neumorphic-text)] mb-6 flex items-center gap-2">
                <Bell className="h-6 w-6 text-orange-500" />
                Notification Settings
              </h2>
              
              <div className="space-y-6">
                {/* Email Notifications */}
                <div>
                  <h3 className="text-lg font-semibold text-[var(--neumorphic-text)] mb-4 flex items-center gap-2">
                    <Mail className="h-5 w-5" />
                    Email Notifications
                  </h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Challenge Reminders</p>
                        <p className="text-sm text-[var(--neumorphic-muted)]">Get reminded about active challenges</p>
                      </div>
                      <Switch
                        checked={formData.notifications?.email?.challengeReminders || false}
                        onCheckedChange={(checked) => setFormData((prev: any) => ({
                          ...prev,
                          notifications: {
                            ...prev.notifications,
                            email: { ...prev.notifications?.email, challengeReminders: checked }
                          }
                        }))}
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Achievement Notifications</p>
                        <p className="text-sm text-[var(--neumorphic-muted)]">Get notified when you unlock achievements</p>
                      </div>
                      <Switch
                        checked={formData.notifications?.email?.achievementNotifications || false}
                        onCheckedChange={(checked) => setFormData((prev: any) => ({
                          ...prev,
                          notifications: {
                            ...prev.notifications,
                            email: { ...prev.notifications?.email, achievementNotifications: checked }
                          }
                        }))}
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Weekly Reports</p>
                        <p className="text-sm text-[var(--neumorphic-muted)]">Receive weekly progress summaries</p>
                      </div>
                      <Switch
                        checked={formData.notifications?.email?.weeklyReports || false}
                        onCheckedChange={(checked) => setFormData((prev: any) => ({
                          ...prev,
                          notifications: {
                            ...prev.notifications,
                            email: { ...prev.notifications?.email, weeklyReports: checked }
                          }
                        }))}
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Marketing Emails</p>
                        <p className="text-sm text-[var(--neumorphic-muted)]">Receive updates about new features and offers</p>
                      </div>
                      <Switch
                        checked={formData.notifications?.email?.marketing || false}
                        onCheckedChange={(checked) => setFormData((prev: any) => ({
                          ...prev,
                          notifications: {
                            ...prev.notifications,
                            email: { ...prev.notifications?.email, marketing: checked }
                          }
                        }))}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </NeumorphicCard>
            </div>
          )}


          {/* Save Button */}
          <div className="flex justify-end">
            <Button
              onClick={handleSave}
              disabled={saving || uploading}
              className="bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-600 hover:to-purple-700 text-white"
            >
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
          </div>
        </div>
      </div>
    </div>
  )

  return content
}


