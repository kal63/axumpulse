'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { ArrowLeft, Check, X, Trophy, User, Calendar, Clock, Target, Award, Users } from 'lucide-react'
import { toast } from 'sonner'
import { apiClient, type ModerationItemType } from '@/lib/api-client'

export default function ChallengeModerationDetailPage() {
  const params = useParams()
  const router = useRouter()
  const challengeId = params.id as string

  const [challenge, setChallenge] = useState<ModerationItemType | null>(null)
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(false)
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false)
  const [rejectReason, setRejectReason] = useState('')

  useEffect(() => {
    fetchChallenge()
  }, [challengeId])

  const fetchChallenge = async () => {
    try {
      setLoading(true)
      const response = await apiClient.getModerationItem('challenge', parseInt(challengeId))
      if (response.success && response.data) {
        setChallenge(response.data.item)
      } else {
        toast.error('Failed to fetch challenge details')
        router.push('/admin/moderation?tab=challenge')
      }
    } catch (error: any) {
      console.error('Error fetching challenge:', error)
      toast.error('Failed to fetch challenge details')
      router.push('/admin/moderation?tab=challenge')
    } finally {
      setLoading(false)
    }
  }

  const handleApprove = async () => {
    if (!challenge) return

    try {
      setActionLoading(true)
      await apiClient.approveModerationItem('challenge', challenge.id)
      toast.success('Challenge approved successfully')
      router.push('/admin/moderation?tab=challenge')
    } catch (error: any) {
      console.error('Error approving challenge:', error)
      toast.error('Failed to approve challenge')
    } finally {
      setActionLoading(false)
    }
  }

  const handleReject = async () => {
    if (!challenge || !rejectReason.trim()) {
      toast.error('Please provide a rejection reason')
      return
    }

    try {
      setActionLoading(true)
      await apiClient.rejectModerationItem('challenge', challenge.id, rejectReason)
      toast.success('Challenge rejected')
      router.push('/admin/moderation?tab=challenge')
    } catch (error: any) {
      console.error('Error rejecting challenge:', error)
      toast.error('Failed to reject challenge')
    } finally {
      setActionLoading(false)
      setRejectDialogOpen(false)
      setRejectReason('')
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'border-green-200 bg-green-50 text-green-700 dark:border-green-800 dark:bg-green-950/20 dark:text-green-400'
      case 'rejected':
        return 'border-red-200 bg-red-50 text-red-700 dark:border-red-800 dark:bg-red-950/20 dark:text-red-400'
      case 'pending':
        return 'border-yellow-200 bg-yellow-50 text-yellow-700 dark:border-yellow-800 dark:bg-yellow-950/20 dark:text-yellow-400'
      default:
        return 'border-gray-200 bg-gray-50 text-gray-700 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300'
    }
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner':
        return 'border-green-200 bg-green-50 text-green-700 dark:border-green-800 dark:bg-green-950/20 dark:text-green-400'
      case 'intermediate':
        return 'border-yellow-200 bg-yellow-50 text-yellow-700 dark:border-yellow-800 dark:bg-yellow-950/20 dark:text-yellow-400'
      case 'advanced':
        return 'border-red-200 bg-red-50 text-red-700 dark:border-red-800 dark:bg-red-950/20 dark:text-red-400'
      default:
        return 'border-gray-200 bg-gray-50 text-gray-700 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300'
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'fitness':
        return 'border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-800 dark:bg-blue-950/20 dark:text-blue-400'
      case 'nutrition':
        return 'border-green-200 bg-green-50 text-green-700 dark:border-green-800 dark:bg-green-950/20 dark:text-green-400'
      case 'wellness':
        return 'border-purple-200 bg-purple-50 text-purple-700 dark:border-purple-800 dark:bg-purple-950/20 dark:text-purple-400'
      case 'achievement':
        return 'border-orange-200 bg-orange-50 text-orange-700 dark:border-orange-800 dark:bg-orange-950/20 dark:text-orange-400'
      default:
        return 'border-gray-200 bg-gray-50 text-gray-700 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300'
    }
  }

  const getAuthorName = (item: ModerationItemType) => {
    if (item.trainer?.User) {
      return item.trainer.User.name
    }
    return 'Unknown'
  }

  const getAuthorEmail = (item: ModerationItemType) => {
    if (item.trainer?.User) {
      return item.trainer.User.email
    }
    return 'Unknown'
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
      </div>
    )
  }

  if (!challenge) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Challenge Not Found</h1>
          <p className="text-gray-600 dark:text-gray-400 mb-4">The requested challenge could not be found.</p>
          <Button onClick={() => router.push('/admin/moderation?tab=challenge')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Moderation
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button
            variant="outline"
            onClick={() => router.push('/admin/moderation?tab=challenge')}
            className="flex items-center space-x-2"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Moderation</span>
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Challenge Review</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Review challenge before approval
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Badge className={getStatusColor(challenge.status)}>
            {challenge.status}
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Challenge Details */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Trophy className="h-5 w-5" />
                <span>Challenge Details</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">Title</Label>
                <p className="text-lg font-semibold text-gray-900 dark:text-white mt-1">
                  {challenge.title}
                </p>
              </div>

              <div>
                <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">Description</Label>
                <p className="text-gray-700 dark:text-gray-300 mt-1 whitespace-pre-wrap">
                  {challenge.description}
                </p>
              </div>

              {/* Challenge Requirements */}
              {(challenge as any).requirements && (
                <div>
                  <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">Requirements</Label>
                  <p className="text-gray-700 dark:text-gray-300 mt-1 whitespace-pre-wrap">
                    {(challenge as any).requirements}
                  </p>
                </div>
              )}

              {/* Challenge Rules */}
              {(challenge as any).ruleJson && Object.keys((challenge as any).ruleJson).length > 0 && (
                <div>
                  <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">Rules</Label>
                  <div className="mt-2 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <pre className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                      {JSON.stringify((challenge as any).ruleJson, null, 2)}
                    </pre>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Rejection Reason */}
          {challenge.rejectionReason && (
            <Card>
              <CardHeader>
                <CardTitle className="text-red-600 dark:text-red-400">Rejection Reason</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                  {challenge.rejectionReason}
                </p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Author Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <User className="h-5 w-5" />
                <span>Author</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">Name</Label>
                <p className="text-gray-900 dark:text-white">{getAuthorName(challenge)}</p>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">Email</Label>
                <p className="text-gray-900 dark:text-white">{getAuthorEmail(challenge)}</p>
              </div>
            </CardContent>
          </Card>

          {/* Challenge Properties */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Target className="h-5 w-5" />
                <span>Challenge Properties</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {(challenge as any).type && (
                <div>
                  <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">Type</Label>
                  <div className="mt-1">
                    <Badge className={getTypeColor((challenge as any).type)}>
                      {(challenge as any).type}
                    </Badge>
                  </div>
                </div>
              )}
              
              {(challenge as any).difficulty && (
                <div>
                  <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">Difficulty</Label>
                  <div className="mt-1">
                    <Badge className={getDifficultyColor((challenge as any).difficulty)}>
                      {(challenge as any).difficulty}
                    </Badge>
                  </div>
                </div>
              )}

              {(challenge as any).duration && (
                <div>
                  <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">Duration</Label>
                  <p className="text-gray-900 dark:text-white flex items-center">
                    <Clock className="h-4 w-4 mr-1" />
                    {(challenge as any).duration} days
                  </p>
                </div>
              )}

              {(challenge as any).xpReward && (
                <div>
                  <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">XP Reward</Label>
                  <p className="text-gray-900 dark:text-white flex items-center">
                    <Award className="h-4 w-4 mr-1" />
                    {(challenge as any).xpReward} XP
                  </p>
                </div>
              )}

              {(challenge as any).participantCount !== undefined && (
                <div>
                  <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">Participants</Label>
                  <p className="text-gray-900 dark:text-white flex items-center">
                    <Users className="h-4 w-4 mr-1" />
                    {(challenge as any).participantCount}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Metadata */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Calendar className="h-5 w-5" />
                <span>Metadata</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">Created</Label>
                <p className="text-gray-900 dark:text-white">
                  {new Date(challenge.createdAt).toLocaleDateString()} at {new Date(challenge.createdAt).toLocaleTimeString()}
                </p>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">Last Updated</Label>
                <p className="text-gray-900 dark:text-white">
                  {new Date(challenge.updatedAt).toLocaleDateString()} at {new Date(challenge.updatedAt).toLocaleTimeString()}
                </p>
              </div>
              {(challenge as any).language && (
                <div>
                  <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">Language</Label>
                  <p className="text-gray-900 dark:text-white">{(challenge as any).language.toUpperCase()}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Actions */}
          {challenge.status === 'pending' && (
            <Card>
              <CardHeader>
                <CardTitle>Actions</CardTitle>
                <CardDescription>
                  Approve or reject this challenge
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button
                  onClick={handleApprove}
                  disabled={actionLoading}
                  className="w-full bg-emerald-600 hover:bg-emerald-700"
                >
                  <Check className="h-4 w-4 mr-2" />
                  Approve Challenge
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => setRejectDialogOpen(true)}
                  disabled={actionLoading}
                  className="w-full"
                >
                  <X className="h-4 w-4 mr-2" />
                  Reject Challenge
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Reject Dialog */}
      <Dialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Challenge</DialogTitle>
            <DialogDescription>
              Please provide a reason for rejecting this challenge.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="rejectReason" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Rejection Reason
              </Label>
              <Textarea
                id="rejectReason"
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="e.g., Inappropriate content, unclear requirements, poor quality..."
                className="mt-1"
                rows={4}
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setRejectDialogOpen(false)
                setRejectReason('')
              }}
              disabled={actionLoading}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleReject}
              disabled={actionLoading || !rejectReason.trim()}
            >
              Reject Challenge
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
