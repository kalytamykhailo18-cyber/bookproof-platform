'use client';

import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { useCreateCoupon } from '@/hooks/useCoupons';
import { CreateCouponDto, CouponType, CouponAppliesTo } from '@/lib/api/coupons';
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
import { Switch } from '@/components/ui/switch';

// Form validation schema
const formSchema = z
  .object({
    code: z.string().min(2, 'Code must be at least 2 characters').toUpperCase(),
    type: z.nativeEnum(CouponType),
    appliesTo: z.nativeEnum(CouponAppliesTo),
    discountPercent: z.number().min(0).max(100).optional(),
    discountAmount: z.number().min(0).optional(),
    minimumPurchase: z.number().min(0).optional(),
    minimumCredits: z.number().int().min(0).optional(),
    maxUses: z.number().int().min(1).optional(),
    maxUsesPerUser: z.number().int().min(1).default(1),
    isActive: z.boolean().default(true),
    validFrom: z.string(),
    validUntil: z.string().optional(),
    purpose: z.string().optional(),
  })
  .refine(
    (data) => {
      if (data.type === CouponType.PERCENTAGE) {
        return data.discountPercent !== undefined && data.discountPercent > 0;
      }
      return true;
    },
    {
      message: 'Discount percentage is required for percentage type coupons',
      path: ['discountPercent'],
    },
  )
  .refine(
    (data) => {
      if (data.type === CouponType.FIXED_AMOUNT) {
        return data.discountAmount !== undefined && data.discountAmount > 0;
      }
      return true;
    },
    {
      message: 'Discount amount is required for fixed amount type coupons',
      path: ['discountAmount'],
    },
  );

type FormValues = z.infer<typeof formSchema>;

