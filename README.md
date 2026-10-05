# JFO Tech

JFO Tech is a Nigerian solar equipment and services storefront built with Next.js App Router, TypeScript, and Tailwind CSS.

## Current delivery: phases 1–4

Phase 1 delivers the storefront foundation: global design tokens, responsive shared header and footer, mobile navigation drawer, and homepage layout. The mobile drawer includes keyboard focus handling, Escape dismissal, backdrop dismissal, route-change dismissal, and body scroll locking.

Phase 2 adds Auth.js v5 credentials and optional Google sign-in, PostgreSQL persistence through Prisma, registration with email verification, password reset, profile and password management, protected account routes, and a Nigerian state/LGA address book.

Phase 3 adds the product/category catalog, twenty seeded solar products, filters and sorting, product details and specifications, a customer wishlist, and a Zustand guest cart persisted in localStorage. When an authenticated customer returns, the guest cart merges into their database cart and subsequent cart changes sync to PostgreSQL.

Phase 4 adds authenticated checkout, server-recalculated totals, state delivery fees, pickup, per-product installation, coupons, pending order creation, Paystack initialization and server verification, an idempotent signed webhook, retries, stock decrement after confirmed payment, and printable receipts/order history.

## Local development

Requirements: Node.js 20.9 or later and npm.

Copy `.env.example` to `.env.local` and configure a PostgreSQL database before using registration or account data. `DATABASE_URL` is required for Prisma. Run `npx auth secret` to generate a strong `AUTH_SECRET`. A verified Resend sender, `RESEND_API_KEY`, and `EMAIL_FROM` are required to deliver verification and password-reset messages. Google sign-in is enabled only when both `AUTH_GOOGLE_ID` and `AUTH_GOOGLE_SECRET` are set. For local Google OAuth, register `http://localhost:3000/api/auth/callback/google` as an authorized redirect URI.

```bash
npm install
npm run db:generate
npm run db:migrate
npm run db:seed
npm run dev
```

Open http://localhost:3000. The shop shows a setup notice when no database URL is configured; account and catalog data require PostgreSQL.

The Prisma schema is in `prisma/schema.prisma`; the initial migration is in `prisma/migrations`. `npm run db:migrate` applies committed migrations. Use `npx prisma migrate dev --name describe_change` when changing the schema locally, review and commit the resulting SQL, then use `npm run db:migrate` in shared/production environments. `npm run db:seed` upserts the sample categories and twenty products. Do not commit `.env.local` or production secrets.

For Paystack test mode, use the test secret/public keys from the Paystack dashboard in `PAYSTACK_SECRET_KEY` and `NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY`. The app redirects to Paystack-hosted checkout; the public key is retained for future inline checkout and is never used to determine prices. Configure the webhook URL as `https://YOUR_DOMAIN/api/webhooks/paystack` (for local testing, expose port 3000 through a secure tunnel and register its HTTPS URL in Paystack). Paystack returns customers to `/api/payments/callback`. Both callback and webhook paths verify the transaction server-side before an order is marked paid. Test card numbers and payment outcomes are maintained in Paystack’s test-mode dashboard.

Quality checks:

```bash
npm run lint
npm run build
```

The homepage currently uses remote Unsplash imagery as visual placeholders. Replace these image sources with JFO Tech product and installation photography before launch. `next.config.ts` permits the Unsplash image host for local development.

## Delivery phases

1. Setup, theme, shared layout, and mobile navigation (complete)
2. Authentication and customer accounts (complete; requires configured PostgreSQL and Resend)
3. Catalog and cart (implemented; requires configured PostgreSQL and a seeded catalog)
4. Checkout and Paystack payments (complete; requires PostgreSQL and Paystack keys)
5. Admin tools
6. SEO, accessibility, performance, and production polish

No unrequested architecture changes are included. Auth.js and PostgreSQL/Prisma provide the account, catalog, and order foundation. Admin tools remain scheduled for phase 5.

## Deployment

The application is structured for Vercel. Add `DATABASE_URL`, `AUTH_SECRET`, `AUTH_URL`, `RESEND_API_KEY`, `EMAIL_FROM`, `PAYSTACK_SECRET_KEY`, `NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY`, and optional Google OAuth variables to the Vercel project environment. Keep `PAYSTACK_SECRET_KEY` server-only. Apply Prisma migrations during deployment before serving traffic and seed delivery zones/products as a controlled setup step. Configure Google’s production callback as `https://YOUR_DOMAIN/api/auth/callback/google` and Paystack’s webhook as `https://YOUR_DOMAIN/api/webhooks/paystack`. The site build can compile without a live database, but account, catalog, and checkout operations require a reachable PostgreSQL database and configured providers.