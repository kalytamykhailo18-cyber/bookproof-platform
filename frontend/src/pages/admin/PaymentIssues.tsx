import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { paymentIssuesApi } from '@/lib/api/payment-issues';
import { toast } from 'sonner';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger } from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue } from '@/components/ui/select';
import { CheckCircle, RefreshCw, DollarSign, MessageSquare } from 'lucide-react';
import {
  PaymentIssueStatus,
  PaymentIssueType,
  PaymentIssuePriority,
  PaymentIssueAction } from '@/lib/api/payment-issues';

export function PaymentIssuesPage() {
  const { t } = useTranslation('adminPaymentIssues');

  const [issues, setIssues] = useState<any>(null);
  const [stats, setStats] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isResolving, setIsResolving] = useState(false);
  const [isRefunding, setIsRefunding] = useState(false);
  const [isReconciling, setIsReconciling] = useState(false);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  // Dialog states
  const [selectedIssueId, setSelectedIssueId] = useState<string>('');

  // Resolve Dialog State
  const [resolveDialogOpen, setResolveDialogOpen] = useState(false);
  const [resolution, setResolution] = useState('');
  const [resolveAction, setResolveAction] = useState<PaymentIssueAction>(
    PaymentIssueAction.CORRECTED,
  );
  const [stripeRefundId, setStripeRefundId] = useState('');

  // Refund Dialog State
  const [refundDialogOpen, setRefundDialogOpen] = useState(false);
  const [refundAmount, setRefundAmount] = useState<number>(0);
  const [refundReason, setRefundReason] = useState('');

  // Reconcile Dialog State
  const [reconcileDialogOpen, setReconcileDialogOpen] = useState(false);
  const [reconcileNotes, setReconcileNotes] = useState('');

  // Update Status Dialog State
  const [statusDialogOpen, setStatusDialogOpen] = useState(false);
  const [newStatus, setNewStatus] = useState<PaymentIssueStatus>(PaymentIssueStatus.IN_PROGRESS);
  const [adminNotes, setAdminNotes] = useState('');

  // Fetch data
  const fetchData = async () => {
    try {
      setIsLoading(true);
      const [issuesData, statsData] = await Promise.all([
        paymentIssuesApi.getOpenPaymentIssues(),
        paymentIssuesApi.getPaymentIssueStats()
      ]);
      setIssues(issuesData);
      setStats(statsData);
    } catch (error: any) {
      console.error('Payment issues error:', error);
      toast.error(t('messages.loadError'));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleResolve = async () => {
    try {
      setIsResolving(true);
      await paymentIssuesApi.resolvePaymentIssue(selectedIssueId, {
        resolution,
        action: resolveAction,
        stripeRefundId: stripeRefundId || undefined
      });
      toast.success(t('messages.resolveSuccess'));
      setResolveDialogOpen(false);
      setResolution('');
      setResolveAction(PaymentIssueAction.CORRECTED);
      setStripeRefundId('');
      await fetchData();
    } catch (error: any) {
      console.error('Resolve error:', error);
      toast.error(error.response?.data?.message || t('messages.resolveError'));
    } finally {
      setIsResolving(false);
    }
  };

  const handleProcessRefund = async () => {
    try {
      setIsRefunding(true);
      await paymentIssuesApi.processRefund(selectedIssueId, {
        amount: refundAmount,
        reason: refundReason
      });
      toast.success(t('messages.refundSuccess'));
      setRefundDialogOpen(false);
      setRefundAmount(0);
      setRefundReason('');
      await fetchData();
    } catch (error: any) {
      console.error('Refund error:', error);
      toast.error(error.response?.data?.message || t('messages.refundError'));
    } finally {
      setIsRefunding(false);
    }
  };

  const handleReconcile = async () => {
    try {
      setIsReconciling(true);
      await paymentIssuesApi.reconcilePayment(selectedIssueId, reconcileNotes);
      toast.success(t('messages.reconcileSuccess'));
      setReconcileDialogOpen(false);
      setReconcileNotes('');
      await fetchData();
    } catch (error: any) {
      console.error('Reconcile error:', error);
      toast.error(error.response?.data?.message || t('messages.reconcileError'));
    } finally {
      setIsReconciling(false);
    }
  };

  const handleUpdateStatus = async () => {
    try {
      setIsUpdatingStatus(true);
      await paymentIssuesApi.updatePaymentIssueStatus(selectedIssueId, {
        status: newStatus,
        adminNotes: adminNotes || undefined
      });
      toast.success(t('messages.updateStatusSuccess'));
      setStatusDialogOpen(false);
      setNewStatus(PaymentIssueStatus.IN_PROGRESS);
      setAdminNotes('');
      await fetchData();
    } catch (error: any) {
      console.error('Update status error:', error);
      toast.error(error.response?.data?.message || t('messages.updateStatusError'));
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const getPriorityColor = (priority: PaymentIssuePriority) => {
    switch (priority) {
      case PaymentIssuePriority.CRITICAL:
        return 'destructive';
      case PaymentIssuePriority.HIGH:
        return 'destructive';
      case PaymentIssuePriority.MEDIUM:
        return 'default';
      case PaymentIssuePriority.LOW:
        return 'secondary';
      default:
        return 'secondary';
    }
  };

  const getStatusColor = (status: PaymentIssueStatus) => {
    switch (status) {
      case PaymentIssueStatus.OPEN:
        return 'default';
      case PaymentIssueStatus.IN_PROGRESS:
        return 'secondary';
      case PaymentIssueStatus.ESCALATED:
        return 'destructive';
      case PaymentIssueStatus.RESOLVED:
        return 'outline';
      case PaymentIssueStatus.REJECTED:
        return 'outline';
      default:
        return 'secondary';
    }
  };

  const getTypeLabel = (type: PaymentIssueType) => {
    switch (type) {
      case PaymentIssueType.PAYMENT_FAILED:
        return t('types.PAYMENT_FAILED');
      case PaymentIssueType.PAYMENT_DISPUTE:
        return t('types.PAYMENT_DISPUTE');
      case PaymentIssueType.REFUND_REQUEST:
        return t('types.REFUND_REQUEST');
      case PaymentIssueType.PAYOUT_ISSUE:
        return t('types.PAYOUT_ISSUE');
      case PaymentIssueType.DUPLICATE_PAYMENT:
        return t('types.DUPLICATE_PAYMENT');
      case PaymentIssueType.CREDIT_MISMATCH:
        return t('types.CREDIT_MISMATCH');
      case PaymentIssueType.OTHER:
        return t('types.OTHER');
      default:
        return type;
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex h-64 items-center justify-center">
          <p className="text-muted-foreground">{t('loading')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto space-y-6 px-4 py-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">{t('title')}</h1>
          <p className="text-muted-foreground">{t('description')}</p>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-5">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>{t('stats.totalIssues')}</CardDescription>
            <CardTitle className="text-2xl">{stats?.total || 0}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>{t('stats.open')}</CardDescription>
            <CardTitle className="text-2xl text-yellow-600">{stats?.open || 0}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>{t('stats.inProgress')}</CardDescription>
            <CardTitle className="text-2xl text-blue-600">{stats?.inProgress || 0}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>{t('stats.resolved')}</CardDescription>
            <CardTitle className="text-2xl text-green-600">{stats?.resolved || 0}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>{t('stats.totalAmount')}</CardDescription>
            <CardTitle className="text-2xl text-red-600">
              ${stats?.totalAmount?.toFixed(2) || '0.00'}
            </CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* Payment Issues Table */}
      <Card>
        <CardHeader>
          <CardTitle>{t('table.title')}</CardTitle>
          <CardDescription>{t('table.description')}</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t('table.id')}</TableHead>
                <TableHead>{t('table.type')}</TableHead>
                <TableHead>{t('table.amount')}</TableHead>
                <TableHead>{t('table.priority')}</TableHead>
                <TableHead>{t('table.status')}</TableHead>
                <TableHead>{t('table.description_col')}</TableHead>
                <TableHead>{t('table.created')}</TableHead>
                <TableHead>{t('table.actions')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {issues && issues.length > 0 ? (
                issues.map((issue) => (
                  <TableRow key={issue.id}>
                    <TableCell className="font-mono text-xs">{issue.id.slice(0, 8)}...</TableCell>
                    <TableCell>
                      <Badge variant="outline">{getTypeLabel(issue.type)}</Badge>
                    </TableCell>
                    <TableCell className="font-medium">
                      ${issue.amount.toFixed(2)} {issue.currency}
                    </TableCell>
                    <TableCell>
                      <Badge variant={getPriorityColor(issue.priority)}>{issue.priority}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={getStatusColor(issue.status)}>{issue.status}</Badge>
                    </TableCell>
                    <TableCell className="max-w-xs truncate">{issue.description}</TableCell>
                    <TableCell>{new Date(issue.createdAt).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        {/* Update Status */}
                        <Dialog
                          open={statusDialogOpen && selectedIssueId === issue.id}
                          onOpenChange={(open) => {
                            setStatusDialogOpen(open);
                            if (open) setSelectedIssueId(issue.id);
                          }}
                        >
                          <DialogTrigger asChild>
                            <Button variant="outline" size="sm" title={t('actions.updateStatusTitle')}>
                              <MessageSquare className="h-4 w-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>{t('updateStatusDialog.title')}</DialogTitle>
                              <DialogDescription>
                                {t('updateStatusDialog.description')}
                              </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4">
                              <div>
                                <Label htmlFor="newStatus">{t('updateStatusDialog.statusLabel')}</Label>
                                <Select
                                  value={newStatus}
                                  onValueChange={(value: PaymentIssueStatus) => setNewStatus(value)}
                                >
                                  <SelectTrigger>
                                    <SelectValue placeholder={t('updateStatusDialog.statusPlaceholder')} />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value={PaymentIssueStatus.OPEN}>{t('statuses.OPEN')}</SelectItem>
                                    <SelectItem value={PaymentIssueStatus.IN_PROGRESS}>
                                      {t('statuses.IN_PROGRESS')}
                                    </SelectItem>
                                    <SelectItem value={PaymentIssueStatus.ESCALATED}>
                                      {t('statuses.ESCALATED')}
                                    </SelectItem>
                                    <SelectItem value={PaymentIssueStatus.RESOLVED}>
                                      {t('statuses.RESOLVED')}
                                    </SelectItem>
                                    <SelectItem value={PaymentIssueStatus.REJECTED}>
                                      {t('statuses.REJECTED')}
                                    </SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                              <div>
                                <Label htmlFor="adminNotes">{t('updateStatusDialog.adminNotesLabel')}</Label>
                                <Textarea
                                  id="adminNotes"
                                  value={adminNotes}
                                  onChange={(e) => setAdminNotes(e.target.value)}
                                  placeholder={t('updateStatusDialog.adminNotesPlaceholder')}
                                  rows={3}
                                />
                              </div>
                            </div>
                            <DialogFooter>
                              <Button type="button" variant="outline" onClick={() => setStatusDialogOpen(false)}>
                                {t('updateStatusDialog.cancel')}
                              </Button>
                              <Button
                                type="button"
                                onClick={handleUpdateStatus}
                                disabled={isUpdatingStatus}
                              >
                                {isUpdatingStatus ? t('updateStatusDialog.updating') : t('updateStatusDialog.updateButton')}
                              </Button>
                            </DialogFooter>
                          </DialogContent>
                        </Dialog>

                        {/* Process Refund */}
                        <Dialog
                          open={refundDialogOpen && selectedIssueId === issue.id}
                          onOpenChange={(open) => {
                            setRefundDialogOpen(open);
                            if (open) {
                              setSelectedIssueId(issue.id);
                              setRefundAmount(issue.amount);
                            }
                          }}
                        >
                          <DialogTrigger asChild>
                            <Button variant="outline" size="sm" title={t('actions.processRefundTitle')}>
                              <DollarSign className="h-4 w-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>{t('refundDialog.title')}</DialogTitle>
                              <DialogDescription>{t('refundDialog.description')}</DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4">
                              <div>
                                <Label htmlFor="refundAmount">{t('refundDialog.amountLabel')}</Label>
                                <Input
                                  id="refundAmount"
                                  type="number"
                                  value={refundAmount}
                                  onChange={(e) => setRefundAmount(Number(e.target.value))}
                                  min={0}
                                  max={issue.amount}
                                  step={0.01}
                                />
                              </div>
                              <div>
                                <Label htmlFor="refundReason">{t('refundDialog.reasonLabel')}</Label>
                                <Textarea
                                  id="refundReason"
                                  value={refundReason}
                                  onChange={(e) => setRefundReason(e.target.value)}
                                  placeholder={t('refundDialog.reasonPlaceholder')}
                                  rows={3}
                                />
                              </div>
                            </div>
                            <DialogFooter>
                              <Button type="button" variant="outline" onClick={() => setRefundDialogOpen(false)}>
                                {t('refundDialog.cancel')}
                              </Button>
                              <Button
                                type="button"
                                variant="destructive"
                                onClick={handleProcessRefund}
                                disabled={
                                  !refundReason || refundAmount <= 0 || isRefunding
                                }
                              >
                                {isRefunding ? t('refundDialog.processing') : t('refundDialog.processButton')}
                              </Button>
                            </DialogFooter>
                          </DialogContent>
                        </Dialog>

                        {/* Reconcile */}
                        <Dialog
                          open={reconcileDialogOpen && selectedIssueId === issue.id}
                          onOpenChange={(open) => {
                            setReconcileDialogOpen(open);
                            if (open) setSelectedIssueId(issue.id);
                          }}
                        >
                          <DialogTrigger asChild>
                            <Button variant="outline" size="sm" title={t('actions.reconcileTitle')}>
                              <RefreshCw className="h-4 w-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>{t('reconcileDialog.title')}</DialogTitle>
                              <DialogDescription>{t('reconcileDialog.description')}</DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4">
                              <div>
                                <Label htmlFor="reconcileNotes">{t('reconcileDialog.notesLabel')}</Label>
                                <Textarea
                                  id="reconcileNotes"
                                  value={reconcileNotes}
                                  onChange={(e) => setReconcileNotes(e.target.value)}
                                  placeholder={t('reconcileDialog.notesPlaceholder')}
                                  rows={3}
                                />
                              </div>
                            </div>
                            <DialogFooter>
                              <Button
                                variant="outline"
                                onClick={() => setReconcileDialogOpen(false)}
                              >
                                {t('reconcileDialog.cancel')}
                              </Button>
                              <Button
                                onClick={handleReconcile}
                                disabled={!reconcileNotes || isReconciling}
                              >
                                {isReconciling ? t('reconcileDialog.reconciling') : t('reconcileDialog.reconcileButton')}
                              </Button>
                            </DialogFooter>
                          </DialogContent>
                        </Dialog>

                        {/* Resolve */}
                        <Dialog
                          open={resolveDialogOpen && selectedIssueId === issue.id}
                          onOpenChange={(open) => {
                            setResolveDialogOpen(open);
                            if (open) setSelectedIssueId(issue.id);
                          }}
                        >
                          <DialogTrigger asChild>
                            <Button variant="outline" size="sm" title={t('actions.resolveTitle')}>
                              <CheckCircle className="h-4 w-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>{t('resolveDialog.title')}</DialogTitle>
                              <DialogDescription>{t('resolveDialog.description')}</DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4">
                              <div>
                                <Label htmlFor="resolveAction">{t('resolveDialog.actionLabel')}</Label>
                                <Select
                                  value={resolveAction}
                                  onValueChange={(value: PaymentIssueAction) =>
                                    setResolveAction(value)
                                  }
                                >
                                  <SelectTrigger>
                                    <SelectValue placeholder={t('resolveDialog.actionPlaceholder')} />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value={PaymentIssueAction.REFUNDED}>
                                      {t('resolveActions.REFUNDED')}
                                    </SelectItem>
                                    <SelectItem value={PaymentIssueAction.CORRECTED}>
                                      {t('resolveActions.CORRECTED')}
                                    </SelectItem>
                                    <SelectItem value={PaymentIssueAction.RECONCILED}>
                                      {t('resolveActions.RECONCILED')}
                                    </SelectItem>
                                    <SelectItem value={PaymentIssueAction.CREDITED}>
                                      {t('resolveActions.CREDITED')}
                                    </SelectItem>
                                    <SelectItem value={PaymentIssueAction.NO_ACTION}>
                                      {t('resolveActions.NO_ACTION')}
                                    </SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                              <div>
                                <Label htmlFor="resolution">{t('resolveDialog.resolutionLabel')}</Label>
                                <Textarea
                                  id="resolution"
                                  value={resolution}
                                  onChange={(e) => setResolution(e.target.value)}
                                  placeholder={t('resolveDialog.resolutionPlaceholder')}
                                  rows={4}
                                />
                              </div>
                              <div>
                                <Label htmlFor="stripeRefundId">{t('resolveDialog.stripeRefundIdLabel')}</Label>
                                <Input
                                  id="stripeRefundId"
                                  value={stripeRefundId}
                                  onChange={(e) => setStripeRefundId(e.target.value)}
                                  placeholder={t('resolveDialog.stripeRefundIdPlaceholder')}
                                />
                              </div>
                            </div>
                            <DialogFooter>
                              <Button type="button" variant="outline" onClick={() => setResolveDialogOpen(false)}>
                                {t('resolveDialog.cancel')}
                              </Button>
                              <Button
                                type="button"
                                onClick={handleResolve}
                                disabled={!resolution || isResolving}
                              >
                                {isResolving ? t('resolveDialog.resolving') : t('resolveDialog.resolveButton')}
                              </Button>
                            </DialogFooter>
                          </DialogContent>
                        </Dialog>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={8} className="text-center text-muted-foreground">
                    {t('empty.message')}
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
