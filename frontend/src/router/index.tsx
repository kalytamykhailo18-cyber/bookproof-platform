import { createBrowserRouter, Navigate } from 'react-router-dom';
import { lazy, Suspense } from 'react';
import { RootLayout } from '../layouts/RootLayout';
import { PublicLayout } from '../layouts/PublicLayout';
import { AdminLayout } from '../layouts/AdminLayout';
import { AuthorLayout } from '../layouts/AuthorLayout';
import { ReaderLayout } from '../layouts/ReaderLayout';
import { AffiliateLayout } from '../layouts/AffiliateLayout';
import { CloserLayout } from '../layouts/CloserLayout';
import { ProtectedRoute } from './ProtectedRoute';
import { RoleGuard } from './RoleGuard';
import { Loader2 } from 'lucide-react';

// Loading component for lazy loaded pages
const PageLoader = () => (
  <div className="flex min-h-[50vh] items-center justify-center">
    <Loader2 className="h-8 w-8 animate-spin text-primary" />
  </div>
);

// Lazy route wrapper component - Clean React pattern
function LazyRoute({ component: Component }: { component: React.LazyExoticComponent<React.ComponentType> }) {
  return (
    <Suspense fallback={<PageLoader />}>
      <Component />
    </Suspense>
  );
}

// ============================================
// PUBLIC PAGES
// ============================================
const LandingPage = lazy(() => import('../pages/landing/Landing').then(m => ({ default: m.LandingPage })));

// ============================================
// AUTH PAGES
// ============================================
const LoginPage = lazy(() => import('../pages/auth/Login').then(m => ({ default: m.LoginPage })));
const RegisterPage = lazy(() => import('../pages/auth/Register').then(m => ({ default: m.RegisterPage })));
const ForgotPasswordPage = lazy(() => import('../pages/auth/ForgotPassword').then(m => ({ default: m.ForgotPasswordPage })));
const ResetPasswordPage = lazy(() => import('../pages/auth/ResetPassword').then(m => ({ default: m.ResetPasswordPage })));
const VerifyEmailPage = lazy(() => import('../pages/auth/VerifyEmail').then(m => ({ default: m.VerifyEmailPage })));
const VerifyEmailRequiredPage = lazy(() => import('../pages/auth/VerifyEmailRequired').then(m => ({ default: m.VerifyEmailRequiredPage })));
const AcceptTermsPage = lazy(() => import('../pages/auth/AcceptTerms').then(m => ({ default: m.AcceptTermsPage })));

// ============================================
// LEGAL PAGES
// ============================================
const TermsPage = lazy(() => import('../pages/legal/Terms').then(m => ({ default: m.TermsOfServicePage })));
const PrivacyPage = lazy(() => import('../pages/legal/Privacy').then(m => ({ default: m.PrivacyPolicyPage })));
const CookiesPage = lazy(() => import('../pages/legal/Cookies').then(m => ({ default: m.CookiePolicyPage })));

// ============================================
// PUBLIC PAGES
// ============================================
const PublicCampaignsPage = lazy(() => import('../pages/public/Campaigns').then(m => ({ default: m.PublicCampaignPage })));
const ForbiddenPage = lazy(() => import('../pages/forbidden/Forbidden').then(m => ({ default: m.ForbiddenPage })));

