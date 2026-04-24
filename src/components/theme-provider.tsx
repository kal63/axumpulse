'use client'

import { useEffect, useRef } from 'react'
import { useAuth } from '@/contexts/auth-context'
import { apiClient } from '@/lib/api-client'
import {
  applyAppTheme,
  DEFAULT_USER_THEME,
  normalizeUserTheme,
  themeStorageKeyForUser,
} from '@/lib/app-theme'

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth()
  const cleanupRef = useRef<(() => void) | null>(null)

  useEffect(() => {
    const setupThemeListener = (theme: string) => {
      if (cleanupRef.current) {
        cleanupRef.current()
        cleanupRef.current = null
      }

      if (theme === 'system') {
        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
        const handleChange = () => applyAppTheme('system')
        mediaQuery.addEventListener('change', handleChange)

        cleanupRef.current = () => {
          mediaQuery.removeEventListener('change', handleChange)
        }
      }
    }

    if (user) {
      const storageKey = themeStorageKeyForUser(user.id)
      const cached = typeof window !== 'undefined' ? localStorage.getItem(storageKey) : null
      if (cached) {
        const t = normalizeUserTheme(cached)
        applyAppTheme(t)
        setupThemeListener(t)
      }

      apiClient
        .getUserSettings()
        .then((response) => {
          if (response.success && response.data) {
            const theme = normalizeUserTheme(response.data.preferences?.theme)
            applyAppTheme(theme)
            try {
              localStorage.setItem(storageKey, theme)
            } catch {
              /* ignore quota / private mode */
            }
            setupThemeListener(theme)
          } else {
            const t = cached ? normalizeUserTheme(cached) : DEFAULT_USER_THEME
            applyAppTheme(t)
            setupThemeListener(t)
          }
        })
        .catch(() => {
          const t = cached ? normalizeUserTheme(cached) : DEFAULT_USER_THEME
          applyAppTheme(t)
          setupThemeListener(t)
        })
    } else {
      applyAppTheme(DEFAULT_USER_THEME)
      setupThemeListener(DEFAULT_USER_THEME)
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
