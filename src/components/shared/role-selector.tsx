'use client'

import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { ChevronDown, Shield, UserCheck, Users } from 'lucide-react'
import { useRole, type UserRole } from '@/contexts/role-context'
import { cn } from '@/lib/utils'

const roleIcons = {
  admin: Shield,
  trainer: UserCheck,
  user: Users,
}

export function RoleSelector() {
  const { currentRole, switchRole, availableRoles, getRoleTheme, getRoleLabel } = useRole()

  const CurrentIcon = roleIcons[currentRole as keyof typeof roleIcons] ?? Users

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "flex items-center space-x-2 cursor-pointer",
            getRoleTheme(currentRole)
          )}
        >
          <CurrentIcon className="h-4 w-4" />
          <span className="hidden sm:inline">{getRoleLabel(currentRole)}</span>
          <ChevronDown className="h-3 w-3" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        {availableRoles.map((role) => {
          const Icon = roleIcons[role as keyof typeof roleIcons] ?? Users
          const isCurrentRole = role === currentRole
          
          return (
            <DropdownMenuItem
              key={role}
              onClick={() => switchRole(role)}
              className={cn(
                "flex items-center space-x-2 cursor-pointer",
                isCurrentRole && "bg-gray-100 dark:bg-gray-800"
              )}
            >
              <Icon className="h-4 w-4" />
              <span>{getRoleLabel(role)}</span>
              {isCurrentRole && (
                <span className="ml-auto text-xs text-gray-500">Current</span>
              )}
            </DropdownMenuItem>
          )
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}


