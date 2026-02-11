import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
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
import { CheckCircle, ArrowUpCircle, MessageSquare, Scale, Clock, AlertTriangle } from 'lucide-react';
import { DisputeStatus, DisputeType, DisputePriority, AppealStatus } from '@/lib/api/disputes';

export function DisputesPage() {
  const { t } = useTranslation('adminDisputes');

  // Data state
  const [disputes, setDisputes] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState<any>(null);
  const [slaStats, setSlaStats] = useState<any>(null);

  // Mutation loading states
  const [isResolvingDispute, setIsResolvingDispute] = useState(false);
  const [isEscalatingDispute, setIsEscalatingDispute] = useState(false);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [isResolvingAppeal, setIsResolvingAppeal] = useState(false);

  // Fetch data
  const fetchDisputes = async () => {
    try {
      setIsLoading(true);
      const data = await disputesApi.getOpenDisputes();
      setDisputes(data);
    } catch (err) {
      console.error('Disputes error:', err);
      toast.error(t('messages.loadError'));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDisputes();
  }, []);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await disputesApi.getDisputeStats();
        setStats(data);
      } catch (err) {
        console.error('Dispute stats error:', err);
      }
    };
    fetchStats();
  }, []);

  useEffect(() => {
    const fetchSlaStats = async () => {
      try {
        const data = await disputesApi.getSlaStats();
        setSlaStats(data);
      } catch (err) {
        console.error('SLA stats error:', err);
      }
    };
    fetchSlaStats();
  }, []);

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

  const handleResolve = async () => {
    try {
      setIsResolvingDispute(true);
      await disputesApi.resolveDispute(selectedDisputeId, {
        resolution,
        status: resolveStatus
      });
      toast.success(t('messages.resolveSuccess'));
      setResolveDialogOpen(false);
      setResolution('');
      setResolveStatus(DisputeStatus.RESOLVED as DisputeStatus.RESOLVED);
      // Refetch data
      await fetchDisputes();
      const statsData = await disputesApi.getDisputeStats();
      setStats(statsData);
    } catch (error: any) {
      toast.error(error.response?.data?.message || t('messages.resolveError'));
    } finally {
      setIsResolvingDispute(false);
    }
  };

  const handleEscalate = async () => {
    try {
      setIsEscalatingDispute(true);
      await disputesApi.escalateDispute(selectedDisputeId, {
        reason: escalationReason
      });
      toast.success(t('messages.escalateSuccess'));
      setEscalateDialogOpen(false);
      setEscalationReason('');
      // Refetch data
      await fetchDisputes();
      const statsData = await disputesApi.getDisputeStats();
      setStats(statsData);
    } catch (error: any) {
      toast.error(error.response?.data?.message || t('messages.escalateError'));
    } finally {
      setIsEscalatingDispute(false);
    }
  };

  const handleUpdateStatus = async () => {
    try {
      setIsUpdatingStatus(true);
      await disputesApi.updateDisputeStatus(selectedDisputeId, {
        status: newStatus,
        adminNotes: adminNotes || undefined
      });
      toast.success(t('messages.updateSuccess'));
      setStatusDialogOpen(false);
      setNewStatus(DisputeStatus.IN_PROGRESS);
      setAdminNotes('');
      // Refetch data
      await fetchDisputes();
      const statsData = await disputesApi.getDisputeStats();
      setStats(statsData);
    } catch (error: any) {
      toast.error(error.response?.data?.message || t('messages.updateError'));
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const handleResolveAppeal = async () => {
    try {
      setIsResolvingAppeal(true);
      await disputesApi.resolveAppeal(selectedDisputeId, {
        approved: appealApproved,
        resolution: appealResolution
      });
      toast.success(t('messages.appealSuccess'));
      setAppealDialogOpen(false);
      setAppealApproved(true);
      setAppealResolution('');
      // Refetch data
      await fetchDisputes();
      const statsData = await disputesApi.getDisputeStats();
      setStats(statsData);
    } catch (error: any) {
      toast.error(error.response?.data?.message || t('messages.appealError'));
    } finally {
      setIsResolvingAppeal(false);
    }
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
    return t(`types.${type}`, { defaultValue: type });
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
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-5">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>{t('stats.total')}</CardDescription>
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
            <CardDescription>{t('stats.escalated')}</CardDescription>
            <CardTitle className="text-2xl text-red-600">{stats?.escalated || 0}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>{t('stats.resolved')}</CardDescription>
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
              <CardTitle>{t('sla.title')}</CardTitle>
            </div>
            <CardDescription>{t('sla.subtitle')}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">{t('sla.complianceRate')}</p>
                <p className={`text-2xl font-bold ${slaStats.complianceRate >= 90 ? 'text-green-600' : slaStats.complianceRate >= 70 ? 'text-yellow-600' : 'text-red-600'}`}>
                  {slaStats.complianceRate.toFixed(1)}%
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">{t('sla.totalWithSla')}</p>
                <p className="text-2xl font-bold">{slaStats.totalWithSla}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">{t('sla.slaBreached')}</p>
                <p className="text-2xl font-bold text-red-600">{slaStats.breached}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">{t('sla.avgResponseTime')}</p>
                <p className="text-2xl font-bold">{slaStats.averageResponseTimeHours.toFixed(1)}h</p>
              </div>
            </div>
            {slaStats.byPriority && slaStats.byPriority.length > 0 && (
              <div className="mt-4 pt-4 border-t">
                <p className="text-sm font-medium mb-2">{t('sla.byPriority')}</p>
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
          <CardTitle>{t('table.title')}</CardTitle>
          <CardDescription>{t('table.subtitle')}</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t('table.headers.id')}</TableHead>
                <TableHead>{t('table.headers.type')}</TableHead>
                <TableHead>{t('table.headers.priority')}</TableHead>
                <TableHead>{t('table.headers.status')}</TableHead>
                <TableHead>{t('table.headers.appeal')}</TableHead>
                <TableHead>{t('table.headers.description')}</TableHead>
                <TableHead>{t('table.headers.created')}</TableHead>
                <TableHead>{t('table.headers.actions')}</TableHead>
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
                            <Button variant="outline" size="sm" title={t('dialogs.updateStatus.buttonTitle')}>
                              <MessageSquare className="h-4 w-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>{t('dialogs.updateStatus.title')}</DialogTitle>
                              <DialogDescription>
                                {t('dialogs.updateStatus.description')}
                              </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4">
                              <div>
                                <Label htmlFor="newStatus">{t('dialogs.updateStatus.statusLabel')}</Label>
                                <Select
                                  value={newStatus}
                                  onValueChange={(value: DisputeStatus) => setNewStatus(value)}
                                >
                                  <SelectTrigger>
                                    <SelectValue placeholder={t('dialogs.updateStatus.statusPlaceholder')} />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value={DisputeStatus.OPEN}>{t('statuses.OPEN')}</SelectItem>
                                    <SelectItem value={DisputeStatus.IN_PROGRESS}>
                                      {t('statuses.IN_PROGRESS')}
                                    </SelectItem>
                                    <SelectItem value={DisputeStatus.ESCALATED}>
                                      {t('statuses.ESCALATED')}
                                    </SelectItem>
                                    <SelectItem value={DisputeStatus.RESOLVED}>{t('statuses.RESOLVED')}</SelectItem>
                                    <SelectItem value={DisputeStatus.REJECTED}>{t('statuses.REJECTED')}</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                              <div>
                                <Label htmlFor="adminNotes">{t('dialogs.updateStatus.notesLabel')}</Label>
                                <Textarea
                                  id="adminNotes"
                                  value={adminNotes}
                                  onChange={(e) => setAdminNotes(e.target.value)}
                                  placeholder={t('dialogs.updateStatus.notesPlaceholder')}
                                  rows={3}
                                />
                              </div>
                            </div>
                            <DialogFooter>
                              <Button type="button" variant="outline" onClick={() => setStatusDialogOpen(false)}>
                                {t('dialogs.updateStatus.cancel')}
                              </Button>
                              <Button
                                type="button"
                                onClick={handleUpdateStatus}
                                disabled={isUpdatingStatus}
                              >
                                {isUpdatingStatus ? t('dialogs.updateStatus.submitting') : t('dialogs.updateStatus.submit')}
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
                              title={t('dialogs.escalate.buttonTitle')}
                              disabled={dispute.status === DisputeStatus.ESCALATED}
                            >
                              <ArrowUpCircle className="h-4 w-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>{t('dialogs.escalate.title')}</DialogTitle>
                              <DialogDescription>
                                {t('dialogs.escalate.description')}
                              </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4">
                              <div>
                                <Label htmlFor="escalationReason">{t('dialogs.escalate.reasonLabel')}</Label>
                                <Textarea
                                  id="escalationReason"
                                  value={escalationReason}
                                  onChange={(e) => setEscalationReason(e.target.value)}
                                  placeholder={t('dialogs.escalate.reasonPlaceholder')}
                                  rows={3}
                                />
                              </div>
                            </div>
                            <DialogFooter>
                              <Button
                                variant="outline"
                                onClick={() => setEscalateDialogOpen(false)}
                              >
                                {t('dialogs.escalate.cancel')}
                              </Button>
                              <Button
                                variant="destructive"
                                onClick={handleEscalate}
                                disabled={!escalationReason || isEscalatingDispute}
                              >
                                {isEscalatingDispute ? t('dialogs.escalate.submitting') : t('dialogs.escalate.submit')}
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
                            <Button variant="outline" size="sm" title={t('dialogs.resolve.buttonTitle')}>
                              <CheckCircle className="h-4 w-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>{t('dialogs.resolve.title')}</DialogTitle>
                              <DialogDescription>
                                {t('dialogs.resolve.description')}
                              </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4">
                              <div>
                                <Label htmlFor="resolveStatus">{t('dialogs.resolve.statusLabel')}</Label>
                                <Select
                                  value={resolveStatus}
                                  onValueChange={(
                                    value: DisputeStatus.RESOLVED | DisputeStatus.REJECTED,
                                  ) => setResolveStatus(value)}
                                >
                                  <SelectTrigger>
                                    <SelectValue placeholder={t('dialogs.resolve.statusPlaceholder')} />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value={DisputeStatus.RESOLVED}>{t('statuses.RESOLVED')}</SelectItem>
                                    <SelectItem value={DisputeStatus.REJECTED}>{t('statuses.REJECTED')}</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                              <div>
                                <Label htmlFor="resolution">{t('dialogs.resolve.resolutionLabel')}</Label>
                                <Textarea
                                  id="resolution"
                                  value={resolution}
                                  onChange={(e) => setResolution(e.target.value)}
                                  placeholder={t('dialogs.resolve.resolutionPlaceholder')}
                                  rows={4}
                                />
                              </div>
                            </div>
                            <DialogFooter>
                              <Button type="button" variant="outline" onClick={() => setResolveDialogOpen(false)}>
                                {t('dialogs.resolve.cancel')}
                              </Button>
                              <Button
                                type="button"
                                onClick={handleResolve}
                                disabled={!resolution || isResolvingDispute}
                              >
                                {isResolvingDispute ? t('dialogs.resolve.submitting') : t('dialogs.resolve.submit')}
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
                              <Button variant="outline" size="sm" title={t('dialogs.appeal.buttonTitle')} className="border-yellow-500">
                                <Scale className="h-4 w-4 text-yellow-600" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>{t('dialogs.appeal.title')}</DialogTitle>
                                <DialogDescription>
                                  {t('dialogs.appeal.description')}
                                </DialogDescription>
                              </DialogHeader>
                              {dispute.appealReason && (
                                <div className="rounded-lg border bg-muted/50 p-4">
                                  <p className="text-sm font-medium mb-1">{t('dialogs.appeal.appealReasonLabel')}</p>
                                  <p className="text-sm text-muted-foreground">{dispute.appealReason}</p>
                                </div>
                              )}
                              <div className="space-y-4">
                                <div>
                                  <Label htmlFor="appealDecision">{t('dialogs.appeal.decisionLabel')}</Label>
                                  <Select
                                    value={appealApproved ? 'approve' : 'reject'}
                                    onValueChange={(value) => setAppealApproved(value === 'approve')}
                                  >
                                    <SelectTrigger>
                                      <SelectValue placeholder={t('dialogs.appeal.decisionPlaceholder')} />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="approve">{t('dialogs.appeal.approve')}</SelectItem>
                                      <SelectItem value="reject">{t('dialogs.appeal.reject')}</SelectItem>
                                    </SelectContent>
                                  </Select>
                                </div>
                                <div>
                                  <Label htmlFor="appealResolution">{t('dialogs.appeal.resolutionLabel')}</Label>
                                  <Textarea
                                    id="appealResolution"
                                    value={appealResolution}
                                    onChange={(e) => setAppealResolution(e.target.value)}
                                    placeholder={t('dialogs.appeal.resolutionPlaceholder')}
                                    rows={4}
                                  />
                                </div>
                              </div>
                              <DialogFooter>
                                <Button type="button" variant="outline" onClick={() => setAppealDialogOpen(false)}>
                                  {t('dialogs.appeal.cancel')}
                                </Button>
                                <Button
                                  type="button"
                                  onClick={handleResolveAppeal}
                                  disabled={!appealResolution || appealResolution.length < 10 || isResolvingAppeal}
                                >
                                  {isResolvingAppeal ? t('dialogs.appeal.submitting') : appealApproved ? t('dialogs.appeal.submitApprove') : t('dialogs.appeal.submitReject')}
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
                    {t('table.empty')}
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
