'use client';

import { usePathname, useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { NeumorphicCard } from './NeumorphicCard';
import { 
  Home, 
  Target, 
  Video, 
  BarChart3, 
  User,
  Trophy,
  Settings
} from 'lucide-react';

interface NavItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  href: string;
}

const navItems: NavItem[] = [
  { id: 'dashboard', label: 'Dashboard', icon: Home, href: '/user/dashboard' },
  { id: 'quests', label: 'Quests', icon: Target, href: '/user/quests' },
  { id: 'videos', label: 'Videos', icon: Video, href: '/user/videos' },
  { id: 'progress', label: 'Progress', icon: BarChart3, href: '/user/progress' },
  { id: 'arena', label: 'Arena', icon: Trophy, href: '/user/arena' },
  { id: 'profile', label: 'Profile', icon: User, href: '/user/profile' },
];

interface SidebarProps {
  className?: string;
}

export function Sidebar({ className }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();

  return (
    <div className={cn('w-64 h-full bg-[var(--neumorphic-surface)] border-r border-gray-200/50 dark:border-gray-700/50', className)}>
      <div className="p-6">
        {/* Logo/Brand */}
        <div className="mb-8">
          <h1 className="text-xl font-bold text-[var(--neumorphic-text)] font-orbitron">
            Compound 360
          </h1>
          <p className="text-sm text-[var(--neumorphic-muted)] mt-1">
            Gamified Fitness Platform
          </p>
        </div>

        {/* Navigation Items */}
        <nav className="space-y-2">
          {navItems.map((item) => {
            const isActive = pathname.startsWith(item.href);
            const Icon = item.icon;
            
            return (
              <button
                key={item.id}
                onClick={() => router.push(item.href)}
                className={cn(
                  'w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 text-left',
                  'hover:bg-gray-50 dark:hover:bg-gray-800/50',
                  isActive && 'bg-gradient-to-r from-cyan-500 to-purple-600 text-white shadow-lg'
                )}
              >
                <Icon 
                  className={cn(
                    'w-5 h-5 transition-colors duration-200',
                    isActive 
                      ? 'text-white' 
                      : 'text-gray-600 dark:text-gray-400'
                  )} 
                />
                <span 
                  className={cn(
                    'font-medium transition-colors duration-200',
                    isActive 
                      ? 'text-white' 
                      : 'text-gray-700 dark:text-gray-300'
                  )}
                >
                  {item.label}
                </span>
                {isActive && (
                  <div className="ml-auto w-2 h-2 bg-white rounded-full opacity-80" />
                )}
              </button>
            );
          })}
        </nav>

        {/* Settings at bottom */}
        <div className="absolute bottom-6 left-6 right-6">
          <button
            onClick={() => router.push('/user/settings')}
            className="w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 text-left hover:bg-gray-50 dark:hover:bg-gray-800/50"
          >
            <Settings className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            <span className="font-medium text-gray-700 dark:text-gray-300">
              Settings
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}
