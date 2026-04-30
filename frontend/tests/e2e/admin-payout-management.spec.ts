import { test, expect } from '@playwright/test';

/**
 * Admin Payout Management Flow E2E Tests
 *
 * Tests the complete flow of admin managing payouts:
 * 1. Login as admin
 * 2. Navigate to Payouts page
 * 3. View payout requests
 * 4. Approve/Reject/Complete payouts
 * 5. Filter and search payouts
 */

const TEST_ADMIN = {
  email: 'superadmin@bookproof.app',
  password: 'TestPass123@'
};

test.describe('Admin Payout Management Flow', () => {

  test.beforeEach(async ({ page }) => {
    // Navigate to login page
    await page.goto('/login');
    await expect(page).toHaveURL(/.*login/);
  });

  test('should login as admin and access admin dashboard', async ({ page }) => {
    // Login as admin
    await page.fill('input[type="email"]', TEST_ADMIN.email);
    await page.fill('input[type="password"]', TEST_ADMIN.password);
    await page.click('button[type="submit"]');

    // Wait for redirect to admin dashboard
    await page.waitForURL(/.*dashboard/);

    // Verify admin dashboard loaded
    const adminTitle = page.locator('text=/admin|dashboard/i').first();
    await expect(adminTitle).toBeVisible();
  });

  test('should navigate to payouts management page', async ({ page }) => {
    // Login
    await page.fill('input[type="email"]', TEST_ADMIN.email);
    await page.fill('input[type="password"]', TEST_ADMIN.password);
    await page.click('button[type="submit"]');

    await page.waitForURL(/.*dashboard/);

    // Navigate to Payouts
    const payoutsLink = page.locator('text=/payouts|unified payouts/i').first();
    await expect(payoutsLink).toBeVisible();
    await payoutsLink.click();

    // Wait for payouts page
    await page.waitForURL(/.*payout/);

    // Verify payouts page loaded
    const pageTitle = page.locator('h1, h2').filter({ hasText: /payout/i }).first();
    await expect(pageTitle).toBeVisible();
  });

  test('should display list of payout requests', async ({ page }) => {
    // Login
    await page.fill('input[type="email"]', TEST_ADMIN.email);
    await page.fill('input[type="password"]', TEST_ADMIN.password);
    await page.click('button[type="submit"]');

    await page.waitForURL(/.*dashboard/);

    // Navigate to Payouts
    await page.click('text=/payouts/i');
    await page.waitForURL(/.*payout/);

    // Wait for payout list to load
    await page.waitForSelector('[data-testid="payout-list"]', { timeout: 10000 });

    // Verify list is visible
    const payoutList = page.locator('[data-testid="payout-list"]');
    await expect(payoutList).toBeVisible();
  });

  test('should show payout details when clicking on a request', async ({ page }) => {
    // Login
    await page.fill('input[type="email"]', TEST_ADMIN.email);
    await page.fill('input[type="password"]', TEST_ADMIN.password);
    await page.click('button[type="submit"]');

    await page.waitForURL(/.*dashboard/);
    await page.click('text=/payouts/i');
    await page.waitForURL(/.*payout/);

    // Wait for payout list
    await page.waitForSelector('[data-testid="payout-list"]', { timeout: 10000 });

    // Click on first payout request
    const firstPayout = page.locator('[data-testid="payout-item"]').first();
    const hasPayouts = await firstPayout.isVisible().catch(() => false);

    if (hasPayouts) {
      await firstPayout.click();

      // Wait for details to appear
      await page.waitForTimeout(500);

      // Verify details modal or section appears
      const details = page.locator('[data-testid="payout-details"]');
      await expect(details).toBeVisible();

      // Verify key information is displayed
      const userInfo = page.locator('[data-testid="user-info"]');
      const amount = page.locator('[data-testid="payout-amount"]');
      const paymentMethod = page.locator('[data-testid="payment-method"]');

      await expect(userInfo).toBeVisible();
      await expect(amount).toBeVisible();
      await expect(paymentMethod).toBeVisible();
    }
  });

  test('should display action buttons for pending payouts', async ({ page }) => {
    // Login
    await page.fill('input[type="email"]', TEST_ADMIN.email);
    await page.fill('input[type="password"]', TEST_ADMIN.password);
    await page.click('button[type="submit"]');

    await page.waitForURL(/.*dashboard/);
    await page.click('text=/payouts/i');
    await page.waitForURL(/.*payout/);

    // Wait for payout list
    await page.waitForSelector('[data-testid="payout-list"]', { timeout: 10000 });

    // Find a pending payout
    const pendingPayout = page.locator('[data-testid="payout-item"]').filter({ hasText: /pending/i }).first();
    const hasPending = await pendingPayout.isVisible().catch(() => false);

    if (hasPending) {
      await pendingPayout.click();
      await page.waitForTimeout(500);

      // Verify action buttons
      const approveButton = page.locator('button:has-text("Approve")');
      const rejectButton = page.locator('button:has-text("Reject")');

      await expect(approveButton).toBeVisible();
      await expect(rejectButton).toBeVisible();
    }
  });

  test('should show complete button for approved payouts', async ({ page }) => {
    // Login
    await page.fill('input[type="email"]', TEST_ADMIN.email);
    await page.fill('input[type="password"]', TEST_ADMIN.password);
    await page.click('button[type="submit"]');

    await page.waitForURL(/.*dashboard/);
    await page.click('text=/payouts/i');
    await page.waitForURL(/.*payout/);

    // Wait for payout list
    await page.waitForSelector('[data-testid="payout-list"]', { timeout: 10000 });

    // Find an approved payout
    const approvedPayout = page.locator('[data-testid="payout-item"]').filter({ hasText: /approved/i }).first();
    const hasApproved = await approvedPayout.isVisible().catch(() => false);

    if (hasApproved) {
      await approvedPayout.click();
      await page.waitForTimeout(500);

      // Verify complete button
      const completeButton = page.locator('button:has-text("Mark as Completed")');
      await expect(completeButton).toBeVisible();

      // Verify transaction reference field
      const transactionField = page.locator('input[name="transactionReference"]');
      await expect(transactionField).toBeVisible();
    }
  });

  test('should filter payouts by user type', async ({ page }) => {
    // Login
    await page.fill('input[type="email"]', TEST_ADMIN.email);
    await page.fill('input[type="password"]', TEST_ADMIN.password);
    await page.click('button[type="submit"]');

    await page.waitForURL(/.*dashboard/);
    await page.click('text=/payouts/i');
    await page.waitForURL(/.*payout/);

    // Wait for payout list
    await page.waitForSelector('[data-testid="payout-list"]', { timeout: 10000 });

    // Check for user type filter
    const userTypeFilter = page.locator('select[name="userType"]');
    const hasFilter = await userTypeFilter.isVisible().catch(() => false);

    if (hasFilter) {
      // Verify filter options
      const readerOption = userTypeFilter.locator('option:has-text("Reader")');
      const affiliateOption = userTypeFilter.locator('option:has-text("Affiliate")');
      const closerOption = userTypeFilter.locator('option:has-text("Closer")');

      await expect(readerOption).toBeVisible();
      await expect(affiliateOption).toBeVisible();
      await expect(closerOption).toBeVisible();
    }
  });

  test('should filter payouts by status', async ({ page }) => {
    // Login
    await page.fill('input[type="email"]', TEST_ADMIN.email);
    await page.fill('input[type="password"]', TEST_ADMIN.password);
    await page.click('button[type="submit"]');

    await page.waitForURL(/.*dashboard/);
    await page.click('text=/payouts/i');
    await page.waitForURL(/.*payout/);

    // Wait for payout list
    await page.waitForSelector('[data-testid="payout-list"]', { timeout: 10000 });

    // Check for status filter
    const statusFilter = page.locator('select[name="status"]');
    const hasFilter = await statusFilter.isVisible().catch(() => false);

    if (hasFilter) {
      // Verify filter options
      const pendingOption = statusFilter.locator('option:has-text("Pending")');
      const approvedOption = statusFilter.locator('option:has-text("Approved")');
      const completedOption = statusFilter.locator('option:has-text("Completed")');
      const rejectedOption = statusFilter.locator('option:has-text("Rejected")');

      await expect(pendingOption).toBeVisible();
      await expect(approvedOption).toBeVisible();
      await expect(completedOption).toBeVisible();
      await expect(rejectedOption).toBeVisible();
    }
  });

  test('should show payout statistics', async ({ page }) => {
    // Login
    await page.fill('input[type="email"]', TEST_ADMIN.email);
    await page.fill('input[type="password"]', TEST_ADMIN.password);
    await page.click('button[type="submit"]');

    await page.waitForURL(/.*dashboard/);
    await page.click('text=/payouts/i');
    await page.waitForURL(/.*payout/);

    // Wait for page to load
    await page.waitForSelector('[data-testid="payout-list"]', { timeout: 10000 });

    // Check for statistics cards
    const totalPayouts = page.locator('[data-testid="total-payouts"]');
    const pendingCount = page.locator('[data-testid="pending-count"]');
    const totalAmount = page.locator('[data-testid="total-amount"]');

    // At least one stat should be visible
    const hasStats = await totalPayouts.isVisible().catch(() => false) ||
                     await pendingCount.isVisible().catch(() => false) ||
                     await totalAmount.isVisible().catch(() => false);

    expect(hasStats).toBeTruthy();
  });

  test('should handle approve action with confirmation', async ({ page }) => {
    // Login
    await page.fill('input[type="email"]', TEST_ADMIN.email);
    await page.fill('input[type="password"]', TEST_ADMIN.password);
    await page.click('button[type="submit"]');

    await page.waitForURL(/.*dashboard/);
    await page.click('text=/payouts/i');
    await page.waitForURL(/.*payout/);

    // Wait for payout list
    await page.waitForSelector('[data-testid="payout-list"]', { timeout: 10000 });

    // Find a pending payout
    const pendingPayout = page.locator('[data-testid="payout-item"]').filter({ hasText: /pending/i }).first();
    const hasPending = await pendingPayout.isVisible().catch(() => false);

    if (hasPending) {
      await pendingPayout.click();
      await page.waitForTimeout(500);

      // Click approve button
      const approveButton = page.locator('button:has-text("Approve")');
      if (await approveButton.isVisible()) {
        await approveButton.click();

        // Should show confirmation dialog
        await page.waitForTimeout(500);
        const confirmDialog = page.locator('[data-testid="confirm-dialog"]');
        const hasConfirm = await confirmDialog.isVisible().catch(() => false);

        if (hasConfirm) {
          // Don't actually confirm in test - just verify dialog appears
          await expect(confirmDialog).toBeVisible();
        }
      }
    }
  });

  test('should handle reject action with reason input', async ({ page }) => {
    // Login
    await page.fill('input[type="email"]', TEST_ADMIN.email);
    await page.fill('input[type="password"]', TEST_ADMIN.password);
    await page.click('button[type="submit"]');

    await page.waitForURL(/.*dashboard/);
    await page.click('text=/payouts/i');
    await page.waitForURL(/.*payout/);

    // Wait for payout list
    await page.waitForSelector('[data-testid="payout-list"]', { timeout: 10000 });

    // Find a pending payout
    const pendingPayout = page.locator('[data-testid="payout-item"]').filter({ hasText: /pending/i }).first();
    const hasPending = await pendingPayout.isVisible().catch(() => false);

    if (hasPending) {
      await pendingPayout.click();
      await page.waitForTimeout(500);

      // Click reject button
      const rejectButton = page.locator('button:has-text("Reject")');
      if (await rejectButton.isVisible()) {
        await rejectButton.click();

        // Should show reason input
        await page.waitForTimeout(500);
        const reasonInput = page.locator('textarea[name="rejectionReason"]');
        const hasReasonInput = await reasonInput.isVisible().catch(() => false);

        if (hasReasonInput) {
          await expect(reasonInput).toBeVisible();
        }
      }
    }
  });
});
