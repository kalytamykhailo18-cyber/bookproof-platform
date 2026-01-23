'use client';

import { useState } from 'react';
import { useRouter, useParams, usePathname } from 'next/navigation';
import Link from 'next/link';
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
  const router = useRouter();
  const params = useParams();
  const pathname = usePathname();
  const locale = (params?.locale as string) || 'en';
  const [collapsed, setCollapsed] = useState(false);
  const [loadingPath, setLoadingPath] = useState<string | null>(null);

  const navSections: NavSection[] = [
    {
      title: 'Overview',
      items: [
        { title: 'Dashboard', href: `/${locale}/admin/dashboard`, icon: LayoutDashboard },
      ],
    },
    {
      title: 'Users',
      items: [
        { title: 'Authors', href: `/${locale}/admin/authors`, icon: Users },
        { title: 'Readers', href: `/${locale}/admin/readers`, icon: UserCheck },
        { title: 'Affiliates', href: `/${locale}/admin/affiliates`, icon: UsersRound },
        { title: 'Team', href: `/${locale}/admin/team`, icon: Users },
      ],
    },
    {
      title: 'Campaigns',
      items: [
        { title: 'All Campaigns', href: `/${locale}/admin/campaigns`, icon: BookOpen },
        { title: 'Validation Queue', href: `/${locale}/admin/validation`, icon: Flag },
        { title: 'Disputes', href: `/${locale}/admin/disputes`, icon: MessageSquare },
        { title: 'Issues', href: `/${locale}/admin/issues`, icon: AlertTriangle },
        { title: 'Exceptions', href: `/${locale}/admin/exceptions`, icon: AlertCircle },
      ],
    },
    {
      title: 'Finance',
      items: [
        { title: 'Payouts', href: `/${locale}/admin/payouts`, icon: CreditCard },
        { title: 'Refunds', href: `/${locale}/admin/refunds`, icon: Receipt },
        { title: 'Payment Issues', href: `/${locale}/admin/payment-issues`, icon: AlertTriangle },
        { title: 'Coupons', href: `/${locale}/admin/coupons`, icon: Ticket },
        { title: 'Package Approvals', href: `/${locale}/admin/package-approvals`, icon: Package },
      ],
    },
    {
      title: 'Content',
      items: [
        { title: 'Keyword Research', href: `/${locale}/admin/keyword-research`, icon: Search },
        { title: 'Landing Pages', href: `/${locale}/admin/landing-pages`, icon: Globe },
        { title: 'Notifications', href: `/${locale}/admin/notifications`, icon: Bell },
      ],
    },
    {
      title: 'Reports',
      items: [
        { title: 'Financial', href: `/${locale}/admin/reports/financial`, icon: FileText },
        { title: 'Operational', href: `/${locale}/admin/reports/operational`, icon: Activity },
        { title: 'Affiliates', href: `/${locale}/admin/reports/affiliates`, icon: UsersRound },
      ],
    },
    {
      title: 'System',
      items: [
        { title: 'Activity Logs', href: `/${locale}/admin/logs/activity`, icon: Activity },
        { title: 'Email Logs', href: `/${locale}/admin/logs/emails`, icon: Mail },
        { title: 'Error Logs', href: `/${locale}/admin/logs/errors`, icon: AlertCircle },
        { title: 'Reader Behavior', href: `/${locale}/admin/reader-behavior`, icon: UserCheck },
        { title: 'Settings', href: `/${locale}/admin/settings`, icon: Settings },
      ],
    },
  ];

  const handleNavigation = (href: string) => {
    setLoadingPath(href);
    router.push(href);
  };

  const isActive = (href: string) => pathname === href;

  return (
    <aside
      className={cn(
        'fixed left-0 top-0 z-40 h-screen border-r bg-background transition-all duration-300',
        collapsed ? 'w-16' : 'w-64'
      )}
    >
      {/* Logo */}
      <div className="flex h-16 items-center justify-between border-b px-4">
        <Link href={`/${locale}/admin/dashboard`} className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold">
            B
          </div>
          {!collapsed && (
            <span className="text-lg font-bold">BookProof</span>
          )}
        </Link>
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
