# Wayfarer Travel Platform

Wayfarer brings a trip's transport, stays, rentals, dining and itinerary planning into one travel desk. This repository is a modular monorepo with a Next.js App Router frontend and an Express REST API backed by PostgreSQL and Prisma.

## Architecture

- `apps/web`: Next.js, TypeScript, Tailwind CSS, responsive landing page, customer sign-in/registration, dashboard and ride request form.
- `apps/api`: Express 5 REST API, Zod request validation, bcrypt password hashing, JWT sessions in HttpOnly cookies, role authorization and Prisma access.
- `apps/api/prisma`: PostgreSQL data model and seed data for roles and Sri Lankan destinations.
- `docs`: API contract, database relationships and manual verification steps.

The first working vertical slice is customer registration/login, session inspection/logout, and ride fare estimate/request/history. The schema establishes the remaining rental, restaurant, food, reservation, trip and payment domains. Their provider workflows, map/route integration, live status updates, email, refunds and payment gateway are extension points, not currently implemented integrations. No card numbers are stored.

## Local Setup

Prerequisites: Node.js 20+, npm, and PostgreSQL 15+.

1. Install the monorepo dependencies from the repository root:

   ```powershell
   npm install
   ```

2. Create the API environment file and set a private JWT secret:

   ```powershell
   Copy-Item apps/api/.env.example apps/api/.env
   ```

   Set `DATABASE_URL` to your PostgreSQL database and replace `JWT_SECRET` with a random value of at least 32 characters. `RIDE_BASE_FARE_LKR` and `RIDE_PER_KM_LKR` control server-side ride estimates.

3. Generate Prisma Client, create the initial migration, then seed roles and destinations:

   ```powershell
   npm run db:generate
   npm run db:migrate -- --name init
   npm run db:seed
   ```

4. Start the API and frontend in separate terminals:

   ```powershell
   npm run dev:api
   npm run dev:web
   ```

5. Open `http://localhost:3000`. The frontend proxies `/api/*` to `http://localhost:4000`. To change the API address, set `API_INTERNAL_URL` in `apps/web/.env.local`; set `WEB_ORIGIN` in the API environment to the frontend origin.

For deployment, configure the same environment variables in the hosting providers, use HTTPS, use a managed PostgreSQL database, and configure a shared rate-limit store when running multiple API instances. Never commit `.env` files.

## Authentication And Roles

Registration creates a `CUSTOMER` role and a customer profile. Passwords are bcrypt-hashed. A signed JWT is returned only as an HttpOnly, SameSite cookie; the API also accepts a Bearer token for non-browser clients. Roles are `CUSTOMER`, `ADMIN`, `DRIVER`, `RENTAL_PROVIDER` and `RESTAURANT_OWNER`. Protected API routes use `requireAuth`; use `requireRole(...)` for provider/admin route groups.

See [API documentation](docs/API.md), [database relationships](docs/DATABASE.md), and [testing notes](docs/TESTING.md).
