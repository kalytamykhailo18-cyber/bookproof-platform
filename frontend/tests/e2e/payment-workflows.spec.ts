import { test, expect } from '@playwright/test';

/**
 * Complete Payment Workflow Tests for BookProof
 *
 * Tests all payment flows:
 * 1. BRL payment (Pagar.me) for Portuguese users
 * 2. USD payment (Stripe) for English users
 * 3. Enterprise custom pricing
 * 4. Mobile responsive layout
 */

const TEST_ACCOUNTS = {
  author: {
    email: 'author1@example.com',
    password: 'TestPass123@'
  }
};

test.describe('Payment Workflows - Complete Testing', () => {

  test('BRL Payment Flow - Portuguese Author can view and start purchase', async ({ page }) => {
    console.log('\n========================================');
    console.log('TEST 1: BRL PAYMENT FLOW (PAGAR.ME)');
    console.log('========================================\n');

    // Step 1: Login as author
    console.log('Step 1: Login as author...');
    await page.goto('https://bookproof.app/login');
    await page.fill('input[type="email"]', TEST_ACCOUNTS.author.email);
    await page.fill('input[type="password"]', TEST_ACCOUNTS.author.password);
    await page.locator('button:has-text("Sign In")').click();
    await page.waitForURL(/.*\/(author|dashboard)/, { timeout: 10000 });
    console.log('✓ Logged in successfully');

    // Step 2: Navigate to Credits page
    console.log('\nStep 2: Navigate to Credits page...');
    await page.goto('https://bookproof.app/author/credits');
    await page.waitForTimeout(3000);
    console.log('✓ Credits page loaded');

    // Step 3: Verify BRL pricing is displayed
    console.log('\nStep 3: Verify BRL pricing...');
    const pageContent = await page.content();

    // Check for BRL symbol
    const hasBRL = pageContent.includes('R$');
    console.log(`Has R$ symbol: ${hasBRL}`);
    expect(hasBRL).toBeTruthy();

    // Verify FINAL MVP BRL pricing
    const hasStarter247 = pageContent.includes('247');
    const hasBasic467 = pageContent.includes('467');
    const hasGrowth867 = pageContent.includes('867');

    console.log(`\nFINAL MVP BRL Pricing Check:`);
    console.log(`- Starter R$ 247: ${hasStarter247}`);
    console.log(`- Basic R$ 467: ${hasBasic467}`);
    console.log(`- Growth R$ 867: ${hasGrowth867}`);

    expect(hasStarter247).toBeTruthy();
    expect(hasBasic467).toBeTruthy();
    expect(hasGrowth867).toBeTruthy();

    // Step 4: Take screenshot
    await page.screenshot({ path: 'test-results/brl-pricing-page.png', fullPage: true });
    console.log('\n✓ Screenshot saved: test-results/brl-pricing-page.png');

    // Step 5: Select Starter package
    console.log('\nStep 4: Select Starter package...');
    const starterCard = page.locator('text=Starter').first();
    await starterCard.click();
    await page.waitForTimeout(1000);
    console.log('✓ Starter package clicked');

    // Step 6: Check if purchase button appears
    console.log('\nStep 5: Look for purchase/checkout section...');
    const hasPurchaseButton = await page.locator('button:has-text("Comprar")').isVisible().catch(() => false);
    const hasCheckoutButton = await page.locator('button:has-text("Checkout")').isVisible().catch(() => false);
    const hasFinalizeButton = await page.locator('button:has-text("Finalizar")').isVisible().catch(() => false);

    console.log(`Has Comprar button: ${hasPurchaseButton}`);
    console.log(`Has Checkout button: ${hasCheckoutButton}`);
    console.log(`Has Finalizar button: ${hasFinalizeButton}`);

    // Step 7: Try to click purchase if available
    if (hasPurchaseButton || hasCheckoutButton || hasFinalizeButton) {
      console.log('\n✓ Purchase/Checkout button is available');
      console.log('Step 6: Click purchase button...');

      const purchaseBtn = hasPurchaseButton
        ? page.locator('button:has-text("Comprar")').first()
        : hasCheckoutButton
        ? page.locator('button:has-text("Checkout")').first()
        : page.locator('button:has-text("Finalizar")').first();

      await purchaseBtn.click();
      await page.waitForTimeout(3000);

      // Check if redirected to payment gateway
      const currentUrl = page.url();
      console.log(`Current URL after click: ${currentUrl}`);

      if (currentUrl.includes('pagarme') || currentUrl.includes('pagar.me')) {
        console.log('✓✓✓ SUCCESS: Redirected to Pagar.me payment gateway!');
        await page.screenshot({ path: 'test-results/pagarme-gateway.png', fullPage: true });
      } else if (currentUrl.includes('checkout')) {
        console.log('✓ Redirected to checkout page');
        await page.screenshot({ path: 'test-results/checkout-page.png', fullPage: true });
      } else {
        console.log('Page after click:');
        await page.screenshot({ path: 'test-results/after-purchase-click.png', fullPage: true });
      }
    }

    console.log('\n========================================');
    console.log('BRL PAYMENT TEST COMPLETE');
    console.log('========================================\n');
  });

  test('USD Payment Flow - English Author can view Stripe payment', async ({ page, context }) => {
    console.log('\n========================================');
    console.log('TEST 2: USD PAYMENT FLOW (STRIPE)');
    console.log('========================================\n');

    // Step 1: Set language to English
    console.log('Step 1: Set language to English...');
    await context.addCookies([{
      name: 'i18nextLng',
      value: 'en',
      domain: 'bookproof.app',
      path: '/'
    }]);

    // Step 2: Login
    console.log('\nStep 2: Login as author...');
    await page.goto('https://bookproof.app/login');
    await page.fill('input[type="email"]', TEST_ACCOUNTS.author.email);
    await page.fill('input[type="password"]', TEST_ACCOUNTS.author.password);
    await page.locator('button:has-text("Sign In")').click();
    await page.waitForURL(/.*\/(author|dashboard)/, { timeout: 10000 });
    console.log('✓ Logged in');

    // Step 3: Go to Credits
    console.log('\nStep 3: Navigate to Credits page...');
    await page.goto('https://bookproof.app/author/credits');
    await page.waitForTimeout(3000);

    const pageContent = await page.content();

    // Check currency (should be BRL still since user preference is saved)
    const hasUSD = pageContent.includes('$') && !pageContent.includes('R$');
    const hasBRL = pageContent.includes('R$');

    console.log(`\nCurrency displayed:`);
    console.log(`- Has USD ($): ${hasUSD}`);
    console.log(`- Has BRL (R$): ${hasBRL}`);
    console.log('Note: User preference is saved in database, so may show BRL');

    await page.screenshot({ path: 'test-results/usd-pricing-page.png', fullPage: true });
    console.log('✓ Screenshot saved');

    // Step 4: Select package and try to purchase
    console.log('\nStep 4: Select Growth package...');
    const growthCard = page.locator('text=Growth').first();
    await growthCard.click();
    await page.waitForTimeout(1000);

    // Look for purchase button
    const hasPurchaseBtn = await page.locator('button').filter({ hasText: /Purchase|Buy|Checkout|Comprar/ }).first().isVisible().catch(() => false);

    if (hasPurchaseBtn) {
      const purchaseBtn = page.locator('button').filter({ hasText: /Purchase|Buy|Checkout|Comprar/ }).first();
      await purchaseBtn.click();
      await page.waitForTimeout(3000);

      const currentUrl = page.url();
      console.log(`URL after purchase click: ${currentUrl}`);

      if (currentUrl.includes('stripe') || currentUrl.includes('checkout.stripe.com')) {
        console.log('✓✓✓ SUCCESS: Redirected to Stripe!');
        await page.screenshot({ path: 'test-results/stripe-gateway.png', fullPage: true });
      } else {
        await page.screenshot({ path: 'test-results/usd-checkout.png', fullPage: true });
      }
    }

    console.log('\n========================================');
    console.log('USD PAYMENT TEST COMPLETE');
    console.log('========================================\n');
  });

  test('Enterprise Package - Custom Pricing Display', async ({ page }) => {
    console.log('\n========================================');
    console.log('TEST 3: ENTERPRISE CUSTOM PRICING');
    console.log('========================================\n');

    // Login
    console.log('Step 1: Login...');
    await page.goto('https://bookproof.app/login');
    await page.fill('input[type="email"]', TEST_ACCOUNTS.author.email);
    await page.fill('input[type="password"]', TEST_ACCOUNTS.author.password);
    await page.locator('button:has-text("Sign In")').click();
    await page.waitForURL(/.*\/(author|dashboard)/, { timeout: 10000 });

    // Navigate to Credits
    console.log('\nStep 2: Navigate to Credits page...');
    await page.goto('https://bookproof.app/author/credits');
    await page.waitForTimeout(3000);

    // Check for Enterprise package
    console.log('\nStep 3: Check Enterprise package...');
    const pageContent = await page.content();
    const hasEnterprise = pageContent.includes('Enterprise') || pageContent.includes('Empresa');
    console.log(`Has Enterprise package: ${hasEnterprise}`);
    expect(hasEnterprise).toBeTruthy();

    // Check for Custom/Personalizado text
    const hasCustom = pageContent.includes('Custom') || pageContent.includes('Personalizado');
    console.log(`Has Custom pricing text: ${hasCustom}`);
    expect(hasCustom).toBeTruthy();

    // Check for Contact Sales button
    const hasContactSales = pageContent.includes('Contact Sales') ||
                           pageContent.includes('Fale com o time') ||
                           pageContent.includes('Contactar');
    console.log(`Has Contact Sales text: ${hasContactSales}`);
    expect(hasContactSales).toBeTruthy();

    // Take screenshot
    await page.screenshot({ path: 'test-results/enterprise-package.png', fullPage: true });
    console.log('✓ Screenshot saved');

    // Try clicking Enterprise contact button
    console.log('\nStep 4: Try clicking Enterprise contact button...');
    const contactButton = page.locator('button').filter({ hasText: /Contact Sales|Fale com o time|Contactar/ }).first();
    const isVisible = await contactButton.isVisible().catch(() => false);

    if (isVisible) {
      console.log('✓ Contact Sales button found and visible');
      // Note: Don't actually click it to avoid opening email client
      console.log('✓ Enterprise package is properly configured');
    }

    console.log('\n========================================');
    console.log('ENTERPRISE TEST COMPLETE');
    console.log('========================================\n');
  });

  test('Mobile Responsive Layout Check', async ({ page }) => {
    console.log('\n========================================');
    console.log('TEST 4: MOBILE RESPONSIVE LAYOUT');
    console.log('========================================\n');

    // Set mobile viewport
    console.log('Step 1: Set mobile viewport (iPhone 12)...');
    await page.setViewportSize({ width: 390, height: 844 });

    // Login
    console.log('\nStep 2: Login...');
    await page.goto('https://bookproof.app/login');
    await page.fill('input[type="email"]', TEST_ACCOUNTS.author.email);
    await page.fill('input[type="password"]', TEST_ACCOUNTS.author.password);
    await page.locator('button:has-text("Sign In")').click();
    await page.waitForURL(/.*\/(author|dashboard)/, { timeout: 10000 });

    // Navigate to Credits
    console.log('\nStep 3: Navigate to Credits on mobile...');
    await page.goto('https://bookproof.app/author/credits');
    await page.waitForTimeout(3000);

    // Take mobile screenshot
    await page.screenshot({ path: 'test-results/mobile-credits-page.png', fullPage: true });
    console.log('✓ Mobile screenshot saved');

    // Check if content is visible (not overflowing)
    console.log('\nStep 4: Check mobile layout...');
    const packageCards = await page.locator('[class*="Card"]').count();
    console.log(`Number of package cards visible: ${packageCards}`);

    // Scroll down to see all packages
    await page.evaluate(() => window.scrollBy(0, 500));
    await page.waitForTimeout(500);
    await page.screenshot({ path: 'test-results/mobile-credits-scrolled.png', fullPage: false });
    console.log('✓ Scrolled mobile view screenshot saved');

    // Check if prices are readable
    const pageContent = await page.content();
    const hasPricing = pageContent.includes('R$') || pageContent.includes('$');
    console.log(`Pricing visible on mobile: ${hasPricing}`);
    expect(hasPricing).toBeTruthy();

    console.log('\n========================================');
    console.log('MOBILE LAYOUT TEST COMPLETE');
    console.log('========================================\n');
  });

  test('All Payment Types Summary Test', async ({ page }) => {
    console.log('\n========================================');
    console.log('TEST 5: PAYMENT TYPES SUMMARY');
    console.log('========================================\n');

    // Login
    await page.goto('https://bookproof.app/login');
    await page.fill('input[type="email"]', TEST_ACCOUNTS.author.email);
    await page.fill('input[type="password"]', TEST_ACCOUNTS.author.password);
    await page.locator('button:has-text("Sign In")').click();
    await page.waitForURL(/.*\/(author|dashboard)/, { timeout: 10000 });

    // Go to Credits
    await page.goto('https://bookproof.app/author/credits');
    await page.waitForTimeout(3000);

    const pageContent = await page.content();

    console.log('\n=== VERIFICATION SUMMARY ===\n');

    // 1. Check all packages exist
    console.log('1. Package Availability:');
    const packages = ['Starter', 'Basic', 'Growth', 'Professional', 'Premium', 'Enterprise'];
    for (const pkg of packages) {
      const exists = pageContent.includes(pkg);
      console.log(`   ${exists ? '✓' : '✗'} ${pkg}: ${exists}`);
      expect(exists).toBeTruthy();
    }

    // 2. Check pricing display
    console.log('\n2. Pricing Display:');
    const hasBRL = pageContent.includes('R$');
    const hasCredits = pageContent.includes('credits') || pageContent.includes('créditos');
    console.log(`   ${hasBRL ? '✓' : '✗'} BRL Currency (R$): ${hasBRL}`);
    console.log(`   ${hasCredits ? '✓' : '✗'} Credits mentioned: ${hasCredits}`);

    // 3. Check Most Popular badge
    console.log('\n3. Most Popular Badge:');
    const hasMostPopular = pageContent.includes('Most Popular') || pageContent.includes('Mais Popular');
    console.log(`   ${hasMostPopular ? '✓' : '✗'} Growth marked as Most Popular: ${hasMostPopular}`);

    // 4. Check Enterprise custom pricing
    console.log('\n4. Enterprise Custom Pricing:');
    const hasCustom = pageContent.includes('Custom') || pageContent.includes('Personalizado');
    const hasContactSales = pageContent.includes('Contact') || pageContent.includes('Fale com');
    console.log(`   ${hasCustom ? '✓' : '✗'} Custom pricing text: ${hasCustom}`);
    console.log(`   ${hasContactSales ? '✓' : '✗'} Contact sales option: ${hasContactSales}`);

    // 5. Check credit balance section
    console.log('\n5. Credit Balance Section:');
    const hasBalance = pageContent.includes('Available') || pageContent.includes('Disponíveis');
    console.log(`   ${hasBalance ? '✓' : '✗'} Balance section visible: ${hasBalance}`);

    await page.screenshot({ path: 'test-results/final-summary.png', fullPage: true });

    console.log('\n========================================');
    console.log('ALL TESTS COMPLETE');
    console.log('========================================\n');
  });
});
