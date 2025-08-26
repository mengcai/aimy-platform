import React from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { 
  Bell, 
  Search, 
  Settings, 
  User, 
  LogOut,
  Sun,
  Moon,
  Menu
} from 'lucide-react';

interface TopbarProps extends React.HTMLAttributes<HTMLDivElement> {
  children?: React.ReactNode;
  onMenuToggle?: () => void;
  onThemeToggle?: () => void;
  isDark?: boolean;
  user?: {
    name: string;
    email: string;
    avatar?: string;
  };
  notifications?: number;
  className?: string;
}

export function Topbar({ 
  children, 
  onMenuToggle,
  onThemeToggle,
  isDark = false,
  user,
  notifications = 0,
  className,
  ...props 
}: TopbarProps) {
  return (
    <div
      className={cn(
        'sticky top-0 z-40 h-16',
        'bg-base-bg-100/80 dark:bg-base-bg-100/80',
        'border-b border-base-ink-200 dark:border-base-ink-800',
        'backdrop-blur-glass-sm',
        'transition-colors duration-200',
        className
      )}
      {...props}
    >
      <div className="flex h-full items-center justify-between px-4 lg:px-6">
        {/* Left section */}
        <div className="flex items-center space-x-4">
          {onMenuToggle && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onMenuToggle}
              className="lg:hidden"
            >
              <Menu className="h-4 w-4" />
            </Button>
          )}
          
          {children}
        </div>

        {/* Right section */}
        <div className="flex items-center space-x-4">
          {/* Search */}
          <Button variant="ghost" size="sm" className="hidden sm:flex">
            <Search className="h-4 w-4" />
          </Button>

          {/* Theme toggle */}
          {onThemeToggle && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onThemeToggle}
            >
              {isDark ? (
                <Sun className="h-4 w-4" />
              ) : (
                <Moon className="h-4 w-4" />
              )}
            </Button>
          )}

          {/* Notifications */}
          <Button variant="ghost" size="sm" className="relative">
            <Bell className="h-4 w-4" />
            {notifications > 0 && (
              <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-error-500 text-xs font-medium text-white flex items-center justify-center">
                {notifications > 99 ? '99+' : notifications}
              </span>
            )}
          </Button>

          {/* User menu */}
          {user && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={user.avatar} alt={user.name} />
                    <AvatarFallback>
                      {user.name.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">{user.name}</p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {user.email}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <User className="mr-2 h-4 w-4" />
                  <span>Profile</span>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Settings</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>
    </div>
  );
}
