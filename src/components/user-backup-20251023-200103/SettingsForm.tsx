'use client'

import { useState } from 'react'
import { NeumorphicCard } from './NeumorphicCard'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Settings, Save, User, MapPin, FileText } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

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
  const [saving, setSaving] = useState(false)
  const [formData, setFormData] = useState({
    name: user.name || '',
    bio: user.bio || '',
    location: user.location || '',
    profilePicture: user.profilePicture || ''
  })

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
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
          <h2 className="text-2xl font-bold text-[var(--neumorphic-text)]">
            Profile Settings
          </h2>
        </div>

        {/* Name */}
        <div className="space-y-2">
          <Label htmlFor="name" className="flex items-center gap-2 text-[var(--neumorphic-text)]">
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
              bg-[var(--neumorphic-surface)] 
              text-[var(--neumorphic-text)]
              border-none
              shadow-[inset_4px_4px_8px_rgba(15,23,42,0.12),inset_-4px_-4px_8px_rgba(255,255,255,0.9)]
              dark:shadow-[inset_4px_4px_8px_rgba(0,0,0,0.65),inset_-4px_-4px_8px_rgba(255,255,255,0.05)]
            "
          />
        </div>

        {/* Email (Read Only) */}
        <div className="space-y-2">
          <Label htmlFor="email" className="text-[var(--neumorphic-text)]">
            Email Address
          </Label>
          <Input
            id="email"
            type="email"
            value={user.email}
            disabled
            className="
              bg-[var(--neumorphic-bg)] 
              text-[var(--neumorphic-muted)]
              border-none
              opacity-60
              cursor-not-allowed
            "
          />
          <p className="text-xs text-[var(--neumorphic-muted)]">
            Email cannot be changed
          </p>
        </div>

        {/* Bio */}
        <div className="space-y-2">
          <Label htmlFor="bio" className="flex items-center gap-2 text-[var(--neumorphic-text)]">
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
              bg-[var(--neumorphic-surface)] 
              text-[var(--neumorphic-text)]
              border-none
              shadow-[inset_4px_4px_8px_rgba(15,23,42,0.12),inset_-4px_-4px_8px_rgba(255,255,255,0.9)]
              dark:shadow-[inset_4px_4px_8px_rgba(0,0,0,0.65),inset_-4px_-4px_8px_rgba(255,255,255,0.05)]
              resize-none
            "
          />
          <div className="flex justify-between text-xs text-[var(--neumorphic-muted)]">
            <span>Share a bit about your fitness journey</span>
            <span>{formData.bio.length}/500</span>
          </div>
        </div>

        {/* Location */}
        <div className="space-y-2">
          <Label htmlFor="location" className="flex items-center gap-2 text-[var(--neumorphic-text)]">
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
              bg-[var(--neumorphic-surface)] 
              text-[var(--neumorphic-text)]
              border-none
              shadow-[inset_4px_4px_8px_rgba(15,23,42,0.12),inset_-4px_-4px_8px_rgba(255,255,255,0.9)]
              dark:shadow-[inset_4px_4px_8px_rgba(0,0,0,0.65),inset_-4px_-4px_8px_rgba(255,255,255,0.05)]
            "
          />
        </div>

        {/* Profile Picture URL */}
        <div className="space-y-2">
          <Label htmlFor="profilePicture" className="text-[var(--neumorphic-text)]">
            Profile Picture URL
          </Label>
          <Input
            id="profilePicture"
            type="url"
            value={formData.profilePicture}
            onChange={(e) => handleChange('profilePicture', e.target.value)}
            placeholder="https://example.com/avatar.jpg"
            className="
              bg-[var(--neumorphic-surface)] 
              text-[var(--neumorphic-text)]
              border-none
              shadow-[inset_4px_4px_8px_rgba(15,23,42,0.12),inset_-4px_-4px_8px_rgba(255,255,255,0.9)]
              dark:shadow-[inset_4px_4px_8px_rgba(0,0,0,0.65),inset_-4px_-4px_8px_rgba(255,255,255,0.05)]
            "
          />
          <p className="text-xs text-[var(--neumorphic-muted)]">
            Enter a URL to your profile picture
          </p>
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

