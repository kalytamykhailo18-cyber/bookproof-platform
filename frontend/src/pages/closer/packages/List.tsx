import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { closerApi, CustomPackageStatus } from '@/lib/api/closer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Plus, Eye, Loader2, Package } from 'lucide-react';
import { toast } from 'sonner';

export function PackagesListPage() {
  const { t } = useTranslation('closer');
  const navigate = useNavigate();

  const [packages, setPackages] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreateLoading, setIsCreateLoading] = useState(false);

  // Fetch packages
  useEffect(() => {
    const fetchPackages = async () => {
      try {
        setIsLoading(true);
        const data = await closerApi.getPackages();
        setPackages(data);
      } catch (error: any) {
        console.error('Packages error:', error);
        toast.error('Failed to load packages');
      } finally {
        setIsLoading(false);
      }
    };
    fetchPackages();
  }, []);

  const getStatusBadge = (status: CustomPackageStatus) => {
    const statusConfig = {
      [CustomPackageStatus.DRAFT]: { label: 'Draft', className: 'bg-gray-100 text-gray-700' },
      [CustomPackageStatus.PENDING_APPROVAL]: { label: 'Pending Approval', className: 'bg-yellow-100 text-yellow-700' },
      [CustomPackageStatus.SENT]: { label: 'Sent', className: 'bg-blue-100 text-blue-700' },
      [CustomPackageStatus.VIEWED]: { label: 'Viewed', className: 'bg-purple-100 text-purple-700' },
      [CustomPackageStatus.PAID]: { label: 'Paid', className: 'bg-green-100 text-green-700' },
      [CustomPackageStatus.EXPIRED]: { label: 'Expired', className: 'bg-red-100 text-red-700' },
      [CustomPackageStatus.CANCELLED]: { label: 'Cancelled', className: 'bg-gray-100 text-gray-700' },
    };
    const config = statusConfig[status] || statusConfig[CustomPackageStatus.DRAFT];
    return <Badge className={config.className}>{config.label}</Badge>;
  };

  const formatCurrency = (amount: number, currency: string = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  if (isLoading) {
    return (
      <div className="container mx-auto space-y-6 px-4 py-8">
        <div className="flex items-center justify-between">
          <Skeleton className="h-9 w-48 animate-pulse" />
          <Skeleton className="h-10 w-36 animate-pulse" />
        </div>
        <Skeleton className="h-96 animate-pulse" />
      </div>
    );
  }

  return (
    <div className="container mx-auto space-y-6 px-4 py-8">
      {/* Header */}
      <div className="flex animate-fade-up items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">{t('packages.title')}</h1>
          <p className="text-muted-foreground">{t('packages.description')}</p>
        </div>
        <Button
          type="button"
          onClick={() => {
            setIsCreateLoading(true);
            navigate('/closer/packages/new');
          }}
          disabled={isCreateLoading}
        >
          {isCreateLoading ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Plus className="mr-2 h-4 w-4" />
          )}
          {t('packages.createNew')}
        </Button>
      </div>

      {/* Packages Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            {t('packages.allPackages')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {packages.length === 0 ? (
            <div className="flex min-h-[200px] flex-col items-center justify-center gap-2 text-center">
              <Package className="h-12 w-12 text-muted-foreground" />
              <p className="text-lg font-medium">{t('packages.noPackages')}</p>
              <p className="text-sm text-muted-foreground">{t('packages.createFirst')}</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t('packages.packageName')}</TableHead>
                  <TableHead>{t('packages.client')}</TableHead>
                  <TableHead>{t('packages.credits')}</TableHead>
                  <TableHead>{t('packages.price')}</TableHead>
                  <TableHead>{t('packages.status')}</TableHead>
                  <TableHead>{t('packages.created')}</TableHead>
                  <TableHead className="text-right">{t('common.actions')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {packages.map((pkg) => (
                  <TableRow key={pkg.id}>
                    <TableCell className="font-medium">{pkg.packageName}</TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{pkg.clientName}</div>
                        <div className="text-sm text-muted-foreground">{pkg.clientEmail}</div>
                      </div>
                    </TableCell>
                    <TableCell>{pkg.credits}</TableCell>
                    <TableCell>{formatCurrency(pkg.price, pkg.currency)}</TableCell>
                    <TableCell>{getStatusBadge(pkg.status)}</TableCell>
                    <TableCell>{formatDate(pkg.createdAt)}</TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => navigate(`/closer/packages/${pkg.id}`)}
                      >
                        <Eye className="mr-2 h-4 w-4" />
                        {t('common.view')}
                      </Button>
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
