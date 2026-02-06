'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { apiClient, type User, type LoginRequest } from '@/lib/api-client'

interface AuthContextType {
  user: User | null
  isLoading: boolean
  isAuthenticated: boolean
  login: (credentials: LoginRequest) => Promise<{ success: boolean; error?: string; user?: User }>
  logout: () => void
  refreshUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  const isAuthenticated = !!user

  // Check for existing token on mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem('authToken')
        if (token) {
          // Set the token in the API client
          apiClient.setToken(token)
          
          // Fetch complete user data from /auth/me endpoint
          const response = await apiClient.getMe()
          if (response.success && response.data?.user) {
            setUser(response.data.user)
          } else {
            // Provide more detailed error information
            let errorInfo: Record<string, unknown>
            
            if (response.error) {
              // Extract meaningful error properties, filtering out empty objects
              const error = response.error
              errorInfo = {
                message: error.message || 'Unknown error',
                code: error.code || 'UNKNOWN',
                ...(error.status && { status: error.status }),
                ...(error.statusText && { statusText: error.statusText }),
              }
              
              // If error object is essentially empty, provide a default message
              if (!error.message && !error.code && !error.status) {
                errorInfo.message = 'Authentication failed - token may be invalid or expired'
              }
            } else {
              errorInfo = { 
                message: 'Failed to fetch user data - no error details available',
                code: 'UNKNOWN_ERROR'
              }
            }
            
            console.error('Failed to fetch user data:', errorInfo)
            apiClient.clearToken()
          }
        }
      } catch (error) {
        console.error('Auth check failed:', error)
        apiClient.clearToken()
      } finally {
        setIsLoading(false)
      }
    }

    checkAuth()
  }, [])

  const login = async (credentials: LoginRequest) => {
    try {
      setIsLoading(true)
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

  const logout = () => {
    setUser(null)
    apiClient.clearToken()
    router.push('/login')
  }

  const refreshUser = async () => {
    // Fetch fresh user data from the server using the /me endpoint
    try {
      const response = await apiClient.getMe()
      if (response.success && response.data) {
        setUser(response.data.user)
      } else {
        // If we can't fetch user data, the token might be invalid
        logout()
      }
    } catch (error) {
      console.error('Failed to refresh user data:', error)
      // If we can't fetch user data, the token might be invalid
      logout()
    }
  }

  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated,
    login,
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
