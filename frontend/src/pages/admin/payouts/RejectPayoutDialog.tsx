import { useState } from 'react';
import { useTranslation } from 'node_modules/react-i18next';
import { PayoutResponse } from '@/lib/api/payouts';
import { useRejectPayout } from '@/hooks/usePayouts';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Loader2 } from 'lucide-react';

interface RejectPayoutDialogProps {
  payout: PayoutResponse;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function RejectPayoutDialog({
  payout,
  open,
  onOpenChange }: RejectPayoutDialogProps) {
  const { t } = useTranslation('admin-payouts');
  const { mutate: rejectPayout, isPending } = useRejectPayout();
  const [reason, setReason] = useState('');
  const [error, setError] = useState('');

  const handleReject = () => {
    if (reason.trim().length < 10) {
      setError(t('reject.validation.reasonMinLength'));
      return;
    }

    rejectPayout(
      { id: payout.id, data: { reason } },
      {
        onSuccess: () => {
          setReason('');
          setError('');
          onOpenChange(false);
        } },
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t('dialog.rejectTitle')}</DialogTitle>
          <DialogDescription>
            Reject payout request of ${payout.amount.toFixed(2)} for reader {payout.readerProfileId}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="reason">
              {t('reject.reasonLabel')} <span className="text-red-500">*</span>
            </Label>
            <Textarea
              id="reason"
              value={reason}
              onChange={(e) => {
                setReason(e.target.value);
                setError('');
              }}
              placeholder={t('reject.reasonPlaceholder')}
              rows={4}
              className={error ? 'border-red-500' : ''}
            />
            {error && <p className="text-sm text-red-500">{error}</p>}
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => {
              setReason('');
              setError('');
              onOpenChange(false);
            }}
            disabled={isPending}
          >
            {t('reject.cancelButton')}
          </Button>
          <Button
            variant="destructive"
            onClick={handleReject}
            disabled={isPending || reason.trim().length < 10}
          >
            {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : t('reject.confirmButton')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
