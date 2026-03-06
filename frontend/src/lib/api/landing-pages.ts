import { apiClient } from './client';

// Types matching backend DTOs
export type Language = 'EN' | 'PT' | 'ES';

export interface LandingPageCta {
  ctaText: string;
  ctaLink: string;
  ctaMode: 'PRE_LAUNCH' | 'LIVE';
}

export interface LandingPageSeo {
  metaTitle?: string;
  metaDescription?: string;
  metaKeywords?: string;
}

export interface LandingPage {
  id: string;
  language: Language;
  content: string;
  metaTitle?: string;
  metaDescription?: string;
  metaKeywords?: string;
  isPublished: boolean;
  publishedAt?: string;
  ctaText: string;
  ctaLink: string;
  ctaMode: string;
  totalViews: number;
  totalLeads: number;
  conversionRate?: number;
  createdAt: string;
  updatedAt: string;
}

export interface UpdateLandingPageRequest {
  language: Language;
  content?: string;
  seo?: LandingPageSeo;
  cta?: LandingPageCta;
  isPublished?: boolean;
}

export interface LandingPageLead {
  id: string;
  email: string;
  name?: string;
  language: Language;
  userType?: string;
  source?: string;
  medium?: string;
  campaign?: string;
  content?: string;      // utm_content
  term?: string;         // utm_term
  affiliateRef?: string; // ref (affiliate code)
  country?: string;
  marketingConsent: boolean;
  welcomeEmailSent: boolean;
  converted: boolean;
  convertedAt?: string;
  createdAt: string;
}

