'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import {
  useAdminRefundRequests,
  useProcessRefundRequest,
} from '@/hooks/useRefunds';
import { RefundRequestStatus, RefundReason } from '@/lib/api/refunds';
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
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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
  Loader2,
} from 'lucide-react';
import { formatDate } from '@/lib/utils';

const getStatusBadge = (status: RefundRequestStatus) => {
  switch (status) {
    case RefundRequestStatus.PENDING:
      return <Badge variant="secondary"><Clock className="mr-1 h-3 w-3" />Pending</Badge>;
    case RefundRequestStatus.APPROVED:
      return <Badge className="bg-green-100 text-green-800"><CheckCircle className="mr-1 h-3 w-3" />Approved</Badge>;
    case RefundRequestStatus.PARTIALLY_APPROVED:
      return <Badge className="bg-yellow-100 text-yellow-800"><CheckCircle className="mr-1 h-3 w-3" />Partial</Badge>;
    case RefundRequestStatus.REJECTED:
      return <Badge variant="destructive"><XCircle className="mr-1 h-3 w-3" />Rejected</Badge>;
    case RefundRequestStatus.PROCESSING:
      return <Badge className="bg-blue-100 text-blue-800"><RefreshCw className="mr-1 h-3 w-3" />Processing</Badge>;
    case RefundRequestStatus.COMPLETED:
      return <Badge className="bg-green-500 text-white"><CheckCircle className="mr-1 h-3 w-3" />Completed</Badge>;
    default:
      return <Badge variant="outline">{status}</Badge>;
  }
};

const getReasonLabel = (reason: RefundReason) => {
  switch (reason) {
    case RefundReason.DIDNT_NEED_CREDITS:
      return "Didn't need credits";
    case RefundReason.WRONG_PACKAGE:
      return 'Wrong package';
    case RefundReason.ACCIDENTAL_PURCHASE:
      return 'Accidental purchase';
    case RefundReason.SERVICE_NOT_AS_EXPECTED:
      return 'Service not as expected';
    case RefundReason.OTHER:
      return 'Other';
    default:
      return reason;
  }
};

