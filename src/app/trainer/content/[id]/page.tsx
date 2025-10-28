'use client'

import { useEffect, useState } from 'react'

import { useParams, useRouter, useSearchParams } from 'next/navigation'
import { apiClient, type ContentItem } from '@/lib/api-client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
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
  Eye, 
  Heart, 
  Calendar,
  Clock,
  Tag,
  Globe,
  Lock,
  Play,
  Image as ImageIcon,
  FileText,
  Check,
  Send
} from 'lucide-react'

// Helper function to get content type icon
const getContentTypeIcon = (type: string) => {
  switch (type) {
    case 'video':
      return <Play className="h-3 w-3" />
    case 'image':
      return <ImageIcon className="h-3 w-3" />
    case 'document':
      return <FileText className="h-3 w-3" />
    default:
      return <FileText className="h-3 w-3" />
  }
}

export default function ContentDetailPage() {
  const params = useParams()
  const router = useRouter()
  const searchParams = useSearchParams()
  const { user, isLoading } = useAuth()
  const [content, setContent] = useState<ContentItem | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [editForm, setEditForm] = useState<Partial<ContentItem>>({})
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [showApproveDialog, setShowApproveDialog] = useState(false)
  const [showEditWarningDialog, setShowEditWarningDialog] = useState(false)
  const [showSubmitDialog, setShowSubmitDialog] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [showWithdrawDialog, setShowWithdrawDialog] = useState(false)
  const [withdrawing, setWithdrawing] = useState(false)

  const contentId = params.id as string

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
        router.push('/admin/dashboard')
        return
      }
    }
  }, [user, isLoading, router])

  useEffect(() => {
    if (contentId) {
      loadContent()
    }
  }, [contentId])

  async function loadContent() {
    try {
      setLoading(true)
      const res = await apiClient.getTrainerContentById(parseInt(contentId))
      if (res.success && res.data) {
        setContent(res.data.content)
        setEditForm(res.data.content)
        setError(null)
      } else {
        setError(res.error?.message || 'Failed to load content')
      }
    } catch (err) {
      setError('Failed to load content')
    } finally {
      setLoading(false)
    }
  }

  async function saveContent() {
    if (!content) return
    
    // If content is approved, show warning dialog
    if (content.status === 'approved') {
      setShowEditWarningDialog(true)
      return
    }
    
    await performSave()
  }

  async function performSave() {
    if (!content) return
    
    try {
      setSaving(true)
      const res = await apiClient.updateTrainerContent(content.id, editForm)
      if (res.success && res.data) {
        setContent(res.data.content)
        setIsEditing(false)
        setError(null)
        setShowEditWarningDialog(false)
      } else {
        setError(res.error?.message || 'Failed to save content')
      }
    } catch (err) {
      setError('Failed to save content')
    } finally {
      setSaving(false)
    }
  }

  async function deleteContent() {
    if (!content) return
    
    try {
      const res = await apiClient.deleteTrainerContent(content.id)
      if (res.success) {
        router.push('/trainer/content')
      } else {
        setError(res.error?.message || 'Failed to delete content')
      }
    } catch (err) {
      setError('Failed to delete content')
    }
  }

  async function approveContent() {
    if (!content) return
    
    try {
      setSaving(true)
      // Note: This would need to be implemented in the API client
      // For now, we'll just update the local state to show the approval
      setContent({ ...content, status: 'approved' })
      setShowApproveDialog(false)
    } catch (err) {
      setError('Failed to approve content')
    } finally {
      setSaving(false)
    }
  }

  const handleSubmit = async () => {
    if (!content) return
    
    setSubmitting(true)
    try {
      const res = await apiClient.submitTrainerContentForApproval(content.id)
      if (res.success) {
        // Reload the content to show updated status
        await loadContent()
        setShowSubmitDialog(false)
      } else {
        setError(res.error?.message || 'Failed to submit content for approval')
      }
    } catch (err) {
      setError('Failed to submit content for approval')
    } finally {
      setSubmitting(false)
    }
  }

  const handleWithdraw = async () => {
    if (!content) return
    
    setWithdrawing(true)
    try {
      const res = await apiClient.withdrawContentSubmission(content.id)
      if (res.success) {
        // Reload the content to show updated status
        await loadContent()
        setShowWithdrawDialog(false)
      } else {
        setError(res.error?.message || 'Failed to withdraw content submission')
      }
    } catch (err) {
      setError('Failed to withdraw content submission')
    } finally {
      setWithdrawing(false)
    }
  }

  function getTypeIcon(type: string) {
    switch (type) {
      case 'video': return <Play className="h-4 w-4" />
      case 'image': return <ImageIcon className="h-4 w-4" />
      case 'document': return <FileText className="h-4 w-4" />
      default: return <FileText className="h-4 w-4" />
    }
  }

  function formatDuration(seconds: number) {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
  }

  function getFullUrl(relativeUrl: string) {
    if (!relativeUrl) return ''
    if (relativeUrl.startsWith('http')) return relativeUrl
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'
    return `${baseUrl}${relativeUrl}`
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.push('/trainer/content')}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="h-8 w-64 bg-gray-200 rounded animate-pulse" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardContent className="p-6">
                <div className="h-64 bg-gray-200 rounded animate-pulse" />
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div className="h-4 w-32 bg-gray-200 rounded animate-pulse" />
                  <div className="h-4 w-full bg-gray-200 rounded animate-pulse" />
                  <div className="h-4 w-3/4 bg-gray-200 rounded animate-pulse" />
                </div>
              </CardContent>
            </Card>
          </div>
          <div className="space-y-6">
            <Card>
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div className="h-4 w-24 bg-gray-200 rounded animate-pulse" />
                  <div className="h-8 w-full bg-gray-200 rounded animate-pulse" />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    )
  }

  if (error || !content) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.push('/trainer/content')}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Content Not Found</h1>
        </div>
        <Card>
          <CardContent className="p-6 text-center">
            <p className="text-red-600">{error || 'Content not found'}</p>
            <Button className="mt-4" onClick={() => router.push('/trainer/content')}>
              Back to Content Library
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.push('/trainer/content')}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              {isEditing ? 'Edit Content' : content.title}
            </h1>
            <div className="flex items-center gap-3 mt-3">
              <div className="flex items-center gap-2">
                {getTypeIcon(content.type)}
                <Badge 
                  variant="outline" 
                  className={`capitalize flex items-center gap-1 ${
                    content.type === 'video' ? 'border-purple-200 bg-purple-50 text-purple-700 dark:border-purple-800 dark:bg-purple-950/20 dark:text-purple-400' :
                    content.type === 'image' ? 'border-orange-200 bg-orange-50 text-orange-700 dark:border-orange-800 dark:bg-orange-950/20 dark:text-orange-400' :
                    content.type === 'document' ? 'border-teal-200 bg-teal-50 text-teal-700 dark:border-teal-800 dark:bg-teal-950/20 dark:text-teal-400' :
                    'border-gray-200 bg-gray-50 text-gray-700 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300'
                  }`}
                >
                  {getContentTypeIcon(content.type)}
                  {content.type.replace('_', ' ')}
                </Badge>
              </div>
              <Badge 
                className={
                  content.status === 'approved' ? 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800' :
                  content.status === 'pending' ? 'bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-400 dark:border-yellow-800' :
                  content.status === 'draft' ? 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700' :
                  'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800'
                }
              >
                {content.status}
              </Badge>
              <Badge 
                className={
                  content.isPublic ? 
                  'bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-800' :
                  'bg-slate-100 text-slate-800 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700'
                }
              >
                {content.isPublic ? 'Public' : 'Private'}
              </Badge>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          {isEditing ? (
            <>
              <Button variant="outline" onClick={() => setIsEditing(false)}>
                <X className="h-4 w-4 mr-2" />
                Cancel
              </Button>
              <Button onClick={saveContent} disabled={saving}>
                <Save className="h-4 w-4 mr-2" />
                {saving ? 'Saving...' : 'Save'}
              </Button>
            </>
          ) : (
            <>
              {/* Submit for Approval (only for draft and rejected) */}
              {(content.status === 'draft' || content.status === 'rejected') && (
                <Button onClick={() => setShowSubmitDialog(true)} className="bg-black hover:bg-gray-800">
                  <Send className="h-4 w-4 mr-2" />
                  Submit for Approval
                </Button>
              )}
              
              {/* Withdraw (only for pending) */}
              {content.status === 'pending' && (
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
              {(content.status === 'draft' || content.status === 'rejected') && (
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
            <p className="text-red-600 text-sm">{error}</p>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Media Preview */}
          <Card className="border-2 border-gray-100 dark:border-gray-800 shadow-lg">
            <CardHeader className="border-b border-gray-100 dark:border-gray-800">
              <CardTitle className="flex items-center gap-2 text-lg">
                {getTypeIcon(content.type)}
                <span>Content Preview</span>
                <Badge 
                  variant="outline" 
                  className={`ml-auto flex items-center gap-1 ${
                    content.type === 'video' ? 'border-red-200 bg-red-50 text-red-700 dark:border-red-800 dark:bg-red-950/20 dark:text-red-400' :
                    content.type === 'image' ? 'border-green-200 bg-green-50 text-green-700 dark:border-green-800 dark:bg-green-950/20 dark:text-green-400' :
                    content.type === 'document' ? 'border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-800 dark:bg-blue-950/20 dark:text-blue-400' :
                    'border-gray-200 bg-gray-50 text-gray-700 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300'
                  }`}
                >
                  {getContentTypeIcon(content.type)}
                  {content.type.replace('_', ' ')}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              {content.type === 'video' && content.fileUrl ? (
                <div className="relative">
                  <video 
                    controls 
                    className="w-full rounded-lg"
                    poster={getFullUrl(content.thumbnailUrl || '')}
                  >
                    <source src={getFullUrl(content.fileUrl)} type="video/mp4" />
                    Your browser does not support the video tag.
                  </video>
                </div>
              ) : content.type === 'image' && content.fileUrl ? (
                <img 
                  src={getFullUrl(content.fileUrl)} 
                  alt={content.title}
                  className="w-full rounded-lg"
                />
              ) : content.type === 'document' && content.fileUrl ? (
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                  <FileText className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                  <p className="text-gray-600 mb-4">Document Preview</p>
                  <Button asChild>
                    <a href={getFullUrl(content.fileUrl)} target="_blank" rel="noopener noreferrer">
                      View Document
                    </a>
                  </Button>
                </div>
              ) : (
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                  <FileText className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                  <p className="text-gray-600">No preview available</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Content Details */}
          <Card>
            <CardHeader>
              <CardTitle>Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {isEditing ? (
                <>
                  <div className="space-y-2">
                    <Label>Title</Label>
                    <Input
                      value={editForm.title || ''}
                      onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Description</Label>
                    <textarea
                      className="flex min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                      value={editForm.description || ''}
                      onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Difficulty</Label>
                      <Select value={editForm.difficulty} onValueChange={(v) => setEditForm({ ...editForm, difficulty: v as any })}>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select difficulty" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="beginner">Beginner</SelectItem>
                          <SelectItem value="intermediate">Intermediate</SelectItem>
                          <SelectItem value="advanced">Advanced</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Category</Label>
                      <Select value={editForm.category} onValueChange={(v) => setEditForm({ ...editForm, category: v as any })}>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="cardio">Cardio</SelectItem>
                          <SelectItem value="strength">Strength</SelectItem>
                          <SelectItem value="yoga">Yoga</SelectItem>
                          <SelectItem value="nutrition">Nutrition</SelectItem>
                          <SelectItem value="wellness">Wellness</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Tags (comma separated)</Label>
                    <Input
                      value={(editForm.tags as string[] | undefined)?.join(', ') || ''}
                      onChange={(e) => setEditForm({ 
                        ...editForm, 
                        tags: e.target.value.split(',').map(t => t.trim()).filter(Boolean) 
                      })}
                    />
                  </div>
                </>
              ) : (
                <>
                  <div className="space-y-4">
                    <div className="p-4 bg-gradient-to-r from-gray-50 to-blue-50 dark:from-gray-800 dark:to-blue-950/20 rounded-lg border border-gray-200 dark:border-gray-700">
                      <h3 className="font-bold text-xl mb-3 text-gray-900 dark:text-white">{content.title}</h3>
                      {content.description && (
                        <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap leading-relaxed">{content.description}</p>
                      )}
                    </div>
                    
                    {/* Quick Stats */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="text-center p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-800">
                        <Eye className="h-5 w-5 mx-auto text-blue-600 dark:text-blue-400 mb-1" />
                        <div className="text-lg font-bold text-blue-700 dark:text-blue-300">{content.views || 0}</div>
                        <div className="text-xs text-blue-600 dark:text-blue-400">Views</div>
                      </div>
                      <div className="text-center p-3 bg-red-50 dark:bg-red-950/20 rounded-lg border border-red-200 dark:border-red-800">
                        <Heart className="h-5 w-5 mx-auto text-red-600 dark:text-red-400 mb-1" />
                        <div className="text-lg font-bold text-red-700 dark:text-red-300">{content.likes || 0}</div>
                        <div className="text-xs text-red-600 dark:text-red-400">Likes</div>
                      </div>
                      <div className="text-center p-3 bg-green-50 dark:bg-green-950/20 rounded-lg border border-green-200 dark:border-green-800">
                        <Calendar className="h-5 w-5 mx-auto text-green-600 dark:text-green-400 mb-1" />
                        <div className="text-sm font-bold text-green-700 dark:text-green-300">
                          {new Date(content.createdAt).toLocaleDateString()}
                        </div>
                        <div className="text-xs text-green-600 dark:text-green-400">Created</div>
                      </div>
                      {content.duration && (
                        <div className="text-center p-3 bg-purple-50 dark:bg-purple-950/20 rounded-lg border border-purple-200 dark:border-purple-800">
                          <Clock className="h-5 w-5 mx-auto text-purple-600 dark:text-purple-400 mb-1" />
                          <div className="text-lg font-bold text-purple-700 dark:text-purple-300">
                            {Math.floor(content.duration / 60)}:{(content.duration % 60).toString().padStart(2, '0')}
                          </div>
                          <div className="text-xs text-purple-600 dark:text-purple-400">Duration</div>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <Tag className="h-4 w-4 text-gray-400" />
                      <span className="font-medium">Difficulty:</span>
                      <Badge 
                        className={
                          content.difficulty === 'beginner' ? 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800' :
                          content.difficulty === 'intermediate' ? 'bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-800' :
                          'bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-900/20 dark:text-purple-400 dark:border-purple-800'
                        }
                      >
                        {content.difficulty}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2">
                      <Tag className="h-4 w-4 text-gray-400" />
                      <span className="font-medium">Category:</span>
                      <Badge variant="outline" className="capitalize">{content.category}</Badge>
                    </div>
                    {content.duration && (
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-gray-400" />
                        <span className="font-medium">Duration:</span>
                        <span>{formatDuration(content.duration)}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-gray-400" />
                      <span className="font-medium">Created:</span>
                      <span>{new Date(content.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>

                  {(content.tags as string[])?.length > 0 && (
                    <div>
                      <h4 className="font-medium mb-2">Tags</h4>
                      <div className="flex flex-wrap gap-2">
                        {(content.tags as string[]).map((tag, index) => (
                          <Badge key={index} variant="secondary">{tag}</Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Performance */}
          <Card className="border-2 border-gray-100 dark:border-gray-800 shadow-lg">
            <CardHeader className="border-b border-gray-100 dark:border-gray-800">
              <CardTitle className="flex items-center gap-2 text-lg">
                <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                  <Eye className="h-5 w-5 text-green-600 dark:text-green-400" />
                </div>
                Performance Metrics
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <div className="flex items-center justify-between p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-800">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                    <Eye className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  </div>
                  <span className="font-medium text-gray-700 dark:text-gray-300">Total Views</span>
                </div>
                <span className="text-2xl font-bold text-blue-700 dark:text-blue-300">{content.views || 0}</span>
              </div>
              <div className="flex items-center justify-between p-4 bg-red-50 dark:bg-red-950/20 rounded-lg border border-red-200 dark:border-red-800">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-lg">
                    <Heart className="h-4 w-4 text-red-600 dark:text-red-400" />
                  </div>
                  <span className="font-medium text-gray-700 dark:text-gray-300">Total Likes</span>
                </div>
                <span className="text-2xl font-bold text-red-700 dark:text-red-300">{content.likes || 0}</span>
              </div>
            </CardContent>
          </Card>

          {/* Settings */}
          <Card className="border-2 border-gray-100 dark:border-gray-800 shadow-lg">
            <CardHeader className="border-b border-gray-100 dark:border-gray-800">
              <CardTitle className="flex items-center gap-2 text-lg">
                <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                  <Tag className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                </div>
                Content Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {isEditing ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {editForm.isPublic ? <Globe className="h-4 w-4" /> : <Lock className="h-4 w-4" />}
                      <span className="text-sm">Public</span>
                    </div>
                    <Switch
                      checked={!!editForm.isPublic}
                      onCheckedChange={(checked) => setEditForm({ ...editForm, isPublic: checked })}
                    />
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {content.isPublic ? <Globe className="h-4 w-4" /> : <Lock className="h-4 w-4" />}
                      <span className="text-sm">Visibility</span>
                    </div>
                    <Badge variant={content.isPublic ? 'default' : 'secondary'}>
                      {content.isPublic ? 'Public' : 'Private'}
                    </Badge>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* File Info */}
          <Card className="border-2 border-gray-100 dark:border-gray-800 shadow-lg">
            <CardHeader className="border-b border-gray-100 dark:border-gray-800">
              <CardTitle className="flex items-center gap-2 text-lg">
                <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg">
                  <FileText className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                </div>
                File Information
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-2 mb-3">
                  <Tag className="h-4 w-4 text-indigo-500" />
                  <span className="font-medium text-gray-700 dark:text-gray-300">Content Type</span>
                </div>
                <Badge 
                  variant="outline" 
                  className={`capitalize flex items-center gap-1 ${
                    content.type === 'video' ? 'border-purple-200 bg-purple-50 text-purple-700 dark:border-purple-800 dark:bg-purple-950/20 dark:text-purple-400' :
                    content.type === 'image' ? 'border-orange-200 bg-orange-50 text-orange-700 dark:border-orange-800 dark:bg-orange-950/20 dark:text-orange-400' :
                    content.type === 'document' ? 'border-teal-200 bg-teal-50 text-teal-700 dark:border-teal-800 dark:bg-teal-950/20 dark:text-teal-400' :
                    'border-gray-200 bg-gray-50 text-gray-700 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300'
                  }`}
                >
                  {getContentTypeIcon(content.type)}
                  {content.type.replace('_', ' ')}
                </Badge>
              </div>
              
              {(content.fileUrl || content.thumbnailUrl) && (
                <div className="space-y-3">
                  <h4 className="font-medium text-gray-700 dark:text-gray-300">File Links</h4>
                  <div className="space-y-2">
                    {content.fileUrl && (
                      <Button variant="outline" size="sm" asChild className="w-full justify-start">
                        <a href={getFullUrl(content.fileUrl)} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2">
                          <FileText className="h-4 w-4" />
                          View Main File
                        </a>
                      </Button>
                    )}
                    {content.thumbnailUrl && (
                      <Button variant="outline" size="sm" asChild className="w-full justify-start">
                        <a href={getFullUrl(content.thumbnailUrl)} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2">
                          <ImageIcon className="h-4 w-4" />
                          View Thumbnail
                        </a>
                      </Button>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Approve Confirmation Dialog */}
      <Dialog open={showApproveDialog} onOpenChange={setShowApproveDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Approve Content</DialogTitle>
            <DialogDescription>
              Are you sure you want to approve "{content?.title}"? This will make the content available to users.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowApproveDialog(false)}>
              Cancel
            </Button>
            <Button 
              onClick={approveContent}
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
            <DialogTitle>Delete Content</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "{content?.title}"? This action cannot be undone and will permanently remove the content and all associated files.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
              Cancel
            </Button>
            <Button 
              onClick={deleteContent}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
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
              Are you sure you want to submit "{content?.title}" for approval? This will send it to the admin for review.
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
              Are you sure you want to withdraw "{content?.title}" from review? You'll be able to make edits and resubmit it later.
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
            <DialogTitle>Edit Approved Content</DialogTitle>
            <DialogDescription>
              This content is approved. Editing it will change the status to draft and require re-approval. Are you sure you want to continue?
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
