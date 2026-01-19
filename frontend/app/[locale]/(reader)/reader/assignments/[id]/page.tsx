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
import Link from 'next/link';
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
            <XCircle className="mx-auto mb-4 h-16 w-16 text-red-500 animate-bounce-slow" />
            <h3 className="mb-2 text-lg font-semibold">{t('notFound.title')}</h3>
            <p className="mb-4 text-muted-foreground">
              {t('notFound.description')}
            </p>
            <Button asChild>
              <Link href="/reader">{t('backToDashboard')}</Link>
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
  const isUrgent = assignment.hoursRemaining && assignment.hoursRemaining < 24;

  const handleEbookDownload = () => {
    if (assignment.ebookFileUrl) {
      trackEbookDownload(assignment.id);
      window.open(assignment.ebookFileUrl, '_blank');
    }
  };

  const handleWithdraw = () => {
    withdrawFromAssignment(assignment.id);
  };

  return (
    <div className="container mx-auto space-y-6 p-6">
      {/* Back Button */}
      <div className="animate-fade-right">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/reader">
            <ArrowLeft className="mr-2 h-4 w-4" />
            {t('backToDashboard')}
          </Link>
        </Button>
      </div>

      {/* Header */}
      <div className="flex items-start justify-between gap-4 animate-fade-up">
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
            className="h-48 w-32 rounded object-cover shadow-lg animate-zoom-in"
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
                isUrgent
                  ? 'border-red-300 bg-red-50 dark:bg-red-950'
                  : 'border-yellow-300 bg-yellow-50 dark:bg-yellow-950'
              }`}
            >
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <AlertCircle
                    className={`h-8 w-8 ${isUrgent ? 'text-red-600 animate-pulse' : 'text-yellow-600'}`}
                  />
                  <div className="flex-1">
                    <h3
                      className={`font-semibold ${isUrgent ? 'text-red-900 dark:text-red-100' : 'text-yellow-900 dark:text-yellow-100'}`}
                    >
                      {isUrgent ? t('deadline.urgent') : t('deadline.reminder')}
                    </h3>
                    <p
                      className={`text-sm ${isUrgent ? 'text-red-800 dark:text-red-200' : 'text-yellow-800 dark:text-yellow-200'}`}
                    >
                      {t('deadline.due', { time: formatDistanceToNow(new Date(assignment.deadlineAt), { addSuffix: true }) })}
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
              {assignment.book.synopsisFileUrl && (
                <CardDescription>
                  A detailed synopsis document is also available for download.
                </CardDescription>
              )}
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="whitespace-pre-wrap text-sm">{assignment.book.synopsis}</p>
              {/* Synopsis PDF download if available */}
              {assignment.book.synopsisFileUrl && (
                <div className="rounded-md border border-blue-200 bg-blue-50 p-4 dark:border-blue-800 dark:bg-blue-950">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium text-blue-900 dark:text-blue-100">
                        Synopsis Document (PDF)
                      </h4>
                      <p className="text-sm text-blue-700 dark:text-blue-300">
                        Download the full synopsis document provided by the author
                      </p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => window.open(assignment.book.synopsisFileUrl, '_blank')}
                    >
                      <Download className="mr-2 h-4 w-4" />
                      Download PDF
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
              {assignment.formatAssigned === BookFormat.EBOOK && assignment.ebookFileUrl && (
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
                        {t('sections.downloaded', { time: formatDistanceToNow(new Date(assignment.ebookDownloadedAt), { addSuffix: true }) })}
                      </p>
                    )}
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
                <Clock className="mx-auto mb-4 h-16 w-16 text-muted-foreground animate-pulse" />
                <h3 className="mb-2 text-lg font-semibold">{t('materialsNotAvailable.title')}</h3>
                <p className="text-muted-foreground">
                  {assignment.status === AssignmentStatus.WAITING && (
                    <>{t('materialsNotAvailable.waiting', { position: assignment.queuePosition })}</>
                  )}
                  {assignment.status === AssignmentStatus.SCHEDULED && assignment.scheduledDate && (
                    <>{t('materialsNotAvailable.scheduled', { date: new Date(assignment.scheduledDate).toLocaleDateString() })}</>
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
                      className={`mt-0.5 h-4 w-4 ${isUrgent ? 'text-red-500' : 'text-gray-300'}`}
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
            <Card className="border-green-300 bg-green-50 dark:bg-green-950 animate-zoom-in">
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
                <Button asChild className="w-full">
                  <Link href={`/reader/assignments/${assignment.id}/submit-review`}>
                    <Send className="mr-2 h-4 w-4" />
                    Submit Review
                  </Link>
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
                      <AlertDialogAction onClick={handleWithdraw}>{t('actions.withdrawDialog.confirm')}</AlertDialogAction>
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
