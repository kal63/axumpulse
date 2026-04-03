import type { User } from '@/lib/api-client'

/** Trainee may subscribe to a trainer plan (account + onboarding complete, or staff roles). */
export function canSubscribeToTrainerPlan(user: User | null): boolean {
  if (!user) return false
  if (user.isTrainer || user.isAdmin) return true
  return Boolean(user.profile?.traineeOnboardingCompletedAt)
}
