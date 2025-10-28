'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown, 
  Eye, 
  Heart, 
  Users, 
  Target, 
  FileText, 
  Dumbbell, 
  Trophy,
  Calendar,
  Activity
} from 'lucide-react'
import { apiClient, TrainerAnalytics } from '@/lib/api-client'
import { cn } from '@/lib/utils'
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

export default function TrainerAnalyticsPage() {
  const [analytics, setAnalytics] = useState<TrainerAnalytics | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [period, setPeriod] = useState<'7d' | '30d' | '90d' | '1y'>('30d')

  const fetchAnalytics = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await apiClient.getTrainerAnalytics(period)
      if (response.success && response.data) {
        setAnalytics(response.data)
      } else {
        setError(response.error?.message || 'Failed to fetch analytics')
      }
    } catch (err) {
      setError('An error occurred while fetching analytics')
      console.error('Analytics fetch error:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAnalytics()
  }, [period])

  const formatNumber = (num: number) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M'
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K'
    return num.toString()
  }

  const formatPercentage = (num: number) => {
    const sign = num >= 0 ? '+' : ''
    return `${sign}${num.toFixed(1)}%`
  }

  const getGrowthIcon = (growth: number) => {
    return growth >= 0 ? <TrendingUp className="h-4 w-4 text-green-500" /> : <TrendingDown className="h-4 w-4 text-red-500" />
  }

  const getGrowthColor = (growth: number) => {
    return growth >= 0 ? 'text-green-600' : 'text-red-600'
  }

  // Chart data processing functions
  const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4']

  const getContentDistributionData = () => {
    if (!analytics?.contentAnalytics.byType || analytics.contentAnalytics.byType.length === 0) {
      return []
    }
    
    const typeMap = new Map()
    analytics.contentAnalytics.byType.forEach(item => {
      const existing = typeMap.get(item.type) || { name: item.type, value: 0, count: 0 }
      existing.value += parseInt(item.totalViews) || 0
      existing.count += parseInt(item.count) || 0
      typeMap.set(item.type, existing)
    })
    
    return Array.from(typeMap.values())
  }
  
  const getContentStatusData = () => {
    if (!analytics?.contentAnalytics.byStatus || analytics.contentAnalytics.byStatus.length === 0) {
      return []
    }
    
    return analytics.contentAnalytics.byStatus.map(item => ({
      name: item.status.charAt(0).toUpperCase() + item.status.slice(1),
      value: parseInt(item.count) || 0
    }))
  }

  const getTopPerformingContentData = () => {
    if (!analytics?.contentAnalytics.topPerforming || analytics.contentAnalytics.topPerforming.length === 0) {
      return []
    }
    
    return analytics.contentAnalytics.topPerforming.slice(0, 5).map(item => ({
      name: item.title.length > 20 ? item.title.substring(0, 20) + '...' : item.title,
      views: item.views,
      likes: item.likes
    }))
  }

  const getChallengeParticipationData = () => {
    if (!analytics?.challengeAnalytics.byType || analytics.challengeAnalytics.byType.length === 0) {
      return []
    }
    
    const typeMap = new Map()
    analytics.challengeAnalytics.byType.forEach(item => {
      const existing = typeMap.get(item.type) || { name: item.type, participants: 0, completions: 0 }
      existing.participants += parseInt(item.totalParticipants) || 0
      existing.completions += parseInt(item.totalCompletions) || 0
      typeMap.set(item.type, existing)
    })
    
    return Array.from(typeMap.values())
  }

  const getGrowthTrendData = () => {
    // For now, return empty array since we don't have real growth trend data from the API
    // In a real app, this would come from the API with actual historical data
    return []
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Analytics Dashboard</h1>
            <p className="text-muted-foreground">Track your performance and engagement metrics</p>
          </div>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(8)].map((_, i) => (
            <Card key={i}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <div className="h-4 w-20 bg-muted animate-pulse rounded" />
                <div className="h-4 w-4 bg-muted animate-pulse rounded" />
              </CardHeader>
              <CardContent>
                <div className="h-8 w-16 bg-muted animate-pulse rounded mb-2" />
                <div className="h-3 w-24 bg-muted animate-pulse rounded" />
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
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Analytics Dashboard</h1>
            <p className="text-muted-foreground">Track your performance and engagement metrics</p>
          </div>
        </div>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-destructive mb-4">{error}</p>
              <Button onClick={fetchAnalytics}>Try Again</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!analytics) return null

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Analytics Dashboard</h1>
          <p className="text-muted-foreground">Track your performance and engagement metrics</p>
        </div>
        <div className="flex items-center space-x-2">
          <Select value={period} onValueChange={(value: '7d' | '30d' | '90d' | '1y') => setPeriod(value)}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
              <SelectItem value="1y">Last year</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm" onClick={fetchAnalytics}>
            <Activity className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Content</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(analytics.overview.totalContent)}</div>
            <div className="flex items-center text-xs text-muted-foreground">
              {getGrowthIcon(analytics.growth.content.growth)}
              <span className={cn("ml-1", getGrowthColor(analytics.growth.content.growth))}>
                {formatPercentage(analytics.growth.content.growth)} from last period
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Views</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(analytics.overview.totalViews)}</div>
            <p className="text-xs text-muted-foreground">
              Across all content
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Likes</CardTitle>
            <Heart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(analytics.overview.totalLikes)}</div>
            <p className="text-xs text-muted-foreground">
              User engagement
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Challenge Participants</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(analytics.overview.totalParticipants)}</div>
            <p className="text-xs text-muted-foreground">
              {analytics.overview.completionRate}% completion rate
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Workout Plans</CardTitle>
            <Dumbbell className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(analytics.overview.totalWorkoutPlans)}</div>
            <div className="flex items-center text-xs text-muted-foreground">
              {getGrowthIcon(analytics.growth.workoutPlans.growth)}
              <span className={cn("ml-1", getGrowthColor(analytics.growth.workoutPlans.growth))}>
                {formatPercentage(analytics.growth.workoutPlans.growth)} from last period
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Challenges</CardTitle>
            <Trophy className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(analytics.overview.activeChallenges)}</div>
            <div className="flex items-center text-xs text-muted-foreground">
              {getGrowthIcon(analytics.growth.challenges.growth)}
              <span className={cn("ml-1", getGrowthColor(analytics.growth.challenges.growth))}>
                {formatPercentage(analytics.growth.challenges.growth)} from last period
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Approved Content</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(analytics.overview.approvedContent)}</div>
            <p className="text-xs text-muted-foreground">
              {analytics.overview.totalContent > 0 ? 
                Math.round((analytics.overview.approvedContent / analytics.overview.totalContent) * 100) : 0}% approval rate
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Challenge Completions</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(analytics.overview.totalCompletions)}</div>
            <p className="text-xs text-muted-foreground">
              Total completions
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Analytics */}
      <Tabs defaultValue="content" className="space-y-4">
        <TabsList>
          <TabsTrigger value="content">Content Analytics</TabsTrigger>
          <TabsTrigger value="workouts">Workout Plans</TabsTrigger>
          <TabsTrigger value="challenges">Challenges</TabsTrigger>
        </TabsList>

        <TabsContent value="content" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {/* Content by Type */}
            <Card>
              <CardHeader>
                <CardTitle>Content by Type</CardTitle>
                <CardDescription>Distribution of your content across different types</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {analytics.contentAnalytics.byType.map((item, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Badge variant="outline">{item.type}</Badge>
                        <span className="text-sm text-muted-foreground">{item.status}</span>
                      </div>
                      <div className="text-sm font-medium">
                        {item.count} items
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Content by Status */}
            <Card>
              <CardHeader>
                <CardTitle>Content by Status</CardTitle>
                <CardDescription>Current status of your content</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {analytics.contentAnalytics.byStatus.map((item, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <Badge variant={item.status === 'approved' ? 'default' : 'secondary'}>
                        {item.status}
                      </Badge>
                      <span className="text-sm font-medium">{item.count} items</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Top Performing Content */}
          <Card>
            <CardHeader>
              <CardTitle>Top Performing Content</CardTitle>
              <CardDescription>Your most viewed content pieces</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analytics.contentAnalytics.topPerforming.map((content, index) => (
                  <div key={content.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="flex items-center justify-center w-8 h-8 bg-primary/10 rounded-full">
                        <span className="text-sm font-medium text-primary">#{index + 1}</span>
                      </div>
                      <div>
                        <p className="font-medium">{content.title}</p>
                        <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                          <Badge variant="outline" className="text-xs">{content.type}</Badge>
                          <span>{new Date(content.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4 text-sm">
                      <div className="flex items-center space-x-1">
                        <Eye className="h-4 w-4" />
                        <span>{formatNumber(content.views)}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Heart className="h-4 w-4" />
                        <span>{formatNumber(content.likes)}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="workouts" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {/* Workout Plans by Difficulty */}
            <Card>
              <CardHeader>
                <CardTitle>Workout Plans by Difficulty</CardTitle>
                <CardDescription>Distribution of workout plans by difficulty level</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {analytics.workoutPlanAnalytics.byDifficulty.map((item, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <Badge variant="outline">{item.difficulty}</Badge>
                      <span className="text-sm font-medium">{item.count} plans</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Workout Plans by Status */}
            <Card>
              <CardHeader>
                <CardTitle>Workout Plans by Status</CardTitle>
                <CardDescription>Current status of your workout plans</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {analytics.workoutPlanAnalytics.byStatus.map((item, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <Badge variant={item.status === 'active' ? 'default' : 'secondary'}>
                        {item.status}
                      </Badge>
                      <span className="text-sm font-medium">{item.count} plans</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="challenges" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {/* Challenges by Type */}
            <Card>
              <CardHeader>
                <CardTitle>Challenges by Type</CardTitle>
                <CardDescription>Distribution of challenges by type</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {analytics.challengeAnalytics.byType.map((item, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Badge variant="outline">{item.type}</Badge>
                        <span className="text-sm text-muted-foreground">{item.difficulty}</span>
                      </div>
                      <div className="text-sm font-medium">
                        {item.count} challenges
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Challenges by Status */}
            <Card>
              <CardHeader>
                <CardTitle>Challenges by Status</CardTitle>
                <CardDescription>Current status of your challenges</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {analytics.challengeAnalytics.byStatus.map((item, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <Badge variant={item.status === 'active' ? 'default' : 'secondary'}>
                        {item.status}
                      </Badge>
                      <span className="text-sm font-medium">{item.count} challenges</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Charts Section */}
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Visual Analytics</h2>
          <p className="text-muted-foreground">Interactive charts and visualizations of your performance</p>
        </div>

        {/* First Row of Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Growth Trends */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <TrendingUp className="h-5 w-5" />
                <span>Growth Trends</span>
              </CardTitle>
              <CardDescription>Your content and engagement growth over time</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                {getGrowthTrendData().length === 0 ? (
                  <div className="flex items-center justify-center h-full">
                    <div className="text-center">
                      <TrendingUp className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
                      <p className="text-muted-foreground">No growth trend data to show</p>
                    </div>
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={getGrowthTrendData()}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="period" />
                      <YAxis yAxisId="left" />
                      <YAxis yAxisId="right" orientation="right" />
                      <Tooltip />
                      <Line 
                        yAxisId="left"
                        type="monotone" 
                        dataKey="content" 
                        stroke="#10b981" 
                        strokeWidth={2}
                        name="Content Created"
                      />
                      <Line 
                        yAxisId="left"
                        type="monotone" 
                        dataKey="challenges" 
                        stroke="#3b82f6" 
                        strokeWidth={2}
                        name="Challenges Created"
                      />
                      <Line 
                        yAxisId="right"
                        type="monotone" 
                        dataKey="participants" 
                        stroke="#f59e0b" 
                        strokeWidth={2}
                        name="Participants"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Content Distribution */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <FileText className="h-5 w-5" />
                <span>Content Distribution</span>
              </CardTitle>
              <CardDescription>Your content types and their performance</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                {getContentDistributionData().length === 0 ? (
                  <div className="flex items-center justify-center h-full">
                    <div className="text-center">
                      <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
                      <p className="text-muted-foreground">No content data to show</p>
                    </div>
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={getContentDistributionData()}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {getContentDistributionData().map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Second Row of Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Top Performing Content */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Trophy className="h-5 w-5" />
                <span>Top Performing Content</span>
              </CardTitle>
              <CardDescription>Your most viewed and liked content</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                {getTopPerformingContentData().length === 0 ? (
                  <div className="flex items-center justify-center h-full">
                    <div className="text-center">
                      <Trophy className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
                      <p className="text-muted-foreground">No performance data to show</p>
                    </div>
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={getTopPerformingContentData()}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="views" fill="#10b981" name="Views" />
                      <Bar dataKey="likes" fill="#3b82f6" name="Likes" />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Challenge Participation */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Users className="h-5 w-5" />
                <span>Challenge Participation</span>
              </CardTitle>
              <CardDescription>Participation and completion rates by challenge type</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                {getChallengeParticipationData().length === 0 ? (
                  <div className="flex items-center justify-center h-full">
                    <div className="text-center">
                      <Users className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
                      <p className="text-muted-foreground">No challenge data to show</p>
                    </div>
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={getChallengeParticipationData()}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="participants" fill="#f59e0b" name="Participants" />
                      <Bar dataKey="completions" fill="#10b981" name="Completions" />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Third Row - Content Status */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Content Status Distribution */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Target className="h-5 w-5" />
                <span>Content Status</span>
              </CardTitle>
              <CardDescription>Distribution of your content by approval status</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                {getContentStatusData().length === 0 ? (
                  <div className="flex items-center justify-center h-full">
                    <div className="text-center">
                      <Target className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
                      <p className="text-muted-foreground">No status data to show</p>
                    </div>
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={getContentStatusData()}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {getContentStatusData().map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Engagement Metrics */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Activity className="h-5 w-5" />
                <span>Engagement Overview</span>
              </CardTitle>
              <CardDescription>Key engagement metrics at a glance</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-green-50 dark:bg-green-950/20 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Eye className="h-8 w-8 text-green-600" />
                    <div>
                      <p className="font-medium">Total Views</p>
                      <p className="text-sm text-muted-foreground">Across all content</p>
                    </div>
                  </div>
                  <div className="text-2xl font-bold text-green-600">
                    {formatNumber(analytics.overview.totalViews)}
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Heart className="h-8 w-8 text-blue-600" />
                    <div>
                      <p className="font-medium">Total Likes</p>
                      <p className="text-sm text-muted-foreground">User engagement</p>
                    </div>
                  </div>
                  <div className="text-2xl font-bold text-blue-600">
                    {formatNumber(analytics.overview.totalLikes)}
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 bg-orange-50 dark:bg-orange-950/20 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Users className="h-8 w-8 text-orange-600" />
                    <div>
                      <p className="font-medium">Challenge Participants</p>
                      <p className="text-sm text-muted-foreground">{analytics.overview.completionRate}% completion rate</p>
                    </div>
                  </div>
                  <div className="text-2xl font-bold text-orange-600">
                    {formatNumber(analytics.overview.totalParticipants)}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Last Updated */}
      <div className="text-center text-sm text-muted-foreground">
        Last updated: {new Date(analytics.generatedAt).toLocaleString()}
      </div>
    </div>
  )
}