export default function NewCouponPage() {
  const t = useTranslations('admin.coupons');
  const router = useRouter();
  const createMutation = useCreateCoupon();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      code: '',
      type: CouponType.PERCENTAGE,
      appliesTo: CouponAppliesTo.CREDITS,
      maxUsesPerUser: 1,
      isActive: true,
      validFrom: new Date().toISOString().slice(0, 16),
    },
  });

  const couponType = form.watch('type');

  const handleSubmit = async () => {
    const isValid = await form.trigger();
    if (!isValid) return;

    const values = form.getValues();
    const data: CreateCouponDto = {
      ...values,
      code: values.code.toUpperCase(),
    };

    await createMutation.mutateAsync(data);
    router.push('/admin/coupons');
  };

  return (
    <div className="container mx-auto max-w-4xl space-y-6 py-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/admin/coupons">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold">{t('new.title')}</h1>
          <p className="text-muted-foreground">{t('new.description')}</p>
        </div>
      </div>

      {/* Form */}
      <Form {...form}>
        <div className="space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle>{t('new.basic.title')}</CardTitle>
              <CardDescription>{t('new.basic.description')}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="code"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('new.fields.code.label')}</FormLabel>
                    <FormControl>
                      <Input
                        placeholder={t('new.fields.code.placeholder')}
                        {...field}
                        onChange={(e) => field.onChange(e.target.value.toUpperCase())}
                        className="font-mono"
                      />
                    </FormControl>
                    <FormDescription>{t('new.fields.code.description')}</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('new.fields.type.label')}</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value={CouponType.PERCENTAGE}>
                            {t('types.percentage')}
                          </SelectItem>
                          <SelectItem value={CouponType.FIXED_AMOUNT}>
                            {t('types.fixedAmount')}
                          </SelectItem>
                          <SelectItem value={CouponType.FREE_ADDON}>
                            {t('types.freeAddon')}
                          </SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="appliesTo"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('new.fields.appliesTo.label')}</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value={CouponAppliesTo.CREDITS}>
                            {t('appliesTo.credits')}
                          </SelectItem>
                          <SelectItem value={CouponAppliesTo.KEYWORD_RESEARCH}>
                            {t('appliesTo.keywordResearch')}
                          </SelectItem>
                          <SelectItem value={CouponAppliesTo.ALL}>{t('appliesTo.all')}</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="purpose"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('new.fields.purpose.label')}</FormLabel>
                    <FormControl>
                      <Textarea placeholder={t('new.fields.purpose.placeholder')} {...field} />
                    </FormControl>
                    <FormDescription>{t('new.fields.purpose.description')}</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Discount Settings */}
          <Card>
            <CardHeader>
              <CardTitle>{t('new.discount.title')}</CardTitle>
              <CardDescription>{t('new.discount.description')}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {couponType === CouponType.PERCENTAGE && (
                <FormField
                  control={form.control}
                  name="discountPercent"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('new.fields.discountPercent.label')}</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min="0"
                          max="100"
                          step="0.01"
                          placeholder="20"
                          {...field}
                          onChange={(e) => field.onChange(parseFloat(e.target.value))}
                        />
                      </FormControl>
                      <FormDescription>
                        {t('new.fields.discountPercent.description')}
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              {couponType === CouponType.FIXED_AMOUNT && (
                <FormField
                  control={form.control}
                  name="discountAmount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('new.fields.discountAmount.label')}</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min="0"
                          step="0.01"
                          placeholder="50"
                          {...field}
                          onChange={(e) => field.onChange(parseFloat(e.target.value))}
                        />
                      </FormControl>
                      <FormDescription>
                        {t('new.fields.discountAmount.description')}
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="minimumPurchase"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('new.fields.minimumPurchase.label')}</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min="0"
                          step="0.01"
                          placeholder="0"
                          {...field}
                          onChange={(e) =>
                            field.onChange(e.target.value ? parseFloat(e.target.value) : undefined)
                          }
                        />
                      </FormControl>
                      <FormDescription>
                        {t('new.fields.minimumPurchase.description')}
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="minimumCredits"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('new.fields.minimumCredits.label')}</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min="0"
                          step="1"
                          placeholder="0"
                          {...field}
                          onChange={(e) =>
                            field.onChange(e.target.value ? parseInt(e.target.value) : undefined)
                          }
                        />
                      </FormControl>
                      <FormDescription>
                        {t('new.fields.minimumCredits.description')}
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>

          {/* Usage Limits */}
          <Card>
            <CardHeader>
              <CardTitle>{t('new.limits.title')}</CardTitle>
              <CardDescription>{t('new.limits.description')}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="maxUses"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('new.fields.maxUses.label')}</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min="1"
                          step="1"
                          placeholder={t('new.fields.maxUses.placeholder')}
                          {...field}
                          onChange={(e) =>
                            field.onChange(e.target.value ? parseInt(e.target.value) : undefined)
                          }
                        />
                      </FormControl>
                      <FormDescription>{t('new.fields.maxUses.description')}</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="maxUsesPerUser"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('new.fields.maxUsesPerUser.label')}</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min="1"
                          step="1"
                          placeholder="1"
                          {...field}
                          onChange={(e) => field.onChange(parseInt(e.target.value))}
                        />
                      </FormControl>
                      <FormDescription>
                        {t('new.fields.maxUsesPerUser.description')}
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>

          {/* Validity Period */}
          <Card>
            <CardHeader>
              <CardTitle>{t('new.validity.title')}</CardTitle>
              <CardDescription>{t('new.validity.description')}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="validFrom"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('new.fields.validFrom.label')}</FormLabel>
                      <FormControl>
                        <Input type="datetime-local" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="validUntil"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('new.fields.validUntil.label')}</FormLabel>
                      <FormControl>
                        <Input type="datetime-local" {...field} value={field.value || ''} />
                      </FormControl>
                      <FormDescription>{t('new.fields.validUntil.description')}</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="isActive"
                render={({ field }) => (
                  <FormItem className="flex items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">{t('new.fields.isActive.label')}</FormLabel>
                      <FormDescription>{t('new.fields.isActive.description')}</FormDescription>
                    </div>
                    <FormControl>
                      <Switch checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex justify-end gap-4">
            <Link href="/admin/coupons">
              <Button type="button" variant="outline">
                {t('new.actions.cancel')}
              </Button>
            </Link>
            <Button type="button" onClick={handleSubmit} disabled={createMutation.isPending}>
              {createMutation.isPending ? t('new.actions.creating') : t('new.actions.create')}
            </Button>
          </div>
        </div>
      </Form>
    </div>
  );
}
