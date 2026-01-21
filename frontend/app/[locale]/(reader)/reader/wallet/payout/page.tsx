'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { DollarSign, Wallet, ArrowLeft } from 'lucide-react';
import { useRouter, useParams } from 'next/navigation';

import { useReaderStats } from '@/hooks/useReaders';
import { useRequestPayout } from '@/hooks/usePayouts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';

const payoutSchema = z.object({
  amount: z.number().min(50, 'Minimum amount is $50'),
  paymentMethod: z.enum(['PayPal', 'Bank Transfer', 'Wise', 'Crypto']),
  notes: z.string().optional(),
  paymentDetails: z.object({
    // PayPal
    paypalEmail: z.string().email().optional(),
    // Bank Transfer
    accountNumber: z.string().optional(),
    routingNumber: z.string().optional(),
    bankName: z.string().optional(),
    accountHolderName: z.string().optional(),
    // Wise
    wiseEmail: z.string().email().optional(),
    // Crypto
    walletAddress: z.string().optional(),
    network: z.string().optional(),
  }),
});

type PayoutFormData = z.infer<typeof payoutSchema>;

export default function RequestPayoutPage() {
  const t = useTranslations('payouts');
  const router = useRouter();
  const params = useParams();
  const locale = (params.locale as string) || 'en';
  const { stats, isLoadingStats: statsLoading } = useReaderStats();
  const { mutate: requestPayout, isPending } = useRequestPayout();

  const [selectedMethod, setSelectedMethod] = useState<string>('');

  const {
    register,
    trigger,
    getValues,
    watch,
    setValue,
    formState: { errors },
  } = useForm<PayoutFormData>({
    resolver: zodResolver(payoutSchema),
    defaultValues: {
      amount: 50,
      paymentMethod: 'PayPal',
      notes: '',
      paymentDetails: {},
    },
  });

  const amount = watch('amount');
  const availableBalance = stats?.walletBalance || 0;

  const handleFormSubmit = async () => {
    const isValid = await trigger();
    if (!isValid) return;

    const data = getValues();
    requestPayout(
      {
        amount: data.amount,
        paymentMethod: data.paymentMethod,
        paymentDetails: data.paymentDetails,
        notes: data.notes,
      },
      {
        onSuccess: () => {
          router.push(`/${locale}/reader/wallet`);
        },
      },
    );
  };

  const renderPaymentFields = () => {
    switch (selectedMethod) {
      case 'PayPal':
        return (
          <div className="animate-fade-up-fast space-y-4">
            <div>
              <Label htmlFor="paypalEmail">{t('paypal.email')}</Label>
              <Input
                id="paypalEmail"
                type="email"
                placeholder={t('paypal.emailPlaceholder')}
                {...register('paymentDetails.paypalEmail')}
                className="mt-1.5"
              />
              {errors.paymentDetails?.paypalEmail && (
                <p className="mt-1 text-sm text-red-500">
                  {errors.paymentDetails.paypalEmail.message}
                </p>
              )}
            </div>
          </div>
        );

      case 'Bank Transfer':
        return (
          <div className="animate-fade-up-fast space-y-4">
            <div>
              <Label htmlFor="accountHolderName">{t('bank.accountHolderName')}</Label>
              <Input
                id="accountHolderName"
                {...register('paymentDetails.accountHolderName')}
                className="mt-1.5"
              />
            </div>
            <div>
              <Label htmlFor="accountNumber">{t('bank.accountNumber')}</Label>
              <Input
                id="accountNumber"
                {...register('paymentDetails.accountNumber')}
                className="mt-1.5"
              />
            </div>
            <div>
              <Label htmlFor="routingNumber">{t('bank.routingNumber')}</Label>
              <Input
                id="routingNumber"
                {...register('paymentDetails.routingNumber')}
                className="mt-1.5"
              />
            </div>
            <div>
              <Label htmlFor="bankName">{t('bank.bankName')}</Label>
              <Input id="bankName" {...register('paymentDetails.bankName')} className="mt-1.5" />
            </div>
          </div>
        );

      case 'Wise':
        return (
          <div className="animate-fade-up-fast space-y-4">
            <div>
              <Label htmlFor="wiseEmail">{t('wise.email')}</Label>
              <Input
                id="wiseEmail"
                type="email"
                placeholder={t('wise.emailPlaceholder')}
                {...register('paymentDetails.wiseEmail')}
                className="mt-1.5"
              />
            </div>
          </div>
        );

      case 'Crypto':
        return (
          <div className="animate-fade-up-fast space-y-4">
            <div>
              <Label htmlFor="walletAddress">{t('crypto.walletAddress')}</Label>
              <Input
                id="walletAddress"
                {...register('paymentDetails.walletAddress')}
                className="mt-1.5"
              />
            </div>
            <div>
              <Label htmlFor="network">{t('crypto.network')}</Label>
              <Input
                id="network"
                placeholder={t('crypto.networkPlaceholder')}
                {...register('paymentDetails.network')}
                className="mt-1.5"
              />
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  if (statsLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 w-1/3 rounded bg-gray-200"></div>
          <div className="h-32 rounded bg-gray-200"></div>
          <div className="h-64 rounded bg-gray-200"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-3xl px-4 py-8">
      {/* Back Button */}
      <span
        onClick={() => router.push(`/${locale}/reader/wallet`)}
        className="mb-6 inline-flex animate-fade-right-fast items-center gap-2 text-sm text-muted-foreground hover:text-foreground cursor-pointer"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Wallet
      </span>

      {/* Page Header */}
      <div className="mb-8 animate-fade-down-fast">
        <h1 className="mb-2 text-3xl font-bold">{t('requestPayout')}</h1>
        <p className="text-muted-foreground">{t('minimumPayout')}</p>
      </div>

      {/* Available Balance Card */}
      <Card className="animate-fade-up-normal mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wallet className="h-5 w-5" />
            {t('availableBalance')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-bold">${availableBalance.toFixed(2)}</span>
            <span className="text-muted-foreground">USD</span>
          </div>
          {availableBalance < 50 && (
            <Alert className="mt-4" variant="destructive">
              <AlertDescription>
                You need at least $50 to request a payout. Current balance: $
                {availableBalance.toFixed(2)}
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Payout Request Form */}
      <Card className="animate-fade-up-slow">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Payout Request
          </CardTitle>
          <CardDescription>Enter the amount and payment details</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* Amount */}
            <div className="animate-fade-right-fast">
              <Label htmlFor="amount">{t('amount')}</Label>
              <div className="relative mt-1.5">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                  $
                </span>
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  min="50"
                  max={availableBalance}
                  {...register('amount', { valueAsNumber: true })}
                  className="pl-8"
                  disabled={availableBalance < 50}
                />
              </div>
              {errors.amount && (
                <p className="mt-1 text-sm text-red-500">{errors.amount.message}</p>
              )}
              {amount > availableBalance && (
                <p className="mt-1 text-sm text-red-500">
                  Amount cannot exceed available balance (${availableBalance.toFixed(2)})
                </p>
              )}
            </div>

            {/* Payment Method */}
            <div className="animate-fade-left-fast">
              <Label htmlFor="paymentMethod">{t('paymentMethod')}</Label>
              <Select
                value={selectedMethod}
                onValueChange={(value) => {
                  setSelectedMethod(value);
                  setValue(
                    'paymentMethod',
                    value as 'PayPal' | 'Bank Transfer' | 'Wise' | 'Crypto',
                  );
                }}
                disabled={availableBalance < 50}
              >
                <SelectTrigger className="mt-1.5">
                  <SelectValue placeholder="Select payment method" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="PayPal">{t('paymentMethods.PayPal')}</SelectItem>
                  <SelectItem value="Bank Transfer">{t('paymentMethods.BankTransfer')}</SelectItem>
                  <SelectItem value="Wise">{t('paymentMethods.Wise')}</SelectItem>
                  <SelectItem value="Crypto">{t('paymentMethods.Crypto')}</SelectItem>
                </SelectContent>
              </Select>
              {errors.paymentMethod && (
                <p className="mt-1 text-sm text-red-500">{errors.paymentMethod.message}</p>
              )}
            </div>

            {/* Payment Details */}
            {selectedMethod && (
              <div>
                <Label className="text-base font-semibold">{t('paymentDetails')}</Label>
                <div className="mt-4">{renderPaymentFields()}</div>
              </div>
            )}

            {/* Notes */}
            <div className="animate-fade-right-normal">
              <Label htmlFor="notes">{t('notes')}</Label>
              <Textarea
                id="notes"
                {...register('notes')}
                placeholder="Any additional notes..."
                className="mt-1.5 min-h-[100px]"
                disabled={availableBalance < 50}
              />
            </div>

            {/* Actions */}
            <div className="flex animate-fade-up-very-slow gap-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
                disabled={isPending}
                className="flex-1"
              >
                {t('cancel')}
              </Button>
              <Button
                type="button"
                onClick={handleFormSubmit}
                disabled={isPending || availableBalance < 50 || amount > availableBalance}
                className="flex-1"
              >
                {isPending ? t('submitting') : t('submit')}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
