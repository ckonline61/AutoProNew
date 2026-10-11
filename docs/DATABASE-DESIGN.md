# AUTO PRO — DATABASE DESIGN

## Overview
Auto Pro uses MongoDB as its primary database. This document describes all collections, their schemas, relationships, indexes, and constraints.

## Collections

### 1. users
**Purpose:** Store all user accounts (customers, mechanics, inspectors, admins)

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| _id | ObjectId | auto | Primary key |
| name | String | yes | Full name |
| email | String | yes | Email (unique) |
| phone | String | yes | Phone number (unique) |
| password | String | yes | Bcrypt hashed password |
| role | String | yes | CUSTOMER, MECHANIC, INSPECTOR, ADMIN, SUPER_ADMIN |
| avatar | String | no | Profile image URL |
| isActive | Boolean | yes | Account active status |
| isVerified | Boolean | yes | Email/phone verified |
| refreshTokens | Array | no | Active refresh tokens |
| lastLogin | Date | no | Last login timestamp |
| createdAt | Date | auto | Creation timestamp |
| updatedAt | Date | auto | Update timestamp |

**Indexes:** email (unique), phone (unique), role  
**Constraints:** email unique, phone unique, password never stored as plaintext

---

### 2. vehicles
**Purpose:** Customer vehicles

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| _id | ObjectId | auto | Primary key |
| userId | ObjectId | yes | Ref: users |
| registrationNumber | String | yes | Vehicle registration |
| brand | String | yes | Manufacturer |
| model | String | yes | Model name |
| variant | String | no | Variant/trim |
| fuelType | String | yes | PETROL, DIESEL, CNG, ELECTRIC, HYBRID |
| year | Number | yes | Manufacturing year |
| mileage | Number | no | Current mileage |
| insuranceExpiry | Date | no | Insurance expiry date |
| pucExpiry | Date | no | PUC expiry date |
| images | Array<String> | no | Vehicle image URLs |
| isActive | Boolean | yes | Soft delete flag |
| createdAt | Date | auto | Creation timestamp |
| updatedAt | Date | auto | Update timestamp |

**Indexes:** userId, registrationNumber  
**Relationships:** userId → users._id

---

### 3. addresses
**Purpose:** User addresses for service delivery

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| _id | ObjectId | auto | Primary key |
| userId | ObjectId | yes | Ref: users |
| label | String | yes | Home, Office, Other |
| addressLine1 | String | yes | Street address |
| addressLine2 | String | no | Apartment, floor |
| city | String | yes | City |
| state | String | yes | State |
| pincode | String | yes | Postal code |
| latitude | Number | no | Geo coordinate |
| longitude | Number | no | Geo coordinate |
| isDefault | Boolean | yes | Default address flag |
| isActive | Boolean | yes | Soft delete flag |
| createdAt | Date | auto | Creation timestamp |
| updatedAt | Date | auto | Update timestamp |

**Indexes:** userId, { latitude, longitude } (2dsphere if geo queries needed)  
**Relationships:** userId → users._id

---

### 4. service_categories
**Purpose:** Categories for car services

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| _id | ObjectId | auto | Primary key |
| name | String | yes | Category name |
| description | String | no | Category description |
| icon | String | no | Icon URL/name |
| sortOrder | Number | yes | Display order |
| isActive | Boolean | yes | Active flag |
| createdAt | Date | auto | Creation timestamp |
| updatedAt | Date | auto | Update timestamp |

**Indexes:** name (unique), sortOrder

---

### 5. services
**Purpose:** Individual car services offered

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| _id | ObjectId | auto | Primary key |
| categoryId | ObjectId | yes | Ref: service_categories |
| name | String | yes | Service name |
| description | String | yes | Service description |
| shortDescription | String | no | Brief description |
| price | Number | yes | Base price |
| discountedPrice | Number | no | Sale price |
| duration | Number | yes | Estimated duration (minutes) |
| image | String | no | Service image URL |
| features | Array<String> | no | What's included |
| isActive | Boolean | yes | Active flag |
| createdAt | Date | auto | Creation timestamp |
| updatedAt | Date | auto | Update timestamp |

