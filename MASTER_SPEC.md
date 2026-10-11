# AUTO PRO — MASTER SPECIFICATION

> **Version:** 1.0.0  
> **Status:** Approved / Active Baseline  
> **Target Date:** October 2026  
> **Author:** Auto Pro Architecture & Documentation Team  

---

## 1. Project Overview

**Auto Pro** is an enterprise-grade, full-lifecycle automotive service ecosystem designed to simplify vehicle maintenance, roadside emergencies, replacement part procurement, and vehicle transactions. By unifying end-customers, certified technicians, automotive inspectors, and platform administrators within a single cohesive digital architecture, Auto Pro provides transparency, reliability, and real-time execution across the entire automotive ownership journey.

### 1.1 Target Platforms
- **Mobile Applications:** Android & iOS (Native cross-platform execution via React Native)
- **Web Applications:** Modern Web Desktop & Mobile Browsers (React.js + TypeScript)
- **API Engine:** High-throughput Node.js + Express + TypeScript micro-modular REST backend

### 1.2 Core Value Propositions & Offerings
1. **Scheduled & Periodic Car Service Booking:** Doorstep and workshop-based maintenance packages, detailing, inspections, and mechanical repairs with transparent upfront pricing.
2. **On-Demand Emergency Roadside Assistance (SOS):** Rapid-dispatch geolocation engine pairing stranded drivers with nearby mobile mechanics, battery specialists, tyre fitters, and towing partners.
3. **Spare Parts Marketplace:** Multi-vendor e-commerce platform offering OEM and certified OES/aftermarket automotive components with strict vehicle compatibility filtering.
4. **Used Car Marketplace & Verification:** Curated pre-owned vehicle marketplace featuring verified listings, ownership history, and condition scoring.
5. **Certified Car Inspection Service:** Comprehensive digital multi-point inspections conducted by vetted automotive inspectors, producing tamper-evident PDF condition reports.

---

## 2. Applications

The platform is structured into five dedicated, decoupled client and server applications:

| Application | Technology Stack | Target Platforms | Primary Responsibilities |
| :--- | :--- | :--- | :--- |
| **Customer Mobile** | React Native, TypeScript, React Navigation, Redux Toolkit | iOS & Android | Service search & booking, SOS emergency request, live technician tracking, parts marketplace checkout, used car browsing, digital invoices & service history. |
| **Mechanic Mobile** | React Native, TypeScript, Background Geolocation, Redux Toolkit | iOS & Android | Job broadcast discovery, lead acceptance/rejection, turn-by-turn navigation, job lifecycle state transitions, live telemetry streaming (active jobs only), digital job cards & earnings. |
| **Admin Dashboard** | React.js, TypeScript, Vite, Tailwind CSS, TanStack Query | Web (Desktop) | Operational control tower, mechanic onboarding & KYC verification, emergency dispatch monitoring, catalog & pricing management, role governance, refunds, audit trail inspection. |
| **Public Website** | React.js, TypeScript, Vite, Tailwind CSS, SEO SSR/SSG | Web (Desktop & Mobile) | Brand discovery, service catalog showcase, used car catalog portal, customer web booking entrypoint, mechanic onboarding portal, public legal/CMS pages. |
| **Backend API** | Node.js, Express, TypeScript, Mongoose, Socket.IO / SSE | Cloud Linux Container (Node 20+ LTS) | Centralized RESTful API, authentication & authorization engine, business logic layer, payment verification, notification dispatcher, real-time tracking engine, PDF generation. |

---

## 3. Infrastructure

The platform leverages resilient, production-hardened cloud services designed for high availability, low latency, and horizontal scalability:

```
+-----------------------------------------------------------------------------------+
|                                 CLIENT CLIENTELE                                  |
|   Customer App (RN)   Mechanic App (RN)   Admin Dashboard (React)   Public Web    |
+-----------------------------------------------------------------------------------+
                                          |
                                   HTTPS / WSS / TLS
                                          v
+-----------------------------------------------------------------------------------+
|                        API GATEWAY & BACKEND REST ENGINE                          |
|                       Node.js + Express + TypeScript API                          |
+-----------------------------------------------------------------------------------+
      |               |                 |                 |                |
      v               v                 v                 v                v
+-----------+   +-----------+    +-------------+   +-------------+   +-------------+
|  MongoDB  |   | S3-Compat |    | Google Maps |   |  Razorpay   |   | Firebase    |
|  Cluster  |   |  Storage  |    |  Platform   |   |   Payment   |   |  FCM Push   |
| (Database)|   | (Objects) |    |  (Location) |   |  (Gateway)  |   | (Alerts)    |
+-----------+   +-----------+    +-------------+   +-------------+   +-------------+
```

