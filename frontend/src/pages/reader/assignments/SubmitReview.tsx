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
import { AlertCircle, CheckCircle, ArrowLeft, Star, Send, Loader2 } from 'lucide-react';
import { useNavigate,  useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

export function SubmitReviewPage({ params }: { params: { id: string } }) {
  const { t, i18n } = useTranslation('reviews.submit');
  const assignmentId = params.id;
  const { assignment, isLoading: isLoadingAssignment } = useAssignment(assignmentId);
  const { review, isLoadingReview, submitReview, isSubmitting, isSubmitSuccess } = useReviewSubmission(assignmentId);
  const navigate = useNavigate();
  const routeParams = useParams();

  const [amazonReviewLink, setAmazonReviewLink] = useState('');
  const [internalRating, setInternalRating] = useState(5);
  const [internalFeedback, setInternalFeedback] = useState('');
  const [publishedOnAmazon, setPublishedOnAmazon] = useState(false);
  const [agreedToAmazonTos, setAgreedToAmazonTos] = useState(false);
  const [acknowledgedGuidelines, setAcknowledgedGuidelines] = useState(false);

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Character count limits for review feedback (per Milestone 4.4)
  const MIN_FEEDBACK_CHARACTERS = 150;
  const MAX_FEEDBACK_CHARACTERS = 2000;

  // Amazon review URL pattern validation
  // Valid patterns: amazon.com/review/..., amazon.com/gp/customer-reviews/..., amazon.co.uk/..., etc.
  const isValidAmazonReviewUrl = (url: string): boolean => {
    try {
      const parsed = new URL(url);
      // Check if host is an Amazon domain (amazon.com, amazon.co.uk, amazon.de, etc.)
      const isAmazonDomain = /^(www\.)?amazon\.[a-z]{2,3}(\.[a-z]{2})?$/i.test(parsed.hostname);
      // Check for review-related paths
      const isReviewPath = /\/(review|gp\/customer-reviews|product-reviews)/i.test(parsed.pathname);
      return isAmazonDomain && isReviewPath;
    } catch {
      return false;
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!amazonReviewLink.trim()) {
      newErrors.amazonReviewLink = t('errors.amazonLinkRequired');
    } else if (!isValidAmazonReviewUrl(amazonReviewLink.trim())) {
      newErrors.amazonReviewLink = t('errors.invalidAmazonUrl');
    }

    // Validate star rating is in valid range
    if (internalRating < 1 || internalRating > 5) {
      newErrors.internalRating = t('errors.invalidRating');
    }

    if (internalFeedback.trim().length < MIN_FEEDBACK_CHARACTERS) {
      newErrors.internalFeedback = t('errors.feedbackTooShort', { minChars: MIN_FEEDBACK_CHARACTERS });
    } else if (internalFeedback.trim().length > MAX_FEEDBACK_CHARACTERS) {
      newErrors.internalFeedback = t('errors.feedbackTooLong', { maxChars: MAX_FEEDBACK_CHARACTERS });
    }

    if (!publishedOnAmazon) {
      newErrors.publishedOnAmazon = t('errors.confirmPublished');
    }

    if (!agreedToAmazonTos) {
      newErrors.agreedToAmazonTos = t('errors.tosRequired');
    }

    if (!acknowledgedGuidelines) {
      newErrors.acknowledgedGuidelines = t('errors.guidelinesRequired');
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Check if form is valid for submit button state
  const isFormValid = (): boolean => {
    if (!amazonReviewLink.trim() || !isValidAmazonReviewUrl(amazonReviewLink.trim())) return false;
    if (internalRating < 1 || internalRating > 5) return false;
    if (internalFeedback.trim().length < MIN_FEEDBACK_CHARACTERS) return false;
    if (internalFeedback.trim().length > MAX_FEEDBACK_CHARACTERS) return false;
    if (!publishedOnAmazon) return false;
    if (!agreedToAmazonTos) return false;
    if (!acknowledgedGuidelines) return false;
    return true;
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
      agreedToAmazonTos,
      acknowledgedGuidelines });
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
            <AlertCircle className="animate-bounce-slow mx-auto mb-4 h-16 w-16 text-red-500" />
            <h3 className="mb-2 text-lg font-semibold">{t('notFound.title')}</h3>
            <Button type="button" className="mt-4" onClick={() => navigate(`/${i18n.language}/reader`)}>
              {t('backToDashboard')}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // If review already submitted or just submitted successfully, show confirmation
  if (review || isSubmitSuccess) {
    return (
      <div className="container mx-auto space-y-6 p-6">
        <Button type="button" variant="ghost" className="animate-fade-right" onClick={() => navigate(`/${i18n.language}/reader/assignments/${assignmentId}`)}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          {t('backToAssignment')}
        </Button>

        <Card className="animate-zoom-in border-green-300 bg-green-50 dark:bg-green-950">
          <CardContent className="py-16 text-center">
            <CheckCircle className="animate-bounce-slow mx-auto mb-4 h-16 w-16 text-green-600" />
            <h3 className="mb-2 text-lg font-semibold text-green-900 dark:text-green-100">
              {t('success.title')}
            </h3>
            <p className="mb-4 text-sm text-green-800 dark:text-green-200">
              {t('success.description')}
            </p>
            <div className="flex justify-center gap-2">
              <Button type="button" onClick={() => navigate(`/${i18n.language}/reader`)}>
                {t('backToDashboard')}
              </Button>
              <Button type="button" variant="outline" onClick={() => navigate(`/${i18n.language}/reader/profile`)}>
                {t('viewWallet')}
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
        <Button type="button" variant="ghost" className="mb-4" onClick={() => navigate(`/${i18n.language}/reader/assignments/${assignmentId}`)}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          {t('backToAssignment')}
        </Button>
        <h1 className="text-3xl font-bold">{t('title')}</h1>
        <p className="text-muted-foreground">{t('subtitle', { title: assignment.book.title })}</p>
      </div>

      {/* Important Notice */}
      <Card className="animate-zoom-in border-yellow-300 bg-yellow-50 dark:bg-yellow-950">
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
                  {t('notice.format', {
                    format: assignment.formatAssigned,
                    value: assignment.creditsValue })}
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
            <CardDescription>{t('form.description')}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Amazon Review Link */}
            <div className="animate-fade-up-fast space-y-2">
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
              <p className="text-xs text-muted-foreground">{t('form.amazonLinkExample')}</p>
            </div>

            {/* Internal Star Rating */}
            <div className="animate-fade-up-light-slow space-y-2">
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
              {errors.internalRating && (
                <p className="text-xs text-red-500">{errors.internalRating}</p>
              )}
              <p className="text-xs text-muted-foreground">{t('form.ratingNote')}</p>
            </div>

            {/* Internal Feedback */}
            <div className="animate-fade-up-medium-slow space-y-2">
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
              <div className="flex justify-between text-xs">
                <span className={errors.internalFeedback ? 'text-red-500' : 'text-muted-foreground'}>
                  {errors.internalFeedback || t('form.minCharacters', { minChars: MIN_FEEDBACK_CHARACTERS })}
                </span>
                <span className={internalFeedback.length < MIN_FEEDBACK_CHARACTERS ? 'text-amber-500' : 'text-green-500'}>
                  {internalFeedback.length} / {MIN_FEEDBACK_CHARACTERS} {t('form.characters')}
                </span>
              </div>
              <p className="text-xs text-muted-foreground">{t('form.feedbackNote')}</p>
            </div>

            {/* Amazon TOS Agreement */}
            <div className="animate-fade-up-heavy-slow space-y-2">
              <div className="flex items-start gap-2">
                <Checkbox
                  id="agreedToAmazonTos"
                  checked={agreedToAmazonTos}
                  onCheckedChange={(checked) => setAgreedToAmazonTos(checked as boolean)}
                  className={errors.agreedToAmazonTos ? 'border-red-500' : ''}
                />
                <div className="space-y-1">
                  <Label htmlFor="agreedToAmazonTos" className="cursor-pointer">
                    {t('form.agreedToTos')} <span className="text-red-500">*</span>
                  </Label>
                  <p className="text-xs text-muted-foreground">{t('form.agreedToTosNote')}</p>
                  {errors.agreedToAmazonTos && (
                    <p className="text-xs text-red-500">{errors.agreedToAmazonTos}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Review Guidelines Acknowledgement */}
            <div className="animate-fade-up-heavy-slow space-y-2">
              <div className="flex items-start gap-2">
                <Checkbox
                  id="acknowledgedGuidelines"
                  checked={acknowledgedGuidelines}
                  onCheckedChange={(checked) => setAcknowledgedGuidelines(checked as boolean)}
                  className={errors.acknowledgedGuidelines ? 'border-red-500' : ''}
                />
                <div className="space-y-1">
                  <Label htmlFor="acknowledgedGuidelines" className="cursor-pointer">
                    {t('form.acknowledgedGuidelines')} <span className="text-red-500">*</span>
                  </Label>
                  <p className="text-xs text-muted-foreground">{t('form.acknowledgedGuidelinesNote')}</p>
                  {errors.acknowledgedGuidelines && (
                    <p className="text-xs text-red-500">{errors.acknowledgedGuidelines}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Published Confirmation */}
            <div className="animate-fade-up-heavy-slow space-y-2">
              <div className="flex items-start gap-2">
                <Checkbox
                  id="publishedOnAmazon"
                  checked={publishedOnAmazon}
                  onCheckedChange={(checked) => setPublishedOnAmazon(checked as boolean)}
                  className={errors.publishedOnAmazon ? 'border-red-500' : ''}
                />
                <div className="space-y-1">
                  <Label htmlFor="publishedOnAmazon" className="cursor-pointer">
                    {t('form.confirmPublished')} <span className="text-red-500">*</span>
                  </Label>
                  <p className="text-xs text-muted-foreground">{t('form.confirmPublishedNote')}</p>
                  {errors.publishedOnAmazon && (
                    <p className="text-xs text-red-500">{errors.publishedOnAmazon}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex animate-fade-up-slow gap-2 pt-4">
              <Button
                type="button"
                onClick={handleFormSubmit}
                disabled={isSubmitting || !isFormValid()}
                className="flex-1"
              >
                {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <><Send className="mr-2 h-4 w-4" />{t('form.submit')}</>}
              </Button>
              <Button type="button" variant="outline" onClick={() => navigate(-1)}>
                {t('form.cancel')}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
