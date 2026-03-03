import { PackageTier } from '@/lib/api/credits';
import { CouponValidationResponseDto } from '@/lib/api/coupons';
import { formatCurrency } from '@/lib/utils';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  CreditCard,
  Package as PackageIcon,
  Tag,
  Sparkles,
  Calendar,
  AlertCircle,
  Loader2,
} from 'lucide-react';

interface ReviewOrderModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  selectedPackage: PackageTier;
  validatedCoupon: CouponValidationResponseDto | null;
  includeKeywordResearch: boolean;
  keywordResearchPrice: number;
  keywordResearchCurrency: string;
  isPurchasing: boolean;
  language: string;
}

export function ReviewOrderModal({
  open,
  onClose,
  onConfirm,
  selectedPackage,
  validatedCoupon,
  includeKeywordResearch,
  keywordResearchPrice,
  keywordResearchCurrency,
  isPurchasing,
  language,
}: ReviewOrderModalProps) {
  // Calculate pricing
  const packagePrice = selectedPackage.basePrice;
  const keywordPrice = includeKeywordResearch ? keywordResearchPrice : 0;
  const subtotal = packagePrice + keywordPrice;

  // Calculate discount
  let discountAmount = 0;
  if (validatedCoupon?.valid && validatedCoupon.coupon) {
    const coupon = validatedCoupon.coupon;
    if (coupon.type === 'PERCENTAGE' && coupon.discountPercent) {
      discountAmount = (subtotal * coupon.discountPercent) / 100;
    } else if (coupon.type === 'FIXED_AMOUNT' && coupon.discountAmount) {
      discountAmount = coupon.discountAmount;
    }
  }

  const totalAmount = subtotal - discountAmount;

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && !isPurchasing && onClose()}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <PackageIcon className="h-5 w-5" />
            Review Your Order
          </DialogTitle>
          <DialogDescription>
            Please review your order details before proceeding to payment
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Package Details */}
          <div className="rounded-lg border bg-muted/50 p-4">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h4 className="font-semibold">{selectedPackage.name}</h4>
                  {selectedPackage.isPopular && (
                    <Badge variant="default" className="text-xs">
                      Most Popular
                    </Badge>
                  )}
                </div>
                <p className="mt-1 text-sm text-muted-foreground">
                  {selectedPackage.credits} credits
                </p>
                <div className="mt-2 flex items-center gap-1.5 text-xs text-orange-600 dark:text-orange-400">
                  <Calendar className="h-3 w-3" />
                  <span>Activate within {selectedPackage.validityDays} days</span>
                </div>
              </div>
              <div className="text-right">
                <p className="text-lg font-bold">
                  {formatCurrency(packagePrice, selectedPackage.currency, language)}
                </p>
              </div>
            </div>
          </div>

          {/* Keyword Research */}
          {includeKeywordResearch && (
            <div className="rounded-lg border border-primary/20 bg-primary/5 p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-primary" />
                    <h4 className="font-semibold">Keyword Research Service</h4>
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">
                    AI-powered Amazon keyword optimization
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-primary">
                    {formatCurrency(keywordPrice, keywordResearchCurrency, language)}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Coupon Applied */}
          {validatedCoupon?.valid && validatedCoupon.coupon && discountAmount > 0 && (
            <div className="rounded-lg border border-green-500/20 bg-green-50 p-4 dark:bg-green-950/20">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <Tag className="h-4 w-4 text-green-600" />
                    <h4 className="font-semibold text-green-700 dark:text-green-400">
                      Coupon Applied
                    </h4>
                  </div>
                  <p className="mt-1 text-sm text-green-600 dark:text-green-400">
                    {validatedCoupon.coupon.code}
                    {validatedCoupon.coupon.type === 'PERCENTAGE' &&
                      ` (${validatedCoupon.coupon.discountPercent}% off)`}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-green-600 dark:text-green-400">
                    -{formatCurrency(discountAmount, selectedPackage.currency, language)}
                  </p>
                </div>
              </div>
            </div>
          )}

          <Separator />

          {/* Order Summary */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Subtotal</span>
              <span className="font-medium">
                {formatCurrency(subtotal, selectedPackage.currency, language)}
              </span>
            </div>

            {discountAmount > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Discount</span>
                <span className="font-medium text-green-600">
                  -{formatCurrency(discountAmount, selectedPackage.currency, language)}
                </span>
              </div>
            )}

            <Separator />

            <div className="flex justify-between text-lg">
              <span className="font-semibold">Total</span>
              <span className="font-bold">
                {formatCurrency(totalAmount, selectedPackage.currency, language)}
              </span>
            </div>
          </div>

          {/* Activation Window Reminder */}
          <Alert className="border-orange-500 bg-orange-50 dark:bg-orange-950/20">
            <AlertCircle className="h-4 w-4 text-orange-600" />
            <AlertDescription className="text-orange-700 dark:text-orange-400">
              <span className="font-medium">Important:</span> You have{' '}
              <strong>{selectedPackage.validityDays} days</strong> to activate these credits by
              creating your first campaign. Once activated, you can continue using them until your
              campaign is complete.
            </AlertDescription>
          </Alert>
        </div>

        <DialogFooter className="flex-col gap-2 sm:flex-row">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isPurchasing}
            className="w-full sm:w-auto"
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={onConfirm}
            disabled={isPurchasing}
            className="w-full sm:w-auto"
          >
            {isPurchasing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <CreditCard className="mr-2 h-4 w-4" />
                Proceed to Payment
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
