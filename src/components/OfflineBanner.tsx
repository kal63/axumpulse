'use client'

import { useOnline } from '@/hooks/use-online'
import { WifiOff } from 'lucide-react'

export function OfflineBanner() {
  const isOnline = useOnline()

  if (isOnline) return null

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-red-500 text-white py-2 px-4 text-center">
      <div className="flex items-center justify-center gap-2 text-sm font-medium">
        <WifiOff className="h-4 w-4" />
        <span>You are offline. Some features may not work.</span>
      </div>
    </div>
  )
}





