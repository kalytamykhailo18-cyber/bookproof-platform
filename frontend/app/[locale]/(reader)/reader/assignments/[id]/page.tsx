'use client';

import { useAssignment, useMyAssignments } from '@/hooks/useQueue';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  AlertCircle,
  Download,
  BookOpen,
  Clock,
  Calendar,
  CheckCircle,
  XCircle,
  Send,
  ArrowLeft,
} from 'lucide-react';
import { AssignmentStatus, BookFormat } from '@/lib/api/queue';
import { formatDistanceToNow } from 'date-fns';
import { AudiobookPlayer } from '@/components/reader/AudiobookPlayer';
import { useRouter, useParams } from 'next/navigation';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { useTranslations } from 'next-intl';

export default function AssignmentDetailPage({ params }: { params: { id: string } }) {
  const t = useTranslations('reader.assignment');
  const router = useRouter();
  const routeParams = useParams();
  const locale = (routeParams.locale as string) || 'en';
  const { assignment, isLoading } = useAssignment(params.id);
  const { withdrawFromAssignment, isWithdrawing, trackEbookDownload, trackAudiobookAccess } =
    useMyAssignments();

  if (isLoading) {
    return (
      <div className="container mx-auto space-y-6 p-6">
        <Skeleton className="h-12 w-96 animate-pulse" />
        <div className="grid gap-6 md:grid-cols-3">
          <div className="space-y-6 md:col-span-2">
            <Skeleton className="h-96 animate-pulse" />
            <Skeleton className="h-64 animate-pulse" />
          </div>
          <div className="space-y-6">
            <Skeleton className="h-64 animate-pulse" />
            <Skeleton className="h-32 animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  if (!assignment) {
    return (
      <div className="container mx-auto p-6">
        <Card className="animate-fade-up">
          <CardContent className="py-16 text-center">
            <XCircle className="animate-bounce-slow mx-auto mb-4 h-16 w-16 text-red-500" />
            <h3 className="mb-2 text-lg font-semibold">{t('notFound.title')}</h3>
            <p className="mb-4 text-muted-foreground">{t('notFound.description')}</p>
            <Button onClick={() => router.push(`/${locale}/reader`)}>
              {t('backToDashboard')}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const getStatusColor = (status: AssignmentStatus) => {
    switch (status) {
      case AssignmentStatus.WAITING:
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case AssignmentStatus.SCHEDULED:
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case AssignmentStatus.APPROVED:
        return 'bg-green-100 text-green-800 border-green-300';
      case AssignmentStatus.IN_PROGRESS:
        return 'bg-purple-100 text-purple-800 border-purple-300';
      case AssignmentStatus.SUBMITTED:
        return 'bg-indigo-100 text-indigo-800 border-indigo-300';
      case AssignmentStatus.COMPLETED:
        return 'bg-emerald-100 text-emerald-800 border-emerald-300';
      case AssignmentStatus.EXPIRED:
        return 'bg-red-100 text-red-800 border-red-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const canWithdraw =
    assignment.status === AssignmentStatus.WAITING ||
    assignment.status === AssignmentStatus.SCHEDULED;
  const materialsAvailable =
    assignment.status === AssignmentStatus.APPROVED ||
    assignment.status === AssignmentStatus.IN_PROGRESS ||
    assignment.status === AssignmentStatus.SUBMITTED;
  const canSubmitReview =
    assignment.status === AssignmentStatus.APPROVED ||
    assignment.status === AssignmentStatus.IN_PROGRESS;

  // 3-tier countdown urgency levels per requirements.md Section 3.7
  const getDeadlineUrgency = (hoursRemaining?: number) => {
    if (!hoursRemaining) return 'none';
    if (hoursRemaining < 1) return 'critical'; // <1h: Flashing
    if (hoursRemaining < 12) return 'urgent';   // <12h: Red
    if (hoursRemaining < 24) return 'warning';  // 12-24h: Yellow
    return 'normal'; // >24h: Green
  };

  const deadlineUrgency = getDeadlineUrgency(assignment.hoursRemaining);
  const isUrgent = deadlineUrgency === 'urgent' || deadlineUrgency === 'critical';

  const handleEbookDownload = () => {
    // SECURITY: Use secure streaming endpoint with JWT token
    if (assignment.ebookStreamUrl) {
      // Track download and mark as IN_PROGRESS
      trackEbookDownload(assignment.id);

      // Build authenticated URL with JWT token
      const token = localStorage.getItem('auth_token');
      if (!token) {
        alert('Authentication required. Please log in again.');
        return;
      }

      const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
      const authenticatedUrl = assignment.ebookStreamUrl.startsWith('/api/')
        ? `${baseUrl}/api/v1${assignment.ebookStreamUrl.replace('/api', '')}?token=${encodeURIComponent(token)}`
        : `${assignment.ebookStreamUrl}?token=${encodeURIComponent(token)}`;

      // Open in new tab for download
      window.open(authenticatedUrl, '_blank');
    }
  };

  const handleWithdraw = () => {
    withdrawFromAssignment(assignment.id);
  };

  const handleSynopsisDownload = () => {
    // SECURITY: Use secure streaming endpoint with JWT token
    if (assignment.synopsisStreamUrl) {
      // Build authenticated URL with JWT token
      const token = localStorage.getItem('auth_token');
      if (!token) {
        alert('Authentication required. Please log in again.');
        return;
      }

      const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
      const authenticatedUrl = assignment.synopsisStreamUrl.startsWith('/api/')
        ? `${baseUrl}/api/v1${assignment.synopsisStreamUrl.replace('/api', '')}?token=${encodeURIComponent(token)}`
        : `${assignment.synopsisStreamUrl}?token=${encodeURIComponent(token)}`;

      // Open in new tab for download
      window.open(authenticatedUrl, '_blank');
    }
  };

  return (
    <div className="container mx-auto space-y-6 p-6">
      {/* Back Button */}
      <div className="animate-fade-right">
        <Button variant="ghost" size="sm" onClick={() => router.push(`/${locale}/reader`)}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          {t('backToDashboard')}
        </Button>
      </div>

      {/* Header */}
      <div className="flex animate-fade-up items-start justify-between gap-4">
        <div className="flex-1">
          <h1 className="mb-2 text-3xl font-bold">{assignment.book.title}</h1>
          <p className="text-lg text-muted-foreground">by {assignment.book.authorName}</p>
          <div className="mt-3 flex items-center gap-2">
            <Badge className={getStatusColor(assignment.status)}>
              {assignment.status.replace('_', ' ')}
            </Badge>
            <Badge variant="outline">{assignment.formatAssigned}</Badge>
            <Badge variant="outline">
              {assignment.creditsValue} {assignment.creditsValue === 1 ? 'credit' : 'credits'}
            </Badge>
            {/* NOTE: isBufferAssignment removed per Rule 2 - buffer is invisible to readers */}
          </div>
        </div>
        {assignment.book.coverImageUrl && (
          <img
            src={assignment.book.coverImageUrl}
            alt={assignment.book.title}
            className="h-48 w-32 animate-zoom-in rounded object-cover shadow-lg"
          />
        )}
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Main Content */}
        <div className="space-y-6 md:col-span-2">
          {/* Deadline Warning */}
          {assignment.deadlineAt && materialsAvailable && (
            <Card
              className={`animate-fade-up-fast ${
                deadlineUrgency === 'critical'
                  ? 'border-red-500 bg-red-100 dark:bg-red-950'
                  : deadlineUrgency === 'urgent'
                    ? 'border-red-300 bg-red-50 dark:bg-red-950'
                    : deadlineUrgency === 'warning'
                      ? 'border-yellow-300 bg-yellow-50 dark:bg-yellow-950'
                      : 'border-green-300 bg-green-50 dark:bg-green-950'
              }`}
            >
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <AlertCircle
                    className={`h-8 w-8 ${
                      deadlineUrgency === 'critical'
                        ? 'animate-pulse text-red-600'
                        : deadlineUrgency === 'urgent'
                          ? 'animate-pulse text-red-600'
                          : deadlineUrgency === 'warning'
                            ? 'text-yellow-600'
                            : 'text-green-600'
                    }`}
                    style={
                      deadlineUrgency === 'critical'
                        ? {
                            animation: 'pulse 0.5s cubic-bezier(0.4, 0, 0.6, 1) infinite',
                          }
                        : undefined
                    }
                  />
                  <div className="flex-1">
                    <h3
                      className={`font-semibold ${
                        deadlineUrgency === 'critical'
                          ? 'text-red-900 dark:text-red-100'
                          : deadlineUrgency === 'urgent'
                            ? 'text-red-900 dark:text-red-100'
                            : deadlineUrgency === 'warning'
                              ? 'text-yellow-900 dark:text-yellow-100'
                              : 'text-green-900 dark:text-green-100'
                      }`}
                    >
                      {deadlineUrgency === 'critical'
                        ? t('deadline.critical')
                        : isUrgent
                          ? t('deadline.urgent')
                          : deadlineUrgency === 'warning'
                            ? t('deadline.warning')
                            : t('deadline.reminder')}
                    </h3>
                    <p
                      className={`text-sm ${
                        deadlineUrgency === 'critical'
                          ? 'text-red-800 dark:text-red-200'
                          : deadlineUrgency === 'urgent'
                            ? 'text-red-800 dark:text-red-200'
                            : deadlineUrgency === 'warning'
                              ? 'text-yellow-800 dark:text-yellow-200'
                              : 'text-green-800 dark:text-green-200'
                      }`}
                    >
                      {t('deadline.due', {
                        time: formatDistanceToNow(new Date(assignment.deadlineAt), {
                          addSuffix: true,
                        }),
                      })}
                      {assignment.hoursRemaining &&
                        ` (${Math.floor(assignment.hoursRemaining)} ${t('deadline.hoursRemaining')})`}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Synopsis */}
          <Card className="animate-zoom-in">
            <CardHeader>
              <CardTitle>{t('sections.synopsis')}</CardTitle>
              {assignment.synopsisStreamUrl && (
                <CardDescription>
                  A detailed synopsis document is also available for download.
                </CardDescription>
              )}
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="whitespace-pre-wrap text-sm">{assignment.book.synopsis}</p>
              {/* Secure synopsis download if available */}
              {assignment.synopsisStreamUrl && (
                <div className="rounded-md border border-blue-200 bg-blue-50 p-4 dark:border-blue-800 dark:bg-blue-950">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium text-blue-900 dark:text-blue-100">
                        Synopsis Document
                      </h4>
                      <p className="text-sm text-blue-700 dark:text-blue-300">
                        Download the full synopsis document provided by the author
                      </p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleSynopsisDownload}
                    >
                      <Download className="mr-2 h-4 w-4" />
                      Download
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Materials Access */}
          {materialsAvailable && (
            <>
              {/* Ebook Download */}
              {assignment.formatAssigned === BookFormat.EBOOK && assignment.ebookStreamUrl && (
                <Card className="animate-zoom-in-slow">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Download className="h-5 w-5" />
                      {t('sections.ebookDownload')}
                    </CardTitle>
                    <CardDescription>{t('sections.ebookDownloadDesc')}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button onClick={handleEbookDownload} className="w-full">
                      <Download className="mr-2 h-4 w-4" />
                      {t('sections.downloadButton')}
                    </Button>
                    {assignment.ebookDownloadedAt && (
                      <p className="mt-2 text-center text-xs text-muted-foreground">
                        {t('sections.downloaded', {
                          time: formatDistanceToNow(new Date(assignment.ebookDownloadedAt), {
                            addSuffix: true,
                          }),
                        })}
                      </p>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* Ebook Access Expired */}
              {assignment.formatAssigned === BookFormat.EBOOK && !assignment.ebookStreamUrl && (
                <Card className="animate-zoom-in-slow border-red-300 bg-red-50 dark:bg-red-950">
                  <CardContent className="py-8 text-center">
                    <AlertCircle className="mx-auto mb-3 h-12 w-12 text-red-500" />
                    <h3 className="font-semibold text-red-900 dark:text-red-100">
                      Ebook Access Expired
                    </h3>
                    <p className="mt-2 text-sm text-red-700 dark:text-red-300">
                      The 72-hour deadline has passed. Ebook access is no longer available.
                    </p>
                  </CardContent>
                </Card>
              )}

              {/* Audiobook Player */}
              {assignment.formatAssigned === BookFormat.AUDIOBOOK &&
                assignment.audioBookStreamUrl && (
                  <div className="animate-zoom-in-medium-slow">
                    <h2 className="mb-3 flex items-center gap-2 text-xl font-semibold">
                      <BookOpen className="h-5 w-5" />
                      {t('sections.audiobookPlayer')}
                    </h2>
                    <AudiobookPlayer
                      audioUrl={assignment.audioBookStreamUrl}
                      bookTitle={assignment.book.title}
                      onFirstPlay={() => trackAudiobookAccess(assignment.id)}
                    />
                  </div>
                )}
            </>
          )}

          {/* Materials Not Available */}
          {!materialsAvailable && (
            <Card className="animate-zoom-in">
              <CardContent className="py-16 text-center">
                <Clock className="mx-auto mb-4 h-16 w-16 animate-pulse text-muted-foreground" />
                <h3 className="mb-2 text-lg font-semibold">{t('materialsNotAvailable.title')}</h3>
                <p className="text-muted-foreground">
                  {assignment.status === AssignmentStatus.WAITING && (
                    <>
                      {t('materialsNotAvailable.waiting', { position: assignment.queuePosition })}
                    </>
                  )}
                  {assignment.status === AssignmentStatus.SCHEDULED && assignment.scheduledDate && (
                    <>
                      {t('materialsNotAvailable.scheduled', {
                        date: new Date(assignment.scheduledDate).toLocaleDateString(),
                      })}
                    </>
                  )}
                  {assignment.status === AssignmentStatus.EXPIRED && (
                    <>{t('materialsNotAvailable.expired')}</>
                  )}
                </p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Assignment Info */}
          <Card className="animate-fade-left">
            <CardHeader>
              <CardTitle>{t('details.title')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">{t('details.genre')}:</span>
                  <span className="font-medium">{assignment.book.genre}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">{t('details.format')}:</span>
                  <span className="font-medium">{assignment.formatAssigned}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">{t('details.credits')}:</span>
                  <span className="font-medium">{assignment.creditsValue}</span>
                </div>
                {assignment.queuePosition && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">{t('details.queuePosition')}:</span>
                    <span className="font-medium">#{assignment.queuePosition}</span>
                  </div>
                )}
                {assignment.scheduledWeek && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">{t('details.week')}:</span>
                    <span className="font-medium">Week {assignment.scheduledWeek}</span>
                  </div>
                )}
                {assignment.materialsReleasedAt && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">{t('details.released')}:</span>
                    <span className="text-xs font-medium">
                      {formatDistanceToNow(new Date(assignment.materialsReleasedAt), {
                        addSuffix: true,
                      })}
                    </span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Timeline */}
          {assignment.scheduledDate && (
            <Card className="animate-fade-left-slow">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  {t('timeline.title')}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="flex items-start gap-2">
                  <CheckCircle className="mt-0.5 h-4 w-4 text-green-500" />
                  <div>
                    <p className="font-medium">{t('timeline.applied')}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(assignment.createdAt), { addSuffix: true })}
                    </p>
                  </div>
                </div>
                {assignment.scheduledDate && (
                  <div className="flex items-start gap-2">
                    <CheckCircle
                      className={`mt-0.5 h-4 w-4 ${materialsAvailable ? 'text-green-500' : 'text-gray-300'}`}
                    />
                    <div>
                      <p className="font-medium">{t('timeline.materialsReleased')}</p>
                      <p className="text-xs text-muted-foreground">
                        {materialsAvailable
                          ? formatDistanceToNow(new Date(assignment.materialsReleasedAt!), {
                              addSuffix: true,
                            })
                          : new Date(assignment.scheduledDate).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                )}
                {assignment.deadlineAt && (
                  <div className="flex items-start gap-2">
                    <Clock
                      className={`mt-0.5 h-4 w-4 ${
                        deadlineUrgency === 'critical'
                          ? 'text-red-600'
                          : deadlineUrgency === 'urgent'
                            ? 'text-red-500'
                            : deadlineUrgency === 'warning'
                              ? 'text-yellow-500'
                              : deadlineUrgency === 'normal'
                                ? 'text-green-500'
                                : 'text-gray-300'
                      }`}
                      style={
                        deadlineUrgency === 'critical'
                          ? {
                              animation: 'pulse 0.5s cubic-bezier(0.4, 0, 0.6, 1) infinite',
                            }
                          : undefined
                      }
                    />
                    <div>
                      <p className="font-medium">{t('timeline.deadline')}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(assignment.deadlineAt).toLocaleDateString()} {t('timeline.at')}{' '}
                        {new Date(assignment.deadlineAt).toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Submit Review Action */}
          {canSubmitReview && (
            <Card className="animate-zoom-in border-green-300 bg-green-50 dark:bg-green-950">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-green-900 dark:text-green-100">
                  <Send className="h-5 w-5" />
                  Ready to Submit?
                </CardTitle>
                <CardDescription className="text-green-800 dark:text-green-200">
                  After reading the book and posting your review on Amazon, submit it here for
                  validation.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button
                  className="w-full"
                  onClick={() => router.push(`/${locale}/reader/assignments/${assignment.id}/submit-review`)}
                >
                  <Send className="mr-2 h-4 w-4" />
                  Submit Review
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Withdraw Action */}
          {canWithdraw && (
            <Card className="animate-fade-left-medium-slow">
              <CardHeader>
                <CardTitle>{t('actions.title')}</CardTitle>
              </CardHeader>
              <CardContent>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive" className="w-full" disabled={isWithdrawing}>
                      {isWithdrawing ? t('actions.withdrawing') : t('actions.withdraw')}
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>{t('actions.withdrawDialog.title')}</AlertDialogTitle>
                      <AlertDialogDescription>
                        {t('actions.withdrawDialog.description')}
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>{t('actions.withdrawDialog.cancel')}</AlertDialogCancel>
                      <AlertDialogAction onClick={handleWithdraw}>
                        {t('actions.withdrawDialog.confirm')}
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
