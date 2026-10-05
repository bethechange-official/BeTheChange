/**
 * Full end-to-end check of the storefront and admin portal against LOCAL dev servers
 * (frontend on :5173 via `npm run dev`, backend on :5000). It creates and modifies data, so
 * point the backend at a development/test database — never production.
 *
 * Signs in through the real login forms. Admin credentials come from the environment (never
 * hardcoded); a fresh customer, coupons and products are created per run and cleaned up after.
 *
 * Run:
 *   E2E_ADMIN_EMAIL=… E2E_ADMIN_PASSWORD=… npx playwright test tests/full-e2e.spec.ts
 */
import { test, expect, type Page, type APIRequestContext } from '@playwright/test';
import crypto from 'node:crypto';

const API = 'http://localhost:5000/api';
const ADMIN = { email: process.env.E2E_ADMIN_EMAIL ?? '', password: process.env.E2E_ADMIN_PASSWORD ?? '' };
const RUN = Date.now().toString(36).toUpperCase();
// A throwaway customer registered for this run only.
const CUSTOMER = { name: 'E2E Customer', email: `e2e-${RUN.toLowerCase()}@example.test`, phone: '9876543210', password: `E2e-${crypto.randomBytes(9).toString('base64url')}` };
const PRODUCT_NAME = `E2E Rose Soap ${RUN}`;
const PRODUCT_SLUG = `e2e-rose-soap-${RUN.toLowerCase()}`;
// Lip products created for this run (Lip Care page, categories and collections tests).
const LIPS = ['Strawberry', 'Beetroot', 'Sunscreen'].map((flavour) => ({
  name: `E2E ${flavour} Lip Balm ${RUN}`,
  slug: `e2e-${flavour.toLowerCase()}-lip-balm-${RUN.toLowerCase()}`,
}));
// Coupons created for this run: ₹50 off and 10% off.
const COUPON = { flat: `E2EFLAT${RUN}`, pct: `E2EPCT${RUN}` };

const state: { adminToken?: string; productId?: string; fixtureIds: string[]; couponIds: string[]; orderNumbers: string[] } =
  { fixtureIds: [], couponIds: [], orderNumbers: [] };

// ---------- helpers ----------

/** Fails the test on uncaught exceptions or console errors (ignoring missing images and aborted fetches). */
function watchForErrors(page: Page) {
  const errors: string[] = [];
  page.on('pageerror', (err) => errors.push(`pageerror: ${err.message}`));
  page.on('console', (msg) => {
    if (msg.type() !== 'error') return;
    const text = msg.text();
    if (/Failed to load resource|net::ERR_ABORTED|favicon/i.test(text)) return;
    errors.push(`console.error: ${text}`);
  });
  return () => expect(errors, errors.join('\n')).toEqual([]);
}

async function apiJson(request: APIRequestContext, method: string, path: string, opts: { token?: string; data?: unknown } = {}) {
  const res = await request.fetch(API + path, {
    method,
    headers: opts.token ? { Authorization: `Bearer ${opts.token}` } : {},
    data: opts.data,
  });
  return { status: res.status(), body: await res.json() };
}

async function adminLogin(page: Page) {
  await page.goto('/admin/login');
  await page.locator('input[type="email"]').fill(ADMIN.email);
  await page.locator('input[type="password"]').fill(ADMIN.password);
  await page.getByRole('button', { name: /sign in to dashboard/i }).click();
  await expect(page).toHaveURL(/\/admin\/dashboard/, { timeout: 15000 });
}

/** Signs the run's customer in through the storefront login form (lands on /account). */
async function customerLogin(page: Page) {
  await page.goto('/login');
  await page.getByPlaceholder('your.email@example.com').fill(CUSTOMER.email);
  await page.locator('input[type="password"]').fill(CUSTOMER.password);
  await page.getByRole('button', { name: /sign in to account/i }).click();
  await expect(page).toHaveURL(/\/account$/, { timeout: 15000 });
}

async function productStock(request: APIRequestContext) {
  const r = await apiJson(request, 'GET', `/admin/products/${state.productId}`, { token: state.adminToken });
  return r.body.data.stock as number;
}

// ---------- setup / teardown ----------

test.describe.configure({ mode: 'serial' });

