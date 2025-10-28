/**
 * Retry utility for failed API requests
 */

interface RetryOptions {
  retries?: number
  delay?: number
  backoff?: boolean
  onRetry?: (attempt: number, error: any) => void
}

export async function retryAsync<T>(
  fn: () => Promise<T>,
  options: RetryOptions = {}
): Promise<T> {
  const {
    retries = 3,
    delay = 1000,
    backoff = true,
    onRetry
  } = options

  let lastError: any

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      return await fn()
    } catch (error) {
      lastError = error
      
      if (attempt < retries) {
        const waitTime = backoff ? delay * Math.pow(2, attempt) : delay
        
        if (onRetry) {
          onRetry(attempt + 1, error)
        }
        
        await new Promise(resolve => setTimeout(resolve, waitTime))
      }
    }
  }

  throw lastError
}

/**
 * Retry with exponential backoff for network errors
 */
export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  maxRetries = 3
): Promise<T> {
  return retryAsync(fn, {
    retries: maxRetries,
    delay: 1000,
    backoff: true,
    onRetry: (attempt, error) => {
      console.log(`Retry attempt ${attempt}/${maxRetries}`, error?.message)
    }
  })
}

/**
 * Check if error is retryable (network/server errors)
 */
export function isRetryableError(error: any): boolean {
  if (!error) return false
  
  // Network errors
  if (error.name === 'NetworkError' || error.message?.includes('fetch')) {
    return true
  }
  
  // HTTP status codes that are retryable
  if (error.status) {
    const retryableStatuses = [408, 429, 500, 502, 503, 504]
    return retryableStatuses.includes(error.status)
  }
  
  return false
}