// ============================================
// ADMIN PAGES
// ============================================
const AdminDashboardPage = lazy(() => import('../pages/admin/Dashboard').then(m => ({ default: m.AdminDashboardPage })));
const AdminValidationPage = lazy(() => import('../pages/admin/Validation').then(m => ({ default: m.AdminValidationPage })));
const AdminAuthorsPage = lazy(() => import('../pages/admin/Authors').then(m => ({ default: m.AdminAuthorsPage })));
const AdminReadersPage = lazy(() => import('../pages/admin/Readers').then(m => ({ default: m.AdminReaderDetailPage })));
const AdminCampaignsPage = lazy(() => import('../pages/admin/Campaigns').then(m => ({ default: m.AdminCampaignDetailPage })));
const AdminCampaignControlsPage = lazy(() => import('../pages/admin/campaigns/Controls').then(m => ({ default: m.CampaignControlsPage })));
const AdminDisputesPage = lazy(() => import('../pages/admin/Disputes').then(m => ({ default: m.DisputesPage })));
const AdminIssuesPage = lazy(() => import('../pages/admin/Issues').then(m => ({ default: m.AdminIssuesPage })));
const AdminExceptionsPage = lazy(() => import('../pages/admin/Exceptions').then(m => ({ default: m.ExceptionsPage })));
const AdminPayoutsPage = lazy(() => import('../pages/admin/Payouts').then(m => ({ default: m.AdminPayoutsPage })));
const AdminRefundsPage = lazy(() => import('../pages/admin/Refunds').then(m => ({ default: m.AdminRefundsPage })));
const AdminPaymentIssuesPage = lazy(() => import('../pages/admin/PaymentIssues').then(m => ({ default: m.PaymentIssuesPage })));
const AdminTeamPage = lazy(() => import('../pages/admin/Team').then(m => ({ default: m.AdminTeamPage })));
const AdminSettingsPage = lazy(() => import('../pages/admin/Settings').then(m => ({ default: m.AdminSettingsPage })));
const AdminNotificationsPage = lazy(() => import('../pages/admin/Notifications').then(m => ({ default: m.NotificationsPage })));
const AdminNotificationsSettingsPage = lazy(() => import('../pages/admin/notifications/Settings').then(m => ({ default: m.NotificationSettingsPage })));
const AdminCouponsPage = lazy(() => import('../pages/admin/Coupons').then(m => ({ default: m.CouponDetailPage })));
const AdminCouponsNewPage = lazy(() => import('../pages/admin/coupons/New').then(m => ({ default: m.NewCouponPage })));
const AdminCouponsEditPage = lazy(() => import('../pages/admin/coupons/Edit').then(m => ({ default: m.EditCouponPage })));
const AdminCouponsUsagePage = lazy(() => import('../pages/admin/coupons/Usage').then(m => ({ default: m.CouponUsagePage })));
const AdminKeywordResearchPage = lazy(() => import('../pages/admin/KeywordResearch').then(m => ({ default: m.AdminKeywordResearchPage })));
const AdminAffiliatesPage = lazy(() => import('../pages/admin/Affiliates').then(m => ({ default: m.AdminAffiliateDetailsPage })));
const AdminAffiliatesPayoutsPage = lazy(() => import('../pages/admin/affiliates/Payouts').then(m => ({ default: m.AdminAffiliatePayoutsPage })));
const AdminAuthorsTransactionsPage = lazy(() => import('../pages/admin/authors/Transactions').then(m => ({ default: m.AuthorTransactionsPage })));
const AdminLandingPagesPage = lazy(() => import('../pages/admin/LandingPages').then(m => ({ default: m.AdminLandingPagesPage })));
const AdminLandingPagesContentPage = lazy(() => import('../pages/admin/landing-pages/Content').then(m => ({ default: m.LandingPageContentEditor })));
const AdminReaderBehaviorPage = lazy(() => import('../pages/admin/ReaderBehavior').then(m => ({ default: m.ReaderBehaviorPage })));
const AdminPackageApprovalsPage = lazy(() => import('../pages/admin/PackageApprovals').then(m => ({ default: m.PackageApprovalsPage })));
// Log pages - not yet implemented
// const AdminLogsActivityPage = lazy(() => import('../pages/admin/logs/Activity').then(m => ({ default: m.ActivityLogsPage })));
// const AdminLogsEmailsPage = lazy(() => import('../pages/admin/logs/Emails').then(m => ({ default: m.EmailLogsPage })));
// const AdminLogsErrorsPage = lazy(() => import('../pages/admin/logs/Errors').then(m => ({ default: m.ErrorLogsPage })));
const AdminReportsFinancialPage = lazy(() => import('../pages/admin/reports/Financial').then(m => ({ default: m.AdminFinancialReportsPage })));
const AdminReportsOperationalPage = lazy(() => import('../pages/admin/reports/Operational').then(m => ({ default: m.AdminOperationalReportsPage })));
const AdminReportsAffiliatesPage = lazy(() => import('../pages/admin/reports/Affiliates').then(m => ({ default: m.AdminAffiliateReportsPage })));

