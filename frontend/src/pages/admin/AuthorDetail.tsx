import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { adminControlsApi, type AuthorDetailViewDto } from '@/lib/api/admin-controls';
import { toast } from 'sonner';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  ArrowLeft,
  User,
  Mail,
  Building,
  Phone,
  MapPin,
  Globe,
  CheckCircle,
  XCircle,
  Ban,
  CreditCard,
  TrendingUp,
  BookOpen,
  DollarSign,
  Calendar,
  AlertCircle,
  Package,
} from 'lucide-react';
import { format } from 'date-fns';

export function AdminAuthorDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { t } = useTranslation('adminAuthorDetail');
  const [author, setAuthor] = useState<AuthorDetailViewDto | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (id) {
      fetchAuthorDetails();
    }
  }, [id]);

  const fetchAuthorDetails = async () => {
    try {
      setIsLoading(true);
      const data = await adminControlsApi.getAuthorDetailView(id!);
      setAuthor(data);
    } catch (error: any) {
      console.error('Error fetching author details:', error);
      toast.error(t('errors.failedToLoad'));
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto space-y-6 p-6">
        <Skeleton className="h-10 w-64 animate-pulse" />
        <div className="grid gap-4 md:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-32 animate-pulse" />
          ))}
        </div>
        <Skeleton className="h-96 animate-pulse" />
      </div>
    );
  }

  if (!author) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex flex-col items-center justify-center py-16">
          <AlertCircle className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold">{t('notFound.title')}</h3>
          <Button onClick={() => navigate('/admin/authors')} className="mt-4">
            <ArrowLeft className="mr-2 h-4 w-4" />
            {t('backToAuthors')}
          </Button>
        </div>
      </div>
    );
  }

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { label: string; className: string }> = {
      ACTIVE: { label: t('status.active'), className: 'bg-green-100 text-green-800' },
      PAUSED: { label: t('status.paused'), className: 'bg-yellow-100 text-yellow-800' },
      COMPLETED: { label: t('status.completed'), className: 'bg-blue-100 text-blue-800' },
      CANCELLED: { label: t('status.cancelled'), className: 'bg-red-100 text-red-800' },
      DRAFT: { label: t('status.draft'), className: 'bg-gray-100 text-gray-800' },
    };

    const config = statusMap[status] || { label: status, className: 'bg-gray-100 text-gray-800' };
    return <Badge className={config.className}>{config.label}</Badge>;
  };

  const getPaymentStatusBadge = (status: string) => {
    const statusMap: Record<string, { label: string; className: string }> = {
      COMPLETED: { label: t('paymentStatus.completed'), className: 'bg-green-100 text-green-800' },
      PENDING: { label: t('paymentStatus.pending'), className: 'bg-yellow-100 text-yellow-800' },
      FAILED: { label: t('paymentStatus.failed'), className: 'bg-red-100 text-red-800' },
      REFUNDED: { label: t('paymentStatus.refunded'), className: 'bg-purple-100 text-purple-800' },
      CANCELLED: { label: t('paymentStatus.cancelled'), className: 'bg-gray-100 text-gray-800' },
    };

    const config = statusMap[status] || { label: status, className: 'bg-gray-100 text-gray-800' };
    return <Badge className={config.className}>{config.label}</Badge>;
  };

  return (
    <div className="container mx-auto space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <Button
            variant="ghost"
            onClick={() => navigate('/admin/authors')}
            className="mb-2"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            {t('backToAuthors')}
          </Button>
          <h1 className="text-3xl font-bold">{author.name}</h1>
          <p className="text-muted-foreground">{author.email}</p>
        </div>
        <div className="flex gap-2">
          {author.isVerified ? (
            <Badge className="bg-green-100 text-green-800">
              <CheckCircle className="mr-1 h-3 w-3" />
              {t('status.verified')}
            </Badge>
          ) : (
            <Badge className="bg-yellow-100 text-yellow-800">
              <XCircle className="mr-1 h-3 w-3" />
              {t('status.unverified')}
            </Badge>
          )}
          {author.isSuspended && (
            <Badge className="bg-red-100 text-red-800">
              <Ban className="mr-1 h-3 w-3" />
              {t('status.suspended')}
            </Badge>
          )}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('stats.availableCredits')}</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{author.availableCredits.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              {author.totalCreditsPurchased.toLocaleString()} {t('stats.purchased')}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('stats.creditsUsed')}</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{author.totalCreditsUsed.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">{t('stats.lifetimeUsage')}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('stats.totalSpent')}</CardTitle>
            <DollarSign className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              ${(author.totalSpentCents / 100).toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground">{t('stats.revenueGenerated')}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('stats.campaigns')}</CardTitle>
            <BookOpen className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{author.campaigns.length}</div>
            <p className="text-xs text-muted-foreground">
              {author.campaigns.filter((c) => c.status === 'ACTIVE').length} {t('stats.active')}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Profile Information */}
      <Card>
        <CardHeader>
          <CardTitle>{t('profile.title')}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="flex items-start gap-3">
              <User className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-sm font-medium">{t('profile.fullName')}</p>
                <p className="text-sm text-muted-foreground">{author.name}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Mail className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-sm font-medium">{t('profile.email')}</p>
                <p className="text-sm text-muted-foreground">{author.email}</p>
              </div>
            </div>
            {author.companyName && (
              <div className="flex items-start gap-3">
                <Building className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm font-medium">{t('profile.company')}</p>
                  <p className="text-sm text-muted-foreground">{author.companyName}</p>
                </div>
              </div>
            )}
            {author.phone && (
              <div className="flex items-start gap-3">
                <Phone className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm font-medium">{t('profile.phone')}</p>
                  <p className="text-sm text-muted-foreground">{author.phone}</p>
                </div>
              </div>
            )}
            {author.country && (
              <div className="flex items-start gap-3">
                <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm font-medium">{t('profile.country')}</p>
                  <p className="text-sm text-muted-foreground">{author.country}</p>
                </div>
              </div>
            )}
            <div className="flex items-start gap-3">
              <Globe className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-sm font-medium">{t('profile.language')}</p>
                <p className="text-sm text-muted-foreground">{author.preferredLanguage}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-sm font-medium">{t('profile.joined')}</p>
                <p className="text-sm text-muted-foreground">
                  {format(new Date(author.createdAt), 'PPP')}
                </p>
              </div>
            </div>
            {author.lastLoginAt && (
              <div className="flex items-start gap-3">
                <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm font-medium">{t('profile.lastLogin')}</p>
                  <p className="text-sm text-muted-foreground">
                    {format(new Date(author.lastLoginAt), 'PPP')}
                  </p>
                </div>
              </div>
            )}
          </div>

          {author.isSuspended && author.suspendReason && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-md">
              <p className="text-sm font-medium text-red-800">{t('profile.suspensionReason')}</p>
              <p className="text-sm text-red-700">{author.suspendReason}</p>
            </div>
          )}

          {author.adminNotes && (
            <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-md">
              <p className="text-sm font-medium text-blue-800">{t('profile.adminNotes')}</p>
              <p className="text-sm text-blue-700 whitespace-pre-wrap">{author.adminNotes}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs defaultValue="campaigns" className="space-y-4">
        <TabsList>
          <TabsTrigger value="campaigns">
            <BookOpen className="mr-2 h-4 w-4" />
            {t('tabs.campaigns')} ({author.campaigns.length})
          </TabsTrigger>
          <TabsTrigger value="purchases">
            <Package className="mr-2 h-4 w-4" />
            {t('tabs.purchaseHistory')} ({author.purchases.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="campaigns" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>{t('campaignsTab.title')}</CardTitle>
              <CardDescription>{t('campaignsTab.description')}</CardDescription>
            </CardHeader>
            <CardContent>
              {author.campaigns.length === 0 ? (
                <div className="py-8 text-center">
                  <BookOpen className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">{t('campaignsTab.noCampaigns')}</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{t('campaignsTab.table.bookTitle')}</TableHead>
                      <TableHead>{t('campaignsTab.table.status')}</TableHead>
                      <TableHead className="text-right">{t('campaignsTab.table.credits')}</TableHead>
                      <TableHead className="text-right">{t('campaignsTab.table.reviews')}</TableHead>
                      <TableHead>{t('campaignsTab.table.startDate')}</TableHead>
                      <TableHead>{t('campaignsTab.table.endDate')}</TableHead>
                      <TableHead className="text-right">{t('campaignsTab.table.actions')}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {author.campaigns.map((campaign) => (
                      <TableRow key={campaign.id}>
                        <TableCell className="font-medium">{campaign.title}</TableCell>
                        <TableCell>{getStatusBadge(campaign.status)}</TableCell>
                        <TableCell className="text-right">{campaign.creditsAllocated}</TableCell>
                        <TableCell className="text-right">
                          {campaign.reviewsCompleted} / {campaign.targetReviews}
                        </TableCell>
                        <TableCell>
                          {campaign.startDate ? format(new Date(campaign.startDate), 'PP') : 'N/A'}
                        </TableCell>
                        <TableCell>
                          {campaign.endDate ? format(new Date(campaign.endDate), 'PP') : 'N/A'}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => navigate(`/admin/campaigns/${campaign.id}`)}
                          >
                            {t('campaignsTab.table.view')}
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="purchases" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>{t('purchasesTab.title')}</CardTitle>
              <CardDescription>{t('purchasesTab.description')}</CardDescription>
            </CardHeader>
            <CardContent>
              {author.purchases.length === 0 ? (
                <div className="py-8 text-center">
                  <Package className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">{t('purchasesTab.noPurchases')}</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{t('purchasesTab.table.date')}</TableHead>
                      <TableHead>{t('purchasesTab.table.package')}</TableHead>
                      <TableHead className="text-right">{t('purchasesTab.table.credits')}</TableHead>
                      <TableHead className="text-right">{t('purchasesTab.table.amount')}</TableHead>
                      <TableHead className="text-right">{t('purchasesTab.table.discount')}</TableHead>
                      <TableHead>{t('purchasesTab.table.coupon')}</TableHead>
                      <TableHead>{t('purchasesTab.table.status')}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {author.purchases.map((purchase) => (
                      <TableRow key={purchase.id}>
                        <TableCell>
                          {format(new Date(purchase.purchaseDate), 'PPp')}
                        </TableCell>
                        <TableCell>{purchase.packageTierName || 'N/A'}</TableCell>
                        <TableCell className="text-right font-medium">
                          {purchase.credits.toLocaleString()}
                        </TableCell>
                        <TableCell className="text-right font-semibold">
                          ${(purchase.amountPaidCents / 100).toFixed(2)}
                        </TableCell>
                        <TableCell className="text-right">
                          {purchase.discountAmountCents ? (
                            <span className="text-green-600">
                              -${(purchase.discountAmountCents / 100).toFixed(2)}
                            </span>
                          ) : (
                            'N/A'
                          )}
                        </TableCell>
                        <TableCell>
                          {purchase.couponCode ? (
                            <Badge variant="outline">{purchase.couponCode}</Badge>
                          ) : (
                            'N/A'
                          )}
                        </TableCell>
                        <TableCell>{getPaymentStatusBadge(purchase.paymentStatus)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
