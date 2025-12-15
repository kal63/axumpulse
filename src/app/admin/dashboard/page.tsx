'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Users, UserCheck, FileText, Trophy, TrendingUp, Activity, AlertCircle, Zap, Crown } from 'lucide-react'
import { apiClient, type AdminStats } from '@/lib/api-client'
import { toast } from 'sonner'
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar
} from 'recharts'

export default function DashboardPage() {
  const [stats, setStats] = useState<AdminStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setIsLoading(true)
        setError(null)
        const response = await apiClient.getAdminStats()
        
        if (response.success && response.data) {
          setStats(response.data)
        } else {
          setError(response.error?.message || 'Failed to fetch stats')
          toast.error('Failed to load dashboard stats')
        }
      } catch (err) {
        setError('Network error occurred')
        toast.error('Failed to connect to the server')
      } finally {
        setIsLoading(false)
      }
    }

    fetchStats()
  }, [])

  const statsCards = stats ? [
    {
      title: 'Total Users',
      value: stats.users.toString(),
      change: '+12.5%',
      changeType: 'positive' as const,
      icon: Users,
      description: 'Registered users'
    },
    {
      title: 'Trainers',
      value: stats.trainers.toString(),
      change: '+2',
      changeType: 'neutral' as const,
      icon: UserCheck,
      description: 'Verified trainers'
    },
    {
      title: 'Active Challenges',
      value: stats.challenges.toString(),
      change: '+1',
      changeType: 'positive' as const,
      icon: Trophy,
      description: 'Currently running'
    },
    {
      title: 'Available Rewards',
      value: stats.rewards.toString(),
      change: '+3',
      changeType: 'positive' as const,
      icon: FileText,
      description: 'Rewards in catalog'
    },
    {
      title: 'System XP Total',
      value: stats.totalXp?.toLocaleString() || '0',
      change: '+1,250',
      changeType: 'positive' as const,
      icon: Zap,
      description: 'All users combined'
    },
    {
      title: 'Total Completions',
      value: stats.challengesCompleted?.toLocaleString() || '0',
      change: '+45',
      changeType: 'positive' as const,
      icon: Trophy,
      description: 'Challenge completions'
    },
    {
      title: 'Pro Subscribers',
      value: stats.proSubscriptions?.toString() || '0',
      change: '+2',
      changeType: 'positive' as const,
      icon: Crown,
      description: 'Premium tier users'
    }
  ] : []

  // Chart data - using mock data for now since we don't have historical data
  const userGrowthData = [
    { month: 'Jan', users: 1200, xp: 45000 },
    { month: 'Feb', users: 1450, xp: 52000 },
    { month: 'Mar', users: 1680, xp: 61000 },
    { month: 'Apr', users: 1920, xp: 72000 },
    { month: 'May', users: 2150, xp: 85000 },
    { month: 'Jun', users: 2400, xp: 98000 }
  ]

  const challengeEngagementData = [
    { name: 'Completed', value: stats?.challengesCompleted || 0, color: '#10b981' },
    { name: 'In Progress', value: (stats?.challenges || 0) * 0.3, color: '#f59e0b' },
    { name: 'Not Started', value: (stats?.challenges || 0) * 0.7, color: '#ef4444' }
  ]

  const challengeTypesData = [
    { name: 'Fitness', completions: 45 },
    { name: 'Nutrition', completions: 32 },
    { name: 'Wellness', completions: 28 },
    { name: 'Achievement', completions: 15 }
  ]

  const subscriptionData = [
    { name: 'Premium', value: (stats?.users || 0) - (stats?.proSubscriptions || 0), color: '#3b82f6' },
    { name: 'Pro', value: stats?.proSubscriptions || 0, color: '#8b5cf6' }
  ]

  const userActivityData = [
    { level: 'High Activity', users: Math.floor((stats?.users || 0) * 0.3) },
    { level: 'Medium Activity', users: Math.floor((stats?.users || 0) * 0.5) },
    { level: 'Low Activity', users: Math.floor((stats?.users || 0) * 0.2) }
  ]

  const recentActivity = [
    {
      id: 1,
      action: 'New trainer registered',
      user: 'Emily Chen',
      time: '2 hours ago',
      type: 'trainer'
    },
    {
      id: 2,
      action: 'Content approved',
      user: 'Sara Bekele',
      time: '4 hours ago',
      type: 'moderation'
    },
    {
      id: 3,
      action: 'Challenge created',
      user: 'Admin',
      time: '6 hours ago',
      type: 'challenge'
    },
    {
      id: 4,
      action: 'User blocked',
      user: 'Blocked User',
      time: '1 day ago',
      type: 'user'
    },
    {
      id: 5,
      action: 'Reward redeemed',
      user: 'Meron Tekle',
      time: '2 days ago',
      type: 'reward'
    }
  ]

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Welcome to Compound 360 Admin Dashboard
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <div className="h-4 w-24 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                <div className="h-4 w-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
              </CardHeader>
              <CardContent>
                <div className="h-8 w-16 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mb-2"></div>
                <div className="h-3 w-20 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Welcome to Compound 360 Admin Dashboard
          </p>
        </div>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2 text-red-600">
              <AlertCircle className="h-5 w-5" />
              <p>Error loading dashboard: {error}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Welcome to Compound 360 Admin Dashboard
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statsCards.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
                {stat.title}
              </CardTitle>
              <stat.icon className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
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

      {/* Analytics Visualizations */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* User Growth & XP Trends */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <TrendingUp className="h-5 w-5" />
              <span>User Growth & XP Trends</span>
            </CardTitle>
            <CardDescription>
              User registrations and XP accumulation over time
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={userGrowthData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis yAxisId="left" />
                  <YAxis yAxisId="right" orientation="right" />
                  <Tooltip />
                  <Line 
                    yAxisId="left"
                    type="monotone" 
                    dataKey="users" 
                    stroke="#10b981" 
                    strokeWidth={2}
                    name="Users"
                  />
                  <Line 
                    yAxisId="right"
                    type="monotone" 
                    dataKey="xp" 
                    stroke="#3b82f6" 
                    strokeWidth={2}
                    name="Total XP"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Challenge Engagement */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Trophy className="h-5 w-5" />
              <span>Challenge Engagement</span>
            </CardTitle>
            <CardDescription>
              Challenge completion rates and popular types
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={challengeEngagementData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {challengeEngagementData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Second Row of Visualizations */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* User Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Users className="h-5 w-5" />
              <span>User Distribution</span>
            </CardTitle>
            <CardDescription>
              Subscription tiers and activity levels
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={subscriptionData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {subscriptionData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Challenge Types Performance */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <FileText className="h-5 w-5" />
              <span>Challenge Types Performance</span>
            </CardTitle>
            <CardDescription>
              Most popular challenge categories
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={challengeTypesData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="completions" fill="#10b981" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Activity className="h-5 w-5" />
              <span>Recent Activity</span>
            </CardTitle>
            <CardDescription>
              Latest actions across the platform
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivity.map((activity) => (
                <div key={activity.id} className="flex items-center space-x-4">
                  <div className="flex-shrink-0">
                    <div className="w-2 h-2 bg-emerald-600 dark:bg-emerald-400 rounded-full"></div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {activity.action}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {activity.user} • {activity.time}
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
              <TrendingUp className="h-5 w-5" />
              <span>Quick Actions</span>
            </CardTitle>
            <CardDescription>
              Common administrative tasks
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer transition-colors">
                <div className="flex items-center space-x-3">
                  <FileText className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">Review Content</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">15 pending</p>
                  </div>
                </div>
              </div>
              
              <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer transition-colors">
                <div className="flex items-center space-x-3">
                  <UserCheck className="h-8 w-8 text-emerald-600 dark:text-emerald-400" />
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">Verify Trainers</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">8 pending</p>
                  </div>
                </div>
              </div>
              
              <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer transition-colors">
                <div className="flex items-center space-x-3">
                  <Trophy className="h-8 w-8 text-amber-600 dark:text-amber-400" />
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">Manage Challenges</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">4 active</p>
                  </div>
                </div>
              </div>
              
              <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer transition-colors">
                <div className="flex items-center space-x-3">
                  <Users className="h-8 w-8 text-purple-600 dark:text-purple-400" />
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">User Management</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">12,450 users</p>
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
