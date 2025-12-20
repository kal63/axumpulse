'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/auth-context'
import { apiClient } from '@/lib/api-client'
import { MedicalProfileForm } from '@/components/medical/MedicalProfileForm'
import { NeumorphicCard } from '@/components/user/NeumorphicCard'
import { Heart, ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function MedicalProfilePage() {
  const router = useRouter()
  const { user, isLoading: authLoading } = useAuth()
  const [loading, setLoading] = useState(true)
  const [profileData, setProfileData] = useState<any>(null)

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login')
    } else if (user) {
      fetchProfile()
    }
  }, [authLoading, user, router])

  async function fetchProfile() {
    try {
      setLoading(true)
      const response = await apiClient.getMedicalProfile()
      if (response.success && response.data) {
        setProfileData(response.data)
      }
    } catch (error) {
      console.error('Error fetching medical profile:', error)
    } finally {
      setLoading(false)
    }
  }

  async function handleSave(data: any) {
    const response = await apiClient.updateMedicalProfile(data)
    if (response.success) {
      setProfileData(response.data)
    } else {
      throw new Error(response.error?.message || 'Failed to save profile')
    }
  }

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--neumorphic-bg)]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-500 mx-auto"></div>
          <p className="mt-4 text-[var(--neumorphic-muted)]">Loading...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen bg-[var(--neumorphic-bg)]">
      {/* Header */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-teal-500/10 via-emerald-500/5 to-blue-500/10" />
        
        <div className="relative px-4 md:px-8 py-12">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center gap-4 mb-4">
              <Button
                onClick={() => router.push('/user/medical')}
                variant="ghost"
                size="sm"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
            </div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-gradient-to-r from-teal-500 to-emerald-600 rounded-full flex items-center justify-center">
                <Heart className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-4xl md:text-5xl font-bold text-[var(--neumorphic-text)]">
                  Medical Profile
                </h1>
                <p className="text-lg text-[var(--neumorphic-muted)]">
                  Manage your medical information and health history
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        <MedicalProfileForm
          initialData={profileData}
          onSave={handleSave}
        />
      </div>
    </div>
  )
}

