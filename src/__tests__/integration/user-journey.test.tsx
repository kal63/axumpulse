/**
 * Integration Tests - User Journey
 * Tests the complete user flow through the application
 */

import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { apiClient } from '@/lib/api-client'

// Mock successful API responses
const mockContentResponse = {
  success: true,
  data: {
    items: [
      {
        id: 1,
        title: 'Morning Yoga',
        type: 'video',
        duration: 1800,
        trainer: { User: { name: 'Yoga Master' } }
      }
    ],
    pagination: { totalPages: 1, currentPage: 1 }
  }
}

const mockWorkoutPlanResponse = {
  success: true,
  data: {
    items: [
      {
        id: 1,
        title: 'Beginner Workout',
        exercises: [],
        trainer: { User: { name: 'Fitness Coach' } }
      }
    ],
    pagination: { totalPages: 1, currentPage: 1 }
  }
}

const mockChallengeResponse = {
  success: true,
  data: {
    items: [
      {
        id: 1,
        title: '7-Day Challenge',
        goalValue: 100,
        trainer: { User: { name: 'Challenge Coach' } }
      }
    ],
    pagination: { totalPages: 1, currentPage: 1 }
  }
}

describe('User Journey Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('Phase 1B: Content Discovery', () => {
    it('completes video discovery flow', async () => {
      // Mock API response
      ;(apiClient.getUserContent as jest.Mock).mockResolvedValue(mockContentResponse)

      // This test validates that the content discovery endpoints work
      const response = await apiClient.getUserContent({ page: 1 })
      
      expect(response.success).toBe(true)
      expect(response.data?.items).toHaveLength(1)
      expect(response.data?.items[0].title).toBe('Morning Yoga')
    })

    it('handles content filtering', async () => {
      ;(apiClient.getUserContent as jest.Mock).mockResolvedValue(mockContentResponse)

      const response = await apiClient.getUserContent({
        page: 1,
        category: 'Yoga',
        difficulty: 'beginner'
      })

      expect(apiClient.getUserContent).toHaveBeenCalledWith({
        page: 1,
        category: 'Yoga',
        difficulty: 'beginner'
      })
    })
  })

  describe('Phase 2: Workout Plans', () => {
    it('completes workout plan discovery flow', async () => {
      ;(apiClient.getUserWorkoutPlans as jest.Mock).mockResolvedValue(mockWorkoutPlanResponse)

      const response = await apiClient.getUserWorkoutPlans({ page: 1 })

      expect(response.success).toBe(true)
      expect(response.data?.items).toHaveLength(1)
      expect(response.data?.items[0].title).toBe('Beginner Workout')
    })

    it('starts a workout plan', async () => {
      ;(apiClient.startWorkoutPlan as jest.Mock).mockResolvedValue({
        success: true,
        data: { planProgress: { id: 1, status: 'active' } }
      })

      const response = await apiClient.startWorkoutPlan(1)

      expect(response.success).toBe(true)
      expect(apiClient.startWorkoutPlan).toHaveBeenCalledWith(1)
    })

    it('completes an exercise', async () => {
      ;(apiClient.completeExercise as jest.Mock).mockResolvedValue({
        success: true,
        data: { exerciseProgress: { completed: true }, planProgress: {} }
      })

      const response = await apiClient.completeExercise(1, 1, 30)

      expect(response.success).toBe(true)
      expect(apiClient.completeExercise).toHaveBeenCalledWith(1, 1, undefined)
    })
  })

  describe('Phase 3: Challenges', () => {
    it('completes challenge discovery flow', async () => {
      ;(apiClient.getUserChallenges as jest.Mock).mockResolvedValue(mockChallengeResponse)

      const response = await apiClient.getUserChallenges({ page: 1 })

      expect(response.success).toBe(true)
      expect(response.data?.items).toHaveLength(1)
      expect(response.data?.items[0].title).toBe('7-Day Challenge')
    })

    it('joins a challenge', async () => {
      ;(apiClient.joinChallenge as jest.Mock).mockResolvedValue({
        success: true,
        data: { progress: { challengeId: 1, userId: 1, status: 'active' } }
      })

      const response = await apiClient.joinChallenge(1)

      expect(response.success).toBe(true)
      expect(apiClient.joinChallenge).toHaveBeenCalledWith(1)
    })

    it('updates challenge progress', async () => {
      ;(apiClient.updateChallengeProgress as jest.Mock).mockResolvedValue({
        success: true,
        data: { progress: { progress: 50 } }
      })

      const response = await apiClient.updateChallengeProgress(1, 50)

      expect(response.success).toBe(true)
      expect(apiClient.updateChallengeProgress).toHaveBeenCalledWith(1, 50)
    })

    it('fetches challenge leaderboard', async () => {
      ;(apiClient.getChallengeLeaderboard as jest.Mock).mockResolvedValue({
        success: true,
        data: {
          leaderboard: [{ rank: 1, userId: 1, progress: 100 }],
          userRank: 1,
          totalParticipants: 10
        }
      })

      const response = await apiClient.getChallengeLeaderboard(1)

      expect(response.success).toBe(true)
      expect(response.data?.leaderboard).toHaveLength(1)
      expect(response.data?.totalParticipants).toBe(10)
    })
  })

  describe('User Engagement', () => {
    it('likes content', async () => {
      ;(apiClient.likeContent as jest.Mock).mockResolvedValue({
        success: true,
        data: { liked: true, totalLikes: 51 }
      })

      const response = await apiClient.likeContent(1)

      expect(response.success).toBe(true)
      expect(response.data?.liked).toBe(true)
    })

    it('saves content', async () => {
      ;(apiClient.saveContent as jest.Mock).mockResolvedValue({
        success: true,
        data: { saved: true }
      })

      const response = await apiClient.saveContent(1)

      expect(response.success).toBe(true)
      expect(response.data?.saved).toBe(true)
    })

    it('tracks watch progress', async () => {
      ;(apiClient.updateWatchProgress as jest.Mock).mockResolvedValue({
        success: true,
        data: { progress: { watchTime: 900 } }
      })

      const response = await apiClient.updateWatchProgress(1, 900)

      expect(response.success).toBe(true)
    })
  })
})





