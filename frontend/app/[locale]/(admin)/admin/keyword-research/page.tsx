'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import {
  useKeywordResearchForAdmin,
  useRegenerateKeywordResearch,
  useDownloadKeywordResearchPdf,
} from '@/hooks/useKeywordResearch';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { Loader2, MoreHorizontal, Download, RefreshCw, Eye } from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';
import { formatDate } from '@/lib/utils';
import { KeywordResearchStatus } from '@/lib/api/keywords';

export default function AdminKeywordResearchPage() {
  const t = useTranslations('keyword-research.admin');
  const tCommon = useTranslations('keyword-research');
  const router = useRouter();
  const params = useParams();
  const locale = (params.locale as string) || 'en';

  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [showRegenerateDialog, setShowRegenerateDialog] = useState(false);

  const { data: researches, isLoading } = useKeywordResearchForAdmin();
  const regenerateMutation = useRegenerateKeywordResearch();
  const downloadMutation = useDownloadKeywordResearchPdf();

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

  const handleRegenerate = () => {
    if (selectedId) {
      regenerateMutation.mutate(selectedId);
      setShowRegenerateDialog(false);
      setSelectedId(null);
    }
  };

  const handleDownload = (id: string) => {
    downloadMutation.mutate(id);
  };

  // Filter researches based on status
  const filteredResearches = researches?.filter((research) => {
    if (statusFilter === 'all') return true;
    return research.status.toLowerCase() === statusFilter.toLowerCase();
  });

  // Calculate stats
  const stats = {
    total: researches?.length || 0,
    processing:
      researches?.filter((r) => r.status === KeywordResearchStatus.PROCESSING).length || 0,
    completed: researches?.filter((r) => r.status === KeywordResearchStatus.COMPLETED).length || 0,
    failed: researches?.filter((r) => r.status === KeywordResearchStatus.FAILED).length || 0,
    revenue: researches?.filter((r) => r.paid).reduce((sum, r) => sum + r.price, 0) || 0,
  };

  return (
    <div className="container mx-auto max-w-7xl px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold">{t('title')}</h1>
        <p className="mt-2 text-muted-foreground">Monitor and manage all keyword research orders</p>
      </div>

      {/* Stats Cards */}
      <div className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-5">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>{t('stats.totalOrders')}</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{stats.total}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>{t('stats.processing')}</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-blue-600">{stats.processing}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>{t('stats.completed')}</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-green-600">{stats.completed}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>{t('stats.failed')}</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-red-600">{stats.failed}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>{t('stats.totalRevenue')}</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-primary">${stats.revenue.toFixed(2)}</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <div className="w-64">
              <label className="mb-2 block text-sm font-medium">Status</label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('filters.all')}</SelectItem>
                  <SelectItem value="pending">{t('filters.pending')}</SelectItem>
                  <SelectItem value="processing">{t('filters.processing')}</SelectItem>
                  <SelectItem value="completed">{t('filters.completed')}</SelectItem>
                  <SelectItem value="failed">{t('filters.failed')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Orders Table */}
      <Card>
        <CardHeader>
          <CardTitle>Keyword Research Orders</CardTitle>
          <CardDescription>
            {filteredResearches?.length || 0} orders{' '}
            {statusFilter !== 'all' && `(filtered by ${statusFilter})`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : !filteredResearches || filteredResearches.length === 0 ? (
            <div className="py-12 text-center">
              <p className="text-muted-foreground">No orders found</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t('table.bookTitle')}</TableHead>
                  <TableHead>{t('table.status')}</TableHead>
                  <TableHead>{t('table.price')}</TableHead>
                  <TableHead>{t('table.paid')}</TableHead>
                  <TableHead>{t('table.createdAt')}</TableHead>
                  <TableHead>{t('table.completedAt')}</TableHead>
                  <TableHead className="text-right">{t('table.actions')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredResearches.map((research) => (
                  <TableRow key={research.id}>
                    <TableCell className="font-medium">{research.bookTitle}</TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(research.status)}>
                        {tCommon(`status.${research.status.toLowerCase()}`)}
                      </Badge>
                    </TableCell>
                    <TableCell>${research.price.toFixed(2)}</TableCell>
                    <TableCell>
                      {research.paid ? (
                        <Badge
                          variant="outline"
                          className="border-green-200 bg-green-50 text-green-700"
                        >
                          Yes
                        </Badge>
                      ) : (
                        <Badge
                          variant="outline"
                          className="border-yellow-200 bg-yellow-50 text-yellow-700"
                        >
                          No
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>{formatDate(research.createdAt)}</TableCell>
                    <TableCell>
                      {research.completedAt ? formatDate(research.completedAt) : '-'}
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => router.push(`/${locale}/author/keyword-research/${research.id}`)}>
                            <Eye className="mr-2 h-4 w-4" />
                            {t('actions.view')}
                          </DropdownMenuItem>
                          {research.status === KeywordResearchStatus.COMPLETED &&
                            research.pdfUrl && (
                              <DropdownMenuItem onClick={() => handleDownload(research.id)}>
                                <Download className="mr-2 h-4 w-4" />
                                {t('actions.downloadPdf')}
                              </DropdownMenuItem>
                            )}
                          <DropdownMenuItem
                            onClick={() => {
                              setSelectedId(research.id);
                              setShowRegenerateDialog(true);
                            }}
                          >
                            <RefreshCw className="mr-2 h-4 w-4" />
                            {t('actions.regenerate')}
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Regenerate Confirmation Dialog */}
      <AlertDialog open={showRegenerateDialog} onOpenChange={setShowRegenerateDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Regenerate Keyword Research</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to regenerate this keyword research? This will create new
              AI-generated keywords and a new PDF report.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleRegenerate} disabled={regenerateMutation.isPending}>
              {regenerateMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Regenerating...
                </>
              ) : (
                'Regenerate'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
