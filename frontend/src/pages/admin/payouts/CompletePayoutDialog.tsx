import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { PayoutResponse, completePayout as completePayoutApi } from '@/lib/api/payouts';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Loader2 } from 'lucide-react';

interface CompletePayoutDialogProps {
  payout: PayoutResponse;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onRefetch: () => void;
}

export default function CompletePayoutDialog({
  payout,
  open,
  onOpenChange,
  onRefetch }: CompletePayoutDialogProps) {
  const { t, i18n } = useTranslation('admin-payouts');
  const [transactionId, setTransactionId] = useState('');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState('');
  const [isPending, setIsPending] = useState(false);

  const handleComplete = async () => {
    if (transactionId.trim().length < 5) {
      setError(t('complete.validation.transactionIdMinLength'));
      return;
    }

    try {
      setIsPending(true);
      await completePayoutApi(payout.id, { transactionId, notes: notes || undefined });
      toast.success('Payout marked as completed');
      setTransactionId('');
      setNotes('');
      setError('');
      onOpenChange(false);
      onRefetch();
    } catch (error: any) {
      console.error('Complete payout error:', error);
      toast.error(error.response?.data?.message || 'Failed to complete payout');
    } finally {
      setIsPending(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t('dialog.completeTitle')}</DialogTitle>
          <DialogDescription>
            Mark payout of ${payout.amount.toFixed(2)} as completed for reader{' '}
            {payout.readerProfileId}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="transactionId">
              {t('complete.transactionIdLabel')} <span className="text-red-500">*</span>
            </Label>
            <Input
              id="transactionId"
              value={transactionId}
              onChange={(e) => {
                setTransactionId(e.target.value);
                setError('');
              }}
              placeholder={t('complete.transactionIdPlaceholder')}
              className={error ? 'border-red-500' : ''}
            />
            {error && <p className="text-sm text-red-500">{error}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">{t('complete.notesLabel')}</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder={t('complete.notesPlaceholder')}
              rows={4}
            />
          </div>
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              setTransactionId('');
              setNotes('');
              setError('');
              onOpenChange(false);
            }}
            disabled={isPending}
          >
            {t('complete.cancelButton')}
          </Button>
          <Button type="button" onClick={handleComplete} disabled={isPending || transactionId.trim().length < 5}>
            {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : t('complete.confirmButton')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
