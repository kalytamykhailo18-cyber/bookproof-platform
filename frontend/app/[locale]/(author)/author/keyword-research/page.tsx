'use client';

import { useTranslations } from 'next-intl';
import {
  useKeywordResearchForAuthor,
  useDownloadKeywordResearchPdf,
} from '@/hooks/useKeywordResearch';
import { usePublicKeywordResearchPricing } from '@/hooks/useSettings';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Loader2, Plus, Download, Eye, FileText } from 'lucide-react';
import { useRouter, useParams } from 'next/navigation';
import { formatDate } from '@/lib/utils';
import { KeywordResearchStatus } from '@/lib/api/keywords';

export default function KeywordResearchListPage() {
  const t = useTranslations('keyword-research');
  const router = useRouter();
  const params = useParams();
  const locale = (params.locale as string) || 'en';
  const { data: researches, isLoading } = useKeywordResearchForAuthor();
  const { data: pricing } = usePublicKeywordResearchPricing();
  const downloadMutation = useDownloadKeywordResearchPdf();

  // Get dynamic price from settings, fallback to $49.99
  const currentPrice = pricing?.price ?? 49.99;
  const currency = pricing?.currency ?? 'USD';

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

  const handleDownload = (id: string) => {
    downloadMutation.mutate(id);
  };

  return (
    <div className="container mx-auto max-w-7xl px-4 py-8">
      {/* Header */}
      <div className="mb-8 flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold">{t('list.title')}</h1>
          <p className="mt-2 text-muted-foreground">{t('subtitle')}</p>
        </div>
        <Button onClick={() => router.push(`/${locale}/author/keyword-research/new`)}>
          <Plus className="mr-2 h-4 w-4" />
          {t('createNew')}
        </Button>
      </div>

      {/* Pricing Info */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>{t('title')}</CardTitle>
          <CardDescription>{t('subtitle')}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-muted-foreground" />
            <span className="text-lg font-semibold">
              ${currentPrice.toFixed(2)} {currency}
            </span>
            <span className="text-muted-foreground">{t('price')}</span>
          </div>
        </CardContent>
      </Card>

      {/* Orders List */}
      <Card>
        <CardHeader>
          <CardTitle>{t('myOrders')}</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : !researches || researches.length === 0 ? (
            <div className="py-12 text-center">
              <FileText className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
              <h3 className="mb-2 text-lg font-semibold">{t('list.empty')}</h3>
              <p className="mb-6 text-muted-foreground">{t('list.emptyDescription')}</p>
              <Button onClick={() => router.push(`/${locale}/author/keyword-research/new`)}>
                <Plus className="mr-2 h-4 w-4" />
                {t('createNew')}
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t('list.table.bookTitle')}</TableHead>
                  <TableHead>{t('list.table.status')}</TableHead>
                  <TableHead>{t('list.table.price')}</TableHead>
                  <TableHead>{t('list.table.paid')}</TableHead>
                  <TableHead>{t('list.table.createdAt')}</TableHead>
                  <TableHead>{t('list.table.completedAt')}</TableHead>
                  <TableHead className="text-right">{t('list.table.actions')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {researches.map((research) => (
                  <TableRow key={research.id}>
                    <TableCell className="font-medium">{research.bookTitle}</TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(research.status)}>
                        {t(`status.${research.status.toLowerCase()}`)}
                      </Badge>
                    </TableCell>
                    <TableCell>${research.price.toFixed(2)}</TableCell>
                    <TableCell>
                      {research.paid ? (
                        <Badge
                          variant="outline"
                          className="border-green-200 bg-green-50 text-green-700"
                        >
                          {t('list.table.paid')}
                        </Badge>
                      ) : (
                        <Badge
                          variant="outline"
                          className="border-yellow-200 bg-yellow-50 text-yellow-700"
                        >
                          {t('status.pending')}
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>{formatDate(research.createdAt)}</TableCell>
                    <TableCell>
                      {research.completedAt ? formatDate(research.completedAt) : '-'}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => router.push(`/${locale}/author/keyword-research/${research.id}`)}
                        >
                          <Eye className="mr-1 h-4 w-4" />
                          {t('list.actions.view')}
                        </Button>
                        {research.status === KeywordResearchStatus.COMPLETED && research.pdfUrl && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDownload(research.id)}
                            disabled={downloadMutation.isPending}
                          >
                            {downloadMutation.isPending ? (
                              <Loader2 className="mr-1 h-4 w-4 animate-spin" />
                            ) : (
                              <Download className="mr-1 h-4 w-4" />
                            )}
                            {t('list.actions.download')}
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
