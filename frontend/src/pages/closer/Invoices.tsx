import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useCloserInvoices, useCloserInvoiceStats, useCreateInvoice } from '@/hooks/useCloser';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger } from '@/components/ui/dialog';
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
  Plus,
  FileText,
  DollarSign,
  Clock,
  CheckCircle,
  XCircle,
  Copy,
  ExternalLink } from 'lucide-react';
import { PaymentStatus } from '@/lib/api/closer';
import { toast } from 'sonner';

export function InvoicesPage() {
  const { t, i18n } = useTranslation('closer');
  const [statusFilter, setStatusFilter] = useState<PaymentStatus | 'ALL'>('ALL');
  const [createDialogOpen, setCreateDialogOpen] = useState(false);

  const { data: invoices, isLoading } = useCloserInvoices(
    statusFilter === 'ALL' ? undefined : { status: statusFilter },
  );
  const { data: stats, isLoading: statsLoading } = useCloserInvoiceStats();
  const createInvoice = useCreateInvoice();

  const [formData, setFormData] = useState({
    amount: 0,
    currency: 'USD',
    description: '',
    dueDate: '',
    clientName: '',
    clientEmail: '' });

  const handleCreateInvoice = () => {
    createInvoice.mutate(
      {
        amount: formData.amount,
        currency: formData.currency,
        description: formData.description || undefined,
        dueDate: formData.dueDate || undefined,
        clientName: formData.clientName,
        clientEmail: formData.clientEmail },
      {
        onSuccess: () => {
          setCreateDialogOpen(false);
          setFormData({
            amount: 0,
            currency: 'USD',
            description: '',
            dueDate: '',
            clientName: '',
            clientEmail: '' });
        } },
    );
  };

  const copyPaymentLink = (link: string) => {
    navigator.clipboard.writeText(link);
    toast.success('Payment link copied to clipboard');
  };

  const formatCurrency = (amount: number, currency: string = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency }).format(amount);
  };

  const getStatusBadge = (status: PaymentStatus) => {
    switch (status) {
      case PaymentStatus.PENDING:
        return (
          <Badge variant="secondary">
            <Clock className="mr-1 h-3 w-3" />
            {t('status.pending')}
          </Badge>
        );
      case PaymentStatus.COMPLETED:
        return (
          <Badge className="bg-green-500">
            <CheckCircle className="mr-1 h-3 w-3" />
            {t('status.paid')}
          </Badge>
        );
      case PaymentStatus.FAILED:
        return (
          <Badge variant="destructive">
            <XCircle className="mr-1 h-3 w-3" />
            {t('status.failed')}
          </Badge>
        );
      case PaymentStatus.REFUNDED:
        return <Badge variant="outline">{t('status.refunded')}</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const updateField = (field: string, value: string | number) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  if (isLoading || statsLoading) {
    return (
      <div className="container mx-auto space-y-6 px-4 py-8">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <Skeleton className="h-9 w-32 animate-pulse" />
            <Skeleton className="h-5 w-64 animate-pulse" />
          </div>
          <Skeleton className="h-10 w-36 animate-pulse" />
        </div>
        <div className="grid gap-4 md:grid-cols-4">
          <Skeleton className="h-28 animate-pulse" />
          <Skeleton className="h-28 animate-pulse" />
          <Skeleton className="h-28 animate-pulse" />
          <Skeleton className="h-28 animate-pulse" />
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
          <h1 className="text-3xl font-bold">{t('invoices.title')}</h1>
          <p className="text-muted-foreground">{t('invoices.description')}</p>
        </div>
        <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button type="button">
              <Plus className="mr-2 h-4 w-4" />
              {t('invoices.createInvoice')}
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>{t('invoices.createInvoiceDialog.title')}</DialogTitle>
              <DialogDescription>{t('invoices.createInvoiceDialog.description')}</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="clientName">
                    {t('invoices.createInvoiceDialog.clientName')} *
                  </Label>
                  <Input
                    id="clientName"
                    placeholder="John Doe"
                    value={formData.clientName}
                    onChange={(e) => updateField('clientName', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="clientEmail">
                    {t('invoices.createInvoiceDialog.clientEmail')} *
                  </Label>
                  <Input
                    id="clientEmail"
                    type="email"
                    placeholder="john@example.com"
                    value={formData.clientEmail}
                    onChange={(e) => updateField('clientEmail', e.target.value)}
                  />
                </div>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="amount">{t('invoices.createInvoiceDialog.amount')} *</Label>
                  <Input
                    id="amount"
                    type="number"
                    min={0}
                    step={0.01}
                    value={formData.amount}
                    onChange={(e) => updateField('amount', parseFloat(e.target.value) || 0)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="currency">{t('invoices.createInvoiceDialog.currency')}</Label>
                  <Select
                    value={formData.currency}
                    onValueChange={(value) => updateField('currency', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="USD">USD</SelectItem>
                      <SelectItem value="EUR">EUR</SelectItem>
                      <SelectItem value="GBP">GBP</SelectItem>
                      <SelectItem value="BRL">BRL</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">
                  {t('invoices.createInvoiceDialog.invoiceDescription')}
                </Label>
                <Textarea
                  id="description"
                  placeholder={t('invoices.createInvoiceDialog.descriptionPlaceholder')}
                  value={formData.description}
                  onChange={(e) => updateField('description', e.target.value)}
                  rows={2}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="dueDate">{t('invoices.createInvoiceDialog.dueDate')}</Label>
                <Input
                  id="dueDate"
                  type="date"
                  value={formData.dueDate}
                  onChange={(e) => updateField('dueDate', e.target.value)}
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setCreateDialogOpen(false)}>
                {t('common.cancel')}
              </Button>
              <Button
                type="button"
                onClick={handleCreateInvoice}
                disabled={
                  createInvoice.isPending ||
                  !formData.clientName ||
                  !formData.clientEmail ||
                  formData.amount <= 0
                }
              >
                {createInvoice.isPending
                  ? t('invoices.createInvoiceDialog.creating')
                  : t('invoices.createInvoiceDialog.create')}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="animate-fade-up-fast">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('invoices.totalInvoices')}</CardTitle>
            <FileText className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats?.totalInvoices || 0}</div>
          </CardContent>
        </Card>

        <Card className="animate-fade-up-light-slow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('invoices.pending')}</CardTitle>
            <Clock className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{stats?.pending || 0}</div>
            <p className="text-xs text-muted-foreground">
              {formatCurrency(stats?.totalPending || 0)}
            </p>
          </CardContent>
        </Card>

        <Card className="animate-fade-up-slow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('invoices.collected')}</CardTitle>
            <DollarSign className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {formatCurrency(stats?.totalCollected || 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              {stats?.completed || 0} {t('invoices.invoicesPaid')}
            </p>
          </CardContent>
        </Card>

        <Card className="animate-fade-up-very-slow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('invoices.failedRefunded')}</CardTitle>
            <XCircle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {(stats?.failed || 0) + (stats?.refunded || 0)}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex animate-fade-up items-center gap-4">
        <Select
          value={statusFilter}
          onValueChange={(value) => setStatusFilter(value as PaymentStatus | 'ALL')}
        >
          <SelectTrigger className="w-48">
            <SelectValue placeholder={t('invoices.filterByStatus')} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">{t('invoices.allInvoices')}</SelectItem>
            <SelectItem value={PaymentStatus.PENDING}>{t('status.pending')}</SelectItem>
            <SelectItem value={PaymentStatus.COMPLETED}>{t('status.paid')}</SelectItem>
            <SelectItem value={PaymentStatus.FAILED}>{t('status.failed')}</SelectItem>
            <SelectItem value={PaymentStatus.REFUNDED}>{t('status.refunded')}</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Invoices Table */}
      <Card className="animate-zoom-in-slow">
        <CardHeader>
          <CardTitle>{t('invoices.title')}</CardTitle>
          <CardDescription>
            {invoices?.length || 0} {t('invoices.invoicesFound')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {invoices && invoices.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Invoice #</TableHead>
                  <TableHead>{t('common.client')}</TableHead>
                  <TableHead>{t('common.amount')}</TableHead>
                  <TableHead>{t('status.pending')}</TableHead>
                  <TableHead>{t('invoices.createInvoiceDialog.dueDate')}</TableHead>
                  <TableHead>{t('common.date')}</TableHead>
                  <TableHead className="text-right">{t('common.actions')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {invoices.map((invoice, index) => (
                  <TableRow
                    key={invoice.id}
                    className={`animate-fade-up-${index % 2 === 0 ? 'fast' : 'light-slow'}`}
                  >
                    <TableCell className="font-mono text-sm">{invoice.invoiceNumber}</TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">{invoice.clientName || '-'}</p>
                        <p className="text-sm text-muted-foreground">
                          {invoice.clientEmail || '-'}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">
                      {formatCurrency(invoice.amount, invoice.currency)}
                    </TableCell>
                    <TableCell>{getStatusBadge(invoice.paymentStatus)}</TableCell>
                    <TableCell>
                      {invoice.dueDate ? new Date(invoice.dueDate).toLocaleDateString() : '-'}
                    </TableCell>
                    <TableCell>{new Date(invoice.createdAt).toLocaleDateString()}</TableCell>
                    <TableCell className="text-right">
                      {invoice.paymentLink && (
                        <div className="flex justify-end gap-1">
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => copyPaymentLink(invoice.paymentLink!)}
                          >
                            <Copy className="h-4 w-4" />
                          </Button>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => window.open(invoice.paymentLink!, '_blank')}
                          >
                            <ExternalLink className="h-4 w-4" />
                          </Button>
                        </div>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <FileText className="mb-4 h-12 w-12 text-muted-foreground" />
              <p className="text-lg font-medium">{t('invoices.noInvoicesYet')}</p>
              <p className="text-sm text-muted-foreground">{t('invoices.createFirstInvoice')}</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
