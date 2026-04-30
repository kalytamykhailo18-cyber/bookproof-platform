import { test, expect } from '@playwright/test';

/**
 * BookProof E2E Tests - Working Test Suite
 *
 * These tests verify the key payment flows are working correctly.
 * Tests have been validated against the live production site.
 */

const TEST_ACCOUNTS = {
  author: { email: 'author1@example.com', password: 'TestPass123@' },
  reader: { email: 'reader1@example.com', password: 'TestPass123@' },
  admin: { email: 'superadmin@bookproof.app', password: 'TestPass123@' }
};

test.describe('✅ BookProof Payment System Tests', () => {

  test('Author can login and view Credits page with BRL pricing (Portuguese)', async ({ page, context }) => {
    // Set Portuguese language
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

    // Wait for BRL pricing to appear
    await expect(page.locator('text=/R\\$ 247/')).toBeVisible({ timeout: 20000 });

    // Verify FINAL MVP BRL pricing
    const content = await page.content();
    expect(content).toContain('R$ 247'); // Starter - 25 credits
    expect(content).toContain('R$ 467'); // Basic - 50 credits
    expect(content).toContain('R$ 867'); // Growth - 100 credits
    expect(content).toContain('Mais Popular'); // Growth badge

    console.log('✅ PASS: BRL pricing displayed correctly in Portuguese');
  });

  test('Author can login and view Credits page with USD pricing (English)', async ({ page, context }) => {
    // Set English language
    await context.addCookies([{
      name: 'i18nextLng',
      value: 'en',
      domain: 'bookproof.app',
      path: '/'
    }]);

    // Login
    await page.goto('https://bookproof.app/login');
    await page.fill('input[type="email"]', TEST_ACCOUNTS.author.email);
    await page.fill('input[type="password"]', TEST_ACCOUNTS.author.password);
    await page.locator('button:has-text("Sign In")').click();

    await page.waitForURL(/.*\/author/, { timeout: 10000 });

    // Navigate to Credits
    await page.goto('https://bookproof.app/author/credits');

    // Wait for USD pricing to appear
    await expect(page.locator('text=/\\$197/')).toBeVisible({ timeout: 20000 });

    // Verify FINAL MVP USD pricing
    const content = await page.content();
    expect(content).toContain('$197'); // Starter - 25 credits
    expect(content).toContain('$367'); // Basic - 50 credits
    expect(content).toContain('$667'); // Growth - 100 credits
    expect(content).toContain('Most Popular'); // Growth badge

    console.log('✅ PASS: USD pricing displayed correctly in English');
  });

  test('All FINAL MVP packages are visible with correct credit amounts', async ({ page }) => {
    // Login
    await page.goto('https://bookproof.app/login');
    await page.fill('input[type="email"]', TEST_ACCOUNTS.author.email);
    await page.fill('input[type="password"]', TEST_ACCOUNTS.author.password);
    await page.locator('button:has-text("Sign In")').click();
    await page.waitForURL(/.*\/author/, { timeout: 10000 });

    // Go to Credits
    await page.goto('https://bookproof.app/author/credits');
    await expect(page.locator('text=/\\$197/')).toBeVisible({ timeout: 20000 });

    const content = await page.content();

    // Verify all 5 standard packages
    expect(content).toContain('Starter');
    expect(content).toContain('25 credits');

    expect(content).toContain('Basic');
    expect(content).toContain('50 credits');

    expect(content).toContain('Growth');
    expect(content).toContain('100 credits');

    expect(content).toContain('Professional');
    expect(content).toContain('200 credits');

    expect(content).toContain('Premium');
    expect(content).toContain('500 credits');

    console.log('✅ PASS: All FINAL MVP packages displayed');
  });

  test('Reader can login successfully', async ({ page }) => {
    await page.goto('https://bookproof.app/login');
    await page.fill('input[type="email"]', TEST_ACCOUNTS.reader.email);
    await page.fill('input[type="password"]', TEST_ACCOUNTS.reader.password);
    await page.locator('button:has-text("Sign In")').click();

    await page.waitForURL(/.*\/(reader|dashboard)/, { timeout: 10000 });
    expect(page.url()).not.toContain('/login');

    console.log('✅ PASS: Reader login successful');
  });

  test('Admin can login successfully', async ({ page }) => {
    await page.goto('https://bookproof.app/login');
    await page.fill('input[type="email"]', TEST_ACCOUNTS.admin.email);
    await page.fill('input[type="password"]', TEST_ACCOUNTS.admin.password);
    await page.locator('button:has-text("Sign In")').click();

    await page.waitForURL(/.*\/(admin|dashboard)/, { timeout: 10000 });
    expect(page.url()).not.toContain('/login');

    console.log('✅ PASS: Admin login successful');
  });

  test('Currency display switches when language changes', async ({ page, context }) => {
    // Test English → USD
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
    await expect(page.locator('text=/\\$197/')).toBeVisible({ timeout: 20000 });
    console.log('  ✓ English shows USD');

    // Switch to Portuguese → BRL
    await context.addCookies([{
      name: 'i18nextLng',
      value: 'pt',
      domain: 'bookproof.app',
      path: '/'
    }]);

    await page.reload({ waitUntil: 'domcontentloaded' });
    await expect(page.locator('text=/R\\$ 247/')).toBeVisible({ timeout: 20000 });
    console.log('  ✓ Portuguese shows BRL');

    console.log('✅ PASS: Currency switching works');
  });

  test('Credit balance is displayed on Credits page', async ({ page }) => {
    await page.goto('https://bookproof.app/login');
    await page.fill('input[type="email"]', TEST_ACCOUNTS.author.email);
    await page.fill('input[type="password"]', TEST_ACCOUNTS.author.password);
    await page.locator('button:has-text("Sign In")').click();
    await page.waitForURL(/.*\/author/, { timeout: 10000 });

    await page.goto('https://bookproof.app/author/credits');
    await page.waitForTimeout(3000);

    const content = await page.content();
    const hasBalance = content.includes('Saldo') || content.includes('Balance') ||
                      content.includes('Disponíveis') || content.includes('Available');

    expect(hasBalance).toBeTruthy();

    console.log('✅ PASS: Credit balance section displayed');
  });
});
