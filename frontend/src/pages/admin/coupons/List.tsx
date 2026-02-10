import { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Plus, Eye, Edit, Trash2, TrendingUp } from 'lucide-react';
import { couponsApi, CouponResponseDto, CouponType, CouponAppliesTo } from '@/lib/api/coupons';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
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
import { formatDate } from '@/lib/utils';

export function CouponsListPage() {
  const { t } = useTranslation('adminCoupons');
  const navigate = useNavigate();

  // Data state
  const [coupons, setCoupons] = useState<CouponResponseDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);

  // Filter state
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [typeFilter, setTypeFilter] = useState<CouponType | 'all'>('all');

  // Fetch coupons
  const fetchCoupons = async () => {
    try {
      setIsLoading(true);
      const filters: any = {};
      if (statusFilter !== 'all') {
        filters.isActive = statusFilter === 'active';
      }
      if (typeFilter !== 'all') {
        filters.appliesTo = typeFilter;
      }
      const data = await couponsApi.getAll(filters);
      setCoupons(data);
    } catch (err) {
      console.error('Coupons error:', err);
      toast.error(t('messages.loadError'));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCoupons();
  }, [statusFilter, typeFilter]);

  const handleDelete = async (id: string) => {
    try {
      setIsDeleting(id);
      await couponsApi.delete(id);
      toast.success(t('messages.deleteSuccess'));
      await fetchCoupons();
    } catch (error: any) {
      const message = error.response?.data?.message || t('messages.deleteError');
      toast.error(message);
    } finally {
      setIsDeleting(null);
    }
  };

  const getTypeBadge = (type: CouponType) => {
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

  const getDiscountDisplay = (coupon: CouponResponseDto) => {
    if (coupon.type === CouponType.PERCENTAGE) {
      return `${coupon.discountPercent}%`;
    }
    if (coupon.type === CouponType.FIXED_AMOUNT) {
      return `$${coupon.discountAmount}`;
    }
    return t('types.freeAddon');
  };

  if (isLoading) {
    return (
      <div className="container mx-auto space-y-6 p-6">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <Skeleton className="h-9 w-64 animate-pulse" />
            <Skeleton className="h-5 w-96 animate-pulse" />
          </div>
          <Skeleton className="h-10 w-40 animate-pulse" />
        </div>
        <div className="flex gap-4">
          <Skeleton className="h-10 w-48 animate-pulse" />
          <Skeleton className="h-10 w-48 animate-pulse" />
        </div>
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
        <Button onClick={() => navigate('/admin/coupons/new')} className="animate-fade-left">
          <Plus className="mr-2 h-4 w-4" />
          {t('createNew')}
        </Button>
      </div>

      {/* Filters */}
      <div className="flex animate-fade-up-fast gap-4">
        <Select
          value={statusFilter}
          onValueChange={(v) => setStatusFilter(v as typeof statusFilter)}
        >
          <SelectTrigger className="w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t('filters.allStatus')}</SelectItem>
            <SelectItem value="active">{t('filters.active')}</SelectItem>
            <SelectItem value="inactive">{t('filters.inactive')}</SelectItem>
          </SelectContent>
        </Select>

        <Select value={typeFilter} onValueChange={(v) => setTypeFilter(v as typeof typeFilter)}>
          <SelectTrigger className="w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t('filters.allTypes')}</SelectItem>
            <SelectItem value={CouponAppliesTo.CREDITS}>{t('appliesTo.credits')}</SelectItem>
            <SelectItem value={CouponAppliesTo.KEYWORD_RESEARCH}>
              {t('appliesTo.keywordResearch')}
            </SelectItem>
            <SelectItem value={CouponAppliesTo.ALL}>{t('appliesTo.all')}</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Coupons Table */}
      <Card className="animate-zoom-in">
        <CardHeader>
          <CardTitle>{t('table.title')}</CardTitle>
          <CardDescription>{t('table.description')}</CardDescription>
        </CardHeader>
        <CardContent>
          {coupons.length === 0 ? (
            <div className="py-16 text-center">
              <p className="text-lg font-semibold">{t('empty.title')}</p>
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
                    <TableCell className="font-mono font-medium">{coupon.code}</TableCell>
                    <TableCell>{getTypeBadge(coupon.type)}</TableCell>
                    <TableCell className="font-semibold">{getDiscountDisplay(coupon)}</TableCell>
                    <TableCell>{getAppliesToBadge(coupon.appliesTo)}</TableCell>
                    <TableCell>
                      {coupon.currentUses}
                      {coupon.maxUses ? ` / ${coupon.maxUses}` : ''}
                    </TableCell>
                    <TableCell className="text-sm">
                      {formatDate(coupon.validFrom)} {t('table.to')}{' '}
                      {coupon.validUntil ? formatDate(coupon.validUntil) : t('messages.noExpiration')}
                    </TableCell>
                    <TableCell>
                      {coupon.isActive ? (
                        <Badge variant="default">{t('status.active')}</Badge>
                      ) : (
                        <Badge variant="secondary">{t('status.inactive')}</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex justify-end gap-2">
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => navigate(`/admin/coupons/${coupon.id}`)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => navigate(`/admin/coupons/${coupon.id}/usage`)}
                        >
                          <TrendingUp className="h-4 w-4" />
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => navigate(`/admin/coupons/${coupon.id}/edit`)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              disabled={isDeleting === coupon.id}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>{t('deleteDialog.title')}</AlertDialogTitle>
                              <AlertDialogDescription>
                                {t('deleteDialog.description')}
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>{t('deleteDialog.cancel')}</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleDelete(coupon.id)}
                                className="bg-red-600 hover:bg-red-700"
                              >
                                {t('deleteDialog.confirm')}
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
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