test.beforeAll(async ({ request }) => {
  expect(ADMIN.email && ADMIN.password, 'Set E2E_ADMIN_EMAIL and E2E_ADMIN_PASSWORD to an admin of the local test database').toBeTruthy();
  const login = await apiJson(request, 'POST', '/admin/auth/login', { data: ADMIN });
  expect(login.status, 'admin API login').toBe(200);
  state.adminToken = login.body.data.accessToken;
  const token = state.adminToken;

  const createProduct = async (data: Record<string, unknown>) => {
    const r = await apiJson(request, 'POST', '/admin/products', { token, data: { price: 249, stock: 20, shortDescription: 'E2E test product', ...data } });
    expect(r.status, JSON.stringify(r.body)).toBe(201);
    state.fixtureIds.push(r.body.data.id);
    return r.body.data.id as string;
  };
  state.productId = await createProduct({ name: PRODUCT_NAME, slug: PRODUCT_SLUG, category: 'Skincare', price: 500 });
  for (const lip of LIPS) await createProduct({ ...lip, category: 'Lip Care' });

  const iso = (days: number) => new Date(Date.now() + days * 864e5).toISOString();
  for (const [code, type, value] of [[COUPON.flat, 'FLAT', 50], [COUPON.pct, 'PERCENTAGE', 10]] as const) {
    const r = await apiJson(request, 'POST', '/admin/coupons', { token, data: {
      code, discountType: type, discountValue: value, startDate: iso(-1), expiryDate: iso(1), usageLimit: 100, isActive: true,
    } });
    expect(r.status, JSON.stringify(r.body)).toBe(201);
    state.couponIds.push(r.body.data.id);
  }

  const reg = await apiJson(request, 'POST', '/auth/register', { data: CUSTOMER });
  expect(reg.status, JSON.stringify(reg.body)).toBe(201);
});

test.afterAll(async ({ request }) => {
  const token = state.adminToken;
  // Hide the run's products (orders reference them, so they aren't deleted) and remove its coupons.
  for (const id of state.fixtureIds) {
    await apiJson(request, 'PUT', `/admin/products/${id}`, { token, data: { isActive: false, collection: null } });
  }
  for (const id of state.couponIds) await apiJson(request, 'DELETE', `/admin/coupons/${id}`, { token });
});

// ---------- 1. routes ----------

test.describe('1. Storefront routes render without errors', () => {
  const routes = [
    ['/', /./],
    ['/shop', /./],
    ['/about', /./],
    ['/contact', /./],
    ['/cart', /./],
    ['/category/skin-care-products', /./],
    ['/category/lip-care', /./],
    ['/category/hair-care-products', /./],
    ['/category/household-products', /./],
  ] as const;

  for (const [path] of routes) {
    test(`GET ${path}`, async ({ page }) => {
      const assertNoErrors = watchForErrors(page);
      await page.goto(path);
      await page.waitForLoadState('networkidle');
      await expect(page.locator('main').first()).toBeVisible();
      await expect(page.getByText(/page not found|404/i)).toHaveCount(0);
      assertNoErrors();
    });
  }

  test('product detail page for the test product', async ({ page }) => {
    const assertNoErrors = watchForErrors(page);
    await page.goto(`/product/${PRODUCT_SLUG}`);
    await expect(page.getByRole('heading', { name: PRODUCT_NAME })).toBeVisible();
    await expect(page.getByRole('button', { name: /add to bag/i })).toBeEnabled();
    assertNoErrors();
  });

  test('unknown route shows the 404 page', async ({ page }) => {
    await page.goto('/this-route-does-not-exist');
    await expect(page.getByText(/not found|404/i).first()).toBeVisible();
  });

  test('header navigation links go to the right pages', async ({ page }) => {
    await page.goto('/');
    const nav = [
      ['SHOP ALL', /\/shop$/],
      ['SKINCARE', /\/category\/skin-care-products$/],
      ['LIP CARE', /\/category\/lip-care$/],
      ['HAIR CARE', /\/category\/hair-care-products$/],
      ['HOUSEHOLD', /\/category\/household-products$/],
      ['CONTACT', /\/contact$/],
    ] as const;
    for (const [label, url] of nav) {
      await page.getByRole('link', { name: label, exact: true }).first().click();
      await expect(page).toHaveURL(url);
    }
    // Removed earlier at the user's request.
    await expect(page.getByRole('link', { name: 'BODY CARE', exact: true })).toHaveCount(0);
  });

  test('home "Shop by Category", footer and Shop filter list exactly the four categories', async ({ page }) => {
    const four = ['Skincare', 'Lip Care', 'Hair Care', 'Household'];
    await page.goto('/');
    const section = page.locator('#categories');
    await expect(section.locator('a[href^="/category/"]').first()).toBeVisible();
    const names = (await section.locator('a[href^="/category/"] h3').allTextContents()).map((t) => t.trim());
    expect(names).toEqual(four); // same order as the header nav

    const footerShop = (await page.locator('footer a[href^="/category/"]').allTextContents()).map((t) => t.trim());
    expect(footerShop).toEqual(four);

    await page.goto('/shop');
    // Options load from the API; wait for them, then compare.
    const options = page.locator('select').first().locator('option');
    await expect(options).toHaveCount(5);
    expect(await options.allTextContents()).toEqual(['All', ...four]);

    // Retired soap category links redirect to Skincare, where those products now live.
    await page.goto('/category/glycerin-soaps');
    await expect(page).toHaveURL(/\/category\/skin-care-products$/);
    await expect(page.getByRole('heading', { name: 'Skincare', level: 1 })).toBeVisible();
  });

  test('Lip Care lists the lip balms; Skin Care no longer does', async ({ page }) => {
    await page.goto('/category/lip-care');
    for (const name of LIPS.map((l) => l.name)) {
      await expect(page.getByText(name, { exact: true }).first()).toBeVisible();
    }
    await page.goto('/category/skin-care-products');
    await expect(page.locator('main')).toBeVisible();
    await expect(page.getByText(/Lip Balm/)).toHaveCount(0);
  });

  test('admin pages redirect to login when signed out', async ({ page }) => {
    for (const path of ['/admin/dashboard', '/admin/orders', '/admin/coupons']) {
      await page.goto(path);
      await expect(page).toHaveURL(/\/admin\/login/);
    }
  });
});

