# AUTO PRO — SYSTEM ARCHITECTURE

## 1. High-Level Architecture

The Auto Pro platform is an end-to-end, multi-tier ecosystem designed to support roadside assistance, scheduled automotive maintenance, spare parts commerce, certified vehicle inspections, and marketplace transactions.

### System Components
- **Customer Mobile App (React Native + TypeScript)**: Cross-platform iOS/Android application offering on-demand roadside assistance, service booking, live mechanic tracking, spare parts store, used vehicle browsing, and digital invoice/service history tracking.
- **Mechanic Mobile App (React Native + TypeScript)**: Driver/mechanic operational tool for dispatch reception, navigation, real-time telemetry publishing during active dispatches, digital inspection reporting, and job status management.
- **Admin Dashboard (React.js + TypeScript)**: Centralized web portal for administrative operations, platform telemetry, RBAC management, dispatch intervention, dispute resolution, dynamic CMS layout configuration, and remote feature flag toggling.
- **Public Website (React.js + TypeScript)**: SEO-optimized customer portal for marketing, direct appointment scheduling, static service pricing guides, vendor onboarding, and customer support.
- **API Backend (Node.js + Express + TypeScript)**: Central application server exposing versioned REST APIs and WebSocket endpoints with unified middleware, transaction management, and business logic.
- **MongoDB Database**: Scalable document-oriented datastore with geospatial indexing (`2dsphere`) for proximity queries, audit logs, and catalog data.
- **Cloud Storage (S3-Compatible)**: Encrypted object store for customer vehicle documents, inspection photos, invoices, and product imagery.
- **Google Maps Platform**: Spatial intelligence provider delivering forward/reverse geocoding, distance matrices, route navigation, and service area boundary verification.
- **Razorpay Payment Gateway**: Secure payment collection handling UPI, cards, net banking, automated webhook verification, and refund lifecycles.
- **Firebase Cloud Messaging (FCM)**: Push notification backbone for instantaneous dispatch alerts, status transition updates, and targeted operational notifications.

### Architecture Overview Diagram
```
                        AUTO PRO
                            |
       +--------------------+--------------------+
       |                    |                    |
   CUSTOMER APP        MECHANIC APP          ADMIN
       |                    |                    |
       +--------------------+--------------------+
                            |
                       API BACKEND
                            |
     +----------+-----------+-----------+----------+
     |          |           |           |          |
  Services  Emergency   Marketplace  Payment     AI
     |          |           |           |          |
     +----------+-----------+-----------+----------+
                            |
                         MongoDB
                            |
        +-------------------+-------------------+
        |                   |                   |
      Maps               Storage          Notifications
```

---

## 2. Backend Architecture

The backend implements a clean, layered architectural pattern ensuring separation of concerns, testability, and deterministic data flow:

```
Routes → Controllers → Services → Repositories → Models → MongoDB
```

### Layer Responsibilities
- **Routes Layer**: Declares API endpoints, HTTP verbs, URL parameters, and attaches route-specific middleware (authentication, RBAC guards, schema validators, rate limiters).
- **Controllers Layer**: Accepts HTTP requests, extracts parameters/body payloads, delegates domain execution to the Services layer, and formats uniform HTTP responses.
- **Services Layer**: Encapsulates core business rules, external service orchestrations (e.g., Razorpay, Maps, FCM), multi-step transaction logic, and domain validations.
- **Repositories Layer**: Mediates data access between domain models and queries, abstracting complex aggregations, projection logic, and Mongoose operations.
- **Models Layer**: Defines typed Mongoose schemas, indexes, schema hooks, and database-level constraints.

### Middleware Pipeline
1. **Request ID Middleware**: Attaches a unique UUID (`X-Request-ID`) to incoming requests for cross-layer distributed tracing.
2. **CORS Middleware**: Enforces whitelist policies for approved domains and mobile app origins.
3. **Security Headers (Helmet)**: Sets standard security HTTP headers.
4. **Rate Limiting**: Throttles abuse via IP-based and user-based bucket rate limiters.
5. **Authentication Middleware**: Verifies JWT bearer access tokens and attaches authenticated user context.
6. **Authorization (RBAC) Middleware**: Validates role access (`CUSTOMER`, `MECHANIC`, `INSPECTOR`, `ADMIN`, `SUPER_ADMIN`).
7. **Request Validation Middleware**: Validates request parameters, query, and payload schemas against Joi/Zod definitions before controller execution.
8. **Logging Middleware**: Logs incoming requests, status codes, execution duration, and metadata using Morgan/Winston.
9. **Global Error Handler**: Sanitizes uncaught errors, standardizes error responses, and prevents internal stack trace leakage in production.

