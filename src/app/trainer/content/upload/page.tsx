'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { apiClient, type ContentItem, type Language as LanguageType } from '@/lib/api-client'
import { uploadContentFile, uploadThumbnail, validateFileSize, validateContentFileType, FILE_SIZE_LIMITS, ALLOWED_FILE_TYPES, formatFileSize } from '@/lib/upload-utils'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useAuth } from '@/contexts/auth-context'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Upload, Image as ImageIcon, File as FileIcon, X } from 'lucide-react'

export default function UploadContentPage() {
  const router = useRouter()
  const { user } = useAuth()
  const [form, setForm] = useState<Partial<ContentItem>>({
    title: '',
    description: '',
    type: undefined as any,
    difficulty: 'beginner',
    category: 'cardio',
    language: 'en',
    isPublic: true,
    tags: [],
  })
  const [file, setFile] = useState<File | null>(null)
  const [thumbnail, setThumbnail] = useState<File | null>(null)
  const [generatedThumbBlob, setGeneratedThumbBlob] = useState<Blob | null>(null)
  const [generatedThumbUrl, setGeneratedThumbUrl] = useState<string | null>(null)
  const thumbInputRef = useRef<HTMLInputElement | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isDraggingMain, setIsDraggingMain] = useState(false)
  const [isDraggingThumb, setIsDraggingThumb] = useState(false)
  const [languages, setLanguages] = useState<LanguageType[] | null>(null)
  const [langError, setLangError] = useState<string | null>(null)
  const selectedType = form.type

  function getAcceptForType(type: string | undefined) {
    if (type === 'video') return 'video/mp4'
    if (type === 'image') return 'image/*'
    if (type === 'document') return 'application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    return ''
  }

  function isFileAllowedForType(file: File, type: string | undefined) {
    if (!type) return false
    const mime = file.type
    if (type === 'video') {
      // Prefer strict MIME; fall back to extension check if needed
      if (mime === 'video/mp4') return true
      const name = file.name?.toLowerCase() || ''
      return name.endsWith('.mp4')
    }
    if (type === 'image') return mime.startsWith('image/')
    if (type === 'document') return mime === 'application/pdf' || mime === 'application/msword' || mime === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    return false
  }

  async function extractVideoDurationSeconds(file: File): Promise<number> {
    return new Promise((resolve, reject) => {
      const url = URL.createObjectURL(file)
      const video = document.createElement('video')
      video.preload = 'metadata'
      video.onloadedmetadata = () => {
        const seconds = Math.round(video.duration || 0)
        URL.revokeObjectURL(url)
        resolve(Number.isFinite(seconds) ? seconds : 0)
      }
      video.onerror = () => {
        URL.revokeObjectURL(url)
        reject(new Error('Failed to read video metadata'))
      }
      video.src = url
    })
  }

  async function generateVideoThumbnail(file: File, seekSeconds = 2) {
    try {
      const url = URL.createObjectURL(file)
      const video = document.createElement('video')
      video.preload = 'metadata'
      video.src = url
      await new Promise<void>((resolve, reject) => {
        video.onloadedmetadata = () => {
          const target = Math.min(seekSeconds, Math.max(0, (video.duration || 0) / 2))
          // Some browsers require a slight timeout before seeking
          setTimeout(() => { video.currentTime = target }, 50)
        }
        video.onseeked = () => resolve()
        video.onerror = () => reject(new Error('Video load error'))
      })
      const canvas = document.createElement('canvas')
      canvas.width = video.videoWidth
      canvas.height = video.videoHeight
      const ctx = canvas.getContext('2d')!
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height)
      URL.revokeObjectURL(url)
      const blob: Blob = await new Promise((resolve) => canvas.toBlob(b => resolve(b as Blob), 'image/jpeg', 0.85)!)
      const previewUrl = URL.createObjectURL(blob)
      // Clean previous
      if (generatedThumbUrl) URL.revokeObjectURL(generatedThumbUrl)
      setGeneratedThumbBlob(blob)
      setGeneratedThumbUrl(previewUrl)
    } catch (e) {
      // Ignore failures, keep manual path
    }
  }

  // Load languages from backend
  useEffect(() => {
    let mounted = true
    async function loadLanguages() {
      const res = await apiClient.getLanguages()
      if (!mounted) return
      if (res.success && Array.isArray(res.data)) {
        setLanguages(res.data)
        setLangError(null)
        if (!form.language && res.data.length > 0) {
          setForm(prev => ({ ...prev, language: (res.data as LanguageType[])[0].code }))
        }
      } else {
        setLangError(res.error?.message || 'Failed to load languages')
      }
    }
    loadLanguages()
    return () => { mounted = false }
  }, [])

  useEffect(() => {
  }, [])

  async function uploadFileToServer(selected: File, isThumbnail = false): Promise<string> {
    // Validate file size
    const maxSize = isThumbnail ? FILE_SIZE_LIMITS.THUMBNAIL : FILE_SIZE_LIMITS.CONTENT_FILE
    const sizeValidation = validateFileSize(selected, maxSize)
    if (!sizeValidation.valid) {
      throw new Error(sizeValidation.error!)
    }

    // Validate file type for content files
    if (!isThumbnail && selectedType) {
      const typeValidation = validateContentFileType(selected, selectedType)
      if (!typeValidation.valid) {
        throw new Error(typeValidation.error!)
      }
    }

    // Use the appropriate upload function
    const result = isThumbnail ? await uploadThumbnail(selected) : await uploadContentFile(selected)
    
    if (!result.success) {
      throw new Error(result.error?.message || 'Upload failed')
    }
    
    return result.data.url as string
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    setError(null)
    
    let uploadedFileUrl: string | undefined
    let uploadedThumbnailUrl: string | undefined
    
    try {
      // Basic validation
      if (!form.type) throw new Error('Please select a content type')
      if (!form.title) throw new Error('Title is required')
      if (!file) throw new Error('Please choose a content file to upload')

      // Step 1: Create content record first (without file URLs)
      const durationNum = form.duration ? Number(form.duration) : undefined
      const createRes = await apiClient.createTrainerContent({
        ...form,
        fileUrl: undefined, // Will be updated after upload
        thumbnailUrl: undefined, // Will be updated after upload
        duration: durationNum,
      })
      
      if (!createRes.success || !createRes.data) {
        throw new Error(createRes.error?.message || 'Failed to create content record')
      }
      
      const contentId = createRes.data.content.id
      
      // Step 2: Upload files and update the record
      try {
        // Upload main file
        if (file) {
          uploadedFileUrl = await uploadFileToServer(file)
        }
        
        // Upload thumbnail
        if (thumbnail) {
          uploadedThumbnailUrl = await uploadFileToServer(thumbnail, true)
        } else if (generatedThumbBlob) {
          const thumbnailFile = new File([generatedThumbBlob], 'thumbnail.jpg', { type: 'image/jpeg' })
          uploadedThumbnailUrl = await uploadFileToServer(thumbnailFile, true)
        }
        
        // Step 3: Update content record with file URLs
        const updateRes = await apiClient.updateTrainerContent(contentId, {
          fileUrl: uploadedFileUrl,
          thumbnailUrl: uploadedThumbnailUrl,
        })
        
        if (!updateRes.success) {
          throw new Error(updateRes.error?.message || 'Failed to update content with file URLs')
        }
        
        router.push('/trainer/content')
        
      } catch (uploadError) {
        // If file upload fails, delete the content record to maintain consistency
        try {
          await apiClient.deleteTrainerContent(contentId)
        } catch (deleteError) {
          console.error('Failed to clean up content record:', deleteError)
        }
        throw uploadError
      }
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Upload Content</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Add media, set details, and publish.</p>
        </div>
        <Button type="button" variant="secondary" className="cursor-pointer" onClick={() => router.push('/trainer/content')}>Back to Library</Button>
      </div>

      {/* Always show type selector at the top */}
      <Card className="">
        <CardHeader>
          <CardTitle className="text-base">Content Type</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="max-w-md space-y-2">
            <Label>Type</Label>
            <Select value={form.type} onValueChange={(v) => { 
              setFile(null); 
              setThumbnail(null); 
              setForm({ ...form, type: v as any });
            }}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Choose what you're uploading" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="video">Video</SelectItem>
                <SelectItem value="image">Image</SelectItem>
                <SelectItem value="document">Document</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-gray-500 dark:text-gray-400">Select a type to see relevant fields.</p>
          </div>
        </CardContent>
      </Card>

      {selectedType && (
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-base">Media</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div
              onDragOver={(e) => { e.preventDefault(); setIsDraggingMain(true) }}
              onDragLeave={() => setIsDraggingMain(false)}
              onDrop={(e) => {
                e.preventDefault();
                setIsDraggingMain(false);
                const f = e.dataTransfer.files?.[0]
                if (f) {
                  if (!selectedType) return
                  if (isFileAllowedForType(f, selectedType)) {
                    setFile(f)
                    if (selectedType === 'video') {
                      extractVideoDurationSeconds(f).then((s) => setForm(prev => ({ ...prev, duration: s as unknown as number }))).catch(() => {})
                      generateVideoThumbnail(f).catch(() => {})
                    }
                  }
                  else setError('Selected file type is not allowed for the chosen content type')
                }
              }}
              className={`relative rounded-lg border-2 border-dashed ${isDraggingMain ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/20' : 'border-gray-300 dark:border-gray-700'} p-6 text-center`}
            >
              {file ? (
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 text-left">
                    <FileIcon className="h-5 w-5 text-blue-600" />
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white truncate max-w-[12rem]">{file.name}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{formatFileSize(file.size)}</p>
                    </div>
                  </div>
                  <Button type="button" variant="ghost" size="icon" className="cursor-pointer" onClick={() => setFile(null)}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <div className="space-y-2">
                  <Upload className="h-8 w-8 mx-auto text-blue-600" />
                  <p className="text-sm text-gray-700 dark:text-gray-300">Drag & drop a {selectedType || 'file'} here</p>
                  <p className="text-xs text-gray-500">or</p>
                  <div>
                    <Input
                      type="file"
                      accept={getAcceptForType(selectedType)}
                      disabled={!selectedType}
                      onChange={(e) => {
                        const f = e.target.files?.[0]
                      if (!f) { setFile(null); return }
                        if (!selectedType) return
                        if (isFileAllowedForType(f, selectedType)) {
                        setFile(f)
                        if (selectedType === 'video') {
                          extractVideoDurationSeconds(f).then((s) => setForm(prev => ({ ...prev, duration: s as unknown as number }))).catch(() => {})
                            generateVideoThumbnail(f).catch(() => {})
                        }
                      }
                        else {
                          setFile(null)
                          setError('Selected file type is not allowed for the chosen content type')
                        }
                      }}
                    />
                  </div>
                </div>
              )}
            </div>

            {selectedType === 'video' && (
            <div
              onDragOver={(e) => { e.preventDefault(); setIsDraggingThumb(true) }}
              onDragLeave={() => setIsDraggingThumb(false)}
              onDrop={(e) => {
                e.preventDefault();
                setIsDraggingThumb(false);
                const f = e.dataTransfer.files?.[0]
                if (f) {
                  if (f.type.startsWith('image/')) setThumbnail(f)
                  else setError('Thumbnail must be an image file')
                }
              }}
              className={`relative rounded-lg border-2 border-dashed ${isDraggingThumb ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/20' : 'border-gray-300 dark:border-gray-700'} p-6 text-center`}
            >
              {/* Hidden input always present for Replace/Choose actions */}
              <input
                ref={thumbInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0]
                  if (!f) { setThumbnail(null); return }
                  if (f.type.startsWith('image/')) setThumbnail(f)
                  else {
                    setThumbnail(null)
                    setError('Thumbnail must be an image file')
                  }
                }}
              />
              {(generatedThumbUrl || thumbnail) ? (
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 text-left w-full">
                    <div className="w-20 h-12 overflow-hidden rounded border border-gray-200 dark:border-gray-700 bg-black/5 flex items-center justify-center">
                      <img src={thumbnail ? URL.createObjectURL(thumbnail) : (generatedThumbUrl as string)} alt="thumbnail preview" className="max-w-full max-h-full object-cover" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900 dark:text-white">Thumbnail Preview</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Auto-generated from video. Drag & drop or click Replace to change.</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button type="button" variant="secondary" className="h-8 px-2 cursor-pointer" onClick={() => thumbInputRef.current?.click()}>Replace</Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="cursor-pointer"
                        onClick={() => { setThumbnail(null); if (generatedThumbUrl) { URL.revokeObjectURL(generatedThumbUrl); } setGeneratedThumbUrl(null); setGeneratedThumbBlob(null) }}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  <ImageIcon className="h-8 w-8 mx-auto text-emerald-600" />
                  <p className="text-sm text-gray-700 dark:text-gray-300">Drag & drop a thumbnail image</p>
                  <p className="text-xs text-gray-500">or</p>
                  <Button type="button" variant="secondary" className="h-8 px-2 cursor-pointer" onClick={() => thumbInputRef.current?.click()}>
                    Choose Image
                  </Button>
                </div>
              )}
            </div>
            )}
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">Details</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && <div className="text-sm text-red-600">{error}</div>}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Title</Label>
                  <Input value={form.title || ''} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setForm({ ...form, title: e.target.value })} required />
                </div>
                <div className="space-y-2">
                  <Label>Language</Label>
                  {languages ? (
                    <Select value={form.language} onValueChange={(v) => setForm({ ...form, language: v })}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select language" />
                      </SelectTrigger>
                      <SelectContent>
                        {languages.map((lng) => (
                          <SelectItem key={lng.id} value={lng.code}>
                            {lng.name} ({lng.code})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : (
                    <div className="text-xs text-gray-500">{langError || 'Loading languages...'}</div>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label>Description</Label>
                <textarea className="flex min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm" value={form.description || ''} onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setForm({ ...form, description: e.target.value })} placeholder="" />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Difficulty</Label>
                  <Select value={form.difficulty} onValueChange={(v) => setForm({ ...form, difficulty: v as any })}>
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
                {selectedType === 'video' && (
                  <div className="space-y-2">
                    <Label>Duration (auto)</Label>
                    <Input type="number" min={0} value={form.duration ?? ''} readOnly />
                  </div>
                )}
                <div className="space-y-2">
                  <Label>Category</Label>
                  <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v as any })}>
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

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Visibility</Label>
                  <div className="flex items-center gap-3">
                    <Switch checked={!!form.isPublic} onCheckedChange={(v) => setForm({ ...form, isPublic: v })} />
                    <span className="text-sm text-gray-600 dark:text-gray-400">{form.isPublic ? 'Public' : 'Private'}</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Tags (comma separated)</Label>
                  <Input value={(form.tags as string[] | undefined)?.join(', ') || ''} onChange={(e) => setForm({ ...form, tags: e.target.value.split(',').map(t => t.trim()).filter(Boolean) })} />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3">
                <Button type="button" variant="secondary" className="cursor-pointer" onClick={() => router.push('/trainer/content')}>Cancel</Button>
                <Button type="submit" className="cursor-pointer" disabled={submitting}>{submitting ? 'Saving...' : 'Create'}</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
      )}
    </div>
  )
}


