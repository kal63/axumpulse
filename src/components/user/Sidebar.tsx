'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';
import { cn } from '@/lib/utils';
import { NeumorphicCard } from './NeumorphicCard';
import { 
  Home, 
  Target, 
  Video, 
  BarChart3, 
  User,
  Trophy,
  Settings,
  Award,
  Heart
} from 'lucide-react';

interface NavItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  href: string;
}

interface SidebarProps {
  className?: string;
}

export function Sidebar({ className }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { user } = useAuth();

  // Base nav items
  const baseNavItems: NavItem[] = [
    { id: 'dashboard', label: 'Dashboard', icon: Home, href: '/user/dashboard' },
    { id: 'videos', label: 'Videos', icon: Video, href: '/user/videos' },
    { id: 'workouts', label: 'Workouts', icon: Target, href: '/user/workout-plans' },
    { id: 'challenges', label: 'Challenges', icon: Trophy, href: '/user/challenges' },
    { id: 'progress', label: 'Progress', icon: BarChart3, href: '/user/progress' },
    { id: 'medical', label: 'Medical', icon: Heart, href: '/user/medical' },
    { id: 'profile', label: 'Profile', icon: User, href: '/user/profile' },
  ];

  // Add trainer nav item based on user status
  const navItems: NavItem[] = [
    ...baseNavItems,
    user?.isTrainer 
      ? { id: 'trainer-view', label: 'Trainer View', icon: Award, href: '/trainer/dashboard' }
      : { id: 'apply', label: 'Become a Trainer', icon: Award, href: '/user/apply' }
  ];

  return (
    <nav className={cn('space-y-2', className)}>
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
  );
}
