# AUTO PRO — API PLAN

## Base URL
```
/api/v1/
```

## Standard Response Format
```json
{
  "success": true,
  "data": {},
  "message": "Operation successful",
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 100,
    "totalPages": 5
  }
}
```

## Error Response Format
```json
{
  "success": false,
  "message": "Error description",
  "error": {
    "code": "VALIDATION_ERROR",
    "details": []
  }
}
```

## Authentication
- Bearer token in Authorization header
- `Authorization: Bearer <access_token>`
- Refresh token sent as httpOnly cookie or in body

---

## API Endpoints

### Health
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | /api/v1/health | No | Service health check |

### Authentication
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | /api/v1/auth/register | No | Customer registration |
| POST | /api/v1/auth/login | No | Login (all roles) |
| POST | /api/v1/auth/refresh | No | Refresh access token |
| POST | /api/v1/auth/logout | Yes | Logout (invalidate token) |
| POST | /api/v1/auth/forgot-password | No | Request password reset |
| POST | /api/v1/auth/reset-password | No | Reset password |
| POST | /api/v1/auth/verify-otp | No | OTP verification |
| POST | /api/v1/auth/send-otp | No | Send OTP |

### Users / Profile
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | /api/v1/users/me | Yes | Get current user profile |
| PUT | /api/v1/users/me | Yes | Update profile |
| PUT | /api/v1/users/me/avatar | Yes | Upload avatar |
| DELETE | /api/v1/users/me | Yes | Deactivate account |

### Vehicles
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | /api/v1/vehicles | Yes | List user's vehicles |
| POST | /api/v1/vehicles | Yes | Add vehicle |
| GET | /api/v1/vehicles/:id | Yes | Get vehicle details |
| PUT | /api/v1/vehicles/:id | Yes | Update vehicle |
| DELETE | /api/v1/vehicles/:id | Yes | Remove vehicle |

### Addresses
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | /api/v1/addresses | Yes | List user's addresses |
| POST | /api/v1/addresses | Yes | Add address |
| GET | /api/v1/addresses/:id | Yes | Get address |
| PUT | /api/v1/addresses/:id | Yes | Update address |
| DELETE | /api/v1/addresses/:id | Yes | Remove address |

### Services
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | /api/v1/services | No | List services |
| GET | /api/v1/services/:id | No | Service details |
| GET | /api/v1/services/categories | No | List categories |
| POST | /api/v1/admin/services | Admin | Create service |
| PUT | /api/v1/admin/services/:id | Admin | Update service |
| DELETE | /api/v1/admin/services/:id | Admin | Deactivate service |

### Bookings
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | /api/v1/bookings | Customer | Create booking |
| GET | /api/v1/bookings | Yes | List user's bookings |
| GET | /api/v1/bookings/:id | Yes | Booking details |
| PUT | /api/v1/bookings/:id/cancel | Customer | Cancel booking |
| PUT | /api/v1/bookings/:id/status | Mechanic/Admin | Update booking status |
| GET | /api/v1/mechanic/bookings | Mechanic | Mechanic's assigned bookings |
| PUT | /api/v1/mechanic/bookings/:id/accept | Mechanic | Accept booking |
| PUT | /api/v1/mechanic/bookings/:id/reject | Mechanic | Reject booking |

### Emergency Assistance
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | /api/v1/emergency | Customer | Create emergency request |
| GET | /api/v1/emergency | Yes | List emergency requests |
| GET | /api/v1/emergency/:id | Yes | Emergency request details |
| PUT | /api/v1/emergency/:id/cancel | Customer | Cancel emergency |
| PUT | /api/v1/emergency/:id/status | Provider/Admin | Update status |
| GET | /api/v1/emergency/types | No | List emergency types |

### Mechanics
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | /api/v1/mechanics/register | No | Mechanic registration |
| GET | /api/v1/mechanics/me | Mechanic | Get mechanic profile |
| PUT | /api/v1/mechanics/me | Mechanic | Update profile |
| PUT | /api/v1/mechanics/me/availability | Mechanic | Toggle availability |
| PUT | /api/v1/mechanics/me/online | Mechanic | Toggle online status |
| PUT | /api/v1/mechanics/me/location | Mechanic | Update location |
| GET | /api/v1/mechanics/me/earnings | Mechanic | View earnings |
| GET | /api/v1/mechanics/me/jobs | Mechanic | Job history |

### Payments
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | /api/v1/payments/create-order | Yes | Create Razorpay order |
| POST | /api/v1/payments/verify | Yes | Verify payment |
| POST | /api/v1/payments/webhook | No* | Razorpay webhook (*signature verified) |
| GET | /api/v1/payments | Yes | Payment history |
| GET | /api/v1/payments/:id | Yes | Payment details |
| POST | /api/v1/admin/payments/:id/refund | Admin | Process refund |

### Invoices
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | /api/v1/invoices | Yes | List invoices |
| GET | /api/v1/invoices/:id | Yes | Invoice details |
| GET | /api/v1/invoices/:id/pdf | Yes | Download PDF |

### Notifications
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | /api/v1/notifications | Yes | List notifications |
| PUT | /api/v1/notifications/:id/read | Yes | Mark as read |
| PUT | /api/v1/notifications/read-all | Yes | Mark all as read |
| DELETE | /api/v1/notifications/:id | Yes | Delete notification |
| PUT | /api/v1/notifications/device-token | Yes | Register FCM token |

