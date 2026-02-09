import { useTranslation } from 'react-i18next';
import { format } from 'date-fns';
import { PayoutResponse } from '@/lib/api/payouts';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

interface PayoutDetailsDialogProps {
  payout: PayoutResponse;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function PayoutDetailsDialog({
  payout,
  open,
  onOpenChange }: PayoutDetailsDialogProps) {
  const { t, i18n } = useTranslation('admin-payouts');

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{t('dialog.detailsTitle')}</DialogTitle>
          <DialogDescription>Request ID: {payout.id}</DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Status */}
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">{t('fields.status')}:</span>
            <Badge
              variant={
                payout.status === 'COMPLETED'
                  ? 'default'
                  : payout.status === 'REJECTED'
                    ? 'destructive'
                    : payout.status === 'APPROVED'
                      ? 'secondary'
                      : 'outline'
              }
            >
              {t(`status.${payout.status}`)}
            </Badge>
          </div>

          <Separator />

          {/* Reader Information */}
          <div className="space-y-3">
            <h3 className="font-semibold">Reader Information</h3>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <span className="text-muted-foreground">{t('fields.readerName')}:</span>
                <p className="font-medium">{payout.readerProfileId}</p>
              </div>
            </div>
          </div>

          <Separator />

          {/* Payment Information */}
          <div className="space-y-3">
            <h3 className="font-semibold">Payment Information</h3>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <span className="text-muted-foreground">{t('fields.amount')}:</span>
                <p className="text-lg font-medium">${payout.amount.toFixed(2)}</p>
              </div>
              <div>
                <span className="text-muted-foreground">{t('fields.paymentMethod')}:</span>
                <p className="font-medium">{payout.paymentMethod}</p>
              </div>
            </div>
          </div>

          {/* Payment Details */}
          {payout.paymentDetails && (
            <>
              <Separator />
              <div className="space-y-3">
                <h3 className="font-semibold">{t('fields.paymentDetails')}</h3>
                <div className="rounded-md bg-muted p-4">
                  <pre className="whitespace-pre-wrap text-sm">
                    {JSON.stringify(payout.paymentDetails, null, 2)}
                  </pre>
                </div>
              </div>
            </>
          )}

          <Separator />

          {/* Timeline */}
          <div className="space-y-3">
            <h3 className="font-semibold">Timeline</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">{t('fields.requestedAt')}:</span>
                <span className="font-medium">{format(new Date(payout.requestedAt), 'PPpp')}</span>
              </div>
              {payout.processedAt && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">{t('fields.processedAt')}:</span>
                  <span className="font-medium">
                    {format(new Date(payout.processedAt), 'PPpp')}
                  </span>
                </div>
              )}
              {payout.paidAt && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Paid Date:</span>
                  <span className="font-medium">{format(new Date(payout.paidAt), 'PPpp')}</span>
                </div>
              )}
            </div>
          </div>

          {/* Transaction ID */}
          {payout.transactionId && (
            <>
              <Separator />
              <div className="space-y-2">
                <span className="text-sm text-muted-foreground">{t('fields.transactionId')}:</span>
                <code className="block rounded bg-muted px-3 py-2 text-sm">
                  {payout.transactionId}
                </code>
              </div>
            </>
          )}

          {/* Notes */}
          {payout.notes && (
            <>
              <Separator />
              <div className="space-y-2">
                <span className="text-sm text-muted-foreground">{t('fields.adminNotes')}:</span>
                <div className="rounded bg-muted px-3 py-2 text-sm">{payout.notes}</div>
              </div>
            </>
          )}

          {/* Rejection Reason */}
          {payout.rejectionReason && (
            <>
              <Separator />
              <div className="space-y-2">
                <span className="text-sm text-muted-foreground">
                  {t('fields.rejectionReason')}:
                </span>
                <div className="rounded border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                  {payout.rejectionReason}
                </div>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
