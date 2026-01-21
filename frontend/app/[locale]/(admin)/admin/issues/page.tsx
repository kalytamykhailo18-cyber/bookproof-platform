'use client';

import { useState } from 'react';
import { useIssueManagement, useAmazonMonitoring } from '@/hooks/useReviews';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { AlertTriangle, CheckCircle, TrendingUp, Shield } from 'lucide-react';
import { ReviewIssue, IssueResolutionStatus } from '@/lib/api/reviews';
import { formatDistanceToNow } from 'date-fns';

export default function AdminIssuesPage() {
  const { openIssues, isLoadingIssues, resolveIssue, isResolvingIssue } = useIssueManagement();

  const {
    activeMonitors,
    isLoadingMonitors,
    stats: monitoringStats,
    isLoadingStats,
    markAsRemoved,
    isMarkingAsRemoved,
  } = useAmazonMonitoring();

  const [resolveDialogOpen, setResolveDialogOpen] = useState(false);
  const [currentIssue, setCurrentIssue] = useState<ReviewIssue | null>(null);
  const [resolutionStatus, setResolutionStatus] = useState<IssueResolutionStatus>(
    IssueResolutionStatus.RESOLVED,
  );
  const [resolutionText, setResolutionText] = useState('');
  const [notifyReader, setNotifyReader] = useState(false);
  const [requestResubmission, setRequestResubmission] = useState(false);
  const [triggerReassignment, setTriggerReassignment] = useState(false);

  const openResolveDialog = (issue: ReviewIssue) => {
    setCurrentIssue(issue);
    setResolutionStatus(IssueResolutionStatus.RESOLVED);
    setResolutionText('');
    setNotifyReader(false);
    setRequestResubmission(false);
    setTriggerReassignment(false);
    setResolveDialogOpen(true);
  };

  const handleResolve = () => {
    if (!currentIssue) return;

    resolveIssue({
      issueId: currentIssue.id,
      data: {
        status: resolutionStatus,
        resolution: resolutionText,
        notifyReader,
        requestResubmission,
        triggerReassignment,
      },
    });

    setResolveDialogOpen(false);
    setCurrentIssue(null);
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'LOW':
        return 'bg-blue-100 text-blue-800';
      case 'MEDIUM':
        return 'bg-yellow-100 text-yellow-800';
      case 'HIGH':
        return 'bg-orange-100 text-orange-800';
      case 'CRITICAL':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (isLoadingIssues || isLoadingMonitors || isLoadingStats) {
    return (
      <div className="container mx-auto space-y-6 p-6">
        <Skeleton className="h-12 w-96" />
        <div className="grid gap-6 md:grid-cols-3">
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
        </div>
        <Skeleton className="h-96" />
      </div>
    );
  }

  return (
    <div className="container mx-auto space-y-6 p-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Issue Management</h1>
        <p className="text-muted-foreground">Manage review issues and Amazon removal monitoring</p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Open Issues</CardTitle>
            <AlertTriangle className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{openIssues?.length || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Monitors</CardTitle>
            <Shield className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{monitoringStats?.totalActive || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Removal Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {monitoringStats?.removalRate?.toFixed(1) || 0}%
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="issues" className="space-y-4">
        <TabsList>
          <TabsTrigger value="issues">Open Issues ({openIssues?.length || 0})</TabsTrigger>
          <TabsTrigger value="monitoring">
            Amazon Monitoring ({activeMonitors?.length || 0})
          </TabsTrigger>
        </TabsList>

        {/* Open Issues Tab */}
        <TabsContent value="issues" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Open Issues</CardTitle>
              <CardDescription>Review issues that require attention</CardDescription>
            </CardHeader>
            <CardContent>
              {!openIssues || openIssues.length === 0 ? (
                <div className="py-16 text-center">
                  <CheckCircle className="mx-auto mb-4 h-16 w-16 text-green-500" />
                  <h3 className="mb-2 text-lg font-semibold">No open issues</h3>
                  <p className="text-muted-foreground">All issues have been resolved.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {openIssues.map((issue) => (
                    <Card key={issue.id} className="border-2">
                      <CardContent className="pt-6">
                        <div className="space-y-3">
                          {/* Issue Header */}
                          <div className="flex items-start justify-between">
                            <div className="flex items-center gap-2">
                              <Badge className={getSeverityColor(issue.severity)}>
                                {issue.severity}
                              </Badge>
                              <Badge variant="outline">{issue.issueType.replace(/_/g, ' ')}</Badge>
                              <Badge variant="outline">{issue.status}</Badge>
                            </div>
                          </div>

                          {/* Description */}
                          <div>
                            <p className="mb-1 text-sm font-medium">Description:</p>
                            <p className="text-sm text-muted-foreground">{issue.description}</p>
                          </div>

                          {/* Metadata */}
                          <div className="flex items-center gap-4 text-xs text-muted-foreground">
                            <span>
                              Created{' '}
                              {formatDistanceToNow(new Date(issue.createdAt), {
                                addSuffix: true,
                              })}
                            </span>
                            {issue.readerNotified && (
                              <Badge variant="secondary" className="text-xs">
                                Reader Notified
                              </Badge>
                            )}
                            {issue.resubmissionRequested && (
                              <Badge variant="secondary" className="text-xs">
                                Resubmission Requested
                              </Badge>
                            )}
                            {issue.reassignmentTriggered && (
                              <Badge variant="secondary" className="text-xs">
                                Reassignment Triggered
                              </Badge>
                            )}
                          </div>

                          {/* Resolution */}
                          {issue.resolution && (
                            <div className="rounded bg-muted p-3">
                              <p className="mb-1 text-sm font-medium">Resolution:</p>
                              <p className="text-sm">{issue.resolution}</p>
                              {issue.resolvedAt && (
                                <p className="mt-1 text-xs text-muted-foreground">
                                  Resolved{' '}
                                  {formatDistanceToNow(new Date(issue.resolvedAt), {
                                    addSuffix: true,
                                  })}
                                </p>
                              )}
                            </div>
                          )}

                          {/* Action Buttons */}
                          {issue.status !== IssueResolutionStatus.RESOLVED &&
                            issue.status !== IssueResolutionStatus.REJECTED && (
                              <div className="flex gap-2 pt-2">
                                <Button
                                  size="sm"
                                  onClick={() => openResolveDialog(issue)}
                                  disabled={isResolvingIssue}
                                >
                                  Resolve Issue
                                </Button>
                              </div>
                            )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Amazon Monitoring Tab */}
        <TabsContent value="monitoring" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Amazon Review Monitoring (14-Day Guarantee)</CardTitle>
              <CardDescription>
                Reviews are monitored for 14 days after validation to detect Amazon removals
              </CardDescription>
            </CardHeader>
            <CardContent>
              {/* Monitoring Stats Summary */}
              <div className="mb-6 grid gap-4 md:grid-cols-4">
                <div className="rounded border border-blue-200 bg-blue-50 p-4 dark:bg-blue-950">
                  <p className="mb-1 text-sm text-blue-600 dark:text-blue-400">Active Monitors</p>
                  <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">
                    {monitoringStats?.totalActive || 0}
                  </p>
                </div>
                <div className="rounded border border-red-200 bg-red-50 p-4 dark:bg-red-950">
                  <p className="mb-1 text-sm text-red-600 dark:text-red-400">Removed (14-day)</p>
                  <p className="text-2xl font-bold text-red-900 dark:text-red-100">
                    {monitoringStats?.removedWithin14Days || 0}
                  </p>
                </div>
                <div className="rounded border border-gray-200 bg-gray-50 p-4 dark:bg-gray-900">
                  <p className="mb-1 text-sm text-gray-600 dark:text-gray-400">
                    Removed (after 14d)
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                    {monitoringStats?.removedAfter14Days || 0}
                  </p>
                </div>
                <div className="rounded border border-green-200 bg-green-50 p-4 dark:bg-green-950">
                  <p className="mb-1 text-sm text-green-600 dark:text-green-400">Completed</p>
                  <p className="text-2xl font-bold text-green-900 dark:text-green-100">
                    {monitoringStats?.totalCompleted || 0}
                  </p>
                </div>
              </div>

              {/* Active Monitors List */}
              {!activeMonitors || activeMonitors.length === 0 ? (
                <div className="py-16 text-center">
                  <Shield className="mx-auto mb-4 h-16 w-16 text-blue-500" />
                  <h3 className="mb-2 text-lg font-semibold">No active monitors</h3>
                  <p className="text-muted-foreground">
                    Reviews will appear here when validated and monitoring begins.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {activeMonitors.map((monitor) => {
                    const daysRemaining = Math.ceil(
                      (new Date(monitor.monitoringEndDate).getTime() - Date.now()) /
                        (1000 * 60 * 60 * 24),
                    );

                    return (
                      <Card key={monitor.id} className="border-2">
                        <CardContent className="pt-6">
                          <div className="space-y-3">
                            {/* Monitor Header */}
                            <div className="flex items-start justify-between">
                              <div>
                                <h4 className="font-semibold">{monitor.bookTitle}</h4>
                                <p className="text-sm text-muted-foreground">
                                  Reader: {monitor.readerName}
                                </p>
                              </div>
                              <Badge
                                variant="outline"
                                className={
                                  daysRemaining <= 3
                                    ? 'border-red-500 text-red-500'
                                    : 'border-blue-500 text-blue-500'
                                }
                              >
                                {daysRemaining} days remaining
                              </Badge>
                            </div>

                            {/* Monitoring Info */}
                            <div className="grid grid-cols-2 gap-4 text-sm">
                              <div>
                                <p className="text-muted-foreground">Started:</p>
                                <p>
                                  {formatDistanceToNow(new Date(monitor.monitoringStartDate), {
                                    addSuffix: true,
                                  })}
                                </p>
                              </div>
                              <div>
                                <p className="text-muted-foreground">Last Checked:</p>
                                <p>
                                  {monitor.lastChecked
                                    ? formatDistanceToNow(new Date(monitor.lastChecked), {
                                        addSuffix: true,
                                      })
                                    : 'Not yet checked'}
                                </p>
                              </div>
                              <div>
                                <p className="text-muted-foreground">Status:</p>
                                <p>{monitor.status}</p>
                              </div>
                              <div>
                                <p className="text-muted-foreground">Status:</p>
                                <Badge
                                  variant={monitor.stillExistsOnAmazon ? 'default' : 'destructive'}
                                >
                                  {monitor.stillExistsOnAmazon ? 'Active' : 'Removed'}
                                </Badge>
                              </div>
                            </div>

                            {/* Amazon Link */}
                            <div>
                              <span
                                className="cursor-pointer text-sm text-blue-600 hover:underline"
                                onClick={() => window.open(monitor.amazonReviewLink, '_blank', 'noopener,noreferrer')}
                              >
                                Check on Amazon →
                              </span>
                            </div>

                            {/* Mark as Removed Button */}
                            {monitor.stillExistsOnAmazon && (
                              <Button
                                size="sm"
                                variant="destructive"
                                disabled={isMarkingAsRemoved}
                                onClick={() => {
                                  if (
                                    confirm(
                                      'Are you sure you want to mark this review as removed by Amazon?',
                                    )
                                  ) {
                                    markAsRemoved({
                                      reviewId: monitor.reviewId,
                                      data: {
                                        removalDate: new Date().toISOString(),
                                        notes: 'Manually marked as removed by admin',
                                      },
                                    });
                                  }
                                }}
                              >
                                Mark as Removed
                              </Button>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Resolve Issue Dialog */}
      <Dialog open={resolveDialogOpen} onOpenChange={setResolveDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Resolve Issue</DialogTitle>
            <DialogDescription>
              Provide resolution details and choose actions to take
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Resolution Status */}
            <div className="space-y-2">
              <Label>Resolution Status</Label>
              <Select
                value={resolutionStatus}
                onValueChange={(value) => setResolutionStatus(value as IssueResolutionStatus)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.values(IssueResolutionStatus).map((status) => (
                    <SelectItem key={status} value={status}>
                      {status.replace(/_/g, ' ')}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Resolution Text */}
            <div className="space-y-2">
              <Label>Resolution Details</Label>
              <Textarea
                value={resolutionText}
                onChange={(e) => setResolutionText(e.target.value)}
                placeholder="Describe how the issue was resolved..."
                rows={4}
              />
            </div>

            {/* Action Checkboxes */}
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="notifyReader"
                  checked={notifyReader}
                  onCheckedChange={(checked) => setNotifyReader(checked as boolean)}
                />
                <Label htmlFor="notifyReader" className="cursor-pointer">
                  Notify reader of resolution
                </Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="requestResubmission"
                  checked={requestResubmission}
                  onCheckedChange={(checked) => setRequestResubmission(checked as boolean)}
                />
                <Label htmlFor="requestResubmission" className="cursor-pointer">
                  Request resubmission from reader
                </Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="triggerReassignment"
                  checked={triggerReassignment}
                  onCheckedChange={(checked) => setTriggerReassignment(checked as boolean)}
                />
                <Label htmlFor="triggerReassignment" className="cursor-pointer">
                  Trigger reassignment to another reader
                </Label>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setResolveDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleResolve} disabled={isResolvingIssue || !resolutionText.trim()}>
              {isResolvingIssue ? 'Resolving...' : 'Resolve Issue'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
