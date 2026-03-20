import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { authApi } from '@/lib/api/auth';
import { useAuthStore } from '@/stores/authStore';
import { tokenManager } from '@/lib/api/client';
import { useLoading } from '@/components/providers/LoadingProvider';
import { useRecaptcha } from '@/hooks/useRecaptcha';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Plus, X, Loader2, BookOpen, PenLine, Headphones, Link2, ShieldCheck, Star, Clock, CheckCircle2, Users, DollarSign, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';

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
    cpf: z.string().optional(),
    country: z.string().min(1, 'Country is required'),
    contentPreference: z.enum(['EBOOK', 'AUDIOBOOK', 'BOTH']).optional(),
    amazonProfileLinks: z
      .array(z.string().url('Please enter a valid URL'))
      .max(3, 'Maximum 3 Amazon profile links allowed')
      .optional(),
    termsAccepted: z.boolean(),
    marketingConsent: z.boolean().optional(),
    websiteUrl: z.string().url('Please enter a valid URL').optional(),
    socialMediaUrls: z.string().max(1000).optional(),
    promotionPlan: z.string().min(50).max(1000).optional(),
    estimatedReach: z.string().max(500).optional(),
    preferredSlug: z
      .string()
      .regex(/^[a-z0-9-]+$/, 'Slug must contain only lowercase letters, numbers, and hyphens')
      .min(3).max(50).optional().or(z.literal('')),
    paypalEmail: z.string().email('Please enter a valid PayPal email').optional().or(z.literal('')) })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'] })
  .refine((data) => data.termsAccepted === true, {
    message: 'You must accept the terms and conditions',
    path: ['termsAccepted'] })
  .refine((data) => data.role !== 'READER' || data.contentPreference !== undefined, {
    message: 'Content preference is required for readers',
    path: ['contentPreference'] })
  .refine((data) => data.role !== 'AFFILIATE' || (data.websiteUrl && data.websiteUrl.length > 0), {
    message: 'Website URL is required for affiliates',
    path: ['websiteUrl'] })
  .refine(
    (data) => data.role !== 'AFFILIATE' || (data.promotionPlan && data.promotionPlan.length >= 50),
    { message: 'Promotion plan is required for affiliates (minimum 50 characters)', path: ['promotionPlan'] },
  )
  .refine(
    (data) => data.preferredLanguage !== 'PT' || (data.phone && data.phone.length > 0),
    { message: 'Phone number is required for Brazilian users', path: ['phone'] },
  )
  .refine(
    (data) => data.preferredLanguage !== 'PT' || (data.cpf && /^\d{3}\.?\d{3}\.?\d{3}-?\d{2}$/.test(data.cpf)),
    { message: 'Valid CPF is required for Brazilian users (XXX.XXX.XXX-XX)', path: ['cpf'] },
  );

type RegisterFormData = z.infer<typeof registerSchema>;

