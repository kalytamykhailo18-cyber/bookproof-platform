import { useQuery } from '@tanstack/react-query';
import {
  adminReportsApi,
  FinancialReportDto,
  OperationalReportDto,
  AffiliateReportDto,
} from '@/lib/api/admin-reports';

/**
 * Hook to fetch Financial Report
 */
export const useFinancialReport = (startDate: string, endDate: string) => {
  return useQuery<FinancialReportDto>({
    queryKey: ['financial-report', startDate, endDate],
    queryFn: () => adminReportsApi.getFinancialReport(startDate, endDate),
    enabled: !!startDate && !!endDate,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

/**
 * Hook to fetch Operational Report
 */
export const useOperationalReport = (startDate: string, endDate: string) => {
  return useQuery<OperationalReportDto>({
    queryKey: ['operational-report', startDate, endDate],
    queryFn: () => adminReportsApi.getOperationalReport(startDate, endDate),
    enabled: !!startDate && !!endDate,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

/**
 * Hook to fetch Affiliate Report
 */
export const useAffiliateReport = (startDate: string, endDate: string) => {
  return useQuery<AffiliateReportDto>({
    queryKey: ['affiliate-report', startDate, endDate],
    queryFn: () => adminReportsApi.getAffiliateReport(startDate, endDate),
    enabled: !!startDate && !!endDate,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

/**
 * Helper to get CSV export URL
 */
export const useReportExportUrls = () => {
  return {
    getFinancialCsvUrl: (startDate: string, endDate: string) =>
      adminReportsApi.getFinancialReportCsvUrl(startDate, endDate),
    getOperationalCsvUrl: (startDate: string, endDate: string) =>
      adminReportsApi.getOperationalReportCsvUrl(startDate, endDate),
    getAffiliateCsvUrl: (startDate: string, endDate: string) =>
      adminReportsApi.getAffiliateReportCsvUrl(startDate, endDate),
  };
};
