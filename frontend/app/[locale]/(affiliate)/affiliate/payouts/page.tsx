'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useAffiliateStats, usePayouts, useRequestPayout } from '@/hooks/useAffiliates';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Loader2, Wallet, AlertCircle } from 'lucide-react';
import { formatDate } from '@/lib/utils';
import { PaymentMethod, PayoutRequestStatus } from '@/lib/api/affiliates';
import { Alert, AlertDescription } from '@/components/ui/alert';

const requestPayoutSchema = z.object({
  amount: z.coerce.number().min(50, { message: 'Minimum payout is $50' }),
  paymentMethod: z.nativeEnum(PaymentMethod),
  paymentDetails: z.string().min(5, { message: 'Please provide payment details' }),
  notes: z.string().optional(),
});

type RequestPayoutFormData = z.infer<typeof requestPayoutSchema>;

export default function AffiliatePayoutsPage() {
  const t = useTranslations('affiliates.payouts');
  const [dialogOpen, setDialogOpen] = useState(false);

  const { data: stats, isLoading: statsLoading } = useAffiliateStats();
  const { data: payouts, isLoading: payoutsLoading } = usePayouts();
  const requestMutation = useRequestPayout();

  const form = useForm<RequestPayoutFormData>({
    resolver: zodResolver(requestPayoutSchema),
    defaultValues: {
      amount: 0,
      paymentMethod: PaymentMethod.PAYPAL,
      paymentDetails: '',
      notes: '',
    },
  });

  const handleSubmit = async () => {
    const isValid = await form.trigger();
    if (!isValid) return;

    const data = form.getValues();
    await requestMutation.mutateAsync(data);
    setDialogOpen(false);
    form.reset();
  };

  const getPayoutStatusBadge = (status: PayoutRequestStatus) => {
    const colors: Record<PayoutRequestStatus, string> = {
      REQUESTED: 'bg-yellow-100 text-yellow-800',
      PENDING_REVIEW: 'bg-blue-100 text-blue-800',
      APPROVED: 'bg-green-100 text-green-800',
      PROCESSING: 'bg-blue-100 text-blue-800',
      COMPLETED: 'bg-green-100 text-green-800',
      REJECTED: 'bg-red-100 text-red-800',
      CANCELLED: 'bg-gray-100 text-gray-800',
    };
    return <Badge className={colors[status]}>{t(`status.${status.toLowerCase()}`)}</Badge>;
  };

  const hasPendingPayout = payouts?.some(
    (p) =>
      p.status === PayoutRequestStatus.REQUESTED ||
      p.status === PayoutRequestStatus.PENDING_REVIEW ||
      p.status === PayoutRequestStatus.APPROVED ||
      p.status === PayoutRequestStatus.PROCESSING,
  );

  if (statsLoading || payoutsLoading) {
    return (
      <div className="container mx-auto max-w-7xl space-y-6 px-4 py-8">
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <Skeleton className="h-9 w-32 animate-pulse" />
            <Skeleton className="h-5 w-80 animate-pulse" />
          </div>
          <Skeleton className="h-10 w-40 animate-pulse" />
        </div>
        <Skeleton className="h-32 animate-pulse" />
        <Skeleton className="h-64 animate-pulse" />
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-7xl space-y-6 px-4 py-8">
      {/* Header */}
      <div className="flex animate-fade-up items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold">{t('title')}</h1>
          <p className="mt-2 text-muted-foreground">{t('description')}</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button
              type="button"
              disabled={hasPendingPayout || (stats?.approvedEarnings || 0) < 50}
            >
              <Wallet className="mr-2 h-4 w-4" />
              {t('requestPayout')}
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>{t('request.title')}</DialogTitle>
              <DialogDescription>{t('request.description')}</DialogDescription>
            </DialogHeader>

            <Form {...form}>
              <div className="space-y-4">
                <div className="rounded-lg bg-muted p-4">
                  <p className="text-sm font-medium">{t('request.availableBalance')}</p>
                  <p className="text-2xl font-bold">
                    ${stats?.approvedEarnings.toFixed(2) || '0.00'}
                  </p>
                </div>

                <FormField
                  control={form.control}
                  name="amount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('request.form.amount.label')}</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.01" placeholder="50.00" {...field} />
                      </FormControl>
                      <FormDescription>{t('request.form.amount.description')}</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="paymentMethod"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('request.form.paymentMethod.label')}</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value={PaymentMethod.PAYPAL}>PayPal</SelectItem>
                          <SelectItem value={PaymentMethod.BANK_TRANSFER}>
                            {t('request.form.paymentMethod.bankTransfer')}
                          </SelectItem>
                          <SelectItem value={PaymentMethod.WISE}>Wise</SelectItem>
                          <SelectItem value={PaymentMethod.CRYPTO}>
                            {t('request.form.paymentMethod.crypto')}
                          </SelectItem>
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        {t('request.form.paymentMethod.description')}
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="paymentDetails"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('request.form.paymentDetails.label')}</FormLabel>
                      <FormControl>
                        <Input
                          placeholder={t('request.form.paymentDetails.placeholder')}
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        {t('request.form.paymentDetails.description')}
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="notes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('request.form.notes.label')}</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder={t('request.form.notes.placeholder')}
                          rows={3}
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>{t('request.form.notes.description')}</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button
                  type="button"
                  className="w-full"
                  onClick={handleSubmit}
                  disabled={requestMutation.isPending}
                >
                  {requestMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      {t('request.form.submitting')}
                    </>
                  ) : (
                    t('request.form.submit')
                  )}
                </Button>
              </div>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Balance Card */}
      <Card className="animate-fade-up-fast">
        <CardHeader>
          <CardTitle>{t('balance.title')}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div>
              <p className="text-sm text-muted-foreground">{t('balance.approved')}</p>
              <p className="text-2xl font-bold text-green-600">
                ${stats?.approvedEarnings.toFixed(2) || '0.00'}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">{t('balance.pending')}</p>
              <p className="text-2xl font-bold text-yellow-600">
                ${stats?.pendingEarnings.toFixed(2) || '0.00'}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">{t('balance.paid')}</p>
              <p className="text-2xl font-bold text-blue-600">
                ${stats?.paidEarnings.toFixed(2) || '0.00'}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {hasPendingPayout && (
        <Alert className="animate-fade-up">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{t('pendingPayoutNotice')}</AlertDescription>
        </Alert>
      )}

      {/* Payouts History */}
      <Card className="animate-zoom-in-slow">
        <CardHeader>
          <CardTitle>{t('history.title')}</CardTitle>
          <CardDescription>{t('history.description')}</CardDescription>
        </CardHeader>
        <CardContent>
          {!payouts || payouts.length === 0 ? (
            <div className="py-12 text-center text-muted-foreground">
              <Wallet className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
              <p>{t('history.empty')}</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t('history.table.amount')}</TableHead>
                  <TableHead>{t('history.table.method')}</TableHead>
                  <TableHead>{t('history.table.status')}</TableHead>
                  <TableHead>{t('history.table.requestedAt')}</TableHead>
                  <TableHead>{t('history.table.processedAt')}</TableHead>
                  <TableHead>{t('history.table.transactionId')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {payouts.map((payout, index) => (
                  <TableRow
                    key={payout.id}
                    className={`animate-fade-up-${index % 2 === 0 ? 'fast' : 'light-slow'}`}
                  >
                    <TableCell className="font-semibold">${payout.amount.toFixed(2)}</TableCell>
                    <TableCell>{payout.paymentMethod}</TableCell>
                    <TableCell>{getPayoutStatusBadge(payout.status)}</TableCell>
                    <TableCell>{formatDate(payout.requestedAt)}</TableCell>
                    <TableCell>
                      {payout.processedAt ? formatDate(payout.processedAt) : '-'}
                    </TableCell>
                    <TableCell className="font-mono text-sm">
                      {payout.transactionId || '-'}
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
