import { test, expect } from '@playwright/test';

test.describe('Landing Page - Mobile Responsive', () => {

  test('Landing page displays correctly on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('https://bookproof.app');
    await page.waitForTimeout(2000);

    await page.screenshot({ path: 'test-results/mobile-landing-hero.png', fullPage: false });

    const bodyWidth = await page.evaluate(() => document.body.scrollWidth);
    const windowWidth = await page.evaluate(() => window.innerWidth);
    console.log(`Body: ${bodyWidth}px, Window: ${windowWidth}px`);
    expect(bodyWidth).toBeLessThanOrEqual(windowWidth + 12);

    const ctaButtons = page.locator('section a[href="/register"]').first();
    await expect(ctaButtons).toBeVisible();

    const buttonHeight = await ctaButtons.evaluate(el => el.clientHeight);
    console.log(`CTA button height: ${buttonHeight}px`);
    expect(buttonHeight).toBeGreaterThanOrEqual(44);
  });

  test('Pricing section displays correctly on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('https://bookproof.app#pricing');
    await page.waitForTimeout(2000);

    await page.evaluate(() => {
      const pricingSection = document.getElementById('pricing');
      if (pricingSection) pricingSection.scrollIntoView();
    });
    await page.waitForTimeout(1000);

    await page.screenshot({ path: 'test-results/mobile-landing-pricing.png', fullPage: false });

    const pricingCards = page.locator('a[href="/register"]');
    const count = await pricingCards.count();
    console.log(`Pricing CTA buttons found: ${count}`);
    expect(count).toBeGreaterThanOrEqual(3);
  });

  test('Enterprise modal works on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('https://bookproof.app#pricing');
    await page.waitForTimeout(2000);

    await page.evaluate(() => {
      const pricingSection = document.getElementById('pricing');
      if (pricingSection) pricingSection.scrollIntoView();
    });
    await page.waitForTimeout(1000);

    const enterpriseButton = page.locator('button').filter({ hasText: /Contact|Fale/ }).first();
    const hasButton = await enterpriseButton.isVisible().catch(() => false);

    if (hasButton) {
      await enterpriseButton.click();
      await page.waitForTimeout(500);

      await page.screenshot({ path: 'test-results/mobile-landing-enterprise-modal.png', fullPage: false });

      const nameInput = page.locator('input[type="text"]').first();
      await expect(nameInput).toBeVisible();

      const inputHeight = await nameInput.evaluate(el => el.clientHeight);
      console.log(`Modal input height: ${inputHeight}px`);
      expect(inputHeight).toBeGreaterThanOrEqual(44);

      const submitButton = page.locator('button[type="submit"]');
      const submitHeight = await submitButton.evaluate(el => el.clientHeight);
      console.log(`Submit button height: ${submitHeight}px`);
      expect(submitHeight).toBeGreaterThanOrEqual(44);
    }
  });

  test('Works on small Android screen', async ({ page }) => {
    await page.setViewportSize({ width: 360, height: 640 });
    await page.goto('https://bookproof.app');
    await page.waitForTimeout(2000);

    const bodyWidth = await page.evaluate(() => document.body.scrollWidth);
    const windowWidth = await page.evaluate(() => window.innerWidth);
    console.log(`Android - Body: ${bodyWidth}px, Window: ${windowWidth}px`);

    await page.screenshot({ path: 'test-results/mobile-landing-android.png', fullPage: false });

    const ctaButton = page.locator('section a[href="/register"]').first();
    await expect(ctaButton).toBeVisible();
  });

  test('Hero CTA buttons are properly sized', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('https://bookproof.app');
    await page.waitForTimeout(2000);

    const primaryCTA = page.locator('section a[href="/register"]').first();
    const secondaryCTA = page.locator('section a[href="#how-it-works"]').first();

    const primaryHeight = await primaryCTA.evaluate(el => el.clientHeight);
    const secondaryHeight = await secondaryCTA.evaluate(el => el.clientHeight);

    console.log(`Primary CTA: ${primaryHeight}px, Secondary CTA: ${secondaryHeight}px`);
    expect(primaryHeight).toBeGreaterThanOrEqual(44);
    expect(secondaryHeight).toBeGreaterThanOrEqual(44);
  });
});
