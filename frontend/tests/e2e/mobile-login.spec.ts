import { test, expect } from '@playwright/test';

/**
 * Mobile Responsive Test - Login Page
 * Page 2 of mobile refactor
 */

test.describe('Login Page - Mobile Responsive', () => {

  test('Login page displays correctly on mobile (iPhone 12)', async ({ page }) => {
    console.log('\n========== LOGIN PAGE - MOBILE TEST ==========');

    // Set mobile viewport
    await page.setViewportSize({ width: 390, height: 844 });
    console.log('✓ Set viewport to iPhone 12 (390x844)');

    // Navigate to login
    await page.goto('https://bookproof.app/login');
    await page.waitForTimeout(2000);
    console.log('✓ Navigated to login page');

    // Take full page screenshot
    await page.screenshot({ path: 'test-results/mobile-login-full.png', fullPage: true });
    console.log('✓ Full page screenshot saved');

    // Check if logo/branding is visible
    const hasLogo = await page.locator('img[alt="BookProof"]').isVisible().catch(() => false);
    console.log(`Logo visible: ${hasLogo}`);

    // Check if form elements are visible
    const emailInput = page.locator('input[type="email"]');
    const passwordInput = page.locator('input[type="password"]');
    const submitButton = page.locator('button[type="button"]').filter({ hasText: /Sign In|Entrar/ });

    await expect(emailInput).toBeVisible();
    await expect(passwordInput).toBeVisible();
    await expect(submitButton).toBeVisible();
    console.log('✓ All form elements visible');

    // Check for horizontal scroll (bad UX)
    const bodyWidth = await page.evaluate(() => document.body.scrollWidth);
    const windowWidth = await page.evaluate(() => window.innerWidth);
    console.log(`Body width: ${bodyWidth}px, Window width: ${windowWidth}px`);

    if (bodyWidth > windowWidth) {
      console.log('⚠ WARNING: Horizontal scroll detected!');
    } else {
      console.log('✓ No horizontal scroll');
    }

    // Check text readability (font sizes)
    const titleSize = await page.locator('h1').first().evaluate(el =>
      window.getComputedStyle(el).fontSize
    );
    console.log(`Title font size: ${titleSize}`);

    // Check button tap target size
    const buttonHeight = await submitButton.evaluate(el => el.clientHeight);
    console.log(`Button height: ${buttonHeight}px (should be >= 44px for mobile)`);

    // Check padding/spacing
    const cardPadding = await page.locator('.bg-white.rounded-md').first().evaluate(el =>
      window.getComputedStyle(el).padding
    );
    console.log(`Card padding: ${cardPadding}`);

    // Take viewport screenshot (what user sees without scrolling)
    await page.screenshot({ path: 'test-results/mobile-login-viewport.png', fullPage: false });
    console.log('✓ Viewport screenshot saved');

    // Scroll down to see more
    await page.evaluate(() => window.scrollBy(0, 400));
    await page.waitForTimeout(500);
    await page.screenshot({ path: 'test-results/mobile-login-scrolled.png', fullPage: false });
    console.log('✓ Scrolled view screenshot saved');

    console.log('\n========== TEST COMPLETE ==========\n');
  });

  test('Login page works on small Android phone (360x640)', async ({ page }) => {
    console.log('\n========== LOGIN PAGE - SMALL ANDROID ==========');

    // Small Android phone
    await page.setViewportSize({ width: 360, height: 640 });
    console.log('✓ Set viewport to small Android (360x640)');

    await page.goto('https://bookproof.app/login');
    await page.waitForTimeout(2000);

    // Check if everything fits
    const bodyWidth = await page.evaluate(() => document.body.scrollWidth);
    const windowWidth = await page.evaluate(() => window.innerWidth);

    console.log(`Body width: ${bodyWidth}px, Window width: ${windowWidth}px`);

    if (bodyWidth > windowWidth) {
      console.log('⚠ WARNING: Content too wide for small screen!');
    }

    await page.screenshot({ path: 'test-results/mobile-login-android.png', fullPage: true });
    console.log('✓ Screenshot saved');

    // Check if form is usable
    const emailVisible = await page.locator('input[type="email"]').isVisible();
    const submitVisible = await page.locator('button').filter({ hasText: /Sign In|Entrar/ }).first().isVisible();

    console.log(`Email input visible: ${emailVisible}`);
    console.log(`Submit button visible: ${submitVisible}`);

    expect(emailVisible).toBeTruthy();
    expect(submitVisible).toBeTruthy();

    console.log('\n========== TEST COMPLETE ==========\n');
  });

  test('Can login successfully on mobile', async ({ page }) => {
    console.log('\n========== LOGIN FUNCTIONALITY ON MOBILE ==========');

    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('https://bookproof.app/login');
    await page.waitForTimeout(2000);

    // Fill form
    console.log('Filling login form...');
    await page.fill('input[type="email"]', 'author1@example.com');
    await page.fill('input[type="password"]', 'TestPass123@');

    await page.screenshot({ path: 'test-results/mobile-login-filled.png', fullPage: false });
    console.log('✓ Form filled screenshot');

    // Submit
    console.log('Clicking submit button...');
    const submitBtn = page.locator('button[type="button"]').filter({ hasText: /Sign In|Entrar/ }).first();
    await submitBtn.click();

    // Wait for redirect
    await page.waitForURL(/.*\/(author|dashboard)/, { timeout: 10000 });
    console.log('✓ Login successful, redirected to dashboard');

    await page.screenshot({ path: 'test-results/mobile-login-success.png', fullPage: false });

    console.log('\n========== LOGIN WORKS ON MOBILE ==========\n');
  });
});
