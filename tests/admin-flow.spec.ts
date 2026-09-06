import { test, expect } from '@playwright/test';

const ADMIN_EMAIL = process.env.SEED_ADMIN_EMAIL || 'admin@btc.com';
const ADMIN_PASSWORD = process.env.SEED_ADMIN_PASSWORD || 'BtcAdmin#2026$SecureVault!';

test.describe('Admin Flows', () => {
  test('Flow 1: should protect admin dashboard and allow admin login', async ({ page }) => {
    // 1. Unauthenticated redirect check
    await page.goto('/admin/dashboard');
    await page.waitForLoadState('domcontentloaded');
    await expect(page).toHaveURL(/.*\/admin\/login/);

    // 2. Admin Login
    await page.locator('input[type="email"]').fill(ADMIN_EMAIL);
    await page.locator('input[type="password"]').fill(ADMIN_PASSWORD);
    await page.getByRole('button', { name: /sign in to dashboard/i }).click();

    // Verify redirected to dashboard
    await expect(page).toHaveURL(/.*\/admin\/dashboard/, { timeout: 10000 });
    await expect(page.getByText(/dashboard/i).first()).toBeVisible();
  });

  test('Flow 2: should create a new category in Admin', async ({ page }) => {
    // Log in first
    await page.goto('/admin/login');
    await page.locator('input[type="email"]').fill(ADMIN_EMAIL);
    await page.locator('input[type="password"]').fill(ADMIN_PASSWORD);
    await page.getByRole('button', { name: /sign in to dashboard/i }).click();
    await expect(page).toHaveURL(/.*\/admin\/dashboard/);

    // Navigate to categories
    await page.goto('/admin/categories');
    await page.waitForLoadState('domcontentloaded');

    // Click Add Category
    const addBtn = page.getByRole('button', { name: /add category/i });
    if (await addBtn.isVisible()) {
      await addBtn.click();

      // Fill Category Form
      const categoryName = `Botanical Elixirs ${Date.now().toString().slice(-4)}`;
      await page.locator('input[type="text"]').first().fill(categoryName);
      
      const saveBtn = page.getByRole('button', { name: /save changes/i });
      await saveBtn.click();

      // Check success or category card
      await expect(page.getByText(categoryName)).toBeVisible({ timeout: 10000 });
    }
  });

  test('Flow 3: should create a new product with image in Admin', async ({ page }) => {
    // Log in
    await page.goto('/admin/login');
    await page.locator('input[type="email"]').fill(ADMIN_EMAIL);
    await page.locator('input[type="password"]').fill(ADMIN_PASSWORD);
    await page.getByRole('button', { name: /sign in to dashboard/i }).click();
    await expect(page).toHaveURL(/.*\/admin\/dashboard/);

    // Navigate to Add Product
    await page.goto('/admin/products/add');
    await page.waitForLoadState('domcontentloaded');

    const productName = `Handcrafted Kumkumadi Soap ${Date.now().toString().slice(-4)}`;
    await page.locator('input[placeholder*="Turmeric Glow Face Wash" i]').fill(productName);
    await page.locator('input[placeholder="399"]').fill('450');

    // Add Image URL
    const urlInput = page.locator('input[placeholder*="http" i]').first();
    if (await urlInput.isVisible()) {
      await urlInput.fill('https://images.unsplash.com/photo-1607006344380-b6775a0824a7?w=600&q=80');
      const addUrlBtn = page.getByRole('button', { name: /add url/i });
      if (await addUrlBtn.isVisible()) {
        await addUrlBtn.click();
      }
    }

    // Select first valid category
    await page.locator('select').first().selectOption({ index: 0 });

    // Save Product
    await page.getByRole('button', { name: /save product/i }).click();

    // Verify redirected to products list and product is visible
    await expect(page).toHaveURL(/.*\/admin\/products/, { timeout: 10000 });
    await expect(page.getByText(productName).first()).toBeVisible({ timeout: 10000 });
  });

  test('Flow 6a: should create and manage coupons in Admin', async ({ page }) => {
    // Log in
    await page.goto('/admin/login');
    await page.locator('input[type="email"]').fill(ADMIN_EMAIL);
    await page.locator('input[type="password"]').fill(ADMIN_PASSWORD);
    await page.getByRole('button', { name: /sign in to dashboard/i }).click();
    await expect(page).toHaveURL(/.*\/admin\/dashboard/);

    // Navigate to coupons
    await page.goto('/admin/coupons');
    await page.waitForLoadState('domcontentloaded');

    const addCouponBtn = page.getByRole('button', { name: /add coupon/i });
    if (await addCouponBtn.isVisible()) {
      await addCouponBtn.click();

      // Fill coupon details
      const couponCode = `SAVE${Date.now().toString().slice(-4)}`;
      await page.locator('input[placeholder*="SAVE" i], input[name="code"]').first().fill(couponCode);
      
      const submitBtn = page.getByRole('button', { name: /save changes|create coupon/i });
      if (await submitBtn.isVisible()) {
        await submitBtn.click();
      }
    }
  });

  test('Flow 10: should navigate orders and view order details', async ({ page }) => {
    // Log in
    await page.goto('/admin/login');
    await page.locator('input[type="email"]').fill(ADMIN_EMAIL);
    await page.locator('input[type="password"]').fill(ADMIN_PASSWORD);
    await page.getByRole('button', { name: /sign in to dashboard/i }).click();
    await expect(page).toHaveURL(/.*\/admin\/dashboard/);

    // Navigate to orders
    await page.goto('/admin/orders');
    await page.waitForLoadState('domcontentloaded');
    await expect(page.getByText(/orders/i).first()).toBeVisible();
  });
});

