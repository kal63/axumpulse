'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import {
  LayoutDashboard,
  FileText,
  Trophy,
  BarChart3,
  Settings,
  Menu,
  X,
  Upload,
  Users,
  Zap,
  Dumbbell,
  LogOut,
  User
} from 'lucide-react'
import { cn } from '@/lib/utils'
import DashboardHeader from '@/components/shared/dashboard-header'
import { useAuth } from '@/contexts/auth-context'
import { Logo } from '@/components/shared/Logo'

const navigation = [
  { name: 'Dashboard', href: '/trainer/dashboard', icon: LayoutDashboard },
  {
    name: 'Content',
    href: '/trainer/content',
    icon: FileText,
    children: [
      { name: 'Upload', href: '/trainer/content/upload', icon: Upload }
    ]
  },
  { name: 'Workout Plans', href: '/trainer/workout-plans', icon: Dumbbell },
  { name: 'Challenges', href: '/trainer/challenges', icon: Trophy },
  { name: 'Analytics', href: '/trainer/analytics', icon: BarChart3 },
  { name: 'Settings', href: '/trainer/settings', icon: Settings },
]

export default function TrainerLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [darkMode, setDarkMode] = useState(true)
  const pathname = usePathname()
  const router = useRouter()
  const { user, isLoading } = useAuth()

  // Check authentication and role, redirect if needed
  useEffect(() => {
    if (!isLoading) {
      if (!user) {
        // User not authenticated, redirect to login
        router.push('/login')
      } else if (!user.isTrainer) {
        // User authenticated but not a trainer, redirect to appropriate dashboard
        if (user.isAdmin) {
          router.push('/admin/dashboard')
        } else {
          router.push('/dashboard')
        }
      }
    }
  }, [user, isLoading, router])

  // Initialize dark mode from localStorage
  useEffect(() => {
    const savedDarkMode = localStorage.getItem('darkMode')
    const isDarkMode = savedDarkMode === null ? true : savedDarkMode === 'true'
    setDarkMode(isDarkMode)
    if (isDarkMode) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }, [])

  const toggleDarkMode = () => {
    const newDarkMode = !darkMode
    setDarkMode(newDarkMode)
    localStorage.setItem('darkMode', newDarkMode.toString())

    if (newDarkMode) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }

  // Show loading while checking auth
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
      </div>
    )
  }

  // Don't render trainer layout if user is not authenticated or not a trainer
  // (redirects are handled in useEffect above)
  if (!user || !user.isTrainer) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
      </div>
    )
  }

  return (
    <div className={cn("min-h-screen bg-gray-50 dark:bg-gray-900 flex")}>
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/75 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={cn(
        "fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-gray-900 shadow-lg transform transition-transform duration-300 ease-in-out lg:translate-x-0",
        sidebarOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="flex items-center justify-between h-16 px-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-2">
            <Logo size="sm" />
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="lg:hidden cursor-pointer"
            onClick={() => setSidebarOpen(false)}
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        <nav className="mt-6 px-3">
          <div className="space-y-1">
            {navigation.map((item) => {
              const isActive = pathname.startsWith(item.href)
              const hasChildren = item.children && item.children.length > 0

              return (
                <React.Fragment key={item.name}>
                  {/* Parent item */}
                  <Link
                    href={item.href}
                    onClick={() => setSidebarOpen(false)}
                    className={cn(
                      "group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors cursor-pointer",
                      isActive
                        ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
                        : "text-gray-700 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-white"
                    )}
                  >
                    <item.icon
                      className={cn(
                        "mr-3 h-5 w-5 flex-shrink-0",
                        isActive
                          ? "text-blue-600 dark:text-blue-400"
                          : "text-gray-400 group-hover:text-gray-500 dark:text-gray-500 dark:group-hover:text-gray-400"
                      )}
                    />
                    {item.name}
                  </Link>

                  {/* Child items */}
                  {hasChildren && (
                    <div className="ml-6 mt-1 space-y-1">
                      {item.children.map((child) => {
                        const isChildActive = pathname.startsWith(child.href)
                        return (
                          <Link
                            key={child.name}
                            href={child.href}
                            onClick={() => setSidebarOpen(false)}
                            className={cn(
                              "group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors cursor-pointer",
                              isChildActive
                                ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
                                : "text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-white"
                            )}
                          >
                            <child.icon
                              className={cn(
                                "mr-3 h-4 w-4 flex-shrink-0",
                                isChildActive
                                  ? "text-blue-600 dark:text-blue-400"
                                  : "text-gray-400 group-hover:text-gray-500 dark:text-gray-500 dark:group-hover:text-gray-400"
                              )}
                            />
                            {child.name}
                          </Link>
                        )
                      })}
                    </div>
                  )}
                </React.Fragment>
              )
            })}
          </div>
        </nav>

        {/* Footer actions */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200 dark:border-gray-700">
          <Button
            variant="outline"
            className="w-full justify-center cursor-pointer"
            onClick={() => {
              // Use header logout via navigation to settings later if needed
              localStorage.removeItem('authToken')
              window.location.href = '/login'
            }}
          >
            <LogOut className="h-4 w-4 mr-2" />
            Logout
          </Button>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0 lg:ml-64">
        {/* Header */}
        <DashboardHeader
          onMenuClick={() => setSidebarOpen(true)}
          showMenuButton={true}
          userRole="trainer"
          darkMode={darkMode}
          onToggleDarkMode={toggleDarkMode}
        />

        {/* Page content */}
        <main className="flex-1 p-6">
          {children}
        </main>
      </div>
    </div>
  )
}
