# On The Spot — White-Label Local Discovery Platform

A multi-tenant platform where the operator provisions **customer accounts**; each account runs
**multiple branded calendars** (Food Trucks first, then Live Music, Markets, Events…), and **each
calendar is its own public site at its own subdomain**. Listings (trucks, bands, vendors) live under
a calendar; their owners manage their own profile + schedule.

## Model

```
Account (customer, white-label brand: logo + colors)
  └── Calendar (vertical: food_truck / musician / …, own subdomain, own public site)
        └── Listing (truck / band / vendor)
              └── ScheduleEntry (day, time, location, map pin)
```

Roles: **master_admin** (platform owner — provisions accounts), **publisher** (account owner — sets
white label, creates calendars, approves listings), **listing_owner** (manages their listing).

## Stack

- **Backend:** NestJS + MongoDB (Mongoose), JWT + role guard, class-validator, Swagger, Helmet,
  Throttler, Multer uploads.
- **Frontend:** Nuxt 3 + Vue 3 + Pinia + TailwindCSS + Heroicons + Leaflet maps.
- **Tenancy:** the public subdomain resolves a **Calendar**; everything scopes by `calendarId`.
  Account-level branding is shared across that account's calendars. Path-based today
  (`/northportfoodtrucks`), subdomain-ready.

## Run it (zero config)

In-memory MongoDB + auto-seed, no database setup:

```bash
cd backend && npm install && npm run start:demo   # API on :3001, Swagger at /docs
cd frontend && npm install && npm run dev          # site on :3000
```

### Demo logins (all `ChangeMe123!`)

- **Master admin:** `admin@onthespot.com` → `/admin`
- **Account owner:** `publisher@northportmatters.com` → `/publisher`
- **Account owner:** `publisher@westvalley.com`
- **Listing owner:** `rosie@example.com` → `/dashboard`

### Demo calendars (public sites)

- `http://localhost:3000/northportfoodtrucks` — North Port Matters (red brand)
- `http://localhost:3000/westvalleyfoodtrucks` — West Valley Shoutouts (teal brand)

## Routes

**Platform:** `/` (landing) · `/login`

**Public calendar** (`/:calendar`): home (today + map) · `/calendar` (month grid) · `/directory` ·
`/listings/:slug` (profile + schedule + map) · `/add` (claim a listing)

**Master admin** (`/admin`): overview · accounts (create/provision) · calendars · listings

**Account / publisher** (`/publisher`) — with a **calendar workspace switcher** in the sidebar:
overview · listings · pending claims · schedule · **calendars** (create with subdomain) · **white label**

**Listing owner** (`/dashboard`): my listings → edit profile + photos + schedule (map pin picker)

## Flows

- **Provision an account:** master admin → Accounts → New account (creates the owner login, shows
  temp password to hand off). No public self-signup.
- **Set up white label + calendars:** account owner logs in → White Label (logo/colors) → Calendars
  (create one per vertical, each with its own subdomain).
- **Listing claim:** a truck uses a calendar's `/add` → pending → account approves (in that
  calendar's workspace) → live on that calendar's public site.
- **Billing:** not built yet (members first).

## Production

Set `MONGODB_URI` in `backend/.env` (local Mongo or Atlas), then `npm run seed` + `npm run start:dev`.
Real subdomains are a routing/middleware change — tenant resolution is centralized in `useCalendar`
(frontend) and `CalendarsService.resolveActive` (backend).

## Next (Phase 2 ideas)

Events/Live-Music/Vendor verticals fully fleshed out · per-calendar schedule editing in the account
dashboard · map clustering / "Open Now" · subdomain middleware · billing/Stripe.
