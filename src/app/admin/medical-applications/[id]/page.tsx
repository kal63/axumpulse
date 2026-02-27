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
        // Handle nested data structure: response.data.data
        const applicationData = response.data.data || response.data
        console.log('Application data received:', applicationData)
        console.log('Response structure:', response)
        setApplication(applicationData)
        setAdminNotes(applicationData.adminNotes || '')
      } else {
        console.error('Failed to fetch application:', response.error)
        toast.error(response.error?.message || 'Failed to load application')
      }
    } catch (error) {
      console.error('Error fetching application:', error)
      toast.error('An error occurred while loading the application')
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
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--neumorphic-bg)]">
        <div className="text-center">
          <p className="text-[var(--neumorphic-muted)]">Application not found</p>
        </div>
      </div>
    )
  }

  // Helper function to safely parse JSON fields that might be strings
  const parseJsonField = (field: any) => {
    if (field === null || field === undefined) return null
    if (typeof field === 'string') {
      try {
        const parsed = JSON.parse(field)
        return parsed
      } catch {
        return field
      }
    }
    return field
  }

  // Parse JSON fields if needed
  const specialties = Array.isArray(application.specialties) 
    ? application.specialties 
    : (parseJsonField(application.specialties) || [])
  const languages = Array.isArray(application.languages)
    ? application.languages
    : (parseJsonField(application.languages) || [])
  const licenseInfo = (application.licenseInfo && typeof application.licenseInfo === 'object' && !Array.isArray(application.licenseInfo))
    ? application.licenseInfo
    : (parseJsonField(application.licenseInfo) || {})
  const portfolio = Array.isArray(application.portfolio)
    ? application.portfolio
    : (parseJsonField(application.portfolio) || [])
  const socialMedia = (application.socialMedia && typeof application.socialMedia === 'object' && !Array.isArray(application.socialMedia))
    ? application.socialMedia
    : (parseJsonField(application.socialMedia) || {})
  const preferences = (application.preferences && typeof application.preferences === 'object' && !Array.isArray(application.preferences))
    ? application.preferences
    : (parseJsonField(application.preferences) || {})

  // Debug: Log parsed values
  console.log('Parsed fields:', {
    specialties,
    languages,
    licenseInfo,
    portfolio,
    socialMedia,
    preferences,
    rawApplication: application
  })

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
        {/* User Information */}
        {application.user && (
          <NeumorphicCard variant="raised" className="p-6">
            <h2 className="text-xl font-bold text-[var(--neumorphic-text)] mb-4">Applicant Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-semibold text-[var(--neumorphic-muted)]">Name</p>
                <p className="text-[var(--neumorphic-text)]">{application.user.name || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm font-semibold text-[var(--neumorphic-muted)]">Phone</p>
                <p className="text-[var(--neumorphic-text)]">{application.user.phone || 'N/A'}</p>
              </div>
              {application.user.email && (
                <div>
                  <p className="text-sm font-semibold text-[var(--neumorphic-muted)]">Email</p>
                  <p className="text-[var(--neumorphic-text)]">{application.user.email}</p>
                </div>
              )}
              {application.user.dateOfBirth && (
                <div>
                  <p className="text-sm font-semibold text-[var(--neumorphic-muted)]">Date of Birth</p>
                  <p className="text-[var(--neumorphic-text)]">{new Date(application.user.dateOfBirth).toLocaleDateString()}</p>
                </div>
              )}
            </div>
          </NeumorphicCard>
        )}

        {/* Application Metadata */}
        <NeumorphicCard variant="raised" className="p-6">
          <h2 className="text-xl font-bold text-[var(--neumorphic-text)] mb-4">Application Metadata</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <p className="text-sm font-semibold text-[var(--neumorphic-muted)]">Submitted At</p>
              <p className="text-[var(--neumorphic-text)]">
                {application.submittedAt ? new Date(application.submittedAt).toLocaleString() : 'N/A'}
              </p>
            </div>
            {application.reviewedAt && (
              <div>
                <p className="text-sm font-semibold text-[var(--neumorphic-muted)]">Reviewed At</p>
                <p className="text-[var(--neumorphic-text)]">
                  {new Date(application.reviewedAt).toLocaleString()}
                </p>
              </div>
            )}
            {application.reviewedBy && (
              <div>
                <p className="text-sm font-semibold text-[var(--neumorphic-muted)]">Reviewed By</p>
                <p className="text-[var(--neumorphic-text)]">Admin ID: {application.reviewedBy}</p>
              </div>
            )}
          </div>
        </NeumorphicCard>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <NeumorphicCard variant="raised" className="p-6">
            <h2 className="text-xl font-bold text-[var(--neumorphic-text)] mb-4">Application Details</h2>
            <div className="space-y-3">
              <div>
                <p className="text-sm font-semibold text-[var(--neumorphic-muted)]">Professional Type</p>
                <p className="text-[var(--neumorphic-text)] capitalize">{application.professionalType?.replace('_', ' ')}</p>
              </div>
              {specialties.length > 0 && (
                <div>
                  <p className="text-sm font-semibold text-[var(--neumorphic-muted)]">Specialties</p>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {specialties.map((spec: string, idx: number) => (
                      <Badge key={idx} className="bg-teal-500 text-white">{spec}</Badge>
                    ))}
                  </div>
                </div>
              )}
              {application.yearsOfExperience && (
                <div>
                  <p className="text-sm font-semibold text-[var(--neumorphic-muted)]">Years of Experience</p>
                  <p className="text-[var(--neumorphic-text)]">{application.yearsOfExperience} years</p>
                </div>
              )}
              {application.bio && (
                <div>
                  <p className="text-sm font-semibold text-[var(--neumorphic-muted)]">Bio</p>
                  <p className="text-[var(--neumorphic-text)] whitespace-pre-wrap">{application.bio}</p>
                </div>
              )}
            </div>
          </NeumorphicCard>

          <NeumorphicCard variant="raised" className="p-6">
            <h2 className="text-xl font-bold text-[var(--neumorphic-text)] mb-4">License Information</h2>
            {licenseInfo && Object.keys(licenseInfo).length > 0 ? (
              <div className="space-y-2">
                {licenseInfo.licenseNumber && (
                  <div>
                    <p className="text-sm font-semibold text-[var(--neumorphic-muted)]">License Number</p>
                    <p className="text-[var(--neumorphic-text)]">{licenseInfo.licenseNumber}</p>
                  </div>
                )}
                {licenseInfo.issuingAuthority && (
                  <div>
                    <p className="text-sm font-semibold text-[var(--neumorphic-muted)]">Issuing Authority</p>
                    <p className="text-[var(--neumorphic-text)]">{licenseInfo.issuingAuthority}</p>
                  </div>
                )}
                {licenseInfo.state && (
                  <div>
                    <p className="text-sm font-semibold text-[var(--neumorphic-muted)]">State/Province</p>
                    <p className="text-[var(--neumorphic-text)]">{licenseInfo.state}</p>
                  </div>
                )}
                {licenseInfo.country && (
                  <div>
                    <p className="text-sm font-semibold text-[var(--neumorphic-muted)]">Country</p>
                    <p className="text-[var(--neumorphic-text)]">{licenseInfo.country}</p>
                  </div>
                )}
                {licenseInfo.expiryDate && (
                  <div>
                    <p className="text-sm font-semibold text-[var(--neumorphic-muted)]">Expiry Date</p>
                    <p className="text-[var(--neumorphic-text)]">{licenseInfo.expiryDate}</p>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-[var(--neumorphic-muted)]">No license information provided</p>
            )}
          </NeumorphicCard>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <NeumorphicCard variant="raised" className="p-6">
            <h2 className="text-xl font-bold text-[var(--neumorphic-text)] mb-4">Languages Spoken</h2>
            {languages && languages.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {languages.map((lang: string, idx: number) => (
                  <Badge key={idx} className="bg-teal-500 text-white">{lang}</Badge>
                ))}
              </div>
            ) : (
              <p className="text-[var(--neumorphic-muted)]">No languages specified</p>
            )}
          </NeumorphicCard>

          <NeumorphicCard variant="raised" className="p-6">
            <h2 className="text-xl font-bold text-[var(--neumorphic-text)] mb-4">Consultation Preferences</h2>
            {preferences && Object.keys(preferences).length > 0 ? (
              <div className="space-y-3">
                {preferences.consultTypes && preferences.consultTypes.length > 0 && (
                  <div>
                    <p className="text-sm font-semibold text-[var(--neumorphic-muted)] mb-2">Consult Types</p>
                    <div className="flex flex-wrap gap-2">
                      {preferences.consultTypes.map((type: string, idx: number) => (
                        <Badge key={idx} className="bg-emerald-500 text-white">{type}</Badge>
                      ))}
                    </div>
                  </div>
                )}
                {preferences.availability && preferences.availability.length > 0 && (
                  <div>
                    <p className="text-sm font-semibold text-[var(--neumorphic-muted)] mb-2">Availability</p>
                    <div className="flex flex-wrap gap-2">
                      {preferences.availability.map((avail: string, idx: number) => (
                        <Badge key={idx} className="bg-blue-500 text-white">{avail}</Badge>
                      ))}
                    </div>
                  </div>
                )}
                {(!preferences.consultTypes || preferences.consultTypes.length === 0) && 
                 (!preferences.availability || preferences.availability.length === 0) && (
                  <p className="text-[var(--neumorphic-muted)]">No preferences specified</p>
                )}
              </div>
            ) : (
              <p className="text-[var(--neumorphic-muted)]">No preferences specified</p>
            )}
          </NeumorphicCard>
        </div>

        <NeumorphicCard variant="raised" className="p-6">
          <h2 className="text-xl font-bold text-[var(--neumorphic-text)] mb-4">Portfolio</h2>
          {portfolio && portfolio.length > 0 ? (
            <div className="space-y-4">
              {portfolio.map((item: any, idx: number) => (
                <div key={idx} className="p-4 rounded-lg bg-[var(--neumorphic-surface)] space-y-2">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-[var(--neumorphic-text)]">{item.title || `Portfolio Item ${idx + 1}`}</p>
                      {item.description && (
                        <p className="text-sm text-[var(--neumorphic-muted)] mt-1 whitespace-pre-wrap">{item.description}</p>
                      )}
                      {item.url && (
                        <a
                          href={item.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-teal-500 hover:underline mt-1 inline-block"
                        >
                          View Link →
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-[var(--neumorphic-muted)]">No portfolio items</p>
          )}
        </NeumorphicCard>

        <NeumorphicCard variant="raised" className="p-6">
          <h2 className="text-xl font-bold text-[var(--neumorphic-text)] mb-4">Social Media & Links</h2>
          {socialMedia && Object.keys(socialMedia).length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {socialMedia.linkedin && (
                <div>
                  <p className="text-sm font-semibold text-[var(--neumorphic-muted)]">LinkedIn</p>
                  <a
                    href={socialMedia.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-teal-500 hover:underline break-all"
                  >
                    {socialMedia.linkedin}
                  </a>
                </div>
              )}
              {socialMedia.website && (
                <div>
                  <p className="text-sm font-semibold text-[var(--neumorphic-muted)]">Website</p>
                  <a
                    href={socialMedia.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-teal-500 hover:underline break-all"
                  >
                    {socialMedia.website}
                  </a>
                </div>
              )}
              {socialMedia.instagram && (
                <div>
                  <p className="text-sm font-semibold text-[var(--neumorphic-muted)]">Instagram</p>
                  <a
                    href={socialMedia.instagram}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-teal-500 hover:underline break-all"
                  >
                    {socialMedia.instagram}
                  </a>
                </div>
              )}
              {socialMedia.facebook && (
                <div>
                  <p className="text-sm font-semibold text-[var(--neumorphic-muted)]">Facebook</p>
                  <a
                    href={socialMedia.facebook}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-teal-500 hover:underline break-all"
                  >
                    {socialMedia.facebook}
                  </a>
                </div>
              )}
              {socialMedia.twitter && (
                <div>
                  <p className="text-sm font-semibold text-[var(--neumorphic-muted)]">TikTok</p>
                  <a
                    href={socialMedia.twitter}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-teal-500 hover:underline break-all"
                  >
                    {socialMedia.twitter}
                  </a>
                </div>
              )}
            </div>
          ) : (
            <p className="text-[var(--neumorphic-muted)]">No social media links provided</p>
          )}
        </NeumorphicCard>

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

