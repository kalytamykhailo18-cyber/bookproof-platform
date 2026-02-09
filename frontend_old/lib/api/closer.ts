import { apiClient } from './client';

// ============================================
// TYPE DEFINITIONS (Match backend DTOs exactly)
// ============================================

export enum CustomPackageStatus {
  DRAFT = 'DRAFT',
  PENDING_APPROVAL = 'PENDING_APPROVAL', // Waiting for Super Admin approval (custom pricing below 80% threshold)
  SENT = 'SENT',
  VIEWED = 'VIEWED',
  PAID = 'PAID',
  EXPIRED = 'EXPIRED',
  CANCELLED = 'CANCELLED',
}

export enum PackageApprovalStatus {
  NOT_REQUIRED = 'NOT_REQUIRED',   // Price meets minimum threshold, no approval needed
  PENDING = 'PENDING',             // Awaiting Super Admin approval
  APPROVED = 'APPROVED',           // Super Admin approved
  REJECTED = 'REJECTED',           // Super Admin rejected
}

export enum PaymentStatus {
  PENDING = 'PENDING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  REFUNDED = 'REFUNDED',
  CANCELLED = 'CANCELLED',
}

// ============================================
// CUSTOM PACKAGE DTOs
// ============================================

export interface CreateCustomPackageDto {
  packageName: string;
  description?: string;
  credits: number;
  price: number;
  currency?: string;
  validityDays: number;
  specialTerms?: string;
  internalNotes?: string; // Internal notes (not visible to client)
  clientName: string;
  clientEmail: string;
  clientCompany?: string;
  clientPhone?: string; // Client phone number (per Section 5.2)
  includeKeywordResearch?: boolean; // Include keyword research credits
  keywordResearchCredits?: number; // Number of keyword research credits
}

export interface UpdateCustomPackageDto {
  packageName?: string;
  description?: string;
  credits?: number;
  price?: number;
  currency?: string;
  validityDays?: number;
  specialTerms?: string;
  internalNotes?: string; // Internal notes (not visible to client)
  clientName?: string;
  clientEmail?: string;
  clientCompany?: string;
  clientPhone?: string; // Client phone number (per Section 5.2)
  includeKeywordResearch?: boolean; // Include keyword research credits
  keywordResearchCredits?: number; // Number of keyword research credits
}

export interface SendPackageDto {
  expirationDays?: number;
  customMessage?: string;
}

export interface GetPackagesQuery {
  status?: CustomPackageStatus;
  clientEmail?: string;
  limit?: number;
  offset?: number;
}

