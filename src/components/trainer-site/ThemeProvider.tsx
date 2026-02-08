'use client'

import React, { createContext, useContext, useEffect, ReactNode } from 'react'
import { TrainerSiteTheme } from '@/lib/api-client'

interface ThemeProviderProps {
  theme: TrainerSiteTheme
  children: ReactNode
}

const ThemeContext = createContext<TrainerSiteTheme>({})

export function ThemeProvider({ theme, children }: ThemeProviderProps) {
  useEffect(() => {
    // Apply CSS variables for theme colors
    const root = document.documentElement
    
    if (theme.primaryColor) {
      root.style.setProperty('--trainer-primary', theme.primaryColor)
    }
    if (theme.secondaryColor) {
      root.style.setProperty('--trainer-secondary', theme.secondaryColor)
    }
    if (theme.ctaColor) {
      root.style.setProperty('--trainer-cta', theme.ctaColor)
    }
    if (theme.fontFamily) {
      root.style.setProperty('--trainer-font', theme.fontFamily)
    }

    return () => {
      // Cleanup on unmount
      root.style.removeProperty('--trainer-primary')
      root.style.removeProperty('--trainer-secondary')
      root.style.removeProperty('--trainer-cta')
      root.style.removeProperty('--trainer-font')
    }
  }, [theme])

  return (
    <ThemeContext.Provider value={theme}>
      <div 
        style={{
          '--trainer-primary': theme.primaryColor || '#3b82f6',
          '--trainer-secondary': theme.secondaryColor || '#8b5cf6',
          '--trainer-cta': theme.ctaColor || '#3b82f6',
          '--trainer-font': theme.fontFamily || 'inherit',
        } as React.CSSProperties}
      >
        {children}
      </div>
    </ThemeContext.Provider>
  )
}

export function useTrainerTheme() {
  return useContext(ThemeContext)
}

