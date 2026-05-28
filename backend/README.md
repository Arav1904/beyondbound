# Beyond Bound Backend

Express + MongoDB API for auth, cart, orders, products, support, testimonials, admin dashboard, and audit logs.

## Quick Start

1. Install dependencies

```bash
cd backend
npm install
```

2. Configure environment

```bash
cp .env.example .env
```

Set at least:

- `MONGODB_URI`
- `GOOGLE_CLIENT_ID`
- `JWT_SECRET`
- `CORS_ORIGIN`
- `ADMIN_ALLOWLIST`

Optional for automated customer confirmation emails via Zapier/Make webhook:

- `ORDER_CONFIRMATION_WEBHOOK_URL`
- `ORDER_CONFIRMATION_WEBHOOK_SECRET` (optional shared secret header)
- `ORDER_CONFIRMATION_WEBHOOK_SOURCE` (optional, default: `beyond-bound-backend`)
- `ORDER_CONFIRMATION_WEBHOOK_TIMEOUT_MS` (optional, default: `5000`)

PayU hosted checkout (required when using PayU):

- `PAYU_MERCHANT_KEY`
- `PAYU_MERCHANT_SALT`
- `PAYU_CALLBACK_URL` (backend endpoint that receives PayU POST callbacks)
- `PAYU_RETURN_URL` (frontend page to redirect after callback)
- `PAYU_ENV` (optional: `test` or `production`)
- `PAYU_BASE_URL` (optional override for the PayU payment URL)
- `PAYU_SESSION_TTL_MINUTES` (optional, default: `30`)

3. Run backend

```bash
npm run dev
```

Server: `http://localhost:5000`

## Key Scripts

- `npm run dev` - Run with nodemon
- `npm run start` - Run once with node
- `npm run test` - Backend syntax checks
- `npm run bootstrap:admin` - Promote/create admin user from `ADMIN_BOOTSTRAP_EMAIL`

## Admin Bootstrap

To bootstrap admin for `beyondbound889@gmail.com`:

1. Ensure `.env` includes:

```env
ADMIN_BOOTSTRAP_EMAIL=beyondbound889@gmail.com
ADMIN_ALLOWLIST=beyondbound889@gmail.com
```

2. Run:

```bash
npm run bootstrap:admin
```

The script creates or updates that user with role `admin`.

## API Overview

Public:

- `GET /api/health`
- `GET /api/products`
- `GET /api/products/featured/primary`
- `GET /api/products/:identifier`
- `GET /api/testimonials`
- `POST /api/testimonials`
- `POST /api/support`

Authenticated user:

- `POST /api/auth/google`
- `GET /api/auth/me`
- `PUT /api/auth/profile`
- `GET /api/cart`
- `POST /api/cart/items`
- `PATCH /api/cart/items/:itemId`
- `DELETE /api/cart/items/:itemId`
- `DELETE /api/cart`
- `POST /api/cart/merge`
- `POST /api/orders` (place order from cart)
- `POST /api/orders/place` (alias)
- `GET /api/orders/my`

Admin (`requireAdmin` + allowlist):

- `GET /api/admin/overview`
- `GET /api/admin/analytics`
- `GET /api/admin/audit-logs`
- `GET /api/admin/users`
- `PATCH /api/admin/users/:id`
- `GET /api/admin/orders`
- `PATCH /api/admin/orders/:id/status`
- `GET /api/admin/products`
- `POST /api/admin/products`
- `PUT /api/admin/products/:id`
- `DELETE /api/admin/products/:id`
- `GET /api/admin/support`
- `PATCH /api/admin/support/:id`
- `GET /api/admin/testimonials`
- `GET /api/testimonials/admin/all`
- `PUT /api/testimonials/admin/:id`
- `DELETE /api/testimonials/admin/:id`

## Security Defaults

- Helmet enabled
- Global API rate limit (`RATE_LIMIT_MAX`)
- Auth-specific rate limit (`AUTH_RATE_LIMIT_MAX`)
- CORS allowlist enforcement (`CORS_ORIGIN` comma-separated)

## Notes

- Order lifecycle uses standard purchase statuses (`placed`, `confirmed`, `packed`, etc.)
- Audit logging is enabled for auth, support, testimonials, order creation, and admin mutations

## Automated Confirmation Webhook

If `ORDER_CONFIRMATION_WEBHOOK_URL` is configured, the backend will POST a webhook payload immediately after successful order creation from:

- `POST /api/orders`
- `POST /api/orders/place`

The payload includes fields designed for no-code mapping, such as:

- `customer_email`, `customer_name`, `order_number`, `order_date`, `order_status`
- `items_summary`, `item_count`, `items`
- `total`, `subtotal`, `shipping_fee`, `tax_amount`, `discount_amount`

Use these fields directly in Zapier/Make to send a customer confirmation email from the admin mailbox.
