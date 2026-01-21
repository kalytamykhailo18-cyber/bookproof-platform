'use client';

import { useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useCreatePackage } from '@/hooks/useCloser';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ArrowLeft, Save } from 'lucide-react';

export default function CreatePackagePage() {
  const t = useTranslations('closer');
  const router = useRouter();
  const params = useParams();
  const locale = params.locale as string;
  const createPackage = useCreatePackage();

  const [formData, setFormData] = useState({
    packageName: '',
    description: '',
    credits: 100,
    price: 500,
    currency: 'USD',
    validityDays: 90,
    specialTerms: '',
    clientName: '',
    clientEmail: '',
    clientCompany: '',
  });

  const handleFormSubmit = () => {
    createPackage.mutate(
      {
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
      {
        onSuccess: () => {
          router.push(`/${locale}/closer/packages`);
        },
      },
    );
  };

  const updateField = (field: string, value: string | number) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  // Calculate price per credit
  const pricePerCredit =
    formData.credits > 0 ? (formData.price / formData.credits).toFixed(2) : '0.00';

  return (
    <div className="container mx-auto max-w-3xl space-y-6 px-4 py-8">
      {/* Header */}
      <div className="flex animate-fade-up items-center gap-4">
        <Button type="button" variant="ghost" size="icon" onClick={() => router.push(`/${locale}/closer/packages`)}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold">{t('createPackage.title')}</h1>
          <p className="text-muted-foreground">{t('createPackage.description')}</p>
        </div>
      </div>

      <div>
        <div className="space-y-6">
          {/* Package Details */}
          <Card className="animate-fade-up-fast">
            <CardHeader>
              <CardTitle>{t('createPackage.packageDetails')}</CardTitle>
              <CardDescription>{t('createPackage.packageDetailsDescription')}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="packageName">{t('createPackage.packageName')} *</Label>
                <Input
                  id="packageName"
                  placeholder={t('createPackage.packageNamePlaceholder')}
                  value={formData.packageName}
                  onChange={(e) => updateField('packageName', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">{t('createPackage.packageDescription')}</Label>
                <Textarea
                  id="description"
                  placeholder={t('createPackage.packageDescriptionPlaceholder')}
                  value={formData.description}
                  onChange={(e) => updateField('description', e.target.value)}
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          {/* Pricing */}
          <Card className="animate-fade-up-light-slow">
            <CardHeader>
              <CardTitle>{t('createPackage.pricing')}</CardTitle>
              <CardDescription>{t('createPackage.pricingDescription')}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="credits">{t('createPackage.credits')} *</Label>
                  <Input
                    id="credits"
                    type="number"
                    min={1}
                    value={formData.credits}
                    onChange={(e) => updateField('credits', parseInt(e.target.value) || 0)}
                  />
                  <p className="text-xs text-muted-foreground">{t('createPackage.creditsHelp')}</p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="validityDays">{t('createPackage.validityPeriod')} *</Label>
                  <Select
                    value={formData.validityDays.toString()}
                    onValueChange={(value) => updateField('validityDays', parseInt(value))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="30">30 {t('packageDetail.days')}</SelectItem>
                      <SelectItem value="60">60 {t('packageDetail.days')}</SelectItem>
                      <SelectItem value="90">90 {t('packageDetail.days')}</SelectItem>
                      <SelectItem value="120">120 {t('packageDetail.days')}</SelectItem>
                      <SelectItem value="180">180 {t('packageDetail.days')}</SelectItem>
                      <SelectItem value="365">365 {t('packageDetail.days')}</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">{t('createPackage.validityHelp')}</p>
                </div>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="price">{t('createPackage.price')} *</Label>
                  <Input
                    id="price"
                    type="number"
                    min={0}
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
                      <SelectItem value="USD">USD - US Dollar</SelectItem>
                      <SelectItem value="EUR">EUR - Euro</SelectItem>
                      <SelectItem value="GBP">GBP - British Pound</SelectItem>
                      <SelectItem value="BRL">BRL - Brazilian Real</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="rounded-lg bg-muted p-4">
                <p className="text-sm">
                  <span className="font-medium">{t('createPackage.pricePerCredit')}:</span>{' '}
                  {formData.currency} {pricePerCredit}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Client Information */}
          <Card className="animate-fade-up-slow">
            <CardHeader>
              <CardTitle>{t('createPackage.clientInfo')}</CardTitle>
              <CardDescription>{t('createPackage.clientInfoDescription')}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="clientName">{t('createPackage.clientName')} *</Label>
                  <Input
                    id="clientName"
                    placeholder="John Doe"
                    value={formData.clientName}
                    onChange={(e) => updateField('clientName', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="clientEmail">{t('createPackage.clientEmail')} *</Label>
                  <Input
                    id="clientEmail"
                    type="email"
                    placeholder="john@publisher.com"
                    value={formData.clientEmail}
                    onChange={(e) => updateField('clientEmail', e.target.value)}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="clientCompany">{t('createPackage.clientCompany')}</Label>
                <Input
                  id="clientCompany"
                  placeholder="XYZ Publishing House"
                  value={formData.clientCompany}
                  onChange={(e) => updateField('clientCompany', e.target.value)}
                />
              </div>
            </CardContent>
          </Card>

          {/* Special Terms */}
          <Card className="animate-fade-up-very-slow">
            <CardHeader>
              <CardTitle>{t('createPackage.specialTerms')}</CardTitle>
              <CardDescription>{t('createPackage.specialTermsDescription')}</CardDescription>
            </CardHeader>
            <CardContent>
              <Textarea
                id="specialTerms"
                placeholder={t('createPackage.specialTermsPlaceholder')}
                value={formData.specialTerms}
                onChange={(e) => updateField('specialTerms', e.target.value)}
                rows={4}
              />
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex animate-fade-up justify-end gap-4">
            <Button type="button" variant="outline" onClick={() => router.push(`/${locale}/closer/packages`)}>
              {t('createPackage.cancel')}
            </Button>
            <Button type="button" onClick={handleFormSubmit} disabled={createPackage.isPending}>
              <Save className="mr-2 h-4 w-4" />
              {createPackage.isPending ? t('createPackage.creating') : t('createPackage.create')}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