### Directory Structure
```
backend/
├── src/
│   ├── config/          # Environment, database, app configuration
│   ├── controllers/     # Request handling, response formatting
│   ├── routes/          # Route definitions, middleware binding
│   ├── services/        # Business logic
│   ├── repositories/    # Database access layer
│   ├── models/          # Mongoose schemas
│   ├── middleware/      # Auth, validation, error handler, rate limit
│   ├── validators/      # Request validation schemas (Joi/Zod)
│   ├── utils/           # Helpers, formatters, constants
│   ├── errors/          # Custom error classes
│   ├── integrations/    # External services (Maps, Razorpay, FCM, Storage)
│   ├── jobs/            # Background jobs, scheduled tasks
│   └── types/           # TypeScript type definitions
├── tests/
├── .env.example
├── tsconfig.json
├── package.json
└── README.md
```

---

## 3. Database Architecture

The persistence layer uses MongoDB with structured indexing and relational references.

### Core Collections Overview
- **users**: User identities, credentials, profile metadata, roles, notification settings, and status flags.
- **vehicles**: Customer vehicle catalog containing make, model, year, VIN/registration number, and fuel type.
- **addresses**: Saved physical locations with geospatial coordinates for pickup, drop-off, or on-site dispatch.
- **services**: Service offerings, descriptions, estimated duration, base pricing, and required skill levels.
- **service_categories**: Hierarchical taxonomy (Periodic Maintenance, Electrical, Mechanical, Detailing).
- **bookings**: Scheduled workshop or mobile service appointments with lifecycles and assigned mechanics.
- **emergency_requests**: High-priority roadside assistance requests with real-time dispatch state machine.
- **mechanics**: Verified technician profiles, certifications, assigned service areas, and performance metrics.
- **mechanic_locations**: Real-time geospatial location logs with GeoJSON points and `2dsphere` indexes.
- **payments**: Transaction ledgers, payment gateway identifiers, payment method details, and reconciliation logs.
- **invoices**: Itemized billing records, tax calculations (GST), platform charges, discounts, and PDF storage links.
- **notifications**: Persisted push and in-app notifications with read status and payload metadata.
- **products**: Spare parts catalog, SKU, vehicle compatibility mapping, stock quantities, and vendor pricing.
- **carts**: Customer shopping carts for spare parts and accessories with session recovery.
- **orders**: Completed parts orders, fulfillment states, delivery tracking, and payment link references.
- **car_listings**: Pre-owned vehicle marketplace listings, specifications, asking prices, and verification status.
- **inspections**: Inspection job requests linked to certified inspectors and target vehicles.
- **inspection_reports**: Comprehensive vehicle inspection assessments, OBD-II scan data, and graded checklists.
- **reviews**: Rating and feedback entries for service providers, emergency dispatches, and marketplace listings.
- **coupons**: Promotional discount rules, expiry dates, usage quotas, and minimum spend restrictions.
- **feature_flags**: Remote configuration records controlling feature access across client builds.
- **app_config**: Global operational parameters, platform commission rates, dynamic contact details, and system toggles.
- **cms_components**: UI layout schema blocks for home screen banners, emergency tiles, and promotional widgets.
- **service_areas**: Polygons defining supported geographic service zones.
- **audit_logs**: Immutable compliance logs recording administrative operations and state transitions.

---

## 4. Authentication Architecture

Auto Pro enforces secure authentication and authorization:

```
+---------------+              +------------------+              +---------------+
| Client Device | --[ Login ]-> | Auth Controller  | --[ Token ]-> | Local Storage |
|  (App / Web)  |               |  (Access/Refresh)|               | (Secure Store)|
+---------------+              +------------------+              +---------------+
        |                                                                |
        +----[ API Request with Bearer Token ]-----> [ Auth Middleware ] -+
                                                     (Validate JWT)
```

