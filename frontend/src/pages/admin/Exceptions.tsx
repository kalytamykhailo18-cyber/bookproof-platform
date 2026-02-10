import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { adminExceptionsApi, AssignmentExceptionDto } from '@/lib/api/admin-exceptions';
import { toast } from 'sonner';
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
import { Clock, Users, XCircle, AlertCircle } from 'lucide-react';

export function ExceptionsPage() {
  const { t, i18n } = useTranslation('adminExceptions');

  // Data state
  const [exceptions, setExceptions] = useState<AssignmentExceptionDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Mutation loading states
  const [isExtending, setIsExtending] = useState(false);
  const [isReassigning, setIsReassigning] = useState(false);
  const [isBulkReassigning, setIsBulkReassigning] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);
  const [isCorrecting, setIsCorrecting] = useState(false);

  // Fetch exceptions
  useEffect(() => {
    const fetchExceptions = async () => {
      try {
        setIsLoading(true);
        const data = await adminExceptionsApi.getExceptions();
        setExceptions(data);
      } catch (err) {
        console.error('Exceptions error:', err);
        toast.error(t('errors.loadFailed'));
      } finally {
        setIsLoading(false);
      }
    };
    fetchExceptions();
  }, []);

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

  const handleExtendDeadline = async () => {
    try {
      setIsExtending(true);
      await adminExceptionsApi.extendDeadline(selectedAssignmentId, {
        extensionHours,
        reason: extendReason,
        notes: extendNotes || undefined
      });

      // Refetch exceptions
      const data = await adminExceptionsApi.getExceptions();
      setExceptions(data);

      toast.success(t('dialogs.extendDeadline.success'));

      // Reset form
      setExtendDialogOpen(false);
      setExtensionHours(24);
      setExtendReason('');
      setExtendNotes('');
    } catch (error: any) {
      console.error('Extend deadline error:', error);
      toast.error(error.response?.data?.message || t('dialogs.extendDeadline.error'));
    } finally {
      setIsExtending(false);
    }
  };

  const handleReassignReader = async () => {
    try {
      setIsReassigning(true);
      await adminExceptionsApi.reassignReader(selectedAssignmentId, {
        targetBookId,
        reason: reassignReason,
        notes: reassignNotes || undefined
      });

      // Refetch exceptions
      const data = await adminExceptionsApi.getExceptions();
      setExceptions(data);

      toast.success(t('dialogs.reassignReader.success'));

      // Reset form
      setReassignDialogOpen(false);
      setTargetBookId('');
      setReassignReason('');
      setReassignNotes('');
    } catch (error: any) {
      console.error('Reassign reader error:', error);
      toast.error(error.response?.data?.message || t('dialogs.reassignReader.error'));
    } finally {
      setIsReassigning(false);
    }
  };

  const handleBulkReassign = async () => {
    try {
      setIsBulkReassigning(true);
      await adminExceptionsApi.bulkReassign({
        assignmentIds: selectedAssignments,
        targetBookId: bulkTargetBookId,
        reason: bulkReassignReason
      });

      // Refetch exceptions
      const data = await adminExceptionsApi.getExceptions();
      setExceptions(data);

      toast.success(t('dialogs.bulkReassign.success'));

      // Reset form
      setBulkReassignDialogOpen(false);
      setSelectedAssignments([]);
      setBulkTargetBookId('');
      setBulkReassignReason('');
    } catch (error: any) {
      console.error('Bulk reassign error:', error);
      toast.error(error.response?.data?.message || t('dialogs.bulkReassign.error'));
    } finally {
      setIsBulkReassigning(false);
    }
  };

  const handleCancelAssignment = async () => {
    try {
      setIsCancelling(true);
      await adminExceptionsApi.cancelAssignment(selectedAssignmentId, {
        reason: cancelReason,
        refundCredits
      });

      // Refetch exceptions
      const data = await adminExceptionsApi.getExceptions();
      setExceptions(data);

      toast.success(t('dialogs.cancelAssignment.success'));

      // Reset form
      setCancelDialogOpen(false);
      setCancelReason('');
      setRefundCredits(true);
    } catch (error: any) {
      console.error('Cancel assignment error:', error);
      toast.error(error.response?.data?.message || t('dialogs.cancelAssignment.error'));
    } finally {
      setIsCancelling(false);
    }
  };

  const handleCorrectError = async () => {
    if (!errorType) return; // Guard: errorType must be set

    try {
      setIsCorrecting(true);
      await adminExceptionsApi.correctError(selectedAssignmentId, {
        errorType,
        correctionAction,
        description: errorType, // Using errorType as description
        notes: correctionNotes || undefined
      });

      // Refetch exceptions
      const data = await adminExceptionsApi.getExceptions();
      setExceptions(data);

      toast.success(t('dialogs.correctError.success'));

      // Reset form
      setCorrectErrorDialogOpen(false);
      setErrorType('');
      setCorrectionAction('');
      setCorrectionNotes('');
    } catch (error: any) {
      console.error('Correct error error:', error);
      toast.error(error.response?.data?.message || t('dialogs.correctError.error'));
    } finally {
      setIsCorrecting(false);
    }
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
                <DialogTitle>{t('dialogs.bulkReassign.title')}</DialogTitle>
                <DialogDescription>
                  {t('dialogs.bulkReassign.description', { count: selectedAssignments.length })}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="bulkTargetBookId">{t('dialogs.bulkReassign.targetBookIdLabel')}</Label>
                  <Input
                    id="bulkTargetBookId"
                    value={bulkTargetBookId}
                    onChange={(e) => setBulkTargetBookId(e.target.value)}
                    placeholder={t('dialogs.bulkReassign.targetBookIdPlaceholder')}
                  />
                </div>
                <div>
                  <Label htmlFor="bulkReassignReason">{t('dialogs.bulkReassign.reasonLabel')}</Label>
                  <Textarea
                    id="bulkReassignReason"
                    value={bulkReassignReason}
                    onChange={(e) => setBulkReassignReason(e.target.value)}
                    placeholder={t('dialogs.bulkReassign.reasonPlaceholder')}
                    rows={3}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setBulkReassignDialogOpen(false)}>
                  {t('dialogs.bulkReassign.cancel')}
                </Button>
                <Button
                  type="button"
                  onClick={handleBulkReassign}
                  disabled={!bulkTargetBookId || !bulkReassignReason || isBulkReassigning}
                >
                  {isBulkReassigning ? t('dialogs.bulkReassign.confirming') : t('dialogs.bulkReassign.confirm')}
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
                <TableHead>{t('table.assignmentId')}</TableHead>
                <TableHead>{t('table.bookTitle')}</TableHead>
                <TableHead>{t('table.reader')}</TableHead>
                <TableHead>{t('table.status')}</TableHead>
                <TableHead>{t('table.reason')}</TableHead>
                <TableHead>{t('table.type')}</TableHead>
                <TableHead>{t('table.actions')}</TableHead>
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
                              <DialogTitle>{t('dialogs.extendDeadline.title')}</DialogTitle>
                              <DialogDescription>
                                {t('dialogs.extendDeadline.description')}
                              </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4">
                              <div>
                                <Label htmlFor="extensionHours">{t('dialogs.extendDeadline.hoursLabel')}</Label>
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
                                <Label htmlFor="extendReason">{t('dialogs.extendDeadline.reasonLabel')}</Label>
                                <Textarea
                                  id="extendReason"
                                  value={extendReason}
                                  onChange={(e) => setExtendReason(e.target.value)}
                                  placeholder={t('dialogs.extendDeadline.reasonPlaceholder')}
                                  rows={3}
                                />
                              </div>
                              <div>
                                <Label htmlFor="extendNotes">{t('dialogs.extendDeadline.notesLabel')}</Label>
                                <Textarea
                                  id="extendNotes"
                                  value={extendNotes}
                                  onChange={(e) => setExtendNotes(e.target.value)}
                                  placeholder={t('dialogs.extendDeadline.notesPlaceholder')}
                                  rows={2}
                                />
                              </div>
                            </div>
                            <DialogFooter>
                              <Button type="button" variant="outline" onClick={() => setExtendDialogOpen(false)}>
                                {t('dialogs.extendDeadline.cancel')}
                              </Button>
                              <Button
                                type="button"
                                onClick={handleExtendDeadline}
                                disabled={!extendReason || isExtending}
                              >
                                {isExtending ? t('dialogs.extendDeadline.confirming') : t('dialogs.extendDeadline.confirm')}
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
                              <DialogTitle>{t('dialogs.reassignReader.title')}</DialogTitle>
                              <DialogDescription>
                                {t('dialogs.reassignReader.description')}
                              </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4">
                              <div>
                                <Label htmlFor="targetBookId">{t('dialogs.reassignReader.targetBookIdLabel')}</Label>
                                <Input
                                  id="targetBookId"
                                  value={targetBookId}
                                  onChange={(e) => setTargetBookId(e.target.value)}
                                  placeholder={t('dialogs.reassignReader.targetBookIdPlaceholder')}
                                />
                              </div>
                              <div>
                                <Label htmlFor="reassignReason">{t('dialogs.reassignReader.reasonLabel')}</Label>
                                <Textarea
                                  id="reassignReason"
                                  value={reassignReason}
                                  onChange={(e) => setReassignReason(e.target.value)}
                                  placeholder={t('dialogs.reassignReader.reasonPlaceholder')}
                                  rows={3}
                                />
                              </div>
                              <div>
                                <Label htmlFor="reassignNotes">{t('dialogs.reassignReader.notesLabel')}</Label>
                                <Textarea
                                  id="reassignNotes"
                                  value={reassignNotes}
                                  onChange={(e) => setReassignNotes(e.target.value)}
                                  placeholder={t('dialogs.reassignReader.notesPlaceholder')}
                                  rows={2}
                                />
                              </div>
                            </div>
                            <DialogFooter>
                              <Button
                                variant="outline"
                                onClick={() => setReassignDialogOpen(false)}
                              >
                                {t('dialogs.reassignReader.cancel')}
                              </Button>
                              <Button
                                onClick={handleReassignReader}
                                disabled={
                                  !targetBookId || !reassignReason || isReassigning
                                }
                              >
                                {isReassigning ? t('dialogs.reassignReader.confirming') : t('dialogs.reassignReader.confirm')}
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
                              <DialogTitle>{t('dialogs.cancelAssignment.title')}</DialogTitle>
                              <DialogDescription>
                                {t('dialogs.cancelAssignment.description')}
                              </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4">
                              <div>
                                <Label htmlFor="cancelReason">{t('dialogs.cancelAssignment.reasonLabel')}</Label>
                                <Textarea
                                  id="cancelReason"
                                  value={cancelReason}
                                  onChange={(e) => setCancelReason(e.target.value)}
                                  placeholder={t('dialogs.cancelAssignment.reasonPlaceholder')}
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
                                <Label htmlFor="refundCredits">{t('dialogs.cancelAssignment.refundLabel')}</Label>
                              </div>
                            </div>
                            <DialogFooter>
                              <Button type="button" variant="outline" onClick={() => setCancelDialogOpen(false)}>
                                {t('dialogs.cancelAssignment.cancel')}
                              </Button>
                              <Button
                                type="button"
                                variant="destructive"
                                onClick={handleCancelAssignment}
                                disabled={!cancelReason || isCancelling}
                              >
                                {isCancelling ? t('dialogs.cancelAssignment.confirming') : t('dialogs.cancelAssignment.confirm')}
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
                              <DialogTitle>{t('dialogs.correctError.title')}</DialogTitle>
                              <DialogDescription>
                                {t('dialogs.correctError.description')}
                              </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4">
                              <div>
                                <Label htmlFor="errorType">{t('dialogs.correctError.errorTypeLabel')}</Label>
                                <Select
                                  value={errorType}
                                  onValueChange={(value: ErrorType) => setErrorType(value)}
                                >
                                  <SelectTrigger id="errorType">
                                    <SelectValue placeholder={t('dialogs.correctError.errorTypePlaceholder')} />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="WRONG_FORMAT">{t('errorTypes.WRONG_FORMAT')}</SelectItem>
                                    <SelectItem value="WRONG_BOOK">{t('errorTypes.WRONG_BOOK')}</SelectItem>
                                    <SelectItem value="DUPLICATE">{t('errorTypes.DUPLICATE')}</SelectItem>
                                    <SelectItem value="MISSING_CREDITS">{t('errorTypes.MISSING_CREDITS')}</SelectItem>
                                    <SelectItem value="OTHER">{t('errorTypes.OTHER')}</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                              <div>
                                <Label htmlFor="correctionAction">{t('dialogs.correctError.correctionActionLabel')}</Label>
                                <Textarea
                                  id="correctionAction"
                                  value={correctionAction}
                                  onChange={(e) => setCorrectionAction(e.target.value)}
                                  placeholder={t('dialogs.correctError.correctionActionPlaceholder')}
                                  rows={3}
                                />
                              </div>
                              <div>
                                <Label htmlFor="correctionNotes">{t('dialogs.correctError.notesLabel')}</Label>
                                <Textarea
                                  id="correctionNotes"
                                  value={correctionNotes}
                                  onChange={(e) => setCorrectionNotes(e.target.value)}
                                  placeholder={t('dialogs.correctError.notesPlaceholder')}
                                  rows={2}
                                />
                              </div>
                            </div>
                            <DialogFooter>
                              <Button
                                variant="outline"
                                onClick={() => setCorrectErrorDialogOpen(false)}
                              >
                                {t('dialogs.correctError.cancel')}
                              </Button>
                              <Button
                                onClick={handleCorrectError}
                                disabled={!errorType || !correctionAction || isCorrecting}
                              >
                                {isCorrecting ? t('dialogs.correctError.confirming') : t('dialogs.correctError.confirm')}
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
                    {t('table.noData')}
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
