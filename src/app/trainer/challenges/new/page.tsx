'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { apiClient, type Challenge } from '@/lib/api-client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { DatePicker } from '@/components/ui/date-picker'
import { 
  ArrowLeft, 
  Save, 
  Trophy,
  Target,
  Clock,
  Star,
  Globe,
  Lock
} from 'lucide-react'

const CHALLENGE_TYPES = [
  { value: 'fitness', label: 'Fitness' },
  { value: 'nutrition', label: 'Nutrition' },
  { value: 'wellness', label: 'Wellness' },
  { value: 'achievement', label: 'Achievement' }
]

const DIFFICULTY_LEVELS = [
  { value: 'beginner', label: 'Beginner' },
  { value: 'intermediate', label: 'Intermediate' },
  { value: 'advanced', label: 'Advanced' }
]

const DURATION_OPTIONS = [
  { value: 1, label: '1 day' },
  { value: 3, label: '3 days' },
  { value: 7, label: '1 week' },
  { value: 14, label: '2 weeks' },
  { value: 30, label: '1 month' },
  { value: 60, label: '2 months' },
  { value: 90, label: '3 months' }
]

export default function NewChallengePage() {
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [challenge, setChallenge] = useState<Partial<Challenge>>({
    title: '',
    description: '',
    type: 'fitness',
    difficulty: 'beginner',
    duration: 7,
    xpReward: 100,
    requirements: '',
    contentIds: [],
    language: 'en',
    isPublic: true,
    startDate: '',
    endDate: '',
    isDailyChallenge: false,
    fitnessLevel: null,
    recurrencePattern: null,
    autoAssign: false
  })
  const [recurrenceDays, setRecurrenceDays] = useState<number[]>([])
  const [startDate, setStartDate] = useState<Date | undefined>(undefined)
  const [endDate, setEndDate] = useState<Date | undefined>(undefined)

  const handleSave = async () => {
    try {
      setSaving(true)
      setError(null)

      // Validation
      if (!challenge.title?.trim()) {
        setError('Title is required')
        return
      }

      if (!challenge.description?.trim()) {
        setError('Description is required')
        return
      }

      const challengeData = {
        ...challenge,
        startDate: startDate ? startDate.toISOString() : undefined,
        endDate: endDate ? endDate.toISOString() : undefined,
        recurrencePattern: challenge.isDailyChallenge && recurrenceDays.length > 0
          ? { days: recurrenceDays }
          : null
      }
      
      const res = await apiClient.createTrainerChallenge(challengeData)
      
      if (res.success && res.data) {
        router.push(`/trainer/challenges/${res.data.challenge.id}`)
      } else {
        setError(res.error?.message || 'Failed to create challenge')
      }
    } catch (err) {
      setError('Failed to create challenge')
    } finally {
      setSaving(false)
    }
  }

  const handleInputChange = (field: keyof Challenge, value: any) => {
    setChallenge(prev => ({
      ...prev,
      [field]: value
    }))
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.push('/trainer/challenges')}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Create New Challenge</h1>
      </div>

      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-4">
            <p className="text-red-600">{error}</p>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="h-5 w-5" />
                Basic Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Challenge Title *</Label>
                <Input
                  id="title"
                  value={challenge.title || ''}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  placeholder="Enter challenge title"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  id="description"
                  value={challenge.description || ''}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder="Describe what participants need to do to complete this challenge"
                  rows={4}
                />
              </div>
            </CardContent>
          </Card>

          {/* Challenge Details */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                Challenge Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="type">Challenge Type</Label>
                  <Select value={challenge.type || 'fitness'} onValueChange={(value) => handleInputChange('type', value)}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      {CHALLENGE_TYPES.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="difficulty">Difficulty Level</Label>
                  <Select value={challenge.difficulty || 'beginner'} onValueChange={(value) => handleInputChange('difficulty', value)}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select difficulty" />
                    </SelectTrigger>
                    <SelectContent>
                      {DIFFICULTY_LEVELS.map((level) => (
                        <SelectItem key={level.value} value={level.value}>
                          {level.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="duration">Duration</Label>
                  <Select value={challenge.duration?.toString() || '7'} onValueChange={(value) => handleInputChange('duration', parseInt(value))}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select duration" />
                    </SelectTrigger>
                    <SelectContent>
                      {DURATION_OPTIONS.map((option) => (
                        <SelectItem key={option.value} value={option.value.toString()}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="xpReward">XP Reward</Label>
                  <Input
                    id="xpReward"
                    type="number"
                    value={challenge.xpReward || 100}
                    onChange={(e) => handleInputChange('xpReward', parseInt(e.target.value) || 100)}
                    min="0"
                    placeholder="XP reward amount"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Requirements */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                Requirements
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Label htmlFor="requirements">Challenge Requirements</Label>
                <Textarea
                  id="requirements"
                  value={challenge.requirements || ''}
                  onChange={(e) => handleInputChange('requirements', e.target.value)}
                  placeholder="Describe the specific requirements participants must meet to complete this challenge. For example: Complete 10,000 steps daily, Work out 3 times per week, etc."
                  rows={6}
                />
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                  Describe the specific requirements participants must meet to complete this challenge.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Daily Challenge Settings */}
          {challenge.isDailyChallenge && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Daily Challenge Settings
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="fitnessLevel">Target Fitness Level</Label>
                  <Select 
                    value={challenge.fitnessLevel || undefined} 
                    onValueChange={(value) => handleInputChange('fitnessLevel', value === 'all' ? null : value)}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select target fitness level (optional)" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Levels</SelectItem>
                      {DIFFICULTY_LEVELS.map((level) => (
                        <SelectItem key={level.value} value={level.value}>
                          {level.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    This is separate from difficulty. Select which user fitness level this daily challenge targets.
                  </p>
                </div>

                <div className="space-y-2">
                  <Label>Recurrence Pattern (Days of Week)</Label>
                  <div className="grid grid-cols-7 gap-2">
                    {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day, index) => (
                      <button
                        key={index}
                        type="button"
                        onClick={() => {
                          if (recurrenceDays.includes(index)) {
                            setRecurrenceDays(recurrenceDays.filter(d => d !== index));
                          } else {
                            setRecurrenceDays([...recurrenceDays, index]);
                          }
                        }}
                        className={`
                          p-2 rounded-lg border transition-all
                          ${recurrenceDays.includes(index)
                            ? 'bg-cyan-500 text-white border-cyan-600'
                            : 'bg-gray-100 dark:bg-gray-800 border-gray-300 dark:border-gray-700'
                          }
                        `}
                      >
                        {day}
                      </button>
                    ))}
                  </div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Select which days of the week this challenge should be available. Leave empty for all days.
                  </p>
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="autoAssign">Auto-Assign to Users</Label>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Automatically assign this challenge to users matching the target fitness level
                    </p>
                  </div>
                  <Switch
                    id="autoAssign"
                    checked={challenge.autoAssign || false}
                    onCheckedChange={(checked) => handleInputChange('autoAssign', checked)}
                  />
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5" />
                Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="isDailyChallenge">Daily Challenge</Label>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Mark this as a recurring daily challenge
                  </p>
                </div>
                <Switch
                  id="isDailyChallenge"
                  checked={challenge.isDailyChallenge || false}
                  onCheckedChange={(checked) => handleInputChange('isDailyChallenge', checked)}
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="isPublic">Public Challenge</Label>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Make this challenge visible to all users
                  </p>
                </div>
                <Switch
                  id="isPublic"
                  checked={challenge.isPublic || false}
                  onCheckedChange={(checked) => handleInputChange('isPublic', checked)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="language">Language</Label>
                <Select value={challenge.language || 'en'} onValueChange={(value) => handleInputChange('language', value)}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select language" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="en">English</SelectItem>
                    <SelectItem value="es">Spanish</SelectItem>
                    <SelectItem value="fr">French</SelectItem>
                    <SelectItem value="de">German</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Schedule */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Schedule
              </CardTitle>
            </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="startDate">Start Date (Optional)</Label>
                      <DatePicker
                        value={startDate}
                        onChange={setStartDate}
                        placeholder="Select start date"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="endDate">End Date (Optional)</Label>
                      <DatePicker
                        value={endDate}
                        onChange={setEndDate}
                        placeholder="Select end date"
                      />
                    </div>
                  </CardContent>
          </Card>

          {/* Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Star className="h-5 w-5" />
                Actions
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button onClick={handleSave} disabled={saving} className="w-full">
                <Save className="h-4 w-4 mr-2" />
                {saving ? 'Creating...' : 'Create Challenge'}
              </Button>
              <Button variant="outline" onClick={() => router.push('/trainer/challenges')} className="w-full">
                Cancel
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