**Indexes:** categoryId, name, isActive  
**Relationships:** categoryId → service_categories._id

---

### 6. bookings
**Purpose:** Car service bookings

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| _id | ObjectId | auto | Primary key |
| bookingNumber | String | yes | Unique booking ID (e.g., BK-20261011-001) |
| customerId | ObjectId | yes | Ref: users |
| vehicleId | ObjectId | yes | Ref: vehicles |
| addressId | ObjectId | yes | Ref: addresses |
| serviceIds | Array<ObjectId> | yes | Refs: services |
| mechanicId | ObjectId | no | Ref: users (assigned mechanic) |
| status | String | yes | PENDING, CONFIRMED, ASSIGNED, ACCEPTED, EN_ROUTE, ARRIVED, IN_PROGRESS, COMPLETED, CANCELLED, REJECTED, FAILED, NO_SHOW |
| scheduledDate | Date | yes | Appointment date |
| scheduledTime | String | yes | Appointment time slot |
| estimatedDuration | Number | no | Minutes |
| estimatedPrice | Number | yes | Estimated total |
| finalPrice | Number | no | Actual total after completion |
| discount | Number | no | Discount amount |
| couponId | ObjectId | no | Ref: coupons |
| notes | String | no | Customer notes |
| cancellationReason | String | no | If cancelled |
| cancelledBy | String | no | CUSTOMER, MECHANIC, ADMIN, SYSTEM |
| statusHistory | Array | no | [{status, timestamp, updatedBy}] |
| paymentId | ObjectId | no | Ref: payments |
| invoiceId | ObjectId | no | Ref: invoices |
| reviewId | ObjectId | no | Ref: reviews |
| createdAt | Date | auto | Creation timestamp |
| updatedAt | Date | auto | Update timestamp |

**Indexes:** bookingNumber (unique), customerId, mechanicId, status, scheduledDate, createdAt  
**Relationships:** customerId → users._id, vehicleId → vehicles._id, addressId → addresses._id, serviceIds → services._id, mechanicId → users._id, couponId → coupons._id, paymentId → payments._id, invoiceId → invoices._id, reviewId → reviews._id

---

### 7. emergency_requests
**Purpose:** Emergency roadside assistance requests

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| _id | ObjectId | auto | Primary key |
| requestNumber | String | yes | Unique (e.g., EM-20261011-001) |
| customerId | ObjectId | yes | Ref: users |
| vehicleId | ObjectId | yes | Ref: vehicles |
| problemType | String | yes | JUMP_START, BATTERY_PROBLEM, FLAT_TYRE, TYRE_REPLACEMENT, FUEL_EMERGENCY, BREAKDOWN, ENGINE_PROBLEM, ACCIDENT_ASSISTANCE, TOWING, OTHER |
| description | String | no | Problem description |
| priority | String | yes | LOW, MEDIUM, HIGH, CRITICAL |
| latitude | Number | yes | Customer location |
| longitude | Number | yes | Customer location |
| address | String | no | Resolved address |
| serviceAreaId | ObjectId | no | Ref: service_areas |
| assignedProviderId | ObjectId | no | Ref: users |
| status | String | yes | PENDING, SEARCHING, ASSIGNED, ACCEPTED, EN_ROUTE, ARRIVED, IN_PROGRESS, COMPLETED, CANCELLED, REJECTED, FAILED, EXPIRED |
| estimatedArrival | Number | no | ETA in minutes |
| estimatedPrice | Number | no | Estimated total price |
| finalPrice | Number | no | Final billed price |
| statusHistory | Array | no | [{status, timestamp, updatedBy}] |
| paymentId | ObjectId | no | Ref: payments |
| invoiceId | ObjectId | no | Ref: invoices |
| reviewId | ObjectId | no | Ref: reviews |
| cancelledBy | String | no | CUSTOMER, MECHANIC, ADMIN, SYSTEM |
| cancellationReason | String | no | Detailed reason if cancelled |
| createdAt | Date | auto | Creation timestamp |
| updatedAt | Date | auto | Update timestamp |

