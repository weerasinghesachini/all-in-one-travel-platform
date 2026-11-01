# API Documentation

Base URL: `http://localhost:4000/api`. The browser frontend uses the same paths through the Next.js rewrite. JSON request bodies are limited to 1 MB. Authenticated browser calls use the `wayfarer_token` HttpOnly cookie; send `Authorization: Bearer <token>` for non-browser clients.

## Health

| Method | Path      | Auth | Purpose       |
| ------ | --------- | ---- | ------------- |
| GET    | `/health` | No   | API readiness |

## Authentication

Authentication routes are rate-limited to 10 attempts per IP per 15 minutes. A production multi-instance deployment should replace the in-memory limiter store with Redis or another shared store.

| Method | Path                | Auth | Purpose                                     |
| ------ | ------------------- | ---- | ------------------------------------------- |
| POST   | `/v1/auth/register` | No   | Create a customer and issue session cookie  |
| POST   | `/v1/auth/login`    | No   | Verify credentials and issue session cookie |
| POST   | `/v1/auth/logout`   | No   | Clear the session cookie                    |
| GET    | `/v1/auth/me`       | Yes  | Return current user profile and role names  |

Register body:

```json
{
  "fullName": "Amaya Perera",
  "email": "amaya@example.com",
  "password": "at-least-8-characters"
}
```

Login body:

```json
{ "email": "amaya@example.com", "password": "at-least-8-characters" }
```

Successful register/login returns `{ "user": { "id", "fullName", "email", "roles" } }`. Validation errors return `400`; duplicate email returns `409`; invalid credentials return `401`.

## Ride Requests

| Method | Path                                 | Auth     | Purpose                                     |
| ------ | ------------------------------------ | -------- | ------------------------------------------- |
| GET    | `/v1/rides/estimate?distanceKm=12.5` | No       | Return server-calculated LKR estimate       |
| GET    | `/v1/rides`                          | Customer | List the signed-in customer's ride requests |
| POST   | `/v1/rides`                          | Customer | Create a ride request                       |

Request body:

```json
{
  "pickup": "Bandaranaike International Airport",
  "destination": "Galle Fort",
  "category": "COMFORT",
  "distanceKm": 150.4,
  "scheduledAt": "2026-12-10T08:30:00.000Z"
}
```

`category` defaults to `ECONOMY`; `scheduledAt` is optional. Fare is calculated by the API as `RIDE_BASE_FARE_LKR + distanceKm * RIDE_PER_KM_LKR`; the client cannot set the stored fare. New requests start in `REQUESTED` and receive a unique `WFR-...` reference. Responses contain the persisted ride record. A missing/expired session returns `401`.

## Error Shape

```json
{
  "message": "Check the ride details and try again.",
  "errors": { "pickup": ["..."] }
}
```

Unmatched paths return `404`. Unexpected server errors return a generic `500` response; detailed exceptions are logged server-side, not exposed to clients.

The rental, food, table reservation, itinerary, provider, payment and admin endpoints are not implemented yet; their data models are defined in the Prisma schema for subsequent modules.
