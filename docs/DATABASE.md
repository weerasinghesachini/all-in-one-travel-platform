# Database Relationships

PostgreSQL is the source of truth. Prisma schema: `apps/api/prisma/schema.prisma`. IDs are opaque CUID strings, money uses fixed-precision `Decimal(10,2)`, and timestamps are stored as PostgreSQL timestamps. Email, public references, provider transaction references and destination slugs are unique.

## Identity And Access

- `User` has a unique email and hashed password, and may have one `CustomerProfile`, one `ServiceProvider`, and one `Driver` profile.
- `UserRole` joins `User` and `Role` using a composite primary key. `Role.name` is an enum-backed unique role name.
- A customer owns rides, rentals, orders, reservations, trip plans, payments, notifications and reviews.
- `ServiceProvider` owns vehicles and restaurants. `Driver` may be assigned to many ride bookings.

## Travel And Services

- `Vehicle` belongs to a service provider and has many `VehicleRental` records. Rental records include a date range, status, reference, customer and quoted total.
- `RideBooking` belongs to a customer and may be assigned to a driver. It records route labels/coordinates, category, estimate, schedule, status and reference.
- `Restaurant` belongs to a service provider. It has food categories/items, tables, orders and reservations.
- `FoodCategory` belongs to a restaurant; `FoodItem` belongs to both restaurant and category. `FoodOrder` belongs to a customer and restaurant and contains `OrderItem` rows with a quantity and price snapshot.
- `RestaurantTable` belongs to a restaurant. `TableReservation` belongs to a customer and restaurant and may reference an allocated table.
- `TripPlan` belongs to a customer and contains ordered `TripItineraryItem` rows. An item may reference a catalog `Destination`.

## Payments And Feedback

- `Payment` belongs to a user and identifies a service using `serviceType` plus `serviceId`; it stores provider references, amount, currency and payment status, never card data.
- `Transaction` and `Refund` belong to a payment and preserve gateway references and status history.
- `Notification` belongs to a user. `Review` belongs to a user and uses a service type/reference pair.

Payment and review service references are polymorphic, so PostgreSQL cannot enforce a normal foreign key to several service tables. The API layer must validate that the referenced service exists and belongs to the expected user/provider. The current schema includes booking-range indexes; transactional overlap checks and exclusion constraints should be added with their respective availability workflows.