- **Access Tokens**: Short-lived JWTs (~15 minutes) signed with RS256/HS256 containing `userId`, `role`, and session identifier.
- **Refresh Tokens**: Long-lived secure tokens (~7 days) stored encrypted in the database, allowing seamless token rotation.
- **Token Rotation**: Every refresh request revokes the previous refresh token and issues a new pair, detecting reuse attacks.
- **Phone Verification (OTP)**: Time-limited numeric OTPs sent via SMS gateway for primary mobile authentication and critical password reset operations.
- **Role-Based Access Control (RBAC)**: Supported roles:
  - `CUSTOMER`: Standard end-user booking services and ordering parts.
  - `MECHANIC`: Field and garage technicians receiving job dispatches.
  - `INSPECTOR`: Specialized technicians executing vehicle condition inspections.
  - `ADMIN`: Operational personnel handling customer care, dispatches, and catalog updates.
  - `SUPER_ADMIN`: Root-level administrators with full platform control and audit access.
- **Protected Routes**: Middleware verifies signature, expiration, and database-level revocation flags before routing to business logic.

---

## 5. API Architecture

- **Base URL**: `/api/v1/`
- **RESTful Design**: Resource-oriented URLs, standard HTTP verbs (`GET`, `POST`, `PUT`, `PATCH`, `DELETE`).
- **Standardized Response Envelope**:
```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": {},
  "error": null,
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 100,
    "totalPages": 5
  }
}
```
- **Error Response Structure**:
```json
{
  "success": false,
  "message": "Validation failed",
  "error": {
    "code": "INVALID_PAYLOAD",
    "details": ["latitude must be a valid coordinate"]
  }
}
```
- **Versioning Strategy**: URI path versioning (`/v1/`, `/v2/`) ensuring backwards compatibility across legacy client mobile app versions.
- **Request Validation**: Schema parsing (Zod/Joi) rejecting malformed inputs with descriptive 422 HTTP responses.
- **Rate Limiting**: Dual-tier rate limiting protecting authentication routes (strict) and read routes (permissive).
- **CORS Whitelist**: Explicit origin verification rejecting unauthorized cross-origin browser requests.
- **Traceability**: `X-Request-ID` propagated through logs and returned in client response headers.

---

## 6. Mobile Architecture

Both Customer and Mechanic mobile applications are built on React Native using TypeScript:

- **State Management**: Zustand / React Context for reactive UI state, user sessions, active booking state, and cart synchronization.
- **Navigation**: React Navigation (Native Stack + Bottom Tabs) with route-level role-based navigation guards.
- **Secure Token Storage**: Sensitive tokens stored via `react-native-keychain` / `expo-secure-store` (iOS Keychain / Android KeyStore).
- **API Client (Axios)**: Centralized Axios instance with request/response interceptors automatically attaching access tokens and handling `401 Unauthorized` token refresh sequences.
- **Offline Resilience**: Local caching (AsyncStorage / MMKV) for static catalog browsing, cached active bookings, and offline queueing for mechanic status transitions.
- **Location Services**: Geolocation with runtime permission handling, background location tracking (for active mechanic dispatches), and battery-conscious polling intervals.
- **Push Notification Integration**: Firebase Cloud Messaging (FCM) listeners handling background, quit, and foreground notification presentation.

---

## 7. Admin Architecture

- **Framework**: React.js with TypeScript and Vite.
- **Dashboard Telemetry**: Real-time widgets displaying live dispatches, active emergency alarms, daily revenue, mechanic utilization, and customer retention.
- **Role-Based UI Rendering**: Strict UI segregation between `ADMIN` and `SUPER_ADMIN` views (system configuration and payout approval restricted to Super Admins).
- **Entity Management (CRUD)**: Tabular interfaces with sorting, filtering, searching, and CSV export for users, bookings, mechanics, orders, and listings.
- **Feature Flag Console**: Toggle interface allowing real-time feature enablement and rollouts without code deployments.
- **CMS Manager**: Visual component arrangement tool for home screen promotions and banners.
- **Audit Log Viewer**: Non-destructive, searchable audit stream tracking changes to payments, bookings, and user records.

