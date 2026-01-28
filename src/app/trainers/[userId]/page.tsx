'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { apiClient, PublicTrainerDetail, CertificationFile } from '@/lib/api-client';
import { getImageUrl } from '@/lib/upload-utils';
import { createSlug } from '@/lib/slug-utils';
import Header from '@/components/shared/header';
import Footer from '@/components/shared/footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  ArrowLeft, 
  User, 
  Mail, 
  Phone, 
  Calendar, 
  Award, 
  Globe, 
  Briefcase,
  FileText,
  CheckCircle,
  Loader2,
  UserPlus
} from 'lucide-react';
import Image from 'next/image';
import dynamic from 'next/dynamic';
import { motion } from 'framer-motion';
import '../pdf-viewer.css';

// Dynamically import react-pdf with SSR disabled to avoid DOMMatrix error
const PDFViewer = dynamic(
  () => import('./PDFViewer').then((mod) => mod.PDFViewer),
  { 
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 text-blue-400 animate-spin" />
      </div>
    )
  }
);

function CertificateDisplay({ file }: { file: CertificationFile }) {
  const isImage = file.fileType.startsWith('image/');
  // Check for PDF - handle both 'application/pdf' and 'pdf' formats
  const isPDF = file.fileType === 'application/pdf' || 
                file.fileType.toLowerCase() === 'pdf' ||
                file.fileType.toLowerCase().includes('pdf');
  const fileUrl = getImageUrl(file.fileUrl) || file.fileUrl;

  if (isImage) {
    return (
      <div className="w-full">
        <Image
          src={fileUrl}
          alt={file.fileName}
          width={1200}
          height={800}
          className="w-full h-auto rounded-lg object-contain"
          unoptimized
        />
      </div>
    );
  }

  if (isPDF) {
    return <PDFViewer fileUrl={file.fileUrl} fileName={file.fileName} />;
  }

  return (
    <div className="p-8 text-center text-white/60">
      <FileText className="w-12 h-12 mx-auto mb-4" />
      <p>Unsupported file type: {file.fileType}</p>
      <a
        href={fileUrl}
        download={file.fileName}
        className="mt-4 inline-block text-blue-400 hover:text-blue-300"
      >
        Download {file.fileName}
      </a>
    </div>
  );
}

