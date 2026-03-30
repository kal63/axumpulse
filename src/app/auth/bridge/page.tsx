import { Suspense } from 'react'
import { AuthBridgeClient } from './auth-bridge-client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Loader2 } from 'lucide-react'

function AuthBridgeFallback() {
  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-6">
      <Card className="max-w-md w-full bg-slate-800/50 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white">Signing you in…</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-3 text-slate-300">
            <Loader2 className="w-5 h-5 animate-spin text-cyan-400" />
            <span>Preparing your session. Please wait.</span>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default function AuthBridgePage() {
  return (
    <Suspense fallback={<AuthBridgeFallback />}>
      <AuthBridgeClient />
    </Suspense>
  )
}
