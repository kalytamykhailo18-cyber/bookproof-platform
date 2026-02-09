import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAdminControls } from '@/hooks/useAdminControls';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow } from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue } from '@/components/ui/select';
import {
  ArrowLeft,
  CreditCard,
  TrendingUp,
  TrendingDown,
  History,
  User,
  Mail,
  AlertCircle,
  Loader2 } from 'lucide-react';
import { formatDate } from '@/lib/utils';
import type { CreditTransactionType } from '@/lib/api/admin-controls';

const TRANSACTION_TYPES: CreditTransactionType[] = [
  'PURCHASE',
  'SUBSCRIPTION_RENEWAL',
  'ALLOCATION',
  'DEDUCTION',
  'REFUND',
  'MANUAL_ADJUSTMENT',
  'EXPIRATION',
  'BONUS',
];

const getTransactionTypeColor = (type: CreditTransactionType) => {
  switch (type) {
    case 'PURCHASE':
    case 'BONUS':
      return 'bg-green-100 text-green-800';
    case 'DEDUCTION':
    case 'EXPIRATION':
      return 'bg-red-100 text-red-800';
    case 'ALLOCATION':
      return 'bg-blue-100 text-blue-800';
    case 'REFUND':
      return 'bg-yellow-100 text-yellow-800';
    case 'MANUAL_ADJUSTMENT':
      return 'bg-purple-100 text-purple-800';
    case 'SUBSCRIPTION_RENEWAL':
      return 'bg-teal-100 text-teal-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

export function AuthorTransactionsPage() {
  const navigate = useNavigate();
  const authorId = params.id as string;
  const { t, i18n } = useTranslation('adminAuthorTransactions');

  const { useAuthorTransactionHistory } = useAdminControls();

  const [page, setPage] = useState(0);
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [isBackLoading, setIsBackLoading] = useState(false);
  const limit = 20;

  const { data, isLoading, isError } = useAuthorTransactionHistory(authorId, limit, page * limit);

  const filteredTransactions = data?.transactions.filter((tx) => {
    if (typeFilter === 'all') return true;
    return tx.type === typeFilter;
  });

  if (isLoading) {
    return (
      <div className="container mx-auto space-y-6 p-6">
        <div className="flex items-center gap-4">
          <Skeleton className="h-10 w-10 animate-pulse" />
          <Skeleton className="h-10 w-64 animate-pulse" />
        </div>
        <Skeleton className="h-40 animate-pulse" />
        <Skeleton className="h-96 animate-pulse" />
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="container mx-auto p-6">
        <Card className="animate-fade-up">
          <CardContent className="py-16 text-center">
            <AlertCircle className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
            <h3 className="text-lg font-semibold">{t('error.title')}</h3>
            <p className="text-muted-foreground">{t('error.description')}</p>
            <Button type="button" className="mt-4" onClick={() => navigate(`/admin/authors`)}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              {t('backToAuthors')}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto space-y-6 p-6">
      {/* Header */}
      <div className="flex animate-fade-right items-center gap-4">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={() => {
            setIsBackLoading(true);
            navigate(`/admin/authors`);
          }}
          disabled={isBackLoading}
        >
          {isBackLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : <ArrowLeft className="h-5 w-5" />}
        </Button>
        <div>
          <h1 className="text-3xl font-bold">{t('title')}</h1>
          <p className="text-muted-foreground">{t('subtitle')}</p>
        </div>
      </div>

      {/* Author Info Card */}
      <Card className="animate-fade-up">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            {data.authorName}
          </CardTitle>
          <CardDescription className="flex items-center gap-2">
            <Mail className="h-4 w-4" />
            {data.authorEmail}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div className="flex animate-fade-up-fast items-center gap-3 rounded-lg border p-4">
              <CreditCard className="h-8 w-8 text-blue-500" />
              <div>
                <p className="text-sm text-muted-foreground">{t('stats.totalPurchased')}</p>
                <p className="text-2xl font-bold">{data.totalCreditsPurchased.toLocaleString()}</p>
              </div>
            </div>
            <div className="flex animate-fade-up-light-slow items-center gap-3 rounded-lg border p-4">
              <TrendingUp className="h-8 w-8 text-green-500" />
              <div>
                <p className="text-sm text-muted-foreground">{t('stats.available')}</p>
                <p className="text-2xl font-bold text-green-600">
                  {data.availableCredits.toLocaleString()}
                </p>
              </div>
            </div>
            <div className="animate-fade-up-medium-slow flex items-center gap-3 rounded-lg border p-4">
              <TrendingDown className="h-8 w-8 text-orange-500" />
              <div>
                <p className="text-sm text-muted-foreground">{t('stats.used')}</p>
                <p className="text-2xl font-bold text-orange-600">
                  {data.totalCreditsUsed.toLocaleString()}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Transactions Table */}
      <Card className="animate-zoom-in">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <History className="h-5 w-5" />
                {t('table.title')}
              </CardTitle>
              <CardDescription>
                {data.totalTransactions.toLocaleString()} {t('table.totalTransactions')}
              </CardDescription>
            </div>
            <div className="w-48 animate-fade-left">
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger>
                  <SelectValue placeholder={t('filters.placeholder')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('filters.all')}</SelectItem>
                  {TRANSACTION_TYPES.map((type) => (
                    <SelectItem key={type} value={type}>
                      {t(`types.${type}`)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {filteredTransactions && filteredTransactions.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t('table.date')}</TableHead>
                  <TableHead>{t('table.type')}</TableHead>
                  <TableHead>{t('table.description')}</TableHead>
                  <TableHead className="text-right">{t('table.amount')}</TableHead>
                  <TableHead className="text-right">{t('table.balance')}</TableHead>
                  <TableHead>{t('table.performedBy')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTransactions.map((tx, index) => (
                  <TableRow
                    key={tx.id}
                    className={`animate-fade-up-${['fast', 'light-slow', 'medium-slow', 'heavy-slow'][index % 4]}`}
                  >
                    <TableCell className="whitespace-nowrap">{formatDate(tx.createdAt)}</TableCell>
                    <TableCell>
                      <Badge className={getTransactionTypeColor(tx.type)}>
                        {t(`types.${tx.type}`)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="max-w-md">
                        <p className="truncate">{tx.description}</p>
                        {tx.bookTitle && (
                          <p className="text-xs text-muted-foreground">
                            {t('table.book')}: {tx.bookTitle}
                          </p>
                        )}
                        {tx.notes && (
                          <p className="mt-1 text-xs text-muted-foreground">
                            {t('table.note')}: {tx.notes}
                          </p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <span
                        className={`font-semibold ${
                          tx.amount > 0 ? 'text-green-600' : 'text-red-600'
                        }`}
                      >
                        {tx.amount > 0 ? '+' : ''}
                        {tx.amount}
                      </span>
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      {tx.balanceAfter.toLocaleString()}
                    </TableCell>
                    <TableCell>
                      {tx.performedByName ? (
                        <span className="text-sm">{tx.performedByName}</span>
                      ) : (
                        <span className="text-sm text-muted-foreground">{t('table.system')}</span>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="animate-fade-up py-16 text-center">
              <History className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
              <h3 className="text-lg font-semibold">{t('empty.title')}</h3>
              <p className="text-muted-foreground">
                {typeFilter !== 'all' ? t('empty.filtered') : t('empty.description')}
              </p>
            </div>
          )}

          {/* Pagination */}
          {data.totalTransactions > limit && (
            <div className="mt-4 flex animate-fade-up items-center justify-between">
              <p className="text-sm text-muted-foreground">
                {t('pagination.showing')} {page * limit + 1} -{' '}
                {Math.min((page + 1) * limit, data.totalTransactions)} {t('pagination.of')}{' '}
                {data.totalTransactions}
              </p>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => Math.max(0, p - 1))}
                  disabled={page === 0}
                >
                  {t('pagination.previous')}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => p + 1)}
                  disabled={(page + 1) * limit >= data.totalTransactions}
                >
                  {t('pagination.next')}
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
