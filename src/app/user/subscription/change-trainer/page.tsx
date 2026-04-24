'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/auth-context'
import { NeumorphicCard } from '@/components/user/NeumorphicCard'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Users } from 'lucide-react'

export default function ChangeTrainerPage() {
  const router = useRouter()
  const { isAuthenticated, isLoading } = useAuth()

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login?redirect=/user/subscription/change-trainer')
    }
  }, [isAuthenticated, isLoading, router])

  return (
    <div className="min-h-dvh min-h-full user-app-page">
      <div className="max-w-3xl mx-auto px-4 py-8">
        <Button variant="outline" className="border-slate-600 text-slate-300" onClick={() => router.push('/user/dashboard')}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>

        <NeumorphicCard variant="raised" className="p-6 mt-6 space-y-4">
          <div>
            <h1 className="text-2xl font-bold user-app-ink">Change trainer</h1>
            <p className="text-sm user-app-muted">
              Select a new trainer. Your package and expiry date will stay the same.
            </p>
          </div>

          <Button
            className="w-full user-app-btn-primary"
            onClick={() => router.push('/trainers?mode=changeTrainer')}
          >
            <Users className="w-4 h-4 mr-2" />
            Choose a trainer
          </Button>
        </NeumorphicCard>
      </div>
    </div>
  )
}

