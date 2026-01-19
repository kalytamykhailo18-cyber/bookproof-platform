'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { usePayoutsForAdmin, useProcessPayout } from '@/hooks/useAffiliates';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
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
import {
  Loader2,
  CheckCircle,
  XCircle,
  ArrowLeft,
  DollarSign,
  Clock,
  CheckCircle2,
  AlertCircle,
  Filter,
} from 'lucide-react';
import { formatDate } from '@/lib/utils';
import { PayoutAction, PayoutRequestStatus, PayoutResponseDto } from '@/lib/api/affiliates';

const processPayoutSchema = z
  .object({
    action: z.nativeEnum(PayoutAction),
    transactionId: z.string().optional(),
    rejectionReason: z.string().optional(),
    notes: z.string().optional(),
  })
  .refine(
    (data) => {
      if (data.action === PayoutAction.REJECT && !data.rejectionReason) {
        return false;
      }
      return true;
    },
    {
      message: 'Rejection reason is required when rejecting',
      path: ['rejectionReason'],
    },
  );

type ProcessPayoutFormData = z.infer<typeof processPayoutSchema>;

export default function AdminAffiliatePayoutsPage() {
  const t = useTranslations('adminAffiliatePayouts');
  const [statusFilter, setStatusFilter] = useState<PayoutRequestStatus | undefined>(undefined);
  const [selectedPayout, setSelectedPayout] = useState<PayoutResponseDto | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [actionType, setActionType] = useState<'approve' | 'reject' | 'complete'>('approve');

  const { data: payouts, isLoading } = usePayoutsForAdmin(statusFilter);
  const processMutation = useProcessPayout();

  const form = useForm<ProcessPayoutFormData>({
    resolver: zodResolver(processPayoutSchema),
    defaultValues: {
      action: PayoutAction.APPROVE,
      transactionId: '',
      rejectionReason: '',
      notes: '',
    },
  });

  const openDialog = (payout: PayoutResponseDto, action: 'approve' | 'reject' | 'complete') => {
    setSelectedPayout(payout);
    setActionType(action);
    setDialogOpen(true);

    let actionEnum: PayoutAction;
    if (action === 'approve') actionEnum = PayoutAction.APPROVE;
    else if (action === 'reject') actionEnum = PayoutAction.REJECT;
    else actionEnum = PayoutAction.COMPLETE;

    form.reset({
      action: actionEnum,
      transactionId: '',
      rejectionReason: '',
      notes: '',
    });
  };

  const handleSubmit = async () => {
    if (!selectedPayout) return;

    const isValid = await form.trigger();
    if (!isValid) return;

    const data = form.getValues();
    await processMutation.mutateAsync({
      id: selectedPayout.id,
      data,
    });

    setDialogOpen(false);
    setSelectedPayout(null);
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

  const canApprove = (payout: PayoutResponseDto) => payout.status === PayoutRequestStatus.REQUESTED;
  const canReject = (payout: PayoutResponseDto) => payout.status === PayoutRequestStatus.REQUESTED;
  const canComplete = (payout: PayoutResponseDto) =>
    payout.status === PayoutRequestStatus.APPROVED ||
    payout.status === PayoutRequestStatus.PROCESSING;

  if (isLoading) {
    return (
      <div className="container mx-auto space-y-6 p-6">
        <Skeleton className="h-6 w-32 animate-pulse" />
        <div className="space-y-2">
          <Skeleton className="h-9 w-64 animate-pulse" />
          <Skeleton className="h-5 w-48 animate-pulse" />
        </div>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-5">
          {[1, 2, 3, 4, 5].map((i) => (
            <Skeleton key={i} className="h-28 animate-pulse" />
          ))}
        </div>
        <Skeleton className="h-24 animate-pulse" />
        <Skeleton className="h-96 animate-pulse" />
      </div>
    );
  }

  return (
    <div className="container mx-auto space-y-6 p-6">
      {/* Back Button */}
      <div className="animate-fade-right">
        <Button type="button" variant="ghost" size="sm" asChild>
          <Link href="/admin/affiliates">
            <ArrowLeft className="mr-2 h-4 w-4" />
            {t('backToAffiliates')}
          </Link>
        </Button>
      </div>

      {/* Header */}
      <div className="animate-fade-up">
        <h1 className="text-3xl font-bold">{t('title')}</h1>
        <p className="text-muted-foreground">{t('subtitle')}</p>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-5">
        <Card className="animate-fade-up-fast">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('stats.total')}</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${payouts?.reduce((sum, p) => sum + p.amount, 0).toFixed(2) || '0.00'}
            </div>
            <p className="text-xs text-muted-foreground">{t('stats.totalPending')}</p>
          </CardContent>
        </Card>

        <Card className="animate-fade-up-light-slow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('stats.requested')}</CardTitle>
            <Clock className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {payouts?.filter((p) => p.status === PayoutRequestStatus.REQUESTED).length || 0}
            </div>
            <p className="text-xs text-muted-foreground">{t('stats.awaitingReview')}</p>
          </CardContent>
        </Card>

        <Card className="animate-fade-up-medium-slow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('stats.approved')}</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {payouts?.filter((p) => p.status === PayoutRequestStatus.APPROVED).length || 0}
            </div>
            <p className="text-xs text-muted-foreground">{t('stats.readyToProcess')}</p>
          </CardContent>
        </Card>

        <Card className="animate-fade-up-heavy-slow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('stats.completed')}</CardTitle>
            <CheckCircle className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {payouts?.filter((p) => p.status === PayoutRequestStatus.COMPLETED).length || 0}
            </div>
            <p className="text-xs text-muted-foreground">{t('stats.paidOut')}</p>
          </CardContent>
        </Card>

        <Card className="animate-fade-up-extra-slow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('stats.rejected')}</CardTitle>
            <AlertCircle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {payouts?.filter((p) => p.status === PayoutRequestStatus.REJECTED).length || 0}
            </div>
            <p className="text-xs text-muted-foreground">{t('stats.declined')}</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="animate-zoom-in">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            {t('filters.title')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="w-48 animate-fade-left-fast">
            <Select
              value={statusFilter || 'all'}
              onValueChange={(value) =>
                setStatusFilter(value === 'all' ? undefined : (value as PayoutRequestStatus))
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('filters.allStatuses')}</SelectItem>
                <SelectItem value={PayoutRequestStatus.REQUESTED}>
                  {t('status.requested')}
                </SelectItem>
                <SelectItem value={PayoutRequestStatus.APPROVED}>{t('status.approved')}</SelectItem>
                <SelectItem value={PayoutRequestStatus.PROCESSING}>
                  {t('status.processing')}
                </SelectItem>
                <SelectItem value={PayoutRequestStatus.COMPLETED}>
                  {t('status.completed')}
                </SelectItem>
                <SelectItem value={PayoutRequestStatus.REJECTED}>{t('status.rejected')}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Payouts Table */}
      <Card className="animate-zoom-in-slow">
        <CardContent className="pt-6">
          {!payouts || payouts.length === 0 ? (
            <div className="animate-fade-up py-16 text-center">
              <AlertCircle className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
              <h3 className="text-lg font-semibold">{t('empty.title')}</h3>
              <p className="text-muted-foreground">{t('empty.description')}</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t('table.affiliate')}</TableHead>
                  <TableHead>{t('table.amount')}</TableHead>
                  <TableHead>{t('table.method')}</TableHead>
                  <TableHead>{t('table.status')}</TableHead>
                  <TableHead>{t('table.requestedAt')}</TableHead>
                  <TableHead>{t('table.processedAt')}</TableHead>
                  <TableHead>{t('table.transactionId')}</TableHead>
                  <TableHead className="text-right">{t('table.actions')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {payouts.map((payout, index) => (
                  <TableRow
                    key={payout.id}
                    className={`animate-fade-up-${['fast', 'light-slow', 'medium-slow', 'heavy-slow'][index % 4]}`}
                  >
                    <TableCell>
                      <div>
                        <p className="font-medium">{payout.affiliateProfile?.user?.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {payout.affiliateProfile?.user?.email}
                        </p>
                      </div>
                    </TableCell>
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
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        {canApprove(payout) && (
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => openDialog(payout, 'approve')}
                          >
                            <CheckCircle className="mr-1 h-4 w-4" />
                            {t('actions.approve')}
                          </Button>
                        )}
                        {canReject(payout) && (
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => openDialog(payout, 'reject')}
                          >
                            <XCircle className="mr-1 h-4 w-4" />
                            {t('actions.reject')}
                          </Button>
                        )}
                        {canComplete(payout) && (
                          <Button
                            type="button"
                            variant="default"
                            size="sm"
                            onClick={() => openDialog(payout, 'complete')}
                          >
                            <CheckCircle className="mr-1 h-4 w-4" />
                            {t('actions.complete')}
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Process Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {actionType === 'approve' && t('dialog.approveTitle')}
              {actionType === 'reject' && t('dialog.rejectTitle')}
              {actionType === 'complete' && t('dialog.completeTitle')}
            </DialogTitle>
            <DialogDescription>
              {selectedPayout && (
                <>
                  {t('dialog.amount')}: ${selectedPayout.amount.toFixed(2)} -{' '}
                  {selectedPayout.paymentMethod}
                </>
              )}
            </DialogDescription>
          </DialogHeader>

          <Form {...form}>
            <div className="space-y-4">
              {actionType === 'reject' && (
                <FormField
                  control={form.control}
                  name="rejectionReason"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('dialog.rejectionReasonLabel')}</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder={t('dialog.rejectionReasonPlaceholder')}
                          rows={4}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              {actionType === 'complete' && (
                <FormField
                  control={form.control}
                  name="transactionId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('dialog.transactionIdLabel')}</FormLabel>
                      <FormControl>
                        <Input placeholder={t('dialog.transactionIdPlaceholder')} {...field} />
                      </FormControl>
                      <FormDescription>{t('dialog.transactionIdDescription')}</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('dialog.notesLabel')}</FormLabel>
                    <FormControl>
                      <Textarea placeholder={t('dialog.notesPlaceholder')} rows={3} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button
                type="button"
                className="w-full"
                variant={actionType === 'reject' ? 'destructive' : 'default'}
                onClick={handleSubmit}
                disabled={processMutation.isPending}
              >
                {processMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {t('dialog.submitting')}
                  </>
                ) : (
                  t('dialog.confirm')
                )}
              </Button>
            </div>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
