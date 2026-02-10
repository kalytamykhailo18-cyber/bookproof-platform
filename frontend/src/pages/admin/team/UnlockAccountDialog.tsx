import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Loader2, Unlock } from 'lucide-react';
import { toast } from 'sonner';

import { authApi, UnlockAccountRequest } from '@/lib/api/auth';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

export function UnlockAccountDialog() {
  const { t } = useTranslation('adminTeam');
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form fields
  const [email, setEmail] = useState('');
  const [reason, setReason] = useState('');

  // Errors
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    // Email validation
    if (!email) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = 'Please provide a valid email address';
    }

    // Reason validation (optional, but check length if provided)
    if (reason && reason.length > 500) {
      newErrors.reason = 'Reason must not exceed 500 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      setIsSubmitting(true);

      const payload: UnlockAccountRequest = {
        email,
        reason: reason || undefined,
      };

      const response = await authApi.unlockAccount(payload);

      if (response.wasLocked) {
        toast.success('Account unlocked successfully', {
          description: `Account for ${email} has been unlocked`,
        });
      } else {
        toast.info('Account was not locked', {
          description: `Account for ${email} was not locked`,
        });
      }

      setOpen(false);
      resetForm();
    } catch (error: any) {
      const message =
        error?.response?.data?.message || error?.message || 'Failed to unlock account';
      toast.error('Error', { description: message });
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setEmail('');
    setReason('');
    setErrors({});
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!isSubmitting) {
      setOpen(newOpen);
      if (!newOpen) {
        resetForm();
      }
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <Unlock className="mr-2 h-4 w-4" />
          {t('unlockAccount.button')}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{t('unlockAccount.title')}</DialogTitle>
          <DialogDescription>{t('unlockAccount.description')}</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Email Field */}
          <div className="space-y-2">
            <Label htmlFor="email">{t('unlockAccount.fields.email')}</Label>
            <Input
              id="email"
              type="email"
              placeholder={t('unlockAccount.fields.emailPlaceholder')}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            {errors.email && <p className="text-sm text-destructive">{errors.email}</p>}
            <p className="text-sm text-muted-foreground">
              {t('unlockAccount.fields.emailDescription')}
            </p>
          </div>

          {/* Reason Field (Optional) */}
          <div className="space-y-2">
            <Label htmlFor="reason">{t('unlockAccount.fields.reason')}</Label>
            <Textarea
              id="reason"
              placeholder={t('unlockAccount.fields.reasonPlaceholder')}
              rows={3}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
            />
            {errors.reason && <p className="text-sm text-destructive">{errors.reason}</p>}
            <p className="text-sm text-muted-foreground">
              {t('unlockAccount.fields.reasonDescription')}
            </p>
          </div>

          <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
            <p className="text-sm text-amber-800">{t('unlockAccount.info')}</p>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => handleOpenChange(false)}
              disabled={isSubmitting}
            >
              {t('unlockAccount.cancel')}
            </Button>
            <Button type="button" disabled={isSubmitting} onClick={handleSubmit}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {t('unlockAccount.unlocking')}
                </>
              ) : (
                t('unlockAccount.submit')
              )}
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
}
