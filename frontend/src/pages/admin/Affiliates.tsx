import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams, useNavigate } from 'react-router-dom';
import { affiliatesApi } from '@/lib/api/affiliates';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger } from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Loader2,
  CheckCircle,
  XCircle,
  AlertCircle,
  Link as LinkIcon,
  DollarSign,
  Users,
  MousePointerClick,
  Power,
  Percent,
  ArrowLeft } from 'lucide-react';
import { formatDate } from '@/lib/utils';
import { CommissionStatus } from '@/lib/api/affiliates';

export function AdminAffiliateDetailsPage() {
  const { t, i18n } = useTranslation('adminAffiliateDetails');
  const navigate = useNavigate();
  const params = useParams();
  const id = params.id as string;

  const [approveDialogOpen, setApproveDialogOpen] = useState(false);
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [commissionRateDialogOpen, setCommissionRateDialogOpen] = useState(false);
  const [isBackLoading, setIsBackLoading] = useState(false);

  const [affiliate, setAffiliate] = useState<any>(null);
  const [commissions, setCommissions] = useState<any[]>([]);
  const [referredAuthors, setReferredAuthors] = useState<any[]>([]);
  const [payouts, setPayouts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [commissionsLoading, setCommissionsLoading] = useState(true);
  const [referredAuthorsLoading, setReferredAuthorsLoading] = useState(true);
  const [payoutsLoading, setPayoutsLoading] = useState(true);
  const [isApproving, setIsApproving] = useState(false);
  const [isTogglingActive, setIsTogglingActive] = useState(false);
  const [isUpdatingRate, setIsUpdatingRate] = useState(false);

  // Form state
  const [approveCommissionRate, setApproveCommissionRate] = useState(20);
  const [rejectionReason, setRejectionReason] = useState('');
  const [newCommissionRate, setNewCommissionRate] = useState(20);

  // Fetch data
  useEffect(() => {
    if (!id) return;

    const fetchData = async () => {
      try {
        setIsLoading(true);
        setCommissionsLoading(true);
        setReferredAuthorsLoading(true);
        setPayoutsLoading(true);

        const [affiliateData, commissionsData, referredAuthorsData, payoutsData] = await Promise.all([
          affiliatesApi.getByIdForAdmin(id),
          affiliatesApi.getCommissionsForAdmin(id),
          affiliatesApi.getReferredAuthorsForAdmin(id),
          affiliatesApi.getPayoutsForAdmin(id)
        ]);

        setAffiliate(affiliateData);
        setCommissions(commissionsData);
        setReferredAuthors(referredAuthorsData);
        setPayouts(payoutsData);
      } catch (error: any) {
        console.error('Affiliate details error:', error);
        toast.error('Failed to load affiliate details');
      } finally {
        setIsLoading(false);
        setCommissionsLoading(false);
        setReferredAuthorsLoading(false);
        setPayoutsLoading(false);
      }
    };
    fetchData();
  }, [id]);

  const refetchData = async () => {
    if (!id) return;
    try {
      const [affiliateData, commissionsData, referredAuthorsData, payoutsData] = await Promise.all([
        affiliatesApi.getByIdForAdmin(id),
        affiliatesApi.getCommissionsForAdmin(id),
        affiliatesApi.getReferredAuthorsForAdmin(id),
        affiliatesApi.getPayoutsForAdmin(id)
      ]);
      setAffiliate(affiliateData);
      setCommissions(commissionsData);
      setReferredAuthors(referredAuthorsData);
      setPayouts(payoutsData);
    } catch (error: any) {
      console.error('Refetch error:', error);
    }
  };

  const handleApprove = async () => {
    if (!approveCommissionRate || approveCommissionRate < 0 || approveCommissionRate > 50) {
      toast.error('Commission rate must be between 0 and 50');
      return;
    }

    try {
      setIsApproving(true);
      await affiliatesApi.approveAffiliate(id, {
        approve: true,
        commissionRate: approveCommissionRate
      });
      toast.success('Affiliate approved successfully');
      setApproveDialogOpen(false);
      await refetchData();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to approve affiliate');
    } finally {
      setIsApproving(false);
    }
  };

  const handleReject = async () => {
    if (!rejectionReason || rejectionReason.trim() === '') {
      toast.error('Rejection reason is required');
      return;
    }

    try {
      setIsApproving(true);
      await affiliatesApi.approveAffiliate(id, {
        approve: false,
        rejectionReason: rejectionReason
      });
      toast.success('Affiliate rejected');
      setRejectDialogOpen(false);
      setRejectionReason('');
      await refetchData();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to reject affiliate');
    } finally {
      setIsApproving(false);
    }
  };

  const handleToggleActive = async () => {
    try {
      setIsTogglingActive(true);
      await affiliatesApi.toggleAffiliateActive(id);
      toast.success(`Affiliate ${affiliate?.isActive ? 'disabled' : 'enabled'} successfully`);
      await refetchData();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to toggle affiliate status');
    } finally {
      setIsTogglingActive(false);
    }
  };

  const handleUpdateCommissionRate = async () => {
    if (!newCommissionRate || newCommissionRate < 0 || newCommissionRate > 100) {
      toast.error('Commission rate must be between 0 and 100');
      return;
    }

    try {
      setIsUpdatingRate(true);
      await affiliatesApi.updateCommissionRate(id, newCommissionRate);
      toast.success('Commission rate updated successfully');
      setCommissionRateDialogOpen(false);
      await refetchData();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to update commission rate');
    } finally {
      setIsUpdatingRate(false);
    }
  };

  // Update form values when affiliate data loads
  useEffect(() => {
    if (affiliate) {
      setNewCommissionRate(affiliate.commissionRate || 20);
    }
  }, [affiliate]);

  const getCommissionStatusBadge = (status: CommissionStatus) => {
    const variants: Record<
      CommissionStatus,
      { variant: 'default' | 'secondary' | 'outline' | 'destructive'; className?: string }
    > = {
      PENDING: { variant: 'secondary', className: 'bg-yellow-100 text-yellow-800' },
      APPROVED: { variant: 'default', className: 'bg-green-100 text-green-800' },
      PAID: { variant: 'outline', className: 'bg-blue-100 text-blue-800' },
      CANCELLED: { variant: 'destructive' } };
    return (
      <Badge variant={variants[status].variant} className={variants[status].className}>
        {t(`commissionStatus.${status.toLowerCase()}`)}
      </Badge>
    );
  };

  if (isLoading) {
    return (
      <div className="container mx-auto space-y-6 p-6">
        <Skeleton className="h-6 w-32 animate-pulse" />
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <Skeleton className="h-9 w-64 animate-pulse" />
            <Skeleton className="h-5 w-48 animate-pulse" />
          </div>
          <div className="flex gap-2">
            <Skeleton className="h-10 w-24 animate-pulse" />
            <Skeleton className="h-10 w-24 animate-pulse" />
          </div>
        </div>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-28 animate-pulse" />
          ))}
        </div>
        <Skeleton className="h-64 animate-pulse" />
        <Skeleton className="h-96 animate-pulse" />
      </div>
    );
  }

  if (!affiliate) {
    return (
      <div className="container mx-auto max-w-7xl px-4 py-8">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{t('notFound')}</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container mx-auto space-y-6 p-6">
      {/* Back Button */}
      <div className="animate-fade-right">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => {
            setIsBackLoading(true);
            navigate(`/admin/affiliates`);
          }}
          disabled={isBackLoading}
        >
          {isBackLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <ArrowLeft className="mr-2 h-4 w-4" />}
          {t('backToAffiliates')}
        </Button>
      </div>

      {/* Header */}
      <div className="flex animate-fade-up items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold">{affiliate.userName}</h1>
          <p className="mt-1 text-muted-foreground">{affiliate.userEmail}</p>
        </div>
        <div className="flex gap-2">
          {!affiliate.isApproved && !affiliate.rejectedAt && (
            <>
              <Dialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="destructive">
                    <XCircle className="mr-2 h-4 w-4" />
                    {t('actions.reject')}
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>{t('rejectDialog.title')}</DialogTitle>
                    <DialogDescription>{t('rejectDialog.description')}</DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="rejectionReason">{t('rejectDialog.reasonLabel')}</Label>
                      <Textarea
                        id="rejectionReason"
                        placeholder={t('rejectDialog.reasonPlaceholder')}
                        rows={4}
                        value={rejectionReason}
                        onChange={(e) => setRejectionReason(e.target.value)}
                      />
                    </div>
                    <Button
                      type="button"
                      variant="destructive"
                      className="w-full"
                      onClick={handleReject}
                      disabled={isApproving}
                    >
                      {isApproving ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          {t('rejectDialog.submitting')}
                        </>
                      ) : (
                        t('rejectDialog.confirm')
                      )}
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>

              <Dialog open={approveDialogOpen} onOpenChange={setApproveDialogOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <CheckCircle className="mr-2 h-4 w-4" />
                    {t('actions.approve')}
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>{t('approveDialog.title')}</DialogTitle>
                    <DialogDescription>{t('approveDialog.description')}</DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="commissionRate">{t('approveDialog.commissionRateLabel')}</Label>
                      <Input
                        id="commissionRate"
                        type="number"
                        step="0.01"
                        min="0"
                        max="50"
                        value={approveCommissionRate}
                        onChange={(e) => setApproveCommissionRate(Number(e.target.value))}
                      />
                      <p className="text-sm text-muted-foreground">
                        {t('approveDialog.commissionRateDescription')}
                      </p>
                    </div>
                    <Button
                      type="button"
                      className="w-full"
                      onClick={handleApprove}
                      disabled={isApproving}
                    >
                      {isApproving ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          {t('approveDialog.submitting')}
                        </>
                      ) : (
                        t('approveDialog.confirm')
                      )}
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </>
          )}

          {/* Admin Actions for Approved Affiliates */}
          {affiliate.isApproved && (
            <>
              {/* Toggle Active Status */}
              <Button
                variant={affiliate.isActive ? 'outline' : 'default'}
                onClick={handleToggleActive}
                disabled={isTogglingActive}
              >
                {isTogglingActive ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Power className="mr-2 h-4 w-4" />
                )}
                {affiliate.isActive ? t('actions.disable') : t('actions.enable')}
              </Button>

              {/* Update Commission Rate */}
              <Dialog open={commissionRateDialogOpen} onOpenChange={setCommissionRateDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline">
                    <Percent className="mr-2 h-4 w-4" />
                    {t('actions.updateCommission')}
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>{t('commissionRateDialog.title')}</DialogTitle>
                    <DialogDescription>{t('commissionRateDialog.description')}</DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="newCommissionRate">{t('commissionRateDialog.label')}</Label>
                      <Input
                        id="newCommissionRate"
                        type="number"
                        step="0.01"
                        min="0"
                        max="100"
                        value={newCommissionRate}
                        onChange={(e) => setNewCommissionRate(Number(e.target.value))}
                      />
                      <p className="text-sm text-muted-foreground">
                        {t('commissionRateDialog.currentRate')}: {affiliate.commissionRate}%
                      </p>
                    </div>
                    <Button
                      type="button"
                      className="w-full"
                      onClick={handleUpdateCommissionRate}
                      disabled={isUpdatingRate}
                    >
                      {isUpdatingRate ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          {t('commissionRateDialog.submitting')}
                        </>
                      ) : (
                        t('commissionRateDialog.confirm')
                      )}
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </>
          )}
        </div>
      </div>

      {/* Status Alert */}
      {affiliate.isApproved && (
        <Alert className="animate-fade-up-fast">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertDescription>
            {t('status.approved')} {affiliate.approvedAt && formatDate(affiliate.approvedAt)}
          </AlertDescription>
        </Alert>
      )}

      {affiliate.rejectedAt && (
        <Alert variant="destructive" className="animate-fade-up-fast">
          <XCircle className="h-4 w-4" />
          <AlertDescription>
            {t('status.rejected')}: {affiliate.rejectionReason}
          </AlertDescription>
        </Alert>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        <Card className="animate-fade-up-fast">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm font-medium">
              <DollarSign className="h-4 w-4 text-green-600" />
              {t('stats.totalEarnings')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              ${affiliate.stats?.totalEarnings.toFixed(2) || '0.00'}
            </div>
            <p className="text-xs text-muted-foreground">
              {t('stats.approved')}: ${affiliate.stats?.approvedEarnings.toFixed(2) || '0.00'}
            </p>
          </CardContent>
        </Card>

        <Card className="animate-fade-up-light-slow">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm font-medium">
              <MousePointerClick className="h-4 w-4 text-purple-600" />
              {t('stats.clicks')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              {affiliate.stats?.totalClicks || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              {t('stats.conversionRate')}: {affiliate.stats?.conversionRate.toFixed(2) || 0}%
            </p>
          </CardContent>
        </Card>

        <Card className="animate-fade-up-medium-slow">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm font-medium">
              <Users className="h-4 w-4 text-blue-600" />
              {t('stats.referrals')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {affiliate.stats?.totalReferrals || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              {t('stats.active')}: {affiliate.stats?.activeReferrals || 0}
            </p>
          </CardContent>
        </Card>

        <Card className="animate-fade-up-heavy-slow">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm font-medium">
              <Percent className="h-4 w-4 text-orange-600" />
              {t('stats.commissionRate')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{affiliate.commissionRate}%</div>
          </CardContent>
        </Card>
      </div>

      {/* Application Details */}
      <Card className="animate-zoom-in">
        <CardHeader>
          <CardTitle>{t('application.title')}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <p className="text-sm font-medium text-muted-foreground">
              {t('application.referralCode')}
            </p>
            <p className="font-mono text-lg font-semibold">{affiliate.referralCode}</p>
          </div>

          {affiliate.customSlug && (
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                {t('application.customSlug')}
              </p>
              <p className="font-mono">{affiliate.customSlug}</p>
            </div>
          )}

          {affiliate.websiteUrl && (
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                {t('application.websiteUrl')}
              </p>
              <span
                className="flex cursor-pointer items-center gap-1 text-blue-600 hover:underline"
                onClick={() => window.open(affiliate.websiteUrl, '_blank', 'noopener,noreferrer')}
              >
                {affiliate.websiteUrl}
                <LinkIcon className="h-3 w-3" />
              </span>
            </div>
          )}

          {affiliate.socialMediaUrls && (
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                {t('application.socialMedia')}
              </p>
              <p className="whitespace-pre-wrap">{affiliate.socialMediaUrls}</p>
            </div>
          )}

          {affiliate.promotionPlan && (
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                {t('application.promotionPlan')}
              </p>
              <p className="whitespace-pre-wrap">{affiliate.promotionPlan}</p>
            </div>
          )}

          {affiliate.estimatedReach && (
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                {t('application.estimatedReach')}
              </p>
              <p>{affiliate.estimatedReach}</p>
            </div>
          )}

          <div>
            <p className="text-sm font-medium text-muted-foreground">
              {t('application.createdAt')}
            </p>
            <p>{formatDate(affiliate.createdAt)}</p>
          </div>
        </CardContent>
      </Card>

      {/* Commissions */}
      <Card className="animate-zoom-in-slow">
        <CardHeader>
          <CardTitle>{t('commissions.title')}</CardTitle>
          <CardDescription>{t('commissions.description')}</CardDescription>
        </CardHeader>
        <CardContent>
          {commissionsLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : !commissions || commissions.length === 0 ? (
            <div className="py-8 text-center text-muted-foreground">{t('commissions.empty')}</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t('commissions.table.purchase')}</TableHead>
                  <TableHead>{t('commissions.table.commission')}</TableHead>
                  <TableHead>{t('commissions.table.status')}</TableHead>
                  <TableHead>{t('commissions.table.created')}</TableHead>
                  <TableHead>{t('commissions.table.approved')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {commissions.map((commission, index) => (
                  <TableRow
                    key={commission.id}
                    className={`animate-fade-up-${['fast', 'light-slow', 'medium-slow', 'heavy-slow'][index % 4]}`}
                  >
                    <TableCell>${commission.purchaseAmount.toFixed(2)}</TableCell>
                    <TableCell className="font-semibold">
                      ${commission.commissionAmount.toFixed(2)}
                    </TableCell>
                    <TableCell>{getCommissionStatusBadge(commission.status)}</TableCell>
                    <TableCell>{formatDate(commission.createdAt)}</TableCell>
                    <TableCell>
                      {commission.approvedAt ? formatDate(commission.approvedAt) : '-'}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Referred Authors */}
      <Card className="animate-fade-up">
        <CardHeader>
          <CardTitle>{t('referredAuthors.title')}</CardTitle>
          <CardDescription>{t('referredAuthors.description')}</CardDescription>
        </CardHeader>
        <CardContent>
          {referredAuthorsLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : !referredAuthors || referredAuthors.length === 0 ? (
            <div className="py-8 text-center text-muted-foreground">{t('referredAuthors.empty')}</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t('referredAuthors.table.author')}</TableHead>
                  <TableHead>{t('referredAuthors.table.signUpDate')}</TableHead>
                  <TableHead>{t('referredAuthors.table.purchases')}</TableHead>
                  <TableHead>{t('referredAuthors.table.commission')}</TableHead>
                  <TableHead>{t('referredAuthors.table.lastPurchase')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {referredAuthors.map((author, index) => (
                  <TableRow
                    key={author.id}
                    className={`animate-fade-up-${['fast', 'light-slow', 'medium-slow', 'heavy-slow'][index % 4]}`}
                  >
                    <TableCell className="font-medium">{author.authorIdentifier}</TableCell>
                    <TableCell>{formatDate(author.signUpDate)}</TableCell>
                    <TableCell>{author.totalPurchases}</TableCell>
                    <TableCell className="font-semibold text-green-600">
                      ${author.totalCommissionEarned.toFixed(2)}
                    </TableCell>
                    <TableCell>
                      {author.lastPurchaseDate ? formatDate(author.lastPurchaseDate) : '-'}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Payout History */}
      <Card className="animate-fade-up">
        <CardHeader>
          <CardTitle>{t('payouts.title')}</CardTitle>
          <CardDescription>{t('payouts.description')}</CardDescription>
        </CardHeader>
        <CardContent>
          {payoutsLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : !payouts || payouts.length === 0 ? (
            <div className="py-8 text-center text-muted-foreground">{t('payouts.empty')}</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t('payouts.table.amount')}</TableHead>
                  <TableHead>{t('payouts.table.method')}</TableHead>
                  <TableHead>{t('payouts.table.status')}</TableHead>
                  <TableHead>{t('payouts.table.requested')}</TableHead>
                  <TableHead>{t('payouts.table.processed')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {payouts.map((payout, index) => (
                  <TableRow
                    key={payout.id}
                    className={`animate-fade-up-${['fast', 'light-slow', 'medium-slow', 'heavy-slow'][index % 4]}`}
                  >
                    <TableCell className="font-semibold">${payout.amount.toFixed(2)}</TableCell>
                    <TableCell>{payout.paymentMethod}</TableCell>
                    <TableCell>
                      <Badge
                        className={
                          payout.status === 'COMPLETED'
                            ? 'bg-green-100 text-green-800'
                            : payout.status === 'REQUESTED'
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-blue-100 text-blue-800'
                        }
                      >
                        {payout.status}
                      </Badge>
                    </TableCell>
                    <TableCell>{formatDate(payout.requestedAt)}</TableCell>
                    <TableCell>
                      {payout.processedAt ? formatDate(payout.processedAt) : '-'}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
