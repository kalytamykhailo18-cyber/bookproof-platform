import { useState, useMemo, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { adminControlsApi } from '@/lib/api/admin-controls';
import { adminAuthorsApi } from '@/lib/api/admin-authors';
import { toast } from 'sonner';
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
  TableRow } from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle } from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue } from '@/components/ui/select';
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
  Ban,
  ShieldCheck,
  FileText,
  Loader2 } from 'lucide-react';
import type { AuthorListItemDto } from '@/lib/api/admin-controls';

export function AdminAuthorsPage() {
  const { t, i18n } = useTranslation('adminAuthors');
  const navigate = useNavigate();

  const [authors, setAuthors] = useState<AuthorListItemDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [minCredits, setMinCredits] = useState<string>('');
  const [maxCredits, setMaxCredits] = useState<string>('');
  const [selectedAuthor, setSelectedAuthor] = useState<AuthorListItemDto | null>(null);
  const [loadingAuthorId, setLoadingAuthorId] = useState<string | null>(null);

  const [isAddingCredits, setIsAddingCredits] = useState(false);
  const [isRemovingCredits, setIsRemovingCredits] = useState(false);
  const [isSuspending, setIsSuspending] = useState(false);
  const [isUnsuspending, setIsUnsuspending] = useState(false);
  const [isUpdatingNotes, setIsUpdatingNotes] = useState(false);
  const [addCreditsDialogOpen, setAddCreditsDialogOpen] = useState(false);
  const [removeCreditsDialogOpen, setRemoveCreditsDialogOpen] = useState(false);
  const [creditsAmount, setCreditsAmount] = useState('');
  const [creditReason, setCreditReason] = useState('');
  const [creditNotes, setCreditNotes] = useState('');
  const [activationWindowDays, setActivationWindowDays] = useState('30');
  const [suspendDialogOpen, setSuspendDialogOpen] = useState(false);
  const [unsuspendDialogOpen, setUnsuspendDialogOpen] = useState(false);
  const [notesDialogOpen, setNotesDialogOpen] = useState(false);
  const [suspendReason, setSuspendReason] = useState('');
  const [suspendNotes, setSuspendNotes] = useState('');
  const [adminNotes, setAdminNotes] = useState('');

  // Safety mechanism: prevent duplicate fetches
  const hasFetchedRef = useRef(false);

  // Fetch all authors
  const fetchAuthors = async () => {
    try {
      setIsLoading(true);
      const data = await adminControlsApi.getAllAuthors();
      setAuthors(data);
    } catch (error: any) {
      console.error('Authors error:', error);
      toast.error(t('toast.loadFailed'));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // Only fetch once on mount
    if (!hasFetchedRef.current) {
      hasFetchedRef.current = true;
      fetchAuthors();
    }
  }, []);

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
        (statusFilter === 'inactive' && author.activeCampaigns === 0) ||
        (statusFilter === 'suspended' && author.isSuspended);

      const matchesCreditsRange =
        (minCredits === '' || author.availableCredits >= parseInt(minCredits)) &&
        (maxCredits === '' || author.availableCredits <= parseInt(maxCredits));

      return matchesSearch && matchesStatus && matchesCreditsRange;
    });
  }, [authors, searchTerm, statusFilter, minCredits, maxCredits]);

  const stats = useMemo(() => {
    if (!authors)
      return { total: 0, verified: 0, totalCredits: 0, availableCredits: 0, activeCampaigns: 0 };

    return {
      total: authors.length,
      verified: authors.filter((a) => a.isVerified).length,
      totalCredits: authors.reduce((sum, a) => sum + a.totalCreditsPurchased, 0),
      availableCredits: authors.reduce((sum, a) => sum + a.availableCredits, 0),
      activeCampaigns: authors.reduce((sum, a) => sum + a.activeCampaigns, 0) };
  }, [authors]);

  const handleAddCredits = async () => {
    if (selectedAuthor && creditsAmount && creditReason) {
      try {
        setIsAddingCredits(true);
        await adminControlsApi.addCreditsToAuthor(selectedAuthor.id, {
          creditsToAdd: parseInt(creditsAmount),
          reason: creditReason,
          notes: creditNotes || undefined,
          activationWindowDays: activationWindowDays ? parseInt(activationWindowDays) : 30
        });
        toast.success(t('toast.creditsAdded'));
        setAddCreditsDialogOpen(false);
        resetForm();
        await fetchAuthors();
      } catch (error: any) {
        toast.error(error.response?.data?.message || t('toast.creditsAddFailed'));
      } finally {
        setIsAddingCredits(false);
      }
    }
  };

  const handleRemoveCredits = async () => {
    if (selectedAuthor && creditsAmount && creditReason) {
      try {
        setIsRemovingCredits(true);
        await adminControlsApi.removeCreditsFromAuthor(selectedAuthor.id, {
          creditsToRemove: parseInt(creditsAmount),
          reason: creditReason,
          notes: creditNotes || undefined
        });
        toast.success(t('toast.creditsRemoved'));
        setRemoveCreditsDialogOpen(false);
        resetForm();
        await fetchAuthors();
      } catch (error: any) {
        toast.error(error.response?.data?.message || t('toast.creditsRemoveFailed'));
      } finally {
        setIsRemovingCredits(false);
      }
    }
  };

  const resetForm = () => {
    setCreditsAmount('');
    setCreditReason('');
    setCreditNotes('');
    setActivationWindowDays('30');
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

  const handleSuspendAuthor = async () => {
    if (selectedAuthor && suspendReason) {
      try {
        setIsSuspending(true);
        await adminAuthorsApi.suspendAuthor(selectedAuthor.id, {
          reason: suspendReason,
          notes: suspendNotes || undefined
        });
        toast.success(t('toast.authorSuspended'));
        setSuspendDialogOpen(false);
        setSuspendReason('');
        setSuspendNotes('');
        setSelectedAuthor(null);
        await fetchAuthors();
      } catch (error: any) {
        toast.error(error.response?.data?.message || t('toast.authorSuspendFailed'));
      } finally {
        setIsSuspending(false);
      }
    }
  };

  const handleUnsuspendAuthor = async () => {
    if (selectedAuthor && suspendReason) {
      try {
        setIsUnsuspending(true);
        await adminAuthorsApi.unsuspendAuthor(selectedAuthor.id, {
          reason: suspendReason,
          notes: suspendNotes || undefined
        });
        toast.success(t('toast.authorUnsuspended'));
        setUnsuspendDialogOpen(false);
        setSuspendReason('');
        setSuspendNotes('');
        setSelectedAuthor(null);
        await fetchAuthors();
      } catch (error: any) {
        toast.error(error.response?.data?.message || t('toast.authorUnsuspendFailed'));
      } finally {
        setIsUnsuspending(false);
      }
    }
  };

  const handleUpdateNotes = async () => {
    if (selectedAuthor) {
      try {
        setIsUpdatingNotes(true);
        await adminAuthorsApi.updateAdminNotes(selectedAuthor.id, {
          adminNotes: adminNotes
        });
        toast.success(t('toast.notesUpdated'));
        setNotesDialogOpen(false);
        setAdminNotes('');
        setSelectedAuthor(null);
        await fetchAuthors();
      } catch (error: any) {
        toast.error(error.response?.data?.message || t('toast.notesUpdateFailed'));
      } finally {
        setIsUpdatingNotes(false);
      }
    }
  };

  const openSuspendDialog = (author: AuthorListItemDto) => {
    setSelectedAuthor(author);
    setSuspendDialogOpen(true);
  };

  const openUnsuspendDialog = (author: AuthorListItemDto) => {
    setSelectedAuthor(author);
    setUnsuspendDialogOpen(true);
  };

  const openNotesDialog = (author: AuthorListItemDto) => {
    setSelectedAuthor(author);
    setAdminNotes(''); // Could pre-fill with existing notes if available
    setNotesDialogOpen(true);
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
          <div className="flex flex-col gap-4">
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
                    <SelectItem value="suspended">{t('filters.suspended')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex flex-col gap-4 md:flex-row">
              <div className="w-full md:w-1/2">
                <Label htmlFor="min-credits">{t('filters.creditBalanceRange')}</Label>
                <div className="flex gap-2 mt-2">
                  <Input
                    id="min-credits"
                    type="number"
                    min="0"
                    placeholder={t('filters.min')}
                    value={minCredits}
                    onChange={(e) => setMinCredits(e.target.value)}
                  />
                  <Input
                    id="max-credits"
                    type="number"
                    min="0"
                    placeholder={t('filters.max')}
                    value={maxCredits}
                    onChange={(e) => setMaxCredits(e.target.value)}
                  />
                </div>
              </div>
              <div className="flex items-end">
                <Button
                  variant="outline"
                  onClick={() => {
                    setSearchTerm('');
                    setStatusFilter('all');
                    setMinCredits('');
                    setMaxCredits('');
                  }}
                >
                  {t('filters.clearFilters')}
                </Button>
              </div>
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
                  <TableHead>{t('table.company')}</TableHead>
                  <TableHead>{t('table.verified')}</TableHead>
                  <TableHead className="text-right">{t('table.totalCredits')}</TableHead>
                  <TableHead className="text-right">{t('table.available')}</TableHead>
                  <TableHead className="text-right">{t('table.used')}</TableHead>
                  <TableHead className="text-right">{t('table.totalSpent')}</TableHead>
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
                      <div className="text-sm">
                        {author.companyName || <span className="text-muted-foreground italic">N/A</span>}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-1">
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
                        {author.isSuspended && (
                          <Badge className="bg-red-100 text-red-800">
                            <Ban className="mr-1 h-3 w-3" />
                            {t('status.suspended')}
                          </Badge>
                        )}
                      </div>
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
                    <TableCell className="text-right font-semibold">
                      ${(author.totalSpentCents / 100).toFixed(2)}
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge variant="outline">
                        {author.activeCampaigns} / {author.totalCampaigns}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => navigate(`/admin/authors/${author.id}`)}
                          title={t('actions.viewDetails')}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setLoadingAuthorId(author.id);
                            navigate(`/admin/authors/${author.id}/transactions`);
                          }}
                          disabled={loadingAuthorId === author.id}
                          title={t('actions.viewTransactions')}
                        >
                          {loadingAuthorId === author.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <History className="h-4 w-4" />
                          )}
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => openAddCreditsDialog(author)}
                          title={t('actions.addCredits')}
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => openRemoveCreditsDialog(author)}
                          disabled={author.availableCredits === 0}
                          title={t('actions.removeCredits')}
                        >
                          <Minus className="h-4 w-4" />
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => openNotesDialog(author)}
                          title={t('actions.adminNotes')}
                        >
                          <FileText className="h-4 w-4" />
                        </Button>
                        {!author.isSuspended && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => openSuspendDialog(author)}
                            title={t('actions.suspendAuthor')}
                          >
                            <Ban className="h-4 w-4 text-red-600" />
                          </Button>
                        )}
                        {author.isSuspended && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => openUnsuspendDialog(author)}
                            title={t('actions.unsuspendAuthor')}
                          >
                            <ShieldCheck className="h-4 w-4 text-green-600" />
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
            <div className="space-y-2">
              <Label htmlFor="activation-window-days">
                {t('dialogs.addCredits.activationWindow')} *
              </Label>
              <Input
                id="activation-window-days"
                type="number"
                min="1"
                max="365"
                value={activationWindowDays}
                onChange={(e) => setActivationWindowDays(e.target.value)}
                placeholder={t('dialogs.addCredits.activationWindowPlaceholder')}
              />
              <p className="text-sm text-muted-foreground">
                {t('dialogs.addCredits.activationWindowHelp')}
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setAddCreditsDialogOpen(false)}>
              {t('dialogs.cancel')}
            </Button>
            <Button
              type="button"
              onClick={handleAddCredits}
              disabled={!creditsAmount || !creditReason || isAddingCredits}
            >
              {isAddingCredits ? t('dialogs.processing') : t('dialogs.addCredits.confirm')}
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
              disabled={!creditsAmount || !creditReason || isRemovingCredits}
            >
              {isRemovingCredits
                ? t('dialogs.processing')
                : t('dialogs.removeCredits.confirm')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Suspend Author Dialog */}
      <Dialog open={suspendDialogOpen} onOpenChange={setSuspendDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('dialogs.suspend.title')}</DialogTitle>
            <DialogDescription>
              {t('dialogs.suspend.description')}
              {selectedAuthor && (
                <span className="mt-2 block font-semibold">
                  {selectedAuthor.name} ({selectedAuthor.email})
                </span>
              )}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="suspend-reason">{t('dialogs.suspend.reason')} *</Label>
              <Input
                id="suspend-reason"
                value={suspendReason}
                onChange={(e) => setSuspendReason(e.target.value)}
                placeholder={t('dialogs.suspend.reasonPlaceholder')}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="suspend-notes">{t('dialogs.suspend.notes')}</Label>
              <Textarea
                id="suspend-notes"
                value={suspendNotes}
                onChange={(e) => setSuspendNotes(e.target.value)}
                placeholder={t('dialogs.suspend.notesPlaceholder')}
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setSuspendDialogOpen(false)}>
              {t('dialogs.suspend.cancel')}
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={handleSuspendAuthor}
              disabled={!suspendReason || isSuspending}
            >
              {isSuspending ? t('dialogs.suspend.processing') : t('dialogs.suspend.confirm')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Unsuspend Author Dialog */}
      <Dialog open={unsuspendDialogOpen} onOpenChange={setUnsuspendDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('dialogs.unsuspend.title')}</DialogTitle>
            <DialogDescription>
              {t('dialogs.unsuspend.description')}
              {selectedAuthor && (
                <span className="mt-2 block font-semibold">
                  {selectedAuthor.name} ({selectedAuthor.email})
                </span>
              )}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="unsuspend-reason">{t('dialogs.unsuspend.reason')} *</Label>
              <Input
                id="unsuspend-reason"
                value={suspendReason}
                onChange={(e) => setSuspendReason(e.target.value)}
                placeholder={t('dialogs.unsuspend.reasonPlaceholder')}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="unsuspend-notes">{t('dialogs.unsuspend.notes')}</Label>
              <Textarea
                id="unsuspend-notes"
                value={suspendNotes}
                onChange={(e) => setSuspendNotes(e.target.value)}
                placeholder={t('dialogs.unsuspend.notesPlaceholder')}
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setUnsuspendDialogOpen(false)}>
              {t('dialogs.unsuspend.cancel')}
            </Button>
            <Button
              type="button"
              onClick={handleUnsuspendAuthor}
              disabled={!suspendReason || isUnsuspending}
            >
              {isUnsuspending ? t('dialogs.unsuspend.processing') : t('dialogs.unsuspend.confirm')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Admin Notes Dialog */}
      <Dialog open={notesDialogOpen} onOpenChange={setNotesDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('dialogs.adminNotes.title')}</DialogTitle>
            <DialogDescription>
              {t('dialogs.adminNotes.description')}
              {selectedAuthor && (
                <span className="mt-2 block font-semibold">
                  {selectedAuthor.name} ({selectedAuthor.email})
                </span>
              )}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="admin-notes">{t('dialogs.adminNotes.label')}</Label>
              <Textarea
                id="admin-notes"
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
                placeholder={t('dialogs.adminNotes.placeholder')}
                rows={6}
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setNotesDialogOpen(false)}>
              {t('dialogs.adminNotes.cancel')}
            </Button>
            <Button
              type="button"
              onClick={handleUpdateNotes}
              disabled={!adminNotes.trim() || isUpdatingNotes}
            >
              {isUpdatingNotes ? t('dialogs.adminNotes.processing') : t('dialogs.adminNotes.confirm')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