**Indexes:** requestNumber (unique), customerId, assignedProviderId, status, problemType, { latitude, longitude } (2dsphere), createdAt  
**Relationships:** customerId → users._id, vehicleId → vehicles._id, serviceAreaId → service_areas._id, assignedProviderId → users._id, paymentId → payments._id, invoiceId → invoices._id, reviewId → reviews._id

---

### 8. mechanics
**Purpose:** Mechanic/provider profile and professional details

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| _id | ObjectId | auto | Primary key |
| userId | ObjectId | yes | Ref: users |
| specializations | Array<String> | no | Service specializations |
| experience | Number | no | Years of experience |
| documents | Object | no | {aadhaar, pan, license, certifications} |
| serviceAreaIds | Array<ObjectId> | no | Refs: service_areas |
| isAvailable | Boolean | yes | Currently available |
| isOnline | Boolean | yes | Online status |
| isApproved | Boolean | yes | Admin approved |
| approvalStatus | String | yes | PENDING, APPROVED, REJECTED, SUSPENDED |
| rating | Number | no | Average rating |
| totalJobs | Number | no | Completed jobs count |
| totalEarnings | Number | no | Lifetime earnings |
| currentLocation | Object | no | { latitude, longitude, updatedAt } |
| createdAt | Date | auto | Creation timestamp |
| updatedAt | Date | auto | Update timestamp |

**Indexes:** userId (unique), approvalStatus, isAvailable, isOnline, { 'currentLocation.latitude', 'currentLocation.longitude' } (2dsphere)  
**Relationships:** userId → users._id, serviceAreaIds → service_areas._id

---

### 9. payments
**Purpose:** Payment records

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| _id | ObjectId | auto | Primary key |
| orderId | String | yes | Razorpay order ID |
| paymentId | String | no | Razorpay payment ID |
| customerId | ObjectId | yes | Ref: users |
| bookingId | ObjectId | no | Ref: bookings |
| emergencyRequestId | ObjectId | no | Ref: emergency_requests |
| sparePartOrderId | ObjectId | no | Ref: orders |
| amount | Number | yes | Amount in smallest currency unit (paise) |
| currency | String | yes | INR |
| status | String | yes | CREATED, PENDING, SUCCESS, FAILED, REFUNDED, PARTIAL_REFUND |
| method | String | no | UPI, CARD, NETBANKING, WALLET |
| razorpaySignature | String | no | For verification |
| refundId | String | no | Razorpay refund ID |
| refundAmount | Number | no | Refund amount |
| refundReason | String | no | Reason for refund |
| metadata | Object | no | Additional payment data |
| createdAt | Date | auto | Creation timestamp |
| updatedAt | Date | auto | Update timestamp |

**Indexes:** orderId (unique), paymentId (unique, sparse), customerId, status, createdAt  
**Important:** Idempotent handling — duplicate webhook callbacks must not create duplicate records

---

### 10. invoices
**Purpose:** Professional invoices

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| _id | ObjectId | auto | Primary key |
| invoiceNumber | String | yes | Unique sequential (e.g., INV-2026-00001) |
| customerId | ObjectId | yes | Ref: users |
| bookingId | ObjectId | no | Ref: bookings |
| emergencyRequestId | ObjectId | no | Ref: emergency_requests |
| orderId | ObjectId | no | Ref: orders |
| items | Array | yes | [{name, description, quantity, rate, amount}] |
| subtotal | Number | yes | Pre-tax / pre-discount subtotal |
| discount | Number | no | Total discount applied |
| taxRate | Number | no | Applicable tax percentage (e.g., GST) |
| taxAmount | Number | no | Calculated tax amount |
| total | Number | yes | Net invoice total |
| paymentStatus | String | yes | PAID, UNPAID, PARTIAL |
| paymentId | ObjectId | no | Ref: payments |
| pdfUrl | String | no | Stored PDF URL |
| companyDetails | Object | yes | {name, address, gstin, phone, email} |
| customerDetails | Object | yes | {name, address, phone, email} |
| vehicleDetails | Object | no | {registrationNumber, brand, model} |
| issuedDate | Date | yes | Date of invoice issue |
| dueDate | Date | no | Due date for payment |
| createdAt | Date | auto | Creation timestamp |
| updatedAt | Date | auto | Update timestamp |

