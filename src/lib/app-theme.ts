const VALID = ['light', 'dark', 'system'] as const
export type AppTheme = (typeof VALID)[number]

export const THEME_STORAGE_KEY_PREFIX = 'axumpulse-ui-theme-user'

export const DEFAULT_USER_THEME: AppTheme = 'light'

export function themeStorageKeyForUser(userId: number) {
  return `${THEME_STORAGE_KEY_PREFIX}-${userId}`
}

export function normalizeUserTheme(value: unknown): AppTheme {
  if (typeof value === 'string' && VALID.includes(value as AppTheme)) {
    return value as AppTheme
  }
  return DEFAULT_USER_THEME
}

/**
 * Apply theme to document.documentElement (Tailwind `class` dark mode).
 */
export function applyAppTheme(theme: string) {
  if (typeof document === 'undefined') return
  const t = normalizeUserTheme(theme)
  if (t === 'system') {
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    if (systemPrefersDark) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  } else if (t === 'dark') {
    document.documentElement.classList.add('dark')
  } else {
    document.documentElement.classList.remove('dark')
  }
}