// ============================================
// AUTHOR PAGES
// ============================================
const AuthorDashboardPage = lazy(() => import('../pages/author/Author').then(m => ({ default: m.AuthorDashboardPage })));
const AuthorCampaignsPage = lazy(() => import('../pages/author/Campaigns').then(m => ({ default: m.CampaignDetailPage })));
const AuthorCampaignsNewPage = lazy(() => import('../pages/author/campaigns/New').then(m => ({ default: m.NewCampaignPage })));
const AuthorCampaignsEditPage = lazy(() => import('../pages/author/campaigns/Edit').then(m => ({ default: m.EditCampaignPage })));
const AuthorCampaignsAnalyticsPage = lazy(() => import('../pages/author/campaigns/Analytics').then(m => ({ default: m.CampaignAnalyticsPage })));
const AuthorCreditsPage = lazy(() => import('../pages/author/Credits').then(m => ({ default: m.CreditPurchasePage })));
const AuthorCreditsPurchasePage = lazy(() => import('../pages/author/credits/Purchase').then(m => ({ default: m.CreditPurchasePage })));
const AuthorCreditsSuccessPage = lazy(() => import('../pages/author/credits/Success').then(m => ({ default: m.CreditPurchaseSuccessPage })));
const AuthorCreditsCancelPage = lazy(() => import('../pages/author/credits/Cancel').then(m => ({ default: m.CreditPurchaseCancelPage })));
const AuthorTransactionsPage = lazy(() => import('../pages/author/Transactions').then(m => ({ default: m.TransactionsPage })));
const AuthorReportsPage = lazy(() => import('../pages/author/Reports').then(m => ({ default: m.ReportsPage })));
const AuthorSettingsPage = lazy(() => import('../pages/author/Settings').then(m => ({ default: m.SettingsPage })));
const AuthorSupportPage = lazy(() => import('../pages/author/Support').then(m => ({ default: m.AuthorSupportPage })));
const AuthorNotificationsPage = lazy(() => import('../pages/author/Notifications').then(m => ({ default: m.NotificationsPage })));
const AuthorNotificationsSettingsPage = lazy(() => import('../pages/author/notifications/Settings').then(m => ({ default: m.NotificationSettingsPage })));
const AuthorSubscriptionPage = lazy(() => import('../pages/author/Subscription').then(m => ({ default: m.SubscriptionPage })));
const AuthorKeywordResearchPage = lazy(() => import('../pages/author/KeywordResearch').then(m => ({ default: m.KeywordResearchDetailsPage })));
const AuthorKeywordResearchNewPage = lazy(() => import('../pages/author/keyword-research/New').then(m => ({ default: m.NewKeywordResearchPage })));
const AuthorKeywordResearchEditPage = lazy(() => import('../pages/author/keyword-research/Edit').then(m => ({ default: m.EditKeywordResearchPage })));

