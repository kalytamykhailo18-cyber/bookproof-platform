'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useAuth } from '@/hooks/useAuth';
import { useRecaptcha } from '@/hooks/useRecaptcha';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useRouter, useParams } from 'next/navigation';
import { toast } from 'sonner';
import { Plus, X, Loader2 } from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';

/**
 * Password validation matching backend requirements:
 * - Minimum 8 characters
 * - At least one uppercase letter
 * - At least one lowercase letter
 * - At least one number
 * - At least one special character
 */
const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
  .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
  .regex(/[0-9]/, 'Password must contain at least one number')
  .regex(
    /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/,
    'Password must contain at least one special character (!@#$%^&*()_+-=[]{};\':"|,.<>/?)',
  );

const registerSchema = z
  .object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    email: z.string().email('Invalid email address'),
    password: passwordSchema,
    confirmPassword: z.string(),
    role: z.enum(['AUTHOR', 'READER', 'AFFILIATE']),
    companyName: z.string().max(200, 'Company name must not exceed 200 characters').optional(),
    preferredLanguage: z.enum(['EN', 'PT', 'ES']),
    preferredCurrency: z.string().optional(),
    phone: z.string().optional(),
    country: z.string().min(1, 'Country is required'),
    contentPreference: z.enum(['EBOOK', 'AUDIOBOOK', 'BOTH']).optional(),
    amazonProfileLinks: z
      .array(z.string().url('Please enter a valid URL'))
      .max(3, 'Maximum 3 Amazon profile links allowed')
      .optional(),
    termsAccepted: z.boolean(),
    marketingConsent: z.boolean().optional(),
    // Affiliate-specific fields
    websiteUrl: z.string().url('Please enter a valid URL').optional(),
    socialMediaUrls: z
      .string()
      .max(1000, 'Social media URLs must not exceed 1000 characters')
      .optional(),
    promotionPlan: z
      .string()
      .min(50, 'Promotion plan must be at least 50 characters')
      .max(1000, 'Promotion plan must not exceed 1000 characters')
      .optional(),
    estimatedReach: z
      .string()
      .max(500, 'Estimated reach must not exceed 500 characters')
      .optional(),
    preferredSlug: z
      .string()
      .regex(/^[a-z0-9-]+$/, 'Slug must contain only lowercase letters, numbers, and hyphens')
      .min(3, 'Slug must be at least 3 characters')
      .max(50, 'Slug must not exceed 50 characters')
      .optional()
      .or(z.literal('')),
    paypalEmail: z.string().email('Please enter a valid PayPal email').optional().or(z.literal('')),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  })
  .refine((data) => data.termsAccepted === true, {
    message: 'You must accept the terms and conditions',
    path: ['termsAccepted'],
  })
  .refine((data) => data.role !== 'READER' || data.contentPreference !== undefined, {
    message: 'Content preference is required for readers',
    path: ['contentPreference'],
  })
  .refine((data) => data.role !== 'AFFILIATE' || (data.websiteUrl && data.websiteUrl.length > 0), {
    message: 'Website URL is required for affiliates',
    path: ['websiteUrl'],
  })
  .refine(
    (data) => data.role !== 'AFFILIATE' || (data.promotionPlan && data.promotionPlan.length >= 50),
    {
      message: 'Promotion plan is required for affiliates (minimum 50 characters)',
      path: ['promotionPlan'],
    },
  );

