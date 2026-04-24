'use client'

import { useState, useRef } from 'react'
import { NeumorphicCard } from './NeumorphicCard'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Settings, Save, User, MapPin, FileText, Camera, Trash2, Loader2 } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { uploadUserProfileImage, removeUserProfileImage, validateFileSize, validateImageType, FILE_SIZE_LIMITS, ALLOWED_FILE_TYPES, getImageUrl } from '@/lib/upload-utils'

interface SettingsFormProps {
  user: {
    name: string
    email: string
    bio: string | null
    location: string | null
    profilePicture: string | null
  }
  onUpdate: (data: {
    name?: string
    bio?: string
    location?: string
    profilePicture?: string
  }) => Promise<void>
}

export function SettingsForm({ user, onUpdate }: SettingsFormProps) {
  const { toast } = useToast()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [formData, setFormData] = useState({
    name: user.name || '',
    bio: user.bio || '',
    location: user.location || '',
    profilePicture: user.profilePicture || ''
  })

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
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
        setFormData(prev => ({ ...prev, profilePicture: result.data.profilePicture }))
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
        setFormData(prev => ({ ...prev, profilePicture: '' }))
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      setSaving(true)
      await onUpdate(formData)
      
      toast({
        title: 'Profile Updated!',
        description: 'Your changes have been saved successfully.',
      })
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update profile. Please try again.',
        variant: 'destructive'
      })
    } finally {
      setSaving(false)
    }
  }

  const hasChanges = 
    formData.name !== (user.name || '') ||
    formData.bio !== (user.bio || '') ||
    formData.location !== (user.location || '') ||
    formData.profilePicture !== (user.profilePicture || '')

  return (
    <NeumorphicCard>
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3 pb-4 border-b border-gray-200 dark:border-gray-700">
          <Settings className="h-6 w-6 text-[var(--color-cyber-blue)]" />
          <h2 className="text-2xl font-bold user-app-ink">
            Profile Settings
          </h2>
        </div>

        {/* Name */}
        <div className="space-y-3">
          <Label htmlFor="name" className="flex items-center gap-2 user-app-ink">
            <User className="h-4 w-4" />
            Display Name
          </Label>
          <Input
            id="name"
            type="text"
            value={formData.name}
            onChange={(e) => handleChange('name', e.target.value)}
            placeholder="Enter your name"
            className="
              user-app-paper 
              user-app-ink
              border-none
              shadow-[inset_4px_4px_8px_rgba(15,23,42,0.12),inset_-4px_-4px_8px_rgba(255,255,255,0.9)]
              dark:shadow-[inset_4px_4px_8px_rgba(0,0,0,0.65),inset_-4px_-4px_8px_rgba(255,255,255,0.05)]
            "
          />
        </div>

        {/* Email (Read Only) */}
        <div className="space-y-3">
          <Label htmlFor="email" className="user-app-ink">
            Email Address
          </Label>
          <Input
            id="email"
            type="email"
            value={user.email}
            disabled
            className="
              bg-slate-100 dark:bg-slate-800/70 
              user-app-muted
              border-none
              opacity-60
              cursor-not-allowed
            "
          />
          <p className="text-xs user-app-muted">
            Email cannot be changed
          </p>
        </div>

        {/* Bio */}
        <div className="space-y-3">
          <Label htmlFor="bio" className="flex items-center gap-2 user-app-ink">
            <FileText className="h-4 w-4" />
            Bio
          </Label>
          <Textarea
            id="bio"
            value={formData.bio}
            onChange={(e) => handleChange('bio', e.target.value)}
            placeholder="Tell us about yourself..."
            rows={4}
            maxLength={500}
            className="
              user-app-paper 
              user-app-ink
              border-none
              shadow-[inset_4px_4px_8px_rgba(15,23,42,0.12),inset_-4px_-4px_8px_rgba(255,255,255,0.9)]
              dark:shadow-[inset_4px_4px_8px_rgba(0,0,0,0.65),inset_-4px_-4px_8px_rgba(255,255,255,0.05)]
              resize-none
            "
          />
          <div className="flex justify-between text-xs user-app-muted">
            <span>Share a bit about your fitness journey</span>
            <span>{formData.bio.length}/500</span>
          </div>
        </div>

        {/* Location */}
        <div className="space-y-3">
          <Label htmlFor="location" className="flex items-center gap-2 user-app-ink">
            <MapPin className="h-4 w-4" />
            Location
          </Label>
          <Input
            id="location"
            type="text"
            value={formData.location}
            onChange={(e) => handleChange('location', e.target.value)}
            placeholder="City, Country"
            className="
              user-app-paper 
              user-app-ink
              border-none
              shadow-[inset_4px_4px_8px_rgba(15,23,42,0.12),inset_-4px_-4px_8px_rgba(255,255,255,0.9)]
              dark:shadow-[inset_4px_4px_8px_rgba(0,0,0,0.65),inset_-4px_-4px_8px_rgba(255,255,255,0.05)]
            "
          />
        </div>

        {/* Profile Picture Upload */}
        <div className="space-y-4">
          <Label className="user-app-ink">Profile Picture</Label>
          <div className="flex items-center gap-6">
            <Avatar className="h-20 w-20">
              <AvatarImage 
                src={getImageUrl(formData.profilePicture)} 
                alt={formData.name} 
              />
              <AvatarFallback className="text-lg">
                {formData.name?.charAt(0)?.toUpperCase() || 'U'}
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
                {formData.profilePicture && (
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
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
          <Button
            type="submit"
            disabled={saving || !hasChanges}
            className="flex-1 bg-gradient-to-r from-[var(--color-cyber-blue)] to-[var(--color-neon-magenta)] text-white"
          >
            <Save className="h-4 w-4 mr-2" />
            {saving ? 'Saving...' : 'Save Changes'}
          </Button>
          
          {hasChanges && (
            <Button
              type="button"
              variant="outline"
              onClick={() => setFormData({
                name: user.name || '',
                bio: user.bio || '',
                location: user.location || '',
                profilePicture: user.profilePicture || ''
              })}
              disabled={saving}
            >
              Cancel
            </Button>
          )}
        </div>
      </form>
    </NeumorphicCard>
  )
}