### 3.1 Database: MongoDB
- **Engine:** MongoDB (v7.0+ Replica Set / Atlas Tier M10+).
- **Object Modeling:** Mongoose ODM with strictly typed schemas and validators.
- **Geospatial Capabilities:** Geospatial 2dsphere indexing for lightning-fast `$nearSphere` queries powering mechanic dispatch and service radius boundaries.
- **Data Integrity:** Database transactions (`session.withTransaction()`) for multi-document operations (booking confirmation, inventory deduction, payment processing).

### 3.2 Cloud Storage: S3-Compatible Object Store
- **Providers:** AWS S3 / Cloudflare R2 / MinIO.
- **Use Cases:** Secure storage of vehicle registration documents, mechanic KYC credentials, service inspection photo attachments, user avatars, and generated PDF invoices.
- **Access Control:** Private buckets by default; presigned expiring URLs for sensitive customer documents; CDN-cached public assets for marketplace imagery.

### 3.3 Location & Maps: Google Maps Platform
- **Places API & Geocoding:** Instant address autocomplete, reverse geocoding for doorstep service coordinates, and administrative boundary validation.
- **Directions API & Distance Matrix:** Turn-by-turn polyline generation, accurate technician ETA computation, and travel distance billing calculations.
- **Mobile SDKs:** Native Map rendering on React Native with smooth animated location markers.

### 3.4 Payment Processing: Razorpay
- **Integration Mode:** Razorpay Standard Checkout & Custom Orders API.
- **Cryptographic Verification:** Server-side HMAC-SHA256 signature verification on payment completions and webhooks.
- **Capabilities:** Credit/Debit Cards, UPI, NetBanking, digital wallets, automated webhooks, and idempotent refund pipelines.

### 3.5 Push Notifications: Firebase Cloud Messaging (FCM)
- **Targeting:** Direct device targeting via validated FCM registration tokens and topic broadcasting for regional updates.
- **Platforms:** Apple Push Notification service (APNs via FCM) and Android FCM channels with high-priority message payloads for emergency alerts.

### 3.6 Authentication Infrastructure
- **Token Mechanism:** Dual-token model featuring short-lived JSON Web Tokens (JWT, 15m lifetime) and securely rotated Refresh Tokens (7d lifetime) stored in cryptographically hashed database records.
- **Mobile OTP Engine:** SMS/WhatsApp OTP verification with strict time-window expiry (3 minutes) and rate-limited dispatch attempts.

---

## 4. Core Modules

### 4.1 Authentication & Authorization
- **Scope:** Multi-channel authentication supporting Mobile OTP, Email/Password, and Social Auth.
- **Tokens:** Stateless short-lived JWT access tokens accompanied by stateful, single-use refresh token rotation.
- **Access Control:** Role-Based Access Control (RBAC) middleware verifying permissions against user entity roles before request handling.

### 4.2 Users
- **Entities:** Customers, Mechanics, Inspectors, Admins, and Super Admins.
- **Features:** Profile data management, contact verification, profile photo uploads, notification preferences, account deactivation, and soft-deletion policies.

### 4.3 Vehicles
- **Scope:** Customer digital garage managing multiple owned vehicles.
- **Data Attributes:** Registration Number, Brand/Make, Model, Sub-model/Variant, Fuel Type (Petrol, Diesel, CNG, Electric, Hybrid), Year of Manufacture, Transmission (Manual/Automatic), VIN/Chassis Number.
- **Compliance Tracking:** Insurance policy number & expiry date, Pollution Under Control (PUC) certificate number & renewal date with automated push reminders.

### 4.4 Addresses
- **Scope:** Multiple address book entries per user (e.g., "Home", "Office", "Garage").
- **Precision:** Geo-coordinates (`latitude`, `longitude`), formatted street address, building/flat details, landmark, postal code, city, and state.
- **Operational Integration:** Auto-validation against active operational service zones.

