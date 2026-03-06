import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import {
  getPublicContent,
  parseContent,
  LandingPageContent,
  Language,
  HeroContent,
  FaqSection,
  TestimonialsSection,
  PricingSection,
} from '@/lib/api/landing-pages';

interface LandingContentContextValue {
  hero: HeroContent | null;
  faq: FaqSection | null;
  testimonials: TestimonialsSection | null;
  pricing: PricingSection | null;
  isLoading: boolean;
  isUsingCms: boolean;
}

const LandingContentContext = createContext<LandingContentContextValue>({
  hero: null,
  faq: null,
  testimonials: null,
  pricing: null,
  isLoading: true,
  isUsingCms: false,
});

/**
 * Map i18n language code to API language enum
 */
function mapLanguage(lang: string): Language {
  const upper = lang.toUpperCase();
  if (upper === 'ES' || upper.startsWith('ES')) return 'ES';
  if (upper === 'PT' || upper.startsWith('PT')) return 'PT';
  return 'EN';
}

/**
 * Provider component that fetches CMS content and provides it to children
 */
export function LandingContentProvider({ children }: { children: ReactNode }) {
  const { i18n } = useTranslation();
  const [content, setContent] = useState<LandingPageContent | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUsingCms, setIsUsingCms] = useState(false);

  useEffect(() => {
    const fetchContent = async () => {
      try {
        setIsLoading(true);
        const language = mapLanguage(i18n.language);
        const result = await getPublicContent(language);

        if (result.isPublished && result.content && result.content !== '{}') {
          const parsed = parseContent(result.content);
          setContent(parsed);
          setIsUsingCms(true);
        } else {
          setContent(null);
          setIsUsingCms(false);
        }
      } catch (error) {
        console.error('Failed to fetch landing content:', error);
        setContent(null);
        setIsUsingCms(false);
      } finally {
        setIsLoading(false);
      }
    };

    fetchContent();
  }, [i18n.language]);

  const value: LandingContentContextValue = {
    hero: content?.hero || null,
    faq: content?.faq || null,
    testimonials: content?.testimonials || null,
    pricing: content?.pricing || null,
    isLoading,
    isUsingCms,
  };

  return (
    <LandingContentContext.Provider value={value}>
      {children}
    </LandingContentContext.Provider>
  );
}

/**
 * Hook to access landing page content from CMS
 * Falls back to i18n translations if CMS content not available
 */
export function useLandingContent() {
  return useContext(LandingContentContext);
}

/**
 * Hook for Hero section content with i18n fallback
 */
export function useHeroContent() {
  const { t } = useTranslation('hero');
  const { hero, isUsingCms } = useLandingContent();

  if (isUsingCms && hero) {
    return {
      titleLine1: hero.titleLine1,
      titleLine2: hero.titleLine2,
      titleLine3: hero.titleLine3 || '',
      subtitle: hero.subtitle,
      ctaPrimary: hero.ctaPrimary,
      ctaSecondary: hero.ctaSecondary,
      isFromCms: true,
    };
  }

  // Fallback to i18n
  return {
    titleLine1: t('titleLine1'),
    titleLine2: t('titleLine2'),
    titleLine3: t('titleLine3'),
    subtitle: t('subtitle'),
    ctaPrimary: t('ctaPrimary'),
    ctaSecondary: t('ctaSecondary'),
    isFromCms: false,
  };
}

/**
 * Hook for FAQ section content with i18n fallback
 */
export function useFaqContent() {
  const { t } = useTranslation('faq');
  const { faq, isUsingCms } = useLandingContent();

  if (isUsingCms && faq && faq.items?.length > 0) {
    return {
      badge: faq.badge,
      title: faq.title,
      subtitle: faq.subtitle,
      items: faq.items,
      stillHaveTitle: faq.stillHaveTitle,
      stillHaveDesc: faq.stillHaveDesc,
      isFromCms: true,
    };
  }

  // Fallback to i18n - need to build items array from translation keys
  const FAQ_KEYS = ['q1', 'q2', 'q3', 'q4', 'q5', 'q6', 'q7', 'q8', 'q9', 'q10', 'q11'];
  const items = FAQ_KEYS.map(key => ({
    key,
    question: t(`items.${key}.question`),
    answer: t(`items.${key}.answer`),
  })).filter(item => item.question && item.question !== `items.${item.key}.question`);

  return {
    badge: t('badge'),
    title: t('title'),
    subtitle: t('subtitle'),
    items,
    stillHaveTitle: t('stillHave.title'),
    stillHaveDesc: t('stillHave.desc'),
    isFromCms: false,
  };
}

/**
 * Hook for Testimonials section content with i18n fallback
 */
export function useTestimonialsContent() {
  const { t } = useTranslation('testimonials');
  const { testimonials, isUsingCms } = useLandingContent();

  if (isUsingCms && testimonials && testimonials.items?.length > 0) {
    return {
      badge: testimonials.badge,
      title: testimonials.title,
      subtitle: testimonials.subtitle,
      rating: testimonials.rating,
      items: testimonials.items,
      isFromCms: true,
    };
  }

  // Fallback to i18n - need to build items array from translation keys
  const TESTIMONIAL_KEYS = ['t1', 't2', 't3', 't4', 't5', 't6', 't7', 't8', 't9'];
  const items = TESTIMONIAL_KEYS.map(key => ({
    key,
    quote: t(`items.${key}.quote`),
    author: t(`items.${key}.author`),
    title: t(`items.${key}.title`),
    rating: 5,
    industry: '',
  })).filter(item => item.quote && item.quote !== `items.${item.key}.quote`);

  return {
    badge: t('badge'),
    title: t('title'),
    subtitle: t('subtitle'),
    rating: t('rating'),
    items,
    isFromCms: false,
  };
}

/**
 * Hook for Pricing section content with i18n fallback
 */
export function usePricingContent() {
  const { t } = useTranslation('pricing');
  const { pricing, isUsingCms } = useLandingContent();

  if (isUsingCms && pricing && pricing.packages?.length > 0) {
    return {
      badge: pricing.badge,
      title: pricing.title,
      subtitle: pricing.subtitle,
      packages: pricing.packages,
      ctaText: pricing.ctaText,
      enterpriseCta: pricing.enterpriseCta,
      note: pricing.note,
      allInclude: pricing.allInclude || [],
      isFromCms: true,
    };
  }

  // Fallback to i18n - build packages array from translation keys
  const PACKAGE_KEYS = ['starter', 'growth', 'professional', 'enterprise'];
  const packages = PACKAGE_KEYS.map(key => ({
    key,
    name: t(`packages.${key}.name`),
    credits: t(`packages.${key}.credits`),
    reviews: t(`packages.${key}.reviews`),
    duration: t(`packages.${key}.duration`),
    validity: t(`packages.${key}.validity`),
    features: t(`packages.${key}.features`, { returnObjects: true }) as string[],
    isPopular: key === 'growth',
    isEnterprise: key === 'enterprise',
  }));

  return {
    badge: t('badge'),
    title: t('title'),
    subtitle: t('subtitle'),
    packages,
    ctaText: t('cta'),
    enterpriseCta: t('enterpriseCta'),
    note: t('note'),
    allInclude: t('allInclude.items', { returnObjects: true }) as string[],
    isFromCms: false,
  };
}
