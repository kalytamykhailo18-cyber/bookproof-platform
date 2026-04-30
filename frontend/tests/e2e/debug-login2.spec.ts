import { test, expect } from '@playwright/test';

test('Debug author login with button text', async ({ page }) => {
  const author = {
    email: 'author1@example.com',
    password: 'TestPass123@'
  };

  console.log('1. Navigating to login page...');
  await page.goto('https://bookproof.app/login');

  console.log('2. Filling email...');
  await page.fill('input[type="email"]', author.email);

  console.log('3. Filling password...');
  await page.fill('input[type="password"]', author.password);

  console.log('4. Looking for Sign In button...');
  const signInButton = page.locator('button:has-text("Sign In"), button:has-text("Sign in"), button:has-text("Entrar")');
  const buttonVisible = await signInButton.isVisible();
  console.log('Sign In button visible:', buttonVisible);

  console.log('5. Clicking Sign In button...');
  await signInButton.click();

  console.log('6. Waiting for navigation...');
  await page.waitForTimeout(3000);

  console.log('7. After login URL:', page.url());

  // Take screenshot
  await page.screenshot({ path: '/tmp/after-login-2.png' });
  console.log('Screenshot saved');

  // Check for errors
  const errorMsg = await page.locator('text=/error|invalid|incorrect|wrong/i').first().textContent().catch(() => null);
  if (errorMsg) {
    console.log('❌ Error message:', errorMsg);
  } else {
    console.log('✅ No error message');
  }

  // Check current URL
  console.log('8. Final URL:', page.url());

  // Check if we're on dashboard
  if (page.url().includes('dashboard')) {
    console.log('✅ Successfully logged in to dashboard');
  } else {
    console.log('❌ Not on dashboard page');
  }
});
