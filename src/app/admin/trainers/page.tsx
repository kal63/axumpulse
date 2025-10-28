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
import { Check, X, Star, UserCheck, UserX, AlertCircle, Loader2, Mail, Phone, Calendar, Award, MapPin } from 'lucide-react'
import { toast } from 'sonner'
import { apiClient, type Trainer as ApiTrainer } from '@/lib/api-client'
import { getImageUrl } from '@/lib/upload-utils'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { usePaginatedData } from '@/hooks/usePaginatedData'
import { PaginatedTable } from '@/components/pagination/PaginatedTable'

export default function TrainersPage() {
  const [actionLoading, setActionLoading] = useState<number | null>(null)
  const [selectedTrainer, setSelectedTrainer] = useState<ApiTrainer | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  // Stable fetch function
  const fetchTrainers = useCallback(async (params: any) => {
    const response = await apiClient.getTrainers(params)
    if (response.success && response.data) {
      return response.data
    }
    throw new Error(response.error?.message || 'Failed to fetch trainers')
  }, [])

  // Use the new pagination system
  const {
    data: trainersList,
    pagination,
    loading: isLoading,
    error,
    refetch
  } = usePaginatedData<ApiTrainer>({
    fetchFunction: fetchTrainers,
    initialPage: 1,
    initialPageSize: 20
  })

  const handleVerify = async (userId: number) => {
    try {
      setActionLoading(userId)
      const response = await apiClient.updateTrainerVerification(userId, true)
      
      if (response.success && response.data) {
        refetch()
        toast.success('Trainer verified successfully')
      } else {
        toast.error(response.error?.message || 'Failed to verify trainer')
      }
    } catch (err) {
      toast.error('Failed to verify trainer')
    } finally {
      setActionLoading(null)
    }
  }

  const handleUnverify = async (userId: number) => {
    try {
      setActionLoading(userId)
      const response = await apiClient.updateTrainerVerification(userId, false)
      
      if (response.success && response.data) {
        refetch()
        toast.warning('Trainer verification removed')
      } else {
        toast.error(response.error?.message || 'Failed to unverify trainer')
      }
    } catch (err) {
      toast.error('Failed to unverify trainer')
    } finally {
      setActionLoading(null)
    }
  }

  const verifiedCount = trainersList.filter(t => t.verified).length
  const pendingCount = trainersList.filter(t => !t.verified).length

  // Define table columns
  const columns = [
    {
      key: 'trainer',
      header: 'Trainer',
      render: (trainer: ApiTrainer) => (
        <div className="flex items-center space-x-3">
          <Avatar className="h-8 w-8">
            <AvatarImage 
              src={getImageUrl(trainer.User?.profilePicture)} 
            />
            <AvatarFallback>
              {trainer.User?.name ? trainer.User.name.split(' ').map(n => n[0]).join('').toUpperCase() : 
               trainer.User?.phone ? trainer.User.phone.slice(-2) : 'TR'}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="font-medium">
              {trainer.User?.name || `Trainer #${trainer.userId}`}
            </p>
            <p className="text-xs text-gray-500">
              {trainer.User?.email || 'No email'}
            </p>
          </div>
        </div>
      )
    },
    {
      key: 'contact',
      header: 'Contact',
      render: (trainer: ApiTrainer) => (
        <span className="text-sm text-gray-600 dark:text-gray-400">
          {trainer.User?.phone || 'N/A'}
        </span>
      )
    },
    {
      key: 'specialties',
      header: 'Specialties',
      render: (trainer: ApiTrainer) => (
        <div className="flex flex-wrap gap-1">
          {trainer.specialties && trainer.specialties.length > 0 ? (
            trainer.specialties.map((specialty, index) => (
              <Badge key={index} variant="outline" className="text-xs">
                {specialty}
              </Badge>
            ))
          ) : (
            <span className="text-sm text-gray-500">No specialties</span>
          )}
        </div>
      )
    },
    {
      key: 'bio',
      header: 'Bio',
      render: (trainer: ApiTrainer) => (
        <div className="max-w-xs">
          <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
            {trainer.bio || 'No bio available'}
          </p>
        </div>
      )
    },
    {
      key: 'status',
      header: 'Status',
      render: (trainer: ApiTrainer) => (
        <Badge 
          variant={trainer.verified ? "default" : "secondary"}
          className={trainer.verified ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400" : ""}
        >
          {trainer.verified ? 'Verified' : 'Pending'}
        </Badge>
      )
    },
    {
      key: 'joined',
      header: 'Joined',
      render: (trainer: ApiTrainer) => (
        <div className="text-sm">
          {new Date(trainer.createdAt).toLocaleDateString()}
        </div>
      )
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (trainer: ApiTrainer) => (
        <div className="flex items-center justify-end space-x-2">
          {trainer.verified ? (
            <Button
              variant="outline"
              size="sm"
              onClick={(e) => {
                e.stopPropagation()
                handleUnverify(trainer.userId)
              }}
              disabled={actionLoading === trainer.userId}
              className="text-orange-600 hover:text-orange-700"
            >
              {actionLoading === trainer.userId ? (
                <Loader2 className="h-4 w-4 mr-1 animate-spin" />
              ) : (
                <UserX className="h-4 w-4 mr-1" />
              )}
              Unverify
            </Button>
          ) : (
            <Button
              variant="outline"
              size="sm"
              onClick={(e) => {
                e.stopPropagation()
                handleVerify(trainer.userId)
              }}
              disabled={actionLoading === trainer.userId}
              className="text-emerald-600 hover:text-emerald-700"
            >
              {actionLoading === trainer.userId ? (
                <Loader2 className="h-4 w-4 mr-1 animate-spin" />
              ) : (
                <UserCheck className="h-4 w-4 mr-1" />
              )}
              Verify
            </Button>
          )}
        </div>
      )
    }
  ]

  const handleTrainerClick = (trainer: ApiTrainer) => {
    setSelectedTrainer(trainer)
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setSelectedTrainer(null)
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Trainers</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Manage trainer verification and profiles
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
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Trainers</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Manage trainer verification and profiles
          </p>
        </div>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2 text-red-600">
              <AlertCircle className="h-5 w-5" />
              <p>Error loading trainers: {error}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Trainers</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Manage trainer verification and profiles
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Trainers</CardTitle>
            <UserCheck className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{trainersList.length}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Verified</CardTitle>
            <Check className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">{verifiedCount}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <X className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{pendingCount}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Trainer List</CardTitle>
          <CardDescription>
            Manage trainer verification status
          </CardDescription>
        </CardHeader>
        <CardContent>
          <PaginatedTable
            data={trainersList}
            columns={columns}
            loading={isLoading}
            error={error}
            emptyMessage="No trainers found"
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
            onRowClick={(trainer) => handleTrainerClick(trainer)}
          />
        </CardContent>
      </Card>

      {/* Trainer Details Modal */}
      <Dialog open={isModalOpen} onOpenChange={handleCloseModal}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-3">
              <Avatar className="h-12 w-12">
                <AvatarImage 
                  src={getImageUrl(selectedTrainer?.User?.profilePicture)} 
                />
                <AvatarFallback>
                  {selectedTrainer?.User?.name ? selectedTrainer.User.name.split(' ').map(n => n[0]).join('').toUpperCase() : 
                   selectedTrainer?.User?.phone ? selectedTrainer.User.phone.slice(-2) : 'TR'}
                </AvatarFallback>
              </Avatar>
              <div>
                <h2 className="text-xl font-semibold">
                  {selectedTrainer?.User?.name || `Trainer #${selectedTrainer?.userId}`}
                </h2>
                <DialogDescription>
                  {selectedTrainer?.verified ? (
                    <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">
                      <Award className="h-3 w-3 mr-1" />
                      Verified Trainer
                    </Badge>
                  ) : (
                    <Badge variant="secondary">
                      Pending Verification
                    </Badge>
                  )}
                </DialogDescription>
              </div>
            </DialogTitle>
          </DialogHeader>

          {selectedTrainer && (
            <div className="space-y-6">
              {/* Contact Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium flex items-center">
                  <UserCheck className="h-5 w-5 mr-2 text-emerald-600" />
                  Contact Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                    <Phone className="h-4 w-4 text-gray-500" />
                    <div>
                      <p className="text-sm font-medium">Phone</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {selectedTrainer.User?.phone || 'Not provided'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                    <Mail className="h-4 w-4 text-gray-500" />
                    <div>
                      <p className="text-sm font-medium">Email</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {selectedTrainer.User?.email || 'Not provided'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Bio */}
              {selectedTrainer.bio && (
                <div className="space-y-3">
                  <h3 className="text-lg font-medium flex items-center">
                    <Star className="h-5 w-5 mr-2 text-emerald-600" />
                    About
                  </h3>
                  <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                    <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                      {selectedTrainer.bio}
                    </p>
                  </div>
                </div>
              )}

              {/* Specialties */}
              {selectedTrainer.specialties && selectedTrainer.specialties.length > 0 && (
                <div className="space-y-3">
                  <h3 className="text-lg font-medium flex items-center">
                    <Award className="h-5 w-5 mr-2 text-emerald-600" />
                    Specialties
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedTrainer.specialties.map((specialty, index) => (
                      <Badge key={index} variant="outline" className="text-sm">
                        {specialty.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Account Information */}
              <div className="space-y-3">
                <h3 className="text-lg font-medium flex items-center">
                  <Calendar className="h-5 w-5 mr-2 text-emerald-600" />
                  Account Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                    <p className="text-sm font-medium">Joined</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {new Date(selectedTrainer.createdAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </p>
                  </div>
                  <div className="p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                    <p className="text-sm font-medium">Last Login</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {selectedTrainer.User?.lastLoginAt ? 
                        new Date(selectedTrainer.User.lastLoginAt).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        }) : 'Never'
                      }
                    </p>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex justify-end space-x-3 pt-4 border-t">
                {selectedTrainer.verified ? (
                  <Button
                    variant="outline"
                    onClick={(e) => {
                      e.stopPropagation()
                      handleUnverify(selectedTrainer.userId)
                      handleCloseModal()
                    }}
                    disabled={actionLoading === selectedTrainer.userId}
                    className="text-orange-600 hover:text-orange-700"
                  >
                    {actionLoading === selectedTrainer.userId ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <UserX className="h-4 w-4 mr-2" />
                    )}
                    Remove Verification
                  </Button>
                ) : (
                  <Button
                    onClick={(e) => {
                      e.stopPropagation()
                      handleVerify(selectedTrainer.userId)
                      handleCloseModal()
                    }}
                    disabled={actionLoading === selectedTrainer.userId}
                    className="bg-emerald-600 hover:bg-emerald-700"
                  >
                    {actionLoading === selectedTrainer.userId ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <UserCheck className="h-4 w-4 mr-2" />
                    )}
                    Verify Trainer
                  </Button>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
