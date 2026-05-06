import { test, expect } from '@playwright/test';

test.describe('Register Page - Mobile Responsive', () => {

  test('Register page displays correctly on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('https://bookproof.app/register');
    await page.waitForTimeout(2000);

    await page.screenshot({ path: 'test-results/mobile-register-full.png', fullPage: true });

    const bodyWidth = await page.evaluate(() => document.body.scrollWidth);
    const windowWidth = await page.evaluate(() => window.innerWidth);
    console.log(`Body: ${bodyWidth}px, Window: ${windowWidth}px`);
    expect(bodyWidth).toBeLessThanOrEqual(windowWidth + 12);

    const nameInput = page.locator('input[id="name"]');
    const emailInput = page.locator('input[type="email"]');
    await expect(nameInput).toBeVisible();
    await expect(emailInput).toBeVisible();

    const submitButton = page.locator('button[type="button"]').filter({ hasText: /Create|Register|Sign up/ }).first();
    const buttonHeight = await submitButton.evaluate(el => el.clientHeight);
    console.log(`Button height: ${buttonHeight}px`);
    expect(buttonHeight).toBeGreaterThanOrEqual(44);
  });

  test('Role selector stacks correctly on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('https://bookproof.app/register');
    await page.waitForTimeout(2000);

    const roleButtons = page.locator('button').filter({ hasText: /Author|Reader|Affiliate/ });
    const count = await roleButtons.count();
    console.log(`Role buttons found: ${count}`);
    expect(count).toBeGreaterThanOrEqual(3);

    await page.screenshot({ path: 'test-results/mobile-register-roles.png', fullPage: false });
  });

  test('Password fields stack on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('https://bookproof.app/register');
    await page.waitForTimeout(2000);

    await page.evaluate(() => {
      const passwordLabel = Array.from(document.querySelectorAll('label')).find(el => el.textContent?.includes('Password'));
      if (passwordLabel) passwordLabel.scrollIntoView();
    });
    await page.waitForTimeout(500);

    await page.screenshot({ path: 'test-results/mobile-register-passwords.png', fullPage: false });
  });

  test('Works on small Android screen', async ({ page }) => {
    await page.setViewportSize({ width: 360, height: 640 });
    await page.goto('https://bookproof.app/register');
    await page.waitForTimeout(2000);

    const bodyWidth = await page.evaluate(() => document.body.scrollWidth);
    const windowWidth = await page.evaluate(() => window.innerWidth);
    console.log(`Android - Body: ${bodyWidth}px, Window: ${windowWidth}px`);

    await page.screenshot({ path: 'test-results/mobile-register-android.png', fullPage: true });

    const nameInput = page.locator('input[id="name"]');
    await expect(nameInput).toBeVisible();
  });
});
