import { useState, useCallback, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { formatCurrency } from '@/lib/utils';
import { toast } from 'sonner';
import { creditsApi, PackageTier as PackageTierType } from '@/lib/api/credits';
import { useLoading } from '@/components/providers/LoadingProvider';
import { settingsApi } from '@/lib/api/settings';
import { PackageTier } from '@/lib/api/credits';
import { CouponValidationResponseDto, couponsApi } from '@/lib/api/coupons';
import { stripeApi } from '@/lib/api/stripe';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow } from '@/components/ui/table';
import {
  CreditCard,
  Check,
  Calendar,
  Package,
  Receipt,
  Loader2,
  Sparkles,
  Search,
  X,
  Tag,
  CheckCircle,
  XCircle } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import { useNavigate,  useParams } from 'react-router-dom';
import { ReviewOrderModal } from '@/components/author/ReviewOrderModal';

export function CreditPurchasePage() {
  const { t: _t, i18n } = useTranslation('credits');
  void _t; // Will use later for translations
  const navigate = useNavigate();
  const { startLoading, stopLoading } = useLoading();

  // Package tiers state
  const [packageTiers, setPackageTiers] = useState<PackageTierType[]>([]);
  const [isLoadingPackages, setIsLoadingPackages] = useState(true);
  const [isPurchasing, setIsPurchasing] = useState(false);

  const [transactions, setTransactions] = useState<any[]>([]);
  const [isLoadingTransactions, setIsLoadingTransactions] = useState(true);
  const [keywordPricing, setKeywordPricing] = useState<any>(null);

  const [couponCode, setCouponCode] = useState('');
  const [includeKeywordResearch, setIncludeKeywordResearch] = useState(false);
  const [validatedCoupon, setValidatedCoupon] = useState<CouponValidationResponseDto | null>(null);
  const [downloadingReceiptId, setDownloadingReceiptId] = useState<string | null>(null);
  const [isValidating, setIsValidating] = useState(false);

  // Review order modal state
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState<PackageTierType | null>(null);

  // Fetch transactions
  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        setIsLoadingTransactions(true);
        const data = await stripeApi.payments.getTransactions();
        setTransactions(data);
      } catch (err) {
        console.error('Transactions error:', err);
      } finally {
        setIsLoadingTransactions(false);
      }
    };
    fetchTransactions();
  }, []);

  // Fetch keyword pricing
  useEffect(() => {
    const fetchKeywordPricing = async () => {
      try {
        const data = await settingsApi.getPublicKeywordResearchPricing();
        setKeywordPricing(data);
      } catch (err) {
        console.error('Keyword pricing error:', err);
      }
    };
    fetchKeywordPricing();
  }, []);

  // Fetch package tiers
  useEffect(() => {
    const fetchPackageTiers = async () => {
      try {
        setIsLoadingPackages(true);
        const data = await creditsApi.getPackageTiers();
        setPackageTiers(data);
      } catch (err) {
        console.error('Package tiers error:', err);
        toast.error('Failed to load package tiers');
      } finally {
        setIsLoadingPackages(false);
      }
    };
    fetchPackageTiers();
  }, []);

  // Handle receipt download
  const handleDownloadReceipt = useCallback(async (transactionId: string) => {
    try {
      setDownloadingReceiptId(transactionId);
      const invoice = await stripeApi.payments.getInvoice(transactionId);

      if (invoice.pdfUrl) {
        window.open(invoice.pdfUrl, '_blank');
        toast.success('Receipt opened successfully');
      } else {
        toast.info(`Invoice #${invoice.invoiceNumber}: ${invoice.currency} ${invoice.amount.toFixed(2)}`);
      }
    } catch (error: any) {
      console.error('Failed to fetch invoice:', error);
      toast.error(error.response?.data?.message || 'Failed to download receipt');
    } finally {
      setDownloadingReceiptId(null);
    }
  }, []);

  // Keyword research pricing
  const keywordPrice = keywordPricing?.price ?? 49.99;

  // Get packages from API - packages are fetched dynamically from backend
  const packages = packageTiers || [];

  // Show review order modal
  const handlePurchase = (packageId: string) => {
    const pkg = packages.find((p) => p.id === packageId);
    if (pkg) {
      setSelectedPackage(pkg);
      setShowReviewModal(true);
    }
  };

  // Proceed to Stripe checkout after review
  const proceedToStripeCheckout = async () => {
    if (!selectedPackage) return;

    try {
      setIsPurchasing(true);
      startLoading('Creating checkout session...');

      const successUrl = includeKeywordResearch
        ? `${window.location.origin}/author/credits/success?includeKeywordResearch=true`
        : `${window.location.origin}/author/credits/success`;
      const cancelUrl = `${window.location.origin}/author/credits/cancel`;

      const response = await creditsApi.createCheckoutSession({
        packageTierId: selectedPackage.id,
        couponCode: validatedCoupon?.valid ? couponCode : undefined,
        includeKeywordResearch: includeKeywordResearch || undefined,
        successUrl,
        cancelUrl
      });

      stopLoading();

      // Redirect to Stripe checkout
      if (typeof window !== 'undefined' && response.url) {
        window.location.href = response.url;
      }
    } catch (error: any) {
      console.error('Purchase error:', error);
      stopLoading();
      setShowReviewModal(false);
      const message = error.response?.data?.message || 'Failed to create checkout session';
      toast.error(message);
      setIsPurchasing(false);
    }
  };

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return;

    try {
      setIsValidating(true);
      const result = await couponsApi.validateCoupon({
        code: couponCode });
      setValidatedCoupon(result);
    } catch {
      setValidatedCoupon({
        valid: false,
        error: 'Failed to validate coupon' });
    } finally {
      setIsValidating(false);
    }
  };

  const handleRemoveCoupon = () => {
    setCouponCode('');
    setValidatedCoupon(null);
  };

  const getDiscountText = () => {
    if (!validatedCoupon?.valid || !validatedCoupon.coupon) return '';
    const coupon = validatedCoupon.coupon;
    if (coupon.type === 'PERCENTAGE' && coupon.discountPercent) {
      return `${coupon.discountPercent}% off`;
    }
    if (coupon.type === 'FIXED_AMOUNT' && coupon.discountAmount) {
      return `${formatCurrency(coupon.discountAmount, 'USD', i18n.language)} off`;
    }
    if (coupon.type === 'FREE_ADDON') {
      return 'Free addon included';
    }
    return 'Discount applied';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric' });
  };

  return (
    <div className="container mx-auto space-y-8 px-4 py-8">
      <div>
        <h1 className="text-3xl font-bold">Purchase Credits</h1>
        <p className="text-muted-foreground">Choose a package that fits your needs</p>
      </div>

      {/* Activation Window Info */}
      <Alert className="border-blue-500 bg-blue-50 dark:bg-blue-950/20">
        <Calendar className="h-4 w-4 text-blue-600" />
        <AlertDescription className="text-blue-700 dark:text-blue-400">
          <span className="font-medium">About Activation Windows:</span> After purchasing credits, you have a specific time window to <strong>start using them</strong> by creating your first campaign. Once activated, you can continue using the credits for that campaign until completion.
        </AlertDescription>
      </Alert>

      {/* Package Selection */}
      {isLoadingPackages ? (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-80" />
          ))}
        </div>
      ) : packages.length > 0 ? (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {packages.map((pkg) => {
            return (
              <Card
                key={pkg.id}
                className={`relative ${pkg.isPopular ? 'border-primary shadow-lg' : ''}`}
              >
                {pkg.isPopular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <Badge className="bg-primary text-primary-foreground">Most Popular</Badge>
                  </div>
                )}
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>{pkg.name}</CardTitle>
                    <Package className="h-6 w-6 text-muted-foreground" />
                  </div>
                  <CardDescription>{pkg.description || 'Credit package'}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <div className="flex items-baseline gap-2">
                      <span className="text-4xl font-bold">
                        {formatCurrency(pkg.basePrice, pkg.currency, i18n.language)}
                      </span>
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {pkg.credits} credits
                    </p>
                    <div className="mt-2 flex items-center gap-1.5 text-sm font-medium text-orange-600 dark:text-orange-400">
                      <Calendar className="h-4 w-4" />
                      <span>Activate within {pkg.validityDays} days</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    {pkg.features && pkg.features.length > 0 ? (
                      pkg.features.map((feature, idx) => (
                        <div key={idx} className="flex items-start gap-2">
                          <Check className="mt-0.5 h-4 w-4 flex-shrink-0 text-green-500" />
                          <span className="text-sm">{feature}</span>
                        </div>
                      ))
                    ) : (
                      <>
                        <div className="flex items-start gap-2">
                          <Check className="mt-0.5 h-4 w-4 flex-shrink-0 text-green-500" />
                          <span className="text-sm">{pkg.credits} verified reviews</span>
                        </div>
                        <div className="flex items-start gap-2">
                          <Check className="mt-0.5 h-4 w-4 flex-shrink-0 text-green-500" />
                          <span className="text-sm">{pkg.validityDays} days to start your campaign</span>
                        </div>
                        <div className="flex items-start gap-2">
                          <Check className="mt-0.5 h-4 w-4 flex-shrink-0 text-green-500" />
                          <span className="text-sm">20% overbooking buffer included</span>
                        </div>
                        <div className="flex items-start gap-2">
                          <Check className="mt-0.5 h-4 w-4 flex-shrink-0 text-green-500" />
                          <span className="text-sm">Email support</span>
                        </div>
                      </>
                    )}
                  </div>

                  <div className="pt-2">
                    <p className="text-xs text-muted-foreground">
                      Price per credit: {formatCurrency(pkg.basePrice / pkg.credits, pkg.currency, i18n.language)}
                    </p>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button
                    type="button"
                    className="w-full"
                    variant={pkg.isPopular ? 'default' : 'outline'}
                    onClick={() => handlePurchase(pkg.id)}
                    disabled={isPurchasing}
                  >
                    {isPurchasing ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <CreditCard className="mr-2 h-4 w-4" />
                        Purchase Package
                      </>
                    )}
                  </Button>
                </CardFooter>
              </Card>
            );
          })}
        </div>
      ) : (
        <Card>
          <CardContent className="py-12 text-center">
            <Package className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
            <p className="text-muted-foreground">
              No packages available at the moment. Please check back later.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Keyword Research Upsell */}
      <Card className="border-2 border-dashed border-primary/30 bg-primary/5">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            <CardTitle>Add Keyword Research</CardTitle>
            <Badge variant="secondary" className="ml-2">
              Recommended
            </Badge>
          </div>
          <CardDescription>
            Boost your book&apos;s discoverability with AI-powered Amazon keyword optimization
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-start gap-4">
            <div className="flex-1">
              <div className="mb-3 flex items-center space-x-2">
                <Checkbox
                  id="keywordResearch"
                  checked={includeKeywordResearch}
                  onCheckedChange={(checked) => setIncludeKeywordResearch(checked as boolean)}
                />
                <label
                  htmlFor="keywordResearch"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Include Keyword Research (+{formatCurrency(keywordPrice, keywordPricing?.currency || 'USD', i18n.language)})
                </label>
              </div>
              <div className="grid gap-2 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Search className="h-4 w-4 text-primary" />
                  <span>Primary, secondary & long-tail keywords</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-500" />
                  <span>Ready-to-use Amazon KDP backend keywords</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-500" />
                  <span>Professional PDF report delivered to your email</span>
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-primary">{formatCurrency(keywordPrice, keywordPricing?.currency || 'USD', i18n.language)}</div>
              <div className="text-xs text-muted-foreground">per book</div>
            </div>
          </div>
          {includeKeywordResearch && (
            <div className="rounded-md bg-primary/10 p-3 text-sm">
              <strong>Note:</strong> After purchasing credits, you&apos;ll be redirected to select
              which book to apply keyword research to, or you can{' '}
              <Button
                type="button"
                variant="link"
                className="h-auto p-0 text-primary underline"
                onClick={() => navigate(`/author/keyword-research/new`)}
              >
                order keyword research separately
              </Button>
              .
            </div>
          )}
        </CardContent>
      </Card>

      {/* Coupon Code */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Tag className="h-5 w-5" />
            Have a Coupon Code?
          </CardTitle>
          <CardDescription>
            Enter your coupon code to get a discount on your purchase
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex max-w-md gap-4">
            <div className="flex-1">
              <Label htmlFor="couponCode">Coupon Code</Label>
              <Input
                id="couponCode"
                value={couponCode}
                onChange={(e) => {
                  setCouponCode(e.target.value.toUpperCase());
                  // Reset validation when code changes
                  if (validatedCoupon) setValidatedCoupon(null);
                }}
                placeholder="ENTER-CODE-HERE"
                disabled={validatedCoupon?.valid}
              />
            </div>
            <div className="flex items-end">
              {validatedCoupon?.valid ? (
                <Button type="button" variant="outline" onClick={handleRemoveCoupon}>
                  <X className="mr-2 h-4 w-4" />
                  Remove
                </Button>
              ) : (
                <Button
                  type="button"
                  variant="outline"
                  disabled={!couponCode || isValidating}
                  onClick={handleApplyCoupon}
                >
                  {isValidating ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Validating...
                    </>
                  ) : (
                    'Apply'
                  )}
                </Button>
              )}
            </div>
          </div>

          {/* Validation Result */}
          {validatedCoupon && (
            <div className="max-w-md">
              {validatedCoupon.valid ? (
                <Alert className="border-green-500 bg-green-50 dark:bg-green-950/20">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <AlertDescription className="text-green-700 dark:text-green-400">
                    <span className="font-medium">Coupon applied!</span> {getDiscountText()}
                    {validatedCoupon.coupon?.appliesTo !== 'CREDITS' &&
                      validatedCoupon.coupon?.appliesTo !== 'ALL' && (
                        <span className="mt-1 block text-sm text-amber-600 dark:text-amber-400">
                          Note: This coupon may not apply to credit purchases.
                        </span>
                      )}
                  </AlertDescription>
                </Alert>
              ) : (
                <Alert className="border-destructive bg-destructive/10">
                  <XCircle className="h-4 w-4 text-destructive" />
                  <AlertDescription className="text-destructive">
                    {validatedCoupon.error || 'Invalid coupon code'}
                  </AlertDescription>
                </Alert>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Purchase History */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Receipt className="h-5 w-5" />
            Purchase History
          </CardTitle>
          <CardDescription>Your credit purchase transactions</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoadingTransactions ? (
            <div className="flex items-center justify-center py-8">
              <p className="text-muted-foreground">Loading transactions...</p>
            </div>
          ) : transactions && transactions.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Package</TableHead>
                  <TableHead>Credits</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Validity</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {transactions.map((transaction) => (
                  <TableRow key={transaction.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        {formatDate(transaction.purchaseDate)}
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">{transaction.package.name}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{transaction.credits} credits</Badge>
                    </TableCell>
                    <TableCell>
                      {formatCurrency(transaction.amountPaid, transaction.currency, i18n.language)}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          transaction.paymentStatus === 'COMPLETED'
                            ? 'default'
                            : transaction.paymentStatus === 'PENDING'
                              ? 'secondary'
                              : 'destructive'
                        }
                      >
                        {transaction.paymentStatus}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {transaction.activationWindowExpiresAt ? (
                        <span className="text-sm">
                          Until {formatDate(transaction.activationWindowExpiresAt)}
                        </span>
                      ) : (
                        <span className="text-sm text-muted-foreground">No expiry</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDownloadReceipt(transaction.id)}
                        disabled={downloadingReceiptId === transaction.id}
                        title="Download Receipt"
                      >
                        {downloadingReceiptId === transaction.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Receipt className="h-4 w-4" />
                        )}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Receipt className="mb-4 h-12 w-12 text-muted-foreground" />
              <p className="text-muted-foreground">No purchases yet</p>
              <p className="text-sm text-muted-foreground">
                Purchase your first credit package to get started
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* FAQ Section */}
      <Card>
        <CardHeader>
          <CardTitle>Frequently Asked Questions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h4 className="mb-1 font-medium">What is the activation window?</h4>
            <p className="text-sm text-muted-foreground">
              Each package has an activation window (30, 90, or 120 days depending on the package).
              You must <strong>START using your credits</strong> within this timeframe by creating a campaign.
              Once activated, you can continue using the credits for that campaign until completion.
            </p>
            <p className="mt-2 text-sm text-muted-foreground">
              <strong>Example:</strong> If you buy the 100-credit package with a 30-day activation window,
              you have 30 days to create a campaign. Once you create the campaign and allocate credits,
              those credits don't expire - you can use them until your campaign is complete.
            </p>
          </div>
          <div>
            <h4 className="mb-1 font-medium">What happens if I don't activate within the window?</h4>
            <p className="text-sm text-muted-foreground">
              If you don't create a campaign within the activation window, the unused credits will expire.
              We recommend purchasing credits when you're ready to launch your campaign to avoid losing them.
            </p>
          </div>
          <div>
            <h4 className="mb-1 font-medium">Can I get a refund?</h4>
            <p className="text-sm text-muted-foreground">
              Unused credits can be refunded within 14 days of purchase. Once credits are allocated
              to a campaign, they become non-refundable.
            </p>
          </div>
          <div>
            <h4 className="mb-1 font-medium">What payment methods do you accept?</h4>
            <p className="text-sm text-muted-foreground">
              We accept all major credit cards, debit cards, and digital wallets through our secure
              Stripe payment gateway.
            </p>
          </div>
          <div>
            <h4 className="mb-1 font-medium">Can I purchase credits for multiple books?</h4>
            <p className="text-sm text-muted-foreground">
              Yes! Credits are added to your account balance and can be allocated to any of your
              campaigns. However, remember to activate them by creating a campaign within the activation window.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Review Order Modal */}
      {selectedPackage && (
        <ReviewOrderModal
          open={showReviewModal}
          onClose={() => setShowReviewModal(false)}
          onConfirm={proceedToStripeCheckout}
          selectedPackage={selectedPackage}
          validatedCoupon={validatedCoupon}
          includeKeywordResearch={includeKeywordResearch}
          keywordResearchPrice={keywordPrice}
          keywordResearchCurrency={keywordPricing?.currency || 'USD'}
          isPurchasing={isPurchasing}
          language={i18n.language}
        />
      )}
    </div>
  );
}