export default function TrainerDetailPage() {
  const params = useParams();
  const router = useRouter();
  const userIdParam = params?.userId as string;
  
  const [trainer, setTrainer] = useState<PublicTrainerDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [urlUpdated, setUrlUpdated] = useState(false);

  useEffect(() => {
    if (!userIdParam) {
      setError('Invalid trainer ID');
      setLoading(false);
      return;
    }

    const userId = parseInt(userIdParam);
    if (isNaN(userId)) {
      setError('Invalid trainer ID');
      setLoading(false);
      return;
    }

    const fetchTrainer = async () => {
      try {
        setLoading(true);
        console.log('[TrainerDetailPage] Fetching trainer with userId:', userId);
        // Use userId for API call (reliable)
        const response = await apiClient.getPublicTrainerDetail(userId);
        console.log('[TrainerDetailPage] API response:', response);

        if (response.success && response.data) {
          setTrainer(response.data);
          
          // Update URL to show trainer name (pretty URL) without reloading
          // This is just for display - the actual route still uses userId
          if (!urlUpdated && typeof window !== 'undefined') {
            const slug = createSlug(response.data.user.name);
            const prettyUrl = `/trainers/${slug}`;
            // Update URL without reloading using replaceState
            // Store the userId in state so we can still use it if needed
            window.history.replaceState(
              { ...window.history.state, userId: userId, as: prettyUrl },
              '',
              prettyUrl
            );
            setUrlUpdated(true);
          }
        } else {
          console.error('[TrainerDetailPage] API Error:', response);
          const errorMessage = response.error?.message || response.error?.code || 'Failed to load trainer profile';
          
          if (response.error?.code === 'TRAINER_NOT_FOUND' || response.error?.status === 404) {
            setError(`Trainer not found (userId: ${userId}). The trainer may not be verified or may not exist.`);
          } else if (response.error?.code === 'NETWORK_ERROR' || response.error?.code === 'HTTP_ERROR') {
            setError(`Cannot connect to server: ${response.error?.message || 'Network error'}. Status: ${response.error?.status}`);
          } else {
            setError(`${errorMessage} (userId: ${userId})`);
          }
        }
      } catch (err) {
        console.error('Error fetching trainer:', err);
        setError('An error occurred while loading the trainer profile');
      } finally {
        setLoading(false);
      }
    };

    fetchTrainer();
  }, [userIdParam, urlUpdated]);

  const formatSpecialty = (specialty: string): string => {
    return specialty
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  const formatDate = (dateString?: string): string => {
    if (!dateString) return 'Not provided';
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch {
      return dateString;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900">
        <Header scrolled={false} showLogin={true} />
        <div className="flex items-center justify-center min-h-[80vh]">
          <Loader2 className="w-8 h-8 text-blue-400 animate-spin" />
        </div>
        <Footer />
      </div>
    );
  }

  if (error || !trainer) {
    return (
      <div className="min-h-screen bg-slate-900">
        <Header scrolled={false} showLogin={true} />
        <div className="container mx-auto px-4 py-20">
          <Card className="bg-slate-800 border-slate-700">
            <CardContent className="p-8 text-center">
              <p className="text-red-400 mb-4">{error || 'Trainer not found'}</p>
              <Button onClick={() => router.push('/')} variant="outline">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Home
              </Button>
            </CardContent>
          </Card>
        </div>
        <Footer />
      </div>
    );
  }

  const profileImageUrl = trainer.user.profilePicture 
    ? getImageUrl(trainer.user.profilePicture) 
    : null;

  const certificationFiles = trainer.application?.certificationFiles || [];

  return (
    <div className="min-h-screen bg-slate-900">
      <Header scrolled={false} showLogin={true} />
      
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Back Button */}
        <Button
          onClick={() => router.back()}
          variant="ghost"
          className="mb-6 text-white hover:text-blue-400"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>

        {/* Trainer Details - Combined Card */}
        <Card className="bg-slate-800 border-slate-700 mb-8">
          <CardContent className="p-8">
            {/* Trainer Header Section */}
            <div className="flex flex-col md:flex-row gap-8 mb-8 pb-8 border-b border-slate-700">
              {/* Profile Picture */}
              <div className="flex-shrink-0">
                <div className="relative w-32 h-32 md:w-40 md:h-40 rounded-full overflow-hidden border-4 border-blue-500/30">
                  {profileImageUrl ? (
                    <Image
                      src={profileImageUrl}
                      alt={trainer.user.name}
                      fill
                      className="object-cover"
                      sizes="160px"
                      unoptimized
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-blue-500/20 to-purple-500/20 flex items-center justify-center">
                      <User className="w-16 h-16 md:w-20 md:h-20 text-white/60" />
                    </div>
                  )}
                </div>
                {trainer.trainer.verified && (
                  <div className="mt-4 flex items-center justify-center gap-2 text-green-400">
                    <CheckCircle className="w-5 h-5" />
                    <span className="text-sm font-medium">Verified Trainer</span>
                  </div>
                )}
              </div>

              {/* Trainer Info */}
              <div className="flex-1">
                <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">
                  {trainer.user.name}
                </h1>
                
                {trainer.trainer.bio && (
                  <p className="text-white/80 mb-6 leading-relaxed">
                    {trainer.trainer.bio}
                  </p>
                )}

                {/* Contact Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  {trainer.user.email && (
                    <div className="flex items-center gap-3 text-white/70">
                      <Mail className="w-5 h-5 text-blue-400" />
                      <span>{trainer.user.email}</span>
                    </div>
                  )}
                  {trainer.user.phone && (
                    <div className="flex items-center gap-3 text-white/70">
                      <Phone className="w-5 h-5 text-blue-400" />
                      <span>{trainer.user.phone}</span>
                    </div>
                  )}
                  {trainer.user.dateOfBirth && (
                    <div className="flex items-center gap-3 text-white/70">
                      <Calendar className="w-5 h-5 text-blue-400" />
                      <span>{formatDate(trainer.user.dateOfBirth)}</span>
                    </div>
                  )}
                  {trainer.user.gender && (
                    <div className="flex items-center gap-3 text-white/70">
                      <User className="w-5 h-5 text-blue-400" />
                      <span className="capitalize">{trainer.user.gender}</span>
                    </div>
                  )}
                </div>

                {/* Specialties */}
                {trainer.trainer.specialties && trainer.trainer.specialties.length > 0 && (
                  <div className="mb-6">
                    <h3 className="text-sm font-semibold text-white/60 mb-3 flex items-center gap-2">
                      <Award className="w-4 h-4" />
                      Specialties
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {trainer.trainer.specialties.map((specialty, index) => (
                        <Badge
                          key={index}
                          className="bg-blue-500/20 text-blue-300 border-blue-500/30"
                        >
                          {formatSpecialty(specialty)}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Subscribe Button */}
                <div className="mt-6">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => {
                      const trainerUserId = parseInt(userIdParam);
                      router.push(`/register?trainerId=${trainerUserId}&trainerName=${encodeURIComponent(trainer.user.name)}`);
                    }}
                    className="w-full md:w-auto bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold px-6 py-3 rounded-lg transition-all duration-300 flex items-center justify-center gap-2 shadow-lg hover:shadow-blue-500/50"
                  >
                    <UserPlus className="w-5 h-5" />
                    Subscribe to This Trainer
                  </motion.button>
                </div>
              </div>
            </div>

            {/* Additional Information Section */}
            {trainer.application && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8 pb-8 border-b border-slate-700">
                {/* Languages */}
                {trainer.application.languages && trainer.application.languages.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                      <Globe className="w-5 h-5" />
                      Languages
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {trainer.application.languages.map((lang, index) => (
                        <Badge key={index} className="bg-purple-500/20 text-purple-300 border-purple-500/30">
                          {lang}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Years of Experience */}
                {trainer.application.yearsOfExperience && (
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                      <Briefcase className="w-5 h-5" />
                      Experience
                    </h3>
                    <p className="text-white/80 text-lg">
                      {trainer.application.yearsOfExperience} {trainer.application.yearsOfExperience === 1 ? 'year' : 'years'} of experience
                    </p>
                  </div>
                )}

                {/* Certifications List */}
                {trainer.application.certifications && trainer.application.certifications.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                      <Award className="w-5 h-5" />
                      Certifications
                    </h3>
                    <ul className="space-y-3">
                      {trainer.application.certifications.map((cert, index) => {
                        // Handle both string and object formats
                        if (typeof cert === 'string') {
                          return (
                            <li key={index} className="text-white/80 flex items-start gap-2">
                              <CheckCircle className="w-4 h-4 text-green-400 mt-1 flex-shrink-0" />
                              <span>{cert}</span>
                            </li>
                          );
                        }
                        // Handle object format with date, name, expiry, issuer
                        const certObj = cert as { name?: string; date?: string; expiry?: string; issuer?: string };
                        return (
                          <li key={index} className="text-white/80 flex items-start gap-2">
                            <CheckCircle className="w-4 h-4 text-green-400 mt-1 flex-shrink-0" />
                            <div className="flex-1">
                              <div className="font-medium">{certObj.name || 'Certification'}</div>
                              {certObj.issuer && (
                                <div className="text-sm text-white/60">Issued by: {certObj.issuer}</div>
                              )}
                              {certObj.date && (
                                <div className="text-sm text-white/60">Date: {formatDate(certObj.date)}</div>
                              )}
                              {certObj.expiry && (
                                <div className="text-sm text-white/60">Expires: {formatDate(certObj.expiry)}</div>
                              )}
                            </div>
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                )}

                {/* Portfolio */}
                {trainer.application.portfolio && trainer.application.portfolio.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                      <Briefcase className="w-5 h-5" />
                      Portfolio
                    </h3>
                    <ul className="space-y-2">
                      {trainer.application.portfolio.map((item, index) => (
                        <li key={index} className="text-white/80">
                          • {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}

            {/* Certificates Section */}
            {certificationFiles.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  Certificates & Documents
                </h3>
                <div className="space-y-8">
                  {certificationFiles.map((file) => (
                    <div key={file.id} className="w-full">
                      <CertificateDisplay file={file} />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Footer />
    </div>
  );
}

