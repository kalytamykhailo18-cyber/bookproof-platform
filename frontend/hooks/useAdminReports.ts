import { useQuery, useMutation } from '@tanstack/react-query';
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
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
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
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
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
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
};

/**
 * Export types for admin reports
 */
type ReportType = 'financial' | 'operational' | 'affiliate';
type ExportFormat = 'csv' | 'pdf';

interface ExportParams {
  startDate: string;
  endDate: string;
}

/**
 * Hook for exporting admin reports (Section 14.4)
 * Uses authenticated API calls with blob downloads
 */
export const useExportReport = (reportType: ReportType, format: ExportFormat) => {
  return useMutation({
    mutationFn: async (params: ExportParams) => {
      const { startDate, endDate } = params;
      let blob: Blob;

      // Get the appropriate download function
      if (reportType === 'financial') {
        blob = format === 'csv'
          ? await adminReportsApi.downloadFinancialReportCsv(startDate, endDate)
          : await adminReportsApi.downloadFinancialReportPdf(startDate, endDate);
      } else if (reportType === 'operational') {
        blob = format === 'csv'
          ? await adminReportsApi.downloadOperationalReportCsv(startDate, endDate)
          : await adminReportsApi.downloadOperationalReportPdf(startDate, endDate);
      } else {
        blob = format === 'csv'
          ? await adminReportsApi.downloadAffiliateReportCsv(startDate, endDate)
          : await adminReportsApi.downloadAffiliateReportPdf(startDate, endDate);
      }

      // Generate filename
      const extension = format === 'csv' ? 'csv' : 'pdf';
      const filename = `${reportType}-report-${startDate}-to-${endDate}.${extension}`;

      // Trigger download
      adminReportsApi.triggerFileDownload(blob, filename);

      return blob;
    },
  });
};

/**
 * Convenience hooks for specific report exports
 */
export const useExportFinancialCsv = () => useExportReport('financial', 'csv');
export const useExportFinancialPdf = () => useExportReport('financial', 'pdf');
export const useExportOperationalCsv = () => useExportReport('operational', 'csv');
export const useExportOperationalPdf = () => useExportReport('operational', 'pdf');
export const useExportAffiliateCsv = () => useExportReport('affiliate', 'csv');
export const useExportAffiliatePdf = () => useExportReport('affiliate', 'pdf');
