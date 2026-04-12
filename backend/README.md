# Beyond Bound Backend

Express + MongoDB API for auth, cart, pre-orders, products, support, testimonials, admin dashboard, and audit logs.

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
- `POST /api/orders/preorder-form`
- `POST /api/orders/preorder` (preorder from cart)
- `POST /api/orders/place` (legacy alias)
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

- Order lifecycle now runs in pre-order mode (`preorder_requested`, `preorder_confirmed`, etc.)
- Legacy order statuses (`placed`, `confirmed`, `packed`) are still accepted for compatibility
- Audit logging is enabled for auth, support, testimonials, pre-order creation, and admin mutations
