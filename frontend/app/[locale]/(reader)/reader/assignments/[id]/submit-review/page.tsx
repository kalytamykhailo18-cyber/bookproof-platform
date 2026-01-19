'use client';

import { useState } from 'react';
import { useReviewSubmission } from '@/hooks/useReviews';
import { useAssignment } from '@/hooks/useQueue';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Skeleton } from '@/components/ui/skeleton';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { AlertCircle, CheckCircle, ArrowLeft, Star, Send } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';

export default function SubmitReviewPage({ params }: { params: { id: string } }) {
  const t = useTranslations('reviews.submit');
  const assignmentId = params.id;
  const { assignment, isLoading: isLoadingAssignment } = useAssignment(assignmentId);
  const { review, isLoadingReview, submitReview, isSubmitting } = useReviewSubmission(assignmentId);
  const router = useRouter();

  const [amazonReviewLink, setAmazonReviewLink] = useState('');
  const [internalRating, setInternalRating] = useState(5);
  const [internalFeedback, setInternalFeedback] = useState('');
  const [publishedOnAmazon, setPublishedOnAmazon] = useState(false);

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!amazonReviewLink.trim()) {
      newErrors.amazonReviewLink = t('errors.amazonLinkRequired');
    } else if (!amazonReviewLink.includes('amazon.com')) {
      newErrors.amazonReviewLink = t('errors.invalidAmazonUrl');
    }

    if (internalFeedback.trim().length < 20) {
      newErrors.internalFeedback = t('errors.feedbackTooShort');
    }

    if (!publishedOnAmazon) {
      newErrors.publishedOnAmazon = t('errors.confirmPublished');
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleFormSubmit = () => {
    if (!validateForm()) {
      return;
    }

    submitReview({
      amazonReviewLink: amazonReviewLink.trim(),
      internalRating,
      internalFeedback: internalFeedback.trim(),
      publishedOnAmazon,
    });
  };

  if (isLoadingAssignment || isLoadingReview) {
    return (
      <div className="container mx-auto space-y-6 p-6">
        <Skeleton className="h-12 w-96 animate-pulse" />
        <Skeleton className="h-32 animate-pulse" />
        <Skeleton className="h-96 animate-pulse" />
      </div>
    );
  }

  if (!assignment) {
    return (
      <div className="container mx-auto p-6">
        <Card className="animate-fade-up">
          <CardContent className="py-16 text-center">
            <AlertCircle className="mx-auto mb-4 h-16 w-16 text-red-500 animate-bounce-slow" />
            <h3 className="mb-2 text-lg font-semibold">{t('notFound.title')}</h3>
            <Button asChild className="mt-4">
              <Link href="/reader">{t('backToDashboard')}</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // If review already submitted, show confirmation
  if (review) {
    return (
      <div className="container mx-auto space-y-6 p-6">
        <Button variant="ghost" asChild className="animate-fade-right">
          <Link href={`/reader/assignments/${assignmentId}`}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            {t('backToAssignment')}
          </Link>
        </Button>

        <Card className="border-green-300 bg-green-50 dark:bg-green-950 animate-zoom-in">
          <CardContent className="py-16 text-center">
            <CheckCircle className="mx-auto mb-4 h-16 w-16 text-green-600 animate-bounce-slow" />
            <h3 className="mb-2 text-lg font-semibold text-green-900 dark:text-green-100">
              {t('success.title')}
            </h3>
            <p className="mb-4 text-sm text-green-800 dark:text-green-200">
              {t('success.description')}
            </p>
            <div className="flex justify-center gap-2">
              <Button asChild>
                <Link href="/reader">{t('backToDashboard')}</Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href="/reader/profile">{t('viewWallet')}</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto space-y-6 p-6">
      {/* Header */}
      <div className="animate-fade-up">
        <Button variant="ghost" asChild className="mb-4">
          <Link href={`/reader/assignments/${assignmentId}`}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            {t('backToAssignment')}
          </Link>
        </Button>
        <h1 className="text-3xl font-bold">{t('title')}</h1>
        <p className="text-muted-foreground">{t('subtitle', { title: assignment.book.title })}</p>
      </div>

      {/* Important Notice */}
      <Card className="border-yellow-300 bg-yellow-50 dark:bg-yellow-950 animate-zoom-in">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <AlertCircle className="mt-0.5 h-5 w-5 text-yellow-600" />
            <div className="flex-1">
              <h4 className="mb-2 font-semibold text-yellow-900 dark:text-yellow-100">
                {t('notice.title')}
              </h4>
              <ul className="list-inside list-disc space-y-1 text-sm text-yellow-800 dark:text-yellow-200">
                <li>{t('notice.item1')}</li>
                <li>{t('notice.item2')}</li>
                <li>{t('notice.item3')}</li>
                <li>{t('notice.item4')}</li>
                <li>
                  {t('notice.format', { format: assignment.formatAssigned, value: assignment.creditsValue })}
                </li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Review Form */}
      <div>
        <Card className="animate-zoom-in-slow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Send className="h-5 w-5" />
              {t('form.title')}
            </CardTitle>
            <CardDescription>
              {t('form.description')}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Amazon Review Link */}
            <div className="space-y-2 animate-fade-up-fast">
              <Label htmlFor="amazonReviewLink">
                {t('form.amazonLink')} <span className="text-red-500">*</span>
              </Label>
              <Input
                id="amazonReviewLink"
                type="url"
                placeholder={t('form.amazonLinkPlaceholder')}
                value={amazonReviewLink}
                onChange={(e) => setAmazonReviewLink(e.target.value)}
                className={errors.amazonReviewLink ? 'border-red-500' : ''}
              />
              {errors.amazonReviewLink && (
                <p className="text-xs text-red-500">{errors.amazonReviewLink}</p>
              )}
              <p className="text-xs text-muted-foreground">
                {t('form.amazonLinkExample')}
              </p>
            </div>

            {/* Internal Star Rating */}
            <div className="space-y-2 animate-fade-up-light-slow">
              <Label>
                {t('form.internalRating')} <span className="text-red-500">*</span>
              </Label>
              <RadioGroup
                value={internalRating.toString()}
                onValueChange={(value) => setInternalRating(parseInt(value))}
              >
                <div className="flex items-center gap-4">
                  {[1, 2, 3, 4, 5].map((rating) => (
                    <div key={rating} className="flex items-center space-x-2">
                      <RadioGroupItem value={rating.toString()} id={`rating-${rating}`} />
                      <Label
                        htmlFor={`rating-${rating}`}
                        className="flex cursor-pointer items-center gap-1"
                      >
                        {rating} <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      </Label>
                    </div>
                  ))}
                </div>
              </RadioGroup>
              <p className="text-xs text-muted-foreground">
                {t('form.ratingNote')}
              </p>
            </div>

            {/* Internal Feedback */}
            <div className="space-y-2 animate-fade-up-medium-slow">
              <Label htmlFor="internalFeedback">
                {t('form.feedback')} <span className="text-red-500">*</span>
              </Label>
              <Textarea
                id="internalFeedback"
                rows={6}
                placeholder={t('form.feedbackPlaceholder')}
                value={internalFeedback}
                onChange={(e) => setInternalFeedback(e.target.value)}
                className={errors.internalFeedback ? 'border-red-500' : ''}
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>{errors.internalFeedback || t('form.minCharacters')}</span>
                <span>{internalFeedback.length} {t('form.characters')}</span>
              </div>
              <p className="text-xs text-muted-foreground">
                {t('form.feedbackNote')}
              </p>
            </div>

            {/* Published Confirmation */}
            <div className="space-y-2 animate-fade-up-heavy-slow">
              <div className="flex items-start gap-2">
                <Checkbox
                  id="publishedOnAmazon"
                  checked={publishedOnAmazon}
                  onCheckedChange={(checked) => setPublishedOnAmazon(checked as boolean)}
                  className={errors.publishedOnAmazon ? 'border-red-500' : ''}
                />
                <div className="space-y-1">
                  <Label htmlFor="publishedOnAmazon" className="cursor-pointer">
                    {t('form.confirmPublished')}{' '}
                    <span className="text-red-500">*</span>
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    {t('form.confirmPublishedNote')}
                  </p>
                  {errors.publishedOnAmazon && (
                    <p className="text-xs text-red-500">{errors.publishedOnAmazon}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex gap-2 pt-4 animate-fade-up-slow">
              <Button type="button" onClick={handleFormSubmit} disabled={isSubmitting} className="flex-1">
                <Send className="mr-2 h-4 w-4" />
                {isSubmitting ? t('form.submitting') : t('form.submit')}
              </Button>
              <Button type="button" variant="outline" onClick={() => router.back()}>
                {t('form.cancel')}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
