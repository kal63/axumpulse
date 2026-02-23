
// API Client for Compound 360 Backend
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api/v1'

// Helper function to create pagination query string
function createPaginationQuery(params?: { page?: number; pageSize?: number; [key: string]: any }): string {
  if (!params) return ''
  
  const searchParams = new URLSearchParams()
  
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      searchParams.set(key, String(value))
    }
  })
  
  const query = searchParams.toString()
  return query ? `?${query}` : ''
}

export interface ApiError {
  code: string
  message: string
  details?: unknown
  status?: number
  statusText?: string
  responseText?: string
  data?: unknown
  headers?: Record<string, string>
}

export interface ApiResponse<T = unknown> {
  success: boolean
  data?: T
  error?: ApiError
}

export interface PaginatedResponse<T> {
  items: T[]
  pagination: {
    page: number
    pageSize: number
    totalItems: number
    totalPages: number
    hasNext: boolean
    hasPrev: boolean
  }
}

export interface User {
  id: number
  phone: string
  email?: string
  name?: string
  profilePicture?: string
  dateOfBirth?: string
  gender?: 'male' | 'female'
  isAdmin: boolean
  isTrainer: boolean
  isMedical: boolean
  status: 'active' | 'blocked'
  lastLoginAt?: string
  lastActiveAt?: string
  createdAt: string
  updatedAt: string
  profile?: UserProfile
}

export interface UserProfile {
  id: number
  userId: number
  totalXp: number
  level: number
  dailyStreak: number
  workoutStreak: number
  challengeStreak: number
  lastActivityDate?: string
  challengesCompleted: number
  workoutsCompleted: number
  subscriptionTier: 'premium' | 'pro'
  language: string
  notificationSettings: Record<string, unknown>
  fitnessGoals: Record<string, unknown>
  healthMetrics: Record<string, unknown>
  preferences: Record<string, unknown>
  createdAt: string
  updatedAt: string
}

export interface Challenge {
  id: number
  title: string
  description?: string
  kind: string
  ruleJson: Record<string, unknown>
  startTime?: string
  endTime?: string
  active: boolean
  createdBy?: number
  // Additional fields for trainer challenges
  type?: 'fitness' | 'nutrition' | 'wellness' | 'achievement'
  difficulty?: 'beginner' | 'intermediate' | 'advanced'
  duration?: number
  xpReward?: number
  requirements?: string
  contentIds?: number[]
  language?: string
  status?: 'draft' | 'pending' | 'approved' | 'rejected' | 'active'
  rejectionReason?: string
  participantCount?: number
  completionCount?: number
  isPublic?: boolean
  isTrainerCreated?: boolean
  trainerId?: number
  startDate?: string
  endDate?: string
  // Daily challenge fields
  isDailyChallenge?: boolean
  fitnessLevel?: 'beginner' | 'intermediate' | 'advanced' | null
  recurrencePattern?: { days: number[] } | null
  autoAssign?: boolean
  isGameChallenge?: boolean
  createdAt: string
  updatedAt: string
}

export interface DailyChallenge {
  id: number
  title: string
  description?: string
  type?: 'fitness' | 'nutrition' | 'wellness' | 'achievement'
  difficulty?: 'beginner' | 'intermediate' | 'advanced'
  fitnessLevel?: 'beginner' | 'intermediate' | 'advanced' | null
  xpReward?: number
  requirements?: string
  completed: boolean
  completedAt?: string | null
  xpEarned?: number
}

export interface Game {
  id: number
  gameType: 'spin_win' | 'quiz_battle' | 'memory_game'
  title: string
  description?: string
  configJson?: Record<string, unknown>
  xpReward: number
  active: boolean
  difficulty?: 'beginner' | 'intermediate' | 'advanced'
  useAiGeneration?: boolean
  aiPromptTemplate?: string
  cachedContent?: Record<string, unknown> | null
  cacheExpiresAt?: string | null
  createdAt: string
  updatedAt: string
}

export interface LeaderboardEntry {
  rank: number
  userId: number
  name: string
  profilePicture?: string | null
  xp: number
  level: number
  challengesCompleted: number
  workoutsCompleted: number
  streak: number
  city?: string | null
  ageGroup?: string | null
  isCurrentUser?: boolean
}

export interface Reward {
  id: number
  title: string
  costXp: number
  active: boolean
  stock?: number
  createdAt: string
  updatedAt: string
}

export interface TrainerAnalytics {
  overview: {
    totalContent: number
    totalWorkoutPlans: number
    totalChallenges: number
    approvedContent: number
    activeChallenges: number
    totalViews: number
    totalLikes: number
    totalParticipants: number
    totalCompletions: number
    completionRate: number
  }
  growth: {
    content: {
      current: number
      previous: number
      growth: number
    }
    workoutPlans: {
      current: number
      previous: number
      growth: number
    }
    challenges: {
      current: number
      previous: number
      growth: number
    }
  }
  contentAnalytics: {
    byType: Array<{
      type: string
      status: string
      totalViews: string
      totalLikes: string
      count: string
    }>
    byStatus: Array<{
      status: string
      count: string
    }>
    topPerforming: Array<{
      id: number
      title: string
      type: string
      views: number
      likes: number
      createdAt: string
    }>
    recent: Array<{
      id: number
      title: string
      type: string
      views: number
      likes: number
      createdAt: string
    }>
  }
  workoutPlanAnalytics: {
    byDifficulty: Array<{
      difficulty: string
      status: string
      count: string
    }>
    byStatus: Array<{
      difficulty: string
      status: string
      count: string
    }>
  }
  challengeAnalytics: {
    byType: Array<{
      type: string
      difficulty: string
      status: string
      totalParticipants: string
      totalCompletions: string
      count: string
    }>
    byDifficulty: Array<{
      type: string
      difficulty: string
      status: string
      totalParticipants: string
      totalCompletions: string
      count: string
    }>
    byStatus: Array<{
      status: string
      count: string
    }>
  }
  period: string
  generatedAt: string
}

export interface TrainerSettings {
  user: {
    id: number
    name: string
    email: string
    profilePicture: string
    dateOfBirth: string
    gender: 'male' | 'female'
    phone: string
  }
  trainer: {
    bio: string
    specialties: string[]
    verified: boolean
  }
  profile: {
    language: string
    notificationSettings: Record<string, any>
    fitnessGoals: Record<string, any>
    healthMetrics: Record<string, any>
    preferences: Record<string, any>
  }
}

export interface PublicTrainer {
  userId: number
  name: string
  slug: string
  profilePicture?: string | null
  specialties: string[]
}

export interface CertificationFile {
  id: number
  fileName: string
  fileUrl: string
  fileType: string
  fileSize: number
  createdAt: string
}

export interface PublicTrainerDetail {
  userId: number
  user: {
    id: number
    name: string
    email?: string
    profilePicture?: string
    phone?: string
    dateOfBirth?: string
    gender?: 'male' | 'female'
  }
  trainer: {
    bio?: string
    specialties: string[]
    verified: boolean
    verifiedAt?: string
  }
  application: {
    yearsOfExperience?: number
    languages: string[]
    certifications: Array<string | {
      name?: string
      issuer?: string
      date?: string
      expiry?: string
    }>
    portfolio: Array<string | {
      title?: string
      description?: string
      url?: string
    }>
    socialMedia: Record<string, any>
    preferences: Record<string, any>
    certificationFiles: CertificationFile[]
  } | null
}

export interface UpdateSettingsRequest {
  user?: {
    name?: string
    email?: string
    dateOfBirth?: string
    gender?: 'male' | 'female'
  }
  trainer?: {
    bio?: string
    specialties?: string[]
  }
  profile?: {
    language?: string
    notificationSettings?: Record<string, any>
    fitnessGoals?: Record<string, any>
    healthMetrics?: Record<string, any>
    preferences?: Record<string, any>
  }
}

// Moderation interfaces
export interface ModerationItem {
  id: number
  title: string
  description: string
  type?: string
  kind?: string
  status: string
  rejectionReason?: string
  createdAt: string
  updatedAt: string
  trainer?: {
    User: {
      id: number
      name: string
      email: string
    }
  }
  Creator?: {
    id: number
    name: string
    email: string
  }
}

export interface ModerationListResponse {
  items: ModerationItem[]
  pagination: {
    page: number
    pageSize: number
    totalItems: number
    totalPages: number
    hasNext: boolean
    hasPrev: boolean
  }
  filters: {
    kind?: string
    status?: string
    lang?: string
    q?: string
  }
}

export interface ModerationDetailResponse {
  item: ModerationItem
  kind: string
  id: number
}

export interface ApproveRequest {
  kind: 'content' | 'challenge'
  id: number
}

export interface RejectRequest {
  kind: 'content' | 'challenge'
  id: number
  reason: string
}

// Trainer Application Interfaces
export interface TrainerApplication {
  id: number
  userId: number
  // User data is accessed via the user relationship
  user?: {
    id: number
    name: string
    phone: string
    email?: string
    profilePicture?: string
    dateOfBirth?: string
  }
  // Trainer-specific fields
  specialties: string[]
  yearsOfExperience?: number
  bio?: string
  languages: string[]
  certifications: Array<{
    name: string
    issuer: string
    date: string
    expiry?: string
  }>
  portfolio: Array<{
    title: string
    description: string
    url?: string
  }>
  socialMedia: {
    instagram?: string
    facebook?: string
    twitter?: string
    linkedin?: string
    website?: string
  }
  availability: {
    timezone: string
    workingHours: string
    preferredDays: string[]
  }
  preferences: {
    contentTypes: string[]
    targetAudience: string[]
    experienceLevel: string
  }
  status: 'pending' | 'under_review' | 'approved' | 'rejected'
  rejectionReason?: string
  adminNotes?: string
  submittedAt: string
  reviewedAt?: string
  reviewedBy?: number
  certificationFiles?: Array<{
    id: number
    fileName: string
    fileUrl: string
    fileType: string
    fileSize: number
  }>
}

export interface ApplicationStatusResponse {
  id: number
  status: 'pending' | 'under_review' | 'approved' | 'rejected'
  submittedAt: string
  reviewedAt?: string
  rejectionReason?: string
}

export interface ApplicationListResponse {
  items: TrainerApplication[]
  pagination: {
    page: number
    pageSize: number
    totalItems: number
    totalPages: number
  }
}

export interface ApplicationStatsResponse {
  total: number
  pending: number
  approved: number
  rejected: number
  underReview: number
}

export interface SubscriptionPlan {
  id: number
  name: string
  level: 'silver' | 'gold' | 'diamond' | 'platinum'
  dailyPrice: number
  monthlyPrice: number
  threeMonthPrice: number
  sixMonthPrice: number
  nineMonthPrice: number
  yearlyPrice: number
  discounts: {
    monthly: number
    threeMonth: number
    sixMonth: number
    nineMonth: number
    yearly: number
  }
  features: string[]
  minDuration: 'daily' | 'monthly' | 'threeMonth'
  active: boolean
  createdAt: string
  updatedAt: string
}

export interface UserSubscription {
  id: number
  userId: number
  trainerId: number
  subscriptionPlanId: number
  duration: 'daily' | 'monthly' | 'threeMonth' | 'sixMonth' | 'nineMonth' | 'yearly'
  startedAt: string
  expiresAt: string
  status: 'active' | 'expired' | 'cancelled'
  lastPaymentReference?: string
  subscriptionPlan?: SubscriptionPlan
  trainer?: {
    id: number
    name: string
    email?: string
    profilePicture?: string
  }
  createdAt: string
  updatedAt: string
}

export interface PaymentInitRequest {
  subscription_plan_id: number
  trainer_id: number
  duration: 'daily' | 'monthly' | 'threeMonth' | 'sixMonth' | 'nineMonth' | 'yearly'
  phone_number: string
  email?: string
}

export interface PaymentInitResponse {
  checkout_url: string
  tx_ref: string
}

export interface RegisterRequest {
  phone: string
  email?: string
  password: string
  name?: string
  dateOfBirth?: string
  gender?: 'male' | 'female'
}


