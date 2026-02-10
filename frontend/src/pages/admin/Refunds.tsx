import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { refundsApi, RefundRequestStatus, RefundReason, RefundRequest } from '@/lib/api/refunds';
import { toast } from 'sonner';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow } from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle } from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue } from '@/components/ui/select';
import {
  AlertCircle,
  CheckCircle,
  XCircle,
  Clock,
  DollarSign,
  User,
  Mail,
  CreditCard,
  RefreshCw,
  Loader2 } from 'lucide-react';
import { formatDate } from '@/lib/utils';

const getStatusBadge = (status: RefundRequestStatus, t: any) => {
  switch (status) {
    case RefundRequestStatus.PENDING:
      return <Badge variant="secondary"><Clock className="mr-1 h-3 w-3" />{t('status.PENDING')}</Badge>;
    case RefundRequestStatus.APPROVED:
      return <Badge className="bg-green-100 text-green-800"><CheckCircle className="mr-1 h-3 w-3" />{t('status.APPROVED')}</Badge>;
    case RefundRequestStatus.PARTIALLY_APPROVED:
      return <Badge className="bg-yellow-100 text-yellow-800"><CheckCircle className="mr-1 h-3 w-3" />{t('status.PARTIALLY_APPROVED')}</Badge>;
    case RefundRequestStatus.REJECTED:
      return <Badge variant="destructive"><XCircle className="mr-1 h-3 w-3" />{t('status.REJECTED')}</Badge>;
    case RefundRequestStatus.PROCESSING:
      return <Badge className="bg-blue-100 text-blue-800"><RefreshCw className="mr-1 h-3 w-3" />{t('status.PROCESSING')}</Badge>;
    case RefundRequestStatus.COMPLETED:
      return <Badge className="bg-green-500 text-white"><CheckCircle className="mr-1 h-3 w-3" />{t('status.COMPLETED')}</Badge>;
    default:
      return <Badge variant="outline">{status}</Badge>;
  }
};

const getReasonLabel = (reason: RefundReason, t: any) => {
  switch (reason) {
    case RefundReason.DIDNT_NEED_CREDITS:
      return t('reasons.DIDNT_NEED_CREDITS');
    case RefundReason.WRONG_PACKAGE:
      return t('reasons.WRONG_PACKAGE');
    case RefundReason.ACCIDENTAL_PURCHASE:
      return t('reasons.ACCIDENTAL_PURCHASE');
    case RefundReason.SERVICE_NOT_AS_EXPECTED:
      return t('reasons.SERVICE_NOT_AS_EXPECTED');
    case RefundReason.OTHER:
      return t('reasons.OTHER');
    default:
      return reason;
  }
};