---

## 8. Maps Integration

The platform provides a unified Maps abstraction layer isolating Google Maps Platform dependencies:

```
[ Application Services ]
         │
[ Maps Abstraction Layer ]
  ├── Geocoding & Reverse Geocoding
  ├── Directions & Route Geometry
  ├── Distance Matrix & ETA Estimation
  ├── Places Autocomplete
  └── Service Area Boundary Checking (GeoJSON Polygon)
         │
[ Google Maps Platform APIs ]
```

- **Geocoding & Reverse Geocoding**: Translates street addresses into lat/lng pairs and resolves mechanic GPS coordinates to human-readable street names.
- **Distance Matrix & ETA**: Calculates travel time and distance for mechanic dispatch assignments and customer ETA displays.
- **Service Area Verification**: Validates whether customer locations fall within operational zones using MongoDB geospatial polygon queries (`$geoIntersects`).
- **Provider Location Tracking**: Captures mechanic coordinates strictly during `EN_ROUTE` and `ON_SITE` emergency and service jobs.
- **Customer Map View**: Live rendering of technician location marker, customer marker, polyline route, and updated ETA calculations.

---

## 9. Payment Architecture

Auto Pro integrates Razorpay for secure multi-channel payment processing:

### Payment Flow
```
1. Customer initiates checkout
2. Backend creates Razorpay Order (sets amount, currency, receipt ID)
3. Backend returns orderId to Customer Mobile/Web App
4. Customer completes payment via Razorpay SDK (UPI, Card, NetBanking)
5. Razorpay sends asynchronous Webhook to Backend (`/api/v1/payments/webhook`)
6. Backend verifies cryptographic signature (`X-Razorpay-Signature`)
7. Backend idempotently marks Payment as SUCCESS and updates Booking/Order
8. Backend triggers digital Invoice generation and notification dispatch
```

### Safety Principles
- **Never Trust Client-Side Confirmations**: Payment completion is acknowledged exclusively via verified server-to-server webhooks or direct Razorpay server-side verification calls.
- **Idempotency**: Webhook events are tracked by `event_id` and `razorpay_payment_id` to prevent duplicate processing on webhook retries.
- **Refund Engine**: Dedicated endpoints supporting automated or manual full and partial refunds with balance tracking.
- **Payment Lifecycle States**:
  - `CREATED`
  - `PENDING`
  - `SUCCESS`
  - `FAILED`
  - `REFUNDED`
  - `PARTIAL_REFUND`

---

## 10. Notification Architecture

- **Firebase Cloud Messaging (FCM)**: Primary push notification gateway targeting iOS and Android client applications.
- **Event Triggers**: Push alerts dispatched on:
  - Emergency assistance dispatch and provider assignment
  - Mechanic en-route status and proximity alerts
  - Booking confirmation and scheduled reminder (1 hour prior)
  - Spare parts order shipment and delivery confirmation
  - Payment success and digital invoice readiness
- **In-App Notification Ledger**: Every notification is persisted to the `notifications` collection with read/unread flags and deep-link payload routing.
- **Device Token Lifecycle**: FCM device registration tokens are associated with user records upon login and pruned upon logout or token invalidation.
- **User Preferences**: Architecture structured to allow granular opt-in/opt-out for marketing and operational notifications.

---

## 11. Emergency Assistance Architecture

The Emergency Assistance system functions as an isolated, high-availability workflow separate from regular scheduled bookings:

```
[ Customer SOS ]
       │
[ Emergency Request Created ] (Priority: HIGH)
       │
[ Proximity Engine (2dsphere) ] -> Query available mechanics within radius
       │
[ Dispatch Broadcast / Direct Offer ]
       │
[ Mechanic Accepts ] ──> [ Location Stream Initiated ] ──> [ En Route ] ──> [ On Site ] ──> [ Resolved ]
```

### Emergency Categories
1. `JUMP_START`
2. `BATTERY_PROBLEM`
3. `FLAT_TYRE`
4. `TYRE_REPLACEMENT`
5. `FUEL_EMERGENCY`
6. `BREAKDOWN`
7. `ENGINE_PROBLEM`
8. `ACCIDENT_ASSISTANCE`
9. `TOWING`
10. `OTHER`

