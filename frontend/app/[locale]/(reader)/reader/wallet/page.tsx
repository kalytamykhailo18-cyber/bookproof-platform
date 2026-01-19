'use client';

import { useTranslations } from 'next-intl';
import { format } from 'date-fns';
import {
  DollarSign,
  Wallet,
  TrendingUp,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Plus,
  ArrowUpRight,
  ArrowDownRight,
  RefreshCw,
  Gift,
} from 'lucide-react';
import Link from 'next/link';

import { useReaderStats } from '@/hooks/useReaders';
import { useMyPayouts, useWalletTransactions } from '@/hooks/usePayouts';
import { WalletTransactionType } from '@/lib/api/payouts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

const statusIcons = {
  REQUESTED: AlertCircle,
  PENDING_REVIEW: Clock,
  APPROVED: CheckCircle,
  PROCESSING: Clock,
  COMPLETED: CheckCircle,
  REJECTED: XCircle,
  CANCELLED: XCircle,
};

const statusColors = {
  REQUESTED: 'bg-blue-500',
  PENDING_REVIEW: 'bg-yellow-500',
  APPROVED: 'bg-green-500',
  PROCESSING: 'bg-blue-500',
  COMPLETED: 'bg-green-600',
  REJECTED: 'bg-red-500',
  CANCELLED: 'bg-gray-500',
};

const transactionIcons: Record<WalletTransactionType, typeof ArrowUpRight> = {
  EARNING: ArrowUpRight,
  PAYOUT: ArrowDownRight,
  ADJUSTMENT: RefreshCw,
  BONUS: Gift,
  REVERSAL: RefreshCw,
};

const transactionColors: Record<WalletTransactionType, string> = {
  EARNING: 'text-green-600',
  PAYOUT: 'text-red-500',
  ADJUSTMENT: 'text-blue-500',
  BONUS: 'text-purple-500',
  REVERSAL: 'text-orange-500',
};

