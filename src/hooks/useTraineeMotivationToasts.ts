'use client'

import { useEffect, useRef } from 'react'
import { toast } from 'sonner'
import { apiClient, type User } from '@/lib/api-client'

const STORAGE_PREFIX = 'axumpulse_motivation_v1_'

function todayKey() {
  return new Date().toISOString().slice(0, 10)
}

/**
 * Shows at most one motivational toast per day for trainees (not trainers/admins).
 */
export function useTraineeMotivationToasts(user: User | null) {
  const ran = useRef(false)

  useEffect(() => {
    if (ran.current) return
    if (!user?.id || user.isTrainer || user.isAdmin) return

    ran.current = true

    const run = async () => {
      try {
        const res = await apiClient.getUserStats()
        if (!res.success || !res.data) return

        const { user: u, stats } = res.data
        const storageKey = `${STORAGE_PREFIX}${user.id}_${todayKey()}`
        if (typeof localStorage !== 'undefined' && localStorage.getItem(storageKey)) return

        let title: string | null = null
        let description: string | null = null

        if (stats.workoutPlansCompleted > 0) {
          title = 'You are building real momentum'
          description = `You have completed ${stats.workoutPlansCompleted} workout plan(s). Show up again today — consistency beats intensity.`
        } else if (stats.challengesCompleted > 0) {
          title = 'Challenge champion energy'
          description = `You have finished ${stats.challengesCompleted} challenge(s). Pick your next goal and keep the streak alive.`
        } else if (stats.workoutPlansStarted === 0 && stats.challengesJoined === 0) {
          title = 'Your next win is one tap away'
          description = 'Start a workout plan or join a challenge — small steps stack into big results.'
        } else if (u.level >= 2) {
          title = `Level ${u.level} — nice work`
          description = 'Every session moves you forward. What will you train today?'
        }

        if (title && description) {
          toast.success(title, { description })
          localStorage.setItem(storageKey, '1')
        }
      } catch {
        /* ignore */
      }
    }

    void run()
  }, [user])
}
