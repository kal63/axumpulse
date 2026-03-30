'use client';

import { useState, useEffect, Suspense, Key } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { apiClient, PublicTrainerDetail, CertificationFile } from '@/lib/api-client';
import { useAuth } from '@/contexts/auth-context'
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
  UserPlus,
  Instagram,
  Facebook,
  Twitter,
  Linkedin,
  Youtube,
  ExternalLink,
  Download,
  File
} from 'lucide-react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { ThemeProvider } from '@/components/trainer-site/ThemeProvider';
import { HeroSection } from '@/components/trainer-site/HeroSection';
import { PhilosophySection } from '@/components/trainer-site/PhilosophySection';
import { TargetAudienceSection } from '@/components/trainer-site/TargetAudienceSection';
import { GallerySection } from '@/components/trainer-site/GallerySection';
import { TrainerContentSection } from '@/components/trainer-site/TrainerContentSection';

function CertificateDisplay({ file }: { file: CertificationFile }) {
  const isImage = file.fileType.startsWith('image/');
  const fileUrl = getImageUrl(file.fileUrl) || file.fileUrl;

  return (
    <div className="group relative">
      {/* Image Display */}
      {isImage && (
        <div className="relative rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 shadow-lg hover:shadow-xl transition-shadow">
          <Image
            src={fileUrl}
            alt={file.fileName}
            width={1200}
            height={800}
            className="w-full h-auto object-contain"
            unoptimized
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-center pb-4">
            <a
              href={fileUrl}
              download={file.fileName}
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium transition-colors"
            >
              <Download className="w-4 h-4" />
              Download
            </a>
          </div>
        </div>
      )}

      {/* Non-Image File Download Card */}
      {!isImage && (
        <div className="p-6 bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-blue-500 dark:hover:border-blue-400 transition-all hover:shadow-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-500/20 rounded-lg">
                <File className="w-6 h-6 text-blue-500" />
              </div>
              <div>
                <p className="font-semibold text-slate-900 dark:text-white text-balance">{file.fileName}</p>
                <p className="text-sm text-slate-500 dark:text-slate-400">{file.fileType}</p>
              </div>
            </div>
            <a
              href={fileUrl}
              download={file.fileName}
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium transition-colors whitespace-nowrap"
            >
              <Download className="w-4 h-4" />
              Download
            </a>
          </div>
        </div>
      )}
    </div>
  );
}