export function RegisterPage() {
  const { t } = useTranslation('auth.register');
  const { t: tAuth } = useTranslation('auth');
  const navigate = useNavigate();
  const { setUser } = useAuthStore();
  const { startLoading, stopLoading } = useLoading();
  const { executeRecaptcha, isEnabled: isRecaptchaEnabled } = useRecaptcha();

  const [amazonLinks, setAmazonLinks] = useState<string[]>(['']);
  const [isRegistering, setIsRegistering] = useState(false);
  const [isLoginLoading, setIsLoginLoading] = useState(false);

  const {
    register,
    trigger,
    getValues,
    formState: { errors },
    setValue,
    watch } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      preferredLanguage: 'EN',
      preferredCurrency: 'USD',
      termsAccepted: false,
      marketingConsent: false,
      amazonProfileLinks: [] } });

  const termsAccepted = watch('termsAccepted');
  const marketingConsent = watch('marketingConsent');
  const selectedRole = watch('role');
  const selectedLanguage = watch('preferredLanguage');
  const isBrazilian = selectedLanguage === 'PT';

  const handleAddAmazonLink = () => {
    if (amazonLinks.length < 3) setAmazonLinks([...amazonLinks, '']);
  };

  const handleRemoveAmazonLink = (index: number) => {
    const newLinks = amazonLinks.filter((_, i) => i !== index);
    setAmazonLinks(newLinks.length > 0 ? newLinks : ['']);
    setValue('amazonProfileLinks', newLinks.filter((link) => link.trim() !== ''));
  };

  const handleAmazonLinkChange = (index: number, value: string) => {
    const newLinks = [...amazonLinks];
    newLinks[index] = value;
    setAmazonLinks(newLinks);
    setValue('amazonProfileLinks', newLinks.filter((link) => link.trim() !== ''));
  };

  const handleRegister = async () => {
    const isValid = await trigger();
    if (!isValid) return;

    const data = getValues();
    try {
      let captchaToken: string | undefined;
      if (isRecaptchaEnabled) captchaToken = await executeRecaptcha('register');

      setIsRegistering(true);
      startLoading('Creating your account...');

      const { confirmPassword: _, ...registerData } = data;
      void _;

      const response = await authApi.register({ ...registerData, captchaToken });
      tokenManager.setToken(response.accessToken);
      setUser(response.user);
      toast.success(t('success'));

      if (!response.user.emailVerified) {
        navigate('/verify-email-required');
      } else {
        switch (response.user.role) {
          case 'AUTHOR':    navigate('/author'); break;
          case 'READER':    navigate('/reader'); break;
          case 'AFFILIATE': navigate('/affiliate/dashboard'); break;
          default:          navigate('/');
        }
      }
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } }; message?: string };
      const errorMessage = err?.response?.data?.message || err?.message || t('error');
      if (errorMessage.includes('already exists')) toast.error(t('emailExists'));
      else if (errorMessage.includes('CAPTCHA')) toast.error('Security verification failed. Please try again.');
      else toast.error(errorMessage);
    } finally {
      setIsRegistering(false);
      stopLoading();
    }
  };

  const leftRolesData = t('leftRoles', { returnObjects: true }) as { title: string; desc: string }[];
  const roles = [
    { key: 'AUTHOR',    icon: PenLine,    color: '#60a5fa', title: leftRolesData[0].title, desc: leftRolesData[0].desc },
    { key: 'READER',    icon: Headphones, color: '#34d399', title: leftRolesData[1].title, desc: leftRolesData[1].desc },
    { key: 'AFFILIATE', icon: Link2,      color: '#a78bfa', title: leftRolesData[2].title, desc: leftRolesData[2].desc },
  ];

  return (
    <div className="min-h-screen flex">

      {/* ── Left panel — dark branded ── */}
      <div
        className="hidden lg:flex lg:w-5/12 xl:w-2/5 flex-col justify-between p-12 relative overflow-hidden sticky top-0 h-screen"
        style={{ background: 'linear-gradient(160deg, #080d1a 0%, #0d1b2e 100%)' }}
      >
        {/* Dot grid */}
        <div
          className="absolute inset-0 opacity-[0.04] pointer-events-none"
          style={{ backgroundImage: 'radial-gradient(rgba(255,255,255,1) 1px, transparent 1px)', backgroundSize: '28px 28px' }}
        />
        <div
          className="absolute bottom-0 left-0 w-[400px] h-[400px] pointer-events-none"
          style={{ background: 'radial-gradient(circle at bottom left, rgba(139,92,246,0.07) 0%, transparent 60%)' }}
        />

        {/* Logo */}
        <div className="relative">
          <div className="flex items-center gap-3 mb-2 cursor-pointer" onClick={() => navigate('/')}>
            <img src="/logo.png" alt="BookProof" className="h-[120px] w-auto px-1 rounded" />
          </div>
          <p className="text-slate-500 text-xs">{tAuth('common.tagline')}</p>
        </div>

        {/* Main content */}
        <div className="relative space-y-10">
          <div>
            <h2 className="text-3xl font-bold text-white leading-tight mb-4">
              {t('leftHeading')}<br />
              <span className="text-purple-400">{t('leftHeadingHighlight')}</span>
            </h2>
            <p className="text-slate-400 text-base leading-relaxed">
              {t('leftSubtitle')}
            </p>
          </div>

          {/* Role cards */}
          <div className="space-y-3">
            {roles.map(({ key, icon: Icon, color, title, desc }) => (
              <div
                key={key}
                className="flex items-center gap-4 rounded-md p-4"
                style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(71,85,105,0.25)' }}
              >
                <div
                  className="flex-shrink-0 w-9 h-9 rounded-md flex items-center justify-center"
                  style={{ background: `${color}18`, border: `1px solid ${color}30` }}
                >
                  <Icon className="h-4 w-4" style={{ color }} />
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">{title}</p>
                  <p className="text-xs text-slate-500 mt-0.5">{desc}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Stats */}
          <div className="flex items-center gap-8 pt-2 border-t border-slate-800">
            {(t('leftStats', { returnObjects: true }) as { value: string; label: string }[]).map(({ value, label }) => (
              <div key={label}>
                <p className="text-2xl font-bold text-white">{value}</p>
                <p className="text-xs text-slate-500 mt-0.5">{label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom note */}
        <div className="relative">
          <div className="flex items-center gap-2 text-xs text-slate-600">
            <Lock className="h-3 w-3" />
            {t('dataPrivacyNote')}
          </div>
        </div>
      </div>

      {/* ── Right panel — register form ── */}
      <div className="w-full lg:w-7/12 xl:w-3/5 flex flex-col items-center justify-start px-6 py-12 bg-gray-50 overflow-y-auto">
        <div className="w-full max-w-xl animate-fade-up">

          {/* Card */}
          <div className="bg-white rounded-md border border-gray-200 shadow-sm overflow-hidden">
            {/* Top stripe */}
            <div className="h-1 w-full bg-gradient-to-r from-blue-500 via-purple-400 to-teal-400" />

            <div className="px-8 py-8">
              {/* Header */}
              <div className="flex flex-col items-center mb-7">
                <div className="w-12 h-12 bg-blue-50 rounded-md flex items-center justify-center mb-3">
                  <BookOpen className="h-6 w-6 text-blue-500" />
                </div>
                <h1 className="text-2xl font-bold text-gray-900">{t('title')}</h1>
                <p className="text-gray-500 text-sm mt-1 text-center">{t('subtitle')}</p>
              </div>

              {/* Form */}
              <div className="flex flex-col gap-5">

                {/* Name */}
                <div className="space-y-1.5">
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

                {/* Email */}
                <div className="space-y-1.5">
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

                {/* Password row */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label htmlFor="password">{t('password')}</Label>
                    <Input
                      id="password"
                      type="password"
                      placeholder="••••••••"
                      {...register('password')}
                      className={errors.password ? 'border-destructive' : ''}
                      disabled={isRegistering}
                    />
                    {errors.password && <p className="text-sm text-destructive">{errors.password.message}</p>}
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="confirmPassword">{t('confirmPassword')}</Label>
                    <Input
                      id="confirmPassword"
                      type="password"
                      placeholder="••••••••"
                      {...register('confirmPassword')}
                      className={errors.confirmPassword ? 'border-destructive' : ''}
                      disabled={isRegistering}
                    />
                    {errors.confirmPassword && <p className="text-sm text-destructive">{errors.confirmPassword.message}</p>}
                  </div>
                </div>

                {/* Role selector */}
                <div className="space-y-2">
                  <Label>{t('role')}</Label>
                  <div className="grid grid-cols-3 gap-3">
                    {roles.map(({ key, icon: Icon, color, title, desc }) => {
                      const isSelected = selectedRole === key;
                      return (
                        <button
                          key={key}
                          type="button"
                          onClick={() => setValue('role', key as 'AUTHOR' | 'READER' | 'AFFILIATE')}
                          className="flex flex-col items-center gap-2 p-3 rounded-md border-2 transition-all text-center"
                          style={isSelected
                            ? { borderColor: color, background: `${color}0f` }
                            : { borderColor: '#e5e7eb', background: '#fff' }}
                        >
                          <Icon className="h-5 w-5" style={{ color: isSelected ? color : '#9ca3af' }} />
                          <span className="text-xs font-semibold leading-tight" style={{ color: isSelected ? color : '#6b7280' }}>
                            {title}
                          </span>
                          <span className="text-xs text-gray-400 leading-tight">{desc}</span>
                          {isSelected && <CheckCircle2 className="h-3.5 w-3.5" style={{ color }} />}
                        </button>
                      );
                    })}
                  </div>
                  {errors.role && <p className="text-sm text-destructive">{errors.role.message}</p>}
                </div>

                {/* Country + Phone */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label>{t('country') || 'Country'} *</Label>
                    <Select onValueChange={(value) => setValue('country', value)} disabled={isRegistering}>
                      <SelectTrigger className={errors.country ? 'border-destructive' : ''}>
                        <SelectValue placeholder={t('selectCountryPlaceholder')} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="US">{t('countryUS')}</SelectItem>
                        <SelectItem value="GB">{t('countryGB')}</SelectItem>
                        <SelectItem value="CA">{t('countryCA')}</SelectItem>
                        <SelectItem value="AU">{t('countryAU')}</SelectItem>
                        <SelectItem value="BR">{t('countryBR')}</SelectItem>
                        <SelectItem value="MX">{t('countryMX')}</SelectItem>
                        <SelectItem value="ES">{t('countryES')}</SelectItem>
                        <SelectItem value="PT">{t('countryPT')}</SelectItem>
                        <SelectItem value="DE">{t('countryDE')}</SelectItem>
                        <SelectItem value="FR">{t('countryFR')}</SelectItem>
                        <SelectItem value="IT">{t('countryIT')}</SelectItem>
                        <SelectItem value="IN">{t('countryIN')}</SelectItem>
                        <SelectItem value="OTHER">{t('countryOther')}</SelectItem>
                      </SelectContent>
                    </Select>
                    {errors.country && <p className="text-sm text-destructive">{errors.country.message}</p>}
                  </div>
                  <div className="space-y-1.5">
                    <Label>{t('phone') || 'Phone'}{isBrazilian && ' *'}</Label>
                    <Input
                      type="tel"
                      placeholder={isBrazilian ? '+55 11 99999-9999' : '+1 (555) 123-4567'}
                      {...register('phone')}
                      className={errors.phone ? 'border-destructive' : ''}
                      disabled={isRegistering}
                    />
                    {errors.phone && <p className="text-sm text-destructive">{errors.phone.message}</p>}
                  </div>
                </div>

                {/* CPF for Brazilian users */}
                {isBrazilian && (
                  <div className="space-y-1.5">
                    <Label>CPF *</Label>
                    <Input
                      placeholder="000.000.000-00"
                      {...register('cpf')}
                      className={errors.cpf ? 'border-destructive' : ''}
                      disabled={isRegistering}
                    />
                    <p className="text-xs text-gray-400">
                      {t('cpfHint') || 'Required for Brazilian payment processing (PIX, Boleto, Credit Card)'}
                    </p>
                    {errors.cpf && <p className="text-sm text-destructive">{errors.cpf.message}</p>}
                  </div>
                )}

                {/* Language + Currency */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label>{t('language')}</Label>
                    <Select onValueChange={(v) => setValue('preferredLanguage', v as 'EN' | 'PT' | 'ES')} defaultValue="EN" disabled={isRegistering}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="EN">English</SelectItem>
                        <SelectItem value="PT">Português</SelectItem>
                        <SelectItem value="ES">Español</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <Label>{t('currency')}</Label>
                    <Select onValueChange={(v) => setValue('preferredCurrency', v)} defaultValue="USD" disabled={isRegistering}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="USD">USD ($)</SelectItem>
                        <SelectItem value="EUR">EUR (€)</SelectItem>
                        <SelectItem value="BRL">BRL (R$)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Author-specific */}
                {selectedRole === 'AUTHOR' && (
                  <div className="space-y-1.5">
                    <Label>{t('companyName') || 'Company Name'}</Label>
                    <Input
                      placeholder={t('companyNamePlaceholder') || 'Your publishing company (optional)'}
                      {...register('companyName')}
                      className={errors.companyName ? 'border-destructive' : ''}
                      disabled={isRegistering}
                    />
                    {errors.companyName && <p className="text-sm text-destructive">{errors.companyName.message}</p>}
                  </div>
                )}

                {/* Reader-specific */}
                {selectedRole === 'READER' && (
                  <div className="space-y-5">
                    <div className="space-y-1.5">
                      <Label>{t('contentPreference') || 'Content Format Preference'} *</Label>
                      <Select onValueChange={(v) => setValue('contentPreference', v as 'EBOOK' | 'AUDIOBOOK' | 'BOTH')} disabled={isRegistering}>
                        <SelectTrigger className={errors.contentPreference ? 'border-destructive' : ''}>
                          <SelectValue placeholder={t('selectFormatPlaceholder')} />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="EBOOK">{t('contentPreferenceEbook')}</SelectItem>
                          <SelectItem value="AUDIOBOOK">{t('contentPreferenceAudiobook')}</SelectItem>
                          <SelectItem value="BOTH">{t('contentPreferenceBoth')}</SelectItem>
                        </SelectContent>
                      </Select>
                      {errors.contentPreference && <p className="text-sm text-destructive">{errors.contentPreference.message}</p>}
                    </div>

                    <div className="space-y-2">
                      <Label>{t('amazonProfileLinks') || 'Amazon Profile Links'}</Label>
                      <p className="text-xs text-gray-400">{t('amazonProfileLinksHint') || 'Add up to 3 Amazon profile URLs (optional)'}</p>
                      {amazonLinks.map((link, index) => (
                        <div key={index} className="flex gap-2">
                          <Input
                            placeholder="https://www.amazon.com/gp/profile/..."
                            value={link}
                            onChange={(e) => handleAmazonLinkChange(index, e.target.value)}
                            className={errors.amazonProfileLinks ? 'border-destructive' : ''}
                            disabled={isRegistering}
                          />
                          {amazonLinks.length > 1 && (
                            <Button type="button" variant="outline" size="icon" onClick={() => handleRemoveAmazonLink(index)} disabled={isRegistering}>
                              <X className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      ))}
                      {amazonLinks.length < 3 && (
                        <Button type="button" variant="outline" size="sm" onClick={handleAddAmazonLink} disabled={isRegistering}>
                          <Plus className="mr-2 h-4 w-4" />
                          {t('addAnotherLink') || 'Add another link'}
                        </Button>
                      )}
                    </div>
                  </div>
                )}

                {/* Affiliate-specific */}
                {selectedRole === 'AFFILIATE' && (
                  <div className="space-y-5">
                    <div className="space-y-1.5">
                      <Label>{t('websiteUrl') || 'Website URL'} *</Label>
                      <Input type="url" placeholder="https://yourblog.com" {...register('websiteUrl')} className={errors.websiteUrl ? 'border-destructive' : ''} disabled={isRegistering} />
                      {errors.websiteUrl && <p className="text-sm text-destructive">{errors.websiteUrl.message}</p>}
                    </div>

                    <div className="space-y-1.5">
                      <Label>{t('socialMediaUrls') || 'Social Media URLs'}</Label>
                      <Input placeholder="https://twitter.com/you, https://instagram.com/you" {...register('socialMediaUrls')} disabled={isRegistering} />
                      <p className="text-xs text-gray-400">{t('commaSeparatedHint')}</p>
                    </div>

                    <div className="space-y-1.5">
                      <Label>{t('promotionPlan') || 'Promotion Plan'} *</Label>
                      <Textarea
                        placeholder="Describe how you plan to promote BookProof (minimum 50 characters)..."
                        {...register('promotionPlan')}
                        className={`min-h-[100px] ${errors.promotionPlan ? 'border-destructive' : ''}`}
                        disabled={isRegistering}
                      />
                      {errors.promotionPlan && <p className="text-sm text-destructive">{errors.promotionPlan.message}</p>}
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1.5">
                        <Label>{t('estimatedReach') || 'Est. Audience Reach'}</Label>
                        <Input placeholder="e.g. 10,000 monthly visitors" {...register('estimatedReach')} disabled={isRegistering} />
                      </div>
                      <div className="space-y-1.5">
                        <Label>{t('preferredSlug') || 'Referral Slug'}</Label>
                        <Input placeholder="my-book-blog" {...register('preferredSlug')} className={errors.preferredSlug ? 'border-destructive' : ''} disabled={isRegistering} />
                        {errors.preferredSlug && <p className="text-sm text-destructive">{errors.preferredSlug.message}</p>}
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <Label>{t('paypalEmail') || 'PayPal Email'}</Label>
                      <Input type="email" placeholder="payments@youremail.com" {...register('paypalEmail')} className={errors.paypalEmail ? 'border-destructive' : ''} disabled={isRegistering} />
                      {errors.paypalEmail && <p className="text-sm text-destructive">{errors.paypalEmail.message}</p>}
                    </div>
                  </div>
                )}

                {/* Terms & marketing */}
                <div className="space-y-3 pt-1">
                  <div className="flex items-start space-x-2">
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
                  {errors.termsAccepted && <p className="text-sm text-destructive">{errors.termsAccepted.message}</p>}

                  <div className="flex items-start space-x-2">
                    <Checkbox
                      id="marketingConsent"
                      checked={marketingConsent}
                      onCheckedChange={(checked) => setValue('marketingConsent', checked as boolean)}
                      disabled={isRegistering}
                    />
                    <Label htmlFor="marketingConsent" className="cursor-pointer text-sm font-normal leading-relaxed text-gray-500">
                      {t('marketingConsent') || 'I agree to receive marketing emails and updates'}
                    </Label>
                  </div>
                </div>

                {/* Submit */}
                <Button
                  type="button"
                  className="w-full mt-1"
                  disabled={isRegistering}
                  onClick={handleRegister}
                  style={{ backgroundColor: '#3b82f6', fontWeight: 600 }}
                >
                  {isRegistering ? <Loader2 className="h-4 w-4 animate-spin" /> : t('submitButton')}
                </Button>

                {/* Legal note */}
                <p className="flex items-center justify-center gap-1.5 text-xs text-gray-400">
                  <Lock className="h-3 w-3 flex-shrink-0" />
                  {t('legalNote')}
                </p>
              </div>

              {/* Divider */}
              <div className="flex items-center gap-3 my-6">
                <div className="flex-1 h-px bg-gray-200" />
                <span className="text-gray-400 text-xs">{tAuth('common.or')}</span>
                <div className="flex-1 h-px bg-gray-200" />
              </div>

              {/* Login link */}
              <p className="text-center text-sm text-gray-500">
                {t('hasAccount')}{' '}
                <span
                  className="cursor-pointer font-semibold text-blue-600 hover:text-blue-700 hover:underline transition-colors"
                  onClick={() => { setIsLoginLoading(true); navigate('/login'); }}
                >
                  {isLoginLoading ? <Loader2 className="inline h-3 w-3 animate-spin" /> : t('signIn')}
                </span>
              </p>
            </div>
          </div>

          {/* Trust signals */}
          <div className="mt-5 flex flex-wrap justify-center gap-4">
            {(t('trustSignals', { returnObjects: true }) as string[]).map((label) => (
              <div key={label} className="flex items-center gap-1.5 text-gray-400 text-xs">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                {label}
              </div>
            ))}
          </div>

        </div>
      </div>

    </div>
  );
}
