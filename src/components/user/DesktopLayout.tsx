'use client';

import { ReactNode } from 'react';
import { Sidebar } from './Sidebar';
import { cn } from '@/lib/utils';

interface DesktopLayoutProps {
  children: ReactNode;
  className?: string;
}

export function DesktopLayout({ children, className }: DesktopLayoutProps) {
  return (
    <div className={cn('flex h-screen bg-slate-100 dark:bg-slate-800/70', className)}>
      {/* Sidebar */}
      <Sidebar />
      
      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="user-app-paper border-b border-gray-200/50 dark:border-gray-700/50 px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold user-app-ink">
                Welcome back, Warrior!
              </h1>
              <p className="user-app-muted mt-1">
                Ready to level up your fitness journey?
              </p>
            </div>
            
            {/* Top Right Status Cards */}
            <div className="flex space-x-4">
              <div className="bg-white dark:user-app-paper rounded-xl p-4 shadow-[8px_8px_16px_rgba(15,23,42,0.15),-8px_-8px_16px_rgba(255,255,255,0.85)] dark:shadow-[8px_8px_16px_rgba(0,0,0,0.6),-8px_-8px_16px_rgba(255,255,255,0.06)]">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-orange-100 dark:bg-orange-900/20 rounded-full flex items-center justify-center">
                    <span className="text-orange-600 dark:text-orange-400 text-lg">🔥</span>
                  </div>
                  <div>
                    <div className="text-lg font-bold user-app-ink">12</div>
                    <div className="text-xs user-app-muted">Day Streak</div>
                  </div>
                </div>
              </div>
              
              <div className="bg-white dark:user-app-paper rounded-xl p-4 shadow-[8px_8px_16px_rgba(15,23,42,0.15),-8px_-8px_16px_rgba(255,255,255,0.85)] dark:shadow-[8px_8px_16px_rgba(0,0,0,0.6),-8px_-8px_16px_rgba(255,255,255,0.06)]">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-emerald-100 dark:bg-emerald-900/25 rounded-full flex items-center justify-center">
                    <span className="text-[var(--ethio-lemon-dark)] dark:text-[var(--ethio-lemon)] text-lg">⭐</span>
                  </div>
                  <div>
                    <div className="text-lg font-bold user-app-ink">2,450</div>
                    <div className="text-xs user-app-muted">XP Points</div>
                  </div>
                </div>
              </div>
              
              <div className="bg-white dark:user-app-paper rounded-xl p-4 shadow-[8px_8px_16px_rgba(15,23,42,0.15),-8px_-8px_16px_rgba(255,255,255,0.85)] dark:shadow-[8px_8px_16px_rgba(0,0,0,0.6),-8px_-8px_16px_rgba(255,255,255,0.06)]">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center">
                    <span className="text-green-600 dark:text-green-400 text-lg">💎</span>
                  </div>
                  <div>
                    <div className="text-lg font-bold user-app-ink">847</div>
                    <div className="text-xs user-app-muted">Gems</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </header>
        
        {/* Main Content */}
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
