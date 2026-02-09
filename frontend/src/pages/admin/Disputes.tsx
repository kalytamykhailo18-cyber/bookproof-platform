import { useState } from 'react';
import {
  useOpenDisputes,
  useDisputeStats,
  useSlaStats,
  useResolveDispute,
  useEscalateDispute,
  useUpdateDisputeStatus,
  useResolveAppeal } from '@/hooks/useDisputes';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
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
import { CheckCircle, ArrowUpCircle, MessageSquare, Scale, Clock, AlertTriangle } from 'lucide-react';
import { DisputeStatus, DisputeType, DisputePriority, AppealStatus } from '@/lib/api/disputes';

export function DisputesPage() {
  const { data: disputes, isLoading } = useOpenDisputes();
  const { data: stats } = useDisputeStats();
  const { data: slaStats } = useSlaStats();
  const resolveDispute = useResolveDispute();
  const escalateDispute = useEscalateDispute();
  const updateStatus = useUpdateDisputeStatus();
  const resolveAppeal = useResolveAppeal();

  // Dialog states
  const [selectedDisputeId, setSelectedDisputeId] = useState<string>('');

  // Resolve Dialog State
  const [resolveDialogOpen, setResolveDialogOpen] = useState(false);
  const [resolution, setResolution] = useState('');
  const [resolveStatus, setResolveStatus] = useState<
    DisputeStatus.RESOLVED | DisputeStatus.REJECTED
  >(DisputeStatus.RESOLVED);

  // Escalate Dialog State
  const [escalateDialogOpen, setEscalateDialogOpen] = useState(false);
  const [escalationReason, setEscalationReason] = useState('');

  // Update Status Dialog State
  const [statusDialogOpen, setStatusDialogOpen] = useState(false);
  const [newStatus, setNewStatus] = useState<DisputeStatus>(DisputeStatus.IN_PROGRESS);
  const [adminNotes, setAdminNotes] = useState('');

  // Appeal Resolution Dialog State
  const [appealDialogOpen, setAppealDialogOpen] = useState(false);
  const [appealApproved, setAppealApproved] = useState(true);
  const [appealResolution, setAppealResolution] = useState('');

  const handleResolve = () => {
    resolveDispute.mutate(
      {
        disputeId: selectedDisputeId,
        data: {
          resolution,
          status: resolveStatus } },
      {
        onSuccess: () => {
          setResolveDialogOpen(false);
          setResolution('');
          setResolveStatus(DisputeStatus.RESOLVED as DisputeStatus.RESOLVED);
        } },
    );
  };

  const handleEscalate = () => {
    escalateDispute.mutate(
      {
        disputeId: selectedDisputeId,
        data: {
          reason: escalationReason } },
      {
        onSuccess: () => {
          setEscalateDialogOpen(false);
          setEscalationReason('');
        } },
    );
  };

  const handleUpdateStatus = () => {
    updateStatus.mutate(
      {
        disputeId: selectedDisputeId,
        data: {
          status: newStatus,
          adminNotes: adminNotes || undefined } },
      {
        onSuccess: () => {
          setStatusDialogOpen(false);
          setNewStatus(DisputeStatus.IN_PROGRESS);
          setAdminNotes('');
        } },
    );
  };

  const handleResolveAppeal = () => {
    resolveAppeal.mutate(
      {
        disputeId: selectedDisputeId,
        data: {
          approved: appealApproved,
          resolution: appealResolution } },
      {
        onSuccess: () => {
          setAppealDialogOpen(false);
          setAppealApproved(true);
          setAppealResolution('');
        } },
    );
  };

  const getPriorityColor = (priority: DisputePriority) => {
    switch (priority) {
      case DisputePriority.CRITICAL:
        return 'destructive';
      case DisputePriority.HIGH:
        return 'destructive';
      case DisputePriority.MEDIUM:
        return 'default';
      case DisputePriority.LOW:
        return 'secondary';
      default:
        return 'secondary';
    }
  };

  const getStatusColor = (status: DisputeStatus) => {
    switch (status) {
      case DisputeStatus.OPEN:
        return 'default';
      case DisputeStatus.IN_PROGRESS:
        return 'secondary';
      case DisputeStatus.ESCALATED:
        return 'destructive';
      case DisputeStatus.RESOLVED:
        return 'outline';
      case DisputeStatus.REJECTED:
        return 'outline';
      default:
        return 'secondary';
    }
  };

  const getTypeLabel = (type: DisputeType) => {
    switch (type) {
      case DisputeType.AUTHOR_DISPUTE:
        return 'Author Dispute';
      case DisputeType.AUTHOR_COMPLAINT:
        return 'Author Complaint';
      case DisputeType.READER_COMPLAINT:
        return 'Reader Complaint';
      case DisputeType.REVIEW_QUALITY:
        return 'Review Quality';
      case DisputeType.PAYMENT_ISSUE:
        return 'Payment Issue';
      case DisputeType.SERVICE_ISSUE:
        return 'Service Issue';
      case DisputeType.POLICY_VIOLATION:
        return 'Policy Violation';
      case DisputeType.OTHER:
        return 'Other';
      default:
        return type;
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex h-64 items-center justify-center">
          <p className="text-muted-foreground">Loading disputes...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto space-y-6 px-4 py-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Customer Disputes</h1>
          <p className="text-muted-foreground">
            Manage customer complaints and disputes from authors and readers
          </p>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-5">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Disputes</CardDescription>
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
            <CardDescription>Escalated</CardDescription>
            <CardTitle className="text-2xl text-red-600">{stats?.escalated || 0}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Resolved</CardDescription>
            <CardTitle className="text-2xl text-green-600">{stats?.resolved || 0}</CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* SLA Performance Card */}
      {slaStats && (
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-muted-foreground" />
              <CardTitle>SLA Performance</CardTitle>
            </div>
            <CardDescription>Response time compliance metrics</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Compliance Rate</p>
                <p className={`text-2xl font-bold ${slaStats.complianceRate >= 90 ? 'text-green-600' : slaStats.complianceRate >= 70 ? 'text-yellow-600' : 'text-red-600'}`}>
                  {slaStats.complianceRate.toFixed(1)}%
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Total with SLA</p>
                <p className="text-2xl font-bold">{slaStats.totalWithSla}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">SLA Breached</p>
                <p className="text-2xl font-bold text-red-600">{slaStats.breached}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Avg Response Time</p>
                <p className="text-2xl font-bold">{slaStats.averageResponseTimeHours.toFixed(1)}h</p>
              </div>
            </div>
            {slaStats.byPriority && slaStats.byPriority.length > 0 && (
              <div className="mt-4 pt-4 border-t">
                <p className="text-sm font-medium mb-2">By Priority</p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {slaStats.byPriority.map((p) => (
                    <div key={p.priority} className="text-sm">
                      <Badge variant="outline" className="mb-1">{p.priority}</Badge>
                      <p className="text-muted-foreground">
                        {p.complianceRate.toFixed(0)}% ({p.total - p.breached}/{p.total})
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Disputes Table */}
      <Card>
        <CardHeader>
          <CardTitle>Open Disputes</CardTitle>
          <CardDescription>Disputes requiring attention</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Priority</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Appeal</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {disputes && disputes.length > 0 ? (
                disputes.map((dispute) => (
                  <TableRow key={dispute.id}>
                    <TableCell className="font-mono text-xs">{dispute.id.slice(0, 8)}...</TableCell>
                    <TableCell>
                      <Badge variant="outline">{getTypeLabel(dispute.type)}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={getPriorityColor(dispute.priority)}>{dispute.priority}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={getStatusColor(dispute.status)}>{dispute.status}</Badge>
                    </TableCell>
                    <TableCell>
                      {dispute.appealStatus && dispute.appealStatus !== AppealStatus.NONE ? (
                        <Badge
                          variant={
                            dispute.appealStatus === AppealStatus.PENDING ? 'default' :
                            dispute.appealStatus === AppealStatus.APPROVED ? 'outline' : 'secondary'
                          }
                        >
                          {dispute.appealStatus}
                        </Badge>
                      ) : (
                        <span className="text-muted-foreground text-sm">-</span>
                      )}
                    </TableCell>
                    <TableCell className="max-w-xs truncate">{dispute.description}</TableCell>
                    <TableCell>{new Date(dispute.createdAt).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        {/* Update Status */}
                        <Dialog
                          open={statusDialogOpen && selectedDisputeId === dispute.id}
                          onOpenChange={(open) => {
                            setStatusDialogOpen(open);
                            if (open) setSelectedDisputeId(dispute.id);
                          }}
                        >
                          <DialogTrigger asChild>
                            <Button variant="outline" size="sm" title="Update Status">
                              <MessageSquare className="h-4 w-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Update Dispute Status</DialogTitle>
                              <DialogDescription>
                                Update the status and add notes to this dispute
                              </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4">
                              <div>
                                <Label htmlFor="newStatus">Status *</Label>
                                <Select
                                  value={newStatus}
                                  onValueChange={(value: DisputeStatus) => setNewStatus(value)}
                                >
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select status" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value={DisputeStatus.OPEN}>Open</SelectItem>
                                    <SelectItem value={DisputeStatus.IN_PROGRESS}>
                                      In Progress
                                    </SelectItem>
                                    <SelectItem value={DisputeStatus.ESCALATED}>
                                      Escalated
                                    </SelectItem>
                                    <SelectItem value={DisputeStatus.RESOLVED}>Resolved</SelectItem>
                                    <SelectItem value={DisputeStatus.REJECTED}>Rejected</SelectItem>
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
                              <Button type="button" variant="outline" onClick={() => setStatusDialogOpen(false)}>
                                Cancel
                              </Button>
                              <Button
                                type="button"
                                onClick={handleUpdateStatus}
                                disabled={updateStatus.isPending}
                              >
                                {updateStatus.isPending ? 'Updating...' : 'Update Status'}
                              </Button>
                            </DialogFooter>
                          </DialogContent>
                        </Dialog>

                        {/* Escalate */}
                        <Dialog
                          open={escalateDialogOpen && selectedDisputeId === dispute.id}
                          onOpenChange={(open) => {
                            setEscalateDialogOpen(open);
                            if (open) setSelectedDisputeId(dispute.id);
                          }}
                        >
                          <DialogTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              title="Escalate"
                              disabled={dispute.status === DisputeStatus.ESCALATED}
                            >
                              <ArrowUpCircle className="h-4 w-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Escalate Dispute</DialogTitle>
                              <DialogDescription>
                                Escalate this dispute to higher priority
                              </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4">
                              <div>
                                <Label htmlFor="escalationReason">Reason for Escalation *</Label>
                                <Textarea
                                  id="escalationReason"
                                  value={escalationReason}
                                  onChange={(e) => setEscalationReason(e.target.value)}
                                  placeholder="Explain why this dispute needs escalation"
                                  rows={3}
                                />
                              </div>
                            </div>
                            <DialogFooter>
                              <Button
                                variant="outline"
                                onClick={() => setEscalateDialogOpen(false)}
                              >
                                Cancel
                              </Button>
                              <Button
                                variant="destructive"
                                onClick={handleEscalate}
                                disabled={!escalationReason || escalateDispute.isPending}
                              >
                                {escalateDispute.isPending ? 'Escalating...' : 'Escalate'}
                              </Button>
                            </DialogFooter>
                          </DialogContent>
                        </Dialog>

                        {/* Resolve */}
                        <Dialog
                          open={resolveDialogOpen && selectedDisputeId === dispute.id}
                          onOpenChange={(open) => {
                            setResolveDialogOpen(open);
                            if (open) setSelectedDisputeId(dispute.id);
                          }}
                        >
                          <DialogTrigger asChild>
                            <Button variant="outline" size="sm" title="Resolve">
                              <CheckCircle className="h-4 w-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Resolve Dispute</DialogTitle>
                              <DialogDescription>
                                Provide a resolution for this dispute
                              </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4">
                              <div>
                                <Label htmlFor="resolveStatus">Resolution Status *</Label>
                                <Select
                                  value={resolveStatus}
                                  onValueChange={(
                                    value: DisputeStatus.RESOLVED | DisputeStatus.REJECTED,
                                  ) => setResolveStatus(value)}
                                >
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select status" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value={DisputeStatus.RESOLVED}>Resolved</SelectItem>
                                    <SelectItem value={DisputeStatus.REJECTED}>Rejected</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                              <div>
                                <Label htmlFor="resolution">Resolution *</Label>
                                <Textarea
                                  id="resolution"
                                  value={resolution}
                                  onChange={(e) => setResolution(e.target.value)}
                                  placeholder="Describe how the dispute was resolved"
                                  rows={4}
                                />
                              </div>
                            </div>
                            <DialogFooter>
                              <Button type="button" variant="outline" onClick={() => setResolveDialogOpen(false)}>
                                Cancel
                              </Button>
                              <Button
                                type="button"
                                onClick={handleResolve}
                                disabled={!resolution || resolveDispute.isPending}
                              >
                                {resolveDispute.isPending ? 'Resolving...' : 'Resolve Dispute'}
                              </Button>
                            </DialogFooter>
                          </DialogContent>
                        </Dialog>

                        {/* Resolve Appeal - only show if there's a pending appeal */}
                        {dispute.appealStatus === AppealStatus.PENDING && (
                          <Dialog
                            open={appealDialogOpen && selectedDisputeId === dispute.id}
                            onOpenChange={(open) => {
                              setAppealDialogOpen(open);
                              if (open) setSelectedDisputeId(dispute.id);
                            }}
                          >
                            <DialogTrigger asChild>
                              <Button variant="outline" size="sm" title="Resolve Appeal" className="border-yellow-500">
                                <Scale className="h-4 w-4 text-yellow-600" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>Resolve Appeal</DialogTitle>
                                <DialogDescription>
                                  Review and resolve this user&apos;s appeal
                                </DialogDescription>
                              </DialogHeader>
                              {dispute.appealReason && (
                                <div className="rounded-lg border bg-muted/50 p-4">
                                  <p className="text-sm font-medium mb-1">Appeal Reason:</p>
                                  <p className="text-sm text-muted-foreground">{dispute.appealReason}</p>
                                </div>
                              )}
                              <div className="space-y-4">
                                <div>
                                  <Label htmlFor="appealDecision">Decision *</Label>
                                  <Select
                                    value={appealApproved ? 'approve' : 'reject'}
                                    onValueChange={(value) => setAppealApproved(value === 'approve')}
                                  >
                                    <SelectTrigger>
                                      <SelectValue placeholder="Select decision" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="approve">Approve (Reopen Dispute)</SelectItem>
                                      <SelectItem value="reject">Reject Appeal</SelectItem>
                                    </SelectContent>
                                  </Select>
                                </div>
                                <div>
                                  <Label htmlFor="appealResolution">Resolution Explanation *</Label>
                                  <Textarea
                                    id="appealResolution"
                                    value={appealResolution}
                                    onChange={(e) => setAppealResolution(e.target.value)}
                                    placeholder="Explain the decision to the user"
                                    rows={4}
                                  />
                                </div>
                              </div>
                              <DialogFooter>
                                <Button type="button" variant="outline" onClick={() => setAppealDialogOpen(false)}>
                                  Cancel
                                </Button>
                                <Button
                                  type="button"
                                  onClick={handleResolveAppeal}
                                  disabled={!appealResolution || appealResolution.length < 10 || resolveAppeal.isPending}
                                >
                                  {resolveAppeal.isPending ? 'Resolving...' : appealApproved ? 'Approve & Reopen' : 'Reject Appeal'}
                                </Button>
                              </DialogFooter>
                            </DialogContent>
                          </Dialog>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={8} className="text-center text-muted-foreground">
                    No open disputes found
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