### Operational Guarantees
- **Priority Queue**: Emergency operations bypass standard job queues with instant allocation.
- **Live Location Sharing**: Enforces continuous coordinate publishing from the mechanic while responding.
- **Proximity Matching**: Queries available mechanics within expanding search radii (e.g., 5km → 10km → 20km).
- **Dedicated State Workflow**:
  - `REQUESTED` → `SEARCHING_PROVIDER` → `ACCEPTED` → `EN_ROUTE` → `ARRIVED` → `IN_PROGRESS` → `COMPLETED` / `CANCELLED`

---

## 12. Live Tracking Architecture

- **Technology**: WebSocket / Socket.io server layer with Redis adapter support for horizontal clustering.
- **Mechanic Telemetry**: The Mechanic App emits location packets (`latitude`, `longitude`, `heading`, `speed`, `timestamp`) only during active `EN_ROUTE` jobs.
- **Selective Rooms**: Updates are scoped to discrete socket rooms (`job:<bookingId>`) joined solely by the assigned customer and supervisor admins.
- **ETA & Route Updates**: Client app renders the route polyline with smoothed marker interpolation.
- **Automatic Teardown**: Sockets and tracking channels close immediately upon job completion or cancellation to preserve mobile battery and network bandwidth.
- **Network Fallback**: In poor network conditions, coordinates buffer locally on the device and sync in batches upon reconnection.

---

## 13. Feature Flags & Remote Config

Feature toggles allow dynamic enabling/disabling of features at runtime without releasing new mobile app builds:

### Managed Features
- `carService`: Core workshop and home maintenance booking
- `emergencyAssistance`: Master toggle for roadside emergency features
- `jumpStart`: Jump-start assistance category
- `flatTyre`: Flat tyre replacement and puncture repair
- `fuelEmergency`: On-demand fuel delivery
- `towing`: Flatbed and hydraulic towing dispatches
- `spareParts`: E-commerce store for automotive parts
- `usedCars`: Verified pre-owned vehicle marketplace
- `inspection`: Pre-purchase vehicle inspection booking
- `coupons`: Promo codes and discount engine
- `aiAssistant`: Experimental AI automotive diagnostic assistant
- `liveTracking`: Real-time map telemetry
- `onlinePayment`: Razorpay digital payments (toggle to cash-on-delivery fallback)

### Implementation Standards
- **Safe Defaults**: If config servers are unreachable, clients default to conservative, safe fallback configurations.
- **Caching with TTL**: Mobile and web clients cache remote configuration locally (e.g., 10-minute TTL) to minimize server load.
- **Auditability**: Administrative changes to flags require audit logging and support staged percentage rollouts.

---

## 14. CMS Architecture

The platform includes a configuration-driven, component-based Content Management System for dynamic UI layout control:

- **Zero Arbitrary Execution**: Strictly configuration-driven JSON specifications; no arbitrary HTML or JavaScript code execution.
- **Predefined UI Component Catalog**:
  - `HERO_BANNER`: Promotional sliders and main banners
  - `EMERGENCY_BUTTON`: SOS roadside assistance launcher
  - `SERVICE_CARD_GRID`: Featured maintenance packages
  - `PRODUCT_CAROUSEL`: Popular spare parts and accessories
  - `TESTIMONIAL_SLIDER`: Verified customer feedback
  - `PROMO_STRIP`: Limited-time discount tickers
- **Layout Control**: Administrators can reorder, show/hide, set display schedules, and update imagery/links dynamically via the Admin Dashboard.
- **Draft & Versioning**: Supports draft configurations, staging preview, and instant rollbacks.

---

## 15. AI Integration (Future)

An isolated AI subsystem designed for progressive enhancement without introducing single points of failure:

- **Isolated AI Layer**: Implemented as independent microservices or standalone backend modules with strict API contracts.
- **Feature Flag Control**: Each AI module is wrapped in dedicated remote feature toggles.
- **Independent Operation**: All core platform workflows (booking, emergencies, payments) execute seamlessly when AI services are disabled or offline.
- **Rate Limiting & Cost Management**: Strict per-user request quotas on AI endpoints with fallback responses.
- **Planned AI Modules**:
  - **AI Assistant**: Natural language automotive diagnostic guidance and triage.
  - **Damage Detection**: Computer vision model scanning customer-uploaded accident photos to pre-estimate repair costs.
  - **Price Estimation**: Dynamic pricing models based on vehicle age, mileage, and historical market data.
  - **Predictive Maintenance**: Predictive alerts based on vehicle mileage, service history, and model reliability profiles.

---

## 16. Security Architecture

Auto Pro enforces defense-in-depth principles across all platform layers:

- **Authentication & Sessions**: Short-lived JWTs, cryptographically strong refresh tokens stored securely with automatic reuse detection.
- **Role-Based Access Control**: Middleware-enforced authorization rules guarding every private endpoint.
- **Input Validation & Sanitization**: Strict schema validation using Zod/Joi preventing injection attacks and malformed requests.
- **Rate Limiting & DoS Protection**: `express-rate-limit` guarding against brute-force attacks on sensitive endpoints.
- **CORS Protection**: Rigid origin checking permitting only authenticated mobile clients and verified dashboard domains.
- **Secrets Management**: Configuration and API credentials loaded strictly through environment variables; zero hardcoded secrets.
- **Password Security**: Passwords hashed using bcrypt with adaptive salt work factors (minimum 10 rounds).
- **Payment Verification**: Server-side cryptographic signature validation for all Razorpay transactions.
- **File Upload Security**: Strict MIME-type whitelisting, file size caps, and random UUID naming before uploading to cloud object storage.
- **Audit Trails**: Immutable audit logging for all critical operations (payouts, role alterations, order cancellations).
- **Error Sanitization**: Production error responses mask internal database structures and stack traces.

---

## 17. Testing Strategy

Auto Pro maintains a rigorous multi-tier testing protocol:

- **Unit Testing**: Services, utility functions, business logic calculation engines, and validation schemas tested in isolation.
- **Integration Testing**: Route endpoints, middleware chains, and repository queries verified against ephemeral or in-memory MongoDB instances.
- **End-to-End (E2E) Testing**: Critical user journeys verified end-to-end:
  - User registration → Vehicle addition → Service booking → Payment
  - Emergency SOS creation → Mechanic matching → Status transition → Resolution
- **External Mocking**: Mock interfaces for external providers (Google Maps, Razorpay, FCM, S3) ensuring reliable CI runs without external network dependencies.
- **Coverage Goal**: Target minimum 70%+ test coverage across core business services and repositories.
- **Tooling**: Jest, Supertest, React Testing Library.

---

## 18. Deployment Architecture

```
                   [ Cloudflare CDN / DNS ]
                              │
               +──────────────┴──────────────+
               ▼                             ▼
   [ Static Web Hosting ]        [ Containerized API Service ]
   - Admin Dashboard             - Node.js / Express Clusters
   - Public Website              - Reverse Proxy / Load Balancer
                                             │
               +─────────────────────────────┼─────────────────────────────+
               ▼                             ▼                             ▼
      [ MongoDB Atlas ]             [ S3 Cloud Storage ]           [ External Services ]
      - Replica Set                 - Secure Media & Invoices      - Google Maps
      - 2dsphere Indexes                                           - Razorpay
                                                                   - Firebase FCM
```

- **Environment Strategy**: Strict separation of `development`, `staging`, and `production` environments with segregated credentials and databases.
- **Backend Deployment**: Containerized Node.js workloads running on cloud VPS / container services with auto-restart and load balancing.
- **Web Frontend Deployment**: Static React builds hosted on global CDN networks with HTTPS enforcement and asset caching.
- **Mobile Distribution**: Customer and Mechanic applications packaged for Google Play Store and Apple App Store with automated CI/CD pipelines.
- **Database Resilience**: Managed MongoDB Atlas replica sets with automated point-in-time snapshots and daily automated backups.
- **Object Storage**: S3-compatible cloud storage with pre-signed upload URLs and access-controlled buckets.
- **Telemetry & Monitoring**: Application performance monitoring, uptime checks, and centralized log aggregation with automated alerts.
