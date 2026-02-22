'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { NeumorphicCard } from '@/components/user/NeumorphicCard';
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
    color: 'bg-yellow-500/20 text-yellow-700 border-yellow-500/30 dark:text-yellow-400',
    icon: Clock
  },
  under_review: {
    label: 'Under Review',
    description: 'Our team is currently reviewing your application',
    color: 'bg-blue-500/20 text-blue-700 border-blue-500/30 dark:text-blue-400',
    icon: FileText
  },
  approved: {
    label: 'Approved',
    description: 'Congratulations! Your application has been approved',
    color: 'bg-green-500/20 text-green-700 border-green-500/30 dark:text-green-400',
    icon: CheckCircle
  },
  rejected: {
    label: 'Rejected',
    description: 'Unfortunately, your application was not approved at this time',
    color: 'bg-red-500/20 text-red-700 border-red-500/30 dark:text-red-400',
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
        //router.push('/user/apply');
      }
    } catch (error) {
      console.error('Error fetching application status:', error);
      toast.error('Failed to load application status');
      //router.push('/user/apply');
    } finally {
      setLoading(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-[var(--neumorphic-bg)] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-600 mx-auto"></div>
          <p className="mt-4 text-[var(--neumorphic-muted)]">Loading application status...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-[var(--neumorphic-bg)] flex items-center justify-center p-4">
        <NeumorphicCard variant="raised" size="lg" className="max-w-md">
          <div className="text-center space-y-4">
            <div className="w-16 h-16 bg-gradient-to-br from-red-500 to-orange-500 rounded-2xl flex items-center justify-center mx-auto">
              <AlertCircle className="h-8 w-8 text-white" />
            </div>
            <h3 className="text-xl font-bold text-[var(--neumorphic-text)]">Authentication Required</h3>
            <p className="text-[var(--neumorphic-muted)]">
              You must be logged in to view your application status.
            </p>
            <Button onClick={() => router.push('/login')} className="w-full bg-gradient-to-r from-cyan-500 to-purple-600">
              Go to Login
            </Button>
          </div>
        </NeumorphicCard>
      </div>
    );
  }

  if (!application) {
    return (
      <div className="min-h-screen bg-[var(--neumorphic-bg)] flex items-center justify-center p-4">
        <NeumorphicCard variant="raised" size="lg" className="max-w-md">
          <div className="text-center space-y-4">
            <div className="w-16 h-16 bg-gradient-to-br from-gray-500 to-gray-600 rounded-2xl flex items-center justify-center mx-auto">
              <FileText className="h-8 w-8 text-white" />
            </div>
            <h3 className="text-xl font-bold text-[var(--neumorphic-text)]">No Application Found</h3>
            <p className="text-[var(--neumorphic-muted)]">
              You haven't submitted a trainer application yet.
            </p>
            <Button onClick={() => router.push('/user/apply')} className="w-full bg-gradient-to-r from-cyan-500 to-purple-600">
              Apply Now
            </Button>
          </div>
        </NeumorphicCard>
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
    <div className="min-h-screen bg-[var(--neumorphic-bg)]">
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 via-purple-500/10 to-pink-500/10" />
        <div className="relative px-4 md:px-8 py-12">
          <div className="max-w-4xl mx-auto">
            {/* Header */}
            <div className="text-center mb-8">
              <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-cyan-500 to-purple-600 text-white px-4 py-2 rounded-full text-sm font-medium mb-4">
                <Award className="w-4 h-4" />
                <span>Application Status</span>
              </div>
              <h1 className="text-4xl md:text-5xl font-bold text-[var(--neumorphic-text)] mb-4">
                Track Your Application
              </h1>
              <p className="text-xl text-[var(--neumorphic-muted)] max-w-2xl mx-auto">
                Monitor your trainer application progress
              </p>
            </div>

            {/* Refresh Button */}
            <div className="flex justify-end mb-6">
              <Button
                variant="outline"
                onClick={fetchApplicationStatus}
                disabled={loading}
                className="flex items-center border-[var(--neumorphic-border)] bg-[var(--neumorphic-surface)] text-[var(--neumorphic-text)]"
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
            </div>

            {/* Status Card */}
            <NeumorphicCard variant="raised" size="lg" className="mb-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className={`w-16 h-16 rounded-2xl flex items-center justify-center ${config.color}`}>
                      <Icon className="h-8 w-8" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-[var(--neumorphic-text)]">Application Status</h3>
                      <p className="text-[var(--neumorphic-muted)]">{config.description}</p>
                    </div>
                  </div>
                  <Badge className={`${config.color} text-sm font-semibold px-4 py-2`}>
                    {config.label}
                  </Badge>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-[var(--neumorphic-border)]">
                  <div>
                    <Label className="text-sm font-medium text-[var(--neumorphic-muted)]">Submitted</Label>
                    <p className="text-sm text-[var(--neumorphic-text)] mt-1">{formatDate(application.submittedAt)}</p>
                  </div>
                  {application.reviewedAt && (
                    <div>
                      <Label className="text-sm font-medium text-[var(--neumorphic-muted)]">Reviewed</Label>
                      <p className="text-sm text-[var(--neumorphic-text)] mt-1">{formatDate(application.reviewedAt)}</p>
                    </div>
                  )}
                </div>
              </div>
            </NeumorphicCard>

            {/* Rejection Reason Card */}
            {application.status === 'rejected' && application.rejectionReason && (
              <NeumorphicCard variant="raised" className="mb-6 border-red-500/30">
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <XCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
                    <h3 className="text-lg font-bold text-[var(--neumorphic-text)]">Rejection Reason</h3>
                  </div>
                  <p className="text-[var(--neumorphic-text)]">{application.rejectionReason}</p>
                  {application.adminNotes && (
                    <div className="mt-4 p-4 bg-[var(--neumorphic-surface)] rounded-xl">
                      <Label className="text-sm font-medium text-[var(--neumorphic-muted)]">Admin Notes</Label>
                      <p className="text-sm text-[var(--neumorphic-text)] mt-1">{application.adminNotes}</p>
                    </div>
                  )}
                </div>
              </NeumorphicCard>
            )}

            {/* Approved Success Card */}
            {application.status === 'approved' && (
              <NeumorphicCard variant="raised" className="mb-6 border-green-500/30">
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
                    <h3 className="text-lg font-bold text-[var(--neumorphic-text)]">Congratulations!</h3>
                  </div>
                  <p className="text-[var(--neumorphic-text)]">
                    Your application has been approved! You can now access the trainer dashboard and start creating content.
                  </p>
                  <Button 
                    onClick={() => router.push('/trainer/dashboard')} 
                    className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white"
                  >
                    Go to Trainer Dashboard
                  </Button>
                </div>
              </NeumorphicCard>
            )}

            {/* Application Details */}
            <NeumorphicCard variant="raised" size="lg">
              <div className="space-y-6">
                <div className="flex items-center gap-2 mb-6">
                  <FileText className="h-5 w-5 text-[var(--neumorphic-text)]" />
                  <h3 className="text-xl font-bold text-[var(--neumorphic-text)]">Application Details</h3>
                </div>

                {/* Professional Information */}
                <div>
                  <h4 className="text-lg font-semibold mb-4 flex items-center gap-2 text-[var(--neumorphic-text)]">
                    <Award className="h-5 w-5" />
                    Professional Information
                  </h4>
                  <div className="space-y-4">
                    {application.specialties && application.specialties.length > 0 && (
                      <div>
                        <Label className="text-sm font-medium text-[var(--neumorphic-muted)]">Specialties</Label>
                        <div className="flex flex-wrap gap-2 mt-1">
                          {application.specialties.map((specialty, index) => (
                            <Badge key={index} variant="secondary" className="bg-[var(--neumorphic-surface)] text-[var(--neumorphic-text)] border-[var(--neumorphic-border)]">{specialty}</Badge>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {application.yearsOfExperience && (
                      <div>
                        <Label className="text-sm font-medium text-[var(--neumorphic-muted)]">Years of Experience</Label>
                        <p className="text-sm text-[var(--neumorphic-text)] mt-1">{application.yearsOfExperience}</p>
                      </div>
                    )}

                    {application.languages && application.languages.length > 0 && (
                      <div>
                        <Label className="text-sm font-medium text-[var(--neumorphic-muted)]">Languages</Label>
                        <div className="flex flex-wrap gap-2 mt-1">
                          {application.languages.map((language, index) => (
                            <Badge key={index} variant="outline" className="border-[var(--neumorphic-border)] text-[var(--neumorphic-text)]">{language}</Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {application.bio && (
                      <div>
                        <Label className="text-sm font-medium text-[var(--neumorphic-muted)]">Bio</Label>
                        <p className="text-sm text-[var(--neumorphic-text)] mt-1">{application.bio}</p>
                      </div>
                    )}
                  </div>
                </div>

                <div className="border-t border-[var(--neumorphic-border)] my-4" />

                {/* Certifications */}
                {application.certifications && Array.isArray(application.certifications) && application.certifications.length > 0 && (
                  <>
                    <div>
                      <h4 className="text-lg font-semibold mb-4 text-[var(--neumorphic-text)]">Certifications</h4>
                      <div className="space-y-3">
                        {application.certifications.map((cert, index) => (
                          <NeumorphicCard key={index} variant="raised" className="p-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div>
                                <Label className="text-sm font-medium text-[var(--neumorphic-muted)]">Certification</Label>
                                <p className="text-sm font-medium text-[var(--neumorphic-text)] mt-1">{cert.name}</p>
                              </div>
                              <div>
                                <Label className="text-sm font-medium text-[var(--neumorphic-muted)]">Issuer</Label>
                                <p className="text-sm text-[var(--neumorphic-text)] mt-1">{cert.issuer}</p>
                              </div>
                              <div>
                                <Label className="text-sm font-medium text-[var(--neumorphic-muted)]">Issue Date</Label>
                                <p className="text-sm text-[var(--neumorphic-text)] mt-1">{new Date(cert.date).toLocaleDateString()}</p>
                              </div>
                              {cert.expiry && (
                                <div>
                                  <Label className="text-sm font-medium text-[var(--neumorphic-muted)]">Expiry Date</Label>
                                  <p className="text-sm text-[var(--neumorphic-text)] mt-1">{new Date(cert.expiry).toLocaleDateString()}</p>
                                </div>
                              )}
                            </div>
                          </NeumorphicCard>
                        ))}
                      </div>
                    </div>
                    <div className="border-t border-[var(--neumorphic-border)] my-4" />
                  </>
                )}

                {/* Certification Files */}
                {application.certificationFiles && Array.isArray(application.certificationFiles) && application.certificationFiles.length > 0 && (
                  <>
                    <div>
                      <h4 className="text-lg font-semibold mb-4 text-[var(--neumorphic-text)]">Certification Files</h4>
                      <div className="space-y-3">
                        {application.certificationFiles.map((file, index) => (
                          <NeumorphicCard key={index} variant="raised" className="p-4">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <FileText className="w-6 h-6 text-cyan-600" />
                                <div>
                                  <p className="font-medium text-[var(--neumorphic-text)]">{file.fileName}</p>
                                  <p className="text-sm text-[var(--neumorphic-muted)]">
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
                                className="border-[var(--neumorphic-border)]"
                              >
                                <Download className="w-4 h-4 mr-1" />
                                Download
                              </Button>
                            </div>
                          </NeumorphicCard>
                        ))}
                      </div>
                    </div>
                    <div className="border-t border-[var(--neumorphic-border)] my-4" />
                  </>
                )}

                {/* Portfolio */}
                {application.portfolio && Array.isArray(application.portfolio) && application.portfolio.length > 0 && (
                  <>
                    <div>
                      <h4 className="text-lg font-semibold mb-4 text-[var(--neumorphic-text)]">Portfolio</h4>
                      <div className="space-y-3">
                        {application.portfolio.map((item, index) => (
                          <NeumorphicCard key={index} variant="raised" className="p-4">
                            <div>
                              <Label className="text-sm font-medium text-[var(--neumorphic-muted)]">Title</Label>
                              <p className="text-sm font-medium text-[var(--neumorphic-text)] mt-1">{item.title}</p>
                            </div>
                            <div className="mt-2">
                              <Label className="text-sm font-medium text-[var(--neumorphic-muted)]">Description</Label>
                              <p className="text-sm text-[var(--neumorphic-text)] mt-1">{item.description}</p>
                            </div>
                            {item.url && (
                              <div className="mt-2">
                                <Label className="text-sm font-medium text-[var(--neumorphic-muted)]">URL</Label>
                                <a 
                                  href={item.url} 
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  className="text-sm text-cyan-600 hover:underline block mt-1"
                                >
                                  {item.url}
                                </a>
                              </div>
                            )}
                          </NeumorphicCard>
                        ))}
                      </div>
                    </div>
                    <div className="border-t border-[var(--neumorphic-border)] my-4" />
                  </>
                )}

                {/* Social Media */}
                {application.socialMedia && Object.keys(application.socialMedia).length > 0 && (
                  <>
                    <div>
                      <h4 className="text-lg font-semibold mb-4 flex items-center gap-2 text-[var(--neumorphic-text)]">
                        <Globe className="h-5 w-5" />
                        Social Media
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {application.socialMedia.instagram && (
                          <div>
                            <Label className="text-sm font-medium text-[var(--neumorphic-muted)]">Instagram</Label>
                            <p className="text-sm text-[var(--neumorphic-text)] mt-1">{application.socialMedia.instagram}</p>
                          </div>
                        )}
                        {application.socialMedia.facebook && (
                          <div>
                            <Label className="text-sm font-medium text-[var(--neumorphic-muted)]">Facebook</Label>
                            <p className="text-sm text-[var(--neumorphic-text)] mt-1">{application.socialMedia.facebook}</p>
                          </div>
                        )}
                        {application.socialMedia.twitter && (
                          <div>
                            <Label className="text-sm font-medium text-[var(--neumorphic-muted)]">Twitter/X</Label>
                            <p className="text-sm text-[var(--neumorphic-text)] mt-1">{application.socialMedia.twitter}</p>
                          </div>
                        )}
                        {application.socialMedia.linkedin && (
                          <div>
                            <Label className="text-sm font-medium text-[var(--neumorphic-muted)]">LinkedIn</Label>
                            <p className="text-sm text-[var(--neumorphic-text)] mt-1">{application.socialMedia.linkedin}</p>
                          </div>
                        )}
                        {application.socialMedia.website && (
                          <div className="md:col-span-2">
                            <Label className="text-sm font-medium text-[var(--neumorphic-muted)]">Website</Label>
                            <a 
                              href={application.socialMedia.website} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-sm text-cyan-600 hover:underline block mt-1"
                            >
                              {application.socialMedia.website}
                            </a>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="border-t border-[var(--neumorphic-border)] my-4" />
                  </>
                )}

                {/* Content Preferences */}
                {application.preferences && (
                  <div>
                    <h4 className="text-lg font-semibold mb-4 flex items-center gap-2 text-[var(--neumorphic-text)]">
                      <Target className="h-5 w-5" />
                      Content Preferences
                    </h4>
                    <div className="space-y-4">
                      {application.preferences.contentTypes && application.preferences.contentTypes.length > 0 && (
                        <div>
                          <Label className="text-sm font-medium text-[var(--neumorphic-muted)]">Content Types</Label>
                          <div className="flex flex-wrap gap-2 mt-1">
                            {application.preferences.contentTypes.map((type, index) => (
                              <Badge key={index} variant="secondary" className="bg-[var(--neumorphic-surface)] text-[var(--neumorphic-text)] border-[var(--neumorphic-border)]">{type}</Badge>
                            ))}
                          </div>
                        </div>
                      )}
                      {application.preferences.targetAudience && application.preferences.targetAudience.length > 0 && (
                        <div>
                          <Label className="text-sm font-medium text-[var(--neumorphic-muted)]">Target Audience</Label>
                          <div className="flex flex-wrap gap-2 mt-1">
                            {application.preferences.targetAudience.map((audience, index) => (
                              <Badge key={index} variant="outline" className="border-[var(--neumorphic-border)] text-[var(--neumorphic-text)]">{audience}</Badge>
                            ))}
                          </div>
                        </div>
                      )}
                      {application.preferences.experienceLevel && (
                        <div>
                          <Label className="text-sm font-medium text-[var(--neumorphic-muted)]">Experience Level</Label>
                          <p className="text-sm text-[var(--neumorphic-text)] mt-1">{application.preferences.experienceLevel}</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </NeumorphicCard>
          </div>
        </div>
      </div>
    </div>
  );
}
