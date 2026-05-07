import { test, expect } from '@playwright/test';

const BASE_URL = 'http://localhost:3000';

// Mobile viewport - iPhone SE
const MOBILE_VIEWPORT = { width: 375, height: 667 };

// Test pages across all user roles
const PAGES_TO_TEST = [
  // Auth pages
  { path: '/login', name: 'Login' },
  { path: '/register', name: 'Register' },
  { path: '/forgot-password', name: 'Forgot Password' },

  // Landing
  { path: '/', name: 'Landing' },

  // Legal
  { path: '/terms', name: 'Terms' },
  { path: '/privacy', name: 'Privacy' },

  // Author pages (requires auth - will check structure)
  { path: '/author/dashboard', name: 'Author Dashboard', requiresAuth: true },
  { path: '/author/campaigns', name: 'Author Campaigns', requiresAuth: true },
  { path: '/author/credits', name: 'Author Credits', requiresAuth: true },
  { path: '/author/profile', name: 'Author Profile', requiresAuth: true },
  { path: '/author/settings', name: 'Author Settings', requiresAuth: true },

  // Reader pages (requires auth)
  { path: '/reader/dashboard', name: 'Reader Dashboard', requiresAuth: true },
  { path: '/reader/assignments', name: 'Reader Assignments', requiresAuth: true },
  { path: '/reader/wallet', name: 'Reader Wallet', requiresAuth: true },
  { path: '/reader/campaigns', name: 'Reader Browse Campaigns', requiresAuth: true },

  // Admin pages (requires auth + admin role)
  { path: '/admin/dashboard', name: 'Admin Dashboard', requiresAuth: true, requiresAdmin: true },
  { path: '/admin/authors', name: 'Admin Authors', requiresAuth: true, requiresAdmin: true },
  { path: '/admin/readers', name: 'Admin Readers', requiresAuth: true, requiresAdmin: true },
];

test.describe('Mobile Responsive - All Pages', () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize(MOBILE_VIEWPORT);
  });

  // Test public pages
  PAGES_TO_TEST.filter(p => !p.requiresAuth).forEach(({ path, name }) => {
    test(`${name} - mobile responsive layout`, async ({ page }) => {
      await page.goto(BASE_URL + path);

      // Wait for page load
      await page.waitForLoadState('networkidle');

      // Check container has mobile padding (px-4)
      const container = page.locator('.container').first();
      if (await container.count() > 0) {
        const paddingLeft = await container.evaluate(el =>
          window.getComputedStyle(el).paddingLeft
        );
        // px-4 = 1rem = 16px
        expect(parseInt(paddingLeft)).toBeGreaterThanOrEqual(12);
      }

      // Check buttons have proper mobile height (h-11 = 44px minimum for touch)
      const buttons = page.locator('button[type="submit"], button[type="button"]');
      if (await buttons.count() > 0) {
        const firstButton = buttons.first();
        const height = await firstButton.evaluate(el =>
          el.getBoundingClientRect().height
        );
        // Should be at least 40px (allowing some variance)
        expect(height).toBeGreaterThanOrEqual(40);
      }

      // Check headings are sized appropriately for mobile
      const h1 = page.locator('h1').first();
      if (await h1.count() > 0) {
        const fontSize = await h1.evaluate(el =>
          window.getComputedStyle(el).fontSize
        );
        const fontSizePx = parseInt(fontSize);
        // text-2xl on mobile = 1.5rem = 24px, should be between 20-30px
        expect(fontSizePx).toBeGreaterThanOrEqual(20);
        expect(fontSizePx).toBeLessThanOrEqual(32);
      }

      // Check page doesn't have horizontal scroll
      const bodyWidth = await page.evaluate(() => document.body.scrollWidth);
      const viewportWidth = MOBILE_VIEWPORT.width;
      expect(bodyWidth).toBeLessThanOrEqual(viewportWidth + 5); // 5px tolerance

      // Take screenshot for visual verification
      await page.screenshot({
        path: `/tmp/mobile-${name.toLowerCase().replace(/\s+/g, '-')}.png`,
        fullPage: true
      });
    });
  });

  // Test that auth pages redirect properly (don't crash)
  PAGES_TO_TEST.filter(p => p.requiresAuth && !p.requiresAdmin).forEach(({ path, name }) => {
    test(`${name} - redirects when not authenticated`, async ({ page }) => {
      await page.goto(BASE_URL + path);
      await page.waitForLoadState('networkidle');

      // Should redirect to login or show some auth UI
      const url = page.url();
      const hasAuthUI = url.includes('/login') ||
                        url.includes('/register') ||
                        await page.locator('text=/sign in|log in/i').count() > 0;

      expect(hasAuthUI).toBeTruthy();
    });
  });
});

