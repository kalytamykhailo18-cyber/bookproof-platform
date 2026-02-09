import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { trackView, submitLead, type Language } from '@/lib/api/landing-pages';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Check,
  Star,
  Shield,
  TrendingUp,
  Clock,
  Users,
  HeadphonesIcon,
  Mail,
  MessageCircle,
  BookOpen,
  CreditCard,
  Send,
  ThumbsUp,
  Gift,
  BookMarked,
  Wallet,
  Loader2 } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger } from '@/components/ui/accordion';
import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { useSearchParams } from 'react-router-dom';
import { useRecaptcha } from '@/hooks/useRecaptcha';
import Autoplay from 'embla-carousel-autoplay';
import { Carousel, CarouselContent, CarouselItem, CarouselPrevious, CarouselNext, CarouselDots } from '@/components/ui/carousel';

// Lead form validation schema
const leadFormSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email address'),
  userType: z.enum(['author', 'reader', 'both']).optional(),
  marketingConsent: z.boolean().optional() });

type LeadFormData = z.infer<typeof leadFormSchema>;

// Hero Section
function HeroSection() {
  const { t, i18n } = useTranslation('hero');
  const navigate = useNavigate();

  return (
    <section className="py-20 md:py-32">
      <div className="container">
        <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2 lg:gap-16">
          <div className="flex flex-col gap-6">
            <h1 className="animate-fade-up text-4xl font-bold leading-tight md:text-5xl lg:text-6xl">
              {t('title')}
            </h1>
            <p className="animate-fade-up-light-slow text-lg text-muted-foreground md:text-xl">
              {t('subtitle')}
            </p>
            <div className="flex animate-fade-up-slow flex-col gap-4 sm:flex-row">
              <Button type="button" size="lg" className="text-lg" onClick={() => navigate(`/${i18n.language}/register`)}>
                {t('cta.primary')}
              </Button>
              <Button type="button" size="lg" variant="outline" className="text-lg" onClick={() => navigate(`/${i18n.language}/login`)}>
                {t('cta.secondary')}
              </Button>
            </div>
            <div className="grid animate-fade-up-very-slow grid-cols-3 gap-6 pt-8">
              <StatsCard label={t('stats.reviews')} value="10K+" />
              <StatsCard label={t('stats.authors')} value="500+" />
              <StatsCard label={t('stats.readers')} value="2K+" />
            </div>
          </div>
          <div className="relative animate-zoom-in-slow">
            <div className="relative aspect-square overflow-hidden rounded-2xl">
              <img
                src="https://res.cloudinary.com/dcfjvxt5h/image/upload/v1769013154/Frame_39-removebg-preview_ybrxls.png"
                alt="BookProof Hero"
                className="h-full w-full object-contain"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// Stats Card Component
function StatsCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="text-center">
      <div className="text-3xl font-bold text-primary">{value}</div>
      <div className="mt-1 text-sm text-muted-foreground">{label}</div>
    </div>
  );
}

