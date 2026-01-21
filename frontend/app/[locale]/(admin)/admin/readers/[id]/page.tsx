'use client';

import { useState } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useAdminReaders } from '@/hooks/useAdminReaders';
import { ContentPreference } from '@/lib/api/readers';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  ArrowLeft,
  User,
  Wallet,
  BookOpen,
  Link as LinkIcon,
  MessageSquare,
  Settings,
  UserX,
  UserCheck,
  Flag,
  FlagOff,
  Plus,
  Minus,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
  Trash2,
  ExternalLink,
  Shield,
} from 'lucide-react';

export default function AdminReaderDetailPage() {
  const t = useTranslations('adminReaders');
  const params = useParams();
  const router = useRouter();
  const locale = (params.locale as string) || 'en';
  const searchParams = useSearchParams();
  const readerId = params.id as string;
  const initialTab = searchParams.get('tab') || 'overview';

  const {
    useReaderDetails,
    useReaderReviewHistory,
    suspendReader,
    unsuspendReader,
    adjustWallet,
    flagReader,
    unflagReader,
    addAdminNote,
    deleteAdminNote,
    verifyAmazonProfile,
  } = useAdminReaders();

  const { data: reader, isLoading } = useReaderDetails(readerId);
  const { data: reviewHistory } = useReaderReviewHistory(readerId, 20);

  // Dialog states
  const [suspendDialogOpen, setSuspendDialogOpen] = useState(false);
  const [unsuspendDialogOpen, setUnsuspendDialogOpen] = useState(false);
  const [walletDialogOpen, setWalletDialogOpen] = useState(false);
  const [flagDialogOpen, setFlagDialogOpen] = useState(false);
  const [unflagDialogOpen, setUnflagDialogOpen] = useState(false);
  const [noteDialogOpen, setNoteDialogOpen] = useState(false);

  // Form states
  const [actionReason, setActionReason] = useState('');
  const [actionNotes, setActionNotes] = useState('');
  const [walletAmount, setWalletAmount] = useState('');
  const [walletType, setWalletType] = useState<'ADD' | 'DEDUCT'>('ADD');
  const [noteContent, setNoteContent] = useState('');

  const handleSuspend = () => {
    if (!actionReason.trim()) return;
    suspendReader.mutate(
      {
        readerProfileId: readerId,
        data: { reason: actionReason, notes: actionNotes || undefined },
      },
      {
        onSuccess: () => {
          setSuspendDialogOpen(false);
          setActionReason('');
          setActionNotes('');
        },
      },
    );
  };

  const handleUnsuspend = () => {
    if (!actionReason.trim()) return;
    unsuspendReader.mutate(
      {
        readerProfileId: readerId,
        data: { reason: actionReason, notes: actionNotes || undefined },
      },
      {
        onSuccess: () => {
          setUnsuspendDialogOpen(false);
          setActionReason('');
          setActionNotes('');
        },
      },
    );
  };

  const handleWalletAdjust = () => {
    const amount = parseFloat(walletAmount);
    if (isNaN(amount) || amount <= 0 || !actionReason.trim()) return;
    // Amount is positive for addition, negative for deduction
    const adjustedAmount = walletType === 'ADD' ? amount : -amount;
    adjustWallet.mutate(
      {
        readerProfileId: readerId,
        data: { amount: adjustedAmount, reason: actionReason, notes: actionNotes || undefined },
      },
      {
        onSuccess: () => {
          setWalletDialogOpen(false);
          setWalletAmount('');
          setActionReason('');
          setActionNotes('');
        },
      },
    );
  };

  const handleFlag = () => {
    if (!actionReason.trim()) return;
    flagReader.mutate(
      {
        readerProfileId: readerId,
        data: { reason: actionReason, notes: actionNotes || undefined },
      },
      {
        onSuccess: () => {
          setFlagDialogOpen(false);
          setActionReason('');
          setActionNotes('');
        },
      },
    );
  };

  const handleUnflag = () => {
    if (!actionReason.trim()) return;
    unflagReader.mutate(
      {
        readerProfileId: readerId,
        data: { reason: actionReason, notes: actionNotes || undefined },
      },
      {
        onSuccess: () => {
          setUnflagDialogOpen(false);
          setActionReason('');
          setActionNotes('');
        },
      },
    );
  };

  const handleAddNote = () => {
    if (!noteContent.trim()) return;
    addAdminNote.mutate(
      { readerProfileId: readerId, data: { content: noteContent } },
      {
        onSuccess: () => {
          setNoteDialogOpen(false);
          setNoteContent('');
        },
      },
    );
  };

  const handleDeleteNote = (noteId: string) => {
    if (confirm(t('notes.confirmDelete'))) {
      deleteAdminNote.mutate({ readerProfileId: readerId, noteId });
    }
  };

  const handleVerifyAmazon = (amazonProfileId: string) => {
    if (confirm(t('amazon.confirmVerify'))) {
      verifyAmazonProfile.mutate({ readerProfileId: readerId, amazonProfileId });
    }
  };

  const getStatusBadge = () => {
    if (!reader) return null;
    if (!reader.isActive) {
      return <Badge className="bg-red-100 text-red-800">{t('status.suspended')}</Badge>;
    }
    if (reader.isFlagged) {
      return <Badge className="bg-yellow-100 text-yellow-800">{t('status.flagged')}</Badge>;
    }
    return <Badge className="bg-green-100 text-green-800">{t('status.active')}</Badge>;
  };

  const getAssignmentStatusBadge = (status: string) => {
    const statusConfig: Record<string, { color: string; icon: React.ReactNode }> = {
      WAITING: { color: 'bg-gray-100 text-gray-800', icon: <Clock className="h-3 w-3" /> },
      SCHEDULED: { color: 'bg-blue-100 text-blue-800', icon: <Clock className="h-3 w-3" /> },
      ACCESS_GRANTED: {
        color: 'bg-purple-100 text-purple-800',
        icon: <CheckCircle className="h-3 w-3" />,
      },
      IN_PROGRESS: { color: 'bg-yellow-100 text-yellow-800', icon: <Clock className="h-3 w-3" /> },
      SUBMITTED: { color: 'bg-blue-100 text-blue-800', icon: <CheckCircle className="h-3 w-3" /> },
      VALIDATED: {
        color: 'bg-green-100 text-green-800',
        icon: <CheckCircle className="h-3 w-3" />,
      },
      REJECTED: { color: 'bg-red-100 text-red-800', icon: <XCircle className="h-3 w-3" /> },
      EXPIRED: { color: 'bg-red-100 text-red-800', icon: <AlertCircle className="h-3 w-3" /> },
    };

    const config = statusConfig[status] || { color: 'bg-gray-100 text-gray-800', icon: null };
    return (
      <Badge className={`${config.color} flex items-center gap-1`}>
        {config.icon}
        {status}
      </Badge>
    );
  };

  if (isLoading) {
    return (
      <div className="container mx-auto space-y-6 p-6">
        <Skeleton className="h-8 w-48 animate-pulse" />
        <Skeleton className="h-10 w-64 animate-pulse" />
        <div className="grid gap-6 md:grid-cols-3">
          <div className="space-y-6 md:col-span-2">
            <Skeleton className="h-64 animate-pulse" />
            <Skeleton className="h-96 animate-pulse" />
          </div>
          <div className="space-y-6">
            <Skeleton className="h-48 animate-pulse" />
            <Skeleton className="h-64 animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  if (!reader) {
    return (
      <div className="container mx-auto p-6">
        <Card className="animate-fade-up">
          <CardContent className="py-16 text-center">
            <AlertCircle className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
            <h3 className="text-lg font-semibold">{t('notFound.title')}</h3>
            <p className="text-muted-foreground">{t('notFound.description')}</p>
            <Button type="button" className="mt-4" onClick={() => router.push(`/${locale}/admin/readers`)}>
              {t('notFound.backToList')}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto space-y-6 p-6">
      {/* Back Button */}
      <div className="animate-fade-right">
        <Button type="button" variant="ghost" size="sm" onClick={() => router.push(`/${locale}/admin/readers`)}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          {t('detail.backToReaders')}
        </Button>
      </div>

      {/* Header */}
      <div className="flex animate-fade-up items-start justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold">{reader.name}</h1>
            {getStatusBadge()}
          </div>
          <p className="text-muted-foreground">{reader.email}</p>
          <p className="text-sm text-muted-foreground">
            {t('detail.joined')}: {new Date(reader.createdAt).toLocaleDateString()}
          </p>
        </div>
        <div className="flex animate-fade-left gap-2">
          {reader.isActive ? (
            <Button
              type="button"
              variant="destructive"
              size="sm"
              onClick={() => setSuspendDialogOpen(true)}
            >
              <UserX className="mr-2 h-4 w-4" />
              {t('actions.suspend')}
            </Button>
          ) : (
            <Button
              type="button"
              variant="default"
              size="sm"
              onClick={() => setUnsuspendDialogOpen(true)}
            >
              <UserCheck className="mr-2 h-4 w-4" />
              {t('actions.unsuspend')}
            </Button>
          )}
          {reader.isFlagged ? (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setUnflagDialogOpen(true)}
            >
              <FlagOff className="mr-2 h-4 w-4" />
              {t('actions.unflag')}
            </Button>
          ) : (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setFlagDialogOpen(true)}
            >
              <Flag className="mr-2 h-4 w-4" />
              {t('actions.flag')}
            </Button>
          )}
        </div>
      </div>

      {/* Main Content */}
      <Tabs defaultValue={initialTab} className="animate-zoom-in">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">{t('tabs.overview')}</TabsTrigger>
          <TabsTrigger value="reviews">{t('tabs.reviews')}</TabsTrigger>
          <TabsTrigger value="wallet">{t('tabs.wallet')}</TabsTrigger>
          <TabsTrigger value="amazon">{t('tabs.amazon')}</TabsTrigger>
          <TabsTrigger value="actions">{t('tabs.actions')}</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-3">
            <div className="space-y-6 md:col-span-2">
              {/* Profile Info */}
              <Card className="animate-fade-up-fast">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5" />
                    {t('overview.profileInfo')}
                  </CardTitle>
                </CardHeader>
                <CardContent className="grid gap-4 md:grid-cols-2">
                  <div className="animate-fade-up-light-slow">
                    <Label className="text-muted-foreground">{t('fields.country')}</Label>
                    <p className="font-medium">{reader.country}</p>
                  </div>
                  <div className="animate-fade-up-medium-slow">
                    <Label className="text-muted-foreground">{t('fields.language')}</Label>
                    <p className="font-medium">{reader.language}</p>
                  </div>
                  <div className="animate-fade-up-heavy-slow">
                    <Label className="text-muted-foreground">{t('fields.contentPreference')}</Label>
                    <p className="font-medium">
                      {reader.contentPreference === ContentPreference.EBOOK
                        ? t('contentPreference.ebook')
                        : reader.contentPreference === ContentPreference.AUDIOBOOK
                          ? t('contentPreference.audiobook')
                          : t('contentPreference.both')}
                    </p>
                  </div>
                  <div className="animate-fade-up-extra-slow">
                    <Label className="text-muted-foreground">{t('fields.preferredGenres')}</Label>
                    <div className="mt-1 flex flex-wrap gap-1">
                      {reader.preferredGenres.length > 0 ? (
                        reader.preferredGenres.map((genre) => (
                          <Badge key={genre} variant="outline" className="text-xs">
                            {genre}
                          </Badge>
                        ))
                      ) : (
                        <span className="text-sm text-muted-foreground">
                          {t('fields.noGenres')}
                        </span>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Performance Stats */}
              <Card className="animate-fade-up-medium-slow">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BookOpen className="h-5 w-5" />
                    {t('overview.performance')}
                  </CardTitle>
                </CardHeader>
                <CardContent className="grid gap-4 md:grid-cols-3">
                  <div className="animate-fade-up-fast space-y-2">
                    <Label className="text-muted-foreground">{t('stats.reliability')}</Label>
                    <div className="flex items-center gap-2">
                      <Progress value={reader.reliabilityScore} className="flex-1" />
                      <span className="font-bold">{reader.reliabilityScore.toFixed(0)}%</span>
                    </div>
                  </div>
                  <div className="animate-fade-up-light-slow space-y-2">
                    <Label className="text-muted-foreground">{t('stats.completion')}</Label>
                    <div className="flex items-center gap-2">
                      <Progress value={reader.completionRate} className="flex-1" />
                      <span className="font-bold">{reader.completionRate.toFixed(0)}%</span>
                    </div>
                  </div>
                  <div className="animate-fade-up-medium-slow">
                    <Label className="text-muted-foreground">{t('stats.reviewsCompleted')}</Label>
                    <p className="text-2xl font-bold text-green-600">{reader.reviewsCompleted}</p>
                  </div>
                  <div className="animate-fade-up-heavy-slow">
                    <Label className="text-muted-foreground">{t('stats.reviewsExpired')}</Label>
                    <p className="text-2xl font-bold text-red-600">{reader.reviewsExpired}</p>
                  </div>
                  <div className="animate-fade-up-extra-slow">
                    <Label className="text-muted-foreground">{t('stats.reviewsRejected')}</Label>
                    <p className="text-2xl font-bold text-yellow-600">{reader.reviewsRejected}</p>
                  </div>
                </CardContent>
              </Card>

              {/* Recent Assignments */}
              <Card className="animate-zoom-in-slow">
                <CardHeader>
                  <CardTitle>{t('overview.recentAssignments')}</CardTitle>
                  <CardDescription>{t('overview.recentAssignmentsDesc')}</CardDescription>
                </CardHeader>
                <CardContent>
                  {reader.recentAssignments.length === 0 ? (
                    <p className="py-8 text-center text-muted-foreground">
                      {t('overview.noAssignments')}
                    </p>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>{t('table.book')}</TableHead>
                          <TableHead>{t('table.format')}</TableHead>
                          <TableHead>{t('table.status')}</TableHead>
                          <TableHead>{t('table.assignedAt')}</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {reader.recentAssignments.map((assignment, index) => (
                          <TableRow
                            key={assignment.id}
                            className={`animate-fade-up-${['fast', 'light-slow', 'medium-slow', 'heavy-slow'][index % 4]}`}
                          >
                            <TableCell className="font-medium">{assignment.bookTitle}</TableCell>
                            <TableCell>
                              <Badge variant="outline">{assignment.format}</Badge>
                            </TableCell>
                            <TableCell>{getAssignmentStatusBadge(assignment.status)}</TableCell>
                            <TableCell>
                              {new Date(assignment.assignedAt).toLocaleDateString()}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Wallet Summary */}
              <Card className="animate-fade-left-fast">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Wallet className="h-5 w-5" />
                    {t('wallet.summary')}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label className="text-muted-foreground">{t('wallet.balance')}</Label>
                    <p className="text-3xl font-bold">${reader.walletBalance.toFixed(2)}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-muted-foreground">{t('wallet.totalEarned')}</Label>
                      <p className="text-lg font-semibold text-green-600">
                        ${reader.totalEarned.toFixed(2)}
                      </p>
                    </div>
                    <div>
                      <Label className="text-muted-foreground">{t('wallet.totalWithdrawn')}</Label>
                      <p className="text-lg font-semibold">${reader.totalWithdrawn.toFixed(2)}</p>
                    </div>
                  </div>
                  <Button
                    type="button"
                    className="w-full"
                    variant="outline"
                    onClick={() => setWalletDialogOpen(true)}
                  >
                    <Settings className="mr-2 h-4 w-4" />
                    {t('wallet.adjust')}
                  </Button>
                </CardContent>
              </Card>

              {/* Admin Notes */}
              <Card className="animate-fade-left-light-slow">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <MessageSquare className="h-5 w-5" />
                      {t('notes.title')}
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setNoteDialogOpen(true)}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent className="max-h-64 space-y-3 overflow-y-auto">
                  {reader.adminNotes.length === 0 ? (
                    <p className="py-4 text-center text-sm text-muted-foreground">
                      {t('notes.empty')}
                    </p>
                  ) : (
                    reader.adminNotes.map((note, index) => (
                      <div
                        key={note.id}
                        className={`rounded-lg bg-muted p-3 animate-fade-up-${['fast', 'light-slow', 'medium-slow'][index % 3]}`}
                      >
                        <div className="flex items-start justify-between">
                          <p className="text-sm">{note.content}</p>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteNote(note.id)}
                          >
                            <Trash2 className="h-3 w-3 text-red-500" />
                          </Button>
                        </div>
                        <div className="mt-2 text-xs text-muted-foreground">
                          {note.createdByName} • {new Date(note.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                    ))
                  )}
                </CardContent>
              </Card>

              {/* Flag Reason */}
              {reader.isFlagged && reader.flagReason && (
                <Card className="animate-fade-left-medium-slow border-yellow-200 bg-yellow-50 dark:border-yellow-800 dark:bg-yellow-950">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-yellow-800 dark:text-yellow-200">
                      <AlertCircle className="h-5 w-5" />
                      {t('flag.reason')}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-yellow-900 dark:text-yellow-100">
                      {reader.flagReason}
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </TabsContent>

        {/* Reviews Tab */}
        <TabsContent value="reviews" className="space-y-6">
          <Card className="animate-fade-up">
            <CardHeader>
              <CardTitle>{t('reviews.title')}</CardTitle>
              <CardDescription>{t('reviews.description')}</CardDescription>
            </CardHeader>
            <CardContent>
              {!reviewHistory || reviewHistory.reviews.length === 0 ? (
                <p className="py-8 text-center text-muted-foreground">{t('reviews.empty')}</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{t('table.book')}</TableHead>
                      <TableHead>{t('table.rating')}</TableHead>
                      <TableHead>{t('table.status')}</TableHead>
                      <TableHead>{t('table.submittedAt')}</TableHead>
                      <TableHead>{t('table.validatedAt')}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {reviewHistory.reviews.map((review, index) => (
                      <TableRow
                        key={review.id}
                        className={`animate-fade-up-${['fast', 'light-slow', 'medium-slow', 'heavy-slow'][index % 4]}`}
                      >
                        <TableCell className="font-medium">{review.bookTitle}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            {'★'.repeat(review.rating)}
                            {'☆'.repeat(5 - review.rating)}
                          </div>
                        </TableCell>
                        <TableCell>{getAssignmentStatusBadge(review.status)}</TableCell>
                        <TableCell>{new Date(review.submittedAt).toLocaleDateString()}</TableCell>
                        <TableCell>
                          {review.validatedAt
                            ? new Date(review.validatedAt).toLocaleDateString()
                            : '-'}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Wallet Tab */}
        <TabsContent value="wallet" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-3">
            <Card className="animate-fade-up-fast">
              <CardHeader>
                <CardTitle>{t('wallet.currentBalance')}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-4xl font-bold">${reader.walletBalance.toFixed(2)}</p>
              </CardContent>
            </Card>
            <Card className="animate-fade-up-light-slow">
              <CardHeader>
                <CardTitle>{t('wallet.totalEarned')}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-4xl font-bold text-green-600">
                  ${reader.totalEarned.toFixed(2)}
                </p>
              </CardContent>
            </Card>
            <Card className="animate-fade-up-medium-slow">
              <CardHeader>
                <CardTitle>{t('wallet.totalWithdrawn')}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-4xl font-bold">${reader.totalWithdrawn.toFixed(2)}</p>
              </CardContent>
            </Card>
          </div>

          <Card className="animate-zoom-in">
            <CardHeader>
              <CardTitle>{t('wallet.transactions')}</CardTitle>
              <CardDescription>{t('wallet.transactionsDesc')}</CardDescription>
            </CardHeader>
            <CardContent>
              {reader.walletTransactions.length === 0 ? (
                <p className="py-8 text-center text-muted-foreground">
                  {t('wallet.noTransactions')}
                </p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{t('table.date')}</TableHead>
                      <TableHead>{t('table.type')}</TableHead>
                      <TableHead>{t('table.description')}</TableHead>
                      <TableHead className="text-right">{t('table.amount')}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {reader.walletTransactions.map((transaction, index) => (
                      <TableRow
                        key={transaction.id}
                        className={`animate-fade-up-${['fast', 'light-slow', 'medium-slow', 'heavy-slow'][index % 4]}`}
                      >
                        <TableCell>
                          {new Date(transaction.createdAt).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{transaction.type}</Badge>
                        </TableCell>
                        <TableCell>{transaction.description}</TableCell>
                        <TableCell
                          className={`text-right font-medium ${transaction.amount >= 0 ? 'text-green-600' : 'text-red-600'}`}
                        >
                          {transaction.amount >= 0 ? '+' : ''}$
                          {Math.abs(transaction.amount).toFixed(2)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>

          <Card className="animate-zoom-in-slow">
            <CardHeader>
              <CardTitle>{t('wallet.payoutHistory')}</CardTitle>
            </CardHeader>
            <CardContent>
              {reader.payoutHistory.length === 0 ? (
                <p className="py-8 text-center text-muted-foreground">{t('wallet.noPayouts')}</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{t('table.requestedAt')}</TableHead>
                      <TableHead>{t('table.amount')}</TableHead>
                      <TableHead>{t('table.method')}</TableHead>
                      <TableHead>{t('table.status')}</TableHead>
                      <TableHead>{t('table.processedAt')}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {reader.payoutHistory.map((payout, index) => (
                      <TableRow
                        key={payout.id}
                        className={`animate-fade-up-${['fast', 'light-slow', 'medium-slow', 'heavy-slow'][index % 4]}`}
                      >
                        <TableCell>{new Date(payout.requestedAt).toLocaleDateString()}</TableCell>
                        <TableCell className="font-medium">${payout.amount.toFixed(2)}</TableCell>
                        <TableCell>{payout.paymentMethod}</TableCell>
                        <TableCell>
                          <Badge
                            className={
                              payout.status === 'COMPLETED'
                                ? 'bg-green-100 text-green-800'
                                : payout.status === 'REJECTED'
                                  ? 'bg-red-100 text-red-800'
                                  : 'bg-yellow-100 text-yellow-800'
                            }
                          >
                            {payout.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {payout.processedAt
                            ? new Date(payout.processedAt).toLocaleDateString()
                            : '-'}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Amazon Tab */}
        <TabsContent value="amazon" className="space-y-6">
          <Card className="animate-fade-up">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <LinkIcon className="h-5 w-5" />
                {t('amazon.title')}
              </CardTitle>
              <CardDescription>{t('amazon.description')}</CardDescription>
            </CardHeader>
            <CardContent>
              {reader.amazonProfiles.length === 0 ? (
                <p className="py-8 text-center text-muted-foreground">{t('amazon.empty')}</p>
              ) : (
                <div className="space-y-4">
                  {reader.amazonProfiles.map((profile, index) => (
                    <div
                      key={profile.id}
                      className={`flex items-center justify-between rounded-lg border p-4 animate-fade-up-${['fast', 'light-slow', 'medium-slow'][index % 3]}`}
                    >
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          {profile.isVerified ? (
                            <CheckCircle className="h-5 w-5 flex-shrink-0 text-green-600" />
                          ) : (
                            <XCircle className="h-5 w-5 flex-shrink-0 text-red-600" />
                          )}
                          <Button
                            type="button"
                            variant="link"
                            size="sm"
                            className="h-auto truncate p-0 text-sm"
                            onClick={() => window.open(profile.profileUrl, '_blank', 'noopener,noreferrer')}
                          >
                            {profile.profileUrl}
                            <ExternalLink className="ml-1 h-3 w-3 flex-shrink-0" />
                          </Button>
                        </div>
                        <div className="ml-7 mt-1">
                          {profile.isVerified ? (
                            <p className="text-xs text-green-600">
                              {t('amazon.verified')} •{' '}
                              {profile.verifiedAt &&
                                new Date(profile.verifiedAt).toLocaleDateString()}
                            </p>
                          ) : (
                            <p className="text-xs text-muted-foreground">
                              {t('amazon.pending')} • {t('amazon.addedOn')}{' '}
                              {new Date(profile.createdAt).toLocaleDateString()}
                            </p>
                          )}
                        </div>
                      </div>
                      {!profile.isVerified && (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => handleVerifyAmazon(profile.id)}
                        >
                          <Shield className="mr-2 h-4 w-4" />
                          {t('amazon.verify')}
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Actions Tab */}
        <TabsContent value="actions" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <Card className="animate-fade-up-fast">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <UserX className="h-5 w-5" />
                  {t('actions.accountStatus')}
                </CardTitle>
                <CardDescription>{t('actions.accountStatusDesc')}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {reader.isActive ? (
                  <Button
                    type="button"
                    variant="destructive"
                    className="w-full"
                    onClick={() => setSuspendDialogOpen(true)}
                  >
                    <UserX className="mr-2 h-4 w-4" />
                    {t('actions.suspendAccount')}
                  </Button>
                ) : (
                  <Button
                    type="button"
                    variant="default"
                    className="w-full"
                    onClick={() => setUnsuspendDialogOpen(true)}
                  >
                    <UserCheck className="mr-2 h-4 w-4" />
                    {t('actions.unsuspendAccount')}
                  </Button>
                )}
                <p className="text-sm text-muted-foreground">
                  {reader.isActive ? t('actions.suspendWarning') : t('actions.unsuspendInfo')}
                </p>
              </CardContent>
            </Card>

            <Card className="animate-fade-up-light-slow">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Flag className="h-5 w-5" />
                  {t('actions.flagStatus')}
                </CardTitle>
                <CardDescription>{t('actions.flagStatusDesc')}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {reader.isFlagged ? (
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full"
                    onClick={() => setUnflagDialogOpen(true)}
                  >
                    <FlagOff className="mr-2 h-4 w-4" />
                    {t('actions.removeflag')}
                  </Button>
                ) : (
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full"
                    onClick={() => setFlagDialogOpen(true)}
                  >
                    <Flag className="mr-2 h-4 w-4" />
                    {t('actions.flagAccount')}
                  </Button>
                )}
                <p className="text-sm text-muted-foreground">
                  {reader.isFlagged ? t('actions.unflagInfo') : t('actions.flagWarning')}
                </p>
              </CardContent>
            </Card>

            <Card className="animate-fade-up-medium-slow">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Wallet className="h-5 w-5" />
                  {t('actions.walletAdjustment')}
                </CardTitle>
                <CardDescription>{t('actions.walletAdjustmentDesc')}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                  onClick={() => {
                    setWalletType('ADD');
                    setWalletDialogOpen(true);
                  }}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  {t('actions.addFunds')}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                  onClick={() => {
                    setWalletType('DEDUCT');
                    setWalletDialogOpen(true);
                  }}
                >
                  <Minus className="mr-2 h-4 w-4" />
                  {t('actions.deductFunds')}
                </Button>
                <p className="text-sm text-muted-foreground">{t('actions.walletInfo')}</p>
              </CardContent>
            </Card>

            <Card className="animate-fade-up-heavy-slow">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="h-5 w-5" />
                  {t('actions.adminNotes')}
                </CardTitle>
                <CardDescription>{t('actions.adminNotesDesc')}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                  onClick={() => setNoteDialogOpen(true)}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  {t('actions.addNote')}
                </Button>
                <p className="text-sm text-muted-foreground">{t('actions.noteInfo')}</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Suspend Dialog */}
      <Dialog open={suspendDialogOpen} onOpenChange={setSuspendDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('dialogs.suspend.title')}</DialogTitle>
            <DialogDescription>{t('dialogs.suspend.description')}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="suspendReason">{t('dialogs.reason')} *</Label>
              <Input
                id="suspendReason"
                value={actionReason}
                onChange={(e) => setActionReason(e.target.value)}
                placeholder={t('dialogs.reasonPlaceholder')}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="suspendNotes">{t('dialogs.notes')}</Label>
              <Textarea
                id="suspendNotes"
                value={actionNotes}
                onChange={(e) => setActionNotes(e.target.value)}
                placeholder={t('dialogs.notesPlaceholder')}
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setSuspendDialogOpen(false)}>
              {t('dialogs.cancel')}
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={handleSuspend}
              disabled={!actionReason.trim() || suspendReader.isPending}
            >
              {suspendReader.isPending ? t('dialogs.processing') : t('dialogs.suspend.confirm')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Unsuspend Dialog */}
      <Dialog open={unsuspendDialogOpen} onOpenChange={setUnsuspendDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('dialogs.unsuspend.title')}</DialogTitle>
            <DialogDescription>{t('dialogs.unsuspend.description')}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="unsuspendReason">{t('dialogs.reason')} *</Label>
              <Input
                id="unsuspendReason"
                value={actionReason}
                onChange={(e) => setActionReason(e.target.value)}
                placeholder={t('dialogs.reasonPlaceholder')}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="unsuspendNotes">{t('dialogs.notes')}</Label>
              <Textarea
                id="unsuspendNotes"
                value={actionNotes}
                onChange={(e) => setActionNotes(e.target.value)}
                placeholder={t('dialogs.notesPlaceholder')}
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setUnsuspendDialogOpen(false)}>
              {t('dialogs.cancel')}
            </Button>
            <Button
              type="button"
              onClick={handleUnsuspend}
              disabled={!actionReason.trim() || unsuspendReader.isPending}
            >
              {unsuspendReader.isPending ? t('dialogs.processing') : t('dialogs.unsuspend.confirm')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Wallet Adjustment Dialog */}
      <Dialog open={walletDialogOpen} onOpenChange={setWalletDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('dialogs.wallet.title')}</DialogTitle>
            <DialogDescription>{t('dialogs.wallet.description')}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="walletType">{t('dialogs.wallet.type')}</Label>
              <Select
                value={walletType}
                onValueChange={(v) => setWalletType(v as 'ADD' | 'DEDUCT')}
              >
                <SelectTrigger id="walletType">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ADD">{t('dialogs.wallet.add')}</SelectItem>
                  <SelectItem value="DEDUCT">{t('dialogs.wallet.deduct')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="walletAmount">{t('dialogs.wallet.amount')} *</Label>
              <Input
                id="walletAmount"
                type="number"
                min="0.01"
                step="0.01"
                value={walletAmount}
                onChange={(e) => setWalletAmount(e.target.value)}
                placeholder="0.00"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="walletReason">{t('dialogs.reason')} *</Label>
              <Input
                id="walletReason"
                value={actionReason}
                onChange={(e) => setActionReason(e.target.value)}
                placeholder={t('dialogs.reasonPlaceholder')}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="walletNotes">{t('dialogs.notes')}</Label>
              <Textarea
                id="walletNotes"
                value={actionNotes}
                onChange={(e) => setActionNotes(e.target.value)}
                placeholder={t('dialogs.notesPlaceholder')}
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setWalletDialogOpen(false)}>
              {t('dialogs.cancel')}
            </Button>
            <Button
              type="button"
              onClick={handleWalletAdjust}
              disabled={
                !walletAmount ||
                parseFloat(walletAmount) <= 0 ||
                !actionReason.trim() ||
                adjustWallet.isPending
              }
            >
              {adjustWallet.isPending ? t('dialogs.processing') : t('dialogs.wallet.confirm')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Flag Dialog */}
      <Dialog open={flagDialogOpen} onOpenChange={setFlagDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('dialogs.flag.title')}</DialogTitle>
            <DialogDescription>{t('dialogs.flag.description')}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="flagReason">{t('dialogs.reason')} *</Label>
              <Input
                id="flagReason"
                value={actionReason}
                onChange={(e) => setActionReason(e.target.value)}
                placeholder={t('dialogs.reasonPlaceholder')}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="flagNotes">{t('dialogs.notes')}</Label>
              <Textarea
                id="flagNotes"
                value={actionNotes}
                onChange={(e) => setActionNotes(e.target.value)}
                placeholder={t('dialogs.notesPlaceholder')}
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setFlagDialogOpen(false)}>
              {t('dialogs.cancel')}
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={handleFlag}
              disabled={!actionReason.trim() || flagReader.isPending}
            >
              {flagReader.isPending ? t('dialogs.processing') : t('dialogs.flag.confirm')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Unflag Dialog */}
      <Dialog open={unflagDialogOpen} onOpenChange={setUnflagDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('dialogs.unflag.title')}</DialogTitle>
            <DialogDescription>{t('dialogs.unflag.description')}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="unflagReason">{t('dialogs.reason')} *</Label>
              <Input
                id="unflagReason"
                value={actionReason}
                onChange={(e) => setActionReason(e.target.value)}
                placeholder={t('dialogs.reasonPlaceholder')}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="unflagNotes">{t('dialogs.notes')}</Label>
              <Textarea
                id="unflagNotes"
                value={actionNotes}
                onChange={(e) => setActionNotes(e.target.value)}
                placeholder={t('dialogs.notesPlaceholder')}
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setUnflagDialogOpen(false)}>
              {t('dialogs.cancel')}
            </Button>
            <Button
              type="button"
              onClick={handleUnflag}
              disabled={!actionReason.trim() || unflagReader.isPending}
            >
              {unflagReader.isPending ? t('dialogs.processing') : t('dialogs.unflag.confirm')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Note Dialog */}
      <Dialog open={noteDialogOpen} onOpenChange={setNoteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('dialogs.note.title')}</DialogTitle>
            <DialogDescription>{t('dialogs.note.description')}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="noteContent">{t('dialogs.note.content')} *</Label>
              <Textarea
                id="noteContent"
                value={noteContent}
                onChange={(e) => setNoteContent(e.target.value)}
                placeholder={t('dialogs.note.placeholder')}
                rows={4}
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setNoteDialogOpen(false)}>
              {t('dialogs.cancel')}
            </Button>
            <Button
              type="button"
              onClick={handleAddNote}
              disabled={!noteContent.trim() || addAdminNote.isPending}
            >
              {addAdminNote.isPending ? t('dialogs.processing') : t('dialogs.note.confirm')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