// ---------- 2. customer journey ----------

test.describe('2. Customer journey: login → cart → coupon → checkout', () => {
  test('login form, then a full coupon checkout', async ({ page }) => {
    const assertNoErrors = watchForErrors(page);

    // Dev auto-login: clicking login lands on the storefront, signed in.
    await customerLogin(page);

    // Add the product from its page.
    await page.goto(`/product/${PRODUCT_SLUG}`);
    await page.getByRole('button', { name: /add to bag/i }).click();
    await page.goto('/cart');
    await expect(page.locator('main').getByText(PRODUCT_NAME, { exact: true }).first()).toBeVisible();
    await expect(page.locator('main').getByText('Subtotal').locator('..')).toContainText('₹500');

    // Invalid coupon → clear error, nothing applied.
    const codeInput = page.getByRole('textbox', { name: 'Coupon code' });
    await codeInput.fill('NOPE123');
    await page.getByRole('button', { name: 'Apply' }).click();
    await expect(page.getByRole('alert')).toHaveText('Invalid coupon code');

    // 10% on ₹500 → ₹50 off.
    await codeInput.fill(COUPON.pct.toLowerCase()); // codes are case-insensitive
    await page.getByRole('button', { name: 'Apply' }).click();
    await expect(page.locator('main').getByText(`Coupon Discount (${COUPON.pct})`).locator('..')).toContainText('−₹50');
    await expect(page.locator('main').getByText('Amount after discount').locator('..')).toContainText('₹450');

    // Quantity 2 → the coupon is re-priced by the server: 10% of ₹1,000 = ₹100.
    await page.locator('main button:has(svg.lucide-plus)').first().click();
    await expect(page.locator('main').getByText(`Coupon Discount (${COUPON.pct})`).locator('..')).toContainText('−₹100');
    await expect(page.locator('main').getByText('Amount after discount').locator('..')).toContainText('₹900');

    // Remove → original price restored.
    await page.getByRole('button', { name: new RegExp(`remove coupon ${COUPON.pct}`, 'i') }).click();
    await expect(page.locator('main').getByText(/Coupon Discount/)).toHaveCount(0);
    await expect(page.locator('main').getByText('Final Amount').locator('..')).not.toContainText('₹900');

    // Apply the flat ₹50 coupon on the checkout page itself.
    await page.getByRole('button', { name: /proceed to checkout/i }).click();
    await expect(page).toHaveURL(/\/checkout/);
    // Checkout is lazy-loaded and routed in a transition: the URL changes while the Cart page is still
    // on screen, so wait for the Checkout page itself before typing into its coupon field.
    await expect(page.getByRole('heading', { name: 'Checkout', exact: true })).toBeVisible();
    await page.getByRole('textbox', { name: 'Coupon code' }).fill(COUPON.flat);
    await page.getByRole('button', { name: 'Apply' }).click();
    await expect(page.locator('main').getByText(`Coupon Discount (${COUPON.flat})`).locator('..')).toContainText('−₹50');
    await expect(page.locator('main').getByText('Amount after discount').locator('..')).toContainText('₹950');
    // Survives a reload.
    await page.reload();
    await expect(page.locator('main').getByText(`Coupon Discount (${COUPON.flat})`)).toBeVisible();

    // Enter applies the coupon instead of submitting the order form.
    await page.getByRole('button', { name: new RegExp(`remove coupon ${COUPON.flat}`, 'i') }).click();
    await page.getByRole('textbox', { name: 'Coupon code' }).fill(COUPON.flat);
    await page.getByRole('textbox', { name: 'Coupon code' }).press('Enter');
    await expect(page).toHaveURL(/\/checkout/);
    await expect(page.locator('main').getByText(`Coupon Discount (${COUPON.flat})`)).toBeVisible();

    // Address + place order.
    const fill = async (placeholder: string, value: string) => {
      const input = page.getByPlaceholder(placeholder, { exact: true });
      await input.fill('');
      await input.fill(value);
    };
    await fill('Your full name', CUSTOMER.name);
    await fill('+91 00000 00000', '9876543210');
    await fill('Street address, apartment, etc.', '12 Botanical Avenue');
    await fill('City', 'Hyderabad');
    await fill('State', 'Telangana');
    await fill('000000', '500033');
    await page.getByRole('button', { name: /place order/i }).click();

    await expect(page).toHaveURL(/\/order-success/, { timeout: 15000 });
    await expect(page.locator('main').getByText(`Coupon Discount (${COUPON.flat})`).locator('..')).toContainText('-₹50');
    const orderNumber = (await page.getByText(/BTC-[A-Z0-9]+-[A-F0-9]+/).first().textContent())!.match(/BTC-[A-Z0-9]+-[A-F0-9]+/)![0];
    state.orderNumbers.push(orderNumber);

    // Shows up in My Orders.
    await page.goto('/account');
    await expect(page.getByText(orderNumber).first()).toBeVisible({ timeout: 10000 });

    assertNoErrors();
  });

  test('a second order (no coupon) for the cancel test', async ({ page }) => {
    await customerLogin(page);
    await page.goto(`/product/${PRODUCT_SLUG}`);
    await page.getByRole('button', { name: /add to bag/i }).click();
    await page.goto('/checkout');
    await page.getByPlaceholder('Street address, apartment, etc.').fill('12 Botanical Avenue');
    await page.getByPlaceholder('City', { exact: true }).fill('Hyderabad');
    await page.getByPlaceholder('State', { exact: true }).fill('Telangana');
    await page.getByPlaceholder('000000').fill('500033');
    await page.getByPlaceholder('+91 00000 00000').fill('9876543210');
    await page.getByRole('button', { name: /place order/i }).click();
    await expect(page).toHaveURL(/\/order-success/, { timeout: 15000 });
    const orderNumberEl = page.getByText(/BTC-[A-Z0-9]+-[A-F0-9]+/).first();
    await expect(orderNumberEl).toBeVisible();
    state.orderNumbers.push((await orderNumberEl.textContent())!.match(/BTC-[A-Z0-9]+-[A-F0-9]+/)![0]);
  });
});