export default function WalletPage() {
  const t = useTranslations('payouts');
  const { stats, isLoadingStats: statsLoading } = useReaderStats();
  const { data: payouts, isLoading: payoutsLoading } = useMyPayouts();
  const { data: transactions, isLoading: transactionsLoading } = useWalletTransactions();

  const availableBalance = stats?.walletBalance || 0;
  const totalEarned = stats?.totalEarned || 0;
  const pendingEarnings = stats?.pendingEarnings || 0;

  if (statsLoading || payoutsLoading || transactionsLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 w-1/3 rounded bg-gray-200"></div>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="h-32 rounded bg-gray-200"></div>
            <div className="h-32 rounded bg-gray-200"></div>
            <div className="h-32 rounded bg-gray-200"></div>
          </div>
          <div className="h-64 rounded bg-gray-200"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Page Header */}
      <div className="mb-8 flex animate-fade-down-fast items-center justify-between">
        <div>
          <h1 className="mb-2 text-3xl font-bold">{t('title')}</h1>
          <p className="text-muted-foreground">Manage your earnings and request payouts</p>
        </div>
        <Link href="/reader/wallet/payout">
          <Button disabled={availableBalance < 50} className="animate-fade-left-fast">
            <Plus className="mr-2 h-4 w-4" />
            {t('requestPayout')}
          </Button>
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="mb-8 grid gap-6 md:grid-cols-3">
        <Card className="animate-fade-up-fast">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('availableBalance')}</CardTitle>
            <Wallet className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${availableBalance.toFixed(2)}</div>
            <p className="mt-1 text-xs text-muted-foreground">
              {availableBalance >= 50
                ? 'Ready to request payout'
                : `$${(50 - availableBalance).toFixed(2)} until minimum`}
            </p>
          </CardContent>
        </Card>

        <Card className="animate-fade-up-normal">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('totalEarned')}</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalEarned.toFixed(2)}</div>
            <p className="mt-1 text-xs text-muted-foreground">Lifetime earnings</p>
          </CardContent>
        </Card>

        <Card className="animate-fade-up-slow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('pendingEarnings')}</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${pendingEarnings.toFixed(2)}</div>
            <p className="mt-1 text-xs text-muted-foreground">Reviews being validated</p>
          </CardContent>
        </Card>
      </div>

      {/* Transaction History */}
      <Card className="mb-8 animate-fade-up-very-slow">
        <CardHeader>
          <CardTitle>{t('transactionHistory')}</CardTitle>
          <CardDescription>Your earnings and wallet activity</CardDescription>
        </CardHeader>
        <CardContent>
          {!transactions || transactions.length === 0 ? (
            <div className="animate-fade-up-fast py-12 text-center">
              <DollarSign className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
              <p className="text-muted-foreground">No transactions yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {transactions.slice(0, 10).map((tx, index) => {
                const TxIcon = transactionIcons[tx.type];
                const txColor = transactionColors[tx.type];
                const animationDelay = index % 4;
                const animations = [
                  'animate-fade-right-fast',
                  'animate-fade-right-normal',
                  'animate-fade-right-slow',
                  'animate-fade-right-very-slow',
                ];

                return (
                  <div
                    key={tx.id}
                    className={`flex items-center justify-between rounded-md border p-3 transition-colors hover:bg-accent ${animations[animationDelay]}`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`rounded-full p-2 ${tx.amount >= 0 ? 'bg-green-100' : 'bg-red-100'}`}
                      >
                        <TxIcon className={`h-4 w-4 ${txColor}`} />
                      </div>
                      <div>
                        <p className="font-medium">{tx.description}</p>
                        <p className="text-xs text-muted-foreground">
                          {format(new Date(tx.createdAt), 'PPp')}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p
                        className={`font-semibold ${tx.amount >= 0 ? 'text-green-600' : 'text-red-500'}`}
                      >
                        {tx.amount >= 0 ? '+' : ''}${tx.amount.toFixed(2)}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Balance: ${tx.balanceAfter.toFixed(2)}
                      </p>
                    </div>
                  </div>
                );
              })}
              {transactions.length > 10 && (
                <p className="text-center text-sm text-muted-foreground">
                  Showing 10 of {transactions.length} transactions
                </p>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Payout History */}
      <Card className="animate-fade-up-very-slow">
        <CardHeader>
          <CardTitle>{t('payoutHistory')}</CardTitle>
          <CardDescription>Your payout requests and their current status</CardDescription>
        </CardHeader>
        <CardContent>
          {!payouts || payouts.length === 0 ? (
            <div className="animate-fade-up-fast py-12 text-center">
              <DollarSign className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
              <p className="mb-4 text-muted-foreground">{t('history.noPayouts')}</p>
              <Link href="/reader/wallet/payout">
                <Button disabled={availableBalance < 50}>
                  <Plus className="mr-2 h-4 w-4" />
                  {t('requestPayout')}
                </Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {payouts.map((payout, index) => {
                const StatusIcon = statusIcons[payout.status];
                const animationDelay = index % 4;
                const animations = [
                  'animate-fade-right-fast',
                  'animate-fade-right-normal',
                  'animate-fade-right-slow',
                  'animate-fade-right-very-slow',
                ];

                return (
                  <div
                    key={payout.id}
                    className={`rounded-md border p-4 transition-colors hover:bg-accent ${animations[animationDelay]}`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="mb-2 flex items-center gap-3">
                          <StatusIcon
                            className={`h-5 w-5 ${statusColors[payout.status].replace('bg-', 'text-')}`}
                          />
                          <div className="flex items-center gap-2">
                            <span className="text-lg font-semibold">
                              ${payout.amount.toFixed(2)}
                            </span>
                            <Badge variant="outline">{t(`status.${payout.status}`)}</Badge>
                          </div>
                        </div>

                        <div className="ml-8 space-y-1 text-sm text-muted-foreground">
                          <div>
                            <span className="font-medium">Payment Method:</span>{' '}
                            {payout.paymentMethod}
                          </div>
                          <div>
                            <span className="font-medium">{t('history.requestedAt')}:</span>{' '}
                            {format(new Date(payout.requestedAt), 'PPpp')}
                          </div>
                          {payout.processedAt && (
                            <div>
                              <span className="font-medium">{t('history.processedAt')}:</span>{' '}
                              {format(new Date(payout.processedAt), 'PPpp')}
                            </div>
                          )}
                          {payout.paidAt && (
                            <div>
                              <span className="font-medium">{t('history.paidAt')}:</span>{' '}
                              {format(new Date(payout.paidAt), 'PPpp')}
                            </div>
                          )}
                          {payout.transactionId && (
                            <div>
                              <span className="font-medium">{t('history.transactionId')}:</span>{' '}
                              <code className="rounded bg-muted px-2 py-0.5 text-xs">
                                {payout.transactionId}
                              </code>
                            </div>
                          )}
                          {payout.rejectionReason && (
                            <div className="mt-2 rounded border border-red-200 bg-red-50 p-2">
                              <span className="font-medium text-red-700">
                                {t('history.rejectionReason')}:
                              </span>
                              <p className="mt-1 text-red-600">{payout.rejectionReason}</p>
                            </div>
                          )}
                          {payout.notes && (
                            <div className="mt-2 rounded bg-muted p-2">
                              <span className="font-medium">{t('history.adminNotes')}:</span>
                              <p className="mt-1">{payout.notes}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
