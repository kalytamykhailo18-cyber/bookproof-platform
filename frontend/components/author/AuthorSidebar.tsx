'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams, usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  LayoutDashboard,
  BookOpen,
  CreditCard,
  Search,
  Receipt,
  FileText,
  Bell,
  Settings,
  HelpCircle,
  ChevronLeft,
  ChevronRight,
  Loader2,
  ShoppingCart,
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

export function AuthorSidebar() {
  const router = useRouter();
  const params = useParams();
  const pathname = usePathname();
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
        { title: 'Dashboard', href: `/${locale}/author`, icon: LayoutDashboard },
      ],
    },
    {
      title: 'Campaigns',
      items: [
        { title: 'My Campaigns', href: `/${locale}/author/campaigns`, icon: BookOpen },
      ],
    },
    {
      title: 'Credits',
      items: [
        { title: 'Credit Balance', href: `/${locale}/author/credits`, icon: CreditCard },
        { title: 'Purchase Credits', href: `/${locale}/author/credits/purchase`, icon: ShoppingCart },
        { title: 'Transactions', href: `/${locale}/author/transactions`, icon: Receipt },
      ],
    },
    {
      title: 'Services',
      items: [
        { title: 'Keyword Research', href: `/${locale}/author/keyword-research`, icon: Search },
        { title: 'Reports', href: `/${locale}/author/reports`, icon: FileText },
      ],
    },
    {
      title: 'Account',
      items: [
        { title: 'Notifications', href: `/${locale}/author/notifications`, icon: Bell },
        { title: 'Subscription', href: `/${locale}/author/subscription`, icon: CreditCard },
        { title: 'Settings', href: `/${locale}/author/settings`, icon: Settings },
        { title: 'Support', href: `/${locale}/author/support`, icon: HelpCircle },
      ],
    },
  ];

  const handleNavigation = (href: string) => {
    // Don't navigate if already on this page
    // pathname doesn't include locale, href does, so strip locale from href
    const hrefWithoutLocale = href.replace(`/${locale}`, '');
    if (pathname === hrefWithoutLocale) return;
    setLoadingPath(href);
    router.push(href);
  };

  const isActive = (href: string) => {
    const hrefWithoutLocale = href.replace(`/${locale}`, '');
    return pathname === hrefWithoutLocale || pathname?.startsWith(hrefWithoutLocale + '/');
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
          onClick={() => handleNavigation(`/${locale}/author`)}
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
