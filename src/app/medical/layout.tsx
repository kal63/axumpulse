'use client'

import { useState, useEffect } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/auth-context'
import { Button } from '@/components/ui/button'
import { Logo } from '@/components/shared/Logo'
import {
  LayoutDashboard,
  ClipboardList,
  FileText,
  MessageSquare,
  Calendar,
  Users,
  Settings,
  LogOut,
  Menu,
  X,
  ClipboardCheck
} from 'lucide-react'
import { cn } from '@/lib/utils'

const navigation = [
  { name: 'Dashboard', href: '/medical/dashboard', icon: LayoutDashboard },
  { name: 'Triage Runs', href: '/medical/triage', icon: ClipboardList },
  { name: 'Triage Rules', href: '/medical/triage/rules', icon: FileText },
  { name: 'Intake Forms', href: '/medical/intake-forms', icon: ClipboardCheck },
  { name: 'Q&A Inbox', href: '/medical/questions', icon: MessageSquare },
  { name: 'Consults', href: '/medical/consults', icon: Calendar },
  { name: 'Clients', href: '/medical/clients', icon: Users },
]

export default function MedicalLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const pathname = usePathname()
  const router = useRouter()
  const { user, logout, isLoading } = useAuth()

  useEffect(() => {
    if (!isLoading) {
      if (!user) {
        router.push('/login')
      } else if (!user.isMedical) {
        if (user.isAdmin) {
          router.push('/admin/dashboard')
        } else if (user.isTrainer) {
          router.push('/trainer/dashboard')
        } else {
          router.push('/user/dashboard')
        }
      }
    }
  }, [user, isLoading, router])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
      </div>
    )
  }

  if (!user || !user.isMedical) {
    return null
  }

  return (
    <div className="min-h-screen bg-[var(--neumorphic-bg)]">
      <div className="flex h-screen">
        {/* Sidebar */}
        <div className="hidden md:flex w-64 h-full bg-[var(--neumorphic-surface)] border-r border-gray-200/50 dark:border-gray-700/50 flex-col">
          <div className="p-6">
            <Logo size="sm" />
            <p className="text-sm text-[var(--neumorphic-muted)] mt-1">
              Medical Professional Portal
            </p>
          </div>

          <nav className="flex-1 px-4 space-y-2">
            {(() => {
              // Find the most specific matching route (longest path that matches)
              const sortedNav = [...navigation].sort((a, b) => b.href.length - a.href.length)
              const activeHref = sortedNav.find(nav => 
                pathname === nav.href || pathname.startsWith(nav.href + '/')
              )?.href
              
              return navigation.map((item) => {
                const isActive = activeHref === item.href
                const Icon = item.icon
                return (
                  <button
                    key={item.name}
                    onClick={() => router.push(item.href)}
                    className={cn(
                      'w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 text-left',
                      'hover:bg-gray-50 dark:hover:bg-gray-800/50',
                      isActive && 'bg-gradient-to-r from-teal-500 to-emerald-600 text-white shadow-lg'
                    )}
                  >
                    <Icon className={cn(
                      'w-5 h-5',
                      isActive ? 'text-white' : 'text-gray-600 dark:text-gray-400'
                    )} />
                    <span className={cn(
                      'font-medium',
                      isActive ? 'text-white' : 'text-gray-700 dark:text-gray-300'
                    )}>
                      {item.name}
                    </span>
                  </button>
                )
              })
            })()}
          </nav>

          <div className="p-4 space-y-2 border-t border-gray-200/50 dark:border-gray-700/50">
            <button
              onClick={() => router.push('/medical/settings')}
              className="w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 text-left hover:bg-gray-50 dark:hover:bg-gray-800/50"
            >
              <Settings className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              <span className="font-medium text-gray-700 dark:text-gray-300">Settings</span>
            </button>
            <button
              onClick={logout}
              className="w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 text-left hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 dark:text-red-400"
            >
              <LogOut className="w-5 h-5" />
              <span className="font-medium">Logout</span>
            </button>
          </div>
        </div>

        {/* Mobile Sidebar */}
        {sidebarOpen && (
          <div className="fixed inset-0 z-50 md:hidden">
            <div className="fixed inset-0 bg-black/50" onClick={() => setSidebarOpen(false)} />
            <div className="fixed left-0 top-0 h-full w-64 bg-[var(--neumorphic-surface)] border-r border-gray-200/50 dark:border-gray-700/50 p-6">
              <div className="flex items-center justify-between mb-8">
                <Logo size="sm" />
                <button onClick={() => setSidebarOpen(false)}>
                  <X className="w-6 h-6" />
                </button>
              </div>
              <nav className="space-y-2">
                {(() => {
                  // Find the most specific matching route (longest path that matches)
                  const sortedNav = [...navigation].sort((a, b) => b.href.length - a.href.length)
                  const activeHref = sortedNav.find(nav => 
                    pathname === nav.href || pathname.startsWith(nav.href + '/')
                  )?.href
                  
                  return navigation.map((item) => {
                    const isActive = activeHref === item.href
                    const Icon = item.icon
                    return (
                      <button
                        key={item.name}
                        onClick={() => {
                          router.push(item.href)
                          setSidebarOpen(false)
                        }}
                        className={cn(
                          'w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 text-left',
                          isActive && 'bg-gradient-to-r from-teal-500 to-emerald-600 text-white'
                        )}
                      >
                        <Icon className="w-5 h-5" />
                        <span className="font-medium">{item.name}</span>
                      </button>
                    )
                  })
                })()}
              </nav>
            </div>
          </div>
        )}

        {/* Main Content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Mobile Header */}
          <header className="md:hidden sticky top-0 z-40 bg-[var(--neumorphic-bg)]/80 backdrop-blur-md border-b border-gray-200/50 dark:border-gray-700/50">
            <div className="px-4 py-3 flex items-center justify-between">
              <button onClick={() => setSidebarOpen(true)}>
                <Menu className="w-6 h-6" />
              </button>
              <Logo size="sm" />
              <div className="w-6" />
            </div>
          </header>

          <main className="flex-1 overflow-y-auto">
            {children}
          </main>
        </div>
      </div>
    </div>
  )
}

