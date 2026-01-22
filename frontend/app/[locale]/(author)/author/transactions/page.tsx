'use client';

import { useState, useMemo, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';
import { useDashboards } from '@/hooks/useDashboards';
import { useStripePayments } from '@/hooks/useStripePayments';
import {
  useMyRefundRequests,
  useRefundEligibility,
  useCreateRefundRequest,
  useCancelRefundRequest,
} from '@/hooks/useRefunds';
import { RefundReason, RefundRequestStatus } from '@/lib/api/refunds';
import { stripeApi } from '@/lib/api/stripe';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
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
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import {
  DollarSign,
  Receipt,
  Calendar,
  CreditCard,
  RefreshCw,
  Filter,
  FileText,
  TrendingUp,
  RotateCcw,
  AlertCircle,
  CheckCircle,
  XCircle,
  Clock,
  Loader2,
  Download,
} from 'lucide-react';

interface UnifiedTransaction {
  id: string;
  type: 'purchase' | 'subscription' | 'usage';
  description: string;
  credits: number;
  amount: number;
  currency: string;
  date: string;
  status: string;
  balanceAfter?: number;
}

const getRefundStatusBadge = (status: RefundRequestStatus) => {
  switch (status) {
    case RefundRequestStatus.PENDING:
      return <Badge variant="secondary"><Clock className="mr-1 h-3 w-3" />Pending</Badge>;
    case RefundRequestStatus.APPROVED:
    case RefundRequestStatus.COMPLETED:
      return <Badge className="bg-green-100 text-green-800"><CheckCircle className="mr-1 h-3 w-3" />Approved</Badge>;
    case RefundRequestStatus.PARTIALLY_APPROVED:
      return <Badge className="bg-yellow-100 text-yellow-800"><CheckCircle className="mr-1 h-3 w-3" />Partial</Badge>;
    case RefundRequestStatus.REJECTED:
      return <Badge variant="destructive"><XCircle className="mr-1 h-3 w-3" />Rejected</Badge>;
    case RefundRequestStatus.PROCESSING:
      return <Badge className="bg-blue-100 text-blue-800"><RefreshCw className="mr-1 h-3 w-3" />Processing</Badge>;
    default:
      return <Badge variant="outline">{status}</Badge>;
  }
};

export default function TransactionsPage() {
  const t = useTranslations('author.transactions');
  const { useTransactionHistory } = useDashboards();
  const { useTransactions } = useStripePayments();

  const { data: history, isLoading: historyLoading } = useTransactionHistory();
  const { data: stripeTransactions, isLoading: stripeLoading } = useTransactions();
  const { data: myRefundRequests } = useMyRefundRequests();

  const [filterType, setFilterType] = useState<'all' | 'purchase' | 'subscription' | 'usage'>(
    'all',
  );

  // Date range filter state (Section 2.6)
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');

  // Invoice download state
  const [downloadingInvoiceId, setDownloadingInvoiceId] = useState<string | null>(null);

  // Handle receipt/invoice download
  const handleDownloadReceipt = useCallback(async (creditPurchaseId: string) => {
    try {
      setDownloadingInvoiceId(creditPurchaseId);
      const invoice = await stripeApi.payments.getInvoice(creditPurchaseId);

      if (invoice.pdfUrl) {
        // Open PDF in new tab
        window.open(invoice.pdfUrl, '_blank');
        toast.success('Receipt opened successfully');
      } else {
        // If no PDF URL, show invoice details
        toast.info(`Invoice #${invoice.invoiceNumber}: ${invoice.currency} ${invoice.amount.toFixed(2)}`);
      }
    } catch (error: any) {
      console.error('Failed to fetch invoice:', error);
      toast.error(error.response?.data?.message || 'Failed to download receipt');
    } finally {
      setDownloadingInvoiceId(null);
    }
  }, []);

  // Refund dialog state
  const [refundDialogOpen, setRefundDialogOpen] = useState(false);
  const [selectedPurchaseId, setSelectedPurchaseId] = useState<string | null>(null);
  const [refundReason, setRefundReason] = useState<RefundReason>(RefundReason.OTHER);
  const [refundExplanation, setRefundExplanation] = useState('');

  const { data: eligibility, isLoading: eligibilityLoading } = useRefundEligibility(
    refundDialogOpen ? selectedPurchaseId || undefined : undefined
  );
  const createRefund = useCreateRefundRequest();
  const cancelRefund = useCancelRefundRequest();

  const handleOpenRefundDialog = (purchaseId: string) => {
    setSelectedPurchaseId(purchaseId);
    setRefundReason(RefundReason.OTHER);
    setRefundExplanation('');
    setRefundDialogOpen(true);
  };

  const handleSubmitRefund = () => {
    if (!selectedPurchaseId) return;

    createRefund.mutate(
      {
        creditPurchaseId: selectedPurchaseId,
        reason: refundReason,
        explanation: refundExplanation || undefined,
      },
      {
        onSuccess: () => {
          setRefundDialogOpen(false);
          setSelectedPurchaseId(null);
        },
      },
    );
  };

  const handleCancelRefundRequest = (requestId: string) => {
    if (confirm('Are you sure you want to cancel this refund request?')) {
      cancelRefund.mutate(requestId);
    }
  };

  // Check if a purchase has a pending refund request
  const getPendingRefundForPurchase = (purchaseId: string) => {
    return myRefundRequests?.find(
      (r) => r.creditPurchaseId === purchaseId && r.status === RefundRequestStatus.PENDING
    );
  };

  // Check if a purchase has any refund request
  const getRefundForPurchase = (purchaseId: string) => {
    return myRefundRequests?.find((r) => r.creditPurchaseId === purchaseId);
  };

  // Transform history data into unified format
  const unifiedTransactions = useMemo<UnifiedTransaction[]>(() => {
    if (!history) return [];

    const transactions: UnifiedTransaction[] = [];

    // Add one-time purchases
    history.oneTimePurchases?.forEach((p) => {
      transactions.push({
        id: p.id,
        type: 'purchase',
        description: p.packageName,
        credits: p.credits,
        amount: p.amountPaid,
        currency: p.currency,
        date: p.purchaseDate,
        status: p.activated ? 'completed' : 'pending',
      });
    });

    // Add subscription payments
    history.subscriptionPayments?.forEach((s) => {
      transactions.push({
        id: s.id,
        type: 'subscription',
        description: s.planName,
        credits: s.creditsPerMonth,
        amount: s.amount,
        currency: s.currency,
        date: s.billingDate,
        status: s.status,
      });
    });

    // Add credit transactions (usage)
    history.creditTransactions?.forEach((c) => {
      transactions.push({
        id: c.id,
        type: 'usage',
        description: c.description,
        credits: c.amount,
        amount: 0,
        currency: 'USD',
        date: c.createdAt,
        status: 'completed',
        balanceAfter: c.balanceAfter,
      });
    });

    // Sort by date descending
    return transactions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [history]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency || 'USD',
    }).format(amount);
  };

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'purchase':
        return <CreditCard className="h-4 w-4" />;
      case 'subscription':
        return <RefreshCw className="h-4 w-4" />;
      case 'usage':
        return <FileText className="h-4 w-4" />;
      default:
        return <DollarSign className="h-4 w-4" />;
    }
  };

  const filteredTransactions = useMemo(() => {
    let filtered = unifiedTransactions;

    // Filter by type
    if (filterType !== 'all') {
      filtered = filtered.filter((tx) => tx.type === filterType);
    }

    // Filter by date range (Section 2.6)
    if (startDate) {
      const start = new Date(startDate);
      filtered = filtered.filter((tx) => new Date(tx.date) >= start);
    }
    if (endDate) {
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999); // Include entire end day
      filtered = filtered.filter((tx) => new Date(tx.date) <= end);
    }

    return filtered;
  }, [unifiedTransactions, filterType, startDate, endDate]);

  // CSV Export function (Section 2.6)
  const handleExportCSV = useCallback(() => {
    if (filteredTransactions.length === 0) {
      toast.error('No transactions to export');
      return;
    }

    // Create CSV header
    const headers = ['Date', 'Type', 'Description', 'Credits', 'Balance', 'Amount', 'Currency', 'Status'];

    // Create CSV rows
    const rows = filteredTransactions.map((tx) => [
      formatDate(tx.date),
      tx.type,
      tx.description.replace(/,/g, ';'), // Escape commas
      tx.credits || 0,
      tx.balanceAfter !== undefined ? tx.balanceAfter : '-',
      tx.amount.toFixed(2),
      tx.currency,
      tx.status,
    ]);

    // Combine headers and rows
    const csvContent = [
      headers.join(','),
      ...rows.map((row) => row.join(',')),
    ].join('\n');

    // Create and download file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `transactions-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast.success('Transactions exported successfully');
  }, [filteredTransactions]);

  // Calculate summary stats
  const totalSpent = useMemo(() => {
    return unifiedTransactions
      .filter((tx) => tx.type !== 'usage')
      .reduce((sum, tx) => sum + tx.amount, 0);
  }, [unifiedTransactions]);

  const purchaseCount = useMemo(() => {
    return unifiedTransactions.filter((tx) => tx.type === 'purchase').length;
  }, [unifiedTransactions]);

  const subscriptionCount = useMemo(() => {
    return unifiedTransactions.filter((tx) => tx.type === 'subscription').length;
  }, [unifiedTransactions]);

  const creditsUsed = useMemo(() => {
    return unifiedTransactions
      .filter((tx) => tx.type === 'usage')
      .reduce((sum, tx) => sum + Math.abs(tx.credits), 0);
  }, [unifiedTransactions]);

  const purchaseTotal = useMemo(() => {
    return unifiedTransactions
      .filter((tx) => tx.type === 'purchase')
      .reduce((sum, tx) => sum + tx.amount, 0);
  }, [unifiedTransactions]);

  const subscriptionTotal = useMemo(() => {
    return unifiedTransactions
      .filter((tx) => tx.type === 'subscription')
      .reduce((sum, tx) => sum + tx.amount, 0);
  }, [unifiedTransactions]);

  if (historyLoading || stripeLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex h-64 items-center justify-center">
          <RefreshCw className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto space-y-6 px-4 py-8">
      <div className="animate-fade-up">
        <h1 className="text-3xl font-bold">{t('title') || 'Transaction History'}</h1>
        <p className="text-muted-foreground">
          {t('subtitle') ||
            'View all your credit purchases, subscription payments, and credit usage'}
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        <Card className="animate-fade-up-fast">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Spent</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalSpent.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">All time</p>
          </CardContent>
        </Card>

        <Card className="animate-fade-up-light-slow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t('stats.totalPurchases') || 'Total Purchases'}
            </CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{purchaseCount}</div>
            <p className="text-xs text-muted-foreground">
              {t('stats.oneTime') || 'One-time payments'}
            </p>
          </CardContent>
        </Card>

        <Card className="animate-fade-up-slow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t('stats.subscriptionPayments') || 'Subscription Payments'}
            </CardTitle>
            <RefreshCw className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{subscriptionCount}</div>
            <p className="text-xs text-muted-foreground">
              {t('stats.recurring') || 'Recurring charges'}
            </p>
          </CardContent>
        </Card>

        <Card className="animate-fade-up-very-slow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t('stats.creditsUsed') || 'Credits Used'}
            </CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{creditsUsed}</div>
            <p className="text-xs text-muted-foreground">
              {t('stats.totalAllocated') || 'Total allocated'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Spending Trend */}
      <Card className="animate-zoom-in">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            {t('spendingOverview.title') || 'Spending Overview'}
          </CardTitle>
          <CardDescription>
            {t('spendingOverview.description') || 'Your spending by category'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between rounded-md border p-3">
              <div className="flex items-center gap-3">
                <CreditCard className="h-8 w-8 text-primary" />
                <div>
                  <p className="font-medium">Credit Purchases</p>
                  <p className="text-sm text-muted-foreground">{purchaseCount} transactions</p>
                </div>
              </div>
              <p className="text-lg font-bold">${purchaseTotal.toFixed(2)}</p>
            </div>

            <div className="flex items-center justify-between rounded-md border p-3">
              <div className="flex items-center gap-3">
                <RefreshCw className="h-8 w-8 text-primary" />
                <div>
                  <p className="font-medium">Subscription Payments</p>
                  <p className="text-sm text-muted-foreground">{subscriptionCount} transactions</p>
                </div>
              </div>
              <p className="text-lg font-bold">${subscriptionTotal.toFixed(2)}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Filter Section */}
      <Card className="animate-zoom-in-fast">
        <CardHeader>
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>{t('history.title') || 'Transaction History'}</CardTitle>
                <CardDescription>
                  {t('history.description') || 'All your financial transactions'}
                </CardDescription>
              </div>
              {/* CSV Export Button (Section 2.6) */}
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleExportCSV}
                className="flex items-center gap-2"
              >
                <Download className="h-4 w-4" />
                {t('export.csv') || 'Export CSV'}
              </Button>
            </div>

            {/* Filter Controls */}
            <div className="flex flex-wrap items-center gap-4">
              {/* Type Filter */}
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-muted-foreground" />
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant={filterType === 'all' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setFilterType('all')}
                  >
                    {t('filter.all') || 'All'}
                  </Button>
                  <Button
                    type="button"
                    variant={filterType === 'purchase' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setFilterType('purchase')}
                  >
                    {t('filter.purchases') || 'Purchases'}
                  </Button>
                  <Button
                    type="button"
                    variant={filterType === 'subscription' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setFilterType('subscription')}
                  >
                    {t('filter.subscriptions') || 'Subscriptions'}
                  </Button>
                  <Button
                    type="button"
                    variant={filterType === 'usage' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setFilterType('usage')}
                  >
                    {t('filter.usage') || 'Usage'}
                  </Button>
                </div>
              </div>

              {/* Date Range Filter (Section 2.6) */}
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <Input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="h-8 w-36"
                  placeholder="Start date"
                />
                <span className="text-muted-foreground">to</span>
                <Input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="h-8 w-36"
                  placeholder="End date"
                />
                {(startDate || endDate) && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setStartDate('');
                      setEndDate('');
                    }}
                  >
                    Clear
                  </Button>
                )}
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Credits</TableHead>
                <TableHead>Balance</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTransactions.length > 0 ? (
                filteredTransactions.map((transaction) => (
                  <TableRow key={transaction.id}>
                    <TableCell className="text-sm">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        {formatDate(transaction.date)}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {getTransactionIcon(transaction.type)}
                        <Badge variant="outline" className="capitalize">
                          {transaction.type}
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell>
                      <p className="font-medium">{transaction.description}</p>
                    </TableCell>
                    <TableCell>
                      {transaction.credits ? (
                        <Badge variant="secondary">
                          {transaction.type === 'usage' ? '-' : '+'}
                          {Math.abs(transaction.credits)}
                        </Badge>
                      ) : (
                        <span className="text-sm text-muted-foreground">N/A</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {transaction.balanceAfter !== undefined ? (
                        <span className="font-medium">{transaction.balanceAfter}</span>
                      ) : (
                        <span className="text-sm text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {transaction.amount > 0 ? (
                        <div className="flex items-center gap-1">
                          <DollarSign className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium">
                            {formatCurrency(transaction.amount, transaction.currency)}
                          </span>
                        </div>
                      ) : (
                        <span className="text-sm text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          transaction.status === 'completed'
                            ? 'default'
                            : transaction.status === 'pending'
                              ? 'secondary'
                              : 'outline'
                        }
                      >
                        {transaction.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        {transaction.type !== 'usage' && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDownloadReceipt(transaction.id)}
                            disabled={downloadingInvoiceId === transaction.id}
                            title="Download Receipt"
                          >
                            {downloadingInvoiceId === transaction.id ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <Receipt className="h-4 w-4" />
                            )}
                          </Button>
                        )}
                        {transaction.type === 'purchase' && (() => {
                          const existingRefund = getRefundForPurchase(transaction.id);
                          if (existingRefund) {
                            return (
                              <div className="flex items-center gap-1">
                                {getRefundStatusBadge(existingRefund.status)}
                                {existingRefund.status === RefundRequestStatus.PENDING && (
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleCancelRefundRequest(existingRefund.id)}
                                    disabled={cancelRefund.isPending}
                                  >
                                    <XCircle className="h-4 w-4 text-red-500" />
                                  </Button>
                                )}
                              </div>
                            );
                          }
                          return (
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => handleOpenRefundDialog(transaction.id)}
                              title="Request Refund"
                            >
                              <RotateCcw className="h-4 w-4" />
                            </Button>
                          );
                        })()}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={8} className="text-center text-muted-foreground">
                    <div className="flex flex-col items-center gap-2 py-12">
                      <Receipt className="h-12 w-12 text-muted-foreground" />
                      <p>No transactions found</p>
                      {filterType !== 'all' && <p className="text-sm">Try changing the filter</p>}
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Recent Stripe Transactions */}
      <Card className="animate-fade-left">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            {t('recentPurchases.title') || 'Recent Credit Purchases'}
          </CardTitle>
          <CardDescription>
            {t('recentPurchases.description') || 'Your latest credit package purchases via Stripe'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Package</TableHead>
                <TableHead>Credits</TableHead>
                <TableHead>Amount Paid</TableHead>
                <TableHead>Payment Method</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {stripeTransactions && stripeTransactions.length > 0 ? (
                stripeTransactions.slice(0, 5).map((transaction) => (
                  <TableRow key={transaction.id}>
                    <TableCell className="text-sm">
                      {formatDate(transaction.purchaseDate)}
                    </TableCell>
                    <TableCell className="font-medium">{transaction.package.name}</TableCell>
                    <TableCell>
                      <Badge variant="secondary">{transaction.credits} credits</Badge>
                    </TableCell>
                    <TableCell>
                      <span className="font-medium">
                        {formatCurrency(transaction.amountPaid, transaction.currency)}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <CreditCard className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm capitalize">card</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          transaction.paymentStatus === 'completed'
                            ? 'default'
                            : transaction.paymentStatus === 'pending'
                              ? 'secondary'
                              : 'destructive'
                        }
                      >
                        {transaction.paymentStatus}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDownloadReceipt(transaction.id)}
                          disabled={downloadingInvoiceId === transaction.id}
                          title="Download Receipt"
                        >
                          {downloadingInvoiceId === transaction.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Receipt className="h-4 w-4" />
                          )}
                        </Button>
                        {(() => {
                          const existingRefund = getRefundForPurchase(transaction.id);
                          if (existingRefund) {
                            return (
                              <div className="flex items-center gap-1">
                                {getRefundStatusBadge(existingRefund.status)}
                                {existingRefund.status === RefundRequestStatus.PENDING && (
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleCancelRefundRequest(existingRefund.id)}
                                    disabled={cancelRefund.isPending}
                                  >
                                    <XCircle className="h-4 w-4 text-red-500" />
                                  </Button>
                                )}
                              </div>
                            );
                          }
                          return (
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => handleOpenRefundDialog(transaction.id)}
                              title="Request Refund"
                            >
                              <RotateCcw className="h-4 w-4" />
                            </Button>
                          );
                        })()}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={7} className="py-8 text-center text-muted-foreground">
                    No credit purchases yet
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* My Refund Requests Section */}
      {myRefundRequests && myRefundRequests.length > 0 && (
        <Card className="animate-fade-up">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <RotateCcw className="h-5 w-5" />
              {t('refundRequests.title') || 'My Refund Requests'}
            </CardTitle>
            <CardDescription>
              {t('refundRequests.description') || 'Track the status of your refund requests'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Reason</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {myRefundRequests.map((request) => (
                  <TableRow key={request.id}>
                    <TableCell>{formatDate(request.createdAt)}</TableCell>
                    <TableCell>
                      <span className="font-medium">
                        ${request.originalAmount.toFixed(2)} {request.currency}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {request.reason.replace(/_/g, ' ').toLowerCase()}
                      </Badge>
                    </TableCell>
                    <TableCell>{getRefundStatusBadge(request.status)}</TableCell>
                    <TableCell>
                      {request.status === RefundRequestStatus.PENDING && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => handleCancelRefundRequest(request.id)}
                          disabled={cancelRefund.isPending}
                        >
                          Cancel
                        </Button>
                      )}
                      {request.adminNotes && (
                        <span className="text-xs text-muted-foreground" title={request.adminNotes}>
                          {request.adminNotes.slice(0, 30)}...
                        </span>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Refund Request Dialog */}
      <Dialog open={refundDialogOpen} onOpenChange={setRefundDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('refundDialog.title') || 'Request Refund'}</DialogTitle>
            <DialogDescription>
              {t('refundDialog.description') || 'Submit a refund request for this purchase.'}
            </DialogDescription>
          </DialogHeader>

          {eligibilityLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : eligibility ? (
            <div className="space-y-4">
              {/* Eligibility Status */}
              <div className="rounded-lg border p-4">
                {eligibility.isEligible ? (
                  <div className="flex items-center gap-2 text-green-600">
                    <CheckCircle className="h-5 w-5" />
                    <span className="font-medium">Eligible for refund</span>
                  </div>
                ) : (
                  <div>
                    <div className="flex items-center gap-2 text-red-600">
                      <AlertCircle className="h-5 w-5" />
                      <span className="font-medium">Not eligible for refund</span>
                    </div>
                    {eligibility.reason && (
                      <p className="mt-2 text-sm text-muted-foreground">{eligibility.reason}</p>
                    )}
                  </div>
                )}
                <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <span className="text-muted-foreground">Purchase Amount:</span>{' '}
                    <span className="font-medium">${eligibility.originalAmount.toFixed(2)}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Days Since Purchase:</span>{' '}
                    <span className="font-medium">{eligibility.daysSincePurchase}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Credits Purchased:</span>{' '}
                    <span className="font-medium">{eligibility.creditsAmount}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Credits Remaining:</span>{' '}
                    <span className="font-medium">{eligibility.creditsRemaining}</span>
                  </div>
                </div>
              </div>

              {/* Refund Reason */}
              <div>
                <Label htmlFor="refundReason">Reason for refund</Label>
                <Select
                  value={refundReason}
                  onValueChange={(v) => setRefundReason(v as RefundReason)}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={RefundReason.DIDNT_NEED_CREDITS}>
                      Didn't need the credits
                    </SelectItem>
                    <SelectItem value={RefundReason.WRONG_PACKAGE}>
                      Purchased wrong package
                    </SelectItem>
                    <SelectItem value={RefundReason.ACCIDENTAL_PURCHASE}>
                      Accidental purchase
                    </SelectItem>
                    <SelectItem value={RefundReason.SERVICE_NOT_AS_EXPECTED}>
                      Service not as expected
                    </SelectItem>
                    <SelectItem value={RefundReason.OTHER}>Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Additional Explanation */}
              <div>
                <Label htmlFor="refundExplanation">Additional explanation (optional)</Label>
                <Textarea
                  id="refundExplanation"
                  value={refundExplanation}
                  onChange={(e) => setRefundExplanation(e.target.value)}
                  placeholder="Please provide more details about your refund request..."
                  rows={3}
                  className="mt-1"
                />
              </div>
            </div>
          ) : (
            <div className="py-8 text-center">
              <AlertCircle className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
              <p className="text-muted-foreground">Unable to check eligibility. Please try again.</p>
            </div>
          )}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setRefundDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleSubmitRefund}
              disabled={
                !eligibility?.isEligible ||
                createRefund.isPending ||
                eligibilityLoading
              }
            >
              {createRefund.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Submitting...
                </>
              ) : (
                'Submit Refund Request'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
