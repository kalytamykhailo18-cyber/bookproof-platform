'use client';

import { useState, useMemo } from 'react';
import { useTranslations } from 'next-intl';
import { useDashboards } from '@/hooks/useDashboards';
import { useStripePayments } from '@/hooks/useStripePayments';
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
  DollarSign,
  Receipt,
  Calendar,
  CreditCard,
  RefreshCw,
  Filter,
  FileText,
  TrendingUp,
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
}

export default function TransactionsPage() {
  const t = useTranslations('author.transactions');
  const { useTransactionHistory } = useDashboards();
  const { useTransactions } = useStripePayments();

  const { data: history, isLoading: historyLoading } = useTransactionHistory();
  const { data: stripeTransactions, isLoading: stripeLoading } = useTransactions();

  const [filterType, setFilterType] = useState<'all' | 'purchase' | 'subscription' | 'usage'>(
    'all',
  );

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
    if (filterType === 'all') return unifiedTransactions;
    return unifiedTransactions.filter((tx) => tx.type === filterType);
  }, [unifiedTransactions, filterType]);

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
          {t('subtitle') || 'View all your credit purchases, subscription payments, and credit usage'}
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
            <CardTitle className="text-sm font-medium">{t('stats.totalPurchases') || 'Total Purchases'}</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{purchaseCount}</div>
            <p className="text-xs text-muted-foreground">{t('stats.oneTime') || 'One-time payments'}</p>
          </CardContent>
        </Card>

        <Card className="animate-fade-up-slow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('stats.subscriptionPayments') || 'Subscription Payments'}</CardTitle>
            <RefreshCw className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{subscriptionCount}</div>
            <p className="text-xs text-muted-foreground">{t('stats.recurring') || 'Recurring charges'}</p>
          </CardContent>
        </Card>

        <Card className="animate-fade-up-very-slow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('stats.creditsUsed') || 'Credits Used'}</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{creditsUsed}</div>
            <p className="text-xs text-muted-foreground">{t('stats.totalAllocated') || 'Total allocated'}</p>
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
          <CardDescription>{t('spendingOverview.description') || 'Your spending by category'}</CardDescription>
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
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>{t('history.title') || 'Transaction History'}</CardTitle>
              <CardDescription>{t('history.description') || 'All your financial transactions'}</CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <div className="flex gap-2">
                <Button
                  variant={filterType === 'all' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFilterType('all')}
                >
                  {t('filter.all') || 'All'}
                </Button>
                <Button
                  variant={filterType === 'purchase' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFilterType('purchase')}
                >
                  {t('filter.purchases') || 'Purchases'}
                </Button>
                <Button
                  variant={filterType === 'subscription' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFilterType('subscription')}
                >
                  {t('filter.subscriptions') || 'Subscriptions'}
                </Button>
                <Button
                  variant={filterType === 'usage' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFilterType('usage')}
                >
                  {t('filter.usage') || 'Usage'}
                </Button>
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
                          <Button variant="ghost" size="sm">
                            <Receipt className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-muted-foreground">
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
          <CardDescription>{t('recentPurchases.description') || 'Your latest credit package purchases via Stripe'}</CardDescription>
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
                      <Button variant="ghost" size="sm">
                        <Receipt className="h-4 w-4" />
                      </Button>
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
    </div>
  );
}
