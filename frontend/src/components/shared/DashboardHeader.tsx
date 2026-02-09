import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { NotificationBell } from './NotificationBell';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Settings, LogOut, User } from 'lucide-react';

interface DashboardHeaderProps {
  showLogo?: boolean;
}

/**
 * DashboardHeader Component
 *
 * Provides a consistent header across all dashboard pages with:
 * - Logo (optional, for pages without sidebar)
 * - NotificationBell (Requirement 13.1)
 * - User dropdown with profile/settings/logout
 */
export function DashboardHeader({ showLogo = false }: DashboardHeaderProps) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const params = useParams();
  const locale = (params?.locale as string) || 'en';

  // Get the base path based on user role
  const getBasePath = () => {
    switch (user?.role) {
      case 'AUTHOR':
        return 'author';
      case 'READER':
        return 'reader';
      case 'ADMIN':
        return 'admin';
      case 'AFFILIATE':
        return 'affiliate';
      case 'CLOSER':
        return 'closer';
      default:
        return '';
    }
  };

  const getDashboardPath = () => {
    switch (user?.role) {
      case 'ADMIN':
        return `/${locale}/admin/dashboard`;
      case 'AFFILIATE':
        return `/${locale}/affiliate/dashboard`;
      default:
        return `/${locale}/${getBasePath()}`;
    }
  };

  const basePath = getBasePath();

  const handleNavigate = (path: string) => {
    navigate(`/${locale}/${basePath}/${path}`);
  };

  const getInitials = (name?: string | null) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  if (!user) return null;

  return (
    <header className="sticky top-0 z-30 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-14 items-center justify-between px-4 md:px-6">
        {/* Logo (shown when no sidebar) */}
        {showLogo && (
          <button onClick={() => navigate(getDashboardPath())} className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold">
              B
            </div>
            <span className="text-lg font-bold hidden sm:inline">BookProof</span>
          </button>
        )}

        {/* Spacer when no logo */}
        {!showLogo && <div />}

        {/* Right side: notifications and user menu */}
        <div className="flex items-center gap-4">
          {/* Notification Bell - Requirement 13.1 */}
          <NotificationBell />

          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={user.photo || undefined} alt={user.name || 'User'} />
                  <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">{user.name}</p>
                  <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              {basePath !== 'admin' && (
                <DropdownMenuItem onClick={() => handleNavigate('profile')}>
                  <User className="mr-2 h-4 w-4" />
                  <span>Profile</span>
                </DropdownMenuItem>
              )}
              <DropdownMenuItem onClick={() => handleNavigate('settings')}>
                <Settings className="mr-2 h-4 w-4" />
                <span>Settings</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={logout}>
                <LogOut className="mr-2 h-4 w-4" />
                <span>Log out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
