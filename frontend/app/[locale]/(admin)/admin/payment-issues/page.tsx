'use client';

import { useState } from 'react';
import {
  useOpenPaymentIssues,
  usePaymentIssueStats,
  useResolvePaymentIssue,
  useProcessRefund,
  useReconcilePayment,
  useUpdatePaymentIssueStatus,
} from '@/hooks/usePaymentIssues';
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
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { CheckCircle, RefreshCw, DollarSign, MessageSquare } from 'lucide-react';
import {
  PaymentIssueStatus,
  PaymentIssueType,
  PaymentIssuePriority,
  PaymentIssueAction,
} from '@/lib/api/payment-issues';

export default function PaymentIssuesPage() {
  const { data: issues, isLoading } = useOpenPaymentIssues();
  const { data: stats } = usePaymentIssueStats();
  const resolveIssue = useResolvePaymentIssue();
  const processRefund = useProcessRefund();
  const reconcilePayment = useReconcilePayment();
  const updateStatus = useUpdatePaymentIssueStatus();

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

  const handleResolve = () => {
    resolveIssue.mutate(
      {
        issueId: selectedIssueId,
        data: {
          resolution,
          action: resolveAction,
          stripeRefundId: stripeRefundId || undefined,
        },
      },
      {
        onSuccess: () => {
          setResolveDialogOpen(false);
          setResolution('');
          setResolveAction(PaymentIssueAction.CORRECTED);
          setStripeRefundId('');
        },
      },
    );
  };

  const handleProcessRefund = () => {
    processRefund.mutate(
      {
        issueId: selectedIssueId,
        data: {
          amount: refundAmount,
          reason: refundReason,
        },
      },
      {
        onSuccess: () => {
          setRefundDialogOpen(false);
          setRefundAmount(0);
          setRefundReason('');
        },
      },
    );
  };

  const handleReconcile = () => {
    reconcilePayment.mutate(
      {
        issueId: selectedIssueId,
        notes: reconcileNotes,
      },
      {
        onSuccess: () => {
          setReconcileDialogOpen(false);
          setReconcileNotes('');
        },
      },
    );
  };

  const handleUpdateStatus = () => {
    updateStatus.mutate(
      {
        issueId: selectedIssueId,
        data: {
          status: newStatus,
          adminNotes: adminNotes || undefined,
        },
      },
      {
        onSuccess: () => {
          setStatusDialogOpen(false);
          setNewStatus(PaymentIssueStatus.IN_PROGRESS);
          setAdminNotes('');
        },
      },
    );
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
        return 'Payment Failed';
      case PaymentIssueType.PAYMENT_DISPUTE:
        return 'Payment Dispute';
      case PaymentIssueType.REFUND_REQUEST:
        return 'Refund Request';
      case PaymentIssueType.PAYOUT_ISSUE:
        return 'Payout Issue';
      case PaymentIssueType.DUPLICATE_PAYMENT:
        return 'Duplicate Payment';
      case PaymentIssueType.CREDIT_MISMATCH:
        return 'Credit Mismatch';
      case PaymentIssueType.OTHER:
        return 'Other';
      default:
        return type;
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex h-64 items-center justify-center">
          <p className="text-muted-foreground">Loading payment issues...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto space-y-6 px-4 py-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Payment Issues</h1>
          <p className="text-muted-foreground">
            Manage payment discrepancies, refunds, and billing issues
          </p>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-5">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Issues</CardDescription>
            <CardTitle className="text-2xl">{stats?.total || 0}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Open</CardDescription>
            <CardTitle className="text-2xl text-yellow-600">{stats?.open || 0}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>In Progress</CardDescription>
            <CardTitle className="text-2xl text-blue-600">{stats?.inProgress || 0}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Resolved</CardDescription>
            <CardTitle className="text-2xl text-green-600">{stats?.resolved || 0}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Amount</CardDescription>
            <CardTitle className="text-2xl text-red-600">
              ${stats?.totalAmount?.toFixed(2) || '0.00'}
            </CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* Payment Issues Table */}
      <Card>
        <CardHeader>
          <CardTitle>Open Payment Issues</CardTitle>
          <CardDescription>Payment issues requiring attention</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Priority</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>Actions</TableHead>
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
                            <Button variant="outline" size="sm" title="Update Status">
                              <MessageSquare className="h-4 w-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Update Issue Status</DialogTitle>
                              <DialogDescription>
                                Update the status and add notes to this issue
                              </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4">
                              <div>
                                <Label htmlFor="newStatus">Status *</Label>
                                <Select
                                  value={newStatus}
                                  onValueChange={(value: PaymentIssueStatus) => setNewStatus(value)}
                                >
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select status" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value={PaymentIssueStatus.OPEN}>Open</SelectItem>
                                    <SelectItem value={PaymentIssueStatus.IN_PROGRESS}>
                                      In Progress
                                    </SelectItem>
                                    <SelectItem value={PaymentIssueStatus.ESCALATED}>
                                      Escalated
                                    </SelectItem>
                                    <SelectItem value={PaymentIssueStatus.RESOLVED}>
                                      Resolved
                                    </SelectItem>
                                    <SelectItem value={PaymentIssueStatus.REJECTED}>
                                      Rejected
                                    </SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                              <div>
                                <Label htmlFor="adminNotes">Admin Notes</Label>
                                <Textarea
                                  id="adminNotes"
                                  value={adminNotes}
                                  onChange={(e) => setAdminNotes(e.target.value)}
                                  placeholder="Add notes for audit trail"
                                  rows={3}
                                />
                              </div>
                            </div>
                            <DialogFooter>
                              <Button variant="outline" onClick={() => setStatusDialogOpen(false)}>
                                Cancel
                              </Button>
                              <Button
                                onClick={handleUpdateStatus}
                                disabled={updateStatus.isPending}
                              >
                                {updateStatus.isPending ? 'Updating...' : 'Update Status'}
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
                            <Button variant="outline" size="sm" title="Process Refund">
                              <DollarSign className="h-4 w-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Process Refund</DialogTitle>
                              <DialogDescription>
                                Process a refund for this payment
                              </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4">
                              <div>
                                <Label htmlFor="refundAmount">Refund Amount *</Label>
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
                                <Label htmlFor="refundReason">Reason *</Label>
                                <Textarea
                                  id="refundReason"
                                  value={refundReason}
                                  onChange={(e) => setRefundReason(e.target.value)}
                                  placeholder="Explain why the refund is being processed"
                                  rows={3}
                                />
                              </div>
                            </div>
                            <DialogFooter>
                              <Button variant="outline" onClick={() => setRefundDialogOpen(false)}>
                                Cancel
                              </Button>
                              <Button
                                variant="destructive"
                                onClick={handleProcessRefund}
                                disabled={
                                  !refundReason || refundAmount <= 0 || processRefund.isPending
                                }
                              >
                                {processRefund.isPending ? 'Processing...' : 'Process Refund'}
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
                            <Button variant="outline" size="sm" title="Reconcile">
                              <RefreshCw className="h-4 w-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Reconcile Payment</DialogTitle>
                              <DialogDescription>Mark this payment as reconciled</DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4">
                              <div>
                                <Label htmlFor="reconcileNotes">Reconciliation Notes *</Label>
                                <Textarea
                                  id="reconcileNotes"
                                  value={reconcileNotes}
                                  onChange={(e) => setReconcileNotes(e.target.value)}
                                  placeholder="Explain the reconciliation details"
                                  rows={3}
                                />
                              </div>
                            </div>
                            <DialogFooter>
                              <Button
                                variant="outline"
                                onClick={() => setReconcileDialogOpen(false)}
                              >
                                Cancel
                              </Button>
                              <Button
                                onClick={handleReconcile}
                                disabled={!reconcileNotes || reconcilePayment.isPending}
                              >
                                {reconcilePayment.isPending ? 'Reconciling...' : 'Reconcile'}
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
                            <Button variant="outline" size="sm" title="Resolve">
                              <CheckCircle className="h-4 w-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Resolve Payment Issue</DialogTitle>
                              <DialogDescription>
                                Provide a resolution for this payment issue
                              </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4">
                              <div>
                                <Label htmlFor="resolveAction">Action Taken *</Label>
                                <Select
                                  value={resolveAction}
                                  onValueChange={(value: PaymentIssueAction) =>
                                    setResolveAction(value)
                                  }
                                >
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select action" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value={PaymentIssueAction.REFUNDED}>
                                      Refunded
                                    </SelectItem>
                                    <SelectItem value={PaymentIssueAction.CORRECTED}>
                                      Corrected
                                    </SelectItem>
                                    <SelectItem value={PaymentIssueAction.RECONCILED}>
                                      Reconciled
                                    </SelectItem>
                                    <SelectItem value={PaymentIssueAction.CREDITED}>
                                      Credited
                                    </SelectItem>
                                    <SelectItem value={PaymentIssueAction.NO_ACTION}>
                                      No Action
                                    </SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                              <div>
                                <Label htmlFor="resolution">Resolution *</Label>
                                <Textarea
                                  id="resolution"
                                  value={resolution}
                                  onChange={(e) => setResolution(e.target.value)}
                                  placeholder="Describe how the issue was resolved"
                                  rows={4}
                                />
                              </div>
                              <div>
                                <Label htmlFor="stripeRefundId">Stripe Refund ID (optional)</Label>
                                <Input
                                  id="stripeRefundId"
                                  value={stripeRefundId}
                                  onChange={(e) => setStripeRefundId(e.target.value)}
                                  placeholder="re_xxxxxx"
                                />
                              </div>
                            </div>
                            <DialogFooter>
                              <Button variant="outline" onClick={() => setResolveDialogOpen(false)}>
                                Cancel
                              </Button>
                              <Button
                                onClick={handleResolve}
                                disabled={!resolution || resolveIssue.isPending}
                              >
                                {resolveIssue.isPending ? 'Resolving...' : 'Resolve Issue'}
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
                    No open payment issues found
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
