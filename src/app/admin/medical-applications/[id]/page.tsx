'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { useAuth } from '@/contexts/auth-context'
import { apiClient } from '@/lib/api-client'
import { NeumorphicCard } from '@/components/user/NeumorphicCard'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { ArrowLeft, ClipboardList, CheckCircle, XCircle, Clock, Download, FileText } from 'lucide-react'
import { toast } from 'sonner'

export default function MedicalApplicationDetailPage() {
  const router = useRouter()
  const params = useParams()
  const applicationId = parseInt(params.id as string)
  const { user, isLoading: authLoading } = useAuth()
  const [loading, setLoading] = useState(true)
  const [application, setApplication] = useState<any>(null)
  const [rejectionReason, setRejectionReason] = useState('')
  const [adminNotes, setAdminNotes] = useState('')
  const [actionLoading, setActionLoading] = useState(false)

  useEffect(() => {
    if (!authLoading && user && applicationId) {
      fetchApplication()
    }
  }, [authLoading, user, applicationId])

  async function fetchApplication() {
    try {
      setLoading(true)
      const response = await apiClient.getMedicalApplication(applicationId)
      if (response.success && response.data) {
        setApplication(response.data)
        setAdminNotes(response.data.adminNotes || '')
      }
    } catch (error) {
      console.error('Error fetching application:', error)
    } finally {
      setLoading(false)
    }
  }

  async function handleApprove() {
    try {
      setActionLoading(true)
      const response = await apiClient.approveMedicalApplication(applicationId, adminNotes)
      if (response.success) {
        toast.success('Application approved successfully')
        fetchApplication()
      } else {
        throw new Error(response.error?.message || 'Failed to approve application')
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to approve application')
    } finally {
      setActionLoading(false)
    }
  }

  async function handleReject() {
    if (!rejectionReason.trim()) {
      toast.error('Please provide a rejection reason')
      return
    }

    try {
      setActionLoading(true)
      const response = await apiClient.rejectMedicalApplication(applicationId, rejectionReason, adminNotes)
      if (response.success) {
        toast.success('Application rejected')
        setRejectionReason('')
        fetchApplication()
      } else {
        throw new Error(response.error?.message || 'Failed to reject application')
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to reject application')
    } finally {
      setActionLoading(false)
    }
  }

  async function handleMarkUnderReview() {
    try {
      setActionLoading(true)
      const response = await apiClient.markMedicalApplicationUnderReview(applicationId)
      if (response.success) {
        toast.success('Application marked as under review')
        fetchApplication()
      } else {
        throw new Error(response.error?.message || 'Failed to update status')
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to update status')
    } finally {
      setActionLoading(false)
    }
  }

  async function handleUpdateNotes() {
    try {
      const response = await apiClient.updateMedicalApplicationNotes(applicationId, adminNotes)
      if (response.success) {
        toast.success('Notes updated successfully')
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to update notes')
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

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <Badge className="bg-green-500 text-white"><CheckCircle className="w-3 h-3 mr-1" />Approved</Badge>
      case 'rejected':
        return <Badge className="bg-red-500 text-white"><XCircle className="w-3 h-3 mr-1" />Rejected</Badge>
      case 'under_review':
        return <Badge className="bg-blue-500 text-white"><Clock className="w-3 h-3 mr-1" />Under Review</Badge>
      case 'pending':
        return <Badge className="bg-yellow-500 text-white"><Clock className="w-3 h-3 mr-1" />Pending</Badge>
      default:
        return <Badge>{status}</Badge>
    }
  }

  return (
    <div className="min-h-screen bg-[var(--neumorphic-bg)]">
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-teal-500/10 via-emerald-500/5 to-blue-500/10" />
        
        <div className="relative px-4 md:px-8 py-12">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center gap-4 mb-4">
              <Button
                onClick={() => router.push('/admin/medical-applications')}
                variant="ghost"
                size="sm"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-r from-teal-500 to-emerald-600 rounded-full flex items-center justify-center">
                  <ClipboardList className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-4xl md:text-5xl font-bold text-[var(--neumorphic-text)]">
                    Medical Application Review
                  </h1>
                  <div className="flex items-center gap-3 mt-2">
                    {getStatusBadge(application.status)}
                    <span className="text-lg text-[var(--neumorphic-muted)]">
                      {application.user?.name || `User ${application.userId}`}
                    </span>
                  </div>
                </div>
              </div>
              {application.status === 'pending' && (
                <Button
                  onClick={handleMarkUnderReview}
                  disabled={actionLoading}
                  variant="outline"
                >
                  Mark as Under Review
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8 space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <NeumorphicCard variant="raised" className="p-6">
            <h2 className="text-xl font-bold text-[var(--neumorphic-text)] mb-4">Application Details</h2>
            <div className="space-y-3">
              <div>
                <p className="text-sm font-semibold text-[var(--neumorphic-muted)]">Professional Type</p>
                <p className="text-[var(--neumorphic-text)]">{application.professionalType?.replace('_', ' ')}</p>
              </div>
              {application.specialties?.length > 0 && (
                <div>
                  <p className="text-sm font-semibold text-[var(--neumorphic-muted)]">Specialties</p>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {application.specialties.map((spec: string, idx: number) => (
                      <Badge key={idx} className="bg-teal-500 text-white">{spec}</Badge>
                    ))}
                  </div>
                </div>
              )}
              {application.bio && (
                <div>
                  <p className="text-sm font-semibold text-[var(--neumorphic-muted)]">Bio</p>
                  <p className="text-[var(--neumorphic-text)]">{application.bio}</p>
                </div>
              )}
              {application.yearsOfExperience && (
                <div>
                  <p className="text-sm font-semibold text-[var(--neumorphic-muted)]">Years of Experience</p>
                  <p className="text-[var(--neumorphic-text)]">{application.yearsOfExperience}</p>
                </div>
              )}
            </div>
          </NeumorphicCard>

          <NeumorphicCard variant="raised" className="p-6">
            <h2 className="text-xl font-bold text-[var(--neumorphic-text)] mb-4">License Information</h2>
            {application.licenseInfo && Object.keys(application.licenseInfo).length > 0 ? (
              <div className="space-y-2">
                {Object.entries(application.licenseInfo).map(([key, value]: [string, any]) => (
                  <div key={key}>
                    <p className="text-sm font-semibold text-[var(--neumorphic-muted)]">{key.replace(/([A-Z])/g, ' $1').trim()}</p>
                    <p className="text-[var(--neumorphic-text)]">{String(value)}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-[var(--neumorphic-muted)]">No license information provided</p>
            )}
          </NeumorphicCard>
        </div>

        {application.credentialFiles && application.credentialFiles.length > 0 && (
          <NeumorphicCard variant="raised" className="p-6">
            <h2 className="text-xl font-bold text-[var(--neumorphic-text)] mb-4">Credential Files</h2>
            <div className="space-y-2">
              {application.credentialFiles.map((file: any) => (
                <div key={file.id} className="flex items-center justify-between p-3 rounded-lg bg-[var(--neumorphic-surface)]">
                  <div className="flex items-center gap-3">
                    <FileText className="w-5 h-5 text-[var(--neumorphic-muted)]" />
                    <div>
                      <p className="text-sm font-semibold text-[var(--neumorphic-text)]">{file.fileName}</p>
                      <p className="text-xs text-[var(--neumorphic-muted)]">{(file.fileSize / 1024).toFixed(2)} KB</p>
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

        <NeumorphicCard variant="raised" className="p-6">
          <h2 className="text-xl font-bold text-[var(--neumorphic-text)] mb-4">Admin Notes</h2>
          <Textarea
            value={adminNotes}
            onChange={(e) => setAdminNotes(e.target.value)}
            placeholder="Add admin notes..."
            rows={4}
          />
          <Button
            onClick={handleUpdateNotes}
            className="mt-4 bg-gradient-to-r from-teal-500 to-emerald-600 text-white"
          >
            Update Notes
          </Button>
        </NeumorphicCard>

        {application.status !== 'approved' && application.status !== 'rejected' && (
          <div className="flex gap-4">
            <Dialog>
              <DialogTrigger asChild>
                <Button className="flex-1 bg-green-500 hover:bg-green-600 text-white">
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Approve
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Approve Application</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <p className="text-[var(--neumorphic-text)]">
                    Are you sure you want to approve this medical professional application?
                  </p>
                  <div className="flex gap-2">
                    <Button
                      onClick={handleApprove}
                      disabled={actionLoading}
                      className="flex-1 bg-green-500 text-white"
                    >
                      {actionLoading ? 'Approving...' : 'Confirm Approve'}
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>

            <Dialog>
              <DialogTrigger asChild>
                <Button variant="destructive" className="flex-1">
                  <XCircle className="w-4 h-4 mr-2" />
                  Reject
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Reject Application</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label>Rejection Reason (Required)</Label>
                    <Textarea
                      value={rejectionReason}
                      onChange={(e) => setRejectionReason(e.target.value)}
                      placeholder="Enter reason for rejection..."
                      rows={4}
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button
                      onClick={handleReject}
                      disabled={actionLoading || !rejectionReason.trim()}
                      variant="destructive"
                      className="flex-1"
                    >
                      {actionLoading ? 'Rejecting...' : 'Confirm Reject'}
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        )}

        {application.rejectionReason && (
          <NeumorphicCard variant="raised" className="p-6">
            <h2 className="text-xl font-bold text-[var(--neumorphic-text)] mb-4">Rejection Reason</h2>
            <p className="text-[var(--neumorphic-text)]">{application.rejectionReason}</p>
          </NeumorphicCard>
        )}
      </div>
    </div>
  )
}

