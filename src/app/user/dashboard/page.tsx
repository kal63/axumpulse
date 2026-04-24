'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/auth-context'
import { apiClient } from '@/lib/api-client'
import { useTraineeMotivationToasts } from '@/hooks/useTraineeMotivationToasts'
import { DashboardWelcomeRing } from '@/components/user/DashboardWelcomeRing'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import Image from 'next/image'
import { 
  Trophy, 
  Target, 
  Zap, 
  Award, 
  Play,
  BarChart3,
  Flame,
  Dumbbell,
  Calendar,
  ArrowUp,
  Clock,
  Star,
  Sparkles,
  Crown,
  AlertCircle,
  UserCheck,
  Package,
  RefreshCw,
  BadgeCheck,
  Lock
} from 'lucide-react'

export default function UserDashboardPage() {
  const router = useRouter()
  const { user, isLoading: authLoading } = useAuth()
  useTraineeMotivationToasts(user)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [greeting, setGreeting] = useState({ text: 'Good morning', emoji: '☀️' })
  
  // Data states
  const [userInfo, setUserInfo] = useState<any>(null)
  const [stats, setStats] = useState<any>(null)
  const [xpHistory, setXPHistory] = useState<any[]>([])
  const [xpSummary, setXPSummary] = useState<any>(null)
  const [achievements, setAchievements] = useState<any[]>([])
  const [subscription, setSubscription] = useState<any>(null)
  const [xpRange, setXpRange] = useState<'7d' | '30d' | '90d'>('30d')

  // Get greeting based on Ethiopian timezone
  const getGreeting = () => {
    // Get current time in Ethiopian timezone (Africa/Addis_Ababa, UTC+3)
    const formatter = new Intl.DateTimeFormat('en-US', {
      timeZone: 'Africa/Addis_Ababa',
      hour: 'numeric',
      hour12: false
    })
    const ethiopianHour = parseInt(formatter.format(new Date()))
    
    if (ethiopianHour >= 5 && ethiopianHour < 12) {
      return { text: 'Good morning', emoji: '☀️' }
    } else if (ethiopianHour >= 12 && ethiopianHour < 17) {
      return { text: 'Good afternoon', emoji: '💥' }
    } else if (ethiopianHour >= 17 && ethiopianHour < 21) {
      return { text: 'Good evening', emoji: '🌆' }
    } else {
      return { text: 'Good night', emoji: '🌙' }
    }
  }

  // Update greeting on mount and periodically
  useEffect(() => {
    setGreeting(getGreeting())
    
    // Update every hour to change greeting if needed
    const interval = setInterval(() => {
      setGreeting(getGreeting())
    }, 3600000) // Check every hour
    
    return () => clearInterval(interval)
  }, [])

  // Fetch dashboard data
  useEffect(() => {
    if (user && !authLoading) {
      fetchDashboardData()
    }
  }, [user, authLoading])

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login')
    }
  }, [authLoading, user, router])

  async function fetchDashboardData() {
    try {
      setLoading(true)
      setError(null)

      // Fetch all data in parallel
      const [statsRes, historyRes, achievementsRes, subscriptionRes] = await Promise.all([
        apiClient.getUserStats(),
        apiClient.getUserXPHistory(90), // Up to 90 days for 7d / 30d / 90d chart
        apiClient.getAchievements(),
        apiClient.getMySubscription()
      ])

      // Handle stats
      if (statsRes.success && statsRes.data) {
        setUserInfo(statsRes.data.user)
        setStats(statsRes.data.stats)
      }

      // Handle XP history - map backend format to frontend format
      if (historyRes.success && historyRes.data) {
        // Backend returns history with breakdown, frontend expects simple date/xp format
        const mappedHistory = historyRes.data.history.map((entry: any) => ({
          date: entry.date,
          xp: entry.xp,
          source: entry.breakdown?.content > 0 ? 'content' : 
                 entry.breakdown?.challenge > 0 ? 'challenge' : 
                 entry.breakdown?.workout > 0 ? 'workout' : 'other'
        }))
        setXPHistory(mappedHistory)
        setXPSummary(historyRes.data.summary)
      }

      // Handle achievements - map backend format to frontend format
      if (achievementsRes.success && achievementsRes.data) {
        setAchievements(achievementsRes.data.achievements || [])
      }

      // Handle subscription
      if (subscriptionRes.success && subscriptionRes.data) {
        setSubscription(subscriptionRes.data.subscription)
      }
    } catch (err) {
      console.error('Error fetching dashboard data:', err)
      setError('Failed to load dashboard data')
    } finally {
      setLoading(false)
    }
  }

  if (authLoading || loading) {
    return (
      <div className="flex min-h-dvh min-h-screen items-center justify-center user-app-page">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--ethio-deep-blue)] dark:border-cyan-500 mx-auto"></div>
          <p className="mt-4 user-app-muted">Loading...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  if (error) {
    return (
      <div className="flex min-h-dvh min-h-screen items-center justify-center user-app-page">
        <div className="text-center">
          <AlertCircle className="h-16 w-16 mx-auto mb-4 text-red-500 opacity-50" />
          <p className="user-app-ink text-xl font-semibold mb-2">
            Oops! Something went wrong
          </p>
          <p className="user-app-muted mb-4">{error}</p>
          <Button onClick={fetchDashboardData}>
            Try Again
          </Button>
        </div>
      </div>
    )
  }

  // Calculate user stats from real data
  const userStats = userInfo ? {
    level: userInfo.level || 1,
    xp: userInfo.xp || 0,
    xpProgress: userInfo.xpProgress || 0,
    xpNeeded: userInfo.xpNeeded || 100,
    workoutsCompleted: stats?.workoutPlansCompleted || 0,
    challengesCompleted: stats?.challengesCompleted || 0,
    achievementsUnlocked: stats?.achievementsUnlocked || 0,
    dayStreak: 0 // Backend doesn't return dailyStreak in stats, will need to get from profile if needed
  } : {
    level: 1,
    xp: 0,
    xpProgress: 0,
    xpNeeded: 100,
    workoutsCompleted: 0,
    challengesCompleted: 0,
    achievementsUnlocked: 0,
    dayStreak: 0
  }

  const filterXpByRange = (
    history: { date: string; xp: number; source: string }[],
    range: '7d' | '30d' | '90d'
  ) => {
    if (!history?.length) return []
    const days = range === '7d' ? 7 : range === '30d' ? 30 : 90
    const cutoff = new Date()
    cutoff.setHours(0, 0, 0, 0)
    cutoff.setDate(cutoff.getDate() - days)
    return history
      .filter((e) => new Date(e.date) >= cutoff)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
  }

  const xpFiltered = filterXpByRange(xpHistory || [], xpRange)
  const maxChartBars = xpRange === '7d' ? 7 : xpRange === '30d' ? 15 : 24
  const xpChartDisplay = xpFiltered.slice(-maxChartBars)
  const chartMaxXP = xpChartDisplay.length
    ? Math.max(...xpChartDisplay.map((e) => e.xp || 0), 1)
    : 1

  const content = (
    <div className="min-h-full">
      <div className="max-w-6xl mx-auto px-4 md:px-8 py-6 md:py-8">
        {/* Co-brand — demo: clean white/ink on soft grey page */}
        <header className="mb-6 md:mb-8 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-sm dark:border-slate-600 sm:h-14 sm:w-14">
              <Image
                src="/ethiotell.png"
                alt="Ethio telecom"
                width={56}
                height={56}
                className="h-full w-full object-contain p-1"
                priority
              />
            </div>
            <div>
              <div className="font-landing-display text-sm text-[hsl(222,47%,8%)] sm:text-base dark:text-slate-100">
                Ethio telecom
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">Powered by Compound 360</p>
            </div>
          </div>
          <div className="shrink-0">
            <Image
              src="/logo.png"
              alt="Compound 360"
              width={130}
              height={32}
              className="h-8 w-auto rounded-lg border border-slate-200/80 bg-white p-1 shadow-sm sm:h-9 dark:border-slate-600 dark:bg-slate-800"
              priority
            />
          </div>
        </header>

        {/* Welcome — demo: white card, lemon glow, ink type, ring card on the right */}
        <section className="relative mb-6 overflow-hidden rounded-[1.75rem] border border-slate-200/90 bg-white p-8 shadow-sm dark:border-slate-700 dark:bg-slate-900/90">
          <div
            className="pointer-events-none absolute -right-16 -top-16 size-64 rounded-full bg-[radial-gradient(circle_at_30%_30%,hsl(78,88%,55%,0.38),transparent_68%)] sm:size-72 dark:opacity-50"
            aria-hidden
          />
          <div className="relative flex flex-wrap items-start justify-between gap-8">
            <div className="min-w-0 max-w-2xl">
              <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-[var(--ethio-lemon)] px-3 py-1.5 text-xs font-bold text-[hsl(222,47%,8%)] shadow-[0_4px_14px_hsl(78,55%,40%,0.25)]">
                <Sparkles className="size-3.5 shrink-0" />
                Welcome Back
              </div>
              <h1 className="text-balance font-landing-display text-5xl leading-[1.05] text-[hsl(222,47%,8%)] dark:text-slate-50 md:text-6xl">
                {greeting.text}, {user.name?.split(' ')[0] || 'User'}!
              </h1>
              <div className="mt-2 text-4xl leading-tight md:text-5xl" aria-hidden>
                <span className="inline-block animate-welcome-float select-none">{greeting.emoji}</span>
              </div>
              <p className="mt-4 text-base text-slate-500 dark:text-slate-400">
                Ready to level up your fitness journey? Let&apos;s make today count!
              </p>
            </div>
            <div className="mx-auto w-full max-w-[200px] shrink-0 sm:mx-0 sm:w-[min(200px,100%)]">
              <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-[0_10px_30px_-15px_rgba(15,23,42,0.12)] dark:border-slate-600 dark:bg-slate-800/50 dark:shadow-md">
                <DashboardWelcomeRing
                  level={userStats.level}
                  currentXP={userStats.xp}
                  xpInCurrentLevel={userStats.xpProgress}
                  xpForLevel={userStats.xpNeeded}
                />
              </div>
            </div>
          </div>
        </section>

        <div className="space-y-6 sm:space-y-8">
          {subscription && (
            <section className="mb-2 overflow-hidden rounded-3xl border border-slate-200/90 bg-white text-card-foreground shadow-sm dark:border-border dark:bg-card">
              <div className="p-5 sm:p-6">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="flex min-w-0 items-center gap-3">
                    <div className="grid size-11 shrink-0 place-items-center rounded-xl bg-secondary/10 text-secondary">
                      <Package className="size-5" />
                    </div>
                    <div>
                      <h3 className="font-landing-display text-lg leading-tight sm:text-xl">Active subscription</h3>
                      <p className="text-sm text-muted-foreground">Your current plan</p>
                    </div>
                  </div>
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-[var(--ethio-lemon)] px-3 py-1 text-xs font-bold text-[hsl(222,47%,8%)] shadow-sm dark:text-slate-900">
                    <span className="size-1.5 animate-pulse rounded-full bg-[hsl(222,47%,8%)]/35 dark:bg-slate-900/40" />
                    Active
                  </span>
                </div>
                <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                  <Button
                    size="sm"
                    onClick={() => router.push('/user/subscription/change-package')}
                    className="rounded-full bg-secondary text-secondary-foreground hover:bg-secondary/90"
                  >
                    <RefreshCw className="mr-1.5 size-3.5" />
                    Change package
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => router.push('/user/subscription/change-trainer')}
                    className="rounded-full"
                  >
                    <UserCheck className="mr-1.5 size-3.5" />
                    Change trainer
                  </Button>
                </div>
                <div className="mt-6 grid gap-4 md:grid-cols-2">
                  <div className="rounded-2xl border border-border bg-muted/50 p-4 sm:p-5">
                    <div className="mb-1 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                      <Crown className="size-3.5 text-[hsl(210,95%,32%)] dark:text-cyan-400" />
                      Package
                    </div>
                    <div className="font-landing-display text-2xl">{subscription.subscriptionPlan?.name || '—'}</div>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {subscription.duration === 'daily'
                        ? 'Daily'
                        : subscription.duration === 'monthly'
                          ? 'Monthly'
                          : subscription.duration === 'threeMonth'
                            ? '3 months'
                            : subscription.duration === 'sixMonth'
                              ? '6 months'
                              : subscription.duration === 'nineMonth'
                                ? '9 months'
                                : '1 year'}{' '}
                      plan
                    </p>
                  </div>
                  <div className="rounded-2xl border border-border bg-muted/50 p-4 sm:p-5">
                    <div className="mb-1 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                      <BadgeCheck className="size-3.5 text-secondary" />
                      Trainer
                    </div>
                    <div className="font-landing-display text-2xl">
                      {subscription.trainer?.name || `Trainer #${subscription.trainerId}`}
                    </div>
                    {subscription.trainer?.profilePicture ? (
                      <div className="mt-1 flex items-center gap-2 text-xs text-secondary">
                        <img
                          src={subscription.trainer.profilePicture}
                          alt=""
                          className="size-6 rounded-full"
                        />
                        <BadgeCheck className="size-3.5" />
                        <span>Verified trainer</span>
                      </div>
                    ) : (
                      <p className="mt-1 text-xs text-muted-foreground">Your assigned coach</p>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-between border-t border-border bg-muted/30 px-5 py-3 text-sm sm:px-6">
                <span className="flex items-center gap-2 text-muted-foreground">
                  <Clock className="size-4" />
                  Expires on
                </span>
                <span className="font-bold text-foreground">
                  {new Date(subscription.expiresAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </span>
              </div>
            </section>
          )}

          <section className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
            {(
              [
                {
                  label: 'Day streak',
                  value: userStats.dayStreak,
                  icon: Flame,
                  tone: 'from-orange-500 to-red-500',
                  extra:
                    userStats.dayStreak > 0 ? (
                      <span className="mt-1 inline-flex items-center text-[10px] text-orange-500 sm:text-xs">
                        <Flame className="mr-0.5 size-3" />
                        Keep it up!
                      </span>
                    ) : null,
                },
                {
                  label: 'XP points',
                  value: userStats.xp.toLocaleString(),
                  icon: Zap,
                  tone: 'from-fuchsia-500 to-purple-600',
                  extra:
                    xpSummary && xpSummary.avgDailyXP > 0 ? (
                      <span className="mt-1 inline-flex items-center text-[10px] text-emerald-600 dark:text-emerald-400 sm:text-xs">
                        <ArrowUp className="mr-0.5 size-3" />
                        +{Math.round(xpSummary.avgDailyXP)} / day
                      </span>
                    ) : null,
                },
                {
                  label: 'Workouts',
                  value: userStats.workoutsCompleted,
                  icon: Dumbbell,
                  tone: 'from-sky-500 to-cyan-500',
                  extra:
                    userInfo?.workoutStreak > 0 ? (
                      <span className="mt-1 inline-flex items-center text-[10px] text-orange-500 sm:text-xs">
                        <Flame className="mr-0.5 size-3" />
                        {userInfo.workoutStreak} streak
                      </span>
                    ) : null,
                },
                {
                  label: 'Challenges',
                  value: userStats.challengesCompleted,
                  icon: Trophy,
                  tone: 'from-emerald-500 to-teal-600',
                  extra:
                    userInfo?.challengeStreak > 0 ? (
                      <span className="mt-1 inline-flex items-center text-[10px] text-amber-500 sm:text-xs">
                        <Trophy className="mr-0.5 size-3" />
                        {userInfo.challengeStreak} streak
                      </span>
                    ) : null,
                },
              ] as const
            ).map((s) => (
              <div
                key={s.label}
                className="group rounded-2xl border border-slate-200/90 bg-white p-4 text-left shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md dark:border-border dark:bg-card sm:p-5"
              >
                <div
                  className={`mb-3 grid size-11 sm:size-12 place-items-center rounded-2xl bg-gradient-to-br ${s.tone} text-white shadow-md transition group-hover:scale-105 sm:mb-4`}
                >
                  <s.icon className="size-5" />
                </div>
                <div className="font-landing-display text-2xl sm:text-3xl tabular-nums text-foreground">{s.value}</div>
                <div className="mt-0.5 text-[10px] font-bold uppercase tracking-wider text-muted-foreground sm:text-xs">
                  {s.label}
                </div>
                {s.extra}
              </div>
            ))}
          </section>

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 lg:gap-6">
            <div className="rounded-3xl border border-slate-200/90 bg-white p-5 shadow-sm dark:border-border dark:bg-card sm:p-6">
              <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-2">
                  <BarChart3 className="size-5 text-[var(--ethio-deep-blue)] dark:text-cyan-400" />
                  <h3 className="font-landing-display text-lg text-[hsl(222,47%,8%)] sm:text-xl dark:text-slate-100">
                    XP progress
                  </h3>
                </div>
                <div className="flex w-fit max-w-full items-center gap-1 rounded-full bg-slate-100 p-0.5 dark:bg-muted">
                  {(['7d', '30d', '90d'] as const).map((r) => (
                    <button
                      key={r}
                      type="button"
                      onClick={() => setXpRange(r)}
                      className={cn(
                        'px-2.5 py-1.5 text-xs font-bold transition sm:px-3',
                        xpRange === r
                          ? 'rounded-full bg-[var(--ethio-lemon)] text-[hsl(222,47%,8%)] shadow-sm dark:bg-primary dark:text-primary-foreground'
                          : 'rounded-full text-slate-500 hover:text-foreground dark:text-muted-foreground'
                      )}
                    >
                      {r}
                    </button>
                  ))}
                </div>
              </div>
              {xpChartDisplay.length > 0 ? (
                <div className="max-h-64 space-y-2.5 overflow-y-auto pr-0.5 sm:max-h-72 sm:space-y-3">
                  {xpChartDisplay.map((entry, index) => {
                    const value = Math.round(((entry.xp || 0) / chartMaxXP) * 100)
                    const colors = [
                      'from-cyan-500 to-blue-500',
                      'from-blue-500 to-purple-500',
                      'from-purple-500 to-fuchsia-500',
                      'from-fuchsia-500 to-rose-500',
                      'from-rose-500 to-orange-500',
                      'from-orange-500 to-amber-500',
                    ]
                    const dayLabels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
                    const date = new Date(entry.date)
                    const dayLabel =
                      dayLabels[date.getDay() === 0 ? 6 : date.getDay() - 1] ||
                      date.toLocaleDateString('en-US', { weekday: 'short' })
                    return (
                      <div key={`${entry.date}-${index}`} className="flex items-center gap-2 sm:gap-3">
                        <div className="w-8 shrink-0 text-[10px] text-muted-foreground sm:w-9 sm:text-xs">
                          {dayLabel}
                        </div>
                        <div className="h-2.5 min-w-0 flex-1 overflow-hidden rounded-full bg-muted">
                          <div
                            className={`h-full bg-gradient-to-r ${colors[index % colors.length]} rounded-full transition-all duration-500`}
                            style={{ width: `${value}%` }}
                          />
                        </div>
                        <div className="w-7 shrink-0 text-right text-xs font-semibold tabular-nums text-foreground sm:w-8">
                          {entry.xp || 0}
                        </div>
                      </div>
                    )
                  })}
                </div>
              ) : (
                <div className="grid h-40 place-items-center rounded-2xl border border-dashed border-border bg-muted/40 sm:h-48">
                  <div className="px-2 text-center">
                    <BarChart3 className="mx-auto size-8 text-muted-foreground/50 sm:size-10" />
                    <p className="mt-2 text-sm font-semibold">No XP in this range</p>
                    <p className="text-xs text-muted-foreground">Complete workouts to earn XP</p>
                  </div>
                </div>
              )}
            </div>

            <div className="rounded-3xl border border-slate-200/90 bg-white p-5 shadow-sm dark:border-border dark:bg-card sm:p-6">
              <div className="mb-4 flex items-center gap-2 sm:mb-5">
                <Award className="size-5 text-[var(--ethio-lemon)] dark:text-amber-400" />
                <h3 className="font-landing-display text-lg text-[hsl(222,47%,8%)] sm:text-xl dark:text-slate-100">
                  Recent achievements
                </h3>
              </div>
              {achievements?.filter((a) => a.unlocked).length ? (
                <ul className="mb-4 space-y-2 sm:space-y-3">
                  {achievements
                    .filter((a) => a.unlocked)
                    .sort((a, b) => {
                      const dateA = a.unlockedAt ? new Date(a.unlockedAt).getTime() : 0
                      const dateB = b.unlockedAt ? new Date(b.unlockedAt).getTime() : 0
                      return dateB - dateA
                    })
                    .slice(0, 4)
                    .map((achievement) => {
                      const getIcon = (icon: string) => {
                        const iconMap: Record<string, typeof Award> = {
                          trophy: Trophy,
                          target: Target,
                          flame: Flame,
                          award: Award,
                          dumbbell: Dumbbell,
                          calendar: Calendar,
                          star: Star,
                          zap: Zap,
                          crown: Crown,
                        }
                        return iconMap[icon] || Award
                      }
                      const IconComponent = getIcon(achievement.icon || 'award')
                      const unlockedDate = achievement.unlockedAt ? new Date(achievement.unlockedAt) : null
                      const getTimeAgo = (date: Date): string => {
                        const now = new Date()
                        const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)
                        if (diffInSeconds < 60) return 'Just now'
                        if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`
                        if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`
                        if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`
                        return `${Math.floor(diffInSeconds / 604800)}w ago`
                      }
                      const timeAgo = unlockedDate ? getTimeAgo(unlockedDate) : 'Recently'
                      return (
                        <li
                          key={achievement.id}
                          className="flex items-center gap-3 rounded-2xl border border-border/60 bg-muted/40 p-2.5 sm:gap-4 sm:p-3"
                        >
                          <div className="grid size-9 shrink-0 place-items-center rounded-full bg-gradient-to-br from-amber-400 to-orange-500 sm:size-10">
                            <IconComponent className="size-4 text-white sm:size-5" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <h4 className="truncate text-sm font-semibold text-foreground sm:text-base">{achievement.name}</h4>
                            <p className="line-clamp-1 text-xs text-muted-foreground sm:line-clamp-2 sm:text-sm">
                              {achievement.description}
                            </p>
                          </div>
                          <div className="shrink-0 text-right">
                            <div className="text-xs font-bold text-foreground sm:text-sm">+{achievement.xpReward || 0} XP</div>
                            <div className="text-[10px] text-muted-foreground sm:text-xs">{timeAgo}</div>
                          </div>
                        </li>
                      )
                    })}
                </ul>
              ) : (
                <p className="mb-3 text-center text-sm text-muted-foreground">No achievements yet — keep training!</p>
              )}
              <div className="grid grid-cols-3 gap-2 sm:gap-3">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div
                    key={i}
                    className="aspect-square rounded-2xl border border-dashed border-border bg-muted/30 grid place-items-center text-muted-foreground/50"
                    aria-hidden
                  >
                    <Lock className="size-4 sm:size-5" />
                  </div>
                ))}
              </div>
              <p className="mt-3 text-center text-xs text-muted-foreground">
                Complete workouts to unlock more achievements
              </p>
            </div>
          </div>

          <section className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            <Button
              type="button"
              onClick={() => router.push('/user/videos')}
              className="h-auto min-h-[4.5rem] flex-col gap-1 rounded-2xl bg-gradient-to-r from-[var(--ethio-lemon)] to-[var(--ethio-deep-blue)] py-4 text-sm font-bold text-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md sm:flex-row sm:gap-2 sm:py-5 sm:text-base"
            >
              <Play className="size-5 shrink-0 sm:mr-1" />
              <span>Start workout</span>
            </Button>
            <Button
              type="button"
              onClick={() => router.push('/user/workout-plans')}
              className="h-auto min-h-[4.5rem] flex-col gap-1 rounded-2xl bg-[var(--ethio-deep-blue)] py-4 text-sm font-bold text-white transition hover:-translate-y-0.5 hover:bg-[#0070b0] sm:flex-row sm:gap-2 sm:py-5 sm:text-base dark:bg-secondary dark:text-secondary-foreground dark:hover:bg-secondary/90"
            >
              <Target className="size-5 shrink-0 sm:mr-1" />
              <span>Workout plans</span>
            </Button>
            <Button
              type="button"
              onClick={() => router.push('/user/challenges')}
              className="h-auto min-h-[4.5rem] flex-col gap-1 rounded-2xl bg-gradient-to-br from-orange-500 to-red-500 py-4 text-sm font-bold text-white transition hover:-translate-y-0.5 hover:shadow-md sm:flex-row sm:gap-2 sm:py-5 sm:text-base"
            >
              <Trophy className="size-5 shrink-0 sm:mr-1" />
              <span>Challenges</span>
            </Button>
            <Button
              type="button"
              onClick={() => router.push('/user/progress')}
              className="h-auto min-h-[4.5rem] flex-col gap-1 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 py-4 text-sm font-bold text-white transition hover:-translate-y-0.5 hover:shadow-md sm:flex-row sm:gap-2 sm:py-5 sm:text-base"
            >
              <BarChart3 className="size-5 shrink-0 sm:mr-1" />
              <span>Progress</span>
            </Button>
          </section>

          <p className="pt-2 text-center text-xs text-muted-foreground md:pb-2">
            © {new Date().getFullYear()} Compound 360 · Keep moving!
          </p>
        </div>
      </div>
    </div>
  )

  return content
}