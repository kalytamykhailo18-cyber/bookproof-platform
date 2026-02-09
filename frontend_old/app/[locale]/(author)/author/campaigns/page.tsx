'use client';

import { useMemo, useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { useCampaigns } from '@/hooks/useCampaigns';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Loader2,
  Plus,
  BookOpen,
  Eye,
  Pause,
  Play,
  ChevronRight,
} from 'lucide-react';
import { useRouter, useParams, usePathname } from 'next/navigation';
import Image from 'next/image';
import { CampaignStatus, Campaign } from '@/lib/api/campaigns';

/**
 * Campaign List Page (Section 2.4)
 */
export default function CampaignsListPage() {
  const t = useTranslations('author.campaigns');
  const router = useRouter();
  const params = useParams();
  const pathname = usePathname();
  const locale = (params.locale as string) || 'en';
  const { campaigns, isLoadingCampaigns, pauseCampaign, resumeCampaign, isPausing, isResuming } = useCampaigns();

  const [loadingPath, setLoadingPath] = useState<string | null>(null);
  const [loadingCampaignId, setLoadingCampaignId] = useState<string | null>(null);

  // Reset loading state when navigation completes
  useEffect(() => {
    setLoadingPath(null);
    setLoadingCampaignId(null);
  }, [pathname]);

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

  const formatDate = (dateString: string | Date | undefined) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const calculateProgress = (campaign: Campaign) => {
    if (campaign.targetReviews === 0) return 0;
    return Math.round((campaign.totalReviewsDelivered / campaign.targetReviews) * 100);
  };

  const handlePause = (campaignId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    pauseCampaign(campaignId);
  };

  const handleResume = (campaignId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    resumeCampaign(campaignId);
  };

  const navigateTo = (path: string) => {
    setLoadingPath(path);
    router.push(`/${locale}/author/${path}`);
  };

  // Sort campaigns by created date (newest first)
  const sortedCampaigns = useMemo(() => {
    if (!campaigns || !Array.isArray(campaigns)) return [];
    return [...campaigns].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }, [campaigns]);

  // Page loading skeleton
  if (isLoadingCampaigns) {
    return (
      <div className="container mx-auto space-y-6 px-4 py-8">
        <div className="flex items-center justify-between">
          <div>
            <Skeleton className="h-10 w-48 animate-pulse" />
            <Skeleton className="mt-2 h-5 w-72 animate-pulse" />
          </div>
          <Skeleton className="h-10 w-36 animate-pulse" />
        </div>
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-32 animate-pulse" />
            <Skeleton className="h-4 w-48 animate-pulse" />
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <Skeleton key={i} className="h-16 w-full animate-pulse" />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto space-y-6 px-4 py-8">
      {/* Header */}
      <div className="flex animate-fade-up items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">{t('list.title') || 'My Campaigns'}</h1>
          <p className="text-muted-foreground">
            {t('list.subtitle') || 'Manage all your book review campaigns'}
          </p>
        </div>
        <Button
          type="button"
          onClick={() => navigateTo('campaigns/new')}
          disabled={loadingPath === 'campaigns/new'}
        >
          {loadingPath === 'campaigns/new' ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Plus className="mr-2 h-4 w-4" />}
          {t('list.newCampaign') || 'New Campaign'}
        </Button>
      </div>

      {/* Campaigns Table */}
      <Card className="animate-fade-up-fast">
        <CardHeader>
          <CardTitle>{t('list.allCampaigns') || 'All Campaigns'}</CardTitle>
          <CardDescription>
            {t('list.tableDescription') || 'Click on a campaign to view details'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {sortedCampaigns && sortedCampaigns.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[300px]">{t('list.columns.book') || 'Book'}</TableHead>
                  <TableHead>{t('list.columns.status') || 'Status'}</TableHead>
                  <TableHead>{t('list.columns.credits') || 'Credits'}</TableHead>
                  <TableHead>{t('list.columns.reviews') || 'Reviews'}</TableHead>
                  <TableHead className="w-[150px]">{t('list.columns.progress') || 'Progress'}</TableHead>
                  <TableHead>{t('list.columns.created') || 'Created'}</TableHead>
                  <TableHead className="text-right">{t('list.columns.actions') || 'Actions'}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedCampaigns.map((campaign) => {
                  const progress = calculateProgress(campaign);
                  return (
                    <TableRow
                      key={campaign.id}
                      className={`cursor-pointer hover:bg-muted/50 ${loadingCampaignId === campaign.id ? 'pointer-events-none opacity-70' : ''}`}
                      onClick={() => {
                        setLoadingCampaignId(campaign.id);
                        router.push(`/${locale}/author/campaigns/${campaign.id}`);
                      }}
                    >
                      {/* Book Title with Cover */}
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="h-12 w-9 overflow-hidden rounded bg-muted">
                            {campaign.coverImageUrl ? (
                              <Image
                                src={campaign.coverImageUrl}
                                alt={campaign.title}
                                width={36}
                                height={48}
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <div className="flex h-full w-full items-center justify-center">
                                <BookOpen className="h-5 w-5 text-muted-foreground" />
                              </div>
                            )}
                          </div>
                          <div>
                            <p className="font-medium">{campaign.title}</p>
                            <p className="text-sm text-muted-foreground">{campaign.authorName}</p>
                          </div>
                        </div>
                      </TableCell>

                      {/* Status Badge */}
                      <TableCell>
                        <Badge className={getStatusColor(campaign.status)}>
                          {campaign.status}
                        </Badge>
                      </TableCell>

                      {/* Credits Allocated */}
                      <TableCell>
                        <span className="font-medium">{campaign.creditsAllocated}</span>
                        <span className="text-sm text-muted-foreground"> / {campaign.creditsUsed} used</span>
                      </TableCell>

                      {/* Reviews Delivered / Total */}
                      <TableCell>
                        <span className="font-medium">{campaign.totalReviewsDelivered}</span>
                        <span className="text-muted-foreground"> / {campaign.targetReviews}</span>
                      </TableCell>

                      {/* Progress Bar */}
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Progress value={progress} className="h-2 w-24" />
                          <span className="text-sm text-muted-foreground">{progress}%</span>
                        </div>
                      </TableCell>

                      {/* Created Date */}
                      <TableCell className="text-sm text-muted-foreground">
                        {formatDate(campaign.createdAt)}
                      </TableCell>

                      {/* Actions */}
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          {campaign.status === CampaignStatus.ACTIVE && (
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={(e) => handlePause(campaign.id, e)}
                              disabled={isPausing}
                              title={t('list.actions.pause') || 'Pause Campaign'}
                            >
                              {isPausing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Pause className="h-4 w-4" />}
                            </Button>
                          )}
                          {campaign.status === CampaignStatus.PAUSED && (
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={(e) => handleResume(campaign.id, e)}
                              disabled={isResuming}
                              title={t('list.actions.resume') || 'Resume Campaign'}
                            >
                              {isResuming ? <Loader2 className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4" />}
                            </Button>
                          )}
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              setLoadingCampaignId(campaign.id);
                              router.push(`/${locale}/author/campaigns/${campaign.id}`);
                            }}
                            title={t('list.actions.view') || 'View Details'}
                            disabled={loadingCampaignId === campaign.id}
                          >
                            {loadingCampaignId === campaign.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Eye className="h-4 w-4" />}
                          </Button>
                          <ChevronRight className="h-4 w-4 text-muted-foreground" />
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          ) : (
            <div className="flex flex-col items-center justify-center py-12">
              <BookOpen className="mb-4 h-12 w-12 text-muted-foreground" />
              <p className="mb-2 text-lg font-medium">{t('list.noCampaigns') || 'No campaigns yet'}</p>
              <p className="mb-4 text-sm text-muted-foreground">
                {t('list.createFirst') || 'Create your first campaign to get started'}
              </p>
              <Button
                type="button"
                onClick={() => navigateTo('campaigns/new')}
                disabled={loadingPath === 'campaigns/new'}
              >
                {loadingPath === 'campaigns/new' ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Plus className="mr-2 h-4 w-4" />}
                {t('list.newCampaign') || 'New Campaign'}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
