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
  Dumbbell,
  Bot
} from 'lucide-react'
import { uploadUserProfileImage, removeUserProfileImage, validateFileSize, validateImageType, FILE_SIZE_LIMITS, ALLOWED_FILE_TYPES, getImageUrl } from '@/lib/upload-utils'
import { useToast } from '@/hooks/use-toast'
import { applyAppTheme, DEFAULT_USER_THEME, normalizeUserTheme, themeStorageKeyForUser } from '@/lib/app-theme'

const DEFAULT_AI_CONTEXT_SHARING = {
  goalsAndMetrics: true,
  workoutProgress: true,
  challengesProgress: true,
  xpAndStreaks: true,
  medicalProfile: false,
  intakeResponses: false,
  triageRuns: false,
  consultNotes: false,
  healthDataPoints: false
}

const AI_SHARING_ROWS: { key: keyof typeof DEFAULT_AI_CONTEXT_SHARING; label: string; desc: string }[] = [
  { key: 'goalsAndMetrics', label: 'Goals & body metrics', desc: 'Primary goal, height, weight, activity level' },
  { key: 'workoutProgress', label: 'Workout progress', desc: 'Plans started and completed' },
  { key: 'challengesProgress', label: 'Challenges', desc: 'Challenge participation and completions' },
  { key: 'xpAndStreaks', label: 'XP & streaks', desc: 'Points, streaks, and aggregate activity' },
  { key: 'medicalProfile', label: 'Medical profile', desc: 'Conditions, medications, allergies (sensitive)' },
  { key: 'intakeResponses', label: 'Intake forms', desc: 'Answers from medical intake questionnaires' },
  { key: 'triageRuns', label: 'Triage results', desc: 'Recent triage risk and disposition summaries' },
  { key: 'consultNotes', label: 'Consultation notes', desc: 'Recommendations from past consults (sensitive)' },
  { key: 'healthDataPoints', label: 'Health measurements', desc: 'Recent vitals and tracked metrics' }
]

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

  useEffect(() => {
    fetchSettings()
    fetchLanguages()
  }, [])

  // Apply theme when settings are loaded
  useEffect(() => {
    if (!settings) return
    const theme = normalizeUserTheme(settings.preferences?.theme)
    applyAppTheme(theme)

    if (theme === 'system') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
      const handleChange = () => applyAppTheme('system')
      mediaQuery.addEventListener('change', handleChange)
      return () => mediaQuery.removeEventListener('change', handleChange)
    }
  }, [settings])

  async function fetchSettings() {
    try {
      setLoading(true)
      setError(null)

      const response = await apiClient.getUserSettings()

      if (response.success && response.data) {
        const d = { ...response.data }
        d.preferences = {
          ...d.preferences,
          aiContextSharing: {
            ...DEFAULT_AI_CONTEXT_SHARING,
            ...(d.preferences?.aiContextSharing || {})
          }
        }
        setSettings(d)
        setFormData(d)
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
        if (formData.preferences?.theme) {
          const t = normalizeUserTheme(formData.preferences.theme)
          applyAppTheme(t)
          if (authUser?.id) {
            try {
              localStorage.setItem(themeStorageKeyForUser(authUser.id), t)
            } catch {
              /* ignore */
            }
          }
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
      <div className="min-h-dvh min-h-full user-app-page flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--ethio-deep-blue)] mx-auto mb-4"></div>
          <p className="user-app-ink">Loading settings...</p>
        </div>
      </div>
    )
  }

  if (error || !settings) {
    return (
      <div className="min-h-dvh min-h-full user-app-page flex items-center justify-center">
        <div className="text-center">
          <SettingsIcon className="h-16 w-16 mx-auto mb-4 text-red-500 opacity-50" />
          <p className="user-app-ink text-xl font-semibold mb-2">
            Failed to load settings
          </p>
          <p className="user-app-muted mb-4">{error}</p>
          <Button
            onClick={fetchSettings}
            className="user-app-lemon-gradient-active"
          >
            Try Again
          </Button>
        </div>
      </div>
    )
  }

  const content = (
    <div className="min-h-dvh min-h-full user-app-page">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[var(--ethio-lemon)]/10 via-[var(--ethio-deep-blue)]/6 to-transparent" />
        
        <div className="relative px-4 md:px-8 py-12">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-between mb-8">
              <div>
                <div className="user-app-lemon-gradient-active inline-flex items-center space-x-2 px-4 py-2 rounded-full text-sm font-medium mb-4">
                  <SettingsIcon className="w-4 h-4" />
                  <span>Account Management</span>
                </div>
                <h1 className="text-4xl md:text-6xl font-bold user-app-ink mb-4">
                  ⚙️ Settings
                </h1>
                <p className="text-xl user-app-muted max-w-2xl">
                  Manage your account, preferences, and fitness goals
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
            <div className="relative user-app-paper p-2 rounded-2xl shadow-lg dark:shadow-xl">
              {/* Sliding Background */}
              <div 
                className={`absolute top-2 bottom-2 rounded-xl user-app-segment-active-bg transition-all duration-500 ease-out ${
                  activeTab === 'account' 
                    ? 'left-2 right-3/4 mr-1' 
                    : activeTab === 'preferences'
                    ? 'left-1/4 right-1/2 ml-1 mr-1'
                    : activeTab === 'notifications'
                    ? 'left-1/2 right-1/4 ml-1 mr-1'
                    : 'left-3/4 right-2 ml-1'
                }`}
              />
              
              <div className="relative flex">
                <button
                  onClick={() => setActiveTab('account')}
                  className={`flex items-center justify-center md:space-x-3 px-3 md:px-6 py-3 rounded-xl transition-all duration-300 transform relative z-10 flex-1 ${
                    activeTab === 'account'
                      ? 'text-white'
                      : 'user-app-ink hover:user-app-link'
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
                      : 'user-app-ink hover:user-app-link'
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
                      : 'user-app-ink hover:user-app-link'
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
                
                <button
                  onClick={() => setActiveTab('fitness')}
                  className={`flex items-center justify-center md:space-x-3 px-3 md:px-6 py-3 rounded-xl transition-all duration-300 transform relative z-10 flex-1 ${
                    activeTab === 'fitness'
                      ? 'text-white'
                      : 'user-app-ink hover:user-app-link'
                  }`}
                >
                  <Target className="w-5 h-5" />
                  <div className="text-left hidden md:block">
                    <div className="font-semibold">Fitness</div>
                    <div className={`text-xs ${activeTab === 'fitness' ? 'opacity-80' : 'opacity-60'}`}>
                      Goals & health
                    </div>
                  </div>
                </button>
              </div>
            </div>
          </div>

          {/* Account Tab */}
          {activeTab === 'account' && (
            <div className="space-y-6">
            <NeumorphicCard variant="raised" className="p-6">
              <h2 className="text-2xl font-bold user-app-ink mb-6 flex items-center gap-2">
                <User className="h-6 w-6 text-[var(--ethio-lemon-dark)]" />
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
                    <p className="text-sm user-app-muted">
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
                    <p className="text-xs user-app-muted">
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
              <h2 className="text-2xl font-bold user-app-ink mb-6 flex items-center gap-2">
                <Palette className="h-6 w-6 text-[var(--ethio-lemon-dark)]" />
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
                    value={formData.preferences?.theme || DEFAULT_USER_THEME}
                    onValueChange={(value) => {
                      setFormData((prev: any) => ({
                        ...prev,
                        preferences: { ...prev.preferences, theme: value }
                      }))
                      applyAppTheme(value)
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

            <NeumorphicCard variant="raised" className="p-6">
              <h2 className="text-2xl font-bold user-app-ink mb-2 flex items-center gap-2">
                <Bot className="h-6 w-6 text-[var(--ethio-lemon-dark)]" />
                AI coach data sharing
              </h2>
              <p className="text-sm user-app-muted mb-6">
                The in-app AI coach only receives categories you enable below. Medical options stay off by default.
              </p>
              <div className="space-y-4">
                {AI_SHARING_ROWS.map(({ key, label, desc }) => (
                  <div
                    key={key}
                    className="flex items-center justify-between gap-4 py-2 border-b user-app-border last:border-0"
                  >
                    <div>
                      <p className="font-medium user-app-ink">{label}</p>
                      <p className="text-sm user-app-muted">{desc}</p>
                    </div>
                    <Switch
                      checked={Boolean(formData.preferences?.aiContextSharing?.[key])}
                      onCheckedChange={(v) =>
                        setFormData((prev: any) => ({
                          ...prev,
                          preferences: {
                            ...prev.preferences,
                            aiContextSharing: {
                              ...DEFAULT_AI_CONTEXT_SHARING,
                              ...prev.preferences?.aiContextSharing,
                              [key]: v
                            }
                          }
                        }))
                      }
                    />
                  </div>
                ))}
              </div>
            </NeumorphicCard>
            </div>
          )}

          {/* Notifications Tab */}
          {activeTab === 'notifications' && (
            <div className="space-y-6">
            <NeumorphicCard variant="raised" className="p-6">
              <h2 className="text-2xl font-bold user-app-ink mb-6 flex items-center gap-2">
                <Bell className="h-6 w-6 text-orange-500" />
                Notification Settings
              </h2>
              
              <div className="space-y-6">
                {/* Email Notifications */}
                <div>
                  <h3 className="text-lg font-semibold user-app-ink mb-4 flex items-center gap-2">
                    <Mail className="h-5 w-5" />
                    Email Notifications
                  </h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Challenge Reminders</p>
                        <p className="text-sm user-app-muted">Get reminded about active challenges</p>
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
                        <p className="text-sm user-app-muted">Get notified when you unlock achievements</p>
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
                        <p className="text-sm user-app-muted">Receive weekly progress summaries</p>
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
                        <p className="text-sm user-app-muted">Receive updates about new features and offers</p>
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

          {/* Fitness Tab */}
          {activeTab === 'fitness' && (
            <div className="space-y-6">
            <NeumorphicCard variant="raised" className="p-6">
              <h2 className="text-2xl font-bold user-app-ink mb-6 flex items-center gap-2">
                <Target className="h-6 w-6 text-green-500" />
                Fitness Goals & Health
              </h2>
              
              <div className="space-y-6">
                {/* Fitness Goals */}
                <div>
                  <h3 className="text-lg font-semibold user-app-ink mb-4 flex items-center gap-2">
                    <Heart className="h-5 w-5" />
                    Fitness Goals
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="primaryGoal">Primary Goal</Label>
                      <Select
                        value={formData.fitness?.goals?.primary || 'general_fitness'}
                        onValueChange={(value) => setFormData((prev: any) => ({
                          ...prev,
                          fitness: {
                            ...prev.fitness,
                            goals: { ...prev.fitness?.goals, primary: value }
                          }
                        }))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="weight_loss">Weight Loss</SelectItem>
                          <SelectItem value="muscle_gain">Muscle Gain</SelectItem>
                          <SelectItem value="endurance">Endurance</SelectItem>
                          <SelectItem value="flexibility">Flexibility</SelectItem>
                          <SelectItem value="general_fitness">General Fitness</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="targetWeight">Target Weight (kg)</Label>
                      <Input
                        id="targetWeight"
                        type="number"
                        value={formData.fitness?.goals?.targetWeight || ''}
                        onChange={(e) => setFormData((prev: any) => ({
                          ...prev,
                          fitness: {
                            ...prev.fitness,
                            goals: { ...prev.fitness?.goals, targetWeight: e.target.value ? parseFloat(e.target.value) : null }
                          }
                        }))}
                        placeholder="Enter target weight"
                      />
                    </div>
                  </div>
                </div>

                {/* Health Metrics */}
                <div>
                  <h3 className="text-lg font-semibold user-app-ink mb-4 flex items-center gap-2">
                    <Activity className="h-5 w-5" />
                    Health Metrics
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="height">Height (cm)</Label>
                      <Input
                        id="height"
                        type="number"
                        value={formData.fitness?.healthMetrics?.height || ''}
                        onChange={(e) => setFormData((prev: any) => ({
                          ...prev,
                          fitness: {
                            ...prev.fitness,
                            healthMetrics: { ...prev.fitness?.healthMetrics, height: e.target.value ? parseFloat(e.target.value) : null }
                          }
                        }))}
                        placeholder="Enter height"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="weight">Current Weight (kg)</Label>
                      <Input
                        id="weight"
                        type="number"
                        value={formData.fitness?.healthMetrics?.weight || ''}
                        onChange={(e) => setFormData((prev: any) => ({
                          ...prev,
                          fitness: {
                            ...prev.fitness,
                            healthMetrics: { ...prev.fitness?.healthMetrics, weight: e.target.value ? parseFloat(e.target.value) : null }
                          }
                        }))}
                        placeholder="Enter current weight"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="activityLevel">Activity Level</Label>
                      <Select
                        value={formData.fitness?.healthMetrics?.activityLevel || 'moderate'}
                        onValueChange={(value) => setFormData((prev: any) => ({
                          ...prev,
                          fitness: {
                            ...prev.fitness,
                            healthMetrics: { ...prev.fitness?.healthMetrics, activityLevel: value }
                          }
                        }))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="sedentary">Sedentary</SelectItem>
                          <SelectItem value="light">Light Activity</SelectItem>
                          <SelectItem value="moderate">Moderate Activity</SelectItem>
                          <SelectItem value="active">Active</SelectItem>
                          <SelectItem value="very_active">Very Active</SelectItem>
                        </SelectContent>
                      </Select>
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
              className="user-app-lemon-gradient-active"
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


