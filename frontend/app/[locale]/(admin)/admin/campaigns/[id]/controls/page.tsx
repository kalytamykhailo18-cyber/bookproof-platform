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
import { Pause, Play, Settings, TrendingUp, AlertCircle, ArrowLeft } from 'lucide-react';

export default function CampaignControlsPage() {
  const params = useParams();
  const router = useRouter();
  const locale = (params.locale as string) || 'en';
  const bookId = params.id as string;
  const t = useTranslations('adminControls');

  const {
    useCampaignHealth,
    useCampaignAnalytics,
    pauseCampaign,
    resumeCampaign,
    adjustDistribution,
    allocateCredits,
    adjustOverbooking,
  } = useAdminControls();

  const { data: health, isLoading: healthLoading } = useCampaignHealth(bookId);
  const { data: analytics, isLoading: analyticsLoading } = useCampaignAnalytics(bookId);

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
        <Button variant="ghost" className="mb-4" onClick={() => router.push(`/${locale}/admin/campaigns/${bookId}`)}>
          <ArrowLeft className="mr-2 h-4 w-4" />
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
                      {pauseCampaign.isPending ? t('actions.pausing') : t('actions.confirmPause')}
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
                        ? t('actions.resuming')
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
    </div>
  );
}
