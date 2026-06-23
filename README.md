# North Port Food Truck Calendar

A local food-truck calendar platform. Food trucks pay a small weekly fee to manage their own
profile and weekly schedule; the public gets one place to see which trucks are serving each day.

Built with the same stack as the Affiliate Center project:

- **Backend:** NestJS + MongoDB (Mongoose), JWT auth, class-validator, Swagger, Helmet, Throttler. Local file uploads via Multer.
- **Frontend:** Nuxt 3 + Vue 3 + Pinia + TailwindCSS + Heroicons.

## Project structure

```
backend/    NestJS API (auth, trucks, schedule, admin)
frontend/   Nuxt 3 app (public calendar, owner dashboard, admin dashboard)
```

## Prerequisites

- Node.js 18+
- A MongoDB database. Either:
  - Local MongoDB on `mongodb://localhost:27017/food_truck`, or
  - A MongoDB Atlas cluster — set `MONGODB_URI` in `backend/.env` (you can reuse the same Atlas
    cluster as other projects; just keep the `/food_truck` database name).

## Backend

```bash
cd backend
npm install
cp .env.example .env        # then edit MONGODB_URI / JWT_SECRET
npm run seed                # creates the admin + 6 demo trucks with schedules
npm run start:dev           # http://localhost:3001  (Swagger docs at /docs)
```

Seeded logins (all passwords `ChangeMe123!`):

- **Admin:** `admin@northportmatters.com`
- **Owners:** `rosie@example.com`, `bigdaddy@example.com`, `kona@example.com`, `cafe@example.com`, `tacoexpress@example.com`, `pizza@example.com`

Uploaded logos/photos are stored in `backend/uploads/` and served from `/uploads/...`.

## Frontend

```bash
cd frontend
npm install
cp .env.example .env        # NUXT_PUBLIC_API_BASE=http://localhost:3001
npm run dev                 # http://localhost:3000
```

## Key routes

Public:
- `/` — day calendar (today + Mon–Sun tabs)
- `/food-trucks/:day` — trucks for a specific weekday
- `/directory` — searchable directory with category filters
- `/trucks/:slug` — public truck profile + weekly schedule

Owner (login required):
- `/dashboard`, `/dashboard/profile`, `/dashboard/schedule`, `/dashboard/preview`, `/dashboard/billing`

Admin (admin role):
- `/admin`, `/admin/trucks`, `/admin/trucks/:id`, `/admin/schedule`

## API overview

- `POST /auth/login`, `POST /auth/register`, `GET /auth/me`
- `GET/PATCH /me/truck`, `POST /me/truck/logo|photo`, `GET/POST/PATCH/DELETE /me/truck/schedule`
- `GET /public/trucks`, `GET /public/trucks/:slug`, `GET /public/calendar?day=`, `GET /public/calendar/today`
- `GET/POST/PATCH/DELETE /admin/trucks`, `GET /admin/schedule`, `GET /admin/dashboard`

## Payments

Per the V1 spec, payments are handled manually: an admin sets each truck's `paymentStatus` and
toggles it active. Stripe can be added later.
