import { useState, useEffect } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { disputesApi } from '@/lib/api/disputes';
import { toast } from 'sonner';
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
import { Plus, Scale, MessageSquare, HelpCircle, Loader2 } from 'lucide-react';
import { DisputeStatus, DisputeType, DisputePriority, AppealStatus } from '@/lib/api/disputes';

export function ReaderSupportPage() {
  const { user } = useAuthStore();
  const userId = user?.id || '';

  // Data state
  const [disputes, setDisputes] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreatingDispute, setIsCreatingDispute] = useState(false);
  const [isFilingAppeal, setIsFilingAppeal] = useState(false);

  // Fetch user disputes
  const fetchDisputes = async () => {
    if (!userId) {
      setIsLoading(false);
      return;
    }
    try {
      setIsLoading(true);
      const data = await disputesApi.getDisputesByUser(userId);
      setDisputes(data);
    } catch (err) {
      console.error('User disputes error:', err);
      toast.error('Failed to load disputes');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDisputes();
  }, [userId]);

  // Create Dispute Dialog
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [disputeType, setDisputeType] = useState<DisputeType>(DisputeType.READER_COMPLAINT);
  const [disputeDescription, setDisputeDescription] = useState('');

  // File Appeal Dialog
  const [appealDialogOpen, setAppealDialogOpen] = useState(false);
  const [selectedDisputeId, setSelectedDisputeId] = useState('');
  const [appealReason, setAppealReason] = useState('');

  const handleCreateDispute = async () => {
    try {
      setIsCreatingDispute(true);
      await disputesApi.createDispute({
        type: disputeType,
        description: disputeDescription,
        priority: DisputePriority.MEDIUM
      });
      toast.success('Dispute created successfully');
      setCreateDialogOpen(false);
      setDisputeType(DisputeType.READER_COMPLAINT);
      setDisputeDescription('');
      // Refetch disputes
      await fetchDisputes();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to create dispute');
    } finally {
      setIsCreatingDispute(false);
    }
  };

  const handleFileAppeal = async () => {
    try {
      setIsFilingAppeal(true);
      await disputesApi.fileAppeal(selectedDisputeId, { reason: appealReason });
      toast.success('Appeal filed successfully');
      setAppealDialogOpen(false);
      setAppealReason('');
      setSelectedDisputeId('');
      // Refetch disputes
      await fetchDisputes();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to file appeal');
    } finally {
      setIsFilingAppeal(false);
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

  const getAppealStatusColor = (status?: AppealStatus) => {
    switch (status) {
      case AppealStatus.PENDING:
        return 'default';
      case AppealStatus.APPROVED:
        return 'outline';
      case AppealStatus.REJECTED:
        return 'secondary';
      default:
        return 'secondary';
    }
  };

  const canFileAppeal = (dispute: { status: DisputeStatus; appealStatus?: AppealStatus }) => {
    // Can only appeal resolved or rejected disputes
    const isClosedDispute = dispute.status === DisputeStatus.RESOLVED || dispute.status === DisputeStatus.REJECTED;
    // Cannot appeal if already appealed
    const hasNotAppealed = !dispute.appealStatus || dispute.appealStatus === AppealStatus.NONE;
    return isClosedDispute && hasNotAppealed;
  };

  const getTypeLabel = (type: DisputeType) => {
    const labels: Record<DisputeType, string> = {
      [DisputeType.AUTHOR_DISPUTE]: 'Author Dispute',
      [DisputeType.AUTHOR_COMPLAINT]: 'Author Complaint',
      [DisputeType.READER_COMPLAINT]: 'General Complaint',
      [DisputeType.REVIEW_QUALITY]: 'Review Quality',
      [DisputeType.PAYMENT_ISSUE]: 'Payment Issue',
      [DisputeType.SERVICE_ISSUE]: 'Service Issue',
      [DisputeType.POLICY_VIOLATION]: 'Policy Violation',
      [DisputeType.OTHER]: 'Other' };
    return labels[type] || type;
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex h-64 items-center justify-center">
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto space-y-6 px-4 py-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Support</h1>
          <p className="text-muted-foreground">
            Get help with issues or disputes
          </p>
        </div>
        <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              New Support Request
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Support Request</DialogTitle>
              <DialogDescription>
                Describe your issue and our team will review it
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="disputeType">Issue Type *</Label>
                <Select
                  value={disputeType}
                  onValueChange={(value: DisputeType) => setDisputeType(value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select issue type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={DisputeType.READER_COMPLAINT}>General Complaint</SelectItem>
                    <SelectItem value={DisputeType.PAYMENT_ISSUE}>Payment Issue</SelectItem>
                    <SelectItem value={DisputeType.SERVICE_ISSUE}>Service Issue</SelectItem>
                    <SelectItem value={DisputeType.OTHER}>Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="disputeDescription">Description *</Label>
                <Textarea
                  id="disputeDescription"
                  value={disputeDescription}
                  onChange={(e) => setDisputeDescription(e.target.value)}
                  placeholder="Please describe your issue in detail (minimum 10 characters)"
                  rows={5}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  {disputeDescription.length}/2000 characters
                </p>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setCreateDialogOpen(false)}>
                Cancel
              </Button>
              <Button
                type="button"
                onClick={handleCreateDispute}
                disabled={disputeDescription.length < 10 || isCreatingDispute}
              >
                {isCreatingDispute ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Submit Request'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Help Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <HelpCircle className="h-5 w-5 text-muted-foreground" />
            <CardTitle>Need Help?</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground space-y-2">
          <p>Our support team typically responds within 24 hours (4 hours for critical issues).</p>
          <p>If your request has been resolved but you disagree with the outcome, you may file one appeal per issue.</p>
        </CardContent>
      </Card>

      {/* My Requests Table */}
      <Card>
        <CardHeader>
          <CardTitle>My Support Requests</CardTitle>
          <CardDescription>Track the status of your support requests</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Type</TableHead>
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
                      <Badge variant={getStatusColor(dispute.status)}>{dispute.status}</Badge>
                    </TableCell>
                    <TableCell>
                      {dispute.appealStatus && dispute.appealStatus !== AppealStatus.NONE ? (
                        <Badge variant={getAppealStatusColor(dispute.appealStatus)}>
                          {dispute.appealStatus}
                        </Badge>
                      ) : (
                        <span className="text-muted-foreground text-sm">-</span>
                      )}
                    </TableCell>
                    <TableCell className="max-w-xs truncate">{dispute.description}</TableCell>
                    <TableCell>{new Date(dispute.createdAt).toLocaleDateString()}</TableCell>
                    <TableCell>
                      {canFileAppeal(dispute) && (
                        <Dialog
                          open={appealDialogOpen && selectedDisputeId === dispute.id}
                          onOpenChange={(open) => {
                            setAppealDialogOpen(open);
                            if (open) setSelectedDisputeId(dispute.id);
                          }}
                        >
                          <DialogTrigger asChild>
                            <Button variant="outline" size="sm" title="File Appeal">
                              <Scale className="h-4 w-4 mr-1" />
                              Appeal
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>File an Appeal</DialogTitle>
                              <DialogDescription>
                                You may file one appeal per issue. Please explain why you believe the resolution was incorrect.
                              </DialogDescription>
                            </DialogHeader>
                            {dispute.resolution && (
                              <div className="rounded-lg border bg-muted/50 p-4">
                                <p className="text-sm font-medium mb-1">Original Resolution:</p>
                                <p className="text-sm text-muted-foreground">{dispute.resolution}</p>
                              </div>
                            )}
                            <div className="space-y-4">
                              <div>
                                <Label htmlFor="appealReason">Appeal Reason *</Label>
                                <Textarea
                                  id="appealReason"
                                  value={appealReason}
                                  onChange={(e) => setAppealReason(e.target.value)}
                                  placeholder="Explain why you believe the resolution was unfair or incorrect (minimum 20 characters)"
                                  rows={5}
                                />
                                <p className="text-xs text-muted-foreground mt-1">
                                  {appealReason.length}/2000 characters (minimum 20)
                                </p>
                              </div>
                            </div>
                            <DialogFooter>
                              <Button type="button" variant="outline" onClick={() => setAppealDialogOpen(false)}>
                                Cancel
                              </Button>
                              <Button
                                type="button"
                                onClick={handleFileAppeal}
                                disabled={appealReason.length < 20 || isFilingAppeal}
                              >
                                {isFilingAppeal ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Submit Appeal'}
                              </Button>
                            </DialogFooter>
                          </DialogContent>
                        </Dialog>
                      )}
                      {dispute.resolution && !canFileAppeal(dispute) && (
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="ghost" size="sm" title="View Resolution">
                              <MessageSquare className="h-4 w-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Resolution Details</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4">
                              <div>
                                <p className="text-sm font-medium">Resolution:</p>
                                <p className="text-sm text-muted-foreground">{dispute.resolution}</p>
                              </div>
                              {dispute.appealStatus && dispute.appealStatus !== AppealStatus.NONE && (
                                <>
                                  <div>
                                    <p className="text-sm font-medium">Appeal Status:</p>
                                    <Badge variant={getAppealStatusColor(dispute.appealStatus)}>
                                      {dispute.appealStatus}
                                    </Badge>
                                  </div>
                                  {dispute.appealResolution && (
                                    <div>
                                      <p className="text-sm font-medium">Appeal Resolution:</p>
                                      <p className="text-sm text-muted-foreground">{dispute.appealResolution}</p>
                                    </div>
                                  )}
                                </>
                              )}
                            </div>
                          </DialogContent>
                        </Dialog>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-muted-foreground">
                    No support requests found
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
