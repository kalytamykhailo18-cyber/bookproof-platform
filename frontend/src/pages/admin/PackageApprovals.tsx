import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { closerApi } from '@/lib/api/closer';
import { toast } from 'sonner';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle } from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow } from '@/components/ui/table';
import { CheckCircle, XCircle, AlertTriangle, Package } from 'lucide-react';
import { CustomPackageResponse } from '@/lib/api/closer';

export function PackageApprovalsPage() {
  const { t, i18n } = useTranslation('admin');

  const [pendingPackages, setPendingPackages] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isApproving, setIsApproving] = useState(false);
  const [isRejecting, setIsRejecting] = useState(false);

  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState<CustomPackageResponse | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');

  // Fetch pending packages
  useEffect(() => {
    const fetchPendingPackages = async () => {
      try {
        setIsLoading(true);
        const data = await closerApi.getPackagesPendingApproval();
        setPendingPackages(data);
      } catch (error: any) {
        console.error('Pending packages error:', error);
        toast.error('Failed to load pending packages');
      } finally {
        setIsLoading(false);
      }
    };
    fetchPendingPackages();
  }, []);

  const formatCurrency = (amount: number, currency: string = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency }).format(amount);
  };

  const calculatePricePerCredit = (price: number, credits: number) => {
    return (price / credits).toFixed(4);
  };

  // Standard pricing: $0.60/credit, 80% threshold = $0.48/credit
  const STANDARD_RATE = 0.60;
  const MINIMUM_THRESHOLD = 0.80;
  const MIN_RATE = STANDARD_RATE * MINIMUM_THRESHOLD;

  const getDiscountPercentage = (pricePerCredit: number) => {
    const discount = ((STANDARD_RATE - pricePerCredit) / STANDARD_RATE) * 100;
    return discount.toFixed(1);
  };

  const handleApprove = async (packageId: string) => {
    try {
      setIsApproving(true);
      await closerApi.approvePackage(packageId);
      toast.success('Package approved successfully');
      // Refetch pending packages
      const data = await closerApi.getPackagesPendingApproval();
      setPendingPackages(data);
    } catch (error: any) {
      console.error('Approve error:', error);
      toast.error(error.response?.data?.message || 'Failed to approve package');
    } finally {
      setIsApproving(false);
    }
  };

  const handleReject = async () => {
    if (selectedPackage && rejectionReason.trim()) {
      try {
        setIsRejecting(true);
        await closerApi.rejectPackage(selectedPackage.id, rejectionReason);
        toast.success('Package rejected');
        setRejectDialogOpen(false);
        setSelectedPackage(null);
        setRejectionReason('');
        // Refetch pending packages
        const data = await closerApi.getPackagesPendingApproval();
        setPendingPackages(data);
      } catch (error: any) {
        console.error('Reject error:', error);
        toast.error(error.response?.data?.message || 'Failed to reject package');
      } finally {
        setIsRejecting(false);
      }
    }
  };

  const openRejectDialog = (pkg: CustomPackageResponse) => {
    setSelectedPackage(pkg);
    setRejectDialogOpen(true);
  };

  if (isLoading) {
    return (
      <div className="container mx-auto space-y-6 px-4 py-8">
        <div className="space-y-2">
          <Skeleton className="h-9 w-64 animate-pulse" />
          <Skeleton className="h-5 w-96 animate-pulse" />
        </div>
        <Skeleton className="h-96 animate-pulse" />
      </div>
    );
  }

  return (
    <div className="container mx-auto space-y-6 px-4 py-8">
      {/* Header */}
      <div className="animate-fade-up">
        <div className="flex items-center gap-3">
          <Package className="h-8 w-8 text-orange-500" />
          <div>
            <h1 className="text-3xl font-bold">{t('packageApprovals.title') || 'Package Approvals'}</h1>
            <p className="text-muted-foreground">
              {t('packageApprovals.description') || 'Review and approve custom packages with pricing below the 80% threshold'}
            </p>
          </div>
        </div>
      </div>

      {/* Info Card */}
      <Card className="animate-fade-up-fast border-orange-200 bg-orange-50 dark:border-orange-800 dark:bg-orange-950/50">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-orange-700 dark:text-orange-300">
            <AlertTriangle className="h-5 w-5" />
            {t('packageApprovals.pricingInfo') || 'Pricing Threshold Information'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 text-sm md:grid-cols-3">
            <div>
              <p className="text-muted-foreground">{t('packageApprovals.standardRate') || 'Standard Rate'}</p>
              <p className="font-semibold">${STANDARD_RATE.toFixed(2)} / credit</p>
            </div>
            <div>
              <p className="text-muted-foreground">{t('packageApprovals.minimumThreshold') || 'Minimum Threshold (80%)'}</p>
              <p className="font-semibold">${MIN_RATE.toFixed(2)} / credit</p>
            </div>
            <div>
              <p className="text-muted-foreground">{t('packageApprovals.requiresApproval') || 'Requires Approval'}</p>
              <p className="font-semibold">&lt; ${MIN_RATE.toFixed(2)} / credit</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Pending Packages Table */}
      <Card className="animate-fade-up-slow">
        <CardHeader>
          <CardTitle>{t('packageApprovals.pendingPackages') || 'Pending Packages'}</CardTitle>
          <CardDescription>
            {pendingPackages?.length || 0} {t('packageApprovals.packagesAwaitingApproval') || 'packages awaiting approval'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {pendingPackages && pendingPackages.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t('packageApprovals.package') || 'Package'}</TableHead>
                  <TableHead>{t('packageApprovals.client') || 'Client'}</TableHead>
                  <TableHead>{t('packageApprovals.credits') || 'Credits'}</TableHead>
                  <TableHead>{t('packageApprovals.price') || 'Price'}</TableHead>
                  <TableHead>{t('packageApprovals.ratePerCredit') || 'Rate/Credit'}</TableHead>
                  <TableHead>{t('packageApprovals.discount') || 'Discount'}</TableHead>
                  <TableHead>{t('packageApprovals.created') || 'Created'}</TableHead>
                  <TableHead className="text-right">{t('common.actions') || 'Actions'}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pendingPackages.map((pkg) => {
                  const pricePerCredit = parseFloat(calculatePricePerCredit(pkg.price, pkg.credits));
                  const discountPct = getDiscountPercentage(pricePerCredit);

                  return (
                    <TableRow key={pkg.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{pkg.packageName}</p>
                          {pkg.description && (
                            <p className="line-clamp-1 text-sm text-muted-foreground">
                              {pkg.description}
                            </p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{pkg.clientName}</p>
                          <p className="text-sm text-muted-foreground">{pkg.clientEmail}</p>
                          {pkg.clientCompany && (
                            <p className="text-xs text-muted-foreground">{pkg.clientCompany}</p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>{pkg.credits.toLocaleString()}</TableCell>
                      <TableCell>{formatCurrency(pkg.price, pkg.currency)}</TableCell>
                      <TableCell>
                        <Badge variant="destructive">${pricePerCredit.toFixed(4)}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">{discountPct}% off</Badge>
                      </TableCell>
                      <TableCell>{new Date(pkg.createdAt).toLocaleDateString()}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            size="sm"
                            variant="default"
                            className="bg-green-600 hover:bg-green-700"
                            onClick={() => handleApprove(pkg.id)}
                            disabled={isApproving}
                          >
                            <CheckCircle className="mr-1 h-4 w-4" />
                            {t('packageApprovals.approve') || 'Approve'}
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => openRejectDialog(pkg)}
                            disabled={isRejecting}
                          >
                            <XCircle className="mr-1 h-4 w-4" />
                            {t('packageApprovals.reject') || 'Reject'}
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <CheckCircle className="mb-4 h-12 w-12 text-green-500" />
              <p className="text-lg font-medium">{t('packageApprovals.noPending') || 'No packages pending approval'}</p>
              <p className="text-muted-foreground">
                {t('packageApprovals.allCaughtUp') || 'All custom packages with special pricing have been reviewed'}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Reject Dialog */}
      <Dialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('packageApprovals.rejectPackage') || 'Reject Package'}</DialogTitle>
            <DialogDescription>
              {t('packageApprovals.rejectDescription') || 'Please provide a reason for rejecting this package. The closer will be notified.'}
            </DialogDescription>
          </DialogHeader>
          {selectedPackage && (
            <div className="rounded-lg bg-muted p-4">
              <p className="font-medium">{selectedPackage.packageName}</p>
              <p className="text-sm text-muted-foreground">
                {selectedPackage.credits} credits at {formatCurrency(selectedPackage.price, selectedPackage.currency)}
              </p>
              <p className="text-sm text-muted-foreground">
                Rate: ${calculatePricePerCredit(selectedPackage.price, selectedPackage.credits)}/credit
              </p>
            </div>
          )}
          <div className="space-y-2">
            <Label htmlFor="rejectionReason">{t('packageApprovals.rejectionReason') || 'Rejection Reason'} *</Label>
            <Textarea
              id="rejectionReason"
              placeholder={t('packageApprovals.rejectionReasonPlaceholder') || 'E.g., Discount too steep for this client segment...'}
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              rows={3}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRejectDialogOpen(false)}>
              {t('common.cancel') || 'Cancel'}
            </Button>
            <Button
              variant="destructive"
              onClick={handleReject}
              disabled={!rejectionReason.trim() || isRejecting}
            >
              {isRejecting
                ? t('packageApprovals.rejecting') || 'Rejecting...'
                : t('packageApprovals.confirmReject') || 'Reject Package'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
