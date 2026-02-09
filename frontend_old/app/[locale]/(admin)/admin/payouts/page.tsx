'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { format } from '@/node_modules/date-fns';
import {
  CheckCircle,
  XCircle,
  Clock,
  Eye,
  DollarSign,
  AlertCircle,
  TrendingUp,
} from 'lucide-react';

import { useAllPayouts } from '@/hooks/usePayouts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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

type PayoutStatus =
  | 'REQUESTED'
  | 'PENDING_REVIEW'
  | 'APPROVED'
  | 'PROCESSING'
  | 'COMPLETED'
  | 'REJECTED'
  | 'CANCELLED';

interface PayoutData {
  id: string;
  readerProfileId: string;
  amount: number;
  paymentMethod: string;
  requestedAt: string;
  status: PayoutStatus;
}

export default function AdminPayoutsPage() {
  const t = useTranslations('adminPayouts');
  const { data: allPayouts, isLoading } = useAllPayouts();

  const [selectedPayoutId, setSelectedPayoutId] = useState<string | null>(null);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [approveDialogOpen, setApproveDialogOpen] = useState(false);
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [completeDialogOpen, setCompleteDialogOpen] = useState(false);

  const selectedPayout = allPayouts?.find((p) => p.id === selectedPayoutId);

  const filterPayoutsByStatus = (status?: PayoutStatus) => {
    if (!allPayouts) return [];
    if (!status) return allPayouts;
    return allPayouts.filter((p) => p.status === status);
  };

  const handleViewDetails = (payoutId: string) => {
    setSelectedPayoutId(payoutId);
    setDetailsDialogOpen(true);
  };

  const handleApprove = (payoutId: string) => {
    setSelectedPayoutId(payoutId);
    setApproveDialogOpen(true);
  };

  const handleReject = (payoutId: string) => {
    setSelectedPayoutId(payoutId);
    setRejectDialogOpen(true);
  };

  const handleComplete = (payoutId: string) => {
    setSelectedPayoutId(payoutId);
    setCompleteDialogOpen(true);
  };

  const PayoutTable = ({ payouts }: { payouts: PayoutData[] }) => {
    if (payouts.length === 0) {
      return (
        <div className="animate-fade-up py-16 text-center">
          <AlertCircle className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
          <h3 className="text-lg font-semibold">{t('empty.title')}</h3>
          <p className="text-muted-foreground">{t('empty.description')}</p>
        </div>
      );
    }

    return (
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>{t('table.reader')}</TableHead>
            <TableHead>{t('table.amount')}</TableHead>
            <TableHead>{t('table.method')}</TableHead>
            <TableHead>{t('table.requestedAt')}</TableHead>
            <TableHead>{t('table.status')}</TableHead>
            <TableHead className="text-right">{t('table.actions')}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {payouts.map((payout: PayoutData, index: number) => (
            <TableRow
              key={payout.id}
              className={`animate-fade-up-${['fast', 'light-slow', 'medium-slow', 'heavy-slow'][index % 4]}`}
            >
              <TableCell className="font-medium">{payout.readerProfileId}</TableCell>
              <TableCell className="font-semibold">${payout.amount.toFixed(2)}</TableCell>
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
                  onClick={() => handleViewDetails(payout.id)}
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
                      onClick={() => handleApprove(payout.id)}
                    >
                      <CheckCircle className="mr-1 h-4 w-4" />
                      {t('actions.approve')}
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => handleReject(payout.id)}
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
                    onClick={() => handleComplete(payout.id)}
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

  const pendingPayouts = filterPayoutsByStatus('REQUESTED');
  const approvedPayouts = filterPayoutsByStatus('APPROVED');
  const completedPayouts = filterPayoutsByStatus('COMPLETED');
  const rejectedPayouts = filterPayoutsByStatus('REJECTED');

  const totalAmount = allPayouts?.reduce((sum, p) => sum + p.amount, 0) || 0;

  return (
    <div className="container mx-auto space-y-6 p-6">
      {/* Header */}
      <div className="animate-fade-up">
        <h1 className="text-3xl font-bold">{t('title')}</h1>
        <p className="text-muted-foreground">{t('description')}</p>
      </div>

      {/* Summary Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="animate-fade-up-fast">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('stats.pending')}</CardTitle>
            <Clock className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{pendingPayouts.length}</div>
            <p className="text-xs text-muted-foreground">{t('stats.awaitingReview')}</p>
          </CardContent>
        </Card>

        <Card className="animate-fade-up-light-slow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('stats.approved')}</CardTitle>
            <CheckCircle className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{approvedPayouts.length}</div>
            <p className="text-xs text-muted-foreground">{t('stats.readyToProcess')}</p>
          </CardContent>
        </Card>

        <Card className="animate-fade-up-medium-slow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('stats.completed')}</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{completedPayouts.length}</div>
            <p className="text-xs text-muted-foreground">{t('stats.successfulPayouts')}</p>
          </CardContent>
        </Card>

        <Card className="animate-fade-up-heavy-slow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('stats.totalAmount')}</CardTitle>
            <DollarSign className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">${totalAmount.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">{t('stats.allPayouts')}</p>
          </CardContent>
        </Card>
      </div>

      {/* Payouts Table */}
      <Card className="animate-zoom-in">
        <CardHeader>
          <CardTitle>{t('title')}</CardTitle>
          <CardDescription>{t('description')}</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="pending" className="w-full">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="pending">
                {t('tabs.pending')} ({pendingPayouts.length})
              </TabsTrigger>
              <TabsTrigger value="approved">
                {t('tabs.approved')} ({approvedPayouts.length})
              </TabsTrigger>
              <TabsTrigger value="completed">
                {t('tabs.completed')} ({completedPayouts.length})
              </TabsTrigger>
              <TabsTrigger value="rejected">
                {t('tabs.rejected')} ({rejectedPayouts.length})
              </TabsTrigger>
              <TabsTrigger value="all">
                {t('tabs.all')} ({allPayouts?.length || 0})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="pending">
              <PayoutTable payouts={pendingPayouts} />
            </TabsContent>
            <TabsContent value="approved">
              <PayoutTable payouts={approvedPayouts} />
            </TabsContent>
            <TabsContent value="completed">
              <PayoutTable payouts={completedPayouts} />
            </TabsContent>
            <TabsContent value="rejected">
              <PayoutTable payouts={rejectedPayouts} />
            </TabsContent>
            <TabsContent value="all">
              <PayoutTable payouts={allPayouts || []} />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Dialogs */}
      {selectedPayout && (
        <>
          <PayoutDetailsDialog
            payout={selectedPayout}
            open={detailsDialogOpen}
            onOpenChange={setDetailsDialogOpen}
          />
          <ApprovePayoutDialog
            payout={selectedPayout}
            open={approveDialogOpen}
            onOpenChange={setApproveDialogOpen}
          />
          <RejectPayoutDialog
            payout={selectedPayout}
            open={rejectDialogOpen}
            onOpenChange={setRejectDialogOpen}
          />
          <CompletePayoutDialog
            payout={selectedPayout}
            open={completeDialogOpen}
            onOpenChange={setCompleteDialogOpen}
          />
        </>
      )}
    </div>
  );
}
