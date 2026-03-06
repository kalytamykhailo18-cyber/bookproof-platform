import { useState, useEffect, useRef } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { Loader2, Save, Plus, Trash2, Eye, Upload, Image as ImageIcon, X } from 'lucide-react';
import { toast } from 'sonner';

import {
  getAllLandingPages,
  updateLandingPage,
  uploadCmsImage,
  Language,
  LandingPageContent,
  parseContent,
  HeroContent,
  FaqItem,
  Testimonial,
  PricingPackage,
} from '@/lib/api/landing-pages';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { RichTextEditor } from '@/components/ui/rich-text-editor';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

const LANGUAGE_NAMES: Record<Language, string> = {
  EN: 'English',
  PT: 'Portuguese',
  ES: 'Spanish',
};

// Default content structure
const DEFAULT_HERO: HeroContent = {
  titleLine1: 'Get Real Amazon Reviews',
  titleLine2: 'From Verified Readers',
  titleLine3: 'Launch Your Book to Success',
  subtitle: 'Connect with passionate readers who will provide honest reviews for your book.',
  ctaPrimary: 'Get Started Free',
  ctaSecondary: 'See How It Works',
};

const DEFAULT_FAQ: FaqItem[] = [
  { key: 'q1', question: 'How does BookProof work?', answer: 'BookProof connects authors with verified readers who provide honest reviews.' },
  { key: 'q2', question: 'Are the reviews genuine?', answer: 'Yes, all reviews are written by real readers who have read your book.' },
];

const DEFAULT_TESTIMONIALS: Testimonial[] = [
  { key: 't1', quote: 'BookProof transformed my book launch!', author: 'Sarah J.', title: 'Romance Author', rating: 5, industry: 'Romance' },
];

const DEFAULT_PRICING: PricingPackage[] = [
  {
    key: 'starter',
    name: 'Starter',
    credits: '5',
    reviews: '5',
    duration: '30 days',
    validity: '60 days',
    features: ['5 Guaranteed Reviews', 'Email Support', 'Basic Analytics'],
    isPopular: false,
    isEnterprise: false,
  },
  {
    key: 'professional',
    name: 'Professional',
    credits: '15',
    reviews: '15',
    duration: '45 days',
    validity: '90 days',
    features: ['15 Guaranteed Reviews', 'Priority Support', 'Advanced Analytics', '14-Day Guarantee'],
    isPopular: true,
    isEnterprise: false,
  },
  {
    key: 'enterprise',
    name: 'Enterprise',
    credits: '50+',
    reviews: '50+',
    duration: 'Custom',
    validity: 'Custom',
    features: ['Unlimited Reviews', 'Dedicated Account Manager', 'Custom Campaigns', 'API Access'],
    isPopular: false,
    isEnterprise: true,
  },
];

interface FaqSectionForm {
  badge: string;
  title: string;
  subtitle: string;
  items: FaqItem[];
  stillHaveTitle: string;
  stillHaveDesc: string;
}

interface TestimonialsSectionForm {
  badge: string;
  title: string;
  subtitle: string;
  rating: string;
  items: Testimonial[];
}

interface PricingSectionForm {
  badge: string;
  title: string;
  subtitle: string;
  packages: PricingPackage[];
  ctaText: string;
  enterpriseCta: string;
  note: string;
}

interface HeroContentForm extends HeroContent {
  heroImage?: string;
}

interface ContentFormData {
  hero: HeroContentForm;
  faq: FaqSectionForm;
  testimonials: TestimonialsSectionForm;
  pricing: PricingSectionForm;
}