// ============================================
// READER PAGES
// ============================================
const ReaderDashboardPage = lazy(() => import('../pages/reader/Reader').then(m => ({ default: m.ReaderDashboard })));
const ReaderCampaignsPage = lazy(() => import('../pages/reader/Campaigns').then(m => ({ default: m.CampaignsPage })));
const ReaderAssignmentsPage = lazy(() => import('../pages/reader/Assignments').then(m => ({ default: m.AssignmentDetailPage })));
const ReaderAssignmentsSubmitReviewPage = lazy(() => import('../pages/reader/assignments/SubmitReview').then(m => ({ default: m.SubmitReviewPage })));
const ReaderWalletPage = lazy(() => import('../pages/reader/Wallet').then(m => ({ default: m.WalletPage })));
const ReaderWalletPayoutPage = lazy(() => import('../pages/reader/wallet/Payout').then(m => ({ default: m.RequestPayoutPage })));
const ReaderProfilePage = lazy(() => import('../pages/reader/Profile').then(m => ({ default: m.ReaderProfilePage })));
const ReaderSettingsPage = lazy(() => import('../pages/reader/Settings').then(m => ({ default: m.SettingsPage })));
const ReaderSupportPage = lazy(() => import('../pages/reader/Support').then(m => ({ default: m.ReaderSupportPage })));
const ReaderStatsPage = lazy(() => import('../pages/reader/Stats').then(m => ({ default: m.ReaderStatsPage })));
const ReaderNotificationsPage = lazy(() => import('../pages/reader/Notifications').then(m => ({ default: m.NotificationsPage })));
const ReaderNotificationsSettingsPage = lazy(() => import('../pages/reader/notifications/Settings').then(m => ({ default: m.NotificationSettingsPage })));

// ============================================
// AFFILIATE PAGES
// ============================================
const AffiliateDashboardPage = lazy(() => import('../pages/affiliate/Dashboard').then(m => ({ default: m.AffiliateDashboardPage })));
const AffiliateRegisterPage = lazy(() => import('../pages/affiliate/Register').then(m => ({ default: m.AffiliateRegisterPage })));
const AffiliateCommissionsPage = lazy(() => import('../pages/affiliate/Commissions').then(m => ({ default: m.AffiliateCommissionsPage })));
const AffiliatePayoutsPage = lazy(() => import('../pages/affiliate/Payouts').then(m => ({ default: m.AffiliatePayoutsPage })));
const AffiliateReferralLinksPage = lazy(() => import('../pages/affiliate/ReferralLinks').then(m => ({ default: m.AffiliateReferralLinksPage })));
const AffiliateMarketingMaterialsPage = lazy(() => import('../pages/affiliate/MarketingMaterials').then(m => ({ default: m.MarketingMaterialsPage })));
const AffiliateReferredAuthorsPage = lazy(() => import('../pages/affiliate/ReferredAuthors').then(m => ({ default: m.ReferredAuthorsPage })));
const AffiliateSettingsPage = lazy(() => import('../pages/affiliate/Settings').then(m => ({ default: m.SettingsPage })));
const AffiliateNotificationsPage = lazy(() => import('../pages/affiliate/Notifications').then(m => ({ default: m.NotificationsPage })));
const AffiliateNotificationsSettingsPage = lazy(() => import('../pages/affiliate/notifications/Settings').then(m => ({ default: m.NotificationSettingsPage })));

// ============================================
// CLOSER PAGES
// ============================================
const CloserDashboardPage = lazy(() => import('../pages/closer/Closer').then(m => ({ default: m.CloserDashboardPage })));
const CloserPackagesPage = lazy(() => import('../pages/closer/Packages').then(m => ({ default: m.PackageDetailPage })));
const CloserPackagesNewPage = lazy(() => import('../pages/closer/packages/New').then(m => ({ default: m.CreatePackagePage })));
const CloserInvoicesPage = lazy(() => import('../pages/closer/Invoices').then(m => ({ default: m.InvoicesPage })));
const CloserSalesPage = lazy(() => import('../pages/closer/Sales').then(m => ({ default: m.SalesHistoryPage })));

// ============================================
// CHECKOUT PAGES
// ============================================
const CheckoutCustomPage = lazy(() => import('../pages/checkout/Custom').then(m => ({ default: m.CustomPackageCheckoutPage })));
const CheckoutCustomSuccessPage = lazy(() => import('../pages/checkout/custom/Success').then(m => ({ default: m.CustomPackageSuccessPage })));