export interface LeadsListResponse {
  leads: LandingPageLead[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface GetLeadsParams {
  language?: Language;
  userType?: string;
  source?: string;
  page?: number;
  limit?: number;
}

export interface LeadsByUserType {
  author: number;
  reader: number;
  both: number;
  unknown: number;
}

export interface TopSource {
  source: string;
  count: number;
}

export interface TopCampaign {
  campaign: string;
  count: number;
}

export interface AnalyticsStats {
  language: Language;
  totalViews: number;
  totalLeads: number;
  conversionRate: number;
  leadsByUserType: LeadsByUserType;
  topSources: TopSource[];
  topCampaigns: TopCampaign[];
}

export interface GlobalAnalytics {
  totalViews: number;
  totalLeads: number;
  conversionRate: number;
  byLanguage: AnalyticsStats[];
}

// API Functions

/**
 * Get all landing pages (admin)
 */
export async function getAllLandingPages(): Promise<LandingPage[]> {
  const response = await apiClient.get<LandingPage[]>('/landing-pages/admin/pages');
  return response.data;
}

/**
 * Get landing page by language (admin)
 */
export async function getLandingPage(language: Language): Promise<LandingPage> {
  const response = await apiClient.get<LandingPage>(`/landing-pages/admin/pages/${language}`);
  return response.data;
}

/**
 * Update landing page content (admin CMS)
 */
export async function updateLandingPage(data: UpdateLandingPageRequest): Promise<LandingPage> {
  const response = await apiClient.put<LandingPage>('/landing-pages/admin/pages', data);
  return response.data;
}

/**
 * Get leads with pagination and filters (admin)
 */
export async function getLeads(params: GetLeadsParams = {}): Promise<LeadsListResponse> {
  const response = await apiClient.get<LeadsListResponse>('/landing-pages/admin/leads', {
    params,
  });
  return response.data;
}

/**
 * Export leads as CSV or JSON (admin)
 */
export async function exportLeads(
  language?: Language,
  format: 'csv' | 'json' = 'csv',
): Promise<Blob> {
  const response = await apiClient.get('/landing-pages/admin/leads/export', {
    params: { language, format },
    responseType: 'blob',
  });
  return response.data;
}

/**
 * Delete a lead (admin)
 */
export async function deleteLead(leadId: string): Promise<{ success: boolean }> {
  const response = await apiClient.delete<{ success: boolean }>(
    `/landing-pages/admin/leads/${leadId}`,
  );
  return response.data;
}

/**
 * Resend welcome email to a lead (admin)
 */
export async function resendWelcomeEmail(leadId: string): Promise<{ success: boolean }> {
  const response = await apiClient.post<{ success: boolean }>(
    `/landing-pages/admin/leads/${leadId}/resend-email`,
  );
  return response.data;
}

/**
 * Get analytics by language (admin)
 */
export async function getAnalyticsByLanguage(language: Language): Promise<AnalyticsStats> {
  const response = await apiClient.get<AnalyticsStats>('/landing-pages/analytics', {
    params: { language },
  });
  return response.data;
}

/**
 * Get global analytics (admin)
 */
export async function getGlobalAnalytics(): Promise<GlobalAnalytics> {
  const response = await apiClient.get<GlobalAnalytics>('/landing-pages/analytics/global');
  return response.data;
}

/**
 * Track landing page view (public endpoint)
 */
export interface TrackViewRequest {
  language: Language;
  source?: string;      // utm_source
  medium?: string;      // utm_medium
  campaign?: string;    // utm_campaign
  content?: string;     // utm_content
  term?: string;        // utm_term
  affiliateRef?: string; // ref parameter
  referrer?: string;    // document.referrer
}

export async function trackView(data: TrackViewRequest): Promise<{ success: boolean }> {
  const response = await apiClient.post<{ success: boolean }>('/landing-pages/track-view', data);
  return response.data;
}

/**
 * Submit lead form (public endpoint)
 */
export interface SubmitLeadRequest {
  email: string;
  name?: string;
  userType: string;
  language: Language;
  marketingConsent: boolean;
  source?: string;
  medium?: string;
  campaign?: string;
  content?: string;
  term?: string;
  affiliateRef?: string;
  referrer?: string;
  captchaToken?: string;
}

export interface SubmitLeadResponse {
  success: boolean;
  message?: string;
  leadId?: string;
}

export async function submitLead(data: SubmitLeadRequest): Promise<SubmitLeadResponse> {
  const response = await apiClient.post<SubmitLeadResponse>('/landing-pages/leads', data);
  return response.data;
}

// ==========================================
// CONTENT MANAGEMENT TYPES (Section 10.4)
// ==========================================

export interface HeroContent {
  titleLine1: string;
  titleLine2: string;
  titleLine3?: string;
  subtitle: string;
  ctaPrimary: string;
  ctaSecondary: string;
  heroImage?: string;
}

export interface HowItWorksStep {
  title: string;
  description: string;
  details: string[];
  image?: string;
}

export interface HowItWorksContent {
  badge: string;
  title: string;
  subtitle: string;
  steps: HowItWorksStep[];
  ctaText: string;
}

export interface BenefitItem {
  key: string;
  title: string;
  description: string;
  icon?: string;
}

export interface BenefitsSection {
  badge: string;
  title: string;
  subtitle: string;
  items: BenefitItem[];
  ctaText: string;
  note?: string;
}

export interface PricingPackage {
  key: string;
  name: string;
  credits: string;
  reviews: string;
  duration: string;
  validity: string;
  features: string[];
  isPopular?: boolean;
  isEnterprise?: boolean;
}

export interface PricingSection {
  badge: string;
  title: string;
  subtitle: string;
  packages: PricingPackage[];
  ctaText: string;
  enterpriseCta: string;
  note?: string;
  allInclude: string[];
}

export interface Testimonial {
  key: string;
  quote: string;
  author: string;
  title: string;
  rating: number;
  industry?: string;
  avatar?: string;
}

export interface TestimonialsSection {
  badge: string;
  title: string;
  subtitle: string;
  rating: string;
  items: Testimonial[];
}

export interface FaqItem {
  key: string;
  question: string;
  answer: string;
}

export interface FaqSection {
  badge: string;
  title: string;
  subtitle: string;
  items: FaqItem[];
  stillHaveTitle: string;
  stillHaveDesc: string;
}

export interface LandingPageContent {
  hero?: HeroContent;
  howItWorks?: HowItWorksContent;
  forAuthors?: BenefitsSection;
  forReaders?: BenefitsSection;
  pricing?: PricingSection;
  testimonials?: TestimonialsSection;
  faq?: FaqSection;
}

/**
 * Get public landing page content (for rendering)
 */
export async function getPublicContent(language: Language): Promise<{ content: string; isPublished: boolean }> {
  const response = await apiClient.get<{ content: string; isPublished: boolean }>(
    `/landing-pages/content/${language}`
  );
  return response.data;
}

/**
 * Parse content JSON to typed object
 */
export function parseContent(contentJson: string): LandingPageContent {
  try {
    return JSON.parse(contentJson) as LandingPageContent;
  } catch {
    return {};
  }
}

/**
 * Upload image for CMS (admin)
 */
export async function uploadCmsImage(
  file: File,
  section: string = 'landing',
): Promise<{ url: string; key: string }> {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('section', section);

  const response = await apiClient.post<{ url: string; key: string }>(
    '/landing-pages/admin/upload-image',
    formData,
    {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    },
  );
  return response.data;
}
