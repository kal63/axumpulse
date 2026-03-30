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
    const apiBase = searchParams.get('api_base') || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api/v1'
    if (!code) {
      setError('Missing bridge code')
      return
    }

    void (async () => {
      try {
        const resp = await fetch(`${apiBase.replace(/\/$/, '')}/auth/exchange-bridge`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ code })
        })
        const json = await resp.json().catch(() => null)
        const token = json?.data?.token || json?.token
        if (!resp.ok || !token) {
          const msg = json?.error?.message || json?.message || 'Bridge exchange failed'
          setError(msg)
          return
        }
        // Ensure the web app uses the same API base that issued the token
        apiClient.setBaseUrl(apiBase)
        apiClient.setToken(token)
        router.replace(next)
      } catch (e: any) {
        setError(e?.message || 'Cannot connect to server. Please check API base URL.')
      }
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

