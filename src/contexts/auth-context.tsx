'use client'

import React, { createContext, useCallback, useContext, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { apiClient, type User, type LoginRequest } from '@/lib/api-client'

type SessionLoadError = 'network' | null

type GetMeResponse = Awaited<ReturnType<typeof apiClient.getMe>>

/** Reduces false logouts when the API is briefly unreachable (common on mobile / strict hosting). */
async function getMeWithRetries(maxAttempts = 3): Promise<GetMeResponse> {
  let last: GetMeResponse | null = null
  for (let i = 0; i < maxAttempts; i++) {
    last = await apiClient.getMe()
    if (last.success && last.data?.user) return last
    if (last.error?.code !== 'NETWORK_ERROR') return last
    if (i < maxAttempts - 1) {
      await new Promise((r) => setTimeout(r, 400 * (i + 1)))
    }
  }
  return last!
}

interface AuthContextType {
  user: User | null
  isLoading: boolean
  isAuthenticated: boolean
  /** Set when a token exists but /auth/me could not be reached (do not send user to login). */
  sessionLoadError: SessionLoadError
  retrySession: () => void
  login: (credentials: LoginRequest) => Promise<{ success: boolean; error?: string; user?: User }>
  dev_login: (role: string) => Promise<{ success: boolean; error?: string; user?: User }>
  logout: () => void
  refreshUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [sessionLoadError, setSessionLoadError] = useState<SessionLoadError>(null)
  const router = useRouter()

  const isAuthenticated = !!user

  const runSessionBootstrap = useCallback(async () => {
    try {
      const token = localStorage.getItem('authToken')
      if (!token) {
        setSessionLoadError(null)
        return
      }

      apiClient.setToken(token)
      const response = await getMeWithRetries()

      if (response.success && response.data?.user) {
        setUser(response.data.user)
        setSessionLoadError(null)
        return
      }

      const status = response.error?.status
      if (status === 401) {
        console.error('Failed to fetch user data (unauthorized):', response.error)
        apiClient.clearToken()
        setSessionLoadError(null)
        return
      }

      console.error('Failed to fetch user data (session kept for retry):', response.error)
      setSessionLoadError('network')
    } catch (error) {
      console.error('Auth check failed:', error)
      setSessionLoadError('network')
    }
  }, [])

  const retrySession = useCallback(() => {
    setSessionLoadError(null)
    setIsLoading(true)
    void (async () => {
      await runSessionBootstrap()
      setIsLoading(false)
    })()
  }, [runSessionBootstrap])

  // Check for existing token on mount
  useEffect(() => {
    void (async () => {
      await runSessionBootstrap()
      setIsLoading(false)
    })()
  }, [runSessionBootstrap])

  const login = async (credentials: LoginRequest) => {
    try {
      setIsLoading(true)
      setSessionLoadError(null)
      const response = await apiClient.login(credentials)
      
      if (response.success && response.data) {
        // Set the basic user data first
        setUser(response.data.user)
        
        // Try to fetch the full user data with profile
        let finalUser = response.data.user
        try {
          const fullUserResponse = await apiClient.getMe()
          if (fullUserResponse.success && fullUserResponse.data) {
            finalUser = fullUserResponse.data.user
            setUser(fullUserResponse.data.user)
          }
        } catch (fetchError) {
          console.warn('Failed to fetch full user data:', fetchError)
          // Continue with basic user data
          setUser(response.data.user)
        }
        
        return { success: true, user: finalUser }
      } else {
        return { 
          success: false, 
          error: response.error?.message || 'Login failed' 
        }
      }
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Login failed' 
      }
    } finally {
      setIsLoading(false)
    }
  }

  const dev_login = async (role: string) => {
    try {
      setIsLoading(true)
      setSessionLoadError(null)
      const response = await apiClient.dev_login(role)
      
      if (response.success && response.data) {
        // Set the basic user data first
        setUser(response.data.user)
        
        // Try to fetch the full user data with profile
        let finalUser = response.data.user
        try {
          const fullUserResponse = await apiClient.getMe()
          if (fullUserResponse.success && fullUserResponse.data) {
            finalUser = fullUserResponse.data.user
            setUser(fullUserResponse.data.user)
          }
        } catch (fetchError) {
          console.warn('Failed to fetch full user data:', fetchError)
          // Continue with basic user data
          setUser(response.data.user)
        }
        
        return { success: true, user: finalUser }
      } else {
        return { 
          success: false, 
          error: response.error?.message || 'Login failed' 
        }
      }
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Login failed' 
      }
    } finally {
      setIsLoading(false)
    }
  }

  const logout = () => {
    setUser(null)
    setSessionLoadError(null)
    apiClient.clearToken()
    router.push('/login')
  }

  const refreshUser = async () => {
    try {
      const response = await apiClient.getMe()
      if (response.success && response.data) {
        setUser(response.data.user)
        setSessionLoadError(null)
      } else if (response.error?.status === 401) {
        logout()
      } else {
        setSessionLoadError('network')
      }
    } catch (error) {
      console.error('Failed to refresh user data:', error)
      setSessionLoadError('network')
    }
  }

  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated,
    sessionLoadError,
    retrySession,
    login,
    dev_login,
    logout,
    refreshUser,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

// Higher-order component for protecting routes
export function withAuth<P extends object>(
  Component: React.ComponentType<P>,
  options: { requireAdmin?: boolean } = {}
) {
  return function AuthenticatedComponent(props: P) {
    const { user, isLoading, isAuthenticated } = useAuth()
    const router = useRouter()

    useEffect(() => {
      if (!isLoading) {
        if (!isAuthenticated) {
          router.push('/login')
          return
        }
        
        if (options.requireAdmin && !user?.isAdmin) {
          router.push('/dashboard')
          return
        }
      }
    }, [isLoading, isAuthenticated, user, router])

    if (isLoading) {
      return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
        </div>
      )
    }

    if (!isAuthenticated) {
      return null
    }

    if (options.requireAdmin && !user?.isAdmin) {
      return null
    }

    return <Component {...props} />
  }
}