type RegisterFormData = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const t = useTranslations('auth.register');
  const router = useRouter();
  const params = useParams();
  const locale = (params.locale as string) || 'en';
  const { registerAsync, isRegistering } = useAuth();
  const { executeRecaptcha, isEnabled: isRecaptchaEnabled } = useRecaptcha();

  const [amazonLinks, setAmazonLinks] = useState<string[]>(['']);
  const [isLoginLoading, setIsLoginLoading] = useState(false);

  const {
    register,
    trigger,
    getValues,
    formState: { errors },
    setValue,
    watch,
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      preferredLanguage: 'EN',
      preferredCurrency: 'USD',
      termsAccepted: false,
      marketingConsent: false,
      amazonProfileLinks: [],
    },
  });

  const termsAccepted = watch('termsAccepted');
  const marketingConsent = watch('marketingConsent');
  const selectedRole = watch('role');

  const handleAddAmazonLink = () => {
    if (amazonLinks.length < 3) {
      setAmazonLinks([...amazonLinks, '']);
    }
  };

  const handleRemoveAmazonLink = (index: number) => {
    const newLinks = amazonLinks.filter((_, i) => i !== index);
    setAmazonLinks(newLinks.length > 0 ? newLinks : ['']);
    setValue(
      'amazonProfileLinks',
      newLinks.filter((link) => link.trim() !== ''),
    );
  };

  const handleAmazonLinkChange = (index: number, value: string) => {
    const newLinks = [...amazonLinks];
    newLinks[index] = value;
    setAmazonLinks(newLinks);
    setValue(
      'amazonProfileLinks',
      newLinks.filter((link) => link.trim() !== ''),
    );
  };

  const handleRegister = async () => {
    const isValid = await trigger();
    if (!isValid) return;

    const data = getValues();
    try {
      // Get reCAPTCHA token if enabled
      let captchaToken: string | undefined;
      if (isRecaptchaEnabled) {
        captchaToken = await executeRecaptcha('register');
      }

      const { confirmPassword: _, ...registerData } = data;
      void _; // Explicitly mark as intentionally unused
      await registerAsync({ ...registerData, captchaToken });
      toast.success(t('success'));
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } }; message?: string };
      const errorMessage = err?.response?.data?.message || err?.message || t('error');
      if (errorMessage.includes('already exists')) {
        toast.error(t('emailExists'));
      } else if (errorMessage.includes('CAPTCHA')) {
        toast.error('Security verification failed. Please try again.');
      } else {
        toast.error(errorMessage);
      }
    }
  };

  return (
    <Card className="animate-zoom-in">
      <CardHeader className="space-y-1">
        <CardTitle className="animate-fade-down-fast text-center text-2xl font-bold">
          {t('title')}
        </CardTitle>
        <CardDescription className="animate-fade-up-fast text-center">
          {t('subtitle')}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="animate-fade-up-very-fast space-y-2">
          <Label htmlFor="name">{t('name')}</Label>
          <Input
            id="name"
            placeholder={t('namePlaceholder')}
            {...register('name')}
            className={errors.name ? 'border-destructive' : ''}
            disabled={isRegistering}
          />
          {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
        </div>

        <div className="animate-fade-left-very-fast space-y-2">
          <Label htmlFor="email">{t('email')}</Label>
          <Input
            id="email"
            type="email"
            placeholder={t('emailPlaceholder')}
            {...register('email')}
            className={errors.email ? 'border-destructive' : ''}
            disabled={isRegistering}
          />
          {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
        </div>

        <div className="animate-fade-right-very-fast space-y-2">
          <Label htmlFor="password">{t('password')}</Label>
          <Input
            id="password"
            type="password"
            placeholder={t('passwordPlaceholder')}
            {...register('password')}
            className={errors.password ? 'border-destructive' : ''}
            disabled={isRegistering}
          />
          {errors.password && <p className="text-sm text-destructive">{errors.password.message}</p>}
        </div>

        <div className="animate-fade-up-fast space-y-2">
          <Label htmlFor="confirmPassword">{t('confirmPassword')}</Label>
          <Input
            id="confirmPassword"
            type="password"
            placeholder={t('confirmPasswordPlaceholder')}
            {...register('confirmPassword')}
            className={errors.confirmPassword ? 'border-destructive' : ''}
            disabled={isRegistering}
          />
          {errors.confirmPassword && (
            <p className="text-sm text-destructive">{errors.confirmPassword.message}</p>
          )}
        </div>

        <div className="animate-zoom-in-fast space-y-2">
          <Label htmlFor="role">{t('role')}</Label>
          <Select
            onValueChange={(value) => setValue('role', value as 'AUTHOR' | 'READER' | 'AFFILIATE')}
            disabled={isRegistering}
          >
            <SelectTrigger className={errors.role ? 'border-destructive' : ''}>
              <SelectValue placeholder={t('roleRequired')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="AUTHOR">{t('roleAuthor')}</SelectItem>
              <SelectItem value="READER">{t('roleReader')}</SelectItem>
              <SelectItem value="AFFILIATE">{t('roleAffiliate')}</SelectItem>
            </SelectContent>
          </Select>
          {errors.role && <p className="text-sm text-destructive">{errors.role.message}</p>}
        </div>

        {selectedRole === 'AUTHOR' && (
          <div className="animate-fade-up space-y-2">
            <Label htmlFor="companyName">{t('companyName') || 'Company Name'}</Label>
            <Input
              id="companyName"
              placeholder={t('companyNamePlaceholder') || 'Enter your company name (optional)'}
              {...register('companyName')}
              className={errors.companyName ? 'border-destructive' : ''}
              disabled={isRegistering}
            />
            {errors.companyName && (
              <p className="text-sm text-destructive">{errors.companyName.message}</p>
            )}
          </div>
        )}

        <div className="animate-fade-left-fast space-y-2">
          <Label htmlFor="country">{t('country') || 'Country'} *</Label>
          <Select onValueChange={(value) => setValue('country', value)} disabled={isRegistering}>
            <SelectTrigger className={errors.country ? 'border-destructive' : ''}>
              <SelectValue placeholder={t('countryPlaceholder') || 'Select your country'} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="US">United States</SelectItem>
              <SelectItem value="GB">United Kingdom</SelectItem>
              <SelectItem value="CA">Canada</SelectItem>
              <SelectItem value="AU">Australia</SelectItem>
              <SelectItem value="BR">Brazil</SelectItem>
              <SelectItem value="MX">Mexico</SelectItem>
              <SelectItem value="ES">Spain</SelectItem>
              <SelectItem value="PT">Portugal</SelectItem>
              <SelectItem value="DE">Germany</SelectItem>
              <SelectItem value="FR">France</SelectItem>
              <SelectItem value="IT">Italy</SelectItem>
              <SelectItem value="IN">India</SelectItem>
              <SelectItem value="OTHER">Other</SelectItem>
            </SelectContent>
          </Select>
          {errors.country && <p className="text-sm text-destructive">{errors.country.message}</p>}
        </div>

        <div className="animate-fade-right-fast space-y-2">
          <Label htmlFor="phone">{t('phone') || 'Phone Number'}</Label>
          <Input
            id="phone"
            type="tel"
            placeholder={t('phonePlaceholder') || '+1 (555) 123-4567'}
            {...register('phone')}
            className={errors.phone ? 'border-destructive' : ''}
            disabled={isRegistering}
          />
          <p className="text-xs text-muted-foreground">
            {t('phoneHint') || 'Optional - for account recovery and support'}
          </p>
          {errors.phone && <p className="text-sm text-destructive">{errors.phone.message}</p>}
        </div>

        {selectedRole === 'READER' && (
          <div className="animate-fade-up space-y-4">
            <div className="animate-zoom-in-fast space-y-2">
              <Label htmlFor="contentPreference">
                {t('contentPreference') || 'Content Format Preference'} *
              </Label>
              <Select
                onValueChange={(value) =>
                  setValue('contentPreference', value as 'EBOOK' | 'AUDIOBOOK' | 'BOTH')
                }
                disabled={isRegistering}
              >
                <SelectTrigger className={errors.contentPreference ? 'border-destructive' : ''}>
                  <SelectValue
                    placeholder={
                      t('contentPreferencePlaceholder') || 'Select your preferred format'
                    }
                  />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="EBOOK">Ebook Only</SelectItem>
                  <SelectItem value="AUDIOBOOK">Audiobook Only</SelectItem>
                  <SelectItem value="BOTH">Both Formats</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                {t('contentPreferenceHint') || 'Choose which book formats you prefer to review'}
              </p>
              {errors.contentPreference && (
                <p className="text-sm text-destructive">{errors.contentPreference.message}</p>
              )}
            </div>

            <div className="animate-fade-right space-y-2">
              <Label>{t('amazonProfileLinks') || 'Amazon Profile Links'}</Label>
              <p className="text-xs text-muted-foreground">
                {t('amazonProfileLinksHint') || 'Add up to 3 Amazon profile URLs (optional)'}
              </p>
              {amazonLinks.map((link, index) => (
                <div
                  key={index}
                  className="flex animate-fade-in gap-2"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <Input
                    placeholder={
                      t('amazonProfileLinkPlaceholder') || 'https://www.amazon.com/gp/profile/...'
                    }
                    value={link}
                    onChange={(e) => handleAmazonLinkChange(index, e.target.value)}
                    className={errors.amazonProfileLinks ? 'border-destructive' : ''}
                    disabled={isRegistering}
                  />
                  {amazonLinks.length > 1 && (
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={() => handleRemoveAmazonLink(index)}
                      disabled={isRegistering}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
              {amazonLinks.length < 3 && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleAddAmazonLink}
                  disabled={isRegistering}
                  className="mt-2"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  {t('addAnotherLink') || 'Add another link'}
                </Button>
              )}
              {errors.amazonProfileLinks && (
                <p className="text-sm text-destructive">{errors.amazonProfileLinks.message}</p>
              )}
            </div>
          </div>
        )}

        {selectedRole === 'AFFILIATE' && (
          <div className="animate-fade-up space-y-4">
            <div className="animate-zoom-in-fast space-y-2">
              <Label htmlFor="websiteUrl">{t('websiteUrl') || 'Website URL'} *</Label>
              <Input
                id="websiteUrl"
                type="url"
                placeholder={t('websiteUrlPlaceholder') || 'https://yourblog.com'}
                {...register('websiteUrl')}
                className={errors.websiteUrl ? 'border-destructive' : ''}
                disabled={isRegistering}
              />
              {errors.websiteUrl && (
                <p className="text-sm text-destructive">{errors.websiteUrl.message}</p>
              )}
            </div>

            <div className="animate-fade-left space-y-2">
              <Label htmlFor="socialMediaUrls">{t('socialMediaUrls') || 'Social Media URLs'}</Label>
              <Input
                id="socialMediaUrls"
                placeholder={
                  t('socialMediaUrlsPlaceholder') ||
                  'https://twitter.com/you, https://instagram.com/you'
                }
                {...register('socialMediaUrls')}
                className={errors.socialMediaUrls ? 'border-destructive' : ''}
                disabled={isRegistering}
              />
              <p className="text-xs text-muted-foreground">
                {t('socialMediaUrlsHint') ||
                  'Enter your social media URLs separated by commas (optional)'}
              </p>
              {errors.socialMediaUrls && (
                <p className="text-sm text-destructive">{errors.socialMediaUrls.message}</p>
              )}
            </div>

            <div className="animate-fade-right space-y-2">
              <Label htmlFor="promotionPlan">{t('promotionPlan') || 'Promotion Plan'} *</Label>
              <Textarea
                id="promotionPlan"
                placeholder={
                  t('promotionPlanPlaceholder') ||
                  'Describe how you plan to promote BookProof (minimum 50 characters)...'
                }
                {...register('promotionPlan')}
                className={`min-h-[100px] ${errors.promotionPlan ? 'border-destructive' : ''}`}
                disabled={isRegistering}
              />
              <p className="text-xs text-muted-foreground">
                {t('promotionPlanHint') ||
                  'Explain your audience and promotion strategy (50-1000 characters)'}
              </p>
              {errors.promotionPlan && (
                <p className="text-sm text-destructive">{errors.promotionPlan.message}</p>
              )}
            </div>

            <div className="animate-zoom-in space-y-2">
              <Label htmlFor="estimatedReach">
                {t('estimatedReach') || 'Estimated Audience Reach'}
              </Label>
              <Input
                id="estimatedReach"
                placeholder={t('estimatedReachPlaceholder') || 'e.g., 10,000 monthly blog visitors'}
                {...register('estimatedReach')}
                className={errors.estimatedReach ? 'border-destructive' : ''}
                disabled={isRegistering}
              />
              {errors.estimatedReach && (
                <p className="text-sm text-destructive">{errors.estimatedReach.message}</p>
              )}
            </div>

            <div className="animate-fade-up-fast space-y-2">
              <Label htmlFor="preferredSlug">
                {t('preferredSlug') || 'Preferred Referral Slug'}
              </Label>
              <Input
                id="preferredSlug"
                placeholder={t('preferredSlugPlaceholder') || 'my-book-blog'}
                {...register('preferredSlug')}
                className={errors.preferredSlug ? 'border-destructive' : ''}
                disabled={isRegistering}
              />
              <p className="text-xs text-muted-foreground">
                {t('preferredSlugHint') ||
                  'Custom URL slug for your referral link (lowercase, numbers, hyphens only)'}
              </p>
              {errors.preferredSlug && (
                <p className="text-sm text-destructive">{errors.preferredSlug.message}</p>
              )}
            </div>

            <div className="animate-flip-up-fast space-y-2">
              <Label htmlFor="paypalEmail">{t('paypalEmail') || 'PayPal Email'}</Label>
              <Input
                id="paypalEmail"
                type="email"
                placeholder={t('paypalEmailPlaceholder') || 'payments@youremail.com'}
                {...register('paypalEmail')}
                className={errors.paypalEmail ? 'border-destructive' : ''}
                disabled={isRegistering}
              />
              <p className="text-xs text-muted-foreground">
                {t('paypalEmailHint') || 'Your PayPal email for receiving commission payments'}
              </p>
              {errors.paypalEmail && (
                <p className="text-sm text-destructive">{errors.paypalEmail.message}</p>
              )}
            </div>
          </div>
        )}

        <div className="grid animate-fade-right-fast grid-cols-2 gap-4">
          <div className="animate-flip-up-fast space-y-2">
            <Label htmlFor="language">{t('language')}</Label>
            <Select
              onValueChange={(value) => setValue('preferredLanguage', value as 'EN' | 'PT' | 'ES')}
              defaultValue="EN"
              disabled={isRegistering}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="EN">English</SelectItem>
                <SelectItem value="PT">Português</SelectItem>
                <SelectItem value="ES">Español</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="animate-flip-down-fast space-y-2">
            <Label htmlFor="currency">{t('currency')}</Label>
            <Select
              onValueChange={(value) => setValue('preferredCurrency', value)}
              defaultValue="USD"
              disabled={isRegistering}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="USD">USD ($)</SelectItem>
                <SelectItem value="EUR">EUR (€)</SelectItem>
                <SelectItem value="BRL">BRL (R$)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="animate-fade-up space-y-3">
          <div className="flex animate-zoom-in items-start space-x-2">
            <Checkbox
              id="terms"
              checked={termsAccepted}
              onCheckedChange={(checked) => setValue('termsAccepted', checked as boolean)}
              disabled={isRegistering}
              className={errors.termsAccepted ? 'border-destructive' : ''}
            />
            <Label htmlFor="terms" className="cursor-pointer text-sm font-normal leading-relaxed">
              {t('terms')}
            </Label>
          </div>
          {errors.termsAccepted && (
            <p className="text-sm text-destructive">{errors.termsAccepted.message}</p>
          )}

          <div className="flex animate-fade-left items-start space-x-2">
            <Checkbox
              id="marketingConsent"
              checked={marketingConsent}
              onCheckedChange={(checked) => setValue('marketingConsent', checked as boolean)}
              disabled={isRegistering}
            />
            <Label
              htmlFor="marketingConsent"
              className="cursor-pointer text-sm font-normal leading-relaxed"
            >
              {t('marketingConsent') ||
                'I agree to receive marketing emails and updates about new features'}
            </Label>
          </div>
        </div>
      </CardContent>

      <CardFooter className="flex animate-fade-up-light-slow flex-col space-y-4">
        <Button
          type="button"
          className="w-full animate-zoom-in-light-slow"
          disabled={isRegistering}
          onClick={handleRegister}
        >
          {isRegistering ? <Loader2 className="h-4 w-4 animate-spin" /> : t('submitButton')}
        </Button>

        <p className="animate-fade-up-slow text-center text-sm text-muted-foreground">
          {t('hasAccount')}{' '}
          <span
            className="cursor-pointer font-medium text-primary hover:underline"
            onClick={() => {
              setIsLoginLoading(true);
              router.push(`/${locale}/login`);
            }}
          >
            {isLoginLoading ? <Loader2 className="inline h-3 w-3 animate-spin" /> : t('signIn')}
          </span>
        </p>
      </CardFooter>
    </Card>
  );
}
