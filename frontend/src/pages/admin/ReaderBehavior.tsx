import { useState, useEffect } from 'react';
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
  const [suspiciousReaders, setSuspiciousReaders] = useState<any>(null);
  const [stats, setStats] = useState<any>(null);
  const [activeFlags, setActiveFlags] = useState<any>(null);
  const [loadingReaders, setLoadingReaders] = useState(true);
  const [loadingFlags, setLoadingFlags] = useState(true);
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
  const fetchData = async () => {
    try {
      setLoadingReaders(true);
      setLoadingFlags(true);
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
      toast.error('Failed to load reader behavior data');
    } finally {
      setLoadingReaders(false);
      setLoadingFlags(false);
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
      toast.success('Investigation notes updated');
      setInvestigateDialogOpen(false);
      setInvestigationNotes('');
      setInvestigationStatus(BehaviorFlagStatus.INVESTIGATED);
      await fetchData();
    } catch (error: any) {
      console.error('Investigate error:', error);
      toast.error(error.response?.data?.message || 'Failed to update investigation');
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
      toast.success(`Action taken: ${actionType}`);
      setActionDialogOpen(false);
      setActionType(BehaviorAction.WARNED);
      setActionNotes('');
      await fetchData();
    } catch (error: any) {
      console.error('Take action error:', error);
      toast.error(error.response?.data?.message || 'Failed to take action');
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
    switch (type) {
      case BehaviorFlagType.FAST_REVIEW:
        return 'Fast Review';
      case BehaviorFlagType.SIMILAR_TEXT:
        return 'Similar Text';
      case BehaviorFlagType.MULTIPLE_IP:
        return 'Multiple IP';
      case BehaviorFlagType.DEVICE_FINGERPRINT:
        return 'Device Fingerprint';
      case BehaviorFlagType.HIGH_REJECTION_RATE:
        return 'High Rejection';
      case BehaviorFlagType.NEW_ACCOUNT_ABUSE:
        return 'New Account Abuse';
      default:
        return type;
    }
  };

  const isLoading = loadingReaders || loadingFlags;

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex h-64 items-center justify-center">
          <p className="text-muted-foreground">Loading reader behavior data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto space-y-6 px-4 py-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Reader Behavior Monitoring</h1>
          <p className="text-muted-foreground">
            Track and investigate unusual reader behavior patterns
          </p>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Flags</CardDescription>
            <CardTitle className="text-2xl">{stats?.totalFlags || 0}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Active Flags</CardDescription>
            <CardTitle className="text-2xl text-red-600">{stats?.activeFlags || 0}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Suspicious Readers</CardDescription>
            <CardTitle className="text-2xl text-orange-600">
              {stats?.suspiciousReaders || 0}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Actions Taken</CardDescription>
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
            Suspicious Readers
          </TabsTrigger>
          <TabsTrigger value="flags" className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4" />
            Active Flags
          </TabsTrigger>
        </TabsList>

        {/* Suspicious Readers Tab */}
        <TabsContent value="readers">
          <Card>
            <CardHeader>
              <CardTitle>Suspicious Readers</CardTitle>
              <CardDescription>
                Readers with active behavior flags requiring attention
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Reader</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Reliability Score</TableHead>
                    <TableHead>Active Flags</TableHead>
                    <TableHead>Highest Severity</TableHead>
                    <TableHead>Flag Types</TableHead>
                    <TableHead>Last Flag</TableHead>
                    <TableHead>Status</TableHead>
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
                            {reader.isFlagged && <Badge variant="destructive">Flagged</Badge>}
                            {!reader.isActive && <Badge variant="secondary">Inactive</Badge>}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center text-muted-foreground">
                        No suspicious readers found
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
              <CardTitle>Active Behavior Flags</CardTitle>
              <CardDescription>Flags requiring investigation</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Flag Type</TableHead>
                    <TableHead>Severity</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Score Impact</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead>Actions</TableHead>
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
                                <Button variant="outline" size="sm" title="Investigate">
                                  <Search className="h-4 w-4" />
                                </Button>
                              </DialogTrigger>
                              <DialogContent>
                                <DialogHeader>
                                  <DialogTitle>Investigate Flag</DialogTitle>
                                  <DialogDescription>
                                    Record investigation findings for this behavior flag
                                  </DialogDescription>
                                </DialogHeader>
                                <div className="space-y-4">
                                  <div>
                                    <Label htmlFor="investigationStatus">
                                      Investigation Result *
                                    </Label>
                                    <Select
                                      value={investigationStatus}
                                      onValueChange={(value: BehaviorFlagStatus) =>
                                        setInvestigationStatus(value)
                                      }
                                    >
                                      <SelectTrigger>
                                        <SelectValue placeholder="Select status" />
                                      </SelectTrigger>
                                      <SelectContent>
                                        <SelectItem value={BehaviorFlagStatus.INVESTIGATED}>
                                          Investigated
                                        </SelectItem>
                                        <SelectItem value={BehaviorFlagStatus.CONFIRMED}>
                                          Confirmed
                                        </SelectItem>
                                        <SelectItem value={BehaviorFlagStatus.DISMISSED}>
                                          Dismissed
                                        </SelectItem>
                                      </SelectContent>
                                    </Select>
                                  </div>
                                  <div>
                                    <Label htmlFor="investigationNotes">
                                      Investigation Notes *
                                    </Label>
                                    <Textarea
                                      id="investigationNotes"
                                      value={investigationNotes}
                                      onChange={(e) => setInvestigationNotes(e.target.value)}
                                      placeholder="Document your investigation findings"
                                      rows={4}
                                    />
                                  </div>
                                </div>
                                <DialogFooter>
                                  <Button
                                    variant="outline"
                                    onClick={() => setInvestigateDialogOpen(false)}
                                  >
                                    Cancel
                                  </Button>
                                  <Button
                                    onClick={handleInvestigate}
                                    disabled={!investigationNotes || isInvestigating}
                                  >
                                    {isInvestigating ? 'Saving...' : 'Save Investigation'}
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
                                <Button variant="outline" size="sm" title="Take Action">
                                  <UserX className="h-4 w-4" />
                                </Button>
                              </DialogTrigger>
                              <DialogContent>
                                <DialogHeader>
                                  <DialogTitle>Take Action</DialogTitle>
                                  <DialogDescription>
                                    Take action against this flagged behavior
                                  </DialogDescription>
                                </DialogHeader>
                                <div className="space-y-4">
                                  <div>
                                    <Label htmlFor="actionType">Action *</Label>
                                    <Select
                                      value={actionType}
                                      onValueChange={(value: BehaviorAction) =>
                                        setActionType(value)
                                      }
                                    >
                                      <SelectTrigger>
                                        <SelectValue placeholder="Select action" />
                                      </SelectTrigger>
                                      <SelectContent>
                                        <SelectItem value={BehaviorAction.WARNED}>
                                          Issue Warning
                                        </SelectItem>
                                        <SelectItem value={BehaviorAction.SUSPENDED}>
                                          Suspend Account
                                        </SelectItem>
                                        <SelectItem value={BehaviorAction.BANNED}>
                                          Ban Account
                                        </SelectItem>
                                        <SelectItem value={BehaviorAction.DISMISSED}>
                                          Dismiss Flag
                                        </SelectItem>
                                      </SelectContent>
                                    </Select>
                                  </div>
                                  <div>
                                    <Label htmlFor="actionNotes">Notes</Label>
                                    <Textarea
                                      id="actionNotes"
                                      value={actionNotes}
                                      onChange={(e) => setActionNotes(e.target.value)}
                                      placeholder="Additional notes about the action"
                                      rows={3}
                                    />
                                  </div>
                                </div>
                                <DialogFooter>
                                  <Button
                                    variant="outline"
                                    onClick={() => setActionDialogOpen(false)}
                                  >
                                    Cancel
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
                                    {isTakingAction ? 'Processing...' : 'Take Action'}
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
                        No active flags found
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
