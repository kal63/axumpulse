'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/auth-context'
import { apiClient } from '@/lib/api-client'
import { NeumorphicCard } from '@/components/user/NeumorphicCard'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Stethoscope, ArrowLeft, CheckCircle, XCircle, Clock, FileText, Download, AlertCircle } from 'lucide-react'

export default function MedicalApplicationStatusPage() {
  const router = useRouter()
  const { user, isLoading: authLoading } = useAuth()
  const [loading, setLoading] = useState(true)
  const [application, setApplication] = useState<any>(null)

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login')
    } else if (user) {
      fetchStatus()
    }
  }, [authLoading, user, router])

  async function fetchStatus() {
    try {
      setLoading(true)
      const response = await apiClient.getMedicalApplicationStatus()
      if (response.success && response.data) {
        setApplication(response.data)
      }
    } catch (error: any) {
      if (error.response?.status === 404) {
        router.push('/user/medical/apply')
      } else {
        console.error('Error fetching application status:', error)
      }
    } finally {
      setLoading(false)
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return (
          <Badge className="bg-green-500 text-white">
            <CheckCircle className="w-3 h-3 mr-1" />
            Approved
          </Badge>
        )
      case 'rejected':
        return (
          <Badge className="bg-red-500 text-white">
            <XCircle className="w-3 h-3 mr-1" />
            Rejected
          </Badge>
        )
      case 'under_review':
        return (
          <Badge className="bg-blue-500 text-white">
            <Clock className="w-3 h-3 mr-1" />
            Under Review
          </Badge>
        )
      case 'pending':
        return (
          <Badge className="bg-yellow-500 text-white">
            <Clock className="w-3 h-3 mr-1" />
            Pending
          </Badge>
        )
      default:
        return <Badge>{status}</Badge>
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

  if (!user || !application) {
    return null
  }

  return (
    <div className="min-h-screen bg-[var(--neumorphic-bg)]">
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
            <div className="flex items-center gap-3 mb-8">
              <div className="w-12 h-12 bg-gradient-to-r from-teal-500 to-emerald-600 rounded-full flex items-center justify-center">
                <Stethoscope className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-4xl md:text-5xl font-bold text-[var(--neumorphic-text)]">
                  Application Status
                </h1>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
        <NeumorphicCard variant="raised" className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-[var(--neumorphic-text)]">
              Your Application
            </h2>
            {getStatusBadge(application.status)}
          </div>

          <div className="space-y-4">
            <div>
              <p className="text-sm font-semibold text-[var(--neumorphic-muted)] mb-1">
                Professional Type
              </p>
              <p className="text-[var(--neumorphic-text)]">
                {application.professionalType?.replace('_', ' ')}
              </p>
            </div>

            {application.specialties && application.specialties.length > 0 && (
              <div>
                <p className="text-sm font-semibold text-[var(--neumorphic-muted)] mb-2">
                  Specialties
                </p>
                <div className="flex flex-wrap gap-2">
                  {application.specialties.map((spec: string, idx: number) => (
                    <Badge key={idx} className="bg-teal-500 text-white">
                      {spec}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {application.bio && (
              <div>
                <p className="text-sm font-semibold text-[var(--neumorphic-muted)] mb-1">
                  Bio
                </p>
                <p className="text-[var(--neumorphic-text)]">{application.bio}</p>
              </div>
            )}

            <div>
              <p className="text-sm font-semibold text-[var(--neumorphic-muted)] mb-1">
                Submitted
              </p>
              <p className="text-[var(--neumorphic-text)]">
                {new Date(application.submittedAt).toLocaleString()}
              </p>
            </div>
          </div>
        </NeumorphicCard>

        {application.rejectionReason && (
          <NeumorphicCard variant="raised" className="p-6 border-l-4 border-red-500">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-500 mt-0.5" />
              <div>
                <h3 className="text-lg font-semibold text-[var(--neumorphic-text)] mb-2">
                  Rejection Reason
                </h3>
                <p className="text-[var(--neumorphic-text)]">{application.rejectionReason}</p>
                <Button
                  onClick={() => router.push('/user/medical/apply')}
                  className="mt-4 bg-gradient-to-r from-teal-500 to-emerald-600 text-white"
                >
                  Update and Resubmit
                </Button>
              </div>
            </div>
          </NeumorphicCard>
        )}

        {application.status === 'approved' && (
          <NeumorphicCard variant="raised" className="p-6 border-l-4 border-green-500">
            <div className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
              <div>
                <h3 className="text-lg font-semibold text-[var(--neumorphic-text)] mb-2">
                  Congratulations!
                </h3>
                <p className="text-[var(--neumorphic-text)] mb-4">
                  Your application has been approved. You can now access the medical professional portal.
                </p>
                <Button
                  onClick={() => router.push('/medical/dashboard')}
                  className="bg-gradient-to-r from-teal-500 to-emerald-600 text-white"
                >
                  Go to Medical Dashboard
                </Button>
              </div>
            </div>
          </NeumorphicCard>
        )}

        {application.credentialFiles && application.credentialFiles.length > 0 && (
          <NeumorphicCard variant="raised" className="p-6">
            <h3 className="text-xl font-bold text-[var(--neumorphic-text)] mb-4 flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Uploaded Credentials
            </h3>
            <div className="space-y-2">
              {application.credentialFiles.map((file: any) => (
                <div key={file.id} className="flex items-center justify-between p-3 rounded-lg bg-[var(--neumorphic-surface)]">
                  <div className="flex items-center gap-3">
                    <FileText className="w-5 h-5 text-[var(--neumorphic-muted)]" />
                    <div>
                      <p className="text-sm font-semibold text-[var(--neumorphic-text)]">
                        {file.fileName}
                      </p>
                      <p className="text-xs text-[var(--neumorphic-muted)]">
                        {(file.fileSize / 1024).toFixed(2)} KB
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => window.open(file.fileUrl, '_blank')}
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Download
                  </Button>
                </div>
              ))}
            </div>
          </NeumorphicCard>
        )}
      </div>
    </div>
  )
}