### 4.5 Services Catalog
- **Hierarchy:** Categorized service taxonomy (e.g., Periodic Maintenance, AC Service, Brake System, Tyres & Wheels, Detailing, Mechanical Overhaul).
- **Service Entity:** Title, description, estimated time of completion, inclusions/exclusions list, recommended interval (mileage/months), base pricing, and applicable car-segment multipliers.

### 4.6 Bookings
- **Workflow:** End-to-end service lifecycle governance supporting both doorstep and workshop fulfilment.
- **Finite State Machine:**
  ```
  PENDING ---> CONFIRMED ---> ASSIGNED ---> ACCEPTED ---> EN_ROUTE
                                                              |
                                                              v
  COMPLETED <--- IN_PROGRESS <-------------------------- ARRIVED
  
  [Terminal / Failure States: CANCELLED, REJECTED, FAILED, NO_SHOW]
  ```
- **State Semantics:**
  - `PENDING`: Service selected, awaiting time slot confirmation and payment commitment.
  - `CONFIRMED`: Slot reserved and scheduled.
  - `ASSIGNED`: Job routed to qualified nearby technician/workshop.
  - `ACCEPTED`: Technician acknowledges and accepts dispatch.
  - `EN_ROUTE`: Technician is traveling toward customer vehicle location.
  - `ARRIVED`: Technician has arrived at customer premises/vehicle.
  - `IN_PROGRESS`: Physical inspection and service execution underway.
  - `COMPLETED`: Work verified, job card closed, final payment settled.
  - `CANCELLED`: Aborted by customer or admin prior to job start.
  - `REJECTED`: Declined by assigned service provider.
  - `FAILED`: Unresolvable mechanical roadblock or breakdown in fulfilment.
  - `NO_SHOW`: Customer or vehicle unavailable at target location.

### 4.7 Emergency Assistance (Roadside SOS)
- **Dispatch Model:** High-priority, real-time geocast to the nearest available emergency response unit.
- **Assistance Categories:**
  - `JUMP_START`: Dead battery boost at breakdown location.
  - `BATTERY_PROBLEM`: Diagnostic testing and emergency battery replacement.
  - `FLAT_TYRE`: Puncture repair on-site.
  - `TYRE_REPLACEMENT`: Spare tyre mounting or new tyre delivery.
  - `FUEL_EMERGENCY`: Emergency fuel delivery (Petrol/Diesel).
  - `BREAKDOWN`: Immediate roadside mechanical triage.
  - `ENGINE_PROBLEM`: Overheating, coolant leaks, engine stall triage.
  - `ACCIDENT_ASSISTANCE`: On-site documentation, safety triage, and legal aid connection.
  - `TOWING`: Flatbed or wheel-lift towing dispatch to the nearest accredited garage.
  - `OTHER`: General roadside technical support.

### 4.8 Mechanics Management
- **Lifecycle:** Self-registration, digital KYC collection (driving license, government ID, certifications), workshop association, background verification, and administrative approval.
- **Availability Engine:** Real-time online/offline toggle, active shift hours, current active job capacity limits, and assigned geographic service polygons.
- **Financials:** Mechanic wallet, commission breakdown, daily payout settlement reports.

### 4.9 Mechanic Location Tracking
- **Privacy-by-Design Rule:** Telemetry tracking is active **strictly and exclusively** during active, accepted jobs (`EN_ROUTE` through `ARRIVED`).
- **Telemetry Ingestion:** High-efficiency GPS streaming with distance/time throttling, battery-conscious location listeners, and automatic teardown upon job termination.

### 4.10 Live Tracking
- **Customer Map Experience:** Real-time visual display of assigned mechanic position moving along Google Directions route polyline.
- **Telemetry Delivery:** Low-latency bi-directional sockets / Server-Sent Events with fallback to polling. Dynamic ETA recalculation based on live traffic conditions.

### 4.11 Payments
- **Gateway Integration:** Native Razorpay integration supporting orders, webhooks, and automatic retries.
- **Integrity Protocol:** Server-side HMAC validation prevents client-side tampering. Zero trust in frontend client callbacks.
- **Transactions & Ledger:** Transaction history recording order ID, payment ID, signature, payment method, tax components, and refund states.

