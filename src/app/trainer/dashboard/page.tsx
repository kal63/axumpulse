'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  FileText, 
  Trophy, 
  Users, 
  TrendingUp, 
  Upload, 
  Target,
  BarChart3,
  Zap
} from 'lucide-react'
import { useEffect, useState } from 'react'
import { apiClient } from '@/lib/api-client'
import { useAuth } from '@/contexts/auth-context'
import { useRouter } from 'next/navigation'

export default function TrainerDashboardPage() {
  const { user, isLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading) {
      if (!user) {
        router.push('/login')
        return
      }
      if (!user.isTrainer) {
        router.push('/admin/dashboard')
        return
      }
    }
  }, [user, isLoading, router])

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [apiStats, setApiStats] = useState<{ contentCount: number; activeChallenges: number } | null>(null)

  useEffect(() => {
    let mounted = true
    async function load() {
      const res = await apiClient.getTrainerStats()
      if (!mounted) return
      if (res.success && res.data) {
        setApiStats(res.data)
        setError(null)
      } else {
        setError(res.error?.message || 'Failed to load stats')
      }
      setLoading(false)
    }
    load()
    return () => { mounted = false }
  }, [])

  const stats = {
    totalContent: apiStats?.contentCount ?? 0,
    totalViews: 0,
    totalLikes: 0,
    activeChallenges: apiStats?.activeChallenges ?? 0,
    participants: 0,
    totalXP: 0
  }

  const recentActivity = [
    {
      id: 1,
      action: 'New workout video uploaded',
      time: '2 hours ago',
      type: 'content'
    },
    {
      id: 2,
      action: 'Challenge "30-Day Fitness" completed by 5 users',
      time: '4 hours ago',
      type: 'challenge'
    },
    {
      id: 3,
      action: 'Content "Morning Yoga" approved',
      time: '1 day ago',
      type: 'moderation'
    },
    {
      id: 4,
      action: 'New challenge "Strength Building" created',
      time: '2 days ago',
      type: 'challenge'
    }
  ]

  const statsCards = [
    {
      title: 'Total Content',
      value: stats.totalContent.toString(),
      change: '+2',
      changeType: 'positive' as const,
      icon: FileText,
      description: 'Uploaded content'
    },
    {
      title: 'Total Views',
      value: stats.totalViews.toLocaleString(),
      change: '+15%',
      changeType: 'positive' as const,
      icon: TrendingUp,
      description: 'Content views'
    },
    {
      title: 'Total Likes',
      value: stats.totalLikes.toString(),
      change: '+8',
      changeType: 'positive' as const,
      icon: Users,
      description: 'User likes'
    },
    {
      title: 'Active Challenges',
      value: stats.activeChallenges.toString(),
      change: '+1',
      changeType: 'positive' as const,
      icon: Trophy,
      description: 'Running challenges'
    },
    {
      title: 'Participants',
      value: stats.participants.toString(),
      change: '+12',
      changeType: 'positive' as const,
      icon: Target,
      description: 'Challenge participants'
    },
    {
      title: 'Total XP Earned',
      value: stats.totalXP.toLocaleString(),
      change: '+150',
      changeType: 'positive' as const,
      icon: Zap,
      description: 'From content and challenges'
    }
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Trainer Dashboard</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Welcome to your trainer dashboard. Manage your content and track your performance.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {statsCards.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
                {stat.title}
              </CardTitle>
              <stat.icon className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {stat.value}
              </div>
              <div className="flex items-center space-x-2 mt-1">
                <Badge 
                  variant={stat.changeType === 'positive' ? 'default' : 'secondary'}
                  className="text-xs"
                >
                  {stat.change}
                </Badge>
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {stat.description}
                </span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <BarChart3 className="h-5 w-5" />
              <span>Recent Activity</span>
            </CardTitle>
            <CardDescription>
              Your latest content and challenge activities
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivity.map((activity) => (
                <div key={activity.id} className="flex items-center space-x-4">
                  <div className="flex-shrink-0">
                    <div className="w-2 h-2 bg-blue-600 dark:bg-blue-400 rounded-full"></div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {activity.action}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {activity.time}
                    </p>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {activity.type}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Target className="h-5 w-5" />
              <span>Quick Actions</span>
            </CardTitle>
            <CardDescription>
              Common tasks and shortcuts
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer transition-colors" onClick={() => router.push('/trainer/content/upload')}>
                <div className="flex items-center space-x-3">
                  <Upload className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">Upload Content</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Add new content</p>
                  </div>
                </div>
              </div>
              
              <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer transition-colors" onClick={() => router.push('/trainer/challenges/new')}>
                <div className="flex items-center space-x-3">
                  <Trophy className="h-8 w-8 text-amber-600 dark:text-amber-400" />
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">Create Challenge</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">New challenge</p>
                  </div>
                </div>
              </div>
              
              <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer transition-colors" onClick={() => router.push('/trainer/content')}>
                <div className="flex items-center space-x-3">
                  <FileText className="h-8 w-8 text-green-600 dark:text-green-400" />
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">Manage Content</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">View all content</p>
                  </div>
                </div>
              </div>
              
              <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer transition-colors" onClick={() => router.push('/trainer/analytics')}>
                <div className="flex items-center space-x-3">
                  <BarChart3 className="h-8 w-8 text-purple-600 dark:text-purple-400" />
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">View Analytics</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Performance data</p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
