'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useCredits } from '@/hooks/useCredits';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Loader2, Check, CreditCard, Star, FileSearch } from 'lucide-react';
import { PackageTier } from '@/lib/api/credits';

export default function CreditPurchasePage() {
  const t = useTranslations('author.credits');
  const { packageTiers, isLoadingPackages, purchaseCredits, isPurchasing, creditBalance } =
    useCredits();
  const [selectedPackage, setSelectedPackage] = useState<string | null>(null);
  const [couponCode, setCouponCode] = useState('');
  const [includeKeywordResearch, setIncludeKeywordResearch] = useState(false);

  // Keyword research price (should come from backend/config)
  const keywordResearchPrice = 49.99;

  const handlePurchase = () => {
    if (selectedPackage) {
      purchaseCredits(
        selectedPackage,
        couponCode || undefined,
        includeKeywordResearch || undefined,
      );
    }
  };

  const getValidityBadgeColor = (days: number) => {
    if (days >= 120) return 'bg-green-500';
    if (days >= 90) return 'bg-blue-500';
    return 'bg-yellow-500';
  };

  return (
    <div className="container mx-auto max-w-7xl px-4 py-8">
      {/* Header */}
      <div className="mb-8 animate-fade-up">
        <h1 className="text-3xl font-bold">{t('title')}</h1>
        <p className="mt-2 text-muted-foreground">{t('subtitle')}</p>
      </div>

      {/* Current Balance */}
      {creditBalance && (
        <Card className="mb-8 animate-fade-up-fast">
          <CardHeader>
            <CardTitle>{t('currentBalance.title')}</CardTitle>
            <CardDescription>{t('currentBalance.description')}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <div>
                <p className="text-sm text-muted-foreground">{t('currentBalance.available')}</p>
                <p className="text-2xl font-bold">{creditBalance.availableCredits}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{t('currentBalance.used')}</p>
                <p className="text-2xl font-bold">{creditBalance.totalCreditsUsed}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{t('currentBalance.expiring')}</p>
                <p className="text-2xl font-bold text-yellow-600">
                  {creditBalance.expiringCredits}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Package Selection */}
      <div className="mb-8 animate-fade-up-slow">
        <h2 className="mb-4 text-2xl font-semibold">{t('packages.title')}</h2>
        <p className="mb-6 text-muted-foreground">{t('packages.description')}</p>

        {isLoadingPackages ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        ) : packageTiers && packageTiers.length > 0 ? (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {packageTiers.map((pkg: PackageTier, index) => {
              const isSelected = selectedPackage === pkg.id;
              const animationClass =
                index % 3 === 0
                  ? 'animate-fade-up'
                  : index % 3 === 1
                    ? 'animate-fade-up-fast'
                    : 'animate-fade-up-light-slow';

              return (
                <Card
                  key={pkg.id}
                  className={`relative cursor-pointer transition-all ${
                    isSelected ? 'shadow-lg ring-2 ring-primary' : 'hover:shadow-md'
                  } ${pkg.isPopular ? 'border-primary' : ''} ${animationClass}`}
                  onClick={() => setSelectedPackage(pkg.id)}
                >
                  {/* Most Popular Badge - per requirements.md Section 2.2 */}
                  {pkg.isPopular && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                      <Badge className="bg-primary px-3 py-1">
                        <Star className="mr-1 h-3 w-3" />
                        {t('packages.mostPopular') || 'Most Popular'}
                      </Badge>
                    </div>
                  )}
                  <CardHeader className={pkg.isPopular ? 'pt-6' : ''}>
                    <div className="flex items-start justify-between">
                      <CardTitle className="text-xl">{pkg.name}</CardTitle>
                      {isSelected && <Check className="h-5 w-5 text-primary" />}
                    </div>
                    <CardDescription>{pkg.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="mb-4">
                      <p className="text-3xl font-bold">
                        ${pkg.basePrice}
                        <span className="ml-2 text-base font-normal text-muted-foreground">
                          {pkg.currency}
                        </span>
                      </p>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {pkg.credits} {t('packages.credits')}
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Badge className={getValidityBadgeColor(pkg.validityDays)}>
                        {t('packages.validityDays', { days: pkg.validityDays })}
                      </Badge>

                      {pkg.features && pkg.features.length > 0 && (
                        <ul className="mt-4 space-y-1">
                          {pkg.features.map((feature, idx) => (
                            <li key={idx} className="flex items-start text-sm">
                              <Check className="mr-2 mt-0.5 h-4 w-4 flex-shrink-0 text-green-500" />
                              <span>{feature}</span>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button type="button" className="w-full" variant={isSelected ? 'default' : 'outline'}>
                      {isSelected ? t('packages.selected') : t('packages.select')}
                    </Button>
                  </CardFooter>
                </Card>
              );
            })}
          </div>
        ) : (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground">{t('packages.noPackages')}</p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Coupon Code */}
      {selectedPackage && (
        <Card className="mb-8 animate-zoom-in">
          <CardHeader>
            <CardTitle>{t('coupon.title')}</CardTitle>
            <CardDescription>{t('coupon.description')}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4">
              <div className="flex-1">
                <Label htmlFor="coupon">{t('coupon.label')}</Label>
                <Input
                  id="coupon"
                  placeholder={t('coupon.placeholder')}
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                  className="mt-1"
                />
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Keyword Research Upsell - per requirements.md Section 2.2 Step 3 */}
      {selectedPackage && (
        <Card className="mb-8 animate-zoom-in-fast">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileSearch className="h-5 w-5 text-primary" />
              {t('keywordResearch.title') || 'Add Keyword Research'}
            </CardTitle>
            <CardDescription>
              {t('keywordResearch.description') ||
                'Professional keyword analysis to optimize your book visibility on Amazon'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-start space-x-3">
              <Checkbox
                id="keywordResearch"
                checked={includeKeywordResearch}
                onCheckedChange={(checked) => setIncludeKeywordResearch(checked === true)}
              />
              <div className="flex-1">
                <Label
                  htmlFor="keywordResearch"
                  className="cursor-pointer text-base font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  {t('keywordResearch.addLabel') || 'Include Keyword Research Service'}
                </Label>
                <p className="mt-1 text-sm text-muted-foreground">
                  {t('keywordResearch.benefits') ||
                    'Get targeted keywords, category suggestions, and SEO optimization for your book listing'}
                </p>
              </div>
              <div className="text-right">
                <p className="text-xl font-bold text-primary">+${keywordResearchPrice}</p>
                <p className="text-xs text-muted-foreground">
                  {t('keywordResearch.oneTime') || 'One-time fee'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Order Summary */}
      {selectedPackage && (
        <Card className="mb-8 animate-fade-right">
          <CardHeader>
            <CardTitle>{t('orderSummary.title') || 'Order Summary'}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {packageTiers && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">
                    {packageTiers.find((p) => p.id === selectedPackage)?.name || 'Credit Package'}
                  </span>
                  <span className="font-medium">
                    ${packageTiers.find((p) => p.id === selectedPackage)?.basePrice || 0}
                  </span>
                </div>
              )}
              {includeKeywordResearch && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">
                    {t('keywordResearch.title') || 'Keyword Research'}
                  </span>
                  <span className="font-medium">${keywordResearchPrice}</span>
                </div>
              )}
              {couponCode && (
                <div className="flex justify-between text-green-600">
                  <span>
                    {t('orderSummary.coupon') || 'Coupon'}: {couponCode}
                  </span>
                  <span>{t('orderSummary.appliedAtCheckout') || 'Applied at checkout'}</span>
                </div>
              )}
              <div className="border-t pt-3">
                <div className="flex justify-between text-lg font-bold">
                  <span>{t('orderSummary.total') || 'Total'}</span>
                  <span>
                    $
                    {(
                      (packageTiers?.find((p) => p.id === selectedPackage)?.basePrice || 0) +
                      (includeKeywordResearch ? keywordResearchPrice : 0)
                    ).toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Purchase Button */}
      {selectedPackage && (
        <div className="flex animate-fade-left justify-end">
          <Button type="button" size="lg" onClick={handlePurchase} disabled={isPurchasing}>
            {isPurchasing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {t('checkout.processing')}
              </>
            ) : (
              <>
                <CreditCard className="mr-2 h-4 w-4" />
                {t('checkout.button')}
              </>
            )}
          </Button>
        </div>
      )}

      {/* Info Section */}
      <div className="mt-12 animate-fade-up-very-slow">
        <Card>
          <CardHeader>
            <CardTitle>{t('info.title')}</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm">
              <li className="flex items-start">
                <Check className="mr-2 mt-0.5 h-4 w-4 flex-shrink-0 text-green-500" />
                <span>{t('info.ebook')}</span>
              </li>
              <li className="flex items-start">
                <Check className="mr-2 mt-0.5 h-4 w-4 flex-shrink-0 text-green-500" />
                <span>{t('info.audiobook')}</span>
              </li>
              <li className="flex items-start">
                <Check className="mr-2 mt-0.5 h-4 w-4 flex-shrink-0 text-green-500" />
                <span>{t('info.validity')}</span>
              </li>
              <li className="flex items-start">
                <Check className="mr-2 mt-0.5 h-4 w-4 flex-shrink-0 text-green-500" />
                <span>{t('info.secure')}</span>
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
