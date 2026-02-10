import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2, UserPlus } from 'lucide-react';
import { toast } from 'sonner';

import { authApi, CreateCloserRequest } from '@/lib/api/auth';
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
import { Switch } from '@/components/ui/switch';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';

/**
 * Zod schema matching backend CreateCloserDto exactly
 * Per requirements.md Section 1.4
 */
const createCloserSchema = z.object({
  email: z.string().min(1, 'Email is required').email('Please provide a valid email address'),
  name: z
    .string()
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name must not exceed 100 characters'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .optional()
    .or(z.literal('')),
  commissionRate: z
    .number()
    .min(0, 'Commission rate cannot be negative')
    .max(100, 'Commission rate cannot exceed 100%')
    .default(0),
  isActive: z.boolean().default(true),
});

type CreateCloserFormData = z.infer<typeof createCloserSchema>;

interface CreateCloserDialogProps {
  onSuccess?: () => void;
}

export function CreateCloserDialog({ onSuccess }: CreateCloserDialogProps) {
  const { t } = useTranslation('adminTeam');
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<CreateCloserFormData>({
    resolver: zodResolver(createCloserSchema),
    defaultValues: {
      email: '',
      name: '',
      password: '',
      commissionRate: 0,
      isActive: true,
    },
  });

  const onSubmit = async (data: CreateCloserFormData) => {
    try {
      setIsSubmitting(true);

      const payload: CreateCloserRequest = {
        email: data.email,
        name: data.name,
        password: data.password || undefined,
        commissionRate: data.commissionRate,
        isActive: data.isActive,
      };

      const response = await authApi.createCloser(payload);

      toast.success(`Closer account created for ${response.email}`, {
        description: response.temporaryPasswordSent
          ? 'Temporary password sent via email'
          : 'Account created successfully',
      });

      setOpen(false);
      form.reset();

      // Call parent callback to refresh data
      onSuccess?.();
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : typeof error === 'object' && error !== null && 'response' in error
            ? (error as { response?: { data?: { message?: string } } }).response?.data
                ?.message || 'Failed to create closer account'
            : 'Failed to create closer account';

      toast.error('Error', { description: message });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!isSubmitting) {
      setOpen(newOpen);
      if (!newOpen) {
        form.reset();
      }
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button>
          <UserPlus className="mr-2 h-4 w-4" />
          {t('closers.addCloser')}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{t('createCloser.title')}</DialogTitle>
          <DialogDescription>{t('createCloser.description')}</DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <div className="space-y-4">
            {/* Email Field */}
            <FormField
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('createCloser.fields.email')}</FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      placeholder={t('createCloser.fields.emailPlaceholder')}
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>{t('createCloser.fields.emailDescription')}</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Name Field */}
            <FormField
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('createCloser.fields.name')}</FormLabel>
                  <FormControl>
                    <Input placeholder={t('createCloser.fields.namePlaceholder')} {...field} />
                  </FormControl>
                  <FormDescription>{t('createCloser.fields.nameDescription')}</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Password Field (Optional) */}
            <FormField
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('createCloser.fields.password')}</FormLabel>
                  <FormControl>
                    <Input
                      type="password"
                      placeholder={t('createCloser.fields.passwordPlaceholder')}
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>{t('createCloser.fields.passwordDescription')}</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Commission Rate Field */}
            <FormField
              name="commissionRate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('createCloser.fields.commissionRate')}</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input
                        type="number"
                        min={0}
                        max={100}
                        step={0.1}
                        placeholder={t('createCloser.fields.commissionRatePlaceholder')}
                        {...field}
                        onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                        %
                      </span>
                    </div>
                  </FormControl>
                  <FormDescription>
                    {t('createCloser.fields.commissionRateDescription')}
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Active Status Field */}
            <FormField
              name="isActive"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">{t('createCloser.fields.isActive')}</FormLabel>
                    <FormDescription>
                      {t('createCloser.fields.isActiveDescription')}
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch checked={field.value} onCheckedChange={field.onChange} />
                  </FormControl>
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => handleOpenChange(false)}
                disabled={isSubmitting}
              >
                {t('createCloser.cancel')}
              </Button>
              <Button
                type="button"
                disabled={isSubmitting}
                onClick={form.handleSubmit(onSubmit)}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {t('createCloser.creating')}
                  </>
                ) : (
                  t('createCloser.submit')
                )}
              </Button>
            </DialogFooter>
          </div>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
