import { test, expect } from '@playwright/test';

test('Can access BookProof homepage', async ({ page }) => {
  console.log('Navigating to https://bookproof.app');
  await page.goto('https://bookproof.app');
  console.log('Page loaded');

  // Just check if page loaded
  await expect(page).toHaveTitle(/.*/);
  console.log('Page title:', await page.title());
});

test('Can access login page', async ({ page }) => {
  console.log('Navigating to https://bookproof.app/login');
  await page.goto('https://bookproof.app/login', { timeout: 30000 });
  console.log('Login page loaded');

  // Check for email input field
  const emailInput = page.locator('input[type="email"]');
  await expect(emailInput).toBeVisible({ timeout: 10000 });
  console.log('Email input found');
});