test.describe('Mobile Responsive - Grid Stacking', () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize(MOBILE_VIEWPORT);
  });

  test('Landing page - stats cards stack on mobile', async ({ page }) => {
    await page.goto(BASE_URL);
    await page.waitForLoadState('networkidle');

    // Find grid containers
    const grids = page.locator('.grid');
    if (await grids.count() > 0) {
      const firstGrid = grids.first();

      // Check if grid has proper mobile classes
      const className = await firstGrid.getAttribute('class');

      // Should have grid-cols-1 or similar stacking behavior on mobile
      const hasProperStacking = className?.includes('grid-cols-1') ||
                                className?.includes('sm:grid-cols') ||
                                className?.includes('md:grid-cols');

      expect(hasProperStacking).toBeTruthy();
    }
  });
});

test.describe('Mobile Responsive - Touch Targets', () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize(MOBILE_VIEWPORT);
  });

  test('Login page - buttons meet 44px minimum touch target', async ({ page }) => {
    await page.goto(BASE_URL + '/login');
    await page.waitForLoadState('networkidle');

    const submitButton = page.locator('button[type="submit"]').first();
    if (await submitButton.count() > 0) {
      const box = await submitButton.boundingBox();
      expect(box?.height).toBeGreaterThanOrEqual(44);
    }
  });

  test('Register page - all interactive elements are touch-friendly', async ({ page }) => {
    await page.goto(BASE_URL + '/register');
    await page.waitForLoadState('networkidle');

    const interactiveElements = page.locator('button, input, select, textarea, a[role="button"]');
    const count = await interactiveElements.count();

    if (count > 0) {
      // Check first few interactive elements
      for (let i = 0; i < Math.min(count, 5); i++) {
        const element = interactiveElements.nth(i);
        const box = await element.boundingBox();
        if (box) {
          // Min height should be at least 40px (44px is ideal, but inputs might be slightly smaller)
          expect(box.height).toBeGreaterThanOrEqual(38);
        }
      }
    }
  });
});

test.describe('Mobile Responsive - Text Readability', () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize(MOBILE_VIEWPORT);
  });

  test('Landing page - text is readable on mobile', async ({ page }) => {
    await page.goto(BASE_URL);
    await page.waitForLoadState('networkidle');

    const bodyText = page.locator('p, span, div').filter({ hasText: /.+/ }).first();
    if (await bodyText.count() > 0) {
      const fontSize = await bodyText.evaluate(el =>
        window.getComputedStyle(el).fontSize
      );
      const fontSizePx = parseInt(fontSize);

      // Body text should be at least 14px on mobile
      expect(fontSizePx).toBeGreaterThanOrEqual(14);
    }
  });
});

test.describe('Mobile Responsive - No Horizontal Overflow', () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize(MOBILE_VIEWPORT);
  });

  const publicPages = PAGES_TO_TEST.filter(p => !p.requiresAuth);

  publicPages.forEach(({ path, name }) => {
    test(`${name} - no horizontal scroll`, async ({ page }) => {
      await page.goto(BASE_URL + path);
      await page.waitForLoadState('networkidle');

      const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
      const clientWidth = await page.evaluate(() => document.documentElement.clientWidth);

      // Allow 1px tolerance for rounding
      expect(scrollWidth).toBeLessThanOrEqual(clientWidth + 1);
    });
  });
});
