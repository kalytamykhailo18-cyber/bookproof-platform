'use client';

import { useState } from 'react';
import {
  useOpenDisputes,
  useDisputeStats,
  useResolveDispute,
  useEscalateDispute,
  useUpdateDisputeStatus,
} from '@/hooks/useDisputes';
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
import { CheckCircle, ArrowUpCircle, MessageSquare } from 'lucide-react';
import { DisputeStatus, DisputeType, DisputePriority } from '@/lib/api/disputes';

export default function DisputesPage() {
  const { data: disputes, isLoading } = useOpenDisputes();
  const { data: stats } = useDisputeStats();
  const resolveDispute = useResolveDispute();
  const escalateDispute = useEscalateDispute();
  const updateStatus = useUpdateDisputeStatus();

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

  const handleResolve = () => {
    resolveDispute.mutate(
      {
        disputeId: selectedDisputeId,
        data: {
          resolution,
          status: resolveStatus,
        },
      },
      {
        onSuccess: () => {
          setResolveDialogOpen(false);
          setResolution('');
          setResolveStatus(DisputeStatus.RESOLVED as DisputeStatus.RESOLVED);
        },
      },
    );
  };

  const handleEscalate = () => {
    escalateDispute.mutate(
      {
        disputeId: selectedDisputeId,
        data: {
          reason: escalationReason,
        },
      },
      {
        onSuccess: () => {
          setEscalateDialogOpen(false);
          setEscalationReason('');
        },
      },
    );
  };

  const handleUpdateStatus = () => {
    updateStatus.mutate(
      {
        disputeId: selectedDisputeId,
        data: {
          status: newStatus,
          adminNotes: adminNotes || undefined,
        },
      },
      {
        onSuccess: () => {
          setStatusDialogOpen(false);
          setNewStatus(DisputeStatus.IN_PROGRESS);
          setAdminNotes('');
        },
      },
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
                              <Button variant="outline" onClick={() => setResolveDialogOpen(false)}>
                                Cancel
                              </Button>
                              <Button
                                onClick={handleResolve}
                                disabled={!resolution || resolveDispute.isPending}
                              >
                                {resolveDispute.isPending ? 'Resolving...' : 'Resolve Dispute'}
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
                  <TableCell colSpan={7} className="text-center text-muted-foreground">
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
