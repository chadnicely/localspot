# On The Spot — White-Label Local Discovery Platform

A multi-tenant platform where newsletter **publishers** run branded local discovery hubs
(`northport.onthespot.com`) listing food trucks, businesses, live music, vendors and events.
Three roles: **master admin** (platform owner), **publisher** (local hub owner), and
**listing owner** (business / food truck / vendor).

> Evolved from the single-tenant Food Truck Calendar — same stack, now multi-tenant.

## Stack

- **Backend:** NestJS + MongoDB (Mongoose), JWT auth + role guard, class-validator, Swagger,
  Helmet, Throttler, Multer uploads.
- **Frontend:** Nuxt 3 + Vue 3 + Pinia + TailwindCSS + Heroicons + Leaflet maps.
- **Multi-tenancy:** every tenant-scoped document carries `publisherId`; the active hub is
  resolved from the URL (path-based today, e.g. `/northport/...`; subdomain-ready).

## Run it (zero config)

No database needed — the demo launcher boots an in-memory MongoDB and seeds it.

```bash
cd backend && npm install && npm run start:demo   # API on :3001, Swagger at /docs
cd frontend && npm install && npm run dev          # site on :3000
```

### Demo logins (all passwords `ChangeMe123!`)

- **Master admin:** `admin@onthespot.com` → `/admin`
- **Publisher (North Port):** `publisher@northportmatters.com` → `/publisher`
- **Publisher (West Valley):** `publisher@westvalley.com`
- **Listing owner:** `rosie@example.com` → `/dashboard`

### Demo hubs

- `http://localhost:3000/northport` — North Port Matters (FL), red theme
- `http://localhost:3000/westvalley` — West Valley Shoutouts (AZ), teal theme

## Routes

**Platform:** `/` (landing) · `/claim` (publisher claim) · `/login`

**Public hub** (`/:hub`): home · `/calendar` (month grid + map) · `/food-trucks` ·
`/businesses` · `/listings/:slug` (profile + schedule + map) · `/add` (listing claim)

**Master admin** (`/admin`): overview · publishers · pending claims · listings

**Publisher** (`/publisher`): overview · listings · pending claims · calendar · branding

**Listing owner** (`/dashboard`): my listings → edit profile + photos + schedule (map pin picker)

## Flows

- **Publisher claim:** `/claim` → pending → master admin approves → publisher manages their hub.
- **Listing claim:** hub `/add` → pending → publisher approves → appears on the public hub.
- **Payments:** deferred (Phase 2) — manual approval for now.

## Production

Set `MONGODB_URI` in `backend/.env` (local Mongo or Atlas), then `npm run seed` + `npm run start:dev`.
Real subdomains (`northport.onthespot.com`) are a routing/middleware change — tenant resolution
is already centralized in `usePublisher` (frontend) and `PublishersService.resolveApproved` (backend).

## Phase 2 (next)

Events model + Events page · Live Music & Vendors pages · richer business directory ·
map clustering / "Open Now" · subdomain middleware · Stripe billing.