**Indexes:** invoiceNumber (unique), customerId, bookingId, createdAt  
**Important:** Invoice numbers must be sequential and unique. Customers cannot modify invoice amounts.

---

### 11. notifications
**Purpose:** In-app notification records

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| _id | ObjectId | auto | Primary key |
| userId | ObjectId | yes | Ref: users |
| title | String | yes | Notification title |
| body | String | yes | Notification body |
| type | String | yes | BOOKING, EMERGENCY, PAYMENT, ORDER, SYSTEM |
| referenceId | ObjectId | no | Related entity ID |
| referenceType | String | no | bookings, emergency_requests, orders, etc. |
| isRead | Boolean | yes | Read status |
| data | Object | no | Additional data for deep linking |
| createdAt | Date | auto | Creation timestamp |

**Indexes:** userId, isRead, type, createdAt  
**TTL Index:** Consider TTL on old notifications (e.g., 90 days on `createdAt`)

---

### 12. products (Spare Parts)
**Purpose:** Spare parts catalog

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| _id | ObjectId | auto | Primary key |
| categoryId | ObjectId | yes | Ref: product_categories |
| name | String | yes | Product name |
| description | String | yes | Detailed product description |
| brand | String | no | Manufacturer / brand |
| sku | String | yes | Stock keeping unit |
| price | Number | yes | Base retail price |
| discountedPrice | Number | no | Sale / discounted price |
| stock | Number | yes | Available quantity |
| images | Array<String> | no | Product image URLs |
| specifications | Object | no | Key-value specs |
| compatibleVehicles | Array | no | [{brand, model, year}] |
| isActive | Boolean | yes | Active catalog item flag |
| createdAt | Date | auto | Creation timestamp |
| updatedAt | Date | auto | Update timestamp |

**Indexes:** sku (unique), categoryId, name (text), isActive  
**Important:** Stock must never go negative. Decrements must be handled via atomic operators (`$inc` with `$gte` condition).

---

### 13. orders (Spare Parts Orders)
**Purpose:** Spare parts purchase orders

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| _id | ObjectId | auto | Primary key |
| orderNumber | String | yes | Unique order ID |
| customerId | ObjectId | yes | Ref: users |
| items | Array | yes | [{productId, name, quantity, price, amount}] |
| shippingAddress | Object | yes | Address snapshot |
| subtotal | Number | yes | Item subtotal |
| discount | Number | no | Order discount |
| shippingCharge | Number | no | Delivery fee |
| tax | Number | no | Tax amount |
| total | Number | yes | Total amount payable |
| status | String | yes | PENDING, CONFIRMED, PROCESSING, SHIPPED, OUT_FOR_DELIVERY, DELIVERED, CANCELLED, RETURN_REQUESTED, RETURNED, REFUNDED |
| trackingNumber | String | no | Shipment courier tracking ID |
| paymentId | ObjectId | no | Ref: payments |
| invoiceId | ObjectId | no | Ref: invoices |
| statusHistory | Array | no | [{status, timestamp, updatedBy}] |
| createdAt | Date | auto | Creation timestamp |
| updatedAt | Date | auto | Update timestamp |

**Indexes:** orderNumber (unique), customerId, status, createdAt  
**Relationships:** customerId → users._id, paymentId → payments._id, invoiceId → invoices._id

---

### 14. car_listings (Used Cars)
**Purpose:** Used car marketplace listings

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| _id | ObjectId | auto | Primary key |
| sellerId | ObjectId | yes | Ref: users |
| title | String | yes | Listing title |
| brand | String | yes | Vehicle brand |
| model | String | yes | Vehicle model |
| variant | String | no | Trim / Variant |
| year | Number | yes | Manufacturing year |
| fuelType | String | yes | PETROL, DIESEL, CNG, ELECTRIC, HYBRID |
| transmission | String | no | MANUAL, AUTOMATIC |
| mileage | Number | no | Kilometers driven |
| price | Number | yes | Asking price |
| description | String | yes | Vehicle condition description |
| images | Array<String> | yes | Photos of the car |
| location | Object | no | {city, state} |
| status | String | yes | DRAFT, PENDING_REVIEW, APPROVED, PUBLISHED, SOLD, REJECTED, EXPIRED |
| inspectionId | ObjectId | no | Ref: inspections |
| rejectionReason | String | no | Reason if rejected by admin |
| createdAt | Date | auto | Creation timestamp |
| updatedAt | Date | auto | Update timestamp |

