import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
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
  const { i18n } = useTranslation();
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
        { title: 'Dashboard', href: `/${i18n.language}/admin/dashboard`, icon: LayoutDashboard },
      ],
    },
    {
      title: 'Users',
      items: [
        { title: 'Authors', href: `/${i18n.language}/admin/authors`, icon: Users },
        { title: 'Readers', href: `/${i18n.language}/admin/readers`, icon: UserCheck },
        { title: 'Affiliates', href: `/${i18n.language}/admin/affiliates`, icon: UsersRound },
        { title: 'Team', href: `/${i18n.language}/admin/team`, icon: Users },
      ],
    },
    {
      title: 'Campaigns',
      items: [
        { title: 'All Campaigns', href: `/${i18n.language}/admin/campaigns`, icon: BookOpen },
        { title: 'Validation Queue', href: `/${i18n.language}/admin/validation`, icon: Flag },
        { title: 'Disputes', href: `/${i18n.language}/admin/disputes`, icon: MessageSquare },
        { title: 'Issues', href: `/${i18n.language}/admin/issues`, icon: AlertTriangle },
        { title: 'Exceptions', href: `/${i18n.language}/admin/exceptions`, icon: AlertCircle },
      ],
    },
    {
      title: 'Finance',
      items: [
        { title: 'Payouts', href: `/${i18n.language}/admin/payouts`, icon: CreditCard },
        { title: 'Refunds', href: `/${i18n.language}/admin/refunds`, icon: Receipt },
        { title: 'Payment Issues', href: `/${i18n.language}/admin/payment-issues`, icon: AlertTriangle },
        { title: 'Coupons', href: `/${i18n.language}/admin/coupons`, icon: Ticket },
        { title: 'Package Approvals', href: `/${i18n.language}/admin/package-approvals`, icon: Package },
      ],
    },
    {
      title: 'Content',
      items: [
        { title: 'Keyword Research', href: `/${i18n.language}/admin/keyword-research`, icon: Search },
        { title: 'Landing Pages', href: `/${i18n.language}/admin/landing-pages`, icon: Globe },
        { title: 'Notifications', href: `/${i18n.language}/admin/notifications`, icon: Bell },
      ],
    },
    {
      title: 'Reports',
      items: [
        { title: 'Financial', href: `/${i18n.language}/admin/reports/financial`, icon: FileText },
        { title: 'Operational', href: `/${i18n.language}/admin/reports/operational`, icon: Activity },
        { title: 'Affiliates', href: `/${i18n.language}/admin/reports/affiliates`, icon: UsersRound },
      ],
    },
    {
      title: 'System',
      items: [
        // Note: Log routes commented out in router as they don't exist yet
        // { title: 'Activity Logs', href: `/${i18n.language}/admin/logs/activity`, icon: Activity },
        // { title: 'Email Logs', href: `/${i18n.language}/admin/logs/emails`, icon: Mail },
        // { title: 'Error Logs', href: `/${i18n.language}/admin/logs/errors`, icon: AlertCircle },
        { title: 'Reader Behavior', href: `/${i18n.language}/admin/reader-behavior`, icon: UserCheck },
        { title: 'Settings', href: `/${i18n.language}/admin/settings`, icon: Settings },
      ],
    },
  ];

  const handleNavigation = (href: string) => {
    // Don't navigate if already on this page
    // pathname doesn't include locale, href does, so strip locale from href
    const hrefWithoutLocale = href.replace(`/${i18n.language}`, '');
    if (pathname === hrefWithoutLocale) return;
    setLoadingPath(href);
    navigate(href);
  };

  const isActive = (href: string) => {
    const hrefWithoutLocale = href.replace(`/${i18n.language}`, '');
    return pathname === hrefWithoutLocale;
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
        <button onClick={() => navigate(`/${i18n.language}/admin/dashboard`)} className="flex items-center gap-2">
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
