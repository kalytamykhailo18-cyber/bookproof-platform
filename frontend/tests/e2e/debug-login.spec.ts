import { test, expect } from '@playwright/test';

test('Debug author login flow', async ({ page }) => {
  const author = {
    email: 'author1@example.com',
    password: 'TestPass123@'
  };

  console.log('1. Navigating to login page...');
  await page.goto('https://bookproof.app/login');

  console.log('2. Current URL:', page.url());

  console.log('3. Filling email...');
  await page.fill('input[type="email"]', author.email);

  console.log('4. Filling password...');
  await page.fill('input[type="password"]', author.password);

  console.log('5. Clicking submit button...');
  await page.click('button[type="submit"]');

  console.log('6. Waiting for navigation...');
  await page.waitForLoadState('networkidle', { timeout: 15000 });

  console.log('7. After login URL:', page.url());

  // Take screenshot to see what's on screen
  await page.screenshot({ path: '/tmp/after-login.png' });
  console.log('Screenshot saved to /tmp/after-login.png');

  // Check if there's an error message
  const errorMsg = await page.locator('text=/error|invalid|incorrect/i').first().textContent().catch(() => null);
  if (errorMsg) {
    console.log('Error message found:', errorMsg);
  } else {
    console.log('No error message found');
  }

  // Wait a bit more to see final URL
  await page.waitForTimeout(2000);
  console.log('8. Final URL:', page.url());
});
