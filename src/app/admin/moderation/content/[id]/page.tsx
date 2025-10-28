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
import { ArrowLeft, Check, X, FileText, User, Calendar, Eye, Download, Play } from 'lucide-react'
import { toast } from 'sonner'
import { apiClient, type ModerationItemType } from '@/lib/api-client'
import { getImageUrl } from '@/lib/utils'

export default function ContentModerationDetailPage() {
  const params = useParams()
  const router = useRouter()
  const contentId = params.id as string

  const [content, setContent] = useState<ModerationItemType | null>(null)
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(false)
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false)
  const [rejectReason, setRejectReason] = useState('')

  useEffect(() => {
    fetchContent()
  }, [contentId])

  // Debug logging
  useEffect(() => {
    if (content) {
      console.log('Content data:', content)
      console.log('File URL:', (content as any).fileUrl)
      console.log('Thumbnail URL:', (content as any).thumbnailUrl)
      console.log('Content Type:', (content as any).type)
      console.log('Processed File URL:', getImageUrl((content as any).fileUrl))
    }
  }, [content])

  const fetchContent = async () => {
    try {
      setLoading(true)
      const response = await apiClient.getModerationItem('content', parseInt(contentId))
      if (response.success && response.data) {
        setContent(response.data.item)
      } else {
        toast.error('Failed to fetch content details')
        router.push('/admin/moderation?tab=content')
      }
    } catch (error: any) {
      console.error('Error fetching content:', error)
      toast.error('Failed to fetch content details')
      router.push('/admin/moderation?tab=content')
    } finally {
      setLoading(false)
    }
  }

  const handleApprove = async () => {
    if (!content) return

    try {
      setActionLoading(true)
      await apiClient.approveModerationItem('content', content.id)
      toast.success('Content approved successfully')
      router.push('/admin/moderation?tab=content')
    } catch (error: any) {
      console.error('Error approving content:', error)
      toast.error('Failed to approve content')
    } finally {
      setActionLoading(false)
    }
  }

  const handleReject = async () => {
    if (!content || !rejectReason.trim()) {
      toast.error('Please provide a rejection reason')
      return
    }

    try {
      setActionLoading(true)
      await apiClient.rejectModerationItem('content', content.id, rejectReason)
      toast.success('Content rejected')
      router.push('/admin/moderation?tab=content')
    } catch (error: any) {
      console.error('Error rejecting content:', error)
      toast.error('Failed to reject content')
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

  if (!content) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Content Not Found</h1>
          <p className="text-gray-600 dark:text-gray-400 mb-4">The requested content could not be found.</p>
          <Button onClick={() => router.push('/admin/moderation?tab=content')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Moderation
          </Button>
        </div>
      </div>
    )
  }

  console.log('Content:', content)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button
            variant="outline"
            onClick={() => router.push('/admin/moderation?tab=content')}
            className="flex items-center space-x-2"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Moderation</span>
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Content Review</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Review content before approval
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Badge className={getStatusColor(content.status)}>
            {content.status}
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Content Details */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <FileText className="h-5 w-5" />
                <span>Content Details</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">Title</Label>
                <p className="text-lg font-semibold text-gray-900 dark:text-white mt-1">
                  {content.title}
                </p>
              </div>

              <div>
                <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">Description</Label>
                <p className="text-gray-700 dark:text-gray-300 mt-1 whitespace-pre-wrap">
                  {content.description}
                </p>
              </div>

              {/* Content Media */}
              {(content as any).fileUrl && (
                <div>
                  <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">Content</Label>
                  <div className="mt-2">
                    {(content as any).type === 'video' ? (
                      <div className="space-y-2">
                        <div className="relative">
                          <video
                            src={getImageUrl((content as any).fileUrl)}
                            controls
                            className="w-full max-w-md rounded-lg"
                            onError={(e) => {
                              console.error('Video load error:', e)
                              console.error('Video src:', getImageUrl((content as any).fileUrl))
                            }}
                            onLoadStart={() => console.log('Video loading started')}
                            onCanPlay={() => console.log('Video can play')}
                          >
                            Your browser does not support the video tag.
                          </video>
                          <div className="absolute top-2 right-2">
                            <Button size="sm" variant="secondary" className="bg-black/50 text-white hover:bg-black/70">
                              <Play className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                        <div className="text-xs text-gray-500">
                          Content Type: {(content as any).type}
                        </div>
                        <div className="mt-2">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => window.open(getImageUrl((content as any).fileUrl), '_blank')}
                          >
                            <Play className="h-4 w-4 mr-2" />
                            Open Video in New Tab
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="relative">
                        <img
                          src={getImageUrl((content as any).fileUrl)}
                          alt={content.title}
                          className="w-full max-w-md rounded-lg"
                        />
                        <div className="absolute top-2 right-2">
                          <Button size="sm" variant="secondary" className="bg-black/50 text-white hover:bg-black/70">
                            <Eye className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Thumbnail */}
              {(content as any).thumbnailUrl && (
                <div>
                  <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">Thumbnail</Label>
                  <div className="mt-2">
                    <img
                      src={getImageUrl((content as any).thumbnailUrl)}
                      alt={`${content.title} thumbnail`}
                      className="w-32 h-20 object-cover rounded-lg"
                    />
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Rejection Reason */}
          {content.rejectionReason && (
            <Card>
              <CardHeader>
                <CardTitle className="text-red-600 dark:text-red-400">Rejection Reason</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                  {content.rejectionReason}
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
                <p className="text-gray-900 dark:text-white">{getAuthorName(content)}</p>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">Email</Label>
                <p className="text-gray-900 dark:text-white">{getAuthorEmail(content)}</p>
              </div>
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
                  {new Date(content.createdAt).toLocaleDateString()} at {new Date(content.createdAt).toLocaleTimeString()}
                </p>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">Last Updated</Label>
                <p className="text-gray-900 dark:text-white">
                  {new Date(content.updatedAt).toLocaleDateString()} at {new Date(content.updatedAt).toLocaleTimeString()}
                </p>
              </div>
              {(content as any).language && (
                <div>
                  <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">Language</Label>
                  <p className="text-gray-900 dark:text-white">{(content as any).language.toUpperCase()}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Actions */}
          {content.status === 'pending' && (
            <Card>
              <CardHeader>
                <CardTitle>Actions</CardTitle>
                <CardDescription>
                  Approve or reject this content
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button
                  onClick={handleApprove}
                  disabled={actionLoading}
                  className="w-full bg-emerald-600 hover:bg-emerald-700"
                >
                  <Check className="h-4 w-4 mr-2" />
                  Approve Content
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => setRejectDialogOpen(true)}
                  disabled={actionLoading}
                  className="w-full"
                >
                  <X className="h-4 w-4 mr-2" />
                  Reject Content
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
            <DialogTitle>Reject Content</DialogTitle>
            <DialogDescription>
              Please provide a reason for rejecting this content.
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
                placeholder="e.g., Inappropriate content, copyright violation, poor quality..."
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
              Reject Content
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