// ---------- 3. admin order statuses ----------

test.describe('3. Admin order status management', () => {
  test('list page: search by order number, only valid transitions offered', async ({ page }) => {
    const assertNoErrors = watchForErrors(page);
    await adminLogin(page);
    await page.goto('/admin/orders');

    const [orderNumber] = state.orderNumbers;
    await page.getByPlaceholder(/search order/i).fill(orderNumber);
    const row = page.getByRole('row', { name: new RegExp(orderNumber) });
    await expect(row).toBeVisible({ timeout: 10000 });
    await expect(page.getByRole('row')).toHaveCount(2); // header + our order

    const select = row.getByRole('combobox', { name: `Order status for ${orderNumber}` });
    const options = await select.locator('option').allTextContents();
    expect(options).toEqual(['Pending (current)', 'Confirmed', 'Cancelled']);

    // PENDING → CONFIRMED from the list; the row's options move forward.
    await select.selectOption('CONFIRMED');
    await expect(page.getByText(`Order ${orderNumber} updated to Confirmed`)).toBeVisible();
    await expect(select).toHaveValue('CONFIRMED');
    expect(await select.locator('option').allTextContents()).toEqual(['Confirmed (current)', 'Processing', 'Cancelled']);
    assertNoErrors();
  });

  test('orders list paginates: next/previous change the page and the rows', async ({ page, request }) => {
    const total = (await apiJson(request, 'GET', '/admin/orders?limit=1', { token: state.adminToken })).body.pagination.total;
    test.skip(total <= 20, `needs more than 20 orders to paginate (have ${total})`);
    const pages = Math.ceil(total / 20);

    await adminLogin(page);
    await page.goto('/admin/orders');
    await expect(page.getByText(`Page 1 of ${pages}`)).toBeVisible();
    const firstRowPage1 = await page.getByRole('row').nth(1).textContent();

    const next = page.locator('button:has(svg.lucide-chevron-right)');
    const prev = page.locator('button:has(svg.lucide-chevron-left)');
    await expect(prev).toBeDisabled();
    await next.click();
    await expect(page.getByText(`Page 2 of ${pages}`)).toBeVisible();
    await expect(page.getByText(/Showing 21 to \d+ of \d+ results/)).toBeVisible();
    await expect(page.getByRole('row').nth(1)).not.toHaveText(firstRowPage1!);

    await prev.click();
    await expect(page.getByText(`Page 1 of ${pages}`)).toBeVisible();
    await expect(page.getByRole('row').nth(1)).toHaveText(firstRowPage1!);
  });

  test('details page: full lifecycle to Delivered + Paid, then Refunded', async ({ page }) => {
    const assertNoErrors = watchForErrors(page);
    page.on('dialog', (d) => d.accept());
    await adminLogin(page);
    await page.goto('/admin/orders');
    const [orderNumber] = state.orderNumbers;
    await page.getByPlaceholder(/search order/i).fill(orderNumber);
    await page.getByRole('link', { name: orderNumber }).click();
    await expect(page).toHaveURL(/\/admin\/orders\/[0-9a-f-]{36}/);

    const orderSelect = page.getByRole('combobox', { name: 'Order status' });
    const paymentSelect = page.getByRole('combobox', { name: 'Payment status' });
    await expect(orderSelect).toHaveValue('CONFIRMED');

    for (const [value, label] of [['PROCESSING', 'Processing'], ['SHIPPED', 'Shipped'], ['DELIVERED', 'Delivered']]) {
      await orderSelect.selectOption(value);
      await expect(page.getByText(`Order status updated to ${label}`)).toBeVisible();
      await expect(orderSelect).toHaveValue(value);
      // The page must stay on the order (it used to be replaced by an error/loading screen).
      await expect(page.getByText(orderNumber).first()).toBeVisible();
    }
    expect(await orderSelect.locator('option').allTextContents()).toEqual(['Delivered (current)', 'Refunded']);

    await paymentSelect.selectOption('PAID');
    await expect(page.getByText('Payment status updated to Paid')).toBeVisible();

    // Persisted after reload.
    await page.reload();
    await expect(orderSelect).toHaveValue('DELIVERED');
    await expect(paymentSelect).toHaveValue('PAID');

    // Refund (confirm dialog accepted) → payment follows to Refunded, both become final.
    await orderSelect.selectOption('REFUNDED');
    await expect(page.getByText('Order status updated to Refunded')).toBeVisible();
    await expect(paymentSelect).toHaveValue('REFUNDED');
    await expect(orderSelect).toBeDisabled();
    await expect(paymentSelect).toBeDisabled();
    assertNoErrors();
  });

  test('cancel from the list restores stock exactly once; declining the confirm does nothing', async ({ page, request }) => {
    await adminLogin(page);
    await page.goto('/admin/orders');
    const orderNumber = state.orderNumbers[1];
    await page.getByPlaceholder(/search order/i).fill(orderNumber);
    const select = page.getByRole('combobox', { name: `Order status for ${orderNumber}` });
    await expect(select).toBeVisible({ timeout: 10000 });

    const stockBefore = await productStock(request);

    // Decline: nothing changes.
    page.once('dialog', (d) => d.dismiss());
    await select.selectOption('CANCELLED');
    await expect(select).toHaveValue('PENDING');

    // Accept: cancelled, final, stock +1.
    page.once('dialog', (d) => d.accept());
    await select.selectOption('CANCELLED');
    await expect(page.getByText(`Order ${orderNumber} updated to Cancelled`)).toBeVisible();
    await expect(select).toBeDisabled();
    expect(await productStock(request)).toBe(stockBefore + 1);
  });
});

