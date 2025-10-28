'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { apiClient, type Language } from '@/lib/api-client';
import { 
  User, 
  Briefcase, 
  FileText, 
  Upload, 
  X, 
  Check,
  ArrowLeft,
  ArrowRight,
  Star,
  Globe,
  Clock,
  Target,
  Sparkles,
  Heart,
  Award,
  Users,
  AlertCircle
} from 'lucide-react';

interface FormData {
  // Professional Information
  specialties: string[];
  yearsOfExperience: string;
  bio: string;
  languages: string[];
  
  // Certifications & Portfolio
  certifications: Array<{
    name: string;
    issuer: string;
    date: string;
    expiry?: string;
  }>;
  portfolio: Array<{
    title: string;
    description: string;
    url?: string;
  }>;
  
  // Social Media
  socialMedia: {
    instagram?: string;
    facebook?: string;
    twitter?: string;
    linkedin?: string;
    website?: string;
  };
  preferences: {
    contentTypes: string[];
    targetAudience: string[];
    experienceLevel: string;
  };
}

const SPECIALTY_OPTIONS = [
  'Weight Training',
  'Cardio',
  'Yoga',
  'Pilates',
  'CrossFit',
  'Martial Arts',
  'Swimming',
  'Running',
  'Cycling',
  'Dance',
  'Boxing',
  'Nutrition',
  'Rehabilitation',
  'Senior Fitness',
  'Youth Fitness',
  'Prenatal/Postnatal',
  'Sports Training',
  'Mental Health',
  'Meditation',
  'Other'
];


const CONTENT_TYPE_OPTIONS = [
  'Workout Videos',
  'Nutrition Guides',
  'Exercise Tutorials',
  'Motivational Content',
  'Educational Posts',
  'Live Sessions',
  'Challenges',
  'Progress Tracking'
];

const TARGET_AUDIENCE_OPTIONS = [
  'Beginners',
  'Intermediate',
  'Advanced',
  'Seniors',
  'Youth',
  'Athletes',
  'Weight Loss',
  'Muscle Building',
  'General Fitness',
  'Rehabilitation'
];

const EXPERIENCE_LEVEL_OPTIONS = [
  'Beginner',
  'Intermediate',
  'Advanced',
  'Expert'
];

const WORKING_DAYS = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday'
];

