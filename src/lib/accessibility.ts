/**
 * Accessibility utilities and helpers
 */

/**
 * Trap focus within a modal or dialog
 */
export function trapFocus(element: HTMLElement) {
  const focusableElements = element.querySelectorAll(
    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
  )
  const firstElement = focusableElements[0] as HTMLElement
  const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement

  const handleTab = (e: KeyboardEvent) => {
    if (e.key !== 'Tab') return

    if (e.shiftKey) {
      if (document.activeElement === firstElement) {
        e.preventDefault()
        lastElement.focus()
      }
    } else {
      if (document.activeElement === lastElement) {
        e.preventDefault()
        firstElement.focus()
      }
    }
  }

  element.addEventListener('keydown', handleTab)
  firstElement?.focus()

  return () => {
    element.removeEventListener('keydown', handleTab)
  }
}

/**
 * Announce message to screen readers
 */
export function announce(message: string, priority: 'polite' | 'assertive' = 'polite') {
  const announcement = document.createElement('div')
  announcement.setAttribute('role', 'status')
  announcement.setAttribute('aria-live', priority)
  announcement.setAttribute('aria-atomic', 'true')
  announcement.className = 'sr-only'
  announcement.textContent = message

  document.body.appendChild(announcement)

  setTimeout(() => {
    document.body.removeChild(announcement)
  }, 1000)
}

/**
 * Get appropriate ARIA label for level
 */
export function getLevelAriaLabel(level: number, xp: number, xpNeeded: number): string {
  return `Level ${level}, ${xp} experience points, ${xpNeeded} needed for next level`
}

/**
 * Get progress percentage ARIA label
 */
export function getProgressAriaLabel(current: number, total: number, label: string): string {
  const percentage = Math.round((current / total) * 100)
  return `${label}: ${current} of ${total}, ${percentage} percent complete`
}

/**
 * Format number for screen readers
 */
export function formatNumberForScreenReader(num: number): string {
  if (num >= 1000000) {
    return `${(num / 1000000).toFixed(1)} million`
  }
  if (num >= 1000) {
    return `${(num / 1000).toFixed(1)} thousand`
  }
  return num.toString()
}





