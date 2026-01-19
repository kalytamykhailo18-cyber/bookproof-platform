'use client';

import { useState, createContext, useContext } from 'react';
import { useTranslations } from 'next-intl';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Globe,
  Users,
  TrendingUp,
  Mail,
  Download,
  Trash2,
  RefreshCw,
  Save,
  Loader2,
  Eye,
  BarChart3,
  Settings,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

import {
  useAllLandingPages,
  useUpdateLandingPage,
  useLeads,
  useDeleteLead,
  useResendWelcomeEmail,
  useExportLeads,
  useGlobalAnalytics,
} from '@/hooks/useLandingPages';
import { Language } from '@/lib/api/landing-pages';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Switch } from '@/components/ui/switch';
import { formatDate } from '@/lib/utils';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type TFunction = (key: string) => string;
const TranslationContext = createContext<TFunction>((key) => key);
const useT = (): TFunction => useContext(TranslationContext);

// Form schema for CTA settings
const ctaSettingsSchema = z.object({
  ctaText: z
    .string()
    .min(1, 'CTA text is required')
    .max(50, 'CTA text must be 50 characters or less'),
  ctaLink: z.string().min(1, 'CTA link is required'),
  ctaMode: z.enum(['PRE_LAUNCH', 'LIVE']),
  isPublished: z.boolean(),
});

type CtaSettingsFormData = z.infer<typeof ctaSettingsSchema>;

// Language display names
const languageNames: Record<Language, string> = {
  EN: 'English',
  PT: 'Portuguese',
  ES: 'Spanish',
};