export default function UserApplyPage() {
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [checkingStatus, setCheckingStatus] = useState(true);
  const [languages, setLanguages] = useState<Language[]>([]);
  const [loadingLanguages, setLoadingLanguages] = useState(true);
  
  const [formData, setFormData] = useState<FormData>({
    specialties: [],
    yearsOfExperience: '',
    bio: '',
    languages: [],
    certifications: [],
    portfolio: [],
    socialMedia: {},
    preferences: {
      contentTypes: [],
      targetAudience: [],
      experienceLevel: ''
    }
  });

  const totalSteps = 4; // Professional Info, Certifications, Social Media, Content Preferences
  const progress = (currentStep / totalSteps) * 100;

  // Check if user already has an application
  useEffect(() => {
    if (!authLoading && user) {
      checkApplicationStatus();
    }
  }, [authLoading, user]);

  // Fetch active languages
  useEffect(() => {
    fetchLanguages();
  }, []);

  const fetchLanguages = async () => {
    try {
      setLoadingLanguages(true);
      const response = await apiClient.getLanguages();
      if (response.success && response.data) {
        setLanguages(response.data);
      } else {
        console.error('Failed to fetch languages:', response.error);
        toast.error('Failed to load languages');
      }
    } catch (error) {
      console.error('Error fetching languages:', error);
      toast.error('Failed to load languages');
    } finally {
      setLoadingLanguages(false);
    }
  };

  const checkApplicationStatus = async () => {
    try {
      setCheckingStatus(true);
      const response = await apiClient.getApplicationStatus();
      
      if (response.success && response.data) {
        // User already has an application
        toast.info('You already have an application. Redirecting to status page...');
        setTimeout(() => {
          router.push('/user/apply/status');
        }, 1500);
      } else {
        // No application found, proceed with form
        setCheckingStatus(false);
      }
    } catch (error) {
      // No application found, proceed with form
      setCheckingStatus(false);
    }
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleNestedInputChange = (parent: keyof FormData, field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [parent]: {
        ...(prev[parent] as any),
        [field]: value
      }
    }));
  };

  const handleArrayToggle = (field: keyof FormData, value: string) => {
    setFormData(prev => {
      const currentArray = prev[field] as string[];
      return {
        ...prev,
        [field]: currentArray.includes(value)
          ? currentArray.filter(item => item !== value)
          : [...currentArray, value]
      };
    });
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    const validFiles = files.filter(file => {
      const isValidType = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'].includes(file.type);
      const isValidSize = file.size <= 10 * 1024 * 1024; // 10MB
      return isValidType && isValidSize;
    });

    if (validFiles.length !== files.length) {
      toast.error('Some files were rejected. Only PDF, JPG, and PNG files under 10MB are allowed.');
    }

    setUploadedFiles(prev => [...prev, ...validFiles]);
  };

  const removeFile = (index: number) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const addCertification = () => {
    setFormData(prev => ({
      ...prev,
      certifications: [...prev.certifications, {
        name: '',
        issuer: '',
        date: '',
        expiry: ''
      }]
    }));
  };

  const updateCertification = (index: number, field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      certifications: prev.certifications.map((cert, i) => 
        i === index ? { ...cert, [field]: value } : cert
      )
    }));
  };

  const removeCertification = (index: number) => {
    setFormData(prev => ({
      ...prev,
      certifications: prev.certifications.filter((_, i) => i !== index)
    }));
  };

  const addPortfolioItem = () => {
    setFormData(prev => ({
      ...prev,
      portfolio: [...prev.portfolio, {
        title: '',
        description: '',
        url: ''
      }]
    }));
  };

  const updatePortfolioItem = (index: number, field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      portfolio: prev.portfolio.map((item, i) => 
        i === index ? { ...item, [field]: value } : item
      )
    }));
  };

  const removePortfolioItem = (index: number) => {
    setFormData(prev => ({
      ...prev,
      portfolio: prev.portfolio.filter((_, i) => i !== index)
    }));
  };

  const validateStep = (step: number): boolean => {
    switch (step) {
      case 1:
        return formData.specialties.length > 0;
      case 2:
        return true; // Certifications and portfolio are optional
      case 3:
        return true; // Social media is optional
      case 4:
        return formData.preferences.contentTypes.length > 0;
      default:
        return true;
    }
  };

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, totalSteps));
    } else {
      toast.error('Please fill in all required fields before proceeding.');
    }
  };

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const handleSubmit = async () => {
    if (!validateStep(currentStep)) {
      toast.error('Please fill in all required fields.');
      return;
    }

    if (!user) {
      toast.error('You must be logged in to submit an application');
      return;
    }

    setIsSubmitting(true);

    try {
      const formDataToSend = new FormData();
      
      // Add form fields
      formDataToSend.append('specialties', JSON.stringify(formData.specialties));
      formDataToSend.append('yearsOfExperience', formData.yearsOfExperience);
      formDataToSend.append('bio', formData.bio);
      formDataToSend.append('languages', JSON.stringify(formData.languages));
      formDataToSend.append('certifications', JSON.stringify(formData.certifications));
      formDataToSend.append('portfolio', JSON.stringify(formData.portfolio));
      formDataToSend.append('socialMedia', JSON.stringify(formData.socialMedia));
      formDataToSend.append('preferences', JSON.stringify(formData.preferences));

      // Add uploaded files
      uploadedFiles.forEach(file => {
        formDataToSend.append('certifications', file);
      });

      // Get token from localStorage
      const token = localStorage.getItem('authToken');

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/trainer/apply`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formDataToSend
      });

      const result = await response.json();

      if (result.success) {
        toast.success('Application submitted successfully!');
        router.push('/user/apply/status');
      } else {
        toast.error(result.error?.message || 'Failed to submit application');
      }
    } catch (error) {
      console.error('Error submitting application:', error);
      toast.error('An error occurred while submitting your application');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Step 1: Professional Information
  const renderStep1 = () => (
    <div className="space-y-6">
      <div className="text-center">
        <Briefcase className="h-12 w-12 mx-auto text-green-600 mb-4" />
        <h2 className="text-2xl font-bold">Professional Information</h2>
        <p className="text-gray-600">Your fitness expertise and experience</p>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label>Specialties *</Label>
          <p className="text-sm text-gray-600">Select all that apply</p>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {SPECIALTY_OPTIONS.map((specialty) => (
              <div key={specialty} className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id={specialty}
                  checked={formData.specialties.includes(specialty)}
                  onChange={() => handleArrayToggle('specialties', specialty)}
                  className="rounded border-gray-300"
                />
                <Label htmlFor={specialty} className="text-sm cursor-pointer">{specialty}</Label>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="yearsOfExperience">Years of Experience</Label>
          <Select value={formData.yearsOfExperience} onValueChange={(value) => handleInputChange('yearsOfExperience', value)}>
            <SelectTrigger>
              <SelectValue placeholder="Select experience level" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="0-1">0-1 years</SelectItem>
              <SelectItem value="2-3">2-3 years</SelectItem>
              <SelectItem value="4-5">4-5 years</SelectItem>
              <SelectItem value="6-10">6-10 years</SelectItem>
              <SelectItem value="10+">10+ years</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Languages</Label>
          <p className="text-sm text-gray-600">Select all languages you can communicate in</p>
          {loadingLanguages ? (
            <div className="text-sm text-gray-500">Loading languages...</div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {languages.map((language) => (
                <div key={language.id} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id={language.name}
                    checked={formData.languages.includes(language.name)}
                    onChange={() => handleArrayToggle('languages', language.name)}
                    className="rounded border-gray-300"
                  />
                  <Label htmlFor={language.name} className="text-sm cursor-pointer">
                    {language.nativeName || language.name}
                  </Label>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="bio">Bio</Label>
          <Textarea
            id="bio"
            placeholder="Tell us about your fitness journey and philosophy..."
            value={formData.bio}
            onChange={(e) => handleInputChange('bio', e.target.value)}
            rows={4}
          />
        </div>
      </div>
    </div>
  );

  // Step 2: Certifications & Portfolio
  const renderStep2 = () => (
    <div className="space-y-6">
      <div className="text-center">
        <FileText className="h-12 w-12 mx-auto text-purple-600 mb-4" />
        <h2 className="text-2xl font-bold">Certifications & Portfolio</h2>
        <p className="text-gray-600">Showcase your credentials and work</p>
      </div>

      <div className="space-y-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label>Certifications</Label>
            <Button type="button" variant="outline" size="sm" onClick={addCertification}>
              Add Certification
            </Button>
          </div>
          
          {formData.certifications.map((cert, index) => (
            <Card key={index} className="p-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Certification Name</Label>
                  <Input
                    value={cert.name}
                    onChange={(e) => updateCertification(index, 'name', e.target.value)}
                    placeholder="e.g., NASM-CPT"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Issuing Organization</Label>
                  <Input
                    value={cert.issuer}
                    onChange={(e) => updateCertification(index, 'issuer', e.target.value)}
                    placeholder="e.g., NASM"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Issue Date</Label>
                  <Input
                    type="date"
                    value={cert.date}
                    onChange={(e) => updateCertification(index, 'date', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Expiry Date (if applicable)</Label>
                  <Input
                    type="date"
                    value={cert.expiry || ''}
                    onChange={(e) => updateCertification(index, 'expiry', e.target.value)}
                  />
                </div>
              </div>
              <Button
                type="button"
                variant="destructive"
                size="sm"
                className="mt-2"
                onClick={() => removeCertification(index)}
              >
                <X className="h-4 w-4 mr-2" />
                Remove
              </Button>
            </Card>
          ))}
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label>Portfolio Items</Label>
            <Button type="button" variant="outline" size="sm" onClick={addPortfolioItem}>
              Add Portfolio Item
            </Button>
          </div>
          
          {formData.portfolio.map((item, index) => (
            <Card key={index} className="p-4">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Title</Label>
                  <Input
                    value={item.title}
                    onChange={(e) => updatePortfolioItem(index, 'title', e.target.value)}
                    placeholder="e.g., 30-Day Transformation Program"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Description</Label>
                  <Textarea
                    value={item.description}
                    onChange={(e) => updatePortfolioItem(index, 'description', e.target.value)}
                    placeholder="Describe your work..."
                    rows={3}
                  />
                </div>
                <div className="space-y-2">
                  <Label>URL (optional)</Label>
                  <Input
                    value={item.url || ''}
                    onChange={(e) => updatePortfolioItem(index, 'url', e.target.value)}
                    placeholder="https://example.com"
                  />
                </div>
              </div>
              <Button
                type="button"
                variant="destructive"
                size="sm"
                className="mt-2"
                onClick={() => removePortfolioItem(index)}
              >
                <X className="h-4 w-4 mr-2" />
                Remove
              </Button>
            </Card>
          ))}
        </div>

        <div className="space-y-4">
          <Label>Certification Files</Label>
          <p className="text-sm text-gray-600">Upload copies of your certifications (PDF, JPG, PNG - max 10MB each)</p>
          
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
            <Upload className="h-8 w-8 mx-auto text-gray-400 mb-2" />
            <Button
              type="button"
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
            >
              Choose Files
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept=".pdf,.jpg,.jpeg,.png"
              onChange={handleFileUpload}
              className="hidden"
            />
          </div>

          {uploadedFiles.length > 0 && (
            <div className="space-y-2">
              <Label>Uploaded Files</Label>
              {uploadedFiles.map((file, index) => (
                <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                  <span className="text-sm">{file.name}</span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeFile(index)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );

  // Step 3: Social Media
  const renderStep3 = () => (
    <div className="space-y-6">
      <div className="text-center">
        <Globe className="h-12 w-12 mx-auto text-blue-600 mb-4" />
        <h2 className="text-2xl font-bold">Social Media & Online Presence</h2>
        <p className="text-gray-600">Connect with members on social platforms</p>
      </div>

      <div className="space-y-4">
        <p className="text-sm text-gray-600 text-center">
          All fields are optional. Add your social media profiles so members can follow and connect with you.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="instagram">Instagram</Label>
            <Input
              id="instagram"
              placeholder="@username"
              value={formData.socialMedia.instagram || ''}
              onChange={(e) => handleNestedInputChange('socialMedia', 'instagram', e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="facebook">Facebook</Label>
            <Input
              id="facebook"
              placeholder="@username"
              value={formData.socialMedia.facebook || ''}
              onChange={(e) => handleNestedInputChange('socialMedia', 'facebook', e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="twitter">Twitter/X</Label>
            <Input
              id="twitter"
              placeholder="@username"
              value={formData.socialMedia.twitter || ''}
              onChange={(e) => handleNestedInputChange('socialMedia', 'twitter', e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="linkedin">LinkedIn</Label>
            <Input
              id="linkedin"
              placeholder="linkedin.com/in/username"
              value={formData.socialMedia.linkedin || ''}
              onChange={(e) => handleNestedInputChange('socialMedia', 'linkedin', e.target.value)}
            />
          </div>
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="website">Website</Label>
            <Input
              id="website"
              placeholder="https://yourwebsite.com"
              value={formData.socialMedia.website || ''}
              onChange={(e) => handleNestedInputChange('socialMedia', 'website', e.target.value)}
            />
          </div>
        </div>
      </div>
    </div>
  );

  // Step 4: Content Preferences
  const renderStep4 = () => (
    <div className="space-y-6">
      <div className="text-center">
        <Target className="h-12 w-12 mx-auto text-pink-600 mb-4" />
        <h2 className="text-2xl font-bold">Content Preferences</h2>
        <p className="text-gray-600">What type of content will you create?</p>
      </div>

      <div className="space-y-6">
        <div className="space-y-2">
          <Label>Content Types *</Label>
          <p className="text-sm text-gray-600">Select all types of content you plan to create</p>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {CONTENT_TYPE_OPTIONS.map((type) => (
              <div key={type} className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id={type}
                  checked={formData.preferences.contentTypes.includes(type)}
                  onChange={() => {
                    const current = formData.preferences.contentTypes;
                    handleNestedInputChange(
                      'preferences',
                      'contentTypes',
                      current.includes(type) ? current.filter(t => t !== type) : [...current, type]
                    );
                  }}
                  className="rounded border-gray-300"
                />
                <Label htmlFor={type} className="text-sm cursor-pointer">{type}</Label>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <Label>Target Audience</Label>
          <p className="text-sm text-gray-600">Who will you be training?</p>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {TARGET_AUDIENCE_OPTIONS.map((audience) => (
              <div key={audience} className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id={audience}
                  checked={formData.preferences.targetAudience.includes(audience)}
                  onChange={() => {
                    const current = formData.preferences.targetAudience;
                    handleNestedInputChange(
                      'preferences',
                      'targetAudience',
                      current.includes(audience) ? current.filter(a => a !== audience) : [...current, audience]
                    );
                  }}
                  className="rounded border-gray-300"
                />
                <Label htmlFor={audience} className="text-sm cursor-pointer">{audience}</Label>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="experienceLevel">Your Experience Level</Label>
          <Select 
            value={formData.preferences.experienceLevel} 
            onValueChange={(value) => handleNestedInputChange('preferences', 'experienceLevel', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select your experience level" />
            </SelectTrigger>
            <SelectContent>
              {EXPERIENCE_LEVEL_OPTIONS.map((level) => (
                <SelectItem key={level} value={level}>{level}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 1: return renderStep1();
      case 2: return renderStep2();
      case 3: return renderStep3();
      case 4: return renderStep4();
      default: return renderStep1();
    }
  };

  // Loading states
  if (authLoading || checkingStatus) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-4rem)]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-400 mx-auto"></div>
          <p className="mt-4 text-emerald-100">Loading...</p>
        </div>
      </div>
    );
  }

  // Authentication is handled by the user layout

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-4rem)] p-4">
      <div className="w-full max-w-4xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="relative mx-auto w-24 h-24 mb-6">
            <div className="absolute inset-0 bg-gradient-to-r from-emerald-400 via-emerald-500 to-emerald-600 rounded-2xl rotate-3 animate-pulse"></div>
            <div className="relative w-full h-full bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-2xl flex items-center justify-center shadow-2xl">
              <Award className="w-12 h-12 text-white" />
            </div>
            <div className="absolute -top-1 -right-1 w-6 h-6 bg-yellow-400 rounded-full flex items-center justify-center">
              <Sparkles className="w-3 h-3 text-yellow-800" />
            </div>
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-white via-emerald-100 to-white bg-clip-text text-transparent mb-3">
            Become a Trainer
          </h1>
          <p className="text-emerald-100/80 text-lg">
            Join our community of <span className="font-semibold text-emerald-300">fitness professionals</span>
          </p>
          <div className="flex items-center justify-center space-x-2 mt-3">
            <Badge variant="secondary" className="bg-emerald-500/20 text-emerald-200 border-emerald-400/30">
              <Heart className="w-3 h-3 mr-1" />
              Premium Fitness
            </Badge>
            <Badge variant="secondary" className="bg-blue-500/20 text-blue-200 border-blue-400/30">
              <Users className="w-3 h-3 mr-1" />
              Expert Community
            </Badge>
          </div>
          
          {/* User Info Badge */}
          <div className="mt-4 inline-block">
            <Badge variant="outline" className="bg-white/10 text-white border-emerald-400/50 px-4 py-2">
              <User className="w-4 h-4 mr-2" />
              Applying as: <strong className="ml-1">{user?.name || 'User'}</strong> ({user?.phone || 'N/A'})
            </Badge>
          </div>
        </div>

        {/* Progress Card */}
        <Card className="relative shadow-2xl border-0 bg-white/95 backdrop-blur-xl overflow-hidden mb-8">
          <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/10 via-transparent to-blue-500/10"></div>
          
          <CardHeader className="relative space-y-1 pb-6 pt-8">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-2xl font-bold text-gray-900 mb-2">Application Progress</CardTitle>
                <CardDescription className="text-gray-600">Step {currentStep} of {totalSteps}</CardDescription>
              </div>
              <Badge variant="secondary" className="bg-emerald-500/20 text-emerald-700 border-emerald-400/30">
                {Math.round(progress)}% Complete
              </Badge>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3 mt-4 overflow-hidden">
              <div 
                className="bg-gradient-to-r from-emerald-500 to-emerald-600 h-3 rounded-full transition-all duration-500 shadow-lg"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
          </CardHeader>
        </Card>

        {/* Form Card */}
        <Card className="relative shadow-2xl border-0 bg-white/95 backdrop-blur-xl overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/10 via-transparent to-blue-500/10"></div>
          
          <CardContent className="relative p-8">
            {renderCurrentStep()}
          </CardContent>
        </Card>

        {/* Navigation Buttons */}
        <div className="flex justify-between mt-8">
          <Button
            variant="outline"
            onClick={prevStep}
            disabled={currentStep === 1}
            className="flex items-center h-12 px-6 bg-white/80 hover:bg-white border-2 border-gray-200 hover:border-emerald-500 text-gray-700 hover:text-emerald-700 transition-all duration-300 shadow-lg"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Previous
          </Button>

          {currentStep < totalSteps ? (
            <Button 
              onClick={nextStep}
              className="flex items-center h-12 px-6 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white shadow-lg hover:shadow-xl transition-all duration-300"
            >
              Next
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          ) : (
            <Button 
              onClick={handleSubmit} 
              disabled={isSubmitting}
              className="flex items-center h-12 px-6 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white shadow-lg hover:shadow-xl transition-all duration-300"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Submitting...
                </>
              ) : (
                <>
                  <Check className="h-4 w-4 mr-2" />
                  Submit Application
                </>
              )}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