export const router = createBrowserRouter([
  {
    path: '/:locale',
    element: <RootLayout />,
    children: [
      // Public pages with Header/Footer layout
      {
        element: <PublicLayout />,
        children: [
          // Landing page
          { index: true, element: <LazyRoute component={LandingPage} /> },

          // Public auth routes
          { path: 'login', element: <LazyRoute component={LoginPage} /> },
          { path: 'register', element: <LazyRoute component={RegisterPage} /> },
          { path: 'forgot-password', element: <LazyRoute component={ForgotPasswordPage} /> },
          { path: 'reset-password', element: <LazyRoute component={ResetPasswordPage} /> },
          { path: 'verify-email', element: <LazyRoute component={VerifyEmailPage} /> },
          { path: 'verify-email-required', element: <LazyRoute component={VerifyEmailRequiredPage} /> },
          { path: 'accept-terms', element: <LazyRoute component={AcceptTermsPage} /> },

          // Legal pages
          { path: 'terms', element: <LazyRoute component={TermsPage} /> },
          { path: 'privacy', element: <LazyRoute component={PrivacyPage} /> },
          { path: 'cookies', element: <LazyRoute component={CookiesPage} /> },

          // Public pages
          { path: 'forbidden', element: <LazyRoute component={ForbiddenPage} /> },
          { path: 'campaigns/:slug/:lang', element: <LazyRoute component={PublicCampaignsPage} /> },
        ],
      },

      // Checkout routes (semi-protected, no header/footer)
      { path: 'checkout/custom/:token', element: <LazyRoute component={CheckoutCustomPage} /> },
      { path: 'checkout/custom/:token/success', element: <LazyRoute component={CheckoutCustomSuccessPage} /> },

      // Protected routes
      {
        element: <ProtectedRoute />,
        children: [
          // Admin routes
          {
            path: 'admin',
            element: (
              <RoleGuard allowedRoles={['ADMIN']}>
                <AdminLayout />
              </RoleGuard>
            ),
            children: [
              { path: 'dashboard', element: <LazyRoute component={AdminDashboardPage} /> },
              { path: 'validation', element: <LazyRoute component={AdminValidationPage} /> },
              { path: 'authors', element: <LazyRoute component={AdminAuthorsPage} /> },
              { path: 'authors/:id/transactions', element: <LazyRoute component={AdminAuthorsTransactionsPage} /> },
              { path: 'readers', element: <LazyRoute component={AdminReadersPage} /> },
              { path: 'readers/:id', element: <LazyRoute component={AdminReadersPage} /> },
              { path: 'campaigns', element: <LazyRoute component={AdminCampaignsPage} /> },
              { path: 'campaigns/:id', element: <LazyRoute component={AdminCampaignsPage} /> },
              { path: 'campaigns/:id/controls', element: <LazyRoute component={AdminCampaignControlsPage} /> },
              { path: 'disputes', element: <LazyRoute component={AdminDisputesPage} /> },
              { path: 'issues', element: <LazyRoute component={AdminIssuesPage} /> },
              { path: 'exceptions', element: <LazyRoute component={AdminExceptionsPage} /> },
              { path: 'payouts', element: <LazyRoute component={AdminPayoutsPage} /> },
              { path: 'refunds', element: <LazyRoute component={AdminRefundsPage} /> },
              { path: 'payment-issues', element: <LazyRoute component={AdminPaymentIssuesPage} /> },
              { path: 'team', element: <LazyRoute component={AdminTeamPage} /> },
              { path: 'settings', element: <LazyRoute component={AdminSettingsPage} /> },
              { path: 'notifications', element: <LazyRoute component={AdminNotificationsPage} /> },
              { path: 'notifications/settings', element: <LazyRoute component={AdminNotificationsSettingsPage} /> },
              { path: 'coupons', element: <LazyRoute component={AdminCouponsPage} /> },
              { path: 'coupons/new', element: <LazyRoute component={AdminCouponsNewPage} /> },
              { path: 'coupons/:id', element: <LazyRoute component={AdminCouponsPage} /> },
              { path: 'coupons/:id/edit', element: <LazyRoute component={AdminCouponsEditPage} /> },
              { path: 'coupons/:id/usage', element: <LazyRoute component={AdminCouponsUsagePage} /> },
              { path: 'keyword-research', element: <LazyRoute component={AdminKeywordResearchPage} /> },
              { path: 'affiliates', element: <LazyRoute component={AdminAffiliatesPage} /> },
              { path: 'affiliates/:id', element: <LazyRoute component={AdminAffiliatesPage} /> },
              { path: 'affiliates/payouts', element: <LazyRoute component={AdminAffiliatesPayoutsPage} /> },
              { path: 'landing-pages', element: <LazyRoute component={AdminLandingPagesPage} /> },
              { path: 'landing-pages/content', element: <LazyRoute component={AdminLandingPagesContentPage} /> },
              { path: 'reader-behavior', element: <LazyRoute component={AdminReaderBehaviorPage} /> },
              { path: 'package-approvals', element: <LazyRoute component={AdminPackageApprovalsPage} /> },
              // Log routes - not yet implemented
              // { path: 'logs/activity', element: <LazyRoute component={AdminLogsActivityPage} /> },
              // { path: 'logs/emails', element: <LazyRoute component={AdminLogsEmailsPage} /> },
              // { path: 'logs/errors', element: <LazyRoute component={AdminLogsErrorsPage} /> },
              { path: 'reports/financial', element: <LazyRoute component={AdminReportsFinancialPage} /> },
              { path: 'reports/operational', element: <LazyRoute component={AdminReportsOperationalPage} /> },
              { path: 'reports/affiliates', element: <LazyRoute component={AdminReportsAffiliatesPage} /> },
            ],
          },

          // Author routes
          {
            path: 'author',
            element: (
              <RoleGuard allowedRoles={['AUTHOR']}>
                <AuthorLayout />
              </RoleGuard>
            ),
            children: [
              { index: true, element: <LazyRoute component={AuthorDashboardPage} /> },
              { path: 'campaigns', element: <LazyRoute component={AuthorCampaignsPage} /> },
              { path: 'campaigns/new', element: <LazyRoute component={AuthorCampaignsNewPage} /> },
              { path: 'campaigns/:id', element: <LazyRoute component={AuthorCampaignsPage} /> },
              { path: 'campaigns/:id/edit', element: <LazyRoute component={AuthorCampaignsEditPage} /> },
              { path: 'campaigns/:id/analytics', element: <LazyRoute component={AuthorCampaignsAnalyticsPage} /> },
              { path: 'credits', element: <LazyRoute component={AuthorCreditsPage} /> },
              { path: 'credits/purchase', element: <LazyRoute component={AuthorCreditsPurchasePage} /> },
              { path: 'credits/success', element: <LazyRoute component={AuthorCreditsSuccessPage} /> },
              { path: 'credits/cancel', element: <LazyRoute component={AuthorCreditsCancelPage} /> },
              { path: 'transactions', element: <LazyRoute component={AuthorTransactionsPage} /> },
              { path: 'reports', element: <LazyRoute component={AuthorReportsPage} /> },
              { path: 'settings', element: <LazyRoute component={AuthorSettingsPage} /> },
              { path: 'support', element: <LazyRoute component={AuthorSupportPage} /> },
              { path: 'notifications', element: <LazyRoute component={AuthorNotificationsPage} /> },
              { path: 'notifications/settings', element: <LazyRoute component={AuthorNotificationsSettingsPage} /> },
              { path: 'subscription', element: <LazyRoute component={AuthorSubscriptionPage} /> },
              { path: 'keyword-research', element: <LazyRoute component={AuthorKeywordResearchPage} /> },
              { path: 'keyword-research/new', element: <LazyRoute component={AuthorKeywordResearchNewPage} /> },
              { path: 'keyword-research/:id', element: <LazyRoute component={AuthorKeywordResearchPage} /> },
              { path: 'keyword-research/:id/edit', element: <LazyRoute component={AuthorKeywordResearchEditPage} /> },
            ],
          },

          // Reader routes
          {
            path: 'reader',
            element: (
              <RoleGuard allowedRoles={['READER']}>
                <ReaderLayout />
              </RoleGuard>
            ),
            children: [
              { index: true, element: <LazyRoute component={ReaderDashboardPage} /> },
              { path: 'campaigns', element: <LazyRoute component={ReaderCampaignsPage} /> },
              { path: 'assignments/:id', element: <LazyRoute component={ReaderAssignmentsPage} /> },
              { path: 'assignments/:id/submit-review', element: <LazyRoute component={ReaderAssignmentsSubmitReviewPage} /> },
              { path: 'wallet', element: <LazyRoute component={ReaderWalletPage} /> },
              { path: 'wallet/payout', element: <LazyRoute component={ReaderWalletPayoutPage} /> },
              { path: 'profile', element: <LazyRoute component={ReaderProfilePage} /> },
              { path: 'settings', element: <LazyRoute component={ReaderSettingsPage} /> },
              { path: 'support', element: <LazyRoute component={ReaderSupportPage} /> },
              { path: 'stats', element: <LazyRoute component={ReaderStatsPage} /> },
              { path: 'notifications', element: <LazyRoute component={ReaderNotificationsPage} /> },
              { path: 'notifications/settings', element: <LazyRoute component={ReaderNotificationsSettingsPage} /> },
            ],
          },

          // Affiliate routes
          {
            path: 'affiliate',
            element: (
              <RoleGuard allowedRoles={['AFFILIATE']}>
                <AffiliateLayout />
              </RoleGuard>
            ),
            children: [
              { path: 'dashboard', element: <LazyRoute component={AffiliateDashboardPage} /> },
              { path: 'register', element: <LazyRoute component={AffiliateRegisterPage} /> },
              { path: 'commissions', element: <LazyRoute component={AffiliateCommissionsPage} /> },
              { path: 'payouts', element: <LazyRoute component={AffiliatePayoutsPage} /> },
              { path: 'referral-links', element: <LazyRoute component={AffiliateReferralLinksPage} /> },
              { path: 'marketing-materials', element: <LazyRoute component={AffiliateMarketingMaterialsPage} /> },
              { path: 'referred-authors', element: <LazyRoute component={AffiliateReferredAuthorsPage} /> },
              { path: 'settings', element: <LazyRoute component={AffiliateSettingsPage} /> },
              { path: 'notifications', element: <LazyRoute component={AffiliateNotificationsPage} /> },
              { path: 'notifications/settings', element: <LazyRoute component={AffiliateNotificationsSettingsPage} /> },
            ],
          },

          // Closer routes
          {
            path: 'closer',
            element: (
              <RoleGuard allowedRoles={['CLOSER']}>
                <CloserLayout />
              </RoleGuard>
            ),
            children: [
              { index: true, element: <LazyRoute component={CloserDashboardPage} /> },
              { path: 'packages', element: <LazyRoute component={CloserPackagesPage} /> },
              { path: 'packages/new', element: <LazyRoute component={CloserPackagesNewPage} /> },
              { path: 'packages/:id', element: <LazyRoute component={CloserPackagesPage} /> },
              { path: 'invoices', element: <LazyRoute component={CloserInvoicesPage} /> },
              { path: 'sales', element: <LazyRoute component={CloserSalesPage} /> },
            ],
          },
        ],
      },
    ],
  },

  // Redirect root to default locale
  { path: '/', element: <Navigate to="/en" replace /> },

  // 404
  { path: '*', element: <div className="flex min-h-screen items-center justify-center"><h1 className="text-2xl font-bold">Page Not Found</h1></div> },
], {
  future: {
    v7_startTransition: true,
  },
});