export interface Language {
  id: number
  code: string
  name: string
  nativeName?: string
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface Trainer {
  userId: number
  bio?: string
  specialties: string[]
  verified: boolean
  createdAt: string
  updatedAt: string
  User?: User
}

// TrainerSite interfaces
export interface TrainerSiteTheme {
  primaryColor?: string
  secondaryColor?: string
  fontFamily?: string
  layout?: string
  ctaColor?: string
}

export interface TrainerSiteSection {
  type: string
  enabled: boolean
  order: number
}

export interface TrainerSiteGalleryImage {
  id: string
  url: string
  caption?: string
  order: number
}

export interface TrainerSiteContent {
  id: string
  title: string
  description?: string
  url: string
  type: 'article' | 'video' | 'post' | 'reel'
  order: number
}

export interface TrainerSiteSocialLinks {
  instagram?: string
  facebook?: string
  twitter?: string
  linkedin?: string
  youtube?: string
  website?: string
}

export interface TrainerSite {
  id: number
  userId: number
  slug?: string
  headline?: string
  subheadline?: string
  bio?: string
  philosophy?: string
  targetAudience?: string
  heroBackgroundImage?: string
  galleryImages: TrainerSiteGalleryImage[]
  theme: TrainerSiteTheme
  sections: TrainerSiteSection[]
  trainerContent: TrainerSiteContent[]
  socialLinks: TrainerSiteSocialLinks
  ctaText?: string
  status: 'draft' | 'published' | 'archived'
  viewCount: number
  createdAt: string
  updatedAt: string
}

export interface PublicTrainer {
  userId: number
  name: string
  slug: string
  profilePicture?: string | null
  specialties: string[]
}

export interface PublicTrainerDetail {
  userId: number
  user: {
    id: number
    name: string
    email?: string
    profilePicture?: string
    phone?: string
    dateOfBirth?: string
    gender?: 'male' | 'female'
  }
  trainer: {
    bio?: string
    specialties: string[]
    verified: boolean
    verifiedAt?: string
  }
  application: {
    yearsOfExperience?: number
    languages: string[]
    certifications: Array<string | {
      name?: string
      issuer?: string
      date?: string
      expiry?: string
    }>
    portfolio: Array<string | {
      title?: string
      description?: string
      url?: string
    }>
    socialMedia: Record<string, any>
    preferences: Record<string, any>
    certificationFiles: CertificationFile[]
  } | null
  site?: {
    slug?: string
    headline?: string
    subheadline?: string
    bio?: string
    philosophy?: string
    targetAudience?: string
    heroBackgroundImage?: string
    galleryImages: TrainerSiteGalleryImage[]
    theme: TrainerSiteTheme
    sections: TrainerSiteSection[]
    trainerContent: TrainerSiteContent[]
    socialLinks: TrainerSiteSocialLinks
    ctaText?: string
  }
}

export interface LoginRequest {
  phone: string
  password: string
}

export interface LoginResponse {
  token: string
  user: User
}

export interface AdminStats {
  users: number
  trainers: number
  challenges: number
  rewards: number
  totalXp?: number
  challengesCompleted?: number
  proSubscriptions?: number
}

export interface TrainerStats {
  contentCount: number
  activeChallenges: number
}

export interface WorkoutExercise {
  id: number
  workoutPlanId: number
  name: string
  description?: string
  category?: string
  muscleGroups: string[]
  equipment?: string
  sets?: number
  reps?: string
  weight?: string
  duration?: number
  restTime?: number
  order: number
  notes?: string
  createdAt: string
  updatedAt: string
}

export interface WorkoutPlan {
  id: number
  trainerId: number
  title: string
  description?: string
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  category?: string
  language?: string
  tags: string[]
  isPublic: boolean
  status: 'draft' | 'pending' | 'approved' | 'rejected'
  estimatedDuration?: number
  totalExercises: number
  exercises?: WorkoutExercise[]
  rejectionReason?: string
  approvedBy?: number
  approvedAt?: string
  rejectedBy?: number
  rejectedAt?: string
  isGameChallenge?: boolean
  trainer?: {
    id: number
    name: string
    email: string
    phone?: string
  }
  insight?: WorkoutPlanInsight
  createdAt: string
  updatedAt: string
}

export interface WorkoutPlanInsight {
  id: number
  userId: number
  workoutPlanId: number
  insightText: string
  customLabels: string[]
  suitability: 'recommended' | 'caution' | 'not_recommended' | 'requires_modification'
  medicalContext?: {
    intakeResponseId?: number
    triageRunId?: number
    consultNoteId?: number
  }
  sourceType: 'ai' | 'medical_professional' | 'ai_edited'
  createdBy?: number
  creator?: {
    id: number
    name: string
    profilePicture?: string
  }
  generatedAt: string
  updatedAt: string
  createdAt: string
}

export interface ContentItem {
  id: number
  trainerId: number
  title: string
  description?: string
  type: 'video' | 'image' | 'document'
  fileUrl?: string
  thumbnailUrl?: string
  duration?: number
  difficulty?: 'beginner' | 'intermediate' | 'advanced'
  category?: 'cardio' | 'strength' | 'yoga' | 'nutrition' | 'wellness'
  language?: string
  tags: string[]
  status: 'draft' | 'pending' | 'approved' | 'rejected'
  rejectionReason?: string
  views: number
  likes: number
  isPublic: boolean
  createdAt: string
  updatedAt: string
  isFeatured: boolean
  trainer?: {
    userId: number
    bio?: string
    specialties?: string[]
    verified?: boolean
    User: {
      id: number
      name: string
      email: string
      profilePicture?: string
    }
  }
}

class ApiClient {
  private baseURL: string
  private token: string | null = null

