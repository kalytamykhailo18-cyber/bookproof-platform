import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
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
  const { t: _t } = useTranslation('subscription');
  void _t; // Will use later for translations

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
        setSubscription(data);
      } catch (error: any) {
        // Return null for 404 (no subscription)
        if (error.response?.status === 404) {
          setSubscription(null);
        } else {
          console.error('Subscription error:', error);
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchSubscription();
  }, []);

  const refetchSubscription = async () => {
    try {
      const data = await stripeApi.subscriptions.getMySubscription();
      setSubscription(data);
    } catch (error: any) {
      if (error.response?.status === 404) {
        setSubscription(null);
      } else {
        console.error('Subscription refetch error:', error);
      }
    }
  };

  // Example subscription plans - these would typically come from an API
  const plans = [
    {
      id: 'plan_basic',
      name: 'Basic Monthly',
      creditsPerMonth: 50,
      pricePerMonth: 79.99,
      currency: 'USD',
      description: 'Regular monthly credits',
      features: ['50 Credits Per Month', 'Auto-Renewal', 'Email Support', 'Cancel Anytime'],
      popular: false },
    {
      id: 'plan_professional',
      name: 'Professional Monthly',
      creditsPerMonth: 100,
      pricePerMonth: 129.99,
      currency: 'USD',
      description: 'Best value for active authors',
      features: [
        '100 Credits Per Month',
        'Auto-Renewal',
        'Priority Support',
        'Analytics Dashboard',
        'Cancel Anytime',
      ],
      popular: true },
    {
      id: 'plan_premium',
      name: 'Premium Monthly',
      creditsPerMonth: 250,
      pricePerMonth: 299.99,
      currency: 'USD',
      description: 'For prolific authors',
      features: [
        '250 Credits Per Month',
        'Auto-Renewal',
        'Dedicated Support',
        'Advanced Analytics',
        'Bulk Operations',
        'Cancel Anytime',
      ],
      popular: false },
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
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric' });
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex h-64 items-center justify-center">
          <p className="text-muted-foreground">Loading subscription...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto space-y-8 px-4 py-8">
      <div>
        <h1 className="text-3xl font-bold">Subscription Management</h1>
        <p className="text-muted-foreground">Manage your monthly credit subscription</p>
      </div>

      {/* Current Subscription Status */}
      {subscription ? (
        <Card className="border-primary">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <RefreshCw className="h-5 w-5 text-primary" />
                  Active Subscription
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
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
              <div>
                <p className="mb-1 text-sm text-muted-foreground">Monthly Credits</p>
                <p className="text-2xl font-bold">{subscription.subscription.creditsPerMonth}</p>
              </div>
              <div>
                <p className="mb-1 text-sm text-muted-foreground">Monthly Price</p>
                <p className="text-2xl font-bold">
                  ${subscription.subscription.pricePerMonth.toFixed(2)}
                </p>
              </div>
              <div>
                <p className="mb-1 text-sm text-muted-foreground">Total Allocated</p>
                <p className="text-2xl font-bold">
                  {subscription.subscription.totalCreditsAllocated}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 border-t pt-4 md:grid-cols-2">
              <div className="flex items-start gap-3">
                <Calendar className="mt-0.5 h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Started</p>
                  <p className="text-sm text-muted-foreground">
                    {formatDate(subscription.subscription.createdAt)}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <RefreshCw className="mt-0.5 h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Next Renewal</p>
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
                  <p className="text-sm font-medium text-destructive">Payment Failed</p>
                  <p className="text-sm text-muted-foreground">
                    Your last payment failed. Please update your payment method to continue your
                    subscription.
                  </p>
                </div>
              </div>
            )}
          </CardContent>
          <CardFooter className="flex gap-2">
            <Button variant="outline">Update Payment Method</Button>
            <Dialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="destructive">
                  <XCircle className="mr-2 h-4 w-4" />
                  Cancel Subscription
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Cancel Subscription</DialogTitle>
                  <DialogDescription>
                    Are you sure you want to cancel your subscription? You'll continue to have
                    access until the end of your current billing period.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="cancelReason">Reason for Cancellation *</Label>
                    <Textarea
                      id="cancelReason"
                      value={cancelReason}
                      onChange={(e) => setCancelReason(e.target.value)}
                      placeholder="Please tell us why you're cancelling"
                      rows={3}
                    />
                  </div>
                  <div>
                    <Label htmlFor="cancelFeedback">Additional Feedback (Optional)</Label>
                    <Textarea
                      id="cancelFeedback"
                      value={cancelFeedback}
                      onChange={(e) => setCancelFeedback(e.target.value)}
                      placeholder="How can we improve?"
                      rows={3}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setCancelDialogOpen(false)}>
                    Keep Subscription
                  </Button>
                  <Button
                    type="button"
                    variant="destructive"
                    onClick={handleCancelSubscription}
                    disabled={!cancelReason || isCancelling}
                  >
                    {isCancelling ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Confirm Cancellation'}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </CardFooter>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>No Active Subscription</CardTitle>
            <CardDescription>Subscribe to get monthly credits automatically</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Choose a subscription plan below to get started with automatic monthly credits.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Available Plans */}
      {!subscription && (
        <>
          <div>
            <h2 className="mb-2 text-2xl font-bold">Available Plans</h2>
            <p className="text-muted-foreground">
              Subscribe and get credits automatically every month
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
                    <Badge className="bg-primary text-primary-foreground">Most Popular</Badge>
                  </div>
                )}
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>{plan.name}</CardTitle>
                    <RefreshCw className="h-6 w-6 text-muted-foreground" />
                  </div>
                  <CardDescription>{plan.description}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <div className="flex items-baseline gap-2">
                      <span className="text-4xl font-bold">${plan.pricePerMonth}</span>
                      <span className="text-muted-foreground">/month</span>
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {plan.creditsPerMonth} credits per month
                    </p>
                  </div>

                  <div className="space-y-2">
                    {plan.features.map((feature, index) => (
                      <div key={index} className="flex items-start gap-2">
                        <Check className="mt-0.5 h-4 w-4 flex-shrink-0 text-green-500" />
                        <span className="text-sm">{feature}</span>
                      </div>
                    ))}
                  </div>

                  <div className="pt-2">
                    <p className="text-xs text-muted-foreground">
                      Price per credit: ${(plan.pricePerMonth / plan.creditsPerMonth).toFixed(2)}
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
                    {isCreatingCheckout ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Subscribe Now'}
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
            Subscription Benefits
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="flex items-start gap-3">
              <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-primary/10">
                <Check className="h-4 w-4 text-primary" />
              </div>
              <div>
                <h4 className="mb-1 font-medium">Automatic Credits</h4>
                <p className="text-sm text-muted-foreground">
                  Credits are automatically added to your account each month
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-primary/10">
                <Check className="h-4 w-4 text-primary" />
              </div>
              <div>
                <h4 className="mb-1 font-medium">Better Value</h4>
                <p className="text-sm text-muted-foreground">
                  Save up to 30% compared to one-time purchases
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-primary/10">
                <Check className="h-4 w-4 text-primary" />
              </div>
              <div>
                <h4 className="mb-1 font-medium">Flexible Cancellation</h4>
                <p className="text-sm text-muted-foreground">
                  Cancel anytime - no long-term commitment required
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-primary/10">
                <Check className="h-4 w-4 text-primary" />
              </div>
              <div>
                <h4 className="mb-1 font-medium">Priority Support</h4>
                <p className="text-sm text-muted-foreground">
                  Get faster response times for your support requests
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* FAQ Section */}
      <Card>
        <CardHeader>
          <CardTitle>Frequently Asked Questions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h4 className="mb-1 font-medium">When do I get charged?</h4>
            <p className="text-sm text-muted-foreground">
              You're charged on the same day each month. Credits are added to your account
              immediately after successful payment.
            </p>
          </div>
          <div>
            <h4 className="mb-1 font-medium">What happens if I cancel?</h4>
            <p className="text-sm text-muted-foreground">
              You'll keep access to your subscription benefits until the end of your current billing
              period. No refunds for partial months.
            </p>
          </div>
          <div>
            <h4 className="mb-1 font-medium">Do unused credits roll over?</h4>
            <p className="text-sm text-muted-foreground">
              Yes! Unused subscription credits accumulate in your account and don't expire as long
              as your subscription is active.
            </p>
          </div>
          <div>
            <h4 className="mb-1 font-medium">Can I change my plan?</h4>
            <p className="text-sm text-muted-foreground">
              Yes, you can upgrade or downgrade at any time. Changes take effect at the start of
              your next billing cycle.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
