import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { format } from 'date-fns';
import {
  CheckCircle,
  XCircle,
  Clock,
  Eye,
  DollarSign,
  AlertCircle,
  TrendingUp,
  Download,
} from 'lucide-react';

import { getAllPayouts, PayoutResponse } from '@/lib/api/payouts';
import { affiliatesApi, PayoutResponseDto, PayoutRequestStatus } from '@/lib/api/affiliates';
import { toast } from 'sonner';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

import PayoutDetailsDialog from './PayoutDetailsDialog';
import ApprovePayoutDialog from './ApprovePayoutDialog';
import RejectPayoutDialog from './RejectPayoutDialog';
import CompletePayoutDialog from './CompletePayoutDialog';
import { formatCurrency } from '@/lib/utils';

type PayoutStatus =
  | 'REQUESTED'
  | 'PENDING_REVIEW'
  | 'APPROVED'
  | 'PROCESSING'
  | 'COMPLETED'
  | 'REJECTED'
  | 'CANCELLED';

export function UnifiedPayoutsPage() {
  const { t, i18n } = useTranslation('adminPayouts');

  // Data state
  const [readerPayouts, setReaderPayouts] = useState<PayoutResponse[]>([]);
  const [affiliatePayouts, setAffiliatePayouts] = useState<PayoutResponseDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Selection state for bulk operations
  const [selectedReaderPayouts, setSelectedReaderPayouts] = useState<Set<string>>(new Set());
  const [selectedAffiliatePayouts, setSelectedAffiliatePayouts] = useState<Set<string>>(
    new Set(),
  );

  const [selectedPayoutId, setSelectedPayoutId] = useState<string | null>(null);
  const [selectedPayoutType, setSelectedPayoutType] = useState<'reader' | 'affiliate'>('reader');
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [approveDialogOpen, setApproveDialogOpen] = useState(false);
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [completeDialogOpen, setCompleteDialogOpen] = useState(false);

  // Fetch all payouts
  const fetchPayouts = async () => {
    try {
      setIsLoading(true);
      const [readers, affiliates] = await Promise.all([
        getAllPayouts(),
        affiliatesApi.getAllPayoutsForAdmin(),
      ]);
      setReaderPayouts(readers);
      setAffiliatePayouts(affiliates);
    } catch (err) {
      console.error('Payouts error:', err);
      toast.error('Failed to load payouts');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPayouts();
  }, []);

  const selectedReaderPayout = readerPayouts?.find((p) => p.id === selectedPayoutId);
  const selectedAffiliatePayout = affiliatePayouts?.find((p) => p.id === selectedPayoutId);
  const selectedPayout =
    selectedPayoutType === 'reader' ? selectedReaderPayout : selectedAffiliatePayout;

  const filterPayoutsByStatus = (payouts: any[], status?: PayoutStatus) => {
    if (!payouts) return [];
    if (!status) return payouts;
    return payouts.filter((p) => p.status === status);
  };

  const handleViewDetails = (payoutId: string, type: 'reader' | 'affiliate') => {
    setSelectedPayoutId(payoutId);
    setSelectedPayoutType(type);
    setDetailsDialogOpen(true);
  };

  const handleApprove = (payoutId: string, type: 'reader' | 'affiliate') => {
    setSelectedPayoutId(payoutId);
    setSelectedPayoutType(type);
    setApproveDialogOpen(true);
  };

  const handleReject = (payoutId: string, type: 'reader' | 'affiliate') => {
    setSelectedPayoutId(payoutId);
    setSelectedPayoutType(type);
    setRejectDialogOpen(true);
  };

  const handleComplete = (payoutId: string, type: 'reader' | 'affiliate') => {
    setSelectedPayoutId(payoutId);
    setSelectedPayoutType(type);
    setCompleteDialogOpen(true);
  };

  // Bulk selection handlers
  const toggleReaderPayout = (id: string) => {
    const newSet = new Set(selectedReaderPayouts);
    if (newSet.has(id)) {
      newSet.delete(id);
    } else {
      newSet.add(id);
    }
    setSelectedReaderPayouts(newSet);
  };

  const toggleAffiliatePayout = (id: string) => {
    const newSet = new Set(selectedAffiliatePayouts);
    if (newSet.has(id)) {
      newSet.delete(id);
    } else {
      newSet.add(id);
    }
    setSelectedAffiliatePayouts(newSet);
  };

  const selectAllReaderPayouts = (payouts: PayoutResponse[], checked: boolean) => {
    if (checked) {
      setSelectedReaderPayouts(new Set(payouts.map((p) => p.id)));
    } else {
      setSelectedReaderPayouts(new Set());
    }
  };

  const selectAllAffiliatePayouts = (payouts: PayoutResponseDto[], checked: boolean) => {
    if (checked) {
      setSelectedAffiliatePayouts(new Set(payouts.map((p) => p.id)));
    } else {
      setSelectedAffiliatePayouts(new Set());
    }
  };

  // Export to CSV
  const exportReaderPayoutsToCSV = () => {
    const payoutsToExport = readerPayouts.filter((p) => selectedReaderPayouts.has(p.id));
    if (payoutsToExport.length === 0) {
      toast.error('No payouts selected for export');
      return;
    }

    const csvHeaders = 'Name,Email,Amount,Method,Requested Date,Status\n';
    const csvRows = payoutsToExport
      .map((p) => {
        const name = p.readerProfile?.user?.name || 'N/A';
        const email = p.readerProfile?.user?.email || 'N/A';
        const amount = p.amount;
        const method = p.paymentMethod;
        const date = format(new Date(p.requestedAt), 'yyyy-MM-dd');
        const status = p.status;
        return `"${name}","${email}",${amount},"${method}","${date}","${status}"`;
      })
      .join('\n');

    const csv = csvHeaders + csvRows;
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `reader-payouts-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
    toast.success(`Exported ${payoutsToExport.length} reader payouts`);
  };

  const exportAffiliatePayoutsToCSV = () => {
    const payoutsToExport = affiliatePayouts.filter((p) => selectedAffiliatePayouts.has(p.id));
    if (payoutsToExport.length === 0) {
      toast.error('No payouts selected for export');
      return;
    }

    const csvHeaders = 'Name,Email,Amount,Method,Requested Date,Status\n';
    const csvRows = payoutsToExport
      .map((p) => {
        const name = p.affiliateProfile?.user?.name || 'N/A';
        const email = p.affiliateProfile?.user?.email || 'N/A';
        const amount = p.amount;
        const method = p.paymentMethod;
        const date = format(new Date(p.requestedAt), 'yyyy-MM-dd');
        const status = p.status;
        return `"${name}","${email}",${amount},"${method}","${date}","${status}"`;
      })
      .join('\n');

    const csv = csvHeaders + csvRows;
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `affiliate-payouts-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
    toast.success(`Exported ${payoutsToExport.length} affiliate payouts`);
  };

  const ReaderPayoutTable = ({ payouts }: { payouts: PayoutResponse[] }) => {
    if (payouts.length === 0) {
      return (
        <div className="animate-fade-up py-16 text-center">
          <AlertCircle className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
          <h3 className="text-lg font-semibold">{t('empty.title')}</h3>
          <p className="text-muted-foreground">{t('empty.description')}</p>
        </div>
      );
    }

    const allSelected = payouts.every((p) => selectedReaderPayouts.has(p.id));

    return (
      <div className="space-y-4">
        {selectedReaderPayouts.size > 0 && (
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={exportReaderPayoutsToCSV}>
              <Download className="mr-2 h-4 w-4" />
              Export Selected ({selectedReaderPayouts.size})
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSelectedReaderPayouts(new Set())}
            >
              Clear Selection
            </Button>
          </div>
        )}
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">
                <Checkbox
                  checked={allSelected}
                  onCheckedChange={(checked) => selectAllReaderPayouts(payouts, !!checked)}
                />
              </TableHead>
              <TableHead>{t('table.name')}</TableHead>
              <TableHead>{t('table.email')}</TableHead>
              <TableHead>{t('table.amount')}</TableHead>
              <TableHead>{t('table.method')}</TableHead>
              <TableHead>{t('table.requestedAt')}</TableHead>
              <TableHead>{t('table.status')}</TableHead>
              <TableHead className="text-right">{t('table.actions')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {payouts.map((payout: PayoutResponse, index: number) => (
              <TableRow
                key={payout.id}
                className={`animate-fade-up-${['fast', 'light-slow', 'medium-slow', 'heavy-slow'][index % 4]}`}
              >
                <TableCell>
                  <Checkbox
                    checked={selectedReaderPayouts.has(payout.id)}
                    onCheckedChange={() => toggleReaderPayout(payout.id)}
                  />
                </TableCell>
                <TableCell className="font-medium">
                  {payout.readerProfile?.user?.name || 'N/A'}
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {payout.readerProfile?.user?.email || 'N/A'}
                </TableCell>
                <TableCell className="font-semibold">
                  {formatCurrency(payout.amount, payout.currency || 'USD', i18n.language)}
                </TableCell>
                <TableCell>{payout.paymentMethod}</TableCell>
                <TableCell>{format(new Date(payout.requestedAt), 'PP')}</TableCell>
                <TableCell>
                  <Badge
                    variant={
                      payout.status === 'COMPLETED'
                        ? 'default'
                        : payout.status === 'REJECTED'
                          ? 'destructive'
                          : payout.status === 'APPROVED'
                            ? 'secondary'
                            : 'outline'
                    }
                    className={
                      payout.status === 'COMPLETED'
                        ? 'bg-green-100 text-green-800'
                        : payout.status === 'APPROVED'
                          ? 'bg-blue-100 text-blue-800'
                          : payout.status === 'REQUESTED'
                            ? 'bg-yellow-100 text-yellow-800'
                            : undefined
                    }
                  >
                    {t(`status.${payout.status}`)}
                  </Badge>
                </TableCell>
                <TableCell className="space-x-2 text-right">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => handleViewDetails(payout.id, 'reader')}
                  >
                    <Eye className="mr-1 h-4 w-4" />
                    {t('actions.view')}
                  </Button>
                  {payout.status === 'REQUESTED' && (
                    <>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => handleApprove(payout.id, 'reader')}
                      >
                        <CheckCircle className="mr-1 h-4 w-4" />
                        {t('actions.approve')}
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => handleReject(payout.id, 'reader')}
                      >
                        <XCircle className="mr-1 h-4 w-4" />
                        {t('actions.reject')}
                      </Button>
                    </>
                  )}
                  {payout.status === 'APPROVED' && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => handleComplete(payout.id, 'reader')}
                    >
                      <Clock className="mr-1 h-4 w-4" />
                      {t('actions.complete')}
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    );
  };

  const AffiliatePayoutTable = ({ payouts }: { payouts: PayoutResponseDto[] }) => {
    if (payouts.length === 0) {
      return (
        <div className="animate-fade-up py-16 text-center">
          <AlertCircle className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
          <h3 className="text-lg font-semibold">{t('empty.title')}</h3>
          <p className="text-muted-foreground">{t('empty.description')}</p>
        </div>
      );
    }

    const allSelected = payouts.every((p) => selectedAffiliatePayouts.has(p.id));

    return (
      <div className="space-y-4">
        {selectedAffiliatePayouts.size > 0 && (
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={exportAffiliatePayoutsToCSV}>
              <Download className="mr-2 h-4 w-4" />
              Export Selected ({selectedAffiliatePayouts.size})
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSelectedAffiliatePayouts(new Set())}
            >
              Clear Selection
            </Button>
          </div>
        )}
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">
                <Checkbox
                  checked={allSelected}
                  onCheckedChange={(checked) => selectAllAffiliatePayouts(payouts, !!checked)}
                />
              </TableHead>
              <TableHead>{t('table.name')}</TableHead>
              <TableHead>{t('table.email')}</TableHead>
              <TableHead>{t('table.amount')}</TableHead>
              <TableHead>{t('table.method')}</TableHead>
              <TableHead>{t('table.requestedAt')}</TableHead>
              <TableHead>{t('table.status')}</TableHead>
              <TableHead className="text-right">{t('table.actions')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {payouts.map((payout: PayoutResponseDto, index: number) => (
              <TableRow
                key={payout.id}
                className={`animate-fade-up-${['fast', 'light-slow', 'medium-slow', 'heavy-slow'][index % 4]}`}
              >
                <TableCell>
                  <Checkbox
                    checked={selectedAffiliatePayouts.has(payout.id)}
                    onCheckedChange={() => toggleAffiliatePayout(payout.id)}
                  />
                </TableCell>
                <TableCell className="font-medium">
                  {payout.affiliateProfile?.user?.name || 'N/A'}
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {payout.affiliateProfile?.user?.email || 'N/A'}
                </TableCell>
                <TableCell className="font-semibold">
                  {formatCurrency(payout.amount, 'USD', i18n.language)}
                </TableCell>
                <TableCell>{payout.paymentMethod}</TableCell>
                <TableCell>{format(new Date(payout.requestedAt), 'yyyy-MM-dd')}</TableCell>
                <TableCell>
                  <Badge
                    variant={
                      payout.status === PayoutRequestStatus.COMPLETED
                        ? 'default'
                        : payout.status === PayoutRequestStatus.REJECTED
                          ? 'destructive'
                          : payout.status === PayoutRequestStatus.APPROVED
                            ? 'secondary'
                            : 'outline'
                    }
                    className={
                      payout.status === PayoutRequestStatus.COMPLETED
                        ? 'bg-green-100 text-green-800'
                        : payout.status === PayoutRequestStatus.APPROVED
                          ? 'bg-blue-100 text-blue-800'
                          : payout.status === PayoutRequestStatus.REQUESTED
                            ? 'bg-yellow-100 text-yellow-800'
                            : undefined
                    }
                  >
                    {payout.status}
                  </Badge>
                </TableCell>
                <TableCell className="space-x-2 text-right">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => handleViewDetails(payout.id, 'affiliate')}
                  >
                    <Eye className="mr-1 h-4 w-4" />
                    View
                  </Button>
                  {payout.status === PayoutRequestStatus.REQUESTED && (
                    <>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => handleApprove(payout.id, 'affiliate')}
                      >
                        <CheckCircle className="mr-1 h-4 w-4" />
                        Approve
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => handleReject(payout.id, 'affiliate')}
                      >
                        <XCircle className="mr-1 h-4 w-4" />
                        Reject
                      </Button>
                    </>
                  )}
                  {payout.status === PayoutRequestStatus.APPROVED && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => handleComplete(payout.id, 'affiliate')}
                    >
                      <Clock className="mr-1 h-4 w-4" />
                      Complete
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="container mx-auto space-y-6 p-6">
        <div className="space-y-2">
          <Skeleton className="h-9 w-48 animate-pulse" />
          <Skeleton className="h-5 w-64 animate-pulse" />
        </div>
        <div className="grid gap-4 md:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-28 animate-pulse" />
          ))}
        </div>
        <Skeleton className="h-12 animate-pulse" />
        <Skeleton className="h-96 animate-pulse" />
      </div>
    );
  }

  const pendingReaderPayouts = filterPayoutsByStatus(readerPayouts, 'REQUESTED');
  const pendingAffiliatePayouts = filterPayoutsByStatus(
    affiliatePayouts,
    PayoutRequestStatus.REQUESTED as any,
  );
  const approvedReaderPayouts = filterPayoutsByStatus(readerPayouts, 'APPROVED');
  const approvedAffiliatePayouts = filterPayoutsByStatus(
    affiliatePayouts,
    PayoutRequestStatus.APPROVED as any,
  );
  const completedReaderPayouts = filterPayoutsByStatus(readerPayouts, 'COMPLETED');
  const completedAffiliatePayouts = filterPayoutsByStatus(
    affiliatePayouts,
    PayoutRequestStatus.COMPLETED as any,
  );

  const totalReaderAmount = readerPayouts?.reduce((sum, p) => sum + p.amount, 0) || 0;
  const totalAffiliateAmount = affiliatePayouts?.reduce((sum, p) => sum + p.amount, 0) || 0;

  return (
    <div className="container mx-auto space-y-6 p-6">
      {/* Header */}
      <div className="animate-fade-up">
        <h1 className="text-3xl font-bold">Payout Processing</h1>
        <p className="text-muted-foreground">
          Manage reader and affiliate payout requests (Section 4.8)
        </p>
      </div>

      {/* Summary Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="animate-fade-up-fast">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <Clock className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {pendingReaderPayouts.length + pendingAffiliatePayouts.length}
            </div>
            <p className="text-xs text-muted-foreground">
              {pendingReaderPayouts.length} readers, {pendingAffiliatePayouts.length} affiliates
            </p>
          </CardContent>
        </Card>

        <Card className="animate-fade-up-light-slow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Approved</CardTitle>
            <CheckCircle className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {approvedReaderPayouts.length + approvedAffiliatePayouts.length}
            </div>
            <p className="text-xs text-muted-foreground">Ready to process</p>
          </CardContent>
        </Card>

        <Card className="animate-fade-up-medium-slow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {completedReaderPayouts.length + completedAffiliatePayouts.length}
            </div>
            <p className="text-xs text-muted-foreground">Successful payouts</p>
          </CardContent>
        </Card>

        <Card className="animate-fade-up-heavy-slow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Amount</CardTitle>
            <DollarSign className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              {formatCurrency(totalReaderAmount + totalAffiliateAmount, 'USD', i18n.language)}
            </div>
            <p className="text-xs text-muted-foreground">All payouts</p>
          </CardContent>
        </Card>
      </div>

      {/* Payouts Tables with Tabs */}
      <Card className="animate-zoom-in">
        <CardHeader>
          <CardTitle>Payout Requests</CardTitle>
          <CardDescription>
            View and process payout requests from readers and affiliates
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="readers" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="readers">
                Reader Payouts ({readerPayouts?.length || 0})
              </TabsTrigger>
              <TabsTrigger value="affiliates">
                Affiliate Payouts ({affiliatePayouts?.length || 0})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="readers" className="mt-4">
              <ReaderPayoutTable payouts={readerPayouts || []} />
            </TabsContent>

            <TabsContent value="affiliates" className="mt-4">
              <AffiliatePayoutTable payouts={affiliatePayouts || []} />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Dialogs */}
      {selectedPayout && selectedPayoutType === 'reader' && (
        <>
          <PayoutDetailsDialog
            payout={selectedPayout as PayoutResponse}
            open={detailsDialogOpen}
            onOpenChange={setDetailsDialogOpen}
          />
          <ApprovePayoutDialog
            payout={selectedPayout as PayoutResponse}
            open={approveDialogOpen}
            onOpenChange={setApproveDialogOpen}
            onRefetch={fetchPayouts}
          />
          <RejectPayoutDialog
            payout={selectedPayout as PayoutResponse}
            open={rejectDialogOpen}
            onOpenChange={setRejectDialogOpen}
            onRefetch={fetchPayouts}
          />
          <CompletePayoutDialog
            payout={selectedPayout as PayoutResponse}
            open={completeDialogOpen}
            onOpenChange={setCompleteDialogOpen}
            onRefetch={fetchPayouts}
          />
        </>
      )}
    </div>
  );
}
