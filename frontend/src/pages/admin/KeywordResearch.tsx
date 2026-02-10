import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { keywordsApi } from '@/lib/api/keywords';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow } from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue } from '@/components/ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle } from '@/components/ui/alert-dialog';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle } from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { Loader2, MoreHorizontal, Download, RefreshCw, Eye, X } from 'lucide-react';
import { useParams, useNavigate } from 'react-router-dom';
import { formatDate } from '@/lib/utils';
import { KeywordResearchStatus } from '@/lib/api/keywords';

export function AdminKeywordResearchPage() {
  const { t, i18n } = useTranslation('adminKeywordResearch');
  const { t: tCommon } = useTranslation('keywordResearch');
  const navigate = useNavigate();

  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [showRegenerateDialog, setShowRegenerateDialog] = useState(false);
  const [showDetailDialog, setShowDetailDialog] = useState(false);
  const [loadingResearchId, setLoadingResearchId] = useState<string | null>(null);

  const [researches, setResearches] = useState<any[]>([]);
  const [selectedResearch, setSelectedResearch] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingDetail, setIsLoadingDetail] = useState(false);
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  // Fetch keyword research for admin
  const fetchResearches = async () => {
    try {
      setIsLoading(true);
      const data = await keywordsApi.getAllForAdmin();
      setResearches(data);
    } catch (error: any) {
      console.error('Researches error:', error);
      toast.error(t('messages.loadError'));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchResearches();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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

  const handleRegenerate = async () => {
    if (selectedId) {
      try {
        setIsRegenerating(true);
        const data = await keywordsApi.regenerate(selectedId);
        toast.success(t('messages.regenerateSuccess'));
        setShowRegenerateDialog(false);
        setSelectedId(null);
        // Refetch researches list
        await fetchResearches();
      } catch (error: any) {
        console.error('Regenerate error:', error);
        const message = error.response?.data?.message || t('messages.regenerateError');
        toast.error(message);
      } finally {
        setIsRegenerating(false);
      }
    }
  };

  const handleViewDetails = async (researchId: string) => {
    try {
      setIsLoadingDetail(true);
      setShowDetailDialog(true);
      const data = await keywordsApi.getById(researchId);
      setSelectedResearch(data);
    } catch (error: any) {
      console.error('Fetch detail error:', error);
      toast.error('Failed to load research details');
      setShowDetailDialog(false);
    } finally {
      setIsLoadingDetail(false);
    }
  };

  const handleDownload = async (id: string) => {
    try {
      setIsDownloading(true);
      const data = await keywordsApi.downloadPdf(id);
      // Open PDF in new tab
      window.open(data.url, '_blank');
      toast.success(t('messages.downloadSuccess'));
    } catch (error: any) {
      console.error('Download error:', error);
      const message = error.response?.data?.message || t('messages.downloadError');
      toast.error(message);
    } finally {
      setIsDownloading(false);
    }
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
    revenue: researches?.filter((r) => r.paid).reduce((sum, r) => sum + r.price, 0) || 0 };

  return (
    <div className="container mx-auto max-w-7xl px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold">{t('title')}</h1>
        <p className="mt-2 text-muted-foreground">{t('description')}</p>
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
          <CardTitle>{t('filters.title')}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <div className="w-64">
              <label className="mb-2 block text-sm font-medium">{t('filters.status')}</label>
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
          <CardTitle>{t('table.title')}</CardTitle>
          <CardDescription>
            {t('table.ordersCount', { count: filteredResearches?.length || 0 })}{' '}
            {statusFilter !== 'all' && t('table.filteredBy', { filter: statusFilter })}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : !filteredResearches || filteredResearches.length === 0 ? (
            <div className="py-12 text-center">
              <p className="text-muted-foreground">{t('table.noOrders')}</p>
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
                          {t('paid.yes')}
                        </Badge>
                      ) : (
                        <Badge
                          variant="outline"
                          className="border-yellow-200 bg-yellow-50 text-yellow-700"
                        >
                          {t('paid.no')}
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
                          <DropdownMenuItem
                            onClick={() => handleViewDetails(research.id)}
                          >
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

      {/* Detail Dialog */}
      <Dialog open={showDetailDialog} onOpenChange={setShowDetailDialog}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Keyword Research Details</DialogTitle>
            <DialogDescription>
              View detailed information about this keyword research order
            </DialogDescription>
          </DialogHeader>
          {isLoadingDetail ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : selectedResearch ? (
            <div className="space-y-6">
              {/* Basic Info */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Book Title</label>
                  <p className="mt-1 text-base font-semibold">{selectedResearch.bookTitle}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Status</label>
                  <div className="mt-1">
                    <Badge className={getStatusColor(selectedResearch.status)}>
                      {tCommon(`status.${selectedResearch.status.toLowerCase()}`)}
                    </Badge>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Price</label>
                  <p className="mt-1 text-base">${selectedResearch.price.toFixed(2)}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Paid</label>
                  <div className="mt-1">
                    {selectedResearch.paid ? (
                      <Badge variant="outline" className="border-green-200 bg-green-50 text-green-700">
                        Yes
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="border-yellow-200 bg-yellow-50 text-yellow-700">
                        No
                      </Badge>
                    )}
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Created At</label>
                  <p className="mt-1 text-base">{formatDate(selectedResearch.createdAt)}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Completed At</label>
                  <p className="mt-1 text-base">
                    {selectedResearch.completedAt ? formatDate(selectedResearch.completedAt) : 'Not completed'}
                  </p>
                </div>
              </div>

              {/* Research Details */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Research Information</h3>
                <div className="grid grid-cols-2 gap-4">
                  {selectedResearch.bookSubtitle && (
                    <div className="col-span-2">
                      <label className="text-sm font-medium text-muted-foreground">Subtitle</label>
                      <p className="mt-1 text-base">{selectedResearch.bookSubtitle}</p>
                    </div>
                  )}
                  {selectedResearch.genre && (
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Genre</label>
                      <p className="mt-1 text-base">{selectedResearch.genre}</p>
                    </div>
                  )}
                  {selectedResearch.category && (
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Category</label>
                      <p className="mt-1 text-base">{selectedResearch.category}</p>
                    </div>
                  )}
                  {selectedResearch.description && (
                    <div className="col-span-2">
                      <label className="text-sm font-medium text-muted-foreground">Description</label>
                      <p className="mt-1 text-base">{selectedResearch.description}</p>
                    </div>
                  )}
                  {selectedResearch.targetAudience && (
                    <div className="col-span-2">
                      <label className="text-sm font-medium text-muted-foreground">Target Audience</label>
                      <p className="mt-1 text-base">{selectedResearch.targetAudience}</p>
                    </div>
                  )}
                  {selectedResearch.bookLanguage && (
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Book Language</label>
                      <p className="mt-1 text-base">{selectedResearch.bookLanguage}</p>
                    </div>
                  )}
                  {selectedResearch.targetMarket && (
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Target Market</label>
                      <p className="mt-1 text-base">{selectedResearch.targetMarket}</p>
                    </div>
                  )}
                  {selectedResearch.competingBooks && (
                    <div className="col-span-2">
                      <label className="text-sm font-medium text-muted-foreground">Competing Books</label>
                      <p className="mt-1 text-base whitespace-pre-line">{selectedResearch.competingBooks}</p>
                    </div>
                  )}
                  {selectedResearch.specificKeywords && (
                    <div className="col-span-2">
                      <label className="text-sm font-medium text-muted-foreground">Specific Keywords</label>
                      <p className="mt-1 text-base">{selectedResearch.specificKeywords}</p>
                    </div>
                  )}
                  {selectedResearch.additionalNotes && (
                    <div className="col-span-2">
                      <label className="text-sm font-medium text-muted-foreground">Additional Notes</label>
                      <p className="mt-1 text-base whitespace-pre-line">{selectedResearch.additionalNotes}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Generated Keywords (if completed) */}
              {selectedResearch.status === KeywordResearchStatus.COMPLETED && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Generated Keywords</h3>
                  {selectedResearch.primaryKeywords && selectedResearch.primaryKeywords.length > 0 && (
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Primary Keywords</label>
                      <div className="mt-2 flex flex-wrap gap-2">
                        {selectedResearch.primaryKeywords.map((keyword: string, idx: number) => (
                          <Badge key={idx} variant="default">{keyword}</Badge>
                        ))}
                      </div>
                    </div>
                  )}
                  {selectedResearch.secondaryKeywords && selectedResearch.secondaryKeywords.length > 0 && (
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Secondary Keywords</label>
                      <div className="mt-2 flex flex-wrap gap-2">
                        {selectedResearch.secondaryKeywords.map((keyword: string, idx: number) => (
                          <Badge key={idx} variant="secondary">{keyword}</Badge>
                        ))}
                      </div>
                    </div>
                  )}
                  {selectedResearch.longTailKeywords && selectedResearch.longTailKeywords.length > 0 && (
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Long-tail Keywords</label>
                      <div className="mt-2 flex flex-wrap gap-2">
                        {selectedResearch.longTailKeywords.map((keyword: string, idx: number) => (
                          <Badge key={idx} variant="outline">{keyword}</Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Error Message (if failed) */}
              {selectedResearch.status === KeywordResearchStatus.FAILED && selectedResearch.errorMessage && (
                <div className="rounded-md bg-red-50 p-4">
                  <label className="text-sm font-medium text-red-800">Error Message</label>
                  <p className="mt-1 text-sm text-red-700">{selectedResearch.errorMessage}</p>
                </div>
              )}

              {/* PDF Download */}
              {selectedResearch.status === KeywordResearchStatus.COMPLETED && selectedResearch.pdfUrl && (
                <div className="flex justify-end gap-2 pt-4 border-t">
                  <Button onClick={() => handleDownload(selectedResearch.id)} variant="default">
                    <Download className="mr-2 h-4 w-4" />
                    Download PDF
                  </Button>
                </div>
              )}
            </div>
          ) : (
            <p className="text-center text-muted-foreground py-8">No details available</p>
          )}
        </DialogContent>
      </Dialog>

      {/* Regenerate Confirmation Dialog */}
      <AlertDialog open={showRegenerateDialog} onOpenChange={setShowRegenerateDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('regenerateDialog.title')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('regenerateDialog.description')}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('regenerateDialog.cancel')}</AlertDialogCancel>
            <AlertDialogAction onClick={handleRegenerate} disabled={isRegenerating}>
              {isRegenerating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {t('regenerateDialog.regenerating')}
                </>
              ) : (
                t('regenerateDialog.confirm')
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