export function ContentEditor() {
  const [selectedLanguage, setSelectedLanguage] = useState<Language>('EN');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [pages, setPages] = useState<any[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const form = useForm<ContentFormData>({
    defaultValues: {
      hero: DEFAULT_HERO,
      faq: {
        badge: 'FAQ',
        title: 'Frequently Asked Questions',
        subtitle: 'Everything you need to know',
        items: DEFAULT_FAQ,
        stillHaveTitle: 'Still have questions?',
        stillHaveDesc: 'Our team is here to help',
      },
      testimonials: {
        badge: 'Success Stories',
        title: 'Authors Who Transformed Their Amazon Presence',
        subtitle: 'Join hundreds of successful authors',
        rating: '4.9 average from 500+ authors',
        items: DEFAULT_TESTIMONIALS,
      },
      pricing: {
        badge: 'Pricing',
        title: 'Choose Your Review Package',
        subtitle: 'Transparent pricing with guaranteed results',
        packages: DEFAULT_PRICING,
        ctaText: 'Get Started',
        enterpriseCta: 'Contact Sales',
        note: 'All packages include our 14-day replacement guarantee',
      },
    },
  });

  const { fields: faqFields, append: appendFaq, remove: removeFaq } = useFieldArray({
    control: form.control,
    name: 'faq.items',
  });

  const { fields: testimonialFields, append: appendTestimonial, remove: removeTestimonial } = useFieldArray({
    control: form.control,
    name: 'testimonials.items',
  });

  const { fields: pricingFields, append: appendPricing, remove: removePricing } = useFieldArray({
    control: form.control,
    name: 'pricing.packages',
  });

  const fetchPages = async () => {
    try {
      setIsLoading(true);
      const data = await getAllLandingPages();
      setPages(data);
      loadContentForLanguage(data, selectedLanguage);
    } catch (error) {
      console.error('Error loading pages:', error);
      toast.error('Failed to load landing pages');
    } finally {
      setIsLoading(false);
    }
  };

  const loadContentForLanguage = (pagesData: any[], language: Language) => {
    const page = pagesData.find((p) => p.language === language);
    if (page && page.content) {
      const content = parseContent(page.content);

      // Load hero content
      if (content.hero) {
        form.setValue('hero', { ...DEFAULT_HERO, ...content.hero });
      } else {
        form.setValue('hero', DEFAULT_HERO);
      }

      // Load FAQ content
      if (content.faq) {
        form.setValue('faq', {
          badge: content.faq.badge || 'FAQ',
          title: content.faq.title || 'Frequently Asked Questions',
          subtitle: content.faq.subtitle || 'Everything you need to know',
          items: content.faq.items?.length ? content.faq.items : DEFAULT_FAQ,
          stillHaveTitle: content.faq.stillHaveTitle || 'Still have questions?',
          stillHaveDesc: content.faq.stillHaveDesc || 'Our team is here to help',
        });
      }

      // Load testimonials content
      if (content.testimonials) {
        form.setValue('testimonials', {
          badge: content.testimonials.badge || 'Success Stories',
          title: content.testimonials.title || 'Authors Who Transformed Their Amazon Presence',
          subtitle: content.testimonials.subtitle || 'Join hundreds of successful authors',
          rating: content.testimonials.rating || '4.9 average from 500+ authors',
          items: content.testimonials.items?.length ? content.testimonials.items : DEFAULT_TESTIMONIALS,
        });
      }

      // Load pricing content
      if (content.pricing) {
        form.setValue('pricing', {
          badge: content.pricing.badge || 'Pricing',
          title: content.pricing.title || 'Choose Your Review Package',
          subtitle: content.pricing.subtitle || 'Transparent pricing with guaranteed results',
          packages: content.pricing.packages?.length ? content.pricing.packages : DEFAULT_PRICING,
          ctaText: content.pricing.ctaText || 'Get Started',
          enterpriseCta: content.pricing.enterpriseCta || 'Contact Sales',
          note: content.pricing.note || 'All packages include our 14-day replacement guarantee',
        });
      }
    }
  };

  useEffect(() => {
    fetchPages();
  }, []);

  useEffect(() => {
    if (pages.length > 0) {
      loadContentForLanguage(pages, selectedLanguage);
    }
  }, [selectedLanguage, pages]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      toast.error('Invalid file type. Allowed: JPG, PNG, WebP');
      return;
    }

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('File size exceeds 5MB limit');
      return;
    }

    try {
      setIsUploading(true);
      const result = await uploadCmsImage(file, 'hero');
      form.setValue('hero.heroImage', result.url);
      toast.success('Image uploaded successfully');
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Failed to upload image');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      const formData = form.getValues();

      // Build content object
      const content: LandingPageContent = {
        hero: formData.hero,
        faq: {
          badge: formData.faq.badge,
          title: formData.faq.title,
          subtitle: formData.faq.subtitle,
          items: formData.faq.items,
          stillHaveTitle: formData.faq.stillHaveTitle,
          stillHaveDesc: formData.faq.stillHaveDesc,
        },
        testimonials: {
          badge: formData.testimonials.badge,
          title: formData.testimonials.title,
          subtitle: formData.testimonials.subtitle,
          rating: formData.testimonials.rating,
          items: formData.testimonials.items,
        },
        pricing: {
          badge: formData.pricing.badge,
          title: formData.pricing.title,
          subtitle: formData.pricing.subtitle,
          packages: formData.pricing.packages,
          ctaText: formData.pricing.ctaText,
          enterpriseCta: formData.pricing.enterpriseCta,
          note: formData.pricing.note,
          allInclude: [],
        },
      };

      await updateLandingPage({
        language: selectedLanguage,
        content: JSON.stringify(content),
      });

      toast.success(`${LANGUAGE_NAMES[selectedLanguage]} content saved successfully`);
      await fetchPages();
    } catch (error) {
      console.error('Error saving content:', error);
      toast.error('Failed to save content');
    } finally {
      setIsSaving(false);
    }
  };

  const handlePreview = () => {
    window.open('/', '_blank');
  };

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const heroImage = form.watch('hero.heroImage');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Content Editor</h3>
          <p className="text-sm text-muted-foreground">Edit landing page content for each language</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" onClick={handlePreview}>
            <Eye className="mr-2 h-4 w-4" />
            Preview
          </Button>
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Save Changes
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Language Selector */}
      <div className="flex items-center gap-4">
        <Label>Language:</Label>
        <div className="flex gap-2">
          {(['EN', 'PT', 'ES'] as Language[]).map((lang) => (
            <Button
              key={lang}
              variant={selectedLanguage === lang ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedLanguage(lang)}
            >
              {LANGUAGE_NAMES[lang]}
            </Button>
          ))}
        </div>
      </div>

      {/* Content Sections */}
      <Accordion type="multiple" defaultValue={['hero']} className="space-y-4">
        {/* Hero Section Editor */}
        <AccordionItem value="hero" className="border rounded-lg">
          <AccordionTrigger className="px-4 hover:no-underline">
            <div className="flex items-center justify-between w-full pr-4">
              <div className="flex items-center gap-2">
                <span className="font-semibold">Hero Section</span>
                <Badge variant="outline" className="ml-2">Required</Badge>
              </div>
            </div>
          </AccordionTrigger>
          <AccordionContent className="px-4 pb-4">
            <p className="text-sm text-muted-foreground mb-4">Main headline, subtitle, and call-to-action buttons</p>
            <div className="space-y-4">
              {/* Hero Image Upload */}
              <div className="space-y-2">
                <Label>Hero Image</Label>
                <div className="flex items-start gap-4">
                  {heroImage ? (
                    <div className="relative">
                      <img
                        src={heroImage}
                        alt="Hero"
                        className="w-40 h-24 object-cover rounded-md border"
                      />
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        className="absolute -top-2 -right-2 h-6 w-6 p-0 rounded-full"
                        onClick={() => form.setValue('hero.heroImage', '')}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  ) : (
                    <div className="w-40 h-24 border-2 border-dashed rounded-md flex items-center justify-center bg-muted/50">
                      <ImageIcon className="h-8 w-8 text-muted-foreground" />
                    </div>
                  )}
                  <div>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={isUploading}
                    >
                      {isUploading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Uploading...
                        </>
                      ) : (
                        <>
                          <Upload className="mr-2 h-4 w-4" />
                          Upload Image
                        </>
                      )}
                    </Button>
                    <p className="text-xs text-muted-foreground mt-1">JPG, PNG, WebP (max 5MB)</p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="titleLine1">Title Line 1</Label>
                  <Input
                    id="titleLine1"
                    {...form.register('hero.titleLine1')}
                    placeholder="Get Real Amazon Reviews"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="titleLine2">Title Line 2 (Highlighted)</Label>
                  <Input
                    id="titleLine2"
                    {...form.register('hero.titleLine2')}
                    placeholder="From Verified Readers"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="titleLine3">Title Line 3 (Optional)</Label>
                <Input
                  id="titleLine3"
                  {...form.register('hero.titleLine3')}
                  placeholder="Launch Your Book to Success"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="subtitle">Subtitle</Label>
                <Textarea
                  id="subtitle"
                  {...form.register('hero.subtitle')}
                  placeholder="Connect with passionate readers..."
                  rows={2}
                />
              </div>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="ctaPrimary">Primary CTA Button</Label>
                  <Input
                    id="ctaPrimary"
                    {...form.register('hero.ctaPrimary')}
                    placeholder="Get Started Free"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="ctaSecondary">Secondary CTA Button</Label>
                  <Input
                    id="ctaSecondary"
                    {...form.register('hero.ctaSecondary')}
                    placeholder="See How It Works"
                  />
                </div>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Pricing Section Editor */}
        <AccordionItem value="pricing" className="border rounded-lg">
          <AccordionTrigger className="px-4 hover:no-underline">
            <div className="flex items-center justify-between w-full pr-4">
              <div className="flex items-center gap-2">
                <span className="font-semibold">Pricing Section</span>
                <Badge variant="outline" className="ml-2">{pricingFields.length} packages</Badge>
              </div>
            </div>
          </AccordionTrigger>
          <AccordionContent className="px-4 pb-4">
            <p className="text-sm text-muted-foreground mb-4">Package prices and features</p>
            <div className="space-y-4">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <div className="space-y-2">
                  <Label>Badge</Label>
                  <Input {...form.register('pricing.badge')} placeholder="Pricing" />
                </div>
                <div className="space-y-2">
                  <Label>Title</Label>
                  <Input {...form.register('pricing.title')} placeholder="Choose Your Review Package" />
                </div>
                <div className="space-y-2">
                  <Label>Subtitle</Label>
                  <Input {...form.register('pricing.subtitle')} placeholder="Transparent pricing..." />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>CTA Button Text</Label>
                  <Input {...form.register('pricing.ctaText')} placeholder="Get Started" />
                </div>
                <div className="space-y-2">
                  <Label>Enterprise CTA Text</Label>
                  <Input {...form.register('pricing.enterpriseCta')} placeholder="Contact Sales" />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Note (shown below packages)</Label>
                <Input {...form.register('pricing.note')} placeholder="All packages include..." />
              </div>

              <div className="border-t pt-4">
                <div className="flex items-center justify-between mb-4">
                  <Label className="text-sm font-medium">Packages</Label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => appendPricing({
                      key: `pkg${Date.now()}`,
                      name: '',
                      credits: '',
                      reviews: '',
                      duration: '',
                      validity: '',
                      features: [],
                      isPopular: false,
                      isEnterprise: false,
                    })}
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Add Package
                  </Button>
                </div>
                <div className="space-y-4">
                  {pricingFields.map((field, index) => (
                    <div key={field.id} className="border rounded-lg p-4 space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-muted-foreground">Package {index + 1}</span>
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-2">
                            <Switch
                              id={`popular-${index}`}
                              checked={form.watch(`pricing.packages.${index}.isPopular`)}
                              onCheckedChange={(checked) => form.setValue(`pricing.packages.${index}.isPopular`, checked)}
                            />
                            <Label htmlFor={`popular-${index}`} className="text-xs">Popular</Label>
                          </div>
                          <div className="flex items-center gap-2">
                            <Switch
                              id={`enterprise-${index}`}
                              checked={form.watch(`pricing.packages.${index}.isEnterprise`)}
                              onCheckedChange={(checked) => form.setValue(`pricing.packages.${index}.isEnterprise`, checked)}
                            />
                            <Label htmlFor={`enterprise-${index}`} className="text-xs">Enterprise</Label>
                          </div>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removePricing(index)}
                            className="text-destructive hover:text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                        <div className="space-y-1">
                          <Label className="text-xs">Name</Label>
                          <Input
                            {...form.register(`pricing.packages.${index}.name`)}
                            placeholder="Starter"
                          />
                        </div>
                        <div className="space-y-1">
                          <Label className="text-xs">Credits</Label>
                          <Input
                            {...form.register(`pricing.packages.${index}.credits`)}
                            placeholder="5"
                          />
                        </div>
                        <div className="space-y-1">
                          <Label className="text-xs">Reviews</Label>
                          <Input
                            {...form.register(`pricing.packages.${index}.reviews`)}
                            placeholder="5"
                          />
                        </div>
                        <div className="space-y-1">
                          <Label className="text-xs">Duration</Label>
                          <Input
                            {...form.register(`pricing.packages.${index}.duration`)}
                            placeholder="30 days"
                          />
                        </div>
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs">Features (comma-separated)</Label>
                        <Input
                          value={form.watch(`pricing.packages.${index}.features`)?.join(', ') || ''}
                          onChange={(e) => {
                            const features = e.target.value.split(',').map(f => f.trim()).filter(Boolean);
                            form.setValue(`pricing.packages.${index}.features`, features);
                          }}
                          placeholder="5 Reviews, Email Support, Basic Analytics"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* FAQ Section Editor */}
        <AccordionItem value="faq" className="border rounded-lg">
          <AccordionTrigger className="px-4 hover:no-underline">
            <div className="flex items-center justify-between w-full pr-4">
              <div className="flex items-center gap-2">
                <span className="font-semibold">FAQ Section</span>
                <Badge variant="outline" className="ml-2">{faqFields.length} items</Badge>
              </div>
            </div>
          </AccordionTrigger>
          <AccordionContent className="px-4 pb-4">
            <p className="text-sm text-muted-foreground mb-4">Frequently asked questions and answers</p>
            <div className="space-y-4">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <div className="space-y-2">
                  <Label>Badge</Label>
                  <Input {...form.register('faq.badge')} placeholder="FAQ" />
                </div>
                <div className="space-y-2">
                  <Label>Title</Label>
                  <Input {...form.register('faq.title')} placeholder="Frequently Asked Questions" />
                </div>
                <div className="space-y-2">
                  <Label>Subtitle</Label>
                  <Input {...form.register('faq.subtitle')} placeholder="Everything you need to know" />
                </div>
              </div>

              <div className="border-t pt-4">
                <div className="flex items-center justify-between mb-4">
                  <Label className="text-sm font-medium">Questions</Label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => appendFaq({ key: `q${Date.now()}`, question: '', answer: '' })}
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Add Question
                  </Button>
                </div>
                <div className="space-y-3">
                  {faqFields.map((field, index) => (
                    <div key={field.id} className="border rounded-lg p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-muted-foreground">Question {index + 1}</span>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeFaq(index)}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                      <div className="space-y-2">
                        <Input
                          {...form.register(`faq.items.${index}.question`)}
                          placeholder="Question"
                        />
                        <RichTextEditor
                          value={form.watch(`faq.items.${index}.answer`) || ''}
                          onChange={(value) => form.setValue(`faq.items.${index}.answer`, value)}
                          placeholder="Answer (supports rich text formatting)"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 border-t pt-4">
                <div className="space-y-2">
                  <Label>Still Have Questions Title</Label>
                  <Input {...form.register('faq.stillHaveTitle')} placeholder="Still have questions?" />
                </div>
                <div className="space-y-2">
                  <Label>Still Have Questions Description</Label>
                  <Input {...form.register('faq.stillHaveDesc')} placeholder="Our team is here to help" />
                </div>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Testimonials Section Editor */}
        <AccordionItem value="testimonials" className="border rounded-lg">
          <AccordionTrigger className="px-4 hover:no-underline">
            <div className="flex items-center justify-between w-full pr-4">
              <div className="flex items-center gap-2">
                <span className="font-semibold">Testimonials Section</span>
                <Badge variant="outline" className="ml-2">{testimonialFields.length} items</Badge>
              </div>
            </div>
          </AccordionTrigger>
          <AccordionContent className="px-4 pb-4">
            <p className="text-sm text-muted-foreground mb-4">Customer quotes and success stories</p>
            <div className="space-y-4">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Badge</Label>
                  <Input {...form.register('testimonials.badge')} placeholder="Success Stories" />
                </div>
                <div className="space-y-2">
                  <Label>Rating Text</Label>
                  <Input {...form.register('testimonials.rating')} placeholder="4.9 average from 500+ authors" />
                </div>
              </div>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Title</Label>
                  <Input {...form.register('testimonials.title')} placeholder="Authors Who Transformed..." />
                </div>
                <div className="space-y-2">
                  <Label>Subtitle</Label>
                  <Input {...form.register('testimonials.subtitle')} placeholder="Join hundreds of..." />
                </div>
              </div>

              <div className="border-t pt-4">
                <div className="flex items-center justify-between mb-4">
                  <Label className="text-sm font-medium">Testimonials</Label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => appendTestimonial({
                      key: `t${Date.now()}`,
                      quote: '',
                      author: '',
                      title: '',
                      rating: 5,
                      industry: '',
                    })}
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Add Testimonial
                  </Button>
                </div>
                <div className="space-y-3">
                  {testimonialFields.map((field, index) => (
                    <div key={field.id} className="border rounded-lg p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-muted-foreground">Testimonial {index + 1}</span>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeTestimonial(index)}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                      <div className="space-y-3">
                        <Textarea
                          {...form.register(`testimonials.items.${index}.quote`)}
                          placeholder="Quote"
                          rows={2}
                        />
                        <div className="grid grid-cols-2 gap-3">
                          <Input
                            {...form.register(`testimonials.items.${index}.author`)}
                            placeholder="Author Name"
                          />
                          <Input
                            {...form.register(`testimonials.items.${index}.title`)}
                            placeholder="Title (e.g., Romance Author)"
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <Input
                            {...form.register(`testimonials.items.${index}.industry`)}
                            placeholder="Industry (e.g., Romance)"
                          />
                          <div className="flex items-center gap-2">
                            <Label className="text-sm">Rating:</Label>
                            <Input
                              type="number"
                              min={1}
                              max={5}
                              {...form.register(`testimonials.items.${index}.rating`, { valueAsNumber: true })}
                              className="w-20"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      {/* Save Button (Bottom) */}
      <div className="flex justify-end pt-4 border-t">
        <Button onClick={handleSave} disabled={isSaving} size="lg">
          {isSaving ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" />
              Save All Changes
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
