'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { NeumorphicCard } from '@/components/user/NeumorphicCard';
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
        <div className="w-16 h-16 bg-gradient-to-br from-cyan-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <Briefcase className="h-8 w-8 text-white" />
        </div>
        <h2 className="text-2xl font-bold text-[var(--neumorphic-text)]">Professional Information</h2>
        <p className="text-[var(--neumorphic-muted)]">Your fitness expertise and experience</p>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label className="text-[var(--neumorphic-text)]">Specialties *</Label>
          <p className="text-sm text-[var(--neumorphic-muted)]">Select all that apply</p>
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
                <Label htmlFor={specialty} className="text-sm cursor-pointer text-[var(--neumorphic-text)]">{specialty}</Label>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="yearsOfExperience" className="text-[var(--neumorphic-text)]">Years of Experience</Label>
          <select
            id="yearsOfExperience"
            value={formData.yearsOfExperience}
            onChange={(e) => handleInputChange('yearsOfExperience', e.target.value)}
            className="w-full px-3 py-2 rounded-xl border border-[var(--neumorphic-border)] bg-[var(--neumorphic-surface)] text-[var(--neumorphic-text)] focus:outline-none focus:ring-2 focus:ring-cyan-500"
          >
            <option value="">Select experience level</option>
            <option value="0-1">0-1 years</option>
            <option value="2-3">2-3 years</option>
            <option value="4-5">4-5 years</option>
            <option value="6-10">6-10 years</option>
            <option value="10+">10+ years</option>
          </select>
        </div>

        <div className="space-y-2">
          <Label className="text-[var(--neumorphic-text)]">Languages</Label>
          <p className="text-sm text-[var(--neumorphic-muted)]">Select all languages you can communicate in</p>
          {loadingLanguages ? (
            <div className="text-sm text-[var(--neumorphic-muted)]">Loading languages...</div>
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
                  <Label htmlFor={language.name} className="text-sm cursor-pointer text-[var(--neumorphic-text)]">
                    {language.nativeName || language.name}
                  </Label>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="bio" className="text-[var(--neumorphic-text)]">Bio</Label>
          <Textarea
            id="bio"
            placeholder="Tell us about your fitness journey and philosophy..."
            value={formData.bio}
            onChange={(e) => handleInputChange('bio', e.target.value)}
            rows={4}
            className="bg-[var(--neumorphic-surface)] border-[var(--neumorphic-border)] text-[var(--neumorphic-text)]"
          />
        </div>
      </div>
    </div>
  );

  // Step 2: Certifications & Portfolio
  const renderStep2 = () => (
    <div className="space-y-6">
      <div className="text-center">
        <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <FileText className="h-8 w-8 text-white" />
        </div>
        <h2 className="text-2xl font-bold text-[var(--neumorphic-text)]">Certifications & Portfolio</h2>
        <p className="text-[var(--neumorphic-muted)]">Showcase your credentials and work</p>
      </div>

      <div className="space-y-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label className="text-[var(--neumorphic-text)]">Certifications</Label>
            <Button type="button" variant="outline" size="sm" onClick={addCertification} className="border-[var(--neumorphic-border)]">
              Add Certification
            </Button>
          </div>
          
          {formData.certifications.map((cert, index) => (
            <NeumorphicCard key={index} variant="raised" className="p-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-[var(--neumorphic-text)]">Certification Name</Label>
                  <Input
                    value={cert.name}
                    onChange={(e) => updateCertification(index, 'name', e.target.value)}
                    placeholder="e.g., NASM-CPT"
                    className="bg-[var(--neumorphic-surface)] border-[var(--neumorphic-border)] text-[var(--neumorphic-text)]"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-[var(--neumorphic-text)]">Issuing Organization</Label>
                  <Input
                    value={cert.issuer}
                    onChange={(e) => updateCertification(index, 'issuer', e.target.value)}
                    placeholder="e.g., NASM"
                    className="bg-[var(--neumorphic-surface)] border-[var(--neumorphic-border)] text-[var(--neumorphic-text)]"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-[var(--neumorphic-text)]">Issue Date</Label>
                  <Input
                    type="date"
                    value={cert.date}
                    onChange={(e) => updateCertification(index, 'date', e.target.value)}
                    className="bg-[var(--neumorphic-surface)] border-[var(--neumorphic-border)] text-[var(--neumorphic-text)]"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-[var(--neumorphic-text)]">Expiry Date (if applicable)</Label>
                  <Input
                    type="date"
                    value={cert.expiry || ''}
                    onChange={(e) => updateCertification(index, 'expiry', e.target.value)}
                    className="bg-[var(--neumorphic-surface)] border-[var(--neumorphic-border)] text-[var(--neumorphic-text)]"
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
            </NeumorphicCard>
          ))}
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label className="text-[var(--neumorphic-text)]">Portfolio Items</Label>
            <Button type="button" variant="outline" size="sm" onClick={addPortfolioItem} className="border-[var(--neumorphic-border)]">
              Add Portfolio Item
            </Button>
          </div>
          
          {formData.portfolio.map((item, index) => (
            <NeumorphicCard key={index} variant="raised" className="p-4">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-[var(--neumorphic-text)]">Title</Label>
                  <Input
                    value={item.title}
                    onChange={(e) => updatePortfolioItem(index, 'title', e.target.value)}
                    placeholder="e.g., 30-Day Transformation Program"
                    className="bg-[var(--neumorphic-surface)] border-[var(--neumorphic-border)] text-[var(--neumorphic-text)]"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-[var(--neumorphic-text)]">Description</Label>
                  <Textarea
                    value={item.description}
                    onChange={(e) => updatePortfolioItem(index, 'description', e.target.value)}
                    placeholder="Describe your work..."
                    rows={3}
                    className="bg-[var(--neumorphic-surface)] border-[var(--neumorphic-border)] text-[var(--neumorphic-text)]"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-[var(--neumorphic-text)]">URL (optional)</Label>
                  <Input
                    value={item.url || ''}
                    onChange={(e) => updatePortfolioItem(index, 'url', e.target.value)}
                    placeholder="https://example.com"
                    className="bg-[var(--neumorphic-surface)] border-[var(--neumorphic-border)] text-[var(--neumorphic-text)]"
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
            </NeumorphicCard>
          ))}
        </div>

        <div className="space-y-4">
          <Label className="text-[var(--neumorphic-text)]">Certification Files</Label>
          <p className="text-sm text-[var(--neumorphic-muted)]">Upload copies of your certifications (PDF, JPG, PNG - max 10MB each)</p>
          
          <NeumorphicCard variant="recessed" className="p-6 text-center border-2 border-dashed border-[var(--neumorphic-border)]">
            <Upload className="h-8 w-8 mx-auto text-[var(--neumorphic-muted)] mb-2" />
            <Button
              type="button"
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
              className="border-[var(--neumorphic-border)]"
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
          </NeumorphicCard>

          {uploadedFiles.length > 0 && (
            <div className="space-y-2">
              <Label className="text-[var(--neumorphic-text)]">Uploaded Files</Label>
              {uploadedFiles.map((file, index) => (
                <NeumorphicCard key={index} variant="raised" className="p-3 flex items-center justify-between">
                  <span className="text-sm text-[var(--neumorphic-text)]">{file.name}</span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeFile(index)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </NeumorphicCard>
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
        <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <Globe className="h-8 w-8 text-white" />
        </div>
        <h2 className="text-2xl font-bold text-[var(--neumorphic-text)]">Social Media & Online Presence</h2>
        <p className="text-[var(--neumorphic-muted)]">Connect with members on social platforms</p>
      </div>

      <div className="space-y-4">
        <p className="text-sm text-[var(--neumorphic-muted)] text-center">
          All fields are optional. Add your social media profiles so members can follow and connect with you.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="instagram" className="text-[var(--neumorphic-text)]">Instagram</Label>
            <Input
              id="instagram"
              placeholder="@username"
              value={formData.socialMedia.instagram || ''}
              onChange={(e) => handleNestedInputChange('socialMedia', 'instagram', e.target.value)}
              className="bg-[var(--neumorphic-surface)] border-[var(--neumorphic-border)] text-[var(--neumorphic-text)]"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="facebook" className="text-[var(--neumorphic-text)]">Facebook</Label>
            <Input
              id="facebook"
              placeholder="@username"
              value={formData.socialMedia.facebook || ''}
              onChange={(e) => handleNestedInputChange('socialMedia', 'facebook', e.target.value)}
              className="bg-[var(--neumorphic-surface)] border-[var(--neumorphic-border)] text-[var(--neumorphic-text)]"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="twitter" className="text-[var(--neumorphic-text)]">Twitter/X</Label>
            <Input
              id="twitter"
              placeholder="@username"
              value={formData.socialMedia.twitter || ''}
              onChange={(e) => handleNestedInputChange('socialMedia', 'twitter', e.target.value)}
              className="bg-[var(--neumorphic-surface)] border-[var(--neumorphic-border)] text-[var(--neumorphic-text)]"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="linkedin" className="text-[var(--neumorphic-text)]">LinkedIn</Label>
            <Input
              id="linkedin"
              placeholder="linkedin.com/in/username"
              value={formData.socialMedia.linkedin || ''}
              onChange={(e) => handleNestedInputChange('socialMedia', 'linkedin', e.target.value)}
              className="bg-[var(--neumorphic-surface)] border-[var(--neumorphic-border)] text-[var(--neumorphic-text)]"
            />
          </div>
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="website" className="text-[var(--neumorphic-text)]">Website</Label>
            <Input
              id="website"
              placeholder="https://yourwebsite.com"
              value={formData.socialMedia.website || ''}
              onChange={(e) => handleNestedInputChange('socialMedia', 'website', e.target.value)}
              className="bg-[var(--neumorphic-surface)] border-[var(--neumorphic-border)] text-[var(--neumorphic-text)]"
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
        <div className="w-16 h-16 bg-gradient-to-br from-pink-500 to-orange-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <Target className="h-8 w-8 text-white" />
        </div>
        <h2 className="text-2xl font-bold text-[var(--neumorphic-text)]">Content Preferences</h2>
        <p className="text-[var(--neumorphic-muted)]">What type of content will you create?</p>
      </div>

      <div className="space-y-6">
        <div className="space-y-2">
          <Label className="text-[var(--neumorphic-text)]">Content Types *</Label>
          <p className="text-sm text-[var(--neumorphic-muted)]">Select all types of content you plan to create</p>
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
                <Label htmlFor={type} className="text-sm cursor-pointer text-[var(--neumorphic-text)]">{type}</Label>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <Label className="text-[var(--neumorphic-text)]">Target Audience</Label>
          <p className="text-sm text-[var(--neumorphic-muted)]">Who will you be training?</p>
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
                <Label htmlFor={audience} className="text-sm cursor-pointer text-[var(--neumorphic-text)]">{audience}</Label>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="experienceLevel" className="text-[var(--neumorphic-text)]">Your Experience Level</Label>
          <select
            id="experienceLevel"
            value={formData.preferences.experienceLevel}
            onChange={(e) => handleNestedInputChange('preferences', 'experienceLevel', e.target.value)}
            className="w-full px-3 py-2 rounded-xl border border-[var(--neumorphic-border)] bg-[var(--neumorphic-surface)] text-[var(--neumorphic-text)] focus:outline-none focus:ring-2 focus:ring-cyan-500"
          >
            <option value="">Select your experience level</option>
            {EXPERIENCE_LEVEL_OPTIONS.map((level) => (
              <option key={level} value={level}>{level}</option>
            ))}
          </select>
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
      <div className="min-h-screen bg-[var(--neumorphic-bg)] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-600 mx-auto"></div>
          <p className="mt-4 text-[var(--neumorphic-muted)]">Loading...</p>
        </div>
      </div>
    );
  }

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
                <span>Become a Trainer</span>
              </div>
              <h1 className="text-4xl md:text-5xl font-bold text-[var(--neumorphic-text)] mb-4">
                Join Our Trainer Community
              </h1>
              <p className="text-xl text-[var(--neumorphic-muted)] max-w-2xl mx-auto">
                Share your expertise and help others achieve their fitness goals
              </p>
              
              {/* User Info Badge */}
              <div className="mt-4 inline-block">
                <Badge variant="outline" className="bg-[var(--neumorphic-surface)] text-[var(--neumorphic-text)] border-[var(--neumorphic-border)] px-4 py-2">
                  <User className="w-4 h-4 mr-2" />
                  Applying as: <strong className="ml-1">{user?.name || 'User'}</strong> ({user?.phone || 'N/A'})
                </Badge>
              </div>
            </div>

            {/* Progress Card */}
            <NeumorphicCard variant="raised" size="lg" className="mb-8">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xl font-bold text-[var(--neumorphic-text)] mb-1">Application Progress</h3>
                    <p className="text-[var(--neumorphic-muted)]">Step {currentStep} of {totalSteps}</p>
                  </div>
                  <Badge className="bg-gradient-to-r from-cyan-500 to-purple-600 text-white">
                    {Math.round(progress)}% Complete
                  </Badge>
                </div>
                <div className="w-full bg-[var(--neumorphic-surface)] rounded-full h-3 overflow-hidden">
                  <div 
                    className="bg-gradient-to-r from-cyan-500 to-purple-600 h-3 rounded-full transition-all duration-500"
                    style={{ width: `${progress}%` }}
                  ></div>
                </div>
              </div>
            </NeumorphicCard>

            {/* Form Card */}
            <NeumorphicCard variant="raised" size="lg">
              {renderCurrentStep()}
            </NeumorphicCard>

            {/* Navigation Buttons */}
            <div className="flex justify-between mt-8">
              <Button
                variant="outline"
                onClick={prevStep}
                disabled={currentStep === 1}
                className="flex items-center h-12 px-6 border-[var(--neumorphic-border)] bg-[var(--neumorphic-surface)] text-[var(--neumorphic-text)] hover:bg-[var(--neumorphic-surface)]"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Previous
              </Button>

              {currentStep < totalSteps ? (
                <Button 
                  onClick={nextStep}
                  className="flex items-center h-12 px-6 bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-600 hover:to-purple-700 text-white"
                >
                  Next
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              ) : (
                <Button 
                  onClick={handleSubmit} 
                  disabled={isSubmitting}
                  className="flex items-center h-12 px-6 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white"
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
      </div>
    </div>
  );
}