**Indexes:** sellerId, status, brand, model, year, price, createdAt  
**Relationships:** sellerId → users._id, inspectionId → inspections._id

---

### 15. inspections
**Purpose:** Car inspection records

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| _id | ObjectId | auto | Primary key |
| requestNumber | String | yes | Unique inspection request number |
| customerId | ObjectId | yes | Ref: users |
| carListingId | ObjectId | no | Ref: car_listings |
| inspectorId | ObjectId | no | Ref: users (INSPECTOR role) |
| vehicleDetails | Object | yes | Snapshot of vehicle info |
| status | String | yes | REQUESTED, ASSIGNED, SCHEDULED, IN_PROGRESS, COMPLETED, CANCELLED |
| scheduledDate | Date | no | Scheduled inspection date/time |
| checklist | Array | no | [{category, item, status, notes, photos}] |
| overallRating | String | no | EXCELLENT, GOOD, FAIR, POOR |
| summary | String | no | Comprehensive inspection remarks |
| photos | Array<String> | no | Inspection audit photographs |
| reportPdfUrl | String | no | Link to generated PDF certificate |
| createdAt | Date | auto | Creation timestamp |
| updatedAt | Date | auto | Update timestamp |

**Indexes:** requestNumber (unique), customerId, inspectorId, carListingId, status  
**Relationships:** customerId → users._id, carListingId → car_listings._id, inspectorId → users._id

---

### 16. reviews
**Purpose:** Ratings and reviews

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| _id | ObjectId | auto | Primary key |
| customerId | ObjectId | yes | Ref: users |
| mechanicId | ObjectId | no | Ref: users |
| bookingId | ObjectId | no | Ref: bookings |
| emergencyRequestId | ObjectId | no | Ref: emergency_requests |
| rating | Number | yes | 1-5 integer/float scale |
| comment | String | no | Detailed customer feedback |
| createdAt | Date | auto | Creation timestamp |

**Indexes:** customerId, mechanicId, bookingId, rating  
**Constraint:** One review per booking/emergency per customer

---

### 17. coupons
**Purpose:** Discount coupons

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| _id | ObjectId | auto | Primary key |
| code | String | yes | Unique coupon code (uppercase) |
| type | String | yes | PERCENTAGE, FIXED |
| value | Number | yes | Discount value |
| maxDiscount | Number | no | Max discount cap |
| minOrderValue | Number | no | Minimum order requirement |
| usageLimit | Number | no | Total uses allowed globally |
| usedCount | Number | yes | Current usage count |
| perUserLimit | Number | no | Maximum uses per user |
| validFrom | Date | yes | Start of validity window |
| validTo | Date | yes | End of validity window |
| applicableServices | Array<ObjectId> | no | Refs: services (if restricted) |
| isActive | Boolean | yes | Active flag |
| createdAt | Date | auto | Creation timestamp |

**Indexes:** code (unique), isActive, validFrom, validTo

---

### 18. feature_flags
**Purpose:** Remote feature toggles

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| _id | ObjectId | auto | Primary key |
| key | String | yes | Feature key (e.g., carService) |
| enabled | Boolean | yes | On/off state |
| description | String | no | Feature description |
| userMessage | String | no | Message displayed when disabled |
| startDate | Date | no | Scheduled activation start |
| endDate | Date | no | Scheduled activation end |
| version | Number | yes | Config version |
| updatedBy | ObjectId | no | Ref: users (admin) |
| createdAt | Date | auto | Creation timestamp |
| updatedAt | Date | auto | Update timestamp |

**Indexes:** key (unique)

---

### 19. app_config
**Purpose:** Remote app configuration

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| _id | ObjectId | auto | Primary key |
| key | String | yes | Config key |
| value | Mixed | yes | Config value (scalar or object) |
| type | String | yes | STRING, NUMBER, BOOLEAN, JSON |
| description | String | no | Configuration description |
| version | Number | yes | Version counter |
| updatedBy | ObjectId | no | Ref: users (admin) |
| createdAt | Date | auto | Creation timestamp |
| updatedAt | Date | auto | Update timestamp |

