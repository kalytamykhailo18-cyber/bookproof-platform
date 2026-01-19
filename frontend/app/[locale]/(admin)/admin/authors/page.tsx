'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { useAdminControls } from '@/hooks/useAdminControls';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Users,
  CreditCard,
  Plus,
  Minus,
  Search,
  CheckCircle,
  XCircle,
  BookOpen,
  History,
  Filter,
  Eye,
  Settings,
  TrendingUp,
  AlertCircle,
} from 'lucide-react';
import type { AuthorListItemDto } from '@/lib/api/admin-controls';

export default function AdminAuthorsPage() {
  const t = useTranslations('adminAuthors');
  const router = useRouter();
  const { useAllAuthors, addCredits, removeCredits } = useAdminControls();

  const { data: authors, isLoading } = useAllAuthors();

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedAuthor, setSelectedAuthor] = useState<AuthorListItemDto | null>(null);
  const [addCreditsDialogOpen, setAddCreditsDialogOpen] = useState(false);
  const [removeCreditsDialogOpen, setRemoveCreditsDialogOpen] = useState(false);
  const [creditsAmount, setCreditsAmount] = useState('');
  const [creditReason, setCreditReason] = useState('');
  const [creditNotes, setCreditNotes] = useState('');

  const filteredAuthors = useMemo(() => {
    if (!authors) return [];

    return authors.filter((author) => {
      const matchesSearch =
        author.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        author.email.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus =
        statusFilter === 'all' ||
        (statusFilter === 'verified' && author.isVerified) ||
        (statusFilter === 'unverified' && !author.isVerified) ||
        (statusFilter === 'active' && author.activeCampaigns > 0) ||
        (statusFilter === 'inactive' && author.activeCampaigns === 0);

      return matchesSearch && matchesStatus;
    });
  }, [authors, searchTerm, statusFilter]);

  const stats = useMemo(() => {
    if (!authors)
      return { total: 0, verified: 0, totalCredits: 0, availableCredits: 0, activeCampaigns: 0 };

    return {
      total: authors.length,
      verified: authors.filter((a) => a.isVerified).length,
      totalCredits: authors.reduce((sum, a) => sum + a.totalCreditsPurchased, 0),
      availableCredits: authors.reduce((sum, a) => sum + a.availableCredits, 0),
      activeCampaigns: authors.reduce((sum, a) => sum + a.activeCampaigns, 0),
    };
  }, [authors]);

  const handleAddCredits = () => {
    if (selectedAuthor && creditsAmount && creditReason) {
      addCredits.mutate(
        {
          authorProfileId: selectedAuthor.id,
          data: {
            creditsToAdd: parseInt(creditsAmount),
            reason: creditReason,
            notes: creditNotes || undefined,
          },
        },
        {
          onSuccess: () => {
            setAddCreditsDialogOpen(false);
            resetForm();
          },
        },
      );
    }
  };

  const handleRemoveCredits = () => {
    if (selectedAuthor && creditsAmount && creditReason) {
      removeCredits.mutate(
        {
          authorProfileId: selectedAuthor.id,
          data: {
            creditsToRemove: parseInt(creditsAmount),
            reason: creditReason,
            notes: creditNotes || undefined,
          },
        },
        {
          onSuccess: () => {
            setRemoveCreditsDialogOpen(false);
            resetForm();
          },
        },
      );
    }
  };

  const resetForm = () => {
    setCreditsAmount('');
    setCreditReason('');
    setCreditNotes('');
    setSelectedAuthor(null);
  };

  const openAddCreditsDialog = (author: AuthorListItemDto) => {
    setSelectedAuthor(author);
    setAddCreditsDialogOpen(true);
  };

  const openRemoveCreditsDialog = (author: AuthorListItemDto) => {
    setSelectedAuthor(author);
    setRemoveCreditsDialogOpen(true);
  };

  if (isLoading) {
    return (
      <div className="container mx-auto space-y-6 p-6">
        <Skeleton className="h-10 w-64 animate-pulse" />
        <div className="grid gap-4 md:grid-cols-5">
          {[1, 2, 3, 4, 5].map((i) => (
            <Skeleton key={i} className="h-28 animate-pulse" />
          ))}
        </div>
        <Skeleton className="h-24 animate-pulse" />
        <Skeleton className="h-96 animate-pulse" />
      </div>
    );
  }

  return (
    <div className="container mx-auto space-y-6 p-6">
      {/* Header */}
      <div className="animate-fade-up">
        <h1 className="text-3xl font-bold">{t('title')}</h1>
        <p className="text-muted-foreground">{t('subtitle')}</p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-5">
        <Card className="animate-fade-up-fast">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('stats.totalAuthors')}</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">{t('stats.registered')}</p>
          </CardContent>
        </Card>

        <Card className="animate-fade-up-light-slow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('stats.verified')}</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.verified}</div>
            <p className="text-xs text-muted-foreground">{t('stats.verifiedAccounts')}</p>
          </CardContent>
        </Card>

        <Card className="animate-fade-up-medium-slow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('stats.totalCredits')}</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalCredits.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">{t('stats.creditsPurchased')}</p>
          </CardContent>
        </Card>

        <Card className="animate-fade-up-heavy-slow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('stats.availableCredits')}</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {stats.availableCredits.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">{t('stats.creditsAvailable')}</p>
          </CardContent>
        </Card>

        <Card className="animate-fade-up-extra-slow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('stats.activeCampaigns')}</CardTitle>
            <BookOpen className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.activeCampaigns}</div>
            <p className="text-xs text-muted-foreground">{t('stats.runningCampaigns')}</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="animate-zoom-in">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            {t('filters.title')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4 md:flex-row">
            <div className="flex-1 animate-fade-left-fast">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder={t('filters.searchPlaceholder')}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="w-full animate-fade-left-light-slow md:w-48">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder={t('filters.status')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('filters.allStatuses')}</SelectItem>
                  <SelectItem value="verified">{t('filters.verified')}</SelectItem>
                  <SelectItem value="unverified">{t('filters.unverified')}</SelectItem>
                  <SelectItem value="active">{t('filters.withActiveCampaigns')}</SelectItem>
                  <SelectItem value="inactive">{t('filters.noActiveCampaigns')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Authors Table */}
      <Card className="animate-zoom-in-slow">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            {t('table.title')} ({filteredAuthors.length})
          </CardTitle>
          <CardDescription>{t('table.description')}</CardDescription>
        </CardHeader>
        <CardContent>
          {filteredAuthors.length === 0 ? (
            <div className="animate-fade-up py-16 text-center">
              <AlertCircle className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
              <h3 className="text-lg font-semibold">{t('empty.title')}</h3>
              <p className="text-muted-foreground">{t('empty.description')}</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t('table.author')}</TableHead>
                  <TableHead>{t('table.verified')}</TableHead>
                  <TableHead className="text-right">{t('table.totalCredits')}</TableHead>
                  <TableHead className="text-right">{t('table.available')}</TableHead>
                  <TableHead className="text-right">{t('table.used')}</TableHead>
                  <TableHead className="text-center">{t('table.campaigns')}</TableHead>
                  <TableHead className="text-right">{t('table.actions')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAuthors.map((author, index) => (
                  <TableRow
                    key={author.id}
                    className={`animate-fade-up-${['fast', 'light-slow', 'medium-slow', 'heavy-slow'][index % 4]}`}
                  >
                    <TableCell>
                      <div>
                        <div className="font-medium">{author.name}</div>
                        <div className="text-sm text-muted-foreground">{author.email}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      {author.isVerified ? (
                        <Badge className="bg-green-100 text-green-800">
                          <CheckCircle className="mr-1 h-3 w-3" />
                          {t('status.verified')}
                        </Badge>
                      ) : (
                        <Badge className="bg-yellow-100 text-yellow-800">
                          <XCircle className="mr-1 h-3 w-3" />
                          {t('status.unverified')}
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      {author.totalCreditsPurchased.toLocaleString()}
                    </TableCell>
                    <TableCell className="text-right font-semibold text-green-600">
                      {author.availableCredits.toLocaleString()}
                    </TableCell>
                    <TableCell className="text-right text-muted-foreground">
                      {author.totalCreditsUsed.toLocaleString()}
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge variant="outline">
                        {author.activeCampaigns} / {author.totalCampaigns}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button type="button" variant="ghost" size="sm" asChild>
                          <Link href={`/admin/authors/${author.id}/transactions`}>
                            <History className="h-4 w-4" />
                          </Link>
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => openAddCreditsDialog(author)}
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => openRemoveCreditsDialog(author)}
                          disabled={author.availableCredits === 0}
                        >
                          <Minus className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Add Credits Dialog */}
      <Dialog open={addCreditsDialogOpen} onOpenChange={setAddCreditsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('dialogs.addCredits.title')}</DialogTitle>
            <DialogDescription>
              {t('dialogs.addCredits.description')}
              {selectedAuthor && (
                <span className="mt-2 block font-semibold">
                  {selectedAuthor.name} ({selectedAuthor.email})
                </span>
              )}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="add-credits-amount">{t('dialogs.addCredits.amount')} *</Label>
              <Input
                id="add-credits-amount"
                type="number"
                min="1"
                value={creditsAmount}
                onChange={(e) => setCreditsAmount(e.target.value)}
                placeholder={t('dialogs.addCredits.amountPlaceholder')}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="add-credits-reason">{t('dialogs.reason')} *</Label>
              <Input
                id="add-credits-reason"
                value={creditReason}
                onChange={(e) => setCreditReason(e.target.value)}
                placeholder={t('dialogs.reasonPlaceholder')}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="add-credits-notes">{t('dialogs.notes')}</Label>
              <Textarea
                id="add-credits-notes"
                value={creditNotes}
                onChange={(e) => setCreditNotes(e.target.value)}
                placeholder={t('dialogs.notesPlaceholder')}
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setAddCreditsDialogOpen(false)}>
              {t('dialogs.cancel')}
            </Button>
            <Button
              type="button"
              onClick={handleAddCredits}
              disabled={!creditsAmount || !creditReason || addCredits.isPending}
            >
              {addCredits.isPending ? t('dialogs.processing') : t('dialogs.addCredits.confirm')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Remove Credits Dialog */}
      <Dialog open={removeCreditsDialogOpen} onOpenChange={setRemoveCreditsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('dialogs.removeCredits.title')}</DialogTitle>
            <DialogDescription>
              {t('dialogs.removeCredits.description')}
              {selectedAuthor && (
                <span className="mt-2 block font-semibold">
                  {selectedAuthor.name} - {t('dialogs.removeCredits.available')}:{' '}
                  {selectedAuthor.availableCredits}
                </span>
              )}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="remove-credits-amount">{t('dialogs.removeCredits.amount')} *</Label>
              <Input
                id="remove-credits-amount"
                type="number"
                min="1"
                max={selectedAuthor?.availableCredits || 0}
                value={creditsAmount}
                onChange={(e) => setCreditsAmount(e.target.value)}
                placeholder={t('dialogs.removeCredits.amountPlaceholder')}
              />
              {selectedAuthor && (
                <p className="text-xs text-muted-foreground">
                  {t('dialogs.removeCredits.max')}: {selectedAuthor.availableCredits}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="remove-credits-reason">{t('dialogs.reason')} *</Label>
              <Input
                id="remove-credits-reason"
                value={creditReason}
                onChange={(e) => setCreditReason(e.target.value)}
                placeholder={t('dialogs.reasonPlaceholder')}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="remove-credits-notes">{t('dialogs.notes')}</Label>
              <Textarea
                id="remove-credits-notes"
                value={creditNotes}
                onChange={(e) => setCreditNotes(e.target.value)}
                placeholder={t('dialogs.notesPlaceholder')}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setRemoveCreditsDialogOpen(false)}
            >
              {t('dialogs.cancel')}
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={handleRemoveCredits}
              disabled={!creditsAmount || !creditReason || removeCredits.isPending}
            >
              {removeCredits.isPending
                ? t('dialogs.processing')
                : t('dialogs.removeCredits.confirm')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
