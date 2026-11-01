# Testing And Verification

## Local Verification

After installing packages and configuring PostgreSQL, run:

```powershell
npm run db:generate
npm run db:migrate -- --name init
npm run db:seed
npm run build
npm run lint
```

Start `npm run dev:api` and `npm run dev:web` in separate terminals. Confirm `GET http://localhost:4000/api/health` returns `{ "status": "ok", "service": "wayfarer-api" }`.

## Authentication And Ride Smoke Test

1. Register from `/login?mode=register`; verify a customer row, customer profile and `CUSTOMER` role join are created.
2. Log out and sign in with the same account. Invalid password should return a generic `401`; duplicate registration should return `409`.
3. Request an estimate from `/api/v1/rides/estimate?distanceKm=10`; confirm the amount matches the configured base plus per-kilometre rate.
4. From `/rides/new`, create a ride request and confirm it appears in the dashboard with a `WFR-` reference and `REQUESTED` status.
5. Confirm an unauthenticated ride list/create returns `401`; confirm one user's ride list never returns another user's rides.
6. Submit invalid email, short password, missing ride locations, and out-of-range distance; confirm validation errors are returned without creating rows.
7. Test responsive layouts at narrow mobile width and desktop width; check system light and dark color schemes.

## Current Coverage

This foundation does not yet include automated unit/integration suites. Add API tests with a disposable PostgreSQL database before extending provider, payment or booking-availability workflows. The manual steps above are smoke checks, not a substitute for automated tests. No payment gateway or live Google Maps key is configured in this repository.
