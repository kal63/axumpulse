'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { 
  ArrowLeft,
  CheckCircle,
  XCircle,
  Clock,
  FileText,
  User,
  Mail,
  Phone,
  Calendar,
  Award,
  Globe,
  Briefcase,
  Download,
  AlertCircle
} from 'lucide-react';
import { apiClient, TrainerApplication } from '@/lib/api-client';
import { toast } from 'sonner';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

const STATUS_CONFIG = {
  pending: {
    label: 'Pending Review',
    color: 'bg-yellow-100 text-yellow-800 border-yellow-300',
    icon: Clock
  },
  under_review: {
    label: 'Under Review',
    color: 'bg-blue-100 text-blue-800 border-blue-300',
    icon: FileText
  },
  approved: {
    label: 'Approved',
    color: 'bg-green-100 text-green-800 border-green-300',
    icon: CheckCircle
  },
  rejected: {
    label: 'Rejected',
    color: 'bg-red-100 text-red-800 border-red-300',
    icon: XCircle
  }
};

export default function TrainerApplicationDetailPage() {
  const router = useRouter();
  const params = useParams();
  const id = parseInt(params.id as string);

  const [application, setApplication] = useState<TrainerApplication | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  
  // Modal states
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [adminNotes, setAdminNotes] = useState('');

  const fetchApplication = async () => {
    try {
      setLoading(true);
      const response = await apiClient.getTrainerApplication(id);

      if (response.success && response.data) {
        setApplication(response.data as TrainerApplication);
        setAdminNotes(response.data.adminNotes || '');
      } else {
        toast.error(response.error?.message || 'Failed to fetch application');
        router.push('/admin/trainer-applications');
      }
    } catch (error) {
      console.error('Error fetching application:', error);
      toast.error('An error occurred while fetching the application');
      router.push('/admin/trainer-applications');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchApplication();
    }
  }, [id]);

  const handleApprove = async () => {
    try {
      setActionLoading(true);
      const response = await apiClient.approveTrainerApplication(id, adminNotes);

      if (response.success) {
        toast.success('Application approved successfully!');
        setShowApproveModal(false);
        await fetchApplication();
      } else {
        toast.error(response.error?.message || 'Failed to approve application');
      }
    } catch (error) {
      console.error('Error approving application:', error);
      toast.error('An error occurred while approving the application');
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async () => {
    if (!rejectionReason.trim()) {
      toast.error('Please provide a rejection reason');
      return;
    }

    try {
      setActionLoading(true);
      const response = await apiClient.rejectTrainerApplication(id, rejectionReason, adminNotes);

      if (response.success) {
        toast.success('Application rejected');
        setShowRejectModal(false);
        setRejectionReason('');
        await fetchApplication();
      } else {
        toast.error(response.error?.message || 'Failed to reject application');
      }
    } catch (error) {
      console.error('Error rejecting application:', error);
      toast.error('An error occurred while rejecting the application');
    } finally {
      setActionLoading(false);
    }
  };

  const handleSaveNotes = async () => {
    try {
      const response = await apiClient.updateApplicationNotes(id, adminNotes);

      if (response.success) {
        toast.success('Admin notes saved');
      } else {
        toast.error(response.error?.message || 'Failed to save notes');
      }
    } catch (error) {
      console.error('Error saving notes:', error);
      toast.error('An error occurred while saving notes');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading application...</p>
        </div>
      </div>
    );
  }

  if (!application) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <p className="text-gray-600">Application not found</p>
          <Button onClick={() => router.push('/admin/trainer-applications')} className="mt-4">
            Back to Applications
          </Button>
        </div>
      </div>
    );
  }

  const config = STATUS_CONFIG[application.status];
  const Icon = config.icon;

  return (
    <div className="p-6 space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.push('/admin/trainer-applications')}
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Trainer Application
            </h1>
            <p className="text-gray-500 mt-1">
              Review application details and take action
            </p>
          </div>
        </div>
        <Badge className={`${config.color} border text-lg px-4 py-2`}>
          <Icon className="w-5 h-5 mr-2" />
          {config.label}
        </Badge>
      </div>

      {/* Action Buttons */}
      {(application.status === 'pending' || application.status === 'under_review') && (
        <Card className="bg-gradient-to-r from-emerald-50 to-blue-50 border-2">
          <CardHeader>
            <CardTitle>Review Actions</CardTitle>
            <CardDescription>
              Approve or reject this trainer application
            </CardDescription>
          </CardHeader>
          <CardContent className="flex gap-4">
            <Button
              onClick={() => setShowApproveModal(true)}
              disabled={actionLoading}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              <CheckCircle className="w-4 h-4 mr-2" />
              Approve Application
            </Button>
            <Button
              onClick={() => setShowRejectModal(true)}
              disabled={actionLoading}
              variant="destructive"
            >
              <XCircle className="w-4 h-4 mr-2" />
              Reject Application
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Rejection Reason (if rejected) */}
      {application.status === 'rejected' && application.rejectionReason && (
        <Card className="bg-red-50 border-red-200">
          <CardHeader>
            <CardTitle className="text-red-800 flex items-center gap-2">
              <XCircle className="w-5 h-5" />
              Rejection Reason
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-red-700">{application.rejectionReason}</p>
          </CardContent>
        </Card>
      )}

      {/* Personal Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="w-5 h-5" />
            Personal Information
          </CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label className="text-sm font-medium text-gray-500">Full Name</Label>
            <p className="text-lg font-medium">{application.user?.name || 'N/A'}</p>
          </div>
          <div>
            <Label className="text-sm font-medium text-gray-500">Phone</Label>
            <p className="flex items-center gap-2">
              <Phone className="w-4 h-4 text-gray-400" />
              {application.user?.phone || 'N/A'}
            </p>
          </div>
          {application.user?.email && (
            <div>
              <Label className="text-sm font-medium text-gray-500">Email</Label>
              <p className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-gray-400" />
                {application.user.email}
              </p>
            </div>
          )}
          {application.user?.dateOfBirth && (
            <div>
              <Label className="text-sm font-medium text-gray-500">Date of Birth</Label>
              <p className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-gray-400" />
                {new Date(application.user.dateOfBirth).toLocaleDateString()}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Professional Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Briefcase className="w-5 h-5" />
            Professional Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {application.specialties && application.specialties.length > 0 && (
            <div>
              <Label className="text-sm font-medium text-gray-500">Specialties</Label>
              <div className="flex flex-wrap gap-2 mt-1">
                {application.specialties.map((specialty, index) => (
                  <Badge key={index} variant="secondary">{specialty}</Badge>
                ))}
              </div>
            </div>
          )}

          {application.yearsOfExperience && (
            <div>
              <Label className="text-sm font-medium text-gray-500">Years of Experience</Label>
              <p className="text-sm">{application.yearsOfExperience} years</p>
            </div>
          )}

          {application.languages && application.languages.length > 0 && (
            <div>
              <Label className="text-sm font-medium text-gray-500">Languages</Label>
              <div className="flex flex-wrap gap-2 mt-1">
                {application.languages.map((language, index) => (
                  <Badge key={index} variant="outline">{language}</Badge>
                ))}
              </div>
            </div>
          )}

          {application.bio && (
            <div>
              <Label className="text-sm font-medium text-gray-500">Bio</Label>
              <p className="text-sm mt-1 whitespace-pre-wrap">{application.bio}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Certifications */}
      {application.certifications && Array.isArray(application.certifications) && application.certifications.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="w-5 h-5" />
              Certifications
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {application.certifications.map((cert, index) => (
              <div key={index} className="p-4 border rounded-lg">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium text-gray-500">Certification</Label>
                    <p className="text-sm font-medium">{cert.name}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-500">Issuer</Label>
                    <p className="text-sm">{cert.issuer}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-500">Issue Date</Label>
                    <p className="text-sm">{new Date(cert.date).toLocaleDateString()}</p>
                  </div>
                  {cert.expiry && (
                    <div>
                      <Label className="text-sm font-medium text-gray-500">Expiry Date</Label>
                      <p className="text-sm">{new Date(cert.expiry).toLocaleDateString()}</p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Uploaded Certification Files */}
      {application.certificationFiles && Array.isArray(application.certificationFiles) && application.certificationFiles.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Uploaded Certification Files
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {application.certificationFiles.map((file, index) => (
              <div key={index} className="p-4 border rounded-lg bg-gray-50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <FileText className={`w-5 h-5 ${file.fileType === 'application/pdf' ? 'text-blue-600' : 'text-green-600'}`} />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{file.fileName}</p>
                      <p className="text-sm text-gray-500">
                        {file.fileType === 'application/pdf' ? 'PDF Document' : 'Image File'} • 
                        {(file.fileSize / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={async () => {
                      try {
                        const cleanFileUrl = file.fileUrl.replace('/api/v1', '');
                        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}${cleanFileUrl}`);
                        if (response.ok) {
                          const blob = await response.blob();
                          const url = window.URL.createObjectURL(blob);
                          const link = document.createElement('a');
                          link.href = url;
                          link.download = file.fileName;
                          document.body.appendChild(link);
                          link.click();
                          document.body.removeChild(link);
                          window.URL.revokeObjectURL(url);
                        } else {
                          toast.error('Failed to download file');
                        }
                      } catch (error) {
                        console.error('Download error:', error);
                        toast.error('Failed to download file');
                      }
                    }}
                    className="text-green-600 hover:text-green-800"
                  >
                    <Download className="w-4 h-4 mr-1" />
                    Download
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Portfolio */}
      {application.portfolio && Array.isArray(application.portfolio) && application.portfolio.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="w-5 h-5" />
              Portfolio
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {application.portfolio.map((item, index) => (
              <div key={index} className="p-4 border rounded-lg">
                <h4 className="font-medium">{item.title}</h4>
                <p className="text-sm text-gray-600 mt-1">{item.description}</p>
                {item.url && (
                  <a 
                    href={item.url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800 text-sm mt-2 inline-block"
                  >
                    View Project →
                  </a>
                )}
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Social Media */}
      {application.socialMedia && Object.keys(application.socialMedia).length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="w-5 h-5" />
              Social Media & Online Presence
            </CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {application.socialMedia.instagram && (
              <div>
                <Label className="text-sm font-medium text-gray-500">Instagram</Label>
                <a href={application.socialMedia.instagram} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline block">
                  {application.socialMedia.instagram}
                </a>
              </div>
            )}
            {application.socialMedia.facebook && (
              <div>
                <Label className="text-sm font-medium text-gray-500">Facebook</Label>
                <a href={application.socialMedia.facebook} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline block">
                  {application.socialMedia.facebook}
                </a>
              </div>
            )}
            {application.socialMedia.twitter && (
              <div>
                <Label className="text-sm font-medium text-gray-500">Twitter</Label>
                <a href={application.socialMedia.twitter} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline block">
                  {application.socialMedia.twitter}
                </a>
              </div>
            )}
            {application.socialMedia.linkedin && (
              <div>
                <Label className="text-sm font-medium text-gray-500">LinkedIn</Label>
                <a href={application.socialMedia.linkedin} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline block">
                  {application.socialMedia.linkedin}
                </a>
              </div>
            )}
            {application.socialMedia.website && (
              <div>
                <Label className="text-sm font-medium text-gray-500">Website</Label>
                <a href={application.socialMedia.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline block">
                  {application.socialMedia.website}
                </a>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Availability & Preferences */}
      {application.availability && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5" />
              Availability & Preferences
            </CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {application.availability.timezone && (
              <div>
                <Label className="text-sm font-medium text-gray-500">Timezone</Label>
                <p className="text-sm">{application.availability.timezone}</p>
              </div>
            )}
            {application.availability.workingHours && (
              <div>
                <Label className="text-sm font-medium text-gray-500">Working Hours</Label>
                <p className="text-sm">{application.availability.workingHours}</p>
              </div>
            )}
            {application.availability.preferredDays && Array.isArray(application.availability.preferredDays) && application.availability.preferredDays.length > 0 && (
              <div className="md:col-span-2">
                <Label className="text-sm font-medium text-gray-500">Preferred Days</Label>
                <div className="flex flex-wrap gap-2 mt-1">
                  {application.availability.preferredDays.map((day, index) => (
                    <Badge key={index} variant="outline">{day}</Badge>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Content Preferences */}
      {application.preferences && (
        <Card>
          <CardHeader>
            <CardTitle>Content Preferences</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {application.preferences.contentTypes && Array.isArray(application.preferences.contentTypes) && application.preferences.contentTypes.length > 0 && (
              <div>
                <Label className="text-sm font-medium text-gray-500">Content Types</Label>
                <div className="flex flex-wrap gap-2 mt-1">
                  {application.preferences.contentTypes.map((type, index) => (
                    <Badge key={index} variant="secondary">{type}</Badge>
                  ))}
                </div>
              </div>
            )}
            
            {application.preferences.targetAudience && Array.isArray(application.preferences.targetAudience) && application.preferences.targetAudience.length > 0 && (
              <div>
                <Label className="text-sm font-medium text-gray-500">Target Audience</Label>
                <div className="flex flex-wrap gap-2 mt-1">
                  {application.preferences.targetAudience.map((audience, index) => (
                    <Badge key={index} variant="outline">{audience}</Badge>
                  ))}
                </div>
              </div>
            )}

            {application.preferences.experienceLevel && (
              <div>
                <Label className="text-sm font-medium text-gray-500">Experience Level</Label>
                <p className="text-sm">{application.preferences.experienceLevel}</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Admin Notes */}
      <Card>
        <CardHeader>
          <CardTitle>Admin Notes</CardTitle>
          <CardDescription>
            Internal notes about this application (not visible to applicant)
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Textarea
            placeholder="Add your notes here..."
            value={adminNotes}
            onChange={(e) => setAdminNotes(e.target.value)}
            rows={4}
          />
          <Button onClick={handleSaveNotes}>
            Save Notes
          </Button>
        </CardContent>
      </Card>

      {/* Application Metadata */}
      <Card className="bg-gray-50">
        <CardHeader>
          <CardTitle className="text-sm">Application Information</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div>
            <Label className="text-xs text-gray-500">Application ID</Label>
            <p className="font-mono">#{application.id}</p>
          </div>
          <div>
            <Label className="text-xs text-gray-500">Submitted</Label>
            <p>{new Date(application.submittedAt).toLocaleDateString()}</p>
          </div>
          {application.reviewedAt && (
            <div>
              <Label className="text-xs text-gray-500">Reviewed</Label>
              <p>{new Date(application.reviewedAt).toLocaleDateString()}</p>
            </div>
          )}
          {application.reviewedBy && (
            <div>
              <Label className="text-xs text-gray-500">Reviewed By</Label>
              <p>Admin #{application.reviewedBy}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Approve Modal */}
      <AlertDialog open={showApproveModal} onOpenChange={setShowApproveModal}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-green-700">
              <CheckCircle className="w-5 h-5" />
              Approve Trainer Application
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to approve this trainer application for <strong>{application.user?.name || 'this applicant'}</strong>?
              This will create a verified trainer account and allow them to start creating content.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={actionLoading}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleApprove}
              disabled={actionLoading}
              className="bg-green-600 hover:bg-green-700"
            >
              {actionLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Approving...
                </>
              ) : (
                'Approve Application'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Reject Modal */}
      <AlertDialog open={showRejectModal} onOpenChange={setShowRejectModal}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-red-700">
              <XCircle className="w-5 h-5" />
              Reject Trainer Application
            </AlertDialogTitle>
            <AlertDialogDescription>
              Please provide a reason for rejecting this application. The applicant will receive this feedback.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="py-4">
            <Textarea
              placeholder="Enter rejection reason..."
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              rows={4}
              className="w-full"
            />
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={actionLoading}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleReject}
              disabled={actionLoading || !rejectionReason.trim()}
              className="bg-red-600 hover:bg-red-700"
            >
              {actionLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Rejecting...
                </>
              ) : (
                'Reject Application'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

