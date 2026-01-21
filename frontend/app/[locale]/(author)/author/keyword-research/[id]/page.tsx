'use client';

import { useTranslations } from 'next-intl';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { useEffect } from 'react';
import {
  useKeywordResearch,
  useDownloadKeywordResearchPdf,
  useKeywordResearchCheckout,
} from '@/hooks/useKeywordResearch';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import {
  Loader2,
  Download,
  AlertCircle,
  Clock,
  CheckCircle2,
  XCircle,
  Edit,
  CreditCard,
  AlertTriangle,
} from 'lucide-react';
import { formatDate } from '@/lib/utils';
import { KeywordResearchStatus, TargetMarket } from '@/lib/api/keywords';
import { toast } from 'sonner';

export default function KeywordResearchDetailsPage() {
  const t = useTranslations('keyword-research.details');
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const id = params.id as string;
  const locale = (params.locale as string) || 'en';

  const { data: research, isLoading, refetch } = useKeywordResearch(id);
  const downloadMutation = useDownloadKeywordResearchPdf();
  const checkoutMutation = useKeywordResearchCheckout();

  // Handle payment success/cancel query params
  useEffect(() => {
    const success = searchParams.get('success');
    const cancelled = searchParams.get('cancelled');

    if (success === 'true') {
      toast.success('Payment successful! Your keyword research is being processed.');
      // Refetch to get updated status
      refetch();
      // Clean up URL
      router.replace(`/${locale}/author/keyword-research/${id}`);
    } else if (cancelled === 'true') {
      toast.error('Payment was cancelled. Please try again.');
      router.replace(`/${locale}/author/keyword-research/${id}`);
    }
  }, [searchParams, id, router, refetch]);

  const handleDownload = () => {
    downloadMutation.mutate(id);
  };

  const handleEdit = () => {
    router.push(`/${locale}/author/keyword-research/${id}/edit`);
  };

  const handlePayNow = () => {
    const baseUrl = window.location.origin;
    checkoutMutation.mutate({
      id,
      data: {
        successUrl: `${baseUrl}/author/keyword-research/${id}?success=true`,
        cancelUrl: `${baseUrl}/author/keyword-research/${id}?cancelled=true`,
      },
    });
  };

  const getStatusColor = (status: KeywordResearchStatus) => {
    switch (status) {
      case KeywordResearchStatus.PENDING:
        return 'bg-yellow-500';
      case KeywordResearchStatus.PROCESSING:
        return 'bg-blue-500';
      case KeywordResearchStatus.COMPLETED:
        return 'bg-green-500';
      case KeywordResearchStatus.FAILED:
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getStatusIcon = (status: KeywordResearchStatus) => {
    switch (status) {
      case KeywordResearchStatus.PENDING:
        return <Clock className="h-5 w-5" />;
      case KeywordResearchStatus.PROCESSING:
        return <Loader2 className="h-5 w-5 animate-spin" />;
      case KeywordResearchStatus.COMPLETED:
        return <CheckCircle2 className="h-5 w-5" />;
      case KeywordResearchStatus.FAILED:
        return <XCircle className="h-5 w-5" />;
      default:
        return null;
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto max-w-7xl px-4 py-8">
        <div className="flex min-h-[400px] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </div>
    );
  }

  if (!research) {
    return (
      <div className="container mx-auto max-w-7xl px-4 py-8">
        <Card>
          <CardContent className="py-12">
            <div className="text-center">
              <AlertCircle className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
              <h3 className="mb-2 text-lg font-semibold">Keyword research not found</h3>
              <p className="text-muted-foreground">
                The requested keyword research could not be found.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-7xl px-4 py-8">
      {/* Header */}
      <div className="mb-8 flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold">{t('title')}</h1>
          <p className="mt-2 text-muted-foreground">{research.bookTitle}</p>
        </div>
        <div className="flex gap-2">
          {/* Edit button - only for PENDING status */}
          {research.status === KeywordResearchStatus.PENDING && (
            <Button type="button" variant="outline" onClick={handleEdit}>
              <Edit className="mr-2 h-4 w-4" />
              {t('edit')}
            </Button>
          )}
          {/* Pay Now button - for PENDING status with unpaid orders */}
          {research.status === KeywordResearchStatus.PENDING &&
            !research.paid &&
            research.price > 0 && (
              <Button type="button" onClick={handlePayNow} disabled={checkoutMutation.isPending}>
                {checkoutMutation.isPending ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <CreditCard className="mr-2 h-4 w-4" />
                )}
                Pay Now (${research.price.toFixed(2)})
              </Button>
            )}
          {/* Download button - only for COMPLETED status */}
          {research.status === KeywordResearchStatus.COMPLETED && research.pdfUrl && (
            <Button type="button" onClick={handleDownload} disabled={downloadMutation.isPending}>
              {downloadMutation.isPending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Download className="mr-2 h-4 w-4" />
              )}
              {t('downloadPdf')}
            </Button>
          )}
        </div>
      </div>

      {/* Payment Pending Alert */}
      {research.status === KeywordResearchStatus.PENDING &&
        !research.paid &&
        research.price > 0 && (
          <Alert variant="destructive" className="mb-6">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Payment Required</AlertTitle>
            <AlertDescription>
              Your keyword research order is awaiting payment. Please complete payment to start
              processing. Amount due: <strong>${research.price.toFixed(2)}</strong>
            </AlertDescription>
          </Alert>
        )}

      {/* Status Banner */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex items-center gap-4">
            <div className={`rounded-full p-3 ${getStatusColor(research.status)} text-white`}>
              {getStatusIcon(research.status)}
            </div>
            <div className="flex-1">
              <div className="mb-1 flex items-center gap-2">
                <h3 className="font-semibold">{t('status')}</h3>
                <Badge className={getStatusColor(research.status)}>
                  {research.status === KeywordResearchStatus.PENDING && !research.paid
                    ? 'PENDING PAYMENT'
                    : research.status}
                </Badge>
              </div>
              {research.status === KeywordResearchStatus.PROCESSING && (
                <p className="text-sm text-muted-foreground">{t('processing')}</p>
              )}
              {research.status === KeywordResearchStatus.FAILED && (
                <p className="text-sm text-red-600">
                  {t('failed')} {research.errorMessage && `- ${research.errorMessage}`}
                </p>
              )}
              {research.status === KeywordResearchStatus.COMPLETED &&
                research.downloadCount > 0 && (
                  <p className="text-sm text-muted-foreground">
                    {t('downloadCount', { count: research.downloadCount })}
                  </p>
                )}
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Book Information */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>{t('bookInfo')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground">Title</p>
                <p className="font-medium">{research.bookTitle}</p>
              </div>
              <div className="my-2 border-t" />
              <div>
                <p className="text-sm text-muted-foreground">Genre</p>
                <p className="font-medium">{research.genre}</p>
              </div>
              <div className="my-2 border-t" />
              <div>
                <p className="text-sm text-muted-foreground">Category</p>
                <p className="font-medium">{research.category}</p>
              </div>
              <div className="my-2 border-t" />
              <div>
                <p className="text-sm text-muted-foreground">Language</p>
                <p className="font-medium">{research.bookLanguage}</p>
              </div>
              <div className="my-2 border-t" />
              <div>
                <p className="text-sm text-muted-foreground">{t('targetMarket')}</p>
                <p className="font-medium">
                  {research.targetMarket === TargetMarket.US
                    ? t('targetMarketUS')
                    : t('targetMarketBR')}
                </p>
              </div>
              <div className="my-2 border-t" />
              <div>
                <p className="text-sm text-muted-foreground">Target Audience</p>
                <p className="font-medium">{research.targetAudience}</p>
              </div>
            </CardContent>
          </Card>

          <Card className="mt-6">
            <CardHeader>
              <CardTitle>{t('orderInfo')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground">{t('orderId')}</p>
                <p className="font-mono text-sm">{research.id}</p>
              </div>
              <div className="my-2 border-t" />
              <div>
                <p className="text-sm text-muted-foreground">{t('createdAt')}</p>
                <p className="font-medium">{formatDate(research.createdAt)}</p>
              </div>
              {research.completedAt && (
                <>
                  <div className="my-2 border-t" />
                  <div>
                    <p className="text-sm text-muted-foreground">{t('completedAt')}</p>
                    <p className="font-medium">{formatDate(research.completedAt)}</p>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Keywords */}
        <div className="space-y-6 lg:col-span-2">
          {research.status === KeywordResearchStatus.COMPLETED && (
            <>
              {/* Primary Keywords */}
              {research.primaryKeywords && research.primaryKeywords.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>{t('keywords.primary.title')}</CardTitle>
                    <CardDescription>{t('keywords.primary.description')}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {research.primaryKeywords.map((keyword, index) => (
                        <Badge key={index} variant="outline" className="px-3 py-1 text-base">
                          {keyword}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Secondary Keywords */}
              {research.secondaryKeywords && research.secondaryKeywords.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>{t('keywords.secondary.title')}</CardTitle>
                    <CardDescription>{t('keywords.secondary.description')}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {research.secondaryKeywords.map((keyword, index) => (
                        <Badge key={index} variant="outline" className="px-3 py-1">
                          {keyword}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Long-tail Keywords */}
              {research.longTailKeywords && research.longTailKeywords.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>{t('keywords.longTail.title')}</CardTitle>
                    <CardDescription>{t('keywords.longTail.description')}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
                      {research.longTailKeywords.map((keyword, index) => (
                        <div
                          key={index}
                          className="rounded-md border bg-muted/50 px-3 py-2 text-sm"
                        >
                          {keyword}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Usage Guidelines */}
              {research.usageGuidelines && research.usageGuidelines.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>{t('usage.title')}</CardTitle>
                    <CardDescription>{t('usage.howToUse')}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {research.usageGuidelines.map((guideline, index) => (
                      <div key={index} className="border-l-4 border-primary py-2 pl-4">
                        <h4 className="mb-2 font-semibold">{guideline.location}</h4>
                        <p className="mb-2 text-sm text-muted-foreground">
                          {guideline.instruction}
                        </p>
                        {guideline.examples && guideline.examples.length > 0 && (
                          <div className="mt-2 space-y-1">
                            <p className="text-xs font-medium text-muted-foreground">Examples:</p>
                            {guideline.examples.map((example, exampleIndex) => (
                              <p key={exampleIndex} className="text-sm italic">
                                "{example}"
                              </p>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </CardContent>
                </Card>
              )}

              {/* KDP Backend Keywords */}
              {research.kdpSuggestions && research.kdpSuggestions.backendKeywords && (
                <Card>
                  <CardHeader>
                    <CardTitle>{t('kdp.title')}</CardTitle>
                    <CardDescription>{t('kdp.description')}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {research.kdpSuggestions.backendKeywords.map((keyword, index) => (
                      <div
                        key={index}
                        className="rounded-md border-2 border-dashed p-3 font-mono text-sm"
                      >
                        <span className="mr-2 text-muted-foreground">
                          {t('kdp.box', { number: index + 1 })}:
                        </span>
                        {keyword}
                      </div>
                    ))}
                  </CardContent>
                </Card>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
