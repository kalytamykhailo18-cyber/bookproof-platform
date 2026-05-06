import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { formatCurrency } from '@/lib/utils';
import { stripeApi } from '@/lib/api/stripe';
import { toast } from 'sonner';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  CreditCard,
  Check,
  Calendar,
  TrendingUp,
  AlertCircle,
  RefreshCw,
  XCircle,
  Loader2 } from 'lucide-react';

export function SubscriptionPage() {
  const { t, i18n } = useTranslation('subscription');

  const [subscription, setSubscription] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreatingCheckout, setIsCreatingCheckout] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);

  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [cancelFeedback, setCancelFeedback] = useState('');

  // Fetch subscription
  useEffect(() => {
    const fetchSubscription = async () => {
      try {
        setIsLoading(true);
        const data = await stripeApi.subscriptions.getMySubscription();
        // Set to null if no active subscription
        setSubscription(data.subscription ? data : null);
      } catch (error: any) {
        console.error('Subscription error:', error);
        setSubscription(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSubscription();
  }, []);

  const refetchSubscription = async () => {
    try {
      const data = await stripeApi.subscriptions.getMySubscription();
      // Set to null if no active subscription
      setSubscription(data.subscription ? data : null);
    } catch (error: any) {
      console.error('Subscription refetch error:', error);
      setSubscription(null);
    }
  };

  // Get feature translations
  const getFeatureText = (featureKey: string, credits?: number) => {
    switch (featureKey) {
      case 'creditsPerMonth':
        return `${credits} ${t('plans.creditsPerMonth')}`;
      case 'autoRenewal':
        return t('features.autoRenewal');
      case 'emailSupport':
        return t('features.emailSupport');
      case 'cancelAnytime':
        return t('features.cancelAnytime');
      case 'prioritySupport':
        return t('features.prioritySupport');
      case 'analyticsDashboard':
        return t('features.analyticsDashboard');
      case 'dedicatedSupport':
        return t('features.dedicatedSupport');
      case 'advancedAnalytics':
        return t('features.advancedAnalytics');
      case 'bulkOperations':
        return t('features.bulkOperations');
      default:
        return featureKey;
    }
  };

  // Subscription plans
  const plans = [
    {
      id: 'plan_basic',
      nameKey: 'plans.basic.name',
      descriptionKey: 'plans.basic.description',
      creditsPerMonth: 50,
      pricePerMonth: 79.99,
      currency: 'USD',
      features: ['creditsPerMonth', 'autoRenewal', 'emailSupport', 'cancelAnytime'],
      popular: false
    },
    {
      id: 'plan_professional',
      nameKey: 'plans.professional.name',
      descriptionKey: 'plans.professional.description',
      creditsPerMonth: 100,
      pricePerMonth: 129.99,
      currency: 'USD',
      features: ['creditsPerMonth', 'autoRenewal', 'prioritySupport', 'analyticsDashboard', 'cancelAnytime'],
      popular: true
    },
    {
      id: 'plan_premium',
      nameKey: 'plans.premium.name',
      descriptionKey: 'plans.premium.description',
      creditsPerMonth: 250,
      pricePerMonth: 299.99,
      currency: 'USD',
      features: ['creditsPerMonth', 'autoRenewal', 'dedicatedSupport', 'advancedAnalytics', 'bulkOperations', 'cancelAnytime'],
      popular: false
    },
  ];

  const handleSubscribe = async (stripePriceId: string) => {
    const successUrl = `${window.location.origin}/author/subscription/success`;
    const cancelUrl = `${window.location.origin}/author/subscription`;

    try {
      setIsCreatingCheckout(true);
      const response = await stripeApi.subscriptions.createCheckout({
        stripePriceId,
        successUrl,
        cancelUrl,
      });

      // Redirect to Stripe checkout
      if (response.checkoutUrl) {
        window.location.href = response.checkoutUrl;
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to create subscription checkout');
    } finally {
      setIsCreatingCheckout(false);
    }
  };

  const handleCancelSubscription = async () => {
    if (!subscription) return;

    try {
      setIsCancelling(true);
      const response = await stripeApi.subscriptions.cancelSubscription(
        subscription.subscription.id,
        {
          cancelImmediately: false,
          cancellationReason: cancelReason || cancelFeedback || undefined,
        }
      );

      toast.success(response.message);
      await refetchSubscription();
      setCancelDialogOpen(false);
      setCancelReason('');
      setCancelFeedback('');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to cancel subscription');
    } finally {
      setIsCancelling(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString(i18n.language || 'en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex h-64 items-center justify-center">
          <p className="text-sm sm:text-base text-muted-foreground">{t('loading')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto space-y-8 px-4 py-8">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold">{t('title')}</h1>
        <p className="text-sm sm:text-base text-muted-foreground">{t('description')}</p>
      </div>

      {/* Current Subscription Status */}
      {subscription ? (
        <Card className="border-primary">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <RefreshCw className="h-5 w-5 text-primary" />
                  {t('active.title')}
                </CardTitle>
                <CardDescription>{subscription.subscription.planName}</CardDescription>
              </div>
              <Badge
                variant={
                  subscription.subscription.status === 'active'
                    ? 'default'
                    : subscription.subscription.status === 'past_due'
                      ? 'destructive'
                      : 'secondary'
                }
              >
                {subscription.status.statusDisplay}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4 sm:space-y-6">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
              <div>
                <p className="mb-1 text-sm text-muted-foreground">{t('active.monthlyCredits')}</p>
                <p className="text-2xl font-bold">{subscription.subscription.creditsPerMonth}</p>
              </div>
              <div>
                <p className="mb-1 text-sm text-muted-foreground">{t('active.monthlyPrice')}</p>
                <p className="text-2xl font-bold">
                  {formatCurrency(subscription.subscription.pricePerMonth, subscription.subscription.currency || 'USD', i18n.language)}
                </p>
              </div>
              <div>
                <p className="mb-1 text-sm text-muted-foreground">{t('active.totalAllocated')}</p>
                <p className="text-2xl font-bold">
                  {subscription.subscription.totalCreditsAllocated}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 border-t pt-4 md:grid-cols-2">
              <div className="flex items-start gap-3">
                <Calendar className="mt-0.5 h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">{t('active.started')}</p>
                  <p className="text-sm text-muted-foreground">
                    {formatDate(subscription.subscription.createdAt)}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <RefreshCw className="mt-0.5 h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">{t('active.nextRenewal')}</p>
                  <p className="text-sm text-muted-foreground">
                    {subscription.subscription.currentPeriodEnd
                      ? formatDate(subscription.subscription.currentPeriodEnd)
                      : 'N/A'}
                  </p>
                </div>
              </div>
            </div>

            {subscription.subscription.status === 'past_due' && (
              <div className="flex items-start gap-3 rounded-md border border-destructive/20 bg-destructive/10 p-4">
                <AlertCircle className="mt-0.5 h-5 w-5 text-destructive" />
                <div>
                  <p className="text-sm font-medium text-destructive">{t('active.pastDue.title')}</p>
                  <p className="text-sm text-muted-foreground">
                    {t('active.pastDue.message')}
                  </p>
                </div>
              </div>
            )}
          </CardContent>
          <CardFooter className="flex gap-2">
            <Button variant="outline">{t('active.updatePaymentMethod')}</Button>
            <Dialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="destructive">
                  <XCircle className="mr-2 h-4 w-4" />
                  {t('active.cancelSubscription')}
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>{t('cancel.title')}</DialogTitle>
                  <DialogDescription>
                    {t('cancel.description')}
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="cancelReason">{t('cancel.reasonLabel')}</Label>
                    <Textarea
                      id="cancelReason"
                      value={cancelReason}
                      onChange={(e) => setCancelReason(e.target.value)}
                      placeholder={t('cancel.reasonPlaceholder')}
                      rows={3}
                    />
                  </div>
                  <div>
                    <Label htmlFor="cancelFeedback">{t('cancel.feedbackLabel')}</Label>
                    <Textarea
                      id="cancelFeedback"
                      value={cancelFeedback}
                      onChange={(e) => setCancelFeedback(e.target.value)}
                      placeholder={t('cancel.feedbackPlaceholder')}
                      rows={3}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setCancelDialogOpen(false)}>
                    {t('cancel.keepButton')}
                  </Button>
                  <Button
                    type="button"
                    variant="destructive"
                    onClick={handleCancelSubscription}
                    disabled={!cancelReason || isCancelling}
                  >
                    {isCancelling ? <Loader2 className="h-4 w-4 animate-spin" /> : t('cancel.confirmButton')}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </CardFooter>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>{t('noSubscription.title')}</CardTitle>
            <CardDescription>{t('noSubscription.description')}</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm sm:text-base text-muted-foreground">
              {t('noSubscription.message')}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Available Plans */}
      {!subscription && (
        <>
          <div>
            <h2 className="mb-2 text-2xl font-bold">{t('plans.title')}</h2>
            <p className="text-sm sm:text-base text-muted-foreground">
              {t('plans.description')}
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {plans.map((plan) => (
              <Card
                key={plan.id}
                className={`relative ${plan.popular ? 'border-primary shadow-lg' : ''}`}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <Badge className="bg-primary text-primary-foreground">{t('plans.mostPopular')}</Badge>
                  </div>
                )}
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>{t(plan.nameKey)}</CardTitle>
                    <RefreshCw className="h-6 w-6 text-muted-foreground" />
                  </div>
                  <CardDescription>{t(plan.descriptionKey)}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <div className="flex items-baseline gap-2">
                      <span className="text-4xl font-bold">{formatCurrency(plan.pricePerMonth, plan.currency || 'USD', i18n.language)}</span>
                      <span className="text-sm sm:text-base text-muted-foreground">{t('plans.perMonth')}</span>
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {plan.creditsPerMonth} {t('plans.creditsPerMonth')}
                    </p>
                  </div>

                  <div className="space-y-2">
                    {plan.features.map((feature, index) => (
                      <div key={index} className="flex items-start gap-2">
                        <Check className="mt-0.5 h-4 w-4 flex-shrink-0 text-green-500" />
                        <span className="text-sm">{getFeatureText(feature, feature === 'creditsPerMonth' ? plan.creditsPerMonth : undefined)}</span>
                      </div>
                    ))}
                  </div>

                  <div className="pt-2">
                    <p className="text-xs text-muted-foreground">
                      {t('plans.pricePerCredit')}: {formatCurrency(plan.pricePerMonth / plan.creditsPerMonth, plan.currency || 'USD', i18n.language)}
                    </p>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button
                    className="w-full"
                    variant={plan.popular ? 'default' : 'outline'}
                    onClick={() => handleSubscribe(plan.id)}
                    disabled={isCreatingCheckout}
                  >
                    <CreditCard className="mr-2 h-4 w-4" />
                    {isCreatingCheckout ? <Loader2 className="h-4 w-4 animate-spin" /> : t('plans.subscribeButton')}
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </>
      )}

      {/* Benefits Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            {t('benefits.title')}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="flex items-start gap-3">
              <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-primary/10">
                <Check className="h-4 w-4 text-primary" />
              </div>
              <div>
                <h4 className="mb-1 font-medium">{t('benefits.automaticCredits.title')}</h4>
                <p className="text-sm text-muted-foreground">
                  {t('benefits.automaticCredits.description')}
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-primary/10">
                <Check className="h-4 w-4 text-primary" />
              </div>
              <div>
                <h4 className="mb-1 font-medium">{t('benefits.betterValue.title')}</h4>
                <p className="text-sm text-muted-foreground">
                  {t('benefits.betterValue.description')}
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-primary/10">
                <Check className="h-4 w-4 text-primary" />
              </div>
              <div>
                <h4 className="mb-1 font-medium">{t('benefits.flexibleCancellation.title')}</h4>
                <p className="text-sm text-muted-foreground">
                  {t('benefits.flexibleCancellation.description')}
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-primary/10">
                <Check className="h-4 w-4 text-primary" />
              </div>
              <div>
                <h4 className="mb-1 font-medium">{t('benefits.prioritySupport.title')}</h4>
                <p className="text-sm text-muted-foreground">
                  {t('benefits.prioritySupport.description')}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* FAQ Section */}
      <Card>
        <CardHeader>
          <CardTitle>{t('faq.title')}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h4 className="mb-1 font-medium">{t('faq.question1')}</h4>
            <p className="text-sm text-muted-foreground">
              {t('faq.answer1')}
            </p>
          </div>
          <div>
            <h4 className="mb-1 font-medium">{t('faq.question2')}</h4>
            <p className="text-sm text-muted-foreground">
              {t('faq.answer2')}
            </p>
          </div>
          <div>
            <h4 className="mb-1 font-medium">{t('faq.question3')}</h4>
            <p className="text-sm text-muted-foreground">
              {t('faq.answer3')}
            </p>
          </div>
          <div>
            <h4 className="mb-1 font-medium">{t('faq.question4')}</h4>
            <p className="text-sm text-muted-foreground">
              {t('faq.answer4')}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
