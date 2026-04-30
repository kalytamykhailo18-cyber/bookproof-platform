import { test, expect } from '@playwright/test';

/**
 * BookProof Payment Flow E2E Tests
 *
 * Comprehensive tests for all payment workflows
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

test.describe('Author Credit Purchase Flow', () => {

  test('should display USD pricing for English interface', async ({ page }) => {
    // Login as author
    await page.goto('https://bookproof.app/login');
    await page.fill('input[type="email"]', TEST_ACCOUNTS.author.email);
    await page.fill('input[type="password"]', TEST_ACCOUNTS.author.password);
    await page.locator('button:has-text("Sign In")').click();

    // Wait for navigation to author area
    await page.waitForURL(/.*\/author/, { timeout: 10000 });

    // Navigate to Credits page
    await page.goto('https://bookproof.app/author/credits');
    await page.waitForLoadState('networkidle');

    // Wait for packages to load (check for any USD price)
    await expect(page.locator('text=/\\$197/')).toBeVisible({ timeout: 15000 });

    // Verify FINAL MVP pricing
    await expect(page.locator('text=/Starter/').and(page.locator('text=/25/'))).toBeVisible();
    await expect(page.locator('text=/Growth/').and(page.locator('text=/100/'))).toBeVisible();
    await expect(page.locator('text=/Professional/').and(page.locator('text=/200/'))).toBeVisible();

    console.log('✅ USD pricing displayed correctly');
  });

  test('should display BRL pricing for Portuguese interface', async ({ page, context }) => {
    // Set Portuguese language cookie
    await context.addCookies([{
      name: 'i18nextLng',
      value: 'pt',
      domain: 'bookproof.app',
      path: '/'
    }]);

    // Login
    await page.goto('https://bookproof.app/login');
    await page.fill('input[type="email"]', TEST_ACCOUNTS.author.email);
    await page.fill('input[type="password"]', TEST_ACCOUNTS.author.password);
    await page.locator('button:has-text("Entrar")').or(page.locator('button:has-text("Sign In")')).first().click();

    await page.waitForURL(/.*\/author/, { timeout: 10000 });

    // Navigate to Credits
    await page.goto('https://bookproof.app/author/credits');
    await page.waitForLoadState('networkidle');

    // Wait for BRL pricing to load
    await expect(page.locator('text=/R\\$ 247/')).toBeVisible({ timeout: 15000 });

    // Verify BRL prices
    const pageContent = await page.content();
    expect(pageContent).toContain('R$ 247'); // Starter
    expect(pageContent).toContain('R$ 867'); // Growth
    expect(pageContent).toContain('R$ 1.597'); // Professional

    console.log('✅ BRL pricing displayed correctly for Portuguese');
  });

  test('should display all FINAL MVP packages with correct pricing', async ({ page }) => {
    // Login
    await page.goto('https://bookproof.app/login');
    await page.fill('input[type="email"]', TEST_ACCOUNTS.author.email);
    await page.fill('input[type="password"]', TEST_ACCOUNTS.author.password);
    await page.locator('button:has-text("Sign In")').click();

    await page.waitForURL(/.*\/author/, { timeout: 10000 });

    // Go to Credits
    await page.goto('https://bookproof.app/author/credits');
    await page.waitForLoadState('networkidle');

    // Wait for packages to load
    await expect(page.locator('text=/\\$197/')).toBeVisible({ timeout: 15000 });

    // Verify all FINAL MVP packages
    const packages = [
      { name: 'Starter', credits: '25', usd: '$197', brl: 'R$ 247' },
      { name: 'Basic', credits: '50', usd: '$367', brl: 'R$ 467' },
      { name: 'Growth', credits: '100', usd: '$667', brl: 'R$ 867' },
      { name: 'Professional', credits: '200', usd: '$1,197', brl: 'R$ 1.597' },
      { name: 'Premium', credits: '500', usd: '$2,747', brl: 'R$ 3.747' }
    ];

    const pageContent = await page.content();

    for (const pkg of packages) {
      expect(pageContent).toContain(pkg.name);
      expect(pageContent).toContain(pkg.credits);
      expect(pageContent).toContain(pkg.usd);
      console.log(`✅ ${pkg.name}: ${pkg.credits} credits, ${pkg.usd} verified`);
    }

    // Verify Growth is marked as Most Popular
    await expect(page.locator('text=/Most Popular|Mais Popular/')).toBeVisible();

    console.log('✅ All FINAL MVP packages displayed correctly');
  });

  test('should allow package selection', async ({ page }) => {
    // Login
    await page.goto('https://bookproof.app/login');
    await page.fill('input[type="email"]', TEST_ACCOUNTS.author.email);
    await page.fill('input[type="password"]', TEST_ACCOUNTS.author.password);
    await page.locator('button:has-text("Sign In")').click();

    await page.waitForURL(/.*\/author/, { timeout: 10000 });

    // Go to Credits
    await page.goto('https://bookproof.app/author/credits');
    await page.waitForLoadState('networkidle');

    // Wait for packages
    await expect(page.locator('text=/\\$197/')).toBeVisible({ timeout: 15000 });

    // Find and click Starter package card
    const starterCard = page.locator('div').filter({ hasText: /^Starter/ }).filter({ hasText: '$197' }).first();
    await starterCard.click();

    // Wait for selection to register
    await page.waitForTimeout(500);

    // Verify "Selected" button appears
    const selectedButton = page.locator('button').filter({ hasText: /Selected|Selecionado/ });
    await expect(selectedButton).toBeVisible();

    console.log('✅ Package selection works');
  });

  test('should display current credit balance', async ({ page }) => {
    // Login
    await page.goto('https://bookproof.app/login');
    await page.fill('input[type="email"]', TEST_ACCOUNTS.author.email);
    await page.fill('input[type="password"]', TEST_ACCOUNTS.author.password);
    await page.locator('button:has-text("Sign In")').click();

    await page.waitForURL(/.*\/author/, { timeout: 10000 });

    // Go to Credits
    await page.goto('https://bookproof.app/author/credits');
    await page.waitForLoadState('networkidle');

    // Wait for page to load
    await page.waitForTimeout(2000);

    // Check for balance display (look for "Current Balance" or similar text)
    const pageContent = await page.content();
    const hasBalance = pageContent.includes('Balance') || pageContent.includes('Saldo') || pageContent.includes('Available');

    expect(hasBalance).toBeTruthy();

    console.log('✅ Credit balance section displayed');
  });
});

test.describe('Reader and Admin Login', () => {

  test('should login as reader successfully', async ({ page }) => {
    await page.goto('https://bookproof.app/login');
    await page.fill('input[type="email"]', TEST_ACCOUNTS.reader.email);
    await page.fill('input[type="password"]', TEST_ACCOUNTS.reader.password);
    await page.locator('button:has-text("Sign In")').click();

    // Wait for navigation (reader might go to /reader)
    await page.waitForURL(/.*\/(reader|dashboard)/, { timeout: 10000 });

    // Verify we're logged in (URL changed from /login)
    expect(page.url()).not.toContain('/login');

    console.log('✅ Reader login successful');
  });

  test('should login as admin successfully', async ({ page }) => {
    await page.goto('https://bookproof.app/login');
    await page.fill('input[type="email"]', TEST_ACCOUNTS.admin.email);
    await page.fill('input[type="password"]', TEST_ACCOUNTS.admin.password);
    await page.locator('button:has-text("Sign In")').click();

    // Wait for navigation (admin might go to /admin)
    await page.waitForURL(/.*\/(admin|dashboard)/, { timeout: 10000 });

    // Verify we're logged in
    expect(page.url()).not.toContain('/login');

    console.log('✅ Admin login successful');
  });
});

test.describe('Currency Localization', () => {

  test('should switch currency based on language setting', async ({ page, context }) => {
    // Test with English (USD)
    await context.clearCookies();
    await context.addCookies([{
      name: 'i18nextLng',
      value: 'en',
      domain: 'bookproof.app',
      path: '/'
    }]);

    await page.goto('https://bookproof.app/login');
    await page.fill('input[type="email"]', TEST_ACCOUNTS.author.email);
    await page.fill('input[type="password"]', TEST_ACCOUNTS.author.password);
    await page.locator('button:has-text("Sign In")').click();
    await page.waitForURL(/.*\/author/, { timeout: 10000 });

    await page.goto('https://bookproof.app/author/credits');
    await page.waitForLoadState('networkidle');

    // Should show USD
    await expect(page.locator('text=/\\$197/')).toBeVisible({ timeout: 15000 });
    console.log('✅ English interface shows USD');

    // Switch to Portuguese
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
    await expect(page.locator('text=/R\\$ 247/')).toBeVisible({ timeout: 15000 });
    console.log('✅ Portuguese interface shows BRL');

    console.log('✅ Currency switching works correctly');
  });
});
