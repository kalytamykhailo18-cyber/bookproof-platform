'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Plus, Edit, Trash2, Eye, TrendingUp, Filter, Tag, AlertCircle } from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';
import { useCoupons, useDeleteCoupon } from '@/hooks/useCoupons';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
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
} from '@/components/ui/alert-dialog';
import { CouponResponseDto, CouponType, CouponAppliesTo } from '@/lib/api/coupons';
import { formatDate } from '@/lib/utils';

export default function CouponsPage() {
  const t = useTranslations('adminCoupons');
  const router = useRouter();
  const params = useParams();
  const locale = (params.locale as string) || 'en';
  const [filterActive, setFilterActive] = useState<string>('all');
  const [filterAppliesTo, setFilterAppliesTo] = useState<string>('all');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [couponToDelete, setCouponToDelete] = useState<string | null>(null);

  // Build filters
  const filters: { isActive?: boolean; appliesTo?: CouponAppliesTo } = {};
  if (filterActive !== 'all') {
    filters.isActive = filterActive === 'true';
  }
  if (filterAppliesTo !== 'all') {
    filters.appliesTo = filterAppliesTo as CouponAppliesTo;
  }

  const { data: coupons, isLoading } = useCoupons(filters);
  const deleteMutation = useDeleteCoupon();

  const handleDeleteClick = (id: string) => {
    setCouponToDelete(id);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (couponToDelete) {
      await deleteMutation.mutateAsync(couponToDelete);
      setDeleteDialogOpen(false);
      setCouponToDelete(null);
    }
  };

  const getCouponTypeBadge = (type: CouponType) => {
    const variants: Record<CouponType, 'default' | 'secondary' | 'outline'> = {
      PERCENTAGE: 'default',
      FIXED_AMOUNT: 'secondary',
      FREE_ADDON: 'outline',
    };

    return (
      <Badge variant={variants[type]}>
        {type === 'PERCENTAGE' && '%'}
        {type === 'FIXED_AMOUNT' && '$'}
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

  const formatDiscount = (coupon: CouponResponseDto) => {
    if (coupon.type === 'PERCENTAGE') {
      return `${coupon.discountPercent}%`;
    }
    if (coupon.type === 'FIXED_AMOUNT') {
      return `$${coupon.discountAmount}`;
    }
    return t('types.freeAddon');
  };

  if (isLoading) {
    return (
      <div className="container mx-auto space-y-6 p-6">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <Skeleton className="h-9 w-48 animate-pulse" />
            <Skeleton className="h-5 w-64 animate-pulse" />
          </div>
          <Skeleton className="h-10 w-32 animate-pulse" />
        </div>
        <Skeleton className="h-24 animate-pulse" />
        <Skeleton className="h-96 animate-pulse" />
      </div>
    );
  }

  return (
    <div className="container mx-auto space-y-6 p-6">
      {/* Header */}
      <div className="flex animate-fade-up items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">{t('title')}</h1>
          <p className="text-muted-foreground">{t('subtitle')}</p>
        </div>
        <Button type="button" className="animate-fade-left" onClick={() => router.push(`/${locale}/admin/coupons/new`)}>
          <Plus className="mr-2 h-4 w-4" />
          {t('createNew')}
        </Button>
      </div>

      {/* Filters */}
      <Card className="animate-zoom-in">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            {t('filters.title')}
          </CardTitle>
        </CardHeader>
        <CardContent className="flex gap-4">
          <div className="w-48 animate-fade-left-fast">
            <Select value={filterActive} onValueChange={setFilterActive}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('filters.allStatus')}</SelectItem>
                <SelectItem value="true">{t('filters.active')}</SelectItem>
                <SelectItem value="false">{t('filters.inactive')}</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="w-48 animate-fade-left-light-slow">
            <Select value={filterAppliesTo} onValueChange={setFilterAppliesTo}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('filters.allTypes')}</SelectItem>
                <SelectItem value="CREDITS">{t('appliesTo.credits')}</SelectItem>
                <SelectItem value="KEYWORD_RESEARCH">{t('appliesTo.keywordResearch')}</SelectItem>
                <SelectItem value="ALL">{t('appliesTo.all')}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Coupons Table */}
      <Card className="animate-zoom-in-slow">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Tag className="h-5 w-5" />
            {t('table.title')} ({coupons?.length || 0})
          </CardTitle>
          <CardDescription>{t('table.description')}</CardDescription>
        </CardHeader>
        <CardContent>
          {!coupons || coupons.length === 0 ? (
            <div className="animate-fade-up py-16 text-center">
              <AlertCircle className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
              <h3 className="text-lg font-semibold">{t('empty.title')}</h3>
              <p className="text-muted-foreground">{t('empty.description')}</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t('table.code')}</TableHead>
                  <TableHead>{t('table.type')}</TableHead>
                  <TableHead>{t('table.discount')}</TableHead>
                  <TableHead>{t('table.appliesTo')}</TableHead>
                  <TableHead>{t('table.usage')}</TableHead>
                  <TableHead>{t('table.validPeriod')}</TableHead>
                  <TableHead>{t('table.status')}</TableHead>
                  <TableHead className="text-right">{t('table.actions')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {coupons.map((coupon, index) => (
                  <TableRow
                    key={coupon.id}
                    className={`animate-fade-up-${['fast', 'light-slow', 'medium-slow', 'heavy-slow'][index % 4]}`}
                  >
                    <TableCell className="font-mono font-semibold">{coupon.code}</TableCell>
                    <TableCell>{getCouponTypeBadge(coupon.type)}</TableCell>
                    <TableCell>{formatDiscount(coupon)}</TableCell>
                    <TableCell>{getAppliesToBadge(coupon.appliesTo)}</TableCell>
                    <TableCell>
                      {coupon.currentUses}
                      {coupon.maxUses && ` / ${coupon.maxUses}`}
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div>{formatDate(coupon.validFrom)}</div>
                        {coupon.validUntil && (
                          <div className="text-muted-foreground">
                            {t('table.to')} {formatDate(coupon.validUntil)}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      {coupon.isActive ? (
                        <Badge variant="default">{t('status.active')}</Badge>
                      ) : (
                        <Badge variant="secondary">{t('status.inactive')}</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            {t('table.actions')}
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => router.push(`/${locale}/admin/coupons/${coupon.id}`)}>
                            <Eye className="mr-2 h-4 w-4" />
                            {t('actions.view')}
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => router.push(`/${locale}/admin/coupons/${coupon.id}/edit`)}>
                            <Edit className="mr-2 h-4 w-4" />
                            {t('actions.edit')}
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => router.push(`/${locale}/admin/coupons/${coupon.id}/usage`)}>
                            <TrendingUp className="mr-2 h-4 w-4" />
                            {t('actions.viewUsage')}
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleDeleteClick(coupon.id)}
                            className="text-red-600"
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            {t('actions.delete')}
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('deleteDialog.title')}</AlertDialogTitle>
            <AlertDialogDescription>{t('deleteDialog.description')}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('deleteDialog.cancel')}</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              className="bg-red-600 hover:bg-red-700"
            >
              {t('deleteDialog.confirm')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
