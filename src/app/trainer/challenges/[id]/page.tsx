'use client'

import { useEffect, useState } from 'react'

import { useParams, useRouter, useSearchParams } from 'next/navigation'
import { apiClient, type Challenge } from '@/lib/api-client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { DatePicker } from '@/components/ui/date-picker'
import { useAuth } from '@/contexts/auth-context'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { 
  ArrowLeft, 
  Edit, 
  Save, 
  X, 
  Trash2, 
  Trophy,
  Target,
  Clock,
  Star,
  Users,
  Calendar,
  Globe,
  Lock,
  Send,
  Check
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

export default function ChallengeDetailPage() {
  const params = useParams()
  const router = useRouter()
  const searchParams = useSearchParams()
  const { user, isLoading } = useAuth()
  
  const [challenge, setChallenge] = useState<Challenge | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [editForm, setEditForm] = useState<Partial<Challenge>>({})
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [showEditWarningDialog, setShowEditWarningDialog] = useState(false)
  const [showApproveDialog, setShowApproveDialog] = useState(false)
  const [showSubmitDialog, setShowSubmitDialog] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [showWithdrawDialog, setShowWithdrawDialog] = useState(false)
  const [withdrawing, setWithdrawing] = useState(false)
  const [editStartDate, setEditStartDate] = useState<Date | undefined>(undefined)
  const [editEndDate, setEditEndDate] = useState<Date | undefined>(undefined)

  const challengeId = params.id as string

  // Check for edit query parameter
  useEffect(() => {
    const editParam = searchParams.get('edit')
    if (editParam === 'true') {
      setIsEditing(true)
      // Remove the edit parameter from URL without triggering navigation
      const url = new URL(window.location.href)
      url.searchParams.delete('edit')
      window.history.replaceState({}, '', url.toString())
    }
  }, [searchParams])

  useEffect(() => {
    if (!isLoading) {
      if (!user) {
        router.push('/login')
        return
      }
      if (!user.isTrainer) {
        router.push('/')
        return
      }
      loadChallenge()
    }
  }, [user, isLoading, router])

  const loadChallenge = async () => {
    try {
      setLoading(true)
      const res = await apiClient.getTrainerChallengeById(parseInt(challengeId))
      if (res.success && res.data) {
        setChallenge(res.data.challenge)
        setEditForm(res.data.challenge)
        // Parse date strings to Date objects for the date pickers
        setEditStartDate(res.data.challenge.startDate ? new Date(res.data.challenge.startDate) : undefined)
        setEditEndDate(res.data.challenge.endDate ? new Date(res.data.challenge.endDate) : undefined)
      } else {
        setError(res.error?.message || 'Failed to load challenge')
      }
    } catch (err) {
      setError('Failed to load challenge')
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    if (!challenge) return

    // If challenge is approved, show warning dialog
    if (challenge.status === 'approved') {
      setShowEditWarningDialog(true)
      return
    }
    
    await performSave()
  }

  const performSave = async () => {
    if (!challenge) return

    try {
      setSaving(true)
      const updateData = {
        ...editForm,
        startDate: editStartDate ? editStartDate.toISOString() : undefined,
        endDate: editEndDate ? editEndDate.toISOString() : undefined
      }
      const res = await apiClient.updateTrainerChallenge(challenge.id, updateData)
      if (res.success) {
        // Reload the challenge to get updated data
        await loadChallenge()
        setIsEditing(false)
        setShowEditWarningDialog(false)
      } else {
        setError(res.error?.message || 'Failed to update challenge')
      }
    } catch (err) {
      setError('Failed to update challenge')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!challenge) return

    try {
      setSaving(true)
      const res = await apiClient.deleteTrainerChallenge(challenge.id)
      if (res.success) {
        router.push('/trainer/challenges')
      } else {
        setError(res.error?.message || 'Failed to delete challenge')
      }
    } catch (err) {
      setError('Failed to delete challenge')
    } finally {
      setSaving(false)
      setShowDeleteDialog(false)
    }
  }

  const handleApprove = async () => {
    if (!challenge) return

    try {
      setSaving(true)
      // Note: This would need to be implemented in the API client
      // For now, we'll just update the local state to show the approval
      setChallenge({ ...challenge, status: 'approved' })
      setShowApproveDialog(false)
    } catch (err) {
      setError('Failed to approve challenge')
    } finally {
      setSaving(false)
    }
  }

  const handleSubmit = async () => {
    if (!challenge) return
    
    setSubmitting(true)
    try {
      const res = await apiClient.submitTrainerChallengeForApproval(challenge.id)
      if (res.success) {
        // Reload the challenge to show updated status
        await loadChallenge()
        setShowSubmitDialog(false)
      } else {
        setError(res.error?.message || 'Failed to submit challenge for approval')
      }
    } catch (err) {
      setError('Failed to submit challenge for approval')
    } finally {
      setSubmitting(false)
    }
  }

  const handleWithdraw = async () => {
    if (!challenge) return
    
    setWithdrawing(true)
    try {
      const res = await apiClient.withdrawChallengeSubmission(challenge.id)
      if (res.success) {
        // Reload the challenge to show updated status
        await loadChallenge()
        setShowWithdrawDialog(false)
      } else {
        setError(res.error?.message || 'Failed to withdraw challenge submission')
      }
    } catch (err) {
      setError('Failed to withdraw challenge submission')
    } finally {
      setWithdrawing(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft': return 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700'
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-400 dark:border-yellow-800'
      case 'approved': return 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800'
      case 'rejected': return 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800'
      case 'active': return 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800'
      default: return 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700'
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'fitness': return 'bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-900/20 dark:text-purple-400 dark:border-purple-800'
      case 'nutrition': return 'bg-orange-100 text-orange-800 border-orange-200 dark:bg-orange-900/20 dark:text-orange-400 dark:border-orange-800'
      case 'wellness': return 'bg-teal-100 text-teal-800 border-teal-200 dark:bg-teal-900/20 dark:text-teal-400 dark:border-teal-800'
      case 'achievement': return 'bg-pink-100 text-pink-800 border-pink-200 dark:bg-pink-900/20 dark:text-pink-400 dark:border-pink-800'
      default: return 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700'
    }
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800'
      case 'intermediate': return 'bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-800'
      case 'advanced': return 'bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-900/20 dark:text-purple-400 dark:border-purple-800'
      default: return 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700'
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <div className="h-10 w-10 bg-gray-200 rounded animate-pulse" />
          <div className="h-8 w-64 bg-gray-200 rounded animate-pulse" />
        </div>
        <div className="grid gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-32 bg-gray-200 rounded animate-pulse" />
          ))}
        </div>
      </div>
    )
  }

  if (error || !challenge) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.push('/trainer/challenges')}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Challenge Not Found</h1>
        </div>
        <Card>
          <CardContent className="p-6 text-center">
            <p className="text-red-600">{error || 'Challenge not found'}</p>
            <Button className="mt-4" onClick={() => router.push('/trainer/challenges')}>
              Back to Challenges
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.push('/trainer/challenges')}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              {isEditing ? 'Edit Challenge' : challenge.title}
            </h1>
            {!isEditing && (
              <div className="flex items-center gap-2 mt-2">
                <Badge className={getStatusColor(challenge.status || 'draft')}>
                  {challenge.status || 'draft'}
                </Badge>
                <Badge className={getTypeColor(challenge.type || 'fitness')}>
                  {challenge.type || 'fitness'}
                </Badge>
                <Badge className={getDifficultyColor(challenge.difficulty || 'beginner')}>
                  {challenge.difficulty || 'beginner'}
                </Badge>
                {challenge.isPublic ? (
                  <Badge className="bg-green-100 text-green-800 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800">
                    <Globe className="h-3 w-3 mr-1" />
                    Public
                  </Badge>
                ) : (
                  <Badge className="bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700">
                    <Lock className="h-3 w-3 mr-1" />
                    Private
                  </Badge>
                )}
              </div>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          {isEditing ? (
            <>
              <Button variant="outline" onClick={() => setIsEditing(false)}>
                <X className="h-4 w-4 mr-2" />
                Cancel
              </Button>
              <Button onClick={handleSave} disabled={saving}>
                <Save className="h-4 w-4 mr-2" />
                {saving ? 'Saving...' : 'Save'}
              </Button>
            </>
          ) : (
            <>
              {/* Submit for Approval (only for draft and rejected) */}
              {(challenge.status === 'draft' || challenge.status === 'rejected') && (
                <Button onClick={() => setShowSubmitDialog(true)} className="bg-black hover:bg-gray-800">
                  <Send className="h-4 w-4 mr-2" />
                  Submit for Approval
                </Button>
              )}
              
              {/* Withdraw (only for pending) */}
              {challenge.status === 'pending' && (
                <Button onClick={() => setShowWithdrawDialog(true)} variant="outline" className="border-yellow-300 text-yellow-700 hover:bg-yellow-50">
                  <X className="h-4 w-4 mr-2" />
                  Withdraw
                </Button>
              )}
              
              {/* Edit (always available) */}
              <Button variant="outline" onClick={() => setIsEditing(true)}>
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </Button>
              
              {/* Delete (only for draft and rejected) */}
              {(challenge.status === 'draft' || challenge.status === 'rejected') && (
                <Button onClick={() => setShowDeleteDialog(true)} variant="outline" className="border-red-300 text-red-700 hover:bg-red-50">
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </Button>
              )}
            </>
          )}
        </div>
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
              {isEditing ? (
                <>
                  <div>
                    <Label htmlFor="title">Challenge Title *</Label>
                    <Input
                      id="title"
                      value={editForm.title || ''}
                      onChange={(e) => setEditForm(prev => ({ ...prev, title: e.target.value }))}
                      placeholder="Enter challenge title"
                    />
                  </div>
                  <div>
                    <Label htmlFor="description">Description *</Label>
                    <Textarea
                      id="description"
                      value={editForm.description || ''}
                      onChange={(e) => setEditForm(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Describe what participants need to do to complete this challenge"
                      rows={4}
                    />
                  </div>
                </>
              ) : (
                <>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white">{challenge.title}</h3>
                  {challenge.description && (
                    <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap leading-relaxed">{challenge.description}</p>
                  )}
                </>
              )}
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
              {isEditing ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="type">Challenge Type</Label>
                    <Select value={editForm.type || 'fitness'} onValueChange={(value) => setEditForm(prev => ({ ...prev, type: value as any }))}>
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
                  <div>
                    <Label htmlFor="difficulty">Difficulty Level</Label>
                    <Select value={editForm.difficulty || 'beginner'} onValueChange={(value) => setEditForm(prev => ({ ...prev, difficulty: value as any }))}>
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
                  <div>
                    <Label htmlFor="duration">Duration</Label>
                    <Select value={editForm.duration?.toString() || '7'} onValueChange={(value) => setEditForm(prev => ({ ...prev, duration: parseInt(value) }))}>
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
                  <div>
                    <Label htmlFor="xpReward">XP Reward</Label>
                    <Input
                      id="xpReward"
                      type="number"
                      value={editForm.xpReward || 100}
                      onChange={(e) => setEditForm(prev => ({ ...prev, xpReward: parseInt(e.target.value) || 100 }))}
                      min="0"
                      placeholder="XP reward amount"
                    />
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center p-3 bg-purple-50 dark:bg-purple-950/20 rounded-lg border border-purple-200 dark:border-purple-800">
                    <Target className="h-5 w-5 mx-auto text-purple-600 dark:text-purple-400 mb-1" />
                    <div className="text-lg font-bold text-purple-700 dark:text-purple-300 capitalize">{challenge.type}</div>
                    <div className="text-xs text-purple-600 dark:text-purple-400">Type</div>
                  </div>
                  <div className="text-center p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-800">
                    <Trophy className="h-5 w-5 mx-auto text-blue-600 dark:text-blue-400 mb-1" />
                    <div className="text-lg font-bold text-blue-700 dark:text-blue-300 capitalize">{challenge.difficulty}</div>
                    <div className="text-xs text-blue-600 dark:text-blue-400">Difficulty</div>
                  </div>
                  <div className="text-center p-3 bg-green-50 dark:bg-green-950/20 rounded-lg border border-green-200 dark:border-green-800">
                    <Clock className="h-5 w-5 mx-auto text-green-600 dark:text-green-400 mb-1" />
                    <div className="text-lg font-bold text-green-700 dark:text-green-300">{challenge.duration}</div>
                    <div className="text-xs text-green-600 dark:text-green-400">Days</div>
                  </div>
                  <div className="text-center p-3 bg-orange-50 dark:bg-orange-950/20 rounded-lg border border-orange-200 dark:border-orange-800">
                    <Star className="h-5 w-5 mx-auto text-orange-600 dark:text-orange-400 mb-1" />
                    <div className="text-lg font-bold text-orange-700 dark:text-orange-300">{challenge.xpReward}</div>
                    <div className="text-xs text-orange-600 dark:text-orange-400">XP Reward</div>
                  </div>
                </div>
              )}
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
              {isEditing ? (
                <div>
                  <Label htmlFor="requirements">Challenge Requirements</Label>
                  <Textarea
                    id="requirements"
                    value={editForm.requirements || ''}
                    onChange={(e) => setEditForm(prev => ({ ...prev, requirements: e.target.value }))}
                    placeholder="Describe the specific requirements participants must meet to complete this challenge. For example: Complete 10,000 steps daily, Work out 3 times per week, etc."
                    rows={6}
                  />
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                    Describe the specific requirements participants must meet to complete this challenge.
                  </p>
                </div>
              ) : (
                <div>
                  {challenge.requirements ? (
                    <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap leading-relaxed">
                      {challenge.requirements}
                    </p>
                  ) : (
                    <p className="text-gray-500 dark:text-gray-400 italic">
                      No requirements specified
                    </p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Stats */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Statistics
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-800">
                <Users className="h-5 w-5 mx-auto text-blue-600 dark:text-blue-400 mb-1" />
                <div className="text-lg font-bold text-blue-700 dark:text-blue-300">{challenge.participantCount}</div>
                <div className="text-xs text-blue-600 dark:text-blue-400">Participants</div>
              </div>
              <div className="text-center p-3 bg-green-50 dark:bg-green-950/20 rounded-lg border border-green-200 dark:border-green-800">
                <Trophy className="h-5 w-5 mx-auto text-green-600 dark:text-green-400 mb-1" />
                <div className="text-lg font-bold text-green-700 dark:text-green-300">{challenge.completionCount}</div>
                <div className="text-xs text-green-600 dark:text-green-400">Completions</div>
              </div>
            </CardContent>
          </Card>

          {/* Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5" />
                Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {isEditing ? (
                <>
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="isPublic">Public Challenge</Label>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Make this challenge visible to all users
                      </p>
                    </div>
                    <Switch
                      id="isPublic"
                      checked={editForm.isPublic || false}
                      onCheckedChange={(checked) => setEditForm(prev => ({ ...prev, isPublic: checked }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="language">Language</Label>
                    <Select value={editForm.language || 'en'} onValueChange={(value) => setEditForm(prev => ({ ...prev, language: value }))}>
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
                </>
              ) : (
                <>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Visibility</span>
                    {challenge.isPublic ? (
                      <Badge className="bg-green-100 text-green-800 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800">
                        <Globe className="h-3 w-3 mr-1" />
                        Public
                      </Badge>
                    ) : (
                      <Badge className="bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700">
                        <Lock className="h-3 w-3 mr-1" />
                        Private
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Language</span>
                    <span className="text-sm text-gray-600 dark:text-gray-400 uppercase">{challenge.language}</span>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Schedule */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Schedule
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {isEditing ? (
                <>
                  <div>
                    <Label htmlFor="startDate">Start Date (Optional)</Label>
                    <DatePicker
                      value={editStartDate}
                      onChange={setEditStartDate}
                      placeholder="Select start date"
                    />
                  </div>
                  <div>
                    <Label htmlFor="endDate">End Date (Optional)</Label>
                    <DatePicker
                      value={editEndDate}
                      onChange={setEditEndDate}
                      placeholder="Select end date"
                    />
                  </div>
                </>
              ) : (
                <>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Created</span>
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      {new Date(challenge.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  {challenge.startDate && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Start Date</span>
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        {new Date(challenge.startDate).toLocaleDateString()}
                      </span>
                    </div>
                  )}
                  {challenge.endDate && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">End Date</span>
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        {new Date(challenge.endDate).toLocaleDateString()}
                      </span>
                    </div>
                  )}
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Approve Confirmation Dialog */}
      <Dialog open={showApproveDialog} onOpenChange={setShowApproveDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Approve Challenge</DialogTitle>
            <DialogDescription>
              Are you sure you want to approve "{challenge?.title}"? This will make the challenge available to users.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowApproveDialog(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleApprove}
              className="bg-green-600 hover:bg-green-700"
              disabled={saving}
            >
              {saving ? 'Approving...' : 'Approve'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Challenge</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "{challenge?.title}"? This action cannot be undone and will permanently remove the challenge.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleDelete}
              className="bg-red-600 hover:bg-red-700"
              disabled={saving}
            >
              {saving ? 'Deleting...' : 'Delete'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Submit Confirmation Dialog */}
      <Dialog open={showSubmitDialog} onOpenChange={setShowSubmitDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Submit for Approval</DialogTitle>
            <DialogDescription>
              Are you sure you want to submit "{challenge?.title}" for approval? This will send it to the admin for review.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowSubmitDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={submitting} className="bg-black hover:bg-gray-800">
              {submitting ? 'Submitting...' : 'Submit for Approval'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Withdraw Confirmation Dialog */}
      <Dialog open={showWithdrawDialog} onOpenChange={setShowWithdrawDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Withdraw Submission</DialogTitle>
            <DialogDescription>
              Are you sure you want to withdraw "{challenge?.title}" from review? You'll be able to make edits and resubmit it later.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowWithdrawDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleWithdraw} disabled={withdrawing} className="bg-yellow-600 hover:bg-yellow-700">
              {withdrawing ? 'Withdrawing...' : 'Withdraw'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Warning Dialog */}
      <Dialog open={showEditWarningDialog} onOpenChange={setShowEditWarningDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Approved Challenge</DialogTitle>
            <DialogDescription>
              This challenge is approved. Editing it will change the status to draft and require re-approval. Are you sure you want to continue?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditWarningDialog(false)}>
              Cancel
            </Button>
            <Button onClick={performSave} disabled={saving}>
              {saving ? 'Saving...' : 'Continue & Save'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