### 4.12 Invoices
- **Engine:** Server-side headless PDF rendering engine generating professional, printable tax invoices.
- **Identification:** Sequential, audit-compliant unique invoice sequence numbering (e.g., `INV-2026-000001`).
- **Composition:** Line-item breakdown of labor charges, parts consumed, platform fees, applicable taxes (CGST/SGST/IGST), applied discount vouchers, and payment receipt metadata.
- **Archival:** Permanent storage in S3 object store with signed download URLs.

### 4.13 Notifications
- **Channels:** FCM Push Notifications, In-App Notification Feed, SMS, and Email.
- **In-App Notification Feed:** Persisted notification records featuring read/unread flags, deep-linking schema, and category grouping (Orders, Alerts, System, Promotions).
- **Trigger Points:** Status transitions across bookings, emergency dispatches, payment events, and service reminders.

### 4.14 Spare Parts Marketplace
- **E-Commerce Catalog:** Categorized directory of OEM & aftermarket automotive components (Brakes, Suspension, Filtration, Fluids, Electrical, Body Panels).
- **Compatibility Engine:** Rigorous model-year-variant compatibility mapping preventing customers from purchasing incompatible parts.
- **Order Engine:** Multi-item shopping cart, address selector, stock decrement within database transactions, courier tracking integration, and return/exchange management.

### 4.15 Used Cars Marketplace
- **Listings:** Customer and dealership vehicle sales portal with rich photographic galleries, technical specs, vehicle condition disclosures, and pricing.
- **Verification Workflow:** Mandatory administrative moderation and optional certified inspection verification badge before public visibility.
- **Buyer Interaction:** Secure in-app buyer inquiries, inspection report requests, and test-drive scheduling without exposing personal phone numbers.

### 4.16 Car Inspection Service
- **Product:** Professional on-demand vehicle health assessment for pre-purchase evaluation or annual fitness check.
- **Checklist Engine:** Standardized digital checklist encompassing 100+ inspection points:
  - Powertrain & Engine Bay
  - Transmission & Drivetrain
  - Brake Systems & Suspension
  - Chassis, Frame & Structural Integrity (Accident damage check)
  - Exterior Paint & Body Panels (Depth gauge measurements)
  - Interior Electronics, Airbags & Controls
  - Road Test Diagnostic Feedback
- **Deliverables:** High-resolution photo evidence repository, vehicle condition score, and instantly generated downloadable PDF Inspection Report.

### 4.17 Reviews & Ratings
- **Scoring:** 1 to 5 star rating scale paired with structured feedback tags and textual commentary.
- **Authenticity:** Restricted to verified completed bookings or confirmed parts purchases.
- **Reputation System:** Aggregate score computation updating mechanic and workshop public ratings.

### 4.18 Coupons & Discounts
- **Rules Engine:** Promo code validation supporting percentage-based discounts, flat-rate deductions, maximum cap limits, and minimum order values.
- **Targeting:** First-time user codes, service-specific discounts, vehicle-brand promotions, and single-use redemption tracking.

### 4.19 Admin Dashboard Control Tower
- **Operations:** Unified desktop web interface for platform administrators.
- **Panels:** Real-time emergency monitoring console, booking oversight, mechanic KYC review & approval queue, service catalog editor, user management, financial ledger, and platform analytics.

### 4.20 Feature Flags
- **Dynamic Control:** Centralized remote feature toggling enabling or disabling application capabilities without redeploying code.
- **Targeting Criteria:** Platform-specific (iOS vs Android vs Web), user-role targeted, or percentage-based rollouts.

### 4.21 Remote Configuration
- **Parameter Control:** Key-value configuration store enabling live adjustment of operational constants (e.g., minimum booking notice window, SOS search radius, support hotline numbers, maintenance mode banners).

### 4.22 Content Management System (CMS)
- **Design:** Configuration-driven structured content engine powering dynamic UI carousels, marketing banners, FAQs, help documents, and legal policies.
- **Safety Rule:** Strictly data-driven JSON payloads; **zero arbitrary JavaScript execution** or un-sanitized HTML rendering.

