import { useState } from 'react';
import { useAdminValidation } from '@/hooks/useReviews';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue } from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  CheckCircle,
  XCircle,
  AlertTriangle,
  RotateCcw,
  Star,
  ExternalLink,
  Clock } from 'lucide-react';
import { Review, ValidationAction, IssueType, IssueSeverity } from '@/lib/api/reviews';
import { formatDistanceToNow } from 'date-fns';
import { useTranslation } from 'react-i18next';

export function AdminValidationPage() {
  const { t, i18n } = useTranslation('adminValidation');
  const {
    pendingReviews,
    isLoadingPending,
    isFetchingPending,
    stats,
    isLoadingStats,
    validateReview,
    isValidating,
    bulkValidate,
    isBulkValidating } = useAdminValidation();

  const [selectedReviews, setSelectedReviews] = useState<string[]>([]);
  const [validationDialogOpen, setValidationDialogOpen] = useState(false);
  const [currentReview, setCurrentReview] = useState<Review | null>(null);
  const [validationAction, setValidationAction] = useState<ValidationAction>(
    ValidationAction.APPROVE,
  );
  const [issueType, setIssueType] = useState<IssueType>(IssueType.INVALID_LINK);
  const [severity, setSeverity] = useState<IssueSeverity>(IssueSeverity.MEDIUM);
  const [notes, setNotes] = useState('');

  const handleSelectReview = (reviewId: string) => {
    setSelectedReviews((prev) =>
      prev.includes(reviewId) ? prev.filter((id) => id !== reviewId) : [...prev, reviewId],
    );
  };

  const handleSelectAll = () => {
    if (selectedReviews.length === pendingReviews?.length) {
      setSelectedReviews([]);
    } else {
      setSelectedReviews(pendingReviews?.map((r) => r.id) || []);
    }
  };

  const openValidationDialog = (review: Review, action: ValidationAction) => {
    setCurrentReview(review);
    setValidationAction(action);
    setNotes('');
    setValidationDialogOpen(true);
  };

  const handleValidate = () => {
    if (!currentReview) return;

    const data: {
      action: ValidationAction;
      issueType?: IssueType;
      severity?: IssueSeverity;
      notes?: string;
    } = { action: validationAction };

    if (
      validationAction === ValidationAction.REJECT ||
      validationAction === ValidationAction.FLAG ||
      validationAction === ValidationAction.REQUEST_RESUBMISSION
    ) {
      data.issueType = issueType;
      data.severity = severity;
      data.notes = notes;
    }

    validateReview({ reviewId: currentReview.id, data });
    setValidationDialogOpen(false);
    setCurrentReview(null);
  };

  const handleBulkApprove = () => {
    if (selectedReviews.length === 0) return;
    bulkValidate({
      reviewIds: selectedReviews,
      action: ValidationAction.APPROVE });
    setSelectedReviews([]);
  };

  const getActionColor = (action: ValidationAction) => {
    switch (action) {
      case ValidationAction.APPROVE:
        return 'bg-green-100 text-green-800 hover:bg-green-200';
      case ValidationAction.REJECT:
        return 'bg-red-100 text-red-800 hover:bg-red-200';
      case ValidationAction.FLAG:
        return 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200';
      case ValidationAction.REQUEST_RESUBMISSION:
        return 'bg-blue-100 text-blue-800 hover:bg-blue-200';
    }
  };

  if (isLoadingPending || isLoadingStats) {
    return (
      <div className="container mx-auto space-y-6 p-6">
        <Skeleton className="h-12 w-96 animate-pulse" />
        <div className="grid gap-6 md:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-32 animate-pulse" />
          ))}
        </div>
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
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="animate-fade-up-fast">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('stats.pending')}</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalPending || 0}</div>
          </CardContent>
        </Card>

        <Card className="animate-fade-up-light-slow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('stats.validated')}</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalValidated || 0}</div>
          </CardContent>
        </Card>

        <Card className="animate-fade-up-medium-slow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('stats.rejected')}</CardTitle>
            <XCircle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalRejected || 0}</div>
          </CardContent>
        </Card>

        <Card className="animate-fade-up-heavy-slow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('stats.flagged')}</CardTitle>
            <AlertTriangle className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalFlagged || 0}</div>
          </CardContent>
        </Card>
      </div>

      {/* Bulk Actions */}
      {selectedReviews.length > 0 && (
        <Card className="animate-zoom-in border-blue-300 bg-blue-50 dark:bg-blue-950">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <p className="text-sm text-blue-900 dark:text-blue-100">
                {t('bulk.selected', { count: selectedReviews.length })}
              </p>
              <div className="flex gap-2">
                <Button
                  type="button"
                  size="sm"
                  onClick={handleBulkApprove}
                  disabled={isBulkValidating}
                  className="bg-green-600 hover:bg-green-700"
                >
                  <CheckCircle className="mr-2 h-4 w-4" />
                  {t('bulk.approve')}
                </Button>
                <Button type="button" size="sm" variant="outline" onClick={() => setSelectedReviews([])}>
                  {t('bulk.clear')}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Reviews List */}
      <Card className="animate-zoom-in">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>{t('list.title', { count: pendingReviews?.length || 0 })}</CardTitle>
              <CardDescription>{t('list.description')}</CardDescription>
            </div>
            {pendingReviews && pendingReviews.length > 0 && (
              <Checkbox
                checked={selectedReviews.length === pendingReviews.length}
                onCheckedChange={handleSelectAll}
                aria-label="Select all reviews"
              />
            )}
          </div>
        </CardHeader>
        <CardContent>
          {/* Only show empty state when we have definitively fetched data and it's empty */}
          {/* Don't show empty state while fetching to prevent flash of empty content */}
          {!isFetchingPending && (!pendingReviews || pendingReviews.length === 0) ? (
            <div className="animate-fade-up py-16 text-center">
              <CheckCircle className="animate-bounce-slow mx-auto mb-4 h-16 w-16 text-green-500" />
              <h3 className="mb-2 text-lg font-semibold">{t('empty.title')}</h3>
              <p className="text-muted-foreground">{t('empty.description')}</p>
            </div>
          ) : isFetchingPending && (!pendingReviews || pendingReviews.length === 0) ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-48 animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {pendingReviews.map((review, index) => (
                <Card
                  key={review.id}
                  className={`border-2 animate-fade-up-${['fast', 'light-slow', 'medium-slow', 'heavy-slow'][index % 4]}`}
                >
                  <CardContent className="pt-6">
                    <div className="flex gap-4">
                      <Checkbox
                        checked={selectedReviews.includes(review.id)}
                        onCheckedChange={() => handleSelectReview(review.id)}
                      />

                      {review.book.coverImageUrl && (
                        <img
                          src={review.book.coverImageUrl}
                          alt={review.book.title}
                          className="h-30 w-20 rounded object-cover"
                        />
                      )}

                      <div className="flex-1 space-y-3">
                        {/* Book Info */}
                        <div>
                          <h3 className="text-lg font-semibold">{review.book.title}</h3>
                          <p className="text-sm text-muted-foreground">
                            {t('review.byAuthor', { author: review.book.authorName })}
                          </p>
                        </div>

                        {/* Reader Info */}
                        <div className="flex items-center gap-4 text-sm">
                          <span>
                            {t('review.reader')}: <strong>{review.reader.name}</strong>
                          </span>
                          {review.reader.reliabilityScore && (
                            <Badge variant="outline">
                              {t('review.reliability')}: {review.reader.reliabilityScore.toFixed(0)}
                              %
                            </Badge>
                          )}
                          {review.reader.completionRate && (
                            <Badge variant="outline">
                              {t('review.completion')}: {review.reader.completionRate.toFixed(0)}%
                            </Badge>
                          )}
                        </div>

                        {/* Amazon Profile Info */}
                        {review.amazonProfile && (
                          <div className="rounded bg-blue-50 p-3 dark:bg-blue-950/30">
                            <div className="flex flex-wrap items-center gap-3 text-sm">
                              <span className="font-medium">{t('review.amazonProfile')}:</span>
                              {review.amazonProfile.profileName && (
                                <span>{review.amazonProfile.profileName}</span>
                              )}
                              <Button
                                type="button"
                                variant="link"
                                size="sm"
                                className="h-auto p-0 text-blue-600"
                                onClick={() => window.open(review.amazonProfile?.profileUrl, '_blank', 'noopener,noreferrer')}
                              >
                                {t('review.viewProfile')}
                                <ExternalLink className="ml-1 h-3 w-3" />
                              </Button>
                              {review.amazonProfile.isVerified ? (
                                <Badge
                                  variant="outline"
                                  className="border-green-600 text-green-600"
                                >
                                  <CheckCircle className="mr-1 h-3 w-3" />
                                  {t('review.verified')}
                                </Badge>
                              ) : (
                                <Badge
                                  variant="outline"
                                  className="border-yellow-600 text-yellow-600"
                                >
                                  {t('review.unverified')}
                                </Badge>
                              )}
                            </div>
                          </div>
                        )}

                        {/* Rating */}
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium">{t('review.rating')}:</span>
                          <div className="flex items-center gap-1">
                            {[...Array(review.internalRating)].map((_, i) => (
                              <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                            ))}
                          </div>
                          <span className="text-sm text-muted-foreground">
                            ({review.internalRating}/5)
                          </span>
                        </div>

                        {/* Feedback */}
                        <div className="rounded bg-muted p-3">
                          <p className="line-clamp-2 text-sm">{review.internalFeedback}</p>
                        </div>

                        {/* Amazon Link */}
                        <div>
                          <Button
                            type="button"
                            variant="link"
                            size="sm"
                            className="h-auto p-0 text-sm text-blue-600"
                            onClick={() => window.open(review.amazonReviewLink, '_blank', 'noopener,noreferrer')}
                          >
                            {t('review.viewOnAmazon')}
                            <ExternalLink className="ml-1 h-3 w-3" />
                          </Button>
                        </div>

                        {/* Submitted Time */}
                        <p className="text-xs text-muted-foreground">
                          {t('review.submitted')}{' '}
                          {review.submittedAt &&
                            formatDistanceToNow(new Date(review.submittedAt), {
                              addSuffix: true })}
                        </p>

                        {/* Action Buttons */}
                        <div className="flex gap-2 pt-2">
                          <Button
                            type="button"
                            size="sm"
                            onClick={() => openValidationDialog(review, ValidationAction.APPROVE)}
                            disabled={isValidating}
                            className={getActionColor(ValidationAction.APPROVE)}
                          >
                            <CheckCircle className="mr-2 h-4 w-4" />
                            {t('actions.approve')}
                          </Button>
                          <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            onClick={() => openValidationDialog(review, ValidationAction.REJECT)}
                            disabled={isValidating}
                            className={getActionColor(ValidationAction.REJECT)}
                          >
                            <XCircle className="mr-2 h-4 w-4" />
                            {t('actions.reject')}
                          </Button>
                          <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            onClick={() => openValidationDialog(review, ValidationAction.FLAG)}
                            disabled={isValidating}
                            className={getActionColor(ValidationAction.FLAG)}
                          >
                            <AlertTriangle className="mr-2 h-4 w-4" />
                            {t('actions.flag')}
                          </Button>
                          <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            onClick={() =>
                              openValidationDialog(review, ValidationAction.REQUEST_RESUBMISSION)
                            }
                            disabled={isValidating}
                            className={getActionColor(ValidationAction.REQUEST_RESUBMISSION)}
                          >
                            <RotateCcw className="mr-2 h-4 w-4" />
                            {t('actions.requestResubmission')}
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Validation Dialog */}
      <Dialog open={validationDialogOpen} onOpenChange={setValidationDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {validationAction === ValidationAction.APPROVE && t('dialog.approve.title')}
              {validationAction === ValidationAction.REJECT && t('dialog.reject.title')}
              {validationAction === ValidationAction.FLAG && t('dialog.flag.title')}
              {validationAction === ValidationAction.REQUEST_RESUBMISSION &&
                t('dialog.resubmit.title')}
            </DialogTitle>
            <DialogDescription>
              {validationAction === ValidationAction.APPROVE && t('dialog.approve.description')}
              {validationAction === ValidationAction.REJECT && t('dialog.reject.description')}
              {validationAction === ValidationAction.FLAG && t('dialog.flag.description')}
              {validationAction === ValidationAction.REQUEST_RESUBMISSION &&
                t('dialog.resubmit.description')}
            </DialogDescription>
          </DialogHeader>

          {validationAction !== ValidationAction.APPROVE && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>{t('dialog.issueType')}</Label>
                <Select
                  value={issueType}
                  onValueChange={(value) => setIssueType(value as IssueType)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.values(IssueType).map((type) => (
                      <SelectItem key={type} value={type}>
                        {type.replace(/_/g, ' ')}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>{t('dialog.severity')}</Label>
                <Select
                  value={severity}
                  onValueChange={(value) => setSeverity(value as IssueSeverity)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.values(IssueSeverity).map((sev) => (
                      <SelectItem key={sev} value={sev}>
                        {sev}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>{t('dialog.notes')}</Label>
                <Textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder={t('dialog.notesPlaceholder')}
                  rows={4}
                />
              </div>
            </div>
          )}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setValidationDialogOpen(false)}>
              {t('dialog.cancel')}
            </Button>
            <Button type="button" onClick={handleValidate} disabled={isValidating}>
              {isValidating ? t('dialog.processing') : t('dialog.confirm')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
