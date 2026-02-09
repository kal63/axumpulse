'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { 
  Save,
  Loader2,
  Image as ImageIcon,
  Palette,
  Layout,
  Globe,
  Type,
  Eye,
  Trash2,
  GripVertical,
  Plus,
  X
} from 'lucide-react'
import { apiClient, TrainerSite, TrainerSiteGalleryImage, TrainerSiteContent, TrainerSiteSection } from '@/lib/api-client'
import { validateFileSize, validateImageType, FILE_SIZE_LIMITS, ALLOWED_FILE_TYPES, getImageUrl } from '@/lib/upload-utils'
import { toast } from 'sonner'
import Image from 'next/image'
import { ThemeProvider } from '@/components/trainer-site/ThemeProvider'
import { HeroSection } from '@/components/trainer-site/HeroSection'
import { PhilosophySection } from '@/components/trainer-site/PhilosophySection'
import { TargetAudienceSection } from '@/components/trainer-site/TargetAudienceSection'
import { GallerySection } from '@/components/trainer-site/GallerySection'
import { TrainerContentSection } from '@/components/trainer-site/TrainerContentSection'
import { PublicTrainerDetail } from '@/lib/api-client'

export default function CustomizeSitePage() {
  const router = useRouter()
  const [site, setSite] = useState<TrainerSite | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState('basic')
  const [previewMode, setPreviewMode] = useState(false)
  
  // Form states
  const [formData, setFormData] = useState<Partial<TrainerSite>>({})
  const [trainerDetail, setTrainerDetail] = useState<PublicTrainerDetail | null>(null)
  
  const galleryFileInputRef = useRef<HTMLInputElement>(null)
  const heroFileInputRef = useRef<HTMLInputElement>(null)

  const fetchSite = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await apiClient.getTrainerSite()
      if (response.success && response.data) {
        const siteData = response.data
        setSite(siteData)
        setFormData({
          slug: siteData.slug || '',
          headline: siteData.headline || '',
          subheadline: siteData.subheadline || '',
          bio: siteData.bio || '',
          philosophy: siteData.philosophy || '',
          targetAudience: siteData.targetAudience || '',
          heroBackgroundImage: siteData.heroBackgroundImage || '',
          galleryImages: siteData.galleryImages || [],
          theme: siteData.theme || {},
          sections: siteData.sections || [],
          trainerContent: siteData.trainerContent || [],
          socialLinks: siteData.socialLinks || {},
          ctaText: siteData.ctaText || '',
          status: siteData.status || 'published'
        })
        
        // Fetch trainer detail for preview
        const trainerResponse = await apiClient.getPublicTrainerDetail(siteData.userId)
        if (trainerResponse.success && trainerResponse.data) {
          setTrainerDetail(trainerResponse.data)
        }
      } else {
        setError(response.error?.message || 'Failed to fetch site')
      }
    } catch (err) {
      setError('An error occurred while fetching site')
      console.error('Site fetch error:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchSite()
  }, [])

  const handleInputChange = (field: keyof TrainerSite, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleThemeChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      theme: {
        ...(prev.theme || {}),
        [field]: value
      }
    }))
  }

  const handleSave = async () => {
    try {
      setSaving(true)
      const response = await apiClient.updateTrainerSite(formData)
      if (response.success && response.data) {
        setSite(response.data)
        toast.success('Site updated successfully')
        // Refresh trainer detail for preview
        if (response.data.userId) {
          const trainerResponse = await apiClient.getPublicTrainerDetail(response.data.userId)
          if (trainerResponse.success && trainerResponse.data) {
            setTrainerDetail(trainerResponse.data)
          }
        }
      } else {
        toast.error(response.error?.message || 'Failed to update site')
      }
    } catch (err) {
      toast.error('An error occurred while updating site')
      console.error('Site update error:', err)
    } finally {
      setSaving(false)
    }
  }

  const handleGalleryUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const sizeValidation = validateFileSize(file, FILE_SIZE_LIMITS.PROFILE_IMAGE)
    if (!sizeValidation.valid) {
      toast.error(sizeValidation.error!)
      return
    }

    const typeValidation = validateImageType(file, ALLOWED_FILE_TYPES.PROFILE_IMAGE)
    if (!typeValidation.valid) {
      toast.error(typeValidation.error!)
      return
    }

    try {
      setSaving(true)
      const response = await apiClient.uploadGalleryImage(file)
      if (response.success && response.data) {
        setFormData(prev => ({
          ...prev,
          galleryImages: response.data!.galleryImages
        }))
        toast.success('Gallery image uploaded successfully')
      } else {
        toast.error(response.error?.message || 'Failed to upload image')
      }
    } catch (err) {
      toast.error('An error occurred while uploading image')
      console.error('Image upload error:', err)
    } finally {
      setSaving(false)
      if (galleryFileInputRef.current) {
        galleryFileInputRef.current.value = ''
      }
    }
  }

  const handleHeroUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const sizeValidation = validateFileSize(file, FILE_SIZE_LIMITS.PROFILE_IMAGE)
    if (!sizeValidation.valid) {
      toast.error(sizeValidation.error!)
      return
    }

    const typeValidation = validateImageType(file, ALLOWED_FILE_TYPES.PROFILE_IMAGE)
    if (!typeValidation.valid) {
      toast.error(typeValidation.error!)
      return
    }

    try {
      setSaving(true)
      const response = await apiClient.uploadHeroBackground(file)
      if (response.success && response.data) {
        setFormData(prev => ({
          ...prev,
          heroBackgroundImage: response.data!.heroBackgroundImage
        }))
        toast.success('Hero background uploaded successfully')
      } else {
        toast.error(response.error?.message || 'Failed to upload image')
      }
    } catch (err) {
      toast.error('An error occurred while uploading image')
      console.error('Image upload error:', err)
    } finally {
      setSaving(false)
      if (heroFileInputRef.current) {
        heroFileInputRef.current.value = ''
      }
    }
  }

  const handleDeleteGalleryImage = async (imageId: string) => {
    try {
      setSaving(true)
      const response = await apiClient.deleteGalleryImage(imageId)
      if (response.success && response.data) {
        setFormData(prev => ({
          ...prev,
          galleryImages: response.data!.galleryImages
        }))
        toast.success('Image deleted successfully')
      } else {
        toast.error(response.error?.message || 'Failed to delete image')
      }
    } catch (err) {
      toast.error('An error occurred while deleting image')
      console.error('Image delete error:', err)
    } finally {
      setSaving(false)
    }
  }

  const handleAddTrainerContent = () => {
    const newContent: TrainerSiteContent = {
      id: Date.now().toString(),
      title: '',
      description: '',
      url: '',
      type: 'article',
      order: (formData.trainerContent || []).length
    }
    setFormData(prev => ({
      ...prev,
      trainerContent: [...(prev.trainerContent || []), newContent]
    }))
  }

  const handleUpdateTrainerContent = (id: string, field: keyof TrainerSiteContent, value: any) => {
    setFormData(prev => ({
      ...prev,
      trainerContent: (prev.trainerContent || []).map(item =>
        item.id === id ? { ...item, [field]: value } : item
      )
    }))
  }

  const handleDeleteTrainerContent = async (id: string) => {
    try {
      setSaving(true)
      const response = await apiClient.deleteTrainerSiteContent(id)
      if (response.success && response.data) {
        setFormData(prev => ({
          ...prev,
          trainerContent: response.data!.trainerContent
        }))
        toast.success('Content deleted successfully')
      } else {
        toast.error(response.error?.message || 'Failed to delete content')
      }
    } catch (err) {
      toast.error('An error occurred while deleting content')
      console.error('Content delete error:', err)
    } finally {
      setSaving(false)
    }
  }

  const handleToggleSection = (type: string) => {
    const sections = formData.sections || []
    const existingIndex = sections.findIndex(s => s.type === type)
    
    if (existingIndex >= 0) {
      // Toggle enabled
      const updated = [...sections]
      updated[existingIndex] = { ...updated[existingIndex], enabled: !updated[existingIndex].enabled }
      setFormData(prev => ({ ...prev, sections: updated }))
    } else {
      // Add new section
      const newSection: TrainerSiteSection = {
        type,
        enabled: true,
        order: sections.length
      }
      setFormData(prev => ({ ...prev, sections: [...sections, newSection] }))
    }
  }

  const handleSectionOrder = (type: string, direction: 'up' | 'down') => {
    const sections = [...(formData.sections || [])]
    const index = sections.findIndex(s => s.type === type)
    if (index === -1) return

    const newIndex = direction === 'up' ? index - 1 : index + 1
    if (newIndex < 0 || newIndex >= sections.length) return

    const temp = sections[index].order
    sections[index].order = sections[newIndex].order
    sections[newIndex].order = temp

    setFormData(prev => ({ ...prev, sections }))
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[80vh]">
        <Loader2 className="w-8 h-8 text-blue-400 animate-spin" />
      </div>
    )
  }

  if (error || !site) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Customize Your Site</h1>
          <p className="text-muted-foreground">Manage your trainer portfolio site</p>
        </div>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-destructive mb-4">{error || 'Site not found'}</p>
              <Button onClick={fetchSite}>Try Again</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Create preview trainer detail
  const previewTrainer: PublicTrainerDetail | null = trainerDetail ? {
    ...trainerDetail,
    site: {
      ...formData,
      galleryImages: formData.galleryImages || [],
      theme: formData.theme || {},
      sections: formData.sections || [],
      trainerContent: formData.trainerContent || [],
      socialLinks: formData.socialLinks || {}
    } as any
  } : null

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Customize Your Site</h1>
          <p className="text-muted-foreground">Manage your trainer portfolio site</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => setPreviewMode(!previewMode)}
          >
            <Eye className="w-4 h-4 mr-2" />
            {previewMode ? 'Edit' : 'Preview'}
          </Button>
          <Button onClick={handleSave} disabled={saving}>
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

      {previewMode && previewTrainer ? (
        <div className="border rounded-lg overflow-hidden">
          <ThemeProvider theme={formData.theme || {}}>
            <HeroSection trainer={previewTrainer} />
            {(formData.sections || []).filter(s => s.enabled).map(section => {
              switch (section.type) {
                case 'philosophy':
                  return <PhilosophySection key={section.type} trainer={previewTrainer} />
                case 'target-audience':
                  return <TargetAudienceSection key={section.type} trainer={previewTrainer} />
                case 'gallery':
                  return <GallerySection key={section.type} trainer={previewTrainer} />
                case 'trainer-content':
                  return <TrainerContentSection key={section.type} trainer={previewTrainer} />
                default:
                  return null
              }
            })}
          </ThemeProvider>
        </div>
      ) : (
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="basic">Basic Info</TabsTrigger>
            <TabsTrigger value="hero">Hero</TabsTrigger>
            <TabsTrigger value="content">Content</TabsTrigger>
            <TabsTrigger value="gallery">Gallery</TabsTrigger>
            <TabsTrigger value="theme">Theme</TabsTrigger>
            <TabsTrigger value="sections">Sections</TabsTrigger>
          </TabsList>

          {/* Basic Info Tab */}
          <TabsContent value="basic" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Basic Information</CardTitle>
                <CardDescription>
                  Set up your site's core identity
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="slug">Slug (Optional)</Label>
                  <Input
                    id="slug"
                    value={formData.slug || ''}
                    onChange={(e) => handleInputChange('slug', e.target.value)}
                    placeholder="your-custom-slug"
                  />
                  <p className="text-xs text-muted-foreground">
                    Custom URL slug (e.g., "john-fitness"). Leave empty to use default.
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="headline">Headline</Label>
                  <Input
                    id="headline"
                    value={formData.headline || ''}
                    onChange={(e) => handleInputChange('headline', e.target.value)}
                    placeholder="Strong one-sentence hero text"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="subheadline">Subheadline</Label>
                  <Input
                    id="subheadline"
                    value={formData.subheadline || ''}
                    onChange={(e) => handleInputChange('subheadline', e.target.value)}
                    placeholder="Clarifies scope/niche"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bio">Bio</Label>
                  <Textarea
                    id="bio"
                    value={formData.bio || ''}
                    onChange={(e) => handleInputChange('bio', e.target.value)}
                    placeholder="Professional bio"
                    rows={4}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <Select
                    value={formData.status || 'published'}
                    onValueChange={(value) => handleInputChange('status', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="draft">Draft</SelectItem>
                      <SelectItem value="published">Published</SelectItem>
                      <SelectItem value="archived">Archived</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Hero Tab */}
          <TabsContent value="hero" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Hero Section</CardTitle>
                <CardDescription>
                  Customize your hero section background and CTA
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Hero Background Image</Label>
                  {formData.heroBackgroundImage && (
                    <div className="relative w-full h-48 mb-4 rounded-lg overflow-hidden">
                      <Image
                        src={getImageUrl(formData.heroBackgroundImage) || formData.heroBackgroundImage}
                        alt="Hero background"
                        fill
                        className="object-cover"
                        unoptimized
                      />
                      <Button
                        variant="destructive"
                        size="sm"
                        className="absolute top-2 right-2"
                        onClick={() => handleInputChange('heroBackgroundImage', '')}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  )}
                  <Button
                    variant="outline"
                    onClick={() => heroFileInputRef.current?.click()}
                    disabled={saving}
                  >
                    <ImageIcon className="h-4 w-4 mr-2" />
                    {formData.heroBackgroundImage ? 'Change Image' : 'Upload Image'}
                  </Button>
                  <input
                    ref={heroFileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleHeroUpload}
                    className="hidden"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="ctaText">CTA Button Text</Label>
                  <Input
                    id="ctaText"
                    value={formData.ctaText || ''}
                    onChange={(e) => handleInputChange('ctaText', e.target.value)}
                    placeholder="Subscribe to This Trainer"
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Content Tab */}
          <TabsContent value="content" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Content Sections</CardTitle>
                <CardDescription>
                  Add your training philosophy, target audience, and trainer-authored content
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="philosophy">Training Philosophy</Label>
                  <Textarea
                    id="philosophy"
                    value={formData.philosophy || ''}
                    onChange={(e) => handleInputChange('philosophy', e.target.value)}
                    placeholder="How do you think about training?"
                    rows={6}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="targetAudience">Target Audience</Label>
                  <Textarea
                    id="targetAudience"
                    value={formData.targetAudience || ''}
                    onChange={(e) => handleInputChange('targetAudience', e.target.value)}
                    placeholder="Who you work with / not for"
                    rows={6}
                  />
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label>Trainer Content</Label>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleAddTrainerContent}
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Add Content
                    </Button>
                  </div>
                  {(formData.trainerContent || []).map((content) => (
                    <Card key={content.id} className="bg-slate-50 dark:bg-slate-900">
                      <CardContent className="p-4 space-y-3">
                        <div className="grid grid-cols-2 gap-3">
                          <div className="space-y-2">
                            <Label>Title</Label>
                            <Input
                              value={content.title}
                              onChange={(e) => handleUpdateTrainerContent(content.id, 'title', e.target.value)}
                              placeholder="Content title"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Type</Label>
                            <Select
                              value={content.type}
                              onValueChange={(value) => handleUpdateTrainerContent(content.id, 'type', value)}
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="article">Article</SelectItem>
                                <SelectItem value="video">Video</SelectItem>
                                <SelectItem value="post">Post</SelectItem>
                                <SelectItem value="reel">Reel</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label>Description</Label>
                          <Textarea
                            value={content.description || ''}
                            onChange={(e) => handleUpdateTrainerContent(content.id, 'description', e.target.value)}
                            placeholder="Content description"
                            rows={2}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>URL</Label>
                          <Input
                            value={content.url}
                            onChange={(e) => handleUpdateTrainerContent(content.id, 'url', e.target.value)}
                            placeholder="https://..."
                          />
                        </div>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDeleteTrainerContent(content.id)}
                          disabled={saving}
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Delete
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Gallery Tab */}
          <TabsContent value="gallery" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Gallery</CardTitle>
                <CardDescription>
                  Upload and manage gallery images
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button
                  variant="outline"
                  onClick={() => galleryFileInputRef.current?.click()}
                  disabled={saving}
                >
                  <ImageIcon className="h-4 w-4 mr-2" />
                  Upload Image
                </Button>
                <input
                  ref={galleryFileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleGalleryUpload}
                  className="hidden"
                />

                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {(formData.galleryImages || []).map((image) => (
                    <div key={image.id} className="relative group">
                      <div className="relative aspect-square rounded-lg overflow-hidden">
                        <Image
                          src={getImageUrl(image.url) || image.url}
                          alt={image.caption || 'Gallery image'}
                          fill
                          className="object-cover"
                          unoptimized
                        />
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleDeleteGalleryImage(image.id)}
                            disabled={saving}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                      {image.caption && (
                        <p className="text-sm text-muted-foreground mt-2 truncate">
                          {image.caption}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Theme Tab */}
          <TabsContent value="theme" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Theme Customization</CardTitle>
                <CardDescription>
                  Customize colors and fonts
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="primaryColor">Primary Color</Label>
                    <div className="flex gap-2">
                      <Input
                        id="primaryColor"
                        type="color"
                        value={formData.theme?.primaryColor || '#3b82f6'}
                        onChange={(e) => handleThemeChange('primaryColor', e.target.value)}
                        className="w-20 h-10"
                      />
                      <Input
                        value={formData.theme?.primaryColor || '#3b82f6'}
                        onChange={(e) => handleThemeChange('primaryColor', e.target.value)}
                        placeholder="#3b82f6"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="secondaryColor">Secondary Color</Label>
                    <div className="flex gap-2">
                      <Input
                        id="secondaryColor"
                        type="color"
                        value={formData.theme?.secondaryColor || '#8b5cf6'}
                        onChange={(e) => handleThemeChange('secondaryColor', e.target.value)}
                        className="w-20 h-10"
                      />
                      <Input
                        value={formData.theme?.secondaryColor || '#8b5cf6'}
                        onChange={(e) => handleThemeChange('secondaryColor', e.target.value)}
                        placeholder="#8b5cf6"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="ctaColor">CTA Button Color</Label>
                    <div className="flex gap-2">
                      <Input
                        id="ctaColor"
                        type="color"
                        value={formData.theme?.ctaColor || formData.theme?.primaryColor || '#3b82f6'}
                        onChange={(e) => handleThemeChange('ctaColor', e.target.value)}
                        className="w-20 h-10"
                      />
                      <Input
                        value={formData.theme?.ctaColor || formData.theme?.primaryColor || '#3b82f6'}
                        onChange={(e) => handleThemeChange('ctaColor', e.target.value)}
                        placeholder="#3b82f6"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="fontFamily">Font Family</Label>
                    <Select
                      value={formData.theme?.fontFamily || 'inherit'}
                      onValueChange={(value) => handleThemeChange('fontFamily', value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="inherit">Default</SelectItem>
                        <SelectItem value="Inter, sans-serif">Inter</SelectItem>
                        <SelectItem value="Roboto, sans-serif">Roboto</SelectItem>
                        <SelectItem value="Open Sans, sans-serif">Open Sans</SelectItem>
                        <SelectItem value="Lato, sans-serif">Lato</SelectItem>
                        <SelectItem value="Montserrat, sans-serif">Montserrat</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Sections Tab */}
          <TabsContent value="sections" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Section Management</CardTitle>
                <CardDescription>
                  Enable, disable, and reorder sections
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {[
                  { type: 'philosophy', label: 'Philosophy' },
                  { type: 'target-audience', label: 'Target Audience' },
                  { type: 'trainer-content', label: 'Trainer Content' },
                  { type: 'gallery', label: 'Gallery' },
                  { type: 'about', label: 'About' },
                  { type: 'certifications', label: 'Certifications' },
                  { type: 'contact', label: 'Contact' }
                ].map((section) => {
                  const sectionData = (formData.sections || []).find(s => s.type === section.type)
                  const enabled = sectionData?.enabled || false
                  const order = sectionData?.order || 0

                  return (
                    <div key={section.type} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <GripVertical className="w-5 h-5 text-muted-foreground" />
                        <div>
                          <Label className="text-base">{section.label}</Label>
                          <p className="text-sm text-muted-foreground">Order: {order}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="flex gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleSectionOrder(section.type, 'up')}
                            disabled={order === 0}
                          >
                            ↑
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleSectionOrder(section.type, 'down')}
                            disabled={order >= (formData.sections || []).length - 1}
                          >
                            ↓
                          </Button>
                        </div>
                        <Switch
                          checked={enabled}
                          onCheckedChange={() => handleToggleSection(section.type)}
                        />
                      </div>
                    </div>
                  )
                })}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Social Links</CardTitle>
                <CardDescription>
                  Add your social media links
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="instagram">Instagram</Label>
                    <Input
                      id="instagram"
                      value={formData.socialLinks?.instagram || ''}
                      onChange={(e) => handleInputChange('socialLinks', {
                        ...(formData.socialLinks || {}),
                        instagram: e.target.value
                      })}
                      placeholder="https://instagram.com/..."
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="facebook">Facebook</Label>
                    <Input
                      id="facebook"
                      value={formData.socialLinks?.facebook || ''}
                      onChange={(e) => handleInputChange('socialLinks', {
                        ...(formData.socialLinks || {}),
                        facebook: e.target.value
                      })}
                      placeholder="https://facebook.com/..."
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="twitter">Twitter</Label>
                    <Input
                      id="twitter"
                      value={formData.socialLinks?.twitter || ''}
                      onChange={(e) => handleInputChange('socialLinks', {
                        ...(formData.socialLinks || {}),
                        twitter: e.target.value
                      })}
                      placeholder="https://twitter.com/..."
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="linkedin">LinkedIn</Label>
                    <Input
                      id="linkedin"
                      value={formData.socialLinks?.linkedin || ''}
                      onChange={(e) => handleInputChange('socialLinks', {
                        ...(formData.socialLinks || {}),
                        linkedin: e.target.value
                      })}
                      placeholder="https://linkedin.com/in/..."
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="youtube">YouTube</Label>
                    <Input
                      id="youtube"
                      value={formData.socialLinks?.youtube || ''}
                      onChange={(e) => handleInputChange('socialLinks', {
                        ...(formData.socialLinks || {}),
                        youtube: e.target.value
                      })}
                      placeholder="https://youtube.com/..."
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="website">Website</Label>
                    <Input
                      id="website"
                      value={formData.socialLinks?.website || ''}
                      onChange={(e) => handleInputChange('socialLinks', {
                        ...(formData.socialLinks || {}),
                        website: e.target.value
                      })}
                      placeholder="https://..."
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}
    </div>
  )
}

