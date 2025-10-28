'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Menu,
  Moon,
  Sun,
  LogOut,
  Settings,
  ChevronDown,
  User
} from 'lucide-react';
import { useAuth } from '@/contexts/auth-context';
import { RoleSelector } from './role-selector';
import { getImageUrl } from '@/lib/utils';

interface DashboardHeaderProps {
  onMenuClick?: () => void;
  showMenuButton?: boolean;
  userRole?: 'admin' | 'trainer';
  darkMode?: boolean;
  onToggleDarkMode?: () => void;
}

export default function DashboardHeader({ 
  onMenuClick, 
  showMenuButton = false,
  userRole = 'trainer',
  darkMode = false,
  onToggleDarkMode
}: DashboardHeaderProps) {
  const { user, logout } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    await logout();
    router.push('/login');
  };

  const getInitials = (name?: string) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Left side - Menu button */}
          <div className="flex items-center">
            {showMenuButton && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onMenuClick}
                className="mr-2 lg:hidden"
              >
                <Menu className="h-5 w-5" />
              </Button>
            )}
            <div className="flex items-center space-x-2">
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                userRole === 'admin' 
                  ? 'bg-gradient-to-r from-emerald-500 to-emerald-600' 
                  : 'bg-gradient-to-r from-blue-500 to-blue-600'
              }`}>
                <User className="w-5 h-5 text-white" />
              </div>
              <span className={`text-xl font-bold ${
                userRole === 'admin'
                  ? 'text-emerald-600 dark:text-emerald-400'
                  : 'text-blue-600 dark:text-blue-400'
              }`}>
                {userRole === 'admin' ? 'Admin' : 'Trainer'}
              </span>
            </div>
          </div>

          {/* Right side - User menu and controls */}
          <div className="flex items-center space-x-4">
            {/* Role Selector */}
            <RoleSelector />
            
            {/* Dark mode toggle */}
            <div className="flex items-center space-x-2">
              <Sun className="h-4 w-4 text-gray-500" />
              <Switch checked={darkMode} onCheckedChange={onToggleDarkMode} />
              <Moon className="h-4 w-4 text-gray-500" />
            </div>

            {/* User dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-auto rounded-full flex items-center space-x-2 px-2 cursor-pointer">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={getImageUrl(user?.profilePicture)} alt={user?.name} />
                    <AvatarFallback className="bg-emerald-500 text-white text-xs">
                      {getInitials(user?.name)}
                    </AvatarFallback>
                  </Avatar>
                  <ChevronDown className="h-4 w-4 text-gray-500" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">
                      {user?.name || 'User'}
                    </p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {user?.email}
                    </p>
                    <Badge variant="secondary" className="w-fit mt-1">
                      {userRole === 'admin' ? 'Administrator' : 'Trainer'}
                    </Badge>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href={userRole === 'admin' ? '/admin/settings' : '/trainer/settings'}>
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Settings</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </header>
  );
}
