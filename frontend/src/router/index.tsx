import { createBrowserRouter, Navigate } from 'react-router-dom';
import { lazy, Suspense } from 'react';
import { RootLayout } from '../layouts/RootLayout';
// import { AdminLayout } from '../layouts/AdminLayout';
// import { AuthorLayout } from '../layouts/AuthorLayout';
// import { ReaderLayout } from '../layouts/ReaderLayout';
// import { AffiliateLayout } from '../layouts/AffiliateLayout';
// import { CloserLayout } from '../layouts/CloserLayout';
// import { ProtectedRoute } from './ProtectedRoute';
// import { RoleGuard } from './RoleGuard';
import { Loader2 } from 'lucide-react';

// Loading component for lazy loaded pages
const PageLoader = () => (
  <div className="flex min-h-[50vh] items-center justify-center">
    <Loader2 className="h-8 w-8 animate-spin text-primary" />
  </div>
);

// Lazy load wrapper
const lazyLoad = (importFn: () => Promise<{ [key: string]: React.ComponentType }>, exportName: string) => {
  const Component = lazy(() => importFn().then(module => ({ default: (module as Record<string, React.ComponentType>)[exportName] })));
  return (
    <Suspense fallback={<PageLoader />}>
      <Component />
    </Suspense>
  );
};

// ============================================
// PUBLIC PAGES - ACTIVE
// ============================================
const LandingPage = lazyLoad(() => import('../pages/landing/Landing'), 'LandingPage');

// ============================================
// AUTH PAGES - COMMENTED OUT
// ============================================
// const LoginPage = lazyLoad(() => import('../pages/auth/Login'), 'LoginPage');
// const RegisterPage = lazyLoad(() => import('../pages/auth/Register'), 'RegisterPage');
// const ForgotPasswordPage = lazyLoad(() => import('../pages/auth/ForgotPassword'), 'ForgotPasswordPage');
// const ResetPasswordPage = lazyLoad(() => import('../pages/auth/ResetPassword'), 'ResetPasswordPage');
// const VerifyEmailPage = lazyLoad(() => import('../pages/auth/VerifyEmail'), 'VerifyEmailPage');
// const VerifyEmailRequiredPage = lazyLoad(() => import('../pages/auth/VerifyEmailRequired'), 'VerifyEmailRequiredPage');
// const AcceptTermsPage = lazyLoad(() => import('../pages/auth/AcceptTerms'), 'AcceptTermsPage');

// ============================================
// LEGAL PAGES - COMMENTED OUT
// ============================================
// const TermsPage = lazyLoad(() => import('../pages/legal/Terms'), 'TermsPage');
// const PrivacyPage = lazyLoad(() => import('../pages/legal/Privacy'), 'PrivacyPage');
// const CookiesPage = lazyLoad(() => import('../pages/legal/Cookies'), 'CookiesPage');

// ============================================
// PUBLIC PAGES - COMMENTED OUT
// ============================================
// const PublicCampaignsPage = lazyLoad(() => import('../pages/public/Campaigns'), 'CampaignsPage');
// const ForbiddenPage = lazyLoad(() => import('../pages/forbidden/Forbidden'), 'ForbiddenPage');

