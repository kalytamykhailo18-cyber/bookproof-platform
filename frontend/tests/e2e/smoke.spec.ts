import { test, expect } from '@playwright/test';

/**
 * Smoke Tests for BookProof Payment Flows
 *
 * These tests verify basic functionality without requiring data-testid attributes.
 * They use actual text content and page structure to validate flows.
 */

const TEST_ACCOUNTS = {
  author: {
    email: 'author1@example.com',
    password: 'TestPass123@'
  },
  reader: {
    email: 'reader1@example.com',
    password: 'TestPass123@'
  },
  admin: {
    email: 'superadmin@bookproof.app',
    password: 'TestPass123@'
  }
};

test.describe('BookProof Payment Flows - Smoke Tests', () => {

  test('Author can login and view credits page with USD pricing', async ({ page }) => {
    // Go to login
    await page.goto('/login');

    // Login as author
    await page.fill('input[type="email"]', TEST_ACCOUNTS.author.email);
    await page.fill('input[type="password"]', TEST_ACCOUNTS.author.password);
    await page.click('button[type="submit"]');

    // Wait for navigation to dashboard
    await page.waitForURL(/dashboard/, { timeout: 10000 });

    // Navigate to Credits page
    await page.goto('/author/credits');
    await page.waitForLoadState('networkidle');

    // Wait for packages to load (check for any price)
    await expect(page.locator('text=/\\$[0-9,]+/')).toBeVisible({ timeout: 10000 });

    // Verify FINAL MVP pricing - Starter package
    const starterCard = page.locator('.container').filter({ hasText: 'Starter' }).first();
    await expect(starterCard).toContainText('$197');
    await expect(starterCard).toContainText('25');

    // Verify Growth package is marked as Most Popular
    const growthCard = page.locator('.container').filter({ hasText: 'Growth' }).first();
    await expect(growthCard).toContainText('$667');
    await expect(growthCard).toContainText('100');
    await expect(growthCard).toContainText(/Most Popular|Mais Popular/);

    // Verify Professional package
    const professionalCard = page.locator('.container').filter({ hasText: 'Professional' }).first();
    await expect(professionalCard).toContainText('$1,197');
    await expect(professionalCard).toContainText('200');

    console.log('✅ Author can view credits page with correct USD pricing');
  });

  test('Author can view credits page with BRL pricing in Portuguese', async ({ page, context }) => {
    // Set Portuguese language
    await context.addCookies([{
      name: 'i18nextLng',
      value: 'pt',
      domain: 'bookproof.app',
      path: '/'
    }]);

    // Go to login
    await page.goto('/login');

    // Login as author
    await page.fill('input[type="email"]', TEST_ACCOUNTS.author.email);
    await page.fill('input[type="password"]', TEST_ACCOUNTS.author.password);
    await page.click('button[type="submit"]');

    // Wait for navigation
    await page.waitForURL(/dashboard/, { timeout: 10000 });

    // Navigate to Credits page
    await page.goto('/author/credits');
    await page.waitForLoadState('networkidle');

    // Wait for packages to load (check for R$ symbol)
    await expect(page.locator('text=/R\\$ [0-9,.]+/')).toBeVisible({ timeout: 10000 });

    // Verify BRL pricing - Starter package
    const starterCard = page.locator('.container').filter({ hasText: 'Starter' }).first();
    await expect(starterCard).toContainText('R$ 247');
    await expect(starterCard).toContainText('25');

    // Verify Growth package with BRL
    const growthCard = page.locator('.container').filter({ hasText: 'Growth' }).first();
    await expect(growthCard).toContainText('R$ 867');
    await expect(growthCard).toContainText('100');

    // Verify installment text appears for Brazil
    await expect(page.locator('text=/Em até.*sem juros/i')).toBeVisible();

    console.log('✅ Author can view credits page with correct BRL pricing in Portuguese');
  });

  test('Author can select a package', async ({ page }) => {
    // Login
    await page.goto('/login');
    await page.fill('input[type="email"]', TEST_ACCOUNTS.author.email);
    await page.fill('input[type="password"]', TEST_ACCOUNTS.author.password);
    await page.click('button[type="submit"]');

    await page.waitForURL(/dashboard/, { timeout: 10000 });

    // Go to credits page
    await page.goto('/author/credits');
    await page.waitForLoadState('networkidle');

    // Wait for packages to load
    await page.waitForSelector('text=/\\$[0-9,]+/', { timeout: 10000 });

    // Click on Starter package card
    const starterCard = page.locator('.container').filter({ hasText: 'Starter' }).filter({ hasText: '$197' }).first();
    await starterCard.click();

    // Wait a moment for the selection to register
    await page.waitForTimeout(500);

    // Verify the card shows as selected (check for "selected" text or styling)
    const selectedButton = starterCard.locator('button').filter({ hasText: /Selected|Selecionado/ });
    await expect(selectedButton).toBeVisible();

    console.log('✅ Author can select a package');
  });

  test('All FINAL MVP packages are displayed with correct pricing', async ({ page }) => {
    // Login
    await page.goto('/login');
    await page.fill('input[type="email"]', TEST_ACCOUNTS.author.email);
    await page.fill('input[type="password"]', TEST_ACCOUNTS.author.password);
    await page.click('button[type="submit"]');

    await page.waitForURL(/dashboard/, { timeout: 10000 });

    // Go to credits page
    await page.goto('/author/credits');
    await page.waitForLoadState('networkidle');

    // Wait for packages to load
    await page.waitForSelector('text=/\\$[0-9,]+/', { timeout: 10000 });

    // Verify all FINAL MVP packages exist with correct pricing
    const packages = [
      { name: 'Starter', credits: '25', price: '$197' },
      { name: 'Basic', credits: '50', price: '$367' },
      { name: 'Growth', credits: '100', price: '$667' },
      { name: 'Professional', credits: '200', price: '$1,197' },
      { name: 'Premium', credits: '500', price: '$2,747' }
    ];

    for (const pkg of packages) {
      const card = page.locator('.container').filter({ hasText: pkg.name }).filter({ hasText: pkg.price });
      await expect(card).toBeVisible();
      await expect(card).toContainText(pkg.credits);
      console.log(`✅ ${pkg.name}: ${pkg.credits} credits, ${pkg.price} verified`);
    }

    // Verify Enterprise package
    await expect(page.locator('text=/Enterprise|Empresa/i')).toBeVisible();
    await expect(page.locator('text=/Custom|Personalizado/i')).toBeVisible();

    console.log('✅ All FINAL MVP packages displayed correctly');
  });

  test('Reader can login and access dashboard', async ({ page }) => {
    // Go to login
    await page.goto('/login');

    // Login as reader
    await page.fill('input[type="email"]', TEST_ACCOUNTS.reader.email);
    await page.fill('input[type="password"]', TEST_ACCOUNTS.reader.password);
    await page.click('button[type="submit"]');

    // Wait for navigation to reader dashboard
    await page.waitForURL(/dashboard/, { timeout: 10000 });

    // Verify reader dashboard loaded
    await expect(page).toHaveURL(/dashboard/);

    console.log('✅ Reader can login and access dashboard');
  });

  test('Admin can login and access admin dashboard', async ({ page }) => {
    // Go to login
    await page.goto('/login');

    // Login as admin
    await page.fill('input[type="email"]', TEST_ACCOUNTS.admin.email);
    await page.fill('input[type="password"]', TEST_ACCOUNTS.admin.password);
    await page.click('button[type="submit"]');

    // Wait for navigation to admin dashboard
    await page.waitForURL(/dashboard/, { timeout: 10000 });

    // Verify admin dashboard loaded
    await expect(page).toHaveURL(/dashboard/);

    console.log('✅ Admin can login and access dashboard');
  });

  test('Currency display changes based on language setting', async ({ page, context }) => {
    // Test 1: English should show USD
    await context.clearCookies();
    await context.addCookies([{
      name: 'i18nextLng',
      value: 'en',
      domain: 'bookproof.app',
      path: '/'
    }]);

    await page.goto('/login');
    await page.fill('input[type="email"]', TEST_ACCOUNTS.author.email);
    await page.fill('input[type="password"]', TEST_ACCOUNTS.author.password);
    await page.click('button[type="submit"]');
    await page.waitForURL(/dashboard/, { timeout: 10000 });

    await page.goto('/author/credits');
    await page.waitForLoadState('networkidle');

    // Should show USD
    await expect(page.locator('text=/\\$[0-9,]+/')).toBeVisible({ timeout: 10000 });
    await expect(page.locator('text=/\\$197/')).toBeVisible();
    console.log('✅ English language shows USD pricing');

    // Test 2: Change to Portuguese should show BRL
    await context.clearCookies();
    await context.addCookies([{
      name: 'i18nextLng',
      value: 'pt',
      domain: 'bookproof.app',
      path: '/'
    }]);

    await page.reload();
    await page.waitForLoadState('networkidle');

    // Should show BRL
    await expect(page.locator('text=/R\\$ [0-9,.]+/')).toBeVisible({ timeout: 10000 });
    await expect(page.locator('text=/R\\$ 247/')).toBeVisible();
    console.log('✅ Portuguese language shows BRL pricing');
  });
});
