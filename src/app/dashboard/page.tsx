'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/auth-context'

export default function DashboardPage() {
  const { user, isLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && user) {
      // Redirect based on user permissions
      if (user.isAdmin) {
        router.push('/admin/dashboard')
      } else if (user.isTrainer) {
        router.push('/trainer/dashboard')
      } else {
        router.push('/user/dashboard')
      }
    }
  }, [user, isLoading, router])

  // Show loading while determining redirect
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
    </div>
  )
}

