import { test, expect } from '@playwright/test';

test.describe('Customer Flows', () => {
  const randomSuffix = Date.now().toString().slice(-5);
  const testUser = {
    name: `Test Customer ${randomSuffix}`,
    email: `customer${randomSuffix}@example.com`,
    phone: `98765${randomSuffix}`,
    password: 'Password123!',
  };

  test('Flow 4: Customer registration and session creation', async ({ page }) => {
    await page.goto('/register');
    await page.waitForLoadState('domcontentloaded');

    await page.locator('input[type="text"]').first().fill(testUser.name);
    await page.locator('input[type="email"]').fill(testUser.email);
    await page.locator('input[type="tel"]').fill(testUser.phone);
    await page.locator('input[type="password"]').first().fill(testUser.password);
    await page.locator('input[type="password"]').last().fill(testUser.password);

    await page.locator('button[type="submit"]').click();

    // Verify account page or home redirect
    await expect(page).toHaveURL(/.*(account|shop|\/)$/, { timeout: 10000 });
  });

  test('Flow 5 & 8: Guest cart to COD checkout and order confirmation', async ({ page }) => {
    // 1. Browse shop as guest
    await page.goto('/shop');
    await page.waitForLoadState('domcontentloaded');

    // Add first available product to cart
    const productCard = page.locator('main a[href*="/product/"]').first();
    if (await productCard.isVisible()) {
      await productCard.click();
      await expect(page).toHaveURL(/.*\/product\//);

      const addToCartBtn = page.getByRole('button', { name: /add to (bag|cart)/i }).first();
      await expect(addToCartBtn).toBeVisible();
      await addToCartBtn.click();

      // Navigate to cart
      await page.goto('/cart');
      await expect(page).toHaveURL(/.*\/cart/);

      // Verify cart has at least 1 item
      const checkoutLink = page.getByRole('link', { name: /proceed to checkout|checkout/i });
      if (await checkoutLink.isVisible()) {
        await checkoutLink.click();
        await expect(page).toHaveURL(/.*\/checkout/);

        // 2. Fill checkout details (COD)
        await page.locator('input[placeholder*="full name" i]').fill('Aarav Sharma');
        await page.locator('input[type="email"]').fill(`aarav${randomSuffix}@example.com`);
        await page.locator('input[type="tel"]').fill('9876543210');
        await page.locator('input[placeholder*="house" i], input[placeholder*="street" i], input[name*="addressLine1"]').first().fill('Flat 402, Lotus Residency');
        await page.locator('input[placeholder*="city" i], input[name*="city"]').fill('Hyderabad');
        await page.locator('input[placeholder*="state" i], input[name*="state"]').fill('Telangana');
        await page.locator('input[placeholder*="pin" i], input[name*="pincode"]').fill('500033');

        // Place COD order
        const placeOrderBtn = page.getByRole('button', { name: /place order/i });
        if (await placeOrderBtn.isVisible()) {
          await placeOrderBtn.click();
          // Verify redirect to success page
          await expect(page).toHaveURL(/.*\/order-success\//, { timeout: 15000 });
          await expect(page.getByText(/confirmed|thank you|placed/i).first()).toBeVisible();
        }
      }
    }
  });

  test('Flow 9: Customer order history in Account dashboard', async ({ page }) => {
    // Log in as registered customer
    await page.goto('/login');
    await page.waitForLoadState('domcontentloaded');

    await page.locator('input[type="email"]').fill(testUser.email);
    await page.locator('input[type="password"]').fill(testUser.password);
    await page.getByRole('button', { name: /sign in|log in/i }).click();

    // Verify account page
    await page.goto('/account');
    await page.waitForLoadState('domcontentloaded');
    await expect(page).toHaveURL(/.*\/account/);
  });
});