  constructor(baseURL: string = API_BASE_URL) {
    this.baseURL = baseURL
    // Get token from localStorage if available
    if (typeof window !== 'undefined') {
      this.token = localStorage.getItem('authToken')
    }
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseURL}${endpoint}`
    
    // Debug logging for content update requests
    if (endpoint.includes('/trainer/content/') && options.method === 'PUT') {
      console.log('🔵 Making PUT request to:', {
        fullUrl: url,
        endpoint,
        baseURL: this.baseURL,
        method: options.method,
        bodyPreview: options.body ? String(options.body).substring(0, 200) : 'no body',
        constructedUrl: `${this.baseURL}${endpoint}`
      })
    }
    
    const headers: Record<string, string> = {
      ...(options.headers as Record<string, string>),
    }

    // Only set Content-Type for non-FormData requests
    // FormData needs to set its own Content-Type with boundary
    if (!(options.body instanceof FormData)) {
      headers['Content-Type'] = 'application/json'
    }

    if (this.token) {
      headers.Authorization = `Bearer ${this.token}`
    }

      try {
        // Create AbortController for timeout (30 seconds)
        const controller = new AbortController()
        const timeoutId = setTimeout(() => controller.abort(), 30000)
        
        // Log the actual fetch call for content updates
        if (endpoint.includes('/trainer/content/') && options.method === 'PUT') {
          console.log('🟢 Actually calling fetch with:', {
            url,
            method: options.method,
            hasBody: !!options.body,
            headers: Object.keys(headers)
          })
        }
        
        const response = await fetch(url, {
          ...options,
          headers,
          signal: controller.signal
        })
        
        clearTimeout(timeoutId)
        
        // Log response for debugging (especially for workout plan start)
        if (endpoint.includes('/progress/workout-plan/start') || endpoint.includes('/trainer/content/')) {
          console.log('🟡 Fetch response received:', {
            url,
            status: response.status,
            statusText: response.statusText,
            ok: response.ok,
            redirected: response.redirected,
            urlAfterRedirect: response.url,
            hasBody: !!response.body
          })
        }

        // Try to safely read the response body. Some servers may return
        // non-JSON (HTML error pages, plain text), so we attempt to parse
        // JSON but fall back to text for diagnostics.
        let data: any = undefined
        let responseText: string | undefined = undefined

        try {
          // Use text() first so we can attempt JSON parse and keep the raw text
          responseText = await response.text()
          if (responseText) {
            try {
              data = JSON.parse(responseText)
            } catch (parseError) {
              // Not valid JSON - keep as text
              console.warn('Failed to parse JSON response:', {
                url,
                status: response.status,
                statusText: response.statusText,
                responseText: responseText.substring(0, 500), // First 500 chars
                parseError
              })
              data = undefined
            }
          }
        } catch (readError) {
          // Failed to read response text
          console.error('Failed to read response text:', readError)
          data = undefined
        }
        
        // Debug logging for all requests (to help diagnose issues)
        if (url.includes('/trainer/content/') && (options.method === 'PUT' || url.includes('PUT'))) {
          console.log('API request details:', {
            url,
            method: options.method || 'GET',
            status: response.status,
            statusText: response.statusText,
            ok: response.ok,
            responseText: responseText?.substring(0, 500),
            parsedData: data,
            hasSuccess: data && 'success' in data,
            successValue: data?.success,
            hasData: data && 'data' in data,
            hasError: data && 'error' in data
          })
        }
        
        // Debug logging for failed requests
        if (!response.ok) {
          // Build error info with guaranteed properties
          const errorInfo: any = {
            url: String(url || 'unknown'),
            status: response?.status ?? 'unknown',
            statusText: String(response?.statusText || 'unknown'),
            ok: Boolean(response?.ok ?? false),
            endpoint: String(endpoint || 'unknown'),
            method: String(options.method || 'GET')
          }
          
          // Safely add response text if available
          if (responseText !== undefined && responseText !== null && responseText.length > 0) {
            errorInfo.responseText = String(responseText).substring(0, 500)
          } else {
            errorInfo.responseText = 'No response text available'
          }
          
          // Safely add parsed data if available
          if (data !== undefined && data !== null) {
            try {
              errorInfo.parsedData = data
            } catch (e) {
              errorInfo.parsedDataError = String(e)
            }
          } else {
            errorInfo.parsedData = null
          }
          
          // Safely add headers if available
          try {
            if (response?.headers) {
              errorInfo.headers = Object.fromEntries(response.headers.entries())
            }
          } catch (headerError) {
            errorInfo.headersError = String(headerError)
          }
          
          // Always log non-404 errors
          if (response?.status !== 404) {
            console.log('API request failed:', JSON.stringify(errorInfo, null, 2))
            console.log('API request failed (object):', errorInfo)
          }
        }

      if (!response.ok) {
        // Extract error message from response body if available
        let errorMessage = `HTTP ${response.status}: ${response.statusText}`
        let errorCode = 'HTTP_ERROR'
        
        if (data && typeof data === 'object') {
          // Check for our API error format: { success: false, error: { code, message, details } }
          if (data.error) {
            errorMessage = data.error.message || errorMessage
            errorCode = data.error.code || errorCode
          } 
          // Fallback to direct message property (for other API formats)
          else if (data.message) {
            errorMessage = data.message
          }
          if (data.code && !data.error) {
            errorCode = data.code
          }
        }
        
        // Provide user-friendly messages for common HTTP status codes (only if no specific message was found)
        if (errorMessage === `HTTP ${response.status}: ${response.statusText}`) {
          if (response.status === 401) {
            errorMessage = 'Invalid phone number or password. Please check your credentials and try again.'
          } else if (response.status === 403) {
            errorMessage = 'You do not have permission to perform this action.'
          } else if (response.status === 404) {
            errorMessage = 'The requested resource was not found.'
          } else if (response.status === 400) {
            errorMessage = 'Invalid request. Please check your input and try again.'
          } else if (response.status === 500) {
            errorMessage = 'An internal server error occurred. Please try again later.'
          }
        }
        
        const errorResponse: any = {
          code: errorCode,
          message: errorMessage,
          status: response.status,
          statusText: response.statusText,
        }
        
        // Safely add response text if available
        if (responseText !== undefined) {
          errorResponse.responseText = responseText
        }
        
        // Safely add parsed data if available
        if (data !== undefined) {
          errorResponse.data = data
        }
        
        // Safely add headers if available
        try {
          if (response?.headers) {
            errorResponse.headers = Object.fromEntries(response.headers.entries())
          }
        } catch (headerError) {
          // Headers might not be accessible in some cases
          errorResponse.headersError = String(headerError)
        }
        
        return {
          success: false,
          error: errorResponse,
        }
      }

      // Handle successful responses
      if (data && typeof data === 'object') {
        // If response has success field, use it directly
        if ('success' in data) {
          // Ensure it's properly formatted
          if (data.success === true) {
            // If it has data field, return as-is
            if ('data' in data) {
              return data as ApiResponse<T>
            }
            // If success is true but no data field, wrap the whole object
            return { success: true, data: data as T } as ApiResponse<T>
          }
          // If success is false but we're here (response.ok was true), something is wrong
          // Return the data anyway but log a warning
          if (data.success === false) {
            console.warn('API returned success: false but HTTP status was OK:', {
              url,
              status: response.status,
              data
            })
            return data as ApiResponse<T>
          }
        }
        // If response has data field, wrap it
        if ('data' in data) {
          return { success: true, data: data.data } as ApiResponse<T>
        }
        // If response is the data itself (e.g., { content: {...} })
        return { success: true, data: data as T } as ApiResponse<T>
      }
      
      // If the server returned JSON we return it, otherwise return the raw text
      if (responseText) {
        return { success: true, data: responseText as any } as ApiResponse<T>
      }
      
      // Empty response
      return { success: true, data: undefined as any } as ApiResponse<T>
    } catch (error: any) {
      // Network-level errors (CORS/preflight failure, network down, TLS mismatch)
      // All show up here as thrown by fetch. Include the original error message
      // to help debugging in the browser console.
      
      // Provide helpful error messages for common issues
      let errorMessage = error instanceof Error ? error.message : 'Network error occurred'
      
      if (error.name === 'AbortError' || error.message?.includes('timeout')) {
        errorMessage = 'Request timed out. Please check your network connection.'
      } else if (error.message?.includes('Failed to fetch') || error.message?.includes('NetworkError')) {
        errorMessage = 'Cannot connect to server. If accessing from mobile, ensure you\'re using the correct IP address (not localhost). See MOBILE_ACCESS_SETUP.md for details.'
      } else if (error.message?.includes('CORS')) {
        errorMessage = 'CORS error: Server may not allow requests from this origin.'
      }
      
      return {
        success: false,
        error: {
          code: 'NETWORK_ERROR',
          message: errorMessage,
        },
      }
    }
  }

  // Auth methods
  async login(credentials: LoginRequest): Promise<ApiResponse<LoginResponse>> {
    const response = await this.request<LoginResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    })

    if (response.success && response.data) {
      this.setToken(response.data.token)
    }

    return response
  }

  // Auth methods
  async dev_login(role: string): Promise<ApiResponse<LoginResponse>> {
    const response = await this.request<LoginResponse>('/auth/dev_login', {
      method: 'POST',
      body: JSON.stringify({ role }),
    })

    if (response.success && response.data) {
      this.setToken(response.data.token)
    }

    return response
  }

  setToken(token: string) {
    this.token = token
    if (typeof window !== 'undefined') {
      localStorage.setItem('authToken', token)
    }
  }

  clearToken() {
    this.token = null
    if (typeof window !== 'undefined') {
      localStorage.removeItem('authToken')
    }
  }

  // Admin methods
  async getAdminStats(): Promise<ApiResponse<AdminStats>> {
    return this.request<AdminStats>('/admin/stats')
  }

  // Trainer
  async getTrainerMe(): Promise<ApiResponse<{ trainer: Trainer }>> {
    return this.request<{ trainer: Trainer }>('/trainer/me')
  }

  async getTrainerStats(): Promise<ApiResponse<TrainerStats>> {
    return this.request<TrainerStats>('/trainer/stats')
  }

  async getTrainerAnalytics(period: '7d' | '30d' | '90d' | '1y' = '30d'): Promise<ApiResponse<TrainerAnalytics>> {
    return this.request<TrainerAnalytics>(`/trainer/analytics?period=${period}`)
  }

  // Settings
  async getTrainerSettings(): Promise<ApiResponse<TrainerSettings>> {
    return this.request<TrainerSettings>('/trainer/settings')
  }

  async updateTrainerSettings(settings: UpdateSettingsRequest): Promise<ApiResponse<{ message: string; settings: TrainerSettings }>> {
    return this.request<{ message: string; settings: TrainerSettings }>('/trainer/settings', {
      method: 'PUT',
      body: JSON.stringify(settings),
    })
  }


  async removeProfileImage(): Promise<ApiResponse<{ message: string }>> {
    return this.request<{ message: string }>('/trainer/settings/profile-image', {
      method: 'DELETE',
    })
  }


  async getTrainerContent(params?: { page?: number; pageSize?: number }): Promise<ApiResponse<PaginatedResponse<ContentItem>>> {
    const query = createPaginationQuery(params)
    return this.request<PaginatedResponse<ContentItem>>(`/trainer/content${query}`)
  }

  async createTrainerContent(payload: Partial<ContentItem>): Promise<ApiResponse<{ content: ContentItem }>> {
    return this.request<{ content: ContentItem }>(`/trainer/content`, {
      method: 'POST',
      body: JSON.stringify(payload),
    })
  }

  async getTrainerContentById(id: number): Promise<ApiResponse<{ content: ContentItem }>> {
    return this.request<{ content: ContentItem }>(`/trainer/content/${id}`)
  }

  async updateTrainerContent(id: number, payload: Partial<ContentItem>): Promise<ApiResponse<{ content: ContentItem }>> {
    // Ensure we're using the correct endpoint - NOT trainer/site/trainer-content
    const endpoint = `/trainer/content/${id}`
    console.log('🔵 updateTrainerContent called:', { 
      id, 
      endpoint,
      payload,
      constructedEndpoint: endpoint,
      baseURL: this.baseURL,
      fullUrl: `${this.baseURL}${endpoint}`
    })
    
    // Double-check the endpoint is correct
    if (endpoint.includes('/site/') || endpoint.includes('trainer-content')) {
      console.error('❌ ERROR: Wrong endpoint detected!', endpoint)
      throw new Error(`Invalid endpoint: ${endpoint}. Should be /trainer/content/${id}`)
    }
    
    const result = await this.request<{ content: ContentItem }>(endpoint, {
      method: 'PUT',
      body: JSON.stringify(payload),
    })
    console.log('🟢 updateTrainerContent result:', {
      success: result.success,
      hasData: !!result.data,
      hasError: !!result.error,
      errorKeys: result.error ? Object.keys(result.error) : [],
      fullResult: result
    })
    return result
  }

  async deleteTrainerContent(id: number): Promise<ApiResponse<{ deleted: boolean }>> {
    return this.request<{ deleted: boolean }>(`/trainer/content/${id}`, {
      method: 'DELETE',
    })
  }

  async submitTrainerContentForApproval(id: number): Promise<ApiResponse<{ content: ContentItem }>> {
    return this.request<{ content: ContentItem }>(`/trainer/content/${id}/submit`, {
      method: 'PUT',
    })
  }

  // Workout Plan Methods
  async getTrainerWorkoutPlans(params?: { page?: number; pageSize?: number; status?: string; difficulty?: string }): Promise<ApiResponse<PaginatedResponse<WorkoutPlan>>> {
    const query = createPaginationQuery(params)
    return this.request<PaginatedResponse<WorkoutPlan>>(`/trainer/workout-plans${query}`)
  }

  async createTrainerWorkoutPlan(payload: Partial<WorkoutPlan>): Promise<ApiResponse<{ workoutPlan: WorkoutPlan }>> {
    return this.request<{ workoutPlan: WorkoutPlan }>(`/trainer/workout-plans`, {
      method: 'POST',
      body: JSON.stringify(payload),
    })
  }

  async getTrainerWorkoutPlanById(id: number): Promise<ApiResponse<{ workoutPlan: WorkoutPlan }>> {
    return this.request<{ workoutPlan: WorkoutPlan }>(`/trainer/workout-plans/${id}`)
  }

  async updateTrainerWorkoutPlan(id: number, payload: Partial<WorkoutPlan>): Promise<ApiResponse<{ workoutPlan: WorkoutPlan }>> {
    return this.request<{ workoutPlan: WorkoutPlan }>(`/trainer/workout-plans/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    })
  }

  async deleteTrainerWorkoutPlan(id: number): Promise<ApiResponse<{ deleted: boolean }>> {
    return this.request<{ deleted: boolean }>(`/trainer/workout-plans/${id}`, {
      method: 'DELETE',
    })
  }

  // Workout Exercise Methods
  async addWorkoutExercise(workoutPlanId: number, payload: Partial<WorkoutExercise>): Promise<ApiResponse<{ exercise: WorkoutExercise }>> {
    return this.request<{ exercise: WorkoutExercise }>(`/trainer/workout-plans/${workoutPlanId}/exercises`, {
      method: 'POST',
      body: JSON.stringify(payload),
    })
  }

  async updateWorkoutExercise(workoutPlanId: number, exerciseId: number, payload: Partial<WorkoutExercise>): Promise<ApiResponse<{ exercise: WorkoutExercise }>> {
    return this.request<{ exercise: WorkoutExercise }>(`/trainer/workout-plans/${workoutPlanId}/exercises/${exerciseId}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    })
  }

  async deleteWorkoutExercise(workoutPlanId: number, exerciseId: number): Promise<ApiResponse<{ deleted: boolean }>> {
    return this.request<{ deleted: boolean }>(`/trainer/workout-plans/${workoutPlanId}/exercises/${exerciseId}`, {
      method: 'DELETE',
    })
  }

  // Trainer Challenge Methods
  async getTrainerChallenges(params?: { page?: number; pageSize?: number; status?: string; type?: string; difficulty?: string }): Promise<ApiResponse<PaginatedResponse<Challenge>>> {
    const query = createPaginationQuery(params)
    return this.request<PaginatedResponse<Challenge>>(`/trainer/challenges${query}`)
  }

  async getTrainerChallengeById(id: number): Promise<ApiResponse<{ challenge: Challenge }>> {
    return this.request<{ challenge: Challenge }>(`/trainer/challenges/${id}`, {
      method: 'GET',
    })
  }

  async createTrainerChallenge(payload: Partial<Challenge>): Promise<ApiResponse<{ challenge: Challenge }>> {
    return this.request<{ challenge: Challenge }>('/trainer/challenges', {
      method: 'POST',
      body: JSON.stringify(payload),
    })
  }

  async updateTrainerChallenge(id: number, payload: Partial<Challenge>): Promise<ApiResponse<{ challenge: Challenge }>> {
    return this.request<{ challenge: Challenge }>(`/trainer/challenges/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    })
  }

  async deleteTrainerChallenge(id: number): Promise<ApiResponse<{ deleted: boolean }>> {
    return this.request<{ deleted: boolean }>(`/trainer/challenges/${id}`, {
      method: 'DELETE',
    })
  }

  async submitTrainerChallengeForApproval(id: number): Promise<ApiResponse<{ challenge: Challenge }>> {
    return this.request<{ challenge: Challenge }>(`/trainer/challenges/${id}/submit`, {
      method: 'PUT',
    })
  }



  async getUsers(params?: {
    page?: number
    pageSize?: number
    q?: string
    status?: string
  }): Promise<ApiResponse<PaginatedResponse<User>>> {
    const query = createPaginationQuery(params)
    return this.request<PaginatedResponse<User>>(`/admin/users${query}`)
  }

  async getMe(): Promise<ApiResponse<{ user: User }>> {
    return this.request<{ user: User }>('/auth/me')
  }

  async updateUserAdminStatus(userId: number, isAdmin: boolean): Promise<ApiResponse<{ user: User }>> {
    return this.request<{ user: User }>(`/admin/users/${userId}/admin`, {
      method: 'POST',
      body: JSON.stringify({ isAdmin }),
    })
  }

  async updateUserStatus(userId: number, status: 'active' | 'blocked'): Promise<ApiResponse<{ user: User }>> {
    return this.request<{ user: User }>(`/admin/users/${userId}/status`, {
      method: 'POST',
      body: JSON.stringify({ status }),
    })
  }

  async createChallenge(challenge: Partial<Challenge>): Promise<ApiResponse<{ challenge: Challenge }>> {
    return this.request<{ challenge: Challenge }>('/admin/challenges', {
      method: 'POST',
      body: JSON.stringify(challenge),
    })
  }

  async updateChallenge(challengeId: number, challenge: Partial<Challenge>): Promise<ApiResponse<{ challenge: Challenge }>> {
    return this.request<{ challenge: Challenge }>(`/admin/challenges/${challengeId}`, {
      method: 'PUT',
      body: JSON.stringify(challenge),
    })
  }

  async deleteChallenge(challengeId: number): Promise<ApiResponse<{ deleted: boolean }>> {
    return this.request<{ deleted: boolean }>(`/admin/challenges/${challengeId}`, {
      method: 'DELETE',
    })
  }

  async getChallenges(params?: {
    page?: number
    pageSize?: number
    kind?: string
    active?: string
    q?: string
  }): Promise<ApiResponse<PaginatedResponse<Challenge>>> {
    const query = createPaginationQuery(params)
    return this.request<PaginatedResponse<Challenge>>(`/admin/challenges${query}`)
  }

  async getAdminWorkoutPlans(params?: {
    page?: number
    pageSize?: number
    status?: string
    difficulty?: string
    q?: string
  }): Promise<ApiResponse<PaginatedResponse<WorkoutPlan>>> {
    const query = createPaginationQuery(params)
    return this.request<PaginatedResponse<WorkoutPlan>>(`/admin/workout-plans${query}`)
  }

  async updateAdminWorkoutPlan(workoutPlanId: number, workoutPlan: Partial<WorkoutPlan>): Promise<ApiResponse<{ workoutPlan: WorkoutPlan }>> {
    return this.request<{ workoutPlan: WorkoutPlan }>(`/admin/workout-plans/${workoutPlanId}`, {
      method: 'PUT',
      body: JSON.stringify(workoutPlan),
    })
  }

  async getRewards(params?: {
    page?: number
    pageSize?: number
  }): Promise<ApiResponse<PaginatedResponse<Reward>>> {
    const query = createPaginationQuery(params)
    return this.request<PaginatedResponse<Reward>>(`/admin/rewards${query}`)
  }

  async createReward(reward: Partial<Reward>): Promise<ApiResponse<{ reward: Reward }>> {
    return this.request<{ reward: Reward }>('/admin/rewards', {
      method: 'POST',
      body: JSON.stringify(reward),
    })
  }

  async updateReward(rewardId: number, reward: Partial<Reward>): Promise<ApiResponse<{ reward: Reward }>> {
    return this.request<{ reward: Reward }>(`/admin/rewards/${rewardId}`, {
      method: 'PUT',
      body: JSON.stringify(reward),
    })
  }

  async deleteReward(rewardId: number): Promise<ApiResponse<{ deleted: boolean }>> {
    return this.request<{ deleted: boolean }>(`/admin/rewards/${rewardId}`, {
      method: 'DELETE',
    })
  }

  async getLanguages(): Promise<ApiResponse<Language[]>> {
    // Use public endpoint for languages accessible to all roles
    return this.request<Language[]>(`/public/languages`)
  }

  async getAdminLanguages(): Promise<ApiResponse<{ items: Language[] }>> {
    // Use admin endpoint to get all languages (active and inactive)
    return this.request<{ items: Language[] }>(`/admin/languages`)
  }

  async createLanguage(language: Partial<Language>): Promise<ApiResponse<{ language: Language }>> {
    return this.request<{ language: Language }>('/admin/languages', {
      method: 'POST',
      body: JSON.stringify(language),
    })
  }

  async updateLanguage(languageId: number, language: Partial<Language>): Promise<ApiResponse<{ language: Language }>> {
    return this.request<{ language: Language }>(`/admin/languages/${languageId}`, {
      method: 'PUT',
      body: JSON.stringify(language),
    })
  }

  async deleteLanguage(languageId: number): Promise<ApiResponse<{ deleted: boolean }>> {
    return this.request<{ deleted: boolean }>(`/admin/languages/${languageId}`, {
      method: 'DELETE',
    })
  }

  async toggleLanguageStatus(languageId: number, isActive: boolean): Promise<ApiResponse<{ language: Language }>> {
    return this.request<{ language: Language }>(`/admin/languages/${languageId}/toggle`, {
      method: 'POST',
      body: JSON.stringify({ isActive }),
    })
  }

  async getTrainers(params?: {
    page?: number
    pageSize?: number
    verified?: boolean
    q?: string
  }): Promise<ApiResponse<PaginatedResponse<Trainer>>> {
    const query = createPaginationQuery(params)
    return this.request<PaginatedResponse<Trainer>>(`/admin/trainers${query}`)
  }

  async updateTrainerVerification(userId: number, verified: boolean): Promise<ApiResponse<{ trainer: Trainer }>> {
    return this.request<{ trainer: Trainer }>(`/admin/trainers/${userId}/verify`, {
      method: 'POST',
      body: JSON.stringify({ verified }),
    })
  }

  // Moderation functions
  async getModerationItems(params?: {
    kind?: 'content' | 'challenge' | 'workout-plan'
    status?: string
    lang?: string
    q?: string
    page?: number
    pageSize?: number
  }): Promise<ApiResponse<ModerationListResponse>> {
    const query = createPaginationQuery(params)
    return this.request<ModerationListResponse>(`/admin/moderation${query}`)
  }

  async getModerationItem(kind: 'content' | 'challenge' | 'workout-plan', id: number): Promise<ApiResponse<ModerationDetailResponse>> {
    return this.request<ModerationDetailResponse>(`/admin/moderation/${kind}/${id}`)
  }

  async approveModerationItem(kind: 'content' | 'challenge' | 'workout-plan', id: number): Promise<ApiResponse<{ approved: boolean; kind: string; id: number; item: ModerationItem }>> {
    return this.request<{ approved: boolean; kind: string; id: number; item: ModerationItem }>(`/admin/moderation/${kind}/${id}/approve`, {
      method: 'POST',
    })
  }

  async rejectModerationItem(kind: 'content' | 'challenge' | 'workout-plan', id: number, reason: string): Promise<ApiResponse<{ rejected: boolean; kind: string; id: number; reason: string; item: ModerationItem }>> {
    return this.request<{ rejected: boolean; kind: string; id: number; reason: string; item: ModerationItem }>(`/admin/moderation/${kind}/${id}/reject`, {
      method: 'POST',
      body: JSON.stringify({ reason }),
    })
  }

  async toggleFeaturedStatus(kind: 'content' | 'challenge' | 'workout-plan', id: number): Promise<ApiResponse<{ toggled: boolean; kind: string; id: number; isFeatured: boolean; item: ModerationItem }>> {
    return this.request<{ toggled: boolean; kind: string; id: number; isFeatured: boolean; item: ModerationItem }>(`/admin/moderation/${kind}/${id}/toggle-featured`, {
      method: 'POST',
    })
  }

  // Trainer Application functions
  // Submit trainer application (AUTHENTICATED - requires login)
  async submitTrainerApplication(formData: FormData): Promise<ApiResponse<TrainerApplication>> {
    return this.request<TrainerApplication>('/trainer/apply', {
      method: 'POST',
      body: formData,
    })
  }

  // Get application status for logged-in user
  async getApplicationStatus(): Promise<ApiResponse<TrainerApplication>> {
    return this.request<TrainerApplication>('/trainer/apply/status')
  }

  // Update trainer application (for rejected applications)
  async updateTrainerApplication(formData: FormData): Promise<ApiResponse<TrainerApplication>> {
    return this.request<TrainerApplication>('/trainer/apply', {
      method: 'PUT',
      body: formData,
    })
  }


  // Admin Trainer Application functions
  async getTrainerApplications(params?: {
    page?: number
    pageSize?: number
    status?: string
    q?: string
    sortBy?: string
    sortOrder?: string
  }): Promise<ApiResponse<ApplicationListResponse>> {
    const query = createPaginationQuery(params)
    return this.request<ApplicationListResponse>(`/admin/trainer-applications${query}`)
  }

  async getTrainerApplication(id: number): Promise<ApiResponse<TrainerApplication>> {
    return this.request<TrainerApplication>(`/admin/trainer-applications/${id}`)
  }

  async approveTrainerApplication(id: number, adminNotes?: string): Promise<ApiResponse<TrainerApplication>> {
    return this.request<TrainerApplication>(`/admin/trainer-applications/${id}/approve`, {
      method: 'POST',
      body: JSON.stringify({ adminNotes }),
    })
  }

  async rejectTrainerApplication(id: number, rejectionReason: string, adminNotes?: string): Promise<ApiResponse<TrainerApplication>> {
    return this.request<TrainerApplication>(`/admin/trainer-applications/${id}/reject`, {
      method: 'POST',
      body: JSON.stringify({ rejectionReason, adminNotes }),
    })
  }

  async updateApplicationNotes(id: number, adminNotes: string): Promise<ApiResponse<TrainerApplication>> {
    return this.request<TrainerApplication>(`/admin/trainer-applications/${id}/notes`, {
      method: 'POST',
      body: JSON.stringify({ adminNotes }),
    })
  }

  async getApplicationStats(): Promise<ApiResponse<ApplicationStatsResponse>> {
    return this.request<ApplicationStatsResponse>('/admin/trainer-applications/stats')
  }

  // Workout Plan Approval Methods
  
  // Trainer: Submit workout plan for approval
  async submitWorkoutPlanForApproval(id: number): Promise<ApiResponse<WorkoutPlan>> {
    return this.request<WorkoutPlan>(`/trainer/workout-plans/${id}/submit`, {
      method: 'POST'
    })
  }

  // Trainer: Withdraw workout plan submission
  async withdrawWorkoutPlanSubmission(id: number): Promise<ApiResponse<WorkoutPlan>> {
    return this.request<WorkoutPlan>(`/trainer/workout-plans/${id}/withdraw`, {
      method: 'POST'
    })
  }

  // Trainer: Withdraw challenge submission
  async withdrawChallengeSubmission(id: number): Promise<ApiResponse<Challenge>> {
    return this.request<Challenge>(`/trainer/challenges/${id}/withdraw`, {
      method: 'POST'
    })
  }

  // Trainer: Withdraw content submission
  async withdrawContentSubmission(id: number): Promise<ApiResponse<ContentItem>> {
    return this.request<ContentItem>(`/trainer/content/${id}/withdraw`, {
      method: 'POST'
    })
  }

  // Admin: Get workout plans for moderation (uses existing moderation endpoint with kind='workout-plan')
  // This will be handled by the existing moderation methods with kind parameter

  // Admin: Approve workout plan
  async approveWorkoutPlan(id: number): Promise<ApiResponse<any>> {
    return this.request<any>(`/admin/moderation/workout-plan/${id}/approve`, {
      method: 'POST'
    })
  }

  // Admin: Reject workout plan
  async rejectWorkoutPlan(id: number, reason: string): Promise<ApiResponse<any>> {
    return this.request<any>(`/admin/moderation/workout-plan/${id}/reject`, {
      method: 'POST',
      body: JSON.stringify({ reason })
    })
  }

  // ==================== USER CONTENT DISCOVERY ====================
  
  // Get all approved content with filters
  async getUserContent(params?: {
    page?: number
    pageSize?: number
    type?: string
    category?: string
    difficulty?: string
    language?: string
    duration?: string
    search?: string
  }): Promise<ApiResponse<PaginatedResponse<ContentItem>>> {
    const query = createPaginationQuery(params)
    return this.request<PaginatedResponse<ContentItem>>(`/user/content${query}`)
  }

  // Get single content item with related content
  async getUserContentById(id: number): Promise<ApiResponse<{
    content: ContentItem
    relatedContent: ContentItem[]
  }>> {
    return this.request<{
      content: ContentItem
      relatedContent: ContentItem[]
    }>(`/user/content/${id}`)
  }

  // Get available content categories
  async getUserContentCategories(): Promise<ApiResponse<{ categories: string[] }>> {
    return this.request<{ categories: string[] }>('/user/content/categories')
  }

  // Get all featured content
  async getFeaturedContent(params?: {
    page?: number
    pageSize?: number
  }): Promise<ApiResponse<PaginatedResponse<ContentItem>>> {
    const query = createPaginationQuery(params)
    return this.request<PaginatedResponse<ContentItem>>(`/user/content/featured${query}`)
  }

  // Get all approved workout plans with filters
  async getUserWorkoutPlans(params?: {
    page?: number
    pageSize?: number
    category?: string
    difficulty?: string
    duration?: string
    search?: string
  }): Promise<ApiResponse<PaginatedResponse<WorkoutPlan>>> {
    const query = createPaginationQuery(params)
    return this.request<PaginatedResponse<WorkoutPlan>>(`/user/workout-plans${query}`)
  }

  // Get single workout plan with exercises
  async getUserWorkoutPlanById(id: number): Promise<ApiResponse<{
    workoutPlan: WorkoutPlan
    relatedPlans: WorkoutPlan[]
  }>> {
    return this.request<{
      workoutPlan: WorkoutPlan
      relatedPlans: WorkoutPlan[]
    }>(`/user/workout-plans/${id}`)
  }

  // Get available workout plan categories
  async getUserWorkoutPlanCategories(): Promise<ApiResponse<{ categories: string[] }>> {
    return this.request<{ categories: string[] }>('/user/workout-plans/categories')
  }

  // Workout Plan Insight Methods
  async getWorkoutPlanInsight(planId: number, userId?: number): Promise<ApiResponse<WorkoutPlanInsight>> {
    const query = userId ? `?userId=${userId}` : ''
    return this.request<WorkoutPlanInsight>(`/user/workout-plans/${planId}/insight${query}`)
  }

  async getAvailableUsersForInsight(planId: number): Promise<ApiResponse<{ users: Array<{
    id: number
    name: string
    email?: string
    phone?: string
    profilePicture?: string
    lastBookingDate: string
  }> }>> {
    return this.request<{ users: Array<{
      id: number
      name: string
      email?: string
      phone?: string
      profilePicture?: string
      lastBookingDate: string
    }> }>(`/user/workout-plans/${planId}/insight/available-users`)
  }

  async createOrUpdateWorkoutPlanInsight(
    planId: number,
    data: {
      userId: number
      insightText: string
      customLabels?: string[]
      suitability: 'recommended' | 'caution' | 'not_recommended' | 'requires_modification'
      sourceType?: 'ai' | 'medical_professional' | 'ai_edited'
    }
  ): Promise<ApiResponse<WorkoutPlanInsight>> {
    return this.request<WorkoutPlanInsight>(`/user/workout-plans/${planId}/insight`, {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  async generateWorkoutPlanInsightWithAI(
    planId: number,
    userId: number
  ): Promise<ApiResponse<WorkoutPlanInsight>> {
    return this.request<WorkoutPlanInsight>(`/user/workout-plans/${planId}/insight/generate-ai`, {
      method: 'POST',
      body: JSON.stringify({ userId }),
    })
  }

  async deleteWorkoutPlanInsight(planId: number, userId: number): Promise<ApiResponse<{ message: string }>> {
    return this.request<{ message: string }>(`/user/workout-plans/${planId}/insight?userId=${userId}`, {
      method: 'DELETE',
    })
  }

  // Get all featured workout plans
  async getFeaturedWorkoutPlans(params?: {
    page?: number
    pageSize?: number
  }): Promise<ApiResponse<PaginatedResponse<WorkoutPlan>>> {
    const query = createPaginationQuery(params)
    return this.request<PaginatedResponse<WorkoutPlan>>(`/user/workout-plans/featured${query}`)
  }

  // Get all approved challenges with filters
  async getUserChallenges(params?: {
    page?: number
    pageSize?: number
    status?: string
    category?: string
    difficulty?: string
    search?: string
  }): Promise<ApiResponse<PaginatedResponse<Challenge>>> {
    const query = createPaginationQuery(params)
    return this.request<PaginatedResponse<Challenge>>(`/user/challenges${query}`)
  }

  // Get single challenge with leaderboard
  async getUserChallengeById(id: number): Promise<ApiResponse<{
    challenge: Challenge
    leaderboard: any[]
    participantCount: number
  }>> {
    return this.request<{
      challenge: Challenge
      leaderboard: any[]
      participantCount: number
    }>(`/user/challenges/${id}`)
  }

  // Get available challenge categories
  async getUserChallengeCategories(): Promise<ApiResponse<{ categories: string[] }>> {
    return this.request<{ categories: string[] }>('/user/challenges/categories')
  }

  // Get all featured challenges
  async getFeaturedChallenges(params?: {
    page?: number
    pageSize?: number
  }): Promise<ApiResponse<PaginatedResponse<Challenge>>> {
    const query = createPaginationQuery(params)
    return this.request<PaginatedResponse<Challenge>>(`/user/challenges/featured${query}`)
  }

  // Get challenge leaderboard
  async getChallengeLeaderboard(id: number, limit?: number): Promise<ApiResponse<{
    leaderboard: any[]
    userRank: number | null
    totalParticipants: number
  }>> {
    const query = limit ? `?limit=${limit}` : ''
    return this.request<{
      leaderboard: any[]
      userRank: number | null
      totalParticipants: number
    }>(`/user/challenges/${id}/leaderboard${query}`)
  }

  // ==================== USER ENGAGEMENT ====================

  // Like/unlike content
  async likeContent(contentId: number): Promise<ApiResponse<{
    liked: boolean
    totalLikes: number
  }>> {
    return this.request<{
      liked: boolean
      totalLikes: number
    }>('/user/engagement/like', {
      method: 'POST',
      body: JSON.stringify({ contentId })
    })
  }

  // Save/unsave content
  async saveContent(contentId: number): Promise<ApiResponse<{
    saved: boolean
  }>> {
    return this.request<{
      saved: boolean
    }>('/user/engagement/save', {
      method: 'POST',
      body: JSON.stringify({ contentId })
    })
  }

  // Update watch progress
  async updateWatchProgress(contentId: number, watchTime: number, completed?: boolean, effectiveWatchTime?: number): Promise<ApiResponse<{
    watchTime: number
    completed: boolean
    autoCompleted?: boolean
    xpEarned: number
    watchPercentage: number
    effectiveWatchPercentage: number
    newlyAwardedMilestones?: Array<{ milestone: number; xp: number }>
  }>> {
    return this.request<{
      watchTime: number
      completed: boolean
      autoCompleted?: boolean
      xpEarned: number
      watchPercentage: number
      effectiveWatchPercentage: number
      newlyAwardedMilestones?: Array<{ milestone: number; xp: number }>
    }>('/user/engagement/watch-progress', {
      method: 'POST',
      body: JSON.stringify({ contentId, watchTime, completed, effectiveWatchTime })
    })
  }

  // Get saved content
  async getSavedContent(): Promise<ApiResponse<{ items: any[] }>> {
    return this.request<{ items: any[] }>('/user/engagement/saved')
  }

  // Get watch history
  async getWatchHistory(): Promise<ApiResponse<{ items: any[] }>> {
    return this.request<{ items: any[] }>('/user/engagement/history')
  }

  // ==================== USER PROGRESS ====================

  // Start a workout plan
  async startWorkoutPlan(workoutPlanId: number, gameId?: number): Promise<ApiResponse<{
    planProgress: any
    firstExerciseProgress?: {
      exerciseId: number
      startedAt: string
      completed: boolean
    } | null
  }>> {
    return this.request<{
      planProgress: any
      firstExerciseProgress?: {
        exerciseId: number
        startedAt: string
        completed: boolean
      } | null
    }>('/user/progress/workout-plan/start', {
      method: 'POST',
      body: JSON.stringify({ workoutPlanId, gameId })
    })
  }

  // Complete an exercise
  async completeExercise(workoutPlanId: number, exerciseId: number, timeSpent: number, notes?: string): Promise<ApiResponse<{
    exerciseProgress: any
    planProgress: any
    nextExerciseProgress?: {
      exerciseId: number
      startedAt: string
      completed: boolean
    } | null
  }>> {
    return this.request<{
      exerciseProgress: any
      planProgress: any
      nextExerciseProgress?: {
        exerciseId: number
        startedAt: string
        completed: boolean
      } | null
    }>('/user/progress/exercise/complete', {
      method: 'POST',
      body: JSON.stringify({ workoutPlanId, exerciseId, timeSpent, notes })
    })
  }

  // Join a challenge
  async joinChallenge(challengeId: number): Promise<ApiResponse<any>> {
    return this.request<any>('/user/progress/challenge/join', {
      method: 'POST',
      body: JSON.stringify({ challengeId })
    })
  }

  // Update challenge progress
  async updateChallengeProgress(challengeId: number, progress: number): Promise<ApiResponse<any>> {
    return this.request<any>('/user/progress/challenge/update', {
      method: 'POST',
      body: JSON.stringify({ challengeId, progress })
    })
  }

  // Get user's active workout plans
  async getMyWorkoutPlans(): Promise<ApiResponse<{ items: any[] }>> {
    return this.request<{ items: any[] }>('/user/progress/my-workout-plans')
  }

  // Get user's active challenges
  async getMyChallenges(): Promise<ApiResponse<{ items: any[] }>> {
    return this.request<{ items: any[] }>('/user/progress/my-challenges')
  }

  // Get detailed workout plan progress
  async getWorkoutPlanProgress(id: number): Promise<ApiResponse<{
    planProgress: any
    exerciseProgress: any[]
  }>> {
    return this.request<{
      planProgress: any
      exerciseProgress: any[]
    }>(`/user/progress/workout-plan/${id}`)
  }

  // ==================== USER PROFILE & XP ====================

  // Get user profile
  async getUserProfile(): Promise<ApiResponse<{
    user: {
      id: number
      name: string
      email: string
      profilePicture: string | null
      bio: string | null
      location: string | null
      xp: number
      level: number
      xpProgress: number
      xpNeeded: number
      levelProgress: number
      dailyStreak: number
      workoutStreak: number
      challengeStreak: number
      createdAt: string
    }
    stats: {
      contentWatched: number
      workoutPlansCompleted: number
      challengesCompleted: number
      achievementsUnlocked: number
    }
  }>> {
    return this.request<{
      user: any
      stats: any
    }>('/user/profile')
  }

  // Update user profile
  async updateUserProfile(data: {
    name?: string
    bio?: string
    location?: string
    profilePicture?: string
  }): Promise<ApiResponse<{
    user: {
      id: number
      name: string
      email: string
      profilePicture: string | null
      bio: string | null
      location: string | null
      xp: number
      level: number
    }
  }>> {
    return this.request<{
      user: any
    }>('/user/profile', {
      method: 'PUT',
      body: JSON.stringify(data)
    })
  }


  // Get user achievements (legacy - use getAchievements instead)
  async getUserAchievements(): Promise<ApiResponse<{
    achievements: any[]
    totalUnlocked: number
    totalAchievements: number
  }>> {
    return this.request<{
      achievements: any[]
      totalUnlocked: number
      totalAchievements: number
    }>('/user/profile/achievements')
  }


  // Refresh all achievements (re-check criteria)
  async refreshAchievements(): Promise<ApiResponse<{
    achievements: Array<{
      id: number
      name: string
      description: string
      icon: string
      rarity: 'common' | 'rare' | 'epic' | 'legendary'
      xpReward: number
      unlocked: boolean
      unlockedAt: string | null
    }>
    totalUnlocked: number
    totalAchievements: number
    newlyUnlocked: number
  }>> {
    return this.request<{
      achievements: Array<{
        id: number
        name: string
        description: string
        icon: string
        rarity: 'common' | 'rare' | 'epic' | 'legendary'
        xpReward: number
        unlocked: boolean
        unlockedAt: string | null
      }>
      totalUnlocked: number
      totalAchievements: number
      newlyUnlocked: number
    }>('/user/achievements/refresh', {
      method: 'POST'
    })
  }

  // Get activity log
  async getActivityLog(params?: {
    page?: number
    pageSize?: number
    activityType?: string
    startDate?: string
    endDate?: string
  }): Promise<ApiResponse<{
    activities: Array<{
      id: number
      userId: number
      activityType: string
      entityId: number | null
      entityType: string | null
      xpEarned: number
      metadata: Record<string, unknown>
      createdAt: string
      updatedAt: string
    }>
    pagination: {
      currentPage: number
      pageSize: number
      totalItems: number
      totalPages: number
    }
  }>> {
    const query = createPaginationQuery(params)
    return this.request<{
      activities: Array<{
        id: number
        userId: number
        activityType: string
        entityId: number | null
        entityType: string | null
        xpEarned: number
        metadata: Record<string, unknown>
        createdAt: string
        updatedAt: string
      }>
      pagination: {
        currentPage: number
        pageSize: number
        totalItems: number
        totalPages: number
      }
    }>(`/user/activity${query}`)
  }

  // Get activity statistics
  async getActivityStats(params?: {
    days?: number
  }): Promise<ApiResponse<{
    period: string
    activitiesByType: Array<{
      activityType: string
      count: number
      totalXP: number
    }>
    totalXP: number
    dailyActivity: Array<{
      date: string
      count: number
    }>
  }>> {
    const query = params?.days ? `?days=${params.days}` : ''
    return this.request<{
      period: string
      activitiesByType: Array<{
        activityType: string
        count: number
        totalXP: number
      }>
      totalXP: number
      dailyActivity: Array<{
        date: string
        count: number
      }>
    }>(`/user/activity/stats${query}`)
  }

  // Get available languages (user endpoint)
  async getUserLanguages(): Promise<ApiResponse<Language[]>> {
    return this.request<Language[]>('/user/languages')
  }

  // Add XP to user
  async addUserXP(xp: number, reason?: string): Promise<ApiResponse<{
    xp: number
    level: number
    xpAdded: number
    leveledUp: boolean
    reason: string
  }>> {
    return this.request<{
      xp: number
      level: number
      xpAdded: number
      leveledUp: boolean
      reason: string
    }>('/user/profile/add-xp', {
      method: 'POST',
      body: JSON.stringify({ xp, reason })
    })
  }

  // ===== USER SETTINGS API =====

  // Get all user settings
  async getUserSettings(): Promise<ApiResponse<{
    account: {
      name: string
      email: string
      phone: string
      dateOfBirth: string | null
      gender: 'male' | 'female' | null
      profilePicture: string | null
    }
    preferences: {
      language: string
      theme: string
      units: string
      timeFormat: string
      dateFormat: string
      workout: {
        duration: string
        intensity: string
        equipment: string[]
      }
    }
    notifications: {
      email: {
        challengeReminders: boolean
        achievementNotifications: boolean
        weeklyReports: boolean
        marketing: boolean
      }
      push: {
        workoutReminders: boolean
        challengeUpdates: boolean
        achievementUnlocks: boolean
      }
      frequency: string
    }
    fitness: {
      goals: {
        primary: string
        secondary: string[]
        targetWeight: number | null
        targetDate: string | null
      }
      healthMetrics: {
        height: number | null
        weight: number | null
        activityLevel: string
      }
      workoutPreferences: {
        duration: string
        intensity: string
        equipment: string[]
      }
    }
  }>> {
    return this.request('/user/settings')
  }

  // Update all user settings
  async updateUserSettings(settings: {
    account?: {
      name?: string
      email?: string
      dateOfBirth?: string
      gender?: 'male' | 'female'
    }
    preferences?: {
      language?: string
      theme?: string
      units?: string
      timeFormat?: string
      dateFormat?: string
      workout?: {
        duration?: string
        intensity?: string
        equipment?: string[]
      }
    }
    notifications?: {
      email?: {
        challengeReminders?: boolean
        achievementNotifications?: boolean
        weeklyReports?: boolean
        marketing?: boolean
      }
      push?: {
        workoutReminders?: boolean
        challengeUpdates?: boolean
        achievementUnlocks?: boolean
      }
      frequency?: string
    }
    fitness?: {
      goals?: {
        primary?: string
        secondary?: string[]
        targetWeight?: number | null
        targetDate?: string | null
      }
      healthMetrics?: {
        height?: number | null
        weight?: number | null
        activityLevel?: string
      }
      workoutPreferences?: {
        duration?: string
        intensity?: string
        equipment?: string[]
      }
    }
  }): Promise<ApiResponse<{ message: string }>> {
    return this.request('/user/settings', {
      method: 'PUT',
      body: JSON.stringify(settings)
    })
  }

  // Get account information
  async getUserAccount(): Promise<ApiResponse<{
    name: string
    email: string
    phone: string
    dateOfBirth: string | null
    gender: 'male' | 'female' | null
    profilePicture: string | null
  }>> {
    return this.request('/user/settings/account')
  }

  // Update account information
  async updateUserAccount(account: {
    name?: string
    email?: string
    dateOfBirth?: string
    gender?: 'male' | 'female'
  }): Promise<ApiResponse<{ message: string }>> {
    return this.request('/user/settings/account', {
      method: 'PUT',
      body: JSON.stringify(account)
    })
  }

  // Get app preferences
  async getUserPreferences(): Promise<ApiResponse<{
    language: string
    theme: string
    units: string
    timeFormat: string
    dateFormat: string
    workout: {
      duration: string
      intensity: string
      equipment: string[]
    }
  }>> {
    return this.request('/user/settings/preferences')
  }

  // Update app preferences
  async updateUserPreferences(preferences: {
    language?: string
    theme?: string
    units?: string
    timeFormat?: string
    dateFormat?: string
    workout?: {
      duration?: string
      intensity?: string
      equipment?: string[]
    }
  }): Promise<ApiResponse<{ message: string }>> {
    return this.request('/user/settings/preferences', {
      method: 'PUT',
      body: JSON.stringify(preferences)
    })
  }

  // Get notification settings
  async getUserNotifications(): Promise<ApiResponse<{
    email: {
      challengeReminders: boolean
      achievementNotifications: boolean
      weeklyReports: boolean
      marketing: boolean
    }
    push: {
      workoutReminders: boolean
      challengeUpdates: boolean
      achievementUnlocks: boolean
    }
    frequency: string
  }>> {
    return this.request('/user/settings/notifications')
  }

  // Update notification settings
  async updateUserNotifications(notifications: {
    email?: {
      challengeReminders?: boolean
      achievementNotifications?: boolean
      weeklyReports?: boolean
      marketing?: boolean
    }
    push?: {
      workoutReminders?: boolean
      challengeUpdates?: boolean
      achievementUnlocks?: boolean
    }
    frequency?: string
  }): Promise<ApiResponse<{ message: string }>> {
    return this.request('/user/settings/notifications', {
      method: 'PUT',
      body: JSON.stringify(notifications)
    })
  }

  // Get fitness settings
  async getUserFitness(): Promise<ApiResponse<{
    goals: {
      primary: string
      secondary: string[]
      targetWeight: number | null
      targetDate: string | null
    }
    healthMetrics: {
      height: number | null
      weight: number | null
      activityLevel: string
    }
    workoutPreferences: {
      duration: string
      intensity: string
      equipment: string[]
    }
  }>> {
    return this.request('/user/settings/fitness')
  }

  // Update fitness settings
  async updateUserFitness(fitness: {
    goals?: {
      primary?: string
      secondary?: string[]
      targetWeight?: number | null
      targetDate?: string | null
    }
    healthMetrics?: {
      height?: number | null
      weight?: number | null
      activityLevel?: string
    }
    workoutPreferences?: {
      duration?: string
      intensity?: string
      equipment?: string[]
    }
  }): Promise<ApiResponse<{ message: string }>> {
    return this.request('/user/settings/fitness', {
      method: 'PUT',
      body: JSON.stringify(fitness)
    })
  }

  // ==================== USER MEDICAL API ====================

  // Medical Profile
  async getMedicalProfile(): Promise<ApiResponse<any>> {
    return this.request('/user/medical/profile')
  }

  async updateMedicalProfile(profile: {
    conditions?: string[]
    medications?: Array<{ name: string; dosage?: string; frequency?: string }>
    allergies?: string[]
    surgeries?: Array<{ type: string; date?: string }>
    pregnancyStatus?: string | null
    contraindications?: string[]
    notes?: string | null
  }): Promise<ApiResponse<any>> {
    return this.request('/user/medical/profile', {
      method: 'PUT',
      body: JSON.stringify(profile)
    })
  }

  // Intake Forms
  async getIntakeForms(): Promise<ApiResponse<any[]>> {
    return this.request('/user/medical/intake-forms')
  }

  async submitIntakeForm(formId: number, answers: Record<string, any>): Promise<ApiResponse<{
    intakeResponse: any
    triageRun: any
  }>> {
    return this.request('/user/medical/intake', {
      method: 'POST',
      body: JSON.stringify({ formId, answers })
    })
  }

  // Triage Runs
  async getTriageRuns(params?: {
    page?: number
    pageSize?: number
    riskLevel?: string
  }): Promise<ApiResponse<PaginatedResponse<any>>> {
    const query = createPaginationQuery(params)
    return this.request<PaginatedResponse<any>>(`/user/medical/triage-runs${query}`)
  }

  async getTriageRun(id: number): Promise<ApiResponse<any>> {
    return this.request(`/user/medical/triage-runs/${id}`)
  }

  // Medical Questions
  async getMedicalQuestions(params?: {
    page?: number
    pageSize?: number
    status?: string
  }): Promise<ApiResponse<PaginatedResponse<any>>> {
    const query = createPaginationQuery(params)
    return this.request<PaginatedResponse<any>>(`/user/medical/questions${query}`)
  }

  async submitQuestion(data: {
    text: string
    tags?: string[]
    triageRunId?: number
  }): Promise<ApiResponse<any>> {
    return this.request('/user/medical/questions', {
      method: 'POST',
      body: JSON.stringify(data)
    })
  }

  async getQuestion(id: number): Promise<ApiResponse<any>> {
    return this.request(`/user/medical/questions/${id}`)
  }

  // Consult Slots & Bookings (legacy - use getConsultSlots with providerId instead)
  // Removed duplicate - see getConsultSlots below for current implementation

  async getConsultBookings(params?: {
    page?: number
    pageSize?: number
    status?: string
  }): Promise<ApiResponse<PaginatedResponse<any>>> {
    const query = createPaginationQuery(params)
    return this.request<PaginatedResponse<any>>(`/user/medical/consults/bookings${query}`)
  }

  async getConsultBooking(id: number): Promise<ApiResponse<any>> {
    return this.request(`/user/medical/consults/bookings/${id}`)
  }

  async cancelConsultBooking(id: number, cancelReason?: string): Promise<ApiResponse<{ message: string }>> {
    return this.request(`/user/medical/consults/bookings/${id}/cancel`, {
      method: 'PATCH',
      body: JSON.stringify({ cancelReason })
    })
  }

  // Call Management (User)
  async joinCall(bookingId: number): Promise<ApiResponse<{ bookingId: number; roomId: string; callStatus: string }>> {
    return this.request(`/user/medical/consults/bookings/${bookingId}/join-call`, {
      method: 'POST'
    })
  }

  async getUserCallStatus(bookingId: number): Promise<ApiResponse<{ bookingId: number; callStatus: string; callRoomId?: string; callStartedAt?: string; callEndedAt?: string }>> {
    return this.request(`/user/medical/consults/bookings/${bookingId}/call-status`)
  }

  // Health Data
  async getHealthData(params?: {
    page?: number
    pageSize?: number
    metric?: string
    startDate?: string
    endDate?: string
  }): Promise<ApiResponse<PaginatedResponse<any>>> {
    const query = createPaginationQuery(params)
    return this.request<PaginatedResponse<any>>(`/user/medical/health-data${query}`)
  }

  async logHealthData(data: {
    metric: string
    value: number
    unit?: string
    timestamp?: string
    metadata?: Record<string, any>
  }): Promise<ApiResponse<any>> {
    return this.request('/user/medical/health-data', {
      method: 'POST',
      body: JSON.stringify(data)
    })
  }

  async getHealthRollups(params?: {
    metric?: string
    period?: 'daily' | 'weekly' | 'monthly'
    startDate?: string
    endDate?: string
  }): Promise<ApiResponse<any[]>> {
    const query = createPaginationQuery(params)
    return this.request<any[]>(`/user/medical/health-data/rollups${query}`)
  }

  // Health Alerts
  async getHealthAlerts(params?: {
    page?: number
    pageSize?: number
    severity?: string
    status?: string
    metric?: string
  }): Promise<ApiResponse<PaginatedResponse<any>>> {
    const query = createPaginationQuery(params)
    return this.request<PaginatedResponse<any>>(`/user/medical/alerts${query}`)
  }

  async acknowledgeAlert(id: number): Promise<ApiResponse<any>> {
    return this.request(`/user/medical/alerts/${id}/acknowledge`, {
      method: 'POST'
    })
  }

  // Medical Professional Application
  async submitMedicalApplication(formData: FormData): Promise<ApiResponse<any>> {
    return this.request('/medical/apply', {
      method: 'POST',
      body: formData,
      headers: {} // Let browser set Content-Type for FormData
    })
  }

  async getMedicalApplicationStatus(): Promise<ApiResponse<any>> {
    return this.request('/medical/apply/status')
  }

  async updateMedicalApplication(formData: FormData): Promise<ApiResponse<any>> {
    return this.request('/medical/apply', {
      method: 'PUT',
      body: formData,
      headers: {} // Let browser set Content-Type for FormData
    })
  }

  // ==================== MEDICAL PROFESSIONAL API ====================

  // Dashboard
  async getMedicalDashboard(): Promise<ApiResponse<{
    pendingQuestions: number
    upcomingConsults: number
    highRiskTriageRuns: number
    openAlerts: number
  }>> {
    return this.request('/medical/dashboard')
  }

  // Triage Queue
  async getTriageQueue(params?: {
    page?: number
    pageSize?: number
    riskLevel?: string
    disposition?: string
  }): Promise<ApiResponse<PaginatedResponse<any>>> {
    const query = createPaginationQuery(params)
    return this.request<PaginatedResponse<any>>(`/medical/triage-queue${query}`)
  }

  async getMedicalTriageRun(id: number): Promise<ApiResponse<any>> {
    return this.request(`/medical/triage-runs/${id}`)
  }

  async updateTriageRun(id: number, data: {
    riskLevel?: string
    disposition?: string
    messages?: string[]
  }): Promise<ApiResponse<any>> {
    return this.request(`/medical/triage-runs/${id}/review`, {
      method: 'PUT',
      body: JSON.stringify(data)
    })
  }

  // Triage Rules
  async getTriageRules(params?: {
    page?: number
    pageSize?: number
    status?: string
    severity?: string
  }): Promise<ApiResponse<PaginatedResponse<any>>> {
    const query = createPaginationQuery(params)
    return this.request<PaginatedResponse<any>>(`/medical/triage-rules${query}`)
  }

  async getTriageRule(id: number): Promise<ApiResponse<any>> {
    return this.request(`/medical/triage-rules/${id}`)
  }

  async createTriageRule(data: {
    name: string
    version: string
    severity: 'low' | 'medium' | 'high' | 'critical'
    definition: Record<string, any>
  }): Promise<ApiResponse<any>> {
    return this.request('/medical/triage-rules', {
      method: 'POST',
      body: JSON.stringify(data)
    })
  }

  async updateTriageRule(id: number, data: {
    name?: string
    version?: string
    severity?: 'low' | 'medium' | 'high' | 'critical'
    definition?: Record<string, any>
  }): Promise<ApiResponse<any>> {
    return this.request(`/medical/triage-rules/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    })
  }

  async publishTriageRule(id: number): Promise<ApiResponse<any>> {
    return this.request(`/medical/triage-rules/${id}/publish`, {
      method: 'POST'
    })
  }

  async retireTriageRule(id: number): Promise<ApiResponse<any>> {
    return this.request(`/medical/triage-rules/${id}/retire`, {
      method: 'POST'
    })
  }

  async testTriageRule(testData: Record<string, any>): Promise<ApiResponse<any>> {
    return this.request('/medical/triage-rules/test', {
      method: 'POST',
      body: JSON.stringify(testData)
    })
  }

  // Q&A Inbox
  async getMedicalQuestionsInbox(params?: {
    page?: number
    pageSize?: number
    status?: string
  }): Promise<ApiResponse<PaginatedResponse<any>>> {
    const query = createPaginationQuery(params)
    return this.request<PaginatedResponse<any>>(`/medical/questions${query}`)
  }

  async getMedicalQuestion(id: number): Promise<ApiResponse<any>> {
    return this.request(`/medical/questions/${id}`)
  }

  async answerQuestion(id: number, data: {
    text: string
    visibility: 'user' | 'user_trainer' | 'internal'
  }): Promise<ApiResponse<any>> {
    return this.request(`/medical/questions/${id}/answers`, {
      method: 'POST',
      body: JSON.stringify(data)
    })
  }

  async getMedicalConsult(id: number): Promise<ApiResponse<any>> {
    return this.request(`/medical/consults/bookings/${id}`)
  }

  async updateConsultSlot(id: number, data: {
    startTime?: string
    duration?: number
    consultType?: 'quick' | 'full' | 'follow_up'
  }): Promise<ApiResponse<any>> {
    return this.request(`/medical/consults/slots/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    })
  }

  async createConsultNote(bookingId: number, data: {
    soapNotes?: {
      subjective?: string
      objective?: string
      assessment?: string
      plan?: string
    }
    diagnoses?: string[]
    recommendations?: string[]
    followUps?: Array<{ type: string; date?: string; notes?: string }>
    constraints?: Record<string, any>
    shareWithUser?: boolean
  }): Promise<ApiResponse<any>> {
    // Transform soapNotes to soap for backend
    const requestData: any = {
      diagnoses: data.diagnoses,
      recommendations: data.recommendations,
      followUps: data.followUps,
      constraints: data.constraints
    }
    
    // Convert soapNotes to soap format expected by backend
    if (data.soapNotes) {
      requestData.soap = {
        subjective: data.soapNotes.subjective,
        objective: data.soapNotes.objective,
        assessment: data.soapNotes.assessment,
        plan: data.soapNotes.plan
      }
    }
    
    return this.request(`/medical/consults/bookings/${bookingId}/notes`, {
      method: 'POST',
      body: JSON.stringify(requestData)
    })
  }

  async getConsultNotes(bookingId: number): Promise<ApiResponse<any>> {
    return this.request(`/medical/consults/bookings/${bookingId}/notes`)
  }

  async shareConsultSummary(bookingId: number): Promise<ApiResponse<any>> {
    return this.request(`/medical/consults/bookings/${bookingId}/share-summary`, {
      method: 'PUT'
    })
  }

  async completeConsult(bookingId: number): Promise<ApiResponse<any>> {
    return this.request(`/medical/consults/bookings/${bookingId}/complete`, {
      method: 'PUT'
    })
  }

  // Call Management (Medical Pro)
  async startCall(bookingId: number): Promise<ApiResponse<{ bookingId: number; roomId: string; callRoomId: string; callStatus: string }>> {
    return this.request(`/medical/consults/bookings/${bookingId}/start-call`, {
      method: 'POST'
    })
  }

  async getCallStatus(bookingId: number): Promise<ApiResponse<{ bookingId: number; callStatus: string; callRoomId?: string; callStartedAt?: string; callEndedAt?: string }>> {
    return this.request(`/medical/consults/bookings/${bookingId}/call-status`)
  }

  // Client Management
  async getMedicalClients(params?: {
    page?: number
    pageSize?: number
    q?: string
  }): Promise<ApiResponse<PaginatedResponse<any>>> {
    const query = createPaginationQuery(params)
    return this.request<PaginatedResponse<any>>(`/medical/clients${query}`)
  }

  async getMedicalClient(userId: number): Promise<ApiResponse<any>> {
    return this.request(`/medical/clients/${userId}`)
  }

  // Health Alerts (Medical Pro)
  async getMedicalAlerts(params?: {
    page?: number
    pageSize?: number
    severity?: string
    assigned?: boolean
  }): Promise<ApiResponse<PaginatedResponse<any>>> {
    const query = createPaginationQuery(params)
    return this.request<PaginatedResponse<any>>(`/medical/alerts${query}`)
  }

  async assignAlert(id: number, assignToId?: number): Promise<ApiResponse<any>> {
    return this.request(`/medical/alerts/${id}/assign`, {
      method: 'POST',
      body: JSON.stringify({ assignToId })
    })
  }

  async acknowledgeMedicalAlert(id: number): Promise<ApiResponse<any>> {
    return this.request(`/medical/alerts/${id}/ack`, {
      method: 'PUT'
    })
  }

  // Intake Forms Management (Medical Professional)
  async getMedicalIntakeForms(params?: {
    page?: number
    pageSize?: number
    status?: string
  }): Promise<ApiResponse<PaginatedResponse<any>>> {
    const query = createPaginationQuery(params)
    return this.request<PaginatedResponse<any>>(`/medical/intake-forms${query}`)
  }

  async getMedicalIntakeForm(id: number): Promise<ApiResponse<any>> {
    return this.request(`/medical/intake-forms/${id}`)
  }

  async createMedicalIntakeForm(data: {
    version: string
    schema: Record<string, any>
  }): Promise<ApiResponse<any>> {
    return this.request('/medical/intake-forms', {
      method: 'POST',
      body: JSON.stringify(data)
    })
  }

  async updateMedicalIntakeForm(id: number, data: {
    version?: string
    schema?: Record<string, any>
    status?: 'draft' | 'published'
  }): Promise<ApiResponse<any>> {
    return this.request(`/medical/intake-forms/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    })
  }

  async publishMedicalIntakeForm(id: number): Promise<ApiResponse<any>> {
    return this.request(`/medical/intake-forms/${id}/publish`, {
      method: 'POST'
    })
  }

  async deleteMedicalIntakeForm(id: number): Promise<ApiResponse<{ deleted: boolean }>> {
    return this.request(`/medical/intake-forms/${id}`, {
      method: 'DELETE'
    })
  }

  // ==================== ADMIN MEDICAL APPLICATIONS API ====================

  async getMedicalApplications(params?: {
    page?: number
    pageSize?: number
    status?: string
    q?: string
  }): Promise<ApiResponse<PaginatedResponse<any>>> {
    const query = createPaginationQuery(params)
    return this.request<PaginatedResponse<any>>(`/admin/medical-applications${query}`)
  }

  async getMedicalApplication(id: number): Promise<ApiResponse<any>> {
    return this.request(`/admin/medical-applications/${id}`)
  }

  async approveMedicalApplication(id: number, adminNotes?: string): Promise<ApiResponse<any>> {
    return this.request(`/admin/medical-applications/${id}/approve`, {
      method: 'PUT',
      body: JSON.stringify({ adminNotes })
    })
  }

  async rejectMedicalApplication(id: number, rejectionReason: string, adminNotes?: string): Promise<ApiResponse<any>> {
    return this.request(`/admin/medical-applications/${id}/reject`, {
      method: 'PUT',
      body: JSON.stringify({ rejectionReason, adminNotes })
    })
  }

  async updateMedicalApplicationNotes(id: number, adminNotes: string): Promise<ApiResponse<any>> {
    return this.request(`/admin/medical-applications/${id}/notes`, {
      method: 'POST',
      body: JSON.stringify({ adminNotes })
    })
  }

  async markMedicalApplicationUnderReview(id: number): Promise<ApiResponse<any>> {
    return this.request(`/admin/medical-applications/${id}/under-review`, {
      method: 'PUT'
    })
  }

  // ==================== MEDICAL CONSULT SCHEDULES API ====================

  // Get weekly schedules for medical professional
  async getMedicalConsultSchedules(): Promise<ApiResponse<any[]>> {
    return this.request<any[]>('/medical/consults/schedules')
  }

  // Create a weekly schedule entry
  async createConsultSchedule(schedule: {
    dayOfWeek: number
    startTime: string
    endTime: string
    duration?: number
    type?: 'quick' | 'full' | 'follow_up'
    timezone?: string
    status?: 'active' | 'inactive'
  }): Promise<ApiResponse<any>> {
    return this.request('/medical/consults/schedules', {
      method: 'POST',
      body: JSON.stringify(schedule)
    })
  }

  // Update a weekly schedule entry
  async updateConsultSchedule(id: number, schedule: {
    dayOfWeek?: number
    startTime?: string
    endTime?: string
    duration?: number
    type?: 'quick' | 'full' | 'follow_up'
    timezone?: string
    status?: 'active' | 'inactive'
  }): Promise<ApiResponse<any>> {
    return this.request(`/medical/consults/schedules/${id}`, {
      method: 'PUT',
      body: JSON.stringify(schedule)
    })
  }

  // Delete a weekly schedule entry
  async deleteConsultSchedule(id: number): Promise<ApiResponse<{ deleted: boolean }>> {
    return this.request<{ deleted: boolean }>(`/medical/consults/schedules/${id}`, {
      method: 'DELETE'
    })
  }

  // Get available doctors for booking
  async getConsultDoctors(): Promise<ApiResponse<Array<{
    id: number
    name: string
    email?: string
    profilePicture?: string
    medicalProfessional?: {
      professionalType: string
      specialties: string[]
      verified: boolean
      consultFee?: number
    }
  }>>> {
    return this.request<Array<{
      id: number
      name: string
      email?: string
      profilePicture?: string
      medicalProfessional?: {
        professionalType: string
        specialties: string[]
        verified: boolean
        consultFee?: number
      }
    }>>('/user/medical/consults/doctors')
  }

  // Get user's consult balance
  async getConsultBalance(): Promise<ApiResponse<{ availableConsults: number }>> {
    return this.request<{ availableConsults: number }>('/user/medical/consults/balance')
  }


  // Initialize consult purchase payment
  async initializeConsultPayment(data: {
    doctorId: number
    quantity: number
    phone_number: string
    email: string
  }): Promise<ApiResponse<{ checkout_url: string; tx_ref: string }>> {
    return this.request<{ checkout_url: string; tx_ref: string }>('/payments/consult/initialize', {
      method: 'POST',
      body: JSON.stringify(data)
    })
  }

  // Get available slots for booking (generated from schedules)
  async getConsultSlots(providerId: number, weekStartDate?: string): Promise<ApiResponse<any[]>> {
    const params = new URLSearchParams()
    params.append('providerId', providerId.toString())
    if (weekStartDate) {
      params.append('weekStartDate', weekStartDate)
    }
    const query = params.toString()
    return this.request<any[]>(`/user/medical/consults/slots?${query}`)
  }

  // Book a consultation slot
  async bookConsult(data: { startAt: string; providerId: number; notes?: string }): Promise<ApiResponse<any>> {
    return this.request('/user/medical/consults/bookings', {
      method: 'POST',
      body: JSON.stringify(data)
    })
  }

  // Get medical professional's bookings
  async getMedicalConsults(params?: {
    page?: number
    pageSize?: number
    status?: string
  }): Promise<ApiResponse<PaginatedResponse<any>>> {
    const query = createPaginationQuery(params)
    return this.request<PaginatedResponse<any>>(`/medical/consults/bookings${query}`)
  }

  // Legacy methods for backward compatibility (old slot-based system)
  async getMedicalConsultSlots(params?: {
    page?: number
    pageSize?: number
    startDate?: string
    endDate?: string
  }): Promise<ApiResponse<PaginatedResponse<any>>> {
    const query = createPaginationQuery(params)
    return this.request<PaginatedResponse<any>>(`/medical/consults/slots${query}`)
  }

  async createConsultSlot(slot: {
    startTime: string
    duration: number
    consultType: 'quick' | 'full' | 'follow_up'
    timezone?: string
  }): Promise<ApiResponse<any>> {
    // Convert to old format: calculate endAt from startTime and duration
    const startDate = new Date(slot.startTime)
    const endDate = new Date(startDate.getTime() + slot.duration * 60000)
    
    return this.request('/medical/consults/slots', {
      method: 'POST',
      body: JSON.stringify({
        startAt: startDate.toISOString(),
        endAt: endDate.toISOString(),
        type: slot.consultType,
        timezone: slot.timezone
      })
    })
  }

  async deleteConsultSlot(id: number): Promise<ApiResponse<{ deleted: boolean }>> {
    return this.request<{ deleted: boolean }>(`/medical/consults/slots/${id}`, {
      method: 'DELETE'
    })
  }

  // Public API methods (no authentication required)
  async getPublicTrainers(): Promise<ApiResponse<{ items: PublicTrainer[] }>> {
    return this.request<{ items: PublicTrainer[] }>('/public/trainers')
  }

  async getPublicTrainerDetail(slugOrUserId: string | number): Promise<ApiResponse<PublicTrainerDetail>> {
    // If it's a number (userId), use it directly. Otherwise encode the slug
    const param = typeof slugOrUserId === 'number' ? slugOrUserId.toString() : encodeURIComponent(slugOrUserId);
    console.log('[API Client] Fetching trainer detail:', { original: slugOrUserId, param });
    return this.request<PublicTrainerDetail>(`/public/trainers/${param}`)
  }

  // ==================== TRAINER SITE ====================

  // Get trainer's site customization
  async getTrainerSite(): Promise<ApiResponse<TrainerSite>> {
    return this.request<TrainerSite>('/trainer/site')
  }

  // Update trainer's site customization
  async updateTrainerSite(data: Partial<TrainerSite>): Promise<ApiResponse<TrainerSite>> {
    return this.request<TrainerSite>('/trainer/site', {
      method: 'PUT',
      body: JSON.stringify(data)
    })
  }

  // Upload gallery image
  async uploadGalleryImage(file: File, caption?: string): Promise<ApiResponse<{ image: TrainerSiteGalleryImage; galleryImages: TrainerSiteGalleryImage[] }>> {
    const formData = new FormData()
    formData.append('image', file)
    if (caption) {
      formData.append('caption', caption)
    }
    return this.request<{ image: TrainerSiteGalleryImage; galleryImages: TrainerSiteGalleryImage[] }>('/trainer/site/gallery', {
      method: 'POST',
      body: formData,
      headers: {} // Let browser set Content-Type with boundary for FormData
    })
  }

  // Update gallery image (caption, order)
  async updateGalleryImage(imageId: string, data: { caption?: string; order?: number }): Promise<ApiResponse<{ galleryImages: TrainerSiteGalleryImage[] }>> {
    return this.request<{ galleryImages: TrainerSiteGalleryImage[] }>(`/trainer/site/gallery/${imageId}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    })
  }

  // Delete gallery image
  async deleteGalleryImage(imageId: string): Promise<ApiResponse<{ message: string; galleryImages: TrainerSiteGalleryImage[] }>> {
    return this.request<{ message: string; galleryImages: TrainerSiteGalleryImage[] }>(`/trainer/site/gallery/${imageId}`, {
      method: 'DELETE'
    })
  }

  // Upload hero background image
  async uploadHeroBackground(file: File): Promise<ApiResponse<{ heroBackgroundImage: string }>> {
    const formData = new FormData()
    formData.append('image', file)
    return this.request<{ heroBackgroundImage: string }>('/trainer/site/hero-background', {
      method: 'POST',
      body: formData,
      headers: {} // Let browser set Content-Type with boundary for FormData
    })
  }

  // Add trainer-authored content item
  async addTrainerContent(data: {
    title: string
    description?: string
    url: string
    type: 'article' | 'video' | 'post' | 'reel'
  }): Promise<ApiResponse<{ content: TrainerSiteContent; trainerContent: TrainerSiteContent[] }>> {
    return this.request<{ content: TrainerSiteContent; trainerContent: TrainerSiteContent[] }>('/trainer/site/trainer-content', {
      method: 'POST',
      body: JSON.stringify(data)
    })
  }

  // Update trainer content item
  // Update trainer site content item (NOT regular content - this is for trainer portfolio sites)
  async updateTrainerSiteContent(id: string, data: {
    title?: string
    description?: string
    url?: string
    type?: 'article' | 'video' | 'post' | 'reel'
    order?: number
  }): Promise<ApiResponse<{ trainerContent: TrainerSiteContent[] }>> {
    return this.request<{ trainerContent: TrainerSiteContent[] }>(`/trainer/site/trainer-content/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    })
  }

  // Delete trainer site content item (NOT regular content - this is for trainer portfolio sites)
  async deleteTrainerSiteContent(id: string): Promise<ApiResponse<{ message: string; trainerContent: TrainerSiteContent[] }>> {
    return this.request<{ message: string; trainerContent: TrainerSiteContent[] }>(`/trainer/site/trainer-content/${id}`, {
      method: 'DELETE'
    })
  }

  // ==================== DAILY CHALLENGES ====================

  // Get today's available daily challenges
  async getDailyChallenges(): Promise<ApiResponse<{
    challenges: DailyChallenge[]
    date: string
  }>> {
    return this.request<{
      challenges: DailyChallenge[]
      date: string
    }>('/user/daily-challenges')
  }

  // Get today's challenges with completion status
  async getTodayChallenges(): Promise<ApiResponse<{
    challenges: DailyChallenge[]
    date: string
    completedCount: number
    totalCount: number
  }>> {
    return this.request<{
      challenges: DailyChallenge[]
      date: string
      completedCount: number
      totalCount: number
    }>('/user/daily-challenges/today')
  }

  // Complete a daily challenge
  async completeDailyChallenge(id: number): Promise<ApiResponse<{
    message: string
    completion: any
    xp: number
    xpAdded: number
    level: number
    leveledUp: boolean
    streak: number
  }>> {
    return this.request<{
      message: string
      completion: any
      xp: number
      xpAdded: number
      level: number
      leveledUp: boolean
      streak: number
    }>(`/user/daily-challenges/${id}/complete`, {
      method: 'POST'
    })
  }

  // Get user's current streak
  async getDailyChallengeStreak(): Promise<ApiResponse<{
    streak: number
    xp: number
    level: number
  }>> {
    return this.request<{
      streak: number
      xp: number
      level: number
    }>('/user/daily-challenges/streak')
  }

  // ==================== GAMES ====================
  // Note: User games methods are defined in the USER GAMES API section below

  // ==================== LEADERBOARD ====================

  // Get global leaderboard
  async getGlobalLeaderboard(params?: {
    filterBy?: 'city' | 'ageGroup' | 'friends'
    period?: 'weekly' | 'monthly' | 'all-time'
    limit?: number
    offset?: number
  }): Promise<ApiResponse<{
    leaderboard: LeaderboardEntry[]
    userRank: number | null
    totalUsers: number
    period: string
    filterBy: string
  }>> {
    const query = createPaginationQuery(params)
    return this.request<{
      leaderboard: LeaderboardEntry[]
      userRank: number | null
      totalUsers: number
      period: string
      filterBy: string
    }>(`/user/leaderboard/global${query}`)
  }

  // Get current user's rank and surrounding users
  async getMyRank(params?: {
    filterBy?: 'city' | 'ageGroup' | 'friends'
    period?: 'weekly' | 'monthly' | 'all-time'
  }): Promise<ApiResponse<{
    userRank: number
    userXP: number
    userLevel: number
    leaderboard: LeaderboardEntry[]
    totalUsers: number
    period: string
    filterBy: string
  }>> {
    const query = createPaginationQuery(params)
    return this.request<{
      userRank: number
      userXP: number
      userLevel: number
      leaderboard: LeaderboardEntry[]
      totalUsers: number
      period: string
      filterBy: string
    }>(`/user/leaderboard/my-rank${query}`)
  }

  // Get leaderboard reward information
  async getLeaderboardRewards(): Promise<ApiResponse<{
    weekly: Record<string, any>
    monthly: Record<string, any>
    note: string
  }>> {
    return this.request<{
      weekly: Record<string, any>
      monthly: Record<string, any>
      note: string
    }>('/user/leaderboard/rewards')
  }

  // ==================== USER GAMES API ====================

  // Get all games (user)
  async getGames(params?: {
    gameType?: 'spin_win' | 'quiz_battle' | 'memory_game'
    difficulty?: 'beginner' | 'intermediate' | 'advanced'
    active?: boolean
  }): Promise<ApiResponse<{ games: Game[] }>> {
    if (params) {
      const queryParams = new URLSearchParams()
      if (params.gameType) queryParams.append('gameType', params.gameType)
      if (params.difficulty) queryParams.append('difficulty', params.difficulty)
      if (params.active !== undefined) queryParams.append('active', params.active.toString())
      const query = queryParams.toString()
      return this.request<{ games: Game[] }>(`/user/games${query ? `?${query}` : ''}`)
    }
    return this.request<{ games: Game[] }>('/user/games')
  }

  // Get game by ID (user)
  async getGameById(id: number): Promise<ApiResponse<{ game: Game }>> {
    return this.request<{ game: Game }>(`/user/games/${id}`)
  }

  // Play a game (start game session)
  async playGame(gameId: number, options?: {
    wheelChallenges?: Array<{ id: number; title: string; challengeId?: number }>
    wheelWorkouts?: Array<{ id: number; title: string; workoutPlanId?: number }>
    recentSelections?: number[]
  }): Promise<ApiResponse<{
    gameId: number
    gameType: string
    sessionId: string
    content: any
    xpReward: number
  }>> {
    return this.request<{
      gameId: number
      gameType: string
      sessionId: string
      content: any
      xpReward: number
    }>(`/user/games/${gameId}/play`, {
      method: 'POST',
      body: JSON.stringify(options || {})
    })
  }

  // Get spin status (for spin_win games)
  async getSpinStatus(gameId: number): Promise<ApiResponse<{
    availableSpins: number
    canSpin: boolean
    lastAccrualDate: string | null
  }>> {
    return this.request<{
      availableSpins: number
      canSpin: boolean
      lastAccrualDate: string | null
    }>(`/user/games/${gameId}/spin-status`)
  }

  // Submit game results
  async submitGameResults(
    gameId: number,
    gameData: any,
    sessionId: string
  ): Promise<ApiResponse<{
    message: string
    score: number
    maxScore: number
    xpEarned: number
    totalXP: number
    level: number
    leveledUp: boolean
    progress: any
  }>> {
    return this.request<{
      message: string
      score: number
      maxScore: number
      xpEarned: number
      totalXP: number
      level: number
      leveledUp: boolean
      progress: any
    }>(`/user/games/${gameId}/submit`, {
      method: 'POST',
      body: JSON.stringify({ gameData, sessionId })
    })
  }

  // Get game history
  async getGameHistory(params?: {
    gameType?: string
    limit?: number
  }): Promise<ApiResponse<{ history: any[] }>> {
    const query = params ? `?${new URLSearchParams(params as any).toString()}` : ''
    return this.request<{ history: any[] }>(`/user/games/history${query}`)
  }

  // ==================== ADMIN GAMES API ====================

  // Get all games (admin)
  async getAdminGames(params?: {
    page?: number
    pageSize?: number
    gameType?: string
    active?: string
    search?: string
  }): Promise<ApiResponse<PaginatedResponse<Game>>> {
    const query = createPaginationQuery(params)
    return this.request<PaginatedResponse<Game>>(`/admin/games${query}`)
  }

  // Get game by ID (admin)
  async getAdminGame(id: number): Promise<ApiResponse<{
    game: Game
    stats: {
      totalPlays: number
      totalXpAwarded: number
      averageScore: number
    }
  }>> {
    return this.request<{
      game: Game
      stats: any
    }>(`/admin/games/${id}`)
  }

  // Create game (admin)
  async createGame(data: {
    title: string
    description?: string
    gameType: 'spin_win' | 'quiz_battle' | 'memory_game'
    difficulty?: 'beginner' | 'intermediate' | 'advanced'
    xpReward?: number
    active?: boolean
    useAiGeneration?: boolean
    aiPromptTemplate?: string
    configJson?: Record<string, any>
  }): Promise<ApiResponse<{ game: Game }>> {
    return this.request<{ game: Game }>('/admin/games', {
      method: 'POST',
      body: JSON.stringify(data)
    })
  }

  // Update game (admin)
  async updateGame(id: number, data: Partial<{
    title: string
    description: string
    gameType: 'spin_win' | 'quiz_battle' | 'memory_game'
    difficulty: 'beginner' | 'intermediate' | 'advanced'
    xpReward: number
    active: boolean
    useAiGeneration: boolean
    aiPromptTemplate: string
    configJson: Record<string, any>
  }>): Promise<ApiResponse<{ game: Game }>> {
    return this.request<{ game: Game }>(`/admin/games/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    })
  }

  // Delete game (admin)
  async deleteGame(id: number): Promise<ApiResponse<{ deleted: boolean }>> {
    return this.request<{ deleted: boolean }>(`/admin/games/${id}`, {
      method: 'DELETE'
    })
  }

  // Clear game cache (admin)
  async clearGameCache(id: number): Promise<ApiResponse<{ message: string; game: Game }>> {
    return this.request<{ message: string; game: Game }>(`/admin/games/${id}/clear-cache`, {
      method: 'POST'
    })
  }

  // Regenerate game cache (admin)
  async regenerateGameCache(id: number): Promise<ApiResponse<{ message: string; game: Game }>> {
    return this.request<{ message: string; game: Game }>(`/admin/games/${id}/regenerate-cache`, {
      method: 'POST'
    })
  }


  // ==================== SUBSCRIPTION API ====================

  // Get all subscription plans
  async getSubscriptionPlans(): Promise<ApiResponse<{ items: SubscriptionPlan[] }>> {
    return this.request<{ items: SubscriptionPlan[] }>('/subscription/plans')
  }

  // Get subscription plan by ID
  async getSubscriptionPlan(id: number): Promise<ApiResponse<{ plan: SubscriptionPlan }>> {
    return this.request<{ plan: SubscriptionPlan }>(`/subscription/plans/${id}`)
  }


  // Initialize subscription (validate data)
  async initializeSubscription(data: {
    subscription_plan_id: number
    trainer_id: number
    duration: string
    phone_number: string
  }): Promise<ApiResponse<any>> {
    return this.request('/subscription/subscribe', {
      method: 'POST',
      body: JSON.stringify(data)
    })
  }

  // ==================== PAYMENT API ====================

  // Initialize payment for subscription
  async initializePayment(data: PaymentInitRequest): Promise<ApiResponse<PaymentInitResponse>> {
    return this.request<PaymentInitResponse>('/payments/subscription/initialize', {
      method: 'POST',
      body: JSON.stringify(data)
    })
  }

  // Verify payment and activate subscription
  async verifyPayment(txRef: string): Promise<ApiResponse<{
    transaction: {
      id: number
      txRef: string
      status: string
      amount: number
      createdAt: string
      completedAt?: string
      callbackData?: any
    }
    subscription: UserSubscription | null
  }>> {
    return this.request<{
      transaction: {
        id: number
        txRef: string
        status: string
        amount: number
        createdAt: string
        completedAt?: string
        callbackData?: any
      }
      subscription: UserSubscription | null
    }>(`/payments/verify/${txRef}`)
  }

  // ==================== AUTH API ====================

  // Register new user
  async registerUser(data: RegisterRequest): Promise<ApiResponse<LoginResponse>> {
    const response = await this.request<LoginResponse>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data)
    })

    if (response.success && response.data) {
      this.setToken(response.data.token)
    }

    return response
  }

  // ==================== USER PROFILE & STATS API ====================

  // Get user stats
  async getUserStats(): Promise<ApiResponse<{
    user: {
      id: number
      name?: string
      email?: string
      profilePicture?: string
      level: number
      xp: number
      xpProgress: number
      xpNeeded: number
      memberSince: string
    }
    stats: {
      contentWatched: number
      contentSaved: number
      totalWatchTime: number
      workoutPlansStarted: number
      workoutPlansCompleted: number
      challengesJoined: number
      challengesCompleted: number
      achievementsUnlocked: number
    }
  }>> {
    return this.request<{
      user: {
        id: number
        name?: string
        email?: string
        profilePicture?: string
        level: number
        xp: number
        xpProgress: number
        xpNeeded: number
        memberSince: string
      }
      stats: {
        contentWatched: number
        contentSaved: number
        totalWatchTime: number
        workoutPlansStarted: number
        workoutPlansCompleted: number
        challengesJoined: number
        challengesCompleted: number
        achievementsUnlocked: number
      }
    }>('/user/profile/stats')
  }

  // Get user XP history
  async getUserXPHistory(period: number = 30): Promise<ApiResponse<{
    history: Array<{
      date: string
      xp: number
      breakdown: {
        content: number
        challenge: number
        workout: number
      }
      cumulativeXP: number
    }>
    summary: {
      totalXP: number
      avgDailyXP: number
      period: number
      entries: number
    }
  }>> {
    return this.request<{
      history: Array<{
        date: string
        xp: number
        breakdown: {
          content: number
          challenge: number
          workout: number
        }
        cumulativeXP: number
      }>
      summary: {
        totalXP: number
        avgDailyXP: number
        period: number
        entries: number
      }
    }>(`/user/profile/history?period=${period}`)
  }

  // Get user achievements
  async getAchievements(): Promise<ApiResponse<{
    achievements: Array<{
      id: number
      name: string
      description: string
      icon: string
      xpReward: number
      rarity: string
      unlocked: boolean
      unlockedAt?: string | null
    }>
    totalUnlocked: number
    totalAchievements: number
  }>> {
    return this.request<{
      achievements: Array<{
        id: number
        name: string
        description: string
        icon: string
        xpReward: number
        rarity: string
        unlocked: boolean
        unlockedAt?: string | null
      }>
      totalUnlocked: number
      totalAchievements: number
    }>('/user/profile/achievements')
  }

  // Get user's active subscription
  async getMySubscription(): Promise<ApiResponse<{
    subscription: UserSubscription | null
  }>> {
    return this.request<{
      subscription: UserSubscription | null
    }>('/subscription/my-subscription')
  }

  // ==================== MEDICAL PROFESSIONAL METHODS ====================

  // Get medical professional consult fee
  async getMedicalConsultFee(): Promise<ApiResponse<{
    consultFee: number | null
  }>> {
    return this.request<{
      consultFee: number | null
    }>('/medical/settings/consult-fee')
  }

  // Update medical professional consult fee
  async updateMedicalConsultFee(consultFee: number): Promise<ApiResponse<{
    consultFee: number
    message: string
  }>> {
    return this.request<{
      consultFee: number
      message: string
    }>('/medical/settings/consult-fee', {
      method: 'PUT',
      body: JSON.stringify({ consultFee })
    })
  }

    /**
   * Submits an email for newsletter subscription
   */
  async subscribeToNewsletter(email: string): Promise<ApiResponse<{ message: string }>> {
    const response = await this.request<{ message: string }>('/subscription/email', {
      method: 'POST',
      body: JSON.stringify({ email: email }),
    })

    return response
}
}




