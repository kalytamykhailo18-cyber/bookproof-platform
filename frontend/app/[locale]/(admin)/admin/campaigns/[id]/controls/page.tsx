'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useAdminControls } from '@/hooks/useAdminControls';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Pause,
  Play,
  Settings,
  TrendingUp,
  AlertCircle,
  ArrowLeft,
  XCircle,
  UserPlus,
  FileText,
  CheckCircle2,
  Loader2,
} from 'lucide-react';

export default function CampaignControlsPage() {
  const params = useParams();
  const router = useRouter();
  const locale = (params.locale as string) || 'en';
  const bookId = params.id as string;
  const t = useTranslations('adminControls');

  const {
    useCampaignHealth,
    useCampaignAnalytics,
    useCampaignReportData,
    pauseCampaign,
    resumeCampaign,
    adjustDistribution,
    allocateCredits,
    adjustOverbooking,
    forceCompleteCampaign,
    manualGrantAccess,
    removeReaderFromCampaign,
  } = useAdminControls();

  const { data: health, isLoading: healthLoading } = useCampaignHealth(bookId);
  const { data: analytics, isLoading: analyticsLoading } = useCampaignAnalytics(bookId);

  // Report data state
  const [reportDialogOpen, setReportDialogOpen] = useState(false);
  const { data: reportData, isLoading: reportLoading } = useCampaignReportData(bookId, reportDialogOpen);

  const [pauseReason, setPauseReason] = useState('');
  const [pauseNotes, setPauseNotes] = useState('');
  const [resumeReason, setResumeReason] = useState('');
  const [resumeNotes, setResumeNotes] = useState('');
  const [newDistribution, setNewDistribution] = useState('');
  const [distributionReason, setDistributionReason] = useState('');
  const [creditsToAllocate, setCreditsToAllocate] = useState('');
  const [creditReason, setCreditReason] = useState('');
  const [overbookingEnabled, setOverbookingEnabled] = useState(true);
  const [overbookingPercent, setOverbookingPercent] = useState('');
  const [overbookingReason, setOverbookingReason] = useState('');

  const [pauseDialogOpen, setPauseDialogOpen] = useState(false);
  const [resumeDialogOpen, setResumeDialogOpen] = useState(false);
  const [distributionDialogOpen, setDistributionDialogOpen] = useState(false);
  const [creditDialogOpen, setCreditDialogOpen] = useState(false);
  const [overbookingDialogOpen, setOverbookingDialogOpen] = useState(false);

  // Section 5.3 - New campaign control dialogs
  const [forceCompleteDialogOpen, setForceCompleteDialogOpen] = useState(false);
  const [forceCompleteReason, setForceCompleteReason] = useState('');
  const [forceCompleteRefund, setForceCompleteRefund] = useState(true);
  const [forceCompleteNotes, setForceCompleteNotes] = useState('');

  const [grantAccessDialogOpen, setGrantAccessDialogOpen] = useState(false);
  const [grantAccessReaderId, setGrantAccessReaderId] = useState('');
  const [grantAccessReason, setGrantAccessReason] = useState('');
  const [grantAccessFormat, setGrantAccessFormat] = useState('ebook');
  const [grantAccessNotes, setGrantAccessNotes] = useState('');

  const [removeReaderDialogOpen, setRemoveReaderDialogOpen] = useState(false);
  const [removeAssignmentId, setRemoveAssignmentId] = useState('');
  const [removeReaderReason, setRemoveReaderReason] = useState('');
  const [removeReaderNotify, setRemoveReaderNotify] = useState(true);
  const [removeReaderRefund, setRemoveReaderRefund] = useState(true);
  const [removeReaderNotes, setRemoveReaderNotes] = useState('');
  const [isBackLoading, setIsBackLoading] = useState(false);

  const handlePause = () => {
    pauseCampaign.mutate(
      {
        bookId,
        data: {
          reason: pauseReason,
          notes: pauseNotes || undefined,
        },
      },
      {
        onSuccess: () => {
          setPauseDialogOpen(false);
          setPauseReason('');
          setPauseNotes('');
        },
      },
    );
  };

  const handleResume = () => {
    resumeCampaign.mutate(
      {
        bookId,
        data: {
          reason: resumeReason,
          notes: resumeNotes || undefined,
        },
      },
      {
        onSuccess: () => {
          setResumeDialogOpen(false);
          setResumeReason('');
          setResumeNotes('');
        },
      },
    );
  };

  const handleAdjustDistribution = () => {
    adjustDistribution.mutate(
      {
        bookId,
        data: {
          reviewsPerWeek: parseInt(newDistribution),
          reason: distributionReason,
        },
      },
      {
        onSuccess: () => {
          setDistributionDialogOpen(false);
          setNewDistribution('');
          setDistributionReason('');
        },
      },
    );
  };

  const handleAllocateCredits = () => {
    allocateCredits.mutate(
      {
        bookId,
        data: {
          creditsToAllocate: parseInt(creditsToAllocate),
          reason: creditReason,
        },
      },
      {
        onSuccess: () => {
          setCreditDialogOpen(false);
          setCreditsToAllocate('');
          setCreditReason('');
        },
      },
    );
  };

  const handleAdjustOverbooking = () => {
    adjustOverbooking.mutate(
      {
        bookId,
        data: {
          overBookingEnabled: overbookingEnabled,
          overBookingPercent: parseInt(overbookingPercent),
          reason: overbookingReason,
        },
      },
      {
        onSuccess: () => {
          setOverbookingDialogOpen(false);
          setOverbookingPercent('');
          setOverbookingReason('');
        },
      },
    );
  };

  // Section 5.3 - New campaign control handlers
  const handleForceComplete = () => {
    forceCompleteCampaign.mutate(
      {
        bookId,
        data: {
          reason: forceCompleteReason,
          refundUnusedCredits: forceCompleteRefund,
          notes: forceCompleteNotes || undefined,
        },
      },
      {
        onSuccess: () => {
          setForceCompleteDialogOpen(false);
          setForceCompleteReason('');
          setForceCompleteRefund(true);
          setForceCompleteNotes('');
        },
      },
    );
  };

  const handleGrantAccess = () => {
    manualGrantAccess.mutate(
      {
        bookId,
        data: {
          readerProfileId: grantAccessReaderId,
          reason: grantAccessReason,
          preferredFormat: grantAccessFormat,
          notes: grantAccessNotes || undefined,
        },
      },
      {
        onSuccess: () => {
          setGrantAccessDialogOpen(false);
          setGrantAccessReaderId('');
          setGrantAccessReason('');
          setGrantAccessFormat('ebook');
          setGrantAccessNotes('');
        },
      },
    );
  };

  const handleRemoveReader = () => {
    removeReaderFromCampaign.mutate(
      {
        bookId,
        data: {
          assignmentId: removeAssignmentId,
          reason: removeReaderReason,
          notifyReader: removeReaderNotify,
          refundCredit: removeReaderRefund,
          notes: removeReaderNotes || undefined,
        },
      },
      {
        onSuccess: () => {
          setRemoveReaderDialogOpen(false);
          setRemoveAssignmentId('');
          setRemoveReaderReason('');
          setRemoveReaderNotify(true);
          setRemoveReaderRefund(true);
          setRemoveReaderNotes('');
        },
      },
    );
  };

  const handleDownloadReport = () => {
    if (!reportData) return;

    // Generate a text-based report for download
    const reportContent = `
CAMPAIGN REPORT
===============
Generated: ${new Date().toISOString()}

CAMPAIGN INFORMATION
--------------------
Title: ${reportData.campaign.title}
Author: ${reportData.campaign.author}
Status: ${reportData.campaign.status}
Start Date: ${reportData.campaign.startDate}
End Date: ${reportData.campaign.endDate}
Target Reviews: ${reportData.campaign.targetReviews}

PROGRESS
--------
Total Assignments: ${reportData.progress.totalAssignments}
Completed Reviews: ${reportData.progress.completedReviews}
Validated Reviews: ${reportData.progress.validatedReviews}
Rejected Reviews: ${reportData.progress.rejectedReviews}
Pending Reviews: ${reportData.progress.pendingReviews}
Expired Reviews: ${reportData.progress.expiredReviews}
Completion Rate: ${reportData.progress.completionRate.toFixed(1)}%
Validation Rate: ${reportData.progress.validationRate.toFixed(1)}%

CREDITS
-------
Allocated: ${reportData.credits.allocated}
Used: ${reportData.credits.used}
Remaining: ${reportData.credits.remaining}

TIMELINE
--------
Weeks Elapsed: ${reportData.timeline.weeksElapsed}
Total Weeks: ${reportData.timeline.totalWeeks}
Reviews Per Week: ${reportData.timeline.reviewsPerWeek}
On Schedule: ${reportData.timeline.onSchedule ? 'Yes' : 'No'}
Days Remaining: ${reportData.timeline.daysRemaining}

READERS (${reportData.readers?.length || 0})
${'='.repeat(40)}
${(reportData.readers || []).map((r) => `
Name: ${r.name}
Email: ${r.email}
Status: ${r.status}
Assigned: ${r.assignedAt}
${r.reviewSubmittedAt ? `Submitted: ${r.reviewSubmittedAt}` : ''}
${r.validatedAt ? `Validated: ${r.validatedAt}` : ''}
${r.rating ? `Rating: ${r.rating}` : ''}
---`).join('\n')}
    `.trim();

    const blob = new Blob([reportContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `campaign-report-${bookId}-${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (healthLoading || analyticsLoading) {
    return (
      <div className="container mx-auto space-y-6 p-6">
        <Skeleton className="h-10 w-64 animate-pulse" />
        <Skeleton className="h-48 animate-pulse" />
        <Skeleton className="h-48 animate-pulse" />
        <Skeleton className="h-48 animate-pulse" />
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'on-track':
        return 'bg-green-100 text-green-800';
      case 'delayed':
        return 'bg-yellow-100 text-yellow-800';
      case 'issues':
        return 'bg-red-100 text-red-800';
      case 'ahead-of-schedule':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="container mx-auto space-y-6 p-6">
      {/* Header */}
      <div className="animate-fade-up">
        <Button
          type="button"
          variant="ghost"
          className="mb-4"
          onClick={() => {
            setIsBackLoading(true);
            router.push(`/${locale}/admin/campaigns/${bookId}`);
          }}
          disabled={isBackLoading}
        >
          {isBackLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <ArrowLeft className="mr-2 h-4 w-4" />}
          {t('backToCampaign')}
        </Button>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">{t('title')}</h1>
            <p className="text-muted-foreground">{analytics?.campaign.title}</p>
          </div>
          <Badge variant={analytics?.campaign.status === 'ACTIVE' ? 'default' : 'secondary'}>
            {analytics?.campaign.status}
          </Badge>
        </div>
      </div>

      {/* Campaign Health */}
      <Card className="animate-fade-up-fast">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            {t('health.title')}
          </CardTitle>
          <CardDescription>{t('health.description')}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            <div className="animate-fade-up-fast">
              <p className="text-sm text-muted-foreground">{t('health.status')}</p>
              <Badge className={getStatusColor(health?.status || '')}>{health?.status}</Badge>
            </div>
            <div className="animate-fade-up-light-slow">
              <p className="text-sm text-muted-foreground">{t('health.completion')}</p>
              <p className="text-2xl font-bold">{health?.completionPercentage.toFixed(1)}%</p>
            </div>
            <div className="animate-fade-up-medium-slow">
              <p className="text-sm text-muted-foreground">{t('health.variance')}</p>
              <p className="text-2xl font-bold">{health?.variance}</p>
            </div>
            <div className="animate-fade-up-heavy-slow">
              <p className="text-sm text-muted-foreground">{t('health.daysOff')}</p>
              <p className="text-2xl font-bold">{health?.daysOffSchedule}</p>
            </div>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-4">
            <div className="animate-fade-left-fast">
              <p className="text-sm text-muted-foreground">{t('health.delivered')}</p>
              <p className="text-lg font-semibold">
                {health?.reviewsDelivered} / {health?.targetReviews}
              </p>
            </div>
            <div className="animate-fade-left-light-slow">
              <p className="text-sm text-muted-foreground">{t('health.weeksProgress')}</p>
              <p className="text-lg font-semibold">
                {health?.weeksElapsed} / {health?.totalPlannedWeeks}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Campaign Analytics */}
      <Card className="animate-zoom-in">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            {t('analytics.title')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
            <div className="animate-fade-up-fast">
              <p className="text-sm text-muted-foreground">{t('analytics.reviewsPerWeek')}</p>
              <p className="text-2xl font-bold">{analytics?.distribution.reviewsPerWeek}</p>
              {analytics?.distribution.manualOverride && (
                <Badge variant="outline" className="mt-1">
                  {t('analytics.manualOverride')}
                </Badge>
              )}
            </div>
            <div className="animate-fade-up-light-slow">
              <p className="text-sm text-muted-foreground">{t('analytics.currentWeek')}</p>
              <p className="text-2xl font-bold">
                {analytics?.distribution.currentWeek} / {analytics?.distribution.totalWeeks}
              </p>
            </div>
            <div className="animate-fade-up-medium-slow">
              <p className="text-sm text-muted-foreground">{t('analytics.averageRating')}</p>
              <p className="text-2xl font-bold">
                {analytics?.performance.averageRating.toFixed(1)}
              </p>
            </div>
          </div>

          <div className="mt-4 grid grid-cols-3 gap-4">
            <div className="animate-fade-left-fast">
              <p className="text-sm text-muted-foreground">{t('analytics.delivered')}</p>
              <p className="text-lg font-semibold">{analytics?.progress.reviewsDelivered}</p>
            </div>
            <div className="animate-fade-left-light-slow">
              <p className="text-sm text-muted-foreground">{t('analytics.validated')}</p>
              <p className="text-lg font-semibold text-green-600">
                {analytics?.progress.reviewsValidated}
              </p>
            </div>
            <div className="animate-fade-left-medium-slow">
              <p className="text-sm text-muted-foreground">{t('analytics.rejected')}</p>
              <p className="text-lg font-semibold text-red-600">
                {analytics?.progress.reviewsRejected}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Control Actions */}
      <Card className="animate-zoom-in-slow">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5" />
            {t('actions.title')}
          </CardTitle>
          <CardDescription>{t('actions.description')}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
            {/* Pause/Resume Campaign */}
            {analytics?.campaign.status === 'ACTIVE' ? (
              <Dialog open={pauseDialogOpen} onOpenChange={setPauseDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="destructive" className="w-full animate-fade-up-fast">
                    <Pause className="mr-2 h-4 w-4" />
                    {t('actions.pause')}
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>{t('actions.pauseDialog.title')}</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="pause-reason">{t('actions.pauseDialog.reason')}</Label>
                      <Input
                        id="pause-reason"
                        value={pauseReason}
                        onChange={(e) => setPauseReason(e.target.value)}
                        placeholder={t('actions.pauseDialog.reasonPlaceholder')}
                      />
                    </div>
                    <div>
                      <Label htmlFor="pause-notes">{t('actions.pauseDialog.notes')}</Label>
                      <Textarea
                        id="pause-notes"
                        value={pauseNotes}
                        onChange={(e) => setPauseNotes(e.target.value)}
                        placeholder={t('actions.pauseDialog.notesPlaceholder')}
                      />
                    </div>
                    <Button
                      type="button"
                      onClick={handlePause}
                      disabled={!pauseReason || pauseCampaign.isPending}
                      className="w-full"
                    >
                      {pauseCampaign.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : t('actions.confirmPause')}
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            ) : (
              <Dialog open={resumeDialogOpen} onOpenChange={setResumeDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="default" className="w-full animate-fade-up-fast">
                    <Play className="mr-2 h-4 w-4" />
                    {t('actions.resume')}
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>{t('actions.resumeDialog.title')}</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="resume-reason">{t('actions.resumeDialog.reason')}</Label>
                      <Input
                        id="resume-reason"
                        value={resumeReason}
                        onChange={(e) => setResumeReason(e.target.value)}
                        placeholder={t('actions.resumeDialog.reasonPlaceholder')}
                      />
                    </div>
                    <div>
                      <Label htmlFor="resume-notes">{t('actions.resumeDialog.notes')}</Label>
                      <Textarea
                        id="resume-notes"
                        value={resumeNotes}
                        onChange={(e) => setResumeNotes(e.target.value)}
                        placeholder={t('actions.resumeDialog.notesPlaceholder')}
                      />
                    </div>
                    <Button
                      type="button"
                      onClick={handleResume}
                      disabled={!resumeReason || resumeCampaign.isPending}
                      className="w-full"
                    >
                      {resumeCampaign.isPending
                        ? <Loader2 className="h-4 w-4 animate-spin" />
                        : t('actions.confirmResume')}
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            )}

            {/* Adjust Distribution */}
            <Dialog open={distributionDialogOpen} onOpenChange={setDistributionDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" className="w-full animate-fade-up-light-slow">
                  {t('actions.adjustDistribution')}
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>{t('actions.distributionDialog.title')}</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="distribution">
                      {t('actions.distributionDialog.reviewsPerWeek')}
                    </Label>
                    <Input
                      id="distribution"
                      type="number"
                      value={newDistribution}
                      onChange={(e) => setNewDistribution(e.target.value)}
                      placeholder={t('actions.distributionDialog.placeholder')}
                    />
                  </div>
                  <div>
                    <Label htmlFor="dist-reason">{t('actions.distributionDialog.reason')}</Label>
                    <Textarea
                      id="dist-reason"
                      value={distributionReason}
                      onChange={(e) => setDistributionReason(e.target.value)}
                      placeholder={t('actions.distributionDialog.reasonPlaceholder')}
                    />
                  </div>
                  <Button
                    type="button"
                    onClick={handleAdjustDistribution}
                    disabled={
                      !newDistribution || !distributionReason || adjustDistribution.isPending
                    }
                    className="w-full"
                  >
                    {adjustDistribution.isPending ? t('actions.adjusting') : t('actions.confirm')}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>

            {/* Allocate Credits */}
            <Dialog open={creditDialogOpen} onOpenChange={setCreditDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" className="animate-fade-up-medium-slow w-full">
                  {t('actions.allocateCredits')}
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>{t('actions.creditDialog.title')}</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="credits">{t('actions.creditDialog.amount')}</Label>
                    <Input
                      id="credits"
                      type="number"
                      value={creditsToAllocate}
                      onChange={(e) => setCreditsToAllocate(e.target.value)}
                      placeholder={t('actions.creditDialog.placeholder')}
                    />
                  </div>
                  <div>
                    <Label htmlFor="credit-reason">{t('actions.creditDialog.reason')}</Label>
                    <Textarea
                      id="credit-reason"
                      value={creditReason}
                      onChange={(e) => setCreditReason(e.target.value)}
                      placeholder={t('actions.creditDialog.reasonPlaceholder')}
                    />
                  </div>
                  <Button
                    type="button"
                    onClick={handleAllocateCredits}
                    disabled={!creditsToAllocate || !creditReason || allocateCredits.isPending}
                    className="w-full"
                  >
                    {allocateCredits.isPending ? t('actions.allocating') : t('actions.confirm')}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>

            {/* Adjust Overbooking */}
            <Dialog open={overbookingDialogOpen} onOpenChange={setOverbookingDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" className="animate-fade-up-heavy-slow w-full">
                  {t('actions.adjustOverbooking')}
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>{t('actions.overbookingDialog.title')}</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="overbookingEnabled"
                      checked={overbookingEnabled}
                      onCheckedChange={(checked) => setOverbookingEnabled(checked as boolean)}
                    />
                    <Label htmlFor="overbookingEnabled">
                      {t('actions.overbookingDialog.enableLabel')}
                    </Label>
                  </div>
                  <div>
                    <Label htmlFor="overbooking">{t('actions.overbookingDialog.percentage')}</Label>
                    <Input
                      id="overbooking"
                      type="number"
                      value={overbookingPercent}
                      onChange={(e) => setOverbookingPercent(e.target.value)}
                      placeholder={t('actions.overbookingDialog.placeholder')}
                      disabled={!overbookingEnabled}
                    />
                  </div>
                  <div>
                    <Label htmlFor="over-reason">{t('actions.overbookingDialog.reason')}</Label>
                    <Textarea
                      id="over-reason"
                      value={overbookingReason}
                      onChange={(e) => setOverbookingReason(e.target.value)}
                      placeholder={t('actions.overbookingDialog.reasonPlaceholder')}
                    />
                  </div>
                  <Button
                    type="button"
                    onClick={handleAdjustOverbooking}
                    disabled={
                      !overbookingPercent || !overbookingReason || adjustOverbooking.isPending
                    }
                    className="w-full"
                  >
                    {adjustOverbooking.isPending ? t('actions.adjusting') : t('actions.confirm')}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardContent>
      </Card>

      {/* Section 5.3 - Advanced Campaign Controls */}
      <Card className="animate-zoom-in-slow">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Advanced Controls
          </CardTitle>
          <CardDescription>
            Force completion, manual access grants, reader removal, and reporting
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            {/* Force Complete Campaign */}
            <Dialog open={forceCompleteDialogOpen} onOpenChange={setForceCompleteDialogOpen}>
              <DialogTrigger asChild>
                <Button
                  variant="destructive"
                  className="w-full"
                  disabled={analytics?.campaign.status === 'COMPLETED'}
                >
                  <CheckCircle2 className="mr-2 h-4 w-4" />
                  Force Complete
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Force Complete Campaign</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    This will mark the campaign as completed regardless of its current progress.
                    All pending assignments will be cancelled.
                  </p>
                  <div>
                    <Label htmlFor="force-complete-reason">Reason *</Label>
                    <Input
                      id="force-complete-reason"
                      value={forceCompleteReason}
                      onChange={(e) => setForceCompleteReason(e.target.value)}
                      placeholder="Enter reason for force completion"
                    />
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="forceCompleteRefund"
                      checked={forceCompleteRefund}
                      onCheckedChange={(checked) => setForceCompleteRefund(checked as boolean)}
                    />
                    <Label htmlFor="forceCompleteRefund">Refund unused credits to author</Label>
                  </div>
                  <div>
                    <Label htmlFor="force-complete-notes">Additional Notes</Label>
                    <Textarea
                      id="force-complete-notes"
                      value={forceCompleteNotes}
                      onChange={(e) => setForceCompleteNotes(e.target.value)}
                      placeholder="Optional notes for audit trail"
                    />
                  </div>
                  <Button
                    type="button"
                    onClick={handleForceComplete}
                    disabled={!forceCompleteReason || forceCompleteCampaign.isPending}
                    variant="destructive"
                    className="w-full"
                  >
                    {forceCompleteCampaign.isPending ? 'Processing...' : 'Force Complete Campaign'}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>

            {/* Manual Grant Access */}
            <Dialog open={grantAccessDialogOpen} onOpenChange={setGrantAccessDialogOpen}>
              <DialogTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full"
                  disabled={analytics?.campaign.status === 'COMPLETED'}
                >
                  <UserPlus className="mr-2 h-4 w-4" />
                  Grant Access
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Manually Grant Reader Access</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    Bypass the normal queue to grant a specific reader immediate access to this
                    campaign.
                  </p>
                  <div>
                    <Label htmlFor="grant-access-reader">Reader Profile ID *</Label>
                    <Input
                      id="grant-access-reader"
                      value={grantAccessReaderId}
                      onChange={(e) => setGrantAccessReaderId(e.target.value)}
                      placeholder="Enter reader profile ID"
                    />
                  </div>
                  <div>
                    <Label htmlFor="grant-access-format">Preferred Format</Label>
                    <Select value={grantAccessFormat} onValueChange={setGrantAccessFormat}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select format" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ebook">E-book</SelectItem>
                        <SelectItem value="audiobook">Audiobook</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="grant-access-reason">Reason *</Label>
                    <Input
                      id="grant-access-reason"
                      value={grantAccessReason}
                      onChange={(e) => setGrantAccessReason(e.target.value)}
                      placeholder="e.g., Priority reviewer, special request"
                    />
                  </div>
                  <div>
                    <Label htmlFor="grant-access-notes">Additional Notes</Label>
                    <Textarea
                      id="grant-access-notes"
                      value={grantAccessNotes}
                      onChange={(e) => setGrantAccessNotes(e.target.value)}
                      placeholder="Optional notes for audit trail"
                    />
                  </div>
                  <Button
                    type="button"
                    onClick={handleGrantAccess}
                    disabled={
                      !grantAccessReaderId || !grantAccessReason || manualGrantAccess.isPending
                    }
                    className="w-full"
                  >
                    {manualGrantAccess.isPending ? 'Granting Access...' : 'Grant Access'}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>

            {/* Remove Reader from Campaign */}
            <Dialog open={removeReaderDialogOpen} onOpenChange={setRemoveReaderDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" className="w-full">
                  <XCircle className="mr-2 h-4 w-4" />
                  Remove Reader
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Remove Reader from Campaign</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    Remove a reader's assignment from this campaign. This action can be logged and
                    optionally notify the reader.
                  </p>
                  <div>
                    <Label htmlFor="remove-assignment-id">Assignment ID *</Label>
                    <Input
                      id="remove-assignment-id"
                      value={removeAssignmentId}
                      onChange={(e) => setRemoveAssignmentId(e.target.value)}
                      placeholder="Enter assignment ID to remove"
                    />
                  </div>
                  <div>
                    <Label htmlFor="remove-reader-reason">Reason *</Label>
                    <Input
                      id="remove-reader-reason"
                      value={removeReaderReason}
                      onChange={(e) => setRemoveReaderReason(e.target.value)}
                      placeholder="e.g., Violation of terms, reader request"
                    />
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="removeReaderNotify"
                      checked={removeReaderNotify}
                      onCheckedChange={(checked) => setRemoveReaderNotify(checked as boolean)}
                    />
                    <Label htmlFor="removeReaderNotify">Notify reader via email</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="removeReaderRefund"
                      checked={removeReaderRefund}
                      onCheckedChange={(checked) => setRemoveReaderRefund(checked as boolean)}
                    />
                    <Label htmlFor="removeReaderRefund">Refund credit to campaign pool</Label>
                  </div>
                  <div>
                    <Label htmlFor="remove-reader-notes">Additional Notes</Label>
                    <Textarea
                      id="remove-reader-notes"
                      value={removeReaderNotes}
                      onChange={(e) => setRemoveReaderNotes(e.target.value)}
                      placeholder="Optional notes for audit trail"
                    />
                  </div>
                  <Button
                    type="button"
                    onClick={handleRemoveReader}
                    disabled={
                      !removeAssignmentId ||
                      !removeReaderReason ||
                      removeReaderFromCampaign.isPending
                    }
                    variant="destructive"
                    className="w-full"
                  >
                    {removeReaderFromCampaign.isPending ? 'Removing...' : 'Remove Reader'}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>

            {/* Generate Report */}
            <Dialog open={reportDialogOpen} onOpenChange={setReportDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" className="w-full">
                  <FileText className="mr-2 h-4 w-4" />
                  Generate Report
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Campaign Report</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  {reportLoading ? (
                    <div className="space-y-4">
                      <Skeleton className="h-20 w-full" />
                      <Skeleton className="h-20 w-full" />
                      <Skeleton className="h-20 w-full" />
                    </div>
                  ) : reportData ? (
                    <div className="max-h-96 space-y-4 overflow-y-auto">
                      <div className="rounded-lg bg-muted p-4">
                        <h4 className="font-semibold">Campaign Information</h4>
                        <div className="mt-2 grid grid-cols-2 gap-2 text-sm">
                          <p>
                            <strong>Title:</strong> {reportData.campaign.title}
                          </p>
                          <p>
                            <strong>Author:</strong> {reportData.campaign.author}
                          </p>
                          <p>
                            <strong>Status:</strong> {reportData.campaign.status}
                          </p>
                          <p>
                            <strong>Target:</strong> {reportData.campaign.targetReviews} reviews
                          </p>
                        </div>
                      </div>

                      <div className="rounded-lg bg-muted p-4">
                        <h4 className="font-semibold">Progress</h4>
                        <div className="mt-2 grid grid-cols-3 gap-2 text-sm">
                          <p>
                            <strong>Completed:</strong> {reportData.progress.completedReviews}
                          </p>
                          <p>
                            <strong>Validated:</strong> {reportData.progress.validatedReviews}
                          </p>
                          <p>
                            <strong>Rejected:</strong> {reportData.progress.rejectedReviews}
                          </p>
                          <p>
                            <strong>Pending:</strong> {reportData.progress.pendingReviews}
                          </p>
                          <p>
                            <strong>Expired:</strong> {reportData.progress.expiredReviews}
                          </p>
                          <p>
                            <strong>Rate:</strong> {reportData.progress.completionRate.toFixed(1)}%
                          </p>
                        </div>
                      </div>

                      <div className="rounded-lg bg-muted p-4">
                        <h4 className="font-semibold">Credits</h4>
                        <div className="mt-2 grid grid-cols-3 gap-2 text-sm">
                          <p>
                            <strong>Allocated:</strong> {reportData.credits.allocated}
                          </p>
                          <p>
                            <strong>Used:</strong> {reportData.credits.used}
                          </p>
                          <p>
                            <strong>Remaining:</strong> {reportData.credits.remaining}
                          </p>
                        </div>
                      </div>

                      <div className="rounded-lg bg-muted p-4">
                        <h4 className="font-semibold">Readers ({reportData.readers?.length || 0})</h4>
                        <div className="mt-2 max-h-40 overflow-y-auto">
                          {(reportData.readers || []).map((reader) => (
                            <div
                              key={reader.id}
                              className="border-b py-2 text-sm last:border-b-0"
                            >
                              <p>
                                <strong>{reader.name}</strong> ({reader.email})
                              </p>
                              <p className="text-muted-foreground">
                                Status: {reader.status} | Assigned: {reader.assignedAt}
                                {reader.rating && ` | Rating: ${reader.rating}`}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <p className="text-muted-foreground">Failed to load report data</p>
                  )}

                  <Button
                    type="button"
                    onClick={handleDownloadReport}
                    disabled={reportLoading || !reportData}
                    className="w-full"
                  >
                    <FileText className="mr-2 h-4 w-4" />
                    Download Report
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
