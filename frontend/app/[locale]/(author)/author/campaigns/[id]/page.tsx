'use client';

import { useState, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useCampaign, useCampaigns } from '@/hooks/useCampaigns';
import { useCredits } from '@/hooks/useCredits';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Loader2,
  ArrowLeft,
  Upload,
  FileText,
  Headphones,
  Image as ImageIcon,
  Check,
  Play,
  Pause,
  PlayCircle,
  Edit,
  Trash2,
  BarChart3,
  Calendar,
  Download,
  Copy,
  ExternalLink,
  Globe,
  Eye,
} from 'lucide-react';
import Link from 'next/link';
import { CampaignStatus, BookFormat } from '@/lib/api/campaigns';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

export default function CampaignDetailPage() {
  const params = useParams();
  const router = useRouter();
  const campaignId = params.id as string;
  const t = useTranslations('author.campaigns.detail');

  const { campaign, isLoading, refetch } = useCampaign(campaignId);
  const {
    uploadEbook,
    uploadAudiobook,
    uploadCover,
    uploadSynopsis,
    isUploadingEbook,
    isUploadingAudiobook,
    isUploadingCover,
    isUploadingSynopsis,
    activateCampaign,
    isActivating,
    pauseCampaign,
    isPausing,
    resumeCampaign,
    isResuming,
    deleteCampaign,
    isDeleting,
  } = useCampaigns();
  const { creditBalance } = useCredits();

  const [showActivateDialog, setShowActivateDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [creditsToAllocate, setCreditsToAllocate] = useState(0);

  const ebookInputRef = useRef<HTMLInputElement>(null);
  const audiobookInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);
  const synopsisInputRef = useRef<HTMLInputElement>(null);

  const handleEbookUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && campaign) {
      uploadEbook(
        { id: campaign.id, file },
        {
          onSuccess: () => refetch(),
        },
      );
    }
  };

  const handleAudiobookUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && campaign) {
      uploadAudiobook(
        { id: campaign.id, file },
        {
          onSuccess: () => refetch(),
        },
      );
    }
  };

  const handleCoverUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && campaign) {
      uploadCover(
        { id: campaign.id, file },
        {
          onSuccess: () => refetch(),
        },
      );
    }
  };

  const handleSynopsisUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && campaign) {
      uploadSynopsis(
        { id: campaign.id, file },
        {
          onSuccess: () => refetch(),
        },
      );
    }
  };

  const handleActivate = () => {
    if (campaign && creditsToAllocate > 0) {
      activateCampaign(
        { id: campaign.id, data: { creditsToAllocate } },
        {
          onSuccess: () => {
            setShowActivateDialog(false);
            refetch();
          },
        },
      );
    }
  };

  const handleDelete = () => {
    if (campaign) {
      deleteCampaign(campaign.id);
    }
  };

  const calculateRequiredCredits = () => {
    if (!campaign) return 0;
    if (campaign.availableFormats === BookFormat.AUDIOBOOK) {
      return campaign.targetReviews * 2;
    } else if (campaign.availableFormats === BookFormat.BOTH) {
      return Math.ceil(campaign.targetReviews * 1.5);
    }
    return campaign.targetReviews;
  };

  const getStatusColor = (status: CampaignStatus) => {
    switch (status) {
      case CampaignStatus.DRAFT:
        return 'bg-gray-500';
      case CampaignStatus.ACTIVE:
        return 'bg-green-500';
      case CampaignStatus.PAUSED:
        return 'bg-yellow-500';
      case CampaignStatus.COMPLETED:
        return 'bg-blue-500';
      case CampaignStatus.CANCELLED:
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  const canActivate = () => {
    if (!campaign) return false;
    if (campaign.status !== CampaignStatus.DRAFT) return false;

    // Check if required files are uploaded
    const needsEbook =
      campaign.availableFormats === BookFormat.EBOOK ||
      campaign.availableFormats === BookFormat.BOTH;
    const needsAudiobook =
      campaign.availableFormats === BookFormat.AUDIOBOOK ||
      campaign.availableFormats === BookFormat.BOTH;

    if (needsEbook && !campaign.ebookFileUrl) return false;
    if (needsAudiobook && !campaign.audioBookFileUrl) return false;
    if (!campaign.coverImageUrl) return false;

    return true;
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!campaign) {
    return (
      <div className="container mx-auto py-8">
        <Card>
          <CardContent className="py-12 text-center">
            <p>{t('notFound')}</p>
            <Button onClick={() => router.push('/author')} className="mt-4">
              {t('backToDashboard')}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const requiredCredits = calculateRequiredCredits();
  const progressPercentage =
    campaign.totalReviewsDelivered && campaign.targetReviews
      ? (campaign.totalReviewsDelivered / campaign.targetReviews) * 100
      : 0;

  return (
    <div className="container mx-auto max-w-6xl px-4 py-8">
      {/* Header */}
      <div className="mb-8 animate-fade-up">
        <Button variant="ghost" onClick={() => router.push('/author')} className="mb-4">
          <ArrowLeft className="mr-2 h-4 w-4" />
          {t('backToDashboard')}
        </Button>
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold">{campaign.title}</h1>
            <p className="mt-2 text-muted-foreground">
              {campaign.authorName} • {campaign.language}
            </p>
          </div>
          <Badge className={getStatusColor(campaign.status)}>{campaign.status}</Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Main Content */}
        <div className="space-y-6 lg:col-span-2">
          {/* Campaign Progress */}
          {campaign.status !== CampaignStatus.DRAFT && (
            <Card className="animate-fade-up">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>{t('progress.title')}</CardTitle>
                <Link href={`/author/campaigns/${campaign.id}/analytics`}>
                  <Button variant="outline" size="sm">
                    <BarChart3 className="mr-2 h-4 w-4" />
                    {t('progress.viewAnalytics')}
                  </Button>
                </Link>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Weekly Progress Indicator */}
                {campaign.currentWeek && (
                  <div className="flex items-center gap-3 rounded-lg bg-muted/50 p-3">
                    <Calendar className="h-5 w-5 text-primary" />
                    <div>
                      <p className="text-sm font-medium">{t('progress.currentWeek')}</p>
                      <p className="text-lg font-bold">
                        {t('progress.weekProgress', {
                          current: campaign.currentWeek,
                          total: Math.ceil(campaign.targetReviews / campaign.reviewsPerWeek),
                        })}
                      </p>
                    </div>
                  </div>
                )}

                <div>
                  <div className="mb-2 flex justify-between text-sm">
                    <span>{t('progress.delivered')}</span>
                    <span className="font-semibold">
                      {campaign.totalReviewsDelivered} / {campaign.targetReviews}
                    </span>
                  </div>
                  <Progress value={progressPercentage} />
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm md:grid-cols-5">
                  <div>
                    <p className="text-muted-foreground">{t('progress.validated')}</p>
                    <p className="text-lg font-bold text-green-600">
                      {campaign.totalReviewsValidated}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">{t('progress.pending')}</p>
                    <p className="text-lg font-bold text-yellow-600">
                      {campaign.totalReviewsPending}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">{t('progress.rejected')}</p>
                    <p className="text-lg font-bold text-red-600">
                      {campaign.totalReviewsRejected}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">{t('progress.expired')}</p>
                    <p className="text-lg font-bold text-gray-500">
                      {campaign.totalReviewsExpired}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">{t('progress.perWeek')}</p>
                    <p className="text-lg font-bold">{campaign.reviewsPerWeek}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* File Uploads */}
          {campaign.status === CampaignStatus.DRAFT && (
            <Card className="animate-fade-up-fast">
              <CardHeader>
                <CardTitle>{t('files.title')}</CardTitle>
                <CardDescription>{t('files.description')}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Ebook Upload */}
                {(campaign.availableFormats === BookFormat.EBOOK ||
                  campaign.availableFormats === BookFormat.BOTH) && (
                  <div className="rounded-md border p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <FileText className="h-8 w-8 text-muted-foreground" />
                        <div>
                          <p className="font-medium">{t('files.ebook')}</p>
                          {campaign.ebookFileName ? (
                            <p className="flex items-center text-sm text-green-600">
                              <Check className="mr-1 h-4 w-4" />
                              {campaign.ebookFileName}
                            </p>
                          ) : (
                            <p className="text-sm text-muted-foreground">
                              {t('files.notUploaded')}
                            </p>
                          )}
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => ebookInputRef.current?.click()}
                        disabled={isUploadingEbook}
                      >
                        {isUploadingEbook ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <>
                            <Upload className="mr-2 h-4 w-4" />
                            {campaign.ebookFileName ? t('files.replace') : t('files.upload')}
                          </>
                        )}
                      </Button>
                      <input
                        ref={ebookInputRef}
                        type="file"
                        accept=".pdf,.epub"
                        className="hidden"
                        onChange={handleEbookUpload}
                      />
                    </div>
                  </div>
                )}

                {/* Audiobook Upload */}
                {(campaign.availableFormats === BookFormat.AUDIOBOOK ||
                  campaign.availableFormats === BookFormat.BOTH) && (
                  <div className="rounded-md border p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Headphones className="h-8 w-8 text-muted-foreground" />
                        <div>
                          <p className="font-medium">{t('files.audiobook')}</p>
                          {campaign.audioBookFileName ? (
                            <p className="flex items-center text-sm text-green-600">
                              <Check className="mr-1 h-4 w-4" />
                              {campaign.audioBookFileName}
                            </p>
                          ) : (
                            <p className="text-sm text-muted-foreground">
                              {t('files.notUploaded')}
                            </p>
                          )}
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => audiobookInputRef.current?.click()}
                        disabled={isUploadingAudiobook}
                      >
                        {isUploadingAudiobook ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <>
                            <Upload className="mr-2 h-4 w-4" />
                            {campaign.audioBookFileName ? t('files.replace') : t('files.upload')}
                          </>
                        )}
                      </Button>
                      <input
                        ref={audiobookInputRef}
                        type="file"
                        accept=".mp3"
                        className="hidden"
                        onChange={handleAudiobookUpload}
                      />
                    </div>
                  </div>
                )}

                {/* Cover Upload */}
                <div className="rounded-md border p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {campaign.coverImageUrl ? (
                        <img
                          src={campaign.coverImageUrl}
                          alt="Book cover"
                          className="h-16 w-12 rounded-sm object-cover"
                        />
                      ) : (
                        <ImageIcon className="h-8 w-8 text-muted-foreground" />
                      )}
                      <div>
                        <p className="font-medium">{t('files.cover')}</p>
                        {campaign.coverImageUrl ? (
                          <p className="flex items-center text-sm text-green-600">
                            <Check className="mr-1 h-4 w-4" />
                            {t('files.uploaded')}
                          </p>
                        ) : (
                          <p className="text-sm text-muted-foreground">{t('files.notUploaded')}</p>
                        )}
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => coverInputRef.current?.click()}
                      disabled={isUploadingCover}
                    >
                      {isUploadingCover ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <>
                          <Upload className="mr-2 h-4 w-4" />
                          {campaign.coverImageUrl ? t('files.replace') : t('files.upload')}
                        </>
                      )}
                    </Button>
                    <input
                      ref={coverInputRef}
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      className="hidden"
                      onChange={handleCoverUpload}
                    />
                  </div>
                </div>

                {/* Synopsis PDF Upload */}
                <div className="rounded-md border p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <FileText className="h-8 w-8 text-muted-foreground" />
                      <div>
                        <p className="font-medium">{t('files.synopsis')}</p>
                        {campaign.synopsisFileName ? (
                          <p className="flex items-center text-sm text-green-600">
                            <Check className="mr-1 h-4 w-4" />
                            {campaign.synopsisFileName}
                          </p>
                        ) : (
                          <p className="text-sm text-muted-foreground">{t('files.synopsisHint')}</p>
                        )}
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => synopsisInputRef.current?.click()}
                      disabled={isUploadingSynopsis}
                    >
                      {isUploadingSynopsis ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <>
                          <Upload className="mr-2 h-4 w-4" />
                          {campaign.synopsisFileName ? t('files.replace') : t('files.upload')}
                        </>
                      )}
                    </Button>
                    <input
                      ref={synopsisInputRef}
                      type="file"
                      accept=".pdf"
                      className="hidden"
                      onChange={handleSynopsisUpload}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Campaign Details */}
          <Card className="animate-fade-up-slow">
            <CardHeader>
              <CardTitle>{t('details.title')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground">{t('details.synopsis')}</p>
                <p className="mt-1">{campaign.synopsis}</p>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">{t('details.genre')}</p>
                  <p className="font-semibold">{campaign.genre}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">{t('details.category')}</p>
                  <p className="font-semibold">{campaign.category}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">{t('details.asin')}</p>
                  <p className="font-semibold">{campaign.asin}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">{t('details.format')}</p>
                  <p className="font-semibold">{campaign.availableFormats}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Public Landing Pages - Milestone 2.2 */}
          {campaign.landingPageEnabled && campaign.publicUrls && (
            <Card className="animate-fade-up-very-slow">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Globe className="h-5 w-5" />
                      Public Landing Pages
                    </CardTitle>
                    <CardDescription>
                      Share these links to let readers discover your campaign
                    </CardDescription>
                  </div>
                  <Badge variant="outline" className="bg-green-50 text-green-700">
                    <Eye className="mr-1 h-3 w-3" />
                    {campaign.totalPublicViews || 0} views
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* View Statistics */}
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-4 rounded-lg bg-muted/50 p-4">
                    <div className="text-center">
                      <p className="text-sm text-muted-foreground">Total Views</p>
                      <p className="text-2xl font-bold">{campaign.totalPublicViews || 0}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm text-muted-foreground">Unique Visitors</p>
                      <p className="text-2xl font-bold text-primary">{campaign.totalUniqueVisitors || 0}</p>
                    </div>
                  </div>

                  {/* Per-language breakdown */}
                  <div className="grid grid-cols-3 gap-4 rounded-lg border p-4">
                    {campaign.landingPageLanguages?.includes('EN') && (
                      <div className="text-center">
                        <p className="text-sm text-muted-foreground">English</p>
                        <p className="text-xl font-bold text-blue-600">
                          {campaign.totalENViews || 0}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {campaign.uniqueENVisitors || 0} unique
                        </p>
                      </div>
                    )}
                    {campaign.landingPageLanguages?.includes('PT') && (
                      <div className="text-center">
                        <p className="text-sm text-muted-foreground">Portuguese</p>
                        <p className="text-xl font-bold text-green-600">
                          {campaign.totalPTViews || 0}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {campaign.uniquePTVisitors || 0} unique
                        </p>
                      </div>
                    )}
                    {campaign.landingPageLanguages?.includes('ES') && (
                      <div className="text-center">
                        <p className="text-sm text-muted-foreground">Spanish</p>
                        <p className="text-xl font-bold text-orange-600">
                          {campaign.totalESViews || 0}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {campaign.uniqueESVisitors || 0} unique
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Public URLs */}
                <div className="space-y-3">
                  <h4 className="font-medium">Shareable Links</h4>
                  {Object.entries(campaign.publicUrls).map(([lang, url]) => (
                    <div key={lang} className="flex items-center gap-2">
                      <Badge variant="outline" className="shrink-0">
                        {lang}
                      </Badge>
                      <Input value={url} readOnly className="font-mono text-sm" />
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          navigator.clipboard.writeText(url);
                        }}
                        title="Copy to clipboard"
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => window.open(url, '_blank')}
                        title="Open in new tab"
                      >
                        <ExternalLink className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>

                {campaign.lastViewedAt && (
                  <p className="text-xs text-muted-foreground">
                    Last viewed:{' '}
                    {new Date(campaign.lastViewedAt).toLocaleString(undefined, {
                      dateStyle: 'medium',
                      timeStyle: 'short',
                    })}
                  </p>
                )}
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Actions - Draft */}
          {campaign.status === CampaignStatus.DRAFT && (
            <Card className="animate-fade-left">
              <CardHeader>
                <CardTitle>{t('actions.title') || 'Actions'}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button
                  className="w-full"
                  disabled={!canActivate()}
                  onClick={() => {
                    setCreditsToAllocate(requiredCredits);
                    setShowActivateDialog(true);
                  }}
                >
                  <Play className="mr-2 h-4 w-4" />
                  {t('actions.activate') || 'Activate Campaign'}
                </Button>

                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => router.push(`/author/campaigns/${campaign.id}/edit`)}
                >
                  <Edit className="mr-2 h-4 w-4" />
                  {t('actions.edit') || 'Edit'}
                </Button>

                <Button
                  variant="destructive"
                  className="w-full"
                  onClick={() => setShowDeleteDialog(true)}
                  disabled={isDeleting}
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  {t('actions.delete') || 'Delete'}
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Actions - Active */}
          {campaign.status === CampaignStatus.ACTIVE && (
            <Card className="animate-fade-left">
              <CardHeader>
                <CardTitle>{t('actions.title') || 'Actions'}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => {
                    pauseCampaign(campaign.id, {
                      onSuccess: () => refetch(),
                    });
                  }}
                  disabled={isPausing}
                >
                  {isPausing ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Pause className="mr-2 h-4 w-4" />
                  )}
                  {t('actions.pause') || 'Pause Campaign'}
                </Button>

                <Link href={`/author/campaigns/${campaign.id}/analytics`} className="block">
                  <Button variant="outline" className="w-full">
                    <BarChart3 className="mr-2 h-4 w-4" />
                    {t('actions.viewAnalytics') || 'View Analytics'}
                  </Button>
                </Link>

                <Button variant="outline" className="w-full" onClick={() => window.print()}>
                  <Download className="mr-2 h-4 w-4" />
                  {t('actions.downloadReport') || 'Download Report'}
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Actions - Paused */}
          {campaign.status === CampaignStatus.PAUSED && (
            <Card className="animate-fade-left">
              <CardHeader>
                <CardTitle>{t('actions.title') || 'Actions'}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button
                  className="w-full"
                  onClick={() => {
                    resumeCampaign(campaign.id, {
                      onSuccess: () => refetch(),
                    });
                  }}
                  disabled={isResuming}
                >
                  {isResuming ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <PlayCircle className="mr-2 h-4 w-4" />
                  )}
                  {t('actions.resume') || 'Resume Campaign'}
                </Button>

                <Link href={`/author/campaigns/${campaign.id}/analytics`} className="block">
                  <Button variant="outline" className="w-full">
                    <BarChart3 className="mr-2 h-4 w-4" />
                    {t('actions.viewAnalytics') || 'View Analytics'}
                  </Button>
                </Link>
              </CardContent>
            </Card>
          )}

          {/* Actions - Completed */}
          {campaign.status === CampaignStatus.COMPLETED && (
            <Card className="animate-fade-left">
              <CardHeader>
                <CardTitle>{t('actions.title') || 'Actions'}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Link href={`/author/campaigns/${campaign.id}/analytics`} className="block">
                  <Button variant="outline" className="w-full">
                    <BarChart3 className="mr-2 h-4 w-4" />
                    {t('actions.viewFinalReport') || 'View Final Report'}
                  </Button>
                </Link>

                <Button variant="outline" className="w-full" onClick={() => window.print()}>
                  <Download className="mr-2 h-4 w-4" />
                  {t('actions.downloadReport') || 'Download Report'}
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Credits Info */}
          <Card className="animate-fade-left-fast">
            <CardHeader>
              <CardTitle>{t('credits.title')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="text-sm text-muted-foreground">{t('credits.allocated')}</p>
                <p className="text-2xl font-bold">{campaign.creditsAllocated}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{t('credits.used')}</p>
                <p className="text-2xl font-bold">{campaign.creditsUsed}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{t('credits.remaining')}</p>
                <p className="text-2xl font-bold">{campaign.creditsRemaining}</p>
              </div>

              {campaign.status === CampaignStatus.DRAFT && (
                <div className="border-t pt-3">
                  <p className="text-sm text-muted-foreground">{t('credits.required')}</p>
                  <p className="text-xl font-bold text-primary">{requiredCredits}</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {t('credits.yourBalance', {
                      balance: creditBalance?.availableCredits || 0,
                    })}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Activate Dialog */}
      <Dialog open={showActivateDialog} onOpenChange={setShowActivateDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('activate.title')}</DialogTitle>
            <DialogDescription>{t('activate.description')}</DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="credits">{t('activate.creditsLabel')}</Label>
              <Input
                id="credits"
                type="number"
                value={creditsToAllocate}
                onChange={(e) => setCreditsToAllocate(parseInt(e.target.value) || 0)}
                min={requiredCredits}
              />
              <p className="mt-1 text-sm text-muted-foreground">
                {t('activate.minimum', { min: requiredCredits })}
              </p>
            </div>

            <div className="rounded-sm bg-muted p-3 text-sm">
              <p>{t('activate.info')}</p>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowActivateDialog(false)}
              disabled={isActivating}
            >
              {t('activate.cancel')}
            </Button>
            <Button onClick={handleActivate} disabled={isActivating}>
              {isActivating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {t('activate.activating')}
                </>
              ) : (
                t('activate.confirm')
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('delete.title')}</DialogTitle>
            <DialogDescription>{t('delete.description')}</DialogDescription>
          </DialogHeader>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowDeleteDialog(false)}
              disabled={isDeleting}
            >
              {t('delete.cancel')}
            </Button>
            <Button variant="destructive" onClick={handleDelete} disabled={isDeleting}>
              {isDeleting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {t('delete.deleting')}
                </>
              ) : (
                t('delete.confirm')
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
