import { useState } from 'react';
import { useTranslation } from 'node_modules/react-i18next';
import { useReferralLink, useAffiliateStats } from '@/hooks/useAffiliates';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import { Copy, CheckCircle, MousePointerClick, Users, TrendingUp, Share2, QrCode, Download } from 'lucide-react';

export function AffiliateReferralLinksPage() {
  const { t } = useTranslation('affiliates.referralLinks');
  const { data: referralLinkData, isLoading } = useReferralLink();
  const { data: stats } = useAffiliateStats();
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    if (referralLinkData?.referralLink) {
      await navigator.clipboard.writeText(referralLinkData.referralLink);
      setCopied(true);
      toast.success(t('copied'));
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleShare = (platform: 'twitter' | 'facebook' | 'linkedin' | 'email') => {
    if (!referralLinkData?.referralLink) return;

    const url = referralLinkData.referralLink;
    const text = t('shareText');

    let shareUrl = '';
    switch (platform) {
      case 'twitter':
        shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`;
        break;
      case 'facebook':
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
        break;
      case 'linkedin':
        shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`;
        break;
      case 'email':
        shareUrl = `mailto:?subject=${encodeURIComponent(t('emailSubject'))}&body=${encodeURIComponent(text + '\n\n' + url)}`;
        break;
    }

    if (shareUrl) {
      window.open(shareUrl, '_blank', 'width=600,height=400');
    }
  };

  return (
    <div className="container mx-auto max-w-4xl space-y-6 px-4 py-8">
      {/* Header */}
      <div className="animate-fade-up">
        <h1 className="text-3xl font-bold">{t('title')}</h1>
        <p className="mt-2 text-muted-foreground">{t('description')}</p>
      </div>

      {/* Referral Link Card */}
      {isLoading ? (
        <Skeleton className="h-48 animate-pulse" />
      ) : (
        <Card className="animate-fade-up-fast">
          <CardHeader>
            <CardTitle>{t('yourLink.title')}</CardTitle>
            <CardDescription>{t('yourLink.description')}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Input value={referralLinkData?.referralLink || ''} readOnly className="font-mono" />
              <Button type="button" onClick={handleCopy} variant="outline">
                {copied ? (
                  <>
                    <CheckCircle className="mr-2 h-4 w-4" />
                    {t('copied')}
                  </>
                ) : (
                  <>
                    <Copy className="mr-2 h-4 w-4" />
                    {t('copy')}
                  </>
                )}
              </Button>
            </div>

            {/* Social Share Buttons */}
            <div className="space-y-2">
              <p className="text-sm font-medium">{t('shareTo.title')}</p>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => handleShare('twitter')}
                >
                  <Share2 className="mr-2 h-4 w-4" />
                  Twitter
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => handleShare('facebook')}
                >
                  <Share2 className="mr-2 h-4 w-4" />
                  Facebook
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => handleShare('linkedin')}
                >
                  <Share2 className="mr-2 h-4 w-4" />
                  LinkedIn
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => handleShare('email')}
                >
                  <Share2 className="mr-2 h-4 w-4" />
                  {t('shareTo.email')}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* QR Code Section - Section 6.2 requirement */}
      {!isLoading && referralLinkData?.referralLink && (
        <Card className="animate-fade-up">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <QrCode className="h-5 w-5" />
              {t('qrCode.title') || 'QR Code'}
            </CardTitle>
            <CardDescription>
              {t('qrCode.description') || 'Download and share your referral QR code'}
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center gap-4">
            <div className="rounded-lg bg-white p-4">
              <img
                src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(referralLinkData.referralLink)}`}
                alt="Referral QR Code"
                width={200}
                height={200}
              />
            </div>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=400x400&format=png&data=${encodeURIComponent(referralLinkData.referralLink)}`;
                const link = document.createElement('a');
                link.href = qrUrl;
                link.download = 'referral-qr-code.png';
                link.target = '_blank';
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                toast.success(t('qrCode.downloaded') || 'QR code downloaded!');
              }}
            >
              <Download className="mr-2 h-4 w-4" />
              {t('qrCode.download') || 'Download QR Code'}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Performance Stats */}
      <Card className="animate-fade-up-light-slow">
        <CardHeader>
          <CardTitle>{t('performance.title')}</CardTitle>
          <CardDescription>{t('performance.description')}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-blue-100 p-3 dark:bg-blue-900/30">
                <MousePointerClick className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{t('performance.clicks')}</p>
                <p className="text-2xl font-bold text-blue-600">{stats?.totalClicks || 0}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-green-100 p-3 dark:bg-green-900/30">
                <Users className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{t('performance.conversions')}</p>
                <p className="text-2xl font-bold text-green-600">{stats?.totalConversions || 0}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-purple-100 p-3 dark:bg-purple-900/30">
                <TrendingUp className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{t('performance.conversionRate')}</p>
                <p className="text-2xl font-bold text-purple-600">
                  {stats?.conversionRate.toFixed(1) || 0}%
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* How It Works */}
      <Card className="animate-fade-up-slow">
        <CardHeader>
          <CardTitle>{t('howItWorks.title')}</CardTitle>
        </CardHeader>
        <CardContent>
          <ol className="space-y-3">
            <li className="flex gap-3">
              <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground">
                1
              </span>
              <div>
                <p className="font-medium">{t('howItWorks.step1.title')}</p>
                <p className="text-sm text-muted-foreground">{t('howItWorks.step1.description')}</p>
              </div>
            </li>
            <li className="flex gap-3">
              <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground">
                2
              </span>
              <div>
                <p className="font-medium">{t('howItWorks.step2.title')}</p>
                <p className="text-sm text-muted-foreground">{t('howItWorks.step2.description')}</p>
              </div>
            </li>
            <li className="flex gap-3">
              <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground">
                3
              </span>
              <div>
                <p className="font-medium">{t('howItWorks.step3.title')}</p>
                <p className="text-sm text-muted-foreground">{t('howItWorks.step3.description')}</p>
              </div>
            </li>
            <li className="flex gap-3">
              <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground">
                4
              </span>
              <div>
                <p className="font-medium">{t('howItWorks.step4.title')}</p>
                <p className="text-sm text-muted-foreground">{t('howItWorks.step4.description')}</p>
              </div>
            </li>
          </ol>
        </CardContent>
      </Card>
    </div>
  );
}