### 4.23 Service Areas & Geofencing
- **Geographic Governance:** Multi-polygon and radius-based geographic boundaries determining platform operating territories.
- **Validation:** Automatic check ensuring customer booking addresses and emergency incidents fall strictly within defined operational zones.

### 4.24 Pricing Engine
- **Models:** Base service pricing, vehicle-category modifiers (Hatchback vs Sedan vs SUV vs Luxury), distance-based doorstep travel surcharge, and emergency out-of-hours surge pricing.

### 4.25 Customer Support
- **Issue Tracking:** Support ticketing system with categorization (Billing, Service Quality, Mechanic Conduct, Spare Parts Return, Platform Bug).
- **SLA & Escalation:** Priority tiers (Low, Medium, High, Critical/Emergency SOS) with built-in agent assignment and internal resolution notes.

### 4.26 Audit Logs
- **Security & Compliance:** Append-only, immutable audit trail recording every sensitive administrative and system event.
- **Payload Attributes:** Timestamp, Actor ID, Actor Role, Client IP Address, User Agent, Action Type, Target Entity, Before State, and After State.

### 4.27 AI Integration Layer (Future Roadmap)
- **Automotive Assistant:** Conversational diagnostics agent helping car owners troubleshoot symptoms before booking.
- **Visual Damage Detection:** Computer-vision pipeline analyzing exterior car damage photographs to provide instant repair cost estimations.
- **Predictive Maintenance:** Vehicle telemetry and age-based predictive analysis forecasting upcoming component failures.

---

## 5. Architectural Rules

The following ten non-negotiable architectural commandments govern the design, implementation, and maintenance of Auto Pro:

```
[ FRONTEND ]                  [ BACKEND API ]               [ DATABASE ]
Customer App  \              / Business Logic \             /
Mechanic App   ---> [API] ---> Authorization   ---> [ODM] ---> MongoDB
Admin Web     /   (HTTPS/WSS)\ Data Validation/             \
Public Web   /                \ Payment Verify/              \
```

1. **Frontend → API → Backend → Database (Never Direct DB Access):**
   Client applications must never communicate directly with the database or third-party databases. Every data read, creation, update, or deletion must traverse the authenticated, validated Backend API gateway.

2. **Business Logic Lives Exclusively in the Backend:**
   Frontend applications are strictly presentation and interaction layers. All pricing calculations, booking state transitions, commission splits, compatibility verifications, and eligibility checks must execute on the server.

3. **Backend-Verified Payments (Never Trust the Client):**
   No service booking, spare part order, or inspection request shall be marked as paid based on client-side assertions. Every transaction status is finalized exclusively after cryptographic signature verification (HMAC-SHA256) or verified server-to-server webhook confirmation from Razorpay.

4. **Zero Hardcoded Secrets in Source Code:**
   API keys, database URIs, JWT secrets, webhook signing secrets, and encryption keys must never be committed to git repositories. All secrets must be injected through environment variables (`.env` during local development, secure cloud secret managers in staging/production).

5. **Strict Environment Segregation (Dev / Staging / Production):**
   Development, Staging, and Production environments must maintain isolated databases, storage buckets, payment gateway test/live keys, and API hosts. Staging must mirror production configuration exactly.

6. **Mandatory UI States for Every Feature:**
   Every user interface view and component interacting with asynchronous operations must explicitly implement and handle four distinct states:
   - **Loading State:** Skeletons, spinners, or progress indicators.
   - **Success State:** Clear, responsive rendering of data.
   - **Error State:** User-friendly actionable error messaging with retry mechanisms.
   - **Empty State:** Informative empty illustrations and guidance when no data exists.

7. **Mandatory Automated Test Coverage:**
   Every critical business flow (authentication, booking state machines, payment verifications, emergency dispatch, and pricing calculations) must have automated unit and integration tests prior to deployment.

8. **No Premature Implementation of Future Phases:**
   Engineering effort must remain focused on the active development phase. Code abstractions for distant future phases must not be added prematurely before requirements stabilize.

9. **No Unnecessary Rewrites of Working Code:**
   Stable, tested, and functioning code must not be refactored or rewritten for stylistic preferences unless measurable performance, security, or architectural defects are identified.

10. **Living Documentation Synchronized After Every Phase:**
    Architecture specifications, API schemas, and deployment guidelines must be updated immediately upon completion of each development milestone. Code without matching documentation is incomplete.

