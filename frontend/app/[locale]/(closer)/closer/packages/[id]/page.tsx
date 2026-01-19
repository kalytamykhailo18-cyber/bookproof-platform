'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useCloserPackage, useUpdatePackage, useSendPackage } from '@/hooks/useCloser';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ArrowLeft, Save, Send, Copy, ExternalLink, Clock, Eye, CheckCircle } from 'lucide-react';
import Link from 'next/link';
import { CustomPackageStatus } from '@/lib/api/closer';
import { toast } from 'sonner';

export default function PackageDetailPage() {
  const t = useTranslations('closer');
  const params = useParams();
  const locale = params.locale as string;
  const packageId = params.id as string;

  const { data: pkg, isLoading } = useCloserPackage(packageId);
  const updatePackage = useUpdatePackage();
  const sendPackage = useSendPackage();

  const [isEditing, setIsEditing] = useState(false);
  const [sendDialogOpen, setSendDialogOpen] = useState(false);
  const [expirationDays, setExpirationDays] = useState(7);
  const [customMessage, setCustomMessage] = useState('');

  const [formData, setFormData] = useState({
    packageName: '',
    description: '',
    credits: 0,
    price: 0,
    currency: 'USD',
    validityDays: 90,
    specialTerms: '',
    clientName: '',
    clientEmail: '',
    clientCompany: '',
  });

  // Initialize form data when package loads
  if (pkg && !formData.packageName && !isEditing) {
    setFormData({
      packageName: pkg.packageName,
      description: pkg.description || '',
      credits: pkg.credits,
      price: pkg.price,
      currency: pkg.currency,
      validityDays: pkg.validityDays,
      specialTerms: pkg.specialTerms || '',
      clientName: pkg.clientName,
      clientEmail: pkg.clientEmail,
      clientCompany: pkg.clientCompany || '',
    });
  }

  const handleSave = () => {
    updatePackage.mutate(
      {
        packageId,
        data: {
          packageName: formData.packageName,
          description: formData.description || undefined,
          credits: formData.credits,
          price: formData.price,
          currency: formData.currency,
          validityDays: formData.validityDays,
          specialTerms: formData.specialTerms || undefined,
          clientName: formData.clientName,
          clientEmail: formData.clientEmail,
          clientCompany: formData.clientCompany || undefined,
        },
      },
      {
        onSuccess: () => {
          setIsEditing(false);
        },
      },
    );
  };

  const handleSend = () => {
    sendPackage.mutate(
      {
        packageId,
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

  const updateField = (field: string, value: string | number) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  if (isLoading) {
    return (
      <div className="container mx-auto max-w-4xl space-y-6 px-4 py-8">
        <div className="flex items-center gap-4">
          <Skeleton className="h-10 w-10 animate-pulse" />
          <div className="space-y-2">
            <Skeleton className="h-9 w-64 animate-pulse" />
            <Skeleton className="h-5 w-40 animate-pulse" />
          </div>
        </div>
        <Skeleton className="h-32 animate-pulse" />
        <Skeleton className="h-48 animate-pulse" />
        <Skeleton className="h-64 animate-pulse" />
        <Skeleton className="h-48 animate-pulse" />
      </div>
    );
  }

  if (!pkg) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex h-64 flex-col items-center justify-center">
          <p className="text-muted-foreground">{t('packages.noPackagesFound')}</p>
          <Link href={`/${locale}/closer/packages`}>
            <Button type="button" variant="outline" className="mt-4">
              {t('packages.allPackages')}
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const canEdit = pkg.status === CustomPackageStatus.DRAFT;

  return (
    <div className="container mx-auto max-w-4xl space-y-6 px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between animate-fade-up">
        <div className="flex items-center gap-4">
          <Link href={`/${locale}/closer/packages`}>
            <Button type="button" variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold">{pkg.packageName}</h1>
              {getStatusBadge(pkg.status)}
            </div>
            <p className="text-muted-foreground">
              {t('packageDetail.created')} {new Date(pkg.createdAt).toLocaleDateString()}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          {canEdit && !isEditing && (
            <Button type="button" variant="outline" onClick={() => setIsEditing(true)}>
              {t('packageDetail.editPackage')}
            </Button>
          )}
          {canEdit && (
            <Button type="button" onClick={() => setSendDialogOpen(true)}>
              <Send className="mr-2 h-4 w-4" />
              {t('packages.sendToClient')}
            </Button>
          )}
        </div>
      </div>

      {/* Status Timeline */}
      <Card className="animate-fade-up-fast">
        <CardHeader>
          <CardTitle>{t('packageDetail.timeline')}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="flex flex-col items-center">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground">
                <CheckCircle className="h-5 w-5" />
              </div>
              <span className="mt-2 text-sm">{t('packageDetail.created')}</span>
              <span className="text-xs text-muted-foreground">
                {new Date(pkg.createdAt).toLocaleDateString()}
              </span>
            </div>
            <div className="mx-4 h-0.5 flex-1 bg-muted" />
            <div className="flex flex-col items-center">
              <div
                className={`flex h-10 w-10 items-center justify-center rounded-full ${
                  pkg.sentAt
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-muted-foreground'
                }`}
              >
                <Send className="h-5 w-5" />
              </div>
              <span className="mt-2 text-sm">{t('status.sent')}</span>
              <span className="text-xs text-muted-foreground">
                {pkg.sentAt ? new Date(pkg.sentAt).toLocaleDateString() : '-'}
              </span>
            </div>
            <div className="mx-4 h-0.5 flex-1 bg-muted" />
            <div className="flex flex-col items-center">
              <div
                className={`flex h-10 w-10 items-center justify-center rounded-full ${
                  pkg.viewedAt
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-muted-foreground'
                }`}
              >
                <Eye className="h-5 w-5" />
              </div>
              <span className="mt-2 text-sm">{t('status.viewed')}</span>
              <span className="text-xs text-muted-foreground">
                {pkg.viewedAt ? `${pkg.viewCount} ${t('common.views')}` : '-'}
              </span>
            </div>
            <div className="mx-4 h-0.5 flex-1 bg-muted" />
            <div className="flex flex-col items-center">
              <div
                className={`flex h-10 w-10 items-center justify-center rounded-full ${
                  pkg.status === CustomPackageStatus.PAID
                    ? 'bg-green-500 text-white'
                    : 'bg-muted text-muted-foreground'
                }`}
              >
                <CheckCircle className="h-5 w-5" />
              </div>
              <span className="mt-2 text-sm">{t('status.paid')}</span>
              <span className="text-xs text-muted-foreground">
                {pkg.status === CustomPackageStatus.PAID ? t('status.completed') : '-'}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Payment Link */}
      {pkg.paymentLink && (
        <Card className="animate-fade-up-light-slow">
          <CardHeader>
            <CardTitle>{t('packageDetail.paymentLink')}</CardTitle>
            <CardDescription>{t('packageDetail.paymentLinkDescription')}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Input value={pkg.paymentLink} readOnly className="font-mono text-sm" />
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={() => copyPaymentLink(pkg.paymentLink!)}
              >
                <Copy className="h-4 w-4" />
              </Button>
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={() => window.open(pkg.paymentLink!, '_blank')}
              >
                <ExternalLink className="h-4 w-4" />
              </Button>
            </div>
            {pkg.paymentLinkExpiresAt && (
              <p className="mt-2 text-sm text-muted-foreground">
                <Clock className="mr-1 inline h-4 w-4" />
                {t('packageDetail.expires')}: {new Date(pkg.paymentLinkExpiresAt).toLocaleString()}
              </p>
            )}
          </CardContent>
        </Card>
      )}

      {/* Package Details */}
      <Card className="animate-fade-up-slow">
        <CardHeader>
          <CardTitle>{t('packageDetail.details')}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {isEditing ? (
            <>
              <div className="space-y-2">
                <Label htmlFor="packageName">{t('createPackage.packageName')}</Label>
                <Input
                  id="packageName"
                  value={formData.packageName}
                  onChange={(e) => updateField('packageName', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">{t('createPackage.packageDescription')}</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => updateField('description', e.target.value)}
                  rows={3}
                />
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="credits">{t('createPackage.credits')}</Label>
                  <Input
                    id="credits"
                    type="number"
                    value={formData.credits}
                    onChange={(e) => updateField('credits', parseInt(e.target.value) || 0)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="validityDays">{t('createPackage.validityPeriod')}</Label>
                  <Input
                    id="validityDays"
                    type="number"
                    value={formData.validityDays}
                    onChange={(e) => updateField('validityDays', parseInt(e.target.value) || 0)}
                  />
                </div>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="price">{t('createPackage.price')}</Label>
                  <Input
                    id="price"
                    type="number"
                    step={0.01}
                    value={formData.price}
                    onChange={(e) => updateField('price', parseFloat(e.target.value) || 0)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="currency">{t('createPackage.currency')}</Label>
                  <Select
                    value={formData.currency}
                    onValueChange={(value) => updateField('currency', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="USD">USD</SelectItem>
                      <SelectItem value="EUR">EUR</SelectItem>
                      <SelectItem value="GBP">GBP</SelectItem>
                      <SelectItem value="BRL">BRL</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="specialTerms">{t('createPackage.specialTerms')}</Label>
                <Textarea
                  id="specialTerms"
                  value={formData.specialTerms}
                  onChange={(e) => updateField('specialTerms', e.target.value)}
                  rows={2}
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setIsEditing(false)}>
                  {t('common.cancel')}
                </Button>
                <Button type="button" onClick={handleSave} disabled={updatePackage.isPending}>
                  <Save className="mr-2 h-4 w-4" />
                  {updatePackage.isPending
                    ? t('packageDetail.saving')
                    : t('packageDetail.saveChanges')}
                </Button>
              </div>
            </>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <p className="text-sm text-muted-foreground">{t('common.credits')}</p>
                <p className="font-medium">{pkg.credits}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{t('createPackage.price')}</p>
                <p className="font-medium">{formatCurrency(pkg.price, pkg.currency)}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{t('packageDetail.validityPeriod')}</p>
                <p className="font-medium">
                  {pkg.validityDays} {t('packageDetail.days')}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{t('packageDetail.pricePerCredit')}</p>
                <p className="font-medium">
                  {formatCurrency(pkg.price / pkg.credits, pkg.currency)}
                </p>
              </div>
              {pkg.description && (
                <div className="md:col-span-2">
                  <p className="text-sm text-muted-foreground">
                    {t('createPackage.packageDescription')}
                  </p>
                  <p className="font-medium">{pkg.description}</p>
                </div>
              )}
              {pkg.specialTerms && (
                <div className="md:col-span-2">
                  <p className="text-sm text-muted-foreground">{t('createPackage.specialTerms')}</p>
                  <p className="font-medium">{pkg.specialTerms}</p>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Client Information */}
      <Card className="animate-fade-up-very-slow">
        <CardHeader>
          <CardTitle>{t('packageDetail.clientInfo')}</CardTitle>
        </CardHeader>
        <CardContent>
          {isEditing ? (
            <div className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="clientName">{t('createPackage.clientName')}</Label>
                  <Input
                    id="clientName"
                    value={formData.clientName}
                    onChange={(e) => updateField('clientName', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="clientEmail">{t('createPackage.clientEmail')}</Label>
                  <Input
                    id="clientEmail"
                    type="email"
                    value={formData.clientEmail}
                    onChange={(e) => updateField('clientEmail', e.target.value)}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="clientCompany">{t('createPackage.clientCompany')}</Label>
                <Input
                  id="clientCompany"
                  value={formData.clientCompany}
                  onChange={(e) => updateField('clientCompany', e.target.value)}
                />
              </div>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <p className="text-sm text-muted-foreground">{t('packageDetail.name')}</p>
                <p className="font-medium">{pkg.clientName}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{t('packageDetail.email')}</p>
                <p className="font-medium">{pkg.clientEmail}</p>
              </div>
              {pkg.clientCompany && (
                <div className="md:col-span-2">
                  <p className="text-sm text-muted-foreground">{t('packageDetail.company')}</p>
                  <p className="font-medium">{pkg.clientCompany}</p>
                </div>
              )}
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
              <Textarea
                id="customMessage"
                placeholder={t('packages.sendPackage.customMessagePlaceholder')}
                value={customMessage}
                onChange={(e) => setCustomMessage(e.target.value)}
                rows={3}
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
    </div>
  );
}
