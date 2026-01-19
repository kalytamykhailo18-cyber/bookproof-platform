'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useAdminExceptions } from '@/hooks/useAdminExceptions';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
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
import { Clock, Users, XCircle, AlertCircle } from 'lucide-react';

export default function ExceptionsPage() {
  const t = useTranslations('adminExceptions');

  const {
    useExceptions,
    extendDeadline,
    reassignReader,
    bulkReassign,
    cancelAssignment,
    correctError,
  } = useAdminExceptions();

  const { data: exceptions, isLoading } = useExceptions();

  // Extend Deadline Dialog State
  const [extendDialogOpen, setExtendDialogOpen] = useState(false);
  const [selectedAssignmentId, setSelectedAssignmentId] = useState<string>('');
  const [extensionHours, setExtensionHours] = useState<number>(24);
  const [extendReason, setExtendReason] = useState('');
  const [extendNotes, setExtendNotes] = useState('');

  // Reassign Reader Dialog State
  const [reassignDialogOpen, setReassignDialogOpen] = useState(false);
  const [targetBookId, setTargetBookId] = useState('');
  const [reassignReason, setReassignReason] = useState('');
  const [reassignNotes, setReassignNotes] = useState('');

  // Bulk Reassign Dialog State
  const [bulkReassignDialogOpen, setBulkReassignDialogOpen] = useState(false);
  const [selectedAssignments, setSelectedAssignments] = useState<string[]>([]);
  const [bulkTargetBookId, setBulkTargetBookId] = useState('');
  const [bulkReassignReason, setBulkReassignReason] = useState('');

  // Cancel Assignment Dialog State
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [refundCredits, setRefundCredits] = useState(true);

  // Correct Error Dialog State
  const [correctErrorDialogOpen, setCorrectErrorDialogOpen] = useState(false);
  type ErrorType = 'WRONG_FORMAT' | 'WRONG_BOOK' | 'DUPLICATE' | 'MISSING_CREDITS' | 'OTHER';
  const [errorType, setErrorType] = useState<ErrorType | ''>('');
  const [correctionAction, setCorrectionAction] = useState('');
  const [correctionNotes, setCorrectionNotes] = useState('');

  const handleExtendDeadline = () => {
    extendDeadline.mutate(
      {
        assignmentId: selectedAssignmentId,
        data: {
          extensionHours,
          reason: extendReason,
          notes: extendNotes || undefined,
        },
      },
      {
        onSuccess: () => {
          setExtendDialogOpen(false);
          setExtensionHours(24);
          setExtendReason('');
          setExtendNotes('');
        },
      },
    );
  };

  const handleReassignReader = () => {
    reassignReader.mutate(
      {
        assignmentId: selectedAssignmentId,
        data: {
          targetBookId,
          reason: reassignReason,
          notes: reassignNotes || undefined,
        },
      },
      {
        onSuccess: () => {
          setReassignDialogOpen(false);
          setTargetBookId('');
          setReassignReason('');
          setReassignNotes('');
        },
      },
    );
  };

  const handleBulkReassign = () => {
    bulkReassign.mutate(
      {
        assignmentIds: selectedAssignments,
        targetBookId: bulkTargetBookId,
        reason: bulkReassignReason,
      },
      {
        onSuccess: () => {
          setBulkReassignDialogOpen(false);
          setSelectedAssignments([]);
          setBulkTargetBookId('');
          setBulkReassignReason('');
        },
      },
    );
  };

  const handleCancelAssignment = () => {
    cancelAssignment.mutate(
      {
        assignmentId: selectedAssignmentId,
        data: {
          reason: cancelReason,
          refundCredits,
        },
      },
      {
        onSuccess: () => {
          setCancelDialogOpen(false);
          setCancelReason('');
          setRefundCredits(true);
        },
      },
    );
  };

  const handleCorrectError = () => {
    if (!errorType) return; // Guard: errorType must be set
    correctError.mutate(
      {
        assignmentId: selectedAssignmentId,
        data: {
          errorType,
          correctionAction,
          description: errorType, // Using errorType as description
          notes: correctionNotes || undefined,
        },
      },
      {
        onSuccess: () => {
          setCorrectErrorDialogOpen(false);
          setErrorType('');
          setCorrectionAction('');
          setCorrectionNotes('');
        },
      },
    );
  };

  const toggleAssignmentSelection = (assignmentId: string) => {
    setSelectedAssignments((prev) =>
      prev.includes(assignmentId)
        ? prev.filter((id) => id !== assignmentId)
        : [...prev, assignmentId],
    );
  };

  if (isLoading) {
    return (
      <div className="container mx-auto space-y-6 p-6">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <Skeleton className="h-9 w-64 animate-pulse" />
            <Skeleton className="h-5 w-96 animate-pulse" />
          </div>
          <Skeleton className="h-10 w-40 animate-pulse" />
        </div>
        <Skeleton className="h-32 animate-pulse" />
        <Skeleton className="h-96 animate-pulse" />
      </div>
    );
  }

  return (
    <div className="container mx-auto space-y-6 p-6">
      {/* Header */}
      <div className="flex animate-fade-up items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">{t('title')}</h1>
          <p className="text-muted-foreground">{t('description')}</p>
        </div>
        <div className="flex gap-2">
          <Dialog open={bulkReassignDialogOpen} onOpenChange={setBulkReassignDialogOpen}>
            <DialogTrigger asChild>
              <Button type="button" variant="outline" disabled={selectedAssignments.length === 0}>
                <Users className="mr-2 h-4 w-4" />
                {t('actions.bulkReassign')} ({selectedAssignments.length})
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Bulk Reassign Assignments</DialogTitle>
                <DialogDescription>
                  Reassign {selectedAssignments.length} selected assignments to a different book
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="bulkTargetBookId">Target Book ID</Label>
                  <Input
                    id="bulkTargetBookId"
                    value={bulkTargetBookId}
                    onChange={(e) => setBulkTargetBookId(e.target.value)}
                    placeholder="Enter target book ID"
                  />
                </div>
                <div>
                  <Label htmlFor="bulkReassignReason">Reason *</Label>
                  <Textarea
                    id="bulkReassignReason"
                    value={bulkReassignReason}
                    onChange={(e) => setBulkReassignReason(e.target.value)}
                    placeholder="Explain why these assignments are being reassigned"
                    rows={3}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setBulkReassignDialogOpen(false)}>
                  Cancel
                </Button>
                <Button
                  onClick={handleBulkReassign}
                  disabled={!bulkTargetBookId || !bulkReassignReason || bulkReassign.isPending}
                >
                  {bulkReassign.isPending ? 'Reassigning...' : 'Bulk Reassign'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="animate-fade-up-fast">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('stats.overdue')}</CardTitle>
            <AlertCircle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {exceptions?.filter((e) => e.status === 'overdue').length || 0}
            </div>
          </CardContent>
        </Card>
        <Card className="animate-fade-up-light-slow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('stats.extended')}</CardTitle>
            <Clock className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {exceptions?.filter((e) => e.status === 'extended').length || 0}
            </div>
          </CardContent>
        </Card>
        <Card className="animate-fade-up-medium-slow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('stats.reassigned')}</CardTitle>
            <Users className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {exceptions?.filter((e) => e.status === 'reassigned').length || 0}
            </div>
          </CardContent>
        </Card>
        <Card className="animate-fade-up-heavy-slow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('stats.corrected')}</CardTitle>
            <XCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {exceptions?.filter((e) => e.status === 'corrected').length || 0}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Exceptions Table */}
      <Card className="animate-zoom-in">
        <CardHeader>
          <CardTitle>{t('table.title')}</CardTitle>
          <CardDescription>{t('table.description')}</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">
                  <input
                    type="checkbox"
                    checked={
                      selectedAssignments.length === exceptions?.length && exceptions?.length > 0
                    }
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedAssignments(exceptions?.map((ex) => ex.id) || []);
                      } else {
                        setSelectedAssignments([]);
                      }
                    }}
                  />
                </TableHead>
                <TableHead>Assignment ID</TableHead>
                <TableHead>Book Title</TableHead>
                <TableHead>Reader</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Reason</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {exceptions && exceptions.length > 0 ? (
                exceptions.map((exception) => (
                  <TableRow key={exception.id}>
                    <TableCell>
                      <input
                        type="checkbox"
                        checked={selectedAssignments.includes(exception.id)}
                        onChange={() => toggleAssignmentSelection(exception.id)}
                      />
                    </TableCell>
                    <TableCell className="font-mono text-xs">
                      {exception.id.slice(0, 8)}...
                    </TableCell>
                    <TableCell>{exception.bookTitle}</TableCell>
                    <TableCell>{exception.readerName}</TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          exception.status === 'overdue'
                            ? 'destructive'
                            : exception.status === 'extended'
                              ? 'default'
                              : 'secondary'
                        }
                      >
                        {exception.status}
                      </Badge>
                    </TableCell>
                    <TableCell>{exception.reason}</TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          exception.exceptionType === 'EXPIRED'
                            ? 'destructive'
                            : exception.exceptionType === 'REJECTED'
                              ? 'default'
                              : 'secondary'
                        }
                      >
                        {exception.exceptionType}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Dialog
                          open={extendDialogOpen && selectedAssignmentId === exception.id}
                          onOpenChange={(open) => {
                            setExtendDialogOpen(open);
                            if (open) setSelectedAssignmentId(exception.id);
                          }}
                        >
                          <DialogTrigger asChild>
                            <Button variant="outline" size="sm">
                              <Clock className="h-4 w-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Extend Deadline</DialogTitle>
                              <DialogDescription>
                                Extend the deadline for this assignment
                              </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4">
                              <div>
                                <Label htmlFor="extensionHours">Extension Hours *</Label>
                                <Input
                                  id="extensionHours"
                                  type="number"
                                  value={extensionHours}
                                  onChange={(e) => setExtensionHours(Number(e.target.value))}
                                  min={1}
                                  max={168}
                                />
                              </div>
                              <div>
                                <Label htmlFor="extendReason">Reason *</Label>
                                <Textarea
                                  id="extendReason"
                                  value={extendReason}
                                  onChange={(e) => setExtendReason(e.target.value)}
                                  placeholder="Explain why deadline is being extended"
                                  rows={3}
                                />
                              </div>
                              <div>
                                <Label htmlFor="extendNotes">Additional Notes</Label>
                                <Textarea
                                  id="extendNotes"
                                  value={extendNotes}
                                  onChange={(e) => setExtendNotes(e.target.value)}
                                  placeholder="Optional notes for audit trail"
                                  rows={2}
                                />
                              </div>
                            </div>
                            <DialogFooter>
                              <Button variant="outline" onClick={() => setExtendDialogOpen(false)}>
                                Cancel
                              </Button>
                              <Button
                                onClick={handleExtendDeadline}
                                disabled={!extendReason || extendDeadline.isPending}
                              >
                                {extendDeadline.isPending ? 'Extending...' : 'Extend Deadline'}
                              </Button>
                            </DialogFooter>
                          </DialogContent>
                        </Dialog>

                        <Dialog
                          open={reassignDialogOpen && selectedAssignmentId === exception.id}
                          onOpenChange={(open) => {
                            setReassignDialogOpen(open);
                            if (open) setSelectedAssignmentId(exception.id);
                          }}
                        >
                          <DialogTrigger asChild>
                            <Button variant="outline" size="sm">
                              <Users className="h-4 w-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Reassign Reader</DialogTitle>
                              <DialogDescription>
                                Reassign this reader to a different book
                              </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4">
                              <div>
                                <Label htmlFor="targetBookId">Target Book ID *</Label>
                                <Input
                                  id="targetBookId"
                                  value={targetBookId}
                                  onChange={(e) => setTargetBookId(e.target.value)}
                                  placeholder="Enter target book ID"
                                />
                              </div>
                              <div>
                                <Label htmlFor="reassignReason">Reason *</Label>
                                <Textarea
                                  id="reassignReason"
                                  value={reassignReason}
                                  onChange={(e) => setReassignReason(e.target.value)}
                                  placeholder="Explain why reader is being reassigned"
                                  rows={3}
                                />
                              </div>
                              <div>
                                <Label htmlFor="reassignNotes">Additional Notes</Label>
                                <Textarea
                                  id="reassignNotes"
                                  value={reassignNotes}
                                  onChange={(e) => setReassignNotes(e.target.value)}
                                  placeholder="Optional notes for audit trail"
                                  rows={2}
                                />
                              </div>
                            </div>
                            <DialogFooter>
                              <Button
                                variant="outline"
                                onClick={() => setReassignDialogOpen(false)}
                              >
                                Cancel
                              </Button>
                              <Button
                                onClick={handleReassignReader}
                                disabled={
                                  !targetBookId || !reassignReason || reassignReader.isPending
                                }
                              >
                                {reassignReader.isPending ? 'Reassigning...' : 'Reassign Reader'}
                              </Button>
                            </DialogFooter>
                          </DialogContent>
                        </Dialog>

                        <Dialog
                          open={cancelDialogOpen && selectedAssignmentId === exception.id}
                          onOpenChange={(open) => {
                            setCancelDialogOpen(open);
                            if (open) setSelectedAssignmentId(exception.id);
                          }}
                        >
                          <DialogTrigger asChild>
                            <Button variant="outline" size="sm">
                              <XCircle className="h-4 w-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Cancel Assignment</DialogTitle>
                              <DialogDescription>
                                Cancel this assignment and optionally refund credits
                              </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4">
                              <div>
                                <Label htmlFor="cancelReason">Reason *</Label>
                                <Textarea
                                  id="cancelReason"
                                  value={cancelReason}
                                  onChange={(e) => setCancelReason(e.target.value)}
                                  placeholder="Explain why assignment is being cancelled"
                                  rows={3}
                                />
                              </div>
                              <div className="flex items-center space-x-2">
                                <input
                                  type="checkbox"
                                  id="refundCredits"
                                  checked={refundCredits}
                                  onChange={(e) => setRefundCredits(e.target.checked)}
                                />
                                <Label htmlFor="refundCredits">Refund credits to author</Label>
                              </div>
                            </div>
                            <DialogFooter>
                              <Button variant="outline" onClick={() => setCancelDialogOpen(false)}>
                                Cancel
                              </Button>
                              <Button
                                variant="destructive"
                                onClick={handleCancelAssignment}
                                disabled={!cancelReason || cancelAssignment.isPending}
                              >
                                {cancelAssignment.isPending ? 'Cancelling...' : 'Cancel Assignment'}
                              </Button>
                            </DialogFooter>
                          </DialogContent>
                        </Dialog>

                        <Dialog
                          open={correctErrorDialogOpen && selectedAssignmentId === exception.id}
                          onOpenChange={(open) => {
                            setCorrectErrorDialogOpen(open);
                            if (open) setSelectedAssignmentId(exception.id);
                          }}
                        >
                          <DialogTrigger asChild>
                            <Button variant="outline" size="sm">
                              <AlertCircle className="h-4 w-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Correct Assignment Error</DialogTitle>
                              <DialogDescription>
                                Correct an error in this assignment
                              </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4">
                              <div>
                                <Label htmlFor="errorType">Error Type *</Label>
                                <Select
                                  value={errorType}
                                  onValueChange={(value: ErrorType) => setErrorType(value)}
                                >
                                  <SelectTrigger id="errorType">
                                    <SelectValue placeholder="Select error type" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="WRONG_FORMAT">Wrong Format</SelectItem>
                                    <SelectItem value="WRONG_BOOK">Wrong Book</SelectItem>
                                    <SelectItem value="DUPLICATE">Duplicate</SelectItem>
                                    <SelectItem value="MISSING_CREDITS">Missing Credits</SelectItem>
                                    <SelectItem value="OTHER">Other</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                              <div>
                                <Label htmlFor="correctionAction">Correction Action *</Label>
                                <Textarea
                                  id="correctionAction"
                                  value={correctionAction}
                                  onChange={(e) => setCorrectionAction(e.target.value)}
                                  placeholder="Describe what action was taken to correct the error"
                                  rows={3}
                                />
                              </div>
                              <div>
                                <Label htmlFor="correctionNotes">Additional Notes</Label>
                                <Textarea
                                  id="correctionNotes"
                                  value={correctionNotes}
                                  onChange={(e) => setCorrectionNotes(e.target.value)}
                                  placeholder="Optional notes for audit trail"
                                  rows={2}
                                />
                              </div>
                            </div>
                            <DialogFooter>
                              <Button
                                variant="outline"
                                onClick={() => setCorrectErrorDialogOpen(false)}
                              >
                                Cancel
                              </Button>
                              <Button
                                onClick={handleCorrectError}
                                disabled={!errorType || !correctionAction || correctError.isPending}
                              >
                                {correctError.isPending ? 'Correcting...' : 'Correct Error'}
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
                    No exceptions found
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
