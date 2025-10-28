'use client'

import { useState, useEffect, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Shield, Ban, User, Trophy, Zap, AlertCircle, Loader2, MoreHorizontal, Mail, Phone, Calendar, Crown } from 'lucide-react'
import { toast } from 'sonner'
import { apiClient, type User as ApiUser } from '@/lib/api-client'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { usePaginatedData } from '@/hooks/usePaginatedData'
import { PaginatedTable } from '@/components/pagination/PaginatedTable'

export default function UsersPage() {
  const [actionLoading, setActionLoading] = useState<number | null>(null)
  const [selectedUser, setSelectedUser] = useState<ApiUser | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  // Stable fetch function
  const fetchUsers = useCallback(async (params: any) => {
    const response = await apiClient.getUsers(params)
    if (response.success && response.data) {
      return response.data
    }
    throw new Error(response.error?.message || 'Failed to fetch users')
  }, [])

  // Use the new pagination system
  const {
    data: usersList,
    pagination,
    loading: isLoading,
    error,
    refetch
  } = usePaginatedData<ApiUser>({
    fetchFunction: fetchUsers,
    initialPage: 1,
    initialPageSize: 20
  })

  const handleMakeAdmin = async (id: number) => {
    try {
      setActionLoading(id)
      const response = await apiClient.updateUserAdminStatus(id, true)
      
      if (response.success && response.data) {
        refetch()
        toast.success('User promoted to admin')
      } else {
        toast.error(response.error?.message || 'Failed to promote user')
      }
    } catch (err) {
      toast.error('Failed to promote user')
    } finally {
      setActionLoading(null)
    }
  }

  const handleBlockUser = async (id: number) => {
    try {
      setActionLoading(id)
      const response = await apiClient.updateUserStatus(id, 'blocked')
      
      if (response.success && response.data) {
        refetch()
        toast.warning('User blocked')
      } else {
        toast.error(response.error?.message || 'Failed to block user')
      }
    } catch (err) {
      toast.error('Failed to block user')
    } finally {
      setActionLoading(null)
    }
  }

  const handleUnblockUser = async (id: number) => {
    try {
      setActionLoading(id)
      const response = await apiClient.updateUserStatus(id, 'active')
      
      if (response.success && response.data) {
        refetch()
        toast.success('User unblocked')
      } else {
        toast.error(response.error?.message || 'Failed to unblock user')
      }
    } catch (err) {
      toast.error('Failed to unblock user')
    } finally {
      setActionLoading(null)
    }
  }

  const getRoleBadge = (user: ApiUser) => {
    if (user.isAdmin) {
      return <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">Admin</Badge>
    }
    if (user.status === 'blocked') {
      return <Badge className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">Blocked</Badge>
    }
    return <Badge variant="secondary">User</Badge>
  }

  const getRoleIcon = (user: ApiUser) => {
    if (user.isAdmin) {
      return <Shield className="h-4 w-4" />
    }
    if (user.status === 'blocked') {
      return <Ban className="h-4 w-4" />
    }
    return <User className="h-4 w-4" />
  }

  const adminCount = usersList.filter(u => u.isAdmin).length
  const blockedCount = usersList.filter(u => u.status === 'blocked').length
  const regularUserCount = usersList.filter(u => !u.isAdmin && u.status === 'active').length
  
  // Separate users by type
  const adminUsers = usersList.filter(u => u.isAdmin)
  const regularUsers = usersList.filter(u => !u.isAdmin)

  // Define table columns for admin users
  const adminColumns = [
    {
      key: 'user',
      header: 'User',
      render: (user: ApiUser) => (
        <div className="flex items-center space-x-3">
          <Avatar className="h-8 w-8">
            <AvatarFallback>
              {user.name ? user.name.split(' ').map(n => n[0]).join('').toUpperCase() : 
               user.phone.slice(-2)}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="font-medium">{user.name || `User #${user.id}`}</p>
            <p className="text-xs text-gray-500">Admin</p>
          </div>
        </div>
      )
    },
    {
      key: 'contact',
      header: 'Contact',
      render: (user: ApiUser) => (
        <div className="text-sm">
          <p className="text-gray-600 dark:text-gray-400">{user.phone}</p>
          <p className="text-gray-500 dark:text-gray-500">
            {user.email || 'No email'}
          </p>
        </div>
      )
    },
    {
      key: 'joinDate',
      header: 'Join Date',
      render: (user: ApiUser) => (
        <span>{new Date(user.createdAt).toLocaleDateString()}</span>
      )
    },
    {
      key: 'lastActive',
      header: 'Last Active',
      render: (user: ApiUser) => (
        <span>
          {user.lastLoginAt ? new Date(user.lastLoginAt).toLocaleDateString() : 'Never'}
        </span>
      )
    },
    {
      key: 'xp',
      header: 'XP',
      render: (user: ApiUser) => (
        <div className="flex items-center space-x-1">
          <Zap className="h-4 w-4 text-yellow-500" />
          <span className="text-sm font-medium">
            {user.profile?.totalXp || 0}
          </span>
        </div>
      )
    },
    {
      key: 'challenges',
      header: 'Challenges',
      render: (user: ApiUser) => (
        <div className="flex items-center space-x-1">
          <Trophy className="h-4 w-4 text-orange-500" />
          <span className="text-sm">
            {user.profile?.challengesCompleted || 0}
          </span>
        </div>
      )
    },
    {
      key: 'subscription',
      header: 'Subscription',
      render: (user: ApiUser) => (
        <div className="flex items-center space-x-1">
          <Badge variant={user.profile?.subscriptionTier === 'pro' ? 'default' : 'secondary'}>
            {user.profile?.subscriptionTier || 'premium'}
          </Badge>
        </div>
      )
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (user: ApiUser) => (
        <div className="flex items-center justify-end space-x-2">
          {user.status === 'blocked' && (
            <Button
              variant="outline"
              size="sm"
              onClick={(e) => {
                e.stopPropagation()
                handleUnblockUser(user.id)
              }}
              disabled={actionLoading === user.id}
              className="text-green-600 hover:text-green-700"
            >
              {actionLoading === user.id ? (
                <Loader2 className="h-4 w-4 mr-1 animate-spin" />
              ) : (
                <User className="h-4 w-4 mr-1" />
              )}
              Unblock
            </Button>
          )}
        </div>
      )
    }
  ]

  // Define table columns for regular users
  const regularColumns = [
    {
      key: 'user',
      header: 'User',
      render: (user: ApiUser) => (
        <div className="flex items-center space-x-3">
          <Avatar className="h-8 w-8">
            <AvatarFallback>
              {user.name ? user.name.split(' ').map(n => n[0]).join('').toUpperCase() : 
               user.phone.slice(-2)}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="font-medium">{user.name || `User #${user.id}`}</p>
            <p className="text-xs text-gray-500">
              {user.isTrainer ? 'Trainer' : 'Regular User'}
            </p>
          </div>
        </div>
      )
    },
    {
      key: 'contact',
      header: 'Contact',
      render: (user: ApiUser) => (
        <div className="text-sm">
          <p className="text-gray-600 dark:text-gray-400">{user.phone}</p>
          <p className="text-gray-500 dark:text-gray-500">
            {user.email || 'No email'}
          </p>
        </div>
      )
    },
    {
      key: 'joinDate',
      header: 'Join Date',
      render: (user: ApiUser) => (
        <span>{new Date(user.createdAt).toLocaleDateString()}</span>
      )
    },
    {
      key: 'lastActive',
      header: 'Last Active',
      render: (user: ApiUser) => (
        <span>
          {user.lastLoginAt ? new Date(user.lastLoginAt).toLocaleDateString() : 'Never'}
        </span>
      )
    },
    {
      key: 'xp',
      header: 'XP',
      render: (user: ApiUser) => (
        <div className="flex items-center space-x-1">
          <Zap className="h-4 w-4 text-yellow-500" />
          <span className="text-sm font-medium">
            {user.profile?.totalXp || 0}
          </span>
        </div>
      )
    },
    {
      key: 'challenges',
      header: 'Challenges',
      render: (user: ApiUser) => (
        <div className="flex items-center space-x-1">
          <Trophy className="h-4 w-4 text-orange-500" />
          <span className="text-sm">
            {user.profile?.challengesCompleted || 0}
          </span>
        </div>
      )
    },
    {
      key: 'subscription',
      header: 'Subscription',
      render: (user: ApiUser) => (
        <div className="flex items-center space-x-1">
          <Badge variant={user.profile?.subscriptionTier === 'pro' ? 'default' : 'secondary'}>
            {user.profile?.subscriptionTier || 'premium'}
          </Badge>
        </div>
      )
    },
    {
      key: 'status',
      header: 'Status',
      render: (user: ApiUser) => (
        <div className="flex items-center space-x-2">
          {getRoleIcon(user)}
          {getRoleBadge(user)}
        </div>
      )
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (user: ApiUser) => (
        <div className="flex items-center justify-end space-x-2">
          {user.status === 'active' && (
            <Button
              variant="outline"
              size="sm"
              onClick={(e) => {
                e.stopPropagation()
                handleBlockUser(user.id)
              }}
              disabled={actionLoading === user.id}
              className="text-red-600 hover:text-red-700"
            >
              {actionLoading === user.id ? (
                <Loader2 className="h-4 w-4 mr-1 animate-spin" />
              ) : (
                <Ban className="h-4 w-4 mr-1" />
              )}
              Block
            </Button>
          )}
          {user.status === 'blocked' && (
            <Button
              variant="outline"
              size="sm"
              onClick={(e) => {
                e.stopPropagation()
                handleUnblockUser(user.id)
              }}
              disabled={actionLoading === user.id}
              className="text-green-600 hover:text-green-700"
            >
              {actionLoading === user.id ? (
                <Loader2 className="h-4 w-4 mr-1 animate-spin" />
              ) : (
                <User className="h-4 w-4 mr-1" />
              )}
              Unblock
            </Button>
          )}
          
          {/* Three-dot menu for sensitive actions */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0"
                disabled={actionLoading === user.id}
                onClick={(e) => e.stopPropagation()}
              >
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {user.status === 'active' && (
                <DropdownMenuItem
                  onClick={(e) => {
                    e.stopPropagation()
                    handleMakeAdmin(user.id)
                  }}
                  className="text-blue-600 focus:text-blue-600"
                >
                  <Shield className="h-4 w-4 mr-2" />
                  Make Admin
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      )
    }
  ]

  const handleViewDetails = (user: ApiUser) => {
    setSelectedUser(user)
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setSelectedUser(null)
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Users</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Manage user accounts and permissions
          </p>
        </div>
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Users</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Manage user accounts and permissions
          </p>
        </div>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2 text-red-600">
              <AlertCircle className="h-5 w-5" />
              <p>Error loading users: {error}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Users</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Manage user accounts and permissions
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <User className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{usersList.length}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Regular Users</CardTitle>
            <User className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{regularUserCount}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Admins</CardTitle>
            <Shield className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{adminCount}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Blocked</CardTitle>
            <Ban className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{blockedCount}</div>
          </CardContent>
        </Card>
      </div>

      {/* Admin Users Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Shield className="h-5 w-5 text-green-600" />
            <span>Administrators</span>
            <Badge variant="secondary" className="ml-2">{adminCount}</Badge>
          </CardTitle>
          <CardDescription>
            Users with administrative privileges
          </CardDescription>
        </CardHeader>
        <CardContent>
          <PaginatedTable
            data={adminUsers}
            columns={adminColumns}
            loading={isLoading}
            error={error}
            emptyMessage="No administrators found"
            currentPage={pagination.pagination.page}
            totalPages={pagination.pagination.totalPages}
            pageSize={pagination.pagination.pageSize}
            totalItems={pagination.pagination.totalItems}
            onPageChange={(page) => {
              pagination.setPage(page)
            }}
            onPageSizeChange={(pageSize) => {
              pagination.setPageSize(pageSize)
            }}
            showPagination={true}
            showPageSizeSelector={true}
            showInfo={true}
            onRowClick={(user) => handleViewDetails(user)}
          />
        </CardContent>
      </Card>

      {/* Regular Users Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <User className="h-5 w-5 text-blue-600" />
            <span>Regular Users</span>
            <Badge variant="secondary" className="ml-2">{regularUsers.length}</Badge>
          </CardTitle>
          <CardDescription>
            Standard users and trainers
          </CardDescription>
        </CardHeader>
        <CardContent>
          <PaginatedTable
            data={regularUsers}
            columns={regularColumns}
            loading={isLoading}
            error={error}
            emptyMessage="No regular users found"
            currentPage={pagination.pagination.page}
            totalPages={pagination.pagination.totalPages}
            pageSize={pagination.pagination.pageSize}
            totalItems={pagination.pagination.totalItems}
            onPageChange={(page) => {
              pagination.setPage(page)
            }}
            onPageSizeChange={(pageSize) => {
              pagination.setPageSize(pageSize)
            }}
            showPagination={true}
            showPageSizeSelector={true}
            showInfo={true}
            onRowClick={(user) => handleViewDetails(user)}
          />
        </CardContent>
      </Card>

      {/* User Details Modal */}
      <Dialog open={isModalOpen} onOpenChange={handleCloseModal}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-3">
              <Avatar className="h-12 w-12">
                <AvatarFallback>
                  {selectedUser?.name ? selectedUser.name.split(' ').map(n => n[0]).join('').toUpperCase() : 
                   selectedUser?.phone ? selectedUser.phone.slice(-2) : 'U'}
                </AvatarFallback>
              </Avatar>
              <div>
                <h2 className="text-xl font-semibold">
                  {selectedUser?.name || `User #${selectedUser?.id}`}
                </h2>
                <DialogDescription>
                  {selectedUser?.isAdmin ? (
                    <Badge className="bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
                      <Shield className="h-3 w-3 mr-1" />
                      Administrator
                    </Badge>
                  ) : selectedUser?.isTrainer ? (
                    <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">
                      <Trophy className="h-3 w-3 mr-1" />
                      Trainer
                    </Badge>
                  ) : (
                    <Badge variant="secondary">
                      Regular User
                    </Badge>
                  )}
                </DialogDescription>
              </div>
            </DialogTitle>
          </DialogHeader>

          {selectedUser && (
            <div className="space-y-6">
              {/* Contact Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium flex items-center">
                  <User className="h-5 w-5 mr-2 text-emerald-600" />
                  Contact Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                    <Phone className="h-4 w-4 text-gray-500" />
                    <div>
                      <p className="text-sm font-medium">Phone</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {selectedUser.phone}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                    <Mail className="h-4 w-4 text-gray-500" />
                    <div>
                      <p className="text-sm font-medium">Email</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {selectedUser.email || 'Not provided'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* User Profile Information */}
              {selectedUser.profile && (
                <div className="space-y-4">
                  <h3 className="text-lg font-medium flex items-center">
                    <Zap className="h-5 w-5 mr-2 text-emerald-600" />
                    Activity & Progress
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                      <p className="text-sm font-medium">Total XP</p>
                      <p className="text-2xl font-bold text-yellow-600">
                        {selectedUser.profile.totalXp?.toLocaleString() || '0'}
                      </p>
                    </div>
                    <div className="p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                      <p className="text-sm font-medium">Challenges Completed</p>
                      <p className="text-2xl font-bold text-orange-600">
                        {selectedUser.profile.challengesCompleted || '0'}
                      </p>
                    </div>
                    <div className="p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                      <p className="text-sm font-medium">Workouts Completed</p>
                      <p className="text-2xl font-bold text-blue-600">
                        {selectedUser.profile.workoutsCompleted || '0'}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Subscription Information */}
              {selectedUser.profile && (
                <div className="space-y-4">
                  <h3 className="text-lg font-medium flex items-center">
                    <Crown className="h-5 w-5 mr-2 text-emerald-600" />
                    Subscription
                  </h3>
                  <div className="p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                    <p className="text-sm font-medium">Tier</p>
                    <Badge variant={selectedUser.profile.subscriptionTier === 'pro' ? 'default' : 'secondary'}>
                      {selectedUser.profile.subscriptionTier || 'premium'}
                    </Badge>
                    <p className="text-xs text-gray-500 mt-2">
                      Users manage subscriptions via SMS (send "STOP" to unsubscribe)
                    </p>
                  </div>
                </div>
              )}

              {/* Account Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium flex items-center">
                  <Calendar className="h-5 w-5 mr-2 text-emerald-600" />
                  Account Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                    <p className="text-sm font-medium">Joined</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {new Date(selectedUser.createdAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </p>
                  </div>
                  <div className="p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                    <p className="text-sm font-medium">Last Login</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {selectedUser.lastLoginAt ? 
                        new Date(selectedUser.lastLoginAt).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        }) : 'Never'
                      }
                    </p>
                  </div>
                  <div className="p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                    <p className="text-sm font-medium">Status</p>
                    <div className="flex items-center space-x-2">
                      {getRoleIcon(selectedUser)}
                      {getRoleBadge(selectedUser)}
                    </div>
                  </div>
                  <div className="p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                    <p className="text-sm font-medium">User ID</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400 font-mono">
                      #{selectedUser.id}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
