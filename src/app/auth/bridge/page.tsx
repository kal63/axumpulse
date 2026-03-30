'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { apiClient } from '@/lib/api-client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2 } from 'lucide-react'

export default function AuthBridgePage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [error, setError] = useState<string>('')

  useEffect(() => {
    const code = searchParams.get('code')
    const next = searchParams.get('next') || '/user/subscription/change-package'
    if (!code) {
      setError('Missing bridge code')
      return
    }

    void (async () => {
      const res = await apiClient.exchangeWebBridge(code)
      if (!res.success || !res.data?.token) {
        setError(res.error?.message || 'Bridge exchange failed')
        return
      }
      apiClient.setToken(res.data.token)
      router.replace(next)
    })()
  }, [router, searchParams])

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-6">
      <Card className="max-w-md w-full bg-slate-800/50 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white">Signing you in…</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {error ? (
            <Alert className="bg-red-500/10 border-red-500/50">
              <AlertDescription className="text-red-400">{error}</AlertDescription>
            </Alert>
          ) : (
            <div className="flex items-center gap-3 text-slate-300">
              <Loader2 className="w-5 h-5 animate-spin text-cyan-400" />
              <span>Preparing your session. Please wait.</span>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

