'use client'

import { useEffect, useRef } from 'react'
import { useAuth } from '@/contexts/auth-context'
import { apiClient } from '@/lib/api-client'

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth()
  const cleanupRef = useRef<(() => void) | null>(null)

  useEffect(() => {
    const applyTheme = (theme: string) => {
      if (theme === 'system') {
        const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
        if (systemPrefersDark) {
          document.documentElement.classList.add('dark')
        } else {
          document.documentElement.classList.remove('dark')
        }
      } else if (theme === 'dark') {
        document.documentElement.classList.add('dark')
      } else {
        document.documentElement.classList.remove('dark')
      }
    }

    const setupThemeListener = (theme: string) => {
      // Clean up previous listener if exists
      if (cleanupRef.current) {
        cleanupRef.current()
        cleanupRef.current = null
      }

      if (theme === 'system') {
        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
        const handleChange = () => applyTheme('system')
        mediaQuery.addEventListener('change', handleChange)
        
        cleanupRef.current = () => {
          mediaQuery.removeEventListener('change', handleChange)
        }
      }
    }

    // Load theme from user settings if logged in
    if (user) {
      apiClient.getUserSettings()
        .then((response) => {
          if (response.success && response.data?.preferences?.theme) {
            const theme = response.data.preferences.theme
            applyTheme(theme)
            setupThemeListener(theme)
          }
        })
        .catch(() => {
          // If settings fail to load, default to system preference
          applyTheme('system')
          setupThemeListener('system')
        })
    } else {
      // If not logged in, default to system preference
      applyTheme('system')
      setupThemeListener('system')
    }

    return () => {
      if (cleanupRef.current) {
        cleanupRef.current()
        cleanupRef.current = null
      }
    }
  }, [user])

  return <>{children}</>
}

