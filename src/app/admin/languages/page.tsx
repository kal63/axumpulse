'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Globe, Users, FileText, ToggleLeft, ToggleRight, Plus, AlertCircle, Loader2, Trash2, Edit } from 'lucide-react'
import { toast } from 'sonner'
import { apiClient, type Language as ApiLanguage } from '@/lib/api-client'

export default function LanguagesPage() {
  const [languagesList, setLanguagesList] = useState<ApiLanguage[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [actionLoading, setActionLoading] = useState<number | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingLanguage, setEditingLanguage] = useState<ApiLanguage | null>(null)
  const [newLanguage, setNewLanguage] = useState({
    code: '',
    name: '',
    nativeName: '',
    isActive: true
  })

  useEffect(() => {
    const fetchLanguages = async () => {
      try {
        setIsLoading(true)
        setError(null)
        const response = await apiClient.getAdminLanguages()
        
        if (response.success && response.data) {
          setLanguagesList(response.data.items || response.data)
        } else {
          setError(response.error?.message || 'Failed to fetch languages')
          toast.error('Failed to load languages')
        }
      } catch (err) {
        setError('Network error occurred')
        toast.error('Failed to connect to the server')
      } finally {
        setIsLoading(false)
      }
    }

    fetchLanguages()
  }, [])

  const handleToggleActive = async (id: number) => {
    try {
      setActionLoading(id)
      const language = languagesList.find(l => l.id === id)
      if (!language) return

      const response = await apiClient.toggleLanguageStatus(id, !language.isActive)
      
      if (response.success && response.data) {
        setLanguagesList(prev => 
          prev.map(l => 
            l.id === id 
              ? { ...l, isActive: !l.isActive }
              : l
          )
        )
        toast.success(`${language.name} language ${language.isActive ? 'disabled' : 'enabled'}`)
      } else {
        toast.error(response.error?.message || 'Failed to update language')
      }
    } catch (err) {
      toast.error('Failed to update language')
    } finally {
      setActionLoading(null)
    }
  }

  const handleDeleteLanguage = async (id: number) => {
    try {
      setActionLoading(id)
      const response = await apiClient.deleteLanguage(id)
      
      if (response.success) {
        setLanguagesList(prev => prev.filter(l => l.id !== id))
        toast.success('Language deleted successfully')
      } else {
        toast.error(response.error?.message || 'Failed to delete language')
      }
    } catch (err) {
      toast.error('Failed to delete language')
    } finally {
      setActionLoading(null)
    }
  }

  const handleAddLanguage = async () => {
    try {
      const response = await apiClient.createLanguage(newLanguage)
      
      if (response.success && response.data) {
        setLanguagesList(prev => [...prev, response.data!.language])
        setNewLanguage({
          code: '',
          name: '',
          nativeName: '',
          isActive: true
        })
        setIsDialogOpen(false)
        toast.success('Language created successfully')
      } else {
        toast.error(response.error?.message || 'Failed to create language')
      }
    } catch (err) {
      toast.error('Failed to create language')
    }
  }

  const handleEditLanguage = async () => {
    if (!editingLanguage) return
    
    try {
      const response = await apiClient.updateLanguage(editingLanguage.id, {
        code: editingLanguage.code,
        name: editingLanguage.name,
        nativeName: editingLanguage.nativeName,
        isActive: editingLanguage.isActive
      })
      
      if (response.success && response.data) {
        setLanguagesList(prev => 
          prev.map(l => 
            l.id === editingLanguage.id 
              ? response.data!.language
              : l
          )
        )
        setEditingLanguage(null)
        toast.success('Language updated successfully')
      } else {
        toast.error(response.error?.message || 'Failed to update language')
      }
    } catch (err) {
      toast.error('Failed to update language')
    }
  }

  const activeCount = languagesList.filter(l => l.isActive).length

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Languages</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Manage available languages and their content
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
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Languages</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Manage available languages and their content
          </p>
        </div>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2 text-red-600">
              <AlertCircle className="h-5 w-5" />
              <p>Error loading languages: {error}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Languages</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Manage available languages and their content
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Language
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Create New Language</DialogTitle>
              <DialogDescription>
                Add a new language to the platform
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="code">Language Code</Label>
                <Input
                  id="code"
                  value={newLanguage.code}
                  onChange={(e) => setNewLanguage(prev => ({ ...prev, code: e.target.value }))}
                  placeholder="en, am, etc."
                  maxLength={5}
                />
              </div>
              <div>
                <Label htmlFor="name">Language Name</Label>
                <Input
                  id="name"
                  value={newLanguage.name}
                  onChange={(e) => setNewLanguage(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="English, Amharic, etc."
                />
              </div>
              <div>
                <Label htmlFor="nativeName">Native Name (Optional)</Label>
                <Input
                  id="nativeName"
                  value={newLanguage.nativeName}
                  onChange={(e) => setNewLanguage(prev => ({ ...prev, nativeName: e.target.value }))}
                  placeholder="አማርኛ, etc."
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleAddLanguage}>
                Create Language
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Languages</CardTitle>
            <Globe className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{languagesList.length}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active</CardTitle>
            <ToggleRight className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{activeCount}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Inactive</CardTitle>
            <ToggleLeft className="h-4 w-4 text-gray-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-600">{languagesList.length - activeCount}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Language Settings</CardTitle>
          <CardDescription>
            Enable or disable languages for the platform
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Language</TableHead>
                  <TableHead>Native Name</TableHead>
                  <TableHead>Code</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {languagesList.map((language) => (
                  <TableRow key={language.id}>
                    <TableCell>
                      <div className="flex items-center space-x-3">
                        <Globe className="h-5 w-5 text-gray-400" />
                        <div>
                          <p className="font-medium">{language.name}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <p className="font-medium">{language.nativeName || '-'}</p>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="font-mono">
                        {language.code.toUpperCase()}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge 
                        variant={language.isActive ? "default" : "secondary"}
                        className={language.isActive ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200" : ""}
                      >
                        {language.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        {new Date(language.createdAt).toLocaleDateString()}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setEditingLanguage(language)}
                          disabled={actionLoading === language.id}
                          className="text-blue-600 hover:text-blue-700"
                        >
                          {actionLoading === language.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Edit className="h-4 w-4" />
                          )}
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteLanguage(language.id)}
                          disabled={actionLoading === language.id}
                          className="text-red-600 hover:text-red-700"
                        >
                          {actionLoading === language.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Trash2 className="h-4 w-4" />
                          )}
                        </Button>
                        <Switch
                          checked={language.isActive}
                          onCheckedChange={() => handleToggleActive(language.id)}
                          disabled={actionLoading === language.id}
                        />
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Edit Language Dialog */}
      <Dialog open={!!editingLanguage} onOpenChange={() => setEditingLanguage(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Language</DialogTitle>
            <DialogDescription>
              Update language information
            </DialogDescription>
          </DialogHeader>
          {editingLanguage && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="edit-code">Language Code</Label>
                <Input
                  id="edit-code"
                  value={editingLanguage.code}
                  onChange={(e) => setEditingLanguage(prev => prev ? { ...prev, code: e.target.value } : null)}
                  placeholder="en, am, etc."
                  maxLength={5}
                />
              </div>
              <div>
                <Label htmlFor="edit-name">Language Name</Label>
                <Input
                  id="edit-name"
                  value={editingLanguage.name}
                  onChange={(e) => setEditingLanguage(prev => prev ? { ...prev, name: e.target.value } : null)}
                  placeholder="English, Amharic, etc."
                />
              </div>
              <div>
                <Label htmlFor="edit-nativeName">Native Name (Optional)</Label>
                <Input
                  id="edit-nativeName"
                  value={editingLanguage.nativeName || ''}
                  onChange={(e) => setEditingLanguage(prev => prev ? { ...prev, nativeName: e.target.value } : null)}
                  placeholder="አማርኛ, etc."
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingLanguage(null)}>
              Cancel
            </Button>
            <Button onClick={handleEditLanguage}>
              Update Language
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