---

## 6. API Architecture

### 6.1 General Specifications
- **Base URL:** `/api/v1/`
- **Protocol:** RESTful over HTTPS with JSON payloads.
- **Date Format:** ISO 8601 UTC (`YYYY-MM-DDTHH:mm:ss.sssZ`).
- **HTTP Methods:** Standard semantics (`GET`, `POST`, `PUT`, `PATCH`, `DELETE`).

### 6.2 Standardized Response Contract
Every API endpoint must respond with a uniform envelope structure:

```json
{
  "success": true,
  "message": "Operation completed successfully.",
  "data": {
    "bookingId": "651a2b3c4d5e6f7a8b9c0d1e",
    "status": "CONFIRMED"
  },
  "error": null,
  "pagination": {
    "page": 1,
    "limit": 20,
    "totalRecords": 1,
    "totalPages": 1
  }
}
```

#### Error Envelope Example:
```json
{
  "success": false,
  "message": "Invalid request parameters.",
  "data": null,
  "error": {
    "code": "VALIDATION_ERROR",
    "details": [
      {
        "field": "registrationNumber",
        "message": "Vehicle registration number is required."
      }
    ]
  },
  "pagination": null
}
```

### 6.3 Request Validation
- **Schema Validation:** Every inbound request payload (`body`, `query`, `params`) is validated using strict validation schemas (Zod / Joi) before entering controller logic.
- **Fail-Fast:** Requests failing schema validation are rejected immediately with HTTP 422 Unprocessable Entity or HTTP 400 Bad Request.

### 6.4 Rate Limiting & Abuse Prevention
- **Global API Rate Limit:** 100 requests per minute per IP address.
- **Authentication Endpoints:** Strict limit of 5 OTP requests per 10 minutes per mobile number/IP to prevent SMS pumping and brute-force attacks.
- **Storage:** Redis-backed rate limiter with sliding window counters.

### 6.5 CORS & Security Headers
- Strict origin whitelisting allowing only authorized customer web, admin dashboard, and mobile scheme domains.
- Helmet middleware configuration enforcing HSTS, CSP, X-Frame-Options, and X-Content-Type-Options.

### 6.6 Request Correlation & Tracing
- Every request must be tagged with a unique `X-Request-Id` (generated via UUID v4 or propagated from API gateway).
- The correlation ID is logged across all application traces and returned in the response headers for rapid troubleshooting.

---

## 7. Security Requirements

| Security Domain | Standard / Mechanism | Implementation Specification |
| :--- | :--- | :--- |
| **Password Hashing** | Bcrypt / Argon2id | Bcrypt with minimum 10 salt rounds; plain text passwords never stored or logged. |
| **Token Expiry** | Ephemeral Access Tokens | JWT signed with HMAC-SHA256 or RS256; maximum validity period of 15 minutes. |
| **Token Rotation** | Refresh Token Rotation (RTR)| Refresh tokens are single-use; stored as SHA-256 hashes in MongoDB; previous token invalidated upon reuse attempt. |
| **Access Control** | Role-Based Access Control (RBAC)| Express middleware checks user token role against route access rules before delegating execution. |
| **Input Sanitization** | SQL / NoSQL Injection Prevention| Mongoose strict mode enabled; parameter sanitization against MongoDB query operator injection (`mongo-sanitize`); XSS filtering on string inputs. |
| **Error Handling** | Information Leakage Defense | Express global error handler strips stack traces and internal database errors in production; responds with sanitized error codes. |
| **Secret Management** | Zero Leakage Standard | Secrets loaded via environment variables; automated log masking filters prevent tokens, card data, or passwords from entering log files. |
| **Webhook Security** | HMAC Signature Verification | Razorpay webhooks validate `X-Razorpay-Signature` against webhook secret using constant-time cryptographic comparison before processing. |
| **Location Privacy** | Ephemeral Telemetry Window | Mechanics' GPS coordinates are captured and broadcast exclusively while executing an active, accepted emergency or doorstep service job. Background tracking terminates automatically on job completion. |

---

## 8. User Roles & Permissions

The platform defines five distinct security roles:

