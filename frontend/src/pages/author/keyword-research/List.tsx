import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { keywordsApi } from '@/lib/api/keywords';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Plus,
  FileText,
  Clock,
  CheckCircle2,
  XCircle,
  Loader2,
  Eye,
  Trash2,
} from 'lucide-react';
import { formatDate, formatCurrency } from '@/lib/utils';
import { KeywordResearchStatus } from '@/lib/api/keywords';
import { toast } from 'sonner';

export function KeywordResearchListPage() {
  const { t, i18n } = useTranslation('keywordResearch');
  const navigate = useNavigate();

  const [researches, setResearches] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchResearches = async () => {
    try {
      setIsLoading(true);
      const data = await keywordsApi.getAllForAuthor();
      setResearches(data);
    } catch (error: any) {
      console.error('Fetch error:', error);
      toast.error('Failed to load keyword research');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchResearches();
  }, []);

  const handleDelete = async (id: string, bookTitle: string) => {
    if (!confirm(`Are you sure you want to delete the keyword research for "${bookTitle}"? This action cannot be undone.`)) {
      return;
    }

    try {
      setDeletingId(id);
      await keywordsApi.delete(id);
      toast.success('Keyword research deleted successfully');
      // Remove from list
      setResearches((prev) => prev.filter((r) => r.id !== id));
    } catch (error: any) {
      console.error('Delete error:', error);
      const message = error.response?.data?.message || 'Failed to delete keyword research';
      toast.error(message);
    } finally {
      setDeletingId(null);
    }
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
        return <Clock className="h-4 w-4" />;
      case KeywordResearchStatus.PROCESSING:
        return <Loader2 className="h-4 w-4 animate-spin" />;
      case KeywordResearchStatus.COMPLETED:
        return <CheckCircle2 className="h-4 w-4" />;
      case KeywordResearchStatus.FAILED:
        return <XCircle className="h-4 w-4" />;
      default:
        return null;
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto max-w-7xl px-4 py-8">
        <div className="mb-8 flex items-start justify-between">
          <div>
            <Skeleton className="h-10 w-64 animate-pulse" />
            <Skeleton className="mt-2 h-5 w-96 animate-pulse" />
          </div>
          <Skeleton className="h-10 w-48 animate-pulse" />
        </div>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-48 animate-pulse" />
                <Skeleton className="mt-2 h-4 w-32 animate-pulse" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-20 w-full animate-pulse" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-7xl px-4 py-8">
      {/* Header */}
      <div className="mb-8 flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold">Keyword Research</h1>
          <p className="mt-2 text-muted-foreground">
            View and manage your keyword research orders
          </p>
        </div>
        <Button onClick={() => navigate('/author/keyword-research/new')}>
          <Plus className="mr-2 h-4 w-4" />
          New Research
        </Button>
      </div>

      {/* Empty State */}
      {researches.length === 0 && (
        <Card>
          <CardContent className="py-12">
            <div className="text-center">
              <FileText className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
              <h3 className="mb-2 text-lg font-semibold">No keyword research yet</h3>
              <p className="mb-4 text-muted-foreground">
                Get started by creating your first keyword research order
              </p>
              <Button onClick={() => navigate('/author/keyword-research/new')}>
                <Plus className="mr-2 h-4 w-4" />
                Create First Research
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Research List */}
      {researches.length > 0 && (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {researches.map((research) => (
            <Card key={research.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="line-clamp-1">{research.bookTitle}</CardTitle>
                    <CardDescription className="mt-1">
                      {formatDate(research.createdAt)}
                    </CardDescription>
                  </div>
                  <Badge
                    className={`ml-2 ${getStatusColor(research.status)} text-white flex items-center gap-1`}
                  >
                    {getStatusIcon(research.status)}
                    {research.status === KeywordResearchStatus.PENDING && !research.paid
                      ? 'UNPAID'
                      : research.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="text-sm">
                  <p className="text-muted-foreground">Genre: {research.genre}</p>
                  <p className="text-muted-foreground">Target Market: {research.targetMarket}</p>
                </div>

                {research.status === KeywordResearchStatus.PENDING &&
                  !research.paid &&
                  research.price > 0 && (
                    <div className="rounded-md bg-yellow-50 p-2 text-sm text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300">
                      Payment required: {formatCurrency(research.price, research.currency || 'USD', i18n.language)}
                    </div>
                  )}

                {research.status === KeywordResearchStatus.COMPLETED && (
                  <div className="text-sm text-green-600 dark:text-green-400">
                    ✓ PDF Ready for Download
                  </div>
                )}

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => navigate(`/author/keyword-research/${research.id}`)}
                  >
                    <Eye className="mr-2 h-4 w-4" />
                    View Details
                  </Button>
                  {/* Delete button - only for PENDING unpaid orders */}
                  {research.status === KeywordResearchStatus.PENDING && !research.paid && (
                    <Button
                      variant="outline"
                      size="icon"
                      className="text-destructive hover:bg-destructive hover:text-destructive-foreground"
                      onClick={() => handleDelete(research.id, research.bookTitle)}
                      disabled={deletingId === research.id}
                    >
                      {deletingId === research.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Trash2 className="h-4 w-4" />
                      )}
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
