import { test } from '@playwright/test';

test('identify 404 resource', async ({ page }) => {
  const failedRequests: string[] = [];

  page.on('response', response => {
    if (response.status() === 404) {
      failedRequests.push(response.url());
    }
  });

  await page.goto('http://localhost:3000/login');
  await page.waitForLoadState('networkidle');

  console.log('\n404 Resources:');
  failedRequests.forEach(url => console.log(`  - ${url}`));
});