// Stats Card Component
function StatsCard({
  title,
  value,
  description,
  icon: Icon,
  trend,
}: {
  title: string;
  value: string | number;
  description?: string;
  icon: React.ElementType;
  trend?: number;
}) {
  return (
    <Card className="animate-fade-up">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {description && <p className="text-xs text-muted-foreground">{description}</p>}
        {trend !== undefined && (
          <p className={`text-xs ${trend >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {trend >= 0 ? '+' : ''}
            {trend.toFixed(1)}% conversion rate
          </p>
        )}
      </CardContent>
    </Card>
  );
}

// Analytics Tab Content
function AnalyticsTabContent() {
  const t = useT();
  const { data: analytics, isLoading, refetch } = useGlobalAnalytics();

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">{t('analytics.title')}</h3>
        <Button variant="outline" size="sm" onClick={() => refetch()}>
          <RefreshCw className="mr-2 h-4 w-4" />
          {t('analytics.refresh')}
        </Button>
      </div>

      {/* Global Stats */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <StatsCard
          title={t('analytics.totalViews')}
          value={analytics?.totalViews || 0}
          icon={Eye}
        />
        <StatsCard
          title={t('analytics.totalLeads')}
          value={analytics?.totalLeads || 0}
          icon={Users}
        />
        <StatsCard
          title={t('analytics.conversionRate')}
          value={`${(analytics?.conversionRate || 0).toFixed(2)}%`}
          icon={TrendingUp}
        />
      </div>

      {/* Per Language Stats */}
      <h3 className="text-lg font-semibold">{t('analytics.byLanguage')}</h3>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {analytics?.byLanguage.map((stats) => (
          <Card key={stats.language} className="animate-fade-up">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5" />
                {languageNames[stats.language]}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">{t('analytics.totalViews')}</p>
                  <p className="text-xl font-semibold">{stats.totalViews}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">{t('analytics.totalLeads')}</p>
                  <p className="text-xl font-semibold">{stats.totalLeads}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-muted-foreground">{t('analytics.conversionRate')}</p>
                  <p className="text-xl font-semibold">{stats.conversionRate.toFixed(2)}%</p>
                </div>
              </div>

              {/* User Type Distribution */}
              <div>
                <p className="mb-2 text-sm font-medium">{t('leads.filters.userType')}</p>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="outline">Authors: {stats.leadsByUserType.author}</Badge>
                  <Badge variant="outline">Readers: {stats.leadsByUserType.reader}</Badge>
                  <Badge variant="outline">Both: {stats.leadsByUserType.both}</Badge>
                </div>
              </div>

              {/* Top Sources */}
              {stats.topSources.length > 0 && (
                <div>
                  <p className="mb-2 text-sm font-medium">{t('leads.table.source')}</p>
                  <div className="space-y-1">
                    {stats.topSources.slice(0, 3).map((source, idx) => (
                      <div key={idx} className="flex justify-between text-sm">
                        <span className="text-muted-foreground">{source.source}</span>
                        <span>{source.count}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

// Leads Tab Content
function LeadsTabContent() {
  const t = useT();
  const [page, setPage] = useState(1);
  const [languageFilter, setLanguageFilter] = useState<Language | 'ALL'>('ALL');
  const [userTypeFilter, setUserTypeFilter] = useState<string>('ALL');

  const params = {
    page,
    limit: 20,
    language: languageFilter === 'ALL' ? undefined : languageFilter,
    userType: userTypeFilter === 'ALL' ? undefined : userTypeFilter,
  };

  const { data: leadsData, isLoading, refetch } = useLeads(params);
  const deleteMutation = useDeleteLead();
  const resendMutation = useResendWelcomeEmail();
  const exportMutation = useExportLeads();

  const handleExport = (format: 'csv' | 'json') => {
    exportMutation.mutate({
      language: languageFilter === 'ALL' ? undefined : languageFilter,
      format,
    });
  };

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filters and Actions */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <Label htmlFor="language-filter">{t('leads.filters.language')}:</Label>
            <Select
              value={languageFilter}
              onValueChange={(value) => {
                setLanguageFilter(value as Language | 'ALL');
                setPage(1);
              }}
            >
              <SelectTrigger className="w-[140px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">{t('leads.filters.all')}</SelectItem>
                <SelectItem value="EN">English</SelectItem>
                <SelectItem value="PT">Portuguese</SelectItem>
                <SelectItem value="ES">Spanish</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center gap-2">
            <Label htmlFor="usertype-filter">{t('leads.filters.userType')}:</Label>
            <Select
              value={userTypeFilter}
              onValueChange={(value) => {
                setUserTypeFilter(value);
                setPage(1);
              }}
            >
              <SelectTrigger className="w-[140px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">{t('leads.filters.all')}</SelectItem>
                <SelectItem value="author">Author</SelectItem>
                <SelectItem value="reader">Reader</SelectItem>
                <SelectItem value="both">Both</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => refetch()}>
            <RefreshCw className="mr-2 h-4 w-4" />
            {t('analytics.refresh')}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleExport('csv')}
            disabled={exportMutation.isPending}
          >
            <Download className="mr-2 h-4 w-4" />
            {t('leads.export')}
          </Button>
        </div>
      </div>

      {/* Leads Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t('leads.table.email')}</TableHead>
                <TableHead>{t('leads.table.name')}</TableHead>
                <TableHead>{t('leads.table.language')}</TableHead>
                <TableHead>{t('leads.table.userType')}</TableHead>
                <TableHead>{t('leads.table.source')}</TableHead>
                <TableHead>{t('leads.table.welcomeEmail')}</TableHead>
                <TableHead>{t('leads.table.converted')}</TableHead>
                <TableHead>{t('leads.table.date')}</TableHead>
                <TableHead>{t('leads.table.actions')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {leadsData?.leads.map((lead) => (
                <TableRow key={lead.id}>
                  <TableCell className="font-medium">{lead.email}</TableCell>
                  <TableCell>{lead.name || '-'}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{lead.language}</Badge>
                  </TableCell>
                  <TableCell>{lead.userType || '-'}</TableCell>
                  <TableCell>{lead.source || 'direct'}</TableCell>
                  <TableCell>
                    {lead.welcomeEmailSent ? (
                      <Badge className="bg-green-100 text-green-800">{t('leads.sent')}</Badge>
                    ) : (
                      <Badge variant="secondary">{t('leads.pending')}</Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    {lead.converted ? (
                      <Badge className="bg-blue-100 text-blue-800">Yes</Badge>
                    ) : (
                      <Badge variant="secondary">No</Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {formatDate(lead.createdAt)}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {!lead.welcomeEmailSent && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => resendMutation.mutate(lead.id)}
                          disabled={resendMutation.isPending}
                          title={t('leads.table.welcomeEmail')}
                        >
                          <Mail className="h-4 w-4" />
                        </Button>
                      )}
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="sm" title={t('leads.table.actions')}>
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete Lead</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to delete this lead? This action cannot be
                              undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => deleteMutation.mutate(lead.id)}
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            >
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {leadsData?.leads.length === 0 && (
                <TableRow>
                  <TableCell colSpan={9} className="py-8 text-center text-muted-foreground">
                    {t('leads.noLeads')}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Pagination */}
      {leadsData && leadsData.totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Showing {(page - 1) * 20 + 1} to {Math.min(page * 20, leadsData.total)} of{' '}
            {leadsData.total} leads
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={page <= 1}
              onClick={() => setPage(page - 1)}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-sm">
              Page {page} of {leadsData.totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              disabled={page >= leadsData.totalPages}
              onClick={() => setPage(page + 1)}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

// CTA Settings Tab Content
function CtaSettingsTabContent() {
  const t = useT();
  const { data: pages, isLoading, refetch } = useAllLandingPages();
  const updateMutation = useUpdateLandingPage();
  const [selectedLanguage, setSelectedLanguage] = useState<Language>('EN');

  const selectedPage = pages?.find((p) => p.language === selectedLanguage);

  const form = useForm<CtaSettingsFormData>({
    resolver: zodResolver(ctaSettingsSchema),
    defaultValues: {
      ctaText: selectedPage?.ctaText || 'Join Waitlist',
      ctaLink: selectedPage?.ctaLink || '#',
      ctaMode: (selectedPage?.ctaMode as 'PRE_LAUNCH' | 'LIVE') || 'PRE_LAUNCH',
      isPublished: selectedPage?.isPublished || false,
    },
  });

  // Update form when language changes
  const handleLanguageChange = (language: Language) => {
    setSelectedLanguage(language);
    const page = pages?.find((p) => p.language === language);
    if (page) {
      form.reset({
        ctaText: page.ctaText,
        ctaLink: page.ctaLink,
        ctaMode: page.ctaMode as 'PRE_LAUNCH' | 'LIVE',
        isPublished: page.isPublished,
      });
    }
  };

  const handleSubmit = async () => {
    const isValid = await form.trigger();
    if (!isValid) return;

    const data = form.getValues();
    await updateMutation.mutateAsync({
      language: selectedLanguage,
      cta: {
        ctaText: data.ctaText,
        ctaLink: data.ctaLink,
        ctaMode: data.ctaMode,
      },
      isPublished: data.isPublished,
    });
    refetch();
  };

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">{t('settings.title')}</h3>
        <Button variant="outline" size="sm" onClick={() => refetch()}>
          <RefreshCw className="mr-2 h-4 w-4" />
          {t('analytics.refresh')}
        </Button>
      </div>

      {/* Language Selector */}
      <div className="flex items-center gap-4">
        <Label>{t('settings.selectLanguage')}:</Label>
        <div className="flex gap-2">
          {(['EN', 'PT', 'ES'] as Language[]).map((lang) => (
            <Button
              key={lang}
              variant={selectedLanguage === lang ? 'default' : 'outline'}
              size="sm"
              onClick={() => handleLanguageChange(lang)}
            >
              {languageNames[lang]}
            </Button>
          ))}
        </div>
      </div>

      {/* Settings Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            {languageNames[selectedLanguage]} {t('settings.title')}
          </CardTitle>
          <CardDescription>{t('settings.mode.description')}</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <div className="space-y-6">
              <FormField
                control={form.control}
                name="ctaMode"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('settings.mode.label')}</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select mode" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="PRE_LAUNCH">{t('settings.mode.preLaunch')}</SelectItem>
                        <SelectItem value="LIVE">{t('settings.mode.live')}</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormDescription>{t('settings.mode.description')}</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="ctaText"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('settings.ctaText.label')}</FormLabel>
                    <FormControl>
                      <Input placeholder={t('settings.ctaText.placeholder')} {...field} />
                    </FormControl>
                    <FormDescription>{t('settings.ctaText.description')}</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="ctaLink"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('settings.ctaLink.label')}</FormLabel>
                    <FormControl>
                      <Input placeholder={t('settings.ctaLink.placeholder')} {...field} />
                    </FormControl>
                    <FormDescription>{t('settings.ctaLink.description')}</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="isPublished"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">{t('settings.published.label')}</FormLabel>
                      <FormDescription>{t('settings.published.description')}</FormDescription>
                    </div>
                    <FormControl>
                      <Switch checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                  </FormItem>
                )}
              />

              <Button type="button" onClick={handleSubmit} disabled={updateMutation.isPending}>
                {updateMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {t('settings.saving')}
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    {t('settings.save')}
                  </>
                )}
              </Button>
            </div>
          </Form>
        </CardContent>
      </Card>

      {/* Current Status Overview */}
      <Card>
        <CardHeader>
          <CardTitle>{t('leads.table.language')}</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t('leads.table.language')}</TableHead>
                <TableHead>{t('settings.mode.label')}</TableHead>
                <TableHead>{t('settings.ctaText.label')}</TableHead>
                <TableHead>{t('settings.published.label')}</TableHead>
                <TableHead>{t('leads.table.date')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pages?.map((page) => (
                <TableRow key={page.id}>
                  <TableCell className="font-medium">{languageNames[page.language]}</TableCell>
                  <TableCell>
                    <Badge variant={page.ctaMode === 'LIVE' ? 'default' : 'secondary'}>
                      {page.ctaMode}
                    </Badge>
                  </TableCell>
                  <TableCell>{page.ctaText}</TableCell>
                  <TableCell>
                    {page.isPublished ? (
                      <Badge className="bg-green-100 text-green-800">
                        {t('settings.published.label')}
                      </Badge>
                    ) : (
                      <Badge variant="secondary">Draft</Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {formatDate(page.updatedAt)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

// Main Page Component
export default function AdminLandingPagesPage() {
  const t = useTranslations('admin-landing-pages');

  return (
    <TranslationContext.Provider value={t as TFunction}>
      <div className="container mx-auto max-w-7xl px-4 py-8">
        {/* Header */}
        <div className="mb-8 animate-fade-down-fast">
          <div className="flex items-center gap-3">
            <Globe className="h-8 w-8 text-primary" />
            <div>
              <h1 className="text-3xl font-bold">{t('title')}</h1>
              <p className="text-muted-foreground">{t('subtitle')}</p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="analytics" className="animate-fade-up">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="analytics" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              {t('tabs.analytics')}
            </TabsTrigger>
            <TabsTrigger value="leads" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              {t('tabs.leads')}
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              {t('tabs.settings')}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="analytics" className="mt-6">
            <AnalyticsTabContent />
          </TabsContent>

          <TabsContent value="leads" className="mt-6">
            <LeadsTabContent />
          </TabsContent>

          <TabsContent value="settings" className="mt-6">
            <CtaSettingsTabContent />
          </TabsContent>
        </Tabs>
      </div>
    </TranslationContext.Provider>
  );
}
