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
  Heart,
  Flame,
  Gamepad2,
  Users,
  MessageCircle
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { apiClient } from '@/lib/api-client';
import enMessages from '@/locales/en/messages.json';
import amMessages from '@/locales/am/messages.json';
import tiMessages from '@/locales/ti/messages.json';
import omMessages from '@/locales/om/messages.json';

type MessagesType = { [key: string]: { [key: string]: string } };

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
  const [language, setLanguage] = useState('en');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchSettings() {
      try {
        const res = await apiClient.getUserSettings();
        if (res.success && res.data && res.data.preferences?.language) {
          setLanguage(res.data.preferences.language);
        }
      } catch (e) {
        // fallback to 'en'
      } finally {
        setLoading(false);
      }
    }
    fetchSettings();
  }, []);

  // Map language code to messages
  const messages: MessagesType = {
    en: enMessages,
    am: amMessages,
    ti: tiMessages,
    or: omMessages,
    om: omMessages,
  };

  // Translation helper
  function t(key: string): string {
    return (messages[language] && messages[language][key])
      || (messages['en'] && messages['en'][key])
      || key;
  }

  // Base nav items
  const baseNavItems: NavItem[] = [
    { id: 'dashboard', label: t('dashboard'), icon: Home, href: '/user/dashboard' },
    { id: 'videos', label: t('videos'), icon: Video, href: '/user/videos' },
    { id: 'workouts', label: t('workouts'), icon: Target, href: '/user/workout-plans' },
    { id: 'challenges', label: t('challenges'), icon: Trophy, href: '/user/challenges' },
    { id: 'daily-challenges', label: t('dailyChallenges'), icon: Flame, href: '/user/daily-challenges' },
    { id: 'games', label: t('games'), icon: Gamepad2, href: '/user/games' },
    { id: 'leaderboard', label: t('leaderboard'), icon: Users, href: '/user/leaderboard' },
    { id: 'progress', label: t('progress'), icon: BarChart3, href: '/user/progress' },
    { id: 'coach', label: t('aiCoach'), icon: MessageCircle, href: '/user/coach' },
    { id: 'medical', label: t('medical'), icon: Heart, href: '/user/medical' },
    { id: 'profile', label: t('profile'), icon: User, href: '/user/profile' },
  ];

  // Add trainer nav item based on user status
  const navItems: NavItem[] = [
    ...baseNavItems,
    user?.isTrainer 
      ? { id: 'trainer-view', label: t('trainerView'), icon: Award, href: '/trainer/dashboard' }
      : { id: 'apply', label: t('becomeTrainer'), icon: Award, href: '/user/apply' }
  ];

  if (loading) {
    return <div className="user-app-ink text-sm opacity-80">Loading...</div>;
  }

  return (
    <nav className={cn('space-y-1.5 px-2 text-sm leading-snug', className)}>
      {navItems.map((item) => {
        const isActive = pathname.startsWith(item.href);
        const Icon = item.icon;
        return (
          <button
            key={item.id}
            onClick={() => router.push(item.href)}
            type="button"
            className={cn(
              'flex w-full items-center gap-3 rounded-full py-2.5 pl-3 pr-3 text-left transition-all duration-200',
              isActive
                ? 'bg-[var(--ethio-nav-active)] font-semibold text-white shadow-md dark:bg-gradient-to-r dark:from-[var(--ethio-lemon-dark)] dark:to-[var(--ethio-deep-blue)] dark:shadow-lg'
                : 'user-app-ink font-medium hover:bg-white/20 dark:font-medium dark:text-slate-300 dark:hover:bg-white/10',
            )}
          >
            <Icon
              className={cn(
                'h-5 w-5 shrink-0',
                isActive
                  ? 'stroke-[2.25] text-white'
                  : 'stroke-[1.5] user-app-ink dark:text-slate-300',
              )}
            />
            <span
              className={cn(
                'min-w-0 flex-1 truncate',
                isActive ? 'text-white' : 'user-app-ink dark:text-slate-300',
              )}
            >
              {item.label}
            </span>
          </button>
        );
      })}
    </nav>
  );
}
