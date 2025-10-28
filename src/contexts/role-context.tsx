'use client'

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { useAuth } from './auth-context'

export type UserRole = 'user' | 'trainer' | 'admin'

interface RoleContextType {
  currentRole: UserRole
  switchRole: (role: UserRole) => void
  availableRoles: UserRole[]
  getRoleTheme: (role: UserRole) => string
  getRoleIcon: (role: UserRole) => string
  getRoleLabel: (role: UserRole) => string
}

const RoleContext = createContext<RoleContextType | undefined>(undefined)

interface RoleProviderProps {
  children: ReactNode
}

export function RoleProvider({ children }: RoleProviderProps) {
  const [currentRole, setCurrentRole] = useState<UserRole>('user')
  const { user } = useAuth()
  const router = useRouter()
  const pathname = usePathname()

  // Determine available roles based on user permissions
  const availableRoles: UserRole[] = React.useMemo(() => {
    const roles: UserRole[] = ['user'] // Everyone can be a user
    
    if (user?.isTrainer) {
      roles.push('trainer')
    }
    
    if (user?.isAdmin) {
      roles.push('admin')
    }
    
    return roles
  }, [user])

  // Detect current role from pathname
  useEffect(() => {
    if (pathname) {
      let detectedRole: UserRole | null = null
      
      if (pathname.startsWith('/admin')) {
        detectedRole = 'admin'
      } else if (pathname.startsWith('/trainer')) {
        detectedRole = 'trainer'
      } else if (pathname.startsWith('/user')) {
        detectedRole = 'user'
      }
      
      // Only update if we detected a valid role and it's available to the user
      if (detectedRole && availableRoles.includes(detectedRole)) {
        setCurrentRole(detectedRole)
        localStorage.setItem('selectedRole', detectedRole)
      }
    }
  }, [pathname, availableRoles])

  // Initialize role from localStorage or default to first available role (fallback)
  useEffect(() => {
    if (user && availableRoles.length > 0 && !pathname?.match(/\/(admin|trainer|user)\//)) {
      const savedRole = localStorage.getItem('selectedRole') as UserRole
      
      if (savedRole && availableRoles.includes(savedRole)) {
        setCurrentRole(savedRole)
      } else {
        // Default to admin if available, otherwise trainer, otherwise user
        const defaultRole = availableRoles.includes('admin') ? 'admin' :
                           availableRoles.includes('trainer') ? 'trainer' : 'user'
        setCurrentRole(defaultRole)
        localStorage.setItem('selectedRole', defaultRole)
      }
    }
  }, [user, availableRoles, pathname])

  const switchRole = (role: UserRole) => {
    if (availableRoles.includes(role)) {
      setCurrentRole(role)
      localStorage.setItem('selectedRole', role)
      
      // Navigate to the appropriate dashboard
      router.push(`/${role}/dashboard`)
    }
  }

  const getRoleTheme = (role: UserRole): string => {
    switch (role) {
      case 'admin':
        return 'bg-emerald-100 text-emerald-700 border-emerald-200 hover:bg-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800'
      case 'trainer':
        return 'bg-blue-100 text-blue-700 border-blue-200 hover:bg-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800'
      case 'user':
        return 'bg-purple-100 text-purple-700 border-purple-200 hover:bg-purple-200 dark:bg-purple-900/30 dark:text-purple-400 dark:border-purple-800'
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200 hover:bg-gray-200 dark:bg-gray-900/30 dark:text-gray-400 dark:border-gray-800'
    }
  }

  const getRoleIcon = (role: UserRole): string => {
    switch (role) {
      case 'admin':
        return 'Shield'
      case 'trainer':
        return 'UserCheck'
      case 'user':
        return 'Users'
      default:
        return 'User'
    }
  }

  const getRoleLabel = (role: UserRole): string => {
    switch (role) {
      case 'admin':
        return 'Admin Mode'
      case 'trainer':
        return 'Trainer Mode'
      case 'user':
        return 'User Mode'
      default:
        return 'User Mode'
    }
  }

  const value: RoleContextType = {
    currentRole,
    switchRole,
    availableRoles,
    getRoleTheme,
    getRoleIcon,
    getRoleLabel
  }

  return (
    <RoleContext.Provider value={value}>
      {children}
    </RoleContext.Provider>
  )
}

export function useRole() {
  const context = useContext(RoleContext)
  if (context === undefined) {
    throw new Error('useRole must be used within a RoleProvider')
  }
  return context
}


