'use client';

import { useMemo } from 'react';
import { useTranslations } from 'next-intl';
import { useCredits } from '@/hooks/useCredits';
import { useCampaigns } from '@/hooks/useCampaigns';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, Plus, CreditCard, BookOpen, TrendingUp, Activity, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';
import { CampaignStatus } from '@/lib/api/campaigns';

export default function AuthorDashboardPage() {
  const t = useTranslations('author.dashboard');
  const { creditBalance, isLoadingBalance } = useCredits();
  const { campaigns, isLoadingCampaigns } = useCampaigns();

  // Calculate campaign statistics per requirements.md Section 2.1
  const campaignStats = useMemo(() => {
    if (!campaigns) return { active: 0, completed: 0 };
    return {
      active: campaigns.filter(c => c.status === CampaignStatus.ACTIVE).length,
      completed: campaigns.filter(c => c.status === CampaignStatus.COMPLETED).length,
    };
  }, [campaigns]);

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

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8 flex animate-fade-up items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">{t('title')}</h1>
          <p className="mt-2 text-muted-foreground">{t('subtitle')}</p>
        </div>
        <div className="flex gap-3">
          <Link href="/author/credits">
            <Button variant="outline" className="animate-fade-left">
              <CreditCard className="mr-2 h-4 w-4" />
              {t('buttons.buyCredits')}
            </Button>
          </Link>
          <Link href="/author/campaigns/new">
            <Button
              className="animate-fade-left-fast"
              disabled={!creditBalance?.availableCredits || creditBalance.availableCredits <= 0}
              title={!creditBalance?.availableCredits || creditBalance.availableCredits <= 0
                ? (t('buttons.noCreditsTooltip') || 'Purchase credits to create campaigns')
                : undefined}
            >
              <Plus className="mr-2 h-4 w-4" />
              {t('buttons.newCampaign')}
            </Button>
          </Link>
        </div>
      </div>

      {/* Credit Balance Cards */}
      <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-3">
        <Card className="animate-fade-up-fast">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('creditBalance.available')}</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoadingBalance ? (
              <Loader2 className="h-8 w-8 animate-spin" />
            ) : (
              <>
                <div className="text-2xl font-bold">{creditBalance?.availableCredits || 0}</div>
                <p className="mt-1 text-xs text-muted-foreground">
                  {t('creditBalance.totalPurchased', {
                    total: creditBalance?.totalCreditsPurchased || 0,
                  })}
                </p>
              </>
            )}
          </CardContent>
        </Card>

        <Card className="animate-fade-up-light-slow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('creditBalance.used')}</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoadingBalance ? (
              <Loader2 className="h-8 w-8 animate-spin" />
            ) : (
              <>
                <div className="text-2xl font-bold">{creditBalance?.totalCreditsUsed || 0}</div>
                <p className="mt-1 text-xs text-muted-foreground">{t('creditBalance.allocated')}</p>
              </>
            )}
          </CardContent>
        </Card>

        <Card className="animate-fade-up-slow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('creditBalance.expiring')}</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoadingBalance ? (
              <Loader2 className="h-8 w-8 animate-spin" />
            ) : (
              <>
                <div className="text-2xl font-bold">{creditBalance?.expiringCredits || 0}</div>
                <p className="mt-1 text-xs text-muted-foreground">
                  {creditBalance?.nextExpirationDate
                    ? t('creditBalance.expiresOn', {
                        date: new Date(creditBalance.nextExpirationDate).toLocaleDateString(),
                      })
                    : t('creditBalance.noExpiration')}
                </p>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Campaign Stats Cards - per requirements.md Section 2.1 */}
      <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-2">
        <Card className="animate-zoom-in-fast">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('campaignStats.active') || 'Active Campaigns'}</CardTitle>
            <Activity className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            {isLoadingCampaigns ? (
              <Loader2 className="h-8 w-8 animate-spin" />
            ) : (
              <>
                <div className="text-2xl font-bold text-green-600">{campaignStats.active}</div>
                <p className="mt-1 text-xs text-muted-foreground">
                  {t('campaignStats.activeDescription') || 'Currently running campaigns'}
                </p>
              </>
            )}
          </CardContent>
        </Card>

        <Card className="animate-zoom-in">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('campaignStats.completed') || 'Completed Campaigns'}</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            {isLoadingCampaigns ? (
              <Loader2 className="h-8 w-8 animate-spin" />
            ) : (
              <>
                <div className="text-2xl font-bold text-blue-600">{campaignStats.completed}</div>
                <p className="mt-1 text-xs text-muted-foreground">
                  {t('campaignStats.completedDescription') || 'Successfully finished campaigns'}
                </p>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Campaigns List */}
      <div className="animate-fade-up-very-slow">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-2xl font-semibold">{t('campaigns.title')}</h2>
        </div>

        {isLoadingCampaigns ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        ) : campaigns && campaigns.length > 0 ? (
          <div className="grid grid-cols-1 gap-4">
            {campaigns.map((campaign, index) => {
              const animationClass = index % 2 === 0 ? 'animate-fade-left' : 'animate-fade-right';

              return (
                <Link key={campaign.id} href={`/author/campaigns/${campaign.id}`}>
                  <Card
                    className={`cursor-pointer transition-shadow hover:shadow-md ${animationClass}`}
                  >
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="text-xl">{campaign.title}</CardTitle>
                          <CardDescription className="mt-1">
                            {campaign.authorName} • {campaign.language}
                          </CardDescription>
                        </div>
                        <Badge className={getStatusColor(campaign.status)}>{campaign.status}</Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 gap-4 text-sm md:grid-cols-5">
                        <div>
                          <p className="text-muted-foreground">{t('campaigns.targetReviews')}</p>
                          <p className="font-semibold">{campaign.targetReviews}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">{t('campaigns.delivered')}</p>
                          <p className="font-semibold">{campaign.totalReviewsDelivered}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">{t('campaigns.pending')}</p>
                          <p className="font-semibold text-yellow-600">
                            {campaign.totalReviewsPending}
                          </p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">{t('campaigns.creditsAllocated')}</p>
                          <p className="font-semibold">{campaign.creditsAllocated}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">{t('campaigns.format')}</p>
                          <p className="font-semibold">{campaign.availableFormats}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>
        ) : (
          <Card className="animate-zoom-in">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <BookOpen className="mb-4 h-12 w-12 text-muted-foreground" />
              <p className="mb-2 text-lg font-medium">{t('campaigns.noCampaigns')}</p>
              <p className="mb-4 text-sm text-muted-foreground">{t('campaigns.createFirst')}</p>
              <Link href="/author/campaigns/new">
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  {t('buttons.newCampaign')}
                </Button>
              </Link>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