export interface CustomPackageResponse {
  id: string;
  closerProfileId: string;
  packageName: string;
  description?: string;
  credits: number;
  price: number;
  currency: string;
  validityDays: number;
  specialTerms?: string;
  internalNotes?: string; // Internal notes (not visible to client)
  clientName: string;
  clientEmail: string;
  clientCompany?: string;
  clientPhone?: string; // Client phone number (per Section 5.2)
  includeKeywordResearch: boolean; // Include keyword research credits
  keywordResearchCredits: number; // Number of keyword research credits
  status: CustomPackageStatus;
  // Approval workflow fields
  approvalRequired: boolean;
  approvalStatus: PackageApprovalStatus;
  approvedBy?: string;
  approvedAt?: string;
  rejectionReason?: string;
  // Payment and tracking
  paymentLink?: string;
  paymentLinkExpiresAt?: string;
  sentAt?: string;
  viewedAt?: string;
  viewCount: number;
  // Payment-related fields (from invoice, per Section 5.4)
  paidAt?: string;
  stripePaymentId?: string;
  accountCreated?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface PackageStats {
  totalPackages: number;
  draft: number;
  pendingApproval: number; // Packages waiting for Super Admin approval
  sent: number;
  viewed: number;
  paid: number;
  expired: number;
  cancelled: number;
  totalRevenue: number;
  totalCreditsSold: number;
}

// ============================================
// INVOICE DTOs
// ============================================

export interface CreateInvoiceDto {
  customPackageId?: string;
  amount: number;
  currency?: string;
  description?: string;
  dueDate?: string;
  clientEmail: string;
  clientName: string;
}

export interface GetInvoicesQuery {
  status?: PaymentStatus;
  clientEmail?: string;
  limit?: number;
  offset?: number;
}

export interface InvoiceResponse {
  id: string;
  invoiceNumber: string;
  closerProfileId?: string;
  authorProfileId?: string;
  customPackageId?: string;
  amount: number;
  currency: string;
  description?: string;
  dueDate?: string;
  paymentLink?: string;
  paymentStatus: PaymentStatus;
  paidAt?: string;
  stripePaymentId?: string;
  paymentMethod?: string;
  accountCreated: boolean;
  accountCreatedAt?: string;
  autoCreatedUserId?: string;
  pdfUrl?: string;
  createdAt: string;
  updatedAt: string;
  clientName?: string;
  clientEmail?: string;
}

export interface InvoiceStats {
  totalInvoices: number;
  pending: number;
  completed: number;
  failed: number;
  refunded: number;
  totalPending: number;
  totalCollected: number;
}

// ============================================
// CLOSER PROFILE & DASHBOARD DTOs
// ============================================

export interface CloserProfileResponse {
  id: string;
  userId: string;
  totalSales: number;
  totalClients: number;
  totalPackagesSold: number;
  commissionEnabled: boolean;
  commissionRate?: number;
  commissionEarned: number;
  commissionPaid: number;
  isActive: boolean;
  conversionRate?: number;
  averagePackageSize?: number;
  createdAt: string;
  updatedAt: string;
  userName?: string;
  userEmail?: string;
}

export interface CloserDashboardStats {
  salesThisMonth: number;
  salesLastMonth: number;
  salesGrowth: number;
  packagesCreatedThisMonth: number;
  packagesSentThisMonth: number;
  packagesPaidThisMonth: number;
  conversionRate: number;
  averageDealSize: number;
  packagesInPipeline: number;
  pipelineValue: number;
  pendingCommission: number;
  commissionThisMonth: number;
}

export interface SalesHistoryItem {
  id: string;
  type: 'PACKAGE' | 'INVOICE';
  clientName: string;
  clientEmail: string;
  clientCompany?: string;
  amount: number;
  currency: string;
  credits?: number;
  status: string;
  date: string;
  accountCreated: boolean;
}

// ============================================
// API CLIENT METHODS
// ============================================

export const closerApi = {
  // ============================================
  // PROFILE & DASHBOARD
  // ============================================

  /**
   * Get closer profile
   */
  async getProfile(): Promise<CloserProfileResponse> {
    const response = await apiClient.get<CloserProfileResponse>('/closer/profile');
    return response.data;
  },

  /**
   * Get dashboard statistics
   */
  async getDashboardStats(): Promise<CloserDashboardStats> {
    const response = await apiClient.get<CloserDashboardStats>('/closer/dashboard/stats');
    return response.data;
  },

  /**
   * Get sales history
   */
  async getSalesHistory(limit?: number, offset?: number): Promise<SalesHistoryItem[]> {
    const params = new URLSearchParams();
    if (limit) params.append('limit', limit.toString());
    if (offset) params.append('offset', offset.toString());

    const response = await apiClient.get<SalesHistoryItem[]>(
      `/closer/sales/history${params.toString() ? `?${params.toString()}` : ''}`,
    );
    return response.data;
  },

  // ============================================
  // CUSTOM PACKAGES
  // ============================================

  /**
   * Create a custom package
   */
  async createPackage(data: CreateCustomPackageDto): Promise<CustomPackageResponse> {
    const response = await apiClient.post<CustomPackageResponse>('/closer/packages', data);
    return response.data;
  },

  /**
   * Get all packages
   */
  async getPackages(query?: GetPackagesQuery): Promise<CustomPackageResponse[]> {
    const params = new URLSearchParams();
    if (query?.status) params.append('status', query.status);
    if (query?.clientEmail) params.append('clientEmail', query.clientEmail);
    if (query?.limit) params.append('limit', query.limit.toString());
    if (query?.offset) params.append('offset', query.offset.toString());

    const response = await apiClient.get<CustomPackageResponse[]>(
      `/closer/packages${params.toString() ? `?${params.toString()}` : ''}`,
    );
    return response.data;
  },

  /**
   * Get package statistics
   */
  async getPackageStats(): Promise<PackageStats> {
    const response = await apiClient.get<PackageStats>('/closer/packages/stats');
    return response.data;
  },

  /**
   * Get package by ID
   */
  async getPackageById(packageId: string): Promise<CustomPackageResponse> {
    const response = await apiClient.get<CustomPackageResponse>(`/closer/packages/${packageId}`);
    return response.data;
  },

  /**
   * Update a package
   */
  async updatePackage(
    packageId: string,
    data: UpdateCustomPackageDto,
  ): Promise<CustomPackageResponse> {
    const response = await apiClient.put<CustomPackageResponse>(
      `/closer/packages/${packageId}`,
      data,
    );
    return response.data;
  },

  /**
   * Send package to client (generate payment link)
   */
  async sendPackage(packageId: string, data?: SendPackageDto): Promise<CustomPackageResponse> {
    const response = await apiClient.post<CustomPackageResponse>(
      `/closer/packages/${packageId}/send`,
      data || {},
    );
    return response.data;
  },

  /**
   * Delete a draft package
   */
  async deletePackage(packageId: string): Promise<void> {
    await apiClient.delete(`/closer/packages/${packageId}`);
  },

  // ============================================
  // INVOICES
  // ============================================

  /**
   * Create an invoice
   */
  async createInvoice(data: CreateInvoiceDto): Promise<InvoiceResponse> {
    const response = await apiClient.post<InvoiceResponse>('/closer/invoices', data);
    return response.data;
  },

  /**
   * Get all invoices
   */
  async getInvoices(query?: GetInvoicesQuery): Promise<InvoiceResponse[]> {
    const params = new URLSearchParams();
    if (query?.status) params.append('status', query.status);
    if (query?.clientEmail) params.append('clientEmail', query.clientEmail);
    if (query?.limit) params.append('limit', query.limit.toString());
    if (query?.offset) params.append('offset', query.offset.toString());

    const response = await apiClient.get<InvoiceResponse[]>(
      `/closer/invoices${params.toString() ? `?${params.toString()}` : ''}`,
    );
    return response.data;
  },

  /**
   * Get invoice statistics
   */
  async getInvoiceStats(): Promise<InvoiceStats> {
    const response = await apiClient.get<InvoiceStats>('/closer/invoices/stats');
    return response.data;
  },

  /**
   * Get invoice by ID
   */
  async getInvoiceById(invoiceId: string): Promise<InvoiceResponse> {
    const response = await apiClient.get<InvoiceResponse>(`/closer/invoices/${invoiceId}`);
    return response.data;
  },

  // ============================================
  // PDF INVOICE
  // ============================================

  /**
   * Download invoice PDF for a package
   * Returns a blob URL that can be used to download the file
   */
  async downloadPackageInvoicePdf(packageId: string): Promise<Blob> {
    const response = await apiClient.get(`/closer/packages/${packageId}/invoice-pdf`, {
      responseType: 'blob',
    });
    return response.data;
  },

  /**
   * Helper to trigger PDF download in browser
   */
  triggerPdfDownload(blob: Blob, filename: string): void {
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  },

  // ============================================
  // ADMIN PACKAGE APPROVAL (Super Admin only)
  // ============================================

  /**
   * Get packages pending Super Admin approval
   */
  async getPackagesPendingApproval(): Promise<CustomPackageResponse[]> {
    const response = await apiClient.get<CustomPackageResponse[]>(
      '/admin/packages/pending-approval',
    );
    return response.data;
  },

  /**
   * Approve a custom package (Super Admin only)
   */
  async approvePackage(packageId: string): Promise<CustomPackageResponse> {
    const response = await apiClient.post<CustomPackageResponse>(
      `/admin/packages/${packageId}/approve`,
    );
    return response.data;
  },

  /**
   * Reject a custom package (Super Admin only)
   */
  async rejectPackage(
    packageId: string,
    rejectionReason: string,
  ): Promise<CustomPackageResponse> {
    const response = await apiClient.post<CustomPackageResponse>(
      `/admin/packages/${packageId}/reject`,
      { rejectionReason },
    );
    return response.data;
  },
};