// Create a singleton instance
export const apiClient = new ApiClient()

// Export types for use in components
export type {
  ApiResponse as ApiResponseType,
  PaginatedResponse as PaginatedResponseType,
  User as UserType,
  Challenge as ChallengeType,
  DailyChallenge as DailyChallengeType,
  Game as GameType,
  LeaderboardEntry as LeaderboardEntryType,
  Reward as RewardType,
  Language as LanguageType,
  Trainer as TrainerType,
  LoginRequest as LoginRequestType,
  LoginResponse as LoginResponseType,
  AdminStats as AdminStatsType,
  ModerationItem as ModerationItemType,
  ModerationListResponse as ModerationListResponseType,
  ModerationDetailResponse as ModerationDetailResponseType,
  TrainerApplication as TrainerApplicationType,
  ApplicationStatusResponse as ApplicationStatusResponseType,
  ApplicationListResponse as ApplicationListResponseType,
  ApplicationStatsResponse as ApplicationStatsResponseType,
  SubscriptionPlan as SubscriptionPlanType,
  UserSubscription as UserSubscriptionType,
  PaymentInitRequest as PaymentInitRequestType,
  PaymentInitResponse as PaymentInitResponseType,
  RegisterRequest as RegisterRequestType,
  TrainerSite as TrainerSiteType,
  TrainerSiteTheme as TrainerSiteThemeType,
  TrainerSiteSection as TrainerSiteSectionType,
  TrainerSiteGalleryImage as TrainerSiteGalleryImageType,
  TrainerSiteContent as TrainerSiteContentType,
  TrainerSiteSocialLinks as TrainerSiteSocialLinksType,
  PublicTrainer as PublicTrainerType,
  PublicTrainerDetail as PublicTrainerDetailType,
}
