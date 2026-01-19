import { client } from './client';

export interface RatingDistribution {
  fiveStar: number;
  fourStar: number;
  threeStar: number;
  twoStar: number;
  oneStar: number;
}

export interface CampaignDuration {
  startDate: string;
  endDate: string;
  totalWeeks: number;
}

export interface PerformanceMetrics {
  successRate: number;
  delaysEncountered: number;
  replacementsProvided: number;
}

export interface RatingTrend {
  week: number;
  avgRating: number;
  count: number;
}

export interface CampaignReport {
  id: string;
  bookId: string;
  totalReviewsDelivered: number;
  totalReviewsValidated: number;
  averageRating: number;
  ratingDistribution: RatingDistribution;
  ratingTrends?: RatingTrend[];
  campaignDuration: CampaignDuration;
  performanceMetrics: PerformanceMetrics;
  anonymousFeedback?: string[];
  pdfUrl?: string;
  generatedAt: string;
  emailedAt?: string;
}

export const getReports = (): Promise<CampaignReport[]> => client.get('/reports');

export const getCampaignReport = (bookId: string): Promise<CampaignReport> =>
  client.get(`/reports/campaign/${bookId}`);

export const regenerateCampaignReport = (bookId: string): Promise<CampaignReport> =>
  client.post(`/reports/campaign/${bookId}/regenerate`);

export const downloadCampaignReport = (bookId: string): Promise<{ url: string }> =>
  client.get(`/reports/campaign/${bookId}/download`);