export default function AdminRefundsPage() {
  const t = useTranslations('adminRefunds');

  const [statusFilter, setStatusFilter] = useState<RefundRequestStatus | 'all'>('all');
  const [page, setPage] = useState(0);
  const limit = 20;

  const { data, isLoading, refetch } = useAdminRefundRequests({
    status: statusFilter === 'all' ? undefined : statusFilter,
    limit,
    offset: page * limit,
  });

  const processRefund = useProcessRefundRequest();

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

  const handleProcessRefund = () => {
    if (!selectedRequest) return;

    processRefund.mutate(
      {
        requestId: selectedRequest,
        decision: {
          decision,
          adminNotes: adminNotes || undefined,
          refundAmount: decision === 'approve_partial' ? partialAmount : undefined,
        },
      },
      {
        onSuccess: () => {
          setDialogOpen(false);
          setSelectedRequest(null);
          setAdminNotes('');
          refetch();
        },
      },
    );
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
        <h1 className="text-3xl font-bold">{t('title') || 'Refund Management'}</h1>
        <p className="text-muted-foreground">
          {t('description') || 'Review and process author refund requests'}
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="animate-fade-up-fast">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('stats.pending') || 'Pending'}</CardTitle>
            <Clock className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{pendingCount}</div>
            <p className="text-xs text-muted-foreground">{t('stats.pendingDesc') || 'Awaiting review'}</p>
          </CardContent>
        </Card>
        <Card className="animate-fade-up-light-slow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('stats.approved') || 'Approved'}</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{approvedCount}</div>
            <p className="text-xs text-muted-foreground">{t('stats.approvedDesc') || 'Successfully refunded'}</p>
          </CardContent>
        </Card>
        <Card className="animate-fade-up-medium-slow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('stats.rejected') || 'Rejected'}</CardTitle>
            <XCircle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{rejectedCount}</div>
            <p className="text-xs text-muted-foreground">{t('stats.rejectedDesc') || 'Not eligible'}</p>
          </CardContent>
        </Card>
        <Card className="animate-fade-up-heavy-slow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('stats.totalRefunded') || 'Total Refunded'}</CardTitle>
            <DollarSign className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">${totalRefunded.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">{t('stats.totalRefundedDesc') || 'All time'}</p>
          </CardContent>
        </Card>
      </div>

      {/* Refund Requests Table */}
      <Card className="animate-zoom-in">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>{t('table.title') || 'Refund Requests'}</CardTitle>
              <CardDescription>
                {data?.total || 0} {t('table.totalRequests') || 'total requests'}
              </CardDescription>
            </div>
            <div className="w-48">
              <Select
                value={statusFilter}
                onValueChange={(v) => setStatusFilter(v as RefundRequestStatus | 'all')}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('filters.all') || 'All Statuses'}</SelectItem>
                  <SelectItem value={RefundRequestStatus.PENDING}>Pending</SelectItem>
                  <SelectItem value={RefundRequestStatus.APPROVED}>Approved</SelectItem>
                  <SelectItem value={RefundRequestStatus.PARTIALLY_APPROVED}>Partially Approved</SelectItem>
                  <SelectItem value={RefundRequestStatus.REJECTED}>Rejected</SelectItem>
                  <SelectItem value={RefundRequestStatus.PROCESSING}>Processing</SelectItem>
                  <SelectItem value={RefundRequestStatus.COMPLETED}>Completed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t('table.date') || 'Date'}</TableHead>
                <TableHead>{t('table.author') || 'Author'}</TableHead>
                <TableHead>{t('table.amount') || 'Amount'}</TableHead>
                <TableHead>{t('table.credits') || 'Credits'}</TableHead>
                <TableHead>{t('table.reason') || 'Reason'}</TableHead>
                <TableHead>{t('table.eligibility') || 'Eligibility'}</TableHead>
                <TableHead>{t('table.status') || 'Status'}</TableHead>
                <TableHead>{t('table.actions') || 'Actions'}</TableHead>
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
                        <p>{request.creditsAmount} credits</p>
                        <p className="text-xs text-muted-foreground">
                          {request.creditsUsed} used, {request.creditsRemaining} remaining
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <Badge variant="outline">{getReasonLabel(request.reason)}</Badge>
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
                          Eligible
                        </Badge>
                      ) : (
                        <div>
                          <Badge variant="destructive">
                            <XCircle className="mr-1 h-3 w-3" />
                            Not Eligible
                          </Badge>
                          {request.ineligibilityReason && (
                            <p className="mt-1 max-w-xs truncate text-xs text-muted-foreground">
                              {request.ineligibilityReason}
                            </p>
                          )}
                        </div>
                      )}
                    </TableCell>
                    <TableCell>{getStatusBadge(request.status)}</TableCell>
                    <TableCell>
                      {request.status === RefundRequestStatus.PENDING ? (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleOpenDialog(request.id)}
                        >
                          Review
                        </Button>
                      ) : (
                        <span className="text-xs text-muted-foreground">
                          {request.processedAt ? `Processed ${formatDate(request.processedAt)}` : '-'}
                        </span>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={8} className="py-16 text-center">
                    <AlertCircle className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
                    <h3 className="text-lg font-semibold">{t('empty.title') || 'No refund requests'}</h3>
                    <p className="text-muted-foreground">
                      {t('empty.description') || 'There are no refund requests to review.'}
                    </p>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>

          {/* Pagination */}
          {data && data.total > limit && (
            <div className="mt-4 flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                Showing {page * limit + 1} - {Math.min((page + 1) * limit, data.total)} of {data.total}
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => Math.max(0, p - 1))}
                  disabled={page === 0}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => p + 1)}
                  disabled={(page + 1) * limit >= data.total}
                >
                  Next
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
            <DialogTitle>{t('dialog.title') || 'Process Refund Request'}</DialogTitle>
            <DialogDescription>
              {t('dialog.description') || 'Review and make a decision on this refund request.'}
            </DialogDescription>
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
                    <strong>Reason:</strong> {getReasonLabel(selectedRequestData.reason)}
                  </p>
                  {selectedRequestData.explanation && (
                    <p className="mt-1 text-sm text-muted-foreground">
                      <strong>Explanation:</strong> {selectedRequestData.explanation}
                    </p>
                  )}
                  <p className="mt-1 text-sm text-muted-foreground">
                    <strong>Days since purchase:</strong> {selectedRequestData.daysSincePurchase}
                  </p>
                </div>
                <div className="mt-3">
                  {selectedRequestData.isEligible ? (
                    <Badge className="bg-green-100 text-green-800">
                      <CheckCircle className="mr-1 h-3 w-3" />
                      Eligible for refund
                    </Badge>
                  ) : (
                    <Badge variant="destructive">
                      <XCircle className="mr-1 h-3 w-3" />
                      {selectedRequestData.ineligibilityReason || 'Not eligible'}
                    </Badge>
                  )}
                </div>
              </div>

              {/* Decision */}
              <div>
                <Label>{t('dialog.decision') || 'Decision'}</Label>
                <Select value={decision} onValueChange={(v) => setDecision(v as typeof decision)}>
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="approve">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        Approve Full Refund
                      </div>
                    </SelectItem>
                    <SelectItem value="approve_partial">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-yellow-600" />
                        Approve Partial Refund
                      </div>
                    </SelectItem>
                    <SelectItem value="reject">
                      <div className="flex items-center gap-2">
                        <XCircle className="h-4 w-4 text-red-600" />
                        Reject Request
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Partial Refund Amount */}
              {decision === 'approve_partial' && (
                <div>
                  <Label htmlFor="partialAmount">{t('dialog.partialAmount') || 'Refund Amount'}</Label>
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
                    Maximum: ${selectedRequestData.originalAmount.toFixed(2)}
                  </p>
                </div>
              )}

              {/* Admin Notes */}
              <div>
                <Label htmlFor="adminNotes">{t('dialog.notes') || 'Admin Notes'}</Label>
                <Textarea
                  id="adminNotes"
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  placeholder="Optional notes about your decision..."
                  rows={3}
                  className="mt-1"
                />
              </div>
            </div>
          )}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleProcessRefund}
              disabled={processRefund.isPending || (decision === 'approve_partial' && partialAmount <= 0)}
              variant={decision === 'reject' ? 'destructive' : 'default'}
            >
              {processRefund.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : decision === 'approve' ? (
                'Approve Refund'
              ) : decision === 'approve_partial' ? (
                `Approve $${partialAmount.toFixed(2)} Refund`
              ) : (
                'Reject Request'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
