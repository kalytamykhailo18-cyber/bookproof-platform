import { test, expect } from '@playwright/test';

/**
 * Reader Payout Request Flow E2E Tests
 *
 * Tests the complete flow of a reader requesting a payout:
 * 1. Login as reader
 * 2. Navigate to Wallet page
 * 3. Check balance
 * 4. Request payout
 * 5. Fill payout form
 * 6. Track payout status
 */

const TEST_READER = {
  email: 'reader1@example.com',
  password: 'TestPass123@'
};

test.describe('Reader Payout Request Flow', () => {

  test.beforeEach(async ({ page }) => {
    // Navigate to login page
    await page.goto('/login');
    await expect(page).toHaveURL(/.*login/);
  });

  test('should display wallet with balance information', async ({ page }) => {
    // Login as reader
    await page.fill('input[type="email"]', TEST_READER.email);
    await page.fill('input[type="password"]', TEST_READER.password);
    await page.click('button[type="submit"]');

    // Wait for redirect to reader dashboard
    await page.waitForURL(/.*dashboard/);

    // Navigate to Wallet page
    await page.click('text=Wallet');
    await page.waitForURL(/.*wallet/);

    // Verify wallet page loaded
    await page.waitForSelector('[data-testid="wallet-balance"]', { timeout: 10000 });

    // Verify balance components are visible
    const totalBalance = page.locator('[data-testid="total-balance"]');
    await expect(totalBalance).toBeVisible();

    const availableBalance = page.locator('[data-testid="available-balance"]');
    await expect(availableBalance).toBeVisible();

    const pendingBalance = page.locator('[data-testid="pending-balance"]');
    await expect(pendingBalance).toBeVisible();
  });

  test('should show request payout button', async ({ page }) => {
    // Login
    await page.fill('input[type="email"]', TEST_READER.email);
    await page.fill('input[type="password"]', TEST_READER.password);
    await page.click('button[type="submit"]');

    await page.waitForURL(/.*dashboard/);
    await page.click('text=Wallet');
    await page.waitForURL(/.*wallet/);

    // Wait for wallet to load
    await page.waitForSelector('[data-testid="wallet-balance"]', { timeout: 10000 });

    // Check for payout request button
    const payoutButton = page.locator('button:has-text("Request Payout")');
    await expect(payoutButton).toBeVisible();
  });

  test('should display payout request form with all payment methods', async ({ page }) => {
    // Login
    await page.fill('input[type="email"]', TEST_READER.email);
    await page.fill('input[type="password"]', TEST_READER.password);
    await page.click('button[type="submit"]');

    await page.waitForURL(/.*dashboard/);
    await page.click('text=Wallet');
    await page.waitForURL(/.*wallet/);

    // Click Request Payout button
    await page.waitForSelector('button:has-text("Request Payout")', { timeout: 10000 });
    await page.click('button:has-text("Request Payout")');

    // Wait for form to appear
    await page.waitForSelector('[data-testid="payout-form"]', { timeout: 5000 });

    // Verify form fields
    const amountField = page.locator('input[name="amount"]');
    await expect(amountField).toBeVisible();

    const paymentMethodSelect = page.locator('select[name="paymentMethod"]');
    await expect(paymentMethodSelect).toBeVisible();

    // Verify all payment methods are available
    const paymentMethods = ['PayPal', 'Bank Transfer', 'Wise', 'Cryptocurrency'];
    for (const method of paymentMethods) {
      const option = paymentMethodSelect.locator(`option:has-text("${method}")`);
      await expect(option).toBeVisible();
    }

    const paymentDetailsField = page.locator('[name="paymentDetails"]');
    await expect(paymentDetailsField).toBeVisible();
  });

  test('should validate minimum payout amount', async ({ page }) => {
    // Login
    await page.fill('input[type="email"]', TEST_READER.email);
    await page.fill('input[type="password"]', TEST_READER.password);
    await page.click('button[type="submit"]');

    await page.waitForURL(/.*dashboard/);
    await page.click('text=Wallet');
    await page.waitForURL(/.*wallet/);

    // Click Request Payout
    await page.waitForSelector('button:has-text("Request Payout")', { timeout: 10000 });
    await page.click('button:has-text("Request Payout")');

    // Wait for form
    await page.waitForSelector('[data-testid="payout-form"]', { timeout: 5000 });

    // Try to submit with amount less than $50
    await page.fill('input[name="amount"]', '25');
    await page.selectOption('select[name="paymentMethod"]', 'PayPal');
    await page.fill('[name="paymentDetails"]', 'test@paypal.com');

    // Submit form
    await page.click('button[type="submit"]');

    // Should show validation error
    await page.waitForTimeout(500);
    const errorMessage = page.locator('text=/minimum.*50/i');
    await expect(errorMessage).toBeVisible();
  });

  test('should successfully submit payout request', async ({ page }) => {
    // Login
    await page.fill('input[type="email"]', TEST_READER.email);
    await page.fill('input[type="password"]', TEST_READER.password);
    await page.click('button[type="submit"]');

    await page.waitForURL(/.*dashboard/);
    await page.click('text=Wallet');
    await page.waitForURL(/.*wallet/);

    // Click Request Payout
    await page.waitForSelector('button:has-text("Request Payout")', { timeout: 10000 });
    await page.click('button:has-text("Request Payout")');

    // Wait for form
    await page.waitForSelector('[data-testid="payout-form"]', { timeout: 5000 });

    // Fill form with valid data
    await page.fill('input[name="amount"]', '50');
    await page.selectOption('select[name="paymentMethod"]', 'PayPal');
    await page.fill('[name="paymentDetails"]', 'reader1@paypal.com');
    await page.fill('[name="notes"]', 'Test payout request');

    // Submit form
    await page.click('button[type="submit"]');

    // Wait for success message or redirect
    await page.waitForTimeout(1000);

    // Should show either:
    // 1. Success message
    // 2. Payout appears in history
    const successMessage = page.locator('text=/success|submitted|pending/i');
    const hasSuccess = await successMessage.isVisible().catch(() => false);

    expect(hasSuccess).toBeTruthy();
  });

  test('should display payout history', async ({ page }) => {
    // Login
    await page.fill('input[type="email"]', TEST_READER.email);
    await page.fill('input[type="password"]', TEST_READER.password);
    await page.click('button[type="submit"]');

    await page.waitForURL(/.*dashboard/);
    await page.click('text=Wallet');
    await page.waitForURL(/.*wallet/);

    // Wait for wallet to load
    await page.waitForSelector('[data-testid="wallet-balance"]', { timeout: 10000 });

    // Click on Payout History tab
    const historyTab = page.locator('button:has-text("Payout History")');
    await expect(historyTab).toBeVisible();
    await historyTab.click();

    // Verify history section is displayed
    await page.waitForTimeout(500);
    const historySection = page.locator('[data-testid="payout-history"]');
    await expect(historySection).toBeVisible();
  });

  test('should show payout status badges', async ({ page }) => {
    // Login
    await page.fill('input[type="email"]', TEST_READER.email);
    await page.fill('input[type="password"]', TEST_READER.password);
    await page.click('button[type="submit"]');

    await page.waitForURL(/.*dashboard/);
    await page.click('text=Wallet');
    await page.waitForURL(/.*wallet/);

    // Navigate to history
    await page.waitForSelector('[data-testid="wallet-balance"]', { timeout: 10000 });
    const historyTab = page.locator('button:has-text("Payout History")');
    await historyTab.click();

    await page.waitForTimeout(500);

    // Check if any payout exists and verify status badge
    const payoutItems = page.locator('[data-testid="payout-item"]');
    const count = await payoutItems.count();

    if (count > 0) {
      const firstPayout = payoutItems.first();
      const statusBadge = firstPayout.locator('[data-testid="status-badge"]');
      await expect(statusBadge).toBeVisible();

      // Status should be one of: Pending, Approved, Completed, Rejected
      const statusText = await statusBadge.textContent();
      expect(['Pending', 'Approved', 'Completed', 'Rejected']).toContain(statusText?.trim());
    }
  });

  test('should show earnings breakdown', async ({ page }) => {
    // Login
    await page.fill('input[type="email"]', TEST_READER.email);
    await page.fill('input[type="password"]', TEST_READER.password);
    await page.click('button[type="submit"]');

    await page.waitForURL(/.*dashboard/);
    await page.click('text=Wallet');
    await page.waitForURL(/.*wallet/);

    // Wait for wallet to load
    await page.waitForSelector('[data-testid="wallet-balance"]', { timeout: 10000 });

    // Check for earnings breakdown
    const ebookEarnings = page.locator('text=/ebook.*review/i');
    const audiobookEarnings = page.locator('text=/audiobook.*review/i');

    // At least one type of earnings should be visible
    const hasEbookEarnings = await ebookEarnings.isVisible().catch(() => false);
    const hasAudiobookEarnings = await audiobookEarnings.isVisible().catch(() => false);

    expect(hasEbookEarnings || hasAudiobookEarnings).toBeTruthy();
  });
});
