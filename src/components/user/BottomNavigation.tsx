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
  Users,
  MessageCircle
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
    { id: 'coach', label: t('aiCoach'), icon: MessageCircle, href: '/user/coach' },
    { id: 'medical', label: t('medical'), icon: Heart, href: '/user/medical' },
    { id: 'profile', label: t('profile') , icon: User, href: '/user/profile' },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 border-t user-app-border bg-white/92 backdrop-blur-md">
      <div className="max-w-md mx-auto px-3 py-2">
        <div className="flex overflow-x-auto no-scrollbar space-x-1.5 px-1">
          {navItems.map((item) => {
            const isActive = pathname.startsWith(item.href);
            const Icon = item.icon;

            return (
              <button
                key={item.id}
                onClick={() => router.push(item.href)}
                className={cn(
                  'flex flex-col items-center space-y-1 rounded-2xl px-3 py-2 text-[12px] font-medium transition-colors',
                  'hover:bg-black/5',
                  isActive &&
                    'user-app-gradient text-white shadow-sm'
                )}
              >
                <div className="relative">
                  <Icon
                    className={cn(
                      'h-5 w-5 transition-colors',
                      isActive
                        ? 'text-white'
                        : 'text-[hsl(222,20%,35%)]',
                    )}
                  />
                  {isActive && (
                    <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-white rounded-full opacity-80" />
                  )}
                </div>
                <span
                  className={cn(
                    'max-w-[4.5rem] truncate text-center leading-tight transition-colors',
                    isActive
                      ? 'text-white'
                      : 'text-[hsl(222,20%,18%)]',
                  )}
                >
                  {item.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