// ============================================
// ADMIN PAGES - COMMENTED OUT
// ============================================
// const AdminDashboardPage = lazyLoad(() => import('../pages/admin/Dashboard'), 'AdminDashboardPage');
// const AdminValidationPage = lazyLoad(() => import('../pages/admin/Validation'), 'AdminValidationPage');
// const AdminAuthorsPage = lazyLoad(() => import('../pages/admin/Authors'), 'AdminAuthorsPage');
// const AdminReadersPage = lazyLoad(() => import('../pages/admin/Readers'), 'AdminReadersPage');
// const AdminCampaignsPage = lazyLoad(() => import('../pages/admin/Campaigns'), 'AdminCampaignsPage');
// const AdminCampaignControlsPage = lazyLoad(() => import('../pages/admin/campaigns/Controls'), 'AdminCampaignControlsPage');
// const AdminDisputesPage = lazyLoad(() => import('../pages/admin/Disputes'), 'AdminDisputesPage');
// const AdminIssuesPage = lazyLoad(() => import('../pages/admin/Issues'), 'AdminIssuesPage');
// const AdminExceptionsPage = lazyLoad(() => import('../pages/admin/Exceptions'), 'AdminExceptionsPage');
// const AdminPayoutsPage = lazyLoad(() => import('../pages/admin/Payouts'), 'AdminPayoutsPage');
// const AdminRefundsPage = lazyLoad(() => import('../pages/admin/Refunds'), 'AdminRefundsPage');
// const AdminPaymentIssuesPage = lazyLoad(() => import('../pages/admin/PaymentIssues'), 'AdminPaymentIssuesPage');
// const AdminTeamPage = lazyLoad(() => import('../pages/admin/Team'), 'AdminTeamPage');
// const AdminSettingsPage = lazyLoad(() => import('../pages/admin/Settings'), 'AdminSettingsPage');
// const AdminNotificationsPage = lazyLoad(() => import('../pages/admin/Notifications'), 'AdminNotificationsPage');
// const AdminNotificationsSettingsPage = lazyLoad(() => import('../pages/admin/notifications/Settings'), 'AdminNotificationsSettingsPage');
// const AdminCouponsPage = lazyLoad(() => import('../pages/admin/Coupons'), 'AdminCouponsPage');
// const AdminCouponsNewPage = lazyLoad(() => import('../pages/admin/coupons/New'), 'AdminCouponsNewPage');
// const AdminCouponsEditPage = lazyLoad(() => import('../pages/admin/coupons/Edit'), 'AdminCouponsEditPage');
// const AdminCouponsUsagePage = lazyLoad(() => import('../pages/admin/coupons/Usage'), 'AdminCouponsUsagePage');
// const AdminKeywordResearchPage = lazyLoad(() => import('../pages/admin/KeywordResearch'), 'AdminKeywordResearchPage');
// const AdminAffiliatesPage = lazyLoad(() => import('../pages/admin/Affiliates'), 'AdminAffiliatesPage');
// const AdminAffiliatesPayoutsPage = lazyLoad(() => import('../pages/admin/affiliates/Payouts'), 'AdminAffiliatesPayoutsPage');
// const AdminAuthorsTransactionsPage = lazyLoad(() => import('../pages/admin/authors/Transactions'), 'AdminAuthorsTransactionsPage');
// const AdminLandingPagesPage = lazyLoad(() => import('../pages/admin/LandingPages'), 'AdminLandingPagesPage');
// const AdminLandingPagesContentPage = lazyLoad(() => import('../pages/admin/landing-pages/Content'), 'AdminLandingPagesContentPage');
// const AdminReaderBehaviorPage = lazyLoad(() => import('../pages/admin/ReaderBehavior'), 'AdminReaderBehaviorPage');
// const AdminPackageApprovalsPage = lazyLoad(() => import('../pages/admin/PackageApprovals'), 'AdminPackageApprovalsPage');
// const AdminLogsActivityPage = lazyLoad(() => import('../pages/admin/logs/Activity'), 'AdminLogsActivityPage');
// const AdminLogsEmailsPage = lazyLoad(() => import('../pages/admin/logs/Emails'), 'AdminLogsEmailsPage');
// const AdminLogsErrorsPage = lazyLoad(() => import('../pages/admin/logs/Errors'), 'AdminLogsErrorsPage');
// const AdminReportsFinancialPage = lazyLoad(() => import('../pages/admin/reports/Financial'), 'AdminReportsFinancialPage');
// const AdminReportsOperationalPage = lazyLoad(() => import('../pages/admin/reports/Operational'), 'AdminReportsOperationalPage');
// const AdminReportsAffiliatesPage = lazyLoad(() => import('../pages/admin/reports/Affiliates'), 'AdminReportsAffiliatesPage');

