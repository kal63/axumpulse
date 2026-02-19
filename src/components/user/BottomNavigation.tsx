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
  Heart,
  Flame,
  Gamepad2,
  Users
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { apiClient } from '@/lib/api-client';
import enMessages from '@/locales/en/messages.json';
import amMessages from '@/locales/am/messages.json';
import tiMessages from '@/locales/ti/messages.json';
import omMessages from '@/locales/om/messages.json';
import { useAuth } from '@/contexts/auth-context';


interface NavItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  href: string;
}

type MessagesType = { [key: string]: { [key: string]: string } };




export function BottomNavigation() {
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

  const navItems: NavItem[] = [
    { id: 'home', label: t('dashboard'), icon: Home, href: '/user/dashboard' },
    { id: 'videos', label: t('videos'), icon: Video, href: '/user/videos' },
    { id: 'workouts', label: t('workouts'), icon: Target, href: '/user/workout-plans' },
    { id: 'challenges', label: t('challenges'), icon: Trophy, href: '/user/challenges' },
    { id: 'daily-challenges', label: t('dailyChallenges'), icon: Flame, href: '/user/daily-challenges' },
    { id: 'games', label: t('games'), icon: Gamepad2, href: '/user/games' },
    { id: 'leaderboard', label: t('leaderboard'), icon: Users, href: '/user/leaderboard' },
    { id: 'progress', label: t('progress'), icon: BarChart3, href: '/user/progress' },
    { id: 'medical', label: t('medical'), icon: Heart, href: '/user/medical' },
    { id: 'profile', label: t('profile') , icon: User, href: '/user/profile' },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-[var(--neumorphic-bg)]/80 backdrop-blur-md border-t border-gray-200/50 dark:border-gray-700/50">
      <div className="max-w-md mx-auto px-4 py-2">
        <NeumorphicCard
          variant="raised"
          size="sm"
          className="flex overflow-x-auto no-scrollbar space-x-2 py-2 px-1"
        >
          {navItems.map((item) => {
            const isActive = pathname.startsWith(item.href);
            const Icon = item.icon;

            return (
              <button
                key={item.id}
                onClick={() => router.push(item.href)}
                className={cn(
                  'flex flex-col items-center space-y-1 px-3 py-2 rounded-xl transition-all duration-200',
                  'hover:bg-gray-50 dark:hover:bg-gray-800/50',
                  isActive && 'bg-gradient-to-r from-purple-500 to-blue-600 text-white shadow-lg'
                )}
              >
                <div className="relative">
                  <Icon
                    className={cn(
                      'w-5 h-5 transition-colors duration-200',
                      isActive
                        ? 'text-white'
                        : 'text-gray-500 dark:text-gray-400'
                    )}
                  />
                  {isActive && (
                    <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-white rounded-full opacity-80" />
                  )}
                </div>
                <span
                  className={cn(
                    'text-xs font-medium transition-colors duration-200',
                    isActive
                      ? 'text-white'
                      : 'text-gray-600 dark:text-gray-400'
                  )}
                >
                  {item.label}
                </span>
              </button>
            );
          })}
        </NeumorphicCard>
      </div>
    </div>
  );
}
