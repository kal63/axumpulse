'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/auth-context'
import { apiClient } from '@/lib/api-client'
import {
  MobileHeader,
  BottomNavigation,
  NeumorphicCard,
  LeaderboardTable,
  ChallengeProgress
} from '@/components/user'
import { Trophy, Calendar, Target, Users, Award, TrendingUp, ArrowLeft, Clock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useToast } from '@/hooks/use-toast'
import { Progress } from '@/components/ui/progress'

export default function ChallengeDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { user } = useAuth()
  const { toast } = useToast()
  const challengeId = parseInt(params.id as string)

  const [challenge, setChallenge] = useState<any>(null)
  const [leaderboard, setLeaderboard] = useState<any[]>([])
  const [participantCount, setParticipantCount] = useState(0)
  const [userRank, setUserRank] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)
  const [joining, setJoining] = useState(false)
  const [updating, setUpdating] = useState(false)
  const [completing, setCompleting] = useState(false)
  const [now, setNow] = useState(() => new Date())

  useEffect(() => {
    fetchChallengeDetails()
  }, [challengeId])

  // Keep "time-gated completion" UI up to date
  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(interval)
  }, [challengeId])

  async function fetchChallengeDetails() {
    try {
      setLoading(true)
      const response = await apiClient.getUserChallengeById(challengeId)

      if (response.success && response.data) {
        setChallenge(response.data.challenge)
        setLeaderboard(response.data.leaderboard)
        setParticipantCount(response.data.participantCount)

        // Get full leaderboard to find user rank
        const leaderboardResponse = await apiClient.getChallengeLeaderboard(challengeId)
        if (leaderboardResponse.success && leaderboardResponse.data) {
          setUserRank(leaderboardResponse.data.userRank)
        }
      }
    } catch (err) {
      console.error('Error fetching challenge details:', err)
      toast({
        title: 'Error',
        description: 'Failed to load challenge details',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  async function handleJoinChallenge() {
    if (!user) {
      router.push('/login')
      return
    }

    try {
      setJoining(true)
      const response = await apiClient.joinChallenge(challengeId)

      if (response.success) {
        toast({
          title: 'Success!',
          description: 'You have joined the challenge',
        })
        await fetchChallengeDetails()
      } else {
        toast({
          title: 'Error',
          description: response.error?.message || 'Failed to join challenge',
          variant: 'destructive'
        })
      }
    } catch (err) {
      console.error('Error joining challenge:', err)
      toast({
        title: 'Error',
        description: 'Failed to join challenge',
        variant: 'destructive'
      })
    } finally {
      setJoining(false)
    }
  }

  async function handleProgressUpdate(newProgress: number) {
    try {
      setUpdating(true)
      const response = await apiClient.updateChallengeProgress(challengeId, newProgress)

      if (response.success) {
        toast({
          title: 'Progress Updated!',
          description: `Your progress has been updated to ${newProgress}`,
        })
        await fetchChallengeDetails()
      } else {
        toast({
          title: 'Error',
          description: response.error?.message || 'Failed to update progress',
          variant: 'destructive'
        })
      }
    } catch (err) {
      console.error('Error updating progress:', err)
      toast({
        title: 'Error',
        description: 'Failed to update progress',
        variant: 'destructive'
      })
    } finally {
      setUpdating(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--color-cyber-blue)]"></div>
      </div>
    )
  }

  if (!challenge) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <Trophy className="h-16 w-16 text-[var(--neumorphic-muted)] mb-4" />
        <h2 className="text-2xl font-bold text-[var(--neumorphic-text)] mb-2">Challenge Not Found</h2>
        <Button onClick={() => router.push('/user/challenges')}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Challenges
        </Button>
      </div>
    )
  }

  const userProgress = challenge.userProgress?.[0]
  const hasJoined = !!userProgress
  const startTime = challenge.startTime ? new Date(challenge.startTime) : null
  const endTime = challenge.endTime ? new Date(challenge.endTime) : null
  const isActive = startTime && endTime ? startTime <= now && endTime >= now : false
  const isUpcoming = startTime ? startTime > now : false
  const isCompleted = userProgress?.status === 'completed'
  
  const ruleJson = challenge.ruleJson || {}

  // Derive goal from `requirements` when it looks like "180 seconds"/"3 minutes".
  // Backend stores/uses time-based progress as seconds for those cases.
  const requirementsText = (challenge.requirements || '').toString()
  const requirementsMatch = requirementsText.match(/(\d+)\s*(seconds?|secs?|s|minutes?|mins?|m|hours?|hrs?|h)\b/i)

  let goalValue: number = 100
  let goalType: string = 'units'
  let timeGateSeconds: number | null = null

  if (requirementsMatch) {
    const n = parseInt(requirementsMatch[1], 10)
    const unitRaw = (requirementsMatch[2] || '').toLowerCase()

    if (unitRaw.startsWith('sec') || unitRaw === 's') {
      goalValue = n
      goalType = 'seconds'
      timeGateSeconds = n
    } else if (unitRaw.startsWith('min') || unitRaw === 'm') {
      goalValue = n * 60
      goalType = 'seconds'
      timeGateSeconds = n * 60
    } else if (unitRaw.startsWith('hour') || unitRaw.startsWith('hr') || unitRaw === 'h') {
      goalValue = n * 3600
      goalType = 'seconds'
      timeGateSeconds = n * 3600
    }
  } else {
    goalValue =
      (challenge as any).goalValue ||
      ruleJson.amount ||
      ruleJson.targetValue ||
      100
    goalType = (challenge as any).goalType || ruleJson.unit || ruleJson.target || 'units'
  }

  const elapsedSeconds =
    userProgress?.joinedAt ? Math.floor((now.getTime() - new Date(userProgress.joinedAt).getTime()) / 1000) : 0
  const completionEligible = timeGateSeconds === null ? true : elapsedSeconds >= timeGateSeconds

  async function handleCompleteChallenge() {
    if (!userProgress || isCompleted || completing) return
    try {
      setCompleting(true)
      const response = await apiClient.completeChallenge(challengeId)

      if (response.success) {
        toast({
          title: 'Challenge completed!',
          description: `You earned ${challenge.xpReward || 0} XP.`,
        })
        await fetchChallengeDetails()
      } else {
        toast({
          title: 'Error',
          description: response.error?.message || 'Failed to complete challenge',
          variant: 'destructive',
        })
      }
    } catch (err) {
      console.error('Error completing challenge:', err)
      toast({
        title: 'Error',
        description: 'Failed to complete challenge',
        variant: 'destructive',
      })
    } finally {
      setCompleting(false)
    }
  }
  const progressPercentage = userProgress && goalValue ? (userProgress.progress / goalValue) * 100 : 0

  const difficultyColors = {
    beginner: 'text-green-600 dark:text-green-400',
    intermediate: 'text-yellow-600 dark:text-yellow-400',
    advanced: 'text-red-600 dark:text-red-400',
  }

  const content = (
    <div className="space-y-6">
      {/* Back Button */}
      <Button variant="outline" onClick={() => router.push('/user/challenges')}>
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Challenges
      </Button>

      {/* Challenge Header */}
      <NeumorphicCard>
        <div className="space-y-6">
          {/* Title and Status */}
          <div>
            <div className="flex items-start justify-between gap-4 mb-2">
              <h1 className="text-3xl font-bold text-[var(--neumorphic-text)] flex-1">
                {challenge.title}
              </h1>
              {isCompleted && (
                <div className="px-4 py-2 rounded-full bg-gradient-to-r from-green-500 to-emerald-600 text-white text-sm font-medium flex items-center gap-2">
                  <Trophy className="h-4 w-4" />
                  Completed
                </div>
              )}
            </div>
            {challenge.trainer && (
              <p className="text-sm text-[var(--neumorphic-muted)]">
                by {challenge.trainer.User.name}
                {challenge.trainer.verified && ' ✓'}
              </p>
            )}
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-[var(--color-cyber-blue)] to-[var(--color-neon-magenta)] flex items-center justify-center">
                <Target className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="text-xs text-[var(--neumorphic-muted)]">Goal</p>
                <p className="text-lg font-bold text-[var(--neumorphic-text)]">
                  {goalValue} {goalType}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-[var(--color-lime-pulse)] to-[var(--color-amber-warning)] flex items-center justify-center">
                <Award className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="text-xs text-[var(--neumorphic-muted)]">Reward</p>
                <p className="text-lg font-bold text-[var(--neumorphic-text)]">
                  {challenge.xpReward} XP
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center">
                <Calendar className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="text-xs text-[var(--neumorphic-muted)]">Ends</p>
                <p className="text-sm font-bold text-[var(--neumorphic-text)]">
                  {challenge.endTime 
                    ? new Date(challenge.endTime).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric'
                      })
                    : 'Invalid date'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center">
                <Users className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="text-xs text-[var(--neumorphic-muted)]">Participants</p>
                <p className="text-lg font-bold text-[var(--neumorphic-text)]">
                  {participantCount}
                </p>
              </div>
            </div>
          </div>

          {/* Description */}
          <div>
            <h3 className="text-lg font-semibold text-[var(--neumorphic-text)] mb-2">
              About This Challenge
            </h3>
            <p className="text-[var(--neumorphic-muted)] leading-relaxed">
              {challenge.description}
            </p>
          </div>

          {/* Difficulty and Category */}
          <div className="flex flex-wrap gap-3">
            <div className="px-4 py-2 rounded-lg bg-gray-100 dark:bg-gray-800">
              <span className="text-xs text-[var(--neumorphic-muted)]">Category: </span>
              <span className="text-sm font-medium text-[var(--neumorphic-text)] capitalize">
                {(challenge as any).category || challenge.type || 'fitness'}
              </span>
            </div>
            <div className="px-4 py-2 rounded-lg bg-gray-100 dark:bg-gray-800">
              <span className="text-xs text-[var(--neumorphic-muted)]">Difficulty: </span>
              <span className={`text-sm font-bold capitalize ${difficultyColors[challenge.difficulty as keyof typeof difficultyColors]}`}>
                {challenge.difficulty}
              </span>
            </div>
          </div>

          {/* Join Button - Show for active challenges if not joined */}
          {!hasJoined && isActive && (
            <button
              onClick={handleJoinChallenge}
              disabled={joining || !user}
              className="w-full inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl font-medium transition-all duration-200 px-6 py-3 bg-gradient-to-r from-cyan-500 to-purple-600 text-white shadow-lg hover:from-cyan-600 hover:to-purple-700 disabled:pointer-events-none disabled:opacity-50"
            >
              {joining ? 'Joining...' : user ? 'Join Challenge' : 'Login to Join'}
            </button>
          )}

          {/* Upcoming Message - Show join button but disabled */}
          {!hasJoined && isUpcoming && (
            <div className="space-y-3">
              <div className="p-4 rounded-lg bg-blue-50 dark:bg-blue-900/20 border-2 border-blue-200 dark:border-blue-800">
                <div className="flex items-center gap-2 text-blue-700 dark:text-blue-400 mb-2">
                  <Clock className="h-5 w-5" />
                  <p className="font-medium">
                    {challenge.startTime 
                      ? `This challenge starts on ${new Date(challenge.startTime).toLocaleDateString('en-US', {
                          month: 'long',
                          day: 'numeric',
                          year: 'numeric'
                        })}`
                      : 'Invalid start date'}
                  </p>
                </div>
                <p className="text-sm text-blue-600 dark:text-blue-400 mt-2">
                  You'll be able to join once the challenge starts.
                </p>
              </div>
              <button
                disabled
                className="w-full inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl font-medium transition-all duration-200 px-6 py-3 bg-gray-300 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed disabled:pointer-events-none disabled:opacity-50"
              >
                Join Challenge (Starts Soon)
              </button>
            </div>
          )}

          {/* Ended Challenge Message */}
          {!hasJoined && !isActive && !isUpcoming && (
            <div className="p-4 rounded-lg bg-gray-50 dark:bg-gray-900/20 border-2 border-gray-200 dark:border-gray-800">
              <div className="flex items-center gap-2 text-gray-700 dark:text-gray-400">
                <Clock className="h-5 w-5" />
                <p className="font-medium">
                  This challenge has ended.
                </p>
              </div>
            </div>
          )}

          {/* Complete Button (time-gated when `requirements` includes seconds/minutes) */}
          {hasJoined && userProgress && !isCompleted && isActive && (
            <div className="space-y-3">
              {timeGateSeconds !== null ? (
                <p className="text-sm text-[var(--neumorphic-muted)]">
                  Hold until you reach the required duration. {completionEligible ? 'Ready to complete.' : `Time left: ${Math.max(0, timeGateSeconds - elapsedSeconds)}s.`}
                </p>
              ) : (
                <p className="text-sm text-[var(--neumorphic-muted)]">
                  Mark this challenge complete to claim your XP reward.
                </p>
              )}

              <button
                onClick={handleCompleteChallenge}
                disabled={completing || !completionEligible || !user}
                className={`w-full inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl font-medium transition-all duration-200 px-6 py-3 shadow-lg ${
                  completing || !completionEligible
                    ? 'bg-gray-300 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed'
                    : 'bg-gradient-to-r from-cyan-500 to-purple-600 text-white hover:from-cyan-600 hover:to-purple-700'
                }`}
              >
                {completing
                  ? 'Completing...'
                  : completionEligible
                    ? 'Finish & Claim XP'
                    : 'Complete when duration ends'}
              </button>
            </div>
          )}
        </div>
      </NeumorphicCard>

      {/* Progress Tracking (if user has joined) */}
      {hasJoined && userProgress && (
        <ChallengeProgress
          challengeId={challengeId}
          currentProgress={userProgress.progress}
          goalValue={goalValue}
          goalType={goalType}
          onProgressUpdate={handleProgressUpdate}
          isUpdating={updating}
        />
      )}

      {/* Leaderboard */}
      <LeaderboardTable
        leaderboard={leaderboard}
        currentUserId={user?.id}
        userRank={userRank}
        totalParticipants={participantCount}
        goalValue={goalValue}
      />
    </div>
  )

  return (
    <>
      {/* Desktop Layout - Already has sidebar from user layout */}
      <div className="hidden md:block">
        <div className="p-6">
          {content}
        </div>
      </div>

      {/* Mobile Layout */}
      <div className="md:hidden">
        <MobileHeader title={challenge.title} subtitle={(challenge as any).category || challenge.type || 'fitness'} />
        <div className="p-4 pb-24">{content}</div>
        <BottomNavigation />
      </div>
    </>
  )
}

