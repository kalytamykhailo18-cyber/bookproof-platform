import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate,  useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useRegisterAffiliate, useAffiliateProfile } from '@/hooks/useAffiliates';
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
import { Skeleton } from '@/components/ui/skeleton';
import { Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

const registerAffiliateSchema = z.object({
  websiteUrl: z.string().url({ message: 'Please enter a valid URL' }),
  socialMediaUrls: z.string().optional(),
  promotionPlan: z
    .string()
    .min(50, { message: 'Please provide at least 50 characters describing your plan' })
    .max(1000, { message: 'Maximum 1000 characters' }),
  estimatedReach: z.string().optional(),
  customSlug: z
    .string()
    .optional()
    .refine(
      (val) => !val || /^[a-z0-9-]+$/.test(val),
      'Only lowercase letters, numbers, and hyphens are allowed',
    ) });

type RegisterAffiliateFormData = z.infer<typeof registerAffiliateSchema>;

export function AffiliateRegisterPage() {
  const { t, i18n } = useTranslation('affiliates.register');
  const navigate = useNavigate();
  const { data: existingProfile, isLoading: checkingProfile } = useAffiliateProfile();
  const registerMutation = useRegisterAffiliate();
  const [isDashboardLoading, setIsDashboardLoading] = useState(false);

  const form = useForm<RegisterAffiliateFormData>({
    resolver: zodResolver(registerAffiliateSchema),
    defaultValues: {
      websiteUrl: '',
      socialMediaUrls: '',
      promotionPlan: '',
      estimatedReach: '',
      customSlug: '' } });

  const handleSubmit = async () => {
    const isValid = await form.trigger();
    if (!isValid) return;

    const data = form.getValues();
    await registerMutation.mutateAsync(data);
    navigate(`/${i18n.language}/affiliate/dashboard`);
  };

  // If user already has profile, show status
  if (checkingProfile) {
    return (
      <div className="container mx-auto max-w-3xl space-y-8 px-4 py-8">
        <div className="space-y-2">
          <Skeleton className="h-9 w-64 animate-pulse" />
          <Skeleton className="h-5 w-96 animate-pulse" />
        </div>
        <Skeleton className="h-48 animate-pulse" />
        <Skeleton className="h-96 animate-pulse" />
      </div>
    );
  }

  if (existingProfile) {
    return (
      <div className="container mx-auto max-w-3xl px-4 py-8">
        <Card className="animate-fade-up">
          <CardHeader>
            <CardTitle>{t('existingApplication.title')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {existingProfile.isApproved ? (
              <Alert>
                <CheckCircle className="h-4 w-4" />
                <AlertDescription>{t('existingApplication.approved')}</AlertDescription>
              </Alert>
            ) : existingProfile.rejectedAt ? (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  {t('existingApplication.rejected')}: {existingProfile.rejectionReason}
                </AlertDescription>
              </Alert>
            ) : (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{t('existingApplication.pending')}</AlertDescription>
              </Alert>
            )}
            <Button
              type="button"
              onClick={() => {
                setIsDashboardLoading(true);
                navigate(`/${i18n.language}/affiliate/dashboard`);
              }}
              disabled={isDashboardLoading}
            >
              {isDashboardLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {t('existingApplication.goToDashboard')}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-3xl px-4 py-8">
      {/* Header */}
      <div className="mb-8 animate-fade-up">
        <h1 className="text-3xl font-bold">{t('title')}</h1>
        <p className="mt-2 text-muted-foreground">{t('description')}</p>
      </div>

      {/* Benefits Card */}
      <Card className="mb-8 animate-fade-up-fast">
        <CardHeader>
          <CardTitle>{t('benefits.title')}</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">
            <li className="flex items-start">
              <CheckCircle className="mr-2 mt-0.5 h-5 w-5 flex-shrink-0 text-green-500" />
              <span>{t('benefits.commission')}</span>
            </li>
            <li className="flex items-start">
              <CheckCircle className="mr-2 mt-0.5 h-5 w-5 flex-shrink-0 text-green-500" />
              <span>{t('benefits.lifetime')}</span>
            </li>
            <li className="flex items-start">
              <CheckCircle className="mr-2 mt-0.5 h-5 w-5 flex-shrink-0 text-green-500" />
              <span>{t('benefits.tracking')}</span>
            </li>
            <li className="flex items-start">
              <CheckCircle className="mr-2 mt-0.5 h-5 w-5 flex-shrink-0 text-green-500" />
              <span>{t('benefits.payout')}</span>
            </li>
          </ul>
        </CardContent>
      </Card>

      {/* Application Form */}
      <Card className="animate-fade-up-light-slow">
        <CardHeader>
          <CardTitle>{t('form.title')}</CardTitle>
          <CardDescription>{t('form.description')}</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <div className="space-y-6">
              <FormField
                control={form.control}
                name="websiteUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('form.websiteUrl.label')}</FormLabel>
                    <FormControl>
                      <Input placeholder="https://yourblog.com" {...field} />
                    </FormControl>
                    <FormDescription>{t('form.websiteUrl.description')}</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="socialMediaUrls"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('form.socialMediaUrls.label')}</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="https://twitter.com/youraccount, https://instagram.com/youraccount"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>{t('form.socialMediaUrls.description')}</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="promotionPlan"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('form.promotionPlan.label')}</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder={t('form.promotionPlan.placeholder')}
                        rows={6}
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>{t('form.promotionPlan.description')}</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="estimatedReach"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('form.estimatedReach.label')}</FormLabel>
                    <FormControl>
                      <Input placeholder="10,000 monthly visitors" {...field} />
                    </FormControl>
                    <FormDescription>{t('form.estimatedReach.description')}</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="customSlug"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('form.customSlug.label')}</FormLabel>
                    <FormControl>
                      <Input placeholder="my-blog" {...field} />
                    </FormControl>
                    <FormDescription>{t('form.customSlug.description')}</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button
                type="button"
                className="w-full"
                onClick={handleSubmit}
                disabled={registerMutation.isPending}
              >
                {registerMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {t('form.submitting')}
                  </>
                ) : (
                  t('form.submit')
                )}
              </Button>
            </div>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