### Spare Parts
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | /api/v1/products | No | List products |
| GET | /api/v1/products/:id | No | Product details |
| GET | /api/v1/products/categories | No | Product categories |
| GET | /api/v1/products/search | No | Search products |
| GET | /api/v1/cart | Customer | View cart |
| POST | /api/v1/cart | Customer | Add to cart |
| PUT | /api/v1/cart/:itemId | Customer | Update cart item |
| DELETE | /api/v1/cart/:itemId | Customer | Remove from cart |
| POST | /api/v1/orders | Customer | Place order |
| GET | /api/v1/orders | Yes | List orders |
| GET | /api/v1/orders/:id | Yes | Order details |
| PUT | /api/v1/orders/:id/cancel | Customer | Cancel order |

### Used Cars
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | /api/v1/cars | No | List car listings |
| GET | /api/v1/cars/:id | No | Listing details |
| POST | /api/v1/cars | Customer | Create listing |
| PUT | /api/v1/cars/:id | Customer | Update listing |
| DELETE | /api/v1/cars/:id | Customer | Remove listing |
| GET | /api/v1/cars/search | No | Search cars |

### Inspections
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | /api/v1/inspections | Customer | Request inspection |
| GET | /api/v1/inspections | Yes | List inspections |
| GET | /api/v1/inspections/:id | Yes | Inspection details |
| GET | /api/v1/inspections/:id/report | Yes | Download report PDF |
| PUT | /api/v1/inspector/inspections/:id | Inspector | Update inspection |

### Reviews
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | /api/v1/reviews | Customer | Create review |
| GET | /api/v1/reviews | No | List reviews |
| GET | /api/v1/reviews/mechanic/:id | No | Mechanic reviews |

### Coupons
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | /api/v1/coupons/validate | Customer | Validate coupon |
| POST | /api/v1/admin/coupons | Admin | Create coupon |
| GET | /api/v1/admin/coupons | Admin | List coupons |
| PUT | /api/v1/admin/coupons/:id | Admin | Update coupon |

### Admin
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | /api/v1/admin/dashboard | Admin | Dashboard metrics |
| GET | /api/v1/admin/users | Admin | List users |
| GET | /api/v1/admin/users/:id | Admin | User details |
| PUT | /api/v1/admin/users/:id | Admin | Update user |
| GET | /api/v1/admin/mechanics | Admin | List mechanics |
| PUT | /api/v1/admin/mechanics/:id/approve | Admin | Approve mechanic |
| PUT | /api/v1/admin/mechanics/:id/reject | Admin | Reject mechanic |
| PUT | /api/v1/admin/mechanics/:id/suspend | Admin | Suspend mechanic |
| GET | /api/v1/admin/bookings | Admin | List all bookings |
| GET | /api/v1/admin/emergency | Admin | List all emergencies |
| GET | /api/v1/admin/payments | Admin | List all payments |
| GET | /api/v1/admin/invoices | Admin | List all invoices |
| GET | /api/v1/admin/orders | Admin | List all orders |
| GET | /api/v1/admin/cars | Admin | List all car listings |
| PUT | /api/v1/admin/cars/:id/approve | Admin | Approve car listing |
| PUT | /api/v1/admin/cars/:id/reject | Admin | Reject car listing |
| GET | /api/v1/admin/audit-logs | SuperAdmin | List audit logs |

### Feature Flags
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | /api/v1/config/features | No | Get active feature flags |
| GET | /api/v1/admin/features | Admin | List all feature flags |
| PUT | /api/v1/admin/features/:id | SuperAdmin | Update feature flag |

### App Config
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | /api/v1/config/app | No | Get app configuration |
| GET | /api/v1/admin/config | Admin | List all config |
| PUT | /api/v1/admin/config/:id | SuperAdmin | Update config |

### CMS
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | /api/v1/cms/components | No | Get active CMS components |
| GET | /api/v1/admin/cms | Admin | List all CMS components |
| POST | /api/v1/admin/cms | Admin | Create component |
| PUT | /api/v1/admin/cms/:id | Admin | Update component |
| DELETE | /api/v1/admin/cms/:id | Admin | Remove component |

### Service Areas
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | /api/v1/service-areas | No | List active service areas |
| POST | /api/v1/admin/service-areas | Admin | Create service area |
| PUT | /api/v1/admin/service-areas/:id | Admin | Update service area |

### Location / Maps
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | /api/v1/location/geocode | Yes | Geocode address |
| POST | /api/v1/location/reverse-geocode | Yes | Reverse geocode coordinates |
| GET | /api/v1/location/check-service-area | Yes | Check if location is in service area |
| GET | /api/v1/tracking/:jobId | Yes | Get live tracking data |

### Support
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | /api/v1/support | Yes | Create support ticket |
| GET | /api/v1/support | Yes | List user's tickets |
| GET | /api/v1/support/:id | Yes | Ticket details |
| GET | /api/v1/admin/support | Admin | List all tickets |
| PUT | /api/v1/admin/support/:id | Admin | Update ticket |

---

## Rate Limiting
- **Auth endpoints:** 5 requests per minute
- **General API:** 100 requests per minute
- **File upload:** 10 requests per minute
- **Webhook endpoints:** No rate limit (signature verified)

## Pagination
- **Default page size:** 20
- **Max page size:** 100
- **Query params:** `?page=1&limit=20&sort=createdAt&order=desc`

## Filtering
- **Query params:** `?status=ACTIVE&role=CUSTOMER`
- **Date range:** `?startDate=2026-01-01&endDate=2026-12-31`
- **Search:** `?search=keyword`

## Versioning
- **URL-based:** `/api/v1/`, `/api/v2/`
- **Current version:** `v1`
