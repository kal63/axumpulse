// Error types for better error handling
export class AppError extends Error {
  constructor(
    message: string,
    public statusCode: number = 500,
    public code?: string,
    public isOperational: boolean = true
  ) {
    super(message)
    this.name = 'AppError'
    
    // Maintains proper stack trace for where our error was thrown
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, AppError)
    }
  }
}

export class ValidationError extends AppError {
  constructor(message: string, public field?: string) {
    super(message, 400, 'VALIDATION_ERROR')
    this.name = 'ValidationError'
  }
}

export class NotFoundError extends AppError {
  constructor(resource: string = 'Resource') {
    super(`${resource} not found`, 404, 'NOT_FOUND')
    this.name = 'NotFoundError'
  }
}

export class UnauthorizedError extends AppError {
  constructor(message: string = 'Unauthorized access') {
    super(message, 401, 'UNAUTHORIZED')
    this.name = 'UnauthorizedError'
  }
}

// Error logging utility
export const logError = (error: Error, context?: Record<string, unknown>) => {
  const errorInfo = {
    message: error.message,
    stack: error.stack,
    name: error.name,
    timestamp: new Date().toISOString(),
    context,
    ...(error instanceof AppError && {
      statusCode: error.statusCode,
      code: error.code,
      isOperational: error.isOperational,
    }),
  }

  // In development, log to console
  if (process.env.NODE_ENV === 'development') {
    console.error('Error logged:', errorInfo)
  }

  // In production, you would send this to your error monitoring service
  // Example: Sentry, LogRocket, Bugsnag, etc.
  // errorMonitoringService.captureException(error, { extra: context })
}

// Async error wrapper for API routes
export const asyncHandler = (fn: (req: unknown, res: unknown, next: unknown) => Promise<unknown>) => {
  return (req: unknown, res: unknown, next: unknown) => {
    Promise.resolve(fn(req, res, next)).catch(next)
  }
}

// Error response formatter
export const formatErrorResponse = (error: Error) => {
  if (error instanceof AppError) {
    return {
      error: {
        message: error.message,
        code: error.code,
        statusCode: error.statusCode,
      },
    }
  }

  // Don't expose internal errors in production
  if (process.env.NODE_ENV === 'production') {
    return {
      error: {
        message: 'Something went wrong',
        code: 'INTERNAL_ERROR',
        statusCode: 500,
      },
    }
  }

  return {
    error: {
      message: error.message,
      code: 'INTERNAL_ERROR',
      statusCode: 500,
      stack: error.stack,
    },
  }
}

// Client-side error handler
export const handleClientError = (error: Error, context?: string) => {
  logError(error, { context, clientSide: true })
  
  // You can add toast notifications, modal dialogs, etc. here
  // Example: toast.error('Something went wrong. Please try again.')
  
  return formatErrorResponse(error)
}

