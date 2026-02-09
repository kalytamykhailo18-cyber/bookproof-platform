import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { useCoupon, useUpdateCoupon } from '@/hooks/useCoupons';
import { UpdateCouponDto, CouponType, CouponAppliesTo } from '@/lib/api/coupons';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Skeleton } from '@/components/ui/skeleton';

// Form validation schema (similar to new, but code is immutable)
const formSchema = z
  .object({
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
    purpose: z.string().optional() })
  .refine(
    (data) => {
      if (data.type === CouponType.PERCENTAGE) {
        return data.discountPercent !== undefined && data.discountPercent > 0;
      }
      return true;
    },
    {
      message: 'Discount percentage is required for percentage type coupons',
      path: ['discountPercent'] },
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
      path: ['discountAmount'] },
  );

type FormValues = z.infer<typeof formSchema>;

export function EditCouponPage() {
  const { t, i18n } = useTranslation('adminCoupons');
  const navigate = useNavigate();
  const id = params.id as string;

  const { data: coupon, isLoading } = useCoupon(id);
  const updateMutation = useUpdateCoupon();
  const [isBackLoading, setIsBackLoading] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      type: CouponType.PERCENTAGE,
      appliesTo: CouponAppliesTo.CREDITS,
      maxUsesPerUser: 1,
      isActive: true,
      validFrom: new Date().toISOString().slice(0, 16) } });

  // Populate form when coupon data is loaded
  useEffect(() => {
    if (coupon) {
      form.reset({
        type: coupon.type,
        appliesTo: coupon.appliesTo,
        discountPercent: coupon.discountPercent || undefined,
        discountAmount: coupon.discountAmount || undefined,
        minimumPurchase: coupon.minimumPurchase || undefined,
        minimumCredits: coupon.minimumCredits || undefined,
        maxUses: coupon.maxUses || undefined,
        maxUsesPerUser: coupon.maxUsesPerUser,
        isActive: coupon.isActive,
        validFrom: new Date(coupon.validFrom).toISOString().slice(0, 16),
        validUntil: coupon.validUntil
          ? new Date(coupon.validUntil).toISOString().slice(0, 16)
          : undefined,
        purpose: coupon.purpose || undefined });
    }
  }, [coupon, form]);

  const couponType = form.watch('type');

  const handleSubmit = async () => {
    const isValid = await form.trigger();
    if (!isValid) return;

    const values = form.getValues();
    const data: UpdateCouponDto = values;
    await updateMutation.mutateAsync({ id, data });
    navigate(`/admin/coupons/${id}`);
  };

  if (isLoading) {
    return (
      <div className="container mx-auto max-w-4xl space-y-6 py-6">
        <Skeleton className="h-12 w-64" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  if (!coupon) {
    return (
      <div className="container mx-auto max-w-4xl py-6">
        <p className="text-center text-muted-foreground">Coupon not found</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-4xl space-y-6 py-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={() => {
            setIsBackLoading(true);
            navigate(`/admin/coupons/${id}`);
          }}
          disabled={isBackLoading}
        >
          {isBackLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ArrowLeft className="h-4 w-4" />}
        </Button>
        <div>
          <h1 className="text-3xl font-bold">
            Edit Coupon: <span className="font-mono">{coupon.code}</span>
          </h1>
          <p className="text-muted-foreground">Update coupon settings (code cannot be changed)</p>
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
              {/* Code is read-only */}
              <div>
                <label className="text-sm font-medium">{t('new.fields.code.label')}</label>
                <Input value={coupon.code} disabled className="mt-1.5 bg-muted font-mono" />
                <p className="mt-1.5 text-sm text-muted-foreground">
                  Coupon code cannot be changed after creation
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('new.fields.type.label')}</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
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
                      <Select onValueChange={field.onChange} value={field.value}>
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
                          value={field.value ?? ''}
                          onChange={(e) => field.onChange(parseFloat(e.target.value) || undefined)}
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
                          value={field.value ?? ''}
                          onChange={(e) => field.onChange(parseFloat(e.target.value) || undefined)}
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
                          value={field.value ?? ''}
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
                          value={field.value ?? ''}
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
                          value={field.value ?? ''}
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
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setIsBackLoading(true);
                navigate(`/admin/coupons/${id}`);
              }}
              disabled={isBackLoading}
            >
              {isBackLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {t('new.actions.cancel')}
            </Button>
            <Button type="button" onClick={handleSubmit} disabled={updateMutation.isPending}>
              {updateMutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Save Changes
            </Button>
          </div>
        </div>
      </Form>
    </div>
  );
}
