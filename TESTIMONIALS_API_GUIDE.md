# Testimonials API Guide

This document covers the live testimonials flow and moderation endpoints.

## Base URL

- Local backend: `http://localhost:5000/api`

## Public Endpoints

### GET `/testimonials`

Returns approved, verified testimonials for storefront display.

Example response:

```json
{
  "success": true,
  "count": 2,
  "data": [
    {
      "_id": "67f0f3ea8bd4b221ae0f1a10",
      "name": "Naina Sharma",
      "role": "Verified Customer",
      "quote": "Energy crashes are gone.",
      "rating": 5,
      "verified": true,
      "status": "approved"
    }
  ]
}
```

### POST `/testimonials`

Creates a pending testimonial.

Request body:

```json
{
  "name": "John Doe",
  "quote": "This helped me stay consistent.",
  "rating": 5,
  "role": "Verified Customer"
}
```

Validation:

- `name`: required, min 2 chars
- `quote`: required, 10-500 chars
- `rating`: optional, integer 1-5

## Admin Endpoints

These endpoints require admin authentication and allowlist access.

Headers:

```http
Authorization: Bearer <JWT>
Content-Type: application/json
```

### GET `/testimonials/admin/all`

Query params:

- `page`, `limit`
- `search`
- `status` (`pending`, `approved`, `rejected`)

### PUT `/testimonials/admin/:id`

Moderates or edits testimonial fields.

Request body examples:

```json
{
  "status": "approved",
  "moderationNote": "Approved by admin"
}
```

```json
{
  "verified": false,
  "quote": "Updated quote text"
}
```

Notes:

- Setting `status` updates `verified` automatically
- Setting `verified` without `status` maps to `approved`/`rejected`

### DELETE `/testimonials/admin/:id`

Removes a testimonial document.

## Admin Dashboard Integration

The admin dashboard uses:

- `GET /api/admin/testimonials` for listing
- `PUT /api/testimonials/admin/:id` for approve/reject
- `DELETE /api/testimonials/admin/:id` for delete

## Environment Checklist

Backend `.env` must include:

- `MONGODB_URI`
- `GOOGLE_CLIENT_ID`
- `JWT_SECRET`
- `ADMIN_ALLOWLIST`

Frontend `.env.local`:

```env
VITE_API_BASE_URL=http://localhost:5000/api
```

## Troubleshooting

- `401/403` on admin routes: verify JWT, `role=admin`, and `ADMIN_ALLOWLIST` email match.
- Empty public testimonials: ensure entries are moderated to `status=approved`.
- Validation errors: confirm quote length and rating bounds.
