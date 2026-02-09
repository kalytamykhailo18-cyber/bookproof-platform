import { useState } from 'react';
import { useTranslation } from 'node_modules/react-i18next';
import { useReferredAuthors, useReferredAuthorDetail } from '@/hooks/useAffiliates';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
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
  DialogHeader,
  DialogTitle } from '@/components/ui/dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { Users, DollarSign, ShoppingBag, Calendar } from 'lucide-react';
import { formatDate } from '@/lib/utils';

export function ReferredAuthorsPage() {
  const { t } = useTranslation('affiliates.referredAuthors');
  const [selectedReferralId, setSelectedReferralId] = useState<string | null>(null);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);

  const { data: referredAuthors, isLoading } = useReferredAuthors();
  const { data: authorDetail, isLoading: detailLoading } = useReferredAuthorDetail(
    selectedReferralId || '',
  );

  const handleViewDetail = (referralId: string) => {
    setSelectedReferralId(referralId);
    setDetailDialogOpen(true);
  };

  const totalCommissionEarned =
    referredAuthors?.reduce((sum, author) => sum + author.totalCommissionEarned, 0) || 0;
  const totalPurchases =
    referredAuthors?.reduce((sum, author) => sum + author.totalPurchases, 0) || 0;

  if (isLoading) {
    return (
      <div className="container mx-auto max-w-7xl space-y-6 px-4 py-8">
        <div className="space-y-2">
          <Skeleton className="h-9 w-48 animate-pulse" />
          <Skeleton className="h-5 w-80 animate-pulse" />
        </div>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <Skeleton className="h-24 animate-pulse" />
          <Skeleton className="h-24 animate-pulse" />
          <Skeleton className="h-24 animate-pulse" />
        </div>
        <Skeleton className="h-96 animate-pulse" />
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-7xl space-y-6 px-4 py-8">
      {/* Header */}
      <div className="animate-fade-up">
        <h1 className="text-3xl font-bold">{t('title') || 'Referred Authors'}</h1>
        <p className="mt-2 text-muted-foreground">
          {t('description') || 'View all authors you have referred and their purchase activity'}
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <Card className="animate-fade-up-fast">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t('stats.totalReferrals') || 'Total Referred Authors'}
            </CardTitle>
            <Users className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {referredAuthors?.length || 0}
            </div>
          </CardContent>
        </Card>

        <Card className="animate-fade-up-light-slow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t('stats.totalPurchases') || 'Total Purchases'}
            </CardTitle>
            <ShoppingBag className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{totalPurchases}</div>
          </CardContent>
        </Card>

        <Card className="animate-fade-up-slow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t('stats.totalCommission') || 'Total Commission Earned'}
            </CardTitle>
            <DollarSign className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              ${totalCommissionEarned.toFixed(2)}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Authors Table */}
      <Card className="animate-zoom-in-slow">
        <CardHeader>
          <CardTitle>{t('table.title') || 'Referred Authors List'}</CardTitle>
          <CardDescription>
            {t('table.description') || 'Click on an author to see their purchase history'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!referredAuthors || referredAuthors.length === 0 ? (
            <div className="py-12 text-center text-muted-foreground">
              <Users className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
              <p className="text-lg font-medium">
                {t('table.empty') || 'No referred authors yet'}
              </p>
              <p className="text-sm">
                {t('table.emptyDescription') ||
                  'Share your referral link to start earning commissions!'}
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t('table.author') || 'Author'}</TableHead>
                  <TableHead>{t('table.signUpDate') || 'Sign-up Date'}</TableHead>
                  <TableHead>{t('table.totalPurchases') || 'Total Purchases'}</TableHead>
                  <TableHead>{t('table.commissionEarned') || 'Commission Earned'}</TableHead>
                  <TableHead>{t('table.lastPurchase') || 'Last Purchase'}</TableHead>
                  <TableHead className="text-right">{t('table.actions') || 'Actions'}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {referredAuthors.map((author, index) => (
                  <TableRow
                    key={author.id}
                    className={`animate-fade-up-${index % 2 === 0 ? 'fast' : 'light-slow'} cursor-pointer hover:bg-muted/50`}
                    onClick={() => handleViewDetail(author.id)}
                  >
                    <TableCell className="font-mono text-sm">{author.authorIdentifier}</TableCell>
                    <TableCell>{formatDate(author.signUpDate)}</TableCell>
                    <TableCell>{author.totalPurchases}</TableCell>
                    <TableCell className="font-semibold text-green-600">
                      ${author.totalCommissionEarned.toFixed(2)}
                    </TableCell>
                    <TableCell>
                      {author.lastPurchaseDate ? formatDate(author.lastPurchaseDate) : '-'}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleViewDetail(author.id);
                        }}
                      >
                        {t('table.viewDetails') || 'View Details'}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Detail Dialog */}
      <Dialog open={detailDialogOpen} onOpenChange={setDetailDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              {t('detail.title') || 'Author Purchase History'}
            </DialogTitle>
            <DialogDescription>
              {t('detail.description') || 'Purchase history and commission breakdown'}
            </DialogDescription>
          </DialogHeader>

          {detailLoading ? (
            <div className="space-y-4">
              <Skeleton className="h-20 animate-pulse" />
              <Skeleton className="h-48 animate-pulse" />
            </div>
          ) : authorDetail ? (
            <div className="space-y-6">
              {/* Summary */}
              <div className="rounded-lg bg-muted p-4">
                <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                  <div>
                    <p className="text-sm text-muted-foreground">
                      {t('detail.author') || 'Author'}
                    </p>
                    <p className="font-mono font-medium">{authorDetail.authorIdentifier}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">
                      {t('detail.signUpDate') || 'Sign-up Date'}
                    </p>
                    <p className="font-medium">{formatDate(authorDetail.signUpDate)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">
                      {t('detail.totalPurchases') || 'Purchases'}
                    </p>
                    <p className="font-medium">{authorDetail.totalPurchases}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">
                      {t('detail.totalCommission') || 'Total Commission'}
                    </p>
                    <p className="font-semibold text-green-600">
                      ${authorDetail.totalCommissionEarned.toFixed(2)}
                    </p>
                  </div>
                </div>
              </div>

              {/* Purchase History */}
              <div>
                <h4 className="mb-3 font-semibold">
                  {t('detail.purchaseHistory') || 'Purchase History (Amounts Only)'}
                </h4>
                {authorDetail.purchaseHistory.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    {t('detail.noPurchases') || 'No purchases yet'}
                  </p>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>{t('detail.date') || 'Date'}</TableHead>
                        <TableHead>{t('detail.purchaseAmount') || 'Purchase Amount'}</TableHead>
                        <TableHead>{t('detail.commission') || 'Your Commission'}</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {authorDetail.purchaseHistory.map((purchase, index) => (
                        <TableRow key={index}>
                          <TableCell>{formatDate(purchase.date)}</TableCell>
                          <TableCell>${purchase.amount.toFixed(2)}</TableCell>
                          <TableCell className="font-semibold text-green-600">
                            ${purchase.commission.toFixed(2)}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </div>
            </div>
          ) : (
            <p className="text-center text-muted-foreground">
              {t('detail.notFound') || 'Author not found'}
            </p>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
