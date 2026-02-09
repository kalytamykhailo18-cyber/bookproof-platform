import { useState, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  LayoutDashboard,
  BookOpen,
  Wallet,
  User,
  BarChart3,
  Bell,
  Settings,
  HelpCircle,
  ChevronLeft,
  ChevronRight,
  Loader2,
} from 'lucide-react';

interface NavItem {
  title: string;
  href: string;
  icon: React.ElementType;
}

interface NavSection {
  title: string;
  items: NavItem[];
}

export function ReaderSidebar() {
  const navigate = useNavigate();
  const params = useParams();
  const { pathname } = useLocation();
  const locale = (params?.locale as string) || 'en';
  const [collapsed, setCollapsed] = useState(false);
  const [loadingPath, setLoadingPath] = useState<string | null>(null);

  // Reset loading state when navigation completes
  useEffect(() => {
    setLoadingPath(null);
  }, [pathname]);

  const navSections: NavSection[] = [
    {
      title: 'Overview',
      items: [
        { title: 'Dashboard', href: '/reader', icon: LayoutDashboard },
      ],
    },
    {
      title: 'Reviews',
      items: [
        { title: 'Browse Campaigns', href: '/reader/campaigns', icon: BookOpen },
      ],
    },
    {
      title: 'Earnings',
      items: [
        { title: 'Wallet', href: '/reader/wallet', icon: Wallet },
        { title: 'Statistics', href: '/reader/stats', icon: BarChart3 },
      ],
    },
    {
      title: 'Account',
      items: [
        { title: 'Profile', href: '/reader/profile', icon: User },
        { title: 'Notifications', href: '/reader/notifications', icon: Bell },
        { title: 'Settings', href: '/reader/settings', icon: Settings },
        { title: 'Support', href: '/reader/support', icon: HelpCircle },
      ],
    },
  ];

  const handleNavigation = (href: string) => {
    // Don't navigate if already on this page
    // pathname doesn't include locale, href does, so strip locale from href
    const hrefWithoutLocale = href;
    if (pathname === hrefWithoutLocale) return;
    setLoadingPath(href);
    navigate(href);
  };

  const isActive = (href: string) => {
    const hrefWithoutLocale = href;
    // Exact match
    if (pathname === hrefWithoutLocale) return true;
    // Check if pathname starts with this href
    if (pathname?.startsWith(hrefWithoutLocale + '/')) {
      // But only highlight if there's no more specific nav item that matches
      const allHrefs = navSections.flatMap((s) => s.items.map((i) => i.href.replace(`/${locale}`, '')));
      const hasMoreSpecificMatch = allHrefs.some(
        (h) => h !== hrefWithoutLocale && pathname?.startsWith(h) && h.startsWith(hrefWithoutLocale)
      );
      return !hasMoreSpecificMatch;
    }
    return false;
  };

  return (
    <aside
      className={cn(
        'fixed left-0 top-0 z-40 h-screen border-r bg-background transition-all duration-300',
        collapsed ? 'w-16' : 'w-64'
      )}
    >
      {/* Logo */}
      <div className="flex h-16 items-center justify-between border-b px-4">
        <button
          type="button"
          onClick={() => handleNavigation('/reader')}
          className="flex items-center gap-2"
        >
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold">
            B
          </div>
          {!collapsed && (
            <span className="text-lg font-bold">BookProof</span>
          )}
        </button>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={() => setCollapsed(!collapsed)}
        >
          {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </Button>
      </div>

      {/* Navigation */}
      <ScrollArea className="h-[calc(100vh-4rem)]">
        <div className="space-y-4 py-4">
          {navSections.map((section) => (
            <div key={section.title} className="px-3">
              {!collapsed && (
                <h4 className="mb-2 px-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  {section.title}
                </h4>
              )}
              <div className="space-y-1">
                {section.items.map((item) => {
                  const Icon = item.icon;
                  const active = isActive(item.href);
                  const loading = loadingPath === item.href;
                  return (
                    <Button
                      key={item.href}
                      variant={active ? 'secondary' : 'ghost'}
                      className={cn(
                        'w-full justify-start',
                        collapsed && 'justify-center px-2'
                      )}
                      onClick={() => handleNavigation(item.href)}
                      disabled={loading}
                    >
                      {loading ? (
                        <Loader2 className={cn('h-4 w-4 animate-spin', !collapsed && 'mr-2')} />
                      ) : (
                        <Icon className={cn('h-4 w-4', !collapsed && 'mr-2')} />
                      )}
                      {!collapsed && <span>{item.title}</span>}
                    </Button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>
    </aside>
  );
}