// ============================================
// AUTHOR PAGES - COMMENTED OUT
// ============================================
// const AuthorDashboardPage = lazyLoad(() => import('../pages/author/Author'), 'AuthorPage');
// const AuthorCampaignsPage = lazyLoad(() => import('../pages/author/Campaigns'), 'AuthorCampaignsPage');
// const AuthorCampaignsNewPage = lazyLoad(() => import('../pages/author/campaigns/New'), 'AuthorCampaignsNewPage');
// const AuthorCampaignsEditPage = lazyLoad(() => import('../pages/author/campaigns/Edit'), 'AuthorCampaignsEditPage');
// const AuthorCampaignsAnalyticsPage = lazyLoad(() => import('../pages/author/campaigns/Analytics'), 'AuthorCampaignsAnalyticsPage');
// const AuthorCreditsPage = lazyLoad(() => import('../pages/author/Credits'), 'AuthorCreditsPage');
// const AuthorCreditsPurchasePage = lazyLoad(() => import('../pages/author/credits/Purchase'), 'AuthorCreditsPurchasePage');
// const AuthorCreditsSuccessPage = lazyLoad(() => import('../pages/author/credits/Success'), 'AuthorCreditsSuccessPage');
// const AuthorCreditsCancelPage = lazyLoad(() => import('../pages/author/credits/Cancel'), 'AuthorCreditsCancelPage');
// const AuthorTransactionsPage = lazyLoad(() => import('../pages/author/Transactions'), 'AuthorTransactionsPage');
// const AuthorReportsPage = lazyLoad(() => import('../pages/author/Reports'), 'AuthorReportsPage');
// const AuthorSettingsPage = lazyLoad(() => import('../pages/author/Settings'), 'AuthorSettingsPage');
// const AuthorSupportPage = lazyLoad(() => import('../pages/author/Support'), 'AuthorSupportPage');
// const AuthorNotificationsPage = lazyLoad(() => import('../pages/author/Notifications'), 'AuthorNotificationsPage');
// const AuthorNotificationsSettingsPage = lazyLoad(() => import('../pages/author/notifications/Settings'), 'AuthorNotificationsSettingsPage');
// const AuthorSubscriptionPage = lazyLoad(() => import('../pages/author/Subscription'), 'AuthorSubscriptionPage');
// const AuthorKeywordResearchPage = lazyLoad(() => import('../pages/author/KeywordResearch'), 'AuthorKeywordResearchPage');
// const AuthorKeywordResearchNewPage = lazyLoad(() => import('../pages/author/keyword-research/New'), 'AuthorKeywordResearchNewPage');
// const AuthorKeywordResearchEditPage = lazyLoad(() => import('../pages/author/keyword-research/Edit'), 'AuthorKeywordResearchEditPage');

// ============================================
// READER PAGES - COMMENTED OUT
// ============================================
// const ReaderDashboardPage = lazyLoad(() => import('../pages/reader/Reader'), 'ReaderPage');
// const ReaderCampaignsPage = lazyLoad(() => import('../pages/reader/Campaigns'), 'ReaderCampaignsPage');
// const ReaderAssignmentsPage = lazyLoad(() => import('../pages/reader/Assignments'), 'ReaderAssignmentsPage');
// const ReaderAssignmentsSubmitReviewPage = lazyLoad(() => import('../pages/reader/assignments/SubmitReview'), 'ReaderAssignmentsSubmitReviewPage');
// const ReaderWalletPage = lazyLoad(() => import('../pages/reader/Wallet'), 'ReaderWalletPage');
// const ReaderWalletPayoutPage = lazyLoad(() => import('../pages/reader/wallet/Payout'), 'ReaderWalletPayoutPage');
// const ReaderProfilePage = lazyLoad(() => import('../pages/reader/Profile'), 'ReaderProfilePage');
// const ReaderSettingsPage = lazyLoad(() => import('../pages/reader/Settings'), 'ReaderSettingsPage');
// const ReaderSupportPage = lazyLoad(() => import('../pages/reader/Support'), 'ReaderSupportPage');
// const ReaderStatsPage = lazyLoad(() => import('../pages/reader/Stats'), 'ReaderStatsPage');
// const ReaderNotificationsPage = lazyLoad(() => import('../pages/reader/Notifications'), 'ReaderNotificationsPage');
// const ReaderNotificationsSettingsPage = lazyLoad(() => import('../pages/reader/notifications/Settings'), 'ReaderNotificationsSettingsPage');