```
+-----------------------------------------------------------------------------------+
|                                 USER ROLE HIERARCHY                               |
|                                                                                   |
|                                  [ SUPER_ADMIN ]                                  |
|                                         |                                         |
|                                     [ ADMIN ]                                     |
|                                         |                                         |
|                +------------------------+------------------------+                |
|                |                        |                        |                |
|          [ INSPECTOR ]             [ MECHANIC ]             [ CUSTOMER ]          |
+-----------------------------------------------------------------------------------+
```

### 8.1 CUSTOMER
- **Role Code:** `CUSTOMER`
- **Capabilities:**
  - Manage personal profile, vehicles, and multiple addresses.
  - Search and book car services (doorstep & workshop).
  - Trigger emergency roadside assistance requests.
  - Track assigned mechanic in real time on map.
  - Browse and purchase spare parts from the marketplace.
  - Browse used cars and submit purchase inquiries.
  - Book professional vehicle inspections.
  - View service history and download PDF tax invoices.
  - Submit ratings and reviews for completed services.

### 8.2 MECHANIC
- **Role Code:** `MECHANIC`
- **Capabilities:**
  - Submit technician profile, trade certifications, and KYC documents.
  - Toggle duty availability status (Online / Offline).
  - Receive nearby service job broadcasts and emergency SOS alerts.
  - Accept or decline incoming job assignments within time limits.
  - Update job progress states (`EN_ROUTE`, `ARRIVED`, `IN_PROGRESS`, `COMPLETED`).
  - Stream GPS telemetry during active assignments.
  - Generate digital service job cards (parts used, labor performed, recommendations).
  - View individual earnings, performance ratings, and payout summaries.

### 8.3 INSPECTOR
- **Role Code:** `INSPECTOR`
- **Capabilities:**
  - View assigned vehicle inspection appointments.
  - Navigate to vehicle location.
  - Complete digital multi-point inspection checklists (100+ points).
  - Upload photographic and video proof of vehicle condition and defects.
  - Record diagnostic error codes (OBD-II scans) and paint thickness readings.
  - Submit finalized inspection reports for automated PDF compilation.

### 8.4 ADMIN
- **Role Code:** `ADMIN`
- **Capabilities:**
  - Access centralized Admin Dashboard web portal.
  - Verify and approve mechanic onboarding applications and KYC credentials.
  - Oversee active bookings and roadside emergency operations in real time.
  - Manage service catalog, categories, packages, and pricing rules.
  - Review and moderate used car listings submitted by sellers.
  - Manage spare parts catalog, categories, and inventory.
  - Process customer refunds and manage support tickets.
  - View aggregated business metrics, booking volume, and revenue analytics.

### 8.5 SUPER_ADMIN
- **Role Code:** `SUPER_ADMIN`
- **Capabilities:**
  - Full, unrestricted access across all platform services and data.
  - Manage administrator accounts and assign administrative permissions.
  - Configure dynamic Feature Flags and Remote Configuration parameters.
  - Manage CMS layouts, marketing banners, and policy documents.
  - Configure geographic Service Areas and geofenced operating boundaries.
  - Review immutable platform Audit Logs for security compliance.
  - Manage third-party integration credentials and infrastructure configurations.

---

## 9. Development Phases

The project roadmap is organized into 21 structured development phases followed by an AI capabilities expansion:

