import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { readerBehaviorApi } from '@/lib/api/reader-behavior';
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Search, AlertTriangle, ShieldAlert, UserX } from 'lucide-react';
import {
  BehaviorFlagStatus,
  BehaviorFlagType,
  BehaviorAction,
  IssueSeverity } from '@/lib/api/reader-behavior';

export function ReaderBehaviorPage() {
  const { t } = useTranslation('adminReaderBehavior');
  const [suspiciousReaders, setSuspiciousReaders] = useState<any>(null);
  const [stats, setStats] = useState<any>(null);
  const [activeFlags, setActiveFlags] = useState<any>(null);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [isRefetching, setIsRefetching] = useState(false);
  const [isInvestigating, setIsInvestigating] = useState(false);
  const [isTakingAction, setIsTakingAction] = useState(false);

  // Dialog states
  const [selectedFlagId, setSelectedFlagId] = useState<string>('');

  // Investigate Dialog State
  const [investigateDialogOpen, setInvestigateDialogOpen] = useState(false);
  const [investigationNotes, setInvestigationNotes] = useState('');
  const [investigationStatus, setInvestigationStatus] = useState<BehaviorFlagStatus>(
    BehaviorFlagStatus.INVESTIGATED,
  );

  // Take Action Dialog State
  const [actionDialogOpen, setActionDialogOpen] = useState(false);
  const [actionType, setActionType] = useState<BehaviorAction>(BehaviorAction.WARNED);
  const [actionNotes, setActionNotes] = useState('');

  // Fetch data
  const fetchData = async (isRefetch = false) => {
    try {
      if (isRefetch) {
        setIsRefetching(true);
      } else {
        setIsInitialLoading(true);
      }

      const [readersData, statsData, flagsData] = await Promise.all([
        readerBehaviorApi.getSuspiciousReaders(),
        readerBehaviorApi.getBehaviorStats(),
        readerBehaviorApi.getBehaviorFlags({ status: BehaviorFlagStatus.ACTIVE })
      ]);
      setSuspiciousReaders(readersData);
      setStats(statsData);
      setActiveFlags(flagsData);
    } catch (error: any) {
      console.error('Reader behavior error:', error);
      toast.error(t('messages.loadError'));
    } finally {
      setIsInitialLoading(false);
      setIsRefetching(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleInvestigate = async () => {
    try {
      setIsInvestigating(true);
      await readerBehaviorApi.investigateBehaviorFlag(selectedFlagId, {
        investigationNotes,
        status: investigationStatus
      });
      toast.success(t('messages.investigateSuccess'));
      setInvestigateDialogOpen(false);
      setInvestigationNotes('');
      setInvestigationStatus(BehaviorFlagStatus.INVESTIGATED);
      await fetchData(true); // Pass true for refetch
    } catch (error: any) {
      console.error('Investigate error:', error);
      toast.error(error.response?.data?.message || t('messages.investigateError'));
    } finally {
      setIsInvestigating(false);
    }
  };

  const handleTakeAction = async () => {
    try {
      setIsTakingAction(true);
      await readerBehaviorApi.takeAction(selectedFlagId, {
        action: actionType,
        notes: actionNotes || undefined
      });
      toast.success(t('messages.actionSuccess', { action: actionType }));
      setActionDialogOpen(false);
      setActionType(BehaviorAction.WARNED);
      setActionNotes('');
      await fetchData(true); // Pass true for refetch
    } catch (error: any) {
      console.error('Take action error:', error);
      toast.error(error.response?.data?.message || t('messages.actionError'));
    } finally {
      setIsTakingAction(false);
    }
  };

  const getSeverityColor = (severity: IssueSeverity) => {
    switch (severity) {
      case IssueSeverity.CRITICAL:
        return 'destructive';
      case IssueSeverity.HIGH:
        return 'destructive';
      case IssueSeverity.MEDIUM:
        return 'default';
      case IssueSeverity.LOW:
        return 'secondary';
      default:
        return 'secondary';
    }
  };

  const getStatusColor = (status: BehaviorFlagStatus) => {
    switch (status) {
      case BehaviorFlagStatus.ACTIVE:
        return 'destructive';
      case BehaviorFlagStatus.INVESTIGATED:
        return 'default';
      case BehaviorFlagStatus.CONFIRMED:
        return 'destructive';
      case BehaviorFlagStatus.DISMISSED:
        return 'secondary';
      default:
        return 'secondary';
    }
  };

  const getFlagTypeLabel = (type: BehaviorFlagType) => {
    return t(`flagTypes.${type}`, { defaultValue: type });
  };

  // Only show full loading on initial load, not on refetch
  if (isInitialLoading) {
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
      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        <Card className={isRefetching ? 'opacity-60 transition-opacity' : ''}>
          <CardHeader className="pb-2">
            <CardDescription>{t('stats.totalFlags')}</CardDescription>
            <CardTitle className="text-2xl">{stats?.totalFlags || 0}</CardTitle>
          </CardHeader>
        </Card>
        <Card className={isRefetching ? 'opacity-60 transition-opacity' : ''}>
          <CardHeader className="pb-2">
            <CardDescription>{t('stats.activeFlags')}</CardDescription>
            <CardTitle className="text-2xl text-red-600">{stats?.activeFlags || 0}</CardTitle>
          </CardHeader>
        </Card>
        <Card className={isRefetching ? 'opacity-60 transition-opacity' : ''}>
          <CardHeader className="pb-2">
            <CardDescription>{t('stats.suspiciousReaders')}</CardDescription>
            <CardTitle className="text-2xl text-orange-600">
              {stats?.suspiciousReaders || 0}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card className={isRefetching ? 'opacity-60 transition-opacity' : ''}>
          <CardHeader className="pb-2">
            <CardDescription>{t('stats.actionsTaken')}</CardDescription>
            <CardTitle className="text-2xl text-blue-600">
              {Object.values(stats?.byAction || {}).reduce((sum, count) => sum + count, 0)}
            </CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* Tabs for Suspicious Readers and Active Flags */}
      <Tabs defaultValue="readers" className="space-y-4">
        <TabsList>
          <TabsTrigger value="readers" className="flex items-center gap-2">
            <ShieldAlert className="h-4 w-4" />
            {t('tabs.suspiciousReaders')}
          </TabsTrigger>
          <TabsTrigger value="flags" className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4" />
            {t('tabs.activeFlags')}
          </TabsTrigger>
        </TabsList>

        {/* Suspicious Readers Tab */}
        <TabsContent value="readers">
          <Card>
            <CardHeader>
              <CardTitle>{t('readers.title')}</CardTitle>
              <CardDescription>
                {t('readers.subtitle')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t('readers.table.reader')}</TableHead>
                    <TableHead>{t('readers.table.email')}</TableHead>
                    <TableHead>{t('readers.table.reliabilityScore')}</TableHead>
                    <TableHead>{t('readers.table.activeFlags')}</TableHead>
                    <TableHead>{t('readers.table.highestSeverity')}</TableHead>
                    <TableHead>{t('readers.table.flagTypes')}</TableHead>
                    <TableHead>{t('readers.table.lastFlag')}</TableHead>
                    <TableHead>{t('readers.table.status')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {suspiciousReaders && suspiciousReaders.length > 0 ? (
                    suspiciousReaders.map((reader) => (
                      <TableRow key={reader.readerProfileId}>
                        <TableCell className="font-medium">{reader.readerName}</TableCell>
                        <TableCell>{reader.readerEmail}</TableCell>
                        <TableCell>
                          <span
                            className={`font-medium ${reader.reliabilityScore < 50 ? 'text-red-600' : reader.reliabilityScore < 75 ? 'text-yellow-600' : 'text-green-600'}`}
                          >
                            {reader.reliabilityScore.toFixed(1)}%
                          </span>
                        </TableCell>
                        <TableCell>
                          <Badge variant="destructive">{reader.activeFlagCount}</Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant={getSeverityColor(reader.highestSeverity)}>
                            {reader.highestSeverity}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-1">
                            {reader.flagTypes?.slice(0, 2).map((type) => (
                              <Badge key={type} variant="outline" className="text-xs">
                                {getFlagTypeLabel(type)}
                              </Badge>
                            ))}
                            {reader.flagTypes && reader.flagTypes.length > 2 && (
                              <Badge variant="outline" className="text-xs">
                                +{reader.flagTypes.length - 2}
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>{new Date(reader.lastFlagDate).toLocaleDateString()}</TableCell>
                        <TableCell>
                          <div className="flex gap-1">
                            {reader.isFlagged && <Badge variant="destructive">{t('readers.badges.flagged')}</Badge>}
                            {!reader.isActive && <Badge variant="secondary">{t('readers.badges.inactive')}</Badge>}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center text-muted-foreground">
                        {t('readers.empty')}
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Active Flags Tab */}
        <TabsContent value="flags">
          <Card>
            <CardHeader>
              <CardTitle>{t('flags.title')}</CardTitle>
              <CardDescription>{t('flags.subtitle')}</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t('flags.table.id')}</TableHead>
                    <TableHead>{t('flags.table.flagType')}</TableHead>
                    <TableHead>{t('flags.table.severity')}</TableHead>
                    <TableHead>{t('flags.table.status')}</TableHead>
                    <TableHead>{t('flags.table.description')}</TableHead>
                    <TableHead>{t('flags.table.scoreImpact')}</TableHead>
                    <TableHead>{t('flags.table.created')}</TableHead>
                    <TableHead>{t('flags.table.actions')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {activeFlags && activeFlags.length > 0 ? (
                    activeFlags.map((flag) => (
                      <TableRow key={flag.id}>
                        <TableCell className="font-mono text-xs">
                          {flag.id.slice(0, 8)}...
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{getFlagTypeLabel(flag.flagType)}</Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant={getSeverityColor(flag.severity)}>{flag.severity}</Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant={getStatusColor(flag.status)}>{flag.status}</Badge>
                        </TableCell>
                        <TableCell className="max-w-xs truncate">{flag.description}</TableCell>
                        <TableCell>
                          <span className={flag.scoreImpact < 0 ? 'text-red-600' : ''}>
                            {flag.scoreImpact}
                          </span>
                        </TableCell>
                        <TableCell>{new Date(flag.createdAt).toLocaleDateString()}</TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            {/* Investigate */}
                            <Dialog
                              open={investigateDialogOpen && selectedFlagId === flag.id}
                              onOpenChange={(open) => {
                                setInvestigateDialogOpen(open);
                                if (open) setSelectedFlagId(flag.id);
                              }}
                            >
                              <DialogTrigger asChild>
                                <Button variant="outline" size="sm" title={t('dialogs.investigate.buttonTitle')}>
                                  <Search className="h-4 w-4" />
                                </Button>
                              </DialogTrigger>
                              <DialogContent>
                                <DialogHeader>
                                  <DialogTitle>{t('dialogs.investigate.title')}</DialogTitle>
                                  <DialogDescription>
                                    {t('dialogs.investigate.description')}
                                  </DialogDescription>
                                </DialogHeader>
                                <div className="space-y-4">
                                  <div>
                                    <Label htmlFor="investigationStatus">
                                      {t('dialogs.investigate.resultLabel')}
                                    </Label>
                                    <Select
                                      value={investigationStatus}
                                      onValueChange={(value: BehaviorFlagStatus) =>
                                        setInvestigationStatus(value)
                                      }
                                    >
                                      <SelectTrigger>
                                        <SelectValue placeholder={t('dialogs.investigate.resultPlaceholder')} />
                                      </SelectTrigger>
                                      <SelectContent>
                                        <SelectItem value={BehaviorFlagStatus.INVESTIGATED}>
                                          {t('dialogs.investigate.statuses.INVESTIGATED')}
                                        </SelectItem>
                                        <SelectItem value={BehaviorFlagStatus.CONFIRMED}>
                                          {t('dialogs.investigate.statuses.CONFIRMED')}
                                        </SelectItem>
                                        <SelectItem value={BehaviorFlagStatus.DISMISSED}>
                                          {t('dialogs.investigate.statuses.DISMISSED')}
                                        </SelectItem>
                                      </SelectContent>
                                    </Select>
                                  </div>
                                  <div>
                                    <Label htmlFor="investigationNotes">
                                      {t('dialogs.investigate.notesLabel')}
                                    </Label>
                                    <Textarea
                                      id="investigationNotes"
                                      value={investigationNotes}
                                      onChange={(e) => setInvestigationNotes(e.target.value)}
                                      placeholder={t('dialogs.investigate.notesPlaceholder')}
                                      rows={4}
                                      className={investigationNotes.length > 0 && investigationNotes.length < 10 ? 'border-red-500' : ''}
                                    />
                                    {investigationNotes.length > 0 && investigationNotes.length < 10 && (
                                      <p className="text-sm text-red-600 mt-1">
                                        Minimum 10 characters required ({investigationNotes.length}/10)
                                      </p>
                                    )}
                                  </div>
                                </div>
                                <DialogFooter>
                                  <Button
                                    variant="outline"
                                    onClick={() => setInvestigateDialogOpen(false)}
                                  >
                                    {t('dialogs.investigate.cancel')}
                                  </Button>
                                  <Button
                                    onClick={handleInvestigate}
                                    disabled={investigationNotes.length < 10 || isInvestigating}
                                  >
                                    {isInvestigating ? t('dialogs.investigate.submitting') : t('dialogs.investigate.submit')}
                                  </Button>
                                </DialogFooter>
                              </DialogContent>
                            </Dialog>

                            {/* Take Action */}
                            <Dialog
                              open={actionDialogOpen && selectedFlagId === flag.id}
                              onOpenChange={(open) => {
                                setActionDialogOpen(open);
                                if (open) setSelectedFlagId(flag.id);
                              }}
                            >
                              <DialogTrigger asChild>
                                <Button variant="outline" size="sm" title={t('dialogs.action.buttonTitle')}>
                                  <UserX className="h-4 w-4" />
                                </Button>
                              </DialogTrigger>
                              <DialogContent>
                                <DialogHeader>
                                  <DialogTitle>{t('dialogs.action.title')}</DialogTitle>
                                  <DialogDescription>
                                    {t('dialogs.action.description')}
                                  </DialogDescription>
                                </DialogHeader>
                                <div className="space-y-4">
                                  <div>
                                    <Label htmlFor="actionType">{t('dialogs.action.actionLabel')}</Label>
                                    <Select
                                      value={actionType}
                                      onValueChange={(value: BehaviorAction) =>
                                        setActionType(value)
                                      }
                                    >
                                      <SelectTrigger>
                                        <SelectValue placeholder={t('dialogs.action.actionPlaceholder')} />
                                      </SelectTrigger>
                                      <SelectContent>
                                        <SelectItem value={BehaviorAction.WARNED}>
                                          {t('dialogs.action.actions.WARNED')}
                                        </SelectItem>
                                        <SelectItem value={BehaviorAction.SUSPENDED}>
                                          {t('dialogs.action.actions.SUSPENDED')}
                                        </SelectItem>
                                        <SelectItem value={BehaviorAction.BANNED}>
                                          {t('dialogs.action.actions.BANNED')}
                                        </SelectItem>
                                        <SelectItem value={BehaviorAction.DISMISSED}>
                                          {t('dialogs.action.actions.DISMISSED')}
                                        </SelectItem>
                                      </SelectContent>
                                    </Select>
                                  </div>
                                  <div>
                                    <Label htmlFor="actionNotes">{t('dialogs.action.notesLabel')}</Label>
                                    <Textarea
                                      id="actionNotes"
                                      value={actionNotes}
                                      onChange={(e) => setActionNotes(e.target.value)}
                                      placeholder={t('dialogs.action.notesPlaceholder')}
                                      rows={3}
                                    />
                                  </div>
                                </div>
                                <DialogFooter>
                                  <Button
                                    variant="outline"
                                    onClick={() => setActionDialogOpen(false)}
                                  >
                                    {t('dialogs.action.cancel')}
                                  </Button>
                                  <Button
                                    variant={
                                      actionType === BehaviorAction.BANNED ||
                                      actionType === BehaviorAction.SUSPENDED
                                        ? 'destructive'
                                        : 'default'
                                    }
                                    onClick={handleTakeAction}
                                    disabled={isTakingAction}
                                  >
                                    {isTakingAction ? t('dialogs.action.submitting') : t('dialogs.action.submit')}
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
                        {t('flags.empty')}
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