// ============================================
// AFFILIATE PAGES - COMMENTED OUT
// ============================================
// const AffiliateDashboardPage = lazyLoad(() => import('../pages/affiliate/Dashboard'), 'AffiliateDashboardPage');
// const AffiliateRegisterPage = lazyLoad(() => import('../pages/affiliate/Register'), 'AffiliateRegisterPage');
// const AffiliateCommissionsPage = lazyLoad(() => import('../pages/affiliate/Commissions'), 'AffiliateCommissionsPage');
// const AffiliatePayoutsPage = lazyLoad(() => import('../pages/affiliate/Payouts'), 'AffiliatePayoutsPage');
// const AffiliateReferralLinksPage = lazyLoad(() => import('../pages/affiliate/ReferralLinks'), 'AffiliateReferralLinksPage');
// const AffiliateMarketingMaterialsPage = lazyLoad(() => import('../pages/affiliate/MarketingMaterials'), 'AffiliateMarketingMaterialsPage');
// const AffiliateReferredAuthorsPage = lazyLoad(() => import('../pages/affiliate/ReferredAuthors'), 'AffiliateReferredAuthorsPage');
// const AffiliateSettingsPage = lazyLoad(() => import('../pages/affiliate/Settings'), 'AffiliateSettingsPage');
// const AffiliateNotificationsPage = lazyLoad(() => import('../pages/affiliate/Notifications'), 'AffiliateNotificationsPage');
// const AffiliateNotificationsSettingsPage = lazyLoad(() => import('../pages/affiliate/notifications/Settings'), 'AffiliateNotificationsSettingsPage');

// ============================================
// CLOSER PAGES - COMMENTED OUT
// ============================================
// const CloserDashboardPage = lazyLoad(() => import('../pages/closer/Closer'), 'CloserPage');
// const CloserPackagesPage = lazyLoad(() => import('../pages/closer/Packages'), 'CloserPackagesPage');
// const CloserPackagesNewPage = lazyLoad(() => import('../pages/closer/packages/New'), 'CloserPackagesNewPage');
// const CloserInvoicesPage = lazyLoad(() => import('../pages/closer/Invoices'), 'CloserInvoicesPage');
// const CloserSalesPage = lazyLoad(() => import('../pages/closer/Sales'), 'CloserSalesPage');

// ============================================
// CHECKOUT PAGES - COMMENTED OUT
// ============================================
// const CheckoutCustomPage = lazyLoad(() => import('../pages/checkout/Custom'), 'CheckoutCustomPage');
// const CheckoutCustomSuccessPage = lazyLoad(() => import('../pages/checkout/custom/Success'), 'CheckoutCustomSuccessPage');

