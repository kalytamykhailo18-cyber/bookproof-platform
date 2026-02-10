import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { PayoutResponse, approvePayout as approvePayoutApi } from '@/lib/api/payouts';
import { toast } from 'sonner';
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

interface ApprovePayoutDialogProps {
  payout: PayoutResponse;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onRefetch: () => void;
}

export default function ApprovePayoutDialog({
  payout,
  open,
  onOpenChange,
  onRefetch }: ApprovePayoutDialogProps) {
  const { t, i18n } = useTranslation('adminPayouts');
  const [notes, setNotes] = useState('');
  const [isPending, setIsPending] = useState(false);

  const handleApprove = async () => {
    try {
      setIsPending(true);
      await approvePayoutApi(payout.id, { notes: notes || undefined });
      toast.success('Payout approved successfully');
      setNotes('');
      onOpenChange(false);
      onRefetch();
    } catch (error: any) {
      console.error('Approve payout error:', error);
      toast.error(error.response?.data?.message || 'Failed to approve payout');
    } finally {
      setIsPending(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t('dialog.approveTitle')}</DialogTitle>
          <DialogDescription>
            Approve payout request of ${payout.amount.toFixed(2)} for reader{' '}
            {payout.readerProfileId}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="notes">{t('approve.notesLabel')}</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder={t('approve.notesPlaceholder')}
              rows={4}
            />
          </div>
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isPending}>
            {t('approve.cancelButton')}
          </Button>
          <Button type="button" onClick={handleApprove} disabled={isPending}>
            {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : t('approve.confirmButton')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
