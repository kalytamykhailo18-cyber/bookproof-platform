import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2, Unlock } from 'lucide-react';

import { useUnlockAccount } from '@/hooks/useAdminTeam';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage } from '@/components/ui/form';

/**
 * Zod schema for unlock account form
 * Per requirements.md Section 1.1: Admin can manually unlock accounts
 */
const unlockAccountSchema = z.object({
  email: z.string().min(1, 'Email is required').email('Please provide a valid email address'),
  reason: z
    .string()
    .max(500, 'Reason must not exceed 500 characters')
    .optional() });

type UnlockAccountFormData = z.infer<typeof unlockAccountSchema>;

export function UnlockAccountDialog() {
  const { t, i18n } = useTranslation('adminTeam');
  const [open, setOpen] = useState(false);
  const unlockAccountMutation = useUnlockAccount();

  const form = useForm<UnlockAccountFormData>({
    resolver: zodResolver(unlockAccountSchema),
    defaultValues: {
      email: '',
      reason: '' } });

  const onSubmit = async (data: UnlockAccountFormData) => {
    try {
      await unlockAccountMutation.mutateAsync({
        email: data.email,
        reason: data.reason || undefined });
      setOpen(false);
      form.reset();
    } catch {
      // Error is handled by the mutation
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
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

        <Form {...form}>
          <div className="space-y-4">
            {/* Email Field */}
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('unlockAccount.fields.email')}</FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      placeholder={t('unlockAccount.fields.emailPlaceholder')}
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>{t('unlockAccount.fields.emailDescription')}</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Reason Field (Optional) */}
            <FormField
              control={form.control}
              name="reason"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('unlockAccount.fields.reason')}</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder={t('unlockAccount.fields.reasonPlaceholder')}
                      rows={3}
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>{t('unlockAccount.fields.reasonDescription')}</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
              <p className="text-sm text-amber-800">
                {t('unlockAccount.info')}
              </p>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
                disabled={unlockAccountMutation.isPending}
              >
                {t('unlockAccount.cancel')}
              </Button>
              <Button type="button" disabled={unlockAccountMutation.isPending} onClick={form.handleSubmit(onSubmit)}>
                {unlockAccountMutation.isPending ? (
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
        </Form>
      </DialogContent>
    </Dialog>
  );
}
