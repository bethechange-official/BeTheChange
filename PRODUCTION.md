# Be The Change: testing and VPS deployment

This project runs as three parts:

- Neon PostgreSQL stores accounts, catalog records, carts, coupons, settings, and orders.
- Express/Prisma provides both the storefront and protected admin APIs.
- Nginx serves the React build and proxies `/api` and `/uploads` to Express.

Checkout supports **cash on delivery only**. There is no payment gateway, courier integration, email, SMS, or push-notification dependency. Administrators update fulfilment and payment statuses manually.

## 1. Configure Neon for testing

Create a Neon project, open **Connect**, and copy both connection strings:

- Pooled URL: hostname contains `-pooler`; use it as `DATABASE_URL` for the running API.
- Direct URL: hostname does not contain `-pooler`; use it as `DIRECT_URL` for Prisma migrations.

Both URLs must retain `sslmode=require`. Copy `backend/.env.example` to `backend/.env`, then set:

```env
DATABASE_URL="postgresql://USER:PASSWORD@EP-ENDPOINT-pooler.REGION.aws.neon.tech/neondb?sslmode=require&connection_limit=10"
DIRECT_URL="postgresql://USER:PASSWORD@EP-ENDPOINT.REGION.aws.neon.tech/neondb?sslmode=require"
JWT_SECRET="GENERATE_A_RANDOM_SECRET"
REFRESH_TOKEN_SECRET="GENERATE_A_DIFFERENT_RANDOM_SECRET"
FRONTEND_URL="http://localhost:5173"
SEED_ADMIN_EMAIL="your-admin@example.com"
SEED_ADMIN_PASSWORD="a-strong-unique-password"
```

Generate each JWT secret independently:

```bash
openssl rand -base64 48
```

Never commit `.env` or paste its values into the frontend. If Neon provides only one URL initially, select **Pooled connection** for `DATABASE_URL`, then disable pooling in the Connect dialog and copy the direct version for `DIRECT_URL`.

## 2. Initialize and test the database

From `backend`:

```bash
npm ci
npm run prisma:generate
npm run prisma:migrate:deploy
npm run db:seed
npm run dev
```

The seed is idempotent and creates the first administrator, categories, collections, and store settings. It refuses to run unless explicit admin credentials are provided, and `SEED_ADMIN_PASSWORD` must be at least 12 characters. It does not create any products; add those in **Admin → Products**.

In another terminal, from `btc`:

```bash
npm ci
npm run dev
```

Open `http://localhost:5173`. The Vite development proxy sends `/api` and `/uploads` to `http://127.0.0.1:5000`, so VPS-style relative image URLs also work locally.

Useful checks:

```text
http://localhost:5000/api/health    process health
http://localhost:5000/api/ready     database readiness
http://localhost:5173/admin/login   admin login
```

Test this sequence before deployment:

1. Log in as the seeded administrator.
2. Create a category and product, upload a JPG/PNG/WebP/GIF, and confirm its URL starts with `/uploads/products/`.
   Add the product to a collection (Admin → Categories → Collections → Manage Products) and confirm the collection appears as a section on the homepage.
   Add a banner in **Admin → Home Page Sliders** (1200 × 600 px) and confirm it appears below the hero.
3. Register a customer, add the product to the cart, apply a coupon if desired, and place a COD order.
4. Confirm stock decreases and the order appears in both the customer account and admin orders.
5. Cancel the order in admin and confirm stock is restored.

## 3. Prepare the VPS

Install Docker Engine, the Compose plugin, and a TLS reverse proxy such as Caddy. Create persistent image storage outside the Git checkout:

```bash
sudo install -d -o 1000 -g 1000 -m 0750 /var/lib/bethechange/uploads/products
```

The Compose file mounts that host directory at `/data/uploads` in the backend container. Uploaded image files (products, categories, slider banners) are UUID-named, limited to 10 MB each, and checked by MIME type and binary signature. The bundled nginx config allows up to 90 MB only on `/api/admin/upload`; if you put another proxy (e.g. Caddy) in front, it must allow at least 10 MB request bodies. The database stores only relative public links such as `/uploads/products/UUID.webp`.

Copy `backend/.env.example` to `backend/.env.production` and fill in the production PostgreSQL URLs (`DATABASE_URL` pooled, `DIRECT_URL` direct), two new random JWT secrets (`openssl rand -base64 48` each), the real HTTPS origin, and the real administrator email plus a strong unique password (12+ characters):

```env
FRONTEND_URL="https://shop.example.com"
```

## 4. Deploy

From the project root on the VPS:

```bash
docker compose -f docker-compose.production.yml build
docker compose -f docker-compose.production.yml run --rm backend npm run prisma:migrate:deploy
docker compose -f docker-compose.production.yml run --rm backend npm run db:seed:prod
docker compose -f docker-compose.production.yml up -d
```

`db:seed:prod` runs the compiled seed (`dist/seed.js`); the production image contains no TypeScript tooling, so use it instead of `db:seed` there. After the first successful login you may remove `SEED_ADMIN_PASSWORD` from `.env.production`.

If the database was originally created with `prisma db push` (it has tables but no `_prisma_migrations` history), `migrate deploy` stops with error P3005. Confirm the schema matches with a **read-only** diff, then baseline the already-applied migrations with `npx prisma migrate resolve --applied <migration_name>` before deploying. Never point `--shadow-database-url` at a database that holds real data: Prisma wipes the shadow database.

The Compose stack binds the storefront to `127.0.0.1:8080`; it does not expose Express or uploads directly. A minimal Caddy site is:

```caddyfile
shop.example.com {
    reverse_proxy 127.0.0.1:8080
}
```

Point the domain's DNS `A` record to the VPS public IP. Expose only SSH and ports 80/443. Keep port 5000 and the Neon credentials private.

## 5. Release and backup checklist

Before each release:

```bash
cd backend && npm ci && npm run prisma:validate && npm run build
cd ../btc && npm ci && npm run lint && npm run build
```

Back up both systems independently:

- Use Neon restore points/branching or your plan's backup facilities for PostgreSQL.
- Send encrypted, off-VPS backups of `/var/lib/bethechange/uploads` to another machine or object store.

Test a database and image restore periodically. A database backup alone does not contain the uploaded image bytes.

## WhatsApp order alerts (optional)

Every new order can be sent automatically to the admin's WhatsApp (+91 63008 36017) through Meta's WhatsApp
Business Cloud API. It stays off until `WHATSAPP_ACCESS_TOKEN` and `WHATSAPP_PHONE_NUMBER_ID` are set in the
backend environment. Orders work normally either way, and each order in admin shows its WhatsApp status with a
Resend button. Setup steps and the message template to register are in `backend/WHATSAPP.md`.

## End-to-end tests

`tests/full-e2e.spec.ts` drives the real UI against **local** dev servers and creates/changes data, so run it
only against a development database, never production:

```bash
E2E_ADMIN_EMAIL=you@example.com E2E_ADMIN_PASSWORD='…' npx playwright test tests/full-e2e.spec.ts
```

It registers a throwaway customer and creates its own products and coupons, then hides/deletes them afterwards.
