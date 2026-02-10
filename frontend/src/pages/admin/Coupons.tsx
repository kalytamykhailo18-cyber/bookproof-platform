import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Edit, TrendingUp, Trash2, Loader2 } from 'lucide-react';
import { couponsApi, CouponType, CouponAppliesTo } from '@/lib/api/coupons';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { formatDate } from '@/lib/utils';

export function CouponDetailPage() {
  const { t, i18n } = useTranslation('adminCoupons');
  const navigate = useNavigate();
  const params = useParams();
  const id = params.id as string;

  // Data state
  const [coupon, setCoupon] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);

  const [isBackLoading, setIsBackLoading] = useState(false);
  const [isUsageLoading, setIsUsageLoading] = useState(false);
  const [isEditLoading, setIsEditLoading] = useState(false);

  // Fetch coupon
  useEffect(() => {
    if (!id) {
      setIsLoading(false);
      return;
    }
    const fetchCoupon = async () => {
      try {
        setIsLoading(true);
        const data = await couponsApi.getById(id);
        setCoupon(data);
      } catch (err) {
        console.error('Coupon error:', err);
        toast.error(t('messages.loadError'));
      } finally {
        setIsLoading(false);
      }
    };
    fetchCoupon();
  }, [id]);

  const handleDelete = async () => {
    try {
      setIsDeleting(true);
      await couponsApi.delete(id);
      toast.success(t('messages.deleteSuccess'));
      navigate(`/admin/coupons`);
    } catch (error: any) {
      const message = error.response?.data?.message || t('messages.deleteError');
      toast.error(message);
    } finally {
      setIsDeleting(false);
    }
  };

  const getCouponTypeBadge = (type: CouponType) => {
    const variants: Record<CouponType, 'default' | 'secondary' | 'outline'> = {
      PERCENTAGE: 'default',
      FIXED_AMOUNT: 'secondary',
      FREE_ADDON: 'outline' };

    return (
      <Badge variant={variants[type]}>
        {type === 'PERCENTAGE' && t('types.percentage')}
        {type === 'FIXED_AMOUNT' && t('types.fixedAmount')}
        {type === 'FREE_ADDON' && t('types.freeAddon')}
      </Badge>
    );
  };

  const getAppliesToBadge = (appliesTo: CouponAppliesTo) => {
    const colors: Record<CouponAppliesTo, string> = {
      CREDITS: 'bg-blue-100 text-blue-800',
      KEYWORD_RESEARCH: 'bg-purple-100 text-purple-800',
      ALL: 'bg-green-100 text-green-800' };

    return (
      <Badge className={colors[appliesTo]}>
        {appliesTo === 'CREDITS' && t('appliesTo.credits')}
        {appliesTo === 'KEYWORD_RESEARCH' && t('appliesTo.keywordResearch')}
        {appliesTo === 'ALL' && t('appliesTo.all')}
      </Badge>
    );
  };

  if (isLoading) {
    return (
      <div className="container mx-auto max-w-4xl space-y-6 p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Skeleton className="h-10 w-10 animate-pulse" />
            <div className="space-y-2">
              <Skeleton className="h-9 w-48 animate-pulse" />
              <Skeleton className="h-5 w-32 animate-pulse" />
            </div>
          </div>
          <div className="flex gap-2">
            <Skeleton className="h-10 w-28 animate-pulse" />
            <Skeleton className="h-10 w-20 animate-pulse" />
            <Skeleton className="h-10 w-20 animate-pulse" />
          </div>
        </div>
        <div className="flex gap-2">
          <Skeleton className="h-6 w-16 animate-pulse" />
          <Skeleton className="h-6 w-24 animate-pulse" />
          <Skeleton className="h-6 w-20 animate-pulse" />
        </div>
        <div className="grid gap-6 md:grid-cols-2">
          <Skeleton className="h-48 animate-pulse" />
          <Skeleton className="h-48 animate-pulse" />
          <Skeleton className="h-48 animate-pulse" />
          <Skeleton className="h-48 animate-pulse" />
        </div>
      </div>
    );
  }

  if (!coupon) {
    return (
      <div className="container mx-auto max-w-4xl py-6">
        <p className="text-center text-muted-foreground">{t('messages.notFound')}</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-4xl space-y-6 p-6">
      {/* Header */}
      <div className="flex animate-fade-up items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => {
              setIsBackLoading(true);
              navigate(`/admin/coupons`);
            }}
            disabled={isBackLoading}
          >
            {isBackLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ArrowLeft className="h-4 w-4" />}
          </Button>
          <div>
            <h1 className="font-mono text-3xl font-bold">{coupon.code}</h1>
            <p className="text-muted-foreground">{t('detail.subtitle')}</p>
          </div>
        </div>
        <div className="flex animate-fade-left gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              setIsUsageLoading(true);
              navigate(`/admin/coupons/${id}/usage`);
            }}
            disabled={isUsageLoading}
          >
            {isUsageLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <TrendingUp className="mr-2 h-4 w-4" />}
            {t('actions.viewUsage')}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              setIsEditLoading(true);
              navigate(`/admin/coupons/${id}/edit`);
            }}
            disabled={isEditLoading}
          >
            {isEditLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Edit className="mr-2 h-4 w-4" />}
            {t('actions.edit')}
          </Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button type="button" variant="destructive">
                <Trash2 className="mr-2 h-4 w-4" />
                {t('actions.delete')}
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>{t('deleteDialog.title')}</AlertDialogTitle>
                <AlertDialogDescription>{t('deleteDialog.description')}</AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>{t('deleteDialog.cancel')}</AlertDialogCancel>
                <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">
                  {t('deleteDialog.confirm')}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      {/* Status Badge */}
      <div className="flex animate-fade-up-fast gap-2">
        {coupon.isActive ? (
          <Badge variant="default">{t('status.active')}</Badge>
        ) : (
          <Badge variant="secondary">{t('status.inactive')}</Badge>
        )}
        {getCouponTypeBadge(coupon.type)}
        {getAppliesToBadge(coupon.appliesTo)}
      </div>

      {/* Coupon Details */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Basic Info */}
        <Card className="animate-fade-up-light-slow">
          <CardHeader>
            <CardTitle>{t('new.basic.title')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <dt className="text-sm font-medium text-muted-foreground">
                {t('new.fields.code.label')}
              </dt>
              <dd className="mt-1 font-mono text-lg">{coupon.code}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-muted-foreground">
                {t('new.fields.type.label')}
              </dt>
              <dd className="mt-1">{getCouponTypeBadge(coupon.type)}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-muted-foreground">
                {t('new.fields.appliesTo.label')}
              </dt>
              <dd className="mt-1">{getAppliesToBadge(coupon.appliesTo)}</dd>
            </div>
            {coupon.purpose && (
              <div>
                <dt className="text-sm font-medium text-muted-foreground">
                  {t('new.fields.purpose.label')}
                </dt>
                <dd className="mt-1">{coupon.purpose}</dd>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Discount Info */}
        <Card className="animate-fade-up-medium-slow">
          <CardHeader>
            <CardTitle>{t('new.discount.title')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {coupon.type === CouponType.PERCENTAGE && (
              <div>
                <dt className="text-sm font-medium text-muted-foreground">
                  {t('new.fields.discountPercent.label')}
                </dt>
                <dd className="mt-1 text-2xl font-bold">{coupon.discountPercent}%</dd>
              </div>
            )}
            {coupon.type === CouponType.FIXED_AMOUNT && (
              <div>
                <dt className="text-sm font-medium text-muted-foreground">
                  {t('new.fields.discountAmount.label')}
                </dt>
                <dd className="mt-1 text-2xl font-bold">${coupon.discountAmount}</dd>
              </div>
            )}
            {coupon.minimumPurchase && (
              <div>
                <dt className="text-sm font-medium text-muted-foreground">
                  {t('new.fields.minimumPurchase.label')}
                </dt>
                <dd className="mt-1">${coupon.minimumPurchase}</dd>
              </div>
            )}
            {coupon.minimumCredits && (
              <div>
                <dt className="text-sm font-medium text-muted-foreground">
                  {t('new.fields.minimumCredits.label')}
                </dt>
                <dd className="mt-1">{coupon.minimumCredits} credits</dd>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Usage Limits */}
        <Card className="animate-fade-up-heavy-slow">
          <CardHeader>
            <CardTitle>{t('new.limits.title')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <dt className="text-sm font-medium text-muted-foreground">{t('table.usage')}</dt>
              <dd className="mt-1 text-2xl font-bold">
                {coupon.currentUses}
                {coupon.maxUses ? ` / ${coupon.maxUses}` : ' (unlimited)'}
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-muted-foreground">
                {t('new.fields.maxUsesPerUser.label')}
              </dt>
              <dd className="mt-1">{coupon.maxUsesPerUser}</dd>
            </div>
          </CardContent>
        </Card>

        {/* Validity Period */}
        <Card className="animate-fade-up-extra-slow">
          <CardHeader>
            <CardTitle>{t('new.validity.title')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <dt className="text-sm font-medium text-muted-foreground">
                {t('new.fields.validFrom.label')}
              </dt>
              <dd className="mt-1">{formatDate(coupon.validFrom)}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-muted-foreground">
                {t('new.fields.validUntil.label')}
              </dt>
              <dd className="mt-1">
                {coupon.validUntil ? formatDate(coupon.validUntil) : t('messages.noExpiration')}
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-muted-foreground">{t('messages.created')}</dt>
              <dd className="mt-1">{formatDate(coupon.createdAt)}</dd>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
