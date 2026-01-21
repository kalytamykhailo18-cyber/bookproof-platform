'use client';

import { useTranslations } from 'next-intl';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Edit, TrendingUp, Trash2 } from 'lucide-react';
import { useCoupon, useDeleteCoupon } from '@/hooks/useCoupons';
import { CouponType, CouponAppliesTo } from '@/lib/api/coupons';
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
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { formatDate } from '@/lib/utils';

export default function CouponDetailPage() {
  const t = useTranslations('adminCoupons');
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const locale = params.locale as string;

  const { data: coupon, isLoading } = useCoupon(id);
  const deleteMutation = useDeleteCoupon();

  const handleDelete = async () => {
    await deleteMutation.mutateAsync(id);
    router.push(`/${locale}/admin/coupons`);
  };

  const getCouponTypeBadge = (type: CouponType) => {
    const variants: Record<CouponType, 'default' | 'secondary' | 'outline'> = {
      PERCENTAGE: 'default',
      FIXED_AMOUNT: 'secondary',
      FREE_ADDON: 'outline',
    };

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
      ALL: 'bg-green-100 text-green-800',
    };

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
        <p className="text-center text-muted-foreground">Coupon not found</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-4xl space-y-6 p-6">
      {/* Header */}
      <div className="flex animate-fade-up items-center justify-between">
        <div className="flex items-center gap-4">
          <Button type="button" variant="ghost" size="icon" onClick={() => router.push(`/${locale}/admin/coupons`)}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="font-mono text-3xl font-bold">{coupon.code}</h1>
            <p className="text-muted-foreground">{t('detail.subtitle')}</p>
          </div>
        </div>
        <div className="flex animate-fade-left gap-2">
          <Button type="button" variant="outline" onClick={() => router.push(`/${locale}/admin/coupons/${id}/usage`)}>
            <TrendingUp className="mr-2 h-4 w-4" />
            {t('actions.viewUsage')}
          </Button>
          <Button type="button" variant="outline" onClick={() => router.push(`/${locale}/admin/coupons/${id}/edit`)}>
            <Edit className="mr-2 h-4 w-4" />
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
                {coupon.validUntil ? formatDate(coupon.validUntil) : 'No expiration'}
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-muted-foreground">Created</dt>
              <dd className="mt-1">{formatDate(coupon.createdAt)}</dd>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