export function AdminRefundsPage() {
  const { t, i18n } = useTranslation('adminRefunds');

  const [statusFilter, setStatusFilter] = useState<RefundRequestStatus | 'all'>('all');
  const [page, setPage] = useState(0);
  const limit = 20;

  // Data state
  const [data, setData] = useState<{ requests: RefundRequest[]; total: number } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);

  // Fetch refund requests
  const fetchRefunds = async () => {
    try {
      setIsLoading(true);
      const result = await refundsApi.getAllRequests({
        status: statusFilter === 'all' ? undefined : statusFilter,
        limit,
        offset: page * limit
      });
      setData(result);
    } catch (err) {
      console.error('Refund requests error:', err);
      toast.error(t('messages.loadError'));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRefunds();
  }, [statusFilter, page]);

  // Dialog state
  const [selectedRequest, setSelectedRequest] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [decision, setDecision] = useState<'approve' | 'approve_partial' | 'reject'>('approve');
  const [adminNotes, setAdminNotes] = useState('');
  const [partialAmount, setPartialAmount] = useState<number>(0);

  const selectedRequestData = data?.requests.find((r) => r.id === selectedRequest);

  const handleOpenDialog = (requestId: string) => {
    setSelectedRequest(requestId);
    const request = data?.requests.find((r) => r.id === requestId);
    if (request) {
      setPartialAmount(request.originalAmount);
    }
    setDialogOpen(true);
    setDecision('approve');
    setAdminNotes('');
  };

  const handleProcessRefund = async () => {
    if (!selectedRequest) return;

    try {
      setIsProcessing(true);
      await refundsApi.processRequest(selectedRequest, {
        decision,
        adminNotes: adminNotes || undefined,
        refundAmount: decision === 'approve_partial' ? partialAmount : undefined
      });
      toast.success(t('messages.processSuccess'));
      setDialogOpen(false);
      setSelectedRequest(null);
      setAdminNotes('');
      await fetchRefunds();
    } catch (error: any) {
      console.error('Process refund error:', error);
      toast.error(error.response?.data?.message || t('messages.processError'));
    } finally {
      setIsProcessing(false);
    }
  };

  // Calculate stats
  const pendingCount = data?.requests.filter((r) => r.status === RefundRequestStatus.PENDING).length || 0;
  const approvedCount = data?.requests.filter(
    (r) => r.status === RefundRequestStatus.APPROVED || r.status === RefundRequestStatus.COMPLETED
  ).length || 0;
  const rejectedCount = data?.requests.filter((r) => r.status === RefundRequestStatus.REJECTED).length || 0;
  const totalRefunded = data?.requests
    .filter((r) => r.status === RefundRequestStatus.COMPLETED)
    .reduce((sum, r) => sum + (r.refundAmount || r.originalAmount), 0) || 0;

  if (isLoading) {
    return (
      <div className="container mx-auto space-y-6 p-6">
        <div className="space-y-2">
          <Skeleton className="h-9 w-64 animate-pulse" />
          <Skeleton className="h-5 w-96 animate-pulse" />
        </div>
        <div className="grid gap-4 md:grid-cols-4">
          <Skeleton className="h-24 animate-pulse" />
          <Skeleton className="h-24 animate-pulse" />
          <Skeleton className="h-24 animate-pulse" />
          <Skeleton className="h-24 animate-pulse" />
        </div>
        <Skeleton className="h-96 animate-pulse" />
      </div>
    );
  }

  return (
    <div className="container mx-auto space-y-6 p-6">
      {/* Header */}
      <div className="animate-fade-up">
        <h1 className="text-3xl font-bold">{t('title')}</h1>
        <p className="text-muted-foreground">{t('description')}</p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="animate-fade-up-fast">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('stats.pending')}</CardTitle>
            <Clock className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{pendingCount}</div>
            <p className="text-xs text-muted-foreground">{t('stats.pendingDesc')}</p>
          </CardContent>
        </Card>
        <Card className="animate-fade-up-light-slow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('stats.approved')}</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{approvedCount}</div>
            <p className="text-xs text-muted-foreground">{t('stats.approvedDesc')}</p>
          </CardContent>
        </Card>
        <Card className="animate-fade-up-medium-slow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('stats.rejected')}</CardTitle>
            <XCircle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{rejectedCount}</div>
            <p className="text-xs text-muted-foreground">{t('stats.rejectedDesc')}</p>
          </CardContent>
        </Card>
        <Card className="animate-fade-up-heavy-slow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('stats.totalRefunded')}</CardTitle>
            <DollarSign className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">${totalRefunded.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">{t('stats.totalRefundedDesc')}</p>
          </CardContent>
        </Card>
      </div>

      {/* Refund Requests Table */}
      <Card className="animate-zoom-in">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>{t('table.title')}</CardTitle>
              <CardDescription>
                {data?.total || 0} {t('table.totalRequests')}
              </CardDescription>
            </div>
            <div className="w-48">
              <Select
                value={statusFilter}
                onValueChange={(v) => setStatusFilter(v as RefundRequestStatus | 'all')}
              >
                <SelectTrigger>
                  <SelectValue placeholder={t('filters.placeholder')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('filters.all')}</SelectItem>
                  <SelectItem value={RefundRequestStatus.PENDING}>{t('filters.pending')}</SelectItem>
                  <SelectItem value={RefundRequestStatus.APPROVED}>{t('filters.approved')}</SelectItem>
                  <SelectItem value={RefundRequestStatus.PARTIALLY_APPROVED}>{t('filters.partiallyApproved')}</SelectItem>
                  <SelectItem value={RefundRequestStatus.REJECTED}>{t('filters.rejected')}</SelectItem>
                  <SelectItem value={RefundRequestStatus.PROCESSING}>{t('filters.processing')}</SelectItem>
                  <SelectItem value={RefundRequestStatus.COMPLETED}>{t('filters.completed')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t('table.date')}</TableHead>
                <TableHead>{t('table.author')}</TableHead>
                <TableHead>{t('table.amount')}</TableHead>
                <TableHead>{t('table.credits')}</TableHead>
                <TableHead>{t('table.reason')}</TableHead>
                <TableHead>{t('table.eligibility')}</TableHead>
                <TableHead>{t('table.status')}</TableHead>
                <TableHead>{t('table.actions')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data?.requests && data.requests.length > 0 ? (
                data.requests.map((request) => (
                  <TableRow key={request.id}>
                    <TableCell className="whitespace-nowrap">
                      {formatDate(request.createdAt)}
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">{request.authorName}</p>
                        <p className="text-xs text-muted-foreground">{request.authorEmail}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">{request.originalAmount.toFixed(2)}</span>
                        <span className="text-xs text-muted-foreground">{request.currency}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p>{request.creditsAmount} {t('credits.label')}</p>
                        <p className="text-xs text-muted-foreground">
                          {request.creditsUsed} {t('credits.used')}, {request.creditsRemaining} {t('credits.remaining')}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <Badge variant="outline">{getReasonLabel(request.reason, t)}</Badge>
                        {request.explanation && (
                          <p className="mt-1 max-w-xs truncate text-xs text-muted-foreground">
                            {request.explanation}
                          </p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      {request.isEligible ? (
                        <Badge className="bg-green-100 text-green-800">
                          <CheckCircle className="mr-1 h-3 w-3" />
                          {t('eligibility.eligible')}
                        </Badge>
                      ) : (
                        <div>
                          <Badge variant="destructive">
                            <XCircle className="mr-1 h-3 w-3" />
                            {t('eligibility.notEligible')}
                          </Badge>
                          {request.ineligibilityReason && (
                            <p className="mt-1 max-w-xs truncate text-xs text-muted-foreground">
                              {request.ineligibilityReason}
                            </p>
                          )}
                        </div>
                      )}
                    </TableCell>
                    <TableCell>{getStatusBadge(request.status, t)}</TableCell>
                    <TableCell>
                      {request.status === RefundRequestStatus.PENDING ? (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleOpenDialog(request.id)}
                        >
                          {t('actions.review')}
                        </Button>
                      ) : (
                        <span className="text-xs text-muted-foreground">
                          {request.processedAt ? `${t('actions.processed')} ${formatDate(request.processedAt)}` : '-'}
                        </span>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={8} className="py-16 text-center">
                    <AlertCircle className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
                    <h3 className="text-lg font-semibold">{t('empty.title')}</h3>
                    <p className="text-muted-foreground">{t('empty.description')}</p>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>

          {/* Pagination */}
          {data && data.total > limit && (
            <div className="mt-4 flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                {t('pagination.showing')} {page * limit + 1} - {Math.min((page + 1) * limit, data.total)} {t('pagination.of')} {data.total}
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => Math.max(0, p - 1))}
                  disabled={page === 0}
                >
                  {t('pagination.previous')}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => p + 1)}
                  disabled={(page + 1) * limit >= data.total}
                >
                  {t('pagination.next')}
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Process Refund Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{t('dialog.title')}</DialogTitle>
            <DialogDescription>{t('dialog.description')}</DialogDescription>
          </DialogHeader>

          {selectedRequestData && (
            <div className="space-y-4">
              {/* Request Details */}
              <div className="rounded-lg border p-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{selectedRequestData.authorName}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{selectedRequestData.authorEmail}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">
                      ${selectedRequestData.originalAmount.toFixed(2)} {selectedRequestData.currency}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CreditCard className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">
                      {selectedRequestData.creditsRemaining}/{selectedRequestData.creditsAmount} remaining
                    </span>
                  </div>
                </div>
                <div className="mt-3">
                  <p className="text-sm text-muted-foreground">
                    <strong>{t('dialog.reasonLabel')}</strong> {getReasonLabel(selectedRequestData.reason, t)}
                  </p>
                  {selectedRequestData.explanation && (
                    <p className="mt-1 text-sm text-muted-foreground">
                      <strong>{t('dialog.explanationLabel')}</strong> {selectedRequestData.explanation}
                    </p>
                  )}
                  <p className="mt-1 text-sm text-muted-foreground">
                    <strong>{t('dialog.daysSincePurchase')}</strong> {selectedRequestData.daysSincePurchase}
                  </p>
                </div>
                <div className="mt-3">
                  {selectedRequestData.isEligible ? (
                    <Badge className="bg-green-100 text-green-800">
                      <CheckCircle className="mr-1 h-3 w-3" />
                      {t('eligibility.eligibleForRefund')}
                    </Badge>
                  ) : (
                    <Badge variant="destructive">
                      <XCircle className="mr-1 h-3 w-3" />
                      {selectedRequestData.ineligibilityReason || t('eligibility.notEligibleDefault')}
                    </Badge>
                  )}
                </div>
              </div>

              {/* Decision */}
              <div>
                <Label>{t('dialog.decision')}</Label>
                <Select value={decision} onValueChange={(v) => setDecision(v as typeof decision)}>
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="approve">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        {t('decisions.approve')}
                      </div>
                    </SelectItem>
                    <SelectItem value="approve_partial">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-yellow-600" />
                        {t('decisions.approvePartial')}
                      </div>
                    </SelectItem>
                    <SelectItem value="reject">
                      <div className="flex items-center gap-2">
                        <XCircle className="h-4 w-4 text-red-600" />
                        {t('decisions.reject')}
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Partial Refund Amount */}
              {decision === 'approve_partial' && (
                <div>
                  <Label htmlFor="partialAmount">{t('dialog.partialAmount')}</Label>
                  <div className="relative mt-1">
                    <DollarSign className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="partialAmount"
                      type="number"
                      step="0.01"
                      min="0"
                      max={selectedRequestData.originalAmount}
                      value={partialAmount}
                      onChange={(e) => setPartialAmount(parseFloat(e.target.value) || 0)}
                      className="pl-9"
                    />
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {t('dialog.maximumAmount')} ${selectedRequestData.originalAmount.toFixed(2)}
                  </p>
                </div>
              )}

              {/* Admin Notes */}
              <div>
                <Label htmlFor="adminNotes">{t('dialog.notes')}</Label>
                <Textarea
                  id="adminNotes"
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  placeholder={t('dialog.notesPlaceholder')}
                  rows={3}
                  className="mt-1"
                />
              </div>
            </div>
          )}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
              {t('dialog.cancel')}
            </Button>
            <Button
              type="button"
              onClick={handleProcessRefund}
              disabled={isProcessing || (decision === 'approve_partial' && partialAmount <= 0)}
              variant={decision === 'reject' ? 'destructive' : 'default'}
            >
              {isProcessing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {t('dialog.processing')}
                </>
              ) : decision === 'approve' ? (
                t('dialog.approveButton')
              ) : decision === 'approve_partial' ? (
                t('dialog.approvePartialButton', { amount: `$${partialAmount.toFixed(2)}` })
              ) : (
                t('dialog.rejectButton')
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