- **Phase 00: Discovery & Planning** — Architectural definition, database schemas, tech stack alignment, and master specification.
- **Phase 01: Monorepo / Project Foundation** — Monorepo setup, shared TypeScript configurations, linting, formatting, and CI/CD pipelines.
- **Phase 02: Backend Foundation** — Node.js Express TypeScript server setup, error handling middleware, logging, and environment management.
- **Phase 03: Database Foundation** — MongoDB database schemas, Mongoose models, geospatial indexing, seed scripts, and migration helpers.
- **Phase 04: Authentication & Authorization** — Dual-token JWT system, refresh token rotation, mobile OTP verification, and RBAC guards.
- **Phase 05: Customer Profile + Vehicle** — Customer user profiles, multi-address management, and digital garage vehicle registry.
- **Phase 06: Service Catalog + Booking** — Service taxonomy, packages, pricing calculators, time slot management, and booking state machine.
- **Phase 07: Mechanic System** — Mechanic onboarding, KYC submission, approval workflows, duty availability toggles, and service area binding.
- **Phase 08: Emergency Roadside Assistance** — SOS panic flow, emergency categorization, rapid radius broadcasting, and mechanic dispatch.
- **Phase 09: Google Maps + Location** — Google Maps SDK integration, reverse geocoding, address autocomplete, and route polyline generation.
- **Phase 10: Real-Time Live Tracking** — Bi-directional telemetry streaming, dynamic ETA calculation, and live mechanic marker animation on customer map.
- **Phase 11: Payment System** — Razorpay gateway integration, order generation, cryptographic signature verification, and automated refund handling.
- **Phase 12: Invoice + PDF** — Headless PDF generation engine, sequential invoice numbering, GST tax calculation, and S3 archival.
- **Phase 13: Notifications** — Firebase Cloud Messaging push notifications, in-app notification inbox, and transactional email/SMS dispatch.
- **Phase 14: Admin Dashboard** — React Admin web portal with live emergency radar, booking control tower, user management, and KYC review.
- **Phase 15: Feature Flags + Remote Control** — Remote configuration store, platform-targeted feature flag engine, and emergency kill-switches.
- **Phase 16: No-Code Content + Layout** — Data-driven CMS for dynamic banners, service promotions, FAQs, and announcement management.
- **Phase 17: Spare Parts Marketplace** — Multi-category parts catalog, vehicle compatibility engine, shopping cart, and order fulfillment.
- **Phase 18: Used Cars + Inspection** — Pre-owned car listings, multi-point digital inspection checklist, photo uploads, and PDF report generator.
- **Phase 19: Full Testing + Security + Performance** — Comprehensive end-to-end testing, security penetration audit, load testing, and database query optimization.
- **Phase 20: Production Deployment** — Cloud infrastructure provisioning, Docker containerization, staging verification, and production launch.
- **Future: AI Integration Layer** — AI-powered automotive diagnostic assistant, computer-vision damage assessment, and predictive maintenance algorithms.

---

## 10. Quality Standards

To maintain exceptional code quality, architectural consistency, and long-term maintainability across all packages, every contributor must adhere to the following engineering standards:

### 10.1 Code Quality Principles
- **Readability & Maintainability:** Write clean, declarative, and self-documenting code. Favor small, single-responsibility functions over monolithic blocks.
- **Strict Modularity:** Decouple controllers, services, repositories, and data models. Business logic must never bleed into route handlers or UI views.
- **DRY (Don't Repeat Yourself) with Pragmatism:** Reuse common utilities, types, and components; avoid premature over-abstraction.
- **No Unnecessary Enterprise Complexity:** Favor straightforward, idiomatic TypeScript over convoluted design patterns that hinder velocity.

### 10.2 TypeScript Standards
- **Strict Mode Enforced:** `"strict": true` must be enabled across all `tsconfig.json` configurations.
- **No Explicit `any`:** The use of `any` is strictly prohibited. Use `unknown`, generic parameters, or explicit type definitions.
- **Shared Data Contracts:** Domain models, API request/response types, and enumeration values must be shared across frontend and backend packages.

### 10.3 Code Style & Static Analysis
- **Linting & Formatting:** Unified ESLint and Prettier configurations enforced via Git pre-commit hooks (Husky + lint-staged).
- **Naming Conventions:**
  - Files & Folders: `kebab-case` or `PascalCase` for React components.
  - Classes & Interfaces: `PascalCase`.
  - Functions, Variables & Methods: `camelCase`.
  - Constants & Enums: `UPPER_SNAKE_CASE`.

### 10.4 Testing & Reliability
- **Unit Testing:** Comprehensive test coverage for pure utilities, pricing engines, validation schemas, and state transition logic using Jest / Vitest.
- **Integration Testing:** Supertest test suites covering every critical API route, authentication flow, and database mutation.
- **Graceful Error Handling:** Every promise and async operation must be wrapped in structured try-catch blocks or Express async boundary handlers with standardized error responses.

### 10.5 Observability & Logging
- **Structured Logging:** JSON-formatted structured logging (Winston / Pino) capturing timestamp, log level, request correlation ID, and context metadata.
- **Zero Log Contamination:** Sensitive customer PII, passwords, authentication tokens, and payment card details must be filtered and redacted before log emission.
