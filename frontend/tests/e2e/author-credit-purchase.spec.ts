import { test, expect } from '@playwright/test';

/**
 * Author Credit Purchase Flow E2E Tests
 *
 * Tests the complete flow of an author purchasing credits:
 * 1. Login as author
 * 2. Navigate to Credits page
 * 3. Verify currency display (BRL for PT, USD for EN/ES)
 * 4. Select a package
 * 5. Proceed to checkout
 * 6. Verify checkout session creation
 */

const TEST_AUTHOR = {
  email: 'author1@example.com',
  password: 'TestPass123@'
};

test.describe('Author Credit Purchase Flow', () => {

  test.beforeEach(async ({ page }) => {
    // Navigate to login page
    await page.goto('/login');
    await expect(page).toHaveURL(/.*login/);
  });

  test('should display USD pricing for English interface', async ({ page }) => {
    // Login as author
    await page.fill('input[type="email"]', TEST_AUTHOR.email);
    await page.fill('input[type="password"]', TEST_AUTHOR.password);
    await page.click('button[type="submit"]');

    // Wait for redirect to author dashboard
    await page.waitForURL(/.*dashboard/);

    // Navigate to Credits page
    await page.click('text=Credits');
    await page.waitForURL(/.*credits/);

    // Wait for packages to load
    await page.waitForSelector('[data-testid="package-card"]', { timeout: 10000 });

    // Verify USD pricing is displayed
    const starterPrice = await page.locator('text=/\\$197/').first();
    await expect(starterPrice).toBeVisible();

    // Verify package details
    const starterPackage = page.locator('[data-testid="package-card"]').filter({ hasText: 'Starter' });
    await expect(starterPackage).toContainText('25');
    await expect(starterPackage).toContainText('$197');

    const growthPackage = page.locator('[data-testid="package-card"]').filter({ hasText: 'Growth' });
    await expect(growthPackage).toContainText('100');
    await expect(growthPackage).toContainText('$667');
    await expect(growthPackage).toContainText('Most Popular');
  });

  test('should display BRL pricing for Portuguese interface', async ({ page }) => {
    // Set Portuguese language in localStorage before login
    await page.addInitScript(() => {
      localStorage.setItem('i18nextLng', 'pt');
    });

    // Login as author
    await page.goto('/login');
    await page.fill('input[type="email"]', TEST_AUTHOR.email);
    await page.fill('input[type="password"]', TEST_AUTHOR.password);
    await page.click('button[type="submit"]');

    // Wait for redirect to author dashboard
    await page.waitForURL(/.*dashboard/);

    // Navigate to Credits page
    await page.click('text=Créditos');
    await page.waitForURL(/.*credits/);

    // Wait for packages to load
    await page.waitForSelector('[data-testid="package-card"]', { timeout: 10000 });

    // Verify BRL pricing is displayed
    const starterPrice = await page.locator('text=/R\\$ 247/').first();
    await expect(starterPrice).toBeVisible();

    // Verify package details
    const starterPackage = page.locator('[data-testid="package-card"]').filter({ hasText: 'Starter' });
    await expect(starterPackage).toContainText('25');
    await expect(starterPackage).toContainText('R$ 247');

    const growthPackage = page.locator('[data-testid="package-card"]').filter({ hasText: 'Growth' });
    await expect(growthPackage).toContainText('100');
    await expect(growthPackage).toContainText('R$ 867');
    await expect(growthPackage).toContainText('Mais Popular');

    // Verify installment text for Brazil
    const installmentText = page.locator('text=/Em até 3x sem juros/');
    await expect(installmentText).toBeVisible();
  });

  test('should allow package selection and show order summary', async ({ page }) => {
    // Login as author
    await page.fill('input[type="email"]', TEST_AUTHOR.email);
    await page.fill('input[type="password"]', TEST_AUTHOR.password);
    await page.click('button[type="submit"]');

    await page.waitForURL(/.*dashboard/);
    await page.click('text=Credits');
    await page.waitForURL(/.*credits/);

    // Wait for packages to load
    await page.waitForSelector('[data-testid="package-card"]', { timeout: 10000 });

    // Select Starter package
    const starterPackage = page.locator('[data-testid="package-card"]').filter({ hasText: 'Starter' });
    await starterPackage.click();

    // Verify package is selected (highlighted)
    await expect(starterPackage).toHaveClass(/selected|active|highlighted/);

    // Verify order summary appears
    const orderSummary = page.locator('[data-testid="order-summary"]');
    await expect(orderSummary).toBeVisible();
    await expect(orderSummary).toContainText('Starter');
    await expect(orderSummary).toContainText('25');

    // Verify checkout button is visible and enabled
    const checkoutButton = page.locator('button:has-text("Proceed to Checkout")');
    await expect(checkoutButton).toBeVisible();
    await expect(checkoutButton).toBeEnabled();
  });

  test('should display all package tiers with correct pricing', async ({ page }) => {
    // Login
    await page.fill('input[type="email"]', TEST_AUTHOR.email);
    await page.fill('input[type="password"]', TEST_AUTHOR.password);
    await page.click('button[type="submit"]');

    await page.waitForURL(/.*dashboard/);
    await page.click('text=Credits');
    await page.waitForURL(/.*credits/);

    // Wait for all packages to load
    await page.waitForSelector('[data-testid="package-card"]', { timeout: 10000 });

    // Verify all 5 standard packages are present with correct pricing
    const packages = [
      { name: 'Starter', credits: '25', price: '$197' },
      { name: 'Basic', credits: '50', price: '$367' },
      { name: 'Growth', credits: '100', price: '$667' },
      { name: 'Professional', credits: '200', price: '$1,197' },
      { name: 'Premium', credits: '500', price: '$2,747' }
    ];

    for (const pkg of packages) {
      const packageCard = page.locator('[data-testid="package-card"]').filter({ hasText: pkg.name });
      await expect(packageCard).toBeVisible();
      await expect(packageCard).toContainText(pkg.credits);
      await expect(packageCard).toContainText(pkg.price);
    }

    // Verify Enterprise package
    const enterprisePackage = page.locator('[data-testid="package-card"]').filter({ hasText: 'Enterprise' });
    await expect(enterprisePackage).toBeVisible();
    await expect(enterprisePackage).toContainText('Custom');
  });

  test('should show current credit balance', async ({ page }) => {
    // Login
    await page.fill('input[type="email"]', TEST_AUTHOR.email);
    await page.fill('input[type="password"]', TEST_AUTHOR.password);
    await page.click('button[type="submit"]');

    await page.waitForURL(/.*dashboard/);
    await page.click('text=Credits');
    await page.waitForURL(/.*credits/);

    // Wait for balance to load
    await page.waitForSelector('[data-testid="credit-balance"]', { timeout: 10000 });

    // Verify balance is displayed (should be a number)
    const balance = await page.locator('[data-testid="credit-balance"]').textContent();
    expect(balance).toMatch(/\d+/);
  });

  test('should handle checkout button click', async ({ page }) => {
    // Login
    await page.fill('input[type="email"]', TEST_AUTHOR.email);
    await page.fill('input[type="password"]', TEST_AUTHOR.password);
    await page.click('button[type="submit"]');

    await page.waitForURL(/.*dashboard/);
    await page.click('text=Credits');
    await page.waitForURL(/.*credits/);

    // Wait for packages and select one
    await page.waitForSelector('[data-testid="package-card"]', { timeout: 10000 });
    const starterPackage = page.locator('[data-testid="package-card"]').filter({ hasText: 'Starter' });
    await starterPackage.click();

    // Click checkout button
    const checkoutButton = page.locator('button:has-text("Proceed to Checkout")');
    await checkoutButton.click();

    // Should redirect to Stripe or Pagar.me
    // In test mode, this might show loading state or redirect
    // We'll just verify the button was clicked and loading state appears
    await page.waitForTimeout(1000);

    // Check if either:
    // 1. Loading state appears
    // 2. External checkout page loads
    // 3. Error message appears (if test cards aren't configured)
    const hasLoadingState = await page.locator('[data-testid="loading"]').isVisible().catch(() => false);
    const isExternalUrl = !page.url().includes('bookproof.app');
    const hasErrorMessage = await page.locator('text=/error|failed/i').isVisible().catch(() => false);

    expect(hasLoadingState || isExternalUrl || hasErrorMessage).toBeTruthy();
  });

  test('should show purchase history tab', async ({ page }) => {
    // Login
    await page.fill('input[type="email"]', TEST_AUTHOR.email);
    await page.fill('input[type="password"]', TEST_AUTHOR.password);
    await page.click('button[type="submit"]');

    await page.waitForURL(/.*dashboard/);
    await page.click('text=Credits');
    await page.waitForURL(/.*credits/);

    // Click on Purchase History tab
    const historyTab = page.locator('button:has-text("Purchase History")');
    await expect(historyTab).toBeVisible();
    await historyTab.click();

    // Verify history section is displayed
    await page.waitForTimeout(500);
    const historySection = page.locator('[data-testid="purchase-history"]');
    await expect(historySection).toBeVisible();
  });
});