// ---------- 4. admin pages + coupons + dashboard ----------

test.describe('4. Admin portal pages', () => {
  test('every admin page loads without errors (via sidebar)', async ({ page }) => {
    const assertNoErrors = watchForErrors(page);
    await adminLogin(page);
    for (const [label, url] of [
      ['Products', /\/admin\/products$/],
      ['Categories', /\/admin\/categories$/],
      ['Coupons', /\/admin\/coupons$/],
      ['Customers', /\/admin\/customers$/],
      ['Orders', /\/admin\/orders$/],
      ['Settings', /\/admin\/settings$/],
      ['Dashboard', /\/admin\/dashboard$/],
    ] as const) {
      await page.getByRole('link', { name: label, exact: true }).click();
      await expect(page).toHaveURL(url);
      // Data loaded = no skeletons/spinners left (networkidle is unreliable with external product images).
      await expect(page.locator('main .animate-pulse, main .animate-spin')).toHaveCount(0, { timeout: 10000 });
      await expect(page.getByText(/\\u20B9|NaN|undefined/)).toHaveCount(0);
    }
    await page.goto('/admin/products/add');
    await expect(page.locator('form').first()).toBeVisible();
    await page.goto(`/admin/products/edit/${state.productId}`);
    await expect(page.locator(`input[value="${PRODUCT_NAME}"]`)).toBeVisible({ timeout: 10000 });
    assertNoErrors();
  });

  test('dashboard cards show real, consistent numbers', async ({ page, request }) => {
    await adminLogin(page);
    const api = (await apiJson(request, 'GET', '/admin/dashboard', { token: state.adminToken })).body.data;
    // StatCard root: the bordered card, which holds both the title and the value.
    const card = (title: string) => page.locator('div.rounded-xl.border', { has: page.getByText(title, { exact: true }) }).first();

    await expect(card('Total Orders')).toContainText(String(api.totalOrders));
    await expect(card('Delivered Orders')).toContainText(String(api.deliveredOrders));
    await expect(card('Active Coupons')).toContainText(String(api.activeCoupons));
    await expect(card('Pending Orders')).toContainText(String(api.pendingOrders));
    // Delivered/refunded order from this run counts in the status breakdown, not "0".
    expect(api.ordersByStatus.REFUNDED).toBeGreaterThanOrEqual(1);
    expect(api.ordersByStatus.CANCELLED).toBeGreaterThanOrEqual(1);
    // No leftover hardcoded figures.
    await expect(page.getByText(/18\.4%|12\.1%|8\.5%|24\.8% YoY/)).toHaveCount(0);
    // Each comparison is a percentage naming both periods ("↑ 18.4% more in 1–3 Oct than 1–3 Sep"),
    // or "New" when the earlier period is zero (no percentage exists for growth from nothing).
    const range = String.raw`\d{1,2}(–\d{1,2})? [A-Z][a-z]{2}`;
    const salesLine = page.locator('div.rounded-xl.border', { has: page.getByText('Total Sales', { exact: true }) }).first().locator('div[title]');
    const r = api.comparisons.revenue;
    if (r.changePercent === null) {
      await expect(salesLine).toHaveText(new RegExp(`^↑ New\\s*in ${range} · nothing in ${range} to compare$`));
    } else {
      const pct = Math.abs(r.changePercent).toLocaleString('en-IN', { minimumFractionDigits: 1, maximumFractionDigits: 1 });
      await expect(salesLine).toHaveText(new RegExp(`^[↑↓→] ${pct.replace('.', '\\.')}%\\s*(more|less|same) in ${range} (than|as) ${range}$`));
    }
    await expect(page.getByText(/this month|Sept/)).toHaveCount(0);
  });

  test('collections: add, move and remove products', async ({ page, request }) => {
    const assertNoErrors = watchForErrors(page);
    const token = state.adminToken!;
    const collections = (await apiJson(request, 'GET', '/admin/collections', { token })).body.data;
    const best = collections.find((c: { slug: string }) => c.slug === 'best-sellers');
    const fresh = collections.find((c: { slug: string }) => c.slug === 'new-arrivals');
    // Start both from empty so counts are predictable, remembering the real members to restore afterwards.
    const membersOf = async (name: string) =>
      (await apiJson(request, 'GET', `/admin/products?limit=100&collection=${encodeURIComponent(name)}`, { token })).body.data.map((p: { id: string }) => p.id);
    const original = { best: await membersOf(best.name), fresh: await membersOf(fresh.name) };
    await apiJson(request, 'PUT', `/admin/collections/${best.id}/products`, { token, data: { productIds: [] } });
    await apiJson(request, 'PUT', `/admin/collections/${fresh.id}/products`, { token, data: { productIds: [] } });
    const productBySlug = async (slug: string) =>
      (await apiJson(request, 'GET', `/admin/products?search=${encodeURIComponent(slug.replace(/-/g, ' '))}`, { token })).body.data[0];

    await adminLogin(page);
    await page.goto('/admin/categories');
    await page.getByRole('button', { name: /collections/i }).click();
    const card = (name: string) => page.locator('div.rounded-xl', { has: page.getByRole('heading', { name, exact: true }) });
    const openManager = async (name: string) => {
      await card(name).getByRole('button', { name: 'Manage Products' }).click();
      const dialog = page.getByRole('dialog', { name: `Manage products in ${name}` });
      await expect(dialog.getByText('Loading products…')).toHaveCount(0);
      return dialog;
    };

    // Add two lip balms to Best Sellers.
    let dialog = await openManager('Best Sellers');
    await dialog.getByRole('checkbox', { name: LIPS[0].name }).check();
    await dialog.getByRole('checkbox', { name: LIPS[1].name }).check();
    await expect(dialog.getByText('2 selected')).toBeVisible();
    await dialog.getByRole('button', { name: 'Save Products' }).click();
    await expect(page.getByText('“Best Sellers” now has 2 products.')).toBeVisible();
    await expect(card('Best Sellers')).toContainText('2 Products Assigned');
    expect((await productBySlug('strawberry-lip-balm')).collection).toBe('Best Sellers');

    // It shows on the storefront product page.
    await page.goto('/product/strawberry-lip-balm');
    await expect(page.getByText('Best Sellers').first()).toBeVisible();
    await page.goto('/admin/categories');
    await page.getByRole('button', { name: /collections/i }).click();

    // Move Beetroot to New Arrivals: it's flagged as being in another collection.
    dialog = await openManager('New Arrivals');
    const beetrootRow = dialog.locator('label', { has: page.getByRole('checkbox', { name: LIPS[1].name }) });
    await expect(beetrootRow).toContainText('In Best Sellers');
    await beetrootRow.getByRole('checkbox').check();
    await expect(dialog.getByText('1 product will be moved here from another collection.')).toBeVisible();
    await dialog.getByRole('button', { name: 'Save Products' }).click();
    await expect(card('New Arrivals')).toContainText('1 Products Assigned');
    await expect(card('Best Sellers')).toContainText('1 Products Assigned');

    // Search + select-all only affects the shown products; then remove Strawberry from Best Sellers.
    dialog = await openManager('Best Sellers');
    await expect(dialog.getByRole('checkbox', { name: LIPS[0].name })).toBeChecked();
    await dialog.getByPlaceholder(/search products/i).fill(LIPS[2].name.toLowerCase());
    await expect(dialog.getByRole('checkbox')).toHaveCount(2); // select-all + the one match
    await dialog.getByText(/Select all shown/).click();
    await dialog.getByPlaceholder(/search products/i).fill('');
    await expect(dialog.getByText('2 selected')).toBeVisible();
    await dialog.getByRole('checkbox', { name: LIPS[0].name }).uncheck();
    await dialog.getByRole('checkbox', { name: LIPS[2].name }).uncheck();
    await dialog.getByRole('button', { name: 'Save Products' }).click();
    await expect(card('Best Sellers')).toContainText('0 Products Assigned');
    expect((await productBySlug('strawberry-lip-balm')).collection).toBeNull();

    // Restore the collections' real members.
    await apiJson(request, 'PUT', `/admin/collections/${best.id}/products`, { token, data: { productIds: original.best } });
    await apiJson(request, 'PUT', `/admin/collections/${fresh.id}/products`, { token, data: { productIds: original.fresh } });
    assertNoErrors();
  });

  test('categories: move products in, out to Uncategorized, and back', async ({ page, request }) => {
    const assertNoErrors = watchForErrors(page);
    const token = state.adminToken!;
    const categoryOf = async () => (await apiJson(request, 'GET', `/admin/products/${state.productId}`, { token })).body.data.category;
    expect(await categoryOf()).toBe('Skincare');

    await adminLogin(page);
    await page.goto('/admin/categories');
    // Exactly the four storefront categories (the empty "Uncategorized" fallback stays hidden).
    await expect(page.getByRole('button', { name: 'Categories (4)' })).toBeVisible();
    expect((await page.locator('main h3.font-serif').allTextContents()).map((t) => t.trim()))
      .toEqual(['Skincare', 'Lip Care', 'Hair Care', 'Household']);

    const card = (name: string) => page.locator('div.rounded-xl', { has: page.getByRole('heading', { name, exact: true }) });
    const openManager = async (name: string) => {
      await card(name).getByRole('button', { name: 'Manage Products' }).click();
      const dialog = page.getByRole('dialog', { name: `Manage products in ${name}` });
      await expect(dialog.getByText('Loading products…')).toHaveCount(0);
      return dialog;
    };
    const lipCount = (await apiJson(request, 'GET', '/admin/categories', { token })).body.data
      .find((c: { slug: string }) => c.slug === 'lip-care').productsCount;

    // Lip Care already holds the lip balms; move the test product in from Skin Care.
    let dialog = await openManager('Lip Care');
    await expect(dialog.getByRole('checkbox', { name: LIPS[0].name })).toBeChecked();
    const row = dialog.locator('label', { has: page.getByRole('checkbox', { name: PRODUCT_NAME }) });
    await expect(row).toContainText('In Skincare');
    await row.getByRole('checkbox').check();
    await expect(dialog.getByText('1 product will be moved here from another category.')).toBeVisible();
    await dialog.getByRole('button', { name: 'Save Products' }).click();
    await expect(page.getByText(`“Lip Care” now has ${lipCount + 1} products.`)).toBeVisible();
    await expect(card('Lip Care')).toContainText(`${lipCount + 1} Products Assigned`);
    expect(await categoryOf()).toBe('Lip Care');

    // Untick it: every product needs a category, so it falls back to Uncategorized (with a warning first).
    dialog = await openManager('Lip Care');
    await dialog.getByRole('checkbox', { name: PRODUCT_NAME }).uncheck();
    await expect(dialog.getByText('1 product will be moved to “Uncategorized”.')).toBeVisible();
    await dialog.getByRole('button', { name: 'Save Products' }).click();
    await expect(card('Lip Care')).toContainText(`${lipCount} Products Assigned`);
    expect(await categoryOf()).toBe('Uncategorized');

    // In Uncategorized it can't be unticked (nowhere to go)…
    dialog = await openManager('Uncategorized');
    await expect(dialog.getByRole('checkbox', { name: PRODUCT_NAME })).toBeChecked();
    await expect(dialog.getByRole('checkbox', { name: PRODUCT_NAME })).toBeDisabled();
    await dialog.getByRole('button', { name: 'Cancel' }).click();

    // …it leaves by being assigned elsewhere: back to Skin Care.
    dialog = await openManager('Skincare');
    await dialog.getByRole('checkbox', { name: PRODUCT_NAME }).check();
    await dialog.getByRole('button', { name: 'Save Products' }).click();
    await expect(page.getByText(/“Skincare” now has/)).toBeVisible();
    expect(await categoryOf()).toBe('Skincare');
    assertNoErrors();
  });

  test('category products API keeps every product in a category', async ({ request }) => {
    const token = state.adminToken!;
    const categories = async () => (await apiJson(request, 'GET', '/admin/categories', { token })).body.data as Array<{ id: string; slug: string; isActive: boolean }>;
    const skin = (await categories()).find((c) => c.slug === 'skin-care-products')!;
    // Every Skincare product (all pages): the PUT replaces the full membership, so a partial list would
    // push the rest into Uncategorized.
    const skinIds: string[] = [];
    for (let pageNo = 1; ; pageNo++) {
      const r = (await apiJson(request, 'GET', `/admin/products?limit=100&page=${pageNo}&category=Skincare`, { token })).body;
      skinIds.push(...r.data.map((p: { id: string }) => p.id));
      if (pageNo >= r.pagination.totalPages) break;
    }

    // Taking the product out of Skincare sends it to the "Uncategorized" fallback, created on demand and hidden.
    const out = await apiJson(request, 'PUT', `/admin/categories/${skin.id}/products`, { token, data: { productIds: skinIds.filter((id: string) => id !== state.productId) } });
    expect(out.status).toBe(200);
    const uncategorized = (await categories()).find((c) => c.slug === 'uncategorized')!;
    expect(uncategorized.isActive).toBe(false);

    // Emptying Uncategorized is refused: the product would have no category.
    const r = await apiJson(request, 'PUT', `/admin/categories/${uncategorized.id}/products`, { token, data: { productIds: [] } });
    expect(r.status).toBe(400);
    expect(r.body.message).toMatch(/can't be removed from Uncategorized/);

    // Restore.
    const back = await apiJson(request, 'PUT', `/admin/categories/${skin.id}/products`, { token, data: { productIds: skinIds } });
    expect(back.status).toBe(200);
  });

  test('collection products API rejects unknown products and IDs', async ({ request }) => {
    const token = state.adminToken!;
    const [col] = (await apiJson(request, 'GET', '/admin/collections', { token })).body.data;
    const bad = await apiJson(request, 'PUT', `/admin/collections/${col.id}/products`, { token, data: { productIds: ['00000000-0000-4000-8000-000000000000'] } });
    expect(bad.status).toBe(400);
    const malformed = await apiJson(request, 'PUT', `/admin/collections/${col.id}/products`, { token, data: { productIds: ['nope'] } });
    expect(malformed.status).toBe(400);
    const noAuth = await apiJson(request, 'PUT', `/admin/collections/${col.id}/products`, { data: { productIds: [] } });
    expect(noAuth.status).toBe(401);
  });

  test('coupon CRUD from the admin UI', async ({ page }) => {
    const assertNoErrors = watchForErrors(page);
    await adminLogin(page);
    await page.goto('/admin/coupons');
    const code = `E2E${RUN}`;

    await page.getByRole('button', { name: /create coupon/i }).click();
    const modal = page.locator('form').filter({ hasText: 'Coupon Code' });
    await modal.getByPlaceholder('e.g. BTC10').fill(code);
    await modal.locator('input[type="number"]').first().fill('15');
    await modal.getByPlaceholder('Optional — no cap').fill('120');
    await modal.getByRole('button', { name: /save coupon/i }).click();
    await expect(page.getByText('Coupon created successfully!')).toBeVisible();

    const row = page.getByRole('row', { name: new RegExp(code) });
    await expect(row).toContainText('15% OFF');
    await expect(row).toContainText('Max ₹120');
    await expect(row).toContainText('—'); // no minimum order

    // Edit → value changes.
    await row.getByTitle('Edit Coupon').click();
    await modal.locator('input[type="number"]').first().fill('20');
    await modal.getByRole('button', { name: /save coupon/i }).click();
    await expect(page.getByText('Coupon updated successfully!')).toBeVisible();
    await expect(row).toContainText('20% OFF');

    // Toggle status.
    await row.getByTitle('Click to toggle status').click();
    await expect(row).toContainText(/inactive/i);

    // Delete.
    await row.getByTitle('Delete Coupon').click();
    await page.getByRole('button', { name: 'Delete', exact: true }).click();
    await expect(page.getByRole('row', { name: new RegExp(code) })).toHaveCount(0);
    assertNoErrors();
  });
});

// ---------- 5. backend rules that the UI can't reach ----------

test.describe('5. Backend order-status rules', () => {
  test('invalid transitions are rejected; concurrent cancels restock once', async ({ request }) => {
    const token = state.adminToken!;
    const customer = (await apiJson(request, 'POST', '/auth/login', { data: CUSTOMER })).body.data.token;
    const place = async () => {
      await apiJson(request, 'POST', '/cart/items', { token: customer, data: { productId: state.productId, quantity: 1 } });
      const r = await apiJson(request, 'POST', '/orders', { token: customer, data: {
        name: CUSTOMER.name, email: CUSTOMER.email, phone: CUSTOMER.phone,
        addressLine1: '12 Botanical Avenue', city: 'Hyderabad', state: 'Telangana', pincode: '500033', paymentMethod: 'COD',
      } });
      expect(r.status, JSON.stringify(r.body)).toBe(201);
      return r.body.data.order;
    };

    const order = await place();
    const list = await apiJson(request, 'GET', `/admin/orders?search=${order.orderNumber}`, { token });
    expect(list.body.data[0].allowedOrderStatuses).toEqual(['CONFIRMED', 'CANCELLED']);
    expect(list.body.data[0].allowedPaymentStatuses).toEqual(['PAID', 'FAILED']);

    const skip = await apiJson(request, 'PATCH', `/admin/orders/${order.id}/status`, { token, data: { orderStatus: 'DELIVERED' } });
    expect(skip.status).toBe(400);
    expect(skip.body.message).toMatch(/Cannot transition from PENDING to DELIVERED/);

    const stockBefore = await productStock(request);
    const results = await Promise.all([1, 2, 3].map(() =>
      apiJson(request, 'PATCH', `/admin/orders/${order.id}/status`, { token, data: { orderStatus: 'CANCELLED' } })));
    const statuses = results.map((r) => r.status).sort();
    expect(statuses.filter((s) => s === 200)).toHaveLength(1);
    expect(statuses.every((s) => s === 200 || s === 400 || s === 409)).toBe(true);
    expect(await productStock(request)).toBe(stockBefore + 1);

    const final = await apiJson(request, 'PATCH', `/admin/orders/${order.id}/status`, { token, data: { orderStatus: 'CONFIRMED' } });
    expect(final.status).toBe(400);
  });
});
