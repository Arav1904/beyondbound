# Beyond Bound

Beyond Bound is a React + Vite storefront with a Node/Express + MongoDB backend supporting:

- Google sign-in auth
- Account profile and address management
- Cart persistence per account
- Order lifecycle and order history
- Admin dashboard (users, orders, products, support, testimonials, analytics, audit logs)

## Project Structure

- `src/` - Frontend app
- `backend/` - API server and MongoDB models/controllers/routes

## Run Locally

1. Install frontend dependencies

```bash
npm install
```

2. Install backend dependencies

```bash
cd backend
npm install
```

3. Configure environment files

- Frontend: copy `.env.example` to `.env` (or `.env.local`)

```bash
cp .env.example .env
```

```env
VITE_API_BASE_URL=http://localhost:5000/api
VITE_GOOGLE_CLIENT_ID=647437966024-0ubbv4rmbennr1some8g5o2agr3poanh.apps.googleusercontent.com
```

- Backend: `backend/.env`

```env
MONGODB_URI=mongodb://localhost:27017/beyond-bound
PORT=5000
NODE_ENV=development
CORS_ORIGIN=http://localhost:5173
GOOGLE_CLIENT_ID=YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com
JWT_SECRET=CHANGE_THIS_TO_A_LONG_RANDOM_SECRET
JWT_EXPIRES_IN=7d
ADMIN_ALLOWLIST=beyondbound889@gmail.com
ADMIN_BOOTSTRAP_EMAIL=beyondbound889@gmail.com
RATE_LIMIT_MAX=250
AUTH_RATE_LIMIT_MAX=40
```

4. Start backend

```bash
cd backend
npm run dev
```

5. Start frontend

```bash
npm run dev
```

## Production (Hostinger)

Frontend runtime config is loaded from `public/env.js`. This lets you set production values
without committing `.env` files.

1. Copy the runtime config template and edit values on the server:

```bash
cp public/env.example.js public/env.js
```

Example `public/env.js`:

```js
(function () {
  window.__APP_CONFIG__ = {
    API_BASE_URL: "https://www.beyondbound.info/api",
    GOOGLE_CLIENT_ID: "YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com",
  };
})();
```

2. Ensure backend env vars are set in Hostinger:

- `MONGODB_URI`
- `GOOGLE_CLIENT_ID`
- `JWT_SECRET`
- `CORS_ORIGIN` (e.g. `https://www.beyondbound.info`)
- `ADMIN_ALLOWLIST`

The frontend falls back to `VITE_API_BASE_URL` at build time, or `window.location.origin + /api`
if none is provided.

## Validation Commands

Frontend:

- `npm run lint`
- `npm run build`
- `npm run test` (runs lint + build)

Backend:

- `cd backend`
- `npm run test` (syntax checks)

## Admin Bootstrap

To ensure the admin account is available:

```bash
cd backend
npm run bootstrap:admin
```

This creates or updates the account in `ADMIN_BOOTSTRAP_EMAIL` as role `admin`.

## Order Workflow

The system is configured for standard ecommerce orders with cart checkout and order status tracking.
