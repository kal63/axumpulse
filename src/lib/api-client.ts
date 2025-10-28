// API Client for AxumPulse Backend
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1'

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

export interface ApiResponse<T = unknown> {
  success: boolean
  data?: T
  error?: {
    code: string
    message: string
    details?: unknown
  }
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
  createdAt: string
  updatedAt: string
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
  trainer?: {
    id: number
    name: string
    email: string
    phone?: string
  }
  createdAt: string
  updatedAt: string
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
    
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    }

    if (this.token) {
      headers.Authorization = `Bearer ${this.token}`
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      })

      const data = await response.json()

      if (!response.ok) {
        return {
          success: false,
          error: data.error || {
            code: 'HTTP_ERROR',
            message: `HTTP ${response.status}: ${response.statusText}`,
          },
        }
      }

      return data
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'NETWORK_ERROR',
          message: error instanceof Error ? error.message : 'Network error occurred',
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
    return this.request<{ content: ContentItem }>(`/trainer/content/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    })
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

  async getChallenges(params?: {
    page?: number
    pageSize?: number
  }): Promise<ApiResponse<PaginatedResponse<Challenge>>> {
    const query = createPaginationQuery(params)
    return this.request<PaginatedResponse<Challenge>>(`/admin/challenges${query}`)
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
  async updateWatchProgress(contentId: number, watchTime: number, completed?: boolean): Promise<ApiResponse<{
    watchTime: number
    completed: boolean
    xpEarned: number
  }>> {
    return this.request<{
      watchTime: number
      completed: boolean
      xpEarned: number
    }>('/user/engagement/watch-progress', {
      method: 'POST',
      body: JSON.stringify({ contentId, watchTime, completed })
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
  async startWorkoutPlan(workoutPlanId: number): Promise<ApiResponse<any>> {
    return this.request<any>('/user/progress/workout-plan/start', {
      method: 'POST',
      body: JSON.stringify({ workoutPlanId })
    })
  }

  // Complete an exercise
  async completeExercise(workoutPlanId: number, exerciseId: number, notes?: string): Promise<ApiResponse<{
    exerciseProgress: any
    planProgress: any
  }>> {
    return this.request<{
      exerciseProgress: any
      planProgress: any
    }>('/user/progress/exercise/complete', {
      method: 'POST',
      body: JSON.stringify({ workoutPlanId, exerciseId, notes })
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

  // Get user stats
  async getUserStats(): Promise<ApiResponse<{
    user: {
      id: number
      name: string
      email: string
      profilePicture: string
      xp: number
      level: number
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
      user: any
      stats: any
    }>('/user/profile/stats')
  }

  // Get user achievements
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

  // Get user XP history
  async getUserXPHistory(period?: number): Promise<ApiResponse<{
    history: Array<{
      date: string
      xp: number
      cumulativeXP: number
      breakdown: {
        content: number
        challenge: number
        workout: number
      }
    }>
    summary: {
      totalXP: number
      avgDailyXP: number
      period: number
      entries: number
    }
  }>> {
    const query = period ? `?period=${period}` : ''
    return this.request<{
      history: Array<{
        date: string
        xp: number
        cumulativeXP: number
        breakdown: {
          content: number
          challenge: number
          workout: number
        }
      }>
      summary: {
        totalXP: number
        avgDailyXP: number
        period: number
        entries: number
      }
    }>(`/user/profile/history${query}`)
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
}

// Create a singleton instance
export const apiClient = new ApiClient()

// Export types for use in components
export type {
  ApiResponse as ApiResponseType,
  PaginatedResponse as PaginatedResponseType,
  User as UserType,
  Challenge as ChallengeType,
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
}
