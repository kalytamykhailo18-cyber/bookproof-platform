import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
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

export function AuthorSupportPage() {
  const { t } = useTranslation('support');
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
      toast.error(t('messages.loadError'));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDisputes();
  }, [userId]);

  // Create Dispute Dialog
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [disputeType, setDisputeType] = useState<DisputeType>(DisputeType.AUTHOR_COMPLAINT);
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
      toast.success(t('messages.createSuccess'));
      setCreateDialogOpen(false);
      setDisputeType(DisputeType.AUTHOR_COMPLAINT);
      setDisputeDescription('');
      // Refetch disputes
      await fetchDisputes();
    } catch (error: any) {
      toast.error(error.response?.data?.message || t('messages.createError'));
    } finally {
      setIsCreatingDispute(false);
    }
  };

  const handleFileAppeal = async () => {
    try {
      setIsFilingAppeal(true);
      await disputesApi.fileAppeal(selectedDisputeId, { reason: appealReason });
      toast.success(t('messages.appealSuccess'));
      setAppealDialogOpen(false);
      setAppealReason('');
      setSelectedDisputeId('');
      // Refetch disputes
      await fetchDisputes();
    } catch (error: any) {
      toast.error(error.response?.data?.message || t('messages.appealError'));
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
      [DisputeType.AUTHOR_DISPUTE]: t('issueTypes.campaignIssue'),
      [DisputeType.AUTHOR_COMPLAINT]: t('issueTypes.generalComplaint'),
      [DisputeType.READER_COMPLAINT]: t('issueTypes.generalComplaint'),
      [DisputeType.REVIEW_QUALITY]: t('issueTypes.reviewQuality'),
      [DisputeType.PAYMENT_ISSUE]: t('issueTypes.paymentIssue'),
      [DisputeType.SERVICE_ISSUE]: t('issueTypes.serviceIssue'),
      [DisputeType.POLICY_VIOLATION]: t('issueTypes.other'),
      [DisputeType.OTHER]: t('issueTypes.other') };
    return labels[type] || type;
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
          <p className="text-muted-foreground">
            {t('subtitle')}
          </p>
        </div>
        <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              {t('newRequest')}
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{t('createDialog.title')}</DialogTitle>
              <DialogDescription>
                {t('createDialog.description')}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="disputeType">{t('createDialog.issueTypeLabel')}</Label>
                <Select
                  value={disputeType}
                  onValueChange={(value: DisputeType) => setDisputeType(value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={t('createDialog.issueTypePlaceholder')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={DisputeType.AUTHOR_COMPLAINT}>{t('issueTypes.generalComplaint')}</SelectItem>
                    <SelectItem value={DisputeType.AUTHOR_DISPUTE}>{t('issueTypes.campaignIssue')}</SelectItem>
                    <SelectItem value={DisputeType.REVIEW_QUALITY}>{t('issueTypes.reviewQuality')}</SelectItem>
                    <SelectItem value={DisputeType.PAYMENT_ISSUE}>{t('issueTypes.paymentIssue')}</SelectItem>
                    <SelectItem value={DisputeType.SERVICE_ISSUE}>{t('issueTypes.serviceIssue')}</SelectItem>
                    <SelectItem value={DisputeType.OTHER}>{t('issueTypes.other')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="disputeDescription">{t('createDialog.descriptionLabel')}</Label>
                <Textarea
                  id="disputeDescription"
                  value={disputeDescription}
                  onChange={(e) => setDisputeDescription(e.target.value)}
                  placeholder={t('createDialog.descriptionPlaceholder')}
                  rows={5}
                />
                <div className="flex items-center justify-between mt-1">
                  <p className={`text-xs ${
                    disputeDescription.length < 10
                      ? 'text-orange-600 dark:text-orange-400 font-medium'
                      : 'text-green-600 dark:text-green-400'
                  }`}>
                    {disputeDescription.length < 10
                      ? t('createDialog.charactersNeeded', { count: 10 - disputeDescription.length })
                      : t('createDialog.minimumReached')}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {t('createDialog.characterCount', { current: disputeDescription.length, max: 2000 })}
                  </p>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setCreateDialogOpen(false)}>
                {t('createDialog.cancel')}
              </Button>
              <Button
                type="button"
                onClick={handleCreateDispute}
                disabled={disputeDescription.length < 10 || isCreatingDispute}
              >
                {isCreatingDispute ? <Loader2 className="h-4 w-4 animate-spin" /> : t('createDialog.submit')}
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
            <CardTitle>{t('helpCard.title')}</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground space-y-2">
          <p>{t('helpCard.responseTime')}</p>
          <p>{t('helpCard.appealInfo')}</p>
        </CardContent>
      </Card>

      {/* My Requests Table */}
      <Card>
        <CardHeader>
          <CardTitle>{t('requestsTable.title')}</CardTitle>
          <CardDescription>{t('requestsTable.description')}</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t('requestsTable.headers.id')}</TableHead>
                <TableHead>{t('requestsTable.headers.type')}</TableHead>
                <TableHead>{t('requestsTable.headers.status')}</TableHead>
                <TableHead>{t('requestsTable.headers.appeal')}</TableHead>
                <TableHead>{t('requestsTable.headers.description')}</TableHead>
                <TableHead>{t('requestsTable.headers.created')}</TableHead>
                <TableHead>{t('requestsTable.headers.actions')}</TableHead>
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
                            <Button variant="outline" size="sm" title={t('requestsTable.appealButton')}>
                              <Scale className="h-4 w-4 mr-1" />
                              {t('requestsTable.appealButton')}
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>{t('appealDialog.title')}</DialogTitle>
                              <DialogDescription>
                                {t('appealDialog.description')}
                              </DialogDescription>
                            </DialogHeader>
                            {dispute.resolution && (
                              <div className="rounded-lg border bg-muted/50 p-4">
                                <p className="text-sm font-medium mb-1">{t('appealDialog.originalResolution')}</p>
                                <p className="text-sm text-muted-foreground">{dispute.resolution}</p>
                              </div>
                            )}
                            <div className="space-y-4">
                              <div>
                                <Label htmlFor="appealReason">{t('appealDialog.reasonLabel')}</Label>
                                <Textarea
                                  id="appealReason"
                                  value={appealReason}
                                  onChange={(e) => setAppealReason(e.target.value)}
                                  placeholder={t('appealDialog.reasonPlaceholder')}
                                  rows={5}
                                />
                                <p className="text-xs text-muted-foreground mt-1">
                                  {t('appealDialog.characterCount', { current: appealReason.length, max: 2000, min: 20 })}
                                </p>
                              </div>
                            </div>
                            <DialogFooter>
                              <Button type="button" variant="outline" onClick={() => setAppealDialogOpen(false)}>
                                {t('appealDialog.cancel')}
                              </Button>
                              <Button
                                type="button"
                                onClick={handleFileAppeal}
                                disabled={appealReason.length < 20 || isFilingAppeal}
                              >
                                {isFilingAppeal ? <Loader2 className="h-4 w-4 animate-spin" /> : t('appealDialog.submit')}
                              </Button>
                            </DialogFooter>
                          </DialogContent>
                        </Dialog>
                      )}
                      {dispute.resolution && !canFileAppeal(dispute) && (
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="ghost" size="sm" title={t('requestsTable.viewResolutionButton')}>
                              <MessageSquare className="h-4 w-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>{t('resolutionDialog.title')}</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4">
                              <div>
                                <p className="text-sm font-medium">{t('resolutionDialog.resolutionLabel')}</p>
                                <p className="text-sm text-muted-foreground">{dispute.resolution}</p>
                              </div>
                              {dispute.appealStatus && dispute.appealStatus !== AppealStatus.NONE && (
                                <>
                                  <div>
                                    <p className="text-sm font-medium">{t('resolutionDialog.appealStatusLabel')}</p>
                                    <Badge variant={getAppealStatusColor(dispute.appealStatus)}>
                                      {dispute.appealStatus}
                                    </Badge>
                                  </div>
                                  {dispute.appealResolution && (
                                    <div>
                                      <p className="text-sm font-medium">{t('resolutionDialog.appealResolutionLabel')}</p>
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
                    {t('requestsTable.noRequests')}
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
