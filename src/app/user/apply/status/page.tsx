'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { 
  ArrowLeft,
  Clock,
  CheckCircle,
  XCircle,
  FileText,
  Download,
  AlertCircle,
  Award,
  Globe,
  Briefcase,
  RefreshCw,
  Sparkles,
  User,
  Target
} from 'lucide-react';
import { apiClient, TrainerApplication } from '@/lib/api-client';
import { toast } from 'sonner';

const STATUS_CONFIG = {
  pending: {
    label: 'Pending Review',
    description: 'Your application is waiting to be reviewed by our team',
    color: 'bg-yellow-100 text-yellow-800 border-yellow-300',
    icon: Clock
  },
  under_review: {
    label: 'Under Review',
    description: 'Our team is currently reviewing your application',
    color: 'bg-blue-100 text-blue-800 border-blue-300',
    icon: FileText
  },
  approved: {
    label: 'Approved',
    description: 'Congratulations! Your application has been approved',
    color: 'bg-green-100 text-green-800 border-green-300',
    icon: CheckCircle
  },
  rejected: {
    label: 'Rejected',
    description: 'Unfortunately, your application was not approved at this time',
    color: 'bg-red-100 text-red-800 border-red-300',
    icon: XCircle
  }
};

export default function ApplicationStatusPage() {
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();
  const [application, setApplication] = useState<TrainerApplication | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && user) {
      fetchApplicationStatus();
    }
  }, [authLoading, user]);

  const fetchApplicationStatus = async () => {
    try {
      setLoading(true);
      const response = await apiClient.getApplicationStatus();

      if (response.success && response.data) {
        setApplication(response.data as TrainerApplication);
      } else {
        toast.error('No application found');
        router.push('/user/apply');
      }
    } catch (error) {
      console.error('Error fetching application status:', error);
      toast.error('Failed to load application status');
      router.push('/user/apply');
    } finally {
      setLoading(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading application status...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-600">
              <AlertCircle className="w-5 h-5" />
              Authentication Required
            </CardTitle>
            <CardDescription>
              You must be logged in to view your application status.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => router.push('/login')} className="w-full">
              Go to Login
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!application) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-gray-700">
              <FileText className="w-5 h-5" />
              No Application Found
            </CardTitle>
            <CardDescription>
              You haven't submitted a trainer application yet.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => router.push('/user/apply')} className="w-full">
              Apply Now
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const config = STATUS_CONFIG[application.status as keyof typeof STATUS_CONFIG] || STATUS_CONFIG.pending;
  const Icon = config.icon;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-4rem)] p-4">
      <div className="w-full max-w-4xl">
        {/*  Refresh Buttons */}
        <div className="flex items-center justify-between mb-8">
          <Button
            variant="outline"
            onClick={fetchApplicationStatus}
            disabled={loading}
            className="flex items-center h-12 px-6 bg-white/80 hover:bg-white border-2 border-gray-200 hover:border-emerald-500 text-gray-700 hover:text-emerald-700 transition-all duration-300 shadow-lg"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>

        {/* Animated Header */}
        <div className="text-center mb-8">
          <div className="relative mx-auto w-20 h-20 mb-6">
            <div className="absolute inset-0 bg-gradient-to-r from-emerald-400 via-emerald-500 to-emerald-600 rounded-2xl rotate-3 animate-pulse"></div>
            <div className="relative w-full h-full bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-2xl flex items-center justify-center shadow-2xl">
              <Icon className="w-10 h-10 text-white" />
            </div>
            <div className="absolute -top-1 -right-1 w-6 h-6 bg-yellow-400 rounded-full flex items-center justify-center">
              <Sparkles className="w-3 h-3 text-yellow-800" />
            </div>
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-white via-emerald-100 to-white bg-clip-text text-transparent mb-3">
            Application Status
          </h1>
          <p className="text-emerald-100/80 text-lg">
            Track your <span className="font-semibold text-emerald-300">trainer application progress</span>
          </p>
        </div>

        {/* Status Card with Glow Effect */}
        <Card className="relative shadow-2xl border-0 bg-white/95 backdrop-blur-xl overflow-hidden mb-6">
          {/* Card Glow Effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/10 via-transparent to-blue-500/10"></div>
          
          <CardHeader className="relative space-y-1 pb-6 pt-8">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2 text-2xl font-bold text-gray-900">
                  <Icon className="h-6 w-6" />
                  Application Status
                </CardTitle>
                <CardDescription className="text-gray-600">{config.description}</CardDescription>
              </div>
              <Badge className={`${config.color} text-sm font-semibold px-4 py-2`}>
                {config.label}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label className="text-sm font-medium text-gray-500">Submitted</Label>
                <p className="text-sm">{formatDate(application.submittedAt)}</p>
              </div>
              {application.reviewedAt && (
                <div>
                  <Label className="text-sm font-medium text-gray-500">Reviewed</Label>
                  <p className="text-sm">{formatDate(application.reviewedAt)}</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Rejection Reason Card */}
        {application.status === 'rejected' && application.rejectionReason && (
          <Card className="mb-6 border-red-200">
            <CardHeader>
              <CardTitle className="text-red-800 flex items-center gap-2">
                <XCircle className="h-5 w-5" />
                Rejection Reason
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700">{application.rejectionReason}</p>
              {application.adminNotes && (
                <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                  <Label className="text-sm font-medium text-gray-500">Admin Notes</Label>
                  <p className="text-sm text-gray-700 mt-1">{application.adminNotes}</p>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Approved Success Card */}
        {application.status === 'approved' && (
          <Card className="mb-6 border-green-200">
            <CardHeader>
              <CardTitle className="text-green-800 flex items-center gap-2">
                <CheckCircle className="h-5 w-5" />
                Congratulations!
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 mb-4">
                Your application has been approved! You can now access the trainer dashboard and start creating content.
              </p>
              <Button onClick={() => router.push('/trainer/dashboard')} className="bg-green-600 hover:bg-green-700">
                Go to Trainer Dashboard
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Application Details */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Application Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Professional Information */}
            <div>
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Award className="h-5 w-5" />
                Professional Information
              </h3>
              <div className="space-y-4">
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
                    <p className="text-sm">{application.yearsOfExperience}</p>
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
                    <p className="text-sm text-gray-700 mt-1">{application.bio}</p>
                  </div>
                )}
              </div>
            </div>

            <div className="border-t border-gray-200 my-4" />

            {/* Certifications */}
            {application.certifications && Array.isArray(application.certifications) && application.certifications.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold mb-4">Certifications</h3>
                <div className="space-y-3">
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
                </div>
              </div>
            )}

            {application.certifications && Array.isArray(application.certifications) && application.certifications.length > 0 && (
              <div className="border-t border-gray-200 my-4" />
            )}

            {/* Certification Files */}
            {application.certificationFiles && Array.isArray(application.certificationFiles) && application.certificationFiles.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold mb-4">Certification Files</h3>
                <div className="space-y-3">
                  {application.certificationFiles.map((file, index) => (
                    <div key={index} className="p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <FileText className="w-6 h-6 text-blue-600" />
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
                        >
                          <Download className="w-4 h-4 mr-1" />
                          Download
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {application.certificationFiles && Array.isArray(application.certificationFiles) && application.certificationFiles.length > 0 && (
              <div className="border-t border-gray-200 my-4" />
            )}

            {/* Portfolio */}
            {application.portfolio && Array.isArray(application.portfolio) && application.portfolio.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold mb-4">Portfolio</h3>
                <div className="space-y-3">
                  {application.portfolio.map((item, index) => (
                    <div key={index} className="p-4 border rounded-lg">
                      <div>
                        <Label className="text-sm font-medium text-gray-500">Title</Label>
                        <p className="text-sm font-medium">{item.title}</p>
                      </div>
                      <div className="mt-2">
                        <Label className="text-sm font-medium text-gray-500">Description</Label>
                        <p className="text-sm text-gray-700">{item.description}</p>
                      </div>
                      {item.url && (
                        <div className="mt-2">
                          <Label className="text-sm font-medium text-gray-500">URL</Label>
                          <a 
                            href={item.url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-sm text-blue-600 hover:underline"
                          >
                            {item.url}
                          </a>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {application.portfolio && Array.isArray(application.portfolio) && application.portfolio.length > 0 && (
              <div className="border-t border-gray-200 my-4" />
            )}

            {/* Social Media */}
            {application.socialMedia && Object.keys(application.socialMedia).length > 0 && (
              <div>
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Globe className="h-5 w-5" />
                  Social Media
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {application.socialMedia.instagram && (
                    <div>
                      <Label className="text-sm font-medium text-gray-500">Instagram</Label>
                      <p className="text-sm">{application.socialMedia.instagram}</p>
                    </div>
                  )}
                  {application.socialMedia.facebook && (
                    <div>
                      <Label className="text-sm font-medium text-gray-500">Facebook</Label>
                      <p className="text-sm">{application.socialMedia.facebook}</p>
                    </div>
                  )}
                  {application.socialMedia.twitter && (
                    <div>
                      <Label className="text-sm font-medium text-gray-500">Twitter/X</Label>
                      <p className="text-sm">{application.socialMedia.twitter}</p>
                    </div>
                  )}
                  {application.socialMedia.linkedin && (
                    <div>
                      <Label className="text-sm font-medium text-gray-500">LinkedIn</Label>
                      <p className="text-sm">{application.socialMedia.linkedin}</p>
                    </div>
                  )}
                  {application.socialMedia.website && (
                    <div className="md:col-span-2">
                      <Label className="text-sm font-medium text-gray-500">Website</Label>
                      <a 
                        href={application.socialMedia.website} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-sm text-blue-600 hover:underline"
                      >
                        {application.socialMedia.website}
                      </a>
                    </div>
                  )}
                </div>
              </div>
            )}

            {application.socialMedia && Object.keys(application.socialMedia).length > 0 && (
              <div className="border-t border-gray-200 my-4" />
            )}

            {/* Content Preferences */}
            {application.preferences && (
              <div>
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  Content Preferences
                </h3>
                <div className="space-y-4">
                  {application.preferences.contentTypes && application.preferences.contentTypes.length > 0 && (
                    <div>
                      <Label className="text-sm font-medium text-gray-500">Content Types</Label>
                      <div className="flex flex-wrap gap-2 mt-1">
                        {application.preferences.contentTypes.map((type, index) => (
                          <Badge key={index} variant="secondary">{type}</Badge>
                        ))}
                      </div>
                    </div>
                  )}
                  {application.preferences.targetAudience && application.preferences.targetAudience.length > 0 && (
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
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

