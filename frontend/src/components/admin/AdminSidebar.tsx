import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useAuthStore } from '@/stores/authStore';
import {
  LayoutDashboard,
  Users,
  BookOpen,
  UserCheck,
  Ticket,
  CreditCard,
  UsersRound,
  Settings,
  FileText,
  Bell,
  Flag,
  MessageSquare,
  AlertTriangle,
  Receipt,
  Search,
  Globe,
  Activity,
  Mail,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  Package,
  Loader2,
} from 'lucide-react';

interface NavItem {
  title: string;
  href: string;
  icon: React.ElementType;
  badge?: number;
}

interface NavSection {
  title: string;
  items: NavItem[];
}

export function AdminSidebar() {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { t } = useTranslation('common');
  const [collapsed, setCollapsed] = useState(false);
  const [loadingPath, setLoadingPath] = useState<string | null>(null);
  const isSuperAdmin = useAuthStore((s) => s.isSuperAdmin());

  // Reset loading state when navigation completes
  useEffect(() => {
    setLoadingPath(null);
  }, [pathname]);

  // Safety timeout: Clear loading state after 3 seconds if stuck
  useEffect(() => {
    if (loadingPath) {
      const timer = setTimeout(() => {
        setLoadingPath(null);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [loadingPath]);

  const navSections: NavSection[] = [
    {
      title: t('sidebar.admin.overview'),
      items: [
        { title: t('sidebar.admin.dashboard'), href: '/admin/dashboard', icon: LayoutDashboard },
      ],
    },
    {
      title: t('sidebar.admin.users'),
      items: [
        { title: t('sidebar.admin.authors'), href: '/admin/authors', icon: Users },
        { title: t('sidebar.admin.readers'), href: '/admin/readers', icon: UserCheck },
        { title: t('sidebar.admin.affiliates'), href: '/admin/affiliates', icon: UsersRound },
        { title: t('sidebar.admin.team'), href: '/admin/team', icon: Users },
      ],
    },
    {
      title: t('sidebar.admin.campaigns'),
      items: [
        { title: t('sidebar.admin.allCampaigns'), href: '/admin/campaigns', icon: BookOpen },
        { title: t('sidebar.admin.validationQueue'), href: '/admin/validation', icon: Flag },
        { title: t('sidebar.admin.disputes'), href: '/admin/disputes', icon: MessageSquare },
        { title: t('sidebar.admin.issues'), href: '/admin/issues', icon: AlertTriangle },
        { title: t('sidebar.admin.exceptions'), href: '/admin/exceptions', icon: AlertCircle },
      ],
    },
    // Finance section is restricted to Super Admin only
    ...(isSuperAdmin ? [{
      title: t('sidebar.admin.finance'),
      items: [
        { title: t('sidebar.admin.payouts'), href: '/admin/payouts', icon: CreditCard },
        { title: t('sidebar.admin.refunds'), href: '/admin/refunds', icon: Receipt },
        { title: t('sidebar.admin.paymentIssues'), href: '/admin/payment-issues', icon: AlertTriangle },
        { title: t('sidebar.admin.coupons'), href: '/admin/coupons', icon: Ticket },
        { title: t('sidebar.admin.packageApprovals'), href: '/admin/package-approvals', icon: Package },
      ],
    }] : []),
    {
      title: t('sidebar.admin.content'),
      items: [
        { title: t('sidebar.admin.keywordResearch'), href: '/admin/keyword-research', icon: Search },
        { title: t('sidebar.admin.landingPages'), href: '/admin/landing-pages', icon: Globe },
        { title: t('sidebar.admin.notifications'), href: '/admin/notifications', icon: Bell },
      ],
    },
    {
      title: t('sidebar.admin.reports'),
      items: [
        // Financial report is restricted to Super Admin only
        ...(isSuperAdmin ? [{ title: t('sidebar.admin.financial'), href: '/admin/reports/financial', icon: FileText }] : []),
        { title: t('sidebar.admin.operational'), href: '/admin/reports/operational', icon: Activity },
        { title: t('sidebar.admin.affiliatesReport'), href: '/admin/reports/affiliates', icon: UsersRound },
      ],
    },
    {
      title: t('sidebar.admin.system'),
      items: [
        // Log pages (Section 4.10 - System Monitoring)
        { title: 'Activity Logs', href: `/admin/logs/activity`, icon: Activity },
        { title: 'Email Logs', href: `/admin/logs/emails`, icon: Mail },
        { title: 'Error Logs', href: `/admin/logs/errors`, icon: AlertCircle },
        { title: t('sidebar.admin.readerBehavior'), href: '/admin/reader-behavior', icon: UserCheck },
        { title: t('sidebar.admin.settings'), href: '/admin/settings', icon: Settings },
      ],
    },
  ];

  const handleNavigation = (href: string) => {
    // Don't navigate if already on this page
    // pathname doesn't include locale, href does, so strip locale from href
    const hrefWithoutLocale = href;
    // Normalize paths by removing trailing slashes for comparison
    const normalizedPathname = pathname.replace(/\/$/, '');
    const normalizedHref = hrefWithoutLocale.replace(/\/$/, '');

    if (normalizedPathname === normalizedHref) {
      // Already on this page, don't set loading state or navigate
      return;
    }

    setLoadingPath(href);
    navigate(href);
  };

  const isActive = (href: string) => {
    const hrefWithoutLocale = href;
    // Normalize paths by removing trailing slashes for comparison
    const normalizedPathname = pathname.replace(/\/$/, '');
    const normalizedHref = hrefWithoutLocale.replace(/\/$/, '');
    return normalizedPathname === normalizedHref;
  };

  return (
    <aside
      className={cn(
        'fixed left-0 top-0 z-40 h-screen border-r bg-background transition-all duration-300',
        collapsed ? 'w-16' : 'w-64'
      )}
    >
      {/* Logo */}
      <div className="flex h-14 items-center justify-between border-b px-4 bg-primary">
        {
          !collapsed && <button onClick={() => navigate('/')} className="flex items-center gap-2">
            <img src="/logo.png" alt="BookProof" className="h-10 w-auto px-1 rounded" />
            {!collapsed && (
              <span className="text-lg font-bold text-white">BookProof</span>
            )}
          </button>
        }
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-white"
          onClick={() => setCollapsed(!collapsed)}
        >
          {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </Button>
      </div>

      {/* Navigation */}
      <ScrollArea className="h-[calc(100vh-4rem)]">
        <div className="space-y-4 py-4">
          {navSections.map((section, idx) => (
            <div key={idx} className="px-3">
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
                        collapsed && 'justify-center px-2',
                        active && 'cursor-default'
                      )}
                      onClick={() => handleNavigation(item.href)}
                    >
                      {loading ? (
                        <Loader2 className={cn('h-4 w-4 animate-spin', !collapsed && 'mr-2')} />
                      ) : (
                        <Icon className={cn('h-4 w-4', !collapsed && 'mr-2')} />
                      )}
                      {!collapsed && <span>{item.title}</span>}
                      {!collapsed && item.badge && (
                        <span className="ml-auto flex h-5 w-5 items-center justify-center rounded-full bg-destructive text-xs text-destructive-foreground">
                          {item.badge}
                        </span>
                      )}
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
