import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Loader2, CreditCard, Clock, AlertTriangle, CheckCircle, Package } from 'lucide-react';
import { customPackageApi, CustomPackagePublicDto } from '@/lib/api/stripe';

export function CustomPackageCheckoutPage() {
  const navigate = useNavigate();
  const token = params.token as string;

  const [packageData, setPackageData] = useState<CustomPackagePublicDto | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isHomeLoading, setIsHomeLoading] = useState(false);
  const [isLoginLoading, setIsLoginLoading] = useState(false);

  useEffect(() => {
    const fetchPackage = async () => {
      try {
        setIsLoading(true);
        const data = await customPackageApi.getByToken(token);
        setPackageData(data);
      } catch (err: any) {
        setError(err.response?.data?.message || 'Package not found or link is invalid');
      } finally {
        setIsLoading(false);
      }
    };

    if (token) {
      fetchPackage();
    }
  }, [token]);

  const handleCheckout = async () => {
    if (!packageData) return;

    try {
      setIsProcessing(true);
      const baseUrl = window.location.origin;
      const result = await customPackageApi.createCheckout(token, {
        successUrl: `${baseUrl}/checkout/custom/${token}/success`,
        cancelUrl: `${baseUrl}/checkout/custom/${token}` });

      // Redirect to Stripe checkout
      window.location.href = result.checkoutUrl;
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create checkout session');
      setIsProcessing(false);
    }
  };

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric' });
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="mt-4 text-muted-foreground">Loading package details...</p>
      </div>
    );
  }

  if (error || !packageData) {
    return (
      <Card className="border-destructive">
        <CardHeader>
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-6 w-6 text-destructive" />
            <CardTitle className="text-destructive">Package Not Found</CardTitle>
          </div>
          <CardDescription>
            {error || 'This payment link is invalid or has expired.'}
          </CardDescription>
        </CardHeader>
        <CardFooter>
          <Button type="button" variant="outline" onClick={() => {
            setIsHomeLoading(true);
            navigate('/');
          }} disabled={isHomeLoading}>
            {isHomeLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Go to Homepage
          </Button>
        </CardFooter>
      </Card>
    );
  }

  if (packageData.isExpired) {
    return (
      <Card className="border-yellow-500">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Clock className="h-6 w-6 text-yellow-500" />
            <CardTitle className="text-yellow-600">Payment Link Expired</CardTitle>
          </div>
          <CardDescription>
            This payment link has expired. Please contact the sales team for a new link.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">Package: {packageData.packageName}</p>
          {packageData.expiresAt && (
            <p className="text-sm text-muted-foreground">
              Expired on: {formatDate(packageData.expiresAt)}
            </p>
          )}
        </CardContent>
      </Card>
    );
  }

  if (packageData.status === 'PAID') {
    return (
      <Card className="border-green-500">
        <CardHeader>
          <div className="flex items-center gap-2">
            <CheckCircle className="h-6 w-6 text-green-500" />
            <CardTitle className="text-green-600">Already Paid</CardTitle>
          </div>
          <CardDescription>
            This package has already been paid. Check your email for login credentials.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">Package: {packageData.packageName}</p>
          <p className="text-sm text-muted-foreground">Credits: {packageData.credits}</p>
        </CardContent>
        <CardFooter>
          <Button type="button" onClick={() => {
            setIsLoginLoading(true);
            navigate(`/login`);
          }} disabled={isLoginLoading}>
            {isLoginLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Go to Login
          </Button>
        </CardFooter>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Package className="h-6 w-6 text-primary" />
          <CardTitle>Complete Your Purchase</CardTitle>
        </div>
        <CardDescription>Review your custom package details and proceed to payment</CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Client Info */}
        <div className="rounded-lg bg-muted/50 p-4">
          <p className="text-sm text-muted-foreground">Prepared for</p>
          <p className="font-semibold">{packageData.clientName}</p>
          <p className="text-sm text-muted-foreground">{packageData.clientEmail}</p>
          {packageData.clientCompany && (
            <p className="text-sm text-muted-foreground">{packageData.clientCompany}</p>
          )}
        </div>

        {/* Package Details */}
        <div>
          <h3 className="mb-3 font-semibold">{packageData.packageName}</h3>
          {packageData.description && (
            <p className="mb-4 text-sm text-muted-foreground">{packageData.description}</p>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="rounded-lg border p-4">
              <p className="text-sm text-muted-foreground">Credits Included</p>
              <p className="text-2xl font-bold">{packageData.credits}</p>
            </div>
            <div className="rounded-lg border p-4">
              <p className="text-sm text-muted-foreground">Validity Period</p>
              <p className="text-2xl font-bold">{packageData.validityDays} days</p>
            </div>
          </div>
        </div>

        {/* Special Terms */}
        {packageData.specialTerms && (
          <div className="rounded-lg border border-primary/20 bg-primary/5 p-4">
            <p className="text-sm font-medium text-primary">Special Terms</p>
            <p className="text-sm text-muted-foreground">{packageData.specialTerms}</p>
          </div>
        )}

        <Separator />

        {/* Price */}
        <div className="flex items-center justify-between">
          <span className="text-lg font-semibold">Total</span>
          <span className="text-3xl font-bold text-primary">
            {formatCurrency(packageData.price, packageData.currency)}
          </span>
        </div>

        {/* Expiration Notice */}
        {packageData.expiresAt && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Clock className="h-4 w-4" />
            <span>This offer expires on {formatDate(packageData.expiresAt)}</span>
          </div>
        )}

        {/* Credit Info */}
        <div className="rounded-lg bg-muted/30 p-4">
          <p className="text-sm font-medium">Credit Usage</p>
          <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
            <li>• 1 credit = 1 ebook review</li>
            <li>• 2 credits = 1 audiobook review</li>
            <li>• Credits must be activated within {packageData.validityDays} days</li>
          </ul>
        </div>
      </CardContent>

      <CardFooter className="flex flex-col gap-4">
        <Button className="w-full" size="lg" onClick={handleCheckout} disabled={isProcessing}>
          {isProcessing ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Processing...
            </>
          ) : (
            <>
              <CreditCard className="mr-2 h-4 w-4" />
              Pay {formatCurrency(packageData.price, packageData.currency)}
            </>
          )}
        </Button>
        <p className="text-center text-xs text-muted-foreground">
          Secure payment powered by Stripe
        </p>
      </CardFooter>
    </Card>
  );
}