// How It Works Section
function HowItWorksSection() {
  const { t } = useTranslation('howItWorks');

  const steps = [
    {
      icon: <CreditCard className="h-8 w-8" />,
      stepKey: 'steps.purchase',
      animation: 'animate-fade-up-fast' },
    {
      icon: <BookOpen className="h-8 w-8" />,
      stepKey: 'steps.submit',
      animation: 'animate-fade-up' },
    {
      icon: <Send className="h-8 w-8" />,
      stepKey: 'steps.distribute',
      animation: 'animate-fade-up-light-slow' },
    {
      icon: <ThumbsUp className="h-8 w-8" />,
      stepKey: 'steps.reviews',
      animation: 'animate-fade-up-slow' },
  ];

  return (
    <section id="how-it-works" className="py-20">
      <div className="container">
        <div className="mb-16 animate-fade-down text-center">
          <h2 className="mb-4 text-3xl font-bold md:text-4xl">{t('title')}</h2>
          <p className="mx-auto max-w-2xl text-lg text-muted-foreground">{t('subtitle')}</p>
        </div>
        <div className="mx-auto grid max-w-5xl grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
          {steps.map((step, index) => (
            <div key={index} className={`${step.animation} text-center`}>
              <div className="relative mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-primary/10 text-primary">
                {step.icon}
                <span className="absolute -right-2 -top-2 flex h-8 w-8 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
                  {index + 1}
                </span>
              </div>
              <h3 className="mb-2 text-lg font-semibold">{t(`${step.stepKey}.title`)}</h3>
              <p className="text-sm text-muted-foreground">{t(`${step.stepKey}.description`)}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// Features Section
function FeaturesSection() {
  const { t } = useTranslation('features');

  const features = [
    {
      icon: <Check className="h-6 w-6" />,
      titleKey: 'items.authentic.title',
      descKey: 'items.authentic.description',
      animation: 'animate-fade-up-fast' },
    {
      icon: <TrendingUp className="h-6 w-6" />,
      titleKey: 'items.distributed.title',
      descKey: 'items.distributed.description',
      animation: 'animate-fade-up' },
    {
      icon: <Clock className="h-6 w-6" />,
      titleKey: 'items.tracking.title',
      descKey: 'items.tracking.description',
      animation: 'animate-fade-up-light-slow' },
    {
      icon: <Users className="h-6 w-6" />,
      titleKey: 'items.flexible.title',
      descKey: 'items.flexible.description',
      animation: 'animate-fade-down-fast' },
    {
      icon: <Shield className="h-6 w-6" />,
      titleKey: 'items.guarantee.title',
      descKey: 'items.guarantee.description',
      animation: 'animate-fade-down' },
    {
      icon: <HeadphonesIcon className="h-6 w-6" />,
      titleKey: 'items.support.title',
      descKey: 'items.support.description',
      animation: 'animate-fade-down-light-slow' },
  ];

  return (
    <section id="features" className="bg-muted/50 py-20">
      <div className="container">
        <div className="mb-16 animate-fade-down text-center">
          <h2 className="mb-4 text-3xl font-bold md:text-4xl">{t('title')}</h2>
          <p className="mx-auto max-w-2xl text-lg text-muted-foreground">{t('subtitle')}</p>
        </div>
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
          {features.map((feature, index) => (
            <Card key={index} className={`${feature.animation} transition-shadow hover:shadow-lg`}>
              <CardContent className="pt-6">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-md bg-primary/10 text-primary">
                  {feature.icon}
                </div>
                <h3 className="mb-2 text-xl font-semibold">{t(feature.titleKey)}</h3>
                <p className="text-muted-foreground">{t(feature.descKey)}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}

// Reader Benefits Section
function ReaderBenefitsSection() {
  const { t } = useTranslation('readerBenefits');

  const benefits = [
    {
      icon: <Gift className="h-6 w-6" />,
      titleKey: 'items.freeBooks.title',
      descKey: 'items.freeBooks.description',
      animation: 'animate-fade-up-fast' },
    {
      icon: <Wallet className="h-6 w-6" />,
      titleKey: 'items.earnMoney.title',
      descKey: 'items.earnMoney.description',
      animation: 'animate-fade-up' },
    {
      icon: <BookMarked className="h-6 w-6" />,
      titleKey: 'items.discoverBooks.title',
      descKey: 'items.discoverBooks.description',
      animation: 'animate-fade-up-light-slow' },
  ];

  return (
    <section id="reader-benefits" className="py-20">
      <div className="container">
        <div className="mb-16 animate-fade-down text-center">
          <h2 className="mb-4 text-3xl font-bold md:text-4xl">{t('title')}</h2>
          <p className="mx-auto max-w-2xl text-lg text-muted-foreground">{t('subtitle')}</p>
        </div>
        <div className="mx-auto grid max-w-4xl grid-cols-1 gap-8 md:grid-cols-3">
          {benefits.map((benefit, index) => (
            <Card key={index} className={`${benefit.animation} transition-shadow hover:shadow-lg`}>
              <CardContent className="pt-6 text-center">
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                  {benefit.icon}
                </div>
                <h3 className="mb-2 text-xl font-semibold">{t(benefit.titleKey)}</h3>
                <p className="text-muted-foreground">{t(benefit.descKey)}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}

// Testimonials Section - Per Requirements 10.1
function TestimonialsSection() {
  const { t } = useTranslation('testimonials');

  const testimonials = [
    { quoteKey: 'items.t1.quote', authorKey: 'items.t1.author', titleKey: 'items.t1.title', rating: 5, photo: 'https://randomuser.me/api/portraits/women/44.jpg' },
    { quoteKey: 'items.t2.quote', authorKey: 'items.t2.author', titleKey: 'items.t2.title', rating: 5, photo: 'https://randomuser.me/api/portraits/men/32.jpg' },
    { quoteKey: 'items.t3.quote', authorKey: 'items.t3.author', titleKey: 'items.t3.title', rating: 5, photo: 'https://randomuser.me/api/portraits/women/68.jpg' },
    { quoteKey: 'items.t4.quote', authorKey: 'items.t4.author', titleKey: 'items.t4.title', rating: 5, photo: 'https://randomuser.me/api/portraits/men/75.jpg' },
    { quoteKey: 'items.t5.quote', authorKey: 'items.t5.author', titleKey: 'items.t5.title', rating: 5, photo: 'https://randomuser.me/api/portraits/women/26.jpg' },
    { quoteKey: 'items.t6.quote', authorKey: 'items.t6.author', titleKey: 'items.t6.title', rating: 5, photo: 'https://randomuser.me/api/portraits/men/46.jpg' },
    { quoteKey: 'items.t7.quote', authorKey: 'items.t7.author', titleKey: 'items.t7.title', rating: 5, photo: 'https://randomuser.me/api/portraits/women/52.jpg' },
    { quoteKey: 'items.t8.quote', authorKey: 'items.t8.author', titleKey: 'items.t8.title', rating: 5, photo: 'https://randomuser.me/api/portraits/men/22.jpg' },
    { quoteKey: 'items.t9.quote', authorKey: 'items.t9.author', titleKey: 'items.t9.title', rating: 5, photo: 'https://randomuser.me/api/portraits/women/33.jpg' },
  ];

  const renderStars = (rating: number) => {
    return (
      <div className="flex gap-1">
        {[...Array(5)].map((_, i) => (
          <Star
            key={i}
            className={`h-4 w-4 ${i < rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
          />
        ))}
      </div>
    );
  };

  return (
    <section id="testimonials" className="bg-muted/50 py-20">
      <div className="container">
        <div className="mb-12 animate-fade-down text-center">
          <h2 className="mb-4 text-3xl font-bold md:text-4xl">{t('title')}</h2>
          <p className="mx-auto max-w-2xl text-lg text-muted-foreground">{t('subtitle')}</p>
        </div>
        <div className="mx-auto max-w-6xl px-12">
          <Carousel
            opts={{
              align: 'start',
              loop: true }}
            plugins={[
              Autoplay({
                delay: 3000,
                stopOnInteraction: false,
                stopOnMouseEnter: true }),
            ]}
            className="w-full"
          >
            <CarouselContent className="-ml-4">
              {testimonials.map((testimonial, index) => (
                <CarouselItem key={index} className="pl-4 md:basis-1/2 lg:basis-1/3">
                  <Card className="h-full transition-shadow hover:shadow-lg">
                    <CardContent className="flex h-full flex-col pt-6">
                      <div className="mb-4">{renderStars(testimonial.rating)}</div>
                      <p className="mb-4 flex-grow italic text-muted-foreground">"{t(testimonial.quoteKey)}"</p>
                      <div className="flex items-center gap-3 border-t pt-4">
                        <img
                          src={testimonial.photo}
                          alt={t(testimonial.authorKey)}
                          className="h-12 w-12 rounded-full object-cover"
                        />
                        <div>
                          <p className="font-semibold">{t(testimonial.authorKey)}</p>
                          <p className="text-sm text-muted-foreground">{t(testimonial.titleKey)}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious className="hidden md:flex" />
            <CarouselNext className="hidden md:flex" />
            <CarouselDots />
          </Carousel>
        </div>
      </div>
    </section>
  );
}

// Pricing Section
function PricingSection() {
  const { t, i18n } = useTranslation('pricing');
  const navigate = useNavigate();

  const packages = [
    {
      name: 'packages.starter.name',
      credits: 'packages.starter.credits',
      validity: 'packages.starter.validity',
      reviews: 'packages.starter.reviews',
      duration: 'packages.starter.duration',
      features: [
        'packages.starter.features.0',
        'packages.starter.features.1',
        'packages.starter.features.2',
        'packages.starter.features.3',
        'packages.starter.features.4',
      ],
      popular: false,
      animation: 'animate-zoom-in-fast' },
    {
      name: 'packages.growth.name',
      credits: 'packages.growth.credits',
      validity: 'packages.growth.validity',
      reviews: 'packages.growth.reviews',
      duration: 'packages.growth.duration',
      features: [
        'packages.growth.features.0',
        'packages.growth.features.1',
        'packages.growth.features.2',
        'packages.growth.features.3',
      ],
      popular: true,
      animation: 'animate-zoom-in' },
    {
      name: 'packages.professional.name',
      credits: 'packages.professional.credits',
      validity: 'packages.professional.validity',
      reviews: 'packages.professional.reviews',
      duration: 'packages.professional.duration',
      features: [
        'packages.professional.features.0',
        'packages.professional.features.1',
        'packages.professional.features.2',
        'packages.professional.features.3',
      ],
      popular: false,
      animation: 'animate-zoom-in-light-slow' },
  ];

  return (
    <section id="pricing" className="py-20">
      <div className="container">
        <div className="mb-16 animate-fade-up text-center">
          <h2 className="mb-4 text-3xl font-bold md:text-4xl">{t('title')}</h2>
          <p className="mx-auto max-w-2xl text-lg text-muted-foreground">{t('subtitle')}</p>
        </div>
        <div className="mx-auto grid max-w-6xl grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
          {packages.map((pkg, index) => (
            <Card
              key={index}
              className={`${pkg.animation} relative ${pkg.popular ? 'border-primary shadow-lg' : ''}`}
            >
              {pkg.popular && (
                <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 animate-fade-down-fast">
                  Popular
                </Badge>
              )}
              <CardContent className="pt-6">
                <div className="mb-6 text-center">
                  <h3 className="mb-2 text-2xl font-bold">{t(pkg.name)}</h3>
                  <div className="mb-1 text-3xl font-bold text-primary">{t(pkg.credits)}</div>
                  <div className="text-sm text-muted-foreground">{t(pkg.validity)}</div>
                </div>
                <div className="mb-6 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Reviews:</span>
                    <span className="font-semibold">{t(pkg.reviews)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Duration:</span>
                    <span className="font-semibold">{t(pkg.duration)}</span>
                  </div>
                </div>
                <ul className="mb-6 space-y-3">
                  {pkg.features.map((feature, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <Check className="mt-0.5 h-5 w-5 flex-shrink-0 text-primary" />
                      <span className="text-sm">{t(feature)}</span>
                    </li>
                  ))}
                </ul>
                <Button className="w-full" variant={pkg.popular ? 'default' : 'outline'} onClick={() => navigate(`/${i18n.language}/register`)}>
                  {t('cta')}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}

// Lead Capture Form
function LeadCaptureForm() {
  const { t, i18n } = useTranslation('leadForm');
  const [searchParams] = useSearchParams();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [utmParams, setUtmParams] = useState<Record<string, string>>({});
  // reCAPTCHA hook for bot protection (Section 15.2)
  const { executeRecaptcha, isEnabled: isRecaptchaEnabled } = useRecaptcha();

  const {
    register,
    trigger,
    getValues,
    formState: { errors },
    setValue,
    watch,
    reset } = useForm<LeadFormData>({
    resolver: zodResolver(leadFormSchema),
    defaultValues: {
      marketingConsent: false } });

  const userType = watch('userType');
  const marketingConsent = watch('marketingConsent');

  // Extract UTM parameters on mount - Per Requirements 10.3
  // Capture: utm_source, utm_medium, utm_campaign, utm_content, utm_term, ref (affiliate code)
  useEffect(() => {
    const params: Record<string, string> = {};
    searchParams.forEach((value, key) => {
      if (key.startsWith('utm_') || key === 'ref') {
        params[key] = value;
      }
    });
    setUtmParams(params);

    // Track page view
    trackView({
      language: i18n.language.toUpperCase() as Language,
      source: params.utm_source,
      medium: params.utm_medium,
      campaign: params.utm_campaign,
      content: params.utm_content,
      term: params.utm_term,
      affiliateRef: params.ref,
      referrer: document.referrer || undefined,
    }).catch(() => {
      // Silent fail for tracking
    });
  }, [searchParams, i18n.language]);

  const handleFormSubmit = async () => {
    const isValid = await trigger();
    if (!isValid) return;

    const data = getValues();
    setIsSubmitting(true);
    try {
      // Get reCAPTCHA token if enabled (Section 15.2)
      let captchaToken: string | undefined;
      if (isRecaptchaEnabled) {
        try {
          captchaToken = await executeRecaptcha('lead_capture');
        } catch {
          toast.error('Security verification failed. Please try again.');
          setIsSubmitting(false);
          return;
        }
      }

      const result = await submitLead({
        email: data.email,
        name: data.name,
        userType: data.userType || 'both',
        marketingConsent: data.marketingConsent ?? false,
        language: i18n.language.toUpperCase() as Language,
        source: utmParams.utm_source,
        medium: utmParams.utm_medium,
        campaign: utmParams.utm_campaign,
        content: utmParams.utm_content,
        term: utmParams.utm_term,
        affiliateRef: utmParams.ref,
        referrer: document.referrer || undefined,
        captchaToken, // Section 15.2: CAPTCHA token for bot protection
      });

      // Check if this is a duplicate submission (already on waitlist)
      if (result.message?.includes('already')) {
        toast.info(t('alreadySubscribed'));
      } else {
        toast.success(t('success'));
      }
      setIsSubmitted(true);
      reset();
    } catch (error: unknown) {
      // Handle error response - check for CAPTCHA failure
      const err = error as { response?: { data?: { message?: string } } };
      if (err.response?.data?.message?.includes('CAPTCHA')) {
        toast.error('Security verification failed. Please try again.');
      } else {
        toast.error(t('error'));
      }
      setIsSubmitting(false);
    }
  };

  return (
    <section className="bg-muted/50 py-20">
      <div className="container">
        <Card className="mx-auto max-w-2xl animate-zoom-in">
          <CardContent className="pt-6">
            <div className="mb-8 text-center">
              <h2 className="mb-2 text-3xl font-bold">{t('title')}</h2>
              <p className="text-muted-foreground">{t('subtitle')}</p>
            </div>
            {isSubmitted ? (
              <div className="py-8 text-center">
                <Check className="mx-auto mb-4 h-16 w-16 text-primary" />
                <p className="text-lg font-medium">{t('success')}</p>
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <Label htmlFor="name">{t('fields.name.label')} *</Label>
                  <Input
                    id="name"
                    type="text"
                    placeholder={t('fields.name.placeholder')}
                    {...register('name')}
                  />
                  {errors.name && (
                    <p className="mt-1 text-sm text-destructive">{errors.name.message}</p>
                  )}
                </div>
                <div>
                  <Label htmlFor="email">{t('fields.email.label')} *</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder={t('fields.email.placeholder')}
                    {...register('email')}
                  />
                  {errors.email && (
                    <p className="mt-1 text-sm text-destructive">{errors.email.message}</p>
                  )}
                </div>
                <div>
                  <Label htmlFor="userType">{t('fields.userType.label')}</Label>
                  <Select
                    value={userType ?? ''}
                    onValueChange={(value) =>
                      setValue('userType', value as 'author' | 'reader' | 'both')
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={t('fields.userType.label')} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="author">{t('fields.userType.options.author')}</SelectItem>
                      <SelectItem value="reader">{t('fields.userType.options.reader')}</SelectItem>
                      <SelectItem value="both">{t('fields.userType.options.both')}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-start space-x-2">
                  <Checkbox
                    id="marketingConsent"
                    checked={marketingConsent}
                    onCheckedChange={(checked) => setValue('marketingConsent', checked === true)}
                  />
                  <Label htmlFor="marketingConsent" className="text-sm font-normal leading-snug">
                    {t('fields.marketingConsent.label')}
                  </Label>
                </div>
                <Button
                  type="button"
                  className="w-full"
                  onClick={handleFormSubmit}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : t('cta')}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </section>
  );
}

// FAQ Section
function FAQSection() {
  const { t } = useTranslation('faq');

  const faqItems = [
    { id: 'q1', questionKey: 'items.q1.question', answerKey: 'items.q1.answer' },
    { id: 'q2', questionKey: 'items.q2.question', answerKey: 'items.q2.answer' },
    { id: 'q3', questionKey: 'items.q3.question', answerKey: 'items.q3.answer' },
    { id: 'q4', questionKey: 'items.q4.question', answerKey: 'items.q4.answer' },
    { id: 'q5', questionKey: 'items.q5.question', answerKey: 'items.q5.answer' },
    { id: 'q6', questionKey: 'items.q6.question', answerKey: 'items.q6.answer' },
  ];

  return (
    <section id="faq" className="py-20">
      <div className="container">
        <div className="mb-16 animate-fade-up text-center">
          <h2 className="mb-4 text-3xl font-bold md:text-4xl">{t('title')}</h2>
        </div>
        <div className="mx-auto max-w-3xl">
          <Accordion type="single" collapsible className="w-full">
            {faqItems.map((item, index) => (
              <AccordionItem
                key={item.id}
                value={item.id}
                className={
                  index === 0
                    ? 'animate-fade-up-fast'
                    : index < 3
                      ? 'animate-fade-up'
                      : 'animate-fade-up-slow'
                }
              >
                <AccordionTrigger className="text-left">{t(item.questionKey)}</AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  {t(item.answerKey)}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </section>
  );
}

// Contact Section
function ContactSection() {
  const { t } = useTranslation('contact');

  return (
    <section id="contact" className="bg-muted/50 py-20">
      <div className="container">
        <div className="mb-12 animate-fade-up text-center">
          <h2 className="mb-4 text-3xl font-bold md:text-4xl">{t('title')}</h2>
          <p className="mx-auto max-w-2xl text-lg text-muted-foreground">{t('subtitle')}</p>
        </div>
        <div className="mx-auto grid max-w-4xl grid-cols-1 gap-8 md:grid-cols-2">
          <Card className="animate-fade-right">
            <CardContent className="flex items-start gap-4 pt-6">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
                <Mail className="h-6 w-6" />
              </div>
              <div>
                <h3 className="mb-1 text-lg font-semibold">{t('email.title')}</h3>
                <p className="mb-2 text-sm text-muted-foreground">{t('email.description')}</p>
                <Button
                  type="button"
                  variant="link"
                  className="h-auto p-0 text-primary hover:underline"
                  onClick={() => window.open('mailto:support@bookproof.app', '_self')}
                >
                  support@bookproof.app
                </Button>
              </div>
            </CardContent>
          </Card>
          <Card className="animate-fade-left">
            <CardContent className="flex items-start gap-4 pt-6">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
                <MessageCircle className="h-6 w-6" />
              </div>
              <div>
                <h3 className="mb-1 text-lg font-semibold">{t('support.title')}</h3>
                <p className="mb-2 text-sm text-muted-foreground">{t('support.description')}</p>
                <p className="text-sm text-muted-foreground">{t('support.hours')}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}

// Main Landing Page
export function LandingPage() {
  return (
    <>
      <HeroSection />
      <HowItWorksSection />
      <FeaturesSection />
      <ReaderBenefitsSection />
      <PricingSection />
      <TestimonialsSection />
      <FAQSection />
      <LeadCaptureForm />
      <ContactSection />
    </>
  );
}