**Indexes:** key (unique)

---

### 20. cms_components
**Purpose:** CMS layout components for customer app

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| _id | ObjectId | auto | Primary key |
| componentType | String | yes | HERO_BANNER, EMERGENCY_BUTTON, SERVICE_CARD, etc. |
| title | String | no | Component headline |
| subtitle | String | no | Supporting subtitle |
| imageUrl | String | no | Asset/graphic URL |
| ctaText | String | no | Call-to-action label |
| ctaDestination | String | no | Target screen / deep link URL |
| sortOrder | Number | yes | Ordering index |
| isActive | Boolean | yes | Component visibility flag |
| startDate | Date | no | Scheduling start |
| endDate | Date | no | Scheduling end |
| config | Object | no | Component-specific config payload |
| version | Number | yes | Version counter |
| updatedBy | ObjectId | no | Ref: users (admin) |
| createdAt | Date | auto | Creation timestamp |
| updatedAt | Date | auto | Update timestamp |

**Indexes:** componentType, sortOrder, isActive

---

### 21. service_areas
**Purpose:** Geographic service coverage areas

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| _id | ObjectId | auto | Primary key |
| name | String | yes | Area name |
| city | String | yes | Operating city |
| state | String | yes | Operating state |
| pincode | String | no | Postal code |
| boundaries | Object | no | GeoJSON polygon coordinates |
| isActive | Boolean | yes | Operational status flag |
| createdAt | Date | auto | Creation timestamp |
| updatedAt | Date | auto | Update timestamp |

**Indexes:** name, city, isActive, boundaries (2dsphere if GeoJSON polygon)

---

### 22. audit_logs
**Purpose:** Record all sensitive admin actions

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| _id | ObjectId | auto | Primary key |
| userId | ObjectId | yes | Who performed action |
| action | String | yes | CREATE, UPDATE, DELETE, APPROVE, REJECT, etc. |
| resource | String | yes | users, services, bookings, etc. |
| resourceId | ObjectId | no | Affected entity ID |
| details | Object | no | Detailed change payload / diff |
| ipAddress | String | no | Client IP address |
| userAgent | String | no | Browser / Client User-Agent |
| createdAt | Date | auto | Timestamp of action |

**Indexes:** userId, action, resource, createdAt  
**Note:** Audit logs should never be deleted. Consider archiving strategy for old logs.

---

## Relationships Diagram
```
users ──┬── vehicles
        ├── addresses
        ├── mechanics (1:1)
        ├── bookings (as customer)
        ├── bookings (as mechanic)
        ├── emergency_requests (as customer)
        ├── emergency_requests (as provider)
        ├── payments
        ├── invoices
        ├── notifications
        ├── orders
        ├── car_listings (as seller)
        ├── inspections (as inspector)
        ├── reviews
        └── audit_logs

service_categories ── services ── bookings

bookings ──┬── payments
           ├── invoices
           └── reviews

emergency_requests ──┬── payments
                     ├── invoices
                     └── reviews

products ── orders ──┬── payments
                     └── invoices

car_listings ── inspections
```

---

## Design Principles
1. **No unbounded arrays** — `statusHistory` is bounded by finite state transitions; arrays like `refreshTokens` are capped and cleaned up during session expiry.
2. **Reference by ObjectId** — Normalizing relational links across users, bookings, emergency requests, payments, and invoices rather than embedding entire mutable documents.
3. **Timestamps on all collections** — Standardizing `createdAt` and `updatedAt` on all documents for tracking and sorting.
4. **Soft deletes** — Utilizing `isActive` flags instead of hard delete for core transactional and entity records.
5. **Unique constraints** — Enforcing uniqueness at the database level on email, phone, booking numbers, invoice numbers, SKUs, and coupons.
6. **Indexes** — Applying compound, unique, sparse, text, and 2dsphere indexes on foreign keys and geospatial/query fields.
7. **No plaintext secrets** — Passwords bcrypt-hashed with salt rounds; sensitive tokens hashed or masked.
