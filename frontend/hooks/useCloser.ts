'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { closerApi } from '@/lib/api/closer';
import type {
  CreateCustomPackageDto,
  UpdateCustomPackageDto,
  SendPackageDto,
  GetPackagesQuery,
  CustomPackageResponse,
  PackageStats,
  CreateInvoiceDto,
  GetInvoicesQuery,
  InvoiceResponse,
  InvoiceStats,
  CloserProfileResponse,
  CloserDashboardStats,
  SalesHistoryItem,
} from '@/lib/api/closer';

// Query keys
const CLOSER_PROFILE_KEY = 'closer-profile';
const CLOSER_DASHBOARD_KEY = 'closer-dashboard';
const CLOSER_SALES_KEY = 'closer-sales';
const CLOSER_PACKAGES_KEY = 'closer-packages';
const CLOSER_PACKAGES_STATS_KEY = 'closer-packages-stats';
const CLOSER_INVOICES_KEY = 'closer-invoices';
const CLOSER_INVOICES_STATS_KEY = 'closer-invoices-stats';

// ============================================
// PROFILE & DASHBOARD HOOKS
// ============================================

/**
 * Hook for getting closer profile
 */
export function useCloserProfile() {
  return useQuery<CloserProfileResponse>({
    queryKey: [CLOSER_PROFILE_KEY],
    queryFn: () => closerApi.getProfile(),
    staleTime: 60000,
  });
}

/**
 * Hook for getting dashboard statistics
 */
export function useCloserDashboardStats() {
  return useQuery<CloserDashboardStats>({
    queryKey: [CLOSER_DASHBOARD_KEY],
    queryFn: () => closerApi.getDashboardStats(),
    staleTime: 30000,
  });
}

/**
 * Hook for getting sales history
 */
export function useCloserSalesHistory(limit?: number, offset?: number) {
  return useQuery<SalesHistoryItem[]>({
    queryKey: [CLOSER_SALES_KEY, limit, offset],
    queryFn: () => closerApi.getSalesHistory(limit, offset),
    staleTime: 30000,
  });
}

// ============================================
// CUSTOM PACKAGES HOOKS
// ============================================

/**
 * Hook for getting all packages
 */
export function useCloserPackages(query?: GetPackagesQuery) {
  return useQuery<CustomPackageResponse[]>({
    queryKey: [CLOSER_PACKAGES_KEY, query],
    queryFn: () => closerApi.getPackages(query),
    staleTime: 30000,
  });
}

/**
 * Hook for getting package statistics
 */
export function useCloserPackageStats() {
  return useQuery<PackageStats>({
    queryKey: [CLOSER_PACKAGES_STATS_KEY],
    queryFn: () => closerApi.getPackageStats(),
    staleTime: 60000,
  });
}

/**
 * Hook for getting a single package
 */
export function useCloserPackage(packageId: string) {
  return useQuery<CustomPackageResponse>({
    queryKey: [CLOSER_PACKAGES_KEY, packageId],
    queryFn: () => closerApi.getPackageById(packageId),
    enabled: !!packageId,
    staleTime: 30000,
  });
}

/**
 * Hook for creating a package
 */
export function useCreatePackage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateCustomPackageDto) => closerApi.createPackage(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [CLOSER_PACKAGES_KEY] });
      queryClient.invalidateQueries({ queryKey: [CLOSER_PACKAGES_STATS_KEY] });
      queryClient.invalidateQueries({ queryKey: [CLOSER_DASHBOARD_KEY] });
      toast.success('Package created successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to create package');
    },
  });
}

/**
 * Hook for updating a package
 */
export function useUpdatePackage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ packageId, data }: { packageId: string; data: UpdateCustomPackageDto }) =>
      closerApi.updatePackage(packageId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [CLOSER_PACKAGES_KEY] });
      queryClient.invalidateQueries({ queryKey: [CLOSER_PACKAGES_STATS_KEY] });
      toast.success('Package updated successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to update package');
    },
  });
}

/**
 * Hook for sending a package to client
 */
export function useSendPackage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ packageId, data }: { packageId: string; data?: SendPackageDto }) =>
      closerApi.sendPackage(packageId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [CLOSER_PACKAGES_KEY] });
      queryClient.invalidateQueries({ queryKey: [CLOSER_PACKAGES_STATS_KEY] });
      queryClient.invalidateQueries({ queryKey: [CLOSER_DASHBOARD_KEY] });
      toast.success('Package sent to client successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to send package');
    },
  });
}