function TrainerDetailPageContent() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isAuthenticated } = useAuth()
  const userIdParam = params?.userId as string;
  
  const [trainer, setTrainer] = useState<PublicTrainerDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [urlUpdated, setUrlUpdated] = useState(false);

  useEffect(() => {
    if (!userIdParam) {
      setError('Invalid trainer identifier');
      setLoading(false);
      return;
    }

    // Helper function to check if string is a valid integer
    const isInteger = (str: string): boolean => {
      const num = parseInt(str, 10);
      return !isNaN(num) && num.toString() === str;
    };

    // Determine if param is ID (integer) or slug (name)
    const isId = isInteger(userIdParam);
    const identifier: number | string = isId ? parseInt(userIdParam, 10) : userIdParam;

    const fetchTrainer = async () => {
      try {
        setLoading(true);
        console.log(`[TrainerDetailPage] Fetching trainer with ${isId ? 'userId' : 'slug'}:`, identifier);
        
        // API call accepts both ID and slug
        const response = await apiClient.getPublicTrainerDetail(identifier);
        console.log('[TrainerDetailPage] API response:', response);

        if (response.success && response.data) {
          setTrainer(response.data);
          
          // Update URL to show trainer name (pretty URL) without reloading
          // Only update if we came with an ID, not if we already have a slug
          if (!urlUpdated && isId && typeof window !== 'undefined') {
            const slug = createSlug(response.data.user.name);
            const prettyUrl = `/trainers/${slug}`;
            // Update URL without reloading using replaceState
            // Store the userId in state so we can still use it if needed
            window.history.replaceState(
              { ...window.history.state, userId: response.data.userId, as: prettyUrl },
              '',
              prettyUrl
            );
            setUrlUpdated(true);
          }
        } else {
          console.error('[TrainerDetailPage] API Error:', response);
          const errorMessage = response.error?.message || response.error?.code || 'Failed to load trainer profile';
          
          if (response.error?.code === 'TRAINER_NOT_FOUND' || response.error?.status === 404) {
            setError(`Trainer not found (${isId ? 'userId' : 'slug'}: ${identifier}). The trainer may not be verified or may not exist.`);
          } else if (response.error?.code === 'NETWORK_ERROR' || response.error?.code === 'HTTP_ERROR') {
            setError(`Cannot connect to server: ${response.error?.message || 'Network error'}. Status: ${response.error?.status}`);
          } else {
            setError(`${errorMessage} (${isId ? 'userId' : 'slug'}: ${identifier})`);
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

  const certificationFiles = Array.isArray(trainer.application?.certificationFiles) ? trainer.application.certificationFiles : [];
  const site = trainer.site;

  // Parse JSON strings from backend
  const parseJsonField = (field: any, defaultValue: any = []) => {
    if (Array.isArray(field)) return field;
    if (typeof field === 'string') {
      try {
        return JSON.parse(field);
      } catch {
        return defaultValue;
      }
    }
    return defaultValue;
  };

  const theme = parseJsonField(site?.theme, {});

  // Get enabled sections in order
  const sections = parseJsonField(site?.sections);
  const enabledSections = sections
    .filter((s: any) => s.enabled)
    .sort((a: any, b: any) => (a.order || 0) - (b.order || 0));

  // Parse social links
  const socialLinks = parseJsonField(site?.socialLinks, {});

  // Parse application fields
  const languages = parseJsonField(trainer.application?.languages);
  const certifications = parseJsonField(trainer.application?.certifications);

  // Helper to check if section is enabled
  const isSectionEnabled = (type: string) => {
    return enabledSections.some((s: { type: string; }) => s.type === type);
  };

  // Default sections if no site customization
  const showDefaultSections = !site || sections.length === 0;

  const handleSubscribe = () => {
    const trainerUserId = trainer.userId;
    const planId = searchParams.get('planId');
    const duration = searchParams.get('duration');
    const mode = searchParams.get('mode')
    
    if (mode === 'changeTrainer') {
      if (!isAuthenticated) {
        router.push(`/login?redirect=${encodeURIComponent(`/trainers/${userIdParam}?mode=changeTrainer`)}`)
        return
      }
      void (async () => {
        const res = await apiClient.changeTrainer({ new_trainer_id: trainerUserId })
        if (res.success) {
          router.push('/user/dashboard')
        } else {
          alert(res.error?.message || 'Failed to change trainer')
        }
      })()
      return
    }

    if (planId && duration) {
      const params = new URLSearchParams({
        planId: planId,
        trainerId: trainerUserId.toString(),
        duration: duration,
        trainerName: trainer.user.name
      });
      router.push(`/checkout?${params.toString()}`);
    } else {
      router.push(`/register?trainerId=${trainerUserId}&trainerName=${encodeURIComponent(trainer.user.name)}`);
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <div className="min-h-screen bg-white dark:bg-slate-900">
      <Header scrolled={false} showLogin={true} />
      
        {/* Hero Section */}
        <HeroSection trainer={trainer} onSubscribe={handleSubscribe} />

        {/* Dynamic Sections based on site configuration */}
        {enabledSections.map((section: { type: Key | null | undefined; }) => {
          switch (section.type) {
            case 'philosophy':
              return <PhilosophySection key={section.type} trainer={trainer} />;
            case 'target-audience':
              return <TargetAudienceSection key={section.type} trainer={trainer} />;
            case 'gallery':
              return <GallerySection key={section.type} trainer={trainer} />;
            case 'trainer-content':
              return <TrainerContentSection key={section.type} trainer={trainer} />;
            default:
              return null;
          }
        })}

        {/* About Section (if enabled or default) */}
        {(showDefaultSections || isSectionEnabled('about')) && (
          <section className="py-16 bg-slate-50 dark:bg-slate-900">
            <div className="container mx-auto px-4 max-w-7xl">
              <Card className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
                <CardContent className="p-8">
                  <div className="flex flex-col md:flex-row gap-8">
                    {/* Profile Picture */}
                    <div className="flex-shrink-0">
                      <div className="relative w-32 h-32 md:w-40 md:h-40 rounded-full overflow-hidden border-4 border-blue-500/30">
                        {profileImageUrl ? (
                          <Image
                            src={profileImageUrl}
                            alt={trainer.user.name}
                            fill
                            className="object-cover"
                            sizes="(max-width: 768px) 128px, 160px"
                            loading="eager"
                            priority
                            quality={90}
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
                      <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-4">
                        {trainer.user.name}
                      </h2>
                      
                      {(site?.bio || trainer.trainer.bio) && (
                        <p className="text-slate-700 dark:text-slate-300 mb-6 leading-relaxed">
                          {site?.bio || trainer.trainer.bio}
                        </p>
                      )}

                      {/* Contact Info */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                        {trainer.user.email && (
                          <div className="flex items-center gap-3 text-slate-600 dark:text-slate-400">
                            <Mail className="w-5 h-5 text-blue-400" />
                            <span>{trainer.user.email}</span>
                          </div>
                        )}
                        {trainer.user.phone && (
                          <div className="flex items-center gap-3 text-slate-600 dark:text-slate-400">
                            <Phone className="w-5 h-5 text-blue-400" />
                            <span>{trainer.user.phone}</span>
                          </div>
                        )}
                        {trainer.user.dateOfBirth && (
                          <div className="flex items-center gap-3 text-slate-600 dark:text-slate-400">
                            <Calendar className="w-5 h-5 text-blue-400" />
                            <span>{formatDate(trainer.user.dateOfBirth)}</span>
                          </div>
                        )}
                        {trainer.user.gender && (
                          <div className="flex items-center gap-3 text-slate-600 dark:text-slate-400">
                            <User className="w-5 h-5 text-blue-400" />
                            <span className="capitalize">{trainer.user.gender}</span>
                          </div>
                        )}
                      </div>

                      {/* Specialties */}
                      {Array.isArray(trainer.trainer.specialties) && trainer.trainer.specialties.length > 0 && (
                        <div className="mb-6">
                          <h3 className="text-sm font-semibold text-slate-600 dark:text-slate-400 mb-3 flex items-center gap-2">
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

                      {/* Social Links */}
                      {(socialLinks || trainer.application?.socialMedia) && (
                        <div className="mt-6">
                          <h3 className="text-sm font-semibold text-slate-600 dark:text-slate-400 mb-3">
                            Connect
                          </h3>
                          <div className="flex flex-wrap gap-3">
                            {socialLinks?.instagram && (
                              <a
                                href={socialLinks.instagram}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-slate-600 dark:text-slate-400 hover:text-pink-500 transition-colors"
                              >
                                <Instagram className="w-5 h-5" />
                              </a>
                            )}
                            {socialLinks?.facebook && (
                              <a
                                href={socialLinks.facebook}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-slate-600 dark:text-slate-400 hover:text-blue-500 transition-colors"
                              >
                                <Facebook className="w-5 h-5" />
                              </a>
                            )}
                            {socialLinks?.twitter && (
                              <a
                                href={socialLinks.twitter}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-slate-600 dark:text-slate-400 hover:text-blue-400 transition-colors"
                              >
                                <Twitter className="w-5 h-5" />
                              </a>
                            )}
                            {socialLinks?.linkedin && (
                              <a
                                href={socialLinks.linkedin}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-slate-600 dark:text-slate-400 hover:text-blue-600 transition-colors"
                              >
                                <Linkedin className="w-5 h-5" />
                              </a>
                            )}
                            {socialLinks?.youtube && (
                              <a
                                href={socialLinks.youtube}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-slate-600 dark:text-slate-400 hover:text-red-500 transition-colors"
                              >
                                <Youtube className="w-5 h-5" />
                              </a>
                            )}
                            {socialLinks?.website && (
                              <a
                                href={socialLinks.website}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-slate-600 dark:text-slate-400 hover:text-blue-500 transition-colors"
                              >
                                <ExternalLink className="w-5 h-5" />
                              </a>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </section>
        )}

        {/* Additional Information Section */}
        {trainer.application && (showDefaultSections || isSectionEnabled('certifications')) && (
          <section className="py-16 bg-white dark:bg-slate-800">
            <div className="container mx-auto px-4 max-w-7xl">
              <Card className="bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700">
                <CardContent className="p-8">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Languages */}
                    {Array.isArray(languages) && languages.length > 0 && (
                      <div>
                        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
                          <Globe className="w-5 h-5" />
                          Languages
                        </h3>
                        <div className="flex flex-wrap gap-2">
                          {languages.map((lang: string, index: number) => (
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
                        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
                          <Briefcase className="w-5 h-5" />
                          Experience
                        </h3>
                        <p className="text-slate-700 dark:text-slate-300 text-lg">
                          {trainer.application.yearsOfExperience} {trainer.application.yearsOfExperience === 1 ? 'year' : 'years'} of experience
                        </p>
                      </div>
                    )}

                    {/* Certifications List */}
                    {Array.isArray(certifications) && certifications.length > 0 && (
                      <div>
                        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
                          <Award className="w-5 h-5" />
                          Certifications
                        </h3>
                        <ul className="space-y-3">
                          {certifications.map((cert: any, index: number) => {
                            if (typeof cert === 'string') {
                              return (
                                <li key={index} className="text-slate-700 dark:text-slate-300 flex items-start gap-2">
                                  <CheckCircle className="w-4 h-4 text-green-400 mt-1 flex-shrink-0" />
                                  <span>{cert}</span>
                                </li>
                              );
                            }
                            const certObj = cert as { name?: string; date?: string; expiry?: string; issuer?: string };
                            return (
                              <li key={index} className="text-slate-700 dark:text-slate-300 flex items-start gap-2">
                                <CheckCircle className="w-4 h-4 text-green-400 mt-1 flex-shrink-0" />
                                <div className="flex-1">
                                  <div className="font-medium">{certObj.name || 'Certification'}</div>
                                  {certObj.issuer && (
                                    <div className="text-sm text-slate-500 dark:text-slate-400">Issued by: {certObj.issuer}</div>
                                  )}
                                  {certObj.date && (
                                    <div className="text-sm text-slate-500 dark:text-slate-400">Date: {formatDate(certObj.date)}</div>
                                  )}
                                  {certObj.expiry && (
                                    <div className="text-sm text-slate-500 dark:text-slate-400">Expires: {formatDate(certObj.expiry)}</div>
                                  )}
                                </div>
                              </li>
                            );
                          })}
                        </ul>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </section>
        )}

        {/* Certificates Section */}
        {certificationFiles.length > 0 && (
          <section className="py-20 bg-gradient-to-b from-white via-slate-50 to-white dark:from-slate-800 dark:via-slate-900 dark:to-slate-800">
            <div className="container mx-auto px-4 max-w-7xl">
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="mb-12"
              >
                <div className="inline-block mb-4">
                  <span className="px-3 py-1 bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded-full text-sm font-medium">
                    Qualifications
                  </span>
                </div>
                <h2 className="text-4xl md:text-5xl font-bold text-slate-900 dark:text-white mb-4 text-balance">
                  Certificates & Documents
                </h2>
                <p className="text-lg text-slate-600 dark:text-slate-300 max-w-2xl">
                  Professional certifications and credentials that validate expertise and quality training.
                </p>
              </motion.div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {certificationFiles.map((file, index) => (
                  <motion.div
                    key={file.id}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                  >
                    <CertificateDisplay file={file} />
                  </motion.div>
                ))}
              </div>
            </div>
          </section>
        )}

        <Footer />
      </div>
    </ThemeProvider>
  );
}

export default function TrainerDetailPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-blue-400 animate-spin" />
      </div>
    }>
      <TrainerDetailPageContent />
    </Suspense>
  );
}

