import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAdminControls } from '@/hooks/useAdminControls';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow } from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  ArrowLeft,
  BookOpen,
  TrendingUp,
  Users,
  Clock,
  CheckCircle,
  AlertCircle,
  Pause,
  Play,
  Settings,
  Calendar,
  Star,
  ExternalLink,
  RefreshCw,
  Loader2 } from 'lucide-react';

export function AdminCampaignDetailPage() {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation('adminCampaigns');
  const params = useParams();
  const campaignId = params.id as string;

  const {
    useCampaignHealth,
    useCampaignAnalytics,
    pauseCampaign,
    resumeCampaign,
    adjustDistribution } = useAdminControls();

  const { data: health, isLoading: healthLoading } = useCampaignHealth(campaignId);
  const { data: analytics, isLoading: analyticsLoading } = useCampaignAnalytics(campaignId);

  const [pauseDialogOpen, setPauseDialogOpen] = useState(false);
  const [resumeDialogOpen, setResumeDialogOpen] = useState(false);
  const [distributionDialogOpen, setDistributionDialogOpen] = useState(false);
  const [isBackLoading, setIsBackLoading] = useState(false);
  const [isControlsLoading, setIsControlsLoading] = useState(false);

  const [pauseReason, setPauseReason] = useState('');
  const [pauseNotes, setPauseNotes] = useState('');
  const [resumeReason, setResumeReason] = useState('');
  const [resumeNotes, setResumeNotes] = useState('');
  const [newDistribution, setNewDistribution] = useState('');
  const [distributionReason, setDistributionReason] = useState('');

  const handlePause = () => {
    pauseCampaign.mutate(
      { bookId: campaignId, data: { reason: pauseReason, notes: pauseNotes || undefined } },
      {
        onSuccess: () => {
          setPauseDialogOpen(false);
          setPauseReason('');
          setPauseNotes('');
        } },
    );
  };

  const handleResume = () => {
    resumeCampaign.mutate(
      { bookId: campaignId, data: { reason: resumeReason, notes: resumeNotes || undefined } },
      {
        onSuccess: () => {
          setResumeDialogOpen(false);
          setResumeReason('');
          setResumeNotes('');
        } },
    );
  };

  const handleAdjustDistribution = () => {
    adjustDistribution.mutate(
      {
        bookId: campaignId,
        data: { reviewsPerWeek: parseInt(newDistribution), reason: distributionReason } },
      {
        onSuccess: () => {
          setDistributionDialogOpen(false);
          setNewDistribution('');
          setDistributionReason('');
        } },
    );
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return <Badge className="bg-green-100 text-green-800">{t('status.active')}</Badge>;
      case 'PAUSED':
        return <Badge className="bg-yellow-100 text-yellow-800">{t('status.paused')}</Badge>;
      case 'COMPLETED':
        return <Badge className="bg-blue-100 text-blue-800">{t('status.completed')}</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getHealthStatusBadge = (status: string) => {
    switch (status) {
      case 'on-track':
        return <Badge className="bg-green-100 text-green-800">{t('health.onTrack')}</Badge>;
      case 'delayed':
        return <Badge className="bg-red-100 text-red-800">{t('health.delayed')}</Badge>;
      case 'ahead-of-schedule':
        return <Badge className="bg-blue-100 text-blue-800">{t('health.aheadOfSchedule')}</Badge>;
      case 'issues':
        return <Badge className="bg-orange-100 text-orange-800">{t('health.issues')}</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  if (healthLoading || analyticsLoading) {
    return (
      <div className="container mx-auto space-y-6 p-6">
        <Skeleton className="h-10 w-64 animate-pulse" />
        <div className="grid gap-4 md:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-28 animate-pulse" />
          ))}
        </div>
        <Skeleton className="h-96 animate-pulse" />
      </div>
    );
  }

  if (!analytics || !health) {
    return (
      <div className="container mx-auto p-6">
        <Card className="animate-fade-up">
          <CardContent className="py-16 text-center">
            <AlertCircle className="mx-auto mb-4 h-16 w-16 text-red-500" />
            <h3 className="text-lg font-semibold">{t('detail.notFound.title')}</h3>
            <p className="text-muted-foreground">{t('detail.notFound.description')}</p>
            <Button className="mt-4" onClick={() => navigate(`/admin/campaigns`)}>
              {t('detail.backToCampaigns')}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

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
            navigate(`/admin/campaigns`);
          }}
          disabled={isBackLoading}
        >
          {isBackLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <ArrowLeft className="mr-2 h-4 w-4" />}
          {t('detail.backToCampaigns')}
        </Button>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">{analytics.campaign.title}</h1>
            <div className="mt-2 flex items-center gap-2">
              {getStatusBadge(analytics.campaign.status)}
              {getHealthStatusBadge(health.status)}
            </div>
          </div>
          <div className="flex gap-2">
            {analytics.campaign.status === 'ACTIVE' ? (
              <Dialog open={pauseDialogOpen} onOpenChange={setPauseDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="destructive">
                    <Pause className="mr-2 h-4 w-4" />
                    {t('actions.pause')}
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>{t('actions.pauseDialog.title')}</DialogTitle>
                    <DialogDescription>{t('actions.pauseDialog.description')}</DialogDescription>
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
            ) : analytics.campaign.status === 'PAUSED' ? (
              <Dialog open={resumeDialogOpen} onOpenChange={setResumeDialogOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Play className="mr-2 h-4 w-4" />
                    {t('actions.resume')}
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>{t('actions.resumeDialog.title')}</DialogTitle>
                    <DialogDescription>{t('actions.resumeDialog.description')}</DialogDescription>
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
            ) : null}
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setIsControlsLoading(true);
                navigate(`/admin/campaigns/${campaignId}/controls`);
              }}
              disabled={isControlsLoading}
            >
              {isControlsLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Settings className="mr-2 h-4 w-4" />}
              {t('actions.controls')}
            </Button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="animate-fade-up-fast">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('stats.progress')}</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{health.completionPercentage.toFixed(1)}%</div>
            <Progress value={health.completionPercentage} className="mt-2 h-2" />
            <p className="mt-1 text-xs text-muted-foreground">
              {health.reviewsDelivered} / {health.targetReviews} {t('stats.reviews')}
            </p>
          </CardContent>
        </Card>

        <Card className="animate-fade-up-light-slow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('stats.weekProgress')}</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {health.weeksElapsed} / {health.totalPlannedWeeks}
            </div>
            <p className="text-xs text-muted-foreground">{t('stats.weeksCompleted')}</p>
          </CardContent>
        </Card>

        <Card className="animate-fade-up-medium-slow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('stats.avgRating')}</CardTitle>
            <Star className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {analytics.performance.averageRating.toFixed(1)}
            </div>
            <p className="text-xs text-muted-foreground">{t('stats.internalRating')}</p>
          </CardContent>
        </Card>

        <Card className="animate-fade-up-heavy-slow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('stats.variance')}</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div
              className={`text-2xl font-bold ${health.daysOffSchedule > 0 ? 'text-red-600' : 'text-green-600'}`}
            >
              {health.daysOffSchedule > 0 ? '+' : ''}
              {health.daysOffSchedule} {t('stats.days')}
            </div>
            <p className="text-xs text-muted-foreground">{t('stats.scheduleVariance')}</p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="overview" className="animate-zoom-in">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">{t('tabs.overview')}</TabsTrigger>
          <TabsTrigger value="distribution">{t('tabs.distribution')}</TabsTrigger>
          <TabsTrigger value="performance">{t('tabs.performance')}</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <Card className="animate-fade-up-fast">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5" />
                {t('overview.campaignInfo')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-3">
                  <div>
                    <Label className="text-muted-foreground">{t('overview.targetReviews')}</Label>
                    <p className="text-lg font-semibold">{analytics.campaign.targetReviews}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">
                      {t('overview.reviewsDelivered')}
                    </Label>
                    <p className="text-lg font-semibold">{analytics.progress.reviewsDelivered}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">
                      {t('overview.reviewsValidated')}
                    </Label>
                    <p className="text-lg font-semibold text-green-600">
                      {analytics.progress.reviewsValidated}
                    </p>
                  </div>
                </div>
                <div className="space-y-3">
                  <div>
                    <Label className="text-muted-foreground">{t('overview.reviewsRejected')}</Label>
                    <p className="text-lg font-semibold text-red-600">
                      {analytics.progress.reviewsRejected}
                    </p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">{t('overview.reviewsExpired')}</Label>
                    <p className="text-lg font-semibold text-yellow-600">
                      {analytics.progress.reviewsExpired}
                    </p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">
                      {t('overview.completionPercentage')}
                    </Label>
                    <p className="text-lg font-semibold">
                      {analytics.progress.completionPercentage.toFixed(1)}%
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="animate-fade-up-light-slow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                {t('overview.timeline')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-3">
                <div>
                  <Label className="text-muted-foreground">{t('overview.startDate')}</Label>
                  <p className="text-lg font-semibold">
                    {new Date(analytics.timeline.startDate).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <Label className="text-muted-foreground">{t('overview.expectedEndDate')}</Label>
                  <p className="text-lg font-semibold">
                    {new Date(analytics.timeline.expectedEndDate).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <Label className="text-muted-foreground">{t('overview.projectedEndDate')}</Label>
                  <p className="text-lg font-semibold">
                    {new Date(analytics.timeline.projectedEndDate).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="distribution" className="space-y-4">
          <Card className="animate-fade-up-fast">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <RefreshCw className="h-5 w-5" />
                  {t('distribution.title')}
                </CardTitle>
                <Dialog open={distributionDialogOpen} onOpenChange={setDistributionDialogOpen}>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm">
                      {t('distribution.adjust')}
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>{t('distribution.adjustDialog.title')}</DialogTitle>
                      <DialogDescription>
                        {t('distribution.adjustDialog.description')}
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="new-distribution">
                          {t('distribution.adjustDialog.reviewsPerWeek')}
                        </Label>
                        <Input
                          id="new-distribution"
                          type="number"
                          value={newDistribution}
                          onChange={(e) => setNewDistribution(e.target.value)}
                          placeholder={analytics.distribution.reviewsPerWeek.toString()}
                        />
                      </div>
                      <div>
                        <Label htmlFor="dist-reason">{t('distribution.adjustDialog.reason')}</Label>
                        <Textarea
                          id="dist-reason"
                          value={distributionReason}
                          onChange={(e) => setDistributionReason(e.target.value)}
                          placeholder={t('distribution.adjustDialog.reasonPlaceholder')}
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
                        {adjustDistribution.isPending
                          ? t('distribution.adjusting')
                          : t('distribution.confirm')}
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-3">
                <div>
                  <Label className="text-muted-foreground">
                    {t('distribution.reviewsPerWeek')}
                  </Label>
                  <div className="flex items-center gap-2">
                    <p className="text-2xl font-bold">{analytics.distribution.reviewsPerWeek}</p>
                    {analytics.distribution.manualOverride && (
                      <Badge variant="outline">{t('distribution.manualOverride')}</Badge>
                    )}
                  </div>
                </div>
                <div>
                  <Label className="text-muted-foreground">{t('distribution.currentWeek')}</Label>
                  <p className="text-2xl font-bold">{analytics.distribution.currentWeek}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">{t('distribution.totalWeeks')}</Label>
                  <p className="text-2xl font-bold">{analytics.distribution.totalWeeks}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="performance" className="space-y-4">
          <Card className="animate-fade-up-fast">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Star className="h-5 w-5" />
                {t('performance.title')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-6 md:grid-cols-3">
                <div className="text-center">
                  <div className="text-4xl font-bold text-yellow-500">
                    {analytics.performance.averageRating.toFixed(1)}
                  </div>
                  <p className="text-sm text-muted-foreground">{t('performance.avgRating')}</p>
                </div>
                <div className="text-center">
                  <div className="text-4xl font-bold text-green-600">
                    {(analytics.performance.onTimeDeliveryRate * 100).toFixed(0)}%
                  </div>
                  <p className="text-sm text-muted-foreground">{t('performance.onTimeDelivery')}</p>
                </div>
                <div className="text-center">
                  <div className="text-4xl font-bold text-blue-600">
                    {(analytics.performance.validationRate * 100).toFixed(0)}%
                  </div>
                  <p className="text-sm text-muted-foreground">{t('performance.validationRate')}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
