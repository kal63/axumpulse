'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { AlertTriangle, Bug, Zap } from 'lucide-react'
import { useErrorHandler } from './error-boundary'
import { AppError, ValidationError, NotFoundError } from '@/lib/error-handler'

export function ErrorDemo() {
  const [shouldThrow, setShouldThrow] = useState(false)
  const throwError = useErrorHandler()

  // This component will throw an error when shouldThrow is true
  if (shouldThrow) {
    throw new AppError('This is a demo error from the ErrorDemo component!', 500, 'DEMO_ERROR')
  }

  const handleThrowError = (errorType: 'app' | 'validation' | 'notfound') => {
    switch (errorType) {
      case 'app':
        throwError(new AppError('Application error occurred!', 500, 'APP_ERROR'))
        break
      case 'validation':
        throwError(new ValidationError('Invalid input provided', 'email'))
        break
      case 'notfound':
        throwError(new NotFoundError('User'))
        break
    }
  }

  return (
    <Card className="mb-8 border-orange-200 dark:border-orange-800">
      <CardHeader>
        <div className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-orange-600 dark:text-orange-400" />
          <CardTitle className="text-orange-900 dark:text-orange-100">
            Error Handling Demo
          </CardTitle>
        </div>
        <CardDescription className="text-orange-700 dark:text-orange-300">
          Test the error boundary and global error handling
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <h4 className="font-medium text-sm">Component Error Boundary:</h4>
            <div className="flex gap-2 flex-wrap">
              <Button 
                size="sm" 
                variant="destructive"
                onClick={() => setShouldThrow(true)}
              >
                <Bug className="mr-1 h-3 w-3" />
                Throw Component Error
              </Button>
            </div>
          </div>
          
          <div className="space-y-2">
            <h4 className="font-medium text-sm">Custom Error Types:</h4>
            <div className="flex gap-2 flex-wrap">
              <Button 
                size="sm" 
                variant="outline"
                onClick={() => handleThrowError('app')}
              >
                <Zap className="mr-1 h-3 w-3" />
                App Error
              </Button>
              <Button 
                size="sm" 
                variant="outline"
                onClick={() => handleThrowError('validation')}
              >
                Validation Error
              </Button>
              <Button 
                size="sm" 
                variant="outline"
                onClick={() => handleThrowError('notfound')}
              >
                Not Found Error
              </Button>
            </div>
          </div>
        </div>
        
        <div className="text-xs text-gray-500 dark:text-gray-400 space-y-1">
          <p>• <strong>Component Error:</strong> Will trigger the ErrorBoundary component</p>
          <p>• <strong>Custom Errors:</strong> Will trigger the global error page</p>
          <p>• <strong>404 Page:</strong> Visit any non-existent route to see the not-found page</p>
        </div>
      </CardContent>
    </Card>
  )
}

