import { useState, useEffect } from 'react';
import { useParams, useNavigate,  useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { adminReadersApi } from '@/lib/api/admin-readers';
import { adminUsersApi } from '@/lib/api/admin-users';
import { toast } from 'sonner';
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
  DialogTitle } from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue } from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow } from '@/components/ui/table';
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
  Ban,
  Key,
  Mail,
  MailCheck,
  Send,
  Loader2 } from 'lucide-react';

export function AdminReaderDetailPage() {
  const { t, i18n } = useTranslation('adminReaders');
  const navigate = useNavigate();
  const params = useParams();
  const [searchParams] = useSearchParams();
  const readerId = params.id as string;
  const initialTab = searchParams.get('tab') || 'overview';

  // Data state
  const [reader, setReader] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [reviewHistory, setReviewHistory] = useState<any[]>([]);

  // Mutation loading states
  const [isSuspending, setIsSuspending] = useState(false);
  const [isUnsuspending, setIsUnsuspending] = useState(false);
  const [isAdjustingWallet, setIsAdjustingWallet] = useState(false);
  const [isFlagging, setIsFlagging] = useState(false);
  const [isUnflagging, setIsUnflagging] = useState(false);
  const [isAddingNote, setIsAddingNote] = useState(false);
  const [isDeletingNote, setIsDeletingNote] = useState(false);
  const [isVerifyingAmazon, setIsVerifyingAmazon] = useState(false);

  // User management loading states (Section 5.2)
  const [isBanning, setIsBanning] = useState(false);
  const [isUnbanning, setIsUnbanning] = useState(false);
  const [isResettingPassword, setIsResettingPassword] = useState(false);
  const [isUpdatingEmailVerification, setIsUpdatingEmailVerification] = useState(false);
  const [isSendingEmail, setIsSendingEmail] = useState(false);

  // Fetch reader details and review history
  useEffect(() => {
    const fetchData = async () => {
      if (!readerId) return;

      try {
        setIsLoading(true);

        // Fetch reader details and review history in parallel
        const [readerData, reviewData] = await Promise.all([
          adminReadersApi.getReaderDetails(readerId),
          adminReadersApi.getReaderReviewHistory(readerId, 20)
        ]);

        setReader(readerData);
        setReviewHistory(reviewData);
      } catch (err) {
        console.error('Reader data error:', err);
        toast.error('Failed to load reader details');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [readerId]);

  // Refetch reader data
  const refetchReaderData = async () => {
    if (!readerId) return;
    try {
      const [readerData, reviewData] = await Promise.all([
        adminReadersApi.getReaderDetails(readerId),
        adminReadersApi.getReaderReviewHistory(readerId, 20)
      ]);
      setReader(readerData);
      setReviewHistory(reviewData);
    } catch (error: any) {
      console.error('Refetch reader data error:', error);
    }
  };

  // Dialog states
  const [suspendDialogOpen, setSuspendDialogOpen] = useState(false);
  const [unsuspendDialogOpen, setUnsuspendDialogOpen] = useState(false);
  const [walletDialogOpen, setWalletDialogOpen] = useState(false);
  const [flagDialogOpen, setFlagDialogOpen] = useState(false);
  const [unflagDialogOpen, setUnflagDialogOpen] = useState(false);
  const [noteDialogOpen, setNoteDialogOpen] = useState(false);

  // User management dialog states (Section 5.2)
  const [banDialogOpen, setBanDialogOpen] = useState(false);
  const [unbanDialogOpen, setUnbanDialogOpen] = useState(false);
  const [resetPasswordDialogOpen, setResetPasswordDialogOpen] = useState(false);
  const [verifyEmailDialogOpen, setVerifyEmailDialogOpen] = useState(false);
  const [sendEmailDialogOpen, setSendEmailDialogOpen] = useState(false);

  // Form states
  const [actionReason, setActionReason] = useState('');
  const [actionNotes, setActionNotes] = useState('');
  const [walletAmount, setWalletAmount] = useState('');
  const [walletType, setWalletType] = useState<'ADD' | 'DEDUCT'>('ADD');
  const [noteContent, setNoteContent] = useState('');

  // User management form states (Section 5.2)
  const [banReason, setBanReason] = useState('');
  const [banNotes, setBanNotes] = useState('');
  const [emailSubject, setEmailSubject] = useState('');
  const [emailMessage, setEmailMessage] = useState('');
  const [isBackLoading, setIsBackLoading] = useState(false);

  const handleSuspend = async () => {
    if (!actionReason.trim()) return;

    try {
      setIsSuspending(true);
      await adminReadersApi.suspendReader(readerId, {
        reason: actionReason,
        notes: actionNotes || undefined
      });
      toast.success('Reader suspended successfully');

      // Refetch data
      const [readerData, reviewData] = await Promise.all([
        adminReadersApi.getReaderDetails(readerId),
        adminReadersApi.getReaderReviewHistory(readerId, 20)
      ]);
      setReader(readerData);
      setReviewHistory(reviewData);

      // Reset form
      setSuspendDialogOpen(false);
      setActionReason('');
      setActionNotes('');
    } catch (error: any) {
      console.error('Suspend reader error:', error);
      toast.error(error.response?.data?.message || 'Failed to suspend reader');
    } finally {
      setIsSuspending(false);
    }
  };

  const handleUnsuspend = async () => {
    if (!actionReason.trim()) return;

    try {
      setIsUnsuspending(true);
      await adminReadersApi.unsuspendReader(readerId, {
        reason: actionReason,
        notes: actionNotes || undefined
      });
      toast.success('Reader unsuspended successfully');

      // Refetch data
      const [readerData, reviewData] = await Promise.all([
        adminReadersApi.getReaderDetails(readerId),
        adminReadersApi.getReaderReviewHistory(readerId, 20)
      ]);
      setReader(readerData);
      setReviewHistory(reviewData);

      // Reset form
      setUnsuspendDialogOpen(false);
      setActionReason('');
      setActionNotes('');
    } catch (error: any) {
      console.error('Unsuspend reader error:', error);
      toast.error(error.response?.data?.message || 'Failed to unsuspend reader');
    } finally {
      setIsUnsuspending(false);
    }
  };

  const handleWalletAdjust = async () => {
    const amount = parseFloat(walletAmount);
    if (isNaN(amount) || amount <= 0 || !actionReason.trim()) return;

    // Amount is positive for addition, negative for deduction
    const adjustedAmount = walletType === 'ADD' ? amount : -amount;

    try {
      setIsAdjustingWallet(true);
      await adminReadersApi.adjustWallet(readerId, {
        amount: adjustedAmount,
        reason: actionReason,
        notes: actionNotes || undefined
      });
      toast.success('Wallet adjusted successfully');

      // Refetch data
      const [readerData, reviewData] = await Promise.all([
        adminReadersApi.getReaderDetails(readerId),
        adminReadersApi.getReaderReviewHistory(readerId, 20)
      ]);
      setReader(readerData);
      setReviewHistory(reviewData);

      // Reset form
      setWalletDialogOpen(false);
      setWalletAmount('');
      setActionReason('');
      setActionNotes('');
    } catch (error: any) {
      console.error('Adjust wallet error:', error);
      toast.error(error.response?.data?.message || 'Failed to adjust wallet');
    } finally {
      setIsAdjustingWallet(false);
    }
  };

  const handleFlag = async () => {
    if (!actionReason.trim()) return;

    try {
      setIsFlagging(true);
      await adminReadersApi.flagReader(readerId, {
        reason: actionReason,
        notes: actionNotes || undefined
      });
      toast.success('Reader flagged successfully');

      // Refetch data
      const [readerData, reviewData] = await Promise.all([
        adminReadersApi.getReaderDetails(readerId),
        adminReadersApi.getReaderReviewHistory(readerId, 20)
      ]);
      setReader(readerData);
      setReviewHistory(reviewData);

      // Reset form
      setFlagDialogOpen(false);
      setActionReason('');
      setActionNotes('');
    } catch (error: any) {
      console.error('Flag reader error:', error);
      toast.error(error.response?.data?.message || 'Failed to flag reader');
    } finally {
      setIsFlagging(false);
    }
  };

  const handleUnflag = async () => {
    if (!actionReason.trim()) return;

    try {
      setIsUnflagging(true);
      await adminReadersApi.unflagReader(readerId, {
        reason: actionReason,
        notes: actionNotes || undefined
      });
      toast.success('Reader unflagged successfully');

      // Refetch data
      const [readerData, reviewData] = await Promise.all([
        adminReadersApi.getReaderDetails(readerId),
        adminReadersApi.getReaderReviewHistory(readerId, 20)
      ]);
      setReader(readerData);
      setReviewHistory(reviewData);

      // Reset form
      setUnflagDialogOpen(false);
      setActionReason('');
      setActionNotes('');
    } catch (error: any) {
      console.error('Unflag reader error:', error);
      toast.error(error.response?.data?.message || 'Failed to unflag reader');
    } finally {
      setIsUnflagging(false);
    }
  };

  const handleAddNote = async () => {
    if (!noteContent.trim()) return;

    try {
      setIsAddingNote(true);
      await adminReadersApi.addAdminNote(readerId, { content: noteContent });
      toast.success('Note added successfully');

      // Refetch data
      const [readerData, reviewData] = await Promise.all([
        adminReadersApi.getReaderDetails(readerId),
        adminReadersApi.getReaderReviewHistory(readerId, 20)
      ]);
      setReader(readerData);
      setReviewHistory(reviewData);

      // Reset form
      setNoteDialogOpen(false);
      setNoteContent('');
    } catch (error: any) {
      console.error('Add note error:', error);
      toast.error(error.response?.data?.message || 'Failed to add note');
    } finally {
      setIsAddingNote(false);
    }
  };

  const handleDeleteNote = async (noteId: string) => {
    if (!confirm(t('notes.confirmDelete'))) return;

    try {
      setIsDeletingNote(true);
      await adminReadersApi.deleteAdminNote(readerId, noteId);
      toast.success('Note deleted successfully');

      // Refetch data
      const [readerData, reviewData] = await Promise.all([
        adminReadersApi.getReaderDetails(readerId),
        adminReadersApi.getReaderReviewHistory(readerId, 20)
      ]);
      setReader(readerData);
      setReviewHistory(reviewData);
    } catch (error: any) {
      console.error('Delete note error:', error);
      toast.error(error.response?.data?.message || 'Failed to delete note');
    } finally {
      setIsDeletingNote(false);
    }
  };

  const handleVerifyAmazon = async (amazonProfileId: string) => {
    if (!confirm(t('amazon.confirmVerify'))) return;

    try {
      setIsVerifyingAmazon(true);
      await adminReadersApi.verifyAmazonProfile(readerId, amazonProfileId);
      toast.success('Amazon profile verified successfully');

      // Refetch data
      const [readerData, reviewData] = await Promise.all([
        adminReadersApi.getReaderDetails(readerId),
        adminReadersApi.getReaderReviewHistory(readerId, 20)
      ]);
      setReader(readerData);
      setReviewHistory(reviewData);
    } catch (error: any) {
      console.error('Verify Amazon error:', error);
      toast.error(error.response?.data?.message || 'Failed to verify Amazon profile');
    } finally {
      setIsVerifyingAmazon(false);
    }
  };

  // User management handlers (Section 5.2)
  const handleBanUser = async () => {
    if (!reader?.userId || !banReason.trim()) return;
    try {
      setIsBanning(true);
      await adminUsersApi.banUser(reader.userId, {
        reason: banReason,
        notes: banNotes || undefined
      });
      toast.success('User has been permanently banned');
      setBanDialogOpen(false);
      setBanReason('');
      setBanNotes('');
      await refetchReaderData();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to ban user');
    } finally {
      setIsBanning(false);
    }
  };

  const handleUnbanUser = async () => {
    if (!reader?.userId || !actionReason.trim()) return;
    try {
      setIsUnbanning(true);
      await adminUsersApi.unbanUser(reader.userId, {
        reason: actionReason,
        notes: actionNotes || undefined
      });
      toast.success('User has been unbanned');
      setUnbanDialogOpen(false);
      setActionReason('');
      setActionNotes('');
      await refetchReaderData();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to unban user');
    } finally {
      setIsUnbanning(false);
    }
  };

  const handleResetPassword = async () => {
    if (!reader?.userId) return;
    try {
      setIsResettingPassword(true);
      const result = await adminUsersApi.resetUserPassword(reader.userId, {
        sendEmail: true,
        reason: actionReason || 'Admin initiated password reset'
      });
      toast.success(result.message);
      setResetPasswordDialogOpen(false);
      setActionReason('');
      await refetchReaderData();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to reset password');
    } finally {
      setIsResettingPassword(false);
    }
  };

  const handleToggleEmailVerification = async () => {
    if (!reader?.userId) return;
    try {
      setIsUpdatingEmailVerification(true);
      const result = await adminUsersApi.updateEmailVerification(reader.userId, {
        verified: !reader.emailVerified,
        reason: actionReason || 'Admin manual verification'
      });
      toast.success(`Email ${result.emailVerified ? 'verified' : 'unverified'} successfully`);
      setVerifyEmailDialogOpen(false);
      setActionReason('');
      await refetchReaderData();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to update email verification');
    } finally {
      setIsUpdatingEmailVerification(false);
    }
  };

  const handleSendEmail = async () => {
    if (!reader?.userId || !emailSubject.trim() || !emailMessage.trim()) return;
    try {
      setIsSendingEmail(true);
      const result = await adminUsersApi.sendEmailToUser(reader.userId, {
        subject: emailSubject,
        message: emailMessage
      });
      toast.success(result.message);
      setSendEmailDialogOpen(false);
      setEmailSubject('');
      setEmailMessage('');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to send email');
    } finally {
      setIsSendingEmail(false);
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
        icon: <CheckCircle className="h-3 w-3" /> },
      IN_PROGRESS: { color: 'bg-yellow-100 text-yellow-800', icon: <Clock className="h-3 w-3" /> },
      SUBMITTED: { color: 'bg-blue-100 text-blue-800', icon: <CheckCircle className="h-3 w-3" /> },
      VALIDATED: {
        color: 'bg-green-100 text-green-800',
        icon: <CheckCircle className="h-3 w-3" /> },
      REJECTED: { color: 'bg-red-100 text-red-800', icon: <XCircle className="h-3 w-3" /> },
      EXPIRED: { color: 'bg-red-100 text-red-800', icon: <AlertCircle className="h-3 w-3" /> } };

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
            <Button type="button" className="mt-4" onClick={() => navigate(`/admin/readers`)}>
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
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => {
            setIsBackLoading(true);
            navigate(`/admin/readers`);
          }}
          disabled={isBackLoading}
        >
          {isBackLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <ArrowLeft className="mr-2 h-4 w-4" />}
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
                      {reader.preferredGenres?.length > 0 ? (
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
                  {!reader.recentAssignments || reader.recentAssignments.length === 0 ? (
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
                  {!reader.adminNotes || reader.adminNotes.length === 0 ? (
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
              {!reader.walletTransactions || reader.walletTransactions.length === 0 ? (
                <p className="py-8 text-center text-muted-foreground">
                  {t('wallet.noTransactions')}
                </p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{t('table.date')}</TableHead>
                      <TableHead>{t('table.type')}</TableHead>
                      <TableHead>{t('table.descriptionColumn')}</TableHead>
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
              {!reader.payoutHistory || reader.payoutHistory.length === 0 ? (
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
              {!reader.amazonProfiles || reader.amazonProfiles.length === 0 ? (
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

          {/* Section 5.2 - User Management Actions */}
          <Card className="mt-6 animate-zoom-in border-orange-200 bg-orange-50/30 dark:border-orange-800 dark:bg-orange-950/30">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-orange-800 dark:text-orange-200">
                <Shield className="h-5 w-5" />
                User Account Management
              </CardTitle>
              <CardDescription>
                These actions affect the user account directly, not just the reader profile.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {/* Ban/Unban User */}
                {reader.isBanned ? (
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full"
                    onClick={() => setUnbanDialogOpen(true)}
                  >
                    <UserCheck className="mr-2 h-4 w-4" />
                    Unban User
                  </Button>
                ) : (
                  <Button
                    type="button"
                    variant="destructive"
                    className="w-full"
                    onClick={() => setBanDialogOpen(true)}
                  >
                    <Ban className="mr-2 h-4 w-4" />
                    Ban User
                  </Button>
                )}

                {/* Reset Password */}
                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                  onClick={() => setResetPasswordDialogOpen(true)}
                >
                  <Key className="mr-2 h-4 w-4" />
                  Reset Password
                </Button>

                {/* Verify/Unverify Email */}
                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                  onClick={() => setVerifyEmailDialogOpen(true)}
                >
                  {reader.emailVerified ? (
                    <>
                      <XCircle className="mr-2 h-4 w-4" />
                      Unverify Email
                    </>
                  ) : (
                    <>
                      <MailCheck className="mr-2 h-4 w-4" />
                      Verify Email
                    </>
                  )}
                </Button>

                {/* Send Email */}
                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                  onClick={() => setSendEmailDialogOpen(true)}
                >
                  <Send className="mr-2 h-4 w-4" />
                  Send Email
                </Button>
              </div>

              {reader.isBanned && (
                <div className="mt-4 rounded-lg bg-red-100 p-3 text-sm text-red-800 dark:bg-red-900/30 dark:text-red-200">
                  <strong>User is banned</strong>
                  {reader.banReason && <p className="mt-1">Reason: {reader.banReason}</p>}
                </div>
              )}
            </CardContent>
          </Card>
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
              disabled={!actionReason.trim() || isSuspending}
            >
              {isSuspending ? t('dialogs.processing') : t('dialogs.suspend.confirm')}
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
              disabled={!actionReason.trim() || isUnsuspending}
            >
              {isUnsuspending ? t('dialogs.processing') : t('dialogs.unsuspend.confirm')}
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
                isAdjustingWallet
              }
            >
              {isAdjustingWallet ? t('dialogs.processing') : t('dialogs.wallet.confirm')}
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
              disabled={!actionReason.trim() || isFlagging}
            >
              {isFlagging ? t('dialogs.processing') : t('dialogs.flag.confirm')}
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
              disabled={!actionReason.trim() || isUnflagging}
            >
              {isUnflagging ? t('dialogs.processing') : t('dialogs.unflag.confirm')}
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
              disabled={!noteContent.trim() || isAddingNote}
            >
              {isAddingNote ? t('dialogs.processing') : t('dialogs.note.confirm')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Section 5.2 - User Management Dialogs */}

      {/* Ban User Dialog */}
      <Dialog open={banDialogOpen} onOpenChange={setBanDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-red-600">Ban User (Permanent)</DialogTitle>
            <DialogDescription>
              This will permanently ban the user from the platform. They will not be able to log in
              or access any features.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="banReason">Reason *</Label>
              <Input
                id="banReason"
                value={banReason}
                onChange={(e) => setBanReason(e.target.value)}
                placeholder="Enter reason for banning this user"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="banNotes">Additional Notes</Label>
              <Textarea
                id="banNotes"
                value={banNotes}
                onChange={(e) => setBanNotes(e.target.value)}
                placeholder="Optional notes for audit trail"
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setBanDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={handleBanUser}
              disabled={!banReason.trim() || isBanning}
            >
              {isBanning ? 'Banning...' : 'Ban User'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Unban User Dialog */}
      <Dialog open={unbanDialogOpen} onOpenChange={setUnbanDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Unban User</DialogTitle>
            <DialogDescription>
              This will remove the permanent ban and allow the user to access the platform again.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="unbanReason">Reason *</Label>
              <Input
                id="unbanReason"
                value={actionReason}
                onChange={(e) => setActionReason(e.target.value)}
                placeholder="Enter reason for unbanning this user"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="unbanNotes">Additional Notes</Label>
              <Textarea
                id="unbanNotes"
                value={actionNotes}
                onChange={(e) => setActionNotes(e.target.value)}
                placeholder="Optional notes for audit trail"
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setUnbanDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleUnbanUser}
              disabled={!actionReason.trim() || isUnbanning}
            >
              {isUnbanning ? 'Unbanning...' : 'Unban User'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reset Password Dialog */}
      <Dialog open={resetPasswordDialogOpen} onOpenChange={setResetPasswordDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reset User Password</DialogTitle>
            <DialogDescription>
              This will send a password reset email to the user. They will need to click the link
              to set a new password.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="rounded-lg bg-muted p-4">
              <p className="text-sm">
                <strong>Email:</strong> {reader?.email}
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="resetReason">Reason (optional)</Label>
              <Input
                id="resetReason"
                value={actionReason}
                onChange={(e) => setActionReason(e.target.value)}
                placeholder="Enter reason for password reset"
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setResetPasswordDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleResetPassword}
              disabled={isResettingPassword}
            >
              {isResettingPassword ? 'Sending...' : 'Send Reset Email'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Verify/Unverify Email Dialog */}
      <Dialog open={verifyEmailDialogOpen} onOpenChange={setVerifyEmailDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {reader?.emailVerified ? 'Unverify Email' : 'Verify Email'}
            </DialogTitle>
            <DialogDescription>
              {reader?.emailVerified
                ? 'This will mark the email as unverified.'
                : 'This will manually mark the email as verified without requiring the user to click a verification link.'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="rounded-lg bg-muted p-4">
              <p className="text-sm">
                <strong>Email:</strong> {reader?.email}
              </p>
              <p className="mt-1 text-sm">
                <strong>Current Status:</strong>{' '}
                {reader?.emailVerified ? (
                  <span className="text-green-600">Verified</span>
                ) : (
                  <span className="text-red-600">Not Verified</span>
                )}
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="verifyReason">Reason (optional)</Label>
              <Input
                id="verifyReason"
                value={actionReason}
                onChange={(e) => setActionReason(e.target.value)}
                placeholder="Enter reason for verification change"
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setVerifyEmailDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleToggleEmailVerification}
              disabled={isUpdatingEmailVerification}
            >
              {isUpdatingEmailVerification
                ? 'Updating...'
                : reader?.emailVerified
                  ? 'Unverify Email'
                  : 'Verify Email'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Send Email Dialog */}
      <Dialog open={sendEmailDialogOpen} onOpenChange={setSendEmailDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Send Email to User</DialogTitle>
            <DialogDescription>
              Send a custom email to this user. The email will be sent from the platform.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="rounded-lg bg-muted p-4">
              <p className="text-sm">
                <strong>To:</strong> {reader?.email}
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="emailSubject">Subject *</Label>
              <Input
                id="emailSubject"
                value={emailSubject}
                onChange={(e) => setEmailSubject(e.target.value)}
                placeholder="Enter email subject"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="emailMessage">Message *</Label>
              <Textarea
                id="emailMessage"
                value={emailMessage}
                onChange={(e) => setEmailMessage(e.target.value)}
                placeholder="Enter your message"
                rows={6}
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setSendEmailDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleSendEmail}
              disabled={!emailSubject.trim() || !emailMessage.trim() || isSendingEmail}
            >
              {isSendingEmail ? 'Sending...' : 'Send Email'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
