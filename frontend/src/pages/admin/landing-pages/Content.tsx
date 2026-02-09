import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue } from '@/components/ui/select';
import { Plus, Trash2, Save, Upload, Eye, ArrowUp, ArrowDown } from 'lucide-react';
import { toast } from 'sonner';
import { useLandingPage, useUpdateLandingPage } from '@/hooks/useLandingPages';
import type { Language } from '@/lib/api/landing-pages';

interface HeroContent {
  title: string;
  subtitle: string;
  primaryCtaText: string;
  primaryCtaLink: string;
  secondaryCtaText?: string;
  secondaryCtaLink?: string;
  heroImageUrl?: string;
}

interface FeatureItem {
  id: string;
  icon: string;
  title: string;
  description: string;
}

interface TestimonialItem {
  id: string;
  quote: string;
  authorName: string;
  authorTitle: string;
  rating: number;
  avatarUrl?: string;
}

interface FaqItem {
  id: string;
  question: string;
  answer: string;
}

interface LandingPageContent {
  hero?: HeroContent;
  features?: FeatureItem[];
  testimonials?: TestimonialItem[];
  faqs?: FaqItem[];
}

export function LandingPageContentEditor() {
  const { t, i18n } = useTranslation('admin-landing-pages');

  const [selectedLanguage, setSelectedLanguage] = useState<Language>('EN');
  const { data: landingPage, isLoading } = useLandingPage(selectedLanguage);
  const updateMutation = useUpdateLandingPage();

  // Parse content from JSON
  const content: LandingPageContent = landingPage?.content
    ? JSON.parse(landingPage.content)
    : {};

  const [heroContent, setHeroContent] = useState<HeroContent>(
    content.hero || {
      title: '',
      subtitle: '',
      primaryCtaText: '',
      primaryCtaLink: '' },
  );

  const [features, setFeatures] = useState<FeatureItem[]>(
    content.features || [],
  );

  const [testimonials, setTestimonials] = useState<TestimonialItem[]>(
    content.testimonials || [],
  );

  const [faqs, setFaqs] = useState<FaqItem[]>(content.faqs || []);

  // Update state when data loads or language changes
  useEffect(() => {
    if (landingPage?.content) {
      const parsedContent: LandingPageContent = JSON.parse(landingPage.content);
      if (parsedContent.hero) setHeroContent(parsedContent.hero);
      if (parsedContent.features) setFeatures(parsedContent.features);
      if (parsedContent.testimonials) setTestimonials(parsedContent.testimonials);
      if (parsedContent.faqs) setFaqs(parsedContent.faqs);
    }
  }, [landingPage?.content]);

  const handleSave = async () => {
    const updatedContent: LandingPageContent = {
      hero: heroContent,
      features,
      testimonials,
      faqs };

    try {
      await updateMutation.mutateAsync({
        language: selectedLanguage,
        content: JSON.stringify(updatedContent) });

      toast.success('Landing page content updated successfully');
    } catch (error) {
      toast.error('Failed to update landing page content');
    }
  };

  // Feature handlers
  const addFeature = () => {
    setFeatures([
      ...features,
      {
        id: `feature-${Date.now()}`,
        icon: '',
        title: '',
        description: '' },
    ]);
  };

  const updateFeature = (id: string, field: keyof FeatureItem, value: string) => {
    setFeatures(
      features.map((f) => (f.id === id ? { ...f, [field]: value } : f)),
    );
  };

  const removeFeature = (id: string) => {
    setFeatures(features.filter((f) => f.id !== id));
  };

  const moveFeature = (id: string, direction: 'up' | 'down') => {
    const index = features.findIndex((f) => f.id === id);
    if (index === -1) return;

    const newFeatures = [...features];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;

    if (targetIndex < 0 || targetIndex >= features.length) return;

    [newFeatures[index], newFeatures[targetIndex]] = [
      newFeatures[targetIndex],
      newFeatures[index],
    ];

    setFeatures(newFeatures);
  };

  // Testimonial handlers
  const addTestimonial = () => {
    setTestimonials([
      ...testimonials,
      {
        id: `testimonial-${Date.now()}`,
        quote: '',
        authorName: '',
        authorTitle: '',
        rating: 5 },
    ]);
  };

  const updateTestimonial = (
    id: string,
    field: keyof TestimonialItem,
    value: string | number,
  ) => {
    setTestimonials(
      testimonials.map((t) => (t.id === id ? { ...t, [field]: value } : t)),
    );
  };

  const removeTestimonial = (id: string) => {
    setTestimonials(testimonials.filter((t) => t.id !== id));
  };

  // FAQ handlers
  const addFaq = () => {
    setFaqs([
      ...faqs,
      {
        id: `faq-${Date.now()}`,
        question: '',
        answer: '' },
    ]);
  };

  const updateFaq = (id: string, field: keyof FaqItem, value: string) => {
    setFaqs(faqs.map((f) => (f.id === id ? { ...f, [field]: value } : f)));
  };

  const removeFaq = (id: string) => {
    setFaqs(faqs.filter((f) => f.id !== id));
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Landing Page Content Editor</h1>
          <p className="text-muted-foreground">
            Edit all landing page sections without touching code
          </p>
        </div>
        <div className="flex items-center gap-4">
          <Select
            value={selectedLanguage}
            onValueChange={(value) => setSelectedLanguage(value as Language)}
          >
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="EN">English</SelectItem>
              <SelectItem value="PT">Português</SelectItem>
              <SelectItem value="ES">Español</SelectItem>
            </SelectContent>
          </Select>
          <Button type="button" onClick={handleSave} disabled={updateMutation.isPending}>
            <Save className="mr-2 h-4 w-4" />
            Save Changes
          </Button>
        </div>
      </div>

      {/* Tabs for different sections */}
      <Tabs defaultValue="hero" className="space-y-6">
        <TabsList>
          <TabsTrigger value="hero">Hero Section</TabsTrigger>
          <TabsTrigger value="features">Features</TabsTrigger>
          <TabsTrigger value="testimonials">Testimonials</TabsTrigger>
          <TabsTrigger value="faqs">FAQs</TabsTrigger>
        </TabsList>

        {/* Hero Section Editor */}
        <TabsContent value="hero">
          <Card>
            <CardHeader>
              <CardTitle>Hero Section</CardTitle>
              <CardDescription>
                Main headline, subtitle, and call-to-action buttons
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="hero-title">Main Headline</Label>
                <Input
                  id="hero-title"
                  placeholder="Enter main headline"
                  value={heroContent.title}
                  onChange={(e) =>
                    setHeroContent({ ...heroContent, title: e.target.value })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="hero-subtitle">Subtitle</Label>
                <Textarea
                  id="hero-subtitle"
                  placeholder="Enter subtitle"
                  rows={3}
                  value={heroContent.subtitle}
                  onChange={(e) =>
                    setHeroContent({ ...heroContent, subtitle: e.target.value })
                  }
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="primary-cta-text">Primary CTA Text</Label>
                  <Input
                    id="primary-cta-text"
                    placeholder="e.g., Get Started"
                    value={heroContent.primaryCtaText}
                    onChange={(e) =>
                      setHeroContent({
                        ...heroContent,
                        primaryCtaText: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="primary-cta-link">Primary CTA Link</Label>
                  <Input
                    id="primary-cta-link"
                    placeholder="e.g., /register"
                    value={heroContent.primaryCtaLink}
                    onChange={(e) =>
                      setHeroContent({
                        ...heroContent,
                        primaryCtaLink: e.target.value })
                    }
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="secondary-cta-text">Secondary CTA Text (Optional)</Label>
                  <Input
                    id="secondary-cta-text"
                    placeholder="e.g., Learn More"
                    value={heroContent.secondaryCtaText || ''}
                    onChange={(e) =>
                      setHeroContent({
                        ...heroContent,
                        secondaryCtaText: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="secondary-cta-link">Secondary CTA Link (Optional)</Label>
                  <Input
                    id="secondary-cta-link"
                    placeholder="e.g., /about"
                    value={heroContent.secondaryCtaLink || ''}
                    onChange={(e) =>
                      setHeroContent({
                        ...heroContent,
                        secondaryCtaLink: e.target.value })
                    }
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="hero-image">Hero Image URL</Label>
                <div className="flex gap-2">
                  <Input
                    id="hero-image"
                    placeholder="Enter image URL or upload"
                    value={heroContent.heroImageUrl || ''}
                    onChange={(e) =>
                      setHeroContent({
                        ...heroContent,
                        heroImageUrl: e.target.value })
                    }
                  />
                  <Button variant="outline" size="icon">
                    <Upload className="h-4 w-4" />
                  </Button>
                </div>
                <p className="text-sm text-muted-foreground">
                  Upload will be implemented with file storage integration
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Features Editor */}
        <TabsContent value="features">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Features Section</CardTitle>
                  <CardDescription>Highlight key platform features</CardDescription>
                </div>
                <Button type="button" onClick={addFeature} size="sm">
                  <Plus className="mr-2 h-4 w-4" />
                  Add Feature
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {features.length === 0 && (
                <p className="text-center text-muted-foreground py-8">
                  No features added yet. Click "Add Feature" to get started.
                </p>
              )}

              {features.map((feature, index) => (
                <Card key={feature.id}>
                  <CardContent className="pt-6 space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="font-semibold">Feature #{index + 1}</h4>
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => moveFeature(feature.id, 'up')}
                          disabled={index === 0}
                        >
                          <ArrowUp className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => moveFeature(feature.id, 'down')}
                          disabled={index === features.length - 1}
                        >
                          <ArrowDown className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => removeFeature(feature.id)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>Icon (emoji or class name)</Label>
                      <Input
                        placeholder="e.g., 📚 or lucide-book"
                        value={feature.icon}
                        onChange={(e) =>
                          updateFeature(feature.id, 'icon', e.target.value)
                        }
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Title</Label>
                      <Input
                        placeholder="Feature title"
                        value={feature.title}
                        onChange={(e) =>
                          updateFeature(feature.id, 'title', e.target.value)
                        }
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Description</Label>
                      <Textarea
                        placeholder="Feature description"
                        rows={3}
                        value={feature.description}
                        onChange={(e) =>
                          updateFeature(feature.id, 'description', e.target.value)
                        }
                      />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Testimonials Editor */}
        <TabsContent value="testimonials">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Testimonials</CardTitle>
                  <CardDescription>Customer reviews and feedback</CardDescription>
                </div>
                <Button type="button" onClick={addTestimonial} size="sm">
                  <Plus className="mr-2 h-4 w-4" />
                  Add Testimonial
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {testimonials.length === 0 && (
                <p className="text-center text-muted-foreground py-8">
                  No testimonials added yet. Click "Add Testimonial" to get started.
                </p>
              )}

              {testimonials.map((testimonial, index) => (
                <Card key={testimonial.id}>
                  <CardContent className="pt-6 space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="font-semibold">Testimonial #{index + 1}</h4>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeTestimonial(testimonial.id)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>

                    <div className="space-y-2">
                      <Label>Quote</Label>
                      <Textarea
                        placeholder="Customer quote"
                        rows={3}
                        value={testimonial.quote}
                        onChange={(e) =>
                          updateTestimonial(testimonial.id, 'quote', e.target.value)
                        }
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Author Name</Label>
                        <Input
                          placeholder="e.g., John Doe"
                          value={testimonial.authorName}
                          onChange={(e) =>
                            updateTestimonial(testimonial.id, 'authorName', e.target.value)
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Author Title</Label>
                        <Input
                          placeholder="e.g., Bestselling Author"
                          value={testimonial.authorTitle}
                          onChange={(e) =>
                            updateTestimonial(
                              testimonial.id,
                              'authorTitle',
                              e.target.value,
                            )
                          }
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Rating (1-5)</Label>
                        <Select
                          value={testimonial.rating.toString()}
                          onValueChange={(value) =>
                            updateTestimonial(testimonial.id, 'rating', parseInt(value))
                          }
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="5">5 stars</SelectItem>
                            <SelectItem value="4">4 stars</SelectItem>
                            <SelectItem value="3">3 stars</SelectItem>
                            <SelectItem value="2">2 stars</SelectItem>
                            <SelectItem value="1">1 star</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>Avatar URL (Optional)</Label>
                        <Input
                          placeholder="Image URL"
                          value={testimonial.avatarUrl || ''}
                          onChange={(e) =>
                            updateTestimonial(testimonial.id, 'avatarUrl', e.target.value)
                          }
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* FAQs Editor */}
        <TabsContent value="faqs">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Frequently Asked Questions</CardTitle>
                  <CardDescription>Answer common customer questions</CardDescription>
                </div>
                <Button type="button" onClick={addFaq} size="sm">
                  <Plus className="mr-2 h-4 w-4" />
                  Add FAQ
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {faqs.length === 0 && (
                <p className="text-center text-muted-foreground py-8">
                  No FAQs added yet. Click "Add FAQ" to get started.
                </p>
              )}

              {faqs.map((faq, index) => (
                <Card key={faq.id}>
                  <CardContent className="pt-6 space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="font-semibold">FAQ #{index + 1}</h4>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeFaq(faq.id)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>

                    <div className="space-y-2">
                      <Label>Question</Label>
                      <Input
                        placeholder="Enter question"
                        value={faq.question}
                        onChange={(e) => updateFaq(faq.id, 'question', e.target.value)}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Answer</Label>
                      <Textarea
                        placeholder="Enter answer"
                        rows={4}
                        value={faq.answer}
                        onChange={(e) => updateFaq(faq.id, 'answer', e.target.value)}
                      />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
