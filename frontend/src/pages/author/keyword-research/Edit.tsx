import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { keywordsApi } from '@/lib/api/keywords';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { Loader2, AlertCircle, ArrowLeft } from 'lucide-react';
import { Language, TargetMarket, KeywordResearchStatus } from '@/lib/api/keywords';

const formSchema = z.object({
  bookTitle: z
    .string()
    .min(2, 'Book title is required')
    .max(200, 'Book title must be 200 characters or less'),
  bookSubtitle: z
    .string()
    .max(200, 'Subtitle must be 200 characters or less')
    .optional(),
  genre: z.string().min(2, 'Genre is required'),
  category: z.string().min(2, 'Category is required'),
  description: z
    .string()
    .min(100, 'Short description must be at least 100 characters')
    .max(500, 'Short description must be 500 characters or less'),
  targetAudience: z
    .string()
    .min(50, 'Target audience description must be at least 50 characters')
    .max(200, 'Target audience description must be 200 characters or less'),
  competingBooks: z.string().optional(),
  specificKeywords: z.string().optional(),
  bookLanguage: z.nativeEnum(Language),
  targetMarket: z.nativeEnum(TargetMarket),
  additionalNotes: z.string().optional() });

type FormValues = z.infer<typeof formSchema>;

export function EditKeywordResearchPage() {
  const { t, i18n } = useTranslation('keyword-research');
  const tNew = useTranslation('keyword-research.new').t;
  const tEdit = useTranslation('keyword-research.edit').t;
  const navigate = useNavigate();
  const params = useParams();
  const id = params.id as string;

  const [research, setResearch] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);

  // Fetch keyword research
  useEffect(() => {
    const fetchResearch = async () => {
      try {
        setIsLoading(true);
        const data = await keywordsApi.getById(id);
        setResearch(data);
      } catch (error: any) {
        console.error('Research error:', error);
        toast.error('Failed to load keyword research');
      } finally {
        setIsLoading(false);
      }
    };
    if (id) {
      fetchResearch();
    }
  }, [id]);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      bookTitle: '',
      bookSubtitle: '',
      genre: '',
      category: '',
      description: '',
      targetAudience: '',
      competingBooks: '',
      specificKeywords: '',
      bookLanguage: Language.EN,
      targetMarket: TargetMarket.US,
      additionalNotes: '' } });

  // Populate form with existing data
  useEffect(() => {
    if (research) {
      form.reset({
        bookTitle: research.bookTitle,
        bookSubtitle: research.bookSubtitle || '',
        genre: research.genre,
        category: research.category,
        description: research.description,
        targetAudience: research.targetAudience,
        competingBooks: research.competingBooks || '',
        specificKeywords: research.specificKeywords || '',
        bookLanguage: research.bookLanguage,
        targetMarket: research.targetMarket,
        additionalNotes: research.additionalNotes || '' });
    }
  }, [research, form]);

  const handleSubmit = async () => {
    const isValid = await form.trigger();
    if (!isValid) return;

    const data = form.getValues();
    try {
      setIsUpdating(true);
      await keywordsApi.update(id, data);
      toast.success('Keyword research updated successfully');
      navigate(`/author/keyword-research/${id}`);
    } catch (error: any) {
      console.error('Failed to update keyword research:', error);
      const message = error.response?.data?.message || 'Failed to update keyword research';
      toast.error(message);
    } finally {
      setIsUpdating(false);
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto max-w-4xl px-4 py-8">
        {/* Header Skeleton */}
        <div className="mb-8">
          <Skeleton className="mb-4 h-8 w-32 animate-pulse" />
          <Skeleton className="h-10 w-64 animate-pulse" />
          <Skeleton className="mt-2 h-5 w-96 animate-pulse" />
        </div>
        {/* Form Card Skeletons */}
        {[1, 2].map((i) => (
          <Card key={i} className="mb-6">
            <CardHeader>
              <Skeleton className="h-6 w-40 animate-pulse" />
              <Skeleton className="mt-1 h-4 w-64 animate-pulse" />
            </CardHeader>
            <CardContent className="space-y-4">
              {[1, 2, 3].map((j) => (
                <div key={j}>
                  <Skeleton className="h-4 w-24 animate-pulse" />
                  <Skeleton className="mt-2 h-10 w-full animate-pulse" />
                  <Skeleton className="mt-1 h-3 w-48 animate-pulse" />
                </div>
              ))}
            </CardContent>
          </Card>
        ))}
        {/* Submit Button Skeleton */}
        <div className="flex justify-end gap-4">
          <Skeleton className="h-10 w-24 animate-pulse" />
          <Skeleton className="h-10 w-32 animate-pulse" />
        </div>
      </div>
    );
  }

  if (!research) {
    return (
      <div className="container mx-auto max-w-4xl px-4 py-8">
        <Card>
          <CardContent className="py-12">
            <div className="text-center">
              <AlertCircle className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
              <h3 className="mb-2 text-lg font-semibold">Keyword research not found</h3>
              <p className="text-muted-foreground">
                The requested keyword research could not be found.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Check if editing is allowed (only PENDING status)
  if (research.status !== KeywordResearchStatus.PENDING) {
    return (
      <div className="container mx-auto max-w-4xl px-4 py-8">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Cannot Edit</AlertTitle>
          <AlertDescription>{tEdit('cannotEdit')}</AlertDescription>
        </Alert>
        <div className="mt-4">
          <Button type="button" variant="outline" onClick={() => navigate(`/author/keyword-research/${id}`)}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Details
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-4xl px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <Button
          variant="ghost"
          onClick={() => navigate(`/author/keyword-research/${id}`)}
          className="mb-4"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Details
        </Button>
        <h1 className="text-3xl font-bold">{tEdit('title')}</h1>
        <p className="mt-2 text-muted-foreground">{tEdit('subtitle')}</p>
      </div>

      <Form {...form}>
        <div className="space-y-6">
          {/* Book Information */}
          <Card>
            <CardHeader>
              <CardTitle>{tNew('steps.bookInfo')}</CardTitle>
              <CardDescription>Update book information for keyword research</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="bookTitle"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{tNew('fields.bookTitle.label')}</FormLabel>
                    <FormControl>
                      <Input placeholder={tNew('fields.bookTitle.placeholder')} {...field} />
                    </FormControl>
                    <FormDescription>{tNew('fields.bookTitle.description')}</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="bookSubtitle"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Subtitle (Optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter book subtitle if applicable" {...field} />
                    </FormControl>
                    <FormDescription>Optional subtitle, max 200 characters</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Book Details */}
          <Card>
            <CardHeader>
              <CardTitle>{tNew('steps.details')}</CardTitle>
              <CardDescription>Provide detailed information about your book</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="genre"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{tNew('fields.genre.label')}</FormLabel>
                      <FormControl>
                        <Input placeholder={tNew('fields.genre.placeholder')} {...field} />
                      </FormControl>
                      <FormDescription>{tNew('fields.genre.description')}</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="bookLanguage"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{tNew('fields.bookLanguage.label')}</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value={Language.EN}>English</SelectItem>
                          <SelectItem value={Language.ES}>Spanish</SelectItem>
                          <SelectItem value={Language.PT}>Portuguese</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormDescription>{tNew('fields.bookLanguage.description')}</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="targetMarket"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{tNew('fields.targetMarket.label')}</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value={TargetMarket.US}>
                          Amazon United States (amazon.com)
                        </SelectItem>
                        <SelectItem value={TargetMarket.BR}>
                          Amazon Brazil (amazon.com.br)
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <FormDescription>{tNew('fields.targetMarket.description')}</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{tNew('fields.category.label')}</FormLabel>
                    <FormControl>
                      <Input placeholder={tNew('fields.category.placeholder')} {...field} />
                    </FormControl>
                    <FormDescription>{tNew('fields.category.description')}</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{tNew('fields.description.label')}</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder={tNew('fields.description.placeholder')}
                        rows={4}
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>{tNew('fields.description.description')}</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="targetAudience"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{tNew('fields.targetAudience.label')}</FormLabel>
                    <FormControl>
                      <Input placeholder={tNew('fields.targetAudience.placeholder')} {...field} />
                    </FormControl>
                    <FormDescription>{tNew('fields.targetAudience.description')}</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="competingBooks"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{tNew('fields.competingBooks.label')}</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder={tNew('fields.competingBooks.placeholder')}
                        rows={3}
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>{tNew('fields.competingBooks.description')}</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="specificKeywords"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Specific Keywords (Optional)</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Enter any specific keywords you want included, separated by commas"
                        rows={3}
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Any specific keywords you want us to consider including in the research
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="additionalNotes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{tNew('fields.additionalNotes.label')}</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder={tNew('fields.additionalNotes.placeholder')}
                        rows={3}
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>{tNew('fields.additionalNotes.description')}</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Submit */}
          <div className="flex justify-end gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate(`/author/keyword-research/${id}`)}
            >
              Cancel
            </Button>
            <Button type="button" onClick={handleSubmit} disabled={isUpdating}>
              {isUpdating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {tEdit('submitting')}
                </>
              ) : (
                tEdit('submit')
              )}
            </Button>
          </div>
        </div>
      </Form>
    </div>
  );
}
