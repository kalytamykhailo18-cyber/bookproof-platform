'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import {
  useCloserPackages,
  useCloserPackageStats,
  useSendPackage,
  useDeletePackage,
} from '@/hooks/useCloser';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
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
import { Plus, MoreHorizontal, Send, Trash2, Eye, Copy, ExternalLink } from 'lucide-react';
import { useRouter, useParams } from 'next/navigation';
import { CustomPackageStatus } from '@/lib/api/closer';
import { toast } from 'sonner';

export default function PackagesPage() {
  const t = useTranslations('closer');
  const router = useRouter();
  const params = useParams();
  const locale = params.locale as string;
  const [statusFilter, setStatusFilter] = useState<CustomPackageStatus | 'ALL'>('ALL');

  const { data: packages, isLoading } = useCloserPackages(
    statusFilter === 'ALL' ? undefined : { status: statusFilter },
  );
  const { data: stats } = useCloserPackageStats();
  const sendPackage = useSendPackage();
  const deletePackage = useDeletePackage();

  // Dialog states
  const [sendDialogOpen, setSendDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedPackageId, setSelectedPackageId] = useState<string>('');
  const [expirationDays, setExpirationDays] = useState(7);
  const [customMessage, setCustomMessage] = useState('');

  const handleSend = () => {
    sendPackage.mutate(
      {
        packageId: selectedPackageId,
        data: {
          expirationDays,
          customMessage: customMessage || undefined,
        },
      },
      {
        onSuccess: () => {
          setSendDialogOpen(false);
          setExpirationDays(7);
          setCustomMessage('');
        },
      },
    );
  };

  const handleDelete = () => {
    deletePackage.mutate(selectedPackageId, {
      onSuccess: () => {
        setDeleteDialogOpen(false);
      },
    });
  };

  const copyPaymentLink = (link: string) => {
    navigator.clipboard.writeText(link);
    toast.success('Payment link copied to clipboard');
  };

  const formatCurrency = (amount: number, currency: string = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
    }).format(amount);
  };

  const getStatusBadge = (status: CustomPackageStatus) => {
    switch (status) {
      case CustomPackageStatus.DRAFT:
        return <Badge variant="secondary">{t('status.draft')}</Badge>;
      case CustomPackageStatus.SENT:
        return <Badge variant="default">{t('status.sent')}</Badge>;
      case CustomPackageStatus.VIEWED:
        return <Badge variant="outline">{t('status.viewed')}</Badge>;
      case CustomPackageStatus.PAID:
        return <Badge className="bg-green-500">{t('status.paid')}</Badge>;
      case CustomPackageStatus.EXPIRED:
        return <Badge variant="destructive">{t('status.expired')}</Badge>;
      case CustomPackageStatus.CANCELLED:
        return <Badge variant="destructive">{t('status.cancelled')}</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto space-y-6 px-4 py-8">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <Skeleton className="h-9 w-48 animate-pulse" />
            <Skeleton className="h-5 w-80 animate-pulse" />
          </div>
          <Skeleton className="h-10 w-36 animate-pulse" />
        </div>
        <div className="grid gap-4 md:grid-cols-6">
          <Skeleton className="h-24 animate-pulse" />
          <Skeleton className="h-24 animate-pulse" />
          <Skeleton className="h-24 animate-pulse" />
          <Skeleton className="h-24 animate-pulse" />
          <Skeleton className="h-24 animate-pulse" />
          <Skeleton className="h-24 animate-pulse" />
        </div>
        <Skeleton className="h-96 animate-pulse" />
      </div>
    );
  }

  return (
    <div className="container mx-auto space-y-6 px-4 py-8">
      {/* Header */}
      <div className="flex animate-fade-up items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">{t('packages.title')}</h1>
          <p className="text-muted-foreground">{t('packages.description')}</p>
        </div>
        <Button type="button" onClick={() => router.push(`/${locale}/closer/packages/new`)}>
          <Plus className="mr-2 h-4 w-4" />
          {t('packages.createPackage')}
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-6">
        <Card className="animate-fade-up-fast">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {t('status.draft')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.draft || 0}</div>
          </CardContent>
        </Card>
        <Card className="animate-fade-up-light-slow">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {t('status.sent')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats?.sent || 0}</div>
          </CardContent>
        </Card>
        <Card className="animate-fade-up-slow">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {t('status.viewed')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">{stats?.viewed || 0}</div>
          </CardContent>
        </Card>
        <Card className="animate-fade-up-very-slow">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {t('status.paid')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats?.paid || 0}</div>
          </CardContent>
        </Card>
        <Card className="animate-fade-left-slow">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {t('dashboard.totalRevenue')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold">{formatCurrency(stats?.totalRevenue || 0)}</div>
          </CardContent>
        </Card>
        <Card className="animate-fade-right-slow">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {t('dashboard.creditsSold')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalCreditsSold || 0}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex animate-fade-up items-center gap-4">
        <Select
          value={statusFilter}
          onValueChange={(value) => setStatusFilter(value as CustomPackageStatus | 'ALL')}
        >
          <SelectTrigger className="w-48">
            <SelectValue placeholder={t('packages.filterByStatus')} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">{t('packages.allPackages')}</SelectItem>
            <SelectItem value={CustomPackageStatus.DRAFT}>{t('status.draft')}</SelectItem>
            <SelectItem value={CustomPackageStatus.SENT}>{t('status.sent')}</SelectItem>
            <SelectItem value={CustomPackageStatus.VIEWED}>{t('status.viewed')}</SelectItem>
            <SelectItem value={CustomPackageStatus.PAID}>{t('status.paid')}</SelectItem>
            <SelectItem value={CustomPackageStatus.EXPIRED}>{t('status.expired')}</SelectItem>
            <SelectItem value={CustomPackageStatus.CANCELLED}>{t('status.cancelled')}</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Packages Table */}
      <Card className="animate-zoom-in-slow">
        <CardHeader>
          <CardTitle>{t('packages.title')}</CardTitle>
          <CardDescription>
            {packages?.length || 0} {t('packages.packagesFound')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {packages && packages.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t('createPackage.packageName')}</TableHead>
                  <TableHead>{t('common.client')}</TableHead>
                  <TableHead>{t('common.credits')}</TableHead>
                  <TableHead>{t('common.amount')}</TableHead>
                  <TableHead>{t('status.draft')}</TableHead>
                  <TableHead>{t('common.date')}</TableHead>
                  <TableHead className="text-right">{t('common.actions')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {packages.map((pkg, index) => (
                  <TableRow
                    key={pkg.id}
                    className={`animate-fade-up-${index % 2 === 0 ? 'fast' : 'light-slow'}`}
                  >
                    <TableCell>
                      <div>
                        <p className="font-medium">{pkg.packageName}</p>
                        {pkg.description && (
                          <p className="line-clamp-1 text-sm text-muted-foreground">
                            {pkg.description}
                          </p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">{pkg.clientName}</p>
                        <p className="text-sm text-muted-foreground">{pkg.clientEmail}</p>
                        {pkg.clientCompany && (
                          <p className="text-xs text-muted-foreground">{pkg.clientCompany}</p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>{pkg.credits}</TableCell>
                    <TableCell>{formatCurrency(pkg.price, pkg.currency)}</TableCell>
                    <TableCell>
                      {getStatusBadge(pkg.status)}
                      {pkg.viewCount > 0 && (
                        <span className="ml-2 text-xs text-muted-foreground">
                          ({pkg.viewCount} {t('common.views')})
                        </span>
                      )}
                    </TableCell>
                    <TableCell>{new Date(pkg.createdAt).toLocaleDateString()}</TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button type="button" variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => router.push(`/${locale}/closer/packages/${pkg.id}`)}>
                            <Eye className="mr-2 h-4 w-4" />
                            {t('packages.viewDetails')}
                          </DropdownMenuItem>
                          {pkg.paymentLink && (
                            <>
                              <DropdownMenuItem onClick={() => copyPaymentLink(pkg.paymentLink!)}>
                                <Copy className="mr-2 h-4 w-4" />
                                {t('packages.copyPaymentLink')}
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => window.open(pkg.paymentLink!, '_blank')}
                              >
                                <ExternalLink className="mr-2 h-4 w-4" />
                                {t('packages.openPaymentLink')}
                              </DropdownMenuItem>
                            </>
                          )}
                          {pkg.status === CustomPackageStatus.DRAFT && (
                            <>
                              <DropdownMenuItem
                                onClick={() => {
                                  setSelectedPackageId(pkg.id);
                                  setSendDialogOpen(true);
                                }}
                              >
                                <Send className="mr-2 h-4 w-4" />
                                {t('packages.sendToClient')}
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                className="text-destructive"
                                onClick={() => {
                                  setSelectedPackageId(pkg.id);
                                  setDeleteDialogOpen(true);
                                }}
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                {t('packages.delete')}
                              </DropdownMenuItem>
                            </>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <p className="text-muted-foreground">{t('packages.noPackagesFound')}</p>
              <Button type="button" variant="outline" className="mt-4" onClick={() => router.push(`/${locale}/closer/packages/new`)}>
                <Plus className="mr-2 h-4 w-4" />
                {t('packages.createFirstPackage')}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Send Package Dialog */}
      <Dialog open={sendDialogOpen} onOpenChange={setSendDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('packages.sendPackage.title')}</DialogTitle>
            <DialogDescription>{t('packages.sendPackage.description')}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="expirationDays">{t('packages.sendPackage.linkExpiration')}</Label>
              <Input
                id="expirationDays"
                type="number"
                min={1}
                max={30}
                value={expirationDays}
                onChange={(e) => setExpirationDays(parseInt(e.target.value) || 7)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="customMessage">{t('packages.sendPackage.customMessage')}</Label>
              <Input
                id="customMessage"
                placeholder={t('packages.sendPackage.customMessagePlaceholder')}
                value={customMessage}
                onChange={(e) => setCustomMessage(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setSendDialogOpen(false)}>
              {t('common.cancel')}
            </Button>
            <Button type="button" onClick={handleSend} disabled={sendPackage.isPending}>
              {sendPackage.isPending
                ? t('packages.sendPackage.sending')
                : t('packages.sendPackage.send')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Package Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('packages.deletePackage.title')}</DialogTitle>
            <DialogDescription>{t('packages.deletePackage.description')}</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              {t('common.cancel')}
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={handleDelete}
              disabled={deletePackage.isPending}
            >
              {deletePackage.isPending
                ? t('packages.deletePackage.deleting')
                : t('packages.deletePackage.delete')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