/**
 * Hook for deleting a package
 */
export function useDeletePackage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (packageId: string) => closerApi.deletePackage(packageId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [CLOSER_PACKAGES_KEY] });
      queryClient.invalidateQueries({ queryKey: [CLOSER_PACKAGES_STATS_KEY] });
      queryClient.invalidateQueries({ queryKey: [CLOSER_DASHBOARD_KEY] });
      toast.success('Package deleted successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to delete package');
    },
  });
}

// ============================================
// INVOICES HOOKS
// ============================================

/**
 * Hook for getting all invoices
 */
export function useCloserInvoices(query?: GetInvoicesQuery) {
  return useQuery<InvoiceResponse[]>({
    queryKey: [CLOSER_INVOICES_KEY, query],
    queryFn: () => closerApi.getInvoices(query),
    staleTime: 30000,
  });
}

/**
 * Hook for getting invoice statistics
 */
export function useCloserInvoiceStats() {
  return useQuery<InvoiceStats>({
    queryKey: [CLOSER_INVOICES_STATS_KEY],
    queryFn: () => closerApi.getInvoiceStats(),
    staleTime: 60000,
  });
}

/**
 * Hook for getting a single invoice
 */
export function useCloserInvoice(invoiceId: string) {
  return useQuery<InvoiceResponse>({
    queryKey: [CLOSER_INVOICES_KEY, invoiceId],
    queryFn: () => closerApi.getInvoiceById(invoiceId),
    enabled: !!invoiceId,
    staleTime: 30000,
  });
}

/**
 * Hook for creating an invoice
 */
export function useCreateInvoice() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateInvoiceDto) => closerApi.createInvoice(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [CLOSER_INVOICES_KEY] });
      queryClient.invalidateQueries({ queryKey: [CLOSER_INVOICES_STATS_KEY] });
      queryClient.invalidateQueries({ queryKey: [CLOSER_DASHBOARD_KEY] });
      toast.success('Invoice created successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to create invoice');
    },
  });
}

// ============================================
// PDF INVOICE HOOKS
// ============================================

/**
 * Hook for downloading package invoice PDF
 */
export function useDownloadPackageInvoicePdf() {
  return useMutation({
    mutationFn: async ({
      packageId,
      packageName,
    }: {
      packageId: string;
      packageName?: string;
    }) => {
      const blob = await closerApi.downloadPackageInvoicePdf(packageId);
      const filename = `invoice-${packageName || packageId}.pdf`;
      closerApi.triggerPdfDownload(blob, filename);
      return blob;
    },
    onSuccess: () => {
      toast.success('Invoice PDF downloaded successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to download invoice PDF');
    },
  });
}

// ============================================
// ADMIN PACKAGE APPROVAL HOOKS (Super Admin only)
// ============================================

const ADMIN_PACKAGES_PENDING_KEY = 'admin-packages-pending';

/**
 * Hook for getting packages pending Super Admin approval
 */
export function usePackagesPendingApproval() {
  return useQuery<CustomPackageResponse[]>({
    queryKey: [ADMIN_PACKAGES_PENDING_KEY],
    queryFn: () => closerApi.getPackagesPendingApproval(),
    staleTime: 30000,
  });
}

/**
 * Hook for approving a package (Super Admin only)
 */
export function useApprovePackage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (packageId: string) => closerApi.approvePackage(packageId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [ADMIN_PACKAGES_PENDING_KEY] });
      queryClient.invalidateQueries({ queryKey: [CLOSER_PACKAGES_KEY] });
      toast.success('Package approved successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to approve package');
    },
  });
}

/**
 * Hook for rejecting a package (Super Admin only)
 */
export function useRejectPackage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ packageId, rejectionReason }: { packageId: string; rejectionReason: string }) =>
      closerApi.rejectPackage(packageId, rejectionReason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [ADMIN_PACKAGES_PENDING_KEY] });
      queryClient.invalidateQueries({ queryKey: [CLOSER_PACKAGES_KEY] });
      toast.success('Package rejected');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to reject package');
    },
  });
}