export const router = createBrowserRouter([
  {
    path: '/:locale',
    element: <RootLayout />,
    children: [
      // Landing page - ACTIVE
      { index: true, element: LandingPage },

      // ============================================
      // ALL OTHER ROUTES - COMMENTED OUT
      // ============================================

      // // Public auth routes
      // { path: 'login', element: LoginPage },
      // { path: 'register', element: RegisterPage },
      // { path: 'forgot-password', element: ForgotPasswordPage },
      // { path: 'reset-password', element: ResetPasswordPage },
      // { path: 'verify-email', element: VerifyEmailPage },
      // { path: 'verify-email-required', element: VerifyEmailRequiredPage },
      // { path: 'accept-terms', element: AcceptTermsPage },

      // // Legal pages
      // { path: 'terms', element: TermsPage },
      // { path: 'privacy', element: PrivacyPage },
      // { path: 'cookies', element: CookiesPage },

      // // Public pages
      // { path: 'forbidden', element: ForbiddenPage },
      // { path: 'campaigns/:slug/:lang', element: PublicCampaignsPage },

      // // Checkout routes (semi-protected)
      // { path: 'checkout/custom/:token', element: CheckoutCustomPage },
      // { path: 'checkout/custom/:token/success', element: CheckoutCustomSuccessPage },

      // // Protected routes
      // {
      //   element: <ProtectedRoute />,
      //   children: [
      //     // Admin routes
      //     {
      //       path: 'admin',
      //       element: (
      //         <RoleGuard allowedRoles={['ADMIN']}>
      //           <AdminLayout />
      //         </RoleGuard>
      //       ),
      //       children: [
      //         { path: 'dashboard', element: AdminDashboardPage },
      //         { path: 'validation', element: AdminValidationPage },
      //         { path: 'authors', element: AdminAuthorsPage },
      //         { path: 'authors/:id/transactions', element: AdminAuthorsTransactionsPage },
      //         { path: 'readers', element: AdminReadersPage },
      //         { path: 'readers/:id', element: AdminReadersPage },
      //         { path: 'campaigns', element: AdminCampaignsPage },
      //         { path: 'campaigns/:id', element: AdminCampaignsPage },
      //         { path: 'campaigns/:id/controls', element: AdminCampaignControlsPage },
      //         { path: 'disputes', element: AdminDisputesPage },
      //         { path: 'issues', element: AdminIssuesPage },
      //         { path: 'exceptions', element: AdminExceptionsPage },
      //         { path: 'payouts', element: AdminPayoutsPage },
      //         { path: 'refunds', element: AdminRefundsPage },
      //         { path: 'payment-issues', element: AdminPaymentIssuesPage },
      //         { path: 'team', element: AdminTeamPage },
      //         { path: 'settings', element: AdminSettingsPage },
      //         { path: 'notifications', element: AdminNotificationsPage },
      //         { path: 'notifications/settings', element: AdminNotificationsSettingsPage },
      //         { path: 'coupons', element: AdminCouponsPage },
      //         { path: 'coupons/new', element: AdminCouponsNewPage },
      //         { path: 'coupons/:id', element: AdminCouponsPage },
      //         { path: 'coupons/:id/edit', element: AdminCouponsEditPage },
      //         { path: 'coupons/:id/usage', element: AdminCouponsUsagePage },
      //         { path: 'keyword-research', element: AdminKeywordResearchPage },
      //         { path: 'affiliates', element: AdminAffiliatesPage },
      //         { path: 'affiliates/:id', element: AdminAffiliatesPage },
      //         { path: 'affiliates/payouts', element: AdminAffiliatesPayoutsPage },
      //         { path: 'landing-pages', element: AdminLandingPagesPage },
      //         { path: 'landing-pages/content', element: AdminLandingPagesContentPage },
      //         { path: 'reader-behavior', element: AdminReaderBehaviorPage },
      //         { path: 'package-approvals', element: AdminPackageApprovalsPage },
      //         { path: 'logs/activity', element: AdminLogsActivityPage },
      //         { path: 'logs/emails', element: AdminLogsEmailsPage },
      //         { path: 'logs/errors', element: AdminLogsErrorsPage },
      //         { path: 'reports/financial', element: AdminReportsFinancialPage },
      //         { path: 'reports/operational', element: AdminReportsOperationalPage },
      //         { path: 'reports/affiliates', element: AdminReportsAffiliatesPage },
      //       ],
      //     },

      //     // Author routes
      //     {
      //       path: 'author',
      //       element: (
      //         <RoleGuard allowedRoles={['AUTHOR']}>
      //           <AuthorLayout />
      //         </RoleGuard>
      //       ),
      //       children: [
      //         { index: true, element: AuthorDashboardPage },
      //         { path: 'campaigns', element: AuthorCampaignsPage },
      //         { path: 'campaigns/new', element: AuthorCampaignsNewPage },
      //         { path: 'campaigns/:id', element: AuthorCampaignsPage },
      //         { path: 'campaigns/:id/edit', element: AuthorCampaignsEditPage },
      //         { path: 'campaigns/:id/analytics', element: AuthorCampaignsAnalyticsPage },
      //         { path: 'credits', element: AuthorCreditsPage },
      //         { path: 'credits/purchase', element: AuthorCreditsPurchasePage },
      //         { path: 'credits/success', element: AuthorCreditsSuccessPage },
      //         { path: 'credits/cancel', element: AuthorCreditsCancelPage },
      //         { path: 'transactions', element: AuthorTransactionsPage },
      //         { path: 'reports', element: AuthorReportsPage },
      //         { path: 'settings', element: AuthorSettingsPage },
      //         { path: 'support', element: AuthorSupportPage },
      //         { path: 'notifications', element: AuthorNotificationsPage },
      //         { path: 'notifications/settings', element: AuthorNotificationsSettingsPage },
      //         { path: 'subscription', element: AuthorSubscriptionPage },
      //         { path: 'keyword-research', element: AuthorKeywordResearchPage },
      //         { path: 'keyword-research/new', element: AuthorKeywordResearchNewPage },
      //         { path: 'keyword-research/:id', element: AuthorKeywordResearchPage },
      //         { path: 'keyword-research/:id/edit', element: AuthorKeywordResearchEditPage },
      //       ],
      //     },

      //     // Reader routes
      //     {
      //       path: 'reader',
      //       element: (
      //         <RoleGuard allowedRoles={['READER']}>
      //           <ReaderLayout />
      //         </RoleGuard>
      //       ),
      //       children: [
      //         { index: true, element: ReaderDashboardPage },
      //         { path: 'campaigns', element: ReaderCampaignsPage },
      //         { path: 'assignments/:id', element: ReaderAssignmentsPage },
      //         { path: 'assignments/:id/submit-review', element: ReaderAssignmentsSubmitReviewPage },
      //         { path: 'wallet', element: ReaderWalletPage },
      //         { path: 'wallet/payout', element: ReaderWalletPayoutPage },
      //         { path: 'profile', element: ReaderProfilePage },
      //         { path: 'settings', element: ReaderSettingsPage },
      //         { path: 'support', element: ReaderSupportPage },
      //         { path: 'stats', element: ReaderStatsPage },
      //         { path: 'notifications', element: ReaderNotificationsPage },
      //         { path: 'notifications/settings', element: ReaderNotificationsSettingsPage },
      //       ],
      //     },

      //     // Affiliate routes
      //     {
      //       path: 'affiliate',
      //       element: (
      //         <RoleGuard allowedRoles={['AFFILIATE']}>
      //           <AffiliateLayout />
      //         </RoleGuard>
      //       ),
      //       children: [
      //         { path: 'dashboard', element: AffiliateDashboardPage },
      //         { path: 'register', element: AffiliateRegisterPage },
      //         { path: 'commissions', element: AffiliateCommissionsPage },
      //         { path: 'payouts', element: AffiliatePayoutsPage },
      //         { path: 'referral-links', element: AffiliateReferralLinksPage },
      //         { path: 'marketing-materials', element: AffiliateMarketingMaterialsPage },
      //         { path: 'referred-authors', element: AffiliateReferredAuthorsPage },
      //         { path: 'settings', element: AffiliateSettingsPage },
      //         { path: 'notifications', element: AffiliateNotificationsPage },
      //         { path: 'notifications/settings', element: AffiliateNotificationsSettingsPage },
      //       ],
      //     },

      //     // Closer routes
      //     {
      //       path: 'closer',
      //       element: (
      //         <RoleGuard allowedRoles={['CLOSER']}>
      //           <CloserLayout />
      //         </RoleGuard>
      //       ),
      //       children: [
      //         { index: true, element: CloserDashboardPage },
      //         { path: 'packages', element: CloserPackagesPage },
      //         { path: 'packages/new', element: CloserPackagesNewPage },
      //         { path: 'packages/:id', element: CloserPackagesPage },
      //         { path: 'invoices', element: CloserInvoicesPage },
      //         { path: 'sales', element: CloserSalesPage },
      //       ],
      //     },
      //   ],
      // },
    ],
  },

  // Redirect root to default locale
  { path: '/', element: <Navigate to="/en" replace /> },

  // 404
  { path: '*', element: <div className="flex min-h-screen items-center justify-center"><h1 className="text-2xl font-bold">Page Not Found</h1></div> },
]);
